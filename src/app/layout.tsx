import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Nunito } from "next/font/google";
import { Analytics as AnaliticaVercel } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Analytics, { ShimGtag } from "@/components/Analytics";
import PixelMeta from "@/components/PixelMeta";
import AvisoLegal from "@/components/AvisoLegal";
import BotonSoporte from "@/components/BotonSoporte";
import DatosEstructurados from "@/components/DatosEstructurados";
import Icono from "@/components/Icono";
import Isotipo from "@/components/Isotipo";
import MenuMovil from "@/components/MenuMovil";
import Vitals from "@/components/Vitals";
import { CORREO_PUBLICO, WHATSAPP_SOPORTE_VISIBLE, enlaceSoporte } from "@/lib/legal";
import { REDES } from "@/lib/redes";
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
        {/* AN-004: el arranque de gtag —shim + js + config—, ~120 bytes en
            línea y sin una sola petición de red. Tiene que correr ANTES de
            que nadie llame a gtag() Y ANTES de que se encole ningún evento:
            gtag.js procesa dataLayer en orden y descarta los eventos que ve
            antes del config. Con el config abajo, TTFB y FCP se perdían.
            `gtag/js`, que es el que pesa 170 KB, sigue en lazyOnload dentro
            de <Analytics />, así que WPO-001 no se toca. Ver el comentario
            largo en Analytics.tsx. */}
        <ShimGtag />
      </head>
      <body className="flex min-h-dvh flex-col font-sans">
        <Analytics />
        {/* SOC-906-A: píxel de Meta, solo PageView, con la misma regla de
            carga que GA4 (lazyOnload). Hoy no hace nada — espera a que exista
            NEXT_PUBLIC_META_PIXEL_ID en Vercel. Ver PixelMeta.tsx. */}
        <PixelMeta />
        {/* Analítica de Vercel: visitas y páginas vistas, sin cookies y sin
            pedirle nada a la persona. Convive con Google Analytics a
            propósito — GA da el detalle (de dónde llega la gente, qué busca) y
            esta da el número limpio, sin que los bloqueadores se coman la
            mitad de los datos. Pesa ~1 KB y se carga aparte del render.

            Ojo: en el plan Hobby tiene un tope mensual de eventos. Si se pasa,
            deja de contar hasta el otro mes; no rompe nada del sitio. */}
        <AnaliticaVercel />
        {/* Core Web Vitals medidos en los equipos reales de la gente, con el
            detalle por ruta. Se queda junto a <Vitals />, que manda las mismas
            métricas a Google Analytics: esa es la que sirve para cruzarlas con
            el comportamiento (si la ficha lenta es la que abandonan), y esta
            es la que dice qué ruta arreglar. Ninguna reemplaza a la otra.

            Se carga después de que la página es interactiva, así que no le
            quita tiempo al primer pintado. */}
        <SpeedInsights />
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

              {/* GSC-002 — Las redes van ANTES de los dos CTA, no entre ellos:
                  «Adopción» y «Publicar reporte» son la pareja de acciones y
                  tienen que leerse juntas. Metidas en medio partían el par y el
                  header se veía desordenado.

                  Solo de xl para arriba: por debajo el header ya va apretado
                  (logo + dos enlaces + dos CTA) y tres iconos más empujarían el
                  botón de publicar, que es la acción principal. En móvil y
                  tablet viven en la hamburguesa y en el footer. */}
              <span className="mr-1 hidden items-center gap-0.5 border-r border-stone-200 pr-2 xl:flex">
                {REDES.map((red) => (
                  <a
                    key={red.nombre}
                    href={red.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Find Your Pet CO en ${red.nombre}`}
                    title={red.nombre}
                    className="grid h-9 w-9 place-items-center rounded-lg text-stone-500 transition hover:bg-stone-100 hover:text-marca-oscuro"
                  >
                    <Icono nombre={red.icono} className="h-[18px] w-[18px]" bloque />
                  </a>
                ))}
              </span>

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
            {/* Antes acá salía «Bomberos Manizales: 119» junto a la 123. Con el
                sitio ya abierto a todo el país eso dejó de servir: la 119 es de
                bomberos en algunas ciudades y en otras no marca nada, así que
                publicarla a nivel nacional era mandar a alguien a un número
                muerto en plena emergencia.
                La 123 sí es la línea única nacional y desde ella se activan
                bomberos, policía y ambulancia — con una basta, y se puede
                decir en todo el país sin mentir. */}
            <p className="mt-3">
              Emergencia con un animal, en cualquier parte de Colombia:{" "}
              <a className="font-semibold text-marca underline" href="tel:123">
                Línea nacional 123
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
            {/* MAIL-006 — Hasta acá el único canal visible era WhatsApp. Una
                fundación que quiere entrar a /ayudar, un periodista o quien
                simplemente prefiere dejar constancia por escrito no tenía a
                dónde escribir. Va junto al WhatsApp y no en un bloque aparte:
                son la misma cosa —cómo contactarnos— y separarlos obligaría a
                buscar dos veces. */}
            <p className="mt-1.5">
              Correo:{" "}
              <a
                href={`mailto:${CORREO_PUBLICO}`}
                className="font-semibold text-marca underline underline-offset-2"
              >
                {CORREO_PUBLICO}
              </a>
            </p>

            {/* GSC-002 — Los perfiles oficiales de la marca. Salen de
                lib/redes.ts, que es la única fuente: agregar una red es tocar
                ese archivo y nada más. */}
            <div className="mt-6 border-t border-stone-200 pt-5">
              <p className="text-center text-sm font-bold text-stone-600">
                Síguenos
              </p>
              <ul className="mt-3 flex items-center justify-center gap-3">
                {REDES.map((red) => (
                  <li key={red.nombre}>
                    <a
                      href={red.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      // El nombre va en aria-label y no visible: son tres
                      // iconos y el texto los volvería una fila apretada. Un
                      // enlace con solo un icono sin nombre accesible es
                      // invisible para un lector de pantalla.
                      aria-label={`Find Your Pet CO en ${red.nombre}`}
                      title={red.nombre}
                      className="grid h-11 w-11 place-items-center rounded-xl border border-stone-200 bg-white text-marca transition hover:border-marca/40 hover:bg-marca-suave hover:text-marca-oscuro"
                    >
                      <Icono nombre={red.icono} className="h-5 w-5" bloque />
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* El crédito se queda como texto. Antes enlazaba al Instagram
                personal de Alejo, que era el único enlace social del sitio; ese
                lugar ahora es de las redes de la marca. El JSON-LD sí conserva
                el perfil personal en su nodo Person — ahí sí corresponde. */}
            <p className="mt-6 text-center text-stone-500">
              Un granito de arena realizado por{" "}
              <span className="font-bold text-stone-600">Alejandro Grajales</span>
            </p>
          </div>
        </footer>

        <BotonSoporte />
      </body>
    </html>
  );
}
