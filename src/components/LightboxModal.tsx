"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  ZoomIn,
  ZoomOut,
  X,
} from "lucide-react";
import type { MediaAsset } from "@/types/cms";

export function LightboxModal({
  items,
  activeIndex,
  onClose,
  onNavigate,
}: {
  items: MediaAsset[];
  activeIndex: number | null;
  onClose: () => void;
  onNavigate: (newIndex: number) => void;
}) {
  const [zoomed, setZoomed] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const isOpen = activeIndex !== null && activeIndex >= 0 && activeIndex < items.length;
  const current = isOpen ? items[activeIndex] : null;

  useEffect(() => {
    if (!isOpen || activeIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") {
        setZoomed(false);
        onNavigate((activeIndex + 1) % items.length);
      }
      if (e.key === "ArrowLeft") {
        setZoomed(false);
        onNavigate((activeIndex - 1 + items.length) % items.length);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, activeIndex, items.length, onClose, onNavigate]);

  if (!isOpen || !current || activeIndex === null) return null;

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(deltaX) > 50) {
      setZoomed(false);
      if (deltaX < 0) {
        onNavigate((activeIndex + 1) % items.length);
      } else {
        onNavigate((activeIndex - 1 + items.length) % items.length);
      }
    }
    setTouchStartX(null);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Visor de imagen: ${current.title}`}
      className="fixed inset-0 z-[80] flex items-center justify-center bg-[#0B172E]/95 p-3 sm:p-6 backdrop-blur-md"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Top Action Bar */}
      <div className="fixed top-4 left-4 right-4 z-[90] flex items-center justify-between">
        <div className="rounded-full bg-white/10 px-4 py-1.5 text-xs sm:text-sm font-medium text-[#F6F2E9]">
          {activeIndex + 1} / {items.length} · {current.category} ({current.year})
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setZoomed((z) => !z)}
            aria-label={zoomed ? "Reducir zoom" : "Ampliar imagen"}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-[#F6F2E9] hover:bg-white/20"
          >
            {zoomed ? <ZoomOut className="h-5 w-5" /> : <ZoomIn className="h-5 w-5" />}
          </button>

          {current.allow_download && (
            <a
              href={current.preview_url}
              download={`${current.title.replace(/\s+/g, "-").toLowerCase()}.webp`}
              aria-label="Descargar imagen autorizada"
              className="inline-flex h-11 items-center gap-1.5 rounded-full bg-[#A52728] px-4 text-xs font-semibold text-white hover:bg-[#8B1E1F]"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Descargar</span>
            </a>
          )}

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar visor"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white hover:bg-[#A52728]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Prev Button */}
      {items.length > 1 && (
        <button
          type="button"
          onClick={() => {
            setZoomed(false);
            onNavigate((activeIndex - 1 + items.length) % items.length);
          }}
          aria-label="Imagen anterior"
          className="fixed left-3 sm:left-6 z-[90] inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-[#142B53]/80 text-white shadow-lg hover:bg-[#A52728]"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
      )}

      {/* Next Button */}
      {items.length > 1 && (
        <button
          type="button"
          onClick={() => {
            setZoomed(false);
            onNavigate((activeIndex + 1) % items.length);
          }}
          aria-label="Imagen siguiente"
          className="fixed right-3 sm:right-6 z-[90] inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-[#142B53]/80 text-white shadow-lg hover:bg-[#A52728]"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      )}

      {/* Main Polaroid/Editorial Display */}
      <div className="mx-auto flex max-w-4xl w-full flex-col items-center">
        <div
          className={`relative w-full overflow-hidden rounded-lg border-4 border-[#F6F2E9] bg-[#142B53] shadow-2xl transition-transform duration-300 ${
            zoomed ? "scale-125 cursor-zoom-out" : "cursor-zoom-in"
          }`}
          onClick={() => setZoomed((z) => !z)}
        >
          <div className="relative aspect-[4/3] w-full max-h-[68vh]">
            <Image
              src={current.preview_url}
              alt={current.title}
              fill
              sizes="90vw"
              unoptimized={current.preview_url.startsWith("data:")}
              className="object-contain"
            />
          </div>
        </div>

        <div className="mt-4 max-w-2xl text-center px-4">
          <h3 className="font-serif text-lg sm:text-xl font-bold text-[#F6F2E9]">
            {current.title}
          </h3>
          <p className="mt-1 text-sm text-[#F6F2E9]/80">{current.caption}</p>
          {current.is_demo_art && (
            <span className="mt-2 inline-block rounded-full border border-[#D9B875]/50 bg-[#D9B875]/15 px-3 py-0.5 text-xs text-[#D9B875]">
              Ilustración artística de demostración — No corresponde a una fotografía real sin verificar
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
