import antfu from "@antfu/eslint-config"

const SHADCN_IGNORES = [
  "src/components/**", // shadcn components
  "src/hooks/**", // shadcn hooks
]

const ORM_IGNORES = [
  "migrations/**", // prisma migrations
  "prisma/schema.d.ts", // prisma schema
]

export default antfu(
  {
    ignores: [
      ...SHADCN_IGNORES,
      ...ORM_IGNORES,
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
)
