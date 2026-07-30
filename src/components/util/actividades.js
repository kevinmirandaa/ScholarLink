import { asegurarColeccionDemo, obtenerActividadesDemo } from './demoSeed';

const KEY = 'actividades_scholarlink';

const initActividades = () => {
  const data = localStorage.getItem(KEY);
  const demo = obtenerActividadesDemo();

  if (!data) {
    localStorage.setItem(KEY, JSON.stringify(demo));
    return demo;
  }

  const parsed = JSON.parse(data);
  const combinado = asegurarColeccionDemo(parsed, demo, 'id');

  if (JSON.stringify(combinado) !== JSON.stringify(parsed)) {
    localStorage.setItem(KEY, JSON.stringify(combinado));
  }

  return combinado;
};

export const obtenerActividades = () => initActividades();

export const guardarActividades = (lista) =>
  localStorage.setItem(KEY, JSON.stringify(lista));

export const agregarActividad = (nueva, usuarioActual) => {
  const lista = obtenerActividades();
  const actividad = {
    id: `act_${Date.now()}`,
    titulo: nueva.titulo,
    descripcion: nueva.descripcion || '',
    materia: nueva.materia || '',
    grupoId: nueva.grupoId,
    fechaLimite: nueva.fechaLimite || '',
    modalidad: nueva.modalidad || 'individual',
    notaTotal: Number(nueva.notaTotal) || 100,
    tipo: 'actividad',
    calificaciones: {},
    creadoPor: { cedula: usuarioActual.cedula, nombre: usuarioActual.nombre },
    fechaCreacion: new Date().toISOString()
  };
  const actualizado = [...lista, actividad];
  guardarActividades(actualizado);
  return actualizado;
};

export const editarActividad = (id, cambios) => {
  const lista = obtenerActividades();
  const actualizado = lista.map(a =>
    a.id === id ? { ...a, ...cambios } : a
  );
  guardarActividades(actualizado);
  return actualizado;
};

export const eliminarActividad = (id) => {
  const lista = obtenerActividades().filter(a => a.id !== id);
  guardarActividades(lista);
  return lista;
};

export const calificarEstudiante = (actividadId, estudianteId, nota) => {
  const lista = obtenerActividades();
  const actualizado = lista.map(a => {
    if (a.id !== actividadId) return a;
    return {
      ...a,
      calificaciones: {
        ...a.calificaciones,
        [estudianteId]: { nota, fecha: new Date().toISOString() }
      }
    };
  });
  guardarActividades(actualizado);
  return actualizado;
};

export const obtenerActividadesPorGrupo = (grupoId) =>
  obtenerActividades().filter(a => a.grupoId === grupoId);

export const obtenerActividadesPorGrupoIds = (grupoIds) =>
  obtenerActividades().filter(a => grupoIds.includes(a.grupoId));

export const obtenerNotaEstudiante = (actividad, estudianteId) =>
  actividad.calificaciones?.[estudianteId] || null;

export const estadoCalificacion = (actividad, estudianteId) => {
  const c = actividad.calificaciones?.[estudianteId];
  return c ? 'calificada' : 'sin_calificar';
};
