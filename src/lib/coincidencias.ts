import { coordenadaDeCiudad } from "./coordenadas";
import { distanciaKm, formatearDistancia, type Punto } from "./geo";
import type { Reporte } from "./tipos";

/**
 * Hasta dónde se considera que dos reportes son «la misma zona».
 *
 * Antes esto era «misma ciudad» a secas, y se perdían casos reales: medido
 * sobre los 127 reportes activos de agosto, 892 pares se descartaban solo por
 * estar en municipios distintos, y 437 de esos estaban a menos de 5 km — casi
 * todos Manizales ↔ Villamaría, que son vecinos y se cruzan caminando. Un
 * perro no sabe dónde termina un municipio.
 *
 * 12 km sale de mirar cómo se reparten esas distancias: los pares descartados
 * caen en dos grupos limpios, por debajo de 5 km y por encima de 25, sin nada
 * en la mitad. Cualquier número entre 10 y 20 da el mismo resultado hoy; 12
 * deja margen sin dejar entrar a Pereira (41 km de Manizales).
 */
export const RADIO_CRUCE_KM = 12;

/**
 * El punto de un reporte: el suyo propio si lo tiene, y si no el centro de su
 * municipio. Devuelve null cuando la ciudad no está en la tabla — ahí no hay
 * forma de saber si está cerca y es preferible no cruzarlo.
 */
function puntoDe(datos: {
  lat?: number | null;
  lng?: number | null;
  ciudad: string;
}): Punto | null {
  if (typeof datos.lat === "number" && typeof datos.lng === "number") {
    return { lat: datos.lat, lng: datos.lng };
  }
  return coordenadaDeCiudad(datos.ciudad);
}

type Cercania =
  | { cerca: false }
  | { cerca: true; mismaCiudad: true }
  | { cerca: true; mismaCiudad: false; km: number };

/** ¿Estos dos reportes están lo bastante cerca para valer la pena compararlos? */
function evaluarCercania(
  a: { lat?: number | null; lng?: number | null; ciudad: string },
  b: { lat?: number | null; lng?: number | null; ciudad: string },
): Cercania {
  if (normalizar(a.ciudad) === normalizar(b.ciudad)) {
    return { cerca: true, mismaCiudad: true };
  }
  const puntoA = puntoDe(a);
  const puntoB = puntoDe(b);
  if (!puntoA || !puntoB) return { cerca: false };

  const km = distanciaKm(puntoA, puntoB);
  if (km > RADIO_CRUCE_KM) return { cerca: false };
  return { cerca: true, mismaCiudad: false, km };
}

