import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { CIcon } from '@coreui/icons-react';
import { cilSearch,cilInfo, cilBrushAlt, cilPen, cilTrash, cilPlus, cilSave,cilDescription } from '@coreui/icons'; // Importar iconos específicos
import swal from 'sweetalert2';
import { left } from '@popperjs/core';
import jsPDF from 'jspdf';
import 'jspdf-autotable'; // Importa el plugin para tablas
import * as XLSX from 'xlsx';
import {
  CButton,
  CCard,
  CCardBody,
  CContainer,
  CForm,
  CFormInput,
  CFormSelect,
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
  CRow,
  CCol,
} from '@coreui/react';
import Swal from 'sweetalert2';
import usePermission from '../../../../context/usePermission';
import AccessDenied from "../AccessDenied/AccessDenied"

const ListaProfesores = () => {
  const { canSelect, loading, error, canDelete, canInsert, canUpdate } = usePermission('ListaProfesores');
  const [profesores, setProfesores] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalUpdateVisible, setModalUpdateVisible] = useState(false);
  const [modalDeleteVisible, setModalDeleteVisible] = useState(false);
  const [modalDetailsVisible, setModalDetailsVisible] = useState(false);
  const [modalReporteVisible, setModalReporteVisible] = useState(false);
  const [nuevoProfesor, setNuevoProfesor] = useState({
    Cod_profesor: '',
    cod_persona: '',
    Cod_grado_academico: '',
    Cod_tipo_contrato: '',
    Hora_entrada: '',
    Hora_salida: '',
    Fecha_ingreso: '',
    Fecha_fin_contrato: '',
    Años_experiencia: '',
  });
  const [profesorToUpdate, setProfesorToUpdate] = useState({});
  const [profesorToDelete, setProfesorToDelete] = useState({});
  const [profesorToReportar, setProfesorToReportar] = useState({});
  const [profesorDetails, setProfesorDetails] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [listaPersonas, setListaPersonas] = useState([]);
  const [listaTiposContrato, setListaTiposContrato] = useState([]);
  const [listaGradosAcademicos, setListaGradosAcademicos] = useState([]);
  const [currentPage, setCurrentPage] = useState(1); // Estado para la página actual
  const [recordsPerPage, setRecordsPerPage] = useState(5); // Hacer dinamico el número de registro de paginas
  const inputRef = useRef(null); // referencia para el input
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false); // Estado para detectar cambios sin guardar
  const [modalPDFVisible, setModalPDFVisible] = useState(false); // Nuevo estado para el modal de PDF

  useEffect(() => {
    fetchProfesores();
    fetchListaPersonas();
    fetchListaTiposContrato();
    fetchListaGradosAcademicos();
  }, []);


  const fetchListaPersonas = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/persona/verpersonas');
      const data = await response.json();
      console.log('Datos obtenidos de la API:', data); // Verificar estructura de la respuesta
  
      // Construimos `nombreCompleto` si no existe en los datos de la API
      const dataWithIndex = data.map((persona, index) => ({
        ...persona,
        // Creamos `nombreCompleto` concatenando nombre y apellidos
        nombreCompleto: persona.nombreCompleto || `${persona.Nombre} ${persona.Segundo_nombre} ${persona.Primer_apellido} ${persona.Segundo_Apellido}`.trim(),
        originalIndex: index + 1, // Guardamos el índice original
      }));
      
      setListaPersonas(dataWithIndex); // Guardamos los datos procesados en el estado
    } catch (error) {
      console.error('Error al obtener la lista de personas:', error);
    }
  };
  

  const getNombreCompleto = (codPersona) => {
    if (!listaPersonas.length) return 'Personas no disponibles'; // Mensaje alternativo si no hay personas
    const persona = listaPersonas.find((p) => p.cod_persona === codPersona);
    return persona ? persona.nombreCompleto : 'Persona no encontrada';
  };



// Función para manejar cambios en el input
const handleInputChange = (e, setFunction) => {
  const input = e.target;
  const cursorPosition = input.selectionStart; // Guarda la posición actual del cursor
  let value = input.value
    .toUpperCase() // Convertir a mayúsculas
    .trimStart(); // Evitar espacios al inicio

  // Validación: no permitir letras repetidas más de 4 veces seguidas
  const words = value.split(' ');
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
        return;
      }
    }
  }

  // Asigna el valor en el input manualmente para evitar el salto de transición
  input.value = value;

  // Establecer el valor con la función correspondiente
  setFunction(value);
  setHasUnsavedChanges(true); // Asegúrate de marcar que hay cambios sin guardar

  // Restaurar la posición del cursor
  requestAnimationFrame(() => {
    if (inputRef.current) {
      inputRef.current.setSelectionRange(cursorPosition, cursorPosition);
    }
  });
};

// Deshabilitar copiar y pegar
const disableCopyPaste =(e) => {
  e.preventDefault();
  swal.fire({
    icon: 'warning',
    title: 'Accion bloquear',
    text:'Copiar y pegar no esta permitido'
  });
  };


  
  // Función para cerrar el modal con advertencia si hay cambios sin guardar
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
      setHasUnsavedChanges(false); // Asegurarse de resetear aquí también
    }
  };

