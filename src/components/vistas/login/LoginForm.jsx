import { useState } from 'react';
import './LoginForm.css';

function LoginForm({ onLogin, setModo }) {
  const [cedula, setCedula] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const procesarFormulario = (e) => {
    e.preventDefault();
    setError('');

    if (!cedula.trim()) {
      setError('Ingrese su número de cédula');
      return;
    }

    if (!password) {
      setError('Ingrese su contraseña');
      return;
    }

    // onLogin devuelve null si todo OK, o un string con el error
    const resultado = onLogin(cedula, password);
    if (resultado) {
      setError(resultado);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">

        <div className="login-header">
          <p className="login-etiqueta">Sistema institucional</p>
          <h2 className="login-titulo">Inicio de sesión</h2>
          <p className="login-descripcion">
            Ingrese sus credenciales para acceder a la plataforma educativa.
          </p>
        </div>

        <form onSubmit={procesarFormulario} className="login-form">

          <div className="form-group">
            <label>Cédula</label>
            <input
              type="text"
              value={cedula}
              onChange={(e) => setCedula(e.target.value)}
              className="form-control"
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-control"
              autoComplete="current-password"
            />
          </div>

          {error && (
            <p className="login-error" role="alert">
              {error}
            </p>
          )}

          <button type="submit" className="btn-login">
            Ingresar
          </button>

          <button
            type="button"
            className="btn-link-login"
            onClick={() => setModo('recuperar')}
          >
            ¿Olvidó su contraseña?
          </button>

        </form>
        <div className="login-demo">
          <p className="login-demo-titulo">Usuarios demo del prototipo</p>
          <ul className="login-demo-lista">
            <li><strong>1 / 1</strong> · Administrativo</li>
            <li><strong>2 / 2</strong> · Encargado</li>
            <li><strong>3 / 3</strong> · Docente</li>
            <li><strong>4 / 4</strong> · Estudiante</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default LoginForm;
