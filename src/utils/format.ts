export const formatMoney = (value: string | number) => {
  const n = Number(String(value).replace(/[^\d.-]/g, ''));
  if (Number.isNaN(n)) return String(value);
  return `$${n.toLocaleString('es-CL')}`;
};

export const formatDate = (value: string) => {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('es-CL');
};

export const nivelEstado = (estado: string) => {
  const e = (estado || '').toLowerCase();
  if (e.includes('multa')) return 'multa' as const;
  if (e.includes('alerta') || e.includes('incumpl') || e.includes('pendiente')) return 'alerta' as const;
  return 'ok' as const;
};
