import type { NombreIcono } from "@/components/Icono";

/**
 * Guías de búsqueda y rescate.
 *
 * El contenido se apoya en la investigación de Missing Animal Response Network
 * (Kat Albrecht) sobre comportamiento de mascotas perdidas, y está adaptado a
 * Colombia: acá casi nadie tiene microchip y en muchas ciudades no hay
 * albergue municipal, así que el peso recae en la búsqueda a pie, las
 * veterinarias del barrio y los grupos de WhatsApp y Facebook.
 */

export type Paso = {
  titulo: string;
  /** Opcional: hay pasos que se explican solos con el título. */
  texto?: string;
  /** Detalle corto que se muestra resaltado. Suele ser el dato duro. */
  dato?: string;
  /** Enlace interno al final del paso (otra guía, un listado). */
  enlace?: { href: string; texto: string };
};

export type Bloque = {
  id: string;
  icono: NombreIcono;
  titulo: string;
  entradilla?: string;
  pasos: Paso[];
  /** Cambia el color del bloque a advertencia. */
  alerta?: boolean;
};

export type SlugGuia = "perdida" | "encontrada" | "adoptar" | "buscar-de-noche" | "afiche";

/**
 * SEO-036 · Todo lo que la plantilla necesita para pintar una guía vive acá,
 * en el dato. Antes la etiqueta, el icono y el color estaban quemados por slug
 * en las páginas (`ESTILO[g.slug]` en el índice y un ternario en «otras
 * guías»): una guía nueva tumbaba `/consejos` y salía rotulada «Quiero
 * adoptar». Con los campos acá, añadir una guía es añadir un objeto.
 */
export type Guia = {
  slug: SlugGuia;
  /** H1 de la página. */
  titulo: string;
  /** `<title>` si debe ser distinto del H1. Sin él, se usa `titulo`. */
  tituloSeo?: string;
  descripcion: string;
  intro: string;
  /** Etiqueta corta para las tarjetas del índice y del bloque «otras guías». */
  etiquetaCorta: string;
  /** Icono de la tarjeta. */
  icono: NombreIcono;
  /** Clases de color de la tarjeta del índice: borde, fondo, texto. */
  paleta: { borde: string; fondo: string; texto: string };
  /** Botón principal. `null` = la guía no lleva botón. */
  cta: { texto: string; href: string; icono: NombreIcono } | null;
  /** Las dos guías que se ofrecen al final, en orden. */
  relacionadas: [SlugGuia, SlugGuia];
  /**
   * Nota al pie de atribución. `"mar"` = Missing Animal Response Network y el
   * estudio de Queensland. `null` = la guía no sale de esa investigación.
   */
  fuentes: "mar" | null;
  bloques: Bloque[];
};

