import { Service } from "@cloudflare/workers-types"
import { Hono } from "hono/tiny"

export { }

declare global {
  interface Bindings { }

  interface APIProvider {
    route: Hono
  }

  interface GHCRConfig {
    owner: string;
    repo: string;
    userAgent?: string;
  }

  interface ManifestV2 {
    mediaType: string,
    schemaVersion: number,
    config: {
      digest: string,
      mediaType: string,
      size?: number
    },
    layers: {
      digest: string,
      mediaType: string,
      size: number
    }[]
  }

  interface OCIImageManifestV1 {
    schemaVersion: number,
    mediaType: string,
    config: {
      digest: string,
      mediaType: string,
      size?: number
    },
    layers: {
      digest: string,
      mediaType: string,
      size: number
    }[]
  }

  interface ManifestListV2 {
    mediaType: string,
    schemaVersion: number,
    manifests?: {
      digest?: string,
      mediaType: string,
      size: number
    }[]
  }
  interface OCIImageIndexV1 {
    mediaType: string,
    schemaVersion: number,
    manifests?: {
      schemaVersion: number,
      mediaType: string,
      digest: string,
      size: number,
      platform: {
        architecture: string,
        os: string,
      }
    }[]
  }

}
