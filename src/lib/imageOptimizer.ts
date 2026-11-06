"use client";

export interface OptimizedImagePair {
  originalName: string;
  width: number;
  height: number;
  previewBlob: Blob;
  previewDataUrl: string;
  previewSizeKb: number;
  thumbBlob: Blob;
  thumbDataUrl: string;
  thumbSizeKb: number;
}

/**
 * Strips EXIF metadata by re-encoding through an HTML5 Canvas and generates:
 * 1) Preview WebP (max 1600px, quality ~0.78, target 250-450KB)
 * 2) Thumbnail WebP (max 480px, quality ~0.74, target 50-120KB)
 * Preserves the user's local original file untouched on their device.
 */
export async function processImageForFreeTier(
  file: File
): Promise<OptimizedImagePair> {
  if (!file.type.startsWith("image/")) {
    throw new Error("El archivo seleccionado no es una imagen válida.");
  }
  if (file.size > 15 * 1024 * 1024) {
    throw new Error("La imagen original supera el límite de 15 MB.");
  }

  const bitmap = await createImageBitmap(file);
  const origW = bitmap.width;
  const origH = bitmap.height;

  async function renderVariant(
    maxDim: number,
    quality: number
  ): Promise<{ blob: Blob; dataUrl: string; width: number; height: number }> {
    const scale = Math.min(1, maxDim / Math.max(origW, origH));
    const targetW = Math.max(1, Math.round(origW * scale));
    const targetH = Math.max(1, Math.round(origH * scale));

    const canvas = document.createElement("canvas");
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("No fue posible inicializar el procesador gráfico.");
    }
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(bitmap, 0, 0, targetW, targetH);

    const dataUrl = canvas.toDataURL("image/webp", quality);
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("Error al comprimir WebP"))),
        "image/webp",
        quality
      );
    });

    return { blob, dataUrl, width: targetW, height: targetH };
  }

  const preview = await renderVariant(1600, 0.78);
  const thumb = await renderVariant(480, 0.74);
  bitmap.close();

  return {
    originalName: file.name,
    width: preview.width,
    height: preview.height,
    previewBlob: preview.blob,
    previewDataUrl: preview.dataUrl,
    previewSizeKb: Math.round(preview.blob.size / 1024),
    thumbBlob: thumb.blob,
    thumbDataUrl: thumb.dataUrl,
    thumbSizeKb: Math.round(thumb.blob.size / 1024),
  };
}
