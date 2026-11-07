"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Expand } from "lucide-react";
import { LightboxModal } from "./LightboxModal";
import type { MediaAsset } from "@/types/cms";

const HISTORIA_DEFAULT_ITEMS: MediaAsset[] = [
  {
    id: "v2-historia-1",
    album_id: "album-1996-anuario",
    year: 1996,
    category: "Compañeros",
    title: "Nuestra Historia — Promoción 1996",
    caption: "Retrato grupal de nuestra generación en los corredores del colegio.",
    decade_tag: "1996 · Nuestra Historia",
    thumb_url: "/images/historia-grupo-1996.png",
    preview_url: "/images/historia-grupo-1996.png",
    width: 504,
    height: 304,
    allow_download: true,
    is_demo_art: false,
    published: true,
    sort_order: 1,
    rotation_deg: -5,
    created_at: "2026-10-01T12:00:00.000Z",
  },
  {
    id: "v2-historia-2",
    album_id: "album-1996-vida",
    year: 1996,
    category: "Compañeros",
    title: "Amigos en los Jardines del Campus (1996)",
    caption: "Tarde de descanso y amistad en las zonas verdes del New Cambridge School.",
    decade_tag: "1996 · Jardines",
    thumb_url: "/images/historia-jardin-1996.png",
    preview_url: "/images/historia-jardin-1996.png",
    width: 304,
    height: 192,
    allow_download: true,
    is_demo_art: false,
    published: true,
    sort_order: 2,
    rotation_deg: 7,
    created_at: "2026-10-02T12:00:00.000Z",
  },
];

const GALERIA96_TRIO_ITEMS: MediaAsset[] = [
  {
    id: "v2-gal96-trio-1",
    album_id: "album-1996-anuario",
    year: 1996,
    category: "Anuario",
    title: "Anuario Promoción 1996 — Retrato Grupal",
    caption: "Fotografía grupal del anuario escolar 1996.",
    decade_tag: "1996 · Anuario",
    thumb_url: "/images/galeria-96-anuario.png",
    preview_url: "/images/galeria-96-anuario.png",
    width: 264,
    height: 232,
    allow_download: true,
    is_demo_art: false,
    published: true,
    sort_order: 1,
    rotation_deg: -7,
    created_at: "2026-10-03T12:00:00.000Z",
  },
  {
    id: "v2-gal96-trio-2",
    album_id: "album-1996-vida",
    year: 1996,
    category: "Actividades",
    title: "Selección de Baloncesto — Cambridge 1996",
    caption: "Equipo femenino de baloncesto con el uniforme oficial del colegio.",
    decade_tag: "1996 · Deportes",
    thumb_url: "/images/galeria-96-baloncesto.png",
    preview_url: "/images/galeria-96-baloncesto.png",
    width: 312,
    height: 232,
    allow_download: true,
    is_demo_art: false,
    published: true,
    sort_order: 2,
    rotation_deg: 2,
    created_at: "2026-10-04T12:00:00.000Z",
  },
  {
    id: "v2-gal96-trio-3",
    album_id: "album-1996-vida",
    year: 1996,
    category: "Actividades",
    title: "Fútbol y Recreo en las Canchas (1996)",
    caption: "Partidos y entrenamientos en la cancha del colegio.",
    decade_tag: "1996 · Canchas",
    thumb_url: "/images/galeria-96-cancha.png",
    preview_url: "/images/galeria-96-cancha.png",
    width: 256,
    height: 216,
    allow_download: true,
    is_demo_art: false,
    published: true,
    sort_order: 3,
    rotation_deg: 8,
    created_at: "2026-10-05T12:00:00.000Z",
  },
];

