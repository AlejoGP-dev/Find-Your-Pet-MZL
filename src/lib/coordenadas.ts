/**
 * Coordenadas aproximadas del centro de cada municipio.
 *
 * Sirven para dos cosas:
 *  1. Darle una ubicación a los reportes que se publicaron sin ella (todos los
 *     que ya existían antes de esta función). Sin esto, «cerca de mí» habría
 *     salido vacío durante semanas.
 *  2. Ser el respaldo cuando quien publica no quiere compartir su ubicación
 *     exacta, que es una decisión perfectamente razonable.
 *
 * Son el CENTRO del casco urbano, no la dirección de nadie. Un reporte con
 * precisión «ciudad» dice «en algún punto de Manizales», no «en esta esquina».
 *
 * La lista no cubre los 1.121 municipios: cubre las capitales, el Eje Cafetero
 * completo —que es donde está el grueso de los reportes por el sismo— y los
 * municipios grandes del resto del país. Un reporte en un municipio que no
 * esté acá simplemente no participa en el filtro por cercanía; sigue
 * apareciendo en el listado normal como siempre.
 *
 * A propósito quedaron por fuera los nombres que se repiten en varios
 * departamentos (Córdoba, Caldas, Santuario, Barbosa, Buenavista, Balboa): la
 * base guarda el nombre del municipio, no el departamento, y adivinar mal
 * pondría un reporte a 200 km de donde está. En una app de mascotas perdidas,
 * decirle a alguien «hay una a 1 km» cuando está en otro departamento es peor
 * que no decirle nada.
 */

export type Punto = { lat: number; lng: number };

