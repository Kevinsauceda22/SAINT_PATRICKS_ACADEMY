import React, { useState, useEffect } from 'react';
import { cilSearch, cilBrushAlt, cilPen, cilTrash, cilPlus, cilSave, cilFile } from '@coreui/icons';
import { CIcon } from '@coreui/icons-react';
import swal from 'sweetalert2';
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
  CTableDataCell,
  CFormSelect,
  CRow,
  CCol,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
} from '@coreui/react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import logo from 'src/assets/brand/logo_saint_patrick.png'; // Ruta del logo

const TipoPersona = () => {
  const [tiposPersona, setTiposPersona] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTipos, setFilteredTipos] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [modalVisible, setModalVisible] = useState(false);
  const [editar, setEditar] = useState(false);
  const [estadoActual, setEstadoActual] = useState({ Tipo: '' });

  useEffect(() => {
    obtenerTiposPersona();
  }, []);

  const obtenerTiposPersona = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/tipopersona/tipo-persona');
      const data = await response.json();
      if (response.ok) {
        setTiposPersona(data);
        setFilteredTipos(data);
      } else {
        throw new Error(data.message || 'Error al obtener los tipos de persona');
      }
    } catch (error) {
      setError(error.message);
      swal.fire({
        title: 'Error',
        text: error.message,
        icon: 'error',
        confirmButtonColor: '#4B6251',
      });
    } finally {
      setLoading(false);
    }
  };

  const validarTipoEnTiempoReal = (texto) => {
    const textoSinNumerosYEspeciales = texto.replace(/[^A-Za-z\s]/g, '');
    const textoValidado = textoSinNumerosYEspeciales.toUpperCase().slice(0, 30);
    const tresLetrasSeguidas = /(.)\1{2,}/;

    if (tresLetrasSeguidas.test(textoValidado)) {
      return estadoActual.Tipo;
    }
    return textoValidado;
  };

  const handleTipoChange = (e) => {
    const textoValido = validarTipoEnTiempoReal(e.target.value);
    setEstadoActual({ ...estadoActual, Tipo: textoValido });
  };

  const crearTipoPersona = async (tipo) => {
    try {
      const response = await fetch('http://localhost:4000/api/tipopersona/tipo-persona', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ Tipo: tipo }),
      });

      if (response.ok) {
        swal.fire({
          title: 'Éxito',
          text: 'Tipo de persona creado correctamente.',
          icon: 'success',
          confirmButtonColor: '#4B6251',
        });
        obtenerTiposPersona();
      } else {
        const result = await response.json();
        throw new Error(result.Mensaje || 'Error al crear el tipo de persona');
      }
    } catch (error) {
      swal.fire({
        title: 'Error',
        text: error.message,
        icon: 'error',
        confirmButtonColor: '#4B6251',
      });
    }
  };

  const actualizarTipoPersona = async (codTipo, nuevoTipo) => {
    try {
      const response = await fetch(`http://localhost:4000/api/tipopersona/tipo-persona/${codTipo}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ Tipo: nuevoTipo }),
      });

      if (response.ok) {
        swal.fire({
          title: 'Éxito',
          text: 'Tipo de persona actualizado correctamente.',
          icon: 'success',
          confirmButtonColor: '#4B6251',
        });
        obtenerTiposPersona();
      } else {
        const result = await response.json();
        throw new Error(result.Mensaje || 'Error al actualizar el tipo de persona');
      }
    } catch (error) {
      swal.fire({
        title: 'Error',
        text: error.message,
        icon: 'error',
        confirmButtonColor: '#4B6251',
      });
    }
  };

  const eliminarTipoPersona = async (codTipo) => {
    try {
      const response = await fetch(`http://localhost:4000/api/tipopersona/tipo-persona/${codTipo}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        swal.fire({
          title: 'Éxito',
          text: 'Tipo de persona eliminado correctamente.',
          icon: 'success',
          confirmButtonColor: '#4B6251',
        });
        obtenerTiposPersona();
      } else {
        const result = await response.json();
        throw new Error(result.Mensaje || 'Error al eliminar el tipo de persona');
      }
    } catch (error) {
      swal.fire({
        title: 'Error',
        text: error.message,
        icon: 'error',
        confirmButtonColor: '#4B6251',
      });
    }
  };

  const openAddModal = () => {
    setEditar(false);
    setEstadoActual({ Tipo: '' });
    setModalVisible(true);
  };

  const openEditModal = (tipo) => {
    setEditar(true);
    setEstadoActual(tipo);
    setModalVisible(true);
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    if (!estadoActual.Tipo) {
      swal.fire({
        title: 'Error',
        text: 'El nombre del tipo no puede estar vacío ni contener caracteres especiales o tres letras iguales seguidas.',
        icon: 'error',
        confirmButtonColor: '#4B6251',
      });
      return;
    }

    if (editar) {
      await actualizarTipoPersona(estadoActual.Cod_tipo_persona, estadoActual.Tipo);
    } else {
      await crearTipoPersona(estadoActual.Tipo);
    }
    setModalVisible(false);
  };

  const confirmDelete = (codTipo) => {
    swal.fire({
      title: '¿Estás seguro?',
      text: 'No podrás revertir esta acción',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#4B6251',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        eliminarTipoPersona(codTipo);
      }
    });
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);

    const filtered = tiposPersona.filter(tipo =>
      tipo.Tipo.toLowerCase().includes(value)
    );
    setFilteredTipos(filtered);
    setCurrentPage(0);
  };

  // Función para exportar a PDF con diseño mejorado y logo
  const exportToPDF = () => {
    const doc = new jsPDF();

    if (tiposPersona.length === 0) {
      console.warn('No hay datos de tipos de persona para exportar.');
      return;
    }

    const img = new Image();
    img.src = logo;

    img.onload = () => {
      doc.addImage(img, 'PNG', 10, 10, 30, 30);

      doc.setFontSize(18);
      doc.setTextColor(0, 102, 51);
      doc.text('SAINT PATRICK\'S ACADEMY', doc.internal.pageSize.width / 2, 20, { align: 'center' });

      doc.setFontSize(14);
      doc.text('Reporte de Tipos de Persona', doc.internal.pageSize.width / 2, 30, { align: 'center' });

      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text('Casa Club del periodista, Colonia del Periodista', doc.internal.pageSize.width / 2, 40, { align: 'center' });
      doc.text('Teléfono: (504) 2234-8871', doc.internal.pageSize.width / 2, 45, { align: 'center' });
      doc.text('Correo: info@saintpatrickacademy.edu', doc.internal.pageSize.width / 2, 50, { align: 'center' });

      doc.setLineWidth(0.5);
      doc.setDrawColor(0, 102, 51);
      doc.line(10, 55, doc.internal.pageSize.width - 10, 55);

      doc.setFontSize(12);
      doc.setTextColor(0);
      doc.text('Tipos de Persona:', 10, 65);

      doc.autoTable({
        startY: 70,
        head: [['#', 'Tipo de Persona']],
        body: tiposPersona.map((tipo, index) => [
          index + 1,
          tipo.Tipo.toUpperCase(),
        ]),
        headStyles: {
          fillColor: [0, 102, 51],
          textColor: [255, 255, 255],
          fontSize: 10,
        },
        styles: {
          fontSize: 10,
          cellPadding: 3,
        },
        alternateRowStyles: { fillColor: [240, 248, 255] },
      });

      doc.setFontSize(10);
      doc.setTextColor(100);
      const date = new Date().toLocaleDateString();
      doc.text(`Fecha de generación: ${date}`, 10, doc.internal.pageSize.height - 10);

      doc.save('Reporte_Tipos_Persona.pdf');
    };

    img.onerror = () => {
      console.warn('No se pudo cargar el logo. El PDF se generará sin el logo.');
    };
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      tiposPersona.map((tipo, index) => ({
        '#': index + 1,
        'Tipo de Persona': tipo.Tipo.toUpperCase(),
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Tipos de Persona');
    XLSX.writeFile(workbook, 'Reporte_Tipos_Persona.xlsx');
  };

  const indexOfLastItem = (currentPage + 1) * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredTipos.slice(indexOfFirstItem, indexOfLastItem);

  const pageCount = Math.ceil(filteredTipos.length / itemsPerPage);

  return (
    <CContainer>
      <CRow className="justify-content-between align-items-center mb-4">
        <CCol xs={12} md={8}>
          <h3>Mantenimientos Tipos de Persona</h3>
        </CCol>
        <CCol xs={12} md={4} className="text-end">
          <CButton style={{ backgroundColor: '#4B6251', color: 'white', width: 'auto', height: '38px' }} onClick={openAddModal}>
            <CIcon icon={cilPlus} /> Nuevo
          </CButton>
          <CDropdown className="d-inline ms-2">
            <CDropdownToggle style={{ backgroundColor: '#6C8E58', color: 'white', width: 'auto', height: '38px' }}>
              <CIcon icon={cilFile} /> Reporte
            </CDropdownToggle>
            <CDropdownMenu>
              <CDropdownItem onClick={exportToPDF}>Exportar a PDF</CDropdownItem>
              <CDropdownItem onClick={exportToExcel}>Exportar a Excel</CDropdownItem>
            </CDropdownMenu>
          </CDropdown>
        </CCol>
      </CRow>

      <CRow className="align-items-center mb-3">
        <CCol md={6}>
          <CInputGroup size="sm">
            <CInputGroupText>
              <CIcon icon={cilSearch} />
            </CInputGroupText>
            <CFormInput
              placeholder="Buscar tipo de persona"
              value={searchTerm}
              onChange={handleSearch}
              style={{ fontSize: '0.9rem' }}
            />
            <CButton
              style={{
                border: '1px solid #ccc',
                backgroundColor: '#F3F4F7',
                color: '#343a40',
                fontSize: '0.9rem'
              }}
              onClick={() => setSearchTerm('')}
            >
              <CIcon icon={cilBrushAlt} /> Limpiar
            </CButton>
          </CInputGroup>
        </CCol>

        <CCol md={6} className="text-end">
          <div className="d-flex align-items-center justify-content-end">
            <span className="me-2">Mostrar&nbsp;</span>
            <CFormSelect
              size="sm"
              style={{ width: '80px' }}
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(0);
              }}
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
            </CFormSelect>
            <span>&nbsp;registros</span>
          </div>
        </CCol>
      </CRow>

      <CTable striped bordered hover>
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell>#</CTableHeaderCell>
            <CTableHeaderCell>TIPO DE PERSONA</CTableHeaderCell>
            <CTableHeaderCell>Acciones</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {currentItems.map((tipo, index) => (
            <CTableRow key={tipo.Cod_tipo_persona}>
              <CTableDataCell>{indexOfFirstItem + index + 1}</CTableDataCell>
              <CTableDataCell>{tipo.Tipo.toUpperCase()}</CTableDataCell>
              <CTableDataCell>
                <CButton color="warning" size="sm" onClick={() => openEditModal(tipo)}>
                  <CIcon icon={cilPen} />
                </CButton>{' '}
                <CButton color="danger" size="sm" onClick={() => confirmDelete(tipo.Cod_tipo_persona)}>
                  <CIcon icon={cilTrash} />
                </CButton>
              </CTableDataCell>
            </CTableRow>
          ))}
        </CTableBody>
      </CTable>

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
          <CModalTitle>{editar ? 'Editar Tipo de Persona' : 'Agregar Tipo de Persona'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm onSubmit={handleModalSubmit}>
            <CInputGroup className="mb-3">
              <CInputGroupText>Nombre del Tipo</CInputGroupText>
              <CFormInput
                type="text"
                placeholder="Nombre del tipo"
                value={estadoActual.Tipo || ''}
                onChange={handleTipoChange}
                required
              />
            </CInputGroup>
            <CModalFooter>
              <CButton 
                style={{ backgroundColor: '#6c757d', color: 'white', borderColor: '#6c757d' }} 
                onClick={() => setModalVisible(false)}
              >
                Cancelar
              </CButton>
              <CButton 
                style={{ backgroundColor: '#4B6251', color: 'white', borderColor: '#4B6251' }} 
                type="submit"
              >
                <CIcon icon={cilSave} /> {editar ? 'Guardar' : 'Guardar'}
              </CButton>
            </CModalFooter>
          </CForm>
        </CModalBody>
      </CModal>
    </CContainer>
  );
};

export default TipoPersona;
