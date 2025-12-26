import cron from 'node-cron';
import { Item } from '../models/Item.js';
import { User } from '../models/User.js';
import { parseWbItem } from './wbService.js';
import { sendPriceNotification } from './telegramService.js';

export const initCronTasks = () => {
    // '0 * * * *' - каждый час
    cron.schedule('*/2 * * * *', async () => {
        const globalStartTime = performance.now();
        console.log('--- Запуск фонового обновления цен ---');
    
        try {
            let itemsToProcess = await Item.findAll();
            let attempt = 1;
            const MAX_ATTEMPTS = 3;

            while (itemsToProcess.length > 0 && attempt <= MAX_ATTEMPTS) {
                if (attempt > 1) {
                    console.log(`--- Повторная попытка ${attempt} для ${itemsToProcess.length} товаров ---`);
                    await new Promise(res => setTimeout(res, 10000));
                }

                const failedItems: any[] = [];

                for (const item of itemsToProcess) {
                    const itemStartTime = performance.now();
                    try {
                        console.log(`    [Попытка ${attempt}] Обновление: ${item.article}`);
    
                        const freshData = await parseWbItem(item.article.toString());

                        if (item.targetPrice && freshData.currentPrice <= item.targetPrice) {
                            console.log(`    Цена упала! "${item.name}": ${freshData.currentPrice} ₽ (Порог: ${item.targetPrice})`);
                            const user = await User.findByPk(item.userId);
                            if (user?.telegramId) {
                                const message = `
🔔  <b>Снижение цены!</b>
         <b>Товар:</b> ${item.name}
         <b>Новая цена:</b> ${freshData.currentPrice} ₽
         <b>Ваш порог:</b> ${item.targetPrice} ₽
         <a href="https://www.wildberries.ru/catalog/${item.article}/detail.aspx">Перейти к товару</a>`;
         
                                await sendPriceNotification(user.telegramId, message);
                            }
                        }

                        await item.update({
                            currentPrice: freshData.currentPrice,
                            oldPrice: freshData.oldPrice,
                            name: freshData.name
                        });

                        const itemEndTime = performance.now();
                        const itemDuration = ((itemEndTime - itemStartTime) / 1000).toFixed(2);
                        console.log(`    [⏱] Товар ${item.article} обновлен за ${itemDuration} сек.`);

                        await new Promise(res => setTimeout(res, 5000));

                    } catch (itemError: any) {
                        const itemEndTime = performance.now();
                        const itemDuration = ((itemEndTime - itemStartTime) / 1000).toFixed(2);
                        console.error(`    [⏱] Ошибка обхода ${item.article} после ${itemDuration} сек: ${itemError.message}`);
                        failedItems.push(item);
                    }
                }
                itemsToProcess = failedItems;
                attempt++;
            }

            if (itemsToProcess.length > 0) {
                console.error(`    Не удалось обновить ${itemsToProcess.length} товаров после ${MAX_ATTEMPTS} попыток.`);
            }

        } catch (error) {
            console.error('Критическая ошибка в крон-задаче:', error);
        }

        const globalEndTime = performance.now();
        const totalDuration = ((globalEndTime - globalStartTime) / 1000).toFixed(2);
        console.log(`--- Цикл обновления завершён за ${totalDuration} сек ---`);
    });
};