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

/**
 * MAIL-006 — El correo público del proyecto.
 *
 * Es la cuenta de cara al público, no la administrativa: `admin@` administra
 * Zoho, el DNS y los usuarios, y por eso no se publica nunca (ver
 * claude/CORREO-CORPORATIVO.md). Si esta dirección entra a listas de spam, se
 * cambia el alias y ya — la que controla el dominio no se toca.
 *
 * Hasta ahora el único canal visible era WhatsApp, y hay gente que no escribe
 * por WhatsApp a un desconocido: una fundación que quiere aparecer en /ayudar,
 * un periodista, alguien que prefiere dejar constancia por escrito.
 */
export const CORREO_PUBLICO = "contacto@find-your-pet.co";

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

/**
 * FEATURE-003 — «¿Perdiste tu código?»
 *
 * El `token_gestion` se muestra una sola vez, al publicar, y no se guarda en
 * ningún lado. Si se pierde, el dueño no puede marcar su reporte como resuelto:
 * una mascota que ya volvió a casa se queda publicada como perdida para
 * siempre, y el sitio sigue pidiéndole a la gente que la busque.
 *
 * La salida NO es automática, y es a propósito. Sin correo ni teléfono
 * verificado, cualquier recuperación automática sería adivinar quién pide — y
 * entregarle el código a quien no es permite marcar como resuelta una mascota
 * que sigue perdida, o sea apagar su búsqueda. Con 151 reportes, una persona lo
 * resuelve en dos minutos y con criterio.
 *
 * Por eso esto es solo un enlace que arma el mensaje. No guarda nada, no
 * registra nada, no manda nada automático.
 *
 * **El `{id}` en el enlace es lo que hace que esto funcione**: sin él, quien
 * atiende tiene que buscar a mano entre todas las fichas.
 *
 * Va por WhatsApp y no por correo porque el número del reporte ES la identidad:
 * ya está en la base de datos, lo puso el dueño al publicar, y si escribe desde
 * ese mismo número la prueba es inmediata. Un correo no se puede cotejar contra
 * nada. La última línea del mensaje se la dice a la persona de antemano, para
 * que escriba desde el número correcto y no haya que pedírselo después.
 *
 * Cómo se verifica y qué hacer si escribe desde otro número está en
 * claude/OPERACION.md, no acá: es criterio de quien atiende, no código.
 */
export function enlaceCodigoPerdido(datos: {
  nombre: string | null;
  ciudad: string;
  url: string;
}): string {
  return enlaceSoporte(
    [
      "Hola, perdí el código de gestión de mi reporte.",
      "",
      `Mascota: ${datos.nombre || "Sin nombre"}`,
      `Ciudad: ${datos.ciudad}`,
      `Enlace: ${datos.url}`,
      "",
      "Estoy escribiendo desde el mismo WhatsApp con el que publiqué el reporte.",
    ].join("\n"),
  );
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
