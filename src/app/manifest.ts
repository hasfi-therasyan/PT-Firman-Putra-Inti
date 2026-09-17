export default function manifest() {
  return {
    name: "FPI-GMS — Gas Management System",
    short_name: "FPI-GMS",
    description: "Sistem manajemen distribusi gas LPG — PT Firman Putra Inti",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone" as const,
    orientation: "portrait" as const,
    background_color: "#ffffff",
    theme_color: "#1a1a1a",
    categories: ["business", "finance"],
    icons: [
      { src: "/icons/icon-192.svg", sizes: "192x192", type: "image/svg+xml" },
      { src: "/icons/icon-512.svg", sizes: "512x512", type: "image/svg+xml" },
      { src: "/icons/icon-192.svg", sizes: "192x192", type: "image/svg+xml", purpose: "maskable" },
    ],
  };
}
