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
      
      // Process scheduled emails
      const emailResponse = await fetch('http://localhost:3000/api/email/send/email', {
        method: 'POST'
      });

      if (!emailResponse.ok) {
        throw new Error(`Email sending failed: ${emailResponse.statusText}`);
      }

      const emailResult = await emailResponse.json();
      console.log('Scheduled emails processed:', emailResult);

      // Process scheduled Telegram messages
      const telegramResponse = await fetch('http://localhost:3000/api/cron/send-scheduled-telegram', {
        method: 'GET'
      });

      if (!telegramResponse.ok) {
        throw new Error(`Telegram sending failed: ${telegramResponse.statusText}`);
      }

      const telegramResult = await telegramResponse.json();
      console.log('Scheduled Telegram messages processed:', telegramResult);

      return NextResponse.json({
        success: true,
        message: "Cron job executed successfully",
        emailResult,
        telegramResult
      });
    } catch (error: any) {
      console.error("Cron job error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  });

  global.cronJobInitialized = true;
}

export async function GET() {
  return NextResponse.json({ status: 'Cron job is running' });
} 