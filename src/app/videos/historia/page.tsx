import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Film, PlayCircle } from "lucide-react";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { VideoPlayerCard } from "@/components/VideoPlayerCard";
import { contentRepository } from "@/lib/contentRepository";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Video Conmemorativo — Nuestra Historia 1996 – 2026",
  description:
    "Producción audiovisual conmemorativa de los 30 años de la Promoción 1996 del New Cambridge School.",
};

export default async function VideoHistoriaPage() {
  const videos = await contentRepository.getVideos();
  const historia = videos.find((v) => v.slug === "historia") || videos[0];
  const reencuentro = videos.find((v) => v.slug === "reencuentro") || videos[1];

  return (
    <div className="min-h-screen flex flex-col bg-ivory-paper">
      <Navbar />

      <main id="contenido-principal" className="flex-1 py-10 sm:py-14">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
          {/* Header matching V2 Videos Panel */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#142B53]/15 pb-6 mb-8">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#A52728]">
                <Film className="h-4 w-4" />
                <span>Especial Audiovisual · 1996 – 2026</span>
              </div>
              <h1 className="mt-2 font-serif text-3xl sm:text-5xl font-bold text-[#142B53]">
                Videos
              </h1>
              <p className="mt-2 text-sm sm:text-base text-[#111827]/80">
                Documental histórico de la generación y registro audiovisual del
                reencuentro 2026.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/videos/historia"
                className="inline-flex min-h-[42px] items-center gap-1.5 rounded-md bg-[#A52728] px-4 py-2 text-sm font-semibold text-white shadow-xs"
              >
                <PlayCircle className="h-4 w-4" />
                <span>Video Conmemorativo</span>
              </Link>
              <Link
                href="/videos/reencuentro"
                className="inline-flex min-h-[42px] items-center gap-1.5 rounded-md border border-[#142B53]/25 bg-[#FCFBF7] px-4 py-2 text-sm font-semibold text-[#142B53] hover:bg-[#142B53] hover:text-white transition"
              >
                <span>El Reencuentro 2026</span>
              </Link>
            </div>
          </div>

          {/* Primary Featured Video */}
          {historia && (
            <div className="mb-12">
              <VideoPlayerCard video={historia} />
            </div>
          )}

          {/* Side-by-Side Catalog matching V2 Videos Screen */}
          <div className="border-t border-[#142B53]/15 pt-8">
            <h2 className="font-serif text-2xl font-bold text-[#142B53] mb-6">
              Catálogo Audiovisual de la Promoción 1996
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {historia && <VideoPlayerCard video={historia} />}
              {reencuentro && <VideoPlayerCard video={reencuentro} />}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
