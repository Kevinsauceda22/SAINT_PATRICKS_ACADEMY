import React, { useState, useEffect } from 'react';
import { CIcon } from '@coreui/icons-react';
import {  cilSearch, cilBrushAlt, cilPen, cilTrash, cilPlus, cilSave, cilFile, cilSpreadsheet, cilDescription} from '@coreui/icons';
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

const ListaDepartamentos = () => {
  const { canSelect, canUpdate, canDelete, canInsert  } = usePermission('ListaDepartamentos');

  const [departamentos, setDepartamentos] = useState([]); // Lista de departamentos
  const [departamentoError, setDepartamentoError] = useState(''); // Estado para errores
  const [modalVisible, setModalVisible] = useState(false); // Modal para nuevo departamento
  const [modalUpdateVisible, setModalUpdateVisible] = useState(false); // Modal de edición
  const [modalDeleteVisible, setModalDeleteVisible] = useState(false); // Modal de eliminación
  const [nuevoDepartamento, setNuevoDepartamento] = useState({ Nombre_departamento: '' }); // Nuevo departamento
  const [departamentoToUpdate, setDepartamentoToUpdate] = useState({}); // Departamento a actualizar
  const [departamentoToDelete, setDepartamentoToDelete] = useState({}); // Departamento a eliminar
  const [searchTerm, setSearchTerm] = useState(''); // Término de búsqueda
  const [currentPage, setCurrentPage] = useState(1); // Página actual para paginación
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false); // Detectar cambios sin guardar
  const [recordsPerPage, setRecordsPerPage] = useState(10); // Registros por página
  const [loading, setLoading] = useState(false); // Cargando
  
  


{/*****************************************************************************************************************************************/}

  const fetchDepartamentos = async () => {
    try {
      const response = await fetch(`http://localhost:4000/api/departamentos/verTodoDepartamento`);
      const data = await response.json();
      console.log('Datos obtenidos:', data); // Agrega este log para depurar

      // Verificamos si "data" es un array antes de manipularlo
      if (!Array.isArray(data)) {
        console.error('Error: La API no está devolviendo un arreglo, sino:', data);
        return;
      }

      // Ordenamos los datos alfabéticamente por "Nombre_departamento"
      const dataSorted = data
        .map((departamentos, index) => ({
          ...departamentos,
          originalIndex: index + 1, // Índice basado en el orden de obtención
        }))
        .sort((a, b) => a.Nombre_departamento.localeCompare(b.Nombre_departamento)); // 🔠 Ordenamos alfabéticamente

      setDepartamentos(dataSorted); // Actualiza el estado con datos ordenados
    } catch (error) {
      console.error('Error al obtener departamentos:', error);
    }
  };

  useEffect(() => {
    fetchDepartamentos();
  }, []);

  

{/*********************************************************************************************************************************** */}
const validateDepartamento = (departamento) => {
  const regex = /^[a-zA-ZÁÉÍÓÚáéíóúÑñ\s]*$/; // Solo permite letras y espacios
  const noMultipleSpaces = !/\s{2,}/.test(departamento); // No permite más de un espacio consecutivo
  const trimmedDepartamento = departamento.trim().replace(/\s+/g, ' '); // Elimina espacios innecesarios

  // Validar que solo contenga letras y espacios
  if (!regex.test(trimmedDepartamento)) {
    swal.fire({
      icon: 'warning',
      title: 'Departamento inválido',
      text: 'El nombre del departamento solo puede contener letras y espacios.',
    });
    return false;
  }

  // Validar que no tenga espacios múltiples
  if (!noMultipleSpaces) {
    swal.fire({
      icon: 'warning',
      title: 'Espacios múltiples',
      text: 'No se permite más de un espacio entre palabras.',
    });
    return false;
  }

  // Validar que ninguna letra se repita más de 4 veces seguidas
  const words = trimmedDepartamento.split(' ');
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

  return true; // Validación exitosa
};

{/***************************************************************************************************************************************/}

// Capitalizar la primera letra de cada palabra
const capitalizeWords = (str) => {
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
};

