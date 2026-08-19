import Link from "next/link";
import Icono from "@/components/Icono";

export default function NoEncontrado() {
  return (
    <div className="mx-auto grid max-w-lg place-items-center px-4 py-20 text-center">
      <p className="text-6xl">
        <Icono nombre="huella" />
      </p>
      <h1 className="mt-4 text-2xl font-extrabold text-stone-900">
        No encontramos esta página
      </h1>
      <p className="mt-2 text-stone-600">
        Puede que el reporte se haya eliminado o que el enlace esté incompleto.
      </p>
      <Link href="/" className="boton-primario mt-6">
        Ver todos los reportes
      </Link>
    </div>
  );
}
