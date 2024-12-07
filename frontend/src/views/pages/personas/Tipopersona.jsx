import React, { useState, useEffect } from 'react';
import { cilSearch, cilBrushAlt, cilPen, cilTrash, cilPlus, cilSave, cilFile } from '@coreui/icons';
import { CIcon } from '@coreui/icons-react';
import swal from 'sweetalert2';
import {
  CButton,
  CContainer,
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
  CFormSelect,
  CRow,
  CCol,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
} from '@coreui/react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import logo from 'src/assets/brand/logo_saint_patrick.png'; // Ruta del logo

import usePermission from '../../../../context/usePermission';
import AccessDenied from "../AccessDenied/AccessDenied"

const TipoPersona = () => {
  const {canSelect, canUpdate, canDelete, canInsert } = usePermission('tipopersona');

  const [tiposPersona, setTiposPersona] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTipos, setFilteredTipos] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [modalVisible, setModalVisible] = useState(false);
  const [editar, setEditar] = useState(false);
  const [estadoActual, setEstadoActual] = useState({ Tipo: '' });
  const [modalDeleteVisible, setModalDeleteVisible] = useState(false); 
  useEffect(() => {
    obtenerTiposPersona();
  }, []);
  const [errorMensaje, setErrorMensaje] = useState(''); // Estado para el mensaje de error

// Función para obtener los tipos de persona
const obtenerTiposPersona = async () => {
  try {
    const response = await fetch('http://localhost:4000/api/tipopersona/tipo-persona');
    const data = await response.json();
    if (response.ok) {
      setTiposPersona(data);
      setFilteredTipos(data);
    } else {
      throw new Error(data.message || 'Error al obtener los tipos de persona');
    }
  } catch (error) {
    setErrorMensaje(error.message);
  } finally {
    setLoading(false);
  }
};
const handleTipoChange = (e) => {
  const textoValido = validarTipoEnTiempoReal(e.target.value);
  // Solo actualiza el estado si el texto es válido
  if (textoValido !== e.target.value) {
    setEstadoActual({ ...estadoActual, Tipo: textoValido });
  } else {
    setEstadoActual({ ...estadoActual, Tipo: e.target.value });
  }
};

const validarTipoEnTiempoReal = (texto) => { 
  texto = texto.toUpperCase(); // Convertir el texto a mayúsculas

  
  // Validación: No permitir números
  const tieneNumeros = /\d/;
  if (tieneNumeros.test(texto)) {
    setErrorMensaje('No se permiten números.');
    setTimeout(() => setErrorMensaje(''), 5000);
    return texto.slice(0, texto.length - 1); // Elimina el último carácter inválido
  }
  const tieneCaracteresEspeciales = /[^a-zA-Z0-9\s]/; // Detecta cualquier cosa que no sea alfanumérico ni espacio
  if (tieneCaracteresEspeciales.test(texto)) {
    setErrorMensaje('No se permiten caracteres especiales.');
    setTimeout(() => setErrorMensaje(''), 5000);
    return texto.slice(0, texto.length - 1); // Elimina el último carácter inválido
  }
  // Validar si el tipo de persona ya existe
  const tipoExistente = tiposPersona.some(tipo => tipo.Tipo.toUpperCase() === texto); 
  if (tipoExistente) {
    setErrorMensaje('Ya existe un tipo de persona con ese nombre.');
    setTimeout(() => setErrorMensaje(''), 5000);
    return texto.slice(0, texto.length - 1); // Elimina el último carácter inválido
  }
// Validación: No permitir más de 2 letras seguidas iguales
const letrasSeguidas = /([a-zA-Z])\1{2,}/; // Solo letras consecutivas
if (letrasSeguidas.test(texto)) {
  setErrorMensaje('No se permiten más de 2 letras consecutivas iguales.');
  setTimeout(() => setErrorMensaje(''), 5000);
  return texto.slice(0, texto.length - 1); // Elimina el último carácter inválido
}

// Validación: No permitir más de 2 espacios consecutivos
const tieneEspaciosConsecutivos = (texto) => {
  const regex = /\s{2,}/; // Detecta más de dos espacios consecutivos
  return regex.test(texto);
};

if (tieneEspaciosConsecutivos(texto)) {
  setErrorMensaje('No se permiten más de 2 espacios consecutivos.');
  setTimeout(() => setErrorMensaje(''), 6000);
  return texto.slice(0, texto.length - 1); // Elimina el último carácter inválido
}

  // Si todo está bien, limpia el error
  setErrorMensaje('');
  return texto; 
};


