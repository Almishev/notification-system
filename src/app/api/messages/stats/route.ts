import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import ScheduledEmail from "@/models/scheduledEmailModel";
import ScheduledSMS from "@/models/scheduledSMSModel";
import { getDataFromToken } from "@/helpers/getDataFromToken";

connect();

export async function GET(request: NextRequest) {
    try {
        // Проверяваме дали потребителят е влязъл в системата
        const userId = await getDataFromToken(request);
        
        if (!userId) {
            return NextResponse.json({ error: "Не сте влезли в системата" }, { status: 401 });
        }

        // Намираме потребителя
        let user = await User.findById(userId);
        if (!user) {
            return NextResponse.json({ error: "Потребителят не е намерен" }, { status: 404 });
        }

        // Изчисляваме действителния брой имейли и SMS за този потребител
        const emailCount = await ScheduledEmail.countDocuments({ createdBy: userId });
        const smsCount = await ScheduledSMS.countDocuments({ createdBy: userId });
        
        // Винаги обновяваме потребителя с актуалните стойности и получаваме обновения документ
        user = await User.findByIdAndUpdate(
            userId, 
            {
                $set: {
                    totalEmails: emailCount,
                    totalSMS: smsCount
                }
            },
            { new: true } // Връщаме обновения документ
        );

        return NextResponse.json({
            success: true,
            stats: {
                // Връщаме актуализираната статистика
                totalEmails: user.totalEmails || 0,
                totalSMS: user.totalSMS || 0,
                
                // Информация за последно обновяване
                lastUpdated: user.updatedAt
            }
        });

    } catch (error: any) {
        console.error("Грешка при получаване на статистика:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}