import type { NombreIcono } from "@/components/Icono";

import type { Especie, Sexo, Tamano } from "./tipos";

export type EdadAdopcion = "cachorro" | "joven" | "adulto" | "mayor";
export type Ternaria = "si" | "no" | "no_se";
export type Vacunas = "al_dia" | "parciales" | "no_se";
export type EstadoAdopcion = "disponible" | "reservado" | "adoptado";
export type Convivencia = "ninos" | "perros" | "gatos";

/** En adopción solo manejamos perros y gatos. */
export type EspecieAdopcion = Extract<Especie, "perro" | "gato">;

export type Adopcion = {
  id: string;
  nombre: string | null;
  especie: EspecieAdopcion;
  raza: string | null;
  color: string | null;
  tamano: Tamano | null;
  sexo: Sexo | null;
  edad: EdadAdopcion | null;
  foto_url: string | null;
  /** WPO-003: ver el comentario en lib/tipos.ts. */
  foto_ancho: number | null;
  foto_alto: number | null;
  esterilizado: Ternaria | null;
  vacunas: Vacunas | null;
  desparasitado: Ternaria | null;
  convive_con: Convivencia[];
  temperamento: string | null;
  motivo: string | null;
  entrego_con: string | null;
  ciudad: string;
  barrio: string;
  descripcion: string | null;
  contacto_nombre: string;
  contacto_whatsapp: string;
  es_fundacion: boolean;
  estado: EstadoAdopcion;
  created_at: string;
};

export type NuevaAdopcion = Omit<Adopcion, "id" | "estado" | "created_at">;

export const ESPECIES_ADOPCION: { valor: EspecieAdopcion; etiqueta: string; icono: NombreIcono }[] = [
  { valor: "perro", etiqueta: "Perro", icono: "perro" },
  { valor: "gato", etiqueta: "Gato", icono: "gato" },
];

export const EDADES: { valor: EdadAdopcion; etiqueta: string; pista: string }[] = [
  { valor: "cachorro", etiqueta: "Cachorro", pista: "menos de 1 año" },
  { valor: "joven", etiqueta: "Joven", pista: "1 a 3 años" },
  { valor: "adulto", etiqueta: "Adulto", pista: "3 a 8 años" },
  { valor: "mayor", etiqueta: "Mayor", pista: "más de 8 años" },
];

export const TERNARIAS: { valor: Ternaria; etiqueta: string }[] = [
  { valor: "si", etiqueta: "Sí" },
  { valor: "no", etiqueta: "No" },
  { valor: "no_se", etiqueta: "No sé" },
];

export const VACUNAS: { valor: Vacunas; etiqueta: string }[] = [
  { valor: "al_dia", etiqueta: "Al día" },
  { valor: "parciales", etiqueta: "Parciales" },
  { valor: "no_se", etiqueta: "No sé" },
];

export const CONVIVENCIAS: { valor: Convivencia; etiqueta: string; icono: NombreIcono }[] = [
  { valor: "ninos", etiqueta: "Niños", icono: "nino" },
  { valor: "perros", etiqueta: "Otros perros", icono: "perro" },
  { valor: "gatos", etiqueta: "Gatos", icono: "gato" },
];

export const ESTADOS_ADOPCION: { valor: EstadoAdopcion; etiqueta: string }[] = [
  { valor: "disponible", etiqueta: "Disponible" },
  { valor: "reservado", etiqueta: "Reservado" },
  { valor: "adoptado", etiqueta: "Ya tiene hogar" },
];

/** "cachorro" -> "Cachorro". Devuelve null si el valor no está en la lista. */
export function etiquetaAdopcion<T extends string>(
  lista: { valor: T; etiqueta: string }[],
  valor: T | null | undefined,
): string | null {
  if (!valor) return null;
  return lista.find((i) => i.valor === valor)?.etiqueta ?? null;
}

/**
 * Mensaje de WhatsApp para quien quiere adoptar. Va con contexto para que la
 * persona que publicó sepa de dónde viene el mensaje.
 */
export function enlaceWhatsappAdopcion(a: Adopcion, urlPublica: string): string {
  const quien = a.nombre ? a.nombre : "la mascota";
  const texto = `Hola ${a.contacto_nombre}, vi en Find Your Pet CO que ${quien} está en adopción y me interesa. ¿Podemos hablar?\n\n${urlPublica}`;
  const digitos = a.contacto_whatsapp.replace(/\D/g, "");
  const numero = digitos.startsWith("57")
    ? digitos
    : digitos.length === 10
      ? `57${digitos}`
      : digitos;
  return `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;
}
