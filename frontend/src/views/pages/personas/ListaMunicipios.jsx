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


const MunicipioMantenimiento = () => {
  const { canSelect, canUpdate, canDelete, canInsert  } = usePermission('Municipios');

  const [municipios, setMunicipios] = useState([]);
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
      const dataWithIndex = data.map((municipio, index) => ({
        ...municipio,
        originalIndex: index + 1,
      }));
      setMunicipios(dataWithIndex);
    } catch (error) {
      console.error('Error al obtener municipios:', error);
    }
  };
  
  useEffect(() => {
    fetchMunicipios(); // Llama a la función para obtener los municipios
  }, []);
  
{/**************************************************************************************************************************************/}

  //OBTENER DEPARTAMENTOS 



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
  if (!validateMunicipio(municipioCapitalizado)) {
    return;
  }

  try {
    const response = await fetch(`http://localhost:4000/api/municipios/crearMunicipio`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        Nombre_municipio: municipioCapitalizado, // Usamos el nombre del municipio validado
        estado: 1, // Municipio activo por defecto
      }),
    });

    if (response.ok) {
      let result;
      try {
        result = await response.json(); // Intentamos obtener el JSON de la respuesta
      } catch (error) {
        console.warn("La API no devolvió JSON, pero el municipio fue creado.");
        result = { Nombre_municipio: municipioCapitalizado }; // Asumimos que se creó correctamente
      }

      // Actualiza la lista sin recargar la página
      fetchMunicipios();
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

  if (!validateMunicipio(municipioCapitalizado)) {
    return;
  }

  try {
    const response = await fetch(
      `http://localhost:4000/api/municipios/actualizarMunicipio/${municipioToUpdate.Cod_municipio}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          Cod_municipio: municipioToUpdate.Cod_municipio,
          Nombre_municipio: municipioCapitalizado,
          estado: municipioToUpdate.estado, // Mantener el estado o modificarlo
        }),
      }
    );

    if (response.ok) {
      fetchMunicipios();
      setModalUpdateVisible(false); // Cerrar el modal sin advertencia al guardar
      resetMunicipioToUpdate(); // Reiniciar el estado del municipio a actualizar
      setHasUnsavedChanges(false); // Reiniciar el estado de cambios no guardados
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
    }
  } catch (error) {
    console.error('Error al actualizar el municipio:', error);
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
      `http://localhost:4000/api/municipios/eliminarMunicipio/${encodeURIComponent(municipioToDelete.Cod_municipio)}`,
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

    const response = await axios.post('http://localhost:4000/api/municipios/actualizarEstadoMunicipio', {
      cod_municipio: municipio.Cod_municipio,
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

const filteredMunicipios = municipios.filter((municipio) => 
  municipio.Nombre_municipio &&
  municipio.Nombre_municipio.toLowerCase().includes(searchTerm.toLowerCase())
);

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
  const doc = new jsPDF('p', 'mm', 'letter'); 
  
  if (!filteredMunicipios || filteredMunicipios.length === 0) {
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
    doc.text('Reporte de Municipios', pageWidth / 2, 50, { align: 'center' });

    doc.setLineWidth(0.5);
    doc.setDrawColor(0, 102, 51);
    doc.line(10, 60, pageWidth - 10, 60);

    // **Usar filteredMunicipios en lugar de filteredTipoRelacion**
    const tableRows = filteredMunicipios.map((municipio, index) => ({
      index: (index + 1).toString(),
      Nombre_municipio: municipio.Nombre_municipio?.toUpperCase() || 'N/D',
    }));

    const columnWidths = {
      index: 20, // Ancho de la columna #
      Nombre_municipio: 100 // Ancho de la columna "Nombre Municipio"
    };
    const tableWidth = columnWidths.index + columnWidths.Nombre_municipio;

    doc.autoTable({
      startY: 65,
      margin: { left: (pageWidth - tableWidth) / 2 }, // Centrado de la tabla
      columns: [
        { header: '#', dataKey: 'index' },
        { header: 'Nombre del Municipio', dataKey: 'Nombre_municipio' },
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
        index: { cellWidth: 10 },
        Nombre_municipio: { cellWidth: 90 },
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
        <head><title>Reporte de Municipios</title></head>
        <body style="margin:0;">
          <iframe width="100%" height="100%" src="${pdfURL}" frameborder="0"></iframe>
          <div style="position:fixed;top:10px;right:20px;">
            <button style="background-color: #6c757d; color: white; border: none; padding: 10px 15px; border-radius: 5px; cursor: pointer;" 
              onclick="const a = document.createElement('a'); a.href='${pdfURL}'; a.download='Reporte_Municipios.pdf'; a.click();">
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


{/****************************************************************************************************************************************/}

const exportMunicipiosToExcel = () => {
  if (!filteredMunicipios || filteredMunicipios.length === 0) {
    alert('No hay datos para exportar.');
    return;
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Municipios');

  // Título del documento
  worksheet.mergeCells('A1:B1');
  worksheet.getCell('A1').value = "SAINT PATRICK'S ACADEMY";
  worksheet.getCell('A1').font = { bold: true, size: 18, color: { argb: '006633' } };
  worksheet.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };

  worksheet.mergeCells('A2:B2');
  worksheet.getCell('A2').value = 'LISTA DE MUNICIPIOS';
  worksheet.getCell('A2').font = { bold: true, size: 16, color: { argb: '006633' } };
  worksheet.getCell('A2').alignment = { horizontal: 'center', vertical: 'middle' };

  // Encabezados de la tabla
  const headerRow = worksheet.addRow(['#', 'Nombre del Municipio']);
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '006633' } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
  });

  // Datos de la tabla (Usamos filteredMunicipios en lugar de tipoRelacion)
  filteredMunicipios.forEach((municipio, index) => {
    const row = worksheet.addRow([
      index + 1,
      typeof municipio.Nombre_municipio === 'string' ? municipio.Nombre_municipio.toUpperCase() : municipio.Nombre_municipio
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

    {/* Botón de Reporte */}
    <CDropdown>
      <CDropdownToggle
        style={{ backgroundColor: '#6C8E58', color: 'white' }}
      >
        Reportes
      </CDropdownToggle>
      <CDropdownMenu>
        <CDropdownItem onClick={exportMunicipiosToExcel}>Descargar en Excel</CDropdownItem>
        <CDropdownItem onClick={ReporteMunicipiosPDF}>Descargar en PDF</CDropdownItem>
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
        placeholder="Buscar municipio..."
        onChange={handleSearch}
        value={searchTerm}
      />
      <CButton
        style={{border: '1px solid #ccc',
          transition: 'all 0.1s ease-in-out', // Duración de la transición
          backgroundColor: '#F3F4F7', // Color por defecto
          color: '#343a40' // Color de texto por defecto
        }}
        onClick={() => {
          setSearchTerm('');
          setCurrentPage(1);
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#E0E0E0'; // Color cuando el mouse sobre el botón "limpiar"
          e.currentTarget.style.color = 'black'; // Color del texto cuando el mouse sobre el botón "limpiar"
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#F3F4F7'; // Color cuando el mouse no está sobre el botón "limpiar"
          e.currentTarget.style.color = '#343a40'; // Color de texto cuando el mouse no está sobre el botón "limpiar"
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
        <CTableHeaderCell className="text-center">Acciones</CTableHeaderCell>
      </CTableRow>
    </CTableHead>

    <CTableBody>
      {currentRecords.map((municipio) => (
        <CTableRow key={municipio.Cod_municipio}>
          <CTableDataCell style={{ borderRight: '1px solid #ddd' }} className="text-center">{municipio.originalIndex}</CTableDataCell>
          <CTableDataCell style={{ borderRight: '1px solid #ddd' }} className="text-center">{municipio.Nombre_municipio.toUpperCase()}</CTableDataCell>
          <CTableDataCell className="text-center">
            <div className="d-flex justify-content-center">
              {canUpdate && (
                <CButton
                  color="warning"
                  onClick={() => openUpdateModal(municipio)}
                  style={{ marginRight: '10px' }}
                  disabled={municipio.estado === 0} // Deshabilitado si está inactivo
                  title={municipio.estado ? 'Editar municipio' : 'Municipio inactivo'}
                >
                  <CIcon icon={cilPen} />
                </CButton>
              )}

              {canDelete && (
                <CButton color="danger" onClick={() => openDeleteModal(municipio)}>
                  <CIcon icon={cilTrash} />
                </CButton>
              )}

              {/* Botón de Activar/Inactivar */}
              <CButton
                style={{
                  backgroundColor: municipio.estado ? '#4CAF50' : '#F44336', // Verde si activo, rojo si inactivo
                  color: 'white',
                  marginLeft: '10px',
                }}
                onClick={() => toggleEstado(municipio)} // Función para cambiar estado
                disabled={loading} // Deshabilitar mientras carga
              >
                {loading ? 'Cambiando...' : municipio.estado ? 'Activo' : 'Inactivo'}
              </CButton>
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
<CModal visible={modalVisible} backdrop="static">
  <CModalHeader closeButton={false}>
    <CModalTitle>Ingresar Nuevo Municipio</CModalTitle>
    <CButton className="btn-close" aria-label="Close" onClick={() => handleCloseModal(setModalVisible, resetNuevoMunicipio)} />
  </CModalHeader>
  <CModalBody>
    <CForm>
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
          style={{ textTransform: 'uppercase' }}
        />
      </CInputGroup>
      {municipioError && (
        <p style={{ color: 'red', fontSize: '0.9em' }}>{municipioError}</p>
      )}
    </CForm>
  </CModalBody>
  <CModalFooter>
    <CButton color="secondary" onClick={() => handleCloseModal(setModalVisible, resetNuevoMunicipio)}>
      Cancelar
    </CButton>
    <CButton style={{ backgroundColor: '#4B6251', color: 'white' }} onClick={handleCreateMunicipio} disabled={!!municipioError}>
      <CIcon icon={cilSave} style={{ marginRight: '5px' }} /> Guardar
    </CButton>
  </CModalFooter>
</CModal>


    
{/************************************************************************************************************************************/}

<CModal visible={modalUpdateVisible} backdrop="static">
  <CModalHeader closeButton={false}>
    <CModalTitle>Actualizar Municipio</CModalTitle>
    <CButton className="btn-close" aria-label="Close" onClick={() => handleCloseModal(setModalUpdateVisible, resetMunicipioToUpdate)} />
  </CModalHeader>
  <CModalBody>
    <CForm>
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
          style={{ textTransform: 'uppercase' }}
        />
      </CInputGroup>
      {municipioError && <p style={{ color: 'red', fontSize: '0.9em' }}>{municipioError}</p>}
    </CForm>
  </CModalBody>
  <CModalFooter>
    <CButton color="secondary" onClick={() => handleCloseModal(setModalUpdateVisible, resetMunicipioToUpdate)}>
      Cancelar
    </CButton>
    <CButton style={{ backgroundColor: '#4B6251', color: 'white' }} onClick={handleUpdateMunicipio} disabled={!!municipioError}>
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
