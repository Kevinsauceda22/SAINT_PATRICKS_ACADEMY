import React, { useState, useEffect } from 'react';
import { CIcon } from '@coreui/icons-react';
import {  cilSearch, cilBrushAlt, cilPen, cilTrash, cilPlus, cilSave ,cilDescription, cilSpreadsheet, cilFile} from '@coreui/icons';
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

const ListaGeneroPersona = () => {
  const {canSelect, canUpdate, canDelete, canInsert } = usePermission('ListaGeneroPersona');  

  const [generoPersona, setGeneroPersona] = useState([]);
  const [generoError, setGeneroError] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalUpdateVisible, setModalUpdateVisible] = useState(false);
  const [modalDeleteVisible, setModalDeleteVisible] = useState(false);
  const [nuevoGenero, setNuevoGenero] = useState({ tipo_genero: '' });
  const [generoToUpdate, setGeneroToUpdate] = useState({});
  const [generoToDelete, setGeneroToDelete] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false); // Estado para detectar cambios sin guardar
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  



{/***************************************************************************************************************************************/}
const fetchGeneroPersona = async () => {
  try {
    const response = await fetch(`http://localhost:4000/api/generoPersona/verTodoGeneroPersona`);
    const data = await response.json();
    console.log('Datos obtenidos:', data); // Agrega este log para depurar
    const dataWithIndex = data.map((generoPersona, index) => ({
      ...generoPersona,
      originalIndex: index + 1,
    }));
    setGeneroPersona(dataWithIndex);
  } catch (error) {
    console.error('Error al obtener género persona:', error);
  }
};

  useEffect(() => {
    fetchGeneroPersona();
  }, []);

{/**************************************************************************************************************************************/}

// Validación de tipo género
const validateTipoGenero = (genero) => {
  const regex = /^[a-zA-ZÁÉÍÓÚáéíóúÑñ\s]*$/;
  const noMultipleSpaces = !/\s{2,}/.test(genero); // No permite más de un espacio consecutivo
  const trimmedGenero = genero.trim().replace(/\s+/g, ' ');

  if (!regex.test(trimmedGenero)) {
    swal.fire({
      icon: 'warning',
      title: 'Género inválido',
      text: 'El género solo puede contener letras y espacios.',
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
  const words = trimmedGenero.split(' ');
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

// Capitalizar la primera letra de cada palabra
const capitalizeWords = (str) => {
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
};

// Validar que ningún campo esté vacío
const validateEmptyFields = () => {
  const { Tipo_genero } = nuevoGenero; // Ajuste al campo tipo_genero
  if (!Tipo_genero) {
    swal.fire({
      icon: 'warning',
      title: 'Campos vacíos',
      text: 'Todos los campos deben estar llenos para poder crear un género.',
    });
    return false;
  }
  return true;
};

{/**************************************************************************************************************************************/}

// Validar si el género ya existe
const isDuplicateGenero = () => {
  const { Tipo_genero } = nuevoGenero;
  const existingGenero = generoPersona.find(
    (genero) =>
      genero.Tipo_genero.toLowerCase() === Tipo_genero.toLowerCase()
  );

  if (existingGenero) {
    swal.fire({
      icon: 'warning',
      title: 'Género duplicado',
      text: 'Ya existe un género con el mismo nombre.',
    });

    if (existingGenero) {
      setGeneroError('Ya existe un género con el mismo nombre');
    } else {
      setGeneroError(''); // No hay error
    }

    return true;
  }

  return false;
};


{/**************************************************************************************************************************************/}

// Función para controlar la entrada de texto en los campos
const handleTipoGeneroInputChange = (e, setFunction) => {
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
    setGeneroError('El género debe tener más de 2 letras.');
  } else {
    setGeneroError(''); // No hay error
  }

  setFunction((prevState) => ({
    ...prevState,
    Tipo_genero: value,
  }));

  setHasUnsavedChanges(true); // Marcar que hay cambios no guardados
};

{/**************************************************************************************************************************************/}

const handleGeneroPersonaKeyDown = (event) => {
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


{/**************************************************************************************************************************************/}

const resetNuevoGenero = () => {
  setNuevoGenero({ Tipo_genero: '' });
};

const resetGeneroToUpdate = () => {
  setGeneroToUpdate({ Tipo_genero: '' });
};


{/**************************************************************************************************************************************/}

const handleCreateGenero = async () => {
  // Validar el tipo de género antes de enviarlo
  const generoCapitalizado = capitalizeWords(nuevoGenero.Tipo_genero.trim().replace(/\s+/g, ' '));

  // Validaciones antes de crear
  if (!validateTipoGenero(generoCapitalizado)) {
    return;
  }

  try {
    const response = await fetch(`http://localhost:4000/api/generoPersona/crearGeneroPersona`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        Tipo_genero: generoCapitalizado,  // Usamos el género validado
        estado: 1, // Género activo por defecto
      }),
    });

    if (response.ok) {
      let result;
      try {
        result = await response.json(); // Intentamos obtener el JSON de la respuesta
      } catch (error) {
        console.warn("La API no devolvió JSON, pero el género fue creado.");
        result = { Tipo_genero: generoCapitalizado }; // Asumimos que se creó correctamente
      }

      // Actualiza la lista sin recargar la página
      fetchGeneroPersona(); 
      setModalVisible(false); // Cerrar el modal sin advertencia al guardar
      resetNuevoGenero(); // Reiniciar el estado del nuevo género
      setHasUnsavedChanges(false); // Reiniciar el estado de cambios no guardados

      swal.fire({
        icon: 'success',
        title: 'Creación exitosa',
        text: `El género ha sido creado correctamente.`,
      });

    } else {
      swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo crear el género.',
      });
    }
  } catch (error) {
    console.error('Error al crear el género:', error);
    swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Ocurrió un error al intentar crear el género.',
    });
  }
};

