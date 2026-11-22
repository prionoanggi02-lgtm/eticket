import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // cacheComponents dinonaktifkan: aplikasi membaca cookie sesi & file JSON di setiap request.
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
