import type { NombreIcono } from "@/components/Icono";

export type Enlace = { etiqueta: string; url: string; icono: string };

/**
 * FEATURE-007 — Una organización puede tener, además de su tarjeta en
 * `/ayudar`, una página propia en `/fundaciones/{slug}`.
 *
 * Todo el contenido vive acá y la plantilla no sabe de ninguna fundación en
 * concreto: **la segunda entra añadiendo un objeto, sin tocar la ruta.** Era
 * un requisito explícito de la spec, y por eso no hay ni un `if` con nombres
 * propios en `src/app/fundaciones/[slug]/page.tsx`.
 *
 * Regla que gobierna estos campos, y no es de estilo: **nada que la fundación
 * no haya dado por escrito.** Si un dato falta, se omite el campo — no se pone
 * un texto de relleno ni un `[por confirmar]`. La página es sobre un tercero y
 * publicada en nuestro dominio: si algo está mal, la confianza que se pierde
 * es la nuestra.
 */
export type BloqueApoyo = {
  icono: NombreIcono;
  titulo: string;
  texto: string;
};

export type PaginaFundacion = {
  slug: string;
  /** `<title>` y meta description. Se escriben aparte del `<h1>` a propósito. */
  titulo: string;
  descripcion: string;
  /** Va sobre el `<h1>`, en la píldora. Suele ser el nombre de la fundación. */
  antetitulo: string;
  /** El `<h1>` en dos líneas: la segunda se pinta en el color de marca. */
  h1: [string, string];
  /** Párrafos de entrada. Admiten **negrita** con dos asteriscos. */
  entrada: string[];
  /** La tira de tres datos bajo la portada. Solo cosas verificadas. */
  datos: { valor: string; texto: string }[];
  /** Bloques de texto corrido. Admiten **negrita**. */
  secciones: { titulo: string; parrafos: string[] }[];
  /** Cita literal. `firma` es de quien la dice, y va tal cual la autorizaron. */
  testimonio: { parrafos: string[]; firma: string };
  apoyo: { titulo: string; bloques: BloqueApoyo[]; pie: string };
  /** Rutas dentro de /public. Optimizadas antes de commitear (ARCH-005). */
  fotos: { portada: string; portadaAlt: string; recortes: string[] };
  /** Logo grande para la cabecera de la página, si lo hay. */
  logo?: string;
};

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
  /** FEATURE-007: si existe, la organización tiene página propia. */
  pagina?: PaginaFundacion;
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
      {
        etiqueta: "Facebook",
        url: "https://www.facebook.com/vecinode4patas/",
        icono: "facebook",
      },
    ],
    pagina: {
      slug: "vecino-de-4-patas",
      titulo: "Vecino de 4 Patas: un hogar para los perros que nadie adopta",
      descripcion:
        "Reciben a los animales que nadie quiere adoptar —por viejos, por enfermos, por su tamaño— y se quedan con ellos hasta el final. Conoce su trabajo y cómo apoyarlos.",
      antetitulo: "Fundación Vecino de 4 Patas",
      // El titular NO lleva el nombre de la fundación a propósito: nadie la
      // busca por su nombre todavía, que es justo el problema que esta página
      // viene a resolver. El nombre va en el `title` y en la píldora de arriba.
      h1: ["Los que nadie adopta", "también tienen familia"],
      entrada: [
        "En casi todas las páginas de animales se muestran los que buscan hogar: los cachorros, los sanos, los que encuentran familia rápido.",
        "**Vecino de 4 Patas hace lo contrario. Por eso casi nadie los ve.**",
      ],
      // Tres datos, los tres verificables. No hay cifra de animales ni año de
      // fundación porque la fundación no los ha dado, y no se inventan.
      datos: [
        { valor: "Hogar geriátrico", texto: "para los que ya nadie va a adoptar" },
        { valor: "Para siempre", texto: "no están en tránsito: se quedan" },
        { valor: "Manizales", texto: "donde cuidan a sus animales" },
      ],
      secciones: [
        {
          titulo: "Un hogar geriátrico",
          parrafos: [
            "Reciben a los animales **que ya nadie va a adoptar**. Perros y gatos viejos, con enfermedades de base, con problemas de comportamiento.",
            "Algunos llegaron porque estaban enfermos. Otros porque eran muy grandes, o de un color que nadie quería. Y varios, simplemente, porque dejaron de quererlos en su casa.",
            "No los tienen en tránsito esperando a alguien. **Se quedan con ellos hasta el final de sus días.**",
          ],
        },
        {
          titulo: "Por qué es tan difícil que los vean",
          parrafos: [
            "Todo el mundo de la ayuda animal gira alrededor de la adopción: *adopta, no compres*, las ferias, las fichas de animales disponibles. **Una fundación que no tiene animales adoptables no aparece en ninguna de esas conversaciones.**",
            "No tienen nada que ofrecerle a quien busca un perro. Y sin embargo cargan con los casos más caros y más largos: medicamentos todos los días, controles veterinarios, animales que van a estar con ellos años.",
            "**Cuidan a los que nadie quiere, y por eso nadie los ve.**",
          ],
        },
      ],
      // Literal. Solo se le añadió puntuación y se partió en párrafos: ni una
      // palabra cambiada, ni una quitada. Firma sin nombre propio porque la
      // fundación no confirmó si quien habla quiere aparecer nombrada.
      testimonio: {
        parrafos: [
          "Para nosotros esto sería muy importante: visibilizar nuestro trabajo, que se sepa que hay hogares que se dedican a darles una familia hasta el final de sus días.",
          "Al ser nosotros un hogar geriátrico, o para animales gerontes, es muy importante que las personas sepan que con nosotros están los animalitos que no fueron adoptados por sus enfermedades de base, por su comportamiento, por su color, por su tamaño, o simplemente porque ya no los querían tener.",
          "Nuestro objetivo es que ellos conozcan el amor verdadero, que sepan que merecen tener una familia, y que nosotros seremos su familia hasta el final de sus días.",
          "**Nos encanta esta idea, sobre todo para que entiendan que aunque nosotros no tenemos perros o gatos adoptables, también los necesitamos.**",
        ],
        firma: "Fundación Vecino de 4 Patas",
      },
      apoyo: {
        titulo: "Cómo apoyarlos",
        bloques: [
          {
            icono: "comida",
            titulo: "Alimento",
            texto: "Es su necesidad constante, todos los días del año.",
          },
          {
            icono: "medicina",
            titulo: "Medicamentos",
            texto: "Muchos de sus animales están en tratamiento permanente.",
          },
          {
            icono: "megafono",
            titulo: "Difusión",
            texto: "No cuesta nada, y es lo que hace que lo demás llegue.",
          },
        ],
        // El único camino hacia ellos son sus redes. Ni un mecanismo de
        // donación nuestro, ni un intermediario: D-26 y la spec de FEATURE-007.
        pie: "Escríbeles directamente para saber qué necesitan esta semana y cómo hacerles llegar la ayuda:",
      },
      fotos: {
        portada: "/fundaciones/vecino-de-4-patas/casa.jpg",
        portadaAlt: "La fundación en su casa, rodeada de los perros que cuida",
        recortes: [
          "/fundaciones/vecino-de-4-patas/perro-1.jpg",
          "/fundaciones/vecino-de-4-patas/perro-2.jpg",
          "/fundaciones/vecino-de-4-patas/perro-3.jpg",
        ],
      },
      logo: "/fundaciones/vecino-de-4-patas/logo.png",
    },
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
 * FEATURE-007 — Las organizaciones que tienen página propia.
 *
 * De acá salen las rutas estáticas y las entradas del sitemap. Añadir una
 * fundación nueva es añadirle el campo `pagina`: no hay que tocar la ruta, ni
 * el sitemap, ni `/ayudar`.
 */
export const CON_PAGINA: (Organizacion & { pagina: PaginaFundacion })[] =
  ORGANIZACIONES.filter(
    (o): o is Organizacion & { pagina: PaginaFundacion } => Boolean(o.pagina),
  );

export function organizacionPorSlug(slug: string) {
  return CON_PAGINA.find((o) => o.pagina.slug === slug) ?? null;
}

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
export const NECESIDADES: { icono: NombreIcono; texto: string }[] = [
  { icono: "comida", texto: "Alimento (perro y gato)" },
  { icono: "aseo", texto: "Implementos de aseo" },
  { icono: "arena", texto: "Arena para gatos" },
  { icono: "medicina", texto: "Antipulgas" },
  { icono: "gota", texto: "Desparasitante" },
  { icono: "cama", texto: "Cobijas y camas" },
  { icono: "dinero", texto: "Aportes para veterinaria" },
  { icono: "transporte", texto: "Transporte y voluntariado" },
];
