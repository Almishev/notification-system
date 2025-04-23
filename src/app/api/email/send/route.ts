import { NextRequest, NextResponse } from 'next/server';
import { getDataFromToken } from '@/helpers/getDataFromToken';
import nodemailer from 'nodemailer';

// API маршрут за директно изпращане на имейл (без планиране)
export async function POST(request: NextRequest) {
  try {
    // Проверка дали потребителят е автентикиран
    const userId = await getDataFromToken(request);
    
    if (!userId) {
      return NextResponse.json({ error: "Не сте влезли в системата" }, { status: 401 });
    }

    // Извличане на данните от заявката
    const reqBody = await request.json();
    const { to, subject, text } = reqBody;
    
    // Валидация на данните
    if (!to || !Array.isArray(to) || to.length === 0) {
      return NextResponse.json({ error: "Невалиден получател" }, { status: 400 });
    }
    
    if (!subject) {
      return NextResponse.json({ error: "Липсва заглавие на имейла" }, { status: 400 });
    }
    
    if (!text) {
      return NextResponse.json({ error: "Липсва съдържание на имейла" }, { status: 400 });
    }
    
    // Конфигуриране на транспортер за nodemailer
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    
    // Подготвяне на имейл опциите
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'admin@pirinpixel.com',
      to: to.join(','),
      subject: subject,
      html: text
    };
    
    // Изпращане на имейл
    const mailResponse = await transporter.sendMail(mailOptions);
    
    return NextResponse.json({
      message: "Имейлът е изпратен успешно",
      success: true,
      messageId: mailResponse.messageId
    });
    
  } catch (error: any) {
    console.error("Грешка при изпращане на имейл:", error);
    return NextResponse.json({ error: error.message || "Възникна грешка при изпращане на имейла" }, { status: 500 });
  }
}