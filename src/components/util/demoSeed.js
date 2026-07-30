const DEMO_SEED_VERSION = 'alcance6_demo_v1';
const DEMO_SEED_VERSION_KEY = 'scholarlink_demo_seed_version';

const minutes = 60 * 1000;
const days = 24 * minutes * 60;

const BASE_DATE = new Date('2026-03-30T15:00:00.000Z');

const isoOffset = ({ days: d = 0, hours = 0, minutes: m = 0 }) => {
  const fecha = new Date(BASE_DATE.getTime() + (d * days) + (hours * 60 * 60 * 1000) + (m * 60 * 1000));
  return fecha.toISOString();
};

const clone = (obj) => JSON.parse(JSON.stringify(obj));

export const obtenerUsuariosDemo = () => [
  {
    cedula: '1',
    nombre: 'Adriana Campos',
    rol: 'administrativo',
    roles: ['administrativo'],
    subrol: 'Administradora general',
    alcance: { tipo: 'global' },
    password: '1',
    primerAcceso: false,
    creadoPor: null,
    fechaCreacion: isoOffset({ days: -10 })
  },
  {
    cedula: '2',
    nombre: 'María Rojas',
    rol: 'encargado',
    roles: ['encargado'],
    subrol: 'Encargada legal',
    alcance: { tipo: 'global' },
    password: '2',
    primerAcceso: false,
    creadoPor: '1',
    fechaCreacion: isoOffset({ days: -10, hours: 1 })
  },
  {
    cedula: '3',
    nombre: 'Carlos García',
    rol: 'docente',
    roles: ['docente'],
    subrol: 'Profesor de Matemática',
    alcance: { tipo: 'global' },
    password: '3',
    primerAcceso: false,
    creadoPor: '1',
    fechaCreacion: isoOffset({ days: -10, hours: 2 })
  },
  {
    cedula: '4',
    nombre: 'Valentina Rojas',
    rol: 'estudiante',
    roles: ['estudiante'],
    subrol: 'Estudiante',
    grado: '7',
    seccion: 'A',
    alcance: { tipo: 'global' },
    password: '4',
    primerAcceso: false,
    creadoPor: '1',
    fechaCreacion: isoOffset({ days: -10, hours: 3 })
  }
];

export const obtenerGruposDemo = () => [
  {
    id: 'grp_001',
    nombre: '7mo A',
    grado: '7',
    seccion: 'A',
    nivel: 'Secundaria',
    docentes: ['3']
  },
  {
    id: 'grp_002',
    nombre: '8vo B',
    grado: '8',
    seccion: 'B',
    nivel: 'Secundaria',
    docentes: ['3']
  }
];

export const obtenerEstudiantesDemo = () => [
  {
    id: 'est_001',
    nombre: 'Valentina Rojas',
    cedula: '4',
    grado: '7',
    seccion: 'A',
    encargados: [{ cedula: '2', nombre: 'María Rojas' }]
  },
  {
    id: 'est_002',
    nombre: 'Diego Rojas',
    cedula: 'EST002',
    grado: '7',
    seccion: 'A',
    encargados: [{ cedula: '2', nombre: 'María Rojas' }]
  },
  {
    id: 'est_003',
    nombre: 'Sofía Brenes',
    cedula: 'EST003',
    grado: '8',
    seccion: 'B',
    encargados: [{ cedula: '2', nombre: 'María Rojas' }]
  }
];

