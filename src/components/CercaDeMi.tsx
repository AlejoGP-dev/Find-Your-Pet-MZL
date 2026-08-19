"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  distanciaKm,
  formatearDistancia,
  RADIOS,
  RADIO_POR_DEFECTO,
  type Punto,
  type Radio,
} from "@/lib/geo";

export type UbicacionReporte = {
  id: string;
  lat: number;
  lng: number;
  /** true cuando el punto es el centro del municipio, no el sitio del hecho. */
  aprox: boolean;
};

type Estado =
  | { paso: "inactivo" }
  | { paso: "pidiendo" }
  | { paso: "activo"; punto: Punto }
  | { paso: "error"; mensaje: string };

/**
 * Filtro «mascotas reportadas cerca de ti».
 *
 * Dos decisiones que vale la pena dejar escritas:
 *
 * 1. La ubicación de quien busca NUNCA sale del navegador. No va al servidor,
 *    no va en la URL, no queda en los logs de nadie. Solo llegan acá los
 *    puntos de los reportes —que ya son públicos— y la cuenta se hace en el
 *    teléfono de la persona. Para una página que usa gente en un momento
 *    vulnerable, esa es la única versión defendible.
 *
 * 2. Se ordenan y ocultan las tarjetas que ya pintó el servidor, en vez de
 *    volver a renderizarlas acá. Así el HTML sigue siendo el mismo para Google
 *    y para quien no tenga JS, y al navegador solo bajan tres datos por
 *    reporte (id y coordenada) en lugar de la ficha completa.
 */
