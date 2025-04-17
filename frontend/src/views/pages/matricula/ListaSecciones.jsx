// Importaciones
import React, { useState, useEffect } from 'react';
import CIcon from '@coreui/icons-react';
import { useLocation } from 'react-router-dom';
import { cilSearch,  cilSpreadsheet, cilPen, cilTrash, cilBrushAlt, cilFile, cilPlus, cilDescription, cilArrowLeft, cilSettings, } from '@coreui/icons';
import swal from 'sweetalert2';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import logo from 'src/assets/brand/logo_saint_patrick.png'
import {
  CButton, CContainer, CForm, CDropdown, CDropdownMenu, CDropdownToggle, CDropdownItem, CFormInput, CFormSelect, CInputGroup, CInputGroupText, CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter, CPagination, CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell, CRow, CCol,
} from '@coreui/react';
import { useNavigate } from 'react-router-dom';
import AccessDenied from "../AccessDenied/AccessDenied"
import usePermission from '../../../../context/usePermission';


const ListaSecciones = () => {
  const { canSelect, canDelete, canInsert, canUpdate } = usePermission('Secciones');
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
  const [searchProfesor, setSearchProfesor] = useState(''); // Término de búsqueda
  const [filteredProfesores, setFilteredProfesores] = useState(profesores); // Profesores filtrados

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
    console.error('Error capturado en este bloque:', error); // Detalle del error
    console.error('Error al obtener el período académico activo:', error);
  }
};

// Función para obtener las secciones del período seleccionado
const fetchSeccionesPeriodo = async (periodo) => {
  try {
    const response = await fetch(
      `http://localhost:4000/api/secciones/obtener_seccperiodo/${periodo}`
    );
    const data = await response.json();

    if (response.ok) {
      const seccionesConIndex = data.map((seccion, index) => ({ 
        ...seccion, 
        originalIndex: index + 1 
      }));
      setSecciones(seccionesConIndex);
      console.log('Secciones cargadas:', seccionesConIndex); // Verifica que Cod_secciones esté presente
    } else {
      setSecciones([]);
      console.log('No se encontraron secciones para el período proporcionado.');
    }
  } catch (error) {
    console.error('Error capturado al cargar secciones:', error);
  }
};

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


const handleGestionarClick = (seccion) => {
  console.log('Datos completos de la sección:', seccion); // Verifica qué datos recibe la función

  const { Cod_secciones, Nombre_grado, Nombre_seccion } = seccion || {}; // Extraemos Nombre_grado y Nombre_seccion

  // Verificamos si Cod_secciones es un valor primitivo o un objeto
  console.log('Tipo de Cod_secciones:', typeof Cod_secciones);
  console.log('Valor de Cod_secciones:', Cod_secciones);

  // Si Cod_secciones es un objeto, extraemos el valor que representa el código de la sección
  const codigoSeccion = typeof Cod_secciones === 'object' ? Cod_secciones.Cod_seccion || Cod_secciones.id || Cod_secciones.valor : Cod_secciones;

  // Verificamos si Nombre_grado existe
  console.log('Tipo de Nombre_grado:', typeof Nombre_grado);
  console.log('Valor de Nombre_grado:', Nombre_grado);

  // Usamos Nombre_grado en lugar de Cod_grado
  const nombreGrado = typeof Nombre_grado === 'object' ? Nombre_grado.Nombre_grado || Nombre_grado.id || Nombre_grado.valor : Nombre_grado;

  // Verificamos si Nombre_seccion existe
  console.log('Tipo de Nombre_seccion:', typeof Nombre_seccion);
  console.log('Valor de Nombre_seccion:', Nombre_seccion);

  // Usamos Nombre_seccion
  const nombreSeccion = typeof Nombre_seccion === 'object' ? Nombre_seccion.Nombre_seccion || Nombre_seccion.id || Nombre_seccion.valor : Nombre_seccion;

  console.log('Usando codigoSeccion:', codigoSeccion);
  console.log('Usando nombreGrado:', nombreGrado);
  console.log('Usando nombreSeccion:', nombreSeccion);

  console.log('Navegando a lista-secciones-asignatura con:', { 
    seccionSeleccionada: codigoSeccion, 
    periodoSeleccionado, 
    gradoSeleccionado: nombreGrado,
    nombreSeccionSeleccionado: nombreSeccion,
    profesores
  });

  navigate(`/lista-secciones-asignatura/`, { 
    state: { 
      seccionSeleccionada: codigoSeccion,
      periodoSeleccionado, 
      gradoSeleccionado: nombreGrado,
      nombreSeccionSeleccionado: nombreSeccion,
      profesores 
    }
  });
};



// Funcion para cargar segun el estado y los botones
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
    console.error('Error capturado en este bloque:', error); // Detalle del error
    console.error('Error al obtener el estado del período:', error);
    setEsPeriodoActivo(false); // Asume inactivo en caso de error
  }
};

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
    console.error('Error capturado en este bloque:', error); // Detalle del error
    console.error('Error al obtener las secciones:', error);
  }
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
    console.error('Error capturado en este bloque:', error); // Detalle del error
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
    console.error('Error capturado en este bloque:', error); // Detalle del error
    console.error('Error al obtener los edificios:', error);
  }
};

