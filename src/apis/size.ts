import { Hono } from "hono/tiny"
import { getBadge, makeHeaders } from "../utils"

const route = new Hono()

const MEDIA_TYPE_MANIFEST_V2 = "application/vnd.docker.distribution.manifest.v2+json"
const MEDIA_TYPE_OCI_IMAGE_MANIFEST_V1 = "application/vnd.oci.image.manifest.v1+json"
const MEDIA_TYPE_OCI_IMAGE_INDEX_V1 = "application/vnd.oci.image.index.v1+json"
const MEDIA_TYPE_MANIFEST_LIST_V2 = "application/vnd.docker.distribution.manifest.list.v2+json"

export const getManifest = async (config: GHCRConfig, tag = "latest"): Promise<ManifestV2 | OCIImageManifestV1> => {
  const url = `https://ghcr.io/v2/${config.owner}/${config.repo}/manifests/${tag}`
  const headers = makeHeaders(config)
  headers.set("Accept", `${MEDIA_TYPE_OCI_IMAGE_INDEX_V1}, ${MEDIA_TYPE_OCI_IMAGE_MANIFEST_V1}`)

  const resp = await fetch(url, { headers })
  const manifest = await resp.json() as {
    errors?: string
    mediaType: string
  }
  if (!manifest) {
    throw new Error("Manifest is empty")
  }
  if (manifest.errors) {
    throw new Error(`Manifest contains some error: ${manifest.errors}`)
  }

  if (manifest.mediaType == MEDIA_TYPE_MANIFEST_V2) {
    return manifest as ManifestV2
  }

  if (manifest.mediaType == MEDIA_TYPE_OCI_IMAGE_MANIFEST_V1) {
    return manifest as OCIImageManifestV1
  }

  if (manifest.mediaType == MEDIA_TYPE_MANIFEST_LIST_V2) {
    const { manifests } = manifest as ManifestListV2
    if (!manifests || manifests.length === 0) {
      throw new Error("Returned list of manifests is empty")
    }
    if (!manifests[0].digest) {
      throw new Error(`Digest of a manifest is empty: ${JSON.stringify(manifests[0])}`)
    }
    return getManifest(config, manifests[0].digest)
  }

  if (manifest.mediaType == MEDIA_TYPE_OCI_IMAGE_INDEX_V1) {
    const { manifests } = manifest as OCIImageIndexV1
    if (!manifests || manifests.length === 0) {
      throw new Error("Returned list of manifests is empty")
    }
    if (!manifests[0].digest) {
      throw new Error(`Digest of a manifest is empty: ${JSON.stringify(manifests[0])}`)
    }
    return getManifest(config, manifests[0].digest)
  }
  throw new Error("Unsupported media type")
}


const apiSize: APIProvider = {
  route: route,
}

route.basePath("/:owner/:repo")
  .get("/size", async (c) => {
    const tag = c.req.query("tag")
    const { owner, repo } = c.req.param()
    const manifest = await getManifest({ owner, repo }, tag)
    const config_size = manifest.config.size ?? 0
    const layers = manifest.layers.map((layer) => layer.size)
    const total_size = layers.reduce((acc, layer) => acc + layer, config_size)
    const badge = getBadge("image size", formatSize(total_size))
    return c.html(badge, 200, {
      "Content-Type": "image/svg+xml",
    })
  })


const formatSize = (size: number): string => {
  const units = ["B", "KB", "MB", "GB", "TB"]
  let unitIndex = 0
  let convertedSize = size

  while (convertedSize >= 1024 && unitIndex < units.length - 1) {
    convertedSize /= 1024
    unitIndex++
  }

  // For bytes, don't show decimal places
  if (unitIndex === 0) {
    return `${Math.round(convertedSize)}${units[unitIndex]}`
  }

  // For other units, show up to 2 decimal places
  return `${convertedSize.toFixed(2)}${units[unitIndex]}`
}
export default apiSize
