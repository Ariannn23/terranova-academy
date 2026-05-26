"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Megaphone, Trash2, Printer } from "lucide-react";
import { AnnouncementModal } from "./AnnouncementModal";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { useAnnouncementsDirectory } from "./hooks/useAnnouncementsDirectory";

export function AnnouncementsClient({ initialData }: { initialData: any[] }) {
  const {
    isModalOpen,
    searchTerm,
    setSearchTerm,
    levelFilter,
    setLevelFilter,
    filteredAnnouncements,
    handleDelete,
    openCreateModal,
    closeCreateModal,
  } = useAnnouncementsDirectory(initialData);

  const getLevelBadge = (level: string | null) => {
    switch (level) {
      case "INICIAL":
        return (
          <Badge variant="secondary" className="bg-pink-100 text-pink-700">
            Inicial
          </Badge>
        );
      case "PRIMARIA":
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-700">
            Primaria
          </Badge>
        );
      case "SECUNDARIA":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-700">
            Secundaria
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="border-slate-300 text-slate-600">
            General
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="print:hidden">
        <PageHeader
          title="Comunicados y Anuncios"
          description="GestiÃ³n de comunicaciones oficiales para estudiantes, apoderados y personal."
          action={
            <Button
              onClick={openCreateModal}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Comunicado
            </Button>
          }
        />

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Input
            placeholder="Buscar por tÃ­tulo o contenido..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
          <Select value={levelFilter} onValueChange={setLevelFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Destinatarios" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos los Niveles</SelectItem>
              <SelectItem value="INICIAL">Nivel Inicial</SelectItem>
              <SelectItem value="PRIMARIA">Nivel Primaria</SelectItem>
              <SelectItem value="SECUNDARIA">Nivel Secundaria</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAnnouncements.length > 0 ? (
          filteredAnnouncements.map((ann) => (
            <div
              key={ann.id}
              className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col group print:border-none print:shadow-none print:break-inside-avoid"
            >
              <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-start print:bg-white print:border-b-2 print:border-black">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-lg print:hidden">
                    <Megaphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg leading-tight group-hover:text-blue-700 transition-colors print:text-black print:text-xl">
                      {ann.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-2">
                      {getLevelBadge(ann.targetLevel)}
                      <span className="text-xs text-slate-500 font-medium">
                        {format(new Date(ann.createdAt), "d 'de' MMMM, yyyy", {
                          locale: es,
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-5 flex-1 text-slate-600 text-sm whitespace-pre-wrap leading-relaxed print:text-black print:text-base print:px-0">
                {ann.body}
              </div>

              <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                  onClick={() =>
                    window.open(
                      `/api/pdf?type=communication&id=${ann.id}`,
                      "_blank",
                    )
                  }
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Imprimir
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={() => handleDelete(ann.id)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Eliminar
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full p-12 text-center text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
            <Megaphone className="w-12 h-12 mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-medium text-slate-700 mb-1">
              No hay comunicados
            </h3>
            <p className="text-sm">
              No se encontraron anuncios con los filtros actuales.
            </p>
          </div>
        )}
      </div>

      <AnnouncementModal isOpen={isModalOpen} onClose={closeCreateModal} />
    </div>
  );
}
