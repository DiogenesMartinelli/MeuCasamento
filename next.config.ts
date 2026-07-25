import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next.js's file tracer doesn't reliably pick up the Prisma query engine binary
  // when using the "prisma-client" generator with a custom output path (as opposed
  // to the classic node_modules/.prisma/client location it has built-in support for).
  // Without this, the deployed serverless function is missing the .so.node engine.
  outputFileTracingIncludes: {
    "/**/*": ["./src/generated/prisma/**/*"],
  },
  images: {
    // Gift images are scraped from arbitrary store URLs (og:image) chosen by the couple,
    // and site/profile images live on Supabase Storage - both are external, admin-controlled sources.
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
};

export default nextConfig;
