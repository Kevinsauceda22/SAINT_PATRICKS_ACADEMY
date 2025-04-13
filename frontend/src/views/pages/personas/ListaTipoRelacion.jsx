import React, { useState, useEffect } from 'react';
import { CIcon } from '@coreui/icons-react';
import {  cilSearch, cilBrushAlt, cilPen, cilTrash, cilPlus, cilSave, cilFile ,cilSpreadsheet , cilDescription} from '@coreui/icons';
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

const ListaTipoRelacion = () => {
  const {canSelect, canUpdate, canDelete, canInsert } = usePermission('ListaRelacion');

  const [tipoRelacion, setTipoRelacion] = useState([]);
  const [relacionError, setRelacionError] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalUpdateVisible, setModalUpdateVisible] = useState(false);
  const [modalDeleteVisible, setModalDeleteVisible] = useState(false);
  const [nuevaRelacion, setNuevaRelacion] = useState({ Tipo_relacion: ''});
  const [tipoRelacionToUpdate, setTipoRelacionToUpdate] = useState({});
  const [tipoRelacionToDelete, setTipoRelacionToDelete] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false); // Estado para detectar cambios sin guardar
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTipoRelacion();
  }, []);
  
{/****************************************************************************************************************************************/}
const fetchTipoRelacion = async () => {
  try {
    const response = await fetch(`http://localhost:4000/api/tipoRelacion/verTodoTipoRelacion`);
    const data = await response.json();
    console.log('Datos obtenidos desde la API:', data); // 🔍 LOG para confirmar los datos

    // Verificamos si "data" es un array
    if (!Array.isArray(data)) {
      console.error('Error: La API no está devolviendo un arreglo, sino:', data);
      return;
    }

    // Ordenamos los datos para que el último elemento aparezca primero
    const dataWithIndex = data
      .map((item, index) => ({
        ...item,
        originalIndex: index + 1,
      }))
      .reverse(); // 🔄 Invertimos el orden para mostrar el último primero

    setTipoRelacion(dataWithIndex); // ✅ Ahora sí actualizamos el estado
    console.log('✅ Estado actualizado en orden invertido:', dataWithIndex);
  } catch (error) {
    console.error('Error al obtener tipo relación:', error);
  }
};

{/**************************************************************************************************************************************/}

