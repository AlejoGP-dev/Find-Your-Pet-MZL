import type { Reporte } from "./tipos";

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
  puntaje: number;
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
  const barrioA = normalizar(perdida.barrio);
  const barrioB = normalizar(encontrada.barrio);
  if (barrioA && barrioA === barrioB) {
    puntaje += 30;
    razones.push("mismo barrio");
  } else if (compartidas(palabras(perdida.barrio), palabras(encontrada.barrio)) > 0) {
    puntaje += 18;
    razones.push("zona parecida");
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

  return { reporte: candidato, puntaje: Math.min(puntaje, 100), razones };
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
    .sort((x, y) => y.puntaje - x.puntaje)
    .slice(0, maximo);
}
