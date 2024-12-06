import React, { useState, useEffect } from 'react'
import { CIcon } from '@coreui/icons-react'
import { cilSearch, cilBrushAlt, cilPen, cilTrash, cilPlus, cilDescription, cilArrowLeft } from '@coreui/icons'
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
  const [estructuraToUpdate, setEstructuraToUpdate] = useState({});
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





  const [codPersona, setCodPersona] = useState('');



  
  // Navegación y ubicación

  const volverAListaPersonas = () => {
    navigate('/ListaPersonas');
  };

  const location = useLocation();
  const navigate = useNavigate();
  const { personaSeleccionada } = location?.state || {};

  // Asignar rol basado en persona seleccionada
  useEffect(() => {
    if (personaSeleccionada) {
      setRolActual(personaSeleccionada.cod_tipo_persona === 1 ? 'ESTUDIANTE' : 'PADRE');
    }
  }, [personaSeleccionada]);


{/* ------------------------------------------------------------------------------------------------------------------------------------------------- */}

  useEffect(() => {
    if (personaSeleccionada) {
      const cargarEstructurasFamiliares = async () => {
        const respuesta = await fetch(`http://localhost:4000/api/estructuraFamiliar/verEstructurasFamiliares/${personaSeleccionada.cod_persona}`);
        const datos = await respuesta.json();
        setEstructurasFamiliares(datos);
      };
      cargarEstructurasFamiliares();
    }
  }, [personaSeleccionada]);

  useEffect(() => {
    if (modalVisible === false && personaSeleccionada) {
      // Cargar de nuevo las estructuras familiares cuando se cierra el modal y se ha añadido una nueva estructura.
      const cargarEstructurasFamiliares = async () => {
        const respuesta = await fetch(`http://localhost:4000/api/estructuraFamiliar/verEstructuraFamiliar/${personaSeleccionada.cod_persona}`);
        const datos = await respuesta.json();
        setEstructurasFamiliares(datos);
      };
      cargarEstructurasFamiliares();
    }
  }, [modalVisible, personaSeleccionada]);
  
