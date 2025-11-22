/* eslint-disable @typescript-eslint/ban-ts-comment */
import type { NextConfig } from "next";
//@ts-ignore
import { PrismaPlugin } from "@prisma/nextjs-monorepo-workaround-plugin";

// Get bucket name from environment variable
const bucketName = process.env.NEXT_PUBLIC_S3_BUCKET_NAME_IMAGES;

// Build remote patterns array dynamically
const remotePatterns: Array<{
  hostname: string;
  port: string;
  protocol: "https";
}> = [
  // Existing bucket (if different from env var)
  {
    hostname: "marshal-lms-yt-video-subscribe.fly.storage.tigris.dev",
    port: "",
    protocol: "https",
  },
];

// Add bucket from env var if it exists and is different
if (bucketName && bucketName !== "marshal-lms-yt-video-subscribe") {
  remotePatterns.push({
    hostname: `${bucketName}.fly.storage.tigris.dev`,
    port: "",
    protocol: "https",
  });
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns,
  },

  webpack: (config, { isServer }) => {
    if (isServer) {
      config.plugins = [...config.plugins, new PrismaPlugin()];
    }

    return config;
  },
};

export default nextConfig;
