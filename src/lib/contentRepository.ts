import fs from "node:fs";
import os from "node:os";
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
  MediaCategory,
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
const TMP_STATE_FILE = path.join(os.tmpdir(), "cambridge96-cms-state.json");

const REUNION_2026_CATEGORIES: MediaCategory[] = [
  "Reencuentro 2026",
  "Reunión 2016",
  "Reunión 2024",
];

const ARCHIVE_1996_CATEGORIES: MediaCategory[] = [
  "Anuario",
  "Compañeros",
  "Profesores",
  "Actividades",
];

export function normalizeYearAndCategory(
  rawYear: number | undefined,
  rawCategory: string | undefined
): { year: 1996 | 2026; category: MediaCategory } {
  const cat = (rawCategory || "").trim();

  if (cat === "Reunión 2016") {
    return { year: 2026, category: "Reunión 2016" };
  }
  if (cat === "Reunión 2024") {
    return { year: 2026, category: "Reunión 2024" };
  }
  if (cat === "Reencuentro 2026" || cat === "Reencuentro") {
    return { year: 2026, category: "Reencuentro 2026" };
  }

  const year: 1996 | 2026 = Number(rawYear) === 2026 ? 2026 : 1996;

  if (year === 2026) {
    if (REUNION_2026_CATEGORIES.includes(cat as MediaCategory)) {
      return { year: 2026, category: cat as MediaCategory };
    }
    return { year: 2026, category: "Reencuentro 2026" };
  }

  if (ARCHIVE_1996_CATEGORIES.includes(cat as MediaCategory)) {
    return { year: 1996, category: cat as MediaCategory };
  }
  return { year: 1996, category: "Compañeros" };
}

function sanitizeAndMigrateStore(raw: Partial<RepositoryStore>): RepositoryStore {
  const settings: SiteSettings = {
    ...structuredClone(DEMO_SITE_SETTINGS),
    ...(raw.settings || {}),
  };

  // Ensure default albums (including Reunión 2016, Reunión 2024, Reencuentro 2026) exist
  const existingAlbums = Array.isArray(raw.albums)
    ? [...raw.albums]
    : structuredClone(DEMO_ALBUMS);
  for (const demoAlbum of DEMO_ALBUMS) {
    const foundIdx = existingAlbums.findIndex((a) => a.id === demoAlbum.id);
    if (foundIdx === -1) {
      existingAlbums.push(structuredClone(demoAlbum));
    } else if (demoAlbum.year === 2026) {
      existingAlbums[foundIdx] = {
        ...existingAlbums[foundIdx],
        cover_url: "/images/galeria-2026-camara.jpg",
      };
    }
  }

  // Filter out the old blurry fake 2026 demo assets (media-2026-1, media-2026-2)
  // and normalize year/category on all remaining assets
  const rawMedia = Array.isArray(raw.media)
    ? raw.media
    : structuredClone(DEMO_MEDIA_ASSETS);

  const cleanedMedia: MediaAsset[] = rawMedia
    .filter((m) => m.id !== "media-2026-1" && m.id !== "media-2026-2")
    .map((m) => {
      const isDemo96 = m.id.startsWith("media-96-");
      const norm = normalizeYearAndCategory(m.year, m.category);
      return {
        ...m,
        year: norm.year,
        category: norm.category,
        is_demo_art: isDemo96 ? true : Boolean(m.is_demo_art),
        sort_order: isDemo96 && m.sort_order < 10 ? m.sort_order + 10 : m.sort_order,
      };
    });

  // Update video posters and labels if they still have old pixelated posters
  const rawVideos = Array.isArray(raw.videos)
    ? raw.videos
    : structuredClone(DEMO_VIDEOS);
  const cleanedVideos: VideoItem[] = rawVideos.map((v) => {
    if (v.slug === "historia") {
      return {
        ...v,
        poster_url: "/images/video-thumb-historia.png",
        duration_label:
          !v.is_available && (v.duration_label === "4:36" || !v.duration_label)
            ? "Próximamente"
            : v.duration_label,
      };
    }
    if (v.slug === "reencuentro") {
      return {
        ...v,
        poster_url: "/images/video-thumb-reencuentro.png",
        duration_label:
          !v.is_available && (v.duration_label === "8:24" || !v.duration_label)
            ? "Próximamente"
            : v.duration_label,
      };
    }
    return v;
  });

  return {
    settings,
    albums: existingAlbums,
    media: cleanedMedia,
    videos: cleanedVideos,
    stories: Array.isArray(raw.stories)
      ? raw.stories
      : structuredClone(DEMO_STORIES),
    submissions: Array.isArray(raw.submissions)
      ? raw.submissions
      : structuredClone(DEMO_SUBMISSIONS),
    agenda: Array.isArray(raw.agenda)
      ? raw.agenda
      : structuredClone(DEMO_AGENDA),
    admins: Array.isArray(raw.admins)
      ? raw.admins
      : structuredClone(DEMO_ADMINS),
    milestones: Array.isArray(raw.milestones)
      ? raw.milestones
      : structuredClone(DEMO_HISTORY_MILESTONES),
  };
}

