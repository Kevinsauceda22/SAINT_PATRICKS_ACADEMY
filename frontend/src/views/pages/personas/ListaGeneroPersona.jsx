import React, { useEffect, useState } from 'react';
import { CIcon } from '@coreui/icons-react';
import { cilSearch, cilPen, cilTrash, cilPlus, cilDescription, cilSave } from '@coreui/icons';
import swal from 'sweetalert2';
import '@fortawesome/fontawesome-free/css/all.min.css';
import {
  CButton,
  CContainer,
  CInputGroup,
  CInputGroupText,
  CFormInput,
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
  CRow,
  CCol,
  CDropdown,
  CDropdownMenu,
  CDropdownToggle,
  CDropdownItem,
  CFormSelect,
} from '@coreui/react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import logo from 'src/assets/brand/logo_saint_patrick.png';

const ListaGeneroPersona = () => {
  const [generos, setGeneros] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [nuevoGenero, setNuevoGenero] = useState({ Cod_genero: '', Tipo_genero: '' });
  const [generoToUpdate, setGeneroToUpdate] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchGeneros();
  }, []);

  const fetchGeneros = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/generoPersona/obtenerGeneroPersona');
      if (!response.ok) {
        throw new Error(`Error en la solicitud: ${response.statusText}`);
      }
      const data = await response.json();
  
      // Ordenar alfabéticamente por 'Tipo_genero'
      const sortedData = data.sort((a, b) =>
        a.Tipo_genero.localeCompare(b.Tipo_genero, 'es', { sensitivity: 'base' }) // Comparación alfabética
      );
  
      setGeneros(sortedData); // Asignar datos ordenados al estado
    } catch (error) {
      console.error('Error fetching generos:', error);
      swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo cargar la lista de géneros. Intenta más tarde.',
      });
    }
  };
  
  const exportToPDF = () => {
    const doc = new jsPDF();
    const img = new Image();
    img.src = logo; // Usa el logo importado
  
    img.onload = () => {
      // Encabezado
      doc.addImage(img, 'PNG', 10, 10, 30, 30);
  
      doc.setFontSize(18);
      doc.setTextColor(0, 102, 51); // Verde oscuro
      doc.text("SAINT PATRICK'S ACADEMY", doc.internal.pageSize.width / 2, 20, { align: 'center' });
  
      doc.setFontSize(14);
      doc.text('Reporte de Géneros', doc.internal.pageSize.width / 2, 30, { align: 'center' });
  
      doc.setFontSize(10);
      doc.setTextColor(100); // Gris oscuro
      doc.text('Casa Club del periodista, Colonia del Periodista', doc.internal.pageSize.width / 2, 40, { align: 'center' });
      doc.text('Teléfono: (504) 2234-8871 | Correo: info@saintpatrickacademy.edu', doc.internal.pageSize.width / 2, 45, { align: 'center' });
  
      // Línea divisoria
      doc.setLineWidth(0.5);
      doc.setDrawColor(0, 102, 51); // Verde oscuro
      doc.line(10, 55, doc.internal.pageSize.width - 10, 55);
  
      // Tabla
      doc.autoTable({
        startY: 60,
        head: [['#', 'Tipo de Género']],
        body: currentRecords.map((genero, index) => [index + 1, genero.Tipo_genero]),
        headStyles: {
          fillColor: [0, 102, 51], // Verde oscuro
          textColor: [255, 255, 255], // Blanco
          fontSize: 10,
        },
        styles: {
          fontSize: 10,
          cellPadding: 3,
        },
        alternateRowStyles: { fillColor: [240, 248, 255] }, // Azul claro para filas alternas
      });
  
      // Pie de página
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        const pageWidth = doc.internal.pageSize.width;
        const pageHeight = doc.internal.pageSize.height;
  
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
  
        doc.setFontSize(10);
        doc.setTextColor(0, 102, 51); // Verde
        doc.text(`Fecha de generación: ${dateString} Hora: ${timeString}`, 10, pageHeight - 10);
        doc.text(`Página ${i} de ${pageCount}`, pageWidth - 10, pageHeight - 10, { align: 'right' });
      }
  
      doc.save('Reporte_Generos.pdf');
      window.open(doc.output('bloburl'));
    };
  
    img.onerror = () => {
      alert('No se pudo cargar el logo. El PDF no se generará.');
    };
  };
  
  
  const exportToPDFIndividual = (genero) => {
    const doc = new jsPDF();
    const img = new Image();
    img.src = logo; // Usa el logo importado
  
    img.onload = () => {
      // Encabezado
      doc.addImage(img, 'PNG', 10, 10, 30, 30);
  
      doc.setFontSize(18);
      doc.setTextColor(0, 102, 51); // Verde oscuro
      doc.text("SAINT PATRICK'S ACADEMY", doc.internal.pageSize.width / 2, 20, { align: 'center' });
  
      doc.setFontSize(14);
      doc.text(
        `Reporte Individual de Tipo de Género: ${genero.Tipo_genero.toUpperCase()}`,
        doc.internal.pageSize.width / 2,
        30,
        { align: 'center' }
      );
  
      doc.setFontSize(10);
      doc.setTextColor(100); // Gris oscuro
      doc.text('Casa Club del periodista, Colonia del Periodista', doc.internal.pageSize.width / 2, 40, { align: 'center' });
      doc.text('Teléfono: (504) 2234-8871 | Correo: info@saintpatrickacademy.edu', doc.internal.pageSize.width / 2, 45, { align: 'center' });
  
      // Línea divisoria
      doc.setLineWidth(0.5);
      doc.setDrawColor(0, 102, 51); // Verde oscuro
      doc.line(10, 55, doc.internal.pageSize.width - 10, 55);
  
      // Tabla
      doc.autoTable({
        startY: 60,
        head: [['#', 'Tipo de Género']],
        body: [[1, genero.Tipo_genero]],
        headStyles: {
          fillColor: [0, 102, 51], // Verde oscuro
          textColor: [255, 255, 255], // Blanco
          fontSize: 10,
        },
        styles: {
          fontSize: 10,
          cellPadding: 3,
        },
        alternateRowStyles: { fillColor: [240, 248, 255] }, // Azul claro para filas alternas
      });
  
      // Pie de página
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        const pageWidth = doc.internal.pageSize.width;
        const pageHeight = doc.internal.pageSize.height;
  
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
  
        doc.setFontSize(10);
        doc.setTextColor(0, 102, 51); // Verde
        doc.text(`Fecha de generación: ${dateString} Hora: ${timeString}`, 10, pageHeight - 10);
        doc.text(`Página ${i} de ${pageCount}`, pageWidth - 10, pageHeight - 10, { align: 'right' });
      }
  
      doc.save(`Reporte_Individual_${genero.Tipo_genero}.pdf`);
      window.open(doc.output('bloburl'));
    };
  
    img.onerror = () => {
      alert('No se pudo cargar el logo. El PDF no se generará.');
    };
  };
  
 
  const handleCreateOrUpdate = async () => {
    console.log('Ejecutando handleCreateOrUpdate...');
    if (isSubmitting) {
      console.log('Botón deshabilitado, ya se está procesando.');
      return;
    }
    setIsSubmitting(true);
  
    const genero = generoToUpdate || nuevoGenero; // Determinar si es creación o actualización
  
    // **VALIDACIONES**
    console.log('Inicia validaciones...');
    if (!generoToUpdate.Tipo_genero.trim()) {
      swal.fire({
        icon: 'error',
        html: '<b>El campo "Tipo de Género" no puede estar vacío.</b>',
        timer: 3000,
        showConfirmButton: false,
      });
      return;
    }
    
  
    const isDuplicate = generos.some(
      (item) =>
        item.Tipo_genero.toUpperCase() === genero.Tipo_genero.trim().toUpperCase() &&
        (!generoToUpdate || item.Cod_genero !== generoToUpdate.Cod_genero)
    );
  
    if (isDuplicate) {
      swal.fire({
        icon: 'error',
        html: `<b>El tipo de género "${genero.Tipo_genero.trim()}" ya existe.</b>`,
        timer: 3000,
        showConfirmButton: false,
      });
      setIsSubmitting(false);
      return;
    }
  
    const vocalRegex = /[aeiouáéíóúü]/i;
    if (!vocalRegex.test(genero.Tipo_genero)) {
      swal.fire({
        icon: 'error',
        html: '<b>El "Tipo de Género" debe contener al menos una vocal.</b>',
        timer: 3000,
        showConfirmButton: false,
      });
      setIsSubmitting(false);
      return;
    }
  
    // **CONSTRUCCIÓN DE SOLICITUD**
    const url = generoToUpdate
      ? `http://localhost:4000/api/generoPersona/actualizarGeneroPersona/${generoToUpdate.Cod_genero}`
      : 'http://localhost:4000/api/generoPersona/crearGeneroPersona';
    const method = generoToUpdate ? 'PUT' : 'POST';
    const body = JSON.stringify({ Tipo_genero: genero.Tipo_genero.trim() });
  
    console.log('Enviando datos al servidor:', { url, method, body });
  
    // **SOLICITUD AL SERVIDOR**
    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body,
      });
  
      if (!response.ok) {
        const errorResult = await response.json();
        throw new Error(errorResult.Mensaje || 'Error inesperado en el servidor.');
      }
  
      const result = await response.json();
      console.log('Respuesta exitosa:', result);
  
      if (generoToUpdate) {
        setGeneros((prevGeneros) =>
          prevGeneros
            .map((item) =>
              item.Cod_genero === generoToUpdate.Cod_genero
                ? { ...item, Tipo_genero: genero.Tipo_genero.trim() }
                : item
            )
            .sort((a, b) => a.Tipo_genero.localeCompare(b.Tipo_genero))
        );
        swal.fire({
          icon: 'success',
          html: '<b>Tipo de género actualizado exitosamente.</b>',
          timer: 3000,
          showConfirmButton: false,
        });
      } else {
        setGeneros((prevGeneros) => [
          ...prevGeneros,
          { Cod_genero: result.Cod_genero, Tipo_genero: genero.Tipo_genero.trim() },
        ].sort((a, b) => a.Tipo_genero.localeCompare(b.Tipo_genero)));
        swal.fire({
          icon: 'success',
          html: '<b>Tipo de género creado exitosamente.</b>',
          timer: 3000,
          showConfirmButton: false,
        });
      }
  
      setModalVisible(false);
      setNuevoGenero({ Cod_genero: '', Tipo_genero: '' });
      setGeneroToUpdate(null);
    } catch (error) {
      console.error('Error en la operación:', error);
      swal.fire({
        icon: 'error',
        html: `<b>${error.message}</b>`,
        timer: 3000,
        showConfirmButton: false,
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  

  const handleDeleteGenero = async (Cod_genero, Tipo_genero) => {
    try {
      const confirmResult = await swal.fire({
        title: 'Confirmar Eliminación',
        html: `¿Estás seguro de que deseas eliminar el género: <strong>${Tipo_genero}</strong>?`, // Muestra correctamente el valor
        showCancelButton: true,
        confirmButtonColor: '#FF6B6B',
        cancelButtonColor: '#6C757D',
        cancelButtonText: 'Cancelar',
        confirmButtonText: '<i class="fa fa-trash"></i> Eliminar',
        reverseButtons: true,
        focusCancel: true,
      });
  
      if (!confirmResult.isConfirmed) return;
  
      const response = await fetch(
        `http://localhost:4000/api/generoPersona/eliminarGeneroPersona/${encodeURIComponent(Cod_genero)}`,
        { method: 'DELETE' }
      );
  
      const result = await response.json();
  
      if (response.ok) {
        fetchGeneros();
        swal.fire({
          icon: 'success',
          html: `<br><b>El género "${Tipo_genero}" fue eliminado correctamente.</b>`,
          timer: 3000, // Duración en milisegundos
          showConfirmButton: false, // No mostrar botón de OK
        });
      } else {
        throw new Error(result.Mensaje || `<b>No se pudo eliminar el género "${Tipo_genero}".</b>`);
      }
      } catch (error) {
        console.error('Error eliminando el género:', error);
        swal.fire({
          icon: 'error',
          html: `<b>Error</b><br><b>${error.message || `No se pudo eliminar el género "${Tipo_genero}".`}</b>`,
          timer: 3000, // Duración en milisegundos
          showConfirmButton: false, // No mostrar botón de OK
        });
      }    
  };
  


  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  const handleRecordsPerPageChange = (e) => {
    setRecordsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const filteredGeneros = generos.filter((genero) =>
    genero.Tipo_genero ? genero.Tipo_genero.toLowerCase().includes(searchTerm.toLowerCase()) : false
  );

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredGeneros
  .slice(indexOfFirstRecord, indexOfLastRecord); // Obtener los registros actuales según la paginación

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <CContainer>
      <CRow className="align-items-center mb-5">
        <CCol xs="8" md="9"><h1>Mantenimieno Géneros</h1></CCol>
        <CCol xs="4" md="3" className="text-end">
          <CButton style={{ backgroundColor: '#4B6251', color: 'white' }} onClick={() => {
            setModalVisible(true);
            setGeneroToUpdate(null);
          }}>
            <CIcon icon={cilPlus} /> Nuevo
          </CButton>
          <CButton
  style={{ backgroundColor: '#6C8E58', color: 'white', marginRight: '10px' }}
  onClick={exportToPDF} // Llama a la función que genera el reporte general
>
  <CIcon icon={cilDescription} /> Descargar PDF
</CButton>

          <div className="mt-2" style={{ textAlign: 'right' }}>
            <span>Mostrar </span>
            <CFormSelect
              value={recordsPerPage}
              onChange={handleRecordsPerPageChange}
              style={{ maxWidth: '70px', display: 'inline-block', margin: '0 5px' }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </CFormSelect>
            <span> registros</span>
          </div>
        </CCol>
      </CRow>

      <CInputGroup className="mb-3" style={{ maxWidth: '400px' }}>
        <CInputGroupText><CIcon icon={cilSearch} /></CInputGroupText>
        <CFormInput placeholder="Buscar género persona...." onChange={handleSearch} value={searchTerm} />
        <CButton
          onClick={() => setSearchTerm('')}
          style={{
            border: '2px solid #d3d3d3',
            color: '#4B6251',
            backgroundColor: '#f0f0f0',
          }}
        >
          <i className="fa fa-broom" style={{ marginRight: '5px' }}></i> Limpiar
        </CButton>
      </CInputGroup>

      <div className="table-container" style={{ maxHeight: '400px', overflowY: 'scroll', marginBottom: '20px' }}>
      <CTable striped bordered hover>
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell>#</CTableHeaderCell>
            <CTableHeaderCell>Tipo de Género</CTableHeaderCell>
            <CTableHeaderCell>Acciones</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
  {currentRecords.map((genero, index) => (
    <CTableRow key={genero.Cod_genero}>
      <CTableDataCell>{index + 1 + (currentPage - 1) * recordsPerPage}</CTableDataCell>
      <CTableDataCell>{genero.Tipo_genero}</CTableDataCell>
      <CTableDataCell>
        {/* Botón de editar */}
        <CButton
          color="warning"
          size="sm"
          onClick={() => {
            setGeneroToUpdate(genero);
            setModalVisible(true);
          }}
        >
          <CIcon icon={cilPen} />
        </CButton>

        {/* Botón de eliminar */}
        <CButton
          color="danger"
          size="sm"
          style={{ marginLeft: '5px' }}
          onClick={() => handleDeleteGenero(genero.Cod_genero, genero.Tipo_genero)}
        >
          <CIcon icon={cilTrash} />
        </CButton>

        <CButton
  color="info" // Define el color del botón como 'info' (azul)
  size="sm"
  style={{ marginLeft: '5px' }}
  onClick={() => exportToPDFIndividual(genero)} // Llama a la función correcta con el parámetro 'genero'
>
  <CIcon icon={cilDescription} style={{ marginRight: '5px' }} /> {/* Ícono antes del texto */}
  Descargar PDF
</CButton>

      </CTableDataCell>
    </CTableRow>
  ))}
</CTableBody>

      </CTable>
    </div>
      <CPagination align="center" className="my-3">
  <CButton
    style={{
      backgroundColor: '#7fa573', // Verde claro
      color: 'white',
      padding: '10px 20px',
      marginRight: '10px',
      border: 'none',
      borderRadius: '5px',
    }}
    onClick={() => paginate(currentPage - 1)}
    disabled={currentPage === 1}
  >
    Anterior
  </CButton>
  <CButton
    style={{
      backgroundColor: '#7fa573', // Verde claro
      color: 'white',
      padding: '10px 20px',
      border: 'none',
      borderRadius: '5px',
    }}
    onClick={() => paginate(currentPage + 1)}
    disabled={indexOfLastRecord >= filteredGeneros.length}
  >
    Siguiente
  </CButton>
  <span
    style={{
      marginLeft: '15px',
      fontSize: '16px',
      color: '#333', // Texto gris oscuro
    }}
  >
    Página {currentPage} de {Math.ceil(filteredGeneros.length / recordsPerPage)}
  </span>
</CPagination>


      <CModal visible={modalVisible} onClose={() => {
        setModalVisible(false);
        setGeneroToUpdate(null);
      }}>
        <CModalHeader>
          <CModalTitle>{generoToUpdate ? 'Actualizar Género' : 'Crear Nuevo Género'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CInputGroup className="mb-3">
            <CInputGroupText>Tipo de Género</CInputGroupText>
            <CFormInput
  placeholder="Ingrese el tipo de género"
  value={generoToUpdate ? generoToUpdate.Tipo_genero : nuevoGenero.Tipo_genero}
  onChange={(e) => {
    // Convertir a mayúsculas, eliminar números y restringir a 100 caracteres
    let value = e.target.value
      .replace(/\s{2,}/g, ' ') // Eliminar espacios consecutivos
      .replace(/[0-9]/g, '') // Eliminar números
      .toUpperCase(); // Convertir a mayúsculas

    if (value.length > 100) {
      value = value.slice(0, 100); // Limitar a 100 caracteres
    }

    if (generoToUpdate) {
      setGeneroToUpdate({ ...generoToUpdate, Tipo_genero: value });
    } else {
      setNuevoGenero({ ...nuevoGenero, Tipo_genero: value });
    }
  }}
  onKeyDown={(e) => {
    const inputValue = e.target.value;

    // Bloquear espacios al inicio y espacios consecutivos
    if (
      (e.key === ' ' && (inputValue === '' || inputValue.endsWith(' '))) || // Bloquear espacio al inicio o consecutivo
      (inputValue.length === 0 && e.key === ' ') // Bloquear espacio como primer carácter
    ) {
      e.preventDefault();
    }

    // Permitir solo letras, espacio, retroceso y borrar
    const isLetter = /^[A-Z]$/i.test(e.key);
    const isSpace = e.key === ' ';
    const isBackspaceOrDelete = e.key === 'Backspace' || e.key === 'Delete';

    if (!isLetter && !isSpace && !isBackspaceOrDelete) {
      e.preventDefault(); // Bloquear otros caracteres (incluidos números)
    }

    // Restringir la longitud máxima del campo a 100 caracteres
    if (inputValue.length >= 100 && !isBackspaceOrDelete) {
      e.preventDefault();
    }
  }}
/>
          </CInputGroup>
        </CModalBody>
        <CModalFooter>
          <CButton
            color="secondary"
            onClick={() => {
              setModalVisible(false);
              setGeneroToUpdate(null);
            }}
          >
            Cancelar
          </CButton>
          <CButton
  style={generoToUpdate
    ? { backgroundColor: '#FFD700', color: 'white' } // Estilo para actualizar
    : { backgroundColor: '#4B6251', color: 'white' } // Estilo para guardar
  }
  onClick={handleCreateOrUpdate} // Llamar a la función unificada
>
  <CIcon icon={generoToUpdate ? cilPen : cilSave} /> {/* Icono dinámico */}
  {generoToUpdate ? 'Actualizar' : 'Guardar'} {/* Texto dinámico */}
</CButton>

        </CModalFooter>
      </CModal>
    </CContainer>
  );
};

export default ListaGeneroPersona;
