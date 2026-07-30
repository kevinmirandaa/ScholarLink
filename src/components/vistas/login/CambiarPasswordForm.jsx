import { useState } from 'react';
import './CambiarPasswordForm.css';

function CambiarPasswordForm({ onCambiarPassword, cedulaUsuario }) {
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [confirmacion, setConfirmacion] = useState('');
  const [error, setError] = useState('');

  const manejarSubmit = (e) => {
    e.preventDefault();
    setError('');

    const resultado = onCambiarPassword(nuevaPassword, confirmacion);
    if (resultado) {
      setError(resultado);
    }
  };

  return (
    <div className="cambiar-wrapper">
      <div className="cambiar-card">

        <div className="cambiar-header">
          <p className="cambiar-etiqueta">Seguridad de la cuenta</p>
          <h2 className="cambiar-titulo">Cambie su contraseña</h2>
          <p className="cambiar-descripcion">
            Por seguridad, debe establecer una nueva contraseña en su primer acceso.
          </p>
        </div>

        <ul className="cambiar-requisitos">
          <li>Mínimo 8 caracteres</li>
          <li>Solo letras y números (sin caracteres especiales)</li>
          <li>Diferente a su número de cédula</li>
        </ul>

        <form onSubmit={manejarSubmit} className="cambiar-form">

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
            <p className="cambiar-error" role="alert">
              {error}
            </p>
          )}

          <button type="submit" className="btn-cambiar">
            Guardar nueva contraseña
          </button>

        </form>
      </div>
    </div>
  );
}

export default CambiarPasswordForm;
