import { obtenerEstudiantes, obtenerEstudiantesPorEncargado } from './estudiantes';
import { obtenerGrupos, obtenerGruposPorDocente } from './grupos';
import { asegurarColeccionDemo, obtenerComunicadosDemo } from './demoSeed';
import { obtenerUsuarios } from './usuarios';

const KEY = 'comunicados_scholarlink';
const EVENTO_ACTUALIZACION = 'comunicadosActualizados';

const ordenarPorFechaDesc = (lista = []) =>
  [...lista].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

const claveGrupo = (grado, seccion) => `${grado}-${seccion}`;

const nombreSeccion = ({ nombre, grado, seccion }) =>
  nombre || `${grado}° ${seccion}`;

const normalizarSeccion = (seccion) => {
  if (!seccion) return null;

  const grado = seccion.grado ?? null;
  const letra = seccion.seccion ?? null;
  if (!grado || !letra) return null;

  return {
    id: seccion.id || `sec_${grado}_${letra}`,
    grado,
    seccion: letra,
    nombre: nombreSeccion({ ...seccion, grado, seccion: letra }),
    clave: seccion.clave || claveGrupo(grado, letra)
  };
};

const resumirDestinatarios = (alcanceTipo, secciones = []) => {
  if (alcanceTipo === 'institucion' || secciones.length === 0) {
    return 'Toda la institución';
  }

  if (secciones.length === 1) {
    return nombreSeccion(secciones[0]);
  }

  return secciones.map((s) => s.clave).join(', ');
};

const normalizarSeccionesDestinatarias = (comunicado = {}) => {
  if (Array.isArray(comunicado.seccionesDestinatarias) && comunicado.seccionesDestinatarias.length > 0) {
    return comunicado.seccionesDestinatarias
      .map(normalizarSeccion)
      .filter(Boolean);
  }

  if (comunicado.grado && comunicado.seccion) {
    const seccion = normalizarSeccion({
      grado: comunicado.grado,
      seccion: comunicado.seccion,
      nombre: comunicado.nombreSeccion
    });
    return seccion ? [seccion] : [];
  }

  return [];
};

const normalizarEstadoDestinatario = (estado, fechaBase) => {
  if (!estado?.usuarioCedula) return null;

  const estadoActual = estado.estado || (estado.fechaLectura ? 'leido' : 'recibido');

  return {
    usuarioCedula: estado.usuarioCedula,
    nombre: estado.nombre || estado.usuarioCedula,
    rol: estado.rol || 'usuario',
    estado: estadoActual,
    fechaRecepcion: estado.fechaRecepcion || fechaBase,
    fechaLectura: estado.fechaLectura || null,
    metadata: estado.metadata || {}
  };
};

const normalizarComunicado = (comunicado = {}) => {
  const seccionesDestinatarias = normalizarSeccionesDestinatarias(comunicado);
  const alcanceTipo = comunicado.alcanceTipo
    || (seccionesDestinatarias.length === 0
      ? 'institucion'
      : seccionesDestinatarias.length === 1
        ? 'seccion'
        : 'multiple');

  const estadosDestinatarios = Array.isArray(comunicado.estadosDestinatarios)
    ? comunicado.estadosDestinatarios
        .map((estado) => normalizarEstadoDestinatario(estado, comunicado.fecha || new Date().toISOString()))
        .filter(Boolean)
    : [];

  const primerGrupo = seccionesDestinatarias[0] || null;

  return {
    ...comunicado,
    titulo: comunicado.titulo || comunicado.asunto || 'Comunicado sin asunto',
    contenido: comunicado.contenido || '',
    fecha: comunicado.fecha || new Date().toISOString(),
    creadoPor: comunicado.creadoPor || null,
    tipo: alcanceTipo === 'institucion' ? 'institucional' : 'grupal',
    alcanceTipo,
    seccionesDestinatarias,
    destinatarioResumen: comunicado.destinatarioResumen || resumirDestinatarios(alcanceTipo, seccionesDestinatarias),
    estadosDestinatarios,
    grado: comunicado.grado ?? primerGrupo?.grado ?? null,
    seccion: comunicado.seccion ?? primerGrupo?.seccion ?? null
  };
};

const emitirActualizacion = () => {
  window.dispatchEvent(new Event(EVENTO_ACTUALIZACION));
};

