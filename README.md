# Ставка Заводчанина — Telegram Mini App

Мини-приложение (WebApp) под личный бренд Павла: прогнозы, аналитика, обучение и бонусы.

## Быстрый старт (без кода)

1. Распакуйте архив и загрузите папку на любой хостинг статических сайтов:
   - **Vercel** (рекомендуется): импортируйте как "Project from existing" → Framework "Other".
   - **Cloudflare Pages**, **Netlify**, **GitHub Pages** — тоже подойдут.
2. Получите публичный URL, например: `https://stavka-zavodchanina.vercel.app`.
3. В `data.js` замените:
   - `channelUrl` — на ссылку вашего канала.
   - При необходимости отредактируйте список `FORECASTS` и `ANALYTICS`.
4. В шапке мини-приложения (кнопка «Поставить по прогнозу») уже стоит ваша партнёрская ссылка.

### Подключение к Telegram-боту (минимально)
- Создайте бота в **@BotFather** → получите токен.
- В **Bot Settings → Menu Button → Set Web App** — добавьте URL вашего мини-приложения (если пункт доступен). 
- Либо отправляйте ссылку на мини-приложение в приветственном сообщении бота/канале.

### Подключение WebApp кнопки программно
Если позже решите добавить код бота, вот минимальный пример на Node.js (Express + Telegraf):

```js
import express from "express";
import { Telegraf, Markup } from "telegraf";

const BOT_TOKEN = process.env.BOT_TOKEN;
const WEBAPP_URL = "https://ВАШ_ДОМЕН";

const bot = new Telegraf(BOT_TOKEN);
bot.start((ctx)=>{
  return ctx.reply(
    "Добро пожаловать! Открывай мини‑приложение:",
    Markup.keyboard([
      Markup.button.webApp("Открыть WebApp", WEBAPP_URL)
    ]).resize()
  );
});

const app = express();
app.get("/", (_,res)=>res.send("OK"));
app.listen(3000, ()=>console.log("UP"));
bot.launch();
```

## Редактирование контента
- **Прогнозы**: `data.js` → `window.FORECASTS`.
- **Аналитика**: `data.js` → `window.ANALYTICS` (график строится Chart.js).
- **О проекте**: `data.js` → `window.PROJECT.owner.bio`.

## Брендинг
- Лого: замените `assets/logo.png` своим файлом (круглый; 512×512). 
- Иконка вкладки: `assets/favicon.png`.

## Правила
Материалы носят информационный характер и не являются индивидуальной рекомендацией. Играйте ответственно, 18+.
