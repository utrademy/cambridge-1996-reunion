import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { submissionSchema, validateExternalVideoUrl } from "../src/lib/validation.ts";

describe("Promoción 1996 — New Cambridge School (30 Years Reunion) Suite", () => {
  it("Preserves exact approved V2 copy, updated schedule (1:15 p. m. - Medianoche) and Andalucía party", () => {
    const agendaRaw = fs.readFileSync(
      path.join(process.cwd(), "src/data/seed.agenda.json"),
      "utf-8"
    );
    const agenda = JSON.parse(agendaRaw) as Array<{
      time_label: string;
      title: string;
      description: string;
    }>;

    assert.equal(agenda[0]?.time_label, "1:15 p. m.");
    assert.equal(agenda[agenda.length - 1]?.time_label, "6:00 p. m. – Medianoche");
    assert.ok(agendaRaw.includes("Chiva"));
    assert.ok(agendaRaw.includes("Andalucía"));
    assert.ok(agendaRaw.includes("Club Campestre"));

    const fixturesSource = fs.readFileSync(
      path.join(process.cwd(), "src/data/fixtures.ts"),
      "utf-8"
    );
    assert.ok(fixturesSource.includes("Promoción 1996 — New Cambridge School"));
    assert.ok(
      fixturesSource.includes("30 años después, la historia nos vuelve a reunir.")
    );
    assert.ok(
      fixturesSource.includes(
        "Distintos caminos. Los mismos recuerdos. Una generación para siempre."
      )
    );
    assert.ok(
      fixturesSource.includes(
        "Las fotografías guardan nuestros rostros. Los recuerdos conservan lo que vivimos juntos."
      )
    );
  });

  it("Stores extracted V2 historical and primary images in public/images", () => {
    const requiredImages = [
      "logo-class-of-1996.png",
      "campus-archways-1996.png",
      "historia-grupo-1996.png",
      "historia-jardin-1996.png",
      "campus-aerial-1996.png",
      "galeria-96-anuario.png",
      "galeria-96-baloncesto.png",
      "galeria-96-cancha.png",
      "gal96-grid-1.png",
      "gal96-grid-2.png",
      "gal96-grid-3.png",
      "gal96-grid-4.png",
      "gal96-grid-5.png",
      "gal96-grid-6.png",
      "encuentro-arcadas.png",
      "encuentro-atardecer-amigos.png",
      "galeria-2026-camara.png",
      "video-thumb-historia.png",
      "video-thumb-reencuentro.png",
      "nuestro-colegio-fachada.png",
    ];
    for (const img of requiredImages) {
      const fullPath = path.join(process.cwd(), "public/images", img);
      assert.ok(fs.existsSync(fullPath), `Missing image in public/images: ${img}`);
    }
  });

  it("Validates external video URLs and blocks untrusted hosts", () => {
    const validYt = validateExternalVideoUrl(
      "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
    );
    assert.equal(validYt.valid, true);
    assert.equal(
      validYt.embedUrl,
      "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ"
    );

    const invalidHost = validateExternalVideoUrl(
      "https://evil.example.com/video.mp4"
    );
    assert.equal(invalidHost.valid, false);
  });

  it("Requires explicit consent on community submissions", () => {
    const rejected = submissionSchema.safeParse({
      submission_type: "story",
      submitter_name: "Exalumno 1996",
      submitter_graduation_info: "Promoción 1996",
      title: "Recuerdo escolar",
      message_content: "Un gran recuerdo de nuestra época en el colegio.",
      category_suggestion: "Recuerdos",
      year_suggestion: 1996,
      consent_public_display: false,
      consent_privacy_policy: true,
    });
    assert.equal(rejected.success, false);
  });
});
