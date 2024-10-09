"use client"

import React from "react"
import { useFormContext } from "react-hook-form"

import { cn } from "@/lib/styles"
import { AppFormDescription } from "@/components/forms/AppFormDescription"
import { AppFormLabel } from "@/components/forms/AppFormLabel"
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"

type Props = {
  readonly name: string
  readonly label?: React.ReactNode
  readonly endAdornment?: React.ReactNode
  readonly containerClassName?: string
  readonly fieldClassName?: string
  readonly description?: React.ReactNode
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "className">

export function AppTextArea({
  name,
  label,
  endAdornment,
  containerClassName,
  fieldClassName,
  description,
  ...nativeProps
}: Props) {
  const { control } = useFormContext()

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState, formState }) => (
        <FormItem className={cn(containerClassName)}>
          <AppFormLabel label={label} required={nativeProps.required} />

          <FormControl>
            <div className="relative flex items-stretch overflow-hidden">
              <Textarea
                {...field}
                value={field.value ?? ""}
                onChange={(event) => {
                  const value = event.target.value
                  if (nativeProps.type === "number") {
                    if (value === "") {
                      const defaultValue = formState.defaultValues?.[name]
                      field.onChange(defaultValue)
                    } else {
                      field.onChange(parseFloat(value))
                    }
                  } else {
                    field.onChange(value)
                  }
                }}
                className={cn(
                  "w-full border ease-in-out",
                  {
                    "border-red-600": fieldState.invalid,
                    "border-primary": fieldState.invalid,
                  },
                  fieldClassName
                )}
              />
              {endAdornment && (
                <div
                  className={cn("flex items-center border px-2", {
                    "border-y-red-600 border-r-red-600 text-red-600":
                      fieldState.invalid,
                  })}
                >
                  {endAdornment}
                </div>
              )}
            </div>
          </FormControl>

          <AppFormDescription description={description} />

          <FormMessage />
        </FormItem>
      )}
    />
  )
}
