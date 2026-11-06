import { z } from "zod";

const ALLOWED_VIDEO_HOSTS = [
  "www.youtube.com",
  "youtube.com",
  "www.youtube-nocookie.com",
  "player.vimeo.com",
  "vimeo.com",
];

export function validateExternalVideoUrl(rawUrl: string | null | undefined): {
  valid: boolean;
  embedUrl: string | null;
  error?: string;
} {
  if (!rawUrl || !rawUrl.trim()) {
    return { valid: true, embedUrl: null };
  }
  try {
    const parsed = new URL(rawUrl.trim());
    if (parsed.protocol !== "https:") {
      return {
        valid: false,
        embedUrl: null,
        error: "La URL del video debe usar HTTPS.",
      };
    }
    if (!ALLOWED_VIDEO_HOSTS.includes(parsed.hostname.toLowerCase())) {
      return {
        valid: false,
        embedUrl: null,
        error:
          "Solo se permiten URLs verificadas de YouTube o Vimeo sin almacenar videos pesados en Vercel.",
      };
    }

    if (
      parsed.hostname.includes("youtube.com") &&
      parsed.pathname === "/watch"
    ) {
      const videoId = parsed.searchParams.get("v");
      if (videoId && /^[a-zA-Z0-9_-]{6,15}$/.test(videoId)) {
        return {
          valid: true,
          embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}`,
        };
      }
    }

    return { valid: true, embedUrl: parsed.toString() };
  } catch {
    return {
      valid: false,
      embedUrl: null,
      error: "Formato de URL de video no válido.",
    };
  }
}

export const submissionSchema = z.object({
  submission_type: z.enum(["story", "photo", "both"]),
  submitter_name: z
    .string()
    .trim()
    .min(2, "Por favor ingresa tu nombre (mínimo 2 caracteres).")
    .max(100, "El nombre no puede superar 100 caracteres."),
  submitter_graduation_info: z
    .string()
    .trim()
    .min(2, "Indica tu grupo o referencia de la Promoción 1996.")
    .max(120),
  title: z
    .string()
    .trim()
    .min(3, "Agrega un título breve para tu recuerdo o fotografía.")
    .max(120, "El título no debe exceder 120 caracteres."),
  message_content: z
    .string()
    .trim()
    .min(10, "Cuéntanos un poco más (mínimo 10 caracteres).")
    .max(1500, "El relato no debe superar 1500 caracteres."),
  category_suggestion: z.enum([
    "Anuario",
    "Compañeros",
    "Profesores",
    "Actividades",
    "Reencuentro",
    "Campus",
    "Recuerdos",
  ]),
  year_suggestion: z.union([z.literal(1996), z.literal(2026)]),
  media_preview_url: z.string().optional(),
  media_thumb_url: z.string().optional(),
  consent_public_display: z.literal(true, {
    message:
      "Debes autorizar expresamente la publicación conmemorativa tras moderación.",
  }),
  consent_privacy_policy: z.literal(true, {
    message: "Debes aceptar el aviso de privacidad y uso de imagen.",
  }),
  allow_download: z.boolean().default(false),
  honeypot: z.string().max(0, "Detección anti-spam activada.").optional(),
});

export const siteSettingsUpdateSchema = z.object({
  reunion_mode: z.enum(["PRE", "POST", "ARCHIVE"]),
  hero_title: z.string().trim().min(5).max(180),
  hero_subtitle: z.string().trim().min(5).max(240),
  central_quote: z.string().trim().min(5).max(260),
  event_date_label: z.string().trim().min(5).max(120),
  event_time_range: z.string().trim().min(5).max(120),
  menu_summary: z.string().trim().min(10).max(500),
  menu_chef_pending: z.boolean(),
  tally_url: z.string().url(),
  tally_verified: z.boolean(),
});

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  ipKey: string,
  maxRequests = 8,
  windowMs = 60_000
): { allowed: boolean; retryAfterSec: number } {
  const now = Date.now();
  const existing = rateLimitMap.get(ipKey);
  if (!existing || existing.resetAt <= now) {
    rateLimitMap.set(ipKey, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSec: 0 };
  }
  if (existing.count >= maxRequests) {
    return {
      allowed: false,
      retryAfterSec: Math.ceil((existing.resetAt - now) / 1000),
    };
  }
  existing.count += 1;
  return { allowed: true, retryAfterSec: 0 };
}
