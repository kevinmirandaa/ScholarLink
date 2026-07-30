import { useEffect, useState } from "react";
import SelectorEstudiantes from "./SelectorEstudiantes.jsx";
import ListaDestinatarios from "./ListaDestinatarios.jsx";
import FormularioMensaje from "./FormularioMensaje.jsx";
import DetalleMensajeDocente from "./DetalleMensajeDocente.jsx";

import {
    guardarMensaje,
    obtenerMensajes,
    guardarMensajes
} from "../../../util/mensajes.js";
import {
    crearNotificacion,
    marcarNotificacionesPorReferenciaComoLeidas
} from "../../../util/notificaciones";
import "./VistaDocenteMensajes.css";

function VistaMensajesDocente({ usuarioActual, mensajeInicial, setMensajeInicial }) {

    const [mensajes, setMensajes]               = useState([]);
    const [mensajeSeleccionado, setMensajeSeleccionado] = useState(null);
    const [mostrarCompose, setMostrarCompose]   = useState(false);

    // Compose state
    const [estudiantesSeleccionados, setEstudiantes] = useState([]);
    const [asunto, setAsunto]               = useState("");
    const [contenido, setContenido]         = useState("");
    const [tipo, setTipo]                   = useState("mensaje");
    const [permiteRespuestas, setPermiteRespuestas] = useState(true);

    const cargarMensajes = () => {
        const todos = obtenerMensajes();
        let mios = todos.filter(m => {
            const esRemitente = m.remitente.cedula === usuarioActual.cedula;
            const esDestinatario = m.destinatarios.some(d => d.cedula === usuarioActual.cedula);
            return esRemitente || esDestinatario;
        }).map(m => {
            const ultimaRespuesta = (m.respuestas || []).slice(-1)[0];
            return {
                ...m,
                tieneNuevasRespuestas:
                    m.remitente.cedula === usuarioActual.cedula &&
                    ultimaRespuesta &&
                    (!m.ultimaRevisionDocente ||
                        new Date(ultimaRespuesta.fecha) > new Date(m.ultimaRevisionDocente))
            };
        }).sort((a, b) => new Date(b.fechaEnvio) - new Date(a.fechaEnvio));

        setMensajes(mios);
    };

    useEffect(() => {
        cargarMensajes();
    }, [usuarioActual]);

    useEffect(() => {
        if (mensajeInicial) {
            setMensajeSeleccionado(mensajeInicial);
            if (setMensajeInicial) setMensajeInicial(null);
        }
    }, [mensajeInicial]);

    const abrirMensaje = (mensaje) => {
        const todos = obtenerMensajes();
        const actualizados = todos.map(m => {
            if (m.id !== mensaje.id) return m;
            return {
                ...m,
                ultimaRevisionDocente: new Date().toISOString(),
                destinatarios: m.destinatarios.map(d => {
                    if (d.cedula !== usuarioActual.cedula) return d;
                    return { ...d, estado: "leido", fechaLectura: new Date().toISOString() };
                })
            };
        });
        guardarMensajes(actualizados);
        marcarNotificacionesPorReferenciaComoLeidas({
            usuarioCedula: usuarioActual.cedula,
            referenciaId: mensaje.id
        });
        setMensajes(actualizados.filter(m =>
            m.remitente.cedula === usuarioActual.cedula ||
            m.destinatarios.some(d => d.cedula === usuarioActual.cedula)
        ));
        setMensajeSeleccionado(actualizados.find(m => m.id === mensaje.id) || mensaje);
    };

    const obtenerDestinatarios = (estudiantes) => {
        const mapa = {};
        estudiantes.forEach(est => {
            est.encargados.forEach(enc => {
                if (!mapa[enc.cedula]) {
                    mapa[enc.cedula] = { cedula: enc.cedula, nombre: enc.nombre, estudiantes: [est.id], estado: "enviado", fechaLectura: null };
                } else {
                    mapa[enc.cedula].estudiantes.push(est.id);
                }
            });
        });
        return Object.values(mapa);
    };

    const enviarMensaje = () => {
        if (estudiantesSeleccionados.length === 0) { alert("Seleccione al menos un estudiante"); return; }
        if (!asunto.trim()) { alert("El asunto no puede estar vacío"); return; }
        if (!contenido.trim()) { alert("El mensaje no puede estar vacío"); return; }

        const permite = tipo === "mensaje" ? permiteRespuestas : false;
        const mensaje = {
            id: `msg_${Date.now()}`,
            tipo,
            remitente: { cedula: usuarioActual.cedula, nombre: usuarioActual.nombre },
            destinatarios: obtenerDestinatarios(estudiantesSeleccionados),
            estudiantes: estudiantesSeleccionados.map(e => ({ id: e.id, nombre: e.nombre, grado: e.grado, seccion: e.seccion })),
            asunto,
            contenido,
            respuestas: [],
            permiteRespuestas: permite,
            fechaEnvio: new Date().toISOString(),
            ultimaRevisionDocente: new Date().toISOString()
        };

        guardarMensaje(mensaje);
        mensaje.destinatarios.forEach(dest => {
            crearNotificacion({
                id: `noti_${Date.now()}_${dest.cedula}`,
                usuarioCedula: dest.cedula,
                tipo: mensaje.tipo,
                referenciaId: mensaje.id,
                titulo: mensaje.asunto || "Nuevo mensaje",
                resumen: mensaje.contenido.slice(0, 50),
                leido: false,
                fecha: new Date().toISOString()
            });
        });

        setEstudiantes([]); setAsunto(""); setContenido(""); setTipo("mensaje"); setPermiteRespuestas(true);
        setMostrarCompose(false);
        cargarMensajes();
    };

    // ── Vista de detalle ────────────────────────────────────────────────────
    if (mensajeSeleccionado) {
        return (
            <DetalleMensajeDocente
                mensaje={mensajeSeleccionado}
                onVolver={() => { setMensajeSeleccionado(null); cargarMensajes(); }}
                usuarioActual={usuarioActual}
            />
        );
    }

    // ── Compose ─────────────────────────────────────────────────────────────
    if (mostrarCompose) {
        return (
            <div className="mensajes-compose">
                <div className="compose-header">
                    <h2 className="compose-titulo">Nuevo mensaje</h2>
                    <button className="btn-compose-cerrar" onClick={() => setMostrarCompose(false)}>✕</button>
                </div>
                <SelectorEstudiantes
                    seleccionados={estudiantesSeleccionados}
                    setSeleccionados={setEstudiantes}
                    usuarioActual={usuarioActual}
                />
                <ListaDestinatarios estudiantes={estudiantesSeleccionados} />
                <FormularioMensaje
                    asunto={asunto}
                    setAsunto={setAsunto}
                    contenido={contenido}
                    setContenido={setContenido}
                    tipo={tipo}
                    setTipo={setTipo}
                    permiteRespuestas={permiteRespuestas}
                    setPermiteRespuestas={setPermiteRespuestas}
                    onEnviar={enviarMensaje}
                />
            </div>
        );
    }

    // ── Inbox ────────────────────────────────────────────────────────────────
    return (
        <div className="mensajes-inbox">
            <div className="inbox-header">
                <div>
                    <h2 className="inbox-titulo">Mensajes</h2>
                    <p className="inbox-sub">{mensajes.length} conversaciones</p>
                </div>
                <button className="btn-compose" onClick={() => setMostrarCompose(true)}>
                    ✏️ Enviar mensaje
                </button>
            </div>

            {mensajes.length === 0 ? (
                <div className="inbox-vacio">
                    <span className="inbox-vacio-icon">✉️</span>
                    <p>No tienes mensajes. ¡Envía el primero!</p>
                </div>
            ) : (
                <div className="inbox-lista">
                    {mensajes.map(m => {
                        const esRemitente = m.remitente.cedula === usuarioActual.cedula;
                        const miEstado = m.destinatarios.find(d => d.cedula === usuarioActual.cedula);
                        const noLeido = miEstado ? miEstado.estado !== "leido" : false;
                        const tieneRespuestas = m.tieneNuevasRespuestas;

                        return (
                            <div
                                key={m.id}
                                className={`inbox-item ${noLeido || tieneRespuestas ? 'inbox-item-unread' : ''}`}
                                onClick={() => abrirMensaje(m)}
                            >
                                <div className="inbox-item-avatar">
                                    {(esRemitente
                                        ? (m.destinatarios[0]?.nombre || '?')
                                        : m.remitente.nombre
                                    ).charAt(0).toUpperCase()}
                                </div>
                                <div className="inbox-item-body">
                                    <div className="inbox-item-row">
                                        <span className="inbox-item-nombre">
                                            {esRemitente
                                                ? `Para: ${m.destinatarios.map(d => d.nombre).join(', ')}`
                                                : `De: ${m.remitente.nombre}`}
                                        </span>
                                        <span className="inbox-item-fecha">
                                            {new Date(m.fechaEnvio).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                                        </span>
                                    </div>
                                    <p className={`inbox-item-asunto ${noLeido || tieneRespuestas ? 'negrita' : ''}`}>
                                        {m.asunto || '(Sin asunto)'}
                                    </p>
                                    <p className="inbox-item-preview">
                                        {m.contenido?.slice(0, 80)}{m.contenido?.length > 80 ? '…' : ''}
                                    </p>
                                </div>
                                <div className="inbox-item-badges">
                                    {noLeido && <span className="badge-unread" />}
                                    {tieneRespuestas && <span className="badge-reply">Respuesta</span>}
                                    {m.permiteRespuestas && <span className="badge-open">Abierto</span>}
                                    <span className={`badge-tipo tipo-${m.tipo}`}>{m.tipo}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default VistaMensajesDocente;
