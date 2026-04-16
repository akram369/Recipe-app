require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'MISSING');

async function test() {
  try {
    const list = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
    const json = await list.json();
    console.log(json.models.map(m => m.name).join(', '));
  } catch (e) {
    console.error(e);
  }
}

test();
