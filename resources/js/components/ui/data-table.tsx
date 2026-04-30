'use client';

import React from 'react';
import {
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    useReactTable,
    type ColumnDef as TanstackColumnDef,
    type SortingState,
} from '@tanstack/react-table';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface DataTableProps<TData> {
    columns: TanstackColumnDef<TData>[];
    data: TData[];
    isLoading?: boolean;
    emptyMessage?: string;
}

export default function DataTable<TData>({
    columns,
    data,
    isLoading = false,
    emptyMessage = 'No data found.',
}: DataTableProps<TData>) {
    const [sorting, setSorting] = React.useState<SortingState>([]);

    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
        },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

    return (
        <div className="w-full overflow-x-auto rounded-lg border border-border">
            <table className="w-full">
                <thead>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <tr key={headerGroup.id} className="border-b bg-muted/60">
                            {headerGroup.headers.map((header) => (
                                <th
                                    key={header.id}
                                    className={`px-4 py-2 text-xs font-bold text-foreground whitespace-nowrap ${
                                        header.column.getCanSort()
                                            ? 'cursor-pointer select-none hover:bg-muted/80 transition-colors'
                                            : ''
                                    }`}
                                    onClick={() => header.column.toggleSorting()}
                                >
                                    <div className="flex items-center gap-2">
                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                        {header.column.getCanSort() && (
                                            <div className="flex items-center">
                                                {{
                                                    asc: <ChevronUp className="h-4 w-4 text-primary" />,
                                                    desc: <ChevronDown className="h-4 w-4 text-primary" />,
                                                }[header.column.getIsSorted() as string] || (
                                                    <div className="h-4 w-4" />
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody className="divide-y divide-border">
                    {isLoading ? (
                        <tr>
                            <td colSpan={columns.length} className="px-6 py-12 text-center">
                                <div className="flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                                </div>
                            </td>
                        </tr>
                    ) : table.getRowModel().rows.length === 0 ? (
                        <tr>
                            <td colSpan={columns.length} className="px-6 py-12 text-center">
                                <p className="text-muted-foreground text-base">{emptyMessage}</p>
                            </td>
                        </tr>
                    ) : (
                        table.getRowModel().rows.map((row, idx) => (
                            <tr
                                key={row.id}
                                className={`border-0 ${
                                    idx % 2 === 1 ? 'bg-muted/70' : 'bg-transparent'
                                }`}
                            >
                                {row.getVisibleCells().map((cell) => (
                                    <td key={cell.id} className="px-4 py-2 text-xs text-foreground">
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </td>
                                ))}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}
