import { readProfileInput } from "@shared/ai/tool"
import { tool } from "ai"
import { walkProfileRoot } from "@/hooks/ai/tools/serialize"

/**
 * @description 读取整棵 profile 树, 全字段 (含 detail content)
 */
export const readProfileTool = tool({
  description: "Read the full profile tree with all fields (name, headline, age, gender, phone, email, avatar, details). Use to inspect or edit personal info.",
  inputSchema: readProfileInput,
  execute: async () => {
    try {
      const tree = walkProfileRoot("profile")
      if (tree === null)
        return { error: "no profile loaded" }
      return { tree }
    }
    catch (e) {
      return { error: e instanceof Error ? e.message : String(e) }
    }
  },
})