export const obtenerComunicadosDemo = () => [
  {
    id: 'com_demo_001',
    titulo: 'Recordatorio de reunión general',
    contenido: 'Este viernes a las 3:00 p. m. se realizará una reunión general con encargados en el gimnasio de la institución.',
    fecha: isoOffset({ days: -1, hours: -2 }),
    creadoPor: { cedula: '1', nombre: 'Adriana Campos' },
    alcanceTipo: 'institucion',
    seccionesDestinatarias: [],
    destinatarioResumen: 'Toda la institución',
    estadosDestinatarios: [
      { usuarioCedula: '2', nombre: 'María Rojas', rol: 'encargado', estado: 'recibido', fechaRecepcion: isoOffset({ days: -1, hours: -2 }), fechaLectura: null, metadata: { origen: 'demo' } },
      { usuarioCedula: '3', nombre: 'Carlos García', rol: 'docente', estado: 'leido', fechaRecepcion: isoOffset({ days: -1, hours: -2 }), fechaLectura: isoOffset({ days: -1, hours: -1 }), metadata: { origen: 'demo' } },
      { usuarioCedula: '4', nombre: 'Valentina Rojas', rol: 'estudiante', estado: 'recibido', fechaRecepcion: isoOffset({ days: -1, hours: -2 }), fechaLectura: null, metadata: { grupoClave: '7-A', origen: 'demo' } },
      { usuarioCedula: 'EST002', nombre: 'Diego Rojas', rol: 'estudiante', estado: 'recibido', fechaRecepcion: isoOffset({ days: -1, hours: -2 }), fechaLectura: null, metadata: { grupoClave: '7-A', origen: 'demo' } },
      { usuarioCedula: 'EST003', nombre: 'Sofía Brenes', rol: 'estudiante', estado: 'recibido', fechaRecepcion: isoOffset({ days: -1, hours: -2 }), fechaLectura: null, metadata: { grupoClave: '8-B', origen: 'demo' } }
    ]
  },
  {
    id: 'com_demo_002',
    titulo: 'Entrega de práctica de matemática',
    contenido: 'El grupo 7-A debe entregar la práctica de matemática el próximo lunes antes de las 10:00 a. m.',
    fecha: isoOffset({ days: -1, hours: -1 }),
    creadoPor: { cedula: '1', nombre: 'Adriana Campos' },
    alcanceTipo: 'seccion',
    seccionesDestinatarias: [
      { id: 'grp_001', nombre: '7mo A', grado: '7', seccion: 'A', clave: '7-A' }
    ],
    destinatarioResumen: '7mo A',
    estadosDestinatarios: [
      { usuarioCedula: '2', nombre: 'María Rojas', rol: 'encargado', estado: 'recibido', fechaRecepcion: isoOffset({ days: -1, hours: -1 }), fechaLectura: null, metadata: { grupoClave: '7-A', estudianteCedula: '4', origen: 'demo' } },
      { usuarioCedula: '3', nombre: 'Carlos García', rol: 'docente', estado: 'leido', fechaRecepcion: isoOffset({ days: -1, hours: -1 }), fechaLectura: isoOffset({ days: -1 }), metadata: { grupoClave: '7-A', origen: 'demo' } },
      { usuarioCedula: '4', nombre: 'Valentina Rojas', rol: 'estudiante', estado: 'recibido', fechaRecepcion: isoOffset({ days: -1, hours: -1 }), fechaLectura: null, metadata: { grupoClave: '7-A', estudianteCedula: '4', origen: 'demo' } },
      { usuarioCedula: 'EST002', nombre: 'Diego Rojas', rol: 'estudiante', estado: 'recibido', fechaRecepcion: isoOffset({ days: -1, hours: -1 }), fechaLectura: null, metadata: { grupoClave: '7-A', estudianteCedula: 'EST002', origen: 'demo' } }
    ]
  },
  {
    id: 'com_demo_003',
    titulo: 'Feria científica institucional',
    contenido: 'La feria científica se realizará la próxima semana. Cada grupo debe presentarse con su proyecto y uniforme completo.',
    fecha: isoOffset({ days: -2, hours: -4 }),
    creadoPor: { cedula: '1', nombre: 'Adriana Campos' },
    alcanceTipo: 'multiple',
    seccionesDestinatarias: [
      { id: 'grp_001', nombre: '7mo A', grado: '7', seccion: 'A', clave: '7-A' },
      { id: 'grp_002', nombre: '8vo B', grado: '8', seccion: 'B', clave: '8-B' }
    ],
    destinatarioResumen: '7-A, 8-B',
    estadosDestinatarios: [
      { usuarioCedula: '2', nombre: 'María Rojas', rol: 'encargado', estado: 'leido', fechaRecepcion: isoOffset({ days: -2, hours: -4 }), fechaLectura: isoOffset({ days: -2, hours: -2 }), metadata: { origen: 'demo' } },
      { usuarioCedula: '3', nombre: 'Carlos García', rol: 'docente', estado: 'leido', fechaRecepcion: isoOffset({ days: -2, hours: -4 }), fechaLectura: isoOffset({ days: -2, hours: -1 }), metadata: { origen: 'demo' } },
      { usuarioCedula: '4', nombre: 'Valentina Rojas', rol: 'estudiante', estado: 'recibido', fechaRecepcion: isoOffset({ days: -2, hours: -4 }), fechaLectura: null, metadata: { grupoClave: '7-A', origen: 'demo' } },
      { usuarioCedula: 'EST002', nombre: 'Diego Rojas', rol: 'estudiante', estado: 'recibido', fechaRecepcion: isoOffset({ days: -2, hours: -4 }), fechaLectura: null, metadata: { grupoClave: '7-A', origen: 'demo' } },
      { usuarioCedula: 'EST003', nombre: 'Sofía Brenes', rol: 'estudiante', estado: 'recibido', fechaRecepcion: isoOffset({ days: -2, hours: -4 }), fechaLectura: null, metadata: { grupoClave: '8-B', origen: 'demo' } }
    ]
  }
];

