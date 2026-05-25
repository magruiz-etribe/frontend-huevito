import { useRef, useState, KeyboardEvent, forwardRef, useImperativeHandle, useEffect } from "react";
import { Send } from "lucide-react";

interface ChatInputProps {
  onSend: (payload: { text?: string }) => void;
  disabled?: boolean;
}

export interface ChatInputHandle {
  focus: () => void;
}

const MAX_TEXT = 400;

export const ChatInput = forwardRef<ChatInputHandle, ChatInputProps>(({ onSend, disabled }, ref) => {
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
  }));

  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 128) + "px";
  }, [text]);

  const handleSend = () => {
    const t = text.trim();
    if (!t || disabled) return;
    onSend({ text: t || undefined });
    setText("");
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-huevito-border bg-huevito-surface px-3 sm:px-5 py-3 sm:py-4">
      <div className="flex items-end gap-2 sm:gap-3">
        <div className="flex-1 relative">
          <textarea
            ref={inputRef}
            value={text}
            onChange={(e) => {
              setText(e.target.value.slice(0, MAX_TEXT));
              const el = e.currentTarget;
              el.style.height = "auto";
              el.style.height = Math.min(el.scrollHeight, 128) + "px";
            }}
            onKeyDown={onKeyDown}
            disabled={disabled}
            rows={1}
            placeholder="Escribe el nombre del platillo…"
            className="huevito-input w-full resize-none px-4 py-3 sm:py-3.5 rounded-2xl text-base leading-snug disabled:opacity-50 max-h-32 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          />
        </div>

        <button
          onClick={handleSend}
          disabled={disabled || !text.trim()}
          aria-label="Enviar mensaje"
          className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-warm text-white grid place-items-center transition-transform hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100 shadow-warm"
        >
          <Send className="w-6 h-6" />
        </button>
      </div>

      <p className="text-[11px] text-huevito-text-muted mt-2 px-1 hidden sm:block">
        Pulsa <kbd className="px-1.5 py-0.5 rounded bg-brand-cream border border-huevito-border text-[10px]">Enter</kbd> para enviar · <kbd className="px-1.5 py-0.5 rounded bg-brand-cream border border-huevito-border text-[10px]">Shift+Enter</kbd> para salto de línea
      </p>
    </div>
  );
});

ChatInput.displayName = "ChatInput";
