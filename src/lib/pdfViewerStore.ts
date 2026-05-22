import { useSyncExternalStore } from "react";

interface PdfState {
  url: string | null;
  label?: string;
}

let state: PdfState = { url: null };
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

export function openPdf(url: string, label?: string) {
  state = { url, label };
  emit();
}

export function closePdf() {
  if (!state.url) return;
  state = { url: null };
  emit();
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function getSnapshot() {
  return state;
}

export function usePdfViewer(): PdfState {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
