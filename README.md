# Podvigi Number Bot v3 — Админ-меню только для админов
Админ-команды видны в меню ТОЛЬКО администраторам через scoped commands. Обычные пользователи видят только /start и /help.
Как работает: при /start бот ставит персональный список команд для текущего чата; есть /refresh_menu для админов.
Переменные окружения: BOT_TOKEN, CHANNEL, ADMIN_USERNAMES, TELEGRAM_WEBHOOK_SECRET, UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN.
