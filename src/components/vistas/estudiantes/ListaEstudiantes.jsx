function ListaEstudiantes({ estudiantes }) {
    return (
        <div>
            <h4>Lista de estudiantes</h4>

            {estudiantes.map(est => (
                <div key={est.id} className="border p-2 mb-2 rounded">
                    <strong>{est.nombre}</strong> — {est.grado}°{est.seccion}
                </div>
            ))}
        </div>
    );
}

export default ListaEstudiantes;