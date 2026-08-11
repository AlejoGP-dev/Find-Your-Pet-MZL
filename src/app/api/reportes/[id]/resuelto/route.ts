import { NextRequest, NextResponse } from "next/server";
import { marcarResuelto } from "@/lib/almacen";

export const runtime = "nodejs";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const cuerpo = (await request.json()) as { token?: string };
    if (!cuerpo?.token) {
      return NextResponse.json({ error: "Falta el código de gestión." }, { status: 400 });
    }
    const ok = await marcarResuelto(id, cuerpo.token);
    if (!ok) {
      return NextResponse.json({ error: "El código no coincide con este reporte." }, { status: 403 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "No pudimos actualizar el reporte" },
      { status: 500 },
    );
  }
}
