import React from "react";
import Link from "next/link";
import { Camera, Film, HeartHandshake, Lock, ShieldCheck } from "lucide-react";
import {
  ClassOf1996HeroEmblem,
  NewCambridgeNavbarLogo,
} from "./BrandLogos";

export function Footer() {
  return (
    <footer className="relative z-30 bg-[#0E1E38] text-[#F6F2E9] border-t border-[#D9B875]/25">
      {/* Subtle Torn-Paper Top Edge Over Friends' Backs */}
      <div className="pointer-events-none absolute -top-2 inset-x-0 overflow-hidden leading-none">
        <svg
          viewBox="0 0 1440 16"
          preserveAspectRatio="none"
          className="relative block h-2.5 w-full fill-[#0E1E38]"
        >
          <path d="M0,10 C240,2 480,14 720,6 C960,0 1200,12 1440,4 L1440,16 L0,16 Z" />
        </svg>
      </div>
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-8 border-b border-white/15 pb-8">
          {/* Left: New Cambridge School emblem */}
          <div className="flex flex-col items-center md:items-start gap-2">
            <NewCambridgeNavbarLogo />
            <p className="text-xs text-[#F6F2E9]/75 text-center md:text-left max-w-xs mt-1">
              Calle 32 #22-140, Cañaveral, Floridablanca · Sábado, 19 de
              diciembre de 2026 (1:15 p. m. Colegio · 6:00 p. m. Salón Andalucía, Club Campestre)
            </p>
          </div>

          {/* Center: Class of 1996 — 30 Years Reunion */}
          <div className="flex flex-col items-center justify-center">
            <ClassOf1996HeroEmblem compact />
          </div>

          {/* Right: Quick Action Icons & Navigation matching V2 Footer */}
          <div className="flex flex-col items-center md:items-end gap-3">
            <div className="flex items-center gap-3">
              <Link
                href="/galeria/1996"
                aria-label="Galería 1996"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-white/5 text-[#F6F2E9] transition hover:border-[#D9B875] hover:bg-white/15"
              >
                <Camera className="h-4 w-4" />
              </Link>
              <Link
                href="/videos/historia"
                aria-label="Videos Conmemorativos"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-white/5 text-[#F6F2E9] transition hover:border-[#D9B875] hover:bg-white/15"
              >
                <Film className="h-4 w-4" />
              </Link>
              <Link
                href="/compartir"
                aria-label="Compartir Recuerdo"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-white/5 text-[#F6F2E9] transition hover:border-[#D9B875] hover:bg-white/15"
              >
                <HeartHandshake className="h-4 w-4" />
              </Link>
            </div>
            <div className="flex flex-wrap justify-center md:justify-end gap-x-4 gap-y-1 text-xs text-[#F6F2E9]/80">
              <Link href="/galeria/1996" className="hover:text-white underline-offset-4 hover:underline">
                Galería 1996
              </Link>
              <Link href="/galeria/2026" className="hover:text-white underline-offset-4 hover:underline">
                Galería 2026
              </Link>
              <Link href="/historias" className="hover:text-white underline-offset-4 hover:underline">
                Recuerdos
              </Link>
              <Link href="/privacidad" className="inline-flex items-center gap-1 hover:text-white underline-offset-4 hover:underline">
                <ShieldCheck className="h-3.5 w-3.5 text-[#D9B875]" />
                Privacidad
              </Link>
              <Link href="/admin" className="inline-flex items-center gap-1 hover:text-white underline-offset-4 hover:underline">
                <Lock className="h-3.5 w-3.5 text-[#D9B875]" />
                Admin
              </Link>
            </div>
          </div>
        </div>

        {/* Legal & Independent Alumni Initiative Disclaimer */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#F6F2E9]/70 text-center sm:text-left">
          <p>
            <strong>Iniciativa independiente de exalumnos:</strong> Este portal
            conmemorativo es organizado de manera autónoma por el comité de la{" "}
            <span className="text-[#F6F2E9]">
              Promoción 1996 — New Cambridge School
            </span>{" "}
            para celebrar sus 30 años de graduación.
          </p>
          <p className="shrink-0 text-[#D9B875]">
            1996 – 2026 · 30 Years Reunion
          </p>
        </div>
      </div>
    </footer>
  );
}
