import React, { useEffect, useState } from 'react';
import { cilArrowLeft,cilPen,cilSearch,cilPlus, cilSpreadsheet,cilInfo,cilDescription,  cilFile,cilSave, cilBrushAlt } from '@coreui/icons';
import CIcon from '@coreui/icons-react';
import Swal from 'sweetalert2';
import {
  CContainer, CRow, CCol, CCard, CTable, CTableHeaderCell, CTableBody, CTableRow, CTableDataCell, CButton, CSpinner, CCardBody, CDropdown,CDropdownToggle,
  CDropdownMenu, CDropdownItem,CTableHead,CModal,CModalHeader,CModalTitle,CModalBody,CModalFooter,CInputGroup,CInputGroupText,CFormInput,CFormSelect,CPagination
} from '@coreui/react';
import logo from 'src/assets/brand/logo_saint_patrick.png'

import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import 'jspdf-autotable';
import * as XLSX from "xlsx";
import usePermission from '../../../../context/usePermission';
import AccessDenied from "../AccessDenied/AccessDenied"

const ListaCuadro = () => {
  const { canSelect, canInsert, canUpdate } = usePermission('ListaCuadro');
  const [secciones, setSecciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [currentView, setCurrentView] = useState('secciones');
  const [estudiantes, setEstudiantes] = useState([]);
  const [nombreSeccionSeleccionada, setNombreSeccionSeleccionada] = useState('');
  const [nombreasignaturaSeleccionada, setNombreAsignaturaSeleccionada] = useState('');
  const [anioSeccionSeleccionada, setAnioSeccionSeleccionada] = useState('');
  const [selectedCodSeccion, setSelectedCodSeccion] = useState(null);
  const [gradoSeleccionado, setGradoSeleccionado] = useState('');
  const [nombreEstudiante, setNombreEstudiante] = useState("");  // Estado para almacenar el nombre del estudiante
  const [identidadEstudiante, setIdentidadEstudiante] = useState("");
  //para paginacion y busqueda de la vista secciones
const [recordsPerPage2, setRecordsPerPage2] = useState(5);
const [searchTerm2, setSearchTerm2] = useState('');
const [currentPage2, setCurrentPage2] = useState(1);
//para paginacion y busqueda de la vista estudiantes
const [recordsPerPage3, setRecordsPerPage3] = useState(5);
const [searchTerm3, setSearchTerm3] = useState('');
const [currentPage3, setCurrentPage3] = useState(1); 


const [cuadroNotas, setCuadroNotas] = useState([]);

  useEffect(() => {
    fetchSecciones();
  }, []);

  const fetchSecciones = async () => {
    try {
        const response = await fetch('http://74.50.68.87/api/notas/seccion', {
            method: 'GET',
        });

        if (!response.ok) throw new Error('Error al cargar secciones.');
        const data = await response.json();
        setSecciones(data); // Ajusta según el formato de la respuesta
    } catch (error) {
        console.error('Error al obtener las secciones:', error);
    } finally {
        setCargando(false);
    }
};

  const fetchEstudiantes = async (Cod_secciones) => {
    try {
      const response = await fetch(`http://74.50.68.87/api/seccionalumno/estudiantes/${Cod_secciones}`);
      if (!response.ok) throw new Error('Error al obtener la lista de estudiantes');
      const data = await response.json();
      setEstudiantes(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };
  

  const fetchCuadroNotas = async (Cod_seccion_matricula, nombreEstudiante , identidad) => {
    try {
      setNombreEstudiante(nombreEstudiante);
      setIdentidadEstudiante(identidad);
      const response = await fetch(`http://74.50.68.87/api/notas/notasypromedio/${Cod_seccion_matricula}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`, // Incluye el token si es necesario
        },
      });
  
      if (!response.ok) throw new Error('Error al obtener el cuadro de notas.');
  
      const data = await response.json();
      setCuadroNotas(data); // Configurar los datos del cuadro de notas
    } catch (error) {
      console.error('Error al obtener el cuadro de notas:', error);
      Swal.fire('Sin datos disponibles', 'Actualmente no hay notas registradas para generar el cuadro de notas', 'info');
      setCuadroNotas([]); // Configurar un arreglo vacío en caso de error
    } finally {
      setCurrentView('cuadroNotas'); // Siempre cambiar a la vista del cuadro de notas
    }
  };
  
  

  
  const generarReportePDF = () => {
    // Validar que haya datos en la tabla
    if (!currentRecords2 || currentRecords2.length === 0) {
     Swal.fire({
       icon: 'info',
       title: 'Tabla vacía',
       text: 'No hay datos disponibles para generar el reporte.',
       confirmButtonText: 'Aceptar',
     });
     return; // Salir de la función si no hay datos
   }
   const doc = new jsPDF();
   const img = new Image();
   img.src = logo;
 
   img.onload = () => {
     // Agregar logo
     doc.addImage(img, 'PNG', 10, 10, 30, 30);
 
     let yPosition = 20; // Posición inicial en el eje Y
 
     // Título principal
     doc.setFontSize(18);
     doc.setTextColor(0, 102, 51); // Verde
     doc.text('SAINT PATRICK\'S ACADEMY', doc.internal.pageSize.width / 2, yPosition, { align: 'center' });
 
     yPosition += 12; // Espaciado más amplio para resaltar el título
 
     // Subtítulo
     doc.setFontSize(16);
     doc.text('Reporte de Secciones', doc.internal.pageSize.width / 2, yPosition, { align: 'center' });
 
     yPosition += 10; // Espaciado entre subtítulo y detalles

     // Información adicional
     doc.setFontSize(10);
     doc.setTextColor(100); // Gris para texto secundario
     doc.text('Casa Club del periodista, Colonia del Periodista', doc.internal.pageSize.width / 2, yPosition, { align: 'center' });
 
     yPosition += 4;
 
     doc.text('Teléfono: (504) 2234-8871', doc.internal.pageSize.width / 2, yPosition, { align: 'center' });
 
     yPosition += 4;
 
     doc.text('Correo: info@saintpatrickacademy.edu', doc.internal.pageSize.width / 2, yPosition, { align: 'center' });
 
     yPosition += 6; // Espaciado antes de la línea divisoria
 
     // Línea divisoria
     doc.setLineWidth(0.5);
     doc.setDrawColor(0, 102, 51); // Verde
     doc.line(10, yPosition, doc.internal.pageSize.width - 10, yPosition);
 
     // Configuración para la tabla
     const pageHeight = doc.internal.pageSize.height; // Altura de la página
     let pageNumber = 1; // Página inicial
 
     // Agregar tabla con auto-paginación
     doc.autoTable({
       startY: yPosition + 4,
       head: [['#', 'Sección', 'Grado', 'Total Alumnos','Año Académico','Profesor']],
       body: currentRecords2.map((seccion, index) => [
         index + 1,
         `${seccion.Seccion || ''}`.trim(),
         seccion.Grado,
         seccion.Total_Alumnos,
         seccion.Anio_Academico,
         seccion.Nombre_Profesor,
       ]),
       headStyles: {
         fillColor: [0, 102, 51],
         textColor: [255, 255, 255],
         fontSize: 10,
       },
       styles: {
         fontSize: 10,
         cellPadding: 3,
         halign: 'center', // Centrado del texto en las celdas
       },
       columnStyles: {
         0: { cellWidth: 'auto' }, // Columna '#' se ajusta automáticamente
         1: { cellWidth: 'auto' }, // Columna 'Sección' se ajusta automáticamente
         2: { cellWidth: 'auto' }, // Columna 'Grado' se ajusta automáticamente
         3: { cellWidth: 'auto' }, // Columna 'Año Académico' se ajusta automáticamente
         4: { cellWidth: 'auto' }, // Columna 'Año Académico' se ajusta automáticamente
         5: { cellWidth: 'auto' }, // Columna 'Profesor' se ajusta automáticamente
       },
       alternateRowStyles: { fillColor: [240, 248, 255] },
       didDrawPage: (data) => {
         // Pie de página
         const currentDate = new Date();
         const formattedDate = `${currentDate.toLocaleDateString()} ${currentDate.toLocaleTimeString()}`;
         doc.setFontSize(10);
         doc.setTextColor(100);
         doc.text(`Fecha y hora de generación: ${formattedDate}`, 10, pageHeight - 10);
         const totalPages = doc.internal.getNumberOfPages(); // Obtener el total de páginas
         doc.text(`Página ${pageNumber} de ${totalPages}`, doc.internal.pageSize.width - 30, pageHeight - 10);
         pageNumber += 1; // Incrementar el número de página
       },
     });
 
     // Abrir el PDF en lugar de descargarlo automáticamente
     window.open(doc.output('bloburl'), '_blank');
   };
 
   img.onerror = () => {
     console.warn('No se pudo cargar el logo. El PDF se generará sin el logo.');
     // Abrir el PDF sin el logo
     window.open(doc.output('bloburl'), '_blank');
   };
 };

 const generarReporteExcel = () => {
  // Validar que haya datos en la tabla
  if (!currentRecords2 || currentRecords2.length === 0) {
    Swal.fire({
      icon: 'info',
      title: 'Tabla vacía',
      text: 'No hay datos disponibles para generar el reporte excel.',
      confirmButtonText: 'Aceptar',
    });
    return; // Salir de la función si no hay datos
  }
  const encabezados = [
    ["Saint Patrick Academy"],
    ["Reporte de Secciones"],
    [], // Espacio en blanco
    ["#","Sección", "Grado", "Total Alumnos", "Año Académico","Profesor"]
  ];

  // Crear filas con asistencias filtradas
  const filas = currentRecords2.map((seccion, index) => [
    index + 1,
    seccion.Seccion,
    seccion.Grado,
    seccion.Total_Alumnos,
    seccion.Anio_Academico,
    seccion.Nombre_Profesor
  ]);

  // Combinar encabezados y filas
  const datos = [...encabezados, ...filas];

  // Crear una hoja de trabajo
  const hojaDeTrabajo = XLSX.utils.aoa_to_sheet(datos);

  // Estilos personalizados para encabezados
  const rangoEncabezado = XLSX.utils.decode_range(hojaDeTrabajo['!ref']);
  for (let row = 0; row <= 3; row++) {
    for (let col = rangoEncabezado.s.c; col <= rangoEncabezado.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
      if (hojaDeTrabajo[cellAddress]) {
        hojaDeTrabajo[cellAddress].s = {
          font: { bold: true, sz: 14, color: { rgb: "FFFFFF" } },
          fill: { fgColor: { rgb: "15401D" } },
          alignment: { horizontal: "center" }
        };
      }
    }
  }

  // Ajustar el ancho de columnas automáticamente
  const ajusteColumnas = [
    { wpx: 40 }, 
    { wpx: 100 }, 
    { wpx: 100 }, 
    { wpx: 100 } ,
    { wpx: 100 },
    { wpx: 280 } 
  ];

  hojaDeTrabajo['!cols'] = ajusteColumnas;

  // Crear el libro de trabajo
  const libroDeTrabajo = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(libroDeTrabajo, hojaDeTrabajo, "Reporte de Secciones");
  // Guardar el archivo Excel con un nombre fijo
  const nombreArchivo = `Reporte_Secciones.xlsx`;

  XLSX.writeFile(libroDeTrabajo, nombreArchivo);
};


const generarReportealumnoPDF = () => {
  // Validar que haya datos en la tabla
 if (!currentRecords3 || currentRecords3.length === 0) {
   Swal.fire({
     icon: 'info',
     title: 'Tabla vacía',
     text: 'No hay datos disponibles para generar el reporte.',
     confirmButtonText: 'Aceptar',
   });
   return; // Salir de la función si no hay datos
 }
 const doc = new jsPDF();
 const img = new Image();
 img.src = logo;

 img.onload = () => {
   // Agregar logo
   doc.addImage(img, 'PNG', 10, 10, 30, 30);

   let yPosition = 20; // Posición inicial en el eje Y

   // Título principal
   doc.setFontSize(18);
   doc.setTextColor(0, 102, 51); // Verde
   doc.text('SAINT PATRICK\'S ACADEMY', doc.internal.pageSize.width / 2, yPosition, { align: 'center' });

   yPosition += 12; // Espaciado más amplio para resaltar el título

   // Subtítulo
   doc.setFontSize(16);
   doc.text('Reporte de Estudiantes', doc.internal.pageSize.width / 2, yPosition, { align: 'center' });

   yPosition += 10; // Espaciado entre subtítulo y detalles

    // Detalles de la sección, asignatura y año
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0); // Negro para el texto informativo
    if (gradoSeleccionado && nombreSeccionSeleccionada && anioSeccionSeleccionada ) {
      doc.text(
        `Grado: ${gradoSeleccionado} | Sección: ${nombreSeccionSeleccionada} | Año: ${anioSeccionSeleccionada}`,
        doc.internal.pageSize.width / 2,
        yPosition,
        { align: 'center' }
      );
    } else if (gradoSeleccionado && nombreSeccionSeleccionada) {
      doc.text(
        `Grado: ${gradoSeleccionado} | Sección: ${nombreSeccionSeleccionada}`,
        doc.internal.pageSize.width / 2,
        yPosition,
        { align: 'center' }
      );
    }

  yPosition += 8; // Espaciado entre líneas de detalle 

   // Información adicional
   doc.setFontSize(10);
   doc.setTextColor(100); // Gris para texto secundario
   doc.text('Casa Club del periodista, Colonia del Periodista', doc.internal.pageSize.width / 2, yPosition, { align: 'center' });

   yPosition += 4;

   doc.text('Teléfono: (504) 2234-8871', doc.internal.pageSize.width / 2, yPosition, { align: 'center' });

   yPosition += 4;

   doc.text('Correo: info@saintpatrickacademy.edu', doc.internal.pageSize.width / 2, yPosition, { align: 'center' });

   yPosition += 6; // Espaciado antes de la línea divisoria

   // Línea divisoria
   doc.setLineWidth(0.5);
   doc.setDrawColor(0, 102, 51); // Verde
   doc.line(10, yPosition, doc.internal.pageSize.width - 10, yPosition);

   // Configuración para la tabla
   const pageHeight = doc.internal.pageSize.height; // Altura de la página
   let pageNumber = 1; // Página inicial

   // Agregar tabla con auto-paginación
   doc.autoTable({
     startY: yPosition + 4,
     head: [['#','Identidad', 'Nombre Estudiante']],
     body: currentRecords3.map((estudiante, index) => [
       index + 1,
       `${estudiante.Identidad}`.trim(),
          estudiante.Nombre_Completo,
     ]),
     headStyles: {
       fillColor: [0, 102, 51],
       textColor: [255, 255, 255],
       fontSize: 10,
     },
     styles: {
       fontSize: 10,
       cellPadding: 3,
       halign: 'center', // Centrado del texto en las celdas
     },
     columnStyles: {
       0: { cellWidth: 'auto' }, // Columna '#' se ajusta automáticamente
       1: { cellWidth: 'auto' }, // Columna 'identidad' se ajusta automáticamente
       2: { cellWidth: 'auto' }, // Columna 'estudiante' se ajusta automáticamente
     },
     alternateRowStyles: { fillColor: [240, 248, 255] },
     didDrawPage: (data) => {
       // Pie de página
       const currentDate = new Date();
       const formattedDate = `${currentDate.toLocaleDateString()} ${currentDate.toLocaleTimeString()}`;
       doc.setFontSize(10);
       doc.setTextColor(100);
       doc.text(`Fecha y hora de generación: ${formattedDate}`, 10, pageHeight - 10);
       const totalPages = doc.internal.getNumberOfPages(); // Obtener el total de páginas
       doc.text(`Página ${pageNumber} de ${totalPages}`, doc.internal.pageSize.width - 30, pageHeight - 10);
       pageNumber += 1; // Incrementar el número de página
     },
   });

   // Abrir el PDF en lugar de descargarlo automáticamente
   window.open(doc.output('bloburl'), '_blank');
 };

 img.onerror = () => {
   console.warn('No se pudo cargar el logo. El PDF se generará sin el logo.');
   // Abrir el PDF sin el logo
   window.open(doc.output('bloburl'), '_blank');
 };
};

const generarReportealumnoExcel = () => {
  if (!currentRecords3 || currentRecords3.length === 0) {
    Swal.fire({
      icon: 'info',
      title: 'Tabla vacía',
      text: 'No hay datos disponibles para generar el reporte excel.',
      confirmButtonText: 'Aceptar',
    });
    return; // Salir de la función si no hay datos
  }

  // Detalles de la sección, asignatura y año
  const detalles = [];
  if (gradoSeleccionado && nombreSeccionSeleccionada && anioSeccionSeleccionada) {
    detalles.push([`Grado: ${gradoSeleccionado}  | Sección: ${nombreSeccionSeleccionada}  | Año: ${anioSeccionSeleccionada}`]);
  } else if (nombreSeccionSeleccionada && gradoSeleccionado) {
    detalles.push([`Grado: ${gradoSeleccionado} | Sección: ${nombreSeccionSeleccionada}`]);
  }

  const encabezados = [
    ["Saint Patrick Academy"],
    ["Reporte de Estudiantes"],
    [], // Espacio en blanco
    ...detalles, // Agregar los detalles dinámicos
    [], // Espacio adicional después de los detalles
    ["#","Identidad", "Nombre Estudiante"],
  ];

  // Crear filas con asignaturas
  const filas = currentRecords3.map((estudiante, index) => [
    index + 1,
    estudiante.Identidad || "N/A",
    estudiante.Nombre_Completo || "N/A"
  ]);

  // Combinar encabezados y filas
  const datos = [...encabezados, ...filas];

  // Crear una hoja de trabajo
  const hojaDeTrabajo = XLSX.utils.aoa_to_sheet(datos);

  // Ajustar el ancho de columnas automáticamente
  const ajusteColumnas = [
    { wpx: 40 }, // # (Número)
    { wpx: 150 }, // Identidad
    { wpx: 300 }, // estudiante
  ];

  hojaDeTrabajo["!cols"] = ajusteColumnas;

  // Crear el libro de trabajo
  const libroDeTrabajo = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(libroDeTrabajo, hojaDeTrabajo, "Reporte de Estudiantes");

  // Nombre del archivo con extensión correcta
  const nombreArchivo = "Reporte_de_Estudiantes.xlsx";

  // Descargar el archivo
  XLSX.writeFile(libroDeTrabajo, nombreArchivo);
};

const disableCopyPaste = (e) => {
  e.preventDefault();
  Swal.fire({
    icon: 'warning',
    title: 'Acción bloqueada',
    text: 'Copiar y pegar no está permitido.',
    confirmButtonText: 'Aceptar', 
  });
};

//-------------------paginacion, buscador vista actual : secciones-----------------------------
const handleSearch2 = (event) => {
  const input = event.target;
  let value = input.value
    .toUpperCase() // Convertir a mayúsculas
    .trimStart(); // Evitar espacios al inicio

  const regex = /^[A-ZÑÁÉÍÓÚ0-9\s,]*$/; // Solo letras, números, acentos, ñ, espacios y comas

  // Verificar si hay múltiples espacios consecutivos antes de reemplazarlos
  if (/\s{2,}/.test(value)) {
    Swal.fire({
      icon: 'warning',
      title: 'Espacios múltiples',
      text: 'No se permite más de un espacio entre palabras.',
      confirmButtonText: 'Aceptar', 
    });
    value = value.replace(/\s+/g, ' '); // Reemplazar múltiples espacios por uno solo
  }

  // Validar caracteres permitidos
  if (!regex.test(value)) {
    Swal.fire({
      icon: 'warning',
      title: 'Caracteres no permitidos',
      text: 'Solo se permiten letras, números y espacios.',
      confirmButtonText: 'Aceptar', 
    });
    return;
  }

  // Validación para letras repetidas más de 4 veces seguidas
  const words = value.split(' ');
  for (let word of words) {
    const letterCounts = {};
    for (let letter of word) {
      letterCounts[letter] = (letterCounts[letter] || 0) + 1;
      if (letterCounts[letter] > 4) {
        Swal.fire({
          icon: 'warning',
          title: 'Repetición de letras',
          text: `La letra "${letter}" se repite más de 4 veces en la palabra "${word}".`,
          confirmButtonText: 'Aceptar', 
        });
        return;
      }
    }
  }

  // Establecer el valor del input y resetear la página
  setSearchTerm2(value);
  setCurrentPage2(1); // Resetear a la primera página al buscar
};


// Filtro de búsqueda
const filteredSecciones= secciones.filter((seccion) =>
  seccion.Seccion.toLowerCase().includes(searchTerm2.toLowerCase()) ||
  seccion.Grado.toLowerCase().includes(searchTerm2.toLowerCase()) ||
  seccion.Anio_Academico.toString().includes(searchTerm2)
);

// Lógica de paginación
const indexOfLastRecord2 = currentPage2 * recordsPerPage2;
const indexOfFirstRecord2 = indexOfLastRecord2 - recordsPerPage2;
const currentRecords2 = filteredSecciones.slice(indexOfFirstRecord2, indexOfLastRecord2);

// Cambiar página
const paginate2 = (pageNumber) => {
if (pageNumber > 0 && pageNumber <= Math.ceil(filteredSecciones.length / recordsPerPage2)) {
  setCurrentPage2(pageNumber);
}
}
//------------------------------------------------------------------------------------------------------
 
const handleViewEstudiantes = (Cod_secciones, nombreSeccion,grado,anio) => {
  setSelectedCodSeccion(Cod_secciones);
  setNombreSeccionSeleccionada(nombreSeccion);
  setGradoSeleccionado(grado);
  setAnioSeccionSeleccionada(anio);
  fetchEstudiantes(Cod_secciones);
  setCurrentView('estudiantes');
};

 //-------------------paginacion, buscador vista actual : estudiantes-----------------------------
 const handleSearch3 = (event) => {
  const input = event.target;
  let value = input.value
    .toUpperCase() // Convertir a mayúsculas
    .trimStart(); // Evitar espacios al inicio

  const regex = /^[A-ZÑÁÉÍÓÚ0-9\s,]*$/; // Solo letras, números, acentos, ñ, espacios y comas

  // Verificar si hay múltiples espacios consecutivos antes de reemplazarlos
  if (/\s{2,}/.test(value)) {
    Swal.fire({
      icon: 'warning',
      title: 'Espacios múltiples',
      text: 'No se permite más de un espacio entre palabras.',
      confirmButtonText: 'Aceptar', 
    });
    value = value.replace(/\s+/g, ' '); // Reemplazar múltiples espacios por uno solo
  }

  // Validar caracteres permitidos
  if (!regex.test(value)) {
    Swal.fire({
      icon: 'warning',
      title: 'Caracteres no permitidos',
      text: 'Solo se permiten letras, números y espacios.',
      confirmButtonText: 'Aceptar', 
    });
    return;
  }

  // Validación para letras repetidas más de 4 veces seguidas
  const words = value.split(' ');
  for (let word of words) {
    const letterCounts = {};
    for (let letter of word) {
      letterCounts[letter] = (letterCounts[letter] || 0) + 1;
      if (letterCounts[letter] > 4) {
        Swal.fire({
          icon: 'warning',
          title: 'Repetición de letras',
          text: `La letra "${letter}" se repite más de 4 veces en la palabra "${word}".`,
          confirmButtonText: 'Aceptar', 
        });
        return;
      }
    }
  }

  // Establecer el valor del input y resetear la página
  setSearchTerm3(value);
  setCurrentPage3(1); // Resetear a la primera página al buscar
};


// Filtro de búsqueda
const filteredEstudiantes = estudiantes.filter((estudiante) => 
  (estudiante.Nombre_Completo && estudiante.Nombre_Completo.toLowerCase().includes(searchTerm3.toLowerCase())) ||
  (estudiante.Identidad && estudiante.Identidad.toLowerCase().includes(searchTerm3.toLowerCase()))
);


// Lógica de paginación
const indexOfLastRecord3 = currentPage3 * recordsPerPage3;
const indexOfFirstRecord3 = indexOfLastRecord3 - recordsPerPage3;
const currentRecords3 = filteredEstudiantes.slice(indexOfFirstRecord3, indexOfLastRecord3);

// Cambiar página
const paginate3 = (pageNumber) => {
if (pageNumber > 0 && pageNumber <= Math.ceil(filteredEstudiantes.length / recordsPerPage3)) {
  setCurrentPage3(pageNumber);
}
}

const handleBackToSecciones = () => {
  setCurrentView('secciones');
};
//------------------------------------------------------------------------------------------------------

const exportarContenido = async () => {
  const input = document.getElementById("cuadroNotasRender");

  // Forzar un tamaño fijo en el render
  const originalWidth = input.style.width;
  const originalHeight = input.style.height;

  // Asegúrate de que el tamaño sea fijo (en píxeles) durante la captura
  input.style.width = "794px"; // Ancho A4 en píxeles a 96 DPI
  input.style.height = "1123px"; // Altura A4 en píxeles a 96 DPI

   // Ocultar los bordes temporalmente
   const originalBorder = input.style.border;
   input.style.border = "none";

  const pdf = new jsPDF("p", "mm", "a4");
  const margin = 10; // Márgenes en mm

  try {
    const canvas = await html2canvas(input, {
      scale: 4, // Aumenta la calidad
      useCORS: true, // Maneja imágenes externas
    });

    const imgData = canvas.toDataURL("image/png");
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth() - margin * 2;
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(imgData, "PNG", margin, margin, pdfWidth, pdfHeight);

    // Descarga el archivo PDF
    pdf.save("cuadro_notas.pdf");
  } catch (error) {
    console.error("Error al generar el PDF:", error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Hubo un problema al generar el PDF. Inténtalo nuevamente.",
      confirmButtonText: 'Aceptar', 
    });
  } finally {
    // Restaurar tamaño original
    input.style.width = originalWidth;
    input.style.height = originalHeight;
    input.style.border = originalBorder;
  }
};




 // Verificar permisos
 if (!canSelect) {
  return <AccessDenied />;
}


