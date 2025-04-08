import React, { useState, useEffect } from 'react'
import { CIcon } from '@coreui/icons-react'
import { cilSearch, cilBrushAlt, cilPen, cilTrash, cilPlus, cilDescription, cilSave, cilArrowLeft } from '@coreui/icons'
import swal from 'sweetalert2' // Importar SweetAlert
import axios from 'axios'
import { jsPDF } from 'jspdf' // Para generar archivos PDF
import 'jspdf-autotable' // Para crear tablas en los archivos PDF
import * as XLSX from 'xlsx' // Para generar archivos Excel
import { saveAs } from 'file-saver' // Para descargar archivos en el navegador
import Select from 'react-select' // Para crear un seleccionador dinamico
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom'
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
  CDropdownItem,
} from '@coreui/react'
import logo from 'src/assets/brand/logo_saint_patrick.png';
import usePermission from '../../../../context/usePermission';
import AccessDenied from "../AccessDenied/AccessDenied"


const ListaEstructura = () => {

  const { canSelect, canDelete, canInsert, canUpdate } = usePermission('ListaEstructura');


  // Estados principales
  const [estructuraFamiliar, setEstructuraFamiliar] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalUpdateVisible, setModalUpdateVisible] = useState(false);
  const [modalDeleteVisible, setModalDeleteVisible] = useState(false);
  const [nuevaEstructura, setNuevaEstructuraFamiliar] = useState({
    cod_persona_padre: '',
    cod_persona_estudiante: '',
    cod_tipo_relacion: '',
    descripcion: '',
  });
  const [estructuraToUpdate, setEstructuraToUpdate] = useState({   
    Cod_genealogia: '',
    cod_persona_padre: '',
    cod_persona_estudiante: '',
    cod_tipo_relacion: '',
    descripcion: '',});
  const [errorMessages, setErrorMessages] = useState({}); // Inicializar estado para mensajes de error
  const [estructuraToDelete, setEstructuraToDelete] = useState({});
  const [personas, setPersonas] = useState([]);
  const [personasFiltradas, setPersonasFiltradas] = useState([]);
  const [tipoRelacion, setTipoRelacion] = useState([]);
  const [buscadorRelacion, setBuscadorRelacion] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [rolActual, setRolActual] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [codPersonaEstudiante, setCodPersonaEstudiante] = useState('');
  const [codPersonaPadre, setCodPersonaPadre] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const [estructurasFamiliares, setEstructurasFamiliares] = useState([]);
  const [codPersonaSeleccionada, setCodPersonaSeleccionada] = useState('');
  const [filterEstructuraFamiliar, setFilterEstructuraFamiliar] = useState([]);

  // Nuevo estado para evitar que el dropdown se abra al cargar el modal
  const [userHasTyped, setUserHasTyped] = useState(false);





  const [tipoPersona, setTipoPersona] = useState([]);


  const [codPersona, setCodPersona] = useState('');


  // Navegación y ubicación

  const volverAListaPersonas = () => {
    navigate('/ListaPersonas');
  };

  const location = useLocation();
  const navigate = useNavigate();
  const { personaSeleccionada } = location?.state || {};
  const esEstudiante = personaSeleccionada?.cod_tipo_persona === 1;


  useEffect(() => {
    if (personaSeleccionada) {
      setRolActual(personaSeleccionada.cod_tipo_persona === 1 ? 'ESTUDIANTE' : 'PADRE');
    }
  }, [personaSeleccionada]);


{/* ------------------------------------------------------------------------------------------------------------------------------------------------- */}


// Función para refrescar las estructuras familiares
const refreshEstructurasFamiliares = async () => {
  if (!personaSeleccionada) return;
  try {
    // Puedes ajustar este endpoint
    const response = await fetch(`http://localhost:4000/api/estructuraFamiliar/verEstructuraFamiliar/${personaSeleccionada.cod_persona}`);
    const datos = await response.json();

    if (Array.isArray(datos)) {
      setEstructurasFamiliares(datos);
    } else {
      setEstructurasFamiliares([]);
    }
  } catch (error) {
    console.error("Error al cargar estructuras familiares:", error);
  }
};

// Efecto para cargar inicialmente y actualizar al cerrar modales
useEffect(() => {
  // Solo se refresca cuando la persona está seleccionada y todos los modales están cerrados
  if (personaSeleccionada && !modalUpdateVisible && !modalVisible && !modalDeleteVisible) {
    refreshEstructurasFamiliares();
  }
}, [personaSeleccionada, modalUpdateVisible, modalVisible, modalDeleteVisible]);

  
{/* -------------------------------------------------------------------------------------------------------------------------------------------- */}


// Carga inicial de personas desde la API
useEffect(() => {
  const cargarPersonas = async () => {
    try {
      const respuesta = await fetch('http://localhost:4000/api/estructuraFamiliar/verPersonas');
      const datos = await respuesta.json();
      setPersonas(datos);
    } catch (error) {
      console.error("Error al cargar las personas:", error);
    }
  };
  cargarPersonas();
}, []);

