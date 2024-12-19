import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { cilSearch, cilPen, cilTrash, cilPlus, cilSave, cilFile  } from '@coreui/icons';
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
  
  CFormSelect ,
  CCol,
  CTableDataCell,
  CSpinner,
} from '@coreui/react';
import logo from 'src/assets/brand/logo_saint_patrick.png';
import usePermission from '../../../../context/usePermission';
import AccessDenied from "../AccessDenied/AccessDenied"

const DepartamentoMantenimiento = () => {
  const { canSelect, canUpdate, canDelete, canInsert  } = usePermission('departamento');

  const [departamentos, setDepartamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredDepartamentos, setFilteredDepartamentos] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [modalVisible, setModalVisible] = useState(false);
  const [editar, setEditar] = useState(false);
  const [departamentoActual, setDepartamentoActual] = useState({ codDepartamento: null, nombreDepartamento: '' });
  
  const obtenerDepartamentos = async () => {
    try {
      const response = await fetch('http://74.50.68.87epartamento/departamentos');
      const data = await response.json();
      if (response.ok) {
        // Convertir todos los nombres de los departamentos a mayúsculas
        const departamentosConMayusculas = data.map(departamento => ({
          ...departamento,
          nombre_departamento: departamento.nombre_departamento.toUpperCase(),
        }));
  
        // Filtrar departamentos únicos basados en cod_departamento
        const departamentosUnicos = departamentosConMayusculas.reduce((acc, current) => {
          const x = acc.find(item => item.cod_departamento === current.cod_departamento);
          if (!x) {
            return acc.concat([current]);
          } else {
            return acc;
          }
        }, []);
  
        // No ordenar los departamentos, mantener el orden de creación
        setDepartamentos(departamentosUnicos);
        setFilteredDepartamentos(departamentosUnicos);
      } else {
        throw new Error(data.message || 'Error al obtener los departamentos');
      }
    } catch (error) {
      setError(error.message);
      Swal.fire('Error', error.message, 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const limpiarErrores = () => {
    setErrorMensaje('');  // Limpia el estado del mensaje de error en el UI
  };

  const crearDepartamento = async () => {
    limpiarErrores();
    const { nombreDepartamento } = departamentoActual;
  
 
    // Validar si el departamento ya existe en la tabla
    const departamentoExistente = departamentos.find(departamento => departamento.nombre_departamento.toLowerCase() === nombreDepartamento.toLowerCase());

    if (departamentoExistente) {
      // Si el departamento ya existe, muestra el error y detiene la ejecución
      setErrorMensaje('Ya existe un Departamento con ese nombre.');
      setTimeout(() => setErrorMensaje(''), 5000); // Eliminar mensaje después de 5 segundos
      return nombreDepartamento.slice(0, nombreDepartamento.length - 1); // Elimina el último carácter inválido
    } else {
      // Si no existe un departamento con el mismo nombre, resetea cualquier mensaje de error
      setErrorMensaje('');
    }
  
    // Aquí iría el código para crear el departamento si pasa las validaciones
    try {
      // Simulación de llamada a la API o proceso de creación
      Swal.fire('Éxito', 'Departamento creado exitosamente', 'success');
    } catch (error) {
      Swal.fire('Error', 'Ocurrió un problema al crear el departamento', 'error');
    }
  
    try {
      const response = await fetch('http://74.50.68.87epartamento/departamentos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre_departamento: nombreDepartamento }),
      });
  
      if (response.ok) {
        Swal.fire('Éxito', 'Departamento creado exitosamente', 'success');
        obtenerDepartamentos();
      } else {
        const result = await response.json();
        throw new Error(result.message || 'Error al crear el departamento');
      }
    } catch (error) {
      Swal.fire('Error', error.message, 'error');
    } finally {
      setModalVisible(false);
    }
  
  };
 
  
  const actualizarDepartamento = async () => {
    limpiarErrores();
    const { codDepartamento, nombreDepartamento } = departamentoActual;
    if (!nombreDepartamento) {
      Swal.fire('Error', 'El nombre del departamento es requerido', 'error');
      return;
    }

    try {
      const response = await fetch(`http://74.50.68.87epartamento/departamentos/${codDepartamento}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre_departamento: nombreDepartamento }),
      });

      if (response.ok) {
        Swal.fire('Éxito', 'Departamento actualizado exitosamente', 'success');
        obtenerDepartamentos();
      } else {
        const result = await response.json();
        throw new Error(result.message || 'Error al actualizar el departamento');
      }
    } catch (error) {
      Swal.fire('Error', error.message, 'error');
    } finally {
      setModalVisible(false);
    }
  };

  const eliminarDepartamento = async (codDepartamento) => {
    try {
      const response = await fetch(`http://74.50.68.87epartamento/departamentos/${codDepartamento}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        Swal.fire('Éxito', 'Departamento eliminado correctamente', 'success');
        obtenerDepartamentos();
      } else {
        throw new Error('Error al eliminar el departamento');
      }
    } catch (error) {
      Swal.fire('Error', error.message, 'error');
    }
  };

  const confirmDelete = (codDepartamento) => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'No podrás revertir esta acción',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        eliminarDepartamento(codDepartamento);
      }
    });
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    const filtered = departamentos.filter((departamento) =>
      departamento.nombre_departamento.toLowerCase().includes(value)
    );
    setFilteredDepartamentos(filtered);
    setCurrentPage(0);
  };

  const handleAddModal = () => {
    setDepartamentoActual({ codDepartamento: null, nombreDepartamento: '' });
    setEditar(false);
    setModalVisible(true);
  };

  const handleEditModal = (departamento) => {
    setDepartamentoActual({
      codDepartamento: departamento.cod_departamento,
      nombreDepartamento: departamento.nombre_departamento,
    });
    setEditar(true);
    setModalVisible(true);
  };