// Funciones auxiliares para resetear los campos específicos de cada modal
const resetNuevoProfesor = () => setNuevoProfesor('');
const resetProfesorToUpdate = () => setProfesorToUpdate('');

  const fetchListaTiposContrato = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/contratos/tiposContrato');
      const data = await response.json();
      setListaTiposContrato(data);
    } catch (error) {
      console.error('Error al obtener la lista de tipos de contrato:', error);
    }
  };
  
  const fetchListaGradosAcademicos = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/gradosAcademicos/verGradosAcademicos');
      const data = await response.json();
      setListaGradosAcademicos(data);
    } catch (error) {
      console.error('Error al obtener la lista de grados académicos:', error);
    }
  };
  const fetchProfesores = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/profesores/verprofesores');
      const data = await response.json();
      setProfesores(data);
    } catch (error) {
      console.error('Error al obtener los profesores:', error);
    }
  };
  
  const formatFecha = (fecha) => {
    if (!fecha) return 'Fecha no disponible';
    return new Date(fecha).toISOString().split('T')[0]; // Convierte a YYYY-MM-DD
  };



  

  const handleCreateProfesor = async () => {
    // Validación para campos vacíos
    if (
      !nuevoProfesor.cod_persona.trim() ||
      !nuevoProfesor.Cod_grado_academico.trim() ||
      !nuevoProfesor.Cod_tipo_contrato.trim() ||
      !nuevoProfesor.Hora_entrada.trim() ||
      !nuevoProfesor.Hora_salida.trim() ||
      !nuevoProfesor.Fecha_ingreso.trim() ||
      !nuevoProfesor.Fecha_fin_contrato.trim() ||
      !nuevoProfesor.Años_experiencia.trim()
    ) {
      swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Todos los campos deben de estar llenos',
      });
      return;
    }


// Verificar si ya existe un profesor con el mismo cod_persona
const duplicada = profesores.some((profesor) => {
  // Excluir al profesor actual de la comparación
  if (profesor.Cod_profesor === nuevoProfesor.Cod_profesor) {
    return false; // Ignora la comparación con el profesor actual
  }

  console.log(`Comparando: ${String(profesor.cod_persona)} con ${String(nuevoProfesor.cod_persona)}`);
  return String(profesor.cod_persona) === String(nuevoProfesor.cod_persona);
});

if (duplicada) {
  swal.fire({
    icon: 'error',
    title: 'Error',
    text: `La persona seleccionada ya está registrada como profesor`,
  });
  return; // Salir de la función si hay un duplicado
}


  
    // Validación para horas
    const horaEntrada = new Date(`1970-01-01T${nuevoProfesor.Hora_entrada}:00`);
    const horaSalida = new Date(`1970-01-01T${nuevoProfesor.Hora_salida}:00`);
  
    if (horaEntrada >= horaSalida) {
      swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'La hora de entrada no puede ser mayor o igual que la hora de salida.',
      });
      return;
    }
  
    // Validación para fechas
    const ingresoDate = new Date(nuevoProfesor.Fecha_ingreso);
    const finContratoDate = new Date(nuevoProfesor.Fecha_fin_contrato);
  
    if (ingresoDate > finContratoDate) {
      swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'La fecha de ingreso no puede ser mayor que la fecha de fin de contrato.',
      });
      return;
    }

  

  try {
    const response = await fetch('http://localhost:4000/api/profesores/crearprofesor', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(nuevoProfesor),
    });

    if (response.ok) {
      fetchProfesores();
      setModalVisible(false);
      resetNuevoProfesor();
      setNuevoProfesor({
        Cod_profesor: '',
        cod_persona: '',
        Cod_grado_academico: '',
        Cod_tipo_contrato: '',
        Hora_entrada: '',
        Hora_salida: '',
        Fecha_ingreso: '',
        Fecha_fin_contrato: '',
        Años_experiencia: '',
      });
      swal.fire({
        icon: 'success',
        title: '¡Éxito!',
        text: 'El Profesor se ha creado correctamente',
      });
    } else {
      console.error('Hubo un problema al crear el profesor:', response.statusText);
    }
  } catch (error) {
    console.error('Hubo un problema al crear el profesor:', error);
  }
};


