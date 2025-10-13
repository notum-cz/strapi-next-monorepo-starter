import { Spinner } from "@/components/elementary/Spinner"

export default function Loading() {
  return (
    <div className="flex h-screen items-center justify-center">
      <Spinner className="size-7 border-3 border-black" />
    </div>
  )
}
