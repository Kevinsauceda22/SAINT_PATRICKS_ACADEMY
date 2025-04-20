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

import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

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
const [recordsPerPage2, setRecordsPerPage2] = useState(10);
const [searchTerm2, setSearchTerm2] = useState('');
const [currentPage2, setCurrentPage2] = useState(1);
//para paginacion y busqueda de la vista estudiantes
const [recordsPerPage3, setRecordsPerPage3] = useState(10);
const [searchTerm3, setSearchTerm3] = useState('');
const [currentPage3, setCurrentPage3] = useState(1); 


const [cuadroNotas, setCuadroNotas] = useState([]);

  useEffect(() => {
    fetchSecciones();
  }, []);

  const fetchSecciones = async () => {
    try {
        const response = await fetch('http://localhost:4000/api/notas/seccion', {
            method: 'GET',
        });

        if (!response.ok) throw new Error('Error al cargar secciones.');
        const data = await response.json();
        const dataWithIndex = data.map((seccion, index) => ({
          ...seccion,
          originalIndex: index + 1, // Guardamos la secuencia original
        }));
        setSecciones(dataWithIndex);
    } catch (error) {
        console.error('Error al obtener las secciones:', error);
    } finally {
        setCargando(false);
    }
};

  const fetchEstudiantes = async (Cod_secciones) => {
    try {
      const response = await fetch(`http://localhost:4000/api/seccionalumno/estudiantes/${Cod_secciones}`);
      if (!response.ok) throw new Error('Error al obtener la lista de estudiantes');
      const data = await response.json();

      const dataWithIndex = data.map((estudiante, index) => ({
        ...estudiante,
        originalIndex: index + 1, // Guardamos la secuencia original
      }));
      setEstudiantes(dataWithIndex);
    } catch (error) {
      console.error('Error:', error);
    }
  };
  

  const fetchCuadroNotas = async (Cod_seccion_matricula, nombreEstudiante , identidad) => {
    try {
      setNombreEstudiante(nombreEstudiante);
      setIdentidadEstudiante(identidad);
      const response = await fetch(`http://localhost:4000/api/notas/notasypromedio/${Cod_seccion_matricula}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`, // Incluye el token si es necesario
        },
      });
  
      if (!response.ok) throw new Error('Error al obtener el cuadro de notas.');
  
      const data = await response.json();
      const dataWithIndex = data.map((asignatura, index) => ({
        ...asignatura,
        originalIndex: index + 1, // Guardamos la posición original (1-based)
      }));
  
      setCuadroNotas(dataWithIndex);
    } catch (error) {
      console.error('Error al obtener el cuadro de notas:', error);
      Swal.fire({
        title: 'Sin datos disponibles',
        text: 'Actualmente no hay notas registradas para generar el cuadro de notas',
        icon: 'info',
        confirmButtonText: 'Aceptar',
      });
      
      setCuadroNotas([]); // Configurar un arreglo vacío en caso de error
    } finally {
      setCurrentView('cuadroNotas'); // Siempre cambiar a la vista del cuadro de notas
    }
  };
  
  

  
  const generarReportePDF = () => {
    // Validar que haya datos en la tabla
    if (!filteredSecciones || filteredSecciones.length === 0) {
     Swal.fire({
       icon: 'info',
       title: 'Tabla vacía',
       text: 'No hay datos disponibles para generar el reporte.',
       confirmButtonText: 'Aceptar',
     });
     return; // Salir de la función si no hay datos
   }
   const doc = new jsPDF('landscape');
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
       body: filteredSecciones.map((seccion, index) => [
         seccion.originalIndex || index + 1,
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
         0: { cellWidth: 20 }, // Columna '#' se ajusta automáticamente
         1: { cellWidth: 30 }, // Columna 'Sección' se ajusta automáticamente
         2: { cellWidth: 50 }, // Columna 'Grado' se ajusta automáticamente
         3: { cellWidth: 40 }, // Columna 'Año Académico' se ajusta automáticamente
         4: { cellWidth: 40 }, // Columna 'Año Académico' se ajusta automáticamente
         5: { cellWidth: 88 }, // Columna 'Profesor' se ajusta automáticamente
       },
       alternateRowStyles: { fillColor: [240, 248, 255] },
       didDrawPage: (data) => {
        const currentDate = new Date();
          const formattedDate = `${currentDate.toLocaleDateString()} ${currentDate.toLocaleTimeString()}`;
          const pageHeight = doc.internal.pageSize.height; // Altura de la página
          doc.setFontSize(10);
          doc.setTextColor(100);
          // Fecha y hora en el pie de página
          doc.text(`Fecha y hora de generación: ${formattedDate}`, 10, pageHeight - 10);
        },
      });
      
      // Asegúrate de calcular el total de páginas al final
      const totalPages = doc.internal.getNumberOfPages();
      const pageWidth = doc.internal.pageSize.width; // Ancho de la página
      
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i); // Ve a cada página
        doc.setTextColor(100);
        const text = `Página ${i} de ${totalPages}`;
        // Agrega número de página en la posición correcta
        doc.text(text, pageWidth - 30, pageHeight - 10);
      }
    
 
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
  if (!filteredSecciones || filteredSecciones.length === 0) {
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
  const filas = filteredSecciones.map((seccion, index) => [
    seccion.originalIndex || index + 1,
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
    { wpx: 100 }, 
    { wpx: 100 }, 
    { wpx: 100 }, 
    { wpx: 100 } ,
    { wpx: 100 },
    { wpx: 250 } 
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
 if (!filteredEstudiantes || filteredEstudiantes.length === 0) {
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
     body: filteredEstudiantes.map((estudiante, index) => [
        estudiante.originalIndex || index + 1,
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
       0: { cellWidth: 30 }, // Columna '#' se ajusta automáticamente
       1: { cellWidth: 60 }, // Columna 'identidad' se ajusta automáticamente
       2: { cellWidth: 90 }, // Columna 'estudiante' se ajusta automáticamente
     },
     alternateRowStyles: { fillColor: [240, 248, 255] },
     didDrawPage: (data) => {
      const currentDate = new Date();
      const formattedDate = `${currentDate.toLocaleDateString()} ${currentDate.toLocaleTimeString()}`;
      const pageHeight = doc.internal.pageSize.height; // Altura de la página
      doc.setFontSize(10);
      doc.setTextColor(100);
      // Fecha y hora en el pie de página
      doc.text(`Fecha y hora de generación: ${formattedDate}`, 10, pageHeight - 10);
    },
  });
  
  // Asegúrate de calcular el total de páginas al final
  const totalPages = doc.internal.getNumberOfPages();
  const pageWidth = doc.internal.pageSize.width; // Ancho de la página
  
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i); // Ve a cada página
    doc.setTextColor(100);
    const text = `Página ${i} de ${totalPages}`;
    // Agrega número de página en la posición correcta
    doc.text(text, pageWidth - 30, pageHeight - 10);
  }

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
  if (!filteredEstudiantes || filteredEstudiantes.length === 0) {
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
  const filas = filteredEstudiantes.map((estudiante, index) => [
    estudiante.originalIndex || index + 1,
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
  // Limpiar filtros y paginación de secciones (opcional)
  setSearchTerm2('');
  setCurrentPage2(1);
  
  // Establecer datos de la sección seleccionada
  setSelectedCodSeccion(Cod_secciones);
  setNombreSeccionSeleccionada(nombreSeccion);
  setGradoSeleccionado(grado);
  setAnioSeccionSeleccionada(anio);
  
  // Cargar estudiantes y cambiar vista
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
  // Limpiar filtros y paginación de estudiantes
  setSearchTerm3('');
  setCurrentPage3(1);
  setRecordsPerPage3(10);
  // Limpiar filtros y paginación de estudiantes
  setSearchTerm3('');
  setCurrentPage3(1);
  setRecordsPerPage3(10);
  // Volver a la vista de secciones
  setCurrentView('secciones');
};
//------------------------------------------------------------------------------------------------------

 // Verificar permisos
 if (!canSelect) {
  return <AccessDenied />;
}

const generarPDFFiel = () => {
  // Validación de notas finales
  const tieneNotasFinales = cuadroNotas && cuadroNotas.some(nota => 
    nota.PromedioFinal && !isNaN(parseFloat(nota.PromedioFinal)));
  
  if (!tieneNotasFinales) {
    Swal.fire({
      icon: 'info',
      title: 'No se puede generar el PDF',
      text: 'No hay notas finales disponibles para exportar.',
      confirmButtonText: 'Aceptar',
    });
    return;
  }
  try {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });
  // --- Configuración de Fuentes ---
  doc.setFont("times", "normal");
  const styles = {
    tituloPrincipal: { size: 23, color: [0, 0, 0] },
    subtitulo: { size: 19, color: [0, 0, 0], font: "times", }, // Usar "times" para estilo Monotype Corsiva
    textoNormal: { size: 11, color: [0, 0, 0] },
    encabezadoTabla: { size: 8, color: [0, 0, 0], fill: [191, 191, 191] },
    cuerpoTabla: { size: 8, color: [0, 0, 0] }
  };

  // --- Logo y Encabezado ---
  doc.addImage(logo, "PNG", 18, 11, 40, 40); // Posición exacta (15mm desde izquierda, 10mm desde arriba)

  // Título principal
doc.setFontSize(styles.tituloPrincipal.size);
doc.setTextColor(...styles.tituloPrincipal.color);
doc.setFont("times", "bolditalic"); 
doc.text("Saint Patrick's Academy", 105, 24, { align: "center" }); // 25mm desde arriba

// Subtítulo "Report Card" con espacio de 10mm
doc.setFontSize(styles.subtitulo.size);
doc.setFont("times", "bolditalic"); 
doc.text("Report Card", 105, 39, { align: "center" }); // 35mm (25 + 10mm)

// --- Datos del Estudiante ---
doc.setFontSize(styles.textoNormal.size);
doc.setTextColor(0, 0, 0);
doc.setFont("times", "normal");

// Configuración para datos centrados
const estiloLinea = { 
  color: [0, 0, 0], 
  grosor: 0.3, 
  separacion: 2 // 2mm debajo del texto
};
const espacioEntreCampos = 45; // Espacio entre Name e ID

// --- Primera línea (Name + ID) ---
const yPosNameID = 63;

const labelNombre = "Student Name: ";
const labelID = "Student ID: ";

// Calcular centrado total
const textoCompletoNameID = labelNombre + nombreEstudiante + " ".repeat(espacioEntreCampos) + labelID + identidadEstudiante;
const anchoTotalNameID = doc.getTextWidth(textoCompletoNameID);
const xInicioNameID = (205 - anchoTotalNameID) / 2;

// Dibujar "Student Name:" en negrita
doc.setFont(undefined, "bold");
doc.text(labelNombre, xInicioNameID, yPosNameID);

// Dibujar nombre del estudiante en normal
const xNombre = xInicioNameID + doc.getTextWidth(labelNombre);
doc.setFont(undefined, "normal");
doc.text(nombreEstudiante, xNombre, yPosNameID);

// Subrayado del nombre
doc.setDrawColor(...estiloLinea.color);
doc.setLineWidth(estiloLinea.grosor);
doc.line(
  xNombre,
  yPosNameID + estiloLinea.separacion,
  xNombre + doc.getTextWidth(nombreEstudiante),
  yPosNameID + estiloLinea.separacion
);

// Dibujar "Student ID:" en negrita
const xID = xNombre + doc.getTextWidth(nombreEstudiante) + espacioEntreCampos;
doc.setFont(undefined, "bold");
doc.text(labelID, xID, yPosNameID);

// Dibujar ID del estudiante en normal
const xValorID = xID + doc.getTextWidth(labelID);
doc.setFont(undefined, "normal");
doc.text(identidadEstudiante, xValorID, yPosNameID);

// Subrayado del ID
doc.line(
  xValorID,
  yPosNameID + estiloLinea.separacion,
  xValorID + doc.getTextWidth(identidadEstudiante),
  yPosNameID + estiloLinea.separacion
);


// --- Segunda línea (Grade + Section + Year) ---
const yPosDetails = 76; // 10mm debajo de la línea anterior (48 + 10)

// Primero construimos el texto completo para calcular su ancho total
const textoCompleto = `Grade: ${gradoSeleccionado}                              Section: ${nombreSeccionSeleccionada}                              School year: ${new Date().getFullYear()}-${new Date().getFullYear() + 1}`;
const anchoTotal = doc.getTextWidth(textoCompleto);
const xInicioCentrado = (210 - anchoTotal) / 2; // Centrado en página A4 (210mm)

let currentX = xInicioCentrado;

// Función para añadir texto con estilo y actualizar posición X
function addText(text, isBold = false) {
  doc.setFont(undefined, isBold ? 'bold' : 'normal');
  doc.text(text, currentX, yPosDetails);
  currentX += doc.getTextWidth(text);
}

// Escribimos cada parte con su formato correspondiente
addText('Grade: ', true);
addText(`${gradoSeleccionado}`, false);

addText('                              Section: ', true);
addText(`${nombreSeccionSeleccionada}`, false);

addText('                              School year: ', true);
addText(`${new Date().getFullYear()}-${new Date().getFullYear() + 1}`, false);

// --- Aumentar espacio antes de la tabla ---
const espacioAntesTabla = 6; // Aumenté de 10mm a 15mm (ajusta este valor)
  // --- Tabla de Notas (Réplica exacta) ---

  // Obtener TODOS los parciales de recuperación
  const recuperaciones = cuadroNotas[0]?.NotasParciales.filter(p => p.Parcial.match(/recu/i)) || [];
  doc.autoTable({
    startY: yPosDetails + espacioAntesTabla,
    head: [
      [
        {
          content: "ÁREAS CURRICULARES/\nCAMPOS DEL CONOCIMIENTO",
          rowSpan: 2,
          styles: { valign: 'middle', halign: 'center' }
        },
        {
          content: "PARCIALES",
          colSpan: cuadroNotas[0]?.NotasParciales.filter(p => !p.Parcial.match(/recu/i)).length || 0,
          styles: { halign: 'center' }
        },
       // Columnas dinámicas para cada recuperación
       ...recuperaciones.map(recup => ({
        content: recup.Parcial,
        rowSpan: 2,
        styles: { valign: 'middle', halign: 'center' }
      })),
        {
          content: "NOTA PROM.FINAL (%)",
          rowSpan: 2,
          styles: { valign: 'middle', halign: 'center' }
        }
      ],
      [
        // Subcolumnas debajo de "PARCIALES"
        ...cuadroNotas[0]?.NotasParciales
          .filter(p => !p.Parcial.match(/recu/i))
          .map(p => ({
            content: p.Parcial,
            styles: { halign: 'center' }
          })) || []
      ]
    ],
    body: [
      // Filas de notas
      ...cuadroNotas.map((nota, index) => [
        `${index + 1}. ${nota.Asignatura}`,
        // Notas de parciales normales
        ...nota.NotasParciales
          .filter(p => !p.Parcial.match(/recu/i))
          .map(p => p.Nota),
        // Notas de recuperaciones (todas)
        ...recuperaciones.map(recup => {
          const notaRecup = nota.NotasParciales.find(p => p.Parcial === recup.Parcial);
          return notaRecup?.Nota || "-";
        }),
        // Nota final
        nota.PromedioFinal
      ]),
      // Fila de promedios
      [
        { content: "PROMEDIO", styles: { fontStyle: 'bold', fillColor: [240, 240, 240] } },
        // Promedios por parcial normal
        ...(cuadroNotas[0]?.NotasParciales
          .filter(p => !p.Parcial.match(/recu/i))
          .map((parcial, i) => {
            const sum = cuadroNotas.reduce((acc, nota) => {
              const notaParcial = nota.NotasParciales.find(np => np.Parcial === parcial.Parcial);
              return acc + (parseFloat(notaParcial?.Nota) || 0);
            }, 0);
            const avg = (sum / cuadroNotas.length).toFixed(2);
            return { 
              content: avg, 
              styles: { fontStyle: 'bold', fillColor: [240, 240, 240] }
            };
          }) || []),
        // Celdas vacías para recuperaciones
        ...recuperaciones.map(() => ({
          content: "-",
          styles: { fontStyle: 'bold', fillColor: [240, 240, 240] }
        })),
        // Promedio final
        { 
          content: (cuadroNotas.reduce((acc, nota) => acc + (parseFloat(nota.PromedioFinal) || 0), 0) / cuadroNotas.length).toFixed(2),
          styles: { fontStyle: 'bold', fillColor: [240, 240, 240] }
        }
      ]
    ],
    
    styles: {
      fontSize: styles.cuerpoTabla.size,
      cellPadding: 2,
      halign: 'center',
      valign: 'middle',
      lineColor: [0, 0, 0],
      lineWidth: 0.2,
      textColor: [0, 0, 0]
    },
    headStyles: {
      fillColor: styles.encabezadoTabla.fill,
      textColor: styles.encabezadoTabla.color,
      fontStyle: 'bold',
      lineWidth: 0.3,
      fontSize: '8',
      font:'times'
    },
    bodyStyles: {
      textColor: [0, 0, 0], // Color azul oscuro para datos (RGB)
      fontSize: '9',
      font:'times'
    },
    columnStyles: {
      0: { 
        cellWidth: 60, // Ancho fijo para columna de asignaturas
        halign: 'left',
        fontStyle: 'normal'
      },
      // Alinear columnas de notas al centro
      ...Object.fromEntries(
        Array.from({ length: cuadroNotas[0]?.NotasParciales.length || 0 + 1 }, (_, i) => [i + 1, { halign: 'center' }])
      )
    },
    didParseCell: (data) => {
      // Estilo especial para celda de dos líneas en encabezado
      if (data.section === 'head' && data.column.index === 0) {
        data.cell.styles.valign = 'middle';
        data.cell.styles.lineHeight = 1.2;
      }
      
      // Numeración alineada a la izquierda con margen
      if (data.section === 'body' && data.column.index === 0) {
        data.cell.text = [`  ${data.cell.text[0]}`]; // Añade espacio izquierdo
      }
    }
  });

  const finalY = doc.lastAutoTable.finalY || 0;

// Coordenadas de la línea
const lineXStart = 110;
const lineXEnd = 180;
const lineY = finalY + 35; // más espacio desde la tabla

// Dibuja una línea más delgada
doc.setLineWidth(0.2);
doc.line(lineXStart, lineY, lineXEnd, lineY);

// Centra el texto debajo de la línea
const centerX = (lineXStart + lineXEnd) / 2;

doc.setFontSize(10);
doc.setFont("Times", "normal");
doc.text("Director / Principal", centerX, lineY + 6, { align: "center" });
doc.text("Sello y firma", centerX, lineY + 12, { align: "center" });

  // Supongamos que tienes estas variables:
const grado = gradoSeleccionado.replace(/\s+/g, '_'); // Reemplaza espacios por guiones bajos
const seccion = nombreSeccionSeleccionada.replace(/\s+/g, '_');
const anio = anioSeccionSeleccionada || `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`;
const alumno = nombreEstudiante.replace(/\s+/g, '_');

// Generar el nombre del archivo
const nombreArchivo = `Report_Card_Grade_${grado}_Section_${seccion}_${anio}_${alumno}.pdf`;

// Guardar el PDF
doc.save(nombreArchivo);
} catch (error) {
  console.error('Error al generar el PDF:', error);
  Swal.fire({
    icon: 'error',
    title: 'Error al generar PDF',
    text: error.message || 'Ocurrió un error al generar el archivo PDF',
    confirmButtonText: 'Aceptar',
  });
}
};

// Convierte un número de columna a letra (1 = A, 27 = AA, etc.)
const columnNumberToLetter = (colNum) => {
  let letter = '';
  while (colNum > 0) {
    let remainder = (colNum - 1) % 26;
    letter = String.fromCharCode(65 + remainder) + letter;
    colNum = Math.floor((colNum - 1) / 26);
  }
  return letter;
};

const convertirImagenABase64 = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous'; // Evita errores por CORS
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const dataURL = canvas.toDataURL('image/png');
      resolve(dataURL);
    };
    img.onerror = (err) => reject(err);
    img.src = url;
  });
};


