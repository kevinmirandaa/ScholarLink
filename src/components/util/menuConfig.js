// Orden del array = orden en el menú lateral por rol
export const menuConfig = [

  // ── Común ──────────────────────────────────────────────────────────────
  { id: 'inicio',         texto: 'Inicio',               icono: '🏠', roles: ['administrativo', 'docente', 'encargado', 'estudiante'] },

  // ── Administrativo ─────────────────────────────────────────────────────
  { id: 'grupos',         texto: 'Grupos',                icono: '👥', roles: ['administrativo', 'docente'] },
  { id: 'estudiantes',   texto: 'Estudiantes',           icono: '🎒', roles: ['administrativo', 'docente', 'encargado', 'estudiante'] },
  { id: 'usuarios',      texto: 'Usuarios y Roles',      icono: '⚙️', roles: ['administrativo'] },
  { id: 'comunicados',   texto: 'Comunicados',           icono: '📢', roles: ['administrativo', 'docente', 'encargado', 'estudiante'] },
  { id: 'actividades',   texto: 'Actividades',           icono: '📋', roles: [ 'docente', 'encargado', 'estudiante'] },
  { id: 'historial',     texto: 'Historial',             icono: '📚', roles: ['administrativo', 'docente', 'encargado', 'estudiante'] },
  { id: 'sesiones',      texto: 'Registro de sesiones',  icono: '🔐', roles: ['administrativo'] },
  { id: 'importar-csv',  texto: 'Importar CSV',          icono: '📥', roles: ['administrativo'] },
  { id: 'reportes',      texto: 'Reportes',              icono: '📊', roles: ['administrativo'] },

  // ── Docente + Encargado ────────────────────────────────────────────────
  { id: 'mensajes',      texto: 'Mensajes',              icono: '✉️', roles: ['docente', 'encargado'] },
  { id: 'calendario',    texto: 'Calendario',            icono: '📅', roles: ['docente', 'encargado', 'estudiante'] },
  { id: 'notificaciones',texto: 'Notificaciones',        icono: '🔔', roles: ['administrativo', 'docente', 'encargado', 'estudiante'] },

  // ── Estudiante ─────────────────────────────────────────────────────────
  { id: 'migrupo',       texto: 'Mi Grupo',              icono: '🏫', roles: ['estudiante'] },

  // ── Todos ──────────────────────────────────────────────────────────────
  { id: 'perfil',        texto: 'Mi Perfil',             icono: '👤', roles: ['administrativo', 'docente', 'encargado', 'estudiante'] },
];


// ── Filtrar menú por rol ──────────────────────────────────────────────────
export const obtenerMenuPorRol = (rol) => {
  if (!rol) return [];
  return menuConfig.filter((opcion) => opcion.roles.includes(rol));
};


// ── Verificar si una vista está permitida para el rol ─────────────────────
export const vistaPermitida = (rol, vista) => {
  return obtenerMenuPorRol(rol).some((opcion) => opcion.id === vista);
};


// ── Vista inicial según rol ───────────────────────────────────────────────
export const obtenerVistaInicial = (rol) => {
  const opciones = obtenerMenuPorRol(rol);
  return opciones[0]?.id || 'inicio';
};
