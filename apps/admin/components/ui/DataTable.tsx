"use client";

import React from "react";
import { ChevronRight } from "lucide-react";

interface Column<T> {
    header: string;
    accessorKey?: keyof T;
    cell?: (item: T) => React.ReactNode;
    className?: string;
}

interface DataTableProps<T> {
    data: T[];
    columns: Column<T>[];
    onRowClick?: (item: T) => void;
    isLoading?: boolean;
    emptyMessage?: string;
}

export function DataTable<T extends { id: string | number }>({
    data,
    columns,
    onRowClick,
    isLoading,
    emptyMessage = "No data available",
}: DataTableProps<T>) {
    if (isLoading) {
        return <div className="p-8 text-center text-gray-500">Loading...</div>;
    }

    if (data.length === 0) {
        return (
            <div className="p-8 text-center text-gray-500 border border-gray-200 rounded-lg bg-white">
                {emptyMessage}
            </div>
        );
    }

    return (
        <div className="w-full border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
            <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                        {columns.map((column, index) => (
                            <th
                                key={index}
                                className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${column.className || ""}`}
                            >
                                {column.header}
                            </th>
                        ))}
                        {onRowClick && <th className="px-6 py-3 w-10"></th>}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {data.map((item) => (
                        <tr
                            key={item.id}
                            onClick={() => onRowClick?.(item)}
                            className={`group transition-colors ${onRowClick ? "cursor-pointer hover:bg-gray-50" : ""
                                }`}
                        >
                            {columns.map((column, index) => (
                                <td
                                    key={index}
                                    className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${column.className || ""}`}
                                >
                                    {column.cell
                                        ? column.cell(item)
                                        : column.accessorKey
                                            ? (item[column.accessorKey] as React.ReactNode)
                                            : null}
                                </td>
                            ))}
                            {onRowClick && (
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600" />
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
