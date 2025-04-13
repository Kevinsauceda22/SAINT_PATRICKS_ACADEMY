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
import AccessDenied from "../AccessDenied/AccessDenied"


const MunicipioMantenimiento = () => {
  const { canSelect, canUpdate, canDelete, canInsert  } = usePermission('ListaMunicipios');

  const [municipios, setMunicipios] = useState([]);
  const [departamentos, setDepartamentos] = useState([]); 
  const [municipioError, setMunicipioError] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalUpdateVisible, setModalUpdateVisible] = useState(false);
  const [modalDeleteVisible, setModalDeleteVisible] = useState(false);
  const [nuevoMunicipio, setNuevoMunicipio] = useState({ Nombre_municipio: '' });
  const [municipioToUpdate, setMunicipioToUpdate] = useState({});
  const [municipioToDelete, setMunicipioToDelete] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false); // Estado para detectar cambios sin guardar
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  




const fetchMunicipios = async () => {
  try {
    const response = await fetch(`http://localhost:4000/api/municipio/verTodoMunicipio`);
    const data = await response.json();
    console.log('Datos obtenidos:', data); // Agrega este log para depurar

    // Verificamos si "data" es un array antes de manipularlo
    if (!Array.isArray(data)) {
      console.error('Error: La API no está devolviendo un arreglo, sino:', data);
      return;
    }

    // Ordenamos los municipios primero por Cod_departamento y luego por Nombre_municipio
    const dataSorted = data
      .map((municipio, index) => ({
        ...municipio,
        originalIndex: index + 1,
      }))
      .sort((a, b) => {
        // Ordenamos primero por Cod_departamento
        if (a.Cod_departamento !== b.Cod_departamento) {
          return a.Cod_departamento - b.Cod_departamento;
        }
        // Si tienen el mismo Cod_departamento, ordenamos por Nombre_municipio
        return a.Nombre_municipio.localeCompare(b.Nombre_municipio);
      });

    setMunicipios(dataSorted); // Actualiza el estado con los datos ordenados
  } catch (error) {
    console.error('Error al obtener municipios:', error);
  }
};

useEffect(() => {
  fetchMunicipios(); // Llama a la función para obtener los municipios
}, []);

  
{/*********************************************************************************************************************************************/}
const fetchDepartamentos = async () => {
  try {
    const response = await fetch(`http://localhost:4000/api/departamentos/verTodoDepartamento`);
    const data = await response.json();

    // Convertir todos los nombres de departamentos a mayúsculas
    const departamentosMayus = data.map((depto) => ({
      ...depto,
      Nombre_departamento: depto.Nombre_departamento.toUpperCase(),
    }));

    setDepartamentos(departamentosMayus);
  } catch (error) {
    console.error('Error al obtener departamentos:', error);
  }
};

    
    useEffect(() => {
      fetchDepartamentos();
    }, []);
    
{/**************************************************************************************************************************************/}

