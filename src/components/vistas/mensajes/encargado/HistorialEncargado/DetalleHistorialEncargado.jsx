import { useState } from "react";
import { obtenerMensajes, guardarMensajes } from "../../../../util/mensajes";

function DetalleHistorialEncargado({
                                       mensaje,
                                       usuarioActual,
                                       onVolver,
                                       cargarMensajes
                                   }) {

    const [respuesta, setRespuesta] = useState("");

    const responder = () => {
        if (!mensaje.permiteRespuestas) return;
        if (!respuesta.trim()) return;

        const todos = obtenerMensajes();

        const nuevaRespuesta = {
            id: `res_${Date.now()}`,
            autor: {
                cedula: usuarioActual.cedula,
                nombre: usuarioActual.nombre
            },
            contenido: respuesta,
            fecha: new Date().toISOString()
        };

        const actualizados = todos.map(m => {
            if (m.id !== mensaje.id) return m;

            return {
                ...m,
                respuestas: [...(m.respuestas || []), nuevaRespuesta]
            };
        });

        guardarMensajes(actualizados);
        setRespuesta("");
        cargarMensajes();
    };

    return (
        <div>

            <button className="btn btn-outline-secondary mb-3" onClick={onVolver}>
                ← Volver
            </button>

            <h2>{mensaje.asunto}</h2>

            <p className="text-muted">
                {new Date(mensaje.fechaEnvio).toLocaleString()}
            </p>

            <hr />

            <p>{mensaje.contenido}</p>

            <hr />

            <h4>Respuestas</h4>

            {(mensaje.respuestas || []).length === 0 ? (
                <p>No hay respuestas.</p>
            ) : (
                mensaje.respuestas.map(r => (
                    <div key={r.id} className="border rounded p-2 mb-2">
                        <strong>{r.autor.nombre}</strong>
                        <div>{r.contenido}</div>
                        <small className="text-muted">
                            {new Date(r.fecha).toLocaleString()}
                        </small>
                    </div>
                ))
            )}

            {/* 🔥 SOLO RESPONDE SI SE PERMITE */}
            {mensaje.permiteRespuestas && (
                <>
                    <textarea
                        className="form-control mt-3"
                        placeholder="Responder..."
                        value={respuesta}
                        onChange={(e) => setRespuesta(e.target.value)}
                    />

                    <button className="btn btn-primary mt-2" onClick={responder}>
                        Responder
                    </button>
                </>
            )}

            {!mensaje.permiteRespuestas && (
                <p className="text-muted mt-2">
                    Este registro no permite respuestas.
                </p>
            )}

        </div>
    );
}

export default DetalleHistorialEncargado;