const generarExcelFiel = async () => {
  // Validación de notas finales
  const tieneNotasFinales = cuadroNotas && cuadroNotas.some(nota => 
    nota.PromedioFinal && !isNaN(parseFloat(nota.PromedioFinal)));
  
  if (!tieneNotasFinales) {
    Swal.fire({
      icon: 'info',
      title: 'No se puede generar el Excel',
      text: 'No hay notas finales disponibles para exportar.',
      confirmButtonText: 'Aceptar',
    });
    return;
  }

  try {
    const base64 = await convertirImagenABase64(logo);
    
  
    // Crear un nuevo libro de Excel
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Report Card');
    // Agregar la imagen al archivo Excel
    const imageId = workbook.addImage({
      base64,
      extension: 'png',
    });

    // Configuración general de la hoja
    worksheet.properties.defaultRowHeight = 20;
    worksheet.pageSetup.margins = {
      left: 0.5, right: 0.5,
      top: 0.5, bottom: 0.5,
      header: 0.3, footer: 0.3
    };
    worksheet.pageSetup.paperSize = 9; // A4

    // Obtener TODOS los parciales de recuperación (igual que en el PDF)
    const recuperaciones = cuadroNotas[0]?.NotasParciales.filter(p => p.Parcial.match(/recu/i)) || [];
    const parcialesNormales = cuadroNotas[0]?.NotasParciales.filter(p => !p.Parcial.match(/recu/i)) || [];

    const totalColumnas = 3 + parcialesNormales.length + recuperaciones.length + 1; // Ajusta según tu estructura real
    const ultimaColLetra = columnNumberToLetter(totalColumnas);

    // Estilos personalizados
    const styles = {
      tituloPrincipal: {
        font: { name: 'Times New Roman', size: 23, bold: true, italic: true },
        alignment: { horizontal: 'center', vertical: 'middle' }
      },
      subtitulo: {
        font: { name: 'Times New Roman', size: 19, bold: true, italic: true },
        alignment: { horizontal: 'center', vertical: 'middle' }
      },
      textoNormal: {
        font: { name: 'Times New Roman', size: 11 },
        alignment: { vertical: 'middle' }
      },
      textoNegrita: {
        font: { name: 'Times New Roman', size: 11, bold: true },
        alignment: { vertical: 'middle' }
      },
      encabezadoTabla: {
        font: { name: 'Times New Roman', size: 8, bold: true },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'BFBFBF' } },
        alignment: { horizontal: 'center', vertical: 'middle', wrapText: true },
        border: {
          top: { style: 'thin', color: { argb: '000000' } },
          left: { style: 'thin', color: { argb: '000000' } },
          right: { style: 'thin', color: { argb: '000000' } },
          bottom: { style: 'thin', color: { argb: '000000' } }
        }
      },
      cuerpoTabla: {
        font: { name: 'Times New Roman', size: 8 },
        alignment: { vertical: 'middle' },
        border: {
          top: { style: 'thin', color: { argb: '000000' } },
          left: { style: 'thin', color: { argb: '000000' } },
          right: { style: 'thin', color: { argb: '000000' } },
          bottom: { style: 'thin', color: { argb: '000000' } }
        }
      },
      promedioTabla: {
        font: { name: 'Times New Roman', size: 8, bold: true },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F0F0F0' } },
        alignment: { horizontal: 'center', vertical: 'middle' },
        border: {
          top: { style: 'thin', color: { argb: '000000' } },
          left: { style: 'thin', color: { argb: '000000' } },
          right: { style: 'thin', color: { argb: '000000' } },
          bottom: { style: 'thin', color: { argb: '000000' } }
        }
      }
    };
    
   
    
    // --- Encabezado ---
    worksheet.addRow([]); // Fila 1 vacía
    // Título principal
    const tituloRow = worksheet.addRow([]);
    tituloRow.height = 30;
    const tituloCell = tituloRow.getCell(2);
    tituloCell.value = "          Saint Patrick's Academy";
    tituloCell.style = styles.tituloPrincipal;

    // Esto es lo que debes CAMBIAR
    // worksheet.mergeCells(`A1:${String.fromCharCode(65 + parcialesNormales.length + recuperaciones.length + 1)}1`);
    worksheet.mergeCells(`B2:${ultimaColLetra}2`);


    const subtituloRow = worksheet.addRow([]);
    subtituloRow.height = 25;
    const subtituloCell = subtituloRow.getCell(2);
    subtituloCell.value = "          Report Card";
    subtituloCell.style = styles.subtitulo;

    // También actualizá el merge del subtítulo
    worksheet.mergeCells(`B3:${ultimaColLetra}3`);

    // Fila de espacio entre título y subtítulo
    worksheet.addRow([]);  // <--- esta es la fila vacía

    // Cambiar de A1 (0,0) a B2 (1,1)
    worksheet.addImage(imageId, {
      tl: { col: 1, row: 1, offsetX: 0, offsetY: 0 },  // desde B2
      br: { col: 2, row: 4, offsetX: 0, offsetY: 0 },  // hasta D6 (agrandás el rango)
      editAs: 'twoCell', // se adapta al área definida
    });
    
    
    // --- Datos del Estudiante ---
    // Primera línea (Nombre + ID)
    const nombreIdRow = worksheet.addRow([]);
    nombreIdRow.height = 20;
    
   // Nombre del estudiante
    const nombreLabelCell = nombreIdRow.getCell(2);
    nombreLabelCell.value = "Student Name:";
    nombreLabelCell.style = styles.textoNegrita;
    

    const nombreValueCell = nombreIdRow.getCell(3);
    nombreValueCell.value = nombreEstudiante;
    nombreValueCell.style = {
      ...styles.textoNegrita,
      border: { bottom: { style: 'thin', color: { argb: '000000' } } }
    };
    worksheet.mergeCells(`C6:F6`);

    // Fusionar celdas G6 y H6
    worksheet.mergeCells('G6:H6');

    // Obtener la celda fusionada (solo se asigna a la primera)
    const idLabelCell = worksheet.getCell('G6');
    idLabelCell.value = "            Student ID: ";
    idLabelCell.style = styles.textoNegrita;


    const idValueCell = nombreIdRow.getCell(9);
    idValueCell.value = identidadEstudiante;
    idValueCell.style = {
      ...styles.textoNegrita,
      border: { bottom: { style: 'thin', color: { argb: '000000' } } }
    };
    worksheet.mergeCells(`I6:J6`);

    // Agregar fila vacía entre nombre/ID y grado/sección/año
    worksheet.addRow([]);

   // Segunda línea (Grado + Sección + Año)
    const detallesRow = worksheet.addRow([]);
    detallesRow.height = 20;

    worksheet.mergeCells('B8:C8'); // Fusionar celdas B8 y C8

    const gradoCell = worksheet.getCell('B8');
    gradoCell.value = `         Grade:  ${gradoSeleccionado}`;
    gradoCell.style = styles.textoNegrita; // o combiná estilo negrita con normal si querés diferencia

    //worksheet.mergeCells(`C8:D8`);

    // Fusionar D8 y E8
    worksheet.mergeCells('E8:F8');

    // Asignar valor a la celda combinada
    const seccionCell = worksheet.getCell('E8');
    seccionCell.value = `        Section:    ${nombreSeccionSeleccionada}`;
    seccionCell.style = styles.textoNegrita; // o styles.textoNormal si no querés que esté en negrita

    // (Opcional) Centrado o alineación a la izquierda
    seccionCell.alignment = { horizontal: 'left', vertical: 'middle' };


    // Fusionar celdas F8 y G8
    worksheet.mergeCells('H8:J8');
    const añoLabelCell = worksheet.getCell('H8');
    añoLabelCell.value = `     School year:   ${new Date().getFullYear()}-${new Date().getFullYear() + 1}`;
    añoLabelCell.style = styles.textoNegrita;
    


    // --- Tabla de Notas ---
    const startColParciales = 4; // Comenzar en columna B (B8)
    const startRowParciales = 10; // Fila 8 para los encabezados

      // Encabezados de la tabla - fila 8
    const headerRow1 = worksheet.getRow(startRowParciales);
    headerRow1.height = 25;
        // Áreas curriculares
    const areaCell = headerRow1.getCell(2);
    areaCell.value = "ÁREAS CURRICULARES/\nCAMPOS DEL CONOCIMIENTO";
    areaCell.style = styles.encabezadoTabla;
    worksheet.mergeCells(`B${startRowParciales}:C${startRowParciales + 1}`);

        // Parciales normales
    if (parcialesNormales.length > 0) {
      const parcialesCell = headerRow1.getCell(startColParciales);
      parcialesCell.value = "PARCIALES";
      parcialesCell.style = styles.encabezadoTabla;
      const endColParciales = startColParciales + parcialesNormales.length - 1;
      worksheet.mergeCells(`${String.fromCharCode(64 + startColParciales)}${startRowParciales}:${String.fromCharCode(64 + endColParciales)}${startRowParciales}`);
    }

      // Recuperaciones (dinámicas como en el PDF)
    const startColRecuperaciones = startColParciales + parcialesNormales.length;
    recuperaciones.forEach((recup, index) => {
      const col = startColRecuperaciones + index;
      const cell = headerRow1.getCell(col);
      cell.value = recup.Parcial;
      cell.style = styles.encabezadoTabla;
      worksheet.mergeCells(`${String.fromCharCode(64 + col)}${startRowParciales}:${String.fromCharCode(64 + col)}${startRowParciales + 1}`);
    });

      // Nota final
    const notaFinalCol = startColRecuperaciones + recuperaciones.length;
    const notaFinalCell = headerRow1.getCell(notaFinalCol);
    notaFinalCell.value = "NOTA PROM.FINAL (%)";
    notaFinalCell.style = styles.encabezadoTabla;
    worksheet.mergeCells(`${String.fromCharCode(64 + notaFinalCol)}${startRowParciales}:${String.fromCharCode(64 + notaFinalCol)}${startRowParciales + 1}`);

        // Subencabezados de parciales normales (fila 9) con fechas
    const headerRow2 = worksheet.getRow(startRowParciales + 1);
    headerRow2.height = 14;

    parcialesNormales.forEach((parcial, i) => {
      const cell = headerRow2.getCell(startColParciales + i);
      cell.value = `${parcial.Parcial}`;
      cell.style = styles.encabezadoTabla;
    });

        // Datos de las asignaturas
    cuadroNotas.forEach((nota, index) => {
      const row = worksheet.addRow([]);
      row.height = 20;

  // Asignatura - Combinando celdas A y B para cada fila
  const asignaturaCell = row.getCell(2);
  asignaturaCell.value = `${index + 1}. ${nota.Asignatura}`;
  asignaturaCell.style = {
    ...styles.cuerpoTabla,
    alignment: { horizontal: 'left', vertical: 'middle', indent: 1 }
  };
  
  // Combinar celdas A y B para cada fila de asignatura
  worksheet.mergeCells(`B${row.number}:C${row.number}`);
      // Notas de parciales normales
      nota.NotasParciales
        .filter(p => !p.Parcial.match(/recu/i))
        .forEach((parcial, i) => {
          const cell = row.getCell(startColParciales + i);
          cell.value = parcial.Nota;
          cell.style = {
            ...styles.cuerpoTabla,
            alignment: { horizontal: 'center', vertical: 'middle' }
          };
        });

      // Notas de recuperaciones (dinámicas)
      recuperaciones.forEach((recup, i) => {
        const col = startColRecuperaciones + i;
        const notaRecup = nota.NotasParciales.find(p => p.Parcial === recup.Parcial);
        const cell = row.getCell(col);
        cell.value = notaRecup?.Nota || "-";
        cell.style = {
          ...styles.cuerpoTabla,
          alignment: { horizontal: 'center', vertical: 'middle' }
        };
      });

      // Promedio final
      const promedioCell = row.getCell(notaFinalCol);
      promedioCell.value = nota.PromedioFinal;
      promedioCell.style = {
        ...styles.cuerpoTabla,
        alignment: { horizontal: 'center', vertical: 'middle' }
      };
    });

   // Fila de promedios
  const promedioRow = worksheet.addRow([]);
  promedioRow.height = 20;

  // Celda "PROMEDIO" combinando A y B
  const promedioLabelCell = promedioRow.getCell(2);
  promedioLabelCell.value = "PROMEDIO";
  promedioLabelCell.style = styles.promedioTabla;
  worksheet.mergeCells(`B${promedioRow.number}:C${promedioRow.number}`); // Combinar A y B


    // Promedios por parcial normal
    parcialesNormales.forEach((parcial, i) => {
      const sum = cuadroNotas.reduce((acc, nota) => {
        const notaParcial = nota.NotasParciales.find(np => np.Parcial === parcial.Parcial);
        return acc + (parseFloat(notaParcial?.Nota) || 0);
      }, 0);
      const avg = (sum / cuadroNotas.length).toFixed(2);
      
      const cell = promedioRow.getCell(startColParciales + i);
      cell.value = avg;
      cell.style = styles.promedioTabla;
    });

    // Celdas vacías para recuperaciones
    recuperaciones.forEach((_, i) => {
      const col = startColRecuperaciones + i;
      const cell = promedioRow.getCell(col);
      cell.value = "-";
      cell.style = styles.promedioTabla;
    });

    // Promedio final
    const promedioFinal = (cuadroNotas.reduce((acc, nota) => 
      acc + (parseFloat(nota.PromedioFinal) || 0), 0) / cuadroNotas.length).toFixed(2);
    const promedioFinalCell = promedioRow.getCell(notaFinalCol);
    promedioFinalCell.value = promedioFinal;
    promedioFinalCell.style = styles.promedioTabla;

    // Ajustar anchos de columnas
    worksheet.columns = [
      { width: 5 }, // Columna A vacía
      { width: 16 }, // Columna B (asignaturas)
      { width: 17 }, // Columna C (asignaturas)
      ...Array(parcialesNormales.length).fill().map(() => ({ width: 8 })),
      ...Array(recuperaciones.length).fill().map(() => ({ width: 10 })),
      { width: 12 } // Nota final
    ];

    // --- Pie de página ---
    for (let i = 1; i < 6; i++) worksheet.addRow([]); // espacio entre tabla y firma

    const columnaInicio = 6; // mueve la firma a la columna J
    const letraInicio = String.fromCharCode(64 + columnaInicio);

    // Línea de firma
    const lineaRow = worksheet.addRow([]);
    const lineaCell = lineaRow.getCell(columnaInicio);
    lineaCell.value = '_______________________________';
    lineaCell.style = {
      alignment: { horizontal: 'center' },
      font: { name: 'Times New Roman', size: 10 }
    };
    worksheet.mergeCells(
      `${letraInicio}${lineaRow.number}:${String.fromCharCode(64 + columnaInicio + 2)}${lineaRow.number}`
    );

    // Texto debajo de la línea
    const firmaRow = worksheet.addRow([]);
    const firmaCell = firmaRow.getCell(columnaInicio);
    firmaCell.value = 'Director / Principal\nSello y firma';
    firmaCell.style = {
      font: { name: 'Times New Roman', size: 10 },
      alignment: { horizontal: 'center', vertical: 'middle', wrapText: true }
    };
    worksheet.mergeCells(
      `${letraInicio}${firmaRow.number}:${String.fromCharCode(64 + columnaInicio + 2)}${firmaRow.number}`
    );


    // Generar el archivo Excel
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

    // Generar nombre con mismo formato que PDF incluyendo nombre estudiante
    const grado = gradoSeleccionado.replace(/\s+/g, '_');
    const seccion = nombreSeccionSeleccionada.replace(/\s+/g, '_');
    const anio = anioSeccionSeleccionada || `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`;
    const alumno = nombreEstudiante.replace(/\s+/g, '_');
    const nombreArchivoExcel = `Report_Card_Grade_${grado}_Section_${seccion}_${anio}_${alumno}.xlsx`;

    saveAs(blob, nombreArchivoExcel);
  } catch (error) {
    console.error('Error al generar el Excel:', error);
    Swal.fire({
      icon: 'error',
      title: 'Error al generar Excel',
      text: error.message || 'Ocurrió un error al generar el archivo Excel',
      confirmButtonText: 'Aceptar',
    });
  }
};
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
                        <option value="10">10</option>
                        <option value="20">20</option>
                        <option value="30">30</option>
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
                          <CTableDataCell>{seccion.originalIndex}</CTableDataCell>
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
                        <option value="10">10</option>
                        <option value="20">20</option>
                        <option value="30">30</option>
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
                <CTableDataCell>{estudiante.originalIndex}</CTableDataCell>
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
    onClick={() => {
      setCurrentView('estudiantes');
      setNombreEstudiante('');
      setIdentidadEstudiante('');
      setCuadroNotas([]);
    }} // Regresa a la vista de estudiantes
  >
    <CIcon icon={cilArrowLeft} /> Volver a Estudiantes
  </CButton>

  {/* Botón Exportar a PDF */}
  {/* Dropdown para exportar */}
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
      <CIcon icon={cilDescription} /> Exportar
    </CDropdownToggle>
    <CDropdownMenu style={{
      position: "absolute",
      zIndex: 1050,
      backgroundColor: "#fff",
      boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.2)",
      borderRadius: "4px",
      overflow: "hidden",
    }}>
      <CDropdownItem
        onClick={generarPDFFiel}
        style={{
          cursor: "pointer",
          outline: "none",
          backgroundColor: "transparent",
          padding: "0.5rem 1rem",
          fontSize: "0.85rem",
          color: "#333",
          borderBottom: "1px solid #eaeaea",
          transition: "background-color 0.3s",
        }}
        onMouseOver={(e) => (e.target.style.backgroundColor = "#f5f5f5")}
        onMouseOut={(e) => (e.target.style.backgroundColor = "transparent")}
      >
        <CIcon icon={cilFile} size="sm" /> PDF
      </CDropdownItem>
      <CDropdownItem
        onClick={generarExcelFiel}
        style={{
          cursor: "pointer",
          outline: "none",
          backgroundColor: "transparent",
          padding: "0.5rem 1rem",
          fontSize: "0.85rem",
          color: "#333",
          transition: "background-color 0.3s",
        }}
        onMouseOver={(e) => (e.target.style.backgroundColor = "#f5f5f5")}
        onMouseOut={(e) => (e.target.style.backgroundColor = "transparent")}
      >
        <CIcon icon={cilSpreadsheet} size="sm" /> Excel
      </CDropdownItem>
    </CDropdownMenu>
  </CDropdown>
