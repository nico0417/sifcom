import { IonInput, IonSelect, IonSelectOption } from '@ionic/react';
import { useCallback, useEffect, useState } from 'react';
import AppShell from '../components/AppShell';
import { useAuth } from '../context/AuthContext';
import {
  deleteFiscalizacion,
  listContratos,
  listFiscalizaciones,
  updateFiscalizacion,
  type Contrato,
  type Fiscalizacion,
} from '../services/api';
import { formatDate, nivelEstado } from '../utils/format';

const ESTADOS_REPORTE = [
  { value: 'CUMPLE', label: 'Cumple / Sin observaciones' },
  { value: 'ALERTA', label: 'Alerta de incumplimiento' },
  { value: 'MULTA', label: 'Multa aplicada' },
];

const normalizarEstadoSelect = (estado: string) => {
  const nivel = nivelEstado(estado);
  if (nivel === 'multa') return 'MULTA';
  if (nivel === 'alerta') return 'ALERTA';
  return 'CUMPLE';
};

const etiquetaEstado = (estado: string) => {
  const norm = normalizarEstadoSelect(estado);
  return ESTADOS_REPORTE.find((e) => e.value === norm)?.label || estado;
};

const HistorialReportes: React.FC = () => {
  const { user } = useAuth();
  const esAdmin = user?.rol === 'admin';
  const [reportes, setReportes] = useState<Fiscalizacion[]>([]);
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [editId, setEditId] = useState<number | null>(null);
  const [obra, setObra] = useState('');
  const [obs, setObs] = useState('');
  const [estadoEdit, setEstadoEdit] = useState('ALERTA');

  const cargar = useCallback(async () => {
    try {
      const [f, c] = await Promise.all([listFiscalizaciones(), listContratos()]);
      setReportes(f);
      setContratos(c);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'No se pudieron cargar los reportes');
    }
  }, []);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const nombreContrato = (id: number) =>
    contratos.find((c) => c.IdContrato === id)?.Giro || `Contrato #${id}`;

  const guardar = async (item: Fiscalizacion) => {
    try {
      await updateFiscalizacion(item.IdFiscalizacion, {
        Obra: obra.trim() || item.Obra,
        Ubicacion: item.Ubicacion,
        Foto: item.Foto,
        Observaciones: obs,
        FechaFisc: item.FechaFisc,
        Estado: estadoEdit,
        IdUser: item.IdUser,
        IdContrato: item.IdContrato,
      });
      setEditId(null);
      await cargar();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'No se pudo editar');
    }
  };

  const borrar = async (id: number) => {
    if (!window.confirm('¿Eliminar esta fiscalización?')) return;
    try {
      await deleteFiscalizacion(id);
      await cargar();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'No se pudo eliminar');
    }
  };

  return (
    <AppShell>
      <div className="sifcom-panel">
        <h2 className="sifcom-section-title">Historial De Reportes</h2>
        <div className="sifcom-list">
          {reportes.length === 0 && (
            <article className="sifcom-item">
              <p>No hay fiscalizaciones registradas.</p>
            </article>
          )}
          {reportes.map((r) => {
            const nivel = nivelEstado(r.Estado);
            return (
              <article key={r.IdFiscalizacion} className="sifcom-item">
                <h3>{r.Obra} - {nombreContrato(r.IdContrato)}</h3>
                <p>
                  📅 {formatDate(r.FechaFisc)}
                  {r.InspectorNombre ? ` · Inspector: ${r.InspectorNombre}` : ''}
                </p>
                {r.ChecklistResumen && <p>Checklist: {r.ChecklistResumen} cumplidos</p>}
                {editId === r.IdFiscalizacion ? (
                  <div className="sifcom-edit-box">
                    <label className="sifcom-edit-label">Asunto / Lugar</label>
                    <IonInput
                      className="sifcom-edit-input"
                      placeholder="Asunto o lugar"
                      value={obra}
                      onIonInput={(e) => setObra(e.detail.value ?? '')}
                    />
                    <label className="sifcom-edit-label">Observaciones</label>
                    <IonInput
                      className="sifcom-edit-input"
                      placeholder="Observaciones"
                      value={obs}
                      onIonInput={(e) => setObs(e.detail.value ?? '')}
                    />
                    <label className="sifcom-edit-label">Estado del reporte</label>
                    <IonSelect
                      className="sifcom-edit-select"
                      interface="popover"
                      value={estadoEdit}
                      onIonChange={(e) => setEstadoEdit(e.detail.value)}
                    >
                      {ESTADOS_REPORTE.map((op) => (
                        <IonSelectOption key={op.value} value={op.value}>
                          {op.label}
                        </IonSelectOption>
                      ))}
                    </IonSelect>
                    <div className="sifcom-item-actions">
                      <button type="button" onClick={() => void guardar(r)}>Guardar</button>
                      <button type="button" onClick={() => setEditId(null)}>Cancelar</button>
                    </div>
                  </div>
                ) : (
                  <>
                    {r.Observaciones && <p>{r.Observaciones}</p>}
                    <p className="sifcom-status">
                      <span className={`dot dot-${nivel}`} />
                      {etiquetaEstado(r.Estado)}
                    </p>
                    {esAdmin && (
                      <div className="sifcom-item-actions">
                        <button
                          type="button"
                          onClick={() => {
                            setEditId(r.IdFiscalizacion);
                            setObra(r.Obra);
                            setObs(r.Observaciones || '');
                            setEstadoEdit(normalizarEstadoSelect(r.Estado));
                          }}
                        >
                          Editar
                        </button>
                        <button type="button" onClick={() => void borrar(r.IdFiscalizacion)}>Eliminar</button>
                      </div>
                    )}
                  </>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
};

export default HistorialReportes;
