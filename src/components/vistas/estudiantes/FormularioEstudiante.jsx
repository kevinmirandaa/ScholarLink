function FormularioEstudiante({
  form,
  onChange,
  onToggleEncargado,
  encargados,
  onSubmit,
  onCancel,
  editando,
  error
}) {
  return (
    <div className="est-form">

      <div className="est-form-fila">

        <div className="est-form-campo">
          <label>Nombre completo</label>
          <input
            className="form-control"
            name="nombre"
            placeholder="Nombre del estudiante"
            value={form.nombre}
            onChange={onChange}
          />
        </div>

        <div className="est-form-campo" style={{ maxWidth: 160 }}>
          <label>Cédula / ID</label>
          <input
            className="form-control"
            name="cedula"
            placeholder="Ej: EST001"
            value={form.cedula}
            onChange={onChange}
          />
        </div>

        <div className="est-form-campo" style={{ maxWidth: 100 }}>
          <label>Grado</label>
          <input
            className="form-control"
            name="grado"
            placeholder="Ej: 7"
            value={form.grado}
            onChange={onChange}
          />
        </div>

        <div className="est-form-campo" style={{ maxWidth: 100 }}>
          <label>Sección</label>
          <input
            className="form-control"
            name="seccion"
            placeholder="Ej: A"
            value={form.seccion}
            onChange={onChange}
          />
        </div>

      </div>

      {/* Encargados */}
      <div className="est-form-encargados">
        <label>Encargados legales <span className="est-form-requerido">*</span></label>
        {encargados.length === 0 ? (
          <p className="est-form-aviso">
            No hay usuarios con rol Encargado Legal. Créelos primero en Usuarios y Roles.
          </p>
        ) : (
          <div className="est-form-enc-lista">
            {encargados.map((enc) => (
              <label key={enc.cedula} className="est-enc-check">
                <input
                  type="checkbox"
                  checked={form.encargados.includes(enc.cedula)}
                  onChange={() => onToggleEncargado(enc.cedula)}
                />
                {enc.nombre}
              </label>
            ))}
          </div>
        )}
      </div>

      {error && (
        <p className="est-form-error" role="alert">{error}</p>
      )}

      <div className="est-form-acciones">
        <button className="btn-est-guardar" onClick={onSubmit}>
          {editando ? "Actualizar" : "Guardar"}
        </button>
        <button className="btn-est-cancelar" onClick={onCancel}>
          Cancelar
        </button>
      </div>

    </div>
  );
}

export default FormularioEstudiante;
