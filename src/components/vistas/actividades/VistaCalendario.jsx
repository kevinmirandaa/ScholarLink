import { useState, useMemo } from 'react';
import { obtenerActividades } from '../../util/actividades';
import { obtenerEstudiantes } from '../../util/estudiantes';
import { obtenerGrupos } from '../../util/grupos';
import './VistaCalendario.css';

const DIAS_SEMANA = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

function formatFechaRelativa(fechaStr) {
  if (!fechaStr) return '';
  const hoy = new Date(); hoy.setHours(0,0,0,0);
  const d = new Date(fechaStr + 'T00:00:00'); d.setHours(0,0,0,0);
  const diff = Math.round((d - hoy) / 86400000);
  if (diff === 0) return 'Hoy';
  if (diff === 1) return 'Mañana';
  if (diff === -1) return 'Ayer';
  if (diff > 1 && diff < 7) return `En ${diff} días`;
  if (diff < 0) return `Hace ${Math.abs(diff)} días`;
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
}

function colorPorTipo(tipo) {
  const mapa = { actividad: '#3b82f6', tarea: '#f59e0b', examen: '#ef4444', evento: '#10b981', aviso: '#8b5cf6' };
  return mapa[tipo] || '#6366f1';
}

// ── Filtrado por rol ───────────────────────────────────────────────────────
function obtenerActividadesParaRol(usuarioActual) {
  const todas = obtenerActividades();
  const rol = usuarioActual.rol;

  if (rol === 'administrativo') return todas;

  if (rol === 'docente') {
    return todas.filter(a => a.creadoPor?.cedula === usuarioActual.cedula);
  }

  if (rol === 'estudiante') {
    const estudiantes = obtenerEstudiantes();
    const yo = estudiantes.find(e => e.cedula === usuarioActual.cedula || e.id === usuarioActual.cedula);
    if (!yo) return [];

    const grupos = obtenerGrupos();
    const miGrupo = grupos.find(g => g.grado === yo.grado && g.seccion === yo.seccion);
    const misGrupoIds = [miGrupo?.id, `${yo.grado}-${yo.seccion}`].filter(Boolean);

    return todas.filter(a => misGrupoIds.includes(a.grupoId));
  }

  if (rol === 'encargado') {
    const estudiantes = obtenerEstudiantes();
    const hijos = estudiantes.filter(e =>
      (e.encargados || []).some(enc => enc.cedula === usuarioActual.cedula)
    );
    const grupos = obtenerGrupos();
    const grupoIds = hijos.map(h => {
      const g = grupos.find(grp => grp.grado === h.grado && grp.seccion === h.seccion);
      return [g?.id, `${h.grado}-${h.seccion}`];
    }).flat().filter(Boolean);

    return todas.filter(a => grupoIds.includes(a.grupoId));
  }

  return todas;
}

// ── Mini badge de actividad ────────────────────────────────────────────────
function BadgeActividad({ act, onClick }) {
  const color = colorPorTipo(act.tipo);
  return (
    <div
      className="cal-badge"
      style={{ borderLeft: `3px solid ${color}`, background: `${color}18` }}
      onClick={(e) => { e.stopPropagation(); onClick(act); }}
      title={act.titulo}
    >
      <span className="cal-badge-titulo">{act.titulo}</span>
    </div>
  );
}

