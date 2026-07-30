import { useEffect, useState } from "react";
import { obtenerMensajes } from "../../../../util/mensajes";

import ListaHistorialEncargado from "./ListaHistorialEncargado";
import DetalleHistorialEncargado from "./DetalleHistorialEncargado";
import FiltrosHistorialEncargado from "./FiltroHistorialEncargado";

function VistaHistorialEncargado({ usuarioActual }) {

    const [mensajes, setMensajes] = useState([]);
    const [seleccionado, setSeleccionado] = useState(null);

    const [filtroTipo, setFiltroTipo] = useState("");
    const [fechaDesde, setFechaDesde] = useState("");
    const [fechaHasta, setFechaHasta] = useState("");
    const [busqueda, setBusqueda] = useState("");

    const cargarMensajes = () => {
        const todos = obtenerMensajes();

        let recibidos = todos.filter(m => {

            const mi = m.destinatarios.find(d => d.cedula === usuarioActual.cedula);
            if (!mi) return false;

            const leido = mi.estado === "leido";
            const cerrado = !m.permiteRespuestas;

            return leido && cerrado;
        });

        if (filtroTipo) {
            recibidos = recibidos.filter(m => m.tipo === filtroTipo);
        }

        if (fechaDesde) {
            recibidos = recibidos.filter(m =>
                new Date(m.fechaEnvio) >= new Date(fechaDesde)
            );
        }

        if (fechaHasta) {
            recibidos = recibidos.filter(m =>
                new Date(m.fechaEnvio) <= new Date(fechaHasta + "T23:59:59")
            );
        }

        if (busqueda.trim()) {
            const texto = busqueda.toLowerCase();
            recibidos = recibidos.filter(m =>
                (m.asunto || "").toLowerCase().includes(texto) ||
                (m.contenido || "").toLowerCase().includes(texto)
            );
        }

        recibidos.sort((a, b) =>
            new Date(b.fechaEnvio) - new Date(a.fechaEnvio)
        );

        setMensajes(recibidos);
    };

    useEffect(() => {
        cargarMensajes();
    }, [usuarioActual, filtroTipo, fechaDesde, fechaHasta, busqueda]);

    return (
        <div className="container">

            {seleccionado === null ? (
                <>
                    <h2 className="mb-3">Historial</h2>

                    <FiltrosHistorialEncargado
                        filtroTipo={filtroTipo}
                        setFiltroTipo={setFiltroTipo}
                        fechaDesde={fechaDesde}
                        setFechaDesde={setFechaDesde}
                        fechaHasta={fechaHasta}
                        setFechaHasta={setFechaHasta}
                        busqueda={busqueda}
                        setBusqueda={setBusqueda}
                    />

                    <ListaHistorialEncargado
                        mensajes={mensajes}
                        setSeleccionado={setSeleccionado} // 🔥 CLAVE
                    />
                </>
            ) : (
                <DetalleHistorialEncargado
                    mensaje={seleccionado}
                    usuarioActual={usuarioActual}
                    onVolver={() => setSeleccionado(null)}
                    cargarMensajes={cargarMensajes}
                />
            )}

        </div>
    );
}

export default VistaHistorialEncargado;