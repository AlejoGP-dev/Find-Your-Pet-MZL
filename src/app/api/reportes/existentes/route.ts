import { NextRequest, NextResponse } from "next/server";
import { reportesActivosDe } from "@/lib/almacen";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Antes de publicar revisamos si ese número ya tiene reportes activos.
 * Sirve para avisarle a la persona que quizá está republicando por error
 * en vez de cerrar o actualizar el reporte que ya tenía.
 */
export async function GET(request: NextRequest) {
  const whatsapp = request.nextUrl.searchParams.get("whatsapp") ?? "";
  if (whatsapp.replace(/\D/g, "").length < 10) {
    return NextResponse.json({ reportes: [] });
  }
  try {
    const reportes = await reportesActivosDe(whatsapp);
    return NextResponse.json({
      reportes: reportes.map((r) => ({
        id: r.id,
        nombre: r.nombre,
        tipo: r.tipo,
        barrio: r.barrio,
        fecha: r.fecha,
        foto_url: r.foto_url,
      })),
    });
  } catch {
    return NextResponse.json({ reportes: [] });
  }
}
