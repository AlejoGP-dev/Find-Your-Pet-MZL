import Link from "next/link";
import { Suspense } from "react";
import Filtros from "@/components/Filtros";
import TarjetaReporte from "@/components/TarjetaReporte";
import { HAY_SUPABASE, contarPorEstado, listarReportes } from "@/lib/almacen";
import type { Reporte } from "@/lib/tipos";

export const dynamic = "force-dynamic";

type Params = Promise<Record<string, string | string[] | undefined>>;

function uno(valor: string | string[] | undefined): string | null {
  if (Array.isArray(valor)) return valor[0] ?? null;
  return valor ?? null;
}

export default async function Inicio({ searchParams }: { searchParams: Params }) {
  const p = await searchParams;

  const estado = uno(p.estado) === "resuelto" ? "resuelto" : "activo";
  const viendoReunidas = estado === "resuelto";

  let reportes: Reporte[] = [];
  let totales = { perdidas: 0, encontradas: 0, reunidas: 0 };
  let errorCarga: string | null = null;
  try {
    [reportes, totales] = await Promise.all([
      listarReportes({
        tipo: uno(p.tipo),
        especie: uno(p.especie),
        barrio: uno(p.barrio),
        q: uno(p.q),
        estado,
      }),
      contarPorEstado(),
    ]);
  } catch (error) {
    errorCarga = error instanceof Error ? error.message : "Error desconocido";
  }

  return (
    <>
      <section className="border-b border-stone-200 bg-linear-to-b from-marca-suave to-crema">
        <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:py-14">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-bold uppercase tracking-wide text-marca-oscuro shadow-sm">
            Iniciativa ciudadana · Manizales y Villamaría
          </p>
          <h1 className="max-w-2xl text-3xl font-extrabold leading-tight text-stone-900 sm:text-4xl">
            Ayudemos a que cada mascota vuelva a casa.
          </h1>
          <p className="mt-4 max-w-2xl text-base text-stone-600 sm:text-lg">
            Después del sismo muchas mascotas de Manizales y Villamaría salieron corriendo
            y hoy están lejos de su familia. Publica tu reporte en menos de un minuto: sin registro, gratis y con
            contacto directo por WhatsApp.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link href="/reportar?tipo=perdida" className="boton-primario">
              😿 Perdí a mi mascota
            </Link>
            <Link
              href="/reportar?tipo=encontrada"
              className="boton-secundario border-encontrada/40 text-encontrada"
            >
              🐕 Encontré una mascota
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-2 sm:max-w-xl sm:gap-3">
            {[
              { n: totales.perdidas, texto: "buscando su casa", color: "text-perdida" },
              { n: totales.encontradas, texto: "buscando dueño", color: "text-encontrada" },
              { n: totales.reunidas, texto: "ya en casa 🎉", color: "text-marca" },
            ].map((dato) => (
              <div
                key={dato.texto}
                className="rounded-xl bg-white/70 px-2 py-3 text-center ring-1 ring-stone-200/70 sm:px-4"
              >
                <span className={`block text-2xl font-extrabold sm:text-3xl ${dato.color}`}>
                  {dato.n}
                </span>
                <span className="mt-0.5 block text-xs leading-tight text-stone-600 sm:text-sm">
                  {dato.texto}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="reportes" className="mx-auto w-full max-w-5xl scroll-mt-20 px-4 py-8">
        {!HAY_SUPABASE && (
          <div className="mb-6 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
            <strong className="font-bold">Modo demo.</strong> Todavía no hay base de datos
            conectada, así que los reportes se guardan solo en memoria y se pierden al
            reiniciar el servidor. Configura <code>SUPABASE_URL</code> y{" "}
            <code>SUPABASE_SERVICE_ROLE_KEY</code> para activarlo de verdad (mira el
            README).
          </div>
        )}

        <Suspense fallback={<div className="h-24" />}>
          <Filtros />
        </Suspense>

        {viendoReunidas && reportes.length > 0 && (
          <p className="mt-5 rounded-2xl border border-encontrada/30 bg-encontrada-suave p-4 text-center font-bold text-encontrada">
            Estas mascotas ya están de vuelta con su familia. 🎉
          </p>
        )}

        {errorCarga ? (
          <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-6 text-red-800">
            <p className="font-bold">No pudimos cargar los reportes.</p>
            <p className="mt-1 text-sm">{errorCarga}</p>
          </div>
        ) : reportes.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-stone-300 bg-white p-10 text-center">
            <p className="text-4xl">{viendoReunidas ? "🎉" : "🐾"}</p>
            <p className="mt-3 text-lg font-bold text-stone-800">
              {viendoReunidas
                ? "Todavía no hay reencuentros publicados."
                : "No hay reportes que coincidan."}
            </p>
            <p className="mt-1 text-stone-600">
              {viendoReunidas
                ? "Cuando alguien marque que su mascota apareció, la vas a ver acá."
                : "Prueba quitando filtros o sé el primero en publicar."}
            </p>
            {!viendoReunidas && (
              <Link href="/reportar" className="boton-primario mt-5">
                Publicar un reporte
              </Link>
            )}
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {reportes.map((reporte) => (
              <TarjetaReporte key={reporte.id} reporte={reporte} />
            ))}
          </div>
        )}
      </section>

      <section className="mx-auto w-full max-w-5xl px-4 pb-6">
        <Link
          href="/ayudar"
          className="flex flex-col gap-3 rounded-2xl border-2 border-marca/30 bg-marca-suave p-6 transition hover:border-marca sm:flex-row sm:items-center sm:justify-between"
        >
          <span>
            <span className="block text-xl font-extrabold text-marca-oscuro">
              💚 Las fundaciones también necesitan ayuda
            </span>
            <span className="mt-1 block text-stone-700">
              Alimento, arena, antipulgas, desparasitante. Mira quiénes están
              cuidando animales en Manizales y Villamaría, y qué les hace falta.
            </span>
          </span>
          <span className="shrink-0 rounded-xl bg-marca px-5 py-3 text-center font-bold text-white">
            Ver cómo ayudar
          </span>
        </Link>
      </section>

      <section className="mx-auto w-full max-w-5xl px-4 pb-14">
        <div className="rounded-2xl border border-stone-200 bg-white p-6">
          <h2 className="text-xl font-extrabold text-stone-900">
            Consejos para la búsqueda
          </h2>
          <ul className="mt-4 grid gap-3 text-sm text-stone-700 sm:grid-cols-2">
            <li className="rounded-xl bg-stone-50 p-4">
              <strong className="block text-stone-900">Busca de noche</strong>
              Las mascotas asustadas se esconden de día y se mueven cuando hay silencio.
              Llámala con su nombre y lleva su comida favorita.
            </li>
            <li className="rounded-xl bg-stone-50 p-4">
              <strong className="block text-stone-900">Deja su olor</strong>
              Poner su cama, una cobija o su arenera afuera de la casa ayuda a que
              encuentre el camino de regreso.
            </li>
            <li className="rounded-xl bg-stone-50 p-4">
              <strong className="block text-stone-900">Comparte el enlace</strong>
              Cada reporte tiene su propia página. Compártela en los grupos de WhatsApp de
              tu barrio y en redes.
            </li>
            <li className="rounded-xl bg-stone-50 p-4">
              <strong className="block text-stone-900">Cuidado con las estafas</strong>
              Nunca envíes dinero por adelantado. Pide fotos o señas que solo el dueño
              real pueda conocer.
            </li>
          </ul>
        </div>
      </section>
    </>
  );
}
