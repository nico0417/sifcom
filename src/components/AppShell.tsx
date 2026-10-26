import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonContent,
  IonImg,
  IonMenuButton,
} from '@ionic/react';
import { useAuth } from '../context/AuthContext';

const AppShell: React.FC<{ children: React.ReactNode; title?: string }> = ({
  children,
  title = 'SIFCOM',
}) => {
  const { user } = useAuth();
  const nombre = user?.nombre?.trim() || 'Usuario';

  return (
    <IonPage className="sifcom-page">
      <IonHeader className="ion-no-border">
        <IonToolbar />
      </IonHeader>
      <IonContent className="sifcom-content" fullscreen>
        <div className="sifcom-wrap">
          <header className="sifcom-desktop-header">
            <div className="sifcom-desktop-left">
              <div className="sifcom-menu-block">
                <IonMenuButton autoHide={false} />
                <span>Menú</span>
              </div>
              <IonImg src="/logo.png" alt="SIFCOM" className="sifcom-logo-desktop" />
            </div>
            <h1 className="sifcom-title-desktop">{title}</h1>
            <div className="sifcom-desktop-user">
              <img src="/perfil.png" alt="Perfil" className="sifcom-avatar" />
              <p>Bienvenido {nombre}</p>
            </div>
          </header>

          <IonImg src="/logo.png" alt="SIFCOM" className="sifcom-logo" />
          <h1 className="sifcom-title">{title}</h1>
          {children}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default AppShell;
