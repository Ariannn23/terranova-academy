"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Edit2,
  Trash2,
  Calendar as CalendarIcon,
  Clock,
} from "lucide-react";
import { CalendarModal } from "./CalendarModal";
import { format, isSameDay } from "date-fns";
import { es } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { deleteCalendarEvent } from "@/lib/actions/calendar.actions";
import { useRouter } from "next/navigation";
import type { CalendarEventView, CalendarEventsByMonth } from "@/types/calendar";

export function CalendarClient({
  initialData,
  academicYearId,
}: {
  initialData: CalendarEventView[];
  academicYearId: string;
}) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<CalendarEventView | null>(
    null,
  );

  const openNewEventModal = () => {
    setEventToEdit(null);
    setIsModalOpen(true);
  };

  const openEditModal = (event: CalendarEventView) => {
    setEventToEdit(event);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este evento?")) return;

    toast.loading("Eliminando...", { id: "del-evt" });
    const res = await deleteCalendarEvent(id);
    if (res.success) {
      toast.success("Evento eliminado.", { id: "del-evt" });
      router.refresh();
    } else {
      toast.error(res.error as string, { id: "del-evt" });
    }
  };

  const getEventStyle = (type: string) => {
    switch (type) {
      case "EXAMEN":
        return {
          bg: "bg-red-50 hover:bg-red-100",
          border: "border-red-200",
          text: "text-red-700",
          badge: "bg-red-100 text-red-700 hover:bg-red-200",
        };
      case "FERIADO":
        return {
          bg: "bg-slate-50 hover:bg-slate-100",
          border: "border-slate-200",
          text: "text-slate-600",
          badge: "bg-slate-200 text-slate-700 hover:bg-slate-300",
        };
      case "REUNION":
        return {
          bg: "bg-purple-50 hover:bg-purple-100",
          border: "border-purple-200",
          text: "text-purple-700",
          badge: "bg-purple-100 text-purple-700 hover:bg-purple-200",
        };
      default: // ACTIVIDAD
        return {
          bg: "bg-blue-50 hover:bg-blue-100",
          border: "border-blue-200",
          text: "text-blue-700",
          badge: "bg-blue-100 text-blue-700 hover:bg-blue-200",
        };
    }
  };

  // Agrupar eventos por Mes
  const groupedEvents = initialData.reduce<CalendarEventsByMonth>((acc, event) => {
    const monthYear = format(new Date(event.date), "MMMM yyyy", { locale: es });
    if (!acc[monthYear]) acc[monthYear] = [];
    acc[monthYear].push(event);
    return acc;
  }, {});

  const formatEventDate = (
    dateStr: Date | string,
    endDateStr?: Date | string | null,
  ) => {
    const start = new Date(dateStr);
    if (!endDateStr) return format(start, "d 'de' MMMM", { locale: es });

    const end = new Date(endDateStr);
    if (isSameDay(start, end))
      return format(start, "d 'de' MMMM", { locale: es });

    if (start.getMonth() === end.getMonth()) {
      return `${format(start, "d")} al ${format(end, "d 'de' MMMM", { locale: es })}`;
    }

    return `${format(start, "d MMM", { locale: es })} al ${format(end, "d MMM", { locale: es })}`;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Calendario Académico"
        description="Gestiona las actividades, feriados, exámenes y reuniones del año escolar."
        action={
          <Button
            onClick={openNewEventModal}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Evento
          </Button>
        }
      />

      {initialData.length === 0 ? (
        <div className="p-12 text-center text-slate-500 bg-white rounded-xl border border-slate-200 shadow-sm">
          <CalendarIcon className="w-12 h-12 mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-medium text-slate-700 mb-1">
            No hay eventos programados
          </h3>
          <p className="text-sm">Agrega el primer evento del año escolar.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedEvents).map(
            ([month, events]) => (
              <div key={month} className="space-y-4">
                <h3 className="text-xl font-bold text-slate-800 capitalize border-b pb-2 flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-slate-400" />
                  {month}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {events.map((event) => {
                    const style = getEventStyle(event.type);
                    return (
                      <div
                        key={event.id}
                        className={`relative p-5 rounded-xl border transition-colors group ${style.bg} ${style.border}`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <Badge
                            variant="secondary"
                            className={`${style.badge} text-[10px]`}
                          >
                            {event.type.replace("_", " ")}
                          </Badge>
                          <div className="flex space-x-1 opacity-0 transition-opacity group-hover:opacity-100 absolute top-3 right-3">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 bg-white/50 hover:bg-white text-blue-600"
                              onClick={() => openEditModal(event)}
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 bg-white/50 hover:bg-red-100 text-red-600"
                              onClick={() => handleDelete(event.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>

                        <h4
                          className={`font-bold text-lg mb-1 pr-12 leading-tight ${style.text}`}
                        >
                          {event.title}
                        </h4>

                        <div className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-slate-400" />
                          {formatEventDate(event.date, event.endDate)}
                        </div>

                        {event.description && (
                          <p className="text-sm text-slate-600 line-clamp-2">
                            {event.description}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ),
          )}
        </div>
      )}

      <CalendarModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        eventToEdit={eventToEdit}
        academicYearId={academicYearId}
      />
    </div>
  );
}