export default function CercaDeMi({
  ubicaciones,
  sinUbicacion,
}: {
  ubicaciones: UbicacionReporte[];
  /** Cuántos reportes visibles no tienen coordenada. Se dice, no se esconde. */
  sinUbicacion: number;
}) {
  const [estado, setEstado] = useState<Estado>({ paso: "inactivo" });
  const [radio, setRadio] = useState<Radio>(RADIO_POR_DEFECTO);

  // Las distancias son un cálculo, no un estado: salen de la ubicación y del
  // radio. Guardarlas en useState obligaría a un render extra y abriría la
  // puerta a que la cifra en pantalla y la lista en el DOM se desincronicen.
  const cercanas = useMemo(() => {
    if (estado.paso !== "activo") return null;
    const punto = estado.punto;
    return ubicaciones
      .map((u) => ({
        id: u.id,
        aprox: u.aprox,
        km: distanciaKm(punto, { lat: u.lat, lng: u.lng }),
      }))
      .sort((a, b) => a.km - b.km);
  }, [estado, ubicaciones]);

  const dentroDelRadio = cercanas?.filter((c) => c.km <= radio) ?? [];
  const masCercano = cercanas && cercanas.length > 0 ? cercanas[0].km : null;

  // Guarda las tarjetas que tocamos, para poder dejarlas como estaban.
  const tocadas = useRef<HTMLElement[]>([]);

  const limpiar = useCallback(() => {
    for (const tarjeta of tocadas.current) {
      tarjeta.style.removeProperty("order");
      tarjeta.hidden = false;
      const marca = tarjeta.querySelector<HTMLElement>("[data-distancia]");
      if (marca) {
        marca.textContent = "";
        marca.hidden = true;
      }
    }
    tocadas.current = [];
  }, []);

  // El único trabajo del efecto es sincronizar el DOM que pintó el servidor
  // con lo que ya calculamos arriba.
  useEffect(() => {
    if (!cercanas) {
      limpiar();
      return;
    }

    const tarjetas = [
      ...document.querySelectorAll<HTMLElement>("[data-reporte-id]"),
    ];
    tocadas.current = tarjetas;

    const porTarjeta = new Map(
      tarjetas.map((t) => [t.dataset.reporteId ?? "", t]),
    );

    // Primero se ocultan todas: las que no tienen coordenada no pueden quedar
    // mezcladas, porque se leerían como si también estuvieran cerca.
    for (const tarjeta of tarjetas) tarjeta.hidden = true;

    let posicion = 0;
    for (const { id, km, aprox } of cercanas) {
      if (km > radio) continue;
      const tarjeta = porTarjeta.get(id);
      if (!tarjeta) continue;

      tarjeta.hidden = false;
      // El orden visual sigue la distancia; el DOM se queda quieto.
      tarjeta.style.order = String(posicion);
      posicion += 1;

      const marca = tarjeta.querySelector<HTMLElement>("[data-distancia]");
      if (marca) {
        // Sin el «aprox.» esto sería mentir con una cifra: en los reportes
        // viejos el punto es el centro del municipio, no donde pasó la cosa.
        marca.textContent = aprox
          ? `a ${formatearDistancia(km)} (aprox., desde el centro de ${tarjeta.dataset.ciudad || "la ciudad"})`
          : `a ${formatearDistancia(km)} de ti`;
        marca.hidden = false;
      }
    }

    return limpiar;
  }, [cercanas, radio, limpiar]);

  // Si la persona se va de la página, las tarjetas quedan como estaban.
  useEffect(() => limpiar, [limpiar]);

  function pedirUbicacion() {
    if (!("geolocation" in navigator)) {
      setEstado({
        paso: "error",
        mensaje: "Tu navegador no permite compartir la ubicación.",
      });
      return;
    }
    setEstado({ paso: "pidiendo" });
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setEstado({
          paso: "activo",
          punto: { lat: pos.coords.latitude, lng: pos.coords.longitude },
        }),
      (fallo) =>
        setEstado({
          paso: "error",
          mensaje:
            fallo.code === fallo.PERMISSION_DENIED
              ? "No diste permiso de ubicación. Puedes buscar por ciudad en los filtros de abajo."
              : "No pudimos obtener tu ubicación. Prueba filtrando por ciudad.",
        }),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    );
  }

  if (ubicaciones.length === 0) return null;

  if (estado.paso === "activo") {
    return (
      <div className="mb-5 rounded-2xl border border-marca/30 bg-marca-suave p-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="font-extrabold text-marca-oscuro">
            {dentroDelRadio.length === 0
              ? `Ninguna a menos de ${radio} km`
              : `${dentroDelRadio.length} ${dentroDelRadio.length === 1 ? "mascota" : "mascotas"} a menos de ${radio} km de ti 📍`}
          </p>
          <button
            type="button"
            onClick={() => setEstado({ paso: "inactivo" })}
            className="text-sm font-bold text-stone-600 underline hover:text-stone-800"
          >
            Ver todas otra vez
          </button>
        </div>

        {dentroDelRadio.length === 0 && masCercano !== null && (
          <p className="mt-1 text-sm text-stone-600">
            La más cercana está a {formatearDistancia(masCercano)}. Prueba con un
            radio más amplio.
          </p>
        )}

        <div className="mt-3 flex flex-wrap gap-1.5">
          {RADIOS.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRadio(r)}
              aria-pressed={r === radio}
              className={`rounded-full px-3 py-1.5 text-sm font-bold transition ${
                r === radio
                  ? "bg-marca text-white"
                  : "bg-white text-stone-600 hover:bg-stone-100"
              }`}
            >
              {r} km
            </button>
          ))}
        </div>

        <p className="mt-3 text-xs text-stone-500">
          Tu ubicación se usa solo en este dispositivo: no se envía a ningún
          servidor ni queda guardada.
          {sinUbicacion > 0 &&
            ` ${sinUbicacion} ${sinUbicacion === 1 ? "reporte no tiene" : "reportes no tienen"} ubicación registrada y no ${sinUbicacion === 1 ? "aparece" : "aparecen"} en este filtro.`}
        </p>
      </div>
    );
  }

  return (
    <div className="mb-5">
      <button
        type="button"
        onClick={pedirUbicacion}
        disabled={estado.paso === "pidiendo"}
        className="boton-secundario w-full justify-center border-marca/40 text-marca sm:w-auto disabled:opacity-60"
      >
        {estado.paso === "pidiendo"
          ? "Buscando tu ubicación…"
          : "Ver las que están cerca de mí 📍"}
      </button>
      {estado.paso === "error" && (
        <p className="mt-2 text-sm text-stone-600">{estado.mensaje}</p>
      )}
    </div>
  );
}
