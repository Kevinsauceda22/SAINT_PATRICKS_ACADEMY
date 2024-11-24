import React, { useState, useEffect } from 'react';
import { CIcon } from '@coreui/icons-react';
import { cilSearch, cilBrushAlt, cilPen, cilTrash, cilPlus, cilSave, cilDescription } from '@coreui/icons';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
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

const Institutos = () => {
  const [institutos, setInstitutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [nuevoInstituto, setNuevoInstituto] = useState({});
  const [institutoAEditar, setInstitutoAEditar] = useState(null);
  const [modalReportVisible, setModalReportVisible] = useState(false); // Modal de Reporte
  const [modalVisible, setModalVisible] = useState(false); // Estado para mostrar/ocultar el modal

  useEffect(() => {
    fetchInstitutos();
  }, []);

  // Obtener los institutos desde la API
  const fetchInstitutos = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/instituto/instituto');
      if (!response.ok) {
        throw new Error(`Error en la respuesta: ${response.status}`);
      }
      const data = await response.json();
      setInstitutos(data);
    } catch (error) {
      setError(error.message);
      console.error('Error al obtener los institutos:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredInstitutos = institutos.filter(instituto => 
    instituto.Cod_Instituto.toString().includes(searchTerm) ||
    instituto.Nom_Instituto.toString().includes(searchTerm)
  );

  const handleEditInstituto = (instituto) => {
    setInstitutoAEditar(instituto); // Establece el instituto que se va a editar
    setNuevoInstituto({
      Cod_Instituto: instituto.Cod_Instituto,
      Nom_Instituto: instituto.Nom_Instituto,
    });
    setModalVisible(true); // Muestra el modal
  };

  // Paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentInstitutos = filteredInstitutos.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredInstitutos.length / itemsPerPage);

  const validateFields = () => {
    if (!nuevoInstituto.Nom_Instituto || nuevoInstituto.Nom_Instituto.trim() === '') {
      setError('El nombre del instituto es obligatorio.');
      return false;
    }
    setError(null);
    return true;
  };  

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  // Manejo del cierre del modal
  const handleCancelModal = () => {
    setModalVisible(false); // Cierra el modal
    setNuevoInstituto({}); // Limpia los campos
    setError(null); // Limpia errores
  };

  const handleInputChange = (e, field) => {
    setNuevoInstituto((prevState) => ({
      ...prevState,
      [field]: e.target.value.toUpperCase(), // Convertir a mayúsculas
    }));
  };
  

  const handleUpdateInstituto = async () => {
    if (!validateFields()) return;
  
    try {
      const response = await fetch('http://localhost:4000/api/instituto/actualizarinstituto', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(nuevoInstituto), // Usar `nuevoInstituto` en lugar de `institutoActualizado`
      });
  
      if (response.ok) {
        await fetchInstitutos(); // Recarga los institutos
        setModalVisible(false); // Cierra el modal
        setInstitutoAEditar(null); // Resetea el instituto a editar
        setNuevoInstituto({}); // Limpia el formulario
      } else {
        const errorData = await response.json();
        console.error('Error al actualizar el instituto:', errorData);
        setError('Error al actualizar el instituto: ' + errorData.Mensaje);
      }
    } catch (error) {
      console.error('Error al actualizar el instituto:', error);
      setError('Error al actualizar el instituto: ' + error.message);
    }
  };  

  const handleCreateInstituto = async () => {
    if (!validateFields()) return;
  
    try {
      const response = await fetch('http://localhost:4000/api/instituto/crearinstituto', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(nuevoInstituto),
      });
  
      if (response.ok) {
        await fetchInstitutos(); // Recarga los institutos
        setCurrentPage(1); // Restablece la página actual
        setNuevoInstituto({}); // Limpia el formulario
        setModalVisible(false);
      } else {
        const errorData = await response.json();
        setError('Error al crear el instituto: ' + errorData.message);
      }
    } catch (error) {
      setError('Error al crear el instituto: ' + error.message);
    }
  };

  const handleDeleteInstituto = async (id) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Este instituto se eliminará permanentemente.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'No, cancelar',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      allowOutsideClick: false, // Evita que el modal se cierre al hacer clic fuera
    });
  
    // Si el usuario confirma, procede con la eliminación
    if (result.isConfirmed) {
      try {
        const response = await fetch('http://localhost:4000/api/instituto/eliminarinstituto', {
          method: 'DELETE', 
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ Cod_Instituto: id }),
        });
  
        if (response.ok) {
          Swal.fire('Eliminado', 'El instituto ha sido eliminado exitosamente.', 'success');
          fetchInstitutos(); // Llamar a la función para actualizar los datos
        } else {
          const errorData = await response.json();
          console.error('Error al eliminar el instituto: ', errorData);
          Swal.fire('Error', 'Hubo un error al eliminar el instituto.', 'error');
        }
      } catch (error) {
        console.error('Error al eliminar el instituto:', error);
        Swal.fire('Error', 'Hubo un error al eliminar el historial.', 'error');
      }
    }
  };
  
  const downloadPDF = () => {
    const doc = new jsPDF();
    
    // Cambia el color del texto a verde para el título
    doc.setTextColor(0, 128, 0); // Verde (RGB: 0, 128, 0)
    
    // Añadir título
    doc.text('Institutos', 14, 16);
    
    // Obtiene la altura del título
    const titleHeight = 10; // altura aproximada del título
    
    // Restablece el color de texto a negro para el resto del documento, si es necesario
    doc.setTextColor(0, 0, 0);
    
    // Dibuja la tabla en una posición más baja para evitar la superposición
    autoTable(doc, {
      startY: 20 + titleHeight, // Esto coloca la tabla justo debajo del título
      head: [['Código de Instituto', 'Nombre del Instituto']],
      body: filteredInstitutos.map(instituto => [
        instituto.Cod_Instituto,
        instituto.Nom_Instituto
      ]),
      headStyles: {
        fillColor: [0, 128, 0], // Color verde en RGB para el fondo del encabezado
        textColor: [255, 255, 255], // Texto en blanco en RGB
        fontStyle: 'bold' // Negrita para el encabezado
      }
    });
    
    doc.save('institutos.pdf');
  };  

  const downloadExcel = () => {
    if (filteredInstitutos.length === 0) {
      alert('No hay datos para descargar');
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(filteredInstitutos.map(instituto => ({
      'Código de Instituto': instituto.Cod_Instituto,
      'Nombre del Instituto': instituto.Nom_Instituto
    })));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Institutos');

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, 'institutos.xlsx');
  };
  
  return (
    <CContainer>
      <h1>Mantenimiento Institutos</h1>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <CButton
          style={{ backgroundColor: '#4B6251', color: 'white' }}
          className="mb-3 mb-md-0 me-md-3"
          onClick={() => setModalVisible(true)} // Mostrar el modal
        >
          <CIcon icon={cilPlus} /> Nuevo
        </CButton>
        <CButton
          style={{ backgroundColor: '#6C8E58', color: 'white' }}
          onClick={() => setModalReportVisible(true)}
        >
          <CIcon icon={cilDescription} /> Reporte
        </CButton>
      </div>

      {/* Modal para crear o actualizar instituto */}
      <CModal
        visible={modalVisible}
        onClose={handleCancelModal}
        backdrop="static"
        keyboard={false}
      >
        <CModalHeader>
          <CModalTitle>{institutoAEditar ? 'Actualizar Instituto' : 'Agregar Instituto'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CFormInput
              label="Nombre del Instituto"
              type="text"
              value={nuevoInstituto.Nom_Instituto || ''}
              onChange={(e) => handleInputChange(e, 'Nom_Instituto')}
            />
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={handleCancelModal}>Cancelar</CButton>
          <CButton
            color="primary"
            onClick={institutoAEditar ? handleUpdateInstituto : handleCreateInstituto} // Condicional: crear o actualizar
          >
            {institutoAEditar ? 'Actualizar' : 'Crear'}
          </CButton>
        </CModalFooter>
      </CModal>

      <div className="d-flex mb-3">
        <CInputGroupText>
          <CIcon icon={cilSearch} />
        </CInputGroupText>
        <CFormInput
          placeholder="Buscar Institutos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value.toUpperCase())}
          style={{ width: '200px' }}
        />
        <CButton
          onClick={handleClearSearch}
          style={{
            border: '1px solid #ccc',
            transition: 'all 0.1s ease-in-out',
            backgroundColor: '#F3F4F7',
            color: '#343a40'
          }}
        >
          <CIcon icon={cilBrushAlt} /> Limpiar
        </CButton>
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
        <span>institutos</span>
      </div>

      <div className="table-container" style={{ overflowY: 'auto', marginBottom: '20px' }}>
        <CTable striped bordered hover responsive style={{ minWidth: '700px', fontSize: '16px' }}>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell>#</CTableHeaderCell>
              <CTableHeaderCell>Codigo del Instituto</CTableHeaderCell>
              <CTableHeaderCell>Nomre del Instituto</CTableHeaderCell>
              <CTableHeaderCell>Acciones</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {currentInstitutos.map((instituto, index) => (
              <CTableRow key={index}>
                <CTableDataCell>{indexOfFirstItem + index + 1}</CTableDataCell>
                <CTableDataCell>{instituto.Cod_Instituto}</CTableDataCell>
                <CTableDataCell>{instituto.Nom_Instituto}</CTableDataCell>
                <CTableDataCell>
                  <CButton color="info" onClick={() => handleEditInstituto(instituto)}>
                    <CIcon icon={cilPen} />
                  </CButton>
                  <CButton color="danger" onClick={() => handleDeleteInstituto(instituto.Cod_Instituto)}>
                    <CIcon icon={cilTrash} />
                  </CButton>
                </CTableDataCell>
              </CTableRow>
            ))}
          </CTableBody>
        </CTable>
      </div>

      <nav>
        <ul className="pagination justify-content-center align-items-center">
          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
            <button
              className="page-link"
              style={{
                backgroundColor: currentPage === 1 ? 'rgba(111, 129, 115, 0.5)' : '#6f8173',
                color: '#D9EAD3',
                borderRadius: '5px',
                transition: 'background-color 0.3s ease',
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#4b5b52'}
              onMouseLeave={(e) => e.target.style.backgroundColor = currentPage === 1 ? 'rgba(111, 129, 115, 0.5)' : '#6f8173'}
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
                borderRadius: '5px',
                transition: 'background-color 0.3s ease',
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#4b5b52'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#6f8173'}
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
      
      <CModal visible={modalReportVisible} onClose={() => setModalReportVisible(false)} backdrop="static" keyboard={false}>
        <CModalHeader>
          <CModalTitle>Generar Reporte</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <p>Seleccione el formato para descargar el reporte: </p>
        </CModalBody>
        <CModalFooter>
          <CButton color="primary" onClick={downloadPDF}>PDF</CButton>
          <CButton color="primary" onClick={downloadExcel}>Excel</CButton>
          <CButton color="secondary" onClick={() => setModalReportVisible(false)}>Cerrar</CButton>
        </CModalFooter>
      </CModal>
    </CContainer>
  );
};

export default Institutos;
