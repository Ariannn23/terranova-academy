import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Download,
  GraduationCap,
  Laptop,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Send,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from "lucide-react";

import { PublicHeader } from "@/app/_components/public/PublicHeader";
import { navItems } from "@/app/_components/public/nav-items";

const benefits = [
  {
    title: "Plataforma Integral",
    description:
      "Gestión académica completa: calificaciones, asistencia y comunicación directa en un solo entorno.",
    icon: GraduationCap,
    tone: "bg-indigo-100 text-indigo-700",
  },
  {
    title: "Niveles Educativos",
    description:
      "Acompañamos inicial, primaria y secundaria con procesos organizados para cada etapa formativa.",
    icon: BookOpen,
    tone: "bg-emerald-100 text-emerald-700",
  },
  {
    title: "Innovación Tecnológica",
    description:
      "Infraestructura digital moderna que potencia el aprendizaje colaborativo y la gestion escolar.",
    icon: Laptop,
    tone: "bg-slate-200 text-slate-700",
  },
];

const modelCards = [
  {
    title: "Excelencia Académica",
    description:
      "Currículo orientado al pensamiento crítico, resolución de problemas y preparación para nuevos desafíos.",
    icon: GraduationCap,
  },
  {
    title: "Innovación Constante",
    description:
      "Integramos tecnología y metodologías activas para mantener una experiencia educativa vigente.",
    icon: Sparkles,
  },
  {
    title: "Desarrollo Holístico",
    description:
      "Promovemos habilidades socioemocionales, liderazgo, valores y participación responsable.",
    icon: UsersRound,
  },
];

const values = [
  "Integridad y responsabilidad",
  "Empatía y respeto",
  "Crecimiento continuo",
  "Compromiso con la comunidad",
];

const admissionSteps = [
  {
    title: "Solicitud",
    description:
      "Completa el formulario inicial y envia la documentación requerida para abrir el expediente.",
    icon: MessageSquare,
  },
  {
    title: "Entrevista",
    description:
      "Coordinamos una entrevista con la familia para conocer expectativas y resolver dudas.",
    icon: UsersRound,
  },
  {
    title: "Resultados",
    description:
      "El comité de admisiónes comunica la resolución y las indicaciones para la inscripción.",
    icon: CheckCircle2,
  },
];

const faqs = [
  {
    question: "¿Cuáles son las fechas límite de inscripción?",
    answer:
      "El periodo principal de admisiónes cierra a finales de mayo, sujeto a disponibilidad de vacantes.",
  },
  {
    question: "Ofrecen algún programa de becas?",
    answer:
      "La evaluación de beneficios se realiza durante el proceso de admisión, según criterios institucionales.",
  },
  {
    question: "¿Qué nivel de ingles se requiere?",
    answer:
      "No se exige un nivel único de ingreso; se realiza una evaluación diagnóstica para acompañar al estudiante.",
  },
];

const footerLinks = [
  "Inicio",
  "Nuestra Propuesta",
  "Admisiónes",
  "Contacto",
  "Portal Instituciónal",
  "Aviso de Privacidad",
  "Términos y Condiciones",
  "Preguntas Frecuentes",
];



