import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import FormularioAdopcion from "@/components/FormularioAdopcion";

export const metadata: Metadata = {
  title: "Dar una mascota en adopción — Find Your Pet CO",
  description:
    "Publica gratis un perro o gato que busca hogar en Colombia. Sin registro, con contacto directo por WhatsApp.",
  alternates: { canonical: "/adopcion/publicar" },
};

export default function PaginaPublicarAdopcion() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6">
      <Link
        href="/adopcion"
        className="mb-4 inline-block text-sm font-semibold text-marca hover:underline"
      >
        ← Volver a adopciones
      </Link>

      <h1 className="text-3xl font-extrabold leading-tight text-stone-900">
        Dar en adopción
      </h1>
      <p className="mt-2 text-stone-600">
        Solo los campos con * son obligatorios. Entre más cuentes, más fácil es que
        alguien se enamore.
      </p>

      <div className="mt-6">
        <Suspense fallback={<div className="h-96" />}>
          <FormularioAdopcion />
        </Suspense>
      </div>
    </div>
  );
}
