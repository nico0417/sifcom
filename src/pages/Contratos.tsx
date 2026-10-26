import { IonButton, IonInput } from '@ionic/react';
import { useCallback, useEffect, useState } from 'react';
import AppShell from '../components/AppShell';
import {
  createContrato,
  deleteContrato,
  listContratos,
  listFiscalizaciones,
  updateContrato,
  type Contrato,
  type Fiscalizacion,
} from '../services/api';
import { formatDate, formatMoney, nivelEstado } from '../utils/format';

const alertaTexto = (n: number) => {
  if (n === 0) return '0 Alertas registradas';
  if (n === 1) return '1 Alerta registrada';
  return `${n} Alertas registradas`;
};

const vacio = { Empresa: '', Giro: '', Presupuesto: '', Vigencia: '' };

const Contratos: React.FC = () => {
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [fiscalizaciones, setFiscalizaciones] = useState<Fiscalizacion[]>([]);
  const [form, setForm] = useState(vacio);
  const [editId, setEditId] = useState<number | null>(null);
  const [mostrarForm, setMostrarForm] = useState(false);

  const cargar = useCallback(async () => {
    try {
      const [c, f] = await Promise.all([listContratos(), listFiscalizaciones()]);
      setContratos(c);
      setFiscalizaciones(f);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'No se pudieron cargar los contratos');
    }
  }, []);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const alertasDe = (id: number) => {
    const rel = fiscalizaciones.filter((f) => f.IdContrato === id);
    const alertas = rel.filter((f) => nivelEstado(f.Estado) !== 'ok');
    const nivel = rel.some((f) => nivelEstado(f.Estado) === 'multa')
      ? 'multa'
      : alertas.length
        ? 'alerta'
        : 'ok';
    return { n: alertas.length, nivel };
  };

  const guardar = async () => {
    if (!form.Empresa.trim() || !form.Giro.trim() || !form.Presupuesto || !form.Vigencia) {
      alert('Completa Empresa, Giro, Presupuesto y Vigencia');
      return;
    }
    try {
      const payload = {
        Empresa: form.Empresa.trim(),
        Giro: form.Giro.trim(),
        Presupuesto: form.Presupuesto,
        Vigencia: form.Vigencia,
      };
      if (editId) await updateContrato(editId, payload);
      else await createContrato(payload);
      setForm(vacio);
      setEditId(null);
      setMostrarForm(false);
      await cargar();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'No se pudo guardar el contrato');
    }
  };

  const editar = (c: Contrato) => {
    setEditId(c.IdContrato);
    setForm({
      Empresa: c.Empresa,
      Giro: c.Giro,
      Presupuesto: String(c.Presupuesto),
      Vigencia: String(c.Vigencia).slice(0, 10),
    });
    setMostrarForm(true);
  };

  const borrar = async (id: number) => {
    if (!window.confirm('¿Eliminar este contrato?')) return;
    try {
      await deleteContrato(id);
      await cargar();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'No se pudo eliminar');
    }
  };

  return (
    <AppShell>
      <div className="sifcom-panel">
        <h2 className="sifcom-section-title">Contratos</h2>
        <IonButton
          expand="block"
          className="sifcom-submit"
          onClick={() => {
            setMostrarForm((v) => !v);
            setEditId(null);
            setForm(vacio);
          }}
        >
          {mostrarForm && !editId ? 'Cancelar' : 'Nuevo contrato'}
        </IonButton>

        {mostrarForm && (
          <div className="sifcom-form">
            <label>Giro / Nombre</label>
            <IonInput value={form.Giro} onIonInput={(e) => setForm({ ...form, Giro: e.detail.value ?? '' })} />
            <label>Empresa</label>
            <IonInput value={form.Empresa} onIonInput={(e) => setForm({ ...form, Empresa: e.detail.value ?? '' })} />
            <label>Presupuesto</label>
            <IonInput value={form.Presupuesto} onIonInput={(e) => setForm({ ...form, Presupuesto: e.detail.value ?? '' })} />
            <label>Vigencia</label>
            <IonInput type="date" value={form.Vigencia} onIonInput={(e) => setForm({ ...form, Vigencia: e.detail.value ?? '' })} />
            <IonButton expand="block" className="sifcom-submit" onClick={() => void guardar()}>
              {editId ? 'Guardar cambios' : 'Crear contrato'}
            </IonButton>
          </div>
        )}

        <div className="sifcom-list">
          {contratos.length === 0 && (
            <article className="sifcom-item">
              <p>No hay contratos registrados.</p>
            </article>
          )}
          {contratos.map((c) => {
            const { n, nivel } = alertasDe(c.IdContrato);
            return (
              <article key={c.IdContrato} className="sifcom-item">
                <h3>{c.Giro || `Contrato #${c.IdContrato}`}</h3>
                <p>Empresa: {c.Empresa}</p>
                <p>Presupuesto: {formatMoney(c.Presupuesto)}</p>
                <p>Vigencia: {formatDate(String(c.Vigencia))}</p>
                <p className="sifcom-status">
                  <span className={`dot dot-${nivel}`} />
                  {alertaTexto(n)}
                </p>
                <div className="sifcom-item-actions">
                  <button type="button" onClick={() => editar(c)}>Editar</button>
                  <button type="button" onClick={() => void borrar(c.IdContrato)}>Eliminar</button>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
};

export default Contratos;
