import React, { useEffect, useState } from 'react';
import { cilCheckCircle, cilArrowLeft,cilBrushAlt,cilDescription, cilSearch, cilSave, cilFile, cilSpreadsheet, cilPencil, cilInfo, cilPlus, cilPen } from '@coreui/icons';
import CIcon from '@coreui/icons-react';
import Swal from 'sweetalert2';

import {
  CContainer, CRow, CCol, CInputGroup, CCardBody, CFormSelect, CSpinner, CTable, CTableHead,CInputGroupText, CTableHeaderCell, CTableBody, CTableRow, CTableDataCell,
  CButton, CFormInput, CModal, CModalHeader, CModalBody, CModalFooter, CPopover, CPagination, CDropdownItem, CDropdown, CDropdownToggle, CDropdownMenu
} from '@coreui/react';

import logo from 'src/assets/brand/logo_saint_patrick.png'
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

import usePermission from '../../../../context/usePermission';
import AccessDenied from "../AccessDenied/AccessDenied"




const ListaActividadesAcaVistaPadre = () => {
  const { canSelect, canInsert, canUpdate,canDelete } = usePermission('ListaActividadesAcaVistaPadre');
  const [hijos, setHijos] = useState([]);
  const [hijoSeleccionado, setHijoSeleccionado] = useState(null);
  const [calificaciones, setCalificaciones] = useState([]);

  const [asignaturaSeleccionada, setAsignaturaSeleccionada] = useState(null);
  const [parcialSeleccionado, setParcialSeleccionado] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [vistaActual, setVistaActual] = useState('hijos');

  const token = localStorage.getItem('token');


  //para paginacion y busqueda de la vista hijos
const [recordsPerPage, setRecordsPerPage] = useState(5);
const [searchTerm, setSearchTerm] = useState('');
const [currentPage, setCurrentPage] = useState(1);

  // Estados para paginación, búsqueda, y selector dinámico ASIGNATURA
const [currentPageAsignatura, setCurrentPageAsignatura] = useState(1);
const [recordsPerPageAsignatura, setRecordsPerPageAsignatura] = useState(5);
const [searchTermAsignatura, setSearchTermAsignatura] = useState("");

  const [pageSizeAsignatura, setPageSizeAsignatura] = useState(5); // Tamaño de la página
  

  //para paginacion y busqueda de la vista actividades
const [currentPageActividad, setCurrentPageActividad] = useState(1); // Página actual
const [recordsPerPageActividad, setRecordsPerPageActividad] = useState(5); // Registros por página
const [searchTermActividad, setSearchTermActividad] = useState(""); // Término de búsqueda
const [actividades, setActividades] = useState([]); // Lista completa de actividades


useEffect(() => {
  if (hijoSeleccionado?.asignaturas?.[asignaturaSeleccionada]?.[parcialSeleccionado]) {
    setActividades(hijoSeleccionado.asignaturas[asignaturaSeleccionada][parcialSeleccionado]);
  }
}, [hijoSeleccionado, asignaturaSeleccionada, parcialSeleccionado]);



  useEffect(() => {
    const obtenerDatos = async () => {
      setCargando(true);
      try {
        const response = await fetch('http://74.50.68.87:4000/api/actividades/actividadesAcademicasPadre/codPersona', {
          headers: { Authorization: `Bearer ${token}` }
        });
  
        if (!response.ok) throw new Error('Error al obtener los datos');
        const data = await response.json();
  
        console.log("Datos obtenidos de la API:", data);
  
        // Agrupar datos por hijos
        const agrupado = data.calificaciones.reduce((acc, actividad) => {
          const { cod_hijo, nombre_hijo, Nombre_asignatura, Nombre_parcial, Nombre_actividad_academica } = actividad;
  
          // Inicializar datos del hijo si no existen
          if (!acc[cod_hijo]) {
            acc[cod_hijo] = {
              id: cod_hijo,
              nombre: nombre_hijo,
              asignaturas: {}
            };
          }
  
          // Inicializar datos de la asignatura si no existen
          if (!acc[cod_hijo].asignaturas[Nombre_asignatura]) {
            acc[cod_hijo].asignaturas[Nombre_asignatura] = {};
          }
  
          // Inicializar datos del parcial si no existen
          if (!acc[cod_hijo].asignaturas[Nombre_asignatura][Nombre_parcial]) {
            acc[cod_hijo].asignaturas[Nombre_asignatura][Nombre_parcial] = [];
          }
  
          // Añadir la actividad al parcial
          acc[cod_hijo].asignaturas[Nombre_asignatura][Nombre_parcial].push({
            nombreActividad: Nombre_actividad_academica,
            ...actividad
          });
  
          return acc;
        }, {});
  
        console.log("Datos agrupados por hijo:", agrupado);
  
        // Convertir el objeto agrupado a un array para renderizado
        setHijos(Object.values(agrupado));
      } catch (error) {
        console.error('Error al cargar los datos:', error);
      } finally {
        setCargando(false);
      }
    };
  
    obtenerDatos();
  }, [token]);
  

  const seleccionarHijo = (hijo) => {
    setHijoSeleccionado(hijo);
    setVistaActual('asignaturas');
  };

  const seleccionarAsignatura = (asignatura) => {
    setAsignaturaSeleccionada(asignatura);
    setVistaActual('parciales');
  };

  const seleccionarParcial = (parcial) => {
    setParcialSeleccionado(parcial);
    setVistaActual('actividades');
  };

  const volverAVistaHijos = () => {
    setHijoSeleccionado(null);
    setVistaActual('hijos');
  };

  const volverAVistaAsignaturas = () => {
    setAsignaturaSeleccionada(null);
    setVistaActual('asignaturas');
  };

  const volverAVistaParciales = () => {
    setParcialSeleccionado(null);
    setVistaActual('parciales');
  };


  // Organizar calificaciones por asignatura
  const calificacionesPorAsignatura = calificaciones.reduce((resultado, calificacion) => {
    const { Nombre_asignatura } = calificacion;
    if (!resultado[Nombre_asignatura]) {
      resultado[Nombre_asignatura] = [];
    }
    resultado[Nombre_asignatura].push(calificacion);
    return resultado;
  }, {});

  // Organizar actividades por parcial dentro de una asignatura
  const actividadesPorParcial = (asignatura) => {
    const actividades = calificacionesPorAsignatura[asignatura] || [];
    return actividades.reduce((resultado, actividad) => {
      const { Nombre_parcial } = actividad;
      if (!resultado[Nombre_parcial]) {
        resultado[Nombre_parcial] = [];
      }
      resultado[Nombre_parcial].push(actividad);
      return resultado;
    }, {});
  };

  const formatearFecha = (fechaISO) => {
    if (!fechaISO) return 'Sin fecha'; // Manejo para valores nulos o indefinidos
    return new Date(fechaISO).toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };
  const generarReporteNotasPDF = () => {
    const actividadesFiltradas = actividadesPorParcial(asignaturaSeleccionada)[parcialSeleccionado] || [];
    const doc = new jsPDF();
    const img = new Image();
    img.src = logo;

    const fechaReporte = new Date().toLocaleDateString();
    const Asignatura = asignaturaSeleccionada || "Sin asignatura seleccionada"; // Obtiene la asignatura seleccionada o un mensaje por defecto
    img.onload = () => {
      // Agregar logo
      doc.addImage(img, 'PNG', 10, 10, 30, 30);

      let yPosition = 20;

      // Título principal
      doc.setFontSize(18);
      doc.setTextColor(0, 102, 51);
      doc.text('SAINT PATRICK\'S ACADEMY', doc.internal.pageSize.width / 2, yPosition, { align: 'center' });

      yPosition += 12;

      // Subtítulo
      doc.setFontSize(16);
      doc.text('Reporte de actividades', doc.internal.pageSize.width / 2, yPosition, { align: 'center' });

      yPosition += 10;

      // Detalles
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`Asignatura: ${Asignatura} - ${parcialSeleccionado}`, doc.internal.pageSize.width / 2, yPosition, { align: 'center' });

      yPosition += 8;
      doc.text(`Fecha del reporte: ${fechaReporte}`, doc.internal.pageSize.width / 2, yPosition, { align: 'center' });

      yPosition += 8;

      // Información de contacto
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text('Teléfono: (504) 2234-8871', doc.internal.pageSize.width / 2, yPosition, { align: 'center' });
      yPosition += 4;
      doc.text('Correo: info@saintpatrickacademy.edu', doc.internal.pageSize.width / 2, yPosition, { align: 'center' });
      yPosition += 6;

      // Línea divisoria
      doc.setLineWidth(0.5);
      doc.setDrawColor(0, 102, 51);
      doc.line(10, yPosition, doc.internal.pageSize.width - 10, yPosition);

      yPosition += 4;

      // Configuración de tabla
      doc.autoTable({
        startY: yPosition,
        head: [['#', 'ACTIVIDAD', 'DESCRIPCIÓN', 'PONDERACION', 'INICIO' ,'FINALIZO', 'VALOR']],
        body: actividadesFiltradas.map((calificacion, index) => [
          index + 1,
          calificacion.Nombre_actividad_academica,
          calificacion.Descripcion,
          calificacion.Descripcion_ponderacion,
          calificacion.Fechayhora_Inicio,
          calificacion.Fechayhora_Fin,
          calificacion.Valor
        ]),
        headStyles: {
          fillColor: [0, 102, 51],
          textColor: [255, 255, 255],
          fontSize: 10,
        },
        styles: {
          fontSize: 10,
          cellPadding: 3,
        },
        alternateRowStyles: { fillColor: [240, 248, 255] },
      });

      // Abrir el PDF
      window.open(doc.output('bloburl'), '_blank');
    };

    img.onerror = () => {
      console.warn('No se pudo cargar el logo. El PDF se generará sin el logo.');
      window.open(doc.output('bloburl'), '_blank');
    };
  };




