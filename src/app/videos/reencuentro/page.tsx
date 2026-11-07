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
  title: "El Reencuentro 2026 — Aftermovie Oficial",
  description:
    "Aftermovie y memoria audiovisual del gran encuentro de los 30 años de la Promoción 1996 del New Cambridge School.",
};

export default async function VideoReencuentroPage() {
  const videos = await contentRepository.getVideos();
  const reencuentro =
    videos.find((v) => v.slug === "reencuentro") || videos[1] || videos[0];
  const historia = videos.find((v) => v.slug === "historia") || videos[0];

  return (
    <div className="min-h-screen flex flex-col bg-ivory-paper">
      <Navbar />

      <main id="contenido-principal" className="flex-1 py-10 sm:py-14">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#142B53]/15 pb-6 mb-8">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#A52728]">
                <Film className="h-4 w-4" />
                <span>Cobertura 19 de Diciembre de 2026</span>
              </div>
              <h1 className="mt-2 font-serif text-3xl sm:text-5xl font-bold text-[#142B53]">
                El Reencuentro 2026
              </h1>
              <p className="mt-2 text-sm sm:text-base text-[#111827]/80">
                Así vivimos el gran encuentro de los 30 años en el New Cambridge
                School.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/videos/historia"
                className="inline-flex min-h-[42px] items-center gap-1.5 rounded-md border border-[#142B53]/25 bg-[#FCFBF7] px-4 py-2 text-sm font-semibold text-[#142B53] hover:bg-[#142B53] hover:text-white transition"
              >
                <span>Video Conmemorativo</span>
              </Link>
              <Link
                href="/videos/reencuentro"
                className="inline-flex min-h-[42px] items-center gap-1.5 rounded-md bg-[#A52728] px-4 py-2 text-sm font-semibold text-white shadow-xs"
              >
                <PlayCircle className="h-4 w-4" />
                <span>El Reencuentro 2026</span>
              </Link>
            </div>
          </div>

          {reencuentro && (
            <div className="mb-12">
              <VideoPlayerCard video={reencuentro} />
            </div>
          )}

          {historia && (
            <div className="border-t border-[#142B53]/15 pt-8">
              <h2 className="font-serif text-xl font-bold text-[#142B53] mb-4">
                También disponible en Videos:
              </h2>
              <div className="max-w-2xl">
                <VideoPlayerCard video={historia} />
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
