import { obtenerUsuarios, editarUsuario } from './usuarios';
import { registrarIntento, estaBloqueado } from './sesiones';


// ── Validar reglas de contraseña nueva ────────────────────────────────────
// Reglas: mínimo 8 caracteres, sin caracteres especiales
const validarPasswordNueva = (nueva) => {
  if (!nueva || nueva.length < 8) {
    return 'La contraseña debe tener al menos 8 caracteres';
  }
  if (/[^a-zA-Z0-9]/.test(nueva)) {
    return 'La contraseña no debe contener caracteres especiales';
  }
  return null; // sin error
};


// ── Login ─────────────────────────────────────────────────────────────────
export const login = (cedula, password) => {
  const cedulaTrimmed = cedula.trim();

  // Bloqueo por intentos fallidos
  if (estaBloqueado(cedulaTrimmed)) {
    return {
      error: 'Acceso bloqueado temporalmente. Intente de nuevo en 5 minutos.'
    };
  }

  const usuarios = obtenerUsuarios();
  const user = usuarios.find((u) => u.cedula === cedulaTrimmed);

  // Mensaje genérico: no revela si el usuario existe o no
  if (!user || user.password !== password) {
    registrarIntento(cedulaTrimmed, false);
    return { error: 'Credenciales incorrectas. Verifique su cédula y contraseña.' };
  }

  registrarIntento(cedulaTrimmed, true);

  if (user.primerAcceso) {
    return { primerAcceso: true, user };
  }

  return { user };
};


// ── Recuperar contraseña ──────────────────────────────────────────────────
export const recuperarPassword = (cedula, nueva, confirmacion) => {
  const cedulaTrimmed = cedula.trim();
  const usuarios = obtenerUsuarios();
  const user = usuarios.find((u) => u.cedula === cedulaTrimmed);

  // Mensaje informativo genérico (no revela si la cédula existe)
  if (!user) {
    return { error: 'Si la cédula está registrada, podrá restablecer su contraseña.' };
  }

  const errorFormato = validarPasswordNueva(nueva);
  if (errorFormato) return { error: errorFormato };

  if (nueva !== confirmacion) {
    return { error: 'Las contraseñas no coinciden' };
  }

  if (nueva === cedulaTrimmed) {
    return { error: 'La nueva contraseña no puede ser igual a su cédula' };
  }

  editarUsuario(user.cedula, { password: nueva, primerAcceso: false });

  const actualizado = obtenerUsuarios().find((u) => u.cedula === user.cedula);
  return { success: true, user: actualizado };
};


// ── Cambio obligatorio de contraseña (primer acceso) ─────────────────────
export const cambiarPassword = (usuario, nueva, confirmacion) => {
  if (!usuario) {
    return { error: 'Usuario no válido' };
  }

  const errorFormato = validarPasswordNueva(nueva);
  if (errorFormato) return { error: errorFormato };

  if (nueva !== confirmacion) {
    return { error: 'Las contraseñas no coinciden' };
  }

  // La nueva contraseña no puede ser igual a la contraseña temporal (la cédula)
  if (nueva === usuario.cedula) {
    return { error: 'La nueva contraseña no puede ser igual a su cédula' };
  }

  editarUsuario(usuario.cedula, { password: nueva, primerAcceso: false });

  const actualizado = obtenerUsuarios().find((u) => u.cedula === usuario.cedula);
  return { success: true, user: actualizado };
};
