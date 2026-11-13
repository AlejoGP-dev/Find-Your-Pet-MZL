import type { Miga } from "@/components/Migas";
import { RESPONSABLE } from "./legal";
import { SITIO, urlAbsoluta } from "./seo";

/**
 * Constructores de JSON-LD.
 *
 * Regla que sigue este archivo: **solo schema honesto**. No existe un tipo
 * Schema.org para "mascota perdida", así que no se marca como `Product`,
 * `Offer` ni `Event` para pescar rich snippets — eso sería marcado engañoso y
 * arriesga una acción manual sobre el dominio. Se usa `WebPage` y ya.
 *
 * Tampoco se declara `Organization`: la propia página de términos dice que
 * esto no es una empresa ni una fundación. `Person` es lo correcto.
 */

const NOMBRE = "Find Your Pet CO";

/**
 * GEO-005: «Find Your Pet Colombia» es también el nombre de una tienda de GPS
 * para mascotas, y los motores de IA nos confundían con ella. Por eso no se
 * declara nombre alterno. Si algún día se quiere uno, va acá; `null` no pinta
 * el campo.
 */
const NOMBRE_ALTERNO: string | null = null;

/**
 * GEO-005: perfiles oficiales del proyecto, solo los que Alejo confirme por
 * escrito. Vacío no pinta `sameAs`. El Instagram personal del `publisher` no
 * es un perfil del proyecto y no va acá.
 */
const PERFILES_OFICIALES: string[] = [];

/** WebSite + SearchAction. El buscador del home ya acepta ?q=, no es inventado. */
export function sitioWeb() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: NOMBRE,
    ...(NOMBRE_ALTERNO ? { alternateName: NOMBRE_ALTERNO } : {}),
    url: `${SITIO}/`,
    inLanguage: "es-CO",
    // GEO-005: lo mismo que dice el pie de cada página.
    description:
      "Iniciativa ciudadana y gratuita para publicar y buscar mascotas perdidas y encontradas en Colombia. No vende productos.",
    ...(PERFILES_OFICIALES.length > 0 ? { sameAs: PERFILES_OFICIALES } : {}),
    publisher: {
      "@type": "Person",
      name: RESPONSABLE,
      url: "https://www.instagram.com/ialejog",
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITIO}/?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/** BreadcrumbList a partir del MISMO array que pinta <Migas>. */
export function migas(items: Miga[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((m, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: m.etiqueta,
      ...(m.href ? { item: urlAbsoluta(m.href) } : {}),
    })),
  };
}

/** CollectionPage + ItemList para los listados. */
export function coleccion({
  nombre,
  descripcion,
  ruta,
  elementos,
}: {
  nombre: string;
  descripcion: string;
  ruta: string;
  /** Exactamente las tarjetas que se están renderizando: si el JSON-LD y el
   *  HTML no coinciden, es peor que no tener JSON-LD. */
  elementos: { id: string; nombre: string }[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: nombre,
    description: descripcion,
    url: urlAbsoluta(ruta),
    inLanguage: "es-CO",
    isPartOf: { "@type": "WebSite", name: NOMBRE, url: `${SITIO}/` },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: elementos.length,
      itemListElement: elementos.map((e, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: e.nombre,
        url: urlAbsoluta(`/mascota/${e.id}`),
      })),
    },
  };
}

/** WebPage (+ ImageObject si hay foto) para una ficha. */
export function ficha({
  titulo,
  descripcion,
  ruta,
  foto,
  fotoAlt,
  publicado,
}: {
  titulo: string;
  descripcion: string;
  ruta: string;
  foto?: string | null;
  fotoAlt?: string;
  publicado?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: titulo,
    description: descripcion,
    url: urlAbsoluta(ruta),
    inLanguage: "es-CO",
    ...(publicado ? { datePublished: publicado } : {}),
    isPartOf: { "@type": "WebSite", name: NOMBRE, url: `${SITIO}/` },
    // Solo si hay foto: un ImageObject vacío es peor que ninguno.
    ...(foto
      ? {
          primaryImageOfPage: {
            "@type": "ImageObject",
            contentUrl: foto,
            ...(fotoAlt ? { caption: fotoAlt } : {}),
          },
        }
      : {}),
  };
}

/** Article para las guías de /consejos. */
export function articulo({
  titulo,
  descripcion,
  ruta,
  modificado,
}: {
  titulo: string;
  descripcion: string;
  ruta: string;
  /**
   * SEO-938: fecha ISO de la última revisión del contenido. Sin ella no se
   * emite `dateModified`. Tampoco hay `datePublished`: la fecha real de
   * publicación no se conoce y no se inventa (`D-38`).
   */
  modificado?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: titulo,
    description: descripcion,
    url: urlAbsoluta(ruta),
    inLanguage: "es-CO",
    ...(modificado ? { dateModified: modificado } : {}),
    author: { "@type": "Person", name: RESPONSABLE },
    publisher: { "@type": "Person", name: RESPONSABLE },
    isPartOf: { "@type": "WebSite", name: NOMBRE, url: `${SITIO}/` },
  };
}
