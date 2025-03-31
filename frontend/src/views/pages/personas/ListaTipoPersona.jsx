import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Asegúrate de instalar axios si no lo tienes
import { cilSearch, cilBrushAlt, cilPen, cilTrash, cilPlus, cilSave, cilFile } from '@coreui/icons';
import { CIcon } from '@coreui/icons-react';
import ExcelJS from 'exceljs';
import swal from 'sweetalert2';
import { saveAs } from 'file-saver';
import {
  CButton,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CPagination,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CFormSelect,
  CRow,
  CCol,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
} from '@coreui/react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import logo from 'src/assets/brand/logo_saint_patrick.png'; // Ruta del logo

import usePermission from '../../../../context/usePermission';
import AccessDenied from "../AccessDenied/AccessDenied"

const TipoPersona = () => {
  const {canSelect, canUpdate, canDelete, canInsert } = usePermission('tipopersona');

  const [tipoPersona, setTipoPersona] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tipoPersonaError, setTipoPersonaError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTipos, setFilteredTipos] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [modalUpdateVisible, setModalUpdateVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [nuevoTipoPersona, setNuevoTipoPersona] = useState({ Cod_tipo_persona: '', Tipo_persona: '', estado: 1 });
  const [tipoPersonaToUpdate, setTipoPersonaToUpdate] = useState({});
  const [tipoPersonaToDelete, setTipoPersonaToDelete] = useState({});
  const [modalDeleteVisible, setModalDeleteVisible] = useState(false); 
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [recordsPerPage, setRecordsPerPage] = useState(5);






  
  useEffect(() => {
    obtenerTiposPersona();
  }, []);

  


{/*************************************************************************************************************************************/}
// Función para obtener los tipos de persona
const obtenerTiposPersona = async () => {
  try {
    const response = await fetch('http://localhost:4000/api/tipoPersona/verTodoTipoPersona');
    const data = await response.json();
    if (response.ok) {
      setTipoPersona(data);
      setFilteredTipos(data);
    } else {
      throw new Error(data.message || 'Error al obtener los tipos de persona');
    }
  } catch (error) {
    setErrorMensaje(error.message);
  } finally {
    setLoading(false);
  }
};

{/*************************************************************************************************************************************/}


{/*************************************************************************************************************************************/}
const validateTipoPersona = (tipoPersona) => {
  const regex = /^[a-zA-ZÁÉÍÓÚáéíóúÑñ\s]*$/;
  const noMultipleSpaces = !/\s{2,}/.test(tipoPersona); // No permite más de un espacio consecutivo
  const trimmedTipoPersona = tipoPersona.trim().replace(/\s+/g, ' ');

  if (!regex.test(trimmedTipoPersona)) {
    swal.fire({
      icon: 'warning',
      title: 'Tipo de Persona Inválido',
      text: 'El tipo de persona solo puede contener letras y espacios.',
    });
    return false;
  }

  if (!noMultipleSpaces) {
    swal.fire({
      icon: 'warning',
      title: 'Espacios múltiples',
      text: 'No se permite más de un espacio entre palabras.',
    });
    return false;
  }

  // Validar que ninguna letra se repita más de 4 veces seguidas
  const words = trimmedTipoPersona.split(' ');
  for (let word of words) {
    const letterCounts = {};
    for (let letter of word) {
      letterCounts[letter] = (letterCounts[letter] || 0) + 1;
      if (letterCounts[letter] > 4) {
        swal.fire({
          icon: 'warning',
          title: 'Repetición de letras',
          text: `La letra "${letter}" se repite más de 4 veces en la palabra "${word}".`,
        });
        return false;
      }
    }
  }

  return true;
};

{/*************************************************************************************************************************************/}

const capitalizeWords = (str) => {
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
};


{/*************************************************************************************************************************************/}

const isDuplicateTipoPersona = () => {
  const { Tipo_persona } = nuevoTipoPersona; // Cambiado a Tipo_persona
  const existingTipoPersona = tipoPersona.find(
    (tipo) =>
      tipo.Tipo_persona.toLowerCase() === Tipo_persona.toLowerCase()
  );

  if (existingTipoPersona) {
    swal.fire({
      icon: 'warning',
      title: 'Tipo de Persona Duplicado',
      text: 'Ya existe un tipo de persona con el mismo nombre.',
    });

    // Actualizar el estado de error si hay duplicados
    setTipoPersonaError('Ya existe un tipo de persona con el mismo nombre');
    return true;
  }

  // Limpiar errores si no hay duplicados
  setTipoPersonaError('');
  return false;
};



{/*************************************************************************************************************************************/}

const handleTipoPersonaInputChange = (e, setFunction) => {
  let value = e.target.value;

  // No permitir más de un espacio consecutivo
  value = value.replace(/\s{2,}/g, ' ');

  // No permitir que una letra se repita más de 4 veces consecutivamente
  const wordArray = value.split(' ');
  const isValid = wordArray.every(word => !/(.)\1{2,}/.test(word));

  if (!isValid) {
    swal.fire({
      icon: 'warning',
      title: 'Repetición de letras',
      text: 'No se permite que la misma letra se repita más de 4 veces consecutivas.',
    });
    setTipoPersonaError('Repetición de letras no permitida.');
    return;
  }

  // Validar que el valor tenga más de 2 letras
  if (value.length <= 2) {
    setTipoPersonaError('El tipo de persona debe tener más de 2 letras.');
  } else {
    setTipoPersonaError(''); // No hay error
  }

  // Actualizar el estado con el valor modificado
  setFunction((prevState) => ({
    ...prevState,
    Tipo_persona: value,
  }));

  setHasUnsavedChanges(true); // Marcar que hay cambios no guardados
};


{/*************************************************************************************************************************************/}
  const disableCopyPaste = (e) => {
    e.preventDefault();
    swal.fire({
      icon: 'warning',
      title: 'Acción bloqueada',
      text: 'Copiar y pegar no está permitido.',
    });
  };

const resetNuevoTipoPersona = () => {
  setNuevoTipoPersona({ Tipo_persona: '' });
};

const resetTipoPersonaToUpdate = () => {
  setTipoPersonaToUpdate({
    Cod_tipo_persona: '', // Reinicia el código del tipo de persona
    Tipo_persona: '', // Limpia el campo Tipo_persona
    estado: 1, // Puedes ajustar si el estado requiere reinicio (por ejemplo, 1 para activo)
  });
};


{/**************************************************************************************************************************************/}
const handleCreateTipoPersona = async () => {
  // Normalizar y validar el tipo de persona antes de enviarlo
  const tipoCapitalizado = capitalizeWords(nuevoTipoPersona.Tipo_persona.trim().replace(/\s+/g, ' '));

  // Validaciones antes de crear
  if (!validateTipoPersona(tipoCapitalizado)) {
    return;
  }

  if (!validateEmptyFields()) {
    return;
  }

  try {
    const response = await fetch('http://localhost:4000/api/tipoPersona/crearTipoPersona', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tipo_persona: tipoCapitalizado, // Usamos el tipo validado
        estado: 1, // Activo por defecto
      }),
    });

    if (response.ok) {
      let result;
      try {
        result = await response.json(); // Intentamos obtener el JSON de la respuesta
      } catch (error) {
        console.warn("La API no devolvió JSON, pero el tipo de persona fue creado.");
        result = { Tipo_persona: tipoCapitalizado }; // Asumimos que se creó correctamente
      }

      // Actualiza la lista sin recargar la página
      obtenerTiposPersona(); 
      setModalVisible(false); // Cerrar el modal sin advertencia al guardar
      resetNuevoTipoPersona(); // Reiniciar el estado del nuevo tipo de persona
      setHasUnsavedChanges(false); // Reiniciar el estado de cambios no guardados

      swal.fire({
        icon: 'success',
        title: 'Creación exitosa',
        text: `El tipo de persona ha sido creado correctamente.`,
      });

    } else {
      swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo crear el tipo de persona.',
      });
    }
  } catch (error) {
    console.error('Error al crear el tipo de persona:', error);
    swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Ocurrió un error al intentar crear el tipo de persona.',
    });
  }
};



