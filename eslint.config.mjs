import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";

const backendImportRestrictions = {
  patterns: [
    {
      group: ["@/backend", "@/backend/*", "@/backend/**"],
      message:
        "Frontend code must use a transport contract and must not import server-only backend modules.",
    },
  ],
};

const frontendImportRestrictions = {
  patterns: [
    {
      group: ["@/frontend", "@/frontend/*", "@/frontend/**"],
      message: "Backend code must not depend on presentation components.",
    },
  ],
};

export default defineConfig([
  ...nextVitals,
  ...nextTypeScript,
  {
    files: ["src/frontend/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": ["error", backendImportRestrictions],
    },
  },
  {
    files: ["src/backend/**/*.ts"],
    rules: {
      "no-restricted-imports": ["error", frontendImportRestrictions],
    },
  },
  {
    files: ["src/domain/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "@/app",
                "@/app/**",
                "@/backend",
                "@/backend/**",
                "@/frontend",
                "@/frontend/**",
                "next",
                "next/**",
                "react",
                "react/**"
              ],
              message:
                "Domain code must remain framework-, transport-, persistence-, and UI-independent.",
            },
          ],
        },
      ],
    },
  },
  globalIgnores([
    ".next/**",
    "coverage/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);
