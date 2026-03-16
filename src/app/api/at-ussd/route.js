import { prisma } from '@/lib/db';
import africastalking from 'africastalking';

// Initialize Africa's Talking
const atCredentials = {
  apiKey: process.env.AT_API_KEY,
  username: process.env.AT_USERNAME,
};
const AT = africastalking(atCredentials);
const sms = AT.SMS;

const SKILLS = {
  "1": "Plumber",
  "2": "Electrician",
  "3": "Tailor",
  "4": "Carpenter"
};

export async function POST(req) {
  try {
    const textData = await req.text();
    const params = new URLSearchParams(textData);
    
    // AT payload
    const phone = params.get('phoneNumber'); // Africa's Talking uses phoneNumber instead of phone
    const text = params.get('text') || "";
    
    if (!phone) {
      return new Response("Missing phone number", { status: 400 });
    }

    let user = await prisma.user.findUnique({ where: { phone } });
    if (!user) {
      user = await prisma.user.create({
        data: { phone }
      });
    }

    const args = text === "" ? [] : text.split('*');
    let responseStr = "END Invalid input.";

    // Flow for Unregistered Artisans
    if (!user.vocalcred_id) {
      if (args.length === 0) {
        responseStr = "CON Welcome to VocalCred\n1. Register\n2. Check my score";
      } else if (args[0] === "1") {
        if (args.length === 1) {
          responseStr = "CON Enter your name:";
        } else if (args.length === 2) {
          responseStr = "CON Select your skill:\n1. Plumber\n2. Electrician\n3. Tailor\n4. Carpenter";
        } else if (args.length === 3) {
          const name = args[1];
          const skillIndex = args[2];
          const skill = SKILLS[skillIndex] || "Artisan";
          
          const vcId = `VC-${Math.floor(Math.random() * 900) + 100}`;
          
          await prisma.user.update({
            where: { phone },
            data: {
              name,
              vocalcred_id: vcId,
              skill,
              jobs_completed: Math.floor(Math.random() * 30) + 5,
              avg_rating: Number((Math.random() * (5.0 - 4.2) + 4.2).toFixed(1)),
              repeat_clients: Math.floor(Math.random() * 10) + 1,
              reputation: Math.floor(Math.random() * (850 - 650)) + 650,
              has_voice: false
            }
          });
          
          responseStr = `END Welcome ${name}. Your VocalCred ID is ${vcId}.`;
        }
      } else if (args[0] === "2") {
        responseStr = "END You are not registered yet. Please register first.";
      }
    } 
    // Flow for Registered Artisans
    else {
      if (args.length === 0) {
        responseStr = `CON Welcome back ${user.name} (${user.vocalcred_id})\n1. Request Rating\n2. Check my score\n3. Record Voice Profile`;
      } else if (args[0] === "1") {
        if (args.length === 1) {
          responseStr = "CON Enter Client Phone Number:";
        } else if (args.length === 2) {
          const clientPhone = args[1];
          
          try {
            await sms.send({
              to: [clientPhone],
              message: `VocalCred: You recently worked with ${user.name} (${user.vocalcred_id}), a ${user.skill}. Please reply with a rating from 1 to 5 to verify their service.`
            });
          } catch (e) {
             console.error("SMS Failed Config (Ignore in local dev without real AT credits):", e);
          }
          responseStr = `END Rating request sent to ${clientPhone}.`;
        }
      } else if (args[0] === "2") {
        responseStr = `END Your VocalCred Score: ${user.reputation || 742}\nRating: ${user.avg_rating || 4.8} Stars\nJobs Rated: ${user.jobs_completed || 18}`;
      } else if (args[0] === "3") {
         const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
         const uploadLink = `${baseUrl}/upload/${phone}`;
         try {
           await sms.send({
             to: [phone],
             message: `Secure VocalCred Link: Please click here to record your voice sample for AI analysis: ${uploadLink}`
           });
         } catch (e) {}
         responseStr = "END We have sent a secure link to your phone via SMS. Click it to record your voice.";
      }
    }

    return new Response(responseStr, { 
      status: 200, 
      headers: { 'Content-Type': 'text/plain' } 
    });
  } catch (error) {
    console.error("USSD Error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