export const obtenerActividadesDemo = () => [
  {
    id: 'act_demo_001',
    titulo: 'Tarea de fracciones',
    descripcion: 'Resolver los ejercicios 1 al 10 de la guía y entregarlos en clase.',
    materia: 'Matemática',
    grupoId: 'grp_001',
    fechaLimite: isoOffset({ days: 3 }),
    modalidad: 'individual',
    notaTotal: 100,
    tipo: 'actividad',
    calificaciones: {
      '4': { nota: 92, fecha: isoOffset({ days: -1, hours: -3 }) },
      EST002: { nota: 85, fecha: isoOffset({ days: -1, hours: -2 }) }
    },
    creadoPor: { cedula: '3', nombre: 'Carlos García' },
    fechaCreacion: isoOffset({ days: -3, hours: -2 })
  },
  {
    id: 'act_demo_002',
    titulo: 'Proyecto de ciencias',
    descripcion: 'Preparar una maqueta sencilla sobre energías renovables para exponer en grupos.',
    materia: 'Ciencias',
    grupoId: 'grp_001',
    fechaLimite: isoOffset({ days: 5 }),
    modalidad: 'grupal',
    notaTotal: 100,
    tipo: 'actividad',
    calificaciones: {},
    creadoPor: { cedula: '3', nombre: 'Carlos García' },
    fechaCreacion: isoOffset({ days: -2, hours: -5 })
  }
];

