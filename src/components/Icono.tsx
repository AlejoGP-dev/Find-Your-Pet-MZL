/**
 * Set de iconos de Find Your Pet CO.
 *
 * Reemplaza a los emojis: estos se veían distinto en cada sistema operativo
 * (y algunos ni siquiera existen en Android viejo), no heredaban el color del
 * texto y no se podían alinear con la tipografía.
 *
 * La mayoría son de Lucide (https://lucide.dev), licencia ISC — copyright (c)
 * Lucide Contributors; el aviso completo está en LICENSE-lucide. Van copiados
 * aquí en vez de instalar el paquete: son 42 de los 2.000 que trae, y así el
 * bundle no depende de una librería entera. Cada uno lleva arriba de qué icono
 * viene, para poder actualizarlo si Lucide lo redibuja.
 *
 * Los seis marcados como "propio" son de la casa, porque no existen en ningún
 * set: `perdida` y `encontrada` (una huella con interrogante y con visto, que
 * son el par central de la app), `whatsapp` e `instagram` (marcas), `arena`
 * (caja de arena para gatos) y `sismo`.
 *
 * Todos comparten la misma retícula de 24×24, trazo 2 y extremos redondeados,
 * que es también el sistema del isotipo. Usan `currentColor` y escalan con el
 * tamaño de fuente.
 */