const PERDIDA: Guia = {
  slug: "perdida",
  titulo: "Se perdió mi mascota: qué hacer",
  descripcion:
    "Guía práctica para buscar a tu perro o gato perdido en Colombia: qué hacer las primeras horas, cómo buscar según la especie y qué errores evitar.",
  intro:
    "Lo primero: la mayoría de mascotas perdidas aparecen. Pero el cómo buscas cambia muchísimo las probabilidades, y lo que funciona con un perro no funciona con un gato. Esto es lo que dice la gente que se dedica a rastrearlas.",
  etiquetaCorta: "Se me perdió una mascota",
  icono: "perdida",
  paleta: {
    borde: "border-perdida/30 hover:border-perdida",
    fondo: "bg-perdida-suave",
    texto: "text-perdida",
  },
  cta: { texto: "Publicar que se perdió", href: "/reportar?tipo=perdida", icono: "perdida" },
  // SEO-036: las dos guías nuevas cuelgan de las que ya tienen impresiones.
  relacionadas: ["buscar-de-noche", "afiche"],
  fuentes: "mar",
  bloques: [
    {
      id: "primeras-horas",
      icono: "reloj",
      titulo: "Las primeras horas",
      entradilla:
        "El error más común es quedarse en casa esperando a que alguien llame.",
      pasos: [
        {
          titulo: "Sal a buscar a pie, ya",
          texto:
            "De todos los métodos estudiados, la búsqueda física del área es el que más mascotas ha recuperado. Publicar y esperar no reemplaza salir a caminar la zona.",
          dato: "Buscar a pie es el método más efectivo, por encima de carteles y redes",
        },
        {
          titulo: "Empieza por donde se perdió, no por donde crees que fue",
          texto:
            "Camina en círculos desde el punto exacto donde lo viste por última vez, ampliando poco a poco. Revisa debajo de carros, tras materas, en lotes, alcantarillas y escaleras.",
        },
        {
          titulo: "Publica el reporte con foto",
          texto:
            "Entre más rápido esté publicado, más ojos hay buscando. Acá es gratis, sin registro y toma un minuto — y si alguien la encuentra, te escribe directo por WhatsApp.",
        },
        {
          titulo: "Avisa a las veterinarias del sector",
          texto:
            "Es a donde la gente lleva un animal que se encontró herido o asustado. Pasa por las más cercanas, deja tu número y una foto impresa.",
        },
      ],
    },
    {
      id: "gato",
      icono: "gato",
      titulo: "Si es un gato",
      entradilla:
        "Los gatos casi nunca se van lejos. Se esconden y se quedan callados, y por eso la gente cree que desaparecieron.",
      pasos: [
        {
          titulo: "Está más cerca de lo que crees",
          texto:
            "Un estudio de la Universidad de Queensland midió qué tan lejos llegan. Si tu gato era de puertas adentro, probablemente está a menos de media cuadra, escondido y sin hacer ruido.",
          dato: "Gato casero: 50 m de mediana · Gato que salía a la calle: 315 m",
        },
        {
          titulo: "Busca en escondites, no a campo abierto",
          texto:
            "Un gato asustado busca espacios cerrados y apretados: debajo de la casa, entre tejas, en un altillo, tras un lavadero, en arbustos densos, dentro de un carro parqueado. Necesitas linterna y agacharte, aunque sea de día.",
        },
        {
          titulo: "Pide permiso para revisar patios vecinos",
          texto:
            "Muchísimos gatos aparecen encerrados en la casa del lado, en un garaje o en un depósito que alguien cerró sin darse cuenta. Tienes que entrar a mirar tú: el vecino que 'ya revisó' casi nunca revisó debajo de las cosas.",
        },
        {
          titulo: "Ten paciencia: pueden tardar días en salir",
          texto:
            "Se le llama el fenómeno del umbral. El gato se queda paralizado por el miedo y no responde ni cuando lo llamas. Muchos tardan entre diez y doce días en salir del escondite o empezar a maullar.",
          dato: "No abandones la búsqueda a los tres días",
        },
        {
          titulo: "Pon comida, no su arenera",
          texto:
            "Una estación de comida en el punto donde se perdió funciona mejor. Regar arena usada u objetos con su olor puede atraer gatos territoriales de la zona que terminan espantando al tuyo.",
        },
      ],
    },
    {
      id: "perro",
      icono: "perro",
      titulo: "Si es un perro",
      entradilla:
        "Qué tan lejos llega depende menos del tamaño y más del carácter.",
      pasos: [
        {
          titulo: "Piensa en cómo es tu perro con los extraños",
          texto:
            "El sociable se acerca a la primera persona que ve y suele aparecer cerca. El desconfiado se deja atraer con paciencia y comida, pero puede recorrer buena distancia. El muy miedoso es el que más lejos llega y el que más riesgo corre en la vía.",
        },
        {
          titulo: "No lo persigas y no le grites el nombre",
          texto:
            "Es lo más difícil de aceptar y lo más importante. Un perro en pánico no reconoce ni a su familia: correr detrás de él lo hace huir más rápido y hacia donde hay carros. Después de varios intentos fallidos, hasta oír su nombre se le vuelve señal de alarma.",
          dato: "Llamarlo a gritos puede hacer que salga corriendo de ti",
        },
        {
          titulo: "Agáchate y hazte el desentendido",
          texto:
            "Si lo ves, siéntate o agáchate de lado, sin mirarlo a los ojos, y ponte a comer algo ruidoso ignorándolo. Deja caer trozos de comida cerca de ti. La idea es que él se acerque a ti, no al revés. Puede tomar un buen rato.",
        },
        {
          titulo: "Deja su olor en la puerta",
          texto:
            "Su cama, una cobija que use o una prenda tuya sin lavar, afuera de la casa. Muchos perros regresan solos de noche cuando hay silencio y no encuentran cómo ubicarse.",
        },
      ],
    },
    {
      id: "difusion",
      icono: "megafono",
      titulo: "Que lo vea la mayor cantidad de gente",
      pasos: [
        {
          titulo: "Descarga el afiche del reporte",
          texto:
            "Cada reporte publicado acá genera un afiche listo para compartir, con la foto, los datos y tu número. Sirve tanto para WhatsApp como para imprimir y pegar.",
        },
        {
          titulo: "Los grupos de WhatsApp del barrio pesan más que las redes",
          texto:
            "El conjunto, la cuadra, la portería, el colegio. Son personas que efectivamente caminan por donde está tu mascota. En la página de ayuda también dejamos los grupos grandes de Facebook.",
        },
        {
          titulo: "Habla con quienes están todo el día en la calle",
          texto:
            "Porteros, celadores, recicladores, domiciliarios, vendedores, aseadores. Son los que más ven y casi nadie les pregunta. Muéstrales la foto en el celular y déjales tu número.",
        },
        {
          titulo: "Busca en los reportes de encontradas",
          texto:
            "Revisa el listado de mascotas encontradas de tu ciudad. La app además te sugiere automáticamente las que se parecen a la tuya cuando abres tu reporte.",
        },
      ],
    },
    {
      id: "sismo",
      icono: "sismo",
      titulo: "Después del sismo",
      entradilla:
        "Un temblor cambia el patrón normal de búsqueda y vale la pena tenerlo en cuenta.",
      pasos: [
        {
          titulo: "Muchas salieron corriendo mucho más lejos de lo normal",
          texto:
            "El ruido y la vibración disparan una huida de pánico. Amplía el radio más de lo que ampliarías en una pérdida común y revisa barrios vecinos.",
        },
        {
          titulo: "Revisa escombros y estructuras con cuidado",
          texto:
            "Es un escondite típico después de un sismo, pero no entres a una edificación averiada por tu cuenta. Si crees que está ahí, llama a Bomberos (119) o a la línea 123.",
        },
      ],
    },
    {
      id: "estafas",
      icono: "bandera",
      titulo: "Cuidado con las estafas",
      alerta: true,
      pasos: [
        {
          titulo: "Nunca envíes dinero por adelantado",
          texto:
            "El engaño típico: alguien dice que la tiene, que está lejos o herida, y pide plata para el transporte o el veterinario antes de mostrártela. Un rescatista de verdad no cobra por devolverte tu mascota.",
        },
        {
          titulo: "Pide una seña que solo el que la tiene pueda saber",
          texto:
            "Que te mande una foto del momento con algo tuyo en la mano, o que te describa una marca que no publicaste. Por eso conviene guardarte un detalle sin publicar.",
        },
        {
          titulo: "Encuentros en lugar público y acompañado",
          texto:
            "De día, en un sitio con gente, y no vayas solo. Si algo se siente raro, no vayas.",
        },
      ],
    },
  ],
};

