import { Context, Next } from "hono"

export const cacheControlMiddleware = async (c: Context, next: Next) => {
  const { cache } = c.req.query()
  const cacheDuration = Math.max(1, parseInt(cache || "3600")) // Default to 1 hour
  await next()
  c.res.headers.set("Cache-Control", `public, max-age=${cacheDuration}`)
}
