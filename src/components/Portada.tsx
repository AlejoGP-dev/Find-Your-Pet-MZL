import Link from "next/link";
import { Suspense } from "react";
import Contador from "@/components/Contador";
import Filtros from "@/components/Filtros";
import TarjetaReporte from "@/components/TarjetaReporte";
import { HAY_SUPABASE, contarPorEstado, listarReportes } from "@/lib/almacen";
import { CIUDADES, type Ciudad, type Reporte } from "@/lib/tipos";

function uno(valor: string | string[] | undefined): string | null {
  if (Array.isArray(valor)) return valor[0] ?? null;
  return valor ?? null;
}

/**
 * El listado. Sirve para la portada nacional (ciudad = null) y para la página
 * de cada ciudad, que es la misma vista pero amarrada a un solo municipio.
 */
export default async function Portada({
  ciudad,
  params,
}: {
  ciudad: Ciudad | null;
  params: Record<string, string | string[] | undefined>;
}) {
  const p = params;
  const base = ciudad ? `/${ciudad.slug}` : "/";

  const estado = uno(p.estado) === "resuelto" ? "resuelto" : "activo";
  const viendoReunidas = estado === "resuelto";
  // En la página de ciudad manda la ruta; en la nacional, el filtro.
  const ciudadFiltro = ciudad ? ciudad.nombre : uno(p.ciudad);

  let reportes: Reporte[] = [];
  let totales = { perdidas: 0, encontradas: 0, reunidas: 0 };
  let errorCarga: string | null = null;
  try {
    [reportes, totales] = await Promise.all([
      listarReportes({
        tipo: uno(p.tipo),
        especie: uno(p.especie),
        ciudad: ciudadFiltro,
        barrio: uno(p.barrio),
        q: uno(p.q),
        estado,
      }),
      // Los contadores tienen que seguir el mismo filtro que la lista: si no,
      // en /?ciudad=Villamaría se veían 15 tarjetas con los números del país.
      contarPorEstado(ciudadFiltro),
    ]);
  } catch (error) {
    errorCarga = error instanceof Error ? error.message : "Error desconocido";
  }

  const totalReportes = totales.perdidas + totales.encontradas + totales.reunidas;
  const zona = ciudad
    ? `${ciudad.nombre}, ${ciudad.departamento}`
    : (ciudadFiltro ?? "Colombia");

  // Las cajas de arriba son atajos a los filtros: conservan lo que ya esté
  // puesto (especie, barrio, ciudad, búsqueda) y solo cambian tipo/estado.
  const tipoActual = uno(p.tipo) ?? "";
  function enlaceFiltro(cambios: { tipo?: string; estado?: string }): string {
    const q = new URLSearchParams();
    for (const clave of ["especie", "barrio", "ciudad", "q"] as const) {
      const valor = uno(p[clave]);
      if (valor) q.set(clave, valor);
    }
    if (cambios.tipo) q.set("tipo", cambios.tipo);
    if (cambios.estado) q.set("estado", cambios.estado);
    const cadena = q.toString();
    return `${base}${cadena ? `?${cadena}` : ""}#reportes`;
  }

  const cajas = [
    {
      n: totales.perdidas,
      texto: "Perdidas",
      color: "text-perdida",
      activa: !viendoReunidas && tipoActual === "perdida",
      anillo: "ring-perdida",
      // Volver a tocar la caja activa quita el filtro.
      href: enlaceFiltro(
        !viendoReunidas && tipoActual === "perdida" ? {} : { tipo: "perdida" },
      ),
    },
    {
      n: totales.encontradas,
      texto: "Encontradas",
      color: "text-encontrada",
      activa: !viendoReunidas && tipoActual === "encontrada",
      anillo: "ring-encontrada",
      href: enlaceFiltro(
        !viendoReunidas && tipoActual === "encontrada" ? {} : { tipo: "encontrada" },
      ),
    },
    {
      n: totales.reunidas,
      texto: "Ya en casa 🎉",
      color: "text-marca",
      activa: viendoReunidas,
      anillo: "ring-marca",
      href: enlaceFiltro(viendoReunidas ? {} : { estado: "resuelto" }),
    },
  ];

  return (
    <>
      <section className="border-b border-stone-200 bg-linear-to-b from-marca-suave to-crema">
        {/* En escritorio el hero va centrado; en móvil se queda alineado a la
            izquierda, que se lee mejor en columna angosta. */}
        <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:py-14 md:text-center">
          <div className="mb-3 flex flex-wrap items-center gap-2 md:justify-center">
            <p className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-bold uppercase tracking-wide text-marca-oscuro shadow-sm">
              Iniciativa ciudadana · {zona}
            </p>
            {totalReportes > 0 && (
              <p className="text-xs font-semibold text-stone-500">
                {totalReportes} reportes publicados
              </p>
            )}
          </div>
          <h1 className="max-w-2xl text-3xl font-extrabold leading-tight text-stone-900 sm:text-4xl md:mx-auto">
            {ciudad
              ? `Mascotas perdidas y encontradas en ${ciudad.nombre}.`
              : "Ayudemos a que cada mascota vuelva a casa."}
          </h1>
          <p className="mt-4 max-w-2xl text-base text-stone-600 sm:text-lg md:mx-auto">
            Después del sismo del 10 de agosto muchas mascotas salieron corriendo y hoy
            están lejos de su familia. Publica tu reporte en menos de un minuto: sin
            registro, gratis y con contacto directo por WhatsApp.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row md:justify-center">
            <Link
              href={`/reportar?tipo=perdida${ciudad ? `&ciudad=${ciudad.slug}` : ""}`}
              className="boton-primario"
            >
              Perdí a mi mascota 😿
            </Link>
            <Link
              href={`/reportar?tipo=encontrada${ciudad ? `&ciudad=${ciudad.slug}` : ""}`}
              className="boton-secundario border-encontrada/40 text-encontrada"
            >
              Encontré una mascota 🐕
            </Link>
            <Link
              href={`/adopcion${ciudad ? `/${ciudad.slug}` : ""}`}
              className="boton-secundario border-marca/40 text-marca"
            >
              Quiero adoptar 🏡
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-2 sm:max-w-xl sm:gap-3 md:mx-auto">
            {cajas.map((dato) => (
              <Link
                key={dato.texto}
                href={dato.href}
                aria-pressed={dato.activa}
                className={`rounded-xl px-2 py-3 text-center transition sm:px-4 ${
                  dato.activa
                    ? `bg-white ring-2 ${dato.anillo} shadow-sm`
                    : "bg-white/70 ring-1 ring-stone-200/70 hover:bg-white hover:ring-stone-300"
                }`}
              >
                <Contador
                  hasta={dato.n}
                  className={`block text-2xl font-extrabold tabular-nums sm:text-3xl ${dato.color}`}
                />
                <span className="mt-0.5 block text-xs leading-tight text-stone-600 sm:text-sm">
                  {dato.texto}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Selector de ciudad: lo primero que ve alguien que llega de otra ciudad */}
      <section className="border-b border-stone-200 bg-white">
        <div className="mx-auto w-full max-w-5xl px-4 py-4">
          <p className="text-xs font-bold uppercase tracking-wide text-stone-500">
            {ciudad ? "Cambiar de ciudad" : "Elige tu ciudad"}
          </p>
          <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
            <Link
              href="/"
              className={`shrink-0 rounded-full px-3.5 py-2 text-sm font-bold transition ${
                ciudad
                  ? "bg-stone-100 text-stone-600 hover:bg-stone-200"
                  : "bg-marca text-white"
              }`}
            >
              Todo el país 🇨🇴
            </Link>
            {CIUDADES.map((c) => (
              <Link
                key={c.slug}
                href={`/${c.slug}`}
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

      <section id="reportes" className="mx-auto w-full max-w-5xl scroll-mt-20 px-4 py-8">
        {!HAY_SUPABASE && (
          <div className="mb-6 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
            <strong className="font-bold">Modo demo.</strong> Todavía no hay base de datos
            conectada, así que los reportes se guardan solo en memoria y se pierden al
            reiniciar el servidor.
          </div>
        )}

        <Suspense fallback={<div className="h-24" />}>
          <Filtros ciudad={ciudad} base={base} />
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
                : ciudad
                  ? `Todavía no hay reportes en ${ciudad.nombre}.`
                  : "No hay reportes que coincidan."}
            </p>
            <p className="mt-1 text-stone-600">
              {viendoReunidas
                ? "Cuando alguien marque que su mascota apareció, la vas a ver acá."
                : "Prueba quitando filtros o sé el primero en publicar."}
            </p>
            {!viendoReunidas && (
              <Link
                href={`/reportar${ciudad ? `?ciudad=${ciudad.slug}` : ""}`}
                className="boton-primario mt-5"
              >
                Publicar un reporte
              </Link>
            )}
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {reportes.map((reporte) => (
              <TarjetaReporte key={reporte.id} reporte={reporte} mostrarCiudad={!ciudad} />
            ))}
          </div>
        )}
      </section>

      <section className="mx-auto w-full max-w-5xl px-4 pb-6">
        <Link
          href="/adopcion"
          className="mb-3 flex flex-col gap-3 rounded-2xl border-2 border-marca/30 bg-white p-6 transition hover:border-marca sm:flex-row sm:items-center sm:justify-between"
        >
          <span>
            <span className="block text-xl font-extrabold text-marca-oscuro">
              Mascotas que buscan familia 🏡
            </span>
            <span className="mt-1 block text-stone-700">
              Perros y gatos en adopción. Gratis y con contacto directo con quien
              los está cuidando.
            </span>
          </span>
          <span className="shrink-0 rounded-xl border-2 border-marca px-5 py-3 text-center font-bold text-marca">
            Ver adopciones
          </span>
        </Link>

        <Link
          href="/ayudar"
          className="flex flex-col gap-3 rounded-2xl border-2 border-marca/30 bg-marca-suave p-6 transition hover:border-marca sm:flex-row sm:items-center sm:justify-between"
        >
          <span>
            <span className="block text-xl font-extrabold text-marca-oscuro">
              Las fundaciones también necesitan ayuda 💚
            </span>
            <span className="mt-1 block text-stone-700">
              Alimento, arena, antipulgas, desparasitante. Mira quiénes están
              cuidando animales y qué les hace falta.
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
            No sabes por dónde empezar a buscar
          </h2>
          <p className="mt-2 text-stone-600">
            Buscar un gato no se parece en nada a buscar un perro, y la mayoría de
            la gente hace justo lo que hace huir al animal. Armamos dos guías con
            lo que sí funciona.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Link
              href="/consejos/perdida"
              className="rounded-xl border-2 border-perdida/30 bg-perdida-suave p-5 transition hover:border-perdida"
            >
              <span className="block text-lg font-extrabold text-perdida">
                Se me perdió 😿
              </span>
              <span className="mt-1 block text-sm text-stone-700">
                Dónde buscar según sea perro o gato, qué NO hacer y cómo evitar
                estafas.
              </span>
            </Link>
            <Link
              href="/consejos/encontrada"
              className="rounded-xl border-2 border-encontrada/30 bg-encontrada-suave p-5 transition hover:border-encontrada"
            >
              <span className="block text-lg font-extrabold text-encontrada">
                Me encontré una 🐕
              </span>
              <span className="mt-1 block text-sm text-stone-700">
                Cómo acercarte sin espantarla, qué darle de comer y cómo
                verificar a la familia.
              </span>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
