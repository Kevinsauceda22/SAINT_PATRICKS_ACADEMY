import React, { useState, useEffect } from 'react';
import { CIcon } from '@coreui/icons-react';
import {  cilSearch, cilBrushAlt, cilPen, cilTrash, cilPlus, cilSave, cilInfo, cilDescription} from '@coreui/icons';
import axios from 'axios'; // Asegúrate de instalar axios si no lo tienes
import swal from 'sweetalert2'; // Importar SweetAlert
import ExcelJS from 'exceljs';
import { jsPDF } from 'jspdf';       // Para generar archivos PDF
import 'jspdf-autotable';            // Para crear tablas en los archivos PDF
import { saveAs } from 'file-saver'; // Para descargar archivos en el navegador
import {
  CContainer,
  CInputGroup,
  CInputGroupText,
  CFormInput,
  CButton,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CPagination,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CForm,
  CFormLabel,
  CFormSelect,
  CRow,
  CCol,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem
} from '@coreui/react';
import logo from 'src/assets/brand/logo_saint_patrick.png';
import usePermission from '../../../../context/usePermission';
import AccessDenied from "../AccessDenied/AccessDenied"

const ListaTipoDocumentos = () => {
    const { canSelect, error, canDelete, canInsert, canUpdate } = usePermission('ListaTipoDocumentos');


    const [tipoDocumento, setTipoDocumento] = useState([]);
    const [documentoError, setDocumentoError] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [modalUpdateVisible, setModalUpdateVisible] = useState(false);
    const [modalDeleteVisible, setModalDeleteVisible] = useState(false);
    const [nuevoDocumento, setNuevoDocumento] = useState({ tipo_documento: '' });
    const [tipoDocumentoToUpdate, setTipoDocumentoToUpdate] = useState({});
    const [tipoDocumentoToDelete, setTipoDocumentoToDelete] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false); // Estado para detectar cambios sin guardar
    const [recordsPerPage, setRecordsPerPage] = useState(10);
    const [loading, setLoading] = useState(false);
    

{/***************************************************************************************************************************************/}      

const fetchTipoDocumento = async () => {
  try {
    const response = await fetch('http://localhost:4000/api/tipoDocumento/verTodoTipoDocumentos');
    const data = await response.json();

    // Verificamos si "data" es un array antes de manipularlo
    if (!Array.isArray(data)) {
      console.error('Error: La API no está devolviendo un arreglo, sino:', data);
      return;
    }

    // Mapeamos los datos y luego los invertimos
    const dataWithIndex = data
      .map((tipoDocumento, index) => ({
        ...tipoDocumento,
        originalIndex: index + 1,
      }))
      .reverse(); // 🔄 Invertimos el orden para mostrar el último primero

    setTipoDocumento(dataWithIndex);
  } catch (error) {
    console.error('Error al obtener los tipos de documento:', error);
  }
};

useEffect(() => {
  fetchTipoDocumento();
}, []);

{/***************************************************************************************************************************************/}      

// Validación de tipo documento
const validateTipoDocumento = (documento, descripcion) => {
  // Validación para tipo_documento
  const regexDocumento = /^[a-zA-ZÁÉÍÓÚáéíóúÑñ\s]*$/;
  const noMultipleSpacesDocumento = !/\s{2,}/.test(documento); // No permite más de un espacio consecutivo
  const trimmedDocumento = documento.trim().replace(/\s+/g, ' ');

  if (!regexDocumento.test(trimmedDocumento)) {
    swal.fire({
      icon: 'warning',
      title: 'Documento inválido',
      text: 'El tipo de documento solo puede contener letras y espacios.',
    });
    return false;
  }

  if (!noMultipleSpacesDocumento) {
    swal.fire({
      icon: 'warning',
      title: 'Espacios múltiples',
      text: 'No se permite más de un espacio entre palabras en el tipo de documento.',
    });
    return false;
  }

  // Validar que ninguna letra se repita más de 3 veces seguidas
  const wordsDocumento = trimmedDocumento.split(' ');
  for (let word of wordsDocumento) {
    const letterCounts = {};
    for (let letter of word) {
      letterCounts[letter] = (letterCounts[letter] || 0) + 1;
      if (letterCounts[letter] > 3) {
        swal.fire({
          icon: 'warning',
          title: 'Repetición de letras',
          text: `La letra "${letter}" se repite más de 3 veces en la palabra "${word}" del tipo de documento.`,
        });
        return false;
      }
    }
  }

  // Validación para descripcion
  const regexDescripcion = /^[a-zA-Z0-9ÁÉÍÓÚáéíóúÑñ\s.,-]*$/; // Permite letras, números, espacios, puntos, comas y guiones
  const noMultipleSpacesDescripcion = !/\s{2,}/.test(descripcion); // No permite más de un espacio consecutivo
  const trimmedDescripcion = descripcion.trim().replace(/\s+/g, ' ');

  if (!regexDescripcion.test(trimmedDescripcion)) {
    swal.fire({
      icon: 'warning',
      title: 'Descripción inválida',
      text: 'La descripción solo puede contener letras, números, espacios, puntos, comas y guiones.',
    });
    return false;
  }

  if (!noMultipleSpacesDescripcion) {
    swal.fire({
      icon: 'warning',
      title: 'Espacios múltiples',
      text: 'No se permite más de un espacio entre palabras en la descripción.',
    });
    return false;
  }

  return true; // Ambos campos son válidos
};



