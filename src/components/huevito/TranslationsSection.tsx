import { ArrowRight, Sparkles } from "lucide-react";
import { useTranslations } from "@/lib/translationsStore";
import { DishTagBadge } from "./DishTagBadge";
import { SpicyMeter } from "./SpicyMeter";
import { DishCard, flagsToTags } from "@/types/huevito";

interface Props {
  onStart: () => void;
}

const EXAMPLE_DISHES: DishCard[] = [
  {
    name_es: "Enchiladas Suizas",
    name_en: "Swiss-Style Enchiladas",
    description_en:
      "Corn tortillas filled with chicken, bathed in a creamy tomatillo sauce and oven-gratinéed with melted cheese until golden.",
    flags: { allergens: true, gluten_free: false, vegetarian: false, vegan: false, spicy_level: "medium" },
  },
  {
    name_es: "Tacos al Pastor",
    name_en: "Pastor-Style Tacos",
    description_en:
      "Marinated pork cooked on a vertical spit, served on corn tortillas with pineapple, onion and cilantro.",
    flags: { allergens: false, gluten_free: true, vegetarian: false, vegan: false, spicy_level: "hot" },
  },
  {
    name_es: "Guacamole con Totopos",
    name_en: "Guacamole with Tortilla Chips",
    description_en:
      "Fresh avocado dip with tomato, onion, cilantro and lime, served with crispy corn tortilla chips.",
    flags: { allergens: false, gluten_free: true, vegetarian: true, vegan: true, spicy_level: "mild" },
  },
  {
    name_es: "Chiles en Nogada",
    name_en: "Chiles in Walnut Sauce",
    description_en:
      "Poblano peppers stuffed with picadillo, topped with a creamy walnut sauce and pomegranate seeds.",
    flags: { allergens: true, gluten_free: true, vegetarian: false, vegan: false, spicy_level: "mild" },
  },
];

export function TranslationsSection({ onStart }: Props) {
  const translations = useTranslations();
  const hasItems = translations.length > 0;
  const items = hasItems ? translations : EXAMPLE_DISHES;

  return (
    <section id="ejemplos" className="max-w-6xl mx-auto mt-20 sm:mt-28">
      <h2 className="font-display text-3xl sm:text-4xl text-brand-brown text-center font-bold">
        {hasItems ? (
          <>Tus <span className="text-brand-orange">traducciones</span></>
        ) : (
          <>Ejemplos de <span className="text-brand-orange">traducciones</span></>
        )}
      </h2>
      <p className="text-center text-brand-brown-soft mt-3 text-lg max-w-2xl mx-auto">
        {hasItems
          ? "Aquí aparecen los platillos que has adaptado con Huevito, listos para hacer tu menú más accesible."
          : "Te mostramos algunos ejemplos mientras creas los tuyos. En cuanto adaptes un platillo con Huevito, esta sección se actualizará con tus traducciones."}
      </p>

      {!hasItems && (
        <div className="mt-6 mx-auto max-w-2xl flex items-start gap-3 rounded-2xl bg-brand-cream border border-huevito-border px-4 py-3">
          <Sparkles className="w-5 h-5 text-brand-orange flex-shrink-0 mt-0.5" />
          <p className="text-sm text-brand-brown-soft">
            <span className="font-semibold text-brand-brown">Estos son ejemplos.</span>{" "}
            Cuando adaptes tu primer platillo, esta sección reemplazará los ejemplos por tus traducciones reales.
          </p>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-5 sm:gap-6 mt-8">
        {items.map((dish, idx) => {
          const tags = dish.tags && dish.tags.length > 0 ? dish.tags : flagsToTags(dish.flags);
          return (
            <article
              key={`${dish.name_en}-${idx}`}
              className="card-warm p-5 sm:p-6 relative"
            >
              {!hasItems && (
                <span className="absolute top-3 right-3 text-[10px] uppercase tracking-wide font-bold px-2 py-1 rounded-full bg-brand-cream text-brand-brown-soft border border-huevito-border">
                  Ejemplo
                </span>
              )}
              <div className="flex items-start gap-3">
                <span className="text-3xl" aria-hidden>🍽️</span>
                <div className="flex-1 pr-16">
                  <h3 className="font-display text-xl text-brand-brown font-bold leading-tight">
                    {dish.name_en || dish.name_es}
                  </h3>
                  {dish.name_es && dish.name_en && dish.name_es !== dish.name_en && (
                    <p className="text-brand-orange font-semibold">{dish.name_es}</p>
                  )}
                </div>
              </div>
              {dish.description_en && (
                <p className="text-brand-brown-soft italic mt-3 text-[15px]">{dish.description_en}</p>
              )}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {tags.map((t) => <DishTagBadge key={t} tag={t} />)}
                </div>
              )}
              <div className="mt-3">
                <SpicyMeter level={dish.flags?.spicy_level} />
              </div>
            </article>
          );
        })}
      </div>

      {!hasItems && (
        <div className="mt-8 text-center">
          <button
            onClick={onStart}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-warm text-white font-bold shadow-warm hover:scale-[1.02] active:scale-[0.98] transition-transform"
          >
            Adaptar mi primer platillo
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </section>
  );
}