// Filtrado automático de personas basado en el valor del buscador
useEffect(() => {
  // Si el campo está vacío, se limpia la lista y se cierra el dropdown
  if (!buscadorRelacion.trim()) {
    setPersonasFiltradas([]);
    setIsDropdownOpen(false);
    return;
  }

  // Si el usuario aún no ha interactuado, no se abre el dropdown
  if (!userHasTyped) {
    setIsDropdownOpen(false);
    return;
  }

  // Filtrar la lista de personas en función del input
  const resultados = personas.filter((persona) =>
    persona.fullName?.toUpperCase().includes(buscadorRelacion.toUpperCase()) ||
    persona.dni_persona?.includes(buscadorRelacion)
  );
  setPersonasFiltradas(resultados);
  setIsDropdownOpen(resultados.length > 0);
}, [buscadorRelacion, personas, userHasTyped]);



// Manejador del input de búsqueda (actualiza el estado y deja que el useEffect se encargue del filtrado)
const handleBuscarRelacion = (e) => {
  setUserHasTyped(true); // El usuario ya está escribiendo
  setBuscadorRelacion(e.target.value);
};


// Función para seleccionar la persona del dropdown
const handleSeleccionarPersona = (persona) => {
  console.log("Persona seleccionada en buscador:", persona.cod_persona);

  setCodPersonaSeleccionada(persona.cod_persona);
  setBuscadorRelacion(`${persona.dni_persona} - ${persona.fullName}`);

  // ✅ Detectamos si se está editando o agregando
  if (estructuraToUpdate?.Cod_genealogia) {
    console.log("🛠 Editando estructura existente...");
    setEstructuraToUpdate(prev => {
      const updatedStructure = {
        ...prev,
        cod_persona_padre: persona.cod_persona,
      };
      console.log("Nuevo cod_persona_padre en estructura actualizada:", updatedStructure.cod_persona_padre);
      return updatedStructure;
    });
  } else {
    console.log("➕ Agregando nueva estructura...");
    setNuevaEstructuraFamiliar(prev => ({
      ...prev,
      cod_persona_padre: persona.cod_persona,
    }));
    console.log("Nuevo cod_persona_padre en nueva estructura:", persona.cod_persona);
  }

  setIsDropdownOpen(false);
};


{/* ----------------------------------------------------------------------------------------------------------------------------------------*/}


  // Resetear formulario
  const resetNuevaEstructuraFamiliar = () => {
    setNuevaEstructuraFamiliar({
      cod_persona_padre: rolActual === 'PADRE' ? personaSeleccionada?.cod_persona || '' : '',
      cod_persona_estudiante: rolActual === 'ESTUDIANTE' ? personaSeleccionada?.cod_persona || '' : '',
      cod_tipo_relacion: '',
      descripcion: '',
    });
    setBuscadorRelacion('');
  };

  const resetEstructuraToUpdate = () => {
    setEstructuraToUpdate({
      cod_persona_padre: rolActual === 'PADRE' ? personaSeleccionada?.cod_persona || '' : '',
      cod_persona_estudiante: rolActual === 'ESTUDIANTE' ? personaSeleccionada?.cod_persona || '' : '',
      cod_tipo_relacion: '',
      descripcion: '',
    });
    setBuscadorRelacion(''); 
  };
  

  // Efecto para limpiar el modal al abrirlo
  useEffect(() => {
    if (modalVisible) {
      resetNuevaEstructuraFamiliar();
    }
  }, [modalVisible]);

  useEffect(() => {
    const fetchTipoRelacion = async () => {
      try {
        const response = await axios.get(
          `http://localhost:4000/api/estructuraFamiliar/verTipoRelacion`,
        )
        setTipoRelacion(response.data)
        console.log('Datos de tipo Relacion:', response.data) // Verifica la estructura de los datos
      } catch (error) {
        console.error('Error al cargar tipos de relación:', error)
      }
    }
    fetchTipoRelacion()
  }, [])
  {/*  */}

  {/* ------------------------------------------------------------------------------------------------------------------------------------- */}


{/* ----------------------------------------------------------------------------------------------------------------------------------------- */}

 {/* Función para crear estructura */}
 const handleCreateEstructura = async () => {
  console.log("Estructura familiar final:", nuevaEstructura);

  // Validación de descripción obligatoria
  if (!nuevaEstructura.descripcion.trim()) {
    swal.fire({
      icon: 'warning',
      title: 'Campo obligatorio',
      text: 'La descripción no puede estar vacía.',
    });
    return;
  }

  // Validación de cod_persona_padre y cod_persona_estudiante
  if (!nuevaEstructura.cod_persona_padre && !nuevaEstructura.cod_persona_estudiante) {
    swal.fire({
      icon: 'warning',
      title: 'Campos obligatorios',
      text: 'Debe seleccionar al menos un padre o estudiante.',
    });
    return;
  }

  // Log para depuración
  console.log('Datos enviados al backend:', nuevaEstructura);

  try {
    // Preparación del cuerpo de la solicitud
    const estructuraData = {
      cod_persona_padre: nuevaEstructura.cod_persona_padre, // Permitir null si no está definido
      cod_persona_estudiante: nuevaEstructura.cod_persona_estudiante, // Permitir null si no está definido
      cod_tipo_relacion: nuevaEstructura.cod_tipo_relacion,
      descripcion: nuevaEstructura.descripcion,
    };

    const response = await fetch('http://localhost:4000/api/estructuraFamiliar/crearEstructuraFamiliar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(estructuraData),
    });

    if (response.ok) {
      // Éxito: Actualizar datos y cerrar el modal
     
      setModalVisible(false); // Cerrar el modal
      resetNuevaEstructuraFamiliar(); // Reiniciar formulario
      setHasUnsavedChanges(false); // Reiniciar control de cambios no guardados
      swal.fire({
        icon: 'success',
        title: 'Creación exitosa',
        text: 'La estructura ha sido creada correctamente.',
      });
    } else {
      // Error en la respuesta del servidor
      const errorData = await response.json();
      swal.fire({
        icon: 'error',
        title: 'Error al crear',
        text: errorData.message || 'No se pudo crear la estructura.',
      });
    }
  } catch (error) {
    // Error de conexión o fetch
    console.error('Error al crear la estructura:', error);
    swal.fire({
      icon: 'error',
      title: 'Error de conexión',
      text: 'Hubo un problema al conectar con el servidor.',
    });
  }
};


  
{/* ---------------------------------------------------------------------------------------------------------------------------------------------- */}

