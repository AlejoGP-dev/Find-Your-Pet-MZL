/**
 * GEO-002 — Canales oficiales para «¿dónde reporto una mascota perdida?».
 *
 * Una entrada por ciudad y un elemento por paso: agregar una ciudad o un paso es
 * agregar un objeto, sin tocar las páginas. El enlace del home y las guías salen
 * de esta lista, así que una ciudad sin entrada nunca deja un enlace a un ancla
 * vacía.
 *
 * Regla de `D-38` y `D-49`: acá solo entra lo verificado contra la fuente. Un
 * número muerto en plena búsqueda hace más daño que no tenerlo. Lo que falte por
 * confirmar se deja por fuera, no se pone con una advertencia.
 */
export type PasoCanal = {
  titulo: string;
  texto: string;
  lista?: string[];
  nota?: string;
  boton?: { texto: string; href: string };
};

export type CanalesCiudad = {
  /** El mismo de la ruta: `/bogota`. */
  slug: string;
  /** Lo que se lee en los enlaces. */
  nombre: string;
  h2: string;
  /** Va en el hero, justo después de los botones. */
  respuesta: string;
  pasos: PasoCanal[];
  encontraste: {
    titulo: string;
    texto: string;
    enlace: { texto: string; href: string };
  };
  /** La meta description de la página de la ciudad. */
  descripcion: string;
  /** Quién publica los datos, para la nota de cierre. */
  autoridad: string;
  fuentes: { texto: string; url: string }[];
  /** Fecha de la última revisión contra la fuente. Se muestra en la página. */
  revisado: string;
};

export const CANALES: CanalesCiudad[] = [
  {
    slug: "bogota",
    nombre: "Bogotá",
    h2: "¿Dónde reportar una mascota perdida en Bogotá?",
    respuesta:
      "Haz estas dos cosas hoy: publica el reporte acá, gratis y en menos de un minuto, y envía el aviso al portal del Distrito, «Perros y gatos buscan su hogar», al correo animalesperdidos@animalesbog.gov.co. Una no reemplaza a la otra: cada una llega a gente distinta.",
    pasos: [
      {
        titulo: "Publica el reporte en Find Your Pet",
        texto:
          "Foto, barrio y tu WhatsApp. Sin registro. Te queda además un afiche listo para imprimir.",
        boton: { texto: "Perdí a mi mascota", href: "/reportar?tipo=perdida&ciudad=bogota" },
      },
      {
        titulo: "Envía el aviso al portal del Distrito",
        texto:
          "Es gratuito y lo maneja el Instituto Distrital de Protección y Bienestar Animal (IDPYBA). Escribe a animalesperdidos@animalesbog.gov.co con:",
        lista: [
          "Una foto en buena resolución.",
          "Nombre, raza, edad y una descripción breve: tamaño, condición física, si toma medicamentos.",
          "Cómo se perdió, dónde, cuándo y el último sitio donde la vieron.",
          "Tu celular, WhatsApp o correo.",
        ],
        nota: "Ten en cuenta que tus datos de contacto quedan publicados, y que el Instituto publica el aviso pero no verifica la información ni hace el contacto por ti.",
      },
    ],
    encontraste: {
      titulo: "¿Encontraste un animal?",
      texto: "Si está bien y parece tener familia,",
      enlace: {
        texto: "publícalo como encontrado",
        href: "/reportar?tipo=encontrada&ciudad=bogota",
      },
    },
    descripcion:
      "Reporta gratis una mascota perdida o encontrada en Bogotá y envía el aviso al portal del Distrito. Sin registro y con contacto directo por WhatsApp.",
    autoridad: "la Alcaldía de Bogotá",
    fuentes: [
      { texto: "portal", url: "https://www.animalesbog.gov.co/wpyba/animalesperdidos/" },
      {
        texto: "cómo reportar",
        url: "https://bogota.gov.co/mi-ciudad/ambiente/perros-y-gatos-perdidos-en-bogota-julio-de-2026-ayuda-ubicarlos-0",
      },
    ],
    revisado: "6 de noviembre de 2026",
  },
];

export function canalesDe(slug: string): CanalesCiudad | null {
  return CANALES.find((c) => c.slug === slug) ?? null;
}
