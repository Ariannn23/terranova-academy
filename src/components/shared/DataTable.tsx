"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { EmptyState } from "./EmptyState";
import {
  filterBySearchKeys,
  getNestedValue,
  getTotalPages,
  paginate,
} from "@/services/table.service";

interface Column<T> {
  header: string;
  accessorKey: keyof T | string;
  cell?: (item: T) => React.ReactNode;
  align?: "left" | "center" | "right";
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchPlaceholder?: string;
  searchKey?: keyof T | string | string[];
  onRowClick?: (item: T) => void;
}

export function DataTable<T>({
  data,
  columns,
  searchPlaceholder = "Buscar...",
  searchKey,
  onRowClick,
}: DataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const searchKeys = searchKey
    ? Array.isArray(searchKey)
      ? searchKey.map(String)
      : [String(searchKey)]
    : [];
  const filteredData = searchKey
    ? filterBySearchKeys(data, search, searchKeys)
    : data;

  const totalPages = getTotalPages(filteredData.length, itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = paginate(filteredData, currentPage, itemsPerPage);

  const prevPage = () => setCurrentPage((p) => Math.max(1, p - 1));
  const nextPage = () => setCurrentPage((p) => Math.min(totalPages, p + 1));

  const alignClass = (align?: "left" | "center" | "right") => {
    if (align === "center") return "text-center";
    if (align === "right") return "text-right";
    return "text-left";
  };

  return (
    <div className="space-y-4">
      {searchKey && (
        <div className="flex items-center relative max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-9 bg-white"
          />
        </div>
      )}

      <div className="rounded-md border bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              {columns.map((col, i) => (
                <TableHead
                  key={i}
                  className={`font-semibold text-slate-600 ${alignClass(col.align)} ${
                    col.align === "left" ? "pl-8" : ""
                  }`}
                >
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentData.length > 0 ? (
              currentData.map((item, rowIndex) => (
                <TableRow
                  key={rowIndex}
                  className={`hover:bg-slate-50/50 ${onRowClick ? "cursor-pointer" : ""}`}
                  onClick={() => onRowClick && onRowClick(item)}
                >
                  {columns.map((col, colIndex) => (
                    <TableCell
                      key={colIndex}
                      className={`py-3 ${alignClass(col.align)}`}
                    >
                      {col.cell
                        ? col.cell(item)
                        : getNestedValue(item, String(col.accessorKey))}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-48 text-center"
                >
                  <EmptyState
                    title="No se encontraron resultados"
                    description="Intenta ajustar tus filtros o buscar con otro término."
                  />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border border-t-0 rounded-b-md">
        <div className="text-xs text-slate-500 italic">
          Mostrando {startIndex + 1}-
          {Math.min(startIndex + itemsPerPage, filteredData.length)} de{" "}
          {filteredData.length}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={prevPage}
            disabled={currentPage === 1}
            className="h-8 w-8 p-0 shadow-sm bg-white"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-xs font-semibold px-2 text-slate-600">
            {currentPage} / {totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={nextPage}
            disabled={currentPage === totalPages}
            className="h-8 w-8 p-0 shadow-sm bg-white"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
