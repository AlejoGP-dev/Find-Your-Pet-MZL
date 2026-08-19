"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { EstadoAdopcion } from "@/lib/adopciones";

/**
 * Solo quien publicó puede cambiar el estado, con el código que le dimos.
 * Mismo mecanismo que el de "ya apareció" en los reportes.
 */
export default function GestionAdopcion({
  id,
  estado,
}: {
  id: string;
  estado: EstadoAdopcion;
}) {
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);
  const [token, setToken] = useState("");
  const [nuevo, setNuevo] = useState<EstadoAdopcion>(
    estado === "disponible" ? "reservado" : "adoptado",
  );
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function guardar() {
    setError(null);
    setEnviando(true);
    try {
      const r = await fetch(`/api/adopciones/${id}/estado`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, estado: nuevo }),
      });
      const cuerpo = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(cuerpo.error || "No pudimos actualizar.");
      setAbierto(false);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error inesperado.");
    } finally {
      setEnviando(false);
    }
  }

  if (estado === "adoptado") return null;

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-4">
      {!abierto ? (
        <button
          type="button"
          onClick={() => setAbierto(true)}
          className="w-full text-sm font-bold text-marca underline underline-offset-2"
        >
          Publiqué esta adopción — actualizar estado
        </button>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-stone-600">
            Escribe el código de gestión que te dimos al publicar.
          </p>
          <input
            className="campo"
            value={token}
            onChange={(e) => setToken(e.target.value.toUpperCase())}
            placeholder="Ej: A1B2C3D4E5"
            maxLength={12}
            autoFocus
          />
          <select
            className="campo"
            value={nuevo}
            onChange={(e) => setNuevo(e.target.value as EstadoAdopcion)}
          >
            <option value="disponible">Sigue disponible</option>
            <option value="reservado">Reservada — alguien está en proceso</option>
            <option value="adoptado">Ya tiene hogar</option>
          </select>

          {error && (
            <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-800">
              {error}
            </p>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={guardar}
              disabled={enviando || token.length < 6}
              className="boton-primario flex-1 disabled:opacity-60"
            >
              {enviando ? "Guardando…" : "Guardar"}
            </button>
            <button
              type="button"
              onClick={() => setAbierto(false)}
              className="boton-secundario"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
