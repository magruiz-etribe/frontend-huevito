export type DishTag =
  | "vegano"
  | "vegetariano"
  | "sin-gluten"
  | "sin-lacteos"
  | "picante"
  | "contiene-alergenos"
  | "contiene-huevo"
  | "contiene-lacteos"
  | "contiene-gluten"
  | "contiene-mariscos"
  | "contiene-frutos-secos";

export type ChatRole = "user" | "assistant";

export interface ChatChip {
  label: string;
  value: string;
}

export type SpicyLevel = "none" | "mild" | "medium" | "hot" | "very_hot";

export interface DishFlags {
  allergens?: string[] | boolean;
  gluten_free?: boolean;
  vegetarian?: boolean;
  vegan?: boolean;
  spicy_level?: SpicyLevel | string;
}

export interface DishCard {
  name_es: string;
  name_en: string;
  description_es?: string;
  description_en?: string;
  tags?: DishTag[];
  flags?: DishFlags;
  confidence?: number;
}

export interface ChatLink {
  label: string;
  url: string;
  type: "page" | "pdf" | string;
}

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  timestamp: Date;
  card?: DishCard;
  cards?: DishCard[];
  chips?: ChatChip[];
  flags?: DishFlags;
  tags?: DishTag[];
  links?: ChatLink[] | null;
}

export interface SendPayload {
  text?: string;
}

export interface AgentResponse {
  replies: string[];
  chips?: ChatChip[];
  card?: DishCard;
  cards?: DishCard[];
  flags?: DishFlags;
  tags?: DishTag[];
  links?: ChatLink[] | null;
  needsMoreInfo?: boolean;
}

export const GREETING_MESSAGES: string[] = [
  "¡Hola! Me llamo Huevito 🥚. Estoy listo para ayudarte a adaptar tu menú para hacerlo más amigable.",
  "Escribe el nombre del platillo. Huevito lo adapta y agrega información útil sobre ingredientes, alérgenos y restricciones alimenticias para que más personas puedan entenderlo y disfrutarlo. Dime, ¿Cómo puedo ayudarte hoy?",
];

export const GREETING_TEXT = GREETING_MESSAGES[0];

export const QUICK_STARTERS: ChatChip[] = [
  { label: "Ayúdame a adaptar mi platillo!", value: "Ayúdame a adaptar mi platillo!" },
  { label: "¿Cómo registrarme en Google Maps?", value: "Dime como registrarme en Google Maps" },
  { label: "¿Cómo registrarme en Yelp?", value: "Dime como registrarme en Yelp" },
  { label: "Dime como registrarme en TripAdvisor", value: "Dime como registrarme en TripAdvisor" },
];

// Mapea los flags del backend (en inglés) a tags visuales
export function flagsToTags(flags?: DishFlags): DishTag[] {
  if (!flags) return [];
  const tags: DishTag[] = [];
  if (flags.vegan) tags.push("vegano");
  if (flags.vegetarian && !flags.vegan) tags.push("vegetariano");
  if (flags.gluten_free) tags.push("sin-gluten");

  const spicy = flags.spicy_level;
  if (spicy && spicy !== "none") tags.push("picante");

  if (flags.allergens === true) tags.push("contiene-alergenos");
  const allergens = (Array.isArray(flags.allergens) ? flags.allergens : []).map((a) => a.toLowerCase());
  const has = (...keys: string[]) => keys.some((k) => allergens.includes(k));
  if (has("gluten", "wheat", "trigo")) tags.push("contiene-gluten");
  if (has("dairy", "milk", "lacteos", "lácteos", "leche")) tags.push("contiene-lacteos");
  if (has("egg", "eggs", "huevo")) tags.push("contiene-huevo");
  if (has("shellfish", "shrimp", "mariscos", "crustaceans")) tags.push("contiene-mariscos");
  if (has("nuts", "tree nuts", "peanuts", "sesame", "frutos secos", "ajonjolí", "ajonjoli"))
    tags.push("contiene-frutos-secos");
  return Array.from(new Set(tags));
}
