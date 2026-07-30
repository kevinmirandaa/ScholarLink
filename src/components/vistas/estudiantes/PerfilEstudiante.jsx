import { useEffect, useState } from "react";
import { obtenerMensajes } from "../../util/mensajes";
import { obtenerRegistros } from "../../util/historial";
import { obtenerComunicadosPorEstudiante } from "../../util/comunicados";
import "./PerfilEstudiante.css";

const PESTANAS = ["mensajes", "tareas", "observaciones", "comunicados"];
const ETIQUETAS = {
  mensajes: "Mensajes",
  tareas: "Tareas",
  observaciones: "Observaciones",
  comunicados: "Comunicados"
};

function PerfilEstudiante({ estudiante, usuarioActual, onVolver }) {
  const [pestanaActiva, setPestanaActiva] = useState("mensajes");

  const [mensajes, setMensajes]           = useState([]);
  const [tareas, setTareas]               = useState([]);
  const [observaciones, setObservaciones] = useState([]);
  const [comunicados, setComunicados]     = useState([]);

  const rol = usuarioActual.rol;

  useEffect(() => {
    cargarDatos();
  }, [estudiante]);

  const cargarDatos = () => {
    // ── Mensajes ─────────────────────────────────────────────────────────
    // El estudiante NO ve mensajes privados entre docente y encargado
    if (rol !== "estudiante") {
      const todos = obtenerMensajes();
      const filtrados = todos
        .filter((m) => m.estudiantes?.some((e) => e.id === estudiante.id))
        .sort((a, b) => new Date(b.fechaEnvio) - new Date(a.fechaEnvio));
      setMensajes(filtrados);
    } else {
      setMensajes([]); // estudiante nunca ve mensajes privados
    }

    // ── Historial: tareas y observaciones ────────────────────────────────
    const registros = obtenerRegistros().filter(
      (r) => r.estudiante.id === estudiante.id
    );

    // Docente y admin ven todo; encargado solo lo que fue notificado;
    // estudiante ve tareas pero no observaciones privadas
    const registrosFiltrados = registros.filter((r) => {
      if (rol === "administrativo") return true;
      if (rol === "docente") return true;
      if (rol === "encargado") {
        return r.notificaciones?.some(
          (n) => n.cedula === usuarioActual.cedula
        );
      }
      if (rol === "estudiante") {
        // Estudiante ve tareas; observaciones solo si son marcadas como visibles
        return r.tipo === "tarea";
      }
      return false;
    });

    setTareas(
      registrosFiltrados
        .filter((r) => r.tipo === "tarea")
        .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
    );
    setObservaciones(
      registrosFiltrados
        .filter((r) => r.tipo === "observacion" || r.tipo === "aviso")
        .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
    );

    // ── Comunicados ───────────────────────────────────────────────────────
    const coms = obtenerComunicadosPorEstudiante(
      estudiante.grado,
      estudiante.seccion
    );
    setComunicados(coms);
  };

  // ── Renderizar contenido de cada pestaña ─────────────────────────────
  const renderContenido = () => {
    switch (pestanaActiva) {

      case "mensajes":
        if (rol === "estudiante") {
          return (
            <p className="perfil-vacio">
              Los mensajes entre docentes y encargados no son visibles para el estudiante.
            </p>
          );
        }
        if (mensajes.length === 0) {
          return <p className="perfil-vacio">No hay mensajes vinculados a este estudiante.</p>;
        }
        return (
          <ul className="perfil-lista">
            {mensajes.map((m) => (
              <li key={m.id} className="perfil-item">
                <div className="perfil-item-cabecera">
                  <span className="perfil-item-titulo">
                    {m.asunto || "(sin asunto)"}
                  </span>
                  <span className="perfil-item-fecha">
                    {new Date(m.fechaEnvio).toLocaleDateString()}
                  </span>
                </div>
                <p className="perfil-item-texto">{m.contenido}</p>
                <span className="perfil-item-meta">
                  De: {m.remitente.nombre}
                  {m.respuestas?.length > 0 &&
                    ` · ${m.respuestas.length} respuesta(s)`}
                </span>
              </li>
            ))}
          </ul>
        );

      case "tareas":
        if (tareas.length === 0) {
          return <p className="perfil-vacio">No hay tareas registradas para este estudiante.</p>;
        }
        return (
          <ul className="perfil-lista">
            {tareas.map((t) => (
              <li key={t.id} className="perfil-item">
                <div className="perfil-item-cabecera">
                  <span className="perfil-item-titulo">{t.titulo}</span>
                  <span className="perfil-item-fecha">
                    {new Date(t.fecha).toLocaleDateString()}
                  </span>
                </div>
                {t.contenido && (
                  <p className="perfil-item-texto">{t.contenido}</p>
                )}
                <span className="perfil-item-meta">
                  Creado por: {t.creadoPor?.nombre}
                </span>
              </li>
            ))}
          </ul>
        );

      case "observaciones":
        if (observaciones.length === 0) {
          return (
            <p className="perfil-vacio">No hay observaciones registradas.</p>
          );
        }
        return (
          <ul className="perfil-lista">
            {observaciones.map((o) => (
              <li key={o.id} className="perfil-item">
                <div className="perfil-item-cabecera">
                  <span className="perfil-item-titulo">
                    {o.titulo}{" "}
                    <span className={`perfil-tipo perfil-tipo-${o.tipo}`}>
                      {o.tipo}
                    </span>
                  </span>
                  <span className="perfil-item-fecha">
                    {new Date(o.fecha).toLocaleDateString()}
                  </span>
                </div>
                {o.contenido && (
                  <p className="perfil-item-texto">{o.contenido}</p>
                )}
                <span className="perfil-item-meta">
                  Creado por: {o.creadoPor?.nombre}
                </span>
              </li>
            ))}
          </ul>
        );

      case "comunicados":
        if (comunicados.length === 0) {
          return (
            <p className="perfil-vacio">No hay comunicados para este estudiante.</p>
          );
        }
        return (
          <ul className="perfil-lista">
            {comunicados.map((c) => (
              <li key={c.id} className="perfil-item">
                <div className="perfil-item-cabecera">
                  <span className="perfil-item-titulo">{c.titulo}</span>
                  <span className="perfil-item-fecha">
                    {new Date(c.fecha).toLocaleDateString()}
                  </span>
                </div>
                <p className="perfil-item-texto">{c.contenido}</p>
                <span className="perfil-item-meta">
                  {c.tipo === "institucional"
                    ? "Institucional"
                    : `Grupo ${c.grado}° ${c.seccion}`}
                </span>
              </li>
            ))}
          </ul>
        );

      default:
        return null;
    }
  };

  // ── Pestañas visibles según el rol ───────────────────────────────────
  const pestanasVisibles = PESTANAS.filter((p) => {
    if (p === "mensajes" && rol === "estudiante") return false;
    return true;
  });

  return (
    <div className="perfil-estudiante">

      {/* Cabecera del perfil */}
      <div className="perfil-cabecera">
        <button className="perfil-volver" onClick={onVolver}>
          ← Volver
        </button>

        <div className="perfil-identidad">
          <div className="perfil-avatar">
            {estudiante.nombre.charAt(0)}
          </div>
          <div>
            <h2 className="perfil-nombre">{estudiante.nombre}</h2>
            <p className="perfil-datos">
              <span>ID: {estudiante.cedula || estudiante.id}</span>
              <span>Grado {estudiante.grado}° · Sección {estudiante.seccion}</span>
            </p>
          </div>
        </div>

        {/* Encargados */}
        {estudiante.encargados?.length > 0 && (
          <div className="perfil-encargados">
            <span className="perfil-encargados-label">Encargados:</span>
            {estudiante.encargados.map((enc) => (
              <span key={enc.cedula} className="perfil-encargado-badge">
                {enc.nombre}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Pestañas */}
      <div className="perfil-tabs">
        {pestanasVisibles.map((p) => (
          <button
            key={p}
            className={`perfil-tab ${pestanaActiva === p ? "activo" : ""}`}
            onClick={() => setPestanaActiva(p)}
          >
            {ETIQUETAS[p]}
          </button>
        ))}
      </div>

      {/* Contenido de la pestaña activa */}
      <div className="perfil-contenido">
        {renderContenido()}
      </div>

    </div>
  );
}

export default PerfilEstudiante;