/** Quita tildes y pasa a minúsculas para comparar textos escritos a mano. */
export function normalizar(texto: string | null | undefined): string {
  return (texto ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

const PALABRAS_VACIAS = new Set([
  "con","y","de","del","la","el","los","las","un","una","muy","tiene","es","en",
  "su","sus","al","por","para","pero","que","se","no","mas","más","color","pelo",
]);

function palabras(texto: string | null | undefined): Set<string> {
  return new Set(
    normalizar(texto)
      .split(/[^a-z0-9ñ]+/)
      .filter((p) => p.length > 2 && !PALABRAS_VACIAS.has(p)),
  );
}

function compartidas(a: Set<string>, b: Set<string>): number {
  let n = 0;
  for (const p of a) if (b.has(p)) n++;
  return n;
}

function diasEntre(desde: string, hasta: string): number {
  const d1 = new Date(`${desde}T00:00:00`).getTime();
  const d2 = new Date(`${hasta}T00:00:00`).getTime();
  return Math.round((d2 - d1) / 86400000);
}

export type Coincidencia = {
  reporte: Reporte;
  /** 0-100, que es lo que se muestra. */
  puntaje: number;
  /**
   * El mismo puntaje sin el techo de 100, solo para ordenar.
   *
   * Sin esto, dos coincidencias muy buenas empatan en 100 y el orden entre
   * ellas queda al azar — y no son igual de buenas: una del mismo barrio suma
   * 125 y una del municipio vecino 109. La primera merece salir de primera.
   */
  crudo: number;
  razones: string[];
};

/**
 * Compara una mascota perdida con una encontrada y devuelve qué tanto se parecen.
 * No es magia: cruza especie, zona, fechas, color, sexo y tamaño. La decisión
 * final siempre es de las personas, por eso mostramos también las razones.
 */
export function compararReportes(
  sujeto: Reporte,
  candidato: Reporte,
): Coincidencia | null {
  const perdida = sujeto.tipo === "perdida" ? sujeto : candidato;
  const encontrada = sujeto.tipo === "perdida" ? candidato : sujeto;

  // Solo tiene sentido cruzar una perdida con una encontrada.
  if (perdida.tipo !== "perdida" || encontrada.tipo !== "encontrada") return null;
  // Distinta especie: no se parecen y punto.
  if (perdida.especie !== encontrada.especie) return null;
  // Lejos: una mascota perdida en Cali no aparece en Quibdó. Pero sí puede
  // aparecer en el municipio de al lado — ver RADIO_CRUCE_KM.
  const cercania = evaluarCercania(perdida, encontrada);
  if (!cercania.cerca) return null;

  let puntaje = 25;
  const razones: string[] = [];

  // --- Fechas: la encontraron después (o casi) de que se perdiera ---
  const dias = diasEntre(perdida.fecha, encontrada.fecha);
  if (dias < -3 || dias > 90) return null;
  if (dias <= 7) {
    puntaje += 30;
    razones.push("las fechas encajan");
  } else if (dias <= 30) {
    puntaje += 18;
    razones.push("fechas cercanas");
  } else {
    puntaje += 6;
  }

  // --- Zona ---
  if (cercania.mismaCiudad) {
    const barrioA = normalizar(perdida.barrio);
    const barrioB = normalizar(encontrada.barrio);
    if (barrioA && barrioA === barrioB) {
      puntaje += 30;
      razones.push("mismo barrio");
    } else if (compartidas(palabras(perdida.barrio), palabras(encontrada.barrio)) > 0) {
      puntaje += 18;
      razones.push("zona parecida");
    }

    // Si las dos personas compartieron su ubicación al publicar, la distancia
    // es real y no el centro del municipio: ahí sí se puede afinar.
    if (
      perdida.ubicacion_precision === "exacta" &&
      encontrada.ubicacion_precision === "exacta"
    ) {
      const a = puntoDe(perdida);
      const b = puntoDe(encontrada);
      if (a && b) {
        const km = distanciaKm(a, b);
        if (km <= 2) {
          puntaje += 12;
          razones.push(`a ${formatearDistancia(km)} del sitio`);
        }
      }
    }
  } else {
    // Municipio distinto pero pegado. Puntúa menos que el mismo barrio: el
    // dato es más flojo, y la razón lo dice para que quien mire lo juzgue.
    puntaje += 14;
    razones.push(
      `municipio vecino, a ${formatearDistancia(cercania.km)} de distancia`,
    );
  }

  // --- Color y raza ---
  const textoA = palabras(`${perdida.color ?? ""} ${perdida.raza ?? ""} ${perdida.descripcion ?? ""}`);
  const textoB = palabras(`${encontrada.color ?? ""} ${encontrada.raza ?? ""} ${encontrada.descripcion ?? ""}`);
  const enComun = compartidas(palabras(`${perdida.color ?? ""} ${perdida.raza ?? ""}`), textoB) +
    compartidas(palabras(`${encontrada.color ?? ""} ${encontrada.raza ?? ""}`), textoA);
  if (enComun >= 2) {
    puntaje += 22;
    razones.push("color y raza parecidos");
  } else if (enComun === 1) {
    puntaje += 12;
    razones.push("color parecido");
  }

  // --- Sexo: si los dos lo dicen y no coinciden, es mala señal ---
  const sexoA = perdida.sexo && perdida.sexo !== "no_se" ? perdida.sexo : null;
  const sexoB = encontrada.sexo && encontrada.sexo !== "no_se" ? encontrada.sexo : null;
  if (sexoA && sexoB) {
    if (sexoA === sexoB) {
      puntaje += 10;
      razones.push("mismo sexo");
    } else {
      puntaje -= 30;
    }
  }

  // --- Tamaño ---
  if (perdida.tamano && encontrada.tamano) {
    if (perdida.tamano === encontrada.tamano) puntaje += 8;
    else puntaje -= 10;
  }

  if (puntaje < 60) return null;

  return { reporte: candidato, puntaje: Math.min(puntaje, 100), crudo: puntaje, razones };
}

/** Devuelve las mejores coincidencias para un reporte, de mayor a menor parecido. */
export function buscarCoincidencias(
  reporte: Reporte,
  candidatos: Reporte[],
  maximo = 4,
): Coincidencia[] {
  const buscado = reporte.tipo === "perdida" ? "encontrada" : "perdida";
  return candidatos
    .filter((c) => c.id !== reporte.id && c.tipo === buscado && c.estado === "activo")
    .map((c) => compararReportes(reporte, c))
    .filter((c): c is Coincidencia => c !== null)
    .sort((x, y) => y.crudo - x.crudo)
    .slice(0, maximo);
}

/* ==================================================================== */
/* Adopciones ↔ mascotas perdidas                                       */
/* ==================================================================== */

/** Lo mínimo que necesitamos de una adopción para cruzarla. */
export type PerfilAdopcion = {
  especie: string;
  ciudad: string;
  barrio: string;
  color?: string | null;
  raza?: string | null;
  sexo?: string | null;
  tamano?: string | null;
  descripcion?: string | null;
  temperamento?: string | null;
};

/**
 * Cruza una mascota que se va a dar en adopción contra las perdidas activas.
 *
 * Es la validación más importante de toda la sección: evita que alguien
 * entregue en adopción un animal que su familia está buscando en la otra
 * pestaña del mismo sitio.
 *
 * A propósito NO mira fechas —una mascota perdida hace un mes puede aparecer
 * en adopción hoy— y usa un umbral más bajo que el cruce normal: acá preferimos
 * avisar de más que dejar pasar un caso real.
 */
export function buscarPosiblesDuenos(
  perfil: PerfilAdopcion,
  perdidas: Reporte[],
  maximo = 4,
): Coincidencia[] {
  const textoAdop = palabras(
    `${perfil.color ?? ""} ${perfil.raza ?? ""} ${perfil.descripcion ?? ""} ${perfil.temperamento ?? ""}`,
  );
  const senasAdop = palabras(`${perfil.color ?? ""} ${perfil.raza ?? ""}`);

  return perdidas
    .map((p): Coincidencia | null => {
      if (p.tipo !== "perdida" || p.estado !== "activo") return null;
      if (normalizar(p.especie) !== normalizar(perfil.especie)) return null;

      // Mismo criterio que el cruce normal: el municipio de al lado cuenta.
      // Acá importa todavía más — entregar en adopción una mascota que su
      // familia busca a diez minutos de distancia es el error más caro que
      // puede cometer esta página.
      const cercania = evaluarCercania(p, perfil);
      if (!cercania.cerca) return null;

      let puntaje = 30;
      const razones: string[] = [];

      if (cercania.mismaCiudad) {
        razones.push("misma ciudad");
        const barrioA = normalizar(perfil.barrio);
        const barrioB = normalizar(p.barrio);
        if (barrioA && barrioA === barrioB) {
          puntaje += 25;
          razones.push("mismo barrio");
        } else if (compartidas(palabras(perfil.barrio), palabras(p.barrio)) > 0) {
          puntaje += 12;
          razones.push("zona parecida");
        }
      } else {
        puntaje += 10;
        razones.push(
          `municipio vecino, a ${formatearDistancia(cercania.km)} de distancia`,
        );
      }

      const textoP = palabras(`${p.color ?? ""} ${p.raza ?? ""} ${p.descripcion ?? ""}`);
      const enComun =
        compartidas(senasAdop, textoP) +
        compartidas(palabras(`${p.color ?? ""} ${p.raza ?? ""}`), textoAdop);
      if (enComun >= 2) {
        puntaje += 25;
        razones.push("color y raza parecidos");
      } else if (enComun === 1) {
        puntaje += 14;
        razones.push("algo del color coincide");
      }

      if (perfil.sexo && p.sexo && perfil.sexo !== "no_se" && p.sexo !== "no_se") {
        if (perfil.sexo === p.sexo) {
          puntaje += 10;
          razones.push("mismo sexo");
        } else {
          puntaje -= 25;
        }
      }

      if (perfil.tamano && p.tamano) {
        if (perfil.tamano === p.tamano) puntaje += 8;
        else puntaje -= 10;
      }

      if (puntaje < 45) return null;
      return { reporte: p, puntaje: Math.min(puntaje, 100), crudo: puntaje, razones };
    })
    .filter((c): c is Coincidencia => c !== null)
    .sort((x, y) => y.crudo - x.crudo)
    .slice(0, maximo);
}
