
require('dotenv').config();
const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
const { HumanMessage } = require("@langchain/core/messages");

async function testChat() {
    const key = process.env.GEMINI_API_KEY;
    console.log('Testing Chat with gemini-2.0-flash...');

    try {
        const chat = new ChatGoogleGenerativeAI({
            apiKey: key,
            model: "gemini-2.0-flash-001",
            maxOutputTokens: 100,
        });
        const res = await chat.invoke([new HumanMessage("Hello, can you hear me?")]);
        console.log(`✅ Chat Success! Response: ${res.content}`);
    } catch (error) {
        console.log(`❌ Chat FAILED`);
        console.error(error);
    }
}

testChat();
