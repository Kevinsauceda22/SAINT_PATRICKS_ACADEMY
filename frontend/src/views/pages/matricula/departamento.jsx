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


const Departamento = () => {
  const { canSelect } = usePermission('departamento');

  const [departamentos, setDepartamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredDepartamentos, setFilteredDepartamentos] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [modalVisible, setModalVisible] = useState(false);
  const [editar, setEditar] = useState(false);
  const [departamentoActual, setDepartamentoActual] = useState({ codDepartamento: null, nombreDepartamento: '', nombreMunicipio: '' });
  const [errorMsg, setErrorMsg] = useState({ nombreDepartamento: '', nombreMunicipio: '' });

  const obtenerDepartamentos = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/departamento/departamento');
      const data = await response.json();
      if (response.ok) {
        setDepartamentos(data);
        setFilteredDepartamentos(data);
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
    const { nombreDepartamento, nombreMunicipio } = departamentoActual;
    if (!nombreDepartamento) {
      Swal.fire('Error', 'El nombre del departamento es requerido', 'error');
      return;
    }

    try {
      const response = await fetch('http://localhost:4000/api/departamento/departamento', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Nombre_departamento: nombreDepartamento, Nombre_municipio: nombreMunicipio }),
      });

      if (response.ok) {
        Swal.fire('Éxito', 'Departamento creado exitosamente', 'success');
        obtenerDepartamentos();
      } else {
        const result = await response.json();
        throw new Error(result.Mensaje || 'Error al crear el departamento');
      }
    } catch (error) {
      Swal.fire('Error', error.message, 'error');
    } finally {
      setModalVisible(false);
    }
  };

  const actualizarDepartamento = async () => {
    const { codDepartamento, nombreDepartamento, nombreMunicipio } = departamentoActual;
    if (!nombreDepartamento) {
      Swal.fire('Error', 'El nombre del departamento es requerido', 'error');
      return;
    }

    try {
      const response = await fetch(`http://localhost:4000/api/departamento/departamento/${codDepartamento}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Nombre_departamento: nombreDepartamento, Nombre_municipio: nombreMunicipio }),
      });

      if (response.ok) {
        Swal.fire('Éxito', 'Departamento actualizado exitosamente', 'success');
        obtenerDepartamentos();
      } else {
        const result = await response.json();
        throw new Error(result.Mensaje || 'Error al actualizar el departamento');
      }
    } catch (error) {
      Swal.fire('Error', error.message, 'error');
    } finally {
      setModalVisible(false);
    }
  };

  const eliminarDepartamento = async (codDepartamento) => {
    try {
      const response = await fetch(`http://localhost:4000/api/departamento/departamento/${codDepartamento}`, {
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
      departamento.Nombre_departamento.toLowerCase().includes(value)
    );
    setFilteredDepartamentos(filtered);
    setCurrentPage(0);
  };

  const handleAddModal = () => {
    setDepartamentoActual({ codDepartamento: null, nombreDepartamento: '', nombreMunicipio: '' });
    setErrorMsg({ nombreDepartamento: '', nombreMunicipio: '' });
    setEditar(false);
    setModalVisible(true);
  };

  const handleEditModal = (departamento) => {
    setDepartamentoActual({
      codDepartamento: departamento.Cod_departamento,
      nombreDepartamento: departamento.Nombre_departamento,
      nombreMunicipio: departamento.Nombre_municipio,
    });
    setEditar(true);
    setModalVisible(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const upperCaseValue = value.toUpperCase();

    // Check for three consecutive identical letters
    if (/(.)\1\1/.test(upperCaseValue)) {
      setErrorMsg((prev) => ({ ...prev, [name]: 'No se permiten tres letras consecutivas iguales' }));
      return;
    } else if (!/^[A-Z\s]*$/.test(upperCaseValue)) {
      setErrorMsg((prev) => ({ ...prev, [name]: 'Solo se permiten letras y espacios' }));
      return;
    } else if (upperCaseValue.length > 50) {
      setErrorMsg((prev) => ({ ...prev, [name]: 'Máximo 50 caracteres permitidos' }));
      return;
    } else {
      setErrorMsg((prev) => ({ ...prev, [name]: '' }));
    }

    setDepartamentoActual((prev) => ({ ...prev, [name]: upperCaseValue }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editar) {
      actualizarDepartamento();
    } else {
      crearDepartamento();
    }
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text('Reporte de Departamentos', 10, 10);

    doc.autoTable({
      head: [['#', 'Nombre del Departamento', 'Nombre del Municipio']],
      body: departamentos.map((departamento, index) => [
        index + 1,
        departamento.Nombre_departamento.toUpperCase(),
        departamento.Nombre_municipio.toUpperCase(),
      ]),
    });

    doc.save('Reporte_Departamentos.pdf');
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      departamentos.map((departamento, index) => ({
        '#': index + 1,
        'Departamento': departamento.Nombre_departamento.toUpperCase(),
        'Municipio': departamento.Nombre_municipio.toUpperCase(),
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Departamentos');
    XLSX.writeFile(workbook, 'Reporte_Departamentos.xlsx');
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

     // Verificar permisos
 if (!canSelect) {
  return <AccessDenied />;
}


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
          <CDropdown className="report-dropdown">
            <CDropdownToggle style={{ backgroundColor: '#6C8E58', borderColor: '#617341', zIndex: '1050' }}>
              <CIcon icon={cilFile} /> Reporte
            </CDropdownToggle>
            <CDropdownMenu>
              <CDropdownItem onClick={exportToPDF}>Exportar a PDF</CDropdownItem>
              <CDropdownItem onClick={exportToExcel}>Exportar a Excel</CDropdownItem>
            </CDropdownMenu>
          </CDropdown>
        </CCol>
      </CRow>

      <CRow className="align-items-center my-3 sticky-header">
        <CCol md={5}>
          <CInputGroup size="sm">
            <CInputGroupText>
              <CIcon icon={cilSearch} />
            </CInputGroupText>
            <CFormInput placeholder="Buscar departamento" value={searchTerm} onChange={handleSearch} />
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
              <CTableHeaderCell>Nombre del Departamento</CTableHeaderCell>
              <CTableHeaderCell>Nombre del Municipio</CTableHeaderCell>
              <CTableHeaderCell className="text-end">Acciones</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {currentItems.map((departamento, index) => (
              <CTableRow key={departamento.Cod_departamento}>
                <CTableDataCell>{index + 1 + currentPage * itemsPerPage}</CTableDataCell>
                <CTableDataCell>{departamento.Nombre_departamento.toUpperCase()}</CTableDataCell>
                <CTableDataCell>{departamento.Nombre_municipio.toUpperCase()}</CTableDataCell>
                <CTableDataCell className="text-end">
  <CButton
    color="warning"
    size="sm"
    style={{ opacity: 0.8 }}  // Opacidad ajustada
    onClick={() => handleEditModal(departamento)}
  >
    <CIcon icon={cilPen} />
  </CButton>{' '}
  <CButton
    color="danger"
    size="sm"
    style={{ opacity: 0.8 }}  // Opacidad ajustada
    onClick={() => confirmDelete(departamento.Cod_departamento)}
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
            {errorMsg.nombreDepartamento && <p className="text-danger">{errorMsg.nombreDepartamento}</p>}
            <CInputGroup className="mb-3">
              <CInputGroupText>Nombre del Municipio</CInputGroupText>
              <CFormInput
                type="text"
                name="nombreMunicipio"
                placeholder="Nombre del municipio"
                value={departamentoActual.nombreMunicipio}
                onChange={handleInputChange}
              />
            </CInputGroup>
            {errorMsg.nombreMunicipio && <p className="text-danger">{errorMsg.nombreMunicipio}</p>}
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


        .report-dropdown .dropdown-menu {
          z-index: 1050;
        }
      `}</style>
    </CContainer>
  );
};

export default Departamento;
