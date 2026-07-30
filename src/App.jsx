import { useEffect, useMemo, useState } from 'react';
import './App.css';
import Header from './components/layout/Header';
import MenuLateral from './components/layout/MenuLateral';
import PanelPrincipal from './components/panel/PanelPrincipal.jsx';
import Login from './components/vistas/login/Login.jsx';
import SelectorPerfil from './components/vistas/login/SelectorPerfil.jsx';
import { obtenerVistaInicial, vistaPermitida } from './components/util/menuConfig';
import { contarNotificacionesNoLeidas } from './components/util/notificaciones';
import { obtenerUsuarios } from './components/util/usuarios';
import { demoNecesitaReinicio, marcarDemoInicializado } from './components/util/demoSeed';

function App() {

  const [usuarioActual, setUsuarioActual] = useState(() => {
    const guardado = localStorage.getItem('usuario_actual');
    return guardado ? JSON.parse(guardado) : null;
  });

  // 🆕 Estado para cambio de perfil sin cerrar sesión
  const [seleccionandoPerfil, setSeleccionandoPerfil] = useState(false);

  const vistaInicial = useMemo(
    () => obtenerVistaInicial(usuarioActual?.rol),
    [usuarioActual]
  );

  const [estadoActual, setEstado] = useState(vistaInicial || 'inicio');
  const [menuAbierto, setMenuAbierto] = useState(true);
  const [notificacionesNoLeidas, setNotificacionesNoLeidas] = useState(0);

  // ── Contar notificaciones no leídas ──────────────────────────────────────
  const contarNoLeidas = (usuario) => contarNotificacionesNoLeidas(usuario.cedula);

  // ── Reiniciar demo al cambiar de versión del prototipo ───────────────────
  useEffect(() => {
    if (!demoNecesitaReinicio()) return;

    [
      'usuario_actual',
      'usuarios_scholarlink',
      'grupos_scholarlink',
      'estudiantes_scholarlink',
      'mensajes_scholarlink',
      'comunicados_scholarlink',
      'actividades_scholarlink',
      'notificaciones_scholarlink',
      'historial_scholarlink',
      'sesiones'
    ].forEach((key) => localStorage.removeItem(key));

    marcarDemoInicializado();
    setUsuarioActual(null);
  }, []);

  // ── Asegurar usuarios demo y sesión válida ───────────────────────────────
  useEffect(() => {
    const usuarios = obtenerUsuarios();
    const guardado = localStorage.getItem('usuario_actual');
    if (!guardado) return;

    try {
      const sesion = JSON.parse(guardado);
      let usuarioSesion = usuarios.find((u) => u.cedula === sesion.cedula);

      if (!usuarioSesion && sesion?.rol === 'estudiante') {
        usuarioSesion = usuarios.find((u) => u.cedula === '4');
      }

      if (!usuarioSesion) {
        localStorage.removeItem('usuario_actual');
        setUsuarioActual(null);
        return;
      }

      const rolSeguro = usuarioSesion.roles?.includes(sesion.rol)
        ? sesion.rol
        : (usuarioSesion.rol || usuarioSesion.roles?.[0]);

      const actualizado = { ...usuarioSesion, rol: rolSeguro };
      localStorage.setItem('usuario_actual', JSON.stringify(actualizado));
      setUsuarioActual(actualizado);
    } catch {
      localStorage.removeItem('usuario_actual');
      setUsuarioActual(null);
    }
  }, []);

  // ── Validar que la vista actual es permitida para el rol ─────────────────
  useEffect(() => {
    if (!usuarioActual) return;

    const vistaSegura = vistaPermitida(usuarioActual.rol, estadoActual)
      ? estadoActual
      : obtenerVistaInicial(usuarioActual.rol);

    if (vistaSegura !== estadoActual) {
      setEstado(vistaSegura);
    }
  }, [usuarioActual, estadoActual]);

  // ── Al cambiar de usuario → ir a vista inicial del nuevo rol ─────────────
  useEffect(() => {
    if (!usuarioActual) {
      setEstado('inicio');
      return;
    }
    setEstado(obtenerVistaInicial(usuarioActual.rol));
  }, [usuarioActual]);

  // ── Actualizar contador de notificaciones ────────────────────────────────
  useEffect(() => {
    if (!usuarioActual) return;

    const actualizar = () => {
      setNotificacionesNoLeidas(contarNoLeidas(usuarioActual));
    };

    window.addEventListener('notificacionesActualizadas', actualizar);
    actualizar();

    return () => {
      window.removeEventListener('notificacionesActualizadas', actualizar);
    };
  }, [usuarioActual]);

  // ── Cerrar sesión ─────────────────────────────────────────────────────────
  const cerrarSesion = () => {
    localStorage.removeItem('usuario_actual');
    setUsuarioActual(null);
    setSeleccionandoPerfil(false);
  };

  // ── Cambiar perfil sin cerrar sesión ─────────────────────────────────────
  const onCambiarPerfil = () => setSeleccionandoPerfil(true);

  const onSeleccionarPerfil = (rolSeleccionado) => {
    const actualizado = { ...usuarioActual, rol: rolSeleccionado };
    localStorage.setItem('usuario_actual', JSON.stringify(actualizado));
    setUsuarioActual(actualizado);
    setSeleccionandoPerfil(false);
    setEstado(obtenerVistaInicial(rolSeleccionado));
  };

  // ── Sin sesión → mostrar login ────────────────────────────────────────────
  if (!usuarioActual) {
    return <Login setUsuario={setUsuarioActual} />;
  }

  // ── Con sesión pero eligiendo perfil → pantalla de selección ─────────────
  if (seleccionandoPerfil) {
    return (
      <div className="app-shell">
        <div className="app-container">
          <Header
            usuario={usuarioActual}
            onCerrarSesion={cerrarSesion}
            onCambiarPerfil={onCambiarPerfil}
            setEstado={setEstado}
          />
          <SelectorPerfil
            usuario={usuarioActual}
            onSeleccionar={onSeleccionarPerfil}
          />
        </div>
      </div>
    );
  }

  // ── UI principal ──────────────────────────────────────────────────────────
  return (
    <div className="app-shell">
      <div className="app-container">

        <Header
          usuario={usuarioActual}
          onCerrarSesion={cerrarSesion}
          onCambiarPerfil={onCambiarPerfil}
          setEstado={setEstado}
        />

        <div className="layout-principal">

          <MenuLateral
            rol={usuarioActual.rol}
            setEstado={setEstado}
            estadoActual={estadoActual}
            menuAbierto={menuAbierto}
            setMenuAbierto={setMenuAbierto}
            notificacionesNoLeidas={notificacionesNoLeidas}
          />

          <PanelPrincipal
            estadoActual={estadoActual}
            usuarioActual={usuarioActual}
            setEstado={setEstado}
            setUsuarioActual={setUsuarioActual}
          />

        </div>
      </div>
    </div>
  );
}

export default App;
