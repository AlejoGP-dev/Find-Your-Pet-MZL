import Link from "next/link";
import { Suspense } from "react";
import Filtros from "@/components/Filtros";
import TarjetaReporte from "@/components/TarjetaReporte";
import { HAY_SUPABASE, listarReportes } from "@/lib/almacen";
import type { Reporte } from "@/lib/tipos";

export const dynamic = "force-dynamic";

type Params = Promise<Record<string, string | string[] | undefined>>;

function uno(valor: string | string[] | undefined): string | null {
  if (Array.isArray(valor)) return valor[0] ?? null;
  return valor ?? null;
}

export default async function Inicio({ searchParams }: { searchParams: Params }) {
  const p = await searchParams;

  let reportes: Reporte[] = [];
  let errorCarga: string | null = null;
  try {
    reportes = await listarReportes({
      tipo: uno(p.tipo),
      especie: uno(p.especie),
      barrio: uno(p.barrio),
      q: uno(p.q),
      estado: "activo",
    });
  } catch (error) {
    errorCarga = error instanceof Error ? error.message : "Error desconocido";
  }

  const perdidas = reportes.filter((r) => r.tipo === "perdida").length;
  const encontradas = reportes.filter((r) => r.tipo === "encontrada").length;

  return (
    <>
      <section className="border-b border-stone-200 bg-linear-to-b from-marca-suave to-crema">
        <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:py-14">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-bold uppercase tracking-wide text-marca-oscuro shadow-sm">
            Iniciativa ciudadana · Manizales
          </p>
          <h1 className="max-w-2xl text-3xl font-extrabold leading-tight text-stone-900 sm:text-4xl">
            Ayudemos a que cada mascota de Manizales vuelva a casa.
          </h1>
          <p className="mt-4 max-w-2xl text-base text-stone-600 sm:text-lg">
            Después del sismo muchas mascotas salieron corriendo y hoy están lejos de su
            familia. Publica tu reporte en menos de un minuto: sin registro, gratis y con
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

          <div className="mt-8 flex gap-6 text-sm">
            <div>
              <span className="block text-2xl font-extrabold text-perdida">{perdidas}</span>
              <span className="text-stone-600">buscando su casa</span>
            </div>
            <div>
              <span className="block text-2xl font-extrabold text-encontrada">
                {encontradas}
              </span>
              <span className="text-stone-600">encontradas, buscando dueño</span>
            </div>
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

        {errorCarga ? (
          <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-6 text-red-800">
            <p className="font-bold">No pudimos cargar los reportes.</p>
            <p className="mt-1 text-sm">{errorCarga}</p>
          </div>
        ) : reportes.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-stone-300 bg-white p-10 text-center">
            <p className="text-4xl">🐾</p>
            <p className="mt-3 text-lg font-bold text-stone-800">
              No hay reportes que coincidan.
            </p>
            <p className="mt-1 text-stone-600">
              Prueba quitando filtros o sé el primero en publicar.
            </p>
            <Link href="/reportar" className="boton-primario mt-5">
              Publicar un reporte
            </Link>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {reportes.map((reporte) => (
              <TarjetaReporte key={reporte.id} reporte={reporte} />
            ))}
          </div>
        )}
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
