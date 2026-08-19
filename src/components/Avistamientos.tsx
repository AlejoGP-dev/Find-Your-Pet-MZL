"use client";

import { useEffect, useRef, useState } from "react";
import { useTokenGuardado } from "@/lib/misReportes";
import {
  formatearFecha,
  haceCuanto,
  normalizarWhatsapp,
  type Avistamiento,
  type TipoReporte,
} from "@/lib/tipos";

export default function Avistamientos({
  reporteId,
  tipo,
  resuelto,
  iniciales,
}: {
  reporteId: string;
  tipo: TipoReporte;
  resuelto: boolean;
  iniciales: Avistamiento[];
}) {
  const [lista, setLista] = useState<Avistamiento[]>(iniciales);
  const [abierto, setAbierto] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [listo, setListo] = useState(false);

  const hoy = new Date().toISOString().slice(0, 10);

  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (temporizador.current) clearTimeout(temporizador.current);
  }, []);
  const [lugar, setLugar] = useState("");
  const [fecha, setFecha] = useState(hoy);
  const [comentario, setComentario] = useState("");
  const [nombre, setNombre] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [trampa, setTrampa] = useState("");

  const token = useTokenGuardado(reporteId);

  async function enviar(evento: React.FormEvent) {
    evento.preventDefault();
    setError(null);
    setEnviando(true);
    try {
      const respuesta = await fetch(`/api/reportes/${reporteId}/avistamientos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lugar,
          fecha,
          comentario,
          nombre,
          whatsapp,
          website: trampa,
        }),
      });
      const cuerpo = await respuesta.json();
      if (!respuesta.ok) throw new Error(cuerpo.error || "No pudimos guardar la pista.");

      setLista((previa) => [cuerpo.avistamiento as Avistamiento, ...previa]);
      setLugar("");
      setComentario("");
      setNombre("");
      setWhatsapp("");
      setFecha(hoy);
      setAbierto(false);
      setListo(true);
      // WPO-024: guardado en una ref para poder cancelarlo si el componente
      // se desmonta antes de los 5 s (o si se manda otra pista seguida).
      if (temporizador.current) clearTimeout(temporizador.current);
      temporizador.current = setTimeout(() => setListo(false), 5000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ocurrió un error.");
    } finally {
      setEnviando(false);
    }
  }

  async function borrar(id: string) {
    if (!token) return;
    try {
      const respuesta = await fetch(`/api/avistamientos/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      if (!respuesta.ok) {
        const cuerpo = await respuesta.json();
        throw new Error(cuerpo.error || "No pudimos borrar la pista.");
      }
      setLista((previa) => previa.filter((a) => a.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ocurrió un error.");
    }
  }

  const pregunta =
    tipo === "perdida" ? "¿La has visto por ahí?" : "¿La reconoces o sabes de quién es?";

  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-lg font-extrabold text-stone-900">
          Pistas de la comunidad 👀
          {lista.length > 0 && (
            <span className="rounded-full bg-marca-suave px-2.5 py-0.5 text-sm font-bold text-marca-oscuro">
              {lista.length}
            </span>
          )}
        </h2>
        {!resuelto && !abierto && (
          <button
            type="button"
            onClick={() => setAbierto(true)}
            className="rounded-xl bg-marca px-4 py-2 text-sm font-bold text-white transition hover:bg-marca-oscuro"
          >
            Dejar una pista
          </button>
        )}
      </div>

      {!abierto && !resuelto && (
        <p className="mt-2 text-sm text-stone-600">
          {pregunta} Cuenta dónde y cuándo, aunque no hayas podido cogerla. Una pista
          puede ser justo lo que faltaba.
        </p>
      )}

      {listo && (
        <p className="mt-3 rounded-xl bg-encontrada-suave p-3 text-sm font-bold text-encontrada">
          ¡Gracias! Tu pista ya quedó publicada. 🙌
        </p>
      )}

      {abierto && (
        <form onSubmit={enviar} className="mt-4 space-y-3">
          <input
            type="text"
            value={trampa}
            onChange={(e) => setTrampa(e.target.value)}
            tabIndex={-1}
            autoComplete="off"
            className="hidden"
            aria-hidden="true"
          />
          <div>
            <label className="etiqueta" htmlFor="lugar">
              ¿Dónde la viste? *
            </label>
            <input
              id="lugar"
              value={lugar}
              onChange={(e) => setLugar(e.target.value)}
              className="campo"
              placeholder="Ej: por el parque de Chipre, calle 20 con carrera 12"
              maxLength={140}
              required
              autoFocus
            />
          </div>
          <div>
            <label className="etiqueta" htmlFor="fecha-avistamiento">
              ¿Cuándo? *
            </label>
            <input
              id="fecha-avistamiento"
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="campo"
              max={hoy}
              required
            />
          </div>
          <div>
            <label className="etiqueta" htmlFor="comentario">
              ¿Algo más que ayude?
            </label>
            <textarea
              id="comentario"
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              rows={2}
              maxLength={500}
              className="campo"
              placeholder="Iba sola, se veía asustada, se metió hacia la quebrada…"
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="etiqueta" htmlFor="nombre-pista">
                Tu nombre (opcional)
              </label>
              <input
                id="nombre-pista"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="campo"
                maxLength={60}
                placeholder="Ej: Camila"
              />
            </div>
            <div>
              <label className="etiqueta" htmlFor="whatsapp-pista">
                Tu WhatsApp (opcional)
              </label>
              <input
                id="whatsapp-pista"
                type="tel"
                inputMode="tel"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="campo"
                maxLength={20}
                placeholder="Por si necesitan preguntarte"
              />
            </div>
          </div>

          {error && (
            <p className="text-sm font-semibold text-red-700">{error}</p>
          )}

          <div className="flex gap-2">
            <button type="submit" disabled={enviando} className="boton-primario flex-1 py-2.5">
              {enviando ? "Publicando…" : "Publicar pista"}
            </button>
            <button
              type="button"
              onClick={() => setAbierto(false)}
              className="boton-secundario py-2.5"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {lista.length > 0 ? (
        <ol className="mt-5 space-y-3">
          {lista.map((a) => (
            <li
              key={a.id}
              className="relative rounded-xl border border-stone-200 bg-stone-50 p-4"
            >
              <p className="font-bold text-stone-900">{a.lugar} 📍</p>
              <p className="mt-0.5 text-sm text-stone-600">
                La vieron el {formatearFecha(a.fecha)}
              </p>
              {a.comentario && (
                <p className="mt-2 text-stone-700">{a.comentario}</p>
              )}
              <p className="mt-2 text-xs text-stone-500">
                {a.nombre ? <strong>{a.nombre}</strong> : "Anónimo"} · {haceCuanto(a.created_at)}
                {a.whatsapp && (
                  <>
                    {" · "}
                    <a
                      className="font-semibold text-marca underline"
                      href={`https://wa.me/${normalizarWhatsapp(a.whatsapp)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Escribirle
                    </a>
                  </>
                )}
              </p>
              {token && (
                <button
                  type="button"
                  onClick={() => borrar(a.id)}
                  className="absolute right-3 top-3 text-xs font-semibold text-stone-400 underline hover:text-red-600"
                  title="Borrar esta pista (solo tú puedes)"
                >
                  Borrar
                </button>
              )}
            </li>
          ))}
        </ol>
      ) : (
        !abierto && (
          <p className="mt-4 rounded-xl border border-dashed border-stone-300 p-4 text-center text-sm text-stone-500">
            Todavía nadie ha dejado una pista.
          </p>
        )
      )}
    </section>
  );
}
