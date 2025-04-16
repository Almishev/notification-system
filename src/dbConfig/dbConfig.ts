import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Зареждаме .env файла експлицитно
dotenv.config();

// Хардкодираме MongoDB Atlas URI
const MONGO_URI = "mongodb+srv://almishev:asroma@cluster0.cyxfn.mongodb.net/notifications?retryWrites=true&w=majority&appName=Cluster0";

// Singleton за състоянието на връзката
let isConnected = false;

export async function connect() {
    if (isConnected) {
        console.log('MongoDB connection already established');
        return;
    }

    try {
        console.log("Attempting to connect to MongoDB with URI");
        
        await mongoose.connect(MONGO_URI);
        isConnected = true;
        
        const connection = mongoose.connection;

        connection.on('connected', () => {
            console.log('MongoDB connected successfully');
        })

        connection.on('error', (err) => {
            console.log('MongoDB connection error. Please make sure MongoDB is running. ' + err);
            isConnected = false;
        })

    } catch (error) {
        console.log('Something goes wrong!');
        console.log(error);
        isConnected = false;
    }
}