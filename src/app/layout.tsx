import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Nunito } from "next/font/google";
import Isotipo from "@/components/Isotipo";
import "./globals.css";

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--fuente-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Find Your Pet MZL — Mascotas perdidas y encontradas en Manizales",
  description:
    "Plataforma comunitaria para reportar mascotas perdidas y encontradas en Manizales después del sismo. Publica en un minuto y contacta por WhatsApp.",
  openGraph: {
    title: "Find Your Pet MZL",
    description:
      "Reporta mascotas perdidas o encontradas en Manizales. Rápido, gratis y sin registro.",
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
        <header className="sticky top-0 z-40 border-b border-stone-200/80 bg-crema/90 backdrop-blur">
          <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-4 py-3">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-marca text-crema">
                <Isotipo className="h-7 w-7" fondo="#0f6f6c" />
              </span>
              <span className="leading-tight">
                <span className="block text-base font-extrabold tracking-tight text-marca-oscuro sm:text-lg">
                  Find Your Pet MZL
                </span>
                <span className="block text-xs text-stone-500">Manizales, Caldas</span>
              </span>
            </Link>
            <Link
              href="/reportar"
              className="rounded-xl bg-marca px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-marca-oscuro"
            >
              Publicar reporte
            </Link>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="border-t border-stone-200 bg-white/60">
          <div className="mx-auto w-full max-w-5xl px-4 py-8 text-sm text-stone-500">
            <p className="flex items-center gap-2 font-semibold text-stone-700">
              <Isotipo className="h-5 w-5 text-marca" fondo="#faf6f0" />
              Find Your Pet MZL — iniciativa ciudadana sin ánimo de lucro.
            </p>
            <p className="mt-2 max-w-2xl">
              Hecha para ayudar a reunir a las familias de Manizales con sus mascotas.
              Verifica siempre la información antes de entregar un animal y prefiere
              encuentros en lugares públicos y acompañado.
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
          </div>
        </footer>
      </body>
    </html>
  );
}
