import type { Metadata } from "next";
import { ogPagina } from "@/lib/seo";
import Link from "next/link";
import { Lista, PaginaLegal, Punto } from "@/components/BloqueLegal";
import { RESPONSABLE } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Términos y condiciones — Find Your Pet CO",
  description:
    "Reglas de uso de Find Your Pet CO: qué hace y qué no hace la plataforma, cómo publicar, y de qué responde cada quien.",
  alternates: { canonical: "/terminos" },
  openGraph: ogPagina({
    ruta: "/terminos",
    titulo: "Términos y condiciones",
    descripcion:
      "Reglas de uso de Find Your Pet CO: qué hace y qué no hace la plataforma, cómo publicar, y de qué responde cada quien.",
  }),
};

export default function PaginaTerminos() {
  return (
    <PaginaLegal
      titulo="Términos y condiciones"
      bajada="Esto está escrito en español de todos los días a propósito. Es corto y vale la pena leerlo: son las reglas de la casa y de qué responde cada quien."
    >
      <Punto n={1} titulo="Qué es Find Your Pet CO">
        <p>
          Es una página gratuita hecha y administrada por{" "}
          <strong>{RESPONSABLE}</strong>, una persona natural de Manizales,
          Caldas. No es una empresa, una fundación ni una autoridad. Nació
          después del sismo del 10 de agosto de 2026 para que las familias de
          Colombia pudieran publicar sus mascotas perdidas y encontradas en un
          solo lugar.
        </p>
        <p>
          <strong>Es un tablón de anuncios, nada más.</strong> Mostramos lo que
          la comunidad publica y damos la forma de contactarse. Ahí termina
          nuestro papel.
        </p>
      </Punto>

      <Punto n={2} titulo="Lo que no hacemos">
        <p>Para que no queden dudas, esto es lo que la página no hace:</p>
        <Lista>
          <li>
            <strong>No verificamos</strong> la identidad de quien publica ni si
            lo que dice es cierto.
          </li>
          <li>
            <strong>No recibimos, no manejamos ni intermediamos dinero.</strong>{" "}
            Ni donaciones, ni recompensas, ni pagos de ningún tipo.
          </li>
          <li>
            <strong>No somos parte</strong> de ninguna entrega, negociación ni
            acuerdo entre las personas que se contactan acá.
          </li>
          <li>
            <strong>No rescatamos animales</strong> ni tenemos albergue, veterinaria
            ni transporte.
          </li>
          <li>
            <strong>No cobramos nada</strong> y no vamos a cobrar por publicar un
            reporte.
          </li>
        </Lista>
        <p>
          Si alguien te dice que representa a Find Your Pet CO y te pide plata,
          es mentira. Cuéntanos y bórralo de tu vida.
        </p>
      </Punto>

      <Punto n={3} titulo="Reglas para publicar">
        <p>Al publicar un reporte te comprometes a lo siguiente:</p>
        <Lista>
          <li>La información es cierta y hasta donde sabes está completa.</li>
          <li>
            El número de WhatsApp es tuyo o de alguien que te autorizó a
            publicarlo.
          </li>
          <li>
            La foto es tuya o tienes permiso de usarla, y no aparecen menores de
            edad ni datos de terceros sin su permiso.
          </li>
          <li>
            No vas a usar la página para vender animales, ofrecer cruces, ni
            para nada distinto a reunir mascotas con su familia o darlas en
            adopción responsable.
          </li>
          <li>
            No vas a publicar contenido ofensivo, amenazas, ni acusaciones
            contra personas identificables.
          </li>
        </Lista>
        <p>
          Al publicar nos autorizas a mostrar ese contenido en la página y a que
          cualquiera pueda compartirlo en redes, que es justo lo que hace que
          las mascotas aparezcan.
        </p>
      </Punto>

      <Punto n={4} titulo="Recompensas y estafas">
        <p>
          Puedes ofrecer una recompensa si quieres, pero{" "}
          <strong>nunca pagues por adelantado.</strong> Pedir plata antes de
          entregar al animal —para &laquo;transporte&raquo;, &laquo;veterinario&raquo;
          o &laquo;rescate&raquo;— es la forma más común de estafa en estos
          casos.
        </p>
        <p>
          Antes de creerle a alguien, pídele una seña que solo quien tenga a la
          mascota pueda saber: una cicatriz, cómo responde a un nombre, algo del
          collar. Y haz los encuentros de día, en un lugar público y
          acompañado.{" "}
          <Link href="/consejos/perdida#estafas">Más sobre esto en la guía</Link>
          .
        </p>
      </Punto>

      <Punto n={5} titulo="Sobre las adopciones">
        <p>
          La sección de adopción tiene reglas extra, porque una adopción no se
          deshace fácil:
        </p>
        <Lista>
          <li>
            <strong>Dar en adopción es gratis.</strong> No se puede cobrar por
            entregar un animal. Sí es válido acordar que quien adopta asuma
            gastos de esterilización o vacunas.
          </li>
          <li>
            Si te encontraste al animal en la calle, primero publícalo como{" "}
            <Link href="/reportar?tipo=encontrada">encontrado</Link> y espera
            unos días. Su familia puede estar buscándolo en esta misma página.
          </li>
          <li>
            Cuando publicas una adopción, el sitio revisa automáticamente si se
            parece a alguna mascota reportada como perdida y te avisa. Ese aviso
            está para tomárselo en serio.
          </li>
        </Lista>
      </Punto>

      <Punto n={6} titulo="De qué responde cada quien">
        <p>
          El contacto y el acuerdo son <strong>entre las personas</strong>. Find
          Your Pet CO no responde por lo que pase después de que dos personas se
          escriben: entregas equivocadas, estafas, información falsa, daños,
          mordeduras, ni desacuerdos de ningún tipo.
        </p>
        <p>
          Tampoco garantizamos que la página esté disponible todo el tiempo ni
          que encuentres a tu mascota. Es una herramienta gratuita hecha con
          buena fe y con recursos limitados.
        </p>
        <p>
          Nada de esto te quita los derechos que la ley colombiana te da como
          consumidor ni te impide denunciar un delito ante las autoridades. Si
          fuiste víctima de una estafa, denúncialo — nosotros colaboramos con lo
          que tengamos.
        </p>
      </Punto>

      <Punto n={7} titulo="Contenido que podemos quitar">
        <p>
          Podemos editar o eliminar un reporte, sin avisar antes, si vemos que
          es falso, duplicado, ofensivo, si expone datos de un tercero sin
          permiso, si usa la página para vender animales o si nos lo pide una
          autoridad. También eliminamos reportes vacíos o sin información útil
          para no ensuciar las búsquedas.
        </p>
        <p>
          Si crees que quitamos algo por error, escríbenos y lo revisamos.
        </p>
      </Punto>

      <Punto n={8} titulo="Menores de edad">
        <p>
          Si tienes menos de 18 años, publica solo con permiso y acompañamiento
          de tus papás o de un adulto responsable, y usa el número de contacto de
          ese adulto. Nunca publiques tu dirección exacta.
        </p>
      </Punto>

      <Punto n={9} titulo="Cambios y ley aplicable">
        <p>
          Estos términos pueden cambiar a medida que la página crece. La fecha de
          arriba dice cuándo fue la última vez. Si el cambio es grande, lo
          avisamos en la página de inicio.
        </p>
        <p>
          Todo esto se rige por las leyes de la República de Colombia.
        </p>
      </Punto>

      <Punto n={10} titulo="Tus datos">
        <p>
          Lo que hacemos con tu nombre, tu WhatsApp y tus fotos está explicado
          aparte en la{" "}
          <Link href="/datos">política de tratamiento de datos</Link>. Ojo con
          una cosa en particular: <strong>tu nombre y tu WhatsApp quedan
          visibles públicamente</strong> en el reporte, porque de eso se trata
          que alguien te pueda avisar.
        </p>
      </Punto>
    </PaginaLegal>
  );
}
