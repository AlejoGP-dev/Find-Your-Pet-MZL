import type { Punto } from "./coordenadas";

/**
 * Cálculos de distancia para el filtro «cerca de mí».
 *
 * Este módulo NO importa la tabla de coordenadas de municipios a propósito:
 * viaja al navegador dentro del componente de cercanía, y no tiene por qué
 * arrastrar 130 municipios que solo necesita el servidor.
 */

export type { Punto };

const RADIO_TIERRA_KM = 6371;

/** Distancia en línea recta entre dos puntos, en kilómetros (haversine). */
export function distanciaKm(a: Punto, b: Punto): number {
  const aRad = (grados: number) => (grados * Math.PI) / 180;
  const dLat = aRad(b.lat - a.lat);
  const dLng = aRad(b.lng - a.lng);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(aRad(a.lat)) * Math.cos(aRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * RADIO_TIERRA_KM * Math.asin(Math.min(1, Math.sqrt(s)));
}

/** «350 m», «1,2 km», «14 km». En español, con coma decimal. */
export function formatearDistancia(km: number): string {
  if (km < 1) {
    const metros = Math.round(km * 1000);
    // Por debajo de 100 m la cifra exacta da una falsa sensación de precisión.
    return metros < 100 ? "menos de 100 m" : `${Math.round(metros / 50) * 50} m`;
  }
  if (km < 10) return `${km.toFixed(1).replace(".", ",")} km`;
  return `${Math.round(km)} km`;
}

/**
 * Redondea una coordenada a 3 decimales: unos 110 metros.
 *
 * Es el punto medio entre las dos cosas que importan. Con la coordenada exacta
 * estaríamos publicando la puerta de la casa de alguien en una página abierta
 * a todo el mundo —y quien reporta una mascota perdida casi siempre la perdió
 * cerca de donde vive—. Con menos precisión el filtro por cercanía deja de
 * distinguir un barrio de otro y no sirve para nada.
 */
export function redondearCoordenada(valor: number): number {
  return Math.round(valor * 1000) / 1000;
}

/**
 * Colombia continental e insular, con margen.
 *
 * Cualquier coordenada fuera de esto es un error de captura o alguien jugando
 * con el formulario, y no tiene sentido guardarla.
 */
export function dentroDeColombia(p: Punto): boolean {
  return p.lat >= -4.5 && p.lat <= 13.5 && p.lng >= -82 && p.lng <= -66.5;
}

/** Los radios que ofrece el filtro, en kilómetros. */
export const RADIOS = [2, 5, 10, 25, 50] as const;
export type Radio = (typeof RADIOS)[number];
export const RADIO_POR_DEFECTO: Radio = 5;

/** Cómo se obtuvo la ubicación de un reporte. */
export type PrecisionUbicacion = "exacta" | "ciudad";
