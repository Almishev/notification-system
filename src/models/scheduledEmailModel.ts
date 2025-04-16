import mongoose from 'mongoose';

const scheduledEmailSchema = new mongoose.Schema({
    recipients: {
        type: [String],
        required: [true, "Recipients are required"]
    },
    subject: {
        type: String,
        required: [true, "Subject is required"]
    },
    message: {
        type: String,
        required: [true, "Message is required"]
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
        enum: ['pending', 'processing', 'failed', 'sent'],
        default: 'pending'
    },
    error: {
        type: String,
        default: null
    }
}, { timestamps: true });

const ScheduledEmail = mongoose.models.scheduledEmails || mongoose.model("scheduledEmails", scheduledEmailSchema);

export default ScheduledEmail; 