const globalForRepo = globalThis as unknown as {
  __cambridge96StaticStore?: RepositoryStore;
  __cambridge96DiskMtimeMs?: number;
  __cambridge96LastBlobCheckMs?: number;
};

function readDiskStoreIfAvailable(): {
  store: RepositoryStore | null;
  mtimeMs: number;
} {
  const candidates = [LOCAL_STATE_FILE, TMP_STATE_FILE];
  let newestFile: string | null = null;
  let newestMtime = 0;

  for (const filePath of candidates) {
    try {
      if (fs.existsSync(filePath)) {
        const stat = fs.statSync(filePath);
        if (stat.mtimeMs >= newestMtime) {
          newestMtime = stat.mtimeMs;
          newestFile = filePath;
        }
      }
    } catch {
      // Ignore inaccessible candidate
    }
  }

  if (!newestFile) {
    return { store: null, mtimeMs: 0 };
  }

  try {
    const raw = fs.readFileSync(newestFile, "utf-8");
    const parsed = JSON.parse(raw) as Partial<RepositoryStore>;
    if (parsed && parsed.settings && parsed.media) {
      return {
        store: sanitizeAndMigrateStore(parsed),
        mtimeMs: newestMtime,
      };
    }
  } catch {
    // Ignore parse error and fallback
  }

  return { store: null, mtimeMs: 0 };
}

