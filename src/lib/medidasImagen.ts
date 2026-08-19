/**
 * Mide una imagen ya comprimida, justo antes de subirla.
 *
 * WPO-003 — El servidor necesita el ancho y el alto para reservarle el sitio
 * exacto a la foto en la ficha. Sin ese dato hay que fijar una proporción
 * única para todas y las horizontales quedan con franjas grises.
 *
 * Nunca lanza: si el navegador no puede medirla, devuelve null y la ficha
 * cae a la proporción de respaldo. Medir es una mejora, no un requisito para
 * publicar — nadie puede quedarse sin reportar a su mascota por esto.
 */
export type Medidas = { ancho: number; alto: number };

export async function medidasDe(archivo: File): Promise<Medidas | null> {
  // Camino rápido y sin DOM.
  try {
    if (typeof createImageBitmap === "function") {
      const bmp = await createImageBitmap(archivo);
      const m = { ancho: bmp.width, alto: bmp.height };
      bmp.close?.();
      if (m.ancho > 0 && m.alto > 0) return m;
    }
  } catch {
    /* Android viejo, HEIC: seguimos con el respaldo */
  }

  // Respaldo con <img>, que traga formatos que createImageBitmap rechaza.
  return new Promise((resolver) => {
    const url = URL.createObjectURL(archivo);
    const img = new Image();
    const terminar = (m: Medidas | null) => {
      URL.revokeObjectURL(url);
      resolver(m);
    };
    img.onload = () =>
      terminar(
        img.naturalWidth > 0 && img.naturalHeight > 0
          ? { ancho: img.naturalWidth, alto: img.naturalHeight }
          : null,
      );
    img.onerror = () => terminar(null);
    img.src = url;
  });
}

/**
 * Añade las medidas al formulario si se pudieron obtener.
 *
 * Los límites replican el CHECK de la base (supabase/06-medidas-foto.sql):
 * si acá se cuela un valor absurdo, el INSERT falla entero y la persona
 * pierde el reporte. Mejor mandar nada que mandar basura.
 */
export async function agregarMedidas(datos: FormData, archivo: File): Promise<void> {
  const m = await medidasDe(archivo).catch(() => null);
  if (!m) return;
  if (m.ancho < 1 || m.alto < 1 || m.ancho > 20000 || m.alto > 20000) return;
  datos.append("foto_ancho", String(m.ancho));
  datos.append("foto_alto", String(m.alto));
}

/**
 * Lee las medidas que mandó el navegador, del lado del servidor.
 *
 * Se validan acá y no solo en el cliente porque el endpoint es público:
 * cualquiera puede mandar `foto_ancho=0` y dejar la ficha con una caja
 * imposible, o disparar el CHECK de la base y tumbar el INSERT entero.
 */
export function leerMedidas(form: FormData): { foto_ancho: number | null; foto_alto: number | null } {
  const n = (clave: string): number | null => {
    const v = Number(form.get(clave));
    return Number.isInteger(v) && v >= 1 && v <= 20000 ? v : null;
  };
  const ancho = n("foto_ancho");
  const alto = n("foto_alto");
  // Los dos o ninguno: media medida no sirve para reservar nada.
  return ancho && alto ? { foto_ancho: ancho, foto_alto: alto } : { foto_ancho: null, foto_alto: null };
}
