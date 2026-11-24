import { categoryLabels } from "../../../scripts/icon-expansion/categories.ts";
import type { Locale } from "./paths.ts";

export const esCategoryLabels: Record<string, string> = {
  animals: "Animales",
  buildings: "Edificios y hogar",
  communication: "Comunicación",
  data: "Datos y gráficos",
  design: "Diseño y maquetación",
  development: "Desarrollo",
  devices: "Dispositivos",
  documents: "Documentos y archivos",
  finance: "Comercio y finanzas",
  food: "Comida y bebida",
  games: "Juegos",
  health: "Salud",
  interface: "Interfaz",
  media: "Medios y audio",
  nature: "Naturaleza",
  navigation: "Mapas y navegación",
  people: "Personas y expresiones",
  photography: "Fotografía",
  science: "Ciencia y matemáticas",
  security: "Seguridad y privacidad",
  sport: "Deportes",
  symbols: "Símbolos",
  text: "Texto y tipografía",
  time: "Tiempo y calendario",
  transport: "Viajes y transporte",
  weather: "Clima",
  other: "Otros",
  arrows: "Flechas y direcciones",
  audio: "Música y audio",
  brands: "Moneda y pagos",
  calendar: "Fechas y agenda",
  connectivity: "Redes y conectividad",
  controls: "Controles de reproducción",
  desktop: "Ordenadores y teclados",
  fitness: "Fitness y entrenamiento",
  gamesTable: "Cartas, dados y juegos de mesa",
  geography: "Paisajes y geografía",
  grids: "Cuadrículas y alineación",
  messaging: "Correo y mensajería",
  mobile: "Teléfonos y wearables",
  outdoor: "Aire libre y ocio",
  places: "Puntos de interés",
  rail: "Tren y transporte público",
  shopping: "Compras y envíos",
  space: "Espacio y astronomía",
  status: "Estado y alertas",
  tools: "Herramientas y mantenimiento",
  video: "Vídeo y cine",
  wind: "Viento y pronósticos",
};

const missing = Object.keys(categoryLabels).filter((id) => !esCategoryLabels[id]);
const extra = Object.keys(esCategoryLabels).filter((id) => !categoryLabels[id]);
if (missing.length || extra.length) {
  throw new Error(`Category translations out of sync. Missing: ${missing.join(", ") || "none"}. Extra: ${extra.join(", ") || "none"}.`);
}

export function categoryLabel(locale: Locale, id: string): string {
  return (locale === "es" ? esCategoryLabels[id] : categoryLabels[id]) ?? categoryLabels[id] ?? id;
}
