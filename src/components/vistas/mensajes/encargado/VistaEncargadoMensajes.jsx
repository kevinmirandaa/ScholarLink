import { useEffect, useState } from "react";
import { obtenerMensajes, guardarMensajes } from "../../../util/mensajes";
import { marcarNotificacionesPorReferenciaComoLeidas } from "../../../util/notificaciones";
import DetalleMensaje from "./DetalleMensajes";
import "../docente/VistaDocenteMensajes.css";
import "./VistaEncargadoMensajes.css";

function VistaMensajesEncargado({ usuarioActual, mensajeInicial, setMensajeInicial }) {

  const [mensajes, setMensajes]                       = useState([]);
  const [mensajeSeleccionado, setMensajeSeleccionado] = useState(null);
  const [cargando, setCargando]                       = useState(true);
  const [errorCarga, setErrorCarga]                   = useState("");

  const cargarMensajes = () => {
    setCargando(true);
    setErrorCarga("");
    try {
      const todos = obtenerMensajes();
      const filtrados = todos
        .filter(m => {
          if (!Array.isArray(m.destinatarios)) return false;
          return m.destinatarios.some(d => d.cedula === usuarioActual.cedula);
        })
        .sort((a, b) => new Date(b.fechaEnvio) - new Date(a.fechaEnvio));
      setMensajes(filtrados);
    } catch {
      setErrorCarga("No se pudo cargar la bandeja. Intente de nuevo.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarMensajes();
  }, [usuarioActual]);

  useEffect(() => {
    if (mensajeInicial) {
      setMensajeSeleccionado(mensajeInicial);
      if (setMensajeInicial) setMensajeInicial(null);
    }
  }, [mensajeInicial]);

  const abrirMensaje = (mensaje) => {
    try {
      const todos = obtenerMensajes();
      const actualizados = todos.map(m => {
        if (m.id !== mensaje.id) return m;
        return {
          ...m,
          destinatarios: m.destinatarios.map(d => {
            if (d.cedula !== usuarioActual.cedula) return d;
            return { ...d, estado: "leido", fechaLectura: new Date().toISOString() };
          })
        };
      });
      guardarMensajes(actualizados);
      marcarNotificacionesPorReferenciaComoLeidas({
        usuarioCedula: usuarioActual.cedula,
        referenciaId: mensaje.id
      });
      const updated = actualizados.find(m => m.id === mensaje.id);
      setMensajes(actualizados.filter(m => m.destinatarios.some(d => d.cedula === usuarioActual.cedula)));
      setMensajeSeleccionado(updated || mensaje);
    } catch {
      setMensajeSeleccionado(mensaje);
    }
  };

  if (mensajeSeleccionado) {
    return (
      <DetalleMensaje
        mensaje={mensajeSeleccionado}
        onVolver={() => { setMensajeSeleccionado(null); cargarMensajes(); }}
        usuarioActual={usuarioActual}
      />
    );
  }

  if (cargando) {
    return <div className="inbox-estado"><p>Cargando mensajes...</p></div>;
  }

  if (errorCarga) {
    return (
      <div className="inbox-estado">
        <p className="inbox-error">{errorCarga}</p>
        <button className="btn-reintentar" onClick={cargarMensajes}>Reintentar</button>
      </div>
    );
  }

  return (
    <div className="mensajes-inbox">
      <div className="inbox-header">
        <div>
          <h2 className="inbox-titulo">Mensajes</h2>
          <p className="inbox-sub">{mensajes.length} mensaje{mensajes.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {mensajes.length === 0 ? (
        <div className="inbox-vacio">
          <span className="inbox-vacio-icon">✉️</span>
          <p>No hay mensajes disponibles.</p>
          <p className="inbox-vacio-sub">Aquí aparecerán los mensajes de los docentes de sus estudiantes.</p>
        </div>
      ) : (
        <div className="inbox-lista">
          {mensajes.map(m => {
            const miEstado = m.destinatarios?.find(d => d.cedula === usuarioActual.cedula);
            const noLeido = miEstado?.estado !== "leido";

            return (
              <div
                key={m.id}
                className={`inbox-item ${noLeido ? 'inbox-item-unread' : ''}`}
                onClick={() => abrirMensaje(m)}
              >
                <div className="inbox-item-avatar">
                  {m.remitente?.nombre?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div className="inbox-item-body">
                  <div className="inbox-item-row">
                    <span className="inbox-item-nombre">De: {m.remitente?.nombre}</span>
                    <span className="inbox-item-fecha">
                      {new Date(m.fechaEnvio).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                    </span>
                  </div>
                  <p className={`inbox-item-asunto ${noLeido ? 'negrita' : ''}`}>
                    {m.asunto || '(Sin asunto)'}
                  </p>
                  <p className="inbox-item-preview">
                    {m.contenido?.slice(0, 80)}{m.contenido?.length > 80 ? '…' : ''}
                  </p>
                </div>
                <div className="inbox-item-badges">
                  {noLeido && <span className="badge-unread" />}
                  {m.permiteRespuestas && <span className="badge-open">Abierto</span>}
                  <span className={`badge-tipo tipo-${m.tipo}`}>{m.tipo}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default VistaMensajesEncargado;
