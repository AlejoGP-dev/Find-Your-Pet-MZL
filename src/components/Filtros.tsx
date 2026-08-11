"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { ESPECIES, UBICACIONES } from "@/lib/tipos";

const PESTANAS = [
  { clave: "todas", etiqueta: "Todas", tipo: "", estado: "" },
  { clave: "perdida", etiqueta: "Perdidas", tipo: "perdida", estado: "" },
  { clave: "encontrada", etiqueta: "Encontradas", tipo: "encontrada", estado: "" },
  { clave: "reunidas", etiqueta: "🎉 Ya aparecieron", tipo: "", estado: "resuelto" },
];

export default function Filtros() {
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
      router.push(`/?${nuevos.toString()}#reportes`, { scroll: false });
    });
  }

  const tipoActual = params.get("tipo") ?? "";
  const especieActual = params.get("especie") ?? "";
  const barrioActual = params.get("barrio") ?? "";
  const estadoActual = params.get("estado") ?? "";

  const pestanaActual =
    estadoActual === "resuelto" ? "reunidas" : tipoActual || "todas";

  const hayFiltros = Boolean(
    tipoActual || especieActual || barrioActual || estadoActual || params.get("q"),
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap rounded-xl border border-stone-300 bg-white p-1">
          {PESTANAS.map((p) => (
            <button
              key={p.clave}
              type="button"
              onClick={() => actualizar({ tipo: p.tipo, estado: p.estado })}
              className={`rounded-lg px-4 py-2 text-sm font-bold transition ${
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

        <select
          value={especieActual}
          onChange={(e) => actualizar({ especie: e.target.value })}
          className="rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-sm font-semibold text-stone-700 outline-none focus:border-marca"
          aria-label="Filtrar por tipo de mascota"
        >
          <option value="">Perros y gatos</option>
          {ESPECIES.map((e) => (
            <option key={e.valor} value={e.valor}>
              {e.emoji} {e.etiqueta}
            </option>
          ))}
        </select>

        <select
          value={barrioActual}
          onChange={(e) => actualizar({ barrio: e.target.value })}
          className="rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-sm font-semibold text-stone-700 outline-none focus:border-marca"
          aria-label="Filtrar por barrio"
        >
          <option value="">Todos los barrios</option>
          {UBICACIONES.map((grupo) => (
            <optgroup key={grupo.ciudad} label={grupo.ciudad}>
              {grupo.barrios.map((b) => (
                <option key={b} value={b}>
                  {b.replace(" (Villamaría)", "")}
                </option>
              ))}
            </optgroup>
          ))}
        </select>

        {hayFiltros && (
          <button
            type="button"
            onClick={() => {
              setBusqueda("");
              actualizar({ tipo: "", especie: "", barrio: "", q: "", estado: "" });
            }}
            className="text-sm font-semibold text-stone-500 underline underline-offset-2 hover:text-stone-700"
          >
            Limpiar filtros
          </button>
        )}
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