{/*************************************************Función para actualizar estructura*******************************************************/}


const handleUpdateEstructura = async () => {
  try {
    console.log("Cod_genealogia:", estructuraToUpdate.Cod_genealogia);
    console.log("Persona seleccionada (estudiante):", personaSeleccionada?.cod_persona);
    console.log("Persona buscada (nuevo padre, antes de enviar actualización):", estructuraToUpdate.cod_persona_padre);

    const requestBody = {
      descripcion: estructuraToUpdate.descripcion,
      cod_persona_estudiante: personaSeleccionada?.cod_persona, 
      cod_persona_padre: estructuraToUpdate.cod_persona_padre, 
      cod_tipo_relacion: estructuraToUpdate.cod_tipo_relacion,
      Cod_genealogia: estructuraToUpdate.Cod_genealogia,
    };

    console.log("Datos enviados al backend:", JSON.stringify(requestBody));

    const response = await fetch(
      `http://localhost:4000/api/estructuraFamiliar/actualizarEstructuraFamiliar/${estructuraToUpdate.Cod_genealogia}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (response.ok) {
      console.log("Actualización exitosa. Refrescando datos...");

      // ✅ Recarga los datos en la UI para reflejar los cambios
      await refreshEstructurasFamiliares();
      console.log("🔄 Datos después de refrescar:", estructuraFamiliar);

      // ✅ Cerramos el modal y limpiamos estados
      setModalUpdateVisible(false);
      resetEstructuraToUpdate();
      setHasUnsavedChanges(false);
      setBuscadorRelacion('');
      setUserHasTyped(false);

      swal.fire({
        icon: 'success',
        title: 'Actualización exitosa',
        text: 'La estructura familiar ha sido actualizada correctamente.',
      });
    } else {
      const errorMessage = await response.text();
      console.error(" Error en la actualización:", errorMessage);
      swal.fire({
        icon: 'error',
        title: 'Error',
        text: `No se pudo actualizar la estructura familiar: ${errorMessage}`,
      });
    }
  } catch (error) {
    console.error('🚨 Error inesperado al actualizar:', error);
    swal.fire({
      icon: 'error',
      title: 'Error inesperado',
      text: 'Ocurrió un error al intentar actualizar la estructura familiar.',
    });
  }
};


{/* ---------------------------------------------------------------------------------------------------------------------------------------------------- */}
  
{/* Función para borrar estructura */}
  const handleDeleteEstructura = async () => {
    try {
      const response = await fetch(
        `http://localhost:4000/api/estructuraFamiliar/eliminarEstructuraFamiliar/${encodeURIComponent(estructuraToDelete.Cod_genealogia)}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        refreshEstructurasFamiliares();
        setModalDeleteVisible(false);
        setEstructuraToDelete({});
        swal.fire({
          icon: 'success',
          title: 'Eliminación exitosa',
          text: 'La estructura familiar ha sido eliminado correctamente.',
        });
      } else {
        swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo eliminar la estructura familiar.',
        });
      }
    } catch (error) {
      console.error('Error al eliminar la estructura familiar:', error);
    }
  };
  {/*Fin de la función para borrar estructura*/}

{/* ------------------------------------------------------------------------------------------------------------------------------- */}

{/******************************************MANEJO DE CIERRE Y APERTURA DE MODAL********************************************************/}

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



const handleOpenUpdateModal = (estructura) => {
  if (!personas || personas.length === 0) {
    console.error("La lista de personas está vacía o no cargó correctamente.");
    return;
  }

  // Buscar datos de la persona estudiante y del padre en la lista
  const estudianteEncontrado = personas.find(
    (persona) => persona.cod_persona === estructura.cod_persona_estudiante
  );
  const padreEncontrado = personas.find(
    (persona) => persona.cod_persona === estructura.cod_persona_padre
  );

  // Dependiendo del rol actual se muestra el nombre correspondiente:
  const displayName =
    rolActual === "ESTUDIANTE"
      ? (padreEncontrado ? padreEncontrado.fullName : "No encontrado")
      : (estudianteEncontrado ? estudianteEncontrado.fullName : "No encontrado");

  setEstructuraToUpdate({
    ...estructura,
    descripcion: estructura.descripcion || "",
    cod_persona_padre: estructura.cod_persona_padre || "",
    cod_persona_estudiante: estructura.cod_persona_estudiante || "",
    cod_tipo_relacion: estructura.cod_tipo_relacion || "",
    Cod_genealogia: estructura.Cod_genealogia || "",
    nombreEstudiante: estudianteEncontrado ? estudianteEncontrado.fullName : "No encontrado",
    nombrePadre: padreEncontrado ? padreEncontrado.fullName : "No encontrado",
  });

  // Asigna el nombre al input sin activar el dropdown
  setBuscadorRelacion(displayName);
  setUserHasTyped(false); // Este valor se mantendrá hasta que el usuario comience a escribir
  setModalUpdateVisible(true);
};




