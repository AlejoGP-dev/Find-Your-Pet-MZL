"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  ESPECIES,
  CIUDADES,
  OTRA_CIUDAD,
  OTRO_BARRIO,
  ciudadPorNombre,
  ciudadPorSlug,
  SEXOS,
  TAMANOS,
  type TipoReporte,
} from "@/lib/tipos";

/**
 * Vercel rechaza cualquier envío de más de 4,5 MB antes de que llegue al
 * servidor, y el navegador solo alcanza a decir "Failed to fetch". Por eso la
 * foto TIENE que salir pequeña de acá: apuntamos a 1,5 MB.
 */
const OBJETIVO_FOTO = 1.5 * 1024 * 1024;
const TOPE_FOTO = 3.5 * 1024 * 1024;

/**
 * Decodifica la imagen. createImageBitmap es lo más rápido, pero falla en
 * Android viejos y con fotos HEIC del iPhone; ahí caemos a un <img>, que sí
 * las entiende porque lo decodifica el sistema operativo.
 */
async function decodificar(
  archivo: File,
): Promise<{ fuente: CanvasImageSource; ancho: number; alto: number; limpiar: () => void }> {
  try {
    const bitmap = await createImageBitmap(archivo);
    return {
      fuente: bitmap,
      ancho: bitmap.width,
      alto: bitmap.height,
      limpiar: () => bitmap.close?.(),
    };
  } catch {
    const url = URL.createObjectURL(archivo);
    try {
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const el = new window.Image();
        el.onload = () => resolve(el);
        el.onerror = () => reject(new Error("no se pudo leer la imagen"));
        el.src = url;
      });
      return {
        fuente: img,
        ancho: img.naturalWidth,
        alto: img.naturalHeight,
        limpiar: () => URL.revokeObjectURL(url),
      };
    } catch (e) {
      URL.revokeObjectURL(url);
      throw e;
    }
  }
}

/**
 * Reduce la foto en el navegador para que suba rápido incluso con mala señal.
 * Baja tamaño y calidad por pasos hasta quedar bajo el objetivo.
 */
async function comprimirImagen(archivo: File): Promise<File> {
  const { fuente, ancho: anchoOriginal, alto: altoOriginal, limpiar } =
    await decodificar(archivo);

  try {
    let mejor: File | null = null;

    // Con datos lentos apuntamos mucho más abajo: vale más un reporte
    // publicado con foto regular que uno que nunca sube.
    const red = (
      navigator as Navigator & {
        connection?: { effectiveType?: string; saveData?: boolean };
      }
    ).connection;
    const lenta =
      red?.saveData === true ||
      ["slow-2g", "2g", "3g"].includes(red?.effectiveType ?? "");
    const objetivo = lenta ? 400 * 1024 : OBJETIVO_FOTO;

    for (const [maxLado, calidad] of (lenta
      ? ([
          [1000, 0.7],
          [800, 0.62],
          [640, 0.55],
        ] as const)
      : ([
          [1400, 0.82],
          [1200, 0.75],
          [1000, 0.7],
          [800, 0.65],
        ] as const))) {
      const escala = Math.min(1, maxLado / Math.max(anchoOriginal, altoOriginal));
      const ancho = Math.max(1, Math.round(anchoOriginal * escala));
      const alto = Math.max(1, Math.round(altoOriginal * escala));

      const lienzo = document.createElement("canvas");
      lienzo.width = ancho;
      lienzo.height = alto;
      const ctx = lienzo.getContext("2d");
      if (!ctx) break;
      ctx.drawImage(fuente, 0, 0, ancho, alto);

      const blob = await new Promise<Blob | null>((resolve) =>
        lienzo.toBlob(resolve, "image/jpeg", calidad),
      );
      if (!blob) break;

      mejor = new File([blob], "mascota.jpg", { type: "image/jpeg" });
      if (blob.size <= objetivo) break;
    }

    // Si por lo que sea no logramos comprimir, devolvemos el original solo
    // cuando sea lo bastante liviano para que el envío no reviente.
    if (!mejor) {
      if (archivo.size > TOPE_FOTO) throw new Error("foto muy pesada");
      return archivo;
    }
    return mejor.size < archivo.size ? mejor : archivo;
  } finally {
    limpiar();
  }
}

