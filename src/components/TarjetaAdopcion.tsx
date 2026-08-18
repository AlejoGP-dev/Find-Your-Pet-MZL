import Image from "next/image";
import Link from "next/link";
import {
  EDADES,
  ESPECIES_ADOPCION,
  etiquetaAdopcion,
  type Adopcion,
} from "@/lib/adopciones";
import { SEXOS, TAMANOS, etiquetaDe } from "@/lib/tipos";

export default function TarjetaAdopcion({
  adopcion,
  mostrarCiudad = false,
  prioridad = false,
}: {
  adopcion: Adopcion;
  mostrarCiudad?: boolean;
  /** Las primeras tarjetas del listado son el LCP: no deben ir en lazy. */
  prioridad?: boolean;
}) {
  const especie = ESPECIES_ADOPCION.find((e) => e.valor === adopcion.especie);
  const detalles = [
    etiquetaAdopcion(EDADES, adopcion.edad),
    adopcion.raza,
    adopcion.color,
    etiquetaDe(TAMANOS, adopcion.tamano),
    etiquetaDe(SEXOS, adopcion.sexo) === "No sé" ? null : etiquetaDe(SEXOS, adopcion.sexo),
  ].filter(Boolean);

  return (
    <article className="h-full">
    <Link
      href={`/adopcion/mascota/${adopcion.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-marca/40 hover:shadow-md"
    >
      <div className="relative aspect-4/3 w-full overflow-hidden bg-stone-100">
        {adopcion.foto_url ? (
          <Image
            src={adopcion.foto_url}
            alt={adopcion.nombre ? `Foto de ${adopcion.nombre}` : "Foto de la mascota"}
            fill
            sizes="(min-width: 640px) 240px, 46vw"
            quality={65}
            priority={prioridad}
            loading={prioridad ? "eager" : "lazy"}
            // Explícito: `priority` por sí solo no siempre emite el atributo,
            // y es justo el que le dice al navegador qué bajar primero.
            fetchPriority={prioridad ? "high" : "auto"}
            className="object-cover transition duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="grid h-full w-full place-items-center text-5xl opacity-40">
            {especie?.emoji ?? "🐾"}
          </div>
        )}

        <div className="absolute inset-x-2 top-2 flex flex-wrap items-start gap-1">
          {adopcion.estado === "disponible" && (
            <span className="rounded-full bg-marca-suave px-3 py-1 text-xs font-bold uppercase tracking-wide text-marca-oscuro">
              En adopción
            </span>
          )}
          {adopcion.estado === "reservado" && (
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-amber-900">
              Reservado
            </span>
          )}
          {adopcion.es_fundacion && (
            <span className="rounded-full bg-white/95 px-2 py-1 text-xs font-bold text-marca-oscuro shadow-sm">
              Fundación 🏛️
            </span>
          )}
        </div>

        {adopcion.estado === "adoptado" && (
          <div className="absolute inset-0 grid place-items-center bg-encontrada/80">
            <span className="rounded-full bg-white px-4 py-2 text-sm font-extrabold text-encontrada">
              ¡Ya tiene hogar! 🎉
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="text-lg font-extrabold leading-tight text-stone-900">
          {adopcion.nombre || `${especie?.etiqueta ?? "Mascota"} sin nombre`}
        </h3>
        {detalles.length > 0 && (
          <p className="text-sm text-stone-600">{detalles.join(" · ")}</p>
        )}
        <p className="mt-auto pt-2 text-sm font-semibold text-marca">
          {adopcion.barrio}
          {mostrarCiudad && adopcion.ciudad ? `, ${adopcion.ciudad}` : ""} 📍
        </p>
      </div>
    </Link>
    </article>
  );
}