{/***************************************************************************************************************************************/}

// Capitalizar la primera letra de cada palabra
const capitalizeWords = (str) => {
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
};

// Validar que ningún campo esté vacío
const validateEmptyFields = () => {
  const { tipo_documento, descripcion } = nuevoDocumento;

  if (!tipo_documento || !descripcion) {
    swal.fire({
      icon: 'warning',
      title: 'Campos vacíos',
      text: 'Todos los campos deben estar llenos para poder crear un tipo de documento.',
    });
    return false;
  }
  
  return true;
};


{/***************************************************************************************************************************************/}

// Validar si el tipoDocumento ya existe
const isDuplicateTipoDocumento = () => {
  const { tipo_documento } = nuevoDocumento;
  const existingDocumento = tipoDocumento.find(
    (tipo) =>
      tipo.tipo_documento.toLowerCase() === tipo_documento.toLowerCase()
  );
  if (existingDocumento) {
    swal.fire({
      icon: 'warning',
      title: 'Documento duplicado',
      text: 'Ya existe un tipo de documento con el mismo nombre.',
    });

    if (existingDocumento) {
      setDocumentoError('Ya existe un tipo de documento con el mismo nombre');
    } else {
      setDocumentoError(''); // No hay error
    }
    return true;
  }
  return false;
};





{/***************************************************************************************************************************************/}

// Función para controlar la entrada de texto en tipo_documento
const handleTipoDocumentoInputChange = (e, setFunction) => {
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
      text: 'No se permite que la misma letra se repita más de 3 veces consecutivas.',
    });
    return;
  }

  if (value.length <= 2) {
    setDocumentoError('El tipo de documento debe tener más de 2 letras.');
  } else {
    setDocumentoError(''); // No hay error
  }

  setFunction((prevState) => ({
    ...prevState,
    tipo_documento: value,
  }));

  setHasUnsavedChanges(true); // Marcar que hay cambios no guardados
};
{/****************************************************************************************************************************************/}

const handleTipoDocumentoKeyDown = (event) => {
  const char = event.key;
  
  // Permitir teclas esenciales como borrar, navegación y edición
  const allowedKeys = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Tab", "Enter"];

  if (allowedKeys.includes(char)) {
    return; // ✅ Permitir acciones básicas
  }

  // Bloquear números y caracteres especiales (excepto acentos y espacios)
  if (!/^[a-zA-ZÁÉÍÓÚáéíóúÑñ ]$/.test(char)) {
    event.preventDefault(); // 🚫 Bloquea cualquier carácter no permitido
  }

  // Bloquear más de un espacio consecutivo
  const inputValue = event.target.value;
  if (char === " " && inputValue.slice(-1) === " ") {
    event.preventDefault(); // 🚫 Bloquea el segundo espacio
  }
};


