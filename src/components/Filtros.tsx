"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { CIUDADES, ESPECIES, type Ciudad } from "@/lib/tipos";

const PESTANAS = [
  { clave: "todas", etiqueta: "Todas", tipo: "", estado: "" },
  { clave: "perdida", etiqueta: "Perdidas", tipo: "perdida", estado: "" },
  { clave: "encontrada", etiqueta: "Encontradas", tipo: "encontrada", estado: "" },
  { clave: "reunidas", etiqueta: "🎉 Ya aparecieron", tipo: "", estado: "resuelto" },
];

export default function Filtros({
  ciudad = null,
  base = "/",
}: {
  /** Ciudad activa: si viene, el selector de barrios es solo de esa ciudad. */
  ciudad?: Ciudad | null;
  /** Ruta sobre la que se arman los filtros ("/" o "/pereira"). */
  base?: string;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [pendiente, iniciar] = useTransition();
  const [busqueda, setBusqueda] = useState(params.get("q") ?? "");

  function actualizar(cambios: Record<string, string>) {
    const nuevos = new URLSearchParams(params.toString());
    for (const [clave, valor] of Object.entries(cambios)) {
      if (valor) nuevos.set(clave, valor);
      else nuevos.delete(clave);
    }
    iniciar(() => {
      router.push(`${base}?${nuevos.toString()}#reportes`, { scroll: false });
    });
  }

  const tipoActual = params.get("tipo") ?? "";
  const especieActual = params.get("especie") ?? "";
  const barrioActual = params.get("barrio") ?? "";
  const ciudadActual = params.get("ciudad") ?? "";
  const estadoActual = params.get("estado") ?? "";

  const pestanaActual =
    estadoActual === "resuelto" ? "reunidas" : tipoActual || "todas";

  const hayFiltros = Boolean(
    tipoActual ||
      especieActual ||
      barrioActual ||
      ciudadActual ||
      estadoActual ||
      params.get("q"),
  );

  return (
    <div className="space-y-3">
      {/* Fila de filtros: apilada en móvil, todo en una línea en escritorio */}
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        {/* Pestañas: 2x2 en móvil */}
        <div className="grid grid-cols-2 gap-1 rounded-xl border border-stone-300 bg-white p-1 sm:flex sm:shrink-0">
          {PESTANAS.map((p) => (
            <button
              key={p.clave}
              type="button"
              onClick={() => actualizar({ tipo: p.tipo, estado: p.estado })}
              className={`whitespace-nowrap rounded-lg px-3 py-2.5 text-sm font-bold transition ${
                pestanaActual === p.clave
                  ? p.clave === "reunidas"
                    ? "bg-encontrada text-white"
                    : "bg-marca text-white"
                  : "text-stone-600 hover:bg-stone-100"
              }`}
            >
              {p.etiqueta}
            </button>
          ))}
        </div>

        {/* Selectores: dos columnas en móvil, en la misma fila en escritorio */}
        <div className="grid grid-cols-2 gap-2 sm:contents">
          <select
            value={especieActual}
            onChange={(e) => actualizar({ especie: e.target.value })}
            className="w-full min-w-0 rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-sm font-semibold text-stone-700 outline-none focus:border-marca sm:w-auto"
            aria-label="Filtrar por tipo de mascota"
          >
            <option value="">Perros y gatos</option>
            {ESPECIES.map((e) => (
              <option key={e.valor} value={e.valor}>
                {e.emoji} {e.etiqueta}
              </option>
            ))}
          </select>

          {ciudad ? (
            <select
              value={barrioActual}
              onChange={(e) => actualizar({ barrio: e.target.value })}
              className="w-full min-w-0 rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-sm font-semibold text-stone-700 outline-none focus:border-marca sm:w-auto"
              aria-label="Filtrar por barrio"
            >
              <option value="">Todos los barrios</option>
              {ciudad.barrios.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          ) : (
            <select
              value={ciudadActual}
              onChange={(e) => actualizar({ ciudad: e.target.value, barrio: "" })}
              className="w-full min-w-0 rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-sm font-semibold text-stone-700 outline-none focus:border-marca sm:w-auto"
              aria-label="Filtrar por ciudad"
            >
              <option value="">Todas las ciudades</option>
              {CIUDADES.map((c) => (
                <option key={c.slug} value={c.nombre}>
                  {c.nombre}
                </option>
              ))}
            </select>
          )}

          {hayFiltros && (
            <button
              type="button"
              onClick={() => {
                setBusqueda("");
                actualizar({
                  tipo: "",
                  especie: "",
                  barrio: "",
                  ciudad: "",
                  q: "",
                  estado: "",
                });
              }}
              className="col-span-2 whitespace-nowrap text-sm font-semibold text-stone-500 underline underline-offset-2 hover:text-stone-700"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          actualizar({ q: busqueda.trim() });
        }}
        className="flex gap-2"
      >
        <input
          type="search"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder={
            ciudad
              ? "Buscar por nombre, raza, color o barrio…"
              : "Buscar por nombre, raza, color o ciudad…"
          }
          className="campo py-2.5"
          aria-label="Buscar mascotas"
        />
        <button type="submit" className="boton-secundario px-4 py-2.5">
          Buscar
        </button>
      </form>

      {pendiente && <p className="text-sm text-stone-500">Actualizando…</p>}
    </div>
  );
}
