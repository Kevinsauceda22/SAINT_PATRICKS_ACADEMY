import React, { useEffect, useState } from 'react';
import { CIcon } from '@coreui/icons-react';
import { cilSearch,cilBrushAlt, cilPen, cilTrash, cilPlus, cilSave, cilArrowLeft,cilUser, cilDescription, cilSpreadsheet, cilFile  } from '@coreui/icons';
import swal from 'sweetalert2'; // Importar SweetAlert para mostrar mensajes de advertencia y éxito
import * as XLSX from 'xlsx';        // Para generar archivos Excel
import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import ExcelJS from 'exceljs';
import logo from 'src/assets/brand/logo_saint_patrick.png';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

import {
  CButton,
  CCol,
  CContainer,
  CDropdown,//Para reportes
  CDropdownMenu,
  CDropdownToggle,
  CDropdownItem,//Para reportes
  CForm,
  CFormInput,
  CFormSelect,
  CInputGroup,
  CInputGroupText,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CPagination,
  CRow,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
} from '@coreui/react';
import usePermission from '../../../../context/usePermission';
import AccessDenied from "../AccessDenied/AccessDenied"



const ListaProcedenciaEstudiante = () => {

  const { canSelect, canDelete, canInsert, canUpdate } = usePermission('ListaProcedenciaEstudiante');

  const [procedenciaEstudiante, setProcedenciaEstudiante] = useState([]);
  const [procedenciaError, setProcedenciaError] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalUpdateVisible, setModalUpdateVisible] = useState(false);
  const [modalDeleteVisible, setModalDeleteVisible] = useState(false);
  const [nuevaProcedencia, setNuevaProcedencia] = useState({
    nombre_instituto: '',
    descripcion: '',
    año_desde: '',
    año_hasta: ''
  });
  const [procedenciaEstudianteToUpdate, setProcedenciaEstudianteToUpdate] = useState({});
  const [procedenciaEstudianteToDelete, setProcedenciaEstudianteToDelete] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false); // Estado para detectar cambios sin guardar
  const [recordsPerPage, setRecordsPerPage] = useState(10);

  

    const location = useLocation();
    const navigate = useNavigate();
  

    const { personaSeleccionada } = location.state || {};

    // Manejo de error si personaSeleccionada no está definida
    if (!personaSeleccionada) {
      console.warn('No se ha proporcionado una persona seleccionada. Redirigiendo...');
      navigate('/'); // O a donde desees redirigir en caso de error
      return null; // No renderizar nada mientras se redirige
    }

      const volverAListaPersonas = () => {
        navigate('/ListaPersonas');
      };

      const abrirFichaEstudiante = (persona) => {
        if (!persona || Object.keys(persona).length === 0) {
          console.error('Error: No hay persona seleccionada.');
          return;
        }
      
        console.log('Persona seleccionada para ficha de estudiante:', persona); // Verificación correcta
        navigate('/ListaFichaEstudiante', { state: { personaSeleccionada: persona } });
      };
      
      
    
      useEffect(() => {
        console.log(personaSeleccionada);
      }, [personaSeleccionada]);

      useEffect(() => {
        const cambiosDetectados = Object.values(nuevaProcedencia).some(valor => valor !== '');
        setHasUnsavedChanges(cambiosDetectados);
      }, [nuevaProcedencia]);
      
    
  

{/***************************************************************************************************************************************/}
  // Función para obtener el histórico de procedencia desde la API
  const fetchProcedenciaEstudiante = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/procedenciaEstudiante/verTodoProcedenciaEstudiante'); // Realiza la petición al backend
      const data = await response.json(); // Convierte la respuesta a JSON
      console.log('Datos obtenidos:', data); // Agrega un log para depuración
  
      const dataWithIndex = data.map((procedencia, index) => ({
        ...procedencia,
        originalIndex: index + 1, // Añade un índice basado en la posición del registro en la lista
      }));
  
      setProcedenciaEstudiante(dataWithIndex); // Actualiza el estado con los datos obtenidos
    } catch (error) {
      console.error('Error al obtener la procedencia del estudiante:', error); // Muestra el error en la consola si la petición falla
    }
  };
  

  useEffect(() => {
    fetchProcedenciaEstudiante(); // Llama a la función para obtener el histórico de procedencia desde el backend
}, []);


