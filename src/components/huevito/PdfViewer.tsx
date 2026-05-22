import { useEffect } from "react";
import { Download, X } from "lucide-react";

interface PdfViewerProps {
  url: string;
  label?: string;
  onClose: () => void;
}

export function PdfViewer({ url, label, onClose }: PdfViewerProps) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  // Forzar visualización tipo imagen: iframe a pantalla; el navegador renderiza el PDF
  // El parámetro #view=FitH ayuda a que se ajuste al ancho.
  const src = `${url}#view=FitH&toolbar=0&navpanes=0`;

  return (
    <div
      className="fixed inset-0 z-[2147483646] bg-black/80 flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-label={label || "Documento PDF"}
    >
      <header className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3 bg-gradient-warm text-white shadow-warm flex-shrink-0">
        <h3 className="font-display font-bold text-base sm:text-lg truncate">
          {label || "Documento"}
        </h3>
        <div className="flex items-center gap-2 flex-shrink-0">
          <a
            href={url}
            download
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/15 hover:bg-white/25 transition-colors text-sm font-semibold"
            title="Descargar PDF"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Descargar</span>
          </a>
          <button
            onClick={onClose}
            aria-label="Cerrar PDF"
            className="p-2.5 rounded-xl hover:bg-white/15 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </header>
      <div className="flex-1 bg-neutral-900">
        <iframe
          src={src}
          title={label || "PDF"}
          className="w-full h-full border-0 bg-white"
        />
      </div>
    </div>
  );
}
