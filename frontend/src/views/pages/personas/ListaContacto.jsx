import React, { useEffect, useState } from 'react'; 
import { CIcon } from '@coreui/icons-react';
import { cilSearch, cilPen, cilTrash, cilPlus, cilBrushAlt , cilXCircle, cilCheckCircle, cilUser,  cilSave, cilArrowLeft } from '@coreui/icons';
import swal from 'sweetalert2';
import axios from 'axios'; 
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom'
import '@fortawesome/fontawesome-free/css/all.min.css';
import ExcelJS from 'exceljs';
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { getCountryCallingCode, isValidNumber } from "libphonenumber-js";
import {
  CButton,
  CContainer,
  CInputGroup,
  CInputGroupText,
  CFormInput,
  CFormCheck,
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
  const [personas, setPersonas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessages, setErrorMessages] = useState({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);


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

  const abrirFichaPadre = (persona) => {
    if (!persona || Object.keys(persona).length === 0) {
      console.error('Error: No hay persona seleccionada.');
      return;
    }
  
    console.log('Persona seleccionada para ficha de estudiante:', persona); // Verificación correcta
    navigate('/ListaFichaPadre', { state: { personaSeleccionada: persona } });
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


{/********************************************************************************************************************************************/}

{/*******************************************************************************************************************/}
  useEffect(() => {
    fetchContactos();
    fetchTiposContacto(); // Llamar a la función para cargar los tipos de contacto al montar el componente
  }, []);

  {/*********************************************************************************************************************************************/}

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
      const response = await fetch('http://localhost:4000/api/contacto/verTodosContactos');
      if (!response.ok) throw new Error(`Error en la solicitud: ${response.statusText}`);
      const data = await response.json();
      console.log('Datos obtenidos de la API:', data); // Verifica la respuesta de la API
      setContacto(data);
      console.log('Estado de contacto después de setContacto:', data); // Verifica el estado actualizado
    } catch (error) {
      console.error('Error fetching contactos:', error);
    }
  };


  {/********************************************************************************************************************************************/}
  const fetchTiposContacto = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/tipoContacto/verTodoTipoContacto');
      if (!response.ok) throw new Error(`Error en la solicitud: ${response.statusText}`);
      const data = await response.json();
      
      // Guardar toda la lista de tipos de contacto
      setTiposContacto(data); // data ya contiene objetos con Cod_tipo_contacto y tipo_contacto
    } catch (error) {
      console.error('Error fetching tipos de contacto:', error);
    }
  };

{/*********************************************************************************************************************************************/}
  
const handleCloseModal = (closeFunction, resetFields, initialValues, currentValues) => {
  const cambiosSinGuardar = JSON.stringify(initialValues) !== JSON.stringify(currentValues);

  console.log("¿Hay cambios sin guardar?", cambiosSinGuardar);

  if (cambiosSinGuardar) {
    swal.fire({
      title: "¿Estás seguro?",
      text: "Si cierras este formulario, perderás todos los datos ingresados.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, cerrar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        resetFields(); // Limpia los campos antes de cerrar
        closeFunction(false); // Cierra el modal
      }
    });
  } else {
    resetFields();
    closeFunction(false);
  }
};



{/****************************************************************************************************************************************/}

const resetNuevoContacto = () => {
  setNuevoContacto({
    cod_contacto: null, // Si es un nuevo contacto, el código aún no existe
    cod_persona: null,
    cod_tipo_contacto: '',
    Valor: '',
    principal: false, // Como en la API es un número (0 o 1), aquí se maneja con booleano
    estado: 1, // Por defecto activo
  });
};

const resetContactoToUpdate = () => {
  setContactoToUpdate({
    cod_contacto: null, // Se limpiará para evitar conflictos en edición
    cod_persona: null,
    cod_tipo_contacto: '',
    Valor: '',
    principal: false, // Convertir 0 en false y 1 en true
    estado: 1, // Por defecto activo
  });
};


