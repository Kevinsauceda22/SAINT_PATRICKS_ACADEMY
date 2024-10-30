import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { CIcon } from '@coreui/icons-react';
import { cilSearch, cilBrushAlt, cilPen, cilTrash, cilPlus, cilSave, cilDescription } from '@coreui/icons';
import {
  CButton,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CFormSelect
} from '@coreui/react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const ListaHistoriales = () => {
  const [historiales, setHistoriales] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [nuevoHistorial, setNuevoHistorial] = useState({ Promedio_Anual: 0 });
  const [error, setError] = useState('');
  const [historialAEditar, setHistorialAEditar] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1); // Estado para la página actual
  const [itemsPerPage, setItemsPerPage] = useState(5); // Estado para los elementos por página

  useEffect(() => {
    fetchHistorial();
  }, []);

  const fetchHistorial = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/historialAcademico/historiales');
      const data = await response.json();
      setHistoriales(data);
    } catch (error) {
      console.error('Error al obtener los historiales:', error);
    }
  };

  const filteredHistoriales = historiales.filter(historial =>
    historial.Cod_historial_academico.toString().includes(searchTerm) ||
    historial.Cod_estado.toString().includes(searchTerm) ||
    historial.Grado.toLowerCase().includes(searchTerm.toLowerCase()) ||
    historial.Año_Academico.toString().includes(searchTerm) ||
    historial.Promedio_Anual.toString().includes(searchTerm) ||
    historial.Instituto.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Paginación: calcular los índices de los elementos que se van a mostrar
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentHistoriales = filteredHistoriales.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(filteredHistoriales.length / itemsPerPage);

  const handleInputChange = (e, field) => {
    let value = e.target.value;

    // Define el límite de caracteres para cada campo (excluyendo 'Instituto')
    const characterLimits = {
        Cod_historial_academico: 10, // Ejemplo límite
        Cod_estado: 10, // Ejemplo límite
        Instituto: 30
    };

    // Validación de longitud de caracteres
    if (characterLimits[field]) {
        if (value.length > characterLimits[field]) {
            setError(`El campo ${field} no puede tener más de ${characterLimits[field]} caracteres.`);
            return;
        }
    }

    // Validación para el campo Promedio_Anual
    if (field === 'Promedio_Anual') {
        const validNumber = /^\d*\.?\d*$/; // Solo permite números y un punto decimal
        if (value && !validNumber.test(value)) {
            setError('Por favor ingrese un valor numérico válido, incluyendo un punto decimal.');
            return;
        }
        // Validar que el valor esté entre 0 y 100
        if (value !== '' && (parseFloat(value) < 0 || parseFloat(value) > 100)) {
            setError('El Promedio Anual debe estar entre 0 y 100.');
            return;
        }
    }

    if ((field === 'Cod_historial_academico' || field === 'Cod_estado') && value) {
        const isNumeric = /^\d*$/.test(value);
        if (!isNumeric) {
            setError('Solo se permiten números en este campo.');
            return;
        }
    }

    // Convierte a mayúsculas si es un campo de texto como 'Grado' o 'Instituto'
    if (field === 'Grado' || field === 'Instituto') {
        value = value.toUpperCase();
    }

    setError('');
    setNuevoHistorial({ ...nuevoHistorial, [field]: value });
};
  

  const HistorialesSearch = () => {
  const [searchTerm, setSearchTerm] = useState(''); // Definimos el estado para el término de búsqueda
  };

  const handleClearSearch = () => {
    setSearchTerm(''); // Limpiar el término de búsqueda
  };

  const validateFields = () => {
    const { Cod_historial_academico, Cod_estado, Grado, Año_Academico, Promedio_Anual, Instituto } = nuevoHistorial;
    if (!Cod_historial_academico || !Cod_estado || !Grado || !Año_Academico || !Promedio_Anual || !Instituto) {
      setError('Por favor, complete todos los campos.');
      return false;
    }
    setError('');
    return true;
  };  

  const handleCreateHistorial = async () => {
    if (!validateFields()) return;
  
    try {
      const response = await fetch('http://localhost:4000/api/historialAcademico/crearhistorial', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(nuevoHistorial),
      });
  
      if (response.ok) {
        fetchHistorial();
        setModalVisible(false);
        setNuevoHistorial({ Promedio_Anual: 0 });
      } else {
        const errorData = await response.json();
        setError('Error en la creación: El Código de Historial o Código de Estado ya fue registrado');
      }
    } catch (error) {
      setError('Error al crear el historial: ' + error.message);
    }
  };
  

  const handleEditHistorial = (historial) => {
    setHistorialAEditar(historial);
    setNuevoHistorial({ ...historial }); // Copia el historial a nuevoHistorial
    setModalVisible(true);
  };

  const handleUpdateHistorial = async () => {
    if (error || !validateFields()) return;

    try {
      const response = await fetch('http://localhost:4000/api/historialAcademico/actualizarhistorial', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(nuevoHistorial),
      });

      if (response.ok) {
        fetchHistorial();
        setModalVisible(false);
        setHistorialAEditar(null);
        resetForm();// Llamar a la función para reiniciar el formulario
      } else {
        const errorData = await response.json();
        console.error('Error al actualizar el historial:', errorData);
      }
    } catch (error) {
      console.error('Error al actualizar el historial:', error);
    }
  };

  const resetForm = () => {
    setNuevoHistorial({ 
        Cod_historial_academico: '', // Asegúrate de que este campo esté vacío al resetear
        Cod_estado: '', 
        Grado: 'Seleccione una opción', // Asigna un valor predeterminado si aplica
        Año_Academico: 'Seleccione una opción',
        Promedio_Anual: 0,
        Instituto: ''
    }); 
    setError('');
    setHistorialAEditar(null);
  };

  const handleCancelModal = () => {
    resetForm(); // Reiniciar el formulario al cerrar el modal
    setModalVisible(false);
  };

  const handleDeleteHistorial = async (id) => {
    const confirmDelete = window.confirm('¿Estás seguro de que deseas eliminar este historial?');
    if (!confirmDelete) return;

    try {
      const response = await fetch(`http://localhost:4000/api/historialAcademico/eliminarhistorial`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ Cod_historial_academico: id }),
      });

      if (response.ok) {
        fetchHistorial();
      } else {
        const errorData = await response.json();
        console.error('Error al eliminar el historial:', errorData);
      }
    } catch (error) {
      console.error('Error al eliminar el historial:', error);
    }
  };

  const generarAnios = () => {
    const anios = [
      'Seleccione una opción',
      '2024',
      '2023',
      '2022',
      '2021',
      '2020',
      '2019',
      '2018',
      '2017',
      '2016',
      '2015',
      '2014',
      '2013',
      '2012',
      '2011',
      '2010',
      '2009',
      '2008',
      '2007',
      '2006',
      '2005',
      '2004',
      '2003',
      '2002',
      '2001',
      '2000'
    ];
    return anios;
  };
  
  const generarGrados = () => {
    const grados = [
      'Seleccione una opción',
      'PRIMER GRADO',
      'SEGUNDO GRADO',
      'TERCER GRADO',
      'CUARTO GRADO',
      'QUINTO GRADO',
      'SEXTO GRADO',
      'SÉPTIMO GRADO',
      'OCTAVO GRADO',
      'NOVENO GRADO',
      'DÉCIMO GRADO',
      'UNDÉCIMO GRADO',
      'DUODÉCIMO GRADO'
    ];
    return grados;
  };  

  const downloadPDF = () => {
    const doc = new jsPDF();
    
    // Cambia el color del texto a verde para el título
    doc.setTextColor(0, 128, 0); // Verde (RGB: 0, 128, 0)
    
    // Añadir título
    doc.text('Historiales Académicos', 14, 16);
    
    // Obtiene la altura del título
    const titleHeight = 10; // altura aproximada del título
    
    // Restablece el color de texto a negro para el resto del documento, si es necesario
    doc.setTextColor(0, 0, 0);
    
    // Dibuja la tabla en una posición más baja para evitar la superposición
    autoTable(doc, {
      startY: 20 + titleHeight, // Esto coloca la tabla justo debajo del título
      head: [['Código de Historial', 'Código de Estado', 'Grado', 'Año Académico', 'Promedio Anual', 'Fecha Registro', 'Instituto']],
      body: filteredHistoriales.map(historial => [
        historial.Cod_historial_academico,
        historial.Cod_estado,
        historial.Grado,
        historial.Año_Academico,
        historial.Promedio_Anual,
        new Date(historial.Fecha_Registro).toLocaleDateString('es-ES'),
        historial.Instituto
      ]),
      headStyles: {
        fillColor: [0, 128, 0], // Color verde en RGB para el fondo del encabezado
        textColor: [255, 255, 255], // Texto en blanco en RGB
        fontStyle: 'bold' // Negrita para el encabezado
      }
    });
    
    doc.save('historiales.pdf');
  };  

  const downloadExcel = () => {
    if (filteredHistoriales.length === 0) {
      alert('No hay datos para descargar');
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(filteredHistoriales.map(historial => ({
      'Código de Historial': historial.Cod_historial_academico,
      'Código de Estado': historial.Cod_estado,
      'Grado': historial.Grado,
      'Año Académico': historial.Año_Academico,
      'Promedio Anual': historial.Promedio_Anual,
      'Fecha Registro': new Date(historial.Fecha_Registro).toLocaleDateString('es-ES'),
      'Instituto': historial.Instituto
    })));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Historiales');

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, 'historiales.xlsx');
  };


  const handleGenerarReporte = () => {
    // Aquí puedes definir la lógica para generar el reporte que desees
    // Puede ser una descarga o visualización de un nuevo componente/modal, por ejemplo:
    console.log('Generando reporte...');
  };

  return (
    <CContainer>
            <h1>Mantenimiento Historiales</h1>
      {/* Botón de Agregar Historial arriba de la barra de búsqueda */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <CButton 
          style={{ backgroundColor: '#4B6251', color: 'white' }} 
          className="mb-3 mb-md-0 me-md-3"
          onClick={() => {
              resetForm(); // Asegúrate de resetear el formulario aquí
              setModalVisible(true);
          }}
          >
          <CIcon icon={cilPlus} /> Nuevo
        </CButton>
        <CButton
          style={{ backgroundColor: '#6C8E58', color: 'white' }}
        >
          <CIcon icon={cilDescription} /> Reporte
        </CButton>
      </div>

      {/* Botones de descarga separados */}
      <div className="mb-3">
        <CButton style={{ backgroundColor: '#4B6251', color: 'white' }} onClick={downloadPDF} className="me-2">PDF</CButton>
        <CButton style={{ backgroundColor: '#4B6251', color: 'white' }} onClick={downloadExcel}>Excel</CButton>
      </div>

      <div className="d-flex mb-3">
              <CInputGroupText>
              <CIcon icon={cilSearch} /> {/* Icono de lupa */}
              </CInputGroupText>
              <CFormInput
                placeholder="Buscar Historiales..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value.toUpperCase())} // Convierte a mayúsculas
                style={{ width: '200px' }} // Ajusta el ancho aquí
              />
              <CButton 
                onClick={handleClearSearch} // Función para limpiar el término de búsqueda
                style={{
                  border: '1px solid #ccc',
                  transition: 'all 0.1s ease-in-out', // Duración de la transición
                  backgroundColor: '#F3F4F7', // Color por defecto
                  color: '#343a40' // Color de texto por defecto
                }}>
                <CIcon icon={cilBrushAlt} /> Limpiar{/* Icono de escoba */}
              </CButton> {/* Botón para limpiar la búsqueda */}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', fontSize: 'small', marginBottom: '10px' }}>
        <span>Mostrar</span>
        <CFormSelect
          aria-label="Items por página"
          value={itemsPerPage}
          onChange={(e) => {
            setItemsPerPage(Number(e.target.value));
            setCurrentPage(1); 
          }}
          style={{ width: 'auto', margin: '0 8px' }}
        >
          <option value="5">5</option>
          <option value="10">10</option>
          <option value="20">20</option>
        </CFormSelect>
        <span>historiales</span>
      </div>

      <CTable striped bordered hover>
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell>Código de Historial</CTableHeaderCell>
            <CTableHeaderCell>Código de Estado</CTableHeaderCell>
            <CTableHeaderCell>Grado</CTableHeaderCell>
            <CTableHeaderCell>Año Académico</CTableHeaderCell>
            <CTableHeaderCell>Promedio Anual</CTableHeaderCell>
            <CTableHeaderCell>Fecha Registro</CTableHeaderCell>
            <CTableHeaderCell>Instituto</CTableHeaderCell>
            <CTableHeaderCell>Acciones</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {currentHistoriales.map(historial => (
            <CTableRow key={historial.Cod_historial_academico}>
              <CTableDataCell>{historial.Cod_historial_academico}</CTableDataCell>
              <CTableDataCell>{historial.Cod_estado}</CTableDataCell>
              <CTableDataCell>{historial.Grado}</CTableDataCell>
              <CTableDataCell>{historial.Año_Academico}</CTableDataCell>
              <CTableDataCell>{historial.Promedio_Anual}</CTableDataCell>
              <CTableDataCell>{new Date(historial.Fecha_Registro).toLocaleDateString('es-ES')}</CTableDataCell>
              <CTableDataCell>{historial.Instituto}</CTableDataCell>
              <CTableDataCell>
                <CButton color="warning" onClick={() => handleEditHistorial(historial)} className="me-2">
                  <CIcon icon={cilPen} />
                </CButton>
                <CButton color="danger" onClick={() => handleDeleteHistorial(historial.Cod_historial_academico)}>
                  <CIcon icon={cilTrash} />
                </CButton>
              </CTableDataCell>
            </CTableRow>
          ))}
        </CTableBody>
      </CTable>

      {/* Paginación debajo de la tabla */}
      <nav>
        <ul className="pagination justify-content-center align-items-center">
          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
            <button
              className="page-link"
              style={{ 
                backgroundColor: currentPage === 1 ? 'rgba(111, 129, 115, 0.5)' : '#6f8173', // Opaco si está deshabilitado
                color: '#D9EAD3', 
                borderRadius: '5px', // Esquinas redondeadas
                transition: 'background-color 0.3s ease', // Transición suave para el cambio de color
              }} 
              onMouseEnter={(e) => e.target.style.backgroundColor = '#4b5b52'} // Color al pasar el mouse
              onMouseLeave={(e) => e.target.style.backgroundColor = currentPage === 1 ? 'rgba(111, 129, 115, 0.5)' : '#6f8173'} // Color original al salir
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Anterior
            </button>
          </li>
          <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
            <button
              className="page-link"
              style={{ 
                backgroundColor: '#6f8173', 
                color: '#D9EAD3', 
                borderRadius: '5px', // Esquinas redondeadas
                transition: 'background-color 0.3s ease', // Transición suave para el cambio de color
              }} 
              onMouseEnter={(e) => e.target.style.backgroundColor = '#4b5b52'} // Color al pasar el mouse
              onMouseLeave={(e) => e.target.style.backgroundColor = '#6f8173'} // Color original al salir
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Siguiente
            </button>
          </li>
          <li className="page-item">
            <span style={{ margin: '0 10px', color: '#6f8173' }}>Página {currentPage} de {totalPages}</span>
          </li>
        </ul>
      </nav>

      <CModal visible={modalVisible} onClose={() => setModalVisible(false)} backdrop="static" keyboard={false}>
        <CModalHeader>
          <CModalTitle>{historialAEditar ? 'Editar Historial' : 'Agregar Historial'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CFormInput
              label="Código de Historial"
              value={nuevoHistorial.Cod_historial_academico}
              onChange={(e) => handleInputChange(e, 'Cod_historial_academico')}
              disabled={!!historialAEditar}
            />
            <CFormInput
              label="Código de Estado"
              value={nuevoHistorial.Cod_estado}
              onChange={(e) => handleInputChange(e, 'Cod_estado')}
            />
            <CFormSelect
              label="Grado"
              value={nuevoHistorial.Grado}
              onChange={(e) => handleInputChange(e, 'Grado')}
              options={generarGrados().map(grado => ({ label: grado, value: grado }))}
            />
            <CFormSelect
              label="Año Académico"
              value={nuevoHistorial.Año_Academico}
              onChange={(e) => handleInputChange(e, 'Año_Academico')}
              options={generarAnios().map(año => ({ label: año, value: año }))}
            />
            <CFormInput
              label="Promedio Anual"
              value={nuevoHistorial.Promedio_Anual}
              onChange={(e) => handleInputChange(e, 'Promedio_Anual')}
            />
            <CFormInput
              label="Instituto"
              value={nuevoHistorial.Instituto}
              onChange={(e) => handleInputChange(e, 'Instituto')}
            />
            {error && <div className="text-danger">{error}</div>}
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setModalVisible(false)}>Cerrar</CButton>
          <CButton color="primary" onClick={historialAEditar ? handleUpdateHistorial : handleCreateHistorial}>
          <CIcon icon={cilSave} /> {historialAEditar ? 'Actualizar' : 'Guardar'}
          </CButton>
        </CModalFooter>
      </CModal>
    </CContainer>
  );
};

export default ListaHistoriales;