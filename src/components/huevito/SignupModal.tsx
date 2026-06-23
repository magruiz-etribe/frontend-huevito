import { useEffect, useState } from "react";
import { X, UserPlus, Mail } from "lucide-react";
import { toast } from "sonner";
import huevitoLogo from "@/assets/huevito-logo.png";
import { auth, signInWithGoogle, signOut } from "@/lib/firebase";
import { FirebaseError } from "firebase/app";
import { registerCliente, getMe, ApiError } from "@/lib/http";

interface SignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitted?: () => void;
}

interface GoogleUser {
  uid: string;
  email: string;
  name: string;
}

interface FormState {
  responsable: string;
  fonda: string;
  telefono: string;
  direccion: string;
}

const EMPTY: FormState = {
  responsable: "",
  fonda: "",
  telefono: "",
  direccion: "",
};

export function SignupModal({ isOpen, onClose, onSubmitted }: SignupModalProps) {
  const [googleUser, setGoogleUser] = useState<GoogleUser | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [connecting, setConnecting] = useState(false);

  // Si el modal se abre y ya hay sesión Firebase, precargamos los datos
  useEffect(() => {
    if (!isOpen) return;
    const u = auth.currentUser;
    if (u && !googleUser) {
      const gu: GoogleUser = {
        uid: u.uid,
        email: u.email ?? "",
        name: u.displayName ?? u.email ?? "Usuario",
      };
      setGoogleUser(gu);
      setForm((f) => ({ ...f, responsable: f.responsable || gu.name }));
    }
  }, [isOpen, googleUser]);

  if (!isOpen) return null;

  const reset = () => {
    setGoogleUser(null);
    setForm(EMPTY);
    setSubmitting(false);
    setConnecting(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleGoogleConnect = async () => {
    setConnecting(true);
    try {
      const user = await signInWithGoogle();
      const gu: GoogleUser = {
        uid: user.uid,
        email: user.email ?? "",
        name: user.displayName ?? user.email ?? "Usuario",
      };

      // Si el cliente ya existe en el backend, no pedimos datos otra vez.
      try {
        const me = await getMe();
        if (me?.cliente) {
          toast.success("¡Bienvenido de vuelta!", { description: gu.email });
          onSubmitted?.();
          reset();
          onClose();
          return;
        }
      } catch {
        // ignoramos errores aquí: si falla, seguimos al formulario
      }

      setGoogleUser(gu);
      setForm((f) => ({ ...f, responsable: gu.name }));
      toast.success("Conectado con Google", { description: gu.email });
    } catch (err) {
      const code = err instanceof FirebaseError ? err.code : "";
      if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") {
        // user closed the popup — no toast
      } else if (code === "auth/unauthorized-domain") {
        toast.error("Dominio no autorizado", {
          description: "Agrega este dominio en Firebase Console → Authentication → Settings → Authorized domains.",
        });
      } else {
        toast.error("No pudimos conectar con Google", {
          description: err instanceof Error ? err.message : "Intenta de nuevo.",
        });
      }
    } finally {
      setConnecting(false);
    }
  };

  const set = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const canSubmit =
    !!googleUser &&
    form.responsable.trim().length > 1 &&
    form.fonda.trim().length > 1 &&
    form.direccion.trim().length > 3 &&
    !submitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await registerCliente({
        responsable: form.responsable.trim(),
        fonda: form.fonda.trim(),
        telefono: form.telefono.trim() || undefined,
        direccion: form.direccion.trim(),
      });
      toast.success("¡Registro exitoso!", {
        description: "Pronto podrás acceder al historial de tus platillos adaptados.",
      });
      onSubmitted?.();
      reset();
      onClose();
    } catch (err) {
      const apiErr = err instanceof ApiError ? err : null;
      if (apiErr?.status === 401) {
        await signOut().catch(() => {});
        toast.error("Tu sesión expiró", { description: "Conéctate con Google de nuevo." });
        reset();
      } else if (apiErr?.status === 409) {
        toast.info("Ya estás registrado", { description: "Tu cuenta ya existe en el sistema." });
        onSubmitted?.();
        reset();
        onClose();
      } else {
        toast.error("No pudimos completar el registro", {
          description: apiErr?.message ?? (err instanceof Error ? err.message : "Intenta de nuevo."),
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-label="Registro de usuario"
    >
      <div
        className="bg-white rounded-3xl shadow-warm w-full max-w-md overflow-hidden relative max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-warm text-white px-6 py-5 flex items-center gap-3 relative">
          <div className="w-12 h-12 rounded-full bg-white grid place-items-center p-1 flex-shrink-0 ring-1 ring-white/60">
            <img src={huevitoLogo} alt="Huevito" className="w-full h-full object-contain rounded-full" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-display font-bold text-xl leading-tight">Crea tu cuenta</h2>
            <p className="text-[13px] text-white/90">
              {googleUser ? "Completa los datos de tu fonda" : "Conéctate con Google para empezar"}
            </p>
          </div>
          <button
            onClick={handleClose}
            aria-label="Cerrar"
            className="p-2 rounded-xl hover:bg-white/15 transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step 1: Google sign-in */}
        {!googleUser && (
          <div className="px-6 py-8 space-y-5">
            <p className="text-sm text-brand-brown text-center">
              Usa tu cuenta de Google para registrarte de forma rápida y segura. Así no tendrás que recordar otra contraseña.
            </p>

            <button
              onClick={handleGoogleConnect}
              disabled={connecting}
              className="w-full py-3 rounded-2xl bg-white border-2 border-huevito-border text-brand-brown font-semibold hover:border-brand-orange hover:shadow-warm transition-all disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-3"
            >
              <GoogleIcon />
              {connecting ? "Conectando..." : "Continuar con Google"}
            </button>

            <p className="text-[11px] text-brand-brown-soft text-center px-2">
              Solo usaremos tu correo para identificarte. No publicaremos nada en tu nombre.
            </p>
          </div>
        )}

        {/* Step 2: Complete profile */}
        {googleUser && (
          <form onSubmit={handleSubmit} className="px-6 py-6 space-y-4 overflow-y-auto">
            {/* Google account card */}
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-huevito-bg-soft border border-huevito-border">
              <div className="w-10 h-10 rounded-full bg-gradient-warm grid place-items-center text-white font-bold">
                {googleUser.name.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-brand-brown truncate">{googleUser.name}</p>
                <p className="text-[12px] text-brand-brown-soft truncate inline-flex items-center gap-1">
                  <Mail className="w-3 h-3" /> {googleUser.email}
                </p>
              </div>
            </div>

            {[
              { id: "responsable", label: "Nombre de la persona responsable", placeholder: "Ej. María López", type: "text", maxLength: 80, required: true },
              { id: "fonda", label: "Nombre de la fonda o negocio", placeholder: "Ej. Cocina de la abuela", type: "text", maxLength: 80, required: true },
              { id: "telefono", label: "Teléfono de contacto (opcional)", placeholder: "Ej. 55 1234 5678", type: "tel", maxLength: 20, required: false },
              { id: "direccion", label: "Dirección", placeholder: "Calle, número, colonia, ciudad", type: "text", maxLength: 160, required: true },
            ].map((f) => (
              <div key={f.id}>
                <label htmlFor={f.id} className="block text-sm font-semibold text-brand-brown mb-1.5">
                  {f.label}
                </label>
                <input
                  id={f.id}
                  type={f.type}
                  value={form[f.id as keyof FormState]}
                  onChange={set(f.id as keyof FormState)}
                  placeholder={f.placeholder}
                  maxLength={f.maxLength}
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-huevito-border bg-white text-brand-brown placeholder:text-brand-brown-soft/60 focus:outline-none focus:border-brand-orange transition-colors"
                />
              </div>
            ))}

            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full py-3 rounded-2xl bg-gradient-warm text-white font-bold shadow-warm hover:scale-[1.01] active:scale-[0.99] transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 inline-flex items-center justify-center gap-2"
            >
              <UserPlus className="w-5 h-5" />
              {submitting ? "Enviando..." : "Crear cuenta"}
            </button>

            <p className="text-[11px] text-brand-brown-soft text-center px-1">
              Al registrarte aceptas que guardemos tu información para brindarte acceso al historial de tus platillos.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35 26.7 36 24 36c-5.3 0-9.7-3.4-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.1 5.6l6.2 5.2C41.6 35.4 44 30.1 44 24c0-1.3-.1-2.3-.4-3.5z"/>
    </svg>
  );
}
