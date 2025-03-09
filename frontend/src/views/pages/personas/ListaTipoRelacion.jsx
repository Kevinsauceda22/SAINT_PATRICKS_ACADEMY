import React, { useState, useEffect } from 'react';
import { CIcon } from '@coreui/icons-react';
import {  cilSearch, cilBrushAlt, cilPen, cilTrash, cilPlus, cilDescription} from '@coreui/icons';
import swal from 'sweetalert2'; // Importar SweetAlert
import { jsPDF } from 'jspdf';       // Para generar archivos PDF
import 'jspdf-autotable';            // Para crear tablas en los archivos PDF
import * as XLSX from 'xlsx';        // Para generar archivos Excel
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
  const [errors, setErrors] = useState({ tipo_relacion: ''});
  const [relacionError, setRelacionError] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalUpdateVisible, setModalUpdateVisible] = useState(false);
  const [modalDeleteVisible, setModalDeleteVisible] = useState(false);
  const [nuevaRelacion, setNuevaRelacion] = useState({ tipo_relacion: ''});
  const [tipoRelacionToUpdate, setTipoRelacionToUpdate] = useState({});
  const [tipoRelacionToDelete, setTipoRelacionToDelete] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false); // Estado para detectar cambios sin guardar
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  
  const [tipo_relacion, setTipo_relacion] = useState('');



  useEffect(() => {
    fetchTipoRelacion();
  }, []);

 const fetchTipoRelacion = async () => {
  try {
    const response = await fetch(`http://74.50.68.87:4000/api/tipoRelacion/verTodoTipoRelacion`);
    const data = await response.json();
    console.log('Datos obtenidos:', data); // Agrega este log para depurar
    const dataWithIndex = data.map((tipoRelacion, index) => ({
      ...tipoRelacion,
      originalIndex: index + 1,
    }));
    setTipoRelacion(dataWithIndex);
  } catch (error) {
    console.error('Error al obtener tipo relacion:', error);
  }
};

const handleChange = (event) => {
  // Convertimos el valor a mayúsculas y lo guardamos en el estado
  setDescripcion(event.target.value.toUpperCase());
};

  // Validación de tipo relacion
  const validateTiporelacion = (relacion) => {
    const regex = /^[a-zA-Z\s]*$/; // Solo letras y espacios
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

    // Capitalizar la primera letra de cada palabra
    const capitalizeWords = (str) => {
      return str.replace(/\b\w/g, (char) => char.toUpperCase());
    };

      // Validar que ningún campo esté vacío
    const validateEmptyFields = () => {
      const { tipo_relacion} = nuevaRelacion;
      if (!tipo_relacion) {
        swal.fire({
          icon: 'warning',
          title: 'Campos vacíos',
          text: 'Todos los campos deben estar llenos para poder crear una relación.',
        });
        return false;
      }
      return true;
    };

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

    // Función para controlar la entrada de texto en los campos
    const handleTipoRelacionInputChange = (e, setFunction) => {
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
        setRelacionError('La relacion debe tener más de 2 letras.');
      } else {
        setRelacionError(''); // No hay error
      }
  
      setFunction((prevState) => ({
        ...prevState,
        tipo_relacion: value,
      }));
  
      setHasUnsavedChanges(true); // Marcar que hay cambios no guardados
    };

      // Deshabilitar copiar y pegar
  const disableCopyPaste = (e) => {
    e.preventDefault();
    swal.fire({
      icon: 'warning',
      title: 'Acción bloqueada',
      text: 'Copiar y pegar no está permitido.',
    });
  };

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

    const resetNuevaRelacion = () => {
      setNuevaRelacion({ tipo_relacion: ''});
    };
  
    const resetRelacionToUpdate = () => {
      setTipoRelacionToUpdate({ tipo_relacion: ''});
    };

