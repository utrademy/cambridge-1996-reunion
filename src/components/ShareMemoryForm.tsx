"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  CheckCircle2,
  ImagePlus,
  Loader2,
  ShieldCheck,
  Sparkles,
  Upload,
} from "lucide-react";
import {
  processImageForFreeTier,
  type OptimizedImagePair,
} from "@/lib/imageOptimizer";

export function ShareMemoryForm() {
  const [submissionType, setSubmissionType] = useState<
    "story" | "photo" | "both"
  >("both");
  const [submitterName, setSubmitterName] = useState("");
  const [graduationInfo, setGraduationInfo] = useState("Promoción 1996");
  const [title, setTitle] = useState("");
  const [messageContent, setMessageContent] = useState("");
  const [categorySuggestion, setCategorySuggestion] = useState("Compañeros");
  const [yearSuggestion, setYearSuggestion] = useState<1996 | 2026>(1996);
  const [consentPublic, setConsentPublic] = useState(false);
  const [consentPrivacy, setConsentPrivacy] = useState(false);
  const [allowDownload, setAllowDownload] = useState(false);
  const [honeypot, setHoneypot] = useState("");

  const [optimizedImage, setOptimizedImage] =
    useState<OptimizedImagePair | null>(null);
  const [processingImage, setProcessingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErrorMessage(null);
    setProcessingImage(true);
    try {
      const result = await processImageForFreeTier(file);
      setOptimizedImage(result);
    } catch (err) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "Error al optimizar la imagen localmente."
      );
    } finally {
      setProcessingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (
      (submissionType === "photo" || submissionType === "both") &&
      !optimizedImage
    ) {
      setErrorMessage(
        "Por favor selecciona una fotografía o cambia el tipo de envío a «Solo relato / mensaje»."
      );
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submission_type: submissionType,
          submitter_name: submitterName,
          submitter_graduation_info: graduationInfo,
          title,
          message_content: messageContent,
          category_suggestion: categorySuggestion,
          year_suggestion: yearSuggestion,
          media_preview_url: optimizedImage?.previewDataUrl,
          media_thumb_url: optimizedImage?.thumbDataUrl,
          consent_public_display: consentPublic,
          consent_privacy_policy: consentPrivacy,
          allow_download: allowDownload,
          honeypot,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setErrorMessage(data.error || "No se pudo completar el envío.");
        return;
      }

      setSuccessId(data.submissionId || "recibido");
    } catch {
      setErrorMessage("Error de red al enviar tu recuerdo.");
    } finally {
      setSubmitting(false);
    }
  };

  if (successId) {
    return (
      <div className="rounded-2xl border-2 border-[#142B53]/20 bg-[#FCFBF7] p-8 text-center shadow-lg">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-900/10 text-emerald-800">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h2 className="mt-4 font-serif text-2xl sm:text-3xl font-bold text-[#142B53]">
          ¡Gracias por aportar a la memoria de la Promoción 1996!
        </h2>
        <p className="mt-2 text-sm sm:text-base text-[#111827]/80 max-w-xl mx-auto">
          Tu contribución ha sido almacenada en la cola privada de moderación (
          <code className="rounded bg-[#142B53]/10 px-2 py-0.5 text-xs font-mono">
            {successId}
          </code>
          ). El comité organizador la revisará antes de su publicación en las
          galerías o en la sección de recuerdos.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => {
              setSuccessId(null);
              setTitle("");
              setMessageContent("");
              setOptimizedImage(null);
            }}
            className="min-h-[44px] rounded-md bg-[#A52728] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#8B1E1F]"
          >
            Enviar otro recuerdo
          </button>
          <Link
            href="/historias"
            className="min-h-[44px] inline-flex items-center rounded-md border border-[#142B53]/25 bg-white px-5 py-2.5 text-sm font-semibold text-[#142B53] hover:bg-[#142B53] hover:text-white"
          >
            Ver recuerdos publicados
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-[#142B53]/15 bg-[#FCFBF7] p-6 sm:p-8 shadow-md space-y-6"
    >
      {/* Honeypot field hidden from human users */}
      <div className="sr-only" aria-hidden="true">
        <label htmlFor="website_hp">No llenar este campo</label>
        <input
          id="website_hp"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>

      {/* Submission Type Selector */}
      <div>
        <label className="block text-sm font-bold text-[#142B53] mb-2">
          ¿Qué deseas compartir hoy?
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { id: "both", label: "Fotografía + Relato" },
            { id: "story", label: "Solo Relato / Mensaje" },
            { id: "photo", label: "Solo Fotografía" },
          ].map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() =>
                setSubmissionType(opt.id as "story" | "photo" | "both")
              }
              className={`min-h-[44px] rounded-lg border px-4 py-2.5 text-sm font-semibold transition ${
                submissionType === opt.id
                  ? "border-[#A52728] bg-[#A52728] text-white shadow-xs"
                  : "border-[#142B53]/20 bg-[#F6F2E9] text-[#142B53] hover:bg-white"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Name & Class Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="submitterName"
            className="block text-sm font-bold text-[#142B53]"
          >
            Tu nombre completo *
          </label>
          <input
            id="submitterName"
            type="text"
            required
            value={submitterName}
            onChange={(e) => setSubmitterName(e.target.value)}
            placeholder="Ej. Juan Carlos Gómez"
            className="mt-1.5 w-full rounded-lg border border-[#142B53]/25 bg-white px-3.5 py-2.5 text-sm text-[#111827]"
          />
        </div>
        <div>
          <label
            htmlFor="graduationInfo"
            className="block text-sm font-bold text-[#142B53]"
          >
            Salón o referencia en 1996 *
          </label>
          <input
            id="graduationInfo"
            type="text"
            required
            value={graduationInfo}
            onChange={(e) => setGraduationInfo(e.target.value)}
            placeholder="Promoción 1996"
            className="mt-1.5 w-full rounded-lg border border-[#142B53]/25 bg-white px-3.5 py-2.5 text-sm text-[#111827]"
          />
        </div>
      </div>

      {/* Year & Category */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="yearSuggestion"
            className="block text-sm font-bold text-[#142B53]"
          >
            Álbum / Época correspondiente
          </label>
          <select
            id="yearSuggestion"
            value={yearSuggestion}
            onChange={(e) =>
              setYearSuggestion(Number(e.target.value) as 1996 | 2026)
            }
            className="mt-1.5 w-full rounded-lg border border-[#142B53]/25 bg-white px-3.5 py-2.5 text-sm text-[#111827]"
          >
            <option value={1996}>Archivo Histórico 1996</option>
            <option value={2026}>Reencuentro 2026 (30 Años)</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="categorySuggestion"
            className="block text-sm font-bold text-[#142B53]"
          >
            Categoría sugerida
          </label>
          <select
            id="categorySuggestion"
            value={categorySuggestion}
            onChange={(e) => setCategorySuggestion(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-[#142B53]/25 bg-white px-3.5 py-2.5 text-sm text-[#111827]"
          >
            <option value="Compañeros">Compañeros</option>
            <option value="Anuario">Anuario</option>
            <option value="Profesores">Profesores</option>
            <option value="Actividades">Actividades</option>
            <option value="Reencuentro">Reencuentro 2026</option>
            <option value="Recuerdos">Solo Recuerdo Escrito</option>
          </select>
        </div>
      </div>

      {/* Title & Story */}
      <div>
        <label
          htmlFor="memoryTitle"
          className="block text-sm font-bold text-[#142B53]"
        >
          Título del recuerdo o fotografía *
        </label>
        <input
          id="memoryTitle"
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ej. Excursión de último año o entrenamiento en las canchas"
          className="mt-1.5 w-full rounded-lg border border-[#142B53]/25 bg-white px-3.5 py-2.5 text-sm text-[#111827]"
        />
      </div>

      <div>
        <label
          htmlFor="messageContent"
          className="block text-sm font-bold text-[#142B53]"
        >
          Tu mensaje, anécdota o descripción *
        </label>
        <textarea
          id="messageContent"
          rows={4}
          required
          value={messageContent}
          onChange={(e) => setMessageContent(e.target.value)}
          placeholder="Escribe aquí la historia detrás de este momento o el mensaje para tus compañeros de la promoción 1996..."
          className="mt-1.5 w-full rounded-lg border border-[#142B53]/25 bg-white px-3.5 py-2.5 text-sm text-[#111827]"
        />
      </div>

      {/* Client-Side WebP Image Upload & EXIF Cleaner */}
      {(submissionType === "photo" || submissionType === "both") && (
        <div className="rounded-xl border-2 border-dashed border-[#142B53]/25 bg-[#F6F2E9]/60 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="flex items-center gap-2 text-sm font-bold text-[#142B53]">
                <ImagePlus className="h-4 w-4 text-[#A52728]" />
                <span>Subir Fotografía (Optimización WebP y limpieza EXIF)</span>
              </h3>
              <p className="mt-1 text-xs text-[#111827]/75">
                Generamos automáticamente una versión preview (1600px WebP) y
                miniatura (480px WebP) sin alterar tu archivo original en tu
                dispositivo.
              </p>
            </div>
            <label className="inline-flex min-h-[42px] cursor-pointer items-center gap-2 rounded-md bg-[#142B53] px-4 py-2 text-xs font-semibold text-[#F6F2E9] hover:bg-[#1B396E] shrink-0">
              <Upload className="h-4 w-4" />
              <span>Seleccionar imagen</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="sr-only"
              />
            </label>
          </div>

          {processingImage && (
            <div className="mt-4 flex items-center gap-2 text-xs font-medium text-[#142B53]">
              <Loader2 className="h-4 w-4 animate-spin text-[#A52728]" />
              <span>
                Limpiando metadatos EXIF y generando miniaturas WebP...
              </span>
            </div>
          )}

          {optimizedImage && (
            <div className="mt-4 flex flex-col sm:flex-row items-center gap-4 rounded-lg border border-[#142B53]/15 bg-white p-3">
              <div className="relative h-24 w-32 shrink-0 overflow-hidden rounded border border-[#142B53]/15">
                <Image
                  src={optimizedImage.thumbDataUrl}
                  alt="Vista previa optimizada"
                  fill
                  unoptimized
                  className="object-cover"
                />
              </div>
              <div className="text-xs space-y-1 flex-1">
                <p className="font-bold text-[#142B53]">
                  {optimizedImage.originalName} ({optimizedImage.width}×
                  {optimizedImage.height} px)
                </p>
                <p className="text-emerald-800 font-medium flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5" />
                  Preview WebP: {optimizedImage.previewSizeKb} KB · Miniatura
                  WebP: {optimizedImage.thumbSizeKb} KB · EXIF removido
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Explicit Consent & Privacy Checkboxes */}
      <div className="space-y-3 rounded-xl border border-[#142B53]/15 bg-[#F6F2E9] p-4 text-xs sm:text-sm text-[#111827]">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={consentPublic}
            onChange={(e) => setConsentPublic(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-[#142B53]"
          />
          <span>
            <strong>Consentimiento de publicación conmemorativa *:</strong>{" "}
            Autorizo al comité organizador de la Promoción 1996 a publicar este
            mensaje y/o fotografía en este portal una vez sea aprobado en
            moderación.
          </span>
        </label>

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={consentPrivacy}
            onChange={(e) => setConsentPrivacy(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-[#142B53]"
          />
          <span>
            <strong>Aviso de privacidad y derechos de imagen *:</strong> Declaro
            que el material compartido es respetuoso con mis compañeros y acepto
            la{" "}
            <Link
              href="/privacidad"
              className="font-semibold text-[#A52728] underline"
            >
              política de privacidad y retiro de contenido
            </Link>
            .
          </span>
        </label>

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={allowDownload}
            onChange={(e) => setAllowDownload(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-[#142B53]"
          />
          <span>
            Permitir que mis compañeros de promoción puedan descargar esta
            fotografía desde el visor de galería (opcional).
          </span>
        </label>
      </div>

      {errorMessage && (
        <div
          role="alert"
          className="rounded-lg border border-[#A52728] bg-[#A52728]/10 px-4 py-3 text-sm font-medium text-[#A52728]"
        >
          {errorMessage}
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <p className="flex items-center gap-1.5 text-xs text-[#111827]/70">
          <ShieldCheck className="h-4 w-4 text-[#142B53]" />
          Los envíos se guardan en cola privada (`pending-private`) antes de
          publicarse.
        </p>

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex min-h-[48px] w-full sm:w-auto items-center justify-center gap-2 rounded-md bg-[#A52728] px-8 py-3 text-base font-semibold text-white shadow-md transition hover:bg-[#8B1E1F] disabled:opacity-60"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Enviando a moderación...</span>
            </>
          ) : (
            <span>Enviar recuerdo para moderación</span>
          )}
        </button>
      </div>
    </form>
  );
}