const handleUpdateProfesor = async () => {
  // Validación para verificar que todos los campos estén llenos
  const camposVacios = Object.values(profesorToUpdate).some(value => value === '' || value === null || value === undefined);

  if (camposVacios) {
    swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Todos los campos deben estar llenos.',
    });
    return; // Salir de la función si hay campos vacíos
  }

  // Validación para fechas
  const ingresoDate = new Date(profesorToUpdate.Fecha_ingreso);
  const finContratoDate = new Date(profesorToUpdate.Fecha_fin_contrato);

  if (ingresoDate > finContratoDate) {
    swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'La fecha de ingreso no puede ser mayor que la fecha de fin de contrato.',
    });
    return;
  }

  const duplicada = profesores.some((profesor) => {
    // Excluir al profesor actual de la comparación
    if (profesor.Cod_profesor === profesorToUpdate.Cod_profesor) {
      return false; // Ignora la comparación con el profesor actual
    }
  
    console.log(`Comparando: ${String(profesor.cod_persona)} con ${String(profesorToUpdate.cod_persona)}`);
    return String(profesor.cod_persona) === String(profesorToUpdate.cod_persona);
  });
  
  if (duplicada) {
    swal.fire({
      icon: 'error',
      title: 'Error',
      text: `La persona seleccionada ya está registrada como profesor`,
    });
    return; // Salir de la función si hay un duplicado
  }

  // Validación para horas
  const [horaEntrada, minutosEntrada] = profesorToUpdate.Hora_entrada.split(':').map(Number);
  const [horaSalida, minutosSalida] = profesorToUpdate.Hora_salida.split(':').map(Number);

  // Validar que la hora de entrada no sea mayor que la hora de salida
  if (horaEntrada > horaSalida || (horaEntrada === horaSalida && minutosEntrada > minutosSalida)) {
    swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'La hora de entrada no puede ser mayor que la hora de salida.',
    });
    return;
  }

  try {
    // Enviar la solicitud para actualizar el profesor
    const response = await fetch('http://localhost:4000/api/profesores/actualizarprofesor', {
      method: 'PUT', // Método HTTP para actualización
      headers: {
        'Content-Type': 'application/json', // Tipo de contenido
      },
      body: JSON.stringify(profesorToUpdate), // Convertir el objeto profesorToUpdate a JSON
    });
    
        if (response.ok) {
          fetchProfesores(); // Recargar la lista de profesores
          setModalUpdateVisible(false); // Cerrar el modal de actualización
          setProfesorToUpdate({}); // Limpiar el objeto profesorToUpdate

          swal.fire({
            icon: 'success',
            title: '¡Éxito!',
            text: 'El profesor se ha actualizado correctamente',
          });
        } else {
          console.error('Error al actualizar el profesor:', response.statusText);
          swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo actualizar el profesor. Intente nuevamente.', // Mensaje de error
          });
        }
      } catch (error) {
        console.error('Error al actualizar el profesor:', error);

        // Manejar errores de conexión al servidor
        swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Hubo un error en la conexión al servidor.', // Mensaje de error de conexión
        });
      }
    };


  const handleDeleteProfesor = async () => {

    try {
      const response = await fetch('http://localhost:4000/api/profesores/eliminarprofesor', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ Cod_profesor: profesorToDelete.Cod_profesor }),
      });

      if (response.ok) {
        fetchProfesores();
        setModalDeleteVisible(false);

        setProfesorToDelete({});
        swal.fire({
          icon: 'success',
          title: '¡Éxito!',
          text: 'El profesor se ha eliminado correctamente',
        });
      } else {
        console.error('Hubo un problema al eliminar el profesor', response.statusText);
      }
    } catch (error) {
      console.error('Hubo un problema al eliminar el profesor', error);
    }
  };
    // Filtrar profesores según el término de búsqueda
    
// Filtrado de profesores solo cuando listaPersonas tiene elementos
// Filtrado de profesores basándonos en `nombreCompleto`
const filteredProfesores = listaPersonas.length > 0 
  ? profesores.filter(profesor => {
      const persona = listaPersonas.find(p => String(p.cod_persona).trim() === String(profesor.cod_persona).trim());
      const nombreCompleto = persona?.nombreCompleto?.toUpperCase().trim() || '';

      
      return nombreCompleto.includes(searchTerm.trim().toUpperCase());
    })
  : [];

// Lógica de paginación
const indexOfLastRecord = currentPage * recordsPerPage;
const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
const currentRecords = filteredProfesores.slice(indexOfFirstRecord, indexOfLastRecord);

console.log('Registros actuales en la página:', currentRecords); // Verificar registros paginados en la consola

 // Cambiar página
 const paginate = (pageNumber) => {
  if (pageNumber > 0 && pageNumber <= Math.ceil(filteredProfesores.length / recordsPerPage)) {
    setCurrentPage(pageNumber);
  }
}

   // Función para abrir el modal de actualización
   const openUpdateModal = (profesor) => {
    setProfesorToUpdate(profesor); // Cargar los datos del estado asistencia a actualizar
    setModalUpdateVisible(true); // Abrir el modal de actualización
    setHasUnsavedChanges(false); // Resetear el estado al abrir el modal
  };

  const openDeleteModal = (profesor) => {
    setProfesorToDelete(profesor); // Guardar el ciclo que se desea eliminar
    setModalDeleteVisible(true); // Abrir el modal de confirmación
  };


// Cambia el estado de la página actual después de aplicar el filtro
  // Función para manejar la búsqueda
  const handleSearch = (event) => {
    const input = event.target.value.toUpperCase(); // Convertir a mayúsculas
    const regex = /^[A-ZÑ\s]*$/; // Solo permite letras, espacios y la letra "Ñ"
    
    if (!regex.test(input) && input !== '') {
      swal.fire({
        icon: 'warning',
        title: 'Caracteres no permitidos',
        text: 'Solo se permiten letras y espacios.',
      });
      return searchTerm && nombreCompleto.includes(searchTerm.trim().toUpperCase());    }

    setSearchTerm(input);
    setCurrentPage(1); // Resetear a la primera página al buscar
  };


  const handleShowDetails = (profesor) => {
    setProfesorDetails(profesor);
    setModalDetailsVisible(true);
  };



//=========================================================== pdf y excel================================================