{/***************************************************************************************************************************************/}
const validateProcedenciaEstudiante = (procedencia) => {
  const regexTexto = /^[a-zA-ZÁÉÍÓÚáéíóúÑñ\s'.-]*$/; // Solo letras, espacios, '.', '-' y apostrofe
  const currentYear = new Date().getFullYear();
  const minYear = currentYear - 100;

  // Asegurar que los valores existen antes de usarlos
  const trimmedInstituto = (procedencia.nombre_instituto || '').trim().replace(/\s+/g, ' ');
  const trimmedDescripcion = (procedencia.descripcion || '').trim().replace(/\s+/g, ' ');

  // Validación de caracteres especiales
  if (!regexTexto.test(trimmedInstituto)) {
    swal.fire({
      icon: 'warning',
      title: 'Instituto inválido',
      text: 'Solo se permiten letras, espacios, ".", "-", y apostrofe.',
    });
    return false;
  }

  if (!regexTexto.test(trimmedDescripcion)) {
    swal.fire({
      icon: 'warning',
      title: 'Descripción inválida',
      text: 'Solo se permiten letras, espacios, ".", "-", y apostrofe.',
    });
    return false;
  }

  // Validación de espacios múltiples
  if (/\s{2,}/.test(trimmedInstituto) || /\s{2,}/.test(trimmedDescripcion)) {
    swal.fire({
      icon: 'warning',
      title: 'Espacios múltiples',
      text: 'No se permite más de un espacio consecutivo entre palabras.',
    });
    return false;
  }

  // Validación de repetición excesiva de letras (más de 3 veces seguidas)
  if (/(.)\1{2,}/.test(trimmedInstituto) || /(.)\1{2,}/.test(trimmedDescripcion)) {
    swal.fire({
      icon: 'warning',
      title: 'Repetición excesiva de letras',
      text: 'No se permite que una misma letra se repita más de 3 veces seguidas.',
    });
    return false;
  }

  // Validación de `año_desde` solo si se ha ingresado un valor completo
  if (procedencia.año_desde && (procedencia.año_desde.toString().length !== 4 || isNaN(procedencia.año_desde) || procedencia.año_desde < minYear || procedencia.año_desde > currentYear)) {
    swal.fire({
      icon: 'warning',
      title: 'Año desde inválido',
      text: `El año de inicio debe estar entre ${minYear} y ${currentYear}.`,
    });
    return false;
  }

  // Validación de `año_hasta` solo si se ha ingresado un valor completo
  if (procedencia.año_hasta && (procedencia.año_hasta.toString().length !== 4 || isNaN(procedencia.año_hasta) || procedencia.año_hasta < minYear || procedencia.año_hasta > currentYear)) {
    swal.fire({
      icon: 'warning',
      title: 'Año hasta inválido',
      text: `El año de finalización debe estar entre ${minYear} y ${currentYear}.`,
    });
    return false;
  }

  // Validación de relación entre años solo si ambos tienen valores
  if (procedencia.año_desde && procedencia.año_hasta && procedencia.año_hasta < procedencia.año_desde) {
    swal.fire({
      icon: 'warning',
      title: 'Rango de años inválido',
      text: 'El año de finalización no puede ser anterior al año de inicio.',
    });
    return false;
  }

  return true;
};



{/***************************************************************************************************************************************/}

const capitalizeWords = (str) => {
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
};

// Validar que ningún campo esté vacío
const validateEmptyFields = () => {
  const { nombre_instituto, descripcion, año_desde, año_hasta } = nuevaProcedencia; // Ajuste al objeto nuevaProcedencia

  if (!nombre_instituto || !descripcion || !año_desde || !año_hasta) {
    swal.fire({
      icon: 'warning',
      title: 'Campos vacíos',
      text: 'Todos los campos deben estar llenos para poder registrar la procedencia del estudiante.',
    });
    return false;
  }

  return true;
};


{/***************************************************************************************************************************************/}

// Función para controlar la entrada de texto en los campos
const handleProcedenciaEstudianteInputChange = (e, field, setFunction) => {
  let value = e.target.value;

  // No permitir más de un espacio consecutivo
  value = value.replace(/\s{2,}/g, ' ');

  // No permitir que una letra se repita más de 4 veces consecutivamente
  const wordArray = value.split(' ');
  const isValid = wordArray.every(word => !/(.)\1{3,}/.test(word));

  if (!isValid) {
    swal.fire({
      icon: 'warning',
      title: 'Repetición de letras',
      text: 'No se permite que la misma letra se repita más de 4 veces consecutivas.',
    });
    return;
  }

  // Validación específica para `nombre_instituto` y `descripcion`
  if ((field === 'nombre_instituto' || field === 'descripcion') && value.length <= 2) {
    setProcedenciaError(`El campo "${field.replace('_', ' ')}" debe tener más de 2 letras.`);
  } else {
    setProcedenciaError('');
  }

  // Validación específica para `año_desde` y `año_hasta`
  const currentYear = new Date().getFullYear();
  const minYear = currentYear - 100;

  if ((field === 'año_desde' || field === 'año_hasta') && (isNaN(value) || value < minYear || value > currentYear)) {
    swal.fire({
      icon: 'warning',
      title: `Año inválido en ${field.replace('_', ' ')}`,
      text: `El año debe estar entre ${minYear} y ${currentYear}.`,
    });
    return;
  }

  // Evita que `año_hasta` sea menor que `año_desde`
  if (field === 'año_hasta' && value < setFunction.año_desde) {
    swal.fire({
      icon: 'warning',
      title: 'Rango de años inválido',
      text: 'El año hasta no puede ser menor al año desde.',
    });
    return;
  }

  setFunction((prevState) => ({
    ...prevState,
    [field]: value,
  }));

  setHasUnsavedChanges(true); // Marcar que hay cambios no guardados
};


{/***************************************************************************************************************************************/}
      // Deshabilitar copiar y pegar
  const disableCopyPaste = (e) => {
    e.preventDefault();
    swal.fire({
      icon: 'warning',
      title: 'Acción bloqueada',
      text: 'Copiar y pegar no está permitido.',
    });
  };

{/***************************************************************************************************************************************/}


    const handleCloseModal = (closeFunction, resetFields) => {
      console.log("¿Hay cambios sin guardar?", hasUnsavedChanges); 
    
      if (hasUnsavedChanges) {
        swal.fire({
          title: '¿Estás seguro?',
          text: 'Si cierras este formulario, perderás todos los datos ingresados.',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Sí, cerrar',
          cancelButtonText: 'Cancelar',
        }).then((result) => {
          if (result.isConfirmed) {
            closeFunction(false);
            resetFields();
            setHasUnsavedChanges(false);
          }
        });
      } else {
        closeFunction(false);
        resetFields();
      }
    };
    

{/***************************************************************************************************************************************/}

const resetNuevaProcedencia = () => {
  setNuevaProcedencia({ nombre_instituto: '', descripcion: '', año_desde: '', año_hasta: '' });
};

const resetProcedenciaToUpdate = () => {
  setProcedenciaEstudianteToUpdate({ nombre_instituto: '', descripcion: '', año_desde: '', año_hasta: '' });
};


{/***************************************************************************************************************************************/}

const handleCreateProcedenciaEstudiante = async () => {
  // Capitalizar el nombre del instituto y limpiar espacios excesivos
  const institutoCapitalizado = capitalizeWords(nuevaProcedencia.nombre_instituto.trim().replace(/\s+/g, ' '));
  const descripcionCapitalizada = capitalizeWords(nuevaProcedencia.descripcion.trim().replace(/\s+/g, ' '));

  const codPersonaSeleccionada = personaSeleccionada.cod_persona;

  // Validaciones antes de crear
  if (!validateProcedenciaEstudiante({ 
    cod_persona: codPersonaSeleccionada,
    nombre_instituto: institutoCapitalizado, 
    descripcion: descripcionCapitalizada, 
    año_desde: nuevaProcedencia.año_desde, 
    año_hasta: nuevaProcedencia.año_hasta 
  })) {
    return;
  }

  try {
    const response = await fetch(`http://localhost:4000/api/procedenciaEstudiante/crearProcedenciaEstudiante`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cod_persona: codPersonaSeleccionada, // ✅ Ahora solo envía `cod_persona`
        nombre_instituto: institutoCapitalizado,  
        descripcion: descripcionCapitalizada,  
        año_desde: nuevaProcedencia.año_desde, 
        año_hasta: nuevaProcedencia.año_hasta,
        estado: 1, // Activo por defecto
      }),
    });

    if (response.ok) {
      let result;
      try {
        result = await response.json(); // Intentamos obtener el JSON de la respuesta
      } catch (error) {
        console.warn("La API no devolvió JSON, pero la procedencia fue creada.");
        result = { nombre_instituto: institutoCapitalizado, descripcion: descripcionCapitalizada }; // Asumimos que se creó correctamente
      }

      // Actualiza la lista sin recargar la página
      fetchProcedenciaEstudiante(); 
      setModalVisible(false); // Cerrar el modal sin advertencia al guardar
      resetNuevaProcedencia(); // Reiniciar el estado de la nueva procedencia
      setHasUnsavedChanges(false); // Reiniciar el estado de cambios no guardados

      swal.fire({
        icon: 'success',
        title: 'Creación exitosa',
        text: `La procedencia del estudiante ha sido registrada correctamente.`,
      });

    } else {
      swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo registrar la procedencia del estudiante.',
      });
    }
  } catch (error) {
    console.error('Error al registrar la procedencia del estudiante:', error);
    swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Ocurrió un error al intentar registrar la procedencia del estudiante.',
    });
  }
};


