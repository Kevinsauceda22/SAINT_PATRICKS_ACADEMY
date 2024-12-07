import React, { useState, useEffect } from 'react';
import CIcon from '@coreui/icons-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { cilSearch, cilArrowLeft, cilPen, cilSave, cilDescription, cilArrowCircleBottom } from '@coreui/icons';
import swal from 'sweetalert2';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import logo from 'src/assets/brand/logo_saint_patrick.png';
import {
  CButton, CContainer, CDropdown, CDropdownMenu, CDropdownToggle, CDropdownItem,
  CFormInput, CInputGroup, CInputGroupText, CModal, CModalHeader, CModalTitle, 
  CModalBody, CModalFooter, CPagination, CTable, CTableHead, CTableRow, 
  CTableHeaderCell, CTableBody, CTableDataCell, CFormSelect, CRow, CCol, CFormCheck
} from '@coreui/react';

const ListaSecciones_Asignaturas = () => {
  // Estados para gestionar la información de las secciones y asignaturas
  const [secciones_asignaturas, setSecciones_Asignaturas] = useState([]);
  const [secciones, setSecciones] = useState([]);
  const [dias, setDias] = useState([]);
  const [grados_asignaturas, setGradosAsignaturas] = useState([]);
  const [filterAsignatura, setFilterAsignatura] = useState('');

  // Estados para la visibilidad de los modales 
  const [modalUpdateVisible, setModalUpdateVisible] = useState(false);
  const [seccionAsignaturaToUpdate, setSeccionesAsignaturasToUpdate] = useState({});
  const [esPeriodoActivo, setEsPeriodoActivo] = useState(true); // Asumir activo por defecto

  // Otros estados para manejar la navegación, búsqueda y cambios sin guardar
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [selectedGrado, setSelectedGrado] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  //const { seccionSeleccionada, periodoSeleccionado, gradoSeleccionado } = location.state || {};
  const { seccionSeleccionada, periodoSeleccionado, gradoSeleccionado, profesores } = location.state || {};
  const [filteredProfesores, setFilteredProfesores] = useState([]);

  // Efecto para verificar si hay datos de sección y período seleccionados
  useEffect(() => {
    if (!seccionSeleccionada || !periodoSeleccionado) {
      swal.fire('Error', 'Faltan datos para gestionar las asignaturas.', 'error');
      navigate('/lista-secciones');
    } 
  }, [seccionSeleccionada, periodoSeleccionado]);

  // Efecto para obtener las asignaturas y horas cuando se han seleccionado grado y sección
  useEffect(() => {
    if (grados_asignaturas.length > 0 && gradoSeleccionado && seccionSeleccionada) {
      fetchSeccionesAsigyHora();
    }
  }, [grados_asignaturas, gradoSeleccionado, seccionSeleccionada]);

  // Efecto para obtener todas las secciones, días y grados asignaturas al cargar el componente
  useEffect(() => {
    fetchSecciones();
    fetchDias();
    fetchGradosAsignaturas();
  }, []);

  // Efecto para obtener las secciones según el grado seleccionado
  useEffect(() => {
    if (selectedGrado) {
      console.log("Llamando a fetchSeccionesPorGrado con:", selectedGrado);
      fetchSeccionesPorGrado(selectedGrado);
    }
  }, [selectedGrado]);

  // Efecto para establecer los profesores al llegar de la vista anterior
  useEffect(() => {
    if (profesores && profesores.length > 0) {
      setFilteredProfesores(profesores); // Si profesores están disponibles, los asignamos al estado
    }
  }, [profesores]);

  // Efecto para el estado activo
  useEffect(() => {
    if (periodoSeleccionado) {
      fetchPeriodoEstado();
    }
  }, [periodoSeleccionado]);  

 
  // Función para obtener las asignaturas y horas de una sección específica
  const fetchSeccionesAsigyHora = async () => {
    try {
      const response = await fetch(`http://localhost:4000/api/secciones_asignaturas/asignaturas/${seccionSeleccionada}`);
      const data = await response.json();
      console.log("Datos crudos recibidos de la API:", data);
  
      if (response.ok) {
        // Verificar si 'data' tiene el campo 'Nombre_completo' correctamente
        setSecciones_Asignaturas(data.map((item) => ({
          ...item,
          Nombre_profesor: item.profesor ? item.profesor.Nombre_completo : 'Sin profesor asignado',
        })));
        
        console.log("Datos con Nombre_profesor asignado:", data);
      } else {
        setSecciones_Asignaturas([]);
        swal.fire('Atención', 'No se encontraron asignaturas para esta sección.', 'info');
      }
    } catch (error) {
      console.error('Error capturado en este bloque:', error); // Registro detallado
        console.error('Error al cargar las asignaturas:', error);
        swal.fire('Error', 'Hubo un problema al cargar las asignaturas.', 'error');
      }
  };

  // Función para obtener las secciones basadas en el grado y el período de matrícula
  const fetchSecciones = async (Cod_grado, Cod_periodo_matricula) => { 
    try {
      const response = await fetch(
        `http://localhost:4000/api/secciones_asignaturas/secciones/${Cod_grado}/${Cod_periodo_matricula}`
      );
  
      if (!response.ok) {
        throw new Error('No se encontraron secciones para este grado y periodo.');
      }
  
      const data = await response.json();
      setSecciones(data);
    } catch (error) {
      console.error('Error capturado en este bloque:', error); // Registro detallado
        console.error('Error al cargar secciones:', error);
        setSecciones([]); // Limpia el estado si ocurre un error
      }
  };

  // Función para obtener secciones según el grado seleccionado
  const fetchSeccionesPorGrado = async (Cod_grado) => {
    if (!Cod_grado || !periodoSeleccionado) {
      console.error('Cod_grado o periodoSeleccionado están indefinidos.');
      return;
    }
  
    console.log("Cod_grado enviado al backend:", Cod_grado);
    console.log("Cod_periodo_matricula enviado al backend:", periodoSeleccionado);
  
    try {
      const response = await fetch(
        `http://localhost:4000/api/secciones_asignaturas/secciones/${Cod_grado}/${periodoSeleccionado}`
      );
  
      if (!response.ok) {
        throw new Error('No se encontraron secciones para este grado y periodo.');
      }
  
      const data = await response.json();
      setSecciones(data); // Actualiza el estado con las secciones filtradas
    } catch (error) {
      console.error('Error capturado en este bloque:', error); // Registro detallado
        console.error('Error al obtener secciones:', error);
        setSecciones([]); // Limpia el estado si ocurre un error
      }
  };

  // Funcion periodo activo
  const fetchPeriodoEstado = async () => {
    try {
      const response = await fetch(`http://localhost:4000/api/gestion_academica/obtener_periodo`);
      const data = await response.json();
  
      // Encuentra el período seleccionado y actualiza su estado
      const periodoEncontrado = data.find(p => p.Cod_periodo_matricula === periodoSeleccionado);
      if (periodoEncontrado) {
        setEsPeriodoActivo(periodoEncontrado.Estado === 'activo');
      } else {
        console.warn('Período no encontrado.');
        setEsPeriodoActivo(false); // Inactivo si no se encuentra
      }
    } catch (error) {
      console.error('Error capturado en este bloque:', error); // Registro detallado
        console.error('Error al obtener el estado del período:', error);
        setEsPeriodoActivo(false); // Asume inactivo en caso de error
      }
  };  

  // Función para obtener los días disponibles
  const fetchDias = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/secciones_asignaturas/dias');
      const data = await response.json();
      setDias(data);
    } catch (error) {
      console.error('Error capturado en este bloque:', error); // Registro detallado
        console.error('Error al cargar días:', error);
      }
  };

  // Función para obtener los grados y asignaturas disponibles
  const fetchGradosAsignaturas = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/secciones_asignaturas/grados_asignaturas');
      const data = await response.json();
      setGradosAsignaturas(data);
      console.log('Datos cargados en grados_asignaturas:', data); // <-- Aquí imprimimos los datos obtenidos
    } catch (error) {
      console.error('Error capturado en este bloque:', error); // Registro detallado
        console.error('Error al cargar los grados y asignaturas:', error);
      }
  };

  // Función para volver a la lista de secciones
  const volverAListaSecciones = () => {
    navigate('/lista-secciones', {
      state: { periodoSeleccionado }
    });
  };

  // Función para obtener el nombre del profesor
  const obtenerNombreProfesor = (codProfesor) => {
    const profesor = profesores.find(p => p.Cod_profesor === codProfesor);
    return profesor ? profesor.Nombre_completo : 'Profesor no disponible';
  };
  

  // Función para abrir el modal de actualización de una sección-asignatura
  const openUpdateModal = async (seccionAsignatura) => {
    console.log("Datos de seccionAsignatura recibidos:", seccionAsignatura);
    try {
      // Setear datos iniciales para el modal
      setSeccionesAsignaturasToUpdate({
        p_Cod_seccion_asignatura: seccionAsignatura.Cod_seccion_asignatura || '',
        p_Cod_grados_asignaturas: seccionAsignatura.Cod_grados_asignaturas || '',
        p_Cod_secciones: seccionAsignatura.Cod_secciones || '',
        p_Cod_dias: seccionAsignatura.Cod_dias || '',
        p_dias: seccionAsignatura.dias || '',
        p_Hora_inicio: seccionAsignatura.Hora_inicio || '',
        p_Hora_fin: seccionAsignatura.Hora_fin || '',
        p_Cod_grado: seccionAsignatura.Nombre_grado || '',  // Predefinir el grado asociado
        p_Nombre_seccion: seccionAsignatura.Nombre_seccion || '', // Predefinir el nombre de la sección// Nombre del grado asociado
      });

      // Realizar el fetch para obtener las asignaturas del grado asociado
      const response = await fetch(
        `http://localhost:4000/api/secciones_asignaturas/asignaturasgrados/${seccionSeleccionada}`
      );
      console.log("Cod_secciones enviado:", seccionAsignatura.Cod_secciones);
      const data = await response.json();
      console.log('Datos de dentro', data);
      if (response.ok) {
        setGradosAsignaturas(data); // Actualizar las asignaturas del grado específico
      } else {
        console.error("Error al cargar las asignaturas:", data.mensaje);
        swal.fire("Error", "No se pudieron cargar las asignaturas.", "error");
      }

      setModalUpdateVisible(true); // Mostrar el modal de actualización
    } catch (error) {
      console.error('Error capturado en este bloque:', error); // Registro detallado
        console.error("Error al abrir el modal de actualización:", error);
        swal.fire("Error", "Hubo un problema al abrir el modal de actualización.", "error");
      }
  };
  

  // Función para manejar la actualización de una sección asignatura
  const handleUpdateSeccionAsignatura = async () => {
    if (
      !seccionAsignaturaToUpdate.p_Cod_seccion_asignatura ||
      !seccionAsignaturaToUpdate.p_Cod_secciones ||
      !seccionAsignaturaToUpdate.p_Hora_inicio ||
      !seccionAsignaturaToUpdate.p_Hora_fin ||
      !seccionAsignaturaToUpdate.p_Cod_grados_asignaturas ||
      !seccionAsignaturaToUpdate.p_Cod_dias
    ) {
      swal.fire("Error", "Todos los campos son requeridos.", "error");
      return;
    }
  
    try {
      // Obtener nombres de los días seleccionados
      const nombresDias = dias
        .filter((dia) => seccionAsignaturaToUpdate.p_Cod_dias.includes(dia.Cod_dias))
        .map((dia) => dia.prefijo_dia.toUpperCase())
        .join(", ");
  
      const response = await fetch(
        "http://localhost:4000/api/secciones_asignaturas/actualizar_seccion_asig",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...seccionAsignaturaToUpdate,
            p_Cod_dias: seccionAsignaturaToUpdate.p_Cod_dias.join(","),
            p_Dias_nombres: nombresDias, // Enviar los nombres de los días
          }),
        }
      );
  
      if (response.ok) {
        swal.fire("Éxito", "Sección asignatura actualizada correctamente.", "success");
        setModalUpdateVisible(false);
        fetchSeccionesAsigyHora(); // Recargar los datos
      } else {
        const errorData = await response.json();
        swal.fire("Error", errorData.mensaje || "Error al actualizar la sección asignatura.", "error");
      }
    } catch (error) {
      console.error('Error capturado en este bloque:', error); // Registro detallado
        console.error("Error al actualizar la sección asignatura:", error);
        swal.fire("Error", "Error en el servidor.", "error");
      }
  };
  

  // Función para manejar el cierre del modal y restablecer los estados
  const handleCloseModal = () => {
    swal.fire({
      title: '¿Estás seguro?',
      text: 'Tienes cambios sin guardar. ¿Deseas cerrar el modal?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Cerrar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        setModalUpdateVisible(false);
      }
    });
  };


  // Función para generar PDF
  const generateSeccionesAsignaturasPDF = () => {
    const doc = new jsPDF();
  
    if (!filteredSeccionesAsignaturas || filteredSeccionesAsignaturas.length === 0) {
      alert('No hay datos para exportar.');
      return;
    }
  
    const img = new Image();
    img.src = logo;
  
    // Información para el reporte
    const grado = gradoSeleccionado || 'Grado no disponible';
    const seccion = filteredSeccionesAsignaturas[0]?.Nombre_seccion || 'Sección no disponible';

    const profesorCod = filteredSeccionesAsignaturas[0]?.Cod_profesor;
    const profesor = obtenerNombreProfesor(profesorCod);
    console.log('Profesor:', profesor); // Verificar el nombre del profesor
  
    img.onload = () => {
      const pageWidth = doc.internal.pageSize.width;
  
      // Encabezado
      doc.addImage(img, 'PNG', 10, 10, 45, 45);
      doc.setFontSize(18);
      doc.setTextColor(0, 102, 51);
      doc.text("SAINT PATRICK'S ACADEMY", pageWidth / 2, 24, { align: 'center' });
  
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text('Casa Club del periodista, Colonia del Periodista', pageWidth / 2, 32, { align: 'center' });
      doc.text('Teléfono: (504) 2234-8871', pageWidth / 2, 37, { align: 'center' });
      doc.text('Correo: info@saintpatrickacademy.edu', pageWidth / 2, 42, { align: 'center' });
  
      // Subtítulo
      doc.setFontSize(14);
      doc.setTextColor(0, 102, 51);
      doc.text('Horario - Año Académico 2025', pageWidth / 2, 50, { align: 'center' });
  
      // Línea de separación
      doc.setLineWidth(0.5);
      doc.setDrawColor(0, 102, 51);
      doc.line(10, 55, pageWidth - 10, 55);
  
      // Información del reporte
      doc.setFontSize(10);
      doc.setTextColor(50); // Gris oscuro
      doc.text('INFORMACIÓN GENERAL:', 10, 65);
      doc.setFontSize(9);
      doc.text(`GRADO: ${grado}`, 10, 72);
      doc.text(`SECCIÓN: ${seccion}`, 10, 78);
      doc.text(`MAESTRO GUÍA: ${profesor}`, 10, 84);
  
      // Línea de separación antes de la tabla
      doc.setLineWidth(0.5);
      doc.setDrawColor(0, 102, 51);
      doc.line(10, 88, pageWidth - 10, 88);
  
      // Tabla de datos (formato original)
      const tableColumn = ['#', 'Asignatura', 'Días', 'Hora Inicio', 'Hora Fin'];

      // Mapeo para el orden lógico de los días de la semana
      const diasOrden = {
        'LU': 1,
        'MAR': 2,
        'MIE': 3,
        'JUE': 4,
        'VIE': 5,
        'SAB': 6,
        'DOM': 7,
      };

      const tableRows = filteredSeccionesAsignaturas.map((item, index) => [
        { content: (index + 1).toString(), styles: { halign: 'center' } },
        item.Nombre_asignatura?.toUpperCase() || 'SIN ASIGNATURA',
        item.Dias_nombres
          ? item.Dias_nombres.split(',') // Divide los días en un array
              .map((dia) => dia.trim().toUpperCase()) // Asegura que estén en mayúsculas
              .sort((a, b) => (diasOrden[a] || 99) - (diasOrden[b] || 99)) // Ordena según el índice lógico
              .join(', ') // Une nuevamente en un string
          : 'SIN DÍAS',
        { content: item.Hora_inicio || '00:00', styles: { halign: 'center' } },
        { content: item.Hora_fin || '00:00', styles: { halign: 'center' } },
      ]);

      doc.autoTable({
        startY: 95,
        head: [tableColumn],
        body: tableRows,
        headStyles: {
          fillColor: [0, 102, 51],
          textColor: [255, 255, 255],
          fontSize: 10,
          halign: 'center',
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
          doc.text(`Página ${pageCurrent} de ${pageCount}`, pageWidth - 10, footerY, { align: 'right' });
  
          const now = new Date();
          const dateString = now.toLocaleDateString('es-HN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          });
          const timeString = now.toLocaleTimeString('es-HN', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          });
          doc.text(`Fecha de generación: ${dateString} Hora: ${timeString}`, 10, footerY);
        },
      });
  
      // Convertir PDF en Blob
      const pdfBlob = doc.output('blob');
      const pdfURL = URL.createObjectURL(pdfBlob);
  
      // Crear ventana con visor
      const newWindow = window.open(pdfURL, '_blank');
      if (newWindow) {
        newWindow.document.title = 'Reporte de Secciones y Horarios';
      }
    };
  
    img.onerror = () => {
      alert('No se pudo cargar el logo.');
    };
  };  

  // Función para descargar el PDF con los detalles de una sección asignatura
  const handleDescargarPDFSeccionesAsignaturas = async (Cod_seccion_asignatura) => {
      try {
          // Llamada a la API para obtener los detalles de la sección asignatura
          const response = await fetch(`http://localhost:4000/api/secciones_asignaturas/detalle/${Cod_seccion_asignatura}`);
          if (!response.ok) {
              throw new Error(`Error al obtener datos de la sección asignatura: ${response.status}`);
          }

          const data = await response.json();

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
              doc.text(`Detalles de la Asignatura`, pageWidth / 2, 50, { align: "center" });

              doc.setLineWidth(0.5);
              doc.setDrawColor(0, 102, 51);
              doc.line(10, 55, pageWidth - 10, 55);

              // Datos de la sección asignatura
              const seccionAsignaturaData = [
                { key: "Nombre de la Sección", value: data.Nombre_seccion || "No disponible" },
                { key: "Hora de Inicio", value: data.Hora_inicio || "No disponible" },
                { key: "Hora de Fin", value: data.Hora_fin || "No disponible" },
                { key: "Nombre del Grado", value: data.Nombre_grado || "No disponible" },
                { key: "Nombre de la Asignatura", value: data.Nombre_asignatura || "No disponible" },
                { 
                  key: "Días", 
                  value: Array.isArray(data.Dias_nombres) 
                    ? data.Dias_nombres
                        .sort((a, b) => {
                          const order = ["LU", "MAR", "MIE", "JUE", "VIE", "SAB", "DOM"];
                          return order.indexOf(a.toUpperCase()) - order.indexOf(b.toUpperCase());
                        })
                        .map((dia) => dia.toUpperCase())
                        .join(", ") 
                    : data.Dias_nombres 
                      ? data.Dias_nombres.toUpperCase()
                      : "Sin días asignados" 
                },
              ];

              // Mostrar detalles en formato de tabla
              const tableColumn = ["Detalle", "Información"];
              const tableRows = seccionAsignaturaData.map((item) => [item.key, item.value]);

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
              const newWindow = window.open(pdfURL, "_blank");
              if (newWindow) {
                  newWindow.document.title = `Detalles Sección Asignatura #${Cod_seccion_asignatura}`;
              }
          };

          img.onerror = () => {
              swal.fire("Error", "No se pudo cargar el logo.", "error");
          };
      } catch (error) {
        console.error('Error capturado en este bloque:', error); // Registro detallado
              console.error("Error al generar el PDF:", error);
              swal.fire("Error", "No se pudo generar el PDF.", "error");
          }
  };

  // Función para manejar la paginación
  const paginate = (pageNumber) => {
    // Asegúrate de que el número de página sea válido antes de actualizar la página actual
    if (pageNumber > 0 && pageNumber <= Math.ceil(secciones_asignaturas.length / recordsPerPage)) {
      setCurrentPage(pageNumber);
    }
  };

  // Filtra las secciones y asignaturas en función del término de búsqueda por asignatura
  const filteredSeccionesAsignaturas = secciones_asignaturas.filter((seccion_asignatura) => {
    // Normalizar nombre de asignatura y término de búsqueda
    const normalizeText = (text) =>
      text
        .toUpperCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, ''); // Elimina tildes
  
    const asignaturaMatch = filterAsignatura
      ? normalizeText(seccion_asignatura.Nombre_asignatura).includes(
          normalizeText(filterAsignatura)
        )
      : true;
  
    return asignaturaMatch;
  });
  

  // Determina los índices de los registros que se mostrarán en la página actual
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  // Obtiene los registros actuales según la paginación y el filtro aplicado
  const currentRecords = filteredSeccionesAsignaturas.slice(indexOfFirstRecord, indexOfLastRecord);


  return(
  <CContainer>
     <div className="container mt-3"> {/* Contenedor general con margen superior */}
  {/* Título, botón y dropdown */}
  <div className="container mt-3"> {/* Contenedor general */}
  {/* Fila del título */}
  <CRow className="align-items-center mb-3">
    <CCol xs="12" className="text-center">
      <h2 className="fw-bold">Gestión de Asignaturas y Horarios</h2>
    </CCol>
  </CRow>

  {/* Fila de los botones */}
  <CRow className="align-items-center mb-3">
    {/* Botón "Volver a Secciones" alineado a la izquierda */}
    <CCol xs="12" md="4" className="text-start mb-2 mb-md-0">
      <CButton
        className="d-flex align-items-center gap-1 rounded shadow"
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#4B4B4B")}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#656565")}
        style={{
          backgroundColor: "#656565",
          color: "#FFFFFF",
          padding: "10px 16px",
          fontSize: "0.9rem",
          transition: "background-color 0.2s ease, box-shadow 0.3s ease",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
          whiteSpace: "nowrap",
        }}
        onClick={volverAListaSecciones}
      >
        <CIcon icon={cilArrowLeft} /> Volver a Secciones
      </CButton>
    </CCol>

    {/* Espaciado entre elementos (opcional en caso de diseño flexible) */}
    <CCol xs="12" md="4" className="text-center mb-2 mb-md-0" />

    {/* Botón "Nuevo" y dropdown "Reporte" alineados a la derecha */}
    <CCol
      xs="12"
      md="4"
      className="text-end d-flex flex-column flex-md-row justify-content-md-end align-items-md-center gap-2"
    >
      {/* Botón de Reporte */}
      <CDropdown>
        <CDropdownToggle
          style={{
            backgroundColor: "#6C8E58",
            color: "white",
            padding: "10px 16px",
            fontSize: "0.9rem",
          }}
          className="d-flex align-items-center rounded shadow"
        >
          <CIcon icon={cilDescription} /> Reporte
        </CDropdownToggle>
        <CDropdownMenu>
          <CDropdownItem
            onClick={() => generateSeccionesAsignaturasPDF(filteredSeccionesAsignaturas)}
            style={{
              color: "#6C8E58",
              fontWeight: "bold",
            }}
          >
            Ver Reporte en PDF
          </CDropdownItem>
        </CDropdownMenu>
      </CDropdown>
    </CCol>
  </CRow>
</div>

  {/* Contenedor de búsqueda */}
<div className="filter-container mb-4">
  <CRow className="align-items-center">
    {/* Botón Limpiar en el borde izquierdo */}
    <CCol xs="12" md="2" className="text-start">
      <CButton
        color="light"
        onClick={() => {
          setFilterAsignatura('');
        }}
        style={{
          padding: "6px 12px",
          fontSize: "0.9rem",
          backgroundColor: "#E0E0E0", // Gris claro
          color: "#000",
          border: "1px solid #CCC",
        }}
      >
        Limpiar
      </CButton>
    </CCol>

    {/* Filtro por Asignatura */}
    <CCol xs="12" md="6" className="d-flex align-items-center gap-2">
      <CInputGroup>
        <CInputGroupText>
          <CIcon icon={cilSearch} />
        </CInputGroupText>
        <CFormInput
          placeholder="Buscar Asignatura..."
          value={filterAsignatura}
          onChange={(e) => {
            // Validar entrada
            let value = e.target.value;

            // Convertir a mayúsculas
            value = value.toUpperCase();

            // Eliminar caracteres no permitidos (solo letras, números y espacios)
            value = value.replace(/[^A-Z0-9 ]/g, '');

            // Reemplazar caracteres con tildes por sus equivalentes sin tildes
            value = value
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, ''); // Normaliza y elimina tildes

            // Limitar repetición de letras/números a tres consecutivos
            value = value.replace(/(.)\1{3,}/g, '$1$1$1');

            // Eliminar espacios consecutivos
            value = value.replace(/\s{2,}/g, ' ');

            // Actualizar el estado
            setFilterAsignatura(value);
          }}
          style={{
            padding: "6px",
            fontSize: "0.9rem",
            minWidth: "200px",
          }}
        />
      </CInputGroup>
    </CCol>

    {/* Selector de Número de Registros */}
    <CCol xs="12" md="4" className="text-md-end">
      <CInputGroup style={{ width: "auto", display: "inline-flex", alignItems: "center" }}>
        <span>Mostrar&nbsp;</span>
        <CFormSelect
          value={recordsPerPage}
          onChange={(e) => setRecordsPerPage(parseInt(e.target.value))}
          style={{
            padding: "6px",
            fontSize: "0.9rem",
            width: "70px",
          }}
        >
          <option value="5">5</option>
          <option value="10">10</option>
          <option value="20">20</option>
        </CFormSelect>
        <span>&nbsp;registros</span>
      </CInputGroup>
    </CCol>
  </CRow>
