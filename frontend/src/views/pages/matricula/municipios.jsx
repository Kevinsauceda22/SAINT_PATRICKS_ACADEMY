import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { cilSearch, cilPen, cilTrash, cilPlus, cilSave, cilFile } from '@coreui/icons';
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
  CFormSelect,
  CCol,
  CTableDataCell,
  CSpinner,
} from '@coreui/react';
import logo from 'src/assets/brand/logo_saint_patrick.png';
import usePermission from '../../../../context/usePermission';
import AccessDenied from "../AccessDenied/AccessDenied"


const MunicipioMantenimiento = () => {
  const { canSelect, canUpdate, canDelete, canInsert  } = usePermission('Municipios');

  const [municipios, setMunicipios] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredMunicipios, setFilteredMunicipios] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [modalVisible, setModalVisible] = useState(false);
  const [editar, setEditar] = useState(false);
  const [municipioActual, setMunicipioActual] = useState({ 
    codMunicipio: null, 
    nombreMunicipio: '',
    codDepartamento: ''
  });

  const obtenerMunicipios = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/departamento/municipios');
      const data = await response.json();
      if (response.ok) {
        setMunicipios(data);
        setFilteredMunicipios(data);
      } else {
        throw new Error(data.message || 'Error al obtener los municipios');
      }
    } catch (error) {
      setError(error.message);
      Swal.fire('Error', error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const obtenerDepartamentos = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/departamento/departamentos');
      const data = await response.json();
      if (response.ok) {
        setDepartamentos(data);
      } else {
        throw new Error('Error al obtener los departamentos');
      }
    } catch (error) {
      console.error('Error:', error);
      Swal.fire('Error', 'Error al cargar los departamentos', 'error');
    }
  };

  const crearMunicipio = async () => {
    const { nombreMunicipio, codDepartamento } = municipioActual;
    if (!nombreMunicipio || !codDepartamento) {
      Swal.fire('Error', 'Todos los campos son requeridos', 'error');
      return;
    }

    try {
      const response = await fetch('http://localhost:4000/api/departamento/municipios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          nombre_municipio: nombreMunicipio,
          cod_departamento: codDepartamento 
        }),
      });

      if (response.ok) {
        Swal.fire('Éxito', 'Municipio creado exitosamente', 'success');
        obtenerMunicipios();
      } else {
        const result = await response.json();
        throw new Error(result.message || 'Error al crear el municipio');
      }
    } catch (error) {
      Swal.fire('Error', error.message, 'error');
    } finally {
      setModalVisible(false);
    }
  };

  const actualizarMunicipio = async () => {
    const { codMunicipio, nombreMunicipio, codDepartamento } = municipioActual;
    if (!nombreMunicipio || !codDepartamento) {
      Swal.fire('Error', 'Todos los campos son requeridos', 'error');
      return;
    }

    try {
      const response = await fetch(`http://localhost:4000/api/departamento/municipios/${codMunicipio}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          nombre_municipio: nombreMunicipio,
          cod_departamento: codDepartamento 
        }),
      });

      if (response.ok) {
        Swal.fire('Éxito', 'Municipio actualizado exitosamente', 'success');
        obtenerMunicipios();
      } else {
        const result = await response.json();
        throw new Error(result.message || 'Error al actualizar el municipio');
      }
    } catch (error) {
      Swal.fire('Error', error.message, 'error');
    } finally {
      setModalVisible(false);
    }
  };

  const eliminarMunicipio = async (codMunicipio) => {
    try {
      const response = await fetch(`http://localhost:4000/api/departamento/municipios/${codMunicipio}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        Swal.fire('Éxito', 'Municipio eliminado correctamente', 'success');
        obtenerMunicipios();
      } else {
        throw new Error('Error al eliminar el municipio');
      }
    } catch (error) {
      Swal.fire('Error', error.message, 'error');
    }
  };

  const confirmDelete = (codMunicipio) => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'No podrás revertir esta acción',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        eliminarMunicipio(codMunicipio);
      }
    });
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    const filtered = municipios.filter((municipio) =>
      municipio.nombre_municipio.toLowerCase().includes(value) ||
      municipio.nombre_departamento.toLowerCase().includes(value)
    );
    setFilteredMunicipios(filtered);
    setCurrentPage(0);
  };

  const handleAddModal = () => {
    setMunicipioActual({ codMunicipio: null, nombreMunicipio: '', codDepartamento: '' });
    setEditar(false);
    setModalVisible(true);
  };

  const handleEditModal = (municipio) => {
    setMunicipioActual({
      codMunicipio: municipio.cod_municipio,
      nombreMunicipio: municipio.nombre_municipio,
      codDepartamento: municipio.cod_departamento,
    });
    setEditar(true);
    setModalVisible(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setMunicipioActual((prev) => ({ 
      ...prev, 
      [name]: name === 'nombreMunicipio' ? value.toUpperCase() : value 
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editar) {
      actualizarMunicipio();
    } else {
      crearMunicipio();
    }
  };

  const generatePDFMunicipios = () => {
    const doc = new jsPDF('p', 'mm', 'letter');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
  
    const img = new Image();
    img.src = logo;
  
    img.onload = () => {
      // Insert the logo
      doc.addImage(img, 'PNG', 20, 15, 25, 25);
  
      // Report header
      doc.setTextColor(22, 160, 133);
      doc.setFontSize(16);
      doc.text("SAINT PATRICK'S ACADEMY", 50, 25, { align: 'left' });
      doc.setFontSize(12);
      doc.text('Reporte de Municipios', 50, 35, { align: 'left' });
  
      // Institution details
      doc.setFontSize(9);
      doc.setTextColor(68, 68, 68);
      doc.text('Casa Club del periodista, Colonia del Periodista', 50, 45, { align: 'left' });
      doc.text('Teléfono: (504) 2234-8871', 50, 52, { align: 'left' });
      doc.text('Correo: info@saintpatrickacademy.edu', 50, 59, { align: 'left' });
  
      // Main table
      doc.autoTable({
        startY: 70,
        head: [['Municipio', 'Departamento']],
        body: municipios.map((municipio) => [
          municipio.nombre_municipio.toUpperCase(),
          municipio.nombre_departamento.toUpperCase()
        ]),
        styles: {
          fontSize: 10,
          textColor: [68, 68, 68],
          cellPadding: 8
        },
        headStyles: {
          fillColor: [22, 160, 133],
          textColor: [255, 255, 255],
          fontSize: 11,
          fontStyle: 'bold',
          halign: 'left',
          cellPadding: { top: 8, bottom: 8, left: 8, right: 8 }
        },
        columnStyles: {
          0: { cellWidth: pageWidth * 0.4 },
          1: { cellWidth: pageWidth * 0.4 }
        },
        alternateRowStyles: {
          fillColor: [240, 248, 255]
        },
        margin: { top: 15, right: 20, bottom: 20, left: 20 },
        didDrawPage: function(data) {
          // Footer
          doc.setFontSize(9);
          doc.setTextColor(100);
          const date = new Date().toLocaleDateString('es-HN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
          doc.text(`Fecha de generación: ${date}`, 20, pageHeight - 15);
          doc.text(`Página ${data.pageNumber}`, pageWidth - 20, pageHeight - 15, { align: 'right' });
        }
      });
  
      // Save the PDF
      doc.save('Reporte_Municipios.pdf');
    };
  };

  useEffect(() => {
    obtenerMunicipios();
    obtenerDepartamentos();
  }, []);

  const indexOfLastItem = (currentPage + 1) * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredMunicipios.slice(indexOfFirstItem, indexOfLastItem);
  
  if (loading) {
    return (
      <CContainer>
        <CRow className="justify-content-center">
          <CCol xs={12} md={6}>
            <CSpinner color="primary" />
            <p>Cargando municipios...</p>
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

  const pageCount = Math.ceil(filteredMunicipios.length / itemsPerPage);


      // Verificar permisos
 if (!canSelect) {
  return <AccessDenied />;
}
  return (
    <CContainer>
      <CRow className="justify-content-between align-items-center mb-3 sticky-header">
        <CCol xs={12} md={8}>
          <h3>Mantenimiento de Municipios</h3>
        </CCol>

        <CCol xs="4" md="3" className="text-end">
          {canInsert &&(
          <CButton color="dark" onClick={handleAddModal} className="me-2" style={{ backgroundColor: '#4B6251', borderColor: '#0F463A' }}>
          <CIcon icon={cilPlus} /> Nuevo
          </CButton>
          )}
          <CButton color="primary" onClick={generatePDFMunicipios} style={{ backgroundColor: '#6C8E58', borderColor: '#617341' }}>
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
            <CFormInput placeholder="Buscar municipio" value={searchTerm} onChange={handleSearch} />
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
              <CTableHeaderCell>Nombre del Municipio</CTableHeaderCell>
              <CTableHeaderCell>Departamento</CTableHeaderCell>
              <CTableHeaderCell className="text-end">Acciones</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {currentItems.map((municipio, index) => (
              <CTableRow key={municipio.cod_municipio}>
                <CTableDataCell>{index + 1 + currentPage * itemsPerPage}</CTableDataCell>
                <CTableDataCell>{municipio.nombre_municipio.toUpperCase()}</CTableDataCell>
                <CTableDataCell>{municipio.nombre_departamento.toUpperCase()}</CTableDataCell>
                <CTableDataCell className="text-end">

                  {canUpdate && (
                  <CButton
                    color="warning"
                    size="sm"
                    style={{ opacity: 0.8 }}
                    onClick={() => handleEditModal(municipio)}
                  >
                    <CIcon icon={cilPen} />
                  </CButton>)}{' '}

                  {canDelete && (
                  <CButton
                    color="danger"
                    size="sm"
                    style={{ opacity: 0.8 }}
                    onClick={() => confirmDelete(municipio.cod_municipio)}
                  >
                    <CIcon icon={cilTrash} />
                  </CButton>
                  )}
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
          <CModalTitle>{editar ? 'Editar Municipio' : 'Agregar Municipio'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm onSubmit={handleSubmit}>
            <CInputGroup className="mb-3">
              <CInputGroupText>Nombre del Municipio</CInputGroupText>
              <CFormInput
                type="text"
                name="nombreMunicipio"
                placeholder="Nombre del municipio"
                value={municipioActual.nombreMunicipio}
                onChange={handleInputChange}
                required
              />
            </CInputGroup>
            <CInputGroup className="mb-3">
  <CInputGroupText>Departamento</CInputGroupText>
  <CFormSelect
    name="codDepartamento"
    value={municipioActual.codDepartamento}
    onChange={handleInputChange}
    required
  >
    <option value="">Seleccione un departamento</option>
    {departamentos
      // Filtrar departamentos únicos por cod_departamento
      .filter((departamento, index, self) => 
        index === self.findIndex((d) => d.cod_departamento === departamento.cod_departamento)
      )
      // Ordenar alfabéticamente
      .sort((a, b) => a.nombre_departamento.localeCompare(b.nombre_departamento))
      .map((departamento) => (
        <option 
          key={`select-dept-${departamento.cod_departamento}-${departamento.nombre_departamento}`} 
          value={departamento.cod_departamento}
        >
          {departamento.nombre_departamento.toUpperCase()}
        </option>
      ))}
  </CFormSelect>
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
          overflow-y: ${filteredMunicipios.length >= 5 ? 'auto' : 'hidden'};
          overflow-x: hidden;
        }
      `}</style>
    </CContainer>
  );
};

export default MunicipioMantenimiento;