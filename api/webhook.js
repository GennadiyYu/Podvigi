import { Telegraf } from "telegraf";
import { assignNumberIfNeeded, countIssued, whois } from "../lib/db.js";

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHANNEL = process.env.CHANNEL || "@podvigi";
const EXPORT_SECRET = process.env.EXPORT_SECRET || process.env.TELEGRAM_WEBHOOK_SECRET;
const PUBLIC_BASE_URL = process.env.PUBLIC_BASE_URL; // например, https://podvig.vercel.app
const ADMIN_USERNAMES = (process.env.ADMIN_USERNAMES || "")
  .split(",")
  .map((s) => s.trim().replace(/^@/, ""))
  .filter(Boolean);

const WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET;

if (!BOT_TOKEN) throw new Error("BOT_TOKEN is required");

const bot = new Telegraf(BOT_TOKEN, { handlerTimeout: 9000 });

function isAdmin(ctx) {
  const u = ctx.from;
  if (!u) return false;
  return ADMIN_USERNAMES.includes((u.username || "").replace(/^@/, ""));
}

// Экранируем текст для HTML сообщений (чтобы не ломались теги)
const esc = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

// ----- команды объявляем ОДИН раз -----
const defaultCommands = [
  { command: "start", description: "Начать / инструкция" },
  { command: "help", description: "Помощь" },
];

const adminCommands = [
  { command: "issued_count", description: "Сколько номеров выдано" },
  { command: "whois", description: "По номеру — кто это" },
  { command: "export_csv", description: "Скачать CSV пользователей" },
];
// --------------------------------------

async function setCommandsForChat(ctx, isAdminFlag) {
  const scope = { type: "chat", chat_id: ctx.chat.id };
  const commands = isAdminFlag ? [...defaultCommands, ...adminCommands] : defaultCommands;
  await ctx.telegram.setMyCommands(commands, { scope }).catch(() => {});
}

async function isSubscribed(ctx) {
  try {
    const res = await ctx.telegram.getChatMember(CHANNEL, ctx.from.id);
    return ["member", "administrator", "creator"].includes(res.status);
  } catch {
    return false;
  }
}

// Глобальные команды без админских
bot.telegram.setMyCommands(defaultCommands).catch(() => {});

bot.start(async (ctx) => {
  const admin = isAdmin(ctx);
  await setCommandsForChat(ctx, admin);

  const keyboard = [
    [{ text: "✅ Проверить подписку", callback_data: "check_sub" }],
  ];

  // только для админов — кнопка со ссылкой на CSV
  if (admin && PUBLIC_BASE_URL && EXPORT_SECRET) {
    const csvUrl = `${PUBLIC_BASE_URL}/api/export_csv?secret=${encodeURIComponent(EXPORT_SECRET)}`;
    keyboard.push([{ text: "⬇️ Скачать CSV", url: csvUrl }]);
  }

  await ctx.reply(
    `Приветствую! Я выдам Вам уникальный номер после проверки подписки на <b>${CHANNEL}</b>\n\n` +
      `1) Подпишитесь на канал ${CHANNEL}\n` +
      `2) Нажмите кнопку ниже для проверки подписки`,
    {
      parse_mode: "HTML",
      reply_markup: { inline_keyboard: keyboard },
    }
  );
});

bot.command("export_csv", async (ctx) => {
  if (!isAdmin(ctx)) return;

  if (!PUBLIC_BASE_URL || !EXPORT_SECRET) {
    return ctx.reply("Экспорт временно недоступен: не настроены PUBLIC_BASE_URL или EXPORT_SECRET.");
  }

  const csvUrl = `${PUBLIC_BASE_URL}/api/export_csv?secret=${encodeURIComponent(EXPORT_SECRET)}`;
  await ctx.reply(`Скачать CSV: ${csvUrl}`);
});

bot.command("refresh_menu", async (ctx) => {
  if (!isAdmin(ctx)) return;
  await setCommandsForChat(ctx, true);
  await ctx.reply("Меню администратора обновлено ✅");
});

bot.action("check_sub", async (ctx) => {
  if (!(await isSubscribed(ctx))) {
    await ctx.editMessageText(
      `Подписка не найдена. Убедитесь, что Вы подписаны на <b>${CHANNEL}</b> и попробуйте ещё раз.`,
      {
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [[{ text: "✅ Проверить подписку", callback_data: "check_sub" }]],
        },
      }
    );
    return;
  }

  const number = await assignNumberIfNeeded(ctx.from);

  await ctx.editMessageText(
    `Подписка подтверждена! Ваш уникальный номер: <b>#${esc(number)}</b>\n\n` +
      `Номер закреплён за Вашим аккаунтом и повторно выдан не будет.`,
    { parse_mode: "HTML" }
  );

  await ctx.reply(
    "🎉 Спасибо за участие! Розыгрыш призов ежедневно с 31 октября по 8 ноября в 12:00 мск в @podvigi — не пропустите!"
  );
});

bot.command("issued_count", async (ctx) => {
  if (!isAdmin(ctx)) return;
  const total = await countIssued();
  await ctx.reply(`Выдано номеров: <b>${esc(total)}</b>`, { parse_mode: "HTML" });
});

bot.command("whois", async (ctx) => {
  if (!isAdmin(ctx)) return;

  const text = ctx.message.text || "";
  const m = text.match(/\/(?:whois)\s+(\d+)/i);
  if (!m) return ctx.reply("Использование: /whois <номер>");

  const number = m[1];
  const data = await whois(number);
  if (!data) return ctx.reply("Пользователь с таким номером не найден.");

  const { userId, profile } = data;

  const uname = profile?.username
    ? `@${esc(profile.username)}`
    : "&lt;без ника&gt;";

  const nameRaw = [profile?.first_name, profile?.last_name]
    .filter(Boolean)
    .join(" ");
  const name = nameRaw ? esc(nameRaw) : "&lt;без имени&gt;";

  await ctx.reply(
    `Номер <b>#${esc(number)}</b> выдан пользователю:\n` +
      `Имя: ${name}\n` +
      `Ник: ${uname}\n` +
      `ID: <code>${esc(userId)}</code>\n` +
      `В базе с: ${esc(profile?.created_at || "—")} UTC`,
    { parse_mode: "HTML" }
  );
});

// Обязательный экспорт обработчика для Vercel (ESM)
export default async function handler(req, res) {
  if (WEBHOOK_SECRET) {
    const header = req.headers["x-telegram-bot-api-secret-token"];
    if (header !== WEBHOOK_SECRET) {
      return res.status(401).send("Invalid secret");
    }
  }
  if (req.method === "POST") {
    try {
      await bot.handleUpdate(req.body);
      return res.status(200).json({ ok: true });
    } catch (e) {
      console.error("handleUpdate error", e);
      return res.status(500).json({ ok: false });
    }
  }
  return res.status(200).send("OK");
}
