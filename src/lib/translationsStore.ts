import { useSyncExternalStore } from "react";
import { DishCard } from "@/types/huevito";

let translations: DishCard[] = [];
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function keyOf(d: DishCard) {
  return (d.name_en || d.name_es || "").trim().toLowerCase();
}

export function addTranslations(cards: DishCard[]) {
  if (!cards || cards.length === 0) return;
  const map = new Map<string, DishCard>();
  for (const t of translations) map.set(keyOf(t), t);
  for (const c of cards) {
    const k = keyOf(c);
    if (!k) continue;
    map.set(k, c);
  }
  translations = Array.from(map.values());
  emit();
}

export function clearTranslations() {
  if (translations.length === 0) return;
  translations = [];
  emit();
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function getSnapshot() {
  return translations;
}

export function useTranslations(): DishCard[] {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
