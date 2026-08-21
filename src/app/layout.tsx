import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Nunito } from "next/font/google";
import { Analytics as AnaliticaVercel } from "@vercel/analytics/next";
import Analytics from "@/components/Analytics";
import AvisoLegal from "@/components/AvisoLegal";
import BotonSoporte from "@/components/BotonSoporte";
import DatosEstructurados from "@/components/DatosEstructurados";
import Icono from "@/components/Icono";
import Isotipo from "@/components/Isotipo";
import MenuMovil from "@/components/MenuMovil";
import Vitals from "@/components/Vitals";
import { WHATSAPP_SOPORTE_VISIBLE, enlaceSoporte } from "@/lib/legal";
import { sitioWeb } from "@/lib/schema";
import { SITIO } from "@/lib/seo";
import "./globals.css";

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--fuente-sans",
  display: "swap",
});

export const metadata: Metadata = {
  // SEO-003: sin metadataBase, Next emite los canonical relativos y cada host
  // se autocanonicaliza. Con el dominio propio a la vuelta de la esquina, eso
  // significaría dos copias del sitio diciendo cada una "yo soy la buena".
  metadataBase: new URL(SITIO),
  title: "Find Your Pet CO — Mascotas perdidas y encontradas en Colombia",
  description:
    "Plataforma comunitaria para reportar mascotas perdidas y encontradas en Colombia después del sismo del 10 de agosto. Publica en un minuto y contacta por WhatsApp.",
  openGraph: {
    title: "Find Your Pet CO",
    description:
      "Reporta mascotas perdidas o encontradas en Colombia. Rápido, gratis y sin registro.",
    siteName: "Find Your Pet CO",
    url: "/",
    locale: "es_CO",
    type: "website",
  },
  // La foto de la mascota es el activo del sitio y casi todo se comparte por
  // WhatsApp: la tarjeta tiene que ser grande.
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#0f6f6c",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-CO" className={nunito.variable}>
      <head>
        {/* WPO-002: corre antes del primer pintado y esconde el aviso legal a
            quien ya lo cerró, sin que llegue a verse. Va inline y sin await a
            propósito: cualquier cosa asíncrona llegaría tarde y volveríamos a
            tener el salto de layout que este cambio elimina. El try/catch es
            obligatorio — en incógnito o con el almacenamiento bloqueado,
            localStorage lanza, y una excepción acá bloquearía el render. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{if(localStorage.getItem('fyp-aviso-legal-visto')==='1')document.documentElement.classList.add('aviso-visto')}catch(e){}",
          }}
        />
      </head>
      <body className="flex min-h-dvh flex-col font-sans">
        <Analytics />
        {/* Analítica de Vercel: visitas y páginas vistas, sin cookies y sin
            pedirle nada a la persona. Convive con Google Analytics a
            propósito — GA da el detalle (de dónde llega la gente, qué busca) y
            esta da el número limpio, sin que los bloqueadores se coman la
            mitad de los datos. Pesa ~1 KB y se carga aparte del render.

            Ojo: en el plan Hobby tiene un tope mensual de eventos. Si se pasa,
            deja de contar hasta el otro mes; no rompe nada del sitio. */}
        <AnaliticaVercel />
        <Vitals />
        {/* SEO-007: WebSite + SearchAction en todas las páginas. */}
        <DatosEstructurados datos={sitioWeb()} />
        <AvisoLegal />
        <header
          // WPO-020: backdrop-filter sobre un elemento fijo de ancho completo
          // obliga al compositor a re-muestrear esa franja en cada frame de
          // scroll. En móvil —Android de gama media, el usuario real de este
          // sitio— sale caro y casi no se nota, así que ahí va fondo opaco y
          // el blur queda solo de md en adelante.
          className="sticky top-0 z-40 border-b border-stone-200/80 bg-crema md:bg-crema/90 md:backdrop-blur"
        >
          <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-4 py-3">
            <Link href="/" className="flex items-center gap-2.5">
              {/* El isotipo va a 9/11 del cuadro: con menos, el corazón queda
                  nadando en verde y el lockup no se lee como el de la marca. */}
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-marca text-crema">
                <Isotipo className="h-9 w-9" />
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
                className="hidden rounded-lg px-3 py-2 text-sm font-bold text-stone-600 transition hover:bg-stone-100 hover:text-marca-oscuro lg:inline-block"
              >
                Consejos <Icono nombre="buscar" className="h-[1em] w-[1em]" />
              </Link>

              <Link
                href="/ayudar"
                className="hidden rounded-lg px-3 py-2 text-sm font-bold text-stone-600 transition hover:bg-stone-100 hover:text-marca-oscuro lg:inline-block"
              >
                Ayudar <Icono nombre="corazon" className="h-[1em] w-[1em]" />
              </Link>

              {/* Dos CTA: adopción va en secundario para no restarle fuerza a
                  publicar, que sigue siendo la acción principal del sitio. */}
              <Link
                href="/adopcion"
                className="hidden whitespace-nowrap rounded-xl border-2 border-marca px-3.5 py-2 text-sm font-bold text-marca transition hover:bg-marca-suave sm:inline-block sm:px-4"
              >
                Adopción
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
          {/* pb extra: el botón flotante no puede taparle el último renglón. */}
          <div className="mx-auto w-full max-w-5xl px-4 pb-24 pt-8 text-sm text-stone-500 md:text-center">
            <p className="flex items-center gap-2 font-semibold text-stone-700 md:justify-center">
              <Isotipo className="h-5 w-5 text-marca" />
              Find Your Pet CO — iniciativa ciudadana sin ánimo de lucro.
            </p>
            <p className="mt-2 max-w-2xl md:mx-auto">
              Hecha para ayudar a reunir a las familias de Colombia con sus
              mascotas.
              Verifica siempre la información antes de entregar un animal y prefiere
              encuentros en lugares públicos y acompañado.
            </p>
            <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 md:justify-center">
              <Link
                href="/consejos/perdida"
                className="font-bold text-marca underline underline-offset-2"
              >
                Cómo buscar una mascota perdida{" "}
                <Icono nombre="buscar" className="h-[1em] w-[1em]" />
              </Link>
              <Link
                href="/consejos/encontrada"
                className="font-bold text-marca underline underline-offset-2"
              >
                Me encontré una mascota{" "}
                <Icono nombre="mano" className="h-[1em] w-[1em]" />
              </Link>
            </p>
            <p className="mt-3">
              <Link
                href="/ayudar"
                className="font-bold text-marca underline underline-offset-2"
              >
                Fundaciones y albergues que necesitan ayuda{" "}
                <Icono nombre="corazon" className="h-[1em] w-[1em]" />
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

            {/* Legales y soporte: separados del resto para que se encuentren
                rápido, que es justo cuando alguien los busca. */}
            <p className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-stone-200 pt-5 md:justify-center">
              <Link
                href="/terminos"
                className="font-semibold text-stone-600 underline underline-offset-2 hover:text-marca"
              >
                Términos y condiciones
              </Link>
              <Link
                href="/datos"
                className="font-semibold text-stone-600 underline underline-offset-2 hover:text-marca"
              >
                Tratamiento de datos
              </Link>
              <a
                href={enlaceSoporte()}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-marca underline underline-offset-2 hover:text-marca-oscuro"
              >
                Reportar un problema{" "}
                <Icono nombre="chat" className="h-[1em] w-[1em]" />
              </a>
            </p>
            <p className="mt-1.5">
              WhatsApp de soporte:{" "}
              <a
                href={enlaceSoporte()}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-marca underline underline-offset-2"
              >
                {WHATSAPP_SOPORTE_VISIBLE}
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

        <BotonSoporte />
      </body>
    </html>
  );
}