const openDeleteModal = (estructura) => {
  setEstructuraToDelete(estructura);
  setModalDeleteVisible(true);
}

const disableCopyPaste = (e) => {
  e.preventDefault();
  swal.fire({
    icon: 'warning',
    title: 'Acción bloqueada',
    text: 'Copiar y pegar no está permitido.',
  });
};


  const handleModalOpen = () => {
    setModalVisible(true);
  };
  
  const handleModalClose = () => {
    setModalVisible(false);
  };



{/*******************************************FUNCIONES DE FILTRADO, BUSQUEDA Y REPORTERIA************************************************/}

{/*******************************FUNCION DE BUSQUEDA*************************************/}

  const filteredRecords = estructurasFamiliares.filter(estructura => {
    const estudiante = personas.find(p => p.cod_persona === estructura.cod_persona_estudiante)?.fullName?.toUpperCase() || 'N/A';
    const padreTutor = personas.find(p => p.cod_persona === estructura.cod_persona_padre)?.fullName?.toUpperCase() || 'N/A';
    const tipoRelacionTexto = tipoRelacion.find(tipo => tipo.Cod_tipo_relacion === estructura.cod_tipo_relacion)?.tipo_relacion?.toUpperCase() || 'N/A';
    const descripcion = estructura.descripcion?.toUpperCase() || 'N/A';

    const searchText = searchTerm.toUpperCase(); // Convertir la búsqueda a mayúsculas para hacerla insensible a mayúsculas/minúsculas

    // Verifica si el término de búsqueda se encuentra en alguno de los campos
    return estudiante.includes(searchText) 
      || padreTutor.includes(searchText) 
      || tipoRelacionTexto.includes(searchText) 
      || descripcion.includes(searchText);
  });

  // Paginación de los registros filtrados
const currentRecords = filteredRecords.slice(
  (currentPage - 1) * recordsPerPage,
  currentPage * recordsPerPage
);

const handleSearch = (e) => {
  const term = e.target.value; // Obtener el valor del input de búsqueda
  setSearchTerm(term); // Actualiza el término de búsqueda
}

