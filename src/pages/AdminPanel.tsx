import { IonButton } from '@ionic/react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../components/AppShell';

const AdminPanel: React.FC = () => {
  const navigate = useNavigate();

  const acciones = [
    { texto: 'Administrar Perfiles/Usuarios', ruta: '/tabs/perfil' },
    { texto: 'Asignar/Configurar Checklists', ruta: '/tabs/nueva-fiscalizacion' },
    { texto: 'Gestionar contratos y estados', ruta: '/tabs/contratos' },
    { texto: 'Administrar multas y trazabilidad', ruta: '/tabs/trazabilidad' },
  ];

  return (
    <AppShell>
      <div className="sifcom-panel">
        <h2 className="sifcom-section-title">Panel de administración</h2>
        <div className="admin-actions">
          {acciones.map((item) => (
            <IonButton
              key={item.texto}
              expand="block"
              onClick={() => navigate(item.ruta)}
            >
              {item.texto}
            </IonButton>
          ))}
        </div>
      </div>
    </AppShell>
  );
};

export default AdminPanel;
