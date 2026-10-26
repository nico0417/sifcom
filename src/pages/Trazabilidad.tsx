import { useEffect, useState } from 'react';
import AppShell from '../components/AppShell';
import {
  listContratos,
  listFiscalizaciones,
  listMultas,
  type Contrato,
  type Fiscalizacion,
  type Multa,
} from '../services/api';
import { formatDate, formatMoney } from '../utils/format';

const Trazabilidad: React.FC = () => {
  const [items, setItems] = useState<Fiscalizacion[]>([]);
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [multas, setMultas] = useState<Multa[]>([]);

  useEffect(() => {
    Promise.all([
      listFiscalizaciones(),
      listContratos(),
      listMultas().catch(() => [] as Multa[]),
    ])
      .then(([f, c, m]) => {
        setItems(f);
        setContratos(c);
        setMultas(m);
      })
      .catch((err) => alert(err instanceof Error ? err.message : 'No se pudo cargar la trazabilidad'));
  }, []);

  const nombreContrato = (id: number) =>
    contratos.find((c) => c.IdContrato === id)?.Giro || `Contrato #${id}`;

  const multaDe = (idFiscalizacion: number) =>
    multas.find((m) => m.IdFiscalizacion === idFiscalizacion);

  return (
    <AppShell>
      <div className="sifcom-panel">
        <h2 className="sifcom-section-title">Historial y trazabilidad</h2>
        <div className="sifcom-list">
          {items.length === 0 && (
            <article className="sifcom-item">
              <p>No hay movimientos registrados.</p>
            </article>
          )}
          {items.map((t) => {
            const multa = multaDe(t.IdFiscalizacion);
            return (
              <article key={t.IdFiscalizacion} className="sifcom-item">
                <h3>Reporte #{String(t.IdFiscalizacion).padStart(4, '0')}</h3>
                {multa ? (
                  <p>Multa Aplicada → {formatMoney(multa.Monto)} ({multa.Motivo})</p>
                ) : (
                  <p>{t.Estado}{t.Observaciones ? ` → ${t.Observaciones}` : ''}</p>
                )}
                <p>
                  {formatDate(t.FechaFisc)}
                  {t.InspectorNombre ? ` · Responsable: ${t.InspectorNombre}` : ''}
                </p>
                <p>Ref: {t.Obra} ({nombreContrato(t.IdContrato)})</p>
              </article>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
};

export default Trazabilidad;
