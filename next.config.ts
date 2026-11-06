import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // cacheComponents / partialPrefetching desactivados: con OpenNext en Cloudflare Workers
  // el Worker se colgaba en cada petición (error 1101).
  // Rutas de Framer con tildes → rutas del sitio
  async redirects() {
    return [
      { source: "/legal/pol%C3%ADticas-de-privacidad", destination: "/legal/politicas-de-privacidad", permanent: true },
      { source: "/legal/t%C3%A9rminos-y-condiciones", destination: "/legal/terminos-y-condiciones", permanent: true },
    ];
  },
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
