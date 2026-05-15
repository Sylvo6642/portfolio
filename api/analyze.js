import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';

const REPORT_SCHEMA = {
  type: SchemaType.OBJECT,
  properties: {
    overallRisk: { type: SchemaType.STRING, enum: ['Low', 'Medium', 'High'] },
    summary: { type: SchemaType.STRING },
    flags: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          category: { type: SchemaType.STRING },
          severity: { type: SchemaType.STRING, enum: ['Low', 'Medium', 'High'] },
          clauseSnippet: { type: SchemaType.STRING },
          plainExplanation: { type: SchemaType.STRING },
          whyItMatters: { type: SchemaType.STRING },
          negotiationTip: { type: SchemaType.STRING },
        },
        required: ['category', 'severity', 'clauseSnippet', 'plainExplanation', 'whyItMatters', 'negotiationTip'],
      },
    },
  },
  required: ['overallRisk', 'summary', 'flags'],
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Server misconfiguration: missing API key' });
  }

  const { prompt } = req.body;
  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Missing prompt' });
  }

  try {
    const ai = new GoogleGenerativeAI(apiKey);
    const model = ai.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: REPORT_SCHEMA,
        temperature: 0.4,
      },
    });

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return res.status(200).json({ result: text });
  } catch (err) {
    return res.status(500).json({ error: err?.message ?? 'Gemini request failed' });
  }
}
