import { NextResponse } from 'next/server';
import { prisma, normalizePhone } from '@/lib/db';

export async function POST(req) {
  const isDemoMode = process.env.DEMO_MODE === 'true';
  const AT_API_KEY = process.env.AT_API_KEY;
  const AT_USERNAME = process.env.AT_USERNAME;

  try {
    let { phone } = await req.json();
    phone = normalizePhone(phone);

    if (!phone) {
      return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
    }

    // Generate 6 digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes for demo robustness

    // Clear old codes for this number
    await prisma.otpCode.deleteMany({
      where: { phone }
    });

    // Create new code
    await prisma.otpCode.create({
      data: { phone, code, expires }
    });

    // Send SMS via Africa's Talking
    if (!isDemoMode && AT_API_KEY && AT_USERNAME) {
      try {
        const formattedPhone = phone; // Already normalized starts with +
        const message = `Your VocalCred verification code is: ${code}. It expires in 15 minutes.`;

        // Use direct fetch to bypass SDK silence and hit the live gateway
        const url = 'https://api.africastalking.com/version1/messaging';
        const formData = new URLSearchParams();
        formData.append('username', AT_USERNAME);
        formData.append('to', formattedPhone);
        formData.append('message', message);

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'apiKey': AT_API_KEY,
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: formData
        });

        const data = await response.json();
        
        if (response.ok) {
           console.log(`[AT SMS SUCCESS] OTP ${code} sent to ${formattedPhone}`, data);
        } else {
           console.error(`[AT SMS FAILED] API Error for ${formattedPhone}:`, data);
        }

      } catch (smsError) {
        console.error("[AT SMS CRASH] Africa's Talking SMS failed:", smsError);
      }
    } else {
      console.log(`[DEMO MODE] OTP for ${phone} is ${code}`);
    }

    return NextResponse.json({ 
      success: true, 
      message: "OTP sent successfully",
      demoCode: isDemoMode ? code : null 
    });
    
  } catch (error) {
    console.error('OTP Generation Error:', error);
    return NextResponse.json({ error: "Failed to generate OTP" }, { status: 500 });
  }
}
