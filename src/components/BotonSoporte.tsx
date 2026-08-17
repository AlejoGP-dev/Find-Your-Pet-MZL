import { enlaceSoporte } from "@/lib/legal";

/**
 * Botón flotante de soporte.
 *
 * En móvil es solo el círculo con el "?" para no taparle media pantalla a
 * nadie; desde sm se abre a pastilla con el texto completo. Va abajo a la
 * derecha, que es donde la gente ya lo busca.
 */
export default function BotonSoporte() {
  return (
    <a
      href={enlaceSoporte()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Reporta un problema por WhatsApp"
      className="group fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-full bg-marca p-3.5 text-white shadow-lg ring-1 ring-black/10 transition hover:bg-marca-oscuro hover:shadow-xl sm:px-5 sm:py-3.5"
    >
      <span
        aria-hidden="true"
        className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white/20 text-base font-extrabold leading-none"
      >
        ?
      </span>
      <span className="hidden whitespace-nowrap text-sm font-extrabold sm:inline">
        Reporta un problema
      </span>
    </a>
  );
}
