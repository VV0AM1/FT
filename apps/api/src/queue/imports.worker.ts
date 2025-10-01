import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { PrismaClient, ImportStatus, Rule } from "@prisma/client";
import { parse as csvParse } from "fast-csv";
import ExcelJS from "exceljs";
import { createHash } from "crypto";
import { Readable } from "node:stream";
import IORedis from "ioredis";

const prisma = new PrismaClient();
const s3 = new S3Client({
    region: process.env.S3_REGION ?? "us-east-1",
    endpoint: process.env.S3_ENDPOINT,
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "true",
    credentials: { accessKeyId: "test", secretAccessKey: "test" },
});

function sha256(s: string) {
    return createHash("sha256").update(s).digest("hex");
}

function toAmount(raw: string): number {
    if (!raw) return 0;
    const r = raw.trim();
    const hasComma = r.includes(",");
    const hasDot = r.includes(".");
    if (hasComma && hasDot) {
        const lastComma = r.lastIndexOf(",");
        const lastDot = r.lastIndexOf(".");
        const decSep = lastComma > lastDot ? "," : ".";
        const thousands = decSep === "," ? /\./g : /,/g;
        return parseFloat(r.replace(thousands, "").replace(decSep, "."));
    }
    if (hasComma && !hasDot) return parseFloat(r.replace(".", "").replace(",", "."));
    return parseFloat(r);
}

function toDate(raw: string): Date | null {
    if (!raw) return null;
    const d1 = new Date(raw);
    if (!isNaN(+d1)) return d1;
    const m = raw.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})$/);
    if (m) {
        const a = parseInt(m[1], 10), b = parseInt(m[2], 10), y = parseInt(m[3].length === 2 ? "20" + m[3] : m[3], 10);
        const monthFirst = a <= 12 && (b > 12 ? true : false) ? true : false;
        const mm = monthFirst ? a : b;
        const dd = monthFirst ? b : a;
        return new Date(Date.UTC(y, mm - 1, dd));
    }
    return null;
}

function detectCols(headers: string[]) {
    const H = headers.map(h => h.toLowerCase().trim());
    const idx = (names: string[]) => H.findIndex(h => names.includes(h));
    return {
        date: idx(["date", "fecha", "posted", "transaction date"]),
        desc: idx(["description", "desc", "concepto", "narrative", "memo", "details"]),
        amount: idx(["amount", "importe", "value", "debit/credit", "transaction amount"]),
        debit: idx(["debit", "withdrawal", "out"]),
        credit: idx(["credit", "deposit", "in"]),
        balance: idx(["balance", "running balance"]),
    };
}

function applyRules(desc: string, rules: Rule[]): string | undefined {
    const text = (desc || "").toLowerCase();

    for (const r of rules) {
        if (!r.active) continue;

        if (r.isRegex) {
            try {
                if (new RegExp(r.contains, "i").test(desc || "")) {
                    return r.categoryId;
                }
            } catch {
            }
        } else {
            if (text.includes(r.contains.toLowerCase())) {
                return r.categoryId;
            }
        }
    }

    return undefined;
}

async function parseCsv(stream: Readable) {
    const rows: Record<string, string>[] = [];
    await new Promise<void>((resolve, reject) => {
        const parser = csvParse({ headers: true, trim: true })
            .on("error", reject)
            .on("data", (r: any) => rows.push(r))
            .on("end", () => resolve());
        stream.pipe(parser);
    });
    return rows;
}

async function parseXlsx(buffer: Uint8Array | Buffer) {
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(buffer as any);
    const ws = wb.worksheets[0];
    const headers: string[] = [];
    const rows: Record<string, string>[] = [];
    ws.getRow(1).eachCell((cell, col) => (headers[col - 1] = String(cell.value ?? "").trim()));
    ws.eachRow((row, i) => {
        if (i === 1) return;
        const obj: Record<string, string> = {};
        headers.forEach((h, col) => (obj[h] = String(row.getCell(col + 1).value ?? "").trim()));
        rows.push(obj);
    });
    return rows;
}

async function bodyToUint8Array(stream: Readable): Promise<Uint8Array> {
    const chunks: Buffer[] = [];
    for await (const c of stream) {
        chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c));
    }
    return Buffer.concat(chunks);
}

