import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import DatosEstructurados from "@/components/DatosEstructurados";
import Icono from "@/components/Icono";
import Migas, { type Miga } from "@/components/Migas";
import TextoRico from "@/components/TextoRico";
import { CON_PAGINA, organizacionPorSlug } from "@/lib/organizaciones";
import * as schema from "@/lib/schema";
import { SITIO, ogPagina } from "@/lib/seo";

/**
 * FEATURE-007 — Página propia de una fundación.
 *
 * **La plantilla no conoce a ninguna fundación.** Todo el contenido sale del
 * campo `pagina` de `organizaciones.ts`, y la segunda entra añadiendo un
 * objeto ahí. Era un requisito explícito de la spec: si la primera es un caso
 * único, la segunda obliga a reescribir.
 *
 * Lo que esta página NO tiene, y es deliberado:
 *
 * - **Ningún mecanismo de donación.** Ni botón, ni cuenta, ni intermediario.
 *   El único camino hacia la fundación son sus propias redes. Cobrar plata de
 *   terceros convertiría a Find Your Pet en intermediario de pagos ajenos, y
 *   choca de frente con `D-26`.
 * - **Ningún dato que la fundación no haya dado.** No hay cifra de animales ni
 *   año de fundación porque no los tenemos confirmados.
 * - **Ningún banner nuestro en la mitad.** La página es de ellos; el puente
 *   hacia Find Your Pet es una línea al final. Un banner convertiría su
 *   historia en publicidad nuestra.
 */

export function generateStaticParams() {
  return CON_PAGINA.map((o) => ({ slug: o.pagina.slug }));
}

type Ruta = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Ruta }): Promise<Metadata> {
  const { slug } = await params;
  const org = organizacionPorSlug(slug);
  if (!org) return {};

  const ruta = `/fundaciones/${org.pagina.slug}`;
  return {
    title: `${org.pagina.titulo} — Find Your Pet CO`,
    description: org.pagina.descripcion,
    alternates: { canonical: ruta },
    openGraph: ogPagina({
      ruta,
      titulo: org.pagina.titulo,
      descripcion: org.pagina.descripcion,
    }),
  };
}

/**
 * La onda que separa las franjas de color. Decorativa: fuera del árbol de a11y.
 *
 * El SVG se dibuja 60 px más ancho que su caja y desplazado 30 px a la
 * izquierda. Es lo que permite que derive de lado a lado sin que asome el
 * borde por ningún extremo: la animación mueve ±14 px y sobran 16 a cada lado.
 */
