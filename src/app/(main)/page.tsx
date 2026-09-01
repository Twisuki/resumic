import Agent from "@/app/(main)/components/agent"
import Main from "@/app/(main)/components/main"
import Navbar from "@/app/(main)/components/navbar"
import Sidebar from "@/app/(main)/components/sidebar"

export default function Page() {
  return (
    <div className="w-screen h-screen flex flex-col">
      <Navbar />
      <div className="w-full flex-1 flex mx-auto max-w-screen-2xl">
        <Agent />
        <Main />
        <Sidebar />
      </div>
    </div>
  )
}
