const store = new Map<string, { count: number; reset: number }>();

export function rateLimit({
  key,
  max = 30,
  windowMs = 60000,
}: {
  key: string;
  max?: number;
  windowMs?: number;
}) {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.reset) {
    store.set(key, { count: 1, reset: now + windowMs });
    return { allowed: true, remaining: max - 1, reset: now + windowMs };
  }

  entry.count++;

  if (entry.count > max) {
    return { allowed: false, remaining: 0, reset: entry.reset };
  }

  return { allowed: true, remaining: max - entry.count, reset: entry.reset };
}