function Onda({
  arriba = false,
  color,
  lenta = false,
}: {
  arriba?: boolean;
  color: string;
  lenta?: boolean;
}) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute left-0 right-0 z-[2] overflow-hidden leading-[0] ${
        arriba ? "top-[-1px]" : "bottom-[-1px]"
      }`}
    >
      <svg
        viewBox="0 0 1440 90"
        preserveAspectRatio="none"
        className={`-ml-[30px] block h-[46px] w-[calc(100%+60px)] sm:h-[70px] ${
          arriba ? "" : "rotate-180"
        } ${lenta ? "onda-deriva-lenta" : "onda-deriva"}`}
      >
        <path
          fill={color}
          d="M0,64 C240,8 480,8 720,40 C960,72 1200,72 1440,32 L1440,0 L0,0 Z"
        />
      </svg>
    </div>
  );
}

export default async function PaginaFundacion({ params }: { params: Ruta }) {
  const { slug } = await params;
  const org = organizacionPorSlug(slug);
  if (!org) notFound();

  const p = org.pagina;
  const ruta = `/fundaciones/${p.slug}`;
  const migas: Miga[] = [
    { etiqueta: "Inicio", href: "/" },
    { etiqueta: "Ayudar", href: "/ayudar" },
    { etiqueta: org.nombre },
  ];

  return (
    <>
      {/* La Organization que se describe es LA FUNDACIÓN, no Find Your Pet.
          Confundirlas le diría a Google que este dominio es un refugio, que es
          exactamente lo que `D-26` prohíbe. El `sameAs` son sus perfiles. */}
      <DatosEstructurados
        datos={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: org.nombre,
          description: p.descripcion,
          url: `${SITIO}${ruta}`,
          logo: p.logo ? `${SITIO}${p.logo}` : undefined,
          image: `${SITIO}${p.fotos.portada}`,
          areaServed: org.ciudad,
          sameAs: org.enlaces.map((e) => e.url),
        }}
      />
      <DatosEstructurados datos={schema.migas(migas)} />

      {/* ===== Portada ===== */}
      <header className="relative overflow-hidden bg-marca-suave pb-24 pt-6 sm:pb-32">
        <div className="mx-auto w-full max-w-5xl px-4">
          <Migas items={migas} />

          {/* El logo de la fundación, solo. Antes iba con un «Find Your Pet
              junto a» y una raya divisoria; se quitaron porque la cabecera del
              sitio ya dice de quién es el dominio, y repetirlo acá le robaba
              protagonismo a la marca que esta página viene a visibilizar.
              El origen mide 240 px de alto, así que a 96 px sigue nítido en
              pantallas de doble densidad. */}
          {p.logo && (
            <Image
              src={p.logo}
              alt={`Logo de ${org.nombre}`}
              width={255}
              height={240}
              priority
              className="mt-4 h-20 w-auto sm:h-24"
            />
          )}

          {/* La columna del texto va un poco más ancha que la de la foto: con
              las dos iguales, el titular partía «Los que nadie / adopta».

              `items-start` y no `items-center`: la foto es mucho más alta que
              el texto, así que al centrar verticalmente el bloque de texto se
              hundía y quedaba un vacío enorme entre el logo y la píldora del
              nombre. Alineados arriba, la píldora arranca justo debajo del
              logo, que es como tiene que leerse. */}
          <div className="mt-4 grid items-start gap-8 md:grid-cols-[1.08fr_0.92fr] md:gap-12">
            <div>
              <p className="inline-block rounded-full bg-white px-4 py-2 text-xs font-extrabold uppercase tracking-[0.13em] text-marca shadow-sm">
                {p.antetitulo}
              </p>
              <h1 className="mt-5 text-4xl font-extrabold leading-[1.05] tracking-tight text-marca-oscuro sm:text-5xl lg:text-6xl">
                {p.h1[0]}
                <span className="block text-marca">{p.h1[1]}</span>
              </h1>
              {p.entrada.map((linea, i) => (
                <p key={i} className="mt-4 max-w-md text-lg leading-relaxed text-stone-700">
                  <TextoRico texto={linea} />
                </p>
              ))}
            </div>

            {/* La foto en forma orgánica, con dos recortes flotando. El
                `border-radius` de cuatro valores no tiene utilidad en Tailwind,
                así que va en línea: son doce caracteres, no una hoja aparte. */}
            {/* En móvil se acota el ancho: la foto es vertical (335×597) y a
                todo lo ancho ocupaba media pantalla ella sola, empujando el
                resto de la página abajo. No se recorta — la mujer sale en la
                parte de arriba y un `object-cover` le cortaría la cabeza. */}
            <div className="relative mx-auto w-full max-w-[288px] sm:max-w-[340px] md:max-w-none">
              {/* `flota-foto` mueve la forma y el borde en bucle. El
                  `border-radius` de partida se queda en línea porque es el que
                  se ve si alguien pidió menos movimiento: la animación está
                  dentro de `prefers-reduced-motion`, y sin ella este valor es
                  el único que manda. Ver globals.css. */}
              <div
                className="flota-foto overflow-hidden border-[7px] border-white shadow-[0_22px_50px_rgba(10,79,77,0.24)]"
                style={{ borderRadius: "58% 42% 46% 54% / 48% 44% 56% 52%" }}
              >
                <Image
                  src={p.fotos.portada}
                  alt={p.fotos.portadaAlt}
                  width={335}
                  height={597}
                  priority
                  sizes="(max-width: 768px) 90vw, 420px"
                  className="block h-auto w-full"
                />
              </div>

              {p.fotos.recortes.map((foto, i) => (
                <span
                  key={foto}
                  aria-hidden="true"
                  className={`absolute z-10 hidden overflow-hidden rounded-full border-4 border-white shadow-[0_10px_24px_rgba(10,79,77,0.2)] lg:block ${
                    [
                      "left-[-30px] top-[14%] h-20 w-20 flota-1",
                      "right-[-24px] top-[6%] h-[68px] w-[68px] flota-2",
                      "bottom-[16%] left-[-14px] h-16 w-16 flota-3",
                    ][i]
                  }`}
                >
                  <Image
                    src={foto}
                    alt=""
                    width={200}
                    height={200}
                    className="h-full w-full object-cover"
                  />
                </span>
              ))}
            </div>
          </div>
        </div>

        <Onda color="var(--color-crema)" />
      </header>

      {/* ===== Tira de datos ===== */}
      <div className="relative z-[5] mx-auto -mt-10 w-full max-w-5xl px-4 sm:-mt-14">
        <div className="grid gap-4 sm:grid-cols-3">
          {p.datos.map((d) => (
            <div
              key={d.valor}
              className="rounded-3xl bg-white p-6 text-center shadow-[0_10px_30px_rgba(10,79,77,0.10)]"
            >
              <p className="text-2xl font-extrabold leading-tight text-marca">{d.valor}</p>
              <p className="mt-1.5 text-sm font-semibold text-stone-600">{d.texto}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ===== Primera sección de texto ===== */}
      {p.secciones[0] && (
        <section className="mx-auto w-full max-w-3xl px-4 py-14 sm:py-20">
          <h2 className="text-3xl font-extrabold leading-tight tracking-tight text-marca-oscuro sm:text-4xl">
            {p.secciones[0].titulo}
          </h2>
          {p.secciones[0].parrafos.map((t, i) => (
            <p key={i} className="mt-4 text-lg leading-relaxed text-stone-700">
              <TextoRico texto={t} />
            </p>
          ))}
        </section>
      )}

      {/* ===== El testimonio =====
          Es lo mejor que tiene la página. Va a pantalla completa, en el color
          de marca, y sin reescribir: solo se le añadió puntuación y párrafos. */}
      <section className="relative overflow-hidden bg-marca py-20 sm:py-28">
        <Onda arriba lenta color="var(--color-crema)" />
        <span
          aria-hidden="true"
          /* `text-white` a secas y la opacidad en una clase aparte: con
             `text-white/10` el alfa del color se multiplicaba por el de la
             animación y la comilla quedaba al 1 % — estaba ahí, pero no se
             veía. La clase `opacity-20` es la que manda si alguien pidió menos
             movimiento; con movimiento, la animación va de 0,22 a 0,34.
             `top-16` la baja por debajo de la onda, que antes la recortaba. */
          className="respira pointer-events-none absolute left-[4%] top-16 origin-center select-none font-serif text-[190px] leading-none text-white opacity-20 sm:top-20 sm:text-[280px]"
        >
          &ldquo;
        </span>
        {/* Mismo ancho y mismo borde izquierdo que las secciones de texto: con
            el contenedor ancho, la cita empezaba más a la izquierda que todo
            lo demás y la página se veía descuadrada al bajar. */}
        <div className="relative z-[2] mx-auto w-full max-w-3xl px-4">
          <blockquote>
            {p.testimonio.parrafos.map((t, i) => (
              <p
                key={i}
                className="mb-5 text-xl leading-relaxed text-marca-suave sm:text-2xl"
              >
                <TextoRico texto={t} fuerte="text-white" />
              </p>
            ))}
            <footer className="mt-7 text-sm font-extrabold text-white/75">
              — {p.testimonio.firma}
            </footer>
          </blockquote>
        </div>
        <Onda color="var(--color-crema)" />
      </section>

      {/* ===== Resto de secciones ===== */}
      {p.secciones.slice(1).map((s) => (
        <section key={s.titulo} className="mx-auto w-full max-w-3xl px-4 py-14 sm:py-20">
          <h2 className="text-3xl font-extrabold leading-tight tracking-tight text-marca-oscuro sm:text-4xl">
            {s.titulo}
          </h2>
          {s.parrafos.map((t, i) => (
            <p key={i} className="mt-4 text-lg leading-relaxed text-stone-700">
              <TextoRico texto={t} />
            </p>
          ))}
        </section>
      ))}

      {/* ===== Cómo apoyarlos ===== */}
      <section className="relative overflow-hidden bg-marca-suave pb-16 pt-20 sm:pb-20 sm:pt-24">
        <Onda arriba color="var(--color-crema)" />
        <div className="relative z-[2] mx-auto w-full max-w-3xl px-4">
          <h2 className="text-3xl font-extrabold leading-tight tracking-tight text-marca-oscuro sm:text-4xl">
            {p.apoyo.titulo}
          </h2>

          <div className="mt-8 grid gap-5 sm:grid-cols-3">
            {p.apoyo.bloques.map((b, i) => (
              <article
                key={b.titulo}
                className="rounded-3xl bg-marca p-7 text-white shadow-[0_14px_32px_rgba(15,111,108,0.22)] transition-transform duration-300 hover:-translate-y-1"
              >
                <span
                  className={`grid h-12 w-12 place-items-center rounded-2xl bg-white/20 ${
                    ["flota-icono-1", "flota-icono-2", "flota-icono-3"][i] ?? ""
                  }`}
                >
                  <Icono nombre={b.icono} className="h-6 w-6" bloque />
                </span>
                <h3 className="mt-4 text-xl font-extrabold">{b.titulo}</h3>
                <p className="mt-1.5 leading-relaxed text-marca-suave">{b.texto}</p>
              </article>
            ))}
          </div>

          <p className="mt-8 text-lg text-stone-700">{p.apoyo.pie}</p>

          <div className="mt-5 flex flex-wrap gap-3">
            {org.enlaces.map((e) => (
              <a
                key={e.url}
                href={e.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 rounded-full bg-white px-6 py-4 text-base font-extrabold text-marca-oscuro shadow-[0_8px_22px_rgba(10,79,77,0.12)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(10,79,77,0.22)]"
              >
                <Icono nombre={e.icono === "facebook" ? "facebook" : "instagram"} />
                {e.etiqueta}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ===== La aclaración. No es letra pequeña: es la línea que separa a
              Find Your Pet de ser un recaudador (D-26). ===== */}
      <section className="mx-auto w-full max-w-3xl px-4 py-14">
        <div className="rounded-3xl bg-white p-8 shadow-[0_14px_40px_rgba(10,79,77,0.10)] sm:p-11">
          <span className="late grid h-14 w-14 place-items-center rounded-full bg-marca-suave text-marca">
            <Icono nombre="escudo" className="h-7 w-7" bloque />
          </span>
          <h2 className="mt-4 text-2xl font-extrabold text-marca-oscuro">
            Una aclaración, porque importa
          </h2>
          <p className="mt-3 text-lg leading-relaxed text-stone-700">
            <strong className="font-extrabold text-marca-oscuro">
              Find Your Pet no recibe donaciones ni intermedia ningún aporte.
            </strong>{" "}
            Esta página existe solo para que conozcas su trabajo. Todo lo que
            quieras aportar va directo a ellos, por sus propios canales.
          </p>
          <p className="mt-3 text-lg leading-relaxed text-stone-700">
            No somos una fundación ni un refugio: somos una plataforma gratuita
            para buscar mascotas perdidas, y esta es una forma de poner nuestra
            visibilidad al servicio de quienes hacen el trabajo difícil.
          </p>
        </div>
      </section>

      {/* ===== Cierre ===== */}
      <section className="px-4 pb-20 text-center">
        <h2 className="text-3xl font-extrabold tracking-tight text-marca-oscuro">
          Compártelo
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-lg text-stone-600">
          Si conoces a alguien que quiera ayudar —o que simplemente sepa que
          estos hogares existen—, pásale esta página.
        </p>
        <p className="mt-7">
          <Link
            href="/ayudar"
            className="inline-flex items-center gap-3 rounded-full bg-marca px-8 py-4 text-base font-extrabold text-crema shadow-[0_14px_30px_rgba(15,111,108,0.28)] transition hover:bg-marca-oscuro"
          >
            Ver otras fundaciones
            <Icono nombre="corazon" />
          </Link>
        </p>
        <p className="mt-6 text-stone-600">
          ¿Se te perdió tu mascota?{" "}
          <Link href="/" className="font-bold text-marca underline">
            Publícala gratis en Find Your Pet
          </Link>
          .
        </p>
      </section>
    </>
  );
}
