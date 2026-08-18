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

/** WebSite + SearchAction. El buscador del home ya acepta ?q=, no es inventado. */
export function sitioWeb() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: NOMBRE,
    alternateName: "Find Your Pet Colombia",
    url: `${SITIO}/`,
    inLanguage: "es-CO",
    description:
      "Plataforma comunitaria para reportar mascotas perdidas y encontradas en Colombia.",
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
}: {
  titulo: string;
  descripcion: string;
  ruta: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: titulo,
    description: descripcion,
    url: urlAbsoluta(ruta),
    inLanguage: "es-CO",
    author: { "@type": "Person", name: RESPONSABLE },
    publisher: { "@type": "Person", name: RESPONSABLE },
    isPartOf: { "@type": "WebSite", name: NOMBRE, url: `${SITIO}/` },
  };
}
