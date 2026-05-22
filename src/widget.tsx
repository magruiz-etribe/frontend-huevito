import { createRoot } from "react-dom/client";
import { HuevitoWidget } from "./components/huevito/HuevitoWidget";
import "./index.css";

/**
 * Widget embebible standalone.
 * Build:  BUILD_WIDGET=true vite build
 * Uso en cualquier sitio:
 *   <script src="huevito-widget.js" data-auto-init="true"></script>
 */

function initWidget() {
  let container = document.getElementById("huevito-widget-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "huevito-widget-container";
    document.body.appendChild(container);
  }
  const root = createRoot(container);
  root.render(<HuevitoWidget />);
}

const currentScript = document.currentScript as HTMLScriptElement | null;
if (currentScript?.getAttribute("data-auto-init") === "true") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initWidget);
  } else {
    initWidget();
  }
}

export { initWidget, HuevitoWidget };

if (typeof window !== "undefined") {
  (window as unknown as { HuevitoWidget: { init: () => void; Component: typeof HuevitoWidget } }).HuevitoWidget = {
    init: initWidget,
    Component: HuevitoWidget,
  };
}
