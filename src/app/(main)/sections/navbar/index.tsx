"use client"

import { IconBrandGithub, IconLayoutSidebarLeftExpand, IconMenu2, IconWorld } from "@tabler/icons-react"
import Link from "next/link"
import { useSidebars } from "@/app/(main)/hooks/sidebar"
import UserMenu from "@/app/(main)/sections/navbar/user-menu"
import { Button } from "@/components/ui/button"

export default function Navbar() {
  const { toggleLeft, toggleRight } = useSidebars()

  return (
    <nav className="w-full h-13 lg:h-15 flex items-center border-b bg-background">
      <div className="w-full h-full mx-auto max-w-screen-2xl flex items-center justify-between px-4 sm:px-6 lg:px-8">
        <span className="text-primary text-base font-semibold sm:text-lg">
          Resumic
        </span>

        <div className="flex items-center gap-1 sm:gap-2">
          <Button
            variant="outline"
            size="icon"
            asChild
            className="hidden lg:inline-flex"
          >
            <Link
              href="https://github.com/Twisuki/resumic"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub 仓库"
            >
              <IconBrandGithub />
            </Link>
          </Button>

          <Button
            variant="outline"
            size="icon"
            asChild
            className="hidden lg:inline-flex"
          >
            <Link
              href="https://www.twis.uk"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="个人主页"
            >
              <IconWorld />
            </Link>
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={toggleLeft}
            aria-label="切换左侧面板"
            className="lg:hidden"
          >
            <IconLayoutSidebarLeftExpand />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={toggleRight}
            aria-label="切换右侧面板"
            className="lg:hidden"
          >
            <IconMenu2 />
          </Button>

          <UserMenu />
        </div>
      </div>
    </nav>
  )
}
