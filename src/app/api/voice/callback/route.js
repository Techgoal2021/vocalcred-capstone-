import { GoogleGenerativeAI } from "@google/generative-ai";
import { prisma, normalizePhone } from '@/lib/db';
import africastalking from 'africastalking';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const atCredentials = {
  apiKey: process.env.AT_API_KEY,
  username: process.env.AT_USERNAME,
};
const AT = africastalking(atCredentials);
const sms = AT.SMS;

export async function POST(req) {
  try {
    const textData = await req.text();
    const params = new URLSearchParams(textData);
    
    const recordingUrl = params.get('recordingUrl');
    const callerNumber = normalizePhone(params.get('callerNumber'));
    const requestId = params.get('clientRequestId') || ""; // Format: vocalcred:mode:phone
    const mode = requestId.split(':')[1] || "registration";

    if (!recordingUrl || !callerNumber) {
      console.error("Missing voice callback data:", { recordingUrl, callerNumber });
      return new Response('<Response><Say>Error processing request.</Say></Response>', {
        headers: { 'Content-Type': 'text/xml' }
      });
    }

    // 1. Download the audio file
    const audioRes = await fetch(recordingUrl);
    if (!audioRes.ok) throw new Error("Failed to download recording");
    const audioBuffer = await audioRes.arrayBuffer();
    const audioBase64 = Buffer.from(audioBuffer).toString('base64');

    // 2. Process with Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    let prompt = "";
    if (mode === "search") {
      prompt = `
        You are an AI Search Agent for VocalCred.
        Listen to this audio specifically looking for a TRADE or PROFESSION (e.g. Painter, Plumber, Tailor) and a LOCATION (e.g. Lagos, Kano, Abuja).
        Identify what the user is looking for.
        Return ONLY a JSON object:
        { "skill": "string", "location": "string", "language": "string" }
      `;
    } else {
      prompt = `
        You are an AI Intake Agent for VocalCred. Listen to this audio where an artisan is introducing themselves. 
        Extract: 1. Name, 2. Profession/Trade, 3. Native language, 4. Location (if mentioned).
        Return ONLY a JSON object:
        { "name": "string", "skill": "string", "language": "en|ha|ig|yo|pg", "location": "string" }
      `;
    }

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: audioBase64,
          mimeType: "audio/mp3"
        }
      }
    ]);

    const geminiResponse = await result.response;
    const jsonText = geminiResponse.text().replace(/```json|```/g, "").trim();
    const data = JSON.parse(jsonText);

    // 3. Logic based on Mode
    if (mode === "search" && data.skill) {
      // SEARCH LOGIC
      const searchCriteria = {
        role: "ARTISAN",
        skill: { contains: data.skill },
        vocalcred_id: { not: null }
      };

      if (data.location) {
        // Simple search for location in bio or name for now, or just skill
        // searchCriteria.OR = [ { bio: { contains: data.location } }, { name: { contains: data.location } } ];
      }

      const artisans = await prisma.user.findMany({
        where: searchCriteria,
        take: 3
      });

      let smsMessage = "";
      if (artisans.length > 0) {
        smsMessage = `VocalCred found ${artisans.length} ${data.skill}(s):\n` + 
                      artisans.map(a => `- ${a.name}: ${a.phone} (Score: ${a.reputation})`).join('\n');
      } else {
        smsMessage = `VocalCred: Sorry, no ${data.skill} found${data.location ? ' in ' + data.location : ''} yet.`;
      }

      try {
        await sms.send({
          to: [callerNumber],
          message: smsMessage
        });
        console.log(`[AI VOICE SEARCH] SMS Sent to ${callerNumber}`);
      } catch (e) {
        console.error("[AI VOICE SEARCH] SMS Failed:", e);
      }

      // Clear pending action
      await prisma.user.update({
        where: { phone: callerNumber },
        data: { pendingVoiceAction: null }
      });

      return new Response(`<Response><Say>I found ${artisans.length} results. I am sending their contact details to your phone via SMS now. Goodbye.</Say></Response>`, {
        headers: { 'Content-Type': 'text/xml' }
      });

    } else if (data.name && data.skill) {
      // REGISTRATION LOGIC
      const vcId = "VC-" + Math.floor(100 + Math.random() * 899);
      const initialRep = (Math.floor(Math.random() * (850 - 650)) + 650);

      await prisma.user.upsert({
        where: { phone: callerNumber },
        update: {
          name: data.name,
          skill: data.skill,
          language: data.language || "en",
          vocalcred_id: vcId,
          role: "ARTISAN",
          reputation: initialRep,
          pendingVoiceAction: null // Clear pending
        },
        create: {
          phone: callerNumber,
          name: data.name,
          skill: data.skill,
          language: data.language || "en",
          vocalcred_id: vcId,
          role: "ARTISAN",
          reputation: initialRep
        }
      });

      return new Response('<Response><Say>Thank you. Your registration as a ' + data.skill + ' is complete. You can now login to your dashboard.</Say></Response>', {
        headers: { 'Content-Type': 'text/xml' }
      });
    }

    return new Response('<Response><Say>I could not hear you clearly. Please try again.</Say></Response>', {
      headers: { 'Content-Type': 'text/xml' }
    });

  } catch (error) {
    console.error("Voice Callback Error:", error);
    return new Response('<Response><Say>We encountered an error. Please try again later.</Say></Response>', {
      headers: { 'Content-Type': 'text/xml' }
    });
  }
}
