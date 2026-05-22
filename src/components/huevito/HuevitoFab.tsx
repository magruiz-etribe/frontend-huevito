import huevitoLogo from "@/assets/huevito-logo.png";

interface HuevitoFabProps {
  onClick: () => void;
  showPulse?: boolean;
}

export function HuevitoFab({ onClick, showPulse = true }: HuevitoFabProps) {
  return (
    <button
      onClick={onClick}
      aria-label="Abrir asistente Huevito"
      className={`huevito-fab ${showPulse ? "huevito-fab-pulse" : ""} fixed bottom-5 right-5 sm:bottom-6 sm:right-6 w-[78px] h-[78px] sm:w-[88px] sm:h-[88px] rounded-full flex items-center justify-center p-0 overflow-hidden`}
      style={{ zIndex: 2147483645 }}
    >
      <img
        src={huevitoLogo}
        alt="Huevito"
        className="w-full h-full object-contain p-1.5 select-none pointer-events-none"
        draggable={false}
      />
    </button>
  );
}
