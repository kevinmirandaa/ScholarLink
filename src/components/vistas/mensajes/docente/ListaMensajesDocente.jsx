import React from "react";

function ListaMensajesDocente({ mensajes, usuarioActual, onAbrir }) {

    if (mensajes.length === 0) {
        return <p>No tienes mensajes en la bandeja.</p>;
    }

    return (
        <div>
            <h2>Bandeja de mensajes</h2>

            {mensajes.map(m => {

                const esRemitente = m.remitente.cedula === usuarioActual.cedula;

                const miEstado = m.destinatarios.find(
                    d => d.cedula === usuarioActual.cedula
                );

                const noLeido = miEstado ? miEstado.estado !== "leido" : false;

                return (
                    <div
                        key={m.id}
                        onClick={() => onAbrir(m)}
                        style={{
                            border: "1px solid #ccc",
                            padding: "10px",
                            marginBottom: "8px",
                            cursor: "pointer",
                            background: noLeido ? "#eef5fb" : "#fff"
                        }}
                    >
                        <strong>{m.asunto || "(Sin asunto)"}</strong>

                        {m.permiteRespuestas && (
                            <span style={{
                                fontSize: "0.8rem",
                                color: "#1f4f86",
                                fontWeight: "500",
                                marginLeft: "5px"
                            }}>
                                - Conversación abierta
                            </span>
                        )}

                        {/* 🔥 NUEVO INDICADOR */}
                        {m.tieneNuevasRespuestas && (
                            <span style={{
                                color: "green",
                                fontWeight: "bold",
                                marginLeft: "5px"
                            }}>
                                ● Respuesta nueva
                            </span>
                        )}

                        <div>
                            {esRemitente
                                ? "📤 Enviado por ti"
                                : `📥 De: ${m.remitente.nombre}`}
                        </div>

                        <div style={{ fontSize: "0.9rem", color: "#666" }}>
                            {new Date(m.fechaEnvio).toLocaleString()}
                        </div>

                        {!esRemitente && noLeido && (
                            <span style={{ color: "blue", fontWeight: "bold" }}>
                                ● Nuevo
                            </span>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

export default ListaMensajesDocente;