import { cors } from "hono/cors"
import { logger } from "hono/logger"
import { prettyJSON } from "hono/pretty-json"
import { Hono } from "hono/tiny"
import { providers } from "./apis"
import { bufferMiddleware, cacheControlMiddleware, loggingMiddleware } from "./middlewares"
import { InvalidError } from "./errors"
import { getBadge } from "./utils"

const app = new Hono().use(
  prettyJSON(),
  logger(),
  cors({
    origin: "*",
    credentials: true,
    allowHeaders: [
      "X-CSRF-Token",
      "X-Requested-With",
      "Accept",
      "Accept-Version",
      "Content-Length",
      "Content-MD5",
      "Content-Type",
      "Date",
      "X-Api-Version",
      "x-lobe-trace",
      "x-lobe-plugin-settings",
      "x-lobe-chat-auth",
    ],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    maxAge: 86400,
  }),
)

app
  .use(bufferMiddleware, loggingMiddleware, cacheControlMiddleware)

Object.entries(providers).forEach(([_, provider]) => {
  app.route("/", provider.route)
})

app.onError((err, _) => {
  console.error("Error:", err)
  if (err instanceof InvalidError) {
    return new Response(getBadge(err.label, "invalid", "#e05d44"), {
      headers: {
        "Content-Type": "image/svg+xml",
      }
    })
  }
  return new Response("Internal Server Error", { status: 500 })
})

export default app
