import React from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Calendar, Camera, Plus, Sparkles } from "lucide-react";
import { Footer } from "@/components/Footer";
import { InteractiveGallery } from "@/components/InteractiveGallery";
import { Navbar } from "@/components/Navbar";
import { contentRepository } from "@/lib/contentRepository";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Galería 2026 — El Gran Reencuentro",
  description:
    "Las mejores fotos del reencuentro de los 30 años y reuniones de la Promoción 1996 del New Cambridge School.",
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
          {/* Galería 2026 Banner Card with New Vintage Camera Photo & Creative "Próximamente" Ribbon */}
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
                    Las mejores fotos del reencuentro y nuestras reuniones de
                    promoción (2016, 2024 y 2026).
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

              {/* Right Vintage Camera Photograph with Top Creative Ribbon & Badge */}
              <div className="relative min-h-[220px] sm:min-h-[260px] lg:min-h-[320px] lg:col-span-6 overflow-hidden bg-[#142B53]">
                <Image
                  src="/images/galeria-2026-camara.jpg"
                  alt="Cámara fotográfica Galería 2026"
                  fill
                  unoptimized
                  sizes="(max-width: 1024px) 100vw, 600px"
                  className="object-cover object-center"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#FCFBF7] via-[#FCFBF7]/15 to-transparent lg:w-1/4 hidden lg:block" />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0E1E38]/75 via-transparent to-black/35" />

                {settings.reunion_mode === "PRE" ? (
                  <>
                    {/* Top Modern Ribbon */}
                    <div className="absolute top-3 right-3 left-3 sm:left-auto z-20 inline-flex items-center justify-center gap-2 rounded-full border border-[#D9B875]/60 bg-gradient-to-r from-[#A52728] to-[#7A1819] px-4 py-1.5 text-xs font-extrabold uppercase tracking-[0.15em] text-white shadow-lg">
                      <Sparkles className="h-3.5 w-3.5 text-[#D9B875] shrink-0" />
                      <span>Próximamente · Álbum Oficial 2026</span>
                    </div>

                    {/* Bottom Clear Editorial Badge */}
                    <div className="absolute bottom-3 right-3 left-3 sm:bottom-4 sm:right-4 sm:left-auto sm:max-w-[310px] z-20 rounded-xl border border-[#D9B875]/50 bg-[#0E1E38]/90 px-4 py-3 text-center text-[#F6F2E9] shadow-2xl backdrop-blur-md">
                      <p className="font-serif text-base sm:text-lg font-bold text-[#D9B875]">
                        Cobertura Especial del Reencuentro
                      </p>
                      <p className="mt-0.5 text-xs sm:text-sm font-semibold text-white">
                        Disponible después del evento · 19 de Dic. 2026
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="absolute bottom-5 right-5 inline-flex items-center gap-2 rounded-lg bg-emerald-950/90 px-4 py-2.5 text-sm font-semibold text-emerald-100 shadow-lg">
                    <Sparkles className="h-4 w-4" />
                    <span>Álbum oficial 2026 habilitado</span>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Crimson & Navy Accent */}
            <div className="h-3 w-full bg-gradient-to-r from-[#A52728] via-[#142B53] to-[#0E223D]" />
          </div>

          {/* Filterable Tabs: Todas, Reencuentro 2026, Reunión 2016, Reunión 2024 */}
          <div className="mt-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
              <div>
                <h2 className="font-serif text-2xl font-bold text-[#142B53]">
                  Encuentros y Reuniones de la Promoción 1996
                </h2>
                <p className="text-sm text-[#111827]/75 flex items-center gap-1.5 mt-1">
                  <Calendar className="h-4 w-4 text-[#A52728] shrink-0" />
                  Explora las fotografías por encuentro o selecciona «Todas»
                  para ver la colección completa de nuestras reuniones.
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
