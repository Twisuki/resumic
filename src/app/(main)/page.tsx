"use client"

import { SidebarsProvider } from "@/app/(main)/contexts/sidebar"
import Left from "@/app/(main)/sections/left"
import Main from "@/app/(main)/sections/main"
import Navbar from "@/app/(main)/sections/navbar"
import Right from "@/app/(main)/sections/right"

export default function Page() {
  return (
    <SidebarsProvider>
      <div className="w-screen h-screen flex flex-col">
        <Navbar />
        <div className="w-full flex-1 flex mx-auto max-w-screen-2xl min-h-0">
          <Left />
          <Main />
          <Right />
        </div>
      </div>
    </SidebarsProvider>
  )
}
