"use client"

import { useState } from "react"
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { useTranslations } from "next-intl"

import type {
  ColumnDef,
  HeaderGroup,
  SortingState,
} from "@tanstack/react-table"
import type { ReactNode } from "react"

import { removeThisWhenYouNeedMe } from "@/lib/general-helpers"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { DataTablePagination } from "./DataTablePagination"

interface Props<TData, TValue> {
  readonly columns: ColumnDef<TData, TValue>[]
  readonly data: TData[]
  readonly isLoading?: boolean
  readonly pagination?: "simple" | "extended" | false
  readonly allowSearching?: boolean
  readonly searchAdornment?: ReactNode
}

export function DataTable<TData, TValue>({
  columns,
  data,
  isLoading,
  allowSearching,
  pagination,
  searchAdornment,
}: Props<TData, TValue>) {
  removeThisWhenYouNeedMe("DataTable")

  const t = useTranslations()

  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState("")

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      globalFilter,
    },
  })

  return (
    <div>
      {allowSearching && (
        <div className="flex items-center justify-between py-4">
          <Input
            placeholder={`${t("general.search")} (${
              table.getCoreRowModel().rows.length
            })...`}
            value={globalFilter ?? ""}
            onChange={(event) => setGlobalFilter(String(event.target.value))}
            className="max-w-sm rounded-lg border"
          />
          {searchAdornment}
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : (flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          ) as ReactNode)}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>

          {isLoading ? (
            <DataTableSkeleton headerGroup={table.getHeaderGroups()[0]!} />
          ) : (
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {
                          flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          ) as ReactNode
                        }
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    {t("tables.noData")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          )}
        </Table>
      </div>

      {pagination && (
        <DataTablePagination table={table} simple={pagination === "simple"} />
      )}
    </div>
  )
}

const DataTableSkeleton = <TData,>({
  headerGroup,
}: {
  headerGroup: HeaderGroup<TData>
}) => {
  return (
    <>
      {Array.from({ length: 2 }).map((_, i) => (
        <SkeletonLine headerGroup={headerGroup} key={i} />
      ))}
    </>
  )
}

const SkeletonLine = <TData,>({
  headerGroup,
}: {
  headerGroup: HeaderGroup<TData>
}) => {
  return (
    <TableBody>
      <TableRow>
        {headerGroup.headers.map((header) => (
          <TableCell key={header.id} className="h-6">
            <Skeleton className="h-3" />
          </TableCell>
        ))}
      </TableRow>
    </TableBody>
  )
}
