import { useState } from 'react';
import './RecuperarPasswordForm.css';

function RecuperarPasswordForm({ onRecuperar, onVolver }) {
  const [cedula, setCedula] = useState('');
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [confirmacion, setConfirmacion] = useState('');
  const [error, setError] = useState('');
  const [exito, setExito] = useState(false);

  const manejarSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!cedula.trim()) {
      setError('Ingrese su número de cédula');
      return;
    }

    const resultado = onRecuperar(cedula, nuevaPassword, confirmacion);
    if (resultado) {
      setError(resultado);
    } else {
      setExito(true);
    }
  };

  if (exito) {
    return (
      <div className="recuperar-wrapper">
        <div className="recuperar-card">
          <div className="recuperar-header">
            <p className="recuperar-etiqueta">Recuperación de acceso</p>
            <h2 className="recuperar-titulo">Contraseña restablecida</h2>
            <p className="recuperar-descripcion">
              Su contraseña fue actualizada correctamente. Ya puede iniciar sesión.
            </p>
          </div>
          <button className="btn-volver" onClick={onVolver}>
            Ir al inicio de sesión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="recuperar-wrapper">
      <div className="recuperar-card">

        <div className="recuperar-header">
          <p className="recuperar-etiqueta">Recuperación de acceso</p>
          <h2 className="recuperar-titulo">Restablecer contraseña</h2>
          <p className="recuperar-descripcion">
            Ingrese su cédula y defina una nueva contraseña para recuperar el acceso.
          </p>
        </div>

        <form onSubmit={manejarSubmit} className="recuperar-form">

          <div className="form-group">
            <label>Cédula</label>
            <input
              type="text"
              value={cedula}
              onChange={(e) => setCedula(e.target.value)}
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label>Nueva contraseña</label>
            <input
              type="password"
              value={nuevaPassword}
              onChange={(e) => setNuevaPassword(e.target.value)}
              className="form-control"
              autoComplete="new-password"
            />
          </div>

          <div className="form-group">
            <label>Confirmar contraseña</label>
            <input
              type="password"
              value={confirmacion}
              onChange={(e) => setConfirmacion(e.target.value)}
              className="form-control"
              autoComplete="new-password"
            />
          </div>

          {error && (
            <p className="recuperar-error" role="alert">
              {error}
            </p>
          )}

          <button type="submit" className="btn-recuperar">
            Restablecer contraseña
          </button>

          <button type="button" className="btn-volver" onClick={onVolver}>
            Volver al inicio de sesión
          </button>

        </form>
      </div>
    </div>
  );
}

export default RecuperarPasswordForm;
