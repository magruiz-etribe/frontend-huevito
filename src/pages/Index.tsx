import { useEffect, useRef, useState } from "react";
import { HuevitoFab, HuevitoModal } from "@/components/huevito";
import { PdfViewer } from "@/components/huevito/PdfViewer";
import { TranslationsSection } from "@/components/huevito/TranslationsSection";
import { closePdf, usePdfViewer } from "@/lib/pdfViewerStore";
import huevitoHero from "@/assets/huevito-saluda.gif";
import huevitoLogo from "@/assets/huevito-logo.png";
import menuDelDiaLogo from "@/assets/menu-del-dia-logo.png";

const CDN = "https://d1b1gcigbjwv2n.cloudfront.net";
const PARTNER_LOGOS = {
  ida: `${CDN}/IDA.png`,
  tpi: `${CDN}/TPI.png`,
  amex: `${CDN}/amex.png`,
  fp: `${CDN}/FP.png`,
  miMercado: `${CDN}/Mi%20Mercado.png`,
  cdmx: `${CDN}/CDMX.png`,
  etribe: `${CDN}/etribe.png`,
};

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
  tripadvisor: "https://d1b1gcigbjwv2n.cloudfront.net/Men%C3%BA%20del%20D%C3%ADa%20-%20Tripadvisor.pdf",
  googlemaps: "https://d1b1gcigbjwv2n.cloudfront.net/Men%C3%BA%20del%20D%C3%ADa%20-%20Google%20Maps.pdf",
  yelp: "https://d1b1gcigbjwv2n.cloudfront.net/Men%C3%BA%20del%20D%C3%ADa%20-%20Yelp.pdf",
} as const;

type MenuAction = "open-chat" | "scroll-how" | "scroll-steps" | "scroll-examples";

