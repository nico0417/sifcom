import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import type { AuthUser, Role } from '../interfaces/sifcom';
import { TOKEN_KEY, USER_KEY } from '../services/api';

export type { AuthUser, Role };

interface AuthContextValue {
  user: AuthUser | null;
  login: (user: AuthUser, token: string) => void;
  updateUser: (patch: Partial<AuthUser>) => void;
  logout: () => void;
}

export const mapApiUser = (raw: Record<string, unknown>): AuthUser => {
  const permisos = String(raw.PermisosUser ?? raw.permisosuser ?? 'INSPECTOR').toUpperCase();
  const isAdmin = permisos === 'ADMIN';
  return {
    id: Number(raw.IdUser ?? raw.iduser ?? 0),
    nombre: String(raw.Nombre ?? raw.nombre ?? 'Usuario'),
    correo: String(raw.Email ?? raw.email ?? ''),
    rol: isAdmin ? 'admin' : 'inspector',
    comuna: String(raw.Comuna ?? raw.comuna ?? 'Valparaíso'),
    permisos: isAdmin ? 'ADMIN' : 'INSPECTOR',
  };
};

const readUser = (): AuthUser | null => {
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AuthUser;
    return {
      id: parsed.id || 0,
      nombre: parsed.nombre || 'Usuario',
      correo: parsed.correo,
      rol: parsed.rol,
      comuna: parsed.comuna || 'Valparaíso',
      permisos: parsed.permisos || (parsed.rol === 'admin' ? 'ADMIN' : 'INSPECTOR'),
    };
  } catch {
    return null;
  }
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(readUser);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      login: (next, token) => {
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(USER_KEY, JSON.stringify(next));
        setUser(next);
      },
      updateUser: (patch) => {
        setUser((current) => {
          if (!current) return null;
          const next = { ...current, ...patch };
          localStorage.setItem(USER_KEY, JSON.stringify(next));
          return next;
        });
      },
      logout: () => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        setUser(null);
      },
    }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return ctx;
};
