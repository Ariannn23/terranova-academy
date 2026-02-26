"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  CalendarCheck,
  CreditCard,
  AlertTriangle,
  CalendarDays,
  FileText,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const modules = [
  { name: "Inicio", href: "/dashboard", icon: LayoutDashboard },
  { name: "Matrículas", href: "/dashboard/enrollments", icon: FileText },
  { name: "Estudiantes", href: "/dashboard/students", icon: Users },
  { name: "Calificaciones", href: "/dashboard/grades", icon: GraduationCap },
  { name: "Asistencia", href: "/dashboard/attendance", icon: CalendarCheck },
  { name: "Finanzas", href: "/dashboard/payments", icon: CreditCard },
  { name: "Calendario", href: "/dashboard/calendar", icon: CalendarDays },
  { name: "Incidencias", href: "/dashboard/incidents", icon: AlertTriangle },
  { name: "Reportes", href: "/dashboard/reports", icon: FileText },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Todo esto aplica el responsive design con Tailwind
  return (
    <>
      {/* Opacidad oscura para el móvil cuando está abierto */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Botón Hamburger para Móvil (Visible solo en móvil, flotando arriba) */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden fixed top-3 left-4 z-50 text-slate-700 hover:bg-slate-100"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 bg-slate-900 text-slate-300 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 overflow-y-auto flex flex-col ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand / Logo */}
        <div className="flex items-center justify-center p-6 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center p-1 bg-white rounded-lg shadow-lg shadow-emerald-700/20">
              <Image
                src="/terranova-icono.png"
                alt="TerraNova Logo"
                width={32}
                height={32}
                className="object-contain"
              />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              TerraNova <span className="text-emerald-500">Academy</span>
            </span>
          </div>
        </div>

        {/* Navigation Modules */}
        <nav className="flex-1 p-4 space-y-1">
          <div className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Módulos Principales
          </div>
          {modules.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center space-x-3 px-3 py-3 rounded-md transition-colors ${
                  isActive
                    ? "bg-slate-800 text-emerald-400 font-medium"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer info (Opcional, e.g. ver de sistema) */}
        <div className="p-4 border-t border-slate-800 text-xs text-center text-slate-500">
          TerraNova Academy v1.0
        </div>
      </aside>
    </>
  );
}
