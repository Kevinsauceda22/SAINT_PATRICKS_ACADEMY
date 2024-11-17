import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { cilSearch, cilPen, cilTrash, cilPlus, cilSave, cilFile  } from '@coreui/icons';
import CIcon from '@coreui/icons-react';
import { jsPDF } from 'jspdf';

import 'jspdf-autotable';

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
  CPagination,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CRow,
  
  CFormSelect ,
  CCol,
  CTableDataCell,
  CSpinner,
} from '@coreui/react';
import logo from 'src/assets/brand/logo_saint_patrick.png';


const DepartamentoMantenimiento = () => {
  const [departamentos, setDepartamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredDepartamentos, setFilteredDepartamentos] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [modalVisible, setModalVisible] = useState(false);
  const [editar, setEditar] = useState(false);
  const [departamentoActual, setDepartamentoActual] = useState({ codDepartamento: null, nombreDepartamento: '' });

  const obtenerDepartamentos = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/departamento/departamentos');
      const data = await response.json();
      if (response.ok) {
        // Filtrar departamentos únicos basados en cod_departamento
        const departamentosUnicos = data.reduce((acc, current) => {
          const x = acc.find(item => item.cod_departamento === current.cod_departamento);
          if (!x) {
            return acc.concat([current]);
          } else {
            return acc;
          }
        }, []);
        
        // Ordenar alfabéticamente
        const departamentosOrdenados = departamentosUnicos.sort((a, b) => 
          a.nombre_departamento.localeCompare(b.nombre_departamento)
        );
  
        setDepartamentos(departamentosOrdenados);
        setFilteredDepartamentos(departamentosOrdenados);
      } else {
        throw new Error(data.message || 'Error al obtener los departamentos');
      }
    } catch (error) {
      setError(error.message);
      Swal.fire('Error', error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const crearDepartamento = async () => {
    const { nombreDepartamento } = departamentoActual;
    if (!nombreDepartamento) {
      Swal.fire('Error', 'El nombre del departamento es requerido', 'error');
      return;
    }

    try {
      const response = await fetch('http://localhost:4000/api/departamento/departamentos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre_departamento: nombreDepartamento }),
      });

      if (response.ok) {
        Swal.fire('Éxito', 'Departamento creado exitosamente', 'success');
        obtenerDepartamentos();
      } else {
        const result = await response.json();
        throw new Error(result.message || 'Error al crear el departamento');
      }
    } catch (error) {
      Swal.fire('Error', error.message, 'error');
    } finally {
      setModalVisible(false);
    }
  };

  const actualizarDepartamento = async () => {
    const { codDepartamento, nombreDepartamento } = departamentoActual;
    if (!nombreDepartamento) {
      Swal.fire('Error', 'El nombre del departamento es requerido', 'error');
      return;
    }

    try {
      const response = await fetch(`http://localhost:4000/api/departamento/departamentos/${codDepartamento}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre_departamento: nombreDepartamento }),
      });

      if (response.ok) {
        Swal.fire('Éxito', 'Departamento actualizado exitosamente', 'success');
        obtenerDepartamentos();
      } else {
        const result = await response.json();
        throw new Error(result.message || 'Error al actualizar el departamento');
      }
    } catch (error) {
      Swal.fire('Error', error.message, 'error');
    } finally {
      setModalVisible(false);
    }
  };

  const eliminarDepartamento = async (codDepartamento) => {
    try {
      const response = await fetch(`http://localhost:4000/api/departamento/departamentos/${codDepartamento}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        Swal.fire('Éxito', 'Departamento eliminado correctamente', 'success');
        obtenerDepartamentos();
      } else {
        throw new Error('Error al eliminar el departamento');
      }
    } catch (error) {
      Swal.fire('Error', error.message, 'error');
    }
  };



  const confirmDelete = (codDepartamento) => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'No podrás revertir esta acción',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        eliminarDepartamento(codDepartamento);
      }
    });
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    const filtered = departamentos.filter((departamento) =>
      departamento.nombre_departamento.toLowerCase().includes(value)
    );
    setFilteredDepartamentos(filtered);
    setCurrentPage(0);
  };

  const handleAddModal = () => {
    setDepartamentoActual({ codDepartamento: null, nombreDepartamento: '' });
    setEditar(false);
    setModalVisible(true);
  };

  const handleEditModal = (departamento) => {
    setDepartamentoActual({
      codDepartamento: departamento.cod_departamento,
      nombreDepartamento: departamento.nombre_departamento,
    });
    setEditar(true);
    setModalVisible(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDepartamentoActual((prev) => ({ ...prev, [name]: value.toUpperCase() }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editar) {
      actualizarDepartamento();
    } else {
      crearDepartamento();
    }
  };


const generatePDFDepartments = () => {
  const doc = new jsPDF('p', 'mm', 'letter');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const img = new Image();
  img.src = logo;

  img.onload = () => {
    // Function to add improved watermark
    const addWatermark = () => {
      // ... (the watermark function code remains the same)
    };

    // Insert the logo
    doc.addImage(img, 'PNG', 20, 15, 25, 25);

    // Report header with better spacing
    doc.setTextColor(22, 160, 133);
    doc.setFontSize(16);
    doc.text("SAINT PATRICK'S ACADEMY", 50, 25, { align: 'left' });
    doc.setFontSize(12);
    doc.text('Reporte de Departamentos', 50, 35, { align: 'left' });

    // Institution details with better spacing
    doc.setFontSize(9); // Increased for better readability
    doc.setTextColor(68, 68, 68);
    doc.text('Casa Club del periodista, Colonia del Periodista', 50, 45, { align: 'left' });
    doc.text('Teléfono: (504) 2234-8871', 50, 52, { align: 'left' });
    doc.text('Correo: info@saintpatrickacademy.edu', 50, 59, { align: 'left' });

    // Add watermark
    addWatermark();

    // Main list with better formatting
    let currentY = 70;
    departamentos.forEach((departamento, index) => {
      doc.setFontSize(10);
      doc.setTextColor(68, 68, 68);
      doc.text(`${index + 1}. ${departamento.nombre_departamento.toUpperCase()}`, 20, currentY, { maxWidth: pageWidth - 40 });
      currentY += 12; // Adjust spacing between items
    });

    // Improved footer
    doc.setFontSize(9);
    doc.setTextColor(100);
    const date = new Date().toLocaleDateString('es-HN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    doc.text(`Fecha de generación: ${date}`, 20, pageHeight - 15);
    doc.text(`Página ${doc.getCurrentPageInfo().pageNumber}`, pageWidth - 20, pageHeight - 15, { align: 'right' });

    // Save the PDF
    doc.save('Reporte_Departamentos.pdf');
  };
};
  useEffect(() => {
    obtenerDepartamentos();
  }, []);

  const indexOfLastItem = (currentPage + 1) * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredDepartamentos.slice(indexOfFirstItem, indexOfLastItem);
  if (loading) {
    return (
      <CContainer>
        <CRow className="justify-content-center">
          <CCol xs={12} md={6}>
            <CSpinner color="primary" />
            <p>Cargando departamentos...</p>
          </CCol>
        </CRow>
      </CContainer>
    );
  }

  if (error) {
    return (
      <CContainer>
        <CRow className="justify-content-center">
          <CCol xs={12} md={6}>
            <p>Error: {error}</p>
          </CCol>
        </CRow>
      </CContainer>
    );
  }

  const pageCount = Math.ceil(filteredDepartamentos.length / itemsPerPage);

  return (
    <CContainer>
      <CRow className="justify-content-between align-items-center mb-3 sticky-header">
        <CCol xs={12} md={8}>
          <h3>Mantenimeinto de Departamentos</h3>
        </CCol>
        <CCol xs="4" md="3" className="text-end">
          <CButton color="dark" onClick={handleAddModal} className="me-2" style={{ backgroundColor: '#4B6251', borderColor: '#0F463A' }}>
            <CIcon icon={cilPlus} /> Nuevo
          </CButton>
          <CButton color="primary" onClick={generatePDFDepartments} style={{ backgroundColor: '#6C8E58', borderColor: '#617341' }}>
            <CIcon icon={cilFile} /> Generar Reporte
          </CButton>
        </CCol>
      </CRow>

      <CRow className="align-items-center my-3 sticky-header">
        <CCol md={5}>
          <CInputGroup size="sm">
            <CInputGroupText>
              <CIcon icon={cilSearch} />
            </CInputGroupText>
            <CFormInput placeholder="Buscar departamento" value={searchTerm} onChange={handleSearch} />
          </CInputGroup>
        </CCol>
        <CCol xs="12" md="7" className="text-md-end mt-2 mt-md-0">
          <CInputGroup style={{ width: 'auto', display: 'inline-block' }}>
            <div className="d-inline-flex align-items-center">
              <span>Mostrar&nbsp;</span>
              <CFormSelect
                style={{ width: '80px', display: 'inline-block', textAlign: 'center' }}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(0);
                }}
                value={itemsPerPage}
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
              </CFormSelect>
              <span>&nbsp;registros</span>
            </div>
          </CInputGroup>
        </CCol>
      </CRow>

      <div className="table-container">
        <CTable striped bordered hover>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell>#</CTableHeaderCell>
              <CTableHeaderCell>Nombre del Departamento</CTableHeaderCell>
              <CTableHeaderCell className="text-end">Acciones</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {currentItems.map((departamento, index) => (
              <CTableRow key={departamento.cod_departamento}>
                <CTableDataCell>{index + 1 + currentPage * itemsPerPage}</CTableDataCell>
                <CTableDataCell>{departamento.nombre_departamento.toUpperCase()}</CTableDataCell>
                <CTableDataCell className="text-end">
                  <CButton
                    color="warning"
                    size="sm"
                    style={{ opacity: 0.8 }}
                    onClick={() => handleEditModal(departamento)}
                  >
                    <CIcon icon={cilPen} />
                  </CButton>{' '}
                  <CButton
                    color="danger"
                    size="sm"
                    style={{ opacity: 0.8 }}
                    onClick={() => confirmDelete(departamento.cod_departamento)}
                  >
                    <CIcon icon={cilTrash} />
                  </CButton>
                </CTableDataCell>
              </CTableRow>
            ))}
          </CTableBody>
        </CTable>
      </div>

      <nav className="d-flex justify-content-center align-items-center mt-4">
        <CPagination className="mb-0" style={{ gap: '0.3cm' }}>
          <CButton
            style={{ backgroundColor: 'gray', color: 'white', marginRight: '0.3cm' }}
            disabled={currentPage === 0}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Anterior
          </CButton>
          <CButton
            style={{ backgroundColor: 'gray', color: 'white' }}
            disabled={currentPage === pageCount - 1}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Siguiente
          </CButton>
        </CPagination>
        <span className="mx-2">Página {currentPage + 1} de {pageCount}</span>
      </nav>

      <CModal visible={modalVisible} onClose={() => setModalVisible(false)} backdrop="static">
        <CModalHeader closeButton>
          <CModalTitle>{editar ? 'Editar Departamento' : 'Agregar Departamento'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm onSubmit={handleSubmit}>
            <CInputGroup className="mb-3">
              <CInputGroupText>Nombre del Departamento</CInputGroupText>
              <CFormInput
                type="text"
                name="nombreDepartamento"
                placeholder="Nombre del departamento"
                value={departamentoActual.nombreDepartamento}
                onChange={handleInputChange}
                required
              />
            </CInputGroup>
            <CModalFooter>
              <CButton color="secondary" onClick={() => setModalVisible(false)}>
                Cancelar
              </CButton>
              <CButton style={{ backgroundColor: '#617341', color: 'white' }} type="submit">
                <CIcon icon={cilSave} /> {editar ? 'Guardar' : 'Guardar'}
              </CButton>
            </CModalFooter>
          </CForm>
        </CModalBody>
      </CModal>

      <style jsx>{`
        .table-container {
          max-height: 400px;
          overflow-y: ${filteredDepartamentos.length >= 5 ? 'auto' : 'hidden'};
          overflow-x: hidden;
        }
      `}</style>
    </CContainer>
  );
};

export default DepartamentoMantenimiento;