{/***************************************************************************************************************************************/}
    // Validación de tipo relacion
    const validateTiporelacion = (relacion) => {
      const regex = /^[a-zA-ZÁÉÍÓÚáéíóúÑñ\s]*$/;
      const noMultipleSpaces = !/\s{2,}/.test(relacion); // No permite más de un espacio consecutivo
      const trimmedRelacion = relacion.trim().replace(/\s+/g, ' ');

      if (!regex.test(trimmedRelacion)) {
        swal.fire({
          icon: 'warning',
          title: 'Relación inválida',
          text: 'La relación solo puede contener letras y espacios.',
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
      const words = trimmedRelacion.split(' ');
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

  {/**********************************************************************************************************************************/}
// Capitalizar la primera letra de cada palabra
const capitalizeWords = (str) => {
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
};



{/************************************************************************************************************************************/}

      // Validar si la relacion ya existe
  const isDuplicateRelacion = () => {
    const { tipo_relacion } = nuevaRelacion;
    const existingRelacion = tipoRelacion.find(
      (tipo) =>
        tipo.tipo_relacion.toLowerCase() === tipo_relacion.toLowerCase()
    );
    if (existingRelacion) {
      swal.fire({
        icon: 'warning',
        title: 'Relacion duplicada',
        text: 'Ya existe una relación con el mismo nombre.',
      });

      if (existingRelacion) {
        setRelacionError('Ya existe una relación con el mismo nombre');
    } else {
      setRelacionError(''); // No hay error

      }
      return true;
    }
    return false;
  };

  {/***********************************************************************************************************************************/}


  const handleTipoRelacionInputChange = (e, setFunction) => {
    let value = e.target.value;
  
    // No permitir más de un espacio consecutivo
    value = value.replace(/\s{2,}/g, ' ');
  
    // No permitir que una letra se repita más de 4 veces consecutivamente
    if (/([a-zA-ZÁÉÍÓÚáéíóúÑñ])\1{2,}/.test(value)) {
      swal.fire({
        icon: 'warning',
        title: 'Repetición de letras',
        text: 'No se permite que la misma letra se repita más de 3 veces consecutivas.',
      });
      return;
    }
  
    // Validar longitud mínima
    if (value.length <= 2) {
      setRelacionError('La relación debe tener más de 2 letras.');
    } else {
      setRelacionError(''); // No hay error
    }
  
    setFunction((prevState) => ({
      ...prevState,
      tipo_relacion: value,
    }));
  
    setHasUnsavedChanges(true); // Marcar que hay cambios no guardados
  };
  
  const handleTipoRelacionKeyDown = (event) => {
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
  

{/*************************************************************************************************************************************/}

      // Deshabilitar copiar y pegar
  const disableCopyPaste = (e) => {
    e.preventDefault();
    swal.fire({
      icon: 'warning',
      title: 'Acción bloqueada',
      text: 'Copiar y pegar no está permitido.',
    });
  };

{/*************************************************************************************************************************************/}

const handleEstructuraFamiliarInputChange = (e, setFunction) => {
  let value = e.target.value.trim(); // 🔹 Eliminamos espacios al inicio y al final

  // 🔹 **No permitir más de un espacio consecutivo**
  value = value.replace(/\s{2,}/g, ' ');

  // 🔹 **No permitir que una letra se repita más de 3 veces consecutivamente**
  if (/([a-zA-ZÁÉÍÓÚáéíóúÑñ])\1{2,}/.test(value)) {
    swal.fire({
      icon: 'warning',
      title: 'Repetición de letras',
      text: 'No se permite que la misma letra se repita más de 3 veces consecutivas.',
    });
    return;
  }

  // 🔹 **Validar longitud mínima**
  if (value.length <= 2) {
    setRelacionError('La relación debe tener más de 2 letras.');
  } else {
    setRelacionError(''); // No hay error
  }

  // 🔹 **Validación adicional: evitar caracteres especiales**
  if (!/^[a-zA-ZÁÉÍÓÚáéíóúÑñ\s]+$/.test(value)) {
    swal.fire({
      icon: 'warning',
      title: 'Caracteres no permitidos',
      text: 'Solo se permiten letras y espacios en la relación.',
    });
    return;
  }

  // 🔹 **Guardar el valor en el estado**
  setFunction((prevState) => ({
    ...prevState,
    tipo_relacion: value,
  }));

  setHasUnsavedChanges(true); // 🔄 Marcar cambios no guardados
};

{/*******************************************************************************************************************************************/}
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


{/***************************************************************************************************************************************/}

      const resetNuevaRelacion = () => {
        setNuevaRelacion({ tipo_relacion: ''});
      };
    
      const resetRelacionToUpdate = () => {
        setTipoRelacionToUpdate({ tipo_relacion: ''});
      };

{/********************************************FUNCION PARA CREAR RELACION**************************************************************/}
const handleCreateRelacion = async () => {
  // Validar el tipo de relación antes de enviarlo
  const relacionCapitalizado = capitalizeWords(nuevaRelacion.tipo_relacion.trim().replace(/\s+/g, ' '));

  // Validaciones antes de crear
  if (!validateTiporelacion(relacionCapitalizado)) {
    return;
  }

  try {
    const response = await fetch(`http://localhost:4000/api/tipoRelacion/crearTipoRelacion`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tipo_relacion: relacionCapitalizado,  // Usamos la relación validada
        estado: 1, // Relación activa por defecto
      }),
    });

    if (response.ok) {
      let result;
      try {
        result = await response.json(); // Intentamos obtener el JSON de la respuesta
      } catch (error) {
        console.warn("La API no devolvió JSON, pero la relación fue creada.");
        result = { tipo_relacion: relacionCapitalizado }; // Asumimos que se creó correctamente
      }

      // Actualiza la lista sin recargar la página
      fetchTipoRelacion(); 
      setModalVisible(false); // Cerrar el modal sin advertencia al guardar
      resetNuevaRelacion(); // Reiniciar el estado de la nueva relación
      setHasUnsavedChanges(false); // Reiniciar el estado de cambios no guardados

      swal.fire({
        icon: 'success',
        title: 'Creación exitosa',
        text: `La relación ha sido creada correctamente.`,
      });

    } else {
      swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo crear la relación.',
      });
    }
  } catch (error) {
    console.error('Error al crear la relación:', error);
    swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Ocurrió un error al intentar crear la relación.',
    });
  }
};

  {/*******************************************FUNCION PARA ACTUALIZAR*********************************************************/}
  const handleUpdateRelacion = async () => {
    const relacionCapitalizado = capitalizeWords(tipoRelacionToUpdate.tipo_relacion.trim().replace(/\s+/g, ' '));
  
    if (!validateTiporelacion(relacionCapitalizado)) {
      return;
    }
  
    try {
      const response = await fetch(`http://localhost:4000/api/tipoRelacion/actualizarTipoRelacion/${tipoRelacionToUpdate.Cod_tipo_relacion}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          Cod_tipo_relacion: tipoRelacionToUpdate.Cod_tipo_relacion,
          tipo_relacion: relacionCapitalizado,
          estado: tipoRelacionToUpdate.estado,  // Mantener el estado o modificarlo
        }),
      });
  
      if (response.ok) {
        fetchTipoRelacion();
        setModalUpdateVisible(false); // Cerrar el modal sin advertencia al guardar
        resetRelacionToUpdate();
        setHasUnsavedChanges(false); // Reiniciar el estado de cambios no guardados
        swal.fire({
          icon: 'success',
          title: 'Actualización exitosa',
          text: 'La relación ha sido actualizada correctamente.',
        });
      } else {
        swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo actualizar la relación.',
        });
      }
    } catch (error) {
      console.error('Error al actualizar la relación:', error);
    }
  };
  

{/********************************************************************************************************************************/}
    const handleDeleteRelacion = async () => {
      try {
        const response = await fetch(
          `http://localhost:4000/api/tipoRelacion/eliminarTipoRelacion/${encodeURIComponent(tipoRelacionToDelete.Cod_tipo_relacion)}`,
          {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
  
        if (response.ok) {
          fetchTipoRelacion();
          setModalDeleteVisible(false);
          setTipoRelacionToDelete({});
          swal.fire({
            icon: 'success',
            title: 'Eliminación exitosa',
            text: 'La relación ha sido eliminado correctamente.',
          });
        } else {
          swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo eliminar la relación.',
          });
        }
      } catch (error) {
        console.error('Error al eliminar la relación:', error);
      }
    };