const initComunicados = () => {
  const data = localStorage.getItem(KEY);
  const demo = obtenerComunicadosDemo().map(normalizarComunicado);

  if (!data) {
    localStorage.setItem(KEY, JSON.stringify(demo));
    return demo;
  }

  const parsed = JSON.parse(data).map(normalizarComunicado);
  const combinado = asegurarColeccionDemo(parsed, demo, 'id').map(normalizarComunicado);

  if (JSON.stringify(combinado) !== JSON.stringify(parsed)) {
    localStorage.setItem(KEY, JSON.stringify(combinado));
  }

  return combinado;
};

export const obtenerComunicados = () => initComunicados().map(normalizarComunicado);

export const guardarComunicados = (lista) => {
  const normalizados = (lista || []).map(normalizarComunicado);
  localStorage.setItem(KEY, JSON.stringify(normalizados));
  emitirActualizacion();
  return normalizados;
};

export const obtenerSeccionesDisponibles = () => {
  const mapa = new Map();

  obtenerGrupos().forEach((grupo) => {
    const normalizada = normalizarSeccion({
      id: grupo.id,
      grado: grupo.grado,
      seccion: grupo.seccion,
      nombre: grupo.nombre
    });

    if (normalizada && !mapa.has(normalizada.clave)) {
      mapa.set(normalizada.clave, normalizada);
    }
  });

  return Array.from(mapa.values()).sort((a, b) => a.clave.localeCompare(b.clave));
};

const obtenerClavesDeUsuario = (usuario) => {
  if (!usuario) return [];

  if (usuario.rol === 'estudiante') {
    return usuario.grado && usuario.seccion ? [claveGrupo(usuario.grado, usuario.seccion)] : [];
  }

  if (usuario.rol === 'encargado') {
    return obtenerEstudiantesPorEncargado(usuario.cedula).map((est) => claveGrupo(est.grado, est.seccion));
  }

  if (usuario.rol === 'docente') {
    return obtenerGruposPorDocente(usuario.cedula).map((grupo) => claveGrupo(grupo.grado, grupo.seccion));
  }

  return [];
};

const usuarioPuedeVerComunicado = (usuario, comunicado) => {
  if (!usuario || !comunicado) return false;
  if (usuario.rol === 'administrativo') return true;

  if (comunicado.estadosDestinatarios?.some((estado) => estado.usuarioCedula === usuario.cedula)) {
    return true;
  }

  if (comunicado.alcanceTipo === 'institucion') {
    return true;
  }

  const clavesUsuario = obtenerClavesDeUsuario(usuario);
  return comunicado.seccionesDestinatarias.some((seccion) => clavesUsuario.includes(seccion.clave));
};

export const obtenerComunicadosPorEstudiante = (grado, seccion) => {
  const clave = claveGrupo(grado, seccion);

  return obtenerComunicados()
    .filter((comunicado) => {
      if (comunicado.alcanceTipo === 'institucion') return true;
      return comunicado.seccionesDestinatarias.some((dest) => dest.clave === clave);
    })
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
};

export const obtenerTodosComunicados = () =>
  ordenarPorFechaDesc(obtenerComunicados());

export const obtenerComunicadosPorUsuario = (usuario) => {
  if (!usuario) return [];

  return obtenerTodosComunicados().filter((comunicado) => usuarioPuedeVerComunicado(usuario, comunicado));
};

const agregarDestinatarioUnico = (mapa, destinatario, usuarioActual) => {
  if (!destinatario?.usuarioCedula) return;
  if (destinatario.usuarioCedula === usuarioActual?.cedula) return;

  if (!mapa.has(destinatario.usuarioCedula)) {
    mapa.set(destinatario.usuarioCedula, {
      usuarioCedula: destinatario.usuarioCedula,
      nombre: destinatario.nombre || destinatario.usuarioCedula,
      rol: destinatario.rol || 'usuario',
      metadata: destinatario.metadata || {}
    });
  }
};

