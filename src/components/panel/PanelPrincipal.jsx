import './PanelPrincipal.css';
import { useState } from 'react';
import { obtenerMenuPorRol, vistaPermitida } from '../util/menuConfig';

// Vistas existentes
import VistaComunicados from '../vistas/comunicaciones/VistaComunicados.jsx';
import VistaNotificaciones from '../vistas/notificaciones/VistaNotificaciones.jsx';
import VistaUsuarios from '../vistas/usuarios/vistaUsuarios.jsx';
import VistaSesiones from '../vistas/sesiones/VistaSesiones.jsx';
import VistaDocenteMensajes from '../vistas/mensajes/docente/VistaDocenteMensajes.jsx';
import VistaEstudiantes from '../vistas/estudiantes/VistaEstudiantes.jsx';
import VistaMensajesEncargado from '../vistas/mensajes/encargado/VistaEncargadoMensajes.jsx';
import VistaHistorialDocente from '../vistas/mensajes/docente/HistorialDocente/VistaHistorialDocente.jsx';
import VistaHistorialEncargado from '../vistas/mensajes/encargado/HistorialEncargado/VistaHistorialEncargado.jsx';

// Vistas nuevas
import VistaGrupos from '../vistas/grupos/VistaGrupos.jsx';
import VistaActividades from '../vistas/actividades/VistaActividades.jsx';
import MiGrupo from '../vistas/estudiante/MiGrupo.jsx';
import VistaHistorialAdmin from '../vistas/historial/VistaHistorialAdmin.jsx';
import VistaHistorialEstudiante from '../vistas/historial/VistaHistorialEstudiante.jsx';
import VistaPerfil from '../vistas/perfil/VistaPerfil.jsx';
import VistaCalendario from '../vistas/actividades/VistaCalendario.jsx';
import VistaImportarCSV from '../vistas/importar/VistaImportarCSV.jsx';


// ── Tarjetas del dashboard por rol ───────────────────────────────────────
const tarjetasPorRol = {
  administrativo: [
    {
      titulo: 'Gestión de Grupos',
      descripcion: 'Cree y administre los grupos de la institución.',
      accion: 'grupos',
      textoBoton: 'Ir a Grupos'
    },
    {
      titulo: 'Gestión de Estudiantes',
      descripcion: 'CRUD completo de estudiantes de todos los grupos.',
      accion: 'estudiantes',
      textoBoton: 'Ver Estudiantes'
    },
    {
      titulo: 'Usuarios y Roles',
      descripcion: 'Administre cuentas, roles y accesos del sistema.',
      accion: 'usuarios',
      textoBoton: 'Administrar usuarios'
    },
    {
      titulo: 'Actividades',
      descripcion: 'Registre actividades institucionales por grupo.',
      accion: 'actividades',
      textoBoton: 'Ver Actividades'
    },
    {
      titulo: 'Comunicados',
      descripcion: 'Gestione comunicados institucionales.',
      accion: 'comunicados',
      textoBoton: 'Ver Comunicados'
    },
    {
      titulo: 'Historial',
      descripcion: 'Consulte avisos, tareas y observaciones registradas.',
      accion: 'historial',
      textoBoton: 'Ver Historial'
    },
    {
      titulo: 'Notificaciones',
      descripcion: 'Revise las alertas recientes del sistema.',
      accion: 'notificaciones',
      textoBoton: 'Ver notificaciones'
    },
    {
      titulo: 'Registro de Sesiones',
      descripcion: 'Consulte los accesos al sistema.',
      accion: 'sesiones',
      textoBoton: 'Ver Sesiones'
    },
    {
      titulo: 'Importar Estudiantes',
      descripcion: 'Carga masiva de estudiantes y encargados desde CSV.',
      accion: 'importar-csv',
      textoBoton: 'Ir a Importar'
    }
  ],
  docente: [
    {
      titulo: 'Mensajes',
      descripcion: 'Comunicación directa con encargados legales.',
      accion: 'mensajes',
      textoBoton: 'Ver mensajes'
    },
    {
      titulo: 'Mis Grupos',
      descripcion: 'Consulte los grupos asignados a su cuenta.',
      accion: 'grupos',
      textoBoton: 'Ver grupos'
    },
    {
      titulo: 'Estudiantes',
      descripcion: 'Gestione los estudiantes de sus grupos.',
      accion: 'estudiantes',
      textoBoton: 'Ver estudiantes'
    },
    {
      titulo: 'Actividades',
      descripcion: 'Registre actividades para sus grupos.',
      accion: 'actividades',
      textoBoton: 'Ver actividades'
    },
    {
      titulo: 'Comunicados',
      descripcion: 'Revise comunicados recientes.',
      accion: 'comunicados',
      textoBoton: 'Ver comunicados'
    },
    {
      titulo: 'Notificaciones',
      descripcion: 'Consulte avisos de mensajes, comunicados y actividades.',
      accion: 'notificaciones',
      textoBoton: 'Ver notificaciones'
    }
  ],
  encargado: [
    {
      titulo: 'Mensajes',
      descripcion: 'Reciba y responda mensajes de los docentes.',
      accion: 'mensajes',
      textoBoton: 'Ver mensajes'
    },
    {
      titulo: 'Comunicados',
      descripcion: 'Consulte los comunicados institucionales.',
      accion: 'comunicados',
      textoBoton: 'Ver comunicados'
    },
    {
      titulo: 'Notificaciones',
      descripcion: 'Revise avisos y novedades pendientes.',
      accion: 'notificaciones',
      textoBoton: 'Ver notificaciones'
    }
  ],
  estudiante: [
    {
      titulo: 'Mi Grupo',
      descripcion: 'Información detallada de su grupo y docentes.',
      accion: 'migrupo',
      textoBoton: 'Ver mi grupo'
    },
    {
      titulo: 'Historial',
      descripcion: 'Consulte avisos, tareas y observaciones de su expediente.',
      accion: 'historial',
      textoBoton: 'Ver historial'
    },
    {
      titulo: 'Calendario',
      descripcion: 'Tareas y actividades pendientes de su grupo.',
      accion: 'calendario',
      textoBoton: 'Ver calendario'
    },
    {
      titulo: 'Comunicados',
      descripcion: 'Comunicados institucionales y de su sección.',
      accion: 'comunicados',
      textoBoton: 'Ver comunicados'
    },
    {
      titulo: 'Notificaciones',
      descripcion: 'Revise sus avisos de comunicados, actividades y evaluaciones.',
      accion: 'notificaciones',
      textoBoton: 'Ver notificaciones'
    }
  ]
};


