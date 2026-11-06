"use client";

import React, { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Calendar,
  Camera,
  Check,
  Eye,
  EyeOff,
  Film,
  LayoutDashboard,
  Loader2,
  Lock,
  LogOut,
  MessageSquareQuote,
  Plus,
  Settings,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { processImageForFreeTier } from "@/lib/imageOptimizer";
import type {
  AgendaItem,
  Album,
  MediaAsset,
  MediaCategory,
  ReunionMode,
  SiteSettings,
  StoryItem,
  SubmissionItem,
  VideoItem,
} from "@/types/cms";

export type AdminSection =
  | "dashboard"
  | "galerias"
  | "videos"
  | "historias"
  | "agenda"
  | "configuracion";

interface AdminDataBundle {
  auth: {
    authorized: boolean;
    email: string;
    role: string;
    mode: "supabase" | "demo";
  };
  isDemoMode: boolean;
  settings: SiteSettings;
  albums: Album[];
  media96: MediaAsset[];
  media2026: MediaAsset[];
  videos: VideoItem[];
  stories: StoryItem[];
  submissions: SubmissionItem[];
  agenda: AgendaItem[];
}

const ADMIN_NAV: Array<{
  section: AdminSection;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  {
    section: "dashboard",
    label: "Resumen General",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    section: "galerias",
    label: "Galerías y Álbumes",
    href: "/admin/galerias",
    icon: Camera,
  },
  {
    section: "videos",
    label: "Videos",
    href: "/admin/videos",
    icon: Film,
  },
  {
    section: "historias",
    label: "Moderación y Relatos",
    href: "/admin/historias",
    icon: MessageSquareQuote,
  },
  {
    section: "agenda",
    label: "Programa / Agenda",
    href: "/admin/agenda",
    icon: Calendar,
  },
  {
    section: "configuracion",
    label: "Configuración",
    href: "/admin/configuracion",
    icon: Settings,
  },
];

export function AdminWorkbench({
  activeSection,
}: {
  activeSection: AdminSection;
}) {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [passcode, setPasscode] = useState("cambridge1996-demo");
  const [authError, setAuthError] = useState<string | null>(null);
  const [data, setData] = useState<AdminDataBundle | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Batch upload state for Galerías
  const [uploadYear, setUploadYear] = useState<1996 | 2026>(1996);
  const [uploadCategory, setUploadCategory] =
    useState<MediaCategory>("Compañeros");
  const [uploadingBatch, setUploadingBatch] = useState(false);

  // New Album state
  const [newAlbumTitle, setNewAlbumTitle] = useState("");
  const [newAlbumYear, setNewAlbumYear] = useState<1996 | 2026>(1996);
  const [newAlbumDesc, setNewAlbumDesc] = useState("");

  // New Agenda state
  const [agendaTime, setAgendaTime] = useState("");
  const [agendaTitle, setAgendaTitle] = useState("");
  const [agendaDesc, setAgendaDesc] = useState("");
  const [agendaLoc, setAgendaLoc] = useState("New Cambridge School");

  const showNotice = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const fetchAdminData = useCallback(async () => {
    try {
      const res = await fetch("/api/admin", { cache: "no-store" });
      if (res.status === 401) {
        setAuthorized(false);
        setData(null);
        return;
      }
      if (res.ok) {
        const json = (await res.json()) as AdminDataBundle;
        setData(json);
        setAuthorized(true);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    fetch("/api/admin", { cache: "no-store" })
      .then(async (res) => {
        if (!active) return;
        if (res.status === 401) {
          setAuthorized(false);
          setData(null);
          return;
        }
        if (res.ok) {
          const json = (await res.json()) as AdminDataBundle;
          if (active) {
            setData(json);
            setAuthorized(true);
          }
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    const res = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "login", passcode }),
    });
    const json = await res.json();
    if (!res.ok) {
      setAuthError(json.error || "Acceso denegado.");
      return;
    }
    await fetchAdminData();
  };

  const handleLogout = async () => {
    await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "logout" }),
    });
    setAuthorized(false);
    setData(null);
  };

  const runMutation = async (type: string, payload: unknown, successMsg: string) => {
    const res = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, payload }),
    });
    const json = await res.json();
    if (!res.ok) {
      showNotice(`Error: ${json.error || "Operación fallida"}`);
      return false;
    }
    showNotice(successMsg);
    await fetchAdminData();
    return true;
  };

  const handleBatchUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploadingBatch(true);
    try {
      for (const file of Array.from(files)) {
        const optimized = await processImageForFreeTier(file);
        await fetch("/api/admin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "add_media",
            payload: {
              album_id:
                uploadYear === 1996
                  ? "album-1996-anuario"
                  : "album-2026-reencuentro",
              year: uploadYear,
              category: uploadCategory,
              title: file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "),
              caption: `Fotografía optimizada en WebP (${optimized.previewSizeKb} KB preview / ${optimized.thumbSizeKb} KB miniatura, sin EXIF).`,
              decade_tag: String(uploadYear),
              thumb_url: optimized.thumbDataUrl,
              preview_url: optimized.previewDataUrl,
              width: optimized.width,
              height: optimized.height,
              allow_download: false,
              is_demo_art: false,
              published: true,
              sort_order: 0,
              rotation_deg: 1.4,
            },
          }),
        });
      }
      showNotice(
        `Se procesaron y publicaron ${files.length} fotografía(s) en WebP.`
      );
      await fetchAdminData();
    } catch (err) {
      showNotice(
        err instanceof Error ? err.message : "Error al subir lote de imágenes."
      );
    } finally {
      setUploadingBatch(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-[#142B53]">
        <Loader2 className="h-8 w-8 animate-spin text-[#A52728]" />
        <p className="text-sm font-semibold">
          Cargando panel de administración Promoción 1996...
        </p>
      </div>
    );
  }

  if (!authorized || !data) {
    return (
      <div className="mx-auto max-w-md py-12 px-4">
        <div className="rounded-2xl border border-[#142B53]/20 bg-[#FCFBF7] p-6 sm:p-8 shadow-xl">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#A52728]">
            <Lock className="h-4 w-4" />
            <span>Acceso Protegido · Comité Organizador</span>
          </div>
          <h1 className="mt-2 font-serif text-2xl sm:text-3xl font-bold text-[#142B53]">
            Administración CMS 1996
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-[#111827]/80">
            Ingresa al panel para moderar recuerdos, administrar álbumes 1996 y
            2026, configurar URLs de videos y alternar el modo del sitio (
            <code>PRE</code> / <code>POST</code> / <code>ARCHIVE</code>).
          </p>

          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="adminPasscode"
                className="block text-xs font-bold uppercase tracking-wider text-[#142B53]"
              >
                Clave de Acceso (Modo Demo Local prellenado)
              </label>
              <input
                id="adminPasscode"
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-[#142B53]/30 bg-white px-3.5 py-2.5 text-sm text-[#111827]"
              />
              <p className="mt-1 text-[11px] text-[#111827]/65">
                Clave por defecto en entorno local:{" "}
                <code className="font-mono font-bold text-[#142B53]">
                  cambridge1996-demo
                </code>
              </p>
            </div>

            {authError && (
              <p className="rounded bg-[#A52728]/10 px-3 py-2 text-xs font-semibold text-[#A52728]">
                {authError}
              </p>
            )}

            <button
              type="submit"
              className="w-full min-h-[46px] rounded-md bg-[#142B53] px-5 py-2.5 text-sm font-semibold text-[#F6F2E9] shadow hover:bg-[#1B396E] transition"
            >
              Ingresar al Panel de Administración
            </button>
          </form>
        </div>
      </div>
    );
  }

  const pendingSubmissions = data.submissions.filter(
    (s) => s.status === "pending"
  );

  return (
    <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Status Banner */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#142B53]/15 bg-[#142B53] px-5 py-4 text-[#F6F2E9] shadow">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#D9B875]/20 px-3 py-1 text-xs font-bold text-[#D9B875]">
            <ShieldCheck className="h-4 w-4" />
            Rol: {data.auth.role.toUpperCase()} ({data.auth.email})
          </span>
          <span className="text-xs text-[#F6F2E9]/85">
            {data.isDemoMode
              ? "Modo Estático GitHub + Memoria (Vercel Blob opcional listo)"
              : "Conectado a Vercel Blob + GitHub Static"}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <a
            href="/api/admin/export"
            download
            className="inline-flex items-center gap-1.5 rounded-md bg-[#D9B875] px-3.5 py-1.5 text-xs font-bold text-[#142B53] shadow-xs hover:bg-[#e3c687] transition"
          >
            <span>⬇ Exportar Respaldo JSON + Imágenes</span>
          </a>
          <span className="text-xs font-semibold text-[#D9B875]">
            Estado Sitio: {data.settings.reunion_mode}
          </span>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 rounded-md border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#A52728]"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Salir</span>
          </button>
        </div>
      </div>

      {toast && (
        <div
          role="status"
          className="mb-6 flex items-center justify-between rounded-lg border border-emerald-700 bg-emerald-950 px-4 py-3 text-sm font-medium text-emerald-100 shadow"
        >
          <span>{toast}</span>
          <button type="button" onClick={() => setToast(null)}>
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Sub-navigation Tabs across all 6 Admin paths */}
      <div className="mb-8 flex flex-wrap gap-2 border-b border-[#142B53]/15 pb-4">
        {ADMIN_NAV.map((item) => {
          const Icon = item.icon;
          const active = item.section === activeSection;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`inline-flex min-h-[42px] items-center gap-2 rounded-lg px-4 py-2 text-xs sm:text-sm font-semibold transition ${
                active
                  ? "bg-[#A52728] text-white shadow-xs"
                  : "border border-[#142B53]/15 bg-[#FCFBF7] text-[#142B53] hover:bg-white"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
              {item.section === "historias" && pendingSubmissions.length > 0 && (
                <span className="ml-1 rounded-full bg-[#D9B875] px-2 py-0.5 text-[11px] font-bold text-[#142B53]">
                  {pendingSubmissions.length}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* =====================================================================
          SECTION 1: DASHBOARD OVERVIEW (/admin)
         ===================================================================== */}
      {activeSection === "dashboard" && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-xl border border-[#142B53]/15 bg-[#FCFBF7] p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-[#142B53]/70">
                Modo del Evento
              </p>
              <p className="mt-1 font-serif text-3xl font-bold text-[#142B53]">
                {data.settings.reunion_mode}
              </p>
              <p className="mt-1 text-xs text-[#111827]/70">
                Alterna entre PRE, POST y ARCHIVE sin re-deploy
              </p>
            </div>

            <div className="rounded-xl border border-[#142B53]/15 bg-[#FCFBF7] p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-[#142B53]/70">
                Fotografías 1996 / 2026
              </p>
              <p className="mt-1 font-serif text-3xl font-bold text-[#142B53]">
                {data.media96.length} / {data.media2026.length}
              </p>
              <p className="mt-1 text-xs text-[#111827]/70">
                Optimización WebP en cliente activa
              </p>
            </div>

            <div className="rounded-xl border border-[#142B53]/15 bg-[#FCFBF7] p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-[#142B53]/70">
                En Cola de Moderación
              </p>
              <p className="mt-1 font-serif text-3xl font-bold text-[#A52728]">
                {pendingSubmissions.length}
              </p>
              <p className="mt-1 text-xs text-[#111827]/70">
                Envíos privados pendientes de revisión
              </p>
            </div>

            <div className="rounded-xl border border-[#142B53]/15 bg-[#FCFBF7] p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-[#142B53]/70">
                Programa 19 Dic 2026
              </p>
              <p className="mt-1 font-serif text-3xl font-bold text-[#142B53]">
                {data.agenda.length} bloques
              </p>
              <p className="mt-1 text-xs text-[#111827]/70">
                1:30 p. m. a 5:00 p. m. en el colegio
              </p>
            </div>
          </div>

          {/* Quick Reunion Mode Switcher */}
          <div className="rounded-2xl border border-[#142B53]/15 bg-[#FCFBF7] p-6">
            <h2 className="font-serif text-xl font-bold text-[#142B53]">
              Cambio Rápido de Fase del Evento (PRE / POST / ARCHIVE)
            </h2>
            <p className="mt-1 text-sm text-[#111827]/80">
              Cambia instantáneamente el comportamiento de Galería 2026 y la
              portada sin necesidad de volver a desplegar en Vercel:
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              {(["PRE", "POST", "ARCHIVE"] as ReunionMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() =>
                    runMutation(
                      "set_reunion_mode",
                      { reunion_mode: mode },
                      `Modo del sitio actualizado a ${mode}`
                    )
                  }
                  className={`min-h-[44px] rounded-lg px-5 py-2.5 text-sm font-bold transition ${
                    data.settings.reunion_mode === mode
                      ? "bg-[#A52728] text-white shadow"
                      : "border border-[#142B53]/25 bg-white text-[#142B53] hover:bg-[#142B53] hover:text-white"
                  }`}
                >
                  Modo {mode}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          SECTION 2: GALERÍAS Y ÁLBUMES (/admin/galerias)
         ===================================================================== */}
      {activeSection === "galerias" && (
        <div className="space-y-8">
          {/* Batch WebP Uploader */}
          <div className="rounded-2xl border border-[#142B53]/15 bg-[#FCFBF7] p-6">
            <h2 className="font-serif text-xl font-bold text-[#142B53]">
              Carga por Lotes con Optimización WebP (Preview 1600px + Thumb 480px)
            </h2>
            <p className="mt-1 text-sm text-[#111827]/80">
              Sube múltiples fotografías. El navegador genera automáticamente
              las versiones livianas WebP y limpia metadatos EXIF para proteger
              el plan gratuito de Supabase.
            </p>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
              <div>
                <label className="block text-xs font-bold uppercase text-[#142B53]">
                  Galería Destino
                </label>
                <select
                  value={uploadYear}
                  onChange={(e) =>
                    setUploadYear(Number(e.target.value) as 1996 | 2026)
                  }
                  className="mt-1 w-full rounded-lg border border-[#142B53]/25 bg-white px-3 py-2 text-sm"
                >
                  <option value={1996}>Galería 1996</option>
                  <option value={2026}>Galería 2026</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#142B53]">
                  Categoría
                </label>
                <select
                  value={uploadCategory}
                  onChange={(e) =>
                    setUploadCategory(e.target.value as MediaCategory)
                  }
                  className="mt-1 w-full rounded-lg border border-[#142B53]/25 bg-white px-3 py-2 text-sm"
                >
                  <option value="Anuario">Anuario</option>
                  <option value="Compañeros">Compañeros</option>
                  <option value="Profesores">Profesores</option>
                  <option value="Actividades">Actividades</option>
                  <option value="Reencuentro">Reencuentro</option>
                </select>
              </div>

              <div>
                <label className="inline-flex min-h-[42px] w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#A52728] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#8B1E1F]">
                  {uploadingBatch ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Comprimiendo lote...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      <span>Subir Fotos Múltiples</span>
                    </>
                  )}
                  <input
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleBatchUpload}
                    className="sr-only"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Create Album Form */}
          <div className="rounded-2xl border border-[#142B53]/15 bg-[#FCFBF7] p-6">
            <h3 className="font-serif text-lg font-bold text-[#142B53]">
              Crear Nuevo Álbum
            </h3>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-[#142B53]">
                  Título del Álbum
                </label>
                <input
                  type="text"
                  value={newAlbumTitle}
                  onChange={(e) => setNewAlbumTitle(e.target.value)}
                  placeholder="Ej. Excursión Promoción 1996"
                  className="mt-1 w-full rounded-lg border border-[#142B53]/25 bg-white px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#142B53]">
                  Año
                </label>
                <select
                  value={newAlbumYear}
                  onChange={(e) =>
                    setNewAlbumYear(Number(e.target.value) as 1996 | 2026)
                  }
                  className="mt-1 w-full rounded-lg border border-[#142B53]/25 bg-white px-3 py-2 text-sm"
                >
                  <option value={1996}>1996</option>
                  <option value={2026}>2026</option>
                </select>
              </div>
              <button
                type="button"
                onClick={async () => {
                  if (!newAlbumTitle.trim()) return;
                  await runMutation(
                    "save_album",
                    {
                      title: newAlbumTitle,
                      year: newAlbumYear,
                      description:
                        newAlbumDesc || "Álbum creado desde el panel Admin.",
                    },
                    "Álbum creado correctamente."
                  );
                  setNewAlbumTitle("");
                  setNewAlbumDesc("");
                }}
                className="inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-lg bg-[#142B53] px-4 py-2 text-sm font-semibold text-white"
              >
                <Plus className="h-4 w-4" />
                <span>Crear Álbum</span>
              </button>
            </div>
          </div>

          {/* Media Assets List with Publish / Hide Toggles */}
          <div className="rounded-2xl border border-[#142B53]/15 bg-[#FCFBF7] p-6">
            <h3 className="font-serif text-lg font-bold text-[#142B53] mb-4">
              Fotografías Registradas ({data.media96.length + data.media2026.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...data.media96, ...data.media2026].map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 rounded-xl border border-[#142B53]/15 bg-white p-3"
                >
                  <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded bg-[#142B53]/10">
                    <Image
                      src={item.thumb_url}
                      alt={item.title}
                      fill
                      unoptimized={item.thumb_url.startsWith("data:")}
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-[#142B53]">
                      {item.title}
                    </p>
                    <p className="text-xs text-[#111827]/70">
                      {item.year} · {item.category}
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        runMutation(
                          "toggle_media",
                          { id: item.id, published: !item.published },
                          item.published
                            ? "Fotografía ocultada del sitio público"
                            : "Fotografía publicada"
                        )
                      }
                      className={`mt-1.5 inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-semibold ${
                        item.published
                          ? "bg-emerald-900/10 text-emerald-800"
                          : "bg-amber-900/15 text-amber-900"
                      }`}
                    >
                      {item.published ? (
                        <>
                          <Eye className="h-3 w-3" /> Publicada
                        </>
                      ) : (
                        <>
                          <EyeOff className="h-3 w-3" /> Oculta
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          SECTION 3: VIDEOS (/admin/videos)
         ===================================================================== */}
      {activeSection === "videos" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {data.videos.map((video) => (
            <VideoAdminEditor
              key={video.id}
              video={video}
              onSave={(payload) =>
                runMutation(
                  "update_video",
                  payload,
                  `Video «${video.title}» actualizado.`
                )
              }
            />
          ))}
        </div>
      )}

      {/* =====================================================================
          SECTION 4: MODERACIÓN E HISTORIAS (/admin/historias)
         ===================================================================== */}
      {activeSection === "historias" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-[#142B53]/15 bg-[#FCFBF7] p-6">
            <h2 className="font-serif text-xl font-bold text-[#142B53]">
              Bandeja Privada de Moderación (`submissions`)
            </h2>
            <p className="mt-1 text-sm text-[#111827]/80">
              Revisa las contribuciones enviadas desde <code>/compartir</code>.
              Al aprobarlas pasan automáticamente a las galerías o al muro de
              recuerdos.
            </p>

            <div className="mt-6 space-y-4">
              {data.submissions.map((sub) => (
                <div
                  key={sub.id}
                  className="rounded-xl border border-[#142B53]/15 bg-white p-5 shadow-2xs"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="rounded bg-[#142B53]/10 px-2.5 py-0.5 text-xs font-bold text-[#142B53]">
                        {sub.submission_type.toUpperCase()} · {sub.year_suggestion}
                      </span>
                      <h3 className="mt-1 font-serif text-lg font-bold text-[#142B53]">
                        {sub.title}
                      </h3>
                      <p className="text-xs text-[#111827]/70">
                        Enviado por: <strong>{sub.submitter_name}</strong> (
                        {sub.submitter_graduation_info})
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${
                        sub.status === "approved"
                          ? "bg-emerald-900/10 text-emerald-800"
                          : sub.status === "rejected"
                          ? "bg-red-900/10 text-red-800"
                          : "bg-amber-100 text-amber-900"
                      }`}
                    >
                      {sub.status}
                    </span>
                  </div>

                  <p className="mt-3 text-sm text-[#111827]/85">
                    {sub.message_content}
                  </p>

                  {sub.status === "pending" && (
                    <div className="mt-4 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          runMutation(
                            "moderate_submission",
                            { id: sub.id, status: "approved" },
                            "Envío aprobado y publicado."
                          )
                        }
                        className="inline-flex min-h-[38px] items-center gap-1.5 rounded-md bg-emerald-800 px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-900"
                      >
                        <Check className="h-4 w-4" />
                        <span>Aprobar y Publicar</span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          runMutation(
                            "moderate_submission",
                            { id: sub.id, status: "rejected" },
                            "Envío rechazado / ocultado."
                          )
                        }
                        className="inline-flex min-h-[38px] items-center gap-1.5 rounded-md bg-[#A52728] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#8B1E1F]"
                      >
                        <X className="h-4 w-4" />
                        <span>Rechazar</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          SECTION 5: AGENDA (/admin/agenda)
         ===================================================================== */}
      {activeSection === "agenda" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-[#142B53]/15 bg-[#FCFBF7] p-6">
            <h2 className="font-serif text-xl font-bold text-[#142B53]">
              Programa del Sábado 19 de Diciembre de 2026 (1:30 p. m. – 5:00 p. m.)
            </h2>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
              <div>
                <label className="block text-xs font-bold text-[#142B53]">
                  Hora
                </label>
                <input
                  type="text"
                  value={agendaTime}
                  onChange={(e) => setAgendaTime(e.target.value)}
                  placeholder="Ej. 3:45 p. m."
                  className="mt-1 w-full rounded-lg border border-[#142B53]/25 bg-white px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#142B53]">
                  Actividad
                </label>
                <input
                  type="text"
                  value={agendaTitle}
                  onChange={(e) => setAgendaTitle(e.target.value)}
                  placeholder="Título del bloque"
                  className="mt-1 w-full rounded-lg border border-[#142B53]/25 bg-white px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#142B53]">
                  Ubicación en el colegio
                </label>
                <input
                  type="text"
                  value={agendaLoc}
                  onChange={(e) => setAgendaLoc(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[#142B53]/25 bg-white px-3 py-2 text-sm"
                />
              </div>
              <button
                type="button"
                onClick={async () => {
                  if (!agendaTime.trim() || !agendaTitle.trim()) return;
                  await runMutation(
                    "save_agenda",
                    {
                      time_label: agendaTime,
                      title: agendaTitle,
                      description:
                        agendaDesc ||
                        "Actividad oficial del programa conmemorativo.",
                      location_detail: agendaLoc,
                    },
                    "Bloque agregado al programa."
                  );
                  setAgendaTime("");
                  setAgendaTitle("");
                  setAgendaDesc("");
                }}
                className="inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-lg bg-[#A52728] px-4 py-2 text-sm font-semibold text-white"
              >
                <Plus className="h-4 w-4" />
                <span>Agregar Bloque</span>
              </button>
            </div>

            <div className="mt-6 divide-y divide-[#142B53]/10">
              {data.agenda.map((item) => (
                <div
                  key={item.id}
                  className="py-3.5 flex items-center justify-between gap-4"
                >
                  <div>
                    <span className="font-display text-sm font-bold text-[#A52728]">
                      {item.time_label}
                    </span>{" "}
                    —{" "}
                    <strong className="font-serif text-[#142B53]">
                      {item.title}
                    </strong>
                    <p className="text-xs text-[#111827]/75">
                      {item.description}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      runMutation(
                        "delete_agenda",
                        { id: item.id },
                        "Bloque eliminado."
                      )
                    }
                    aria-label={`Eliminar ${item.title}`}
                    className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-[#A52728]/30 text-[#A52728] hover:bg-[#A52728] hover:text-white"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          SECTION 6: CONFIGURACIÓN (/admin/configuracion)
         ===================================================================== */}
      {activeSection === "configuracion" && (
        <SettingsAdminForm
          settings={data.settings}
          onSave={(payload) =>
            runMutation(
              "update_settings",
              payload,
              "Configuración general actualizada."
            )
          }
        />
      )}
    </div>
  );
}

function VideoAdminEditor({
  video,
  onSave,
}: {
  video: VideoItem;
  onSave: (payload: Partial<VideoItem> & { slug: string }) => Promise<boolean>;
}) {
  const [title, setTitle] = useState(video.title);
  const [subtitle, setSubtitle] = useState(video.subtitle);
  const [description, setDescription] = useState(video.description);
  const [embedUrl, setEmbedUrl] = useState(video.embed_url || "");
  const [durationLabel, setDurationLabel] = useState(video.duration_label);
  const [isAvailable, setIsAvailable] = useState(video.is_available);

  return (
    <div className="rounded-2xl border border-[#142B53]/15 bg-[#FCFBF7] p-6 space-y-4">
      <div className="flex items-center justify-between">
        <span className="rounded bg-[#142B53] px-2.5 py-0.5 text-xs font-semibold text-[#D9B875]">
          /videos/{video.slug}
        </span>
        <span className="text-xs font-semibold text-[#142B53]">
          Solo proveedores HTTPS verificados (YouTube / Vimeo)
        </span>
      </div>

      <div>
        <label className="block text-xs font-bold text-[#142B53]">Título</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 w-full rounded-lg border border-[#142B53]/25 bg-white px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-[#142B53]">
          Subtítulo
        </label>
        <input
          type="text"
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          className="mt-1 w-full rounded-lg border border-[#142B53]/25 bg-white px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-[#142B53]">
          URL Embed Externa (YouTube o Vimeo)
        </label>
        <input
          type="url"
          value={embedUrl}
          onChange={(e) => setEmbedUrl(e.target.value)}
          placeholder="https://www.youtube-nocookie.com/embed/..."
          className="mt-1 w-full rounded-lg border border-[#142B53]/25 bg-white px-3 py-2 text-sm"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-[#142B53]">
            Etiqueta de Duración / Estado
          </label>
          <input
            type="text"
            value={durationLabel}
            onChange={(e) => setDurationLabel(e.target.value)}
            className="mt-1 w-full rounded-lg border border-[#142B53]/25 bg-white px-3 py-2 text-sm"
          />
        </div>
        <div className="flex items-end pb-2">
          <label className="flex items-center gap-2 text-xs font-bold text-[#142B53] cursor-pointer">
            <input
              type="checkbox"
              checked={isAvailable}
              onChange={(e) => setIsAvailable(e.target.checked)}
              className="h-4 w-4"
            />
            <span>Habilitar reproductor</span>
          </label>
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-[#142B53]">
          Descripción
        </label>
        <textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1 w-full rounded-lg border border-[#142B53]/25 bg-white px-3 py-2 text-sm"
        />
      </div>

      <button
        type="button"
        onClick={() =>
          onSave({
            slug: video.slug,
            title,
            subtitle,
            description,
            embed_url: embedUrl || null,
            duration_label: durationLabel,
            is_available: isAvailable,
          })
        }
        className="w-full min-h-[42px] rounded-lg bg-[#A52728] px-4 py-2 text-sm font-semibold text-white hover:bg-[#8B1E1F]"
      >
        Guardar cambios de video
      </button>
    </div>
  );
}

function SettingsAdminForm({
  settings,
  onSave,
}: {
  settings: SiteSettings;
  onSave: (payload: Partial<SiteSettings>) => Promise<boolean>;
}) {
  const [reunionMode, setReunionMode] = useState<ReunionMode>(
    settings.reunion_mode
  );
  const [heroTitle, setHeroTitle] = useState(settings.hero_title);
  const [heroSubtitle, setHeroSubtitle] = useState(settings.hero_subtitle);
  const [centralQuote, setCentralQuote] = useState(settings.central_quote);
  const [eventDateLabel, setEventDateLabel] = useState(
    settings.event_date_label
  );
  const [eventTimeRange, setEventTimeRange] = useState(
    settings.event_time_range
  );
  const [menuSummary, setMenuSummary] = useState(settings.menu_summary);
  const [menuChefPending, setMenuChefPending] = useState(
    settings.menu_chef_pending
  );
  const [tallyUrl, setTallyUrl] = useState(settings.tally_url);
  const [tallyVerified, setTallyVerified] = useState(settings.tally_verified);

  return (
    <div className="rounded-2xl border border-[#142B53]/15 bg-[#FCFBF7] p-6 sm:p-8 space-y-5">
      <div className="flex items-center justify-between border-b border-[#142B53]/10 pb-4">
        <div>
          <h2 className="font-serif text-xl font-bold text-[#142B53]">
            Configuración General del Sitio (`site_settings`)
          </h2>
          <p className="text-xs text-[#111827]/75">
            Administra los textos editoriales, el estado del menú francés y la
            visibilidad del formulario Tally.
          </p>
        </div>
        <Sparkles className="h-5 w-5 text-[#A52728]" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-bold text-[#142B53]">
            Modo del Sitio
          </label>
          <select
            value={reunionMode}
            onChange={(e) => setReunionMode(e.target.value as ReunionMode)}
            className="mt-1 w-full rounded-lg border border-[#142B53]/25 bg-white px-3 py-2 text-sm"
          >
            <option value="PRE">PRE (Previo al 19 Dic 2026)</option>
            <option value="POST">POST (Cobertura del Reencuentro)</option>
            <option value="ARCHIVE">ARCHIVE (Archivo Histórico)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#142B53]">
            Fecha Oficial
          </label>
          <input
            type="text"
            value={eventDateLabel}
            onChange={(e) => setEventDateLabel(e.target.value)}
            className="mt-1 w-full rounded-lg border border-[#142B53]/25 bg-white px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#142B53]">
            Horario en el Colegio
          </label>
          <input
            type="text"
            value={eventTimeRange}
            onChange={(e) => setEventTimeRange(e.target.value)}
            className="mt-1 w-full rounded-lg border border-[#142B53]/25 bg-white px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-[#142B53]">
            Titular Principal Hero
          </label>
          <input
            type="text"
            value={heroTitle}
            onChange={(e) => setHeroTitle(e.target.value)}
            className="mt-1 w-full rounded-lg border border-[#142B53]/25 bg-white px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-[#142B53]">
            Bajada Hero
          </label>
          <input
            type="text"
            value={heroSubtitle}
            onChange={(e) => setHeroSubtitle(e.target.value)}
            className="mt-1 w-full rounded-lg border border-[#142B53]/25 bg-white px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-[#142B53]">
          Frase Central Conmemorativa
        </label>
        <input
          type="text"
          value={centralQuote}
          onChange={(e) => setCentralQuote(e.target.value)}
          className="mt-1 w-full rounded-lg border border-[#142B53]/25 bg-white px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-[#142B53]">
          Detalle de Menú Francés
        </label>
        <textarea
          rows={2}
          value={menuSummary}
          onChange={(e) => setMenuSummary(e.target.value)}
          className="mt-1 w-full rounded-lg border border-[#142B53]/25 bg-white px-3 py-2 text-sm"
        />
        <label className="mt-2 inline-flex items-center gap-2 text-xs font-semibold text-[#142B53] cursor-pointer">
          <input
            type="checkbox"
            checked={menuChefPending}
            onChange={(e) => setMenuChefPending(e.target.checked)}
            className="h-4 w-4"
          />
          <span>Mostrar etiqueta «Validación del chef pendiente»</span>
        </label>
      </div>

      <div className="rounded-xl border border-[#142B53]/15 bg-[#F6F2E9] p-4 space-y-2">
        <label className="block text-xs font-bold text-[#142B53]">
          Enlace Externo Tally (`https://tally.so/r/NpoEVO`)
        </label>
        <input
          type="url"
          value={tallyUrl}
          onChange={(e) => setTallyUrl(e.target.value)}
          className="w-full rounded-lg border border-[#142B53]/25 bg-white px-3 py-2 text-sm"
        />
        <label className="inline-flex items-center gap-2 text-xs font-semibold text-[#142B53] cursor-pointer">
          <input
            type="checkbox"
            checked={tallyVerified}
            onChange={(e) => setTallyVerified(e.target.checked)}
            className="h-4 w-4"
          />
          <span>
            Habilitar enlace públicamente (activar SOLO cuando los datos del
            formulario Tally hayan sido verificados)
          </span>
        </label>
      </div>

      <button
        type="button"
        onClick={() =>
          onSave({
            reunion_mode: reunionMode,
            hero_title: heroTitle,
            hero_subtitle: heroSubtitle,
            central_quote: centralQuote,
            event_date_label: eventDateLabel,
            event_time_range: eventTimeRange,
            menu_summary: menuSummary,
            menu_chef_pending: menuChefPending,
            tally_url: tallyUrl,
            tally_verified: tallyVerified,
          })
        }
        className="inline-flex min-h-[44px] items-center justify-center rounded-lg bg-[#A52728] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#8B1E1F]"
      >
        Guardar Configuración General
      </button>
    </div>
  );
}