return (
    <CContainer className="py-1">
       {cargando && ( 
          <div className="text-center my-5">
            <CSpinner color="primary" aria-label="Cargando información..." />
          </div>
        )}
        {!cargando && currentView === 'secciones' && (
           <>
          <CRow className="align-items-center mb-5">
            <CCol xs="12" className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3"> 
             
            <div className="flex-grow-1 text-center">
                <h4 className="text-center fw-semibold pb-2 mb-0" style={{display: "inline-block", borderBottom: "2px solid #4CAF50" }}> Cuadros: Lista de Secciones</h4>
              </div>
              <CDropdown className="btn-sm d-flex align-items-center gap-1 rounded shadow">
                <CDropdownToggle
                  style={{backgroundColor: '#6C8E58',color: 'white',fontSize: '0.85rem',cursor: 'pointer',transition: 'all 0.3s ease', }}
                  onMouseEnter={(e) => {e.currentTarget.style.backgroundColor = '#5A784C'; e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';  }}
                  onMouseLeave={(e) => {e.currentTarget.style.backgroundColor = '#6C8E58'; e.currentTarget.style.boxShadow = 'none'; }}>
                 <CIcon icon={cilDescription}/> Reporte
                </CDropdownToggle>
                <CDropdownMenu style={{position: "absolute", zIndex: 1050, /* Asegura que el menú esté por encima de otros elementos*/ backgroundColor: "#fff",boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.2)",borderRadius: "4px",overflow: "hidden",}}>
                  <CDropdownItem
                     onClick={generarReportePDF}
                    style={{cursor: "pointer",outline: "none",backgroundColor: "transparent",padding: "0.5rem 1rem",fontSize: "0.85rem",color: "#333",borderBottom: "1px solid #eaeaea",transition: "background-color 0.3s",}}
                    onMouseOver={(e) =>(e.target.style.backgroundColor = "#f5f5f5")} onMouseOut={(e) =>(e.target.style.backgroundColor = "transparent")}>
                    <CIcon icon={cilFile} size="sm" /> Abrir en PDF
                  </CDropdownItem>
                  <CDropdownItem
                    onClick={generarReporteExcel}
                    style={{cursor: "pointer",outline: "none",backgroundColor: "transparent",padding: "0.5rem 1rem",fontSize: "0.85rem",color: "#333",transition: "background-color 0.3s",}}
                    onMouseOver={(e) =>(e.target.style.backgroundColor = "#f5f5f5")}
                    onMouseOut={(e) =>(e.target.style.backgroundColor = "transparent")}>
                    <CIcon icon={cilSpreadsheet} size="sm" /> Descargar Excel
                  </CDropdownItem>
                </CDropdownMenu>
              </CDropdown>
              </CCol>
              </CRow>
               {/* Contenedor de la barra de búsqueda y el selector dinámico */}
            <CRow className="align-items-center mt-4 mb-2">
              {/* Barra de búsqueda  */}
              <CCol xs="12" md="8" className="d-flex flex-wrap align-items-center">
                <CInputGroup className="me-3" style={{ width: '350px' }}>
                  <CInputGroupText>
                    <CIcon icon={cilSearch} />
                  </CInputGroupText>
                  <CFormInput
                  style={{ width: '80px',height:'35px', display: 'inline-block',fontSize: '0.8rem'}}
                    placeholder="Buscar por año, grado o sección"
                    onChange={handleSearch2}
                    value={searchTerm2}
                    onPaste={disableCopyPaste}
                    onCopy={disableCopyPaste}
                  />
                  <CButton
                    style={{border: '1px solid #ccc',
                      transition: 'all 0.1s ease-in-out', // Duración de la transición
                      backgroundColor: '#F3F4F7', // Color por defecto
                      color: '#343a40', // Color de texto por defecto
                      height:'35px'
                    }}
                    onClick={() => {
                      setSearchTerm2('');
                      setCurrentPage2(1);
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#E0E0E0'; // Color cuando el mouse sobre el boton "limpiar"
                      e.currentTarget.style.color = 'black'; // Color del texto cuando el mouse sobre el boton "limpiar"
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#F3F4F7'; // Color cuando el mouse no está sobre el boton "limpiar"
                      e.currentTarget.style.color = '#343a40'; // Color de texto cuando el mouse no está sobre el boton "limpiar"
                    }}
                  >
                    <CIcon icon={cilBrushAlt} /> Limpiar
                  </CButton>
                </CInputGroup>
            </CCol>

              {/* Selector dinámico a la par de la barra de búsqueda */}
              <CCol xs="12" md="4" className="text-md-end mt-2 mt-md-0">
                <CInputGroup style={{ width: 'auto', display: 'inline-block' }}>
                  <div className="d-inline-flex align-items-center">
                    <span style={{ fontSize: '0.85rem' }}>Mostrar&nbsp;</span>
                      <CFormSelect
                        style={{ width: '80px',height:'35px', display: 'inline-block', textAlign: 'center' }}
                        onChange={(e) => {
                        const value = Number(e.target.value);
                        setRecordsPerPage2(value);
                        setCurrentPage2(1); // Reiniciar a la primera página cuando se cambia el número de registros
                      }}
                        value={recordsPerPage2}
                      >
                        <option value="5">5</option>
                        <option value="10">10</option>
                        <option value="20">20</option>
                      </CFormSelect>
                    <span style={{ fontSize: '0.85rem' }}>&nbsp;registros</span>
                  </div>       
              </CInputGroup>
            </CCol>
            </CRow>
              <div className="table-responsive" style={{maxHeight: '400px',overflowX: 'auto',overflowY: 'auto', boxShadow: "0 4px 10px rgba(0, 0, 0, 0.3)"}}>
                 <CTable striped bordered hover responsive >
                 <CTableHead className="sticky-top bg-light text-center" style={{fontSize: '0.8rem'}}>
                 <CTableRow>
                        <CTableHeaderCell>#</CTableHeaderCell>
                        <CTableHeaderCell>SECCIÓN</CTableHeaderCell>
                        <CTableHeaderCell>GRADO</CTableHeaderCell>
                        <CTableHeaderCell>TOTAL ALUMNOS</CTableHeaderCell>
                        <CTableHeaderCell>AÑO ACADÉMICO</CTableHeaderCell>
                        <CTableHeaderCell>PROFESOR</CTableHeaderCell>
                        <CTableHeaderCell>ACCIÓN</CTableHeaderCell>
                        </CTableRow>
                    </CTableHead>
                    <CTableBody className="text-center" style={{fontSize: '0.85rem',}}>
                    {currentRecords2.length > 0 ? (
                      currentRecords2.map((seccion, index) => (
                        <CTableRow key={index}>
                          <CTableDataCell>{index + 1}</CTableDataCell>
                          <CTableDataCell>{seccion.Seccion}</CTableDataCell>
                          <CTableDataCell>{seccion.Grado}</CTableDataCell>
                          <CTableDataCell>{seccion.Total_Alumnos}</CTableDataCell>
                          <CTableDataCell>{seccion.Anio_Academico}</CTableDataCell>
                          <CTableDataCell>{seccion.Nombre_Profesor}</CTableDataCell>
                          <CTableDataCell>
                            <CButton
                              size="sm"
                              style={{
                                backgroundColor: "#F0F4F3",
                                color: "#153E21",
                                border: "1px solid #A2B8A9",
                                borderRadius: "6px",
                                padding: "5px 12px",
                                boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
                              }}
                              onMouseEnter={(e) => (e.target.style.backgroundColor = "#dce3dc")}
                              onMouseLeave={(e) => (e.target.style.backgroundColor = "#F0F4F3")}
                              onClick={() => handleViewEstudiantes(seccion.Cod_secciones, seccion.Seccion,seccion.Grado,seccion.Anio_Academico)}
                            >
                              Ver Estudiantes
                            </CButton>
                          </CTableDataCell>
                        </CTableRow>
                      ))
                    ) : (
                      <CTableRow>
                        <CTableDataCell colSpan="5">No se encontraron resultados</CTableDataCell>
                      </CTableRow>
                    )}
                    </CTableBody>
                  </CTable>
                  </div>
                   {/* Paginación Fija */}
                  <div style={{ display: 'flex',  justifyContent: 'center', alignItems: 'center', marginTop: '16px' }}>
                    <CPagination aria-label="Page navigation" style={{ display: 'flex', gap: '10px' }}>
                      <CButton
                        style={{ backgroundColor: '#6f8173', color: '#D9EAD3' }}
                        disabled={currentPage2 === 1} // Deshabilitar si estás en la primera página
                        onClick={() => paginate2(currentPage2 - 1)}>
                        Anterior
                      </CButton>
                      <CButton
                        style={{ marginLeft: '10px',backgroundColor: '#6f8173', color: '#D9EAD3' }}
                        disabled={currentPage2 === Math.ceil(filteredSecciones.length / recordsPerPage2)} // Deshabilitar si estás en la última página
                        onClick={() => paginate2(currentPage2 + 1)}>
                        Siguiente
                    </CButton>
                  </CPagination>
                    {/* Mostrar total de páginas */}
                    <span style={{ marginLeft: '10px' }}>
                      Página {currentPage2} de {Math.ceil(filteredSecciones.length / recordsPerPage2)}
                    </span>
                </div>
             </>
        )}

{!cargando && currentView === 'estudiantes' && (
     <>
     <CRow className="align-items-center mb-5">
        <CCol xs="12" className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
          <CButton className="btn btn-sm d-flex align-items-center gap-1 rounded shadow"
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#4B4B4B")} onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#656565")}
            style={{backgroundColor: "#656565",color: "#FFFFFF",padding: "6px 12px",fontSize: "0.9rem",transition: "background-color 0.2s ease, box-shadow 0.3s ease",boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",}}
            onClick={handleBackToSecciones}>
            <CIcon icon={cilArrowLeft} /> Volver a Secciones
          </CButton>    
          <div className="d-flex flex-column justify-content-center align-items-center flex-grow-1">
            <h3 className="text-center pb-2 mb-0" style={{borderBottom: "2px solid #4CAF50", margin: "0 auto", fontSize: "1.5rem"}}>
              Estudiantes
            </h3>
            <div className="d-flex justify-content-center align-items-center mt-2">
              <div className="me-3" style={{fontSize: "1rem"}}>Grado: {gradoSeleccionado}</div>
              <div className="me-3" style={{fontSize: "1rem"}}>Sección: {nombreSeccionSeleccionada}</div>
              <div className="me-3" style={{fontSize: "1rem"}}>Año: {anioSeccionSeleccionada}</div>
            </div>
          </div>
            <CDropdown className="btn-sm d-flex align-items-center gap-1 rounded shadow">
                <CDropdownToggle
                  style={{backgroundColor: '#6C8E58',color: 'white',fontSize: '0.85rem',cursor: 'pointer',transition: 'all 0.3s ease', }}
                  onMouseEnter={(e) => {e.currentTarget.style.backgroundColor = '#5A784C'; e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';  }}
                  onMouseLeave={(e) => {e.currentTarget.style.backgroundColor = '#6C8E58'; e.currentTarget.style.boxShadow = 'none'; }}>
                  <CIcon icon={cilDescription}/> Reporte
                </CDropdownToggle>
                <CDropdownMenu style={{position: "absolute", zIndex: 1050, /* Asegura que el menú esté por encima de otros elementos*/ backgroundColor: "#fff",boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.2)",borderRadius: "4px",overflow: "hidden",}}>
                  <CDropdownItem
                    onClick={generarReportealumnoPDF}
                    style={{cursor: "pointer",outline: "none",backgroundColor: "transparent",padding: "0.5rem 1rem",fontSize: "0.85rem",color: "#333",borderBottom: "1px solid #eaeaea",transition: "background-color 0.3s",}}
                    onMouseOver={(e) =>(e.target.style.backgroundColor = "#f5f5f5")} onMouseOut={(e) =>(e.target.style.backgroundColor = "transparent")}>
                    <CIcon icon={cilFile} size="sm" /> Abrir en PDF
                  </CDropdownItem>
                  <CDropdownItem
                    onClick={generarReportealumnoExcel}
                    style={{cursor: "pointer",outline: "none",backgroundColor: "transparent",padding: "0.5rem 1rem",fontSize: "0.85rem",color: "#333",transition: "background-color 0.3s",}}
                    onMouseOver={(e) =>(e.target.style.backgroundColor = "#f5f5f5")}
                    onMouseOut={(e) =>(e.target.style.backgroundColor = "transparent")}>
                    <CIcon icon={cilSpreadsheet} size="sm" /> Descargar Excel
                  </CDropdownItem>
                </CDropdownMenu>
              </CDropdown>
        </CCol>
     </CRow>  
       {/* Contenedor de la barra de búsqueda y el selector dinámico */}
       <CRow className="align-items-center mt-4 mb-2">
              {/* Barra de búsqueda  */}
              <CCol xs="12" md="8" className="d-flex flex-wrap align-items-center">
                <CInputGroup className="me-3" style={{ width: '350px' }}>
                  <CInputGroupText>
                    <CIcon icon={cilSearch} />
                  </CInputGroupText>
                  <CFormInput
                  style={{ width: '80px',height:'35px', display: 'inline-block',fontSize: '0.8rem'}}
                    placeholder="Buscar estudiante..."
                    onChange={handleSearch3}
                    value={searchTerm3}
                    onPaste={disableCopyPaste}
                    onCopy={disableCopyPaste}
                  />
                  <CButton
                    style={{border: '1px solid #ccc',
                      transition: 'all 0.1s ease-in-out', // Duración de la transición
                      backgroundColor: '#F3F4F7', // Color por defecto
                      color: '#343a40', // Color de texto por defecto
                      height:'35px'
                    }}
                    onClick={() => {
                      setSearchTerm3('');
                      setCurrentPage3(1);
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#E0E0E0'; // Color cuando el mouse sobre el boton "limpiar"
                      e.currentTarget.style.color = 'black'; // Color del texto cuando el mouse sobre el boton "limpiar"
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#F3F4F7'; // Color cuando el mouse no está sobre el boton "limpiar"
                      e.currentTarget.style.color = '#343a40'; // Color de texto cuando el mouse no está sobre el boton "limpiar"
                    }}
                  >
                    <CIcon icon={cilBrushAlt} /> Limpiar
                  </CButton>
                </CInputGroup>
            </CCol>

              {/* Selector dinámico a la par de la barra de búsqueda */}
              <CCol xs="12" md="4" className="text-md-end mt-2 mt-md-0">
                <CInputGroup style={{ width: 'auto', display: 'inline-block' }}>
                  <div className="d-inline-flex align-items-center">
                    <span style={{ fontSize: '0.85rem' }}>Mostrar&nbsp;</span>
                      <CFormSelect
                        style={{ width: '80px',height:'35px', display: 'inline-block', textAlign: 'center' }}
                        onChange={(e) => {
                        const value = Number(e.target.value);
                        setRecordsPerPage3(value);
                        setCurrentPage3(1); // Reiniciar a la primera página cuando se cambia el número de registros
                      }}
                        value={recordsPerPage3}
                      >
                        <option value="5">5</option>
                        <option value="10">10</option>
                        <option value="20">20</option>
                      </CFormSelect>
                    <span style={{ fontSize: '0.85rem' }}>&nbsp;registros</span>
                  </div>       
              </CInputGroup>
            </CCol>
            </CRow>
            <div className="table-responsive" style={{maxHeight: '400px',overflowX: 'auto',overflowY: 'auto', boxShadow: "0 4px 10px rgba(0, 0, 0, 0.3)"}}>
            <CTable striped bordered hover responsive >
            <CTableHead className="sticky-top bg-light text-center" style={{fontSize: '0.8rem'}}>
            <CTableRow>
              <CTableHeaderCell>#</CTableHeaderCell>
              <CTableHeaderCell>IDENTIDAD</CTableHeaderCell>
              <CTableHeaderCell>ALUMNO</CTableHeaderCell>
              <CTableHeaderCell>ACCIÓN</CTableHeaderCell>
              </CTableRow>
              </CTableHead>
              <CTableBody className="text-center" style={{fontSize: '0.85rem',}}>
              {currentRecords3.length > 0 ? (
              currentRecords3.map((estudiante, index) => (
              <CTableRow key={estudiante.Cod_seccion_matricula}>
                <CTableDataCell>{index + 1}</CTableDataCell>
                <CTableDataCell>{estudiante.Identidad}</CTableDataCell>
                <CTableDataCell>{estudiante.Nombre_Completo}</CTableDataCell>
                <CTableDataCell>
                  <CButton
                    style={{
                      backgroundColor: "#F0F4F3",
                      color: "#153E21",
                      border: "1px solid #A2B8A9",
                      borderRadius: "6px",
                      padding: "5px 12px",
                      boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
                    }}
                    size="sm"
                    onMouseEnter={(e) => (e.target.style.backgroundColor = "#dce3dc")}
                    onMouseLeave={(e) => (e.target.style.backgroundColor = "#F0F4F3")}
                    onClick={() => fetchCuadroNotas(estudiante.Cod_seccion_matricula,estudiante.Nombre_Completo, estudiante.Identidad)}
                  >
                    Cuadro Notas
                  </CButton>
                </CTableDataCell>
              </CTableRow>
            ))
          ) : (
            <CTableRow>
              <CTableDataCell colSpan="5">No se encontraron resultados</CTableDataCell>
            </CTableRow>
          )}
          </CTableBody>
        </CTable>
        </div>
      {/* Paginación Fija */}
      <div style={{ display: 'flex',  justifyContent: 'center', alignItems: 'center', marginTop: '16px' }}>
        <CPagination aria-label="Page navigation" style={{ display: 'flex', gap: '10px' }}>
          <CButton
            style={{ backgroundColor: '#6f8173', color: '#D9EAD3' }}
            disabled={currentPage3 === 1} // Deshabilitar si estás en la primera página
            onClick={() => paginate3(currentPage3 - 1)}>
            Anterior
          </CButton>
          <CButton
            style={{ marginLeft: '10px',backgroundColor: '#6f8173', color: '#D9EAD3' }}
            disabled={currentPage3 === Math.ceil(filteredEstudiantes.length / recordsPerPage3)} // Deshabilitar si estás en la última página
            onClick={() => paginate3(currentPage3 + 1)}>
            Siguiente
        </CButton>
      </CPagination>
        {/* Mostrar total de páginas */}
        <span style={{ marginLeft: '10px' }}>
          Página {currentPage3} de {Math.ceil(filteredEstudiantes.length / recordsPerPage3)}
        </span>
    </div>
  </>
)}

{!cargando && currentView === 'cuadroNotas' && (
  <>
     <CCol
  xs="12"
  className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3"
>
  {/* Botón Volver a Estudiantes */}
  <CButton
    className="btn btn-sm d-flex align-items-center gap-1 rounded shadow"
    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#4B4B4B")}
    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#656565")}
    style={{
      backgroundColor: "#656565",
      color: "#FFFFFF",
      padding: "6px 12px",
      fontSize: "0.9rem",
      transition: "background-color 0.2s ease, box-shadow 0.3s ease",
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
    }}
    onClick={() => setCurrentView('estudiantes')} // Regresa a la vista de estudiantes
  >
    <CIcon icon={cilArrowLeft} /> Volver a Estudiantes
  </CButton>

  {/* Botón Exportar a PDF */}
  <CButton
  className="btn btn-sm d-flex align-items-center gap-1 rounded shadow"
  style={{
    backgroundColor: '#6C8E58',
    color: 'white',
    padding: "6px 12px",
    fontSize: "0.9rem",
    marginTop: "0", // Ajuste para evitar separación vertical
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.backgroundColor = '#5A784C';
    e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.backgroundColor = '#6C8E58';
    e.currentTarget.style.boxShadow = 'none';
  }}
  onClick={exportarContenido} // Aquí está en la posición correcta
>
  <CIcon icon={cilDescription} />
  Guardar PDF
</CButton>

</CCol>

<div
  id="cuadroNotasRender"
  style={{
    width: "816px", // Carta width in pixels at 96 DPI
    height: "1056px", // Carta height in pixels at 96 DPI
    backgroundColor: "white", // Fondo blanco para un diseño limpio
    padding: "20px", // Opcional, para dar espacio interno
    boxSizing: "border-box", // Incluye el padding en el tamaño total
    justifyContent: "center",
  }}
  
>

    {/* Encabezado del reporte */}
    <div 
  style={{ 
    display: 'flex',  // Usamos flexbox para alinear los elementos en línea
    alignItems: 'center',  // Alineamos los elementos verticalmente al centro
    justifyContent: 'center',  // Alineamos todo el contenido a la izquierda
    textAlign: 'left',  // Alineamos el texto a la izquierda
    marginBottom: '10px', 
    flex: 1, 
    marginLeft: '-70px',
    padding: '5px',
    borderRadius: '8px',
    fontFamily: 'Arial Narrow, sans-serif', // Establecer fuente general
    fontSize: '1rem',
    
  }}
>
  {/* Logo a la izquierda */}
  <img 
    src={logo}  
    alt="Saint Patrick's Academy Logo" 
    style={{
      width: '200px', 
      height: '200px', 
      position: 'relative',  // Usamos posición relativa para moverlo
      left: '-80px',  // Desplazamos el logo hacia la izquierda
    }} 
  />
  
  {/* Contenedor de texto a la izquierda */}
  <div style={{ textAlign: 'center', marginTop: '-70px',transform: 'translateX(-10px)'   }}>
    {/* Título con Monotype Corsiva */}
    <h1 style={{
      fontSize: '2.333rem', 
      marginBottom: '10px',
      marginTop: '0', 
      fontFamily: 'Monotype Corsiva, cursive', 
      fontWeight: 'bold',
      color: '#000000',
    }}>
      Saint Patrick's Academy
    </h1>

    {/* Subtítulo con Arial Narrow */}
    <h2 style={{
      fontSize: '2.17rem', 
      marginBottom: '5px', 
      fontFamily: 'Monotype Corsiva, cursive',
      color: '#000000',
      marginTop: '0', 
      fontWeight: 'bold'
    }}>
      Report Card
    </h2>
  </div>
</div>


    <div style={{ display: 'flex', justifyContent: 'space-between', margin: '0 30px', fontSize: '1.1rem', fontFamily: 'Arial Narrow, sans-serif', color: '#000000', marginTop:'30px' }}>
      <span style={{ display: 'flex', alignItems: 'center'}}>
        <strong style={{ fontWeight: 'bold' }}>Student Name:</strong>
        <span style={{ borderBottom: '1px solid black', paddingBottom: '2px', display: 'inline-block', flex: '1', marginLeft: '5px', letterSpacing: '0.5px' }}>
          {nombreEstudiante}
        </span>
      </span>
      <span style={{ display: 'flex', alignItems: 'center' }}>
        <strong style={{ fontWeight: 'bold' }}>Student ID:</strong>
        <span style={{ borderBottom: '1px solid black', paddingBottom: '2px', display: 'inline-block', flex: '1', marginLeft: '5px', letterSpacing: '0.5px' }}>
          {identidadEstudiante}
        </span>
      </span>
    </div>

    <div style={{ display: 'flex', justifyContent: 'space-between', margin: '20px 30px', fontSize: '1.1rem', fontFamily: 'Arial Narrow, sans-serif', color: '#000000' , marginTop:'30px' }}>
      <span style={{ marginLeft: '40px' }}>
        <strong style={{ fontWeight: 'bold' }}>Grade: </strong>
        <span style={{ paddingBottom: '2px', display: 'inline-block', letterSpacing: '0.5px' }}> {gradoSeleccionado}</span>
      </span>
      <span style={{ marginLeft: '10px' }}><strong style={{ fontWeight: 'bold' }}>Section: </strong> {nombreSeccionSeleccionada}</span>
      <span style={{ marginRight: '40px' }}>
      <strong style={{ fontWeight: 'bold' }}>School year: </strong> {new Date().getFullYear()}-{new Date().getFullYear() + 1}</span>

    </div>


          
    <CTable 
  className="table-bordered" 
  style={{ border: '1px solid #000000', marginTop: '50px', fontSize: '0.75rem', lineHeight: '1' }}
>
<CTableHead>
  <CTableRow>
    <CTableHeaderCell 
      rowSpan={2} 
      className="text-center align-middle" 
      style={{ backgroundColor: '#BFBFBF' }}
    >
      <div className="d-flex flex-column align-items-center justify-content-center">
        <span style={{ marginBottom: '12px' }}>ÁREAS CURRICULARES/</span>
        <span style={{ marginTop: '5px' }}>CAMPOS DEL CONOCIMIENTO</span>
      </div>
    </CTableHeaderCell>

    <CTableHeaderCell
      rowSpan={1}
      colSpan={
        cuadroNotas.length > 0 
        ? cuadroNotas[0].NotasParciales.filter(p => !p.Parcial.match(/recu/i)).length 
        : 0
      }
      className="text-center align-middle"
      style={{
        backgroundColor: '#BFBFBF',
        borderBottom: '1px solid #000000',
        padding: '10px',
      }}
    >
      PARCIALES
    </CTableHeaderCell>

    {/* Aquí se muestra dinámicamente el nombre del parcial de recuperación si existe */}
    {cuadroNotas.length > 0 && cuadroNotas[0].NotasParciales.some(p => p.Parcial.match(/recu/i)) && (
      cuadroNotas[0].NotasParciales.filter(p => p.Parcial.match(/recu/i)).map((parcial, index) => (
        <CTableHeaderCell 
          key={index}
          rowSpan={2}
          className="text-center align-middle"
          style={{ backgroundColor: '#BFBFBF', padding: '10px' }}
        >
          {parcial.Parcial} {/* Nombre dinámico del parcial de recuperación */}
        </CTableHeaderCell>
      ))
    )}

    <CTableHeaderCell 
      rowSpan={2} 
      className="text-center align-middle" 
      style={{ backgroundColor: '#BFBFBF' }}
    >
      <div className="d-flex flex-column align-items-center justify-content-center">
        <span style={{ marginBottom: '12px' }}>NOTA</span>
        <span style={{ marginTop: '5px' }}>PROM.FINAL (%)</span>
      </div>
    </CTableHeaderCell>
  </CTableRow>

  <CTableRow>
    {/* Encabezados dinámicos para los parciales, excluyendo "Recuperación" */}
    {cuadroNotas.length > 0 &&
      cuadroNotas[0].NotasParciales.filter(p => !p.Parcial.match(/recu/i)).map((parcial, index) => (
        <CTableHeaderCell 
          key={index} 
          className="text-center" 
          style={{ backgroundColor: '#BFBFBF' }}
        >
          {parcial.Parcial}
        </CTableHeaderCell>
      ))}
  </CTableRow>
</CTableHead>


  <CTableBody>
    {cuadroNotas.length > 0 ? (
      cuadroNotas.map((nota, index) => (
        <CTableRow key={index}>
          {/* Celda para el índice y la asignatura */}
          <CTableDataCell className="text-center bg-transparent" style={{ fontSize: '0.8rem', width: '350px' }}>
            <div className="d-flex justify-content-start">
              <span style={{ marginRight: '20px', marginLeft: '60px' }}>{index + 1}.</span>
              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {nota.Asignatura}
              </span>
            </div>
          </CTableDataCell>

          {/* Notas de parciales (sin "Recuperación" o palabras que contengan "recu") */}
        {nota.NotasParciales.filter(p => !p.Parcial.match(/recu/i)).map((parcial, i) => (
          <CTableDataCell key={i} className="text-center bg-transparent">
            {parcial.Nota}
          </CTableDataCell>
        ))}

         

           {/* Columna de Recuperación */}
        <CTableDataCell className="text-center bg-transparent">
          {
            nota.NotasParciales.find(p => p.Parcial.match(/recu/i))?.Nota || "-"
          }
        </CTableDataCell>
           {/* Columna Promedio Final */}
           <CTableDataCell className="text-center bg-transparent">
            {nota.PromedioFinal}
          </CTableDataCell>
        </CTableRow>
      ))
    ) : (
      <CTableRow>
        <CTableDataCell colSpan="5">No se encontraron resultados</CTableDataCell>
      </CTableRow>
    )}
  </CTableBody>
</CTable>

    </div>
  </>
)}
 </CContainer>
);
};
export default ListaCuadro;
