export type Enlace = { etiqueta: string; url: string; icono: string };

export type Organizacion = {
  nombre: string;
  descripcion: string;
  /** Ciudad principal donde opera. Sirve para agrupar la página de ayuda. */
  ciudad: string;
  /** Refugio golpeado directamente por el sismo del 10 de agosto. */
  afectadaSismo?: boolean;
  /** Lo que pidieron públicamente, si se sabe. */
  necesita?: string;
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
 * Fundaciones, albergues y personas que sostienen animales en el país.
 * No manejamos donaciones ni intermediamos: cada quien contacta directo.
 *
 * Al agregar una organización nueva: verifica que la cuenta enlazada sea la
 * oficial y que la ciudad coincida. En emergencias circulan cuentas falsas,
 * así que es preferible dejar la tarjeta sin enlace de contacto (apuntando a
 * la nota de prensa) antes que enlazar una cuenta que no se pudo confirmar.
 */
export const ORGANIZACIONES: Organizacion[] = [
  {
    nombre: "Fundación Vecino de 4 Patas",
    ciudad: "Manizales",
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
    ciudad: "Manizales",
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
    ciudad: "Manizales",
    afectadaSismo: true,
    necesita: "Alimento para perros y gatos, agua e insumos",
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
    ciudad: "Manizales",
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
    ciudad: "Manizales",
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
    ciudad: "Manizales",
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

  // ─── Villamaría ───────────────────────────────────────────────
  {
    nombre: "Amigos de Cuatro Patas",
    ciudad: "Villamaría",
    afectadaSismo: true,
    necesita: "Alimento para perros y gatos, agua e insumos",
    descripcion:
      "Refugio de Villamaría que quedó afectado por el sismo. Reportado por Semana entre las fundaciones que pidieron ayuda.",
    enlaces: [
      {
        etiqueta: "Nota de Semana",
        url: "https://www.semana.com/4patas/articulo/terremoto-en-colombia-mascotas-desaparecidas-y-fundaciones-afectadas-piden-ayuda-tras-la-emergencia/202648/",
        icono: "prensa",
      },
    ],
  },

  // ─── Pereira y Dosquebradas ───────────────────────────────────
  {
    nombre: "Fundación Siempre a Tu Lado",
    ciudad: "Pereira",
    afectadaSismo: true,
    necesita:
      "Alimento, medicamentos, malla eslabonada, planta eléctrica y ayuda económica",
    zona: "Variante Romelia – El Pollo, Dosquebradas",
    descripcion:
      "Se quedó sin electricidad tras el sismo y necesita sede nueva con urgencia. Arrastra además deudas veterinarias.",
    enlaces: [
      {
        etiqueta: "Página de Facebook",
        url: "https://www.facebook.com/p/Fundaci%C3%B3n-Siempre-a-Tu-Lado-Pereira-100075975846135/",
        icono: "facebook",
      },
    ],
  },
  {
    nombre: "Refugio Huellas de Amor",
    ciudad: "Pereira",
    descripcion: "Rescate, refugio y adopción de perros y gatos en Pereira.",
    enlaces: [
      {
        etiqueta: "@refugiohuellasdeamor",
        url: "https://www.instagram.com/refugiohuellasdeamor",
        icono: "instagram",
      },
    ],
  },
  {
    nombre: "Hogar Sara Reyes",
    ciudad: "Pereira",
    descripcion: "Hogar de paso y refugio para animales rescatados en Pereira.",
    enlaces: [
      {
        etiqueta: "@hogarsarareyespereira",
        url: "https://www.instagram.com/hogarsarareyespereira",
        icono: "instagram",
      },
    ],
  },
  {
    nombre: "Asociación Adóptame Pereira",
    ciudad: "Pereira",
    descripcion: "Red de adopciones de perros y gatos en Pereira.",
    enlaces: [
      {
        etiqueta: "@adoptamepereira_",
        url: "https://www.instagram.com/adoptamepereira_",
        icono: "instagram",
      },
    ],
  },

  // ─── Armenia ──────────────────────────────────────────────────
  {
    nombre: "Fundación Kenovy",
    ciudad: "Armenia",
    afectadaSismo: true,
    necesita:
      "Materiales de construcción, insumos veterinarios, carpas, alimento y voluntarios",
    zona: "Vereda Altos de los Guevara",
    descripcion:
      "Alberga 113 perros y buena parte de la finca colapsó con el sismo; seis animales quedaron desaparecidos.",
    enlaces: [
      {
        etiqueta: "Nota de El Espectador",
        url: "https://www.elespectador.com/la-red-zoocial/estos-refugios-de-animales-colapsaron-por-el-terremoto-en-colombia-asi-puede-ayudar/",
        icono: "prensa",
      },
    ],
  },
  {
    nombre: "Corteza Terrestre",
    ciudad: "Armenia",
    descripcion:
      "Sociedad protectora de animales con refugio propio en Armenia.",
    enlaces: [
      {
        etiqueta: "cortezaterrestre.org",
        url: "https://www.cortezaterrestre.org/",
        icono: "web",
      },
    ],
  },

  // ─── Cali ─────────────────────────────────────────────────────
  {
    nombre: "Fundación Corazón Gatuno",
    ciudad: "Cali",
    zona: "Corregimiento Andes, Vía Brisas",
    descripcion:
      "Alberga cerca de 150 gatos y 80 perros rescatados del abandono y el maltrato. Recibe adopciones, apadrinamientos y donaciones.",
    enlaces: [
      {
        etiqueta: "@corazongatuno",
        url: "https://www.instagram.com/corazongatuno",
        icono: "instagram",
      },
      {
        etiqueta: "corazongatuno.org",
        url: "https://www.corazongatuno.org/",
        icono: "web",
      },
    ],
  },
  {
    nombre: "Fundación Paraíso de la Mascota",
    ciudad: "Cali",
    descripcion: "Adopción responsable de perros y gatos en Cali.",
    enlaces: [
      {
        etiqueta: "paraisodelamascota.org",
        url: "https://www.paraisodelamascota.org/",
        icono: "web",
      },
    ],
  },

  // ─── Popayán ──────────────────────────────────────────────────
  {
    nombre: "Fundación Vida Animal (FVA)",
    ciudad: "Popayán",
    descripcion: "Rescate y protección de animales en Popayán.",
    enlaces: [
      {
        etiqueta: "Página de Facebook",
        url: "https://www.facebook.com/fvapopayan/",
        icono: "facebook",
      },
    ],
  },
  {
    nombre: "Casa K Rescate",
    ciudad: "Popayán",
    descripcion: "Rescate y adopción de perros en Popayán.",
    enlaces: [
      {
        etiqueta: "@casak.rescate",
        url: "https://www.instagram.com/casak.rescate/",
        icono: "instagram",
      },
    ],
  },

  // ─── Otras ciudades del Valle golpeadas por el sismo ──────────
  {
    nombre: "Salvando Huellitas",
    ciudad: "Buenaventura",
    afectadaSismo: true,
    necesita: "Aportes económicos",
    descripcion:
      "Sostiene más de 200 animales y quedó con problemas para conseguir insumos por las restricciones de movilidad tras el sismo.",
    enlaces: [
      {
        etiqueta: "Nota de El Espectador",
        url: "https://www.elespectador.com/la-red-zoocial/estos-refugios-de-animales-colapsaron-por-el-terremoto-en-colombia-asi-puede-ayudar/",
        icono: "prensa",
      },
    ],
  },
  {
    nombre: "Fundación Latidos de Amor",
    ciudad: "Tuluá",
    afectadaSismo: true,
    necesita: "Ayuda humanitaria",
    descripcion: "El refugio quedó destruido por el sismo.",
    enlaces: [
      {
        etiqueta: "Nota de El Espectador",
        url: "https://www.elespectador.com/la-red-zoocial/estos-refugios-de-animales-colapsaron-por-el-terremoto-en-colombia-asi-puede-ayudar/",
        icono: "prensa",
      },
    ],
  },
];

/** Ciudades con al menos una organización, en el orden en que se muestran. */
export const CIUDADES_CON_ORGS = [
  ...new Set(ORGANIZACIONES.map((o) => o.ciudad)),
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
