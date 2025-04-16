import mongoose from 'mongoose';

// Схема за проследяване на статистика за съобщения
const messageStatsSchema = new mongoose.Schema({
    // Общ брой съобщения
    totalEmails: {
        type: Number,
        default: 0
    },
    totalSMS: {
        type: Number,
        default: 0
    },
    
    // Последна актуализация
    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Модела ще има само един запис, който ще актуализираме
const MessageStats = mongoose.models.messageStats || mongoose.model("messageStats", messageStatsSchema);

export default MessageStats;