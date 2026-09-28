import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@react-pdf/renderer", "@prisma/client", "bcryptjs"],
};

export default nextConfig;
