import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "DevRank - Frontend Developer Quiz",
    short_name: "DevRank",
    description: "Level up your frontend skills with daily quizzes",
    start_url: "/",
    display: "standalone",
    background_color: "#030712",
    theme_color: "#06b6d4",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
