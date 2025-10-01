import request from "supertest";
import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { AppModule } from "../app.module";

describe("Analytics (e2e-ish)", () => {
    let app: INestApplication;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleRef.createNestApplication();
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    it("GET /analytics/spend-by-category returns 200", async () => {
        const res = await request(app.getHttpServer())
            .get("/analytics/spend-by-category")
            .set("x-user-email", "test@example.com")
            .expect(200);

        expect(Array.isArray(res.body)).toBe(true);
    });

    it("GET /analytics/monthly-trend returns 200", async () => {
        const res = await request(app.getHttpServer())
            .get("/analytics/monthly-trend?year=2025")
            .set("x-user-email", "test@example.com")
            .expect(200);

        expect(Array.isArray(res.body)).toBe(true);
    });
});