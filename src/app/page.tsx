import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  Calendar,
  Clock,
  ExternalLink,
  MapPin,
  Music,
  PartyPopper,
  Plus,
  Sparkles,
  Utensils,
} from "lucide-react";
import { ClassOf1996HeroEmblem } from "@/components/BrandLogos";
import { Footer } from "@/components/Footer";
import { HomePolaroidCluster } from "@/components/HomePolaroidCluster";
import { Navbar } from "@/components/Navbar";
import { VideoPlayerCard } from "@/components/VideoPlayerCard";
import { contentRepository } from "@/lib/contentRepository";

function IconBirrete() {
  return (
    <svg viewBox="0 0 36 36" fill="none" className="h-8 w-8 stroke-current" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 14L18 7L33 14L18 21L3 14Z" />
      <path d="M9 17.2V24.5C9 26.8 13 29 18 29C23 29 27 26.8 27 24.5V17.2" />
      <path d="M31 15V24" />
      <circle cx="31" cy="25.5" r="1.3" fill="currentColor" />
    </svg>
  );
}

function IconVideos() {
  return (
    <svg viewBox="0 0 36 36" fill="none" className="h-8 w-8 stroke-current" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="7" width="28" height="22" rx="4" />
      <polygon points="15,13 24,18 15,23" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconGalerias() {
  return (
    <svg viewBox="0 0 36 36" fill="none" className="h-8 w-8 stroke-current" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="7" width="28" height="22" rx="3" />
      <circle cx="12" cy="13.5" r="2.2" />
      <path d="M5 25L13.5 17.5L19.5 22.5L24.5 18L31 25" />
    </svg>
  );
}

function IconCalendario() {
  return (
    <svg viewBox="0 0 36 36" fill="none" className="h-8 w-8 stroke-current" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="8" width="26" height="22" rx="3" />
      <path d="M11 5V10M25 5V10M5 14H31" />
      <circle cx="12" cy="19.5" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="18" cy="19.5" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="24" cy="19.5" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="12" cy="24.5" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="18" cy="24.5" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="24" cy="24.5" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconRecuerdos() {
  return (
    <svg viewBox="0 0 36 36" fill="none" className="h-8 w-8 stroke-current" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="12" r="3.6" />
      <circle cx="9.5" cy="14" r="2.8" />
      <circle cx="26.5" cy="14" r="2.8" />
      <path d="M11.5 27C11.5 22.8 14.3 20 18 20C21.7 20 24.5 22.8 24.5 27" />
      <path d="M4.5 27C4.5 23.8 6.5 21.5 9.5 21.5" />
      <path d="M31.5 27C31.5 23.8 29.5 21.5 26.5 21.5" />
    </svg>
  );
}

function IconColegio() {
  return (
    <svg viewBox="0 0 36 36" fill="none" className="h-8 w-8 stroke-current" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 29H32" />
      <path d="M12 29V15L18 10L24 15V29" />
      <path d="M6 29V19H12M24 19H30V29" />
      <path d="M18 10V5H22V7.5H18" />
      <path d="M16 29V23.5C16 22.4 16.9 21.5 18 21.5C19.1 21.5 20 22.4 20 23.5V29" />
      <circle cx="18" cy="15.5" r="1.4" />
    </svg>
  );
}

const SECTION_INDEX_ITEMS = [
  {
    label: "Nuestra Historia",
    sublabel: "",
    href: "#nuestra-historia",
    Icon: IconBirrete,
  },
  {
    label: "Videos",
    sublabel: "",
    href: "#video-conmemorativo",
    Icon: IconVideos,
  },
  {
    label: "Galerías",
    sublabel: "",
    href: "#galeria-1996",
    Icon: IconGalerias,
  },
  {
    label: "El Encuentro",
    sublabel: "19 de Dic. 2026",
    href: "#el-encuentro",
    Icon: IconCalendario,
  },
  {
    label: "Recuerdos",
    sublabel: "",
    href: "#recuerdos",
    Icon: IconRecuerdos,
  },
  {
    label: "El Colegio",
    sublabel: "",
    href: "#el-colegio",
    Icon: IconColegio,
  },
];

export default async function HomePage() {
  const [settings, milestones, media1996, videos, stories, agenda] =
    await Promise.all([
      contentRepository.getSiteSettings(),
      contentRepository.getHistoryMilestones(),
      contentRepository.getMediaByYear(1996),
      contentRepository.getVideos(),
      contentRepository.getStories(),
      contentRepository.getAgenda(),
    ]);

  const videoHistoria =
    videos.find((v) => v.slug === "historia") || videos[0];
  const videoReencuentro =
    videos.find((v) => v.slug === "reencuentro") || videos[1];

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F2E9]">
      <Navbar />

      <main id="contenido-principal" className="flex-1">
        {/* =====================================================================
            HERO SECTION — V2 APPROVED DESIGN
            Left: Tilted Campus Polaroid ("1996 - 2026")
            Center: Protagonist "Class of 1996 / 30 YEARS REUNION" Emblem
            Right: Handwritten Copy + Subtitle + CTA
           ===================================================================== */}
        <section className="relative overflow-hidden bg-navy-editorial text-[#F6F2E9] pt-8 pb-12 sm:py-14 lg:py-16">
          {/* Crimson Torn-Ribbon Brush Accents in Top-Left & Bottom-Right matching V2 */}
          <div
            className="pointer-events-none absolute -top-10 -left-16 h-44 w-96 -rotate-[14deg] bg-gradient-to-r from-[#A52728] via-[#A52728]/85 to-transparent opacity-90"
            style={{
              clipPath: "polygon(0 0, 100% 10%, 92% 88%, 0 100%)",
            }}
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -bottom-10 -right-10 h-36 w-96 -rotate-[8deg] bg-gradient-to-l from-[#A52728] via-[#A52728]/80 to-transparent opacity-85"
            style={{
              clipPath: "polygon(8% 15%, 100% 0, 100% 100%, 0 90%)",
            }}
            aria-hidden="true"
          />

          <div className="relative mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-8 lg:gap-4">
              {/* Left Column: Tilted Polaroid with Campus & "1996 - 2026" Overlapping Paper Tag */}
              <div className="order-2 lg:order-1 lg:col-span-4 flex justify-center">
                <div className="relative w-full max-w-[240px] sm:max-w-[360px] group">
                  <div className="polaroid-frame album-tape-top relative w-full -rotate-[3.5deg] sm:-rotate-[5.5deg] bg-[#F7F1E3] !p-2 !pb-5 sm:!p-3 sm:!pb-7 shadow-[0_22px_48px_rgba(0,0,0,0.55)] transition-all duration-500 sm:group-hover:rotate-0 sm:group-hover:scale-[1.02]">
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#142B53]/15">
                      <Image
                        src="/images/colegio-new-cambridge-real.jpg"
                        alt="Fachada del New Cambridge School (1996 - 2026)"
                        fill
                        priority
                        unoptimized
                        sizes="(max-width: 768px) 240px, 360px"
                        className="object-cover transition-transform duration-700 sm:group-hover:scale-105"
                      />
                    </div>
                  </div>
                  {/* Overlapping Tilted Paper Tag at Bottom-Left matching V2 Hero */}
                  <div className="absolute -bottom-2.5 sm:-bottom-3 left-3 sm:left-5 z-20 -rotate-[6deg] sm:-rotate-[8deg] rounded-[2px] border border-[#142B53]/15 bg-[#F7F1E3] px-3.5 sm:px-5 py-0.5 sm:py-1 shadow-[0_8px_20px_rgba(0,0,0,0.4)] transition-transform duration-500 sm:group-hover:rotate-0">
                    <span className="font-script text-xl sm:text-[1.75rem] font-bold tracking-wider text-[#0E1E38]">
                      1996 – 2026
                    </span>
                  </div>
                </div>
              </div>

              {/* Center Column (Protagonist on All Screens): Class of 1996 / 30 YEARS REUNION */}
              <div className="order-1 lg:order-2 lg:col-span-4 flex flex-col items-center justify-center text-center">
                <ClassOf1996HeroEmblem />
              </div>

              {/* Right Column: Nostalgic Handwritten Headline + Subheadline + CTA */}
              <div className="order-3 lg:col-span-4 flex flex-col items-center text-center px-2">
                <h1 className="font-script -rotate-[4deg] text-4xl sm:text-5xl lg:text-[3.1rem] leading-[1.06] font-bold text-[#FCFBF7] drop-shadow-[0_3px_10px_rgba(0,0,0,0.5)] max-w-md">
                  {settings.hero_title}
                </h1>

                {/* Subtle Horizontal Divider matching V2 */}
                <div
                  className="my-5 h-[1px] w-full max-w-[260px] bg-gradient-to-r from-transparent via-white/35 to-transparent"
                  aria-hidden="true"
                />

                <p className="font-sans text-xs sm:text-[13px] font-bold uppercase tracking-[0.14em] leading-relaxed text-[#F6F2E9]/90 max-w-xs">
                  {settings.hero_subtitle}
                </p>

                <div className="mt-6 w-full sm:w-auto lg:hidden">
                  <a
                    href="#el-encuentro"
                    className="inline-flex min-h-[46px] w-full sm:w-auto items-center justify-center gap-2 rounded-md bg-[#A52728] px-6 py-3 text-sm sm:text-base font-semibold text-white shadow-lg transition-all hover:bg-[#8B1E1F]"
                  >
                    <span>Explorar el evento</span>
                    <ArrowDown className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================================
            SECTION INDEX BAR (6 Custom Line Icons matching V2)
           ===================================================================== */}
        <section
          aria-label="Índice rápido de secciones"
          className="relative bg-[#0B1C36] text-[#F6F2E9] pt-2 pb-3"
        >
          <div className="mx-auto max-w-[1280px] px-2 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 divide-y sm:divide-y-0 sm:divide-x divide-white/15">
              {SECTION_INDEX_ITEMS.map(({ label, sublabel, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  className="group flex flex-col items-center justify-center gap-1.5 py-3.5 px-3 text-center transition-all hover:bg-white/5"
                >
                  <span className="text-[#F6F2E9]/90 transition-transform duration-300 group-hover:-translate-y-1 group-hover:text-[#D9B875]">
                    <Icon />
                  </span>
                  <span className="text-xs sm:text-[13px] font-semibold leading-tight text-[#F6F2E9]">
                    {label}
                  </span>
                  {sublabel && (
                    <span className="text-[11px] font-medium text-[#F6F2E9]/85">
                      {sublabel}
                    </span>
                  )}
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* =====================================================================
            NUESTRA HISTORIA (Warm Ivory Paper + Overlapping Polaroids + Timeline)
           ===================================================================== */}
        <section
          id="nuestra-historia"
          className="relative scroll-mt-20 bg-ivory-paper py-12 sm:py-16"
        >
          <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-10 lg:gap-8">
              {/* Left Text Column matching V2 */}
              <div className="lg:col-span-5">
                <h2 className="font-serif text-3xl sm:text-4xl lg:text-[2.75rem] font-bold tracking-tight text-[#0E1E38]">
                  Nuestra Historia
                </h2>
                <div className="mt-3 h-[3px] w-12 bg-[#A52728]" />
                <p className="mt-4 text-base sm:text-lg leading-relaxed text-[#1F2937]">
                  Un recorrido por los momentos, lugares y personas que hicieron
                  inolvidable nuestra generación.
                </p>
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <a
                    href="#linea-de-tiempo"
                    className="inline-flex min-h-[44px] items-center gap-2 rounded-md bg-[#A52728] px-6 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-[#8B1E1F] hover:-translate-y-0.5"
                  >
                    <span>Conocer la Historia</span>
                    <ArrowRight className="h-4 w-4" />
                  </a>
                  <Link
                    href="/historias"
                    className="inline-flex min-h-[44px] items-center gap-2 rounded-md border border-[#142B53]/25 bg-[#FCFBF7] px-4 py-2.5 text-sm font-semibold text-[#142B53] transition hover:bg-[#142B53] hover:text-white"
                  >
                    Ver relatos
                  </Link>
                </div>
              </div>

              {/* Right Polaroid Collage Column */}
              <div className="lg:col-span-7">
                <HomePolaroidCluster
                  assets={media1996}
                  variant="historia"
                />
              </div>
            </div>

            {/* Interactive Timeline Milestones */}
            <div
              id="linea-de-tiempo"
              className="mt-12 scroll-mt-24 pt-8 border-t border-[#142B53]/15"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {milestones.map((m, index) => (
                  <div
                    key={m.id}
                    className="relative rounded-xl border border-[#142B53]/15 bg-[#FCFBF7] p-5 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-display text-lg font-bold uppercase tracking-wider text-[#A52728]">
                        {m.year}
                      </span>
                      <span className="rounded bg-[#142B53]/10 px-2 py-0.5 text-[11px] font-semibold text-[#142B53]">
                        0{index + 1} · {m.tag}
                      </span>
                    </div>
                    <h3 className="mt-2 font-serif text-lg font-bold text-[#142B53]">
                      {m.title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-[#111827]/80">
                      {m.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================================
            VIDEO CONMEMORATIVO (Warm Parchment + Crimson Diagonal Ribbon Accents)
           ===================================================================== */}
        <section
          id="video-conmemorativo"
          className="relative scroll-mt-20 overflow-hidden bg-[#EAE2D3] py-14 sm:py-20"
        >

          {/* Top-Left & Bottom-Right Crimson Diagonal Ribbon Accents matching V2 */}
          <div
            className="pointer-events-none absolute top-2 -left-16 h-36 w-80 -rotate-[12deg] bg-[#A52728]"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -bottom-10 -right-12 h-36 w-96 -rotate-[10deg] bg-[#A52728]"
            aria-hidden="true"
          />

          <div className="relative z-10 mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-8 lg:gap-12">
              {/* Left: Video Player / Editorial Frame */}
              <div className="lg:col-span-7">
                {videoHistoria && (
                  <VideoPlayerCard video={videoHistoria} compact />
                )}
              </div>

              {/* Right: Editorial Copy & Link to /videos/historia */}
              <div className="lg:col-span-5">
                <h2 className="font-serif text-3xl sm:text-4xl lg:text-[2.65rem] font-bold leading-[1.1] text-[#0E1E38]">
                  Video
                  <br />
                  Conmemorativo
                </h2>
                <div className="mt-3 h-[3px] w-12 bg-[#A52728]" />
                <p className="mt-4 text-base sm:text-lg leading-relaxed text-[#1F2937]">
                  Revive con nosotros la historia de la promoción 1996 y todo lo
                  que nos une 30 años después.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href="/videos/historia"
                    className="inline-flex min-h-[44px] items-center gap-2 rounded-md bg-[#A52728] px-6 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-[#8B1E1F] hover:-translate-y-0.5"
                  >
                    <span>Ver video completo</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/videos/reencuentro"
                    className="inline-flex min-h-[44px] items-center gap-2 rounded-md border border-[#142B53]/25 bg-[#FCFBF7] px-5 py-2.5 text-sm font-semibold text-[#142B53] hover:bg-[#142B53] hover:text-white transition"
                  >
                    El Reencuentro 2026
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================================
            GALERÍA 1996 (Deep Navy Section + 3 Tilted Polaroids)
           ===================================================================== */}
        <section
          id="galeria-1996"
          className="relative scroll-mt-20 bg-navy-editorial text-[#F6F2E9] py-14 sm:py-20 overflow-hidden"
        >
          <div className="relative z-10 mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-10">
              {/* Left Copy & Cream Pill Button matching V2 */}
              <div className="lg:col-span-4">
                <h2 className="font-serif text-3xl sm:text-4xl lg:text-[2.75rem] font-bold text-[#FCFBF7]">
                  Galería 1996
                </h2>
                <div className="mt-3 h-[3px] w-12 bg-[#A52728]" />
                <p className="mt-4 text-base leading-relaxed text-[#F6F2E9]/90">
                  Fotos del anuario, actividades, profesores y momentos que
                  siempre recordaremos.
                </p>
                <div className="mt-6">
                  <Link
                    href="/galeria/1996"
                    className="inline-flex min-h-[44px] items-center gap-2 rounded-md bg-[#F6F2E9] px-6 py-2.5 text-sm font-bold text-[#0E1E38] shadow-md transition-all hover:bg-white hover:-translate-y-0.5"
                  >
                    <span>Explorar Galería</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              {/* Right 3 Tilted Polaroid Spread */}
              <div className="lg:col-span-8">
                <HomePolaroidCluster
                  assets={media1996}
                  variant="galeria1996"
                />
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================================
            CENTRAL QUOTE BANNER (Torn Paper Strip matching V2)
            "Las fotografías guardan nuestros rostros. Los recuerdos conservan lo que vivimos juntos."
           ===================================================================== */}
        <section
          aria-label="Frase conmemorativa"
          className="relative bg-[#EFE7D6] py-8 sm:py-10"
        >
          <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
            <blockquote className="relative inline-flex items-start justify-center gap-2 sm:gap-3">
              <span
                className="font-serif text-5xl sm:text-6xl font-bold text-[#A52728] leading-none select-none -mt-1 sm:-mt-2"
                aria-hidden="true"
              >
                “
              </span>
              <span className="font-serif italic text-xl sm:text-2xl md:text-[1.7rem] font-medium leading-snug text-[#0E1E38]">
                Las fotografías guardan nuestros rostros.
                <br className="hidden sm:inline" /> Los recuerdos conservan lo
                que vivimos juntos.”
              </span>
            </blockquote>
          </div>
        </section>

        {/* =====================================================================
            EL GRAN ENCUENTRO (Exact V2 Visual Composition + Full Updated Schedule:
            1:15–5:00 PM Colegio + 5:00–6:00 PM Chiva & Papayera + 6:00 PM–Midnight Fiesta en Andalucía)
           ===================================================================== */}
        <section
          id="el-encuentro"
          className="relative scroll-mt-20 bg-[#F6F2E9] pt-4 pb-4 overflow-hidden"
        >
          {/* Full-bleed V2 Visual Hero Composition matching reference image */}
          <div className="relative mx-auto max-w-[1280px]">
            {/* Top Area: Left Event Details + Right Blended Archways Photo */}
            <div className="relative grid grid-cols-1 lg:grid-cols-12 items-start">
              {/* Left Column: Event Title, Red Line, Date, Location, Red CTA */}
              <div className="relative z-20 px-4 sm:px-6 lg:px-10 pt-8 sm:pt-12 pb-4 lg:col-span-6">
                <h2 className="font-serif text-3xl sm:text-4xl lg:text-[2.85rem] font-bold tracking-tight text-[#0E1E38] leading-tight">
                  El Gran Encuentro
                </h2>
                <div className="mt-3 h-[4px] w-16 rounded-full bg-[#A52728]" />

                <div className="mt-6 space-y-4">
                  <div className="flex items-start gap-3.5">
                    <Calendar className="h-5 w-5 text-[#A52728] shrink-0 mt-1" />
                    <div>
                      <p className="text-base sm:text-lg font-bold text-[#0E1E38]">
                        {settings.event_date_label}
                      </p>
                      <p className="text-xs sm:text-sm font-medium text-[#1F2937]/85">
                        1:30 p. m. – 5:00 p. m. Colegio · 5:00 p. m. Chiva y Papayera · 6:00 p. m. Fiesta en Andalucía
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <MapPin className="h-5 w-5 text-[#A52728] shrink-0 mt-1" />
                    <div>
                      <p className="text-base sm:text-lg font-bold text-[#0E1E38]">
                        {settings.event_location_name}
                      </p>
                      <p className="text-sm sm:text-base text-[#1F2937]/90">
                        {settings.event_location_address}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-7 flex flex-wrap items-center gap-3">
                  <a
                    href="#programa-del-encuentro"
                    className="inline-flex min-h-[44px] items-center gap-2.5 rounded-lg bg-[#A52728] px-6 py-2.5 text-sm sm:text-base font-semibold text-white shadow-md transition-all hover:bg-[#8B1E1F] hover:-translate-y-0.5"
                  >
                    <span>Ver programa completo</span>
                    <ArrowRight className="h-4 w-4" />
                  </a>

                  {settings.tally_verified && settings.tally_url && (
                    <a
                      href={settings.tally_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-[#142B53] bg-white px-5 py-2.5 text-sm font-semibold text-[#142B53] hover:bg-[#142B53] hover:text-white transition"
                    >
                      <span>Confirmar asistencia</span>
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </div>

              {/* Right Column: Seamless Courtyard Archways & Palms Photograph */}
              <div className="lg:col-span-6 px-4 sm:px-6 lg:px-0 pt-2 lg:pt-8">
                <div className="relative overflow-hidden rounded-2xl shadow-lg">
                  <div className="relative aspect-[16/9] w-full">
                    <Image
                      src="/images/encuentro-campus-real.jpg"
                      alt="Entrada principal del New Cambridge School"
                      fill
                      unoptimized
                      sizes="(max-width: 1024px) 95vw, 620px"
                      className="object-cover"
                    />
                    <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#F6F2E9] via-[#F6F2E9]/45 to-transparent hidden lg:block" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">

            {/* =================================================================
                CRONOGRAMA OFICIAL ACTUALIZADO (1:15 PM – MEDIANOCHE)
               ================================================================= */}
            <div
              id="programa-del-encuentro"
              className="mt-10 mb-14 scroll-mt-24 rounded-2xl border border-[#142B53]/15 bg-[#FCFBF7] p-6 sm:p-8 shadow-md"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#142B53]/10 pb-5">
                <div>
                  <span className="inline-block rounded-full bg-[#A52728]/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#A52728]">
                    Cronograma Oficial · Sábado 19 de Diciembre de 2026
                  </span>
                  <h3 className="mt-2 font-serif text-2xl sm:text-3xl font-bold text-[#0E1E38]">
                    Un Día Inolvidable: Colegio, Chiva & Gran Fiesta en Andalucía
                  </h3>
                  <p className="mt-1 text-sm text-[#1F2937]/80">
                    Desde el reencuentro de la tarde en nuestro colegio hasta la gran rumba de egresados en el Club Campestre para celebrar a la mejor Promoción de 1996.
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-[#0E1E38] px-4 py-1.5 text-xs font-semibold text-[#F6F2E9] shrink-0">
                  <Clock className="h-3.5 w-3.5 text-[#D9B875]" />
                  1:15 p. m. – Medianoche
                </span>
              </div>

              {/* 3 Phase Highlights Banner */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-xl border border-[#142B53]/15 bg-[#F6F2E9]/70 p-4">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#142B53]">
                    <Utensils className="h-4 w-4 text-[#A52728]" />
                    <span>1:15 p. m. – 5:00 p. m.</span>
                  </div>
                  <p className="mt-1 font-serif text-base font-bold text-[#0E1E38]">
                    Reencuentro en el Colegio
                  </p>
                  <p className="mt-1 text-xs text-[#1F2937]/80 leading-relaxed">
                    Bienvenida con limonada de coco con cereza, rompehielos, almuerzo de 3 tiempos, video conmemorativo, recorrido guiado por hijos de exalumnos y fotos oficiales.
                  </p>
                </div>

                <div className="rounded-xl border border-[#A52728]/25 bg-[#A52728]/5 p-4">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#A52728]">
                    <Music className="h-4 w-4 text-[#A52728]" />
                    <span>5:00 p. m. – 6:00 p. m.</span>
                  </div>
                  <p className="mt-1 font-serif text-base font-bold text-[#0E1E38]">
                    Chiva Rumbera y Papayera
                  </p>
                  <p className="mt-1 text-xs text-[#1F2937]/80 leading-relaxed">
                    Salida desde portería norte en chiva tradicional acompañada de papayera en vivo para prender la fiesta rumbo al Club Campestre.
                  </p>
                </div>

                <div className="rounded-xl border border-[#D9B875]/50 bg-[#0E1E38] p-4 text-[#F6F2E9]">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#D9B875]">
                    <PartyPopper className="h-4 w-4 text-[#D9B875]" />
                    <span>6:00 p. m. – Medianoche</span>
                  </div>
                  <p className="mt-1 font-serif text-base font-bold text-white">
                    Fiesta en Salón Andalucía (Club Campestre)
                  </p>
                  <p className="mt-1 text-xs text-[#F6F2E9]/85 leading-relaxed">
                    Gran rumba de egresados con música en vivo, comida, bebidas, hora loca y celebración a lo grande de la mejor Promoción de 1996.
                  </p>
                </div>
              </div>

              {/* Detailed Hour-by-Hour Timeline */}
              <div className="mt-6 divide-y divide-[#142B53]/10">
                {agenda.map((item) => {
                  const isEvening =
                    item.time_label.includes("5:00 – 6:00") ||
                    item.time_label.includes("6:00 p. m.");
                  return (
                    <div
                      key={item.id}
                      className={`py-4 first:pt-2 last:pb-0 flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-6 ${
                        isEvening
                          ? "rounded-xl bg-[#A52728]/[0.04] px-3 sm:px-4 my-1 border border-[#A52728]/15"
                          : ""
                      }`}
                    >
                      <div className="sm:w-44 shrink-0">
                        <span
                          className={`inline-block rounded-md px-3 py-1 font-display text-sm font-bold tracking-wide ${
                            isEvening
                              ? "bg-[#A52728] text-white"
                              : "bg-[#142B53]/10 text-[#0E1E38]"
                          }`}
                        >
                          {item.time_label}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-serif text-lg font-bold text-[#0E1E38]">
                            {item.title}
                          </h4>
                          {isEvening && (
                            <span className="rounded-full bg-[#A52728]/15 px-2.5 py-0.5 text-[11px] font-bold text-[#A52728]">
                              Fiesta & Rumba 1996
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-[#1F2937]/85 leading-relaxed">
                          {item.description}
                        </p>
                        {item.location_detail && (
                          <p className="mt-1 text-xs font-medium text-[#142B53]/75">
                            📍 {item.location_detail}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================================
            GALERÍA 2026 & VIDEOS PREVIEW (Matching V2 Right-Column Cards)
           ===================================================================== */}
        <section
          id="reencuentro-2026"
          className="scroll-mt-20 bg-[#EAE2D3] py-14 sm:py-16 border-t border-[#142B53]/10"
        >
          <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch gap-8">
              {/* Left Card: Galería 2026 exact V2 preview */}
              <div className="lg:col-span-6 flex flex-col justify-between overflow-hidden rounded-2xl border border-[#142B53]/15 bg-[#FCFBF7] shadow-md">
                <div className="grid grid-cols-1 sm:grid-cols-12 items-stretch flex-1">
                  <div className="p-6 sm:col-span-6 flex flex-col justify-between">
                    <div>
                      <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0E1E38]">
                        Galería 2026
                      </h2>
                      <p className="mt-1 text-sm text-[#1F2937]/80">
                        Las mejores fotos del reencuentro.
                      </p>
                    </div>
                    <div className="mt-6">
                      <Link
                        href="/galeria/2026"
                        className="inline-flex min-h-[42px] items-center gap-2 rounded-md bg-[#0E1E38] px-5 py-2 text-xs sm:text-sm font-semibold text-[#F6F2E9] hover:bg-[#1B396E] transition"
                      >
                        <span>Abrir Galería 2026</span>
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                  <div className="relative min-h-[200px] sm:col-span-6">
                    <Image
                      src="/images/galeria-2026-camara.png"
                      alt="Galería 2026 — Próximamente después del evento"
                      fill
                      sizes="(max-width: 768px) 100vw, 340px"
                      className="object-cover object-right"
                    />
                    <div className="absolute bottom-3 right-3 left-3 rounded-lg border border-white/80 bg-[#F6F2E9]/95 px-3.5 py-2.5 text-center shadow-lg backdrop-blur-xs">
                      <p className="font-serif text-base font-bold text-[#6E1718]">
                        Próximamente
                      </p>
                      <p className="text-[11px] font-bold text-[#111827]">
                        Después del evento (19 de Dic. 2026)
                      </p>
                    </div>
                  </div>
                </div>
                <div className="h-2.5 w-full bg-gradient-to-r from-[#A52728] via-[#142B53] to-[#0E223D]" />
              </div>

              {/* Right Card: Videos ("Video Conmemorativo 4:36" & "El Reencuentro 2026 8:24") matching V2 */}
              <div className="lg:col-span-6 rounded-2xl border border-[#142B53]/15 bg-[#FCFBF7] p-6 shadow-md">
                <div className="flex items-center justify-between gap-2 mb-4">
                  <div>
                    <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0E1E38]">
                      Videos
                    </h2>
                    <div className="mt-1.5 h-[3px] w-10 bg-[#A52728]" />
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#142B53]/10 px-3 py-1 text-xs font-semibold text-[#142B53]">
                    <Sparkles className="h-3.5 w-3.5 text-[#A52728]" />
                    2 Producciones
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
                  <Link
                    href="/videos/historia"
                    className="group block rounded-xl border border-[#142B53]/10 bg-[#F6F2E9]/60 p-2.5 transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg bg-[#0E1E38]">
                      <Image
                        src="/images/video-thumb-historia.png"
                        alt="Video Conmemorativo — Nuestra historia 1996 - 2026"
                        fill
                        sizes="(max-width: 640px) 90vw, 260px"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <span className="absolute bottom-1.5 right-1.5 rounded bg-black/75 px-1.5 py-0.5 text-[10px] font-bold text-white">
                        4:36
                      </span>
                    </div>
                    <p className="mt-2 font-serif text-sm font-bold text-[#0E1E38] group-hover:text-[#A52728]">
                      Video Conmemorativo
                    </p>
                    <p className="text-xs text-[#1F2937]/75">
                      Nuestra historia 1996 – 2026
                    </p>
                  </Link>

                  <Link
                    href="/videos/reencuentro"
                    className="group block rounded-xl border border-[#142B53]/10 bg-[#F6F2E9]/60 p-2.5 transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg bg-[#0E1E38]">
                      <Image
                        src="/images/video-thumb-reencuentro.png"
                        alt="El Reencuentro 2026 — Así vivimos el gran encuentro"
                        fill
                        sizes="(max-width: 640px) 90vw, 260px"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <span className="absolute bottom-1.5 right-1.5 rounded bg-black/75 px-1.5 py-0.5 text-[10px] font-bold text-white">
                        {videoReencuentro?.duration_label || "8:24"}
                      </span>
                    </div>
                    <p className="mt-2 font-serif text-sm font-bold text-[#0E1E38] group-hover:text-[#A52728]">
                      El Reencuentro 2026
                    </p>
                    <p className="text-xs text-[#1F2937]/75">
                      Así vivimos el gran encuentro
                    </p>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================================
            RECUERDOS Y MENSAJES (Moderated Stories matching V2 Cards)
           ===================================================================== */}
        <section
          id="recuerdos"
          className="scroll-mt-20 bg-ivory-paper py-14 sm:py-20 border-t border-[#142B53]/10"
        >
          <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
              <div>
                <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#0E1E38]">
                  Recuerdos y Mensajes
                </h2>
                <div className="mt-2 h-[3px] w-12 bg-[#A52728]" />
                <p className="mt-3 text-base text-[#1F2937]/85">
                  Anécdotas, historias y mensajes de nuestra generación.
                </p>
              </div>
              <Link
                href="/compartir"
                className="inline-flex min-h-[44px] shrink-0 items-center justify-center gap-2 rounded-md bg-[#A52728] px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-[#8B1E1F] hover:-translate-y-0.5"
              >
                <Plus className="h-4 w-4" />
                <span>Compartir mi recuerdo</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {stories.slice(0, 3).map((story) => (
                <article
                  key={story.id}
                  className="album-tape-top flex flex-col justify-between rounded-xl border border-[#142B53]/15 bg-[#FCFBF7] p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
                >
                  <div>
                    <span
                      className="block font-serif text-4xl font-bold text-[#A52728] leading-none"
                      aria-hidden="true"
                    >
                      “
                    </span>
                    <p className="mt-2 font-serif italic text-base sm:text-lg leading-relaxed text-[#0E1E38]">
                      “{story.excerpt}”
                    </p>
                  </div>
                  <div className="mt-5 border-t border-[#142B53]/10 pt-3">
                    <p className="text-sm font-bold text-[#0E1E38]">
                      — {story.author_display}
                    </p>
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-8 text-center">
              <Link
                href="/historias"
                className="inline-flex min-h-[44px] items-center gap-2 text-sm font-bold text-[#0E1E38] hover:text-[#A52728] underline underline-offset-4"
              >
                <span>Ver todos los recuerdos y mensajes publicados</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* =====================================================================
            NUESTRO COLEGIO (Tribute to New Cambridge School matching V2)
           ===================================================================== */}
        <section
          id="el-colegio"
          className="scroll-mt-20 bg-[#EAE2D3] pt-14 sm:pt-20 pb-0 border-t border-[#142B53]/10 overflow-hidden"
        >
          <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
            <div className="overflow-hidden rounded-2xl border border-[#142B53]/15 bg-[#FCFBF7] shadow-lg">
              <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
                <div className="p-6 sm:p-10 lg:col-span-7 flex flex-col justify-center">
                  <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#0E1E38]">
                    Nuestro Colegio
                  </h2>
                  <div className="mt-2.5 h-[3px] w-12 bg-[#A52728]" />
                  <p className="mt-4 text-base sm:text-lg leading-relaxed text-[#1F2937]">
                    New Cambridge School, un colegio con más de 55 años de
                    historia en Bucaramanga, que sigue formando personas
                    íntegras, creativas y con visión global.
                  </p>
                  <div className="mt-6">
                    <a
                      href="https://cambridge.edu.co/es/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-[44px] items-center gap-2 rounded-md bg-[#A52728] px-6 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-[#8B1E1F] hover:-translate-y-0.5"
                    >
                      <span>Conocer más sobre el colegio</span>
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </div>

                <div className="relative min-h-[260px] sm:min-h-[320px] lg:col-span-5">
                  <Image
                    src="/images/nuestro-colegio-letrero-real.jpg"
                    alt="Fachada principal del New Cambridge School"
                    fill
                    unoptimized
                    sizes="(max-width: 1024px) 100vw, 520px"
                    className="object-cover object-center"
                  />
                  <div className="pointer-events-none absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-[#FCFBF7] to-transparent hidden lg:block" />
                </div>
              </div>
            </div>
          </div>

          {/* =====================================================================
              CIERRE VISUAL SOBRE EL FOOTER: PNG TRANSPARENTE "¡VOLVEMOS A ENCONTRARNOS!"
              (Sin zoom, proporción exacta, apoyado directamente sobre el Footer azul marino)
             ===================================================================== */}
          <div className="relative mt-10 sm:mt-14 pt-6 overflow-hidden">
            {/* Warm Golden Sunset Glow Behind the 7 Friends */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 bottom-0 top-0"
              style={{
                background:
                  "radial-gradient(ellipse 58% 75% at 38% 85%, rgba(245, 176, 65, 0.52) 0%, rgba(248, 196, 113, 0.28) 45%, rgba(234, 226, 211, 0) 75%)",
              }}
            />

            {/* Bottom-Left Crimson Brush Accent matching V2 design */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute bottom-0 left-0 h-16 w-28 sm:h-24 sm:w-48 opacity-90"
              style={{
                background:
                  "radial-gradient(ellipse 90% 80% at 0% 100%, #A52728 0%, #8B1E1F 45%, transparent 72%)",
              }}
            />

            <div className="relative z-20 mx-auto max-w-[1160px] px-2 sm:px-6 -mb-1.5 sm:-mb-2.5">
              <Image
                src="/images/volvemos-a-encontrarnos-transparent.png"
                alt="Generación 1996 abrazada al atardecer — ¡Volvemos a encontrarnos!"
                width={988}
                height={166}
                unoptimized
                className="block w-full h-auto select-none drop-shadow-[0_4px_12px_rgba(14,30,56,0.12)]"
              />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
