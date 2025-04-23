import { NextResponse } from 'next/server';
import cron from 'node-cron';

declare global {
  var cronJobInitialized: boolean;
}

// Initialize cron job
if (!global.cronJobInitialized) {
  cron.schedule('* * * * *', async () => {
    try {
      console.log('Running scheduled messages check...');
      
      // Get domain from env or use relative paths
      const domain = process.env.DOMAIN || '';
      
      // Process scheduled emails - използваме новия ендпоинт
      const emailResponse = await fetch(`${domain}/api/cron/send-scheduled-emails`, {
        method: 'GET'
      });

      if (!emailResponse.ok) {
        throw new Error(`Email sending failed: ${emailResponse.statusText}`);
      }

      const emailResult = await emailResponse.json();
      console.log('Scheduled emails processed:', emailResult);

      // Process scheduled SMS messages - using relative path
      const SMSResponse = await fetch(`${domain}/api/cron/send-scheduled-sms`, {
        method: 'GET'
      });

      if (!SMSResponse.ok) {
        throw new Error(`SMS sending failed: ${SMSResponse.statusText}`);
      }

      const SMSResult = await SMSResponse.json();
      console.log('Scheduled SMS messages processed:', SMSResult);

      return NextResponse.json({
        success: true,
        message: "Cron job executed successfully",
        emailResult,
        SMSResult
      });
    } catch (error: any) {
      console.error("Cron job error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  });

  global.cronJobInitialized = true;
}

export async function GET() {
  return NextResponse.json({
    message: "Cron job is running",
    initialized: global.cronJobInitialized
  });
}