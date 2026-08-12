import Link from "next/link";
import type { Coincidencia } from "@/lib/coincidencias";
import { ESPECIES, formatearFecha, type TipoReporte } from "@/lib/tipos";

export default function Coincidencias({
  lista,
  tipo,
  compacto = false,
}: {
  lista: Coincidencia[];
  tipo: TipoReporte;
  compacto?: boolean;
}) {
  if (lista.length === 0) return null;

  const titulo =
    tipo === "perdida"
      ? "¿Será alguna de estas?"
      : "¿Alguna de estas familias la estará buscando?";
  const bajada =
    tipo === "perdida"
      ? "Mascotas encontradas que se parecen a la tuya. Revísalas con calma y escribe si crees que es."
      : "Mascotas perdidas que se parecen a la que encontraste. Si crees que es, escríbele a la familia.";

  return (
    <section
      className={
        compacto
          ? "rounded-2xl border-2 border-amber-300 bg-amber-50 p-5 text-left"
          : "rounded-2xl border-2 border-amber-300 bg-amber-50 p-5"
      }
    >
      <h2 className="text-lg font-extrabold text-stone-900">🔎 {titulo}</h2>
      <p className="mt-1 text-sm text-stone-700">{bajada}</p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {lista.map(({ reporte, puntaje, razones }) => {
          const especie = ESPECIES.find((e) => e.valor === reporte.especie);
          return (
            <Link
              key={reporte.id}
              href={`/mascota/${reporte.id}`}
              className="flex gap-3 rounded-xl border border-stone-200 bg-white p-3 transition hover:border-marca hover:shadow-sm"
            >
              <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-stone-100">
                {reporte.foto_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={reporte.foto_url}
                    alt={reporte.nombre ?? "Mascota"}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <span className="grid h-full w-full place-items-center text-3xl opacity-40">
                    {especie?.emoji ?? "🐾"}
                  </span>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2">
                  <span className="truncate font-extrabold text-stone-900">
                    {reporte.nombre || `${especie?.etiqueta ?? "Mascota"} sin nombre`}
                  </span>
                  <span className="shrink-0 rounded-full bg-marca-suave px-2 py-0.5 text-xs font-bold text-marca-oscuro">
                    {puntaje}%
                  </span>
                </p>
                <p className="truncate text-sm text-stone-600">
                  📍 {reporte.barrio} · {formatearFecha(reporte.fecha)}
                </p>
                {razones.length > 0 && (
                  <p className="mt-1 text-xs font-semibold text-marca">
                    {razones.join(" · ")}
                  </p>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      <p className="mt-3 text-xs text-stone-600">
        Esto lo sugiere el sitio comparando especie, zona, fechas y color. Puede
        equivocarse — confirma siempre con la persona antes de mover a la mascota.
      </p>
    </section>
  );
}
