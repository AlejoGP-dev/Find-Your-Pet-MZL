"use client";

import { useState } from "react";
import Icono from "@/components/Icono";
import { redondearCoordenada, dentroDeColombia } from "@/lib/geo";

type Estado =
  | { paso: "inactivo" }
  | { paso: "pidiendo" }
  | { paso: "lista"; lat: number; lng: number }
  | { paso: "error"; mensaje: string };

/**
 * Compartir la ubicación al publicar, opcional.
 *
 * Sin esto, el reporte se guarda con el centro del municipio y en el filtro
 * «cerca de mí» aparece a la distancia de la ciudad, no de la cuadra. Con
 * esto, alguien que vive a tres cuadras lo ve como lo que es: al lado.
 *
 * La coordenada se redondea a ~110 m antes de mandarla. La página es pública
 * y quien pierde una mascota casi siempre la pierde cerca de su casa: no hay
 * ninguna razón para publicar el punto exacto de nadie.
 */
export default function CampoUbicacion() {
  const [estado, setEstado] = useState<Estado>({ paso: "inactivo" });

  function pedir() {
    if (!("geolocation" in navigator)) {
      setEstado({
        paso: "error",
        mensaje: "Tu navegador no permite compartir la ubicación.",
      });
      return;
    }

    setEstado({ paso: "pidiendo" });
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = redondearCoordenada(pos.coords.latitude);
        const lng = redondearCoordenada(pos.coords.longitude);
        if (!dentroDeColombia({ lat, lng })) {
          setEstado({
            paso: "error",
            mensaje:
              "La ubicación que devolvió tu dispositivo queda fuera de Colombia. Puedes seguir sin ella.",
          });
          return;
        }
        setEstado({ paso: "lista", lat, lng });
      },
      (fallo) => {
        setEstado({
          paso: "error",
          mensaje:
            fallo.code === fallo.PERMISSION_DENIED
              ? "No diste permiso de ubicación. No hay problema: se usa la de tu ciudad."
              : "No pudimos obtener tu ubicación. Puedes publicar igual.",
        });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  }

  if (estado.paso === "lista") {
    return (
      <div className="rounded-xl border border-marca/30 bg-marca-suave p-4">
        <input type="hidden" name="lat" value={estado.lat} />
        <input type="hidden" name="lng" value={estado.lng} />
        <p className="flex items-center gap-1.5 text-sm font-bold text-marca-oscuro">
          Ubicación agregada <Icono nombre="ubicacion" />
        </p>
        <p className="mt-1 text-sm text-stone-600">
          Se guarda aproximada, con un margen de unos 100 metros — nunca la
          dirección exacta. Sirve para que quien esté cerca vea tu reporte de
          primero.
        </p>
        <button
          type="button"
          onClick={() => setEstado({ paso: "inactivo" })}
          className="mt-2 text-sm font-bold text-stone-500 underline hover:text-stone-700"
        >
          Quitar la ubicación
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-dashed border-stone-300 bg-stone-50 p-4">
      <p className="text-sm font-bold text-stone-700">
        ¿Compartes el punto donde fue? (opcional)
      </p>
      <p className="mt-1 text-sm text-stone-600">
        Así tu reporte le aparece de primero a los vecinos que estén cerca. Se
        guarda aproximado, con un margen de unos 100 metros. Si prefieres no
        hacerlo, se usa el centro de tu ciudad y listo.
      </p>
      <button
        type="button"
        onClick={pedir}
        disabled={estado.paso === "pidiendo"}
        className="boton-secundario mt-3 disabled:opacity-60"
      >
        {estado.paso === "pidiendo" ? (
          "Buscando…"
        ) : (
          <>
            Usar mi ubicación <Icono nombre="ubicacion" />
          </>
        )}
      </button>
      {estado.paso === "error" && (
        <p className="mt-2 text-sm text-stone-600">{estado.mensaje}</p>
      )}
    </div>
  );
}
