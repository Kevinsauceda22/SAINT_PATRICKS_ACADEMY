import React, { useEffect, useState } from 'react'; 
import { CIcon } from '@coreui/icons-react';
import { cilSearch, cilPen, cilTrash, cilPlus, cilDescription, cilPrint, cilSave, cilArrowLeft } from '@coreui/icons';
import swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom'
import '@fortawesome/fontawesome-free/css/all.min.css';
import 'react-phone-number-input/style.css';
import PhoneInput from 'react-phone-number-input';
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
import logo from 'src/assets/brand/logo_saint_patrick.png';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const ListaContacto = () => {
  const [contacto, setContacto] = useState([]);
  const [tiposContacto, setTiposContacto] = useState([]); // Estado para almacenar los tipos de contacto
  const [modalVisible, setModalVisible] = useState(false);
  const [contactoToUpdate, setContactoToUpdate] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(5);
  const [nuevoContacto, setNuevoContacto] = useState({ cod_persona: '', cod_tipo_contacto: '', Valor: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [buscadorCodPersona, setBuscadorCodPersona] = useState('');
  const [personasFiltradas, setPersonasFiltradas] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [personas, setPersonas] = useState([]);

  

// Filtrar contactos por cod_persona



  const location = useLocation();
  const navigate = useNavigate();

  // Recupera personaSeleccionada del estado o maneja el caso en que no esté disponible
  const { personaSeleccionada } = location.state || {};

  // Manejo de error si personaSeleccionada no está definida
  if (!personaSeleccionada) {
    console.warn('No se ha proporcionado una persona seleccionada. Redirigiendo...');
    navigate('/'); // O a donde desees redirigir en caso de error
    return null; // No renderizar nada mientras se redirige
  }

  // Filtrar contactos relacionados con la persona seleccionada
  const contactosFiltrados = contacto.filter(
    contacto => contacto.cod_persona === personaSeleccionada.cod_persona
  );

  const volverAListaPersonas = () => {
    navigate('/ListaPersonas');
  };

  useEffect(() => {
    console.log(personaSeleccionada);
  }, [personaSeleccionada]);

{/*******************************************************************************************************************/}
useEffect(() => {
  const cargarPersonas = async () => {
    const respuesta = await fetch('http://localhost:4000/api/estructuraFamiliar/verPersonas');
    const datos = await respuesta.json();
    setPersonas(datos);
  };
  cargarPersonas();
}, []);


const handleBuscarCodPersona = (e) => {
  const filtro = e.target.value.toLowerCase();
  setBuscadorCodPersona(filtro);

  if (filtro.trim() === '') {
    setPersonasFiltradas([]);
    setIsDropdownOpen(false);
    return;
  }

  const filtradas = personas.filter(persona =>
    (persona.fullName && persona.fullName.toLowerCase().includes(filtro)) ||
    (persona.dni_persona && persona.dni_persona.includes(filtro))
  );

  setPersonasFiltradas(filtradas);
  setIsDropdownOpen(filtradas.length > 0);
};

const handleSeleccionarCodPersona = (persona) => {
  const nombreCompleto = `${persona.fullName}`;
  contactoToUpdate
    ? setContactoToUpdate({ ...contactoToUpdate, cod_persona: persona.cod_persona, nombrePersona: nombreCompleto })
    : setNuevoContacto({ ...nuevoContacto, cod_persona: persona.cod_persona, nombrePersona: nombreCompleto });
  setBuscadorCodPersona(nombreCompleto);
  setIsDropdownOpen(false);
};

{/*******************************************************************************************************************/}
  useEffect(() => {
    fetchContactos();
    fetchTiposContacto(); // Llamar a la función para cargar los tipos de contacto al montar el componente
  }, []);

  useEffect(() => {
    if (!modalVisible) { // Cuando el modal se cierra (modalVisible = false)
      const cargarContactosYTipos = async () => {
        await fetchContactos();
        await fetchTiposContacto();
      };
      cargarContactosYTipos();
    }
  }, [modalVisible]); // Se ejecuta cada vez que cambia el estado de modalVisible
  
  const fetchContactos = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/contacto/obtenerContacto');
      if (!response.ok) throw new Error(`Error en la solicitud: ${response.statusText}`);
      const data = await response.json();
      console.log('Datos obtenidos de la API:', data); // Verifica la respuesta de la API
      setContacto(data);
      console.log('Estado de contacto después de setContacto:', data); // Verifica el estado actualizado
    } catch (error) {
      console.error('Error fetching contactos:', error);
    }
  };
  
  const fetchTiposContacto = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/tipoContacto/obtenerTipoContacto');
      if (!response.ok) throw new Error(`Error en la solicitud: ${response.statusText}`);
      const data = await response.json();
      
      // Guardar toda la lista de tipos de contacto
      setTiposContacto(data); // data ya contiene objetos con Cod_tipo_contacto y tipo_contacto
    } catch (error) {
      console.error('Error fetching tipos de contacto:', error);
    }
  };
  

