import { useState } from 'react';
import './MenuLateral.css';
import { obtenerMenuPorRol } from '../util/menuConfig';

function MenuLateral({
  rol,
  setEstado,
  estadoActual,
  menuAbierto,
  setMenuAbierto,
  notificacionesNoLeidas,
  mensajesNoLeidos = 0
}) {
  const [tooltip, setTooltip] = useState(null);
  const botones = obtenerMenuPorRol(rol);

  return (
    <aside className={`menu-lateral ${menuAbierto ? 'abierto' : 'cerrado'}`} aria-label="Menú de navegación">

      {/* ── Contenido expandido ── */}
      {menuAbierto && (
        <div className="menu-contenido">

          <div className="menu-encabezado">
            <p className="menu-etiqueta">Navegación</p>
            <h2 className="titulo-menu">Panel principal</h2>
          </div>

          <nav className="menu-botones" aria-label="Opciones principales">
            {botones.map((boton) => {
              const esActivo   = boton.id === estadoActual;
              const badgeNoti  = boton.id === 'notificaciones' && notificacionesNoLeidas > 0;
              const badgeMsgs  = boton.id === 'mensajes'       && mensajesNoLeidos > 0;

              return (
                <button
                  key={boton.id}
                  id={`menu-btn-${boton.id}`}
                  className={`boton-menu ${esActivo ? 'boton-menu-activo' : ''}`}
                  onClick={() => setEstado(boton.id)}
                  aria-current={esActivo ? 'page' : undefined}
                >
                  <span className="boton-menu-icono">{boton.icono}</span>
                  <span className="boton-menu-texto">{boton.texto}</span>
                  <span className="boton-menu-badges">
                    {badgeNoti && (
                      <span className="badge-menu badge-danger" aria-label={`${notificacionesNoLeidas} no leídas`}>
                        {notificacionesNoLeidas > 9 ? '9+' : notificacionesNoLeidas}
                      </span>
                    )}
                    {badgeMsgs && (
                      <span className="badge-menu badge-info" aria-label={`${mensajesNoLeidos} mensajes sin leer`}>
                        {mensajesNoLeidos > 9 ? '9+' : mensajesNoLeidos}
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
          </nav>

          <div className="menu-footer">
            <small className="menu-footer-texto">ScholarLink © 2025</small>
          </div>
        </div>
      )}

      {/* ── Modo colapsado: solo íconos con tooltip ── */}
      {!menuAbierto && (
        <div className="menu-collapsed">
          {botones.map((boton) => {
            const esActivo  = boton.id === estadoActual;
            const badgeNoti = boton.id === 'notificaciones' && notificacionesNoLeidas > 0;
            const badgeMsgs = boton.id === 'mensajes'       && mensajesNoLeidos > 0;
            const tieneBadge = badgeNoti || badgeMsgs;

            return (
              <div
                key={boton.id}
                className="menu-collapsed-item-wrap"
                onMouseEnter={() => setTooltip(boton.id)}
                onMouseLeave={() => setTooltip(null)}
              >
                <button
                  id={`menu-icon-${boton.id}`}
                  className={`menu-collapsed-btn ${esActivo ? 'menu-collapsed-activo' : ''}`}
                  onClick={() => setEstado(boton.id)}
                  aria-label={boton.texto}
                  aria-current={esActivo ? 'page' : undefined}
                >
                  <span className="menu-collapsed-icono">{boton.icono}</span>
                  {tieneBadge && <span className="badge-collapsed" />}
                </button>
                {tooltip === boton.id && (
                  <div className="menu-tooltip" role="tooltip">{boton.texto}</div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Botón toggle ── */}
      <button
        id="menu-toggle-btn"
        className="boton-toggle-menu"
        onClick={() => setMenuAbierto(!menuAbierto)}
        aria-label={menuAbierto ? 'Colapsar menú' : 'Expandir menú'}
        title={menuAbierto ? 'Colapsar menú' : 'Expandir menú'}
      >
        {menuAbierto ? '◀' : '▶'}
      </button>

    </aside>
  );
}

export default MenuLateral;