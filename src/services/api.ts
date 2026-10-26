import axios from 'axios';
import type { ChecklistItem, Contrato, Fiscalizacion, Multa } from '../interfaces/sifcom';

export const TOKEN_KEY = 'sifcom-token';
export const USER_KEY = 'sifcom-user';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 8000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = String(error.config?.url || '');
    const isAuth = url.includes('/auth/login') || url.includes('/auth/register');
    if (error.response?.status === 401 && !isAuth) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
    const data = error.response?.data;
    const message = data?.message || data?.error || error.message || 'Error de conexión con el servidor';
    return Promise.reject(new Error(message));
  },
);

export default api;

export const unwrapData = <T>(raw: unknown): T => {
  if (raw && typeof raw === 'object' && 'data' in (raw as Record<string, unknown>)) {
    return (raw as { data: T }).data;
  }
  return raw as T;
};

export const pick = (row: Record<string, unknown>, ...keys: string[]) => {
  for (const key of keys) {
    if (row[key] !== undefined && row[key] !== null) return row[key];
  }
  return undefined;
};

export const asContrato = (row: Record<string, unknown>): Contrato => ({
  IdContrato: Number(pick(row, 'IdContrato', 'idcontrato')),
  Empresa: String(pick(row, 'Empresa', 'empresa') ?? ''),
  Giro: String(pick(row, 'Giro', 'giro') ?? ''),
  Presupuesto: (pick(row, 'Presupuesto', 'presupuesto') as string | number) ?? '',
  Vigencia: String(pick(row, 'Vigencia', 'vigencia') ?? ''),
});

export const asFiscalizacion = (row: Record<string, unknown>): Fiscalizacion => ({
  IdFiscalizacion: Number(pick(row, 'IdFiscalizacion', 'idfiscalizacion')),
  Obra: String(pick(row, 'Obra', 'obra') ?? ''),
  Ubicacion: (pick(row, 'Ubicacion', 'ubicacion') as string | null) ?? null,
  Foto: (pick(row, 'Foto', 'foto') as string | null) ?? null,
  Observaciones: (pick(row, 'Observaciones', 'observaciones') as string | null) ?? null,
  FechaFisc: String(pick(row, 'FechaFisc', 'fechafisc') ?? ''),
  Estado: String(pick(row, 'Estado', 'estado') ?? ''),
  IdUser: Number(pick(row, 'IdUser', 'iduser')),
  IdContrato: Number(pick(row, 'IdContrato', 'idcontrato')),
  InspectorNombre: pick(row, 'InspectorNombre', 'inspectornombre', 'nombre_usuario') as string | undefined,
  ChecklistResumen: pick(row, 'ChecklistResumen', 'checklistresumen') as string | undefined,
});

export const asChecklistItem = (row: Record<string, unknown>): ChecklistItem => ({
  IdChecklist: Number(pick(row, 'IdChecklist', 'idchecklist')),
  Descripcion: String(pick(row, 'Descripcion', 'descripcion') ?? ''),
});

export const asMulta = (row: Record<string, unknown>): Multa => ({
  IdMulta: Number(pick(row, 'IdMulta', 'idmulta')),
  Monto: (pick(row, 'Monto', 'monto') as string | number) ?? 0,
  Motivo: String(pick(row, 'Motivo', 'motivo') ?? ''),
  FechaMulta: String(pick(row, 'FechaMulta', 'fechamulta') ?? ''),
  IdContrato: Number(pick(row, 'IdContrato', 'idcontrato')),
  IdFiscalizacion: Number(pick(row, 'IdFiscalizacion', 'idfiscalizacion')),
});

export const listContratos = async (): Promise<Contrato[]> => {
  const { data } = await api.get('/contratos');
  const rows = unwrapData<Record<string, unknown>[]>(data);
  return Array.isArray(rows) ? rows.map(asContrato) : [];
};

export const createContrato = async (payload: Omit<Contrato, 'IdContrato'>): Promise<Contrato> => {
  const { data } = await api.post('/contratos', payload);
  return asContrato(unwrapData<Record<string, unknown>>(data));
};

export const updateContrato = async (
  id: number,
  payload: Omit<Contrato, 'IdContrato'>,
): Promise<Contrato> => {
  const { data } = await api.put(`/contratos/${id}`, payload);
  return asContrato(unwrapData<Record<string, unknown>>(data));
};

export const deleteContrato = async (id: number): Promise<void> => {
  await api.delete(`/contratos/${id}`);
};

export const listChecklists = async (idContrato?: number): Promise<ChecklistItem[]> => {
  const url = idContrato ? `/contratos/${idContrato}/checklists` : '/checklists';
  const { data } = await api.get(url);
  const rows = unwrapData<Record<string, unknown>[]>(data);
  return Array.isArray(rows) ? rows.map(asChecklistItem) : [];
};

export const listFiscalizaciones = async (): Promise<Fiscalizacion[]> => {
  const { data } = await api.get('/fiscalizaciones');
  const rows = unwrapData<Record<string, unknown>[]>(data);
  return Array.isArray(rows) ? rows.map(asFiscalizacion) : [];
};

export const createFiscalizacion = async (payload: {
  Obra: string;
  Ubicacion?: string;
  Foto?: string;
  Observaciones?: string;
  FechaFisc?: string;
  Estado?: string;
  IdContrato: number;
  Respuestas?: { IdChecklist: number; Cumple: boolean }[];
}): Promise<Fiscalizacion> => {
  const { data } = await api.post('/fiscalizaciones', payload);
  return asFiscalizacion(unwrapData<Record<string, unknown>>(data));
};

export const updateFiscalizacion = async (
  id: number,
  payload: {
    Obra: string;
    Ubicacion?: string | null;
    Foto?: string | null;
    Observaciones?: string | null;
    FechaFisc?: string | null;
    Estado?: string | null;
    IdUser?: number;
    IdContrato: number;
  },
): Promise<Fiscalizacion> => {
  const { data } = await api.put(`/fiscalizaciones/${id}`, payload);
  return asFiscalizacion(unwrapData<Record<string, unknown>>(data));
};

export const deleteFiscalizacion = async (id: number): Promise<void> => {
  await api.delete(`/fiscalizaciones/${id}`);
};

export const listMultas = async (): Promise<Multa[]> => {
  const { data } = await api.get('/multas');
  const rows = unwrapData<Record<string, unknown>[]>(data);
  return Array.isArray(rows) ? rows.map(asMulta) : [];
};

export const updatePerfilUsuario = async (payload: {
  Nombre: string;
  Email: string;
  Comuna: string;
  Contrasena?: string;
}) => {
  const { data } = await api.put('/usuarios/perfil', payload);
  return unwrapData<{ user?: Record<string, unknown> } & Record<string, unknown>>(data);
};

export type { Contrato, Fiscalizacion, ChecklistItem, Multa };
