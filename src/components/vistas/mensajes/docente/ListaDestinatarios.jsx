import "./ListaDestinatarios.css";

function ListaDestinatarios({ estudiantes }) {

    if (estudiantes.length === 0) return null;

    return (
        <section className="destinatarios">
            <h3 className="destinatarios-titulo">Destinatarios</h3>

            <div className="destinatarios-lista">
                {estudiantes.map(est => (
                    <span key={est.id} className="destinatario-chip">
                        {est.nombre} → {
                        est.encargados.map(enc => enc.nombre).join(", ")
                    }
                    </span>
                ))}
            </div>
        </section>
    );
}

export default ListaDestinatarios;