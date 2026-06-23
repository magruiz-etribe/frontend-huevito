import { X, UserPlus, History } from "lucide-react";
import huevitoLogo from "@/assets/huevito-logo.png";

interface SignupPromptModalProps {
  isOpen: boolean;
  onRegister: () => void;
  onDismiss: () => void;
}

export function SignupPromptModal({ isOpen, onRegister, onDismiss }: SignupPromptModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
      onClick={onDismiss}
      role="dialog"
      aria-modal="true"
      aria-label="No pierdas tus platillos adaptados"
    >
      <div
        className="bg-white rounded-3xl shadow-warm w-full max-w-md overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-warm text-white px-6 py-5 flex items-center gap-3 relative">
          <div className="w-12 h-12 rounded-full bg-white grid place-items-center p-1 flex-shrink-0 ring-1 ring-white/60">
            <img src={huevitoLogo} alt="Huevito" className="w-full h-full object-contain rounded-full" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-display font-bold text-xl leading-tight">¡No pierdas tus platillos!</h2>
            <p className="text-[13px] text-white/90">Guarda tus adaptaciones registrándote</p>
          </div>
          <button
            onClick={onDismiss}
            aria-label="Cerrar"
            className="p-2 rounded-xl hover:bg-white/15 transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6 space-y-5">
          <div className="flex items-start gap-3 bg-brand-cream/60 border border-huevito-border rounded-2xl p-4">
            <span className="w-10 h-10 rounded-xl bg-gradient-warm grid place-items-center text-white flex-shrink-0">
              <History className="w-5 h-5" />
            </span>
            <p className="text-sm text-brand-brown leading-relaxed">
              Regístrate muy fácil y tendrás acceso al <span className="font-semibold">historial de tus platillos adaptados</span> para que no los pierdas y puedas consultarlos cuando quieras.
            </p>
          </div>

          <div className="flex flex-col gap-2.5">
            <button
              type="button"
              onClick={onRegister}
              className="w-full py-3 rounded-2xl bg-gradient-warm text-white font-bold shadow-warm hover:scale-[1.01] active:scale-[0.99] transition-transform inline-flex items-center justify-center gap-2"
            >
              <UserPlus className="w-5 h-5" />
              Registrarme ahora
            </button>
            <button
              type="button"
              onClick={onDismiss}
              className="w-full py-3 rounded-2xl bg-white border-2 border-huevito-border text-brand-brown font-semibold hover:bg-brand-cream transition-colors"
            >
              Ahora no, seguir en el chat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