const fetchAulasPorEdificio = async (Cod_edificio) => {
  try {
      if (!Cod_edificio) {
          console.error('Error: Cod_edificio no está definido.');
          swal.fire('Error', 'El código del edificio no está definido.', 'error');
          return;
      }

      console.log("Código de edificio enviado:", Cod_edificio); // Depuración

      const response = await fetch(`http://localhost:4000/api/secciones/aulas/por_edificio/${Cod_edificio}`);
      const data = await response.json();

      if (response.ok) {
        let aulas = data.aulas;
        console.log("Respuesta del servidor:", data); // Depuración
        console.log("Aulas cargadas:", aulas);       // Depuración
    
        // Verificar si aulas es un array
        if (!Array.isArray(aulas)) {
            console.error("La propiedad 'aulas' no es un array:", aulas);
            return; // Salir si aulas no es un array
        }
    
        // Verificar si el aula actual no está en la lista y agregarla
        const aulaActual = aulas.find(aula => aula.Numero_aula === seccionToUpdate.p_Numero_aula);
        if (!aulaActual && seccionToUpdate.p_Numero_aula) {
            const aulaActualInfo = await fetch(`http://localhost:4000/api/secciones/${seccionToUpdate.p_Numero_aula}`);
            const aulaActualData = await aulaActualInfo.json();
            if (aulaActualInfo.ok) {
                aulas.push(aulaActualData); // Agregar aula actual
            } else {
                console.error('Error al obtener el aula actual:', aulaActualData.mensaje);
            }
        }
    
        console.log("Aulas después de agregar el aula actual:", aulas); // Depuración
        setAulasFiltradas(aulas);
    } else {
        console.error('Error al obtener aulas del edificio:', data.mensaje);
        swal.fire('Error', data.mensaje || 'No se pudieron cargar las aulas.', 'error');
    }
    
  } catch (error) {
      console.error('Error al cargar las aulas:', error);
      swal.fire('Error', 'Hubo un problema al cargar las aulas.', 'error');
  }
};

// Función para obtener el nombre del profesor a partir de su código
const getProfesorFullName = (codProfesor) => {
  const profesor = profesores.find((p) => p.Cod_profesor === codProfesor);
  return profesor ? profesor.Nombre_completo.toUpperCase() : 'Profesor no encontrado';
};

// Función para filtrar los profesores
useEffect(() => {
  const normalizedSearch = searchProfesor.toLowerCase();
  const filtered = profesores.filter((profesor) =>
      profesor.Numero_identidad.toLowerCase().includes(normalizedSearch) ||
      profesor.Nombre_completo.toLowerCase().includes(normalizedSearch)
  );
  setFilteredProfesores(filtered);
}, [searchProfesor, profesores]);

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
  if (pageNumber > 0 && pageNumber <= Math.ceil(filteredSecciones.length / recordsPerPage)) {
    setCurrentPage(pageNumber);
  }
};

// Secciones filtradas según el término de búsqueda
// Función para normalizar las cadenas, eliminando acentos y convirtiendo todo a mayúsculas
const normalizeString = (str) => {
  return str
    .toUpperCase() // Convierte todo a mayúsculas
    .normalize("NFD") // Normaliza la cadena para separar los acentos
    .replace(/[\u0300-\u036f]/g, ""); // Elimina los acentos
};
const filteredSecciones = secciones
  .filter((seccion) => {
    const normalizedSearchTerm = normalizeString(searchTerm); // Utiliza la función normalizeString

    if (searchField === "Nombre_seccion") {
      return normalizeString(seccion.Nombre_seccion).includes(normalizedSearchTerm);
    } else if (searchField === "Numero_aula") {
      return normalizeString(seccion.Numero_aula.toString()).includes(normalizedSearchTerm);
    } else if (searchField === "Nombre_grado") {
      return normalizeString(seccion.Nombre_grado).includes(normalizedSearchTerm);
    } else if (searchField === "Nombre_profesor") {
      const profesorName = getProfesorFullName(seccion.Cod_Profesor);
      return normalizeString(profesorName).includes(normalizedSearchTerm);
    }
    return false;
  })
  .sort((a, b) => b.Cod_secciones - a.Cod_secciones); // Ordenar por Cod_secciones en orden descendente


