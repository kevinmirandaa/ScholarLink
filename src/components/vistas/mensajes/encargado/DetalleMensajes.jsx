import { useState } from "react";
import { obtenerMensajes, guardarMensajes } from "../../../util/mensajes";
import { crearNotificacion } from "../../../util/notificaciones";

function DetalleMensaje({ mensaje, onVolver, usuarioActual }) {

    const [respuesta, setRespuesta] = useState("");

    const enviarRespuesta = () => {

        if (!respuesta.trim()) {
            alert("La respuesta no puede estar vacía");
            return;
        }

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
                respuestas: [
                    ...(m.respuestas || []),
                    nuevaRespuesta
                ]
            };
        });

        guardarMensajes(actualizados);

        // =============================
        // 🔥 CREAR NOTIFICACIÓN AL DOCENTE
        // =============================
        crearNotificacion({
            id: `noti_${Date.now()}_${mensaje.remitente.cedula}`,
            usuarioCedula: mensaje.remitente.cedula, // 👈 DOCENTE

            tipo: "mensaje",

            referenciaId: mensaje.id,

            titulo: `Respuesta de ${usuarioActual.nombre}`,
            resumen: respuesta.slice(0, 50),

            leido: false,

            fecha: new Date().toISOString()
        });

        setRespuesta("");
        alert("Respuesta enviada");
    };

    return (
        <div>

            <button onClick={onVolver}>
                ← Volver
            </button>

            <h2>{mensaje.asunto}</h2>

            <p><strong>De:</strong> {mensaje.remitente.nombre}</p>

            <p>{mensaje.contenido}</p>

            <hr />

            <h4>Respuestas</h4>

            {(mensaje.respuestas || []).map(r => (
                <div key={r.id} style={{ marginBottom: "10px" }}>
                    <strong>{r.autor.nombre}</strong>
                    <div>{r.contenido}</div>
                    <small>{new Date(r.fecha).toLocaleString()}</small>
                </div>
            ))}

            {mensaje.permiteRespuestas && (
                <>
                    <hr />

                    <textarea
                        className="form-control mb-2"
                        placeholder="Escribir respuesta..."
                        value={respuesta}
                        onChange={(e) => setRespuesta(e.target.value)}
                    />

                    <button className="btn btn-primary" onClick={enviarRespuesta}>
                        Responder
                    </button>
                </>
            )}

            {!mensaje.permiteRespuestas && (
                <p style={{ color: "gray" }}>
                    Este mensaje no permite respuestas.
                </p>
            )}

        </div>
    );
}

export default DetalleMensaje;