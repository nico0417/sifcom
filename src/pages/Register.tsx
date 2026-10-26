import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonContent,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonText,
  IonImg,
} from '@ionic/react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { COMUNAS } from '../data/mock';
import api from '../services/api';

const emailValido = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

interface ErroresRegistro {
  nombre?: string;
  comuna?: string;
  correo?: string;
  correo2?: string;
  password?: string;
  password2?: string;
  general?: string;
}

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [nombre, setNombreCompleto] = useState('');
  const [comuna, setComuna] = useState('');
  const [correo, setCorreo] = useState('');
  const [correo2, setCorreo2] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [errores, setErrores] = useState<ErroresRegistro>({});
  const [exito, setExito] = useState('');
  const [cargando, setCargando] = useState(false);

  const validar = (): boolean => {
    const next: ErroresRegistro = {};
    if (!nombre.trim()) next.nombre = 'Campo obligatorio';
    if (!comuna) next.comuna = 'Selecciona una comuna';
    if (!correo.trim()) {
      next.correo = 'Campo obligatorio';
    } else if (!emailValido(correo)) {
      next.correo = 'Formato de correo inválido';
    }
    if (!correo2.trim()) {
      next.correo2 = 'Confirma tu correo';
    } else if (correo.trim().toLowerCase() !== correo2.trim().toLowerCase()) {
      next.correo2 = 'Los correos no coinciden';
    }
    if (!password) {
      next.password = 'Campo obligatorio';
    } else if (password.length < 8 || !/\d/.test(password)) {
      next.password = 'Debe contener al menos 8 caracteres y un número';
    }
    if (!password2) {
      next.password2 = 'Confirma tu contraseña';
    } else if (password !== password2) {
      next.password2 = 'Las contraseñas no coinciden';
    }
    setErrores(next);
    return Object.keys(next).length === 0;
  };

  const handleRegister = async () => {
    if (!validar()) return;
    try {
      setCargando(true);
      setErrores({});
      await api.post('/auth/register', {
        Email: correo.trim(),
        Nombre: nombre.trim(),
        Comuna: comuna,
        Contrasena: password,
      });
      setExito('Cuenta creada exitosamente. Redirigiendo a inicio de sesión...');
      setTimeout(() => navigate('/login'), 900);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'No se pudo crear la cuenta';
      setErrores({ general: msg });
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
          <IonImg src="/logo.png" alt="Logo SIFCOM" className="auth-logo" />

          <div className="auth-card">
            <h1>Crear cuenta</h1>
            <p className="auth-subtitle">Completa tus datos para continuar</p>

            {errores.general && (
              <div className="form-banner form-banner-error" role="alert">
                {errores.general}
              </div>
            )}
            {exito && (
              <div className="form-banner form-banner-ok" role="status">
                {exito}
              </div>
            )}

            <div className="field">
              <label className="field-label" htmlFor="reg-nombre">
                Nombre completo <span className="required">*</span>
              </label>
              <IonInput
                id="reg-nombre"
                className={errores.nombre ? 'input-error' : ''}
                placeholder="Escribe tu nombre"
                type="text"
                required
                value={nombre}
                onIonInput={(e) => {
                  setNombreCompleto(e.detail.value ?? '');
                  if (errores.nombre) setErrores((p) => ({ ...p, nombre: undefined }));
                }}
              />
              {errores.nombre && <p className="field-error">{errores.nombre}</p>}
            </div>

            <div className="field">
              <label className="field-label">
                Selecciona comuna <span className="required">*</span>
              </label>
              <IonSelect
                className={errores.comuna ? 'input-error' : ''}
                placeholder="Seleccionar..."
                interface="popover"
                value={comuna}
                onIonChange={(e) => {
                  setComuna(e.detail.value);
                  if (errores.comuna) setErrores((p) => ({ ...p, comuna: undefined }));
                }}
              >
                {COMUNAS.map((c) => (
                  <IonSelectOption key={c} value={c}>
                    {c}
                  </IonSelectOption>
                ))}
              </IonSelect>
              {errores.comuna && <p className="field-error">{errores.comuna}</p>}
            </div>

            <div className="field">
              <label className="field-label" htmlFor="reg-correo">
                Correo <span className="required">*</span>
              </label>
              <IonInput
                id="reg-correo"
                className={errores.correo ? 'input-error' : ''}
                placeholder="Escribe tu correo"
                type="email"
                required
                value={correo}
                onIonInput={(e) => {
                  setCorreo(e.detail.value ?? '');
                  if (errores.correo) setErrores((p) => ({ ...p, correo: undefined }));
                }}
              />
              {errores.correo && <p className="field-error">{errores.correo}</p>}
            </div>

            <div className="field">
              <label className="field-label" htmlFor="reg-correo2">
                Confirmar correo <span className="required">*</span>
              </label>
              <IonInput
                id="reg-correo2"
                className={errores.correo2 ? 'input-error' : ''}
                placeholder="Confirma tu correo"
                type="email"
                required
                value={correo2}
                onIonInput={(e) => {
                  setCorreo2(e.detail.value ?? '');
                  if (errores.correo2) setErrores((p) => ({ ...p, correo2: undefined }));
                }}
              />
              {errores.correo2 && <p className="field-error">{errores.correo2}</p>}
            </div>

            <div className="field">
              <label className="field-label" htmlFor="reg-password">
                Contraseña <span className="required">*</span>
              </label>
              <IonInput
                id="reg-password"
                className={errores.password ? 'input-error' : ''}
                placeholder="Escribe tu contraseña"
                type="password"
                required
                value={password}
                onIonInput={(e) => {
                  setPassword(e.detail.value ?? '');
                  if (errores.password) setErrores((p) => ({ ...p, password: undefined }));
                }}
              />
              {errores.password && <p className="field-error">{errores.password}</p>}
            </div>
            <IonText color="medium">
              <p className="hint">Debe contener al menos 8 caracteres con números</p>
            </IonText>

            <div className="field">
              <label className="field-label" htmlFor="reg-password2">
                Confirmar contraseña <span className="required">*</span>
              </label>
              <IonInput
                id="reg-password2"
                className={errores.password2 ? 'input-error' : ''}
                placeholder="Confirma tu contraseña"
                type="password"
                required
                value={password2}
                onIonInput={(e) => {
                  setPassword2(e.detail.value ?? '');
                  if (errores.password2) setErrores((p) => ({ ...p, password2: undefined }));
                }}
              />
              {errores.password2 && <p className="field-error">{errores.password2}</p>}
            </div>

            <div className="auth-actions">
              <p className="terms">Al registrarse acepta términos y condiciones</p>

              <IonButton expand="block" disabled={cargando} onClick={() => void handleRegister()}>
                {cargando ? 'CREANDO...' : 'CREAR CUENTA'}
              </IonButton>

              <p className="login-link">
                ¿Ya tienes cuenta? <Link to="/login">Inicia sesión aquí</Link>
              </p>
            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Register;
