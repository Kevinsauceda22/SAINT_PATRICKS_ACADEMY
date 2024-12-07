import React, { useEffect, useState } from 'react';
import { CIcon } from '@coreui/icons-react';
import { cilPen, cilTrash } from '@coreui/icons';
import swal from 'sweetalert2'; // Importar SweetAlert para mostrar mensajes de advertencia y éxito
import { jsPDF } from 'jspdf';       // Para generar archivos PDF
import 'jspdf-autotable';            // Para crear tablas en los archivos PDF
import * as XLSX from 'xlsx';        // Para generar archivos Excel
import { saveAs } from 'file-saver'; // Para descargar archivos en el navegador
import logo from 'src/assets/brand/logo_saint_patrick.png'; // Ruta al logo de la academia
import {
  CButton,
  CContainer,
  CDropdown, // Para reportes
  CDropdownMenu,
  CDropdownToggle,
  CDropdownItem, // Para reportes
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
} from '@coreui/react';
import usePermission from '../../../../context/usePermission';
import AccessDenied from "../AccessDenied/AccessDenied"


const ListaEdificios = () => {
  const { canSelect, loading, canDelete, canInsert, canUpdate } = usePermission('edificios');

  // Estados de la aplicación
  const [edificios, setEdificios] = useState([]); // Estado que almacena la lista de edificios
  const [errors, setErrors] = useState({ Numero_pisos: '', Aulas_disponibles: '', pisosVsAulas: '' }); // Estado para gestionar los errores de validación
  const [modalVisible, setModalVisible] = useState(false); // Controla la visibilidad del modal de creación
  const [modalUpdateVisible, setModalUpdateVisible] = useState(false); // Controla la visibilidad del modal de actualización
  const [modalDeleteVisible, setModalDeleteVisible] = useState(false); // Controla la visibilidad del modal de eliminación
  const [nuevoEdificio, setNuevoEdificio] = useState({ Nombre_edificios: '', Numero_pisos: '', Aulas_disponibles: '' }); // Estado del nuevo edificio
  const [edificioToUpdate, setEdificioToUpdate] = useState({}); // Estado para el edificio que se va a actualizar
  const [edificioToDelete, setEdificioToDelete] = useState({}); // Estado para el edificio que se va a eliminar
  const [searchTerm, setSearchTerm] = useState(''); // Estado del término de búsqueda
  const [currentPage, setCurrentPage] = useState(1); // Estado de la página actual para la paginación
  const [recordsPerPage, setRecordsPerPage] = useState(5); // Controla cuántos registros se muestran por página
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false); // Controla si hay cambios sin guardar

  // useEffect para cargar los edificios al montar el componente
  useEffect(() => {
    fetchEdificios(); // Llama a la función para obtener los edificios desde el backend
  }, []);

  
  // Funciones de las Apis

  // Función para obtener los edificios desde la API
  const fetchEdificios = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/edificio/edificios'); // Realiza la petición al backend
      const data = await response.json(); // Convierte la respuesta a JSON
      const dataWithIndex = data.map((edificio, index) => ({
        ...edificio,
        originalIndex: index + 1, // Añade un índice basado en la posición del edificio en la lista
      }));
      setEdificios(dataWithIndex); // Actualiza el estado con los datos obtenidos
    } catch (error) {
      console.error('Error al obtener los edificios:', error); // Muestra el error en la consola si la petición falla
    }
  };

  // Función para crear un nuevo edificio
  const handleCreateEdificio = async () => {
    const nombreCapitalizado = capitalizeWords(nuevoEdificio.Nombre_edificios.trim().replace(/\s+/g, ' '));

    // Validaciones antes de crear el edificio
    if (!validateNombreEdificio(nombreCapitalizado)) return;
    if (!validateEmptyFields()) return;
    if (isDuplicateEdificio()) return;

    try {
      const response = await fetch('http://localhost:4000/api/edificio/crear_edificio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          p_Nombre_edificio: nombreCapitalizado,
          p_Numero_pisos: nuevoEdificio.Numero_pisos,
          p_Aulas_disponibles: nuevoEdificio.Aulas_disponibles,
        }),
      });

      if (response.ok) {
        fetchEdificios(); // Recargar la lista de edificios
        setModalVisible(false); // Cerrar el modal
        resetNuevoEdificio(); // Resetear los campos
        setHasUnsavedChanges(false); // Resetear cambios no guardados
        swal.fire({ icon: 'success', title: 'Creación exitosa', text: 'El edificio ha sido creado correctamente.' });
      } else {
        swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo crear el edificio.' });
      }
    } catch (error) {
      console.error('Error al crear el edificio:', error);
    }
  };

  // Función para actualizar un edificio
  const handleUpdateEdificio = async () => {
    const nombreCapitalizado = capitalizeWords(edificioToUpdate.Nombre_edificios.trim().replace(/\s+/g, ' '));

    if (!validateNombreEdificio(nombreCapitalizado)) return;

    try {
      const response = await fetch('http://localhost:4000/api/edificio/actualizar_edificio', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          p_Cod_edificio: edificioToUpdate.Cod_edificio,
          p_Nuevo_nombre_edificio: nombreCapitalizado,
          p_Numero_pisos: edificioToUpdate.Numero_pisos,
          p_Aulas_disponibles: edificioToUpdate.Aulas_disponibles,
        }),
      });

      if (response.ok) {
        fetchEdificios(); // Recargar la lista de edificios
        setModalUpdateVisible(false); // Cerrar el modal
        resetEdificioToUpdate(); // Resetear los campos
        setHasUnsavedChanges(false); // Resetear cambios no guardados
        swal.fire({ icon: 'success', title: 'Actualización exitosa', text: 'El edificio ha sido actualizado correctamente.' });
      } else {
        swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo actualizar el edificio.' });
      }
    } catch (error) {
      console.error('Error al actualizar el edificio:', error);
    }
  };

  // Función para eliminar un edificio
  const handleDeleteEdificio = async () => {
    try {
      const response = await fetch(`http://localhost:4000/api/edificio/${encodeURIComponent(edificioToDelete.Cod_edificio)}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        fetchEdificios(); // Recargar la lista de edificios
        setModalDeleteVisible(false); // Cerrar el modal
        setEdificioToDelete({}); // Limpiar el edificio seleccionado
        swal.fire({ icon: 'success', title: 'Eliminación exitosa', text: 'El edificio ha sido eliminado correctamente.' });
      } else {
        swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo eliminar el edificio.' });
      }
    } catch (error) {
      console.error('Error al eliminar el edificio:', error);
    }
  };

  // Funciones de Validación

  // Validación del nombre del edificio
  const validateNombreEdificio = (nombre) => {
    const regex = /^[a-zA-Z\s]*$/; // Solo permite letras y espacios
    const noMultipleSpaces = !/\s{2,}/.test(nombre); // No permite más de un espacio consecutivo
    const trimmedNombre = nombre.trim().replace(/\s+/g, ' '); // Elimina espacios innecesarios

    if (!regex.test(trimmedNombre)) {
      swal.fire({
        icon: 'warning',
        title: 'Nombre inválido',
        text: 'El nombre del edificio solo puede contener letras y espacios.',
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
    const words = trimmedNombre.split(' ');
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

  // Función para capitalizar la primera letra de cada palabra en una cadena
  const capitalizeWords = (str) => {
    return str.replace(/\b\w/g, (char) => char.toUpperCase());
  };

  // Validación para los campos de número de pisos y aulas integradas
  const validateFields = (field, value) => {
    if (value.length > 2 || value <= 0 || isNaN(value)) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [field]: 'El número debe ser mayor que 0 y tener un máximo de 2 dígitos.',
      }));
    } else {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [field]: '',
      }));
    }
  };

  // Validación de campos vacíos
  const validateEmptyFields = () => {
    const { Nombre_edificios, Numero_pisos, Aulas_disponibles } = nuevoEdificio;
    if (!Nombre_edificios || !Numero_pisos || !Aulas_disponibles) {
      swal.fire({
        icon: 'warning',
        title: 'Campos vacíos',
        text: 'Todos los campos deben estar llenos para poder crear un edificio.',
      });
      return false;
    }
    return true;
  };

  // Verifica si ya existe un edificio con el mismo nombre (ignorando mayúsculas y espacios)
  const isDuplicateEdificio = () => {
    const nombreNormalizado = nuevoEdificio.Nombre_edificios.trim().toLowerCase();
    const existingEdificio = edificios.find(
      (edificio) => edificio.Nombre_edificios.trim().toLowerCase() === nombreNormalizado
    );
    if (existingEdificio) {
      swal.fire({
        icon: 'warning',
        title: 'Nombre duplicado',
        text: 'Ya existe un edificio con este nombre.',
      });
      return true;
    }
    return false;
  };

  // Maneja el cambio en el input de nombre del edificio con validación
  const handleNombreInputChange = (e, setFunction) => {
    const cursorPos = e.target.selectionStart; // Captura la posición actual del cursor
    let value = e.target.value;
    value = value.replace(/\s{2,}/g, ' '); // No permitir más de un espacio consecutivo

    const wordArray = value.split(' ');
    const isValid = wordArray.every(word => !/(.)\1{3,}/.test(word)); // No permitir que una letra se repita más de 4 veces consecutivas

    if (!isValid) {
      swal.fire({
        icon: 'warning',
        title: 'Repetición de letras',
        text: 'No se permite que la misma letra se repita más de 4 veces consecutivas.',
      });
      e.target.setSelectionRange(cursorPos, cursorPos); // Restaurar la posición del cursor
      return;
    }
    setFunction((prevState) => ({
      ...prevState,
      Nombre_edificios: value,
    }));

    setHasUnsavedChanges(true); // Marcar que hay cambios no guardados

    setTimeout(() => {
      e.target.setSelectionRange(cursorPos, cursorPos); // Restaurar la posición del cursor después de actualizar el estado
    }, 0);
  };

  // Deshabilita copiar y pegar
  const disableCopyPaste = (e) => {
    e.preventDefault();
    swal.fire({
      icon: 'warning',
      title: 'Acción bloqueada',
      text: 'Copiar y pegar no está permitido.',
    });
  };

  // Validar si el número de aulas es menor que el número de pisos y mostrar advertencia
  const handleAulasInputChange = (e, setFunction) => {
    const aulas = e.target.value;

    if (parseInt(aulas) < parseInt(nuevoEdificio.Numero_pisos)) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        pisosVsAulas: 'El número de pisos es mayor que el número de aulas.',
      }));
    } else {
      setErrors((prevErrors) => ({
        ...prevErrors,
        pisosVsAulas: '',
      }));
    }

    setFunction((prevState) => ({
      ...prevState,
      Aulas_disponibles: aulas,
    }));
  };

  // Maneja el cierre de los modales con advertencia si hay cambios sin guardar
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

  // Reiniciar el formulario de nuevo edificio
  const resetNuevoEdificio = () => {
    setNuevoEdificio({ Nombre_edificios: '', Numero_pisos: '', Aulas_disponibles: '' });
  };

  // Reiniciar el formulario de actualización de edificio
  const resetEdificioToUpdate = () => {
    setEdificioToUpdate({ Nombre_edificios: '', Numero_pisos: '', Aulas_disponibles: '' });
  };

  // Descargar reportes en excel y pdf
  const exportToExcel = () => {
    // Convierte los datos de los edificios a formato de hoja de cálculo
    const worksheet = XLSX.utils.json_to_sheet(edificios);
    const workbook = XLSX.utils.book_new(); // Crea un nuevo libro de trabajo
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Edificios'); // Añade la hoja

    // Genera el archivo Excel en formato binario
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    // Crea un Blob para descargar el archivo con file-saver
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, 'reporte_edificios.xlsx'); // Descarga el archivo Excel
  };

  const generatePDFForEdificios = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });
  
    const img = new Image();
    img.src = logo; // Ruta válida del logo
  
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
      doc.text('Reporte General de Edificios', pageWidth / 2, 50, { align: 'center' });
  
      // Línea divisoria
      doc.setLineWidth(0.5);
      doc.setDrawColor(0, 102, 51); // Verde
      doc.line(10, 55, pageWidth - 10, 55);
  
      // Tabla de datos
      const tableColumn = [
        '#',
        'Nombre del Edificio',
        'Número de Pisos',
        'Aulas Disponibles',
      ];
  
      const tableRows = edificios.map((edificio, index) => [
        { content: (index + 1).toString(), styles: { halign: 'center' } }, // Centrado
        { content: edificio.Nombre_edificios.toUpperCase(), styles: { halign: 'left' } }, // Alineado a la izquierda
        { content: edificio.Numero_pisos.toString(), styles: { halign: 'center' } }, // Centrado
        { content: edificio.Aulas_disponibles.toString(), styles: { halign: 'center' } }, // Centrado
      ]);
  
      doc.autoTable({
        startY: 65,
        head: [tableColumn],
        body: tableRows,
        headStyles: {
          fillColor: [0, 102, 51], // Verde
          textColor: [255, 255, 255], // Blanco
          fontSize: 10,
          halign: 'center',
        },
        styles: {
          fontSize: 10,
          cellPadding: 3,
        },
        alternateRowStyles: {
          fillColor: [240, 248, 255], // Azul claro
        },
        margin: { top: 10, bottom: 30 },
        didDrawPage: function (data) {
          const pageCount = doc.internal.getNumberOfPages();
          const pageCurrent = doc.internal.getCurrentPageInfo().pageNumber;
  
          // Pie de página
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
        },
      });
  
      // Crear una nueva ventana con visor personalizado sin botón de descarga ni subtítulo
      const pdfBlob = doc.output('blob');
      const pdfURL = URL.createObjectURL(pdfBlob);
      const newWindow = window.open('', '_blank');
      newWindow.document.write(`
        <html>
          <head><title>Reporte de Edificios</title></head>
          <body style="margin: 0; overflow: hidden;">
            <iframe width="100%" height="100%" src="${pdfURL}" frameborder="0" style="border: none;"></iframe>
          </body>
        </html>`);
    };
  
    img.onerror = () => {
      swal.fire('Error', 'No se pudo cargar el logo.', 'error');
    };
  };

  // Abre el modal de actualización con los datos del edificio seleccionado
  const openUpdateModal = (edificio) => {
    setEdificioToUpdate(edificio);
    setModalUpdateVisible(true);
    setHasUnsavedChanges(false); // Resetear el estado de cambios no guardados
  };

  // Abre el modal de eliminación con los datos del edificio seleccionado
  const openDeleteModal = (edificio) => {
    setEdificioToDelete(edificio);
    setModalDeleteVisible(true);
  };

  // Maneja la búsqueda filtrando por nombre del edificio
  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1); // Reinicia a la primera página al buscar
  };

  // Filtra los edificios según el término de búsqueda
  const filteredEdificios = edificios.filter((edificio) =>
    edificio.Nombre_edificios.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Cálculo de la paginación
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredEdificios.slice(indexOfFirstRecord, indexOfLastRecord);

  // Función para cambiar de página en la paginación
  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= Math.ceil(filteredEdificios.length / recordsPerPage)) {
      setCurrentPage(pageNumber);
    }
  };
   // Verificar permisos
 if (!canSelect) {
  return <AccessDenied />;
}

  return (
    <CContainer>
      <h1>Mantenimiento Edificios</h1>

      {/* Botones "Nuevo" y "Reporte" alineados arriba */}
      <div className="d-flex justify-content-end mb-3">
        <CButton
          style={{ backgroundColor: '#4B6251', color: 'white', marginRight: '10px' }}
          onClick={() => {
            setModalVisible(true);
            setHasUnsavedChanges(false);
          }}
        >
          + Nuevo
        </CButton>
        {/* Botón Reportes con dropdown */}
        <CDropdown>
  <CDropdownToggle
    style={{ backgroundColor: '#6C8E58', color: 'white' }}
  >
    Reporte
  </CDropdownToggle>
  <CDropdownMenu>
    <CDropdownItem
      onClick={exportToExcel} // Si ya tienes exportación a Excel
      style={{
        color: '#6C8E58',
        fontWeight: 'bold',
      }}
    >
      Descargar en Excel
    </CDropdownItem>
    <CDropdownItem
      onClick={generatePDFForEdificios} // Aquí se llama la función del PDF
      style={{
        color: '#6C8E58',
        fontWeight: 'bold',
      }}
    >
      Ver Reporte en PDF
    </CDropdownItem>
  </CDropdownMenu>
</CDropdown>
      </div>

      {/* Filtro de búsqueda y selección de registros */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <CInputGroup style={{ maxWidth: '400px' }}>
          <CInputGroupText>Buscar</CInputGroupText>
          <CFormInput placeholder="Buscar por nombre" onChange={handleSearch} value={searchTerm} />
          <CButton
            style={{ backgroundColor: '#cccccc', color: 'black' }}
            onClick={() => {
              setSearchTerm('');
              setCurrentPage(1);
            }}
          >
            Limpiar
          </CButton>
        </CInputGroup>
        <div className="d-flex align-items-center">
          <label htmlFor="recordsPerPageSelect" className="mr-2">Mostrar</label>
          <select
            id="recordsPerPageSelect"
            value={recordsPerPage}
            onChange={(e) => {
              setRecordsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={15}>15</option>
            <option value={20}>20</option>
          </select>
          <span style={{ marginLeft: '10px' }}>registros</span>
        </div>
      </div>

      {/* Tabla de edificios con tamaño fijo */}
      <div style={{ height: '300px', overflowY: 'scroll', border: '1px solid #ccc', padding: '10px', marginBottom: '30px' }}>
        <CTable striped>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell className="text-center" style={{ width: '5%' }}>#</CTableHeaderCell>
              <CTableHeaderCell style={{ width: '40%' }}>Nombre del Edificio</CTableHeaderCell>
              <CTableHeaderCell className="text-center" style={{ width: '20%' }}>Número de Pisos</CTableHeaderCell>
              <CTableHeaderCell className="text-center" style={{ width: '20%' }}>Aulas Integradas</CTableHeaderCell>
              <CTableHeaderCell className="text-center" style={{ width: '15%' }}>Acciones</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {currentRecords.map((edificio) => (
              <CTableRow key={edificio.Cod_edificio}>
                <CTableDataCell className="text-center">{edificio.originalIndex}</CTableDataCell>
                <CTableDataCell style={{ textTransform: 'uppercase' }}>{edificio.Nombre_edificios}</CTableDataCell>
                <CTableDataCell className="text-center">{edificio.Numero_pisos}</CTableDataCell>
                <CTableDataCell className="text-center">{edificio.Aulas_disponibles}</CTableDataCell>
                <CTableDataCell className="text-center">
                  <div className="d-flex justify-content-center">

{canUpdate &&(
                    <CButton
                      color="warning"
                      onClick={() => openUpdateModal(edificio)}
                      style={{ marginRight: '10px' }}
                    >
                      <CIcon icon={cilPen} />
                    </CButton>
)}
                    {canDelete && (
                    <CButton color="danger" onClick={() => openDeleteModal(edificio)}>
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
      <CPagination
        align="center"
        aria-label="Page navigation example"
        activePage={currentPage}
        pages={Math.ceil(filteredEdificios.length / recordsPerPage)}
        onActivePageChange={paginate}
      />

      {/* Botones de paginación "Anterior" y "Siguiente" */}
      <div className="d-flex justify-content-center align-items-center mt-3">
        <CButton
          style={{ backgroundColor: '#6f8173', color: '#D9EAD3' }}
          disabled={currentPage === 1}
          onClick={() => paginate(currentPage - 1)}
        >
          Anterior
        </CButton>
        <CButton
          style={{ marginLeft: '10px', backgroundColor: '#6f8173', color: '#D9EAD3' }}
          disabled={currentPage === Math.ceil(filteredEdificios.length / recordsPerPage)}
          onClick={() => paginate(currentPage + 1)}
        >
          Siguiente
        </CButton>
        <div style={{ marginLeft: '10px' }}>
          Página {currentPage} de {Math.ceil(filteredEdificios.length / recordsPerPage)}
        </div>
      </div>

      {/* Modal Crear Edificio */}
      <CModal visible={modalVisible} onClose={() => handleCloseModal(setModalVisible, resetNuevoEdificio)} backdrop="static">
        <CModalHeader>
          <CModalTitle>Ingresar edificio</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CFormInput
              label="Nombre del edificio"
              value={nuevoEdificio.Nombre_edificios}
              maxLength={50}
              style={{ textTransform: 'uppercase' }}
              onPaste={disableCopyPaste}
              onCopy={disableCopyPaste}
              onChange={(e) => handleNombreInputChange(e, setNuevoEdificio)}
            />
            <CFormInput
              label="Número de pisos"
              type="number"
              value={nuevoEdificio.Numero_pisos}
              maxLength={2}
              onPaste={disableCopyPaste}
              onCopy={disableCopyPaste}
              onChange={(e) => {
                const value = e.target.value.slice(0, 3);
                setNuevoEdificio({ ...nuevoEdificio, Numero_pisos: value });
                validateFields('Numero_pisos', value);
              }}
            />
            {errors.Numero_pisos && <p className="text-danger">{errors.Numero_pisos}</p>}
            <CFormInput
              label="Aulas integradas"
              type="number"
              value={nuevoEdificio.Aulas_disponibles}
              maxLength={3}
              onPaste={disableCopyPaste}
              onCopy={disableCopyPaste}
              onChange={(e) => handleAulasInputChange(e, setNuevoEdificio)}
            />
            {/* Mostrar advertencia de que el número de pisos es mayor al de aulas */}
            {errors.pisosVsAulas && <p className="text-warning">{errors.pisosVsAulas}</p>}
            {errors.Aulas_disponibles && <p className="text-danger">{errors.Aulas_disponibles}</p>}
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => handleCloseModal(setModalVisible, resetNuevoEdificio)}>
            Cancelar
          </CButton>
          <CButton
            style={{ backgroundColor: '#4B6251', color: 'white' }}
            onClick={handleCreateEdificio}
            disabled={errors.Numero_pisos || errors.Aulas_disponibles}
          >
            Guardar
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Modal Actualizar Edificio */}
      <CModal visible={modalUpdateVisible} onClose={() => handleCloseModal(setModalUpdateVisible, resetEdificioToUpdate)} backdrop="static">
        <CModalHeader>
          <CModalTitle>Actualizar edificio</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CFormInput
              label="Identificador"
              value={edificioToUpdate.Cod_edificio}
              readOnly
            />
            <CFormInput
              label="Nombre del Edificio"
              value={edificioToUpdate.Nombre_edificios}
              maxLength={50}
              style={{ textTransform: 'uppercase' }}
              onPaste={disableCopyPaste}
              onCopy={disableCopyPaste}
              onChange={(e) => handleNombreInputChange(e, setEdificioToUpdate)}
            />
            <CFormInput
              label="Número de Pisos"
              type="number"
              value={edificioToUpdate.Numero_pisos}
              maxLength={2}
              onPaste={disableCopyPaste}
              onCopy={disableCopyPaste}
              onChange={(e) => {
                const value = e.target.value.slice(0, 3);
                setEdificioToUpdate({ ...edificioToUpdate, Numero_pisos: value });
                validateFields('Numero_pisos', value);
              }}
            />
            {errors.Numero_pisos && <p className="text-danger">{errors.Numero_pisos}</p>}
            <CFormInput
              label="Aulas Integradas"
              type="number"
              value={edificioToUpdate.Aulas_disponibles}
              maxLength={2}
              onPaste={disableCopyPaste}
              onCopy={disableCopyPaste}
              onChange={(e) => {
                const value = e.target.value.slice(0, 3);
                setEdificioToUpdate({ ...edificioToUpdate, Aulas_disponibles: value });
                validateFields('Aulas_disponibles', value);
              }}
            />
            {/* Mostrar advertencia de que el número de pisos es mayor al de aulas */}
            {errors.pisosVsAulas && <p className="text-warning">{errors.pisosVsAulas}</p>}
            {errors.Aulas_disponibles && <p className="text-danger">{errors.Aulas_disponibles}</p>}
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => handleCloseModal(setModalUpdateVisible, resetEdificioToUpdate)}>
            Cancelar
          </CButton>
          <CButton
            style={{ backgroundColor: '#4B6251', color: 'white' }}
            onClick={handleUpdateEdificio}
            disabled={errors.Numero_pisos || errors.Aulas_disponibles}
          >
            Guardar
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Modal Eliminar Edificio */}
      <CModal visible={modalDeleteVisible} onClose={() => setModalDeleteVisible(false)} backdrop="static">
        <CModalHeader>
          <CModalTitle>Eliminar edificio</CModalTitle>
        </CModalHeader>
        <CModalBody>
          ¿Estás seguro de que deseas eliminar el edificio "{edificioToDelete.Nombre_edificios}"?
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setModalDeleteVisible(false)}>
            Cancelar
          </CButton>
          <CButton color="danger" onClick={handleDeleteEdificio}>
            Eliminar
          </CButton>
        </CModalFooter>
      </CModal>
    </CContainer>
  );
};

export default ListaEdificios;