{/****************************************************************************************************************************************/}
// Validación de municipio
const validateMunicipio = (municipio) => {
  const regex = /^[a-zA-ZÁÉÍÓÚáéíóúÑñ\s]*$/; // Solo permite letras y espacios
  const noMultipleSpaces = !/\s{2,}/.test(municipio); // No permite más de un espacio consecutivo
  const trimmedMunicipio = municipio.trim().replace(/\s+/g, ' '); // Elimina espacios innecesarios

  // Validar que solo contenga letras y espacios
  if (!regex.test(trimmedMunicipio)) {
    swal.fire({
      icon: 'warning',
      title: 'Municipio inválido',
      text: 'El nombre del municipio solo puede contener letras y espacios.',
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
  const words = trimmedMunicipio.split(' ');
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

{/****************************************************************************************************************************************/}

// Capitalizar la primera letra de cada palabra
const capitalizeWords = (str) => {
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
};

// Validar que ningún campo esté vacío
const validateEmptyFields = () => {
  const { Nombre_municipio } = nuevoMunicipio; // Ajuste a Nombre_municipio
  if (!Nombre_municipio) {
    swal.fire({
      icon: 'warning',
      title: 'Campos vacíos',
      text: 'Todos los campos deben estar llenos para poder crear un municipio.',
    });
    return false;
  }
  return true;
};


{/****************************************************************************************************************************************/}

// Validar si el municipio ya existe
const isDuplicateMunicipio = () => {
  const { Nombre_municipio } = nuevoMunicipio;
  const existingMunicipio = municipios.find(
    (municipio) =>
      municipio.Nombre_municipio.toLowerCase() === Nombre_municipio.toLowerCase()
  );
  if (existingMunicipio) {
    swal.fire({
      icon: 'warning',
      title: 'Municipio duplicado',
      text: 'Ya existe un municipio con el mismo nombre.',
    });

    if (existingMunicipio) {
      setMunicipioError('Ya existe un municipio con el mismo nombre');
    } else {
      setMunicipioError(''); // No hay error
    }
    return true; // Indica que el municipio ya existe
  }
  return false; // No hay duplicado
};


{/****************************************************************************************************************************************/}

// Función para controlar la entrada de texto en los campos
const handleMunicipioInputChange = (e, setFunction) => {
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
    setMunicipioError('El municipio debe tener más de 2 letras.');
  } else {
    setMunicipioError(''); // No hay error
  }

  setFunction((prevState) => ({
    ...prevState,
    Nombre_municipio: value,
  }));

  setHasUnsavedChanges(true); // Marcar que hay cambios no guardados
};

{/****************************************************************************************************************************************/}

const handleMunicipioKeyDown = (event) => {
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


{/****************************************************************************************************************************************/}

      // Deshabilitar copiar y pegar
  const disableCopyPaste = (e) => {
    e.preventDefault();
    swal.fire({
      icon: 'warning',
      title: 'Acción bloqueada',
      text: 'Copiar y pegar no está permitido.',
    });
  };
{/****************************************************************************************************************************************/}
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


    const resetNuevoMunicipio = () => {
      setNuevoMunicipio({ Nombre_municipio: '' });
    };
    
    const resetMunicipioToUpdate = () => {
      setMunicipioToUpdate({ Nombre_municipio: '' });
    };
    

{/****************************************************************************************************************************************/}

const handleCreateMunicipio = async () => {
  // Validar el nombre del municipio antes de enviarlo
  const municipioCapitalizado = capitalizeWords(
    nuevoMunicipio.Nombre_municipio.trim().replace(/\s+/g, ' ')
  );

  // Validaciones antes de crear
  if (!validateMunicipio(municipioCapitalizado) || !nuevoMunicipio.Cod_departamento) {
    swal.fire({
      icon: 'warning',
      title: 'Validación requerida',
      text: 'Debe ingresar un nombre de municipio válido y seleccionar un departamento.',
    });
    return;
  }

  try {
    const response = await fetch(`http://localhost:4000/api/municipio/crearMunicipio`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        Nombre_municipio: municipioCapitalizado, // Nombre formateado
        Cod_departamento: nuevoMunicipio.Cod_departamento, // Departamento seleccionado
        estado: 1, // Municipio activo por defecto
      }),
    });

    if (response.ok) {
      let result;
      try {
        result = await response.json(); // Intentamos obtener el JSON de la respuesta
      } catch (error) {
        console.warn("La API no devolvió JSON, pero el municipio fue creado.");
        result = { Nombre_municipio: municipioCapitalizado };
      }

      // Actualiza la lista sin recargar la página
      fetchMunicipios();
      fetchDepartamentos();
      setModalVisible(false); // Cerrar el modal sin advertencia al guardar
      resetNuevoMunicipio(); // Reiniciar el estado del nuevo municipio
      setHasUnsavedChanges(false); // Reiniciar el estado de cambios no guardados

      swal.fire({
        icon: 'success',
        title: 'Creación exitosa',
        text: `El municipio ha sido creado correctamente.`,
      });

    } else {
      swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo crear el municipio.',
      });
    }
  } catch (error) {
    console.error('Error al crear el municipio:', error);
    swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Ocurrió un error al intentar crear el municipio.',
    });
  }
};

{/****************************************************************************************************************************************/}

