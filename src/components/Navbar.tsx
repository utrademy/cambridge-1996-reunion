"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, X } from "lucide-react";
import { NewCambridgeNavbarLogo } from "./BrandLogos";

interface NavItem {
  id: string;
  label: string;
  href: string;
  hash?: string;
  children?: Array<{ label: string; href: string }>;
}

const NAV_LINKS: NavItem[] = [
  { id: "inicio", label: "Inicio", href: "/" },
  {
    id: "nuestra-historia",
    label: "Nuestra Historia",
    href: "/#nuestra-historia",
    hash: "nuestra-historia",
  },
  { id: "videos", label: "Videos", href: "/videos" },
  {
    id: "galerias",
    label: "Galerías",
    href: "/galeria/1996",
    children: [
      { label: "Galería 1996 · Archivo y Anuario", href: "/galeria/1996" },
      { label: "Galería 2026 · El Reencuentro", href: "/galeria/2026" },
    ],
  },
  {
    id: "el-encuentro",
    label: "El Encuentro",
    href: "/#el-encuentro",
    hash: "el-encuentro",
  },
  {
    id: "recuerdos",
    label: "Recuerdos",
    href: "/historias",
  },
  {
    id: "el-colegio",
    label: "El Colegio",
    href: "/#el-colegio",
    hash: "el-colegio",
  },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [galleryDropdownOpen, setGalleryDropdownOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeHash, setActiveHash] = useState<string>("");

  useEffect(() => {
    const syncHash = () => {
      if (typeof window !== "undefined") {
        setActiveHash(window.location.hash.replace(/^#/, ""));
      }
    };
    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        setScrollProgress(Math.min(100, (window.scrollY / totalHeight) * 100));
      } else {
        setScrollProgress(0);
      }

      // If on home page and user scrolls back to top, reset active indicator to "Inicio"
      if (pathname === "/" && window.scrollY < 180 && activeHash) {
        setActiveHash("");
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname, activeHash]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileOpen(false);
        setGalleryDropdownOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    item: NavItem
  ) => {
    setMobileOpen(false);
    setGalleryDropdownOpen(false);

    if (item.id === "inicio" && pathname === "/") {
      e.preventDefault();
      setActiveHash("");
      window.history.pushState(null, "", "/");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (item.hash) {
      setActiveHash(item.hash);
      if (pathname === "/") {
        const targetEl = document.getElementById(item.hash);
        if (targetEl) {
          e.preventDefault();
          window.history.pushState(null, "", `/#${item.hash}`);
          targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    } else {
      setActiveHash("");
    }
  };

  const isItemActive = (item: NavItem): boolean => {
    if (item.children) {
      return pathname.startsWith("/galeria");
    }
    if (item.id === "videos") {
      return pathname.startsWith("/videos");
    }
    if (item.id === "recuerdos") {
      return pathname.startsWith("/historias");
    }
    if (item.hash) {
      return pathname === "/" && activeHash === item.hash;
    }
    if (item.id === "inicio") {
      return pathname === "/" && !activeHash;
    }
    return false;
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#142B53]/95 backdrop-blur-md text-[#F6F2E9] shadow-md">
      {/* Subtle Top Scroll Progress Bar */}
      <div
        className="h-[2px] bg-gradient-to-r from-[#A52728] via-[#D9B875] to-[#A52728] transition-all duration-150"
        style={{ width: `${scrollProgress}%` }}
        aria-hidden="true"
      />

      <div className="mx-auto flex max-w-[1280px] items-center justify-between px-4 sm:px-6 lg:px-8 h-16 sm:h-[72px]">
        {/* Left: New Cambridge School Logo */}
        <Link
          href="/"
          onClick={(e) => handleNavClick(e, NAV_LINKS[0])}
          className="group flex items-center gap-2 rounded-md py-1 focus:outline-none"
          aria-label="Ir al inicio — Promoción 1996 New Cambridge School"
        >
          <NewCambridgeNavbarLogo />
        </Link>

        {/* Center: Desktop Navigation */}
        <nav
          className="hidden lg:flex items-center gap-1 xl:gap-2"
          aria-label="Navegación principal"
        >
          {NAV_LINKS.map((item) => {
            const isActive = isItemActive(item);

            if (item.children) {
              return (
                <div
                  key={item.id}
                  className="relative"
                  onMouseEnter={() => setGalleryDropdownOpen(true)}
                  onMouseLeave={() => setGalleryDropdownOpen(false)}
                >
                  <button
                    type="button"
                    onClick={() => setGalleryDropdownOpen((v) => !v)}
                    aria-expanded={galleryDropdownOpen}
                    className={`relative inline-flex min-h-[44px] items-center gap-1 px-3 py-2 text-sm transition-colors rounded-md hover:text-white cursor-pointer ${
                      isActive
                        ? "text-white font-semibold"
                        : "text-[#F6F2E9]/85 font-medium"
                    }`}
                  >
                    <span>{item.label}</span>
                    <ChevronDown className="h-3.5 w-3.5 opacity-80" />
                    {isActive && (
                      <span className="absolute bottom-1.5 left-3 right-3 h-[2.5px] rounded-full bg-[#A52728]" />
                    )}
                  </button>

                  {galleryDropdownOpen && (
                    <div className="absolute left-0 top-full pt-1 w-64 z-50">
                      <div className="rounded-lg border border-white/15 bg-[#0F2242] p-1.5 shadow-xl">
                        {item.children.map((sub) => {
                          const subActive = pathname === sub.href;
                          return (
                            <Link
                              key={sub.href}
                              href={sub.href}
                              onClick={() => {
                                setGalleryDropdownOpen(false);
                                setActiveHash("");
                              }}
                              className={`block rounded-md px-3.5 py-2.5 text-sm transition-colors ${
                                subActive
                                  ? "bg-[#A52728] text-white font-semibold"
                                  : "text-[#F6F2E9] hover:bg-[#A52728]/85 hover:text-white"
                              }`}
                            >
                              {sub.label}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={(e) => handleNavClick(e, item)}
                className={`relative inline-flex min-h-[44px] items-center px-3 py-2 text-sm transition-colors rounded-md hover:text-white ${
                  isActive
                    ? "text-white font-semibold"
                    : "text-[#F6F2E9]/85 font-medium"
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-1.5 left-3 right-3 h-[2.5px] rounded-full bg-[#A52728]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right: Red CTA "Compartir" & Mobile Hamburger */}
        <div className="flex items-center gap-3">
          <Link
            href="/compartir"
            onClick={() => setActiveHash("")}
            className="hidden sm:inline-flex min-h-[40px] items-center justify-center rounded-md bg-[#A52728] px-5 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#8B1E1F] hover:-translate-y-0.5 active:translate-y-0"
          >
            Compartir
          </Link>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="inline-flex lg:hidden min-h-[44px] min-w-[44px] items-center justify-center rounded-md border border-white/20 bg-white/5 text-[#F6F2E9] hover:bg-white/10"
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú de navegación"}
          >
            {mobileOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-white/15 bg-[#0F2140] px-4 pt-3 pb-6 shadow-2xl">
          <nav className="flex flex-col space-y-1" aria-label="Menú móvil">
            {NAV_LINKS.map((item) => {
              const isActive = isItemActive(item);
              return (
                <React.Fragment key={item.id}>
                  <Link
                    href={item.href}
                    onClick={(e) => handleNavClick(e, item)}
                    className={`flex min-h-[44px] items-center justify-between rounded-md px-3 py-2.5 text-base font-medium transition ${
                      isActive
                        ? "bg-[#A52728]/20 text-white border-l-4 border-[#A52728]"
                        : "text-[#F6F2E9] hover:bg-white/10"
                    }`}
                  >
                    <span>{item.label}</span>
                  </Link>
                  {item.children && (
                    <div className="ml-4 flex flex-col border-l border-[#D9B875]/40 pl-3 space-y-1">
                      {item.children.map((sub) => (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          onClick={() => {
                            setMobileOpen(false);
                            setActiveHash("");
                          }}
                          className="flex min-h-[44px] items-center rounded-md px-3 py-2 text-sm text-[#F6F2E9]/85 hover:bg-white/10"
                        >
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </React.Fragment>
              );
            })}
            <div className="pt-3">
              <Link
                href="/compartir"
                onClick={() => {
                  setMobileOpen(false);
                  setActiveHash("");
                }}
                className="flex min-h-[46px] w-full items-center justify-center rounded-md bg-[#A52728] px-5 py-3 text-base font-semibold text-white shadow-md hover:bg-[#8B1E1F]"
              >
                + Compartir mi recuerdo o foto
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
