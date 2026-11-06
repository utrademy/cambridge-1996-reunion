/**
 * Automated verification runner for all routes, APIs, copy integrity, and admin backup export flows.
 */
import assert from "node:assert/strict";

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";

async function verify() {
  console.log(`Verifying Cambridge 1996 Reunion against ${BASE_URL}...`);

  // 1. Verify /pin QR redirect
  const pinRes = await fetch(`${BASE_URL}/pin`, { redirect: "manual" });
  assert.ok(
    [301, 302, 307, 308].includes(pinRes.status),
    `Expected /pin to redirect, got ${pinRes.status}`
  );
  console.log("✔ /pin QR redirect is active and stable");

  // 2. Verify all public and admin routes return 200 and expected copy
  const routes = [
    {
      path: "/",
      mustContain: [
        "30 años después, la historia nos vuelve a reunir.",
        "Distintos caminos. Los mismos recuerdos. Una generación para siempre.",
        "Las fotografías guardan nuestros rostros. Los recuerdos conservan lo que vivimos juntos.",
        "Sábado, 19 de diciembre de 2026",
        "1:30 p. m.",
        "5:00 p. m.",
        "sopa de cebolla gratinada",
      ],
    },
    { path: "/galeria/1996", mustContain: ["Galería 1996", "Anuario"] },
    { path: "/galeria/2026", mustContain: ["Galería 2026", "Próximamente"] },
    { path: "/videos/historia", mustContain: ["Video Conmemorativo"] },
    { path: "/videos/reencuentro", mustContain: ["El Reencuentro 2026"] },
    { path: "/historias", mustContain: ["Recuerdos y Mensajes"] },
    { path: "/compartir", mustContain: ["Compartir mi Recuerdo"] },
    {
      path: "/privacidad",
      mustContain: ["Aviso de Privacidad y Uso de Fotografías"],
    },
    { path: "/admin", mustContain: ["administración Promoción 1996"] },
    { path: "/admin/galerias", mustContain: ["Administrar Galerías"] },
    { path: "/admin/videos", mustContain: ["Administrar Videos"] },
    { path: "/admin/historias", mustContain: ["Moderar Historias"] },
    { path: "/admin/agenda", mustContain: ["Administrar Programa"] },
    { path: "/admin/configuracion", mustContain: ["Configuración del Sitio"] },
  ];

  for (const r of routes) {
    const res = await fetch(`${BASE_URL}${r.path}`);
    assert.equal(res.status, 200, `Route ${r.path} returned ${res.status}`);
    const html = await res.text();
    for (const phrase of r.mustContain) {
      assert.ok(
        html.includes(phrase),
        `Route ${r.path} missing expected phrase: "${phrase}"`
      );
    }
    console.log(`✔ ${r.path} [200 OK]`);
  }

  // 3. Verify submission API validation & staging insertion
  const badSubRes = await fetch(`${BASE_URL}/api/submissions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ submitter_name: "A" }),
  });
  assert.equal(badSubRes.status, 400, "Invalid submission should return 400");

  const validSubRes = await fetch(`${BASE_URL}/api/submissions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      submission_type: "story",
      submitter_name: "Exalumno Verificado Test",
      submitter_graduation_info: "Promoción 1996",
      title: "Recuerdo de prueba automatizada",
      message_content:
        "Mensaje enviado por la suite de pruebas para verificar la cola privada de moderación.",
      category_suggestion: "Recuerdos",
      year_suggestion: 1996,
      consent_public_display: true,
      consent_privacy_policy: true,
      allow_download: false,
      honeypot: "",
    }),
  });
  assert.equal(
    validSubRes.status,
    201,
    "Valid submission should return 201 Created"
  );
  console.log("✔ /api/submissions Zod validation & staging queue verified");

  // 4. Verify Admin Auth protection & Export Backup Endpoint
  const unauthAdminRes = await fetch(`${BASE_URL}/api/admin`);
  assert.equal(
    unauthAdminRes.status,
    401,
    "Unauthenticated /api/admin must return 401"
  );
  const unauthExportRes = await fetch(`${BASE_URL}/api/admin/export`);
  assert.equal(
    unauthExportRes.status,
    401,
    "Unauthenticated /api/admin/export must return 401"
  );
  console.log("✔ /api/admin & /api/admin/export unauthorized access blocked (401)");

  // Authenticate and test export backup
  const loginRes = await fetch(`${BASE_URL}/api/admin/auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "login", passcode: "cambridge1996-demo" }),
  });
  assert.equal(loginRes.status, 200, "Admin login should succeed with passcode");
  const cookieHeader = loginRes.headers.get("set-cookie");
  assert.ok(cookieHeader, "Expected HttpOnly session cookie");

  const exportRes = await fetch(`${BASE_URL}/api/admin/export`, {
    headers: { cookie: cookieHeader },
  });
  assert.equal(exportRes.status, 200, "Authorized export should return 200");
  const backupJson = await exportRes.json();
  assert.ok(Array.isArray(backupJson.mediaManifest), "Backup includes mediaManifest");
  assert.equal(backupJson.publicImagesDirectory, "/public/images");
  console.log("✔ Authenticated /api/admin/export JSON backup & manifest verified");

  console.log("ALL VERIFICATION CHECKS PASSED SUCCESSFULLY.");
}

verify().catch((err) => {
  console.error(err);
  process.exit(1);
});
