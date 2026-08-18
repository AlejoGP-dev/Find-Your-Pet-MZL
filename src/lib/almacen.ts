import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { Adopcion, NuevaAdopcion } from "./adopciones";
import type { Avistamiento, NuevoAvistamiento, NuevoReporte, Reporte } from "./tipos";

const URL_SUPABASE = process.env.SUPABASE_URL;
const LLAVE_SERVICIO = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = process.env.SUPABASE_BUCKET || "fotos";

export const HAY_SUPABASE = Boolean(URL_SUPABASE && LLAVE_SERVICIO);

let cliente: SupabaseClient | null = null;
function supabase(): SupabaseClient {
  if (!cliente) {
    cliente = createClient(URL_SUPABASE!, LLAVE_SERVICIO!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return cliente;
}

/* ------------------------------------------------------------------ */
/* Modo demo: sin llaves de Supabase la app funciona en memoria.        */
/* Sirve para ver el diseño en local; los datos se pierden al reiniciar */
/* ------------------------------------------------------------------ */
type FilaDemo = Reporte & { token_gestion: string };

const globalDemo = globalThis as unknown as {
  __demoReportes?: FilaDemo[];
  __demoAvistamientos?: Avistamiento[];
};
if (!globalDemo.__demoReportes) globalDemo.__demoReportes = [];
if (!globalDemo.__demoAvistamientos) globalDemo.__demoAvistamientos = [];

const CAMPOS_PUBLICOS =
  "id,tipo,nombre,especie,raza,color,tamano,sexo,foto_url,ciudad,barrio,referencia,fecha,descripcion,contacto_nombre,contacto_whatsapp,estado,avistamientos,created_at";

export type FiltrosReporte = {
  tipo?: string | null;
  especie?: string | null;
  ciudad?: string | null;
  barrio?: string | null;
  estado?: string | null;
  q?: string | null;
};

export async function listarReportes(filtros: FiltrosReporte = {}): Promise<Reporte[]> {
  if (!HAY_SUPABASE) {
    let filas = [...globalDemo.__demoReportes!];
    if (filtros.tipo) filas = filas.filter((r) => r.tipo === filtros.tipo);
    if (filtros.especie) filas = filas.filter((r) => r.especie === filtros.especie);
    if (filtros.ciudad) filas = filas.filter((r) => r.ciudad === filtros.ciudad);
    if (filtros.barrio) filas = filas.filter((r) => r.barrio === filtros.barrio);
    filas = filas.filter((r) => r.estado === (filtros.estado || "activo"));
    if (filtros.q) {
      const q = filtros.q.toLowerCase();
      filas = filas.filter((r) =>
        [r.nombre, r.raza, r.color, r.barrio, r.ciudad, r.descripcion]
          .filter(Boolean)
          .some((campo) => String(campo).toLowerCase().includes(q)),
      );
    }
    return filas
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .map(({ token_gestion: _token, ...resto }) => resto as Reporte);
  }

  let consulta = supabase()
    .from("reportes")
    .select(CAMPOS_PUBLICOS)
    .order("created_at", { ascending: false })
    .limit(300);

  if (filtros.tipo) consulta = consulta.eq("tipo", filtros.tipo);
  if (filtros.especie) consulta = consulta.eq("especie", filtros.especie);
  if (filtros.ciudad) consulta = consulta.eq("ciudad", filtros.ciudad);
  if (filtros.barrio) consulta = consulta.eq("barrio", filtros.barrio);
  consulta = consulta.eq("estado", filtros.estado || "activo");
  if (filtros.q) {
    const q = filtros.q.replace(/[%,()]/g, " ").trim();
    if (q) {
      consulta = consulta.or(
        `nombre.ilike.%${q}%,raza.ilike.%${q}%,color.ilike.%${q}%,barrio.ilike.%${q}%,ciudad.ilike.%${q}%,descripcion.ilike.%${q}%`,
      );
    }
  }

  const { data, error } = await consulta;
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as Reporte[];
}

export async function obtenerReporte(id: string): Promise<Reporte | null> {
  if (!HAY_SUPABASE) {
    const fila = globalDemo.__demoReportes!.find((r) => r.id === id);
    if (!fila) return null;
    const { token_gestion: _token, ...resto } = fila;
    return resto as Reporte;
  }
  const { data, error } = await supabase()
    .from("reportes")
    .select(CAMPOS_PUBLICOS)
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as unknown as Reporte) ?? null;
}

/** Reportes activos publicados con ese mismo número de WhatsApp. */
export async function reportesActivosDe(whatsapp: string): Promise<Reporte[]> {
  const digitos = whatsapp.replace(/\D/g, "").slice(-10);
  if (digitos.length < 10) return [];

  const coincide = (r: { contacto_whatsapp: string }) =>
    r.contacto_whatsapp.replace(/\D/g, "").slice(-10) === digitos;

  if (!HAY_SUPABASE) {
    return globalDemo
      .__demoReportes!.filter((r) => r.estado === "activo" && coincide(r))
      .map(({ token_gestion: _t, ...resto }) => resto as Reporte);
  }

  const { data, error } = await supabase()
    .from("reportes")
    .select(CAMPOS_PUBLICOS)
    .eq("estado", "activo")
    .ilike("contacto_whatsapp", `%${digitos.slice(-7)}%`)
    .order("created_at", { ascending: false })
    .limit(20);
  if (error) return [];
  return ((data ?? []) as unknown as Reporte[]).filter(coincide);
}

/** ¿El mismo número publicó algo casi idéntico hace un momento? */
export async function hayReporteReciente(
  whatsapp: string,
  especie: string,
): Promise<boolean> {
  const desde = new Date(Date.now() - 10 * 60 * 1000).toISOString();
  const digitos = whatsapp.replace(/\D/g, "").slice(-10);
  if (digitos.length < 10) return false;

  if (!HAY_SUPABASE) {
    return globalDemo.__demoReportes!.some(
      (r) =>
        r.especie === especie &&
        r.contacto_whatsapp.replace(/\D/g, "").slice(-10) === digitos &&
        r.created_at > desde,
    );
  }
  const { data } = await supabase()
    .from("reportes")
    .select("id,contacto_whatsapp")
    .eq("especie", especie)
    .gte("created_at", desde)
    .limit(50);
  return (data ?? []).some(
    (r) =>
      (r as { contacto_whatsapp: string }).contacto_whatsapp
        .replace(/\D/g, "")
        .slice(-10) === digitos,
  );
}

export async function crearReporte(
  datos: NuevoReporte,
): Promise<{ id: string; token: string }> {
  const token = crypto.randomUUID().replace(/-/g, "").slice(0, 10).toUpperCase();

  if (!HAY_SUPABASE) {
    const fila: FilaDemo = {
      ...datos,
      id: crypto.randomUUID(),
      estado: "activo",
      avistamientos: 0,
      created_at: new Date().toISOString(),
      token_gestion: token,
    };
    globalDemo.__demoReportes!.unshift(fila);
    return { id: fila.id, token };
  }

  const { data, error } = await supabase()
    .from("reportes")
    .insert({ ...datos, token_gestion: token })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  return { id: (data as { id: string }).id, token };
}

export async function marcarResuelto(id: string, token: string): Promise<boolean> {
  if (!HAY_SUPABASE) {
    const fila = globalDemo.__demoReportes!.find((r) => r.id === id);
    if (!fila || fila.token_gestion !== token.trim().toUpperCase()) return false;
    fila.estado = "resuelto";
    return true;
  }
  const { data, error } = await supabase()
    .from("reportes")
    .update({ estado: "resuelto" })
    .eq("id", id)
    .eq("token_gestion", token.trim().toUpperCase())
    .select("id");
  if (error) throw new Error(error.message);
  return (data ?? []).length > 0;
}

export async function subirFoto(
  archivo: File,
): Promise<string> {
  const extension = (archivo.name.split(".").pop() || "jpg").toLowerCase();
  const nombre = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${extension}`;

  if (!HAY_SUPABASE) {
    // En modo demo devolvemos la imagen incrustada para poder verla en pantalla.
    const buffer = Buffer.from(await archivo.arrayBuffer());
    return `data:${archivo.type || "image/jpeg"};base64,${buffer.toString("base64")}`;
  }

  const { error } = await supabase()
    .storage.from(BUCKET)
    .upload(nombre, await archivo.arrayBuffer(), {
      contentType: archivo.type || "image/jpeg",
      upsert: false,
    });
  if (error) throw new Error(error.message);

  const { data } = supabase().storage.from(BUCKET).getPublicUrl(nombre);
  return data.publicUrl;
}

export async function contarPorEstado(ciudad?: string | null): Promise<{
  perdidas: number;
  encontradas: number;
  reunidas: number;
}> {
  if (!HAY_SUPABASE) {
    const filas = globalDemo.__demoReportes!.filter(
      (r) => !ciudad || r.ciudad === ciudad,
    );
    return {
      perdidas: filas.filter((r) => r.estado === "activo" && r.tipo === "perdida").length,
      encontradas: filas.filter((r) => r.estado === "activo" && r.tipo === "encontrada")
        .length,
      reunidas: filas.filter((r) => r.estado === "resuelto").length,
    };
  }

  const contar = async (filtro: (c: ReturnType<typeof consultaBase>) => typeof c) => {
    const base = consultaBase();
    const { count } = await filtro(ciudad ? base.eq("ciudad", ciudad) : base);
    return count ?? 0;
  };

  const [perdidas, encontradas, reunidas] = await Promise.all([
    contar((c) => c.eq("estado", "activo").eq("tipo", "perdida")),
    contar((c) => c.eq("estado", "activo").eq("tipo", "encontrada")),
    contar((c) => c.eq("estado", "resuelto")),
  ]);

  return { perdidas, encontradas, reunidas };
}

function consultaBase() {
  return supabase().from("reportes").select("id", { count: "exact", head: true });
}


/* ------------------------------------------------------------------ */
/* Avistamientos: pistas que deja la comunidad sobre una mascota       */
/* ------------------------------------------------------------------ */

export async function listarAvistamientos(reporteId: string): Promise<Avistamiento[]> {
  if (!HAY_SUPABASE) {
    return globalDemo
      .__demoAvistamientos!.filter((a) => a.reporte_id === reporteId)
      .sort((a, b) => b.created_at.localeCompare(a.created_at));
  }
  const { data, error } = await supabase()
    .from("avistamientos")
    .select("id,reporte_id,lugar,fecha,comentario,nombre,whatsapp,created_at")
    .eq("reporte_id", reporteId)
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as Avistamiento[];
}

export async function crearAvistamiento(
  datos: NuevoAvistamiento,
): Promise<Avistamiento> {
  if (!HAY_SUPABASE) {
    const fila: Avistamiento = {
      ...datos,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    };
    globalDemo.__demoAvistamientos!.unshift(fila);
    const reporte = globalDemo.__demoReportes!.find((r) => r.id === datos.reporte_id);
    if (reporte) reporte.avistamientos += 1;
    return fila;
  }
  const { data, error } = await supabase()
    .from("avistamientos")
    .insert(datos)
    .select("id,reporte_id,lugar,fecha,comentario,nombre,whatsapp,created_at")
    .single();
  if (error) throw new Error(error.message);
  return data as unknown as Avistamiento;
}

/** Solo quien publicó el reporte (con su código) puede borrar una pista. */
export async function eliminarAvistamiento(
  avistamientoId: string,
  token: string,
): Promise<boolean> {
  const codigo = token.trim().toUpperCase();

  if (!HAY_SUPABASE) {
    const indice = globalDemo.__demoAvistamientos!.findIndex(
      (a) => a.id === avistamientoId,
    );
    if (indice === -1) return false;
    const aviso = globalDemo.__demoAvistamientos![indice];
    const reporte = globalDemo.__demoReportes!.find((r) => r.id === aviso.reporte_id);
    if (!reporte || reporte.token_gestion !== codigo) return false;
    globalDemo.__demoAvistamientos!.splice(indice, 1);
    reporte.avistamientos = Math.max(reporte.avistamientos - 1, 0);
    return true;
  }

  const { data: aviso } = await supabase()
    .from("avistamientos")
    .select("id,reporte_id")
    .eq("id", avistamientoId)
    .maybeSingle();
  if (!aviso) return false;

  const { data: reporte } = await supabase()
    .from("reportes")
    .select("id")
    .eq("id", (aviso as { reporte_id: string }).reporte_id)
    .eq("token_gestion", codigo)
    .maybeSingle();
  if (!reporte) return false;

  const { error } = await supabase()
    .from("avistamientos")
    .delete()
    .eq("id", avistamientoId);
  if (error) throw new Error(error.message);
  return true;
}

/* ==================================================================== */
/* Adopciones                                                           */
/* Tabla aparte a propósito: el listado de perdidas/encontradas está     */
/* vivo y no se puede romper por agregarle un tercer caso.              */
/* ==================================================================== */

type FilaAdopcionDemo = Adopcion & { token_gestion: string };
const globalAdop = globalThis as unknown as { __demoAdopciones?: FilaAdopcionDemo[] };
if (!globalAdop.__demoAdopciones) globalAdop.__demoAdopciones = [];

const CAMPOS_ADOPCION =
  "id,nombre,especie,raza,color,tamano,sexo,edad,foto_url,esterilizado,vacunas,desparasitado,convive_con,temperamento,motivo,entrego_con,ciudad,barrio,descripcion,contacto_nombre,contacto_whatsapp,es_fundacion,estado,created_at";

export type FiltrosAdopcion = {
  especie?: string | null;
  ciudad?: string | null;
  tamano?: string | null;
  edad?: string | null;
  estado?: string | null;
  q?: string | null;
};

export async function listarAdopciones(
  filtros: FiltrosAdopcion = {},
): Promise<Adopcion[]> {
  const estado = filtros.estado || "disponible";

  if (!HAY_SUPABASE) {
    let filas = [...globalAdop.__demoAdopciones!];
    if (filtros.especie) filas = filas.filter((a) => a.especie === filtros.especie);
    if (filtros.ciudad) filas = filas.filter((a) => a.ciudad === filtros.ciudad);
    if (filtros.tamano) filas = filas.filter((a) => a.tamano === filtros.tamano);
    if (filtros.edad) filas = filas.filter((a) => a.edad === filtros.edad);
    filas =
      estado === "adoptado"
        ? filas.filter((a) => a.estado === "adoptado")
        : filas.filter((a) => a.estado !== "adoptado");
    if (filtros.q) {
      const q = filtros.q.toLowerCase();
      filas = filas.filter((a) =>
        [a.nombre, a.raza, a.color, a.barrio, a.ciudad, a.descripcion, a.temperamento]
          .filter(Boolean)
          .some((c) => String(c).toLowerCase().includes(q)),
      );
    }
    return filas
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .map(({ token_gestion: _t, ...resto }) => resto as Adopcion);
  }

  let consulta = supabase()
    .from("adopciones")
    .select(CAMPOS_ADOPCION)
    .order("created_at", { ascending: false })
    .limit(300);

  if (filtros.especie) consulta = consulta.eq("especie", filtros.especie);
  if (filtros.ciudad) consulta = consulta.eq("ciudad", filtros.ciudad);
  if (filtros.tamano) consulta = consulta.eq("tamano", filtros.tamano);
  if (filtros.edad) consulta = consulta.eq("edad", filtros.edad);
  // "disponible" incluye las reservadas: siguen siendo parte de la búsqueda.
  consulta =
    estado === "adoptado"
      ? consulta.eq("estado", "adoptado")
      : consulta.neq("estado", "adoptado");
  if (filtros.q) {
    const q = filtros.q.replace(/[%,()]/g, " ").trim();
    if (q) {
      consulta = consulta.or(
        `nombre.ilike.%${q}%,raza.ilike.%${q}%,color.ilike.%${q}%,barrio.ilike.%${q}%,ciudad.ilike.%${q}%,descripcion.ilike.%${q}%`,
      );
    }
  }

  const { data, error } = await consulta;
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as Adopcion[];
}

export async function obtenerAdopcion(id: string): Promise<Adopcion | null> {
  if (!HAY_SUPABASE) {
    const fila = globalAdop.__demoAdopciones!.find((a) => a.id === id);
    if (!fila) return null;
    const { token_gestion: _t, ...resto } = fila;
    return resto as Adopcion;
  }
  const { data, error } = await supabase()
    .from("adopciones")
    .select(CAMPOS_ADOPCION)
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as unknown as Adopcion) ?? null;
}

export async function crearAdopcion(
  datos: NuevaAdopcion,
): Promise<{ id: string; token: string }> {
  const token = crypto.randomUUID().replace(/-/g, "").slice(0, 10).toUpperCase();

  if (!HAY_SUPABASE) {
    const fila: FilaAdopcionDemo = {
      ...datos,
      id: crypto.randomUUID(),
      estado: "disponible",
      created_at: new Date().toISOString(),
      token_gestion: token,
    };
    globalAdop.__demoAdopciones!.unshift(fila);
    return { id: fila.id, token };
  }

  const { data, error } = await supabase()
    .from("adopciones")
    .insert({ ...datos, token_gestion: token })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  return { id: (data as { id: string }).id, token };
}

/** Cambia el estado con el código de gestión de quien publicó. */
export async function cambiarEstadoAdopcion(
  id: string,
  token: string,
  estado: "disponible" | "reservado" | "adoptado",
): Promise<boolean> {
  if (!HAY_SUPABASE) {
    const fila = globalAdop.__demoAdopciones!.find((a) => a.id === id);
    if (!fila || fila.token_gestion !== token.trim().toUpperCase()) return false;
    fila.estado = estado;
    return true;
  }
  const { data, error } = await supabase()
    .from("adopciones")
    .update({ estado })
    .eq("id", id)
    .eq("token_gestion", token.trim().toUpperCase())
    .select("id");
  if (error) throw new Error(error.message);
  return (data ?? []).length > 0;
}

export async function contarAdopciones(ciudad?: string | null): Promise<{
  disponibles: number;
  adoptadas: number;
}> {
  if (!HAY_SUPABASE) {
    const filas = globalAdop.__demoAdopciones!.filter(
      (a) => !ciudad || a.ciudad === ciudad,
    );
    return {
      disponibles: filas.filter((a) => a.estado !== "adoptado").length,
      adoptadas: filas.filter((a) => a.estado === "adoptado").length,
    };
  }
  const base = () => {
    const c = supabase().from("adopciones").select("id", { count: "exact", head: true });
    return ciudad ? c.eq("ciudad", ciudad) : c;
  };
  const [d, a] = await Promise.all([
    base().neq("estado", "adoptado"),
    base().eq("estado", "adoptado"),
  ]);
  return { disponibles: d.count ?? 0, adoptadas: a.count ?? 0 };
}

/* ------------------------------------------------------------------ */
/* SEO: consultas ligeras para el sitemap y los umbrales de indexación  */
/* ------------------------------------------------------------------ */

export type EntradaSitemap = { id: string; created_at: string; estado: string };

/**
 * Solo los campos que necesita el sitemap.
 *
 * No usa CAMPOS_PUBLICOS a propósito: traer 139 filas completas —con
 * descripción, foto y datos de contacto— para generar URLs sería desperdiciar
 * ancho de banda en cada regeneración.
 */
export async function listarParaSitemap(): Promise<EntradaSitemap[]> {
  if (!HAY_SUPABASE) {
    return globalDemo.__demoReportes!.map((r) => ({
      id: r.id,
      created_at: r.created_at,
      estado: r.estado,
    }));
  }
  const { data, error } = await supabase()
    .from("reportes")
    .select("id,created_at,estado")
    .order("created_at", { ascending: false })
    // Guardarraíl: un sitemap deja de ser válido pasadas las 50.000 URLs.
    .limit(45000);
  if (error) throw new Error(error.message);
  return (data ?? []) as EntradaSitemap[];
}

/** Igual que la anterior, sobre la tabla de adopciones. */
export async function listarAdopcionesParaSitemap(): Promise<EntradaSitemap[]> {
  if (!HAY_SUPABASE) {
    return globalAdop.__demoAdopciones!.map((a) => ({
      id: a.id,
      created_at: a.created_at,
      estado: a.estado,
    }));
  }
  const { data, error } = await supabase()
    .from("adopciones")
    .select("id,created_at,estado")
    .order("created_at", { ascending: false })
    .limit(45000);
  if (error) throw new Error(error.message);
  return (data ?? []) as EntradaSitemap[];
}

/**
 * { "Manizales": 85, "Villamaría": 20, … } sobre reportes activos.
 *
 * Agrupa en JS en vez de en SQL porque Supabase no expone GROUP BY por REST y
 * con estos volúmenes la diferencia es imperceptible. Si el sitio llega a
 * decenas de miles de filas, esto pide una vista materializada.
 */
export async function contarReportesPorCiudad(): Promise<Record<string, number>> {
  const filas = !HAY_SUPABASE
    ? globalDemo.__demoReportes!.filter((r) => r.estado === "activo").map((r) => ({
        ciudad: r.ciudad,
      }))
    : await (async () => {
        const { data, error } = await supabase()
          .from("reportes")
          .select("ciudad")
          .eq("estado", "activo")
          .limit(50000);
        if (error) throw new Error(error.message);
        return (data ?? []) as { ciudad: string }[];
      })();

  const conteo: Record<string, number> = {};
  for (const f of filas) {
    if (!f.ciudad) continue;
    conteo[f.ciudad] = (conteo[f.ciudad] ?? 0) + 1;
  }
  return conteo;
}

/** Equivalente para adopciones disponibles. */
export async function contarAdopcionesPorCiudad(): Promise<Record<string, number>> {
  const filas = !HAY_SUPABASE
    ? globalAdop.__demoAdopciones!.filter((a) => a.estado === "disponible").map((a) => ({
        ciudad: a.ciudad,
      }))
    : await (async () => {
        const { data, error } = await supabase()
          .from("adopciones")
          .select("ciudad")
          .eq("estado", "disponible")
          .limit(50000);
        if (error) throw new Error(error.message);
        return (data ?? []) as { ciudad: string }[];
      })();

  const conteo: Record<string, number> = {};
  for (const f of filas) {
    if (!f.ciudad) continue;
    conteo[f.ciudad] = (conteo[f.ciudad] ?? 0) + 1;
  }
  return conteo;
}
