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
    .max(150, "El nombre no puede superar 150 caracteres."),
  submitter_graduation_info: z
    .string()
    .trim()
    .min(2, "Indica tu grupo o referencia de la Promoción 1996.")
    .max(200),
  title: z
    .string()
    .trim()
    .min(2, "Agrega un título breve para tu recuerdo o fotografía.")
    .max(200, "El título no debe exceder 200 caracteres."),
  message_content: z
    .string()
    .trim()
    .min(3, "Agrega una breve descripción o mensaje (mínimo 3 caracteres).")
    .max(3000, "El relato no debe superar 3000 caracteres."),
  category_suggestion: z.enum([
    "Anuario",
    "Compañeros",
    "Profesores",
    "Actividades",
    "Reencuentro",
    "Reencuentro 2026",
    "Reunión 2016",
    "Reunión 2024",
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
  hero_title: z
    .string()
    .trim()
    .min(2, "El titular principal es muy corto.")
    .max(500, "El titular principal no debe superar 500 caracteres."),
  hero_subtitle: z
    .string()
    .trim()
    .min(2, "La bajada del hero es muy corta.")
    .max(600, "La bajada no debe superar 600 caracteres."),
  central_quote: z
    .string()
    .trim()
    .min(2, "La frase central es muy corta.")
    .max(800, "La frase central no debe superar 800 caracteres."),
  event_date_label: z
    .string()
    .trim()
    .min(2, "La fecha oficial es muy corta.")
    .max(300, "La fecha oficial no debe superar 300 caracteres."),
  event_time_range: z
    .string()
    .trim()
    .min(2, "El horario es muy corto.")
    .max(600, "El horario no debe superar 600 caracteres."),
  event_location_name: z.string().trim().min(2).max(300).optional(),
  event_location_address: z.string().trim().min(2).max(400).optional(),
  menu_summary: z
    .string()
    .trim()
    .min(2, "El detalle del menú es muy corto.")
    .max(2500, "El detalle del menú no debe superar 2500 caracteres."),
  menu_chef_pending: z.boolean(),
  tally_url: z
    .string()
    .trim()
    .max(500)
    .refine((val) => val === "" || /^https?:\/\/.+/i.test(val), {
      message: "Ingresa un enlace válido que inicie con https://",
    }),
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