const ENCONTRADA: Guia = {
  slug: "encontrada",
  titulo: "Me encontré una mascota: qué hacer",
  descripcion:
    "Guía práctica para quien encontró un perro o un gato perdido en Colombia: cómo acercarse sin espantarlo, cómo buscar a la familia y cómo entregarlo con seguridad.",
  intro:
    "Gracias por parar. La mayoría de animales que uno se encuentra en la calle tienen familia buscándolos, y lo que hagas en los primeros minutos define si se deja ayudar o sale corriendo.",
  etiquetaCorta: "Me encontré una mascota",
  icono: "encontrada",
  paleta: {
    borde: "border-encontrada/30 hover:border-encontrada",
    fondo: "bg-encontrada-suave",
    texto: "text-encontrada",
  },
  cta: {
    texto: "Publicar que la encontré",
    href: "/reportar?tipo=encontrada",
    icono: "encontrada",
  },
  // SEO-036: las dos guías nuevas cuelgan de las que ya tienen impresiones.
  relacionadas: ["buscar-de-noche", "afiche"],
  fuentes: "mar",
  bloques: [
    {
      id: "acercarse",
      icono: "mano",
      titulo: "Cómo acercarte sin espantarlo",
      entradilla:
        "Un animal perdido está en pánico, aunque en su casa sea el más cariñoso.",
      pasos: [
        {
          titulo: "No corras detrás de él",
          texto:
            "Perseguirlo casi siempre termina con el animal más lejos y en la vía. Si va huyendo, no lo sigas de frente: quédate quieto y déjalo que se detenga.",
        },
        {
          titulo: "Agáchate, de lado y sin mirarlo fijo",
          texto:
            "Mirar a los ojos y acercarse de frente es amenazante. Siéntate o agáchate girando el cuerpo, bosteza, mira a otro lado, y espera. Estas son las señales que un animal asustado lee como 'no soy peligro'.",
        },
        {
          titulo: "Que él llegue a ti, con comida de por medio",
          texto:
            "Deja caer trozos de comida cerca de ti y sigue ignorándolo. Puede tardar bastante. Es más efectivo que cualquier intento de agarrarlo.",
        },
        {
          titulo: "Ojo con morder",
          texto:
            "Un animal adolorido o aterrado puede morder sin ser agresivo. Si gruñe, se encoge o te enseña los dientes, no insistas: publica el reporte con la ubicación y pide ayuda de alguien con experiencia.",
        },
      ],
    },
    {
      id: "identificar",
      icono: "buscar",
      titulo: "Busca de quién es",
      pasos: [
        {
          titulo: "Revisa el collar y la placa",
          texto:
            "Suena obvio pero es lo primero que se salta la gente. Mira también por dentro del collar, donde a veces está escrito el número.",
        },
        {
          titulo: "Llévalo a una veterinaria a revisar microchip",
          texto:
            "En Colombia todavía es poco común, pero cuesta nada preguntar y algunas veterinarias tienen lector. De paso te dicen si está herido o desnutrido.",
        },
        {
          titulo: "Pregunta en las casas de la cuadra donde lo viste",
          texto:
            "Muchísimos casos se resuelven así de rápido: el animal se soltó a dos casas de donde apareció. Empieza por ahí antes que por internet.",
        },
        {
          titulo: "Mira el listado de mascotas perdidas de tu ciudad",
          texto:
            "Puede que la familia ya haya publicado. Cuando publiques tu reporte de encontrada, la app te sugiere automáticamente las perdidas que se le parecen.",
        },
      ],
    },
    {
      id: "publicar",
      icono: "documento",
      titulo: "Publica el reporte, pero guárdate un detalle",
      alerta: true,
      pasos: [
        {
          titulo: "No publiques todas las señas particulares",
          texto:
            "Deja por fuera una marca, una cicatriz, el color exacto de una pata o algo del collar. Es la única forma que vas a tener de comprobar que quien te escribe es de verdad la familia.",
          dato: "Un dato que no publicaste = tu forma de verificar al dueño",
        },
        {
          titulo: "Sube una foto clara del animal",
          texto:
            "De cuerpo entero y con buena luz. Es lo que hace que la familia lo reconozca al pasar por el listado.",
        },
        {
          titulo: "Sé preciso con el lugar",
          texto:
            "El barrio y un punto de referencia. La familia está buscando por zonas y esto es lo que hace que te encuentren.",
        },
      ],
    },
    {
      id: "mientras",
      icono: "casa",
      titulo: "Mientras aparece la familia",
      pasos: [
        {
          titulo: "Agua siempre, comida en poquitos",
          texto:
            "Si lleva días sin comer, darle mucho de golpe le puede caer mal. Dale porciones pequeñas y frecuentes. Concentrado es lo ideal; si no tienes, pollo o arroz cocido sin sal ni condimento.",
        },
        {
          titulo: "Nunca le des esto",
          texto:
            "Chocolate, uvas o pasas, cebolla, ajo, aguacate, huesos cocidos (se astillan), comida con sal o condimento, y leche de vaca — a la mayoría les cae mal.",
          dato: "Chocolate, uvas, cebolla, ajo, huesos cocidos y leche: no",
        },
        {
          titulo: "Sepáralo de tus mascotas los primeros días",
          texto:
            "Puede traer pulgas, sarna o alguna infección, y además el estrés de un territorio ajeno genera peleas. Un cuarto, un baño o el patio aparte mientras tanto.",
        },
        {
          titulo: "Si no puedes tenerlo, dilo en el reporte",
          texto:
            "Escribe que necesitas hogar de paso. En la página de ayuda hay fundaciones y personas que a veces pueden recibirlo, pero contáctalas antes de llevarles nada.",
        },
      ],
    },
    {
      id: "entregar",
      icono: "acuerdo",
      titulo: "Entregarlo con seguridad",
      alerta: true,
      pasos: [
        {
          titulo: "Pide que te describan lo que no publicaste",
          texto:
            "Si acierta con la seña que te guardaste, es la familia. Si duda o cambia la versión, desconfía.",
        },
        {
          titulo: "Pide fotos anteriores del animal",
          texto:
            "Fotos donde se vea en su casa, con la familia, en distintos momentos. Es muy difícil de improvisar.",
        },
        {
          titulo: "Mira cómo reacciona el animal",
          texto:
            "Es la prueba más honesta de todas. Un animal que reconoce a su gente lo demuestra de una manera que no se finge.",
        },
        {
          titulo: "Encuentro de día, en lugar público y acompañado",
          texto:
            "No des tu dirección exacta ni entregues de noche. Y no aceptes ni pidas dinero: si quieren darte algo, sugiere que se lo donen a una fundación.",
        },
      ],
    },
  ],
};


