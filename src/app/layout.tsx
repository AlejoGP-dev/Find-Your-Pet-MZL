import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Nunito } from "next/font/google";
import Analytics from "@/components/Analytics";
import AvisoLegal from "@/components/AvisoLegal";
import Isotipo from "@/components/Isotipo";
import MenuMovil from "@/components/MenuMovil";
import "./globals.css";

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--fuente-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Find Your Pet CO — Mascotas perdidas y encontradas en Colombia",
  description:
    "Plataforma comunitaria para reportar mascotas perdidas y encontradas en Colombia después del sismo del 10 de agosto. Publica en un minuto y contacta por WhatsApp.",
  openGraph: {
    title: "Find Your Pet CO",
    description:
      "Reporta mascotas perdidas o encontradas en Colombia. Rápido, gratis y sin registro.",
    locale: "es_CO",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0f6f6c",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-CO" className={nunito.variable}>
      <body className="flex min-h-dvh flex-col font-sans">
        <Analytics />
        <AvisoLegal />
        <header className="sticky top-0 z-40 border-b border-stone-200/80 bg-crema/90 backdrop-blur">
          <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-4 py-3">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-marca text-crema">
                <Isotipo className="h-7 w-7" fondo="#0f6f6c" />
              </span>
              <span className="leading-tight">
                <span className="block text-sm font-extrabold tracking-tight text-marca-oscuro min-[400px]:text-base sm:text-lg">
                  Find Your Pet CO
                </span>
                <span className="hidden text-xs text-stone-500 min-[400px]:block">
                  Mascotas perdidas en Colombia
                </span>
              </span>
            </Link>

            <nav className="flex shrink-0 items-center gap-1.5 sm:gap-2">
              {/* En escritorio los enlaces van sueltos; en móvil se recogen en
                  la hamburguesa. El botón de publicar nunca se esconde: es la
                  acción principal. */}
              <Link
                href="/consejos"
                className="hidden rounded-lg px-3 py-2 text-sm font-bold text-stone-600 transition hover:bg-stone-100 hover:text-marca-oscuro sm:inline-block"
              >
                <span aria-hidden="true">🔎</span> Consejos
              </Link>

              <Link
                href="/ayudar"
                className="hidden rounded-lg px-3 py-2 text-sm font-bold text-stone-600 transition hover:bg-stone-100 hover:text-marca-oscuro sm:inline-block"
              >
                <span aria-hidden="true">💚</span> Ayudar
              </Link>

              <Link
                href="/reportar"
                className="whitespace-nowrap rounded-xl bg-marca px-3.5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-marca-oscuro sm:px-4"
              >
                Publicar<span className="hidden sm:inline"> reporte</span>
              </Link>

              <MenuMovil />
            </nav>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="border-t border-stone-200 bg-white/60">
          <div className="mx-auto w-full max-w-5xl px-4 py-8 text-sm text-stone-500">
            <p className="flex items-center gap-2 font-semibold text-stone-700">
              <Isotipo className="h-5 w-5 text-marca" fondo="#faf6f0" />
              Find Your Pet CO — iniciativa ciudadana sin ánimo de lucro.
            </p>
            <p className="mt-2 max-w-2xl">
              Hecha para ayudar a reunir a las familias de Colombia con sus
              mascotas.
              Verifica siempre la información antes de entregar un animal y prefiere
              encuentros en lugares públicos y acompañado.
            </p>
            <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
              <Link
                href="/consejos/perdida"
                className="font-bold text-marca underline underline-offset-2"
              >
                🔎 Cómo buscar una mascota perdida
              </Link>
              <Link
                href="/consejos/encontrada"
                className="font-bold text-marca underline underline-offset-2"
              >
                🤲 Me encontré una mascota
              </Link>
            </p>
            <p className="mt-3">
              <Link
                href="/ayudar"
                className="font-bold text-marca underline underline-offset-2"
              >
                💚 Fundaciones y albergues que necesitan ayuda
              </Link>
            </p>
            <p className="mt-3">
              Emergencias con animales:{" "}
              <a className="font-semibold text-marca underline" href="tel:123">
                123
              </a>{" "}
              · Bomberos Manizales:{" "}
              <a className="font-semibold text-marca underline" href="tel:119">
                119
              </a>
            </p>

            <p className="mt-6 border-t border-stone-200 pt-5 text-center text-stone-500">
              Un granito de arena realizado por{" "}
              <a
                href="https://www.instagram.com/ialejog"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-marca underline underline-offset-2 hover:text-marca-oscuro"
              >
                Alejandro Grajales
              </a>
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
