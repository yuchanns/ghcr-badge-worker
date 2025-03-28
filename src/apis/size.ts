import { Hono } from "hono/tiny"
import { makeHeaders } from "../utils";

const route = new Hono()

const MEDIA_TYPE_MANIFEST_V2 = "application/vnd.docker.distribution.manifest.v2+json";
const MEDIA_TYPE_OCI_IMAGE_MANIFEST_V1 = "application/vnd.oci.image.manifest.v1+json";
const MEDIA_TYPE_OCI_IMAGE_INDEX_V1 = "application/vnd.oci.image.index.v1+json";
const MEDIA_TYPE_MANIFEST_LIST_V2 = "application/vnd.docker.distribution.manifest.list.v2+json";

export const getManifest = async (config: GHCRConfig, tag: string = "latest"): Promise<ManifestV2 | OCIImageManifestV1> => {
  const url = `https://ghcr.io/v2/${config.owner}/${config.repo}/manifests/${tag}`;
  const headers = makeHeaders(config);
  headers.set('Accept', `${MEDIA_TYPE_OCI_IMAGE_INDEX_V1}, ${MEDIA_TYPE_OCI_IMAGE_MANIFEST_V1}`);

  const resp = await fetch(url, { headers });
  const manifest = await resp.json() as any;
  if (!manifest) {
    throw new Error("Manifest is empty");
  }
  if (manifest.errors) {
    throw new Error(`Manifest contains some error: ${manifest.errors}`);
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
      throw new Error("Returned list of manifests is empty");
    }
    if (!manifests[0].digest) {
      throw new Error(`Digest of a manifest is empty: ${JSON.stringify(manifests[0])}`);
    }
    return getManifest(config, manifests[0].digest)
  }

  if (manifest.mediaType == MEDIA_TYPE_OCI_IMAGE_INDEX_V1) {
    const { manifests } = manifest as OCIImageIndexV1
    if (!manifests || manifests.length === 0) {
      throw new Error("Returned list of manifests is empty");
    }
    if (!manifests[0].digest) {
      throw new Error(`Digest of a manifest is empty: ${JSON.stringify(manifests[0])}`);
    }
    return getManifest(config, manifests[0].digest)
  }
  throw new Error("Unsupported media type");
}


const apiSize: APIProvider = {
  route: route,
}

route.basePath("/:owner/:repo")
  .get("/size", async (c) => {
    const tag = c.req.query("tag");
    const { owner, repo } = c.req.param()
    const manifest = await getManifest({ owner, repo }, tag)
    const config_size = manifest.config.size ?? 0;
    const layers = manifest.layers.map((layer) => layer.size);
    const total_size = layers.reduce((acc, layer) => acc + layer, config_size);
    const size = `${total_size}B`
    return c.json({ size })
  })

export default apiSize