const construirDestinatariosPorSeccion = (seccionesSeleccionadas, usuarioActual, usuarios = []) => {
  const destinatarios = new Map();
  const estudiantes = obtenerEstudiantes();
  const grupos = obtenerGrupos();
  const usuariosDisponibles = Array.isArray(usuarios) && usuarios.length > 0 ? usuarios : obtenerUsuarios();

  seccionesSeleccionadas.forEach((seccion) => {
    const clave = seccion.clave || claveGrupo(seccion.grado, seccion.seccion);
    const grupo = grupos.find((g) => claveGrupo(g.grado, g.seccion) === clave);

    const estudiantesSeccion = estudiantes.filter(
      (estudiante) => claveGrupo(estudiante.grado, estudiante.seccion) === clave
    );

    estudiantesSeccion.forEach((estudiante) => {
      agregarDestinatarioUnico(destinatarios, {
        usuarioCedula: estudiante.cedula,
        nombre: estudiante.nombre,
        rol: 'estudiante',
        metadata: { grupoClave: clave, estudianteCedula: estudiante.cedula }
      }, usuarioActual);

      (estudiante.encargados || []).forEach((encargado) => {
        agregarDestinatarioUnico(destinatarios, {
          usuarioCedula: encargado.cedula,
          nombre: encargado.nombre,
          rol: 'encargado',
          metadata: { grupoClave: clave, estudianteCedula: estudiante.cedula }
        }, usuarioActual);
      });
    });

    (grupo?.docentes || []).forEach((cedulaDocente) => {
      const docente = usuariosDisponibles.find((usuario) => usuario.cedula === cedulaDocente);
      agregarDestinatarioUnico(destinatarios, {
        usuarioCedula: cedulaDocente,
        nombre: docente?.nombre || `Docente ${cedulaDocente}`,
        rol: 'docente',
        metadata: { grupoClave: clave }
      }, usuarioActual);
    });
  });

  return Array.from(destinatarios.values());
};

export const obtenerDestinatariosComunicado = ({
  tipo,
  grupoId,
  alcanceTipo,
  seccionesSeleccionadas = [],
  usuarioActual,
  usuarios = []
}) => {
  const usuariosDisponibles = Array.isArray(usuarios) && usuarios.length > 0 ? usuarios : obtenerUsuarios();

  let modo = alcanceTipo;
  let secciones = (seccionesSeleccionadas || []).map(normalizarSeccion).filter(Boolean);

  if (!modo && tipo === 'institucional') {
    modo = 'institucion';
  }

  if (!modo && tipo === 'grupal' && grupoId) {
    const grupo = obtenerGrupos().find((item) => item.id === grupoId);
    if (grupo) {
      secciones = [normalizarSeccion(grupo)].filter(Boolean);
      modo = 'seccion';
    }
  }

  if (modo === 'institucion') {
    const todasLasSecciones = obtenerSeccionesDisponibles();
    const destinatarios = construirDestinatariosPorSeccion(todasLasSecciones, usuarioActual, usuariosDisponibles);
    const mapaFinal = new Map();

    destinatarios.forEach((dest) => agregarDestinatarioUnico(mapaFinal, dest, usuarioActual));

    usuariosDisponibles
      .filter((usuario) => usuario.rol === 'administrativo')
      .forEach((admin) => {
        agregarDestinatarioUnico(mapaFinal, {
          usuarioCedula: admin.cedula,
          nombre: admin.nombre,
          rol: 'administrativo',
          metadata: { alcance: 'institucion' }
        }, usuarioActual);
      });

    return Array.from(mapaFinal.values());
  }

  return construirDestinatariosPorSeccion(secciones, usuarioActual, usuariosDisponibles);
};

export const agregarComunicado = (nuevo, usuarioActual) => {
  const lista = obtenerComunicados();
  const fechaEnvio = new Date().toISOString();
  const seccionesDestinatarias = (nuevo.seccionesDestinatarias || []).map(normalizarSeccion).filter(Boolean);
  const alcanceTipo = nuevo.alcanceTipo
    || (seccionesDestinatarias.length === 0
      ? 'institucion'
      : seccionesDestinatarias.length === 1
        ? 'seccion'
        : 'multiple');

  const comunicado = normalizarComunicado({
    id: `com_${Date.now()}`,
    titulo: nuevo.titulo,
    contenido: nuevo.contenido,
    fecha: fechaEnvio,
    creadoPor: {
      cedula: usuarioActual.cedula,
      nombre: usuarioActual.nombre
    },
    alcanceTipo,
    seccionesDestinatarias,
    destinatarioResumen: resumirDestinatarios(alcanceTipo, seccionesDestinatarias),
    estadosDestinatarios: (nuevo.destinatarios || []).map((destinatario) => ({
      usuarioCedula: destinatario.usuarioCedula,
      nombre: destinatario.nombre,
      rol: destinatario.rol,
      estado: 'recibido',
      fechaRecepcion: fechaEnvio,
      fechaLectura: null,
      metadata: destinatario.metadata || {}
    }))
  });

  const actualizado = guardarComunicados([...lista, comunicado]);
  return actualizado;
};

