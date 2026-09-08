import type { MetadataRoute } from "next";

import { projectMetadata } from "@/shared/project-metadata";
import { uiTheme } from "@/shared/ui-theme";

export default function manifest(): MetadataRoute.Manifest {
  return {
    background_color: uiTheme.manifestBackgroundColor,
    description: projectMetadata.description,
    display: "standalone",
    lang: "en-IN",
    name: projectMetadata.name,
    short_name: projectMetadata.name,
    start_url: "/",
    theme_color: uiTheme.browserChromeColor,
  };
}
