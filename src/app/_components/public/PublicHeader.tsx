"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { LockKeyhole } from "lucide-react";
import { navItems } from "./nav-items";
function scrollToSection(id: string, target: HTMLElement | null) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
  // Remove focus immediately so the outline never shows
  target?.blur();
}

export function PublicHeader() {
  const [activeSection, setActiveSection] = useState<string>("inicio");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-30% 0px -70% 0px" }
    );

    navItems.forEach((item) => {
      const element = document.getElementById(item.href);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  const handleNavClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
      e.preventDefault();
      scrollToSection(sectionId, e.currentTarget);
    },
    []
  );

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur transition-all duration-300">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 lg:px-8">
        {/* Logo */}
        <a
          href="#inicio"
          onClick={(e) => handleNavClick(e, "inicio")}
          className="flex items-center gap-3"
          style={{ outline: "none" }}
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-emerald-50 ring-1 ring-emerald-100">
            <Image
              src="/terranova-icono.png"
              alt="TerraNova Academy"
              width={26}
              height={26}
              className="object-contain"
              priority
            />
          </span>
          <span className="text-xl font-bold tracking-tight text-slate-950">
            TerraNova Academy
          </span>
        </a>

        {/* Desktop nav */}
        <nav
          aria-label="Navegación principal"
          className="hidden items-center gap-8 text-sm font-medium md:flex"
        >
          {navItems.map((item) => {
            const isActive = activeSection === item.href;
            return (
              <a
                key={item.href}
                href={`#${item.href}`}
                onClick={(e) => handleNavClick(e, item.href)}
                style={{ outline: "none" }}
                className={`relative py-2 transition-colors duration-300 ${
                  isActive
                    ? "text-emerald-800"
                    : "text-slate-700 hover:text-emerald-800"
                }`}
              >
                {item.label}
                <span
                  className={`absolute bottom-0 left-0 h-[2px] w-full rounded-t-sm bg-emerald-700 transition-transform duration-300 origin-left ${
                    isActive ? "scale-x-100" : "scale-x-0"
                  }`}
                />
              </a>
            );
          })}
        </nav>

        {/* Intranet button */}
        <Link
          href="/login"
          style={{ outline: "none" }}
          className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition duration-300 hover:bg-emerald-800"
        >
          <LockKeyhole className="h-4 w-4" />
          Intranet
        </Link>
      </div>

      {/* Mobile nav */}
      <nav
        aria-label="Navegación móvil"
        className="flex gap-4 overflow-x-auto border-t border-slate-100 px-5 py-3 text-sm font-medium md:hidden"
      >
        {navItems.map((item) => {
          const isActive = activeSection === item.href;
          return (
            <a
              key={item.href}
              href={`#${item.href}`}
              onClick={(e) => handleNavClick(e, item.href)}
              style={{ outline: "none" }}
              className={`relative whitespace-nowrap px-1 py-1 transition-colors duration-300 ${
                isActive
                  ? "text-emerald-800"
                  : "text-slate-700 hover:text-emerald-800"
              }`}
            >
              {item.label}
              <span
                className={`absolute bottom-0 left-0 h-[2px] w-full rounded-t-sm bg-emerald-700 transition-transform duration-300 origin-left ${
                  isActive ? "scale-x-100" : "scale-x-0"
                }`}
              />
            </a>
          );
        })}
      </nav>
    </header>
  );
}
