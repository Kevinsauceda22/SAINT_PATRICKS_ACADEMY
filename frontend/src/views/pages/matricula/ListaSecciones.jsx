import React, { useState, useEffect } from 'react';
import CIcon from '@coreui/icons-react';
import { useLocation } from 'react-router-dom';
import { cilSearch,  cilPen, cilTrash, cilPlus, cilDescription, cilArrowLeft, cilSettings } from '@coreui/icons';
import swal from 'sweetalert2';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import logo from 'src/assets/brand/logo_saint_patrick.png'
import {
  CButton, CContainer, CForm, CDropdown, CDropdownMenu, CDropdownToggle, CDropdownItem, CFormInput, CFormSelect, CInputGroup, CInputGroupText, CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter, CPagination, CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell, CRow, CCol,
} from '@coreui/react';
import { useNavigate } from 'react-router-dom';

const ListaSecciones = () => {
  const [secciones, setSecciones] = useState([]);
  const [grados, setGrados] = useState([]);
  const [profesores, setProfesores] = useState([]);
  const [edificios, setEdificios] = useState([]);
  const [aulasFiltradas, setAulasFiltradas] = useState([]); // Aulas filtradas por edificio
  const [edificioSeleccionado, setEdificioSeleccionado] = useState('');
  const [periodoAcademico, setPeriodoAcademico] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalUpdateVisible, setModalUpdateVisible] = useState(false);
  const [modalDeleteVisible, setModalDeleteVisible] = useState(false);
  const [nuevaSeccion, setNuevaSeccion] = useState({ Nombre_seccion: '', Numero_aula: '', Nombre_grado: '', Cod_profesor: '', Cod_periodo_matricula: '' });
  const [seccionToUpdate, setSeccionToUpdate] = useState({});
  const [seccionToDelete, setSeccionToDelete] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [searchField, setSearchField] = useState("Nombre_seccion");
  const [anioAcademicoActivo, setAnioAcademicoActivo] = useState('');
  const [step, setStep] = useState(1); // Estado para los pasos
  const prevStep = () => setStep(step - 1); // Función para retroceder al paso anterior
  const navigate = useNavigate();
  const location = useLocation();
  const { periodoSeleccionado} = location.state || {}; // Período seleccionado desde la vista anterior
  const [esPeriodoActivo, setEsPeriodoActivo] = useState(true); // Por defecto, asumimos que es activo



// Función para obtener el período académico activo
const fetchPeriodoAcademico = async () => {
  try {
    const response = await fetch('http://localhost:4000/api/secciones/periodo_academico/activo');
    const data = await response.json();

    if (data && data.Anio_academico) {
      setAnioAcademicoActivo(data.Anio_academico); // Actualizar el estado con el período activo
      setPeriodoAcademico([{ Cod_periodo_matricula: data.Cod_periodo_matricula, Anio_academico: data.Anio_academico }]);
    } else {
      console.warn('No se encontró el año académico activo.');
    }
  } catch (error) {
    console.error('Error al obtener el período académico activo:', error);
  }
};

// Función para obtener las secciones del período seleccionado
const fetchSeccionesPeriodo = async (periodo) => {
  try {
    const response = await fetch(`http://localhost:4000/api/secciones/obtener_seccperiodo/${periodo}`);
    const data = await response.json();

    if (response.ok) {
      setSecciones(data.map((seccion, index) => ({ ...seccion, originalIndex: index + 1 })));
    } else {
      setSecciones([]);
      swal.fire(
        'Atención',
        `No se encontraron secciones para el año académico ${periodo}`,
        'info'
      );
    }
  } catch (error) {
    console.error('Error al cargar secciones:', error);
    swal.fire('Error', 'Hubo un problema al cargar las secciones.', 'error');
  }
};

// Efecto para cargar el período activo al montar el componente
useEffect(() => {
  if (!periodoSeleccionado) {
    fetchPeriodoAcademico(); // Obtener el período activo solo si no hay un período seleccionado
  } else {
    console.log('Periodo seleccionado:', periodoSeleccionado);
    fetchSeccionesPeriodo(periodoSeleccionado); // Obtener las secciones del período seleccionado
  }
}, [periodoSeleccionado]);
/*
useEffect(() => {
  if (periodoSeleccionado) {
    fetchSeccionesPeriodo(periodoSeleccionado); // Carga solo las secciones del periodo seleccionado
  } else {
    console.warn("No se ha seleccionado un período. No se pueden cargar las secciones.");
  }
}, [periodoSeleccionado]);*/


// Efecto para recargar las secciones cuando se cierra el modal
useEffect(() => {
  if (modalVisible === false && periodoSeleccionado) {
    fetchSeccionesPeriodo(periodoSeleccionado); // Recargar las secciones del período actual
  }
}, [modalVisible, periodoSeleccionado]);

