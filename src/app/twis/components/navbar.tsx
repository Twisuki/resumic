"use client"

import { IconBrandGithub, IconWorld } from "@tabler/icons-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Navbar() {
  return (
    <nav className="w-full h-13 lg:h-15 flex items-center border-b bg-background">
      <div className="w-full h-full mx-auto max-w-screen-2xl flex items-center justify-between px-4 sm:px-6 lg:px-8">
        <span className="text-primary text-base font-semibold sm:text-lg">
          Resumic
        </span>
        <div className="flex items-center gap-1 sm:gap-2">
          <Button
            variant="outline"
            asChild
          >
            <Link
              href="/"
              aria-label="返回工作台"
            >
              工作台
            </Link>
          </Button>
          <Button
            variant="outline"
            size="icon"
            asChild
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
        </div>
      </div>
    </nav>
  )
}