const indexOfLastRecord = currentPage * recordsPerPage;
const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
const currentRecords = filteredSecciones.slice(indexOfFirstRecord, indexOfLastRecord);
  
  // Validaciones

  // Validar campos obligatorios 
 const validateStep = () => {
  if (step === 1) { // Anteriormente paso 2
    if (!edificioSeleccionado || !nuevaSeccion.Cod_aula || !nuevaSeccion.Cod_grado) {
      swal.fire('Error', 'Debe seleccionar un edificio, aula y grado.', 'error');
      return false;
    }
  }
  if (step === 2) { // Anteriormente paso 3
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

      // Subtítulo con el periodo académico
      const periodoAcademico = getPeriodoAcademico(filteredSecciones[0].Cod_periodo_matricula) || 'SIN PERIODO';
      doc.setFontSize(14);
      doc.setTextColor(0, 102, 51);
      doc.text(`Listado de Secciones - Año Académico ${periodoAcademico}`, pageWidth / 2, 50, { align: 'center' });

      doc.setLineWidth(0.5);
      doc.setDrawColor(0, 102, 51);
      doc.line(10, 55, pageWidth - 10, 55);

      doc.setFontSize(12);
      doc.setTextColor(50); // Gris oscuro
      doc.text('Listado Detallado de Secciones', pageWidth / 2, 65, { align: 'center' });


      // Tabla de datos sin el periodo académico
      const tableColumn = ['#', 'Sección', 'Aula', 'Grado', 'Maestro guía'];
      const tableRows = filteredSecciones.map((seccion, index) => [
        { content: (index + 1).toString(), styles: { halign: 'center' } },
        { content: seccion.Nombre_seccion?.toUpperCase() || 'SIN NOMBRE', styles: { halign: 'center' } },
        seccion.Numero_aula?.toString() || 'SIN AULA',
        seccion.Nombre_grado?.toUpperCase() || 'SIN GRADO',
        { content: getProfesorFullName(seccion.Cod_Profesor) || 'SIN PROFESOR', styles: { halign: 'left' } },
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

      // Convertir PDF en Blob y mostrar en una nueva pestaña
      const pdfBlob = doc.output('blob');
      const pdfURL = URL.createObjectURL(pdfBlob);

      // Abrir el visor de PDF predeterminado del navegador con el título y nombre de archivo especificado
      const newWindow = window.open(pdfURL, '_blank');
      if (newWindow) {
        newWindow.document.title = 'Reporte de Secciones';
        newWindow.document.filename = 'reporte_de_secciones.pdf';
      }
    };

    img.onerror = () => {
      alert('No se pudo cargar el logo.');
    };
  };


  // Función para exportar datos de Secciones a Excel
  const exportToExcel = () => {
    if (!filteredSecciones || filteredSecciones.length === 0) {
      alert('No hay datos para exportar.');
      return;
    }
  
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Secciones');

     // Obtener el periodo académico
     const periodoAcademico = getPeriodoAcademico(filteredSecciones[0].Cod_periodo_matricula) || 'SIN PERIODO';

  
    // Título del documento
    worksheet.mergeCells('A1:E1');
    worksheet.getCell('A1').value = "SAINT PATRICK'S ACADEMY";
    worksheet.getCell('A1').font = { bold: true, size: 18, color: { argb: '006633' } };
    worksheet.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };
  
    worksheet.mergeCells('A2:E2');
    worksheet.getCell('A2').value = 'LISTADO DE SECCIONES';
    worksheet.getCell('A2').font = { bold: true, size: 16, color: { argb: '006633' } };
    worksheet.getCell('A2').alignment = { horizontal: 'center', vertical: 'middle' };
  
    // Fila para el periodo académico
    worksheet.mergeCells('A3:E3');
    worksheet.getCell('A3').value = `Año Académico: ${periodoAcademico}`;
    worksheet.getCell('A3').font = { bold: true, size: 14, color: { argb: '006633' } };
    worksheet.getCell('A3').alignment = { horizontal: 'center', vertical: 'middle' };
    
    // Encabezados de la tabla
    const headerRow = worksheet.addRow(['#', 'Sección', 'Aula', 'Grado', 'Maestro guía']);
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '006633' } };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    });
  
    // Datos de la tabla
    filteredSecciones.forEach((seccion, index) => {
      const row = worksheet.addRow([
        index + 1,
        seccion.Nombre_seccion?.toUpperCase() || 'SIN NOMBRE',
        seccion.Numero_aula?.toString() || 'SIN AULA',
        seccion.Nombre_grado?.toUpperCase() || 'SIN GRADO',
        getProfesorFullName(seccion.Cod_Profesor) || 'SIN PROFESOR',
      ]);
  
      row.eachCell((cell) => {
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.border = {
          top: { style: 'thin', color: { argb: '000000' } },
          left: { style: 'thin', color: { argb: '000000' } },
          bottom: { style: 'thin', color: { argb: '000000' } },
          right: { style: 'thin', color: { argb: '000000' } },
        };
      });
    });
  
    // Ajustar el ancho de las columnas
    worksheet.columns.forEach((column) => {
      column.width = 40;
    });
  
    // Crear archivo Excel
    workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, 'Reporte_Secciones.xlsx');
    });
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
      Cod_periodo_matricula: periodoSeleccionado || periodoAcademico[0]?.Cod_periodo_matricula, // Usa el período seleccionado
    });
    setEdificioSeleccionado(''); // Resetea el edificio seleccionado
    setAulasFiltradas([]); // Limpia las aulas filtradas
    setSearchProfesor(''); // Limpia el término de búsqueda del profesor
  };
  
  useEffect(() => {
    console.log('Nombre de la sección actualizado:', nuevaSeccion.Nombre_seccion);
  }, [nuevaSeccion.Nombre_seccion]);


  const [loadingNombre, setLoadingNombre] = useState(false);
  const handleGenerateSectionName = async (codGrado) => {
    try {
      setLoadingNombre(true); // Activar mensaje de carga
      const response = await fetch(
        `http://localhost:4000/api/secciones/generar_nombre_seccion/${codGrado}/${anioAcademicoActivo}`
      );
      const data = await response.json();
  
      if (response.ok) {
        setNuevaSeccion((prev) => ({
          ...prev,
          Nombre_seccion: data.Nombre_seccion,
        }));
      } else {
        console.error('Error en la API:', data.mensaje);
      }
    } catch (error) {
      console.error('Error capturado en este bloque:', error); // Detalle del error
        console.error('Error al generar el nombre:', error);
      } finally {
        setLoadingNombre(false); // Desactivar mensaje de carga
      }
  };
  
   // Función para crear una nueva sección
   const handleCreateSeccion = async () => {
    if (!nuevaSeccion.Cod_aula || !nuevaSeccion.Cod_grado || !nuevaSeccion.Cod_profesor) {
      swal.fire('Error', 'Todos los campos son requeridos.', 'error');
      return;
    }
  
    const aulaSeleccionada = aulasFiltradas.find(
      aula => aula.Cod_aula.toString() === nuevaSeccion.Cod_aula.toString()
    );
  
    if (!aulaSeleccionada) {
      swal.fire('Error', 'El aula seleccionada no es válida.', 'error');
      return;
    }
  
    if (aulaSeleccionada.Secciones_disponibles <= 0) {
      swal.fire('Error', 'No hay secciones disponibles en esta aula.', 'error');
      return;
    }
  
    try {
      const response = await fetch('http://localhost:4000/api/secciones/crear_seccion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          p_Cod_aula: nuevaSeccion.Cod_aula,
          p_Cod_grado: nuevaSeccion.Cod_grado,
          p_Cod_Profesor: nuevaSeccion.Cod_profesor,
          p_Cod_periodo_matricula: nuevaSeccion.Cod_periodo_matricula,
        }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        swal.fire('Creación exitosa', 'La sección ha sido creada correctamente.', 'success');
        fetchSeccionesPeriodo(periodoSeleccionado); // Recargar las secciones
        fetchAulasPorEdificio(edificioSeleccionado); // Actualizar las aulas disponibles
        setModalVisible(false); // Cerrar el modal
        resetNuevaSeccion(); // Limpiar los datos del formulario
      } else {
        swal.fire('Error', data.mensaje || 'No se pudo crear la sección.', 'error');
      }
    } catch (error) {
      console.error('Error al crear la sección:', error);
      swal.fire('Error', 'Error de conexión o en el servidor.', 'error');
    }
  };

  
  const openUpdateModal = async (Cod_secciones) => {
    try {
        const response = await fetch(`http://localhost:4000/api/secciones/obtener_seccion/${Cod_secciones}`);
        const data = await response.json();

        if (response.ok) {
            setSeccionToUpdate({
                p_Cod_secciones: data.Cod_secciones,
                p_Nombre_seccion: data.Nombre_seccion,
                Cod_edificio: data.Cod_edificio,
                p_Numero_aula: data.Numero_aula,
                p_Nombre_grado: data.Nombre_grado,
                p_Cod_Profesor: data.Cod_profesor,
                p_Cod_periodo_matricula: data.Cod_periodo_matricula,
            });

            // Cargar aulas asociadas al edificio seleccionado
            if (data.Cod_edificio) {
                await fetchAulasPorEdificio(data.Cod_edificio);
            }

            setModalUpdateVisible(true);
        } else {
            swal.fire('Error', data.mensaje || 'No se pudo obtener la sección.', 'error');
        }
    } catch (error) {
      console.error('Error capturado en este bloque:', error); // Detalle del error
          console.error('Error al obtener los datos de la sección:', error);
          swal.fire('Error', 'Hubo un problema al cargar los datos de la sección.', 'error');
      }
};


  // Función para manejar la actualización de una sección
  const handleUpdateSeccion = async () => {
    // Buscar el aula seleccionada
    const aulaSeleccionada = aulasFiltradas.find(
        (aula) => aula.Numero_aula.toString() === seccionToUpdate.p_Numero_aula.toString()
    );
  
    // Validar si el aula seleccionada es diferente al aula actual
    const aulaOriginal = seccionToUpdate.p_Numero_aula; // Aula actual de la sección
  
    if (aulaSeleccionada && aulaSeleccionada.Numero_aula !== aulaOriginal) {
        // Validar disponibilidad solo si el aula ha cambiado
        if (aulaSeleccionada.Secciones_disponibles <= 0) {
            swal.fire('Error', 'No hay secciones disponibles en esta aula.', 'error');
            return;
        }
    }
  
    try {
        const response = await fetch('http://localhost:4000/api/secciones/actualizar_seccion', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(seccionToUpdate),
        });
  
        if (response.ok) {
            swal.fire('Éxito', 'Sección actualizada correctamente.', 'success');
            setModalUpdateVisible(false);
            fetchSeccionesPeriodo(periodoSeleccionado); // Recargar las secciones del período actual
            fetchAulasPorEdificio(seccionToUpdate.Cod_edificio); // Actualizar las aulas disponibles
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
    // Limpia los datos del estado `seccionToUpdate`
    setSeccionToUpdate({
      p_Cod_secciones: '',
      p_Nombre_seccion: '',
      Cod_edificio: '',
      p_Numero_aula: '',
      p_Nombre_grado: '',
      p_Cod_Profesor: '',
      p_Cod_periodo_matricula: '',
    });
  };

  // Función para abrir el modal de eliminación de una sección
  const openDeleteModal = (seccion) => {
    console.log('Sección seleccionada para eliminar:', seccion); // Verifica que `Cod_secciones` esté presente
    setSeccionToDelete(seccion); // Asegúrate de que `seccion` contiene el campo Cod_secciones
    setModalDeleteVisible(true);
  };  
  
  // Función para manejar la eliminación de una sección
  const handleDeleteSeccion = async () => {
    console.log('Sección a eliminar:', seccionToDelete); // Verifica el objeto completo
  
    if (!seccionToDelete.Cod_secciones) {
      swal.fire('Error', 'No se ha seleccionado una sección válida para eliminar.', 'error');
      return;
    }
  
    try {
      const response = await fetch(
        `http://localhost:4000/api/secciones/eliminar_seccion/${seccionToDelete.Cod_secciones}`,
        { method: 'DELETE' }
      );
  
      if (response.ok) {
        swal.fire('Eliminación exitosa', 'La sección ha sido eliminada correctamente.', 'success');
        setModalDeleteVisible(false);
  
        if (periodoSeleccionado) {
          fetchSeccionesPeriodo(periodoSeleccionado); // Recargar las secciones
        }
      } else {
        const errorData = await response.json();
        swal.fire('Error', errorData.mensaje || 'No se pudo eliminar la sección.', 'error');
      }
    } catch (error) {
      console.error('Error al eliminar la sección:', error);
      swal.fire('Error', 'Hubo un problema al eliminar la sección.', 'error');
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
        setModalUpdateVisible(false);
        setModalDeleteVisible(false);
        resetNuevaSeccion(); // Solo reinicia para el modal de creación
        resetSeccionToUpdate(); // Solo reinicia para el modal de actualización
        setStep(1); // Reinicia los pasos para el modal de creación
      }
    });
  };  

  // Verificar permisos
  if (!canSelect) {
    return <AccessDenied />;
  }
      
  return (
  <div className="container mt-1"> {/* Contenedor general con margen superior */}
  {/* Título, Boton Nuevo y Boton de Reporte */}

  <CRow className="align-items-center mb-5">
    <CCol xs="12" className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
    
    {/* Botón "Gestión Académica" */}
    <CButton
        className="btn-sm d-flex align-items-center gap-1 rounded shadow"
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#4B4B4B")}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#656565")}
        style={{
          backgroundColor: "#656565",
          color: "#FFFFFF",
          padding: '6.5px 16px',
          fontSize: '0.85rem',
          transition: 'all 0.3s ease',
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
          whiteSpace: "nowrap",
        }}
        onClick={volverAListaGestion_Academica}
      >
        <CIcon icon={cilArrowLeft} /> Gestión Académica
      </CButton>
    
    {/* Titulo */}
    <div className="flex-grow-1 text-center">
    <h4 className="text-center fw-semibold pb-1 mb-0" style={{display: "inline-block", borderBottom: "2px solid #4CAF50"  }}>Gestión de Secciones Año {secciones.length > 0 ? getPeriodoAcademico(secciones[0].Cod_periodo_matricula) : "No disponible"}</h4>
    </div>
    
      {/* Botón "Nuevo" */}
      {canInsert && (
        <CButton
          className="btn-sm d-flex align-items-center gap-1 rounded shadow"
          style={{
            backgroundColor: esPeriodoActivo ? '#4B6251' : '#C0C0C0',
            color: 'white',
            padding: '6.5px 16px',
            fontSize: '0.85rem',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
          }}
          onClick={esPeriodoActivo ? openCreateModal : null}
          disabled={!esPeriodoActivo}
        >
          <CIcon icon={cilPlus} /> Nuevo
        </CButton>
      )}

      {/* Botón de Reporte */}
<CDropdown className="btn-sm d-flex align-items-center gap-1 rounded shadow">
  <CDropdownToggle
    style={{
      backgroundColor: '#6C8E58',
      color: 'white',
      fontSize: '0.85rem',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.backgroundColor = '#5A784C';
      e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.backgroundColor = '#6C8E58';
      e.currentTarget.style.boxShadow = 'none';
    }}
  >
    <CIcon icon={cilDescription} /> Reporte
  </CDropdownToggle>
  <CDropdownMenu
    style={{
      position: 'absolute',
      zIndex: 1050, /* Asegura que el menú esté por encima de otros elementos */
      backgroundColor: '#fff',
      boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.2)',
      borderRadius: '4px',
      overflow: 'hidden',
    }}
  >
    {/* Reporte PDF */}
    <CDropdownItem
      onClick={() => generateSeccionesPDF(filteredSecciones)}
      style={{
        cursor: 'pointer',
        outline: 'none',
        backgroundColor: 'transparent',
        padding: '0.5rem 1rem',
        fontSize: '0.85rem',
        color: '#333',
        borderBottom: '1px solid #eaeaea',
        transition: 'background-color 0.3s',
      }}
      onMouseOver={(e) => (e.target.style.backgroundColor = '#f5f5f5')}
      onMouseOut={(e) => (e.target.style.backgroundColor = 'transparent')}
    >
      <CIcon icon={cilFile} size="sm" /> Abrir en PDF
    </CDropdownItem>

    {/* Reporte Excel */}
    <CDropdownItem
      onClick={exportToExcel}
      style={{
        cursor: 'pointer',
        outline: 'none',
        backgroundColor: 'transparent',
        padding: '0.5rem 1rem',
        fontSize: '0.85rem',
        color: '#333',
        transition: 'background-color 0.3s',
      }}
      onMouseOver={(e) => (e.target.style.backgroundColor = '#f5f5f5')}
      onMouseOut={(e) => (e.target.style.backgroundColor = 'transparent')}
    >
      <CIcon icon={cilSpreadsheet} size="sm" /> Exportar a Excel
    </CDropdownItem>

  </CDropdownMenu>
