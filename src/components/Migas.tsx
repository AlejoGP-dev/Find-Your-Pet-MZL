import Link from "next/link";

export type Miga = {
  etiqueta: string;
  /** Sin href se pinta como texto: sirve para la página actual y para las
   *  ciudades que no tienen landing propia (Bogotá, por ejemplo). */
  href?: string;
};

/**
 * Migas de pan. El mismo array alimenta esto y el BreadcrumbList del JSON-LD
 * (ver lib/schema.ts), para que lo que ve la persona y lo que lee Google no se
 * puedan contradecir.
 */
export default function Migas({ items }: { items: Miga[] }) {
  return (
    // WPO-003 (hallazgo real): con `flex-wrap` las migas ocupaban 2 líneas con
    // la fuente de respaldo y 1 sola cuando cargaba Nunito. Ese reflujo movía
    // la página entera 26 px hacia arriba — CLS de 0,2537 en la ficha, más que
    // cualquier otra cosa del sitio. En una sola línea con recorte, el alto no
    // depende de qué fuente esté cargada.
    //
    // El texto completo sigue en el DOM: solo se recorta visualmente. Google y
    // los lectores de pantalla leen la etiqueta entera, igual que el
    // BreadcrumbList del JSON-LD, que sale de este mismo array.
    <nav
      aria-label="Ruta de navegación"
      className="mb-4 overflow-hidden text-sm text-stone-500"
    >
      <ol className="flex items-center gap-1.5 whitespace-nowrap">
        {items.map((m, i) => (
          <li key={`${m.etiqueta}-${i}`} className="flex min-w-0 items-center gap-1.5">
            {i > 0 && (
              <span aria-hidden="true" className="shrink-0 text-stone-300">
                ›
              </span>
            )}
            {m.href ? (
              <Link
                href={m.href}
                className="truncate font-semibold text-marca hover:underline"
              >
                {m.etiqueta}
              </Link>
            ) : (
              <span className="truncate font-semibold text-stone-700">{m.etiqueta}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
