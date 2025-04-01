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
          const dataWithIndex = data.map((tipoDocumento, index) => ({
            ...tipoDocumento,
            originalIndex: index + 1,
          }));
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
      text: 'No se permite que la misma letra se repita más de 4 veces consecutivas.',
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

// Función para controlar la entrada de texto en descripcion
const handleDescripcionInputChange = (e, setFunction) => {
  let value = e.target.value;

  // No permitir más de un espacio consecutivo
  value = value.replace(/\s{2,}/g, ' ');

  // Validar longitud mínima
  if (value.length < 10) {
    setDocumentoError('La descripción debe tener al menos 10 caracteres.');
  } else {
    setDocumentoError(''); // No hay error
  }

  setFunction((prevState) => ({
    ...prevState,
    descripcion: value,
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
    const response = await fetch(`http://localhost:4000/api/tipoDocumento/crearTipoDocumento`, {
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
    const response = await fetch(`http://localhost:4000/api/tipoDocumento/actualizarTipoDocumento/${tipoDocumentoToUpdate.cod_tipo_documento}`, {
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
      `http://localhost:4000/api/tipoDocumento/eliminarTipoDocumento/${encodeURIComponent(tipoDocumentoToDelete.cod_tipo_documento)}`,
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

    const response = await axios.post('http://localhost:4000/api/tipoDocumento/actualizarEstadoTipoDocumento', {
      cod_tipo_documento: tipoDocumento.cod_tipo_documento,
      estado: nuevoEstado,
    });

    if (response.data.mensaje === 'Estado actualizado exitosamente') {
      // Actualizar el estado correctamente
      setTipoDocumento((prevTipoDocumento) =>
        prevTipoDocumento.map((doc) =>
          doc.cod_tipo_documento === tipoDocumento.cod_tipo_documento
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
  const doc = new jsPDF('p', 'mm', 'letter'); 
  
  if (!filteredTipoDocumento || filteredTipoDocumento.length === 0) {
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

    // Subtítulo
    doc.setFontSize(14);
    doc.setTextColor(0, 102, 51);
    doc.text('Reporte de Tipos de Documento', pageWidth / 2, 50, { align: 'center' });

    doc.setLineWidth(0.5);
    doc.setDrawColor(0, 102, 51);
    doc.line(10, 60, pageWidth - 10, 60);

    // Datos de la tabla (agregar descripcion)
    const tableRows = filteredTipoDocumento.map((tipo, index) => ({
      index: (index + 1).toString(),
      tipo_documento: tipo.tipo_documento?.toUpperCase() || 'N/D',
      descripcion: tipo.descripcion || 'Sin descripción',
    }));

    const columnWidths = {
      index: 15, // Ancho de la columna #
      tipo_documento: 65, // Ancho de la columna "Tipo Documento"
      descripcion: 90 // Ancho de la columna "Descripción"
    };
    const tableWidth = columnWidths.index + columnWidths.tipo_documento + columnWidths.descripcion;

    doc.autoTable({
      startY: 65,
      margin: { left: (pageWidth - tableWidth) / 2 }, // Centrar la tabla
      columns: [
        { header: '#', dataKey: 'index' },
        { header: 'Tipo de Documento', dataKey: 'tipo_documento' },
        { header: 'Descripción', dataKey: 'descripcion' },
      ],
      body: tableRows,
      headStyles: {
        fillColor: [0, 102, 51],
        textColor: [255, 255, 255],
        fontSize: 9,
        halign: 'center',
      },
      styles: {
        fontSize: 7,
        cellPadding: 4,
      },
      columnStyles: {
        index: { cellWidth: columnWidths.index },
        tipo_documento: { cellWidth: columnWidths.tipo_documento },
        descripcion: { cellWidth: columnWidths.descripcion },
      },
      alternateRowStyles: {
        fillColor: [240, 248, 255],
      },
      didDrawPage: (data) => {
        const pageCount = doc.internal.getNumberOfPages();
        const pageCurrent = doc.internal.getCurrentPageInfo().pageNumber;

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

    const pdfBlob = doc.output('blob');
    const pdfURL = URL.createObjectURL(pdfBlob);

    const newWindow = window.open('', '_blank');
    newWindow.document.write(`
      <html>
        <head><title>Reporte de Tipos de Documento</title></head>
        <body style="margin:0;">
          <iframe width="100%" height="100%" src="${pdfURL}" frameborder="0"></iframe>
          <div style="position:fixed;top:10px;right:20px;">
            <button style="background-color: #6c757d; color: white; border: none; padding: 10px 15px; border-radius: 5px; cursor: pointer;" 
              onclick="const a = document.createElement('a'); a.href='${pdfURL}'; a.download='Reporte_TipoDocumentos.pdf'; a.click();">
              Descargar PDF
            </button>
            <button style="background-color: #6c757d; color: white; border: none; padding: 10px 15px; border-radius: 5px; cursor: pointer;" 
              onclick="window.print();">
              Imprimir PDF
            </button>
          </div>
        </body>
      </html>`);
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

  // Título del documento
  worksheet.mergeCells('A1:B1');
  worksheet.getCell('A1').value = "SAINT PATRICK'S ACADEMY";
  worksheet.getCell('A1').font = { bold: true, size: 18, color: { argb: '006633' } };
  worksheet.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };

  worksheet.mergeCells('A2:B2');
  worksheet.getCell('A2').value = 'TIPOS DE DOCUMENTO';
  worksheet.getCell('A2').font = { bold: true, size: 16, color: { argb: '006633' } };
  worksheet.getCell('A2').alignment = { horizontal: 'center', vertical: 'middle' };

  // Encabezados de la tabla
  const headerRow = worksheet.addRow(['#', 'Tipo Documento']);
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '006633' } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
  });

  // Datos de la tabla (Usamos filteredTipoDocumento en lugar de tipoRelacion)
  filteredTipoDocumento.forEach((tipo, index) => {
    const row = worksheet.addRow([
      index + 1,
      typeof tipo.tipo_documento === 'string' ? tipo.tipo_documento.toUpperCase() : tipo.tipo_documento
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
    column.width = 20;
  });

  // Crear archivo Excel
  workbook.xlsx.writeBuffer().then((buffer) => {
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, 'Reporte_TipoDocumento.xlsx');
  });
};


{/***************************************************************************************************************************************/}


{/***************************************************************************************************************************************/}


{/***************************************************************************************************************************************/}


{/***************************************************************************************************************************************/}


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
        placeholder="Buscar tipo documento..."
        onChange={handleSearch}
        value={searchTerm}
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

  {/* Tabla para mostrar tipos de documento */}
  <div className="table-container" style={{ maxHeight: '400px', overflowY: 'scroll', marginBottom: '20px' }}>
    <CTable striped bordered hover>
      <CTableHead>
        <CTableRow>
          <CTableHeaderCell style={{ width: '50px' }}>#</CTableHeaderCell>
          <CTableHeaderCell style={{ width: '150px' }}>Tipo de Documento</CTableHeaderCell>
          <CTableHeaderCell style={{ width: '200px' }}>Descripción</CTableHeaderCell>
          <CTableHeaderCell style={{ width: '50px' }}>Estado</CTableHeaderCell>
          <CTableHeaderCell style={{ width: '50px' }}>Acciones</CTableHeaderCell>
        </CTableRow>
      </CTableHead>
      <CTableBody>
        {currentRecords.map((tipoDocumento) => (
          <CTableRow key={tipoDocumento.Cod_tipo_documento}>
            <CTableDataCell>
              {/* Mostrar el índice original en lugar del índice basado en la paginación */}
              {tipoDocumento.originalIndex} 
            </CTableDataCell>
            <CTableDataCell>{tipoDocumento.tipo_documento}</CTableDataCell>
            <CTableDataCell>{tipoDocumento.descripcion}</CTableDataCell>
            <CTableDataCell>{tipoDocumento.estado_documento === 1 ? 'Activo' : 'Inactivo'}</CTableDataCell>
            <CTableDataCell>
              {canUpdate && (
                <CButton style={{ backgroundColor: '#F9B64E', marginRight: '10px' }} onClick={() => openUpdateModal(tipoDocumento)}>
                  <CIcon icon={cilPen} />
                </CButton>
              )}

              {canDelete && (
                <CButton style={{ backgroundColor: '#E57368', marginRight: '10px' }} onClick={() => openDeleteModal(tipoDocumento)}>
                  <CIcon icon={cilTrash} />
                </CButton>
              )}
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

<CModal visible={modalVisible} backdrop="static">
  <CModalHeader closeButton={false}>
    <CModalTitle>Ingresar Nuevo Tipo de Documento</CModalTitle>
    <CButton className="btn-close" aria-label="Close" onClick={() => handleCloseModal(setModalVisible, resetNuevoDocumento)} />
  </CModalHeader>
  <CModalBody>
    <CForm>
      {/* Campo para Tipo Documento */}
      <CInputGroup className="mb-3">
        <CInputGroupText>Tipo Documento</CInputGroupText>
        <CFormInput
          type="text"
          placeholder="Ingrese un nuevo tipo de documento"
          maxLength={50}
          onPaste={disableCopyPaste}
          onCopy={disableCopyPaste}
          value={nuevoDocumento.tipo_documento}
          onChange={(e) => handleTipoDocumentoInputChange(e, setNuevoDocumento, setDocumentoError)}
          onBlur={isDuplicateTipoDocumento}
          style={{ textTransform: 'uppercase' }}
        />
      </CInputGroup>
      {documentoError && (
        <p style={{ color: 'red', fontSize: '0.9em' }}>{documentoError}</p>
      )}

      {/* Campo para Descripción */}
      <CInputGroup className="mb-3">
        <CInputGroupText>Descripción</CInputGroupText>
        <CFormInput
          type="text"
          placeholder="Ingrese una descripción"
          maxLength={100}
          onPaste={disableCopyPaste}
          onCopy={disableCopyPaste}
          value={nuevoDocumento.descripcion}
          onChange={(e) => handleDescripcionInputChange(e, setNuevoDocumento)}
          style={{ textTransform: 'capitalize' }}
        />
      </CInputGroup>
    </CForm>
  </CModalBody>
  <CModalFooter>
    <CButton color="secondary" onClick={() => handleCloseModal(setModalVisible, resetNuevoDocumento)}>
      Cancelar
    </CButton>
    <CButton
      style={{ backgroundColor: '#4B6251', color: 'white' }}
      onClick={handleCreateDocumento}
      disabled={!!documentoError || !nuevoDocumento.tipo_documento || !nuevoDocumento.descripcion}
    >
      <CIcon icon={cilSave} style={{ marginRight: '5px' }} /> Guardar
    </CButton>
  </CModalFooter>
</CModal>


{/**************************************************************************************************************************************/}

<CModal visible={modalUpdateVisible} backdrop="static">
  <CModalHeader closeButton={false}>
    <CModalTitle>Actualizar Tipo Documento</CModalTitle>
    <CButton className="btn-close" aria-label="Close" onClick={() => handleCloseModal(setModalUpdateVisible, resetDocumentoToUpdate)} />
  </CModalHeader>
  <CModalBody>
    <CForm>
      {/* Campo para Tipo Documento */}
      <CInputGroup className="mb-3">
        <CInputGroupText>Tipo Documento</CInputGroupText>
        <CFormInput
          type="text"
          placeholder="Ingrese el tipo de documento"
          maxLength={50}
          onPaste={disableCopyPaste}
          onCopy={disableCopyPaste}
          value={tipoDocumentoToUpdate.tipo_documento}
          onChange={(e) => handleTipoDocumentoInputChange(e, setTipoDocumentoToUpdate)}
          style={{ textTransform: 'uppercase' }}
        />
      </CInputGroup>
      {documentoError && <p style={{ color: 'red' }}>{documentoError}</p>}

      {/* Campo para Descripción */}
      <CInputGroup className="mb-3">
        <CInputGroupText>Descripción</CInputGroupText>
        <CFormInput
          type="text"
          placeholder="Ingrese la descripción"
          maxLength={100}
          onPaste={disableCopyPaste}
          onCopy={disableCopyPaste}
          value={tipoDocumentoToUpdate.descripcion}
          onChange={(e) => handleDescripcionInputChange(e, setTipoDocumentoToUpdate)}
          style={{ textTransform: 'capitalize' }}
        />
      </CInputGroup>
    </CForm>
  </CModalBody>
  <CModalFooter>
    <CButton color="secondary" onClick={() => handleCloseModal(setModalUpdateVisible, resetDocumentoToUpdate)}>
      Cancelar
    </CButton>
    <CButton
      style={{ backgroundColor: '#4B6251', color: 'white' }}
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