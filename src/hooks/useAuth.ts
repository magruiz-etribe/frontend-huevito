import { useEffect, useState } from "react";
import { auth, onAuthStateChanged, type User } from "@/lib/firebase";
import { getMe, ApiError, type ClienteDTO } from "@/lib/http";
import { syncCurrentMenuToBackend } from "@/lib/huevitoApi";

/**
 * Estados de autenticación:
 * - "loading": revisando sesión de Firebase / consultando /auth/me
 * - "anon": no hay sesión de Firebase
 * - "needs-profile": hay sesión Firebase pero el backend devolvió 404 (sin perfil)
 * - "ready": sesión Firebase + perfil en el backend
 */
export type AuthStatus = "loading" | "anon" | "needs-profile" | "ready";

interface AuthState {
  status: AuthStatus;
  user: User | null;
  cliente: ClienteDTO | null;
  refreshCliente: () => Promise<void>;
}

export function useAuth(): AuthState {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<User | null>(null);
  const [cliente, setCliente] = useState<ClienteDTO | null>(null);

  const fetchCliente = async (u: User | null) => {
    if (!u) {
      setCliente(null);
      setStatus("anon");
      return;
    }
    try {
      const res = await getMe();
      if (res?.cliente) {
        setCliente(res.cliente);
        setStatus("ready");
        // Si ya hay menús adaptados en memoria, persistirlos en el backend.
        void syncCurrentMenuToBackend();
      } else {
        setCliente(null);
        setStatus("needs-profile");
      }
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setCliente(null);
        setStatus("needs-profile");
      } else {
        // En errores de red/500 lo tratamos como anon para no bloquear la UI
        setCliente(null);
        setStatus(u ? "needs-profile" : "anon");
      }
    }
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setStatus("loading");
      void fetchCliente(u);
    });
    return unsub;
  }, []);

  return {
    status,
    user,
    cliente,
    refreshCliente: () => fetchCliente(auth.currentUser),
  };
}