// ── Modal de detalle ──────────────────────────────────────────────────────
function ModalActividad({ act, onCerrar }) {
  if (!act) return null;
  const color = colorPorTipo(act.tipo);
  return (
    <div className="cal-modal-overlay" onClick={onCerrar}>
      <div className="cal-modal" onClick={e => e.stopPropagation()}>
        <div className="cal-modal-header" style={{ borderLeft: `4px solid ${color}` }}>
          <div>
            <span className="cal-modal-tipo" style={{ color }}>{act.tipo || 'actividad'}</span>
            <h3 className="cal-modal-titulo">{act.titulo}</h3>
          </div>
          <button className="cal-modal-cerrar" onClick={onCerrar}>✕</button>
        </div>
        {act.descripcion && <p className="cal-modal-desc">{act.descripcion}</p>}
        <div className="cal-modal-meta">
          {act.fechaLimite && (
            <div className="cal-modal-meta-row">
              <span>📅</span>
              <span>{new Date(act.fechaLimite + 'T00:00:00').toLocaleDateString('es-ES', { weekday:'long', day:'2-digit', month:'long', year:'numeric' })}</span>
              <span className="cal-modal-relativa">({formatFechaRelativa(act.fechaLimite)})</span>
            </div>
          )}
          {act.materia && <div className="cal-modal-meta-row"><span>📚</span><span>{act.materia}</span></div>}
          {act.grupoId && <div className="cal-modal-meta-row"><span>👥</span><span>Grupo: {act.grupoId}</span></div>}
          {act.modalidad && <div className="cal-modal-meta-row"><span>🔧</span><span>{act.modalidad}</span></div>}
          {act.notaTotal && <div className="cal-modal-meta-row"><span>⭐</span><span>Nota total: {act.notaTotal} pts</span></div>}
          {act.creadoPor && <div className="cal-modal-meta-row"><span>👤</span><span>Creado por: {act.creadoPor.nombre}</span></div>}
        </div>
      </div>
    </div>
  );
}

