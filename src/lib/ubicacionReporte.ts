import { coordenadaDeCiudad } from "./coordenadas";
import { dentroDeColombia, redondearCoordenada, type PrecisionUbicacion } from "./geo";

export type UbicacionGuardada = {
  lat: number | null;
  lng: number | null;
  ubicacion_precision: PrecisionUbicacion | null;
};

const SIN_UBICACION: UbicacionGuardada = {
  lat: null,
  lng: null,
  ubicacion_precision: null,
};

/**
 * Decide con qué ubicación se guarda un reporte.
 *
 * Orden: lo que compartió la persona (si es creíble) y, si no, el centro de su
 * municipio. Nunca falla: un reporte de una mascota perdida no se puede
 * rechazar por un problema de coordenadas.
 *
 * Se valida en el servidor a propósito. Los campos ocultos del formulario los
 * puede editar cualquiera, y una coordenada inventada mandaría a alguien a
 * buscar a la otra punta del país.
 */
export function ubicacionParaGuardar(
  form: FormData,
  ciudad: string,
): UbicacionGuardada {
  const compartida = leerCompartida(form);
  if (compartida) return compartida;

  const centro = coordenadaDeCiudad(ciudad);
  if (!centro) return SIN_UBICACION;

  return {
    lat: centro.lat,
    lng: centro.lng,
    ubicacion_precision: "ciudad",
  };
}

function leerCompartida(form: FormData): UbicacionGuardada | null {
  const lat = Number(String(form.get("lat") ?? "").trim());
  const lng = Number(String(form.get("lng") ?? "").trim());
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (lat === 0 && lng === 0) return null;
  if (!dentroDeColombia({ lat, lng })) return null;

  return {
    lat: redondearCoordenada(lat),
    lng: redondearCoordenada(lng),
    ubicacion_precision: "exacta",
  };
}
