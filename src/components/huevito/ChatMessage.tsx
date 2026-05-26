import { ChatChip, ChatLink, ChatMessage as ChatMessageType } from "@/types/huevito";
import { openPdf } from "@/lib/pdfViewerStore";
import { ExternalLink, FileText } from "lucide-react";
import huevitoHero from "@/assets/huevito-hero.png";



interface ChatMessageProps {
  message: ChatMessageType;
  onChip?: (chip: ChatChip) => void;
  chipsDisabled?: boolean;
}

// Renderiza **negritas** y respeta saltos de línea, sin librería externa
function renderRich(text: string) {
  const lines = text.split("\n");
  return lines.map((line, lineIdx) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    return (
      <span key={lineIdx}>
        {parts.map((p, i) =>
          p.startsWith("**") && p.endsWith("**") ? (
            <strong key={i} className="font-bold">{p.slice(2, -2)}</strong>
          ) : (
            <span key={i}>{p}</span>
          ),
        )}
        {lineIdx < lines.length - 1 && <br />}
      </span>
    );
  });
}



export function ChatMessage({ message, onChip, chipsDisabled }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex gap-2.5 sm:gap-3 animate-fade-in ${isUser ? "flex-row-reverse" : ""}`}>
      {/* Avatar */}
      <div className="flex-shrink-0 mt-0.5">
        {isUser ? (
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-brand-brown text-white grid place-items-center font-bold text-sm shadow-soft">
            Tú
          </div>
        ) : (
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-brand-cream grid place-items-center overflow-hidden border border-huevito-border shadow-soft">
            <img src={huevitoHero} alt="Huevito" className="w-full h-full object-contain p-0.5" />
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className={`max-w-[85%] sm:max-w-[78%] flex flex-col gap-2 ${isUser ? "items-end" : "items-start"}`}>
        {/* Burbuja de texto */}
        {message.content && (
          <div
            className={`px-4 py-3 rounded-3xl text-base leading-relaxed break-words [overflow-wrap:anywhere] ${
              isUser
                ? "huevito-bubble-user rounded-br-md"
                : "huevito-bubble-bot rounded-bl-md"
            }`}
          >
            <p>{renderRich(message.content)}</p>
          </div>
        )}

        {/* Chips de respuesta rápida */}
        {message.chips && message.chips.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {message.chips.map((c, i) => (
              <button
                key={i}
                onClick={() => onChip?.(c)}
                disabled={chipsDisabled}
                className="px-4 py-2 rounded-full bg-white border-2 border-brand-orange/30 text-brand-brown text-sm font-semibold hover:bg-brand-cream hover:border-brand-orange transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-soft"
              >
                {c.label}
              </button>
            ))}
          </div>
        )}

        {/* Links (page / pdf) */}
        {message.links && message.links.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-1">
            {message.links.map((l, i) =>
              l && l.url ? <LinkButton key={i} link={l} /> : null
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function LinkButton({ link }: { link: ChatLink }) {
  const isPdf = link.type === "pdf";
  const handleClick = (e: React.MouseEvent) => {
    if (isPdf) {
      e.preventDefault();
      openPdf(link.url, link.label);
    }
    // si es page, dejamos comportamiento por defecto del <a>
  };

  return (
    <a
      href={link.url}
      target={isPdf ? undefined : "_blank"}
      rel="noopener noreferrer"
      onClick={handleClick}
      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-warm text-white text-sm font-semibold shadow-soft hover:scale-[1.02] active:scale-[0.98] transition-transform mt-1"
    >
      {isPdf ? <FileText className="w-4 h-4" /> : <ExternalLink className="w-4 h-4" />}
      {link.label || (isPdf ? "Ver PDF" : "Abrir enlace")}
    </a>
  );
}

