import { Hono } from "hono/tiny"
import {
  createErrorResponse,
  PluginErrorType,
  PluginRequestPayload
} from "@lobehub/chat-plugin-sdk"

export const apiGateway = new Hono<{ Bindings: Bindings }>()
// @ts-expect-error No overload matches this call
  .post("/", async (c) => {
    const data = await c.req.json() as PluginRequestPayload
    const u = new URL(c.req.url)
    const apiUrl = data.manifest?.api.find((a) => a.name === data.apiName)?.url
    if (!apiUrl) {
      return createErrorResponse(PluginErrorType.PluginApiNotFound, {
        message: `API not found for ${data.apiName}`,
      })
    }
    const au = new URL(apiUrl)
    if (au.host !== u.host) {
      return createErrorResponse(PluginErrorType.Forbidden, {
        message: `API URL ${apiUrl} is not allowed for security reasons`,
      })
    }
    const headers: Record<string, string> = {}
    c.req.raw.headers.forEach((v, k) => {
      if (k.toLowerCase().startsWith("x-lobe")) {
        headers[k] = v
      }
    })
    return await c.env.MYSELF.fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: data.arguments,
    })
  })

