import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { AlertCircle, Check, FileText, Edit2, Trash2 } from 'lucide-react';

const LibroDiario = () => {
  const [registros, setRegistros] = useState([]);
  const [cuentas, setCuentas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    Fecha: '',
    Descripcion: '',
    Cod_cuenta: '',
    Monto: '',
    Tipo_transaccion: ''
  });
  const [cuentasMap, setCuentasMap] = useState({});

  useEffect(() => {
    fetchRegistros();
    fetchCuentas();
  }, []);

  useEffect(() => {
    const mapping = {};
    cuentas.forEach(cuenta => {
      mapping[cuenta.Cod_cuenta] = cuenta.Nombre_cuenta;
    });
    setCuentasMap(mapping);
  }, [cuentas]);

  const fetchCuentas = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/catalogoCuentas', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) {
        throw new Error('Error en la respuesta del servidor');
      }
      const data = await response.json();
      setCuentas(data);
    } catch (err) {
      setError('Error al cargar las cuentas: ' + err.message);
      console.error('Error al cargar cuentas:', err);
    }
  };

  const fetchRegistros = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:4000/api/Librodiario', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) {
        throw new Error('Error en la respuesta del servidor');
      }
      const data = await response.json();
      setRegistros(data);
    } catch (err) {
      setError('Error al cargar los registros: ' + err.message);
      console.error('Error al cargar registros:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    try {
      const url = editingId 
        ? `http://localhost:4000/api/Librodiario/${editingId}`
        : 'http://localhost:4000/api/Librodiario';
      
      const method = editingId ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...formData,
          Monto: parseFloat(formData.Monto)
        })
      });

      if (!response.ok) {
        throw new Error('Error en la respuesta del servidor');
      }

      setSuccess(editingId ? 'Registro actualizado con éxito' : 'Registro agregado con éxito');
      setFormData({
        Fecha: '',
        Descripcion: '',
        Cod_cuenta: '',
        Monto: '',
        Tipo_transaccion: ''
      });
      setEditingId(null);
      await fetchRegistros();
    } catch (err) {
      setError('Error al procesar la operación: ' + err.message);
      console.error('Error en submit:', err);
    }
  };

  const handleDelete = async (cod_libro_diario) => {
    if (!window.confirm('¿Está seguro de eliminar este registro?')) return;
    
    try {
      const response = await fetch(`http://localhost:4000/api/Librodiario/${cod_libro_diario}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Error al eliminar el registro');

      setSuccess('Registro eliminado con éxito');
      await fetchRegistros();
    } catch (err) {
      setError('Error al eliminar: ' + err.message);
    }
  };

  


  const handleEdit = (registro) => {
    setFormData({
      Fecha: registro.Fecha.split('T')[0],
      Descripcion: registro.Descripcion,
      Cod_cuenta: registro.Cod_cuenta,
      Monto: registro.Monto.toString(),
      Tipo_transaccion: registro.Tipo_transaccion
    });
    setEditingId(registro.cod_libro_diario);
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const generatePDF = async () => {
    try {
      const doc = new jsPDF();
      
      // Encabezado
      doc.setFillColor(34, 197, 94);
      doc.rect(0, 0, doc.internal.pageSize.width, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.text("SAINT PATRICK'S ACADEMY", doc.internal.pageSize.width/2, 20, { align: 'center' });
      doc.setFontSize(16);
      doc.text("Libro Diario", doc.internal.pageSize.width/2, 30, { align: 'center' });
      
      // Datos de la tabla
      const tableColumn = ["Fecha", "Descripción", "Cuenta", "Monto", "Tipo"];
      const tableRows = registros.map(registro => [
        new Date(registro.Fecha).toLocaleDateString(),
        registro.Descripcion,
        `${registro.Cod_cuenta} - ${cuentasMap[registro.Cod_cuenta] || 'Sin nombre'}`,
        `$${parseFloat(registro.Monto).toLocaleString('es-ES', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })}`,
        registro.Tipo_transaccion
      ]);

      doc.autoTable({
        startY: 50,
        head: [tableColumn],
        body: tableRows,
        theme: 'grid',
        headStyles: {
          fillColor: [34, 197, 94],
          textColor: [255, 255, 255],
          fontSize: 12
        },
        styles: {
          fontSize: 10,
          cellPadding: 5
        }
      });
      
      doc.save('libro-diario.pdf');
      setSuccess('PDF generado exitosamente');
    } catch (err) {
      setError('Error al generar PDF: ' + err.message);
    }
  };


  return (
    <div className="libro-diario">
      <div className="header">
        <h1>Libro Diario</h1>
      </div>

      {error && (
        <div className="alert error">
          {error}
          <button className="close-button" onClick={() => setError(null)}>×</button>
        </div>
      )}

      {success && (
        <div className="alert success">
          {success}
          <button className="close-button" onClick={() => setSuccess(null)}>×</button>
        </div>
      )}

      <form onSubmit={handleSubmit} className={`form ${editingId ? 'editing' : ''}`}>
        <div className="form-grid">
          <div className="input-group">
            <label htmlFor="fecha">Fecha:</label>
            <input
              id="fecha"
              type="date"
              value={formData.Fecha}
              onChange={(e) => setFormData({...formData, Fecha: e.target.value})}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="descripcion">Descripción:</label>
            <input
              id="descripcion"
              type="text"
              value={formData.Descripcion}
              onChange={(e) => setFormData({...formData, Descripcion: e.target.value})}
              placeholder="Ingrese la descripción"
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="cuenta">Cuenta:</label>
            <select
              id="cuenta"
              value={formData.Cod_cuenta}
              onChange={(e) => setFormData({...formData, Cod_cuenta: e.target.value})}
              required
            >
              <option value="">Seleccione una cuenta</option>
              {cuentas.map((cuenta) => (
                <option key={cuenta.Cod_cuenta} value={cuenta.Cod_cuenta}>
                  {cuenta.Cod_cuenta} - {cuenta.Nombre_cuenta || 'Sin nombre'}
                </option>
              ))}
            </select>
          </div>

          <div className="input-group">
            <label htmlFor="monto">Monto:</label>
            <input
              id="monto"
              type="number"
              value={formData.Monto}
              onChange={(e) => setFormData({...formData, Monto: e.target.value})}
              placeholder="0.00"
              step="0.01"
              min="0"
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="tipo">Tipo de Transacción:</label>
            <select
              id="tipo"
              value={formData.Tipo_transaccion}
              onChange={(e) => setFormData({...formData, Tipo_transaccion: e.target.value})}
              required
            >
              <option value="">Seleccione el tipo</option>
              <option value="Ingreso">Ingreso</option>
              <option value="Egreso">Egreso</option>
            </select>
          </div>
        </div>

        <div className="button-group">
          <button type="submit" className="btn primary">
            {editingId ? 'Actualizar Registro' : 'Agregar Registro'}
          </button>
          
          {editingId && (
            <button 
              type="button" 
              className="btn secondary"
              onClick={() => {
                setEditingId(null);
                setFormData({
                  Fecha: '',
                  Descripcion: '',
                  Cod_cuenta: '',
                  Monto: '',
                  Tipo_transaccion: ''
                });
              }}
            >
              Cancelar Edición
            </button>
          )}
          
          <button 
            type="button" 
            onClick={generatePDF} 
            className="btn secondary"
          >
            Generar PDF
          </button>
        </div>
      </form>

      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
          <p>Cargando registros...</p>
        </div>
      ) : registros.length === 0 ? (
        <div className="empty-state">
          <p>No hay registros disponibles</p>
          <p>Comience agregando un nuevo registro</p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Descripción</th>
                <th>Cuenta</th>
                <th>Monto</th>
                <th>Tipo</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {registros.map((registro) => (
                <tr 
                  key={registro.cod_libro_diario}
                  className={registro.cod_libro_diario === editingId ? 'editing-row' : ''}
                >
                  <td>{new Date(registro.Fecha).toLocaleDateString()}</td>
                  <td>{registro.Descripcion}</td>
                  <td>
                    {registro.Cod_cuenta} - {cuentasMap[registro.Cod_cuenta] || 'Sin nombre'}
                  </td>
                  <td className={registro.Tipo_transaccion === 'Ingreso' ? 'monto-ingreso' : 'monto-egreso'}>
                    ${parseFloat(registro.Monto).toLocaleString('es-ES', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                  </td>
                  <td>
                    <span className={`badge ${registro.Tipo_transaccion.toLowerCase()}`}>
                      {registro.Tipo_transaccion}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => handleEdit(registro)}
                        className="btn edit"
                        title="Editar registro"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(registro.cod_libro_diario)}
                        className="btn delete"
                        title="Eliminar registro"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

<style jsx>{`
        .libro-diario {
          max-width: 1200px;
          margin: 0 auto;
        }

        .form {
          background: white;
          padding: 1.5rem;
          border-radius: 0.5rem;
          border: 1px solid #e5e7eb;
          margin-bottom: 1.5rem;
        }

        .form.editing {
          border-color: #22c55e;
          background-color: #f0fdf4;
        }

        .input-group label {
          color: #374151;
          font-weight: 500;
          margin-bottom: 0.5rem;
        }

        input, select {
          border: 1px solid #e5e7eb;
          border-radius: 0.375rem;
          padding: 0.5rem;
          width: 100%;
        }

        input:focus, select:focus {
          border-color: #22c55e;
          box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.1);
          outline: none;
        }

        .btn {
          padding: 0.5rem 1rem;
          border-radius: 0.375rem;
          font-weight: 500;
          transition: all 0.2s;
        }

        .btn.primary {
          background-color: #22c55e;
          color: white;
        }

        .btn.primary:hover {
          background-color: #16a34a;
        }

        .table-container {
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          overflow: hidden;
        }

        table th {
          background-color: #f9fafb;
          color: #374151;
          font-weight: 600;
          text-align: left;
          padding: 0.75rem 1rem;
        }

        table td {
          padding: 0.75rem 1rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .badge {
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .badge.ingreso {
          background-color: #dcfce7;
          color: #166534;
        }

        .badge.egreso {
          background-color: #fee2e2;
          color: #991b1b;
        }

        .monto-ingreso {
          color: #16a34a;
        }

        .monto-egreso {
          color: #dc2626;
        }

        .alert {
          border-radius: 0.375rem;
          padding: 0.75rem 1rem;
          margin-bottom: 1rem;
        }

        .alert.success {
          background-color: #f0fdf4;
          border: 1px solid #22c55e;
          color: #166534;
        }

        .alert.error {
          background-color: #fef2f2;
          border: 1px solid #dc2626;
          color: #991b1b;
        }
      `}</style>
    </div>
  );
};


export default LibroDiario;