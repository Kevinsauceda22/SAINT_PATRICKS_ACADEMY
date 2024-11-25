// Importaciones de librerías y componentes necesarios
import React, { useEffect, useState } from 'react';
import {
  CButton,
  CCard,
  CCardBody,
  CCol,
  CContainer,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CInputGroup,
  CInputGroupText,
  CFormInput,
  CFormSelect,
} from '@coreui/react';
import { CIcon } from '@coreui/icons-react';
import { cilBook, cilPlus, cilSettings, cilArrowCircleBottom, cilSearch } from '@coreui/icons';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import "jspdf-autotable";
import { useNavigate } from 'react-router-dom';
import logo from 'src/assets/brand/logo_saint_patrick.png';

const ListaGestion_Academica = () => {
  // Definición de estados
  const [agrupadores, setAgrupadores] = useState([]);
  const [periodos, setPeriodos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [nuevoAgrupador, setNuevoAgrupador] = useState({ totalSecciones: '', periodo: '' });
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1); // Página actual
  const [recordsPerPage, setRecordsPerPage] = useState(5); // Registros por página
  const [searchTerm, setSearchTerm] = useState(''); // Término de búsqueda
  const [searchField, setSearchField] = useState('Nombre_seccion'); // Campo por el que se busca

  // Hook para cargar datos al montar el componente
  useEffect(() => {
    fetchAgrupadores();
    fetchPeriodos();
  }, []);

  // Función para obtener agrupadores desde la API
  const fetchAgrupadores = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/gestion_academica/obtenerTodasAgrupaciones');
      if (!response.ok) throw new Error('Error en la respuesta del servidor');
      const data = await response.json();
      setAgrupadores(data); // Guardar los datos en el estado
    } catch (error) {
      Swal.fire('Error', 'No se pudieron obtener los agrupadores.', 'error');
    }
  };
  
  // Función para obtener periodos desde la API
  const fetchPeriodos = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/gestion_academica/obtener_periodo');
      if (!response.ok) throw new Error('Error en la respuesta del servidor');
      const data = await response.json();
      setPeriodos(data);
    } catch (error) {
      Swal.fire('Error', 'No se pudieron obtener los periodos.', 'error');
    }
  };

  // Función para obtener el año académico a partir del código de periodo de matrícula
  const getAnioAcademico = (Cod_periodo_matricula) => {
    if (periodos.length === 0) return 'Desconocido';
    const periodo = periodos.find((p) => p.Cod_periodo_matricula === Cod_periodo_matricula);
    return periodo ? periodo.Anio_academico : 'Desconocido';
  };

  // Función para navegar a la lista de secciones para gestionar
  const handleGestionarClick = (Cod_periodo_matricula) => {
    navigate(`/lista-secciones/`, { state: { periodoSeleccionado: Cod_periodo_matricula } });
  };

  // Función para descargar el PDF con los detalles del periodo
  const handleDescargarPDF = async (Cod_periodo_matricula) => {
    try {
      // Llamada a la API para obtener el año académico
      const responsePeriodo = await fetch(`http://localhost:4000/api/gestion_academica/detalle/${Cod_periodo_matricula}`);
      if (!responsePeriodo.ok) {
        throw new Error(`Error al obtener datos del período: ${responsePeriodo.status}`);
      }
      const periodoData = await responsePeriodo.json();
      const AnioAcademico = periodoData.Anio_academico || "Sin Año Académico";

      // Llamada a la API para obtener las secciones
      const responseSecciones = await fetch(`http://localhost:4000/api/gestion_academica/secciones_por_periodo/${Cod_periodo_matricula}`);
      if (!responseSecciones.ok) {
        throw new Error(`Error al obtener datos del servidor: ${responseSecciones.status}`);
      }
      const data = await responseSecciones.json();

      // Crear el documento PDF
      const doc = new jsPDF();
      const img = new Image();
      img.src = logo; // Asegúrate de tener el logo disponible y en la misma ruta

      img.onload = () => {
        const pageWidth = doc.internal.pageSize.width;

        // Encabezado del PDF
        doc.addImage(img, "PNG", 10, 10, 45, 45);
        doc.setFontSize(18);
        doc.setTextColor(0, 102, 51);
        doc.text("SAINT PATRICK'S ACADEMY", pageWidth / 2, 24, { align: "center" });

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text("Casa Club del periodista, Colonia del Periodista", pageWidth / 2, 32, { align: "center" });
        doc.text("Teléfono: (504) 2234-8871", pageWidth / 2, 37, { align: "center" });
        doc.text("Correo: info@saintpatrickacademy.edu", pageWidth / 2, 42, { align: "center" });

        doc.setFontSize(14);
        doc.setTextColor(0, 102, 51);
        doc.text(`Listado de Secciones - Año Académico ${AnioAcademico}`, pageWidth / 2, 50, { align: "center" });

        doc.setLineWidth(0.5);
        doc.setDrawColor(0, 102, 51);
        doc.line(10, 55, pageWidth - 10, 55);

        // Tabla de datos
        const tableColumn = ["#", "Sección", "Aula", "Grado", "Profesor"];
        const tableRows = data.map((seccion, index) => [
          { content: (index + 1).toString(), styles: { halign: "center" } },
          { content: seccion.Nombre_seccion?.toUpperCase() || "SIN NOMBRE", styles: { halign: "center" } },
          { content: seccion.Aula?.toString() || "SIN AULA", styles: { halign: "center" } },
          seccion.Grado?.toUpperCase() || "SIN GRADO",
          { content: seccion.Profesor?.toUpperCase() || "SIN PROFESOR", styles: { halign: "left" } },
        ]);

        doc.autoTable({
          startY: 70,
          head: [tableColumn],
          body: tableRows,
          headStyles: {
            fillColor: [0, 102, 51],
            textColor: [255, 255, 255],
            fontSize: 10,
            halign: "center",
          },
          styles: {
            fontSize: 10,
            cellPadding: 3,
          },
          alternateRowStyles: {
            fillColor: [240, 248, 255],
          },
          didDrawPage: (data) => {
            const pageCount = doc.internal.getNumberOfPages();
            const pageCurrent = doc.internal.getCurrentPageInfo().pageNumber;

            // Pie de página
            const footerY = doc.internal.pageSize.height - 10;
            doc.setFontSize(10);
            doc.setTextColor(0, 102, 51);
            doc.text(
              `Página ${pageCurrent} de ${pageCount}`,
              pageWidth - 10,
              footerY,
              { align: "right" }
            );

            const now = new Date();
            const dateString = now.toLocaleDateString("es-HN", {
              year: "numeric",
              month: "long",
              day: "numeric",
            });
            const timeString = now.toLocaleTimeString("es-HN", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            });
            doc.text(`Fecha de generación: ${dateString} Hora: ${timeString}`, 10, footerY);
          },
        });

        // Convertir PDF en Blob y mostrarlo en una nueva ventana
        const pdfBlob = doc.output("blob");
        const pdfURL = URL.createObjectURL(pdfBlob);

        // Crear ventana con visor de PDF
        const newWindow = window.open("", "_blank");
        newWindow.document.title = `Reporte de Secciones - Año ${AnioAcademico}`;
        newWindow.document.write(`
          <html>
            <head>
              <title>Reporte de Secciones - Año ${AnioAcademico}</title>
              <style>
                body {
                  margin: 0;
                  padding: 0;
                  overflow: hidden;
                }
                iframe {
                  width: 100%;
                  height: 100%;
                  border: none;
                }
                .download-button {
                  position: fixed;
                  top: 10px;
                  right: 10px;
                  background-color: #6c757d;
                  color: white;
                  border: none;
                  padding: 10px 15px;
                  border-radius: 5px;
                  cursor: pointer;
                }
              </style>
            </head>
            <body>
              <iframe src="${pdfURL}"></iframe>
              <button class="download-button" 
                onclick="const a = document.createElement('a'); a.href='${pdfURL}'; a.download='Reporte_Secciones_${AnioAcademico}.pdf'; a.click();">
                Descargar PDF
              </button>
            </body>
          </html>
        `);
      };

      img.onerror = () => {
        Swal.fire("Error", "No se pudo cargar el logo.", "error");
      };
    } catch (error) {
      console.error("Error al generar el PDF:", error);
      Swal.fire("Error", "No se pudo generar el PDF.", "error");
    }
  };

  // Función para alternar la visibilidad del modal
  const toggleModal = () => setShowModal(!showModal);

  // Función para limpiar el formulario
  const limpiarFormulario = () => {
    setNuevoAgrupador({ totalSecciones: '', periodo: '' });
  };

  // Función para cerrar el modal
  const handleCloseModal = () => {
    // Verificar si hay datos ingresados en el formulario
    if (nuevoAgrupador.totalSecciones || nuevoAgrupador.periodo) {
      // Mostrar alerta de confirmación
      Swal.fire({
        title: '¿Estás seguro?',
        text: 'Perderás todos los datos ingresados si cierras el modal.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, cerrar',
        cancelButtonText: 'No, continuar',
      }).then((result) => {
        if (result.isConfirmed) {
          limpiarFormulario(); // Limpiar los datos del formulario
          setShowModal(false); // Cerrar el modal
        }
      });
    } else {
      // Cerrar el modal directamente si no hay datos ingresados
      setShowModal(false);
    }
  };

  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= Math.ceil(filteredAgrupadores.length / recordsPerPage)) {
      setCurrentPage(pageNumber);
    }
  };

  const normalizeString = (str) =>
    str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

  const filteredAgrupadores = agrupadores.filter((agrupador) => {
    const normalizedSearchTerm = normalizeString(searchTerm);
  
    if (searchField === 'Nombre_seccion') {
      return normalizeString(agrupador.Nombre_seccion || '').includes(normalizedSearchTerm);
    } else if (searchField === 'Total_secciones') {
      return normalizeString(agrupador.Total_secciones.toString()).includes(normalizedSearchTerm);
    } else if (searchField === 'Anio_academico') {
      return normalizeString(agrupador.Anio_academico.toString()).includes(normalizedSearchTerm);
    }
    return false;
  });

  const indexOfLastRecord = currentPage * recordsPerPage; // Último índice de registro
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage; // Primer índice de registro
  const currentRecords = filteredAgrupadores.slice(indexOfFirstRecord, indexOfLastRecord); // Registros actuales


  // Función para guardar un nuevo agrupador
  const handleGuardarAgrupador = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/gestion_academica/crear_agrupador', {
        method: 'POST',
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        Swal.fire('Advertencia', data.mensaje || 'No se pudo crear el agrupador.', 'warning');
        return;
      }
  
      Swal.fire('Éxito', 'Agrupador creado exitosamente.', 'success');
      fetchAgrupadores(); // Recargar los datos
      toggleModal(); // Cerrar el modal
    } catch (error) {
      console.error('Error al crear agrupador:', error);
      Swal.fire('Error', 'Ocurrió un error al intentar crear el agrupador.', 'error');
    }
  };
  
  return (
    <CContainer style={{ marginTop: '40px', maxWidth: '900px' }}>
  {/* Título centrado en negritas */}
  <CRow className="align-items-center justify-content-center mb-5">
    <CCol xs="12" className="text-center">
      <h1 className="fw-bold" style={{ color: '#333' }}>
        <CIcon icon={cilBook} className="me-2" />
        Gestión Académica
      </h1>
    </CCol>
  </CRow>

  {/* Barra de búsqueda y selector de registros */}
  <CRow className="align-items-center mb-4">
    <CCol xs="12" md="8">
      <CInputGroup>
        <CInputGroupText>
          <CIcon icon={cilSearch} />
        </CInputGroupText>
        <CFormInput
          placeholder="Buscar Agrupador..."
          onChange={(e) => setSearchTerm(e.target.value)}
          value={searchTerm}
        />
        <CFormSelect
          aria-label="Buscar por"
          onChange={(e) => setSearchField(e.target.value)}
          style={{ marginLeft: '10px' }}
        >
          <option value="Nombre_seccion">Nombre Sección</option>
          <option value="Total_secciones">Total Secciones</option>
          <option value="Anio_academico">Año Académico</option>
        </CFormSelect>
      </CInputGroup>
    </CCol>

    <CCol xs="12" md="4" className="text-md-end mt-3 mt-md-0">
      <CInputGroup style={{ width: 'auto', display: 'inline-block' }}>
        <div className="d-inline-flex align-items-center">
          <span>Mostrar&nbsp;</span>
          <CFormSelect
            style={{ width: '80px', display: 'inline-block', textAlign: 'center' }}
            onChange={(e) => {
              const value = Number(e.target.value);
              setRecordsPerPage(value);
              setCurrentPage(1);
            }}
            value={recordsPerPage}
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

  {/* Botón "Nuevo" alineado a la derecha */}
  <CRow className="align-items-center mb-4">
    <CCol xs="12" className="text-end">
      <CButton
        className="d-flex align-items-center gap-1 rounded shadow"
        style={{
          backgroundColor: '#4B6251',
          color: 'white',
          padding: '10px 16px',
          fontSize: '0.9rem',
        }}
        onClick={() => setShowModal(true)}
      >
        <CIcon icon={cilPlus} /> Nuevo
      </CButton>
    </CCol>
  </CRow>

  {/* Tabla de agrupadores */}
  <CCard>
    <CCardBody>
      <div className="table-container mt-4" style={{ overflowX: 'auto', marginBottom: '20px' }}>
        <CTable striped bordered hover>
    <CTableHead>
      <CTableRow>
        <CTableHeaderCell className="text-center">#</CTableHeaderCell>
        <CTableHeaderCell className="text-center">Total Secciones</CTableHeaderCell>
        <CTableHeaderCell className="text-center">Año Académico</CTableHeaderCell>
        <CTableHeaderCell className="text-center">Fecha de Creación</CTableHeaderCell>
        <CTableHeaderCell className="text-center">Estado</CTableHeaderCell>
        <CTableHeaderCell className="text-center">Acciones</CTableHeaderCell>
      </CTableRow>
    </CTableHead>
    <CTableBody>
      {agrupadores.length > 0 ? (
        agrupadores.map((agrupador, index) => (
          <CTableRow
            key={agrupador.Cod_agrupadora}
            style={{
              backgroundColor: agrupador.Estado === 'Activo' ? '#eaffea' : 'inherit', // Fondo verde si está activo
              fontWeight: agrupador.Estado === 'Activo' ? 'bold' : 'normal', // Negritas si está activo
            }}
          >
            <CTableDataCell className="text-center">{index + 1}</CTableDataCell>
            <CTableDataCell className="text-center">{agrupador.Total_secciones}</CTableDataCell>
            <CTableDataCell className="text-center">{agrupador.Anio_academico}</CTableDataCell>
            <CTableDataCell className="text-center">
              {new Date(agrupador.Fecha_agrupacion).toLocaleDateString()}
            </CTableDataCell>
            <CTableDataCell className="text-center">
              <span
                style={{
                  color: agrupador.Estado === 'Activo' ? 'green' : 'red',
                  fontWeight: agrupador.Estado === 'Activo' ? 'bold' : 'normal',
                }}
              >
                {agrupador.Estado}
              </span>
            </CTableDataCell>
            <CTableDataCell className="text-center">
              <div className="d-flex justify-content-center gap-2">
                <CButton
                  color="info"
                  onClick={() => handleGestionarClick(agrupador.Cod_periodo_matricula)}
                  className="d-flex align-items-center"
                >
                  <CIcon icon={cilSettings} />
                </CButton>
                <CButton
                  color="warning"
                  onClick={() => handleDescargarPDF(agrupador.Cod_periodo_matricula)}
                  className="d-flex align-items-center"
                >
                  <CIcon icon={cilArrowCircleBottom} className="me-1" /> PDF
                </CButton>
              </div>
            </CTableDataCell>
          </CTableRow>
        ))
      ) : (
        <CTableRow>
          <CTableDataCell colSpan="6" className="text-center">
            No hay agrupadores disponibles.
          </CTableDataCell>
        </CTableRow>
      )}
    </CTableBody>
  </CTable>
      </div>
    </CCardBody>
  </CCard>

  {/* Paginación */}
  <div
    className="pagination-container"
    style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: '20px',
    }}
  >
    <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
      <CButton
        style={{
          backgroundColor: '#6f8173',
          color: '#D9EAD3',
          padding: '8px 16px',
          borderRadius: '8px',
          fontSize: '0.9rem',
          fontWeight: 'bold',
        }}
        disabled={currentPage === 1}
        onClick={() => paginate(currentPage - 1)}
      >
        Anterior
      </CButton>

      <CButton
        style={{
          backgroundColor: '#6f8173',
          color: '#D9EAD3',
          padding: '8px 16px',
          borderRadius: '8px',
          fontSize: '0.9rem',
          fontWeight: 'bold',
        }}
        disabled={currentPage === Math.ceil(filteredAgrupadores.length / recordsPerPage)}
        onClick={() => paginate(currentPage + 1)}
      >
        Siguiente
      </CButton>
    </div>
    <span style={{ fontSize: '0.9rem', color: '#6f8173' }}>
      Página {currentPage} de {Math.ceil(filteredAgrupadores.length / recordsPerPage)}
    </span>
  </div>

  {/* Modal para crear un nuevo agrupador */}
  <CModal visible={showModal} onClose={handleCloseModal}>
    <CModalHeader onClose={handleCloseModal}>
      <CModalTitle>Crear Nuevo Agrupador</CModalTitle>
    </CModalHeader>
    <CModalBody>
      <p>
        Este proceso agrupará automáticamente las secciones del periodo académico activo.
        ¿Deseas continuar?
      </p>
    </CModalBody>
    <CModalFooter>
      <CButton color="secondary" onClick={handleCloseModal}>
        Cancelar
      </CButton>
      <CButton color="primary" onClick={handleGuardarAgrupador}>
        Confirmar
      </CButton>
    </CModalFooter>
  </CModal>
</CContainer>

  );
};

export default ListaGestion_Academica;
