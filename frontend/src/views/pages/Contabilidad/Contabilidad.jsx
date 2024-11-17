import React, { useState, useEffect } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import Swal from 'sweetalert2';
import usePermission from '../../../../context/usePermission';
import AccessDenied from "../AccessDenied/AccessDenied";
import '../Contabilidad/Contabilidad.css';
import logo from 'src/assets/brand/logo_saint_patrick.png';


const CatalogoContable = () => {
  const [canCreate, setCanCreate] = useState(true);
  const { canSelect, canUpdate, canDelete } = usePermission('Contabilidad');
  const [cuentas, setCuentas] = useState([]);
  const [filteredCuentas, setFilteredCuentas] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCuenta, setEditingCuenta] = useState(null);

  const initialFormState = {
    Cod_cuenta: '',
    Nombre_cuenta: '',
    Descripcion: '',
    Tipo_Cuenta: 'ACTIVO',
    Naturaleza_cuenta: 'DEUDORA',
    Estado_Situacion_Financiera: 'BALANCE GENERAL',
    Nivel: '1'
  };


  useEffect(() => {
    fetchCuentas();
  }, []);

   useEffect(() => {
    setFilteredCuentas(
      cuentas.filter(cuenta => 
        cuenta.Nombre_cuenta?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cuenta.Cod_cuenta?.toString().includes(searchTerm.toLowerCase())
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

    // Manejar la creación de una nueva cuenta
    const handleCreateAccount = () => {
      // Inicializa los campos del formulario con valores vacíos
      setEditingCuenta({
        Cod_cuenta: '', // o null si no necesitas un código predeterminado
        Nombre_cuenta: '',
        Descripcion: '',
        Tipo_Cuenta: 'ACTIVO', // Valor predeterminado
        Naturaleza_cuenta: 'DEUDORA', // Valor predeterminado
        Estado_Situacion_Financiera: 'BALANCE GENERAL', // Valor predeterminado
        Nivel: '1', // Valor predeterminado
      });
      setShowEditModal(true); // Mostrar el modal para crear cuenta
    };
    

    const handleEdit = (cuenta) => {
      setEditingCuenta({
        ...cuenta,
        Tipo_Cuenta: cuenta.Tipo_Cuenta || 'ACTIVO',
        Naturaleza_cuenta: cuenta.Naturaleza_cuenta || 'DEUDORA',
        Estado_Situacion_Financiera: cuenta.Estado_Situacion_Financiera || 'BALANCE GENERAL',
        Nivel: cuenta.Nivel || '1'
      });
      setShowEditModal(true);
    };
    const handleDelete = async (cuenta) => {
      Swal.fire({
        title: '¿Está seguro?',
        text: "No podrá revertir esta acción!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminar!',
        cancelButtonText: 'Cancelar'
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            await axios.delete(`http://localhost:4000/api/catalogoCuentas/${cuenta.Cod_cuenta}`, {
              headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
              }
            });
            Swal.fire(
              'Eliminado!',
              'La cuenta ha sido eliminada.',
              'success'
            );
            fetchCuentas();
          } catch (err) {
            Swal.fire(
              'Error!',
              'Error al eliminar la cuenta: ' + err.message,
              'error'
            );
          }
        }
      });
    };
    const handleSubmit = async (e) => {
      e.preventDefault();
      
      const cuentaData = {
        nombre_cuenta: editingCuenta.Nombre_cuenta,
        descripcion: editingCuenta.Descripcion,
        tipo: editingCuenta.Tipo_Cuenta,
        naturaleza_cuenta: editingCuenta.Naturaleza_cuenta,  // Asegúrate de que esté aquí
        estado_sf: editingCuenta.Estado_Situacion_Financiera,
        nivel: editingCuenta.Nivel
      };
  
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          Swal.fire({
            icon: 'error',
            title: 'Error de autenticación',
            text: 'No estás autenticado. Inicia sesión para continuar.'
          });
          return;
        }
  
        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };
  
        let response;
        if (editingCuenta.Cod_cuenta) {
          response = await axios.put(
            `http://localhost:4000/api/catalogoCuentas/${editingCuenta.Cod_cuenta}`,
            cuentaData,
            { headers }
          );
        } else {
          response = await axios.post(
            'http://localhost:4000/api/catalogoCuentas',
            cuentaData,
            { headers }
          );
        }
  
        if (response.status === 200 || response.status === 201) {
          setShowEditModal(false);
          fetchCuentas();
          setEditingCuenta(initialFormState);
          
          Swal.fire({
            icon: 'success',
            title: '¡Éxito!',
            text: editingCuenta.Cod_cuenta ? 'Cuenta actualizada exitosamente' : 'Cuenta creada exitosamente',
            showConfirmButton: false,
            timer: 1500
          });
        }
      } catch (error) {
        console.error('Error:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.response?.data?.message || 'Error al procesar la solicitud'
        });
      }
    };

    // Función para generar datos del gráfico