</CDropdown>
    </CCol>
  </CRow>

  {/* Contenedor de la barra de búsqueda y el selector de registros */}
  <CRow className="align-items-center mt-4 mb-3">

    {/* Barra de búsqueda */}
    <CCol xs="12" md="6" className="d-flex align-items-center gap-2">
      <CInputGroup>
        <CInputGroupText>
          <CIcon icon={cilSearch} />
        </CInputGroupText>
        <CFormInput
          placeholder="Buscar Sección..."
          onChange={(e) => setSearchTerm(validateInput(e.target.value))}
          value={searchTerm}
          style={{
            padding: "6px",
            fontSize: "0.9rem",
          }}
        />
        <CFormSelect
          aria-label="Buscar por"
          onChange={(e) => setSearchField(e.target.value)}
          style={{
            marginLeft: "10px",
            fontSize: "0.9rem",
          }}
        >
          <option value="Nombre_seccion">Nombre Sección</option>
          <option value="Numero_aula">Aula</option>
          <option value="Nombre_grado">Grado</option>
          <option value="Nombre_profesor">Maestro guía</option>
        </CFormSelect>

    {/* Botón para limpiar la búsqueda */}

    <CButton
        style={{
            border: '1px solid #ccc',
            transition: 'all 0.1s ease-in-out', // Duración de la transición
            backgroundColor: '#F3F4F7', // Color por defecto
            color: '#343a40', // Color de texto por defecto
            height: '35px',
        }}
        onClick={() => {
            setSearchTerm('');
            setCurrentPage(1);
        }}
        onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#E0E0E0'; // Color cuando el mouse sobre el botón "limpiar"
            e.currentTarget.style.color = 'black'; // Color del texto cuando el mouse sobre el botón "limpiar"
        }}
        onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#F3F4F7'; // Color cuando el mouse no está sobre el botón "limpiar"
            e.currentTarget.style.color = '#343a40'; // Color de texto cuando el mouse no está sobre el botón "limpiar"
        }}
        >
            <CIcon icon={cilBrushAlt} /> Limpiar
        </CButton>
      </CInputGroup>
    </CCol>

    {/* Selector de número de registros */}
    <CCol xs="12" md="6" className="text-md-end mt-2 mt-md-0">
       <CInputGroup style={{ width: "auto", display: "inline-block" }}>
       <div className="d-inline-flex align-items-center">
        <span>Mostrar&nbsp;</span>
        <CFormSelect
          style={{
            width: "80px",
            display: "inline-block",
            textAlign: "center",
            fontSize: "0.85rem",
          }}
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
          <CTableHeaderCell className="text-center" style={{ width: "5%" }}>#</CTableHeaderCell>
          <CTableHeaderCell className="text-center" style={{ width: "15%" }}>Periodo Matrícula</CTableHeaderCell>
          <CTableHeaderCell className="text-center" style={{ width: "10%" }}>Aula</CTableHeaderCell>
          <CTableHeaderCell className="text-center" style={{ width: "10%" }}>Sección</CTableHeaderCell>
          <CTableHeaderCell className="text-center" style={{ width: "20%" }}>Grado</CTableHeaderCell>
          <CTableHeaderCell className="text-center" style={{ width: "25%" }}>Maestro guía</CTableHeaderCell>
          <CTableHeaderCell className="text-center" style={{ width: "15%" }}>Acciones</CTableHeaderCell>
        </CTableRow>
      </CTableHead>
      <CTableBody>
        {currentRecords.map((seccion, index) => (
          <CTableRow key={seccion.Cod_secciones}>
            <CTableDataCell className="text-center"> {indexOfFirstRecord + index + 1}</CTableDataCell>
            <CTableDataCell className="text-center"> {getPeriodoAcademico(seccion.Cod_periodo_matricula)}</CTableDataCell>
            <CTableDataCell className="text-center"> {seccion.Numero_aula} </CTableDataCell>
            <CTableDataCell className="text-center"> {seccion.Nombre_seccion.toUpperCase()} </CTableDataCell>
            <CTableDataCell>{seccion.Nombre_grado.toUpperCase()}</CTableDataCell>
            <CTableDataCell>{getProfesorFullName(seccion.Cod_Profesor)}</CTableDataCell>
            <CTableDataCell className="text-center">
              <div className="d-flex justify-content-center">
                
                {canUpdate && (
                <CButton
                color="warning"
                onClick={() => openUpdateModal(seccion.Cod_secciones)}
                className="me-2"
                disabled={!esPeriodoActivo}
                title="Editar Registro"
              >
                <CIcon icon={cilPen} />
              </CButton>
              
               )}
                <CButton
                color="info"
                onClick={() => handleGestionarClick(seccion)}
                className="me-2"
                title="Gestionar Horario"
              >
                <CIcon icon={cilSettings} />
              </CButton>
              {canDelete && (
                <CButton
                color="danger"
                onClick={() => openDeleteModal(seccion)}
                
                disabled={!esPeriodoActivo}
                title="Eliminar Registro"
              >
                <CIcon icon={cilTrash} />
              </CButton>
              
                )}

              </div>
            </CTableDataCell>
          </CTableRow>
        ))}
      </CTableBody>
    </CTable>
  </div>

  {/* Paginación Mejorada */}
