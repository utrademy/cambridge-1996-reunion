import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { contentRepository } from "@/lib/contentRepository";
import {
  checkRateLimit,
  siteSettingsUpdateSchema,
  submissionSchema,
  validateExternalVideoUrl,
} from "@/lib/validation";
import { isAuthorizedAdminRequest } from "./auth/route";

export const dynamic = "force-dynamic";

function revalidateAllPublicPages() {
  try {
    revalidatePath("/", "layout");
    revalidatePath("/");
    revalidatePath("/galeria/1996");
    revalidatePath("/galeria/2026");
    revalidatePath("/historias");
    revalidatePath("/videos");
    revalidatePath("/videos/historia");
    revalidatePath("/videos/reencuentro");
  } catch {
    // Ignore revalidate errors outside request context
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const scope = url.searchParams.get("scope");

  // Public read-only endpoint for live hydration on public pages
  if (scope === "public") {
    const [
      settings,
      albums,
      media96,
      media2026,
      videos,
      stories,
      agenda,
      milestones,
    ] = await Promise.all([
      contentRepository.getSiteSettings(),
      contentRepository.getAlbums(false),
      contentRepository.getMediaByYear(1996, false),
      contentRepository.getMediaByYear(2026, false),
      contentRepository.getVideos(false),
      contentRepository.getStories(false),
      contentRepository.getAgenda(false),
      contentRepository.getHistoryMilestones(),
    ]);

    return NextResponse.json(
      {
        settings,
        albums,
        media96,
        media2026,
        videos,
        stories,
        agenda,
        milestones,
        timestamp: Date.now(),
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        },
      }
    );
  }

  const auth = await isAuthorizedAdminRequest();
  if (!auth.authorized) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const [
    settings,
    albums,
    media96,
    media2026,
    videos,
    stories,
    submissions,
    agenda,
  ] = await Promise.all([
    contentRepository.getSiteSettings(),
    contentRepository.getAlbums(true),
    contentRepository.getMediaByYear(1996, true),
    contentRepository.getMediaByYear(2026, true),
    contentRepository.getVideos(true),
    contentRepository.getStories(true),
    contentRepository.getSubmissions(),
    contentRepository.getAgenda(true),
  ]);

  return NextResponse.json(
    {
      auth,
      isDemoMode: contentRepository.isDemoMode(),
      settings,
      albums,
      media96,
      media2026,
      videos,
      stories,
      submissions,
      agenda,
    },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      },
    }
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, payload } = body;

    // Public submission action (shares exact same serverless lambda instance as admin & public reads)
    if (type === "public_submission") {
      const forwardedFor = request.headers.get("x-forwarded-for") || "local";
      const ipKey = forwardedFor.split(",")[0].trim() || "local";
      const limit = checkRateLimit(`sub:${ipKey}`, 10, 60_000);

      if (!limit.allowed) {
        return NextResponse.json(
          {
            error: `Demasiados envíos recientes. Intenta nuevamente en ${limit.retryAfterSec} segundos.`,
          },
          { status: 429 }
        );
      }

      const parsed = submissionSchema.safeParse(payload);
      if (!parsed.success) {
        const firstIssue = parsed.error.issues[0];
        return NextResponse.json(
          { error: firstIssue?.message || "Datos del formulario inválidos." },
          { status: 400 }
        );
      }

      const data = parsed.data;
      if (data.honeypot && data.honeypot.length > 0) {
        return NextResponse.json({ ok: true }, { status: 200 });
      }

      const created = await contentRepository.createSubmission({
        submission_type: data.submission_type,
        submitter_name: data.submitter_name,
        submitter_graduation_info: data.submitter_graduation_info,
        title: data.title,
        message_content: data.message_content,
        category_suggestion: data.category_suggestion,
        year_suggestion: data.year_suggestion,
        media_preview_url: data.media_preview_url,
        media_thumb_url: data.media_thumb_url,
        consent_public_display: data.consent_public_display,
        consent_privacy_policy: data.consent_privacy_policy,
        allow_download: data.allow_download,
      });

      revalidateAllPublicPages();
      return NextResponse.json(
        {
          ok: true,
          submissionId: created.id,
          message:
            "Tu recuerdo fue recibido en la cola privada de moderación del comité organizador.",
        },
        { status: 201 }
      );
    }

    // All other mutations require Admin authorization
    const auth = await isAuthorizedAdminRequest();
    if (!auth.authorized) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    if (type === "update_settings") {
      const parsed = siteSettingsUpdateSchema.safeParse(payload);
      if (!parsed.success) {
        return NextResponse.json(
          {
            error:
              parsed.error.issues[0]?.message ||
              "Por favor verifica los campos de configuración.",
          },
          { status: 400 }
        );
      }
      const updated = await contentRepository.updateSiteSettings(parsed.data);
      revalidateAllPublicPages();
      return NextResponse.json({ ok: true, settings: updated });
    }

    if (type === "set_reunion_mode") {
      if (!["PRE", "POST", "ARCHIVE"].includes(payload?.reunion_mode)) {
        return NextResponse.json({ error: "Modo inválido" }, { status: 400 });
      }
      const updated = await contentRepository.updateSiteSettings({
        reunion_mode: payload.reunion_mode,
      });
      revalidateAllPublicPages();
      return NextResponse.json({ ok: true, settings: updated });
    }

    if (type === "save_album") {
      const album = await contentRepository.saveAlbum(payload);
      revalidateAllPublicPages();
      return NextResponse.json({ ok: true, album });
    }

    if (type === "delete_album") {
      await contentRepository.deleteAlbum(payload.id);
      revalidateAllPublicPages();
      return NextResponse.json({ ok: true });
    }

    if (type === "add_media") {
      const asset = await contentRepository.addMediaAsset(payload);
      revalidateAllPublicPages();
      return NextResponse.json({ ok: true, asset });
    }

    if (type === "update_media") {
      const asset = await contentRepository.updateMediaAsset(
        payload.id,
        payload
      );
      revalidateAllPublicPages();
      return NextResponse.json({ ok: true, asset });
    }

    if (type === "delete_media") {
      await contentRepository.deleteMediaAsset(payload.id);
      revalidateAllPublicPages();
      return NextResponse.json({ ok: true });
    }

    if (type === "toggle_media") {
      await contentRepository.toggleMediaPublished(
        payload.id,
        Boolean(payload.published)
      );
      revalidateAllPublicPages();
      return NextResponse.json({ ok: true });
    }

    if (type === "update_video") {
      const urlCheck = validateExternalVideoUrl(payload.embed_url);
      if (!urlCheck.valid) {
        return NextResponse.json({ error: urlCheck.error }, { status: 400 });
      }
      const video = await contentRepository.updateVideo(payload.slug, {
        title: payload.title,
        subtitle: payload.subtitle,
        description: payload.description,
        embed_url: urlCheck.embedUrl,
        duration_label: payload.duration_label,
        is_available: Boolean(urlCheck.embedUrl && payload.is_available),
        published: Boolean(payload.published ?? true),
      });
      revalidateAllPublicPages();
      return NextResponse.json({ ok: true, video });
    }

    if (type === "moderate_submission") {
      const result = await contentRepository.moderateSubmission(
        payload.id,
        payload.status,
        {
          admin_notes: payload.admin_notes,
          year: payload.year,
          category: payload.category,
          title: payload.title,
          message_content: payload.message_content,
        }
      );
      revalidateAllPublicPages();
      return NextResponse.json({ ok: true, submission: result });
    }

    if (type === "delete_submission") {
      await contentRepository.deleteSubmission(payload.id);
      revalidateAllPublicPages();
      return NextResponse.json({ ok: true });
    }

    if (type === "save_story") {
      const story = await contentRepository.saveStory(payload);
      revalidateAllPublicPages();
      return NextResponse.json({ ok: true, story });
    }

    if (type === "toggle_story") {
      await contentRepository.toggleStoryPublished(
        payload.id,
        Boolean(payload.published)
      );
      revalidateAllPublicPages();
      return NextResponse.json({ ok: true });
    }

    if (type === "delete_story") {
      await contentRepository.deleteStory(payload.id);
      revalidateAllPublicPages();
      return NextResponse.json({ ok: true });
    }

    if (type === "save_agenda") {
      const item = await contentRepository.saveAgendaItem(payload);
      revalidateAllPublicPages();
      return NextResponse.json({ ok: true, item });
    }

    if (type === "delete_agenda") {
      await contentRepository.deleteAgendaItem(payload.id);
      revalidateAllPublicPages();
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json(
      { error: "Operación desconocida." },
      { status: 400 }
    );
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Error procesando acción administrativa.",
      },
      { status: 500 }
    );
  }
}
