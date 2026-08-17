/**
 * Datos de contacto y textos legales en un solo lugar. Si el número cambia,
 * se cambia acá y no en ocho archivos.
 */

/** Persona natural detrás del proyecto y responsable del tratamiento. */
export const RESPONSABLE = "Alejandro Grajales";

/** Formato internacional sin signos, como lo pide wa.me. */
export const WHATSAPP_SOPORTE = "573148148380";

/** Como se lee en Colombia, para mostrarlo en pantalla. */
export const WHATSAPP_SOPORTE_VISIBLE = "314 814 8380";

/** Fecha de la última actualización de los documentos legales. */
export const ACTUALIZADO = "17 de agosto de 2026";

/**
 * Enlace a WhatsApp con el mensaje ya escrito. Le ahorra a la persona tener
 * que explicar de dónde viene, y a nosotros nos llega el contexto.
 */
export function enlaceSoporte(mensaje?: string): string {
  const texto =
    mensaje ??
    "Hola, quiero reportar un problema en Find Your Pet CO:";
  return `https://wa.me/${WHATSAPP_SOPORTE}?text=${encodeURIComponent(texto)}`;
}

/** Motivos frecuentes, para que el mensaje llegue ya clasificado. */
export const MOTIVOS_SOPORTE = [
  {
    titulo: "Quiero borrar o corregir un reporte",
    detalle: "Publicaste algo con un error, o tu mascota ya apareció y perdiste el código.",
    mensaje:
      "Hola, quiero borrar o corregir un reporte que publiqué en Find Your Pet CO. El enlace es:",
  },
  {
    titulo: "Alguien publicó mis datos sin permiso",
    detalle: "Tu nombre, tu teléfono o una foto tuya salieron en un reporte que no hiciste.",
    mensaje:
      "Hola, alguien publicó datos míos sin mi permiso en Find Your Pet CO. El enlace es:",
  },
  {
    titulo: "Un reporte parece falso o es una estafa",
    detalle: "Te pidieron plata por adelantado o el reporte no cuadra.",
    mensaje:
      "Hola, quiero reportar un aviso que parece falso o una estafa en Find Your Pet CO. El enlace es:",
  },
  {
    titulo: "La página no me funciona",
    detalle: "No carga, no deja publicar o algo se ve raro en tu celular.",
    mensaje:
      "Hola, tengo un problema técnico con Find Your Pet CO. Lo que me pasa es:",
  },
] as const;
