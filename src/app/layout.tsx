import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import { projectMetadata } from "@/shared/project-metadata";

import "./globals.css";

export const metadata: Metadata = {
  description: projectMetadata.description,
  robots: {
    follow: false,
    index: false,
  },
  title: {
    default: projectMetadata.name,
    template: `%s · ${projectMetadata.name}`,
  },
};

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#14532d",
};

type RootLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en-IN">
      <body>
        <a
          className="fixed top-3 left-3 z-50 -translate-y-20 rounded-lg bg-stone-950 px-4 py-2 text-sm font-semibold text-white transition-transform focus:translate-y-0"
          href="#main-content"
        >
          Skip to content
        </a>
        <div id="main-content">{children}</div>
      </body>
    </html>
  );
}
