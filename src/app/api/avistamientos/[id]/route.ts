import { NextRequest, NextResponse } from "next/server";
import { eliminarAvistamiento } from "@/lib/almacen";

export const runtime = "nodejs";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const cuerpo = (await request.json().catch(() => ({}))) as { token?: string };
    if (!cuerpo?.token) {
      return NextResponse.json({ error: "Falta el código de gestión." }, { status: 400 });
    }
    const ok = await eliminarAvistamiento(id, cuerpo.token);
    if (!ok) {
      return NextResponse.json(
        { error: "Solo quien publicó el reporte puede borrar una pista." },
        { status: 403 },
      );
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "No pudimos borrar la pista" },
      { status: 500 },
    );
  }
}