{/**************************************************************************************************************************************/}
const handleUpdateGenero = async () => {
  const generoCapitalizado = capitalizeWords(generoToUpdate.Tipo_genero.trim().replace(/\s+/g, ' '));

  if (!validateTipoGenero(generoCapitalizado)) {
    return;
  }

  try {
    const response = await fetch(`http://localhost:4000/api/generoPersona/actualizarGeneroPersona/${generoToUpdate.Cod_genero}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        Cod_genero: generoToUpdate.Cod_genero,
        Tipo_genero: generoCapitalizado,
        estado: generoToUpdate.estado,  // Mantener el estado o modificarlo
      }),
    });

    if (response.ok) {
      fetchGeneroPersona();
      setModalUpdateVisible(false); // Cerrar el modal sin advertencia al guardar
      resetGeneroToUpdate();
      setHasUnsavedChanges(false); // Reiniciar el estado de cambios no guardados
      swal.fire({
        icon: 'success',
        title: 'Actualización exitosa',
        text: 'El género ha sido actualizado correctamente.',
      });
    } else {
      swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo actualizar el género.',
      });
    }
  } catch (error) {
    console.error('Error al actualizar el género:', error);
    swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Ocurrió un error al intentar actualizar el género.',
    });
  }
};

{/**************************************************************************************************************************************/}

const handleDeleteGenero = async () => {
  try {
    const response = await fetch(
      `http://localhost:4000/api/generoPersona/eliminarGeneroPersona/${encodeURIComponent(generoToDelete.Cod_genero)}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.ok) {
      fetchGeneroPersona();
      setModalDeleteVisible(false);
      setGeneroToDelete({});
      swal.fire({
        icon: 'success',
        title: 'Eliminación exitosa',
        text: 'El género ha sido eliminado correctamente.',
      });
    } else {
      swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo eliminar el género.',
      });
    }
  } catch (error) {
    console.error('Error al eliminar el género:', error);
    swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Ocurrió un error al intentar eliminar el género.',
    });
  }
};


{/**************************************************************************************************************************************/}

const openUpdateModal = (generoPersona) => {
  setGeneroToUpdate(generoPersona);
  setModalUpdateVisible(true);
};