// Validar que ningún campo esté vacío
const validateEmptyFields = () => {
  const { Nombre_departamento } = nuevoDepartamento; // Ajuste para departamentos
  if (!Nombre_departamento) {
    swal.fire({
      icon: 'warning',
      title: 'Campos vacíos',
      text: 'Todos los campos deben estar llenos para poder crear un departamento.',
    });
    return false;
  }
  return true;
};


{/****************************************************************************************************************************************/}

// Validar si el departamento ya existe
const isDuplicateDepartamento = () => {
  const { Nombre_departamento } = nuevoDepartamento;
  const existingDepartamento = departamentos.find(
    (departamento) =>
      departamento.Nombre_departamento.toLowerCase() === Nombre_departamento.toLowerCase()
  );

  if (existingDepartamento) {
    swal.fire({
      icon: 'warning',
      title: 'Departamento duplicado',
      text: 'Ya existe un departamento con el mismo nombre.',
    });

    if (existingDepartamento) {
      setDepartamentoError('Ya existe un departamento con el mismo nombre');
    } else {
      setDepartamentoError(''); // No hay error
    }
    return true; // Indica que el departamento ya existe
  }
  return false; // No hay duplicado
};

{/***************************************************************************************************************************************/}
const handleDepartamentoKeyDown = (event) => {
  const char = event.key;
  
  // Permitir teclas esenciales como borrar y navegación
  const allowedKeys = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Tab", "Enter"];

  if (allowedKeys.includes(char)) {
    return; // ✅ Permitir acciones básicas
  }

  // Bloquear números y caracteres especiales (excepto letras, acentos y comas)
  if (!/^[a-zA-ZÁÉÍÓÚáéíóúÑñ, ]$/.test(char)) {
    event.preventDefault(); // 🚫 Bloquea caracteres no permitidos
  }

  // Bloquear más de dos espacios consecutivos
  const inputValue = event.target.value;
  if (char === " " && inputValue.slice(-2) === "  ") {
    event.preventDefault(); // 🚫 Bloquea el tercer espacio consecutivo
  }
};

{/******************************************************************************************************************************************/}
const handleDepartamentoInputChange = (e, setFunction) => {
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
    setDepartamentoError('El nombre del departamento debe tener más de 2 letras.');
  } else {
    setDepartamentoError(''); // No hay error
  }

  setFunction((prevState) => ({
    ...prevState,
    Nombre_departamento: value,
  }));

  setHasUnsavedChanges(true); // Marcar que hay cambios no guardados
};

{/**************************************************************************************************************************************/}

  const disableCopyPaste = (e) => {
    e.preventDefault();
    swal.fire({
      icon: 'warning',
      title: 'Acción bloqueada',
      text: 'Copiar y pegar no está permitido.',
    });
  };

{/****************************************************************************************************************************************/}

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

    const resetNuevoDepartamento = () => {
      setNuevoDepartamento({ Nombre_departamento: '' });
    };
    
    const resetDepartamentoToUpdate = () => {
      setDepartamentoToUpdate({ Nombre_departamento: '' });
    };
    

{/***************************************************************************************************************************************/}

const handleCreateDepartamento = async () => {
  // Validar el nombre del departamento antes de enviarlo
  const departamentoCapitalizado = capitalizeWords(
    nuevoDepartamento.Nombre_departamento.trim().replace(/\s+/g, ' ')
  );

  // Validaciones antes de crear
  if (!validateDepartamento(departamentoCapitalizado)) {
    return;
  }

  try {
    const response = await fetch(`http://localhost:4000/api/departamentos/crearDepartamento`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        Nombre_departamento: departamentoCapitalizado, // Usamos el nombre del departamento validado
        estado: 1, // Departamento activo por defecto
      }),
    });

    if (response.ok) {
      let result;
      try {
        result = await response.json(); // Intentamos obtener el JSON de la respuesta
      } catch (error) {
        console.warn("La API no devolvió JSON, pero el departamento fue creado.");
        result = { Nombre_departamento: departamentoCapitalizado }; // Asumimos que se creó correctamente
      }

      // Actualiza la lista sin recargar la página
      fetchDepartamentos();
      setModalVisible(false); // Cerrar el modal sin advertencia al guardar
      resetNuevoDepartamento(); // Reiniciar el estado del nuevo departamento
      setHasUnsavedChanges(false); // Reiniciar el estado de cambios no guardados

      swal.fire({
        icon: 'success',
        title: 'Creación exitosa',
        text: `El departamento ha sido creado correctamente.`,
      });

    } else {
      swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo crear el departamento.',
      });
    }
  } catch (error) {
    console.error('Error al crear el departamento:', error);
    swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Ocurrió un error al intentar crear el departamento.',
    });
  }
};

