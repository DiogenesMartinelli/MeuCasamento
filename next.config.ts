import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
