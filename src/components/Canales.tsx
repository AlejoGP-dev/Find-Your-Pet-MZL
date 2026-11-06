import Link from "next/link";
import { CANALES, type CanalesCiudad } from "@/lib/canales";

/**
 * Los estilos van en el contenedor y no en cada enlace o título: el home tiene
 * un límite de peso (GEO-002) y Next repite cada clase dos veces, en el HTML y en
 * los datos de React.
 */
const CONTENEDOR =
  "text-stone-700 [&_h3]:font-extrabold [&_h3]:text-stone-900 [&_a:not(.boton-primario)]:font-semibold [&_a:not(.boton-primario)]:text-marca [&_a:not(.boton-primario)]:underline";

/** Convierte los correos del texto en `mailto:`, para que se abran de un toque. */
function ConCorreo({ texto }: { texto: string }) {
  return (
    <>
      {texto.split(/([\w.+-]+@[\w-]+(?:\.[\w-]+)+)/g).map((t, i) =>
        i % 2 === 1 ? (
          <a key={i} href={`mailto:${t}`} className="break-words">
            {t}
          </a>
        ) : (
          t
        ),
      )}
    </>
  );
}

/** «Bogotá · Medellín»: salen de `canales.ts`, sin tocar quien los use. */
export function EnlacesCiudades() {
  return CANALES.map((c, i) => (
    <span key={c.slug}>
      {i > 0 && " · "}
      <Link href={`/${c.slug}#canales`}>
        {c.nombre}
      </Link>
    </span>
  ));
}

/** Va debajo de los botones del hero. */
export function RespuestaCanales({ canales }: { canales: CanalesCiudad }) {
  return (
    <p className={`mt-5 max-w-2xl rounded-xl bg-white/70 p-4 text-left text-sm ring-1 ring-stone-200/70 sm:text-base md:mx-auto ${CONTENEDOR}`}>
      <ConCorreo texto={canales.respuesta} />
    </p>
  );
}

/** El bloque completo de una ciudad. `#canales` es el destino de los enlaces. */
export function BloqueCanales({ canales }: { canales: CanalesCiudad }) {
  return (
    <section
      id="canales"
      className="mx-auto w-full max-w-5xl scroll-mt-20 px-4 pb-6"
    >
      <div className={`rounded-2xl border border-stone-200 bg-white p-6 ${CONTENEDOR}`}>
        <h2 className="text-xl font-extrabold text-stone-900">{canales.h2}</h2>
        <ol className="mt-4 grid gap-5">
          {canales.pasos.map((paso, i) => (
            <li key={paso.titulo}>
              <h3>
                {i + 1}. {paso.titulo}
              </h3>
              <p className="mt-1">
                <ConCorreo texto={paso.texto} />
              </p>
              {paso.lista && (
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  {paso.lista.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
              {paso.nota && (
                <p className="mt-2 text-sm text-stone-600">{paso.nota}</p>
              )}
              {paso.boton && (
                <Link href={paso.boton.href} className="boton-primario mt-3">
                  {paso.boton.texto}
                </Link>
              )}
            </li>
          ))}
        </ol>

        <h3 className="mt-6">
          {canales.encontraste.titulo}
        </h3>
        <p className="mt-1">
          {canales.encontraste.texto}{" "}
          <Link href={canales.encontraste.enlace.href}>
            {canales.encontraste.enlace.texto}
          </Link>
          .
        </p>

        <p className="mt-6 border-t border-stone-200 pt-4 text-sm text-stone-600">
          Find Your Pet es una iniciativa ciudadana, no una entidad oficial. Estos
          datos salen de las páginas de {canales.autoridad}:{" "}
          {canales.fuentes.map((f, i) => (
            <span key={f.url}>
              {i > 0 && " · "}
              <a href={f.url}>
                {f.texto}
              </a>
            </span>
          ))}
          . Revisados el {canales.revisado}. Si un dato ya no funciona, escríbenos a{" "}
          <ConCorreo texto="contacto@find-your-pet.co" />.
        </p>
      </div>
    </section>
  );
}

/** Va debajo del selector de ciudad del home. */
export function LineaCanales() {
  return (
    <p className={`mt-3 text-sm ${CONTENEDOR}`}>
      <strong className="font-bold text-stone-800">
        ¿Se te perdió o te encontraste una mascota?
      </strong>{" "}
      Publica el reporte acá y avisa también a los canales oficiales de tu ciudad:{" "}
      <EnlacesCiudades />.
    </p>
  );
}

/** El bloque nacional del home. No lista teléfonos: viven en cada ciudad. */
export function BloqueCanalesNacional() {
  return (
    <section className="mx-auto w-full max-w-5xl px-4 pb-6">
      <div className={`rounded-2xl border border-stone-200 bg-white p-6 ${CONTENEDOR}`}>
        <h2 className="text-xl font-extrabold text-stone-900">
          ¿Dónde reportar una mascota perdida en Colombia?
        </h2>
        <p className="mt-2">
          Publica el reporte acá: es gratis, sirve en todo el país, no pide registro y
          deja tu contacto directo por WhatsApp. Además, avisa a los canales de tu
          ciudad, porque cada alcaldía lo maneja distinto.
        </p>
        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          <div>
            <h3>Si se te perdió</h3>
            <ol className="mt-2 list-decimal space-y-1 pl-5">
              <li>
                <Link href="/reportar?tipo=perdida">
                  Publica el reporte
                </Link>
                . Te queda además un afiche listo para imprimir.
              </li>
              <li>
                Busca los canales de tu ciudad: <EnlacesCiudades />.
              </li>
              <li>
                Sigue la guía:{" "}
                <Link href="/consejos/perdida">
                  qué hacer si se te perdió
                </Link>{" "}
                ·{" "}
                <Link href="/consejos/buscar-de-noche">
                  si se perdió de noche
                </Link>
                .
              </li>
            </ol>
          </div>
          <div>
            <h3>Si te encontraste una</h3>
            <ol className="mt-2 list-decimal space-y-1 pl-5">
              <li>
                <Link href="/reportar?tipo=encontrada">
                  Publícala como encontrada
                </Link>
                .
              </li>
              <li>
                <Link href="/?tipo=perdida">
                  Mira las mascotas perdidas
                </Link>{" "}
                por si alguien ya la está buscando.
              </li>
              <li>
                Sigue la guía:{" "}
                <Link href="/consejos/encontrada">
                  qué hacer si te encontraste una
                </Link>
                .
              </li>
            </ol>
          </div>
        </div>
        <p className="mt-6 border-t border-stone-200 pt-4 text-sm text-stone-600">
          Find Your Pet es una iniciativa ciudadana, no una entidad oficial. No
          recibimos reportes en nombre de ninguna alcaldía: los canales de cada ciudad
          se usan aparte.
        </p>
      </div>
    </section>
  );
}