export const obtenerMensajesDemo = () => [
  {
    id: 'msg_demo_001',
    tipo: 'mensaje',
    remitente: { cedula: '3', nombre: 'Carlos García' },
    destinatarios: [
      {
        cedula: '2',
        nombre: 'María Rojas',
        estudiantes: ['est_001'],
        estado: 'enviado',
        fechaLectura: null
      }
    ],
    estudiantes: [
      { id: 'est_001', nombre: 'Valentina Rojas', grado: '7', seccion: 'A' }
    ],
    asunto: 'Seguimiento de Valentina',
    contenido: 'Buenos días. Le informo que Valentina ha mostrado una mejora importante en matemática. Solo debe reforzar la entrega puntual de tareas.',
    respuestas: [],
    permiteRespuestas: true,
    fechaEnvio: isoOffset({ days: -1, hours: -6 }),
    ultimaRevisionDocente: isoOffset({ days: -1, hours: -6 })
  },
  {
    id: 'msg_demo_002',
    tipo: 'reporte',
    remitente: { cedula: '3', nombre: 'Carlos García' },
    destinatarios: [
      {
        cedula: '2',
        nombre: 'María Rojas',
        estudiantes: ['est_002'],
        estado: 'leido',
        fechaLectura: isoOffset({ days: -2, hours: -2 })
      }
    ],
    estudiantes: [
      { id: 'est_002', nombre: 'Diego Rojas', grado: '7', seccion: 'A' }
    ],
    asunto: 'Reporte de participación en clase',
    contenido: 'Se comparte un reporte breve para indicar que Diego participó activamente durante la exposición de esta semana.',
    respuestas: [
      {
        autor: { cedula: '2', nombre: 'María Rojas', rol: 'encargado' },
        contenido: 'Muchas gracias por avisarme, profesor.',
        fecha: isoOffset({ days: -2, hours: -1 })
      }
    ],
    permiteRespuestas: true,
    fechaEnvio: isoOffset({ days: -2, hours: -4 }),
    ultimaRevisionDocente: isoOffset({ days: -2, hours: -1 })
  },
  {
    id: 'msg_demo_003',
    tipo: 'mensaje',
    remitente: { cedula: '1', nombre: 'Adriana Campos' },
    destinatarios: [
      {
        cedula: '3',
        nombre: 'Carlos García',
        estudiantes: [],
        estado: 'enviado',
        fechaLectura: null
      }
    ],
    estudiantes: [],
    asunto: 'Recordatorio de reunión docente',
    contenido: 'Se recuerda la reunión de coordinación académica de mañana a las 11:00 a. m. en la sala de profesores.',
    respuestas: [],
    permiteRespuestas: false,
    fechaEnvio: isoOffset({ days: -1, hours: -3 }),
    ultimaRevisionDocente: null
  }
];

