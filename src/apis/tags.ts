import { Hono } from "hono/tiny"
import { fnmatch, getBadge, makeHeaders } from "../utils"
import { InvalidError } from "../errors"

const route = new Hono()

export const getTags = async (config: GHCRConfig) => {
  const url = `https://ghcr.io/v2/${config.owner}/${config.repo}/tags/list`
  const resp = await fetch(url, {
    headers: makeHeaders(config)
  })
  if (!resp.ok) {
    throw new InvalidError("Invalid parameter", config.label)
  }
  const data = await resp.json() as {
    name: string,
    tags: string[],
  }
  let trim_pattern = ".*"
  if (config.trim == "patch") {
    trim_pattern = "^v?\\d+\\.\\d+\\.\\d+[^.]*$"
  } else if (config.trim == "major") {
    trim_pattern = "^v?\\d+\\.\\d+[^.]*$"
  }
  const regex = new RegExp(trim_pattern)
  const ignore = config.ignore || ""
  const tags = (data.tags || []).sort((a, b) => {
    // Parse version strings into components
    const parseVersion = (v: string) => {
      // Remove leading 'v' if present
      v = v.replace(/^v/, "")
      const [version, prerelease] = v.split("-")
      const [major, minor, patch] = (version || "0.0.0").split(".").map(x => parseInt(x) || 0)
      return { major, minor, patch, prerelease }
    }

    const va = parseVersion(a)
    const vb = parseVersion(b)

    // Compare major.minor.patch
    if (va.major !== vb.major) return vb.major - va.major
    if (va.minor !== vb.minor) return vb.minor - va.minor
    if (va.patch !== vb.patch) return vb.patch - va.patch

    // If one has prerelease and the other doesn't, the one without prerelease is greater
    if (!va.prerelease && vb.prerelease) return -1
    if (va.prerelease && !vb.prerelease) return 1

    // If both have prereleases, do string comparison
    if (va.prerelease && vb.prerelease) {
      return vb.prerelease.localeCompare(va.prerelease)
    }

    return b.localeCompare(a)
  }).
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
