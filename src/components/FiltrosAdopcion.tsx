"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import Icono, { type NombreIcono } from "@/components/Icono";
import { EDADES, ESPECIES_ADOPCION } from "@/lib/adopciones";
import type { CiudadConReportes } from "@/lib/ciudades";
import { TAMANOS, type Ciudad } from "@/lib/tipos";

const PESTANAS: {
  clave: string;
  etiqueta: string;
  icono?: NombreIcono;
  estado: string;
}[] = [
  { clave: "disponible", etiqueta: "Disponibles", estado: "" },
  {
    clave: "adoptado",
    etiqueta: "Ya tienen hogar",
    icono: "sparkles",
    estado: "adoptado",
  },
];

export default function FiltrosAdopcion({
  ciudad = null,
  base = "/adopcion",
  ciudades = [],
}: {
  ciudad?: Ciudad | null;
  base?: string;
  /** Ciudades con adopciones publicadas, calculadas en el servidor. */
  ciudades?: CiudadConReportes[];
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
      router.push(`${base}?${nuevos.toString()}#listado`, { scroll: false });
    });
  }

  const estadoActual = params.get("estado") ?? "";
  const especieActual = params.get("especie") ?? "";
  const edadActual = params.get("edad") ?? "";
  const tamanoActual = params.get("tamano") ?? "";
  const ciudadActual = params.get("ciudad") ?? "";

  const hayFiltros = Boolean(
    especieActual || edadActual || tamanoActual || ciudadActual || params.get("q"),
  );

  const selector =
    "w-full min-w-0 rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-sm font-semibold text-stone-700 outline-none focus:border-marca sm:w-auto";

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="grid grid-cols-2 gap-1 rounded-xl border border-stone-300 bg-white p-1 sm:flex sm:shrink-0">
          {PESTANAS.map((p) => (
            <button
              key={p.clave}
              type="button"
              onClick={() => actualizar({ estado: p.estado })}
              className={`inline-flex items-center justify-center gap-1 whitespace-nowrap rounded-lg px-3 py-2.5 text-sm font-bold transition ${
                (estadoActual === "adoptado" ? "adoptado" : "disponible") === p.clave
                  ? p.clave === "adoptado"
                    ? "bg-encontrada text-white"
                    : "bg-marca text-white"
                  : "text-stone-600 hover:bg-stone-100"
              }`}
            >
              {p.etiqueta}
              {p.icono && <Icono nombre={p.icono} />}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2 sm:contents">
          <select
            value={especieActual}
            onChange={(e) => actualizar({ especie: e.target.value })}
            className={selector}
            aria-label="Filtrar por tipo de mascota"
          >
            <option value="">Perros y gatos</option>
            {/* En un <option> solo cabe texto plano: la especie va sin icono. */}
            {ESPECIES_ADOPCION.map((e) => (
              <option key={e.valor} value={e.valor}>
                {e.etiqueta}
              </option>
            ))}
          </select>

          <select
            value={edadActual}
            onChange={(e) => actualizar({ edad: e.target.value })}
            className={selector}
            aria-label="Filtrar por edad"
          >
            <option value="">Cualquier edad</option>
            {EDADES.map((e) => (
              <option key={e.valor} value={e.valor}>
                {e.etiqueta}
              </option>
            ))}
          </select>

          <select
            value={tamanoActual}
            onChange={(e) => actualizar({ tamano: e.target.value })}
            className={selector}
            aria-label="Filtrar por tamaño"
          >
            <option value="">Cualquier tamaño</option>
            {TAMANOS.map((t) => (
              <option key={t.valor} value={t.valor}>
                {t.etiqueta}
              </option>
            ))}
          </select>

          {!ciudad && (
            <select
              value={ciudadActual}
              onChange={(e) => actualizar({ ciudad: e.target.value })}
              className={selector}
              aria-label="Filtrar por ciudad"
            >
              <option value="">Todas las ciudades</option>
              {ciudades.map((c) => (
                <option key={c.nombre} value={c.nombre}>
                  {c.nombre} ({c.reportes})
                </option>
              ))}
            </select>
          )}

          {hayFiltros && (
            <button
              type="button"
              onClick={() => {
                setBusqueda("");
                actualizar({ especie: "", edad: "", tamano: "", ciudad: "", q: "" });
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
          placeholder="Buscar por nombre, raza, color o barrio…"
          className="campo py-2.5"
          aria-label="Buscar mascotas en adopción"
        />
        <button type="submit" className="boton-secundario px-4 py-2.5">
          Buscar
        </button>
      </form>

      {pendiente && <p className="text-sm text-stone-500">Actualizando…</p>}
    </div>
  );
}