{/*******************************************************FUNCION PARA CREAR Y ACTUALIZAR**************************************************/}
  const handleCreateOrUpdate = async () => {
    if (isSubmitting) return;
  
    const errors = [];
    const contactoActual = contactoToUpdate ? { ...contactoToUpdate } : { ...nuevoContacto };
  
    // Asignar automáticamente el código de la persona seleccionada
    contactoActual.cod_persona = personaSeleccionada?.cod_persona;
  
    // Convertir tipo_contacto a entero
    if (contactoActual.tipo_contacto) {
      contactoActual.tipo_contacto = parseInt(contactoActual.tipo_contacto, 10);
    }
  
    // Validaciones de campos vacíos para creación y edición
    if (!contactoActual.cod_persona) {
      errors.push("No se ha seleccionado ninguna persona. Por favor, seleccione una persona válida.");
    }
  
    if (!contactoActual.Valor || contactoActual.Valor.trim() === '') {
      errors.push("El campo 'Valor' no debe estar vacío.");
    } else if (contactoActual.Valor.length > 100) {
      errors.push("El campo 'Valor' no debe exceder los 100 caracteres.");
    } else {
      const valorRegex = /[aeiouáéíóúü0-9]/i;
      if (!valorRegex.test(contactoActual.Valor)) {
        errors.push("El campo 'Valor' debe contener al menos una vocal o un número.");
      }
    }
  
    // Validación de duplicados mejorada
    const duplicados = contacto.filter(item => {
      if (contactoToUpdate && item.cod_contacto === contactoToUpdate.cod_contacto) {
        return false;
      }
      return item.Valor.toLowerCase() === contactoActual.Valor.toLowerCase();
    });
  
    if (duplicados.length > 0) {
      let mensajeDuplicados = "Se encontraron los siguientes datos duplicados:<br/><br/>";
      const duplicadoValor = duplicados.find(item => item.Valor.toLowerCase() === contactoActual.Valor.toLowerCase());
      if (duplicadoValor) {
        mensajeDuplicados += `El Valor '${duplicadoValor.Valor}' ya existe en otro registro.`;
      }
  
      swal.fire({
        icon: 'warning',
        title: 'Error de duplicado',
        html: mensajeDuplicados
      });
      return;
    }
  
    // Mostrar errores si hay
    if (errors.length > 0) {
      swal.fire({
        icon: 'warning',
        title: 'Errores en el formulario',
        html: errors.join('<br/>')
      });
      return;
    }
  
    // Proceder con la creación o actualización
    setIsSubmitting(true);
    const url = contactoToUpdate
      ? `http://localhost:4000/api/contacto/actualizarContacto/${contactoToUpdate.cod_contacto}`
      : 'http://localhost:4000/api/contacto/crearContacto';
    const method = contactoToUpdate ? 'PUT' : 'POST';
    const body = JSON.stringify(contactoActual);
  
    // Log para verificar los datos que se están enviando
    console.log("Datos enviados:", contactoActual);
  
    try {
      const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body });
      const result = await response.json();
  
      if (response.ok) {
        swal.fire({
          icon: 'success',
          title: contactoToUpdate ? 'Contacto actualizado' : 'Contacto creado',
          text: result.Mensaje || 'Operación realizada con éxito',
        });
  
        if (contactoToUpdate) {
          // Actualiza el registro específico
          setContacto((prevContactos) =>
            prevContactos.map((item) =>
              item.cod_contacto === contactoToUpdate.cod_contacto
                ? { ...item, ...contactoToUpdate } // Actualiza solo este registro
                : item // Los demás registros quedan intactos
            )
          );
        } else {
          // Agregar un nuevo registro si es una creación
          setContacto((prevContactos) => [
            ...prevContactos,
            { cod_contacto: result.cod_contacto, ...nuevoContacto },
          ]);
        }
  
        // Limpia los valores y cierra el modal
        setNuevoContacto({ tipo_contacto: '', Valor: '' }); // `cod_persona` ya no se incluye aquí
        setContactoToUpdate(null);
        setModalVisible(false);
      }
  
    } catch (error) {
      console.error("Error en la solicitud:", error);
      swal.fire({ icon: 'error', title: 'Error', text: 'Error en el servidor.' });
    } finally {
      setIsSubmitting(false);
    }
  };
  