{/*************************************************************************************************************************************/}
const handleUpdateTipoPersona = async () => {
  const tipoCapitalizado = capitalizeWords(tipoPersonaToUpdate.Tipo_persona.trim().replace(/\s+/g, ' '));

    // Validaciones antes de crear
    if (!validateTipoPersona(tipoCapitalizado)) {
      return;
    }

  try {
    const response = await fetch(`http://localhost:4000/api/tipoPersona/actualizarTipoPersona/${tipoPersonaToUpdate.Cod_tipo_persona}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        Cod_tipo_persona: tipoPersonaToUpdate.Cod_tipo_persona,
        Tipo_persona: tipoCapitalizado,
        estado: tipoPersonaToUpdate.estado,
      }),
    });

    if (response.ok) {
      obtenerTiposPersona(); // Actualizar la lista
      setModalUpdateVisible(false); // Cerrar el modal sin advertencia
      resetTipoPersonaToUpdate(); // Restablecer los valores del formulario
      setHasUnsavedChanges(false); // Reiniciar el estado de cambios no guardados
      swal.fire({
        icon: 'success',
        title: 'Actualización exitosa',
        text: 'El tipo de persona ha sido actualizado correctamente.',
      });
    } else {
      swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo actualizar el tipo de persona.',
      });
    }
  } catch (error) {
    console.error('Error al actualizar el tipo de persona:', error);
  }
};

{/***********************************************************************************************************************************/}
const handleDeleteTipoPersona = async () => {
  try {
    const response = await fetch(
      `http://localhost:4000/api/tipoPersona/eliminarTipoPersona/${encodeURIComponent(tipoPersonaToDelete.Cod_tipo_persona)}`, // Actualizado para Tipo de Persona
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.ok) {
      obtenerTiposPersona(); // Llama a la función para actualizar la lista de tipos de persona
      setModalDeleteVisible(false); // Cierra el modal de eliminación
      setTipoPersonaToDelete({}); // Limpia el estado de tipoPersonaToDelete
      swal.fire({
        icon: 'success',
        title: 'Eliminación exitosa',
        text: 'El tipo de persona ha sido eliminado correctamente.',
      });
    } else {
      swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo eliminar el tipo de persona.',
      });
    }
  } catch (error) {
    console.error('Error al eliminar el tipo de persona:', error);
    swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Ocurrió un problema al intentar eliminar el tipo de persona.',
    });
  }
};


  {/**************************************************************************************************************************************/}

 const openUpdateModal = (tipoPersona) => {
  setTipoPersonaToUpdate(tipoPersona); // Cambiado para TipoPersona
  setModalUpdateVisible(true); // Abre el modal de actualización
};

