import isPuppeteer from 'puppeteer-extra';
const puppeteer = isPuppeteer as any;
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

// Подключаем плагин скрытия автоматизации
puppeteer.use(StealthPlugin());

export const parseWbItem = async (input: string) => {
    const match = input.match(/(\d+)/);
    if (!match) throw new Error('Артикул не найден');
    const article = match[0];
    const url = `https://www.wildberries.ru/catalog/${article}/detail.aspx`;

    const browser = await (puppeteer as any).launch({
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-blink-features=AutomationControlled'
        ]
    });

    const page = await browser.newPage();

    try {
        await page.setViewport({ width: 1920, height: 1080 });
        
        // Маскируемся под обычный Chrome
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        console.log(`[Parser] Переход на ${url}`);
        
        // Переходим с долгим ожиданием
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 90000 });

        // Ждем 5 секунд, чтобы React прогрузил данные
        await new Promise(r => setTimeout(r, 5000));

        // Пробуем извлечь данные
        const result = await page.evaluate(() => {
            const getText = (selector: string) => document.querySelector(selector)?.textContent?.trim() || "";
            const cleanPrice = (text: string) => parseInt(text.replace(/[^\d]/g, '')) || 0;

            // 1. Находим название
            const name = document.querySelector('h1')?.textContent || 
                        document.querySelector('h3[class*="productTitle"]')?.textContent;

            // 2. Находим цены
            const currentPrice = cleanPrice(document.querySelector('h2[class*="mo-typography"]')?.textContent || "");
            const oldPrice = cleanPrice(document.querySelector('span[class*="priceBlockOldPrice"]')?.textContent || "");
            
            // 3. Находим картинку товара
            // Ищем img внутри активного слайда (swiper-slide-active)
            const activeSlideImg = document.querySelector('.swiper-slide-active img') as HTMLImageElement;
            
            // Если по какой-то причине активный слайд не найден, пробуем найти по классу контейнера, который вы дали
            const fallbackImg = document.querySelector('.mainSlide--TIHn4 img') as HTMLImageElement;
            
            let imageUrl = "";
            if (activeSlideImg && activeSlideImg.src.includes('basket-')) {
                imageUrl = activeSlideImg.src;
            } else if (fallbackImg) {
                imageUrl = fallbackImg.src;
            }

            return {
                name: name?.trim() || null,
                currentPrice,
                oldPrice,
                imageUrl: imageUrl
            };
        });

        if (!result.name || result.currentPrice === 0) {
            // Если данные не найдены, делаем скриншот для отладки перед падением
            await page.screenshot({ path: '/app/wb_debug.png' });
            throw new Error("Не удалось извлечь основные данные товара (пустые поля)");
        }

        return {
            wbId: parseInt(article),
            ...result
        };

    } catch (e: any) {
        console.error(`[Parser Error] ${e.message}`);
        // Аварийный скриншот
        try {
            await page.screenshot({ path: '/app/wb_debug.png' });
            console.log("📸 Аварийный скриншот сохранен: /app/wb_debug.png");
        } catch (screenshotError) {
            console.error("Не удалось создать даже аварийный скриншот");
        }
        throw e;
    } finally {
        await browser.close();
    }
};