function writeDiskStore(store: RepositoryStore): number {
  const serialized = JSON.stringify(store, null, 2);
  let latestMtime = Date.now();

  // 1. Always write to OS temp directory (works on Vercel serverless & local)
  try {
    fs.writeFileSync(TMP_STATE_FILE, serialized, "utf-8");
    latestMtime = fs.statSync(TMP_STATE_FILE).mtimeMs;
  } catch {
    // Ignore if temp is restricted
  }

  // 2. Write to .data/cms-state.json when running locally on writable project directory
  try {
    const dir = path.dirname(LOCAL_STATE_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(LOCAL_STATE_FILE, serialized, "utf-8");
    latestMtime = fs.statSync(LOCAL_STATE_FILE).mtimeMs;
  } catch {
    // Read-only project root on Vercel serverless (handled by TMP_STATE_FILE and Vercel Blob)
  }

  return latestMtime;
}

async function getStore(): Promise<RepositoryStore> {
  // 1. If Vercel Blob is configured, refresh if not checked in the last 800ms
  if (isVercelBlobConfigured()) {
    const now = Date.now();
    const lastCheck = globalForRepo.__cambridge96LastBlobCheckMs || 0;
    if (!globalForRepo.__cambridge96StaticStore || now - lastCheck > 800) {
      globalForRepo.__cambridge96LastBlobCheckMs = now;
      const remoteState = await loadJsonStateFromVercelBlob<RepositoryStore>();
      if (remoteState && remoteState.settings && remoteState.media) {
        const migrated = sanitizeAndMigrateStore(remoteState);
        globalForRepo.__cambridge96StaticStore = migrated;
        globalForRepo.__cambridge96DiskMtimeMs = writeDiskStore(migrated);
        return globalForRepo.__cambridge96StaticStore;
      }
    }
  }

  // 2. Check disk files (.data/cms-state.json or /tmp/cambridge96-cms-state.json)
  // so separate workers/routes always see the newest persisted state immediately
  const disk = readDiskStoreIfAvailable();
  if (
    disk.store &&
    (!globalForRepo.__cambridge96StaticStore ||
      disk.mtimeMs > (globalForRepo.__cambridge96DiskMtimeMs || 0))
  ) {
    globalForRepo.__cambridge96StaticStore = disk.store;
    globalForRepo.__cambridge96DiskMtimeMs = disk.mtimeMs;
    return globalForRepo.__cambridge96StaticStore;
  }

  // 3. Initialize default store if nothing on disk or memory yet
  if (!globalForRepo.__cambridge96StaticStore) {
    const initial = sanitizeAndMigrateStore({
      settings: structuredClone(DEMO_SITE_SETTINGS),
      albums: structuredClone(DEMO_ALBUMS),
      media: structuredClone(DEMO_MEDIA_ASSETS),
      videos: structuredClone(DEMO_VIDEOS),
      stories: structuredClone(DEMO_STORIES),
      submissions: structuredClone(DEMO_SUBMISSIONS),
      agenda: structuredClone(DEMO_AGENDA),
      admins: structuredClone(DEMO_ADMINS),
      milestones: structuredClone(DEMO_HISTORY_MILESTONES),
    });
    globalForRepo.__cambridge96StaticStore = initial;
    globalForRepo.__cambridge96DiskMtimeMs = writeDiskStore(initial);
  }

  return globalForRepo.__cambridge96StaticStore;
}

async function persistStore(store: RepositoryStore): Promise<void> {
  globalForRepo.__cambridge96StaticStore = store;
  globalForRepo.__cambridge96DiskMtimeMs = writeDiskStore(store);

  if (isVercelBlobConfigured()) {
    await saveJsonStateToVercelBlob(store);
    globalForRepo.__cambridge96LastBlobCheckMs = Date.now();
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
      title: album.title.trim(),
      subtitle: album.subtitle?.trim() || "",
      description:
        album.description?.trim() || "Álbum conmemorativo Promoción 1996.",
      cover_url:
        album.cover_url ||
        (album.year === 2026
          ? "/images/galeria-2026-camara.jpg"
          : "/images/campus-archways-1996.svg"),
      sort_order: album.sort_order ?? store.albums.length + 1,
      published: album.published ?? true,
      visibility_mode: album.visibility_mode || "ALL",
      photo_count: 0,
    };
    store.albums.push(created);
    await persistStore(store);
    return created;
  },

  async deleteAlbum(id: string): Promise<boolean> {
    const store = await getStore();
    const initialLen = store.albums.length;
    store.albums = store.albums.filter((a) => a.id !== id);
    await persistStore(store);
    return store.albums.length < initialLen;
  },

  async getMediaByYear(
    year: 1996 | 2026,
    includeUnpublished = false
  ): Promise<MediaAsset[]> {
    const store = await getStore();
    return store.media
      .filter((m) => m.year === year && (includeUnpublished || m.published))
      .sort((a, b) => {
        // Real uploaded/approved photos ALWAYS come before demo placeholder art
        if (Boolean(a.is_demo_art) !== Boolean(b.is_demo_art)) {
          return a.is_demo_art ? 1 : -1;
        }
        if (a.sort_order !== b.sort_order) {
          return a.sort_order - b.sort_order;
        }
        return b.created_at.localeCompare(a.created_at);
      });
  },

  async addMediaAsset(
    asset: Omit<MediaAsset, "id" | "created_at">
  ): Promise<MediaAsset> {
    const store = await getStore();
    const timestamp = Date.now();
    const norm = normalizeYearAndCategory(asset.year, asset.category);
    const cleanTitle =
      asset.title.trim() || `Fotografía Promoción 1996 (${norm.category})`;
    const slugBase = cleanTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .slice(0, 40);

    const previewUpload = await uploadDataUrlToVercelBlob(
      `cambridge-1996/${norm.year}/preview-${slugBase}-${timestamp}.webp`,
      asset.preview_url
    );
    const thumbUpload = await uploadDataUrlToVercelBlob(
      `cambridge-1996/${norm.year}/thumb-${slugBase}-${timestamp}.webp`,
      asset.thumb_url || asset.preview_url
    );

    const defaultAlbumId =
      norm.category === "Reunión 2016"
        ? "album-2016-reunion"
        : norm.category === "Reunión 2024"
          ? "album-2024-reunion"
          : norm.year === 2026
            ? "album-2026-reencuentro"
            : "album-1996-anuario";

    const created: MediaAsset = {
      ...asset,
      album_id: asset.album_id || defaultAlbumId,
      year: norm.year,
      category: norm.category,
      title: cleanTitle,
      caption:
        asset.caption?.trim() ||
        `Recuerdo fotográfico · ${norm.category} (${norm.year})`,
      decade_tag: `${norm.year} · ${norm.category}`,
      preview_url: previewUpload.url,
      thumb_url: thumbUpload.url,
      is_demo_art: false,
      published: asset.published ?? true,
      sort_order: 0,
      id: `media-${timestamp}-${Math.random().toString(36).slice(2, 6)}`,
      created_at: new Date().toISOString(),
    };
    store.media.unshift(created);
    await persistStore(store);
    return created;
  },

  async updateMediaAsset(
    id: string,
    updates: Partial<
      Pick<
        MediaAsset,
        | "title"
        | "caption"
        | "year"
        | "category"
        | "album_id"
        | "allow_download"
        | "published"
      >
    >
  ): Promise<MediaAsset | null> {
    const store = await getStore();
    const idx = store.media.findIndex((m) => m.id === id);
    if (idx === -1) return null;

    const current = store.media[idx];
    const norm = normalizeYearAndCategory(
      updates.year ?? current.year,
      updates.category ?? current.category
    );

    store.media[idx] = {
      ...current,
      ...updates,
      year: norm.year,
      category: norm.category,
      decade_tag: `${norm.year} · ${norm.category}`,
    };
    await persistStore(store);
    return store.media[idx];
  },

  async deleteMediaAsset(id: string): Promise<boolean> {
    const store = await getStore();
    const initialLen = store.media.length;
    store.media = store.media.filter((m) => m.id !== id);
    await persistStore(store);
    return store.media.length < initialLen;
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

  async saveStory(
    story: Partial<StoryItem> & {
      author_display: string;
      title: string;
      content: string;
    }
  ): Promise<StoryItem> {
    const store = await getStore();
    if (story.id) {
      const idx = store.stories.findIndex((s) => s.id === story.id);
      if (idx >= 0) {
        store.stories[idx] = {
          ...store.stories[idx],
          ...story,
          excerpt: story.content.trim().slice(0, 175),
        };
        await persistStore(store);
        return store.stories[idx];
      }
    }
    const created: StoryItem = {
      id: `story-${Date.now()}`,
      author_display: story.author_display.trim(),
      author_role: story.author_role?.trim() || "Promoción 1996",
      is_verified_author: true,
      is_editorial_example: false,
      title: story.title.trim(),
      excerpt: story.content.trim().slice(0, 175),
      content: story.content.trim(),
      year_tag: story.year_tag || "1996 – 2026",
      published: story.published ?? true,
      sort_order: 0,
      created_at: new Date().toISOString(),
    };
    store.stories.unshift(created);
    await persistStore(store);
    return created;
  },

  async toggleStoryPublished(id: string, published: boolean): Promise<boolean> {
    const store = await getStore();
    const item = store.stories.find((s) => s.id === id);
    if (!item) return false;
    item.published = published;
    await persistStore(store);
    return true;
  },

  async deleteStory(id: string): Promise<boolean> {
    const store = await getStore();
    const initialLen = store.stories.length;
    store.stories = store.stories.filter((s) => s.id !== id);
    await persistStore(store);
    return store.stories.length < initialLen;
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

    const norm =
      payload.category_suggestion === "Recuerdos"
        ? {
            year: payload.year_suggestion,
            category: "Recuerdos" as const,
          }
        : normalizeYearAndCategory(
            payload.year_suggestion,
            payload.category_suggestion
          );

    const created: SubmissionItem = {
      ...payload,
      year_suggestion: norm.year,
      category_suggestion: norm.category,
      media_preview_url: previewUrl,
      media_thumb_url: thumbUrl || previewUrl,
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
    options?: {
      admin_notes?: string;
      year?: 1996 | 2026;
      category?: MediaCategory;
      title?: string;
      message_content?: string;
    }
  ): Promise<SubmissionItem | null> {
    const store = await getStore();
    const item = store.submissions.find((s) => s.id === id);
    if (!item) return null;

    item.status = status;
    if (options?.admin_notes) item.admin_notes = options.admin_notes;
    if (options?.title?.trim()) item.title = options.title.trim();
    if (options?.message_content?.trim()) {
      item.message_content = options.message_content.trim();
    }

    const targetYear = options?.year ?? item.year_suggestion;
    const rawCat =
      options?.category ??
      (item.category_suggestion === "Recuerdos"
        ? targetYear === 2026
          ? "Reencuentro 2026"
          : "Compañeros"
        : item.category_suggestion);
    const norm = normalizeYearAndCategory(targetYear, rawCat);
    item.year_suggestion = norm.year;
    if (item.category_suggestion !== "Recuerdos" || options?.category) {
      item.category_suggestion = norm.category;
    }

    if (status === "approved") {
      if (item.submission_type === "story" || item.submission_type === "both") {
        const storyId = `story-sub-${item.id}`;
        const existingStoryIdx = store.stories.findIndex(
          (s) => s.id === storyId
        );
        const storyData: StoryItem = {
          id: storyId,
          author_display: item.submitter_name,
          author_role: item.submitter_graduation_info,
          is_verified_author: true,
          is_editorial_example: false,
          title: item.title,
          excerpt: item.message_content.slice(0, 175),
          content: item.message_content,
          year_tag: String(norm.year),
          published: true,
          sort_order: 0,
          created_at: new Date().toISOString(),
        };
        if (existingStoryIdx >= 0) {
          store.stories[existingStoryIdx] = storyData;
        } else {
          store.stories.unshift(storyData);
        }
      }

      if (item.media_preview_url || item.media_thumb_url) {
        const imageUrl = item.media_preview_url || item.media_thumb_url || "";
        const thumbUrl = item.media_thumb_url || imageUrl;
        // Avoid duplicate media entry if re-approving the same submission
        const existingMediaIdx = store.media.findIndex(
          (m) => m.id === `media-from-${item.id}`
        );
        if (existingMediaIdx >= 0) {
          store.media[existingMediaIdx] = {
            ...store.media[existingMediaIdx],
            year: norm.year,
            category: norm.category,
            title: item.title,
            caption: `${item.message_content} — Compartido por ${item.submitter_name}`,
            decade_tag: `${norm.year} · ${norm.category}`,
            published: true,
            is_demo_art: false,
            sort_order: 0,
          };
          await persistStore(store);
        } else {
          const added = await this.addMediaAsset({
            album_id:
              norm.category === "Reunión 2016"
                ? "album-2016-reunion"
                : norm.category === "Reunión 2024"
                  ? "album-2024-reunion"
                  : norm.year === 2026
                    ? "album-2026-reencuentro"
                    : "album-1996-vida",
            year: norm.year,
            category: norm.category,
            title: item.title,
            caption: `${item.message_content} — Compartido por ${item.submitter_name}`,
            decade_tag: `${norm.year} · ${norm.category}`,
            thumb_url: thumbUrl,
            preview_url: imageUrl,
            width: 1200,
            height: 900,
            allow_download: item.allow_download,
            is_demo_art: false,
            published: true,
            sort_order: 0,
            rotation_deg: 1.2,
          });
          // Tag deterministic id so re-approving updates instead of duplicating
          added.id = `media-from-${item.id}`;
          await persistStore(store);
        }
        return item;
      }
    } else if (status === "rejected") {
      // If previously approved and now rejected, unpublish its linked media/story
      const linkedMedia = store.media.find(
        (m) => m.id === `media-from-${item.id}`
      );
      if (linkedMedia) linkedMedia.published = false;
      const linkedStory = store.stories.find(
        (s) => s.id === `story-sub-${item.id}`
      );
      if (linkedStory) linkedStory.published = false;
    }

    await persistStore(store);
    return item;
  },

  async deleteSubmission(id: string): Promise<boolean> {
    const store = await getStore();
    const initialLen = store.submissions.length;
    store.submissions = store.submissions.filter((s) => s.id !== id);
    await persistStore(store);
    return store.submissions.length < initialLen;
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
      time_label: item.time_label.trim(),
      title: item.title.trim(),
      description: item.description.trim(),
      location_detail: item.location_detail?.trim() || "New Cambridge School",
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