function PortalMockup() {
  const rows = [
    ["Sofia Castillo", "Primaria", "Activo"],
    ["Mateo Rivas", "Secundaria", "Activo"],
    ["Valeria Torres", "Inicial", "Activo"],
    ["Nicolas Prado", "Primaria", "Activo"],
  ];

  return (
    <div className="rounded-2xl border border-slate-300 bg-slate-100 p-2 shadow-2xl shadow-slate-300/60">
      <div className="mb-2 flex items-center gap-2 px-2 pt-1">
        <span className="h-3 w-3 rounded-full bg-red-500" />
        <span className="h-3 w-3 rounded-full bg-amber-400" />
        <span className="h-3 w-3 rounded-full bg-emerald-500" />
      </div>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="grid min-h-[270px] grid-cols-[108px_1fr] sm:min-h-[330px] sm:grid-cols-[135px_1fr]">
          <aside className="bg-slate-950 p-4 text-white">
            <div className="mb-8 flex items-center gap-2">
              <Image
                src="/terranova-icono.png"
                alt=""
                width={20}
                height={20}
                className="rounded-sm"
              />
              <span className="hidden text-xs font-semibold sm:inline">
                TerraNova
              </span>
            </div>
            {["Inicio", "Matriculas", "Estudiantes", "Notas", "Pagos"].map(
              (item, index) => (
                <div
                  key={item}
                  className={`mb-2 rounded-md px-2 py-2 text-[10px] ${
                    index === 2
                      ? "bg-emerald-600 text-white"
                      : "text-slate-400"
                  }`}
                >
                  {item}
                </div>
              ),
            )}
          </aside>

          <div className="p-4">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-emerald-700">
                  Gestion escolar
                </p>
                <h3 className="text-lg font-bold text-slate-950">
                  Directorio de Estudiantes
                </h3>
              </div>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-semibold text-emerald-700">
                Online
              </span>
            </div>

            <div className="mb-4 grid grid-cols-3 gap-3">
              {["Buscar", "Nivel", "Estado"].map((item) => (
                <div
                  key={item}
                  className="h-8 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-[10px] text-slate-500"
                >
                  {item}
                </div>
              ))}
            </div>

            <div className="space-y-2">
              {rows.map((row) => (
                <div
                  key={row[0]}
                  className="grid grid-cols-[1fr_72px_54px] items-center rounded-lg border border-slate-100 bg-white px-3 py-2 text-[10px] shadow-sm sm:text-xs"
                >
                  <span className="font-semibold text-slate-800">{row[0]}</span>
                  <span className="text-slate-500">{row[1]}</span>
                  <span className="rounded-full bg-emerald-50 px-2 py-1 text-center font-semibold text-emerald-700">
                    {row[2]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function HeroSection() {
  return (
    <section
      id="inicio"
      className="mx-auto grid max-w-7xl gap-12 px-5 py-20 lg:grid-cols-[1fr_1.05fr] lg:items-center lg:px-8 lg:py-28"
    >
      <div>
        <p className="mb-5 inline-flex rounded-full bg-emerald-100 px-4 py-2 text-xs font-semibold uppercase text-emerald-800">
          Plataforma educativa moderna
        </p>
        <h1 className="max-w-3xl text-5xl font-black tracking-tight text-slate-950 md:text-6xl">
          Educación que trasciende, tecnología que conecta.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-700">
          TerraNova Academy integra educacion, innovacion tecnológica y gestion
          escolar moderna para formar estudiantes preparados para liderar el
          mañana.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <a
            href="#admisiónes"
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-6 py-3 text-sm font-semibold text-white shadow-sm outline-none transition hover:bg-emerald-800"
          >
            Conocer Admisiónes
            <ArrowRight className="h-4 w-4" />
          </a>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-950 outline-none transition hover:border-emerald-700 hover:text-emerald-800"
          >
            Acceso Portal
          </Link>
        </div>
      </div>

      <PortalMockup />
    </section>
  );
}

function BenefitsSection() {
  return (
    <section className="border-y border-slate-100 bg-[#f7f3f5] px-5 py-20 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-3">
        {benefits.map((item) => (
          <article
            key={item.title}
            className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm"
          >
            <div
              className={`mb-7 flex h-12 w-12 items-center justify-center rounded-xl ${item.tone}`}
            >
              <item.icon className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-bold text-slate-950">{item.title}</h2>
            <p className="mt-4 leading-7 text-slate-600">{item.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function ExcellenceSection() {
  return (
    <section className="bg-white px-5 py-20 lg:px-8">
      <div className="mx-auto grid max-w-7xl overflow-hidden rounded-3xl border border-slate-900/10 bg-slate-950 shadow-2xl shadow-slate-200 lg:grid-cols-2">
        <div className="p-8 text-white md:p-12">
          <h2 className="text-3xl font-bold">Excelencia Educativa</h2>
          <p className="mt-6 max-w-xl leading-8 text-slate-300">
            Con una profunda herencia academica y una visión orientada hacia el
            futuro, cultivamos un ambiente que inspira curiosidad, pensamiento
            crítico y crecimiento continuo.
          </p>
          <a
            href="#propuesta"
            className="mt-8 inline-flex rounded-lg bg-emerald-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600"
          >
            Conoce Nuestra Historia
          </a>
        </div>
        <div className="relative min-h-[300px] bg-slate-800">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.28),transparent_30%),linear-gradient(135deg,rgba(15,23,42,0.2),rgba(15,23,42,0.86))]" />
          <div className="absolute inset-x-8 bottom-8 grid grid-cols-5 gap-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="h-28 rounded-t-full bg-white/15 shadow-lg ring-1 ring-white/20"
              />
            ))}
          </div>
          <div className="absolute left-8 top-8 rounded-2xl bg-white/10 p-4 text-white backdrop-blur">
            <p className="text-sm font-semibold">Promoción TerraNova</p>
            <p className="text-xs text-slate-300">Aprender. Crear. Liderar.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProposalSection() {
  return (
    <section id="propuesta" className="bg-[#fbf8f9] px-5 py-24 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mx-auto mb-5 inline-flex rounded-full bg-emerald-100 px-4 py-2 text-xs font-semibold text-emerald-800">
            Nuestra Filosofia
          </p>
          <h2 className="text-4xl font-black tracking-tight text-slate-950 md:text-5xl">
            Forjando el futuro a través de la excelencia y la innovacion
          </h2>
          <p className="mt-6 text-lg leading-8 text-slate-600">
            El Modelo TerraNova combina excelencia academica, innovacion
            constante y desarrollo holistico para preparar estudiantes capaces
            de transformar su entorno.
          </p>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <article className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-950 text-white">
              <GraduationCap className="h-6 w-6" />
            </div>
            <h3 className="text-2xl font-bold text-slate-950">
              El Modelo TerraNova
            </h3>
            <p className="mt-5 max-w-3xl leading-8 text-slate-600">
              Una aproximacion holistica que equilibra conocimiento profundo,
              habilidades practicas y valores eticos. Nuestro modelo integra
              tutoria, tecnología y acompañamiento permanente.
            </p>
            <ul className="mt-8 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
              {values.map((value) => (
                <li key={value} className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-700" />
                  {value}
                </li>
              ))}
            </ul>
          </article>

          <div className="grid gap-6">
            {modelCards.map((card, index) => (
              <article
                key={card.title}
                className={`rounded-2xl border p-6 shadow-sm ${
                  index === 2
                    ? "border-slate-900 bg-slate-950 text-white"
                    : "border-slate-200 bg-white text-slate-950"
                }`}
              >
                <div
                  className={`mb-5 flex h-10 w-10 items-center justify-center rounded-lg ${
                    index === 2
                      ? "bg-white/10 text-emerald-200"
                      : "bg-emerald-50 text-emerald-700"
                  }`}
                >
                  <card.icon className="h-5 w-5" />
                </div>
                <h3 className="font-bold">{card.title}</h3>
                <p
                  className={`mt-3 text-sm leading-6 ${
                    index === 2 ? "text-slate-300" : "text-slate-600"
                  }`}
                >
                  {card.description}
                </p>
              </article>
            ))}
          </div>
        </div>

        <div className="mt-16 grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <h3 className="text-3xl font-bold text-slate-950">
              Nuestros Valores Fundamentales
            </h3>
            <p className="mt-5 leading-8 text-slate-600">
              Nuestros valores guian cada decision, cada clase y cada
              interaccion dentro de la comunidad educativa.
            </p>
            <div className="mt-8 space-y-5">
              {values.slice(0, 3).map((value) => (
                <div key={value} className="flex gap-4">
                  <ShieldCheck className="mt-1 h-6 w-6 text-emerald-700" />
                  <div>
                    <p className="font-semibold text-slate-900">{value}</p>
                    <p className="text-sm text-slate-600">
                      Actuamos con coherencia, respeto y visión de futuro.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="grid gap-4 sm:grid-cols-2">
              {["Investigacion", "Arte", "Deporte", "Tecnología"].map(
                (item, index) => (
                  <div
                    key={item}
                    className={`rounded-2xl p-6 ${
                      index === 0
                        ? "bg-emerald-700 text-white"
                        : "bg-slate-100 text-slate-900"
                    }`}
                  >
                    <p className="text-3xl font-black">0{index + 1}</p>
                    <p className="mt-6 font-semibold">{item}</p>
                  </div>
                ),
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function AdmissionsSection() {
  return (
    <section id="admisiónes" className="bg-white px-5 py-24 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="mb-5 inline-flex rounded-full bg-emerald-100 px-4 py-2 text-xs font-semibold text-emerald-800">
              Ciclo 2024-2025
            </p>
            <h2 className="text-4xl font-black tracking-tight text-slate-950 md:text-5xl">
              Únete a nuestra comunidad de excelencia.
            </h2>
            <p className="mt-6 leading-8 text-slate-600">
              El proceso de admisión está diseñado para conocer a fondo a cada
              aspirante, buscando familias que compartan nuestra visión de
              crecimiento, innovacion y excelencia academica.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="#consulta-admisiónes"
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-800"
              >
                <Download className="h-4 w-4" />
                Descargar Prospecto
              </a>
              <a
                href="#contacto"
                className="inline-flex rounded-lg border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-900 hover:border-emerald-700 hover:text-emerald-800"
              >
                Agendar Visita
              </a>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-900 bg-slate-950 p-4 shadow-2xl">
            <div className="rounded-xl bg-gradient-to-br from-emerald-100 via-slate-100 to-white p-8">
              <div className="grid min-h-[280px] content-end gap-4 rounded-xl bg-[linear-gradient(90deg,rgba(15,23,42,0.9),rgba(15,23,42,0.35)),repeating-linear-gradient(90deg,rgba(15,23,42,0.18)_0,rgba(15,23,42,0.18)_1px,transparent_1px,transparent_18px)] p-6 text-white">
                <p className="max-w-sm text-2xl font-bold">
                  Campus pensado para aprender, convivir y crear futuro.
                </p>
                <p className="max-w-sm text-sm text-slate-200">
                  Espacios academicos, tecnología y acompañamiento cercano en
                  cada etapa.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-20 text-center">
          <h3 className="text-3xl font-bold text-slate-950">
            Proceso de Admisión en 3 Pasos
          </h3>
          <p className="mx-auto mt-4 max-w-2xl text-slate-600">
            Un camino claro y estructurado para asegurar la mejor integracion de
            tu hijo a nuestra propuesta educativa.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {admissionSteps.map((step, index) => (
            <article
              key={step.title}
              className="rounded-2xl border border-slate-200 bg-[#fbf8f9] p-8 text-center shadow-sm"
            >
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-200 text-emerald-800">
                <step.icon className="h-7 w-7" />
              </div>
              <h4 className="text-xl font-bold text-slate-950">
                {index + 1}. {step.title}
              </h4>
              <p className="mt-4 leading-7 text-slate-600">
                {step.description}
              </p>
            </article>
          ))}
        </div>

        <div
          id="consulta-admisiónes"
          className="mt-20 grid gap-8 lg:grid-cols-[1fr_0.95fr]"
        >
          <div>
            <h3 className="text-3xl font-bold text-slate-950">
              Preguntas Frecuentes
            </h3>
            <p className="mt-4 text-slate-600">
              Resolvemos las dudas mas comunes sobre nuestro proceso
              institucional.
            </p>
            <div className="mt-8 space-y-4">
              {faqs.map((faq, index) => (
                <article
                  key={faq.question}
                  className="rounded-xl border border-slate-200 bg-white p-5"
                >
                  <h4 className="flex items-center justify-between gap-4 text-sm font-bold text-slate-950">
                    {faq.question}
                    <span className="text-emerald-700">0{index + 1}</span>
                  </h4>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {faq.answer}
                  </p>
                </article>
              ))}
            </div>
          </div>

          <form className="rounded-2xl bg-slate-950 p-8 text-white shadow-2xl">
            <h3 className="text-2xl font-bold">¿Tienes más dudas?</h3>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Nuestro departamento de admisiónes está listo para ayudarte en
              cada paso.
            </p>
            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              <label className="text-sm">
                Nombre del Tutor
                <input
                  type="text"
                  placeholder="Ej. Carlos"
                  className="mt-2 w-full rounded-lg border border-white/10 px-4 py-3 text-slate-950"
                />
              </label>
              <label className="text-sm">
                Apellidos
                <input
                  type="text"
                  placeholder="Ej. Mendoza"
                  className="mt-2 w-full rounded-lg border border-white/10 px-4 py-3 text-slate-950"
                />
              </label>
              <label className="text-sm sm:col-span-2">
                Correo Electrónico
                <input
                  type="email"
                  placeholder="correo@ejemplo.com"
                  className="mt-2 w-full rounded-lg border border-white/10 px-4 py-3 text-slate-950"
                />
              </label>
              <label className="text-sm sm:col-span-2">
                Grado de Interes
                <select className="mt-2 w-full rounded-lg border border-white/10 px-4 py-3 text-slate-950">
                  <option>Selecciona un nivel...</option>
                  <option>Inicial</option>
                  <option>Primaria</option>
                  <option>Secundaria</option>
                </select>
              </label>
              <label className="text-sm sm:col-span-2">
                Mensaje
                <textarea
                  rows={4}
                  placeholder="Como podemos ayudarte?"
                  className="mt-2 w-full rounded-lg border border-white/10 px-4 py-3 text-slate-950"
                />
              </label>
            </div>
            <button
              type="button"
              className="mt-6 w-full rounded-lg bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600"
            >
              Enviar Solicitud de Informacion
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

function ContactSection() {
  return (
    <section id="contacto" className="bg-[#fbf8f9] px-5 py-24 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto mb-7 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-200 text-emerald-800">
            <Mail className="h-8 w-8" />
          </div>
          <h2 className="text-4xl font-black tracking-tight text-slate-950 md:text-5xl">
            Estamos aquí para escucharte.
          </h2>
          <p className="mt-6 text-lg leading-8 text-slate-600">
            Ya sea que tengas preguntas sobre admisión, nuestra propuesta
            academica o simplemente quieras conocer más sobre TerraNova Academy,
            nuestro equipo está listo para asistirte.
          </p>
        </div>

        <div className="mt-16 grid gap-6 lg:grid-cols-[0.8fr_1.6fr]">
          <div className="space-y-6">
            <article className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
              <h3 className="text-2xl font-bold text-slate-950">
                Informacion Directa
              </h3>
              <div className="mt-6 space-y-5">
                <p className="flex gap-4 text-slate-700">
                  <Phone className="h-5 w-5 text-emerald-700" />
                  <span>
                    <strong className="block text-slate-950">
                      Teléfono Principal
                    </strong>
                    +1 (234) 567-890
                  </span>
                </p>
                <p className="flex gap-4 text-slate-700">
                  <Mail className="h-5 w-5 text-emerald-700" />
                  <span>
                    <strong className="block text-slate-950">
                      Correo Electrónico
                    </strong>
                    admisiónes@terranova.edu
                  </span>
                </p>
              </div>
            </article>
            <article className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
              <h3 className="text-2xl font-bold text-slate-950">
                Horario de Atención
              </h3>
              <div className="mt-6 space-y-4 text-slate-700">
                <p className="flex justify-between gap-4">
                  <span>Lunes - Viernes</span>
                  <strong>8:00 AM - 5:00 PM</strong>
                </p>
                <p className="flex justify-between gap-4 border-t border-slate-100 pt-4">
                  <span>Sábados</span>
                  <strong>9:00 AM - 1:00 PM</strong>
                </p>
              </div>
            </article>
          </div>

          <div className="space-y-6">
            <form className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
              <h3 className="text-2xl font-bold text-slate-950">
                Envíanos un Mensaje
              </h3>
              <p className="mt-3 text-slate-600">
                Completa el siguiente formulario visual y nuestro equipo se
                pondrá en contacto contigo.
              </p>
              <div className="mt-7 grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-medium text-slate-700">
                  Nombre
                  <input
                    type="text"
                    placeholder="Ej. Juan"
                    className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3"
                  />
                </label>
                <label className="text-sm font-medium text-slate-700">
                  Apellidos
                  <input
                    type="text"
                    placeholder="Ej. Perez"
                    className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3"
                  />
                </label>
                <label className="text-sm font-medium text-slate-700 sm:col-span-2">
                  Correo
                  <input
                    type="email"
                    placeholder="juan.perez@ejemplo.com"
                    className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3"
                  />
                </label>
                <label className="text-sm font-medium text-slate-700 sm:col-span-2">
                  Area de Interes
                  <select className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3">
                    <option>Selecciona una opción</option>
                    <option>Admisiónes</option>
                    <option>Propuesta academica</option>
                    <option>Servicios administrativos</option>
                  </select>
                </label>
                <label className="text-sm font-medium text-slate-700 sm:col-span-2">
                  Mensaje
                  <textarea
                    rows={4}
                    placeholder="En que podemos ayudarte?"
                    className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3"
                  />
                </label>
              </div>
              <button
                type="button"
                className="mt-7 inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
              >
                <Send className="h-4 w-4" />
                Enviar Mensaje
              </button>
            </form>

            <article className="grid overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:grid-cols-[1fr_0.95fr]">
              <div className="relative min-h-[260px] bg-slate-200">
                <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(15,23,42,0.25),rgba(15,23,42,0.72)),repeating-linear-gradient(45deg,rgba(255,255,255,0.55)_0,rgba(255,255,255,0.55)_1px,transparent_1px,transparent_24px)]" />
                <div className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-emerald-700 text-white shadow-xl">
                  <MapPin className="h-7 w-7" />
                </div>
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-bold text-slate-950">
                  Nuestra Ubicación
                </h3>
                <p className="mt-5 flex gap-3 leading-7 text-slate-700">
                  <MapPin className="mt-1 h-5 w-5 text-emerald-700" />
                  Av. de la Excelencia 1234, Distrito Innovacion, Ciudad
                  Metropolitana, CP 54321
                </p>
                <a
                  href="#contacto"
                  className="mt-6 inline-flex items-center gap-2 font-semibold text-emerald-700"
                >
                  Ver en Google Maps
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}

function PublicFooter() {
  return (
    <footer className="bg-slate-950 px-5 py-12 text-slate-400 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[1.2fr_2fr]">
        <div>
          <div className="flex items-center gap-3">
            <Image
              src="/terranova-icono.png"
              alt=""
              width={34}
              height={34}
              className="rounded-md bg-white"
            />
            <p className="text-xl font-bold text-white">TerraNova Academy</p>
          </div>
          <p className="mt-5 max-w-sm leading-7">
            Institución dedicada a la excelencia academica y la innovacion
            constante para el desarrollo integral de los estudiantes.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <h3 className="font-semibold text-white">Enlaces Rápidos</h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.slice(0, 4).map((link, index) => (
                <li key={link}>
                  <a href={`#${navItems[index]?.href ?? "inicio"}`}>{link}</a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-white">Comunidad</h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link href="/login">Portal Instituciónal</Link>
              </li>
              <li>
                <Link href="/login">Portal Docente</Link>
              </li>
              <li>
                <a href="#admisiónes">Admisiónes</a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-white">Legal</h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.slice(5).map((link) => (
                <li key={link}>
                  <a href="#contacto">{link}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <div className="mx-auto mt-10 max-w-7xl border-t border-white/10 pt-8 text-sm">
        © 2024 TerraNova Academy. Todos los derechos reservados.
      </div>
    </footer>
  );
}

export default function HomePage() {
  return (
    <>
      <PublicHeader />
      <main className="bg-white">
        <HeroSection />
        <BenefitsSection />
        <ExcellenceSection />
        <ProposalSection />
        <AdmissionsSection />
        <ContactSection />
      </main>
      <PublicFooter />
    </>
  );
}