{/* -------------------------------------------------------------------------------------------------------------------------------------------- */}


  // Cargar datos iniciales
  useEffect(() => {
    const cargarPersonas = async () => {
      const respuesta = await fetch('http://localhost:4000/api/estructuraFamiliar/verPersonas');
      const datos = await respuesta.json();
      setPersonas(datos);
    };
    cargarPersonas();
  }, []);

  // Filtrar personas para el buscador
  useEffect(() => {
    const resultados = personas.filter(
      (persona) =>
        persona.fullName?.toUpperCase().includes(buscadorRelacion.toUpperCase()) ||
        persona.dni_persona?.includes(buscadorRelacion)
    );
    setPersonasFiltradas(resultados);
    setIsDropdownOpen(buscadorRelacion.length > 0 && resultados.length > 0);
  }, [buscadorRelacion, personas]);

  
{/* ------------------------------------------------------------------------------------------------------------------------------------- */}
const handleBuscarRelacion = (e) => {
  const filtro = e.target.value.toLowerCase();
  setBuscadorRelacion(filtro);

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

const handleSeleccionarPersona = (persona) => {
  setCodPersonaSeleccionada(persona.cod_persona);
  setBuscadorRelacion(`${persona.dni_persona} - ${persona.fullName}`);
  setNuevaEstructuraFamiliar(prev => ({
    ...prev,
    [rolActual === 'ESTUDIANTE' ? 'cod_persona_padre' : 'cod_persona_estudiante']: persona.cod_persona,
  }));
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

  {/* Función para mostrar la estructura familiar  */}
  const fetchEstructuraFamiliar = async () => {
    try {
      const response = await fetch(
        'http://localhost:4000/api/estructuraFamiliar/verEstructuraFamiliar',
      )
      const data = await response.json()
      console.log(data)

      // Verifica que 'data' sea un array antes de intentar mapearlo
      if (Array.isArray(data)) {
        const dataWithIndex = data.map((estructura, index) => ({
          ...estructura,
          originalIndex: index + 1, // Agrega un índice original a cada estructura
        }))
        console.log(dataWithIndex)
        setEstructuraFamiliar(dataWithIndex) // Actualiza el estado con los datos modificados
      } else {
        console.error('La respuesta no es un array:', data) 
      }
    } catch (error) {
      console.error('Error al obtener la estructura familiar:', error)
    }
  }

  {/* ------------------------------------------------------------------------------------------------------------------------------------------------ */}
 

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
      fetchEstructuraFamiliar(); // Actualizar la lista de estructuras familiares
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

{/* Función para actualizar estructura */}
const handleUpdateEstructura = async () => {


  try {
    const response = await fetch(`http://localhost:4000/api/estructuraFamiliar/actualizarEstructuraFamiliar/${estructuraToUpdate.Cod_genealogia}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        descripcion: descripcionCapitalizado,
        cod_persona_padre: estructuraToUpdate.cod_persona_padre,
        cod_persona_estudiante: estructuraToUpdate.cod_persona_estudiante,
        cod_tipo_relacion: estructuraToUpdate.cod_tipo_relacion,
      }),
    });

    if (response.ok) {
      fetchEstructuraFamiliar();
      setModalUpdateVisible(false);
      resetEstructuraToUpdate();
      setHasUnsavedChanges(false);
      swal.fire({
        icon: 'success',
        title: 'Actualización exitosa',
        text: 'La estructura familiar ha sido actualizada correctamente.',
      });
    } else {
      const errorMessage = await response.text();
      swal.fire({
        icon: 'error',
        title: 'Error',
        text: `No se pudo actualizar la estructura familiar: ${errorMessage}`,
      });
    }
  } catch (error) {
    console.error('Error al actualizar la estructura familiar:', error);
    swal.fire({
      icon: 'error',
      title: 'Error inesperado',
      text: 'Ocurrió un error al intentar actualizar la estructura familiar.',
    });
  }
};


  {/* Fin de la función para actualizar estructura */}

  const resetEstructuraToUpdate = () => {
    setEstructuraToUpdate({ descripcion: '', cod_persona_padre: '', cod_persona_estudiante: '', cod_tipo_relacion: ''  });
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
        fetchEstructuraFamiliar();
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
  // Configurar la estructura a actualizar
  setEstructuraToUpdate({
    ...estructura,
    descripcion: estructura.descripcion || '',
    cod_persona_padre: estructura.cod_persona_padre || '',
    cod_persona_estudiante: estructura.cod_persona_estudiante || '',
    cod_tipo_relacion: estructura.cod_tipo_relacion || '',
    Cod_genealogia: estructura.Cod_genealogia || '',
    nombreEstudiante: personas.find(persona => persona.cod_persona === estructura.cod_persona_estudiante)?.fullName || '',
    nombrePadre: personas.find(persona => persona.cod_persona === estructura.cod_persona_padre)?.fullName || '',
  });

  // Mostrar el modal de actualización
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
  // Función de búsqueda
  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1); // Volver a la primera página cuando se cambia el término de búsqueda
  };

  // Filtrado de estructura familiar
  const searchEstructuraFamiliar = (searchTerm) => {
    return estructuraFamiliar.filter((estructura) => {
      const tipoRelacionTexto = tipoRelacion.find((tipo) => tipo.Cod_tipo_relacion === estructura.cod_tipo_relacion)?.tipo_relacion.toUpperCase() || 'N/D';
      const padreTexto = personas.find((persona) => persona.cod_persona === estructura.cod_persona_padre)?.fullName.toUpperCase() || 'N/D';
      const estudianteTexto = personas.find((persona) => persona.cod_persona === estructura.cod_persona_estudiante)?.fullName.toUpperCase() || 'N/D';
      const descripcionTexto = estructura.descripcion?.toUpperCase() || 'N/D';

      return (
        padreTexto.includes(searchTerm.toUpperCase()) ||
        estudianteTexto.includes(searchTerm.toUpperCase()) ||
        tipoRelacionTexto.includes(searchTerm.toUpperCase()) ||
        descripcionTexto.includes(searchTerm.toUpperCase())
      );
    });
  };

  const filteredEstructuraFamiliar = searchEstructuraFamiliar(searchTerm);

  // Paginación
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredEstructuraFamiliar.slice(indexOfFirstRecord, indexOfLastRecord);

  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= Math.ceil(filteredEstructuraFamiliar.length / recordsPerPage)) {
      setCurrentPage(pageNumber);
    }
  };

  // Función para generar reporte PDF
  const ReporteEstructuraPDF = (estructuraFamiliar, personas, tipoRelacion) => {
    const doc = new jsPDF()
    const tableData = estructuraFamiliar.map((estructura) => {
      const estudiante = personas.find(p => p.cod_persona === estructura.cod_persona_estudiante)?.fullName || 'N/A'
      const padre = personas.find(p => p.cod_persona === estructura.cod_persona_padre)?.fullName || 'N/A'
      const tipoRel = tipoRelacion.find(tipo => tipo.Cod_tipo_relacion === estructura.cod_tipo_relacion)?.tipo_relacion || 'N/A'
      return [
        estudiante,
        padre,
        tipoRel,
        estructura.descripcion,
      ]
    })
  
    doc.autoTable({
      head: [['Estudiante', 'Padre/Tutor', 'Tipo de Relación', 'Descripción']],
      body: tableData,
    })
  
    doc.save('estructura_familiar.pdf')
  }
  
  // Función para generar reporte Excel
  const ReporteEstructuraExcel = (estructuraFamiliar, personas, tipoRelacion) => {
    const tableData = estructuraFamiliar.map((estructura) => {
      const estudiante = personas.find(p => p.cod_persona === estructura.cod_persona_estudiante)?.fullName || 'N/A'
      const padre = personas.find(p => p.cod_persona === estructura.cod_persona_padre)?.fullName || 'N/A'
      const tipoRel = tipoRelacion.find(tipo => tipo.Cod_tipo_relacion === estructura.cod_tipo_relacion)?.tipo_relacion || 'N/A'
      return {
        Estudiante: estudiante,
        'Padre/Tutor': padre,
        'Tipo de Relación': tipoRel,
        Descripción: estructura.descripcion,
      }
    })
  
    const worksheet = XLSX.utils.json_to_sheet(tableData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Estructura Familiar")
    XLSX.writeFile(workbook, 'estructura_familiar.xlsx')
  }
  
  
  const handleGeneratePDF = () => {
    generatePDF(filteredEstructuraFamiliar, personas, tipoRelacion)
  }
  
  const handleGenerateExcel = () => {
    generateExcel(filteredEstructuraFamiliar, personas, tipoRelacion)
  }
{/******************************************************************************************************************************************/}  

{/* -------------------------------------------------------------------------------------------------------------------------------- */}
  
    // Verificar permisos
    if (!canSelect) {
      return <AccessDenied />;
    }
{/*------------------------------------------------------------------------------------------------------------------------------------*/}

return (
    <CContainer>
      <CRow className="align-items-center mb-5">
      <CCol xs="8" md="9">
    {/* Título de la página */}
    <h1 className="mb-0">Estructura Familiar</h1>
    {/* Nombre de la persona seleccionada */}
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
        
        <CCol xs="4" md="3" className="text-end d-flex flex-column flex-md-row justify-content-md-end align-items-md-center">
  <CButton color="secondary" onClick={volverAListaPersonas} style={{ marginRight: '10px', minWidth: '120px' }}>
    <CIcon icon={cilArrowLeft} /> Personas 
  </CButton>
  <CButton
        style={{ backgroundColor: '#4B6251', color: 'white', minWidth: '120px' }}
        className="mb-3 mb-md-0 me-md-3"
        onClick={handleModalOpen} // Abre el modal al hacer clic
      >
        <CIcon icon={cilPlus} /> Nuevo
      </CButton>
        <CDropdown>
          <CDropdownToggle style={{ backgroundColor: '#6C8E58', color: 'white' }}>
            Reporte
          </CDropdownToggle>
          <CDropdownMenu>
            <CDropdownItem onClick={ReporteEstructuraExcel}>Descargar en Excel</CDropdownItem>
            <CDropdownItem onClick={ReporteEstructuraPDF}>Descargar en PDF</CDropdownItem>
          </CDropdownMenu>
        </CDropdown>
</CCol>

      </CRow>
      {/* Filtro de búsqueda y selección de registros */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <CInputGroup style={{ maxWidth: '400px' }}>
          <CInputGroupText>Buscar</CInputGroupText>
          <CFormInput
            placeholder="Buscar"
            onChange={handleSearch}
            value={searchTerm}
          />
          <CButton
            style={{ backgroundColor: '#cccccc', color: 'black' }}
            onClick={() => {
              setSearchTerm('')
              setCurrentPage(1)
            }}
          >
            Limpiar
          </CButton>
        </CInputGroup>
        <div className="d-flex align-items-center">
          <label htmlFor="recordsPerPageSelect" className="mr-2">
            Mostrar
          </label>
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
        <CTableHeaderCell className="text-center">Acciones</CTableHeaderCell>
      </CTableRow>
    </CTableHead>
    <CTableBody>
      {estructurasFamiliares.length > 0 ? (
        estructurasFamiliares.map((estructura, index) => (
          <CTableRow key={estructura.cod_estructura}>
            <CTableDataCell style={{ borderRight: '1px solid #ddd' }} className="text-center">{index + 1}</CTableDataCell>
            {rolActual === 'ESTUDIANTE' ? (
              <>
                {/* Estudiante */}
                <CTableDataCell style={{ borderRight: '1px solid #ddd' }} className="text-center">
                  {`${personas.find(p => p.cod_persona === estructura.cod_persona_estudiante)?.fullName?.toUpperCase() || 'N/A'}`}
                </CTableDataCell>
                {/* Padre/Tutor */}
                <CTableDataCell style={{ borderRight: '1px solid #ddd' }} className="text-center">
                  {personas.find(p => p.cod_persona === estructura.cod_persona_padre)?.fullName?.toUpperCase() || 'N/A'}
                </CTableDataCell>
              </>
            ) : (
              <>
                {/* Padre/Tutor */}
                <CTableDataCell style={{ borderRight: '1px solid #ddd' }} className="text-center">
                  {personas.find(p => p.cod_persona === estructura.cod_persona_padre)?.fullName?.toUpperCase() || 'N/A'}
                </CTableDataCell>
                {/* Estudiante */}
                <CTableDataCell style={{ borderRight: '1px solid #ddd' }} className="text-center">
                  {`${personas.find(p => p.cod_persona === estructura.cod_persona_estudiante)?.fullName?.toUpperCase() || 'N/A'}`}
                </CTableDataCell>
              </>
            )}
            {/* Tipo de Relación */}
            <CTableDataCell style={{ borderRight: '1px solid #ddd' }} className="text-center">
              {tipoRelacion.find(tipo => tipo.Cod_tipo_relacion === estructura.cod_tipo_relacion)?.tipo_relacion?.toUpperCase() || 'N/A'}
            </CTableDataCell>
            {/* Descripción */}
            <CTableDataCell style={{ borderRight: '1px solid #ddd' }} className="text-center">
              {estructura.descripcion.toUpperCase()}
            </CTableDataCell>
            <CTableDataCell className="text-center">
              <div className="d-flex justify-content-center">


              {canUpdate && (
                <CButton
                  color="warning"
                  onClick={() => handleOpenUpdateModal(estructura)}
                  style={{ marginRight: '10px' }}
                >
                  <CIcon icon={cilPen} />
                </CButton>

              )}

              
{canDelete && (
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
          <CTableDataCell colSpan="6" className="text-center">No hay estructuras familiares para esta persona.</CTableDataCell>
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



{/* Modal para agregar estructura familiar */}
<CModal visible={modalVisible} onClose={() => setModalVisible(false)} backdrop="static">
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

      {/* Campo oculto para cod_persona_estudiante */}
      <input type="hidden" name="cod_persona_estudiante" value={codPersonaEstudiante} />

      {/* Campo oculto para cod_persona_padre */}
      <input type="hidden" name="cod_persona_padre" value={codPersonaPadre} />

 {/* Campo de búsqueda para persona */}

 <div className="mb-3">
            <CInputGroup className="mb-3">
              <CInputGroupText>{rolActual === 'ESTUDIANTE' ? 'Padre/Tutor' : 'Estudiante'}</CInputGroupText>
              <CFormInput
                type="text"
                value={buscadorRelacion}
                onChange={handleBuscarRelacion}
                placeholder={`Buscar por DNI o nombre (${rolActual === 'ESTUDIANTE' ? 'Padre/Tutor' : 'Estudiante'})`}
              />
              <CButton type="button">
                <CIcon icon={cilSearch} />
              </CButton>
            </CInputGroup>

            {isDropdownOpen && personasFiltradas.length > 0 && (
              <div className="dropdown-menu show" style={{ position: 'absolute', zIndex: 999, top: '100%', left: 0, width: '100%' }}>
                {personasFiltradas.map(persona => (
                  <div
                    key={persona.cod_persona}
                    className="dropdown-item"
                    style={{ cursor: 'pointer' }}
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

{/* Campo de Descripción */}
<CInputGroup className="mt-3">
  <CInputGroupText>Descripción</CInputGroupText>
  <CFormInput
    type="text"
    value={nuevaEstructura.descripcion}
    onChange={(e) => {
      const value = e.target.value.toUpperCase(); // Convertir a mayúsculas

      // Bloquear secuencias de más de tres letras repetidas
      if (/(.)\1{2,}/.test(value)) {
        setErrorMessages((prevErrors) => ({
          ...prevErrors,
          descripcion: 'La descripción no puede contener más de tres letras repetidas consecutivas.',
        }));
        return;
      }

      // Bloquear caracteres especiales, solo letras, números, espacios, guiones y puntos permitidos
      if (/[^A-Za-záéíóúÁÉÍÓÚñÑ0-9\s\-.,]/.test(value)) {
        setErrorMessages((prevErrors) => ({
          ...prevErrors,
          descripcion: 'La descripción solo puede contener letras, números, acentos, espacios, guiones y puntos.',
        }));
        return;
      }

      // Bloquear más de un espacio consecutivo
      if (/\s{2,}/.test(value)) {
        setErrorMessages((prevErrors) => ({
          ...prevErrors,
          descripcion: 'La descripción no puede contener más de un espacio consecutivo.',
        }));
        return;
      }

      // Validar longitud mínima y campo vacío
      const erroresTemp = { ...errorMessages };
      if (!value.trim()) {
        erroresTemp.descripcion = 'La descripción no puede estar vacía.';
      } else if (value.length < 2) {
        erroresTemp.descripcion = 'La descripción debe tener al menos 2 caracteres.';
      } else {
        erroresTemp.descripcion = '';
      }

      // Actualizar estado con el valor en mayúsculas
      setNuevaEstructuraFamiliar((prev) => ({
        ...prev,
        descripcion: value,
      }));
      setErrorMessages(erroresTemp);
    }}
    placeholder="Descripción de la relación"
    required
  />
</CInputGroup>
{errorMessages.descripcion && (
  <div className="error-message" style={{ marginBottom: '10px', color: 'red', fontSize: '0.850rem' }}>
    {errorMessages.descripcion}
  </div>
)}
<style jsx>{`
  .error-message {
    color: red;
    font-size: 12px;  /* Tamaño de texto más pequeño */
    margin-top: 4px;  /* Menor distancia entre el input y el mensaje de error */
    margin-bottom: 0;
    margin-left: 12px;  /* Para alinearlo con el texto del input */
  }
`}</style>



    </CForm>
  </CModalBody>
  <CModalFooter>
    <CButton color="secondary" onClick={() => setModalVisible(false)}>Cerrar</CButton>
    <CButton color="primary" onClick={handleCreateEstructura}>Guardar</CButton>
  </CModalFooter>
</CModal>
{/* Fin del modal de agregar estructura familiar */}




{/********************************* MODAL PARA ACTUALIZAR ESTRUCTURA ***************************************************/}

{/* Modal para actualizar estructura familiar */}
<CModal visible={modalUpdateVisible} onClose={() => setModalUpdateVisible(false)} backdrop="static">
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

      {/* Campo de búsqueda para persona */}
      <div className="mb-3">
        <CInputGroup className="mb-3">
          <CInputGroupText>Buscar Persona</CInputGroupText>
          <CFormInput
            type="text"
            value={buscadorRelacion} // Asegura que use este estado
            onChange={(e) => setBuscadorRelacion(e.target.value)}
            placeholder="Buscar por DNI o nombre"
          />
          <CButton type="button">
            <CIcon icon={cilSearch} />
          </CButton>
        </CInputGroup>

        {/* Dropdown con resultados */}
        {isDropdownOpen && personasFiltradas.length > 0 && (
          <div className="dropdown-menu show" style={{ position: 'absolute', zIndex: 999, top: '100%', left: 0, width: '100%' }}>
            {personasFiltradas.map(persona => (
              <div
                key={persona.cod_persona}
                className="dropdown-item"
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  const nombreCompleto = [
                    persona.Nombre,
                    persona.Segundo_nombre,
                    persona.Primer_apellido,
                    persona.Segundo_apellido,
                  ].filter(Boolean).join(' '); // Combina nombre completo

                  // Actualiza el estado basado en el rol
                  if (rolActual === 'ESTUDIANTE') {
                    setEstructuraToUpdate(prev => ({
                      ...prev,
                      cod_persona_padre: persona.cod_persona, // Actualiza solo el campo cod_persona_padre
                    }));
                  } else {
                    setEstructuraToUpdate(prev => ({
                      ...prev,
                      cod_persona_estudiante: persona.cod_persona, // Actualiza solo el campo cod_persona_estudiante
                    }));
                  }

                  // Actualiza el valor del buscador sin que se limpie
                  setBuscadorRelacion(nombreCompleto);
                  setIsDropdownOpen(false);
                }}
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

      <CInputGroup className="mt-3">
        <CInputGroupText>Descripción</CInputGroupText>
        <CFormInput
          type="text"
          value={estructuraToUpdate.descripcion}
          onChange={e => setEstructuraToUpdate(prev => ({
            ...prev,
            descripcion: e.target.value.toUpperCase(),
          }))}
          placeholder="Descripción de la relación"
          required
        />
      </CInputGroup>
    </CForm>
  </CModalBody>
  <CModalFooter>
    <CButton color="secondary" onClick={() => setModalUpdateVisible(false)}>Cerrar</CButton>
    <CButton color="primary" onClick={handleUpdateEstructura}>Guardar</CButton>
  </CModalFooter>
</CModal>

{/****************************************FIN DEL MODAL DE ACTUALIZAR********************************************************/}

{/******************************************MODAL PARA ELIMINAR ESTRUCTURA*********************************************/}
      <CModal visible={modalDeleteVisible} onClose={() => setModalDeleteVisible(false)} backdrop="static">
        <CModalHeader>
          <CModalTitle>Eliminar Estructura Familiar</CModalTitle>
        </CModalHeader>
        <CModalBody>
          ¿Estás seguro de que deseas eliminar la estructura familiar con el código{' '}
          {estructuraToDelete.Cod_genealogia}?
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