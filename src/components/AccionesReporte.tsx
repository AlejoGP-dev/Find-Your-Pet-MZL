"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AccionesReporte({ id }: { id: string }) {
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);
  const [token, setToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [copiado, setCopiado] = useState(false);

  async function compartir() {
    const url = window.location.href;
    const datos = {
      title: "Find Your Pet MZL",
      text: "Ayúdanos a encontrar esta mascota en Manizales 🐾",
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

  async function marcarResuelto() {
    setError(null);
    setEnviando(true);
    try {
      const respuesta = await fetch(`/api/reportes/${id}/resuelto`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const cuerpo = await respuesta.json();
      if (!respuesta.ok) throw new Error(cuerpo.error || "No pudimos actualizar.");
      setAbierto(false);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ocurrió un error.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="space-y-3">
      <button type="button" onClick={compartir} className="boton-secundario w-full">
        {copiado ? "✅ Enlace copiado" : "🔗 Compartir este reporte"}
      </button>

      {abierto ? (
        <div className="rounded-xl border border-stone-200 bg-white p-4">
          <label className="etiqueta" htmlFor="token">
            Código de gestión
          </label>
          <input
            id="token"
            value={token}
            onChange={(e) => setToken(e.target.value.toUpperCase())}
            className="campo"
            placeholder="El código que te dimos al publicar"
            maxLength={12}
          />
          {error && <p className="mt-2 text-sm font-semibold text-red-700">{error}</p>}
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={marcarResuelto}
              disabled={enviando || token.length < 4}
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
          className="w-full text-sm font-semibold text-stone-500 underline underline-offset-2 hover:text-stone-700"
        >
          Soy quien publicó y ya apareció 🎉
        </button>
      )}
    </div>
  );
}
