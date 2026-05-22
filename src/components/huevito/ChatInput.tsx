import { useRef, useState, KeyboardEvent, forwardRef, useImperativeHandle, ChangeEvent, useEffect } from "react";
import { Send, ImagePlus, X, Camera, Image as ImageIcon } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface ChatInputProps {
  onSend: (payload: { text?: string; image?: string }) => void;
  disabled?: boolean;
}

export interface ChatInputHandle {
  focus: () => void;
  triggerUpload: () => void;
}

const MAX_TEXT = 400;

export const ChatInput = forwardRef<ChatInputHandle, ChatInputProps>(({ onSend, disabled }, ref) => {
  const [text, setText] = useState("");
  const [imageData, setImageData] = useState<string | null>(null);
  const [showSourceMenu, setShowSourceMenu] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
    triggerUpload: () => {
      if (isMobile) setShowSourceMenu(true);
      else fileRef.current?.click();
    },
  }));

  useEffect(() => {
    if (!showSourceMenu) return;
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowSourceMenu(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [showSourceMenu]);

  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 128) + "px";
  }, [text]);

  const openCamera = () => {
    setShowSourceMenu(false);
    cameraRef.current?.click();
  };

  const openGallery = () => {
    setShowSourceMenu(false);
    fileRef.current?.click();
  };

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // permitir re-seleccionar la misma
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("La imagen es muy grande (máx. 5 MB).");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setImageData(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSend = () => {
    const t = text.trim();
    if ((!t && !imageData) || disabled) return;
    onSend({ text: t || undefined, image: imageData || undefined });
    setText("");
    setImageData(null);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-huevito-border bg-huevito-surface px-3 sm:px-5 py-3 sm:py-4">
      {imageData && (
        <div className="mb-3 flex items-center gap-3 p-2 rounded-2xl bg-huevito-surface-soft border border-huevito-border">
          <img src={imageData} alt="Vista previa" className="w-14 h-14 rounded-xl object-cover" />
          <span className="text-sm text-huevito-text-muted flex-1 truncate">Foto lista para enviar</span>
          <button
            onClick={() => setImageData(null)}
            className="p-2 rounded-lg hover:bg-brand-cream text-huevito-text-muted"
            aria-label="Quitar imagen"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      <div className="flex items-end gap-2 sm:gap-3">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handleFile}
          className="hidden"
        />
        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFile}
          className="hidden"
        />
        <div className="relative flex-shrink-0">
          <button
            onClick={() => {
              if (isMobile) setShowSourceMenu((v) => !v);
              else fileRef.current?.click();
            }}
            disabled={disabled}
            aria-label="Adjuntar foto del platillo"
            aria-haspopup={isMobile ? "menu" : undefined}
            aria-expanded={isMobile ? showSourceMenu : undefined}
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-brand-cream hover:bg-brand-peach text-brand-brown grid place-items-center transition-colors disabled:opacity-50 border-2 border-huevito-border"
          >
            <ImagePlus className="w-6 h-6" />
          </button>

          {showSourceMenu && (
            <div
              ref={menuRef}
              role="menu"
              className="absolute bottom-full left-0 mb-2 w-52 bg-huevito-surface border border-huevito-border rounded-2xl shadow-warm overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-2"
            >
              <button
                role="menuitem"
                onClick={openCamera}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-brand-cream text-huevito-text transition-colors"
              >
                <Camera className="w-5 h-5 text-brand-brown" />
                <span className="text-sm font-medium">Tomar foto</span>
              </button>
              <div className="h-px bg-huevito-border" />
              <button
                role="menuitem"
                onClick={openGallery}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-brand-cream text-huevito-text transition-colors"
              >
                <ImageIcon className="w-5 h-5 text-brand-brown" />
                <span className="text-sm font-medium">Elegir de galería</span>
              </button>
            </div>
          )}
        </div>

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
          disabled={disabled || (!text.trim() && !imageData)}
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
