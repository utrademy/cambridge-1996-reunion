import fs from "node:fs";
import path from "node:path";
import {
  DEMO_ADMINS,
  DEMO_AGENDA,
  DEMO_ALBUMS,
  DEMO_HISTORY_MILESTONES,
  DEMO_MEDIA_ASSETS,
  DEMO_SITE_SETTINGS,
  DEMO_STORIES,
  DEMO_SUBMISSIONS,
  DEMO_VIDEOS,
} from "@/data/fixtures";
import type {
  AdminMember,
  AgendaItem,
  Album,
  HistoryMilestone,
  MediaAsset,
  SiteSettings,
  StoryItem,
  SubmissionItem,
  VideoItem,
  VideoSlug,
} from "@/types/cms";
import {
  isVercelBlobConfigured,
  loadJsonStateFromVercelBlob,
  saveJsonStateToVercelBlob,
  uploadDataUrlToVercelBlob,
} from "./blobStorage";

interface RepositoryStore {
  settings: SiteSettings;
  albums: Album[];
  media: MediaAsset[];
  videos: VideoItem[];
  stories: StoryItem[];
  submissions: SubmissionItem[];
  agenda: AgendaItem[];
  admins: AdminMember[];
  milestones: HistoryMilestone[];
}

const LOCAL_STATE_FILE = path.join(process.cwd(), ".data", "cms-state.json");

const globalForRepo = globalThis as unknown as {
  __cambridge96StaticStore?: RepositoryStore;
  __cambridge96BlobHydrated?: boolean;
};

function createInitialStore(): RepositoryStore {
  // Check if local persistent state file exists on disk (for local development)
  try {
    if (fs.existsSync(LOCAL_STATE_FILE)) {
      const raw = fs.readFileSync(LOCAL_STATE_FILE, "utf-8");
      const parsed = JSON.parse(raw) as Partial<RepositoryStore>;
      if (parsed.settings && parsed.media && parsed.stories) {
        return {
          settings: parsed.settings,
          albums: parsed.albums || structuredClone(DEMO_ALBUMS),
          media: parsed.media,
          videos: parsed.videos || structuredClone(DEMO_VIDEOS),
          stories: parsed.stories,
          submissions: parsed.submissions || structuredClone(DEMO_SUBMISSIONS),
          agenda: parsed.agenda || structuredClone(DEMO_AGENDA),
          admins: parsed.admins || structuredClone(DEMO_ADMINS),
          milestones:
            parsed.milestones || structuredClone(DEMO_HISTORY_MILESTONES),
        };
      }
    }
  } catch {
    // Fallback to static GitHub fixtures
  }

  return {
    settings: structuredClone(DEMO_SITE_SETTINGS),
    albums: structuredClone(DEMO_ALBUMS),
    media: structuredClone(DEMO_MEDIA_ASSETS),
    videos: structuredClone(DEMO_VIDEOS),
    stories: structuredClone(DEMO_STORIES),
    submissions: structuredClone(DEMO_SUBMISSIONS),
    agenda: structuredClone(DEMO_AGENDA),
    admins: structuredClone(DEMO_ADMINS),
    milestones: structuredClone(DEMO_HISTORY_MILESTONES),
  };
}

async function getStore(): Promise<RepositoryStore> {
  if (!globalForRepo.__cambridge96StaticStore) {
    globalForRepo.__cambridge96StaticStore = createInitialStore();
  }

  // Hydrate from Vercel Blob once per instance if configured
  if (isVercelBlobConfigured() && !globalForRepo.__cambridge96BlobHydrated) {
    globalForRepo.__cambridge96BlobHydrated = true;
    const remoteState = await loadJsonStateFromVercelBlob<RepositoryStore>();
    if (remoteState && remoteState.settings && remoteState.media) {
      globalForRepo.__cambridge96StaticStore = remoteState;
    }
  }

  return globalForRepo.__cambridge96StaticStore;
}