{/*******************************************************************************************************************************/}
const handleDescripcionKeyDown = (event) => {
  const char = event.key;

  // Permitir las teclas de borrar (Backspace, Delete)
  if (char === "Backspace" || char === "Delete") {
    return;
  }

  // Expresión regular: Permite letras, acentos y comas; bloquea números y caracteres especiales
  if (!/^[a-zA-ZÁÉÍÓÚáéíóú, ]$/.test(char)) {
    event.preventDefault(); // 🚫 Bloquea la entrada desde el teclado
  }

  // Bloqueo de más de 3 caracteres repetidos consecutivos
  const input = event.target.value + char;
  if (/([a-zA-ZÁÉÍÓÚáéíóú,])\1{1,}/.test(input)) {
    event.preventDefault(); // 🚫 Bloquea la repetición excesiva
  }
};
{/***************************************************************************************************************************/}

const handleDescripcionInputChange = (e, setFunction) => {
  let value = e.target.value;

  // No permitir más de un espacio consecutivo
  value = value.replace(/\s{2,}/g, ' ');

  // Bloqueo de más de 3 caracteres consecutivos repetidos
  if (/([a-zA-ZÁÉÍÓÚáéíóú,])\1{2,}/.test(value)) {
    setDocumentoError('No se permiten más de tres caracteres repetidos consecutivos.');
  }

  // Bloqueo de números y caracteres especiales (excepto acentos y comas)
  if (/[^a-zA-ZÁÉÍÓÚáéíóú, ]/.test(value)) {
    setDocumentoError('Solo se permiten letras, acentos y comas.');
  }

  // NO bloqueamos el borrado, solo mostramos el error cuando se intenta guardar
  if (value.length < 10) {
    setDocumentoError('La descripción debe tener al menos 10 caracteres.');
  } else {
    setDocumentoError(''); // Se limpia el error si la longitud es válida
  }

  setFunction((prevState) => ({
    ...prevState,
    descripcion: value.toUpperCase(), // Convertir a mayúsculas
  }));

  setHasUnsavedChanges(true); // Indicar que hay cambios sin guardar
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

    // Función para cerrar el modal con advertencia si hay cambios sin guardar
    const handleCloseModal = (closeFunction, resetFields) => {
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
            resetFields(); // Limpiar los campos al cerrar
            setHasUnsavedChanges(false); // Resetear cambios no guardados
          }
        });
      } else {
        closeFunction(false);
        resetFields();
      }
    };


{/*************************************************************************************************************************************/}
    const resetNuevoDocumento = () => {
      setNuevoDocumento({ tipo_documento: '', descripcion: '' });
    };
    
    const resetDocumentoToUpdate = () => {
      setTipoDocumentoToUpdate({ tipo_documento: '', descripcion: '' });
    };
    
    
{/***************************************************************************************************************************************/}

const handleCreateDocumento = async () => {
  // Validar el tipo de documento y descripción antes de enviarlos
  const documentoCapitalizado = capitalizeWords(nuevoDocumento.tipo_documento.trim().replace(/\s+/g, ' '));
  const descripcionProcesada = nuevoDocumento.descripcion.trim().replace(/\s+/g, ' ');

  // Validaciones antes de crear
  if (!validateTipoDocumento(documentoCapitalizado, descripcionProcesada)) {
    return;
  }

  try {
    const response = await fetch(`http://localhost:4000/api/tipoDocumento/crearTipoDocumentos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tipo_documento: documentoCapitalizado,  // Usamos el documento validado
        descripcion: descripcionProcesada,    // Usamos la descripción procesada
        estado: 1, // Documento activo por defecto
      }),
    });

    if (response.ok) {
      let result;
      try {
        result = await response.json(); // Intentamos obtener el JSON de la respuesta
      } catch (error) {
        console.warn("La API no devolvió JSON, pero el tipo de documento fue creado.");
        result = {
          tipo_documento: documentoCapitalizado,
          descripcion: descripcionProcesada,
        }; // Asumimos que se creó correctamente
      }

      // Actualiza la lista sin recargar la página
      fetchTipoDocumento(); 
      setModalVisible(false); // Cerrar el modal sin advertencia al guardar
      resetNuevoDocumento(); // Reiniciar el estado del nuevo documento
      setHasUnsavedChanges(false); // Reiniciar el estado de cambios no guardados

      swal.fire({
        icon: 'success',
        title: 'Creación exitosa',
        text: `El tipo de documento ha sido creado correctamente.`,
      });

    } else {
      swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo crear el tipo de documento.',
      });
    }
  } catch (error) {
    console.error('Error al crear el tipo de documento:', error);
    swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Ocurrió un error al intentar crear el tipo de documento.',
    });
  }
};



{/***************************************************************************************************************************************/}

const handleUpdateDocumento = async () => {
  const documentoCapitalizado = capitalizeWords(tipoDocumentoToUpdate.tipo_documento.trim().replace(/\s+/g, ' '));
  const descripcionProcesada = tipoDocumentoToUpdate.descripcion.trim().replace(/\s+/g, ' ');

  if (!validateTipoDocumento(documentoCapitalizado, descripcionProcesada)) {
    return;
  }

  try {
    const response = await fetch(`http://localhost:4000/api/tipoDocumento/actualizarTipoDocumentos/${tipoDocumentoToUpdate.Cod_tipo_documento}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cod_tipo_documento: tipoDocumentoToUpdate.cod_tipo_documento,
        tipo_documento: documentoCapitalizado,
        descripcion: descripcionProcesada, // Incluimos la descripción procesada
        estado: tipoDocumentoToUpdate.estado, // Mantener el estado o modificarlo
      }),
    });

    if (response.ok) {
      fetchTipoDocumento();
      setModalUpdateVisible(false); // Cerrar el modal sin advertencia al guardar
      resetDocumentoToUpdate();
      setHasUnsavedChanges(false); // Reiniciar el estado de cambios no guardados
      swal.fire({
        icon: 'success',
        title: 'Actualización exitosa',
        text: 'El tipo de documento ha sido actualizado correctamente.',
      });
    } else {
      swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo actualizar el tipo de documento.',
      });
    }
  } catch (error) {
    console.error('Error al actualizar el tipo de documento:', error);
    swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Ocurrió un error al intentar actualizar el tipo de documento.',
    });
  }
};


