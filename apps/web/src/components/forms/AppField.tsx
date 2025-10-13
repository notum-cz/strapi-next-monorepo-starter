"use client"

import React from "react"
import { useFormContext } from "react-hook-form"

import { removeThisWhenYouNeedMe } from "@/lib/general-helpers"
import { cn } from "@/lib/styles"
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

import { AppFormDescription } from "./AppFormDescription"
import { AppFormLabel } from "./AppFormLabel"

type Props = {
  readonly name: string
  readonly label?: React.ReactNode
  readonly endAdornment?: React.ReactNode
  readonly containerClassName?: string
  readonly fieldClassName?: string
  readonly description?: React.ReactNode
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "className">

export function AppField({
  name,
  label,
  endAdornment,
  containerClassName,
  fieldClassName,
  description,
  ...nativeProps
}: Props) {
  removeThisWhenYouNeedMe("AppField")

  const { control } = useFormContext()

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem className={cn(containerClassName)}>
          <AppFormLabel
            fieldState={fieldState}
            label={label}
            required={nativeProps.required}
          />

          <FormControl>
            <div className="relative flex items-stretch overflow-hidden">
              <Input
                {...field}
                {...nativeProps}
                value={field.value ?? ""}
                onChange={(event) => {
                  const value = event.target.value
                  if (nativeProps.type === "number") {
                    field.onChange(parseFloat(value))
                  } else {
                    field.onChange(value)
                  }
                }}
                className={cn(
                  "w-full",
                  {
                    "border-red-600": fieldState.invalid,
                    "rounded-md border": !endAdornment,
                    "rounded-l-md border-y border-l": !!endAdornment,
                  },
                  fieldClassName
                )}
              />
              {endAdornment && (
                <div
                  className={cn(
                    "flex items-center rounded-r-md border bg-gray-100 px-2",
                    {
                      "border-y-red-600 border-r-red-600 text-red-600":
                        fieldState.invalid,
                      "border-gray-100": !fieldState.invalid,
                    }
                  )}
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
