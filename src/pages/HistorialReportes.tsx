import { IonInput } from '@ionic/react';
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

const HistorialReportes: React.FC = () => {
  const { user } = useAuth();
  const esAdmin = user?.rol === 'admin';
  const [reportes, setReportes] = useState<Fiscalizacion[]>([]);
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [editId, setEditId] = useState<number | null>(null);
  const [obra, setObra] = useState('');
  const [obs, setObs] = useState('');

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
        Estado: item.Estado,
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
                  <>
                    <IonInput value={obra} onIonInput={(e) => setObra(e.detail.value ?? '')} />
                    <IonInput value={obs} onIonInput={(e) => setObs(e.detail.value ?? '')} />
                    <div className="sifcom-item-actions">
                      <button type="button" onClick={() => void guardar(r)}>Guardar</button>
                      <button type="button" onClick={() => setEditId(null)}>Cancelar</button>
                    </div>
                  </>
                ) : (
                  <>
                    {r.Observaciones && <p>{r.Observaciones}</p>}
                    <p className="sifcom-status">
                      <span className={`dot dot-${nivel}`} />
                      {r.Estado}
                    </p>
                    {esAdmin && (
                      <div className="sifcom-item-actions">
                        <button
                          type="button"
                          onClick={() => {
                            setEditId(r.IdFiscalizacion);
                            setObra(r.Obra);
                            setObs(r.Observaciones || '');
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
