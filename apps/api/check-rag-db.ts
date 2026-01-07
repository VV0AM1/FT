import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import * as fs from 'fs';
import * as path from 'path';

async function main() {
    console.log("--- Testing Embedding Generation (No DotEnv) ---");

    // Manual .env parsing
    const envPath = path.resolve(process.cwd(), '.env');
    let apiKey = '';
    if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf8');
        const match = content.match(/GEMINI_API_KEY=(.*)/);
        if (match && match[1]) {
            apiKey = match[1].replace(/"/g, '').trim();
        }
    }

    if (!apiKey) {
        console.error("❌ GEMINI_API_KEY not found in .env");
        return;
    }

    console.log(`API Key found (starts with): ${apiKey.substring(0, 5)}...`);

    try {
        const embeddings = new GoogleGenerativeAIEmbeddings({
            apiKey: apiKey,
            model: "models/text-embedding-004",
        });

        console.log("Generating embedding for 'Hello World'...");
        const vec = await embeddings.embedQuery("Hello World");

        console.log(`✅ Embedding generated! Length: ${vec.length}`);
        console.log(`Sample: [${vec[0]}, ${vec[1]}...]`);

    } catch (e: any) {
        console.error('❌ Error generating embedding:', e);
        if (e.message) console.error(e.message);
    }
}

main();
