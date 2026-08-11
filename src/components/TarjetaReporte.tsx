import Link from "next/link";
import {
  ESPECIES,
  SEXOS,
  TAMANOS,
  etiquetaDe,
  formatearFecha,
  type Reporte,
} from "@/lib/tipos";

export function InsigniaTipo({ tipo }: { tipo: Reporte["tipo"] }) {
  const esPerdida = tipo === "perdida";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${
        esPerdida
          ? "bg-perdida-suave text-perdida"
          : "bg-encontrada-suave text-encontrada"
      }`}
    >
      {esPerdida ? "Se perdió" : "La encontraron"}
    </span>
  );
}

export default function TarjetaReporte({ reporte }: { reporte: Reporte }) {
  const especie = ESPECIES.find((e) => e.valor === reporte.especie);
  const detalles = [
    reporte.raza,
    reporte.color,
    etiquetaDe(TAMANOS, reporte.tamano),
    etiquetaDe(SEXOS, reporte.sexo) === "No sé" ? null : etiquetaDe(SEXOS, reporte.sexo),
  ].filter(Boolean);

  return (
    <Link
      href={`/mascota/${reporte.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-marca/40 hover:shadow-md"
    >
      <div className="relative aspect-4/3 w-full overflow-hidden bg-stone-100">
        {reporte.foto_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={reporte.foto_url}
            alt={reporte.nombre ? `Foto de ${reporte.nombre}` : "Foto de la mascota"}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
            loading="lazy"
          />
        ) : (
          <div className="grid h-full w-full place-items-center text-5xl opacity-40">
            {especie?.emoji ?? "🐾"}
          </div>
        )}
        {reporte.estado === "activo" && (
          <div className="absolute left-3 top-3">
            <InsigniaTipo tipo={reporte.tipo} />
          </div>
        )}
        {reporte.estado === "resuelto" && (
          <div className="absolute inset-0 grid place-items-center bg-encontrada/80">
            <span className="rounded-full bg-white px-4 py-2 text-sm font-extrabold text-encontrada">
              ¡Ya está en casa! 🎉
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="text-lg font-extrabold leading-tight text-stone-900">
          {reporte.nombre || `${especie?.etiqueta ?? "Mascota"} sin nombre`}
        </h3>
        {detalles.length > 0 && (
          <p className="text-sm text-stone-600">{detalles.join(" · ")}</p>
        )}
        <p className="mt-auto flex items-center gap-1.5 pt-2 text-sm font-semibold text-marca">
          📍 {reporte.barrio}
        </p>
        <p className="text-xs text-stone-500">{formatearFecha(reporte.fecha)}</p>
      </div>
    </Link>
  );
}
