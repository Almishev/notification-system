import twilio from 'twilio';
import { Twilio } from 'twilio';

console.log('Twilio helper loading...', {
  ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID ? 'Set' : 'Not set',
  AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN ? 'Set' : 'Not set',
  PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER ? 'Set' : 'Not set'
});

// Създаване на Twilio клиент само ако имаме всички необходими променливи
let client: Twilio | undefined;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  try {
    client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    console.log('Twilio client initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Twilio client:', error);
  }
} else {
  console.error('Missing Twilio credentials. SMS functionality will not work.');
}

export async function sendSMS(to: string, message: string) {
  console.log(`[Twilio] Attempting to send SMS to ${to}`);
  
  // Check if Twilio client is initialized
  if (!client) {
    console.error('[Twilio] Failed to send SMS: Twilio client not initialized');
    return {
      success: false,
      error: 'Twilio client not initialized. Check environment variables.'
    };
  }
  
  // Check phone number format
  if (!/^\+[1-9]\d{1,14}$/.test(to)) {
    console.error(`[Twilio] Invalid phone number format: ${to}`);
    return {
      success: false,
      error: 'Invalid phone number format. Must be in E.164 format (e.g. +359XXXXXXXXX).'
    };
  }

  try {
    console.log(`[Twilio] Creating message with params:`, {
      to,
      from: process.env.TWILIO_PHONE_NUMBER,
      messageLength: message.length
    });
    
    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: to
    });
    
    console.log(`[Twilio] SMS sent successfully with ID: ${result.sid}`, {
      status: result.status,
      direction: result.direction,
      dateCreated: result.dateCreated
    });
    
    return {
      success: true,
      messageId: result.sid
    };
  } catch (error: any) {
    console.error('[Twilio] Error sending SMS:', {
      errorCode: error.code,
      errorMessage: error.message,
      errorDetails: error.moreInfo || error.details || 'No additional details'
    });
    
    return {
      success: false,
      error: error.message,
      code: error.code
    };
  }
}