{/*************************************************************************************************************************************/}

  const openUpdateModal = (tipoRelacion) => {
    setTipoRelacionToUpdate(tipoRelacion);
    setModalUpdateVisible(true);
  };

  const openDeleteModal = (tipoRelacion) => {
    setTipoRelacionToDelete(tipoRelacion);
    setModalDeleteVisible(true);
  };


  {/***********************************************************************************************************************************/}
    const toggleEstado = async (tipoRelacion) => {
      // Determinar el nuevo estado: si estaba activo (1) se vuelve inactivo (0) y viceversa
      const nuevoEstado = tipoRelacion.estado ? 0 : 1;
    
      try {
        setLoading(true);
    
        // Realizar la solicitud a la API
        const response = await axios.post('http://localhost:4000/api/tipoRelacion/actualizarEstadoTipoRelacion', {
          cod_tipo_relacion: tipoRelacion.Cod_tipo_relacion,
          estado: nuevoEstado,
        });
    
        // Si la respuesta es exitosa, actualiza el estado local de la lista
        if (response.data.mensaje === 'Estado actualizado exitosamente') {
          setTipoRelacion((prevTipoRelacion) =>
            prevTipoRelacion.map((relacion) =>
              relacion.Cod_tipo_relacion === tipoRelacion.Cod_tipo_relacion
                ? { ...relacion, estado: nuevoEstado }
                : relacion
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
    

    {/***********************************************************************************************************************************/}

    
  {/**************************************************FILTRADO Y BUSQUEDA DE DATOS********************************************************/}

/**************************************************BUSCADOR********************************************************/
// Esta función se dispara al escribir en el campo de búsqueda
const handleSearch = (event) => {
  setSearchTerm(event.target.value);
  setCurrentPage(1);
};

// Filtrado de registros según el término de búsqueda
const filteredTipoRelacion = tipoRelacion.filter((item) =>
  item.tipo_relacion &&
  item.tipo_relacion.toLowerCase().includes(searchTerm.toLowerCase())
);


// Cálculo de la paginación
const indexOfLastRecord = currentPage * recordsPerPage;
const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
const currentRecords = filteredTipoRelacion.slice(indexOfFirstRecord, indexOfLastRecord);


// Función para cambiar de página
const paginate = (pageNumber) => {
  if (pageNumber > 0 && pageNumber <= Math.ceil(filteredTipoRelacion.length / recordsPerPage)) {
    setCurrentPage(pageNumber);
  }
};


/**************************************************REPORTERIA DE PDF********************************************************/
const ReporteRelacionesPDF = () => {
  const doc = new jsPDF('p', 'mm', 'letter'); // Formato vertical

  if (!filteredTipoRelacion || filteredTipoRelacion.length === 0) {
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
    doc.text('Reporte de Relaciones', pageWidth / 2, 40, { align: 'center' });

    doc.setLineWidth(0.5);
    doc.setDrawColor(0, 102, 51);
    doc.line(10, 45, pageWidth - 10, 45);

    let startY = 50; // Reducimos el espacio para acercar la tabla al encabezado

    doc.autoTable({
      startY: startY,
      margin: { left: (pageWidth - 140) / 2 }, // Centrado horizontal
      head: [['#', 'Tipo de Relación', 'Estado']],
      body: filteredTipoRelacion.map((tipo, index) => [
        index + 1,
        tipo.tipo_relacion?.toUpperCase() || 'N/D',
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
        0: { cellWidth: 20 }, // #
        1: { cellWidth: 80 }, // Tipo de Relación
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
          <title>Reporte de Relaciones</title>
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
            <button class="icon-button" onclick="const a = document.createElement('a'); a.href='${pdfURL}'; a.download='Reporte_Relaciones.pdf'; a.click();">
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


{/*********************************************************************************************************************************** */}
const exportToExcel = () => {
  if (!filteredTipoRelacion || filteredTipoRelacion.length === 0) {
    alert('No hay datos para exportar.');
    return;
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Tipo Relación');

  // 🎯 **Título del documento**
  worksheet.mergeCells('A1:C1');
  worksheet.getCell('A1').value = "SAINT PATRICK'S ACADEMY";
  worksheet.getCell('A1').font = { bold: true, size: 18, color: { argb: '006633' } };
  worksheet.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };

  worksheet.mergeCells('A2:C2');
  worksheet.getCell('A2').value = 'TIPOS DE RELACIÓN';
  worksheet.getCell('A2').font = { bold: true, size: 16, color: { argb: '006633' } };
  worksheet.getCell('A2').alignment = { horizontal: 'center', vertical: 'middle' };

  // 📌 **Encabezados de la tabla**
  const headerRow = worksheet.addRow(['#', 'Tipo Relación', 'Estado']);
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '006633' } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
  });

  // 📊 **Datos de la tabla**
  filteredTipoRelacion.forEach((tipo, index) => {
    const row = worksheet.addRow([
      index + 1,
      tipo.tipo_relacion?.toUpperCase() || 'N/D',
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
    saveAs(blob, 'Reporte_TipoRelacion.xlsx');
  });
};

  {/***********************************************************************************************************************************/}
    
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
        <h1 className="mb-0">Mantenimiento de Tipo Relaciones</h1>
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
            onClick={ReporteRelacionesPDF} // Ajustado al formato del estándar
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
            onClick={exportToExcel} // Ajustado al formato del estándar
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
  <CCol xs="12" md="8" className="d-flex flex-wrap align-items-center">
    <CInputGroup className="me-3" style={{ width: '400px' }}>
      <CInputGroupText>
        <CIcon icon={cilSearch} />
      </CInputGroupText>
      <CFormInput
        placeholder="Buscar tipo relaciones ..."
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
                setCurrentPage(1); // Reiniciar a la primera página cuando se cambia el número de registros
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
        <CTableHeaderCell style={{ borderRight: '1px solid #ddd' }} className="text-center">#</CTableHeaderCell>
        <CTableHeaderCell style={{ borderRight: '1px solid #ddd' }} className="text-center">Tipo de Relación</CTableHeaderCell>
        <CTableHeaderCell className="text-center">Acciones</CTableHeaderCell>
      </CTableRow>
    </CTableHead>
    <CTableBody>
      {currentRecords.map((tipoRelacion) => (
        <CTableRow key={tipoRelacion.Cod_tipo_relacion}>
          <CTableDataCell style={{ borderRight: '1px solid #ddd' }} className="text-center">{tipoRelacion.originalIndex}</CTableDataCell>
          <CTableDataCell style={{ borderRight: '1px solid #ddd' }} className="text-center">
            { /* Usa la propiedad normalizada o la original, según tu solución */ }
            {tipoRelacion.tipo_relacion ? tipoRelacion.tipo_relacion.toUpperCase() : tipoRelacion.Tipo_relacion.toUpperCase()}
          </CTableDataCell>
          <CTableDataCell className="text-center">
  <div className="d-flex justify-content-center gap-2">
    {canUpdate && (
      <CButton
        color="warning"
        onClick={() => openUpdateModal(tipoRelacion)}
        disabled={tipoRelacion.estado === 0}
        title={tipoRelacion.estado ? 'Editar relación' : 'Relación inactiva'}
      >
        <CIcon icon={cilPen} />
      </CButton>
    )}
    <CButton
      style={{
        backgroundColor: tipoRelacion.estado ? '#4CAF50' : '#F44336',
        color: 'white',
      }}
      onClick={() => toggleEstado(tipoRelacion)}
      disabled={loading}
    >
      {loading ? 'Cambiando...' : tipoRelacion.estado ? 'Activo' : 'Inactivo'}
    </CButton>
    {canDelete && (
      <CButton color="danger" onClick={() => openDeleteModal(tipoRelacion)}>
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

{/*************************************************************************************************************************************/}
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
          disabled={currentPage === Math.ceil(filteredTipoRelacion.length / recordsPerPage)} // Desactiva si es la última página
          onClick={() => paginate(currentPage + 1)} // Páginas siguientes
        >
          Siguiente
        </CButton>
      </CPagination>
      <span style={{ marginLeft: '10px' }}>
        Página {currentPage} de {Math.ceil(filteredTipoRelacion.length / recordsPerPage)}
      </span>
    </div>
  
{/*********************************************************************************************************************************/}
    <CModal visible={modalVisible} backdrop="static" size="lg">
  <CModalHeader closeButton={false}>
    <CModalTitle>Ingresar Nuevo Tipo de Relación</CModalTitle>
    <CButton className="btn-close" aria-label="Close" onClick={() => handleCloseModal(setModalVisible, resetNuevaRelacion)} />
  </CModalHeader>
  <CModalBody>
    <CForm>
      <CInputGroup className="mb-3">
        <CInputGroupText>Tipo Relación</CInputGroupText>
        <CFormInput
          type="text"
          placeholder="Ingrese un nuevo tipo de relación  "
          maxLength={50}
          onPaste={disableCopyPaste}
          onCopy={disableCopyPaste}
          value={nuevaRelacion.tipo_relacion}
          onChange={(e) => handleTipoRelacionInputChange(e, setNuevaRelacion, setRelacionError)}
          onBlur={isDuplicateRelacion}
          onKeyDown={handleTipoRelacionKeyDown} 
          style={{ textTransform: 'uppercase' }}
        />
      </CInputGroup>
      {relacionError && (
        <p style={{ color: 'red', fontSize: '0.9em' }}>{relacionError}</p>
      )}
    </CForm>
  </CModalBody>
  <CModalFooter>
    <CButton color="secondary" onClick={() => handleCloseModal(setModalVisible, resetNuevaRelacion)}>
      Cancelar
    </CButton>
    <CButton style={{ backgroundColor: '#4B6251', color: 'white' }} onClick={handleCreateRelacion} disabled={!!relacionError.tipo_relacion}>
      <CIcon icon={cilSave} style={{ marginRight: '5px' }} /> Guardar
    </CButton>
  </CModalFooter>
</CModal>

{/**************************************************************************************************************************************/}
<CModal visible={modalUpdateVisible} backdrop="static" size="lg">
  <CModalHeader closeButton={false}>
    <CModalTitle>Actualizar Tipo Relación</CModalTitle>
    <CButton className="btn-close" aria-label="Close" onClick={() => handleCloseModal(setModalUpdateVisible, resetRelacionToUpdate)} />
  </CModalHeader>
  <CModalBody>
    <CForm>
      <CInputGroup className="mb-3">
        <CInputGroupText>Tipo Relación</CInputGroupText>
        <CFormInput
          type="text"
          placeholder="Ingrese el tipo de relación"
          maxLength={50}
          onPaste={disableCopyPaste}
          onCopy={disableCopyPaste}
          value={tipoRelacionToUpdate.tipo_relacion}
          onChange={(e) => handleTipoRelacionInputChange(e, setTipoRelacionToUpdate)}
          onKeyDown={handleTipoRelacionKeyDown} 
          style={{ textTransform: 'uppercase' }}
        />
      </CInputGroup>
      {relacionError.tipo_relacion && <p style={{ color: 'red' }}>{relacionError.tipo_relacion}</p>}
    </CForm>
  </CModalBody>
  <CModalFooter>
      <CButton color="secondary" onClick={() => handleCloseModal(setModalUpdateVisible, resetRelacionToUpdate)}>
      Cancelar
    </CButton>
    <CButton style={{ backgroundColor: '#4B6251', color: 'white' }} onClick={handleUpdateRelacion} disabled={relacionError.tipo_relacion}>
      <CIcon icon={cilSave} style={{ marginRight: '5px' }} /> Guardar
    </CButton>
  </CModalFooter>
</CModal>


{/**************************************************************************************************************************************/}
      {/* Modal Eliminar Relacion*/}
      <CModal visible={modalDeleteVisible} onClose={() => setModalDeleteVisible(false)} backdrop="static">
        <CModalHeader>
          <CModalTitle>Eliminar Tipo Relación</CModalTitle>
        </CModalHeader>
        <CModalBody>
          ¿Estás seguro de que deseas eliminar el tipo de relación "{tipoRelacionToDelete.tipo_relacion}"?
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setModalDeleteVisible(false)}>
            Cancelar
          </CButton>
          <CButton color="danger" onClick={handleDeleteRelacion}>
            Eliminar
          </CButton>
        </CModalFooter>
      </CModal>
{/**************************************************************************************************************************************/}
    </CContainer>
  )
};


export default ListaTipoRelacion;