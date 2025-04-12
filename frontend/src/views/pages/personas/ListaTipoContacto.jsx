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

const ListaTipoContacto = () => {

  const {canSelect, canUpdate, canDelete, canInsert } = usePermission('ListaTipoContacto');
  const [tipoContacto, setTipoContacto] = useState([]);
  const [contactoError, setContactoError] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalUpdateVisible, setModalUpdateVisible] = useState(false);
  const [modalDeleteVisible, setModalDeleteVisible] = useState(false);
  const [nuevoContacto, setNuevoContacto] = useState({ tipo_contacto: '' });
  const [tipoContactoToUpdate, setTipoContactoToUpdate] = useState({});
  const [tipoContactoToDelete, setTipoContactoToDelete] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false); // Estado para detectar cambios sin guardar
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  

{/**************************************************************************************************************************************/}

const fetchTipoContacto = async () => {
  try {
    const response = await fetch(`http://localhost:4000/api/tipoContacto/verTodoTipoContacto`);
    const data = await response.json();
    console.log('Datos obtenidos:', data); // Agrega este log para depurar

    // Verificamos si "data" es un array antes de manipularlo
    if (!Array.isArray(data)) {
      console.error('Error: La API no está devolviendo un arreglo, sino:', data);
      return;
    }

    // Mapeamos los datos y luego los invertimos para que el último creado sea primero
    const dataWithIndex = data
      .map((tipoContacto, index) => ({
        ...tipoContacto,
        originalIndex: index + 1,
      }))
      .reverse(); // 🔄 Invertimos el orden para que el último sea el primero

    setTipoContacto(dataWithIndex);
  } catch (error) {
    console.error('Error al obtener tipo contacto:', error);
  }
};

useEffect(() => {
  fetchTipoContacto();
}, []);


{/**************************************************************************************************************************************/}

// Validación de tipo contacto
const validateTipoContacto = (contacto) => {
  const regex = /^[a-zA-ZÁÉÍÓÚáéíóúÑñ\s]*$/;
  const noMultipleSpaces = !/\s{2,}/.test(contacto); // No permite más de un espacio consecutivo
  const trimmedContacto = contacto.trim().replace(/\s+/g, ' ');

  if (!regex.test(trimmedContacto)) {
    swal.fire({
      icon: 'warning',
      title: 'Tipo de contacto inválido',
      text: 'El tipo de contacto solo puede contener letras y espacios.',
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
  const words = trimmedContacto.split(' ');
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


{/**************************************************************************************************************************************/}

const capitalizeWords = (str) => {
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
};

// Validar si el tipo contacto ya existe
const isDuplicateTipoContacto = () => {
  const { tipo_contacto } = nuevoContacto;
  const existingContacto = tipoContacto.find(
    (contacto) =>
      contacto.tipo_contacto.toLowerCase() === tipo_contacto.toLowerCase()
  );
  if (existingContacto) {
    swal.fire({
      icon: 'warning',
      title: 'Tipo de contacto duplicado',
      text: 'Ya existe un tipo de contacto con el mismo nombre.',
    });

    if (existingContacto) {
      setContactoError('Ya existe un tipo de contacto con el mismo nombre');
    } else {
      setContactoError(''); // No hay error
    }
    return true; // Indica que el tipo contacto ya existe
  }
  return false; // No hay duplicado
};

const handleTipoContactoKeyDown = (event) => {
  const char = event.key;
  
  // Permitir teclas esenciales como borrar y navegación
  const allowedKeys = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Tab", "Enter"];

  if (allowedKeys.includes(char)) {
    return; // ✅ Permitir acciones básicas
  }

  // Bloquear caracteres especiales (solo permitir letras, acentos y comas)
  if (!/^[a-zA-ZÁÉÍÓÚáéíóúÑñ, ]$/.test(char)) {
    event.preventDefault(); // 🚫 Bloquear cualquier otro carácter
  }

  // Bloquear más de un espacio consecutivo
  const inputValue = event.target.value;
  if (char === " " && inputValue.slice(-1) === " ") {
    event.preventDefault(); // 🚫 Bloquear el segundo espacio
  }
};

{/**************************************************************************************************************************************/}

// Función para controlar la entrada de texto en los campos
const handleTipoContactoInputChange = (e, setFunction) => {
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
    setContactoError('El tipo de contacto debe tener más de 2 letras.');
  } else {
    setContactoError(''); // No hay error
  }

  setFunction((prevState) => ({
    ...prevState,
    tipo_contacto: value, // Actualizamos el campo tipo_contacto
  }));

  setHasUnsavedChanges(true); // Marcar que hay cambios no guardados
};


{/**************************************************************************************************************************************/}

      // Deshabilitar copiar y pegar
  const disableCopyPaste = (e) => {
    e.preventDefault();
    swal.fire({
      icon: 'warning',
      title: 'Acción bloqueada',
      text: 'Copiar y pegar no está permitido.',
    });
  };
{/**************************************************************************************************************************************/}

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

    const resetNuevoContacto = () => {
      setNuevoContacto({ tipo_contacto: '' });
    };
    
    const resetContactoToUpdate = () => {
      setTipoContactoToUpdate({ tipo_contacto: '' });
    };
    
{/**************************************************************************************************************************************/}

const handleCreateContacto = async () => {
  // Validar el tipo de contacto antes de enviarlo
  const contactoCapitalizado = capitalizeWords(nuevoContacto.tipo_contacto.trim().replace(/\s+/g, ' '));

  // Validaciones antes de crear
  if (!validateTipoContacto(contactoCapitalizado)) {
    return;
  }

  try {
    const response = await fetch(`http://localhost:4000/api/tipoContacto/crearTipoContacto`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tipo_contacto: contactoCapitalizado,  // Usamos el tipo de contacto validado
        estado: 1, // Tipo de contacto activo por defecto
      }),
    });

    if (response.ok) {
      let result;
      try {
        result = await response.json(); // Intentamos obtener el JSON de la respuesta
      } catch (error) {
        console.warn("La API no devolvió JSON, pero el tipo de contacto fue creado.");
        result = { tipo_contacto: contactoCapitalizado }; // Asumimos que se creó correctamente
      }

      // Actualiza la lista sin recargar la página
      fetchTipoContacto();
      setModalVisible(false); // Cerrar el modal sin advertencia al guardar
      resetNuevoContacto(); // Reiniciar el estado del nuevo contacto
      setHasUnsavedChanges(false); // Reiniciar el estado de cambios no guardados

      swal.fire({
        icon: 'success',
        title: 'Creación exitosa',
        text: `El tipo de contacto ha sido creado correctamente.`,
      });

    } else {
      swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo crear el tipo de contacto.',
      });
    }
  } catch (error) {
    console.error('Error al crear el tipo de contacto:', error);
    swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Ocurrió un error al intentar crear el tipo de contacto.',
    });
  }
};


