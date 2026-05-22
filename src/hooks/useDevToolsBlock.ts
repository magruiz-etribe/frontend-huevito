import { useEffect } from "react";

/**
 * Bloquea acciones comunes de inspección del navegador:
 * - Clic derecho (menú contextual)
 * - F12
 * - Ctrl/Cmd + Shift + I / J / C
 * - Ctrl/Cmd + U (ver código fuente)
 * - Ctrl/Cmd + S (guardar página)
 *
 * Nota: Esto es una disuasión de UX, no una medida de seguridad real.
 * Cualquier usuario técnico puede saltárselo (menú del navegador, proxies, etc.).
 */
export function useDevToolsBlock(enabled: boolean = true) {
  useEffect(() => {
    if (!enabled) return;
    if (import.meta.env.DEV) return; // no bloquear en desarrollo

    const onContextMenu = (e: MouseEvent) => e.preventDefault();

    const onKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const mod = e.ctrlKey || e.metaKey;

      // F12
      if (key === "f12") {
        e.preventDefault();
        return;
      }
      // Ctrl/Cmd + Shift + I/J/C  (DevTools)
      if (mod && e.shiftKey && (key === "i" || key === "j" || key === "c")) {
        e.preventDefault();
        return;
      }
      // Ctrl/Cmd + U  (ver fuente)
      if (mod && key === "u") {
        e.preventDefault();
        return;
      }
      // Ctrl/Cmd + S  (guardar)
      if (mod && key === "s") {
        e.preventDefault();
        return;
      }
    };

    document.addEventListener("contextmenu", onContextMenu);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("contextmenu", onContextMenu);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [enabled]);
}
