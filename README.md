# Podvigi Number Bot (Vercel + Upstash)

## Что нужно создать
- Репозиторий на GitHub с этими файлами
- Аккаунт на Vercel (Free)
- Аккаунт на Upstash Redis (Free)

## Upstash Redis
- Создай database (REST)
- Скопируй:
  - UPSTASH_REDIS_REST_URL
  - UPSTASH_REDIS_REST_TOKEN

## Переменные окружения в Vercel
- BOT_TOKEN = 123456:ABC... (токен бота)
- CHANNEL = @podvigi (или -100...)
- ADMIN_USERNAMES = yudanov_g
- TELEGRAM_WEBHOOK_SECRET = любой_секрет (например, podvigi_secret_123)
- UPSTASH_REDIS_REST_URL = ...
- UPSTASH_REDIS_REST_TOKEN = ...

## Деплой на Vercel
- Импортируй репозиторий → Deploy

## Установка вебхука Telegram
Открой в браузере:
https://api.telegram.org/bot<BOT_TOKEN>/setWebhook?url=https://<ВАШ-ДОМЕН>.vercel.app/api/webhook&secret_token=<TELEGRAM_WEBHOOK_SECRET>

## Добавь бота админом в канал @podvigi
Дай право “просматривать участников”.

## Проверка
- /start → кнопка «Проверить подписку»
- При подписке выдаётся уникальный номер
- /issued_count и /whois доступны админам (username из ADMIN_USERNAMES)