const openDeleteModal = (tipoPersona) => {
  setTipoPersonaToDelete(tipoPersona); // Cambiado para TipoPersona
  setModalDeleteVisible(true); // Abre el modal de eliminación
};



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


  {/**********************************************************************************************************************************/}

  const toggleEstado = async (tipoPersona) => {
    const nuevoEstado = tipoPersona.estado ? 0 : 1;
    
    // Actualizar el estado inmediatamente para reflejar el cambio visualmente
    setTipoPersona((prevTipoPersona) =>
      prevTipoPersona.map((persona) =>
        persona.Cod_tipo_persona === tipoPersona.Cod_tipo_persona
          ? { ...persona, estado: nuevoEstado }
          : persona
      )
    );
  
    try {
      setLoading(true); // Indicar que está cargando
  
      // Realizamos la solicitud a la API para actualizar el estado del tipo de persona
      const response = await axios.post('http://localhost:4000/api/tiPopersona/actualizarEstadoTipoPersona', {
        cod_tipo_persona: tipoPersona.Cod_tipo_persona,
        estado: nuevoEstado,
      });

    } catch (error) {
      console.error('Error al realizar la solicitud:', error);
      // Si hay un error, revertimos el estado
      setTiposPersona((prevTiposPersona) =>
        prevTiposPersona.map((persona) =>
          persona.Cod_tipo_persona === tipoPersona.Cod_tipo_persona
            ? { ...persona, estado: tipoPersona.estado }
            : persona
        )
      );
    } finally {
      setLoading(false);
      obtenerTiposPersona(true); // Terminar el estado de carga
    }
  };
  
  
  {/**********************************************************************************************************************************/}
  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };
  
  const filteredTipoPersona = Array.isArray(tipoPersona) 
  ? tipoPersona.filter((tipoPersona) =>
      tipoPersona.Tipo_persona &&
      tipoPersona.Tipo_persona.toLowerCase().includes(searchTerm.toLowerCase())
    )
  : [];
  
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredTipoPersona.slice(indexOfFirstRecord, indexOfLastRecord);
  
  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= Math.ceil(filteredTipoPersona.length / recordsPerPage)) {
      setCurrentPage(pageNumber);
    }
  };

  
  
  

  {/***********************************************************************************************************************************/}
  const exportToPDF = () => {
    const doc = new jsPDF({
      orientation: 'portrait',  // Vertical
      unit: 'mm',
      format: 'a4',
    });
  
    if (!filteredTipoPersona || filteredTipoPersona.length === 0) {
      alert('No hay datos para exportar.');
      return;
    }
  
    const img = new Image();
    img.src = logo;
  
    img.onload = () => {
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
  
      // Logo
      doc.addImage(img, 'PNG', 10, 10, 45, 45);
  
      // Encabezado principal
      doc.setFontSize(18);
      doc.setTextColor(0, 102, 51); // Verde
      doc.text("SAINT PATRICK'S ACADEMY", pageWidth / 2, 24, { align: 'center' });
  
      // Información de contacto
      doc.setFontSize(10);
      doc.setTextColor(100); // Gris
      doc.text('Casa Club del periodista, Colonia del Periodista', pageWidth / 2, 32, { align: 'center' });
      doc.text('Teléfono: (504) 2234-8871', pageWidth / 2, 37, { align: 'center' });
      doc.text('Correo: info@saintpatrickacademy.edu', pageWidth / 2, 42, { align: 'center' });
  
      // Título del reporte
      doc.setFontSize(14);
      doc.setTextColor(0, 102, 51); // Verde
      doc.text('Reporte de Tipos de Persona', pageWidth / 2, 50, { align: 'center' });
  
      // Línea divisoria
      doc.setLineWidth(0.5);
      doc.setDrawColor(0, 102, 51); // Verde
      doc.line(10, 55, pageWidth - 10, 55);
  
      // Tabla de datos: Usar datos filtrados
      doc.autoTable({
        startY: 70, // Posición inicial vertical
        head: [['#', 'Tipo de Persona']],
        body: filteredTipoPersona.map((tipo, index) => [
          { content: (index + 1).toString(), styles: { halign: 'center', valign: 'middle', fontSize: 10 } },
          { content: tipo.Tipo_persona.toUpperCase(), styles: { halign: 'center', valign: 'middle', fontSize: 10 } },
        ]),
        headStyles: {
          fillColor: [0, 102, 51], // Verde
          textColor: [255, 255, 255], // Blanco
          fontSize: 10,
          halign: 'center', // Centrado
        },
        styles: {
          fontSize: 10,
          cellPadding: 3,
          minCellWidth: 20,
        },
        alternateRowStyles: {
          fillColor: [240, 248, 255], // Azul claro
        },
        columnStyles: {
          0: { halign: 'center', cellWidth: 10 },
          1: { halign: 'center', cellWidth: 50 },
        },
        margin: { top: 70 }, // Ajustamos los márgenes para no interferir con otros elementos
        tableWidth: 'wrap', // Hace que la tabla se ajuste a su contenido
      });
  
      const tablePosition = (pageWidth - doc.autoTable.previous.finalWidth) / 2;
      doc.autoTable.previous.settings.margin.left = tablePosition; // Centramos la tabla en el eje X
  
      // Pie de página
      const pageCount = doc.internal.getNumberOfPages();
      const pageCurrent = doc.internal.getCurrentPageInfo().pageNumber;
  
      doc.setFontSize(10);
      doc.setTextColor(0, 102, 51); // Verde
      doc.text(
        `Página ${pageCurrent} de ${pageCount}`,
        pageWidth - 10,
        pageHeight - 10,
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
      doc.text(`Fecha de generación: ${dateString} Hora: ${timeString}`, 10, pageHeight - 10);
  
      // Convertir PDF en Blob
      const pdfBlob = doc.output('blob');
      const pdfURL = URL.createObjectURL(pdfBlob);
  
      // Crear una nueva ventana con visor personalizado
      const newWindow = window.open('', '_blank');
      newWindow.document.write(`
        <html>
          <head><title>Reporte de Tipos de Persona</title></head>
          <body style="margin:0;">
            <iframe width="100%" height="100%" src="${pdfURL}" frameborder="0"></iframe>
            <div style="position:fixed;top:10px;right:200px;">
              <button style="background-color: #6c757d; color: white; border: none; padding: 10px 15px; border-radius: 5px; cursor: pointer;" 
                onclick="const a = document.createElement('a'); a.href='${pdfURL}'; a.download='Reporte_de_Tipos_Persona.pdf'; a.click();">
                Descargar PDF
              </button>
            </div>
          </body>
        </html>`);
    };
  
    img.onerror = () => {
      console.warn('No se pudo cargar el logo. El PDF se generará sin el logo.');
    };
  };
  
  
{/*************************************************************************************************************************************/}
const exportToExcel = () => {
  if (!filteredTipoPersona || filteredTipoPersona.length === 0) {
    alert('No hay datos para exportar.');
    return;
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Tipos de Persona');

  // Título del documento
  worksheet.mergeCells('A1:B1');
  worksheet.getCell('A1').value = "SAINT PATRICK'S ACADEMY";
  worksheet.getCell('A1').font = { bold: true, size: 18, color: { argb: '006633' } };
  worksheet.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };

  worksheet.mergeCells('A2:B2');
  worksheet.getCell('A2').value = 'TIPOS DE PERSONA';
  worksheet.getCell('A2').font = { bold: true, size: 16, color: { argb: '006633' } };
  worksheet.getCell('A2').alignment = { horizontal: 'center', vertical: 'middle' };

  // Encabezados de la tabla
  const headerRow = worksheet.addRow(['#', 'Tipo de Persona']);
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '006633' } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
  });

  // Datos de la tabla - Usar `filteredTipoPersona`
  filteredTipoPersona.forEach((tipo, index) => {
    const row = worksheet.addRow([
      index + 1, // Número de fila
      typeof tipo.Tipo_persona === 'string' ? tipo.Tipo_persona.toUpperCase() : tipo.Tipo_persona // Tipo de Persona en mayúsculas
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
    saveAs(blob, 'Reporte_Tipos_Persona.xlsx'); // Descargar archivo con nombre
  });
};



{/***************************************************************************************************************************************/}
  return (
    <CContainer>

      
{/* Contenedor del h1 y botón "Nuevo" */}
<CRow className="align-items-center mb-5">
  <CCol xs="8" md="9">
    {/* Título de la página */}
    <h1 className="mb-0">Mantenimiento de Tipos de Persona</h1>
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
        <CDropdownItem onClick={exportToPDF}>Descargar en PDF</CDropdownItem>
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
        placeholder="Buscar tipo de persona"
        onChange={handleSearch}
        value={searchTerm}
        style={{ fontSize: '0.9rem' }}
      />
      <CButton
        style={{
          border: '1px solid #ccc',
          transition: 'all 0.1s ease-in-out',
          backgroundColor: '#F3F4F7',
          color: '#343a40',
          fontSize: '0.9rem',
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

<div  style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #ccc', padding: '10px', marginBottom: '30px', }}>
<CTable striped>
  <CTableHead>
    <CTableRow>
      <CTableHeaderCell style={{ borderRight: '1px solid #ddd' }} className="text-center"> # </CTableHeaderCell>
      <CTableHeaderCell style={{ borderRight: '1px solid #ddd' }} className="text-center">Tipo de Persona</CTableHeaderCell>
      <CTableHeaderCell className="text-center">Acciones</CTableHeaderCell>
    </CTableRow>
  </CTableHead>

  <CTableBody>
    {currentRecords.map((tipoPersona, índice) => (
      <CTableRow key={tipoPersona.Cod_tipo_persona}>
        <CTableDataCell style={{ borderRight: '1px solid #ddd' }} className="text-center">
          {indexOfFirstRecord + índice + 1}
        </CTableDataCell>
        <CTableDataCell style={{ borderRight: '1px solid #ddd' }} className="text-center">
          {tipoPersona.Tipo_persona.toUpperCase()}
        </CTableDataCell>
        <CTableDataCell className="text-center">
          <div className="d-flex justify-content-center">
            {canUpdate && (
              <CButton
                color="warning"
                onClick={() => openUpdateModal(tipoPersona)}
                style={{ marginRight: '10px' }}
                title="Editar tipo de persona"
              >
                <CIcon icon={cilPen} />
              </CButton>
            )}

            {canDelete && (
              <CButton
                color="danger"
                onClick={() => openDeleteModal(tipoPersona)}
              >
                <CIcon icon={cilTrash} />
              </CButton>
            )}

            {/* Botón de Activar/Inactivar */}
            <CButton
              style={{
                backgroundColor: tipoPersona.estado === 1 ? '#4CAF50' : '#F44336', // Verde si activo, rojo si inactivo
                color: 'white',
                marginLeft: '10px',
              }}
              onClick={() => toggleEstado(tipoPersona)} // Cambia el estado de Tipo Persona
              disabled={loading} // Deshabilitar mientras se procesa
            >
              {loading ? 'Cambiando...' : tipoPersona.estado === 1 ? 'Activo' : 'Inactivo'}
            </CButton>
          </div>
        </CTableDataCell>
      </CTableRow>
    ))}
  </CTableBody>
</CTable>
</div>



{/*******************************************************************************************************************************/}
<div className="pagination-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
  <CPagination aria-label="Page navigation">
    <CButton
      style={{ backgroundColor: '#6f8173', color: '#D9EAD3' }}
      disabled={currentPage === 1} // Desactiva si es la primera página
      onClick={() => paginate(currentPage - 1)} // Ir a la página anterior
    >
      Anterior
    </CButton>
    <CButton
      style={{ marginLeft: '10px', backgroundColor: '#6f8173', color: '#D9EAD3' }}
      disabled={currentPage === Math.ceil(filteredTipoPersona.length / recordsPerPage)} // Desactiva si es la última página
      onClick={() => paginate(currentPage + 1)} // Ir a la página siguiente
    >
      Siguiente
    </CButton>
  </CPagination>
  <span style={{ marginLeft: '10px' }}>
    Página {currentPage} de {Math.ceil(filteredTipoPersona.length / recordsPerPage)}
  </span>
</div>

{/*******************************************************************************************************************************/}

<CModal visible={modalVisible} backdrop="static">
  <CModalHeader closeButton={false}>
    <CModalTitle>Ingresar Nuevo Tipo de Persona</CModalTitle>
    <CButton
      className="btn-close"
      aria-label="Close"
      onClick={() => handleCloseModal(setModalVisible, resetNuevoTipoPersona)} // Cambia si tienes una función específica para tipo persona
    />
  </CModalHeader>
  <CModalBody>
    <CForm>
      <CInputGroup className="mb-3">
        <CInputGroupText>Tipo Persona</CInputGroupText>
        <CFormInput
          type="text"
          placeholder="Ingrese un nuevo tipo de persona"
          maxLength={50}
          onPaste={disableCopyPaste}
          onCopy={disableCopyPaste}
          value={setNuevoTipoPersona.Tipo_persona} // Actualizado para Tipo_persona
          onChange={(e) =>
            handleTipoPersonaInputChange(e, setNuevoTipoPersona) // Adaptado a Tipo Persona
          }
          onBlur={isDuplicateTipoPersona} // Adaptado a Tipo Persona
          style={{ textTransform: 'uppercase' }}
        />
      </CInputGroup>
      {tipoPersonaError && (
        <p style={{ color: 'red', fontSize: '0.9em' }}>{tipoPersonaError}</p> // Usamos tipoPersonaError
      )}
    </CForm>
  </CModalBody>
  <CModalFooter>
    <CButton
      color="secondary"
      onClick={() => handleCloseModal(setModalVisible, resetNuevoTipoPersona)} // Adaptado si tienes una función específica
    >
      Cancelar
    </CButton>
    <CButton
      style={{ backgroundColor: '#4B6251', color: 'white' }}
      onClick={handleCreateTipoPersona} // Cambiado a Tipo Persona
      disabled={!!tipoPersonaError} // Validación para errores
    >
      <CIcon icon={cilSave} style={{ marginRight: '5px' }} /> Guardar
    </CButton>
  </CModalFooter>
</CModal>


{/*******************************************************************************************************************************/}
<CModal visible={modalUpdateVisible} backdrop="static">
  <CModalHeader closeButton={false}>
    <CModalTitle>Actualizar Tipo de Persona</CModalTitle>
    <CButton
      className="btn-close"
      aria-label="Close"
      onClick={() => handleCloseModal(setModalUpdateVisible, resetTipoPersonaToUpdate)} // Cambiado para Tipo de Persona
    />
  </CModalHeader>
  <CModalBody>
    <CForm>
      <CInputGroup className="mb-3">
        <CInputGroupText>Tipo Persona</CInputGroupText> {/* Cambiado para "Tipo Persona" */}
        <CFormInput
          type="text"
          placeholder="Ingrese el tipo de persona" // Ajustado para Tipo Persona
          maxLength={50}
          onPaste={disableCopyPaste}
          onCopy={disableCopyPaste}
          value={tipoPersonaToUpdate.Tipo_persona} // Cambiado para Tipo_persona
          onChange={(e) =>
            handleTipoPersonaInputChange(e, setTipoPersonaToUpdate) // Adaptado para Tipo Persona
          }
          style={{ textTransform: 'uppercase' }}
        />
      </CInputGroup>
      {tipoPersonaError.Tipo_persona && <p style={{ color: 'red' }}>{tipoPersonaError.Tipo_persona}</p>} {/* Ajustado para Tipo_persona */}
    </CForm>
  </CModalBody>
  <CModalFooter>
    <CButton
      color="secondary"
      onClick={() =>
        handleCloseModal(setModalUpdateVisible, resetTipoPersonaToUpdate) // Cambiado para Tipo Persona
      }
    >
      Cancelar
    </CButton>
    <CButton
      style={{ backgroundColor: '#4B6251', color: 'white' }}
      onClick={handleUpdateTipoPersona} // Cambiado para Tipo Persona
      disabled={tipoPersonaError.Tipo_persona} // Validación para errores de Tipo Persona
    >
      <CIcon icon={cilSave} style={{ marginRight: '5px' }} /> Guardar
    </CButton>
  </CModalFooter>
</CModal>


{/*******************************************************************************************************************************/}
{/* Modal Eliminar Tipo de Persona */}
<CModal visible={modalDeleteVisible} onClose={() => setModalDeleteVisible(false)} backdrop="static">
  <CModalHeader>
    <CModalTitle>Eliminar Tipo de Persona</CModalTitle>
  </CModalHeader>
  <CModalBody>
    ¿Estás seguro de que deseas eliminar el tipo de persona "{tipoPersonaToDelete.Tipo_persona}"?
  </CModalBody>
  <CModalFooter>
    <CButton color="secondary" onClick={() => setModalDeleteVisible(false)}>
      Cancelar
    </CButton>
    <CButton color="danger" onClick={handleDeleteTipoPersona}>
      Eliminar
    </CButton>
  </CModalFooter>
</CModal>

{/*************************************************************************************************************************************/}
    </CContainer>
  );
};

export default TipoPersona;
