"use client"

import React from "react"
import { useFormContext } from "react-hook-form"

import { removeThisWhenYouNeedMe } from "@/lib/general-helpers"
import { cn } from "@/lib/styles"
import { AppFormDescription } from "@/components/forms/AppFormDescription"
import { AppFormLabel } from "@/components/forms/AppFormLabel"
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import {
  Select as SelectComponent,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type Props = {
  readonly name: string
  readonly options: { label: string; value: string }[]
  readonly label?: React.ReactNode
  readonly placeholder?: string
  readonly containerClassName?: string
  readonly fieldClassName?: string
  readonly description?: React.ReactNode
} & Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "className">

export function AppSelect({
  name,
  options,
  label,
  placeholder,
  containerClassName,
  fieldClassName,
  description,
  ...nativeProps
}: Props) {
  removeThisWhenYouNeedMe("AppSelect")

  const { control } = useFormContext()

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem className={cn(containerClassName)}>
          <AppFormLabel
            label={label}
            fieldState={fieldState}
            required={nativeProps.required}
          />

          <SelectComponent
            {...field}
            {...nativeProps}
            dir={(nativeProps.dir ?? "ltr") as any}
            onValueChange={field.onChange}
            defaultValue={field.value}
          >
            <FormControl>
              <SelectTrigger
                className={cn(
                  "w-full",
                  { "border-red-600": fieldState.invalid },
                  fieldClassName
                )}
                tabIndex={nativeProps.tabIndex}
                onBlur={field.onBlur}
              >
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>

            <SelectContent className={cn("max-h-40 overflow-y-auto")}>
              {options.map((option) => (
                <SelectItem value={option.value} key={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </SelectComponent>

          <AppFormDescription description={description} />

          <FormMessage />
        </FormItem>
      )}
    />
  )
}
