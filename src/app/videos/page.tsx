import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Film, Sparkles } from "lucide-react";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { VideoPlayerCard } from "@/components/VideoPlayerCard";
import { contentRepository } from "@/lib/contentRepository";

export const metadata: Metadata = {
  title: "Videos Conmemorativos — Promoción 1996",
  description:
    "Video Conmemorativo (1996 – 2026) y El Reencuentro 2026 de la Promoción 1996 del New Cambridge School.",
};

export default async function VideosIndexPage() {
  const videos = await contentRepository.getVideos();

  return (
    <div className="min-h-screen flex flex-col bg-ivory-paper">
      <Navbar />

      <main id="contenido-principal" className="flex-1 py-10 sm:py-14">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#142B53]/15 pb-6 mb-8">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#A52728]">
                <Film className="h-4 w-4" />
                <span>Producciones Audiovisuales · Class of 1996</span>
              </div>
              <h1 className="mt-2 font-serif text-3xl sm:text-5xl font-bold text-[#0E1E38]">
                Videos
              </h1>
              <div className="mt-2.5 h-[3px] w-12 bg-[#A52728]" />
              <p className="mt-3 text-sm sm:text-base text-[#111827]/80 max-w-2xl">
                Revive nuestra historia desde 1996 hasta hoy y el registro audiovisual del gran reencuentro de los 30 años.
              </p>
            </div>

            <span className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-full bg-[#142B53]/10 px-3.5 py-1.5 text-xs font-semibold text-[#142B53]">
              <Sparkles className="h-3.5 w-3.5 text-[#A52728]" />
              Reproductores optimizados
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {videos.map((video) => (
              <div key={video.id} className="flex flex-col">
                <VideoPlayerCard video={video} />
                <div className="mt-3 flex justify-end">
                  <Link
                    href={`/videos/${video.slug}`}
                    className="text-xs font-bold text-[#0E1E38] hover:text-[#A52728] underline underline-offset-4"
                  >
                    Ver ficha completa de «{video.title}» →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