{/***************************************************************************************************************************************/}

const handleUpdateProcedenciaEstudiante = async () => {
  // Capitalizar y limpiar espacios excesivos
  const institutoCapitalizado = capitalizeWords(procedenciaEstudianteToUpdate.nombre_instituto.trim().replace(/\s+/g, ' '));
  const descripcionCapitalizada = capitalizeWords(procedenciaEstudianteToUpdate.descripcion.trim().replace(/\s+/g, ' '));

  // Validaciones antes de actualizar
  if (!validateProcedenciaEstudiante({ 
    cod_persona: personaSeleccionada,
    nombre_instituto: institutoCapitalizado, 
    descripcion: descripcionCapitalizada, 
    año_desde: procedenciaEstudianteToUpdate.año_desde, 
    año_hasta: procedenciaEstudianteToUpdate.año_hasta 
  })) {
    return;
  }

  try {
    const response = await fetch(`http://localhost:4000/api/procedenciaEstudiante/actualizarProcedenciaEstudiante/${procedenciaEstudianteToUpdate.Cod_procedencia_estudiante}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        Cod_procedencia_estudiante: procedenciaEstudianteToUpdate.Cod_procedencia_estudiante,
        cod_persona: personaSeleccionada,
        nombre_instituto: institutoCapitalizado,
        descripcion: descripcionCapitalizada,
        año_desde: procedenciaEstudianteToUpdate.año_desde,
        año_hasta: procedenciaEstudianteToUpdate.año_hasta,
        estado: procedenciaEstudianteToUpdate.estado,  // Mantener el estado o modificarlo
      }),
    });

    if (response.ok) {
      fetchProcedenciaEstudiante();
      setModalUpdateVisible(false); // Cerrar el modal sin advertencia al guardar
      resetProcedenciaToUpdate();
      setHasUnsavedChanges(false); // Reiniciar el estado de cambios no guardados
      swal.fire({
        icon: 'success',
        title: 'Actualización exitosa',
        text: 'La procedencia del estudiante ha sido actualizada correctamente.',
      });
    } else {
      swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo actualizar la procedencia del estudiante.',
      });
    }
  } catch (error) {
    console.error('Error al actualizar la procedencia del estudiante:', error);
    swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Ocurrió un error al intentar actualizar la procedencia del estudiante.',
    });
  }
};


{/***************************************************************************************************************************************/}

const handleDeleteProcedenciaEstudiante = async () => {
  try {
    const response = await fetch(
      `http://localhost:4000/api/procedenciaEstudiante/eliminarProcedenciaEstudiante/${encodeURIComponent(procedenciaEstudianteToDelete.Cod_procedencia_estudiante)}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.ok) {
      fetchProcedenciaEstudiante(); // Refresca los datos después de eliminar
      setModalDeleteVisible(false);
      setProcedenciaEstudianteToDelete({});
      swal.fire({
        icon: 'success',
        title: 'Eliminación exitosa',
        text: 'La procedencia del estudiante ha sido eliminada correctamente.',
      });
    } else {
      swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo eliminar la procedencia del estudiante.',
      });
    }
  } catch (error) {
    console.error('Error al eliminar la procedencia:', error);
  }
};

{/***************************************************************************************************************************************/}

const openUpdateModal = (procedenciaEstudiante) => {
  setProcedenciaEstudianteToUpdate(procedenciaEstudiante);
  setModalUpdateVisible(true);
};

