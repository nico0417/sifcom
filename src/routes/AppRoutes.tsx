import { Navigate, Route } from 'react-router-dom';
import {
  IonContent,
  IonHeader,
  IonItem,
  IonList,
  IonMenu,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import Register from '../pages/Register';
import Login from '../pages/Login';
import Home from '../pages/Home';
import NuevaFiscalizacion from '../pages/NuevaFiscalizacion';
import HistorialReportes from '../pages/HistorialReportes';
import Contratos from '../pages/Contratos';
import Trazabilidad from '../pages/Trazabilidad';
import AdminPanel from '../pages/AdminPanel';
import Perfil from '../pages/Perfil';
import { useAuth } from '../context/AuthContext';
import { navForRole } from '../nav';

export const RequireAdmin: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  if (user?.rol !== 'admin') {
    return <Navigate to="/tabs/home" replace />;
  }
  return <>{children}</>;
};

export const MainTabs: React.FC = () => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const items = navForRole(user.rol);

  return (
    <>
      <IonMenu className="sifcom-menu" contentId="main-content" type="overlay">
        <IonHeader className="ion-no-border">
          <IonToolbar>
            <IonTitle>Menú</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <IonList lines="none" className="sifcom-menu-list">
            {items.map((item) => (
              <IonItem key={item.id} routerLink={item.href} routerDirection="root" detail={false}>
                {item.label}
              </IonItem>
            ))}
          </IonList>
        </IonContent>
      </IonMenu>
      <IonTabs>
        <IonRouterOutlet id="main-content">
          <Route path="home" element={<Home />} />
          <Route path="nueva-fiscalizacion" element={<NuevaFiscalizacion />} />
          <Route path="historial-reportes" element={<HistorialReportes />} />
          <Route
            path="contratos"
            element={(
              <RequireAdmin>
                <Contratos />
              </RequireAdmin>
            )}
          />
          <Route
            path="trazabilidad"
            element={(
              <RequireAdmin>
                <Trazabilidad />
              </RequireAdmin>
            )}
          />
          <Route
            path="admin"
            element={(
              <RequireAdmin>
                <AdminPanel />
              </RequireAdmin>
            )}
          />
          <Route path="perfil" element={<Perfil />} />
          <Route path="inicio" element={<Navigate to="/tabs/home" replace />} />
          <Route path="" element={<Navigate to="/tabs/home" replace />} />
        </IonRouterOutlet>
        <IonTabBar slot="bottom" className="main-tab-bar">
          {items.map((item) => (
            <IonTabButton key={item.id} tab={item.id} href={item.href}>
              <img className="tab-img" src={item.icon} alt={item.label} />
            </IonTabButton>
          ))}
        </IonTabBar>
      </IonTabs>
    </>
  );
};

const AppRoutes: React.FC = () => (
  <IonReactRouter>
    <IonRouterOutlet>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/registro" element={<Navigate to="/register" replace />} />
      <Route path="/tabs/*" element={<MainTabs />} />
      <Route path="/inicio" element={<Navigate to="/tabs/home" replace />} />
      <Route path="/" element={<Navigate to="/login" replace />} />
    </IonRouterOutlet>
  </IonReactRouter>
);

export default AppRoutes;
