import { obtenerMensajes, guardarMensajes } from "../../../../util/mensajes";
import "./ListaHistorialDocente.css";

function ListaHistorialDocente({ mensajes, setSeleccionado, cargarMensajes }) {

    if (mensajes.length === 0) {
        return <p>No tienes mensajes en el historial.</p>;
    }

    return (
        <div>

            <h2 className="mb-3">Historial de mensajes</h2>

            <div className="d-flex flex-column gap-2">

                {mensajes.map(m => (
                    <div
                        key={m.id}
                        className={`historial-card tipo-${m.tipo || "mensaje"}`}
                        onClick={() => {

                            const todos = obtenerMensajes();

                            const actualizados = todos.map(msg => {
                                if (msg.id !== m.id) return msg;

                                return {
                                    ...msg,
                                    ultimaRevisionDocente: new Date().toISOString()
                                };
                            });

                            guardarMensajes(actualizados);
                            cargarMensajes();

                            setSeleccionado({
                                ...m,
                                tieneNuevasRespuestas: false
                            });
                        }}
                    >

                        <div className="historial-header">

                            <div className="d-flex align-items-center gap-2">

                                {m.tieneNuevasRespuestas && (
                                    <span className="punto-nuevo">●</span>
                                )}

                                <span className={`badge-tipo tipo-${m.tipo}`}>
                                    {(m.tipo || "mensaje").toUpperCase()}
                                </span>

                            </div>

                            <span className="fecha">
                                {new Date(m.fechaEnvio).toLocaleString()}
                            </span>

                        </div>

                        <h5 className="historial-titulo">
                            {m.asunto || "(Sin asunto)"}
                        </h5>

                        <p className="historial-contenido">
                            {m.contenido}
                        </p>

                        <div className="historial-footer d-flex justify-content-between">

                            <small>
                                Por: {m.remitente.nombre}
                            </small>

                            <small>
                                Destinatarios: {m.destinatarios.length}
                            </small>

                        </div>

                    </div>
                ))}

            </div>

        </div>
    );
}

export default ListaHistorialDocente;