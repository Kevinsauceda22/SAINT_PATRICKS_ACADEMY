import React, { useState, useEffect } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Plus } from 'lucide-react';
import usePermission from '../../../../context/usePermission';
import AccessDenied from "../AccessDenied/AccessDenied";
import '../Contabilidad/Contabilidad.css';


const CatalogoContable = () => {
  const [canCreate, setCanCreate] = useState(true);  // Asegúrate de que esto sea true para ver el botón

  const { canSelect, canUpdate, canDelete } = usePermission('Contabilidad');
  const [cuentas, setCuentas] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const [filteredCuentas, setFilteredCuentas] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCuenta, setEditingCuenta] = useState(null);

  

  useEffect(() => {
    fetchCuentas();
  }, []);

  useEffect(() => {
    setFilteredCuentas(
      cuentas.filter(cuenta => 
        cuenta.Nombre_cuenta?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cuenta.Cod_cuenta?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm, cuentas]);

  
  const fetchCuentas = async () => {
    try {
      const response = await axios.get('http://localhost:4000/api/catalogoCuentas', {
        headers: {
          'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
      });
      setCuentas(response.data);
      setFilteredCuentas(response.data);
    } catch (err) {
      setError('Error al cargar el catálogo de cuentas: ' + err.message);
    }
  };

  const handleCreate = () => {
    setEditingCuenta({
      Cod_cuenta: '',
      Nombre_cuenta: '',
      Descripcion: '',
      Naturaleza_cuenta: 'DEUDORA',
      Nivel: '1'
    });
    setShowEditModal(true);
  };

  const handleEdit = (cuenta) => {
    setEditingCuenta(cuenta);
    setShowEditModal(true);
  };

  const handleDelete = async (cuenta) => {
    if (window.confirm('¿Está seguro de eliminar esta cuenta?')) {
      try {
        await axios.delete(`http://localhost:4000/api/catalogoCuentas/${cuenta.Cod_cuenta}`, {
          headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
          }
        });
        fetchCuentas();
      } catch (err) {
        setError('Error al eliminar la cuenta: ' + err.message);
      }
    }
  };

 
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCuenta.Cod_cuenta) {
        await axios.put(
          `http://localhost:4000/api/catalogoCuentas/${editingCuenta.Cod_cuenta}`,
          editingCuenta,
          {
            headers: {
              'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
          }
        );
      } else {
        await axios.post(
          'http://localhost:4000/api/catalogoCuentas',
          editingCuenta,
          {
            headers: {
              'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
          }
        );
      }
      setShowEditModal(false);
      fetchCuentas();
    } catch (err) {
      setError('Error al guardar la cuenta: ' + err.message);
    }
  };
 // Función que maneja la creación de la cuenta
 const handleCreateAccount = () => {
  setShowCreateForm(true);
  // Aquí puedes agregar más lógica, como redirigir a otro formulario, etc.
  console.log('Creando nueva cuenta');
};


  const generateChartData = () => {
    const niveles = {};
    cuentas.forEach(cuenta => {
      niveles[cuenta.Nivel] = (niveles[cuenta.Nivel] || 0) + 1;
    });

    return {
      labels: Object.keys(niveles),
      data: Object.values(niveles)
    };
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    
    const colorVerdePrimario = [46, 125, 50];
    const colorVerdeSecundario = [129, 199, 132];
    
    doc.setFillColor(...colorVerdePrimario);
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.text('Catálogo de Cuentas Contables', pageWidth/2, 25, { align: 'center' });
    
    const usuario = localStorage.getItem('nombreUsuario') || 'Usuario del Sistema';
    doc.setFontSize(11);
    doc.setTextColor(80);
    doc.text(`Generado por: ${usuario}`, 15, 50);
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, pageWidth - 15, 50, { align: 'right' });
    
    const ofuscarDato = (texto) => {
      if (!texto) return '';
      return texto.length > 4 ? texto.substring(0, 2) + '*'.repeat(texto.length - 4) + texto.slice(-2) : texto;
    };
  
    const tableColumn = ["Código", "Nombre", "Naturaleza", "Nivel"];
    
    const tableRows = filteredCuentas.map(cuenta => [
      cuenta.Cod_cuenta,
      cuenta.Nombre_cuenta,
      cuenta.Naturaleza_cuenta,
      cuenta.Nivel
    ]);
  
    doc.autoTable({
      startY: 60,
      head: [tableColumn],
      body: tableRows,
      theme: 'grid',
      styles: {
        fontSize: 9,
        cellPadding: 5,
      },
      headStyles: {
        fillColor: colorVerdePrimario,
        textColor: 255,
        fontSize: 10,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [240, 247, 240],
      },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 'auto' },
        2: { cellWidth: 40 },
        3: { cellWidth: 25 },
      },
    });
  
    const chartData = generateChartData();
    const chartStartY = doc.lastAutoTable.finalY + 20;
  
    doc.setFillColor(...colorVerdeSecundario);
    doc.rect(15, chartStartY, pageWidth - 30, 10, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.text('Distribución de Cuentas por Nivel', pageWidth/2, chartStartY + 7, { align: 'center' });
  
    const maxValue = Math.max(...chartData.data);
    const barWidth = 20;
    const barMaxHeight = 60;
    let x = 30;
  
    chartData.labels.forEach((label, index) => {
      const barHeight = (chartData.data[index] / maxValue) * barMaxHeight;
      
      doc.setFillColor(...colorVerdePrimario);
      doc.rect(x, chartStartY + 20 + (barMaxHeight - barHeight), barWidth, barHeight, 'F');
      
      doc.setFontSize(8);
      doc.setTextColor(80);
      doc.text(`Nivel ${label}`, x + barWidth/2, chartStartY + barMaxHeight + 30, { align: 'center' });
      
      doc.text(chartData.data[index].toString(), x + barWidth/2, chartStartY + 15 + (barMaxHeight - barHeight), { align: 'center' });
      
      x += barWidth + 15;
    });
  
    const pageCount = doc.internal.getNumberOfPages();
    doc.setFontSize(8);
    doc.setTextColor(100);
    for(let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.text(
        `Página ${i} de ${pageCount} - Documento generado el ${new Date().toLocaleDateString()}`,
        pageWidth/2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
    }
  
    doc.setTextColor(230);
    doc.setFontSize(60);
    doc.text('CONFIDENCIAL', pageWidth/2, doc.internal.pageSize.height/2, {
      align: 'center',
      angle: 45
    });
  
    doc.save('catalogo-cuentas.pdf');
  };

  if (!canSelect) {
    return <AccessDenied />;
  }

  
  return (
    <div className="catalogo-container">
      <div className="catalogo-card">
        {/* Agregamos el botón "Crear nueva cuenta" arriba del encabezado */}
        <div className="button-container-top">
         
        </div>
  
        <div className="catalogo-header">
          <h1 className="catalogo-title">Catálogo de Cuentas</h1>
          <div className="button-container">
          {canCreate && (
      <button
        onClick={handleCreateAccount}
        className="btn btn-primary"
      >
        <Plus className="icon" />
        Crear Cuenta Contable
      </button>
    )}
        
            <button
              onClick={exportToPDF}
              className="btn btn-secondary"
            >
              Exportar PDF
            </button>
          </div>
        </div>
  
        <div className="catalogo-content">
          {error && <div className="error-message">{error}</div>}
          
          <div className="search-container">
            <input
              type="text"
              className="search-input"
              placeholder="Buscar por código o nombre de cuenta..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
  
          <div className="table-container">
            <table className="catalogo-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Nombre</th>
                  <th>Descripción</th>
                  <th>Naturaleza</th>
                  <th>Nivel</th>
                  <th>Fecha</th>
                  {(canUpdate || canDelete) && <th>Acciones</th>}
                </tr>
              </thead>
              <tbody>
                {filteredCuentas.map(cuenta => (
                  <tr key={cuenta.Cod_cuenta}>
                    <td>{cuenta.Cod_cuenta}</td>
                    <td>{cuenta.Nombre_cuenta}</td>
                    <td>{cuenta.Descripcion}</td>
                    <td>{cuenta.Naturaleza_cuenta}</td>
                    <td>{cuenta.Nivel}</td>
                    <td>{new Date(cuenta.Fecha_creacion).toLocaleDateString('es-ES', {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
})}</td>

                    {(canUpdate || canDelete) && (
                      <td>
                        <div className="table-actions">
                          {canUpdate && (
                            <button
                              onClick={() => handleEdit(cuenta)}
                              className="btn btn-warning"
                            >
                              Editar
                            </button>
                          )}
                          {canDelete && (
                            <button
                              onClick={() => handleDelete(cuenta)}
                              className="btn btn-danger"
                            >
                              Eliminar
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {showEditModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <form onSubmit={handleSubmit}>
                <div className="form-group">
               
                </div>
                <div className="form-group">
                  <label className="form-label">Nombre</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editingCuenta.Nombre_cuenta}
                    onChange={(e) => setEditingCuenta({ ...editingCuenta, Nombre_cuenta: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Descripción</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editingCuenta.Descripcion}
                    onChange={(e) => setEditingCuenta({ ...editingCuenta, Descripcion: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Naturaleza</label>
                  <select
                    className="form-select"
                    value={editingCuenta.Naturaleza_cuenta}
                    onChange={(e) => setEditingCuenta({ ...editingCuenta, Naturaleza_cuenta: e.target.value })}
                  >
                    <option value="DEUDORA">Deudora</option>
                    <option value="ACREEDORA">Acreedora</option>
                  </select>
                </div>
                <button type="submit" className="btn btn-primary">
                  Guardar
                </button>
              </form>
              <button onClick={() => setShowEditModal(false)} className="btn btn-secondary">
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
  
};

export default CatalogoContable;