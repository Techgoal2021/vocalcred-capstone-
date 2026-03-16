import { prisma } from '@/lib/db';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function POST(req) {
  try {
    const formData = await req.formData();
    const audioContent = formData.get('audio');
    const phone = formData.get('phone');

    if (!audioContent || !phone) {
      return new Response("Missing audio or phone", { status: 400 });
    }

    // Convert Blob to Buffer
    const buffer = Buffer.from(await audioContent.arrayBuffer());
    
    // Save to the Next.js standard public directory so UserCard.jsx can instantly read it
    const publicPath = join(process.cwd(), 'public', `voice_${phone}.webm`);
    await writeFile(publicPath, buffer);

    // Trigger Gemini Analysis for real-time "Trust-as-a-Service" scoring
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    try {
      await fetch(`${baseUrl}/api/analyze-voice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone,
          audioBase64: buffer.toString('base64'),
          mimeType: 'audio/webm'
        })
      });
    } catch (apiError) {
      console.error("Auto-Analysis Failed:", apiError);
    }

    // Update the DB to mark that the user has submitted a voice profile
    await prisma.user.update({
      where: { phone: phone },
      data: {
        has_voice: true
      }
    });

    return new Response(JSON.stringify({ success: true }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("Audio Upload Error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
