import africastalking from 'africastalking';

const atCredentials = {
  apiKey: process.env.AT_API_KEY,
  username: process.env.AT_USERNAME,
};

const AT = africastalking(atCredentials);
const voice = AT.VOICE;

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

    const result = await voice.call(options);
    console.log(`[VOICE TRIGGER] Call initiated for ${phone} (Type: ${type})`, result);
    return result;
  } catch (error) {
    console.error(`[VOICE TRIGGER FAILED] for ${phone}:`, error);
    throw error;
  }
}
