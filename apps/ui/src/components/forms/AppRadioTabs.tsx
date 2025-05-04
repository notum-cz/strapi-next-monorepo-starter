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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type Props = {
  readonly name: string
  readonly tabsContent: Array<{ value: string; content: React.ReactNode }>
  readonly tabTriggers: Array<{
    value: string
    title: string
    tabIndex?: number
  }>
  readonly label?: React.ReactNode
  readonly containerClassName?: string
  readonly description?: React.ReactNode
  readonly tabListProps?: React.ComponentProps<typeof TabsList>
  readonly required?: boolean
}

export function AppRadioTabs({
  name,
  tabsContent,
  tabTriggers,
  label,
  containerClassName,
  description,
  tabListProps,
  required,
}: Props) {
  removeThisWhenYouNeedMe("AppRadioTabs")

  const { control } = useFormContext()

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem className={cn(containerClassName)}>
          <FormControl>
            <Tabs onValueChange={field.onChange} value={field.value}>
              <div className="flex w-full items-center justify-between">
                <AppFormLabel
                  label={label}
                  fieldState={fieldState}
                  required={required}
                  className="text-md font-medium"
                />

                <TabsList
                  {...tabListProps}
                  className={cn("bg-primary", tabListProps?.className)}
                >
                  {tabTriggers.map((tabTrigger) => (
                    <TabsTrigger
                      key={tabTrigger.value}
                      value={tabTrigger.value}
                      tabIndex={tabTrigger.tabIndex}
                      className="text-sm text-white/80"
                    >
                      {tabTrigger.title}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              {tabsContent.map((tabContent) => (
                <TabsContent key={tabContent.value} value={tabContent.value}>
                  {tabContent.content}
                </TabsContent>
              ))}
            </Tabs>
          </FormControl>

          <AppFormDescription description={description} />

          <FormMessage />
        </FormItem>
      )}
    />
  )
}
