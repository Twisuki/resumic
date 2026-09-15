"use client"

import { IconPencil } from "@tabler/icons-react"
import { useState } from "react"
import PagesList from "@/app/(main)/sections/right/options/pages-list"
import ProfileEditDialog from "@/app/(main)/sections/right/options/profile-edit-dialog"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"
import { useResumeStore } from "@/stores/resume"

export default function Options() {
  const zoom = useResumeStore(s => s.current?.zoom ?? 1)
  const [profileOpen, setProfileOpen] = useState(false)

  return (
    <div className="w-full flex-1 min-h-0 flex flex-col bg-sidebar text-sidebar-foreground overflow-y-auto no-scrollbar">
      <header className="h-12 shrink-0 px-3 flex items-center text-sm font-semibold">
        简历选项
      </header>

      <div className="shrink-0 p-3 flex flex-col gap-4">
        {/* Zoom */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium">缩放</span>
            <span className="text-xs text-muted-foreground tabular-nums w-10 text-right">
              {Math.round(zoom * 100)}
              %
            </span>
          </div>
          <Slider
            min={0.5}
            max={2}
            step={0.05}
            value={[zoom]}
            onValueChange={() => {
              // TODO: 接 useHistoryStore().patch('field_set', ['zoom'], value)
            }}
          />
        </div>

        {/* Edit profile */}
        <Button
          variant="outline"
          className="w-full justify-start gap-2"
          onClick={() => setProfileOpen(true)}
        >
          <IconPencil className="size-4" />
          <span>编辑个人信息</span>
        </Button>
      </div>

      <Separator />

      <PagesList />

      <ProfileEditDialog open={profileOpen} onOpenChange={setProfileOpen} />
    </div>
  )
}
