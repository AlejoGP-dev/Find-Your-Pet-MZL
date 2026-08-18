/**
 * Inserta un bloque JSON-LD.
 *
 * El escapado de `<` no es decorativo: los reportes traen texto libre escrito
 * por la gente (nombre, descripción) y sin escaparlo alguien podría cerrar el
 * `</script>` desde el contenido de su propio reporte.
 */
export default function DatosEstructurados({ datos }: { datos: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(datos)
          .replace(/</g, "\\u003c")
          .replace(/>/g, "\\u003e")
          .replace(/&/g, "\\u0026"),
      }}
    />
  );
}