const handleUpdateMunicipio = async () => {
  const municipioCapitalizado = capitalizeWords(
    municipioToUpdate.Nombre_municipio.trim().replace(/\s+/g, ' ')
  );

  // Validaciones antes de actualizar
  if (!validateMunicipio(municipioCapitalizado) || !municipioToUpdate.Cod_departamento) {
    swal.fire({
      icon: 'warning',
      title: 'Validación requerida',
      text: 'Debe ingresar un nombre de municipio válido y seleccionar un departamento.',
    });
    return;
  }

  // 🔍 Log para verificar datos antes de enviar a la API
  console.log("🚀 Datos enviados a la API:", {
    Cod_municipio: municipioToUpdate.Cod_municipio,
    Nombre_municipio: municipioCapitalizado,
    Cod_departamento: municipioToUpdate.Cod_departamento,
    estado: municipioToUpdate.estado,
  });

  try {
    const response = await fetch(
      `http://localhost:4000/api/municipio/actualizarMunicipio/${municipioToUpdate.Cod_municipio}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          Cod_municipio: municipioToUpdate.Cod_municipio,
          Nombre_municipio: municipioCapitalizado,
          Cod_departamento: municipioToUpdate.Cod_departamento,
          estado: municipioToUpdate.estado,
        }),
      }
    );

    // 🔍 Log para verificar si la API respondió correctamente
    console.log("📡 Estado de la respuesta:", response.status);

    if (response.ok) {
      const result = await response.json();
      
      // 🔍 Log para ver qué devuelve la API después de actualizar
      console.log("✅ Respuesta de la API:", result);

      fetchMunicipios();
      fetchDepartamentos();
      setModalUpdateVisible(false);
      resetMunicipioToUpdate();
      setHasUnsavedChanges(false);

      swal.fire({
        icon: 'success',
        title: 'Actualización exitosa',
        text: 'El municipio ha sido actualizado correctamente.',
      });
    } else {
      swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo actualizar el municipio.',
      });

      // 🔍 Log en caso de error en la API
      console.error("❌ Error en la respuesta:", response.status, await response.text());
    }
  } catch (error) {
    console.error("🔥 Error al actualizar municipio:", error);
    swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Ocurrió un error al intentar actualizar el municipio.',
    });
  }
};


{/****************************************************************************************************************************************/}
const handleDeleteMunicipio = async () => {
  try {
    const response = await fetch(
      `http://localhost:4000/api/municipio/eliminarMunicipio/${encodeURIComponent(municipioToDelete.Cod_municipio)}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.ok) {
      fetchMunicipios();
      setModalDeleteVisible(false);
      setMunicipioToDelete({});
      swal.fire({
        icon: 'success',
        title: 'Eliminación exitosa',
        text: 'El municipio ha sido eliminado correctamente.',
      });
    } else {
      swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo eliminar el municipio.',
      });
    }
  } catch (error) {
    console.error('Error al eliminar el municipio:', error);
  }
};


{/****************************************************************************************************************************************/}

const openUpdateModal = (municipio) => {
  setMunicipioToUpdate(municipio);
  setModalUpdateVisible(true);
};

const openDeleteModal = (municipio) => {
  setMunicipioToDelete(municipio);
  setModalDeleteVisible(true);
};


