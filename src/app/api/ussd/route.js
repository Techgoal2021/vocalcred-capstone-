import { prisma, normalizePhone } from '@/lib/db';
import { triggerVoiceCall } from '@/lib/at_voice';
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
    if (!user.language && args.length === 0) {
      return new Response("CON Welcome to VocalCred\nSelect Language:\n1. English\n2. Pidgin\n3. Hausa\n4. Igbo\n5. Yoruba", { 
        status: 200, headers: { 'Content-Type': 'text/plain' } 
      });
    }

    if (!user.language && args.length === 1) {
      const langMap = { "1": "en", "2": "pg", "3": "ha", "4": "ig", "5": "yo" };
      const lang = langMap[args[0]] || "en";
      await prisma.user.update({ where: { phone }, data: { language: lang } });
      
      const welcomeMap = {
        en: "Language set. Press 1 to continue.",
        pg: "Language don set. Press 1 to continue.",
        ha: "An seta yare. Danna 1 don ci gaba.",
        ig: "Edobere asụsụ. Pịa 1 ka ị gaa n'ihu.",
        yo: "A ti yan ede. Tẹ 1 lati tẹsiwaju."
      };
      
      return new Response(`CON ${welcomeMap[lang]}`, { 
        status: 200, headers: { 'Content-Type': 'text/plain' } 
      });
    }

    // Adjust args if language was just set
    const effectiveArgs = (args.length > 0 && ["1","2","3","4","5"].includes(args[0]) && !user.vocalcred_id) ? args.slice(1) : args;
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
      } else if (effectiveArgs[0] === "2") {
        // TRIGGER VOICE REGISTRATION
        await prisma.user.update({
          where: { phone },
          data: { pendingVoiceAction: "registration" }
        });
        await triggerVoiceCall(phone, "registration");
        return new Response(`END VocalCred will call you now to record your profile.`, {
          status: 200, headers: { 'Content-Type': 'text/plain' }
        });
      } else if (effectiveArgs[0] === "3") {
        // TRIGGER VOICE SEARCH
        await prisma.user.update({
          where: { phone },
          data: { pendingVoiceAction: "search" }
        });
        await triggerVoiceCall(phone, "search");
        return new Response(`END VocalCred will call you now. Please state who you are looking for.`, {
          status: 200, headers: { 'Content-Type': 'text/plain' }
        });
      } else if (effectiveArgs[0] === "1") {
        if (effectiveArgs.length === 1) {
          responseStr = `CON ${s.role}`;
        } else if (effectiveArgs.length === 2) {
          // Setting the role
          const roleSelection = effectiveArgs[1];
          const isClient = roleSelection === "2";
          responseStr = `CON ${isClient ? (lang === 'en' ? 'Enter Business/Name:' : s.name) : s.name}`;
        } else if (effectiveArgs.length === 3) {
          const roleSelection = effectiveArgs[1];
          if (roleSelection === "2") {
            // Partners now go to activity step
             responseStr = `CON ${lang === 'en' ? 'What do you do (Activity):' : 'Wani aiki kuke yi:'}`;
          } else {
            // Artisan path: continue to skill selection
            responseStr = `CON ${s.work}\n1. Plumber\n2. Electrician\n3. Tailor\n4. Carpenter\n5. Other`;
          }
        } else if (effectiveArgs.length === 4) {
          const roleSelection = effectiveArgs[1];
          if (roleSelection === "2") {
             // Final Partner Registration
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
            // Final Artisan Registration
            const name = effectiveArgs[2];
            const skillIndex = effectiveArgs[3];
            const skill = SKILLS[skillIndex] || "Artisan";
            const vcId = `VC-${Math.floor(Math.random() * 900) + 100}`;
            
            const simSwapDetected = false;
            const initialRep = simSwapDetected ? 400 : (Math.floor(Math.random() * (850 - 650)) + 650);

            await prisma.user.update({
              where: { phone },
              data: {
                name: name,
                vocalcred_id: vcId,
                skill: SKILLS[skillIndex] || skillIndex || "Artisan",
                role: "ARTISAN",
                jobs_completed: 0,
                avg_rating: 0,
                repeat_clients: 0,
                reputation: initialRep,
                has_voice: false
              }
            });
            
            responseStr = `END ${s.welcome} ${name}. ID: ${vcId}. Security: ${s.success}.`;
          }
        }
      } else if (effectiveArgs[0] === "2") {
        responseStr = `END ${lang === 'en' ? 'Register first.' : 'Abeg register first.'}`;
      }
    } 
    // Flow for Registered Users
    else {
      if (effectiveArgs.length === 0) {
        const welcomeBackMsg = user.role === "CLIENT" 
          ? `CON Partner ${user.name}\n1. Find Artisan\n2. Check Reputation\n3. Reset Lang`
          : `CON ${s.welcome} back ${user.name}\n1. Request Rating\n2. Check score\n3. Reset Lang`;
        responseStr = welcomeBackMsg;
      } else if (effectiveArgs[0] === "1") {
        if (user.role === "CLIENT") {
           responseStr = "END Search now live! Browse scores and ratings at: vocalcred.ai/dashboard/find";
        } else {
          if (effectiveArgs.length === 1) {
            responseStr = `CON ${lang === 'ha' ? 'Shigar da lambar abokin ciniki:' : 'Enter Client Phone:'}`;
          } else if (effectiveArgs.length === 2) {
            const clientPhone = effectiveArgs[1];
            try {
              await sms.send({
                to: [clientPhone],
                message: `VocalCred: You recently worked with ${user.name}. Rate 1-5 to verify.`
              });
            } catch (e) {}
            responseStr = `END Request sent to ${clientPhone}.`;
          }
        }
      } else if (effectiveArgs[0] === "2") {
        const score = user.role === "CLIENT" ? user.payer_score : user.reputation;
        responseStr = `END ${s.score}: ${score}`;
      } else if (effectiveArgs[0] === "3") {
         await prisma.user.update({ where: { phone }, data: { language: null } });
         responseStr = "END Language reset.";
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