{/*******************************************************FUNCION PARA CREAR Y ACTUALIZAR**************************************************/}
  const handleCreateOrUpdate = async () => {
    if (isSubmitting) return;
  
    const errors = [];
    
    if (errorMessages.email) {
      errors.push("Corrige los errores antes de guardar.");
    }
    
    // 🔥 Evaluar correctamente si estamos en modo edición
    const contactoActual = contactoToUpdate ?? nuevoContacto;
    
    if (!contactoActual.Valor || (contactoActual.cod_tipo_contacto === "EMAIL" && !contactoActual.Valor.includes("@"))) {
      errors.push("El correo debe contener '@' y un dominio válido.");
    }
    
    if (contactoActual.cod_tipo_contacto === "EMAIL") {
      const dominiosPermitidos = ["gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "icloud.com", "protonmail.com"];
      const [, domain] = contactoActual.Valor.split("@") ?? [];
    
      if (!dominiosPermitidos.includes(domain)) {
        errors.push(`Dominio no permitido. Usa: ${dominiosPermitidos.join(", ")}`);
      }
    }
    
    // **Si hay errores, mostrar Swal.fire() con los mensajes acumulados**
    if (errors.length > 0) {
      swal.fire({
        icon: "warning",
        title: "Errores en el formulario",
        html: errors.join("<br/>"),
      });
      return;
    }
    
  
    // 🔹 Si todo es válido, proceder con la creación o actualización
    console.log("Contacto guardado correctamente:", nuevoContacto);

  
  
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

  {/*****************************************************************************************************************************************/}
const toggleEstado = async (contacto) => {
    const nuevoEstado = contacto.estado ? 0 : 1;
  
    try {
      setLoading(true);
  
      const response = await axios.post('http://localhost:4000/api/contacto/actualizarEstadoContacto', {
        cod_contacto: contacto.cod_contacto,
        estado: nuevoEstado,
      });
  
      if (response.data.mensaje === 'Estado actualizado exitosamente') {
        // Actualizar el estado correctamente en la lista de contactos
        setContacto((prevContactos) =>
          prevContactos.map((cont) =>
            cont.cod_contacto === contacto.cod_contacto
              ? { ...cont, estado: nuevoEstado }
              : cont
          )
        );
      } else {
        console.error('Error al cambiar el estado:', response.data.mensaje);
      }
    } catch (error) {
      console.error('Error al realizar la solicitud:', error);
    } finally {
      setLoading(false);
      fetchContactos();
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
  
{/***********************************************************************************************************************************************/}
const ReporteContactoExcel = () => {
  if (!filteredContacto || filteredContacto.length === 0) {
      alert('No hay datos para exportar.');
      return;
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Reporte de Contactos');

  // **Título del documento**
  worksheet.mergeCells('A1:D1');
  worksheet.getCell('A1').value = "SAINT PATRICK'S ACADEMY";
  worksheet.getCell('A1').font = { bold: true, size: 18, color: { argb: '006633' } };
  worksheet.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };

  worksheet.mergeCells('A2:D2');
  worksheet.getCell('A2').value = 'LISTA DE CONTACTOS';
  worksheet.getCell('A2').font = { bold: true, size: 16, color: { argb: '006633' } };
  worksheet.getCell('A2').alignment = { horizontal: 'center', vertical: 'middle' };

  // **Encabezados de la tabla**
  const headerRow = worksheet.addRow(['#', 'Nombre', 'Tipo de Contacto', 'Valor']);
  headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '006633' } };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
  });

  // **Datos de la tabla**
  filteredContacto.forEach((contacto, index) => {
      const row = worksheet.addRow([
          index + 1,
          personaSeleccionada && personaSeleccionada.cod_persona === contacto.cod_persona
              ? `${personaSeleccionada.Nombre.toUpperCase()} ${personaSeleccionada.Segundo_nombre?.toUpperCase() || ''} ${personaSeleccionada.Primer_apellido.toUpperCase()} ${personaSeleccionada.Segundo_apellido?.toUpperCase() || ''}`
              : 'Información no disponible',
          tiposContacto.find(tc => tc.cod_tipo_contacto === contacto.cod_tipo_contacto)?.tipo_contacto.toUpperCase() || 'Desconocido',
          contacto.Valor || 'N/D'
      ]);

      row.eachCell((cell) => {
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
          cell.border = {
              top: { style: 'thin', color: { argb: '000000' } },
              left: { style: 'thin', color: { argb: '000000' } },
              bottom: { style: 'thin', color: { argb: '000000' } },
              right: { style: 'thin', color: { argb: '000000' } }
          };
      });
  });

  // **Ajustar el ancho de las columnas**
  worksheet.columns.forEach((column) => {
      column.width = 25;
  });

  // **Crear archivo Excel**
  workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, 'Reporte_Contactos.xlsx');
  });
};

  {/***********************************************************************************************************************************************/}
  

  return (
    <CContainer>
<CRow className="align-items-center mb-3">
  <CCol xs="12" className="text-center">
    {/* Título con línea verde debajo */}
    <div style={{ display: 'inline-block', textAlign: 'center', position: 'relative' }}>
      <h3 className="mb-0" style={{ fontSize: '1.5rem' }}>Lista de Contactos</h3>
      <div style={{ height: '3px', backgroundColor: '#4CAF50', width: '100%', marginTop: '5px' }}></div>
    </div>

    {/* Persona seleccionada */}
    {personaSeleccionada ? (
      <div style={{ marginTop: '10px', fontSize: '16px', color: '#555' }}>
        <strong>CONTACTOS DE:</strong> {`${personaSeleccionada.Nombre.toUpperCase()} ${personaSeleccionada.Segundo_nombre?.toUpperCase() || ''} ${personaSeleccionada.Primer_apellido.toUpperCase()} ${personaSeleccionada.Segundo_apellido?.toUpperCase() || ''}`}
      </div>
    ) : (
      <div style={{ marginTop: '10px', fontSize: '16px', color: '#555' }}>
        <strong>Persona Seleccionada:</strong> Información no disponible
      </div>
    )}
  </CCol>
</CRow>

<CRow className="align-items-center mt-2 mb-3">
  {/* Botón Personas alineado a la izquierda */}
  <CCol xs="12" md="3" className="d-flex justify-content-start mb-3 mb-md-0">
    <CButton
      color="secondary"
      onClick={volverAListaPersonas}
      style={{ minWidth: '120px', height: '38px' }}
    >
      <CIcon icon={cilArrowLeft} /> Personas
    </CButton>
  </CCol>

  {/* Botones alineados a la derecha: Ficha, Nuevo y Reporte */}
  <CCol xs="12" md="9" className="d-flex justify-content-end gap-3">
    <CButton
      style={{ backgroundColor: '#346B93', color: 'white', minWidth: '120px', height: '38px' }}
      onClick={() => abrirFichaPadre(personaSeleccionada)}
    >
      <CIcon icon={cilUser} /> Ficha
    </CButton>

    <CButton
      style={{ backgroundColor: '#4B6251', color: 'white', minWidth: '120px', height: '38px' }}
      onClick={() => {
        setModalVisible(true);
        setContactoToUpdate(null);
      }}
    >
      <CIcon icon={cilPlus} /> Nuevo
    </CButton>

    <CDropdown>
      <CDropdownToggle style={{ backgroundColor: '#6C8E58', color: 'white', minWidth: '120px', height: '38px' }}>
        Reporte
      </CDropdownToggle>
      <CDropdownMenu>
        <CDropdownItem onClick={ReporteContactoPDF}>Descargar en PDF</CDropdownItem>
        <CDropdownItem onClick={ReporteContactoExcel}>Descargar en Excel</CDropdownItem>
      </CDropdownMenu>
    </CDropdown>
  </CCol>
</CRow>


{/* Barra de búsqueda */}
<CRow className="align-items-center mt-3 mb-2">
  <CCol xs="12" md="8" className="d-flex flex-wrap align-items-center">
    <CInputGroup className="me-3" style={{ width: '400px' }}>
      <CInputGroupText>
        <CIcon icon={cilSearch} />
      </CInputGroupText>
      <CFormInput
        placeholder="Buscar contactos..."
        onChange={handleSearch}
        value={searchTerm}
      />
      <CButton
        style={{ border: '1px solid #ccc', transition: 'all 0.1s ease-in-out', backgroundColor: '#F3F4F7', color: '#343a40' }}
        onClick={() => setSearchTerm('')}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#E0E0E0';
          e.currentTarget.style.color = 'black';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#F3F4F7';
          e.currentTarget.style.color = '#343a40';
        }}
      >
        <CIcon icon={cilBrushAlt} /> Limpiar
      </CButton>
    </CInputGroup>
  </CCol>

  {/* Selector de registros */}
  <CCol xs="12" md="4" className="text-md-end mt-2 mt-md-0">
    <CInputGroup className="mt-2 mt-md-0" style={{ width: 'auto', display: 'inline-block' }}>
      <div className="d-inline-flex align-items-center">
        <span>Mostrar&nbsp;</span>
        <CFormSelect
          style={{ width: '80px', display: 'inline-block', textAlign: 'center' }}
          onChange={(e) => {
            const value = Number(e.target.value);
            setRecordsPerPage(value);
            setCurrentPage(1);
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


{/**************************************************************************************************************************************/}
<div className="table-container" style={{ maxHeight: '400px', overflowY: 'scroll', marginBottom: '20px' }}>
  <CTable striped bordered hover>
    <CTableHead>
      <CTableRow>
        <CTableHeaderCell>#</CTableHeaderCell>
        <CTableHeaderCell>Tipo de Contacto</CTableHeaderCell>
        <CTableHeaderCell>Valor</CTableHeaderCell>
        <CTableHeaderCell>Principal</CTableHeaderCell>
        <CTableHeaderCell>Acciones</CTableHeaderCell>
      </CTableRow>
    </CTableHead>
    <CTableBody>
      {currentRecords.map((item, index) => (
        <CTableRow key={item.cod_contacto}>
          <CTableDataCell>{index + 1 + indexOfFirstRecord}</CTableDataCell>
          <CTableDataCell>
            {tiposContacto.find(tc => tc.cod_tipo_contacto === item.cod_tipo_contacto)?.tipo_contacto.toUpperCase() || 'Desconocido'}
          </CTableDataCell>
          <CTableDataCell>{item.Valor.toUpperCase()}</CTableDataCell>
          {/* Nuevo diseño para la columna principal */}
          <CTableDataCell style={{ fontSize: '0.85rem', textAlign: 'center' }}>
            {item.principal ? (
              <CIcon icon={cilCheckCircle} style={{ fontSize: '2em', color: '#28a745' }} />
            ) : (
              <CIcon icon={cilXCircle} style={{ fontSize: '2em', color: '#dc3545' }} />
            )}
          </CTableDataCell>
          {/* Acciones incluyendo botón de estado */}
          <CTableDataCell>
            <div className="d-flex justify-content-center">
              <CButton color="warning" onClick={() => { setContactoToUpdate(item); setModalVisible(true); }}>
                <CIcon icon={cilPen} />
              </CButton>
              <CButton color="danger" onClick={() => handleDeleteContacto(item.cod_contacto, item.Valor)} className="ms-2">
                <CIcon icon={cilTrash} />
              </CButton>
              {/* Botón de estado ahora dentro de acciones */}
              <CButton
                style={{
                  backgroundColor: item.estado ? '#4CAF50' : '#F44336', // Verde si activo, rojo si inactivo
                  color: 'white',
                  marginLeft: '10px',
                }}
                onClick={() => toggleEstado(item)} // Función para cambiar estado
                disabled={loading} // Deshabilitado mientras carga
              >
                {loading ? 'Cambiando...' : item.estado ? 'Activo' : 'Inactivo'}
              </CButton>
            </div>
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
<CModal visible={modalVisible} backdrop="static" onClose={() => handleCloseModal(setModalVisible, contactoToUpdate ? resetContactoToUpdate : resetNuevoContacto)} size="lg">
  <CModalHeader closeButton>
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

{/* Validar si es teléfono */}
{Number(contactoToUpdate?.cod_tipo_contacto ?? nuevoContacto.cod_tipo_contacto) === 1 || 
 Number(contactoToUpdate?.cod_tipo_contacto ?? nuevoContacto.cod_tipo_contacto) === 2 ? (

  <PhoneInput
    international
    defaultCountry="HN"
    value={contactoToUpdate?.Valor ?? nuevoContacto.Valor}
    onChange={(value) => {
      if (!value) return; // Evitar valores undefined

      const phoneDigits = value.replace(/\D/g, '');

      // **Bloquear la entrada de más de 15 dígitos**
      if (phoneDigits.length > 15) return;

      if (contactoToUpdate) {
        setContactoToUpdate((prev) => ({ ...prev, Valor: value }));
      } else {
        setNuevoContacto((prev) => ({ ...prev, Valor: value }));
      }
    }}
    onKeyDown={(e) => {
      const phoneDigits = (contactoToUpdate?.Valor ?? nuevoContacto.Valor)?.replace(/\D/g, '') ?? '';

      // **Bloquear la entrada de más números después de 15 dígitos**
      if (phoneDigits.length >= 15 && /\d/.test(e.key)) {
        e.preventDefault();
      }
    }}
    className="border-0"
    style={{ width: "100%" }}
  />

  ) : (
    <div style={{ display: 'flex', flexDirection: 'column', width: "100%" }}>
      <CFormInput
        placeholder="EMAIL"
        value={contactoToUpdate?.Valor ?? nuevoContacto.Valor}
        onChange={(e) => {
          let value = e.target.value?.slice(0, 50).trim() ?? '';

          // **Lista de dominios válidos**
          const dominiosPermitidos = ["gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "icloud.com", "protonmail.com"];
          const emailRegex = /^[a-zA-Z0-9._%+-]{4,}@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

          // **Validación en tiempo real**
          if (value.length > 0) {
            if (!value.includes("@")) {
              setErrorMessages((prevErrors) => ({
                ...prevErrors,
                email: 'El correo debe contener "@" seguido de un dominio válido.'
              }));
            } else {
              const [localPart, domain] = value.split("@");

              if (localPart.length < 4) {
                setErrorMessages((prevErrors) => ({
                  ...prevErrors,
                  email: 'El correo debe tener al menos 4 caracteres antes del "@".'
                }));
              } else if (!emailRegex.test(value) || !dominiosPermitidos.includes(domain)) {
                setErrorMessages((prevErrors) => ({
                  ...prevErrors,
                  email: `Dominio no permitido. Usa: ${dominiosPermitidos.join(", ")}`
                }));
              } else {
                setErrorMessages((prevErrors) => ({
                  ...prevErrors,
                  email: ''
                }));
              }
            }
          } else {
            setErrorMessages((prevErrors) => ({
              ...prevErrors,
              email: ''
            }));
          }

          if (contactoToUpdate) {
            setContactoToUpdate((prev) => ({ ...prev, Valor: value }));
          } else {
            setNuevoContacto((prev) => ({ ...prev, Valor: value }));
          }
        }}
        className="border-0"
        style={{ width: "100%" }}
      />
      {errorMessages.email && (
        <div className="error-message">
          {errorMessages.email}
        </div>
      )}
    </div>
  )}
</div>

<style jsx>{`
  .error-message {
    color: red;
    font-size: 12px;
    margin-top: 4px;
    margin-bottom: 0;
    margin-left: 12px;
  }
`}</style>


  {/* Campo de Principal */}
  <div className="col-md-6">
    <CInputGroup className="mb-3 align-items-center">
      <CInputGroupText style={{ width: '230px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span>Principal</span>
        <CFormCheck
          type="checkbox"
          label=""
          checked={contactoToUpdate ? contactoToUpdate.principal : nuevoContacto.principal}
          onChange={(e) => {
            contactoToUpdate
              ? setContactoToUpdate({ ...contactoToUpdate, principal: e.target.checked })
              : setNuevoContacto({ ...nuevoContacto, principal: e.target.checked });
          }}
          style={{ transform: 'scale(1.3)', marginLeft: '10px' }}
        />
      </CInputGroupText>
    </CInputGroup>
  </div>

  </CModalBody>
  <CModalFooter>
    <CButton color="secondary" onClick={() => handleCloseModal(setModalVisible, contactoToUpdate ? resetContactoToUpdate : resetNuevoContacto)}>
      Cancelar
    </CButton>
    <CButton onClick={handleCreateOrUpdate} style={{ backgroundColor: '#28a745', color: 'white' }}>
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

