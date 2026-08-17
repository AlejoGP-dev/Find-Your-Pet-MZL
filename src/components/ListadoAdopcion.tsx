import Link from "next/link";
import { Suspense } from "react";
import Contador from "@/components/Contador";
import FiltrosAdopcion from "@/components/FiltrosAdopcion";
import TarjetaAdopcion from "@/components/TarjetaAdopcion";
import { contarAdopciones, listarAdopciones } from "@/lib/almacen";
import type { Adopcion } from "@/lib/adopciones";
import { CIUDADES, type Ciudad } from "@/lib/tipos";

function uno(v: string | string[] | undefined): string | null {
  if (Array.isArray(v)) return v[0] ?? null;
  return v ?? null;
}

export default async function ListadoAdopcion({
  ciudad,
  params,
}: {
  ciudad: Ciudad | null;
  params: Record<string, string | string[] | undefined>;
}) {
  const base = ciudad ? `/adopcion/${ciudad.slug}` : "/adopcion";
  const estado = uno(params.estado) === "adoptado" ? "adoptado" : "disponible";
  const viendoAdoptadas = estado === "adoptado";
  const ciudadFiltro = ciudad ? ciudad.nombre : uno(params.ciudad);

  let lista: Adopcion[] = [];
  let totales = { disponibles: 0, adoptadas: 0 };
  let errorCarga: string | null = null;
  try {
    [lista, totales] = await Promise.all([
      listarAdopciones({
        especie: uno(params.especie),
        ciudad: ciudadFiltro,
        tamano: uno(params.tamano),
        edad: uno(params.edad),
        q: uno(params.q),
        estado,
      }),
      contarAdopciones(ciudadFiltro),
    ]);
  } catch (error) {
    errorCarga = error instanceof Error ? error.message : "Error desconocido";
  }

  const zona = ciudad ? `${ciudad.nombre}, ${ciudad.departamento}` : "Colombia";

  return (
    <>
      <section className="border-b border-stone-200 bg-linear-to-b from-marca-suave to-crema">
        <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:py-14 md:text-center">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-bold uppercase tracking-wide text-marca-oscuro shadow-sm">
            🏡 Adopción · {zona}
          </p>
          <h1 className="max-w-2xl text-3xl font-extrabold leading-tight text-stone-900 sm:text-4xl md:mx-auto">
            {ciudad
              ? `Mascotas en adopción en ${ciudad.nombre}.`
              : "Mascotas que buscan una familia."}
          </h1>
          <p className="mt-4 max-w-2xl text-base text-stone-600 sm:text-lg md:mx-auto">
            Perros y gatos que necesitan un hogar definitivo. Adoptar es gratis y el
            contacto es directo con quien los está cuidando. Tómate tu tiempo: es un
            compromiso de muchos años.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row md:justify-center">
            <Link
              href={`/adopcion/publicar${ciudad ? `?ciudad=${ciudad.slug}` : ""}`}
              className="boton-primario"
            >
              🏡 Dar en adopción
            </Link>
            <Link
              href="/consejos/adoptar"
              className="boton-secundario border-marca/40 text-marca"
            >
              📖 Antes de adoptar
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-2 sm:max-w-sm sm:gap-3 md:mx-auto">
            {[
              { n: totales.disponibles, texto: "buscando familia", color: "text-marca" },
              { n: totales.adoptadas, texto: "ya tienen hogar 🎉", color: "text-encontrada" },
            ].map((d) => (
              <div
                key={d.texto}
                className="rounded-xl bg-white/70 px-2 py-3 text-center ring-1 ring-stone-200/70 sm:px-4"
              >
                <Contador
                  hasta={d.n}
                  className={`block text-2xl font-extrabold tabular-nums sm:text-3xl ${d.color}`}
                />
                <span className="mt-0.5 block text-xs leading-tight text-stone-600 sm:text-sm">
                  {d.texto}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-stone-200 bg-white">
        <div className="mx-auto w-full max-w-5xl px-4 py-4">
          <p className="text-xs font-bold uppercase tracking-wide text-stone-500">
            {ciudad ? "Cambiar de ciudad" : "Elige tu ciudad"}
          </p>
          <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
            <Link
              href="/adopcion"
              className={`shrink-0 rounded-full px-3.5 py-2 text-sm font-bold transition ${
                ciudad ? "bg-stone-100 text-stone-600 hover:bg-stone-200" : "bg-marca text-white"
              }`}
            >
              🇨🇴 Todo el país
            </Link>
            {CIUDADES.map((c) => (
              <Link
                key={c.slug}
                href={`/adopcion/${c.slug}`}
                className={`shrink-0 whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-bold transition ${
                  ciudad?.slug === c.slug
                    ? "bg-marca text-white"
                    : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                }`}
              >
                {c.nombre}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="listado" className="mx-auto w-full max-w-5xl scroll-mt-20 px-4 py-8">
        <Suspense fallback={<div className="h-24" />}>
          <FiltrosAdopcion ciudad={ciudad} base={base} />
        </Suspense>

        {viendoAdoptadas && lista.length > 0 && (
          <p className="mt-5 rounded-2xl border border-encontrada/30 bg-encontrada-suave p-4 text-center font-bold text-encontrada">
            Estas mascotas ya encontraron su familia. 🎉
          </p>
        )}

        {errorCarga ? (
          <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-6 text-red-800">
            <p className="font-bold">No pudimos cargar las adopciones.</p>
            <p className="mt-1 text-sm">{errorCarga}</p>
          </div>
        ) : lista.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-stone-300 bg-white p-10 text-center">
            <p className="text-4xl">{viendoAdoptadas ? "🎉" : "🏡"}</p>
            <p className="mt-3 text-lg font-bold text-stone-800">
              {viendoAdoptadas
                ? "Todavía no hay adopciones cerradas."
                : ciudad
                  ? `Todavía no hay mascotas en adopción en ${ciudad.nombre}.`
                  : "No hay mascotas que coincidan."}
            </p>
            <p className="mt-1 text-stone-600">
              {viendoAdoptadas
                ? "Cuando alguien marque que su mascota ya tiene hogar, la vas a ver acá."
                : "Prueba quitando filtros, o publica tú la primera."}
            </p>
            {!viendoAdoptadas && (
              <Link
                href={`/adopcion/publicar${ciudad ? `?ciudad=${ciudad.slug}` : ""}`}
                className="boton-primario mt-5"
              >
                Dar en adopción
              </Link>
            )}
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {lista.map((a) => (
              <TarjetaAdopcion key={a.id} adopcion={a} mostrarCiudad={!ciudad} />
            ))}
          </div>
        )}
      </section>

      <section className="mx-auto w-full max-w-5xl px-4 pb-14">
        <div className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-6">
          <h2 className="text-lg font-extrabold text-stone-900">
            ⚠️ ¿Te encontraste esta mascota en la calle?
          </h2>
          <p className="mt-2 text-stone-700">
            Antes de darla en adopción, publícala como <strong>encontrada</strong> y
            espera unos días. Puede que su familia la esté buscando en este mismo
            sitio — y una adopción no se deshace fácil.
          </p>
          <Link href="/reportar?tipo=encontrada" className="boton-secundario mt-4">
            Publicar como encontrada
          </Link>
        </div>
      </section>
    </>
  );
}
