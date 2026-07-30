import './SelectorPerfil.css';

const ETIQUETAS_ROL = {
  administrativo: {
    titulo: 'Administrativo',
    descripcion: 'Gestión institucional, usuarios y grupos'
  },
  docente: {
    titulo: 'Docente',
    descripcion: 'Grupos, estudiantes, mensajes y calendario'
  },
  encargado: {
    titulo: 'Encargado Legal',
    descripcion: 'Seguimiento de estudiantes y mensajes'
  },
  estudiante: {
    titulo: 'Estudiante',
    descripcion: 'Mi grupo, tareas y comunicados'
  }
};

function SelectorPerfil({ usuario, onSeleccionar }) {
  const roles = usuario.roles?.length > 0 ? usuario.roles : [usuario.rol];

  return (
    <div className="selector-layout">
      <div className="selector-content">

        <div className="selector-header">
          <p className="selector-etiqueta">Bienvenido/a</p>
          <h2 className="selector-titulo">{usuario.nombre}</h2>
          <p className="selector-descripcion">Seleccione el perfil con el que desea ingresar</p>
        </div>

        <div className="selector-grid">
          {roles.map((rol) => {
            const info = ETIQUETAS_ROL[rol] || { titulo: rol, descripcion: '' };
            return (
              <button
                key={rol}
                className="selector-card"
                onClick={() => onSeleccionar(rol)}
              >
                <div className="selector-avatar">
                  {info.titulo.charAt(0)}
                </div>
                <span className="selector-card-titulo">{info.titulo}</span>
                <span className="selector-card-desc">{info.descripcion}</span>
              </button>
            );
          })}
        </div>

      </div>
    </div>
  );
}

export default SelectorPerfil;