const disableCopyPaste = (e) => {
  e.preventDefault();
  setErrorMensaje('Copiar y pegar no está permitido.');
  setTimeout(() => setErrorMensaje(''), 6000); // Eliminar mensaje después de 5 segundos
};

// Función para crear un nuevo tipo de persona
const crearTipoPersona = async (tipo) => {
  // Validar el tipo de persona antes de enviarlo
  const tipoValido = validarTipoEnTiempoReal(tipo);
  if (tipoValido !== tipo) {
    return; // Si la validación falla, se detiene el proceso
  }

  try {
    const response = await fetch('http://localhost:4000/api/tipopersona/tipo-persona', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ Tipo: tipoValido }), // Usamos el tipo validado
    });

    if (response.ok) {
      swal.fire({
        title: 'Éxito',
        text: `Tipo de persona "${tipoValido}" creado correctamente.`,
        icon: 'success',
        confirmButtonColor: '#4B6251',
    });
      obtenerTiposPersona(); // Actualiza la lista de tipos de personas
    } else {
      const result = await response.json();
      throw new Error(result.Mensaje || 'Error al crear el tipo de persona');
    }
  } catch (error) {
    swal.fire(error.message); // Mostrar mensaje de error
    
  }
};
// Función para actualizar un tipo de persona
const actualizarTipoPersona = async (codTipo, nuevoTipo) => {
  // Validar el nuevo tipo de persona antes de realizar la actualización
  const tipoValido = validarTipoEnTiempoReal(nuevoTipo);
  if (tipoValido !== nuevoTipo) {
      return; // Si la validación falla, se detiene el proceso
  }

  try {
      const response = await fetch(`http://localhost:4000/api/tipopersona/tipo-persona/${codTipo}`, {
          method: 'PUT',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ Tipo: tipoValido }), // Usamos el tipo validado
      });

      if (response.ok) {
          swal.fire({
              title: 'Éxito',
              text: `TIPO DE PERSONA "${tipoValido}" ACTUALIZADO EXITOSAMENTE.`,
              icon: 'success',
              confirmButtonColor: '#4B6251',
          });
          obtenerTiposPersona(); // Actualiza la lista de tipos de personas
      } else {
          const result = await response.json();
          throw new Error(result.Mensaje || 'Error al actualizar el tipo de persona');
      }
  } catch (error) {
      swal.fire({
          title: 'Error',
          text: error.message,
          icon: 'error',
          confirmButtonColor: '#4B6251',
      });
  }
};


  const eliminarTipoPersona = async (codTipo) => {
    try {
      const response = await fetch(`http://localhost:4000/api/tipopersona/tipo-persona/${codTipo}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        swal.fire({
          title: 'Éxito',
          text: `Tipo de persona eliminado correctamente.`,
          icon: 'success',
          confirmButtonColor: '#4B6251',
        });
        obtenerTiposPersona();
      } else {
        const result = await response.json();
        throw new Error(result.Mensaje || 'Error al eliminar el tipo de persona');
      }
    } catch (error) {
      swal.fire({
        title: 'Error',
        text: error.message,
        icon: 'error',
        confirmButtonColor: '#4B6251',
      });
    }
  };

  const openAddModal = () => {
    setEditar(false);
    setEstadoActual({ Tipo: '' });
    setModalVisible(true);
  };
 // Abre el modal de eliminación con los datos del registro seleccionado
 const openDeleteModal = (historico) => {
  setHistoricoToDelete(historico);
  setModalDeleteVisible(true);
};
  const openEditModal = (tipo) => {
    setEditar(true);
    setEstadoActual(tipo);
    setModalVisible(true);
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    if (!estadoActual.Tipo) {
      swal.fire({
        title: 'Error',
        text: 'El nombre del tipo no puede estar vacío ni contener caracteres especiales o tres letras iguales seguidas.',
        icon: 'error',
        confirmButtonColor: '#4B6251',
      });
      return;
    }

    if (editar) {
      await actualizarTipoPersona(estadoActual.Cod_tipo_persona, estadoActual.Tipo);
    } else {
      await crearTipoPersona(estadoActual.Tipo);
    }
    setModalVisible(false);
  };

  const confirmDelete = (codTipo) => {
    swal.fire({
      title: '¿Estás seguro?',
      text: 'No podrás revertir esta acción',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#4B6251',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        eliminarTipoPersona(codTipo);
      }
    });
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);

    const filtered = tiposPersona.filter(tipo =>
      tipo.Tipo.toLowerCase().includes(value)
    );
    setFilteredTipos(filtered);
    setCurrentPage(0);
  };
  const exportToPDF = () => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });
  
    if (tiposPersona.length === 0) {
      console.warn('No hay datos de tipos de persona para exportar.');
      return;
    }
    const img = new Image();
    img.src = logo;
  
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
      doc.text('Reporte de Tipos de Persona', pageWidth / 2, 50, { align: 'center' });
  
      // Línea divisoria
      doc.setLineWidth(0.5);
      doc.setDrawColor(0, 102, 51); // Verde
      doc.line(10, 55, pageWidth - 10, 55);
  
      // Subtítulo
      doc.setFontSize(12);
      doc.setTextColor(0);
    
  
      // Tabla de datos
      doc.autoTable({
        startY: 70,
        head: [['#', 'Tipo de Persona']],
        body: tiposPersona.map((tipo, index) => [
          { content: (index + 1).toString(), styles: { halign: 'center' } },
          { content: tipo.Tipo.toUpperCase(), styles: { halign: 'left' } },
        ]),
        headStyles: {
          fillColor: [0, 102, 51], // Verde
          textColor: [255, 255, 255], // Blanco
          fontSize: 10,
          halign: 'center', // Centrado por defecto
        },
        styles: {
          fontSize: 10,
          cellPadding: 3,
        },
        alternateRowStyles: {
          fillColor: [240, 248, 255], // Azul claro
        },
        columnStyles: {
          0: { halign: 'center' }, // Centro para el número
          1: { halign: 'left' }, // Alineado a la izquierda para el tipo
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
  
      // Convertir PDF en Blob
      const pdfBlob = doc.output('blob');
      const pdfURL = URL.createObjectURL(pdfBlob);
  
      // Crear una nueva ventana con visor personalizado
      const newWindow = window.open('', '_blank');
      newWindow.document.write(`
        <html>
          <head><title>Reporte de Tipos de Persona</title></head>
          <body style="margin:0;">
            <iframe width="100%" height="100%" src="${pdfURL}" frameborder="0"></iframe>
            <div style="position:fixed;top:10px;right:200px;">
              <button style="background-color: #6c757d; color: white; border: none; padding: 10px 15px; border-radius: 5px; cursor: pointer;" 
                onclick="const a = document.createElement('a'); a.href='${pdfURL}'; a.download='Reporte_de_Tipos_Persona.pdf'; a.click();">
                Descargar PDF
              </button>
            </div>
          </body>
        </html>`);
    };
  
    img.onerror = () => {
      console.warn('No se pudo cargar el logo. El PDF se generará sin el logo.');
    };
  };
  
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      tiposPersona.map((tipo, index) => ({
        '#': index + 1,
        'Tipo de Persona': tipo.Tipo.toUpperCase(),
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Tipos de Persona');
    XLSX.writeFile(workbook, 'Reporte_Tipos_Persona.xlsx');
  };

  const indexOfLastItem = (currentPage + 1) * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredTipos.slice(indexOfFirstItem, indexOfLastItem);

  const pageCount = Math.ceil(filteredTipos.length / itemsPerPage);

  return (
    <CContainer>
     <CRow className="justify-content-between align-items-center mb-4">
  <CCol xs={12} md={8}>
    <h3>Mantenimientos Tipos de Persona</h3>
  </CCol>
  <CCol xs={12} md={4} className="text-end">
    <CButton
      style={{ backgroundColor: '#4B6251', color: 'white', width: 'auto', height: '38px' }}
      onClick={openAddModal}
    >
      <CIcon icon={cilPlus} /> Nuevo
    </CButton>
    {/* Botón para generar el reporte PDF directamente */}
    <CButton
      style={{ backgroundColor: '#6C8E58', color: 'white', width: 'auto', height: '38px' }}
      onClick={exportToPDF} // Llamamos directamente a la función exportToPDF
    >
      <CIcon icon={cilFile} /> Reporte
    </CButton>
  </CCol>
</CRow>


      <CRow className="align-items-center mb-3">
        <CCol md={6}>
          <CInputGroup size="sm">
            <CInputGroupText>
              <CIcon icon={cilSearch} />
            </CInputGroupText>
            <CFormInput
              placeholder="Buscar tipo de persona"
              value={searchTerm}
              onChange={handleSearch}
              style={{ fontSize: '0.9rem' }}
            />
            <CButton
              style={{
                border: '1px solid #ccc',
                backgroundColor: '#F3F4F7',
                color: '#343a40',
                fontSize: '0.9rem'
              }}
              onClick={() => setSearchTerm('')}
            >
              <CIcon icon={cilBrushAlt} /> Limpiar
            </CButton>
          </CInputGroup>
        </CCol>

        <CCol md={6} className="text-end">
          <div className="d-flex align-items-center justify-content-end">
            <span className="me-2">Mostrar&nbsp;</span>
            <CFormSelect
              size="sm"
              style={{ width: '80px' }}
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(0);
              }}
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
            </CFormSelect>
            <span>&nbsp;registros</span>
          </div>
        </CCol>
      </CRow>

      <CTable striped bordered hover>
  <CTableHead>
    <CTableRow>
      <CTableHeaderCell>#</CTableHeaderCell>
      <CTableHeaderCell>TIPO DE PERSONA</CTableHeaderCell>
      <CTableHeaderCell>Acciones</CTableHeaderCell>
    </CTableRow>
  </CTableHead>
  <CTableBody>
    {currentItems.map((tipo, índice) => (
      <CTableRow key={tipo.Cod_tipo_persona}>
        <CTableDataCell>{indexOfFirstItem + índice + 1}</CTableDataCell>
        <CTableDataCell>{tipo.Tipo.toUpperCase()}</CTableDataCell>
        <CTableDataCell>
          {/* Botón de editar con estilo amarillo (advertencia) */}
          <CButton color="warning" size="sm" onClick={() => openEditModal(tipo)}>
            <CIcon icon={cilPen} />
          </CButton>{' '}
          {/* El botón de eliminar solo aparece si el índice es mayor o igual a 4 dentro de la página actual */}
          {indexOfFirstItem + índice >= 4 && (
            <CButton color="danger" size="sm" onClick={() => confirmDelete(tipo.Cod_tipo_persona)}>
              <CIcon icon={cilTrash} />
            </CButton>
          )}
        </CTableDataCell>
      </CTableRow>
    ))}
  </CTableBody>
</CTable>


      <nav className="d-flex justify-content-center align-items-center mt-4">
        <CPagination className="mb-0" style={{ gap: '0.3cm' }}>
          <CButton
            style={{ backgroundColor: 'gray', color: 'white', marginRight: '0.3cm' }}
            disabled={currentPage === 0}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Anterior
          </CButton>
          <CButton
            style={{ backgroundColor: 'gray', color: 'white' }}
            disabled={currentPage === pageCount - 1}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Siguiente
          </CButton>
        </CPagination>
        <span className="mx-2">Página {currentPage + 1} de {pageCount}</span>
      </nav>

      <CModal visible={modalVisible} onClose={() => setModalVisible(false)} backdrop="static">
        <CModalHeader closeButton>
          <CModalTitle>{editar ? 'Editar Tipo de Persona' : 'Agregar Tipo de Persona'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm onSubmit={handleModalSubmit}>
          <CInputGroup className="mb-3">
  <CInputGroupText>Nombre del Tipo</CInputGroupText>
  <CFormInput
    type="text"
    placeholder="Nombre del tipo"
    onPaste={disableCopyPaste}
    onCopy={disableCopyPaste}
    value={estadoActual.Tipo || ''}
    onChange={handleTipoChange}
    required
  />
</CInputGroup>

{/* Mostrar mensaje de error si existe */}
{errorMensaje && (
  <div className="text-danger mt-2">
    {errorMensaje}
  </div>
)}

            <CModalFooter>
              <CButton 
                style={{ backgroundColor: '#6c757d', color: 'white', borderColor: '#6c757d' }} 
                onClick={() => setModalVisible(false)}
              >
                Cancelar
              </CButton>
              <CButton 
                style={{ backgroundColor: '#4B6251', color: 'white', borderColor: '#4B6251' }} 
                type="submit"
              >
                <CIcon icon={cilSave} /> {editar ? 'Guardar' : 'Guardar'}
              </CButton>
            </CModalFooter>
            
          </CForm>
        </CModalBody>
      </CModal>
    </CContainer>
  );
};

export default TipoPersona;
