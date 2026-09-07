import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    background_color: "#f6f1e7",
    description:
      "Simple, explainable digital hisab for a family grain trading business.",
    display: "standalone",
    lang: "en-IN",
    name: "HisabKitab",
    short_name: "HisabKitab",
    start_url: "/",
    theme_color: "#14532d",
  };
}
