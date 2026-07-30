import { asegurarColeccionDemo, obtenerGruposDemo } from './demoSeed';

const KEY = 'grupos_scholarlink';

// ── Datos iniciales ───────────────────────────────────────────────────────
const initGrupos = () => {
  const data = localStorage.getItem(KEY);
  const demo = obtenerGruposDemo();

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

export const obtenerGrupos = () => initGrupos();

export const guardarGrupos = (lista) =>
  localStorage.setItem(KEY, JSON.stringify(lista));

export const agregarGrupo = (nuevo) => {
  const lista = obtenerGrupos();

  const nuevoGrupo = {
    id: `grp_${Date.now()}`,
    nombre: nuevo.nombre,
    grado: nuevo.grado,
    seccion: nuevo.seccion,
    nivel: nuevo.nivel || '',
    docentes: nuevo.docentes || []
  };

  const actualizado = [...lista, nuevoGrupo];
  guardarGrupos(actualizado);
  return actualizado;
};

export const editarGrupo = (id, cambios) => {
  const lista = obtenerGrupos();

  const actualizado = lista.map((g) =>
    g.id === id ? { ...g, ...cambios } : g
  );

  guardarGrupos(actualizado);
  return actualizado;
};

export const eliminarGrupo = (id) => {
  const lista = obtenerGrupos();
  const filtrado = lista.filter((g) => g.id !== id);
  guardarGrupos(filtrado);
  return filtrado;
};

// ── Obtener grupos asignados a un docente (por cédula) ────────────────────
export const obtenerGruposPorDocente = (cedula) => {
  const grupos = obtenerGrupos();
  const asignados = grupos.filter((g) => g.docentes.includes(cedula));
  return asignados.length > 0 ? asignados : grupos;
};
