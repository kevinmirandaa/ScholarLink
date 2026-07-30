import { useState } from 'react';
import './FormularioUsuario.css';

const ROLES_DISPONIBLES = [
  { value: 'administrativo', label: 'Administrativo' },
  { value: 'docente',        label: 'Docente' },
  { value: 'encargado',      label: 'Encargado Legal' },
  { value: 'estudiante',     label: 'Estudiante' }
];

function FormularioUsuario({
  form,
  onChange,
  onRolesChange,
  onEncargadosChange,
  onSubmit,
  onCancel,
  editando,
  encargadosDisponibles = []
}) {

  const [busquedaEnc, setBusquedaEnc] = useState('');

  const rolesActivos = form.roles || (form.rol ? [form.rol] : ['docente']);

  const toggleRol = (valor) => {
    const ya = rolesActivos.includes(valor);
    const nuevos = ya ? rolesActivos.filter((r) => r !== valor) : [...rolesActivos, valor];
    if (nuevos.length === 0) return;
    onRolesChange(nuevos);
  };

  const manejarAlcance = (e) => {
    const tipo = e.target.value;
    onChange({ target: { name: 'alcance', value: { tipo, grados: [], secciones: [], grupos: [] } } });
  };

  const toggleEncargado = (cedula) => {
    const ya = (form.encargados || []).includes(cedula);
    const nuevos = ya
      ? (form.encargados || []).filter((c) => c !== cedula)
      : [...(form.encargados || []), cedula];
    onEncargadosChange(nuevos);
  };

  const esDocente   = rolesActivos.includes('docente');
  const esEstudiante= rolesActivos.includes('estudiante');

  const encargadosFiltrados = encargadosDisponibles.filter((e) => {
    const q = busquedaEnc.toLowerCase();
    return (
      e.nombre.toLowerCase().includes(q) ||
      e.cedula.toLowerCase().includes(q)
    );
  });

  return (
    <div className="form-usuario-wrapper">

      <div className="form-usuario-grid">

        {/* Cédula */}
        <div className="form-campo">
          <label className="form-label">Cédula</label>
          <input
            className="form-control"
            name="cedula"
            placeholder="Cédula del usuario"
            value={form.cedula}
            onChange={onChange}
            disabled={!!editando}
          />
        </div>

        {/* Nombre */}
        <div className="form-campo form-campo-wide">
          <label className="form-label">Nombre completo</label>
          <input
            className="form-control"
            name="nombre"
            placeholder="Nombre completo"
            value={form.nombre}
            onChange={onChange}
          />
        </div>

        {/* Subrol */}
        <div className="form-campo form-campo-wide">
          <label className="form-label">Subrol / Especialidad</label>
          <input
            className="form-control"
            name="subrol"
            placeholder="Ej: Profesor de Matemáticas"
            value={form.subrol || ''}
            onChange={onChange}
          />
        </div>

        {/* Roles */}
        <div className="form-campo form-campo-full">
          <label className="form-label">Roles asignados</label>
          <div className="roles-checkboxes">
            {ROLES_DISPONIBLES.map((r) => (
              <label key={r.value} className={`rol-check-label ${rolesActivos.includes(r.value) ? 'activo' : ''}`}>
                <input
                  type="checkbox"
                  checked={rolesActivos.includes(r.value)}
                  onChange={() => toggleRol(r.value)}
                />
                {r.label}
              </label>
            ))}
          </div>
        </div>

        {/* Alcance (solo docente) */}
        {esDocente && (
          <>
            <div className="form-campo">
              <label className="form-label">Alcance del docente</label>
              <select className="form-select" onChange={manejarAlcance} value={form.alcance?.tipo || 'global'}>
                <option value="global">Acceso total</option>
                <option value="grado">Por grado</option>
                <option value="seccion">Por sección</option>
                <option value="grupo">Por grupo</option>
              </select>
            </div>
            {form.alcance?.tipo === 'grado' && (
              <div className="form-campo">
                <label className="form-label">Grados (separados por coma)</label>
                <input className="form-control" placeholder="Ej: 7,8"
                  onChange={(e) => onChange({ target: { name: 'alcance', value: { ...form.alcance, grados: e.target.value.split(',') } } })} />
              </div>
            )}
            {form.alcance?.tipo === 'seccion' && (
              <div className="form-campo">
                <label className="form-label">Secciones (separadas por coma)</label>
                <input className="form-control" placeholder="Ej: A,B"
                  onChange={(e) => onChange({ target: { name: 'alcance', value: { ...form.alcance, secciones: e.target.value.split(',') } } })} />
              </div>
            )}
            {form.alcance?.tipo === 'grupo' && (
              <div className="form-campo">
                <label className="form-label">Grupos (separados por coma)</label>
                <input className="form-control" placeholder="Ej: 7-A,8-B"
                  onChange={(e) => onChange({ target: { name: 'alcance', value: { ...form.alcance, grupos: e.target.value.split(',') } } })} />
              </div>
            )}
          </>
        )}

        {/* Estudiante: grado, sección, encargados */}
        {esEstudiante && (
          <>
            <div className="form-campo">
              <label className="form-label">Grado</label>
              <input className="form-control" name="grado" placeholder="Ej: 7" value={form.grado || ''} onChange={onChange} />
            </div>
            <div className="form-campo">
              <label className="form-label">Sección</label>
              <input className="form-control" name="seccion" placeholder="Ej: A" value={form.seccion || ''} onChange={onChange} />
            </div>

            {/* Selector de encargados */}
            <div className="form-campo form-campo-full">
              <label className="form-label">Encargados legales</label>
              <input
                className="form-control mb-2"
                placeholder="Buscar encargado por nombre o cédula..."
                value={busquedaEnc}
                onChange={(e) => setBusquedaEnc(e.target.value)}
              />
              <div className="encargados-picker">
                {encargadosFiltrados.length === 0 ? (
                  <p className="picker-vacio">No hay encargados disponibles</p>
                ) : (
                  encargadosFiltrados.map((enc) => {
                    const seleccionado = (form.encargados || []).includes(enc.cedula);
                    return (
                      <div
                        key={enc.cedula}
                        className={`picker-item ${seleccionado ? 'seleccionado' : ''}`}
                        onClick={() => toggleEncargado(enc.cedula)}
                      >
                        <div className="picker-avatar">{enc.nombre.charAt(0)}</div>
                        <div className="picker-info">
                          <p className="picker-nombre">{enc.nombre}</p>
                          <p className="picker-cedula">Cédula: {enc.cedula}</p>
                        </div>
                        {seleccionado && <span className="picker-check">✓</span>}
                      </div>
                    );
                  })
                )}
              </div>
              {(form.encargados || []).length > 0 && (
                <p className="picker-seleccionados-texto">
                  {(form.encargados || []).length} encargado(s) seleccionado(s)
                </p>
              )}
            </div>
          </>
        )}

      </div>

      <div className="form-usuario-acciones">
        <button className="btn-guardar" onClick={onSubmit}>
          {editando ? 'Actualizar' : 'Guardar'}
        </button>
        <button className="btn-cancelar" onClick={onCancel}>
          Cancelar
        </button>
      </div>

    </div>
  );
}

export default FormularioUsuario;
