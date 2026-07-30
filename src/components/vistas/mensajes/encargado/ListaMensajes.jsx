import "./ListaMensajes.css";

function ListaMensajes({ mensajes, usuarioActual, onAbrir }) {

  if (mensajes.length === 0) {
    return (
      <div className="bandeja-encargado">
        <div className="bandeja-encabezado">
          <h2 className="bandeja-titulo">Bandeja de entrada</h2>
          <span className="bandeja-contador">0 mensajes</span>
        </div>
        <div className="bandeja-vacia">
          <p className="bandeja-vacia-texto">No hay mensajes disponibles.</p>
          <p className="bandeja-vacia-sub">
            Aquí aparecerán los mensajes de los docentes de sus estudiantes.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bandeja-encargado">

      <div className="bandeja-encabezado">
        <h2 className="bandeja-titulo">Bandeja de entrada</h2>
        <span className="bandeja-contador">
          {mensajes.length} mensaje{mensajes.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="bandeja-lista">
        {mensajes.map((m) => {

          const miEstado = m.destinatarios?.find(
            (d) => d.cedula === usuarioActual.cedula
          );

          const noLeido = miEstado?.estado !== "leido";

          return (
            <button
              key={m.id}
              className={`bandeja-item ${noLeido ? "no-leido" : ""}`}
              onClick={() => onAbrir(m)}
            >
              {/* Indicador visual no leído */}
              <div className="bandeja-item-indicador">
                {noLeido && <span className="dot-nuevo" title="No leído" />}
              </div>

              <div className="bandeja-item-cuerpo">
                <div className="bandeja-item-cabecera">
                  <span className={`bandeja-item-asunto ${noLeido ? "negrita" : ""}`}>
                    {m.asunto || "(Sin asunto)"}
                  </span>
                  <span className="bandeja-item-fecha">
                    {new Date(m.fechaEnvio).toLocaleDateString()}
                  </span>
                </div>

                <div className="bandeja-item-meta">
                  <span className="bandeja-item-remitente">
                    {m.remitente?.nombre}
                  </span>
                  {m.permiteRespuestas && (
                    <span className="bandeja-badge-abierto">Conversación abierta</span>
                  )}
                </div>

                <p className="bandeja-item-preview">
                  {m.contenido?.slice(0, 80)}{m.contenido?.length > 80 ? "…" : ""}
                </p>
              </div>

              <div className="bandeja-item-estado">
                {noLeido
                  ? <span className="estado-badge estado-nuevo">Nuevo</span>
                  : <span className="estado-badge estado-leido">Leído</span>
                }
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default ListaMensajes;
