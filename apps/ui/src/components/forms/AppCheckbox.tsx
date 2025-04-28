"use client"

import React from "react"
import { useFormContext } from "react-hook-form"

import { removeThisWhenYouNeedMe } from "@/lib/general-helpers"
import { cn } from "@/lib/styles"
import { Checkbox as CheckboxComponent } from "@/components/ui/checkbox"
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"

import { AppFormDescription } from "./AppFormDescription"
import { AppFormLabel } from "./AppFormLabel"

type Props = {
  readonly name: string
  readonly label?: React.ReactNode
  readonly containerClassName?: string
  readonly fieldClassName?: string
  readonly description?: React.ReactNode
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "className">

export function AppCheckbox({
  name,
  label,
  containerClassName,
  fieldClassName,
  description,
  ...nativeProps
}: Props) {
  removeThisWhenYouNeedMe("AppCheckbox")

  const { control } = useFormContext()

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem
          className={cn(
            containerClassName,
            "flex flex-col justify-center justify-items-center"
          )}
        >
          <div className="flex flex-row items-start space-y-0 space-x-3">
            <FormControl>
              <CheckboxComponent
                {...field}
                {...(nativeProps as any)}
                checked={field.value}
                onCheckedChange={field.onChange}
                className={fieldClassName}
              />
            </FormControl>

            <div className="space-y-1 leading-none">
              <AppFormLabel
                label={label}
                fieldState={fieldState}
                required={nativeProps.required}
              />

              <AppFormDescription description={description} />
            </div>
          </div>

          <FormMessage />
        </FormItem>
      )}
    />
  )
}
