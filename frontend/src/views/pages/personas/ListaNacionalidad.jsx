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

import usePermission from '../../../../context/usePermission';
import AccessDenied from "../AccessDenied/AccessDenied"

const ListaNacionalidad = () => {
    const { canSelect, canUpdate, canDelete, canInsert } = usePermission('ListaNacionalidad');
  
    const [nacionalidades, setNacionalidades] = useState([]);
    const [errors, setErrors] = useState({ pais_nacionalidad: '' });
    const [modalVisible, setModalVisible] = useState(false);
    const [modalUpdateVisible, setModalUpdateVisible] = useState(false);
    const [modalDeleteVisible, setModalDeleteVisible] = useState(false);
    const [nuevaNacionalidad, setNuevaNacionalidad] = useState({
      pais_nacionalidad: '',
      pais: ''
    });
    const [nacionalidadToUpdate, setNacionalidadToUpdate] = useState({});
    const [nacionalidadToDelete, setNacionalidadToDelete] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false); // Detectar cambios sin guardar
    const [recordsPerPage, setRecordsPerPage] = useState(10);
  
    useEffect(() => {
      fetchNacionalidades();
    }, []);
  
    const fetchNacionalidades = async () => {
      try {
        const response = await fetch(`http://74.50.68.87/api/nacionalidad/verNacionalidades`);
        const data = await response.json();
        console.log('Datos obtenidos:', data); // Log para depurar
        const dataWithIndex = data.map((nacionalidad, index) => ({
          ...nacionalidad,
          originalIndex: index + 1,
        }));
        setNacionalidades(dataWithIndex);
      } catch (error) {
        console.error('Error al obtener nacionalidades:', error);
      }
    };

  
    const handleCreateNacionalidad = async () => {
      try {
        const response = await fetch(`http://74.50.68.87/api/nacionalidad/crearNacionalidades`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(nuevaNacionalidad),
        });
        const data = await response.json();
        if (response.ok) {
          fetchNacionalidades();
          setModalVisible(false);
        } else {
          console.error('Error al crear nacionalidad:', data);
        }
      } catch (error) {
        console.error('Error en el servidor:', error);
      }
    };
  
    const handleUpdateNacionalidad = async () => {
      try {
        const response = await fetch(
          `http://74.50.68.87/api/nacionalidad/actualizarNacionalidades/${nacionalidadToUpdate.Cod_nacionalidad}`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nacionalidadToUpdate),
          }
        );
        const data = await response.json();
        if (response.ok) {
          fetchNacionalidades();
          setModalUpdateVisible(false);
        } else {
          console.error('Error al actualizar nacionalidad:', data);
        }
      } catch (error) {
        console.error('Error en el servidor:', error);
      }
    };
  
    const handleDeleteNacionalidad = async () => {
      try {
        const response = await fetch(
          `http://74.50.68.87/api/nacionalidad/eliminarNacionalidades/${nacionalidadToDelete.Cod_nacionalidad}`,
          { method: 'DELETE' }
        );
        const data = await response.json();
        if (response.ok) {
          fetchNacionalidades();
          setModalDeleteVisible(false);
        } else {
          console.error('Error al eliminar nacionalidad:', data);
        }
      } catch (error) {
        console.error('Error en el servidor:', error);
      }
    };
  
    // Más lógica para renderizado, búsqueda, paginación, etc.
  

  
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

    // Función para controlar la entrada de texto en los campos de nombre del edificio
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
        const response = await fetch(`http://74.50.68.87/api/tipoRelacion/crearTipoRelacion`, {
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

    const handleUpdateRelacion = async () => {
      const relacionCapitalizado = capitalizeWords(tipoRelacionToUpdate.tipo_relacion.trim().replace(/\s+/g, ' '));
  
      if (!validateTiporelacion(relacionCapitalizado)) {
        return;
      }
  
      try {
        const response = await fetch(`http://74.50.68.87/api/tipoRelacion/actualizarTipoRelacion/${tipoRelacionToUpdate.Cod_tipo_relacion}`, {
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
          `http://74.50.68.87/api/tipoRelacion/eliminarTipoRelacion/${encodeURIComponent(tipoRelacionToDelete.Cod_tipo_relacion)}`,
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

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  const filteredNacionalidades = nacionalidades.filter((nacionalidad) => {
    // Filtrado por todos los campos: Cod_nacionalidad, Id_nacionalidad, pais_nacionalidad, pais
    return (
      (nacionalidad.Id_nacionalidad && nacionalidad.Id_nacionalidad.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (nacionalidad.pais_nacionalidad && nacionalidad.pais_nacionalidad.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (nacionalidad.pais && nacionalidad.pais.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });
  
  // Paginación
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredNacionalidades.slice(indexOfFirstRecord, indexOfLastRecord);
  
  // Función de paginación
  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= Math.ceil(filteredNacionalidades.length / recordsPerPage)) {
      setCurrentPage(pageNumber);
    }
  };
  

  const exportToExcel = () => {
    // Convierte los datos de nacionalidad a formato de hoja de cálculo
    const nacionalidadConFormato = nacionalidad.map((nacionalidad, index) => ({
      '#': index + 1, // Índice personalizado
      'Código Nacionalidad': nacionalidad.Cod_nacionalidad, // Agregar el código de la nacionalidad
      'ID Nacionalidad': nacionalidad.Id_nacionalidad, // Agregar el ID de la nacionalidad
      'País Nacionalidad': typeof nacionalidad.pais_nacionalidad === 'string' ? nacionalidad.pais_nacionalidad.toUpperCase() : nacionalidad.pais_nacionalidad, // Convertir el nombre a mayúsculas
      'País': typeof nacionalidad.pais === 'string' ? nacionalidad.pais.toUpperCase() : nacionalidad.pais, // Convertir el nombre a mayúsculas
    }));
  
    const worksheet = XLSX.utils.json_to_sheet(nacionalidadConFormato);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Nacionalidad');
    
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, 'reporte_nacionalidad.xlsx');
  };
  
  

  const ReporteNacionalidades = () => {
    const doc = new jsPDF('l', 'mm', 'letter'); // Formato horizontal
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
  
    const img = new Image();
    img.src = logo;
  
    img.onload = () => {
      doc.addImage(img, 'PNG', 10, 10, 20, 20); // Reducir el logo y ajustarlo al espacio
  
      // Cabecera del reporte
      doc.setTextColor(22, 160, 133);
      doc.setFontSize(14);
      doc.text("SAINT PATRICK'S ACADEMY", 35, 15, { align: 'left' });
      doc.setFontSize(10);
      doc.text('Reporte de Nacionalidades', 35, 22, { align: 'left' });
  
      // Detalles de la institución
      doc.setFontSize(8);
      doc.setTextColor(68, 68, 68);
      doc.text('Casa Club del periodista, Colonia del Periodista', 35, 30, { align: 'left' });
      doc.text('Teléfono: (504) 2234-8871', 35, 35, { align: 'left' });
      doc.text('Correo: info@saintpatrickacademy.edu', 35, 40, { align: 'left' });
  
      // Tabla principal
      doc.autoTable({
        head: [['#', 'Código Nacionalidad', 'ID Nacionalidad', 'País Nacionalidad', 'País']], // Cabecera de la tabla
        body: nacionalidad.map((nacionalidad, index) => [
          index + 1,
          nacionalidad.Cod_nacionalidad,  // Mostrar el código de la nacionalidad
          nacionalidad.Id_nacionalidad,   // Mostrar el ID de la nacionalidad
          nacionalidad.pais_nacionalidad.toUpperCase(),
          nacionalidad.pais.toUpperCase(),
        ]), // Datos que se mostrarán en la tabla
        styles: {
          fontSize: 6,
          textColor: [68, 68, 68],
          cellPadding: 2,
        },
        headStyles: {
          fillColor: [22, 160, 133],
          textColor: [255, 255, 255],
          fontSize: 7,
          fontStyle: 'bold',
          halign: 'center',
        },
        alternateRowStyles: {
          fillColor: [240, 248, 255],
        },
        columnStyles: {
          0: { cellWidth: 15 },
          1: { cellWidth: 20 },
          2: { cellWidth: 25 },
          3: { cellWidth: 40 },
          4: { cellWidth: 40 },
        },
        margin: { top: 10, right: 10, bottom: 10, left: 5 },
        didDrawPage: function (data) {
          doc.setFontSize(7);
          doc.setTextColor(100);
          const now = new Date();
          const date = now.toLocaleDateString('es-HN', { year: 'numeric', month: 'long', day: 'numeric' });
          const time = now.toLocaleTimeString('es-HN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  
          doc.text(`Fecha y hora de generación: ${date}, ${time}`, 10, pageHeight - 10);
          doc.text(`Página ${data.pageNumber}`, pageWidth - 10, pageHeight - 10, { align: 'right' });
        },
      });
  
      // Guardar el PDF
      doc.save('Reporte_nacionalidades.pdf');
    };
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
    <h1 className="mb-0">Mantenimiento de Nacionalidades</h1>
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
        <CDropdownItem onClick={ReporteNacionalidades}>Descargar en PDF</CDropdownItem>
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
        placeholder="Buscar nacionalidad..."
        onChange={handleSearch}
        value={searchTerm}
      />
      <CButton
        style={{
          border: '1px solid #ccc',
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

{/* Tabla de Nacionalidades */}
<div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #ccc', padding: '10px', marginBottom: '30px' }}>
  <CTable striped>
    <CTableHead>
      <CTableRow>
        <CTableHeaderCell style={{ borderRight: '1px solid #ddd' }} className="text-center"> #</CTableHeaderCell>
        <CTableHeaderCell style={{ borderRight: '1px solid #ddd' }} className="text-center">Codigo Nacionalidad</CTableHeaderCell>
        <CTableHeaderCell style={{ borderRight: '1px solid #ddd' }} className="text-center">Nacionalidad</CTableHeaderCell>
        <CTableHeaderCell style={{ borderRight: '1px solid #ddd' }} className="text-center">Pais</CTableHeaderCell>
        <CTableHeaderCell className="text-center">Acciones</CTableHeaderCell>
      </CTableRow>
    </CTableHead>

    <CTableBody>
      {currentRecords.map((nacionalidad) => (
        <CTableRow key={nacionalidad.Id_nacionalidad}>
          <CTableDataCell style={{ borderRight: '1px solid #ddd' }} className="text-center">{nacionalidad.originalIndex}</CTableDataCell>
          <CTableDataCell style={{ borderRight: '1px solid #ddd' }} className="text-center">{nacionalidad.Id_nacionalidad.toUpperCase()}</CTableDataCell>
          <CTableDataCell style={{ borderRight: '1px solid #ddd' }} className="text-center">{nacionalidad.pais_nacionalidad.toUpperCase()}</CTableDataCell>
          <CTableDataCell style={{ borderRight: '1px solid #ddd' }} className="text-center">{nacionalidad.pais.toUpperCase()}</CTableDataCell>
          <CTableDataCell className="text-center">
            <div className="d-flex justify-content-center">

              {canUpdate && (
                <CButton
                  color="warning"
                  onClick={() => openUpdateModal(nacionalidad)}
                  style={{ marginRight: '10px' }}
                >
                  <CIcon icon={cilPen} />
                </CButton>
              )}

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

{/* Paginación */}
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


{/* Modal Crear Nacionalidad */}
<CModal visible={modalVisible} onClose={() => handleCloseModal(setModalVisible, resetNuevaNacionalidad)} backdrop="static">
  <CModalHeader>
    <CModalTitle>Ingresar Nueva Nacionalidad</CModalTitle>
  </CModalHeader>
  <CModalBody>
    <CForm>
      <CFormInput
        label="Código Nacionalidad"
        value={nuevaNacionalidad.Cod_nacionalidad}
        maxLength={50} // Límite de caracteres
        onPaste={disableCopyPaste}
        onCopy={disableCopyPaste}
        onChange={(e) => handleCodNacionalidadInputChange(e, setNuevaNacionalidad, handleChange, setNacionalidadError)}
        onBlur={isDuplicateNacionalidad}
        style={{ textTransform: 'uppercase' }} // Esto asegura que el texto se muestre en mayúsculas
      />
      <CFormInput
        label="ID Nacionalidad"
        value={nuevaNacionalidad.Id_nacionalidad}
        maxLength={50}
        onPaste={disableCopyPaste}
        onCopy={disableCopyPaste}
        onChange={(e) => handleIdNacionalidadInputChange(e, setNuevaNacionalidad, handleChange)}
        style={{ textTransform: 'uppercase' }}
      />
      <CFormInput
        label="País Nacionalidad"
        value={nuevaNacionalidad.pais_nacionalidad}
        maxLength={50}
        onPaste={disableCopyPaste}
        onCopy={disableCopyPaste}
        onChange={(e) => handlePaisNacionalidadInputChange(e, setNuevaNacionalidad, handleChange)}
        style={{ textTransform: 'uppercase' }}
      />
      <CFormInput
        label="País"
        value={nuevaNacionalidad.pais}
        maxLength={50}
        onPaste={disableCopyPaste}
        onCopy={disableCopyPaste}
        onChange={(e) => handlePaisInputChange(e, setNuevaNacionalidad, handleChange)}
        style={{ textTransform: 'uppercase' }} // Asegura que el texto esté en mayúsculas
      />
      {/* Mostrar mensaje de error si existe */}
      {nacionalidadError && (
        <p style={{ color: 'red', fontSize: '0.9em' }}>{nacionalidadError}</p>
      )}
    </CForm>
  </CModalBody>
  <CModalFooter>
    <CButton color="secondary" onClick={() => handleCloseModal(setModalVisible, resetNuevaNacionalidad)}>
      Cerrar
    </CButton>
    <CButton
      color="primary"
      onClick={handleCreateNacionalidad} // Cambia esto a la función correcta
      disabled={!!nacionalidadError} // Deshabilita el botón si hay errores
    >
      Guardar
    </CButton>
  </CModalFooter>
</CModal>

{/* Modal Actualizar Nacionalidad */}
<CModal visible={modalUpdateVisible} onClose={() => handleCloseModal(setModalUpdateVisible, resetNacionalidadToUpdate)} backdrop="static">
  <CModalHeader>
    <CModalTitle>Actualizar Nacionalidad</CModalTitle>
  </CModalHeader>
  <CForm>
    <CModalBody>
      <CFormInput
        label="Código Nacionalidad"
        value={nacionalidadToUpdate.Cod_nacionalidad}
        readOnly
      />
      <CFormInput
        label="ID Nacionalidad"
        value={nacionalidadToUpdate.Id_nacionalidad}
        onPaste={disableCopyPaste}
        onCopy={disableCopyPaste}
        onChange={(e) => handleIdNacionalidadInputChange(e, setNacionalidadToUpdate, handleChange)}
        style={{ textTransform: 'uppercase' }}
      />
      <CFormInput
        label="País Nacionalidad"
        value={nacionalidadToUpdate.pais_nacionalidad}
        onPaste={disableCopyPaste}
        onCopy={disableCopyPaste}
        onChange={(e) => handlePaisNacionalidadInputChange(e, setNacionalidadToUpdate, handleChange)}
        style={{ textTransform: 'uppercase' }}
      />
      <CFormInput
        label="País"
        value={nacionalidadToUpdate.pais}
        onPaste={disableCopyPaste}
        onCopy={disableCopyPaste}
        onChange={(e) => handlePaisInputChange(e, setNacionalidadToUpdate, handleChange)}
        style={{ textTransform: 'uppercase' }}
      />
      {/* Mostrar mensaje de error si existe */}
      {errors.nacionalidad && <p style={{ color: 'red' }}>{errors.nacionalidad}</p>}
    </CModalBody>
    <CModalFooter>
      <CButton color="secondary" onClick={() => handleCloseModal(setModalUpdateVisible, resetNacionalidadToUpdate)}>
        Cerrar
      </CButton>
      <CButton
        color="primary"
        onClick={handleUpdateNacionalidad}
        disabled={errors.nacionalidad}
      >
        Guardar
      </CButton>
    </CModalFooter>
  </CForm>
</CModal>

{/* Modal Eliminar Nacionalidad */}
<CModal visible={modalDeleteVisible} onClose={() => setModalDeleteVisible(false)} backdrop="static">
  <CModalHeader>
    <CModalTitle>Eliminar Nacionalidad</CModalTitle>
  </CModalHeader>
  <CModalBody>
    ¿Estás seguro de que deseas eliminar la nacionalidad "{nacionalidadToDelete.pais_nacionalidad}"?
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

    </CContainer>
  )
};



export default ListaNacionalidad;