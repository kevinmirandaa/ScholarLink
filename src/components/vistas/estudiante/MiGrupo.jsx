import { useEffect, useState } from 'react';
import { obtenerGrupos } from '../../util/grupos';
import { obtenerEstudiantes } from '../../util/estudiantes';
import { obtenerUsuarios } from '../../util/usuarios';
import './MiGrupo.css';

function MiGrupo({ usuarioActual }) {
  const [grupo, setGrupo] = useState(null);
  const [docentes, setDocentes] = useState([]);

  useEffect(() => {
    // El usuario estudiante debe tener grado y seccion en su perfil
    // para localizar su grupo
    const grupos = obtenerGrupos();
    const usuarios = obtenerUsuarios();

    const miGrupo = grupos.find(
      (g) =>
        g.grado === usuarioActual.grado &&
        g.seccion === usuarioActual.seccion
    );

    if (miGrupo) {
      setGrupo(miGrupo);
      const docentesGrupo = (miGrupo.docentes || [])
        .map((c) => usuarios.find((u) => u.cedula === c))
        .filter(Boolean);
      setDocentes(docentesGrupo);
    }
  }, []);

  if (!grupo) {
    return (
      <div className="migrupo-wrapper">
        <p className="migrupo-sin-grupo">
          No tiene un grupo asignado en el sistema. Consulte con el administrador.
        </p>
      </div>
    );
  }

  return (
    <div className="migrupo-wrapper">

      <div className="migrupo-card">
        <div className="migrupo-badge">Mi Grupo</div>
        <h2 className="migrupo-nombre">{grupo.nombre}</h2>

        <div className="migrupo-datos">
          <div className="migrupo-dato">
            <span className="migrupo-dato-label">Grado</span>
            <span className="migrupo-dato-valor">{grupo.grado}</span>
          </div>
          <div className="migrupo-dato">
            <span className="migrupo-dato-label">Sección</span>
            <span className="migrupo-dato-valor">{grupo.seccion}</span>
          </div>
          <div className="migrupo-dato">
            <span className="migrupo-dato-label">Nivel</span>
            <span className="migrupo-dato-valor">{grupo.nivel || '—'}</span>
          </div>
        </div>
      </div>

      {docentes.length > 0 && (
        <div className="migrupo-seccion">
          <h3 className="migrupo-seccion-titulo">Docentes asignados</h3>
          <div className="migrupo-docentes">
            {docentes.map((d) => (
              <div key={d.cedula} className="migrupo-docente-card">
                <div className="migrupo-docente-avatar">
                  {d.nombre.charAt(0)}
                </div>
                <div>
                  <p className="migrupo-docente-nombre">{d.nombre}</p>
                  {d.subrol && (
                    <p className="migrupo-docente-subrol">{d.subrol}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

export default MiGrupo;
