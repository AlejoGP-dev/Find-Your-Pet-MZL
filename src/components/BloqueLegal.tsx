import Link from "next/link";
import {
  ACTUALIZADO,
  MOTIVOS_SOPORTE,
  WHATSAPP_SOPORTE_VISIBLE,
  enlaceSoporte,
} from "@/lib/legal";

/** Envoltura común de las páginas legales: mismo ancho, mismo tono. */
export function PaginaLegal({
  titulo,
  bajada,
  children,
}: {
  titulo: string;
  bajada: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8">
      <Link
        href="/"
        className="mb-4 inline-block text-sm font-semibold text-marca hover:underline"
      >
        ← Volver a los reportes
      </Link>

      <h1 className="text-3xl font-extrabold leading-tight text-stone-900 sm:text-4xl">
        {titulo}
      </h1>
      <p className="mt-4 text-base text-stone-600 sm:text-lg">{bajada}</p>
      <p className="mt-3 text-sm text-stone-500">
        Última actualización: {ACTUALIZADO}
      </p>

      <div className="mt-8 space-y-8">{children}</div>

      <CajaSoporte />
    </div>
  );
}

/** Una sección numerada. El número ayuda a citar un punto por WhatsApp. */
export function Punto({
  n,
  titulo,
  children,
}: {
  n: number;
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <section className="scroll-mt-20" id={`punto-${n}`}>
      <h2 className="flex gap-2.5 text-xl font-extrabold leading-snug text-stone-900">
        <span className="shrink-0 text-marca tabular-nums">{n}.</span>
        <span>{titulo}</span>
      </h2>
      <div className="mt-2 space-y-3 text-stone-700 [&_a]:font-bold [&_a]:text-marca [&_a]:underline [&_a]:underline-offset-2 [&_li]:leading-relaxed [&_p]:leading-relaxed [&_strong]:font-bold [&_strong]:text-stone-900">
        {children}
      </div>
    </section>
  );
}

/** Lista de viñetas con el estilo del sitio. */
export function Lista({ children }: { children: React.ReactNode }) {
  return (
    <ul className="ml-5 list-disc space-y-2 text-stone-700 marker:text-marca">
      {children}
    </ul>
  );
}

/** Bloque de contacto que cierra las dos páginas legales. */
export function CajaSoporte() {
  return (
    <section className="mt-10 rounded-2xl border-2 border-marca/30 bg-marca-suave p-6">
      <h2 className="text-xl font-extrabold text-marca-oscuro">
        ¿Tienes un problema o una duda?
      </h2>
      <p className="mt-2 text-stone-700">
        Escríbeme directo por WhatsApp al{" "}
        <strong className="font-bold text-stone-900">
          {WHATSAPP_SOPORTE_VISIBLE}
        </strong>
        . Contesto yo, no un robot, así que puede que me demore un poco — pero
        todos los mensajes se leen.
      </p>
      {/* Cada opción abre WhatsApp con el mensaje ya escrito: llega
          clasificado y la persona no tiene que explicar de dónde viene. */}
      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
        {MOTIVOS_SOPORTE.map((m) => (
          <li key={m.titulo}>
            <a
              href={enlaceSoporte(m.mensaje)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-full flex-col rounded-xl border border-stone-300 bg-white p-3.5 transition hover:border-marca hover:shadow-sm"
            >
              <span className="font-bold leading-snug text-stone-800">
                {m.titulo} 💬
              </span>
              <span className="mt-0.5 text-sm leading-snug text-stone-600">
                {m.detalle}
              </span>
            </a>
          </li>
        ))}
      </ul>

      <a
        href={enlaceSoporte()}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-5 py-3.5 text-base font-extrabold text-white shadow-sm transition hover:brightness-95"
      >
        Es otra cosa — escribir por WhatsApp 💬
      </a>
      <p className="mt-3 text-sm text-stone-600">
        Si es sobre un reporte en particular, mándame el enlace de la página —
        así lo encuentro de una.
      </p>
    </section>
  );
}
