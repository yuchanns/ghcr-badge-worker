import { Service } from "@cloudflare/workers-types"
import { Hono } from "hono/tiny"
import { PluginSchema } from "@lobehub/chat-plugin-sdk"

export { }

declare global {
  interface Bindings {
    MYSELF: Service
  }

  interface APIProvider {
    name: string
    path: string
    route: Hono
    description: string
    parameters: PluginSchema
  }
}
