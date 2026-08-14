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
  ciudad: string;
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

export type Ciudad = {
  /** Va en la URL: /pereira, /cali… */
  slug: string;
  nombre: string;
  departamento: string;
  /** Si es true, aparece destacada por el sismo del 10 de agosto. */
  afectada?: boolean;
  barrios: string[];
};

/**
 * Ciudades con lista de barrios propia. Quien viva en otra parte del país
 * puede escribir su ciudad y su barrio a mano — por eso existe OTRA_CIUDAD.
 *
 * Los barrios de las ciudades nuevas son un primer listado con los sectores
 * más conocidos; la gente de cada ciudad va completando con el campo libre.
 */
export const CIUDADES: Ciudad[] = [
  {
    slug: "manizales",
    nombre: "Manizales",
    departamento: "Caldas",
    afectada: true,
    barrios: [
      "Centro", "Chipre", "Palogrande", "Palermo", "La Enea", "Milán",
      "Villapilar", "El Cable", "Los Rosales", "Fátima", "La Sultana",
      "San Jorge", "Estrella", "Villa del Río", "La Camelia", "Belén",
      "Alta Suiza", "Alta Castilla", "Laureles", "Malhabar", "Versalles",
      "Bosques del Norte", "La Carola", "Marmato", "San José", "El Nevado",
      "Campohermoso", "Aranjuez", "Solferino", "Minitas", "Las Américas",
      "Corregimiento o vereda",
    ],
  },
  {
    slug: "villamaria",
    nombre: "Villamaría",
    departamento: "Caldas",
    afectada: true,
    barrios: [
      "Centro", "La Pradera", "La Floresta", "Villa Nueva", "Nuevo Horizonte",
      "Bellavista", "Gallinazo", "Llanitos", "Miraflores", "Partidas",
      "Rioclaro", "Nueva Primavera", "Los Cuervos", "Agrícola La Paz",
      "Termales", "Corregimiento o vereda",
    ],
  },
  {
    slug: "pereira",
    nombre: "Pereira",
    departamento: "Risaralda",
    afectada: true,
    barrios: [
      "Centro", "Cuba", "Villa Santana", "El Jardín", "Los Álamos",
      "San Nicolás", "Boston", "El Poblado", "Providencia", "Corales",
      "Pinares", "Kennedy", "Belmonte", "La Villa", "Gamma",
      "Perla del Otún", "Samaria", "El Rocío", "El Dorado", "San Joaquín",
      "Villavicencio", "Maraya", "Álamos", "Ciudad Boquía", "Naranjito",
      "Corregimiento o vereda",
    ],
  },
  {
    slug: "dosquebradas",
    nombre: "Dosquebradas",
    departamento: "Risaralda",
    afectada: true,
    barrios: [
      "Centro", "La Badea", "Los Naranjos", "Santa Mónica", "La Pradera",
      "Frailes", "El Japón", "La Romelia", "Camilo Torres", "Bosques de la Acuarela",
      "Villa Colombia", "El Balso", "Playa Rica", "Guadalupe",
      "Corregimiento o vereda",
    ],
  },
  {
    slug: "cali",
    nombre: "Cali",
    departamento: "Valle del Cauca",
    afectada: true,
    barrios: [
      "Centro", "San Nicolás", "Granada", "San Fernando", "El Peñón",
      "Ciudad Jardín", "Pance", "Santa Mónica", "Versalles", "Chipichape",
      "La Flora", "Menga", "Siloé", "Terrón Colorado", "Meléndez",
      "Valle del Lili", "Alfonso López", "El Poblado", "Marroquín",
      "El Vallado", "Junín", "Alameda", "El Obrero", "Bretaña", "La Base",
      "Los Cristales", "Salomia", "Floralia", "Decepaz", "Aguablanca",
      "Corregimiento o vereda",
    ],
  },
  {
    slug: "quibdo",
    nombre: "Quibdó",
    departamento: "Chocó",
    afectada: true,
    barrios: [
      "Centro", "Yesquita", "Yesca Grande", "Roma", "Kennedy", "Cristo Rey",
      "Niño Jesús", "Obrero", "César Conto", "La Aurora", "Huapango",
      "Reposo", "Buenos Aires", "Los Álamos", "San Vicente", "Medrano",
      "Alameda Reyes", "Julio Figueroa Villa", "La Victoria", "El Silencio",
      "Tomás Pérez", "Pandeyuca", "Simón Bolívar", "El Jardín", "Miraflores",
      "Corregimiento o vereda",
    ],
  },
  {
    slug: "armenia",
    nombre: "Armenia",
    departamento: "Quindío",
    afectada: true,
    barrios: [
      "Centro", "La Patria", "Los Quindos", "Granada", "Laureles",
      "El Bosque", "La Adiela", "Ciudad Dorada", "Nueva Libertad",
      "El Paraíso", "Las Colinas", "Puerto Espejo", "Génesis",
      "Rincón Santo", "La Cecilia", "Uribe", "Villa Liliana", "Zuldemayda",
      "La Fachada", "Berlín", "La Isabela", "Yulima", "Mercedes del Norte",
      "Corregimiento o vereda",
    ],
  },
  {
    slug: "popayan",
    nombre: "Popayán",
    departamento: "Cauca",
    afectada: true,
    barrios: [
      "Centro Histórico", "La Esmeralda", "Bello Horizonte", "El Recuerdo",
      "Modelo", "Alfonso López", "José María Obando", "La Paz", "Los Sauces",
      "Yambitará", "Campanario", "Pandiguando", "Tomás Cipriano", "Berlín",
      "Chirimía", "Villa del Norte", "Lomas de Granada", "Bosques de Pomona",
      "El Placer", "La Ladera", "San Camilo", "Loma de la Virgen",
      "Corregimiento o vereda",
    ],
  },
];

