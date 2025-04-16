import axios from 'axios';

// Конфигурационни данни за BulkGate API
const BULKGATE_APP_ID = process.env.BULKGATE_APP_ID;
const BULKGATE_APP_TOKEN = process.env.BULKGATE_APP_TOKEN;
const BULKGATE_API_URL = 'https://portal.bulkgate.com/api/1.0/simple/transactional';

// Интерфейс за SMS съобщение
interface SMSMessage {
  phoneNumber: string;
  message: string;
  senderID?: string; // Опционално име на подател
}

/**
 * Изпраща SMS съобщение чрез BulkGate API
 * @param {SMSMessage} smsDetails - Детайли на SMS съобщението
 * @returns {Promise<any>} - Отговор от API
 */
export async function sendSMS(smsDetails: SMSMessage): Promise<any> {
  if (!BULKGATE_APP_ID || !BULKGATE_APP_TOKEN) {
    throw new Error('BulkGate API credentials are not configured');
  }

  try {
    const payload = {
      application_id: BULKGATE_APP_ID,
      application_token: BULKGATE_APP_TOKEN,
      number: smsDetails.phoneNumber,
      text: smsDetails.message,
      sender_id: smsDetails.senderID || 'gSystem',  // По подразбиране или персонализирана стойност
      country: 'bg'  // По подразбиране 'bg' за България, може да се направи динамично според префикса
    };

    const response = await axios.post(BULKGATE_API_URL, payload);
    return response.data;
  } catch (error: any) {
    console.error('Error sending SMS via BulkGate:', error.response?.data || error.message);
    throw new Error(error.response?.data?.data?.error || 'Failed to send SMS');
  }
}

/**
 * Проверява статуса на изпратено SMS съобщение
 * @param {string} messageId - ID на съобщението от BulkGate
 * @returns {Promise<any>} - Статус на съобщението
 */
export async function checkSMSStatus(messageId: string): Promise<any> {
  if (!BULKGATE_APP_ID || !BULKGATE_APP_TOKEN) {
    throw new Error('BulkGate API credentials are not configured');
  }

  try {
    const statusUrl = `https://portal.bulkgate.com/api/1.0/simple/status`;
    const payload = {
      application_id: BULKGATE_APP_ID,
      application_token: BULKGATE_APP_TOKEN,
      id: messageId
    };

    const response = await axios.post(statusUrl, payload);
    return response.data;
  } catch (error: any) {
    console.error('Error checking SMS status:', error.response?.data || error.message);
    throw new Error('Failed to check SMS status');
  }
}