import { useState } from 'react';
import { obtenerUsuarios, guardarUsuarios } from '../../util/usuarios';
import './VistaPerfil.css';

const COLORES_ROL = {
  administrativo: { bg: '#e8f0fe', color: '#1a56db', label: 'Administrativo' },
  docente:        { bg: '#fef3c7', color: '#b45309', label: 'Docente'        },
  encargado:      { bg: '#d1fae5', color: '#065f46', label: 'Encargado'      },
  estudiante:     { bg: '#ede9fe', color: '#6d28d9', label: 'Estudiante'     },
};

function Avatar({ nombre, size = 64 }) {
  const iniciales = nombre
    ? nombre.split(' ').slice(0, 2).map(p => p[0]).join('').toUpperCase()
    : '?';
  return (
    <div
      className="perfil-avatar"
      style={{ width: size, height: size, fontSize: size * 0.38 }}
      aria-label={`Avatar de ${nombre}`}
    >
      {iniciales}
    </div>
  );
}

function VistaPerfil({ usuarioActual, setUsuarioActual }) {
  const roleInfo = COLORES_ROL[usuarioActual.rol] || { bg: '#f1f5f9', color: '#475569', label: usuarioActual.rol };

  const [modo, setModo] = useState('ver'); // 'ver' | 'editar' | 'password'
  const [nombre, setNombre]   = useState(usuarioActual.nombre || '');
  const [email, setEmail]     = useState(usuarioActual.email || '');
  const [telefono, setTelefono] = useState(usuarioActual.telefono || '');
  const [subrol, setSubrol]   = useState(usuarioActual.subrol || '');

  const [passActual, setPassActual]   = useState('');
  const [passNueva, setPassNueva]     = useState('');
  const [passConfirm, setPassConfirm] = useState('');

  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' }); // tipo: 'ok' | 'error'
  const [guardando, setGuardando] = useState(false);

  const mostrarMensaje = (texto, tipo = 'ok') => {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje({ texto: '', tipo: '' }), 3500);
  };

  // ── Guardar datos de perfil ──────────────────────────────────────────────
  const guardarPerfil = () => {
    if (!nombre.trim()) { mostrarMensaje('El nombre no puede estar vacío.', 'error'); return; }
    setGuardando(true);
    try {
      const usuarios = obtenerUsuarios();
      const actualizado = usuarios.map(u =>
        u.cedula === usuarioActual.cedula
          ? { ...u, nombre: nombre.trim(), email: email.trim(), telefono: telefono.trim(), subrol: subrol.trim() }
          : u
      );
      guardarUsuarios(actualizado);
      const nuevoUsuario = { ...usuarioActual, nombre: nombre.trim(), email: email.trim(), telefono: telefono.trim(), subrol: subrol.trim() };
      localStorage.setItem('usuario_actual', JSON.stringify(nuevoUsuario));
      if (setUsuarioActual) setUsuarioActual(nuevoUsuario);
      setModo('ver');
      mostrarMensaje('¡Perfil actualizado correctamente!', 'ok');
    } catch {
      mostrarMensaje('Error al guardar. Inténtalo de nuevo.', 'error');
    } finally {
      setGuardando(false);
    }
  };

  // ── Cambiar contraseña ───────────────────────────────────────────────────
  const cambiarPassword = () => {
    if (!passActual) { mostrarMensaje('Ingresa tu contraseña actual.', 'error'); return; }
    const usuarios = obtenerUsuarios();
    const yo = usuarios.find(u => u.cedula === usuarioActual.cedula);
    if (!yo || yo.password !== passActual) { mostrarMensaje('La contraseña actual no es correcta.', 'error'); return; }
    if (passNueva.length < 4) { mostrarMensaje('La nueva contraseña debe tener al menos 4 caracteres.', 'error'); return; }
    if (passNueva !== passConfirm) { mostrarMensaje('Las contraseñas no coinciden.', 'error'); return; }
    const actualizado = usuarios.map(u =>
      u.cedula === usuarioActual.cedula ? { ...u, password: passNueva, primerAcceso: false } : u
    );
    guardarUsuarios(actualizado);
    setPassActual(''); setPassNueva(''); setPassConfirm('');
    setModo('ver');
    mostrarMensaje('Contraseña actualizada correctamente.', 'ok');
  };

  const cancelar = () => {
    setNombre(usuarioActual.nombre || '');
    setEmail(usuarioActual.email || '');
    setTelefono(usuarioActual.telefono || '');
    setSubrol(usuarioActual.subrol || '');
    setPassActual(''); setPassNueva(''); setPassConfirm('');
    setModo('ver');
  };

  return (
    <div className="perfil-wrapper">

      {/* ── Tarjeta de identidad ── */}
      <div className="perfil-card perfil-identidad">
        <Avatar nombre={usuarioActual.nombre} size={80} />
        <div className="perfil-id-info">
          <h2 className="perfil-nombre-grande">{usuarioActual.nombre}</h2>
          <p className="perfil-cedula">Cédula: <strong>{usuarioActual.cedula}</strong></p>
          {usuarioActual.subrol && <p className="perfil-subrol">{usuarioActual.subrol}</p>}
          <span
            className="perfil-rol-badge"
            style={{ background: roleInfo.bg, color: roleInfo.color }}
          >
            {roleInfo.label}
          </span>
        </div>

        <div className="perfil-id-acciones">
          {modo === 'ver' && (
            <>
              <button className="btn-perfil btn-editar" onClick={() => setModo('editar')}>
                ✏️ Editar perfil
              </button>
              <button className="btn-perfil btn-password" onClick={() => setModo('password')}>
                🔐 Cambiar contraseña
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── Mensaje de feedback ── */}
      {mensaje.texto && (
        <div className={`perfil-mensaje ${mensaje.tipo === 'ok' ? 'perfil-msg-ok' : 'perfil-msg-error'}`}>
          {mensaje.tipo === 'ok' ? '✅' : '❌'} {mensaje.texto}
        </div>
      )}

      {/* ── Formulario de edición ── */}
      {modo === 'editar' && (
        <div className="perfil-card perfil-form">
          <h3 className="perfil-form-titulo">Editar información</h3>
          <div className="perfil-grid">
            <div className="perfil-campo">
              <label htmlFor="perfil-nombre">Nombre completo</label>
              <input
                id="perfil-nombre"
                type="text"
                value={nombre}
                onChange={e => setNombre(e.target.value)}
                placeholder="Tu nombre completo"
              />
            </div>
            <div className="perfil-campo">
              <label htmlFor="perfil-email">Correo electrónico</label>
              <input
                id="perfil-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
              />
            </div>
            <div className="perfil-campo">
              <label htmlFor="perfil-telefono">Teléfono</label>
              <input
                id="perfil-telefono"
                type="tel"
                value={telefono}
                onChange={e => setTelefono(e.target.value)}
                placeholder="(506) 8888-8888"
              />
            </div>
            <div className="perfil-campo">
              <label htmlFor="perfil-subrol">Cargo / Especialidad</label>
              <input
                id="perfil-subrol"
                type="text"
                value={subrol}
                onChange={e => setSubrol(e.target.value)}
                placeholder="Ej: Profesor de Matemáticas"
              />
            </div>
          </div>
          <div className="perfil-form-acciones">
            <button className="btn-perfil btn-cancelar" onClick={cancelar} disabled={guardando}>
              Cancelar
            </button>
            <button className="btn-perfil btn-guardar" onClick={guardarPerfil} disabled={guardando}>
              {guardando ? 'Guardando…' : '💾 Guardar cambios'}
            </button>
          </div>
        </div>
      )}

      {/* ── Formulario cambio de contraseña ── */}
      {modo === 'password' && (
        <div className="perfil-card perfil-form">
          <h3 className="perfil-form-titulo">Cambiar contraseña</h3>
          <div className="perfil-grid perfil-grid-1col">
            <div className="perfil-campo">
              <label htmlFor="pass-actual">Contraseña actual</label>
              <input
                id="pass-actual"
                type="password"
                value={passActual}
                onChange={e => setPassActual(e.target.value)}
                placeholder="Tu contraseña actual"
              />
            </div>
            <div className="perfil-campo">
              <label htmlFor="pass-nueva">Nueva contraseña</label>
              <input
                id="pass-nueva"
                type="password"
                value={passNueva}
                onChange={e => setPassNueva(e.target.value)}
                placeholder="Mínimo 4 caracteres"
              />
            </div>
            <div className="perfil-campo">
              <label htmlFor="pass-confirm">Confirmar contraseña</label>
              <input
                id="pass-confirm"
                type="password"
                value={passConfirm}
                onChange={e => setPassConfirm(e.target.value)}
                placeholder="Repite la nueva contraseña"
              />
            </div>
          </div>
          <div className="perfil-form-acciones">
            <button className="btn-perfil btn-cancelar" onClick={cancelar}>Cancelar</button>
            <button className="btn-perfil btn-guardar" onClick={cambiarPassword}>
              🔐 Actualizar contraseña
            </button>
          </div>
        </div>
      )}

      {/* ── Info de sólo lectura ── */}
      {modo === 'ver' && (
        <div className="perfil-card perfil-readonly">
          <h3 className="perfil-section-titulo">Información de la cuenta</h3>
          <div className="perfil-info-grid">
            <div className="perfil-info-row">
              <span className="perfil-info-label">Cédula</span>
              <span className="perfil-info-valor">{usuarioActual.cedula}</span>
            </div>
            <div className="perfil-info-row">
              <span className="perfil-info-label">Correo</span>
              <span className="perfil-info-valor">{usuarioActual.email || <em>No registrado</em>}</span>
            </div>
            <div className="perfil-info-row">
              <span className="perfil-info-label">Teléfono</span>
              <span className="perfil-info-valor">{usuarioActual.telefono || <em>No registrado</em>}</span>
            </div>
            <div className="perfil-info-row">
              <span className="perfil-info-label">Cargo</span>
              <span className="perfil-info-valor">{usuarioActual.subrol || <em>No especificado</em>}</span>
            </div>
            {usuarioActual.roles?.length > 1 && (
              <div className="perfil-info-row">
                <span className="perfil-info-label">Roles disponibles</span>
                <span className="perfil-info-valor">{usuarioActual.roles.join(', ')}</span>
              </div>
            )}
            <div className="perfil-info-row">
              <span className="perfil-info-label">Estado</span>
              <span className="perfil-info-valor perfil-estado-activo">● Activo</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default VistaPerfil;
