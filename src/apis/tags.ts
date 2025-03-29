import { Hono } from "hono/tiny"
import { fnmatch, getBadge, makeHeaders } from "../utils"
import { InvalidError } from "../errors"

const route = new Hono()

export const getTags = async (config: GHCRConfig) => {
  const url = `https://ghcr.io/v2/${config.owner}/${config.repo}/tags/list`
  const resp = await fetch(url, {
    headers: makeHeaders(config)
  })
  const data = await resp.json() as {
    name: string,
    tags: string[],
  }
  let trim_pattern = "^$"
  if (config.trim == "patch") {
    trim_pattern = "^v?\\d+\\.\\d+\\.\\d+[^.]*$"
  } else if (config.trim == "major") {
    trim_pattern = "^v?\\d+\\.\\d+[^.]*$"
  }
  const regex = new RegExp(trim_pattern)
  const ignore = config.ignore || ""
  const tags = (data.tags || []).
    filter((tag) => regex.test(tag)).
    filter((tag) => !fnmatch(tag, ignore))
  return tags
}


const apiTags: APIProvider = {
  route: route,
}

route.basePath("/:owner/:repo")
  .get("/latest_tag", async (c) => {
    const { owner, repo } = c.req.param()
    const { trim_type: trim, ignore, color: default_color, label = "version" } = c.req.query()
    const tags = await getTags({
      owner,
      repo,
      label,
      trim,
      ignore,
    })
    const badge = getBadge(label, tags[tags.length - 1], default_color)
    return c.html(badge, 200, {
      "Content-Type": "image/svg+xml",
    })
  })
  .get("/tags", async (c) => {
    const { owner, repo } = c.req.param()
    const { trim_type: trim, ignore, color: default_color, label = "image tags" } = c.req.query()
    const n = parseInt(c.req.query("n") || "3")
    if (isNaN(n) || n < 1) {
      throw new InvalidError("Invalid parameter", label)
    }
    const tags = await getTags({
      owner,
      repo,
      label,
      trim,
      ignore,
    })
    const badge = getBadge(label, tags.slice(0, n).join(" | "), default_color)
    return c.html(badge, 200, {
      "Content-Type": "image/svg+xml",
    })
  })

export default apiTags
