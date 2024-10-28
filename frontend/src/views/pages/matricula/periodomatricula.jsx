import React, { useEffect, useState } from 'react';
import { CIcon } from '@coreui/icons-react';
import { cilPen, cilTrash, cilPlus, cilSave, cilSearch, cilCheckCircle, cilXCircle, cilBrushAlt, cilFile } from '@coreui/icons';
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
  CPagination,
  CFormSelect,
  CRow,
  CCol,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
} from '@coreui/react';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

const PeriodosMatricula = () => {
  const [periodos, setPeriodos] = useState([]);
  const [filteredPeriodos, setFilteredPeriodos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [periodosPerPage, setPeriodosPerPage] = useState(5);
  const [nuevoPeriodo, setNuevoPeriodo] = useState({
    cod_periodo_matricula: '',
    fecha_inicio: '',
    fecha_fin: '',
    anio_academico: new Date().getFullYear(),
    estado: '',
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [editar, setEditar] = useState(false);

  useEffect(() => {
    obtenerPeriodos();
  }, []);

  const obtenerPeriodos = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/periodomatricula/periodos');
      const data = await response.json();
      setPeriodos(data);
      setFilteredPeriodos(data);
    } catch (err) {
      console.error('Error al obtener los periodos de matrícula:', err);
    }
  };

  const handleInputChange = (e) => {
    setNuevoPeriodo({ ...nuevoPeriodo, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editar) {
      actualizarPeriodo(e);
    } else {
      crearPeriodo(e);
    }
  };

  const validarFechas = () => {
    const fechaInicio = new Date(nuevoPeriodo.fecha_inicio);
    const fechaFin = new Date(nuevoPeriodo.fecha_fin);
    if (fechaFin < fechaInicio) {
      Swal.fire('Error', 'La fecha fin no puede ser menor a la fecha inicio.', 'error');
      return false;
    }
    return true;
  };

  const crearPeriodo = async () => {
    if (!validarFechas()) return;

    const existePeriodoActivo = filteredPeriodos.some(
      (periodo) =>
        periodo.anio_academico === nuevoPeriodo.anio_academico &&
        periodo.estado.toLowerCase() === 'activo'
    );

    if (existePeriodoActivo) {
      Swal.fire('Error', 'Ya existe un periodo activo para el año académico ' + nuevoPeriodo.anio_academico, 'error');
      return;
    }

    try {
      const response = await fetch('http://localhost:4000/api/periodomatricula/crearperiodomatricula', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(nuevoPeriodo),
      });

      if (response.ok) {
        Swal.fire('Éxito', 'Periodo de matrícula creado correctamente', 'success');
        resetNuevoPeriodo();
        obtenerPeriodos();
        setModalVisible(false);
      } else {
        const errorData = await response.json();
        Swal.fire('Error', errorData.Mensaje, 'error');
      }
    } catch (err) {
      Swal.fire('Error', 'Error al crear el periodo de matrícula', 'error');
    }
  };

  const actualizarPeriodo = async (e) => {
    if (!validarFechas()) return;

    e.preventDefault();
    try {
      const id = nuevoPeriodo.cod_periodo_matricula;

      if (!id) {
        throw new Error('El código del periodo de matrícula es obligatorio');
      }

      const existePeriodoActivo = filteredPeriodos.some(
        (periodo) =>
          periodo.anio_academico === nuevoPeriodo.anio_academico &&
          periodo.estado.toLowerCase() === 'activo' &&
          periodo.cod_periodo_matricula !== id
      );

      if (existePeriodoActivo) {
        Swal.fire('Error', 'Ya existe un periodo activo para el año académico ' + nuevoPeriodo.anio_academico, 'error');
        return;
      }

      const response = await fetch(`http://localhost:4000/api/periodomatricula/periodos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          p_cod_periodo_matricula: id,
          p_fecha_inicio: nuevoPeriodo.fecha_inicio,
          p_fecha_fin: nuevoPeriodo.fecha_fin,
          p_anio_academico: nuevoPeriodo.anio_academico,
          p_estado: nuevoPeriodo.estado,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.Mensaje || 'Error al actualizar el periodo de matrícula');
      }

      const result = await response.json();
      Swal.fire('Éxito', result.Mensaje, 'success');

      resetNuevoPeriodo();
      obtenerPeriodos();
      setModalVisible(false);
      setEditar(false);
    } catch (err) {
      console.error('Error al actualizar el periodo de matrícula:', err);
      Swal.fire('Error', err.message, 'error');
    }
  };

  const resetNuevoPeriodo = () => {
    setNuevoPeriodo({
      cod_periodo_matricula: '',
      fecha_inicio: '',
      fecha_fin: '',
      anio_academico: new Date().getFullYear(),
      estado: '',
    });
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);

    const filtered = periodos.filter((periodo) =>
      periodo.estado.toLowerCase().includes(value) ||
      periodo.anio_academico.toString().includes(value)
    );

    setFilteredPeriodos(filtered);
    setCurrentPage(1);
  };

  const currentPeriodos = filteredPeriodos.slice(
    (currentPage - 1) * periodosPerPage,
    currentPage * periodosPerPage
  );

  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= Math.ceil(filteredPeriodos.length / periodosPerPage)) {
      setCurrentPage(pageNumber);
    }
  };

  const closeModal = () => {
    setNuevoPeriodo({
      cod_periodo_matricula: '',
      fecha_inicio: '',
      fecha_fin: '',
      anio_academico: new Date().getFullYear(),
      estado: '',
    });
    setEditar(false);
    setModalVisible(false);
  };

  const handleEditClick = (periodo) => {
    setNuevoPeriodo({
      cod_periodo_matricula: periodo.Cod_periodo_matricula,
      fecha_inicio: periodo.Fecha_inicio,
      fecha_fin: periodo.Fecha_fin,
      anio_academico: periodo.Anio_academico,
      estado: periodo.estado,
    });
    setEditar(true);
    setModalVisible(true);
  };

  const eliminarPeriodo = async (id) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Eliminar',
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`http://localhost:4000/api/periodomatricula/periodos/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          Swal.fire('Éxito', 'Periodo de matrícula eliminado correctamente', 'success');
          obtenerPeriodos();
        } else {
          const errorData = await response.json();
          Swal.fire('Error', errorData.Mensaje, 'error');
        }
      } catch (err) {
        console.error('Error al eliminar el periodo de matrícula:', err);
        Swal.fire('Error', 'Error al eliminar el periodo de matrícula', 'error');
      }
    }
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text('Reporte de Periodos de Matrícula', 10, 10);

    doc.autoTable({
      head: [['#', 'Fecha Inicio', 'Fecha Fin', 'Año Académico', 'Estado']],
      body: periodos.map((periodo, index) => [
        index + 1,
        periodo.Fecha_inicio,
        periodo.Fecha_fin,
        periodo.Anio_academico,
        periodo.estado,
      ]),
    });

    doc.save('Reporte_Periodos_Matricula.pdf');
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      periodos.map((periodo, index) => ({
        '#': index + 1,
        'Fecha Inicio': periodo.Fecha_inicio,
        'Fecha Fin': periodo.Fecha_fin,
        'Año Académico': periodo.Anio_academico,
        Estado: periodo.estado,
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Periodos de Matrícula');
    XLSX.writeFile(workbook, 'Reporte_Periodos_Matricula.xlsx');
  };

  return (
    <CContainer>
      <CRow className="align-items-center mb-5">
        <CCol xs="8" md="9">
          <h1>Mantenimiento Periodo Matrícula</h1>
        </CCol>
        <CCol xs="4" md="3" className="text-end">
  <CButton color="dark" onClick={() => setModalVisible(true)} className="me-2" style={{ backgroundColor: '#4B6251', borderColor: '#0F463A' }}>
    <CIcon icon={cilPlus} /> Nuevo
  </CButton>
  <CDropdown>
    <CDropdownToggle style={{ backgroundColor: '#6C8E58', borderColor: '#617341' }}>
      <CIcon icon={cilFile} /> Reporte
    </CDropdownToggle>
    <CDropdownMenu>
      <CDropdownItem onClick={exportToPDF}>Exportar a PDF</CDropdownItem>
      <CDropdownItem onClick={exportToExcel}>Exportar a Excel</CDropdownItem>
    </CDropdownMenu>
  </CDropdown>
</CCol>

      </CRow>
      {/* Barra de búsqueda y selector de registros */}
      <CRow className="align-items-center mt-4 mb-2">
        <CCol xs="12" md="8">
          <CInputGroup className="me-3" style={{ width: '400px' }}>
            <CInputGroupText>
              <CIcon icon={cilSearch} />
            </CInputGroupText>
            <CFormInput
              placeholder="Buscar por estado o año"
              value={searchTerm}
              onChange={handleSearch}
            />
            <CButton
              style={{ border: '1px solid #ccc', backgroundColor: '#F3F4F7', color: '#343a40' }}
              onClick={() => {
                setSearchTerm('');
                setCurrentPage(1);
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#E0E0E0';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#F3F4F7';
              }}
            >
              <CIcon icon={cilBrushAlt} /> Limpiar
            </CButton>
          </CInputGroup>
        </CCol>

        <CCol xs="12" md="4" className="text-md-end mt-2 mt-md-0">
          <CInputGroup className="mt-2 mt-md-0" style={{ width: 'auto', display: 'inline-block' }}>
            <div className="d-inline-flex align-items-center">
              <span>Mostrar&nbsp;</span>
              <CFormSelect
                style={{ width: '80px', display: 'inline-block', textAlign: 'center' }}
                onChange={(e) => {
                  setPeriodosPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                value={periodosPerPage}
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

      {/* Tabla con scroll, con cabecera fija y botones fijos */}
      <div style={{ maxHeight: '400px', overflowY: 'auto', overflowX: 'hidden' }}>
        <CTable striped bordered hover responsive>
          <CTableHead style={{ position: 'sticky', top: '0', backgroundColor: 'white', zIndex: '1' }}>
            <CTableRow>
              <CTableHeaderCell>#</CTableHeaderCell>
              <CTableHeaderCell>Fecha Inicio</CTableHeaderCell>
              <CTableHeaderCell>Fecha Fin</CTableHeaderCell>
              <CTableHeaderCell>Año Académico</CTableHeaderCell>
              <CTableHeaderCell>Estado</CTableHeaderCell>
              <CTableHeaderCell>Acciones</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {currentPeriodos.length > 0 ? (
              currentPeriodos.map((periodo, index) => (
                <CTableRow key={periodo.Cod_periodo_matricula}>
                  <CTableDataCell>{index + 1}</CTableDataCell>
                  <CTableDataCell>{periodo.Fecha_inicio}</CTableDataCell>
                  <CTableDataCell>{periodo.Fecha_fin}</CTableDataCell>
                  <CTableDataCell>{periodo.Anio_academico}</CTableDataCell>
                  <CTableDataCell>
                    {periodo.estado === 'activo' ? (
                      <CIcon icon={cilCheckCircle} className="text-success" />
                    ) : (
                      <CIcon icon={cilXCircle} className="text-danger" />
                    )}
                  </CTableDataCell>
                  <CTableDataCell className="text-end">
  <CButton
    color="warning"
    className="me-2"
    style={{ opacity: 0.8 }}  // Opacidad ajustada
    onClick={() => handleEditClick(periodo)}
  >
    <CIcon icon={cilPen} />
  </CButton>
  <CButton
    color="danger"
    style={{ opacity: 0.8 }}  // Opacidad ajustada
    onClick={() => eliminarPeriodo(periodo.Cod_periodo_matricula)}
  >
    <CIcon icon={cilTrash} />
  </CButton>
</CTableDataCell>

                </CTableRow>
              ))
            ) : (
              <CTableRow>
                <CTableDataCell colSpan="6" className="text-center">
                  No hay periodos disponibles
                </CTableDataCell>
              </CTableRow>
            )}
          </CTableBody>
        </CTable>
      </div>

      {/* Paginación */}
      <div className="pagination-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CPagination aria-label="Page navigation">
          <CButton
            style={{ backgroundColor: '#6c757d', color: '#fff', marginRight: '0.3cm' }}
            disabled={currentPage === 1}
            onClick={() => paginate(currentPage - 1)}
          >
            Anterior
          </CButton>
          <CButton
            style={{ backgroundColor: '#6c757d', color: '#fff' }}
            disabled={currentPage === Math.ceil(filteredPeriodos.length / periodosPerPage)}
            onClick={() => paginate(currentPage + 1)}
          >
            Siguiente
          </CButton>
        </CPagination>
        <span className="ms-3">
          Página {currentPage} de {Math.ceil(filteredPeriodos.length / periodosPerPage)}
        </span>
      </div>

      {/* Modal */}
      <CModal visible={modalVisible} onClose={closeModal} backdrop="static">
        <CModalHeader>
          <CModalTitle>{editar ? 'Editar Periodo' : 'Agregar Periodo'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm onSubmit={editar ? actualizarPeriodo : handleSubmit}>
            <CInputGroup className="mb-3">
              <CInputGroupText>Fecha Inicio</CInputGroupText>
              <CFormInput
                type="date"
                name="fecha_inicio"
                value={nuevoPeriodo.fecha_inicio}
                onChange={(e) => handleInputChange(e)}
                required
              />
            </CInputGroup>
            <CInputGroup className="mb-3">
              <CInputGroupText>Fecha Fin</CInputGroupText>
              <CFormInput
                type="date"
                name="fecha_fin"
                value={nuevoPeriodo.fecha_fin}
                onChange={(e) => handleInputChange(e)}
                required
              />
            </CInputGroup>
            <CInputGroup className="mb-3">
              <CInputGroupText>Año Académico</CInputGroupText>
              <CFormInput
                type="text"
                name="anio_academico"
                value={nuevoPeriodo.anio_academico}
                onChange={(e) => handleInputChange(e)}
                required
              />
            </CInputGroup>
            <CInputGroup className="mb-3">
              <CInputGroupText>Estado</CInputGroupText>
              <CFormSelect
                name="estado"
                value={nuevoPeriodo.estado}
                onChange={(e) => handleInputChange(e)}
                required
              >
                <option value="">Seleccione</option>
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
              </CFormSelect>
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

export default PeriodosMatricula;
