import { useEffect, useState } from "react";
import {
  obtenerEstudiantes,
  obtenerEstudiantesPorEncargado,
  obtenerEstudiantesPorDocente,
  obtenerEstudiantePorCedula,
  agregarEstudiante,
  editarEstudiante,
  eliminarEstudiante,
  sincronizarEstudianteDesdeUsuario
} from "../../util/estudiantes";
import { obtenerUsuarios, agregarUsuario, eliminarUsuario } from "../../util/usuarios";
import FormularioEstudiante from "./FormularioEstudiante";
import PerfilEstudiante from "./PerfilEstudiante";
import "./VistaEstudiantes.css";

const FORM_VACIO = { nombre: "", cedula: "", grado: "", seccion: "", encargados: [] };

function VistaEstudiantes({ usuarioActual }) {
  const rol = usuarioActual.rol;

  const [todos, setTodos]                       = useState([]);
  const [usuarios, setUsuarios]                 = useState([]);
  const [estudianteSeleccionado, setSeleccionado] = useState(null);

  const [form, setForm]                         = useState(FORM_VACIO);
  const [editandoId, setEditandoId]             = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [errorForm, setErrorForm]               = useState("");

  const [busqueda, setBusqueda]                 = useState("");
  const [filtroGrado, setFiltroGrado]           = useState("");
  const [filtroSeccion, setFiltroSeccion]       = useState("");

  useEffect(() => {
    cargar();
    setUsuarios(obtenerUsuarios());
  }, []);

  const cargar = () => {
    let lista;
    if (rol === "administrativo") {
      lista = obtenerEstudiantes();
    } else if (rol === "docente") {
      lista = obtenerEstudiantesPorDocente(usuarioActual);
    } else if (rol === "encargado") {
      lista = obtenerEstudiantesPorEncargado(usuarioActual.cedula);
    } else if (rol === "estudiante") {
      const propio = obtenerEstudiantePorCedula(usuarioActual.cedula);
      lista = propio ? [propio] : [];
    } else {
      lista = [];
    }
    setTodos(lista);
  };

  const listaFiltrada = todos.filter((e) => {
    const q = busqueda.toLowerCase();
    return (
      (e.nombre.toLowerCase().includes(q) || !q) &&
      (filtroGrado   ? e.grado   === filtroGrado   : true) &&
      (filtroSeccion ? e.seccion === filtroSeccion : true)
    );
  });

  const gradosDisponibles    = [...new Set(todos.map((e) => e.grado))].sort();
  const seccionesDisponibles = [...new Set(todos.map((e) => e.seccion))].sort();

  const manejarCambio = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const toggleEncargado = (cedula) => {
    const ya = form.encargados.includes(cedula);
    setForm({
      ...form,
      encargados: ya
        ? form.encargados.filter((c) => c !== cedula)
        : [...form.encargados, cedula]
    });
  };

  const guardar = () => {
    setErrorForm("");
    if (!form.nombre.trim() || !form.grado || !form.seccion) {
      setErrorForm("Nombre, grado y sección son obligatorios");
      return;
    }
    if (form.encargados.length === 0) {
      setErrorForm("Debe asignar al menos un encargado legal");
      return;
    }

    try {
      let lista;
      const todosUsuarios = obtenerUsuarios();

      if (editandoId) {
        lista = editarEstudiante(editandoId, form, todosUsuarios);
        // Sync usuario
        sincronizarEstudianteDesdeUsuario(
          { cedula: form.cedula, nombre: form.nombre, grado: form.grado, seccion: form.seccion, encargados: form.encargados },
          todosUsuarios
        );
        setEditandoId(null);
      } else {
        // Create student record
        lista = agregarEstudiante(form, todosUsuarios);
        // Auto-create user with rol=estudiante if doesn't exist
        const yaExiste = todosUsuarios.some((u) => u.cedula === form.cedula);
        if (!yaExiste && form.cedula.trim()) {
          const usuarioNuevo = {
            cedula: form.cedula,
            nombre: form.nombre,
            rol: 'estudiante',
            roles: ['estudiante'],
            grado: form.grado,
            seccion: form.seccion,
            encargados: form.encargados,
            subrol: '',
            alcance: { tipo: 'global' }
          };
          agregarUsuario(usuarioNuevo, usuarioActual);
          setUsuarios(obtenerUsuarios());
        }
      }

      if (rol === "docente") lista = obtenerEstudiantesPorDocente(usuarioActual);
      else if (rol === "encargado") lista = obtenerEstudiantesPorEncargado(usuarioActual.cedula);
      else if (rol === "administrativo") lista = obtenerEstudiantes();

      setTodos(lista);
      setForm(FORM_VACIO);
      setMostrarFormulario(false);
    } catch (err) {
      setErrorForm(err.message);
    }
  };

  const iniciarEdicion = (est) => {
    setForm({
      nombre: est.nombre,
      cedula: est.cedula || "",
      grado: est.grado,
      seccion: est.seccion,
      encargados: est.encargados.map((e) => e.cedula)
    });
    setEditandoId(est.id);
    setMostrarFormulario(true);
    setErrorForm("");
  };

  const eliminar = (id) => {
    if (!window.confirm("¿Eliminar este estudiante?")) return;
    const est = todos.find((e) => e.id === id);
    let lista = eliminarEstudiante(id);
    // Also remove the user if exists
    if (est?.cedula) {
      const todosUsuarios = obtenerUsuarios();
      const usuarioEst = todosUsuarios.find((u) => u.cedula === est.cedula && (u.roles?.includes('estudiante') || u.rol === 'estudiante'));
      if (usuarioEst) eliminarUsuario(est.cedula);
    }
    if (rol === "docente") lista = obtenerEstudiantesPorDocente(usuarioActual);
    else if (rol === "encargado") lista = obtenerEstudiantesPorEncargado(usuarioActual.cedula);
    setTodos(lista);
  };

  const cancelar = () => {
    setForm(FORM_VACIO);
    setEditandoId(null);
    setMostrarFormulario(false);
    setErrorForm("");
  };

  const encargadosDisponibles = usuarios.filter(
    (u) => u.roles?.includes("encargado") || u.rol === "encargado"
  );

  if (estudianteSeleccionado) {
    return (
      <PerfilEstudiante
        estudiante={estudianteSeleccionado}
        usuarioActual={usuarioActual}
        onVolver={() => setSeleccionado(null)}
      />
    );
  }

  const puedeEditar = rol === "administrativo" || rol === "docente";

  return (
    <div className="vista-est">

      <div className="est-encabezado">
        <div>
          <h2 className="est-titulo">
            {rol === "estudiante" ? "Mi Información" : "Estudiantes"}
          </h2>
          <p className="est-subtitulo">
            {rol === "administrativo" && "Todos los estudiantes de la institución"}
            {rol === "docente" && "Estudiantes de sus grupos asignados"}
            {rol === "encargado" && "Sus estudiantes vinculados"}
            {rol === "estudiante" && "Su registro académico"}
          </p>
        </div>
        {puedeEditar && (
          <button className="btn-est-nuevo" onClick={() => { setMostrarFormulario(true); setEditandoId(null); setForm(FORM_VACIO); setErrorForm(""); }}>
            + Nuevo estudiante
          </button>
        )}
      </div>

      {puedeEditar && mostrarFormulario && (
        <FormularioEstudiante
          form={form}
          onChange={manejarCambio}
          onToggleEncargado={toggleEncargado}
          encargados={encargadosDisponibles}
          onSubmit={guardar}
          onCancel={cancelar}
          editando={!!editandoId}
          error={errorForm}
        />
      )}

      {rol !== "estudiante" && (
        <div className="est-filtros">
          <input className="form-control est-busqueda" placeholder="Buscar por nombre..."
            value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
          <select className="form-select est-select" value={filtroGrado} onChange={(e) => setFiltroGrado(e.target.value)}>
            <option value="">Todos los grados</option>
            {gradosDisponibles.map((g) => <option key={g} value={g}>{g}°</option>)}
          </select>
          <select className="form-select est-select" value={filtroSeccion} onChange={(e) => setFiltroSeccion(e.target.value)}>
            <option value="">Todas las secciones</option>
            {seccionesDisponibles.map((s) => <option key={s} value={s}>Sección {s}</option>)}
          </select>
          {(busqueda || filtroGrado || filtroSeccion) && (
            <button className="btn-est-limpiar" onClick={() => { setBusqueda(""); setFiltroGrado(""); setFiltroSeccion(""); }}>
              Limpiar
            </button>
          )}
        </div>
      )}

      {listaFiltrada.length === 0 ? (
        <p className="est-vacio">
          {busqueda ? `Sin resultados para "${busqueda}"` : "No hay estudiantes registrados."}
        </p>
      ) : (
        <div className="est-lista">
          {listaFiltrada.map((est) => (
            <div key={est.id} className="est-card">
              <div className="est-card-info" onClick={() => setSeleccionado(est)} role="button" tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && setSeleccionado(est)}>
                <div className="est-card-avatar">{est.nombre.charAt(0)}</div>
                <div>
                  <p className="est-card-nombre">{est.nombre}</p>
                  <p className="est-card-datos">
                    Grado {est.grado}° · Sección {est.seccion}
                    {est.cedula && ` · Cédula: ${est.cedula}`}
                  </p>
                  {est.encargados?.length > 0 && (
                    <p className="est-card-encargados">
                      Encargados: {est.encargados.map((e) => e.nombre).join(", ")}
                    </p>
                  )}
                </div>
              </div>
              {puedeEditar && (
                <div className="est-card-acciones">
                  <button className="btn-est-editar" onClick={() => iniciarEdicion(est)}>Editar</button>
                  {rol === "administrativo" && (
                    <button className="btn-est-eliminar" onClick={() => eliminar(est.id)}>Eliminar</button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default VistaEstudiantes;
