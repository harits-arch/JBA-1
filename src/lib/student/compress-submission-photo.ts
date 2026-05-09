const TARGET_MAX_BYTES = 200 * 1024;
const JPEG_QUALITIES = [0.82, 0.72, 0.62, 0.52, 0.42, 0.35] as const;
const MAX_LONG_EDGES = [1600, 1280, 1024, 800, 640, 520, 400] as const;

function stripExtension(name: string) {
  return name.replace(/\.[^.]+$/, "") || "photo";
}

async function loadImageBitmap(file: File): Promise<ImageBitmap> {
  try {
    return await createImageBitmap(file);
  } catch {
    return await new Promise<ImageBitmap>((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        createImageBitmap(img)
          .then((bitmap) => {
            URL.revokeObjectURL(url);
            resolve(bitmap);
          })
          .catch((err) => {
            URL.revokeObjectURL(url);
            reject(err);
          });
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("Tidak bisa membaca gambar."));
      };
      img.src = url;
    });
  }
}

function canvasToJpegBlob(
  canvas: HTMLCanvasElement,
  quality: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Kompresi gagal."));
          return;
        }
        resolve(blob);
      },
      "image/jpeg",
      quality
    );
  });
}

/**
 * Resize and re-encode student submission photos in the browser so uploads
 * stay near ~200KB instead of multi‑MB camera originals.
 */
export async function compressSubmissionPhoto(file: File): Promise<File> {
  if (
    file.size > 0 &&
    file.size <= TARGET_MAX_BYTES &&
    file.type === "image/jpeg"
  ) {
    return file;
  }

  if (typeof document === "undefined") {
    return file;
  }

  const bitmap = await loadImageBitmap(file);

  try {
    const baseName = stripExtension(file.name);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Peramban tidak mendukung kompresi gambar.");
    }

    for (const maxEdge of MAX_LONG_EDGES) {
      const scale = Math.min(
        1,
        maxEdge / Math.max(bitmap.width, bitmap.height)
      );
      const w = Math.max(1, Math.round(bitmap.width * scale));
      const h = Math.max(1, Math.round(bitmap.height * scale));

      canvas.width = w;
      canvas.height = h;
      ctx.drawImage(bitmap, 0, 0, w, h);

      for (const quality of JPEG_QUALITIES) {
        const blob = await canvasToJpegBlob(canvas, quality);
        if (blob.size <= TARGET_MAX_BYTES) {
          return new File([blob], `${baseName}.jpg`, {
            type: "image/jpeg",
            lastModified: Date.now()
          });
        }
      }
    }

    const scale = Math.min(1, 360 / Math.max(bitmap.width, bitmap.height));
    const w = Math.max(1, Math.round(bitmap.width * scale));
    const h = Math.max(1, Math.round(bitmap.height * scale));
    canvas.width = w;
    canvas.height = h;
    ctx.drawImage(bitmap, 0, 0, w, h);
    const blob = await canvasToJpegBlob(canvas, 0.32);
    return new File([blob], `${baseName}.jpg`, {
      type: "image/jpeg",
      lastModified: Date.now()
    });
  } finally {
    bitmap.close();
  }
}
