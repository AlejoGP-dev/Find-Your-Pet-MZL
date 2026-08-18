"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTokenGuardado } from "@/lib/misReportes";
import type { TipoReporte } from "@/lib/tipos";

export default function AccionesReporte({
  id,
  tipo,
  resuelto,
}: {
  id: string;
  tipo: TipoReporte;
  resuelto: boolean;
}) {
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [copiado, setCopiado] = useState(false);

  // Si el reporte se publicó desde este mismo dispositivo, ya tenemos el código.
  const guardado = useTokenGuardado(id);
  // Si el código guardado resulta no servir (lo cambiaron, o el reporte es de
  // otra persona), caemos al formulario manual.
  const [rechazado, setRechazado] = useState(false);
  const [tokenManual, setTokenManual] = useState("");
  const miReporte = Boolean(guardado) && !rechazado;
  const token = miReporte ? guardado! : tokenManual;
  const setToken = setTokenManual;

  async function compartir() {
    const url = window.location.href;
    const datos = {
      title: "Find Your Pet CO",
      text: "Ayúdanos a encontrar esta mascota 🐾",
      url,
    };
    if (navigator.share) {
      try {
        await navigator.share(datos);
        return;
      } catch {
        /* el usuario canceló */
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } catch {
      setError("No pudimos copiar el enlace. Cópialo desde la barra del navegador.");
    }
  }

  async function marcarResuelto(codigo: string) {
    setError(null);
    setEnviando(true);
    try {
      const respuesta = await fetch(`/api/reportes/${id}/resuelto`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: codigo }),
      });
      const cuerpo = await respuesta.json();
      if (!respuesta.ok) throw new Error(cuerpo.error || "No pudimos actualizar.");
      setAbierto(false);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ocurrió un error.");
      // Dejamos el código escrito en la caja para que se pueda corregir.
      setTokenManual(codigo);
      setRechazado(true);
    } finally {
      setEnviando(false);
    }
  }

  const textoBoton =
    tipo === "perdida" ? "¡Mi mascota apareció! 🎉" : "Ya la entregué a su familia 🎉";

  return (
    <div className="space-y-3">
      {!resuelto && (
        <>
          {miReporte ? (
            <button
              type="button"
              onClick={() => marcarResuelto(token)}
              disabled={enviando}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-encontrada px-5 py-3.5 text-base font-extrabold text-white shadow-sm transition hover:brightness-95 disabled:opacity-60"
            >
              {enviando ? "Guardando…" : textoBoton}
            </button>
          ) : abierto ? (
            <div className="rounded-xl border border-stone-200 bg-white p-4">
              <label className="etiqueta" htmlFor="token">
                Código de gestión
              </label>
              <p className="mb-2 text-sm text-stone-500">
                Es el código que te dimos al publicar el reporte.
              </p>
              <input
                id="token"
                value={token}
                onChange={(e) => setToken(e.target.value.toUpperCase())}
                className="campo"
                placeholder="Ej: 661EC69F7E"
                maxLength={12}
                autoFocus
              />
              {error && (
                <p className="mt-2 text-sm font-semibold text-red-700">{error}</p>
              )}
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => marcarResuelto(token)}
                  disabled={enviando || token.trim().length < 4}
                  className="boton-primario flex-1 py-2.5"
                >
                  {enviando ? "Guardando…" : "Confirmar"}
                </button>
                <button
                  type="button"
                  onClick={() => setAbierto(false)}
                  className="boton-secundario py-2.5"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setAbierto(true)}
              className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-encontrada/40 bg-encontrada-suave px-5 py-3 text-base font-extrabold text-encontrada transition hover:bg-encontrada hover:text-white"
            >
              {textoBoton}
            </button>
          )}
        </>
      )}

      <button type="button" onClick={compartir} className="boton-secundario w-full">
        {copiado ? "Enlace copiado ✅" : "Compartir este reporte 🔗"}
      </button>

      {error && !abierto && (
        <p className="text-center text-sm font-semibold text-red-700">{error}</p>
      )}
    </div>
  );
}
