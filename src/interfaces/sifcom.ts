export type Role = 'inspector' | 'admin';

export type PermisoBackend = 'ADMIN' | 'INSPECTOR';

export interface AuthUser {
  id: number;
  nombre: string;
  correo: string;
  rol: Role;
  comuna: string;
  permisos: PermisoBackend;
}

export interface Contrato {
  IdContrato: number;
  Empresa: string;
  Giro: string;
  Presupuesto: string | number;
  Vigencia: string;
}

export interface ChecklistItem {
  IdChecklist: number;
  Descripcion: string;
}

export interface Fiscalizacion {
  IdFiscalizacion: number;
  Obra: string;
  Ubicacion: string | null;
  Foto: string | null;
  Observaciones: string | null;
  FechaFisc: string;
  Estado: string;
  IdUser: number;
  IdContrato: number;
  InspectorNombre?: string;
  ChecklistResumen?: string;
}

export interface Multa {
  IdMulta: number;
  Monto: string | number;
  Motivo: string;
  FechaMulta: string;
  IdContrato: number;
  IdFiscalizacion: number;
}

export interface NavItem {
  id: string;
  href: string;
  label: string;
  icon: string;
  roles: Role[];
}
