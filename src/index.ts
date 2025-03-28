import { cors } from "hono/cors"
import { logger } from "hono/logger"
import { prettyJSON } from "hono/pretty-json"
import { Hono } from "hono/tiny"
import { providers } from "./apis"
import { createErrorResponse, PluginErrorType } from "@lobehub/chat-plugin-sdk"
import { buildManifest, DESCRIPTION, TITLE } from "./manifest"
import { apiGateway } from "./gateway"
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
  .get("/", (c) => c.text(`Welcome to ${TITLE}! ${DESCRIPTION} All routes are under \`/api\``))
  .get("/manifest.json", (c) => {
    const url = new URL(c.req.url)
    return c.json(buildManifest(url, providers))
  })

const api = app.basePath("/api")
  .route("/gateway", apiGateway)

Object.entries(providers).forEach(([_, provider]) => {
  api.route(provider.path, provider.route)
})

app.onError((err, _) => {
  return createErrorResponse(
    PluginErrorType.InternalServerError,
    err.message,
  )
})

export default app
