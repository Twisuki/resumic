import { IconLoader2, IconPlus } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DEFAULT_RESUME } from "@/config/resume"
import { useResumeCreate } from "@/hooks/query/resume"

export default function Create() {
  const create = useResumeCreate()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="justify-start"
          disabled={create.isPending}
        >
          {create.isPending ? <IconLoader2 className="animate-spin" /> : <IconPlus />}
          <span className="min-w-0 truncate">新建简历</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem disabled>空白简历</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => create.mutate(DEFAULT_RESUME)}>默认模板</DropdownMenuItem>
        <DropdownMenuItem disabled>导入简历</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
