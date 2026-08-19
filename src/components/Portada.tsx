import Link from "next/link";
import { Suspense } from "react";
import CercaDeMi, { type UbicacionReporte } from "@/components/CercaDeMi";
import Contador from "@/components/Contador";
import DatosEstructurados from "@/components/DatosEstructurados";
import Filtros from "@/components/Filtros";
import Icono, { type NombreIcono } from "@/components/Icono";
import Migas, { type Miga } from "@/components/Migas";
import TarjetaReporte from "@/components/TarjetaReporte";
import {
  HAY_SUPABASE,
  contarPorEstado,
  contarReportesPorCiudad,
  listarReportes,
} from "@/lib/almacen";
import * as schema from "@/lib/schema";
import { ciudadesDesdeConteo } from "@/lib/ciudades";
import { UMBRAL } from "@/lib/seo";
import { type Ciudad, type Reporte } from "@/lib/tipos";

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
  let porCiudad: Record<string, number> = {};
  let errorCarga: string | null = null;
  try {
    [reportes, totales, porCiudad] = await Promise.all([
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
      // Las ciudades de los filtros salen de los datos, no de una constante:
      // solo se ofrece lo que de verdad tiene reportes.
      contarReportesPorCiudad(),
    ]);
  } catch (error) {
    errorCarga = error instanceof Error ? error.message : "Error desconocido";
  }

  // Lo único que baja al navegador para el filtro por cercanía: id y punto.
  // La ficha completa se queda en el servidor, como debe ser.
  const ubicaciones: UbicacionReporte[] = reportes
    .filter((r): r is Reporte & { lat: number; lng: number } => r.lat != null && r.lng != null)
    .map((r) => ({
      id: r.id,
      lat: r.lat,
      lng: r.lng,
      aprox: r.ubicacion_precision !== "exacta",
    }));

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

  // SEO-020: el mismo párrafo estaba repetido en las 9 páginas de listado. Ahora
  // cada ciudad describe lo suyo con sus propios números. Solo se compone
  // cuando no hay filtros puestos: si no, el texto cambiaría con cada clic.
  const hayFiltros = Boolean(
    uno(p.tipo) || uno(p.especie) || uno(p.barrio) || uno(p.q) || viendoReunidas,
  );

  function barriosFrecuentes(lista: Reporte[], cuantos = 3): string[] {
    const cuenta = new Map<string, number>();
    for (const r of lista) {
      if (!r.barrio) continue;
      cuenta.set(r.barrio, (cuenta.get(r.barrio) ?? 0) + 1);
    }
    return [...cuenta.entries()]
      .filter(([, n]) => n > 1)
      .sort((a, b) => b[1] - a[1])
      .slice(0, cuantos)
      .map(([barrio]) => barrio);
  }

  function enumerar(items: string[]): string {
    if (items.length <= 1) return items[0] ?? "";
    return `${items.slice(0, -1).join(", ")} y ${items[items.length - 1]}`;
  }

  let intro =
    "Después del sismo del 10 de agosto muchas mascotas salieron corriendo y hoy están lejos de su familia. Publica tu reporte en menos de un minuto: sin registro, gratis y con contacto directo por WhatsApp.";

  if (ciudad && !hayFiltros) {
    const activos = totales.perdidas + totales.encontradas;
    if (activos === 0) {
      intro = `Todavía no hay reportes activos en ${ciudad.nombre}. Si se te perdió una mascota o te encontraste una, publicarla acá es gratis y toma menos de un minuto — y ser el primero ayuda a que la página empiece a servir en la ciudad.`;
    } else {
      const barrios = barriosFrecuentes(reportes);
      const partes = [
        `En ${ciudad.nombre}, ${ciudad.departamento} hay ${activos} ${activos === 1 ? "reporte activo" : "reportes activos"}: ${totales.perdidas} ${totales.perdidas === 1 ? "mascota perdida" : "mascotas perdidas"} y ${totales.encontradas} ${totales.encontradas === 1 ? "encontrada" : "encontradas"}.`,
      ];
      if (barrios.length > 0) {
        partes.push(
          `Los barrios con más casos son ${enumerar(barrios)}.`,
        );
      }
      if (totales.reunidas > 0) {
        partes.push(
          `${totales.reunidas} ${totales.reunidas === 1 ? "mascota ya volvió" : "mascotas ya volvieron"} a casa desde acá.`,
        );
      }
      partes.push(
        "Si viste alguna o perdiste la tuya, publicar toma menos de un minuto: gratis, sin registro y con contacto directo por WhatsApp.",
      );
      intro = partes.join(" ");
    }
  }

  const tituloListado = viendoReunidas
    ? `Mascotas que ya volvieron a casa${ciudad ? ` en ${ciudad.nombre}` : ""}`
    : ciudad
      ? `Mascotas perdidas y encontradas en ${ciudad.nombre}`
      : "Últimos reportes publicados";

  const migas: Miga[] = ciudad
    ? [{ etiqueta: "Inicio", href: "/" }, { etiqueta: ciudad.nombre }]
    : [];

  // Para el desplegable de filtros: toda ciudad con al menos un reporte.
  const ciudadesConReportes = ciudadesDesdeConteo(porCiudad);
  // Para los chips de navegación: solo las que tienen landing propia y pasan
  // el umbral de indexación, para no mandar a nadie a una página vacía.
  const ciudadesDestacadas = ciudadesConReportes
    .filter((c) => c.slug && c.reportes >= UMBRAL.ciudad)
    .slice(0, 12);

  const cajas: {
    n: number;
    texto: string;
    icono?: NombreIcono;
    color: string;
    activa: boolean;
    anillo: string;
    href: string;
  }[] = [
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
      texto: "Ya en casa",
      icono: "sparkles",
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
          {ciudad && (
            <div className="md:flex md:justify-center">
              <Migas items={migas} />
            </div>
          )}
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
            {intro}
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row md:justify-center">
            <Link
              href={`/reportar?tipo=perdida${ciudad ? `&ciudad=${ciudad.slug}` : ""}`}
              className="boton-primario"
            >
              Perdí a mi mascota
              <Icono nombre="perdida" />
            </Link>
            <Link
              href={`/reportar?tipo=encontrada${ciudad ? `&ciudad=${ciudad.slug}` : ""}`}
              className="boton-secundario border-encontrada/40 text-encontrada"
            >
              Encontré una mascota
              <Icono nombre="encontrada" />
            </Link>
            <Link
              href={`/adopcion${ciudad ? `/${ciudad.slug}` : ""}`}
              className="boton-secundario border-marca/40 text-marca"
            >
              Quiero adoptar
              <Icono nombre="hogar" />
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
                <span className="mt-0.5 flex items-center justify-center gap-1 text-xs leading-tight text-stone-600 sm:text-sm">
                  {dato.texto}
                  {dato.icono && <Icono nombre={dato.icono} />}
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
              Todo el país{" "}
              <Icono
                nombre="pais"
                className="h-[1em] w-[1em]"
              />
            </Link>
            {ciudadesDestacadas.map((c) => (
              <Link
                key={c.slug}
                href={`/${c.slug}`}
                className={`shrink-0 whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-bold transition ${
                  ciudad?.slug === c.slug
                    ? "bg-marca text-white"
                    : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                }`}
              >
                {c.nombre}{" "}
                <span className="tabular-nums opacity-60">{c.reportes}</span>
              </Link>
            ))}
            {/* Si la ciudad que se está viendo todavía no pasa el umbral, se
                agrega igual: si no, el chip activo no aparecería por ningún
                lado y la navegación se sentiría rota. */}
            {ciudad && !ciudadesDestacadas.some((c) => c.slug === ciudad.slug) && (
              <span className="shrink-0 whitespace-nowrap rounded-full bg-marca px-3.5 py-2 text-sm font-bold text-white">
                {ciudad.nombre}
              </span>
            )}
          </div>
        </div>
      </section>

      <section id="reportes" className="mx-auto w-full max-w-5xl scroll-mt-20 px-4 py-8">
        {/* SEO-007: el ItemList lista exactamente las tarjetas que se están
            renderizando. Un JSON-LD que se contradice con el HTML es peor que
            no tener JSON-LD. */}
        {reportes.length > 0 && (
          <DatosEstructurados
            datos={schema.coleccion({
              nombre: tituloListado,
              descripcion: intro,
              ruta: ciudad ? `/${ciudad.slug}` : "/",
              elementos: reportes.map((r) => ({
                id: r.id,
                nombre: r.nombre || "Mascota sin nombre",
              })),
            })}
          />
        )}

        {/* SEO-015: los nombres de las mascotas son <h3> y colgaban del <h1>
            sin un <h2> intermedio. Este encabezado cierra ese hueco y de paso
            le dice a la persona qué está viendo. */}
        <h2 className="mb-4 text-xl font-extrabold text-stone-900 md:text-center">
          {tituloListado}
        </h2>

        {!HAY_SUPABASE && (
          <div className="mb-6 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
            <strong className="font-bold">Modo demo.</strong> Todavía no hay base de datos
            conectada, así que los reportes se guardan solo en memoria y se pierden al
            reiniciar el servidor.
          </div>
        )}

        <Suspense fallback={<div className="h-24" />}>
          <Filtros ciudad={ciudad} base={base} ciudades={ciudadesConReportes} />
        </Suspense>

        {reportes.length > 0 && (
          <div className="mt-5">
            <CercaDeMi
              ubicaciones={ubicaciones}
              sinUbicacion={reportes.length - ubicaciones.length}
            />
          </div>
        )}

        {viendoReunidas && reportes.length > 0 && (
          <p className="mt-5 flex items-center justify-center gap-2 rounded-2xl border border-encontrada/30 bg-encontrada-suave p-4 text-center font-bold text-encontrada">
            Estas mascotas ya están de vuelta con su familia.
            <Icono nombre="sparkles" />
          </p>
        )}

        {errorCarga ? (
          <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-6 text-red-800">
            <p className="font-bold">No pudimos cargar los reportes.</p>
            <p className="mt-1 text-sm">{errorCarga}</p>
          </div>
        ) : reportes.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-stone-300 bg-white p-10 text-center">
            <Icono
              nombre={viendoReunidas ? "sparkles" : "huella"}
              className="mx-auto h-10 w-10 text-stone-400"
            />
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
            {reportes.map((reporte, i) => (
              <TarjetaReporte
                key={reporte.id}
                reporte={reporte}
                mostrarCiudad={!ciudad}
                // Solo las 4 primeras: más imágenes prioritarias compiten
                // entre sí y empeoran el LCP en lugar de mejorarlo.
                prioridad={i < 4}
              />
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
              Mascotas que buscan familia{" "}
              <Icono
                nombre="hogar"
                className="h-[1em] w-[1em]"
              />
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
              Las fundaciones también necesitan ayuda{" "}
              <Icono
                nombre="corazon"
                className="h-[1em] w-[1em]"
              />
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
        <div className="rounded-2xl border border-stone-200 bg-white p-6 md:text-center">
          <h2 className="text-xl font-extrabold text-stone-900">
            No sabes por dónde empezar a buscar
          </h2>
          <p className="mt-2 text-stone-600 md:mx-auto md:max-w-2xl">
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
                Se me perdió{" "}
                <Icono
                  nombre="perdida"
                  className="h-[1em] w-[1em]"
                />
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
                Me encontré una{" "}
                <Icono
                  nombre="encontrada"
                  className="h-[1em] w-[1em]"
                />
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
