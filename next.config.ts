import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/",           // Cuando el usuario entra a la raíz
        destination: "/login", // Se le envía a la pantalla de login
        permanent: true,       // Código de estado HTTP 301 (Redirección permanente, óptimo para SEO y rendimiento)
      },
    ];
  },
};

export default nextConfig;
