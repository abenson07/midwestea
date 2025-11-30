"use client";

import React from "react";
import { ChevronRight, Pencil } from "lucide-react";

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
    onEditClick?: (item: T, e: React.MouseEvent) => void;
    isLoading?: boolean;
    emptyMessage?: string;
}

export function DataTable<T extends { id: string | number }>({
    data,
    columns,
    onRowClick,
    onEditClick,
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
        <>
            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
                {data.map((item) => (
                    <div
                        key={item.id}
                        onClick={() => onRowClick?.(item)}
                        className={`bg-white border border-gray-200 rounded-lg p-4 ${onRowClick ? "active:bg-gray-50 cursor-pointer" : ""
                            }`}
                    >
                        <div className="space-y-2">
                            {columns.map((column, index) => (
                                <div key={index} className="flex justify-between items-start">
                                    <span className="text-xs font-medium text-gray-500 uppercase">
                                        {column.header}
                                    </span>
                                    <span className={`text-sm text-gray-900 text-right ${column.className || ""}`}>
                                        {column.cell
                                            ? column.cell(item)
                                            : column.accessorKey
                                                ? (item[column.accessorKey] as React.ReactNode)
                                                : null}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
                            {onEditClick && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onEditClick(item, e);
                                    }}
                                    className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-50 transition-colors"
                                    aria-label="Edit"
                                >
                                    <Pencil className="h-4 w-4" />
                                </button>
                            )}
                            {onRowClick && (
                                <div className="flex-1 flex justify-end">
                                    <ChevronRight className="h-5 w-5 text-gray-400" />
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block w-full border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
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
                            {(onRowClick || onEditClick) && <th className="px-6 py-3 w-20 text-right"></th>}
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
                                {(onRowClick || onEditClick) && (
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end gap-2">
                                            {onEditClick && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onEditClick(item, e);
                                                    }}
                                                    className="p-1.5 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors opacity-0 group-hover:opacity-100"
                                                    aria-label="Edit"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </button>
                                            )}
                                            {onRowClick && (
                                                <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600" />
                                            )}
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
}