const ADOPTAR: Guia = {
  slug: "adoptar",
  titulo: "Antes de adoptar: lo que hay que pensar",
  descripcion:
    "Qué preguntar antes de adoptar un perro o un gato, qué implica de verdad y cómo hacer una adopción segura para el animal y para ti.",
  intro:
    "Adoptar es de las cosas más bonitas que se pueden hacer, y también un compromiso de diez o quince años. Muchas veces se adopta conmovido por una historia — esto es para que esa decisión aguante cuando pase la emoción del momento.",
  etiquetaCorta: "Quiero adoptar",
  icono: "hogar",
  paleta: {
    borde: "border-marca/30 hover:border-marca",
    fondo: "bg-marca-suave",
    texto: "text-marca-oscuro",
  },
  // FEATURE-006: sin contenido de adopción el botón no se pinta. La página
  // decide con ADOPCION_CON_CONTENIDO; acá solo se dice a dónde iría.
  cta: { texto: "Ver mascotas en adopción", href: "/adopcion", icono: "hogar" },
  relacionadas: ["perdida", "encontrada"],
  fuentes: "mar",
  bloques: [
    {
      id: "antes",
      icono: "pensar",
      titulo: "Antes de escribir por WhatsApp",
      entradilla:
        "Cinco preguntas honestas. Si alguna te hace dudar, quizá todavía no es el momento — y está bien.",
      pasos: [
        {
          titulo: "¿Puedes sostenerlo diez o quince años?",
          texto:
            "Un perro o un gato vive eso. Cambios de casa, de trabajo, de ciudad, hijos, viajes: el animal va contigo en todos.",
          dato: "Un perro mediano puede costar entre 150.000 y 300.000 al mes",
        },
        {
          titulo: "¿Y el veterinario?",
          texto:
            "Vacunas, desparasitación, esterilización y una urgencia que siempre llega. Una cirugía imprevista se va fácil a un millón.",
        },
        {
          titulo: "¿Todos en la casa están de acuerdo?",
          texto:
            "La razón más común por la que devuelven un animal es que alguien de la casa no estaba realmente de acuerdo. Háblalo antes, no después.",
        },
        {
          titulo: "¿Puedes tenerlo donde vives?",
          texto:
            "Revisa el reglamento del conjunto o el contrato de arriendo. Enterarse después es lo que termina en abandono.",
        },
        {
          titulo: "¿Tienes tiempo hoy, no en un mes?",
          texto:
            "Los primeros días son de adaptación y necesitan presencia. Si vienes de una semana imposible, espera a la siguiente.",
        },
      ],
    },
    {
      id: "preguntar",
      icono: "chat",
      titulo: "Qué preguntarle a quien la entrega",
      pasos: [
        {
          titulo: "¿Por qué la da en adopción?",
          texto:
            "La respuesta dice mucho. Un rescate de la calle, una camada inesperada o una mudanza son razones normales. Las evasivas no.",
        },
        {
          titulo: "¿Cómo llegó a sus manos?",
          texto:
            "Si se la encontró en la calle, pregunta cuánto buscó a la familia y si la publicó como encontrada. Puede que alguien todavía la esté buscando.",
        },
        {
          titulo: "¿Está esterilizada, vacunada, desparasitada?",
          texto:
            "Si no, no es motivo para no adoptar — pero sí para saber qué gasto te espera las primeras semanas.",
        },
        {
          titulo: "¿Cómo es con niños, con otros animales, cuando se queda sola?",
          texto:
            "Mejor saberlo antes que descubrirlo el primer día.",
        },
        {
          titulo: "¿Puedo conocerla antes de decidir?",
          texto:
            "Siempre. Quien no deja verla antes de entregarla, o apura la decisión, es una señal para desconfiar.",
        },
      ],
    },
    {
      id: "seguridad",
      icono: "escudo",
      titulo: "Que la adopción sea segura",
      alerta: true,
      pasos: [
        {
          titulo: "Adoptar es gratis",
          texto:
            "Nadie debería cobrarte por entregarte un animal. Algunas fundaciones piden un aporte para recuperar gastos de veterinaria y lo dicen de frente — eso es distinto de vender.",
          dato: "Si te piden plata por la mascota, no sigas",
        },
        {
          titulo: "Conócela en persona antes de decidir",
          texto:
            "De día, en un lugar público o en donde está viviendo. Nunca cierres una adopción solo por fotos.",
        },
        {
          titulo: "Desconfía del apuro",
          texto:
            "«Tiene que ser hoy», «hay otra persona interesada», «mándame algo para apartarla». Todas son señales de estafa.",
        },
        {
          titulo: "Si entregas tú, mira a dónde va",
          texto:
            "Pregunta dónde va a vivir, quién más está en la casa, si han tenido animales antes. Pide el número y quedar en contacto las primeras semanas.",
        },
      ],
    },
    {
      id: "primeros-dias",
      icono: "casa",
      titulo: "Los primeros días en casa",
      pasos: [
        {
          titulo: "Dale un rincón propio y déjalo en paz",
          texto:
            "Cama, agua, comida y un espacio donde nadie lo moleste. Que se acerque él. Abrumarlo con cariño el primer día es el error más común.",
        },
        {
          titulo: "La regla de 3-3-3",
          texto:
            "Tres días para bajar el susto, tres semanas para entender la rutina, tres meses para sentirse en casa. Si a la semana no es el animal que esperabas, es normal: todavía no es él.",
          dato: "3 días asustado · 3 semanas aprendiendo · 3 meses en casa",
        },
        {
          titulo: "Al veterinario en la primera semana",
          texto:
            "Chequeo general, vacunas al día, desparasitación. Si viene de la calle o de un refugio lleno, con más razón.",
        },
        {
          titulo: "Esterilízalo",
          texto:
            "Es lo único que corta de raíz el problema que hace que existan páginas como esta.",
        },
      ],
    },
  ],
};


