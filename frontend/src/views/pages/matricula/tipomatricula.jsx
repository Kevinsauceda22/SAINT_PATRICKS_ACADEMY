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

const TipoMatricula = () => {
  const [tipos, setTipos] = useState([]);
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
    obtenerTipos();
  }, []);

  const obtenerTipos = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/tipomatricula/tipo-matricula');
      const data = await response.json();
      if (response.ok) {
        setTipos(data);
        setFilteredTipos(data);
      } else {
        throw new Error(data.message || 'Error al obtener los tipos de matrícula');
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
    const textoSinNumerosYEspeciales = texto.replace(/[^A-Za-z\s]/g, ''); // Solo letras y espacios
    const textoValidado = textoSinNumerosYEspeciales.toUpperCase().slice(0, 30); // Limitar a 30 caracteres
    const tresLetrasSeguidas = /(.)\1{2,}/; // Tres letras iguales seguidas

    if (tresLetrasSeguidas.test(textoValidado)) {
      return estadoActual.Tipo; // Mantener el estado anterior si hay caracteres inválidos
    }
    return textoValidado;
  };

  const handleTipoChange = (e) => {
    const textoValido = validarTipoEnTiempoReal(e.target.value);
    setEstadoActual({ ...estadoActual, Tipo: textoValido });
  };

  const crearTipo = async (tipo) => {
    try {
      const response = await fetch('http://localhost:4000/api/tipomatricula/tipo-matricula', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ Tipo: tipo }),
      });

      if (response.ok) {
        swal.fire({
          title: 'Éxito',
          text: 'Tipo de matrícula creado correctamente.',
          icon: 'success',
          confirmButtonColor: '#4B6251',
        });
        obtenerTipos();
      } else {
        const result = await response.json();
        throw new Error(result.Mensaje || 'Error al crear el tipo de matrícula');
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

  const actualizarTipo = async (codTipo, nuevoTipo) => {
    try {
      const response = await fetch(`http://localhost:4000/api/tipomatricula/tipo-matricula/${codTipo}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ Tipo: nuevoTipo }),
      });

      if (response.ok) {
        swal.fire({
          title: 'Éxito',
          text: 'Tipo de matrícula actualizado correctamente.',
          icon: 'success',
          confirmButtonColor: '#4B6251',
        });
        obtenerTipos();
      } else {
        const result = await response.json();
        throw new Error(result.Mensaje || 'Error al actualizar el tipo de matrícula');
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

  const eliminarTipo = async (codTipo) => {
    try {
      const response = await fetch(`http://localhost:4000/api/tipomatricula/tipo-matricula/${codTipo}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        swal.fire({
          title: 'Éxito',
          text: 'Tipo de matrícula eliminado correctamente.',
          icon: 'success',
          confirmButtonColor: '#4B6251',
        });
        obtenerTipos();
      } else {
        const result = await response.json();
        throw new Error(result.Mensaje || 'Error al eliminar el tipo de matrícula');
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
      await actualizarTipo(estadoActual.Cod_tipo_matricula, estadoActual.Tipo);
    } else {
      await crearTipo(estadoActual.Tipo);
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
        eliminarTipo(codTipo);
      }
    });
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);

    const filtered = tipos.filter(tipo =>
      tipo.Tipo.toLowerCase().includes(value)
    );
    setFilteredTipos(filtered);
    setCurrentPage(0);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text('Reporte de Tipos de Matrícula', 14, 15);
    doc.autoTable({
      startY: 20,
      head: [['#', 'TIPO DE MATRÍCULA']],
      body: tipos.map((tipo, index) => [
        index + 1,
        tipo.Tipo.toUpperCase(),
      ]),
    });
    doc.save('Reporte_Tipos_Matricula.pdf');
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      tipos.map((tipo, index) => ({
        '#': index + 1,
        'Tipo de Matrícula': tipo.Tipo.toUpperCase(),
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Tipos de Matrícula');
    XLSX.writeFile(workbook, 'Reporte_Tipos_Matricula.xlsx');
  };

  const indexOfLastItem = (currentPage + 1) * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredTipos.slice(indexOfFirstItem, indexOfLastItem);

  const pageCount = Math.ceil(filteredTipos.length / itemsPerPage);

  return (
    <CContainer>
      <CRow className="justify-content-between align-items-center mb-4">
        <CCol xs={12} md={8}>
          <h3>Mantenimientos Tipos de Matrícula</h3>
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
              placeholder="Buscar tipo de matrícula"
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
            <CTableHeaderCell>TIPO DE MATRÍCULA</CTableHeaderCell>
            <CTableHeaderCell>Acciones</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {currentItems.map((tipo, index) => (
            <CTableRow key={tipo.Cod_tipo_matricula}>
              <CTableDataCell>{indexOfFirstItem + index + 1}</CTableDataCell>
              <CTableDataCell>{tipo.Tipo.toUpperCase()}</CTableDataCell>
              <CTableDataCell>
                <CButton color="warning" size="sm" onClick={() => openEditModal(tipo)}>
                  <CIcon icon={cilPen} />
                </CButton>{' '}
                <CButton color="danger" size="sm" onClick={() => confirmDelete(tipo.Cod_tipo_matricula)}>
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
          <CModalTitle>{editar ? 'Editar Tipo de Matrícula' : 'Agregar Tipo de Matrícula'}</CModalTitle>
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

export default TipoMatricula;