//PDF


const generarReporteActividadesPDF = () => {
  // Validar que haya datos en la tabla
  if (!hijoSeleccionado || !hijoSeleccionado.asignaturas || !hijoSeleccionado.asignaturas[asignaturaSeleccionada] || !hijoSeleccionado.asignaturas[asignaturaSeleccionada][parcialSeleccionado]) {
    swal.fire({
      icon: 'info',
      title: 'Tabla vacía',
      text: 'No hay datos disponibles para generar el reporte.',
      confirmButtonText: 'Aceptar',
    });
    return; // Salir de la función si no hay datos
  }

  const doc = new jsPDF();
  const img = new Image();
  img.src = logo; // Reemplaza con la URL o ruta de tu logo.

  img.onload = () => {
    // Agregar logo
    doc.addImage(img, 'PNG', 10, 10, 30, 30);

    let yPosition = 20; // Posición inicial en el eje Y

    // Título principal
    doc.setFontSize(18);
    doc.setTextColor(0, 102, 51); // Verde
    doc.text("SAINT PATRICK'S ACADEMY", doc.internal.pageSize.width / 2, yPosition, { align: 'center' });

    yPosition += 12; // Espaciado más amplio para resaltar el título

    // Subtítulo
    doc.setFontSize(16);
    doc.text('Reporte de Actividades Académicas', doc.internal.pageSize.width / 2, yPosition, { align: 'center' });

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

    yPosition += 6; // Espaciado para la tabla

    // Configuración para la tabla
    const pageHeight = doc.internal.pageSize.height; // Altura de la página
    let pageNumber = 1; // Página inicial

    // Agregar tabla con auto-paginación
    doc.autoTable({
      startY: yPosition,
      head: [['#', 'Nombre Actividad', 'Descripción', 'Fecha y Hora Inicio', 'Fecha y Hora Fin', 'Valor']],
      body: hijoSeleccionado.asignaturas[asignaturaSeleccionada][parcialSeleccionado].map((actividad, index) => [
        index + 1, // Índice de la actividad
        actividad.Nombre_actividad_academica || '',
        actividad.Descripcion || '',
        actividad.Fechayhora_Inicio
          ? new Date(actividad.Fechayhora_Inicio).toLocaleString('es-ES', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })
          : 'N/A',
        actividad.Fechayhora_Fin
          ? new Date(actividad.Fechayhora_Fin).toLocaleString('es-ES', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })
          : 'N/A',
        actividad.Valor || 0,
      ]),
      headStyles: {
        fillColor: [0, 102, 51], // Verde
        textColor: [255, 255, 255], // Blanco
        fontSize: 10,
      },
      styles: {
        fontSize: 10,
        cellPadding: 3,
        halign: 'center', // Centrado del texto en las celdas
      },
      columnStyles: {
        0: { cellWidth: 'auto' }, // Columna '#' se ajusta automáticamente
        1: { cellWidth: 'auto' }, // Columna 'Nombre Actividad' se ajusta automáticamente
        2: { cellWidth: 'auto' }, // Columna 'Descripción' se ajusta automáticamente
        3: { cellWidth: 'auto' }, // Columna 'Fecha y Hora Inicio' se ajusta automáticamente
        4: { cellWidth: 'auto' }, // Columna 'Fecha y Hora Fin' se ajusta automáticamente
        5: { cellWidth: 'auto' }, // Columna 'Valor' se ajusta automáticamente
      },
      alternateRowStyles: { fillColor: [240, 248, 255] }, // Filas alternas con color de fondo suave
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

//EXCEL ACTIVIDADES
const generarReporteExcel = () => {
  // Validar que haya datos en la tabla
  if (!hijoSeleccionado || !hijoSeleccionado.asignaturas || !hijoSeleccionado.asignaturas[asignaturaSeleccionada] || !hijoSeleccionado.asignaturas[asignaturaSeleccionada][parcialSeleccionado]) {
    swal.fire({
      icon: 'info',
      title: 'Tabla vacía',
      text: 'No hay datos disponibles para generar el reporte Excel.',
      confirmButtonText: 'Aceptar',
    });
    return; // Salir de la función si no hay datos
  }

  // Encabezados del reporte
  const encabezados = [
    ["Saint Patrick Academy"],
    ["Reporte de Actividades Académicas"],
    [], // Espacio en blanco
    ["#", "Nombre Actividad", "Descripción", "Fecha y Hora Inicio", "Fecha y Hora Fin", "Valor"]
  ];

  // Crear filas con las actividades
  const filas = hijoSeleccionado.asignaturas[asignaturaSeleccionada][parcialSeleccionado].map((actividad, index) => [
    index + 1, // Índice basado en la posición original
    actividad.Nombre_actividad_academica || "", // Nombre de la actividad
    actividad.Descripcion || "", // Descripción
    actividad.Fechayhora_Inicio
      ? new Date(actividad.Fechayhora_Inicio).toLocaleString('es-ES', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : 'N/A', // Fecha y hora de inicio
    actividad.Fechayhora_Fin
      ? new Date(actividad.Fechayhora_Fin).toLocaleString('es-ES', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : 'N/A', // Fecha y hora de fin
    actividad.Valor || 0, // Valor de la actividad
  ]);

  // Combinar encabezados y filas
  const datos = [...encabezados, ...filas];

  // Crear la hoja de trabajo
  const hojaDeTrabajo = XLSX.utils.aoa_to_sheet(datos);

  // Estilos personalizados para los encabezados
  const rangoEncabezado = XLSX.utils.decode_range(hojaDeTrabajo['!ref']);
  for (let row = 0; row <= 3; row++) { // Aplicamos estilo a las primeras 3 filas (encabezado)
    for (let col = rangoEncabezado.s.c; col <= rangoEncabezado.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
      if (hojaDeTrabajo[cellAddress]) {
        hojaDeTrabajo[cellAddress].s = {
          font: { bold: true, sz: 14, color: { rgb: "FFFFFF" } },
          fill: { fgColor: { rgb: "15401D" } }, // Color verde oscuro
          alignment: { horizontal: "center" }
        };
      }
    }
  }

  // Ajustar el ancho de las columnas automáticamente
  const ajusteColumnas = [
    { wpx: 50 },  // Ajustar el ancho de la columna del índice
    { wpx: 200 }, // Ajustar el ancho de la columna del nombre de la actividad
    { wpx: 300 }, // Ajustar el ancho de la columna de descripción
    { wpx: 150 }, // Ajustar el ancho de la columna de fecha y hora de inicio
    { wpx: 150 }, // Ajustar el ancho de la columna de fecha y hora de fin
    { wpx: 80 },  // Ajustar el ancho de la columna de valor
  ];

  hojaDeTrabajo['!cols'] = ajusteColumnas;

  // Crear el libro de trabajo
  const libroDeTrabajo = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(libroDeTrabajo, hojaDeTrabajo, "Reporte de Actividades");

  // Nombre del archivo Excel
  const nombreArchivo = `Reporte_Actividades.xlsx`;

  // Guardar el archivo Excel
  XLSX.writeFile(libroDeTrabajo, nombreArchivo);
};

  const generarReporteParcialesPDF = () => {
    const parciales = Object.keys(actividadesPorParcial(asignaturaSeleccionada)); // Obtener nombres de parciales
    const doc = new jsPDF();
    const img = new Image();
    img.src = logo; // Logo de la institución

    const fechaReporte = new Date().toLocaleDateString();
    const Asignatura = asignaturaSeleccionada || "Sin asignatura seleccionada";

    img.onload = () => {
      // Agregar logo
      doc.addImage(img, 'PNG', 10, 10, 30, 30);

      let yPosition = 20;

      // Título principal
      doc.setFontSize(18);
      doc.setTextColor(0, 102, 51);
      doc.text('SAINT PATRICK\'S ACADEMY', doc.internal.pageSize.width / 2, yPosition, { align: 'center' });

      yPosition += 12;

      // Subtítulo
      doc.setFontSize(16);
      doc.text('Reporte de Parciales', doc.internal.pageSize.width / 2, yPosition, { align: 'center' });

      yPosition += 10;

      // Detalles
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`Asignatura: ${Asignatura}`, doc.internal.pageSize.width / 2, yPosition, { align: 'center' });

      yPosition += 8;
      doc.text(`Fecha del reporte: ${fechaReporte}`, doc.internal.pageSize.width / 2, yPosition, { align: 'center' });

      yPosition += 8;

      // Información de contacto
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text('Teléfono: (504) 2234-8871', doc.internal.pageSize.width / 2, yPosition, { align: 'center' });
      yPosition += 4;
      doc.text('Correo: info@saintpatrickacademy.edu', doc.internal.pageSize.width / 2, yPosition, { align: 'center' });
      yPosition += 6;

      // Línea divisoria
      doc.setLineWidth(0.5);
      doc.setDrawColor(0, 102, 51);
      doc.line(10, yPosition, doc.internal.pageSize.width - 10, yPosition);

      yPosition += 4;

      // Configuración de tabla
      doc.autoTable({
        startY: yPosition,
        head: [['#', 'Parcial']],
        body: parciales.map((parcial, index) => [
          index + 1,
          parcial
        ]),
        headStyles: {
          fillColor: [0, 102, 51],
          textColor: [255, 255, 255],
          fontSize: 10,
        },
        styles: {
          fontSize: 10,
          cellPadding: 3,
        },
        alternateRowStyles: { fillColor: [240, 248, 255] },
      });

      // Abrir el PDF
      window.open(doc.output('bloburl'), '_blank');
    };

    img.onerror = () => {
      console.warn('No se pudo cargar el logo. El PDF se generará sin el logo.');
      window.open(doc.output('bloburl'), '_blank');
    };
  };
  const generarReporteAsignaturasPDF = () => {
    const asignaturas = Object.keys(calificacionesPorAsignatura).map((asignatura, index) => ({
      numero: index + 1,
      nombre: asignatura,
      descripcion: calificacionesPorAsignatura[asignatura][0]?.Descripcion_asignatura || "N/A",
    }));

    const doc = new jsPDF();
    const img = new Image();
    img.src = logo; // Ruta del logo

    const fechaReporte = new Date().toLocaleDateString();

    img.onload = () => {
      // Agregar logo
      doc.addImage(img, 'PNG', 10, 10, 30, 30);

      let yPosition = 20;

      // Título principal
      doc.setFontSize(18);
      doc.setTextColor(0, 102, 51);
      doc.text('SAINT PATRICK\'S ACADEMY', doc.internal.pageSize.width / 2, yPosition, { align: 'center' });

      yPosition += 12;

      // Subtítulo
      doc.setFontSize(16);
      doc.text('Reporte de Asignaturas', doc.internal.pageSize.width / 2, yPosition, { align: 'center' });

      yPosition += 10;

      // Detalles
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`Fecha del reporte: ${fechaReporte}`, doc.internal.pageSize.width / 2, yPosition, { align: 'center' });

      yPosition += 8;

      // Información de contacto
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text('Teléfono: (504) 2234-8871', doc.internal.pageSize.width / 2, yPosition, { align: 'center' });
      yPosition += 4;
      doc.text('Correo: info@saintpatrickacademy.edu', doc.internal.pageSize.width / 2, yPosition, { align: 'center' });
      yPosition += 6;

      // Línea divisoria
      doc.setLineWidth(0.5);
      doc.setDrawColor(0, 102, 51);
      doc.line(10, yPosition, doc.internal.pageSize.width - 10, yPosition);

      yPosition += 4;

      // Configuración de tabla
      doc.autoTable({
        startY: yPosition,
        head: [['#', 'Asignatura', 'Descripción']],
        body: asignaturas.map((asignatura) => [
          asignatura.numero,
          asignatura.nombre,
          asignatura.descripcion,
        ]),
        headStyles: {
          fillColor: [0, 102, 51],
          textColor: [255, 255, 255],
          fontSize: 10,
        },
        styles: {
          fontSize: 10,
          cellPadding: 3,
        },
        alternateRowStyles: { fillColor: [240, 248, 255] },
      });

      // Abrir el PDF
      window.open(doc.output('bloburl'), '_blank');
    };

    img.onerror = () => {
      console.warn('No se pudo cargar el logo. El PDF se generará sin el logo.');
      window.open(doc.output('bloburl'), '_blank');
    };
  };

  const generarReporteAsignaturasExcel = () => {
    // Extraer datos dinámicos de calificacionesPorAsignatura
    const asignaturas = Object.keys(calificacionesPorAsignatura).map((asignatura, index) => [
      index + 1, // Número
      asignatura, // Nombre de la asignatura
      calificacionesPorAsignatura[asignatura][0]?.Descripcion_asignatura || "N/A", // Descripción
    ]);

    // Encabezados del reporte
    const encabezados = [
      ["Saint Patrick Academy"], // Título principal
      ["Reporte de Asignaturas"], // Subtítulo
      [`Fecha de generación: ${new Date().toLocaleDateString()}`], // Fecha de generación
      [], // Espacio en blanco
      ["#", "ASIGNATURA", "DESCRIPCION"], // Encabezados de la tabla
    ];

    // Combinar encabezados y datos
    const datos = [...encabezados, ...asignaturas];

    // Crear una hoja de trabajo (worksheet)
    const hojaDeTrabajo = XLSX.utils.aoa_to_sheet(datos);

    // Ajustar ancho de las columnas
    hojaDeTrabajo['!cols'] = [
      { wpx: 50 }, // Columna #
      { wpx: 250 }, // Columna Asignatura
      { wpx: 300 }, // Columna Descripción
    ];


    // Crear el libro de trabajo
    const libroDeTrabajo = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libroDeTrabajo, hojaDeTrabajo, "Reporte de asignaturas");

    // Guardar el archivo Excel con un nombre personalizado
    const nombreArchivo = `${new Date().toISOString().split('T')[0]}.xlsx`;

    XLSX.writeFile(libroDeTrabajo, nombreArchivo);
  };


  const generarReporteNotasExcel = () => {
    if (!parcialSeleccionado || !asignaturaSeleccionada) {
      Swal.fire('Error', 'Por favor selecciona una asignatura y un parcial antes de generar el reporte.', 'error');
      return;
    }

    const actividadesFiltradas = actividadesPorParcial(asignaturaSeleccionada)[parcialSeleccionado] || [];

    const encabezados = [
      ["Saint Patrick Academy"],
      ["Reporte de Actividades"],
      [`Asignatura: ${asignaturaSeleccionada}`, `Parcial: ${parcialSeleccionado}`, `Fecha de generación: ${new Date().toLocaleDateString()}`],
      [], // Espacio en blanco
      ["#", "ACTIVIDAD", "DESCRIPCION", "PONDERACION", "INICIO", "FINALIZO", "VALOR"]
    ];

    // Crear filas con las actividades filtradas
    const filas = actividadesFiltradas.map((actividad, index) => [
      index + 1,
      actividad.Nombre_actividad_academica,
      actividad.Descripcion,
      actividad.Descripcion_ponderacion,
      actividad.Fechayhora_Inicio,
      actividad.Fechayhora_Fin,
      actividad.Valor
    ]);

    // Combinar encabezados y filas
    const datos = [...encabezados, ...filas];

    // Crear una hoja de trabajo
    const hojaDeTrabajo = XLSX.utils.aoa_to_sheet(datos);

    // Estilos personalizados para encabezados
    const rangoEncabezado = XLSX.utils.decode_range(hojaDeTrabajo['!ref']);
    for (let row = 0; row <= 4; row++) {
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
      { wpx: 50 },  // Índice
      { wpx: 200 }, // Actividad
      { wpx: 250 }, // Descripción
      { wpx: 100 }, // Nota
      { wpx: 200 }  // Observación
    ];

    hojaDeTrabajo['!cols'] = ajusteColumnas;

    // Crear el libro de trabajo
    const libroDeTrabajo = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libroDeTrabajo, hojaDeTrabajo, "Reporte de Actividades");

    // Guardar el archivo Excel con un nombre personalizado
    const nombreArchivo = `${asignaturaSeleccionada}_${parcialSeleccionado}_${new Date().toISOString().split('T')[0]}.xlsx`;

    XLSX.writeFile(libroDeTrabajo, nombreArchivo);
  };

  const generarReporteParcialesExcel = () => {
    if (!asignaturaSeleccionada) {
      Swal.fire('Error', 'Por favor selecciona una asignatura antes de generar el reporte.', 'error');
      return;
    }

    const parciales = Object.keys(actividadesPorParcial(asignaturaSeleccionada)); // Obtener nombres de parciales

    // Encabezados del reporte
    const encabezados = [
      ["Saint Patrick Academy"],
      ["Reporte de Parciales"],
      [`Asignatura: ${asignaturaSeleccionada}`, `Fecha de generación: ${new Date().toLocaleDateString()}`],
      [], // Espacio en blanco
      ["#", "Parcial"]
    ];

    // Filas de parciales
    const filas = parciales.map((parcial, index) => [
      index + 1,
      parcial
    ]);

    // Combinar encabezados y filas
    const datos = [...encabezados, ...filas];

    // Crear hoja de trabajo
    const hojaDeTrabajo = XLSX.utils.aoa_to_sheet(datos);

    // Ajustar el ancho de columnas automáticamente
    const ajusteColumnas = [
      { wpx: 50 },  // #
      { wpx: 200 }, // Parcial
      { wpx: 150 }, // Acción
    ];

    hojaDeTrabajo['!cols'] = ajusteColumnas;

    // Crear el libro de trabajo
    const libroDeTrabajo = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libroDeTrabajo, hojaDeTrabajo, "Reporte de Parciales");

    // Guardar archivo Excel
    const nombreArchivo = `${asignaturaSeleccionada}_Parciales_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(libroDeTrabajo, nombreArchivo);
  };




  // Define el orden lógico de los parciales
  const ordenParciales = {
    'PRIMER PARCIAL': 1,
    'SEGUNDO PARCIAL': 2,
    'TERCERO PARCIAL': 3,
    'CUARTO PARCIAL': 4
  };

  const ordenarParciales = (parciales) => {
    return Object.entries(parciales).sort(([a], [b]) => (ordenParciales[a] || 99) - (ordenParciales[b] || 99));
  };


  const calcularTotalPorParcial = (actividades) => {
    return actividades.reduce((total, actividad) => {
      return total + (actividad.Valor ? parseFloat(actividad.Valor) : 0);
    }, 0);
  };





  const calcularTotalValor = () => {
    const actividades =
      hijoSeleccionado?.asignaturas[asignaturaSeleccionada]?.[parcialSeleccionado] || [];
    return actividades
      .reduce((total, actividad) => total + parseFloat(actividad?.Valor || 0), 0)
      .toFixed(2);
  };
  
  


  if (!canSelect) {
    return <AccessDenied />;
  }




//_-------------// Manejador de búsqueda de la tabla hijo //--------------------------------------------
const handleSearch = (event) => {
  const input = event.target.value.toUpperCase();
  const regex = /^[A-ZÑ\s]*$/; // Solo permite letras, espacios y la letra "Ñ"

  if (!regex.test(input)) {
    Swal.fire({
      icon: 'warning',
      title: 'Caracteres no permitidos',
      text: 'Solo se permiten letras y espacios.',
    });
    return;
  }

  setSearchTerm(input);
  setCurrentPage(1); // Reiniciar a la primera página al buscar
};

// Filtrado de registros
const filteredHijos = hijos.filter((hijo) =>
  hijo.nombre.toLowerCase().includes(searchTerm.toLowerCase())
);

// Lógica de paginación
const indexOfLastRecord = currentPage * recordsPerPage;
const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
const currentRecords = filteredHijos.slice(indexOfFirstRecord, indexOfLastRecord);

// Cambiar página
const paginate = (pageNumber) => {
  if (pageNumber > 0 && pageNumber <= Math.ceil(filteredHijos.length / recordsPerPage)) {
    setCurrentPage(pageNumber);
  }
};

// Total de páginas
const totalPages = Math.ceil(filteredHijos.length / recordsPerPage);


//_-------------// Manejador de búsqueda de la tabla asignatura //--------------------------------------------

const handleSearch2 = (event) => {
  const input = event.target.value.toUpperCase(); // Convierte a mayúsculas
  const regex = /^[A-ZÑ\s]*$/; // Solo permite letras, espacios y la letra "Ñ"

  // Si el valor no es válido, muestra una alerta y no actualiza el término de búsqueda
  if (!regex.test(input)) {
    Swal.fire({
      icon: "warning",
      title: "Caracteres no permitidos",
      text: "Solo se permiten letras y espacios.",
    });
    return;
  }

  setSearchTermAsignatura(input); // Actualiza el término de búsqueda
  setCurrentPageAsignatura(1); // Reinicia a la primera página al buscar
};

 








//-------------------// Manejador de búsqueda de la tabla Actividades academicas //--------------------------------

const handleSearch3 = (event) => {
  const input = event.target.value.toUpperCase(); // Convierte a mayúsculas
  const regex = /^[A-ZÑ\s]*$/; // Solo permite letras, espacios y la letra "Ñ"

  // Si el valor no es válido, muestra una alerta y no actualiza el término de búsqueda
  if (!regex.test(input)) {
    Swal.fire({
      icon: 'warning',
      title: 'Caracteres no permitidos',
      text: 'Solo se permiten letras y espacios.',
    });
    return;
  }

  setSearchTermActividad(input); // Actualiza el término de búsqueda
  setCurrentPageActividad(1); // Reinicia a la primera página al buscar
};
const filteredActividades = actividades.filter((actividad) =>
  actividad.Nombre_actividad_academica.toUpperCase().includes(searchTermActividad)
);


const paginateActividad = (pageNumber) => {
  if (pageNumber > 0 && pageNumber <= Math.ceil(filteredActividades.length / recordsPerPageActividad)) {
    setCurrentPageActividad(pageNumber);
  }
};

// Cambiar registros por página
const handleRecordsPerPageChange = (e) => {
  setRecordsPerPageActividad(Number(e.target.value));
  setCurrentPageActividad(1); // Reiniciar a la primera página
};

// Cálculo dinámico de la paginación
const totalPagesActividad = Math.ceil(filteredActividades.length / recordsPerPageActividad);
const indexOfLastRecordActividad = currentPageActividad * recordsPerPageActividad;
const indexOfFirstRecordActividad = indexOfLastRecordActividad - recordsPerPageActividad;
const currentRecordsActividad = filteredActividades.slice(indexOfFirstRecordActividad, indexOfLastRecordActividad);



  
  return (
    <CContainer className="my-5">
      <style>
        {`
          h2, h4 {
            font-family: 'Roboto', sans-serif;
            font-weight: bold;
          }
          .btn-volver {
            background-color: #007bff;
            color: white;
            border-radius: 5px;
            transition: all 0.3s ease;
          }
          .btn-volver:hover {
            background-color: #0056b3;
            transform: scale(1.05);
          }
          .tabla-parcial {
            margin-bottom: 2rem;
            border-radius: 10px;
            overflow: hidden;
          }
          table th, table td {
            text-align: center;
            vertical-align: middle;
          }
          table th {
            background-color: #f1f1f1;
          }
        `}
      </style>
      <CRow className="justify-content-center">
        <CCol lg={12}>
          {cargando ? (
            <div className="d-flex justify-content-center align-items-center py-5">
              <CSpinner color="primary" />
            </div>
          ) : vistaActual === 'hijos' ? (
            <>
              {/* Vista de Hijos */}
              <CRow className="align-items-center mb-5">
            <CCol xs="12" className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
              <div className="flex-grow-1 text-center">
              <h3 
               className="text-center fw-semibold pb-2 mb-0"
               style={{ display: 'inline-block', borderBottom: '2px solid #4CAF50' }}
             >
              Lista de Hijos
              </h3>
              </div>
            </CCol>
          </CRow>
           {/* Filtros y búsqueda */}
           <CRow className="align-items-center mt-4 mb-2">
            {/* Barra de búsqueda */}
            <CCol xs="12" md="8" className="d-flex flex-wrap align-items-center">
              <CInputGroup className="me-3" style={{ maxWidth: '350px' }}>
                <CInputGroupText>
                  <CIcon icon={cilSearch} size="sm" />
                </CInputGroupText>
                <CFormInput
                  style={{ width: '80px', height: '35px', display: 'inline-block', fontSize: '0.8rem' }}
                  placeholder="Buscar hijo por nombre..."
                  value={searchTerm}
                  onChange={handleSearch}
                />
                <CButton
                  style={{
                    border: '1px solid #ccc',
                    transition: 'all 0.1s ease-in-out', // Duración de la transición
                    backgroundColor: '#F3F4F7', // Color por defecto
                    color: '#343a40', // Color de texto por defecto
                    height: '35px'
                  }}
                  onClick={() => {
                    setSearchTerm('');
                    setCurrentPage(1);
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
           {/* Selector dinámico */}
    <CCol xs="12" md="4" className="text-md-end mt-2 mt-md-0">
      <CInputGroup style={{ width: 'auto', display: 'inline-block' }}>
        <div className="d-inline-flex align-items-center">
          <span style={{ fontSize: '0.85rem' }}>Mostrar&nbsp;</span>
          <CFormSelect
            style={{
              width: '80px',
              height: '35px',
              display: 'inline-block',
              textAlign: 'center',
            }}
            onChange={(e) => {
              setRecordsPerPage(Number(e.target.value)); // Cambiar registros por página
              setCurrentPage(1); // Reiniciar a la primera página
            }}
            value={recordsPerPage}
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
          
              
    <div className="table-responsive" style={{ maxHeight: '400px', margin: '0 auto', overflowX: 'auto', overflowY: 'auto', boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)', }}>
      <CTable striped bordered hover responsive>
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell>#</CTableHeaderCell>
            <CTableHeaderCell>Nombre del Hijo</CTableHeaderCell>
            <CTableHeaderCell>Acción</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
        {currentRecords.length > 0 ? (
        currentRecords.map((hijo, index) => (
    <CTableRow key={hijo.id}>
      <CTableDataCell>{indexOfFirstRecord + index + 1}</CTableDataCell>
      <CTableDataCell>{hijo.nombre}</CTableDataCell>
      <CTableDataCell>
        <CButton
          size="sm"
          style={{
            backgroundColor: '#F0F4F3',
            color: '#153E21',
            border: '1px solid #A2B8A9',
            borderRadius: '6px',
            padding: '5px 12px',
            boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
          }}
          onMouseEnter={(e) => (e.target.style.backgroundColor = '#dce3dc')}
          onMouseLeave={(e) => (e.target.style.backgroundColor = '#F0F4F3')}
          onClick={() => seleccionarHijo(hijo)}
        >
                  Ver Asignaturas
                </CButton>
              </CTableDataCell>
            </CTableRow>
          ))
        ) : (
          <CTableRow>
          <CTableDataCell colSpan="3" className="text-center">
            No se encontraron registros
          </CTableDataCell>
        </CTableRow>
      )}
        </CTableBody>
      </CTable>
    </div>
      {/* Paginación */}
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      marginTop: "16px",
    }}
  >
    <CPagination aria-label="Page navigation" style={{ display: "flex", gap: "10px" }}>
      <CButton
        style={{ backgroundColor: "#6f8173", color: "#D9EAD3" }}
        disabled={currentPage === 1}
        onClick={() => paginate(currentPage - 1)}
      >
        Anterior
      </CButton>
      <CButton
        style={{ marginLeft: "10px", backgroundColor: "#6f8173", color: "#D9EAD3" }}
        disabled={currentPage === totalPages}
        onClick={() => paginate(currentPage + 1)}
      >
        Siguiente
      </CButton>
    </CPagination>
    <span style={{ marginLeft: "10px" }}>
      Página {currentPage} de {totalPages}
    </span>
  </div>
  </>




          ) : vistaActual === 'asignaturas' ? (
            <>
              {/* Vista de Asignaturas */}
              <CRow className="align-items-center mb-5">
              <CCol xs="12" className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
              <CButton className="btn btn-sm d-flex align-items-center gap-1 rounded shadow"
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#4B4B4B")} onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#656565")}
                style={{ backgroundColor: "#656565", color: "#FFFFFF", padding: "6px 12px", fontSize: "0.9rem", transition: "background-color 0.2s ease, box-shadow 0.3s ease", boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)", }}
              onClick={volverAVistaHijos}>
              <CIcon icon={cilArrowLeft} />Regresar a Hijos
              </CButton>

              <div className="d-flex justify-content-center align-items-center flex-grow-1">
              <h3 className="text-center fw-semibold pb-2 mb-0" style={{ display: "inline-block", borderBottom: "2px solid #4CAF50", margin: "0 auto", fontSize: "1.5rem" }}>Asignaturas de {hijoSeleccionado.nombre}</h3>
              </div>
              </CCol>
              </CRow>
              {/* Filtros y búsqueda */}
           <CRow className="align-items-center mt-4 mb-2">
            {/* Barra de búsqueda */}
            <CCol xs="12" md="8" className="d-flex flex-wrap align-items-center">
              <CInputGroup className="me-3" style={{ maxWidth: '350px' }}>
                <CInputGroupText>
                  <CIcon icon={cilSearch} size="sm" />
                </CInputGroupText>
                <CFormInput
                  style={{ width: '80px', height: '35px', display: 'inline-block', fontSize: '0.8rem' }}
                  placeholder="Buscar Asignatura..."
                  value={searchTermAsignatura}
                  onChange={handleSearch2}
                />
                <CButton
                  style={{
                    border: '1px solid #ccc',
                    transition: 'all 0.1s ease-in-out', // Duración de la transición
                    backgroundColor: '#F3F4F7', // Color por defecto
                    color: '#343a40', // Color de texto por defecto
                    height: '35px'
                  }}
                  onClick={() => {
                    
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



          </CRow>
          

              <div className="table-responsive" style={{maxHeight: '400px', overflowX: 'auto', overflowY: 'auto', boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)',}}>
                <CTable striped bordered hover responsive>
                  <CTableHead className="sticky-top bg-light text-center" style={{ fontSize: '0.8rem' }}>
                    <CTableRow>
                      <CTableHeaderCell>#</CTableHeaderCell>
                      <CTableHeaderCell>Asignatura</CTableHeaderCell>
                      <CTableHeaderCell>Acción</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {Object.keys(hijoSeleccionado.asignaturas).map((asignatura, index) => (
                      <CTableRow key={index}>
                        <CTableDataCell>{index + 1}</CTableDataCell>
                        <CTableDataCell>{asignatura}</CTableDataCell>
                        <CTableDataCell>
                          <CButton
                          size="sm"
                          style={{
                            backgroundColor: '#F0F4F3',
                            color: '#153E21',
                            border: '1px solid #A2B8A9',
                            borderRadius: '6px',
                            padding: '5px 12px',
                            boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
                          }}
                          onMouseEnter={(e) => (e.target.style.backgroundColor = '#dce3dc')}
                          onMouseLeave={(e) => (e.target.style.backgroundColor = '#F0F4F3')}
                            onClick={() => seleccionarAsignatura(asignatura)}
                          >
                            Ver Parciales
                          </CButton>
                        </CTableDataCell>
                      </CTableRow>
                    ))}
                  </CTableBody>
                </CTable>
              </div>
            </>
          ) : vistaActual === 'parciales' ? (
            <>
              {/* Vista de Parciales */}
              <CRow className="align-items-center mb-5">
              <CCol xs="12" className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
              <CButton className="btn btn-sm d-flex align-items-center gap-1 rounded shadow"
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#4B4B4B")} onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#656565")}
                style={{ backgroundColor: "#656565", color: "#FFFFFF", padding: "6px 12px", fontSize: "0.9rem", transition: "background-color 0.2s ease, box-shadow 0.3s ease", boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)", }}
              onClick={volverAVistaAsignaturas}>
              <CIcon icon={cilArrowLeft} />Volver a Asignaturas
              </CButton>
              <div className="d-flex justify-content-center align-items-center flex-grow-1">
              <h3 className="text-center fw-semibold pb-2 mb-0" style={{ display: "inline-block", borderBottom: "2px solid #4CAF50", margin: "0 auto", fontSize: "1.5rem" }}>Parciales de {asignaturaSeleccionada}</h3>
              </div>
              </CCol>
              </CRow>


              <div className="table-responsive" style={{maxHeight: '400px', overflowX: 'auto', overflowY: 'auto', boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)',}}>
                <CTable striped bordered hover responsive>
                  <CTableHead className="sticky-top bg-light text-center" style={{ fontSize: '0.8rem' }}>
                    <CTableRow>
                      <CTableHeaderCell>#</CTableHeaderCell>
                      <CTableHeaderCell>Parcial</CTableHeaderCell>
                      <CTableHeaderCell>Acción</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {Object.keys(hijoSeleccionado.asignaturas[asignaturaSeleccionada]).map((parcial, index) => (
                      <CTableRow key={index}>
                        <CTableDataCell>{index + 1}</CTableDataCell>
                        <CTableDataCell>{parcial}</CTableDataCell>
                        <CTableDataCell>
                          <CButton
                          size="sm"
                          style={{
                            backgroundColor: '#F0F4F3',
                            color: '#153E21',
                            border: '1px solid #A2B8A9',
                            borderRadius: '6px',
                            padding: '5px 12px',
                            boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
                          }}
                          onMouseEnter={(e) => (e.target.style.backgroundColor = '#dce3dc')}
                          onMouseLeave={(e) => (e.target.style.backgroundColor = '#F0F4F3')}
                            onClick={() => seleccionarParcial(parcial)}
                          >
                            Ver Actividades
                          </CButton>
                        </CTableDataCell>
                      </CTableRow>
                    ))}
                  </CTableBody>
                </CTable>
              </div>
            </>
          ) : (
            <>
              {/* Vista de Actividades */}
              <CRow className="align-items-center mb-5">
            <CCol xs="12" className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">            
           <CButton className="btn btn-sm d-flex align-items-center gap-1 rounded shadow"
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#4B4B4B")} onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#656565")}
                style={{ backgroundColor: "#656565", color: "#FFFFFF", padding: "6px 12px", fontSize: "0.9rem", transition: "background-color 0.2s ease, box-shadow 0.3s ease", boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)", }}
                onClick={volverAVistaParciales}>
                 Volver a Parciales
          </CButton>
          <div className="d-flex justify-content-center align-items-center flex-grow-1">
         <h3 className="text-center fw-semibold pb-2 mb-0" style={{ display: "inline-block", borderBottom: "2px solid #4CAF50", margin: "0 auto", fontSize: "1.5rem" }}>Actividades del {parcialSeleccionado} - {asignaturaSeleccionada}</h3>
         </div>
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
      zIndex: 1050, // Asegura que el menú esté por encima de otros elementos
      backgroundColor: '#fff',
      boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.2)',
      borderRadius: '4px',
      overflow: 'hidden',
    }}
  >
    {/* Opción para PDF */}
    <CDropdownItem
      onClick={generarReporteActividadesPDF} // Función para generar PDF
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

    {/* Opción para Excel */}
    <CDropdownItem
        onClick={generarReporteExcel} // Función para generar Excel
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
      <CIcon icon={cilSpreadsheet} size="sm" /> Descargar Excel
    </CDropdownItem>
  </CDropdownMenu>
</CDropdown>
         </CCol>
          </CRow>
          {/* Filtros y búsqueda */}
          <CRow className="align-items-center mt-4 mb-2">
          <CCol xs="12" md="8" className="d-flex flex-wrap align-items-center">
  <CInputGroup className="me-3" style={{ maxWidth: '350px' }}>
    <CInputGroupText>
      <CIcon icon={cilSearch} size="sm" />
    </CInputGroupText>
    <CFormInput
      style={{ width: '80px', height: '35px', display: 'inline-block', fontSize: '0.8rem' }}
      placeholder="Buscar por actividad..."
      value={searchTermActividad} // Vincula el input al estado
      onChange={handleSearch3} // Llama a handleSearch3
    />
    <CButton
      style={{
        border: '1px solid #ccc',
        transition: 'all 0.1s ease-in-out',
        backgroundColor: '#F3F4F7',
        color: '#343a40',
        height: '35px'
      }}
      onClick={() => {
        setSearchTermActividad(''); // Limpiar el filtro
        setCurrentPage(1);
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = '#E0E0E0';
        e.currentTarget.style.color = 'black';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = '#F3F4F7';
        e.currentTarget.style.color = '#343a40';
      }}
    >
      <CIcon icon={cilBrushAlt} /> Limpiar
    </CButton>
  </CInputGroup>
</CCol>

    {/* Selector dinámico */}
    <CCol xs="12" md="4" className="text-md-end mt-2 mt-md-0">
      <CInputGroup style={{ width: "auto", display: "inline-block" }}>
        <div className="d-inline-flex align-items-center">
          <span style={{ fontSize: "0.85rem" }}>Mostrar&nbsp;</span>
          <CFormSelect
            style={{
              width: "80px",
              height: "35px",
              display: "inline-block",
              textAlign: "center",
            }}
            onChange={handleRecordsPerPageChange}
            value={recordsPerPageActividad}
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="20">20</option>
          </CFormSelect>
          <span style={{ fontSize: "0.85rem" }}>&nbsp;registros</span>
        </div>
      </CInputGroup>
    </CCol>
</CRow>


  <div className="table-responsive" style={{maxHeight: '400px', overflowX: 'auto', overflowY: 'auto', boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)', }}>
    <CTable striped bordered hover responsive>
      <CTableHead  className="sticky-top bg-light text-center" style={{ fontSize: '0.8rem' }}>
        <CTableRow>
          <CTableHeaderCell>#</CTableHeaderCell>
          <CTableHeaderCell>Actividad</CTableHeaderCell>
          <CTableHeaderCell>Descripción</CTableHeaderCell>
          <CTableHeaderCell>Fecha Inicio</CTableHeaderCell>
          <CTableHeaderCell>Fecha Fin</CTableHeaderCell>
          <CTableHeaderCell>Valor</CTableHeaderCell> {/* Nueva columna para el valor */}
        </CTableRow>
      </CTableHead>
      <CTableBody>
      {currentRecordsActividad.map((actividad, index) => (
            <CTableRow key={index}>
              <CTableDataCell>{index + 1 + indexOfFirstRecordActividad}</CTableDataCell>
              <CTableDataCell>{actividad.Nombre_actividad_academica}</CTableDataCell>
              <CTableDataCell>{actividad.Descripcion}</CTableDataCell>
              <CTableDataCell>{formatearFecha(actividad.Fechayhora_Inicio)}</CTableDataCell>
              <CTableDataCell>{formatearFecha(actividad.Fechayhora_Fin)}</CTableDataCell>
              <CTableDataCell>{actividad.Valor}</CTableDataCell> {/* Mostrar el valor */}
            </CTableRow>
          )
        )}
         {/* Fila para mostrar el total */}
  <CTableRow>
    <CTableDataCell colSpan="5" className="text-end fw-bold">
      Total:
    </CTableDataCell>
    <CTableDataCell className="fw-bold">
      {calcularTotalValor()} {/* Mostrar el total */}
    </CTableDataCell>
  </CTableRow>
      </CTableBody>
    </CTable>
  </div>
  {/* Paginación */}
  <div
  style={{
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginTop: "16px",
  }}
>
  <CPagination aria-label="Page navigation" style={{ display: "flex", gap: "10px" }}>
    <CButton
      style={{ backgroundColor: "#6f8173", color: "#D9EAD3" }}
      disabled={currentPageActividad === 1}
      onClick={() => paginateActividad(currentPageActividad - 1)}
    >
      Anterior
    </CButton>
    <CButton
      style={{ marginLeft: "10px", backgroundColor: "#6f8173", color: "#D9EAD3" }}
      disabled={currentPageActividad === totalPagesActividad}
      onClick={() => paginateActividad(currentPageActividad + 1)}
    >
      Siguiente
    </CButton>
  </CPagination>
  <span style={{ marginLeft: "10px" }}>
    Página {currentPageActividad} de {totalPagesActividad}
  </span>
</div>

</>
          )}
        </CCol>
      </CRow>
    </CContainer>
  );
  
  
  
};

export default ListaActividadesAcaVistaPadre;

