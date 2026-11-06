import React from "react";
import Image from "next/image";

/**
 * Institutional emblem for Navbar & Footer (Left-aligned).
 * Recreates the exact V2 logo mark: rounded square with a bold crimson diagonal band
 * from bottom-left to top-right, white inner borders, and navy corners + stacked "NEW CAMBRIDGE SCHOOL".
 */
export function NewCambridgeNavbarLogo({
  size = "md",
}: {
  size?: "sm" | "md";
}) {
  const boxDim = size === "sm" ? "h-8 w-8" : "h-10 w-10";
  const textClass =
    size === "sm"
      ? "text-[9.5px] leading-[1.06] tracking-[0.08em]"
      : "text-[11.5px] leading-[1.06] tracking-[0.08em]";

  return (
    <div className="inline-flex items-center gap-2.5 select-none group">
      <div
        className={`${boxDim} relative shrink-0 overflow-hidden rounded-[8px] shadow-md transition-transform duration-300 group-hover:scale-105`}
        aria-hidden="true"
      >
        <svg viewBox="0 0 44 44" className="h-full w-full">
          {/* Top-left Navy Corner */}
          <rect
            x="2"
            y="2"
            width="22"
            height="22"
            rx="6"
            fill="#143A6E"
            stroke="#F6F2E9"
            strokeWidth="2"
          />
          {/* Bottom-right Navy Corner */}
          <rect
            x="20"
            y="20"
            width="22"
            height="22"
            rx="6"
            fill="#143A6E"
            stroke="#F6F2E9"
            strokeWidth="2"
          />
          {/* Diagonal Crimson Band from Bottom-Left to Top-Right */}
          <path
            d="M3 27 L27 3 Q34 2 40 4 Q42 10 41 17 L17 41 Q10 42 4 40 Q2 34 3 27 Z"
            fill="#B72524"
            stroke="#F6F2E9"
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div
        className={`flex flex-col font-sans font-extrabold uppercase text-[#F6F2E9] ${textClass}`}
      >
        <span>NEW</span>
        <span>CAMBRIDGE</span>
        <span>SCHOOL</span>
      </div>
    </div>
  );
}

/**
 * Protagonist Commemorative Logo centered in the Hero section:
 * Uses the exact high-resolution "Class of 1996 / 30 YEARS REUNION" artwork provided by the user,
 * cleanly keyed with a transparent background and optimized for the web.
 */
export function ClassOf1996HeroEmblem({
  compact = false,
}: {
  compact?: boolean;
}) {
  if (compact) {
    return (
      <div className="inline-flex items-center justify-center select-none w-36 sm:w-44">
        <Image
          src="/images/class-of-1996-official.png"
          alt="Class of 1996 — 30 Years Reunion"
          width={1013}
          height={949}
          unoptimized
          className="h-auto w-full object-contain drop-shadow-[0_6px_14px_rgba(0,0,0,0.4)]"
        />
      </div>
    );
  }

  return (
    <div
      className="relative mx-auto flex items-center justify-center select-none w-full max-w-[330px] sm:max-w-[390px] lg:max-w-[430px] transition-transform duration-500 hover:scale-[1.03]"
      aria-label="Class of 1996 — 30 Years Reunion"
    >
      <Image
        src="/images/class-of-1996-official.png"
        alt="Class of 1996 — 30 Years Reunion"
        width={1013}
        height={949}
        priority
        unoptimized
        sizes="(max-width: 640px) 320px, (max-width: 1024px) 390px, 430px"
        className="h-auto w-full object-contain drop-shadow-[0_14px_28px_rgba(0,0,0,0.45)]"
      />
    </div>
  );
}
