import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

let redis: Redis | undefined;
let redisAvailable: boolean | undefined;
const limiters = new Map<string, Ratelimit>();

function isRedisAvailable(): boolean {
  if (redisAvailable === undefined) {
    redisAvailable = Boolean(process.env.UPSTASH_REDIS_REST_URL);
  }
  return redisAvailable;
}

function getLimiter(max: number, windowMs: number): Ratelimit | null {
  if (!isRedisAvailable()) return null;
  const configKey = `${max}:${windowMs}`;
  if (!limiters.has(configKey)) {
    if (!redis) redis = Redis.fromEnv();
    limiters.set(
      configKey,
      new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(max, `${windowMs}ms`),
        prefix: `ratelimit:${configKey}`,
        analytics: true,
      }),
    );
  }
  return limiters.get(configKey)!;
}

export async function rateLimit({
  key,
  max = 30,
  windowMs = 60000,
}: {
  key: string;
  max?: number;
  windowMs?: number;
}) {
  const ratelimit = getLimiter(max, windowMs);
  if (!ratelimit) {
    return { allowed: true, remaining: max, reset: Date.now() + windowMs };
  }
  const { success, limit, remaining, reset } = await ratelimit.limit(key);
  return {
    allowed: success,
    remaining,
    reset,
  };
}
