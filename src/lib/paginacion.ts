/**
 * Paginación del listado.
 *
 * Vive en `lib/` y no dentro de la página porque lo comparten tres sitios: el
 * componente que arma el listado, el canonical del home y el de cada ciudad. Y
 * porque App Router no admite exports sueltos en un `page.tsx`.
 */

/**
 * Tarjetas por página.
 *
 * 24 y no 12 ni 48: doce obligan a paginar apenas se empieza a mirar, y
 * cuarenta y ocho devuelven el problema que esto viene a resolver — el home
 * pintaba las 125 de una sola vez (medido: 791 KB de HTML, 2.590 nodos y 125
 * fotos en un mismo documento). Con 24, en móvil son 12 filas de a dos.
 */
export const POR_PAGINA = 24;

/**
 * Tope del modo «ver todos».
 *
 * Existe por el filtro «cerca de mí», que ordena y esconde las tarjetas que ya
 * pintó el servidor: si una mascota está a 500 m pero cayó en la página 4, sin
 * este escape no habría manera de que apareciera. Es el mismo límite que tenía
 * el listado antes de paginarse, así que no es un modo nuevo: es el de antes.
 */
export const TOPE_VER_TODOS = 300;

type Consulta = Record<string, string | string[] | undefined>;

function primero(valor: string | string[] | undefined): string | null {
  if (Array.isArray(valor)) return valor[0] ?? null;
  return valor ?? null;
}

/** `?pagina=3` → 3. Vacío, cero, negativo o basura → 1. */
export function paginaDe(params: Consulta): number {
  const n = Number(primero(params.pagina));
  return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1;
}

/** `?ver=todos` apaga la paginación para que el filtro por cercanía vea todo. */
export function verTodosDe(params: Consulta): boolean {
  return primero(params.ver) === "todos";
}

/**
 * Canonical de un listado paginado.
 *
 * Paginar no es duplicar: la página 2 lista mascotas distintas de la 1. Si
 * apuntara a la 1, Google dejaría de rastrear las fichas que solo se enlazan
 * desde ahí — y en este sitio cada ficha es una mascota que alguien busca.
 */
export function canonicalPaginado(base: string, pagina: number): string {
  return pagina > 1 ? `${base}?pagina=${pagina}` : base;
}
