import { useEffect, useMemo, useState } from 'react';
import {
  agregarComunicado,
  eliminarComunicado,
  marcarComunicadoComoLeido,
  obtenerComunicadosPorUsuario,
  obtenerDestinatariosComunicado,
  obtenerEstadoComunicadoParaUsuario,
  obtenerEstadoGlobalComunicado,
  obtenerHistorialComunicadosEnviados,
  obtenerSeccionesDisponibles
} from '../../util/comunicados';
import { obtenerUsuarios } from '../../util/usuarios';
import {
  crearNotificacion,
  marcarNotificacionesPorReferenciaComoLeidas
} from '../../util/notificaciones';
import './VistaComunicados.css';

const FORM_VACIO = {
  titulo: '',
  contenido: '',
  alcanceTipo: 'institucion',
  seccionesSeleccionadas: []
};

const estadoLabel = {
  enviado: 'Enviado',
  recibido: 'Recibido',
  leido: 'Leído'
};

function VistaComunicados({ usuarioActual, comunicadoInicial, setComunicadoInicial }) {
  const rol = usuarioActual?.rol;
  const puedeGestionar = rol === 'administrativo';

  const [comunicados, setComunicados] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [secciones, setSecciones] = useState([]);
  const [form, setForm] = useState(FORM_VACIO);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [detalleComunicado, setDetalleComunicado] = useState(null);
  const [modoAdmin, setModoAdmin] = useState('historial');
  const [error, setError] = useState({});
  const [filtros, setFiltros] = useState({ busqueda: '', seccion: '', fechaInicio: '', fechaFin: '' });

  const seccionesElegidas = useMemo(
    () => secciones.filter((seccion) => form.seccionesSeleccionadas.includes(seccion.clave)),
    [form.seccionesSeleccionadas, secciones]
  );

  const resumenDestinatarios = useMemo(() => {
    if (form.alcanceTipo === 'institucion') return 'Toda la institución';
    if (seccionesElegidas.length === 0) return 'Sin secciones seleccionadas';
    return seccionesElegidas.map((seccion) => seccion.nombre).join(', ');
  }, [form.alcanceTipo, seccionesElegidas]);

  const cargar = () => {
    setComunicados(obtenerComunicadosPorUsuario(usuarioActual));
    if (puedeGestionar) {
      setHistorial(obtenerHistorialComunicadosEnviados({ usuarioActual, filtros }));
    }
  };

  useEffect(() => {
    setSecciones(obtenerSeccionesDisponibles());
  }, []);

  useEffect(() => {
    cargar();
  }, [usuarioActual, puedeGestionar]);

  useEffect(() => {
    if (!puedeGestionar) return;
    setHistorial(obtenerHistorialComunicadosEnviados({ usuarioActual, filtros }));
  }, [filtros, usuarioActual, puedeGestionar]);

  useEffect(() => {
    const actualizar = () => cargar();
    window.addEventListener('comunicadosActualizados', actualizar);
    return () => window.removeEventListener('comunicadosActualizados', actualizar);
  }, [usuarioActual, puedeGestionar, filtros]);

  useEffect(() => {
    if (!comunicadoInicial) return;
    const comunicado = obtenerComunicadosPorUsuario(usuarioActual).find((item) => item.id === comunicadoInicial.id) || comunicadoInicial;
    abrirDetalle(comunicado);
    if (setComunicadoInicial) setComunicadoInicial(null);
  }, [comunicadoInicial, setComunicadoInicial]);

  const cambiarCampo = (e) => {
    const { name, value } = e.target;
    setForm((actual) => ({ ...actual, [name]: value }));
    setError((actual) => ({ ...actual, [name]: '' }));
  };

  const cambiarAlcance = (alcanceTipo) => {
    setForm((actual) => ({
      ...actual,
      alcanceTipo,
      seccionesSeleccionadas: alcanceTipo === 'institucion' ? [] : actual.seccionesSeleccionadas
    }));
    setError((actual) => ({ ...actual, alcanceTipo: '', seccionesSeleccionadas: '' }));
  };

  const alternarSeccion = (clave) => {
    setForm((actual) => {
      const existe = actual.seccionesSeleccionadas.includes(clave);
      let seleccionadas = existe
        ? actual.seccionesSeleccionadas.filter((item) => item !== clave)
        : [...actual.seccionesSeleccionadas, clave];

      if (actual.alcanceTipo === 'seccion' && seleccionadas.length > 1) {
        seleccionadas = [clave];
      }

      return {
        ...actual,
        seccionesSeleccionadas: seleccionadas
      };
    });
    setError((actual) => ({ ...actual, seccionesSeleccionadas: '' }));
  };

  const validarFormulario = () => {
    const errores = {};

    if (!form.titulo.trim()) errores.titulo = 'El asunto es obligatorio.';
    if (!form.contenido.trim()) errores.contenido = 'El contenido no puede quedar vacío.';
    if (form.alcanceTipo !== 'institucion' && form.seccionesSeleccionadas.length === 0) {
      errores.seccionesSeleccionadas = 'Seleccione al menos una sección destinataria.';
    }

    setError(errores);
    return Object.keys(errores).length === 0;
  };

  const guardar = () => {
    if (!validarFormulario()) return;

    const destinatarios = obtenerDestinatariosComunicado({
      alcanceTipo: form.alcanceTipo,
      seccionesSeleccionadas: seccionesElegidas,
      usuarioActual,
      usuarios: obtenerUsuarios()
    });

    const lista = agregarComunicado({
      titulo: form.titulo.trim(),
      contenido: form.contenido.trim(),
      alcanceTipo: form.alcanceTipo,
      seccionesDestinatarias: seccionesElegidas,
      destinatarios
    }, usuarioActual);

    const nuevo = lista.at(-1);

    destinatarios.forEach((destinatario) => {
      crearNotificacion({
        usuarioCedula: destinatario.usuarioCedula,
        tipo: 'comunicado',
        referenciaId: nuevo.id,
        titulo: `Comunicado: ${nuevo.titulo}`,
        resumen: nuevo.contenido.slice(0, 110),
        leido: false,
        fecha: nuevo.fecha,
        metadata: destinatario.metadata || {}
      });
    });

    setMostrarFormulario(false);
    setForm(FORM_VACIO);
    setModoAdmin('historial');
    setDetalleComunicado(nuevo);
    cargar();
  };

  const abrirDetalle = (comunicado) => {
    if (!comunicado) return;

    setDetalleComunicado(comunicado);

    if (comunicado.creadoPor?.cedula !== usuarioActual?.cedula) {
      marcarComunicadoComoLeido(comunicado.id, usuarioActual.cedula);
      marcarNotificacionesPorReferenciaComoLeidas({
        usuarioCedula: usuarioActual.cedula,
        referenciaId: comunicado.id
      });
    }

    cargar();
  };

  const volverALista = () => {
    setDetalleComunicado(null);
  };

  const eliminar = (comunicadoId) => {
    if (!window.confirm('¿Desea eliminar este comunicado del prototipo?')) return;
    eliminarComunicado(comunicadoId);
    if (detalleComunicado?.id === comunicadoId) {
      setDetalleComunicado(null);
    }
    cargar();
  };

  const renderFormulario = () => (
    <section className="com-panel-formulario">
      <div className="com-form-encabezado">
        <div>
          <h3>Nuevo comunicado institucional</h3>
          <p>Seleccione el alcance y redacte el comunicado antes de enviarlo.</p>
        </div>
      </div>

      <div className="com-form-bloque">
        <label className="com-label">Destinatarios</label>
        <div className="com-opciones-alcance">
          <button
            type="button"
            className={`com-opcion-alcance ${form.alcanceTipo === 'seccion' ? 'activo' : ''}`}
            onClick={() => cambiarAlcance('seccion')}
          >
            Una sección
          </button>
          <button
            type="button"
            className={`com-opcion-alcance ${form.alcanceTipo === 'multiple' ? 'activo' : ''}`}
            onClick={() => cambiarAlcance('multiple')}
          >
            Varias secciones
          </button>
          <button
            type="button"
            className={`com-opcion-alcance ${form.alcanceTipo === 'institucion' ? 'activo' : ''}`}
            onClick={() => cambiarAlcance('institucion')}
          >
            Toda la institución
          </button>
        </div>

        {form.alcanceTipo !== 'institucion' && (
          <div className={`com-secciones-grid ${error.seccionesSeleccionadas ? 'con-error' : ''}`}>
            {secciones.map((seccion) => {
              const seleccionada = form.seccionesSeleccionadas.includes(seccion.clave);
              return (
                <button
                  key={seccion.clave}
                  type="button"
                  className={`chip-seccion ${seleccionada ? 'seleccionada' : ''}`}
                  onClick={() => alternarSeccion(seccion.clave)}
                >
                  {seccion.nombre}
                </button>
              );
            })}
          </div>
        )}

        {error.seccionesSeleccionadas && (
          <p className="com-error-texto">{error.seccionesSeleccionadas}</p>
        )}

        <div className="com-destinatario-activo">
          <strong>Destinatario activo:</strong> {resumenDestinatarios}
        </div>
      </div>

      <div className="com-form-grid">
        <div className="com-campo-formulario com-campo-amplio">
          <label className="com-label">Asunto</label>
          <input
            name="titulo"
            value={form.titulo}
            onChange={cambiarCampo}
            className={`form-control ${error.titulo ? 'input-error' : ''}`}
            placeholder="Escriba el asunto del comunicado"
          />
          {error.titulo && <p className="com-error-texto">{error.titulo}</p>}
        </div>
      </div>

      <div className="com-campo-formulario">
        <label className="com-label">Contenido</label>
        <textarea
          name="contenido"
          value={form.contenido}
          onChange={cambiarCampo}
          rows={5}
          className={`form-control ${error.contenido ? 'input-error' : ''}`}
          placeholder="Redacte aquí el comunicado institucional"
        />
        {error.contenido && <p className="com-error-texto">{error.contenido}</p>}
      </div>

      <div className="com-form-acciones">
        <button className="btn-com-guardar" onClick={guardar}>Enviar comunicado</button>
        <button
          className="btn-com-cancelar"
          onClick={() => {
            setMostrarFormulario(false);
            setForm(FORM_VACIO);
            setError({});
          }}
        >
          Cancelar
        </button>
      </div>
    </section>
  );

  const renderTarjetaLista = (comunicado) => {
    const estado = obtenerEstadoComunicadoParaUsuario(comunicado, usuarioActual.cedula);
    const noLeido = comunicado.creadoPor?.cedula !== usuarioActual.cedula && estado.estado !== 'leido';

    return (
      <article
        key={comunicado.id}
        className={`com-card ${noLeido ? 'no-leido' : ''}`}
        onClick={() => abrirDetalle(comunicado)}
      >
        <div className="com-card-cabecera">
          <div className="com-card-left">
            <span className={`com-badge ${comunicado.alcanceTipo === 'institucion' ? 'com-badge-inst' : 'com-badge-grupo'}`}>
              {comunicado.alcanceTipo === 'institucion' ? 'Toda la institución' : comunicado.destinatarioResumen}
            </span>
            {noLeido && <span className="com-pill-no-leido">No leído</span>}
          </div>
          <span className="com-card-fecha">{new Date(comunicado.fecha).toLocaleString('es-ES')}</span>
        </div>

        <h4 className="com-card-titulo">{comunicado.titulo}</h4>
        <p className="com-card-contenido previa">{comunicado.contenido.slice(0, 130)}{comunicado.contenido.length > 130 ? '…' : ''}</p>

        <div className="com-card-footer">
          <span className="com-card-meta">Remitente: {comunicado.creadoPor?.nombre || 'Sistema'}</span>
          <span className="com-card-meta">Estado: {estadoLabel[estado.estado] || 'Recibido'}</span>
        </div>
      </article>
    );
  };

  const renderDetalle = () => {
    if (!detalleComunicado) return null;

    const esPropio = detalleComunicado.creadoPor?.cedula === usuarioActual?.cedula;
    const estadoUsuario = esPropio
      ? { estado: obtenerEstadoGlobalComunicado(detalleComunicado) }
      : obtenerEstadoComunicadoParaUsuario(detalleComunicado, usuarioActual.cedula);

    return (
      <section className="com-detalle-panel">
        <button className="btn-com-sec" onClick={volverALista}>← Volver a la lista</button>

        <div className="com-detalle-header">
          <div>
            <span className={`com-badge ${detalleComunicado.alcanceTipo === 'institucion' ? 'com-badge-inst' : 'com-badge-grupo'}`}>
              {detalleComunicado.alcanceTipo === 'institucion' ? 'Toda la institución' : detalleComunicado.destinatarioResumen}
            </span>
            <h3>{detalleComunicado.titulo}</h3>
            <p className="com-detalle-meta">
              Remitente: <strong>{detalleComunicado.creadoPor?.nombre}</strong> · Fecha: {new Date(detalleComunicado.fecha).toLocaleString('es-ES')}
            </p>
            <p className="com-detalle-meta">
              Estado actual: <strong>{estadoLabel[estadoUsuario.estado] || 'Recibido'}</strong>
            </p>
          </div>

          {puedeGestionar && detalleComunicado.creadoPor?.cedula === usuarioActual?.cedula && (
            <button className="btn-com-eliminar-sec" onClick={() => eliminar(detalleComunicado.id)}>
              Eliminar
            </button>
          )}
        </div>

        <div className="com-detalle-cuerpo">
          <p>{detalleComunicado.contenido}</p>
        </div>
      </section>
    );
  };

  const renderHistorial = () => (
    <section>
      <div className="com-filtros-panel">
        <div className="com-filtro-campo com-filtro-amplio">
          <label className="com-label">Buscar por asunto o palabras clave</label>
          <input
            className="form-control"
            value={filtros.busqueda}
            onChange={(e) => setFiltros((actual) => ({ ...actual, busqueda: e.target.value }))}
            placeholder="Buscar comunicado"
          />
        </div>
        <div className="com-filtro-campo">
          <label className="com-label">Sección</label>
          <select
            className="form-select"
            value={filtros.seccion}
            onChange={(e) => setFiltros((actual) => ({ ...actual, seccion: e.target.value }))}
          >
            <option value="">Todas</option>
            {secciones.map((seccion) => (
              <option key={seccion.clave} value={seccion.clave}>{seccion.nombre}</option>
            ))}
          </select>
        </div>
        <div className="com-filtro-campo">
          <label className="com-label">Fecha inicio</label>
          <input
            type="date"
            className="form-control"
            value={filtros.fechaInicio}
            onChange={(e) => setFiltros((actual) => ({ ...actual, fechaInicio: e.target.value }))}
          />
        </div>
        <div className="com-filtro-campo">
          <label className="com-label">Fecha fin</label>
          <input
            type="date"
            className="form-control"
            value={filtros.fechaFin}
            onChange={(e) => setFiltros((actual) => ({ ...actual, fechaFin: e.target.value }))}
          />
        </div>
      </div>

      {historial.length === 0 ? (
        <div className="com-vacio-state">
          <span className="com-vacio-icon">📢</span>
          <p>No se encontraron comunicados con esos filtros.</p>
        </div>
      ) : (
        <div className="com-lista">
          {historial.map((comunicado) => (
            <article key={comunicado.id} className="com-card historial" onClick={() => abrirDetalle(comunicado)}>
              <div className="com-card-cabecera">
                <div className="com-card-left">
                  <span className={`com-badge ${comunicado.alcanceTipo === 'institucion' ? 'com-badge-inst' : 'com-badge-grupo'}`}>
                    {comunicado.destinatarioResumen}
                  </span>
                  <span className={`com-pill-estado estado-${comunicado.estadoGlobal}`}>
                    {estadoLabel[comunicado.estadoGlobal] || 'Enviado'}
                  </span>
                </div>
                <span className="com-card-fecha">{new Date(comunicado.fecha).toLocaleString('es-ES')}</span>
              </div>
              <h4 className="com-card-titulo">{comunicado.titulo}</h4>
              <p className="com-card-contenido previa">{comunicado.contenido.slice(0, 130)}{comunicado.contenido.length > 130 ? '…' : ''}</p>
              <div className="com-card-footer">
                <span className="com-card-meta">Destinatarios: {comunicado.destinatarioResumen}</span>
                <span className="com-card-meta">Registros: {comunicado.estadosDestinatarios?.length || 0}</span>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );

  const listaVisible = detalleComunicado
    ? renderDetalle()
    : (
      <div className="com-lista">
        {comunicados.length === 0 ? (
          <div className="com-vacio-state">
            <span className="com-vacio-icon">📢</span>
            <p>No hay comunicados disponibles.</p>
          </div>
        ) : (
          comunicados.map(renderTarjetaLista)
        )}
      </div>
    );

  return (
    <div className="vista-comunicados">
      <div className="com-encabezado">
        <div>
          <h2 className="com-titulo">Comunicados institucionales</h2>
          <p className="com-subtitulo">
            {puedeGestionar
              ? 'Envíe comunicados a una sección, varias secciones o a toda la institución.'
              : 'Revise los comunicados recibidos, ordenados del más reciente al más antiguo.'}
          </p>
        </div>

        {puedeGestionar && (
          <div className="com-acciones">
            <button className="btn-com-nuevo" onClick={() => { setMostrarFormulario((valor) => !valor); setDetalleComunicado(null); }}>
              {mostrarFormulario ? 'Cerrar formulario' : '+ Nuevo comunicado'}
            </button>
            <button className={`btn-com-sec ${modoAdmin === 'historial' ? 'activo' : ''}`} onClick={() => { setModoAdmin('historial'); setDetalleComunicado(null); }}>
              Historial enviado
            </button>
            <button className={`btn-com-sec ${modoAdmin === 'bandeja' ? 'activo' : ''}`} onClick={() => { setModoAdmin('bandeja'); setDetalleComunicado(null); }}>
              Bandeja recibida
            </button>
          </div>
        )}
      </div>

      {puedeGestionar && mostrarFormulario && renderFormulario()}

      {puedeGestionar
        ? (modoAdmin === 'historial' ? (detalleComunicado ? renderDetalle() : renderHistorial()) : listaVisible)
        : listaVisible}
    </div>
  );
}

export default VistaComunicados;
