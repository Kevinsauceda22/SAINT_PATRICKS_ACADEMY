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
        const response = await fetch('http://localhost:4000/api/notas/seccion', {
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
      const response = await fetch(`http://localhost:4000/api/seccionalumno/estudiantes/${Cod_secciones}`);
      if (!response.ok) throw new Error('Error al obtener la lista de estudiantes');
      const data = await response.json();
      setEstudiantes(data);
    } catch (error) {
      console.error('Error:', error);
      Swal.fire('Error', 'Hubo un problema al obtener los estudiantes', 'error');
    }
  };
  

  const fetchCuadroNotas = async (Cod_seccion_matricula, nombreEstudiante) => {
    try {
      setNombreEstudiante(nombreEstudiante);
      const response = await fetch(`http://localhost:4000/api/notas/notasypromedio/${Cod_seccion_matricula}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`, // Incluye el token si es necesario
        },
      });
  
      if (!response.ok) throw new Error('Error al obtener el cuadro de notas.');
  
      const data = await response.json();
      setCuadroNotas(data);
      setCurrentView('cuadroNotas'); // Cambiar la vista actual al cuadro de notas
    } catch (error) {
      console.error('Error al obtener el cuadro de notas:', error);
      Swal.fire('Error', 'No se pudieron cargar los datos del cuadro de notas', 'error');
    }
  };
  

  
  const generarReportePDF = () => {
    // Validar que haya datos en la tabla
    if (!secciones || secciones.length === 0) {
     Swal.fire({
       icon: 'info',
       title: 'Tabla vacía',
       text: 'No hay datos disponibles para generar el reporte.',
       confirmButtonText: 'Entendido',
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
       head: [['#', 'Sección', 'Grado', 'Total Alumnos','Año Académico']],
       body: secciones.map((seccion, index) => [
         index + 1,
         `${seccion.Seccion || ''}`.trim(),
         seccion.Grado,
         seccion.Total_Alumnos,
         seccion.Anio_Academico,
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
  if (!secciones || secciones.length === 0) {
    Swal.fire({
      icon: 'info',
      title: 'Tabla vacía',
      text: 'No hay datos disponibles para generar el reporte excel.',
      confirmButtonText: 'Entendido',
    });
    return; // Salir de la función si no hay datos
  }
  const encabezados = [
    ["Saint Patrick Academy"],
    ["Reporte de Secciones"],
    [], // Espacio en blanco
    ["#","Sección", "Grado", "Total Alumnos", "Año Académico"]
  ];

  // Crear filas con asistencias filtradas
  const filas = secciones.map((seccion, index) => [
    index + 1,
    seccion.Seccion,
    seccion.Grado,
    seccion.Total_Alumnos,
    seccion.Anio_Academico
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
    { wpx: 100 }  
  ];

  hojaDeTrabajo['!cols'] = ajusteColumnas;

  // Crear el libro de trabajo
  const libroDeTrabajo = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(libroDeTrabajo, hojaDeTrabajo, "Reporte de Secciones");
  // Guardar el archivo Excel con un nombre fijo
  const nombreArchivo = `Reporte_Secciones.xlsx`;

  XLSX.writeFile(libroDeTrabajo, nombreArchivo);
};

const disableCopyPaste = (e) => {
  e.preventDefault();
  Swal.fire({
    icon: 'warning',
    title: 'Acción bloqueada',
    text: 'Copiar y pegar no está permitido.',
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
    });
    value = value.replace(/\s+/g, ' '); // Reemplazar múltiples espacios por uno solo
  }

  // Validar caracteres permitidos
  if (!regex.test(value)) {
    Swal.fire({
      icon: 'warning',
      title: 'Caracteres no permitidos',
      text: 'Solo se permiten letras, números y espacios.',
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

 //-------------------paginacion, buscador vista actual : asignaturas-----------------------------
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
    });
    value = value.replace(/\s+/g, ' '); // Reemplazar múltiples espacios por uno solo
  }

  // Validar caracteres permitidos
  if (!regex.test(value)) {
    Swal.fire({
      icon: 'warning',
      title: 'Caracteres no permitidos',
      text: 'Solo se permiten letras, números y espacios.',
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
  estudiante.Nombre_Completo && estudiante.Nombre_Completo.toLowerCase().includes(searchTerm3.toLowerCase())
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

const exportarContenido = () => {
  const contenidoExportado = document.createElement('div');

  // Clonamos el encabezado del reporte
  const reportHeader = document.querySelector('.report-header');
  contenidoExportado.appendChild(reportHeader ? reportHeader.cloneNode(true) : null); // Si existe el encabezado

  // Información del estudiante con espaciado de letras
  const infoEstudiante = document.createElement('div');
  infoEstudiante.innerHTML = `
    <div style="display: flex; justify-content: space-between; margin: 0 30px; font-size: 1.1rem; font-family: 'Arial Narrow', sans-serif; color: #000000; letter-spacing: 0.5px;">
      <span style="display: flex; align-items: center;">
        <strong style="font-weight: bold;">Student Name:</strong>
        <span style="border-bottom: 1px solid black; padding-bottom: 2px; display: inline-block; flex: 1; margin-left: 5px; letter-spacing: 0.5px;">
          ${nombreEstudiante}
        </span>
      </span>
      <span style="display: flex; align-items: center;">
        <strong style="font-weight: bold;">Student ID:</strong> _____________________
      </span>
    </div>
    <div style="display: flex; justify-content: space-between; margin: 20px 30px; font-size: 1.1rem; font-family: 'Arial Narrow', sans-serif; color: #000000; letter-spacing: 0.5px;">
      <span style="margin-left: 40px;">
        <strong style="font-weight: bold;">Grade:</strong>
        <span style="padding-bottom: 2px; display: inline-block; letter-spacing: 0.5px;">${gradoSeleccionado}</span>
      </span>
      <span style="margin-left: 10px;">
        <strong style="font-weight: bold;">Section:</strong> ${nombreSeccionSeleccionada}
      </span>
      <span style="margin-right: 40px;">
        <strong style="font-weight: bold;">School year:</strong> 2024-2025
      </span>
    </div>
  `;
  contenidoExportado.appendChild(infoEstudiante);

  // Clonamos la tabla de notas
  const tablaNotas = document.querySelector('.table-bordered');
  contenidoExportado.appendChild(tablaNotas.cloneNode(true));

  // Ajustamos los márgenes y el diseño del contenedor
  contenidoExportado.style.padding = '20px';
  contenidoExportado.style.fontFamily = 'Arial Narrow, sans-serif';

  // Limpiar bordes o líneas no deseadas en celdas y texto
  contenidoExportado.querySelectorAll('th, td').forEach((elemento) => {
    elemento.style.border = 'none'; // Eliminamos bordes
    elemento.style.textDecoration = 'none'; // Aseguramos que no tenga subrayado
  });

  // Aseguramos que los estilos sean consistentes y sin líneas cruzadas
  contenidoExportado.querySelectorAll('*').forEach((elemento) => {
    elemento.style.textDecoration = 'none'; // Elimina cualquier subrayado no deseado
  });

  // Agregamos bordes consistentes a la tabla
  contenidoExportado.querySelectorAll('table, th, td').forEach((elemento) => {
    elemento.style.borderCollapse = 'collapse';
    elemento.style.border = '1px solid black'; // Borde consistente en la tabla
  });

  // Agregamos el contenedor temporal al body (será oculto)
  document.body.appendChild(contenidoExportado);

  // Usamos html2canvas para capturar el contenido con alta resolución
  setTimeout(() => {
    requestAnimationFrame(() => {
      html2canvas(contenidoExportado, {
        scale: 3, // Escala alta para HD
        useCORS: true,
        backgroundColor: null,
      })
        .then((canvas) => {
          const imgData = canvas.toDataURL('image/png');
          const pdf = new jsPDF('p', 'mm', 'a4');
          const pdfWidth = pdf.internal.pageSize.getWidth() - 5;
          const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

          // Agregar la imagen generada al PDF
          pdf.addImage(imgData, 'PNG', 5, 5, pdfWidth, pdfHeight);

          // Generar la URL del PDF y abrirla en una nueva ventana
          const pdfOutput = pdf.output('blob');
          const link = document.createElement('a');
          link.href = URL.createObjectURL(pdfOutput);
          link.download = 'reporte.pdf';
          link.click();
        })
        .finally(() => {
          // Limpiamos el contenedor temporal
          document.body.removeChild(contenidoExportado);
        });
    });
  }, 500); // Espera 500ms antes de iniciar el proceso de captura
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
            <div className="d-flex justify-content-center align-items-center flex-grow-1">
              <h4 className="text-center fw-semibold pb-2 mb-0" style={{display: "inline-block", borderBottom: "2px solid #4CAF50", margin: "0 auto",}}> Estudiantes: Seccion {nombreSeccionSeleccionada || "Selecciona una sección"}- {anioSeccionSeleccionada || "Selecciona una sección"}</h4>
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
                    //onClick={generarReporteasignaturasPDF}
                    style={{cursor: "pointer",outline: "none",backgroundColor: "transparent",padding: "0.5rem 1rem",fontSize: "0.85rem",color: "#333",borderBottom: "1px solid #eaeaea",transition: "background-color 0.3s",}}
                    onMouseOver={(e) =>(e.target.style.backgroundColor = "#f5f5f5")} onMouseOut={(e) =>(e.target.style.backgroundColor = "transparent")}>
                    <CIcon icon={cilFile} size="sm" /> Abrir en PDF
                  </CDropdownItem>
                  <CDropdownItem
                    //onClick={generarReporteasignaturasExcel}
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
              <CTableHeaderCell>ALUMNO</CTableHeaderCell>
              <CTableHeaderCell>ACCIÓN</CTableHeaderCell>
              </CTableRow>
              </CTableHead>
              <CTableBody className="text-center" style={{fontSize: '0.85rem',}}>
              {currentRecords3.length > 0 ? (
              currentRecords3.map((estudiante, index) => (
              <CTableRow key={estudiante.Cod_seccion_matricula}>
                <CTableDataCell>{index + 1}</CTableDataCell>
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
                    onClick={() => fetchCuadroNotas(estudiante.Cod_seccion_matricula,estudiante.Nombre_Completo)}
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
  Abrir en PDF
</CButton>

</CCol>

    {/* Encabezado del reporte */}
    <div 
  className="report-header mt-4" 
  style={{ 
    display: 'flex',  // Usamos flexbox para alinear los elementos en línea
    alignItems: 'center',  // Alineamos los elementos verticalmente al centro
    justifyContent: 'center',  // Alineamos todo el contenido a la izquierda
    textAlign: 'left',  // Alineamos el texto a la izquierda
    marginBottom: '30px', 
    flex: 1, 
    marginLeft: '-70px',
    padding: '20px',
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
    }} 
  />
  
  {/* Contenedor de texto a la izquierda */}
  <div style={{ textAlign: 'center' }}>
    {/* Título con Monotype Corsiva */}
    <h1 style={{
      fontSize: '2.333rem', 
      marginBottom: '5px',
      fontFamily: 'Monotype Corsiva, cursive', 
      letterSpacing: '2px',  // Espaciado entre letras para darle un toque elegante
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
      letterSpacing: '1px',  // Espaciado de letras para la claridad 
      color: '#000000',
      fontWeight: 'bold'
    }}>
      Report Card
    </h2>
  </div>
</div>


    <div style={{ display: 'flex', justifyContent: 'space-between', margin: '0 30px', fontSize: '1.1rem', fontFamily: 'Arial Narrow, sans-serif', color: '#000000' }}>
      <span style={{ display: 'flex', alignItems: 'center'}}>
        <strong style={{ fontWeight: 'bold' }}>Student Name:</strong>
        <span style={{ borderBottom: '1px solid black', paddingBottom: '2px', display: 'inline-block', flex: '1', marginLeft: '5px', letterSpacing: '0.5px' }}>
          {nombreEstudiante}
        </span>
      </span>
      <span style={{ display: 'flex', alignItems: 'center' }}>
        <strong style={{ fontWeight: 'bold' }}>Student ID:</strong> _____________________
      </span>
    </div>

    <div style={{ display: 'flex', justifyContent: 'space-between', margin: '20px 30px', fontSize: '1.1rem', fontFamily: 'Arial Narrow, sans-serif', color: '#000000' }}>
      <span style={{ marginLeft: '40px' }}>
        <strong style={{ fontWeight: 'bold' }}>Grade:</strong>
        <span style={{ paddingBottom: '2px', display: 'inline-block', letterSpacing: '0.5px' }}>{gradoSeleccionado}</span>
      </span>
      <span style={{ marginLeft: '10px' }}><strong style={{ fontWeight: 'bold' }}>Section: </strong> {nombreSeccionSeleccionada}</span>
      <span style={{ marginRight: '40px' }}><strong style={{ fontWeight: 'bold' }}>School year: </strong> 2024-2025</span>
    </div>


          
      <CTable className="table-bordered" style={{ border: '2px solid #000000', marginTop: '50px' }}>
      <CTableHead>
  <CTableRow>
    <CTableHeaderCell 
      rowSpan={2} 
      className="text-center align-middle" 
      style={{ backgroundColor: '#BFBFBF' }}  // Color de fondo agregado
    >
      <div className="d-flex flex-column align-items-center justify-content-center">
        <span>Áreas Curriculares/</span>
        <span style={{ marginTop: '9px' }}>Campos del Conocimiento</span>
      </div>
    </CTableHeaderCell>

    <CTableHeaderCell 
      colSpan={cuadroNotas.length > 0 ? cuadroNotas[0].NotasParciales.length : 0} 
      className="text-center align-middle" 
      style={{ backgroundColor: '#BFBFBF', borderBottom: '1px solid #000000', }}  // Color de fondo agregado
    >
      Parciales
    </CTableHeaderCell>

    <CTableHeaderCell 
      rowSpan={2} 
      className="text-center align-middle" 
      style={{ backgroundColor: '#BFBFBF' }}  // Color de fondo agregado
    >
      <div className="d-flex flex-column align-items-center justify-content-center">
        <span>Nota</span>
        <span style={{ marginTop: '9px' }}>Prom. Final (%)</span>
      </div>
    </CTableHeaderCell>
  </CTableRow>

  <CTableRow>
    {/* Encabezados dinámicos para los parciales */}
    {cuadroNotas.length > 0 &&
      cuadroNotas[0].NotasParciales.map((parcial, index) => (
        <CTableHeaderCell 
          key={index} 
          className="text-center" 
          style={{ backgroundColor: '#BFBFBF' }}  // Color de fondo agregado
        >
          {parcial.Parcial}
        </CTableHeaderCell>
      ))}
  </CTableRow>
</CTableHead>


        <CTableBody>
          {cuadroNotas.map((nota, index) => (
            <CTableRow key={index}>
              {/* Celda combinada para el índice y la asignatura */}
              <CTableDataCell className="text-center bg-transparent" style={{ fontSize: '14px', width: '350px' }}>
              <div className="d-flex justify-content-start">
                <span style={{ marginRight: '20px', marginLeft: '60px' }}>{index + 1}.</span> {/* Índice */}
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{nota.Asignatura}</span> {/* Asignatura */}
              </div>
            </CTableDataCell>

            {/* Notas en columnas según los parciales */}
            {nota.NotasParciales.map((parcial, i) => (
              <CTableDataCell key={i} className="text-center bg-transparent">{parcial.Nota}</CTableDataCell>
            ))}

            {/* Columna Promedio Final */}
            <CTableDataCell className="text-center bg-transparent">{nota.PromedioFinal}</CTableDataCell>
          </CTableRow>
        ))}
      </CTableBody>
    </CTable>
  </>
)}



 </CContainer>
);
};
export default ListaCuadro;