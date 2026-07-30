import { asegurarColeccionDemo, obtenerMensajesDemo } from './demoSeed';

const KEY = 'mensajes_scholarlink';

const normalizarDestinatario = (destinatario) => {
    if (!destinatario) {
        return null;
    }

    if (typeof destinatario === 'string') {
        return {
            cedula: destinatario,
            nombre: destinatario,
            estudiantes: [],
            estado: 'enviado',
            fechaLectura: null
        };
    }

    return {
        cedula: destinatario.cedula || destinatario.id || '',
        nombre: destinatario.nombre || destinatario.cedula || destinatario.id || 'Sin nombre',
        estudiantes: Array.isArray(destinatario.estudiantes) ? destinatario.estudiantes : [],
        estado: destinatario.estado || 'enviado',
        fechaLectura: destinatario.fechaLectura || null
    };
};

const normalizarMensaje = (mensaje) => {
    if (!mensaje || typeof mensaje !== 'object') {
        return null;
    }

    const remitente = typeof mensaje.remitente === 'object' && mensaje.remitente !== null
        ? {
            cedula: mensaje.remitente.cedula || mensaje.remitente.id || '',
            nombre: mensaje.remitente.nombre || mensaje.remitente.cedula || 'Sin remitente'
        }
        : {
            cedula: mensaje.remitente || mensaje.remitenteCedula || '',
            nombre: mensaje.remitenteNombre || mensaje.remitente || 'Sin remitente'
        };

    const destinatariosBase = Array.isArray(mensaje.destinatarios)
        ? mensaje.destinatarios
        : (mensaje.destinatario ? [mensaje.destinatario] : []);

    return {
        ...mensaje,
        id: mensaje.id || `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        tipo: mensaje.tipo || 'mensaje',
        remitente,
        destinatarios: destinatariosBase
            .map(normalizarDestinatario)
            .filter(Boolean),
        estudiantes: Array.isArray(mensaje.estudiantes) ? mensaje.estudiantes : [],
        asunto: mensaje.asunto || '',
        contenido: mensaje.contenido || mensaje.mensaje || '',
        respuestas: Array.isArray(mensaje.respuestas) ? mensaje.respuestas : [],
        permiteRespuestas: typeof mensaje.permiteRespuestas === 'boolean'
            ? mensaje.permiteRespuestas
            : true,
        fechaEnvio: mensaje.fechaEnvio || mensaje.fecha || new Date().toISOString(),
        ultimaRevisionDocente: mensaje.ultimaRevisionDocente || null
    };
};

const inicializarMensajes = () => {
    const data = JSON.parse(localStorage.getItem(KEY)) || [];
    const normalizados = (Array.isArray(data) ? data : []).map(normalizarMensaje).filter(Boolean);
    const demo = obtenerMensajesDemo().map(normalizarMensaje).filter(Boolean);
    const combinado = asegurarColeccionDemo(normalizados, demo, 'id');

    if (JSON.stringify(combinado) !== JSON.stringify(data)) {
        localStorage.setItem(KEY, JSON.stringify(combinado));
    }

    return combinado;
};

export const obtenerMensajes = () => inicializarMensajes();

export const guardarMensaje = (mensaje) => {
    const lista = obtenerMensajes();
    const actualizado = [...lista, normalizarMensaje(mensaje)].filter(Boolean);
    localStorage.setItem(KEY, JSON.stringify(actualizado));
};

export const guardarMensajes = (lista) => {
    const normalizados = (Array.isArray(lista) ? lista : [])
        .map(normalizarMensaje)
        .filter(Boolean);
    localStorage.setItem(KEY, JSON.stringify(normalizados));
};
