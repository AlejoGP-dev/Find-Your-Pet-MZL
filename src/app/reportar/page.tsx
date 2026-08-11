import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import FormularioReporte from "@/components/FormularioReporte";

export const metadata: Metadata = {
  title: "Publicar reporte — Find Your Pet MZL",
  description:
    "Reporta una mascota perdida o encontrada en Manizales o Villamaría. Toma menos de un minuto.",
};

export default function PaginaReportar() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8">
      <Link
        href="/"
        className="mb-4 inline-block text-sm font-semibold text-marca hover:underline"
      >
        ← Volver a los reportes
      </Link>
      <h1 className="text-2xl font-extrabold text-stone-900 sm:text-3xl">
        Publica tu reporte
      </h1>
      <p className="mt-2 text-stone-600">
        Solo los campos con * son obligatorios. Entre más detalles, más fácil es
        reconocerla.
      </p>

      <div className="mt-6">
        <Suspense fallback={<p className="text-stone-500">Cargando formulario…</p>}>
          <FormularioReporte />
        </Suspense>
      </div>
    </div>
  );
}