async function persistStore(store: RepositoryStore): Promise<void> {
  // 1. Save to Vercel Blob if configured in production
  if (isVercelBlobConfigured()) {
    await saveJsonStateToVercelBlob(store);
  }
  // 2. Save to local `.data/cms-state.json` when running locally on writable filesystem
  try {
    const dir = path.dirname(LOCAL_STATE_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(LOCAL_STATE_FILE, JSON.stringify(store, null, 2), "utf-8");
  } catch {
    // Read-only serverless filesystem when on Vercel (handled by Vercel Blob above)
  }
}

export const contentRepository = {
  isBlobEnabled(): boolean {
    return isVercelBlobConfigured();
  },

  isDemoMode(): boolean {
    return !isVercelBlobConfigured();
  },

  async getSiteSettings(): Promise<SiteSettings> {
    const store = await getStore();
    return store.settings;
  },

  async updateSiteSettings(
    partial: Partial<SiteSettings>
  ): Promise<SiteSettings> {
    const store = await getStore();
    store.settings = {
      ...store.settings,
      ...partial,
      updated_at: new Date().toISOString(),
    };
    await persistStore(store);
    return store.settings;
  },

  async getHistoryMilestones(): Promise<HistoryMilestone[]> {
    const store = await getStore();
    return store.milestones;
  },

  async getAlbums(includeUnpublished = false): Promise<Album[]> {
    const store = await getStore();
    return store.albums
      .filter((a) => includeUnpublished || a.published)
      .sort((a, b) => a.sort_order - b.sort_order);
  },

  async saveAlbum(
    album: Partial<Album> & { title: string; year: 1996 | 2026 }
  ): Promise<Album> {
    const store = await getStore();
    if (album.id) {
      const idx = store.albums.findIndex((a) => a.id === album.id);
      if (idx >= 0) {
        store.albums[idx] = { ...store.albums[idx], ...album };
        await persistStore(store);
        return store.albums[idx];
      }
    }
    const created: Album = {
      id: `album-${Date.now()}`,
      slug:
        album.slug ||
        `${album.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${album.year}`,
      year: album.year,
      title: album.title,
      subtitle: album.subtitle || "",
      description: album.description || "",
      cover_url: album.cover_url || "/images/campus-archways-1996.svg",
      sort_order: album.sort_order ?? store.albums.length + 1,
      published: album.published ?? true,
      visibility_mode: album.visibility_mode || "ALL",
      photo_count: 0,
    };
    store.albums.push(created);
    await persistStore(store);
    return created;
  },

  async getMediaByYear(
    year: 1996 | 2026,
    includeUnpublished = false
  ): Promise<MediaAsset[]> {
    const store = await getStore();
    return store.media
      .filter((m) => m.year === year && (includeUnpublished || m.published))
      .sort((a, b) => a.sort_order - b.sort_order);
  },

  async addMediaAsset(
    asset: Omit<MediaAsset, "id" | "created_at">
  ): Promise<MediaAsset> {
    const store = await getStore();
    const timestamp = Date.now();
    const slugBase = asset.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .slice(0, 40);

    const previewUpload = await uploadDataUrlToVercelBlob(
      `cambridge-1996/${asset.year}/preview-${slugBase}-${timestamp}.webp`,
      asset.preview_url
    );
    const thumbUpload = await uploadDataUrlToVercelBlob(
      `cambridge-1996/${asset.year}/thumb-${slugBase}-${timestamp}.webp`,
      asset.thumb_url
    );

    const created: MediaAsset = {
      ...asset,
      preview_url: previewUpload.url,
      thumb_url: thumbUpload.url,
      id: `media-${timestamp}-${Math.random().toString(36).slice(2, 6)}`,
      created_at: new Date().toISOString(),
    };
    store.media.unshift(created);
    await persistStore(store);
    return created;
  },

  async toggleMediaPublished(id: string, published: boolean): Promise<boolean> {
    const store = await getStore();
    const item = store.media.find((m) => m.id === id);
    if (!item) return false;
    item.published = published;
    await persistStore(store);
    return true;
  },

  async getVideos(includeUnpublished = false): Promise<VideoItem[]> {
    const store = await getStore();
    return store.videos
      .filter((v) => includeUnpublished || v.published)
      .sort((a, b) => a.sort_order - b.sort_order);
  },

  async getVideoBySlug(slug: VideoSlug): Promise<VideoItem | null> {
    const videos = await this.getVideos(true);
    return videos.find((v) => v.slug === slug) || null;
  },

  async updateVideo(
    slug: VideoSlug,
    updates: Partial<VideoItem>
  ): Promise<VideoItem | null> {
    const store = await getStore();
    const idx = store.videos.findIndex((v) => v.slug === slug);
    if (idx === -1) return null;
    store.videos[idx] = {
      ...store.videos[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    await persistStore(store);
    return store.videos[idx];
  },

  async getStories(includeUnpublished = false): Promise<StoryItem[]> {
    const store = await getStore();
    return store.stories
      .filter((s) => includeUnpublished || s.published)
      .sort((a, b) => a.sort_order - b.sort_order);
  },

  async getSubmissions(): Promise<SubmissionItem[]> {
    const store = await getStore();
    return [...store.submissions].sort((a, b) =>
      b.created_at.localeCompare(a.created_at)
    );
  },

  async createSubmission(
    payload: Omit<
      SubmissionItem,
      "id" | "status" | "admin_notes" | "created_at"
    >
  ): Promise<SubmissionItem> {
    const store = await getStore();
    const timestamp = Date.now();

    let previewUrl = payload.media_preview_url;
    let thumbUrl = payload.media_thumb_url;

    if (previewUrl && previewUrl.startsWith("data:")) {
      const up = await uploadDataUrlToVercelBlob(
        `cambridge-1996/staging/preview-${timestamp}.webp`,
        previewUrl
      );
      previewUrl = up.url;
    }
    if (thumbUrl && thumbUrl.startsWith("data:")) {
      const up = await uploadDataUrlToVercelBlob(
        `cambridge-1996/staging/thumb-${timestamp}.webp`,
        thumbUrl
      );
      thumbUrl = up.url;
    }

    const created: SubmissionItem = {
      ...payload,
      media_preview_url: previewUrl,
      media_thumb_url: thumbUrl,
      id: `sub-${timestamp}`,
      status: "pending",
      admin_notes: "Recibido en cola de moderación privada.",
      created_at: new Date().toISOString(),
    };
    store.submissions.unshift(created);
    await persistStore(store);
    return created;
  },

  async moderateSubmission(
    id: string,
    status: "approved" | "rejected",
    admin_notes = ""
  ): Promise<SubmissionItem | null> {
    const store = await getStore();
    const item = store.submissions.find((s) => s.id === id);
    if (!item) return null;
    item.status = status;
    if (admin_notes) item.admin_notes = admin_notes;

    if (status === "approved") {
      if (item.submission_type === "story" || item.submission_type === "both") {
        store.stories.unshift({
          id: `story-${Date.now()}`,
          author_display: item.submitter_name,
          author_role: item.submitter_graduation_info,
          is_verified_author: true,
          is_editorial_example: false,
          title: item.title,
          excerpt: item.message_content.slice(0, 175),
          content: item.message_content,
          year_tag: String(item.year_suggestion),
          published: true,
          sort_order: 0,
          created_at: new Date().toISOString(),
        });
      }
      if (
        (item.submission_type === "photo" || item.submission_type === "both") &&
        item.media_preview_url
      ) {
        await this.addMediaAsset({
          album_id:
            item.year_suggestion === 2026
              ? "album-2026-reencuentro"
              : "album-1996-vida",
          year: item.year_suggestion,
          category:
            item.category_suggestion === "Recuerdos"
              ? "Compañeros"
              : item.category_suggestion,
          title: item.title,
          caption: `${item.message_content} — Compartido por ${item.submitter_name}`,
          decade_tag: `${item.year_suggestion}`,
          thumb_url: item.media_thumb_url || item.media_preview_url,
          preview_url: item.media_preview_url,
          width: 1200,
          height: 900,
          allow_download: item.allow_download,
          is_demo_art: false,
          published: true,
          sort_order: 0,
          rotation_deg: 1.2,
        });
        return item;
      }
    }

    await persistStore(store);
    return item;
  },

  async getAgenda(includeUnpublished = false): Promise<AgendaItem[]> {
    const store = await getStore();
    return store.agenda
      .filter((item) => includeUnpublished || item.published)
      .sort((a, b) => a.sort_order - b.sort_order);
  },

  async saveAgendaItem(
    item: Partial<AgendaItem> & {
      time_label: string;
      title: string;
      description: string;
    }
  ): Promise<AgendaItem> {
    const store = await getStore();
    if (item.id) {
      const idx = store.agenda.findIndex((a) => a.id === item.id);
      if (idx >= 0) {
        store.agenda[idx] = { ...store.agenda[idx], ...item };
        await persistStore(store);
        return store.agenda[idx];
      }
    }
    const created: AgendaItem = {
      id: `agenda-${Date.now()}`,
      time_label: item.time_label,
      title: item.title,
      description: item.description,
      location_detail: item.location_detail || "New Cambridge School",
      category: item.category || "acto",
      is_tentative: item.is_tentative ?? false,
      sort_order: item.sort_order ?? store.agenda.length + 1,
      published: item.published ?? true,
    };
    store.agenda.push(created);
    await persistStore(store);
    return created;
  },

  async deleteAgendaItem(id: string): Promise<boolean> {
    const store = await getStore();
    const initialLen = store.agenda.length;
    store.agenda = store.agenda.filter((a) => a.id !== id);
    await persistStore(store);
    return store.agenda.length < initialLen;
  },

  async getAdmins(): Promise<AdminMember[]> {
    const store = await getStore();
    return store.admins;
  },

  async exportBackupBundle() {
    const store = await getStore();
    return {
      exportedAt: new Date().toISOString(),
      architecture:
        "Vercel Hobby + GitHub Static Repository + Vercel Blob (Images & JSON State)",
      blobConfigured: isVercelBlobConfigured(),
      publicImagesDirectory: "/public/images",
      settings: store.settings,
      albums: store.albums,
      mediaManifest: store.media.map((m) => ({
        id: m.id,
        year: m.year,
        category: m.category,
        title: m.title,
        caption: m.caption,
        thumb_url: m.thumb_url,
        preview_url: m.preview_url,
        allow_download: m.allow_download,
        published: m.published,
        created_at: m.created_at,
      })),
      videos: store.videos,
      stories: store.stories,
      agenda: store.agenda,
      submissionsQueue: store.submissions,
    };
  },
};
