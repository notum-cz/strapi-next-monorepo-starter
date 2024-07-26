import { Spinner } from "@/components/elementary/Spinner"

export default function Loading() {
  return (
    <div className="flex h-screen items-center justify-center">
      <Spinner className="border-3 size-7 border-black" />
    </div>
  )
}
