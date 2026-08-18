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
    <nav aria-label="Ruta de navegación" className="mb-4 text-sm text-stone-500">
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((m, i) => (
          <li key={`${m.etiqueta}-${i}`} className="flex items-center gap-1.5">
            {i > 0 && (
              <span aria-hidden="true" className="text-stone-300">
                ›
              </span>
            )}
            {m.href ? (
              <Link href={m.href} className="font-semibold text-marca hover:underline">
                {m.etiqueta}
              </Link>
            ) : (
              <span className="font-semibold text-stone-700">{m.etiqueta}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