const handleExportPDF = () => {
  const doc = new jsPDF();
  doc.text('Reporte de Profesores', 10, 10); // Título del documento

  const tableData = profesores.map((profesor, index) => {
    const persona = listaPersonas.find(p => p.cod_persona === profesor.cod_persona);
    const nombreCompleto = persona ? `${persona.Nombre} ${persona.Primer_apellido}` : 'Desconocido';
    const gradoAcademico = listaGradosAcademicos.find(grado => grado.Cod_grado_academico === profesor.Cod_grado_academico)?.Descripcion || 'N/A';
    const tipoContrato = listaTiposContrato.find(tipo => tipo.Cod_tipo_contrato === profesor.Cod_tipo_contrato)?.Descripcion || 'N/A';

    return [
      index + 1,
      nombreCompleto,
      gradoAcademico,
      tipoContrato,
      profesor.Hora_entrada,
      profesor.Hora_salida,
      profesor.Años_experiencia,
    ];
  });

  doc.autoTable({
    head: [['#', 'Nombre', 'Grado Académico', 'Tipo de Contrato', 'Hora Entrada', 'Hora Salida', 'Años de Experiencia']],
    body: tableData,
  });

  doc.save('reporte_profesores.pdf'); // Guarda el archivo PDF
};




const handleExportExcel = () => {
  const formattedData = profesores.map((profesor, index) => {
    const persona = listaPersonas.find(p => p.cod_persona === profesor.cod_persona);
    const nombreCompleto = persona ? `${persona.Nombre} ${persona.Primer_apellido}` : 'Desconocido';
    const gradoAcademico = listaGradosAcademicos.find(grado => grado.Cod_grado_academico === profesor.Cod_grado_academico)?.Descripcion || 'N/A';
    const tipoContrato = listaTiposContrato.find(tipo => tipo.Cod_tipo_contrato === profesor.Cod_tipo_contrato)?.Descripcion || 'N/A';

    return {
      '#': index + 1,
      'Nombre': nombreCompleto,
      'Grado Académico': gradoAcademico,
      'Tipo de Contrato': tipoContrato,
      'Hora Entrada': profesor.Hora_entrada,
      'Hora Salida': profesor.Hora_salida,
      'Años de Experiencia': profesor.Años_experiencia,
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(formattedData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Profesores');

  XLSX.writeFile(workbook, 'reporte_profesores.xlsx'); // Guarda el archivo Excel
};



//=======================================================================================================
     // Verificar permisos
     if (!canSelect) {
      return <AccessDenied />;
    }



  
  return (
    <CContainer>
      {/*Contenedor del hi y boton "nuevo" */}
      <CRow className='align-items-center mb-5'>
      <CCol xs="8" md="9"> 
       {/* Titulo de la pagina */}
      <h1 className="mb-0">Lista de Profesores</h1>
      </CCol>

      <CCol xs="4" md="3" className="text-end d-flex flex-column flex-md-row justify-content-md-end align-items-md-center">
      {/* Botón "Nuevo" alineado a la derecha */}
      {/* Botón "Nuevo" alineado a la derecha */}

    {canInsert && (
      <CButton
        style={{ backgroundColor: '#4B6251', color: 'white' }} // Ajusta la altura para alinearlo con la barra de búsqueda
        className="mb-3 mb-md-0 me-md-3" // Margen inferior en pantallas pequeñas, margen derecho en pantallas grandes
        onClick={() => {setModalVisible(true); 
          setHasUnsavedChanges(false); // Resetear el estado al abrir el modal
        }}
        >

           <CIcon icon={cilPlus} /> {/* Ícono de "más" */}
            Nuevo
           </CButton>

          )}

           
{/*Boton reporte */}
<CButton
            style={{ backgroundColor: '#6C8E58', color: 'white' }}
            onClick={() => setModalPDFVisible(true)} // Abre el modal de PDF
          >
            <CIcon icon={cilDescription} /> Reporte
          </CButton>
     </CCol>
      </CRow>
       {/* Contenedor de la barra de búsqueda y el botón "Nuevo" */}
       <CRow className='align-items-center mt-4 mb-2'>
      
      {/* Barra de búsqueda */}
      <CCol xs="12" md="8" className='d-flex flex-wrap align-items-center'>
        <CInputGroup className="me-3" style={{width: '400px' }}>
        <CInputGroupText>
           <CIcon icon={cilSearch} /> 
        </CInputGroupText>
        <CFormInput placeholder="Buscar profesor..."
         onChange={handleSearch} 
         value={searchTerm} />

         {/* Botón para limpiar la búsqueda */}
      <CButton
            style={{border: '1px solid #ccc',
              transition: 'all 0.1s ease-in-out', // Duración de la transición
              backgroundColor: '#F3F4F7', // Color por defecto
              color: '#343a40' // Color de texto por defecto
            }}
            onClick={() => {
              setSearchTerm('');
              setCurrentPage(1);
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#E0E0E0'; // Color cuando el mouse sobre el boton "limpiar"
              e.currentTarget.style.color = 'black'; // Color del texto cuando el mouse sobre el boton "limpiar"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#F3F4F7'; // Color cuando el mouse no está sobre el boton "limpiar"
              e.currentTarget.style.color = '#343a40'; // Color de texto cuando el mouse no está sobre el boton "limpiar"
            }}
          >
            <CIcon icon={cilBrushAlt} /> Limpiar
          </CButton>
        
      </CInputGroup>
      </CCol>
{/*Selector dinamico a la par de la barra de busqueda */}
<CCol xs="12" md="4" className='text-md-end mt-2 mt-md-0'>
      <CInputGroup className='mt-2 mt-md-0' style={{width:'auto', display:'inline-block'}}>
        <div className='d-inline-flex align-items-center'>
          <span>Mostrar&nbsp;</span>
          <CFormSelect
            style={{width: '80px', display: 'inline-block', textAlign:'center'}}
            onChange={(e) => {
              const value = Number(e.target.value);
              setRecordsPerPage(value);
              setCurrentPage(1); // reinciar a la primera pagina cuando se cambia el numero de registros
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



{/* Tabla para mostrar Profesores*/}  
<div className="table-container" style={{ maxHeight: '400px', overflowY: 'scroll', marginBottom: '20px' }}>
      <CTable striped bordered hover>
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell>#</CTableHeaderCell>
            <CTableHeaderCell>Nombre </CTableHeaderCell>
            <CTableHeaderCell>Grado Académico</CTableHeaderCell>
            <CTableHeaderCell>Tipo de Contrato</CTableHeaderCell>
            <CTableHeaderCell>Hora Entrada</CTableHeaderCell>
            <CTableHeaderCell>Hora Salida</CTableHeaderCell>
            <CTableHeaderCell>Acciones</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
  {currentRecords.map((profesor, index) => {
    // Buscar la persona correspondiente al Cod_persona
    const persona = listaPersonas.find(p => p.cod_persona === profesor.cod_persona);
    const nombreCompleto = persona ? `${persona.Nombre} ${persona.Primer_apellido}` : 'Desconocido';
    
    return (
      <CTableRow key={profesor.Cod_profesor}>
        <CTableDataCell>{index + 1}</CTableDataCell>
        <CTableDataCell>{nombreCompleto}</CTableDataCell> {/* Cambiado para mostrar el nombre */}
       {/* Mostrar el nombre del grado académico en lugar del código */}
      <CTableDataCell>{listaGradosAcademicos.find(grado => grado.Cod_grado_academico === profesor.Cod_grado_academico)?.Descripcion || 'N/A'}</CTableDataCell>
      {/* Mostrar el nombre del tipo de contrato en lugar del código */}
      <CTableDataCell>{listaTiposContrato.find(tipo => tipo.Cod_tipo_contrato === profesor.Cod_tipo_contrato)?.Descripcion || 'N/A'}</CTableDataCell>
        <CTableDataCell>{profesor.Hora_entrada}</CTableDataCell>
        <CTableDataCell>{profesor.Hora_salida}</CTableDataCell>
        <CTableDataCell>


          {canUpdate && (
          <CButton
            style={{ backgroundColor: '#F9B64E',marginRight: '10px', marginBottom: '10px' }} onClick={() => openUpdateModal(profesor)}> 
            <CIcon icon={cilPen} />
          </CButton>
          )}


{canUpdate && (
          <CButton
            style={{ backgroundColor: '#E57368', marginRight: '10px', marginBottom: '10px' }} onClick={() => openDeleteModal(profesor)}>
            <CIcon icon={cilTrash} />
              </CButton>
                  )}
               <CButton
               
                  color="primary" style={{ marginRight: '10px', marginBottom: '10px' }}
                  onClick={() => {
                    setProfesorToReportar(profesor);
                    setModalReporteVisible(true);
                  }}
                >
                  
                  <CIcon icon={cilInfo} />
                </CButton>
               </CTableDataCell>
             </CTableRow>
           );
         })}
</CTableBody>
      </CTable>
     
      </div>
       {/* Paginación Fija */}
<div className="pagination-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <CPagination aria-label="Page navigation">
        <CButton
        style={{ backgroundColor: '#6f8173', color: '#D9EAD3' }}
        disabled={currentPage === 1} // Deshabilitar si estás en la primera página
        onClick={() => paginate(currentPage - 1)}>
        Anterior 
        </CButton>
        <CButton
          style={{ marginLeft: '10px',backgroundColor: '#6f8173', color: '#D9EAD3' }}
          disabled={currentPage === Math.ceil(filteredProfesores.length / recordsPerPage)} // Deshabilitar si estás en la última página
          onClick={() => paginate(currentPage + 1)}>
          Siguiente
       </CButton>
        </CPagination>
        {/* Mostrar total de páginas */}
      <span style={{ marginLeft: '10px' }}>
        Página {currentPage} de {Math.ceil(filteredProfesores.length / recordsPerPage)}
      </span>
  </div>  



{/*-------------------------------------------------------------------------------*/}



{/*  Modal del pdf */}
<CModal visible={modalPDFVisible} onClose={() => setModalReporteVisible(false)} backdrop="static">
  <CModalHeader>
    <CModalTitle>Generar Reporte</CModalTitle>
  </CModalHeader>
  <CModalBody>
    <p>Selecciona el formato para generar el reporte:</p>
    <CButton
      style={{ backgroundColor: '#4B6251', color: 'white', marginBottom: '10px', width: '100%' }}
      onClick={handleExportPDF} // Llama a la función de exportación a PDF
    >
      <CIcon icon={cilDescription} /> Descargar PDF
    </CButton>
    <CButton
      style={{ backgroundColor: '#6C8E58', color: 'white', width: '100%' }}
      onClick={handleExportExcel} // Llama a la función de exportación a Excel
    >
      <CIcon icon={cilDescription} /> Descargar Excel
    </CButton>
  </CModalBody>
  <CModalFooter>
    <CButton color="secondary" onClick={() => setModalPDFVisible(false)}>
      Cerrar
    </CButton>
  </CModalFooter>
</CModal>




{/* Modal Detalles */}
    <CModal visible={modalReporteVisible} onClose={() => setModalReporteVisible(false)} backdrop="static">
    <CModalHeader>
      <CModalTitle>Detalles de profesor</CModalTitle>
    </CModalHeader>
    <CModalBody>
      <h5>INFORMACION</h5>
<p><strong>Nombre:</strong> {getNombreCompleto(profesorToReportar.cod_persona)}</p>
      <p><strong>Grado académico:</strong> {listaGradosAcademicos.find(grado => grado.Cod_grado_academico === profesorToReportar.Cod_grado_academico)?.Descripcion || 'N/A'}</p>
      <p><strong>Tipo de contrato:</strong> {listaTiposContrato.find(tipo => tipo.Cod_tipo_contrato === profesorToReportar.Cod_tipo_contrato)?.Descripcion || 'N/A'}</p>
      <p><strong>Hora Entrada:</strong> {profesorToReportar.Hora_entrada}</p>
      <p><strong>Hora Salida:</strong> {profesorToReportar.Hora_salida}</p>
      <p><strong>Fecha Ingreso:</strong> {formatFecha(profesorToReportar.Fecha_ingreso)}</p>
      <p><strong>Fecha Fin Contrato:</strong> {formatFecha(profesorToReportar.Fecha_fin_contrato)}</p>
      <p><strong>Años experiencia:</strong> {profesorToReportar.Años_experiencia}</p>
    </CModalBody>
    <CModalFooter>
      <CButton color="secondary" onClick={() => setModalReporteVisible(false)}>Cerrar</CButton>
    </CModalFooter>
    </CModal>

      {/* Modal Crear */}
      <CModal visible={modalVisible} backdrop='static'>
  <CModalHeader closeButton={false}>
    <CModalTitle>Nuevo profesor</CModalTitle>
    <CButton className="btn-close" aria-label="Close" onClick={() => handleCloseModal( setModalVisible, resetNuevoProfesor)} />
  </CModalHeader>
  <CModalBody>
    <CForm>
      {/* Select para Código Persona */}
      <CInputGroup className="mb-3">
  <CInputGroupText>Nombre</CInputGroupText>
  <CFormSelect
    ref={inputRef} // Asignar la referencia al input
    value={nuevoProfesor.cod_persona }
    maxLength={50} // Limitar a 50 caracteres
    onPaste={disableCopyPaste}
    onCopy={disableCopyPaste}
    onChange={(e) => handleInputChange(e, (value) => setNuevoProfesor({ ...nuevoProfesor, cod_persona : value }))}
  >
    <option value="">Seleccione una persona</option>
    {listaPersonas.map((persona) => (
      <option key={persona.cod_persona } value={persona.cod_persona }>
        {persona.Nombre} {persona.Primer_apellido}
      </option>
    ))}
  </CFormSelect>
</CInputGroup>

      {/* Select para Tipo de Contrato */}
      <CInputGroup className="mb-3">
        <CInputGroupText>Tipo de Contrato</CInputGroupText>
        <CFormSelect
          value={nuevoProfesor.Cod_tipo_contrato}
          maxLength={50} // Limitar a 50 caracteres
          onPaste={disableCopyPaste}
          onCopy={disableCopyPaste}
          onChange={(e) => handleInputChange(e, (value) =>  setNuevoProfesor({ ...nuevoProfesor, Cod_tipo_contrato: value }))}
        >
          <option value="">Seleccione tipo de contrato</option>
          {listaTiposContrato.map((tipo) => (
            <option key={tipo.Cod_tipo_contrato} value={tipo.Cod_tipo_contrato}>
              {tipo.Descripcion}
            </option>
          ))}
        </CFormSelect>
      </CInputGroup>

      {/* Select para Grado Académico */}
      <CInputGroup className="mb-3">
        <CInputGroupText>Grado Académico</CInputGroupText>
        <CFormSelect
          value={nuevoProfesor.Cod_grado_academico}
          maxLength={50} // Limitar a 50 caracteres
          onPaste={disableCopyPaste}
          onCopy={disableCopyPaste}
          onChange={(e) => handleInputChange(e, (value) => setNuevoProfesor({ ...nuevoProfesor, Cod_grado_academico: value }))}
        >
          <option value="">Seleccione un grado académico</option>
          {listaGradosAcademicos.map((grado) => (
            <option key={grado.Cod_grado_academico} value={grado.Cod_grado_academico}>
              {grado.Descripcion}
            </option>
          ))}
        </CFormSelect>
      </CInputGroup>
            <CInputGroup className="mb-3">
              <CInputGroupText>Hora Entrada</CInputGroupText>
              <CFormInput
                type="time"
                value={nuevoProfesor.Hora_entrada}
                maxLength={50} // Limitar a 50 caracteres
                onPaste={disableCopyPaste}
                onCopy={disableCopyPaste}
                onChange={(e) => handleInputChange(e, (value) => setNuevoProfesor({ ...nuevoProfesor, Hora_entrada: value }))}
              />
            </CInputGroup>
            <CInputGroup className="mb-3">
              <CInputGroupText>Hora Salida</CInputGroupText>
              <CFormInput
                type="time"
                value={nuevoProfesor.Hora_salida}
                maxLength={50} // Limitar a 50 caracteres
                onPaste={disableCopyPaste}
                onCopy={disableCopyPaste}
                onChange={(e) => handleInputChange(e, (value) => setNuevoProfesor({ ...nuevoProfesor, Hora_salida: value }))}
              />
            </CInputGroup>
            <CInputGroup className="mb-3">
              <CInputGroupText>Fecha Ingreso</CInputGroupText>
              <CFormInput
                type="date"
                value={nuevoProfesor.Fecha_ingreso}
                maxLength={50} // Limitar a 50 caracteres
                onPaste={disableCopyPaste}
                onCopy={disableCopyPaste}
                onChange={(e) => handleInputChange(e, (value) =>  setNuevoProfesor({ ...nuevoProfesor, Fecha_ingreso: value }))}
              />
            </CInputGroup>
            <CInputGroup className="mb-3">
              <CInputGroupText>Fecha Fin Contrato</CInputGroupText>
              <CFormInput
                type="date"
                value={nuevoProfesor.Fecha_fin_contrato}

                maxLength={50} // Limitar a 50 caracteres
                onPaste={disableCopyPaste}
                onCopy={disableCopyPaste}
                onChange={(e) => handleInputChange(e, (value) =>  setNuevoProfesor({ ...nuevoProfesor, Fecha_fin_contrato: value }))}
              />
            </CInputGroup>
            <CInputGroup className="mb-3">
            <CInputGroupText>Años de Experiencia</CInputGroupText>
          <CFormInput
            type="number"
            value={nuevoProfesor.Años_experiencia}
            onPaste={disableCopyPaste}
            onCopy={disableCopyPaste}
            onChange={(e) => {
             const value = e.target.value; // Obtener el valor del input
             const añosExperiencia = parseInt(value, 10); // Convertir a entero

    // Validar que no sea un número negativo
    if (añosExperiencia < 0) {
      swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se permiten números negativos en años de experiencia.',
      });
      // Limpiar el campo si el valor es negativo
      setNuevoProfesor({
        ...nuevoProfesor,
        Años_experiencia: '', // Limpia el campo si es negativo
      });
      return; // Salir de la función para evitar actualizar el estado
    }

    // Validar que solo se ingresen hasta 2 dígitos
    if (value.length > 2) {
      swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Solo se permiten hasta 2 dígitos para los años de experiencia.',
      });
      // Limpiar el campo si excede el límite
      setNuevoProfesor({
        ...nuevoProfesor,
        Años_experiencia: '', // Limpia el campo si excede el límite
      });
      return; // Salir de la función para evitar actualizar el estado
    }

    // Si es un número válido y dentro del rango, actualizar el estado
    if (añosExperiencia <= 40) {
      setNuevoProfesor({
        ...nuevoProfesor,
        Años_experiencia: value,
      });
    } else {
      swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Los años de experiencia deben estar entre 0 y 40.',
      });
      setNuevoProfesor({
        ...nuevoProfesor,
        Años_experiencia: '', // Limpia el campo si está fuera del rango
      });
    }
  }}
/>

</CInputGroup>

          </CForm>
        </CModalBody>
        <CModalFooter>
        <CButton color="secondary" onClick={() => handleCloseModal(setModalVisible, resetNuevoProfesor)}>
            Cancelar
          </CButton>
          <CButton style={{backgroundColor: '#4B6251', color: 'white' }} onClick={handleCreateProfesor}>
          <CIcon icon={cilSave} style={{ marginRight: '5px' }} />Guardar
          </CButton>
        </CModalFooter>
      </CModal>


{/* Modal Actualizar */}

<CModal visible={modalUpdateVisible} backdrop="static">
  <CModalHeader closeButton={false}>
     <CModalTitle>Actualizar Profesor</CModalTitle>
     <CButton className="btn-close" aria-label="Close" onClick={() => handleCloseModal(setModalUpdateVisible,resetNuevoProfesor)} />
  </CModalHeader> 
  <CModalBody>
    <CForm>
        {/* Select para Persona */}
        <CInputGroup className="mb-3">
        <CInputGroupText>Nombre</CInputGroupText>
        <CFormSelect
          ref={inputRef} // Asignar la referencia al input
          value={profesorToUpdate.cod_persona}
          maxLength={50} // Limitar a 50 caracteres
          onPaste={disableCopyPaste}
          onCopy={disableCopyPaste}
          onChange={(e) => handleInputChange(e, (value) => setProfesorToUpdate({ ...profesorToUpdate, cod_persona: value }))}
        >
          <option value="">Seleccione una persona</option>
          {listaPersonas.map((persona) => (
            <option key={persona.cod_persona} value={persona.cod_persona}>
              {persona.Nombre} {persona.Primer_apellido}
            </option>
          ))}
        </CFormSelect>
      </CInputGroup>
          

     
      {/* Select para Grado Académico */}
      <CInputGroup className="mb-3">
        <CInputGroupText>Grado Académico</CInputGroupText>
        <CFormSelect
          value={profesorToUpdate.Cod_grado_academico}
          onChange={(e) => setProfesorToUpdate({ ...profesorToUpdate, Cod_grado_academico: e.target.value })}
        >
          <option value="">Seleccione grado académico</option>
          {listaGradosAcademicos.map((grado) => (
            <option key={grado.Cod_grado_academico} value={grado.Cod_grado_academico}>
              {grado.Descripcion}
            </option>
          ))}
        </CFormSelect>
      </CInputGroup>


 {/* Select para Tipo de contrato */}
 <CInputGroup className="mb-3">
        <CInputGroupText>Tipo de Contrato</CInputGroupText>
        <CFormSelect
          value={profesorToUpdate.Cod_tipo_contrato}
          onChange={(e) => setProfesorToUpdate({ ...profesorToUpdate, Cod_tipo_contrato: e.target.value })}
        >
          <option value="">Seleccione tipo de contrato</option>
          {listaTiposContrato.map((tipo) => (
            <option key={tipo.Cod_tipo_contrato} value={tipo.Cod_tipo_contrato}>
              {tipo.Descripcion}
            </option>
          ))}
        </CFormSelect>
      </CInputGroup>


      <CInputGroup className="mb-3">
        <CInputGroupText>Hora Entrada</CInputGroupText>
        <CFormInput
          type="time"
          value={profesorToUpdate.Hora_entrada}
          onChange={(e) => setProfesorToUpdate({ ...profesorToUpdate, Hora_entrada: e.target.value })}
        />
      </CInputGroup>
      <CInputGroup className="mb-3">
        <CInputGroupText>Hora Salida</CInputGroupText>
        <CFormInput
          type="time"
          value={profesorToUpdate.Hora_salida}
          onChange={(e) => setProfesorToUpdate({ ...profesorToUpdate, Hora_salida: e.target.value })}
        />
      </CInputGroup>
      <CInputGroup className="mb-3">
        <CInputGroupText>Fecha Ingreso</CInputGroupText>
        <CFormInput
          type="date"
          value={profesorToUpdate.Fecha_ingreso}
          onChange={(e) => setProfesorToUpdate({ ...profesorToUpdate, Fecha_ingreso: e.target.value })}
        />
      </CInputGroup>
      <CInputGroup className="mb-3">
        <CInputGroupText>Fecha Fin Contrato</CInputGroupText>
        <CFormInput
          type="date"
          value={profesorToUpdate.Fecha_fin_contrato}
          onChange={(e) => setProfesorToUpdate({ ...profesorToUpdate, Fecha_fin_contrato: e.target.value })}
        />
      </CInputGroup>
      <CInputGroup className="mb-3">
  <CInputGroupText>Años de Experiencia</CInputGroupText>
  <CFormInput
    type="number"
    value={profesorToUpdate.Años_experiencia}
    onPaste={disableCopyPaste}
    onCopy={disableCopyPaste}
    onChange={(e) => { 
      const value = e.target.value;  // Obtener el valor del input
      const añosExperiencia = parseInt(value, 10); // Convertir a entero

      // Validar que no sea un número negativo
      if (añosExperiencia < 0) {
        swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se permiten números negativos en años de experiencia.',
        });
        // Limpiar el campo si el valor es negativo
        setProfesorToUpdate({ ...profesorToUpdate, Años_experiencia: '', // Limpia el campo si es negativo
        });
        return; // Salir de la función para evitar actualizar el estado
      }

      // Validar que solo se ingresen hasta 2 dígitos
      if (value.length > 2) {
        swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Solo se permiten hasta 2 dígitos para los años de experiencia.',
        });
        // Limpiar el campo si excede el límite
        setProfesorToUpdate({...profesorToUpdate,Años_experiencia: '', // Limpia el campo si excede el límite
        });
        return; // Salir de la función para evitar actualizar el estado
      }

      // Si es un número válido y dentro del rango, actualizar el estado
      if (añosExperiencia <= 40) {
        setProfesorToUpdate({...profesorToUpdate,Años_experiencia: value,
        });
      } else {
        swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Los años de experiencia deben estar entre 0 y 40.',
        });
        setProfesorToUpdate({...profesorToUpdate,Años_experiencia: '', // Limpia el campo si está fuera del rango
        });
      }
    }}
  />
