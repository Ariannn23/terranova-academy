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

interface Column<T> {
  header: string;
  accessorKey: keyof T | string;
  cell?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchPlaceholder?: string;
  searchKey?: keyof T;
}

export function DataTable<T>({
  data,
  columns,
  searchPlaceholder = "Buscar...",
  searchKey,
}: DataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filtrado
  const filteredData = data.filter((item) => {
    if (!search || !searchKey) return true;
    const value = item[searchKey];
    if (typeof value === "string") {
      return value.toLowerCase().includes(search.toLowerCase());
    }
    return true;
  });

  // Paginación
  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  // Mover a página anterior
  const prevPage = () => setCurrentPage((p) => Math.max(1, p - 1));
  const nextPage = () => setCurrentPage((p) => Math.min(totalPages, p + 1));

  return (
    <div className="space-y-4">
      {/* Buscador */}
      {searchKey && (
        <div className="flex items-center relative max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1); // Reset page on search
            }}
            className="pl-9 bg-white"
          />
        </div>
      )}

      {/* Tabla */}
      <div className="rounded-md border bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              {columns.map((col, i) => (
                <TableHead key={i} className="font-semibold text-slate-600">
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentData.length > 0 ? (
              currentData.map((item, rowIndex) => (
                <TableRow key={rowIndex} className="hover:bg-slate-50/50">
                  {columns.map((col, colIndex) => (
                    <TableCell key={colIndex} className="py-3">
                      {col.cell
                        ? col.cell(item)
                        : (item as any)[col.accessorKey]}
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

      {/* Paginación */}
      <div className="flex items-center justify-between px-2">
        <div className="text-sm text-slate-500">
          Mostrando {startIndex + 1} a{" "}
          {Math.min(startIndex + itemsPerPage, filteredData.length)} de{" "}
          {filteredData.length} registros
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={prevPage}
            disabled={currentPage === 1}
            className="h-8 shadow-sm"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Anterior
          </Button>
          <div className="text-sm font-medium px-2 text-slate-600">
            Página {currentPage} de {totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={nextPage}
            disabled={currentPage === totalPages}
            className="h-8 shadow-sm"
          >
            Siguiente
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
