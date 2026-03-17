import { prisma, normalizePhone } from '@/lib/db';
import { triggerVoiceCall } from '@/lib/at_voice';
import africastalking from 'africastalking';

// Lazy load Africa's Talking to prevent build-time crashes
let sms = null;
function getSms() {
  if (!sms) {
    const AT = africastalking({
      apiKey: process.env.AT_API_KEY || 'dummy',
      username: process.env.AT_USERNAME || 'sandbox',
    });
    sms = AT.SMS;
  }
  return sms;
}

const SKILLS = {
  "1": "Plumber",
  "2": "Electrician",
  "3": "Tailor",
  "4": "Carpenter",
  "5": "Other"
};

export async function POST(req) {
  try {
    const textData = await req.text();
    const params = new URLSearchParams(textData);
    
    const phoneRaw = params.get('phoneNumber') || params.get('from') || params.get('phone') || "";
    const phone = normalizePhone(phoneRaw);
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

    // 1. Language Selection (Global Entrance)
    if (!user.language) {
      if (args.length === 0) {
        return new Response("CON Welcome to VocalCred\nSelect Language:\n1. English\n2. Pidgin\n3. Hausa\n4. Igbo\n5. Yoruba", { 
          status: 200, headers: { 'Content-Type': 'text/plain' } 
        });
      }
      
      const langMap = { "1": "en", "2": "pg", "3": "ha", "4": "ig", "5": "yo" };
      const selectedLang = langMap[args[0]];
      
      if (selectedLang) {
        await prisma.user.update({ where: { phone }, data: { language: selectedLang } });
        user.language = selectedLang;
        // Do NOT return here; proceed to the menu for the current text
      } else {
        return new Response("CON Invalid selection.\n1. English\n2. Pidgin\n3. Hausa\n4. Igbo\n5. Yoruba", { 
          status: 200, headers: { 'Content-Type': 'text/plain' } 
        });
      }
    }

    // Logic: If the first arg was a language selector, we strip it for the rest of the flow
    const effectiveArgs = (args.length > 0 && ["1","2","3","4","5"].includes(args[0])) ? args.slice(1) : args;
    const lang = user.language || "en";

    const strings = {
      en: { welcome: "Welcome", role: "Join as:\n1. Artisan\n2. Partner", reg: "Register", score: "Check score", name: "Enter name:", work: "Select work (or type any):", success: "Verified", voice_reg: "Register by Voice", voice_search: "Find by Voice" },
      pg: { welcome: "Welcome", role: "Join as:\n1. Artisan\n2. Partner", reg: "Register", score: "Check score", name: "Abeg provide name:", work: "Select work (or type any):", success: "Clear", voice_reg: "Register wit Voice", voice_search: "Find wit Voice" },
      ha: { welcome: "Barka da zuwa", role: "Shiga azaman:\n1. Masu sana'a\n2. Abokin haɗin gwiwa", reg: "Yi Rajista", score: "Duba maki", name: "Shigar da suna:", work: "Zaɓi aiki (ko duba kowane):", success: "Tabbatacce", voice_reg: "Rijista da Murya", voice_search: "Nema da Murya" },
      ig: { welcome: "Nnọọ", role: "Soro dị ka:\n1. Ọrụ aka\n2. Onye mmekọ", reg: "Debanye aha", score: "Lelee akara", name: "Tinye aha gị:", work: "Họrọ ọrụ (ma ọ bụ pịnye n'ijie):", success: "E kwenyesiri ike", voice_reg: "Debanye aha na Voice", voice_search: "Chọta na Voice" },
      yo: { welcome: "Kaabo", role: "Darapọ mọ bi:\n1. Oníṣẹ́ ọwọ́\n2. Alájọṣepọ̀", reg: "Forukọsílẹ", score: "Wo ami rẹ", name: "Tẹ orukọ rẹ:", work: "Yan iṣẹ rẹ (tàbí tẹ kankan):", success: "Ti fìdí rẹ mú lẹ", voice_reg: "Forukọsílẹ pẹlu Ohun", voice_search: "Wa pẹlu Ohun" }
    };

    const s = strings[lang] || strings.en;

    // Flow for Unregistered Users
    if (!user.vocalcred_id) {
      if (effectiveArgs.length === 0) {
        responseStr = `CON ${s.welcome} to VocalCred\n1. ${s.reg}\n2. ${s.voice_reg}\n3. ${s.voice_search}\n4. ${s.score}`;
      } else if (effectiveArgs[0] === "1") {
        if (effectiveArgs.length === 1) {
          responseStr = `CON ${s.role}`;
        } else if (effectiveArgs.length === 2) {
          const roleSelection = effectiveArgs[1];
          const isClient = roleSelection === "2";
          responseStr = `CON ${isClient ? (lang === 'en' ? 'Enter Business Name:' : s.name) : s.name}`;
        } else if (effectiveArgs.length === 3) {
          const roleSelection = effectiveArgs[1];
          if (roleSelection === "2") {
             responseStr = `CON ${lang === 'en' ? 'What do you do (Activity):' : 'Wani aiki kuke yi:'}`;
          } else {
            responseStr = `CON ${s.work}\n1. Plumber\n2. Electrician\n3. Tailor\n4. Carpenter\n5. Other`;
          }
        } else if (effectiveArgs.length === 4) {
          const roleSelection = effectiveArgs[1];
          if (roleSelection === "2") {
             const name = effectiveArgs[2];
             const activity = effectiveArgs[3];
             const vcId = `VP-${Math.floor(Math.random() * 900) + 100}`;
             await prisma.user.update({
               where: { phone },
               data: {
                 name,
                 businessName: name,
                 businessType: activity,
                 role: "CLIENT",
                 vocalcred_id: vcId,
                 payer_score: 700,
               }
             });
             responseStr = `END Partner ${name} (${activity}) registered. ID: ${vcId}.`;
          } else {
            const name = effectiveArgs[2];
            const skillIndex = effectiveArgs[3];
            const skill = SKILLS[skillIndex] || skillIndex || "Artisan";
            const vcId = `VC-${Math.floor(Math.random() * 900) + 100}`;
            
            await prisma.user.update({
              where: { phone },
              data: {
                name: name,
                vocalcred_id: vcId,
                skill: skill,
                role: "ARTISAN",
                jobs_completed: 0,
                avg_rating: 0,
                repeat_clients: 0,
                reputation: 700,
                has_voice: false
              }
            });
            responseStr = `END ${s.welcome} ${name}. ID: ${vcId}. Security: ${s.success}.`;
          }
        }
      } else if (effectiveArgs[0] === "2") {
        await prisma.user.update({ where: { phone }, data: { pendingVoiceAction: "registration" } });
        await triggerVoiceCall(phone, "registration");
        responseStr = `END VocalCred will call you now to record your profile.`;
      } else if (effectiveArgs[0] === "3") {
        await prisma.user.update({ where: { phone }, data: { pendingVoiceAction: "search" } });
        await triggerVoiceCall(phone, "search");
        responseStr = `END VocalCred will call you now. Please state who you are looking for.`;
      } else if (effectiveArgs[0] === "4") {
        responseStr = `END ${s.score}: 0 (Not registered yet)`;
      }
    } 
    // Flow for Registered Users
    else {
      if (effectiveArgs.length === 0) {
        responseStr = user.role === "CLIENT" 
          ? `CON Partner ${user.name}\n1. Find Artisan\n2. Check Reputation\n3. Reset Lang`
          : `CON ${s.welcome} back ${user.name}\n1. Request Rating\n2. Check score\n3. Reset Lang`;
      } else if (effectiveArgs[0] === "1") {
        if (user.role === "CLIENT") {
           responseStr = "END Search now live! Browse scores and ratings at: vocalcred.ai/dashboard/find";
        } else {
          if (effectiveArgs.length === 1) {
            responseStr = `CON ${lang === 'ha' ? 'Shigar da lambar abokin ciniki:' : 'Enter Client Phone:'}`;
          } else if (effectiveArgs.length === 2) {
            const clientPhone = effectiveArgs[1];
            console.log(`[USSD] Sending rating request SMS to: ${clientPhone}`);
            
            try {
              const AT_API_KEY = process.env.AT_API_KEY;
              const AT_USERNAME = process.env.AT_USERNAME;
              const message = `VocalCred: You recently worked with ${user.name}. View their profile and rate them at: https://vocalcred-capstone-37668518280.us-central1.run.app/dashboard`;

              if (AT_API_KEY && AT_USERNAME) {
                const url = 'https://api.africastalking.com/version1/messaging';
                const formData = new URLSearchParams();
                formData.append('username', AT_USERNAME);
                formData.append('to', clientPhone);
                formData.append('message', message);

                await fetch(url, {
                  method: 'POST',
                  headers: {
                    'apiKey': AT_API_KEY,
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded'
                  },
                  body: formData
                });
                console.log(`[AT SMS SUCCESS] Rating request sent to ${clientPhone}`);
              }
              responseStr = `END Request sent to ${clientPhone}.`;
            } catch (e) {
              console.error(`[USSD] SMS Error:`, e);
              responseStr = `END Try again later. SMS service busy.`;
            }
          }
        }
      }
 else if (effectiveArgs[0] === "2") {
        const score = user.role === "CLIENT" ? (user.payer_score || 0) : (user.reputation || 0);
        responseStr = `END ${s.score}: ${score}`;
      } else if (effectiveArgs[0] === "3") {
         await prisma.user.update({ where: { phone }, data: { language: null } });
         responseStr = "END Language reset. Redial to select new language.";
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