/** nombre oficial del municipio -> [lat, lng] */
export const COORDENADAS: Record<string, [number, number]> = {
  // --- Eje Cafetero: la zona del sismo, la que más importa acá -------------
  Manizales: [5.0703, -75.5138],
  Villamaría: [5.0447, -75.5122],
  Chinchiná: [4.9833, -75.6069],
  Neira: [5.1664, -75.5203],
  Palestina: [5.0192, -75.6217],
  Anserma: [5.2372, -75.7836],
  Riosucio: [5.4222, -75.7031],
  Salamina: [5.4053, -75.4878],
  Aguadas: [5.6106, -75.455],
  Pácora: [5.5281, -75.4611],
  Aranzazu: [5.2708, -75.4917],
  Filadelfia: [5.2958, -75.5619],
  Marmato: [5.4744, -75.5992],
  Supía: [5.4531, -75.6519],
  "La Merced": [5.3856, -75.5461],
  "La Dorada": [5.45, -74.6667],
  Viterbo: [5.0625, -75.8722],
  Belalcázar: [4.9942, -75.8125],
  "Risaralda": [5.1622, -75.7658],
  "San José": [5.0819, -75.7889],
  Manzanares: [5.2531, -75.155],
  Pensilvania: [5.3831, -75.1611],
  Marquetalia: [5.2969, -75.0533],
  Samaná: [5.4139, -74.9922],
  Victoria: [5.3167, -74.9114],
  Norcasia: [5.5747, -74.8889],
  Marulanda: [5.2839, -75.26],

  Pereira: [4.8133, -75.6961],
  Dosquebradas: [4.8354, -75.6746],
  "Santa Rosa de Cabal": [4.8694, -75.6247],
  "La Virginia": [4.8994, -75.8817],
  Marsella: [4.9364, -75.7397],
  "Belén de Umbría": [5.2006, -75.8672],
  Quinchía: [5.3406, -75.7275],
  Apía: [5.1064, -75.9414],
  "La Celia": [5.0006, -76.0025],
  Guática: [5.3161, -75.7986],
  Mistrató: [5.2967, -75.8811],
  "Pueblo Rico": [5.2225, -76.0328],

  Armenia: [4.5339, -75.6811],
  Calarcá: [4.5231, -75.6444],
  Montenegro: [4.5647, -75.7492],
  Circasia: [4.6169, -75.6356],
  "La Tebaida": [4.4519, -75.7864],
  Quimbaya: [4.6222, -75.7639],
  Filandia: [4.6742, -75.6603],
  Salento: [4.6375, -75.5706],
  Génova: [4.2069, -75.7897],
  Pijao: [4.3336, -75.7036],

  // --- Capitales y ciudades grandes ---------------------------------------
  "Bogotá": [4.711, -74.0721],
  "Medellín": [6.2442, -75.5812],
  Cali: [3.4516, -76.532],
  Barranquilla: [10.9685, -74.7813],
  Cartagena: [10.391, -75.4794],
  "Cúcuta": [7.8939, -72.5078],
  Bucaramanga: [7.1193, -73.1227],
  "Ibagué": [4.4389, -75.2322],
  "Santa Marta": [11.2408, -74.199],
  Villavicencio: [4.142, -73.6266],
  Pasto: [1.2136, -77.2811],
  "Montería": [8.7479, -75.8814],
  Neiva: [2.9273, -75.2819],
  "Popayán": [2.4448, -76.6147],
  "Quibdó": [5.6947, -76.6611],
  Valledupar: [10.4631, -73.2532],
  Sincelejo: [9.3047, -75.3978],
  Riohacha: [11.5444, -72.9072],
  Tunja: [5.5353, -73.3678],
  Florencia: [1.6144, -75.6062],
  Yopal: [5.3378, -72.3958],
  Arauca: [7.0844, -70.7592],
  Mocoa: [1.1522, -76.6489],
  "San Andrés": [12.5847, -81.7006],
  Leticia: [-4.2153, -69.9406],
  Inírida: [3.8653, -67.9239],
  "Puerto Carreño": [6.1889, -67.4856],
  "San José del Guaviare": [2.5708, -72.6386],
  Mitú: [1.2528, -70.2339],

  // --- Áreas metropolitanas y municipios grandes ---------------------------
  Soacha: [4.5794, -74.2168],
  Soledad: [10.9172, -74.7669],
  Bello: [6.3378, -75.5606],
  "Itagüí": [6.1719, -75.6112],
  Envigado: [6.1759, -75.5914],
  Sabaneta: [6.1514, -75.6156],
  "La Estrella": [6.1578, -75.6428],
  Copacabana: [6.3486, -75.5083],
  Girardota: [6.3789, -75.4444],
  Rionegro: [6.1553, -75.3742],
  "Apartadó": [7.8831, -76.6256],
  Turbo: [8.0942, -76.7281],
  Palmira: [3.5394, -76.3036],
  Buenaventura: [3.8801, -77.0312],
  "Tuluá": [4.0847, -76.1954],
  Cartago: [4.7469, -75.9117],
  "Jamundí": [3.2611, -76.5397],
  Yumbo: [3.5847, -76.4919],
  Buga: [3.9006, -76.2978],
  Floridablanca: [7.0654, -73.0868],
  "Girón": [7.0736, -73.1697],
  Piedecuesta: [6.9878, -73.05],
  Barrancabermeja: [7.0653, -73.8547],
  "Ocaña": [8.2372, -73.3561],
  Duitama: [5.8244, -73.0331],
  Sogamoso: [5.7147, -72.9339],
  Girardot: [4.3047, -74.8019],
  "Fusagasugá": [4.3372, -74.3644],
  "Zipaquirá": [5.0221, -74.0044],
  "Facatativá": [4.8144, -74.3547],
  "Chía": [4.8619, -74.0578],
  Mosquera: [4.7058, -74.2306],
  Madrid: [4.7325, -74.2647],
  Funza: [4.7167, -74.2117],
  Espinal: [4.1533, -74.8853],
  Melgar: [4.2044, -74.6414],
  Honda: [5.2078, -74.7444],
  "Magangué": [9.2417, -74.755],
  Turbaco: [10.34, -75.4139],
  "Ciénaga": [11.0072, -74.2472],
  Maicao: [11.3778, -72.2394],
  Ipiales: [0.8256, -77.6444],
  Tumaco: [1.7986, -78.8156],
  "Malambo": [10.8592, -74.7739],
  Sabanalarga: [10.6303, -74.9214],
  "Puerto Colombia": [10.9944, -74.9539],
};

/** La coordenada del municipio, si la conocemos. */
export function coordenadaDeCiudad(nombre: string): Punto | null {
  const par = COORDENADAS[nombre];
  return par ? { lat: par[0], lng: par[1] } : null;
}

/** Cuántos municipios tienen coordenada. Para textos y para las pruebas. */
export const MUNICIPIOS_CON_COORDENADA = Object.keys(COORDENADAS).length;
