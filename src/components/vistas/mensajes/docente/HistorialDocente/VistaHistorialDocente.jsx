import { useEffect, useState } from "react";
import { obtenerMensajes } from "../../../../util/mensajes";

import ListaHistorialDocente from "./ListaHistorialDocente";
import DetalleHistorialDocente from "./DetalleHistorialDocente";
import FiltrosHistorialDocente from "./FiltrosHistorialDocente";

function VistaHistorialDocente({ usuarioActual, mensajeInicial, setMensajeInicial }) {

    const [mensajes, setMensajes] = useState([]);
    const [seleccionado, setSeleccionado] = useState(null);

    const [filtroEstudiante, setFiltroEstudiante] = useState("");
    const [filtroTipo, setFiltroTipo] = useState("");
    const [filtroGrado, setFiltroGrado] = useState("");
    const [fechaDesde, setFechaDesde] = useState("");
    const [fechaHasta, setFechaHasta] = useState("");
    const [busqueda, setBusqueda] = useState("");

    const [mostrarFiltros, setMostrarFiltros] = useState(true);

    useEffect(() => {
        if (mensajeInicial) {
            setSeleccionado(mensajeInicial);
            setMensajeInicial(null);
        }
    }, [mensajeInicial]);

    const actualizarSeleccionado = () => {
        const todos = obtenerMensajes();
        const actualizado = todos.find(m => m.id === seleccionado?.id);

        if (actualizado) {
            setSeleccionado(actualizado);
        }
    };

    const cargarMensajes = () => {
        const todos = obtenerMensajes();

        let mios = todos
            .filter(m => m.remitente.cedula === usuarioActual.cedula)
            .map(m => {
                const ultimaRespuesta = (m.respuestas || []).slice(-1)[0];

                return {
                    ...m,
                    tieneNuevasRespuestas:
                        ultimaRespuesta &&
                        (!m.ultimaRevisionDocente ||
                            new Date(ultimaRespuesta.fecha) > new Date(m.ultimaRevisionDocente))
                };
            });

        // ⚔️ FILTRO HISTORIAL (CLAVE)
        mios = mios.filter(m => {

            const mi = m.destinatarios.find(
                d => d.cedula === usuarioActual.cedula
            );

            const leido = mi ? mi.estado === "leido" : true;
            const cerrado = !m.permiteRespuestas;

            return leido && cerrado;
        });

        // 🔥 ORDEN
        mios = mios.sort((a, b) => {
            if (a.tieneNuevasRespuestas && !b.tieneNuevasRespuestas) return -1;
            if (!a.tieneNuevasRespuestas && b.tieneNuevasRespuestas) return 1;

            return new Date(b.fechaEnvio) - new Date(a.fechaEnvio);
        });

        // 🔥 FILTROS EXTRA

        if (filtroTipo) {
            mios = mios.filter(m => m.tipo === filtroTipo);
        }

        if (filtroEstudiante) {
            mios = mios.filter(m =>
                m.estudiantes.some(e => e.nombre === filtroEstudiante)
            );
        }

        if (filtroGrado) {
            mios = mios.filter(m =>
                m.estudiantes.some(e => e.grado === filtroGrado)
            );
        }

        if (fechaDesde) {
            mios = mios.filter(m =>
                new Date(m.fechaEnvio) >= new Date(fechaDesde)
            );
        }

        if (fechaHasta) {
            mios = mios.filter(m =>
                new Date(m.fechaEnvio) <= new Date(fechaHasta + "T23:59:59")
            );
        }

        if (busqueda.trim()) {
            const texto = busqueda.toLowerCase();

            mios = mios.filter(m =>
                (m.asunto || "").toLowerCase().includes(texto) ||
                (m.contenido || "").toLowerCase().includes(texto) ||
                m.estudiantes.some(e =>
                    e.nombre.toLowerCase().includes(texto)
                )
            );
        }

        setMensajes(mios);
    };

    useEffect(() => {
        cargarMensajes();
    }, [
        usuarioActual,
        filtroEstudiante,
        filtroTipo,
        filtroGrado,
        fechaDesde,
        fechaHasta,
        busqueda
    ]);

    const estudiantesDisponibles = [
        ...new Set(
            mensajes.flatMap(m => m.estudiantes.map(e => e.nombre))
        )
    ];

    const gradosDisponibles = [
        ...new Set(
            mensajes.flatMap(m => m.estudiantes.map(e => e.grado))
        )
    ];

    return (
        <div className="container">

            {seleccionado === null ? (
                <>

                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <div>
                            <h2 className="mb-0">Historial de Comunicaciones</h2>
                            <small className="text-muted">
                                {mensajes.length} registros encontrados
                            </small>
                        </div>

                        <button
                            className="btn btn-outline-secondary"
                            onClick={() => setMostrarFiltros(!mostrarFiltros)}
                        >
                            {mostrarFiltros ? "▲ Ocultar" : "▼ Mostrar"}
                        </button>
                    </div>

                    {mostrarFiltros && (
                        <FiltrosHistorialDocente
                            filtroEstudiante={filtroEstudiante}
                            setFiltroEstudiante={setFiltroEstudiante}
                            filtroTipo={filtroTipo}
                            setFiltroTipo={setFiltroTipo}
                            filtroGrado={filtroGrado}
                            setFiltroGrado={setFiltroGrado}
                            fechaDesde={fechaDesde}
                            setFechaDesde={setFechaDesde}
                            fechaHasta={fechaHasta}
                            setFechaHasta={setFechaHasta}
                            busqueda={busqueda}
                            setBusqueda={setBusqueda}
                            estudiantes={estudiantesDisponibles}
                            grados={gradosDisponibles}
                        />
                    )}

                    <ListaHistorialDocente
                        mensajes={mensajes}
                        setSeleccionado={setSeleccionado}
                        cargarMensajes={cargarMensajes}
                    />

                </>
            ) : (
                <DetalleHistorialDocente
                    mensaje={seleccionado}
                    usuarioActual={usuarioActual}
                    onVolver={() => {
                        setSeleccionado(null);
                        cargarMensajes();
                    }}
                    cargarMensajes={cargarMensajes}
                    actualizarSeleccionado={actualizarSeleccionado}
                />
            )}

        </div>
    );
}

export default VistaHistorialDocente;