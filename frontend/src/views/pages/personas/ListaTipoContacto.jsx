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

const ListaTipoContacto = () => {
  const [tiposContacto, setTiposContacto] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [tipoContactoToUpdate, setTipoContactoToUpdate] = useState(null);
  const [nuevoTipoContacto, setNuevoTipoContacto] = useState({ tipo_contacto: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(5);

  useEffect(() => {
    fetchTiposContacto();
  }, []);

  const fetchTiposContacto = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/tipoContacto/obtenerTipoContacto');
      if (!response.ok) throw new Error(`Error en la solicitud: ${response.statusText}`);
      const data = await response.json();
  
      console.log('Datos recibidos del backend:', data);
  
      // Ordenar alfabéticamente por "tipo_contacto"
      const sortedData = data
        .map((item) => ({
          cod_tipo_contacto: item.cod_tipo_contacto,
          tipo_contacto: item.tipo_contacto || 'N/A',
        }))
        .sort((a, b) => a.tipo_contacto.localeCompare(b.tipo_contacto));
  
      setTiposContacto(sortedData);
    } catch (error) {
      console.error('Error fetching tipos de contacto:', error);
      swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo cargar la lista de tipos de contacto.' });
    }
  };
  
  const exportToPDF = () => {
    const doc = new jsPDF();

    // Agregar logo usando la imagen importada
    doc.addImage(logo, 'PNG', 10, 10, 30, 30);

    // Título principal
    doc.setFontSize(18);
    doc.setTextColor(0, 102, 51); // Verde oscuro
    doc.text("SAINT PATRICK'S ACADEMY", doc.internal.pageSize.width / 2, 20, { align: 'center' });

    // Subtítulo
    doc.setFontSize(14);
    doc.text('Reporte de Tipos de Contacto', doc.internal.pageSize.width / 2, 30, { align: 'center' });

    // Información adicional
    doc.setFontSize(10);
    doc.setTextColor(100); // Gris oscuro
    doc.text('Casa Club del periodista, Colonia del Periodista', doc.internal.pageSize.width / 2, 40, { align: 'center' });
    doc.text('Teléfono: (504) 2234-8871 | Correo: info@saintpatrickacademy.edu', doc.internal.pageSize.width / 2, 45, { align: 'center' });

    // Línea divisoria
    doc.setLineWidth(0.5);
    doc.setDrawColor(0, 102, 51); // Verde oscuro
    doc.line(10, 55, doc.internal.pageSize.width - 10, 55);

    // Tabla con encabezados personalizados y estilos
    doc.autoTable({
        startY: 60, // Ajuste de posición inicial
        head: [['#', 'Tipo de Contacto']], // Encabezados
        body: filteredTiposContacto.map((item, index) => [index + 1, item.tipo_contacto.toUpperCase()]), // Datos
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

        // Fecha y hora de generación
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

        // Número de página
        doc.text(`Página ${i} de ${pageCount}`, pageWidth - 10, pageHeight - 10, { align: 'right' });
    }

    // Guardar archivo y abrir automáticamente
    const fileName = 'Reporte_TiposContacto.pdf'; // Nombre predefinido
    doc.save(fileName);
    window.open(doc.output('bloburl')); // Abre el archivo automáticamente
};

  const exportIndividualToPDF = (item, index) => {
    const doc = new jsPDF();

    // Agregar logo usando la imagen importada
    doc.addImage(logo, 'PNG', 10, 10, 30, 30);

    // Título principal
    doc.setFontSize(18);
    doc.setTextColor(0, 102, 51); // Verde oscuro
    doc.text("SAINT PATRICK'S ACADEMY", doc.internal.pageSize.width / 2, 20, { align: 'center' });

    // Subtítulo con el nombre del tipo de contacto
    doc.setFontSize(14);
    doc.text(
        `Reporte Individual de Tipo de Contacto: ${item.tipo_contacto.toUpperCase()}`,
        doc.internal.pageSize.width / 2,
        30,
        { align: 'center' }
    );

    // Información adicional
    doc.setFontSize(10);
    doc.setTextColor(100); // Gris oscuro
    doc.text('Casa Club del periodista, Colonia del Periodista', doc.internal.pageSize.width / 2, 40, { align: 'center' });
    doc.text('Teléfono: (504) 2234-8871 | Correo: info@saintpatrickacademy.edu', doc.internal.pageSize.width / 2, 45, { align: 'center' });

    // Línea divisoria
    doc.setLineWidth(0.5);
    doc.setDrawColor(0, 102, 51); // Verde oscuro
    doc.line(10, 55, doc.internal.pageSize.width - 10, 55);

    // Tabla con los datos individuales
    doc.autoTable({
        startY: 60, // Ajuste de posición inicial
        head: [['#', 'Tipo de Contacto']], // Encabezados
        body: [[index + 1, item.tipo_contacto.toUpperCase()]], // Datos individuales
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

        // Fecha y hora de generación
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

        // Número de página
        doc.text(`Página ${i} de ${pageCount}`, pageWidth - 10, pageHeight - 10, { align: 'right' });
    }

    // Guardar archivo y abrir automáticamente
    const fileName = `Reporte_TipoContacto_${item.tipo_contacto}.pdf`; // Nombre predefinido
    doc.save(fileName);
    window.open(doc.output('bloburl')); // Abre el archivo automáticamente
};

  
const handleCreateOrUpdate = async () => {
  if (isSubmitting) return;

  const isDuplicate = tiposContacto.some(
    (item) =>
      item.tipo_contacto.toUpperCase() === nuevoTipoContacto.tipo_contacto.trim().toUpperCase() &&
      (!tipoContactoToUpdate || item.cod_tipo_contacto !== tipoContactoToUpdate.cod_tipo_contacto)
  );

  if (isDuplicate) {
    swal.fire({
      icon: 'error',
      html: `<b>El tipo de contacto "${nuevoTipoContacto.tipo_contacto.trim()}" ya existe</b>`,
      timer: 3000,
      showConfirmButton: false,
    });
    setIsSubmitting(false);
    return;
  }

  setIsSubmitting(true);
  const url = tipoContactoToUpdate
    ? `http://localhost:4000/api/tipoContacto/actualizarTipoContacto/${tipoContactoToUpdate.cod_tipo_contacto}`
    : 'http://localhost:4000/api/tipoContacto/crearTipoContacto';
  const method = tipoContactoToUpdate ? 'PUT' : 'POST';
  const body = JSON.stringify({ tipo_contacto: nuevoTipoContacto.tipo_contacto.trim() });

  if (!nuevoTipoContacto.tipo_contacto.trim()) {
    swal.fire({
      icon: 'error',
      html: '<b>El campo "Tipo de Contacto" no puede estar vacío.</b>',
      timer: 3000,
      showConfirmButton: false,
    });
    setIsSubmitting(false);
    return;
  }

  const vocalRegex = /[aeiouáéíóúü]/i;
  if (!vocalRegex.test(nuevoTipoContacto.tipo_contacto)) {
    swal.fire({
      icon: 'error',
      html: '<b>El "Tipo de Contacto" debe contener al menos una vocal.</b>',
      timer: 3000,
      showConfirmButton: false,
    });
    setIsSubmitting(false);
    return;
  }

  try {
    const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body });
    const result = await response.json();

    if (response.ok) {
      if (tipoContactoToUpdate) {
        setTiposContacto((prevTipos) =>
          prevTipos.map((item) =>
            item.cod_tipo_contacto === tipoContactoToUpdate.cod_tipo_contacto
              ? { ...item, tipo_contacto: nuevoTipoContacto.tipo_contacto.trim() }
              : item
          ).sort((a, b) => a.tipo_contacto.localeCompare(b.tipo_contacto))
        );
        swal.fire({
          icon: 'success',
          html: '<b>Tipo de contacto actualizado exitosamente</b>',
          timer: 3000,
          showConfirmButton: false,
        });        
      } else {
        setTiposContacto((prevTipos) => [
          ...prevTipos,
          { cod_tipo_contacto: result.cod_tipo_contacto, tipo_contacto: nuevoTipoContacto.tipo_contacto.trim() },
        ].sort((a, b) => a.tipo_contacto.localeCompare(b.tipo_contacto)));
        swal.fire({
          icon: 'success',
          html: '<b>Tipo de contacto creado exitosamente</b>',
          timer: 3000,
          showConfirmButton: false,
        });
      }
      setModalVisible(false);
      setNuevoTipoContacto({ tipo_contacto: '' });
      setTipoContactoToUpdate(null);
    } else {
      swal.fire({
        icon: 'error',
        html: `<b>${result.Mensaje}</b>`,
        timer: 3000,
        showConfirmButton: false,
      });
    }
  } catch (error) {
    console.error('Error:', error);
    swal.fire({
      icon: 'error',
      html: '<b>Error en el servidor.</b>',
      timer: 3000,
      showConfirmButton: false,
    });
  } finally {
    setIsSubmitting(false);
  }
};



const handleDeleteTipoContacto = async (cod_tipo_contacto, tipo_contacto) => {
  try {
    const confirmResult = await swal.fire({
      title: 'Confirmar Eliminación',
      html: `¿Estás seguro de que deseas eliminar el tipo de contacto: <strong>${tipo_contacto || 'N/A'}</strong>?`,
      showCancelButton: true,
      confirmButtonColor: '#FF6B6B',
      cancelButtonColor: '#6C757D',
      cancelButtonText: 'Cancelar',
      confirmButtonText: '<i class="fa fa-trash"></i> Eliminar',
      reverseButtons: true,
      focusCancel: true,
    });

    if (!confirmResult.isConfirmed) return;

    const response = await fetch(`http://localhost:4000/api/tipoContacto/eliminarTipoContacto/${encodeURIComponent(cod_tipo_contacto)}`, {
      method: 'DELETE',
    });

    const result = await response.json();

    if (response.ok) {
      setTiposContacto((prevTipos) =>
        prevTipos.filter((item) => item.cod_tipo_contacto !== cod_tipo_contacto)
      );
      swal.fire({
        icon: 'success',
        html: '<b>Tipo de contacto eliminado exitosamente</b>',
        timer: 3000,
        showConfirmButton: false,
      });
    } else {
      throw new Error(result.Mensaje || 'Error al eliminar');
    }
  } catch (error) {
    console.error('Error eliminando el tipo de contacto:', error);
    swal.fire({
      icon: 'error',
      title: 'Error',
      text: error.message || 'No se pudo eliminar el tipo de contacto.',
      timer: 3000,
      showConfirmButton: false,
    });
  }
};

  const handleRecordsPerPageChange = (e) => {
    setRecordsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const handleSearch = (e) => setSearchTerm(e.target.value);

  const filteredTiposContacto = tiposContacto.filter((item) => {
    const term = searchTerm.toLowerCase();
    return (
      item.tipo_contacto?.toLowerCase().includes(term) || // Asegura que no sea undefined
      item.cod_tipo_contacto?.toString().includes(term)   // Verifica el código también
    );
  });
  

  const indexOfLastRecord = currentPage * recordsPerPage;
const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
const currentRecords = filteredTiposContacto.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredTiposContacto.length / recordsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <CContainer>
      <CRow className="align-items-center mb-5">
        <CCol xs="8" md="9"><h1>Mantenimiento de Tipos de Contacto</h1></CCol>
        <CCol xs="4" md="3" className="text-end">
          <CButton style={{ backgroundColor: '#4B6251', color: 'white' }} onClick={() => { setModalVisible(true); setTipoContactoToUpdate(null); setNuevoTipoContacto({ tipo_contacto: '' }); }}>
            <CIcon icon={cilPlus} /> Nuevo
          </CButton>
          <CButton
  style={{ backgroundColor: '#6C8E58', color: 'white', marginLeft: '10px' }}
  onClick={exportToPDF}
>
  <CIcon icon={cilDescription} style={{ marginRight: '5px' }} />
  Descargar PDF
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
        <CFormInput placeholder="Buscar tipo contacto...." onChange={handleSearch} value={searchTerm} />
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
              <CTableHeaderCell>Tipo de Contacto</CTableHeaderCell>
              <CTableHeaderCell>Acciones</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {currentRecords.map((item, index) => (
              <CTableRow key={item.cod_tipo_contacto}>
                <CTableDataCell>{index + 1 + indexOfFirstRecord}</CTableDataCell>
                <CTableDataCell>{item.tipo_contacto}</CTableDataCell>
                <CTableDataCell>
                  <CButton color="warning" onClick={() => { setTipoContactoToUpdate(item); setModalVisible(true); setNuevoTipoContacto({ tipo_contacto: item.tipo_contacto }); }}>
                    <CIcon icon={cilPen} />
                  </CButton>
                  <CButton
                    color="danger"
                    onClick={() => handleDeleteTipoContacto(item.cod_tipo_contacto, item.tipo_contacto)}
                    className="ms-2"
                  >
                    <CIcon icon={cilTrash} />
                  </CButton>

                  <CButton
  color="info"
  onClick={() => exportIndividualToPDF(item, index)}
>
  <CIcon icon={cilDescription} style={{ marginRight: '5px' }} />
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
            backgroundColor: '#7fa573',
            color: 'white',
            marginRight: '20px',
          }}
          onClick={() => paginate(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Anterior
        </CButton>
        <CButton
          style={{
            backgroundColor: '#7fa573',
            color: 'white',
          }}
          onClick={() => paginate(currentPage + 1)}
          disabled={currentPage === totalPages || filteredTiposContacto.length === 0}
        >
          Siguiente
        </CButton>
        <span style={{ marginLeft: '10px', color: 'black', fontSize: '16px' }}>
          Página {currentPage} de {totalPages}
        </span>
      </CPagination>

      <CModal visible={modalVisible} onClose={() => setModalVisible(false)}>
        <CModalHeader><CModalTitle>{tipoContactoToUpdate ? 'Actualizar Tipo de Contacto' : 'Crear Nuevo Tipo de Contacto'}</CModalTitle></CModalHeader>
        <CModalBody>
          <CInputGroup className="mb-3">
            <CInputGroupText style={{ backgroundColor: '#f0f0f0', color: 'black' }}>
              Tipo Contacto
            </CInputGroupText>
            <CFormInput
              placeholder="Tipo de Contacto"
              value={nuevoTipoContacto.tipo_contacto}
              onChange={(e) => {
                let value = e.target.value.replace(/[0-9]/g, ''); // Elimina números
                value = value.replace(/\s{2,}/g, ' '); // Permite solo un espacio entre palabras
                setNuevoTipoContacto({ tipo_contacto: value.toUpperCase() }); // Convierte a mayúsculas
              }}
              onKeyDown={(e) => {
                if (e.key === ' ') {
                  const inputValue = nuevoTipoContacto.tipo_contacto;
                  if (inputValue.endsWith(' ') || inputValue === '') {
                    e.preventDefault(); // Bloquea la tecla de espacio si ya hay un espacio al final o si el input está vacío
                  }
                }
                // Bloquea la entrada si se alcanza el límite de 50 caracteres
                if (nuevoTipoContacto.tipo_contacto.length >= 50 && e.key !== 'Backspace' && e.key !== 'Delete') {
                  e.preventDefault();
                }
              }}
            />
          </CInputGroup>
        </CModalBody>

        <CModalFooter>
          <CButton color="secondary" onClick={() => setModalVisible(false)}>Cancelar</CButton>
          <CButton
            onClick={handleCreateOrUpdate}
            style={tipoContactoToUpdate
              ? { backgroundColor: '#FFD700', color: 'white' }
              : { backgroundColor: '#4B6251', color: 'white' }
            }
          >
            <CIcon icon={tipoContactoToUpdate ? cilPen : cilSave} />
            &nbsp;
            {tipoContactoToUpdate ? 'Actualizar' : 'Guardar'}
          </CButton>
        </CModalFooter>
      </CModal>
    </CContainer>
  );
};

export default ListaTipoContacto;
