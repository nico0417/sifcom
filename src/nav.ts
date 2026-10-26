import type { NavItem, Role } from './interfaces/sifcom';

export type { NavItem };

export const NAV_ITEMS: NavItem[] = [
  { id: 'home', href: '/tabs/home', label: 'Home', icon: '/home.png', roles: ['inspector', 'admin'] },
  {
    id: 'nueva',
    href: '/tabs/nueva-fiscalizacion',
    label: 'Nueva fiscalización',
    icon: '/nuevaFisc.png',
    roles: ['inspector', 'admin'],
  },
  {
    id: 'reportes',
    href: '/tabs/historial-reportes',
    label: 'Historial de reportes',
    icon: '/Reportes.png',
    roles: ['inspector', 'admin'],
  },
  { id: 'contratos', href: '/tabs/contratos', label: 'Contratos', icon: '/Contratos.png', roles: ['admin'] },
  {
    id: 'trazabilidad',
    href: '/tabs/trazabilidad',
    label: 'Historial y trazabilidad',
    icon: '/Historial.webp',
    roles: ['admin'],
  },
  {
    id: 'admin',
    href: '/tabs/admin',
    label: 'Panel de administración',
    icon: '/AdminPanel.avif',
    roles: ['admin'],
  },
  { id: 'perfil', href: '/tabs/perfil', label: 'Perfil', icon: '/perfil.png', roles: ['inspector', 'admin'] },
];

export const navForRole = (rol: Role) => NAV_ITEMS.filter((item) => item.roles.includes(rol));