<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '16px' }}>
  <CPagination aria-label="Page navigation" style={{ display: 'flex', gap: '10px' }}>
    <CButton
      style={{ backgroundColor: '#6f8173', color: '#D9EAD3' }}
      disabled={currentPage === 1} // Deshabilitar si estás en la primera página
      onClick={() => paginate(currentPage - 1)}
    >
      Anterior
    </CButton>
    <CButton
      style={{ marginLeft: '10px', backgroundColor: '#6f8173', color: '#D9EAD3' }}
      disabled={currentPage === Math.ceil(filteredSecciones.length / recordsPerPage)} // Deshabilitar si estás en la última página
      onClick={() => paginate(currentPage + 1)}
    >
      Siguiente
    </CButton>
  </CPagination>
  {/* Mostrar total de páginas */}
  <span style={{ marginLeft: '10px', fontSize: '0.9rem', color: '#6f8173' }}>
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
        size="lg"
      >
      <CModalHeader closeButton={false}>
        <CModalTitle>Crear Nueva Sección - Paso {step}</CModalTitle>
        <CButton className="btn-close" aria-label="Close" onClick={handleCloseModal} />
      </CModalHeader>
      <CModalBody>

        {/* Paso 1: Selección de Aula y Grado */}
        {step === 1 && ( 
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
            <CInputGroupText>Aula</CInputGroupText>
            <CFormSelect
              value={nuevaSeccion.Cod_aula}
              onChange={(e) => {
                const selectedAula = aulasFiltradas.find(aula => aula.Cod_aula.toString() === e.target.value.toString());

                if (!selectedAula) {
                  swal.fire('Error', 'El aula seleccionada no es válida.', 'error');
                  return;
                }

                setNuevaSeccion({ ...nuevaSeccion, Cod_aula: selectedAula.Cod_aula });
              }}
              disabled={!edificioSeleccionado}
            >
              <option value="">Seleccione un Aula</option>
              {aulasFiltradas.map((aula) => (
                <option key={aula.Cod_aula} value={aula.Cod_aula}>
                  {`Aula ${aula.Numero_aula} - Secciones disponibles: ${aula.Secciones_disponibles}`}
                </option>
              ))}
            </CFormSelect>
          </CInputGroup>
          <CInputGroup className="mb-3">
            <CInputGroupText>Grado</CInputGroupText>
            <CFormSelect
          value={nuevaSeccion.Cod_grado}
          onChange={(e) => {
          const selectedGrado = e.target.value;
          setNuevaSeccion((prev) => ({ ...prev, Cod_grado: selectedGrado }));
          handleGenerateSectionName(selectedGrado); // Llamada a la API para generar el nombre
        }}
      >
        <option value="">Seleccione un Grado</option>
        {grados.map((grado) => (
          <option key={grado.Cod_grado} value={grado.Cod_grado}>
            {grado.Nombre_grado}
          </option>
        ))}
        </CFormSelect>

        </CInputGroup>
        </div>
      )}

  {step === 2 && (
        <div>
          <h5>Selecciona un Profesor</h5>
          <hr />
          <div>
  
    {/* Período Académico */}
    <CInputGroup className="mb-3">
        <CInputGroupText>Período Matrícula</CInputGroupText>
        <CFormInput value={anioAcademicoActivo || 'Cargando...'} readOnly />
    </CInputGroup>

    {/* Barra de Búsqueda */}
    <CInputGroup className="mb-3">
        <CInputGroupText>Buscar Profesor</CInputGroupText>
        <CFormInput
            placeholder="Buscar por identidad, nombre o apellido..."
            value={searchProfesor}
            onChange={(e) => {
                let value = e.target.value
                    .replace(/[^a-zA-Z0-9 ]/g, '') // Elimina caracteres especiales
                    .replace(/\s+/g, ' ') // Reemplaza múltiples espacios por uno
                    .toUpperCase(); // Convierte a mayúsculas

                // Bloquear más de 2 repeticiones consecutivas de la misma letra
                const regexRepeticiones = /(.)\1{2,}/;
                if (regexRepeticiones.test(value)) {
                    value = value.slice(0, -1); // Remueve la última letra repetida
                }

                setSearchProfesor(value);
            }}
            onPaste={(e) => e.preventDefault()} // Bloquea copiar y pegar
        />
    </CInputGroup>

    {/* Lista Desplegable Siempre Visible */}
    <div style={{ border: '1px solid #ddd', borderRadius: '4px', padding: '10px', background: 'white' }}>
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, maxHeight: '150px', overflowY: 'scroll' }}>
            {filteredProfesores.map((profesor) => (
                <li
                    key={profesor.Cod_profesor}
                    style={{
                        padding: '8px',
                        cursor: 'pointer',
                        borderBottom: '1px solid #ddd',
                    }}
                    onClick={() => {
                        setNuevaSeccion({ ...nuevaSeccion, Cod_profesor: profesor.Cod_profesor });
                        setSearchProfesor(`ID: ${profesor.Numero_identidad} - ${profesor.Nombre_completo}`);
                    }}
                >
                    {`ID: ${profesor.Numero_identidad} - ${profesor.Nombre_completo}`}
                </li>
             ))}
         </ul>
     </div>
 </div>
