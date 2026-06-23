import { useState } from "react";
import { X, Star } from "lucide-react";
import { toast } from "sonner";
import huevitoLogo from "@/assets/huevito-logo.png";
import { postRating } from "@/lib/http";
import { getCurrentSessionId } from "@/lib/huevitoApi";

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitted: () => void;
}

export function RatingModal({ isOpen, onClose, onSubmitted }: RatingModalProps) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comentario, setComentario] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const canSubmit = rating > 0 && !submitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await postRating({
        rating,
        comentario: comentario.trim() ? comentario.trim().slice(0, 500) : undefined,
        session_id: getCurrentSessionId(),
      });
      toast.success("¡Gracias por tu calificación!", {
        description: "Tu opinión nos ayuda a mejorar a Huevito.",
      });
      setRating(0);
      setHover(0);
      setComentario("");
      onSubmitted();
    } catch (err) {
      console.warn("[postRating] failed:", err);
      toast.error("No pudimos enviar tu calificación", {
        description: "Inténtalo de nuevo en un momento.",
      });
    } finally {
      setSubmitting(false);
    }
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

          {/* Comentario */}
          <div>
            <label htmlFor="comentario" className="block text-sm font-semibold text-brand-brown mb-1.5">
              Comentario <span className="font-normal text-brand-brown-soft">(opcional)</span>
            </label>
            <textarea
              id="comentario"
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              placeholder="Ej. Muy útil, me ayudó a adaptar el menú"
              maxLength={500}
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl border-2 border-huevito-border bg-white text-brand-brown placeholder:text-brand-brown-soft/60 focus:outline-none focus:border-brand-orange transition-colors resize-none"
            />
            <div className="text-right text-xs text-brand-brown-soft mt-1">
              {comentario.length}/500
            </div>
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
