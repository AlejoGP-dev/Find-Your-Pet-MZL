import { Fragment } from "react";

/**
 * FEATURE-007 — Convierte `**negrita**` y `*cursiva*` en etiquetas.
 *
 * Existe para que el contenido de las páginas de fundaciones viva en
 * `organizaciones.ts` como texto plano y no como JSX. Si el texto llevara
 * etiquetas, cada fundación nueva obligaría a escribir marcado en un archivo
 * de datos, que es justo lo que la spec pedía evitar.
 *
 * **No es un Markdown, y a propósito no lo es.** Solo dos marcas, sin enlaces
 * ni HTML: el texto sale de un archivo del repositorio, no de un formulario,
 * pero aun así no hay ningún camino por el que algo escrito acá pueda inyectar
 * marcado — React escapa todo lo que no sean estas dos etiquetas.
 */
export default function TextoRico({
  texto,
  /**
   * Color de la negrita. Es un parámetro y no una constante porque el mismo
   * texto se pinta sobre fondo claro y sobre el verde de marca: con el color
   * fijo, la negrita de la cita quedaba verde oscuro sobre verde y **no se
   * leía**. Salió mirando la captura, no el código.
   */
  fuerte = "text-marca-oscuro",
}: {
  texto: string;
  fuerte?: string;
}) {
  // Se parte por las dos marcas a la vez para respetar el orden de aparición.
  const trozos = texto.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);

  return (
    <>
      {trozos.map((t, i) => {
        if (t.startsWith("**") && t.endsWith("**")) {
          return (
            <strong key={i} className={`font-extrabold ${fuerte}`}>
              {t.slice(2, -2)}
            </strong>
          );
        }
        if (t.startsWith("*") && t.endsWith("*") && t.length > 2) {
          return <em key={i}>{t.slice(1, -1)}</em>;
        }
        return <Fragment key={i}>{t}</Fragment>;
      })}
    </>
  );
}
