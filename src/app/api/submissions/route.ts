import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { contentRepository } from "@/lib/contentRepository";
import { checkRateLimit, submissionSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
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

    const body = await request.json();
    const parsed = submissionSchema.safeParse(body);

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

    try {
      revalidatePath("/", "layout");
    } catch {
      // Ignore outside request context
    }

    return NextResponse.json(
      {
        ok: true,
        submissionId: created.id,
        message:
          "Tu recuerdo fue recibido en la cola privada de moderación del comité organizador.",
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "No fue posible procesar el envío en este momento." },
      { status: 500 }
    );
  }
}
