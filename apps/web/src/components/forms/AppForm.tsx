"use client"

import { BaseSyntheticEvent } from "react"
import {
  FieldValues,
  FormProvider,
  SubmitErrorHandler,
  UseFormReturn,
} from "react-hook-form"

import { removeThisWhenYouNeedMe } from "@/lib/general-helpers"

interface Props<T extends FieldValues = FieldValues> {
  readonly form: UseFormReturn<T>
  readonly onSubmit: (
    // eslint-disable-next-line no-unused-vars
    values: T,
    // eslint-disable-next-line no-unused-vars
    e?: BaseSyntheticEvent<object, unknown, unknown> | undefined
  ) => void
  readonly onError?: SubmitErrorHandler<T>
  readonly children: React.ReactNode
  readonly className?: string
  readonly id?: string
  readonly disabled?: boolean
}

export function AppForm<T extends FieldValues = FieldValues>({
  onSubmit,
  onError = () => {},
  children,
  className,
  id,
  form,
  disabled,
}: Props<T>) {
  removeThisWhenYouNeedMe("AppForm")

  const { handleSubmit } = form

  return (
    <FormProvider {...form}>
      <form
        onSubmit={handleSubmit(onSubmit, onError)}
        className={className}
        id={id}
        noValidate
      >
        <fieldset disabled={disabled} className="space-y-4">
          {children}
        </fieldset>
      </form>
    </FormProvider>
  )
}
