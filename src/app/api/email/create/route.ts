import { connect } from "@/dbConfig/dbConfig";
import { NextRequest, NextResponse } from "next/server";
import ScheduledEmail from "@/models/scheduledEmailModel";
import User from "@/models/userModel";
import { getDataFromToken } from "@/helpers/getDataFromToken";

connect();

export async function POST(request: NextRequest) {
    try {
        const reqBody = await request.json();
        const { 
            recipients, 
            subject, 
            message, 
            scheduledDate
        } = reqBody;

        const userId = await getDataFromToken(request);
        if (!userId) {
            return NextResponse.json({ error: "Неавторизиран" }, { status: 401 });
        }

        if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
            return NextResponse.json({ error: "Трябва да има поне един получател" }, { status: 400 });
        }

        const emailList = Array.isArray(recipients) ? recipients : [recipients];

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const invalidEmails = emailList.filter(email => !emailRegex.test(email));
        if (invalidEmails.length > 0) {
            return NextResponse.json({ 
                error: `Невалиден формат на имейл за: ${invalidEmails.join(', ')}` 
            }, { status: 400 });
        }

        if (!subject || !message) {
            return NextResponse.json({ error: "Заглавие и съобщение са задължителни" }, { status: 400 });
        }

        if (!scheduledDate || new Date(scheduledDate) < new Date()) {
            return NextResponse.json({ error: "Трябва да се въведе валидна бъдеща дата за изпращане" }, { status: 400 });
        }

        const newEmail = new ScheduledEmail({
            recipients: emailList,
            subject,
            message,
            scheduledDate: new Date(scheduledDate),
            createdBy: userId,
            status: 'pending'
        });

        await newEmail.save();
        
        // Актуализиране на статистиката на потребителя - увеличаваме общия брой имейли с 1
        await User.findByIdAndUpdate(
            userId,
            {
                $inc: { totalEmails: 1 }
            }
        );

        return NextResponse.json({
            message: "Имейлът е планиран успешно",
            success: true,
            email: newEmail
        });

    } catch (error: any) {
        console.error("Грешка при планиране на имейл:", error);
        return NextResponse.json({ error: error.message || "Грешка при планиране на имейл" }, { status: 500 });
    }
}
