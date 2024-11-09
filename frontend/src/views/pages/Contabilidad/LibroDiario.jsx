import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { AlertCircle, Check, FileText, Edit2, Trash2, Calendar, DollarSign, List } from 'lucide-react';
import './LibroDiario.css';



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
  const [formErrors, setFormErrors] = useState({});
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

  const validateForm = () => {
    const errors = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(formData.Fecha);
    selectedDate.setHours(0, 0, 0, 0);

    if (selectedDate > today) {
      errors.Fecha = "No se puede seleccionar una fecha futura";
    }

    if (!formData.Descripcion.trim()) {
      errors.Descripcion = "La descripción es requerida";
    }

    if (!formData.Cod_cuenta) {
      errors.Cod_cuenta = "Debe seleccionar una cuenta";
    }

    if (!formData.Monto || parseFloat(formData.Monto) <= 0) {
      errors.Monto = "El monto debe ser mayor a 0";
    }

    if (!formData.Tipo_transaccion) {
      errors.Tipo_transaccion = "Debe seleccionar un tipo de transacción";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    if (!validateForm()) {
      return;
    }
    
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
      setFormErrors({});
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const generatePDF = () => {
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
      
      const tableColumn = ["Fecha", "Descripción", "Cuenta", "Monto (L)", "Tipo"];
      const tableRows = registros.map(registro => [
        new Date(registro.Fecha).toLocaleDateString(),
        registro.Descripcion,
        `${registro.Cod_cuenta} - ${cuentasMap[registro.Cod_cuenta] || 'Sin nombre'}`,
        `L ${parseFloat(registro.Monto).toLocaleString('es-HN', {
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
    <div className="max-w-7xl mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Libro Diario</h1>
        <p className="text-gray-600 mt-1">Gestión de transacciones diarias</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-400 rounded-lg flex items-center">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
          <p className="text-red-700">{error}</p>
          <button className="ml-auto text-red-700" onClick={() => setError(null)}>×</button>
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-400 rounded-lg flex items-center">
          <Check className="h-5 w-5 text-green-500 mr-2" />
          <p className="text-green-700">{success}</p>
          <button className="ml-auto text-green-700" onClick={() => setSuccess(null)}>×</button>
        </div>
      )}

      <form onSubmit={handleSubmit} className={`bg-white rounded-lg shadow p-6 mb-6 ${editingId ? 'border-2 border-green-500' : 'border border-gray-200'}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="flex items-center text-sm font-medium text-gray-700">
              <Calendar className="w-4 h-4 mr-2" />
              Fecha
            </label>
            <input
              type="date"
              max={new Date().toISOString().split('T')[0]}
              value={formData.Fecha}
              onChange={(e) => setFormData({...formData, Fecha: e.target.value})}
              className={`w-full rounded-md border ${formErrors.Fecha ? 'border-red-500' : 'border-gray-300'} 
                       px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500`}
            />
            {formErrors.Fecha && (
              <p className="text-red-500 text-xs mt-1">{formErrors.Fecha}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="flex items-center text-sm font-medium text-gray-700">
              <List className="w-4 h-4 mr-2" />
              Descripción
            </label>
            <input
              type="text"
              value={formData.Descripcion}
              onChange={(e) => setFormData({...formData, Descripcion: e.target.value})}
              className={`w-full rounded-md border ${formErrors.Descripcion ? 'border-red-500' : 'border-gray-300'} 
                       px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500`}
              placeholder="Ingrese la descripción"
            />
            {formErrors.Descripcion && (
              <p className="text-red-500 text-xs mt-1">{formErrors.Descripcion}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="flex items-center text-sm font-medium text-gray-700">
              <FileText className="w-4 h-4 mr-2" />
              Cuenta
            </label>
            <select
              value={formData.Cod_cuenta}
              onChange={(e) => setFormData({...formData, Cod_cuenta: e.target.value})}
              className={`w-full rounded-md border ${formErrors.Cod_cuenta ? 'border-red-500' : 'border-gray-300'} 
                       px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500`}
            >
              <option value="">Seleccione una cuenta</option>
              {cuentas.map((cuenta) => (
                <option key={cuenta.Cod_cuenta} value={cuenta.Cod_cuenta}>
                  {cuenta.Cod_cuenta} - {cuenta.Nombre_cuenta || 'Sin nombre'}
                </option>
              ))}
            </select>
            {formErrors.Cod_cuenta && (
              <p className="text-red-500 text-xs mt-1">{formErrors.Cod_cuenta}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="flex items-center text-sm font-medium text-gray-700">
              <DollarSign className="w-4 h-4 mr-2" />
              Monto (L)
            </label>
            <input
              type="number"
              value={formData.Monto}
              onChange={(e) => setFormData({...formData, Monto: e.target.value})}
              className={`w-full rounded-md border ${formErrors.Monto ? 'border-red-500' : 'border-gray-300'} 
                       px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500`}
              placeholder="0.00"
              step="0.01"
              min="0"
            />
            {formErrors.Monto && (
              <p className="text-red-500 text-xs mt-1">{formErrors.Monto}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="flex items-center text-sm font-medium text-gray-700">
              <FileText className="w-4 h-4 mr-2" />
              Tipo de Transacción
            </label>
            <select
              value={formData.Tipo_transaccion}
              onChange={(e) => setFormData({...formData, Tipo_transaccion: e.target.value})}
              className={`w-full rounded-md border ${formErrors.Tipo_transaccion ? 'border-red-500' : 'border-gray-300'} 
                       px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500`}
            >
              <option value="">Seleccione el tipo</option>
              <option value="Ingreso">Ingreso</option>
              <option value="Egreso">Egreso</option>
              </select>
            {formErrors.Tipo_transaccion && (
              <p className="text-red-500 text-xs mt-1">{formErrors.Tipo_transaccion}</p>
            )}
          </div>

          <div className="flex items-end space-x-4">
            <button
              type="submit"
              className="bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200"
            >
              {editingId ? 'Actualizar' : 'Registrar'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setFormData({
                    Fecha: '',
                    Descripcion: '',
                    Cod_cuenta: '',
                    Monto: '',
                    Tipo_transaccion: ''
                  });
                  setFormErrors({});
                }}
                className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200"
              >
                Cancelar
              </button>
            )}
          </div>
        </div>
      </form>

      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Registros</h2>
          <button
            onClick={generatePDF}
            className="flex items-center bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200"
          >
            <FileText className="w-4 h-4 mr-2" />
            Generar PDF
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cuenta</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto (L)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    Cargando registros...
                  </td>
                </tr>
              ) : registros.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    No hay registros disponibles
                  </td>
                </tr>
              ) : (
                registros.map((registro) => (
                  <tr key={registro.cod_libro_diario}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(registro.Fecha).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{registro.Descripcion}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {registro.Cod_cuenta} - {cuentasMap[registro.Cod_cuenta] || 'Sin nombre'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        L {parseFloat(registro.Monto).toLocaleString('es-HN', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        registro.Tipo_transaccion === 'Ingreso' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {registro.Tipo_transaccion}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEdit(registro)}
                        className="text-green-600 hover:text-green-900"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(registro.cod_libro_diario)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LibroDiario;
              