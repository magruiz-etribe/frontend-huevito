import { useEffect, useRef } from "react";
import { X, RotateCcw } from "lucide-react";
import { useHuevitoChat } from "@/hooks/useHuevitoChat";
import { ChatMessage } from "./ChatMessage";
import { ChatInput, ChatInputHandle } from "./ChatInput";
import { TypingIndicator } from "./TypingIndicator";
import huevitoLogo from "@/assets/huevito-logo.png";
import { ChatChip } from "@/types/huevito";

interface HuevitoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HuevitoModal({ isOpen, onClose }: HuevitoModalProps) {
  const { messages, isLoading, sendMessage, reset } = useHuevitoChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<ChatInputHandle>(null);
  const wasLoadingRef = useRef(false);

  useEffect(() => {
    const prev = wasLoadingRef.current;
    wasLoadingRef.current = isLoading;
    if (prev && !isLoading && isOpen) {
      const t = window.setTimeout(() => inputRef.current?.focus(), 0);
      return () => clearTimeout(t);
    }
  }, [isLoading, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const t = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);
    return () => clearTimeout(t);
  }, [messages, isLoading, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleChip = (chip: ChatChip) => {
    sendMessage({ text: chip.value });
  };

  if (!isOpen) return null;

  return (
    <div className="huevito-modal-overlay" onClick={onClose}>
      <div
        className="huevito-modal huevito-modal-positioned fixed inset-0 sm:inset-auto sm:w-[min(580px,calc(100vw-3rem))] sm:h-[min(720px,calc(100vh-3rem))] sm:rounded-3xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Asistente Huevito"
      >
        {/* Header */}
        <header className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3 sm:py-4 bg-gradient-warm text-white border-b border-brand-orange-deep/20 flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white grid place-items-center p-1 flex-shrink-0 overflow-hidden ring-1 ring-white/60">
              <img src={huevitoLogo} alt="Huevito" className="w-full h-full object-contain rounded-full" />
            </div>
            <div className="min-w-0">
              <h2 className="font-display font-bold text-lg sm:text-xl leading-tight truncate">
                Huevito
              </h2>
              <div className="flex items-center gap-1.5 text-[12px] sm:text-[13px] text-white/90">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                Tu traductor de menú
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <button
              onClick={reset}
              aria-label="Reiniciar conversación"
              className="p-2.5 rounded-xl hover:bg-white/15 transition-colors"
              title="Empezar de nuevo"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              aria-label="Cerrar"
              className="p-2.5 rounded-xl hover:bg-white/15 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-3 sm:px-5 py-4 sm:py-6 space-y-4 sm:space-y-5 bg-huevito-bg">
          {(() => {
            let lastAssistantId: string | undefined;
            for (let i = messages.length - 1; i >= 0; i--) {
              if (messages[i].role === "assistant") {
                lastAssistantId = messages[i].id;
                break;
              }
            }
            return messages.map((m) => (
              <ChatMessage
                key={m.id}
                message={m}
                onChip={handleChip}
                chipsDisabled={isLoading || m.id !== lastAssistantId}
              />
            ));
          })()}
          {isLoading && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <ChatInput
          ref={inputRef}
          onSend={(p) => sendMessage(p)}
          disabled={isLoading}
        />
      </div>
    </div>
  );
}