// Bloquear copiar y pegar en campos
const disableCopyPaste = (e) => {
  e.preventDefault();

  setErrorMensaje('Copiar y pegar no está permitido.');
  setTimeout(() => setErrorMensaje(''), 5000); // Eliminar mensaje después de 5 segundos
};
  const [errorMensaje, setErrorMensaje] = useState(''); // Estado para el mensaje de error

  // Función para verificar letras consecutivas repetidas
  const tieneLetrasRepetidas = (texto) => {
    const regex = /(.)\1\1/;
    return regex.test(texto); // Verifica letras consecutivas repetidas
  };
  
  const permitirCaracteresValidos = (texto) => {
    const regex = /^[a-zA-Z0-9\s]*$/; // Permite letras, números y espacios
    return regex.test(texto); // Solo permite caracteres válidos
  };
  
    const tieneEspaciosConsecutivos = (texto) => {
    const regex = /\s{3,}/; // Busca más de dos espacios consecutivos
    return regex.test(texto);
  };
   
  
  const contieneNumeros = (texto) => {
    const regex = /\d/; // Busca cualquier número
    return regex.test(texto); // Devuelve true si contiene números
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const upperCaseValue = value.toUpperCase(); // Convierte el texto a mayúsculas
  
    // Limpiar el mensaje de error cada vez que el valor cambia
    setErrorMensaje('');
  
    // Si el campo está vacío, no se deben aplicar validaciones
    if (upperCaseValue.trim() === '') {
      // Si el campo está vacío, solo actualizamos el valor sin hacer ninguna validación
      setDepartamentoActual((prev) => ({ ...prev, [name]: upperCaseValue }));
      return;
    }
      // Verifica si hay más de dos espacios consecutivos
  if (tieneEspaciosConsecutivos(upperCaseValue)) {
    setErrorMensaje('No se permiten más de 2 espacios consecutivos');
    setTimeout(() => setErrorMensaje(''), 5000); // Borra el mensaje después de 5 segundos
    return; // No actualiza el estado si hay más de dos espacios consecutivos
  }
    // Verifica si el texto contiene tres letras consecutivas iguales
    if (tieneLetrasRepetidas(upperCaseValue)) {
      setErrorMensaje('No se permiten mas de 2 letras consecutivas iguales');
      setTimeout(() => setErrorMensaje(''), 5000);
      return; // No actualiza el estado si hay letras repetidas
    }
  
  
    if (!permitirCaracteresValidos(upperCaseValue)) {
      setErrorMensaje('No se permiten caracteres especiales');
      setTimeout(() => setErrorMensaje(''), 5000); // Después de 5 segundos, se borra el mensaje
      return; // Detiene la ejecución si hay caracteres no permitidos
    }
    
    // Verifica si el texto contiene números
    if (contieneNumeros(upperCaseValue)) {
      setErrorMensaje('No se permiten números.');
      setTimeout(() => setErrorMensaje(''), 5000);
      return; // No actualiza el estado si hay números
    }
    
   
    // Si no hay errores, limpia el mensaje de error y actualiza el estado
    setDepartamentoActual((prev) => ({ ...prev, [name]: upperCaseValue }));
  };

 

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editar) {
      actualizarDepartamento();
    } else {
      crearDepartamento();
    }
  };
  

