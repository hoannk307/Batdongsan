export default function manifest() {
  return {
    id: "/",
    name: "Nha Trang Lands — Quản trị",
    short_name: "NTL Admin",
    description:
      "Bảng điều khiển quản trị bất động sản Nha Trang Lands: tin đăng, tin tức, người dùng, đặt lịch.",
    lang: "vi",
    dir: "ltr",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#f9f9f9",
    theme_color: "#ff8c41",
    categories: ["business", "productivity"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
