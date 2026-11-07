"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Film, Maximize2, Play, Sparkles, Volume2, X } from "lucide-react";
import type { VideoItem } from "@/types/cms";

export function VideoPlayerCard({
  video,
  compact = false,
}: {
  video: VideoItem;
  compact?: boolean;
}) {
  const [activated, setActivated] = useState(false);
  const canPlay = Boolean(video.is_available && video.embed_url);

  const posterSrc =
    video.slug === "reencuentro"
      ? "/images/video-thumb-reencuentro.png"
      : video.poster_url || "/images/video-thumb-historia.png";

  return (
    <div className="group overflow-hidden rounded-xl border-[3px] border-[#FCFBF7] bg-[#142B53] shadow-[0_18px_38px_-12px_rgba(13,30,58,0.45)] transition-all duration-300 hover:shadow-[0_24px_48px_-12px_rgba(13,30,58,0.6)]">
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#0E1F3D]">
        {canPlay && activated && video.embed_url ? (
          <iframe
            src={`${video.embed_url}?autoplay=1&rel=0`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="h-full w-full border-0"
          />
        ) : activated && !canPlay ? (
          <div className="relative flex h-full w-full flex-col items-center justify-center bg-[#0D1E3A]/95 p-6 text-center text-[#F6F2E9]">
            <button
              type="button"
              onClick={() => setActivated(false)}
              aria-label="Cerrar vista previa"
              className="absolute top-3 right-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition"
            >
              <X className="h-4 w-4" />
            </button>
            <span className="mb-2.5 inline-flex items-center gap-1.5 rounded-full border border-[#D9B875]/40 bg-[#A52728] px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-white shadow">
              <Sparkles className="h-3.5 w-3.5 text-[#D9B875]" />
              Próximamente
            </span>
            <h4 className="font-serif text-xl sm:text-2xl font-bold text-[#F6F2E9]">
              {video.title}
            </h4>
            <p className="mt-2 max-w-md text-xs sm:text-sm text-[#F6F2E9]/85 leading-relaxed">
              Esta producción audiovisual conmemorativa se encuentra en
              preparación y estará disponible muy pronto en este espacio.
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
              <Link
                href={`/videos/${video.slug}`}
                className="inline-flex items-center gap-1.5 rounded-md bg-[#A52728] px-4 py-2 text-xs font-semibold text-white hover:bg-[#8B1E1F] transition"
              >
                Ver detalles de la producción
              </Link>
              <button
                type="button"
                onClick={() => setActivated(false)}
                className="inline-flex items-center gap-1.5 rounded-md border border-white/25 px-4 py-2 text-xs font-semibold text-white hover:bg-white/10 transition"
              >
                Volver a la vista previa
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setActivated(true)}
            aria-label={`Reproducir ${video.title}`}
            className="relative block h-full w-full text-left focus:outline-none cursor-pointer"
          >
            <Image
              src={posterSrc}
              alt={video.title}
              fill
              unoptimized
              sizes="(max-width: 768px) 100vw, 680px"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-black/30" />

            {/* Top Modern Ribbon Banner "PRÓXIMAMENTE" when video is not yet published */}
            {!canPlay && (
              <div className="absolute top-0 inset-x-0 z-20 flex items-center justify-between bg-gradient-to-r from-[#A52728] via-[#8B1E1F] to-[#142B53]/95 px-4 py-2 text-white shadow-md backdrop-blur-xs border-b border-white/20">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-[#D9B875] shrink-0" />
                  <span className="text-[11px] sm:text-xs font-extrabold uppercase tracking-[0.16em] text-white">
                    Próximamente
                  </span>
                </div>
                <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-[10px] font-semibold tracking-wide text-[#F6F2E9]">
                  {video.slug === "reencuentro"
                    ? "Después del 19 Dic. 2026"
                    : "En producción oficial"}
                </span>
              </div>
            )}

            {/* Center Play Button */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
              <span className="inline-flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full border-[3px] border-white bg-black/55 text-white shadow-[0_8px_28px_rgba(0,0,0,0.55)] backdrop-blur-xs transition-all duration-300 group-hover:scale-110 group-hover:bg-[#A52728]">
                <Play className="h-7 w-7 sm:h-8 sm:w-8 fill-current ml-1" />
              </span>
              {!canPlay && (
                <span className="rounded-full border border-white/30 bg-[#0E1E38]/85 px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-[#F6F2E9] shadow-lg backdrop-blur-xs">
                  Estreno Próximamente
                </span>
              )}
            </div>

            {/* Bottom Player Controls Bar */}
            <div className="absolute bottom-0 inset-x-0 flex items-center gap-3 bg-gradient-to-t from-black/90 via-black/65 to-transparent px-3.5 py-2.5 text-white">
              <Film className="h-3.5 w-3.5 shrink-0 text-[#D9B875]" />
              <div className="relative h-1 flex-1 rounded-full bg-white/30 overflow-hidden">
                <div className="h-full w-1/4 rounded-full bg-[#D9B875]" />
              </div>
              <span className="rounded bg-[#A52728] px-2.5 py-0.5 font-sans text-[10px] font-bold uppercase tracking-wider text-white">
                {canPlay ? video.duration_label : "Próximamente"}
              </span>
              <Volume2 className="h-3.5 w-3.5 shrink-0 opacity-85 hidden sm:block" />
              <Maximize2 className="h-3.5 w-3.5 shrink-0 opacity-85 hidden sm:block" />
            </div>
          </button>
        )}
      </div>

      {!compact && (
        <div className="bg-[#FCFBF7] p-4 sm:p-5 text-[#111827]">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="font-serif text-lg sm:text-xl font-bold text-[#142B53]">
                {video.title}
              </h3>
              <p className="text-xs sm:text-sm font-medium text-[#111827]/75">
                {video.subtitle}
              </p>
            </div>
            <span className="rounded-md bg-[#A52728] px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
              {canPlay ? video.duration_label : "Próximamente"}
            </span>
          </div>
          <p className="mt-2 text-sm text-[#111827]/80 leading-relaxed">
            {video.description}
          </p>
        </div>
      )}
    </div>
  );
}