type Sugerencia = {
  reporte: { id: string; nombre: string | null; barrio: string; foto_url: string | null };
  puntaje: number;
  razones: string[];
};

/** Tras publicar, avisa si ya hay algo parecido del otro lado del listado. */
function SugerenciasTrasPublicar({ id, tipo }: { id: string; tipo: TipoReporte }) {
  const [lista, setLista] = useState<Sugerencia[]>([]);

  useEffect(() => {
    let vivo = true;
    fetch(`/api/reportes/${id}/coincidencias`)
      .then((r) => r.json())
      .then((d) => {
        if (vivo && Array.isArray(d.coincidencias)) setLista(d.coincidencias);
      })
      .catch(() => {});
    return () => {
      vivo = false;
    };
  }, [id]);

  if (lista.length === 0) return null;

  return (
    <div className="mx-auto mt-6 max-w-md rounded-xl border-2 border-amber-300 bg-amber-50 p-4 text-left">
      <p className="font-extrabold text-stone-900">
        🔎 Encontramos {lista.length}{" "}
        {lista.length === 1 ? "reporte parecido" : "reportes parecidos"}
      </p>
      <p className="mt-1 text-sm text-stone-700">
        {tipo === "perdida"
          ? "Alguien reportó mascotas encontradas que se parecen a la tuya. Míralas antes de irte."
          : "Hay familias buscando mascotas parecidas a la que encontraste."}
      </p>
      <ul className="mt-3 space-y-2">
        {lista.map((c) => (
          <li key={c.reporte.id}>
            <Link
              href={`/mascota/${c.reporte.id}`}
              className="flex items-center gap-3 rounded-lg bg-white p-2 transition hover:ring-2 hover:ring-marca/30"
            >
              <span className="relative block h-12 w-12 shrink-0 overflow-hidden rounded-md bg-stone-100">
                {c.reporte.foto_url && (
                  <Image
                    src={c.reporte.foto_url}
                    alt=""
                    fill
                    sizes="48px"
                    quality={55}
                    className="object-cover"
                  />
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-bold text-stone-900">
                  {c.reporte.nombre || "Sin nombre"} · {c.puntaje}%
                </span>
                <span className="block truncate text-xs text-stone-600">
                  📍 {c.reporte.barrio} · {c.razones.join(" · ")}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

type ReporteExistente = {
  id: string;
  nombre: string | null;
  tipo: TipoReporte;
  barrio: string;
  fecha: string;
  foto_url: string | null;
};

/**
 * Cuando el número ya tiene reportes activos, en vez de publicar de una le
 * preguntamos: casi siempre la persona quiere actualizar el que ya tenía y
 * termina creando un duplicado sin darse cuenta.
 */
function AvisoYaTienesReporte({
  reportes,
  onContinuar,
  onCancelar,
}: {
  reportes: ReporteExistente[];
  onContinuar: () => void;
  onCancelar: () => void;
}) {
  return (
    <div className="rounded-2xl border-2 border-amber-400 bg-amber-50 p-5">
      <h3 className="text-lg font-extrabold text-stone-900">
        ⚠️ Con este número ya hay {reportes.length === 1 ? "un reporte activo" : `${reportes.length} reportes activos`}
      </h3>
      <p className="mt-1 text-sm text-stone-700">
        Si es la misma mascota, no publiques otro: abre el reporte que ya tienes.
        Ahí puedes marcarla como encontrada cuando aparezca.
      </p>

      <ul className="mt-3 space-y-2">
        {reportes.map((r) => (
          <li key={r.id}>
            <Link
              href={`/mascota/${r.id}`}
              className="flex items-center gap-3 rounded-xl bg-white p-3 ring-1 ring-stone-200 transition hover:ring-marca"
            >
              <span className="relative block h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-stone-100">
                {r.foto_url && (
                  <Image
                    src={r.foto_url}
                    alt=""
                    fill
                    sizes="48px"
                    quality={55}
                    className="object-cover"
                  />
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-bold text-stone-900">
                  {r.nombre || "Sin nombre"}
                </span>
                <span className="block truncate text-xs text-stone-600">
                  {r.tipo === "perdida" ? "Se perdió" : "La encontraron"} · 📍 {r.barrio}
                </span>
              </span>
              <span className="shrink-0 text-sm font-bold text-marca">Ver →</span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <button type="button" onClick={onContinuar} className="boton-primario flex-1 py-2.5">
          Es otra mascota, publicar igual
        </button>
        <button type="button" onClick={onCancelar} className="boton-secundario py-2.5">
          Volver al formulario
        </button>
      </div>
    </div>
  );
}

function Titulo({ numero, texto }: { numero: number; texto: string }) {
  return (
    <h2 className="mb-4 flex items-center gap-2.5">
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-marca text-sm font-extrabold text-white">
        {numero}
      </span>
      <span className="text-base font-extrabold text-stone-900">{texto}</span>
    </h2>
  );
}

export default function FormularioReporte() {
  const router = useRouter();
  const params = useSearchParams();
  const formRef = useRef<HTMLFormElement>(null);

  const tipoInicial = (params.get("tipo") as TipoReporte) || "perdida";
  const [tipo, setTipo] = useState<TipoReporte>(
    tipoInicial === "encontrada" ? "encontrada" : "perdida",
  );
  const [especie, setEspecie] = useState("perro");
  // Si llega desde /pereira, la ciudad viene preseleccionada en la URL.
  const [ciudad, setCiudad] = useState(
    () => ciudadPorSlug(params.get("ciudad") ?? "")?.nombre ?? "",
  );
  const [otraCiudad, setOtraCiudad] = useState("");
  const [barrio, setBarrio] = useState("");
  const [otroBarrio, setOtroBarrio] = useState("");

  // Barrios de la ciudad elegida. Vacío = ciudad fuera del catálogo.
  const barriosDeCiudad =
    ciudad && ciudad !== OTRA_CIUDAD ? (ciudadPorNombre(ciudad)?.barrios ?? []) : [];
  const [previsualizacion, setPrevisualizacion] = useState<string | null>(null);
  const [archivoFoto, setArchivoFoto] = useState<File | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState<{ id: string; token: string } | null>(null);
  const [existentes, setExistentes] = useState<ReporteExistente[] | null>(null);
  const [revisando, setRevisando] = useState(false);
  const [preparandoFoto, setPreparandoFoto] = useState(false);
  /** Número de reintento en curso (0 = no estamos reintentando). */
  const [intentando, setIntentando] = useState(0);
  /** Tras fallar con foto, ofrecemos publicar sin ella: pesa mil veces menos. */
  const [puedeReintentarSinFoto, setPuedeReintentarSinFoto] = useState(false);
  const ultimosDatos = useRef<FormData | null>(null);
  const datosPendientes = useRef<FormData | null>(null);

  const hoy = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    return () => {
      if (previsualizacion?.startsWith("blob:")) URL.revokeObjectURL(previsualizacion);
    };
  }, [previsualizacion]);

  async function alElegirFoto(evento: React.ChangeEvent<HTMLInputElement>) {
    const original = evento.target.files?.[0];
    if (!original) {
      setArchivoFoto(null);
      setPrevisualizacion(null);
      return;
    }
    setError(null);
    setPreparandoFoto(true);
    try {
      const comprimida = await comprimirImagen(original);
      setArchivoFoto(comprimida);
      setPrevisualizacion(URL.createObjectURL(comprimida));
    } catch {
      setArchivoFoto(null);
      setPrevisualizacion(null);
      evento.target.value = "";
      setError(
        "No pudimos preparar esa foto. Intenta con otra, o tómale una captura de pantalla y sube esa.",
      );
    } finally {
      setPreparandoFoto(false);
    }
  }

  async function enviar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setError(null);

    const datos = new FormData(evento.currentTarget);
    datos.delete("foto");
    if (archivoFoto) datos.append("foto", archivoFoto);

    // Antes de publicar: ¿este número ya tiene reportes activos?
    setRevisando(true);
    try {
      const numero = String(datos.get("contacto_whatsapp") ?? "");
      const r = await fetch(
        `/api/reportes/existentes?whatsapp=${encodeURIComponent(numero)}`,
      );
      const cuerpo = await r.json();
      if (Array.isArray(cuerpo.reportes) && cuerpo.reportes.length > 0) {
        datosPendientes.current = datos;
        setExistentes(cuerpo.reportes as ReporteExistente[]);
        setRevisando(false);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
    } catch {
      /* si la revisión falla, seguimos: publicar es más importante */
    }
    setRevisando(false);

    await publicar(datos);
  }

  /** Reenvía lo mismo pero sin la foto, para que pase con señal mala. */
  async function publicarSinFoto() {
    const datos = ultimosDatos.current;
    if (!datos) return;
    datos.delete("foto");
    setPuedeReintentarSinFoto(false);
    await publicar(datos);
  }

  async function publicar(datos: FormData) {
    setError(null);
    setPuedeReintentarSinFoto(false);
    ultimosDatos.current = datos;
    setEnviando(true);

    try {
      const foto = datos.get("foto");
      if (foto instanceof File && foto.size > TOPE_FOTO) {
        throw new Error(
          "La foto quedó muy pesada para subirla. Intenta con otra foto o con una captura de pantalla.",
        );
      }

      // En datos móviles la subida se corta con frecuencia. Reintentamos solo
      // cuando la petición ni siquiera llegó: si el servidor respondió algo,
      // reintentar podría crear el reporte dos veces.
      let respuesta: Response | null = null;
      const intentos = 3;
      for (let intento = 1; intento <= intentos; intento++) {
        const cortar = new AbortController();
        const reloj = setTimeout(() => cortar.abort(), 45000);
        try {
          respuesta = await fetch("/api/reportes", {
            method: "POST",
            body: datos,
            signal: cortar.signal,
          });
          break;
        } catch {
          if (intento === intentos) {
            setPuedeReintentarSinFoto(
              datos.get("foto") instanceof File &&
                (datos.get("foto") as File).size > 0,
            );
            throw new Error(
              "No pudimos enviar el reporte: la conexión se cortó. Busca mejor señal o wifi y toca «Publicar reporte» otra vez — no se perdió nada de lo que escribiste.",
            );
          }
          setIntentando(intento + 1);
          await new Promise((r) => setTimeout(r, intento * 1500));
        } finally {
          clearTimeout(reloj);
        }
      }
      setIntentando(0);
      if (!respuesta) throw new Error("No pudimos enviar el reporte.");

      const cuerpo = await respuesta.json().catch(() => ({}) as { error?: string });
      if (!respuesta.ok) {
        if (respuesta.status === 413) {
          throw new Error("La foto pesa demasiado. Intenta con otra más liviana.");
        }
        throw new Error(cuerpo.error || "No pudimos guardar el reporte. Intenta de nuevo.");
      }

      try {
        const guardados = JSON.parse(localStorage.getItem("fyp-mis-reportes") || "[]");
        guardados.push({ id: cuerpo.id, token: cuerpo.token });
        localStorage.setItem("fyp-mis-reportes", JSON.stringify(guardados));
      } catch {
        /* si el navegador bloquea el almacenamiento no pasa nada */
      }

      setExistentes(null);
      datosPendientes.current = null;
      setExito({ id: cuerpo.id, token: cuerpo.token });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ocurrió un error inesperado.");
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    } finally {
      setEnviando(false);
      setIntentando(0);
    }
  }

  if (exito) {
    return (
      <div className="rounded-2xl border border-encontrada/30 bg-white p-6 text-center sm:p-10">
        <p className="text-5xl">🐾</p>
        <h2 className="mt-4 text-2xl font-extrabold text-stone-900">
          ¡Listo, tu reporte ya está publicado!
        </h2>
        <p className="mx-auto mt-2 max-w-md text-stone-600">
          Compártelo en los grupos de WhatsApp de tu barrio. Entre más ojos, más
          posibilidades.
        </p>

        <div className="mx-auto mt-6 max-w-md rounded-xl bg-amber-50 p-4 text-left text-sm text-amber-900">
          <p className="font-bold">Guarda este código: {exito.token}</p>
          <p className="mt-1">
            Lo vas a necesitar para marcar el reporte como resuelto cuando la mascota
            aparezca. Tómale una foto a esta pantalla.
          </p>
        </div>

        <a
          href={`/api/reportes/${exito.id}/afiche`}
          download
          className="boton-secundario mx-auto mt-4 w-full max-w-md"
        >
          🖼️ Descargar afiche para compartir
        </a>

        <SugerenciasTrasPublicar id={exito.id} tipo={tipo} />

        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href={`/mascota/${exito.id}`} className="boton-primario">
            Ver mi reporte
          </Link>
          <button
            type="button"
            className="boton-secundario"
            onClick={() => {
              setExito(null);
              setArchivoFoto(null);
              setPrevisualizacion(null);
              setBarrio("");
              setOtroBarrio("");
              formRef.current?.reset();
              router.refresh();
            }}
          >
            Publicar otro
          </button>
        </div>
      </div>
    );
  }

  const esPerdida = tipo === "perdida";

  return (
    <form ref={formRef} onSubmit={enviar} className="space-y-6 pb-2">
      {/* Trampa anti-spam, invisible para las personas */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden="true"
      />

      {existentes && (
        <AvisoYaTienesReporte
          reportes={existentes}
          onContinuar={() => {
            const datos = datosPendientes.current;
            setExistentes(null);
            if (datos) {
              datos.set("confirmado", "1");
              publicar(datos);
            }
          }}
          onCancelar={() => {
            setExistentes(null);
            datosPendientes.current = null;
          }}
        />
      )}

      <section className="rounded-2xl border border-stone-200 bg-white p-5">
        <Titulo numero={1} texto="¿Qué pasó?" />
        <input type="hidden" name="tipo" value={tipo} />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setTipo("perdida")}
            className={`rounded-xl border-2 p-4 text-left transition ${
              esPerdida
                ? "border-perdida bg-perdida-suave"
                : "border-stone-200 bg-white hover:border-stone-300"
            }`}
          >
            <span className="text-2xl">😿</span>
            <span className="mt-1 block font-extrabold text-stone-900">
              Perdí a mi mascota
            </span>
            <span className="text-sm text-stone-600">La estoy buscando</span>
          </button>
          <button
            type="button"
            onClick={() => setTipo("encontrada")}
            className={`rounded-xl border-2 p-4 text-left transition ${
              !esPerdida
                ? "border-encontrada bg-encontrada-suave"
                : "border-stone-200 bg-white hover:border-stone-300"
            }`}
          >
            <span className="text-2xl">🐕</span>
            <span className="mt-1 block font-extrabold text-stone-900">
              Encontré una mascota
            </span>
            <span className="text-sm text-stone-600">Busco a su familia</span>
          </button>
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-stone-200 bg-white p-5">
        <Titulo numero={2} texto="La mascota" />

        <div>
          <span className="etiqueta">Foto {esPerdida ? "(muy recomendada)" : ""}</span>
          <label
            htmlFor="foto"
            className="flex cursor-pointer items-center gap-4 rounded-xl border-2 border-dashed border-stone-300 p-4 transition hover:border-marca hover:bg-marca-suave/40"
          >
            {previsualizacion ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previsualizacion}
                alt="Vista previa"
                className="h-20 w-20 rounded-lg object-cover"
              />
            ) : (
              <span className="grid h-20 w-20 place-items-center rounded-lg bg-stone-100 text-3xl">
                {preparandoFoto ? "⏳" : "📷"}
              </span>
            )}
            <span className="text-sm text-stone-600">
              <span className="block font-bold text-stone-800">
                {preparandoFoto
                  ? "Preparando la foto…"
                  : previsualizacion
                    ? "Cambiar foto"
                    : "Toca para subir una foto"}
              </span>
              Desde la galería o la cámara. La reducimos automáticamente.
            </span>
          </label>
          <input
            id="foto"
            name="foto"
            type="file"
            accept="image/*"
            onChange={alElegirFoto}
            className="sr-only"
          />
        </div>

        <div>
          <span className="etiqueta">Tipo de mascota *</span>
          <div className="flex gap-2">
            {ESPECIES.map((e) => (
              <button
                key={e.valor}
                type="button"
                onClick={() => setEspecie(e.valor)}
                className={`flex-1 rounded-xl border-2 py-3 font-bold transition ${
                  especie === e.valor
                    ? "border-marca bg-marca-suave text-marca-oscuro"
                    : "border-stone-200 text-stone-600 hover:border-stone-300"
                }`}
              >
                {e.emoji} {e.etiqueta}
              </button>
            ))}
          </div>
          <input type="hidden" name="especie" value={especie} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="etiqueta" htmlFor="nombre">
              Nombre {esPerdida ? "" : "(si lo sabes)"}
            </label>
            <input
              id="nombre"
              name="nombre"
              className="campo"
              placeholder={esPerdida ? "Ej: Luna" : "Ej: tiene placa 'Rocky'"}
              maxLength={60}
            />
          </div>
          <div>
            <label className="etiqueta" htmlFor="raza">
              Raza
            </label>
            <input
              id="raza"
              name="raza"
              className="campo"
              placeholder="Ej: criollo, labrador, siamés"
              maxLength={60}
            />
          </div>
          <div>
            <label className="etiqueta" htmlFor="color">
              Color
            </label>
            <input
              id="color"
              name="color"
              className="campo"
              placeholder="Ej: café con blanco"
              maxLength={60}
            />
          </div>
          <div>
            <label className="etiqueta" htmlFor="tamano">
              Tamaño
            </label>
            <select id="tamano" name="tamano" className="campo" defaultValue="">
              <option value="">Sin especificar</option>
              {TAMANOS.map((t) => (
                <option key={t.valor} value={t.valor}>
                  {t.etiqueta}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="etiqueta" htmlFor="sexo">
              Sexo
            </label>
            <select id="sexo" name="sexo" className="campo" defaultValue="">
              <option value="">Sin especificar</option>
              {SEXOS.map((s) => (
                <option key={s.valor} value={s.valor}>
                  {s.etiqueta}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="etiqueta" htmlFor="descripcion">
            Señas particulares
          </label>
          <textarea
            id="descripcion"
            name="descripcion"
            rows={3}
            maxLength={600}
            className="campo"
            placeholder="Collar rojo, mancha en la pata, cojea un poquito, es miedosa con la gente…"
          />
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-stone-200 bg-white p-5">
        <Titulo numero={3} texto="¿Dónde y cuándo?" />
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="etiqueta" htmlFor="ciudad">
              Ciudad *
            </label>
            <select
              id="ciudad"
              className="campo"
              required
              value={ciudad}
              onChange={(e) => {
                setCiudad(e.target.value);
                // Los barrios dependen de la ciudad: al cambiarla, se reinicia.
                setBarrio("");
                setOtroBarrio("");
              }}
            >
              <option value="" disabled>
                Selecciona…
              </option>
              <optgroup label="Más afectadas por el sismo">
                {CIUDADES.filter((c) => c.afectada).map((c) => (
                  <option key={c.slug} value={c.nombre}>
                    {c.nombre} ({c.departamento})
                  </option>
                ))}
              </optgroup>
              <option value={OTRA_CIUDAD}>Mi ciudad no está en la lista…</option>
            </select>
            <input
              type="hidden"
              name="ciudad"
              value={ciudad === OTRA_CIUDAD ? otraCiudad.trim() : ciudad}
            />
            {ciudad === OTRA_CIUDAD && (
              <input
                className="campo mt-2"
                value={otraCiudad}
                onChange={(e) => setOtraCiudad(e.target.value)}
                placeholder="Escribe tu ciudad. Ej: Buenaventura"
                maxLength={60}
                required
                autoFocus
              />
            )}
          </div>

          <div>
            <label className="etiqueta" htmlFor="barrio">
              Barrio o zona *
            </label>
            {barriosDeCiudad.length > 0 ? (
              <>
                <select
                  id="barrio"
                  className="campo"
                  required
                  value={barrio}
                  onChange={(e) => setBarrio(e.target.value)}
                >
                  <option value="" disabled>
                    Selecciona…
                  </option>
                  {barriosDeCiudad.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                  <option value={OTRO_BARRIO}>Mi barrio no está en la lista…</option>
                </select>
                <input
                  type="hidden"
                  name="barrio"
                  value={barrio === OTRO_BARRIO ? otroBarrio.trim() : barrio}
                />
                {barrio === OTRO_BARRIO && (
                  <input
                    className="campo mt-2"
                    value={otroBarrio}
                    onChange={(e) => setOtroBarrio(e.target.value)}
                    placeholder="Escribe el barrio. Ej: El Bosque"
                    maxLength={60}
                    required
                    autoFocus
                  />
                )}
              </>
            ) : (
              // Ciudad fuera del catálogo: no tenemos barrios, se escribe.
              <input
                id="barrio"
                name="barrio"
                className="campo"
                value={otroBarrio}
                onChange={(e) => setOtroBarrio(e.target.value)}
                placeholder={
                  ciudad ? "Escribe el barrio. Ej: El Bosque" : "Primero elige la ciudad"
                }
                maxLength={60}
                required
                disabled={!ciudad}
              />
            )}
          </div>
          <div>
            <label className="etiqueta" htmlFor="fecha">
              Fecha en que {esPerdida ? "se perdió" : "la encontraste"} *
            </label>
            <input
              id="fecha"
              name="fecha"
              type="date"
              className="campo"
              required
              max={hoy}
              defaultValue={hoy}
            />
          </div>
        </div>
        <div>
          <label className="etiqueta" htmlFor="referencia">
            Punto de referencia
          </label>
          <input
            id="referencia"
            name="referencia"
            className="campo"
            maxLength={140}
            placeholder="Ej: cerca al parque, calle 65 con carrera 23"
          />
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-stone-200 bg-white p-5">
        <Titulo numero={4} texto="¿Cómo te contactamos?" />
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="etiqueta" htmlFor="contacto_nombre">
              Tu nombre *
            </label>
            <input
              id="contacto_nombre"
              name="contacto_nombre"
              className="campo"
              required
              maxLength={60}
              placeholder="Ej: Alejo"
            />
          </div>
          <div>
            <label className="etiqueta" htmlFor="contacto_whatsapp">
              Tu WhatsApp *
            </label>
            <input
              id="contacto_whatsapp"
              name="contacto_whatsapp"
              type="tel"
              inputMode="tel"
              className="campo"
              required
              maxLength={20}
              placeholder="Ej: 300 123 4567"
            />
          </div>
        </div>
        <p className="text-sm text-stone-500">
          Tu número queda visible para que te puedan escribir. No publiques datos que no
          quieras compartir.
        </p>
      </section>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-800"
        >
          {error}
          {puedeReintentarSinFoto && (
            <>
              <p className="mt-2 font-normal">
                Si la señal sigue mala, publica ya sin la foto: es mejor que el
                reporte esté arriba. Después puedes publicarlo de nuevo con foto.
              </p>
              <button
                type="button"
                onClick={publicarSinFoto}
                disabled={enviando}
                className="mt-3 w-full rounded-xl border-2 border-red-300 bg-white px-4 py-3 font-bold text-red-800 transition hover:bg-red-100 disabled:opacity-60"
              >
                Publicar sin la foto
              </button>
            </>
          )}
        </div>
      )}

      <div className="sticky bottom-0 z-10 -mx-4 border-t border-stone-200 bg-crema/95 px-4 py-3 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
        <button
          type="submit"
          disabled={enviando || revisando || preparandoFoto}
          className="boton-primario w-full py-4 shadow-lg"
        >
          {preparandoFoto
            ? "Preparando la foto…"
            : revisando
              ? "Revisando…"
              : intentando > 0
                ? `Reintentando (${intentando} de 3)…`
                : enviando
                  ? "Publicando…"
                  : "Publicar reporte"}
        </button>
        <p className="mt-2 text-center text-xs text-stone-500 sm:hidden">
          Al publicar aceptas que tu nombre y WhatsApp queden visibles.
        </p>
      </div>
    </form>
  );
}