{/***************************************************************************************************************************************/}

const handleUpdateDepartamento = async () => {
  const departamentoCapitalizado = capitalizeWords(
    departamentoToUpdate.Nombre_departamento.trim().replace(/\s+/g, ' ')
  );

  if (!validateDepartamento(departamentoCapitalizado)) {
    return;
  }

  try {
    const response = await fetch(
      `http://localhost:4000/api/departamentos/actualizarDepartamento/${departamentoToUpdate.Cod_departamento}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          Cod_departamento: departamentoToUpdate.Cod_departamento,
          Nombre_departamento: departamentoCapitalizado,
          estado: departamentoToUpdate.estado, // Mantener el estado o modificarlo
        }),
      }
    );

    if (response.ok) {
      fetchDepartamentos(); // Actualiza la lista sin recargar la página
      setModalUpdateVisible(false); // Cerrar el modal sin advertencia al guardar
      resetDepartamentoToUpdate(); // Reiniciar el estado del departamento a actualizar
      setHasUnsavedChanges(false); // Reiniciar el estado de cambios no guardados
      swal.fire({
        icon: 'success',
        title: 'Actualización exitosa',
        text: 'El departamento ha sido actualizado correctamente.',
      });
    } else {
      swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo actualizar el departamento.',
      });
    }
  } catch (error) {
    console.error('Error al actualizar el departamento:', error);
    swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Ocurrió un error al intentar actualizar el departamento.',
    });
  }
};

{/**************************************************************************************************************************************/}

const handleDeleteDepartamento = async () => {
  try {
    const response = await fetch(
      `http://localhost:4000/api/departamentos/eliminarDepartamento/${encodeURIComponent(departamentoToDelete.Cod_departamento)}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.ok) {
      fetchDepartamentos(); // Actualiza la lista sin recargar la página
      setModalDeleteVisible(false); // Cierra el modal
      setDepartamentoToDelete({}); // Reinicia el estado del departamento a eliminar
      swal.fire({
        icon: 'success',
        title: 'Eliminación exitosa',
        text: 'El departamento ha sido eliminado correctamente.',
      });
    } else {
      swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo eliminar el departamento.',
      });
    }
  } catch (error) {
    console.error('Error al eliminar el departamento:', error);
    swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Ocurrió un error al intentar eliminar el departamento.',
    });
  }
};

{/***************************************************************************************************************************************/}

