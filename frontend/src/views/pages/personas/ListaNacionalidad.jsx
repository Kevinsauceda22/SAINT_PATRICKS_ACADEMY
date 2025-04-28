import React, { useState, useEffect } from 'react';
import { CIcon } from '@coreui/icons-react';
import {  cilSearch, cilBrushAlt, cilPen, cilTrash, cilPlus, cilSave,cilDescription, cilSpreadsheet, cilFile} from '@coreui/icons';
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
import AccessDenied from "../AccessDenied/AccessDenied";



const ListaNacionalidad = () => {
    const {canSelect, canUpdate, canDelete, canInsert } = usePermission('ListaNacionalidad');

    const [nacionalidades, setNacionalidades] = useState([]);
    const [nacionalidadError, setNacionalidadError] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [modalUpdateVisible, setModalUpdateVisible] = useState(false);
    const [modalDeleteVisible, setModalDeleteVisible] = useState(false);
    const [nuevaNacionalidad, setNuevaNacionalidad] = useState({
      Id_nacionalidad: "",
      pais_nacionalidad: "",
      pais: "",
      estado: 1,
    });
    
    const [nacionalidadToUpdate, setNacionalidadToUpdate] = useState({
      Id_nacionalidad: "",
      pais_nacionalidad: "",
      pais: "",
      estado: 1,
    });
    
    const [nacionalidadToDelete, setNacionalidadToDelete] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false); // Estado para detectar cambios sin guardar
    const [recordsPerPage, setRecordsPerPage] = useState(10);
    const [loading, setLoading] = useState(false);
    


{/**************************************************************************************************************************************/}
const fetchNacionalidades = async () => {
  try {
    const response = await fetch(`http://localhost:4000/api/nacionalidad/verTodoNacionalidad`);
    const data = await response.json();
    console.log('Datos obtenidos:', data); // Agrega este log para depuración

    // Verificamos si "data" es un array antes de manipularlo
    if (!Array.isArray(data)) {
      console.error('Error: La API no está devolviendo un arreglo, sino:', data);
      return;
    }

    // Ordenamos las nacionalidades alfabéticamente por "pais"
    const dataSorted = data
      .map((nacionalidad, index) => ({
        ...nacionalidad,
        originalIndex: index + 1,
      }))
      .sort((a, b) => a.pais.localeCompare(b.pais)); // 🔠 Ordenamos por "pais"

    setNacionalidades(dataSorted); // Actualiza el estado con los datos ordenados
  } catch (error) {
    console.error('Error al obtener nacionalidades:', error);
  }
};

useEffect(() => {
  fetchNacionalidades();
}, []);


  {/**************************************************************************************************************************************/}
