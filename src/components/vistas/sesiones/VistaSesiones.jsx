import { useEffect, useState } from 'react';
import { obtenerSesiones } from '../../util/sesiones';
import './VistaSesiones.css';

function VistaSesiones() {
  const [sesiones, setSesiones] = useState([]);

  useEffect(() => {
    setSesiones(obtenerSesiones());
  }, []);

  return (
      <div className="container mt-3">
        <h2>Registro de sesiones</h2>

        {sesiones.length === 0 ? (
            <p>No hay sesiones registradas</p>
        ) : (
            <table className="table table-hover mt-3">
              <thead>
              <tr>
                <th>Cédula</th>
                <th>Nombre</th>
                <th>Rol</th>
                <th>Fecha</th>
                <th>Hora</th>
              </tr>
              </thead>

              <tbody>
              {sesiones.map((s) => (
                  <tr key={s.fechaHora}>
                    <td>{s.cedula}</td>
                    <td>{s.nombre}</td>
                    <td>{s.rol}</td>
                    <td>{s.fecha}</td>
                    <td>{s.hora}</td>
                  </tr>
              ))}
              </tbody>
            </table>
        )}
      </div>
  );
}

export default VistaSesiones;