const Index = () => {
  const [open, setOpen] = useState(true); // se abre automáticamente al cargar
  const [menuOpen, setMenuOpen] = useState(false);
  const [showTop, setShowTop] = useState(false);
  const [showGreeting, setShowGreeting] = useState(true);
  const [videoOpen, setVideoOpen] = useState(false);
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
          <img src={menuDelDiaLogo} alt="Menú del Día" className="h-24 sm:h-32 md:h-40 w-auto" />

          <div ref={menuRef} className="absolute right-0 top-1/2 -translate-y-1/2">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={menuOpen}
              className="p-3 rounded-2xl bg-white border-2 border-huevito-border text-brand-brown hover:bg-brand-cream transition-colors shadow-soft"
            >
              {menuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
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
                  <span className="font-semibold text-brand-brown">Empezar a adaptar mi menú</span>
                </button>
                <button
                  role="menuitem"
                  onClick={() => handleMenu("scroll-how")}
                  className="w-full text-left px-5 py-4 hover:bg-brand-cream transition-colors flex items-center gap-3 border-b border-huevito-border"
                >
                  <span className="w-9 h-9 rounded-xl bg-brand-cream grid place-items-center text-brand-orange flex-shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </span>
                  <span className="font-semibold text-brand-brown">¿Cómo funciona?</span>
                </button>
                <button
                  role="menuitem"
                  onClick={() => handleMenu("scroll-steps")}
                  className="w-full text-left px-5 py-4 hover:bg-brand-cream transition-colors flex items-center gap-3 border-b border-huevito-border"
                >
                  <span className="w-9 h-9 rounded-xl bg-brand-cream grid place-items-center text-brand-orange flex-shrink-0">
                    <Tag className="w-5 h-5" />
                  </span>
                  <span className="font-semibold text-brand-brown">¿Cómo empezar a adaptar mi menú?</span>
                </button>
                <button
                  role="menuitem"
                  onClick={() => handleMenu("scroll-examples")}
                  className="w-full text-left px-5 py-4 hover:bg-brand-cream transition-colors flex items-center gap-3 border-b border-huevito-border"
                >
                  <span className="w-9 h-9 rounded-xl bg-brand-cream grid place-items-center text-brand-orange flex-shrink-0">
                    <ImageIcon className="w-5 h-5" />
                  </span>
                  <span className="font-semibold text-brand-brown">Ejemplos de menús amigables</span>
                </button>
                <a
                  role="menuitem"
                  href={PLATFORM_PDFS.googlemaps}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMenuOpen(false)}
                  className="w-full text-left px-5 py-4 hover:bg-brand-cream transition-colors flex items-center gap-3 border-b border-huevito-border"
                >
                  <span
                    className="w-9 h-9 rounded-xl bg-brand-cream grid place-items-center flex-shrink-0"
                    style={{ color: "#1A73E8" }}
                  >
                    <SiGooglemaps className="w-5 h-5" />
                  </span>
                  <span className="font-semibold text-brand-brown flex-1">¿Cómo registrarme en Google Maps?</span>
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
                  <span
                    className="w-9 h-9 rounded-xl bg-brand-cream grid place-items-center flex-shrink-0"
                    style={{ color: "#D32323" }}
                  >
                    <SiYelp className="w-5 h-5" />
                  </span>
                  <span className="font-semibold text-brand-brown flex-1">¿Cómo registrarme en Yelp?</span>
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
                  <span
                    className="w-9 h-9 rounded-xl bg-brand-cream grid place-items-center flex-shrink-0"
                    style={{ color: "#00AF87" }}
                  >
                    <SiTripadvisor className="w-5 h-5" />
                  </span>
                  <span className="font-semibold text-brand-brown flex-1">¿Cómo registrarme en TripAdvisor?</span>
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
              Adapta tú menú al <span className="text-brand-orange">inglés</span> en segundos.
            </h1>
            <p className="mt-5 text-lg sm:text-xl text-brand-brown-soft max-w-xl mx-auto md:mx-0">
              Huevito adapta los platillos de tu menú para hacerlo más accesible y fácil de entender para locales y
              visitantes durante este Mundial.
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
                  showGreeting ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"
                }`}
              >
                <div className="relative bg-white border border-huevito-border rounded-3xl px-5 py-3 shadow-soft">
                  <div className="flex items-center gap-2">
                    <span aria-hidden>👋</span>
                    <span className="font-semibold text-brand-brown text-sm sm:text-base">Hola, me llamo Huevito</span>
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
        <section id="como-funciona" className="max-w-6xl mx-auto mt-16 sm:mt-24">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="font-display text-3xl sm:text-4xl text-brand-orange font-bold">¿Cómo funciona?</h2>
            <p className="text-brand-brown-soft mt-3 text-lg">
              Sin descargas, sin registros. ¡Funciona desde tu celular! 📱
            </p>
          </div>

          <div className="flex justify-center mt-10">
            <div
              className="card-warm p-3 sm:p-4 cursor-pointer group w-full max-w-[280px] sm:max-w-xs"
              onClick={() => setVideoOpen(true)}
            >
              <div className="aspect-[9/20] rounded-2xl overflow-hidden bg-brand-cream relative">
                <video
                  src="/huevito-demo.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-colors duration-300">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white/90 shadow-lg grid place-items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 scale-90 group-hover:scale-100">
                    <svg
                      className="w-6 h-6 sm:w-7 sm:h-7 text-brand-brown ml-1"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PASOS 1·2·3·4 */}
        <section id="pasos" className="max-w-6xl mx-auto mt-20 sm:mt-28">
          <h2 className="font-display text-3xl sm:text-4xl text-brand-brown text-center font-bold">
            ¿Cómo empezar a <span className="text-brand-orange">adaptar tu menú</span>?
          </h2>
          <p className="text-center text-brand-brown-soft mt-3 text-lg max-w-xl mx-auto">
            Hecho para que cualquier persona pueda usarlo, sin complicaciones.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 mt-10">
            {[
              {
                n: "1",
                title: "Comparte tu platillo",
                body: "Escribe el nombre de tu platillo",
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
                <h3 className="font-display text-lg text-brand-brown font-bold mt-2">{step.title}</h3>
                <p className="text-brand-brown-soft mt-2 leading-relaxed text-[15px]">{step.body}</p>
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
              Haz visible tu negocio y <span className="text-brand-orange">atrae más clientes</span>
            </h2>
            <p className="text-brand-brown-soft mt-3 text-lg">
              Descarga las infografías y sigue las instrucciones para darte de alta en las plataformas clave.
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
                <h3 className="font-display text-xl text-brand-brown font-bold">{name}</h3>
                <p className="text-brand-brown-soft text-sm mt-2">Ver infografía</p>
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
          <div className="rounded-3xl overflow-hidden pt-8 pb-4 sm:pt-12 sm:pb-5 px-8 sm:px-12 text-center bg-gradient-warm relative shadow-warm">
            <h2 className="font-display text-3xl sm:text-4xl text-white font-bold relative">
              ¡Comencemos a adaptar tu primer platillo!
            </h2>
            <p className="text-white/95 mt-3 text-lg relative">
              Huevito hará que tu menú sea más accesible para todos.
            </p>
            <button
              onClick={() => setOpen(true)}
              className="mt-7 inline-flex items-center gap-3 px-7 py-4 rounded-2xl bg-white text-brand-orange text-lg font-bold shadow-warm hover:scale-[1.02] active:scale-[0.98] transition-transform relative"
            >
              <img src={huevitoLogo} alt="" className="w-7 h-7 object-contain" />
              Chatea con Huevito
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </section>
      </main>

      <section className="max-w-[90rem] mx-auto px-5 sm:px-8 mt-0">
        <div className="card-warm p-5 sm:p-7">
          <p className="text-brand-brown-soft text-center text-[15px] sm:text-base leading-relaxed max-w-4xl mx-auto">
            <span className="font-semibold text-brand-brown">Huevito</span> forma parte de una estrategia del programa{" "}
            <span className="font-semibold text-brand-brown">Menú del Día</span>. Es una iniciativa de la IDA Foundation
            y The Place Institute, impulsada por American Express e implementada por Fundación Placemaking, la
            Secretaría de Desarrollo Económico (SEDECO), Mi Mercado Público y el Fondo Mixto de Promoción Turística de
            la Ciudad de México, con el objetivo de fortalecer las fondas, cocinas y restaurantes que tienen un menú del
            día de la Ciudad de México.
          </p>

          <div className="mt-5 sm:mt-6 flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-5">
            <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-7 lg:gap-5">
              <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-brand-brown shrink-0">
                Iniciativa de
              </span>
              <div className="flex items-center gap-5 sm:gap-7 lg:gap-5 flex-wrap lg:flex-nowrap justify-center">
                <img
                  src={PARTNER_LOGOS.ida}
                  alt="IDA Foundation"
                  className="h-10 sm:h-12 lg:h-11 w-auto object-contain shrink-0"
                />
                <img
                  src={PARTNER_LOGOS.tpi}
                  alt="The Place Institute"
                  className="h-12 sm:h-14 lg:h-12 w-auto object-contain shrink-0"
                />
                <img
                  src={PARTNER_LOGOS.amex}
                  alt="American Express"
                  className="h-12 sm:h-14 lg:h-12 w-auto object-contain shrink-0"
                />
              </div>
            </div>

            <div className="hidden lg:block w-px h-16 bg-huevito-border shrink-0" />
            <div className="lg:hidden w-24 h-px bg-huevito-border" />

            <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-7 lg:gap-5">
              <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-brand-brown shrink-0">
                Implementado por
              </span>
              <div className="flex items-center gap-5 sm:gap-7 lg:gap-5 flex-wrap lg:flex-nowrap justify-center">
                <img
                  src={PARTNER_LOGOS.fp}
                  alt="Fundación Placemaking"
                  className="h-10 sm:h-12 lg:h-11 w-auto object-contain shrink-0"
                />
                <img
                  src={PARTNER_LOGOS.miMercado}
                  alt="Mi Mercado"
                  className="h-12 sm:h-14 lg:h-12 w-auto object-contain shrink-0"
                />
                <img
                  src={PARTNER_LOGOS.cdmx}
                  alt="CDMX SEDECO"
                  className="h-12 sm:h-14 lg:h-12 w-auto object-contain shrink-0"
                />
                <img
                  src={PARTNER_LOGOS.etribe}
                  alt="etribe"
                  className="h-8 sm:h-10 lg:h-9 w-auto object-contain shrink-0"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="text-center text-sm text-brand-brown-soft pb-6 pt-10 px-4">
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
      {pdf.url && <PdfViewer url={pdf.url} label={pdf.label} onClose={handleClosePdf} />}

      {/* Video lightbox */}
      {videoOpen && (
        <div
          className="fixed inset-0 z-[2147483646] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setVideoOpen(false)}
        >
          <div className="relative w-full max-w-xs sm:max-w-sm aspect-[9/20] rounded-2xl overflow-hidden shadow-2xl">
            <video src="/huevito-demo.mp4" autoPlay loop muted playsInline className="w-full h-full object-cover" />
            <button
              onClick={(e) => {
                e.stopPropagation();
                setVideoOpen(false);
              }}
              className="absolute top-3 right-3 w-10 h-10 rounded-full bg-black/50 text-white grid place-items-center hover:bg-black/70 transition-colors"
              aria-label="Cerrar video"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
