import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { CIcon } from '@coreui/icons-react';
import { cilSearch,cilInfo, cilBrushAlt, cilPen, cilTrash, cilPlus,cilFile,cilSpreadsheet, cilSave,cilDescription } from '@coreui/icons'; // Importar iconos específicos
import swal from 'sweetalert2';
import { left } from '@popperjs/core';
import jsPDF from 'jspdf';
import 'jspdf-autotable'; // Importa el plugin para tablas
import * as XLSX from 'xlsx';
import logo from 'src/assets/brand/logo_saint_patrick.png'
import {
  CButton,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
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
import axios from 'axios'; // Asegúrate de instalar axios si no lo tienes
const ListaProfesores = () => {
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
    Estado: '',
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
  const [filteredRecords, setFilteredRecords] = useState(profesores); // Inicializa con todos los profesores
  const [loading, setLoading] = useState(false);
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
  //------------------------------------------------------------------------------------//
// Función que se llama al hacer clic en el botón "Cambiar Estado"
const toggleEstado = async (profesor) => {
  // Verificar que el estado se está actualizando (por ejemplo, de activo a inactivo)
  const nuevoEstado = profesor.Estado ? 0 : 1; // Si está activo (1), lo pondremos inactivo (0), y viceversa.

  try {
    setLoading(true);  // Activar el indicador de carga

    // Llamada a la API para actualizar el estado
    const response = await axios.post('http://localhost:4000/api/profesores/actualizarEstadoProfesor', {
      cod_profesor: profesor.Cod_profesor,
      estado: nuevoEstado,
    });

    if (response.data.mensaje === 'Estado actualizado exitosamente') {
      // Si la actualización fue exitosa, actualizar el estado en el frontend
      profesor.Estado = nuevoEstado;
    } else {
      console.error('Error al cambiar el estado:', response.data.mensaje);
    }
  } catch (error) {
    console.error('Error al realizar la solicitud:', error);
  } finally {
    setLoading(false); // Desactivar el indicador de carga
  }
};

  
//----------------------------------------------------------------------------------------------------------  
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

function BuscadorDinamico({ listaPersonas, nuevoProfesor, setNuevoProfesor }) {
  const [busqueda, setBusqueda] = useState(''); // Estado para el texto de búsqueda
  const [seleccionado, setSeleccionado] = useState(null); // Estado para la persona seleccionada

  // Manejar la selección de una persona
  const handleSelectPersona = (persona) => {
    console.log('Persona seleccionada:', persona); // Log para verificar selección
    setNuevoProfesor((prev) => ({
      ...prev,
      cod_persona: persona.cod_persona, // Actualiza el cod_persona
    }));
    setBusqueda(`${persona.dni_persona} ${persona.Nombre} ${persona.Primer_apellido}`); // Actualiza el campo de búsqueda con el nombre
    setSeleccionado(persona); // Guarda la persona seleccionada
  };

  // Filtrar personas según la búsqueda y el tipo
  const personasFiltradas = listaPersonas.filter(
    (persona) =>
      persona.cod_tipo_persona === 3 && // Asegúrate de que este valor sea correcto
      (`${persona.dni_persona} ${persona.Nombre} ${persona.Primer_apellido}`
        .toUpperCase()
        .includes(busqueda)) // Convertir a mayúsculas para la comparación
  );

  // Deshabilitar copiar y pegar
  const disableCopyPaste = (e) => e.preventDefault();

  return (
    <>
      {/* Campo de búsqueda */}
      <CInputGroup className="mb-3">
        <CInputGroupText>Nombre</CInputGroupText>
        <CFormInput
          type="text"
          placeholder="Buscar por DNI, nombre o apellido..."
          value={busqueda}
          onPaste={disableCopyPaste}
          onCopy={disableCopyPaste}
          onChange={(e) => {
            setBusqueda(e.target.value.toUpperCase()); // Convertir automáticamente a mayúsculas
            setSeleccionado(null); // Resetea la selección al cambiar la búsqueda
          }}
          style={{
            padding: '10px',
            borderRadius: '4px',
            fontSize: '0.95rem',
            textTransform: 'uppercase', // Forzar visualización en mayúsculas
          }}
        />
      </CInputGroup>

      {/* Lista de resultados filtrados */}
      {busqueda && (
        <div
          style={{
            maxHeight: '150px',
            overflowY: 'auto',
            border: '1px solid #ddd',
            borderRadius: '4px',
            backgroundColor: '#fff',
            marginTop: '5px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
          }}
        >
          {personasFiltradas.length > 0 ? (
            personasFiltradas.map((persona) => (
              <div
                key={persona.cod_persona}
                onClick={() => handleSelectPersona(persona)}
                style={{
                  padding: '10px',
                  cursor: 'pointer',
                  backgroundColor:
                    seleccionado && seleccionado.cod_persona === persona.cod_persona
                      ? '#e9ecef'
                      : 'white',
                  borderBottom: '1px solid #ddd',
                }}
              >
                <strong>{persona.Nombre} {persona.Primer_apellido}</strong><br />
                DNI: {persona.dni_persona}
              </div>
            ))
          ) : (
            <div style={{ padding: '10px', textAlign: 'center' }}>
              No se encontraron resultados.
            </div>
          )}
        </div>
      )}
    </>
  );
}



console.log('Registros actuales en la página:', currentRecords); // Verificar registros paginados en la consola

 // Cambiar página
 const paginate = (pageNumber) => {
  if (pageNumber > 0 && pageNumber <= Math.ceil(filteredProfesores.length / recordsPerPage)) {
    setCurrentPage(pageNumber);
  }
}
// Función para abrir el modal de actualización
const openUpdateModal = (profesor) => {
  // Cargar los datos del profesor seleccionado
  setProfesorToUpdate({
    ...profesor,
    Fecha_ingreso: profesor.Fecha_ingreso
      ? new Date(profesor.Fecha_ingreso).toISOString().split('T')[0]
      : '', // Convertir fecha de ingreso al formato YYYY-MM-DD
    Fecha_fin_contrato: profesor.Fecha_fin_contrato
      ? new Date(profesor.Fecha_fin_contrato).toISOString().split('T')[0]
      : '', // Convertir fecha de fin de contrato al formato YYYY-MM-DD
  });

  setModalUpdateVisible(true); // Abrir el modal de actualización
  setHasUnsavedChanges(false); // Resetear el estado de cambios sin guardar
};

  const openDeleteModal = (profesor) => {
    setProfesorToDelete(profesor); // Guardar el ciclo que se desea eliminar
    setModalDeleteVisible(true); // Abrir el modal de confirmación
  };

  

  useEffect(() => {
    setFilteredRecords(
      searchTerm
        ? profesores.filter((profesor) => {
            const persona = listaPersonas.find((p) => p.cod_persona === profesor.cod_persona);
            const nombreCompleto = persona
              ? `${persona.dni_persona} ${persona.Nombre} ${persona.Primer_apellido}`.toUpperCase()
              : 'DESCONOCIDO';
  
            // Obtener las descripciones de tipo de contrato y grado académico
            const tipoContrato = listaTiposContrato.find(tipo => tipo.Cod_tipo_contrato === profesor.Cod_tipo_contrato)?.Descripcion.toUpperCase() || '';
            const gradoAcademico = listaGradosAcademicos.find(grado => grado.Cod_grado_academico === profesor.Cod_grado_academico)?.Descripcion.toUpperCase() || '';
  
            // Filtro con el nombre completo, DNI, tipo de contrato y grado académico
            return (
              nombreCompleto.includes(searchTerm.toUpperCase()) || // Coincidir con el nombre completo
              (persona?.dni_persona || '').toUpperCase().includes(searchTerm.toUpperCase()) || // Coincidir con el DNI
              tipoContrato.includes(searchTerm.toUpperCase()) || // Coincidir con tipo de contrato
              gradoAcademico.includes(searchTerm.toUpperCase()) // Coincidir con grado académico
            );
          })
        : profesores // Si no hay término de búsqueda, mostrar todos
    );
  }, [searchTerm, profesores, listaPersonas, listaTiposContrato, listaGradosAcademicos]);
  
//-------------------------------------------------------------------------------------------
const handleSearch = (event) => {
  const input = event.target.value.toUpperCase().trim(); // Convertir a mayúsculas y eliminar espacios adicionales

  // Validación de caracteres permitidos (letras, números y espacios)
  const regexValidCharacters = /^[A-ZÑ0-9\s]*$/;
  if (!regexValidCharacters.test(input) && input !== '') {
    Swal.fire({
      icon: 'warning',
      title: 'Entrada no válida',
      text: 'Solo se permiten letras, números y espacios.',
    });
    return;
  }

  // Validación de caracteres repetidos (no más de 4 consecutivos)
  const regexFourConsecutiveCharacters = /([A-ZÑ0-9])\1{4}/;
  if (regexFourConsecutiveCharacters.test(input)) {
    Swal.fire({
      icon: 'warning',
      title: 'Entrada no válida',
      text: 'No se permiten más de 4 caracteres repetidos consecutivamente.',
    });
    return;
  }

    // Validación de espacios consecutivos (no más de 1 espacio consecutivo)
  const regexMultipleSpaces = /\s{2,}/;
  if (regexMultipleSpaces.test(input)) {
    Swal.fire({
      icon: 'warning',
      title: 'Entrada no válida',
      text: 'No se permiten más de un espacio consecutivo.',
    });
    return;
  }

  // Actualizar el término de búsqueda
  setSearchTerm(input);

// Filtrar los registros basados en los diferentes criterios
const filteredRecords = searchTerm
  ? profesores.filter((profesor) => {
      const persona = listaPersonas.find((p) => p.cod_persona === profesor.cod_persona);
      const nombreCompleto = persona
        ? `${persona.dni_persona} ${persona.Nombre} ${persona.Primer_apellido}`.toUpperCase()
        : 'DESCONOCIDO';

        // Buscar en nombre completo, DNI, tipo de contrato y grado académico
        const tipoContrato = listaTiposContrato.find(tipo => tipo.Cod_tipo_contrato === profesor.Cod_tipo_contrato)?.Descripcion || '';
        const gradoAcademico = listaGradosAcademicos.find(grado => grado.Cod_grado_academico === profesor.Cod_grado_academico)?.Descripcion || '';
      // Aquí puedes agregar los filtros adicionales para tipo de contrato y grado académico
      return (
        nombreCompleto.includes(searchTerm) || // Coincidencia con el nombre completo
        (persona?.dni_persona || '').toUpperCase().includes(searchTerm) || // Coincidencia con el DNI
        tipoContrato.toUpperCase().includes(searchTerm.toUpperCase()) || // Coincidencia con tipo de contrato
        gradoAcademico.toUpperCase().includes(searchTerm.toUpperCase()) // Coincidencia con grado académico
      );
    })
  : profesores; // Si no hay término de búsqueda, mostrar todo

  // Actualizar la lista filtrada
  setProfesoresFiltrados(filteredRecords);
};

//-----------------------------------------------------------------------------------------------------------



//=========================================================== pdf y excel================================================
const generarReportePDF = () => {
  // Filtrar registros si hay búsqueda activa
  const registrosParaReporte = searchTerm
    ? profesores.filter((profesor) => {
        const persona = listaPersonas.find((p) => p.cod_persona === profesor.cod_persona);
        const nombreCompleto = persona
          ? `${persona.dni_persona} ${persona.Nombre} ${persona.Primer_apellido}`.toUpperCase()
          : '';
        return nombreCompleto.includes(searchTerm.trim().toUpperCase());
      })
    : profesores;  // Si no hay filtro, usar todos los profesores

  // Validar si hay registros para mostrar
  if (registrosParaReporte.length === 0) {
    swal.fire({
      icon: 'warning',
      title: 'Sin datos para el reporte',
      text: 'No hay registros disponibles para generar el reporte.',
    });
    return; // No continuar si no hay datos
  }

  const doc = new jsPDF();
  const img = new Image();
  img.src = logo; // Reemplaza con la URL o ruta de tu logo.

  // Obtener fecha y hora de generación
  const now = new Date();
  const fechaHoraGeneracion = `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;

  img.onload = () => {
    // Agregar logo
    doc.addImage(img, 'PNG', 10, 10, 30, 30);

    let yPosition = 20;

    // Título principal
    doc.setFontSize(18);
    doc.setTextColor(0, 102, 51); // Verde
    doc.text('SAINT PATRICK\'S ACADEMY', doc.internal.pageSize.width / 2, yPosition, { align: 'center' });

    yPosition += 12;

    // Subtítulo
    doc.setFontSize(16);
    doc.text('Reporte de Profesores', doc.internal.pageSize.width / 2, yPosition, { align: 'center' });

    yPosition += 10;

    // Información adicional
    doc.setFontSize(10);
    doc.setTextColor(100); // Gris para texto secundario
    doc.text('Casa Club del periodista, Colonia del Periodista', doc.internal.pageSize.width / 2, yPosition, { align: 'center' });

    yPosition += 4;

    doc.text('Teléfono: (504) 2234-8871', doc.internal.pageSize.width / 2, yPosition, { align: 'center' });

    yPosition += 4;

    doc.text('Correo: info@saintpatrickacademy.edu', doc.internal.pageSize.width / 2, yPosition, { align: 'center' });

    yPosition += 6; // Espaciado antes de la línea divisoria

    // Línea divisoria
    doc.setLineWidth(0.5);
    doc.setDrawColor(0, 102, 51); // Verde
    doc.line(10, yPosition, doc.internal.pageSize.width - 10, yPosition);

    yPosition += 4;

    // Generar tabla con registros filtrados o completos
    doc.autoTable({
      startY: yPosition,
      head: [['#', 'Nombre', 'Grado Académico', 'Tipo de Contrato', 'Hora Entrada', 'Hora Salida', 'Fecha Ingreso', 'Fecha Fin Contrato', 'Años de Experiencia']],
      body: registrosParaReporte.map((profesor, index) => {
        const persona = listaPersonas.find((p) => p.cod_persona === profesor.cod_persona);
        const nombreCompleto = persona
          ? `${persona.dni_persona} ${persona.Nombre} ${persona.Primer_apellido}`
          : 'Desconocido';

        const fechaIngreso = new Date(profesor.Fecha_ingreso).toLocaleDateString('es-ES');
        const fechaFinContrato = new Date(profesor.Fecha_fin_contrato).toLocaleDateString('es-ES');
        const añosExperiencia = profesor.Años_experiencia;

        return [
          index + 1,
          nombreCompleto,
          listaGradosAcademicos.find(
            (grado) => grado.Cod_grado_academico === profesor.Cod_grado_academico
          )?.Descripcion || 'N/A',
          listaTiposContrato.find(
            (tipo) => tipo.Cod_tipo_contrato === profesor.Cod_tipo_contrato
          )?.Descripcion || 'N/A',
          profesor.Hora_entrada,
          profesor.Hora_salida,
          fechaIngreso, // Mostrar fecha de ingreso
          fechaFinContrato, // Mostrar fecha de fin de contrato
          `${añosExperiencia} años`, // Mostrar años de experiencia
        ];
      }),
      headStyles: {
        fillColor: [0, 102, 51], // Verde oscuro para encabezado
        textColor: [255, 255, 255], // Texto blanco
        fontSize: 9,
      },
      styles: {
        fontSize: 8, // Reducir el tamaño de la fuente
        cellPadding: 2, // Aumentar el padding para mejorar la visibilidad
        overflow: 'linebreak', // Asegurar que el texto no se desborde
      },
      alternateRowStyles: { fillColor: [240, 248, 255] }, // Fondo alternativo
      didDrawPage: (data) => {
        // Pie de página
        const pageCount = doc.internal.getNumberOfPages();
        const pageHeight = doc.internal.pageSize.height;

        // Fecha y hora en el lado izquierdo
        doc.setFontSize(10);
        doc.text(`Fecha y hora de generación: ${fechaHoraGeneracion}`, 10, pageHeight - 10);

        // Número de página en el lado derecho
        doc.text(`Página ${data.pageNumber} de ${pageCount}`, doc.internal.pageSize.width - 50, pageHeight - 10);
      },
    });

    // Guardar o abrir el PDF
    window.open(doc.output('bloburl'), '_blank');
  };

  img.onerror = () => {
    console.warn('No se pudo cargar el logo. El PDF se generará sin el logo.');
    window.open(doc.output('bloburl'), '_blank');
  };
};






const generarReporteExcel = () => {
  const encabezados = [
    ["Saint Patrick Academy"],
      ["Reporte de Profesores"],
      [], // Espacio en blanco
    ['#', 'Nombre', 'Grado Académico', 'Tipo de Contrato', 'Hora Entrada', 'Hora Salida'],
  ];

  const datos = currentRecords.map((profesor, index) => {
    const persona = listaPersonas.find(p => p.cod_persona === profesor.cod_persona);
    const nombreCompleto = persona ? `${persona.dni_persona} ${persona.Nombre} ${persona.Primer_apellido}` : 'Desconocido';

    return [
      index + 1,
      nombreCompleto,
      listaGradosAcademicos.find(grado => grado.Cod_grado_academico === profesor.Cod_grado_academico)?.Descripcion || 'N/A',
      listaTiposContrato.find(tipo => tipo.Cod_tipo_contrato === profesor.Cod_tipo_contrato)?.Descripcion || 'N/A',
      profesor.Hora_entrada,
      profesor.Hora_salida,
    ];
  });

  const hojaDeTrabajo = XLSX.utils.aoa_to_sheet([...encabezados, ...datos]);
  const libroDeTrabajo = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(libroDeTrabajo, hojaDeTrabajo, 'Reporte Profesores');

  XLSX.writeFile(libroDeTrabajo, 'reporte_profesores.xlsx');
};




//=======================================================================================================
  



  
  return (
    <CContainer>
{/* Contenedor del título y botones */}
<CRow className="align-items-center mb-5">
  <CCol
    xs="12"
    className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3"
  >
    {/* Título de la página */}
    <div
      className="d-flex justify-content-center align-items-center flex-grow-1"
    >
      <h1
        className="text-center fw-semibold pb-2 mb-0"
        style={{
          display: "inline-block",
          borderBottom: "2px solid #4CAF50",
          margin: "0 auto",
          fontSize: "2.0rem",
        }}
      >
        Lista de Profesores
      </h1>
    </div>

    {/* Botón "Nuevo" */}
    <div className="d-flex gap-2">
      <CButton
        className="btn btn-sm d-flex align-items-center gap-1 rounded shadow"
        onClick={() => {
          setModalVisible(true);
          setHasUnsavedChanges(false);
        }}
        style={{
          backgroundColor: "#4B6251",
          color: "#FFFFFF",
          padding: "5px 10px",
          fontSize: "0.9rem",
        }}
      >
        <CIcon icon={cilPlus} /> Nuevo
      </CButton>

      {/* Dropdown para reporte */}
      <CDropdown className="btn-sm d-flex align-items-center gap-1 rounded shadow">
        <CDropdownToggle
          style={{
            backgroundColor: "#6C8E58",
            color: "white",
            fontSize: "0.85rem",
            cursor: "pointer",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#5A784C";
            e.currentTarget.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.2)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#6C8E58";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          Reporte
        </CDropdownToggle>
        <CDropdownMenu
          style={{
            position: "absolute",
            zIndex: 1050,
            backgroundColor: "#fff",
            boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.2)",
            borderRadius: "4px",
            overflow: "hidden",
          }}
        >
          {/* Opción para PDF */}
          <CDropdownItem
            onClick={generarReportePDF}
            style={{
              cursor: "pointer",
              outline: "none",
              backgroundColor: "transparent",
              padding: "0.5rem 1rem",
              fontSize: "0.85rem",
              color: "#333",
              borderBottom: "1px solid #eaeaea",
              transition: "background-color 0.3s",
            }}
            onMouseOver={(e) =>
              (e.target.style.backgroundColor = "#f5f5f5")
            }
            onMouseOut={(e) =>
              (e.target.style.backgroundColor = "transparent")
            }
          >
            <CIcon icon={cilFile} size="sm" /> Abrir en PDF
          </CDropdownItem>

          {/* Opción para Excel */}
          <CDropdownItem
            onClick={generarReporteExcel}
            style={{
              cursor: "pointer",
              outline: "none",
              backgroundColor: "transparent",
              padding: "0.5rem 1rem",
              fontSize: "0.85rem",
              color: "#333",
              transition: "background-color 0.3s",
            }}
            onMouseOver={(e) =>
              (e.target.style.backgroundColor = "#f5f5f5")
            }
            onMouseOut={(e) =>
              (e.target.style.backgroundColor = "transparent")
            }
          >
            <CIcon icon={cilSpreadsheet} size="sm" /> Descargar Excel
          </CDropdownItem>
        </CDropdownMenu>
      </CDropdown>
    </div>
  </CCol>
</CRow>

       {/* Contenedor de la barra de búsqueda y el botón "Nuevo" */}
       <CRow className='align-items-center mt-4 mb-2'>
      
      {/* Barra de búsqueda */}
      <CCol xs="12" md="8" className='d-flex flex-wrap align-items-center'>
        <CInputGroup className="me-3" style={{width: '400px' }}>
  <CInputGroupText>
    <CIcon icon={cilSearch} size="sm" />
  </CInputGroupText>
  <CFormInput
    type="text"
     placeholder="Buscar por DNI, nombre, tipo de contrato o grado académico..."
    value={searchTerm}
    onChange={handleSearch}
    style={{ fontSize: '0.9rem' }}
    />

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

    </CRow>
{/* Tabla para mostrar Profesores*/}  
<div className="table-responsive" style={{ boxShadow: "0 4px 10px rgba(0, 0, 0, 0.3)" }}>
  <CTable striped bordered hover responsive>
    <CTableHead className="sticky-top bg-light text-start" style={{ fontSize: '0.8rem' }}>
      <CTableRow>
        <CTableHeaderCell>#</CTableHeaderCell>
        <CTableHeaderCell>DNI-NOMBRE</CTableHeaderCell>
        <CTableHeaderCell>GRADO ACADÉMICO</CTableHeaderCell>
        <CTableHeaderCell>TIPO DE CONTRATO</CTableHeaderCell>
        <CTableHeaderCell>HORA ENTRADA</CTableHeaderCell>
        <CTableHeaderCell>HORA SALIDA</CTableHeaderCell>
        <CTableHeaderCell>ACCIONES</CTableHeaderCell>
      </CTableRow>
    </CTableHead>
    <CTableBody>
      {filteredRecords.map((profesor, index) => {
        const persona = listaPersonas.find((p) => p.cod_persona === profesor.cod_persona);
        const nombreCompleto = persona
          ? `${persona.dni_persona} ${persona.Nombre} ${persona.Primer_apellido}`
          : 'Desconocido';

        // Estilo de la fila (gris si está inactivo)
        const rowStyle = profesor.Estado ? {} : { backgroundColor: '#f0f0f0', opacity: 0.7 };

        return (
          <CTableRow key={profesor.Cod_profesor} style={rowStyle}>
            <CTableDataCell>{index + 1}</CTableDataCell>
            <CTableDataCell>{nombreCompleto}</CTableDataCell>
            <CTableDataCell>{listaGradosAcademicos.find(grado => grado.Cod_grado_academico === profesor.Cod_grado_academico)?.Descripcion || 'N/A'}</CTableDataCell>
            <CTableDataCell>{listaTiposContrato.find(tipo => tipo.Cod_tipo_contrato === profesor.Cod_tipo_contrato)?.Descripcion || 'N/A'}</CTableDataCell>
            <CTableDataCell>{profesor.Hora_entrada}</CTableDataCell>
            <CTableDataCell>{profesor.Hora_salida}</CTableDataCell>
            <CTableDataCell>
          {/* Botón de actualizar, deshabilitado si el estado es inactivo */}
      <CButton
        style={{ backgroundColor: '#F9B64E', marginRight: '10px', marginBottom: '10px' }}
        onClick={() => openUpdateModal(profesor)}
        disabled={!profesor.Estado} // Deshabilitar si el profesor está inactivo
        title={profesor.Estado ? 'Editar profesor' : 'Profesor inactivo'}
      >
        <CIcon icon={cilPen} />
      </CButton>

      {/* Botón de detalle, deshabilitado si el estado es inactivo */}
      <CButton
        color="primary"
        style={{ marginRight: '10px', marginBottom: '10px' }}
        onClick={() => {
          setProfesorToReportar(profesor);
          setModalReporteVisible(true);
        }}
        disabled={!profesor.Estado} // Deshabilitar si el profesor está inactivo
        title={profesor.Estado ? 'Ver detalles' : 'Profesor inactivo'}
      >
        <CIcon icon={cilInfo} />
      </CButton>

      {/* Botón para cambiar el estado */}
      <CButton
        style={{
          backgroundColor: profesor.Estado ? '#4CAF50' : '#F44336', // Verde si activo, rojo si inactivo
          color: 'white',
          marginRight: '10px',
          marginBottom: '10px',
        }}
        onClick={() => toggleEstado(profesor)}  // Llamada a la función toggleEstado
        disabled={loading}  // Deshabilitar mientras se realiza la solicitud
      >
        {loading ? 'Cambiando...' : (profesor.Estado ? 'Activo' : 'Inactivo')} {/* Texto basado en el estado */}
      </CButton>
            </CTableDataCell>
          </CTableRow>
        );
      })}
    </CTableBody>
  </CTable>
</div>




     




{/*-------------------------------------------------------------------------------*/}


{/* Modal Detalles */}
    <CModal visible={modalReporteVisible} onClose={() => setModalReporteVisible(false)} backdrop="static">
    <CModalHeader>
      <CModalTitle>Detalles de profesor</CModalTitle>
    </CModalHeader>
    <CModalBody>
      <h5>INFORMACIÓN</h5>
      
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

      {/* Aquí se usa el componente BuscadorDinamico */}
          <BuscadorDinamico
            listaPersonas={listaPersonas} // Pasa la lista de personas
            nuevoProfesor={nuevoProfesor} // Pasa el estado actual de nuevoProfesor
            setNuevoProfesor={setNuevoProfesor} // Pasa la función para actualizar nuevoProfesor
          />


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
       
      {/* Formulario de Actualización */}
  <BuscadorDinamico
    listaPersonas={listaPersonas} // Pasa la lista de personas
    nuevoProfesor={profesorToUpdate} // Cambia 'nuevoProfesor' a 'profesorToUpdate'
    setNuevoProfesor={setProfesorToUpdate} // Cambia 'setNuevoProfesor' a 'setProfesorToUpdate'
  />
     
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
    onPaste={(e) => e.preventDefault()} // Evitar copiar y pegar
    onCopy={(e) => e.preventDefault()} // Evitar copiar
    onKeyPress={(e) => {
      const value = e.target.value;  // Obtener el valor del input

      // Bloquear el signo negativo
      if (e.key === "-") {
        e.preventDefault(); // Evitar que se escriba el signo negativo
        swal.fire({
          icon: 'warning',
          title: 'Advertencia',
          text: 'No se permiten números negativos en años de experiencia.',
        });
        return; // Salir para evitar que el valor contenga el signo negativo
      }

      // Validar que solo se ingresen hasta 2 dígitos
      if (value.length > 1 && !isNaN(value)) {
        swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Solo se permiten hasta 2 dígitos para los años de experiencia.',
        });
        setProfesorToUpdate({ ...profesorToUpdate, Años_experiencia: '' }); // Limpiar campo
        return;
      }
    }}
    onChange={(e) => {
      const value = e.target.value; // Obtener el valor del input

      // Validar que los años de experiencia no sean negativos
      const añosExperiencia = parseInt(value, 10); // Convertir a entero
      if (añosExperiencia < 0) {
        swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se permiten números negativos en años de experiencia.',
        });
        setProfesorToUpdate({ ...profesorToUpdate, Años_experiencia: '' }); // Limpiar campo
        return; // Salir si el valor es negativo
      }

      // Validar que los años de experiencia no sean mayores que 50
      if (añosExperiencia > 50) {
        swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Los años de experiencia deben estar entre 0 y 50.',
        });
        setProfesorToUpdate({ ...profesorToUpdate, Años_experiencia: '' }); // Limpiar campo
        return; // Salir si está fuera del rango
      }

      // Si pasa todas las validaciones, actualizar el estado
      setProfesorToUpdate({ ...profesorToUpdate, Años_experiencia: value });
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
                




