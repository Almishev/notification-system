import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import ScheduledEmail from "@/models/scheduledEmailModel";
import ScheduledSMS from "@/models/scheduledSMSModel";
import { NextRequest, NextResponse } from "next/server";

// Гарантираме, че сме свързани с базата данни
connect();

export async function GET(request: NextRequest) {
    try {
        // Извличаме всички потребители от базата данни
        const users = await User.find({});
        
        let updatedCount = 0;
        let results = [];

        // За всеки потребител, изчисляваме броя на имейлите и SMS-ите
        for (const user of users) {
            const userId = user._id;
            
            // Изчисляваме броя на имейлите за този потребител
            const emailCount = await ScheduledEmail.countDocuments({ createdBy: userId });
            
            // Изчисляваме броя на SMS-ите за този потребител
            const smsCount = await ScheduledSMS.countDocuments({ createdBy: userId });
            
            // Обновяваме потребителя с новите полета и запазваме обновения документ
            const updatedUser = await User.findByIdAndUpdate(
                userId, 
                {
                    totalEmails: emailCount,
                    totalSMS: smsCount
                },
                { new: true } // Връщаме обновения документ
            );
            
            updatedCount++;
            results.push({
                userId: userId.toString(),
                email: user.email,
                totalEmails: emailCount,
                totalSMS: smsCount,
                updated: updatedUser.totalEmails === emailCount && updatedUser.totalSMS === smsCount
            });
        }
        
        return NextResponse.json({
            success: true,
            message: `Успешно актуализирани ${updatedCount} потребителски документа със статистика за имейли и SMS`,
            results
        });
    } catch (error: any) {
        console.error("Грешка при миграция на потребителската статистика:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}