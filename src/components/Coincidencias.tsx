import Image from "next/image";
import Link from "next/link";
import Icono from "@/components/Icono";
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
          ? "rounded-2xl border-2 border-amber-300 bg-amber-50 p-4 text-left sm:p-5"
          : "rounded-2xl border-2 border-amber-300 bg-amber-50 p-4 sm:p-5"
      }
    >
      <h2 className="text-base font-extrabold leading-snug text-stone-900 sm:text-lg">
        {titulo}{" "}
        <Icono nombre="buscar" className="h-[1em] w-[1em]" />
      </h2>
      <p className="mt-1 text-sm text-stone-700">{bajada}</p>

      <div className="mt-4 grid gap-2.5 sm:grid-cols-2 sm:gap-3">
        {lista.map(({ reporte, puntaje, razones }) => {
          const especie = ESPECIES.find((e) => e.valor === reporte.especie);
          return (
            <Link
              key={reporte.id}
              href={`/mascota/${reporte.id}`}
              // min-w-0: sin esto la celda del grid toma el ancho mínimo del
              // contenido y la tarjeta se sale de la pantalla en 320 px.
              className="flex min-w-0 items-start gap-3 rounded-xl border border-stone-200 bg-white p-2.5 transition hover:border-marca hover:shadow-sm sm:p-3"
            >
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-stone-100 sm:h-20 sm:w-20">
                {reporte.foto_url ? (
                  <Image
                    src={reporte.foto_url}
                    alt={reporte.nombre ?? "Mascota"}
                    fill
                    sizes="(min-width: 640px) 80px, 64px"
                    quality={60}
                    className="object-cover"
                  />
                ) : (
                  <span className="grid h-full w-full place-items-center opacity-40">
                    <Icono nombre={especie?.icono ?? "huella"} className="h-8 w-8" />
                  </span>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="flex items-baseline gap-2">
                  <span className="min-w-0 truncate font-extrabold leading-tight text-stone-900">
                    {reporte.nombre || `${especie?.etiqueta ?? "Mascota"} sin nombre`}
                  </span>
                  <span className="shrink-0 rounded-full bg-marca-suave px-2 py-0.5 text-xs font-bold tabular-nums text-marca-oscuro">
                    {puntaje}%
                  </span>
                </p>
                {/* Barrio y fecha en renglones aparte: un barrio largo ya no
                    se come la fecha en pantallas angostas. */}
                <p className="mt-0.5 truncate text-sm leading-snug text-stone-600">
                  {reporte.barrio}{" "}
                  <Icono
                    nombre="ubicacion"
                    className="h-[1em] w-[1em]"
                  />
                </p>
                <p className="text-xs leading-snug text-stone-500">
                  {formatearFecha(reporte.fecha)}
                </p>
                {razones.length > 0 && (
                  // Cada razón como pastilla: el texto ya no se parte a la mitad.
                  <ul className="mt-1.5 flex flex-wrap gap-1">
                    {razones.map((razon) => (
                      <li
                        key={razon}
                        className="rounded-full bg-marca-suave px-2 py-0.5 text-[11px] font-bold leading-tight text-marca-oscuro"
                      >
                        {razon}
                      </li>
                    ))}
                  </ul>
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
