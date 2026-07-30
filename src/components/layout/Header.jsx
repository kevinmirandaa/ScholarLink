import { useState, useRef, useEffect } from 'react';
import './Header.css';

// Avatar por iniciales
function Avatar({ nombre, size = 38 }) {
  const iniciales = nombre
    ? nombre.split(' ').slice(0, 2).map(p => p[0]).join('').toUpperCase()
    : '?';
  return (
    <div
      className="header-avatar"
      style={{ width: size, height: size, fontSize: size * 0.38 }}
      aria-label={`Avatar de ${nombre}`}
    >
      {iniciales}
    </div>
  );
}

const LABEL_ROL = {
  administrativo: 'Administrativo',
  docente: 'Docente',
  encargado: 'Encargado',
  estudiante: 'Estudiante',
};

function Header({ usuario, onCerrarSesion, onCambiarPerfil, setEstado }) {
  const tieneMultiRol = usuario?.roles?.length > 1;
  const [dropdownAbierto, setDropdownAbierto] = useState(false);
  const dropRef = useRef(null);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setDropdownAbierto(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const irAPerfil = () => {
    setDropdownAbierto(false);
    if (setEstado) setEstado('perfil');
  };

  const handleCambiarPerfil = () => {
    setDropdownAbierto(false);
    onCambiarPerfil();
  };

  const handleCerrarSesion = () => {
    setDropdownAbierto(false);
    onCerrarSesion();
  };

  return (
    <header className="header-sistema" role="banner">

      {/* ── Logo + nombre app ── */}
      <div className="header-izquierda">
        <div className="header-logo-sl" aria-hidden="true">🎓</div>
        <div className="header-info">
          <h1 className="header-titulo-sl">
            <span className="header-scholar">Scholar</span><span className="header-link">Link</span>
          </h1>
          <p className="header-subtitulo">Sistema de comunicación escolar</p>
        </div>
      </div>

      {/* ── Zona derecha ── */}
      {usuario && (
        <div className="header-derecha">

          {/* Nombre + rol (visible en desktop) */}
          <div className="header-usuario-info">
            <span className="header-usuario-nombre">{usuario.nombre}</span>
            <span className="header-usuario-rol">{LABEL_ROL[usuario.rol] || usuario.rol}</span>
          </div>

          {/* Botón avatar + dropdown */}
          <div className="header-dropdown-wrap" ref={dropRef}>
            <button
              id="header-menu-perfil"
              className={`header-avatar-btn ${dropdownAbierto ? 'header-avatar-btn-activo' : ''}`}
              onClick={() => setDropdownAbierto(v => !v)}
              aria-expanded={dropdownAbierto}
              aria-haspopup="menu"
              title="Menú de usuario"
            >
              <Avatar nombre={usuario.nombre} size={38} />
              <span className="header-dropdown-arrow">{dropdownAbierto ? '▲' : '▼'}</span>
            </button>

            {dropdownAbierto && (
              <div className="header-dropdown" role="menu">
                {/* Cabecera del dropdown */}
                <div className="header-drop-usuario">
                  <Avatar nombre={usuario.nombre} size={44} />
                  <div>
                    <p className="header-drop-nombre">{usuario.nombre}</p>
                    <p className="header-drop-cedula">Cédula: {usuario.cedula}</p>
                    <span className="header-drop-rol">{LABEL_ROL[usuario.rol] || usuario.rol}</span>
                  </div>
                </div>

                <div className="header-drop-divider" />

                <button
                  id="header-btn-perfil"
                  className="header-drop-item"
                  onClick={irAPerfil}
                  role="menuitem"
                >
                  <span className="header-drop-icon">👤</span>
                  Mi Perfil
                </button>

                {tieneMultiRol && (
                  <button
                    id="header-btn-cambiar-perfil"
                    className="header-drop-item"
                    onClick={handleCambiarPerfil}
                    role="menuitem"
                  >
                    <span className="header-drop-icon">🔄</span>
                    Cambiar perfil
                  </button>
                )}

                <div className="header-drop-divider" />

                <button
                  id="header-btn-cerrar-sesion"
                  className="header-drop-item header-drop-cerrar"
                  onClick={handleCerrarSesion}
                  role="menuitem"
                >
                  <span className="header-drop-icon">🚪</span>
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;