{/**************************************************************************************************************************************/}

const handleUpdateContacto = async () => {
  const contactoCapitalizado = capitalizeWords(tipoContactoToUpdate.tipo_contacto.trim().replace(/\s+/g, ' '));

  if (!validateTipoContacto(contactoCapitalizado)) {
    return;
  }

  try {
    const response = await fetch(`http://localhost:4000/api/tipoContacto/actualizarTipoContacto/${tipoContactoToUpdate.cod_tipo_contacto}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cod_tipo_contacto: tipoContactoToUpdate.cod_tipo_contacto,
        tipo_contacto: contactoCapitalizado,
        estado: tipoContactoToUpdate.estado, // Mantener el estado o modificarlo
      }),
    });

    if (response.ok) {
      fetchTipoContacto();
      setModalUpdateVisible(false); // Cerrar el modal sin advertencia al guardar
      resetContactoToUpdate();
      setHasUnsavedChanges(false); // Reiniciar el estado de cambios no guardados
      swal.fire({
        icon: 'success',
        title: 'Actualización exitosa',
        text: 'El tipo de contacto ha sido actualizado correctamente.',
      });
    } else {
      swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo actualizar el tipo de contacto.',
      });
    }
  } catch (error) {
    console.error('Error al actualizar el tipo de contacto:', error);
  }
};


{/**************************************************************************************************************************************/}

const handleDeleteContacto = async () => {
  try {
    const response = await fetch(
      `http://localhost:4000/api/tipoContacto/eliminarTipoContacto/${encodeURIComponent(tipoContactoToDelete.cod_tipo_contacto)}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.ok) {
      fetchTipoContacto();
      setModalDeleteVisible(false);
      setTipoContactoToDelete({});
      swal.fire({
        icon: 'success',
        title: 'Eliminación exitosa',
        text: 'El tipo de contacto ha sido eliminado correctamente.',
      });
    } else {
      swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo eliminar el tipo de contacto.',
      });
    }
  } catch (error) {
    console.error('Error al eliminar el tipo de contacto:', error);
    swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Ocurrió un error al intentar eliminar el tipo de contacto.',
    });
  }
};