/*******************************FUNCION DE REPORTERIA*************************************/
// Función para generar reporte PDF
const ReporteEstructuraPDF = () => {
  const doc = new jsPDF('l  ', 'mm', 'letter'); //

  if (!filteredRecords || filteredRecords.length === 0) {
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
    doc.text('Reporte de Estructura Familiar', pageWidth / 2, 50, { align: 'center' });

    doc.setLineWidth(0.5);
    doc.setDrawColor(0, 102, 51);
    doc.line(10, 60, pageWidth - 10, 60);

    // Tabla de datos
    const tableRows = filteredRecords.map((estructura, index) => ({
      index: (index + 1).toString(),
      estudiante: personas.find(p => p.cod_persona === estructura.cod_persona_estudiante)?.fullName?.toUpperCase() || 'N/D',
      padre: personas.find(p => p.cod_persona === estructura.cod_persona_padre)?.fullName?.toUpperCase() || 'N/D',
      tipo_relacion: tipoRelacion.find(tipo => tipo.Cod_tipo_relacion === estructura.cod_tipo_relacion)?.tipo_relacion?.toUpperCase() || 'N/D',
      descripcion: estructura.descripcion?.toUpperCase() || 'N/D',
    }));

    const pageHeight = doc.internal.pageSize.height;


    doc.autoTable({
      startY: 65,
      startY: (pageHeight - tableRows.length * 10) / 2, // Centrado de la tabla
      columns: [
        { header: '#', dataKey: 'index' },
        { header: 'Estudiante', dataKey: 'estudiante' },
        { header: 'Padre/Tutor', dataKey: 'padre' },
        { header: 'Tipo de Relación', dataKey: 'tipo_relacion' },
        { header: 'Descripción', dataKey: 'descripcion' },
      ],
      body: tableRows,
      headStyles: {
        fillColor: [0, 102, 51],
        textColor: [255, 255, 255],
        fontSize: 9, // Aumentado el tamaño de la fuente
        halign: 'center',
      },
      styles: {
        fontSize: 7, // Aumentado el tamaño de la fuente
        cellPadding: 4, // Aumentado el relleno de las celdas
      },
      columnStyles: {
        index: { cellWidth: 10 },
        estudiante: { cellWidth: 75 },
        padre: { cellWidth: 75 },
        tipo_relacion: { cellWidth: 40 },
        descripcion: { cellWidth: 60 },
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
        <head><title>Reporte de Estructura Familiar</title></head>
        <body style="margin:0;">
          <iframe width="100%" height="100%" src="${pdfURL}" frameborder="0"></iframe>
          <div style="position:fixed;top:10px;right:20px;">
            <button style="background-color: #6c757d; color: white; border: none; padding: 10px 15px; border-radius: 5px; cursor: pointer;" 
              onclick="const a = document.createElement('a'); a.href='${pdfURL}'; a.download='Reporte_Estructura_Familiar.pdf'; a.click();">
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

  
  
  // Función para generar reporte Excel
  const ReporteEstructuraExcel = () => {
    if (!filteredRecords || filteredRecords.length === 0) {
      alert('No hay datos para exportar.');
      return;
    }
  
    // Crear los datos para la tabla
    const tableRows = filteredRecords.map((estructura, index) => ({
      '#': (index + 1).toString(),
      Estudiante: personas.find(p => p.cod_persona === estructura.cod_persona_estudiante)?.fullName?.toUpperCase() || 'N/D',
      'Padre/Tutor': personas.find(p => p.cod_persona === estructura.cod_persona_padre)?.fullName?.toUpperCase() || 'N/D',
      'Tipo de Relación': tipoRelacion.find(tipo => tipo.Cod_tipo_relacion === estructura.cod_tipo_relacion)?.tipo_relacion?.toUpperCase() || 'N/D',
      Descripción: estructura.descripcion?.toUpperCase() || 'N/D',
    }));
  
    // Crear un libro de trabajo (workbook)
    const ws = XLSX.utils.json_to_sheet(tableRows);
  
    // Crear el libro (workbook) y agregarle la hoja (worksheet)
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Reporte Estructura Familiar');
  
    // Generar el archivo Excel y descargarlo
    XLSX.writeFile(wb, 'Reporte_Estructura_Familiar.xlsx');
  };
  

{/******************************************************************************************************************************************/}  

{/* -------------------------------------------------------------------------------------------------------------------------------- */}
  
    // Verificar permisos
    if (!canSelect) {
      return <AccessDenied />;
    }
{/*------------------------------------------------------------------------------------------------------------------------------------*/}

return (
    <CContainer>
<CRow className="align-items-center mb-3">
  <CCol xs="12" className="text-center">
    {/* Título con línea verde alineada */}
    <div style={{ display: 'inline-block', textAlign: 'center', position: 'relative' }}>
      <h3 className="mb-0" style={{ fontSize: '1.5rem' }}>Estructura Familiar</h3>
      <div style={{
        height: '3px',
        backgroundColor: '#4CAF50',
        width: '100%',
        marginTop: '5px'
      }}></div>
    </div>

    {/* Persona seleccionada */}
    {personaSeleccionada ? (
      <div style={{ marginTop: '10px', fontSize: '16px', color: '#555' }}>
        <strong>RELACIONES DE:</strong> {personaSeleccionada 
          ? `${personaSeleccionada.Nombre.toUpperCase()} ${personaSeleccionada.Segundo_nombre?.toUpperCase() || ''} ${personaSeleccionada.Primer_apellido.toUpperCase()} ${personaSeleccionada.Segundo_apellido?.toUpperCase() || ''}` 
          : 'Información no disponible'}
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

  {/* Botones alineados a la derecha */}
  <CCol xs="12" md="9" className="d-flex justify-content-end gap-3">
    {esEstudiante && (
      <CButton
        style={{ backgroundColor: '#4B6251', color: 'white', minWidth: '120px', height: '38px' }}
        onClick={handleModalOpen}
      >
        <CIcon icon={cilPlus} /> Nuevo
      </CButton>
    )}

    <CDropdown>
      <CDropdownToggle style={{ backgroundColor: '#6C8E58', color: 'white', minWidth: '120px', height: '38px' }}>
        Reportes
      </CDropdownToggle>
      <CDropdownMenu>
        <CDropdownItem onClick={ReporteEstructuraExcel}>Descargar en Excel</CDropdownItem>
        <CDropdownItem onClick={ReporteEstructuraPDF}>Descargar en PDF</CDropdownItem>
      </CDropdownMenu>
    </CDropdown>
  </CCol>
</CRow>

{/* Filtro de búsqueda */}
<div className="d-flex justify-content-between align-items-center mb-3">
<CCol xs="12" md="8" className="d-flex flex-wrap align-items-center">
  {/* Barra de búsqueda con validaciones */}
  <CInputGroup className="me-3" style={{ width: '400px' }}>
    <CInputGroupText>
      <CIcon icon={cilSearch} />
    </CInputGroupText>
    <CFormInput
      placeholder="Buscar..."
      value={searchTerm}
      onChange={(e) => {
        let value = e.target.value;

        // Bloquear más de un espacio consecutivo
        value = value.replace(/\s{2,}/g, ' ');

        // Bloquear más de tres letras repetidas consecutivamente
        value = value.replace(/([A-Za-z])\1{2,}/g, '$1$1');

        // Bloquear más de tres números repetidos consecutivamente
        value = value.replace(/([0-9])\1{2,}/g, '$1$1');

        // Bloquear caracteres especiales
        value = value.replace(/[^A-Za-z0-9\s]/g, '');

        setSearchTerm(value);
      }}
      onPaste={(e) => e.preventDefault()} // 
      onCopy={(e) => e.preventDefault()} // 
    />
    <CButton
      style={{
        border: '1px solid #ccc',
        transition: 'all 0.1s ease-in-out',
        backgroundColor: '#F3F4F7',
        color: '#343a40'
      }}
      onClick={() => {
        setSearchTerm('');
        setCurrentPage(1);
      }}
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
  <div className="d-flex align-items-center">
    <label htmlFor="recordsPerPageSelect">Mostrar</label>
    <select
      id="recordsPerPageSelect"
      value={recordsPerPage}
      onChange={(e) => {
        setRecordsPerPage(Number(e.target.value))
        setCurrentPage(1)
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

      <div className="table-container">
        <div style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: '500px' }}>
          <CTable striped>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell style={{ borderRight: '1px solid #ddd' }} className="text-center">#</CTableHeaderCell>
                {rolActual === 'ESTUDIANTE' ? (
                  <>
                    <CTableHeaderCell style={{ borderRight: '1px solid #ddd' }} className="text-center">Estudiante</CTableHeaderCell>
                    <CTableHeaderCell style={{ borderRight: '1px solid #ddd' }} className="text-center">Padre/Tutor</CTableHeaderCell>
                  </>
                ) : (
                  <>
                    <CTableHeaderCell style={{ borderRight: '1px solid #ddd' }} className="text-center">Padre/Tutor</CTableHeaderCell>
                    <CTableHeaderCell style={{ borderRight: '1px solid #ddd' }} className="text-center">Estudiante</CTableHeaderCell>
                  </>
                )}
                <CTableHeaderCell style={{ borderRight: '1px solid #ddd' }} className="text-center">Tipo Relación</CTableHeaderCell>
                <CTableHeaderCell style={{ borderRight: '1px solid #ddd' }} className="text-center">Descripción</CTableHeaderCell>
                {esEstudiante && (
                  <CTableHeaderCell className="text-center">Acciones</CTableHeaderCell>
                )}

              </CTableRow>
            </CTableHead>

            <CTableBody>
              {currentRecords.length > 0 ? (
                currentRecords.map((estructura, index) => (
                  <CTableRow key={estructura.cod_estructura}>
                    <CTableDataCell style={{ borderRight: '1px solid #ddd' }} className="text-center">
                      {(currentPage - 1) * recordsPerPage + index + 1}
                    </CTableDataCell>

                    {rolActual === 'ESTUDIANTE' ? (
                      <>
                        <CTableDataCell style={{ borderRight: '1px solid #ddd' }} className="text-center">
                          {personas.find(p => p.cod_persona === estructura.cod_persona_estudiante)?.fullName?.toUpperCase() || 'N/A'}
                        </CTableDataCell>
                        <CTableDataCell style={{ borderRight: '1px solid #ddd' }} className="text-center">
                          {personas.find(p => p.cod_persona === estructura.cod_persona_padre)?.fullName?.toUpperCase() || 'N/A'}
                        </CTableDataCell>
                      </>
                    ) : (
                      <>
                        <CTableDataCell style={{ borderRight: '1px solid #ddd' }} className="text-center">
                          {personas.find(p => p.cod_persona === estructura.cod_persona_padre)?.fullName?.toUpperCase() || 'N/A'}
                        </CTableDataCell>
                        <CTableDataCell style={{ borderRight: '1px solid #ddd' }} className="text-center">
                          {personas.find(p => p.cod_persona === estructura.cod_persona_estudiante)?.fullName?.toUpperCase() || 'N/A'}
                        </CTableDataCell>
                      </>
                    )}

                    <CTableDataCell style={{ borderRight: '1px solid #ddd' }} className="text-center">
                      {tipoRelacion.find(tipo => tipo.Cod_tipo_relacion === estructura.cod_tipo_relacion)?.tipo_relacion?.toUpperCase() || 'N/A'}
                    </CTableDataCell>

                    <CTableDataCell style={{ borderRight: '1px solid #ddd' }} className="text-center">
                      {estructura.descripcion.toUpperCase()}
                    </CTableDataCell>

                    <CTableDataCell className="text-center">
  <div className="d-flex justify-content-center">
    {esEstudiante && canUpdate && (
      <CButton
        color="warning"
        onClick={() => handleOpenUpdateModal(estructura)}
        style={{ marginRight: '10px' }}
      >
        <CIcon icon={cilPen} />
      </CButton>
    )}
    {esEstudiante && canDelete && (
      <CButton color="danger" onClick={() => openDeleteModal(estructura)}>
        <CIcon icon={cilTrash} />
      </CButton>
    )}
  </div>
</CTableDataCell>
                  </CTableRow>
                ))
              ) : (
                <CTableRow>
                  <CTableDataCell colSpan="6" className="text-center">
                    No hay estructuras familiares para esta persona.
                  </CTableDataCell>
                </CTableRow>
              )}
            </CTableBody>
          </CTable>
        </div>
      </div>

{/****************************************************PAGINACION*****************************************************************/}

<div
  className="pagination-container"
  style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
>
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
      disabled={currentPage === Math.ceil(estructurasFamiliares.length / recordsPerPage)} // Desactiva si es la última página
      onClick={() => paginate(currentPage + 1)} // Páginas siguientes
    >
      Siguiente
    </CButton>
  </CPagination>
  <span style={{ marginLeft: '10px' }}>
    Página {currentPage} de {Math.ceil(estructurasFamiliares.length / recordsPerPage)}
  </span>
</div>

{/*********************************************************************************************************************************/}



<CModal 
  visible={modalVisible} 
  onClose={() => setModalVisible(false)} 
  backdrop="static" 
  size="lg" // ✅ Aumenta el tamaño del modal
>
  <CModalHeader closeButton>
    <CModalTitle>Nueva Estructura Familiar</CModalTitle>
  </CModalHeader>
  <CModalBody>
    {/* Mostrar el nombre de la persona seleccionada */}
    <div style={{ marginBottom: '10px', border: '1px solid #dcdcdc', padding: '10px', backgroundColor: '#f9f9f9' }}>
      <strong>PERSONA:</strong> {personaSeleccionada 
        ? `${personaSeleccionada.Nombre.toUpperCase()} ${personaSeleccionada.Segundo_nombre?.toUpperCase() || ''} ${personaSeleccionada.Primer_apellido.toUpperCase()} ${personaSeleccionada.Segundo_apellido?.toUpperCase() || ''}` 
        : 'Información no disponible'}
    </div>

    <CForm>
      {/* Campo de búsqueda con lista de resultados dentro del input */}
      <div className="mb-3" style={{ position: 'relative' }}>
        <CInputGroup className="mb-3">
          <CInputGroupText>{rolActual === 'ESTUDIANTE' ? 'Padre/Tutor' : 'Estudiante'}</CInputGroupText>
          <CFormInput
            type="text"
            value={buscadorRelacion}
            onChange={handleBuscarRelacion}
            placeholder={`Buscar por DNI o nombre (${rolActual === 'ESTUDIANTE' ? 'Padre/Tutor' : 'Estudiante'})`}
            autoComplete="off" // ✅ Evita sugerencias automáticas del navegador
            style={{ position: 'relative' }}
          />
        </CInputGroup>

        {/* Lista de búsqueda dentro del input */}
        {isDropdownOpen && personasFiltradas.length > 0 && (
          <div className="lista-personas" style={{ 
            position: 'absolute', 
            top: '100%', 
            left: 0, 
            width: '100%', 
            backgroundColor: 'white', 
            border: '1px solid #ccc', 
            zIndex: 999, 
            maxHeight: '200px', 
            overflowY: 'auto' 
          }}>
            {personasFiltradas.map(persona => (
              <div
                key={persona.cod_persona}
                className="lista-item"
                style={{ padding: '8px', cursor: 'pointer' }}
                onClick={() => handleSeleccionarPersona(persona)}
              >
                {persona.dni_persona} - {persona.fullName}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Selector de Tipo Relación */}
      <CInputGroup className="mt-3">
        <CInputGroupText>Tipo Relación</CInputGroupText>
        <CFormSelect
          value={nuevaEstructura.cod_tipo_relacion}
          onChange={e => setNuevaEstructuraFamiliar(prev => ({
            ...prev,
            cod_tipo_relacion: e.target.value,
          }))}
        >
          <option value="">Tipo de Relación</option>
          {tipoRelacion.map(tipo => (
            <option key={tipo.Cod_tipo_relacion} value={tipo.Cod_tipo_relacion}>
              {tipo.tipo_relacion.toUpperCase()}
            </option>
          ))}
        </CFormSelect>
      </CInputGroup>

      {/* Campo de Descripción con validaciones */}
      <CInputGroup className="mt-3">
        <CInputGroupText>Descripción</CInputGroupText>
        <CFormInput
          type="text"
          value={nuevaEstructura.descripcion}
          onChange={(e) => {
            const value = e.target.value.toUpperCase();
            if (/(.)\1{2,}/.test(value)) {
              setErrorMessages(prev => ({
                ...prev,
                descripcion: 'La descripción no puede contener más de tres letras repetidas consecutivas.',
              }));
              return;
            }
            if (/[^A-Za-záéíóúÁÉÍÓÚñÑ0-9\s\-.,]/.test(value)) {
              setErrorMessages(prev => ({
                ...prev,
                descripcion: 'La descripción solo puede contener letras, números, acentos, espacios, guiones y puntos.',
              }));
              return;
            }
            if (/\s{2,}/.test(value)) {
              setErrorMessages(prev => ({
                ...prev,
                descripcion: 'La descripción no puede contener más de un espacio consecutivo.',
              }));
              return;
            }
            setNuevaEstructuraFamiliar(prev => ({
              ...prev,
              descripcion: value,
            }));
            setErrorMessages(prev => ({ ...prev, descripcion: '' }));
          }}
          placeholder="Descripción de la relación"
          required
        />
      </CInputGroup>

      {/* Mensaje de error en descripción */}
      {errorMessages.descripcion && (
        <div className="error-message" style={{ marginBottom: '10px', color: 'red', fontSize: '0.850rem' }}>
          {errorMessages.descripcion}
        </div>
      )}
    </CForm>
  </CModalBody>

  <CModalFooter>
    <CButton style={{ backgroundColor: '#6c757d', color: 'white', borderColor: '#6c757d' }} onClick={() => setModalVisible(false)}>
      Cancelar
    </CButton>
    <CButton style={{ backgroundColor: '#4B6251', color: 'white', borderColor: '#4B6251' }} onClick={handleCreateEstructura}>
      <CIcon icon={cilSave} /> Guardar
    </CButton>
  </CModalFooter>
</CModal>



{/********************************* MODAL PARA ACTUALIZAR ESTRUCTURA ***************************************************/}

<CModal 
  visible={modalUpdateVisible} 
  onClose={() => setModalUpdateVisible(false)} 
  backdrop="static" 
  size="lg" 
>
  <CModalHeader closeButton>
    <CModalTitle>Actualizar Estructura Familiar</CModalTitle>
  </CModalHeader>
  <CModalBody>
    {/* Mostrar el nombre de la persona seleccionada */}
    <div style={{ marginBottom: '10px', border: '1px solid #dcdcdc', padding: '10px', backgroundColor: '#f9f9f9' }}>
      <strong>PERSONA:</strong> {personaSeleccionada 
        ? `${personaSeleccionada.Nombre.toUpperCase()} ${personaSeleccionada.Segundo_nombre?.toUpperCase() || ''} ${personaSeleccionada.Primer_apellido.toUpperCase()} ${personaSeleccionada.Segundo_apellido?.toUpperCase() || ''}` 
        : 'Información no disponible'}
    </div>

    <CForm>
      {/* Campo oculto para cod_persona */}
      <input type="hidden" name="cod_persona" value={personaSeleccionada?.cod_persona} />

{/* Campo de búsqueda sin dependencia de rol */}
<div className="mb-3" style={{ position: 'relative' }}>
  <CInputGroup className="mb-3">
    <CInputGroupText>Persona Relacionada</CInputGroupText>
    <CFormInput
      type="text"
      value={buscadorRelacion}
      onChange={handleBuscarRelacion}  
      placeholder="Buscar por DNI o nombre"
      autoComplete="off"
    />
  </CInputGroup>

  {/* Lista desplegable debajo del input */}
  {isDropdownOpen && personasFiltradas.length > 0 && (
    <div className="lista-personas" style={{
      position: 'absolute',
      top: '100%',
      left: 0,
      width: '100%',
      backgroundColor: 'white',
      border: '1px solid #ccc',
      zIndex: 999,
      maxHeight: '200px',
      overflowY: 'auto',
      boxShadow: '0px 4px 6px rgba(0,0,0,0.1)',
    }}>
      {personasFiltradas.map(persona => (
        <div
          key={persona.cod_persona}
          className="lista-item"
          style={{ padding: '8px', cursor: 'pointer' }}
          onClick={() => handleSeleccionarPersona(persona)}
        >
          {persona.dni_persona} - {persona.fullName}
        </div>
      ))}
    </div>
  )}
</div>

      {/* Resto del formulario */}
      <CInputGroup className="mt-3">
        <CInputGroupText>Tipo Relación</CInputGroupText>
        <CFormSelect
          value={estructuraToUpdate.cod_tipo_relacion}
          onChange={e => setEstructuraToUpdate(prev => ({
            ...prev,
            cod_tipo_relacion: e.target.value,
          }))}
        >
          <option value="">Tipo de Relación</option>
          {tipoRelacion.map(tipo => (
            <option key={tipo.Cod_tipo_relacion} value={tipo.Cod_tipo_relacion}>
              {tipo.tipo_relacion.toUpperCase()}
            </option>
          ))}
        </CFormSelect>
      </CInputGroup>

      {/* Campo de Descripción */}
      <CInputGroup className="mt-3">
        <CInputGroupText>Descripción</CInputGroupText>
        <CFormInput
          type="text"
          value={estructuraToUpdate.descripcion}
          onChange={(e) => {
            const value = e.target.value.toUpperCase();
            if (/(.)\1{2,}/.test(value)) {
              setErrorMessages(prev => ({
                ...prev,
                descripcion: 'La descripción no puede contener más de tres letras repetidas consecutivas.',
              }));
              return;
            }
            if (/[^A-Za-záéíóúÁÉÍÓÚñÑ0-9\s\-.,]/.test(value)) {
              setErrorMessages(prev => ({
                ...prev,
                descripcion: 'La descripción solo puede contener letras, números, acentos, espacios, guiones y puntos.',
              }));
              return;
            }
            if (/\s{2,}/.test(value)) {
              setErrorMessages(prev => ({
                ...prev,
                descripcion: 'La descripción no puede contener más de un espacio consecutivo.',
              }));
              return;
            }
            setEstructuraToUpdate(prev => ({
              ...prev,
              descripcion: value,
            }));
            setErrorMessages(prev => ({ ...prev, descripcion: '' }));
          }}
          placeholder="Descripción de la relación"
          required
        />
      </CInputGroup>

      {/* Mensaje de error en descripción */}
      {errorMessages.descripcion && (
        <div className="error-message" style={{ marginBottom: '10px', color: 'red', fontSize: '0.850rem' }}>
          {errorMessages.descripcion}
        </div>
      )}
    </CForm>
  </CModalBody>

  <CModalFooter>
    <CButton style={{ backgroundColor: '#6c757d', color: 'white', borderColor: '#6c757d' }} onClick={() => setModalUpdateVisible(false)}>
      Cancelar
    </CButton>
    <CButton style={{ backgroundColor: '#4B6251', color: 'white', borderColor: '#4B6251' }} onClick={handleUpdateEstructura}>
      <CIcon icon={cilPen} /> Actualizar
    </CButton>
  </CModalFooter>
</CModal>



{/****************************************FIN DEL MODAL DE ACTUALIZAR********************************************************/}

{/******************************************MODAL PARA ELIMINAR ESTRUCTURA*********************************************/}
      <CModal visible={modalDeleteVisible} onClose={() => setModalDeleteVisible(false)} backdrop="static">
        <CModalHeader>
          <CModalTitle>Eliminar Estructura Familiar</CModalTitle>
        </CModalHeader>
        <CModalBody>
          ¿Estás seguro de que deseas eliminar la estructura familiar?
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setModalDeleteVisible(false)}>
            Cancelar
          </CButton>
          <CButton color="danger" onClick={handleDeleteEstructura}>
            Eliminar
          </CButton>
        </CModalFooter>
      </CModal>
{/******************************************FIN MODAL PARA ELIMINAR ESTRUCTURA*********************************************/}


    </CContainer>
  )
}
export default ListaEstructura