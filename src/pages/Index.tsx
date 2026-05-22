import { useEffect, useRef, useState } from "react";
import { HuevitoFab, HuevitoModal } from "@/components/huevito";
import { PdfViewer } from "@/components/huevito/PdfViewer";
import { TranslationsSection } from "@/components/huevito/TranslationsSection";
import { closePdf, usePdfViewer } from "@/lib/pdfViewerStore";
import huevitoHero from "@/assets/huevito-saluda.gif";
import huevitoLogo from "@/assets/huevito-logo.png";
import menuDelDiaLogo from "@/assets/menu-del-dia-logo.png";

import {
  Camera,
  MessageCircle,
  Image as ImageIcon,
  Sparkles,
  Tag,
  ArrowRight,
  ArrowUp,
  Menu as MenuIcon,
  X,
  ExternalLink,
} from "lucide-react";
import { SiGooglemaps, SiYelp, SiTripadvisor } from "react-icons/si";

const PLATFORM_PDFS = {
  tripadvisor:
    "https://d1b1gcigbjwv2n.cloudfront.net/Men%C3%BA%20del%20D%C3%ADa%20-%20Tripadvisor.pdf",
  googlemaps:
    "https://d1b1gcigbjwv2n.cloudfront.net/Men%C3%BA%20del%20D%C3%ADa%20-%20Google%20Maps.pdf",
  yelp: "https://d1b1gcigbjwv2n.cloudfront.net/Men%C3%BA%20del%20D%C3%ADa%20-%20Yelp.pdf",
} as const;


type MenuAction =
  | "open-chat"
  | "scroll-how"
  | "scroll-steps"
  | "scroll-examples";

