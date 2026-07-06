import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Old Damascus Mediterranean Restaurant",
    short_name: "Old Damascus",
    description: "Authentic Syrian and Mediterranean cuisine in Richardson, TX.",
    start_url: "/",
    display: "standalone",
    background_color: "#F7F2E8",
    theme_color: "#183B0B",
    icons: [
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/maskable-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Menu",
        url: "/menu",
        description: "View our full menu",
      },
      {
        name: "Order",
        url: "/order",
        description: "Order online for pickup or delivery",
      },
      {
        name: "Account",
        url: "/account",
        description: "View your order history and profile",
      },
      {
        name: "Contact",
        url: "/contact",
        description: "Get directions and contact information",
      },
    ],
  };
}
