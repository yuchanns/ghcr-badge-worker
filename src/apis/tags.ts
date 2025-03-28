import { Hono } from "hono/tiny"
import { makeHeaders } from "../utils";

const route = new Hono()

export const getTags = async (config: GHCRConfig) => {
  const url = `https://ghcr.io/v2/${config.owner}/${config.repo}/tags/list`;
  const resp = await fetch(url, {
    headers: makeHeaders(config)
  });
  const data = await resp.json() as {
    name: string,
    tags: string[],
  }
  return data.tags || [];
}


const apiTags: APIProvider = {
  route: route,
}

route.basePath("/:owner/:repo")
  .get("/latest_tag", async (c) => {
    const { owner, repo } = c.req.param()
    const tags = await getTags({
      owner,
      repo,
    })
    return c.json({ latest: tags[tags.length - 1] })
  })
  .get("/tags", async (c) => {
    const { owner, repo } = c.req.param()
    const tags = await getTags({
      owner,
      repo,
    })
    return c.json({ tags })
  })

export default apiTags