const openDeleteModal = (procedenciaEstudiante) => {
  setProcedenciaEstudianteToDelete(procedenciaEstudiante);
  setModalDeleteVisible(true);
};

{/***************************************************************************************************************************************/}

const handleSearch = (event) => {
  setSearchTerm(event.target.value);
  setCurrentPage(1);
};

const filteredProcedenciaEstudiante = procedenciaEstudiante.filter((procedencia) =>
  personaSeleccionada && 
  procedencia.cod_persona === personaSeleccionada.cod_persona && // Filtrar por persona seleccionada
  (
    (procedencia.nombre_instituto || '').toLowerCase().includes(searchTerm.toLowerCase()) || // Filtrar por instituto
    (procedencia.descripcion || '').toLowerCase().includes(searchTerm.toLowerCase()) || // Filtrar por descripción
    procedencia.año_desde?.toString().includes(searchTerm) || // Filtrar por año desde
    procedencia.año_hasta?.toString().includes(searchTerm) // Filtrar por año hasta
  )
);


const indexOfLastRecord = currentPage * recordsPerPage;
const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
const currentRecords = filteredProcedenciaEstudiante.slice(indexOfFirstRecord, indexOfLastRecord);

const paginate = (pageNumber) => {
  if (pageNumber > 0 && pageNumber <= Math.ceil(filteredProcedenciaEstudiante.length / recordsPerPage)) {
    setCurrentPage(pageNumber);
  }
};

{/***************************************************************************************************************************************/}

const ReporteProcedenciaEstudiantePDF = () => {
  const doc = new jsPDF('p', 'mm', 'letter');

  if (!filteredProcedenciaEstudiante || filteredProcedenciaEstudiante.length === 0) {
    alert('No hay datos para exportar.');
    return;
  }

  const img = new Image();
  img.src = logo;

  img.onload = () => {
    const pageWidth = doc.internal.pageSize.width;

    // Encabezado
    doc.addImage(img, 'PNG', 10, 10, 30, 30);
    doc.setFontSize(14);
    doc.setTextColor(0, 102, 51);
    doc.text("SAINT PATRICK'S ACADEMY", pageWidth / 2, 20, { align: 'center' });

    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text('Casa Club del periodista, Colonia del Periodista', pageWidth / 2, 26, { align: 'center' });
    doc.text('Teléfono: (504) 2234-8871', pageWidth / 2, 30, { align: 'center' });
    doc.text('Correo: info@saintpatrickacademy.edu', pageWidth / 2, 34, { align: 'center' });

    doc.setFontSize(10);
    doc.setTextColor(0, 102, 51);
    doc.text('Reporte de Procedencia Estudiante', pageWidth / 2, 40, { align: 'center' });

    doc.setLineWidth(0.5);
    doc.setDrawColor(0, 102, 51);
    doc.line(10, 45, pageWidth - 10, 45);

    let startY = 50;

    // Tabla
    doc.autoTable({
      startY: startY,
      margin: { left: (pageWidth - 200) / 2 }, // Centrar tabla con el nuevo ancho
      head: [['#', 'Instituto', 'Descripción', 'Desde', 'Hasta']],
      body: filteredProcedenciaEstudiante.map((item, index) => [
        index + 1,
        item.nombre_instituto?.toUpperCase() || 'N/D',
        item.descripcion?.toUpperCase() || 'N/D',
        item.año_desde?.toString() || 'N/D',
        item.año_hasta?.toString() || 'N/D'
      ]),
      headStyles: {
        fillColor: [0, 102, 51],
        textColor: [255, 255, 255],
        fontSize: 8,
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 7,
        cellPadding: 2,
        overflow: 'linebreak',
        halign: 'center'
      },
      columnStyles: {
        0: { cellWidth: 10 },  // #
        1: { cellWidth: 70 },  // Instituto
        2: { cellWidth: 70 },  // Descripción
        3: { cellWidth: 25 },  // Desde
        4: { cellWidth: 25 }   // Hasta
      },
      alternateRowStyles: { fillColor: [240, 248, 255] }
    });

    // Pie de página
    const now = new Date();
    const dateString = now.toLocaleDateString('es-HN', { year: 'numeric', month: 'long', day: 'numeric' });
    const timeString = now.toLocaleTimeString('es-HN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    const pageCount = doc.internal.getNumberOfPages();

    doc.setFontSize(7);
    doc.setTextColor(0, 102, 51);
    doc.text(`Fecha: ${dateString} | Hora: ${timeString}`, 10, doc.internal.pageSize.height - 10);
    doc.text(`Página ${pageCount}`, pageWidth - 20, doc.internal.pageSize.height - 10, { align: 'right' });

    // Mostrar visor PDF
    const pdfBlob = doc.output('blob');
    const pdfURL = URL.createObjectURL(pdfBlob);
    const newWindow = window.open('', '_blank');
    newWindow.document.write(`
      <html>
        <head>
          <title>Reporte de Procedencia Estudiante</title>
          <style>
            body {
              margin: 0;
              padding: 0;
              overflow: hidden;
              display: flex;
              align-items: center;
              justify-content: center;
              width: 100vw;
              height: 100vh;
            }
            iframe {
              width: 100vw;
              height: 100vh;
              border: none;
            }
            .icon-container {
              position: fixed;
              top: 15px;
              right: 15px;
              display: flex;
              gap: 15px;
              padding: 10px;
              border-radius: 8px;
            }
            .icon-button {
              background: none;
              border: none;
              cursor: pointer;
              font-size: 22px;
              color: white;
              position: relative;
              z-index: 9999;
            }
            .icon-button:focus,
            .icon-button:active {
              outline: none;
              box-shadow: none;
            }
          </style>
          <script src="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/js/all.min.js"></script>
        </head>
        <body>
          <iframe id="pdfViewer" src="${pdfURL}"></iframe>
          <div class="icon-container">
            <button class="icon-button" onclick="const a = document.createElement('a'); a.href='${pdfURL}'; a.download='Reporte_Procedencia_Estudiante.pdf'; a.click();">
              <i class="fas fa-download"></i>
            </button>
            <button class="icon-button" onclick="const printWindow = window.open('${pdfURL}', '_blank'); printWindow.onload = () => printWindow.print();">
              <i class="fas fa-print"></i>
            </button>
          </div>
        </body>
      </html>
    `);
  };

  img.onerror = () => {
    alert('No se pudo cargar el logo.');
  };
};


{/***************************************************************************************************************************************/}

const exportProcedenciaEstudianteToExcel = () => {
  if (!filteredProcedenciaEstudiante || filteredProcedenciaEstudiante.length === 0) {
    alert('No hay datos para exportar.');
    return;
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Procedencia Estudiante');

  // ✅ Establecer las columnas antes de cualquier fusión
  worksheet.columns = [
    { header: '#', key: 'index', width: 10 },
    { header: 'Instituto', key: 'instituto', width: 70 },
    { header: 'Descripción', key: 'descripcion', width: 70 },
    { header: 'Desde', key: 'desde', width: 20 },
    { header: 'Hasta', key: 'hasta', width: 20 }
  ];

  // ✅ Obtener letra de la última columna correctamente (por ejemplo: E)
  const ultimaColumna = String.fromCharCode(64 + worksheet.columns.length);

  // 🎯 Encabezado principal
  worksheet.mergeCells(`A1:${ultimaColumna}1`);
  worksheet.getCell('A1').value = "SAINT PATRICK'S ACADEMY";
  worksheet.getCell('A1').font = { bold: true, size: 18, color: { argb: '006633' } };
  worksheet.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };

  // 🎯 Subtítulo
  worksheet.mergeCells(`A2:${ultimaColumna}2`);
  worksheet.getCell('A2').value = 'PROCEDENCIA ESTUDIANTE';
  worksheet.getCell('A2').font = { bold: true, size: 16, color: { argb: '006633' } };
  worksheet.getCell('A2').alignment = { horizontal: 'center', vertical: 'middle' };

  // 📌 Encabezados
  const headerRow = worksheet.addRow(['#', 'Instituto', 'Descripción', 'Desde', 'Hasta']);
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '006633' } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
  });

  // 📊 Datos
  filteredProcedenciaEstudiante.forEach((procedencia, index) => {
    const row = worksheet.addRow([
      index + 1,
      procedencia.nombre_instituto?.toUpperCase() || 'N/A',
      procedencia.descripcion?.toUpperCase() || 'N/A',
      procedencia.año_desde,
      procedencia.año_hasta
    ]);

    row.eachCell((cell) => {
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      cell.border = {
        top: { style: 'thin', color: { argb: '000000' } },
        left: { style: 'thin', color: { argb: '000000' } },
        bottom: { style: 'thin', color: { argb: '000000' } },
        right: { style: 'thin', color: { argb: '000000' } },
      };
    });
  });

  // 📂 Guardar archivo
  workbook.xlsx.writeBuffer().then((buffer) => {
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, 'Reporte_ProcedenciaEstudiante.xlsx');
  });
};



