import { MUNICIPIOS, municipioPorNombre, municipioPorSlug } from "./municipios";
import { CIUDADES, type Ciudad } from "./tipos";

/**
 * Resolución de ciudades para todo el país.
 *
 * Vive aparte de `tipos.ts` a propósito: este módulo arrastra los 1.121
 * municipios (9 KB gzip) y `tipos.ts` viaja a casi todos los chunks del
 * navegador. Solo lo importa quien de verdad necesita el país completo — el
 * formulario de publicar y el servidor.
 *
 * Las 8 ciudades del catálogo original siguen mandando: tienen lista de
 * barrios propia y sus URLs llevan meses publicadas.
 */

/** Ciudad del catálogo (con barrios) o municipio del país (sin barrios). */
export function resolverPorSlug(slug: string): Ciudad | null {
  const delCatalogo = CIUDADES.find((c) => c.slug === slug);
  if (delCatalogo) return delCatalogo;

  const m = municipioPorSlug(slug);
  if (!m) return null;
  return { slug: m.slug, nombre: m.nombre, departamento: m.departamento, barrios: [] };
}

export function resolverPorNombre(nombre: string): Ciudad | null {
  const sinTilde = nombre
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
  const delCatalogo = CIUDADES.find(
    (c) =>
      c.nombre
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .toLowerCase() === sinTilde,
  );
  if (delCatalogo) return delCatalogo;

  const m = municipioPorNombre(nombre);
  if (!m) return null;
  return { slug: m.slug, nombre: m.nombre, departamento: m.departamento, barrios: [] };
}

/**
 * El nombre oficial del municipio, si lo reconoce.
 *
 * Esto es lo que arregla el problema de raíz: hasta ahora «Bogotá» y «Bogota»
 * se guardaban como dos ciudades distintas porque nadie las comparaba contra
 * una lista oficial. Ahora las dos caen en «Bogotá».
 */
export function nombreOficial(texto: string): string | null {
  const limpio = texto.replace(/\s+/g, " ").trim();
  if (!limpio) return null;

  // «Quimbaya, Quindío» o «Cali - Valle»: la gente escribe el departamento
  // pegado. Se prueba primero completo y después solo la primera parte.
  const candidatos = [limpio, limpio.split(/\s*[,\-–/(]\s*/)[0]?.trim()].filter(
    Boolean,
  ) as string[];

  for (const c of candidatos) {
    const encontrado = resolverPorNombre(c);
    if (encontrado) return encontrado.nombre;
  }
  return null;
}

/** Para mostrar: «Manizales, Caldas», pero «Bogotá» sin repetirse. */
export function conDepartamento(ciudad: Ciudad): string {
  return ciudad.departamento && ciudad.departamento !== ciudad.nombre
    ? `${ciudad.nombre}, ${ciudad.departamento}`
    : ciudad.nombre;
}

/** Cuántos municipios hay, para textos del tipo «los 1.121 municipios». */
export const TOTAL_MUNICIPIOS = MUNICIPIOS.length;

/**
 * Cómo se guarda la ciudad en la base.
 *
 * Antes esto vivía en `tipos.ts` y solo reconocía 8 ciudades más una lista de
 * alias escrita a mano; cualquier otra cosa se guardaba tal cual, y por eso
 * hoy conviven «Bogotá» y «Bogota» como si fueran ciudades distintas. Ahora se
 * compara contra los 1.121 municipios oficiales.
 *
 * Si no se reconoce, se respeta lo que escribió la persona (con la inicial en
 * mayúscula): es preferible un reporte con la ciudad rara a un reporte
 * rechazado. Esas ciudades no salen en los filtros ni tienen landing.
 */
export function canonicalizarCiudadNacional(texto: string): string {
  const limpio = texto.replace(/\s+/g, " ").trim();
  if (!limpio) return "";
  return nombreOficial(limpio) ?? limpio.charAt(0).toUpperCase() + limpio.slice(1);
}

/** Ciudad con su conteo, para los filtros y los chips de navegación. */
export type CiudadConReportes = {
  nombre: string;
  /** null cuando el nombre no corresponde a ningún municipio conocido. */
  slug: string | null;
  departamento: string | null;
  reportes: number;
};

/**
 * Convierte el conteo por ciudad en la lista que ven los filtros.
 *
 * Ordena por cantidad de reportes: quien entra desde Manizales, que es donde
 * está el grueso, la encuentra de primeras.
 */
export function ciudadesDesdeConteo(
  conteo: Record<string, number>,
  minimo = 1,
): CiudadConReportes[] {
  return Object.entries(conteo)
    .filter(([, n]) => n >= minimo)
    .map(([nombre, reportes]) => {
      const c = resolverPorNombre(nombre);
      return {
        nombre,
        slug: c?.slug ?? null,
        departamento: c?.departamento ?? null,
        reportes,
      };
    })
    .sort((a, b) => b.reportes - a.reportes || a.nombre.localeCompare(b.nombre, "es"));
}
