import React, { useState } from 'react';
import './VistaImportarCSV.css';

const VistaImportarCSV = () => {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState(false);
  const [progress, setProgress] = useState(0);
  const [confirmed, setConfirmed] = useState(false);
  const [showData, setShowData] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);

    setUploadSuccess(false);
    setUploadError(false);
    setProgress(0);
    setConfirmed(false);
    setShowData(false);
  };

  const handleUpload = () => {
    setIsUploading(true);
    setUploadSuccess(false);
    setUploadError(false);

    let currentProgress = 0;

    const interval = setInterval(() => {
      currentProgress += 10;
      setProgress(currentProgress);

      if (currentProgress >= 100) {
        clearInterval(interval);
        setIsUploading(false);

        const success = Math.random() > 0.3;

        if (success) {
          setUploadSuccess(true);
          setShowData(true);
        } else {
          setUploadError(true);
          setShowData(false);
        }
      }
    }, 200);
  };

  const handleConfirmImport = () => {
    setConfirmed(true);

    setTimeout(() => {
      setFile(null);
      setUploadSuccess(false);
      setUploadError(false);
      setProgress(0);
      setShowData(false);
      setConfirmed(false);
    }, 2000);
  };

  // 🔥 DATOS CORREGIDOS (grupos reales)
  const mockData = [
    { id: '1001', name: 'Juan Pérez', email: 'juan.perez@email.com', guardian: 'María Pérez', group: { grade: 7, section: 'A' }, teacherId: 'DOC001', status: 'valid' },
    { id: '1002', name: 'Ana García', email: 'ana.garcia@email.com', guardian: 'Carlos García', group: { grade: 7, section: 'A' }, teacherId: 'DOC001', status: 'valid' },
    { id: '1003', name: 'Luis Rodríguez', email: 'luis.rod@invalid', guardian: 'Elena Rodríguez', group: { grade: 8, section: 'B' }, teacherId: 'DOC002', status: 'error' },
    { id: '1004', name: 'Marta Soto', email: 'marta.soto@email.com', guardian: 'Jorge Soto', group: { grade: 8, section: 'B' }, teacherId: 'DOC003', status: 'valid' },
  ];

  const mockErrors = [
    { row: 3, message: 'Formato de correo inválido' }
  ];

  return (
      <div className="importar-csv-container">

        <div className="header-importar">
          <h2>Importación de Datos CSV - ScholarLink</h2>
          <p className="metadata">
            Fecha y hora de importación: {new Date().toLocaleString()}
          </p>
        </div>

        <div className="dashboard-grid">

          {/* SUBIR ARCHIVO */}
          <div className="card upload-section">
            <h3>1. Seleccionar y subir archivo</h3>

            <div className={`drop-area ${file ? 'has-file' : ''}`}>
              <input
                  type="file"
                  id="fileInput"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
              />

              <label htmlFor="fileInput" className="select-button">
                {file ? 'Cambiar archivo CSV' : 'Seleccionar archivo CSV'}
              </label>

              {file && <p className="file-name">📄 {file.name}</p>}

              <p className="note">Solo se permiten archivos CSV (simulado)</p>
            </div>

            <button className="upload-button" onClick={handleUpload}>
              {isUploading ? 'Subiendo...' : 'Subir archivo'}
            </button>

            {isUploading && (
                <div className="progress-container">
                  <div
                      className="progress-bar"
                      style={{ width: `${progress}%` }}
                  />
                  <span>{progress}%</span>
                </div>
            )}

            {uploadSuccess && (
                <div className="alert success">
                  ✅ Archivo subido correctamente
                </div>
            )}

            {uploadError && (
                <div className="alert error">
                  ❌ Error al subir el archivo (simulado)
                </div>
            )}
          </div>

          {/* RESUMEN */}
          {showData && (
              <div className="card summary-section">
                <h3>2. Resumen de importación</h3>

                <div className="summary-grid">
                  <div className="summary-item">
                    <span className="count">4</span>
                    <span className="label">Estudiantes</span>
                  </div>

                  <div className="summary-item">
                    <span className="count">4</span>
                    <span className="label">Encargados</span>
                  </div>
                </div>
              </div>
          )}
        </div>

        {/* VISTA PREVIA */}
        {showData && (
            <div className="card preview-section">
              <h3>3. Vista previa de datos</h3>

              <table>
                <thead>
                <tr>
                  <th>ID</th>
                  <th>Estudiante</th>
                  <th>Email</th>
                  <th>Encargado</th>
                  <th>Grupo</th>
                  <th>Profesor</th>
                  <th>Estado</th>
                </tr>
                </thead>

                <tbody>
                {mockData.map((row, idx) => (
                    <tr key={idx} className={row.status}>
                      <td>{row.id}</td>
                      <td>{row.name}</td>
                      <td>{row.email}</td>
                      <td>{row.guardian}</td>
                      <td>{row.group.grade}° {row.group.section}</td>
                      <td>👤 {row.teacherId}</td>
                      <td>
                        {row.status === 'valid' ? '✔ Válido' : '⚠ Error'}
                      </td>
                    </tr>
                ))}
                </tbody>
              </table>
            </div>
        )}

        {/* ERRORES */}
        {showData && (
            <div className="card error-section">
              <h3>4. Detalle de errores</h3>

              {mockErrors.map((err, idx) => (
                  <div key={idx} className="error-item">
                    ⚠ Fila {err.row}: {err.message}
                  </div>
              ))}
            </div>
        )}

        {/* CONFIRMAR */}
        {showData && (
            <div className="card confirm-section">
              <h3>5. Confirmar importación</h3>

              <button className="confirm-button" onClick={handleConfirmImport}>
                Confirmar importación
              </button>

              {confirmed && (
                  <div className="alert success">
                    🎉 Importación completada exitosamente (simulado)
                  </div>
              )}
            </div>
        )}

      </div>
  );
};

export default VistaImportarCSV;