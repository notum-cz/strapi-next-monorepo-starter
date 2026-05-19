import Typography from "@/components/typography"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export default function DialogSection() {
  return (
    <div className="flex flex-col gap-6">
      <Dialog>
        <DialogTrigger asChild>
          <Button className="mx-auto w-fit">Open dialog</Button>
        </DialogTrigger>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dialog title</DialogTitle>
            <DialogDescription>
              This is a demo dialog from the design system.
            </DialogDescription>
          </DialogHeader>

          <div className="py-2">
            <Typography>
              Dialog body content — explain the purpose of this dialog
            </Typography>
          </div>

          <DialogFooter showCloseButton />
        </DialogContent>
      </Dialog>
    </div>
  )
}
