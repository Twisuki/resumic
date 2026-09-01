import antfu from "@antfu/eslint-config"

export default antfu({
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
