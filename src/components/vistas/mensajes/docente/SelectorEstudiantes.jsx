import { useEffect, useState } from "react";
import { obtenerEstudiantesPorDocente } from "../../../util/estudiantes.js";
import "./SelectorEstudiantes.css";

function SelectorEstudiantes({ seleccionados, setSeleccionados, usuarioActual }) {

  const [lista, setLista]       = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [grado, setGrado]       = useState("");
  const [seccion, setSeccion]   = useState("");
  const [expandido, setExpandido] = useState(false);

  useEffect(() => {
    // Solo estudiantes del alcance del docente (HU-01)
    const filtradosPorDocente = obtenerEstudiantesPorDocente(usuarioActual);

    // Bloquear estudiantes sin encargado — no se pueden usar como destinatarios
    const validos = filtradosPorDocente.filter(
      (e) => e.encargados && e.encargados.length > 0
    );

    setLista(validos);
  }, [usuarioActual]);

  // ── Toggle selección (HU-02 — sin duplicados) ─────────────────────────
  const toggleSeleccion = (est) => {
    const existe = seleccionados.find((e) => e.id === est.id);
    if (existe) {
      setSeleccionados(seleccionados.filter((e) => e.id !== est.id));
    } else {
      setSeleccionados([...seleccionados, est]);
    }
  };

  // ── Filtros combinados (HU-03) ─────────────────────────────────────────
  const filtrados = lista.filter((est) => {
    const coincideNombre  = est.nombre.toLowerCase().includes(busqueda.toLowerCase());
    const coincideGrado   = grado   ? est.grado   === grado   : true;
    const coincideSeccion = seccion ? est.seccion === seccion : true;
    return coincideNombre && coincideGrado && coincideSeccion;
  });

  const gradosDisponibles    = [...new Set(lista.map((e) => e.grado))].sort();
  const seccionesDisponibles = [...new Set(lista.map((e) => e.seccion))].sort();

  const hayFiltros = busqueda || grado || seccion;
  const mostrarLista = expandido || hayFiltros;

  const limpiarFiltros = () => {
    setBusqueda("");
    setGrado("");
    setSeccion("");
  };

  return (
    <section className="selector-estudiantes">

      <div className="selector-encabezado">
        <p className="selector-etiqueta">Mensajería</p>
        <h2 className="selector-titulo">Seleccionar destinatarios</h2>
        <p className="selector-desc">
          Solo se muestran estudiantes de sus grupos asignados con encargado registrado.
        </p>
      </div>

      {/* Botón expandir */}
      <div className="selector-toggle mb-3">
        <button
          className="btn-selector-toggle"
          onClick={() => setExpandido(!expandido)}
        >
          {mostrarLista ? "Ocultar lista ▲" : "Seleccionar estudiantes ▼"}
        </button>
        {seleccionados.length > 0 && (
          <span className="selector-seleccionados-badge">
            {seleccionados.length} seleccionado{seleccionados.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {mostrarLista && (
        <>
          {/* Filtros (HU-03) */}
          <div className="selector-filtros">
            <input
              className="form-control selector-busqueda"
              placeholder="Buscar por nombre..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />

            <select
              className="form-select selector-select"
              value={grado}
              onChange={(e) => setGrado(e.target.value)}
            >
              <option value="">Todos los grados</option>
              {gradosDisponibles.map((g) => (
                <option key={g} value={g}>{g}°</option>
              ))}
            </select>

            <select
              className="form-select selector-select"
              value={seccion}
              onChange={(e) => setSeccion(e.target.value)}
            >
              <option value="">Todas las secciones</option>
              {seccionesDisponibles.map((s) => (
                <option key={s} value={s}>Sección {s}</option>
              ))}
            </select>

            {hayFiltros && (
              <button className="btn-selector-limpiar" onClick={limpiarFiltros}>
                Limpiar
              </button>
            )}
          </div>

          {/* Resultados */}
          {filtrados.length === 0 ? (
            <p className="selector-vacio">
              No se encontraron estudiantes con esos criterios.
            </p>
          ) : (
            <div className="estudiante-lista">
              {filtrados.map((est) => {
                const seleccionado = seleccionados.some((e) => e.id === est.id);

                return (
                  <button
                    key={est.id}
                    className={`estudiante-item ${seleccionado ? "activo" : ""}`}
                    onClick={() => toggleSeleccion(est)}
                    type="button"
                  >
                    <div className="est-item-info">
                      <div className="est-item-avatar">
                        {est.nombre.charAt(0)}
                      </div>
                      <div>
                        <p className="estudiante-nombre">{est.nombre}</p>
                        <p className="estudiante-info">
                          {est.grado}° {est.seccion} · Encargados:{" "}
                          {est.encargados.map((e) => e.nombre).join(", ")}
                        </p>
                      </div>
                    </div>

                    {seleccionado && (
                      <span className="selector-check">✓ Seleccionado</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </>
      )}
    </section>
  );
}

export default SelectorEstudiantes;
