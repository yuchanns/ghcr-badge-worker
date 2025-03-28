import { Hono } from "hono/tiny"

const route = new Hono()

const apiWeather: APIProvider = {
  name: "getWeather",
  path: "weather",
  route: route,
  description: "Get the weather based on the given location.",
  parameters: {
    type: "object",
    properties: {
      location: {
        type: "string",
        description: "The location to get the weather for.",
      }
    },
    required: ["location"],
  },
}

route.get("/*", (c) => c.text("Please use POST method to get the weather."))

route.post("/*", async (c) => {
  const { location } = (await c.req.json()) as { location: string }
  const url = `https://wttr.in/${location}?format=j1`

  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36",
    }
  })
  if (response.status !== 200) {
    throw new Error(`Failed to get weather for ${location}.`)
  }
  return response
})

export default apiWeather
