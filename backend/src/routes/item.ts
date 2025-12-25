import { Router } from 'express';
import { Item } from '../models/Item.js';
import { authenticateToken } from '../middleware/auth.js';
import { parseWbItem } from '../services/wbService.js';
import { parseOzonItem } from '../services/ozonService.js';

const router = Router();

router.get('/', authenticateToken, async (req: any, res) => {
    const items = await Item.findAll({ where: { userId: req.user.userId } });
    res.json(items);
});

router.post('/', authenticateToken, async (req: any, res) => {
    try {
        const { url, targetPrice } = req.body;
        const currentUserId = req.user?.userId || req.user?.id || req.user?.sub;

        if (!currentUserId) {
            throw new Error("ID пользователя не найден в токене. Проверьте auth middleware.");
        }

        let itemData;
        if (url.includes('ozon.ru')) {
            itemData = await parseOzonItem(url);
        } else {
            itemData = await parseWbItem(url);
        }

        const article = itemData.article || (itemData as any).wbId;

        const existing = await Item.findOne({ 
            where: { 
                article: article, 
                userId: currentUserId 
            } 
        });

        if (existing) {
            await existing.update({
                ...itemData,
                article: article
            });
            return res.json(existing);
        }

        const newItem = await Item.create({
            ...itemData,
            article: article,
            targetPrice: targetPrice ? parseInt(targetPrice) : null,
            userId: currentUserId
        });

        res.json(newItem);
    } catch (error: any) {
        console.error('Ошибка в POST /items:', error);
        res.status(400).json({ error: error.message || 'Ошибка при добавлении товара' });
    }
});

router.delete('/:id', authenticateToken, async (req: any, res) => {
    try {
        await Item.destroy({ where: { id: req.params.id, userId: req.user.userId } });
        res.json({ success: true });
    } catch (error: any) {
        res.status(500).json({ error: 'Ошибка при удалении' });
    }
});

export default router;