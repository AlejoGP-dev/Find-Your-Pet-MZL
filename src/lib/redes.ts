import type { NombreIcono } from "@/components/Icono";

/**
 * Los perfiles oficiales de la marca, en un solo sitio.
 *
 * GSC-002. Antes el único enlace social del sitio era la cuenta personal de
 * Alejo (`@ialejog`), repetida a mano en el footer y en `/ayudar`. Para Google
 * eso significaba que el dominio no declaraba relación con ninguno de los
 * perfiles de Find Your Pet CO — una señal de entidad que se estaba dejando
 * sobre la mesa gratis.
 *
 * Vive acá y no dentro del layout para que agregar o cambiar una red sea tocar
 * un solo archivo. El handle `findyourpetco` es el mismo en las tres redes a
 * propósito (ver SOCIAL-HANDOFF-REDES).
 *
 * OJO — no colgar estas URL del JSON-LD como `sameAs` en esta iteración. El
 * sitio declara un nodo `Person`, no `Organization`, porque `/terminos` afirma
 * que el proyecto no es empresa ni fundación; colgar los perfiles de la marca
 * de una persona sería marcado impreciso. Se revisa el día que el proyecto se
 * formalice como entidad.
 */
export type Red = {
  nombre: string;
  url: string;
  icono: NombreIcono;
};

export const REDES: Red[] = [
  {
    nombre: "Facebook",
    url: "https://www.facebook.com/findyourpetco/",
    icono: "facebook",
  },
  {
    nombre: "Instagram",
    url: "https://www.instagram.com/findyourpetco/",
    icono: "instagram",
  },
  {
    nombre: "TikTok",
    url: "https://www.tiktok.com/@findyourpetco",
    icono: "tiktok",
  },
];