</div>
)}
  </CModalBody>
  <CModalFooter>
    {step > 1 && <CButton color="secondary" onClick={prevStep}>Atrás</CButton>}
    {step < 2 ? (
      <CButton style={{backgroundColor: '#4B6251', color: 'white' }} onClick={nextStep}>Siguiente</CButton>
    ) : (
      <CButton style={{backgroundColor: '#4B6251', color: 'white' }} onClick={handleCreateSeccion}>Guardar</CButton>
    )}
  </CModalFooter>
</CModal>

     {/* Modal Actualizar Sección */}
     <CModal 
        visible={modalUpdateVisible} backdrop="static" size="lg">
     <CModalHeader closeButton={false}>
    <CModalTitle>Actualizar Sección</CModalTitle>
    <CButton
      className="btn-close"
      aria-label="Close"
      onClick={() => {
        handleCloseModal();
      }}
    />
  </CModalHeader>
  <CModalBody>
    <CForm>
      {/* Código de Sección */}
      <CInputGroup className="mb-3">
        <CInputGroupText>Código de Sección</CInputGroupText>
        <CFormInput value={seccionToUpdate.p_Cod_secciones || ''} readOnly />
      </CInputGroup>

      {/* Nombre de la Sección */}
        <CInputGroup className="mb-3">
          <CInputGroupText>Nombre de la Sección</CInputGroupText>
          <CFormInput
            value={seccionToUpdate.p_Nombre_seccion || ''}
            readOnly
          />
        </CInputGroup>

        {/* Grado */}
        <CInputGroup className="mb-3">
          <CInputGroupText>Grado</CInputGroupText>
          <CFormInput
            value={seccionToUpdate.p_Nombre_grado || ''}
            readOnly
          />
        </CInputGroup>


      {/* Selección de Edificio */}
      <CInputGroup className="mb-3">
        <CInputGroupText>Edificio</CInputGroupText>
        <CFormSelect
          value={seccionToUpdate.Cod_edificio || ''}
          onChange={async (e) => {
            const newEdificio = e.target.value;
            setSeccionToUpdate({
              ...seccionToUpdate,
              Cod_edificio: newEdificio,
              p_Numero_aula: '', // Reiniciar el aula al cambiar el edificio
            });
            await fetchAulasPorEdificio(newEdificio); // Cargar aulas del edificio seleccionado
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

      {/* Selección de Aula */}
      <CInputGroup className="mb-3">
        <CInputGroupText>Aula</CInputGroupText>
        <CFormSelect
            value={seccionToUpdate.p_Numero_aula || ''}
            onChange={(e) =>
                setSeccionToUpdate({ ...seccionToUpdate, p_Numero_aula: e.target.value })
            }
            disabled={!seccionToUpdate.Cod_edificio}
        >
            <option value="">Seleccione un Aula</option>
            {aulasFiltradas.map((aula) => (
                <option
                    key={aula.Cod_aula}
                    value={aula.Numero_aula}
                    disabled={aula.Secciones_disponibles <= 0 && aula.Numero_aula !== seccionToUpdate.p_Numero_aula}
                >
                    {`Aula ${aula.Numero_aula} - Secciones disponibles: ${aula.Secciones_disponibles}`}
                </option>
            ))}
        </CFormSelect>
    </CInputGroup>

      {/* Profesor */}
      <CInputGroup className="mb-3">
        <CInputGroupText>Profesor</CInputGroupText>
        <CFormSelect
          value={seccionToUpdate.p_Cod_Profesor || ''}
          onChange={(e) =>
            setSeccionToUpdate({ ...seccionToUpdate, p_Cod_Profesor: e.target.value })
          }
        >
          <option value="">Seleccione un Profesor</option>
          {profesores.map((profesor) => (
            <option key={profesor.Cod_profesor} value={profesor.Cod_profesor}>
              {`${profesor.Nombre_completo.toUpperCase()} - ID: ${profesor.Numero_identidad}`}
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
        handleCloseModal();
      }}
    >
      Cancelar
    </CButton>
    <CButton style={{backgroundColor: '#4B6251', color: 'white' }} onClick={handleUpdateSeccion}>
      Guardar
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
    </div>
  );
};
export default ListaSecciones;