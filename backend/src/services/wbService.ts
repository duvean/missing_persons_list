import isPuppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

const puppeteer = isPuppeteer as any;
puppeteer.use(StealthPlugin());

export const parseWbItem = async (input: string) => {

    const startTime = performance.now();

    const match = input.match(/(\d+)/);
    if (!match) throw new Error('Артикул не найден');
    const input_article = match[0];
    const url = `https://www.wildberries.ru/catalog/${input_article}/detail.aspx`;

    const browser = await (puppeteer as any).launch({
        headless: "new",
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-blink-features=AutomationControlled',
            '--window-size=1920,1080'
        ]
    });

    const page = await browser.newPage();

    try {
        await page.setViewport({ width: 1920, height: 1080 });
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        console.log(`[Parser] Переход на ${url}`);
        
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

        try {
            await page.waitForSelector('[class*="productPageContent"]', { timeout: 20000 });
        } catch (e) {
            console.log("Контент не появился по селектору, пробуем скролл...");
        }

        await page.evaluate(() => window.scrollBy(0, 400));
        await new Promise(r => setTimeout(r, 5000));

        await page.screenshot({ path: '/app/wb_debug.png' });

        const result = await page.evaluate(() => {
            const cleanPrice = (t: string | null) => t ? parseInt(t.replace(/[^\d]/g, '')) : 0;

            const nameEl =     document.querySelector('h1') || 
                               document.querySelector('[class*="productTitle"]');

            const priceEl =    document.querySelector('ins') || 
                               document.querySelector('[class*="priceBlockPrice"]') ||
                               document.querySelector('[class*="actual-price"]');

            const oldPriceEl = document.querySelector('del') || 
                               document.querySelector('[class*="priceBlockOldPrice"]');

            const imgEl =      document.querySelector('.swiper-slide-active img') || 
                               document.querySelector('[class*="mainSlide"] img') ||
                               document.querySelector('[class*="zoom-image"] img');

            return {
                name: nameEl?.textContent?.trim() || null,
                currentPrice: cleanPrice(priceEl?.textContent || null),
                oldPrice: cleanPrice(oldPriceEl?.textContent || null),
                imageUrl: (imgEl as HTMLImageElement)?.src || ""
            };
        });

        if (!result.name || !result.currentPrice) {
            throw new Error("Не удалось извлечь данные (пустые поля после ожидания)");
        }

        const endTime = performance.now();
        const duration = ((endTime - startTime) / 1000).toFixed(2);
        console.log(`[⏱] Товар ${input_article} обработан за ${duration} сек.`);

        return {
            article: input_article,
            ...result
        };

    } catch (e: any) {
        const endTime = performance.now();
        const duration = ((endTime - startTime) / 1000).toFixed(2);
        console.error(`[Parser Error] ${e.message}`);
        console.error(`[⏱] Ошибка через ${duration} сек: ${e.message}`);
        try {
            await page.screenshot({ path: '/app/wb_debug.png' });
            console.log("Аварийный скриншот сохранен: /app/wb_debug.png");
        } catch (screenshotError) {
            console.error("Не удалось создать даже аварийный скриншот");
        }
        throw e;
    } finally {
        await browser.close();
    }
};