</div>
{/* Tabla para mostrar las secciones_asignaturas */}
<div className="table-container" style={{ maxHeight: '400px', overflowY: 'scroll', marginBottom: '20px' }}>
        <CTable striped bordered hover>
        <CTableHead
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 1,
            backgroundColor: '#fff',
            textAlign: 'center', // Centramos el texto del encabezado
          }}
        >
          <CTableRow>
            <CTableHeaderCell style={{ textAlign: 'center' }}>#</CTableHeaderCell>
            <CTableHeaderCell style={{ textAlign: 'center' }}>Grado</CTableHeaderCell>
            <CTableHeaderCell style={{ textAlign: 'center' }}>Sección</CTableHeaderCell>
            <CTableHeaderCell style={{ textAlign: 'center' }}>Asignatura</CTableHeaderCell>
            <CTableHeaderCell style={{ textAlign: 'center' }}>Días</CTableHeaderCell>
            <CTableHeaderCell style={{ textAlign: 'center' }}>Hora inicial</CTableHeaderCell>
            <CTableHeaderCell style={{ textAlign: 'center' }}>Hora final</CTableHeaderCell>
            <CTableHeaderCell style={{ textAlign: 'center' }}>Acciones</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
    {currentRecords.map((secc_asig, index) => (
        <CTableRow key={secc_asig.Cod_seccion_asignatura}>
        <CTableDataCell style={{ textAlign: 'center' }}>
          {indexOfFirstRecord + index + 1}
        </CTableDataCell>
        <CTableDataCell style={{ textAlign: 'center' }}>
          {gradoSeleccionado || 'Grado no disponible'}
        </CTableDataCell>
        <CTableDataCell style={{ textAlign: 'center' }}>
          {secc_asig.Nombre_seccion || 'Sección no disponible'}
        </CTableDataCell>
        <CTableDataCell>
          {secc_asig.Nombre_asignatura || 'Asignatura no disponible'}
        </CTableDataCell>
        <CTableDataCell>
        {Array.isArray(secc_asig.Dias_nombres)
          ? secc_asig.Dias_nombres
              .sort((a, b) => {
                const order = ['LU', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB', 'DOM']; // Orden deseado
                return order.indexOf(a.toUpperCase()) - order.indexOf(b.toUpperCase());
              })
              .map((dia) => dia.toUpperCase()) // Convertir cada día a mayúsculas
              .join(', ')
          : typeof secc_asig.Dias_nombres === 'string'
          ? secc_asig.Dias_nombres
              .split(',') // Divide la cadena en un array
              .map((dia) => dia.trim().toUpperCase()) // Limpia espacios y convierte a mayúsculas
              .sort((a, b) => {
                const order = ['LU', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB', 'DOM']; // Orden deseado
                return order.indexOf(a) - order.indexOf(b);
              })
              .join(', ') // Une de nuevo como una cadena
          : 'NO ESPECIFICADOS'}
      </CTableDataCell>
        <CTableDataCell style={{ textAlign: 'center' }}>
          {secc_asig.Hora_inicio || 'No especificada'}
        </CTableDataCell>
        <CTableDataCell style={{ textAlign: 'center' }}>
          {secc_asig.Hora_fin || 'No especificada'}
        </CTableDataCell>
        <CTableDataCell>
          <div className="d-flex justify-content-center">
            <CButton
                color="info"
                onClick={() => {
                  if (esPeriodoActivo) {
                    openUpdateModal(secc_asig); // Llama a la función solo si el período está activo
                  } else {
                    swal.fire(
                      'Período Inactivo',
                      'No puedes actualizar asignaturas en un período académico inactivo.',
                      'warning'
                    );
                  }
                }}
                className="me-2"
                disabled={!esPeriodoActivo} // Desactiva el botón visualmente si el período está inactivo
              >
                <CIcon icon={cilPen} />
              </CButton>

            <CButton
              color="warning"
              onClick={() =>
                handleDescargarPDFSeccionesAsignaturas(
                  secc_asig.Cod_seccion_asignatura
                )
              }
              className="d-flex align-items-center"
            >
              <CIcon icon={cilArrowCircleBottom} className="me-1" /> PDF
            </CButton>
          </div>
        </CTableDataCell>
      </CTableRow>
    ))}
    {currentRecords.length === 0 && (
    <CTableRow>
        <CTableDataCell colSpan="8" className="text-center">
            No hay asignaturas ni horarios asociados a esta sección.
        </CTableDataCell>
    </CTableRow>
)}
</CTableBody>
      </CTable>
      </div>
      </div>
      
        {/* Paginación Fija */}
        <div
        className="pagination-container"
        style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
      >
        <CPagination aria-label="Page navigation">
          <CButton
            style={{ backgroundColor: '#6f8173', color: '#D9EAD3' }}
            disabled={currentPage === 1} // Desactiva si es la primera página
            onClick={() => paginate(currentPage - 1)} // Páginas anteriores
          >
            Anterior
          </CButton>
          <CButton
            style={{ marginLeft: '10px', backgroundColor: '#6f8173', color: '#D9EAD3' }}
            disabled={currentPage === Math.ceil(filteredSeccionesAsignaturas.length / recordsPerPage)} // Desactiva si es la última página
            onClick={() => paginate(currentPage + 1)} // Páginas siguientes
          >
            Siguiente
          </CButton>
        </CPagination>
        <span style={{ marginLeft: '10px' }}>
          Página {currentPage} de {Math.ceil(filteredSeccionesAsignaturas.length / recordsPerPage)}
        </span>
      </div>

            {/* Modal para actualizar una nueva sección-asignatura */}
              <CModal visible={modalUpdateVisible} backdrop="static" >
        <CModalHeader closeButton={false}>
          <CModalTitle>Actualizar Sección Asignatura</CModalTitle>
          <CButton className="btn-close" aria-label="Close" onClick={() => {
        handleCloseModal();
      }} />
        </CModalHeader>
        <CModalBody>

          {/* Código de la sección asignatura */}
          <CInputGroup className="mb-3">
            <CInputGroupText>Código</CInputGroupText>
            <CFormInput
              value={seccionAsignaturaToUpdate.p_Cod_seccion_asignatura || ''}
              disabled // Campo solo lectura
            />
          </CInputGroup>

              {/* Grado (readonly) */}
              <CInputGroup className="mb-3">
                 <CInputGroupText>Grado</CInputGroupText>
                 <CFormInput value={seccionAsignaturaToUpdate.p_Cod_grado || ''} disabled />
                 </CInputGroup>
                <CInputGroup className="mb-3">
              <CInputGroupText>Nombre Sección</CInputGroupText>
              <CFormInput
                value={seccionAsignaturaToUpdate.p_Nombre_seccion || ''}
                disabled // Predefinido y no editable
              />
            </CInputGroup>

                  {/* Select de Asignaturas */}
                  <CInputGroup className="mb-3">
                    <CInputGroupText>Asignatura</CInputGroupText>
                    <CFormSelect
                      value={seccionAsignaturaToUpdate.p_Cod_grados_asignaturas || ''}
                      onChange={(e) =>
                        setSeccionesAsignaturasToUpdate({
                          ...seccionAsignaturaToUpdate,
                          p_Cod_grados_asignaturas: e.target.value,
                        })
                      }
                    >
                      <option value="">Seleccione una asignatura</option>
                      {grados_asignaturas.map((asignatura) => (
                        <option key={asignatura.Cod_grados_asignaturas} value={asignatura.Cod_grados_asignaturas}>
                          {asignatura.Nombre_asignatura}
                        </option>
                      ))}
                    </CFormSelect>
                  </CInputGroup>

                  {/* Código de los días */}
                  <CInputGroup className="mb-3">
                    <CInputGroupText>Días</CInputGroupText>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        marginLeft: "35px",
                      }}
                    >
                      {dias
                        .sort((a, b) => {
                          const order = ['LU', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB', 'DOM']; // Orden deseado
                          return (
                            order.indexOf(a.prefijo_dia.toUpperCase()) -
                            order.indexOf(b.prefijo_dia.toUpperCase())
                          );
                        })
                        .map((dia) => (
                          <CFormCheck
                            key={dia.Cod_dias}
                            label={dia.dias.toUpperCase()} // Muestra el nombre del día en mayúsculas
                            value={dia.Cod_dias}
                            checked={
                              Array.isArray(seccionAsignaturaToUpdate.p_Cod_dias)
                                ? seccionAsignaturaToUpdate.p_Cod_dias.includes(dia.Cod_dias)
                                : seccionAsignaturaToUpdate.p_Cod_dias
                                    ?.split(",") // Si p_Cod_dias es un string, lo convierte en un array
                                    .includes(dia.Cod_dias)
                            }
                            onChange={(e) => {
                              const selectedDias = Array.isArray(
                                seccionAsignaturaToUpdate.p_Cod_dias
                              )
                                ? [...seccionAsignaturaToUpdate.p_Cod_dias]
                                : seccionAsignaturaToUpdate.p_Cod_dias
                                ? seccionAsignaturaToUpdate.p_Cod_dias.split(",")
                                : [];

                              const newDias = e.target.checked
                                ? [...selectedDias, dia.Cod_dias] // Agrega el día seleccionado
                                : selectedDias.filter((codDia) => codDia !== dia.Cod_dias); // Elimina el día deseleccionado

                              setSeccionesAsignaturasToUpdate({
                                ...seccionAsignaturaToUpdate,
                                p_Cod_dias: newDias,
                              });
                            }}
                          />
                        ))}
                    </div>
                  </CInputGroup>

          {/* Hora de inicio */}
          <CInputGroup className="mb-3">
            <CInputGroupText>Hora de Inicio</CInputGroupText>
            <CFormInput
              type="time"
              value={seccionAsignaturaToUpdate.p_Hora_inicio || ''}
              onChange={(e) =>
                setSeccionesAsignaturasToUpdate({
                  ...seccionAsignaturaToUpdate,
                  p_Hora_inicio: e.target.value,
                })
              }
            />
          </CInputGroup>

          {/* Hora de fin */}
          <CInputGroup className="mb-3">
            <CInputGroupText>Hora de Fin</CInputGroupText>
            <CFormInput
              type="time"
              value={seccionAsignaturaToUpdate.p_Hora_fin || ''}
              onChange={(e) =>
                setSeccionesAsignaturasToUpdate({
                  ...seccionAsignaturaToUpdate,
                  p_Hora_fin: e.target.value,
                })
              }
            />
          </CInputGroup>
        </CModalBody>
        <CModalFooter>
        <CButton color="secondary" onClick={handleCloseModal}>
            Cancelar
          </CButton>
          <CButton color="primary" onClick={handleUpdateSeccionAsignatura}>
            Guardar Cambios
          </CButton>
        </CModalFooter>
      </CModal>
      </CContainer>
      );
}
export default ListaSecciones_Asignaturas;