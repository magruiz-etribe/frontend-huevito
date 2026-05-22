import { useState } from "react";
import { HuevitoFab } from "./HuevitoFab";
import { HuevitoModal } from "./HuevitoModal";

/**
 * Componente todo-en-uno: FAB + Modal.
 * Útil para incrustar en cualquier página o exportar como widget.
 */
export function HuevitoWidget() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <HuevitoFab onClick={() => setOpen(true)} showPulse={!open} />
      <HuevitoModal isOpen={open} onClose={() => setOpen(false)} />
    </>
  );
}