/**
 * SEO-036 · Ola 1. Contenido aprobado por Alejo el 23 de septiembre de 2026.
 * Fuente: `SEO-036-ENTREGA-ola-1.md`, con las correcciones de
 * `SEO-036-HANDOFF-DEV.md` (bloque 1, paso 2 de esta guía: no se le dice a
 * nadie que deje la casa abierta de noche).
 */
const NOCHE: Guia = {
  slug: "buscar-de-noche",
  titulo: "Se perdió de noche: cómo buscarla hasta que amanezca",
  tituloSeo: "Se perdió de noche: cómo buscar a tu mascota",
  descripcion:
    "Qué cambia cuando una mascota se pierde de noche: dónde se esconde, por qué gritar su nombre puede alejarla, cómo usar la linterna y qué hacer al amanecer.",
  intro:
    "De noche cambia todo: el animal no corre, se esconde. Hay menos gente y menos ruido, que juega a tu favor, pero también menos luz y más riesgo para ti. Esto es qué hacer entre esta noche y el amanecer, en orden.",
  etiquetaCorta: "Se perdió de noche",
  icono: "ojo",
  paleta: {
    borde: "border-indigo-300/60 hover:border-indigo-500",
    fondo: "bg-indigo-50",
    texto: "text-indigo-900",
  },
  cta: { texto: "Publicar que se perdió", href: "/reportar?tipo=perdida", icono: "perdida" },
  relacionadas: ["perdida", "afiche"],
  fuentes: "mar",
  bloques: [
    {
      id: "antes-de-salir",
      icono: "reloj",
      titulo: "Antes de salir, dos minutos",
      entradilla: "Lo que hagas en tu casa antes de salir pesa tanto como la caminada.",
      pasos: [
        {
          titulo: "Publica el reporte antes de salir",
          texto:
            "Toma menos de un minuto y es lo único que sigue buscando mientras tú caminas y mientras duermes. Alguien que la vea a las tres de la mañana necesita un lugar donde escribirte.",
          dato: "Publicar ahora es lo único que sigue buscando cuando tú ya no puedes",
        },
        {
          titulo: "Déjale por dónde entrar, sin dejar la casa abierta",
          texto:
            "El patio, el garaje o la reja de afuera, si es seguro donde vives. La puerta de la casa no. Muchos animales vuelven solos en la madrugada, cuando la calle se queda callada — lo que necesitan es poder llegar al punto, no entrar a la sala.",
        },
        {
          titulo: "Pon su plato en la entrada y una prenda tuya",
          texto:
            "La comida y un olor conocido son lo que la fija a ese punto. Si es gata, comida sí, la arenera no — su olor en la calle puede atraer a otros gatos y confundirla.",
        },
        {
          titulo: "Avisa a alguien antes de salir",
          texto:
            "De noche no se busca solo. Y si no tienes con quién, mira el bloque de más abajo antes de salir igual.",
        },
      ],
    },
    {
      id: "linterna",
      icono: "ojo",
      titulo: "Buscar con linterna",
      entradilla: "De noche no buscas un animal: buscas dos puntos de luz.",
      pasos: [
        {
          titulo: "Busca ojos, no siluetas",
          texto:
            "Los ojos de perros y gatos reflejan la luz de la linterna. En la oscuridad los vas a ver como dos puntos brillantes mucho antes de distinguir el animal. Barre despacio, a ras de suelo, de lado a lado.",
          dato: "Dos puntos brillantes a ras de suelo: eso es lo que estás buscando",
        },
        {
          titulo: "Alumbra debajo, no al frente",
          texto:
            "Debajo de los carros, bajo las escaleras, detrás de las materas, en los huecos del muro, entre la maleza del lote. Un animal asustado busca techo encima y salida al lado. No busca espacio abierto.",
        },
        {
          titulo: "Camina despacio y para a escuchar",
          texto:
            "De noche hay menos ruido que a cualquier hora del día: un maullido bajito o un rasguño se oyen de lejos si dejas de caminar. Párate cada tanto y quédate quieto medio minuto, sin hablar.",
        },
        {
          titulo: "Apunta la linterna al piso",
          texto:
            "Un haz de luz directo a la cara asusta y la mete más adentro. La luz va delante de tus pies, no al frente.",
        },
      ],
    },
    {
      id: "lo-que-la-aleja",
      icono: "alerta",
      titulo: "Lo que la aleja",
      alerta: true,
      pasos: [
        {
          titulo: "No grites su nombre",
          texto:
            "Cuando estás angustiado tu voz no suena como tu voz. El animal reconoce el tono de cuando le sirves la comida, no el del grito. Háblale bajito y normal, como cualquier noche.",
        },
        {
          titulo: "Si la ves, no corras hacia ella",
          texto:
            "Agáchate, ponte de lado, no la mires fijo y espera a que llegue ella. Correr detrás es lo que la hace arrancar — y de noche, hacia donde no la vas a poder seguir.",
        },
        {
          titulo: "No salgas con una cuadrilla de gente y linternas",
          texto:
            "Cinco personas llamándola al tiempo la entierran en el escondite. Mejor dos personas, en silencio, cubriendo poquito a poco.",
        },
        {
          titulo: "No la busques desde el carro andando",
          texto:
            "Motor, luces altas y pito empujan hacia afuera. El carro sirve para llegar a la zona, no para buscar dentro de ella.",
        },
      ],
    },
    {
      id: "cuidate",
      icono: "escudo",
      titulo: "Cuídate tú también",
      pasos: [
        {
          titulo: "No entres a lotes ni a construcciones a oscuras",
          texto:
            "Ni a canales, ni a cañadas, ni a casas desocupadas. Lo marcas en el mapa y vuelves con luz de día.",
        },
        {
          titulo: "Deja dicho dónde vas a estar",
          texto: "A alguien de la casa o a un vecino, con la hora a la que piensas volver.",
        },
        {
          titulo: "Si es muy tarde y estás solo, espera al amanecer",
          texto:
            "No es rendirse. La primera luz es mejor hora de búsqueda que las dos de la mañana y vas a estar en condiciones de aprovecharla.",
        },
      ],
    },
    {
      id: "amanecer",
      icono: "reloj",
      titulo: "Al amanecer",
      entradilla: "La madrugada es la mejor ventana del día, y dura poco.",
      pasos: [
        {
          titulo: "Sal con la primera luz",
          texto:
            "Perros y gatos asustados se mueven sobre todo en el cambio de luz, cuando todavía no hay gente ni carros en la calle. Es la hora con menos ruido y más movimiento del animal al tiempo.",
        },
        {
          titulo: "Vuelve al mismo punto, no más lejos",
          texto:
            "Se empieza otra vez por donde se perdió. La tentación de abrir el radio cada día es justo lo que hace que uno pase por encima del lugar donde está.",
        },
        {
          titulo: "Pega los afiches antes de que la gente salga a trabajar",
          texto:
            "Entre las 6 y las 8 de la mañana pasa por la calle la mayor cantidad de gente del día.",
          enlace: { href: "/consejos/afiche", texto: "Cómo hacer y pegar el afiche" },
        },
        {
          titulo: "Revisa las mascotas encontradas de tu ciudad",
          texto:
            "Si alguien la recogió de noche, es muy probable que la publique en la mañana.",
          enlace: { href: "/?tipo=encontrada#reportes", texto: "Ver las mascotas encontradas" },
        },
      ],
    },
  ],
};

