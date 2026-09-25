import type { NextConfig } from "next"
import type { PHASE_TYPE } from "next/constants"
import { PHASE_DEVELOPMENT_SERVER } from "next/constants"

export default (phase: PHASE_TYPE): NextConfig => ({
  images: {
    dangerouslyAllowLocalIP: phase === PHASE_DEVELOPMENT_SERVER,
    remotePatterns: [
      { protocol: "https", hostname: "github.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
  },
})
