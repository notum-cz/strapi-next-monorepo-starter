"use client"

import {
  flexRender,
  useTable,
  type ColumnDef,
  type HeaderGroup,
  type RowData,
  type SortingState,
} from "@tanstack/react-table"
import { useTranslations } from "next-intl"
import { useState, type ReactNode } from "react"

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
import { removeThisWhenYouNeedMe } from "@/lib/general-helpers"

import { DataTablePagination } from "./DataTablePagination"
import { dataTableFeatures, type DataTableFeatures } from "./features"

interface Props<TData extends RowData> {
  // Columns hold mixed value types; `any` is TanStack's documented pattern here.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly columns: ColumnDef<DataTableFeatures, TData, any>[]
  readonly data: TData[]
  readonly isLoading?: boolean
  readonly pagination?: "simple" | "extended" | false
  readonly allowSearching?: boolean
  readonly searchAdornment?: ReactNode
}

export function DataTable<TData extends RowData>({
  columns,
  data,
  isLoading,
  allowSearching,
  pagination,
  searchAdornment,
}: Props<TData>) {
  removeThisWhenYouNeedMe("DataTable")

  const t = useTranslations()

  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState("")

  const table = useTable({
    features: dataTableFeatures,
    data,
    columns,
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

function DataTableSkeleton<TData extends RowData>({
  headerGroup,
}: {
  headerGroup: HeaderGroup<DataTableFeatures, TData>
}) {
  return (
    <>
      {Array.from({ length: 2 }, (_, i) => (
        <SkeletonLine headerGroup={headerGroup} key={`skeleton-${String(i)}`} />
      ))}
    </>
  )
}

function SkeletonLine<TData extends RowData>({
  headerGroup,
}: {
  headerGroup: HeaderGroup<DataTableFeatures, TData>
}) {
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
