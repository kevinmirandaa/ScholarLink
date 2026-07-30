import "./TablaUsuario.css";

function TablaUsuarios({ usuarios, onEditar, onEliminar }) {
    return (
        <table className="table table-hover tabla-usuarios">
            <thead>
            <tr>
                <th>Cédula</th>
                <th>Nombre</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Creado por</th>
                <th>Fecha</th>
                <th>Acciones</th>
            </tr>
            </thead>

            <tbody>
            {usuarios.map((u) => (
                <tr key={u.cedula}>
                    <td>{u.cedula}</td>

                    <td>{u.nombre}</td>

                    {/* ROL(ES) + SUBROL */}
                    <td>
                        <div className="rol-container">
                            {/* Mostrar todos los roles si hay más de uno */}
                            {(u.roles && u.roles.length > 1)
                              ? u.roles.map((r) => (
                                  <span key={r} className="rol-principal rol-badge">{r}</span>
                                ))
                              : <span className="rol-principal">{u.rol}</span>
                            }

                            {u.subrol && (
                                <span className="rol-sub">
                                    {u.subrol}
                                </span>
                            )}
                        </div>
                    </td>

                    <td
                        className={`estado-acceso ${
                            u.primerAcceso ? "pendiente" : "activo"
                        }`}
                    >
                        {u.primerAcceso
                            ? "Debe cambiar contraseña"
                            : "Acceso habilitado"}
                    </td>

                    <td>{u.creadoPor}</td>

                    <td>{new Date(u.fechaCreacion).toLocaleString()}</td>

                    <td>
                        <button
                            className="btn boton-editar btn-sm me-2"
                            onClick={() => onEditar(u)}
                        >
                            Editar
                        </button>

                        <button
                            className="btn boton-eliminar btn-sm"
                            onClick={() => onEliminar(u.cedula)}
                        >
                            Eliminar
                        </button>
                    </td>
                </tr>
            ))}
            </tbody>
        </table>
    );
}

export default TablaUsuarios;