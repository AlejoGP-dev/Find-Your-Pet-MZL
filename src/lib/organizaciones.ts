export type Enlace = { etiqueta: string; url: string; icono: string };

export type Organizacion = {
  nombre: string;
  descripcion: string;
  zona?: string;
  /**
   * Ruta del logo dentro de /public, por ejemplo "/fundaciones/huellitas.jpg".
   * Si está vacío mostramos las iniciales sobre un color. No traemos la foto
   * de perfil desde Instagram: sus URLs se vencen y quedarían rotas.
   */
  logo?: string;
  /** Distintivo corto, p. ej. "Ofrece hogar de paso". Va como etiqueta en la tarjeta. */
  etiqueta?: string;
  enlaces: Enlace[];
};

/** Color estable para el avatar de iniciales, derivado del nombre. */
export function colorDe(nombre: string): string {
  const paleta = ["#0f6f6c", "#c2410c", "#047857", "#7c3aed", "#b45309", "#be123c"];
  let suma = 0;
  for (const c of nombre) suma += c.charCodeAt(0);
  return paleta[suma % paleta.length];
}

/** "Fundación Vecino de 4 Patas" -> "V4" ; "Doña Lilia" -> "DL" */
export function inicialesDe(nombre: string): string {
  const ignorar = new Set(["fundacion", "fundación", "de", "la", "el", "los", "las", "doña", "don"]);
  const partes = nombre
    .split(/\s+/)
    .filter((p) => !ignorar.has(p.toLowerCase()))
    .slice(0, 2);
  return partes.map((p) => p[0]?.toUpperCase() ?? "").join("") || nombre[0].toUpperCase();
}

/**
 * Fundaciones, albergues y personas que sostienen animales en Manizales y
 * Villamaría. No manejamos donaciones ni intermediamos: cada quien contacta
 * directo con la organización.
 */
export const ORGANIZACIONES: Organizacion[] = [
  {
    nombre: "Fundación Vecino de 4 Patas",
    logo: "/fundaciones/vecino-de-4-patas.jpg",
    descripcion:
      "Rescate y cuidado de animales en situación de calle en Manizales.",
    enlaces: [
      {
        etiqueta: "@fundacionvecinode4patas",
        url: "https://www.instagram.com/fundacionvecinode4patas",
        icono: "instagram",
      },
    ],
  },
  {
    nombre: "Fundación Estoy Contigo",
    logo: "/fundaciones/estoy-contigo.jpg",
    descripcion:
      "Acompañamiento, rescate y adopción de perros y gatos en la ciudad.",
    enlaces: [
      {
        etiqueta: "@fundestoycontigo",
        url: "https://www.instagram.com/fundestoycontigo",
        icono: "instagram",
      },
    ],
  },
  {
    nombre: "Ángeles de la Calle Manizales",
    logo: "/fundaciones/angeles-de-la-calle.jpg",
    descripcion:
      "Alimentación y atención de animales que viven en la calle en Manizales.",
    enlaces: [
      {
        etiqueta: "@angelesdelacallemanizales",
        url: "https://www.instagram.com/angelesdelacallemanizales",
        icono: "instagram",
      },
    ],
  },
  {
    nombre: "Fundación Huellitas",
    logo: "/fundaciones/huellitas.jpg",
    descripcion: "Rescate y cuidado de animales en Manizales.",
    enlaces: [
      {
        etiqueta: "@fundacion.huellitas",
        url: "https://www.tiktok.com/@fundacion.huellitas",
        icono: "tiktok",
      },
    ],
  },
  {
    nombre: "Peter Can Manizales",
    logo: "/fundaciones/peter-can.jpg",
    etiqueta: "Ofrece hogar de paso",
    descripcion:
      "Centro de adiestramiento y crianza canina que abrió sus instalaciones como hogar de paso para perros afectados por el sismo. Contacto: Jairo Alexander Marulanda Ríos.",
    zona: "Manizales",
    enlaces: [
      {
        etiqueta: "300 403 3237",
        url: "https://wa.me/573004033237",
        icono: "whatsapp",
      },
      {
        etiqueta: "323 345 8424",
        url: "https://wa.me/573233458424",
        icono: "whatsapp",
      },
      {
        etiqueta: "Perfil de Facebook",
        url: "https://www.facebook.com/groups/310649269592232/user/100021816300026/",
        icono: "facebook",
      },
    ],
  },
  {
    nombre: "Doña Lilia",
    descripcion:
      "Sostiene por su cuenta un albergue de gatos. Recibe alimento, arena y todo lo que ayude a cuidarlos.",
    zona: "La Enea, Manizales",
    enlaces: [
      {
        etiqueta: "304 341 0114",
        url: "https://wa.me/573043410114",
        icono: "whatsapp",
      },
    ],
  },
];

/**
 * Grupos de Facebook donde la comunidad difunde mascotas perdidas y
 * encontradas. No son nuestros ni los administramos: los enlazamos porque
 * entre más ojos vean un reporte, más rápido aparece la mascota.
 */
export const GRUPOS_DIFUSION: { nombre: string; url: string; miembros?: string }[] = [
  {
    nombre: "MASCOTAS PERDIDAS EN MANIZALES",
    url: "https://www.facebook.com/groups/adopcionesymascotasperdidaseje/",
  },
  {
    nombre: "Mascotas Perdidas Manizales",
    url: "https://www.facebook.com/groups/310649269592232/",
  },
  {
    nombre: "Mascotas Perdidas en Manizales",
    url: "https://www.facebook.com/groups/mascotasperdidasenmanizales/",
  },
];

/** Lo que más les hace falta en el día a día. */
export const NECESIDADES = [
  { emoji: "🍖", texto: "Alimento (perro y gato)" },
  { emoji: "🧴", texto: "Implementos de aseo" },
  { emoji: "🐈", texto: "Arena para gatos" },
  { emoji: "💊", texto: "Antipulgas" },
  { emoji: "🪱", texto: "Desparasitante" },
  { emoji: "🛏️", texto: "Cobijas y camas" },
  { emoji: "💵", texto: "Aportes para veterinaria" },
  { emoji: "🚗", texto: "Transporte y voluntariado" },
];
