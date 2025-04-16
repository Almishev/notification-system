import mongoose from 'mongoose';

// Используем тот же URI, что и в dbConfig.ts
const MONGO_URI = "mongodb+srv://almishev:asroma@cluster0.cyxfn.mongodb.net/notifications?retryWrites=true&w=majority&appName=Cluster0";

// Поделяем переменную состояния соединения с модулем dbConfig
import { connect } from "@/dbConfig/dbConfig";

/**
 * Функция для единого подключения к MongoDB
 * Использует ту же логику, что и в dbConfig.ts
 */
export async function connectToMongoDB() {
  // Просто вызываем функцию connect из dbConfig
  await connect();
}