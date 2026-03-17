import africastalking from 'africastalking';

// Lazy load Voice to prevent build-time crashes
let voice = null;
function getVoice() {
  if (!voice) {
    const AT = africastalking({
      apiKey: process.env.AT_API_KEY || 'dummy',
      username: process.env.AT_USERNAME || 'sandbox',
    });
    voice = AT.VOICE;
  }
  return voice;
}

export async function triggerVoiceCall(phone, type = "registration") {
  try {
    // In Production, this would be your true virtual number
    // In Sandbox, any verified number works
    const callFrom = process.env.AT_VOICE_NUMBER || "+2348000000000"; 
    
    const options = {
      callFrom: callFrom,
      callTo: [phone],
      // We can pass metadata to the callback via clientRequestId
      // format: metadata:type:phone
      clientRequestId: `vocalcred:${type}:${phone}`
    };

    const result = await getVoice().call(options);
    console.log(`[VOICE TRIGGER] Call initiated for ${phone} (Type: ${type})`, result);
    return result;
  } catch (error) {
    console.error(`[VOICE TRIGGER FAILED] for ${phone}:`, error);
    throw error;
  }
}
