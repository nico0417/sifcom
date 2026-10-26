import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonContent,
  IonInput,
  IonButton,
  IonImg,
} from '@ionic/react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { mapApiUser, useAuth } from '../context/AuthContext';
import api, { unwrapData } from '../services/api';

const emailValido = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

const Login: React.FC = () => {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [errores, setErrores] = useState<{ correo?: string; password?: string; general?: string }>({});
  const [cargando, setCargando] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const validar = () => {
    const next: { correo?: string; password?: string } = {};
    if (!correo.trim()) {
      next.correo = 'El correo es obligatorio';
    } else if (!emailValido(correo)) {
      next.correo = 'Correo inválido';
    }
    if (!password) {
      next.password = 'La contraseña es obligatoria';
    }
    setErrores(next);
    return Object.keys(next).length === 0;
  };

  const handleLogin = async () => {
    if (!validar()) return;
    try {
      setCargando(true);
      setErrores({});
      const { data } = await api.post('/auth/login', {
        Email: correo.trim(),
        Contrasena: password,
      });
      const payload = unwrapData<{ token: string; user: Record<string, unknown> }>(data);
      login(mapApiUser(payload.user), payload.token);
      navigate('/tabs/home', { replace: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'No se pudo iniciar sesión';
      setErrores({ general: msg, password: '¿La sesión expiró o te equivocaste en el usuario/contraseña?' });
    } finally {
      setCargando(false);
    }
  };

  return (
    <IonPage className="auth-page">
      <IonHeader className="ion-no-border">
        <IonToolbar />
      </IonHeader>
      <IonContent className="auth-content auth-split">
        <div className="auth-wrap">
          <IonImg src="/logo.png" alt="SIFCOM" className="auth-logo" />

          <div className="auth-card">
            <h1>Inicio de sesión</h1>
            <p className="auth-subtitle">Inicia sesión para continuar</p>

            {errores.general && (
              <div className="form-banner form-banner-error" role="alert">
                {errores.general}
              </div>
            )}

            <div className="field">
              <label className="field-label" htmlFor="login-correo">
                Correo <span className="required">*</span>
              </label>
              <IonInput
                id="login-correo"
                className={errores.correo ? 'input-error' : ''}
                placeholder="Ingresa tu correo"
                type="email"
                required
                value={correo}
                onIonInput={(e) => {
                  setCorreo(e.detail.value ?? '');
                  if (errores.correo) setErrores((prev) => ({ ...prev, correo: undefined }));
                }}
              />
              {errores.correo && <p className="field-error">{errores.correo}</p>}
            </div>

            <div className="field">
              <label className="field-label" htmlFor="login-password">
                Contraseña <span className="required">*</span>
              </label>
              <IonInput
                id="login-password"
                className={errores.password ? 'input-error' : ''}
                placeholder="Ingresa tu contraseña"
                type="password"
                required
                value={password}
                onIonInput={(e) => {
                  setPassword(e.detail.value ?? '');
                  if (errores.password) setErrores((prev) => ({ ...prev, password: undefined }));
                }}
              />
              {errores.password && <p className="field-error">{errores.password}</p>}
            </div>

            <div className="auth-actions">
              <IonButton expand="block" shape="round" disabled={cargando} onClick={() => void handleLogin()}>
                {cargando ? 'Ingresando...' : 'Iniciar Sesión'}
              </IonButton>
              <p className="login-link">
                ¿No tienes cuenta? <Link to="/register">Crea tu cuenta aquí</Link>
              </p>
            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Login;
