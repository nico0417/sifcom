import {
  IonButton,
  IonCheckbox,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonTextarea,
} from '@ionic/react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../components/AppShell';
import { CHECKLIST_ITEMS } from '../data/mock';
import {
  createFiscalizacion,
  listChecklists,
  listContratos,
  type ChecklistItem,
  type Contrato,
} from '../services/api';

const NuevaFiscalizacion: React.FC = () => {
  const navigate = useNavigate();
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>(
    CHECKLIST_ITEMS.map((d, idx) => ({ IdChecklist: idx + 1, Descripcion: d })),
  );
  const [contrato, setContrato] = useState<number | ''>('');
  const [asunto, setAsunto] = useState('');
  const [checks, setChecks] = useState<boolean[]>([true, true, false]);
  const [foto, setFoto] = useState('');
  const [obs, setObs] = useState('');
  const [mensaje, setMensaje] = useState<{ texto: string; tipo: 'error' | 'ok' } | null>(null);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    listContratos()
      .then(setContratos)
      .catch(() => {
        setContratos([]);
      });
  }, []);

  useEffect(() => {
    const id = contrato ? Number(contrato) : undefined;
    listChecklists(id)
      .then((items) => {
        if (items.length > 0) {
          setChecklistItems(items);
          setChecks(items.map((_, i) => i < items.length - 1));
        }
      })
      .catch(() => {
        // Mantiene ítems por defecto si aún no responde la API
      });
  }, [contrato]);

  const toggleCheck = (index: number, checked: boolean) => {
    setChecks((prev) => prev.map((v, i) => (i === index ? checked : v)));
  };

  const estadoDesdeChecklist = () => {
    const total = checklistItems.length || 3;
    const ok = checks.filter(Boolean).length;
    if (ok === total) return 'CUMPLE';
    if (ok >= Math.ceil(total * 0.6)) return 'ALERTA';
    return 'MULTA';
  };

  const enviar = async () => {
    if (!contrato || !asunto.trim()) {
      setMensaje({ texto: 'Completa contrato y asunto para enviar la fiscalización', tipo: 'error' });
      return;
    }
    try {
      setEnviando(true);
      setMensaje(null);
      await createFiscalizacion({
        Obra: asunto.trim(),
        Ubicacion: 'Ubicación GPS Detectada (-33.045, -71.619)',
        Foto: foto || undefined,
        Observaciones: obs || undefined,
        Estado: estadoDesdeChecklist(),
        IdContrato: Number(contrato),
        Respuestas: checklistItems.map((item, idx) => ({
          IdChecklist: item.IdChecklist,
          Cumple: Boolean(checks[idx]),
        })),
      });
      setMensaje({ texto: 'Fiscalización enviada correctamente', tipo: 'ok' });
      setTimeout(() => navigate('/tabs/historial-reportes', { replace: true }), 600);
    } catch (err) {
      setMensaje({
        texto: err instanceof Error ? err.message : 'No se pudo enviar la fiscalización',
        tipo: 'error',
      });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <AppShell>
      <div className="sifcom-panel sifcom-form">
        <h2 className="sifcom-section-title">Nueva fiscalización</h2>

        {mensaje && (
          <div
            className={`form-banner ${mensaje.tipo === 'error' ? 'form-banner-error' : 'form-banner-ok'}`}
            role="status"
          >
            {mensaje.texto}
          </div>
        )}

        <label>Seleccionar contrato</label>
        <IonSelect
          placeholder="Seleccionar..."
          interface="popover"
          value={contrato}
          onIonChange={(e) => setContrato(e.detail.value)}
        >
          {contratos.map((c) => (
            <IonSelectOption key={c.IdContrato} value={c.IdContrato}>
              {c.Giro || c.Empresa}
            </IonSelectOption>
          ))}
        </IonSelect>

        <label>Asunto / Rubro</label>
        <IonInput
          placeholder="Ej: Plaza, Alumbrado..."
          value={asunto}
          onIonInput={(e) => setAsunto(e.detail.value ?? '')}
        />

        <label>Georreferenciación</label>
        <div className="sifcom-gps">
          <span>📍</span>
          <span>Ubicación GPS Detectada (-33.045, -71.619)</span>
        </div>

        <label>Checklist</label>
        {checklistItems.map((item, i) => (
          <label key={item.IdChecklist} className="sifcom-check-row">
            <IonCheckbox
              checked={Boolean(checks[i])}
              onIonChange={(e) => toggleCheck(i, Boolean(e.detail.checked))}
            />
            <span>{item.Descripcion}</span>
          </label>
        ))}

        <label>Evidencia fotográfica</label>
        <label className="sifcom-file">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFoto(e.target.files?.[0]?.name ?? '')}
          />
          📷 {foto || 'Adjuntar fotografía'}
        </label>

        <label>Observaciones</label>
        <IonTextarea
          placeholder="Ingresar Observaciones"
          value={obs}
          onIonInput={(e) => setObs(e.detail.value ?? '')}
        />

        <IonButton expand="block" className="sifcom-submit" disabled={enviando} onClick={() => void enviar()}>
          {enviando ? 'Enviando...' : 'Enviar Fiscalización'}
        </IonButton>
      </div>
    </AppShell>
  );
};

export default NuevaFiscalizacion;
