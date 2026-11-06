import React from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Calendar, Camera, Plus, Sparkles } from "lucide-react";
import { Footer } from "@/components/Footer";
import { InteractiveGallery } from "@/components/InteractiveGallery";
import { Navbar } from "@/components/Navbar";
import { contentRepository } from "@/lib/contentRepository";

export const metadata: Metadata = {
  title: "Galería 2026 — El Gran Reencuentro",
  description:
    "Las mejores fotos del reencuentro de los 30 años de la Promoción 1996 del New Cambridge School (Sábado, 19 de diciembre de 2026).",
};

export default async function Galeria2026Page() {
  const [settings, assets2026] = await Promise.all([
    contentRepository.getSiteSettings(),
    contentRepository.getMediaByYear(2026),
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-ivory-paper">
      <Navbar />

      <main id="contenido-principal" className="flex-1 py-10 sm:py-14">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
          {/* V2 Galería 2026 Banner Card with Camera & "Próximamente — Después del evento (19 de Dic. 2026)" */}
          <div className="relative overflow-hidden rounded-2xl border border-[#142B53]/15 bg-[#FCFBF7] shadow-lg mb-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
              <div className="relative p-6 sm:p-10 lg:col-span-6 z-10 flex flex-col justify-between">
                <div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#142B53]/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#142B53]">
                    <Camera className="h-3.5 w-3.5 text-[#A52728]" />
                    30 Years Reunion · Memoria Visual
                  </span>
                  <h1 className="mt-3 font-serif text-3xl sm:text-5xl font-bold text-[#142B53]">
                    Galería 2026
                  </h1>
                  <p className="mt-2 text-base sm:text-lg text-[#111827]/80">
                    Las mejores fotos del reencuentro.
                  </p>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href="/compartir"
                    className="inline-flex min-h-[44px] items-center gap-2 rounded-md bg-[#A52728] px-5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-[#8B1E1F] transition"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Enviar foto para este álbum</span>
                  </Link>
                  <Link
                    href="/galeria/1996"
                    className="inline-flex min-h-[44px] items-center rounded-md border border-[#142B53]/25 bg-white px-5 py-2.5 text-sm font-semibold text-[#142B53] hover:bg-[#142B53] hover:text-white transition"
                  >
                    Explorar Galería 1996
                  </Link>
                </div>
              </div>

              {/* Right Camera Photograph from V2 Design with "Próximamente" Glass Card */}
              <div className="relative min-h-[260px] sm:min-h-[320px] lg:col-span-6 overflow-hidden">
                <Image
                  src="/images/galeria-2026-camara.png"
                  alt="Cámara fotográfica Galería 2026"
                  fill
                  sizes="(max-width: 1024px) 100vw, 600px"
                  className="object-cover object-right"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#FCFBF7] via-[#FCFBF7]/20 to-transparent lg:w-1/3" />

                {settings.reunion_mode === "PRE" ? (
                  <div className="absolute bottom-5 right-5 left-5 sm:left-auto sm:max-w-[290px] rounded-xl border border-white/80 bg-[#F6F2E9]/95 px-6 py-4 text-center shadow-2xl backdrop-blur-md">
                    <p className="font-serif text-xl sm:text-2xl font-bold text-[#6E1718]">
                      Próximamente
                    </p>
                    <p className="mt-1 text-sm font-bold text-[#111827]">
                      Después del evento
                    </p>
                    <p className="text-sm font-bold text-[#142B53]">
                      (19 de Dic. 2026)
                    </p>
                  </div>
                ) : (
                  <div className="absolute bottom-5 right-5 inline-flex items-center gap-2 rounded-lg bg-emerald-950/90 px-4 py-2.5 text-sm font-semibold text-emerald-100 shadow-lg">
                    <Sparkles className="h-4 w-4" />
                    <span>Álbum oficial 2026 habilitado</span>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Crimson & Navy Torn Wave Accent matching V2 Galería 2026 card */}
            <div className="h-3 w-full bg-gradient-to-r from-[#A52728] via-[#142B53] to-[#0E223D]" />
          </div>

          {/* Preview / Published 2026 Cards */}
          <div className="mt-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
              <div>
                <h2 className="font-serif text-2xl font-bold text-[#142B53]">
                  {settings.reunion_mode === "PRE"
                    ? "Adelantos y Postales del Gran Encuentro 2026"
                    : "Fotografías Publicadas del Reencuentro 2026"}
                </h2>
                <p className="text-sm text-[#111827]/75 flex items-center gap-1.5 mt-1">
                  <Calendar className="h-4 w-4 text-[#A52728]" />
                  Cobertura del colegio (1:30 – 5:00 p. m.), Chiva con Papayera (5:00 – 6:00 p. m.) y Gran Fiesta en Salón Andalucía (6:00 p. m. – Medianoche).
                </p>
              </div>
            </div>
            <InteractiveGallery year={2026} initialAssets={assets2026} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
