import { NextRequest, NextResponse } from 'next/server';
import { connect } from '@/dbConfig/dbConfig';
import ScheduledSMS from '@/models/scheduledSMSModel';
import User from '@/models/userModel';
import { getDataFromToken } from '@/helpers/getDataFromToken';

// Свързваме се с базата данни
connect();

export async function GET(request: NextRequest) {
    try {
        // Извличаме ID на потребителя от токена
        const userId = await getDataFromToken(request);
        
        if (!userId) {
            return NextResponse.json({ error: "Не сте влезли в системата" }, { status: 401 });
        }
        
        // Извличаме всички насрочени SMS съобщения за този потребител
        const scheduledSMS = await ScheduledSMS.find({ createdBy: userId });
        
        return NextResponse.json({
            success: true,
            scheduledSMS
        });

    } catch (error: any) {
        console.error("Грешка при извличане на SMS съобщения:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        // Извличаме ID на потребителя от токена
        const userId = await getDataFromToken(request);
        
        if (!userId) {
            return NextResponse.json({ error: "Не сте влезли в системата" }, { status: 401 });
        }
        
        // Извличаме данните от заявката
        const reqBody = await request.json();
        const { phoneNumber, message, scheduledDate } = reqBody;
        
        // Валидираме данните
        if (!phoneNumber || !message || !scheduledDate) {
            return NextResponse.json({ error: "Липсват задължителни полета" }, { status: 400 });
        }
        
        // Валидираме телефонен номер
        if (!/^\+[1-9]\d{1,14}$/.test(phoneNumber)) {
            return NextResponse.json({ error: "Невалиден телефонен номер" }, { status: 400 });
        }

        // Проверяваме дали датата не е в миналото
        const scheduledDateTime = new Date(scheduledDate);
        if (scheduledDateTime < new Date()) {
            return NextResponse.json({ error: "Не може да планирате съобщение в миналото" }, { status: 400 });
        }

        // Създаваме ново планирано SMS съобщение
        const newSMS = new ScheduledSMS({
            phoneNumber,
            message,
            scheduledDate: scheduledDateTime,
            createdBy: userId
        });
        
        // Запазваме в базата данни
        await newSMS.save();
        
        // Актуализиране на статистиката на потребителя - увеличаваме общия брой SMS с 1
        await User.findByIdAndUpdate(
            userId,
            {
                $inc: { totalSMS: 1 }
            }
        );
        
        return NextResponse.json({
            message: "SMS съобщението е планирано успешно",
            success: true,
            sms: newSMS
        });

    } catch (error: any) {
        console.error("Грешка при планиране на SMS съобщение:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        // Проверяваме дали потребителят е влязъл в системата
        const userId = await getDataFromToken(request);
        
        if (!userId) {
            return NextResponse.json({ error: "Не сте влезли в системата" }, { status: 401 });
        }
        
        // Извличаме данните от заявката
        const reqBody = await request.json();
        const { smsId, phoneNumber, message, scheduledDate } = reqBody;
        
        // Валидираме данните
        if (!smsId || !phoneNumber || !message || !scheduledDate) {
            return NextResponse.json({ error: "Липсват задължителни полета" }, { status: 400 });
        }
        
        // Валидираме телефонен номер
        if (!/^\+[1-9]\d{1,14}$/.test(phoneNumber)) {
            return NextResponse.json({ error: "Невалиден телефонен номер" }, { status: 400 });
        }
        
        // Валидираме дължината на съобщението
        if (message.length > 1600) {
            return NextResponse.json({ error: "SMS съобщението не може да надвишава 1600 символа" }, { status: 400 });
        }

        // Проверяваме дали датата не е в миналото
        const scheduledDateTime = new Date(scheduledDate);
        if (scheduledDateTime < new Date()) {
            return NextResponse.json({ error: "Не може да планирате съобщение в миналото" }, { status: 400 });
        }

        // Намираме SMS съобщението в базата данни
        const sms = await ScheduledSMS.findById(smsId);
        
        if (!sms) {
            return NextResponse.json({ error: "SMS съобщението не е намерено" }, { status: 404 });
        }
        
        // Проверяваме дали потребителят е собственик на това съобщение
        if (sms.createdBy.toString() !== userId.toString()) {
            return NextResponse.json({ error: "Нямате право да редактирате това съобщение" }, { status: 403 });
        }
        
        // Проверяваме дали съобщението все още е в статус "pending"
        if (sms.status !== 'pending') {
            return NextResponse.json({ error: "Можете да редактирате само съобщения със статус 'pending'" }, { status: 400 });
        }
        
        // Актуализираме SMS съобщението
        sms.phoneNumber = phoneNumber;
        sms.message = message;
        sms.scheduledDate = scheduledDateTime;
        
        // Запазваме промените
        await sms.save();
        
        return NextResponse.json({
            message: "SMS съобщението е обновено успешно",
            success: true,
            sms
        });

    } catch (error: any) {
        console.error("Грешка при обновяване на SMS съобщение:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        // Извличаме ID на потребителя от токена
        const userId = await getDataFromToken(request);
        
        if (!userId) {
            return NextResponse.json({ error: "Не сте влезли в системата" }, { status: 401 });
        }
        
        // Извличане на ID на SMS от URL параметрите
        const url = new URL(request.url);
        const id = url.searchParams.get('id');
        
        if (!id) {
            return NextResponse.json({ error: "ID на SMS не е предоставено" }, { status: 400 });
        }
        
        console.log("Опит за изтриване на SMS с ID:", id);
        
        // Намиране на SMS в базата данни
        const sms = await ScheduledSMS.findById(id);
        
        if (!sms) {
            console.log("SMS не е намерено с ID:", id);
            return NextResponse.json({ error: "SMS съобщението не е намерено" }, { status: 404 });
        }
        
        // Проверка дали потребителят е собственик
        if (sms.createdBy.toString() !== userId.toString()) {
            console.log("Потребител няма право за изтриване:", userId, "SMS създаден от:", sms.createdBy);
            return NextResponse.json({ error: "Нямате право да изтриете това съобщение" }, { status: 403 });
        }
        
        // Изтриване на SMS от базата данни
        await ScheduledSMS.findByIdAndDelete(id);
        console.log("SMS успешно изтрито с ID:", id);
        
        return NextResponse.json({
            message: "SMS съобщението е изтрито успешно",
            success: true
        });
        
    } catch (error: any) {
        console.error("Грешка при изтриване на SMS съобщение:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}