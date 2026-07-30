import { useEffect, useMemo, useState } from 'react';
import {
  marcarNotificacionComoLeida,
  obtenerNotificacionesPorUsuario,
  resolverDestinoNotificacion
} from '../../util/notificaciones';
import './VistaNotificaciones.css';

function VistaNotificaciones({ usuarioActual, onAbrirContenido }) {
  const [notificaciones, setNotificaciones] = useState([]);
  const [errorAcceso, setErrorAcceso] = useState('');

  const cargarNotificaciones = () => {
    if (!usuarioActual) return;
    setNotificaciones(obtenerNotificacionesPorUsuario(usuarioActual.cedula));
  };

  useEffect(() => {
    if (!usuarioActual) return;

    const actualizar = () => cargarNotificaciones();
    cargarNotificaciones();
    window.addEventListener('notificacionesActualizadas', actualizar);

    return () => {
      window.removeEventListener('notificacionesActualizadas', actualizar);
    };
  }, [usuarioActual]);

  const resumen = useMemo(() => {
    const noLeidas = notificaciones.filter((n) => !n.leido).length;
    return {
      total: notificaciones.length,
      noLeidas,
      leidas: notificaciones.length - noLeidas
    };
  }, [notificaciones]);

  const marcarComoLeida = (id, e) => {
    e.stopPropagation();
    marcarNotificacionComoLeida(id);
    setErrorAcceso('');
    cargarNotificaciones();
  };

  const abrirNotificacion = (notificacion) => {
    setErrorAcceso('');

    if (!notificacion.leido) {
      marcarNotificacionComoLeida(notificacion.id);
    }

    const destino = resolverDestinoNotificacion(notificacion, usuarioActual);
    cargarNotificaciones();

    if (!destino.permitido) {
      setErrorAcceso(destino.motivo || 'No fue posible abrir el contenido relacionado.');
      return;
    }

    if (onAbrirContenido) {
      onAbrirContenido(destino);
    }
  };

  return (
    <div>
      <div className="notificaciones-topbar">
        <div>
          <h2 className="mb-1">Notificaciones</h2>
          <p className="notificaciones-subtitulo">
            Historial completo de avisos ordenado de la más reciente a la más antigua.
          </p>
        </div>

        <div className="notificaciones-resumen">
          <div className="noti-resumen-item">
            <strong>{resumen.total}</strong>
            <span>Total</span>
          </div>
          <div className="noti-resumen-item noti-resumen-pendientes">
            <strong>{resumen.noLeidas}</strong>
            <span>No leídas</span>
          </div>
          <div className="noti-resumen-item">
            <strong>{resumen.leidas}</strong>
            <span>Leídas</span>
          </div>
        </div>
      </div>

      {errorAcceso && (
        <div className="notificacion-alerta" role="alert">
          {errorAcceso}
        </div>
      )}

      <div className="notificaciones-container">
        {notificaciones.length === 0 && (
          <p>No tienes notificaciones registradas.</p>
        )}

        {notificaciones.map((n) => {
          const tipoLabel = (n.tipo || 'mensaje').toUpperCase();
          return (
            <div
              key={n.id}
              className={`notificacion-card ${!n.leido ? 'notificacion-no-leida' : 'notificacion-leida'} tipo-${n.tipo || 'mensaje'}`}
              onClick={() => abrirNotificacion(n)}
            >
              <div className="notificacion-header">
                <div className="d-flex align-items-center gap-2">
                  {!n.leido && <span className="punto-nuevo">●</span>}
                  <span className={`badge-tipo tipo-${n.tipo || 'mensaje'}`}>{tipoLabel}</span>
                  <span className={`estado-lectura ${n.leido ? 'estado-leido' : 'estado-no-leido'}`}>
                    {n.leido ? 'Leída' : 'No leída'}
                  </span>
                </div>

                <span className="fecha">
                  {n.fecha ? new Date(n.fecha).toLocaleString() : 'Sin fecha'}
                </span>
              </div>

              <div className="notificacion-titulo">{n.titulo || 'Sin título'}</div>
              <div className="notificacion-contenido">{n.resumen || 'Sin contenido'}</div>

              <div className="notificacion-footer d-flex justify-content-between align-items-center">
                <div className="notificacion-meta">
                  <small>Abrir contenido relacionado</small>
                  {n.fechaLectura && (
                    <small>Leída: {new Date(n.fechaLectura).toLocaleString()}</small>
                  )}
                </div>

                {!n.leido && (
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    onClick={(e) => marcarComoLeida(n.id, e)}
                  >
                    Marcar leída
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default VistaNotificaciones;
