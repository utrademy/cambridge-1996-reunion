"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
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
    caption:
      "Retrato grupal de nuestra generación en los corredores del colegio.",
    decade_tag: "1996 · Nuestra Historia",
    thumb_url: "/images/historia-grupo-1996.png",
    preview_url: "/images/historia-grupo-1996.png",
    width: 504,
    height: 304,
    allow_download: true,
    is_demo_art: true,
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
    caption:
      "Tarde de descanso y amistad en las zonas verdes del New Cambridge School.",
    decade_tag: "1996 · Jardines",
    thumb_url: "/images/historia-jardin-1996.png",
    preview_url: "/images/historia-jardin-1996.png",
    width: 304,
    height: 192,
    allow_download: true,
    is_demo_art: true,
    published: true,
    sort_order: 2,
    rotation_deg: 7,
    created_at: "2026-10-02T12:00:00.000Z",
  },
];

const GALERIA96_TRIO_FALLBACKS: MediaAsset[] = [
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
    is_demo_art: true,
    published: true,
    sort_order: 20,
    rotation_deg: -7,
    created_at: "2026-10-03T12:00:00.000Z",
  },
  {
    id: "v2-gal96-trio-2",
    album_id: "album-1996-vida",
    year: 1996,
    category: "Actividades",
    title: "Selección de Baloncesto — Cambridge 1996",
    caption:
      "Equipo femenino de baloncesto con el uniforme oficial del colegio.",
    decade_tag: "1996 · Deportes",
    thumb_url: "/images/galeria-96-baloncesto.png",
    preview_url: "/images/galeria-96-baloncesto.png",
    width: 312,
    height: 232,
    allow_download: true,
    is_demo_art: true,
    published: true,
    sort_order: 21,
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
    is_demo_art: true,
    published: true,
    sort_order: 22,
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
  const [liveAssets, setLiveAssets] = useState<MediaAsset[]>(assets);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const syncLiveHomeMedia = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin?scope=public&t=${Date.now()}`, {
        cache: "no-store",
      });
      if (!res.ok) return;
      const json = (await res.json()) as {
        media96?: MediaAsset[];
        media2026?: MediaAsset[];
      };
      const m96 = Array.isArray(json.media96) ? json.media96 : [];
      const m26 = Array.isArray(json.media2026) ? json.media2026 : [];
      // Put real uploaded/approved photos first (1996 then 2026), followed by remaining 1996 items
      const real96 = m96.filter((m) => !m.is_demo_art);
      const real26 = m26.filter((m) => !m.is_demo_art);
      const demo96 = m96.filter((m) => m.is_demo_art);
      const combined = [...real96, ...real26, ...demo96];
      if (combined.length > 0) {
        setLiveAssets(combined);
      }
    } catch {
      // Keep initial assets on network error
    }
  }, []);

  useEffect(() => {
    setLiveAssets(assets);
  }, [assets]);

  useEffect(() => {
    syncLiveHomeMedia();
    const onFocus = () => syncLiveHomeMedia();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [syncLiveHomeMedia]);

  // Select the 3 featured polaroids for Galería 1996:
  // Prioritizes the first uploaded/approved real photos, falling back to GALERIA96_TRIO_FALLBACKS
  const galeriaTrio = useMemo(() => {
    const realUploaded = liveAssets.filter((m) => !m.is_demo_art);
    const result: MediaAsset[] = [];
    for (const item of realUploaded) {
      if (result.length < 3 && !result.some((r) => r.id === item.id)) {
        result.push(item);
      }
    }
    for (const fallback of GALERIA96_TRIO_FALLBACKS) {
      if (result.length < 3) {
        result.push(fallback);
      }
    }
    return result;
  }, [liveAssets]);

  if (variant === "historia") {
    const lightboxList = [...HISTORIA_DEFAULT_ITEMS, ...liveAssets];
    const first = HISTORIA_DEFAULT_ITEMS[0];
    const second = HISTORIA_DEFAULT_ITEMS[1];

    return (
      <>
        <div className="relative mx-auto w-[92%] max-w-[440px] sm:w-full sm:max-w-[560px] py-2 sm:py-4">
          {/* Primary Tilted Polaroid (Top-Left, tilted -5deg with masking tape) */}
          <button
            type="button"
            onClick={() => setActiveIndex(0)}
            className="polaroid-frame album-tape-top group relative z-10 block w-[82%] sm:w-[78%] -rotate-[5deg] bg-[#FCFBF7] p-2.5 sm:p-3.5 pb-6 sm:pb-8 shadow-[0_18px_36px_rgba(13,30,58,0.24)] text-left transition-all duration-500 hover:rotate-0 hover:scale-[1.03] hover:z-30 cursor-pointer"
            aria-label={`Ampliar imagen: ${first.title}`}
          >
            <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#142B53]/10">
              <Image
                src={first.thumb_url}
                alt={first.title}
                fill
                unoptimized={first.thumb_url.startsWith("data:")}
                sizes="(max-width: 768px) 80vw, 440px"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/25 opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-end justify-end p-2.5">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#A52728] text-white shadow-md">
                  <Expand className="h-4 w-4" />
                </span>
              </div>
            </div>
          </button>

          {/* Secondary Overlapping Polaroid (Bottom-Right, tilted +7deg matching V2 Nuestra Historia) */}
          <button
            type="button"
            onClick={() => setActiveIndex(1)}
            className="polaroid-frame group relative z-20 -mt-16 sm:-mt-24 ml-auto mr-1 sm:mr-2 block w-[58%] sm:w-[54%] rotate-[7deg] bg-[#FCFBF7] p-2 sm:p-3 pb-5 sm:pb-6 shadow-[0_20px_40px_rgba(13,30,58,0.32)] text-left transition-all duration-500 hover:rotate-0 hover:scale-[1.05] hover:z-30 cursor-pointer"
            aria-label={`Ampliar imagen: ${second.title}`}
          >
            <div className="relative aspect-[15/10] w-full overflow-hidden bg-[#142B53]/10">
              <Image
                src={second.thumb_url}
                alt={second.title}
                fill
                unoptimized={second.thumb_url.startsWith("data:")}
                sizes="(max-width: 768px) 55vw, 300px"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/25 opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-end justify-end p-2">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#A52728] text-white shadow-md">
                  <Expand className="h-3.5 w-3.5" />
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

  // "galeria1996" 3-Polaroid fanned spread showing the first approved/uploaded photos!
  const lightboxList = [
    ...galeriaTrio,
    ...liveAssets.filter((a) => !galeriaTrio.some((t) => t.id === a.id)),
  ];
  const cardClasses = [
    "-rotate-[5deg] sm:-rotate-[7deg] sm:translate-x-3 z-10",
    "rotate-[2deg] z-20 sm:scale-105",
    "rotate-[5deg] sm:rotate-[8deg] sm:-translate-x-3 z-10",
  ];

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-2 items-center py-2">
        {galeriaTrio.map((item, idx) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setActiveIndex(idx)}
            className={`polaroid-frame group mx-auto block w-[88%] max-w-[380px] sm:w-full sm:max-w-none bg-[#FCFBF7] p-2.5 sm:p-3 pb-6 sm:pb-7 shadow-[0_20px_42px_rgba(0,0,0,0.45)] text-left transition-all duration-500 hover:rotate-0 hover:scale-[1.04] sm:hover:scale-110 hover:z-30 cursor-pointer ${
              cardClasses[idx]
            }`}
            aria-label={`Ver fotografía: ${item.title}`}
          >
            <div className="relative aspect-[11/10] w-full overflow-hidden bg-[#142B53]/10">
              <Image
                src={item.thumb_url}
                alt={item.title}
                fill
                unoptimized={item.thumb_url.startsWith("data:")}
                sizes="(max-width: 640px) 280px, 280px"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-end justify-between p-2.5">
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