const AFICHE: Guia = {
  slug: "afiche",
  titulo: "Cómo hacer y pegar un afiche que sí funcione",
  tituloSeo: "Afiche de mascota perdida: cómo hacerlo y dónde pegarlo",
  descripcion:
    "Qué foto sirve y cuál no, qué datos van y cuáles sobran, dónde se pega y a qué altura. Y cómo descargar el afiche de tu reporte ya hecho, listo para imprimir.",
  intro:
    "No tienes que diseñar nada: si ya publicaste el reporte, el afiche está hecho y se descarga desde la ficha. Esta guía es para lo que el sitio no puede hacer por ti — qué foto elegir, qué datos dejar por fuera, y dónde pegarlo para que alguien se pare a leerlo.",
  etiquetaCorta: "Cómo hacer un afiche",
  icono: "imagen",
  paleta: {
    borde: "border-amber-300/70 hover:border-amber-500",
    fondo: "bg-amber-50",
    texto: "text-amber-900",
  },
  cta: { texto: "Publicar el reporte y descargar el afiche", href: "/reportar", icono: "imagen" },
  relacionadas: ["perdida", "buscar-de-noche"],
  // El afiche no sale de la investigación de MAR ni del estudio de Queensland.
  fuentes: null,
  bloques: [
    {
      id: "ya-esta-hecho",
      icono: "check",
      titulo: "El tuyo ya está hecho",
      pasos: [
        {
          titulo: "Descárgalo desde la ficha de tu mascota",
          texto:
            "En la ficha hay un botón que dice «Descargar afiche para compartir». Sale con la foto, la palabra PERDIDA o ENCONTRADA bien grande, el barrio y la ciudad, la fecha, las señas y tu número. No hay que armar nada.",
        },
        {
          titulo: "Sale en 1080 × 1350",
          texto:
            "Es la medida que usan Instagram y el estado de WhatsApp, y se imprime bien en una hoja carta.",
          dato: "1080 × 1350 px: el mismo archivo sirve para imprimir y para mandar por WhatsApp",
        },
        {
          titulo: "Mándalo por WhatsApp antes de imprimirlo",
          texto:
            "La mayoría de la gente lo va a ver en el celular, no en un poste. Los grupos del barrio y del edificio primero; la impresora después.",
        },
        {
          titulo: "Si lo actualizas, vuelve a descargarlo",
          texto:
            "El afiche se genera con lo que tenga el reporte en ese momento. Si corriges la foto o agregas una seña, el afiche nuevo sale con el cambio.",
        },
      ],
    },
    {
      id: "a-mano",
      icono: "documento",
      titulo: "Si lo haces a mano",
      entradilla: "Un afiche se lee en dos segundos desde tres metros, o no se lee.",
      pasos: [
        {
          titulo: "Una sola palabra grande arriba: PERDIDO o ENCONTRADO",
          texto:
            "Es lo único que hace que alguien se acerque a leer el resto. Va arriba, en letra gruesa, ocupando todo el ancho.",
        },
        {
          titulo: "El barrio, nunca la dirección de tu casa",
          texto:
            "«Perdido en Chipre» le dice al vecino en un segundo si le sirve. Tu dirección exacta no tiene por qué estar en un poste.",
        },
        {
          titulo: "Un solo número de teléfono",
          texto:
            "Dos números dividen: el que lo lea llama a uno, no contesta, y no llama al otro.",
        },
        {
          titulo: "Tres datos y nada más",
          texto:
            "Cómo es, dónde y cuándo se perdió, y a quién llamar. Todo lo demás sobra y le quita espacio a la foto.",
        },
        {
          titulo: "Guárdate una seña por fuera",
          texto:
            "Una marca, una cicatriz, algo del collar que no aparezca ni en el afiche ni en el reporte. Después es lo que distingue a quien de verdad la vio.",
          dato: "La seña que no publicas es la que después te sirve para filtrar",
          enlace: { href: "/consejos/perdida#estafas", texto: "Cómo evitar las estafas" },
        },
      ],
    },
    {
      id: "la-foto",
      icono: "camara",
      titulo: "La foto",
      pasos: [
        {
          titulo: "De día, de cuerpo entero y de lado",
          texto:
            "La foto bonita durmiendo en el sofá no sirve: no se ve el tamaño, ni las patas, ni las manchas.",
        },
        {
          titulo: "Que se vean las marcas",
          texto:
            "La mancha del pecho, la oreja caída, el collar, la cola. Es lo que hace que alguien diga «yo vi a ese», en vez de «vi un perro café».",
        },
        {
          titulo: "Sin filtros y sin recortarle la cara",
          texto: "Un filtro le cambia el color del pelo, y el color es media identificación.",
        },
        {
          titulo: "Si solo tienes una foto regular, úsala igual",
          texto: "Una foto mala publicada hoy vale más que una buena mañana. Después la cambias.",
        },
      ],
    },
    {
      id: "donde-se-pega",
      icono: "ubicacion",
      titulo: "Dónde se pega",
      pasos: [
        {
          titulo: "A la altura de los ojos",
          texto:
            "Nadie mira al piso ni al techo cuando camina. Si queda por encima de tu cabeza o por debajo de la cintura, no existe.",
        },
        {
          titulo: "Donde la gente para, no donde pasa",
          texto:
            "Tiendas de barrio, panaderías, paraderos, la entrada del colegio, la portería del conjunto, la veterinaria, la peluquería canina, el gimnasio. En un poste de una avenida nadie frena a leer.",
        },
        {
          titulo: "Empieza donde se perdió y abre en círculos",
          texto: "Primero la cuadra, después el barrio, después lo de más allá. No al revés.",
        },
        {
          titulo: "Pide permiso en tiendas y porterías",
          texto:
            "Un afiche pegado adentro de una tienda dura semanas. Uno en un poste dura hasta el primer aguacero.",
        },
        {
          titulo: "Protégelo del agua",
          texto: "Dentro de una bolsa plástica, o con cinta transparente por encima de toda la hoja.",
          dato: "Acá llueve: un afiche sin bolsa dura un día",
        },
        {
          titulo: "Entrégalo en mano a quien está todo el día en la calle",
          texto:
            "Vigilantes, recicladores, domiciliarios, el señor de la tienda, los que cuidan carros. Ven más calle en un día que tú en una semana.",
        },
      ],
    },
    {
      id: "lo-que-lo-vuelve-inutil",
      icono: "alerta",
      titulo: "Lo que lo vuelve inútil",
      alerta: true,
      pasos: [
        {
          titulo: "No pongas recompensa",
          texto:
            "Atrae a quien quiere la plata, no a quien vio al animal, y es el gancho de las estafas más comunes. Si quieres dar algo, lo das después y en persona.",
        },
        {
          titulo: "No pongas tu dirección ni el nombre del conjunto",
        },
        {
          titulo: "No lo llenes de texto",
          texto:
            "Si hay que pararse dos minutos a leerlo, nadie lo lee. Lo que no quepa en tres renglones va en el reporte, no en el afiche.",
        },
        {
          titulo: "Bájalos cuando aparezca",
          texto:
            "Es lo que hace que el barrio siga creyendo en el siguiente afiche. Y es un rato de trabajo que le regalas al que venga detrás.",
        },
      ],
    },
  ],
};

export const GUIAS: Guia[] = [PERDIDA, ENCONTRADA, NOCHE, AFICHE, ADOPTAR];

export function guiaPorSlug(slug: string): Guia | null {
  return GUIAS.find((g) => g.slug === slug) ?? null;
}
