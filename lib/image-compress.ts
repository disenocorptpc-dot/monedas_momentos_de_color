/**
 * Compresión de imágenes en el navegador antes de subir a Supabase Storage
 * Objetivo: Reducir evidencias fotográficas a <=1600px en formato WebP (calidad 0.82)
 * Ahorro: ~77 MB/año vs ~1 GB sin comprimir.
 */
export async function comprimirImagen(file: File): Promise<{ blob: Blob; dataUrl: string; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const MAX = 1600;
        let width = img.width;
        let height = img.height;

        if (width > MAX || height > MAX) {
          if (width > height) {
            height = Math.round((height * MAX) / width);
            width = MAX;
          } else {
            width = Math.round((width * MAX) / height);
            height = MAX;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("No se pudo obtener el contexto 2D del canvas"));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Error al convertir la imagen a Blob"));
              return;
            }
            const dataUrl = canvas.toDataURL("image/webp", 0.82);
            resolve({ blob, dataUrl, width, height });
          },
          "image/webp",
          0.82
        );
      };
      img.onerror = () => reject(new Error("Error al cargar la imagen para compresión"));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Error al leer el archivo de imagen"));
    reader.readAsDataURL(file);
  });
}