export function HomePolaroidCluster({
  assets,
  variant,
}: {
  assets: MediaAsset[];
  variant: "historia" | "galeria1996";
}) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  if (variant === "historia") {
    const lightboxList = [...HISTORIA_DEFAULT_ITEMS, ...assets];
    const first = HISTORIA_DEFAULT_ITEMS[0];
    const second = HISTORIA_DEFAULT_ITEMS[1];

    return (
      <>
        <div className="relative mx-auto w-full max-w-[300px] sm:max-w-[560px] px-2 sm:px-0 py-2 sm:py-4">
          {/* Primary Tilted Polaroid (Top-Left, tilted -5deg with masking tape) */}
          <button
            type="button"
            onClick={() => setActiveIndex(0)}
            className="polaroid-frame album-tape-top group relative z-10 block w-[82%] sm:w-[78%] -rotate-[3deg] sm:-rotate-[5deg] bg-[#FCFBF7] p-2 sm:p-3.5 pb-4 sm:pb-8 shadow-[0_18px_36px_rgba(13,30,58,0.24)] text-left transition-all duration-500 active:scale-[0.98] sm:hover:rotate-0 sm:hover:scale-[1.03] hover:z-30 cursor-pointer"
            aria-label={`Ampliar imagen: ${first.title}`}
          >
            <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#142B53]/10">
              <Image
                src={first.thumb_url}
                alt={first.title}
                fill
                sizes="(max-width: 768px) 240px, 440px"
                className="object-cover transition-transform duration-500 sm:group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/25 opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-end justify-end p-2.5">
                <span className="inline-flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-[#A52728] text-white shadow-md">
                  <Expand className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </span>
              </div>
            </div>
          </button>

          {/* Secondary Overlapping Polaroid (Bottom-Right, tilted +7deg matching V2 Nuestra Historia) */}
          <button
            type="button"
            onClick={() => setActiveIndex(1)}
            className="polaroid-frame group relative z-20 -mt-12 sm:-mt-24 ml-auto mr-1 sm:mr-2 block w-[60%] sm:w-[54%] rotate-[4deg] sm:rotate-[7deg] bg-[#FCFBF7] p-1.5 sm:p-3 pb-3.5 sm:pb-6 shadow-[0_20px_40px_rgba(13,30,58,0.32)] text-left transition-all duration-500 active:scale-[0.98] sm:hover:rotate-0 sm:hover:scale-[1.05] hover:z-30 cursor-pointer"
            aria-label={`Ampliar imagen: ${second.title}`}
          >
            <div className="relative aspect-[15/10] w-full overflow-hidden bg-[#142B53]/10">
              <Image
                src={second.thumb_url}
                alt={second.title}
                fill
                sizes="(max-width: 768px) 180px, 300px"
                className="object-cover transition-transform duration-500 sm:group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/25 opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-end justify-end p-2">
                <span className="inline-flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full bg-[#A52728] text-white shadow-md">
                  <Expand className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                </span>
              </div>
            </div>
          </button>
        </div>

        <LightboxModal
          items={lightboxList}
          activeIndex={activeIndex}
          onClose={() => setActiveIndex(null)}
          onNavigate={(idx) => setActiveIndex(idx)}
        />
      </>
    );
  }

  // "galeria1996" 3-Polaroid fanned spread matching V2 Navy Galería 1996 section
  const lightboxList = [...GALERIA96_TRIO_ITEMS, ...assets];
  const cardClasses = [
    "-rotate-[3deg] sm:-rotate-[7deg] sm:translate-x-3 z-10",
    "rotate-[1deg] sm:rotate-[2deg] z-20 scale-[1.02] sm:scale-105",
    "rotate-[3deg] sm:rotate-[8deg] sm:-translate-x-3 z-10",
  ];

  return (
    <>
      <div className="mx-auto max-w-[340px] sm:max-w-[520px] lg:max-w-none grid grid-cols-3 gap-2 sm:gap-3 lg:gap-2 items-center px-1 sm:px-0 py-2">
        {GALERIA96_TRIO_ITEMS.map((item, idx) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setActiveIndex(idx)}
            className={`polaroid-frame group block w-full bg-[#FCFBF7] !p-1.5 !pb-3.5 sm:!p-2.5 sm:!pb-5 lg:!p-3 lg:!pb-7 shadow-[0_14px_28px_rgba(0,0,0,0.45)] sm:shadow-[0_20px_42px_rgba(0,0,0,0.45)] text-left transition-all duration-500 active:scale-95 lg:hover:rotate-0 lg:hover:scale-110 hover:z-30 cursor-pointer ${
              cardClasses[idx]
            }`}
            aria-label={`Ver fotografía: ${item.title}`}
          >
            <div className="relative aspect-[11/10] w-full overflow-hidden bg-[#142B53]/10">
              <Image
                src={item.thumb_url}
                alt={item.title}
                fill
                sizes="(max-width: 640px) 115px, 280px"
                className="object-cover transition-transform duration-500 sm:group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity duration-300 sm:group-hover:opacity-100 hidden sm:flex items-end justify-between p-2.5">
                <span className="rounded bg-[#142B53]/90 px-2 py-0.5 text-[11px] font-semibold text-[#F6F2E9]">
                  {item.category}
                </span>
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#A52728] text-white shadow">
                  <Expand className="h-3.5 w-3.5" />
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>

      <LightboxModal
        items={lightboxList}
        activeIndex={activeIndex}
        onClose={() => setActiveIndex(null)}
        onNavigate={(idx) => setActiveIndex(idx)}
      />
    </>
  );
}