</CCol>

<div
  id="cuadroNotasRender"
  style={{
    width: "816px", // Carta width in pixels at 96 DPI
    height: "1500px", // Carta height in pixels at 96 DPI
    backgroundColor: "white", // Fondo blanco para un diseño limpio
    padding: "20px", // Opcional, para dar espacio interno
    boxSizing: "border-box", // Incluye el padding en el tamaño total
    justifyContent: "center",
    fontFamily: "'Times New Roman', Times, serif",
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
    fontFamily: "'Times New Roman', Times, serif", // Establecer fuente general
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
      fontFamily: "'Times New Roman', Times, serif", 
      fontWeight: 'bold',
      fontStyle: 'italic',
      color: '#000000',
    }}>
      Saint Patrick's Academy
    </h1>

    {/* Subtítulo con Arial Narrow */}
    <h2 style={{
      fontSize: '2.17rem', 
      marginBottom: '5px', 
      fontFamily: "'Times New Roman', Times, serif",
      color: '#000000',
      marginTop: '0', 
      fontWeight: 'bold',
      fontStyle: 'italic'
    }}>
      Report Card
    </h2>
  </div>
</div>


    <div style={{ display: 'flex', justifyContent: 'space-between', margin: '0 30px', fontSize: '1.1rem', fontFamily: "'Times New Roman', Times, serif", color: '#000000', marginTop:'30px' }}>
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

    <div style={{ display: 'flex', justifyContent: 'space-between', margin: '20px 30px', fontSize: '1.1rem', fontFamily: "'Times New Roman', Times, serif", color: '#000000' , marginTop:'30px' }}>
      <span style={{ marginLeft: '40px' }}>
        <strong style={{ fontWeight: 'bold' }}>Grade: </strong>
        <span style={{ paddingBottom: '2px', display: 'inline-block', letterSpacing: '0.5px' }}> {gradoSeleccionado}</span>
      </span>
      <span style={{ marginLeft: '10px' }}><strong style={{ fontWeight: 'bold' }}>Section: </strong> {nombreSeccionSeleccionada}</span>
      <span style={{ marginRight: '40px' }}>
      <strong style={{ fontWeight: 'bold' }}>School year: </strong> {new Date().getFullYear()}-{new Date().getFullYear() + 1}</span>
    </div>


    <div style={{
  maxHeight: '700px', // Ajusta según necesidad
  overflowY: 'auto',
}}> 
    <CTable 
  className="table-bordered" 
  style={{width: '100%', border: '1px solid #000000', marginTop: '50px', fontSize: '0.75rem', lineHeight: '1',fontFamily: "'Times New Roman', Times, serif" }}
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
        key={`recup-${index}`}
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
        key={`parcial-${index}`} 
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
      <>
       {cuadroNotas.map((nota, index) => (
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
        {/* Celdas Parciales Regulares */}
        {nota.NotasParciales
          .filter(p => !p.Parcial.match(/recu/i))
          .map((parcial, i) => (
            <CTableDataCell key={`regular-${i}`} className="text-center bg-transparent">
              {parcial.Nota}
            </CTableDataCell>
          ))
        }
        
        {/* Celdas Recuperación */}
        {nota.NotasParciales
          .filter(p => p.Parcial.match(/recu/i))
          .map((recup, i) => (
            <CTableDataCell key={`recupnote-${i}`} className="text-center bg-transparent">
              {recup.Nota}
            </CTableDataCell>
          ))
        }
           {/* Columna Promedio Final */}
           <CTableDataCell className="text-center bg-transparent">
            {nota.PromedioFinal}
          </CTableDataCell>
        </CTableRow>
      ))}
      {/* Fila de promedios (solo una vez al final) */}
      <CTableRow style={{ backgroundColor: '#f0f0f0', fontWeight: 'bold' }}>
      <CTableDataCell className="text-center" style={{ fontSize: '0.8rem' }}>
        PROMEDIO
      </CTableDataCell>
      
      {cuadroNotas[0].NotasParciales
        .filter(p => !p.Parcial.match(/recu/i))
        .map((parcial, i) => {
          const sum = cuadroNotas.reduce((acc, nota) => {
            const notaParcial = nota.NotasParciales.find(np => np.Parcial === parcial.Parcial);
            return acc + (parseFloat(notaParcial?.Nota) || 0);
          }, 0);
          const avg = (sum / cuadroNotas.length).toFixed(2);
          return (
            <CTableDataCell key={`avg-${i}`} className="text-center">
              {avg}
            </CTableDataCell>
          );
        })}
          <CTableDataCell className="text-center"></CTableDataCell>
          <CTableDataCell className="text-center"></CTableDataCell>
          <CTableDataCell className="text-center"></CTableDataCell>
          <CTableDataCell className="text-center"></CTableDataCell>
    </CTableRow>
    </>
    ) : (
      <CTableRow>
        <CTableDataCell colSpan="5">No se encontraron resultados</CTableDataCell>
      </CTableRow>
    )}
  </CTableBody>
</CTable>

</div>
<div style={{ marginTop: '130px', marginLeft: '400px' }}>
  <div style={{ width: '300px', borderTop: '1px solid #000', textAlign: 'center' }}>
    <div style={{ marginTop: '5px', fontSize: '0.8rem', fontFamily: "'Times New Roman', Times, serif" }}>
      Director / Principal<br />Sello y firma
    </div>
  </div>
</div>

    </div>
  </>
)}
 </CContainer>
);
};
export default ListaCuadro;
