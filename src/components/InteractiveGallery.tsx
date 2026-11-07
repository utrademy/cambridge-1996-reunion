"use client";

import React, { useMemo, useState } from "react";
import { PolaroidCard } from "./PolaroidCard";
import { LightboxModal } from "./LightboxModal";
import type { MediaAsset, MediaCategory } from "@/types/cms";

const CATEGORIES_1996: Array<"Todo" | MediaCategory> = [
  "Todo",
  "Anuario",
  "Compañeros",
  "Profesores",
  "Actividades",
];

const CATEGORIES_2026: Array<"Todo" | MediaCategory> = [
  "Todo",
  "Reencuentro",
  "Compañeros",
  "Campus",
];

export function InteractiveGallery({
  year,
  initialAssets,
}: {
  year: 1996 | 2026;
  initialAssets: MediaAsset[];
}) {
  const categories = year === 1996 ? CATEGORIES_1996 : CATEGORIES_2026;
  const [selectedCategory, setSelectedCategory] = useState<"Todo" | MediaCategory>("Todo");
  const [visibleCount, setVisibleCount] = useState(9);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const filteredAssets = useMemo(() => {
    if (selectedCategory === "Todo") return initialAssets;
    return initialAssets.filter((item) => item.category === selectedCategory);
  }, [initialAssets, selectedCategory]);

  const displayedAssets = filteredAssets.slice(0, visibleCount);

  return (
    <div>
      {/* Filter Pills Bar matching V2 Galería 1996 Reference */}
      <div
        className="flex flex-wrap items-center gap-2 sm:gap-2.5 mb-8"
        role="tablist"
        aria-label={`Filtros de Galería ${year}`}
      >
        {categories.map((cat) => {
          const active = selectedCategory === cat;
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
              className={`min-h-[42px] rounded-md px-4 py-2 text-sm font-semibold transition-all ${
                active
                  ? "bg-[#A52728] text-white shadow-sm"
                  : "border border-[#142B53]/20 bg-[#FCFBF7] text-[#142B53] hover:border-[#142B53]/45 hover:bg-white"
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Empty State */}
      {displayedAssets.length === 0 ? (
        <div className="rounded-xl border border-[#142B53]/15 bg-[#FCFBF7] p-10 text-center shadow-xs">
          <p className="font-serif text-xl font-bold text-[#142B53]">
            Aún no hay fotografías publicadas en la categoría «{selectedCategory}»
          </p>
          <p className="mt-2 text-sm text-[#111827]/75 max-w-md mx-auto">
            Puedes explorar otra categoría o compartir tus propias fotografías
            conmemorativas para revisión del comité organizador.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-8 px-1 sm:px-0">
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
