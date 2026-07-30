import { useEffect, useState } from 'react';
import { obtenerGrupos, obtenerGruposPorDocente } from '../../util/grupos';
import { obtenerEstudiantes, obtenerEstudiantesPorEncargado } from '../../util/estudiantes';
import {
  obtenerActividades,
  agregarActividad,
  editarActividad,
  eliminarActividad,
  calificarEstudiante,
  obtenerActividadesPorGrupo
} from '../../util/actividades';
import { crearNotificacion } from '../../util/notificaciones';
import './VistaActividades.css';

const MODALIDADES = [
  { value: 'individual', label: 'Individual' },
  { value: 'parejas',    label: 'En parejas' },
  { value: 'grupal',     label: 'Grupal' }
];

const FORM_VACIO = {
  titulo: '', descripcion: '', materia: '', grupoId: '',
  fechaLimite: '', modalidad: 'individual', notaTotal: 100
};

// ── Calificador por actividad ──────────────────────────────────────────────
function CalificadorActividad({ actividad, grupo, onVolver }) {
  const estudiantes = obtenerEstudiantes().filter(
    (e) => e.grado === grupo.grado && e.seccion === grupo.seccion
  );
  const [notas, setNotas] = useState(() => {
    const init = {};
    estudiantes.forEach((e) => {
      init[e.id] = actividad.calificaciones?.[e.id]?.nota ?? '';
    });
    return init;
  });
  const [guardado, setGuardado] = useState({});

  const calificar = (estudianteId, nota) => {
    calificarEstudiante(actividad.id, estudianteId, nota);
    setGuardado((prev) => ({ ...prev, [estudianteId]: true }));

    // Notificar al encargado
    const est = estudiantes.find((e) => e.id === estudianteId);
    est?.encargados?.forEach((enc) => {
      crearNotificacion({
        id: `noti_${Date.now()}_${enc.cedula}`,
        usuarioCedula: enc.cedula,
        tipo: 'evaluacion',
        referenciaId: actividad.id,
        titulo: `Calificación: ${actividad.titulo}`,
        resumen: `${est.nombre} obtuvo ${nota}/${actividad.notaTotal} pts`,
        leido: false,
        fecha: new Date().toISOString(),
        metadata: {
          estudianteCedula: est.cedula,
          grupoClave: `${grupo.grado}-${grupo.seccion}`
        }
      });
    });

    setTimeout(() => setGuardado((prev) => ({ ...prev, [estudianteId]: false })), 2000);
  };

  return (
    <div className="container-fluid p-0">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <button className="btn btn-outline-secondary btn-sm" onClick={onVolver}>
          <i className="bi bi-arrow-left"></i> Volver
        </button>
      </div>

      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="row align-items-center">
            <div className="col-md-8">
              <h2 className="h4 mb-1">{actividad.titulo}</h2>
              <p className="text-muted mb-0">
                {actividad.materia && <span className="badge bg-light text-dark me-2">{actividad.materia}</span>}
                <span className="me-2">Nota máxima: <strong>{actividad.notaTotal} pts</strong></span>
                <span className="me-2">|</span>
                <span className="me-2 text-capitalize">{actividad.modalidad}</span>
                {actividad.fechaLimite && (
                  <span>| Entrega: <strong>{actividad.fechaLimite}</strong></span>
                )}
              </p>
            </div>
            <div className="col-md-4 text-md-end mt-3 mt-md-0">
              <span className="badge bg-primary p-2">
                {estudiantes.filter(e => actividad.calificaciones?.[e.id]).length} / {estudiantes.length} Calificados
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-header bg-white py-3">
          <h5 className="card-title mb-0">Listado de Estudiantes</h5>
        </div>
        <div className="list-group list-group-flush">
          {estudiantes.length === 0 && (
            <div className="list-group-item text-center py-4 text-muted">
              No hay estudiantes en este grupo.
            </div>
          )}
          {estudiantes.map((est) => {
            const calif = actividad.calificaciones?.[est.id];
            const estaCalificado = !!calif;
            return (
              <div key={est.id} className={`list-group-item p-3 ${estaCalificado ? 'bg-light-success' : ''}`}>
                <div className="row align-items-center">
                  <div className="col-auto">
                    <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                      {est.nombre.charAt(0)}
                    </div>
                  </div>
                  <div className="col">
                    <h6 className="mb-0">{est.nombre}</h6>
                    <small className="text-muted">Grado {est.grado}° · Sección {est.seccion}</small>
                  </div>
                  <div className="col-md-5 mt-3 mt-md-0">
                    <div className="input-group">
                      <input
                        type="number"
                        className="form-control"
                        min="0"
                        max={actividad.notaTotal}
                        placeholder="Nota"
                        value={notas[est.id]}
                        onChange={(e) => setNotas((prev) => ({ ...prev, [est.id]: e.target.value }))}
                      />
                      <span className="input-group-text">/ {actividad.notaTotal}</span>
                      <button
                        className={`btn ${estaCalificado ? 'btn-outline-primary' : 'btn-primary'}`}
                        onClick={() => calificar(est.id, notas[est.id])}
                        disabled={notas[est.id] === '' || notas[est.id] === undefined}
                      >
                        {guardado[est.id] ? '✓' : estaCalificado ? 'Actualizar' : 'Calificar'}
                      </button>
                    </div>
                  </div>
                  <div className="col-auto text-end" style={{ minWidth: '100px' }}>
                    <span className={`badge ${estaCalificado ? 'bg-success' : 'bg-warning text-dark'}`}>
                      {estaCalificado ? `${calif.nota} pts` : 'Pendiente'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Vista de actividades de un grupo ──────────────────────────────────────
function GrupoActividades({ grupo, actividades, puedeGestionar, onCrear, onEditar, onEliminar, onCalificar, actividadDestacadaId }) {
  const estudiantes = obtenerEstudiantes().filter(
    (e) => e.grado === grupo.grado && e.seccion === grupo.seccion
  );

  return (
    <div className="card shadow-sm border-0 mb-4">
      <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
        <h5 className="mb-0 fw-bold text-primary">
          <i className="bi bi-collection me-2"></i>
          {grupo.nombre}
        </h5>
        <span className="badge bg-secondary rounded-pill">
          {actividades.length} {actividades.length === 1 ? 'actividad' : 'actividades'}
        </span>
      </div>

      <div className="card-body p-0">
        {actividades.length === 0 ? (
          <div className="p-4 text-center text-muted italic">
            <i className="bi bi-info-circle me-2"></i>
            Sin actividades para este grupo.
          </div>
        ) : (
          <div className="list-group list-group-flush">
            {actividades.map((a) => {
              const calificadas = Object.keys(a.calificaciones || {}).length;
              const total = estudiantes.length;
              const porcentaje = total > 0 ? Math.round((calificadas / total) * 100) : 0;
              const esDestacada = actividadDestacadaId === a.id;

              return (
                <div 
                  key={a.id} 
                  className={`list-group-item p-3 p-md-4 ${esDestacada ? 'border-primary border-start border-4 bg-light-primary' : ''}`}
                >
                  <div className="row align-items-start">
                    <div className="col-lg-8">
                      <div className="d-flex align-items-center mb-2 gap-2">
                        <span className={`badge rounded-pill text-capitalize ${
                          a.modalidad === 'grupal' ? 'bg-info' : 
                          a.modalidad === 'parejas' ? 'bg-success' : 'bg-primary'
                        }`}>
                          {a.modalidad}
                        </span>
                        {a.materia && <span className="text-muted fw-semibold small uppercase">{a.materia}</span>}
                      </div>
                      
                      <h6 className="mb-1 fw-bold fs-5">{a.titulo}</h6>
                      
                      {a.descripcion && (
                        <p className="text-muted small mb-3 text-truncate-2">
                          {a.descripcion}
                        </p>
                      )}
                      
                      <div className="d-flex flex-wrap gap-3 mb-3 mb-lg-0 small text-muted">
                        {a.fechaLimite && (
                          <span><i className="bi bi-calendar-event me-1"></i> {a.fechaLimite}</span>
                        )}
                        <span><i className="bi bi-check2-square me-1"></i> {a.notaTotal} pts</span>
                      </div>
                    </div>

                    <div className="col-lg-4">
                      <div className="mb-3">
                        <div className="d-flex justify-content-between mb-1 small">
                          <span className="text-muted">Progreso: {calificadas}/{total}</span>
                          <span className="fw-bold">{porcentaje}%</span>
                        </div>
                        <div className="progress" style={{ height: '8px' }}>
                          <div 
                            className={`progress-bar ${porcentaje === 100 ? 'bg-success' : 'bg-primary'}`}
                            role="progressbar" 
                            style={{ width: `${porcentaje}%` }} 
                            aria-valuenow={porcentaje} 
                            aria-valuemin="0" 
                            aria-valuemax="100"
                          ></div>
                        </div>
                      </div>

                      {puedeGestionar && (
                        <div className="d-flex gap-2">
                          <button 
                            className="btn btn-sm btn-primary flex-grow-1" 
                            onClick={() => onCalificar(a, grupo)}
                          >
                            <i className="bi bi-pencil-square me-1"></i> Calificar
                          </button>
                          <button 
                            className="btn btn-sm btn-outline-secondary" 
                            title="Editar"
                            onClick={() => onEditar(a)}
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button 
                            className="btn btn-sm btn-outline-danger" 
                            title="Eliminar"
                            onClick={() => onEliminar(a.id)}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {puedeGestionar && (
        <div className="card-footer bg-light border-0 py-3">
          <button className="btn btn-sm btn-outline-primary" onClick={() => onCrear(grupo.id)}>
            <i className="bi bi-plus-lg me-1"></i> Agregar actividad a {grupo.nombre}
          </button>
        </div>
      )}
    </div>
  );
}

// ── Vista principal ────────────────────────────────────────────────────────
function VistaActividades({ usuarioActual, actividadInicial, setActividadInicial }) {
  const rol = usuarioActual.rol;
  const esAdmin    = rol === 'administrativo';
  const esDocente  = rol === 'docente';
  const puedeGestionar = esAdmin || esDocente;

  const [grupos, setGrupos]           = useState([]);
  const [actividades, setActividades] = useState([]);
  const [form, setForm]               = useState(FORM_VACIO);
  const [editandoId, setEditandoId]   = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [calificando, setCalificando] = useState(null); // { actividad, grupo }
  const [actividadDestacadaId, setActividadDestacadaId] = useState(null);

  useEffect(() => {
    const g = esAdmin ? obtenerGrupos() : 
             esDocente ? obtenerGruposPorDocente(usuarioActual.cedula) :
             obtenerGrupos(); // Para estudiantes y encargados necesitamos todos los grupos para filtrar
    setGrupos(g);
    setActividades(obtenerActividades());
  }, []);

  useEffect(() => {
    if (!actividadInicial) return;
    setActividadDestacadaId(actividadInicial.id);
    if (setActividadInicial) setActividadInicial(null);
  }, [actividadInicial, setActividadInicial]);

  const manejarCambio = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const guardar = () => {
    if (!form.titulo.trim() || !form.grupoId) return;
    let todas;
    if (editandoId) {
      todas = editarActividad(editandoId, form);
      setEditandoId(null);
    } else {
      todas = agregarActividad(form, usuarioActual);

      // Notificar encargados del grupo
      const grupo = grupos.find((g) => g.id === form.grupoId);
      const estudiantes = grupo
        ? obtenerEstudiantes().filter((e) => e.grado === grupo.grado && e.seccion === grupo.seccion)
        : [];
      estudiantes.forEach((est) => {
        est.encargados?.forEach((enc) => {
          crearNotificacion({
            id: `noti_${Date.now()}_${enc.cedula}`,
            usuarioCedula: enc.cedula,
            tipo: 'actividad',
            referenciaId: todas[todas.length - 1].id,
            titulo: `Nueva actividad: ${form.titulo}`,
            resumen: form.descripcion?.slice(0, 60) || '',
            leido: false,
            fecha: new Date().toISOString(),
            metadata: {
              estudianteCedula: est.cedula,
              grupoClave: `${grupo.grado}-${grupo.seccion}`
            }
          });
        });
        // Notificar al estudiante si tiene usuario
        crearNotificacion({
          id: `noti_${Date.now()}_${est.cedula}`,
          usuarioCedula: est.cedula,
          tipo: 'actividad',
          referenciaId: todas[todas.length - 1].id,
          titulo: `Nueva actividad: ${form.titulo}`,
          resumen: form.descripcion?.slice(0, 60) || '',
          leido: false,
          fecha: new Date().toISOString(),
          metadata: {
            estudianteCedula: est.cedula,
            grupoClave: `${grupo.grado}-${grupo.seccion}`
          }
        });
      });
    }
    setActividades(todas);
    setForm(FORM_VACIO);
    setMostrarFormulario(false);
  };

  const iniciarEdicion = (act) => {
    setForm({
      titulo: act.titulo,
      descripcion: act.descripcion,
      materia: act.materia || '',
      grupoId: act.grupoId,
      fechaLimite: act.fechaLimite,
      modalidad: act.modalidad || 'individual',
      notaTotal: act.notaTotal || 100
    });
    setEditandoId(act.id);
    setMostrarFormulario(true);
  };

  const abrirCrear = (grupoId) => {
    setForm({ ...FORM_VACIO, grupoId });
    setEditandoId(null);
    setMostrarFormulario(true);
  };

  const eliminar = (id) => {
    if (!window.confirm('¿Eliminar esta actividad?')) return;
    setActividades(eliminarActividad(id));
  };

  const cancelar = () => {
    setForm(FORM_VACIO);
    setEditandoId(null);
    setMostrarFormulario(false);
  };

  // ── Calificador ──────────────────────────────────────────────────────────
  if (calificando) {
    return (
      <CalificadorActividad
        actividad={actividades.find((a) => a.id === calificando.actividadId) || calificando.actividad}
        grupo={calificando.grupo}
        onVolver={() => { setCalificando(null); setActividades(obtenerActividades()); }}
      />
    );
  }

  // ── Vista de encargado/estudiante (lista plana) ──────────────────────────
  if (rol === 'encargado' || rol === 'estudiante') {
    // Determinamos los grupos del usuario
    let gruposUsuario = [];
    if (rol === 'estudiante') {
      const { grado, seccion } = usuarioActual;
      gruposUsuario = grupos.filter((g) => g.grado === grado && g.seccion === seccion);
      // Si no hay grupos que coincidan exactamente, permitimos ver por ID de grupo si está presente
      const misEst = obtenerEstudiantes().find(e => e.cedula === usuarioActual.cedula);
      if (misEst?.grupoId) {
        const gById = grupos.find(g => g.id === misEst.grupoId);
        if (gById && !gruposUsuario.includes(gById)) gruposUsuario.push(gById);
      }
    } else {
      // Encargado: grupos donde están sus estudiantes
      const misEst = obtenerEstudiantesPorEncargado(usuarioActual.cedula);
      gruposUsuario = grupos.filter((g) =>
        misEst.some((e) => (e.grado === g.grado && e.seccion === g.seccion) || e.grupoId === g.id)
      );
      if (gruposUsuario.length === 0) gruposUsuario = grupos;
    }

    const actVisible = actividades.filter((a) =>
      gruposUsuario.some((g) => g.id === a.grupoId)
    ).sort((a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion));

    return (
      <div className="container-fluid py-2">
        <div className="mb-4">
          <h2 className="h3 fw-bold text-dark">Actividades</h2>
          <p className="text-muted">Consulta las actividades académicas programadas.</p>
        </div>

        {actVisible.length === 0 ? (
          <div className="card shadow-sm border-0 py-5 text-center">
            <div className="card-body">
              <i className="bi bi-journal-x fs-1 text-muted mb-3 d-block"></i>
              <p className="text-muted mb-0">No hay actividades disponibles actualmente.</p>
            </div>
          </div>
        ) : (
          <div className="row g-4">
            {actVisible.map((a) => {
              const grupo = grupos.find((g) => g.id === a.grupoId);
              const calEstudiante = rol === 'estudiante'
                ? obtenerEstudiantes().find((e) => e.cedula === usuarioActual.cedula)
                : null;
              const miCalif = calEstudiante ? a.calificaciones?.[calEstudiante.id] : null;
              const esDestacada = actividadDestacadaId === a.id;

              return (
                <div key={a.id} className="col-md-6 col-xl-4">
                  <div className={`card h-100 shadow-sm border-0 ${esDestacada ? 'ring-2 ring-primary border-primary' : ''}`}>
                    <div className="card-header bg-white border-0 pt-3 pb-0 d-flex justify-content-between align-items-center">
                      <span className={`badge rounded-pill ${
                        a.modalidad === 'grupal' ? 'bg-info' : 
                        a.modalidad === 'parejas' ? 'bg-success' : 'bg-primary'
                      }`}>
                        {a.modalidad}
                      </span>
                      <small className="text-muted fw-bold">{grupo?.nombre || '—'}</small>
                    </div>
                    
                    <div className="card-body">
                      <h5 className="card-title fw-bold mb-1">{a.titulo}</h5>
                      {a.materia && <p className="text-primary small fw-semibold mb-2">{a.materia}</p>}
                      {a.descripcion && <p className="card-text text-muted small mb-3">{a.descripcion}</p>}
                      
                      <div className="d-flex align-items-center small text-muted mt-auto">
                        <i className="bi bi-calendar-event me-2"></i>
                        <span>Límite: {a.fechaLimite || 'Sin fecha'}</span>
                      </div>
                    </div>

                    <div className="card-footer bg-light border-0 d-flex justify-content-between align-items-center py-3">
                      <span className="small text-dark fw-semibold">Máximo: {a.notaTotal} pts</span>
                      {miCalif ? (
                        <span className="badge bg-success">
                          <i className="bi bi-check-circle me-1"></i> Nota: {miCalif.nota} pts
                        </span>
                      ) : rol === 'estudiante' ? (
                        <span className="badge bg-warning text-dark">Pendiente</span>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // ── Vista de admin/docente (por grupo) ───────────────────────────────────
  return (
    <div className="container-fluid py-2">
      <div className="row align-items-center mb-4 g-3">
        <div className="col-md">
          <h2 className="h3 fw-bold text-dark mb-1">Actividades</h2>
          <p className="text-muted mb-0">Gestión de actividades académicas por grupo</p>
        </div>
        <div className="col-md-auto">
          <button 
            className="btn btn-primary d-flex align-items-center gap-2" 
            onClick={() => { setMostrarFormulario(true); setEditandoId(null); setForm(FORM_VACIO); }}
          >
            <i className="bi bi-plus-lg"></i> Nueva actividad
          </button>
        </div>
      </div>

      {mostrarFormulario && (
        <div className="card shadow-sm border-0 mb-5 animate-in">
          <div className="card-header bg-white py-3">
            <h5 className="mb-0 fw-bold">{editandoId ? 'Editar Actividad' : 'Nueva Actividad'}</h5>
          </div>
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-8">
                <label className="form-label fw-semibold">Título *</label>
                <input 
                  className="form-control" 
                  name="titulo" 
                  placeholder="Nombre de la actividad" 
                  value={form.titulo} 
                  onChange={manejarCambio} 
                />
              </div>

              <div className="col-md-4">
                <label className="form-label fw-semibold">Materia</label>
                <input 
                  className="form-control" 
                  name="materia" 
                  placeholder="Ej: Matemáticas" 
                  value={form.materia} 
                  onChange={manejarCambio} 
                />
              </div>

              <div className="col-md-4">
                <label className="form-label fw-semibold">Grupo *</label>
                <select className="form-select" name="grupoId" value={form.grupoId} onChange={manejarCambio}>
                  <option value="">Seleccione un grupo</option>
                  {grupos.map((g) => <option key={g.id} value={g.id}>{g.nombre}</option>)}
                </select>
              </div>

              <div className="col-md-4">
                <label className="form-label fw-semibold">Fecha límite</label>
                <input type="date" className="form-control" name="fechaLimite" value={form.fechaLimite} onChange={manejarCambio} />
              </div>

              <div className="col-md-2">
                <label className="form-label fw-semibold">Modalidad</label>
                <select className="form-select" name="modalidad" value={form.modalidad} onChange={manejarCambio}>
                  {MODALIDADES.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
              </div>

              <div className="col-md-2">
                <label className="form-label fw-semibold">Nota total</label>
                <input type="number" className="form-control" name="notaTotal" min="1" max="100" value={form.notaTotal} onChange={manejarCambio} />
              </div>

              <div className="col-12">
                <label className="form-label fw-semibold">Descripción</label>
                <textarea className="form-control" name="descripcion" rows={3} value={form.descripcion} onChange={manejarCambio} />
              </div>
            </div>
          </div>
          <div className="card-footer bg-light border-0 py-3 d-flex justify-content-end gap-2">
            <button className="btn btn-secondary" onClick={cancelar}>Cancelar</button>
            <button 
              className="btn btn-primary px-4" 
              onClick={guardar}
              disabled={!form.titulo.trim() || !form.grupoId}
            >
              {editandoId ? 'Actualizar' : 'Guardar Actividad'}
            </button>
          </div>
        </div>
      )}

      {/* Actividades agrupadas por grupo */}
      <div className="row">
        {grupos.map((grupo) => {
          const actGrupo = obtenerActividadesPorGrupo(grupo.id);
          return (
            <div key={grupo.id} className="col-12 mb-4">
              <GrupoActividades
                grupo={grupo}
                actividades={actGrupo}
                puedeGestionar={puedeGestionar}
                onCrear={abrirCrear}
                onEditar={iniciarEdicion}
                onEliminar={eliminar}
                onCalificar={(actividad, gr) => setCalificando({ actividadId: actividad.id, actividad, grupo: gr })}
                actividadDestacadaId={actividadDestacadaId}
              />
            </div>
          );
        })}
      </div>

      {grupos.length === 0 && (
        <div className="text-center py-5">
          <p className="text-muted">No hay grupos disponibles para mostrar actividades.</p>
        </div>
      )}
    </div>
  );
}

export default VistaActividades;
