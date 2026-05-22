import huevitoHero from "@/assets/huevito-hero.png";

export function TypingIndicator() {
  return (
    <div className="flex gap-2.5 sm:gap-3 animate-fade-in">
      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-brand-cream grid place-items-center overflow-hidden border border-huevito-border shadow-soft flex-shrink-0">
        <img src={huevitoHero} alt="Huevito pensando" className="w-full h-full object-contain p-0.5 animate-wiggle" />
      </div>
      <div className="huevito-bubble-bot rounded-3xl rounded-bl-md px-5 py-4">
        <div className="huevito-typing flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-brand-orange/70" />
          <span className="w-2.5 h-2.5 rounded-full bg-brand-orange/70" />
          <span className="w-2.5 h-2.5 rounded-full bg-brand-orange/70" />
        </div>
      </div>
    </div>
  );
}
