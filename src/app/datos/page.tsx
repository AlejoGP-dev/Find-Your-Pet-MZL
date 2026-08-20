import type { Metadata } from "next";
import { ogPagina } from "@/lib/seo";
import Link from "next/link";
import { Lista, PaginaLegal, Punto } from "@/components/BloqueLegal";
import Icono from "@/components/Icono";
import { RESPONSABLE, WHATSAPP_SOPORTE_VISIBLE, enlaceSoporte } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Tratamiento de datos personales — Find Your Pet CO",
  description:
    "Qué datos recogemos en Find Your Pet CO, para qué los usamos y cómo pedir que los corrijamos o los borremos. Ley 1581 de 2012.",
  alternates: { canonical: "/datos" },
  openGraph: ogPagina({
    ruta: "/datos",
    titulo: "Tratamiento de datos personales",
    descripcion:
      "Qué datos recogemos en Find Your Pet CO, para qué los usamos y cómo pedir que los corrijamos o los borremos. Ley 1581 de 2012.",
  }),
};

export default function PaginaDatos() {
  return (
    <PaginaLegal
      titulo="Tratamiento de datos personales"
      bajada="Qué datos tuyos guardamos, para qué, y cómo pedir que los borremos. Escrito según la Ley 1581 de 2012, que es la ley de datos personales en Colombia."
    >
      <section className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-5">
        <h2 className="text-lg font-extrabold text-amber-950">
          Lo más importante, de una{" "}
          <Icono nombre="alerta" className="h-[1em] w-[1em]" />
        </h2>
        <p className="mt-2 text-amber-950">
          <strong className="font-bold">
            El nombre y el número de WhatsApp que pones en un reporte quedan
            visibles para cualquiera
          </strong>{" "}
          que entre a la página, sin necesidad de registrarse. Eso no es un
          descuido: es justo lo que permite que alguien que vio a tu mascota te
          escriba de inmediato. Publica solo el número al que quieres que te
          escriban.
        </p>
      </section>

      <Punto n={1} titulo="Quién responde por tus datos">
        <p>
          <strong>{RESPONSABLE}</strong>, persona natural, domiciliado en
          Manizales, Caldas, Colombia. Es quien creó y administra{" "}
          <strong>Find Your Pet CO</strong> y quien responde como responsable del
          tratamiento de tus datos.
        </p>
        <p>
          No hay empresa ni NIT detrás: es un proyecto personal, gratuito y sin
          ánimo de lucro, hecho para ayudar después del sismo. La página la
          atiende una sola persona.
        </p>
        <p>
          Canal de contacto para todo lo relacionado con datos personales
          —consultas, correcciones, borrados y reclamos—: WhatsApp{" "}
          <a href={enlaceSoporte()} target="_blank" rel="noopener noreferrer">
            {WHATSAPP_SOPORTE_VISIBLE}
          </a>
          . Ese mismo canal es el que atiende las peticiones de las que habla el
          punto 6.
        </p>
      </Punto>

      <Punto n={2} titulo="Qué datos recogemos">
        <p>Cuando publicas un reporte o una adopción, guardamos:</p>
        <Lista>
          <li>
            <strong>El nombre con el que quieres que te contacten.</strong> No
            pedimos apellidos ni cédula. Si prefieres poner solo tu primer
            nombre o un apodo, hazlo.
          </li>
          <li>
            <strong>Tu número de WhatsApp.</strong>
          </li>
          <li>
            <strong>La ubicación aproximada:</strong> ciudad, barrio o zona y un
            punto de referencia. Nunca te pedimos tu dirección exacta y te
            recomendamos no ponerla.
          </li>
          <li>
            <strong>Un punto en el mapa, solo si tú lo compartes.</strong> Al
            publicar puedes tocar «Usar mi ubicación». Es opcional: si no lo
            haces, usamos el centro de tu ciudad y el reporte funciona igual.
            Cuando sí lo compartes, guardamos la coordenada{" "}
            <strong>redondeada a unos 100 metros</strong>, nunca el punto
            exacto. Sirve para que tu reporte le salga de primero a los vecinos
            que estén cerca.
          </li>
          <li>
            <strong>La foto y la descripción</strong> de la mascota.
          </li>
          <li>
            <strong>Un código de gestión</strong> que se genera solo y que te
            sirve para marcar el reporte como resuelto o pedir que lo borren.
          </li>
        </Lista>
        <p>
          Si solo entras a mirar, no recogemos nada tuyo salvo las estadísticas
          anónimas del punto 7.
        </p>
        <p>
          <strong>Si usas «ver las que están cerca de mí»</strong>, tu ubicación{" "}
          <strong>no sale de tu dispositivo</strong>. No la enviamos a ningún
          servidor, no la guardamos y no queda en la dirección de la página. Lo
          que hace tu navegador es bajar los puntos de los reportes —que ya son
          públicos— y calcular las distancias ahí mismo. Nosotros ni siquiera
          nos enteramos de que la usaste.
        </p>
      </Punto>

      <Punto n={3} titulo="Para qué los usamos">
        <Lista>
          <li>Publicar tu reporte para que la comunidad lo vea y lo comparta.</li>
          <li>
            Que quien encuentre a tu mascota pueda escribirte directamente por
            WhatsApp.
          </li>
          <li>
            Cruzar automáticamente reportes de perdidas con reportes de
            encontradas que se parezcan, y avisarte de posibles coincidencias.
          </li>
          <li>Contar cuántos reportes hay y cuántos se resolvieron.</li>
          <li>Detectar y borrar publicaciones falsas, repetidas o vacías.</li>
        </Lista>
        <p>
          <strong>
            No vendemos, no alquilamos ni compartimos tus datos con terceros
          </strong>{" "}
          para publicidad ni para nada más. No te vamos a mandar promociones ni
          correos.
        </p>
      </Punto>

      <Punto n={4} titulo="Dónde se guardan">
        <p>
          Los reportes y las fotos se guardan en servidores de Supabase y la
          página se sirve desde Vercel — dos proveedores de infraestructura que
          almacenan la información por nosotros y que están fuera de Colombia.
          Al publicar, autorizas esa transferencia, que es indispensable para que
          la página funcione.
        </p>
      </Punto>

      <Punto n={5} titulo="Tus derechos">
        <p>
          La ley colombiana te da estos derechos sobre tus datos, y acá los
          puedes ejercer gratis y sin trámites raros:
        </p>
        <Lista>
          <li>Saber qué datos tuyos tenemos y cómo los estamos usando.</li>
          <li>Actualizarlos o corregirlos si están mal o incompletos.</li>
          <li>Pedir prueba de que autorizaste el tratamiento.</li>
          <li>
            <strong>Revocar la autorización y pedir que los borremos.</strong>
          </li>
          <li>
            Presentar quejas ante la Superintendencia de Industria y Comercio
            (SIC) si crees que incumplimos.
          </li>
        </Lista>
      </Punto>

      <Punto n={6} titulo="Cómo pedir que corrijamos o borremos algo">
        <p>
          <strong>La forma más rápida:</strong> si tienes tu código de gestión,
          entra a tu reporte y bórralo o márcalo como resuelto tú mismo, en el
          momento. No tienes que pedirle permiso a nadie.
        </p>
        <p>
          <strong>Si perdiste el código</strong> o alguien publicó datos tuyos
          sin permiso, escríbenos al WhatsApp{" "}
          <a href={enlaceSoporte()} target="_blank" rel="noopener noreferrer">
            {WHATSAPP_SOPORTE_VISIBLE}
          </a>{" "}
          con el enlace del reporte. Los plazos que manda la ley y que nos
          comprometemos a cumplir:
        </p>
        <Lista>
          <li>
            <strong>Consultas</strong> (saber qué tenemos tuyo): respondemos en
            máximo <strong>10 días hábiles</strong>. Si no alcanzamos, te
            avisamos y tomamos hasta 5 días hábiles más.
          </li>
          <li>
            <strong>Reclamos</strong> (corregir, borrar, revocar): te confirmamos
            que lo recibimos en 2 días hábiles y lo resolvemos en máximo{" "}
            <strong>15 días hábiles</strong>, prorrogables 8 días hábiles más si
            hace falta.
          </li>
        </Lista>
        <p>
          En la práctica lo hacemos el mismo día casi siempre. Ten en cuenta que
          si tu reporte ya se compartió en redes sociales, esas copias no las
          controlamos nosotros.
        </p>
      </Punto>

      <Punto n={7} titulo="Estadísticas de la página">
        <p>
          Usamos Google Analytics para saber cuánta gente entra, desde qué
          ciudades y qué páginas ven. Eso nos dice, por ejemplo, en qué ciudad
          conviene difundir más. Son datos agregados y anónimos: no sabemos quién
          eres ni los cruzamos con tu reporte.
        </p>
        <p>
          Si no quieres ni eso, puedes bloquearlo desde tu navegador o con
          cualquier extensión de bloqueo — la página funciona igual de bien.
        </p>
      </Punto>

      <Punto n={8} titulo="Cuánto tiempo los guardamos">
        <p>
          Mientras el reporte tenga sentido para el fin que lo publicaste. Los
          reportes marcados como resueltos se quedan visibles como historia de
          reencuentros, pero puedes pedir que borremos el tuyo cuando quieras.
          También depuramos periódicamente los reportes repetidos o vacíos.
        </p>
      </Punto>

      <Punto n={9} titulo="Datos sensibles y menores de edad">
        <p>
          No pedimos ni queremos datos sensibles (salud, huella, orientación
          política o religiosa, entre otros). Tampoco pedimos cédula.
        </p>
        <p>
          Si eres menor de 18 años, publica solo con permiso de tus papás y usa el
          número de contacto de un adulto. Si nos enteramos de un reporte hecho
          por un menor sin acompañamiento, lo quitamos.
        </p>
      </Punto>

      <Punto n={10} titulo="Autorización y cambios">
        <p>
          Al publicar un reporte o una adopción autorizas que tratemos tus datos
          como está descrito acá — el formulario te lo advierte justo antes de
          publicar. Esta política empieza a regir en la fecha de arriba y aplica
          mientras la página exista. Si la cambiamos, actualizamos esa fecha.
        </p>
        <p>
          Revisa también los{" "}
          <Link href="/terminos">términos y condiciones</Link>.
        </p>
      </Punto>
    </PaginaLegal>
  );
}
