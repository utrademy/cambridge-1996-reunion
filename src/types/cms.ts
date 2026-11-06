export type ReunionMode = "PRE" | "POST" | "ARCHIVE";

export type MediaCategory =
  | "Anuario"
  | "Compañeros"
  | "Profesores"
  | "Actividades"
  | "Reencuentro"
  | "Campus";

export type VideoSlug = "historia" | "reencuentro";

export type VideoProvider = "youtube" | "vimeo" | "external";

export type SubmissionStatus = "pending" | "approved" | "rejected";

export type AdminRole = "admin" | "editor" | "moderator";

export interface SiteSettings {
  id: string;
  reunion_mode: ReunionMode;
  brand_title: string;
  event_date_iso: string;
  event_date_label: string;
  event_time_range: string;
  event_location_name: string;
  event_location_address: string;
  hero_title: string;
  hero_subtitle: string;
  central_quote: string;
  menu_summary: string;
  menu_chef_pending: boolean;
  tally_url: string;
  tally_verified: boolean;
  organizer_contact_note: string;
  updated_at: string;
}

export interface Album {
  id: string;
  slug: string;
  year: 1996 | 2026;
  title: string;
  subtitle: string;
  description: string;
  cover_url: string;
  sort_order: number;
  published: boolean;
  visibility_mode: "ALL" | ReunionMode;
  photo_count?: number;
}

export interface MediaAsset {
  id: string;
  album_id: string;
  year: 1996 | 2026;
  category: MediaCategory;
  title: string;
  caption: string;
  decade_tag: string;
  thumb_url: string;
  preview_url: string;
  width: number;
  height: number;
  allow_download: boolean;
  is_demo_art: boolean;
  published: boolean;
  sort_order: number;
  rotation_deg: number;
  created_at: string;
}

export interface VideoItem {
  id: string;
  slug: VideoSlug;
  title: string;
  subtitle: string;
  description: string;
  provider: VideoProvider;
  embed_url: string | null;
  poster_url: string;
  duration_label: string;
  is_available: boolean;
  published: boolean;
  sort_order: number;
  updated_at: string;
}

export interface StoryItem {
  id: string;
  author_display: string;
  author_role: string;
  is_verified_author: boolean;
  is_editorial_example: boolean;
  title: string;
  excerpt: string;
  content: string;
  year_tag: string;
  published: boolean;
  sort_order: number;
  created_at: string;
}

export interface SubmissionItem {
  id: string;
  submission_type: "story" | "photo" | "both";
  submitter_name: string;
  submitter_graduation_info: string;
  title: string;
  message_content: string;
  category_suggestion: MediaCategory | "Recuerdos";
  year_suggestion: 1996 | 2026;
  media_preview_url?: string;
  media_thumb_url?: string;
  consent_public_display: boolean;
  consent_privacy_policy: boolean;
  allow_download: boolean;
  status: SubmissionStatus;
  admin_notes: string;
  created_at: string;
}

export interface AgendaItem {
  id: string;
  time_label: string;
  title: string;
  description: string;
  location_detail: string;
  category: "recepcion" | "recorrido" | "acto" | "gastronomia" | "cierre";
  is_tentative: boolean;
  sort_order: number;
  published: boolean;
}

export interface HistoryMilestone {
  id: string;
  year: string;
  title: string;
  description: string;
  tag: string;
}

export interface AdminMember {
  id: string;
  email: string;
  full_name: string;
  role: AdminRole;
  active: boolean;
}
