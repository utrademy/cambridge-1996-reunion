"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Camera, Plus } from "lucide-react";
import { PolaroidCard } from "./PolaroidCard";
import { LightboxModal } from "./LightboxModal";
import type { MediaAsset, MediaCategory } from "@/types/cms";

const CATEGORIES_1996: Array<"Todas" | MediaCategory> = [
  "Todas",
  "Anuario",
  "Compañeros",
  "Profesores",
  "Actividades",
];

const CATEGORIES_2026: Array<"Todas" | MediaCategory> = [
  "Todas",
  "Reencuentro 2026",
  "Reunión 2016",
  "Reunión 2024",
];

export function InteractiveGallery({
  year,
  initialAssets,
}: {
  year: 1996 | 2026;
  initialAssets: MediaAsset[];
}) {
  const categories = year === 1996 ? CATEGORIES_1996 : CATEGORIES_2026;
  const [assets, setAssets] = useState<MediaAsset[]>(initialAssets);
  const [selectedCategory, setSelectedCategory] = useState<
    "Todas" | MediaCategory
  >("Todas");
  const [visibleCount, setVisibleCount] = useState(9);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const syncLiveAssets = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin?scope=public&t=${Date.now()}`, {
        cache: "no-store",
      });
      if (!res.ok) return;
      const json = (await res.json()) as {
        media96?: MediaAsset[];
        media2026?: MediaAsset[];
      };
      const latest = year === 1996 ? json.media96 : json.media2026;
      if (Array.isArray(latest)) {
        setAssets(latest);
      }
    } catch {
      // Keep initialAssets on offline/network error
    }
  }, [year]);

  useEffect(() => {
    setAssets(initialAssets);
  }, [initialAssets]);

  useEffect(() => {
    syncLiveAssets();
    const onFocus = () => syncLiveAssets();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [syncLiveAssets]);

  const filteredAssets = useMemo(() => {
    if (selectedCategory === "Todas") return assets;
    return assets.filter((item) => {
      if (
        selectedCategory === "Reencuentro 2026" &&
        (item.category === "Reencuentro 2026" ||
          item.category === "Reencuentro")
      ) {
        return true;
      }
      return item.category === selectedCategory;
    });
  }, [assets, selectedCategory]);

  const displayedAssets = filteredAssets.slice(0, visibleCount);

  return (
    <div>
      {/* Filter Pills Bar */}
      <div
        className="flex flex-wrap items-center gap-2 sm:gap-2.5 mb-8"
        role="tablist"
        aria-label={`Filtros de Galería ${year}`}
      >
        {categories.map((cat) => {
          const active = selectedCategory === cat;
          const count =
            cat === "Todas"
              ? assets.length
              : assets.filter((item) =>
                  cat === "Reencuentro 2026"
                    ? item.category === "Reencuentro 2026" ||
                      item.category === "Reencuentro"
                    : item.category === cat
                ).length;

          return (
            <button
              key={cat}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => {
                setSelectedCategory(cat);
                setVisibleCount(9);
              }}
              className={`inline-flex min-h-[42px] items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition-all cursor-pointer ${
                active
                  ? "bg-[#A52728] text-white shadow-sm"
                  : "border border-[#142B53]/20 bg-[#FCFBF7] text-[#142B53] hover:border-[#142B53]/45 hover:bg-white"
              }`}
            >
              <span>{cat}</span>
              {count > 0 && (
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[11px] font-bold leading-none ${
                    active
                      ? "bg-white/20 text-white"
                      : "bg-[#142B53]/10 text-[#142B53]"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Empty State when no photos uploaded yet */}
      {displayedAssets.length === 0 ? (
        <div className="rounded-2xl border border-[#142B53]/15 bg-[#FCFBF7] p-10 sm:p-12 text-center shadow-xs">
          <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#142B53]/10 text-[#A52728]">
            <Camera className="h-6 w-6" />
          </div>
          <p className="font-serif text-xl sm:text-2xl font-bold text-[#142B53]">
            {selectedCategory === "Todas"
              ? "Aún no se han subido fotografías en esta galería"
              : `Aún no se han subido fotografías en «${selectedCategory}»`}
          </p>
          <p className="mt-2 text-sm sm:text-base text-[#111827]/75 max-w-lg mx-auto">
            Muy pronto iremos publicando las fotografías de{" "}
            {selectedCategory === "Todas"
              ? "nuestros encuentros y reuniones"
              : `«${selectedCategory}»`}
            . Si tienes fotos de este encuentro, compártelas para que aparezcan
            aquí tras su aprobación.
          </p>
          <div className="mt-6">
            <Link
              href="/compartir"
              className="inline-flex min-h-[42px] items-center gap-2 rounded-md bg-[#A52728] px-5 py-2 text-xs sm:text-sm font-semibold text-white shadow-xs hover:bg-[#8B1E1F] transition"
            >
              <Plus className="h-4 w-4" />
              <span>Subir fotografía para este álbum</span>
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7 sm:gap-8">
            {displayedAssets.map((asset, idx) => (
              <PolaroidCard
                key={asset.id}
                asset={asset}
                priority={idx < 3}
                onSelect={() => setLightboxIndex(idx)}
              />
            ))}
          </div>

          {visibleCount < filteredAssets.length && (
            <div className="mt-10 flex justify-center">
              <button
                type="button"
                onClick={() => setVisibleCount((c) => c + 6)}
                className="min-h-[46px] rounded-md border-2 border-[#142B53] bg-transparent px-6 py-2.5 text-sm font-semibold text-[#142B53] transition hover:bg-[#142B53] hover:text-[#F6F2E9]"
              >
                Cargar más fotografías ({filteredAssets.length - visibleCount}{" "}
                restantes)
              </button>
            </div>
          )}
        </>
      )}

      <LightboxModal
        items={filteredAssets}
        activeIndex={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onNavigate={(nextIdx) => setLightboxIndex(nextIdx)}
      />
    </div>
  );
}
