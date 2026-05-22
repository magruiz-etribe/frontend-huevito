import { useCallback, useState } from "react";
import { ChatMessage, GREETING_MESSAGES, QUICK_STARTERS, SendPayload } from "@/types/huevito";
import { sendToHuevito, resetHuevitoSession } from "@/lib/huevitoApi";
import { addTranslations } from "@/lib/translationsStore";

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function useHuevitoChat() {
  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    GREETING_MESSAGES.map((content, idx) => ({
      id: uid(),
      role: "assistant" as const,
      content,
      timestamp: new Date(),
      chips: idx === GREETING_MESSAGES.length - 1 ? QUICK_STARTERS : undefined,
    })),
  );
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(async (payload: SendPayload) => {
    const text = (payload.text || "").trim();
    if (!text && !payload.image) return;

    const userMsg: ChatMessage = {
      id: uid(),
      role: "user",
      content: text,
      image: payload.image,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);
    try {
      const res = await sendToHuevito(payload);
      const replies = res.replies.length ? res.replies : ["…"];
      const botMsgs: ChatMessage[] = replies.map((content, idx) => ({
        id: uid(),
        role: "assistant",
        content,
        chips: idx === replies.length - 1 ? res.chips : undefined,
        cards: idx === replies.length - 1 ? res.cards : undefined,
        flags: idx === replies.length - 1 ? res.flags : undefined,
        tags: idx === replies.length - 1 ? res.tags : undefined,
        links: idx === replies.length - 1 ? res.links ?? undefined : undefined,
        timestamp: new Date(),
      }));


      if (res.cards && res.cards.length > 0) addTranslations(res.cards);
      setMessages((prev) => [...prev, ...botMsgs]);
    } catch (e) {
      console.error("Huevito error:", e);
      setMessages((prev) => [
        ...prev,
        {
          id: uid(),
          role: "assistant",
          content:
            "Uy… algo salió mal de mi lado. ¿Lo intentamos otra vez en un momento?",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    resetHuevitoSession();
    setMessages(
      GREETING_MESSAGES.map((content, idx) => ({
        id: uid(),
        role: "assistant" as const,
        content,
        timestamp: new Date(),
        chips: idx === GREETING_MESSAGES.length - 1 ? QUICK_STARTERS : undefined,
      })),
    );
    setIsLoading(false);
  }, []);

  return { messages, isLoading, sendMessage, reset };
}