{/*************************************************FUNCION PARA BORRAR****************************************************************/}
  
  
  const handleDeleteContacto = async (cod_contacto, descripcionContacto) => {
    try {
      const confirmResult = await swal.fire({
        title: 'Confirmar Eliminación',
        html: `¿Estás seguro de que deseas eliminar el contacto: <strong>${descripcionContacto || 'Sin descripción'}</strong>?`,
        showCancelButton: true,
        confirmButtonColor: '#FF6B6B',
        cancelButtonColor: '#6C757D',
        confirmButtonText: '<i class="fa fa-trash"></i> Eliminar',
        cancelButtonText: 'Cancelar',
        reverseButtons: true,
        focusCancel: true,
      });
  
      if (!confirmResult.isConfirmed) return;
  
      const response = await fetch(
        `http://localhost:4000/api/contacto/eliminarContacto/${encodeURIComponent(cod_contacto)}`,
        { method: 'DELETE' }
      );
  
      const result = await response.json();
  
      if (response.ok) {
        setContacto((prevContactos) =>
          prevContactos.filter((item) => item.cod_contacto !== cod_contacto)
        );
  
        swal.fire({
          icon: 'success',
          title: 'Contacto eliminado',
          text: result.Mensaje || 'Eliminado correctamente',
        });
      } else {
        throw new Error(result.Mensaje || 'Error al eliminar');
      }
    } catch (error) {
      console.error('Error eliminando el contacto:', error);
      swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'No se pudo eliminar el contacto.',
      });
    }
  };  


   {/***********************************************************FUNCIONES DE BUSQUEDA Y FILTRADO ******************************************/}
   const handleRecordsPerPageChange = (e) => {
    setRecordsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const handleSearch = (e) => setSearchTerm(e.target.value);

  const filteredContacto = contacto.filter((item) =>
    personaSeleccionada && 
    item.cod_persona === personaSeleccionada.cod_persona &&  // Solo muestra los contactos de la persona seleccionada
    (
      (item.Valor || '').toLowerCase().includes(searchTerm.toLowerCase()) || // Filtrado por el valor
      tiposContacto.find(tc => tc.cod_tipo_contacto === item.cod_tipo_contacto)?.tipo_contacto.toLowerCase().includes(searchTerm.toLowerCase()) // Filtrado por el tipo de contacto
    )
  );
  

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredContacto.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.max(1, Math.ceil(filteredContacto.length / recordsPerPage));
  
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  {/**************************************************REPORTERIA DE CONTACTOS PERSONA****************************************************/}


  const ReporteContactoPDF = () => {
    const doc = new jsPDF('p', 'mm', 'letter'); // Formato horizontal
  
    // Verificar si hay datos para exportar
    if (!filteredContacto || filteredContacto.length === 0) {
      alert('No hay datos para exportar.');
      return;
    }
  
    // Cargar logo
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
      doc.text('Reporte de Contactos', pageWidth / 2, 50, { align: 'center' });
  
      doc.setLineWidth(0.5);
      doc.setDrawColor(0, 102, 51);
      doc.line(10, 60, pageWidth - 10, 60);
  
      // Tabla de datos
      const tableRows = filteredContacto.map((contacto, index) => ({
        index: (index + 1).toString(),
        nombre_persona: personaSeleccionada && personaSeleccionada.cod_persona === contacto.cod_persona
          ? `${personaSeleccionada.Nombre.toUpperCase()} ${personaSeleccionada.Segundo_nombre?.toUpperCase() || ''} ${personaSeleccionada.Primer_apellido.toUpperCase()} ${personaSeleccionada.Segundo_apellido?.toUpperCase() || ''}`
          : 'Información no disponible',
        tipo_contacto: tiposContacto.find(tc => tc.cod_tipo_contacto === contacto.cod_tipo_contacto)?.tipo_contacto.toUpperCase() || 'Desconocido',
        valor: contacto.Valor || 'N/D',
      }));
      
      
  
      doc.autoTable({
        startY: 65,
        margin: { left: 10, right: 10 }, // Centrado de la tabla
        columns: [
          { header: '#', dataKey: 'index' },
          { header: 'NOMBRE', dataKey: 'nombre_persona' },
          { header: 'TIPO', dataKey: 'tipo_contacto' },
          { header: 'VALOR', dataKey: 'valor' },
        ],
        body: tableRows,
        headStyles: {
          fillColor: [0, 102, 51],
          textColor: [255, 255, 255],
          fontSize: 10, // Tamaño de la fuente
          halign: 'center',
        },
        styles: {
          fontSize: 9, // Tamaño de la fuente
          cellPadding: 4, // Relleno de las celdas
        },
        columnStyles: {
          index: { cellWidth: 15 },
          codigo_persona: { cellWidth: 45 },
          tipo_contacto: { cellWidth: 40 },
          valor: { cellWidth: 60 },
        },
        alternateRowStyles: {
          fillColor: [240, 248, 255],
        },
  
        didDrawPage: (data) => {
          const pageCount = doc.internal.getNumberOfPages();
          const pageCurrent = doc.internal.getCurrentPageInfo().pageNumber;
  
          // Pie de página
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
  
      // Convertir PDF en Blob
      const pdfBlob = doc.output('blob');
      const pdfURL = URL.createObjectURL(pdfBlob);
  
      // Crear ventana con visor
      const newWindow = window.open('', '_blank');
      newWindow.document.write(`
        <html>
          <head><title>Reporte de Contactos</title></head>
          <body style="margin:0;">
            <iframe width="100%" height="100%" src="${pdfURL}" frameborder="0"></iframe>
            <div style="position:fixed;top:10px;right:20px;">
              <button style="background-color: #6c757d; color: white; border: none; padding: 10px 15px; border-radius: 5px; cursor: pointer;" 
                onclick="const a = document.createElement('a'); a.href='${pdfURL}'; a.download='Reporte_Contactos.pdf'; a.click();">
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
  

  const ReporteContactoExcel = () => {
    if (!filteredContacto || filteredContacto.length === 0) {
      alert('No hay datos para exportar.');
      return;
    }
  
    // Crear los datos de la tabla en formato de objeto
    const tableRows = filteredContacto.map((contacto, index) => ({
      '#': (index + 1).toString(),
      'NOMBRE': personaSeleccionada && personaSeleccionada.cod_persona === contacto.cod_persona
        ? `${personaSeleccionada.Nombre.toUpperCase()} ${personaSeleccionada.Segundo_nombre?.toUpperCase() || ''} ${personaSeleccionada.Primer_apellido.toUpperCase()} ${personaSeleccionada.Segundo_apellido?.toUpperCase() || ''}`
        : 'Información no disponible',
      'TIPO DE CONTACTO': tiposContacto.find(tc => tc.cod_tipo_contacto === contacto.cod_tipo_contacto)?.tipo_contacto.toUpperCase() || 'Desconocido',
      'VALOR': contacto.Valor || 'N/D',
    }));
  
    // Crear un libro de trabajo (workbook)
    const wb = XLSX.utils.book_new();
  
    // Convertir los datos en una hoja de trabajo (worksheet)
    const ws = XLSX.utils.json_to_sheet(tableRows);
  
    // Agregar la hoja de trabajo al libro
    XLSX.utils.book_append_sheet(wb, ws, 'Reporte de Contactos');
  
    // Exportar el archivo Excel
    XLSX.writeFile(wb, 'Reporte_Contactos.xlsx');
  };
  

  return (
    <CContainer>
       <CRow className="align-items-center mb-5">
      {/* Título */}
      <CCol xs="12">
        <h1>Contactos</h1>
        {/* Nombre de la persona seleccionada */}
        {personaSeleccionada ? (
          <div style={{ marginTop: '10px', fontSize: '16px', color: '#555' }}>
            <strong>CONTACTOS DE:</strong> {personaSeleccionada 
              ? `${personaSeleccionada.Nombre.toUpperCase()} ${personaSeleccionada.Segundo_nombre?.toUpperCase() || ''} ${personaSeleccionada.Primer_apellido.toUpperCase()} ${personaSeleccionada.Segundo_apellido?.toUpperCase() || ''}` 
              : 'Información no disponible'}
          </div>
        ) : (
          <div style={{ marginTop: '10px', fontSize: '16px', color: '#555' }}>
            <strong>Persona Seleccionada:</strong> Información no disponible
          </div>
        )}
      </CCol>

      {/* Selector de registros */}
      <CCol xs="12" className="d-flex justify-content-end align-items-center mb-3">
        <span>Mostrar </span>
        <CFormSelect
          value={recordsPerPage}
          onChange={handleRecordsPerPageChange}
          style={{
            maxWidth: '100px',
            display: 'inline-block',
            margin: '0 5px',
            textAlign: 'right',
          }}
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
        </CFormSelect>
        <span> registros</span>
      </CCol>

      {/* Botones */}
      <CCol xs="12" md="12" className="text-end d-flex flex-column flex-md-row justify-content-md-end align-items-md-center gap-2">
        {/* Botón Personas */}
        <CButton
          color="secondary"
          onClick={volverAListaPersonas}
          style={{
            minWidth: '120px', // Asegura un ancho mínimo consistente
          }}
        >
          <CIcon icon={cilArrowLeft} /> Personas
        </CButton>

        {/* Botón Nuevo */}
        <CButton
          style={{
            backgroundColor: '#4B6251', // Color personalizado
            color: 'white',
            minWidth: '120px', // Asegura un ancho consistente
            borderRadius: '5px', // Bordes redondeados para apariencia moderna
          }}
          onClick={() => {
            setModalVisible(true);
            setContactoToUpdate(null);
          }}
        >
          <CIcon icon={cilPlus} /> Nuevo
        </CButton>

        {/* Dropdown Reporte */}
        <CDropdown>
          <CDropdownToggle style={{ backgroundColor: '#6C8E58', color: 'white' }}>
            <CIcon icon={cilDescription} /> Reporte
          </CDropdownToggle>
          <CDropdownMenu>
          <CDropdownItem onClick={ReporteContactoPDF}>
              <i className="fa fa-file-pdf-o" style={{ marginRight: '5px' }}></i> Descargar en PDF
            </CDropdownItem>
            <CDropdownItem onClick={ReporteContactoExcel}>
              <i className="fa fa-file-excel-o" style={{ marginRight: '5px' }}></i> Descargar en Excel
            </CDropdownItem>
          </CDropdownMenu>
        </CDropdown>
      </CCol>
    </CRow>

    {/* Input de búsqueda */}

<CInputGroup className="mb-3" style={{ maxWidth: '400px', marginTop: '-70px' }}>
  <CInputGroupText><CIcon icon={cilSearch} /></CInputGroupText>
  <CFormInput placeholder="Buscar" onChange={handleSearch} value={searchTerm} />
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


    {/* Tabla de datos filtrados */}
    <div className="table-container" style={{ maxHeight: '400px', overflowY: 'scroll', marginBottom: '20px' }}>
      <CTable striped bordered hover>
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell>#</CTableHeaderCell>
            <CTableHeaderCell>Nombre</CTableHeaderCell>
            <CTableHeaderCell>Tipo de Contacto</CTableHeaderCell>
            <CTableHeaderCell>Valor</CTableHeaderCell>
            <CTableHeaderCell>Acciones</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {currentRecords.map((item, index) => (
            <CTableRow key={item.cod_contacto}>
              <CTableDataCell>{index + 1 + indexOfFirstRecord}</CTableDataCell>
              <CTableDataCell>
                {personaSeleccionada
                  ? `${personaSeleccionada.Nombre.toUpperCase()} ${personaSeleccionada.Segundo_nombre.toUpperCase()} ${personaSeleccionada.Primer_apellido.toUpperCase()} ${personaSeleccionada.Segundo_apellido.toUpperCase()}`
                  : 'Información no disponible'}
              </CTableDataCell>
              <CTableDataCell>
                {tiposContacto.find(tc => tc.cod_tipo_contacto === item.cod_tipo_contacto)?.tipo_contacto.toUpperCase() || 'Desconocido'}
              </CTableDataCell>
              <CTableDataCell>{item.Valor.toUpperCase()}</CTableDataCell>
              <CTableDataCell>
                <CButton color="warning" onClick={() => { setContactoToUpdate(item); setModalVisible(true); }}>
                  <CIcon icon={cilPen} />
                </CButton>
                <CButton color="danger" onClick={() => handleDeleteContacto(item.cod_contacto, item.Valor)} className="ms-2">
                  <CIcon icon={cilTrash} />
                </CButton>
              </CTableDataCell>
            </CTableRow>
          ))}
        </CTableBody>
      </CTable>
    </div>

{/***********************************************************PAGINACION*******************************************************************/}
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
          disabled={currentPage === totalPages || filteredContacto.length === 0}
        >
          Siguiente
        </CButton>
        {totalPages > 0 && (
          <span style={{ marginLeft: '10px', color: 'black', fontSize: '16px' }}>
            Página {currentPage} de {totalPages}
          </span>
        )}
      </CPagination>

{/********************************************MODAL PARA CREAR Y ACTUALIZAR*************************************************************/}
<CModal visible={modalVisible} onClose={() => setModalVisible(false)}>
  <CModalHeader>
    <CModalTitle>{contactoToUpdate ? 'Actualizar Contacto' : 'Crear Nuevo Contacto'}</CModalTitle>
  </CModalHeader>
  <CModalBody>
    {/* Mostrar el nombre de la persona seleccionada */}
    <div style={{ marginBottom: '10px', border: '1px solid #dcdcdc', padding: '10px', backgroundColor: '#f9f9f9' }}>
      <strong>PERSONA:</strong> {personaSeleccionada 
        ? `${personaSeleccionada.Nombre.toUpperCase()} ${personaSeleccionada.Segundo_nombre?.toUpperCase() || ''} ${personaSeleccionada.Primer_apellido.toUpperCase()} ${personaSeleccionada.Segundo_apellido?.toUpperCase() || ''}` 
        : 'Información no disponible'}
    </div>

    {/* Selección de Tipo de Contacto */}
    <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #dcdcdc', marginBottom: '10px' }}>
      <div style={{ minWidth: '150px', backgroundColor: '#f0f0f0', padding: '10px', textAlign: 'center', color: '#000', borderRight: '1px solid #dcdcdc' }}>
        Tipo de Contacto
      </div>
      <CFormSelect
        value={contactoToUpdate?.cod_tipo_contacto || nuevoContacto.cod_tipo_contacto}
        onChange={(e) => {
          const value = e.target.value;
          // Encuentra el tipo de contacto basado en el nombre
          const selectedTipo = tiposContacto.find(tipo => tipo.cod_tipo_contacto === value);
          const tipoNombre = selectedTipo ? selectedTipo.tipo_contacto : '';
          
          contactoToUpdate
            ? setContactoToUpdate({ ...contactoToUpdate, cod_tipo_contacto: value, tipo_contacto: tipoNombre })
            : setNuevoContacto({ ...nuevoContacto, cod_tipo_contacto: value, tipo_contacto: tipoNombre });
        }}
        className="border-0"
      >
        <option value="">Seleccione un tipo de contacto</option>
        {tiposContacto.map((tipo) => (
          <option key={tipo.cod_tipo_contacto} value={tipo.cod_tipo_contacto}>
            {tipo.tipo_contacto}
          </option>
        ))}
      </CFormSelect>
    </div>

{/* Campo de Valor */}
<div style={{ display: 'flex', alignItems: 'center', border: '1px solid #dcdcdc', marginBottom: '10px' }}>
  <div style={{ minWidth: '150px', backgroundColor: '#f0f0f0', padding: '10px', textAlign: 'center', color: '#000', borderRight: '1px solid #dcdcdc' }}>
    Valor
  </div>

  {/* Usar react-phone-number-input solo para tipos de teléfono */}
  {Number(nuevoContacto.cod_tipo_contacto) === 1 || Number(nuevoContacto.cod_tipo_contacto) === 2 ? (
    <PhoneInput
      international
      defaultCountry="HN"  // Asegúrate de poner el país adecuado como predeterminado
      value={contactoToUpdate?.Valor ?? nuevoContacto.Valor} // Usar ?? en lugar de ||
      onChange={(value) => {
        if (contactoToUpdate) {
          setContactoToUpdate((prev) => ({ ...prev, Valor: value })); // Usar función actualizadora
        } else {
          setNuevoContacto((prev) => ({ ...prev, Valor: value })); // Usar función actualizadora
        }
      }}
      className="border-0"
    />
  ) : (
    <CFormInput
      placeholder={nuevoContacto.cod_tipo_contacto === 'EMAIL' ? 'EMAIL' : 'Valor'}
      value={contactoToUpdate?.Valor ?? nuevoContacto.Valor} // Usar ?? en lugar de ||
      onChange={(e) => {
        let value = e.target.value.slice(0, 50);
        if (/(\s{2,})/.test(value)) return;

        if (nuevoContacto.cod_tipo_contacto === 'EMAIL' && !/\S+@\S+\.\S+/.test(value)) {
          return;
        }

        if (contactoToUpdate) {
          setContactoToUpdate((prev) => ({ ...prev, Valor: value }));
        } else {
          setNuevoContacto((prev) => ({ ...prev, Valor: value }));
        }
      }}
      className="border-0"
    />
  )}
</div>

  </CModalBody>
  <CModalFooter>
    <CButton color="secondary" onClick={() => setModalVisible(false)}>Cancelar</CButton>
    <CButton
      onClick={handleCreateOrUpdate}
      style={
        contactoToUpdate
          ? { backgroundColor: '#FFD700', color: 'white' } // Color amarillo con letras blancas
          : { backgroundColor: '#4B6251', color: 'white' } // Mantener el estilo actual del botón "Guardar"
      }
    >
      <CIcon icon={contactoToUpdate ? cilPen : cilSave} />
      &nbsp;
      {contactoToUpdate ? 'Actualizar' : 'Guardar'}
    </CButton>
  </CModalFooter>
</CModal>

{/********************************************FIN MODAL PARA CREAR Y ACTUALIZAR*************************************************************/}



    </CContainer>
  );
};

export default ListaContacto;