{/****************************************************************************************************************************************/}
const toggleEstado = async (municipio) => {
  const nuevoEstado = municipio.estado ? 0 : 1;

  try {
    setLoading(true);

    const response = await axios.post('http://localhost:4000/api/municipio/actualizarEstadoMunicipio', {
      Cod_municipio: municipio.Cod_municipio,
      estado: nuevoEstado,
    });

    if (response.data.mensaje === 'Estado actualizado exitosamente') {
      // Actualizar el estado correctamente
      setMunicipios((prevMunicipios) =>
        prevMunicipios.map((mun) =>
          mun.Cod_municipio === municipio.Cod_municipio
            ? { ...mun, estado: nuevoEstado }
            : mun
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


{/****************************************************************************************************************************************/}

const handleSearch = (event) => {
  setSearchTerm(event.target.value);
  setCurrentPage(1);
};

// Filtrar municipios por nombre de municipio o departamento
const filteredMunicipios = municipios.filter((municipio) => {
  const nombreMunicipio = municipio.Nombre_municipio ? municipio.Nombre_municipio.toLowerCase() : "";
  const departamentoNombre = departamentos.find((depto) => depto.Cod_departamento === municipio.Cod_departamento)?.Nombre_departamento?.toLowerCase() || "";
  
  return nombreMunicipio.includes(searchTerm.toLowerCase()) || departamentoNombre.includes(searchTerm.toLowerCase());
});


// Paginación mejorada
const indexOfLastRecord = currentPage * recordsPerPage;
const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
const currentRecords = filteredMunicipios.slice(indexOfFirstRecord, indexOfLastRecord);

const paginate = (pageNumber) => {
  if (pageNumber > 0 && pageNumber <= Math.ceil(filteredMunicipios.length / recordsPerPage)) {
    setCurrentPage(pageNumber);
  }
};


{/****************************************************************************************************************************************/}

const ReporteMunicipiosPDF = () => {
  const doc = new jsPDF('p', 'mm', 'letter'); // Formato vertical

  if (!filteredMunicipios || filteredMunicipios.length === 0) {
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
    doc.text('Reporte de Municipios', pageWidth / 2, 40, { align: 'center' });

    doc.setLineWidth(0.5);
    doc.setDrawColor(0, 102, 51);
    doc.line(10, 45, pageWidth - 10, 45);

    let startY = 50; // Tabla más cerca del encabezado

    doc.autoTable({
      startY: startY,
      margin: { left: (pageWidth - 160) / 2 }, // Centrado horizontal
      head: [['#', 'Nombre del Municipio', 'Departamento', 'Estado']],
      body: filteredMunicipios.map((municipio, index) => [
        index + 1,
        municipio.Nombre_municipio?.toUpperCase() || 'N/D',
        departamentos.find((depto) => depto.Cod_departamento === municipio.Cod_departamento)?.Nombre_departamento?.toUpperCase() || 'N/D',
        municipio.estado === 1 ? 'ACTIVO' : 'INACTIVO'
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
        1: { cellWidth: 60 }, // Nombre del Municipio
        2: { cellWidth: 60 }, // Departamento
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
          <title>Reporte de Municipios</title>
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
            <button class="icon-button" onclick="const a = document.createElement('a'); a.href='${pdfURL}'; a.download='Reporte_Municipios.pdf'; a.click();">
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


{/****************************************************************************************************************************************/}

const exportMunicipiosToExcel = () => {
  if (!filteredMunicipios || filteredMunicipios.length === 0) {
    alert('No hay datos para exportar.');
    return;
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Municipios');

  // 🎯 **Título del documento**
  worksheet.mergeCells('A1:D1');
  worksheet.getCell('A1').value = "SAINT PATRICK'S ACADEMY";
  worksheet.getCell('A1').font = { bold: true, size: 18, color: { argb: '006633' } };
  worksheet.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };

  worksheet.mergeCells('A2:D2');
  worksheet.getCell('A2').value = 'LISTA DE MUNICIPIOS';
  worksheet.getCell('A2').font = { bold: true, size: 16, color: { argb: '006633' } };
  worksheet.getCell('A2').alignment = { horizontal: 'center', vertical: 'middle' };

  // 📌 **Encabezados de la tabla**
  const headerRow = worksheet.addRow(['#', 'Nombre del Municipio', 'Departamento', 'Estado']);
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '006633' } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
  });

  // 📊 **Datos de la tabla**
  filteredMunicipios.forEach((municipio, index) => {
    const row = worksheet.addRow([
      index + 1,
      municipio.Nombre_municipio?.toUpperCase() || 'N/D',
      departamentos.find((depto) => depto.Cod_departamento === municipio.Cod_departamento)?.Nombre_departamento?.toUpperCase() || 'N/D',
      municipio.estado === 1 ? 'ACTIVO' : 'INACTIVO'
    ]);

    // 🎨 **Estilos para la columna de Estado**
    const estadoCell = row.getCell(4);
    estadoCell.font = {
      bold: true,
      color: { argb: municipio.estado === 1 ? '008000' : 'FF0000' } // ✅ Verde para "ACTIVO", rojo para "INACTIVO"
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
    saveAs(blob, 'Reporte_Municipios.xlsx');
  });
};


{/****************************************************************************************************************************************/}
{/****************************************************************************************************************************************/}
{/****************************************************************************************************************************************/}

  


      // Verificar permisos
 if (!canSelect) {
  return <AccessDenied />;
}
  return (
    <CContainer>
<CRow className="align-items-center mb-5">
  <CCol xs="8" md="9">
    {/* Título de la página */}
    <h1 className="mb-0">Mantenimiento de Municipios</h1>
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
      onClick={exportMunicipiosToExcel}
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
      onClick={ReporteMunicipiosPDF}
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
        placeholder="Buscar municipios ..."
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

{/************************************************************************************************************************************/}
<div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #ccc', padding: '10px', marginBottom: '30px' }}>
  <CTable striped>
    <CTableHead>
      <CTableRow>
        <CTableHeaderCell style={{ borderRight: '1px solid #ddd' }} className="text-center"> # </CTableHeaderCell>
        <CTableHeaderCell style={{ borderRight: '1px solid #ddd' }} className="text-center">Nombre del Municipio</CTableHeaderCell>
        <CTableHeaderCell style={{ borderRight: '1px solid #ddd' }} className="text-center">Departamento</CTableHeaderCell> {/* 🆕 Nueva columna */}
        <CTableHeaderCell className="text-center">Acciones</CTableHeaderCell>
      </CTableRow>
    </CTableHead>

    <CTableBody>
      {currentRecords.map((municipio) => (
        <CTableRow key={municipio.Cod_municipio}>
          <CTableDataCell style={{ borderRight: '1px solid #ddd' }} className="text-center">{municipio.originalIndex}</CTableDataCell>
          <CTableDataCell style={{ borderRight: '1px solid #ddd' }} className="text-center">
            {municipio.Nombre_municipio ? municipio.Nombre_municipio.toUpperCase() : "N/D"}
          </CTableDataCell>

          <CTableDataCell style={{ borderRight: '1px solid #ddd' }} className="text-center">
            {departamentos.find((depto) => depto.Cod_departamento === municipio.Cod_departamento)?.Nombre_departamento
              ? departamentos.find((depto) => depto.Cod_departamento === municipio.Cod_departamento)?.Nombre_departamento.toUpperCase()
              : "N/D"}
          </CTableDataCell>

          <CTableDataCell className="text-center">
  <div className="d-flex justify-content-center gap-2">
    {canUpdate && (
      <CButton
        color="warning"
        onClick={() => openUpdateModal(municipio)}
        disabled={municipio.estado === 0}
        title={municipio.estado ? 'Editar municipio' : 'Municipio inactivo'}
      >
        <CIcon icon={cilPen} />
      </CButton>
    )}
    {/* Botón de Activar/Inactivar */}
    <CButton
      style={{
        backgroundColor: municipio.estado ? '#4CAF50' : '#F44336',
        color: 'white',
      }}
      onClick={() => toggleEstado(municipio)}
      disabled={loading}
    >
      {loading ? 'Cambiando...' : municipio.estado ? 'Activo' : 'Inactivo'}
    </CButton>
    {canDelete && (
      <CButton color="danger" onClick={() => openDeleteModal(municipio)}>
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
          disabled={currentPage === Math.ceil(filteredMunicipios.length / recordsPerPage)} // Desactiva si es la última página
          onClick={() => paginate(currentPage + 1)} // Páginas siguientes
        >
          Siguiente
        </CButton>
      </CPagination>
      <span style={{ marginLeft: '10px' }}>
        Página {currentPage} de {Math.ceil(filteredMunicipios.length / recordsPerPage)}
      </span>
    </div>

{/************************************************************************************************************************************/}
<CModal visible={modalVisible} backdrop="static" size="lg">
  <CModalHeader closeButton={false}>
    <CModalTitle>Ingresar Nuevo Municipio</CModalTitle>
    <CButton className="btn-close" aria-label="Close" onClick={() => handleCloseModal(setModalVisible, resetNuevoMunicipio)} />
  </CModalHeader>

  <CModalBody>
    <CForm>
      {/* Campo para Nombre del Municipio */}
      <CInputGroup className="mb-3">
        <CInputGroupText>Nombre del Municipio</CInputGroupText>
        <CFormInput
          type="text"
          placeholder="Ingrese un nuevo nombre de municipio"
          maxLength={50}
          onPaste={disableCopyPaste}
          onCopy={disableCopyPaste}
          value={nuevoMunicipio.Nombre_municipio}
          onChange={(e) => handleMunicipioInputChange(e, setNuevoMunicipio, setMunicipioError)}
          onBlur={isDuplicateMunicipio}
          onKeyDown={handleMunicipioKeyDown} 
          style={{ textTransform: 'uppercase' }}
        />
      </CInputGroup>
      {municipioError && <p style={{ color: 'red', fontSize: '0.9em' }}>{municipioError}</p>}

      {/* Nuevo campo para seleccionar el Departamento */}
      <CInputGroup className="mb-3">
        <CInputGroupText>Departamento</CInputGroupText>
        <CFormSelect
            value={nuevoMunicipio.Cod_departamento}
            onChange={(e) =>
              setNuevoMunicipio((prevState) => ({
                ...prevState,
                Cod_departamento: parseInt(e.target.value, 10),
              }))
            }
          >
            <option value="">SELECCIONE UN DEPARTAMENTO</option>
            {departamentos.map((depto) => (
              <option key={depto.Cod_departamento} value={depto.Cod_departamento}>
                {depto.Nombre_departamento}
              </option>
            ))}
          </CFormSelect>

      </CInputGroup>

    </CForm>
  </CModalBody>

  <CModalFooter>
    <CButton color="secondary" onClick={() => handleCloseModal(setModalVisible, resetNuevoMunicipio)}>
      Cancelar
    </CButton>
    <CButton style={{ backgroundColor: '#4B6251', color: 'white' }} onClick={handleCreateMunicipio} >
      <CIcon icon={cilSave} style={{ marginRight: '5px' }} /> Guardar
    </CButton>
  </CModalFooter>
</CModal>


    
{/************************************************************************************************************************************/}

<CModal visible={modalUpdateVisible} backdrop="static" size="lg">
  <CModalHeader closeButton={false}>
    <CModalTitle>Actualizar Municipio</CModalTitle>
    <CButton className="btn-close" aria-label="Close" onClick={() => handleCloseModal(setModalUpdateVisible, resetMunicipioToUpdate)} />
  </CModalHeader>

  <CModalBody>
    <CForm>
      {/* Campo para Nombre del Municipio */}
      <CInputGroup className="mb-3">
        <CInputGroupText>Nombre del Municipio</CInputGroupText>
        <CFormInput
          type="text"
          placeholder="Ingrese el nombre del municipio"
          maxLength={50}
          onPaste={disableCopyPaste}
          onCopy={disableCopyPaste}
          value={municipioToUpdate.Nombre_municipio}
          onChange={(e) => handleMunicipioInputChange(e, setMunicipioToUpdate)}
          onKeyDown={handleMunicipioKeyDown} 
          style={{ textTransform: 'uppercase' }}
        />
      </CInputGroup>
      {municipioError && <p style={{ color: 'red', fontSize: '0.9em' }}>{municipioError}</p>}

      {/* Nuevo campo para seleccionar el Departamento */}
      <CInputGroup className="mb-3">
        <CInputGroupText>Departamento</CInputGroupText>
        <CFormSelect
          value={municipioToUpdate.Cod_departamento}
          onChange={(e) =>
            setMunicipioToUpdate((prevState) => ({
              ...prevState,
              Cod_departamento: parseInt(e.target.value, 10),
            }))
          }
        >
          <option value="">SELECCIONE UN DEPARTAMENTO</option>
          {departamentos.map((depto) => (
            <option key={depto.Cod_departamento} value={depto.Cod_departamento}>
              {depto.Nombre_departamento.toUpperCase()}
            </option>
          ))}
        </CFormSelect>
      </CInputGroup>

    </CForm>
  </CModalBody>

  <CModalFooter>
    <CButton color="secondary" onClick={() => handleCloseModal(setModalUpdateVisible, resetMunicipioToUpdate)}>
      Cancelar
    </CButton>
    <CButton style={{ backgroundColor: '#4B6251', color: 'white' }} onClick={handleUpdateMunicipio}>
      <CIcon icon={cilSave} style={{ marginRight: '5px' }} /> Guardar
    </CButton>
  </CModalFooter>
</CModal>


    
{/************************************************************************************************************************************/}

{/* Modal Eliminar Municipio */}
<CModal visible={modalDeleteVisible} onClose={() => setModalDeleteVisible(false)} backdrop="static">
  <CModalHeader>
    <CModalTitle>Eliminar Municipio</CModalTitle>
  </CModalHeader>
  <CModalBody>
    ¿Estás seguro de que deseas eliminar el municipio "{municipioToDelete.Nombre_municipio}"?
  </CModalBody>
  <CModalFooter>
    <CButton color="secondary" onClick={() => setModalDeleteVisible(false)}>
      Cancelar
    </CButton>
    <CButton color="danger" onClick={handleDeleteMunicipio}>
      Eliminar
    </CButton>
  </CModalFooter>
</CModal>

{/************************************************************************************************************************************/}




    </CContainer>
  );
};

export default MunicipioMantenimiento;
