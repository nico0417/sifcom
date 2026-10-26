import { IonButton, IonInput, IonSelect, IonSelectOption } from '@ionic/react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../components/AppShell';
import { mapApiUser, useAuth } from '../context/AuthContext';
import { COMUNAS } from '../data/mock';
import { updatePerfilUsuario } from '../services/api';

const Perfil: React.FC = () => {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const permiso = user?.rol === 'admin' ? 'Administrador Municipal' : 'Inspector';

  const [nombre, setNombre] = useState(user?.nombre || 'Usuario');
  const [correo, setCorreo] = useState(user?.correo || '');
  const [password, setPassword] = useState('');
  const [comuna, setComuna] = useState(user?.comuna || 'Valparaíso');
  const [mensaje, setMensaje] = useState<{ texto: string; tipo: 'ok' | 'error' } | null>(null);
  const [guardando, setGuardando] = useState(false);

  const guardar = async () => {
    if (!nombre.trim() || !correo.trim()) {
      setMensaje({ texto: 'Completa nombre y correo', tipo: 'error' });
      return;
    }
    if (password && (password.length < 8 || !/\d/.test(password))) {
      setMensaje({
        texto: 'La nueva contraseña debe tener al menos 8 caracteres y un número',
        tipo: 'error',
      });
      return;
    }

    try {
      setGuardando(true);
      setMensaje(null);
      const res = await updatePerfilUsuario({
        Nombre: nombre.trim(),
        Email: correo.trim(),
        Comuna: comuna,
        ...(password ? { Contrasena: password } : {}),
      });
      if (res?.user) {
        updateUser(mapApiUser(res.user));
      } else {
        updateUser({ nombre: nombre.trim(), correo: correo.trim(), comuna });
      }
      setPassword('');
      setMensaje({ texto: 'Cambios guardados correctamente', tipo: 'ok' });
    } catch {
      updateUser({ nombre: nombre.trim(), correo: correo.trim(), comuna });
      setMensaje({ texto: 'Cambios guardados en la sesión actual', tipo: 'ok' });
    } finally {
      setGuardando(false);
    }
  };

  const salir = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <AppShell title="Perfil del usuario">
      <div className="sifcom-panel perfil-panel">
        <img src="/perfil.png" alt="Perfil" className="perfil-avatar" />

        <div className="perfil-card">
          <h2>Datos personales</h2>
          <p className="perfil-hint">Seleccione el dato que desea modificar</p>

          {mensaje && (
            <div
              className={`form-banner ${mensaje.tipo === 'error' ? 'form-banner-error' : 'form-banner-ok'}`}
              role="status"
            >
              {mensaje.texto}
            </div>
          )}

          <div className="perfil-grid">
            <div className="field">
              <label className="field-label">Nombre</label>
              <IonInput
                placeholder="Usuario"
                value={nombre}
                onIonInput={(e) => setNombre(e.detail.value ?? '')}
              />
            </div>
            <div className="field">
              <label className="field-label">Comuna</label>
              <IonSelect
                interface="popover"
                value={comuna}
                onIonChange={(e) => setComuna(e.detail.value)}
              >
                {COMUNAS.map((c) => (
                  <IonSelectOption key={c} value={c}>
                    {c}
                  </IonSelectOption>
                ))}
              </IonSelect>
            </div>
            <div className="field">
              <label className="field-label">Correo</label>
              <IonInput
                type="email"
                placeholder="micorreo@gmail.com"
                value={correo}
                onIonInput={(e) => setCorreo(e.detail.value ?? '')}
              />
            </div>
            <div className="field">
              <label className="field-label">
                Permisos actuales <span className="required">*</span>
              </label>
              <IonInput className="permiso-locked" value={permiso} readonly disabled />
            </div>
            <div className="field">
              <label className="field-label">Contraseña</label>
              <IonInput
                type="password"
                placeholder="********"
                value={password}
                onIonInput={(e) => setPassword(e.detail.value ?? '')}
              />
            </div>
          </div>

          <IonButton className="perfil-save" disabled={guardando} onClick={() => void guardar()}>
            {guardando ? 'Guardando...' : 'Guardar cambios'}
          </IonButton>
          <p className="login-link perfil-logout">
            <button type="button" onClick={salir}>Cerrar sesión</button>
          </p>
        </div>
      </div>
    </AppShell>
  );
};

export default Perfil;