// Para mostrar los datos en la tabla o modal
useEffect(() => {
  if (anioAcademicoActivo) {
    console.log('Período académico activo:', anioAcademicoActivo);
  }
}, [anioAcademicoActivo]);


  useEffect(() => {
    fetchSecciones();
    fetchAulas();
    fetchGrados();
    fetchProfesores();
    fetchPeriodosAcademicos();
    fetchEdificios(); // Cargar los edificios
  }, []);

  useEffect(() => {
    if (edificioSeleccionado) {
      fetchAulasPorEdificio(edificioSeleccionado);
    } else {
      setAulasFiltradas([]); // Si no hay edificio seleccionado, limpia las aulas
    }
  }, [edificioSeleccionado]);

  // Validación de entradas de texto
  const validateInput = (value) => {
    // Convertir a mayúsculas
    value = value.toUpperCase();

    // Eliminar caracteres especiales
    value = value.replace(/[^A-Z0-9 ]/g, '');

    // Eliminar espacios dobles y espacios al inicio
    value = value.replace(/\s{2,}/g, ' ').trimStart();

    // No permitir tres letras iguales seguidas
    if (/([A-Z0-9])\1\1/.test(value)) {
      swal.fire('Error', 'No se permiten tres caracteres iguales consecutivos.', 'error');
      return '';
    }

    return value;
  };

  const handleGestionarClick = (Cod_secciones) => {
    console.log('Navegando a lista-secciones-asignatura con:', { seccionSeleccionada: Cod_secciones, 
      periodoSeleccionado  });
    navigate(`/lista-secciones-asignatura/`, { state: { seccionSeleccionada: Cod_secciones, 
      periodoSeleccionado  } });
  };
  // Función para manejar el cambio de entrada de texto y aplicar validaciones
  const handleInputChange = (e, setFunction, field) => {
    const validatedValue = validateInput(e.target.value);
    setFunction((prev) => ({ ...prev, [field]: validatedValue }));
  };

 
  //////////////////////
  useEffect(() => {
    if (periodoSeleccionado) {
      console.log('Cargando estado del período seleccionado:', periodoSeleccionado);
      fetchPeriodoEstado(periodoSeleccionado);
      fetchSeccionesPeriodo(periodoSeleccionado);
    } else {
      console.warn('No se encontró un período seleccionado.');
      fetchPeriodoAcademico();
    }
  }, [periodoSeleccionado]);
  

  const fetchPeriodoEstado = async (periodo) => {
    try {
      const response = await fetch(`http://localhost:4000/api/gestion_academica/obtener_periodo`);
      const data = await response.json();

      console.log('Períodos recibidos:', data); // Log para depuración

      // Encuentra el período seleccionado y determina su estado
      const periodoEncontrado = data.find((p) => p.Cod_periodo_matricula === periodo);
      if (periodoEncontrado) {
        setEsPeriodoActivo(periodoEncontrado.Estado === 'activo'); // Verifica si el estado es "activo"
      } else {
        console.warn('Período no encontrado.');
        setEsPeriodoActivo(false); // Por defecto, inactivo si no se encuentra
      }
    } catch (error) {
      console.error('Error al obtener el estado del período:', error);
      setEsPeriodoActivo(false); // Asume inactivo en caso de error
    }
  };

  const handleEditAttempt = (seccion) => {
    if (!esPeriodoActivo) {
      swal.fire('Acción no permitida', 'No se pueden editar secciones en un período inactivo.', 'warning');
      return;
    }
    openUpdateModal(seccion); // Abre el modal solo si el período está activo
  };

 /////////////////////////////////////
  
  // Función para obtener las secciones
  const fetchSecciones = async (Cod_secciones) => {
    try {
      const response = await fetch( `http://localhost:4000/api/secciones/obtener_secciones/${Cod_secciones}`);
      const data = await response.json();
      const dataWithIndex = data.map((seccion, index) => ({
        ...seccion,
        originalIndex: index + 1,
      }));
      setSecciones(dataWithIndex);
    } catch (error) {
      console.error('Error al obtener las secciones:', error);
    }
  };

  // Función para obtener las aulas
  const fetchAulas = async () => {
    const response = await fetch('http://localhost:4000/api/secciones/aulas');
    const data = await response.json();
    setAulasFiltradas(data);
  };

  // Función para obtener los grados
  const fetchGrados = async () => {
    const response = await fetch('http://localhost:4000/api/secciones/grados');
    const data = await response.json();
    setGrados(data);
  };

  // Función para obtener los profesores
  const fetchProfesores = async () => {
    const response = await fetch('http://localhost:4000/api/secciones/profesores');
    const data = await response.json();
    setProfesores(data);
  };

  // Función para obtener todos los periodos académicos
  const fetchPeriodosAcademicos = async () => {
    try {
        const response = await fetch('http://localhost:4000/api/secciones/periodo_academico');
        const data = await response.json();

        if (response.ok && data.length > 0) {
            // Configurar todos los períodos (activos e inactivos) en el estado
            setPeriodoAcademico(data); // Lista completa para mostrar en el modal o tabla
        } else {
            console.warn('No se encontraron períodos de matrícula.');
            setPeriodoAcademico([]); // Asegura que no quede data previa en caso de no haber resultados
        }
    } catch (error) {
        console.error('Error al obtener los períodos académicos:', error);
    }
  };

  // Función para obtener los edificios
  const fetchEdificios = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/secciones/edificios');
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      const data = await response.json();
      setEdificios(data);
    } catch (error) {
      console.error('Error al obtener los edificios:', error);
    }
  };

  const fetchAulasPorEdificio = async (Cod_edificio) => {
    try {
      const response = await fetch(
        `http://localhost:4000/api/secciones/aulas/por_edificio/${Cod_edificio}`
      );
      const data = await response.json();
      console.log('Aulas para el edificio seleccionado:', data); // Verificar aulas obtenidas
  
      if (response.ok) {
        setAulasFiltradas(data); // Actualiza las aulas filtradas
      } else {
        setAulasFiltradas([]); // Limpia el estado si no hay aulas
      }
    } catch (error) {
      console.error('Error al obtener las aulas del edificio:', error);
    }
  };
  

  // Función para obtener el nombre del profesor a partir de su código
  const getProfesorName = (codProfesor) => {
    console.log('Cod_profesor:', codProfesor); // Verifica el valor de codProfesor
    console.log('Profesores:', profesores); // Verifica el listado completo de profesores
    if (!profesores.length) return 'Profesores no disponibles';
    const profesor = profesores.find((p) => p.Cod_profesor === codProfesor);
    return profesor ? profesor.Nombre_profesor : 'Profesor no encontrado';
  };

  // Función para obtener el periodo académico
  const getPeriodoAcademico = (codPeriodo) => {
    const periodo = periodoAcademico.find(p => p.Cod_periodo_matricula === codPeriodo);
    return periodo ? periodo.Anio_academico : 'Año académico no disponible';
  };

  const volverAListaGestion_Academica = () => {
    navigate('/gestion_academica');
  };

  // Función para manejar la paginación
  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= Math.ceil(secciones.length / recordsPerPage)) {
      setCurrentPage(pageNumber);
    }
  };

  // Secciones filtradas según el término de búsqueda
  const normalizeString = (str) =>
    str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  
  const filteredSecciones = secciones
    .filter((seccion) => {
      const normalizedSearchTerm = normalizeString(searchTerm);
  
      if (searchField === "Nombre_seccion") {
        return normalizeString(seccion.Nombre_seccion).includes(normalizedSearchTerm);
      } else if (searchField === "Numero_aula") {
        return normalizeString(seccion.Numero_aula.toString()).includes(normalizedSearchTerm);
      } else if (searchField === "Nombre_grado") {
        return normalizeString(seccion.Nombre_grado).includes(normalizedSearchTerm);
      } else if (searchField === "Nombre_profesor") {
        const profesorName = getProfesorName(seccion.Cod_Profesor);
        return normalizeString(profesorName).includes(normalizedSearchTerm);
      }
      return false;
    })
    .sort((a, b) => 
      a.Nombre_seccion.localeCompare(b.Nombre_seccion, "es", { sensitivity: "base" })
    );

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredSecciones.slice(indexOfFirstRecord, indexOfLastRecord);

  // Validaciones



 // Validar campos obligatorios 
  const validateStep = () => {
    if (step === 1) {
      if (!nuevaSeccion.Nombre_seccion.trim()) {
        swal.fire('Error', 'El nombre de la sección es obligatorio.', 'error');
        return false;
      }
    }
    if (step === 2) {
      if (!edificioSeleccionado || !nuevaSeccion.Cod_aula || !nuevaSeccion.Cod_grado) {
        swal.fire('Error', 'Debe seleccionar un edificio, aula y grado.', 'error');
        return false;
      }
    }
    if (step === 3) {
      if (!nuevaSeccion.Cod_profesor) {
        swal.fire('Error', 'Debe seleccionar un profesor.', 'error');
        return false;
      }
    }
    return true;
  };
  const nextStep = () => {
    if (validateStep()) {
      setStep(step + 1); // Avanza al siguiente paso si pasa la validación
    }
  };

  // Exportar datos a PDF
  const generateSeccionesPDF = () => {
    const doc = new jsPDF();

    if (!filteredSecciones || filteredSecciones.length === 0) {
      alert('No hay datos para exportar.');
      return;
    }

    const img = new Image();
    img.src = logo;

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

      doc.setFontSize(14);
      doc.setTextColor(0, 102, 51);
      doc.text('Reporte General de Secciones', pageWidth / 2, 50, { align: 'center' });

      doc.setLineWidth(0.5);
      doc.setDrawColor(0, 102, 51);
      doc.line(10, 55, pageWidth - 10, 55);

      doc.setFontSize(12);
      doc.setTextColor(0);
      doc.text('Listado Detallado de Secciones', pageWidth / 2, 65, { align: 'center' });

      // Tabla de datos
      const tableColumn = [
        '#',
        'Sección',
        'Aula',
        'Grado',
        'Profesor',
        'Periodo Académico',
      ];
      const tableRows = filteredSecciones.map((seccion, index) => [
        { content: (index + 1).toString(), styles: { halign: 'center' } },
        { content: seccion.Nombre_seccion?.toUpperCase() || 'SIN NOMBRE', styles: { halign: 'center' } },
        seccion.Numero_aula?.toString() || 'SIN AULA',
        seccion.Nombre_grado?.toUpperCase() || 'SIN GRADO',
        { content: (getProfesorName(seccion.Cod_Profesor)?.toUpperCase()) || 'SIN PROFESOR', styles: { halign: 'center' } },
        { content: getPeriodoAcademico(seccion.Cod_periodo_matricula) || 'SIN PERIODO', styles: { halign: 'center' } },
      ]);

      doc.autoTable({
        startY: 70,
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
          doc.text(
            `Página ${pageCurrent} de ${pageCount}`,
            pageWidth - 10,
            footerY,
            { align: 'right' }
          );

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
      const newWindow = window.open('', '_blank');
      newWindow.document.write(`
        <html>
          <head><title>Reporte de Secciones</title></head>
          <body style="margin:0;">
            <iframe width="100%" height="100%" src="${pdfURL}" frameborder="0"></iframe>
            <div style="position:fixed;top:10px;right:200px;">
              <button style="background-color: #6c757d; color: white; border: none; padding: 10px 15px; border-radius: 5px; cursor: pointer;" 
                onclick="const a = document.createElement('a'); a.href='${pdfURL}'; a.download='Reporte_de_Secciones.pdf'; a.click();">
                Descargar PDF
              </button>
            </div>
          </body>
        </html>`);
    };

    img.onerror = () => {
      alert('No se pudo cargar el logo.');
    };
  };


  // Funciones CRUD

  // Funcion para abrir el modal de crear
  const openCreateModal = () => {
    if (!anioAcademicoActivo) {
      fetchPeriodoAcademico(); // Cargar el período académico activo si no está disponible
    }
    resetNuevaSeccion(); // Inicializar el estado de la nueva sección
    setModalVisible(true); // Mostrar el modal
  };

   // Función para restablecer el estado del nuevo registro y el mensaje de error
   const resetNuevaSeccion = () => {
    setNuevaSeccion({
      Nombre_seccion: '',
      Cod_aula: '',
      Cod_grado: '',
      Cod_profesor: '',
      Cod_periodo_matricula: anioAcademicoActivo || '' // Usa el año académico activo o vacío si no está disponible
    });
    setEdificioSeleccionado(''); // Resetea el edificio seleccionado
    setAulasFiltradas([]); // Limpia las aulas filtradas
  };

  // Función para crear una nueva sección
  const handleCreateSeccion = async () => {
    if (!nuevaSeccion.Nombre_seccion || !nuevaSeccion.Cod_aula || !nuevaSeccion.Cod_grado || !nuevaSeccion.Cod_profesor) {
      swal.fire('Error', 'Todos los campos son requeridos.', 'error');
      return;
    }
  
    try {
      const response = await fetch('http://localhost:4000/api/secciones/crear_seccion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          p_Nombre_seccion: nuevaSeccion.Nombre_seccion,
          p_Cod_aula: nuevaSeccion.Cod_aula,
          p_Cod_grado: nuevaSeccion.Cod_grado,
          p_Cod_Profesor: nuevaSeccion.Cod_profesor,
          p_Anio_academico: anioAcademicoActivo, // Enviar el año académico activo
        }),
      });
  
      if (response.ok) {
        swal.fire('Creación exitosa', 'La sección ha sido creada correctamente.', 'success');
        fetchSecciones();
        setModalVisible(false);
        resetNuevaSeccion();
      } else {
        const errorData = await response.json();
        console.error('Error en la creación:', errorData);
        swal.fire('Error', errorData.mensaje || 'No se pudo crear la sección.', 'error');
      }
    } catch (error) {
      console.error('Error al crear la sección:', error);
      swal.fire('Error', 'Error de conexión o en el servidor.', 'error');
    }
  };
  
  const openUpdateModal = (seccion) => {
    console.log('Datos de la sección seleccionada:', seccion);
  
    setSeccionToUpdate({
      p_Cod_secciones: seccion.Cod_secciones || '', // Código de la sección
      p_Nombre_seccion: seccion.Nombre_seccion || '', // Nombre de la sección
      Cod_edificio: seccion.Cod_edificio || '', // Código del edificio
      p_Numero_aula: seccion.Numero_aula || '', // Número del aula
      p_Nombre_grado: seccion.Nombre_grado || '', // Grado
      p_Cod_Profesor: seccion.Cod_profesor || '', // Código del profesor
      p_Cod_periodo_matricula: seccion.Cod_periodo_matricula || '', // Período académico
    });
  
    if (seccion.Cod_edificio) {
      fetchAulasPorEdificio(seccion.Cod_edificio); // Cargar las aulas asociadas al edificio
    }
  
    setModalUpdateVisible(true); // Mostrar el modal
  };
  
  // Función para manejar la actualización de una sección
  const handleUpdateSeccion = async () => {
    console.log('Datos enviados al API:', seccionToUpdate);
  
    const updatedFields = { ...seccionToUpdate };
    try {
      const response = await fetch('http://localhost:4000/api/secciones/actualizar_seccion', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields),
      });
  
      if (response.ok) {
        swal.fire('Éxito', 'Sección actualizada correctamente.', 'success');
        setModalUpdateVisible(false);
        fetchSecciones();
      } else {
        const errorData = await response.json();
        swal.fire('Error', errorData.mensaje || 'No se pudo actualizar la sección.', 'error');
      }
    } catch (error) {
      console.error('Error al actualizar la sección:', error);
      swal.fire('Error', 'Hubo un problema al actualizar la sección.', 'error');
    }
  };  
  
  const resetSeccionToUpdate = () => {
    setSeccionToUpdate({ Nombre_seccion: '', Numero_aula: '', Nombre_grado: '', Cod_profesor: '', Cod_periodo_matricula: '', Cod_edificio: ''});
  };

  // Función para abrir el modal de eliminación de una sección
  const openDeleteModal = (seccion) => {
    setSeccionToDelete(seccion);
    setModalDeleteVisible(true);
  };

  // Función para manejar la eliminación de una sección
  const handleDeleteSeccion = async () => {
    try {
      const response = await fetch(`http://localhost:4000/api/secciones/eliminar_seccion/${seccionToDelete.Cod_secciones}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        swal.fire('Eliminación exitosa', 'La sección ha sido eliminada correctamente.', 'success');
        setModalDeleteVisible(false);
        fetchSecciones();
      } else {
        swal.fire('Error', 'No se pudo eliminar la sección.', 'error');
      }
    } catch (error) {
      console.error('Error al eliminar la sección:', error);
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
        setModalVisible(false);
        resetNuevaSeccion();
        setStep(1);
        setModalUpdateVisible(false);
        setModalDeleteVisible(false);
      }
    });
  };
  
    
  return (
    <CContainer>
  <div className="container mt-5"> {/* Contenedor general con margen superior */}
  {/* Título, botón y dropdown */}
  <CRow className="align-items-center mb-4">
    {/* Botón "Gestión Académica" alineado a la izquierda */}
    <CCol xs="4" md="3" className="text-start">
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
        onClick={volverAListaGestion_Academica}
      >
        <CIcon icon={cilArrowLeft} /> Gestión Académica
      </CButton>
    </CCol>

    {/* Título centrado en negritas */}
    <CCol xs="4" md="6" className="text-center">
      <h1 className="mb-4 fw-bold">Gestión de Secciones</h1> {/* Ajusté el margen inferior */}
    </CCol>

    {/* Botón "Nuevo" y dropdown "Reporte" alineados a la derecha */}
    <CCol
      xs="4"
      md="3"
      className="text-end d-flex flex-column flex-md-row justify-content-md-end align-items-md-center gap-2"
    >
      {/* Botón "Nuevo" */}
      <CButton
        className="d-flex align-items-center gap-1 rounded shadow"
        style={{
          backgroundColor: esPeriodoActivo ? '#4B6251' : '#C0C0C0',
          color: 'white',
          padding: '10px 16px',
          fontSize: '0.9rem',
        }}
        onClick={esPeriodoActivo ? openCreateModal : null}
        disabled={!esPeriodoActivo}
      >
        <CIcon icon={cilPlus} /> Nuevo
      </CButton>

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
            onClick={() => generateSeccionesPDF(filteredSecciones)}
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

  {/* Contenedor de la barra de búsqueda y el selector de registros */}
  <CRow className="align-items-center mb-4">
    <CCol xs="12" md="8">
      <CInputGroup>
        <CInputGroupText>
          <CIcon icon={cilSearch} />
        </CInputGroupText>
        <CFormInput
          placeholder="Buscar Sección..."
          onChange={(e) => setSearchTerm(validateInput(e.target.value))}
          value={searchTerm}
        />
        <CFormSelect
          aria-label="Buscar por"
          onChange={(e) => setSearchField(e.target.value)}
          style={{ marginLeft: "10px" }}
        >
          <option value="Nombre_seccion">Nombre Sección</option>
          <option value="Numero_aula">Aula</option>
          <option value="Nombre_grado">Grado</option>
          <option value="Nombre_profesor">Profesor</option>
        </CFormSelect>
      </CInputGroup>
    </CCol>

    <CCol xs="12" md="4" className="text-md-end mt-3 mt-md-0">
      <CInputGroup style={{ width: "auto", display: "inline-block" }}>
        <div className="d-inline-flex align-items-center">
          <span>Mostrar&nbsp;</span>
          <CFormSelect
            style={{ width: "80px", display: "inline-block", textAlign: "center" }}
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

  {/* Tabla de secciones */}
  <div
    className="table-container mt-4"
    style={{ height: "300px", overflowY: "auto", marginBottom: "20px" }}
  >
    <CTable striped bordered hover>
      <CTableHead style={{ position: "sticky", top: 0, zIndex: 1, backgroundColor: "#fff" }}>
        <CTableRow>
          <CTableHeaderCell className="text-center" style={{ width: "5%" }}>
            #
          </CTableHeaderCell>
          <CTableHeaderCell className="text-center" style={{ width: "10%" }}>
            Sección
          </CTableHeaderCell>
          <CTableHeaderCell className="text-center" style={{ width: "10%" }}>
            Aula
          </CTableHeaderCell>
          <CTableHeaderCell style={{ width: "20%" }}>Grado</CTableHeaderCell>
          <CTableHeaderCell style={{ width: "20%" }}>Profesor</CTableHeaderCell>
          <CTableHeaderCell className="text-center" style={{ width: "20%" }}>
            Periodo Matrícula
          </CTableHeaderCell>
          <CTableHeaderCell className="text-center" style={{ width: "15%" }}>
            Acciones
          </CTableHeaderCell>
        </CTableRow>
      </CTableHead>
      <CTableBody>
        {currentRecords.map((seccion, index) => (
          <CTableRow key={seccion.Cod_secciones}>
            <CTableDataCell className="text-center">
              {indexOfFirstRecord + index + 1}
            </CTableDataCell>
            <CTableDataCell className="text-center">
              {seccion.Nombre_seccion.toUpperCase()}
            </CTableDataCell>
            <CTableDataCell className="text-center">
              {seccion.Numero_aula}
            </CTableDataCell>
            <CTableDataCell>{seccion.Nombre_grado.toUpperCase()}</CTableDataCell>
            <CTableDataCell>{getProfesorName(seccion.Cod_Profesor).toUpperCase()}</CTableDataCell>
            <CTableDataCell>{getPeriodoAcademico(seccion.Cod_periodo_matricula)}</CTableDataCell>
            <CTableDataCell className="text-center">
              <div className="d-flex justify-content-center">
                <CButton
                  color="warning"
                  onClick={() => openUpdateModal(seccion)}
                  className="me-2"
                  disabled={!esPeriodoActivo}
                >
                  <CIcon icon={cilPen} />
                </CButton>

                <CButton
                  color="danger"
                  onClick={() => openDeleteModal(seccion)} // Solo abre el modal si el período está activo
                  className="me-2"
                  disabled={!esPeriodoActivo} // Deshabilita si el período está inactivo
                >
                  <CIcon icon={cilTrash} />
                </CButton>

                <CButton
                  color="info"
                  onClick={() => handleGestionarClick(seccion.Cod_secciones)}
                >
                  <CIcon icon={cilSettings} />
                </CButton>
              </div>
            </CTableDataCell>
          </CTableRow>
        ))}
      </CTableBody>
    </CTable>
  </div>
</div>

      {/* Paginación Fija */}
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
  {/* Botones de Paginación */}
  <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
    <CButton
      style={{
        backgroundColor: '#6f8173',
        color: '#D9EAD3',
        padding: '8px 16px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        fontSize: '0.9rem',
        fontWeight: 'bold',
        border: 'none',
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
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        fontSize: '0.9rem',
        fontWeight: 'bold',
        border: 'none',
      }}
      disabled={currentPage === Math.ceil(filteredSecciones.length / recordsPerPage)}
      onClick={() => paginate(currentPage + 1)}
    >
      Siguiente
    </CButton>
  </div>

    {/* Indicador de Página Actual */}
    <span style={{ fontSize: '0.9rem', color: '#6f8173' }}>
      Página {currentPage} de {Math.ceil(filteredSecciones.length / recordsPerPage)}
    </span>
  </div>

      {/* Modal Crear Sección */}
      <CModal
    visible={modalVisible}
    onClose={() => {
    setModalVisible(false);
    setStep(1); // Reinicia al primer paso
    resetNuevaSeccion(); // Limpia los datos
  }}
  backdrop="static"
  size="md"
>
  <CModalHeader closeButton={false}>
    <CModalTitle>Crear Nueva Sección - Paso {step}</CModalTitle>
    <CButton className="btn-close" aria-label="Close" onClick={handleCloseModal} />
  </CModalHeader>
  <CModalBody>
    {/* Paso 1: Información de la Sección */}
    {step === 1 && (
      <div>
        <h5>Información de la Sección</h5>
        <hr />
        <CInputGroup className="mb-3">
          <CInputGroupText>Nombre de la Sección</CInputGroupText>
          <CFormInput
            value={nuevaSeccion.Nombre_seccion}
            onChange={(e) => handleInputChange(e, setNuevaSeccion, 'Nombre_seccion')}
          />
        </CInputGroup>
      </div>
    )}

    {/* Paso 2: Selección de Aula y Grado */}
    {step === 2 && (
      <div>
        <h5>Selecciona el Edificio, Aula y Grado</h5>
        <hr />
        <CInputGroup className="mb-3">
          <CInputGroupText>Edificio</CInputGroupText>
          <CFormSelect
            value={edificioSeleccionado}
            onChange={(e) => {
              setEdificioSeleccionado(e.target.value);
              setNuevaSeccion({ ...nuevaSeccion, Cod_aula: '' });
            }}
          >
            <option value="">Seleccione un Edificio</option>
            {edificios.map((edificio) => (
              <option key={edificio.Cod_edificio} value={edificio.Cod_edificio}>
                {edificio.Nombre_edificios.toUpperCase()}
              </option>
            ))}
          </CFormSelect>
        </CInputGroup>
        <CInputGroup className="mb-3">
          <CInputGroupText>Número Aula</CInputGroupText>
          <CFormSelect
            value={nuevaSeccion.Cod_aula}
            onChange={(e) => setNuevaSeccion({ ...nuevaSeccion, Cod_aula: e.target.value })}
            disabled={!edificioSeleccionado}
          >
            <option value="">Seleccione un Aula</option>
            {aulasFiltradas.map((aula) => (
              <option key={aula.Cod_aula} value={aula.Cod_aula}>
                {aula.Numero_aula}
              </option>
            ))}
          </CFormSelect>
        </CInputGroup>
        <CInputGroup className="mb-3">
          <CInputGroupText>Grado</CInputGroupText>
          <CFormSelect
            value={nuevaSeccion.Cod_grado}
            onChange={(e) => setNuevaSeccion({ ...nuevaSeccion, Cod_grado: e.target.value })}
          >
            <option value="">Seleccione un Grado</option>
            {grados.map((grado) => (
              <option key={grado.Cod_grado} value={grado.Cod_grado}>
                {grado.Nombre_grado.toUpperCase()}
              </option>
            ))}
          </CFormSelect>
        </CInputGroup>
      </div>
    )}

    {/* Paso 3: Selección de Profesor y Periodo de Matrícula */}
    {step === 3 && (
      <div>
        <h5>Profesor y Período de Matrícula</h5>
        <hr />
        <CInputGroup className="mb-3">
          <CInputGroupText>Profesor</CInputGroupText>
          <CFormSelect
            value={nuevaSeccion.Cod_profesor}
            onChange={(e) => setNuevaSeccion({ ...nuevaSeccion, Cod_profesor: e.target.value })}
          >
            <option value="">Seleccione un Profesor</option>
            {profesores.map((profesor) => (
              <option key={profesor.Cod_profesor} value={profesor.Cod_profesor}>
                {profesor.Nombre_profesor.toUpperCase()}
              </option>
            ))}
          </CFormSelect>
        </CInputGroup>
        <CInputGroup className="mb-3">
          <CInputGroupText>Periodo Matrícula</CInputGroupText>
          <CFormInput value={anioAcademicoActivo || 'Cargando...'} disabled />
        </CInputGroup>
      </div>
    )}
  </CModalBody>

  <CModalFooter>
  {step > 1 && (
    <CButton color="secondary" onClick={prevStep}>Atrás</CButton>
  )}
  {step < 3 ? (
    <CButton color="primary" onClick={nextStep}>Siguiente</CButton>
  ) : (
    <CButton color="success" onClick={handleCreateSeccion}>Finalizar y Guardar</CButton>
  )}
</CModalFooter>
</CModal>

     {/* Modal Actualizar Sección */}
<CModal visible={modalUpdateVisible} backdrop="static">
  <CModalHeader closeButton={false}>
    <CModalTitle>Actualizar Sección</CModalTitle>
    <CButton
      className="btn-close"
      aria-label="Close"
      onClick={() => {
        swal.fire({
          title: '¿Estás seguro?',
          text: 'Si sales ahora, perderás todos los cambios realizados.',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Salir',
          cancelButtonText: 'Cancelar',
        }).then((result) => {
          if (result.isConfirmed) {
            setModalUpdateVisible(false);
            resetSeccionToUpdate(); // Restablece los valores del formulario
          }
        });
      }}
    />
  </CModalHeader>
  <CModalBody>
    <CForm>
      {/* Campos para actualizar sección */}
      <CInputGroup className="mb-3">
        <CInputGroupText>Código de Sección</CInputGroupText>
        <CFormInput
          value={seccionToUpdate.p_Cod_secciones || ''}
          readOnly
        />
      </CInputGroup>

      <CInputGroup className="mb-3">
        <CInputGroupText>Nombre de la Sección</CInputGroupText>
        <CFormInput
          value={seccionToUpdate.p_Nombre_seccion || ''}
          onChange={(e) => setSeccionToUpdate({ ...seccionToUpdate, p_Nombre_seccion: e.target.value })}
        />
      </CInputGroup>

      <CInputGroup className="mb-3">
        <CInputGroupText>Edificio</CInputGroupText>
        <CFormSelect
          value={seccionToUpdate.Cod_edificio || ''}
          onChange={(e) => {
            const newEdificio = e.target.value;
            setSeccionToUpdate({ ...seccionToUpdate, Cod_edificio: newEdificio, p_Numero_aula: '' });
            fetchAulasPorEdificio(newEdificio); // Actualiza las aulas según el edificio seleccionado
          }}
        >
          <option value="">Seleccione un Edificio</option>
          {edificios.map((edificio) => (
            <option key={edificio.Cod_edificio} value={edificio.Cod_edificio}>
              {edificio.Nombre_edificios}
            </option>
          ))}
        </CFormSelect>
      </CInputGroup>

      <CInputGroup className="mb-3">
        <CInputGroupText>Aula</CInputGroupText>
        <CFormSelect
          value={seccionToUpdate.p_Numero_aula || ''}
          onChange={(e) => setSeccionToUpdate({ ...seccionToUpdate, p_Numero_aula: e.target.value })}
          disabled={!seccionToUpdate.Cod_edificio}
        >
          <option value="">Seleccione un Aula</option>
          {aulasFiltradas.map((aula) => (
            <option key={aula.Cod_aula} value={aula.Numero_aula}>
              {aula.Numero_aula}
            </option>
          ))}
        </CFormSelect>
      </CInputGroup>

      <CInputGroup className="mb-3">
        <CInputGroupText>Grado</CInputGroupText>
        <CFormSelect
          value={seccionToUpdate.p_Nombre_grado || ''}
          onChange={(e) => setSeccionToUpdate({ ...seccionToUpdate, p_Nombre_grado: e.target.value })}
        >
          <option value="">Seleccione un Grado</option>
          {grados.map((grado) => (
            <option key={grado.Cod_grado} value={grado.Nombre_grado}>
              {grado.Nombre_grado}
            </option>
          ))}
        </CFormSelect>
      </CInputGroup>

      <CInputGroup className="mb-3">
        <CInputGroupText>Profesor</CInputGroupText>
        <CFormSelect
          value={seccionToUpdate.p_Cod_Profesor || ''}
          onChange={(e) => setSeccionToUpdate({ ...seccionToUpdate, p_Cod_Profesor: e.target.value })}
        >
          <option value="">Seleccione un Profesor</option>
          {profesores.map((profesor) => (
            <option key={profesor.Cod_profesor} value={profesor.Cod_profesor}>
              {profesor.Nombre_profesor.toUpperCase()}
            </option>
          ))}
        </CFormSelect>
      </CInputGroup>
    </CForm>
  </CModalBody>
  <CModalFooter>
    <CButton
      color="secondary"
      onClick={() => {
        swal.fire({
          title: '¿Estás seguro?',
          text: 'Si sales ahora, perderás todos los cambios realizados.',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Salir',
          cancelButtonText: 'Cancelar',
        }).then((result) => {
          if (result.isConfirmed) {
            setModalUpdateVisible(false);
            resetSeccionToUpdate(); // Restablece los valores del formulario
          }
        });
      }}
    >
      Cancelar
    </CButton>
    <CButton color="success" onClick={handleUpdateSeccion}>
      Guardar Cambios
    </CButton>
  </CModalFooter>
</CModal>

      {/* Modal Eliminar Sección */}
      <CModal visible={modalDeleteVisible}  backdrop="static">
        <CModalHeader closeButton={false}>
          <CModalTitle>Confirmar Eliminación</CModalTitle>
          <CButton className="btn-close" aria-label="Close" onClick={handleCloseModal} />
        </CModalHeader>
        <CModalBody>
          ¿Estás seguro de que deseas eliminar la sección: "{seccionToDelete.Nombre_seccion}"?
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setModalDeleteVisible(false)}>Cancelar</CButton>
          <CButton color="danger" onClick={handleDeleteSeccion}><CIcon icon={cilTrash} /> Eliminar</CButton>
        </CModalFooter>
      </CModal>
    </CContainer>
  );
};

export default ListaSecciones;