const generateChartData = (filteredCuentas) => {
  // Agrupar cuentas por nivel
  const countByLevel = filteredCuentas.reduce((acc, cuenta) => {
      const nivel = cuenta.Nivel;
      acc[nivel] = (acc[nivel] || 0) + 1;
      return acc;
  }, {});

  // Convertir a arrays para el gráfico
  const labels = Object.keys(countByLevel).sort((a, b) => a - b);
  const data = labels.map(level => countByLevel[level]);

  return {
      labels,
      data
  };
};


const exportToPDF = () => {
  const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
  });
  
  const img = new Image();
  img.src = logo;
  
  img.onload = () => {
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      
      // Función para añadir marca de agua
      const addWatermark = () => {
          const fontSize = 50;
          const text = 'CONFIDENCIAL';
          
          doc.saveGraphicsState();
          doc.setGState(new doc.GState({ opacity: 0.15 }));
          doc.setTextColor(220, 53, 69);
          doc.setFontSize(fontSize);
          doc.setFont('helvetica', 'bold');
          
          doc.text(text, pageWidth / 2, pageHeight / 2, {
              angle: -45,
              align: 'center',
              renderingMode: 'fill'
          });
          
          doc.restoreGraphicsState();
      };

      // Insertar el logo
      doc.addImage(img, 'PNG', 10, 10, 25, 25);
      
      // Encabezado del reporte
      doc.setTextColor(22, 160, 133);
      doc.setFontSize(18);
      doc.text("SAINT PATRICK'S ACADEMY", pageWidth / 2, 20, { align: 'center' });
      doc.setFontSize(14);
      doc.text('Catálogo de Cuentas Contables', pageWidth / 2, 30, { align: 'center' });
      
      // Detalles de la institución
      doc.setFontSize(8);
      doc.setTextColor(68, 68, 68);
      doc.text('Casa Club del periodista, Colonia del Periodista', pageWidth / 2, 40, { align: 'center' });
      doc.text('Teléfono: (504) 2234-8871', pageWidth / 2, 45, { align: 'center' });
      doc.text('Correo: info@saintpatrickacademy.edu', pageWidth / 2, 50, { align: 'center' });

      // Información del usuario y fecha
      const usuario = localStorage.getItem('nombreUsuario') || 'Usuario del Sistema';
      doc.setFontSize(8);
      doc.text(`Generado por: ${usuario}`, 15, 60);
      doc.text(`Fecha: ${new Date().toLocaleDateString('es-HN')}`, pageWidth - 15, 60, { align: 'right' });

      // Añadir marca de agua
      addWatermark();

      // Tabla principal
      doc.autoTable({
          startY: 70,
          head: [['Código', 'Nombre', 'Naturaleza', 'Nivel']],
          body: filteredCuentas.map(cuenta => [
              cuenta.Cod_cuenta,
              cuenta.Nombre_cuenta,
              cuenta.Naturaleza_cuenta,
              cuenta.Nivel
          ]),
          styles: {
              fontSize: 8,
              textColor: [68, 68, 68],
              cellPadding: 4
          },
          headStyles: {
              fillColor: [22, 160, 133],
              textColor: [255, 255, 255],
              fontSize: 9,
              fontStyle: 'bold',
              halign: 'center',
              cellPadding: { top: 4, bottom: 4, left: 3, right: 3 }
          },
          columnStyles: {
              0: { halign: 'center', cellWidth: 25 },
              1: { cellWidth: 85 },
              2: { halign: 'center', cellWidth: 35 },
              3: { halign: 'center', cellWidth: 20 }
          },
          alternateRowStyles: {
              fillColor: [240, 248, 255]
          },
          margin: { top: 10, right: 10, bottom: 30, left: 10 },
          didDrawPage: function(data) {
              addWatermark();
              // Insertar el logo en cada página nueva
              doc.addImage(img, 'PNG', 10, 10, 25, 25);
              
              // Pie de página
              doc.setFontSize(8);
              doc.setTextColor(100);
              const date = new Date().toLocaleDateString('es-HN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
              });
              doc.text(`Fecha de generación: ${date}`, 10, pageHeight - 10);
              doc.text(`Página ${data.pageNumber}/${doc.getNumberOfPages()}`, 
                  pageWidth - 10, pageHeight - 10, { align: 'right' });
          }
      });

      // Gráfico de distribución
      const finalY = doc.lastAutoTable.finalY + 15;
      
      // Título del gráfico
      doc.setFillColor(22, 160, 133);
      doc.rect(10, finalY, pageWidth - 20, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.text('Distribución de Cuentas por Nivel', pageWidth/2, finalY + 5.5, { align: 'center' });

      // Generar datos del gráfico
      const chartData = generateChartData(filteredCuentas);
      const maxValue = Math.max(...chartData.data);
      const barWidth = 20;
      const barMaxHeight = 40;
      let x = (pageWidth - (chartData.labels.length * (barWidth + 10))) / 2;

      // Dibujar barras
      chartData.labels.forEach((label, index) => {
          const barHeight = (chartData.data[index] / maxValue) * barMaxHeight;
          
          // Barra
          doc.setFillColor(22, 160, 133);
          doc.rect(x, finalY + 15 + (barMaxHeight - barHeight), barWidth, barHeight, 'F');
          
          // Etiquetas
          doc.setFontSize(8);
          doc.setTextColor(68, 68, 68);
          doc.text(`Nivel ${label}`, x + barWidth/2, finalY + barMaxHeight + 20, { align: 'center' });
          doc.text(chartData.data[index].toString(), x + barWidth/2, 
              finalY + 12 + (barMaxHeight - barHeight), { align: 'center' });
          
          x += barWidth + 10;
      });

      // Guardar el PDF
      doc.save('Catalogo_Cuentas.pdf');
  };
  
  img.onerror = () => {
      Swal.fire('Error', 'No se pudo cargar el logo.', 'error');
  };
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
          {/* Botón para abrir el formulario de creación de cuenta */}
          {canCreate && (
                <button onClick={handleCreateAccount} className="btn btn-primary">
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
            <h2 className="modal-title">
              {editingCuenta.Cod_cuenta ? "Editar Cuenta Contable" : "Crear Nueva Cuenta Contable"}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="Nombre_cuenta">Nombre Cuenta *</label>
                <input
                  type="text"
                  id="Nombre_cuenta"
                  value={editingCuenta.Nombre_cuenta}
                  onChange={(e) => setEditingCuenta({
                    ...editingCuenta,
                    Nombre_cuenta: e.target.value
                  })}
                  required
                  className="form-input"
                />
              </div>


        {/* Campo Descripción */}
        <div className="form-group">
                <label htmlFor="Descripcion">Descripción *</label>
                <input
                  type="text"
                  id="Descripcion"
                  value={editingCuenta.Descripcion}
                  onChange={(e) => setEditingCuenta({
                    ...editingCuenta,
                    Descripcion: e.target.value
                  })}
                  required
                  className="form-input"
                />
              </div>


        {/* Campo Tipo Cuenta */}
     
        <div className="form-group">
                <label htmlFor="Tipo_Cuenta">Tipo Cuenta *</label>
                <select
                  id="Tipo_Cuenta"
                  value={editingCuenta.Tipo_Cuenta}
                  onChange={(e) => setEditingCuenta({
                    ...editingCuenta,
                    Tipo_Cuenta: e.target.value
                  })}
                  required
                  className="form-select"
                >
                  <option value="ACTIVO">ACTIVO</option>
                  <option value="PASIVO">PASIVO</option>
                  <option value="PATRIMONIO">PATRIMONIO</option>
                </select>
              </div>
        {/* Campo Naturaleza Cuenta */}
        <div className="form-group">
                <label htmlFor="Estado_Situacion_Financiera">Estado de Situación Financiera *</label>
                <select
                  id="Estado_Situacion_Financiera"
                  value={editingCuenta.Estado_Situacion_Financiera}
                  onChange={(e) => setEditingCuenta({
                    ...editingCuenta,
                    Estado_Situacion_Financiera: e.target.value
                  })}
                  required
                  className="form-select"
                >
                  <option value="BALANCE GENERAL">BALANCE GENERAL</option>
                  <option value="ESTADO DE RESULTADO">ESTADO DE RESULTADOS</option>
                </select>
              </div>

              <div className="form-group">
    <label htmlFor="Naturaleza_cuenta">Naturaleza de la Cuenta *</label>
    <select
      id="Naturaleza_cuenta"
      value={editingCuenta.Naturaleza_cuenta}
      onChange={(e) => setEditingCuenta({
        ...editingCuenta,
        Naturaleza_cuenta: e.target.value
      })}
      required
      className="form-select"
    >
      <option value="ACREEDORA">ACREEDORA</option>
      <option value="DEUDORA">DEUDORA</option>
    </select>
  </div>


        {/* Campo Nivel */}
        <div className="form-group">
                <label htmlFor="Nivel">Nivel *</label>
                <select
                  id="Nivel"
                  value={editingCuenta.Nivel}
                  onChange={(e) => setEditingCuenta({
                    ...editingCuenta,
                    Nivel: e.target.value
                  })}
                  required
                  className="form-select"
                >
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                </select>
              </div>

        {/* Mostrar errores */}
        {error && <div className="error-message">{error}</div>}

        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            {editingCuenta.Cod_cuenta ? "Actualizar Cuenta" : "Crear Cuenta"}
          </button>
          <button
            type="button"
            onClick={() => setShowEditModal(false)}
            className="btn btn-secondary"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  </div>
)}






      </div>
    </div>
  );
  
};

export default CatalogoContable;