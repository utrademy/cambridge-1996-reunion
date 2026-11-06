"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Maximize2, Play, Sparkles, Volume2, X } from "lucide-react";
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
            <Sparkles className="h-8 w-8 text-[#D9B875] mb-2" />
            <h4 className="font-serif text-xl font-bold text-[#F6F2E9]">
              {video.title} ({video.duration_label})
            </h4>
            <p className="mt-2 max-w-md text-xs sm:text-sm text-[#F6F2E9]/85 leading-relaxed">
              {video.description}
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
              <Link
                href={`/videos/${video.slug}`}
                className="inline-flex items-center gap-1.5 rounded-md bg-[#A52728] px-4 py-2 text-xs font-semibold text-white hover:bg-[#8B1E1F] transition"
              >
                Abrir página del video
              </Link>
              <button
                type="button"
                onClick={() => setActivated(false)}
                className="inline-flex items-center gap-1.5 rounded-md border border-white/25 px-4 py-2 text-xs font-semibold text-white hover:bg-white/10 transition"
              >
                Volver a la portada
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
              src={video.poster_url || "/images/campus-aerial-1996.png"}
              alt={video.title}
              fill
              sizes="(max-width: 768px) 100vw, 640px"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />

            {/* Center Play Button matching V2 Design */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="inline-flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full border-[3px] border-white bg-black/55 text-white shadow-[0_8px_28px_rgba(0,0,0,0.55)] backdrop-blur-xs transition-all duration-300 group-hover:scale-110 group-hover:bg-[#A52728]">
                <Play className="h-7 w-7 sm:h-8 sm:w-8 fill-current ml-1" />
              </span>
            </div>

            {/* Bottom Player Controls Bar matching V2 Mockup */}
            <div className="absolute bottom-0 inset-x-0 flex items-center gap-3 bg-gradient-to-t from-black/85 via-black/60 to-transparent px-3.5 py-2.5 text-white">
              <Play className="h-3.5 w-3.5 fill-current shrink-0 opacity-90" />
              {/* Progress Bar */}
              <div className="relative h-1 flex-1 rounded-full bg-white/30 overflow-hidden">
                <div className="h-full w-1/4 rounded-full bg-white" />
              </div>
              <span className="rounded bg-black/65 px-2 py-0.5 font-sans text-[11px] font-bold tracking-wider text-white">
                {video.duration_label || "4:36"}
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
            <span className="rounded-md bg-[#142B53] px-2.5 py-1 text-xs font-bold text-[#F6F2E9]">
              {video.duration_label}
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
