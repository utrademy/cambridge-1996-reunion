"use client";

import React, { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AlertCircle,
  Calendar,
  Camera,
  Check,
  CheckCircle2,
  ExternalLink,
  Eye,
  EyeOff,
  Film,
  ImageIcon,
  LayoutDashboard,
  Loader2,
  Lock,
  LogOut,
  Maximize2,
  MessageSquareQuote,
  Plus,
  RefreshCw,
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
    mode: string;
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

const CATEGORIES_BY_YEAR: Record<1996 | 2026, MediaCategory[]> = {
  1996: ["Anuario", "Compañeros", "Profesores", "Actividades"],
  2026: ["Reencuentro 2026", "Reunión 2024", "Reunión 2016"],
};

const ALL_MEDIA_CATEGORIES: Array<{
  year: 1996 | 2026;
  category: MediaCategory;
  label: string;
}> = [
  {
    year: 2026,
    category: "Reencuentro 2026",
    label: "Galería 2026 · Reencuentro 2026",
  },
  {
    year: 2026,
    category: "Reunión 2024",
    label: "Galería 2026 · Reunión 2024",
  },
  {
    year: 2026,
    category: "Reunión 2016",
    label: "Galería 2026 · Reunión 2016",
  },
  { year: 1996, category: "Anuario", label: "Galería 1996 · Anuario" },
  { year: 1996, category: "Compañeros", label: "Galería 1996 · Compañeros" },
  { year: 1996, category: "Profesores", label: "Galería 1996 · Profesores" },
  { year: 1996, category: "Actividades", label: "Galería 1996 · Actividades" },
];

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
    section: "historias",
    label: "Aprobación de Fotos y Relatos",
    href: "/admin/historias",
    icon: MessageSquareQuote,
  },
  {
    section: "videos",
    label: "Videos",
    href: "/admin/videos",
    icon: Film,
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
  const [toast, setToast] = useState<{
    message: string;
    variant: "success" | "error";
  } | null>(null);

  // Image preview modal for Admin inspection
  const [previewModal, setPreviewModal] = useState<{
    url: string;
    title: string;
    subtitle?: string;
  } | null>(null);

  // Batch upload state for Galerías
  const [uploadYear, setUploadYear] = useState<1996 | 2026>(2026);
  const [uploadCategory, setUploadCategory] =
    useState<MediaCategory>("Reencuentro 2026");
  const [uploadCustomTitle, setUploadCustomTitle] = useState("");
  const [uploadCustomCaption, setUploadCustomCaption] = useState("");
  const [uploadAllowDownload, setUploadAllowDownload] = useState(true);
  const [uploadingBatch, setUploadingBatch] = useState(false);
  const [mediaFilter, setMediaFilter] = useState<string>("ALL");

  // New Album state
  const [newAlbumTitle, setNewAlbumTitle] = useState("");
  const [newAlbumYear, setNewAlbumYear] = useState<1996 | 2026>(2026);
  const [newAlbumDesc, setNewAlbumDesc] = useState("");

  // New Agenda state
  const [agendaTime, setAgendaTime] = useState("");
  const [agendaTitle, setAgendaTitle] = useState("");
  const [agendaDesc, setAgendaDesc] = useState("");
  const [agendaLoc, setAgendaLoc] = useState("New Cambridge School");

  // New Story state
  const [newStoryAuthor, setNewStoryAuthor] = useState("");
  const [newStoryTitle, setNewStoryTitle] = useState("");
  const [newStoryContent, setNewStoryContent] = useState("");

  // Moderation filter state
  const [subFilter, setSubFilter] = useState<
    "all" | "pending" | "approved" | "rejected"
  >("all");

  const showNotice = (
    message: string,
    variant: "success" | "error" = "success"
  ) => {
    setToast({ message, variant });
    setTimeout(() => setToast(null), 5000);
  };

  const fetchAdminData = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin?t=${Date.now()}`, {
        cache: "no-store",
      });
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
    fetch(`/api/admin?t=${Date.now()}`, { cache: "no-store" })
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

  const runMutation = async (
    type: string,
    payload: unknown,
    successMsg: string
  ) => {
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, payload }),
      });
      const json = await res.json();
      if (!res.ok) {
        showNotice(
          `Error: ${json.error || "No se pudo completar la operación."}`,
          "error"
        );
        return false;
      }
      showNotice(successMsg, "success");
      await fetchAdminData();
      return true;
    } catch (err) {
      showNotice(
        `Error de red: ${err instanceof Error ? err.message : "Fallo al conectar"}`,
        "error"
      );
      return false;
    }
  };

  const handleYearChangeForUpload = (newYear: 1996 | 2026) => {
    setUploadYear(newYear);
    setUploadCategory(
      newYear === 2026 ? "Reencuentro 2026" : "Compañeros"
    );
  };

  const handleBatchUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploadingBatch(true);
    let uploadedCount = 0;
    try {
      const fileArray = Array.from(files);
      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i];
        const optimized = await processImageForFreeTier(file);
        const cleanFileName = file.name
          .replace(/\.[^.]+$/, "")
          .replace(/[-_]+/g, " ")
          .trim();

        const itemTitle =
          uploadCustomTitle.trim()
            ? fileArray.length > 1
              ? `${uploadCustomTitle.trim()} (${i + 1})`
              : uploadCustomTitle.trim()
            : cleanFileName || `Fotografía ${uploadCategory}`;

        const itemCaption =
          uploadCustomCaption.trim() ||
          `Recuerdo fotográfico · ${uploadCategory} (${uploadYear})`;

        const albumId =
          uploadCategory === "Reunión 2016"
            ? "album-2016-reunion"
            : uploadCategory === "Reunión 2024"
              ? "album-2024-reunion"
              : uploadYear === 2026
                ? "album-2026-reencuentro"
                : "album-1996-anuario";

        const res = await fetch("/api/admin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "add_media",
            payload: {
              album_id: albumId,
              year: uploadYear,
              category: uploadCategory,
              title: itemTitle,
              caption: itemCaption,
              decade_tag: `${uploadYear} · ${uploadCategory}`,
              thumb_url: optimized.thumbDataUrl,
              preview_url: optimized.previewDataUrl,
              width: optimized.width,
              height: optimized.height,
              allow_download: uploadAllowDownload,
              is_demo_art: false,
              published: true,
              sort_order: 0,
              rotation_deg: i % 2 === 0 ? 1.4 : -1.4,
            },
          }),
        });
        if (res.ok) {
          uploadedCount += 1;
        }
      }
      setUploadCustomTitle("");
      setUploadCustomCaption("");
      e.target.value = "";
      showNotice(
        `¡Listo! Se subieron y publicaron ${uploadedCount} fotografía(s) en «${uploadCategory}» (Galería ${uploadYear}).`,
        "success"
      );
      await fetchAdminData();
    } catch (err) {
      showNotice(
        err instanceof Error
          ? err.message
          : "Error al subir las fotografías.",
        "error"
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
            Ingresa al panel para aprobar fotografías, administrar las galerías
            1996 y 2026, configurar enlaces de videos y habilitar la encuesta de
            Tally.
          </p>

          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="adminPasscode"
                className="block text-xs font-bold uppercase tracking-wider text-[#142B53]"
              >
                Clave de Acceso
              </label>
              <input
                id="adminPasscode"
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-[#142B53]/30 bg-white px-3.5 py-2.5 text-sm text-[#111827]"
              />
              <p className="mt-1 text-[11px] text-[#111827]/65">
                Clave por defecto:{" "}
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
  const allMedia = [...data.media2026, ...data.media96];
  const realUploadedMediaCount = allMedia.filter((m) => !m.is_demo_art).length;

  const filteredAdminMedia = allMedia.filter((item) => {
    if (mediaFilter === "ALL") return true;
    if (mediaFilter === "YEAR_1996") return item.year === 1996;
    if (mediaFilter === "YEAR_2026") return item.year === 2026;
    if (mediaFilter === "REAL_ONLY") return !item.is_demo_art;
    if (mediaFilter === "DEMO_ONLY") return Boolean(item.is_demo_art);
    return item.category === mediaFilter;
  });

  const filteredSubmissions = data.submissions.filter((sub) => {
    if (subFilter === "all") return true;
    return sub.status === subFilter;
  });

  return (
    <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Status Banner */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#142B53]/15 bg-[#142B53] px-5 py-4 text-[#F6F2E9] shadow">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#D9B875]/20 px-3 py-1 text-xs font-bold text-[#D9B875]">
            <ShieldCheck className="h-4 w-4" />
            Rol: {data.auth.role.toUpperCase()}
          </span>
          <span className="text-xs text-[#F6F2E9]/90">
            Sincronización en vivo activa con el sitio público
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => fetchAdminData()}
            className="inline-flex items-center gap-1.5 rounded-md border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/20 transition"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refrescar</span>
          </button>
          <a
            href="/api/admin/export"
            download
            className="inline-flex items-center gap-1.5 rounded-md bg-[#D9B875] px-3.5 py-1.5 text-xs font-bold text-[#142B53] shadow-xs hover:bg-[#e3c687] transition"
          >
            <span>⬇ Exportar Respaldo JSON</span>
          </a>
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

      {/* Distinct Color-Coded Toast Notification (Red for Error, Green for Success) */}
      {toast && (
        <div
          role="alert"
          className={`mb-6 flex items-center justify-between rounded-xl border px-4 py-3.5 text-sm font-semibold shadow-md ${
            toast.variant === "error"
              ? "border-red-600 bg-red-950 text-red-100"
              : "border-emerald-600 bg-emerald-950 text-emerald-100"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {toast.variant === "error" ? (
              <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
            ) : (
              <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="ml-4 rounded p-1 hover:bg-white/10"
          >
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
              {item.section === "historias" &&
                pendingSubmissions.length > 0 && (
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
          {pendingSubmissions.length > 0 && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border-2 border-[#A52728]/35 bg-[#A52728]/5 p-5 shadow-xs">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#A52728] px-3 py-0.5 text-xs font-bold text-white">
                  {pendingSubmissions.length} pendiente(s) por aprobar
                </span>
                <h2 className="mt-2 font-serif text-xl font-bold text-[#142B53]">
                  Tienes fotografías o recuerdos esperando aprobación
                </h2>
                <p className="text-sm text-[#111827]/80">
                  Revisa la miniatura de cada fotografía enviada y apruébala para
                  que se publique inmediatamente en las galerías del sitio.
                </p>
              </div>
              <Link
                href="/admin/historias"
                className="inline-flex min-h-[44px] shrink-0 items-center justify-center gap-2 rounded-lg bg-[#A52728] px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-[#8B1E1F] transition"
              >
                <span>Ir a Aprobar Fotos ({pendingSubmissions.length})</span>
              </Link>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-xl border border-[#142B53]/15 bg-[#FCFBF7] p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-[#142B53]/70">
                Modo del Evento
              </p>
              <p className="mt-1 font-serif text-3xl font-bold text-[#142B53]">
                {data.settings.reunion_mode}
              </p>
              <p className="mt-1 text-xs text-[#111827]/70">
                Alterna entre PRE, POST y ARCHIVE
              </p>
            </div>

            <div className="rounded-xl border border-[#142B53]/15 bg-[#FCFBF7] p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-[#142B53]/70">
                Fotos Galería 1996 / 2026
              </p>
              <p className="mt-1 font-serif text-3xl font-bold text-[#142B53]">
                {data.media96.length} / {data.media2026.length}
              </p>
              <p className="mt-1 text-xs text-emerald-800 font-semibold">
                {realUploadedMediaCount} foto(s) nuevas subidas/aprobadas
              </p>
            </div>

            <div className="rounded-xl border border-[#142B53]/15 bg-[#FCFBF7] p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-[#142B53]/70">
                En Cola de Moderación
              </p>
              <p className="mt-1 font-serif text-3xl font-bold text-[#A52728]">
                {pendingSubmissions.length}
              </p>
              <Link
                href="/admin/historias"
                className="mt-1 inline-block text-xs font-bold text-[#A52728] underline"
              >
                Ver bandeja de aprobación →
              </Link>
            </div>

            <div className="rounded-xl border border-[#142B53]/15 bg-[#FCFBF7] p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-[#142B53]/70">
                Encuesta Tally
              </p>
              <p className="mt-1 font-serif text-xl font-bold text-[#142B53]">
                {data.settings.tally_verified
                  ? "Habilitada en Web"
                  : "Oculta (Borrador)"}
              </p>
              <Link
                href="/admin/configuracion"
                className="mt-1 inline-block text-xs font-bold text-[#142B53] underline"
              >
                Configurar enlace Tally →
              </Link>
            </div>
          </div>

          {/* Quick Reunion Mode Switcher */}
          <div className="rounded-2xl border border-[#142B53]/15 bg-[#FCFBF7] p-6">
            <h2 className="font-serif text-xl font-bold text-[#142B53]">
              Cambio Rápido de Fase del Evento (PRE / POST / ARCHIVE)
            </h2>
            <p className="mt-1 text-sm text-[#111827]/80">
              Cambia instantáneamente el estado de Galería 2026 y la portada:
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
          <div className="rounded-2xl border border-[#142B53]/15 bg-[#FCFBF7] p-6 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="font-serif text-xl font-bold text-[#142B53]">
                  Subir y Publicar Fotografías Directamente
                </h2>
                <p className="mt-1 text-sm text-[#111827]/80">
                  Selecciona la galería y la pestaña destino (por ejemplo:{" "}
                  <strong>Reencuentro 2026</strong>, <strong>Reunión 2024</strong>{" "}
                  o <strong>Reunión 2016</strong>). Las fotos se optimizan en
                  WebP y se publican de inmediato en el sitio web.
                </p>
              </div>
              <div className="flex gap-2">
                <Link
                  href="/galeria/1996"
                  target="_blank"
                  className="inline-flex items-center gap-1 rounded-md border border-[#142B53]/25 bg-white px-3 py-1.5 text-xs font-semibold text-[#142B53] hover:bg-[#142B53] hover:text-white transition"
                >
                  <span>Ver Galería 1996</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
                <Link
                  href="/galeria/2026"
                  target="_blank"
                  className="inline-flex items-center gap-1 rounded-md border border-[#142B53]/25 bg-white px-3 py-1.5 text-xs font-semibold text-[#142B53] hover:bg-[#142B53] hover:text-white transition"
                >
                  <span>Ver Galería 2026</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-[#142B53]">
                  1. Galería Destino
                </label>
                <select
                  value={uploadYear}
                  onChange={(e) =>
                    handleYearChangeForUpload(
                      Number(e.target.value) as 1996 | 2026
                    )
                  }
                  className="mt-1 w-full rounded-lg border border-[#142B53]/25 bg-white px-3 py-2.5 text-sm font-semibold text-[#142B53]"
                >
                  <option value={2026}>
                    Galería 2026 (Encuentros 2016 / 2024 / 2026)
                  </option>
                  <option value={1996}>
                    Galería 1996 (Anuario, Compañeros, Profesores)
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#142B53]">
                  2. Pestaña / Categoría
                </label>
                <select
                  value={uploadCategory}
                  onChange={(e) =>
                    setUploadCategory(e.target.value as MediaCategory)
                  }
                  className="mt-1 w-full rounded-lg border border-[#142B53]/25 bg-white px-3 py-2.5 text-sm font-semibold text-[#142B53]"
                >
                  {CATEGORIES_BY_YEAR[uploadYear].map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#142B53]">
                  3. Título (Opcional)
                </label>
                <input
                  type="text"
                  value={uploadCustomTitle}
                  onChange={(e) => setUploadCustomTitle(e.target.value)}
                  placeholder="Ej. Encuentro de compañeros"
                  className="mt-1 w-full rounded-lg border border-[#142B53]/25 bg-white px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#142B53]">
                  4. Descripción breve (Opcional)
                </label>
                <input
                  type="text"
                  value={uploadCustomCaption}
                  onChange={(e) => setUploadCustomCaption(e.target.value)}
                  placeholder="Ej. Celebrando nuestra amistad"
                  className="mt-1 w-full rounded-lg border border-[#142B53]/25 bg-white px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-[#142B53]/10 pt-4">
              <label className="inline-flex items-center gap-2 text-xs font-semibold text-[#142B53] cursor-pointer">
                <input
                  type="checkbox"
                  checked={uploadAllowDownload}
                  onChange={(e) => setUploadAllowDownload(e.target.checked)}
                  className="h-4 w-4 rounded"
                />
                <span>
                  Permitir descarga de estas fotografías en el visor público
                </span>
              </label>

              <label className="inline-flex min-h-[44px] cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#A52728] px-6 py-2.5 text-sm font-semibold text-white shadow hover:bg-[#8B1E1F] transition">
                {uploadingBatch ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Procesando y publicando...</span>
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    <span>
                      Seleccionar y Subir Foto(s) a «{uploadCategory}»
                    </span>
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

          {/* Create & Manage Albums */}
          <div className="rounded-2xl border border-[#142B53]/15 bg-[#FCFBF7] p-6">
            <h3 className="font-serif text-lg font-bold text-[#142B53]">
              Álbumes Conmemorativos ({data.albums.length})
            </h3>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
              <div className="sm:col-span-4">
                <label className="block text-xs font-bold text-[#142B53]">
                  Título del Nuevo Álbum
                </label>
                <input
                  type="text"
                  value={newAlbumTitle}
                  onChange={(e) => setNewAlbumTitle(e.target.value)}
                  placeholder="Ej. Reunión Especial Promoción 1996"
                  className="mt-1 w-full rounded-lg border border-[#142B53]/25 bg-white px-3 py-2 text-sm"
                />
              </div>
              <div className="sm:col-span-4">
                <label className="block text-xs font-bold text-[#142B53]">
                  Descripción
                </label>
                <input
                  type="text"
                  value={newAlbumDesc}
                  onChange={(e) => setNewAlbumDesc(e.target.value)}
                  placeholder="Descripción breve del álbum"
                  className="mt-1 w-full rounded-lg border border-[#142B53]/25 bg-white px-3 py-2 text-sm"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-[#142B53]">
                  Galería
                </label>
                <select
                  value={newAlbumYear}
                  onChange={(e) =>
                    setNewAlbumYear(Number(e.target.value) as 1996 | 2026)
                  }
                  className="mt-1 w-full rounded-lg border border-[#142B53]/25 bg-white px-3 py-2 text-sm"
                >
                  <option value={2026}>Galería 2026</option>
                  <option value={1996}>Galería 1996</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <button
                  type="button"
                  onClick={async () => {
                    if (!newAlbumTitle.trim()) {
                      showNotice(
                        "Por favor escribe un título para el álbum.",
                        "error"
                      );
                      return;
                    }
                    await runMutation(
                      "save_album",
                      {
                        title: newAlbumTitle.trim(),
                        year: newAlbumYear,
                        description:
                          newAlbumDesc.trim() ||
                          "Álbum creado desde el panel Admin.",
                      },
                      "Álbum creado correctamente."
                    );
                    setNewAlbumTitle("");
                    setNewAlbumDesc("");
                  }}
                  className="w-full inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-lg bg-[#142B53] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1B396E]"
                >
                  <Plus className="h-4 w-4" />
                  <span>Crear Álbum</span>
                </button>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {data.albums.map((album) => (
                <div
                  key={album.id}
                  className="flex items-start justify-between gap-2 rounded-xl border border-[#142B53]/15 bg-white p-3.5"
                >
                  <div>
                    <span className="rounded bg-[#142B53]/10 px-2 py-0.5 text-[10px] font-bold uppercase text-[#142B53]">
                      Galería {album.year}
                    </span>
                    <p className="mt-1 font-serif text-sm font-bold text-[#142B53]">
                      {album.title}
                    </p>
                    <p className="mt-0.5 text-xs text-[#111827]/70 line-clamp-2">
                      {album.description}
                    </p>
                  </div>
                  {!album.id.startsWith("album-1996-") &&
                    !album.id.startsWith("album-2026-") &&
                    !album.id.startsWith("album-2024-") &&
                    !album.id.startsWith("album-2016-") && (
                      <button
                        type="button"
                        onClick={() =>
                          runMutation(
                            "delete_album",
                            { id: album.id },
                            "Álbum eliminado."
                          )
                        }
                        title="Eliminar álbum"
                        className="rounded p-1.5 text-[#A52728] hover:bg-[#A52728]/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                </div>
              ))}
            </div>
          </div>

          {/* Media Assets List with Filters, Preview, Category Re-assignment, Publish Toggle & Delete */}
          <div className="rounded-2xl border border-[#142B53]/15 bg-[#FCFBF7] p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
              <div>
                <h3 className="font-serif text-xl font-bold text-[#142B53]">
                  Fotografías Registradas ({filteredAdminMedia.length} de{" "}
                  {allMedia.length})
                </h3>
                <p className="text-xs text-[#111827]/75 mt-0.5">
                  Haz clic en cualquier miniatura para verla en grande. Puedes
                  cambiar su pestaña/categoría, ocultarla o eliminarla.
                </p>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: "ALL", label: "Todas" },
                  { id: "REAL_ONLY", label: "Subidas / Aprobadas" },
                  { id: "Reencuentro 2026", label: "Reencuentro 2026" },
                  { id: "Reunión 2024", label: "Reunión 2024" },
                  { id: "Reunión 2016", label: "Reunión 2016" },
                  { id: "YEAR_1996", label: "Galería 1996" },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setMediaFilter(f.id)}
                    className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                      mediaFilter === f.id
                        ? "bg-[#142B53] text-white"
                        : "border border-[#142B53]/20 bg-white text-[#142B53] hover:bg-[#142B53]/5"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {filteredAdminMedia.length === 0 ? (
              <div className="rounded-xl border border-[#142B53]/15 bg-white p-8 text-center">
                <p className="font-serif text-base font-bold text-[#142B53]">
                  No hay fotografías en este filtro todavía.
                </p>
                <p className="mt-1 text-xs text-[#111827]/70">
                  Usa el formulario de arriba para subir nuevas fotografías o
                  aprueba envíos pendientes en la pestaña de Aprobación.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAdminMedia.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col justify-between rounded-xl border border-[#142B53]/15 bg-white p-3.5 shadow-2xs"
                  >
                    <div className="flex items-start gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          setPreviewModal({
                            url: item.preview_url || item.thumb_url,
                            title: item.title,
                            subtitle: `${item.year} · ${item.category} — ${item.caption}`,
                          })
                        }
                        className="group relative h-20 w-24 shrink-0 overflow-hidden rounded-lg border border-[#142B53]/15 bg-[#142B53]/10 cursor-pointer"
                        title="Haz clic para ver foto completa"
                      >
                        <Image
                          src={item.thumb_url}
                          alt={item.title}
                          fill
                          unoptimized
                          className="object-cover transition-transform group-hover:scale-105"
                        />
                        <span className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                          <Maximize2 className="h-4 w-4 text-white" />
                        </span>
                      </button>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span
                            className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${
                              item.is_demo_art
                                ? "bg-amber-100 text-amber-900"
                                : "bg-emerald-100 text-emerald-900"
                            }`}
                          >
                            {item.is_demo_art ? "Demo 1996" : "Foto Real"}
                          </span>
                          <span className="rounded bg-[#142B53]/10 px-1.5 py-0.5 text-[10px] font-bold text-[#142B53]">
                            {item.year} · {item.category}
                          </span>
                        </div>
                        <p className="mt-1 truncate text-sm font-bold text-[#142B53]">
                          {item.title}
                        </p>
                        <p className="text-xs text-[#111827]/70 line-clamp-2">
                          {item.caption}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[#142B53]/10 pt-2.5">
                      <select
                        aria-label={`Cambiar categoría de ${item.title}`}
                        value={`${item.year}:${item.category}`}
                        onChange={(e) => {
                          const [yrStr, catStr] = e.target.value.split(":");
                          runMutation(
                            "update_media",
                            {
                              id: item.id,
                              year: Number(yrStr) as 1996 | 2026,
                              category: catStr as MediaCategory,
                            },
                            `Fotografía movida a «${catStr}» (Galería ${yrStr}).`
                          );
                        }}
                        className="rounded border border-[#142B53]/20 bg-[#FCFBF7] px-2 py-1 text-[11px] font-semibold text-[#142B53]"
                      >
                        {ALL_MEDIA_CATEGORIES.map((opt) => (
                          <option
                            key={`${opt.year}:${opt.category}`}
                            value={`${opt.year}:${opt.category}`}
                          >
                            {opt.label}
                          </option>
                        ))}
                      </select>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            runMutation(
                              "toggle_media",
                              { id: item.id, published: !item.published },
                              item.published
                                ? "Fotografía ocultada del sitio público."
                                : "Fotografía publicada en la galería."
                            )
                          }
                          className={`inline-flex items-center gap-1 rounded px-2.5 py-1 text-xs font-semibold ${
                            item.published
                              ? "bg-emerald-900/10 text-emerald-800 hover:bg-emerald-900/20"
                              : "bg-amber-900/15 text-amber-900 hover:bg-amber-900/25"
                          }`}
                        >
                          {item.published ? (
                            <>
                              <Eye className="h-3.5 w-3.5" /> Publicada
                            </>
                          ) : (
                            <>
                              <EyeOff className="h-3.5 w-3.5" /> Oculta
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            runMutation(
                              "delete_media",
                              { id: item.id },
                              "Fotografía eliminada permanentemente."
                            )
                          }
                          title="Eliminar fotografía"
                          className="inline-flex h-7 w-7 items-center justify-center rounded border border-[#A52728]/30 text-[#A52728] hover:bg-[#A52728] hover:text-white transition"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
                  `Video «${video.title}» actualizado correctamente.`
                )
              }
            />
          ))}
        </div>
      )}

      {/* =====================================================================
          SECTION 4: APROBACIÓN DE FOTOS Y RELATOS (/admin/historias)
         ===================================================================== */}
      {activeSection === "historias" && (
        <div className="space-y-8">
          <div className="rounded-2xl border border-[#142B53]/15 bg-[#FCFBF7] p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#142B53]/10 pb-4">
              <div>
                <h2 className="font-serif text-2xl font-bold text-[#142B53]">
                  Bandeja de Aprobación de Fotografías y Recuerdos
                </h2>
                <p className="mt-1 text-sm text-[#111827]/80">
                  Aquí puedes ver la <strong>miniatura real</strong> y ampliar
                  cada foto enviada desde <code>/compartir</code>, elegir en qué
                  pestaña se publicará y aprobarla con un clic.
                </p>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {[
                  {
                    id: "all",
                    label: `Todos (${data.submissions.length})`,
                  },
                  {
                    id: "pending",
                    label: `Pendientes (${pendingSubmissions.length})`,
                  },
                  {
                    id: "approved",
                    label: `Aprobados (${
                      data.submissions.filter((s) => s.status === "approved")
                        .length
                    })`,
                  },
                  {
                    id: "rejected",
                    label: `Rechazados (${
                      data.submissions.filter((s) => s.status === "rejected")
                        .length
                    })`,
                  },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() =>
                      setSubFilter(
                        tab.id as "all" | "pending" | "approved" | "rejected"
                      )
                    }
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                      subFilter === tab.id
                        ? "bg-[#A52728] text-white"
                        : "border border-[#142B53]/20 bg-white text-[#142B53] hover:bg-[#142B53]/5"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 space-y-5">
              {filteredSubmissions.length === 0 ? (
                <div className="rounded-xl border border-[#142B53]/15 bg-white p-8 text-center">
                  <p className="font-serif text-lg font-bold text-[#142B53]">
                    No hay envíos en esta categoría.
                  </p>
                </div>
              ) : (
                filteredSubmissions.map((sub) => (
                  <SubmissionModerationCard
                    key={sub.id}
                    submission={sub}
                    onPreviewImage={(url, title, subtitle) =>
                      setPreviewModal({ url, title, subtitle })
                    }
                    onApprove={(options) =>
                      runMutation(
                        "moderate_submission",
                        {
                          id: sub.id,
                          status: "approved",
                          ...options,
                        },
                        `¡Aprobado y publicado! Ya está visible en el sitio web (${options.category}).`
                      )
                    }
                    onReject={() =>
                      runMutation(
                        "moderate_submission",
                        { id: sub.id, status: "rejected" },
                        "Envío marcado como rechazado / oculto."
                      )
                    }
                    onDelete={() =>
                      runMutation(
                        "delete_submission",
                        { id: sub.id },
                        "Envío eliminado de la bandeja."
                      )
                    }
                  />
                ))
              )}
            </div>
          </div>

          {/* Stories Management Section */}
          <div className="rounded-2xl border border-[#142B53]/15 bg-[#FCFBF7] p-6">
            <h3 className="font-serif text-xl font-bold text-[#142B53]">
              Relatos y Mensajes Publicados en el Muro ({data.stories.length})
            </h3>
            <p className="mt-1 text-xs sm:text-sm text-[#111827]/75">
              Administra los mensajes visibles en la sección de Recuerdos o
              agrega uno nuevo directamente:
            </p>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-12 gap-3 items-end rounded-xl border border-[#142B53]/10 bg-white p-4">
              <div className="sm:col-span-3">
                <label className="block text-xs font-bold text-[#142B53]">
                  Autor (Compañero)
                </label>
                <input
                  type="text"
                  value={newStoryAuthor}
                  onChange={(e) => setNewStoryAuthor(e.target.value)}
                  placeholder="Ej. Carolina M."
                  className="mt-1 w-full rounded-lg border border-[#142B53]/25 bg-white px-3 py-2 text-sm"
                />
              </div>
              <div className="sm:col-span-3">
                <label className="block text-xs font-bold text-[#142B53]">
                  Título breve
                </label>
                <input
                  type="text"
                  value={newStoryTitle}
                  onChange={(e) => setNewStoryTitle(e.target.value)}
                  placeholder="Ej. Inolvidable promoción"
                  className="mt-1 w-full rounded-lg border border-[#142B53]/25 bg-white px-3 py-2 text-sm"
                />
              </div>
              <div className="sm:col-span-4">
                <label className="block text-xs font-bold text-[#142B53]">
                  Mensaje / Recuerdo
                </label>
                <input
                  type="text"
                  value={newStoryContent}
                  onChange={(e) => setNewStoryContent(e.target.value)}
                  placeholder="Escribe el mensaje conmemorativo..."
                  className="mt-1 w-full rounded-lg border border-[#142B53]/25 bg-white px-3 py-2 text-sm"
                />
              </div>
              <div className="sm:col-span-2">
                <button
                  type="button"
                  onClick={async () => {
                    if (
                      !newStoryAuthor.trim() ||
                      !newStoryTitle.trim() ||
                      !newStoryContent.trim()
                    ) {
                      showNotice(
                        "Completa autor, título y mensaje para publicar el relato.",
                        "error"
                      );
                      return;
                    }
                    await runMutation(
                      "save_story",
                      {
                        author_display: newStoryAuthor,
                        title: newStoryTitle,
                        content: newStoryContent,
                      },
                      "Relato publicado en el muro de recuerdos."
                    );
                    setNewStoryAuthor("");
                    setNewStoryTitle("");
                    setNewStoryContent("");
                  }}
                  className="w-full inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-lg bg-[#142B53] px-3 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-[#1B396E]"
                >
                  <Plus className="h-4 w-4" />
                  <span>Publicar</span>
                </button>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.stories.map((story) => (
                <div
                  key={story.id}
                  className="flex flex-col justify-between rounded-xl border border-[#142B53]/15 bg-white p-4"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-[#A52728]">
                        {story.author_display} ({story.year_tag})
                      </span>
                      <span
                        className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                          story.published
                            ? "bg-emerald-100 text-emerald-900"
                            : "bg-amber-100 text-amber-900"
                        }`}
                      >
                        {story.published ? "Publicado" : "Oculto"}
                      </span>
                    </div>
                    <h4 className="mt-1 font-serif text-base font-bold text-[#142B53]">
                      {story.title}
                    </h4>
                    <p className="mt-1 text-xs text-[#111827]/80 line-clamp-3">
                      {story.content}
                    </p>
                  </div>
                  <div className="mt-3 flex items-center justify-end gap-2 border-t border-[#142B53]/10 pt-2.5">
                    <button
                      type="button"
                      onClick={() =>
                        runMutation(
                          "toggle_story",
                          { id: story.id, published: !story.published },
                          story.published
                            ? "Relato ocultado."
                            : "Relato publicado."
                        )
                      }
                      className="rounded border border-[#142B53]/20 px-2.5 py-1 text-xs font-semibold text-[#142B53] hover:bg-[#142B53]/5"
                    >
                      {story.published ? "Ocultar" : "Mostrar"}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        runMutation(
                          "delete_story",
                          { id: story.id },
                          "Relato eliminado."
                        )
                      }
                      className="rounded border border-[#A52728]/30 px-2.5 py-1 text-xs font-semibold text-[#A52728] hover:bg-[#A52728] hover:text-white"
                    >
                      Eliminar
                    </button>
                  </div>
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
              Programa del Sábado 19 de Diciembre de 2026
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
                  Ubicación
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
                  if (!agendaTime.trim() || !agendaTitle.trim()) {
                    showNotice(
                      "Ingresa la hora y el nombre de la actividad.",
                      "error"
                    );
                    return;
                  }
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
              "¡Configuración guardada y publicada exitosamente en el sitio web!"
            )
          }
        />
      )}

      {/* Fullscreen Image Preview Modal for Admin */}
      {previewModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4 backdrop-blur-xs"
          onClick={() => setPreviewModal(null)}
        >
          <div
            className="relative max-w-4xl w-full rounded-2xl border border-white/20 bg-[#0E1E38] p-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-4 pb-3 border-b border-white/15">
              <div>
                <h3 className="font-serif text-lg font-bold text-white">
                  {previewModal.title}
                </h3>
                {previewModal.subtitle && (
                  <p className="text-xs text-[#F6F2E9]/80">
                    {previewModal.subtitle}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setPreviewModal(null)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white hover:bg-[#A52728]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="relative mt-3 aspect-[4/3] w-full max-h-[72vh] overflow-hidden rounded-lg bg-black/50">
              <Image
                src={previewModal.url}
                alt={previewModal.title}
                fill
                unoptimized
                className="object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SubmissionModerationCard({
  submission,
  onPreviewImage,
  onApprove,
  onReject,
  onDelete,
}: {
  submission: SubmissionItem;
  onPreviewImage: (url: string, title: string, subtitle?: string) => void;
  onApprove: (options: {
    year: 1996 | 2026;
    category: MediaCategory;
    title: string;
    message_content: string;
  }) => Promise<boolean>;
  onReject: () => Promise<boolean>;
  onDelete: () => Promise<boolean>;
}) {
  const initialCat =
    submission.category_suggestion === "Recuerdos"
      ? submission.year_suggestion === 2026
        ? "Reencuentro 2026"
        : "Compañeros"
      : submission.category_suggestion === "Reencuentro"
        ? "Reencuentro 2026"
        : submission.category_suggestion;

  const initialYear: 1996 | 2026 =
    initialCat === "Reencuentro 2026" ||
    initialCat === "Reunión 2016" ||
    initialCat === "Reunión 2024"
      ? 2026
      : submission.year_suggestion;

  const [selectedDest, setSelectedDest] = useState<string>(
    `${initialYear}:${initialCat}`
  );
  const [editTitle, setEditTitle] = useState(submission.title);
  const [editMessage, setEditMessage] = useState(submission.message_content);

  const imageUrl = submission.media_preview_url || submission.media_thumb_url;
  const thumbUrl = submission.media_thumb_url || submission.media_preview_url;

  const handleApproveClick = async () => {
    const [yrStr, catStr] = selectedDest.split(":");
    await onApprove({
      year: Number(yrStr) as 1996 | 2026,
      category: catStr as MediaCategory,
      title: editTitle,
      message_content: editMessage,
    });
  };

  return (
    <div className="rounded-xl border border-[#142B53]/20 bg-white p-5 shadow-xs">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Photo Thumbnail Preview (Never blind!) */}
        <div className="lg:col-span-4 flex flex-col">
          {thumbUrl && imageUrl ? (
            <div className="space-y-2">
              <button
                type="button"
                onClick={() =>
                  onPreviewImage(
                    imageUrl,
                    editTitle,
                    `Enviado por ${submission.submitter_name} (${submission.submitter_graduation_info})`
                  )
                }
                className="group relative aspect-[4/3] w-full overflow-hidden rounded-xl border-2 border-[#142B53]/20 bg-[#142B53]/5 shadow-sm cursor-pointer"
              >
                <Image
                  src={thumbUrl}
                  alt={submission.title}
                  fill
                  unoptimized
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end justify-between p-3">
                  <span className="rounded bg-black/75 px-2.5 py-1 text-[11px] font-bold text-white">
                    🔍 Clic para ampliar foto
                  </span>
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#A52728] text-white shadow">
                    <Maximize2 className="h-4 w-4" />
                  </span>
                </div>
              </button>
              <button
                type="button"
                onClick={() =>
                  onPreviewImage(
                    imageUrl,
                    editTitle,
                    `Enviado por ${submission.submitter_name}`
                  )
                }
                className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#142B53]/25 bg-[#FCFBF7] px-3 py-1.5 text-xs font-bold text-[#142B53] hover:bg-[#142B53] hover:text-white transition"
              >
                <Maximize2 className="h-3.5 w-3.5" />
                <span>Ver Fotografía en Tamaño Completo</span>
              </button>
            </div>
          ) : (
            <div className="flex aspect-[4/3] w-full flex-col items-center justify-center rounded-xl border border-dashed border-[#142B53]/25 bg-[#F6F2E9]/60 p-4 text-center">
              <ImageIcon className="h-8 w-8 text-[#142B53]/45 mb-2" />
              <p className="text-xs font-bold text-[#142B53]">
                Solo Relato / Mensaje Escrito
              </p>
              <p className="text-[11px] text-[#111827]/65 mt-0.5">
                Este envío no adjuntó archivo fotográfico
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Details, Editable Title/Destination & Approve/Reject Actions */}
        <div className="lg:col-span-8 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded bg-[#142B53] px-2.5 py-0.5 text-xs font-bold text-[#D9B875]">
                  {submission.submission_type === "both"
                    ? "FOTO + RELATO"
                    : submission.submission_type === "photo"
                      ? "SOLO FOTO"
                      : "SOLO RELATO"}
                </span>
                <span className="text-xs text-[#111827]/75">
                  Enviado por: <strong>{submission.submitter_name}</strong> (
                  {submission.submitter_graduation_info})
                </span>
              </div>

              <span
                className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${
                  submission.status === "approved"
                    ? "bg-emerald-100 text-emerald-900"
                    : submission.status === "rejected"
                      ? "bg-red-100 text-red-900"
                      : "bg-amber-100 text-amber-900"
                }`}
              >
                {submission.status === "approved"
                  ? "✓ Aprobado y Publicado"
                  : submission.status === "rejected"
                    ? "✕ Rechazado"
                    : "⏳ Pendiente de Aprobación"}
              </span>
            </div>

            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase text-[#142B53]/80">
                  Título de la foto / recuerdo
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[#142B53]/25 bg-[#FCFBF7] px-3 py-1.5 text-sm font-semibold text-[#142B53]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-[#A52728]">
                  Galería y Pestaña donde se publicará
                </label>
                <select
                  value={selectedDest}
                  onChange={(e) => setSelectedDest(e.target.value)}
                  className="mt-1 w-full rounded-lg border-2 border-[#A52728]/40 bg-white px-3 py-1.5 text-sm font-bold text-[#142B53]"
                >
                  {ALL_MEDIA_CATEGORIES.map((opt) => (
                    <option
                      key={`${opt.year}:${opt.category}`}
                      value={`${opt.year}:${opt.category}`}
                    >
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-3">
              <label className="block text-[11px] font-bold uppercase text-[#142B53]/80">
                Mensaje / Pie de foto
              </label>
              <textarea
                rows={2}
                value={editMessage}
                onChange={(e) => setEditMessage(e.target.value)}
                className="mt-1 w-full rounded-lg border border-[#142B53]/25 bg-[#FCFBF7] px-3 py-1.5 text-sm text-[#111827]"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#142B53]/10 pt-3">
            <div className="flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={handleApproveClick}
                className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg bg-emerald-800 px-4 py-2 text-xs sm:text-sm font-bold text-white shadow hover:bg-emerald-900 transition"
              >
                <Check className="h-4 w-4" />
                <span>
                  {submission.status === "approved"
                    ? "Actualizar Publicación"
                    : "Aprobar y Publicar Ahora"}
                </span>
              </button>

              {submission.status !== "rejected" && (
                <button
                  type="button"
                  onClick={onReject}
                  className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg bg-[#A52728] px-4 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-[#8B1E1F] transition"
                >
                  <X className="h-4 w-4" />
                  <span>Rechazar / Ocultar</span>
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={onDelete}
              className="inline-flex items-center gap-1 rounded-lg border border-[#A52728]/30 px-3 py-1.5 text-xs font-semibold text-[#A52728] hover:bg-[#A52728] hover:text-white transition"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Eliminar</span>
            </button>
          </div>
        </div>
      </div>
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

  useEffect(() => {
    setTitle(video.title);
    setSubtitle(video.subtitle);
    setDescription(video.description);
    setEmbedUrl(video.embed_url || "");
    setDurationLabel(video.duration_label);
    setIsAvailable(video.is_available);
  }, [video]);

  return (
    <div className="rounded-2xl border border-[#142B53]/15 bg-[#FCFBF7] p-6 space-y-4">
      <div className="flex items-center justify-between">
        <span className="rounded bg-[#142B53] px-2.5 py-0.5 text-xs font-semibold text-[#D9B875]">
          /videos/{video.slug}
        </span>
        <span className="text-xs font-semibold text-[#142B53]">
          Proveedores HTTPS (YouTube / Vimeo)
        </span>
      </div>

      {/* Preview of current HD thumbnail */}
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl border border-[#142B53]/20 bg-[#0E1E38]">
        <Image
          src={video.poster_url}
          alt={video.title}
          fill
          unoptimized
          className="object-cover"
        />
        {!isAvailable && (
          <div className="absolute top-3 left-3 rounded-md bg-[#A52728] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow">
            Cinta Activa: PRÓXIMAMENTE
          </div>
        )}
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
          URL de YouTube o Vimeo (dejar vacío mientras esté «Próximamente»)
        </label>
        <input
          type="url"
          value={embedUrl}
          onChange={(e) => setEmbedUrl(e.target.value)}
          placeholder="https://www.youtube.com/watch?v=..."
          className="mt-1 w-full rounded-lg border border-[#142B53]/25 bg-white px-3 py-2 text-sm"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-[#142B53]">
            Etiqueta de Estado / Duración
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
            <span>Habilitar reproductor público</span>
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
  const [eventLocationName, setEventLocationName] = useState(
    settings.event_location_name
  );
  const [eventLocationAddress, setEventLocationAddress] = useState(
    settings.event_location_address
  );
  const [menuSummary, setMenuSummary] = useState(settings.menu_summary);
  const [menuChefPending, setMenuChefPending] = useState(
    settings.menu_chef_pending
  );
  const [tallyUrl, setTallyUrl] = useState(settings.tally_url);
  const [tallyVerified, setTallyVerified] = useState(settings.tally_verified);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setReunionMode(settings.reunion_mode);
    setHeroTitle(settings.hero_title);
    setHeroSubtitle(settings.hero_subtitle);
    setCentralQuote(settings.central_quote);
    setEventDateLabel(settings.event_date_label);
    setEventTimeRange(settings.event_time_range);
    setEventLocationName(settings.event_location_name);
    setEventLocationAddress(settings.event_location_address);
    setMenuSummary(settings.menu_summary);
    setMenuChefPending(settings.menu_chef_pending);
    setTallyUrl(settings.tally_url);
    setTallyVerified(settings.tally_verified);
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({
        reunion_mode: reunionMode,
        hero_title: heroTitle,
        hero_subtitle: heroSubtitle,
        central_quote: centralQuote,
        event_date_label: eventDateLabel,
        event_time_range: eventTimeRange,
        event_location_name: eventLocationName,
        event_location_address: eventLocationAddress,
        menu_summary: menuSummary,
        menu_chef_pending: menuChefPending,
        tally_url: tallyUrl,
        tally_verified: tallyVerified,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-[#142B53]/15 bg-[#FCFBF7] p-6 sm:p-8 space-y-5 shadow-xs"
    >
      <div className="flex items-center justify-between border-b border-[#142B53]/10 pb-4">
        <div>
          <h2 className="font-serif text-xl font-bold text-[#142B53]">
            Configuración General del Sitio (`site_settings`)
          </h2>
          <p className="text-xs text-[#111827]/75">
            Administra los textos editoriales, el estado del menú y la
            visibilidad pública del formulario de confirmación en Tally.
          </p>
        </div>
        <Sparkles className="h-5 w-5 text-[#A52728]" />
      </div>

      {/* Highlighted Tally Survey Card at top for fast access */}
      <div className="rounded-xl border-2 border-[#142B53]/20 bg-[#F6F2E9] p-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label className="block text-sm font-bold text-[#142B53]">
            Formulario / Encuesta Externa Tally
          </label>
          <span
            className={`rounded-full px-3 py-0.5 text-xs font-bold ${
              tallyVerified
                ? "bg-emerald-800 text-white"
                : "bg-amber-200 text-amber-950"
            }`}
          >
            {tallyVerified
              ? "✓ Visible en el sitio público"
              : "Oculto del sitio público"}
          </span>
        </div>

        <input
          type="url"
          value={tallyUrl}
          onChange={(e) => setTallyUrl(e.target.value)}
          placeholder="https://tally.so/r/NpoEVO"
          className="w-full rounded-lg border border-[#142B53]/25 bg-white px-3.5 py-2.5 text-sm"
        />

        <label className="inline-flex items-center gap-2.5 text-sm font-bold text-[#142B53] cursor-pointer">
          <input
            type="checkbox"
            checked={tallyVerified}
            onChange={(e) => setTallyVerified(e.target.checked)}
            className="h-4 w-4 rounded accent-[#A52728]"
          />
          <span>
            Habilitar enlace de encuesta Tally públicamente en la página
            principal
          </span>
        </label>
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
            Horario Oficial
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
            Lugar del Encuentro
          </label>
          <input
            type="text"
            value={eventLocationName}
            onChange={(e) => setEventLocationName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-[#142B53]/25 bg-white px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-[#142B53]">
            Dirección
          </label>
          <input
            type="text"
            value={eventLocationAddress}
            onChange={(e) => setEventLocationAddress(e.target.value)}
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
          Detalle de Gastronomía y Celebración
        </label>
        <textarea
          rows={3}
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

      <button
        type="submit"
        disabled={saving}
        className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-lg bg-[#A52728] px-7 py-2.5 text-sm font-bold text-white shadow hover:bg-[#8B1E1F] disabled:opacity-60 transition"
      >
        {saving ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Guardando cambios...</span>
          </>
        ) : (
          <>
            <Check className="h-4 w-4" />
            <span>Guardar Configuración General</span>
          </>
        )}
      </button>
    </form>
  );
}
