import antfu from "@antfu/eslint-config"

export default antfu({
  ignores: [
    "migrations/**",
    "prisma/schema.d.ts",
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
})
