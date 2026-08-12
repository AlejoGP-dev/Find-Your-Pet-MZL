"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  ESPECIES,
  OTRO_BARRIO,
  SEXOS,
  TAMANOS,
  UBICACIONES,
  type TipoReporte,
} from "@/lib/tipos";

/** Reduce la foto en el navegador para que suba rápido incluso con mala señal. */
async function comprimirImagen(archivo: File): Promise<File> {
  if (!archivo.type.startsWith("image/")) return archivo;
  try {
    const bitmap = await createImageBitmap(archivo);
    const maxLado = 1400;
    const escala = Math.min(1, maxLado / Math.max(bitmap.width, bitmap.height));
    const ancho = Math.round(bitmap.width * escala);
    const alto = Math.round(bitmap.height * escala);

    const lienzo = document.createElement("canvas");
    lienzo.width = ancho;
    lienzo.height = alto;
    const ctx = lienzo.getContext("2d");
    if (!ctx) return archivo;
    ctx.drawImage(bitmap, 0, 0, ancho, alto);
    bitmap.close?.();

    const blob = await new Promise<Blob | null>((resolve) =>
      lienzo.toBlob(resolve, "image/jpeg", 0.82),
    );
    if (!blob || blob.size >= archivo.size) return archivo;
    return new File([blob], "mascota.jpg", { type: "image/jpeg" });
  } catch {
    return archivo;
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
              <span className="h-12 w-12 shrink-0 overflow-hidden rounded-md bg-stone-100">
                {c.reporte.foto_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={c.reporte.foto_url}
                    alt=""
                    className="h-full w-full object-cover"
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
  const [barrio, setBarrio] = useState("");
  const [otroBarrio, setOtroBarrio] = useState("");
  const [previsualizacion, setPrevisualizacion] = useState<string | null>(null);
  const [archivoFoto, setArchivoFoto] = useState<File | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState<{ id: string; token: string } | null>(null);

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
    const comprimida = await comprimirImagen(original);
    setArchivoFoto(comprimida);
    setPrevisualizacion(URL.createObjectURL(comprimida));
  }

  async function enviar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setError(null);
    setEnviando(true);

    try {
      const datos = new FormData(evento.currentTarget);
      datos.delete("foto");
      if (archivoFoto) datos.append("foto", archivoFoto);

      const respuesta = await fetch("/api/reportes", { method: "POST", body: datos });
      const cuerpo = await respuesta.json();
      if (!respuesta.ok) throw new Error(cuerpo.error || "No pudimos guardar el reporte.");

      try {
        const guardados = JSON.parse(localStorage.getItem("fyp-mis-reportes") || "[]");
        guardados.push({ id: cuerpo.id, token: cuerpo.token });
        localStorage.setItem("fyp-mis-reportes", JSON.stringify(guardados));
      } catch {
        /* si el navegador bloquea el almacenamiento no pasa nada */
      }

      setExito({ id: cuerpo.id, token: cuerpo.token });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ocurrió un error inesperado.");
    } finally {
      setEnviando(false);
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
                📷
              </span>
            )}
            <span className="text-sm text-stone-600">
              <span className="block font-bold text-stone-800">
                {previsualizacion ? "Cambiar foto" : "Toca para subir una foto"}
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
            <label className="etiqueta" htmlFor="barrio">
              Barrio o zona *
            </label>
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
              {UBICACIONES.map((grupo) => (
                <optgroup key={grupo.ciudad} label={grupo.ciudad}>
                  {grupo.barrios.map((b) => (
                    <option key={b} value={b}>
                      {b.replace(" (Villamaría)", "")}
                    </option>
                  ))}
                </optgroup>
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
                placeholder="Escribe el barrio y el municipio. Ej: El Bosque, Villamaría"
                maxLength={60}
                required
                autoFocus
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
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-800">
          {error}
        </div>
      )}

      <div className="sticky bottom-0 z-10 -mx-4 border-t border-stone-200 bg-crema/95 px-4 py-3 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
        <button type="submit" disabled={enviando} className="boton-primario w-full py-4 shadow-lg">
          {enviando ? "Publicando…" : "Publicar reporte"}
        </button>
        <p className="mt-2 text-center text-xs text-stone-500 sm:hidden">
          Al publicar aceptas que tu nombre y WhatsApp queden visibles.
        </p>
      </div>
    </form>
  );
}
