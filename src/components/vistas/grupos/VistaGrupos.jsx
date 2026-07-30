import { useEffect, useState } from 'react';
import {
  obtenerGrupos,
  agregarGrupo,
  editarGrupo,
  eliminarGrupo,
  obtenerGruposPorDocente
} from '../../util/grupos';
import { obtenerUsuarios } from '../../util/usuarios';
import { obtenerEstudiantes } from '../../util/estudiantes';
import { obtenerActividadesPorGrupo } from '../../util/actividades';
import './VistaGrupos.css';

const FORM_VACIO = { nombre: '', grado: '', seccion: '', docentes: [] };

// ── Detalle de un grupo ───────────────────────────────────────────────────
function DetalleGrupo({ grupo, docentes, onVolver }) {
  const estudiantes = obtenerEstudiantes().filter(
    (e) => e.grado === grupo.grado && e.seccion === grupo.seccion
  );
  const actividades = obtenerActividadesPorGrupo(grupo.id);

  const docentesGrupo = grupo.docentes
    ?.map((c) => docentes.find((d) => d.cedula === c))
    .filter(Boolean);

  return (
    <div className="container-fluid animate-in p-0">
      <div className="mb-4">
        <button className="btn btn-outline-secondary btn-sm" onClick={onVolver}>
          <i className="bi bi-arrow-left me-1"></i> Volver a Grupos
        </button>
      </div>

      <div className="card shadow-sm border-0 mb-4 overflow-hidden">
        <div className="card-body p-4">
          <div className="d-flex align-items-center">
            <div className="rounded-circle bg-primary text-white avatar-md me-3 fs-4">
              {grupo.nombre.charAt(0)}
            </div>
            <div>
              <h2 className="h4 fw-bold mb-1">{grupo.nombre}</h2>
              <p className="text-muted mb-0">
                Grado <span className="fw-bold">{grupo.grado}°</span> · Sección <span className="fw-bold">{grupo.seccion}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Docentes */}
        <div className="col-lg-4">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-white py-3">
              <h5 className="card-title mb-0 fw-bold">
                <i className="bi bi-person-badge me-2 text-primary"></i>
                Docentes a cargo
              </h5>
            </div>
            <div className="list-group list-group-flush">
              {docentesGrupo?.length === 0 ? (
                <div className="p-4 text-center text-muted">Sin docentes asignados</div>
              ) : (
                docentesGrupo.map((d) => (
                  <div key={d.cedula} className="list-group-item p-3">
                    <div className="d-flex align-items-center">
                      <div className="rounded-circle bg-light text-primary avatar-sm me-3 fw-bold">
                        {d.nombre.charAt(0)}
                      </div>
                      <div>
                        <p className="mb-0 fw-semibold">{d.nombre}</p>
                        <small className="text-muted">{d.subrol || 'Docente'}</small>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Estudiantes */}
        <div className="col-lg-4">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
              <h5 className="card-title mb-0 fw-bold">
                <i className="bi bi-people me-2 text-success"></i>
                Estudiantes
              </h5>
              <span className="badge bg-success rounded-pill">{estudiantes.length}</span>
            </div>
            <div className="list-group list-group-flush" style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {estudiantes.length === 0 ? (
                <div className="p-4 text-center text-muted">Sin estudiantes registrados</div>
              ) : (
                estudiantes.map((e) => (
                  <div key={e.id} className="list-group-item p-3">
                    <div className="d-flex align-items-center">
                      <div className="rounded-circle bg-light-success text-success avatar-sm me-3 fw-bold">
                        {e.nombre.charAt(0)}
                      </div>
                      <div>
                        <p className="mb-0 fw-semibold">{e.nombre}</p>
                        <small className="text-muted d-block text-truncate" style={{ maxWidth: '180px' }}>
                          Enc: {e.encargados?.map((enc) => enc.nombre).join(', ') || '—'}
                        </small>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Actividades */}
        <div className="col-lg-4">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
              <h5 className="card-title mb-0 fw-bold">
                <i className="bi bi-clipboard-check me-2 text-info"></i>
                Actividades
              </h5>
              <span className="badge bg-info text-dark rounded-pill">{actividades.length}</span>
            </div>
            <div className="list-group list-group-flush" style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {actividades.length === 0 ? (
                <div className="p-4 text-center text-muted">Sin actividades registradas</div>
              ) : (
                actividades.map((a) => {
                  const calificadas = Object.keys(a.calificaciones || {}).length;
                  const total = estudiantes.length;
                  const esCompleta = calificadas === total && total > 0;
                  return (
                    <div key={a.id} className="list-group-item p-3">
                      <div className="d-flex justify-content-between align-items-start">
                        <div className="flex-grow-1 me-2">
                          <p className="mb-1 fw-semibold">{a.titulo}</p>
                          <div className="d-flex flex-wrap gap-2 small text-muted">
                            {a.materia && <span className="badge bg-light text-dark">{a.materia}</span>}
                            <span>{a.notaTotal} pts</span>
                          </div>
                        </div>
                        <span className={`badge ${esCompleta ? 'bg-success' : 'bg-warning text-dark'}`}>
                          {calificadas}/{total}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Vista principal ───────────────────────────────────────────────────────
function VistaGrupos({ usuarioActual }) {
  const esAdmin = usuarioActual.rol === 'administrativo';

  const [grupos, setGrupos]                   = useState([]);
  const [docentes, setDocentes]               = useState([]);
  const [form, setForm]                       = useState(FORM_VACIO);
  const [editandoId, setEditandoId]           = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [grupoSeleccionado, setGrupoSeleccionado] = useState(null);

  useEffect(() => {
    cargar();
    const todos = obtenerUsuarios();
    setDocentes(todos.filter((u) => u.roles?.includes('docente') || u.rol === 'docente'));
  }, []);

  const cargar = () => {
    const lista = esAdmin
      ? obtenerGrupos()
      : obtenerGruposPorDocente(usuarioActual.cedula);
    setGrupos(lista);
  };

  const manejarCambio = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const toggleDocente = (cedula) => {
    const ya = form.docentes.includes(cedula);
    setForm({
      ...form,
      docentes: ya ? form.docentes.filter((c) => c !== cedula) : [...form.docentes, cedula]
    });
  };

  const guardar = () => {
    if (!form.nombre.trim() || !form.grado.trim() || !form.seccion.trim()) return;
    let lista;
    if (editandoId) {
      lista = editarGrupo(editandoId, form);
      setEditandoId(null);
    } else {
      lista = agregarGrupo(form);
    }
    setGrupos(esAdmin ? lista : obtenerGruposPorDocente(usuarioActual.cedula));
    setForm(FORM_VACIO);
    setMostrarFormulario(false);
  };

  const iniciarEdicion = (grupo) => {
    setForm({
      nombre: grupo.nombre,
      grado: grupo.grado,
      seccion: grupo.seccion,
      docentes: grupo.docentes || []
    });
    setEditandoId(grupo.id);
    setMostrarFormulario(true);
  };

  const eliminar = (id) => {
    if (!window.confirm('¿Eliminar este grupo?')) return;
    setGrupos(eliminarGrupo(id));
  };

  const cancelar = () => {
    setForm(FORM_VACIO);
    setEditandoId(null);
    setMostrarFormulario(false);
  };

  // ── Detalle de grupo ─────────────────────────────────────────────────────
  if (grupoSeleccionado) {
    return (
      <DetalleGrupo
        grupo={grupoSeleccionado}
        docentes={docentes}
        onVolver={() => { setGrupoSeleccionado(null); cargar(); }}
      />
    );
  }

  return (
    <div className="container-fluid py-2 animate-in">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h2 className="h3 fw-bold text-dark mb-1">Grupos</h2>
          <p className="text-muted mb-0">
            {esAdmin ? 'Gestión de grupos institucionales' : 'Sus grupos asignados'}
          </p>
        </div>
        {esAdmin && (
          <button
            className="btn btn-primary px-4 py-2"
            onClick={() => { setMostrarFormulario(true); setEditandoId(null); setForm(FORM_VACIO); }}
          >
            <i className="bi bi-plus-lg me-2"></i> Nuevo grupo
          </button>
        )}
      </div>

      {esAdmin && mostrarFormulario && (
        <div className="card shadow-sm border-0 mb-4 animate-in">
          <div className="card-header bg-white py-3">
            <h5 className="mb-0 fw-bold">{editandoId ? 'Editar Grupo' : 'Registrar Nuevo Grupo'}</h5>
          </div>
          <div className="card-body">
            <div className="row g-3 mb-4">
              <div className="col-md-6">
                <label className="form-label fw-semibold small">Nombre del grupo</label>
                <input 
                  className="form-control" 
                  name="nombre" 
                  placeholder="Ej: 7mo A" 
                  value={form.nombre} 
                  onChange={manejarCambio} 
                />
              </div>
              <div className="col-md-3">
                <label className="form-label fw-semibold small">Grado</label>
                <input 
                  className="form-control" 
                  name="grado" 
                  placeholder="Ej: 7" 
                  value={form.grado} 
                  onChange={manejarCambio} 
                />
              </div>
              <div className="col-md-3">
                <label className="form-label fw-semibold small">Sección</label>
                <input 
                  className="form-control" 
                  name="seccion" 
                  placeholder="Ej: A" 
                  value={form.seccion} 
                  onChange={manejarCambio} 
                />
              </div>
            </div>

            {docentes.length > 0 && (
              <div className="mb-4">
                <label className="form-label fw-semibold small d-block mb-2">Docentes asignados</label>
                <div className="d-flex flex-wrap gap-2">
                  {docentes.map((d) => (
                    <div key={d.cedula} className="form-check form-check-inline">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={`docente-${d.cedula}`}
                        checked={form.docentes.includes(d.cedula)}
                        onChange={() => toggleDocente(d.cedula)}
                      />
                      <label className="form-check-label small" htmlFor={`docente-${d.cedula}`}>
                        {d.nombre}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="d-flex gap-2">
              <button className="btn btn-primary" onClick={guardar}>
                <i className="bi bi-save me-1"></i> {editandoId ? 'Actualizar' : 'Guardar'}
              </button>
              <button className="btn btn-outline-secondary" onClick={cancelar}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Grid de grupos (cards) */}
      {grupos.length === 0 ? (
        <div className="card shadow-sm border-0 py-5 text-center">
          <div className="card-body">
            <i className="bi bi-people fs-1 text-muted mb-3 d-block"></i>
            <p className="text-muted mb-0">No hay grupos registrados actualmente.</p>
          </div>
        </div>
      ) : (
        <div className="row g-4">
          {grupos.map((g) => {
            const estudiantesCount = obtenerEstudiantes().filter(
              (e) => e.grado === g.grado && e.seccion === g.seccion
            ).length;
            const actividadesCount = obtenerActividadesPorGrupo(g.id).length;
            const docentesNombres = g.docentes
              ?.map((c) => docentes.find((d) => d.cedula === c)?.nombre || c)
              .join(', ');

            return (
              <div key={g.id} className="col-md-6 col-lg-4">
                <div 
                  className="card h-100 shadow-sm border-0 card-hover"
                  onClick={() => setGrupoSeleccionado(g)}
                >
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div className="rounded-circle bg-primary text-white avatar-md fs-5">
                        {g.nombre.charAt(0)}
                      </div>
                      <span className="badge bg-light text-primary border border-primary-subtle">
                        {g.grado}° {g.seccion}
                      </span>
                    </div>
                    
                    <h5 className="card-title fw-bold mb-1">{g.nombre}</h5>
                    <p className="text-muted small mb-3 text-truncate" title={docentesNombres}>
                      <i className="bi bi-person-workspace me-1"></i>
                      {docentesNombres || 'Sin docente asignado'}
                    </p>
                    
                    <div className="row g-2 mt-auto">
                      <div className="col-6">
                        <div className="p-2 rounded bg-light text-center">
                          <small className="d-block text-muted">Estudiantes</small>
                          <span className="fw-bold">{estudiantesCount}</span>
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="p-2 rounded bg-light text-center">
                          <small className="d-block text-muted">Actividades</small>
                          <span className="fw-bold">{actividadesCount}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {esAdmin && (
                    <div className="card-footer bg-white border-0 pb-3 pt-0 d-flex gap-2" onClick={(e) => e.stopPropagation()}>
                      <button 
                        className="btn btn-sm btn-outline-primary flex-grow-1" 
                        onClick={() => iniciarEdicion(g)}
                      >
                        <i className="bi bi-pencil me-1"></i> Editar
                      </button>
                      <button 
                        className="btn btn-sm btn-outline-danger" 
                        onClick={() => eliminar(g.id)}
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default VistaGrupos;
