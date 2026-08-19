"use client";

import { useEffect, useId, useRef, useState } from "react";
import { buscarMunicipios, type Municipio } from "@/lib/municipios";
import { CIUDADES } from "@/lib/tipos";

/**
 * Selector de ciudad para todo el país.
 *
 * Reemplaza al `<select>` de 8 ciudades más el campo «mi ciudad no está en la
 * lista». Ese diseño tenía dos problemas: quien vivía fuera de esas 8 escribía
 * el nombre a mano —y por eso hoy conviven «Bogotá» y «Bogota» en la base— y
 * su ciudad nunca podía tener página propia.
 *
 * Se deja escribir libre a propósito. Si alguien reporta desde un corregimiento
 * que no está en la lista oficial, tiene que poder publicar igual: perder un
 * reporte de una mascota perdida por un problema de catálogo sería absurdo.
 */
export default function SelectorCiudad({
  valor,
  alCambiar,
  nombreCampo = "ciudad",
  id = "ciudad",
  requerido = true,
}: {
  valor: string;
  alCambiar: (ciudad: string) => void;
  nombreCampo?: string;
  id?: string;
  requerido?: boolean;
}) {
  const [texto, setTexto] = useState(valor);
  const [abierto, setAbierto] = useState(false);
  const [sugerencias, setSugerencias] = useState<Municipio[]>([]);
  const [resaltado, setResaltado] = useState(0);
  const contenedor = useRef<HTMLDivElement>(null);
  const idLista = useId();

  // Si el valor llega de fuera (por ejemplo, del ?ciudad= de la URL), se refleja.
  const [valorPrevio, setValorPrevio] = useState(valor);
  if (valor !== valorPrevio) {
    setValorPrevio(valor);
    setTexto(valor);
  }

  useEffect(() => {
    if (!abierto) return;
    const alClicFuera = (e: MouseEvent) => {
      if (!contenedor.current?.contains(e.target as Node)) setAbierto(false);
    };
    document.addEventListener("mousedown", alClicFuera);
    return () => document.removeEventListener("mousedown", alClicFuera);
  }, [abierto]);

  function escribir(nuevo: string) {
    setTexto(nuevo);
    alCambiar(nuevo);
    const encontradas = buscarMunicipios(nuevo, 8);
    setSugerencias(encontradas);
    setResaltado(0);
    setAbierto(encontradas.length > 0);
  }

  function elegir(m: Municipio) {
    setTexto(m.nombre);
    alCambiar(m.nombre);
    setAbierto(false);
    setSugerencias([]);
  }

  function alTeclear(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!abierto || sugerencias.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setResaltado((i) => (i + 1) % sugerencias.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setResaltado((i) => (i - 1 + sugerencias.length) % sugerencias.length);
    } else if (e.key === "Enter") {
      // Solo intercepta el Enter si hay una sugerencia marcada: si no,
      // estaría bloqueando el envío del formulario.
      e.preventDefault();
      elegir(sugerencias[resaltado]);
    } else if (e.key === "Escape") {
      setAbierto(false);
    }
  }

  return (
    <div ref={contenedor} className="relative">
      <input
        id={id}
        className="campo"
        value={texto}
        onChange={(e) => escribir(e.target.value)}
        onKeyDown={alTeclear}
        onFocus={() => sugerencias.length > 0 && setAbierto(true)}
        placeholder="Escribe tu ciudad. Ej: Manizales"
        maxLength={60}
        required={requerido}
        autoComplete="off"
        role="combobox"
        aria-expanded={abierto}
        aria-controls={idLista}
        aria-autocomplete="list"
      />
      {/* El valor que viaja al servidor es el mismo que se ve: si la persona
          eligió de la lista, es el nombre oficial del municipio. */}
      <input type="hidden" name={nombreCampo} value={texto.trim()} />

      {abierto && sugerencias.length > 0 && (
        <ul
          id={idLista}
          role="listbox"
          className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-xl border border-stone-300 bg-white shadow-lg"
        >
          {sugerencias.map((m, i) => (
            <li key={m.slug}>
              <button
                type="button"
                role="option"
                aria-selected={i === resaltado}
                onMouseEnter={() => setResaltado(i)}
                onClick={() => elegir(m)}
                className={`flex w-full items-baseline justify-between gap-2 px-3.5 py-2.5 text-left transition ${
                  i === resaltado ? "bg-marca-suave" : "hover:bg-stone-50"
                }`}
              >
                <span className="font-semibold text-stone-800">{m.nombre}</span>
                {m.departamento !== m.nombre && (
                  <span className="shrink-0 text-xs text-stone-500">
                    {m.departamento}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Atajos a las ciudades del sismo: siguen siendo el grueso de los
          reportes y ahorran escribir. */}
      {!texto && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {CIUDADES.filter((c) => c.afectada).map((c) => (
            <button
              key={c.slug}
              type="button"
              onClick={() => {
                setTexto(c.nombre);
                alCambiar(c.nombre);
              }}
              className="rounded-full bg-stone-100 px-3 py-1.5 text-xs font-bold text-stone-600 transition hover:bg-marca-suave hover:text-marca-oscuro"
            >
              {c.nombre}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
