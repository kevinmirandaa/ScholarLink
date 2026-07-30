const KEY = 'sesiones';
const INTENTOS_KEY = 'intentos_scholarlink';

// ── Registrar sesión exitosa ───────────────────────────────────────────────
export const registrarSesion = (usuario) => {
  const sesiones = JSON.parse(localStorage.getItem(KEY)) || [];
  const ahora = new Date();

  sesiones.push({
    cedula: usuario.cedula,
    nombre: usuario.nombre,
    rol: usuario.rol,                  // rol activo en esta sesión
    roles: usuario.roles || [usuario.rol],
    fecha: ahora.toLocaleDateString(),
    hora: ahora.toLocaleTimeString(),
    fechaHora: ahora.toISOString(),
    exitoso: true
  });

  localStorage.setItem(KEY, JSON.stringify(sesiones));
};

// ── Registrar intento de login (exitoso o fallido) ────────────────────────
export const registrarIntento = (cedula, exitoso) => {
  const intentos = JSON.parse(localStorage.getItem(INTENTOS_KEY)) || [];

  intentos.push({
    cedula,
    exitoso,
    fechaHora: new Date().toISOString()
  });

  localStorage.setItem(INTENTOS_KEY, JSON.stringify(intentos));
};

// ── Verificar si la cuenta está bloqueada ─────────────────────────────────
// Bloqueo: 3 intentos fallidos en los últimos 5 minutos
export const estaBloqueado = (cedula) => {
  const intentos = JSON.parse(localStorage.getItem(INTENTOS_KEY)) || [];
  const ahora = new Date();
  const limite = new Date(ahora.getTime() - 5 * 60 * 1000); // 5 minutos atrás

  const fallidosRecientes = intentos.filter(
    (i) =>
      i.cedula === cedula &&
      !i.exitoso &&
      new Date(i.fechaHora) > limite
  );

  return fallidosRecientes.length >= 3;
};

// ── Obtener historial de sesiones ─────────────────────────────────────────
export const obtenerSesiones = () => {
  return JSON.parse(localStorage.getItem(KEY)) || [];
};

// ── Obtener historial de intentos ─────────────────────────────────────────
export const obtenerIntentos = () => {
  return JSON.parse(localStorage.getItem(INTENTOS_KEY)) || [];
};