// ── Vista MES ─────────────────────────────────────────────────────────────
function VistaMes({ fecha, actividades, onActividadClick }) {
  const year = fecha.getFullYear();
  const month = fecha.getMonth();
  const hoy = new Date();

  const primerDia = new Date(year, month, 1).getDay();
  const diasEnMes = new Date(year, month + 1, 0).getDate();
  const celdas = [];

  for (let i = 0; i < primerDia; i++) celdas.push(null);
  for (let d = 1; d <= diasEnMes; d++) celdas.push(d);
  while (celdas.length % 7 !== 0) celdas.push(null);

  const actsPorDia = {};
  actividades.forEach(a => {
    if (!a.fechaLimite) return;
    const key = a.fechaLimite.slice(0, 10);
    if (!actsPorDia[key]) actsPorDia[key] = [];
    actsPorDia[key].push(a);
  });

  return (
    <div className="cal-mes">
      <div className="cal-mes-header">
        {DIAS_SEMANA.map(d => <div key={d} className="cal-mes-dh">{d}</div>)}
      </div>
      <div className="cal-mes-grid">
        {celdas.map((dia, idx) => {
          if (!dia) return <div key={`v${idx}`} className="cal-celda cal-celda-vacia" />;
          const key = `${year}-${String(month+1).padStart(2,'0')}-${String(dia).padStart(2,'0')}`;
          const acts = actsPorDia[key] || [];
          const esHoy = hoy.getFullYear()===year && hoy.getMonth()===month && hoy.getDate()===dia;
          return (
            <div key={key} className={`cal-celda ${esHoy ? 'cal-celda-hoy' : ''} ${acts.length>0 ? 'cal-celda-con-acts' : ''}`}>
              <span className="cal-celda-num">{dia}</span>
              <div className="cal-celda-acts">
                {acts.slice(0,2).map(a => <BadgeActividad key={a.id} act={a} onClick={onActividadClick} />)}
                {acts.length > 2 && <span className="cal-mas">+{acts.length-2} más</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Vista SEMANA ──────────────────────────────────────────────────────────
function VistaSemana({ fecha, actividades, onActividadClick }) {
  const hoy = new Date();
  const inicioSemana = new Date(fecha);
  inicioSemana.setDate(fecha.getDate() - fecha.getDay());

  const dias = Array.from({length:7}, (_,i) => {
    const d = new Date(inicioSemana);
    d.setDate(inicioSemana.getDate() + i);
    return d;
  });

  const actsPorDia = {};
  actividades.forEach(a => {
    if (!a.fechaLimite) return;
    const k = a.fechaLimite.slice(0,10);
    if (!actsPorDia[k]) actsPorDia[k] = [];
    actsPorDia[k].push(a);
  });

  return (
    <div className="cal-semana">
      {dias.map(dia => {
        const key = `${dia.getFullYear()}-${String(dia.getMonth()+1).padStart(2,'0')}-${String(dia.getDate()).padStart(2,'0')}`;
        const acts = actsPorDia[key] || [];
        const esHoy = dia.toDateString() === hoy.toDateString();
        return (
          <div key={key} className={`cal-semana-col ${esHoy ? 'cal-semana-col-hoy' : ''}`}>
            <div className="cal-semana-header">
              <span className="cal-semana-dh">{DIAS_SEMANA[dia.getDay()]}</span>
              <span className={`cal-semana-num ${esHoy ? 'cal-num-hoy' : ''}`}>{dia.getDate()}</span>
            </div>
            <div className="cal-semana-acts">
              {acts.length === 0
                ? <span className="cal-semana-vacio">—</span>
                : acts.map(a => <BadgeActividad key={a.id} act={a} onClick={onActividadClick} />)
              }
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Vista DÍA ─────────────────────────────────────────────────────────────
function VistaDia({ fecha, actividades, onActividadClick }) {
  const hoy = new Date();
  const esHoy = fecha.toDateString() === hoy.toDateString();
  const key = `${fecha.getFullYear()}-${String(fecha.getMonth()+1).padStart(2,'0')}-${String(fecha.getDate()).padStart(2,'0')}`;
  const actsHoy = actividades.filter(a => a.fechaLimite?.slice(0,10) === key);

  return (
    <div className="cal-dia">
      <div className={`cal-dia-titulo ${esHoy ? 'cal-dia-titulo-hoy' : ''}`}>
        <span className="cal-dia-nombre">{DIAS_SEMANA[fecha.getDay()]}</span>
        <span className="cal-dia-num">{fecha.getDate()} de {MESES[fecha.getMonth()]}, {fecha.getFullYear()}</span>
        {esHoy && <span className="cal-dia-badge-hoy">Hoy</span>}
      </div>
      {actsHoy.length === 0 ? (
        <div className="cal-dia-vacio">
          <span className="cal-dia-vacio-icon">📭</span>
          <p>No hay actividades para este día.</p>
        </div>
      ) : (
        <div className="cal-dia-lista">
          {actsHoy.map(a => {
            const color = colorPorTipo(a.tipo);
            return (
              <div
                key={a.id}
                className="cal-dia-item"
                style={{ borderLeft: `4px solid ${color}` }}
                onClick={() => onActividadClick(a)}
              >
                <div className="cal-dia-item-top">
                  <span className="cal-dia-item-tipo" style={{ color }}>{a.tipo || 'actividad'}</span>
                  {a.materia && <span className="cal-dia-item-materia">{a.materia}</span>}
                </div>
                <h4 className="cal-dia-item-titulo">{a.titulo}</h4>
                {a.descripcion && <p className="cal-dia-item-desc">{a.descripcion}</p>}
                {a.grupoId && <span className="cal-dia-item-grupo">Grupo: {a.grupoId}</span>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Componente principal ───────────────────────────────────────────────────
function VistaCalendario({ usuarioActual }) {
  const [modo, setModo]   = useState('mes'); // 'mes' | 'semana' | 'dia'
  const [fecha, setFecha] = useState(new Date());
  const [actSeleccionada, setActSeleccionada] = useState(null);

  const actividades = useMemo(() => obtenerActividadesParaRol(usuarioActual), [usuarioActual]);

  // ── Navegación ─────────────────────────────────────────────────────────
  const navegar = (dir) => {
    const nueva = new Date(fecha);
    if (modo === 'mes')    nueva.setMonth(fecha.getMonth() + dir);
    if (modo === 'semana') nueva.setDate(fecha.getDate() + dir * 7);
    if (modo === 'dia')    nueva.setDate(fecha.getDate() + dir);
    setFecha(nueva);
  };

  const irAHoy = () => setFecha(new Date());

  const tituloNav = () => {
    if (modo === 'mes')    return `${MESES[fecha.getMonth()]} ${fecha.getFullYear()}`;
    if (modo === 'semana') {
      const ini = new Date(fecha); ini.setDate(fecha.getDate() - fecha.getDay());
      const fin = new Date(ini); fin.setDate(ini.getDate() + 6);
      return `${ini.getDate()} ${MESES[ini.getMonth()].slice(0,3)} — ${fin.getDate()} ${MESES[fin.getMonth()].slice(0,3)} ${fin.getFullYear()}`;
    }
    return `${DIAS_SEMANA[fecha.getDay()]}, ${fecha.getDate()} de ${MESES[fecha.getMonth()]} ${fecha.getFullYear()}`;
  };

  // ── Próximas actividades (panel lateral) ───────────────────────────────
  const proximas = useMemo(() => {
    const hoy = new Date(); hoy.setHours(0,0,0,0);
    return actividades
      .filter(a => a.fechaLimite && new Date(a.fechaLimite + 'T00:00:00') >= hoy)
      .sort((a,b) => new Date(a.fechaLimite) - new Date(b.fechaLimite))
      .slice(0, 6);
  }, [actividades]);

  return (
    <div className="cal-wrapper">

      {/* ── Panel lateral ── */}
      <aside className="cal-sidebar">
        <h3 className="cal-sidebar-titulo">Próximas actividades</h3>
        {proximas.length === 0 ? (
          <p className="cal-sidebar-vacio">Sin actividades próximas</p>
        ) : proximas.map(a => {
          const color = colorPorTipo(a.tipo);
          return (
            <div
              key={a.id}
              className="cal-sidebar-item"
              style={{ borderLeft: `3px solid ${color}` }}
              onClick={() => setActSeleccionada(a)}
            >
              <div className="cal-sidebar-fecha" style={{ color }}>
                {formatFechaRelativa(a.fechaLimite)}
              </div>
              <div className="cal-sidebar-nombre">{a.titulo}</div>
              {a.materia && <div className="cal-sidebar-materia">{a.materia}</div>}
            </div>
          );
        })}
      </aside>

      {/* ── Área principal ── */}
      <div className="cal-main">

        {/* Toolbar */}
        <div className="cal-toolbar">
          <div className="cal-toolbar-izq">
            <button className="cal-btn-hoy" onClick={irAHoy}>Hoy</button>
            <button className="cal-btn-nav" onClick={() => navegar(-1)} aria-label="Anterior">‹</button>
            <button className="cal-btn-nav" onClick={() => navegar(1)}  aria-label="Siguiente">›</button>
            <h2 className="cal-titulo-nav">{tituloNav()}</h2>
          </div>
          <div className="cal-modos">
            {['dia','semana','mes'].map(m => (
              <button
                key={m}
                id={`cal-modo-${m}`}
                className={`cal-btn-modo ${modo === m ? 'cal-btn-modo-activo' : ''}`}
                onClick={() => setModo(m)}
              >
                {m.charAt(0).toUpperCase() + m.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Vista */}
        <div className="cal-vista-container">
          {modo === 'mes'    && <VistaMes    fecha={fecha} actividades={actividades} onActividadClick={setActSeleccionada} />}
          {modo === 'semana' && <VistaSemana fecha={fecha} actividades={actividades} onActividadClick={setActSeleccionada} />}
          {modo === 'dia'    && <VistaDia    fecha={fecha} actividades={actividades} onActividadClick={setActSeleccionada} />}
        </div>

      </div>

      {/* ── Modal detalle ── */}
      {actSeleccionada && (
        <ModalActividad act={actSeleccionada} onCerrar={() => setActSeleccionada(null)} />
      )}
    </div>
  );
}

export default VistaCalendario;
