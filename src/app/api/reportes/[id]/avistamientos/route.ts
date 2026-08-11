import { NextRequest, NextResponse } from "next/server";
import {
  crearAvistamiento,
  listarAvistamientos,
  obtenerReporte,
} from "@/lib/almacen";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Contexto = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Contexto) {
  const { id } = await params;
  try {
    return NextResponse.json({ avistamientos: await listarAvistamientos(id) });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error consultando pistas" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest, { params }: Contexto) {
  const { id } = await params;
  try {
    const cuerpo = (await request.json()) as Record<string, string | undefined>;

    // Trampa anti-spam
    if (cuerpo.website) {
      return NextResponse.json({ error: "Pista no válida." }, { status: 400 });
    }

    const reporte = await obtenerReporte(id);
    if (!reporte) {
      return NextResponse.json({ error: "El reporte no existe." }, { status: 404 });
    }
    if (reporte.estado === "resuelto") {
      return NextResponse.json(
        { error: "Esta mascota ya apareció, no hacen falta más pistas. 🎉" },
        { status: 409 },
      );
    }

    const lugar = (cuerpo.lugar ?? "").trim();
    const fecha = (cuerpo.fecha ?? "").trim();
    const comentario = (cuerpo.comentario ?? "").trim();

    if (lugar.length < 3) {
      return NextResponse.json(
        { error: "Cuéntanos dónde la viste (barrio, calle o punto de referencia)." },
        { status: 400 },
      );
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
      return NextResponse.json({ error: "Falta la fecha en que la viste." }, { status: 400 });
    }

    const avistamiento = await crearAvistamiento({
      reporte_id: id,
      lugar: lugar.slice(0, 140),
      fecha,
      comentario: comentario ? comentario.slice(0, 500) : null,
      nombre: (cuerpo.nombre ?? "").trim().slice(0, 60) || null,
      whatsapp: (cuerpo.whatsapp ?? "").trim().slice(0, 20) || null,
    });

    return NextResponse.json({ avistamiento }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "No pudimos guardar la pista" },
      { status: 500 },
    );
  }
}
