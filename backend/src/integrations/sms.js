/**
 * SMS Gateway Service
 * Supports:
 * 1. Twilio SMS (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER)
 * 2. Fast2SMS for India (FAST2SMS_API_KEY)
 * 3. 2Factor.in for India (TWO_FACTOR_API_KEY)
 * 4. Simulated SMS Gateway (logs formatted OTP box to console & returns simulation metadata)
 */

export function normalizePhoneNumber(phone) {
  if (!phone) return '';
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  if (cleaned.startsWith('+')) return cleaned;
  if (cleaned.length === 10) return `+91${cleaned}`;
  if (cleaned.startsWith('91') && cleaned.length === 12) return `+${cleaned}`;
  if (cleaned.startsWith('0') && cleaned.length === 11) return `+91${cleaned.slice(1)}`;
  return `+${cleaned}`;
}

export async function sendSmsOtp({ phone, otp, expiryMinutes = 5 }) {
  const normalizedPhone = normalizePhoneNumber(phone);
  const raw10Digits = normalizedPhone.replace(/^\+91/, '').replace(/^\+/, '').slice(-10);
  const message = `Your ReviveAI verification code is: ${otp}. Valid for ${expiryMinutes} minutes. Do not share this OTP with anyone.`;

  // 1. Check for Twilio configuration
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
    try {
      const auth = Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString('base64');
      const params = new URLSearchParams();
      params.append('To', normalizedPhone);
      params.append('From', process.env.TWILIO_PHONE_NUMBER);
      params.append('Body', message);

      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: params.toString(),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        console.error('Twilio SMS error:', data);
        throw new Error(data.message || 'Twilio SMS failed');
      }

      console.log(`\n📲 [Twilio SMS] Real SMS sent! OTP ${otp} to ${normalizedPhone} (SID: ${data.sid})`);
      return {
        success: true,
        provider: 'twilio',
        messageId: data.sid,
        phone: normalizedPhone,
      };
    } catch (err) {
      console.warn(`[SMS Warning] Twilio failed: ${err.message}.`);
    }
  }

  // 2. Check for Fast2SMS (Indian numbers)
  if (process.env.FAST2SMS_API_KEY) {
    try {
      // Try Route 1: OTP route
      let response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
        method: 'POST',
        headers: {
          'authorization': process.env.FAST2SMS_API_KEY.trim(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          route: 'otp',
          variables_values: String(otp),
          numbers: raw10Digits,
        }),
      });

      let data = await response.json();
      
      // If OTP route is not active or returns error, fallback to Quick SMS route 'q'
      if (!data.return) {
        console.warn(`[Fast2SMS OTP route response: ${JSON.stringify(data.message)}]. Retrying with Quick SMS route...`);
        response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
          method: 'POST',
          headers: {
            'authorization': process.env.FAST2SMS_API_KEY.trim(),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            route: 'q',
            message: `Your ReviveAI verification code is ${otp}. Valid for ${expiryMinutes} minutes.`,
            language: 'english',
            numbers: raw10Digits,
          }),
        });
        data = await response.json();
      }

      if (data.return) {
        console.log(`\n📲 [Fast2SMS] Real SMS sent! OTP ${otp} to +91${raw10Digits} (Req: ${data.request_id})`);
        return {
          success: true,
          provider: 'fast2sms',
          messageId: data.request_id,
          phone: normalizedPhone,
        };
      } else {
        console.error('Fast2SMS Error from API:', data);
      }
    } catch (err) {
      console.warn(`[SMS Warning] Fast2SMS failed: ${err.message}.`);
    }
  }

  // 3. Check for 2Factor.in (Indian numbers)
  if (process.env.TWO_FACTOR_API_KEY) {
    try {
      const url = `https://2factor.in/v1/API/V1/${process.env.TWO_FACTOR_API_KEY}/SMS/${raw10Digits}/${otp}/OTP1`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.Status === 'Success') {
        console.log(`\n📲 [2Factor] Real SMS sent! OTP ${otp} to +91${raw10Digits} (Session: ${data.Details})`);
        return {
          success: true,
          provider: '2factor',
          messageId: data.Details,
          phone: normalizedPhone,
        };
      } else {
        console.error('2Factor SMS error:', data);
      }
    } catch (err) {
      console.warn(`[SMS Warning] 2Factor failed: ${err.message}.`);
    }
  }

  // 4. Fallback: Simulated SMS Delivery (Dev / Demo Mode)
  const boxWidth = 52;
  const line1 = ` 📱 REVIVE AI SMS GATEWAY (SIMULATED DEV MODE)`;
  const line2 = ` To:      ${normalizedPhone}`;
  const line3 = ` OTP:     👉 ${otp} 👈`;
  const line4 = ` Message: ${message.slice(0, 40)}...`;
  const line5 = ` Expires: ${expiryMinutes} minutes`;
  const line6 = ` Note: Add FAST2SMS_API_KEY or Twilio to send real SMS`;

  console.log('\n┌' + '─'.repeat(boxWidth) + '┐');
  console.log('│' + line1.padEnd(boxWidth) + '│');
  console.log('├' + '─'.repeat(boxWidth) + '┤');
  console.log('│' + line2.padEnd(boxWidth) + '│');
  console.log('│' + line3.padEnd(boxWidth) + '│');
  console.log('│' + line4.padEnd(boxWidth) + '│');
  console.log('│' + line5.padEnd(boxWidth) + '│');
  console.log('│' + line6.padEnd(boxWidth) + '│');
  console.log('└' + '─'.repeat(boxWidth) + '┘\n');

  return {
    success: true,
    provider: 'simulated',
    simulated: true,
    phone: normalizedPhone,
    otp, // returned in simulated mode
  };
}