{/**************************************************************************************************************************************/}

const openUpdateModal = (tipoContacto) => {
  setTipoContactoToUpdate(tipoContacto);
  setModalUpdateVisible(true);
};

const openDeleteModal = (tipoContacto) => {
  setTipoContactoToDelete(tipoContacto);
  setModalDeleteVisible(true);
};


{/**************************************************************************************************************************************/}

const toggleEstadoContacto = async (tipoContacto) => {
  const nuevoEstado = tipoContacto.estado ? 0 : 1;

  try {
    setLoading(true);

    const response = await axios.post('http://localhost:4000/api/tipoContacto/actualizarEstadoTipoContacto', {
      cod_tipo_contacto: tipoContacto.cod_tipo_contacto,
      estado: nuevoEstado,
    });

    if (response.data.mensaje === 'Estado actualizado exitosamente') {
      // Actualizar el estado correctamente
      setTipoContacto((prevTipoContacto) =>
        prevTipoContacto.map((contacto) =>
          contacto.cod_tipo_contacto === tipoContacto.cod_tipo_contacto
            ? { ...contacto, estado: nuevoEstado }
            : contacto
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


{/**************************************************************************************************************************************/}


const handleSearch = (event) => {
  setSearchTerm(event.target.value);
  setCurrentPage(1);
};

const filteredTipoContacto = tipoContacto.filter((tipoContacto) => 
  tipoContacto.tipo_contacto &&
  tipoContacto.tipo_contacto.toLowerCase().includes(searchTerm.toLowerCase())
);

const indexOfLastRecord = currentPage * recordsPerPage;
const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
const currentRecords = filteredTipoContacto.slice(indexOfFirstRecord, indexOfLastRecord);

const paginate = (pageNumber) => {
  if (pageNumber > 0 && pageNumber <= Math.ceil(filteredTipoContacto.length / recordsPerPage)) {
    setCurrentPage(pageNumber);
  }
};

{/**************************************************************************************************************************************/}

const ReporteTipoContactoPDF = () => {
  const doc = new jsPDF('p', 'mm', 'letter'); // Formato vertical

  if (!filteredTipoContacto || filteredTipoContacto.length === 0) {
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
    doc.text('Reporte de Tipo Contacto', pageWidth / 2, 40, { align: 'center' });

    doc.setLineWidth(0.5);
    doc.setDrawColor(0, 102, 51);
    doc.line(10, 45, pageWidth - 10, 45);

    let startY = 50; // Tabla más cerca del encabezado

    doc.autoTable({
      startY: startY,
      margin: { left: (pageWidth - 140) / 2 }, // Centrado horizontal
      head: [['#', 'Tipo de Contacto', 'Estado']],
      body: filteredTipoContacto.map((contacto, index) => [
        index + 1,
        contacto.tipo_contacto?.toUpperCase() || 'N/D',
        contacto.estado === 1 ? 'ACTIVO' : 'INACTIVO'
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
        0: { cellWidth: 20 }, // #
        1: { cellWidth: 80 }, // Tipo de Contacto
        2: { cellWidth: 40 } // Estado
      },
      alternateRowStyles: { fillColor: [240, 248, 255] },
      didParseCell: (data) => {
        if (data.section === 'body' && data.column.index === 2) {
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
          <title>Reporte de Tipo Contacto</title>
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
            <button class="icon-button" onclick="const a = document.createElement('a'); a.href='${pdfURL}'; a.download='Reporte_TipoContacto.pdf'; a.click();">
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


{/**************************************************************************************************************************************/}

const exportToExcel = () => {
  if (!filteredTipoContacto || filteredTipoContacto.length === 0) {
    alert('No hay datos para exportar.');
    return;
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Tipo Contacto');

  // 🎯 **Título del documento**
  worksheet.mergeCells('A1:C1');
  worksheet.getCell('A1').value = "SAINT PATRICK'S ACADEMY";
  worksheet.getCell('A1').font = { bold: true, size: 18, color: { argb: '006633' } };
  worksheet.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };

  worksheet.mergeCells('A2:C2');
  worksheet.getCell('A2').value = 'TIPOS DE CONTACTO';
  worksheet.getCell('A2').font = { bold: true, size: 16, color: { argb: '006633' } };
  worksheet.getCell('A2').alignment = { horizontal: 'center', vertical: 'middle' };

  // 📌 **Encabezados de la tabla**
  const headerRow = worksheet.addRow(['#', 'Tipo Contacto', 'Estado']);
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '006633' } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
  });

  // 📊 **Datos de la tabla**
  filteredTipoContacto.forEach((contacto, index) => {
    const row = worksheet.addRow([
      index + 1,
      contacto.tipo_contacto?.toUpperCase() || 'N/D',
      contacto.estado === 1 ? 'ACTIVO' : 'INACTIVO'
    ]);

    // 🎨 **Estilos para la columna de Estado**
    const estadoCell = row.getCell(3);
    estadoCell.font = {
      bold: true,
      color: { argb: contacto.estado === 1 ? '008000' : 'FF0000' } // ✅ Verde para "ACTIVO", rojo para "INACTIVO"
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
    saveAs(blob, 'Reporte_TipoContacto.xlsx');
  });
};


{/**************************************************************************************************************************************/}

{/**************************************************************************************************************************************/}

{/**************************************************************************************************************************************/}

{/**************************************************************************************************************************************/}
if (!canSelect) { 
  return <AccessDenied />;
}

{/**************************************************************************************************************************************/}

  return (
    <CContainer>
<CRow className="align-items-center mb-5">
  <CCol xs="8" md="9">
    {/* Título de la página */}
    <h1 className="mb-0">Mantenimiento de Tipo Contactos</h1>
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
        <CDropdownItem onClick={ReporteTipoContactoPDF}>Descargar en PDF</CDropdownItem>
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
        placeholder="Buscar tipo contactos ..."
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
  <CTable striped>
    <CTableHead>
      <CTableRow>
        <CTableHeaderCell style={{ borderRight: '1px solid #ddd' }} className="text-center">#</CTableHeaderCell>
        <CTableHeaderCell style={{ borderRight: '1px solid #ddd' }} className="text-center">Tipo de Contacto</CTableHeaderCell>
        <CTableHeaderCell className="text-center">Acciones</CTableHeaderCell>
      </CTableRow>
    </CTableHead>

    <CTableBody>
      {currentRecords.map((tipoContacto) => (
        <CTableRow key={tipoContacto.cod_tipo_contacto}>
          <CTableDataCell style={{ borderRight: '1px solid #ddd' }} className="text-center">{tipoContacto.originalIndex}</CTableDataCell>
          <CTableDataCell style={{ borderRight: '1px solid #ddd' }} className="text-center">{tipoContacto.tipo_contacto.toUpperCase()}</CTableDataCell>
          <CTableDataCell className="text-center">
            <div className="d-flex justify-content-center">
              {canUpdate && (
                <CButton
                  color="warning"
                  onClick={() => openUpdateModal(tipoContacto)}
                  style={{ marginRight: '10px' }}
                  disabled={tipoContacto.estado === 0} // Deshabilitado si está inactivo
                  title={tipoContacto.estado ? 'Editar contacto' : 'Contacto inactivo'}
                >
                  <CIcon icon={cilPen} />
                </CButton>
              )}

              {canDelete && (
                <CButton color="danger" onClick={() => openDeleteModal(tipoContacto)}>
                  <CIcon icon={cilTrash} />
                </CButton>
              )}

              {/* Botón de Activar/Inactivar */}
              <CButton
                style={{
                  backgroundColor: tipoContacto.estado ? '#4CAF50' : '#F44336', // Verde si activo, rojo si inactivo
                  color: 'white',
                  marginLeft: '10px',
                }}
                onClick={() => toggleEstadoContacto(tipoContacto)} // Función para cambiar estado
                disabled={loading} // Deshabilitar mientras carga
              >
                {loading ? 'Cambiando...' : tipoContacto.estado ? 'Activo' : 'Inactivo'}
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
      disabled={currentPage === Math.ceil(filteredTipoContacto.length / recordsPerPage)} // Desactiva si es la última página
      onClick={() => paginate(currentPage + 1)} // Páginas siguientes
    >
      Siguiente
    </CButton>
  </CPagination>
  <span style={{ marginLeft: '10px' }}>
    Página {currentPage} de {Math.ceil(filteredTipoContacto.length / recordsPerPage)}
  </span>
</div>

{/**************************************************************************************************************************************/}
<CModal visible={modalVisible} backdrop="static">
  <CModalHeader closeButton={false}>
    <CModalTitle>Ingresar Nuevo Tipo de Contacto</CModalTitle>
    <CButton className="btn-close" aria-label="Close" onClick={() => handleCloseModal(setModalVisible, resetNuevoContacto)} />
  </CModalHeader>
  <CModalBody>
    <CForm>
      <CInputGroup className="mb-3">
        <CInputGroupText>Tipo Contacto</CInputGroupText>
        <CFormInput
          type="text"
          placeholder="Ingrese un nuevo tipo de contacto"
          maxLength={50}
          onPaste={disableCopyPaste}
          onCopy={disableCopyPaste}
          value={nuevoContacto.tipo_contacto}
          onChange={(e) => handleTipoContactoInputChange(e, setNuevoContacto, setContactoError)}
          onBlur={isDuplicateTipoContacto}
          onKeyDown={handleTipoContactoKeyDown } 
          style={{ textTransform: 'uppercase' }}
        />
      </CInputGroup>
      {contactoError && (
        <p style={{ color: 'red', fontSize: '0.9em' }}>{contactoError}</p>
      )}
    </CForm>
  </CModalBody>
  <CModalFooter>
    <CButton color="secondary" onClick={() => handleCloseModal(setModalVisible, resetNuevoContacto)}>
      Cancelar
    </CButton>
    <CButton style={{ backgroundColor: '#4B6251', color: 'white' }} onClick={handleCreateContacto} disabled={!!contactoError}>
      <CIcon icon={cilSave} style={{ marginRight: '5px' }} /> Guardar
    </CButton>
  </CModalFooter>
</CModal>


{/**************************************************************************************************************************************/}

<CModal visible={modalUpdateVisible} backdrop="static">
  <CModalHeader closeButton={false}>
    <CModalTitle>Actualizar Tipo de Contacto</CModalTitle>
    <CButton className="btn-close" aria-label="Close" onClick={() => handleCloseModal(setModalUpdateVisible, resetContactoToUpdate)} />
  </CModalHeader>
  <CModalBody>
    <CForm>
      <CInputGroup className="mb-3">
        <CInputGroupText>Tipo Contacto</CInputGroupText>
        <CFormInput
          type="text"
          placeholder="Ingrese el tipo de contacto"
          maxLength={50}
          onPaste={disableCopyPaste}
          onCopy={disableCopyPaste}
          value={tipoContactoToUpdate.tipo_contacto}
          onChange={(e) => handleTipoContactoInputChange(e, setTipoContactoToUpdate)}
          onKeyDown={handleTipoContactoKeyDown } 
          style={{ textTransform: 'uppercase' }}
        />
      </CInputGroup>
      {contactoError.tipo_contacto && <p style={{ color: 'red' }}>{contactoError.tipo_contacto}</p>}
    </CForm>
  </CModalBody>
  <CModalFooter>
    <CButton color="secondary" onClick={() => handleCloseModal(setModalUpdateVisible, resetContactoToUpdate)}>
      Cancelar
    </CButton>
    <CButton style={{ backgroundColor: '#4B6251', color: 'white' }} onClick={handleUpdateContacto} disabled={contactoError.tipo_contacto}>
      <CIcon icon={cilSave} style={{ marginRight: '5px' }} /> Guardar
    </CButton>
  </CModalFooter>
</CModal>

{/**************************************************************************************************************************************/}

{/* Modal Eliminar Contacto */}
<CModal visible={modalDeleteVisible} onClose={() => setModalDeleteVisible(false)} backdrop="static">
  <CModalHeader>
    <CModalTitle>Eliminar Tipo de Contacto</CModalTitle>
  </CModalHeader>
  <CModalBody>
    ¿Estás seguro de que deseas eliminar el tipo de contacto "{tipoContactoToDelete.tipo_contacto}"?
  </CModalBody>
  <CModalFooter>
    <CButton color="secondary" onClick={() => setModalDeleteVisible(false)}>
      Cancelar
    </CButton>
    <CButton color="danger" onClick={handleDeleteContacto}>
      Eliminar
    </CButton>
  </CModalFooter>
</CModal>


{/**************************************************************************************************************************************/}

    </CContainer>
  );
};

export default ListaTipoContacto;