const Index = () => {
  const [open, setOpen] = useState(true); // se abre automáticamente al cargar
  const [menuOpen, setMenuOpen] = useState(false);
  const [showTop, setShowTop] = useState(false);
  const [showGreeting, setShowGreeting] = useState(true);
  const menuRef = useRef<HTMLDivElement>(null);
  const pdf = usePdfViewer();
  const reopenChatAfterPdf = useRef(false);

  // Cuando se abre un PDF: cerramos el modal de Huevito y recordamos reabrirlo al cerrar el PDF
  useEffect(() => {
    if (pdf.url) {
      reopenChatAfterPdf.current = open;
      if (open) setOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pdf.url]);

  const handleClosePdf = () => {
    closePdf();
    if (reopenChatAfterPdf.current) {
      reopenChatAfterPdf.current = false;
      setOpen(true);
    }
  };


  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Saludo periódico: visible 3s, oculto 3s (ciclo de 6s)
  useEffect(() => {
    const interval = setInterval(() => {
      setShowGreeting(true);
      const hideTimer = setTimeout(() => setShowGreeting(false), 3000);
      return () => clearTimeout(hideTimer);
    }, 6000);
    // arranque: ocultar después de 3s la primera aparición
    const initialHide = setTimeout(() => setShowGreeting(false), 3000);
    return () => {
      clearInterval(interval);
      clearTimeout(initialHide);
    };
  }, []);


  // Cerrar el menú al hacer click fuera
  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [menuOpen]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleMenu = (action: MenuAction) => {
    setMenuOpen(false);
    switch (action) {
      case "open-chat":
        setOpen(true);
        break;
      case "scroll-how":
        scrollTo("como-funciona");
        break;
      case "scroll-steps":
        scrollTo("pasos");
        break;
      case "scroll-examples":
        scrollTo("ejemplos");
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-soft">
      {/* Header con logo centrado y menú hamburguesa */}
      <header className="px-5 sm:px-8 pt-5 sm:pt-7 relative z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-center relative">
          <img
            src={menuDelDiaLogo}
            alt="Menú del Día"
            className="h-24 sm:h-32 md:h-40 w-auto"
          />

          <div
            ref={menuRef}
            className="absolute right-0 top-1/2 -translate-y-1/2"
          >
            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={menuOpen}
              className="p-3 rounded-2xl bg-white border-2 border-huevito-border text-brand-brown hover:bg-brand-cream transition-colors shadow-soft"
            >
              {menuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <MenuIcon className="w-6 h-6" />
              )}
            </button>

            {menuOpen && (
              <div
                role="menu"
                className="absolute right-0 mt-2 w-72 sm:w-80 rounded-2xl bg-white border border-huevito-border shadow-warm overflow-hidden z-[100] animate-fade-in"
              >
                <button
                  role="menuitem"
                  onClick={() => handleMenu("open-chat")}
                  className="w-full text-left px-5 py-4 hover:bg-brand-cream transition-colors flex items-center gap-3 border-b border-huevito-border"
                >
                  <span className="w-9 h-9 rounded-xl bg-gradient-warm grid place-items-center text-white flex-shrink-0">
                    <MessageCircle className="w-5 h-5" />
                  </span>
                  <span className="font-semibold text-brand-brown">
                    Empezar a adaptar mi menú
                  </span>
                </button>
                <button
                  role="menuitem"
                  onClick={() => handleMenu("scroll-how")}
                  className="w-full text-left px-5 py-4 hover:bg-brand-cream transition-colors flex items-center gap-3 border-b border-huevito-border"
                >
                  <span className="w-9 h-9 rounded-xl bg-brand-cream grid place-items-center text-brand-orange flex-shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </span>
                  <span className="font-semibold text-brand-brown">
                    ¿Cómo adaptar mi menú?
                  </span>
                </button>
                <button
                  role="menuitem"
                  onClick={() => handleMenu("scroll-steps")}
                  className="w-full text-left px-5 py-4 hover:bg-brand-cream transition-colors flex items-center gap-3 border-b border-huevito-border"
                >
                  <span className="w-9 h-9 rounded-xl bg-brand-cream grid place-items-center text-brand-orange flex-shrink-0">
                    <Tag className="w-5 h-5" />
                  </span>
                  <span className="font-semibold text-brand-brown">
                    ¿Cómo empezar a adaptar mi menú?
                  </span>
                </button>
                <button
                  role="menuitem"
                  onClick={() => handleMenu("scroll-examples")}
                  className="w-full text-left px-5 py-4 hover:bg-brand-cream transition-colors flex items-center gap-3 border-b border-huevito-border"
                >
                  <span className="w-9 h-9 rounded-xl bg-brand-cream grid place-items-center text-brand-orange flex-shrink-0">
                    <ImageIcon className="w-5 h-5" />
                  </span>
                  <span className="font-semibold text-brand-brown">
                    Ejemplos de menús amigables
                  </span>
                </button>
                <a
                  role="menuitem"
                  href={PLATFORM_PDFS.googlemaps}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMenuOpen(false)}
                  className="w-full text-left px-5 py-4 hover:bg-brand-cream transition-colors flex items-center gap-3 border-b border-huevito-border"
                >
                  <span className="w-9 h-9 rounded-xl bg-brand-cream grid place-items-center flex-shrink-0" style={{ color: "#1A73E8" }}>
                    <SiGooglemaps className="w-5 h-5" />
                  </span>
                  <span className="font-semibold text-brand-brown flex-1">
                    ¿Cómo registrarme en Google Maps?
                  </span>
                  <ExternalLink className="w-4 h-4 text-brand-brown-soft" />
                </a>
                <a
                  role="menuitem"
                  href={PLATFORM_PDFS.yelp}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMenuOpen(false)}
                  className="w-full text-left px-5 py-4 hover:bg-brand-cream transition-colors flex items-center gap-3 border-b border-huevito-border"
                >
                  <span className="w-9 h-9 rounded-xl bg-brand-cream grid place-items-center flex-shrink-0" style={{ color: "#D32323" }}>
                    <SiYelp className="w-5 h-5" />
                  </span>
                  <span className="font-semibold text-brand-brown flex-1">
                    ¿Cómo registrarme en Yelp?
                  </span>
                  <ExternalLink className="w-4 h-4 text-brand-brown-soft" />
                </a>
                <a
                  role="menuitem"
                  href={PLATFORM_PDFS.tripadvisor}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMenuOpen(false)}
                  className="w-full text-left px-5 py-4 hover:bg-brand-cream transition-colors flex items-center gap-3"
                >
                  <span className="w-9 h-9 rounded-xl bg-brand-cream grid place-items-center flex-shrink-0" style={{ color: "#00AF87" }}>
                    <SiTripadvisor className="w-5 h-5" />
                  </span>
                  <span className="font-semibold text-brand-brown flex-1">
                    ¿Cómo registrarme en TripAdvisor?
                  </span>
                  <ExternalLink className="w-4 h-4 text-brand-brown-soft" />
                </a>

              </div>
            )}
          </div>
        </div>
      </header>

      <main className="px-5 sm:px-8 pt-6 sm:pt-10 pb-32">
        {/* HERO */}
        <section className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div className="text-center md:text-left order-2 md:order-1">
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl text-brand-brown leading-[1.05] font-bold">
              Adapta y traduce tú menú al{" "}
              <span className="text-brand-orange">inglés</span> en segundos.
            </h1>
            <p className="mt-5 text-lg sm:text-xl text-brand-brown-soft max-w-xl mx-auto md:mx-0">
              Huevito adapta los platillos de tu menú para hacerlo más
              accesible y fácil de entender para locales y visitantes durante
              este Mundial.
            </p>

            <div className="mt-7 flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
              <button
                onClick={() => setOpen(true)}
                className="group inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl bg-gradient-warm text-white text-lg font-bold shadow-warm hover:scale-[1.02] active:scale-[0.98] transition-transform"
              >
                Empezar a chatear
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => scrollTo("como-funciona")}
                className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl bg-white border-2 border-huevito-border text-brand-brown text-lg font-bold hover:bg-brand-cream transition-colors"
              >
                Ver cómo funciona
              </button>
            </div>
          </div>

          {/* Avatar grande con globo de diálogo */}
          <div className="order-1 md:order-2 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 hero-blob blur-3xl scale-110 -z-10" />

              {/* Globo de diálogo */}
              <div
                className={`absolute -top-12 sm:-top-16 -right-6 sm:-right-16 z-10 transition-all duration-500 ease-out ${
                  showGreeting
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 -translate-y-2 pointer-events-none"
                }`}
              >
                <div className="relative bg-white border border-huevito-border rounded-3xl px-5 py-3 shadow-soft">
                  <div className="flex items-center gap-2">
                    <span aria-hidden>👋</span>
                    <span className="font-semibold text-brand-brown text-sm sm:text-base">
                      Hola, me llamo Huevito
                    </span>
                  </div>
                  {/* Cola del globo apuntando al huevito */}
                  <span
                    aria-hidden
                    className="absolute -bottom-2 left-8 w-4 h-4 bg-white border-r border-b border-huevito-border rotate-45"
                  />
                </div>
              </div>


              <img
                src={huevitoHero}
                alt="Huevito saludando"
                className="w-56 sm:w-72 md:w-[22rem] h-auto animate-float drop-shadow-2xl"
              />
            </div>
          </div>
        </section>

        {/* CÓMO FUNCIONA — GIFs demo */}
        <section
          id="como-funciona"
          className="max-w-6xl mx-auto mt-16 sm:mt-24"
        >
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="font-display text-3xl sm:text-4xl text-brand-orange font-bold">
              ¿Cómo funciona?
            </h2>
            <p className="text-brand-brown-soft mt-3 text-lg">
              Sin descargas, sin registros. ¡Funciona desde tu celular! 📱
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-5 sm:gap-6 mt-10">
            {[
              {
                title: "Escribe el nombre",
                icon: <MessageCircle className="w-6 h-6" />,
                placeholder: "[ GIF demo: usuario escribiendo el platillo ]",
              },
              {
                title: "Envía una foto",
                icon: <Camera className="w-6 h-6" />,
                placeholder: "[ GIF demo: usuario enviando foto del platillo ]",
              },
            ].map((item) => (
              <div key={item.title} className="card-warm p-5 sm:p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-10 h-10 rounded-xl bg-brand-cream text-brand-orange grid place-items-center">
                    {item.icon}
                  </span>
                  <h3 className="font-display text-xl text-brand-brown font-bold">
                    {item.title}
                  </h3>
                </div>
                <div className="aspect-video rounded-2xl bg-brand-cream border-2 border-dashed border-huevito-border grid place-items-center text-center px-4">
                  <p className="text-brand-brown-soft text-sm sm:text-base font-medium">
                    {item.placeholder}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* PASOS 1·2·3·4 */}
        <section id="pasos" className="max-w-6xl mx-auto mt-20 sm:mt-28">
          <h2 className="font-display text-3xl sm:text-4xl text-brand-brown text-center font-bold">
            ¿Cómo empezar a{" "}
            <span className="text-brand-orange">adaptar tu menú</span>?
          </h2>
          <p className="text-center text-brand-brown-soft mt-3 text-lg max-w-xl mx-auto">
            Hecho para que cualquier persona pueda usarlo, sin complicaciones.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 mt-10">
            {[
              {
                n: "1",
                title: "Comparte tu platillo",
                body: "Escribe el nombre de tu platillo o sube una fotografía.",
              },
              {
                n: "2",
                title: "Confirma la información",
                body: "Cuéntanos algunas características clave para adaptar tu platillo correctamente.",
              },
              {
                n: "3",
                title: "Adaptación",
                body: "Huevito adapta y explica tu platillo para hacerlo más claro y fácil de entender.",
              },
              {
                n: "4",
                title: "Haz tu menú más accesible",
                body: "Identifica características como vegetariano, picante, sin gluten o apto para intolerantes a la lactosa.",
              },
            ].map((step) => (
              <div key={step.n} className="card-warm p-6 relative">
                <div className="absolute -top-4 -left-4 w-11 h-11 rounded-2xl bg-gradient-warm text-white grid place-items-center font-display font-bold text-xl shadow-warm">
                  {step.n}
                </div>
                <h3 className="font-display text-lg text-brand-brown font-bold mt-2">
                  {step.title}
                </h3>
                <p className="text-brand-brown-soft mt-2 leading-relaxed text-[15px]">
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* TUS TRADUCCIONES */}
        <TranslationsSection onStart={() => setOpen(true)} />

        {/* HAZTE VISIBLE — Infografías de plataformas */}
        <section id="plataformas" className="max-w-6xl mx-auto mt-20 sm:mt-28">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="font-display text-3xl sm:text-4xl text-brand-brown font-bold">
              Haz visible tu negocio y{" "}
              <span className="text-brand-orange">atrae más clientes</span>
            </h2>
            <p className="text-brand-brown-soft mt-3 text-lg">
              Descarga las infografías y sigue las instrucciones para darte de
              alta en las plataformas clave.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-5 sm:gap-6 mt-10">
            {[
              {
                name: "Google Maps",
                url: PLATFORM_PDFS.googlemaps,
                Icon: SiGooglemaps,
                color: "#1A73E8",
              },
              {
                name: "Yelp",
                url: PLATFORM_PDFS.yelp,
                Icon: SiYelp,
                color: "#D32323",
              },
              {
                name: "TripAdvisor",
                url: PLATFORM_PDFS.tripadvisor,
                Icon: SiTripadvisor,
                color: "#00AF87",
              },
            ].map(({ name, url, Icon, color }) => (
              <a
                key={name}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="group card-warm p-6 sm:p-7 flex flex-col items-center text-center hover:scale-[1.02] active:scale-[0.98] transition-transform"
              >
                <span
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-brand-cream grid place-items-center mb-4 group-hover:scale-110 transition-transform"
                  style={{ color }}
                >
                  <Icon className="w-12 h-12 sm:w-14 sm:h-14" />
                </span>
                <h3 className="font-display text-xl text-brand-brown font-bold">
                  {name}
                </h3>
                <p className="text-brand-brown-soft text-sm mt-2">
                  Ver infografía
                </p>
                <span className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-warm text-white text-sm font-semibold shadow-soft">
                  Abrir PDF
                  <ExternalLink className="w-4 h-4" />
                </span>
              </a>
            ))}
          </div>
        </section>




        {/* CTA FINAL */}
        <section className="max-w-5xl mx-auto mt-20 sm:mt-28">
          <div className="rounded-3xl overflow-hidden p-8 sm:p-12 text-center bg-gradient-warm relative shadow-warm">
            <h2 className="font-display text-3xl sm:text-4xl text-white font-bold relative">
              ¡Comencemos a adaptar y traducir tu primer platillo!
            </h2>
            <p className="text-white/95 mt-3 text-lg relative">
              Huevito hará que tu menú sea más accesible para todos.
            </p>
            <button
              onClick={() => setOpen(true)}
              className="mt-7 inline-flex items-center gap-3 px-7 py-4 rounded-2xl bg-white text-brand-orange text-lg font-bold shadow-warm hover:scale-[1.02] active:scale-[0.98] transition-transform relative"
            >
              <img
                src={huevitoLogo}
                alt=""
                className="w-7 h-7 object-contain"
              />
              Chatea con Huevito
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </section>
      </main>

      <footer className="text-center text-sm text-brand-brown-soft pb-6 px-4">
        © {new Date().getFullYear()} Menú del Día · Hecho con 🥚 por Huevito
      </footer>

      {/* Widget */}
      {/* Botón scroll-to-top, sobre el FAB */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Volver arriba"
        className={`fixed right-5 sm:right-6 bottom-[110px] sm:bottom-[125px] w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white border-2 border-huevito-border text-brand-brown shadow-warm grid place-items-center hover:bg-brand-cream hover:scale-105 active:scale-95 transition-all ${
          showTop ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        style={{ zIndex: 2147483645 }}
      >
        <ArrowUp className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      <HuevitoFab onClick={() => setOpen(true)} showPulse={!open} />
      <HuevitoModal isOpen={open} onClose={() => setOpen(false)} />
      {pdf.url && (
        <PdfViewer url={pdf.url} label={pdf.label} onClose={handleClosePdf} />
      )}
    </div>
  );
};


export default Index;