export const obtenerNotificacionesDemo = () => [
  {
    id: 'noti_demo_001',
    usuarioCedula: '2',
    tipo: 'mensaje',
    referenciaId: 'msg_demo_001',
    titulo: 'Nuevo mensaje del docente',
    resumen: 'Tiene un nuevo mensaje relacionado con Valentina Rojas.',
    leido: false,
    fecha: isoOffset({ days: -1, hours: -6 }),
    fechaLectura: null,
    fechaCambioEstado: null,
    metadata: { origen: 'demo' }
  },
  {
    id: 'noti_demo_002',
    usuarioCedula: '2',
    tipo: 'comunicado',
    referenciaId: 'com_demo_002',
    titulo: 'Nuevo comunicado para 7-A',
    resumen: 'Revise el comunicado sobre la práctica de matemática del grupo 7-A.',
    leido: false,
    fecha: isoOffset({ days: -1, hours: -1 }),
    fechaLectura: null,
    fechaCambioEstado: null,
    metadata: { grupoClave: '7-A', estudianteCedula: '4', origen: 'demo' }
  },
  {
    id: 'noti_demo_003',
    usuarioCedula: '2',
    tipo: 'reporte',
    referenciaId: 'msg_demo_002',
    titulo: 'Reporte consultado',
    resumen: 'Se mantiene en el historial el reporte de participación en clase.',
    leido: true,
    fecha: isoOffset({ days: -2, hours: -4 }),
    fechaLectura: isoOffset({ days: -2, hours: -2 }),
    fechaCambioEstado: isoOffset({ days: -2, hours: -2 }),
    metadata: { origen: 'demo' }
  },
  {
    id: 'noti_demo_004',
    usuarioCedula: '3',
    tipo: 'mensaje',
    referenciaId: 'msg_demo_003',
    titulo: 'Mensaje del área administrativa',
    resumen: 'Revise el recordatorio sobre la reunión docente.',
    leido: false,
    fecha: isoOffset({ days: -1, hours: -3 }),
    fechaLectura: null,
    fechaCambioEstado: null,
    metadata: { origen: 'demo' }
  },
  {
    id: 'noti_demo_005',
    usuarioCedula: '3',
    tipo: 'comunicado',
    referenciaId: 'com_demo_001',
    titulo: 'Comunicado institucional publicado',
    resumen: 'Se publicó un comunicado institucional sobre la reunión general.',
    leido: true,
    fecha: isoOffset({ days: -1, hours: -2 }),
    fechaLectura: isoOffset({ days: -1, hours: -1 }),
    fechaCambioEstado: isoOffset({ days: -1, hours: -1 }),
    metadata: { origen: 'demo' }
  },
  {
    id: 'noti_demo_006',
    usuarioCedula: '4',
    tipo: 'comunicado',
    referenciaId: 'com_demo_002',
    titulo: 'Nuevo comunicado para su grupo',
    resumen: 'Tiene un comunicado nuevo sobre la práctica de matemática.',
    leido: false,
    fecha: isoOffset({ days: -1, hours: -1 }),
    fechaLectura: null,
    fechaCambioEstado: null,
    metadata: { grupoClave: '7-A', origen: 'demo' }
  },
  {
    id: 'noti_demo_007',
    usuarioCedula: '4',
    tipo: 'actividad',
    referenciaId: 'act_demo_002',
    titulo: 'Nueva actividad asignada',
    resumen: 'Revise el proyecto de ciencias pendiente para su grupo.',
    leido: false,
    fecha: isoOffset({ days: -2, hours: -5 }),
    fechaLectura: null,
    fechaCambioEstado: null,
    metadata: { grupoClave: '7-A', estudianteCedula: '4', origen: 'demo' }
  },
  {
    id: 'noti_demo_008',
    usuarioCedula: '4',
    tipo: 'evaluacion',
    referenciaId: 'act_demo_001',
    titulo: 'Calificación registrada',
    resumen: 'Ya puede revisar la nota de la tarea de fracciones.',
    leido: true,
    fecha: isoOffset({ days: -1, hours: -3 }),
    fechaLectura: isoOffset({ days: -1, hours: -2 }),
    fechaCambioEstado: isoOffset({ days: -1, hours: -2 }),
    metadata: { grupoClave: '7-A', estudianteCedula: '4', origen: 'demo' }
  },
  {
    id: 'noti_demo_009',
    usuarioCedula: '1',
    tipo: 'comunicado',
    referenciaId: 'com_demo_003',
    titulo: 'Historial de comunicado institucional',
    resumen: 'Se conserva un ejemplo de comunicado institucional dentro del historial.',
    leido: true,
    fecha: isoOffset({ days: -2, hours: -4 }),
    fechaLectura: isoOffset({ days: -2, hours: -3 }),
    fechaCambioEstado: isoOffset({ days: -2, hours: -3 }),
    metadata: { origen: 'demo' }
  },
  {
    id: 'noti_demo_010',
    usuarioCedula: '1',
    tipo: 'actividad',
    referenciaId: 'act_demo_001',
    titulo: 'Actividad registrada en 7-A',
    resumen: 'Se agregó una actividad de ejemplo en el grupo 7-A.',
    leido: false,
    fecha: isoOffset({ days: -3, hours: -2 }),
    fechaLectura: null,
    fechaCambioEstado: null,
    metadata: { grupoClave: '7-A', origen: 'demo' }
  }
];

export const asegurarColeccionDemo = (existente, demo, keyField = 'id', { sobrescribirDemo = true } = {}) => {
  const listaExistente = Array.isArray(existente) ? existente : [];
  const mapa = new Map(listaExistente.map((item) => [item?.[keyField], item]));

  demo.forEach((item) => {
    const key = item?.[keyField];
    if (!key) return;
    const actual = mapa.get(key);

    if (!actual) {
      mapa.set(key, clone(item));
      return;
    }

    mapa.set(key, sobrescribirDemo ? { ...actual, ...clone(item) } : actual);
  });

  return Array.from(mapa.values());
};

export const demoNecesitaReinicio = () => localStorage.getItem(DEMO_SEED_VERSION_KEY) !== DEMO_SEED_VERSION;

export const marcarDemoInicializado = () => {
  localStorage.setItem(DEMO_SEED_VERSION_KEY, DEMO_SEED_VERSION);
};
