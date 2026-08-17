import { NextRequest, NextResponse } from "next/server";
import { cambiarEstadoAdopcion } from "@/lib/almacen";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALIDOS = ["disponible", "reservado", "adoptado"] as const;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const cuerpo = await request.json().catch(() => ({}));
    const token = String(cuerpo.token ?? "").trim();
    const estado = String(cuerpo.estado ?? "");

    if (!token) {
      return NextResponse.json({ error: "Falta el código de gestión." }, { status: 400 });
    }
    if (!(VALIDOS as readonly string[]).includes(estado)) {
      return NextResponse.json({ error: "Estado no válido." }, { status: 400 });
    }

    const ok = await cambiarEstadoAdopcion(id, token, estado as (typeof VALIDOS)[number]);
    if (!ok) {
      return NextResponse.json(
        { error: "El código no coincide con esta publicación." },
        { status: 403 },
      );
    }
    return NextResponse.json({ ok: true, estado });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "No pudimos actualizar" },
      { status: 500 },
    );
  }
}
