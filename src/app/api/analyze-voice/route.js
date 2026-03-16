import { GoogleGenerativeAI } from "@google/generative-ai";
import { prisma } from '@/lib/db';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
  try {
    const { phone, audioBase64, mimeType } = await req.json();

    if (!phone || !audioBase64) {
      return new Response("Missing data", { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      You are an AI Trust Analyst for VocalCred, a reputation network for informal artisans in Africa.
      Analyze this voice recording for "Affective Indicators of Trust".
      
      Tasks:
      1. Detect the speaker's emotional state (Confident, Nervous, Professional, etc).
      2. Identify if the speaker sounds reliable and experienced in their trade.
      3. Return a "Sentiment Score" from 1 to 100 where 100 is Extremely Trustworthy.
      4. Provide a brief 1-sentence "AI Verdict" for a bank dashboard.

      Return ONLY a JSON object:
      {
        "sentimentScore": number,
        "emotion": "string",
        "verdict": "string",
        "reliability": "Low|Medium|High"
      }
    `;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: audioBase64,
          mimeType: mimeType || "audio/webm"
        }
      }
    ]);

    const response = await result.response;
    const jsonText = response.text().replace(/```json|```/g, "").trim();
    const insights = JSON.parse(jsonText);

    // Update the Artisan's reputation based on AI insights
    const user = await prisma.user.findUnique({ where: { phone } });
    if (user) {
      const currentRep = user.reputation || 700;
      // We weight the AI sentiment as 20% of the movement
      const newRep = Math.round(currentRep * 0.8 + (insights.sentimentScore * 10) * 0.2);
      
      await prisma.user.update({
        where: { phone },
        data: {
          reputation: Math.min(999, Math.max(100, newRep)),
          // We can store the verdict in a new field if we want, 
          // but for now let's just update the score.
        }
      });
    }

    return new Response(JSON.stringify({ success: true, insights }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error("Gemini Voice Error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