{/***************************************************************************************************************************************/}

const handleDeleteDocumento = async () => {
  try {
    const response = await fetch(
      `http://localhost:4000/api/tipoDocumento/eliminarTipoDocumentos/${encodeURIComponent(tipoDocumentoToDelete.Cod_tipo_documento)}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.ok) {
      fetchTipoDocumento();
      setModalDeleteVisible(false);
      setTipoDocumentoToDelete({});
      swal.fire({
        icon: 'success',
        title: 'Eliminación exitosa',
        text: 'El tipo de documento ha sido eliminado correctamente.',
      });
    } else {
      swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo eliminar el tipo de documento.',
      });
    }
  } catch (error) {
    console.error('Error al eliminar el tipo de documento:', error);
    swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Ocurrió un error al intentar eliminar el tipo de documento.',
    });
  }
};


{/***************************************************************************************************************************************/}

const openUpdateModal = (tipoDocumento) => {
  setTipoDocumentoToUpdate(tipoDocumento);
  setModalUpdateVisible(true);
};

const openDeleteModal = (tipoDocumento) => {
  setTipoDocumentoToDelete(tipoDocumento);
  setModalDeleteVisible(true);
};


{/***************************************************************************************************************************************/}

const toggleEstado = async (tipoDocumento) => {
  const nuevoEstado = tipoDocumento.estado ? 0 : 1;

  try {
    setLoading(true);

    const response = await axios.post('http://localhost:4000/api/tipoDocumento/actualizarEstadoTipoDocumentos', {
      Cod_tipo_documento: tipoDocumento.Cod_tipo_documento,
      estado: nuevoEstado,
    });

    if (response.data.mensaje === 'Estado actualizado exitosamente') {
      // Actualizar el estado correctamente
      setTipoDocumento((prevTipoDocumento) =>
        prevTipoDocumento.map((doc) =>
          doc.Cod_tipo_documento === tipoDocumento.Cod_tipo_documento
            ? { ...doc, estado: nuevoEstado } 
            : doc
        )
      );
    } else {
      console.error('Error al cambiar el estado:', response.data.mensaje);
    }
  } catch (error) {
    console.error('Error al realizar la solicitud:', error);
  } finally {
    setLoading(false);
  }
};

{/***************************************************************************************************************************************/}

const handleSearch = (event) => {
  setSearchTerm(event.target.value);
  setCurrentPage(1);
};

const filteredTipoDocumento = tipoDocumento.filter((tipoDocumento) => 
  (tipoDocumento.tipo_documento &&
    tipoDocumento.tipo_documento.toLowerCase().includes(searchTerm.toLowerCase())) ||
  (tipoDocumento.descripcion &&
    tipoDocumento.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
);

const indexOfLastRecord = currentPage * recordsPerPage;
const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
const currentRecords = filteredTipoDocumento.slice(indexOfFirstRecord, indexOfLastRecord);

const paginate = (pageNumber) => {
  if (pageNumber > 0 && pageNumber <= Math.ceil(filteredTipoDocumento.length / recordsPerPage)) {
    setCurrentPage(pageNumber);
  }
};


{/***************************************************************************************************************************************/}

const ReporteDocumentosPDF = () => {
  const doc = new jsPDF('p', 'mm', 'letter'); // Formato vertical

  if (!filteredTipoDocumento || filteredTipoDocumento.length === 0) {
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
    doc.text('Reporte de Tipos de Documento', pageWidth / 2, 40, { align: 'center' });

    doc.setLineWidth(0.5);
    doc.setDrawColor(0, 102, 51);
    doc.line(10, 45, pageWidth - 10, 45);

    let startY = 50; // Tabla más cerca del encabezado

    doc.autoTable({
      startY: startY,
      margin: { left: (pageWidth - 140) / 2 }, // Centrado horizontal
      head: [['#', 'Tipo de Documento', 'Descripción', 'Estado']],
      body: filteredTipoDocumento.map((tipo, index) => [
        index + 1,
        tipo.tipo_documento?.toUpperCase() || 'N/D',
        tipo.descripcion?.toUpperCase()|| 'Sin descripción',
        tipo.estado === 1 ? 'ACTIVO' : 'INACTIVO'
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
        0: { cellWidth: 15 }, // #
        1: { cellWidth: 50 }, // Tipo de Documento
        2: { cellWidth: 50 }, // Descripción
        3: { cellWidth: 25 } // Estado
      },
      alternateRowStyles: { fillColor: [240, 248, 255] },
      didParseCell: (data) => {
        if (data.section === 'body' && data.column.index === 3) {
          data.cell.styles.textColor = data.cell.raw === 'ACTIVO' ? [0, 128, 0] : [255, 0, 0];
          data.cell.styles.fontStyle = data.cell.raw === 'ACTIVO' ? 'bold' : 'normal';
        }
      }
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
          <title>Reporte de Tipos de Documento</title>
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
            <button class="icon-button" onclick="const a = document.createElement('a'); a.href='${pdfURL}'; a.download='Reporte_TipoDocumentos.pdf'; a.click();">
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

const exportToExcel = () => {
  if (!filteredTipoDocumento || filteredTipoDocumento.length === 0) {
    alert('No hay datos para exportar.');
    return;
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Tipo Documento');

  // 🎯 **Título del documento**
  worksheet.mergeCells('A1:C1');
  worksheet.getCell('A1').value = "SAINT PATRICK'S ACADEMY";
  worksheet.getCell('A1').font = { bold: true, size: 18, color: { argb: '006633' } };
  worksheet.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };

  worksheet.mergeCells('A2:C2');
  worksheet.getCell('A2').value = 'TIPOS DE DOCUMENTO';
  worksheet.getCell('A2').font = { bold: true, size: 16, color: { argb: '006633' } };
  worksheet.getCell('A2').alignment = { horizontal: 'center', vertical: 'middle' };

  // 📌 **Encabezados de la tabla**
  const headerRow = worksheet.addRow(['#', 'Tipo Documento', 'Estado']);
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '006633' } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
  });

  // 📊 **Datos de la tabla**
  filteredTipoDocumento.forEach((tipo, index) => {
    const row = worksheet.addRow([
      index + 1,
      tipo.tipo_documento?.toUpperCase() || 'N/D',
      tipo.estado === 1 ? 'ACTIVO' : 'INACTIVO'
    ]);

    // 🎨 **Estilos para la columna de Estado**
    const estadoCell = row.getCell(3);
    estadoCell.font = {
      bold: true,
      color: { argb: tipo.estado === 1 ? '008000' : 'FF0000' } // ✅ Verde para "ACTIVO", rojo para "INACTIVO"
    };

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

  // 📏 **Ajustar el ancho de las columnas**
  worksheet.columns.forEach((column) => {
    column.width = 20;
  });

  // 📂 **Crear archivo Excel**
  workbook.xlsx.writeBuffer().then((buffer) => {
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, 'Reporte_TipoDocumento.xlsx');
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
    

{/***************************************************************************************************************************************/}

  return (
<CContainer>
  {/* Contenedor del h1 y botón "Nuevo" */}
  <CRow className="align-items-center mb-5">
  <CCol xs="8" md="9">
    {/* Título de la página */}
    <h1 className="mb-0">Mantenimiento de Tipo Documentos</h1>
  </CCol>
  <CCol xs="4" md="3" className="text-end d-flex flex-column flex-md-row justify-content-md-end align-items-md-center">
    {/* Botón Nuevo para abrir el modal */}
    {canInsert && (
      <CButton 
        style={{ backgroundColor: '#4B6251', color: 'white' }} 
        className="mb-3 mb-md-0 me-md-3"
        onClick={() => setModalVisible(true)}
      >
        <CIcon icon={cilPlus} /> Nuevo
      </CButton>
    )}

    {/* Botón de Reporte */}
    <CDropdown>
      <CDropdownToggle
        style={{ backgroundColor: '#6C8E58', color: 'white' }}
      >
        Reportes
      </CDropdownToggle>
      <CDropdownMenu>
        <CDropdownItem onClick={exportToExcel}>Descargar en Excel</CDropdownItem>
        <CDropdownItem onClick={ReporteDocumentosPDF}>Descargar en PDF</CDropdownItem>
      </CDropdownMenu>
    </CDropdown>
  </CCol>
</CRow>

{/* Contenedor de la barra de búsqueda y el selector dinámico */}
<CRow className="align-items-center mt-4 mb-2">
  {/* Barra de búsqueda */}
  <CCol xs="12" md="8" className="d-flex flex-wrap align-items-center">
    <CInputGroup className="me-3" style={{ width: '400px' }}>
      <CInputGroupText>
        <CIcon icon={cilSearch} />
      </CInputGroupText>
      <CFormInput
        placeholder="Buscar tipo de documentos ..."
        value={searchTerm}
        onChange={(e) => {
          let value = e.target.value;

          // 🔄 **Eliminar espacios consecutivos**
          value = value.replace(/\s{2,}/g, ' ');

          // 🔄 **Permitir acentos, pero eliminar otros caracteres especiales**
          value = value.replace(/[^A-Za-zÀ-ÿ0-9\s]/g, '');

          // 🔄 **Bloquear caracteres repetidos más de 10 veces**
          value = value.replace(/(.)\1{10,}/g, '$1'.repeat(10));

          setSearchTerm(value);
        }}
        onPaste={(e) => e.preventDefault()}
        onCopy={(e) => e.preventDefault()}
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

{/**************************************************************************************************************************************/}

<div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #ccc', padding: '10px', marginBottom: '30px' }}>
  {console.log('Current Records:', currentRecords)}
  <CTable striped>
    <CTableHead>
      <CTableRow>
        <CTableHeaderCell style={{ borderRight: '1px solid #ddd' }} className="text-center">#</CTableHeaderCell>
        <CTableHeaderCell style={{ borderRight: '1px solid #ddd' }} className="text-center">Tipo de Documento</CTableHeaderCell>
        <CTableHeaderCell style={{ borderRight: '1px solid #ddd' }} className="text-center">Descripción</CTableHeaderCell>
        <CTableHeaderCell className="text-center">Acciones</CTableHeaderCell>
      </CTableRow>
    </CTableHead>
    <CTableBody>
      {currentRecords.map((tipoDocumento) => (
        <CTableRow key={tipoDocumento.Cod_tipo_documento}>
          <CTableDataCell style={{ borderRight: '1px solid #ddd' }} className="text-center">{tipoDocumento.originalIndex}</CTableDataCell>
          <CTableDataCell style={{ borderRight: '1px solid #ddd' }} className="text-center">
            {tipoDocumento.tipo_documento.toUpperCase()}
          </CTableDataCell>
          <CTableDataCell style={{ borderRight: '1px solid #ddd' }} className="text-center">
            {tipoDocumento.descripcion.toUpperCase()}
          </CTableDataCell>
          <CTableDataCell className="text-center">
            <div className="d-flex justify-content-center">
              {canUpdate && (
                <CButton
                  color="warning"
                  onClick={() => openUpdateModal(tipoDocumento)}
                  style={{ marginRight: '10px' }}
                  disabled={tipoDocumento.estado === 0}
                  title={tipoDocumento.estado ? 'Editar documento' : 'Documento inactivo'}
                >
                  <CIcon icon={cilPen} />
                </CButton>
              )}
              {canDelete && (
                <CButton color="danger" onClick={() => openDeleteModal(tipoDocumento)}>
                  <CIcon icon={cilTrash} />
                </CButton>
              )}
              <CButton
                style={{
                  backgroundColor: tipoDocumento.estado ? '#4CAF50' : '#F44336',
                  color: 'white',
                  marginLeft: '10px',
                }}
                onClick={() => toggleEstado(tipoDocumento)}
                disabled={loading}
              >
                {loading ? 'Cambiando...' : tipoDocumento.estado ? 'Activo' : 'Inactivo'}
              </CButton>
            </div>
          </CTableDataCell>
        </CTableRow>
      ))}
    </CTableBody>
  </CTable>
</div>

{/**************************************************************************************************************************************/}
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
      disabled={currentPage === Math.ceil(filteredTipoDocumento.length / recordsPerPage)} // Desactiva si es la última página
      onClick={() => paginate(currentPage + 1)} // Páginas siguientes
    >
      Siguiente
    </CButton>
  </CPagination>
  <span style={{ marginLeft: '10px' }}>
    Página {currentPage} de {Math.ceil(filteredTipoDocumento.length / recordsPerPage)}
  </span>
</div>

{/**************************************************************************************************************************************/}

<CModal visible={modalVisible} backdrop="static" size="lg"> {/* Hacemos el modal más grande */}
  <CModalHeader closeButton={false}>
    <CModalTitle>Nuevo tipo de documento</CModalTitle> {/* Manteniendo título consistente en formato adecuado */}
    <CButton className="btn-close" aria-label="Close" onClick={() => handleCloseModal(setModalVisible, resetNuevoDocumento)} />
  </CModalHeader>

  <CModalBody style={{ padding: '20px' }}> {/* Mayor espacio en el contenido */}
    <CForm>
      {/* Campo para Tipo Documento */}
      <CInputGroup className="mb-4"> {/* Aumentamos el espacio entre campos */}
        <CInputGroupText>Tipo documento</CInputGroupText>
        <CFormInput
          type="text"
          placeholder="ingrese un nuevo tipo de documento" 
          maxLength={50}
          onPaste={disableCopyPaste}
          onCopy={disableCopyPaste}
          value={nuevoDocumento.tipo_documento}

          onChange={(e) => handleTipoDocumentoInputChange(e, setNuevoDocumento, setDocumentoError)}
          onBlur={isDuplicateTipoDocumento}
          onKeyDown={handleTipoDocumentoKeyDown}
          style={{
            textTransform: 'uppercase',  // Convierte el texto ingresado a mayúsculas
            color: 'black',  // Texto ingresado en negro
            fontSize: '1rem',  // Ajuste para mejor lectura
          }}
        />
      </CInputGroup>
      {documentoError && (
        <p style={{ color: 'red', fontSize: '0.9em' }}>{documentoError}</p>
      )}

      {/* Campo para Descripción */}
      <CInputGroup className="mb-4"> {/* Espacio uniforme entre los campos */}
        <CInputGroupText>Descripción</CInputGroupText>
        <CFormInput
          type="text"
          placeholder="ingrese una descripción"
          maxLength={100}
          onPaste={disableCopyPaste}
          onCopy={disableCopyPaste}
          value={nuevoDocumento.descripcion}
          onChange={(e) => handleDescripcionInputChange(e, setNuevoDocumento)}
          onKeyDown={handleDescripcionKeyDown} // 🚫 Bloquea caracteres desde el teclado
          style={{
            textTransform: 'uppercase',  // Convierte texto ingresado a mayúsculas
            color: 'black',  // Texto ingresado en negro
          }}
        />

      </CInputGroup>
    </CForm>
  </CModalBody>
  <CModalFooter>
  <CButton color="secondary" onClick={() => handleCloseModal(setModalVisible, resetNuevoDocumento)}>
    Cancelar
  </CButton>
  <CButton
  style={{
    backgroundColor: '#4B6251', 
    color: 'white',
    opacity: '1', // 🔥 Mantiene el color sólido en todo momento
    cursor: !!documentoError || !nuevoDocumento.tipo_documento || !nuevoDocumento.descripcion ? 'not-allowed' : 'pointer',
  }}
  onClick={handleCreateDocumento}
  disabled={!!documentoError || !nuevoDocumento.tipo_documento || !nuevoDocumento.descripcion}
>
  <CIcon icon={cilSave} style={{ marginRight: '5px' }} /> Guardar
</CButton>


</CModalFooter>

</CModal>

{/**************************************************************************************************************************************/}

<CModal visible={modalUpdateVisible} backdrop="static" size="lg">
  <CModalHeader closeButton={false}>
    <CModalTitle>Actualizar tipo de documento</CModalTitle>
    <CButton className="btn-close" aria-label="Close" onClick={() => handleCloseModal(setModalUpdateVisible, resetDocumentoToUpdate)} />
  </CModalHeader>

  <CModalBody style={{ padding: '20px' }}>
    <CForm>
      {/* Campo para Tipo Documento */}
      <CInputGroup className="mb-4">
        <CInputGroupText>Tipo documento</CInputGroupText>
        <CFormInput
          type="text"
          placeholder="ingrese el tipo de documento"
          maxLength={50}
          onPaste={disableCopyPaste}
          onCopy={disableCopyPaste}
          value={tipoDocumentoToUpdate.tipo_documento}
          onChange={(e) => handleTipoDocumentoInputChange(e, setTipoDocumentoToUpdate)}
          onKeyDown={handleTipoDocumentoKeyDown}
          style={{
            textTransform: 'uppercase',
            color: 'black',
            fontSize: '1rem',
          }}
        />
      </CInputGroup>
      {documentoError && <p style={{ color: 'red', fontSize: '0.9em' }}>{documentoError}</p>}

      {/* Campo para Descripción */}
      <CInputGroup className="mb-4">
        <CInputGroupText>Descripción</CInputGroupText>
        <CFormInput
          type="text"
          placeholder="ingrese la descripción"
          maxLength={100}
          onPaste={disableCopyPaste}
          onCopy={disableCopyPaste}
          value={tipoDocumentoToUpdate.descripcion}
          onChange={(e) => handleDescripcionInputChange(e, setTipoDocumentoToUpdate)}
          onKeyDown={handleTipoDocumentoKeyDown}
          style={{
            textTransform: 'uppercase',
            color: 'black',
            fontSize: '1rem',
          }}
        />
      </CInputGroup>
    </CForm>
  </CModalBody>

  <CModalFooter>
  <CButton color="secondary" onClick={() => handleCloseModal(setModalUpdateVisible, resetDocumentoToUpdate)}>
    Cancelar
  </CButton>
  <CButton
    style={{ backgroundColor: '#4B6251', color: 'white' }} // Se mantiene el color original
    onClick={handleUpdateDocumento}
    disabled={!!documentoError || !tipoDocumentoToUpdate.tipo_documento || !tipoDocumentoToUpdate.descripcion}
  >
    <CIcon icon={cilSave} style={{ marginRight: '5px' }} /> Guardar
  </CButton>
</CModalFooter>

</CModal>



{/**************************************************************************************************************************************/}

{/* Modal Eliminar Documento */}
<CModal visible={modalDeleteVisible} onClose={() => setModalDeleteVisible(false)} backdrop="static">
  <CModalHeader>
    <CModalTitle>Eliminar Tipo Documento</CModalTitle>
  </CModalHeader>
  <CModalBody>
    ¿Estás seguro de que deseas eliminar el tipo de documento "{tipoDocumentoToDelete.tipo_documento}" con descripción "{tipoDocumentoToDelete.descripcion}"?
  </CModalBody>
  <CModalFooter>
    <CButton color="secondary" onClick={() => setModalDeleteVisible(false)}>
      Cancelar
    </CButton>
    <CButton color="danger" onClick={handleDeleteDocumento}>
      Eliminar
    </CButton>
  </CModalFooter>
</CModal>

{/**************************************************************************************************************************************/}
</CContainer>
  );
};

export default ListaTipoDocumentos;