// Validación de nacionalidad
const validateNacionalidad = (nacionalidad) => {
  const regex = /^[a-zA-ZÁÉÍÓÚáéíóúÑñ\s]*$/; // Solo permite letras y espacios
  const noMultipleSpaces = !/\s{2,}/.test(nacionalidad); // No permite más de un espacio consecutivo
  const trimmedNacionalidad = nacionalidad.trim().replace(/\s+/g, ' '); // Elimina espacios innecesarios

  // Validar que solo contenga letras y espacios
  if (!regex.test(trimmedNacionalidad)) {
    swal.fire({
      icon: 'warning',
      title: 'Nacionalidad inválida',
      text: 'La nacionalidad solo puede contener letras y espacios.',
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
  const words = trimmedNacionalidad.split(' ');
  for (let word of words) {
    const letterCounts = {};
    for (let letter of word) {
      letterCounts[letter] = (letterCounts[letter] || 0) + 1;
      if (letterCounts[letter] > 3) {
        swal.fire({
          icon: 'warning',
          title: 'Repetición de letras',
          text: `La letra "${letter}" se repite más de 3 veces en la palabra "${word}".`,
        });
        return false;
      }
    }
  }

  return true; // Validación exitosa
};

  {/**************************************************************************************************************************************/}
  
  // Validar que ningún campo esté vacío
const validateEmptyFields = () => {
  const { Cod_nacionalidad, Id_nacionalidad, pais_nacionalidad, pais } = nuevaNacionalidad;


  if (!Cod_nacionalidad || !Id_nacionalidad || !pais_nacionalidad || !pais) {
    swal.fire({
      icon: 'warning',
      title: 'Campos vacíos',
      text: 'Todos los campos deben estar llenos para poder crear una nacionalidad.',
    });
    return false;
  }
  return true;
};

  {/**************************************************************************************************************************************/}
  
  const isDuplicateNacionalidad = () => {
    const { Cod_nacionalidad, Id_nacionalidad, pais_nacionalidad, pais } = nuevaNacionalidad;
    const existingNacionalidad = nacionalidades.find(
      (nacionalidad) =>
        nacionalidad.Cod_nacionalidad === Cod_nacionalidad ||
        nacionalidad.Id_nacionalidad.toLowerCase() === Id_nacionalidad.toLowerCase() ||
        nacionalidad.pais_nacionalidad.toLowerCase() === pais_nacionalidad.toLowerCase() ||
        nacionalidad.pais.toLowerCase() === pais.toLowerCase()
    );
  
    if (existingNacionalidad) {
      swal.fire({
        icon: 'warning',
        title: 'Nacionalidad duplicada',
        text: 'Ya existe una nacionalidad con los mismos datos.',
      });
  
      setNacionalidadError('Ya existe una nacionalidad con los mismos datos');
      return true; // Indica que la nacionalidad ya existe
    }
  
    setNacionalidadError(''); // No hay error
    return false; // No hay duplicado
  };

{/*******************************************************************************************************************************************/}
  const handleNacionalidadKeyDown = (event) => {
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
  
  const handleNacionalidadInputChange = (e, setFunction) => {
    let value = e.target.value;
  
    // No permitir más de un espacio consecutivo
    value = value.replace(/\s{2,}/g, ' ');
  
    // No permitir que una letra se repita más de 4 veces consecutivamente, pero sin bloquear la escritura
    const wordArray = value.split(' ');
    const isValid = wordArray.every(word => !/(.)\1{3,}/.test(word));
  
    if (!isValid) {
      swal.fire({
        icon: 'warning',
        title: 'Repetición de letras',
        text: 'No se permite que la misma letra se repita más de 4 veces consecutivas.',
      });
    }
  
    // Actualizar el estado correctamente con el valor del input
    setFunction((prevState) => ({
      ...prevState,
      [e.target.name]: value, // ✅ Usa `name` para identificar el campo dinámicamente
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


{/*******************************************************************************************************************************************/}

      const resetNuevaNacionalidad = () => {
        setNuevaNacionalidad({
          Id_nacionalidad: '',
          pais_nacionalidad: '',
          pais: ''
        });
      };
      
      const resetNacionalidadToUpdate = () => {
        setNacionalidadToUpdate({
          Id_nacionalidad: '',
          pais_nacionalidad: '',
          pais: ''
        });
      };
      

  {/**************************************************************************************************************************************/}
  
  const handleCreateNacionalidad = async () => {

  
    try {
      const response = await fetch(`http://localhost:4000/api/nacionalidad/crearNacionalidad`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          Id_nacionalidad: nuevaNacionalidad.Id_nacionalidad,
          pais_nacionalidad: nuevaNacionalidad.pais_nacionalidad,
          pais: nuevaNacionalidad.pais,
          estado: 1, // 🆕 Estado por defecto: Activo
        }),
      });
  
      if (response.ok) {
        let result;
        try {
          result = await response.json(); // Intentamos obtener el JSON de la respuesta
        } catch (error) {
          console.warn("La API no devolvió JSON, pero la nacionalidad fue creada.");
          result = {
            Id_nacionalidad: nuevaNacionalidad.Id_nacionalidad,
            pais_nacionalidad: nuevaNacionalidad.pais_nacionalidad,
            pais: nuevaNacionalidad.pais,
            estado: 1, // 🆕 Confirmamos que se guarda como activo
          };
        }
  
        // Actualiza la lista sin recargar la página
        fetchNacionalidades();
        setModalVisible(false); // Cerrar el modal sin advertencia al guardar
        resetNuevaNacionalidad(); // Reiniciar el estado de la nueva nacionalidad
        setHasUnsavedChanges(false); // Reiniciar el estado de cambios no guardados
  
        swal.fire({
          icon: 'success',
          title: 'Creación exitosa',
          text: `La nacionalidad ha sido creada correctamente.`,
        });
      } else {
        swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo crear la nacionalidad.',
        });
      }
    } catch (error) {
      console.error('Error al crear la nacionalidad:', error);
      swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Ocurrió un error al intentar crear la nacionalidad.',
      });
    }
  };
  
  {/**************************************************************************************************************************************/}
  
  const handleUpdateNacionalidad = async () => {
    try {
      const response = await fetch(
        `http://localhost:4000/api/nacionalidad/actualizarNacionalidad/${nacionalidadToUpdate.Cod_nacionalidad}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            Cod_nacionalidad: nacionalidadToUpdate.Cod_nacionalidad, // Código único
            Id_nacionalidad: nacionalidadToUpdate.Id_nacionalidad, // ID actualizado
            pais_nacionalidad: nacionalidadToUpdate.pais_nacionalidad, // Nacionalidad actualizada
            pais: nacionalidadToUpdate.pais, // País actualizado
            estado: 1, // 🆕 Estado por defecto
          }),
        }
      );
  
      if (response.ok) {
        fetchNacionalidades(); // 🔄 Refrescar lista después de actualizar
        setModalUpdateVisible(false); // 🔄 Cerrar modal sin advertencia al guardar
        resetNacionalidadToUpdate(); // 🔄 Reiniciar estado de nacionalidad a actualizar
        setHasUnsavedChanges(false); // 🔄 Reiniciar cambios no guardados
  
        swal.fire({
          icon: 'success',
          title: 'Actualización exitosa',
          text: 'La nacionalidad ha sido actualizada correctamente.',
        });
      } else {
        swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo actualizar la nacionalidad.',
        });
  
        console.error("❌ Error en la API:", await response.text()); // 🔍 Mostrar error de la API si hay problema
      }
    } catch (error) {
      console.error("🔥 Error al actualizar la nacionalidad:", error);
      swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Ocurrió un error al intentar actualizar la nacionalidad.',
      });
    }
  };
  

  
  {/**************************************************************************************************************************************/}
  
  const handleDeleteNacionalidad = async () => {
    try {
      const response = await fetch(
        `http://localhost:4000/api/nacionalidad/eliminarNacionalidad/${encodeURIComponent(nacionalidadToDelete.Cod_nacionalidad)}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
  
      if (response.ok) {
        fetchNacionalidades(); // Actualiza la lista de nacionalidades
        setModalDeleteVisible(false); // Cierra el modal
        setNacionalidadToDelete({}); // Reinicia el estado de la nacionalidad a eliminar
        swal.fire({
          icon: 'success',
          title: 'Eliminación exitosa',
          text: 'La nacionalidad ha sido eliminada correctamente.',
        });
      } else {
        swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo eliminar la nacionalidad.',
        });
      }
    } catch (error) {
      console.error('Error al eliminar la nacionalidad:', error);
      swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Ocurrió un error al intentar eliminar la nacionalidad.',
      });
    }
  };
  
  {/**************************************************************************************************************************************/}
  
  const toggleEstado = async (nacionalidad) => {
    const nuevoEstado = nacionalidad.estado ? 0 : 1;
  
    try {
      setLoading(true);
  
      const response = await axios.post('http://localhost:4000/api/nacionalidad/actualizarEstadoNacionalidad', {
        Cod_nacionalidad: nacionalidad.Cod_nacionalidad,
        estado: nuevoEstado,
      });
  
      if (response.data.mensaje === 'Estado actualizado exitosamente') {
        // Actualizar el estado correctamente
        setNacionalidades((prevNacionalidades) =>
          prevNacionalidades.map((nac) =>
            nac.Cod_nacionalidad === nacionalidad.Cod_nacionalidad
              ? { ...nac, estado: nuevoEstado }
              : nac
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
  const openUpdateModal = (nacionalidad) => {
    setNacionalidadToUpdate(nacionalidad);
    setModalUpdateVisible(true);
  };
  
  const openDeleteModal = (nacionalidad) => {
    setNacionalidadToDelete(nacionalidad);
    setModalDeleteVisible(true);
  };
  
  {/**************************************************************************************************************************************/}
  
  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };
  
  const filteredNacionalidades = nacionalidades.filter((nacionalidad) => {
    // Convertimos estado a texto
    const estadoTexto = nacionalidad.estado === 1 ? 'ACTIVO' : nacionalidad.estado === 0 ? 'INACTIVO' : 'DESCONOCIDO';
  
    return (
      (nacionalidad.pais_nacionalidad && 
        nacionalidad.pais_nacionalidad.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (nacionalidad.Id_nacionalidad && 
        nacionalidad.Id_nacionalidad.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (nacionalidad.pais && 
        nacionalidad.pais.toLowerCase().includes(searchTerm.toLowerCase())) ||
      estadoTexto.toLowerCase().includes(searchTerm.toLowerCase()) // 🔍 Ahora permite buscar por estado
    );
  });
  
  
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredNacionalidades.slice(indexOfFirstRecord, indexOfLastRecord);
  
  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= Math.ceil(filteredNacionalidades.length / recordsPerPage)) {
      setCurrentPage(pageNumber);
    }
  };
  
  {/**************************************************************************************************************************************/}
  
  const ReporteNacionalidadesPDF = () => {
    const doc = new jsPDF('p', 'mm', 'letter'); // Formato vertical
  
    if (!filteredNacionalidades || filteredNacionalidades.length === 0) {
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
      doc.text('Reporte de Nacionalidades', pageWidth / 2, 40, { align: 'center' });
  
      doc.setLineWidth(0.5);
      doc.setDrawColor(0, 102, 51);
      doc.line(10, 45, pageWidth - 10, 45);
  
      let startY = 50; // Tabla más cerca del encabezado
  
      doc.autoTable({
        startY: startY,
        margin: { left: (pageWidth - 140) / 2 }, // Centrado horizontal
        head: [['#', 'ID Nacionalidad', 'Nacionalidad', 'País', 'Estado']],
        body: filteredNacionalidades.map((nacionalidad, index) => [
          index + 1,
          nacionalidad.Id_nacionalidad || 'N/D',
          nacionalidad.pais_nacionalidad?.toUpperCase() || 'N/D',
          nacionalidad.pais?.toUpperCase() || 'N/D',
          nacionalidad.estado === 1 ? 'ACTIVO' : 'INACTIVO'
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
          1: { cellWidth: 30 }, // ID Nacionalidad
          2: { cellWidth: 40 }, // Nacionalidad
          3: { cellWidth: 40 }, // País
          4: { cellWidth: 25 } // Estado
        },
        alternateRowStyles: { fillColor: [240, 248, 255] },
        didParseCell: (data) => {
          if (data.section === 'body' && data.column.index === 4) {
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
            <title>Reporte de Nacionalidades</title>
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
              <button class="icon-button" onclick="const a = document.createElement('a'); a.href='${pdfURL}'; a.download='Reporte_Nacionalidades.pdf'; a.click();">
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
    if (!filteredNacionalidades || filteredNacionalidades.length === 0) {
      alert('No hay datos para exportar.');
      return;
    }
  
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Nacionalidades');
  
    // 🎯 **Título del documento**
    worksheet.mergeCells('A1:E1');
    worksheet.getCell('A1').value = "SAINT PATRICK'S ACADEMY";
    worksheet.getCell('A1').font = { bold: true, size: 18, color: { argb: '006633' } };
    worksheet.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };
  
    worksheet.mergeCells('A2:E2');
    worksheet.getCell('A2').value = 'LISTA DE NACIONALIDADES';
    worksheet.getCell('A2').font = { bold: true, size: 16, color: { argb: '006633' } };
    worksheet.getCell('A2').alignment = { horizontal: 'center', vertical: 'middle' };
  
    // 📌 **Encabezados de la tabla**
    const headerRow = worksheet.addRow(['#', 'ID Nacionalidad', 'Nacionalidad', 'País', 'Estado']);
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '006633' } };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    });
  
    // 📊 **Datos de la tabla**
    filteredNacionalidades.forEach((nacionalidad, index) => {
      const row = worksheet.addRow([
        index + 1,
        nacionalidad.Id_nacionalidad || 'N/D',
        nacionalidad.pais_nacionalidad?.toUpperCase() || 'N/D',
        nacionalidad.pais?.toUpperCase() || 'N/D',
        nacionalidad.estado === 1 ? 'ACTIVO' : 'INACTIVO'
      ]);
  
      // 🎨 **Estilos para la columna de Estado**
      const estadoCell = row.getCell(5);
      estadoCell.font = {
        bold: true,
        color: { argb: nacionalidad.estado === 1 ? '008000' : 'FF0000' } // ✅ Verde para "ACTIVO", rojo para "INACTIVO"
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
      saveAs(blob, 'Reporte_Nacionalidades.xlsx');
    });
  };
  
  
  {/**************************************************************************************************************************************/}
  
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
    <h1 className="mb-0">Mantenimiento de Países</h1>
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
      onClick={ReporteNacionalidadesPDF}
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
  {/* Barra de búsqueda  */}
  <CCol xs="12" md="8" className="d-flex flex-wrap align-items-center">
    <CInputGroup className="me-3" style={{ width: '400px' }}>
      <CInputGroupText>
        <CIcon icon={cilSearch} />
      </CInputGroupText>
      <CFormInput
        placeholder="Buscar nacionalidad ..."
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


<div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #ccc', padding: '10px', marginBottom: '30px' }}>
  <CTable striped>
    <CTableHead>
      <CTableRow>
        <CTableHeaderCell style={{ borderRight: '1px solid #ddd' }} className="text-center">#</CTableHeaderCell>
        <CTableHeaderCell style={{ borderRight: '1px solid #ddd' }} className="text-center">Prefijo Nacionalidad</CTableHeaderCell>
        <CTableHeaderCell style={{ borderRight: '1px solid #ddd' }} className="text-center">Nacionalidad</CTableHeaderCell>
        <CTableHeaderCell style={{ borderRight: '1px solid #ddd' }} className="text-center">País</CTableHeaderCell>
        <CTableHeaderCell className="text-center">Acciones</CTableHeaderCell>
      </CTableRow>
    </CTableHead>

    <CTableBody>
      {currentRecords.map((nacionalidad) => (
        <CTableRow key={nacionalidad.Cod_nacionalidad}>
          <CTableDataCell style={{ borderRight: '1px solid #ddd' }} className="text-center">{nacionalidad.originalIndex}</CTableDataCell>
          <CTableDataCell style={{ borderRight: '1px solid #ddd' }} className="text-center">{nacionalidad.Id_nacionalidad}</CTableDataCell>
          <CTableDataCell style={{ borderRight: '1px solid #ddd' }} className="text-center">{nacionalidad.pais_nacionalidad.toUpperCase()}</CTableDataCell>
          <CTableDataCell style={{ borderRight: '1px solid #ddd' }} className="text-center">{nacionalidad.pais.toUpperCase()}</CTableDataCell>
          <CTableDataCell className="text-center">
  <div className="d-flex justify-content-center gap-2">
    {canUpdate && (
      <CButton
        color="warning"
        onClick={() => openUpdateModal(nacionalidad)}
        disabled={nacionalidad.estado === 0}
        title={nacionalidad.estado ? 'Editar nacionalidad' : 'Nacionalidad inactiva'}
      >
        <CIcon icon={cilPen} />
      </CButton>
    )}
    {/* Botón de Activar/Inactivar */}
    <CButton
      style={{
        backgroundColor: nacionalidad.estado ? '#4CAF50' : '#F44336',
        color: 'white',
      }}
      onClick={() => toggleEstado(nacionalidad)}
      disabled={loading}
    >
      {loading ? 'Cambiando...' : nacionalidad.estado ? 'Activo' : 'Inactivo'}
    </CButton>
    {canDelete && (
      <CButton color="danger" onClick={() => openDeleteModal(nacionalidad)}>
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
          disabled={currentPage === Math.ceil(filteredNacionalidades.length / recordsPerPage)} // Desactiva si es la última página
          onClick={() => paginate(currentPage + 1)} // Páginas siguientes
        >
          Siguiente
        </CButton>
      </CPagination>
      <span style={{ marginLeft: '10px' }}>
        Página {currentPage} de {Math.ceil(filteredNacionalidades.length / recordsPerPage)}
      </span>
    </div>
  

{/************************************************************************************************************************************/}
<CModal visible={modalVisible} backdrop="static" size="lg">
  <CModalHeader closeButton={false}>
    <CModalTitle>Ingresar Nueva Nacionalidad</CModalTitle>
    <CButton className="btn-close" aria-label="Close" onClick={() => handleCloseModal(setModalVisible, resetNuevaNacionalidad)} />
  </CModalHeader>
  <CModalBody>
    <CForm>
      {/* Campo para ID Nacionalidad */}
      <CInputGroup className="mb-3">
        <CInputGroupText>Prefijo Nacionalidad</CInputGroupText>
        <CFormInput
          type="text"
          name="Id_nacionalidad" // 🆕 Name agregado
          placeholder="Ingrese el ID de la nacionalidad"
          maxLength={10}
          onPaste={disableCopyPaste}
          onCopy={disableCopyPaste}
          value={nuevaNacionalidad.Id_nacionalidad}
          onChange={(e) => handleNacionalidadInputChange(e, setNuevaNacionalidad)}
          onKeyDown={handleNacionalidadKeyDown} 
          onBlur={isDuplicateNacionalidad}  
          style={{ textTransform: 'uppercase' }}
        />
      </CInputGroup>

      <CInputGroup className="mb-3">
        <CInputGroupText>Nacionalidad</CInputGroupText>
        <CFormInput
          type="text"
          name="pais_nacionalidad" // 🆕 Name agregado
          placeholder="Ingrese la nacionalidad"
          maxLength={50}
          onPaste={disableCopyPaste}
          onCopy={disableCopyPaste}
          value={nuevaNacionalidad.pais_nacionalidad}
          onChange={(e) => handleNacionalidadInputChange(e, setNuevaNacionalidad)}
          onKeyDown={handleNacionalidadKeyDown} 
          onBlur={isDuplicateNacionalidad}
          style={{ textTransform: 'uppercase' }}
        />
      </CInputGroup>

      <CInputGroup className="mb-3">
        <CInputGroupText>País</CInputGroupText>
        <CFormInput
          type="text"
          name="pais" // 🆕 Name agregado
          placeholder="Ingrese el país"
          maxLength={50}
          onPaste={disableCopyPaste}
          onCopy={disableCopyPaste}
          value={nuevaNacionalidad.pais}
          onChange={(e) => handleNacionalidadInputChange(e, setNuevaNacionalidad)}
          onKeyDown={handleNacionalidadKeyDown} 
          onBlur={isDuplicateNacionalidad}
          style={{ textTransform: 'uppercase' }}
        />
      </CInputGroup>
    </CForm>
  </CModalBody>
  <CModalFooter>
    <CButton color="secondary" onClick={() => handleCloseModal(setModalVisible, resetNuevaNacionalidad)}>
      Cancelar
    </CButton>
    <CButton style={{ backgroundColor: '#4B6251', color: 'white' }} onClick={handleCreateNacionalidad} >
      <CIcon icon={cilSave} style={{ marginRight: '5px' }} /> Guardar
    </CButton>
  </CModalFooter>
</CModal>

{/*************************************************************************************************************************************/}

<CModal visible={modalUpdateVisible} backdrop="static" size="lg">
  <CModalHeader closeButton={false}>
    <CModalTitle>Actualizar Nacionalidad</CModalTitle>
    <CButton className="btn-close" aria-label="Close" onClick={() => handleCloseModal(setModalUpdateVisible, resetNacionalidadToUpdate)} />
  </CModalHeader>
  <CModalBody>
    <CForm>
      {/* Campo para ID Nacionalidad */}
      <CInputGroup className="mb-3">
        <CInputGroupText>Prefijo Nacionalidad</CInputGroupText>
        <CFormInput
          type="text"
          name="Id_nacionalidad" // ✅ Name agregado
          placeholder="Ingrese el ID de la nacionalidad"
          maxLength={10}
          onPaste={disableCopyPaste}
          onCopy={disableCopyPaste}
          value={nacionalidadToUpdate.Id_nacionalidad}
          onChange={(e) => handleNacionalidadInputChange(e, setNacionalidadToUpdate)}
          onKeyDown={handleNacionalidadKeyDown} 
          onBlur={isDuplicateNacionalidad}
          style={{ textTransform: 'uppercase' }}
        />
      </CInputGroup>
      {nacionalidadError.Id_nacionalidad && <p style={{ color: 'red', fontSize: '0.9em' }}>{nacionalidadError.Id_nacionalidad}</p>}

      {/* Campo para Nacionalidad */}
      <CInputGroup className="mb-3">
        <CInputGroupText>Nacionalidad</CInputGroupText>
        <CFormInput
          type="text"
          name="pais_nacionalidad" // ✅ Name agregado
          placeholder="Ingrese la nacionalidad"
          maxLength={50}
          onPaste={disableCopyPaste}
          onCopy={disableCopyPaste}
          value={nacionalidadToUpdate.pais_nacionalidad}
          onChange={(e) => handleNacionalidadInputChange(e, setNacionalidadToUpdate)}
          onKeyDown={handleNacionalidadKeyDown} 
          onBlur={isDuplicateNacionalidad}
          style={{ textTransform: 'uppercase' }}
        />
      </CInputGroup>
      {nacionalidadError.pais_nacionalidad && <p style={{ color: 'red', fontSize: '0.9em' }}>{nacionalidadError.pais_nacionalidad}</p>}

      {/* Campo para País */}
      <CInputGroup className="mb-3">
        <CInputGroupText>País</CInputGroupText>
        <CFormInput
          type="text"
          name="pais" // ✅ Name agregado
          placeholder="Ingrese el país"
          maxLength={50}
          onPaste={disableCopyPaste}
          onCopy={disableCopyPaste}
          value={nacionalidadToUpdate.pais}
          onChange={(e) => handleNacionalidadInputChange(e, setNacionalidadToUpdate)}
          onKeyDown={handleNacionalidadKeyDown} 
          onBlur={isDuplicateNacionalidad}
          style={{ textTransform: 'uppercase' }}
        />
      </CInputGroup>
      {nacionalidadError.pais && <p style={{ color: 'red', fontSize: '0.9em' }}>{nacionalidadError.pais}</p>}
    </CForm>
  </CModalBody>
  <CModalFooter>
    <CButton color="secondary" onClick={() => handleCloseModal(setModalUpdateVisible, resetNacionalidadToUpdate)}>
      Cancelar
    </CButton>
    <CButton 
  style={{ backgroundColor: '#4B6251', color: 'white', opacity: nacionalidadError ? 0.5 : 1 }} 
  onClick={handleUpdateNacionalidad} 
  disabled={!!nacionalidadError}
>
  <CIcon icon={cilSave} style={{ marginRight: '5px' }} /> Guardar
</CButton>

  </CModalFooter>
</CModal>


{/*************************************************************************************************************************************/}

{/* Modal Eliminar Nacionalidad */}
<CModal visible={modalDeleteVisible} onClose={() => setModalDeleteVisible(false)} backdrop="static">
  <CModalHeader>
    <CModalTitle>Eliminar Nacionalidad</CModalTitle>
  </CModalHeader>
  <CModalBody>
    ¿Estás seguro de que deseas eliminar la nacionalidad con los siguientes datos?
    <ul>
      <li><strong>Prefijo Nacionalidad:</strong> {nacionalidadToDelete.Id_nacionalidad}</li>
      <li><strong>Nacionalidad:</strong> {nacionalidadToDelete.pais_nacionalidad}</li>
      <li><strong>País:</strong> {nacionalidadToDelete.pais}</li>
    </ul>
  </CModalBody>
  <CModalFooter>
    <CButton color="secondary" onClick={() => setModalDeleteVisible(false)}>
      Cancelar
    </CButton>
    <CButton color="danger" onClick={handleDeleteNacionalidad}>
      Eliminar
    </CButton>
  </CModalFooter>
</CModal>

{/*************************************************************************************************************************************/}
</CContainer>
  );
};

export default ListaNacionalidad;
