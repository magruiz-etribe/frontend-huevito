import { DishTag } from "@/types/huevito";

const TAG_META: Record<
  DishTag,
  { label: string; emoji: string; tone: "good" | "warn" | "info" }
> = {
  vegano: { label: "Vegano", emoji: "🌱", tone: "good" },
  vegetariano: { label: "Vegetariano", emoji: "🥕", tone: "good" },
  "sin-gluten": { label: "Sin gluten", emoji: "🌾", tone: "good" },
  "sin-lacteos": { label: "Sin lácteos", emoji: "🥛", tone: "good" },
  picante: { label: "Picante", emoji: "🌶️", tone: "warn" },
  "contiene-alergenos": { label: "Contiene alérgenos", emoji: "⚠️", tone: "warn" },
  "contiene-huevo": { label: "Contiene huevo", emoji: "🥚", tone: "info" },
  "contiene-lacteos": { label: "Contiene lácteos", emoji: "🧀", tone: "info" },
  "contiene-gluten": { label: "Contiene gluten", emoji: "🍞", tone: "info" },
  "contiene-mariscos": { label: "Contiene mariscos", emoji: "🦐", tone: "info" },
  "contiene-frutos-secos": { label: "Frutos secos", emoji: "🥜", tone: "warn" },
};

export function DishTagBadge({ tag }: { tag: DishTag }) {
  const meta = TAG_META[tag];
  if (!meta) return null;
  const tones: Record<string, string> = {
    good: "bg-brand-cream text-brand-brown border-brand-olive/40",
    warn: "bg-brand-peach text-brand-brown border-brand-orange-deep/40",
    info: "bg-brand-cream-soft text-brand-brown border-brand-brown-soft/30",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs sm:text-sm font-semibold border ${tones[meta.tone]}`}
    >
      <span aria-hidden>{meta.emoji}</span>
      <span>{meta.label}</span>
    </span>
  );
}
