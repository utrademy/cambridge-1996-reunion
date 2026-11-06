import { NextResponse } from "next/server";
import { contentRepository } from "@/lib/contentRepository";
import {
  siteSettingsUpdateSchema,
  validateExternalVideoUrl,
} from "@/lib/validation";
import { isAuthorizedAdminRequest } from "./auth/route";

export async function GET() {
  const auth = await isAuthorizedAdminRequest();
  if (!auth.authorized) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const [settings, albums, media96, media2026, videos, stories, submissions, agenda] =
    await Promise.all([
      contentRepository.getSiteSettings(),
      contentRepository.getAlbums(true),
      contentRepository.getMediaByYear(1996, true),
      contentRepository.getMediaByYear(2026, true),
      contentRepository.getVideos(true),
      contentRepository.getStories(true),
      contentRepository.getSubmissions(),
      contentRepository.getAgenda(true),
    ]);

  return NextResponse.json({
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
  });
}

export async function POST(request: Request) {
  const auth = await isAuthorizedAdminRequest();
  if (!auth.authorized) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { type, payload } = body;

    if (type === "update_settings") {
      const parsed = siteSettingsUpdateSchema.safeParse(payload);
      if (!parsed.success) {
        return NextResponse.json(
          { error: parsed.error.issues[0]?.message || "Configuración inválida" },
          { status: 400 }
        );
      }
      const updated = await contentRepository.updateSiteSettings(parsed.data);
      return NextResponse.json({ ok: true, settings: updated });
    }

    if (type === "set_reunion_mode") {
      if (!["PRE", "POST", "ARCHIVE"].includes(payload?.reunion_mode)) {
        return NextResponse.json({ error: "Modo inválido" }, { status: 400 });
      }
      const updated = await contentRepository.updateSiteSettings({
        reunion_mode: payload.reunion_mode,
      });
      return NextResponse.json({ ok: true, settings: updated });
    }

    if (type === "save_album") {
      const album = await contentRepository.saveAlbum(payload);
      return NextResponse.json({ ok: true, album });
    }

    if (type === "add_media") {
      const asset = await contentRepository.addMediaAsset(payload);
      return NextResponse.json({ ok: true, asset });
    }

    if (type === "toggle_media") {
      await contentRepository.toggleMediaPublished(
        payload.id,
        Boolean(payload.published)
      );
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
      return NextResponse.json({ ok: true, video });
    }

    if (type === "moderate_submission") {
      const result = await contentRepository.moderateSubmission(
        payload.id,
        payload.status,
        payload.admin_notes
      );
      return NextResponse.json({ ok: true, submission: result });
    }

    if (type === "save_agenda") {
      const item = await contentRepository.saveAgendaItem(payload);
      return NextResponse.json({ ok: true, item });
    }

    if (type === "delete_agenda") {
      await contentRepository.deleteAgendaItem(payload.id);
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json(
      { error: "Operación desconocida." },
      { status: 400 }
    );
  } catch {
    return NextResponse.json(
      { error: "Error procesando acción administrativa." },
      { status: 500 }
    );
  }
}
