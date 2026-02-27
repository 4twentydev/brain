import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@brain/shared", "@brain/supabase"],
};

export default nextConfig;
