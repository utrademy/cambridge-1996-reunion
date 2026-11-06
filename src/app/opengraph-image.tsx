import { ImageResponse } from "next/og";

export const alt =
  "Promoción 1996 — New Cambridge School · 30 Years Reunion (19 de diciembre de 2026)";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#142B53",
          backgroundImage:
            "radial-gradient(circle at 20% 20%, #A52728 0%, transparent 45%), radial-gradient(circle at 85% 80%, #0D1E3A 0%, transparent 50%)",
          color: "#F6F2E9",
          padding: "48px 64px",
          border: "12px solid #D9B875",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            fontSize: 22,
            letterSpacing: "4px",
            textTransform: "uppercase",
            color: "#D9B875",
            marginBottom: 16,
          }}
        >
          NEW CAMBRIDGE SCHOOL · PROMOCIÓN 1996
        </div>
        <div
          style={{
            fontSize: 108,
            fontWeight: 900,
            lineHeight: 1,
            color: "#F6F2E9",
            letterSpacing: "2px",
          }}
        >
          CLASS OF 1996
        </div>
        <div
          style={{
            backgroundColor: "#A52728",
            padding: "10px 36px",
            borderRadius: "6px",
            fontSize: 34,
            fontWeight: 800,
            letterSpacing: "6px",
            marginTop: 16,
            marginBottom: 28,
          }}
        >
          30 YEARS REUNION
        </div>
        <div
          style={{
            fontSize: 34,
            fontStyle: "italic",
            textAlign: "center",
            maxWidth: "880px",
            color: "#F6F2E9",
            marginBottom: 18,
          }}
        >
          “30 años después, la historia nos vuelve a reunir.”
        </div>
        <div
          style={{
            fontSize: 20,
            letterSpacing: "2px",
            color: "#D9B875",
            textTransform: "uppercase",
          }}
        >
          Sábado, 19 de diciembre de 2026 · 1:30 p. m. – 5:00 p. m. · Floridablanca
        </div>
      </div>
    ),
    { ...size }
  );
}