{/********************************************FUNCION PARA CREAR RELACION**************************************************************/}
    const handleCreateRelacion= async () => {

      if (isDuplicateRelacion()) {
        return;
      }
      const relacionCapitalizado = capitalizeWords(nuevaRelacion.tipo_relacion.trim().replace(/\s+/g, ' '));
  
      // Validaciones antes de crear 
      if (!validateTiporelacion(relacionCapitalizado)) {
        return;
      }
      if (!validateEmptyFields()) {
        return;
      }
      if (isDuplicateRelacion()) {
        return;
      }
  
      try {
        const response = await fetch(`http://74.50.68.87:4000/api/tipoRelacion/crearTipoRelacion`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            tipo_relacion: relacionCapitalizado,
          }),
        });
  
        if (response.ok) {
          fetchTipoRelacion();
          setModalVisible(false); // Cerrar el modal sin advertencia al guardar
          resetNuevaRelacion();
          setHasUnsavedChanges(false); // Reiniciar el estado de cambios no guardados
          swal.fire({
            icon: 'success',
            title: 'Creación exitosa',
            text: 'La relacion ha sido creado correctamente.',
          });
        } else {
          swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo crear la relacion.',
          });
        }
      } catch (error) {
        console.error('Error al crear la relación:', error);
      }
    };

  {/*******************************************FUNCION PARA ACTUALIZAR*********************************************************/}
    const handleUpdateRelacion = async () => {
      const relacionCapitalizado = capitalizeWords(tipoRelacionToUpdate.tipo_relacion.trim().replace(/\s+/g, ' '));
  
      if (!validateTiporelacion(relacionCapitalizado)) {
        return;
      }
  
      try {
        const response = await fetch(`http://74.50.68.87:4000/api/tipoRelacion/actualizarTipoRelacion/${tipoRelacionToUpdate.Cod_tipo_relacion}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            Cod_tipo_relacion: tipoRelacionToUpdate.Cod_tipo_relacion,
            tipo_relacion: relacionCapitalizado,
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
            text: 'La relacion ha sido actualizado correctamente.',
          });
        } else {
          swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo actualizar la relación.',
          });
        }
      } catch (error) {
        console.error('Error al actualizar la relacion:', error);
      }
    };

    const handleDeleteRelacion = async () => {
      try {
        const response = await fetch(
          `http://74.50.68.87:4000/api/tipoRelacion/eliminarTipoRelacion/${encodeURIComponent(tipoRelacionToDelete.Cod_tipo_relacion)}`,
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
  

  const openUpdateModal = (tipoRelacion) => {
    setTipoRelacionToUpdate(tipoRelacion);
    setTipo_relacion(tipoRelacion.tipo_relacion);
    setModalUpdateVisible(true);
  };

  const openDeleteModal = (tipoRelacion) => {
    setTipoRelacionToDelete(tipoRelacion);
    setModalDeleteVisible(true);
  };

  {/**************************************************FILTRADO Y BUSQUEDA DE DATOS********************************************************/}

/**************************************************BUSCADOR********************************************************/
const handleSearch = (event) => {
  setSearchTerm(event.target.value);
  setCurrentPage(1);
};

const filteredTipoRelacion = tipoRelacion.filter((tipoRelacion) => 
  tipoRelacion.tipo_relacion &&
  tipoRelacion.tipo_relacion.toLowerCase().includes(searchTerm.toLowerCase())
);

const indexOfLastRecord = currentPage * recordsPerPage;
const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
const currentRecords = filteredTipoRelacion.slice(indexOfFirstRecord, indexOfLastRecord);

const paginate = (pageNumber) => {
  if (pageNumber > 0 && pageNumber <= Math.ceil(filteredTipoRelacion.length / recordsPerPage)) {
    setCurrentPage(pageNumber);
  }
};


/**************************************************REPORTERIA DE PDF********************************************************/
const ReporteRelacionesPDF = () => {
  const doc = new jsPDF('p', 'mm', 'letter'); 
  
  if (!filteredTipoRelacion || filteredTipoRelacion.length === 0) {
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
    doc.text('Reporte de Relaciones', pageWidth / 2, 50, { align: 'center' });

    doc.setLineWidth(0.5);
    doc.setDrawColor(0, 102, 51);
    doc.line(10, 60, pageWidth - 10, 60);

    // **Usar filteredTipoRelacion en lugar de tipoRelacion**
    const tableRows = filteredTipoRelacion.map((tipo, index) => ({
      index: (index + 1).toString(),
      tipo_relacion: tipo.tipo_relacion?.toUpperCase() || 'N/D',
    }));

    const columnWidths = {
      index: 20, // Ancho de la columna #
      tipo_relacion: 100 // Ancho de la columna "Tipo Relación"
    };
    const tableWidth = columnWidths.index + columnWidths.tipo_relacion;

    doc.autoTable({
      startY: 65,
      margin: { left: (pageWidth - tableWidth) / 2 }, // Centrado de la tabla
      columns: [
        { header: '#', dataKey: 'index' },
        { header: 'Tipo de Relación', dataKey: 'tipo_relacion' },
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
        tipo_relacion: { cellWidth: 90 },
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
        <head><title>Reporte de Relaciones</title></head>
        <body style="margin:0;">
          <iframe width="100%" height="100%" src="${pdfURL}" frameborder="0"></iframe>
          <div style="position:fixed;top:10px;right:20px;">
            <button style="background-color: #6c757d; color: white; border: none; padding: 10px 15px; border-radius: 5px; cursor: pointer;" 
              onclick="const a = document.createElement('a'); a.href='${pdfURL}'; a.download='Reporte_Relaciones.pdf'; a.click();">
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

  const exportToExcel = () => {
    // Convierte los datos de tipoRelacion a formato de hoja de cálculo
    // Transforma los datos: convierte nombres de tipo relacion a mayúsculas y solo incluye # y tipo relacion
    const tipoRelacionConFormato = tipoRelacion.map((tipo, index) => ({
      '#': index + 1, // Índice personalizado
      'Tipo Relación': typeof tipo.tipo_relacion === 'string' ? tipo.tipo_relacion.toUpperCase() : tipo.tipo_relacion // Convierte a mayúsculas
    }));
  
    const worksheet = XLSX.utils.json_to_sheet(tipoRelacionConFormato); 
    const workbook = XLSX.utils.book_new(); // Crea un nuevo libro de trabajo
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Tipo Relación'); // Añade la hoja
    
    // Genera el archivo Excel en formato binario
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  
    // Crea un Blob para descargar el archivo con file-saver
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, 'reporte_relacion.xlsx'); // Descarga el archivo Excel
  };
  
    
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
        <CDropdown>
          <CDropdownToggle
            style={{ backgroundColor: '#6C8E58', color: 'white' }}
          >
            Reportes
          </CDropdownToggle>
          <CDropdownMenu>
            <CDropdownItem onClick={exportToExcel}>Descargar en Excel</CDropdownItem>
            <CDropdownItem onClick={ReporteRelacionesPDF}>Descargar en PDF</CDropdownItem>
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
            placeholder="Buscar tipo género..."
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
              e.currentTarget.style.backgroundColor = '#E0E0E0'; // Color cuando el mouse sobre el boton "limpiar"
              e.currentTarget.style.color = 'black'; // Color del texto cuando el mouse sobre el boton "limpiar"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#F3F4F7'; // Color cuando el mouse no está sobre el boton "limpiar"
              e.currentTarget.style.color = '#343a40'; // Color de texto cuando el mouse no está sobre el boton "limpiar"
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

      <div  style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #ccc', padding: '10px', marginBottom: '30px', }}>
        <CTable striped>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell style={{ borderRight: '1px solid #ddd' }} className="text-center"> #</CTableHeaderCell>
              <CTableHeaderCell style={{ borderRight: '1px solid #ddd' }} className="text-center">Descripción</CTableHeaderCell>
              <CTableHeaderCell className="text-center">Acciones</CTableHeaderCell>
            </CTableRow>
          </CTableHead>

          <CTableBody>
  {currentRecords.map((tipoRelacion) => (
    <CTableRow key={tipoRelacion.Cod_tipo_relacion}>
      <CTableDataCell style={{ borderRight: '1px solid #ddd' }} className="text-center">{tipoRelacion.originalIndex}</CTableDataCell>
      <CTableDataCell style={{ borderRight: '1px solid #ddd' }} className="text-center">{tipoRelacion.tipo_relacion.toUpperCase()}  {/* Convert to uppercase */}</CTableDataCell>
      <CTableDataCell className="text-center">
        <div className="d-flex justify-content-center">

          {canUpdate && (
          <CButton
            color="warning"
            onClick={() => openUpdateModal(tipoRelacion)}
            style={{ marginRight: '10px' }}
          >
            <CIcon icon={cilPen} />
          </CButton>
          )}

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
  

      {/* Modal Crear Relacion */}
      <CModal visible={modalVisible} onClose={() => handleCloseModal(setModalVisible, resetNuevaRelacion)} backdrop="static">
  <CModalHeader>
    <CModalTitle>Ingresar Nueva Relación</CModalTitle>
  </CModalHeader>
  <CModalBody>
    <CForm>
      <CFormInput
        label="Tipo Relación"
        value={nuevaRelacion.tipo_relacion}
        maxLength={50} // Límite de caracteres
        onPaste={disableCopyPaste}
        onCopy={disableCopyPaste}
        onChange={(e) => handleTipoRelacionInputChange(e, setNuevaRelacion, handleChange, setRelacionError)}
        onBlur={isDuplicateRelacion}
        style={{ textTransform: 'uppercase' }} // Esto asegura que el texto se muestre en mayúsculas
      />
      {/* Mostrar mensaje de error si existe */}
      {relacionError && (
          <p style={{ color: 'red', fontSize: '0.9em' }}>{relacionError}</p>
        )}
    </CForm>
  </CModalBody>
  <CModalFooter>
    <CButton color="secondary" onClick={() => handleCloseModal(setModalVisible, resetNuevaRelacion)}>
      Cerrar
    </CButton>
    <CButton
      color="primary"
      onClick={handleCreateRelacion} // Cambia esto a la función correcta
      disabled={!!relacionError.tipo_relacion} // Deshabilita el botón si hay errores
    >
      Guardar
    </CButton>
  </CModalFooter>
</CModal>

{/* Modal Actualizar Relación */}
<CModal visible={modalUpdateVisible} onClose={() => handleCloseModal(setModalUpdateVisible, resetRelacionToUpdate)} backdrop="static">
  <CModalHeader>
    <CModalTitle>Actualizar Relación</CModalTitle>
  </CModalHeader>
  <CForm>
    <CModalBody>
      <CFormInput
        label="Identificador"
        value={tipoRelacionToUpdate.Cod_tipo_relacion}
        readOnly
      />
      <CFormInput
        label="Tipo Relación"
        value={tipoRelacionToUpdate.tipo_relacion}
        maxLength={50} // Límite de caracteres
        onPaste={disableCopyPaste}
        onCopy={disableCopyPaste}
        onChange={(e) => handleTipoRelacionInputChange(e, setTipoRelacionToUpdate, handleChange)}
        style={{ textTransform: 'uppercase' }} // Esto asegura que el texto se muestre en mayúsculas
      />
      {/* Mostrar mensaje de error si existe */}
      {errors.tipo_relacion && <p style={{ color: 'red' }}>{errors.tipo_relacion}</p>}
    </CModalBody>
    <CModalFooter>
      <CButton color="secondary" onClick={() => handleCloseModal(setModalUpdateVisible, resetRelacionToUpdate)}>
        Cerrar
      </CButton>
      <CButton
            color="primary"
            onClick={handleUpdateRelacion}
            disabled={errors.tipo_relacion}
      >
        Guardar
      </CButton>
    </CModalFooter>
  </CForm>
</CModal>


      {/* Modal Eliminar Relacion*/}
      <CModal visible={modalDeleteVisible} onClose={() => setModalDeleteVisible(false)} backdrop="static">
        <CModalHeader>
          <CModalTitle>Eliminar edificio</CModalTitle>
        </CModalHeader>
        <CModalBody>
          ¿Estás seguro de que deseas eliminar el edificio "{tipoRelacionToDelete.tipo_relacion}"?
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
    </CContainer>
  )
};


export default ListaTipoRelacion;