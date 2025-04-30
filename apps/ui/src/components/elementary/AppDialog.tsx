"use client"

import { createContext, useContext, useMemo, useState } from "react"
import { useTranslations } from "next-intl"

import type { ReactNode } from "react"

import { removeThisWhenYouNeedMe } from "@/lib/general-helpers"
import { cn } from "@/lib/styles"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface Props {
  readonly Props: ReactNode
  readonly header: {
    title: string
    description?: string
  }
  readonly children: ReactNode
  readonly footerChildren?: ReactNode
  readonly dialogContentClassName?: string
  readonly confirmDialogClose?: boolean
  readonly dialogCloseCallback?: () => void
}

const DialogContext = createContext({
  closeModal: () => {},
  // eslint-disable-next-line no-unused-vars
  setConfirmDialogClose: (_: boolean) => {},
  confirmClose: false,
})

export const useDialogContext = () => {
  return useContext(DialogContext)
}

export function AppDialog({
  Props: triggerButton,
  header,
  children,
  footerChildren,
  dialogContentClassName,
  confirmDialogClose,
  dialogCloseCallback,
}: Props) {
  removeThisWhenYouNeedMe("AppDialog")

  const t = useTranslations("comps.dialog")
  const [open, setOpen] = useState<boolean>(false)
  const [confirmClose, setConfirmClose] = useState<boolean>(
    confirmDialogClose ?? false
  )

  const providerValue = useMemo(
    () => ({
      closeModal: () => setOpen(false),
      confirmClose,
      setConfirmDialogClose: (value: boolean) => {
        setConfirmClose(value)
      },
    }),
    [confirmClose]
  )

  const handleOpenChange = (open: boolean) => {
    if (!!confirmClose && open === false && !confirm(t("confirmClose"))) {
      return
    }
    if (open === false && !!dialogCloseCallback) {
      dialogCloseCallback()
    }
    setConfirmClose(confirmDialogClose ?? false)
    setOpen(open)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{triggerButton}</DialogTrigger>
      <DialogContent
        className={cn("max-h-screen overflow-auto", dialogContentClassName)}
      >
        <DialogHeader className="mb-4">
          <DialogTitle className="text-2xl font-semibold">
            {header.title}
          </DialogTitle>
          {header.description && (
            <DialogDescription className="text-justify">
              {header.description}
            </DialogDescription>
          )}
        </DialogHeader>
        <DialogContext.Provider value={providerValue}>
          {children}
        </DialogContext.Provider>
        {footerChildren && (
          <DialogFooter className="mt-4">{footerChildren}</DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
