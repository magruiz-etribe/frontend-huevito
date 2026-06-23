import { AgentResponse, ChatChip, ChatLink, DishCard, DishFlags, SendPayload, flagsToTags } from "@/types/huevito";
import { auth } from "./firebase";
import { getMenus, postMenus, type MenuItem, type MenuItemInput } from "./http";
import { addTranslations } from "./translationsStore";

const API_URL = import.meta.env.VITE_HUEVITO_API_URL;

const SESSION_ID_TIMEZONE = "America/Mexico_City";

function generateHuevitoSessionId(): string {
  const now = new Date();
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: SESSION_ID_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(now);
  const pick = (t: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === t)?.value ?? "";
  const y = pick("year");
  const mo = pick("month");
  const da = pick("day");
  const h = pick("hour");
  const mi = pick("minute");
  const se = pick("second");
  const rnd = new Uint8Array(2);
  crypto.getRandomValues(rnd);
  const suffix = Array.from(rnd, (b) => b.toString(16).padStart(2, "0")).join("");
  return `${y}${mo}${da}_${h}${mi}${se}_${suffix}`;
}

let sessionId: string = generateHuevitoSessionId();
let currentDishes: string[] = [];
let currentFlags: DishFlags | undefined = undefined;
let currentMenuDelDia: BackendDish[] = [];

export function resetHuevitoSession() {
  sessionId = generateHuevitoSessionId();
  currentDishes = [];
  currentFlags = undefined;
  currentMenuDelDia = [];
}

export function getCurrentSessionId(): string {
  return sessionId;
}

function menuItemToDishCard(m: MenuItem): DishCard {
  const flags = m.flags as DishFlags | undefined;
  return {
    name_es: m.name_es,
    name_en: m.name_en,
    description_es: m.description_es,
    description_en: m.description_en,
    flags,
    tags: flagsToTags(flags),
  };
}

/** Trae el menú completo del cliente desde el backend y lo carga en el store. */
export async function loadMenuFromBackend(): Promise<void> {
  if (!auth.currentUser) return;
  try {
    const res = await getMenus();
    const items = res?.items ?? [];
    if (items.length === 0) return;
    addTranslations(items.map(menuItemToDishCard));
  } catch (err) {
    console.warn("[loadMenuFromBackend] failed:", err);
  }
}

/** Envía el menú adaptado actual al backend (si hay) y recarga el historial completo. */
export async function syncCurrentMenuToBackend(): Promise<void> {
  const items: MenuItemInput[] = currentMenuDelDia
    .filter((d) => d && d.name_es && d.name_en)
    .map((d) => ({
      name_es: d.name_es as string,
      name_en: d.name_en as string,
      description_es: d.description_es,
      description_en: d.description_en,
      flags: d.flags as MenuItemInput["flags"],
    }));
  try {
    if (items.length > 0) await postMenus(items);
  } catch (err) {
    console.warn("[syncCurrentMenuToBackend] failed:", err);
  }
  await loadMenuFromBackend();
}

interface BackendDish {
  name_es?: string;
  name_en?: string;
  description_es?: string;
  description_en?: string;
  flags?: DishFlags;
}

interface BackendResponse {
  response?: string | string[];
  reply?: string;
  current_dishes?: string[];
  buttons?: string[];
  session_id?: string;
  flags?: DishFlags;
  menu_del_dia?: BackendDish[];
  links?: ChatLink[] | null;
  link?: ChatLink | null;
}



export async function sendToHuevito(payload: SendPayload): Promise<AgentResponse> {
  const body: Record<string, unknown> = {
    session_id: sessionId,
    message: payload.text || "",
    current_dishes: currentDishes,
    flags: currentFlags ?? {},
    menu_del_dia: currentMenuDelDia,
  };

  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`Huevito API error ${res.status}`);
  }

  const data = (await res.json()) as BackendResponse;

  if (Array.isArray(data.current_dishes)) currentDishes = data.current_dishes;
  if (data.flags) currentFlags = data.flags;
  const incomingMenu = Array.isArray(data.menu_del_dia) ? data.menu_del_dia : [];
  const prevMenuKey = JSON.stringify(currentMenuDelDia);
  const newMenuKey = JSON.stringify(incomingMenu);
  const isNewMenu = incomingMenu.length > 0 && newMenuKey !== prevMenuKey;
  if (incomingMenu.length > 0) currentMenuDelDia = incomingMenu;
  if (data.session_id) sessionId = data.session_id;

  // Si hay menú nuevo y el usuario está autenticado, persiste en backend y refresca historial.
  if (isNewMenu && auth.currentUser) {
    const items: MenuItemInput[] = incomingMenu
      .filter((d) => d && d.name_es && d.name_en)
      .map((d) => ({
        name_es: d.name_es as string,
        name_en: d.name_en as string,
        description_es: d.description_es,
        description_en: d.description_en,
        flags: d.flags as MenuItemInput["flags"],
      }));
    if (items.length > 0) {
      void postMenus(items)
        .catch((err) => console.warn("[postMenus] failed:", err))
        .then(() => loadMenuFromBackend());
    }
  }

  const replies = (Array.isArray(data.response)
    ? data.response
    : data.response
    ? [data.response]
    : data.reply
    ? [data.reply]
    : []
  ).filter((s) => typeof s === "string" && s.trim().length > 0);

  const chips: ChatChip[] | undefined = data.buttons?.length
    ? data.buttons.map((b) => ({ label: b, value: b }))
    : undefined;

  
  const cards = isNewMenu
    ? incomingMenu
        .filter((d) => d && (d.name_es || d.name_en))
        .map((d) => ({
          name_es: d.name_es ?? d.name_en ?? "",
          name_en: d.name_en ?? d.name_es ?? "",
          description_es: d.description_es,
          description_en: d.description_en,
          flags: d.flags,
          tags: flagsToTags(d.flags),
        }))
    : [];

  return {
    replies: replies.length ? replies : ["…"],
    chips,
    cards: cards.length ? cards : undefined,
    flags: isNewMenu ? data.flags : undefined,
    tags: isNewMenu && data.flags ? flagsToTags(data.flags) : undefined,
    links: (() => {
      const arr = Array.isArray(data.links)
        ? data.links
        : data.link
        ? [data.link]
        : [];
      const filtered = arr.filter((l): l is ChatLink => !!l && !!l.url);
      return filtered.length ? filtered : undefined;
    })(),
  };
}


