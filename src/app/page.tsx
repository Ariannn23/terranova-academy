import Image from "next/image";
import Link from "next/link";
import {
  BarChart3,
  BookOpenCheck,
  GraduationCap,
  MessageSquareText,
} from "lucide-react";

const benefits = [
  {
    title: "Gestion academica",
    description:
      "Organiza cursos, notas, asistencia y seguimiento escolar desde un entorno centralizado.",
    icon: GraduationCap,
  },
  {
    title: "Matriculas y estudiantes",
    description:
      "Acompana el registro, historial y perfil integral de cada estudiante con mayor orden.",
    icon: BookOpenCheck,
  },
  {
    title: "Pagos y reportes",
    description:
      "Consulta informacion financiera, recibos y reportes institucionales de forma clara.",
    icon: BarChart3,
  },
  {
    title: "Comunicacion escolar",
    description:
      "Mantiene conectada a la comunidad educativa con comunicados y gestion administrativa.",
    icon: MessageSquareText,
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white shadow-lg shadow-emerald-900/30">
            <Image
              src="/terranova-icono.png"
              alt="TerraNova Academy"
              width={32}
              height={32}
              className="object-contain"
              priority
            />
          </div>
          <div>
            <p className="text-lg font-bold leading-tight">
              TerraNova Academy
            </p>
            <p className="text-xs font-medium text-emerald-300">
              Plataforma escolar
            </p>
          </div>
        </div>

        <Link
          href="/login"
          className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-100"
        >
          Iniciar sesi&oacute;n
        </Link>
      </header>

      <section className="mx-auto grid max-w-7xl gap-12 px-6 pb-16 pt-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:pb-24 lg:pt-20">
        <div>
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.28em] text-emerald-300">
            Plataforma escolar integral
          </p>
          <h1 className="max-w-4xl text-4xl font-bold tracking-tight md:text-6xl">
            TerraNova Academy
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            Gestion academica moderna para centralizar estudiantes,
            matriculas, asistencia, notas, pagos, reportes y comunicacion
            institucional en una plataforma segura y organizada.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/login"
              className="rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-950/30 transition hover:bg-emerald-400"
            >
              Acceder al sistema
            </Link>
            <a
              href="#beneficios"
              className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:border-emerald-300 hover:text-emerald-200"
            >
              Ver beneficios
            </a>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-8 shadow-2xl shadow-slate-950/40">
          <div className="mb-8 flex items-center justify-between border-b border-white/10 pb-6">
            <div>
              <p className="text-sm font-medium text-slate-400">
                Panel institucional
              </p>
              <h2 className="mt-1 text-2xl font-semibold">
                Control escolar inteligente
              </h2>
            </div>
            <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-semibold text-emerald-200">
              Seguro
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ["Asistencia", "Registro diario"],
              ["Notas", "Seguimiento academico"],
              ["Pagos", "Control financiero"],
              ["Reportes", "Informacion exportable"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl bg-white/10 p-4">
                <p className="text-sm text-slate-400">{label}</p>
                <p className="mt-2 text-lg font-semibold">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="beneficios"
        className="border-y border-white/10 bg-white/[0.03] px-6 py-16"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-300">
              Gestion conectada
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
              Herramientas para una administracion escolar mas ordenada
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {benefits.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-white/10 bg-slate-900/80 p-5"
              >
                <item.icon className="h-6 w-6 text-emerald-300" />
                <h3 className="mt-5 text-lg font-semibold">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-6 py-14 md:flex-row md:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-300">
            TerraNova Academy
          </p>
          <h2 className="mt-3 text-3xl font-bold">
            Una plataforma preparada para acompanar la gestion del colegio.
          </h2>
        </div>
        <Link
          href="/login"
          className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-100"
        >
          Ingresar ahora
        </Link>
      </section>
    </main>
  );
}
