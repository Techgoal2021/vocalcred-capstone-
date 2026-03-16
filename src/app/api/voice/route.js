import { NextResponse } from 'next/server';
import { prisma, normalizePhone } from '@/lib/db';

export async function POST(req) {
  try {
    const textData = await req.text();
    const params = new URLSearchParams(textData);
    
    // AT Voice sends parameters like 'callerNumber', 'isActive', etc.
    const isActive = params.get('isActive');
    const callerNumber = normalizePhone(params.get('callerNumber'));
    
    if (isActive === '1' && callerNumber) {
      const user = await prisma.user.findUnique({ where: { phone: callerNumber } });
      const lang = user?.language || "en";
      const action = user?.pendingVoiceAction || "registration";

      const greetings = {
        en: {
          registration: "Welcome to VocalCred. Please state your name and your trade clearly after the beep.",
          search: "Welcome to VocalCred. Who are you looking for today? Please state the trade and location."
        },
        ha: {
          registration: "Barka da zuwa VocalCred. Da fatan za a faɗi sunanka da aikinka bayan sauti.",
          search: "Barka da zuwa VocalCred. Wa kuke nema yau? Da fatan za a faɗi aikin da wurin."
        },
        yo: {
          registration: "Kaabo si VocalCred. Jọ̀wọ́ sọ orúkọ rẹ àti iṣẹ́ rẹ lẹ́yìn ohun náà.",
          search: "Kaabo si VocalCred. Ta ni o n wa loni? Jọ̀wọ́ sọ iṣẹ́ náà àti ibi náà."
        },
        ig: {
          registration: "Nnọọ na VocalCred. Biko kwuo aha gị na ọrụ gị nke ọma mgbe ụda ahụ gasịrị.",
          search: "Nnọọ na VocalCred. Onye ka ị na-achọ taa? Biko kwuo ọrụ na ebe."
        },
        pg: {
          registration: "Welcome to VocalCred. Abeg talk your name and your work well well after the beep.",
          search: "Welcome to VocalCred. Who you dey find today? Abeg talk the work and the place."
        }
      };

      const greetingText = greetings[lang]?.[action] || greetings.en[action];
      
      const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://' + req.headers.get('host')}/api/voice/callback`;
      
      const responseXml = `
        <Response>
          <Say voice="woman" playBeep="false">${greetingText}</Say>
          <Record 
            finishOnKey="#" 
            maxLength="20" 
            trimSilence="true" 
            playBeep="true" 
            callbackUrl="${callbackUrl}"
          />
        </Response>
      `.trim();

      return new Response(responseXml, {
        headers: { 'Content-Type': 'text/xml' },
      });
    }

    return new Response('', { status: 200 });
  } catch (error) {
    console.error("Voice Error:", error);
    return new Response('<Response><Say>An error occurred.</Say></Response>', { 
      status: 500,
      headers: { 'Content-Type': 'text/xml' }
    });
  }
}
