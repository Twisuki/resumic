import antfu from "@antfu/eslint-config"

const SHADCN_IGNORES = [
  "src/components/ui/**", // shadcn components
  "src/hooks/use-mobile.ts", // shadcn hooks
]

const PRISMA_IGNORES = [
  "migrations/**", // prisma migrations
  "prisma/schema.d.ts", // prisma schema
]

export default antfu(
  {
    ignores: [
      ...SHADCN_IGNORES,
      ...PRISMA_IGNORES,
    ],
    typescript: true,
    stylistic: {
      quotes: "double",
    },
    formatters: {
      css: true,
      html: true,
      markdown: true,
    },
    react: true,
  },
  {
    files: ["**/contexts/**"],
    rules: {
      "react-refresh/only-export-components": "off",
    },
  },
  {
    rules: {
      "react/no-array-index-key": "off",
    },
  },
)
