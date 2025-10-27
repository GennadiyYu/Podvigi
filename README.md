# Podvigi Number Bot (Vercel + Upstash) — v2 (без vercel.json)

## Важно
Файл `vercel.json` удалён. Vercel сам распознает функцию `/api/webhook.js`. Это фиксит ошибку:
`Function Runtimes must have a valid version...`

## Что делать
1) Загрузите проект в Vercel (Upload) или GitHub → Import в Vercel.
2) Добавьте переменные окружения (Production и Preview):
   - BOT_TOKEN
   - CHANNEL
   - ADMIN_USERNAMES
   - TELEGRAM_WEBHOOK_SECRET
   - UPSTASH_REDIS_REST_URL
   - UPSTASH_REDIS_REST_TOKEN
3) Redeploy.
4) Установите вебхук:
   https://api.telegram.org/bot<BOT_TOKEN>/setWebhook?url=https://<ваш-домен>.vercel.app/api/webhook&secret_token=<TELEGRAM_WEBHOOK_SECRET>
