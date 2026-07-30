import { useState } from "react";
import { obtenerMensajes, guardarMensajes } from "../../../util/mensajes";
import {crearNotificacion} from "../../../util/notificaciones.js";

function DetalleMensajeDocente({ mensaje, onVolver, usuarioActual }) {

    const [respuesta, setRespuesta] = useState("");

    // ⚔️ RESPONDER
    const enviarRespuesta = () => {

        if (!respuesta.trim()) {
            alert("La respuesta no puede estar vacía");
            return;
        }

        const todos = obtenerMensajes();

        const actualizados = todos.map(m => {

            if (m.id !== mensaje.id) return m;

            return {
                ...m,
                respuestas: [
                    ...(m.respuestas || []),
                    {
                        id: `res_${Date.now()}`,
                        autor: {
                            cedula: usuarioActual.cedula,
                            nombre: usuarioActual.nombre
                        },
                        contenido: respuesta,
                        fecha: new Date().toISOString()
                    }
                ],

                // 🔥 CLAVE: resetear estado de destinatarios
                destinatarios: m.destinatarios.map(d => {

                    // ⚔️ No afectar al que responde
                    if (d.cedula !== usuarioActual.cedula) {
                        return {
                            ...d,
                            estado: "enviado", // o "no_leido"
                            fechaLectura: null
                        };
                    }

                    return d;
                })
            };
        });

        guardarMensajes(actualizados);

        // =============================
        // 🔔 CREAR NOTIFICACIONES
        // =============================
        const mensajeActualizado = actualizados.find(m => m.id === mensaje.id);

        mensajeActualizado.destinatarios.forEach(dest => {

            if (dest.cedula === usuarioActual.cedula) return;

            crearNotificacion({
                id: `noti_${Date.now()}_${dest.cedula}`,
                usuarioCedula: dest.cedula,
                tipo: "respuesta",
                referenciaId: mensaje.id,
                titulo: "Nueva respuesta",
                resumen: respuesta.slice(0, 50),
                leido: false,
                fecha: new Date().toISOString()
            });
        });

        setRespuesta("");
        alert("Respuesta enviada");
    };

    // 🛑 CERRAR CONVERSACIÓN (SOLO DOCENTE)
    const cerrarConversacion = () => {

        const todos = obtenerMensajes();

        const actualizados = todos.map(m => {
            if (m.id !== mensaje.id) return m;

            return {
                ...m,
                permiteRespuestas: false
            };
        });

        guardarMensajes(actualizados);

        alert("Conversación cerrada");
    };

    return (
        <div>

            <button className="btn btn-outline-secondary mb-3" onClick={onVolver}>
                ← Volver
            </button>

            <h2>{mensaje.asunto || "(Sin asunto)"}</h2>

            <p>
                <strong>De:</strong> {mensaje.remitente.nombre}
            </p>

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

            {/* ⚔️ RESPONDER */}
            {mensaje.permiteRespuestas && (
                <>
                    <textarea
                        className="form-control mt-3"
                        placeholder="Responder..."
                        value={respuesta}
                        onChange={(e) => setRespuesta(e.target.value)}
                    />

                    <button className="btn btn-primary mt-2" onClick={enviarRespuesta}>
                        Responder
                    </button>

                    {/* 🔥 SOLO DOCENTE */}
                    <button
                        className="btn btn-danger mt-2 ms-2"
                        onClick={cerrarConversacion}
                    >
                        Cerrar conversación
                    </button>
                </>
            )}

            {!mensaje.permiteRespuestas && (
                <p className="text-muted mt-3">
                    Esta conversación está cerrada.
                </p>
            )}

            <hr />

            <h4>Destinatarios</h4>

            <div className="d-flex flex-column gap-2">
                {mensaje.destinatarios.map(d => (
                    <div key={d.cedula} className="p-2 border rounded">

                        <strong>{d.nombre}</strong>

                        <div>
                            Estado:{" "}
                            <span className={
                                d.estado === "leido" ? "text-success" : "text-warning"
                            }>
                                {d.estado}
                            </span>
                        </div>

                        {d.fechaLectura && (
                            <small className="text-muted">
                                Leído el: {new Date(d.fechaLectura).toLocaleString()}
                            </small>
                        )}

                    </div>
                ))}
            </div>

        </div>
    );
}

export default DetalleMensajeDocente;