export const eliminarComunicado = (id) => {
  const lista = obtenerComunicados();
  const filtrado = lista.filter((comunicado) => comunicado.id !== id);
  return guardarComunicados(filtrado);
};

export const obtenerEstadoComunicadoParaUsuario = (comunicado, usuarioCedula) => {
  if (!comunicado || !usuarioCedula) return { estado: 'enviado', fechaLectura: null, fechaRecepcion: null };

  const estado = comunicado.estadosDestinatarios?.find((item) => item.usuarioCedula === usuarioCedula);

  if (estado) {
    return estado;
  }

  return {
    usuarioCedula,
    estado: comunicado.creadoPor?.cedula === usuarioCedula ? 'enviado' : 'recibido',
    fechaRecepcion: comunicado.fecha,
    fechaLectura: null,
    metadata: {}
  };
};

export const marcarComunicadoComoLeido = (comunicadoId, usuarioCedula) => {
  const ahora = new Date().toISOString();
  const usuarios = obtenerUsuarios();
  const usuario = usuarios.find((item) => item.cedula === usuarioCedula);

  const actualizado = obtenerComunicados().map((comunicado) => {
    if (comunicado.id !== comunicadoId) return comunicado;

    const estados = [...(comunicado.estadosDestinatarios || [])];
    const indice = estados.findIndex((estado) => estado.usuarioCedula === usuarioCedula);

    if (indice >= 0) {
      estados[indice] = {
        ...estados[indice],
        estado: 'leido',
        fechaLectura: estados[indice].fechaLectura || ahora
      };
    } else {
      estados.push({
        usuarioCedula,
        nombre: usuario?.nombre || usuarioCedula,
        rol: usuario?.rol || usuario?.roles?.[0] || 'usuario',
        estado: 'leido',
        fechaRecepcion: comunicado.fecha,
        fechaLectura: ahora,
        metadata: {}
      });
    }

    return {
      ...comunicado,
      estadosDestinatarios: estados
    };
  });

  return guardarComunicados(actualizado);
};

export const obtenerEstadoGlobalComunicado = (comunicado) => {
  const estados = comunicado?.estadosDestinatarios || [];

  if (estados.length === 0) return 'enviado';
  if (estados.some((estado) => estado.estado === 'leido')) return 'leido';
  if (estados.some((estado) => estado.estado === 'recibido')) return 'recibido';
  return 'enviado';
};

export const obtenerHistorialComunicadosEnviados = ({ usuarioActual, filtros = {} } = {}) => {
  const texto = (filtros.busqueda || '').trim().toLowerCase();
  const filtroSeccion = filtros.seccion || '';
  const fechaInicio = filtros.fechaInicio ? new Date(`${filtros.fechaInicio}T00:00:00`) : null;
  const fechaFin = filtros.fechaFin ? new Date(`${filtros.fechaFin}T23:59:59`) : null;

  return obtenerTodosComunicados()
    .filter((comunicado) => {
      if (usuarioActual?.cedula && comunicado.creadoPor?.cedula && comunicado.creadoPor.cedula !== usuarioActual.cedula) {
        return false;
      }

      if (filtroSeccion) {
        const coincideSeccion = comunicado.alcanceTipo === 'institucion'
          || comunicado.seccionesDestinatarias.some((seccion) => seccion.clave === filtroSeccion);
        if (!coincideSeccion) return false;
      }

      const fechaComunicado = new Date(comunicado.fecha);
      if (fechaInicio && fechaComunicado < fechaInicio) return false;
      if (fechaFin && fechaComunicado > fechaFin) return false;

      if (texto) {
        const bolsa = `${comunicado.titulo} ${comunicado.contenido} ${comunicado.destinatarioResumen}`.toLowerCase();
        if (!bolsa.includes(texto)) return false;
      }

      return true;
    })
    .map((comunicado) => ({
      ...comunicado,
      estadoGlobal: obtenerEstadoGlobalComunicado(comunicado)
    }));
};
