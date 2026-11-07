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
  const deg = asset.rotation_deg || 0;
  const tiltClass =
    deg <= -2
      ? "-rotate-[2.5deg]"
      : deg < 0
        ? "-rotate-[1.5deg]"
        : deg >= 2
          ? "rotate-[2.5deg]"
          : deg > 0
            ? "rotate-[1.5deg]"
            : "";

  return (
    <div
      style={{ transform: `rotate(${asset.rotation_deg || 0}deg)` }}
      className="polaroid-frame album-tape-top group mx-auto w-[88%] max-w-[380px] sm:w-full sm:max-w-none transition-transform duration-300 hover:!rotate-0 hover:scale-[1.03] hover:z-20 rounded-[3px]"
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
            sizes="(max-width: 640px) 290px, (max-width: 1024px) 45vw, 360px"
            priority={priority}
            unoptimized={asset.thumb_url.startsWith("data:")}
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-end justify-between p-3">
            <span className="rounded bg-[#142B53]/90 px-2.5 py-1 text-xs font-medium text-[#F6F2E9]">
              {asset.category} · {asset.decade_tag}
            </span>
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#A52728] text-white shadow">
              <Expand className="h-4 w-4" />
            </span>
          </div>
        </div>
      </button>

      {/* Bottom Polaroid Caption Area */}
      <div className="mt-2.5 flex items-center justify-between gap-2 px-1">
        <div className="min-w-0">
          <p className="truncate font-serif text-sm font-semibold text-[#142B53]">
            {asset.title}
          </p>
          {handwrittenLabel ? (
            <p className="font-script text-xl leading-tight text-[#111827]">
              {handwrittenLabel}
            </p>
          ) : (
            <p className="truncate text-xs text-[#111827]/70">
              {asset.is_demo_art
                ? "Ilustración editorial de referencia (Demo)"
                : asset.caption}
            </p>
          )}
        </div>
        <span className="shrink-0 rounded border border-[#142B53]/20 bg-[#F6F2E9] px-2 py-0.5 text-[11px] font-medium text-[#142B53]">
          {asset.year}
        </span>
      </div>
    </div>
  );
}
