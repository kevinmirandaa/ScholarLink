import { useState } from 'react';
import LoginForm from './LoginForm';
import CambiarPasswordForm from './CambiarPasswordForm';
import RecuperarPasswordForm from './RecuperarPasswordForm';
import SelectorPerfil from './SelectorPerfil';
import { login, recuperarPassword, cambiarPassword } from '../../util/authService';
import { registrarSesion } from '../../util/sesiones';
import './Login.css';

// Flujo completo:
// login → (multi-rol → seleccionarPerfil) → (primerAcceso → cambiar) → dashboard

function Login({ setUsuario }) {
  const [modo, setModo] = useState('login');

  // Usuario base autenticado (antes de elegir rol o cambiar contraseña)
  const [usuarioBase, setUsuarioBase] = useState(null);

  // Usuario temporal con rol ya seleccionado (pendiente de cambio de contraseña)
  const [usuarioTemp, setUsuarioTemp] = useState(null);

  // ── Paso 1: autenticar cédula + contraseña ──────────────────────────────
  const iniciarSesion = (cedula, password) => {
    const resultado = login(cedula, password);

    if (resultado.error) {
      return resultado.error; // LoginForm muestra el error inline
    }

    const user = resultado.user;
    const roles = user.roles?.length > 0 ? user.roles : [user.rol];

    // Si tiene más de un rol → elegir perfil primero
    if (roles.length > 1) {
      setUsuarioBase(user);
      setModo('seleccionarPerfil');
      return null;
    }

    // Un solo rol → asignar directamente
    const userConRol = { ...user, rol: roles[0] };
    continuarTrasRol(userConRol, resultado.primerAcceso);
    return null;
  };

  // ── Paso 2 (solo multi-rol): el usuario elige su perfil ─────────────────
  const manejarSeleccionPerfil = (rolSeleccionado) => {
    const userConRol = { ...usuarioBase, rol: rolSeleccionado };
    const primerAcceso = usuarioBase.primerAcceso;
    setUsuarioBase(null);
    continuarTrasRol(userConRol, primerAcceso);
  };

  // ── Paso 3: ¿primer acceso? → forzar cambio de contraseña ───────────────
  const continuarTrasRol = (user, primerAcceso) => {
    if (primerAcceso) {
      setUsuarioTemp(user);
      setModo('cambiar');
      return;
    }
    completarIngreso(user);
  };

  // ── Cambio obligatorio de contraseña ────────────────────────────────────
  const manejarCambio = (nueva, confirmacion) => {
    const resultado = cambiarPassword(usuarioTemp, nueva, confirmacion);

    if (resultado.error) {
      return resultado.error;
    }

    setUsuarioTemp(null);
    completarIngreso(resultado.user);
    return null;
  };

  // ── Recuperación de contraseña ───────────────────────────────────────────
  const manejarRecuperar = (cedula, nueva, confirmacion) => {
    const resultado = recuperarPassword(cedula, nueva, confirmacion);

    if (resultado.error) {
      return resultado.error;
    }

    completarIngreso(resultado.user);
    return null;
  };

  // ── Finalizar ingreso ────────────────────────────────────────────────────
  const completarIngreso = (user) => {
    registrarSesion(user);
    localStorage.setItem('usuario_actual', JSON.stringify(user));
    setUsuario(user);
  };

  return (
    <div className="login-layout">

      {/* Panel izquierdo decorativo */}
      <div className="login-side">
        <div className="login-side-content">
          <h1>Plataforma Educativa</h1>
          <p>
            Sistema institucional de comunicación, gestión académica y
            seguimiento estudiantil.
          </p>
        </div>
      </div>

      {/* Panel derecho — formularios */}
      <div className="login-main">

        {modo === 'login' && (
          <LoginForm onLogin={iniciarSesion} setModo={setModo} />
        )}

        {modo === 'seleccionarPerfil' && usuarioBase && (
          <SelectorPerfil
            usuario={usuarioBase}
            onSeleccionar={manejarSeleccionPerfil}
          />
        )}

        {modo === 'cambiar' && (
          <CambiarPasswordForm
            onCambiarPassword={manejarCambio}
            cedulaUsuario={usuarioTemp?.cedula}
          />
        )}

        {modo === 'recuperar' && (
          <RecuperarPasswordForm
            onRecuperar={manejarRecuperar}
            onVolver={() => setModo('login')}
          />
        )}

      </div>
    </div>
  );
}

export default Login;
