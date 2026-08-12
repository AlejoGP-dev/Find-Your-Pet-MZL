export type TipoReporte = "perdida" | "encontrada";
export type Especie = "perro" | "gato" | "otro";
export type Tamano = "pequeno" | "mediano" | "grande";
export type Sexo = "macho" | "hembra" | "no_se";
export type EstadoReporte = "activo" | "resuelto";

export type Reporte = {
  id: string;
  tipo: TipoReporte;
  nombre: string | null;
  especie: Especie;
  raza: string | null;
  color: string | null;
  tamano: Tamano | null;
  sexo: Sexo | null;
  foto_url: string | null;
  barrio: string;
  referencia: string | null;
  fecha: string;
  descripcion: string | null;
  contacto_nombre: string;
  contacto_whatsapp: string;
  estado: EstadoReporte;
  avistamientos: number;
  created_at: string;
};

export type Avistamiento = {
  id: string;
  reporte_id: string;
  lugar: string;
  fecha: string;
  comentario: string | null;
  nombre: string | null;
  whatsapp: string | null;
  created_at: string;
};

export type NuevoAvistamiento = Omit<Avistamiento, "id" | "created_at">;

export type NuevoReporte = Omit<
  Reporte,
  "id" | "estado" | "avistamientos" | "created_at"
>;

export type GrupoUbicacion = { ciudad: string; barrios: string[] };

/**
 * Ubicaciones agrupadas por municipio. El valor que se guarda en la base de
 * datos es el nombre del barrio; los de Villamaría llevan el sufijo de ciudad
 * para no confundirlos con los de Manizales.
 */
export const UBICACIONES: GrupoUbicacion[] = [
  {
    ciudad: "Manizales",
    barrios: [
      "Centro",
      "Chipre",
      "Palogrande",
      "Palermo",
      "La Enea",
      "Milán",
      "Villapilar",
      "El Cable",
      "Los Rosales",
      "Fátima",
      "La Sultana",
      "San Jorge",
      "Estrella",
      "Villa del Río",
      "La Camelia",
      "Belén",
      "Alta Suiza",
      "Laureles",
      "Malhabar",
      "Versalles",
      "Bosques del Norte",
      "La Carola",
      "Marmato",
      "San José",
      "El Nevado",
      "Campohermoso",
      "Aranjuez",
      "Solferino",
      "Minitas",
      "Las Américas",
      "Corregimiento o vereda de Manizales",
    ],
  },
  {
    ciudad: "Villamaría",
    barrios: [
      "Centro (Villamaría)",
      "La Pradera (Villamaría)",
      "La Floresta (Villamaría)",
      "Villa Nueva (Villamaría)",
      "Nuevo Horizonte (Villamaría)",
      "Bellavista (Villamaría)",
      "Gallinazo (Villamaría)",
      "Llanitos (Villamaría)",
      "Miraflores (Villamaría)",
      "Partidas (Villamaría)",
      "Rioclaro (Villamaría)",
      "Nueva Primavera (Villamaría)",
      "Los Cuervos (Villamaría)",
      "Agrícola La Paz (Villamaría)",
      "Termales (Villamaría)",
      "Corregimiento o vereda de Villamaría",
    ],
  },
];

/** Opción que habilita el campo de texto libre. */
export const OTRO_BARRIO = "__otro__";

export const BARRIOS_MANIZALES = UBICACIONES.flatMap((g) => g.barrios);

export const ESPECIES: { valor: Especie; etiqueta: string; emoji: string }[] = [
  { valor: "perro", etiqueta: "Perro", emoji: "🐶" },
  { valor: "gato", etiqueta: "Gato", emoji: "🐱" },
  { valor: "otro", etiqueta: "Otro", emoji: "🐾" },
];

export const TAMANOS: { valor: Tamano; etiqueta: string }[] = [
  { valor: "pequeno", etiqueta: "Pequeño" },
  { valor: "mediano", etiqueta: "Mediano" },
  { valor: "grande", etiqueta: "Grande" },
];

export const SEXOS: { valor: Sexo; etiqueta: string }[] = [
  { valor: "macho", etiqueta: "Macho" },
  { valor: "hembra", etiqueta: "Hembra" },
  { valor: "no_se", etiqueta: "No sé" },
];

export function etiquetaDe<T extends string>(
  lista: { valor: T; etiqueta: string }[],
  valor: T | null | undefined,
): string | null {
  if (!valor) return null;
  return lista.find((item) => item.valor === valor)?.etiqueta ?? null;
}

export function formatearFecha(fecha: string): string {
  const partes = fecha.split("-");
  if (partes.length !== 3) return fecha;
  const [ano, mes, dia] = partes.map(Number);
  const meses = [
    "enero",
    "febrero",
    "marzo",
    "abril",
    "mayo",
    "junio",
    "julio",
    "agosto",
    "septiembre",
    "octubre",
    "noviembre",
    "diciembre",
  ];
  return `${dia} de ${meses[mes - 1]} de ${ano}`;
}

/** Normaliza a formato internacional para wa.me (Colombia por defecto). */
export function normalizarWhatsapp(numero: string): string {
  const soloDigitos = numero.replace(/\D/g, "");
  if (soloDigitos.startsWith("57")) return soloDigitos;
  if (soloDigitos.length === 10) return `57${soloDigitos}`;
  return soloDigitos;
}

export function enlaceWhatsapp(reporte: Reporte, urlPublica: string): string {
  const saludo =
    reporte.tipo === "perdida"
      ? `Hola ${reporte.contacto_nombre}, vi el reporte de ${reporte.nombre || "tu mascota"} en Find Your Pet MZL y creo que tengo información.`
      : `Hola ${reporte.contacto_nombre}, vi en Find Your Pet MZL la mascota que encontraste y creo que puede ser la mía.`;
  const texto = `${saludo}\n\n${urlPublica}`;
  return `https://wa.me/${normalizarWhatsapp(reporte.contacto_whatsapp)}?text=${encodeURIComponent(texto)}`;
}

/** "hace 3 horas", "hace 2 días"… para la lista de avistamientos. */
export function haceCuanto(iso: string): string {
  const minutos = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutos < 1) return "hace un momento";
  if (minutos < 60) return `hace ${minutos} min`;
  const horas = Math.floor(minutos / 60);
  if (horas < 24) return `hace ${horas} ${horas === 1 ? "hora" : "horas"}`;
  const dias = Math.floor(horas / 24);
  if (dias < 30) return `hace ${dias} ${dias === 1 ? "día" : "días"}`;
  const meses = Math.floor(dias / 30);
  return `hace ${meses} ${meses === 1 ? "mes" : "meses"}`;
}
