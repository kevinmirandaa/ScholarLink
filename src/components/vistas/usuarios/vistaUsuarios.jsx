import { useEffect, useState } from 'react';
import {
  obtenerUsuarios,
  agregarUsuario,
  editarUsuario,
  eliminarUsuario
} from '../../util/usuarios';
import { sincronizarEstudianteDesdeUsuario, eliminarEstudiantePorCedula } from '../../util/estudiantes';

import FormularioUsuario from './FormularioUsuario';
import TablaUsuarios from './TablaUsuarios';
import './VistaUsuario.css';

const FORM_VACIO = {
  cedula: '',
  nombre: '',
  roles: ['docente'],
  rol: 'docente',
  subrol: '',
  alcance: { tipo: 'global' },
  grado: '',
  seccion: '',
  encargados: []
};

const ETIQUETA_ROL = {
  administrativo: 'Administrativo',
  docente: 'Docente',
  encargado: 'Encargado',
  estudiante: 'Estudiante'
};

function VistaUsuarios({ usuarioActual }) {
  const [usuarios, setUsuarios]         = useState([]);
  const [form, setForm]                 = useState(FORM_VACIO);
  const [editando, setEditando]         = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  // Filtros
  const [busqueda, setBusqueda]         = useState('');
  const [filtroRol, setFiltroRol]       = useState('');

  useEffect(() => {
    setUsuarios(obtenerUsuarios());
  }, []);

  const manejarCambio = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const manejarRoles = (nuevosRoles) =>
    setForm({ ...form, roles: nuevosRoles, rol: nuevosRoles[0] });

  const manejarEncargados = (nuevosEncargados) =>
    setForm({ ...form, encargados: nuevosEncargados });

  const guardar = () => {
    if (!form.cedula.trim() || !form.nombre.trim()) return;
    if (!form.roles || form.roles.length === 0) return;

    let lista;
    const todosUsuarios = obtenerUsuarios();

    if (editando) {
      lista = editarUsuario(editando, {
        nombre: form.nombre,
        roles: form.roles,
        rol: form.roles[0],
        subrol: form.subrol,
        alcance: form.alcance,
        grado: form.grado,
        seccion: form.seccion,
        encargados: form.encargados
      });
      setEditando(null);
    } else {
      lista = agregarUsuario(form, usuarioActual);
    }

    // Sincronizar registro de estudiante si aplica
    if (form.roles.includes('estudiante')) {
      sincronizarEstudianteDesdeUsuario(
        {
          cedula: form.cedula,
          nombre: form.nombre,
          grado: form.grado,
          seccion: form.seccion,
          encargados: form.encargados
        },
        lista
      );
    }

    setUsuarios(lista);
    setForm(FORM_VACIO);
    setMostrarFormulario(false);
  };

  const editar = (u) => {
    setForm({
      cedula: u.cedula,
      nombre: u.nombre,
      roles: u.roles || [u.rol],
      rol: u.rol,
      subrol: u.subrol || '',
      alcance: u.alcance || { tipo: 'global' },
      grado: u.grado || '',
      seccion: u.seccion || '',
      encargados: u.encargados || []
    });
    setEditando(u.cedula);
    setMostrarFormulario(true);
  };

  const eliminar = (cedula) => {
    // Si es estudiante, también eliminar su registro de estudiante
    const usuario = usuarios.find((u) => u.cedula === cedula);
    if (usuario?.roles?.includes('estudiante') || usuario?.rol === 'estudiante') {
      eliminarEstudiantePorCedula(cedula);
    }
    const lista = eliminarUsuario(cedula);
    setUsuarios(lista);
  };

  const cancelar = () => {
    setMostrarFormulario(false);
    setEditando(null);
    setForm(FORM_VACIO);
  };

  // Encargados disponibles para el picker de estudiantes
  const encargadosDisponibles = usuarios.filter(
    (u) => u.roles?.includes('encargado') || u.rol === 'encargado'
  );

  // Filtrado
  const listaFiltrada = usuarios.filter((u) => {
    const rol = u.rol || '';
    const nombre = u.nombre.toLowerCase();
    const cedula = u.cedula.toLowerCase();
    const q = busqueda.toLowerCase();

    const coincideBusqueda = !q || nombre.includes(q) || cedula.includes(q);
    const coincideRol      = !filtroRol || rol === filtroRol || (u.roles || []).includes(filtroRol);

    return coincideBusqueda && coincideRol;
  });

  return (
    <div className="vista-usuarios">
      <h2 className="titulo-seccion">Gestión de Usuarios</h2>

      {/* Barra de filtros + nuevo */}
      <div className="usuarios-toolbar">
        <div className="usuarios-filtros">
          <input
            className="form-control"
            placeholder="Buscar por nombre o cédula..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          <select
            className="form-select"
            value={filtroRol}
            onChange={(e) => setFiltroRol(e.target.value)}
          >
            <option value="">Todos los roles</option>
            {Object.entries(ETIQUETA_ROL).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
          {(busqueda || filtroRol) && (
            <button
              className="btn btn-outline-secondary"
              onClick={() => { setBusqueda(''); setFiltroRol(''); }}
            >
              Limpiar
            </button>
          )}
        </div>
        <button
          className="btn boton-accion"
          onClick={() => {
            setMostrarFormulario(true);
            setEditando(null);
            setForm(FORM_VACIO);
          }}
        >
          + Agregar usuario
        </button>
      </div>

      {mostrarFormulario && (
        <FormularioUsuario
          form={form}
          onChange={manejarCambio}
          onRolesChange={manejarRoles}
          onEncargadosChange={manejarEncargados}
          onSubmit={guardar}
          onCancel={cancelar}
          editando={editando}
          encargadosDisponibles={encargadosDisponibles}
        />
      )}

      <TablaUsuarios
        usuarios={listaFiltrada}
        onEditar={editar}
        onEliminar={eliminar}
      />
    </div>
  );
}

export default VistaUsuarios;
