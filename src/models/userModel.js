import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "Please provide a username"],
        unique: true,
    },
    email: {
        type: String,
        required: [true, "Please provide an email"],
        unique: true,
    },
    password: {
        type: String,
        required: [true, "Please provide a password"],
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    // Опростена статистика - само общ брой имейли
    totalEmails: {
        type: Number,
        default: 0
    },
    // Опростена статистика - само общ брой SMS
    totalSMS: {
        type: Number,
        default: 0
    },
    forgotPasswordToken: String,
    forgotPasswordTokenExpiry: Date,
    verifyToken: String,
    verifyTokenExpiry: Date,
}, { timestamps: true });

const User = mongoose.models.users || mongoose.model("users", userSchema);

export default User;