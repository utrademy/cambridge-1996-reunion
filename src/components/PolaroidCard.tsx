"use client";

import React from "react";
import Image from "next/image";
import { Expand } from "lucide-react";
import type { MediaAsset } from "@/types/cms";

export function PolaroidCard({
  asset,
  onSelect,
  priority = false,
  handwrittenLabel,
}: {
  asset: MediaAsset;
  onSelect?: (asset: MediaAsset) => void;
  priority?: boolean;
  handwrittenLabel?: string;
}) {
  const desktopTiltClass =
    (asset.rotation_deg || 0) < 0
      ? "lg:-rotate-[1.5deg]"
      : (asset.rotation_deg || 0) > 0
        ? "lg:rotate-[1.5deg]"
        : "";

  return (
    <div
      className={`polaroid-frame album-tape-top group mx-auto w-full max-w-[175px] sm:max-w-[230px] lg:max-w-[340px] !p-1.5 !pb-3 sm:!p-2.5 sm:!pb-5 lg:!p-3 lg:!pb-7 transition-transform duration-300 active:scale-[0.98] lg:hover:rotate-0 lg:hover:scale-[1.02] hover:z-20 rounded-[3px] ${desktopTiltClass}`}
    >
      <button
        type="button"
        onClick={() => onSelect?.(asset)}
        className="relative block w-full overflow-hidden bg-[#142B53]/10 text-left focus:outline-none"
        aria-label={`Ver en detalle: ${asset.title}`}
      >
        <div className="relative aspect-[4/3] w-full overflow-hidden">
          <Image
            src={asset.thumb_url}
            alt={asset.title}
            fill
            sizes="(max-width: 640px) 170px, (max-width: 1024px) 220px, 340px"
            priority={priority}
            unoptimized={asset.thumb_url.startsWith("data:")}
            className="object-cover transition-transform duration-500 lg:group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent opacity-0 transition-opacity duration-300 lg:group-hover:opacity-100 hidden sm:flex items-end justify-between p-2.5">
            <span className="rounded bg-[#142B53]/90 px-2 py-0.5 text-[11px] font-medium text-[#F6F2E9]">
              {asset.category} · {asset.decade_tag}
            </span>
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#A52728] text-white shadow">
              <Expand className="h-3.5 w-3.5" />
            </span>
          </div>
        </div>
      </button>

      {/* Bottom Polaroid Caption Area */}
      <div className="mt-1.5 sm:mt-2.5 flex items-center justify-between gap-1.5 px-0.5 sm:px-1">
        <div className="min-w-0">
          <p className="truncate font-serif text-xs sm:text-sm font-semibold text-[#142B53]">
            {asset.title}
          </p>
          {handwrittenLabel ? (
            <p className="font-script text-base sm:text-xl leading-tight text-[#111827]">
              {handwrittenLabel}
            </p>
          ) : (
            <p className="truncate text-[10px] sm:text-xs text-[#111827]/70">
              {asset.is_demo_art
                ? "Ilustración editorial de referencia (Demo)"
                : asset.caption}
            </p>
          )}
        </div>
        <span className="shrink-0 rounded border border-[#142B53]/20 bg-[#F6F2E9] px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-[11px] font-medium text-[#142B53]">
          {asset.year}
        </span>
      </div>
    </div>
  );
}
