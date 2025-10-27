import { Redis } from "@upstash/redis";

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export async function getAssignedNumber(userId) {
  return await redis.get(`user:${userId}:number`);
}

export async function assignNumberIfNeeded(user) {
  const keyNum = `user:${user.id}:number`;
  const existing = await redis.get(keyNum);
  if (existing) return existing;

  // next unique number
  const next = await redis.incr("next_number");

  // assign if not exists (race-safe)
  const ok = await redis.set(keyNum, String(next), { nx: true });
  if (ok !== "OK") {
    return await redis.get(keyNum);
  }

  await redis.set(`number:${next}:user`, String(user.id));
  await redis.hmset(`user:${user.id}:profile`, {
    id: String(user.id),
    username: user.username || "",
    first_name: user.first_name || "",
    last_name: user.last_name || "",
    created_at: new Date().toISOString(),
  });
  await redis.sadd("issued_users", String(user.id));
  return String(next);
}

export async function countIssued() {
  return await redis.scard("issued_users");
}

export async function whois(number) {
  const userId = await redis.get(`number:${number}:user`);
  if (!userId) return null;
  const profile = await redis.hgetall(`user:${userId}:profile`);
  return { userId, profile };
}
