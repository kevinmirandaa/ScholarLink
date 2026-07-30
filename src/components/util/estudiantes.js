import { asegurarColeccionDemo, obtenerEstudiantesDemo } from './demoSeed';

const KEY = 'estudiantes_scholarlink';

const initEstudiantes = () => {
  const data = localStorage.getItem(KEY);
  const demo = obtenerEstudiantesDemo();

  if (!data) {
    localStorage.setItem(KEY, JSON.stringify(demo));
    return demo;
  }

  const parsed = JSON.parse(data);
  const combinado = asegurarColeccionDemo(parsed, demo, 'cedula');

  if (JSON.stringify(combinado) !== JSON.stringify(parsed)) {
    localStorage.setItem(KEY, JSON.stringify(combinado));
  }

  return combinado;
};

export const obtenerEstudiantes = () => initEstudiantes();

export const guardarEstudiantes = (lista) =>
  localStorage.setItem(KEY, JSON.stringify(lista));

export const agregarEstudiante = (nuevo, usuarios) => {
  const lista = obtenerEstudiantes();

  if (!nuevo.encargados || nuevo.encargados.length === 0) {
    throw new Error('Debe asignar al menos un encargado legal');
  }

  const encargadosValidos = nuevo.encargados.map((cedula) => {
    const user = usuarios.find(
      (u) =>
        u.cedula === cedula &&
        (u.roles?.includes('encargado') || u.rol === 'encargado')
    );
    if (!user) throw new Error(`Encargado con cédula ${cedula} no válido`);
    return { cedula: user.cedula, nombre: user.nombre };
  });

  const nuevoEstudiante = {
    id: nuevo.id || `est_${Date.now()}`,
    nombre: nuevo.nombre.trim(),
    cedula: nuevo.cedula?.trim() || `EST_${Date.now()}`,
    grado: nuevo.grado,
    seccion: nuevo.seccion,
    encargados: encargadosValidos
  };

  const actualizado = [...lista, nuevoEstudiante];
  guardarEstudiantes(actualizado);
  return actualizado;
};

export const editarEstudiante = (id, cambios, usuarios) => {
  const lista = obtenerEstudiantes();

  const actualizado = lista.map((e) => {
    if (e.id !== id) return e;

    let encargadosFinales = e.encargados;

    if (cambios.encargados && usuarios) {
      if (cambios.encargados.length === 0) {
        throw new Error('Debe mantener al menos un encargado legal');
      }

      encargadosFinales = cambios.encargados.map((cedula) => {
        const user = usuarios.find(
          (u) =>
            u.cedula === cedula &&
            (u.roles?.includes('encargado') || u.rol === 'encargado')
        );
        if (!user) throw new Error(`Encargado con cédula ${cedula} no válido`);
        return { cedula: user.cedula, nombre: user.nombre };
      });
    }

    return {
      ...e,
      nombre: cambios.nombre?.trim() ?? e.nombre,
      cedula: cambios.cedula?.trim() ?? e.cedula,
      grado: cambios.grado ?? e.grado,
      seccion: cambios.seccion ?? e.seccion,
      encargados: encargadosFinales
    };
  });

  guardarEstudiantes(actualizado);
  return actualizado;
};

export const eliminarEstudiante = (id) => {
  const lista = obtenerEstudiantes();
  const filtrado = lista.filter((e) => e.id !== id);
  guardarEstudiantes(filtrado);
  return filtrado;
};

export const obtenerEstudiantesPorEncargado = (cedulaEncargado) => {
  const lista = obtenerEstudiantes();
  return lista.filter((e) =>
    e.encargados.some((enc) => enc.cedula === cedulaEncargado)
  );
};

export const obtenerEstudiantesPorDocente = (docente) => {
  const lista = obtenerEstudiantes();

  if (!docente.alcance || docente.alcance.tipo === 'global') {
    return lista;
  }

  const { tipo, grados = [], secciones = [], grupos = [] } = docente.alcance;

  return lista.filter((est) => {
    if (tipo === 'grado') return grados.includes(est.grado);
    if (tipo === 'seccion') return secciones.includes(est.seccion);
    if (tipo === 'grupo') {
      return grupos.includes(`${est.grado}-${est.seccion}`);
    }
    return false;
  });
};

export const obtenerEstudiantePorCedula = (cedula) => {
  const lista = obtenerEstudiantes();
  return lista.find((e) => e.cedula === cedula) || null;
};

export const sincronizarEstudianteDesdeUsuario = (datos, todosUsuarios = []) => {
  const lista = obtenerEstudiantes();

  const encargadosObjetos = (datos.encargados || []).map((cedula) => {
    const u = todosUsuarios.find((u) => u.cedula === cedula);
    return u ? { cedula: u.cedula, nombre: u.nombre } : { cedula, nombre: cedula };
  });

  const existente = lista.find((e) => e.cedula === datos.cedula);

  if (existente) {
    const actualizado = lista.map((e) => {
      if (e.cedula !== datos.cedula) return e;
      return {
        ...e,
        nombre: datos.nombre,
        grado: datos.grado ?? e.grado,
        seccion: datos.seccion ?? e.seccion,
        encargados: encargadosObjetos.length > 0 ? encargadosObjetos : e.encargados
      };
    });
    guardarEstudiantes(actualizado);
    return actualizado;
  }

  const nuevo = {
    id: `est_${Date.now()}`,
    nombre: datos.nombre,
    cedula: datos.cedula,
    grado: datos.grado || '',
    seccion: datos.seccion || '',
    encargados: encargadosObjetos
  };

  const actualizado = [...lista, nuevo];
  guardarEstudiantes(actualizado);
  return actualizado;
};

export const eliminarEstudiantePorCedula = (cedula) => {
  const lista = obtenerEstudiantes().filter((e) => e.cedula !== cedula);
  guardarEstudiantes(lista);
  return lista;
};