const openDeleteModal = (generoPersona) => {
  setGeneroToDelete(generoPersona);
  setModalDeleteVisible(true);
};


{/**************************************************************************************************************************************/}

const toggleEstado = async (generoPersona) => {
  const nuevoEstado = generoPersona.estado ? 0 : 1;

  try {
    setLoading(true);

    const response = await axios.post('http://localhost:4000/api/generoPersona/actualizarEstadoGeneroPersona', {
      Cod_genero: generoPersona.Cod_genero,
      estado: nuevoEstado,
    });

    if (response.data.mensaje === 'Estado actualizado exitosamente') {
      // Actualizar el estado correctamente
      setGeneroPersona((prevGeneros) =>
        prevGeneros.map((genero) =>
          genero.Cod_genero === generoPersona.Cod_genero
            ? { ...genero, estado: nuevoEstado }
            : genero
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

// Filtrado
const filteredGeneroPersona = generoPersona.filter((genero) => {
  // Convertimos estado a texto
  const estadoTexto = genero.estado === 1 ? 'ACTIVO' : genero.estado === 0 ? 'INACTIVO' : 'DESCONOCIDO';

  return (
    genero.Tipo_genero &&
    genero.Tipo_genero.toLowerCase().includes(searchTerm.toLowerCase()) ||
    estadoTexto.toLowerCase().includes(searchTerm.toLowerCase()) // 🔍 Ahora permite buscar por estado
  );
});


// Paginación y currentRecords se mantienen igual:
const indexOfLastRecord = currentPage * recordsPerPage;
const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
const currentRecords = filteredGeneroPersona.slice(indexOfFirstRecord, indexOfLastRecord);



{/**************************************************************************************************************************************/}
const ReporteGenerosPDF = () => {
  const doc = new jsPDF('p', 'mm', 'letter'); // Formato vertical

  if (!filteredGeneroPersona || filteredGeneroPersona.length === 0) {
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
    doc.text('Reporte de Géneros', pageWidth / 2, 40, { align: 'center' });

    doc.setLineWidth(0.5);
    doc.setDrawColor(0, 102, 51);
    doc.line(10, 45, pageWidth - 10, 45);

    let startY = 50; // Tabla más cerca del encabezado

    doc.autoTable({
      startY: startY,
      margin: { left: (pageWidth - 140) / 2 }, // Centrado horizontal
      head: [['#', 'Tipo de Género', 'Estado']],
      body: filteredGeneroPersona.map((genero, index) => [
        index + 1,
        genero.Tipo_genero?.toUpperCase() || 'N/D',
        genero.estado === 1 ? 'ACTIVO' : 'INACTIVO'
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
        1: { cellWidth: 80 }, // Tipo de Género
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
          <title>Reporte de Géneros</title>
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
            <button class="icon-button" onclick="const a = document.createElement('a'); a.href='${pdfURL}'; a.download='Reporte_Generos.pdf'; a.click();">
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
  if (!filteredGeneroPersona || filteredGeneroPersona.length === 0) {
    alert('No hay datos para exportar.');
    return;
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Géneros');

  // 🎯 **Título del documento**
  worksheet.mergeCells('A1:C1');
  worksheet.getCell('A1').value = "SAINT PATRICK'S ACADEMY";
  worksheet.getCell('A1').font = { bold: true, size: 18, color: { argb: '006633' } };
  worksheet.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };

  worksheet.mergeCells('A2:C2');
  worksheet.getCell('A2').value = 'LISTA DE GÉNEROS';
  worksheet.getCell('A2').font = { bold: true, size: 16, color: { argb: '006633' } };
  worksheet.getCell('A2').alignment = { horizontal: 'center', vertical: 'middle' };

  // 📌 **Encabezados de la tabla**
  const headerRow = worksheet.addRow(['#', 'Tipo de Género', 'Estado']);
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '006633' } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
  });

  // 📊 **Datos de la tabla**
  filteredGeneroPersona.forEach((genero, index) => {
    const row = worksheet.addRow([
      index + 1,
      genero.tipo_genero?.toUpperCase() || 'N/D',
      genero.estado === 1 ? 'ACTIVO' : 'INACTIVO'
    ]);

    // 🎨 **Estilos para la columna de Estado**
    const estadoCell = row.getCell(3);
    estadoCell.font = {
      bold: true,
      color: { argb: genero.estado === 1 ? '008000' : 'FF0000' } // ✅ Verde para "ACTIVO", rojo para "INACTIVO"
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
    saveAs(blob, 'Reporte_Generos.xlsx');
  });
};


{/**************************************************************************************************************************************/}
  return (
    <CContainer>
<CRow className="align-items-center mb-5">
  <CCol xs="8" md="9">
    {/* Título de la página */}
    <h1 className="mb-0">Mantenimiento de Géneros</h1>
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
      onClick={exportToExcel}
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
      onClick={ReporteGenerosPDF}
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

{/* Contenedor de la barra de búsqueda y el selector dinámico */}
<CRow className="align-items-center mt-4 mb-2">
  {/* Barra de búsqueda */}
  <CCol xs="12" md="8" className="d-flex flex-wrap align-items-center">
    <CInputGroup className="me-3" style={{ width: '400px' }}>
      <CInputGroupText>
        <CIcon icon={cilSearch} />
      </CInputGroupText>
      <CFormInput
        placeholder="Buscar Género ..."
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


{/*************************************************************************************************************************************/}

<div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #ccc', padding: '10px', marginBottom: '30px' }}>
  {console.log('Current Records:', currentRecords)}
  <CTable striped>
    <CTableHead>
      <CTableRow>
        <CTableHeaderCell style={{ borderRight: '1px solid #ddd' }} className="text-center">
          #
        </CTableHeaderCell>
        <CTableHeaderCell style={{ borderRight: '1px solid #ddd' }} className="text-center">
          Tipo de Género
        </CTableHeaderCell>
        <CTableHeaderCell className="text-center">Acciones</CTableHeaderCell>
      </CTableRow>
    </CTableHead>
    <CTableBody>
      {currentRecords.map((generoPersona) => (
        <CTableRow key={generoPersona.Cod_genero}>
          <CTableDataCell style={{ borderRight: '1px solid #ddd' }} className="text-center">
            {generoPersona.originalIndex}
          </CTableDataCell>
          <CTableDataCell style={{ borderRight: '1px solid #ddd' }} className="text-center">
            {generoPersona.Tipo_genero.toUpperCase()}
          </CTableDataCell>
          <CTableDataCell className="text-center">
  <div className="d-flex justify-content-center gap-2">
    {canUpdate && (
      <CButton
        color="warning"
        onClick={() => openUpdateModal(generoPersona)}
        disabled={generoPersona.estado === 0}
        title={generoPersona.estado ? 'Editar género' : 'Género inactivo'}
      >
        <CIcon icon={cilPen} />
      </CButton>
    )}
    {/* Botón de Activar/Inactivar */}
    <CButton
      style={{
        backgroundColor: generoPersona.estado ? '#4CAF50' : '#F44336',
        color: 'white',
      }}
      onClick={() => toggleEstado(generoPersona)}
      disabled={loading}
    >
      {loading ? 'Cambiando...' : generoPersona.estado ? 'Activo' : 'Inactivo'}
    </CButton>
    {canDelete && (
      <CButton color="danger" onClick={() => openDeleteModal(generoPersona)}>
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


{/**************************************************************************************************************************************/}

                {/* Paginación Fija */}
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
      disabled={currentPage === Math.ceil(filteredGeneroPersona.length / recordsPerPage)} // Desactiva si es la última página
      onClick={() => paginate(currentPage + 1)} // Páginas siguientes
    >
      Siguiente
    </CButton>
  </CPagination>
  <span style={{ marginLeft: '10px' }}>
    Página {currentPage} de {Math.ceil(filteredGeneroPersona.length / recordsPerPage)}
  </span>
</div>

  
{/**************************************************************************************************************************************/}
<CModal visible={modalVisible} backdrop="static" size="lg">
  <CModalHeader closeButton={false}>
    <CModalTitle>Crear Género</CModalTitle>
    <CButton 
      className="btn-close" 
      aria-label="Close" 
      onClick={() => handleCloseModal(setModalVisible, resetNuevoGenero)} 
    />
  </CModalHeader>
  <CModalBody>
    <CForm>
      <CInputGroup className="mb-3">
        <CInputGroupText>Tipo Género</CInputGroupText>
        <CFormInput
          type="text"
          placeholder="Ingrese el tipo de género"
          maxLength={50}
          onPaste={disableCopyPaste}
          onCopy={disableCopyPaste}
          value={nuevoGenero.Tipo_genero}
          onChange={(e) => handleTipoGeneroInputChange(e, setNuevoGenero)}
          onKeyDown={handleGeneroPersonaKeyDown } 
          style={{ textTransform: 'uppercase' }}
        />
      </CInputGroup>
      {generoError.Tipo_genero && <p style={{ color: 'red' }}>{generoError.Tipo_genero}</p>}
    </CForm>
  </CModalBody>
  <CModalFooter>
    <CButton color="secondary" onClick={() => handleCloseModal(setModalVisible, resetNuevoGenero)}>
      Cancelar
    </CButton>
    <CButton
      style={{ backgroundColor: '#4B6251', color: 'white' }}
      onClick={handleCreateGenero}
      disabled={generoError.Tipo_genero}
    >
      <CIcon icon={cilSave} style={{ marginRight: '5px' }} /> Guardar
    </CButton>
  </CModalFooter>
</CModal>


{/**************************************************************************************************************************************/}

<CModal visible={modalUpdateVisible} backdrop="static" size="lg">
  <CModalHeader closeButton={false}>
    <CModalTitle>Actualizar Género</CModalTitle>
    <CButton className="btn-close" aria-label="Close" onClick={() => handleCloseModal(setModalUpdateVisible, resetGeneroToUpdate)} />
  </CModalHeader>
  <CModalBody>
    <CForm>
      <CInputGroup className="mb-3">
        <CInputGroupText>Tipo Género</CInputGroupText>
        <CFormInput
          type="text"
          placeholder="Ingrese el tipo de género"
          maxLength={50}
          onPaste={disableCopyPaste}
          onCopy={disableCopyPaste}
          value={generoToUpdate.Tipo_genero}
          onChange={(e) => handleTipoGeneroInputChange(e, setGeneroToUpdate)}
          onKeyDown={handleGeneroPersonaKeyDown } 
          style={{ textTransform: 'uppercase' }}
        />
      </CInputGroup>
      {generoError.Tipo_genero && <p style={{ color: 'red' }}>{generoError.Tipo_genero}</p>}
    </CForm>
  </CModalBody>
  <CModalFooter>
    <CButton color="secondary" onClick={() => handleCloseModal(setModalUpdateVisible, resetGeneroToUpdate)}>
      Cancelar
    </CButton>
    <CButton
      style={{ backgroundColor: '#4B6251', color: 'white' }}
      onClick={handleUpdateGenero}
      disabled={generoError.Tipo_genero}
    >
      <CIcon icon={cilSave} style={{ marginRight: '5px' }} /> Guardar
    </CButton>
  </CModalFooter>
</CModal>



{/**************************************************************************************************************************************/}

<CModal visible={modalDeleteVisible} onClose={() => setModalDeleteVisible(false)} backdrop="static">
  <CModalHeader>
    <CModalTitle>Eliminar Género</CModalTitle>
  </CModalHeader>
  <CModalBody>
    ¿Estás seguro de que deseas eliminar el género "{generoToDelete.Tipo_genero}"?
  </CModalBody>
  <CModalFooter>
    <CButton color="secondary" onClick={() => setModalDeleteVisible(false)}>
      Cancelar
    </CButton>
    <CButton color="danger" onClick={handleDeleteGenero}>
      Eliminar
    </CButton>
  </CModalFooter>
</CModal>


{/**************************************************************************************************************************************/}

{/**************************************************************************************************************************************/}
    </CContainer>
  );
};

export default ListaGeneroPersona;