{/***************************************************************************************************************************************/}


{/***************************************************************************************************************************************/}


{/***************************************************************************************************************************************/}


{/***************************************************************************************************************************************/}


    
    // Verificar permisos
    if (!canSelect) {
      return <AccessDenied />;
    }
    

    return(
        <CContainer>
  
  <CRow className="align-items-center mb-3">
  <CCol xs="12" className="text-center">
    {/* Título con contenedor para ajustar la línea verde */}
    <div style={{ display: 'inline-block', textAlign: 'center', position: 'relative' }}>
      <h3 className="mb-0" style={{ fontSize: '1.5rem' }}>Procedencia Estudiante</h3>
      {/* ✅ Línea verde ajustada al ancho del título */}
      <div style={{
        height: '3px',
        backgroundColor: '#4CAF50',
        width: '100%',
        marginTop: '5px'
      }}></div>
    </div>

    {/* Persona seleccionada */}
    {personaSeleccionada ? (
      <div style={{ marginTop: '10px', fontSize: '16px', color: '#555' }}>
        <strong>Procedencia Histórica de:</strong> {personaSeleccionada 
          ? `${personaSeleccionada.Nombre.toUpperCase()} ${personaSeleccionada.Segundo_nombre?.toUpperCase() || ''} ${personaSeleccionada.Primer_apellido.toUpperCase()} ${personaSeleccionada.Segundo_apellido?.toUpperCase() || ''}` 
          : 'Información no disponible'}
      </div>
    ) : (
      <div style={{ marginTop: '10px', fontSize: '16px', color: '#555' }}>
        <strong>Persona Seleccionada:</strong> Información no disponible
      </div>
    )}
  </CCol>
</CRow>

<CRow className="align-items-center mt-2 mb-3">
  {/* Botón Personas alineado a la izquierda */}
  <CCol xs="12" md="3" className="d-flex justify-content-start mb-3 mb-md-0">
    <CButton
      color="secondary"
      onClick={volverAListaPersonas}
      style={{ minWidth: '120px', height: '38px' }} // Botón menos ancho
    >
      <CIcon icon={cilArrowLeft} /> Personas
    </CButton>
  </CCol>

  {/* Botones alineados a la derecha */}
  <CCol xs="12" md="9" className="d-flex justify-content-end gap-3">
  <CButton
      style={{ backgroundColor: '#346B93', color: 'white', minWidth: '120px', height: '38px' }}
      onClick={() => abrirFichaEstudiante(personaSeleccionada)} // Ahora pasa la persona correctamente
    >
      <CIcon icon={cilUser} /> Ficha 
    </CButton>
    
    {canInsert && (
      <CButton
        style={{ backgroundColor: '#4B6251', color: 'white', minWidth: '120px', height: '38px' }} // Botón menos ancho
        onClick={() => setModalVisible(true)}
      >
        <CIcon icon={cilPlus} /> Nuevo
      </CButton>
    )}



    <CDropdown className="btn-sm d-flex align-items-center gap-1 rounded shadow">
  <CDropdownToggle
    style={{
      backgroundColor: '#6C8E58',
      color: 'white',
      fontSize: '0.85rem',
      cursor: 'pointer',
      minWidth: '120px',
      height: '38px',
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
    <CIcon icon={cilDescription} /> Reportes
  </CDropdownToggle>
  <CDropdownMenu
    style={{
      position: 'absolute',
      zIndex: 1050,
      backgroundColor: '#fff',
      boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.2)',
      borderRadius: '4px',
      overflow: 'hidden',
    }}
  >
    {/* Reporte Excel */}
    <CDropdownItem
      onClick={exportProcedenciaEstudianteToExcel}
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
      <CIcon icon={cilSpreadsheet} size="sm" /> Descargar en Excel
    </CDropdownItem>

    {/* Reporte PDF */}
    <CDropdownItem
      onClick={ReporteProcedenciaEstudiantePDF}
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
      <CIcon icon={cilFile} size="sm" /> Descargar en PDF
    </CDropdownItem>
  </CDropdownMenu>
</CDropdown>


  </CCol>
</CRow>

{/* Contenedor de la barra de búsqueda y el selector dinámico debajo de los botones */}
<CRow className="align-items-center mt-3 mb-2">
<CCol xs="12" md="8" className="d-flex flex-wrap align-items-center">
  {/* Barra de búsqueda con validaciones */}
  <CInputGroup className="me-3" style={{ width: '400px' }}>
    <CInputGroupText>
      <CIcon icon={cilSearch} />
    </CInputGroupText>
    <CFormInput
      placeholder="Buscar procedencia estudiante..."
      value={searchTerm}
      onChange={(e) => {
        let value = e.target.value;

        // Bloquear más de un espacio consecutivo
        value = value.replace(/\s{2,}/g, ' ');

        // Bloquear más de tres letras repetidas consecutivamente
        value = value.replace(/([A-Za-z])\1{2,}/g, '$1$1');

        // Bloquear más de tres números repetidos consecutivamente
        value = value.replace(/([0-9])\1{2,}/g, '$1$1');

        // Bloquear caracteres especiales
        value = value.replace(/[^A-Za-z0-9\s]/g, '');

        setSearchTerm(value);
      }}
      onPaste={(e) => e.preventDefault()} // 
      onCopy={(e) => e.preventDefault()} // 
    />
    <CButton
      style={{
        border: '1px solid #ccc',
        transition: 'all 0.1s ease-in-out',
        backgroundColor: '#F3F4F7',
        color: '#343a40'
      }}
      onClick={() => {
        setSearchTerm('');
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


  {/* Selector dinámico a la par de la barra de búsqueda */}
  <CCol xs="12" md="4" className="text-md-end mt-2 mt-md-0">
    <CInputGroup className="mt-2 mt-md-0" style={{ width: 'auto', display: 'inline-block' }}>
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

      {/* Tabla de histórico de procedencia con tamaño fijo */}
      <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #ccc', padding: '10px', marginBottom: '30px' }}>
  <CTable striped style={{ borderCollapse: 'collapse' }}> 
    <CTableHead>
      <CTableRow>
        <CTableHeaderCell style={{ borderRight: '1px solid #ddd' }} className="text-center"> #</CTableHeaderCell>
        <CTableHeaderCell style={{ borderRight: '1px solid #ddd' }} className="text-center">Instituto</CTableHeaderCell>
        <CTableHeaderCell style={{ borderRight: '1px solid #ddd' }} className="text-center">Descripción</CTableHeaderCell>
        <CTableHeaderCell style={{ borderRight: '1px solid #ddd' }} className="text-center">Desde</CTableHeaderCell> {/* ✅ Agregado */}
        <CTableHeaderCell style={{ borderRight: '1px solid #ddd' }} className="text-center">Hasta</CTableHeaderCell> {/* ✅ Agregado */}
        <CTableHeaderCell className="text-center">Acciones</CTableHeaderCell>
      </CTableRow>
    </CTableHead>

    <CTableBody>
      {currentRecords.map((procedencia) => (
        <CTableRow key={procedencia.Cod_procedencia_estudiante}>
          <CTableDataCell style={{ borderRight: '1px solid #ddd' }} className="text-center">{procedencia.originalIndex}</CTableDataCell>
          <CTableDataCell style={{ borderRight: '1px solid #ddd' }} className="text-center">{procedencia.nombre_instituto.toUpperCase()}</CTableDataCell>
          <CTableDataCell style={{ borderRight: '1px solid #ddd' }} className="text-center">{procedencia.descripcion.toUpperCase()}</CTableDataCell>
          <CTableDataCell style={{ borderRight: '1px solid #ddd' }} className="text-center">{procedencia.año_desde}</CTableDataCell> 
          <CTableDataCell style={{ borderRight: '1px solid #ddd' }} className="text-center">{procedencia.año_hasta}</CTableDataCell>
          <CTableDataCell className="text-center">
            <div className="d-flex justify-content-center">
              {canUpdate && (
                <CButton
                  color="warning"
                  onClick={() => openUpdateModal(procedencia)}
                  style={{ marginRight: '10px' }}
                  title="Editar procedencia"
                >
                  <CIcon icon={cilPen} />
                </CButton>
              )}

              {canDelete && (
                <CButton color="danger" onClick={() => openDeleteModal(procedencia)}>
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



{/*******************************************************************************************************************************************************/}
{/* Paginación Fija */}
<div className="pagination-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
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
      disabled={currentPage === Math.ceil(filteredProcedenciaEstudiante.length / recordsPerPage)} // Desactiva si es la última página
      onClick={() => paginate(currentPage + 1)} // Páginas siguientes
    >
      Siguiente
    </CButton>
  </CPagination>
  <span style={{ marginLeft: '10px' }}>
    Página {currentPage} de {Math.ceil(filteredProcedenciaEstudiante.length / recordsPerPage)}
  </span>
</div>

{/******************************************************************************************************************************************************/}
<CModal visible={modalVisible} backdrop="static" size="lg">
  <CModalHeader closeButton={false}>
    <CModalTitle>Ingresar Nueva Procedencia del Estudiante</CModalTitle>
    <CButton className="btn-close" aria-label="Close" onClick={() => handleCloseModal(setModalVisible, resetNuevaProcedencia)} />
  </CModalHeader>
  <CModalBody>
    <div style={{ marginBottom: '10px', border: '1px solid #dcdcdc', padding: '10px', backgroundColor: '#f9f9f9' }}>
      <strong>Estudiante:</strong> {personaSeleccionada 
        ? `${personaSeleccionada.Nombre.toUpperCase()} ${personaSeleccionada.Segundo_nombre?.toUpperCase() || ''} ${personaSeleccionada.Primer_apellido.toUpperCase()} ${personaSeleccionada.Segundo_apellido?.toUpperCase() || ''}` 
        : 'Información no disponible'}
    </div>
    <CForm>
      {/* Nombre del Instituto */}
      <CInputGroup className="mb-3">
        <CInputGroupText>Instituto</CInputGroupText>
        <CFormInput
          type="text"
          placeholder="Ingrese el nombre del instituto"
          maxLength={100}
          onPaste={disableCopyPaste}
          onCopy={disableCopyPaste}
          value={nuevaProcedencia.nombre_instituto}
          onChange={(e) => {
            let value = e.target.value.replace(/\s{2,}/g, ' '); // Bloquear más de un espacio
            value = value.replace(/(.)\1{2,}/g, '$1$1'); // Bloquear más de 3 letras repetidas
            value = value.replace(/[^a-zA-ZÁÉÍÓÚáéíóúÑñ0-9\s'.,-]/g, ''); // Permitir caracteres válidos

            setNuevaProcedencia(prev => ({ ...prev, nombre_instituto: value.toUpperCase() }));
          }}
        />
      </CInputGroup>

      {/* Descripción */}
      <CInputGroup className="mb-3">
        <CInputGroupText>Descripción</CInputGroupText>
        <CFormInput
          type="text"
          placeholder="Ingrese una descripción"
          maxLength={200}
          onPaste={disableCopyPaste}
          onCopy={disableCopyPaste}
          value={nuevaProcedencia.descripcion}
          onChange={(e) => {
            let value = e.target.value.replace(/\s{2,}/g, ' '); // Bloquear más de un espacio
            value = value.replace(/(.)\1{2,}/g, '$1$1'); // Bloquear más de 3 letras repetidas
            value = value.replace(/[^a-zA-ZÁÉÍÓÚáéíóúÑñ0-9\s'.,-]/g, ''); // Permitir caracteres válidos + comas

            setNuevaProcedencia(prev => ({ ...prev, descripcion: value.toUpperCase() }));
          }}
        />
      </CInputGroup>

{/* Año Desde */}
<CInputGroup className="mb-3">
  <CInputGroupText>Año Desde</CInputGroupText>
  <CFormInput
    type="text"
    placeholder="Ingrese el año de inicio"
    onPaste={disableCopyPaste}
    onCopy={disableCopyPaste}
    value={nuevaProcedencia.año_desde}
    onChange={(e) => {
      const value = e.target.value.replace(/[^0-9]/g, ''); // Solo permitir números
      if (value.length <= 4) { // Limitar a 4 dígitos
        setNuevaProcedencia(prev => ({ ...prev, año_desde: value }));
      }
    }}
  />
</CInputGroup>

{/* Año Hasta */}
<CInputGroup className="mb-3">
  <CInputGroupText>Año Hasta</CInputGroupText>
  <CFormInput
    type="text"
    placeholder="Ingrese el año de finalización"
    onPaste={disableCopyPaste}
    onCopy={disableCopyPaste}
    value={nuevaProcedencia.año_hasta}
    onChange={(e) => {
      const value = e.target.value.replace(/[^0-9]/g, ''); // Solo permitir números
      if (value.length <= 4) { // Limitar a 4 dígitos
        setNuevaProcedencia(prev => ({ ...prev, año_hasta: value }));
      }
    }}
  />
</CInputGroup>

    </CForm>
  </CModalBody>

  <CModalFooter>
    <CButton color="secondary" onClick={() => handleCloseModal(setModalVisible, resetNuevaProcedencia)}>
      Cancelar
    </CButton>
    <CButton 
      style={{ backgroundColor: '#4B6251', color: 'white' }} 
      onClick={() => {
        if (validateProcedenciaEstudiante(nuevaProcedencia)) {
          handleCreateProcedenciaEstudiante();
        }
      }}
    >
      <CIcon icon={cilSave} style={{ marginRight: '5px' }} /> Guardar
    </CButton>
  </CModalFooter>
</CModal>



{/********************************************************************************************************************************************************/}
<CModal visible={modalUpdateVisible} backdrop="static" size="lg">
  <CModalHeader closeButton={false}>
    <CModalTitle>Actualizar Procedencia del Estudiante</CModalTitle>
    <CButton className="btn-close" aria-label="Close" onClick={() => handleCloseModal(setModalUpdateVisible, resetProcedenciaToUpdate)} />
  </CModalHeader>
  <CModalBody>
  <div style={{ marginBottom: '10px', border: '1px solid #dcdcdc', padding: '10px', backgroundColor: '#f9f9f9' }}>
      <strong>Estudiante:</strong> {personaSeleccionada 
        ? `${personaSeleccionada.Nombre.toUpperCase()} ${personaSeleccionada.Segundo_nombre?.toUpperCase() || ''} ${personaSeleccionada.Primer_apellido.toUpperCase()} ${personaSeleccionada.Segundo_apellido?.toUpperCase() || ''}` 
        : 'Información no disponible'}
    </div>
    <CForm>
      {/* Nombre del Instituto */}
      <CInputGroup className="mb-3">
        <CInputGroupText>Instituto</CInputGroupText>
        <CFormInput
          type="text"
          placeholder="Ingrese el nombre del instituto"
          maxLength={100}
          onPaste={disableCopyPaste}
          onCopy={disableCopyPaste}
          value={procedenciaEstudianteToUpdate.nombre_instituto || ''}
          onChange={(e) => {
            let value = e.target.value.replace(/\s{2,}/g, ' '); // Bloquear más de un espacio
            value = value.replace(/(.)\1{2,}/g, '$1$1'); // Bloquear más de 3 letras repetidas
            value = value.replace(/[^a-zA-ZÁÉÍÓÚáéíóúÑñ0-9\s'.,-]/g, ''); // Permitir caracteres válidos

            setProcedenciaEstudianteToUpdate(prev => ({ ...prev, nombre_instituto: value.toUpperCase() }));
          }}
        />
      </CInputGroup>

      {/* Descripción */}
      <CInputGroup className="mb-3">
        <CInputGroupText>Descripción</CInputGroupText>
        <CFormInput
          type="text"
          placeholder="Ingrese una descripción"
          maxLength={200}
          onPaste={disableCopyPaste}
          onCopy={disableCopyPaste}
          value={procedenciaEstudianteToUpdate.descripcion || ''}
          onChange={(e) => {
            let value = e.target.value.replace(/\s{2,}/g, ' '); // Bloquear más de un espacio
            value = value.replace(/(.)\1{2,}/g, '$1$1'); // Bloquear más de 3 letras repetidas
            value = value.replace(/[^a-zA-ZÁÉÍÓÚáéíóúÑñ0-9\s'.,-]/g, ''); // Permitir caracteres válidos + comas

            setProcedenciaEstudianteToUpdate(prev => ({ ...prev, descripcion: value.toUpperCase() }));
          }}
        />
      </CInputGroup>

      {/* Año Desde */}
      <CInputGroup className="mb-3">
        <CInputGroupText>Año Desde</CInputGroupText>
        <CFormInput
          type="text"
          placeholder="Ingrese el año de inicio"
          onPaste={disableCopyPaste}
          onCopy={disableCopyPaste}
          value={procedenciaEstudianteToUpdate.año_desde}
          onChange={(e) => {
            const value = e.target.value.replace(/[^0-9]/g, ''); // Solo permitir números
            if (value.length <= 4) { // Limitar a 4 dígitos
              setProcedenciaEstudianteToUpdate(prev => ({ ...prev, año_desde: value }));
            }
          }}
        />
      </CInputGroup>

      {/* Año Hasta */}
      <CInputGroup className="mb-3">
        <CInputGroupText>Año Hasta</CInputGroupText>
        <CFormInput
          type="text"
          placeholder="Ingrese el año de finalización"
          onPaste={disableCopyPaste}
          onCopy={disableCopyPaste}
          value={procedenciaEstudianteToUpdate.año_hasta}
          onChange={(e) => {
            const value = e.target.value.replace(/[^0-9]/g, ''); // Solo permitir números
            if (value.length <= 4) { // Limitar a 4 dígitos
              setProcedenciaEstudianteToUpdate(prev => ({ ...prev, año_hasta: value }));
            }
          }}
        />
      </CInputGroup>
    </CForm>
  </CModalBody>

  {/* Mostrar mensaje de error si existe */}
  {procedenciaError && (
    <div className="text-danger mt-2">
      {procedenciaError}
    </div>
  )}

  <CModalFooter>
    <CButton color="secondary" onClick={() => handleCloseModal(setModalUpdateVisible, resetProcedenciaToUpdate)}>
      Cancelar
    </CButton>
    <CButton
      style={{ backgroundColor: '#4B6251', color: 'white' }} // Ahora el botón de actualizar es verde oscuro
      onClick={() => {
        if (validateProcedenciaEstudiante(procedenciaEstudianteToUpdate)) {
          handleUpdateProcedenciaEstudiante();
        }
      }}
    >
      <CIcon icon={cilSave} style={{ marginRight: '5px' }} /> Guardar
    </CButton>
  </CModalFooter>
</CModal>



{/********************************************************************************************************************************************************/}
{/* Modal Eliminar Procedencia Estudiante */}
<CModal visible={modalDeleteVisible} onClose={() => setModalDeleteVisible(false)} backdrop="static">
  <CModalHeader>
    <CModalTitle>Eliminar Procedencia Estudiante</CModalTitle>
  </CModalHeader>
  <CModalBody>
    ¿Estás seguro de que deseas eliminar la procedencia "{procedenciaEstudianteToDelete.nombre_instituto}"?
  </CModalBody>
  <CModalFooter>
    <CButton color="secondary" onClick={() => setModalDeleteVisible(false)}>
      Cancelar
    </CButton>
    <CButton color="danger" onClick={handleDeleteProcedenciaEstudiante}>
      Eliminar
    </CButton>
  </CModalFooter>
</CModal>


{/*****************************************************************************************************************************************************/}

      </CContainer>
    );
};

export default ListaProcedenciaEstudiante;