const toggleEstado = async (departamento) => {
  // Determinar el nuevo estado: si estaba activo (1) se vuelve inactivo (0) y viceversa
  const nuevoEstado = departamento.estado ? 0 : 1;

  try {
      setLoading(true);

      // Realizar la solicitud a la API
      const response = await axios.post('http://localhost:4000/api/departamentos/actualizarEstadoDepartamento', {
        Cod_departamento: departamento.Cod_departamento,
          estado: nuevoEstado,
      });

      // Si la respuesta es exitosa, actualiza el estado local de la lista
      if (response.data.mensaje === 'Estado actualizado exitosamente') {
          setDepartamentos((prevDepartamentos) =>
              prevDepartamentos.map((dep) =>
                  dep.Cod_departamento === departamento.Cod_departamento
                      ? { ...dep, estado: nuevoEstado }
                      : dep
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
const openUpdateModal = (departamento) => {
  setDepartamentoToUpdate(departamento);
  setModalUpdateVisible(true);
};

const openDeleteModal = (departamento) => {
  setDepartamentoToDelete(departamento);
  setModalDeleteVisible(true);
};

{/**************************************************************************************************************************************/}

// Manejar la búsqueda
const handleSearch = (event) => {
  setSearchTerm(event.target.value); // Actualizar el término de búsqueda
  setCurrentPage(1); // Reiniciar la paginación a la primera página
};

// Filtrar departamentos según el término de búsqueda
const filteredDepartamentos = departamentos.filter((departamento) => 
  departamento.Nombre_departamento &&
  departamento.Nombre_departamento.toLowerCase().includes(searchTerm.toLowerCase())
);

// Calcular los índices para la paginación
const indexOfLastRecord = currentPage * recordsPerPage;
const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;

// Obtener los registros actuales que se mostrarán en la página actual
const currentRecords = filteredDepartamentos.slice(indexOfFirstRecord, indexOfLastRecord);

// Cambiar de página en la paginación
const paginate = (pageNumber) => {
  if (pageNumber > 0 && pageNumber <= Math.ceil(filteredDepartamentos.length / recordsPerPage)) {
    setCurrentPage(pageNumber); // Cambiar a la página seleccionada
  }
};


{/********************************************************************************************************************************/}

const ReporteDepartamentosPDF = () => {
  const doc = new jsPDF('p', 'mm', 'letter'); // Formato vertical

  if (!filteredDepartamentos || filteredDepartamentos.length === 0) {
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
    doc.text('Reporte de Departamentos', pageWidth / 2, 40, { align: 'center' });

    doc.setLineWidth(0.5);
    doc.setDrawColor(0, 102, 51);
    doc.line(10, 45, pageWidth - 10, 45);

    let startY = 50; // Tabla más cerca del encabezado

    doc.autoTable({
      startY: startY,
      margin: { left: (pageWidth - 140) / 2 }, // Centrado horizontal
      head: [['#', 'Nombre del Departamento', 'Estado']],
      body: filteredDepartamentos.map((departamento, index) => [
        index + 1,
        departamento.Nombre_departamento?.toUpperCase() || 'N/D',
        departamento.estado === 1 ? 'ACTIVO' : 'INACTIVO'
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
        1: { cellWidth: 80 }, // Nombre del Departamento
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
          <title>Reporte de Departamentos</title>
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
            <button class="icon-button" onclick="const a = document.createElement('a'); a.href='${pdfURL}'; a.download='Reporte_Departamentos.pdf'; a.click();">
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

const exportDepartamentosToExcel = () => {
  if (!filteredDepartamentos || filteredDepartamentos.length === 0) {
    alert('No hay datos para exportar.');
    return;
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Departamentos');

  // 🎯 **Título del documento**
  worksheet.mergeCells('A1:C1');
  worksheet.getCell('A1').value = "SAINT PATRICK'S ACADEMY";
  worksheet.getCell('A1').font = { bold: true, size: 18, color: { argb: '006633' } };
  worksheet.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };

  worksheet.mergeCells('A2:C2');
  worksheet.getCell('A2').value = 'LISTA DE DEPARTAMENTOS';
  worksheet.getCell('A2').font = { bold: true, size: 16, color: { argb: '006633' } };
  worksheet.getCell('A2').alignment = { horizontal: 'center', vertical: 'middle' };

  // 📌 **Encabezados de la tabla**
  const headerRow = worksheet.addRow(['#', 'Nombre del Departamento', 'Estado']);
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '006633' } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
  });

  // 📊 **Datos de la tabla**
  filteredDepartamentos.forEach((departamento, index) => {
    const row = worksheet.addRow([
      index + 1,
      departamento.Nombre_departamento?.toUpperCase() || 'N/D',
      departamento.estado === 1 ? 'ACTIVO' : 'INACTIVO'
    ]);

    // 🎨 **Estilos para la columna de Estado**
    const estadoCell = row.getCell(3);
    estadoCell.font = {
      bold: true,
      color: { argb: departamento.estado === 1 ? '008000' : 'FF0000' } // ✅ Verde para "ACTIVO", rojo para "INACTIVO"
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
    saveAs(blob, 'Reporte_Departamentos.xlsx');
  });
};


{/**************************************************************************************************************************************/}
    // Verificar permisos
 if (!canSelect) {
  return <AccessDenied />;
}

  return (
    <CContainer>
{/* Contenedor del h1 y botón "Nuevo" */}
<CRow className="align-items-center mb-5">
  <CCol xs="8" md="9">
    {/* Título de la página */}
    <h1 className="mb-0">Mantenimiento de Departamentos</h1>
  </CCol>
  <CCol xs="4" md="3" className="text-end d-flex flex-column flex-md-row justify-content-md-end align-items-md-center">
    {/* Botón Nuevo para abrir el modal */}

    {canInsert && (
    <CButton 
      style={{ backgroundColor: '#4B6251', color: 'white' }} 
      className="mb-3 mb-md-0 me-md-3" // Margen inferior en pantallas pequeñas, margen derecho en pantallas grandes
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
        {/* Reporte PDF */}
        <CDropdownItem
            onClick={ReporteDepartamentosPDF}
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
            <CIcon icon={cilFile} size="sm" /> Descargar en PDF
        </CDropdownItem>

        {/* Reporte Excel */}
        <CDropdownItem
            onClick={exportDepartamentosToExcel}
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
            <CIcon icon={cilSpreadsheet} size="sm" /> Descargar en Excel
        </CDropdownItem>
    </CDropdownMenu>
</CDropdown>

  </CCol>
</CRow>

{/* Contenedor de la barra de búsqueda y el selector dinámico */}
<CRow className="align-items-center mt-4 mb-2">
  {/* Barra de búsqueda  */}
  <CCol xs="12" md="8" className="d-flex flex-wrap align-items-center">
    <CInputGroup className="me-3" style={{ width: '400px' }}>
      <CInputGroupText>
        <CIcon icon={cilSearch} />
      </CInputGroupText>
      <CFormInput
        placeholder="Buscar departamentos ..."
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

{/**********************************************************************************************************************************************/}
<div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #ccc', padding: '10px', marginBottom: '30px' }}>
  <CTable striped>
    <CTableHead>
      <CTableRow>
        <CTableHeaderCell style={{ borderRight: '1px solid #ddd' }} className="text-center"> #</CTableHeaderCell>
        <CTableHeaderCell style={{ borderRight: '1px solid #ddd' }} className="text-center">Nombre del Departamento</CTableHeaderCell>
        <CTableHeaderCell className="text-center">Acciones</CTableHeaderCell>
      </CTableRow>
    </CTableHead>

    <CTableBody>
      {currentRecords.map((departamento) => (
        <CTableRow key={departamento.Cod_departamento}>
          <CTableDataCell style={{ borderRight: '1px solid #ddd' }} className="text-center">{departamento.originalIndex}</CTableDataCell>
          <CTableDataCell style={{ borderRight: '1px solid #ddd' }} className="text-center">{departamento.Nombre_departamento.toUpperCase()}</CTableDataCell>
          <CTableDataCell className="text-center">
  <div className="d-flex justify-content-center gap-2">
    {canUpdate && (
      <CButton
        color="warning"
        onClick={() => openUpdateModal(departamento)}
        disabled={departamento.estado === 0}
        title={departamento.estado ? 'Editar departamento' : 'Departamento inactivo'}
      >
        <CIcon icon={cilPen} />
      </CButton>
    )}
    {/* Botón de Activar/Inactivar */}
    <CButton
      style={{
        backgroundColor: departamento.estado ? '#4CAF50' : '#F44336',
        color: 'white',
      }}
      onClick={() => toggleEstado(departamento)}
      disabled={loading}
    >
      {loading ? 'Cambiando...' : departamento.estado ? 'Activo' : 'Inactivo'}
    </CButton>
    {canDelete && (
      <CButton color="danger" onClick={() => openDeleteModal(departamento)}>
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
{/************************************************************************************************************************************/}

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
      disabled={currentPage === Math.ceil(filteredDepartamentos.length / recordsPerPage)} // Desactiva si es la última página
      onClick={() => paginate(currentPage + 1)} // Páginas siguientes
    >
      Siguiente
    </CButton>
  </CPagination>
  <span style={{ marginLeft: '10px' }}>
    Página {currentPage} de {Math.ceil(filteredDepartamentos.length / recordsPerPage)}
  </span>
</div>

{/*************************************************************************************************************************************/}

<CModal visible={modalVisible} backdrop="static" size="lg">
  <CModalHeader closeButton={false}>
    <CModalTitle>Ingresar Nuevo Departamento</CModalTitle>
    <CButton className="btn-close" aria-label="Close" onClick={() => handleCloseModal(setModalVisible, resetNuevoDepartamento)} />
  </CModalHeader>
  <CModalBody>
    <CForm>
      <CInputGroup className="mb-3">
        <CInputGroupText>Nombre del Departamento</CInputGroupText>
        <CFormInput
          type="text"
          placeholder="Ingrese un nuevo nombre de departamento"
          maxLength={50}
          onPaste={disableCopyPaste}
          onCopy={disableCopyPaste}
          value={nuevoDepartamento.Nombre_departamento}
          onChange={(e) => handleDepartamentoInputChange(e, setNuevoDepartamento, setDepartamentoError)}
          onBlur={isDuplicateDepartamento}
          onKeyDown={handleDepartamentoKeyDown} 
          style={{ textTransform: 'uppercase' }}
        />
      </CInputGroup>
      {departamentoError && (
        <p style={{ color: 'red', fontSize: '0.9em' }}>{departamentoError}</p>
      )}
    </CForm>
  </CModalBody>
  <CModalFooter>
    <CButton color="secondary" onClick={() => handleCloseModal(setModalVisible, resetNuevoDepartamento)}>
      Cancelar
    </CButton>
    <CButton style={{ backgroundColor: '#4B6251', color: 'white' }} onClick={handleCreateDepartamento} disabled={!!departamentoError}>
      <CIcon icon={cilSave} style={{ marginRight: '5px' }} /> Guardar
    </CButton>
  </CModalFooter>
</CModal>
{/***************************************************************************************************************************************/}

<CModal visible={modalUpdateVisible} backdrop="static" size="lg">
  <CModalHeader closeButton={false}>
    <CModalTitle>Actualizar Departamento</CModalTitle>
    <CButton className="btn-close" aria-label="Close" onClick={() => handleCloseModal(setModalUpdateVisible, resetDepartamentoToUpdate)} />
  </CModalHeader>
  <CModalBody>
    <CForm>
      <CInputGroup className="mb-3">
        <CInputGroupText>Nombre del Departamento</CInputGroupText>
        <CFormInput
          type="text"
          placeholder="Ingrese el nombre del departamento"
          maxLength={50}
          onPaste={disableCopyPaste}
          onCopy={disableCopyPaste}
          value={departamentoToUpdate.Nombre_departamento}
          onChange={(e) => handleDepartamentoInputChange(e, setDepartamentoToUpdate)}
          onKeyDown={handleDepartamentoKeyDown} 
          style={{ textTransform: 'uppercase' }}
        />
      </CInputGroup>
      {departamentoError.Nombre_departamento && <p style={{ color: 'red' }}>{departamentoError.Nombre_departamento}</p>}
    </CForm>
  </CModalBody>
  <CModalFooter>
    <CButton color="secondary" onClick={() => handleCloseModal(setModalUpdateVisible, resetDepartamentoToUpdate)}>
      Cancelar
    </CButton>
    <CButton style={{ backgroundColor: '#4B6251', color: 'white' }} onClick={handleUpdateDepartamento} disabled={departamentoError.Nombre_departamento}>
      <CIcon icon={cilSave} style={{ marginRight: '5px' }} /> Guardar
    </CButton>
  </CModalFooter>
</CModal>

{/***************************************************************************************************************************************/}

{/* Modal Eliminar Departamento */}
<CModal visible={modalDeleteVisible} onClose={() => setModalDeleteVisible(false)} backdrop="static">
  <CModalHeader>
    <CModalTitle>Eliminar Departamento</CModalTitle>
  </CModalHeader>
  <CModalBody>
    ¿Estás seguro de que deseas eliminar el departamento "{departamentoToDelete.Nombre_departamento}"?
  </CModalBody>
  <CModalFooter>
    <CButton color="secondary" onClick={() => setModalDeleteVisible(false)}>
      Cancelar
    </CButton>
    <CButton color="danger" onClick={handleDeleteDepartamento}>
      Eliminar
    </CButton>
  </CModalFooter>
</CModal>


{/****************************************************************************************************************************************/}

    </CContainer>
  );
};

export default ListaDepartamentos;