const TRAZOS = {
  // acuerdo: lucide/handshake
  acuerdo: [
    "m11 17 2 2a1 1 0 1 0 3-3",
    "m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4",
    "m21 3 1 11h-2",
    "M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3",
    "M3 4h8",
  ],
  // alerta: lucide/triangle-alert
  alerta: [
    "m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3",
    "M12 9v4",
    "M12 17h.01",
  ],
  // alto: lucide/octagon-x
  alto: [
    "m15 9-6 6",
    "M2.586 16.726A2 2 0 0 1 2 15.312V8.688a2 2 0 0 1 .586-1.414l4.688-4.688A2 2 0 0 1 8.688 2h6.624a2 2 0 0 1 1.414.586l4.688 4.688A2 2 0 0 1 22 8.688v6.624a2 2 0 0 1-.586 1.414l-4.688 4.688a2 2 0 0 1-1.414.586H8.688a2 2 0 0 1-1.414-.586z",
    "m9 9 6 6",
  ],
  // arena: propio
  arena: [
    "M3.6 9.4h16.8l-1.4 9.1c-.1.8-.8 1.4-1.6 1.4H6.6c-.8 0-1.5-.6-1.6-1.4L3.6 9.4Z",
    "M3.6 9.4 5.4 5.6c.3-.6.9-1 1.6-1h10c.7 0 1.3.4 1.6 1l1.8 3.8",
    "M8.9 13.6h.01",
    "M12.4 15.4h.01",
    "M15.6 13.2h.01",
  ],
  // aseo: lucide/spray-can
  aseo: [
    "M3 3h.01",
    "M7 5h.01",
    "M11 7h.01",
    "M3 7h.01",
    "M7 9h.01",
    "M3 11h.01",
    "M15.0 5.0h4.0v4.0h-4.0Z",
    "m19 9 2 2v10c0 .6-.4 1-1 1h-6c-.6 0-1-.4-1-1V11l2-2",
    "m13 14 8-2",
    "m13 19 8-2",
  ],
  // bandera: lucide/flag-triangle-right
  bandera: [
    "M6 22V2.8a.8.8 0 0 1 1.17-.71l11.38 5.69a.8.8 0 0 1 0 1.44L6 15.5",
  ],
  // buscar: lucide/search
  buscar: [
    "m21 21-4.34-4.34",
    "M3.0 11.0a8.0 8.0 0 1 0 16.0 0a8.0 8.0 0 1 0 -16.0 0",
  ],
  // cama: lucide/bed
  cama: [
    "M2 4v16",
    "M2 8h18a2 2 0 0 1 2 2v10",
    "M2 17h20",
    "M6 8v9",
  ],
  // camara: lucide/camera
  camara: [
    "M13.997 4a2 2 0 0 1 1.76 1.05l.486.9A2 2 0 0 0 18.003 7H20a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1.997a2 2 0 0 0 1.759-1.048l.489-.904A2 2 0 0 1 10.004 4z",
    "M9.0 13.0a3.0 3.0 0 1 0 6.0 0a3.0 3.0 0 1 0 -6.0 0",
  ],
  // casa: lucide/house
  casa: [
    "M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8",
    "M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",
  ],
  // chat: lucide/message-circle
  chat: [
    "M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719",
  ],
  // check: lucide/circle-check
  check: [
    "M2.0 12.0a10.0 10.0 0 1 0 20.0 0a10.0 10.0 0 1 0 -20.0 0",
    "m9 12 2 2 4-4",
  ],
  // chincheta: lucide/pin
  chincheta: [
    "M12 17v5",
    "M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z",
  ],
  // comida: lucide/bone
  comida: [
    "M17 10c.7-.7 1.69 0 2.5 0a2.5 2.5 0 1 0 0-5 .5.5 0 0 1-.5-.5 2.5 2.5 0 1 0-5 0c0 .81.7 1.8 0 2.5l-7 7c-.7.7-1.69 0-2.5 0a2.5 2.5 0 0 0 0 5c.28 0 .5.22.5.5a2.5 2.5 0 1 0 5 0c0-.81-.7-1.8 0-2.5Z",
  ],
  // corazon: lucide/heart
  corazon: [
    "M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5",
  ],
  // dinero: lucide/banknote
  dinero: [
    "M4.0 6.0h16.0a2.0 2.0 0 0 1 2.0 2.0v8.0a2.0 2.0 0 0 1 -2.0 2.0h-16.0a2.0 2.0 0 0 1 -2.0 -2.0v-8.0a2.0 2.0 0 0 1 2.0 -2.0Z",
    "M10.0 12.0a2.0 2.0 0 1 0 4.0 0a2.0 2.0 0 1 0 -4.0 0",
    "M6 12h.01M18 12h.01",
  ],
  // documento: lucide/file-text
  documento: [
    "M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z",
    "M14 2v5a1 1 0 0 0 1 1h5",
    "M10 9H8",
    "M16 13H8",
    "M16 17H8",
  ],
  // encontrada: propio
  encontrada: [
    "M8.9 11.4c-.8 0-1.5-.9-1.5-2s.7-2 1.5-2 1.5.9 1.5 2-.7 2-1.5 2Z",
    "M13.4 10.4c-.8 0-1.5-1-1.5-2.2s.7-2.2 1.5-2.2 1.5 1 1.5 2.2-.7 2.2-1.5 2.2Z",
    "M11.2 12.6c1.4 0 2.3 1.1 3 2.2.7 1 2 1.9 2 3.4 0 1.8-1.4 3-3 3-.9 0-1.5-.4-2.8-.4s-1.9.4-2.8.4c-1.6 0-3-1.2-3-3 0-1.5 1.3-2.4 2-3.4.7-1.1 1.6-2.2 3-2.2Z",
    "M17.2 8.6l1.6 1.6 3.2-3.4",
  ],
  // enlace: lucide/link
  enlace: [
    "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71",
    "M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71",
  ],
  // escudo: lucide/shield-check
  escudo: [
    "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",
    "m9 12 2 2 4-4",
  ],
  // facebook: trazo propio, al estilo del resto del set (líneas, sin relleno)
  facebook: [
    "M7 10v4h3v7h4v-7h3l1-4h-4V8a1 1 0 0 1 1-1h3V3h-3a5 5 0 0 0-5 5v2H7",
  ],
  // gato: lucide/cat
  gato: [
    "M12 5c.67 0 1.35.09 2 .26 1.78-2 5.03-2.84 6.42-2.26 1.4.58-.42 7-.42 7 .57 1.07 1 2.24 1 3.44C21 17.9 16.97 21 12 21s-9-3-9-7.56c0-1.25.5-2.4 1-3.44 0 0-1.89-6.42-.5-7 1.39-.58 4.72.23 6.5 2.23A9.04 9.04 0 0 1 12 5Z",
    "M8 14v.5",
    "M16 14v.5",
    "M11.25 16.25h1.5L12 17l-.75-.75Z",
  ],
  // gota: lucide/droplet
  gota: [
    "M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z",
  ],
  // hogar: lucide/house-heart
  hogar: [
    "M8.62 13.8A2.25 2.25 0 1 1 12 10.836a2.25 2.25 0 1 1 3.38 2.966l-2.626 2.856a.998.998 0 0 1-1.507 0z",
    "M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",
  ],
  // huella: lucide/paw-print
  huella: [
    "M9.0 4.0a2.0 2.0 0 1 0 4.0 0a2.0 2.0 0 1 0 -4.0 0",
    "M16.0 8.0a2.0 2.0 0 1 0 4.0 0a2.0 2.0 0 1 0 -4.0 0",
    "M18.0 16.0a2.0 2.0 0 1 0 4.0 0a2.0 2.0 0 1 0 -4.0 0",
    "M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.045Q6.52 17.48 4.46 16.84A3.5 3.5 0 0 1 5.5 10Z",
  ],
  // imagen: lucide/image
  imagen: [
    "M5.0 3.0h14.0a2.0 2.0 0 0 1 2.0 2.0v14.0a2.0 2.0 0 0 1 -2.0 2.0h-14.0a2.0 2.0 0 0 1 -2.0 -2.0v-14.0a2.0 2.0 0 0 1 2.0 -2.0Z",
    "M7.0 9.0a2.0 2.0 0 1 0 4.0 0a2.0 2.0 0 1 0 -4.0 0",
    "m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21",
  ],
  // instagram: propio
  instagram: [
    "M7.4 3.6h9.2a3.8 3.8 0 0 1 3.8 3.8v9.2a3.8 3.8 0 0 1-3.8 3.8H7.4a3.8 3.8 0 0 1-3.8-3.8V7.4a3.8 3.8 0 0 1 3.8-3.8Z",
    "M12 15.9a3.9 3.9 0 1 0 0-7.8 3.9 3.9 0 0 0 0 7.8Z",
    "M17.1 6.9h.01",
  ],
  // institucion: lucide/landmark
  institucion: [
    "M10 18v-7",
    "M11.119 2.205a2 2 0 0 1 1.762 0l7.84 3.846A.5.5 0 0 1 20.5 7h-17a.5.5 0 0 1-.22-.949z",
    "M14 18v-7",
    "M18 18v-7",
    "M3 22h18",
    "M6 18v-7",
  ],
  // libro: lucide/book-open
  libro: [
    "M12 5v16",
    "M20.001 19A2 2 0 0022 17V5a2 2 0 00-1.999-2L16 3.002A5 5 0 0012 5a5 5 0 00-4-2H4a2 2 0 00-2 2v12a2 2 0 001.999 2H8a5 5 0 014 2 5 5 0 014-2z",
  ],
  // mano: lucide/hand
  mano: [
    "M18 11V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2",
    "M14 10V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v2",
    "M10 10.5V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2v8",
    "M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15",
  ],
  // medicina: lucide/pill
  medicina: [
    "m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z",
    "m8.5 8.5 7 7",
  ],
  // megafono: lucide/megaphone
  megafono: [
    "M11 6a13 13 0 0 0 8.4-2.8A1 1 0 0 1 21 4v12a1 1 0 0 1-1.6.8A13 13 0 0 0 11 14H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z",
    "M6 14a12 12 0 0 0 2.4 7.2 2 2 0 0 0 3.2-2.4A8 8 0 0 1 10 14",
    "M8 6v8",
  ],
  // musica: lucide/music
  musica: [
    "M9 18V5l12-2v13",
    "M3.0 18.0a3.0 3.0 0 1 0 6.0 0a3.0 3.0 0 1 0 -6.0 0",
    "M15.0 16.0a3.0 3.0 0 1 0 6.0 0a3.0 3.0 0 1 0 -6.0 0",
  ],
  // nino: lucide/baby
  nino: [
    "M10 16c.5.3 1.2.5 2 .5s1.5-.2 2-.5",
    "M15 12h.01",
    "M19.38 6.813A9 9 0 0 1 20.8 10.2a2 2 0 0 1 0 3.6 9 9 0 0 1-17.6 0 2 2 0 0 1 0-3.6A9 9 0 0 1 12 3c2 0 3.5 1.1 3.5 2.5s-.9 2.5-2 2.5c-.8 0-1.5-.4-1.5-1",
    "M9 12h.01",
  ],
  // ojo: lucide/eye
  ojo: [
    "M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0",
    "M9.0 12.0a3.0 3.0 0 1 0 6.0 0a3.0 3.0 0 1 0 -6.0 0",
  ],
  // pais: lucide/map
  pais: [
    "M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z",
    "M15 5.764v15",
    "M9 3.236v15",
  ],
  // pensar: lucide/message-circle-question-mark
  pensar: [
    "M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719",
    "M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3",
    "M12 17h.01",
  ],
  // perdida: propio
  perdida: [
    "M8.9 11.4c-.8 0-1.5-.9-1.5-2s.7-2 1.5-2 1.5.9 1.5 2-.7 2-1.5 2Z",
    "M13.4 10.4c-.8 0-1.5-1-1.5-2.2s.7-2.2 1.5-2.2 1.5 1 1.5 2.2-.7 2.2-1.5 2.2Z",
    "M11.2 12.6c1.4 0 2.3 1.1 3 2.2.7 1 2 1.9 2 3.4 0 1.8-1.4 3-3 3-.9 0-1.5-.4-2.8-.4s-1.9.4-2.8.4c-1.6 0-3-1.2-3-3 0-1.5 1.3-2.4 2-3.4.7-1.1 1.6-2.2 3-2.2Z",
    "M17.4 8.4c0-1.3 1-2.2 2.2-2.2 1.2 0 2.2.9 2.2 2.1 0 1.6-2.2 1.7-2.2 3.3",
    "M19.6 14.1h.01",
  ],
  // perro: lucide/dog
  perro: [
    "M11.25 16.25h1.5L12 17z",
    "M16 14v.5",
    "M4.42 11.247A13.152 13.152 0 0 0 4 14.556C4 18.728 7.582 21 12 21s8-2.272 8-6.444a11.702 11.702 0 0 0-.493-3.309",
    "M8 14v.5",
    "M8.5 8.5c-.384 1.05-1.083 2.028-2.344 2.5-1.931.722-3.576-.297-3.656-1-.113-.994 1.177-6.53 4-7 1.923-.321 3.651.845 3.651 2.235A7.497 7.497 0 0 1 14 5.277c0-1.39 1.844-2.598 3.767-2.277 2.823.47 4.113 6.006 4 7-.08.703-1.725 1.722-3.656 1-1.261-.472-1.855-1.45-2.239-2.5",
  ],
  // personas: lucide/users
  personas: [
    "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",
    "M16 3.128a4 4 0 0 1 0 7.744",
    "M22 21v-2a4 4 0 0 0-3-3.87",
    "M5.0 7.0a4.0 4.0 0 1 0 8.0 0a4.0 4.0 0 1 0 -8.0 0",
  ],
  // prensa: lucide/newspaper
  prensa: [
    "M15 18h-5",
    "M18 14h-8",
    "M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-4 0v-9a2 2 0 0 1 2-2h2",
    "M11.0 6.0h6.0a1.0 1.0 0 0 1 1.0 1.0v2.0a1.0 1.0 0 0 1 -1.0 1.0h-6.0a1.0 1.0 0 0 1 -1.0 -1.0v-2.0a1.0 1.0 0 0 1 1.0 -1.0Z",
  ],
  // reloj: lucide/clock
  reloj: [
    "M2.0 12.0a10.0 10.0 0 1 0 20.0 0a10.0 10.0 0 1 0 -20.0 0",
    "M12 6v6l4 2",
  ],
  // sirena: lucide/siren
  sirena: [
    "M7 18v-6a5 5 0 1 1 10 0v6",
    "M5 21a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-1a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2z",
    "M21 12h1",
    "M18.5 4.5 18 5",
    "M2 12h1",
    "M12 2v1",
    "m4.929 4.929.707.707",
    "M12 12v6",
  ],
  // sismo: propio
  sismo: [
    "M3.4 10.6 12 3.6l8.6 7",
    "M5.4 12.2v7.1c0 .6.5 1.1 1.1 1.1h11c.6 0 1.1-.5 1.1-1.1v-7.1",
    "M12.8 12.4l-2.4 2.6 2.8 1.4-2 4",
  ],
  // sparkles: lucide/sparkles
  sparkles: [
    "M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z",
    "M20 2v4",
    "M22 4h-4",
    "M2.0 20.0a2.0 2.0 0 1 0 4.0 0a2.0 2.0 0 1 0 -4.0 0",
  ],
  // tiktok: trazo propio. La bolita, el tallo y el gancho — es el glifo
  // reconocible en versión de línea, para que case con el resto del set.
  tiktok: [
    "M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5",
  ],
  // transporte: lucide/car
  transporte: [
    "M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2",
    "M5.0 17.0a2.0 2.0 0 1 0 4.0 0a2.0 2.0 0 1 0 -4.0 0",
    "M9 17h6",
    "M15.0 17.0a2.0 2.0 0 1 0 4.0 0a2.0 2.0 0 1 0 -4.0 0",
  ],
  // ubicacion: lucide/map-pin
  ubicacion: [
    "M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0",
    "M9.0 10.0a3.0 3.0 0 1 0 6.0 0a3.0 3.0 0 1 0 -6.0 0",
  ],
  // web: lucide/globe
  web: [
    "M2.0 12.0a10.0 10.0 0 1 0 20.0 0a10.0 10.0 0 1 0 -20.0 0",
    "M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20",
    "M2 12h20",
  ],
  // whatsapp: propio
  whatsapp: [
    "M20.4 12c0 4.1-3.8 7.4-8.4 7.4-1 0-2-.2-2.9-.5l-4.9 1.5 1.6-4.2c-.8-1.2-1.2-2.6-1.2-4.2C4.6 7.9 8.4 4.6 13 4.6s7.4 3.3 7.4 7.4Z",
    "M9.7 9.4c.3-.2.7-.2.9.1l.8 1.1c.2.3.2.6 0 .9l-.4.5c.5 1 1.3 1.7 2.3 2.2l.5-.5c.2-.2.6-.3.9-.1l1.2.7c.3.2.4.6.2.9-.5.9-1.6 1.2-2.6.8-2-.8-3.6-2.4-4.4-4.4-.3-.9 0-1.8.6-2.2Z",
  ],
} as const;

export type NombreIcono = keyof typeof TRAZOS;

export const NOMBRES_ICONO = Object.keys(TRAZOS) as NombreIcono[];

export default function Icono({
  nombre,
  className = "h-[1em] w-[1em]",
  grosor = 2,
  bloque = false,
  titulo,
}: {
  nombre: NombreIcono;
  className?: string;
  grosor?: number;
  /**
   * Por defecto el icono se comporta como una palabra más: va en línea con el
   * texto y se apoya en su línea base. El preflight de Tailwind pone los `svg`
   * en `display: block`, así que sin esto cada icono se iría a un renglón
   * propio. Pon `bloque` cuando el icono va solo y centrado (estados vacíos).
   */
  bloque?: boolean;
  /** Si se omite, el icono es decorativo y se oculta a los lectores de pantalla. */
  titulo?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`${bloque ? "block" : "inline-block align-[-0.125em]"} ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth={grosor}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={titulo ? "img" : "presentation"}
      aria-label={titulo}
      aria-hidden={titulo ? undefined : true}
      focusable="false"
    >
      {TRAZOS[nombre].map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}
