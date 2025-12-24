import express from 'express';
import cors from 'cors';
import { sequelize } from './config/database.js';
import authRoutes from './routes/auth.js';
import itemRoutes from './routes/item.js';
import './models/index.js';

const app = express();
app.use(cors());
app.use(express.json());

// Роуты
app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes); // Поменяли на items для логики

const PORT = 3000;

// Функция для безопасного запуска с повторными попытками подключения к БД
async function startServer() {
  let connected = false;
  let retries = 10; // 10 попыток

  while (!connected && retries > 0) {
    try {
      // Проверяем соединение
      await sequelize.authenticate();
      // Синхронизируем модели
      await sequelize.sync({ alter: true });
      
      console.log('✅ Database connected and synced');
      connected = true;

      app.listen(PORT, '0.0.0.0', () => {
        console.log(`🚀 Server is running on http://0.0.0.0:${PORT}`);
      });
      
    } catch (err: any) {
      retries -= 1;
      console.error(`❌ Connection failed. Retries left: ${retries}`);
      console.error(`Reason: ${err.message}`);
      
      // Ждем 5 секунд перед следующей попыткой
      await new Promise(res => setTimeout(res, 5000));
    }
  }

  if (!connected) {
    console.error('Could not connect to the database. Exiting...');
    process.exit(1);
  }
}

startServer();