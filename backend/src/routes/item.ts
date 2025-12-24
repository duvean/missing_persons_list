import { Router } from 'express';
import { Item } from '../models/Item.js';
import { authenticateToken } from '../middleware/auth.js';
import { parseWbItem } from '../services/wbService.js';

const router = Router();

// Получить все товары пользователя
router.get('/', authenticateToken, async (req: any, res) => {
    const items = await Item.findAll({ where: { userId: req.user.userId } });
    res.json(items);
});

// Добавить товар по ссылке
router.post('/', authenticateToken, async (req: any, res) => {
    try {
        const { url } = req.body; // Пользователь шлет ссылку
        
        // 1. Парсим данные с WB
        const wbData = await parseWbItem(url);

        // 2. Проверяем, не добавлен ли уже этот товар
        const existing = await Item.findOne({ where: { wbId: wbData.wbId, userId: req.user.userId } });
        if (existing) {
            // Если есть, можем обновить цену и остатки
            await existing.update(wbData);
            return res.json(existing);
        }

        // 3. Создаем новый товар
        const newItem = await Item.create({
            ...wbData,
            userId: req.user.userId
        });

        res.json(newItem);
    } catch (error: any) {
        console.error(error);
        res.status(400).json({ error: error.message || 'Ошибка парсинга' });
    }
});

// Удалить товар
router.delete('/:id', authenticateToken, async (req: any, res) => {
    await Item.destroy({ where: { id: req.params.id, userId: req.user.userId } });
    res.json({ success: true });
});

export default router;