/** Opción que habilita el campo de texto libre para el barrio. */
export const OTRO_BARRIO = "__otro__";
/** Opción que habilita el campo de texto libre para la ciudad. */
export const OTRA_CIUDAD = "__otra__";

/** Nombre que guardamos cuando la ciudad no está en el catálogo. */
export const CIUDAD_GENERICA = "Otra ciudad";

export const SLUGS_CIUDADES = CIUDADES.map((c) => c.slug);

export function ciudadPorSlug(slug: string): Ciudad | null {
  return CIUDADES.find((c) => c.slug === slug) ?? null;
}

export function ciudadPorNombre(nombre: string): Ciudad | null {
  const clave = sinTildes(nombre);
  return CIUDADES.find((c) => sinTildes(c.nombre) === clave) ?? null;
}

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
      ? `Hola ${reporte.contacto_nombre}, vi el reporte de ${reporte.nombre || "tu mascota"} en Find Your Pet CO y creo que tengo información.`
      : `Hola ${reporte.contacto_nombre}, vi en Find Your Pet CO la mascota que encontraste y creo que puede ser la mía.`;
  const texto = `${saludo}\n\n${urlPublica}`;
  return `https://wa.me/${normalizarWhatsapp(reporte.contacto_whatsapp)}?text=${encodeURIComponent(texto)}`;
}

/** Días completos transcurridos desde una fecha ISO. */
export function diasDesde(iso: string): number {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
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

/** Variantes que la gente escribe a mano y su forma unificada. */
const ALIAS_CIUDAD: Record<string, string> = {
  "villamaria": "Villamaría",
  "villa maria": "Villamaría",
  "villamaria caldas": "Villamaría",
  "manizales caldas": "Manizales",
  "quibdo choco": "Quibdó",
  "santiago de cali": "Cali",
  "cali valle": "Cali",
  "pereira risaralda": "Pereira",
  "armenia quindio": "Armenia",
  "popayan cauca": "Popayán",
  "dos quebradas": "Dosquebradas",
};

const ALIAS_BARRIO: Record<string, string> = {
  "n/a": "Sin especificar",
  "na": "Sin especificar",
  "-": "Sin especificar",
  "no se": "Sin especificar",
};

function sinTildes(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

/** Deja la ciudad con el nombre oficial del catálogo cuando la reconoce. */
export function canonicalizarCiudad(texto: string): string {
  const limpio = texto.replace(/\s+/g, " ").trim();
  if (!limpio) return "";

  const clave = sinTildes(limpio);
  if (ALIAS_CIUDAD[clave]) return ALIAS_CIUDAD[clave];

  const porSlug = CIUDADES.find((c) => c.slug === clave);
  if (porSlug) return porSlug.nombre;

  const porNombre = ciudadPorNombre(limpio);
  if (porNombre) return porNombre.nombre;

  return limpio.charAt(0).toUpperCase() + limpio.slice(1);
}

/**
 * Unifica cómo se guarda el barrio: si coincide con uno de la ciudad (sin
 * importar tildes ni mayúsculas) usa el nombre oficial; si no, lo deja como
 * lo escribió la persona pero con la primera letra en mayúscula.
 */
export function canonicalizarBarrio(texto: string, ciudad?: string): string {
  const limpio = texto.replace(/\s+/g, " ").trim();
  if (!limpio) return limpio;

  const clave = sinTildes(limpio);
  if (ALIAS_BARRIO[clave]) return ALIAS_BARRIO[clave];

  const candidatas = ciudad
    ? [ciudadPorNombre(ciudad)].filter(Boolean as unknown as (c: Ciudad | null) => c is Ciudad)
    : CIUDADES;

  for (const c of candidatas) {
    for (const barrio of c.barrios) {
      if (sinTildes(barrio) === clave) return barrio;
    }
  }

  return limpio.charAt(0).toUpperCase() + limpio.slice(1);
}
