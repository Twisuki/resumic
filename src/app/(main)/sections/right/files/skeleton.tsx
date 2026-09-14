import { Skeleton } from "@/components/ui/skeleton"

const ROWS = 4

export default function ListSkeleton() {
  return (
    <>
      {Array.from({ length: ROWS }, (_, index) => (
        <Skeleton key={index} className="h-8 w-full" />
      ))}
    </>
  )
}
