import mongoose from 'mongoose';

// Дефиниране на интерфейс за параметъра на message функцията
interface ValidatorProps {
    value: string;
    path: string;
}

const scheduledSMSSchema = new mongoose.Schema({
    phoneNumber: {
        type: String,
        required: [true, "Phone number is required"],
        validate: {
            validator: function(v: string) {
                // Валидация за международен формат на телефонен номер
                return /^\+[1-9]\d{1,14}$/.test(v);
            },
            message: (props: ValidatorProps) => `${props.value} не е валиден телефонен номер!`
        }
    },
    message: {
        type: String,
        required: [true, "Message is required"],
        maxlength: [1600, "SMS message cannot exceed 1600 characters"]
    },
    scheduledDate: {
        type: Date,
        required: [true, "Scheduled date is required"]
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: [true, "User ID is required"]
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'sent', 'failed'],
        default: 'pending'
    },
    apiResponse: {
        type: Object,
        default: null
    },
    error: {
        type: String,
        default: null
    }
}, { timestamps: true });

const ScheduledSMS = mongoose.models.scheduledSMS || mongoose.model("scheduledSMS", scheduledSMSSchema);

export default ScheduledSMS;