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

/**
 * BUG-002 — Lo que ve quien escribe algo que no es un municipio. Es el mismo en
 * el formulario y en la API, para que nadie reciba dos explicaciones distintas.
 */
export const MENSAJE_CIUDAD =
  "Elige tu municipio de la lista. El barrio, la vereda o el corregimiento van en el campo de abajo.";

/**
 * Formas de escribir un municipio que no coinciden con su nombre en el catálogo
 * y que la gente usa de verdad. Se rechazarían desde BUG-002, así que hay que
 * reconocerlas: nadie escribe «San José de Cúcuta». Quien pone el departamento
 * detrás lo cubre `nombreOficial`, y si no lleva separador, la sugerencia de
 * `municipioAlInicio`.
 */
const VARIANTES: Record<string, string> = {
  "villa maria": "Villamaría",
  "dos quebradas": "Dosquebradas",
  "santiago de cali": "Cali",
  "bogota dc": "Bogotá",
  "bogota d c": "Bogotá",
  "santa fe de bogota": "Bogotá",
  "santafe de bogota": "Bogotá",
  cartagena: "Cartagena de Indias",
  cucuta: "San José de Cúcuta",
  buga: "Guadalajara de Buga",
  tumaco: "San Andrés de Tumaco",
  mariquita: "San Sebastián de Mariquita",
  mompox: "Santa Cruz de Mompox",
  mompos: "Santa Cruz de Mompox",
  tolu: "Santiago de Tolú",
  ubate: "Villa de San Diego de Ubaté",
  since: "San Luis de Sincé",
  guican: "Güicán de la Sierra",
  piendamo: "Piendamó – Tunía",
  "piendamo tunia": "Piendamó – Tunía",
  sotara: "Sotará Paispamba",
  miriti: "Mirití – Paraná",
  "miriti parana": "Mirití – Paraná",
};

function claveVariante(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

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
    const encontrado = resolverPorNombre(VARIANTES[claveVariante(c)] ?? c);
    if (encontrado) return encontrado.nombre;
  }
  return null;
}

/**
 * El municipio con el que arranca un texto que, completo, no es un municipio.
 * Es solo para sugerirlo: de los primeros reportes mal diligenciados, 3 de 5
 * empezaban por un municipio real y seguían con el barrio o el departamento.
 * Nunca se guarda sin que la persona lo confirme.
 */
export function municipioAlInicio(texto: string): string | null {
  const palabras = texto.replace(/\s+/g, " ").trim().split(" ");
  for (let n = Math.min(palabras.length, 6); n >= 1; n--) {
    const encontrado = nombreOficial(palabras.slice(0, n).join(" "));
    if (encontrado) return encontrado;
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
 * Si no se reconoce devuelve vacío y la API rechaza el reporte (BUG-002). Antes
 * se guardaba lo que hubiera escrito la persona, y este texto sale en el
 * `<title>` y en el JSON-LD de una ficha indexable: un campo libre ahí terminó
 * publicando direcciones. Además, sin municipio el reporte no tiene coordenadas,
 * así que tampoco salía en los filtros ni entraba al cruce de coincidencias.
 * Decisión de Alejo: un reporte sin municipio no sirve para buscar a nadie.
 */
export function canonicalizarCiudadNacional(texto: string): string {
  return nombreOficial(texto) ?? "";
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
