import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// Простейшее экранирование CSV
function csvEscape(v) {
  const s = String(v ?? "");
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export default async function handler(req, res) {
  try {
    // Проверяем секрет в query: ?secret=...
    const url = new URL(req.url, `http://${req.headers.host}`);
    const secret = url.searchParams.get("secret");
    if (!secret || secret !== (process.env.EXPORT_SECRET || process.env.TELEGRAM_WEBHOOK_SECRET)) {
      return res.status(401).send("Unauthorized");
    }

    // Собираем всех выданных пользователей
    const userIds = await redis.smembers("issued_users"); // множество user_id
    const rows = [];

    for (const uid of userIds) {
      const [number, profile] = await Promise.all([
        redis.get(`user:${uid}:number`),
        redis.hgetall(`user:${uid}:profile`),
      ]);

      rows.push({
        number: Number(number) || "",
        user_id: uid,
        username: profile?.username || "",
        first_name: profile?.first_name || "",
        last_name: profile?.last_name || "",
        created_at: profile?.created_at || "",
      });
    }

    // Сортируем по номеру
    rows.sort((a, b) => (a.number || 0) - (b.number || 0));

    // Формируем CSV
    const header = ["number", "user_id", "username", "first_name", "last_name", "created_at"];
    const lines = [header.join(",")];
    for (const r of rows) {
      lines.push([
        csvEscape(r.number),
        csvEscape(r.user_id),
        csvEscape(r.username),
        csvEscape(r.first_name),
        csvEscape(r.last_name),
        csvEscape(r.created_at),
      ].join(","));
    }
    const csv = lines.join("\n");

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", 'attachment; filename="podvigi_users.csv"');
    return res.status(200).send(csv);
  } catch (e) {
    console.error("export_csv error", e);
    return res.status(500).send("Export failed");
  }
}
