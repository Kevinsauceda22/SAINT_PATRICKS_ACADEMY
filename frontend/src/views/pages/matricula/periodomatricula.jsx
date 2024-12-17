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
import logo from 'src/assets/brand/logo_saint_patrick.png';

import usePermission from '../../../../context/usePermission';
import AccessDenied from "../AccessDenied/AccessDenied"

const PeriodosMatricula = () => {
  const { canSelect, loading, canDelete, canInsert, canUpdate } = usePermission('ListaHistorial');

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
      const response = await fetch('http://74.50.68.87:4000/api/periodomatricula/periodos');
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
      const response = await fetch('http://74.50.68.87:4000/api/periodomatricula/crearperiodomatricula', {
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

      const response = await fetch(`http://74.50.68.87:4000/api/periodomatricula/periodos/${id}`, {
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
        const response = await fetch(`http://74.50.68.87:4000/api/periodomatricula/periodos/${id}`, {
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

    // Configurar la imagen del logo
    const img = new Image();
    img.src = logo; // Asegúrate de importar el logo desde el directorio correspondiente

    img.onload = () => {
        // Añadir el logo en la esquina superior izquierda
        doc.addImage(img, 'PNG', 10, 10, 30, 30);

        // Encabezado del documento
        doc.setFontSize(18);
        doc.setTextColor(0, 102, 51); // Verde oscuro
        doc.text(
            "SAINT PATRICK'S ACADEMY",
            doc.internal.pageSize.width / 2,
            20,
            { align: 'center' }
        );

        // Título del reporte
        doc.setFontSize(14);
        doc.text(
            'Reporte de Periodos de Matrícula',
            doc.internal.pageSize.width / 2,
            30,
            { align: 'center' }
        );

        // Detalles de la institución
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(
            'Casa Club del periodista, Colonia del Periodista',
            doc.internal.pageSize.width / 2,
            40,
            { align: 'center' }
        );
        doc.text(
            'Teléfono: (504) 2234-8871',
            doc.internal.pageSize.width / 2,
            45,
            { align: 'center' }
        );
        doc.text(
            'Correo: info@saintpatrickacademy.edu',
            doc.internal.pageSize.width / 2,
            50,
            { align: 'center' }
        );

        // Línea divisoria
        doc.setLineWidth(0.5);
        doc.setDrawColor(0, 102, 51); // Verde oscuro
        doc.line(10, 55, doc.internal.pageSize.width - 10, 55);

        // Título de la tabla
        doc.setFontSize(12);
        doc.setTextColor(0, 51, 102); // Azul oscuro
        doc.text(
            'Detalles de los Periodos de Matrícula',
            doc.internal.pageSize.width / 2,
            65,
            { align: 'center' }
        );

        // Configurar la tabla de periodos con diseño mejorado
        doc.autoTable({
            startY: 75,
            head: [['#', 'Fecha Inicio', 'Fecha Fin', 'Año Académico', 'Estado']],
            body: periodos.map((periodo, index) => [
                index + 1,
                periodo.Fecha_inicio || 'N/A',
                periodo.Fecha_fin || 'N/A',
                periodo.Anio_academico || 'N/A',
                periodo.estado || 'N/A',
            ]),
            styles: {
                fontSize: 10,
                textColor: [34, 34, 34], // Gris oscuro para texto
                cellPadding: 4,
                valign: 'middle',
                overflow: 'linebreak',
            },
            headStyles: {
                fillColor: [0, 102, 51], // Verde oscuro para encabezados
                textColor: [255, 255, 255],
                fontSize: 10,
            },
            alternateRowStyles: { fillColor: [240, 248, 255] }, // Azul claro alternado para filas
            margin: { left: 10, right: 10 },
        });

        // Pie de página con fecha, hora y número de página
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            const creationDateTime = new Date().toLocaleString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
            });

            // Fecha y hora alineada a la izquierda
            doc.setFontSize(10);
            doc.setTextColor(100);
            doc.text(
                `Fecha y Hora de Generación: ${creationDateTime}`,
                10,
                doc.internal.pageSize.height - 10
            );

            // Número de página alineado a la derecha
            doc.text(
                `Página ${i} de ${pageCount}`,
                doc.internal.pageSize.width - 30,
                doc.internal.pageSize.height - 10,
                { align: 'right' }
            );
        }

        // Generar el archivo PDF como un Blob y abrirlo en una nueva pestaña
        const pdfBlob = doc.output('blob'); // Genera el PDF como un Blob
        const pdfURL = URL.createObjectURL(pdfBlob); // Crea una URL para el Blob
        window.open(pdfURL); // Abre el archivo PDF en una nueva pestaña
    };

    img.onerror = () => {
        Swal.fire('Error', 'No se pudo cargar el logo.', 'error');
    };
};

  const toggleEstado = async (periodo) => {
    try {
      const nuevoEstado = periodo.estado === 'activo' ? 'inactivo' : 'activo';
  
      // Realizar la solicitud al backend para actualizar el estado
      const response = await fetch('http://74.50.68.87:4000/api/periodomatricula/estado', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          p_cod_periodo_matricula: periodo.Cod_periodo_matricula,
          p_estado: nuevoEstado,
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.Mensaje || 'Error al cambiar el estado del periodo');
      }
  
      const result = await response.json();
      Swal.fire('Éxito', result.Mensaje, 'success');
  
      // Actualizar el estado local del periodo
      const updatedPeriodos = periodos.map((p) =>
        p.Cod_periodo_matricula === periodo.Cod_periodo_matricula ? { ...p, estado: nuevoEstado } : p
      );
  
      setPeriodos(updatedPeriodos);
      setFilteredPeriodos(updatedPeriodos); // Actualizar la tabla visible
    } catch (err) {
      console.error('Error al cambiar el estado del periodo:', err);
      Swal.fire('Error', err.message, 'error');
    }
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
    // Verificar permisos
    if (!canSelect) {
      return <AccessDenied />;
    }
  return (
    <CContainer>
      <CRow className="align-items-center mb-5">
        <CCol xs="8" md="9">
          <h1>Mantenimiento Periodo Matrícula</h1>
        </CCol>
        <CCol xs="4" md="3" className="text-end">

          {canInsert && (
  <CButton color="dark" onClick={() => setModalVisible(true)} className="me-2" style={{ backgroundColor: '#4B6251', borderColor: '#0F463A' }}>
    <CIcon icon={cilPlus} /> Nuevo
  </CButton>
          )}
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
        <CButton
  color={periodo.estado === 'activo' ? 'success' : 'danger'} // Cambiar colores
  onClick={() => toggleEstado(periodo)} // Llamada a la función toggleEstado
  style={{ opacity: 0.9 }}
>
  {periodo.estado === 'activo' ? 'Desactivar' : 'Activar'}
</CButton>

        </CTableDataCell>
        <CTableDataCell className="text-end">
          {canUpdate && (
            <CButton
              color="warning"
              className="me-2"
              style={{ opacity: 0.8 }}
              onClick={() => handleEditClick(periodo)}
            >
              <CIcon icon={cilPen} />
            </CButton>
          )}
          {canDelete && (
            <CButton
              color="danger"
              style={{ opacity: 0.8 }}
              onClick={() => eliminarPeriodo(periodo.Cod_periodo_matricula)}
            >
              <CIcon icon={cilTrash} />
            </CButton>
          )}
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