export async function processImport(data: { importFileId: string; bucket?: string; key?: string; userId: string; accountId?: string }) {
    const importFile = await prisma.importFile.findUnique({ where: { id: data.importFileId } });
    if (!importFile) return;

    const bucket = data.bucket ?? (process.env.S3_BUCKET as string);
    const key = data.key ?? (importFile as any).key;
    const res = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
    const body = res.Body as Readable;
    const bin = await bodyToUint8Array(body);


    const isXlsx =
        importFile.contentType?.includes("spreadsheet") ||
        importFile.filename.toLowerCase().endsWith(".xlsx");

    const rows = isXlsx
        ? await parseXlsx(bin)
        : await parseCsv(Readable.from(bin));

    if (!rows.length) {
        await prisma.importFile.update({ where: { id: importFile.id }, data: { status: ImportStatus.FAILED, processedAt: new Date() } });
        return;
    }

    const headers = Object.keys(rows[0]);
    const cols = detectCols(headers);
    if (cols.amount < 0 && !(cols.debit >= 0 && cols.credit >= 0)) {
        await prisma.importFile.update({ where: { id: importFile.id }, data: { status: ImportStatus.FAILED, processedAt: new Date() } });
        return;
    }

    const redis = new IORedis(process.env.REDIS_URL ?? "redis://localhost:6379", {
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
    });

    const pattern = `analytics:${importFile.userId}:*`;
    let cursor = "0";
    do {
        const [next, keys] = await redis.scan(cursor, "MATCH", pattern, "COUNT", 100);
        cursor = next;
        if (keys.length) await redis.del(...keys);
    } while (cursor !== "0");

    redis.disconnect();

    const rules = await prisma.rule.findMany({
        where: { userId: importFile.userId, active: true },
        orderBy: [{ priority: "asc" }, { createdAt: "asc" }],
    });

    const account = await (async () => {
        if (data.accountId) return prisma.account.findUnique({ where: { id: data.accountId } });
        const existing = await prisma.account.findFirst({ where: { userId: importFile.userId }, orderBy: { createdAt: "asc" } });
        return existing ?? prisma.account.create({ data: { userId: importFile.userId, name: "Imported", type: "OTHER", balance: 0 } });
    })();

    type N = { userId: string; accountId: string; date: Date; description: string; amount: number; balanceAfter?: number | null; hash: string; importFileId: string; categoryId?: string | null };
    const normalized: N[] = [];

    for (const r of rows) {
        const rawDate = cols.date >= 0 ? String(Object.values(r)[cols.date]) : String(r["date"] ?? r["Date"] ?? "");
        const rawDesc = cols.desc >= 0 ? String(Object.values(r)[cols.desc]) : String(r["description"] ?? r["Description"] ?? "");
        let amount = 0;
        if (cols.amount >= 0) {
            amount = toAmount(String(Object.values(r)[cols.amount]));
        } else {
            const debit = cols.debit >= 0 ? toAmount(String(Object.values(r)[cols.debit])) : 0;
            const credit = cols.credit >= 0 ? toAmount(String(Object.values(r)[cols.credit])) : 0;
            amount = credit !== 0 ? credit : (debit !== 0 ? -Math.abs(debit) : 0);
        }
        const bal = cols.balance >= 0 ? toAmount(String(Object.values(r)[cols.balance])) : undefined;
        const date = toDate(rawDate) ?? new Date();

        const desc = rawDesc?.trim() || "";
        const hash = sha256(`${date.toISOString().slice(0, 10)}|${amount.toFixed(2)}|${desc}|${account!.id}`);
        const catId = applyRules(desc, rules);

        normalized.push({
            userId: importFile.userId,
            accountId: account!.id,
            date,
            description: desc,
            amount,
            balanceAfter: Number.isFinite(bal as number) ? (bal as number) : null,
            hash,
            importFileId: importFile.id,
            categoryId: catId ?? null,
        });
    }

    const toCreate = normalized.map(n => ({
        userId: n.userId,
        accountId: n.accountId,
        date: n.date,
        description: n.description,
        amount: n.amount,
        balanceAfter: n.balanceAfter ?? undefined,
        importFileId: n.importFileId,
        categoryId: n.categoryId ?? undefined,
        hash: n.hash,
    }));

    let inserted = 0;
    if (toCreate.length) {
        const resCreate = await prisma.transaction.createMany({
            data: toCreate,
            skipDuplicates: true,
        });
        inserted = resCreate.count;
    }

    const updated = 0;
    const skipped = normalized.length - inserted;

    const totals = await prisma.transaction.groupBy({
        by: ["categoryId"],
        where: { importFileId: importFile.id },
        _sum: { amount: true },
        _count: { _all: true },
    });

    await prisma.importFile.update({
        where: { id: importFile.id },
        data: {
            status: ImportStatus.PROCESSED,
            processedAt: new Date(),
            inserted,
            updated,
            skipped,
            totals,
        },
    });
}

async function bodyToBuffer(stream: Readable): Promise<Buffer> {
    const chunks: Buffer[] = [];
    for await (const c of stream) chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c));
    return Buffer.concat(chunks);
}