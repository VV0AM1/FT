
require('dotenv').config();

async function list() {
    const key = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;

    console.log(`Fetching models from ${url}...`);
    try {
        const resp = await fetch(url);
        const data = await resp.json();

        if (data.models) {
            console.log('✅ Fetched models. Writing to models.json...');
            const fs = require('fs');
            fs.writeFileSync('C:/Users/akimo/finly/FT/apps/api/models.json', JSON.stringify(data, null, 2));
        } else {
            console.log('❌ No models found or error:', JSON.stringify(data));
        }
    } catch (e) {
        console.error('❌ Error:', e);
    }
}

list();
