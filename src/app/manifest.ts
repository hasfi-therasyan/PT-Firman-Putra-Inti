export default function manifest() {
  return {
    name: "FPI-GMS — Gas Management System",
    short_name: "FPI-GMS",
    description: "Sistem manajemen distribusi gas LPG — PT Firman Putra Inti",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone" as const,
    orientation: "portrait" as const,
    background_color: "#0b1119",
    theme_color: "#134376",
    categories: ["business", "finance"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icons/icon-maskable-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable" as const,
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable" as const,
      },
    ],
  };
}