</CInputGroup>
    </CForm>
  </CModalBody>
  <CModalFooter>
   <CButton color="secondary" onClick={() => handleCloseModal(setModalUpdateVisible, resetProfesorToUpdate)}>
      Cancelar
    </CButton> 
    <CButton style={{  backgroundColor: '#F9B64E',color: 'white' }} onClick={handleUpdateProfesor}>
    <CIcon icon={cilPen} style={{ marginRight: '5px' }} />Actualizar
    </CButton>
  </CModalFooter>
</CModal>


      {/* Modal Eliminar */}
      <CModal visible={modalDeleteVisible} onClose={() => setModalDeleteVisible(false)}>
        <CModalHeader>
          <CModalTitle>Eliminar Profesor</CModalTitle>
        </CModalHeader>
        <CModalBody>
          ¿Estás seguro de que deseas eliminar al profesor? <strong>{getNombreCompleto(profesorToDelete.cod_persona)}</strong>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setModalDeleteVisible(false)}>
            Cancelar
            </CButton>
            <CButton style={{  backgroundColor: '#E57368',color: 'white' }} onClick={handleDeleteProfesor}>
          <CIcon icon={cilTrash} style={{ marginRight: '5px' }} />  Eliminar 
          </CButton>
        </CModalFooter>
      </CModal>
    </CContainer>

    
  );
};
 
export default ListaProfesores;
