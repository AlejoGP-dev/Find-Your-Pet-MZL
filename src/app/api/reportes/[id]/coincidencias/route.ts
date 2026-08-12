import { NextRequest, NextResponse } from "next/server";
import { listarReportes, obtenerReporte } from "@/lib/almacen";
import { buscarCoincidencias } from "@/lib/coincidencias";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const reporte = await obtenerReporte(id);
    if (!reporte) {
      return NextResponse.json({ error: "El reporte no existe." }, { status: 404 });
    }
    const candidatos = await listarReportes({
      tipo: reporte.tipo === "perdida" ? "encontrada" : "perdida",
      especie: reporte.especie,
      estado: "activo",
    });
    return NextResponse.json({ coincidencias: buscarCoincidencias(reporte, candidatos) });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error buscando coincidencias" },
      { status: 500 },
    );
  }
}
