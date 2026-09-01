import Files from "@/app/(main)/components/sidebar/files"
import Options from "@/app/(main)/components/sidebar/options"

export default function Sidebar() {
  return (
    <div className="hidden md:flex md:w-64 lg:w-72 h-full flex-col">
      <Files />
      <Options />
    </div>
  )
}
