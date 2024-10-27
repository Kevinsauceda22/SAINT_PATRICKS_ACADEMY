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
import { BsCheckCircle, BsExclamationCircle, BsDashCircle } from 'react-icons/bs';
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
  const [estadoActual, setEstadoActual] = useState({});

  const tiposValidos = ['Estandar', 'Extraordinaria', 'Beca', 'Otras'];

  const obtenerTipos = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/tipomatricula/tipo-matricula');
      const data = await response.json();
      if (response.ok) {
        setTipos(data);
        setFilteredTipos(data);
        setLoading(false);
      } else {
        throw new Error(data.message || 'Error al obtener los tipos de matrícula');
      }
    } catch (error) {
      setError(error.message);
      setLoading(false);
      swal.fire('Error', error.message, 'error');
    }
  };

  const crearTipo = async (tipo) => {
    if (!tiposValidos.includes(tipo)) {
      swal.fire('Error', `Tipo inválido. Los tipos permitidos son: ${tiposValidos.join(', ')}`, 'error');
      return;
    }

    try {
      const response = await fetch('http://localhost:4000/api/tipomatricula/tipo-matricula', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ Tipo: tipo }),
      });

      if (response.ok) {
        swal.fire('Éxito', 'Tipo de matrícula creado correctamente.', 'success');
        obtenerTipos();
      } else {
        const result = await response.json();
        throw new Error(result.Mensaje || 'Error al crear el tipo de matrícula');
      }
    } catch (error) {
      swal.fire('Error', error.message, 'error');
    }
  };

  const actualizarTipo = async (codTipo, nuevoTipo) => {
    if (!tiposValidos.includes(nuevoTipo)) {
      swal.fire('Error', `Tipo inválido. Los tipos permitidos son: ${tiposValidos.join(', ')}`, 'error');
      return;
    }

    try {
      const response = await fetch(`http://localhost:4000/api/tipomatricula/tipo-matricula/${codTipo}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ Tipo: nuevoTipo }),
      });

      if (response.ok) {
        swal.fire('Éxito', 'Tipo de matrícula actualizado correctamente.', 'success');
        obtenerTipos();
      } else {
        const result = await response.json();
        throw new Error(result.Mensaje || 'Error al actualizar el tipo de matrícula');
      }
    } catch (error) {
      swal.fire('Error', error.message, 'error');
    }
  };

  const eliminarTipo = async (codTipo) => {
    try {
      const response = await fetch(`http://localhost:4000/api/tipomatricula/tipo-matricula/${codTipo}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        swal.fire('Éxito', 'Tipo de matrícula eliminado correctamente.', 'success');
        obtenerTipos();
      } else {
        const result = await response.json();
        throw new Error(result.Mensaje || 'Error al eliminar el tipo de matrícula');
      }
    } catch (error) {
      swal.fire('Error', error.message, 'error');
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
    if (!estadoActual.Tipo.trim() || !tiposValidos.includes(estadoActual.Tipo)) {
      swal.fire('Error', `Tipo inválido. Los tipos permitidos son: ${tiposValidos.join(', ')}`, 'error');
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

  const indexOfLastItem = (currentPage + 1) * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredTipos.slice(indexOfFirstItem, indexOfLastItem);

  useEffect(() => {
    obtenerTipos();
  }, []);

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

  const pageCount = Math.ceil(filteredTipos.length / itemsPerPage);

  return (
    <CContainer>
      <CRow className="justify-content-between align-items-center mb-4">
        <CCol xs={12} md={8}>
          <h3>Tipos de Matrícula</h3>
        </CCol>
        <CCol xs={12} md={4} className="text-end">
          <CButton style={{ backgroundColor: '#0F463A', color: 'white', width: 'auto', height: '38px' }} onClick={openAddModal}>
            <CIcon icon={cilPlus} /> Agregar
          </CButton>
          <CDropdown className="d-inline ms-2">
            <CDropdownToggle style={{ backgroundColor: '#4B6251', color: 'white', width: 'auto', height: '38px' }}>
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
              <CTableDataCell>
                {tipo.Tipo === 'Estandar' && <BsCheckCircle className="text-success me-2" />}
                {tipo.Tipo === 'Extraordinaria' && <BsExclamationCircle className="text-warning me-2" />}
                {tipo.Tipo === 'Beca' && <BsCheckCircle className="text-primary me-2" />}
                {tipo.Tipo === 'Otras' && <BsDashCircle className="text-secondary me-2" />}
                {tipo.Tipo.toUpperCase()}
              </CTableDataCell>
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
            <CFormSelect
              value={estadoActual.Tipo}
              onChange={(e) => setEstadoActual({ ...estadoActual, Tipo: e.target.value })}
              required
            >
              <option value="" disabled>Selecciona un tipo</option>
              {tiposValidos.map((tipoValido) => (
                <option key={tipoValido} value={tipoValido}>{tipoValido.toUpperCase()}</option>
              ))}
            </CFormSelect>
            <CModalFooter>
              <CButton color="secondary" size="sm" onClick={() => setModalVisible(false)}>
                Cancelar
              </CButton>
              <CButton color="dark" size="sm" type="submit" style={{ backgroundColor: '#617341', borderColor: '#617341' }}>
                <CIcon icon={cilSave} /> {editar ? 'Actualizar' : 'Crear'}
              </CButton>
            </CModalFooter>
          </CForm>
        </CModalBody>
      </CModal>
    </CContainer>
  );
};

export default TipoMatricula;
