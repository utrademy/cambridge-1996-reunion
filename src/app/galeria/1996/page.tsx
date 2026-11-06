import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Camera, Plus } from "lucide-react";
import { Footer } from "@/components/Footer";
import { InteractiveGallery } from "@/components/InteractiveGallery";
import { Navbar } from "@/components/Navbar";
import { contentRepository } from "@/lib/contentRepository";

export const metadata: Metadata = {
  title: "Galería 1996 — Anuario y Recuerdos",
  description:
    "Fotografías conmemorativas del anuario, compañeros, profesores y actividades de la Promoción 1996 del New Cambridge School.",
};

export default async function Galeria1996Page() {
  const [assets, albums] = await Promise.all([
    contentRepository.getMediaByYear(1996),
    contentRepository.getAlbums(),
  ]);

  const albums1996 = albums.filter((a) => a.year === 1996);

  return (
    <div className="min-h-screen flex flex-col bg-ivory-paper">
      <Navbar />

      <main id="contenido-principal" className="flex-1 py-10 sm:py-14">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
          {/* Interior Editorial Header matching V2 Right Top Panel */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#142B53]/15 pb-6 mb-8">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#A52728]">
                <Camera className="h-4 w-4" />
                <span>Archivo Histórico · Class of 1996</span>
              </div>
              <h1 className="mt-2 font-serif text-3xl sm:text-5xl font-bold text-[#142B53]">
                Galería 1996
              </h1>
              <p className="mt-2 text-sm sm:text-base text-[#111827]/80 max-w-2xl">
                Fotos del anuario, compañeros, profesores y actividades que
                hicieron inolvidable nuestra generación.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/galeria/2026"
                className="inline-flex min-h-[44px] items-center justify-center rounded-md border border-[#142B53]/25 bg-[#FCFBF7] px-4 py-2 text-sm font-semibold text-[#142B53] hover:bg-[#142B53] hover:text-white transition"
              >
                Ver Galería 2026 →
              </Link>
              <Link
                href="/compartir"
                className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-md bg-[#A52728] px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-[#8B1E1F] transition"
              >
                <Plus className="h-4 w-4" />
                <span>Aportar foto de 1996</span>
              </Link>
            </div>
          </div>

          {/* Curated Albums Summary */}
          {albums1996.length > 0 && (
            <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
              {albums1996.map((album) => (
                <div
                  key={album.id}
                  className="rounded-xl border border-[#142B53]/15 bg-[#FCFBF7] p-4 shadow-2xs"
                >
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#A52728]">
                    Álbum {album.year}
                  </span>
                  <h2 className="font-serif text-lg font-bold text-[#142B53]">
                    {album.title}
                  </h2>
                  <p className="mt-1 text-xs sm:text-sm text-[#111827]/75">
                    {album.description}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Filterable Masonry/Grid with Keyboard Lightbox */}
          <InteractiveGallery year={1996} initialAssets={assets} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
