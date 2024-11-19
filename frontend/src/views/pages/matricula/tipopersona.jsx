import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { cilSearch, cilPen, cilTrash, cilPlus, cilSave, cilBrushAlt, cilFile } from '@coreui/icons';
import CIcon from '@coreui/icons-react';
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
  CSpinner,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
} from '@coreui/react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import usePermission from '../../../../context/usePermission';
import AccessDenied from "../AccessDenied/AccessDenied"


const TipoPersona = () => {
  const { canSelect, canUpdate, canDelete, canInsert  } = usePermission('tipopersona');

  const [tiposPersona, setTiposPersona] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTipos, setFilteredTipos] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [modalVisible, setModalVisible] = useState(false);
  const [editar, setEditar] = useState(false);
  const [tipoPersonaActual, setTipoPersonaActual] = useState({ codTipoPersona: null, tipo: '' });

  const tiposValidos = ['P', 'D', 'A', 'E'];

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
      Swal.fire('Error', error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const crearTipoPersona = async () => {
    const tipo = tipoPersonaActual.tipo.toUpperCase();
    if (!tipo || !tiposValidos.includes(tipo)) {
      Swal.fire('Error', `Tipo inválido. Los tipos permitidos son: ${tiposValidos.join(', ')}`, 'error');
      return;
    }

    try {
      const response = await fetch('http://localhost:4000/api/tipopersona/tipo-persona', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Tipo: tipo }),
      });

      if (response.ok) {
        Swal.fire('Éxito', 'Tipo de persona creado exitosamente', 'success');
        obtenerTiposPersona();
      } else {
        const result = await response.json();
        throw new Error(result.Mensaje || 'Error al crear el tipo de persona');
      }
    } catch (error) {
      Swal.fire('Error', error.message, 'error');
    } finally {
      setModalVisible(false);
    }
  };

  const actualizarTipoPersona = async () => {
    const tipo = tipoPersonaActual.tipo.toUpperCase();
    if (!tiposValidos.includes(tipo)) {
      Swal.fire('Error', `Tipo inválido. Los tipos permitidos son: ${tiposValidos.join(', ')}`, 'error');
      return;
    }

    try {
      const response = await fetch(`http://localhost:4000/api/tipopersona/tipo-persona/${tipoPersonaActual.codTipoPersona}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Tipo: tipo }),
      });

      if (response.ok) {
        Swal.fire('Éxito', 'Tipo de persona actualizado exitosamente', 'success');
        obtenerTiposPersona();
      } else {
        const result = await response.json();
        throw new Error(result.Mensaje || 'Error al actualizar el tipo de persona');
      }
    } catch (error) {
      Swal.fire('Error', error.message, 'error');
    } finally {
      setModalVisible(false);
    }
  };

  const eliminarTipoPersona = async (codTipoPersona) => {
    try {
      const response = await fetch(`http://localhost:4000/api/tipopersona/tipo-persona/${codTipoPersona}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        Swal.fire('Éxito', 'Tipo de persona eliminado correctamente', 'success');
        obtenerTiposPersona();
      } else {
        throw new Error('Error al eliminar el tipo de persona');
      }
    } catch (error) {
      Swal.fire('Error', error.message, 'error');
    }
  };

  const confirmDelete = (codTipoPersona) => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'No podrás revertir esta acción',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        eliminarTipoPersona(codTipoPersona);
      }
    });
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    const filtered = tiposPersona.filter((tipo) =>
      tipo.Tipo.toLowerCase().includes(value)
    );
    setFilteredTipos(filtered);
    setCurrentPage(0);
  };

  const handleAddModal = () => {
    setTipoPersonaActual({ codTipoPersona: null, tipo: '' });
    setEditar(false);
    setModalVisible(true);
  };

  const handleEditModal = (tipo) => {
    setTipoPersonaActual({
      codTipoPersona: tipo.Cod_tipo_persona,
      tipo: tipo.Tipo,
    });
    setEditar(true);
    setModalVisible(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editar) {
      actualizarTipoPersona();
    } else {
      crearTipoPersona();
    }
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text('Reporte de Tipos de Persona', 10, 10);

    doc.autoTable({
      head: [['#', 'Tipo de Persona']],
      body: tiposPersona.map((tipo, index) => [
        index + 1,
        getTipoLabel(tipo.Tipo),
      ]),
    });

    doc.save('Reporte_Tipos_Persona.pdf');
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      tiposPersona.map((tipo, index) => ({
        '#': index + 1,
        'Tipo': getTipoLabel(tipo.Tipo),
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'TiposPersona');
    XLSX.writeFile(workbook, 'Reporte_Tipos_Persona.xlsx');
  };

  useEffect(() => {
    obtenerTiposPersona();
  }, []);

  const getTipoLabel = (tipo) => {
    switch (tipo) {
      case 'P':
        return 'P (PADRE)';
      case 'D':
        return 'D (DOCENTE)';
      case 'A':
        return 'A (ALUMNO)';
      case 'E':
        return 'E (EMPLEADO)';
      default:
        return tipo;
    }
  };

  const indexOfLastItem = (currentPage + 1) * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredTipos.slice(indexOfFirstItem, indexOfLastItem);

  if (loading) {
    return (
      <CContainer fluid style={{ padding: 0 }}>
        <CRow className="justify-content-center">
          <CCol xs={12} md={6}>
            <CSpinner color="primary" />
            <p>Cargando tipos de persona...</p>
          </CCol>
        </CRow>
      </CContainer>
    );
  }

  if (error) {
    return (
      <CContainer fluid style={{ padding: 0 }}>
        <CRow className="justify-content-center">
          <CCol xs={12} md={6}>
            <p>Error: {error}</p>
          </CCol>
        </CRow>
      </CContainer>
    );
  }

  const pageCount = Math.ceil(filteredTipos.length / itemsPerPage);

     // Verificar permisos
 if (!canSelect) {
  return <AccessDenied />;
}


  return (
    <CContainer fluid style={{ padding: 0 }}>
      <CRow className="justify-content-between align-items-center mb-3 sticky-header">
        <CCol xs={12} md={8}>
          <h3>Mantenimiento Tipo de Personas</h3>
        </CCol>
        <CCol xs="4" md="3" className="text-end">
          {canInsert && ( 
          <CButton color="dark" onClick={handleAddModal} className="me-2" style={{ backgroundColor: '#4B6251', borderColor: '#0F463A' }}>
            <CIcon icon={cilPlus} /> Nuevo
          </CButton>
          )}
          <CDropdown className="report-dropdown">
            <CDropdownToggle style={{ backgroundColor: '#6C8E58', borderColor: '#6C8E58', zIndex: '1050' }}>
              <CIcon icon={cilFile} /> Reporte
            </CDropdownToggle>
            <CDropdownMenu>
              <CDropdownItem onClick={exportToPDF}>Exportar a PDF</CDropdownItem>
              <CDropdownItem onClick={exportToExcel}>Exportar a Excel</CDropdownItem>
            </CDropdownMenu>
          </CDropdown>
        </CCol>
      </CRow>

      <CRow className="align-items-center my-3">
        <CCol md={5}>
          <CInputGroup size="sm">
            <CInputGroupText>
              <CIcon icon={cilSearch} />
            </CInputGroupText>
            <CFormInput placeholder="Buscar tipo de persona" value={searchTerm} onChange={handleSearch} />
            <CButton
              style={{
                border: '1px solid #ccc',
                backgroundColor: '#F3F4F7',
                color: '#343a40',
              }}
              onClick={() => setSearchTerm('')}
            >
              <CIcon icon={cilBrushAlt} /> Limpiar
            </CButton>
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
              <CTableHeaderCell>Tipo</CTableHeaderCell>
              <CTableHeaderCell className="text-end">Acciones</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {currentItems.map((tipo, index) => (
              <CTableRow key={tipo.Cod_tipo_persona}>
                <CTableDataCell>{index + 1 + currentPage * itemsPerPage}</CTableDataCell>
                <CTableDataCell>{getTipoLabel(tipo.Tipo)}</CTableDataCell>
                <CTableDataCell className="text-end">

                  {canUpdate && ( 
  <CButton
    color="warning"
    size="sm"
    style={{ opacity: 0.8 }}  // Opacidad ajustada
    onClick={() => handleEditModal(tipo)}
  >
    <CIcon icon={cilPen} />
  </CButton>)}{' '}

  {canDelete && (
  <CButton
    color="danger"
    size="sm"
    style={{ opacity: 0.8 }}  // Opacidad ajustada
    onClick={() => confirmDelete(tipo.Cod_tipo_persona)}
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
          <CModalTitle>{editar ? 'Editar Tipo de Persona' : 'Agregar Tipo de Persona'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm onSubmit={handleSubmit}>
            <CInputGroup className="mb-3">
              <CInputGroupText>Tipo de Persona</CInputGroupText>
              <CFormSelect
                value={tipoPersonaActual.tipo}
                onChange={(e) => setTipoPersonaActual({ ...tipoPersonaActual, tipo: e.target.value.toUpperCase() })}
                required
              >
                <option value="" disabled>Selecciona un tipo</option>
                <option value="P">PADRE</option>
                <option value="D">DOCENTE</option>
                <option value="A">ALUMNO</option>
                <option value="E">EMPLEADO</option>
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
          overflow-y: ${filteredTipos.length >= 5 ? 'auto' : 'hidden'};
          overflow-x: hidden;
        }

        .sticky-header {
          position: sticky;
          top: 0;
          background-color: ;
          color: ;
          z-index: 1000;
        }

        .report-dropdown .dropdown-menu {
          z-index: 1050;
        }
      `}</style>
    </CContainer>
  );
};

export default TipoPersona;
