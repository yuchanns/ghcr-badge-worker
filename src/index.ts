import { cors } from "hono/cors"
import { logger } from "hono/logger"
import { prettyJSON } from "hono/pretty-json"
import { Hono } from "hono/tiny"
import { providers } from "./apis"
import { bufferMiddleware, loggingMiddleware } from "./middlewares"

const app = new Hono<{ Bindings: Bindings }>().use(
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
  .use(bufferMiddleware, loggingMiddleware)

Object.entries(providers).forEach(([_, provider]) => {
  app.route("/", provider.route)
})

app.onError((err, _) => {
  console.error("Error:", err)
  return new Response("Internal Server Error", { status: 500 })
})

export default app
