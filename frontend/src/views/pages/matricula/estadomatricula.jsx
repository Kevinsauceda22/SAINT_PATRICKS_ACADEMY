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
import { BsCheckCircle, BsExclamationCircle, BsDashCircle, BsXCircle } from 'react-icons/bs';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import usePermission from '../../../../context/usePermission';
import AccessDenied from "../AccessDenied/AccessDenied"


const EstadoMatricula = () => {
  const { canSelect } = usePermission('estadomatricula');
  const [estados, setEstados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredEstados, setFilteredEstados] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [modalVisible, setModalVisible] = useState(false);
  const [editar, setEditar] = useState(false);
  const [estadoActual, setEstadoActual] = useState({ codEstado: '', tipo: '' });

  useEffect(() => {
    obtenerEstados();
  }, []);

  const obtenerEstados = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/estadomatricula/estado-matricula');
      const data = await response.json();
      if (response.ok) {
        setEstados(data);
        setFilteredEstados(data);
      } else {
        throw new Error(data.message || 'Error al obtener los estados');
      }
    } catch (error) {
      setError(error.message);
      swal.fire('Error', error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const crearEstado = async (tipo) => {
    try {
      const response = await fetch('http://localhost:4000/api/estadomatricula/estado-matricula', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ p_tipo: tipo }),
      });

      if (response.ok) {
        swal.fire('Éxito', 'Estado de matrícula creado correctamente.', 'success');
        obtenerEstados();
      } else {
        const result = await response.json();
        throw new Error(result.Mensaje || 'Error al crear el estado');
      }
    } catch (error) {
      swal.fire('Error', error.message, 'error');
    }
  };

  const eliminarEstado = async (codEstado) => {
    try {
      const response = await fetch(`http://localhost:4000/api/estadomatricula/estado-matricula/${codEstado}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        swal.fire('Éxito', 'Estado de matrícula eliminado correctamente.', 'success');
        obtenerEstados();
      } else {
        const result = await response.json();
        throw new Error(result.Mensaje || 'Error al eliminar el estado');
      }
    } catch (error) {
      swal.fire('Error', error.message, 'error');
    }
  };

  const actualizarEstado = async (codEstado, nuevoTipo) => {
    try {
      const response = await fetch(`http://localhost:4000/api/estadomatricula/estado-matricula/${codEstado}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ p_cod_estado_matricula: codEstado, p_tipo: nuevoTipo }),
      });

      const result = await response.json();

      if (response.ok) {
        swal.fire('Éxito', 'Estado de matrícula actualizado correctamente.', 'success');
        obtenerEstados();
      } else {
        swal.fire('Error', result.Mensaje || 'Error al actualizar el estado', 'error');
      }
    } catch (error) {
      swal.fire('Error', error.message, 'error');
    }
  };

  const handleEditModal = (estado) => {
    setEstadoActual({ codEstado: estado.Cod_estado_matricula, tipo: estado.Tipo });
    setEditar(true);
    setModalVisible(true);
  };

  const handleAddModal = () => {
    setEstadoActual({ codEstado: '', tipo: '' });
    setEditar(false);
    setModalVisible(true);
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);

    const filtered = estados.filter((estado) =>
      estado.Tipo.toLowerCase().includes(value)
    );
    setFilteredEstados(filtered);
    setCurrentPage(0);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editar) {
      actualizarEstado(estadoActual.codEstado, estadoActual.tipo);
    } else {
      crearEstado(estadoActual.tipo);
    }
    setModalVisible(false);
  };

  const handleDelete = (codEstado) => {
    swal.fire({
      title: '¿Estás seguro?',
      text: 'No podrás revertir esta acción',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        eliminarEstado(codEstado);
      }
    });
  };

  // Exportar a PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text('Reporte de Estados de Matrícula', 10, 10);

    doc.autoTable({
      head: [['#', 'Tipo de Estado']],
      body: estados.map((estado, index) => [
        index + 1,
        estado.Tipo,
      ]),
    });

    doc.save('Reporte_Estados_Matricula.pdf');
  };

  // Exportar a Excel
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      estados.map((estado, index) => ({
        '#': index + 1,
        'Tipo de Estado': estado.Tipo,
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Estados de Matrícula');
    XLSX.writeFile(workbook, 'Reporte_Estados_Matricula.xlsx');
  };

  const indexOfLastItem = (currentPage + 1) * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredEstados.slice(indexOfFirstItem, indexOfLastItem);

  const pageCount = Math.ceil(filteredEstados.length / itemsPerPage);

     // Verificar permisos
 if (!canSelect) {
  return <AccessDenied />;
}


  return (
    <CContainer>
<CRow className="justify-content-between align-items-center mb-4">
  <CCol xs={12} md={8}>
    <h3>Mantenimiento Estado de Matrícula</h3>
  </CCol>
  <CCol xs={12} md={4} className="text-end">
    {/* Botón Nuevo */}
    <CButton 
      style={{ backgroundColor: '#0F463A', color: 'white', borderColor: '#4B6251' }} 
      onClick={handleAddModal} 
      className="me-2"
    >
      <CIcon icon={cilPlus} /> Nuevo
    </CButton>
    
    {/* Botón de Reporte con menú desplegable */}
    <CDropdown className="d-inline ms-2">
      <CDropdownToggle 
        style={{ backgroundColor: '#6C8E58', color: 'white', borderColor: '#617341', width: 'auto', height: '38px' }} // Ajuste del tamaño
      >
        <CIcon icon={cilFile} /> Reporte
      </CDropdownToggle>
      <CDropdownMenu>
        <CDropdownItem onClick={exportToPDF}>Exportar a PDF</CDropdownItem>
        <CDropdownItem onClick={exportToExcel}>Exportar a Excel</CDropdownItem>
      </CDropdownMenu>
    </CDropdown>
  </CCol>
</CRow>


      {/* Barra de búsqueda y botón de mostrar registros */}
      <CRow className="align-items-center my-3 justify-content-between">
        <CCol md={6}>
          <CInputGroup>
            <CInputGroupText>
              <CIcon icon={cilSearch} />
            </CInputGroupText>
            <CFormInput
              placeholder="Buscar estado"
              value={searchTerm}
              onChange={handleSearch}
            />
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

        <CCol md={3} className="text-end">
          <div className="d-flex justify-content-end">
            <span className="me-2">Mostrar&nbsp;</span>
            <CFormSelect
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

      <div style={{ maxHeight: '300px', overflowY: 'auto', borderRadius: '8px', display: 'block' }}>
        <CTable striped bordered hover>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell>#</CTableHeaderCell>
              <CTableHeaderCell>Tipo de Estado</CTableHeaderCell>
              <CTableHeaderCell>Acciones</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {currentItems.map((estado, index) => (
              <CTableRow key={estado.Cod_estado_matricula}>
                <CTableDataCell>{index + 1 + indexOfFirstItem}</CTableDataCell>
                <CTableDataCell style={{ textTransform: 'uppercase' }}>
                  {estado.Tipo === 'Activa' && <BsCheckCircle className="text-success me-2" />}
                  {estado.Tipo === 'Cancelada' && <BsXCircle className="text-danger me-2" />}
                  {estado.Tipo === 'Pendiente' && <BsExclamationCircle className="text-warning me-2" />}
                  {estado.Tipo === 'Inactiva' && <BsDashCircle className="text-secondary me-2" />}
                  {estado.Tipo}
                </CTableDataCell>
                <CTableDataCell className="text-end">
  <CButton
    color="warning"
    size="sm"
    style={{ opacity: 0.8 }}  // Opacidad ajustada
    onClick={() => handleEditModal(estado)}
  >
    <CIcon icon={cilPen} />
  </CButton>{' '}
  <CButton
    color="danger"
    size="sm"
    style={{ opacity: 0.8 }}  // Opacidad ajustada
    onClick={() => handleDelete(estado.Cod_estado_matricula)}
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
        <CModalHeader>
          <CModalTitle>{editar ? 'Editar Estado de Matrícula' : 'Agregar Estado de Matrícula'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm onSubmit={handleSubmit}>
            <CFormSelect
              value={estadoActual.tipo}
              onChange={(e) => setEstadoActual({ ...estadoActual, tipo: e.target.value })}
              required
            >
              <option value="" disabled>Seleccione un estado</option>
              <option value="Activa">ACTIVA</option>
              <option value="Cancelada">CANCELADA</option>
              <option value="Pendiente">PENDIENTE</option>
              <option value="Inactiva">INACTIVA</option>
            </CFormSelect>
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

export default EstadoMatricula;
