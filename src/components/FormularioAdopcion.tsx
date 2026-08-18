"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import {
  CONVIVENCIAS,
  EDADES,
  ESPECIES_ADOPCION,
  TERNARIAS,
  VACUNAS,
} from "@/lib/adopciones";
import {
  CIUDADES,
  OTRA_CIUDAD,
  OTRO_BARRIO,
  SEXOS,
  TAMANOS,
  ciudadPorNombre,
  ciudadPorSlug,
} from "@/lib/tipos";

const OBJETIVO_FOTO = 1.5 * 1024 * 1024;
const TOPE_FOTO = 3.5 * 1024 * 1024;

/** Mismo decodificador del formulario de reportes: HEIC y Android viejos. */
async function decodificar(archivo: File) {
  try {
    const bitmap = await createImageBitmap(archivo);
    return {
      fuente: bitmap as CanvasImageSource,
      ancho: bitmap.width,
      alto: bitmap.height,
      limpiar: () => bitmap.close?.(),
    };
  } catch {
    const url = URL.createObjectURL(archivo);
    try {
      const img = await new Promise<HTMLImageElement>((res, rej) => {
        const el = new window.Image();
        el.onload = () => res(el);
        el.onerror = () => rej(new Error("no se pudo leer la imagen"));
        el.src = url;
      });
      return {
        fuente: img as CanvasImageSource,
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

async function comprimir(archivo: File): Promise<File> {
  const { fuente, ancho: aO, alto: altO, limpiar } = await decodificar(archivo);
  try {
    let mejor: File | null = null;
    for (const [lado, calidad] of [
      [1400, 0.82],
      [1200, 0.75],
      [1000, 0.7],
      [800, 0.65],
    ] as const) {
      const escala = Math.min(1, lado / Math.max(aO, altO));
      const w = Math.max(1, Math.round(aO * escala));
      const h = Math.max(1, Math.round(altO * escala));
      const lienzo = document.createElement("canvas");
      lienzo.width = w;
      lienzo.height = h;
      const ctx = lienzo.getContext("2d");
      if (!ctx) break;
      ctx.drawImage(fuente, 0, 0, w, h);
      const blob = await new Promise<Blob | null>((r) =>
        lienzo.toBlob(r, "image/jpeg", calidad),
      );
      if (!blob) break;
      mejor = new File([blob], "mascota.jpg", { type: "image/jpeg" });
      if (blob.size <= OBJETIVO_FOTO) break;
    }
    if (!mejor) {
      if (archivo.size > TOPE_FOTO) throw new Error("foto muy pesada");
      return archivo;
    }
    return mejor.size < archivo.size ? mejor : archivo;
  } finally {
    limpiar();
  }
}

type Posible = {
  reporte: { id: string; nombre: string | null; barrio: string; ciudad: string; foto_url: string | null };
  puntaje: number;
  razones: string[];
};

/**
 * Aviso cuando la mascota se parece a alguna que están buscando.
 * Es lo más importante del formulario: no bloquea, pero obliga a mirar.
 */
function AvisoPosiblesDuenos({
  lista,
  onRevisar,
  onSeguir,
}: {
  lista: Posible[];
  onRevisar: () => void;
  onSeguir: () => void;
}) {
  return (
    <div className="rounded-2xl border-2 border-perdida bg-perdida-suave p-5">
      <h3 className="text-lg font-extrabold text-perdida">
        Espera: puede que alguien esté buscando a esta mascota 🛑
      </h3>
      <p className="mt-2 text-stone-800">
        Encontramos {lista.length}{" "}
        {lista.length === 1 ? "mascota perdida que se parece" : "mascotas perdidas que se parecen"} a
        la que vas a dar en adopción, en la misma ciudad. Míralas antes de seguir:
        una adopción no se deshace fácil.
      </p>

      <ul className="mt-4 space-y-2">
        {lista.map((c) => (
          <li key={c.reporte.id}>
            <Link
              href={`/mascota/${c.reporte.id}`}
              target="_blank"
              className="flex items-center gap-3 rounded-xl bg-white p-3 ring-1 ring-stone-200 transition hover:ring-perdida"
            >
              <span className="relative block h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-stone-100">
                {c.reporte.foto_url && (
                  <Image
                    src={c.reporte.foto_url}
                    alt=""
                    fill
                    sizes="56px"
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
                  {c.reporte.barrio} · {c.razones.join(" · ")} 📍
                </span>
              </span>
              <span className="shrink-0 text-xs font-bold text-marca">Abrir ↗</span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-5 flex flex-col gap-2">
        <button type="button" onClick={onRevisar} className="boton-primario">
          Voy a revisarlas primero
        </button>
        <button
          type="button"
          onClick={onSeguir}
          className="rounded-xl border-2 border-stone-300 bg-white px-4 py-3 font-bold text-stone-700 transition hover:bg-stone-50"
        >
          Ninguna es — publicar de todas formas
        </button>
      </div>
    </div>
  );
}

/**
 * Encabezado numerado de cada sección.
 *
 * Va a nivel de módulo y no dentro del formulario: definido adentro, React lo
 * trataba como un componente nuevo en cada render y desmontaba y volvía a
 * montar toda la sección, perdiendo el foco mientras se escribe.
 */
function Titulo({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <h2 className="mb-4 flex items-center gap-2.5 text-lg font-extrabold text-stone-900">
      <span className="grid h-7 w-7 place-items-center rounded-full bg-marca text-sm text-white">
        {n}
      </span>
      {children}
    </h2>
  );
}

export default function FormularioAdopcion() {
  const params = useSearchParams();

  const [ciudad, setCiudad] = useState(
    () => ciudadPorSlug(params.get("ciudad") ?? "")?.nombre ?? "",
  );
  const [otraCiudad, setOtraCiudad] = useState("");
  const [barrio, setBarrio] = useState("");
  const [otroBarrio, setOtroBarrio] = useState("");

  const [archivoFoto, setArchivoFoto] = useState<File | null>(null);
  const [previa, setPrevia] = useState<string | null>(null);
  const [preparando, setPreparando] = useState(false);

  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [posibles, setPosibles] = useState<Posible[] | null>(null);
  const [exito, setExito] = useState<{ id: string; token: string } | null>(null);

  const barriosDeCiudad =
    ciudad && ciudad !== OTRA_CIUDAD ? (ciudadPorNombre(ciudad)?.barrios ?? []) : [];

  async function alElegirFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const original = e.target.files?.[0];
    if (!original) {
      setArchivoFoto(null);
      setPrevia(null);
      return;
    }
    setError(null);
    setPreparando(true);
    try {
      const c = await comprimir(original);
      setArchivoFoto(c);
      setPrevia(URL.createObjectURL(c));
    } catch {
      setArchivoFoto(null);
      setPrevia(null);
      e.target.value = "";
      setError("No pudimos preparar esa foto. Intenta con otra.");
    } finally {
      setPreparando(false);
    }
  }

  async function enviar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const datos = new FormData(evento.currentTarget);
    datos.delete("foto");
    if (archivoFoto) datos.append("foto", archivoFoto);
    await publicar(datos);
  }

  async function publicar(datos: FormData) {
    setError(null);
    setEnviando(true);
    try {
      let respuesta: Response | null = null;
      for (let intento = 1; intento <= 3; intento++) {
        const cortar = new AbortController();
        const reloj = setTimeout(() => cortar.abort(), 45000);
        try {
          respuesta = await fetch("/api/adopciones", {
            method: "POST",
            body: datos,
            signal: cortar.signal,
          });
          break;
        } catch {
          if (intento === 3)
            throw new Error(
              "No pudimos enviar la publicación: la conexión se cortó. Busca mejor señal e intenta otra vez.",
            );
          await new Promise((r) => setTimeout(r, intento * 1500));
        } finally {
          clearTimeout(reloj);
        }
      }
      if (!respuesta) throw new Error("No pudimos enviar la publicación.");

      const cuerpo = await respuesta.json().catch(() => ({}));

      // El servidor encontró mascotas perdidas parecidas.
      if (respuesta.status === 409 && cuerpo.error === "posibles_duenos") {
        setPosibles(cuerpo.coincidencias as Posible[]);
        setPendiente(datos);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      if (!respuesta.ok) throw new Error(cuerpo.error || "No pudimos publicar.");

      try {
        const g = JSON.parse(localStorage.getItem("fyp-mis-adopciones") || "[]");
        g.push({ id: cuerpo.id, token: cuerpo.token });
        localStorage.setItem("fyp-mis-adopciones", JSON.stringify(g));
      } catch {
        /* si el navegador bloquea el almacenamiento, no pasa nada */
      }

      setPosibles(null);
      setExito({ id: cuerpo.id, token: cuerpo.token });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ocurrió un error inesperado.");
    } finally {
      setEnviando(false);
    }
  }

  const [pendiente, setPendiente] = useState<FormData | null>(null);

  function seguirDeTodasFormas() {
    if (!pendiente) return;
    pendiente.set("confirmado", "1");
    setPosibles(null);
    publicar(pendiente);
  }

  if (exito) {
    return (
      <div className="rounded-2xl border border-stone-200 bg-white p-8 text-center">
        <p className="text-5xl">🏡</p>
        <h2 className="mt-4 text-2xl font-extrabold text-stone-900">
          ¡Listo, ya está publicada!
        </h2>
        <p className="mt-2 text-stone-600">
          Compártela para que llegue a más gente. Entre más ojos, más rápido
          encuentra familia.
        </p>

        <div className="mx-auto mt-6 max-w-md rounded-xl bg-amber-50 p-4 text-left">
          <p className="font-bold text-amber-900">
            Guarda este código: {exito.token}
          </p>
          <p className="mt-1 text-sm text-amber-900">
            Lo necesitas para marcarla como reservada o adoptada. Tómale una foto a
            esta pantalla.
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-2">
          <Link href={`/adopcion/mascota/${exito.id}`} className="boton-primario">
            Ver la publicación
          </Link>
          <Link href="/adopcion" className="boton-secundario">
            Volver a adopciones
          </Link>
        </div>
      </div>
    );
  }

  if (posibles) {
    return (
      <AvisoPosiblesDuenos
        lista={posibles}
        onRevisar={() => {
          setPosibles(null);
          setPendiente(null);
        }}
        onSeguir={seguirDeTodasFormas}
      />
    );
  }

  return (
    <form onSubmit={enviar} className="space-y-5">
      <input type="text" name="website" className="hidden" tabIndex={-1} autoComplete="off" />

      {/* 1 · La mascota */}
      <section className="rounded-2xl border border-stone-200 bg-white p-5">
        <Titulo n={1}>¿Quién busca hogar?</Titulo>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <span className="etiqueta">Foto *</span>
            <label
              htmlFor="foto"
              className="flex cursor-pointer items-center gap-4 rounded-xl border-2 border-dashed border-stone-300 p-4 transition hover:border-marca hover:bg-marca-suave/40"
            >
              {previa ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={previa} alt="Vista previa" className="h-20 w-20 rounded-lg object-cover" />
              ) : (
                <span className="grid h-20 w-20 place-items-center rounded-lg bg-stone-100 text-3xl">
                  {preparando ? "⏳" : "📷"}
                </span>
              )}
              <span className="text-sm text-stone-600">
                <span className="block font-bold text-stone-800">
                  {preparando ? "Preparando la foto…" : previa ? "Cambiar foto" : "Toca para subir una foto"}
                </span>
                Una foto buena es lo que más ayuda a que la adopten.
              </span>
            </label>
            <input
              id="foto"
              name="foto"
              type="file"
              accept="image/*"
              onChange={alElegirFoto}
              className="hidden"
            />
          </div>

          <div>
            <label className="etiqueta" htmlFor="especie">Perro o gato *</label>
            <select id="especie" name="especie" className="campo" required defaultValue="">
              <option value="" disabled>Selecciona…</option>
              {ESPECIES_ADOPCION.map((e) => (
                <option key={e.valor} value={e.valor}>{e.etiqueta} {e.emoji}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="etiqueta" htmlFor="nombre">Nombre</label>
            <input id="nombre" name="nombre" className="campo" maxLength={40} placeholder="Si ya tiene" />
          </div>

          <div>
            <label className="etiqueta" htmlFor="edad">Edad aproximada</label>
            <select id="edad" name="edad" className="campo" defaultValue="">
              <option value="">No sé</option>
              {EDADES.map((e) => (
                <option key={e.valor} value={e.valor}>{e.etiqueta} ({e.pista})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="etiqueta" htmlFor="sexo">Sexo</label>
            <select id="sexo" name="sexo" className="campo" defaultValue="">
              <option value="">No sé</option>
              {SEXOS.filter((s) => s.valor !== "no_se").map((s) => (
                <option key={s.valor} value={s.valor}>{s.etiqueta}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="etiqueta" htmlFor="raza">Raza</label>
            <input id="raza" name="raza" className="campo" maxLength={40} placeholder="Criollo, mestizo…" />
          </div>

          <div>
            <label className="etiqueta" htmlFor="color">Color</label>
            <input id="color" name="color" className="campo" maxLength={60} />
          </div>

          <div>
            <label className="etiqueta" htmlFor="tamano">Tamaño</label>
            <select id="tamano" name="tamano" className="campo" defaultValue="">
              <option value="">No sé</option>
              {TAMANOS.map((t) => (
                <option key={t.valor} value={t.valor}>{t.etiqueta}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* 2 · Salud y convivencia */}
      <section className="rounded-2xl border border-stone-200 bg-white p-5">
        <Titulo n={2}>Salud y convivencia</Titulo>
        <p className="-mt-2 mb-4 text-sm text-stone-600">
          Si no sabes algo, deja &laquo;No sé&raquo;. Es mejor que inventar.
        </p>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="etiqueta" htmlFor="esterilizado">Esterilizado</label>
            <select id="esterilizado" name="esterilizado" className="campo" defaultValue="no_se">
              {TERNARIAS.map((t) => (
                <option key={t.valor} value={t.valor}>{t.etiqueta}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="etiqueta" htmlFor="vacunas">Vacunas</label>
            <select id="vacunas" name="vacunas" className="campo" defaultValue="no_se">
              {VACUNAS.map((v) => (
                <option key={v.valor} value={v.valor}>{v.etiqueta}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="etiqueta" htmlFor="desparasitado">Desparasitado</label>
            <select id="desparasitado" name="desparasitado" className="campo" defaultValue="no_se">
              {TERNARIAS.map((t) => (
                <option key={t.valor} value={t.valor}>{t.etiqueta}</option>
              ))}
            </select>
          </div>
        </div>

        <fieldset className="mt-4">
          <span className="etiqueta">Convive bien con</span>
          <div className="flex flex-wrap gap-2">
            {CONVIVENCIAS.map((c) => (
              <label
                key={c.valor}
                className="flex cursor-pointer items-center gap-2 rounded-xl border border-stone-300 px-3.5 py-2.5 text-sm font-bold text-stone-700 transition has-checked:border-marca has-checked:bg-marca-suave has-checked:text-marca-oscuro"
              >
                <input type="checkbox" name="convive_con" value={c.valor} className="accent-marca" />
                {c.etiqueta} {c.emoji}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="mt-4">
          <label className="etiqueta" htmlFor="temperamento">Cómo es</label>
          <textarea
            id="temperamento"
            name="temperamento"
            className="campo"
            rows={2}
            maxLength={300}
            placeholder="Tranquilo, juguetón, miedoso con ruidos fuertes…"
          />
        </div>
      </section>

      {/* 3 · Dónde está */}
      <section className="rounded-2xl border border-stone-200 bg-white p-5">
        <Titulo n={3}>¿Dónde está?</Titulo>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="etiqueta" htmlFor="ciudad">Ciudad *</label>
            <select
              id="ciudad"
              className="campo"
              required
              value={ciudad}
              onChange={(e) => {
                setCiudad(e.target.value);
                setBarrio("");
                setOtroBarrio("");
              }}
            >
              <option value="" disabled>Selecciona…</option>
              <optgroup label="Más afectadas por el sismo">
                {CIUDADES.filter((c) => c.afectada).map((c) => (
                  <option key={c.slug} value={c.nombre}>{c.nombre} ({c.departamento})</option>
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
                placeholder="Escribe tu ciudad"
                maxLength={60}
                required
                autoFocus
              />
            )}
          </div>

          <div>
            <label className="etiqueta" htmlFor="barrio">Barrio o zona *</label>
            {barriosDeCiudad.length > 0 ? (
              <>
                <select
                  id="barrio"
                  className="campo"
                  required
                  value={barrio}
                  onChange={(e) => setBarrio(e.target.value)}
                >
                  <option value="" disabled>Selecciona…</option>
                  {barriosDeCiudad.map((b) => (
                    <option key={b} value={b}>{b}</option>
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
                    placeholder="Escribe el barrio"
                    maxLength={60}
                    required
                    autoFocus
                  />
                )}
              </>
            ) : (
              <input
                id="barrio"
                name="barrio"
                className="campo"
                value={otroBarrio}
                onChange={(e) => setOtroBarrio(e.target.value)}
                placeholder={ciudad ? "Escribe el barrio" : "Primero elige la ciudad"}
                maxLength={60}
                required
                disabled={!ciudad}
              />
            )}
          </div>

          <div className="sm:col-span-2">
            <label className="etiqueta" htmlFor="descripcion">Algo más que contar</label>
            <textarea
              id="descripcion"
              name="descripcion"
              className="campo"
              rows={3}
              maxLength={500}
              placeholder="Su historia, cuidados especiales, cómo llegó…"
            />
          </div>

          <div>
            <label className="etiqueta" htmlFor="motivo">Por qué se da en adopción</label>
            <input id="motivo" name="motivo" className="campo" maxLength={120} />
          </div>

          <div>
            <label className="etiqueta" htmlFor="entrego_con">Se entrega con</label>
            <input
              id="entrego_con"
              name="entrego_con"
              className="campo"
              maxLength={120}
              placeholder="Carnet, guacal, alimento…"
            />
          </div>
        </div>
      </section>

      {/* 4 · Contacto */}
      <section className="rounded-2xl border border-stone-200 bg-white p-5">
        <Titulo n={4}>¿Cómo te contactamos?</Titulo>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="etiqueta" htmlFor="contacto_nombre">Tu nombre *</label>
            <input id="contacto_nombre" name="contacto_nombre" className="campo" required maxLength={60} />
          </div>
          <div>
            <label className="etiqueta" htmlFor="contacto_whatsapp">Tu WhatsApp *</label>
            <input
              id="contacto_whatsapp"
              name="contacto_whatsapp"
              className="campo"
              required
              inputMode="tel"
              maxLength={20}
              placeholder="3001234567"
            />
          </div>
        </div>
        <p className="mt-2 text-sm text-stone-500">
          Tu número queda visible para que te puedan escribir.
        </p>
      </section>

      {/* 5 · Compromiso */}
      <section className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-5">
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            name="compromiso"
            value="1"
            required
            className="mt-1 h-5 w-5 shrink-0 accent-marca"
          />
          <span className="text-sm text-amber-950">
            Confirmo que <strong>esta mascota no tiene una familia buscándola</strong>,
            que <strong>no cobro dinero</strong> por entregarla, y que entiendo que
            Find Your Pet CO no verifica a quien adopta ni interviene en la entrega.
          </span>
        </label>
      </section>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-800"
        >
          {error}
        </div>
      )}

      <div className="sticky bottom-0 z-10 -mx-4 border-t border-stone-200 bg-crema/95 px-4 py-3 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
        <button
          type="submit"
          disabled={enviando || preparando}
          className="boton-primario w-full py-4 shadow-lg"
        >
          {preparando ? "Preparando la foto…" : enviando ? "Publicando…" : "Publicar en adopción"}
        </button>
        <p className="mt-2 text-center text-xs text-stone-500">
          Al publicar aceptas que tu nombre y WhatsApp queden visibles, los{" "}
          <Link href="/terminos" className="underline underline-offset-2">
            términos
          </Link>{" "}
          y el{" "}
          <Link href="/datos" className="underline underline-offset-2">
            tratamiento de datos
          </Link>
          .
        </p>
      </div>
    </form>
  );
}
