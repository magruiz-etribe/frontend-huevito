import { useState } from "react";
import { X, Star } from "lucide-react";
import { toast } from "sonner";
import huevitoLogo from "@/assets/huevito-logo.png";

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitted: () => void;
}

export function RatingModal({ isOpen, onClose, onSubmitted }: RatingModalProps) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [fondita, setFondita] = useState("");
  const [mercado, setMercado] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const canSubmit = rating > 0 && fondita.trim().length > 0 && mercado.trim().length > 0 && !submitting;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    // Mockup: simular envío
    setTimeout(() => {
      toast.success("¡Gracias por contestar la encuesta!", {
        description: "Tu respuesta fue enviada con éxito.",
      });
      setRating(0);
      setHover(0);
      setFondita("");
      setMercado("");
      setSubmitting(false);
      onSubmitted();
    }, 400);
  };

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Califica a Huevito"
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
            <h2 className="font-display font-bold text-xl leading-tight">Califica a Huevito</h2>
            <p className="text-[13px] text-white/90">Cuéntanos cómo te está ayudando</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="p-2 rounded-xl hover:bg-white/15 transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5">
          {/* Estrellas */}
          <div>
            <label className="block text-sm font-semibold text-brand-brown mb-2">
              ¿Cómo calificas tu experiencia?
            </label>
            <div className="flex items-center justify-center gap-1.5">
              {[1, 2, 3, 4, 5].map((n) => {
                const active = (hover || rating) >= n;
                return (
                  <button
                    key={n}
                    type="button"
                    onMouseEnter={() => setHover(n)}
                    onMouseLeave={() => setHover(0)}
                    onClick={() => setRating(n)}
                    aria-label={`${n} estrella${n > 1 ? "s" : ""}`}
                    className="p-1 transition-transform hover:scale-110 active:scale-95"
                  >
                    <Star
                      className="w-9 h-9 transition-colors"
                      fill={active ? "#F59E0B" : "none"}
                      color={active ? "#F59E0B" : "#D6C5B0"}
                      strokeWidth={2}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Nombre fondita */}
          <div>
            <label htmlFor="fondita" className="block text-sm font-semibold text-brand-brown mb-1.5">
              Nombre de tu fondita
            </label>
            <input
              id="fondita"
              type="text"
              value={fondita}
              onChange={(e) => setFondita(e.target.value)}
              placeholder="Ej. Cocina de la abuela"
              className="w-full px-4 py-2.5 rounded-xl border-2 border-huevito-border bg-white text-brand-brown placeholder:text-brand-brown-soft/60 focus:outline-none focus:border-brand-orange transition-colors"
              maxLength={80}
            />
          </div>

          {/* Mercado */}
          <div>
            <label htmlFor="mercado" className="block text-sm font-semibold text-brand-brown mb-1.5">
              Mercado donde se localiza
            </label>
            <input
              id="mercado"
              type="text"
              value={mercado}
              onChange={(e) => setMercado(e.target.value)}
              placeholder="Ej. Mercado de Coyoacán"
              className="w-full px-4 py-2.5 rounded-xl border-2 border-huevito-border bg-white text-brand-brown placeholder:text-brand-brown-soft/60 focus:outline-none focus:border-brand-orange transition-colors"
              maxLength={80}
            />
          </div>

          {/* Enviar */}
          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full py-3 rounded-2xl bg-gradient-warm text-white font-bold shadow-warm hover:scale-[1.01] active:scale-[0.99] transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {submitting ? "Enviando..." : "Enviar"}
          </button>
        </form>
      </div>
    </div>
  );
}
