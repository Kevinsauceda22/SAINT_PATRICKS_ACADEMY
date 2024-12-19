import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { cilSearch, cilPen, cilTrash, cilPlus, cilSave, cilFile } from '@coreui/icons';
import CIcon from '@coreui/icons-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

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
  CRow,
  CFormSelect,
  CCol,
  CTableDataCell,
  CSpinner,
} from '@coreui/react';
import logo from 'src/assets/brand/logo_saint_patrick.png';
import usePermission from '../../../../context/usePermission';
import AccessDenied from "../AccessDenied/AccessDenied"


const MunicipioMantenimiento = () => {
  const { canSelect, canUpdate, canDelete, canInsert  } = usePermission('Municipios');

  const [municipios, setMunicipios] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredMunicipios, setFilteredMunicipios] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [modalVisible, setModalVisible] = useState(false);
  const [editar, setEditar] = useState(false);
  const [municipioActual, setMunicipioActual] = useState({ 
    codMunicipio: null, 
    nombreMunicipio: '',
    codDepartamento: ''
  });

  const obtenerMunicipios = async () => {
    try {
      const response = await fetch('http://77.5p.68.87i/departamento/municipios');
      const data = await response.json();
      if (response.ok) {
        // Convertir los nombres de los municipios a mayúsculas de manera segura
        const municipiosEnMayusculas = data.map(municipio => ({
          ...municipio, // Mantener los otros atributos
          nombre: municipio.nombre ? municipio.nombre.toUpperCase() : municipio.nombre // Verificar que 'nombre' no sea undefined
        }));
        setMunicipios(municipiosEnMayusculas);
        setFilteredMunicipios(municipiosEnMayusculas);
      } else {
        throw new Error(data.message || 'Error al obtener los municipios');
      }
    } catch (error) {
      setError(error.message);
      Swal.fire('Error', error.message, 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const obtenerDepartamentos = async () => {
    try {
      const response = await fetch('http://77.5p.68.87i/departamento/departamentos');
      const data = await response.json();
      if (response.ok) {
        // Convertir los nombres de los departamentos a mayúsculas de manera segura
        const departamentosEnMayusculas = data.map(departamento => ({
          ...departamento, // Mantener los otros atributos
          nombre: departamento.nombre ? departamento.nombre.toUpperCase() : departamento.nombre // Verificar que 'nombre' no sea undefined
        }));
        setDepartamentos(departamentosEnMayusculas);
      } else {
        throw new Error('Error al obtener los departamentos');
      }
    } catch (error) {
      console.error('Error:', error);
      Swal.fire('Error', 'Error al cargar los departamentos', 'error');
    }
  };  


const [errorMensaje, setErrorMensaje] = useState(''); // Estado para el mensaje de error

const crearMunicipio = async () => {
  const { nombreMunicipio, codDepartamento } = municipioActual;

  // Validar si todos los campos están completos
  if (!nombreMunicipio || !codDepartamento) {
    setErrorMensaje('Todos los campos son requeridos');
    return;
  }

  // Validar si el municipio ya existe
  const municipioExistente = municipios.some(municipio => municipio.nombre_municipio.toLowerCase() === nombreMunicipio.toLowerCase());

  if (municipioExistente) {
    setErrorMensaje('Ya existe un municipio con ese nombre');
    return; // Evita continuar con la creación si el municipio ya existe
  } else {
    setErrorMensaje(''); // Limpiar el mensaje de error si el municipio no existe
  }

  // Realizar la creación del municipio
  try {
    const response = await fetch('http://77.5p.68.87i/departamento/municipios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre_municipio: nombreMunicipio, cod_departamento: codDepartamento }),
    });

    if (response.ok) {
      Swal.fire('Éxito', 'Municipio creado exitosamente', 'success');
      obtenerMunicipios(); // Actualizar la lista de municipios
    } else {
      const result = await response.json();
      throw new Error(result.message || 'Error al crear el municipio');
    }
  } catch (error) {
    Swal.fire('Error', error.message, 'error');
  } finally {
    setModalVisible(false);
    setErrorMensaje(''); // Limpiar mensaje de error
  }
};

// Bloquear copiar y pegar en campos
const disableCopyPaste = (e) => {
  e.preventDefault();
  setErrorMensaje('Copiar y pegar no está permitido.');
  setTimeout(() => setErrorMensaje(''), 5000); // Eliminar mensaje después de 5 segundos
};

const tieneLetrasRepetidas = (texto) => /([a-zA-Z])\1\1/.test(texto);

// Verificar si contiene caracteres válidos
const permitirCaracteresValidos = (texto) => /^[a-zA-Z0-9\s]*$/.test(texto);
// Verificar si contiene números
const contieneNumeros = (texto) => /\d/.test(texto);

const tieneEspaciosConsecutivos = (texto) => {
  const regex = /\s{3,}/; // Busca más de dos espacios consecutivos
  return regex.test(texto);
};
 
// Manejo de cambio en los campos de entrada
const handleInputChange = (e) => {
  const { name, value } = e.target;
  const upperCaseValue = value.toUpperCase(); // Convertir a mayúsculas

  setErrorMensaje(''); // Limpiar el mensaje de error al cambiar el texto

  // Validación para el campo 'nombreMunicipio'
  if (name === 'nombreMunicipio') {
    if (!upperCaseValue.trim()) {
      setMunicipioActual((prev) => ({ ...prev, [name]: upperCaseValue }));
      return;
    }

    // Validaciones de formato
    if (tieneLetrasRepetidas(upperCaseValue.replace(/\s/g, ''))) {
      setErrorMensaje('No se permiten más de 2 letras consecutivas iguales');
      setTimeout(() => setErrorMensaje(''), 5000);
      return;
    }

    if (!permitirCaracteresValidos(upperCaseValue)) {
      setErrorMensaje('No se permiten caracteres especiales');
      setTimeout(() => setErrorMensaje(''), 5000);
      return;
    }
   // Validación para asegurar que no haya más de dos espacios consecutivos
   
    if (contieneNumeros(upperCaseValue)) {
      setErrorMensaje('No se permiten números.');
      setTimeout(() => setErrorMensaje(''), 5000);
      return;
    }
    if (tieneEspaciosConsecutivos(upperCaseValue)) {
      setErrorMensaje('No se permiten más de 2 espacios consecutivos');
      setTimeout(() => setErrorMensaje(''), 5000); // Borra el mensaje después de 5 segundos
      return; // No actualiza el estado si hay más de dos espacios consecutivos
    }
  }

  // Actualizar el estado con el valor del campo
  setMunicipioActual((prev) => ({ ...prev, [name]: upperCaseValue }));
};
  
  const actualizarMunicipio = async () => {
    const { codMunicipio, nombreMunicipio, codDepartamento } = municipioActual;
    if (!nombreMunicipio || !codDepartamento) {
      Swal.fire('Error', 'Todos los campos son requeridos', 'error');
      return;
    }

    try {
      const response = await fetch(`http://77.5p.68.87i/departamento/municipios/${codMunicipio}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          nombre_municipio: nombreMunicipio,
          cod_departamento: codDepartamento 
        }),
      });

      if (response.ok) {
        Swal.fire('Éxito', 'Municipio actualizado exitosamente', 'success');
        obtenerMunicipios();
      } else {
        const result = await response.json();
        throw new Error(result.message || 'Error al actualizar el municipio');
      }
    } catch (error) {
      Swal.fire('Error', error.message, 'error');
    } finally {
      setModalVisible(false);
    }
  };

  const eliminarMunicipio = async (codMunicipio) => {
    try {
      const response = await fetch(`http://77.5p.68.87i/departamento/municipios/${codMunicipio}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        Swal.fire('Éxito', 'Municipio eliminado correctamente', 'success');
        obtenerMunicipios();
      } else {
        throw new Error('Error al eliminar el municipio');
      }
    } catch (error) {
      Swal.fire('Error', error.message, 'error');
    }
  };

  const confirmDelete = (codMunicipio) => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'No podrás revertir esta acción',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        eliminarMunicipio(codMunicipio);
      }
    });
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    const filtered = municipios.filter((municipio) =>
      municipio.nombre_municipio.toLowerCase().includes(value) ||
      municipio.nombre_departamento.toLowerCase().includes(value)
    );
    setFilteredMunicipios(filtered);
    setCurrentPage(0);
  };

  const handleAddModal = () => {
    setMunicipioActual({ codMunicipio: null, nombreMunicipio: '', codDepartamento: '' });
    setEditar(false);
    setModalVisible(true);
  };

  const handleEditModal = (municipio) => {
    setMunicipioActual({
      codMunicipio: municipio.cod_municipio,
      nombreMunicipio: municipio.nombre_municipio,
      codDepartamento: municipio.cod_departamento,
    });
    setEditar(true);
    setModalVisible(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editar) {
      actualizarMunicipio();
    } else {
      crearMunicipio();
    }
  };
  const generatePDFMunicipios = () => {
    const doc = new jsPDF({
      orientation: 'landscape',
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
      doc.text('Reporte de Municipios', pageWidth / 2, 50, { align: 'center' });
  
      // Línea divisoria
      doc.setLineWidth(0.5);
      doc.setDrawColor(0, 102, 51); // Verde
      doc.line(10, 55, pageWidth - 10, 55);
  
      // Subtítulo
      doc.setFontSize(12);
      doc.setTextColor(0);
      doc.text('Listado de Municipios', pageWidth / 2, 65, { align: 'center' });
  
      // Filtrado de municipios por el departamento, si se busca por uno
      let filteredMunicipios = municipios;
      if (searchTerm && searchTerm.trim() !== '') {
        filteredMunicipios = municipios.filter(municipio =>
          municipio.nombre_departamento.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
  
      // Tabla de datos
      const tableColumn = [
        '#',
        'Municipio',
        'Departamento',
      ];
      const tableRows = filteredMunicipios.map((municipio, index) => [
        { content: (index + 1).toString(), styles: { halign: 'center' } }, // Centrado
        { content: municipio.nombre_municipio.toUpperCase(), styles: { halign: 'left' } }, // Centrado
        { content: municipio.nombre_departamento.toUpperCase(), styles: { halign: 'center' } }, // Centrado
      ]);
  
      doc.autoTable({
        startY: 75,
        head: [tableColumn],
        body: tableRows,
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
          0: { halign: 'center' }, // Municipio centrado
          1: { halign: 'center' }, // Departamento centrado
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
          <head><title>Reporte de Municipios</title></head>
          <body style="margin:0;">
            <iframe width="100%" height="100%" src="${pdfURL}" frameborder="0"></iframe>
            <div style="position:fixed;top:10px;right:200px;">
              <button style="background-color: #6c757d; color: white; border: none; padding: 10px 15px; border-radius: 5px; cursor: pointer;" 
                onclick="const a = document.createElement('a'); a.href='${pdfURL}'; a.download='Reporte_de_Municipios.pdf'; a.click();">
                Descargar PDF
              </button>
            </div>
          </body>
        </html>`);
    };
  
    img.onerror = () => {
      swal.fire('Error', 'No se pudo cargar el logo.', 'error');
    };
  };
  
  
  useEffect(() => {
    obtenerMunicipios();
    obtenerDepartamentos();
  }, []);

  const indexOfLastItem = (currentPage + 1) * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredMunicipios.slice(indexOfFirstItem, indexOfLastItem);
  
  if (loading) {
    return (
      <CContainer>
        <CRow className="justify-content-center">
          <CCol xs={12} md={6}>
            <CSpinner color="primary" />
            <p>Cargando municipios...</p>
          </CCol>
        </CRow>
      </CContainer>
    );
  }

  if (error) {
    return (
      <CContainer>
        <CRow className="justify-content-center">
          <CCol xs={12} md={6}>
            <p>Error: {error}</p>
          </CCol>
        </CRow>
      </CContainer>
    );
  }

  const pageCount = Math.ceil(filteredMunicipios.length / itemsPerPage);


      // Verificar permisos
 if (!canSelect) {
  return <AccessDenied />;
}
  return (
    <CContainer>
      <CRow className="justify-content-between align-items-center mb-3 sticky-header">
        <CCol xs={12} md={8}>
          <h3>Mantenimiento de Municipios</h3>
        </CCol>

        <CCol xs="4" md="3" className="text-end">
          {canInsert &&(
          <CButton color="dark" onClick={handleAddModal} className="me-2" style={{ backgroundColor: '#4B6251', borderColor: '#0F463A' }}>
          <CIcon icon={cilPlus} /> Nuevo
          </CButton>
          )}
          <CButton color="primary" onClick={generatePDFMunicipios} style={{ backgroundColor: '#6C8E58', borderColor: '#617341' }}>
            <CIcon icon={cilFile} /> Generar Reporte
          </CButton>
        </CCol>
      </CRow>

      <CRow className="align-items-center my-3 sticky-header">
        <CCol md={5}>
          <CInputGroup size="sm">
            <CInputGroupText>
              <CIcon icon={cilSearch} />
            </CInputGroupText>
            <CFormInput placeholder="Buscar municipio" value={searchTerm} onChange={handleSearch} />
          </CInputGroup>
        </CCol>
        <CCol xs="12" md="7" className="text-md-end mt-2 mt-md-0">
          <CInputGroup style={{ width: 'auto', display: 'inline-block' }}>
            <div className="d-inline-flex align-items-center">
              <span>Mostrar&nbsp;</span>
              <CFormSelect
                style={{ width: '80px', display: 'inline-block', textAlign: 'center' }}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(0);
                }}
                value={itemsPerPage}
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

      <div className="table-container">
        <CTable striped bordered hover>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell>#</CTableHeaderCell>
              <CTableHeaderCell>Nombre del Municipio</CTableHeaderCell>
              <CTableHeaderCell>Departamento</CTableHeaderCell>
              <CTableHeaderCell className="text-end">Acciones</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {currentItems.map((municipio, index) => (
              <CTableRow key={municipio.cod_municipio}>
                <CTableDataCell>{index + 1 + currentPage * itemsPerPage}</CTableDataCell>
                <CTableDataCell>{municipio.nombre_municipio.toUpperCase()}</CTableDataCell>
                <CTableDataCell>{municipio.nombre_departamento.toUpperCase()}</CTableDataCell>
                <CTableDataCell className="text-end">

                  {canUpdate && (
                  <CButton
                    color="warning"
                    size="sm"
                    style={{ opacity: 0.8 }}
                    onClick={() => handleEditModal(municipio)}
                  >
                    <CIcon icon={cilPen} />
                  </CButton>)}{' '}

                  {canDelete && (
                  <CButton
                    color="danger"
                    size="sm"
                    style={{ opacity: 0.8 }}
                    onClick={() => confirmDelete(municipio.cod_municipio)}
                  >
                    <CIcon icon={cilTrash} />
                  </CButton>
                  )}
                </CTableDataCell>
              </CTableRow>
            ))}
          </CTableBody>
        </CTable>
      </div>

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
          <CModalTitle>{editar ? 'Editar Municipio' : 'Agregar Municipio'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm onSubmit={handleSubmit}>
          <CInputGroup className="mb-3">
          <CInputGroup>
  <CInputGroupText>Nombre del Municipio</CInputGroupText>
  <CFormInput
    type="text"
    name="nombreMunicipio"
    onPaste={disableCopyPaste}  // Detecta el evento de pegar
    onCopy={disableCopyPaste}   // Detecta el evento de copiar
    placeholder="Nombre del municipio"
    value={municipioActual.nombreMunicipio || ''} 
    onChange={handleInputChange}
    required
    style={{ width: '50%', padding: '8px' }}  // Añadido estilo de ancho completo y relleno
  />

  {/* Mostrar el mensaje de error debajo del input si existe */}
  {errorMensaje && (
    <div style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>
      {errorMensaje}
    </div>
  )}
</CInputGroup>

</CInputGroup>

            <CInputGroup className="mb-3">
  <CInputGroupText>Departamento</CInputGroupText>
  <CFormSelect
    name="codDepartamento"
    value={municipioActual.codDepartamento}
    onChange={handleInputChange}
    required
  >
    <option value="">Seleccione un departamento</option>
    {departamentos
      // Filtrar departamentos únicos por cod_departamento
      .filter((departamento, index, self) => 
        index === self.findIndex((d) => d.cod_departamento === departamento.cod_departamento)
      )
      // Ordenar alfabéticamente
      .sort((a, b) => a.nombre_departamento.localeCompare(b.nombre_departamento))
      .map((departamento) => (
        <option 
          key={`select-dept-${departamento.cod_departamento}-${departamento.nombre_departamento}`} 
          value={departamento.cod_departamento}
        >
          {departamento.nombre_departamento.toUpperCase()}
        </option>
      ))}
  </CFormSelect>
</CInputGroup>
            <CModalFooter>
              <CButton color="secondary" onClick={() => setModalVisible(false)}>
                Cancelar
              </CButton>
              <CButton style={{ backgroundColor: '#617341', color: 'white' }} type="submit">
                <CIcon icon={cilSave} /> {editar ? 'Guardar' : 'Guardar'}
              </CButton>
            </CModalFooter>
          </CForm>
        </CModalBody>
      </CModal>

      <style jsx>{`
        .table-container {
          max-height: 400px;
          overflow-y: ${filteredMunicipios.length >= 5 ? 'auto' : 'hidden'};
          overflow-x: hidden;
        }
      `}</style>
    </CContainer>
  );
};

export default MunicipioMantenimiento;
