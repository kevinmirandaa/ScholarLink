// 🔐 CLAVE
const KEY = "historial_scholarlink";

// ⚔️ INIT
const initHistorial = () => {
    const data = localStorage.getItem(KEY);

    if (!data) {
        const inicial = [];
        localStorage.setItem(KEY, JSON.stringify(inicial));
        return inicial;
    }

    return JSON.parse(data);
};

// 📋 OBTENER TODOS
export const obtenerRegistros = () => {
    return initHistorial();
};

// 💾 GUARDAR
export const guardarRegistros = (lista) => {
    localStorage.setItem(KEY, JSON.stringify(lista));
};

// ➕ CREAR REGISTRO
export const crearRegistro = (nuevo, usuarioActual) => {

    const registros = obtenerRegistros();

    // 🔥 validar tipo
    const tiposValidos = ["aviso", "tarea", "observacion"];
    if (!tiposValidos.includes(nuevo.tipo)) {
        throw new Error("Tipo de registro inválido");
    }

    // 🔥 construir notificaciones
    let notificaciones = [];

    if (nuevo.notificar && nuevo.estudiante.encargados) {
        notificaciones = nuevo.estudiante.encargados.map(enc => ({
            cedula: enc.cedula,
            nombre: enc.nombre,
            visto: false,
            fechaVista: null
        }));
    }

    const nuevoRegistro = {
        id: `reg_${Date.now()}`,

        tipo: nuevo.tipo,
        titulo: nuevo.titulo,
        contenido: nuevo.contenido,

        estudiante: {
            id: nuevo.estudiante.id,
            nombre: nuevo.estudiante.nombre,
            grado: nuevo.estudiante.grado,
            seccion: nuevo.estudiante.seccion
        },

        creadoPor: {
            cedula: usuarioActual.cedula,
            nombre: usuarioActual.nombre
        },

        fecha: new Date().toISOString(),

        notificado: nuevo.notificar || false,
        notificaciones
    };

    const actualizado = [...registros, nuevoRegistro];

    guardarRegistros(actualizado);

    return actualizado;
};

// 🔍 FILTRAR POR DOCENTE
export const obtenerRegistrosDocente = (usuarioActual, estudiantes) => {

    const registros = obtenerRegistros();

    // 🔥 solo estudiantes a su cargo
    const idsPermitidos = estudiantes.map(e => e.id);

    return registros.filter(r =>
        idsPermitidos.includes(r.estudiante.id)
    );
};

// 🔍 FILTRAR POR ENCARGADO
export const obtenerRegistrosEncargado = (usuarioActual) => {

    const registros = obtenerRegistros();

    return registros.filter(r =>
        r.notificaciones.some(n => n.cedula === usuarioActual.cedula)
    );
};

// 🔍 FILTRAR POR ESTUDIANTE (para vista del estudiante y admin)
export const obtenerRegistrosPorEstudiante = (estudianteId) => {
    const registros = obtenerRegistros();
    return registros.filter(r => r.estudiante.id === estudianteId);
};

// 👁️ MARCAR COMO VISTO
export const marcarRegistroVisto = (registroId, cedulaEncargado) => {

    const registros = obtenerRegistros();

    const actualizado = registros.map(r => {

        if (r.id !== registroId) return r;

        return {
            ...r,
            notificaciones: r.notificaciones.map(n => {

                if (n.cedula !== cedulaEncargado) return n;

                return {
                    ...n,
                    visto: true,
                    fechaVista: new Date().toISOString()
                };
            })
        };
    });

    guardarRegistros(actualizado);
};