import { NextRequest, NextResponse } from "next/server";
import {
  crearAdopcion,
  listarAdopciones,
  listarReportes,
  subirFoto,
} from "@/lib/almacen";
import { leerMedidas } from "@/lib/medidasImagen";
import type { Convivencia, NuevaAdopcion } from "@/lib/adopciones";
import { buscarPosiblesDuenos } from "@/lib/coincidencias";
import { canonicalizarCiudadNacional } from "@/lib/ciudades";
import { canonicalizarBarrio } from "@/lib/tipos";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_FOTO = 4 * 1024 * 1024;

function texto(form: FormData, campo: string): string {
  return String(form.get(campo) ?? "").trim();
}
function opcional(form: FormData, campo: string): string | null {
  const v = texto(form, campo);
  return v ? v : null;
}

export async function GET(request: NextRequest) {
  const p = request.nextUrl.searchParams;
  try {
    const adopciones = await listarAdopciones({
      especie: p.get("especie"),
      ciudad: p.get("ciudad"),
      tamano: p.get("tamano"),
      edad: p.get("edad"),
      estado: p.get("estado"),
      q: p.get("q"),
    });
    return NextResponse.json({ adopciones });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error consultando adopciones" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const form = await request.formData();

    if (texto(form, "website")) {
      return NextResponse.json({ error: "Publicación no válida." }, { status: 400 });
    }

    const especie = texto(form, "especie");
    if (!["perro", "gato"].includes(especie)) {
      return NextResponse.json({ error: "Selecciona si es perro o gato." }, { status: 400 });
    }

    const ciudad = canonicalizarCiudadNacional(texto(form, "ciudad"));
    const barrio = canonicalizarBarrio(texto(form, "barrio"), ciudad);
    const contacto_nombre = texto(form, "contacto_nombre");
    const contacto_whatsapp = texto(form, "contacto_whatsapp");

    if (!ciudad) return NextResponse.json({ error: "Falta la ciudad." }, { status: 400 });
    if (!barrio) return NextResponse.json({ error: "Falta el barrio o la zona." }, { status: 400 });
    if (contacto_nombre.length < 2)
      return NextResponse.json({ error: "Falta tu nombre." }, { status: 400 });
    if (contacto_whatsapp.replace(/\D/g, "").length < 10)
      return NextResponse.json({ error: "El número de WhatsApp no parece válido." }, { status: 400 });

    if (texto(form, "compromiso") !== "1") {
      return NextResponse.json(
        { error: "Tienes que aceptar las condiciones antes de publicar." },
        { status: 400 },
      );
    }

    // ---- La validación que importa -------------------------------------
    // ¿Esta mascota se parece a alguna que alguien está buscando? Si la
    // persona ya vio el aviso y confirmó, la dejamos seguir; bloquear del
    // todo solo llevaría a que cambie los datos para saltarse el filtro.
    const confirmado = texto(form, "confirmado") === "1";
    if (!confirmado) {
      const perdidas = await listarReportes({
        tipo: "perdida",
        especie,
        ciudad,
        estado: "activo",
      }).catch(() => []);

      const posibles = buscarPosiblesDuenos(
        {
          especie,
          ciudad,
          barrio,
          color: opcional(form, "color"),
          raza: opcional(form, "raza"),
          sexo: opcional(form, "sexo"),
          tamano: opcional(form, "tamano"),
          descripcion: opcional(form, "descripcion"),
          temperamento: opcional(form, "temperamento"),
        },
        perdidas,
      );

      if (posibles.length > 0) {
        return NextResponse.json(
          {
            error: "posibles_duenos",
            coincidencias: posibles.map((c) => ({
              reporte: {
                id: c.reporte.id,
                nombre: c.reporte.nombre,
                barrio: c.reporte.barrio,
                ciudad: c.reporte.ciudad,
                fecha: c.reporte.fecha,
                foto_url: c.reporte.foto_url,
              },
              puntaje: c.puntaje,
              razones: c.razones,
            })),
          },
          { status: 409 },
        );
      }
    }

    let foto_url: string | null = null;
    const foto = form.get("foto");
    if (foto instanceof File && foto.size > 0) {
      if (foto.size > MAX_FOTO)
        return NextResponse.json({ error: "La foto pesa demasiado. Intenta con otra." }, { status: 413 });
      if (!foto.type.startsWith("image/"))
        return NextResponse.json({ error: "El archivo debe ser una imagen." }, { status: 400 });
      foto_url = await subirFoto(foto);
    }

    const convive_con = form
      .getAll("convive_con")
      .map(String)
      .filter((v): v is Convivencia => ["ninos", "perros", "gatos"].includes(v));

    const datos: NuevaAdopcion = {
      nombre: opcional(form, "nombre"),
      especie: especie as NuevaAdopcion["especie"],
      raza: opcional(form, "raza"),
      color: opcional(form, "color"),
      tamano: (opcional(form, "tamano") as NuevaAdopcion["tamano"]) ?? null,
      sexo: (opcional(form, "sexo") as NuevaAdopcion["sexo"]) ?? null,
      edad: (opcional(form, "edad") as NuevaAdopcion["edad"]) ?? null,
      foto_url,
      // WPO-003: ver el equivalente en api/reportes.
      ...(foto_url ? leerMedidas(form) : { foto_ancho: null, foto_alto: null }),
      esterilizado: (opcional(form, "esterilizado") as NuevaAdopcion["esterilizado"]) ?? null,
      vacunas: (opcional(form, "vacunas") as NuevaAdopcion["vacunas"]) ?? null,
      desparasitado: (opcional(form, "desparasitado") as NuevaAdopcion["desparasitado"]) ?? null,
      convive_con,
      temperamento: opcional(form, "temperamento"),
      motivo: opcional(form, "motivo"),
      entrego_con: opcional(form, "entrego_con"),
      ciudad,
      barrio,
      descripcion: opcional(form, "descripcion"),
      contacto_nombre,
      contacto_whatsapp,
      es_fundacion: false,
    };

    const { id, token } = await crearAdopcion(datos);
    return NextResponse.json({ id, token }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "No pudimos publicar la adopción" },
      { status: 500 },
    );
  }
}