// Función para generar el reporte de departamentos
const generatePDFDepartments = () => {
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
    doc.text('Reporte de Departamentos', pageWidth / 2, 50, { align: 'center' });

    // Línea divisoria
    doc.setLineWidth(0.5);
    doc.setDrawColor(0, 102, 51); // Verde
    doc.line(10, 55, pageWidth - 10, 55);

    // Subtítulo
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text('Listado de Departamentos', pageWidth / 2, 65, { align: 'center' });

    // Tabla de datos
    const tableColumn = [
      '#',
      'Departamento',
     
    ];
    const tableRows = departamentos.map((departamento, index) => [
      { content: (index + 1).toString(), styles: { halign: 'center' } }, // Centrado
      { content: (departamento.nombre_departamento || 'Sin nombre').toUpperCase(), styles: { halign: 'left' } }, // Centrado
      
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
        1: { halign: 'center' }, // Nombre de departamento centrado
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
        <head><title>Reporte de Departamentos</title></head>
        <body style="margin:0;">
          <iframe width="100%" height="100%" src="${pdfURL}" frameborder="0"></iframe>
          <div style="position:fixed;top:10px;right:200px;">
            <button style="background-color: #6c757d; color: white; border: none; padding: 10px 15px; border-radius: 5px; cursor: pointer;" 
              onclick="const a = document.createElement('a'); a.href='${pdfURL}'; a.download='Reporte_de_Departamentos.pdf'; a.click();">
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
    obtenerDepartamentos();
  }, []);

  const indexOfLastItem = (currentPage + 1) * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredDepartamentos.slice(indexOfFirstItem, indexOfLastItem);
  if (loading) {
    return (
      <CContainer>
        <CRow className="justify-content-center">
          <CCol xs={12} md={6}>
            <CSpinner color="primary" />
            <p>Cargando departamentos...</p>
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

  const pageCount = Math.ceil(filteredDepartamentos.length / itemsPerPage);


    // Verificar permisos
 if (!canSelect) {
  return <AccessDenied />;
}

  return (
    <CContainer>
      <CRow className="justify-content-between align-items-center mb-3 sticky-header">
        <CCol xs={12} md={8}>
          <h3>Mantenimiento de Departamentos</h3>
        </CCol>
        <CCol xs="4" md="3" className="text-end">
          {canInsert && ( 
          <CButton color="dark" onClick={handleAddModal} className="me-2" style={{ backgroundColor: '#4B6251', borderColor: '#0F463A' }}>
            <CIcon icon={cilPlus} /> Nuevo
          </CButton>
          )}
          <CButton color="primary" onClick={generatePDFDepartments} style={{ backgroundColor: '#6C8E58', borderColor: '#617341' }}>
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
            <CFormInput placeholder="Buscar departamento" value={searchTerm} onChange={handleSearch} />
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
      <CTableHeaderCell>Nombre del Departamento</CTableHeaderCell>
      <CTableHeaderCell className="text-end">Acciones</CTableHeaderCell>
    </CTableRow>
  </CTableHead>
  <CTableBody>
    {currentItems.map((departamento, index) => (
      <CTableRow key={departamento.cod_departamento}>
        <CTableDataCell>{index + 1 + currentPage * itemsPerPage}</CTableDataCell>
        <CTableDataCell>{departamento.nombre_departamento.toUpperCase()}</CTableDataCell>
        <CTableDataCell className="text-end">
          
          {canUpdate && (
            <CButton
              color="warning"
              size="sm"
              style={{ opacity: 0.8 }}
              onClick={() => handleEditModal(departamento)}
            >
              <CIcon icon={cilPen} />
            </CButton>
          )}{' '}

          {/* Solo mostrar el botón de eliminar si el índice es 18 o mayor */}
          {canDelete && index + 1 + currentPage * itemsPerPage >= 19 && (
            <CButton
              color="danger"
              size="sm"
              style={{ opacity: 0.8 }}
              onClick={() => confirmDelete(departamento.cod_departamento)}
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
          <CModalTitle>{editar ? 'Editar Departamento' : 'Agregar Departamento'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
        <CForm onSubmit={handleSubmit}>
  <CInputGroup className="mb-3">
    <CInputGroupText>Nombre del Departamento</CInputGroupText>
    <CFormInput
      type="text"
      name="nombreDepartamento"
      onPaste={disableCopyPaste}
      onCopy={disableCopyPaste}
      placeholder="Nombre del departamento"
      value={departamentoActual.nombreDepartamento}
      onChange={handleInputChange}
      required
    />
  </CInputGroup>

  {/* Mostrar el mensaje de error debajo del input si existe */}
  {errorMensaje && (
    <div 
      style={{
        color: 'red',
        fontSize: '14px',
        marginTop: '8px',  // Aumenté el margen para asegurar que esté debajo del input
        marginLeft: '5px', // Alinea el mensaje con el texto de entrada
        display: 'block', // Asegura que ocupe toda la línea debajo del input
      }}
    >
      {errorMensaje}
    </div>
  )}

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
          overflow-y: ${filteredDepartamentos.length >= 5 ? 'auto' : 'hidden'};
          overflow-x: hidden;
        }
      `}</style>
    </CContainer>
  );
};

export default DepartamentoMantenimiento;