// ── Dashboard por rol ─────────────────────────────────────────────────────
function InicioRol({ usuarioActual, onCambiarVista }) {
  const tarjetas = tarjetasPorRol[usuarioActual.rol] || [];

  return (
    <div>
      <div className="panel-encabezado">
        <p className="panel-etiqueta">Dashboard principal</p>
        <h2 className="panel-titulo">Bienvenido, {usuarioActual.nombre}</h2>
        <p className="panel-descripcion">
          La interfaz muestra únicamente las opciones disponibles para el rol{' '}
          <strong>{usuarioActual.rol}</strong>.
        </p>
      </div>

      <div className="dashboard-grid">
        {tarjetas.map((tarjeta) => (
          <article key={tarjeta.titulo} className="dashboard-card">
            <h3>{tarjeta.titulo}</h3>
            <p>{tarjeta.descripcion}</p>
            <button onClick={() => onCambiarVista(tarjeta.accion)}>
              {tarjeta.textoBoton}
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}


// ── Panel principal ───────────────────────────────────────────────────────
function PanelPrincipal({ estadoActual, usuarioActual, setEstado, setUsuarioActual }) {
  const [mensajeDesdeNotificacion, setMensajeDesdeNotificacion] = useState(null);
  const [comunicadoDesdeNotificacion, setComunicadoDesdeNotificacion] = useState(null);
  const [actividadDesdeNotificacion, setActividadDesdeNotificacion] = useState(null);

  // Bloquear acceso a vistas no autorizadas
  if (!vistaPermitida(usuarioActual.rol, estadoActual)) {
    return (
      <div className="panel-principal">
        <div className="panel-superficie">
          <div className="dashboard-card">
            <h3>Acceso no autorizado</h3>
            <p>Este módulo no está disponible para el rol actual.</p>
            <button onClick={() => setEstado('inicio')}>Volver al inicio</button>
          </div>
        </div>
      </div>
    );
  }

  const opcionesRol = obtenerMenuPorRol(usuarioActual.rol);
  const moduloActual = opcionesRol.find((op) => op.id === estadoActual);
  const rol = usuarioActual.rol;

  let contenido = null;

  // ── Inicio (dashboard) ──────────────────────────────────────────────────
  if (estadoActual === 'inicio') {
    contenido = <InicioRol usuarioActual={usuarioActual} onCambiarVista={setEstado} />;
  }

  // ── Grupos ──────────────────────────────────────────────────────────────
  else if (estadoActual === 'grupos') {
    contenido = <VistaGrupos usuarioActual={usuarioActual} />;
  }

  // ── Estudiantes ─────────────────────────────────────────────────────────
  else if (estadoActual === 'estudiantes') {
    contenido = <VistaEstudiantes usuarioActual={usuarioActual} />;
  }

  // ── Actividades ─────────────────────────────────────────────────────────
  else if (estadoActual === 'actividades') {
    contenido = <VistaActividades usuarioActual={usuarioActual} actividadInicial={actividadDesdeNotificacion} setActividadInicial={setActividadDesdeNotificacion} />;
  }

  // ── Mensajes ────────────────────────────────────────────────────────────
  else if (estadoActual === 'mensajes') {
    if (rol === 'docente') {
      contenido = (
        <VistaDocenteMensajes
          usuarioActual={usuarioActual}
          mensajeInicial={mensajeDesdeNotificacion}
          setMensajeInicial={setMensajeDesdeNotificacion}
        />
      );
    } else if (rol === 'encargado') {
      contenido = (
        <VistaMensajesEncargado
          usuarioActual={usuarioActual}
          mensajeInicial={mensajeDesdeNotificacion}
          setMensajeInicial={setMensajeDesdeNotificacion}
        />
      );
    }
  }

  // ── Historial ───────────────────────────────────────────────────────────
  else if (estadoActual === 'historial') {
    if (rol === 'docente') {
      contenido = (
        <VistaHistorialDocente
          usuarioActual={usuarioActual}
          mensajeInicial={mensajeDesdeNotificacion}
          setMensajeInicial={setMensajeDesdeNotificacion}
        />
      );
    } else if (rol === 'encargado') {
      contenido = <VistaHistorialEncargado usuarioActual={usuarioActual} />;
    } else if (rol === 'administrativo') {
      contenido = <VistaHistorialAdmin />;
    } else if (rol === 'estudiante') {
      contenido = <VistaHistorialEstudiante usuarioActual={usuarioActual} />;
    }
  }

  // ── Comunicados ─────────────────────────────────────────────────────────
  else if (estadoActual === 'comunicados') {
    contenido = (
      <VistaComunicados usuarioActual={usuarioActual} onAccionRapida={setEstado} comunicadoInicial={comunicadoDesdeNotificacion} setComunicadoInicial={setComunicadoDesdeNotificacion} />
    );
  }

  // ── Notificaciones ──────────────────────────────────────────────────────
  else if (estadoActual === 'notificaciones') {
    contenido = (
      <VistaNotificaciones
        usuarioActual={usuarioActual}
        onAbrirContenido={({ modulo, contenido }) => {
          if (modulo === 'mensajes') {
            setMensajeDesdeNotificacion(contenido);
            setComunicadoDesdeNotificacion(null);
            setActividadDesdeNotificacion(null);
            setEstado('mensajes');
            return;
          }

          if (modulo === 'comunicados') {
            setComunicadoDesdeNotificacion(contenido);
            setMensajeDesdeNotificacion(null);
            setActividadDesdeNotificacion(null);
            setEstado('comunicados');
            return;
          }

          if (modulo === 'actividades') {
            setActividadDesdeNotificacion(contenido);
            setMensajeDesdeNotificacion(null);
            setComunicadoDesdeNotificacion(null);
            setEstado('actividades');
          }
        }}
      />
    );
  }

  // ── Usuarios y Roles ────────────────────────────────────────────────────
  else if (estadoActual === 'usuarios') {
    contenido = <VistaUsuarios usuarioActual={usuarioActual} />;
  }

  // ── Sesiones ────────────────────────────────────────────────────────────
  else if (estadoActual === 'sesiones') {
    contenido = <VistaSesiones />;
  }

  // ── Importar CSV ─────────────────────────────────────────────────────────
  else if (estadoActual === 'importar-csv') {
    contenido = <VistaImportarCSV />;
  }

  // ── Mi Grupo (estudiante) ────────────────────────────────────────────────
  else if (estadoActual === 'migrupo') {
    contenido = <MiGrupo usuarioActual={usuarioActual} />;
  }

  // ── Calendario ──────────────────────────────────────────────────────────
  else if (estadoActual === 'calendario') {
    contenido = <VistaCalendario usuarioActual={usuarioActual} />;
  }

  // ── Reportes ────────────────────────────────────────────────────────────
  else if (estadoActual === 'reportes') {
    contenido = (
      <div>
        <h2>Reportes</h2>
        <p>El módulo de reportes se encuentra en construcción.</p>
      </div>
    );
  }

  // ── Perfil ───────────────────────────────────────────────────────────────
  else if (estadoActual === 'perfil') {
    contenido = <VistaPerfil usuarioActual={usuarioActual} setUsuarioActual={setUsuarioActual} />;
  }

  if (!contenido) {
    contenido = <div><p>Seleccione una opción del menú.</p></div>;
  }

  return (
    <main className="panel-principal">
      {estadoActual !== 'inicio' && (
        <div className="panel-encabezado">
          <p className="panel-etiqueta">Módulo activo</p>
          <h2 className="panel-titulo">{moduloActual?.texto || 'Panel principal'}</h2>
          <p className="panel-descripcion">
            Visualización adaptada al rol de {usuarioActual.rol}.
          </p>
        </div>
      )}

      <div className="panel-superficie">{contenido}</div>
    </main>
  );
}

export default PanelPrincipal;
