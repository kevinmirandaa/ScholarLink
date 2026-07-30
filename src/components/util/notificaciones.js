import { obtenerMensajes } from './mensajes';
import { obtenerComunicadosPorUsuario, obtenerTodosComunicados } from './comunicados';
import { obtenerActividades } from './actividades';
import { obtenerEstudiantes, obtenerEstudiantesPorEncargado } from './estudiantes';
import { obtenerGruposPorDocente } from './grupos';
import { asegurarColeccionDemo, obtenerNotificacionesDemo } from './demoSeed';

const NOTIFICACIONES_KEY = 'notificaciones_scholarlink';

const ordenarPorFechaDesc = (lista = []) =>
  [...lista].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

export const obtenerNotificaciones = () => {
  const data = JSON.parse(localStorage.getItem(NOTIFICACIONES_KEY)) || [];
  const demo = obtenerNotificacionesDemo();
  const combinado = asegurarColeccionDemo(data, demo, 'id');

  if (JSON.stringify(combinado) !== JSON.stringify(data)) {
    localStorage.setItem(NOTIFICACIONES_KEY, JSON.stringify(combinado));
  }

  return combinado;
};

export const obtenerNotificacionesPorUsuario = (cedula) => {
  return ordenarPorFechaDesc(
    obtenerNotificaciones().filter((n) => n.usuarioCedula === cedula)
  );
};

export const contarNotificacionesNoLeidas = (cedula) => {
  return obtenerNotificacionesPorUsuario(cedula).filter((n) => !n.leido).length;
};

export const guardarNotificaciones = (notificaciones) => {
  localStorage.setItem(NOTIFICACIONES_KEY, JSON.stringify(notificaciones));
  window.dispatchEvent(new Event('notificacionesActualizadas'));
};

export const crearNotificacion = (notificacion) => {
  const todas = obtenerNotificaciones();
  const ahora = new Date().toISOString();

  todas.push({
    id: notificacion.id || `noti_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    usuarioCedula: notificacion.usuarioCedula,
    tipo: notificacion.tipo || 'mensaje',
    referenciaId: notificacion.referenciaId,
    titulo: notificacion.titulo || 'Nueva notificación',
    resumen: notificacion.resumen || '',
    leido: Boolean(notificacion.leido),
    fecha: notificacion.fecha || ahora,
    fechaLectura: notificacion.fechaLectura || null,
    fechaCambioEstado: notificacion.fechaCambioEstado || null,
    metadata: notificacion.metadata || {}
  });

  guardarNotificaciones(todas);
};

export const marcarNotificacionComoLeida = (id) => {
  const ahora = new Date().toISOString();
  const actualizadas = obtenerNotificaciones().map((n) =>
    n.id === id
      ? {
          ...n,
          leido: true,
          fechaLectura: n.fechaLectura || ahora,
          fechaCambioEstado: ahora
        }
      : n
  );

  guardarNotificaciones(actualizadas);
  return actualizadas;
};

export const marcarNotificacionesPorReferenciaComoLeidas = ({ usuarioCedula, referenciaId }) => {
  const ahora = new Date().toISOString();
  const actualizadas = obtenerNotificaciones().map((n) => {
    if (n.usuarioCedula !== usuarioCedula || n.referenciaId !== referenciaId) {
      return n;
    }

    return {
      ...n,
      leido: true,
      fechaLectura: n.fechaLectura || ahora,
      fechaCambioEstado: ahora
    };
  });

  guardarNotificaciones(actualizadas);
  return actualizadas;
};

const puedeVerComunicado = (usuario, comunicado) => {
  if (!usuario || !comunicado) return false;

  const visibles = usuario.rol === 'administrativo'
    ? obtenerTodosComunicados()
    : obtenerComunicadosPorUsuario(usuario);

  return visibles.some((c) => c.id === comunicado.id);
};

const puedeVerActividad = (usuario, actividad) => {
  if (!usuario || !actividad) return false;

  if (usuario.rol === 'administrativo') return true;

  if (usuario.rol === 'docente') {
    const grupos = obtenerGruposPorDocente(usuario.cedula);
    return grupos.some((g) => g.id === actividad.grupoId);
  }

  if (usuario.rol === 'estudiante') {
    const estudiante = obtenerEstudiantes().find((e) => e.cedula === usuario.cedula);
    if (!estudiante) return false;
    if (actividad.metadata?.estudianteCedula) {
      return actividad.metadata.estudianteCedula === usuario.cedula;
    }
    return true;
  }

  if (usuario.rol === 'encargado') {
    const estudiantes = obtenerEstudiantesPorEncargado(usuario.cedula);
    return estudiantes.some((e) => {
      if (actividad.metadata?.estudianteCedula) {
        return e.cedula === actividad.metadata.estudianteCedula;
      }
      return `${e.grado}-${e.seccion}` === (actividad.metadata?.grupoClave || '');
    }) || estudiantes.some((e) => `${e.grado}-${e.seccion}` === actividad.metadata?.grupoClave);
  }

  return false;
};

export const resolverDestinoNotificacion = (notificacion, usuarioActual) => {
  if (!notificacion || !usuarioActual) {
    return { permitido: false, motivo: 'No se pudo identificar la notificación.' };
  }

  if (notificacion.usuarioCedula !== usuarioActual.cedula) {
    return { permitido: false, motivo: 'La notificación no pertenece al usuario actual.' };
  }

  if (notificacion.tipo === 'mensaje' || notificacion.tipo === 'reporte') {
    const mensaje = obtenerMensajes().find((m) => m.id === notificacion.referenciaId);

    if (!mensaje) {
      return { permitido: false, motivo: 'El mensaje relacionado ya no está disponible.' };
    }

    const permitido =
      mensaje.remitente?.cedula === usuarioActual.cedula ||
      mensaje.destinatarios?.some((d) => d.cedula === usuarioActual.cedula);

    return permitido
      ? { permitido: true, modulo: 'mensajes', contenido: mensaje }
      : { permitido: false, motivo: 'No tiene permisos para ver este mensaje.' };
  }

  if (notificacion.tipo === 'comunicado') {
    const comunicado = obtenerTodosComunicados().find((c) => c.id === notificacion.referenciaId);

    if (!comunicado) {
      return { permitido: false, motivo: 'El comunicado relacionado ya no está disponible.' };
    }

    return puedeVerComunicado(usuarioActual, comunicado)
      ? { permitido: true, modulo: 'comunicados', contenido: comunicado }
      : { permitido: false, motivo: 'No tiene permisos para ver este comunicado.' };
  }

  if (notificacion.tipo === 'actividad' || notificacion.tipo === 'evaluacion') {
    const actividad = obtenerActividades().find((a) => a.id === notificacion.referenciaId);

    if (!actividad) {
      return { permitido: false, motivo: 'La actividad relacionada ya no está disponible.' };
    }

    const metadata = {
      ...actividad,
      metadata: {
        ...notificacion.metadata,
        grupoClave: notificacion.metadata?.grupoClave
      }
    };

    return puedeVerActividad(usuarioActual, metadata)
      ? { permitido: true, modulo: 'actividades', contenido: actividad }
      : { permitido: false, motivo: 'No tiene permisos para ver esta actividad.' };
  }

  return { permitido: false, motivo: 'El tipo de notificación todavía no está soportado.' };
};
