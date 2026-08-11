import { NextRequest, NextResponse } from "next/server";
import { crearReporte, listarReportes, subirFoto } from "@/lib/almacen";
import type { NuevoReporte } from "@/lib/tipos";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const p = request.nextUrl.searchParams;
  try {
    const reportes = await listarReportes({
      tipo: p.get("tipo"),
      especie: p.get("especie"),
      barrio: p.get("barrio"),
      estado: p.get("estado"),
      q: p.get("q"),
    });
    return NextResponse.json({ reportes });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error consultando reportes" },
      { status: 500 },
    );
  }
}

const MAX_FOTO = 6 * 1024 * 1024;

function texto(form: FormData, campo: string): string {
  return String(form.get(campo) ?? "").trim();
}

function textoOpcional(form: FormData, campo: string): string | null {
  const valor = texto(form, campo);
  return valor ? valor : null;
}

export async function POST(request: NextRequest) {
  try {
    const form = await request.formData();

    // Trampa anti-spam: los bots llenan campos ocultos.
    if (texto(form, "website")) {
      return NextResponse.json({ error: "Reporte no válido." }, { status: 400 });
    }

    const tipo = texto(form, "tipo");
    if (tipo !== "perdida" && tipo !== "encontrada") {
      return NextResponse.json({ error: "Indica si la mascota se perdió o la encontraste." }, { status: 400 });
    }

    const especie = texto(form, "especie");
    if (!["perro", "gato", "otro"].includes(especie)) {
      return NextResponse.json({ error: "Selecciona el tipo de mascota." }, { status: 400 });
    }

    const barrio = texto(form, "barrio");
    const fecha = texto(form, "fecha");
    const contacto_nombre = texto(form, "contacto_nombre");
    const contacto_whatsapp = texto(form, "contacto_whatsapp");

    if (!barrio) return NextResponse.json({ error: "Falta el barrio o la zona." }, { status: 400 });
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha))
      return NextResponse.json({ error: "Falta la fecha." }, { status: 400 });
    if (contacto_nombre.length < 2)
      return NextResponse.json({ error: "Falta tu nombre." }, { status: 400 });
    if (contacto_whatsapp.replace(/\D/g, "").length < 10)
      return NextResponse.json({ error: "El número de WhatsApp no parece válido." }, { status: 400 });

    let foto_url: string | null = null;
    const foto = form.get("foto");
    if (foto instanceof File && foto.size > 0) {
      if (foto.size > MAX_FOTO)
        return NextResponse.json({ error: "La foto pesa demasiado. Intenta con otra." }, { status: 413 });
      if (!foto.type.startsWith("image/"))
        return NextResponse.json({ error: "El archivo debe ser una imagen." }, { status: 400 });
      foto_url = await subirFoto(foto);
    }

    const datos: NuevoReporte = {
      tipo: tipo as NuevoReporte["tipo"],
      nombre: textoOpcional(form, "nombre"),
      especie: especie as NuevoReporte["especie"],
      raza: textoOpcional(form, "raza"),
      color: textoOpcional(form, "color"),
      tamano: (textoOpcional(form, "tamano") as NuevoReporte["tamano"]) ?? null,
      sexo: (textoOpcional(form, "sexo") as NuevoReporte["sexo"]) ?? null,
      foto_url,
      barrio,
      referencia: textoOpcional(form, "referencia"),
      fecha,
      descripcion: textoOpcional(form, "descripcion"),
      contacto_nombre,
      contacto_whatsapp,
    };

    const { id, token } = await crearReporte(datos);
    return NextResponse.json({ id, token }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "No pudimos guardar el reporte" },
      { status: 500 },
    );
  }
}
