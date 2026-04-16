require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');
const { GoogleGenerativeAI, SchemaType } = require('@google/generative-ai');

const app = express();
app.use(cors({
  origin: "*"
}));
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'MISSING_API_KEY');

const MASTER_PROMPT = `You are an AI-powered recipe extraction and intelligence engine operating under real-world API constraints.
Your goal is to convert messy, unstructured recipe content into a complete, structured, and useful recipe dataset in a SINGLE LLM call.

SYSTEM CONTEXT:
* You are running in a resource-constrained environment (free-tier API limits).
* You must perform ALL tasks in one response.
* You must prioritize correctness, completeness, and efficiency.

INPUT:
You will receive cleaned text extracted from a recipe webpage or video subtitles.
The text may include irrelevant storytelling, ads, incomplete structure, and noisy formatting.

CORE OBJECTIVE:
Transform this unstructured content into structured recipe intelligence.

TASKS (DO ALL IN ONE PASS):
1. EXTRACT CORE DATA
2. EXTRACT INGREDIENTS
3. EXTRACT INSTRUCTIONS
4. GENERATE NUTRITION (APPROXIMATE)
5. GENERATE SMART SUBSTITUTIONS (3)
6. GENERATE SHOPPING LIST
7. GENERATE RELATED RECIPES (3)

STRICT RULES:
* DO NOT hallucinate core recipe data
* DO NOT invent ingredients or steps
* If data is missing → return null or empty
* You MAY estimate nutrition and suggestions
* ALWAYS return usable output if partial data exists
* NEVER return empty arrays if valid data is present

FAIL-SAFE BEHAVIOR:
If input is weak or incomplete:
* Prioritize extracting ingredients and instructions
* Return partial structured output instead of failing
`;

const PLANNER_PROMPT = `You are a professional chef and logistics expert.
Your goal is to take multiple recipe datasets and consolidate them into a single, high-efficiency Meal Plan.

CORE TASKS:
1. CONSOLIDATED SHOPPING LIST: Combine all ingredients. Group by category (Produce, Dairy, etc.). Sum up quantities where possible (e.g., 2 onions + 1 onion = 3 onions).
2. SMART PREP STRATEGY: Create a chronological guide on how to prepare these meals efficiently. Identify shared prep (e.g., "Chop all onions at once").
3. COOKING SCHEDULE: Suggest the best order to cook these for the week.

Output MUST be JSON.
`;

const recipeSchema = {
  type: SchemaType.OBJECT,
  properties: {
    title: { type: SchemaType.STRING },
    cuisine: { type: SchemaType.STRING },
    prep_time: { type: SchemaType.STRING },
    cook_time: { type: SchemaType.STRING },
    total_time: { type: SchemaType.STRING },
    servings: { type: SchemaType.INTEGER },
    difficulty: { type: SchemaType.STRING },
    ingredients: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          quantity: { type: SchemaType.STRING },
          unit: { type: SchemaType.STRING },
          item: { type: SchemaType.STRING }
        }
      }
    },
    instructions: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    nutrition_estimate: {
      type: SchemaType.OBJECT,
      properties: {
        calories: { type: SchemaType.NUMBER },
        protein: { type: SchemaType.STRING },
        carbs: { type: SchemaType.STRING },
        fat: { type: SchemaType.STRING },
        per: { type: SchemaType.STRING }
      }
    },
    suggestions: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    shopping: {
      type: SchemaType.OBJECT,
      properties: {
        dairy: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
        produce: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
        pantry: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
        protein: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
        spices: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
        others: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } }
      }
    },
    related: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } }
  },
  required: ["title", "ingredients", "instructions"]
};

async function callGeminiWithRetry(prompt, systemInstruction, schema, attempt = 1) {
  const models = ['gemini-2.5-flash-lite', 'gemini-1.5-flash-8b']; // Fallback list
  const selectedModel = attempt > 2 ? models[1] : models[0];

  try {
    const model = genAI.getGenerativeModel({
      model: selectedModel,
      systemInstruction: systemInstruction,
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: schema,
        temperature: 0.4,
        maxOutputTokens: 2048
      }
    });

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return JSON.parse(text);
  } catch (error) {
    const isRateLimit = error.status === 429 || error.status === 503;
    console.log(`[!] API Error (${selectedModel}): ${error.status} (Attempt ${attempt})`);

    if (isRateLimit && attempt <= 4) {
      const waitTime = attempt * 10000; // Increase wait time (10s, 20s, 30s...)
      console.log(`[!] Rate limit hit. Cooling down for ${waitTime/1000}s...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      return callGeminiWithRetry(prompt, systemInstruction, schema, attempt + 1);
    }
    
    // Return a valid empty structure if we truly fail so the frontend doesn't crash
    return { title: "Service Temporarily Busy", ingredients: [], instructions: [], shopping_list: {}, prep_strategy: [] };
  }
}

app.post('/api/extract', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'URL is required' });

    let cleanedText = "";

    console.log(`[1] Scraping Route: ${url}`);

    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      console.log(`[!] YouTube URL detected. Bypassing HTML scrape to pull subtitle transcript directly...`);
      try {
        const module = await import('youtube-transcript/dist/youtube-transcript.esm.js');
        const YoutubeTranscript = module.YoutubeTranscript;
        const transcript = await YoutubeTranscript.fetchTranscript(url);
        cleanedText = transcript.map(t => t.text).join(' ');
        console.log(`[!] Transcript extracted successfully (${cleanedText.length} characters)`);
      } catch (err) {
        console.log("[X] Failed to fetch transcript... falling back to raw DOM");
        cleanedText = "Failed to parse YouTube Captions, recipe could not be identified.";
      }
    } else {
      const { data: html } = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      const $ = cheerio.load(html);
      $('script, style, nav, footer, iframe, noscript, .ads, .comments').remove();
      cleanedText = $('body').text().replace(/\s+/g, ' ').trim();
    }

    cleanedText = cleanedText.substring(0, 15000);

    console.log(`[2] Firing SINGLE MASTER PASS LLM Extraction...`);
    const finalResult = await callGeminiWithRetry(cleanedText, MASTER_PROMPT, recipeSchema);

    console.log(`[✓] Master Extraction Complete!`);
    res.json(finalResult);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/generate-plan', async (req, res) => {
  try {
    const { recipes } = req.body;
    if (!recipes || recipes.length === 0) return res.status(400).json({ error: 'No recipes selected' });

    console.log(`[3] Firing MEAL PLANNER LLM for ${recipes.length} recipes...`);

    const prompt = `Consolidate these ${recipes.length} recipes into a master plan: ${JSON.stringify(recipes)}`;
    const finalResult = await callGeminiWithRetry(prompt, PLANNER_PROMPT); 
    
    console.log(`[✓] Meal Plan Generation Complete!`);
    res.json(finalResult);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
