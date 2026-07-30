import { asegurarColeccionDemo, obtenerUsuariosDemo } from './demoSeed';

// 🔐 Claves de almacenamiento
const KEY = 'usuarios_scholarlink';
const RECUPERACIONES_KEY = 'recuperaciones_scholarlink';

// ⚔️ Inicializar datos (SOLO una vez) + migración de rol → roles[]
const initUsuarios = () => {
  const data = localStorage.getItem(KEY);
  const demo = obtenerUsuariosDemo();

  if (!data) {
    localStorage.setItem(KEY, JSON.stringify(demo));
    return demo;
  }

  const parsed = JSON.parse(data);
  let necesitaMigracion = false;

  const migrado = (Array.isArray(parsed) ? parsed : []).map((u) => {
    if (!u.roles) {
      necesitaMigracion = true;
      return { ...u, roles: u.rol ? [u.rol] : [] };
    }
    return u;
  });

  const combinado = asegurarColeccionDemo(migrado, demo, 'cedula');

  if (necesitaMigracion || JSON.stringify(combinado) !== JSON.stringify(parsed)) {
    localStorage.setItem(KEY, JSON.stringify(combinado));
  }

  return combinado;
};

// 🧠 Obtener todos los usuarios
export const obtenerUsuarios = () => initUsuarios();

// 💾 Guardar lista completa
export const guardarUsuarios = (lista) => {
  localStorage.setItem(KEY, JSON.stringify(lista));
};

// 🔍 Buscar usuario por cédula
export const obtenerUsuarioPorCedula = (cedula) => {
  const usuarios = obtenerUsuarios();
  return usuarios.find((u) => u.cedula === cedula.trim()) || null;
};

// ➕ Crear usuario
export const agregarUsuario = (nuevo, adminActual) => {
  const usuarios = obtenerUsuarios();

  // 🆕 Normalizar roles: acepta array o string
  const rolesArray = Array.isArray(nuevo.roles)
    ? nuevo.roles
    : (nuevo.rol ? [nuevo.rol] : ['docente']);

  const rolPrimario = rolesArray[0];

  const nuevoUsuario = {
    ...nuevo,
    roles: rolesArray,
    rol: rolPrimario,
    subrol: nuevo.subrol || '',
    alcance: nuevo.alcance || { tipo: 'global' },
    password: nuevo.cedula,
    primerAcceso: true,
    creadoPor: adminActual.cedula,
    fechaCreacion: new Date().toISOString()
  };

  const actualizado = [...usuarios, nuevoUsuario];
  guardarUsuarios(actualizado);
  return actualizado;
};

// ✏️ Editar usuario
export const editarUsuario = (cedula, cambios) => {
  const usuarios = obtenerUsuarios();

  const actualizado = usuarios.map((u) => {
    if (u.cedula === cedula) {
      let nuevosRoles = cambios.roles ?? u.roles ?? [u.rol];
      if (!Array.isArray(nuevosRoles)) nuevosRoles = [nuevosRoles];

      const rolBase = nuevosRoles.includes(u.rol) ? u.rol : nuevosRoles[0];
      const nuevoRolPrimario = cambios.rol ?? rolBase;

      return {
        ...u,
        ...cambios,
        roles: nuevosRoles,
        rol: nuevoRolPrimario,
        subrol: cambios.subrol ?? u.subrol,
        alcance: cambios.alcance ?? u.alcance
      };
    }
    return u;
  });

  guardarUsuarios(actualizado);
  return actualizado;
};

// ❌ Eliminar usuario
export const eliminarUsuario = (cedula) => {
  const usuarios = obtenerUsuarios();
  const filtrados = usuarios.filter((u) => u.cedula !== cedula);
  guardarUsuarios(filtrados);
  return filtrados;
};

// 🧠 Filtrar estudiantes según el alcance del docente
export const filtrarEstudiantesPorDocente = (estudiantes, docente) => {
  if (!docente.alcance || docente.alcance.tipo === 'global') {
    return estudiantes;
  }

  const { tipo, grados = [], secciones = [], grupos = [] } = docente.alcance;

  return estudiantes.filter((est) => {
    if (tipo === 'grado') {
      return grados.includes(est.grado);
    }

    if (tipo === 'seccion') {
      return secciones.includes(est.seccion);
    }

    if (tipo === 'grupo') {
      const grupoEst = `${est.grado}-${est.seccion}`;
      return grupos.includes(grupoEst);
    }

    return false;
  });
};

// 📝 Registrar solicitud de recuperación
export const registrarRecuperacion = (cedula) => {
  const solicitudes = JSON.parse(localStorage.getItem(RECUPERACIONES_KEY)) || [];
  const ahora = new Date();

  solicitudes.push({
    cedula,
    fecha: ahora.toLocaleDateString(),
    hora: ahora.toLocaleTimeString(),
    fechaHora: ahora.toISOString()
  });

  localStorage.setItem(RECUPERACIONES_KEY, JSON.stringify(solicitudes));
};

// 📊 Obtener historial de recuperaciones
export const obtenerRecuperaciones = () => {
  return JSON.parse(localStorage.getItem(RECUPERACIONES_KEY)) || [];
};
