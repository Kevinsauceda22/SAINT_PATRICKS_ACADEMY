import React, { useState, useEffect } from 'react'
import { CIcon } from '@coreui/icons-react'
import { cilXCircle, cilCheckCircle, cilHistory,  cilSpreadsheet ,cilFile, cilDescription  } from '@coreui/icons';
import { jsPDF } from 'jspdf';
import ExcelJS from 'exceljs';
import 'jspdf-autotable';
import axios from 'axios'; // Asegúrate de instalar axios si no lo tienes
import {
  cilSearch,
  cilBrushAlt,
  cilPen,
  cilTrash,
  cilPlus,
  cilSave,
  cilContact,
  cilPeople,
} from '@coreui/icons'
import { useNavigate } from 'react-router-dom'
import swal from 'sweetalert2' // Importar SweetAlert
import 'jspdf-autotable' // Para crear tablas en los archivos PDF
import * as XLSX from 'xlsx' // Para generar archivos Excel
import { saveAs } from 'file-saver' // Para descargar archivos en el navegador
import Select from 'react-select' // Para crear un seleccionador dinamico
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
  CFormCheck,
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

const ListaPersonas = () => {
  const { canSelect, canDelete, canInsert, canUpdate } = usePermission('ListaPersonas');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [personas, setPersonas] = useState([])
  const [modalVisible, setModalVisible] = useState(false)
  const [modalUpdateVisible, setModalUpdateVisible] = useState(false)
  const [modalDeleteVisible, setModalDeleteVisible] = useState(false)
  const [nuevaPersona, setNuevaPersona] = useState({
    tipo_documento: '', 
    dni_persona: '',
    Nombre: '',
    Segundo_nombre: '',
    Primer_apellido: '',
    Segundo_apellido: '',
    direccion_persona: '',
    fecha_nacimiento: '',
    Estado_Persona: '',
    principal: '',
    cod_tipo_persona: '',
    cod_nacionalidad: '',
    cod_departamento: '',
    cod_municipio: '',
    cod_genero: '',

  })
  const [personaToUpdate, setPersonaToUpdate] = useState({});


  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  const [personaToDelete, setPersonaToDelete] = useState({})
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [recordsPerPage, setRecordsPerPage] = useState(10)

  const [tipoPersona, setTipoPersona] = useState([])
  const [generos, setGeneros] = useState([])
  const [departamentos, setDepartamentos] = useState([])
  const [tipoDocumento, setTipoDocumento] = useState([]); 
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  




  
  const [municipio, setMunicipio] = useState([])

    //Funciones para busqueda, seleccion y edición 
  const [buscadorMunicipio, setBuscadorMunicipio] = useState(''); // Valor del input de búsqueda
  const [municipiosFiltrados, setMunicipiosFiltrados] = useState([]); // Resultados filtrados
  const [isDropdownOpenMunicipio, setIsDropdownOpenMunicipio] = useState(false); // Control del dropdown

  
  //Funciones para busqueda, seleccion e inserción 
  const [buscadorMunicipioNuevo, setBuscadorMunicipioNuevo] = useState(''); // Input de búsqueda para agregar
  const [municipiosFiltradosNuevo, setMunicipiosFiltradosNuevo] = useState([]); // Resultados filtrados para agregar
  const [isDropdownOpenMunicipioNuevo, setIsDropdownOpenMunicipioNuevo] = useState(false); // Estado del dropdown en agregar

  const [nacionalidad, setNacionalidad] = useState([]); // Estado para todas las nacionalidades

  //Funciones para busqueda, seleccion y edición 
  const [buscadorNacionalidad, setBuscadorNacionalidad] = useState(''); // Valor del input de búsqueda
  const [nacionalidadesFiltradas, setNacionalidadesFiltradas] = useState([]); // Resultados filtrados
  const [isDropdownOpenNacionalidad, setIsDropdownOpenNacionalidad] = useState(false); // Control del dropdown

  //Funciones para busqueda, seleccion e inserción 
  const [buscadorNacionalidadNuevo, setBuscadorNacionalidadNuevo] = useState(''); // Input de búsqueda de nacionalidad en agregar
  const [nacionalidadesFiltradasNuevo, setNacionalidadesFiltradasNuevo] = useState([]); // Nacionalidades filtradas en agregar
  const [isDropdownOpenNacionalidadNuevo, setIsDropdownOpenNacionalidadNuevo] = useState(false); // Dropdown de nacionalidad en agregar

  const [departamentoSeleccionado, setDepartamentoSeleccionado] = useState(null);

  
  
  const currentYear = new Date().getFullYear();
  const minYear = currentYear - 90;
  const maxYear = currentYear - 4;



  const [errorMessages, setErrorMessages] = useState({
    tipo_documento: '', 
    dni_persona: '',
    Nombre: '',
    Segundo_nombre: '',
    Primer_apellido: '',
    Segundo_apellido: '',
    direccion_persona: '',
    fecha_nacimiento: '',
    Estado_Persona: '',
    principal: '',
    cod_tipo_persona: '',
    cod_nacionalidad: '',
    cod_departamento: '',
    cod_municipio: '',
    cod_genero: ''

  })

  const [showDetailModal, setShowDetailModal] = useState(false) // Estado para abrir/cerrar el modal
  const [selectedPersona, setSelectedPersona] = useState(null) // Estado para la persona seleccionada

  const [loading, setLoading] = useState(false);

  const navigate = useNavigate()

  const abrirEstructuraFamiliarModal = (personas) => {
    console.log('Persona seleccionada en el componente origen:', personas); // Verifica que los datos estén presentes
    navigate('/ListaEstructura', { state: { personaSeleccionada: personas } });
  };
  
  const abrirContactoModal = (personas) => {
    console.log('Persona seleccionada en el componente origen:', personas); // Verifica que los datos estén presentes
    navigate('/contacto', { state: { personaSeleccionada: personas } });
  };

  const abrirProcedenciaEstudianteModal = (personas) => {
    console.log('Persona seleccionada en el componente origen:', personas); // Verifica que los datos estén presentes
    navigate('/ListaProcedenciaEstudiante', { state: { personaSeleccionada: personas } });
  };

  {/* ***********************************************************FUNCIONES DE VALIDACION*****************************************************/}

  
// Restante del código sigue igual...

// Formateo de fechas
const formatearFecha = (fecha_nacimiento) => {
  if (!fecha_nacimiento) return '';
  const fechaObj = new Date(fecha_nacimiento);
  const year = fechaObj.getFullYear();
  const month = String(fechaObj.getMonth() + 1).padStart(2, '0');
  const day = String(fechaObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

{/********************************************************************************************************************************************/}
// Deshabilitar copiar y pegar
const disableCopyPaste = (e) => {
  e.preventDefault();
  swal.fire({
    icon: 'warning',
    title: 'Acción bloqueada',
    text: 'Copiar y pegar no está permitido.',
  });
};

{/********************************************************************************************************************************************/}

useEffect(() => {
  if (personas.length > 0) {
    const fechaFormateada = formatearFecha(personas[0]?.fecha_nacimiento);
    console.log('Fecha recibida:', personas[0]?.fecha_nacimiento);
    setPersonaToUpdate({
      ...personaToUpdate,
      fecha_nacimiento: fechaFormateada,
    });
    setFechaNacimiento(fechaFormateada);
  }
}, [personas]);

{/********************************************************************************************************************************************/}

useEffect(() => {
  const handleClickOutside = (event) => {
    if (!event.target.closest('.dropdown-container')) {
      setIsDropdownOpenMunicipioNuevo(false);
      setIsDropdownOpenMunicipio(false);
      setIsDropdownOpenNacionalidadNuevo(false);
      setIsDropdownOpenNacionalidad(false);
    }
  };

  document.addEventListener('click', handleClickOutside);
  
  return () => {
    document.removeEventListener('click', handleClickOutside);
  };
}, []);

{/********************************************************************************************************************************************/}
useEffect(() => {
  setMunicipiosFiltradosNuevo(
    departamentoSeleccionado 
      ? municipio.filter(mun => mun.Cod_departamento === departamentoSeleccionado)
      : municipio // ✅ Si no hay departamento, aseguramos que tenga todos los municipios
  );
}, [departamentoSeleccionado]);

{/********************************************************************************************************************************************/}
useEffect(() => {
  setMunicipiosFiltrados(
    personaToUpdate.cod_departamento 
      ? municipio.filter(mun => mun.Cod_departamento === parseInt(personaToUpdate.cod_departamento)) 
      : municipio // ✅ Si no hay departamento, usamos todos los municipios
  );
}, [personaToUpdate.cod_departamento]);

{/********************************************************************************************************************************************/}
useEffect(() => {
  if (!departamentoSeleccionado) {
    setMunicipiosFiltradosNuevo(municipio); // ✅ Si no hay departamento, usar todos los municipios
  } else {
    setMunicipiosFiltradosNuevo(municipio.filter(mun => mun.Cod_departamento === departamentoSeleccionado));
  }
}, [departamentoSeleccionado]);

{/********************************************************************************************************************************************/}
useEffect(() => {
  if (nuevaPersona.cod_departamento) {
    const municipiosFiltrados = municipio.filter(
      (mun) => mun.Cod_departamento === parseInt(nuevaPersona.cod_departamento) // 💡 Aseguramos que el valor es un número
    );

    setMunicipiosFiltradosNuevo(municipiosFiltrados);
    setBuscadorMunicipioNuevo(''); // 🔄 Limpiar el buscador de municipio al cambiar de departamento

    console.log("🛠 Municipios filtrados según departamento:", municipiosFiltrados);
  }
}, [nuevaPersona.cod_departamento]); // 🔄 Se ejecuta cada vez que cambia el departamento

{/********************************************************************************************************************************************/}
useEffect(() => {
  const tipoSeleccionado = tipoPersona.find(tipo => tipo.Cod_tipo_persona === parseInt(nuevaPersona.cod_tipo_persona, 10));
  
  if (tipoSeleccionado && tipoSeleccionado.Tipo_persona === 'ESTUDIANTE') {
    setNuevaPersona(prevState => ({ ...prevState, principal: false }));
  }
}, [nuevaPersona.cod_tipo_persona]);



{/****************************************************RESETEAR FORMULARIO Y CERRAR MODAL*************************************************/}

const resetNuevaPersona = () => { 
  setNuevaPersona({ 
      tipo_documento: '', 
      dni_persona: '', 
      Nombre: '', 
      Segundo_nombre: '', 
      Primer_apellido: '', 
      Segundo_apellido: '', 
      direccion_persona: '', 
      fecha_nacimiento: '', 
      Estado_Persona: '', 
      cod_tipo_persona: '', 
      principal: '', 
      cod_nacionalidad: '', 
      cod_departamento: '', 
      cod_municipio: '', 
      cod_genero: '', 
  });

  // 🔹 También limpiar los valores de búsqueda
  setBuscadorNacionalidadNuevo('');
  setBuscadorMunicipioNuevo('');
};

const resetPersonaToUpdate = () => { 
  setPersonaToUpdate({ 
      tipo_documento: '', 
      cod_persona: '', 
      dni_persona: '', 
      Nombre: '', 
      Segundo_nombre: '', 
      Primer_apellido: '', 
      Segundo_apellido: '', 
      direccion_persona: '', 
      fecha_nacimiento: '', 
      Estado_Persona: '', 
      cod_tipo_persona: '', 
      principal: '', 
      cod_nacionalidad: '', 
      cod_departamento: '', 
      cod_municipio: '', 
      cod_genero: '', 
  });

  // 🔹 También limpiar los valores de búsqueda
  setBuscadorNacionalidadNuevo('');
  setBuscadorMunicipioNuevo('');
};


{/**********************************************************************************************************************************************/}

const handlePersonaInputChange = (e, setFunction) => {
  let value = e.target.value;

  // 🔄 No permitir espacios consecutivos
  value = value.replace(/\s{2,}/g, " ");

  // 🔄 No permitir que una letra se repita más de 3 veces consecutivamente
  if (/([a-zA-ZÁÉÍÓÚáéíóúÑñ])\1{2,}/.test(value)) {
    swal.fire({
      icon: "warning",
      title: "Repetición de letras",
      text: "No se permite que la misma letra se repita más de 3 veces consecutivas.",
    });
    return;
  }

  setFunction((prevState) => ({
    ...prevState,
    [e.target.name]: value, // ✅ Actualiza el campo específico en el estado
  }));

  setHasUnsavedChanges(true); // ✅ Marca que hay cambios sin guardar
};

// 🔄 **Reseteamos cambios cuando se guarda**
const resetHasUnsavedChanges = () => {
  setHasUnsavedChanges(false);
};

{/**********************************************************************************************************************************************/}
const handleCloseModal = (setModalVisible, resetData, formData = {}, hasUnsavedChanges, setHasUnsavedChanges) => {
  const hayDatos = Object.values(formData).some(value => 
    typeof value === 'string' && value.trim() !== ''
  );

  if (hayDatos || hasUnsavedChanges) { // 🔄 También verifica cambios con `hasUnsavedChanges`
    swal.fire({
      title: '¿Estás seguro?',
      text: 'Si cierras este formulario, perderás todos los datos ingresados.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, cerrar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        resetData();
        setModalVisible(false);
        setHasUnsavedChanges(false); // ✅ Ahora también resetea `hasUnsavedChanges` cuando se confirma el cierre
      }
    });
  } else {  
    setModalVisible(false);
  }
};


{/******************************************************************************************************************************************* */}

const closeUpdateModal = () => {
  handleCloseModal(setModalUpdateVisible, resetPersonaToUpdate, personaToUpdate);
};

const closeAddModal = () => {
  handleCloseModal(setModalVisible, resetNuevaPersona, nuevaPersona);
};


const openAddModal = () => {
  setModalVisible(true);
};


const openDeleteModal = (persona) => {
  setPersonaToDelete(persona);
  setModalDeleteVisible(true);
};

{/********************************************************************************************************************************************/}

const openUpdateModal = (persona) => {

  const fechaFormateada = persona.fecha_nacimiento ? formatearFecha(persona.fecha_nacimiento) : '';

  // Obtener la nacionalidad y municipio en formato correcto
  const nacionalidadSeleccionada = nacionalidad.find(nac => nac.Cod_nacionalidad === persona.cod_nacionalidad);
  const municipioSeleccionado = municipio.find(mun => mun.Cod_municipio === persona.cod_municipio);

  console.log("Nacionalidad seleccionada en el input:", nacionalidadSeleccionada);
  console.log("Municipio seleccionado en el input:", municipioSeleccionado);

  // Armar el objeto actualizado para editar
  const updatedPersona = {
    ...persona,
    fecha_nacimiento: fechaFormateada,
    buscadorNacionalidad: nacionalidadSeleccionada 
      ? `${nacionalidadSeleccionada.Id_nacionalidad.toUpperCase()} - ${nacionalidadSeleccionada.pais_nacionalidad.toUpperCase()}` 
      : persona.buscadorNacionalidad || '',
    buscadorMunicipio: municipioSeleccionado 
      ? `${municipioSeleccionado.Nombre_departamento.toUpperCase()} - ${municipioSeleccionado.Nombre_municipio.toUpperCase()}` 
      : persona.buscadorMunicipio || '',
  };

  console.log("personaToUpdate después de inicialización:", updatedPersona);

  // Actualizamos el objeto global con los datos a editar
  setPersonaToUpdate(updatedPersona);

  // ********** NUEVO **********
  // Sincronizamos los estados locales de los inputs con los datos que se van a editar
  setBuscadorNacionalidad(updatedPersona.buscadorNacionalidad);
  setBuscadorMunicipio(updatedPersona.buscadorMunicipio);
  // *****************************

  // Espera un poco para que React procese los cambios, luego abre el modal
  setTimeout(() => {
    setModalUpdateVisible(true);
  }, 100);
};


{/***********************************FUNCION PARA BUSQUEDA Y SELECCION DE NACIONALIDAD CON VALIDACIONES**************************************/}

const handleBuscarNacionalidad = (e) => {
  const filtro = e.target.value.toUpperCase();
  setBuscadorNacionalidad(filtro);

  const filtradas = nacionalidad.filter((nac) =>
    (nac.pais_nacionalidad && nac.pais_nacionalidad.toUpperCase().includes(filtro)) ||
    (nac.Id_nacionalidad && nac.Id_nacionalidad.toUpperCase().includes(filtro))
  );

  setNacionalidadesFiltradas(filtradas);
  setIsDropdownOpenNacionalidad(filtradas.length > 0);

  console.log("Filtro aplicado:", filtro);
  console.log("Nacionalidades filtradas:", filtradas);
};

{/********************************************************************************************************************************************/}
const handleSeleccionarNacionalidad = (nacionalidad) => {
  const nuevoValor = `${nacionalidad.Id_nacionalidad.toUpperCase()} - ${nacionalidad.pais_nacionalidad.toUpperCase()}`;

  setPersonaToUpdate(prev => {
    const updatedPersona = {
      ...prev,
      cod_nacionalidad: nacionalidad.Cod_nacionalidad,
      buscadorNacionalidad: nuevoValor,
    };
    
    console.log("Persona actualizada correctamente:", updatedPersona);
    return updatedPersona;
  });

  setBuscadorNacionalidad(nuevoValor);
  setIsDropdownOpenNacionalidad(false);
};

{/*********************************************************************************************************************************************/}
const handleBuscarNacionalidadNuevo = (e) => {
  const filtro = e.target.value.toUpperCase();
  setBuscadorNacionalidadNuevo(filtro);

  const filtradas = nacionalidad.filter((nac) =>
    (nac.pais_nacionalidad && nac.pais_nacionalidad.toUpperCase().includes(filtro)) ||
    (nac.Id_nacionalidad && nac.Id_nacionalidad.toUpperCase().includes(filtro))
  );

  setNacionalidadesFiltradasNuevo(filtradas);
  setIsDropdownOpenNacionalidadNuevo(filtradas.length > 0);

  console.log("Filtro aplicado (agregar):", filtro);
  console.log("Nacionalidades filtradas (agregar):", filtradas);
};

{/******************************************************************************************************************************************/}
const handleSeleccionarNacionalidadNuevo = (nacionalidad) => {
  const nuevoValor = `${nacionalidad.Id_nacionalidad.toUpperCase()} - ${nacionalidad.pais_nacionalidad.toUpperCase()}`;

  setNuevaPersona(prev => ({
    ...prev,
    cod_nacionalidad: nacionalidad.Cod_nacionalidad,
    buscadorNacionalidad: nuevoValor,
  }));

  setBuscadorNacionalidadNuevo(nuevoValor);
  setIsDropdownOpenNacionalidadNuevo(false);

  console.log("Nacionalidad asignada correctamente en agregar:", nuevoValor);
};


{/******************************************************************************************************************************************/}

const handleSeleccionarDepartamento = (departamento) => {
  setDepartamentoSeleccionado(departamento.Cod_departamento);

  // ✅ Filtramos los municipios al cambiar el departamento y garantizamos que la lista no quede vacía
  const municipiosFiltrados = municipio.filter(mun => mun.Cod_departamento === departamento.Cod_departamento);
  setMunicipiosFiltrados(municipiosFiltrados);
  setBuscadorMunicipio('');

  console.log("🛠 Departamento seleccionado:", departamento.Nombre_departamento);
  console.log("🛠 Municipios disponibles después de filtrar:", municipiosFiltrados);
};

{/*********************************************************************************************************************************************/}
const handleSeleccionarDepartamentoUpdate = (departamento) => {
  setDepartamentoSeleccionado(departamento.Cod_departamento);

  // Filtrar los municipios del departamento seleccionado
  const municipiosFiltrados = municipio.filter(mun => mun.Cod_departamento === departamento.Cod_departamento);
  setMunicipiosFiltrados(municipiosFiltrados); // ✅ Usamos `setMunicipiosFiltrados` para edición
  setBuscadorMunicipio('');

  console.log("Departamento seleccionado en edición:", departamento.Nombre_departamento);
  console.log("Municipios disponibles después de filtrar:", municipiosFiltrados);
};


{/***********************************FUNCION PARA BUSQUEDA Y SELECCION DE MUNICIPIO CON VALIDACIONES**************************************/}

const handleBuscarMunicipio = (e) => {
  const filtro = e.target.value.toUpperCase();
  setBuscadorMunicipio(filtro);

  if (filtro === '') {
    // ✅ Restauramos automáticamente los municipios del departamento seleccionado
    setMunicipiosFiltrados(
      personaToUpdate.cod_departamento 
        ? municipio.filter(mun => mun.Cod_departamento === parseInt(personaToUpdate.cod_departamento))
        : municipio // 🔄 Si no hay departamento, usar todos los municipios
    );
    
    setIsDropdownOpenMunicipio(true);
    console.log("🛠 Buscador vacío, restaurando municipios originales en edición.");
  } else {
    // 🔄 Filtrar dentro de los municipios del departamento seleccionado
    const filtrados = municipiosFiltrados.filter(mun =>
      mun.Nombre_municipio.toUpperCase().includes(filtro)
    );

    setMunicipiosFiltrados(filtrados);
    setIsDropdownOpenMunicipio(filtrados.length > 0);

    console.log("🛠 Municipios filtrados después de búsqueda en edición:", filtrados);
  }
};


{/*********************************************************************************************************************************************/}
const handleSeleccionarMunicipio = (municipio) => {
  const nuevoValor = `${municipio.Nombre_departamento.toUpperCase()} - ${municipio.Nombre_municipio.toUpperCase()}`;

  setPersonaToUpdate(prev => ({
    ...prev,
    cod_municipio: municipio.Cod_municipio,
    buscadorMunicipio: nuevoValor,
  }));

  setBuscadorMunicipio(nuevoValor);
  setIsDropdownOpenMunicipio(false);

  console.log("Municipio asignado correctamente en edición:", nuevoValor);
};

{/*********************************************************************************************************************************************/}
const handleBuscarMunicipioNuevo = (e) => {
  const filtro = e.target.value.toUpperCase();
  setBuscadorMunicipioNuevo(filtro);

  if (filtro === '') {
    // ✅ Restauramos automáticamente los municipios del departamento seleccionado al borrar la búsqueda
    setMunicipiosFiltradosNuevo(
      departamentoSeleccionado 
        ? municipio.filter(mun => mun.Cod_departamento === departamentoSeleccionado)
        : municipio // 🔄 Si no hay departamento, usar todos los municipios
    );
    
    setIsDropdownOpenMunicipioNuevo(true); 
    console.log("🛠 Buscador vacío, restaurando municipios originales.");
  } else {
    // 🔄 Filtrar dentro de los municipios del departamento seleccionado
    const filtrados = municipiosFiltradosNuevo.filter(mun =>
      mun.Nombre_municipio.toUpperCase().includes(filtro)
    );

    setMunicipiosFiltradosNuevo(filtrados);
    setIsDropdownOpenMunicipioNuevo(filtrados.length > 0);

    console.log("🛠 Municipios filtrados después de búsqueda:", filtrados);
  }
};



{/************************************************************************************************************************************************/}
const handleSeleccionarMunicipioNuevo = (municipio) => {
  const nuevoValor = `${municipio.Nombre_departamento.toUpperCase()} - ${municipio.Nombre_municipio.toUpperCase()}`;

  setNuevaPersona(prev => ({
    ...prev,
    cod_municipio: municipio.Cod_municipio,
    buscadorMunicipio: nuevoValor,
  }));

  setBuscadorMunicipioNuevo(nuevoValor);
  setIsDropdownOpenMunicipioNuevo(false);

  console.log("Municipio asignado correctamente en agregar:", nuevoValor);
};


{/******************************************************TABLAS RELACIONADAS***************************************************************/}

const handleKeyPress = (e) => {
  const char = String.fromCharCode(e.which);

  // Bloquear caracteres no permitidos
  if (/[^A-Za-záéíóúÁÉÍÓÚñÑ\s]/.test(char) || // Bloquear caracteres especiales y números
      (/(.)\1{2,}/.test(e.target.value + char)) || // Bloquear más de dos letras repetidas consecutivas
      (/\s{3,}/.test(e.target.value + char)) || // Bloquear más de un espacio consecutivo
      /\d/.test(char)) { // Bloquear números
    e.preventDefault();
  }
};

{/***************************************************************************************************************************************************/}
const fetchPersonas = async () => {
  try {
    const response = await fetch('http://localhost:4000/api/personas/verPersonas');
    const data = await response.json();

    console.log('Datos recibidos del servidor:', data);

    // 🔄 **Agregar índice y ordenar de forma descendente (último creado primero)**
    const dataWithIndex = data.map((persona, index) => ({
      ...persona,
      originalIndex: index,
    })).reverse(); // 🔄 Invierte el orden para que el último creado aparezca primero

    // 🔄 **Ordenar: Mantener orden original para estado 1/true, mover estado 0/false al final**
    const sortedData = dataWithIndex.sort((a, b) => {
      if (a.estado === 0 || a.estado === false) return 1;  // Mueve estado 0/false al final
      if (b.estado === 0 || b.estado === false) return -1; // Mantiene estado 1/true en su posición original
      return 0; // 🔄 Mantiene el orden original sin alteraciones
    });

    console.log('Datos ordenados correctamente:', sortedData);

    setPersonas(sortedData);
  } catch (error) {
    console.error('Error al obtener las personas:', error);
  }
};


{/********************************************************************************************************************************************/}
const fetchNacionalidad = async () => {
  try {
    const response = await fetch('http://localhost:4000/api/nacionalidad/verTodoNacionalidad');
    const data = await response.json();
    console.log('Datos recibidos de nacionalidad:', data);

    // Filtrar solo los elementos con estado === 1
    const nacionalidadFiltrada = data.filter((item) => item.estado === 1);

    setNacionalidad(nacionalidadFiltrada); // Actualiza el estado solo con los datos que tienen estado 1
    console.log('Datos filtrados con estado 1:', nacionalidadFiltrada); // Depuración final
  } catch (error) {
    console.error('Error al obtener los nacionalidad:', error);
  }
};


{/*********************************************************************************************************************************************/}
const fetchMunicipio = async () => {
  try {
    const response = await fetch('http://localhost:4000/api/personas/verMunicipios');
    const data = await response.json();
    console.log('Datos recibidos de municipio:', data);

    if (Array.isArray(data) && Array.isArray(data[0])) {
      // 🔄 Filtramos solo los municipios activos (estado === 1)
      const municipiosActivos = data[0].filter((municipio) => municipio.estado === 1);
      setMunicipio(municipiosActivos);
      console.log('Municipios activos almacenados:', municipiosActivos);
    } else {
      console.error('Formato de datos inesperado:', data);
      setMunicipio([]);
    }
  } catch (error) {
    console.error('Error al obtener los municipios:', error);
  }
};



{/**********************************************************************************************************************************************/}
const fetchTipoDocumento = async () => {
  try {
    const response = await fetch('http://localhost:4000/api/tipoDocumento/verTodoTipoDocumentos');
    const data = await response.json();
    console.log('Datos obtenidos:', data); // Depuración

    if (!Array.isArray(data)) {
      console.error('Error: La API no está devolviendo un arreglo, sino:', data);
      return;
    }

    // Filtrar solo los tipos de documento con estado === 1
    const documentosActivos = data.filter((tipoDocumento) => tipoDocumento.estado === 1);

    // Asignar nuevos índices desde 1
    const dataWithIndex = documentosActivos.map((tipoDocumento, index) => ({
      ...tipoDocumento,
      originalIndex: index + 1,
    }));

    setTipoDocumento(dataWithIndex);
    console.log('Tipos de documento filtrados con estado 1:', dataWithIndex); // Depuración final
  } catch (error) {
    console.error('Error al obtener los tipos de documento:', error);
  }
};

  
{/*********************************************************************************************************************************************/}
const fetchDepartamentos = async () => {
  try {
    const response = await fetch('http://localhost:4000/api/personas/verDepartamentos');
    const data = await response.json();
    console.log('Datos recibidos de departamentos:', data); // Depuración

    if (!Array.isArray(data)) {
      console.error('Error: La API no está devolviendo un arreglo válido:', data);
      return;
    }

    // Filtrar solo los departamentos con estado === 1
    const departamentosActivos = data.filter((departamento) => departamento.estado === 1);

    setDepartamentos(departamentosActivos); // Actualiza el estado solo con los datos activos
    console.log('Departamentos filtrados con estado 1:', departamentosActivos); // Depuración final
  } catch (error) {
    console.error('Error al obtener los departamentos:', error);
  }
};

{/********************************************************************************************************************************************/}
const fetchTipoPersona = async () => {
  try {
    const response = await fetch('http://localhost:4000/api/personas/verTipoPersona');
    const data = await response.json();
    console.log('Datos recibidos de tipo de persona:', data); // Depuración

    if (!Array.isArray(data)) {
      console.error('Error: La API no está devolviendo un arreglo válido:', data);
      return;
    }

    // Filtrar solo los tipos de persona con estado === 1
    const tiposPersonaActivos = data.filter((tipoPersona) => tipoPersona.estado === 1);

    setTipoPersona(tiposPersonaActivos); // Actualiza el estado solo con los datos activos
    console.log('Tipos de persona filtrados con estado 1:', tiposPersonaActivos); // Depuración final
  } catch (error) {
    console.error('Error al obtener los tipos de persona:', error);
  }
};

{/*******************************************************************************************************************************************/}
const fetchGeneros = async () => {
  try {
    const response = await fetch('http://localhost:4000/api/personas/verGeneros');
    const data = await response.json();
    console.log('Datos recibidos de géneros:', data); // Depuración

    if (!Array.isArray(data)) {
      console.error('Error: La API no está devolviendo un arreglo válido:', data);
      return;
    }

    // Filtramos los géneros con estado === 1
    const generosActivos = data.filter((genero) => genero.estado === 1);

    setGeneros(generosActivos); // Actualiza el estado con los datos filtrados
    console.log('Géneros filtrados con estado 1:', generosActivos); // Depuración final
  } catch (error) {
    console.error('Error al obtener los géneros:', error);
  }
};

{/******************************************************************************************************************************************/}
  useEffect(() => {
    fetchPersonas()
    fetchTipoDocumento()
    fetchDepartamentos()
    fetchNacionalidad()
    fetchMunicipio()
    fetchTipoPersona()
    fetchGeneros()
  }, [])

{/**********************************************************FUNCION PARA CREAR UNA PERSONA*****************************************************/}

const handleCreatePersona = async () => {
  const errores = {};

  const fechaIngresada = new Date(nuevaPersona.fecha_nacimiento);
  const añoNacimiento = fechaIngresada.getFullYear();
  const añoActual = new Date().getFullYear();

  if (añoNacimiento < añoActual - 100 || añoNacimiento > añoActual) {
    errores.fecha_nacimiento = `La fecha debe estar entre ${añoActual - 100} y ${añoActual}.`;
  }

  // Nueva validación de DNI
  if (/\s/.test(nuevaPersona.dni_persona)) {
    errores.dni_persona = 'El documento no debe contener espacios.';
  }
  if (/[^A-Za-z0-9]/.test(nuevaPersona.dni_persona)) {
    errores.dni_persona = 'Solo se permiten letras y números.';
  }
  if (/(.)\1{10,}/.test(nuevaPersona.dni_persona)) {
    errores.dni_persona = 'No se pueden repetir más de 10 veces un mismo carácter.';
  }

  // Validaciones de nombres y apellidos
  const campos = [
    { campo: nuevaPersona.Nombre, nombreCampo: 'Nombre' },
    { campo: nuevaPersona.Segundo_nombre, nombreCampo: 'Segundo_nombre' },
    { campo: nuevaPersona.Primer_apellido, nombreCampo: 'Primer_apellido' },
    { campo: nuevaPersona.Segundo_apellido, nombreCampo: 'Segundo_apellido' },
  ];
  campos.forEach(({ campo, nombreCampo }) => {
    if (!campo || campo.length < 2 || campo.length > 50) {
      errores[nombreCampo] = `${nombreCampo.replace('_', ' ')} debe tener entre 2 y 50 caracteres.`;
    }
  });

  const camposRequeridos = [
    { campo: nuevaPersona.tipo_documento, nombreCampo: 'tipo_documento' },
    { campo: nuevaPersona.cod_genero, nombreCampo: 'cod_genero' },
    { campo: nuevaPersona.cod_tipo_persona, nombreCampo: 'cod_tipo_persona' },
    { campo: nuevaPersona.cod_nacionalidad, nombreCampo: 'cod_nacionalidad' },
    { campo: nuevaPersona.cod_departamento, nombreCampo: 'cod_departamento' },
    { campo: nuevaPersona.cod_municipio, nombreCampo: 'cod_municipio' },
    { campo: nuevaPersona.fecha_nacimiento, nombreCampo: 'fecha_nacimiento' },
  ];
  camposRequeridos.forEach(({ campo, nombreCampo }) => {
    if (!campo || campo === '') {
      errores[nombreCampo] = `Debe seleccionar ${nombreCampo.replace('_', ' ')}.`;
    }
  });

  if (Object.keys(errores).length > 0) {
    setErrorMessages(errores);
    return;
  }

  console.log('Datos a enviar:', {
    dni_persona: nuevaPersona.dni_persona,
    tipo_documento: nuevaPersona.tipo_documento,
    Nombre: nuevaPersona.Nombre,
    Segundo_nombre: nuevaPersona.Segundo_nombre,
    Primer_apellido: nuevaPersona.Primer_apellido,
    Segundo_apellido: nuevaPersona.Segundo_apellido,
    direccion_persona: nuevaPersona.direccion_persona,
    fecha_nacimiento: nuevaPersona.fecha_nacimiento,
    principal: false,
    cod_tipo_persona: nuevaPersona.cod_tipo_persona,
    cod_nacionalidad: nuevaPersona.cod_nacionalidad,
    cod_departamento: nuevaPersona.cod_departamento,
    cod_municipio: nuevaPersona.cod_municipio,
    cod_genero: nuevaPersona.cod_genero,
  });

  try {
    const response = await fetch('http://localhost:4000/api/personas/crearPersona', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dni_persona: nuevaPersona.dni_persona,
        tipo_documento: nuevaPersona.tipo_documento,
        Nombre: nuevaPersona.Nombre,
        Segundo_nombre: nuevaPersona.Segundo_nombre,
        Primer_apellido: nuevaPersona.Primer_apellido,
        Segundo_apellido: nuevaPersona.Segundo_apellido,
        direccion_persona: nuevaPersona.direccion_persona,
        fecha_nacimiento: nuevaPersona.fecha_nacimiento,
        principal: false,
        cod_tipo_persona: nuevaPersona.cod_tipo_persona,
        cod_nacionalidad: nuevaPersona.cod_nacionalidad,
        cod_departamento: nuevaPersona.cod_departamento,
        cod_municipio: nuevaPersona.cod_municipio,
        cod_genero: nuevaPersona.cod_genero,
      }),
    });

    if (response.ok) {
      swal.fire({
        icon: 'success',
        title: 'Creación exitosa',
        text: 'La persona ha sido creada correctamente.',
      });
      setModalVisible(false);
      fetchPersonas();
      resetNuevaPersona();
      setErrorMessages({});
    } else {
      const errorData = await response.json();
      setErrorMessages(errorData.errores || {});
      swal.fire({
        icon: 'error',
        title: 'Error',
        text: `No se pudo crear la persona. Detalle: ${errorData.mensaje}`,
      });
    }
  } catch (error) {
    console.error('Error al crear la persona:', error);
    swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Ocurrió un error al intentar crear la persona.',
    });
  }
};

  {/***************************************************FUNCION PARA ACTUALIZAR**************************************************************/}
  const handleUpdatePersona = async () => {
    console.log("=== Inicia handleUpdatePersona ===");

    // Espera un poco antes de leer el estado de `personaToUpdate`
    setTimeout(() => {
      console.log("personaToUpdate recibido:", personaToUpdate);
      console.log("Nacionalidad actual:", personaToUpdate.cod_nacionalidad, "| BuscadorNacionalidad:", personaToUpdate.buscadorNacionalidad);
      console.log("Municipio actual:", personaToUpdate.cod_municipio, "| BuscadorMunicipio:", personaToUpdate.buscadorMunicipio);
    }, 100);
    const errores = {};
  
    // Validación de fecha de nacimiento
    const fechaIngresada = new Date(personaToUpdate.fecha_nacimiento);
    const añoNacimiento = fechaIngresada.getFullYear();
    const añoActual = new Date().getFullYear();
    if (añoNacimiento < añoActual - 100 || añoNacimiento > añoActual) {
      errores.fecha_nacimiento = `La fecha debe estar entre ${añoActual - 100} y ${añoActual}.`;
    }
  
    // Validaciones para DNI
    if (/\s/.test(personaToUpdate.dni_persona)) {
      errores.dni_persona = 'El documento no debe contener espacios.';
    }
    if (/[^A-Za-z0-9]/.test(personaToUpdate.dni_persona)) {
      errores.dni_persona = 'Solo se permiten letras y números.';
    }
    if (/(.)\1{10,}/.test(personaToUpdate.dni_persona)) {
      errores.dni_persona = 'No se pueden repetir más de 10 veces un mismo carácter.';
    }
  
    // Validaciones de nombres y apellidos
    const campos = [
      { campo: personaToUpdate.Nombre, nombreCampo: 'Nombre' },
      { campo: personaToUpdate.Segundo_nombre, nombreCampo: 'Segundo nombre' },
      { campo: personaToUpdate.Primer_apellido, nombreCampo: 'Primer apellido' },
      { campo: personaToUpdate.Segundo_apellido, nombreCampo: 'Segundo apellido' },
    ];
    campos.forEach(({ campo, nombreCampo }) => {
      if (!campo || campo.length < 2 || campo.length > 50) {
        errores[nombreCampo] = `${nombreCampo} debe tener entre 2 y 50 caracteres.`;
      }
    });
  
    // Validaciones de campos requeridos
    const camposRequeridos = [
      { campo: personaToUpdate.tipo_documento, nombreCampo: 'tipo_documento' },
      { campo: personaToUpdate.cod_genero, nombreCampo: 'cod_genero' },
      { campo: personaToUpdate.cod_tipo_persona, nombreCampo: 'cod_tipo_persona' },
      { campo: personaToUpdate.cod_nacionalidad, nombreCampo: 'cod_nacionalidad' },
      { campo: personaToUpdate.cod_departamento, nombreCampo: 'cod_departamento' },
      { campo: personaToUpdate.cod_municipio, nombreCampo: 'cod_municipio' },
      { campo: personaToUpdate.fecha_nacimiento, nombreCampo: 'fecha_nacimiento' },
    ];
    camposRequeridos.forEach(({ campo, nombreCampo }) => {
      if (!campo || campo === '') {
        errores[nombreCampo] = `Debe seleccionar ${nombreCampo.replace('_', ' ')}.`;
      }
    });
  
    if (Object.keys(errores).length > 0) {
      console.log("Errores de validación:", errores);
      setErrorMessages(errores);
      return;
    }
  
    const datosEnviar = {
      cod_persona: personaToUpdate.cod_persona,
      dni_persona: personaToUpdate.dni_persona,
      tipo_documento: personaToUpdate.tipo_documento,
      Nombre: personaToUpdate.Nombre,
      Segundo_nombre: personaToUpdate.Segundo_nombre,
      Primer_apellido: personaToUpdate.Primer_apellido,
      Segundo_apellido: personaToUpdate.Segundo_apellido,
      direccion_persona: personaToUpdate.direccion_persona,
      fecha_nacimiento: personaToUpdate.fecha_nacimiento,
      principal: personaToUpdate.principal,
      cod_tipo_persona: personaToUpdate.cod_tipo_persona,
      cod_nacionalidad: personaToUpdate.cod_nacionalidad,
      cod_departamento: personaToUpdate.cod_departamento,
      cod_municipio: personaToUpdate.cod_municipio,
      cod_genero: personaToUpdate.cod_genero,
    };
  
    console.log("Datos a enviar para actualizar :", datosEnviar);
  
    try {
      const response = await fetch(`http://localhost:4000/api/personas/actualizarPersona/${personaToUpdate.cod_persona}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosEnviar),
      });
  
      if (response.ok) {
        console.log("Respuesta exitosa del servidor.");
        swal.fire({
          icon: 'success',
          title: 'Actualización exitosa',
          text: 'La persona ha sido actualizada correctamente.',
        });
        setModalUpdateVisible(false);
        resetPersonaToUpdate();
        await fetchPersonas(); // Recargar las personas
        setErrorMessages({});
      } else {
        const errorData = await response.json();
        console.log("Error en la respuesta del servidor:", errorData);
        setErrorMessages(errorData.errores || {});
        swal.fire({
          icon: 'error',
          title: 'Error',
          text: `No se pudo actualizar la persona. Detalle: ${errorData.mensaje}`,
        });
      }
    } catch (error) {
      console.error('Error al actualizar la persona:', error);
      swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Ocurrió un error al intentar actualizar la persona.',
      });
    }
  };
  
  
  
  
{/*******************************************************FUNCION PARA ELIMINAR ***************************************************************/}
  const handleDeletePersona = async () => {
    try {
      const response = await fetch(
        `http://localhost:4000/api/personas/eliminarPersona/${encodeURIComponent(personaToDelete.cod_persona)}`,
        {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
        },
      )

      if (response.ok) {
        fetchPersonas() // Cambia esto para que recargue las personas
        setModalDeleteVisible(false)
        swal.fire({ 
          icon: 'success',
          title: 'Eliminación exitosa',
          text: 'La persona ha sido eliminada correctamente.',
        })
      } else {
        swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo eliminar la persona.' })
      }
    } catch (error) {
      console.error('Error al eliminar la persona:', error)
    }
  }
{/*********************************************************************************************************************************/}

const toggleEstado = async (persona) => {
  const nuevoEstado = persona.estado ? 0 : 1;

  try {
    setLoading(true);

    const response = await axios.post('http://localhost:4000/api/personas/actualizarEstadoPersona', {
      cod_persona: persona.cod_persona,
      estado: nuevoEstado,
    });

    if (response.data.mensaje === 'Estado actualizado exitosamente') {
      // 🔄 **Actualizar estado en la lista y aplicar desvanecimiento**
      setPersonas((prevPersonas) => {
        const updatedPersonas = prevPersonas.map((p) =>
          p.cod_persona === persona.cod_persona ? { ...p, estado: nuevoEstado, fading: true } : p
        );

        // **Reordenar sin perder el orden original**
        setTimeout(() => {
          setPersonas((finalPersonas) => {
            const activos = finalPersonas.filter(p => p.estado === 1).sort((a, b) => b.originalIndex - a.originalIndex);
            const inactivos = finalPersonas.filter(p => p.estado === 0);

            return [...activos, ...inactivos.map(p => ({ ...p, fading: false }))];
          });
        }, 1000); // 🔄 Esperar 1 segundo antes de mover los inactivos al final

        return updatedPersonas;
      });
    } else {
      console.error('Error al cambiar el estado:', response.data.mensaje);
    }
  } catch (error) {
    console.error('Error al realizar la solicitud:', error);
  } finally {
    setLoading(false);
    fetchPersonas();
  }
};


  {/***************************************************FUNCIONES DE REPORTERIA Y BÚSQUEDA******************************************************/}
 
  const searchPersonas = (searchTerm) => {
    return personas.map((persona, index) => ({
      ...persona,
      originalIndex: index + 1, // Agregar índice original para ordenar
    })).filter((persona) => {
      
      // 📌 **Obteniendo valores correctos**
      const tipoDocumentoTexto = tipoDocumento.find((tipo) => tipo.Cod_tipo_documento === persona.tipo_documento)?.tipo_documento?.toUpperCase() || 'N/D';
      const tipoPersonaTexto = tipoPersona.find((tipo) => tipo.Cod_tipo_persona === persona.cod_tipo_persona)?.Tipo_persona?.toUpperCase() || 'N/D';
      const generoTexto = generos.find((genero) => genero.Cod_genero === persona.cod_genero)?.Tipo_genero?.toUpperCase() || 'N/D';
      const nacionalidadTexto = nacionalidad.find((nac) => nac.Cod_nacionalidad === persona.cod_nacionalidad)?.pais_nacionalidad?.toUpperCase() || 'N/D';
      const departamentoTexto = departamentos.find((depto) => depto.Cod_departamento === persona.cod_departamento)?.Nombre_departamento?.toUpperCase() || 'N/D';
      const municipioTexto = municipio.find((municipio) => municipio.cod_municipio === persona.cod_municipio)?.nombre_municipio?.toUpperCase() || 'N/D';
      const fechaNacimientoTexto = persona.fecha_nacimiento ? new Date(persona.fecha_nacimiento).toLocaleDateString('es-ES') : 'N/D';

      // ✅ **Corrección: Convertir estado booleano en texto**
      const estadoTexto = persona.estado === 1 ? 'ACTIVO' : persona.estado === 0 ? 'INACTIVO' : 'DESCONOCIDO';

      const principalTexto = persona.principal === 1 ? 'SÍ' : persona.principal === 0 ? 'NO' : 'DESCONOCIDO';

      
  
      // 🏷️ **Lógica de filtro actualizada**
      return (
        tipoDocumentoTexto.includes(searchTerm.toUpperCase()) ||
        persona.dni_persona?.toUpperCase().includes(searchTerm.toUpperCase()) ||
        persona.Nombre?.toUpperCase().includes(searchTerm.toUpperCase()) ||
        persona.Segundo_nombre?.toUpperCase().includes(searchTerm.toUpperCase()) ||  
        persona.Primer_apellido?.toUpperCase().includes(searchTerm.toUpperCase()) ||
        persona.Segundo_apellido?.toUpperCase().includes(searchTerm.toUpperCase()) ||
        persona.direccion_persona?.toUpperCase().includes(searchTerm.toUpperCase()) ||
        fechaNacimientoTexto.includes(searchTerm) ||
        estadoTexto.includes(searchTerm.toUpperCase()) ||  // 🔄 **Ahora permite buscar "Activo"/"Inactivo"**
        principalTexto.includes(searchTerm.toUpperCase()) ||  // 🔄 **Ahora permite buscar "SÍ"/"NO"**
        nacionalidadTexto.includes(searchTerm.toUpperCase()) ||
        departamentoTexto.includes(searchTerm.toUpperCase()) ||
        municipioTexto.includes(searchTerm.toUpperCase()) ||
        tipoPersonaTexto.includes(searchTerm.toUpperCase()) ||
        generoTexto.includes(searchTerm.toUpperCase())
      );
    });
  };
  
  
  // 🔄 **Filtrado actualizado**
  const filteredPersonas = searchPersonas(searchTerm);
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredPersonas.slice(indexOfFirstRecord, indexOfLastRecord);
  
  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= Math.ceil(filteredPersonas.length / recordsPerPage)) {
      setCurrentPage(pageNumber);
    }
  };
  
  

{/**********************************************************************************************************************************************/}
const ReportePersonasExcel = () => {
  if (!filteredPersonas || filteredPersonas.length === 0) {
    alert('No hay datos para exportar.');
    return;
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Reporte de Personas');

  // 🎯 **Título del documento**
  worksheet.mergeCells('A1:K1');  
  worksheet.getCell('A1').value = "SAINT PATRICK'S ACADEMY";
  worksheet.getCell('A1').font = { bold: true, size: 18, color: { argb: '006633' } };
  worksheet.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };

  worksheet.mergeCells('A2:K2');
  worksheet.getCell('A2').value = 'REPORTE DE PERSONAS';
  worksheet.getCell('A2').font = { bold: true, size: 16, color: { argb: '006633' } };
  worksheet.getCell('A2').alignment = { horizontal: 'center', vertical: 'middle' };

  // 📌 **Encabezados de la tabla**
const headerRow = worksheet.addRow([
    '#', 'Tipo Documento', 'DNI', 'Primer Nombre', 'Segundo Nombre', 
    'Primer Apellido', 'Segundo Apellido', 'Fecha Nacimiento', 'Tipo Persona', 'Principal', 'Estado'
]);

headerRow.eachCell((cell) => {
    cell.alignment = { horizontal: 'center' };
});


  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '006633' } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
  });

  // 📊 **Datos de la tabla**
  filteredPersonas.forEach((persona, index) => {
    const row = worksheet.addRow([
      index + 1,
      tipoDocumento.find((tipo) => tipo.Cod_tipo_documento === persona.tipo_documento)?.tipo_documento.toUpperCase() || 'N/D',
      persona.dni_persona?.toUpperCase() || 'N/D',
      persona.Nombre?.toUpperCase() || 'N/D',
      persona.Segundo_nombre?.toUpperCase() || 'N/D',
      persona.Primer_apellido?.toUpperCase() || 'N/D',
      persona.Segundo_apellido?.toUpperCase() || 'N/D',
      new Date(persona.fecha_nacimiento).toLocaleDateString('en-CA'),
      tipoPersona.find((tipo) => tipo.Cod_tipo_persona === persona.cod_tipo_persona)?.Tipo_persona.toUpperCase() || 'N/D',
      persona.principal ? 'SÍ' : 'NO',
      persona.estado === 1 ? 'ACTIVO' : 'INACTIVO'
    ]);

    // 🎨 **Estilos para la columna de Estado**
    const estadoCell = row.getCell(11);
    estadoCell.font = {
      bold: true,
      color: { argb: persona.estado === 1 ? '008000' : 'FF0000' } // ✅ Verde para "ACTIVO", rojo para "INACTIVO"
    };

    row.eachCell((cell) => {
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = {
        top: { style: 'thin', color: { argb: '000000' } },
        left: { style: 'thin', color: { argb: '000000' } },
        bottom: { style: 'thin', color: { argb: '000000' } },
        right: { style: 'thin', color: { argb: '000000' } },
      };
    });
  });

  // 📏 **Ajustar el ancho de las columnas**
  worksheet.columns.forEach((column) => {
    column.width = 18;
  });

  // 📂 **Crear archivo Excel**
  workbook.xlsx.writeBuffer().then((buffer) => {
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, 'Reporte_Personas.xlsx');
  });
};

  
{/********************************************************************************************************************************************/}


const ReportePersonasPDF = () => {
  const doc = new jsPDF('l', 'mm', 'letter'); // Horizontal

  if (!filteredPersonas || filteredPersonas.length === 0) {
    alert('No hay datos para exportar.');
    return;
  }

  const img = new Image();
  img.src = logo;

  img.onload = () => {
    const pageWidth = doc.internal.pageSize.width;

    // Encabezado
    doc.addImage(img, 'PNG', 10, 10, 30, 30);
    doc.setFontSize(14);
    doc.setTextColor(0, 102, 51);
    doc.text("SAINT PATRICK'S ACADEMY", pageWidth / 2, 20, { align: 'center' });

    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text('Casa Club del periodista, Colonia del Periodista', pageWidth / 2, 26, { align: 'center' });
    doc.text('Teléfono: (504) 2234-8871', pageWidth / 2, 30, { align: 'center' });
    doc.text('Correo: info@saintpatrickacademy.edu', pageWidth / 2, 34, { align: 'center' });

    doc.setFontSize(10);
    doc.setTextColor(0, 102, 51);
    doc.text('Reporte de Personas', pageWidth / 2, 40, { align: 'center' });

    doc.setLineWidth(0.5);
    doc.setDrawColor(0, 102, 51);
    doc.line(10, 45, pageWidth - 10, 45);

    let startY = 50;

    doc.autoTable({
      startY: startY,
      margin: { left: 10, right: 10 },
      head: [[
        '#', 'Documento', 'Documentación', 'Primer Nombre', 'Segundo Nombre', 'Primer Apellido', 'Segundo Apellido',
        'Fecha Nacimiento', 'Tipo Persona', 'Principal', 'Estado'
      ]],
      body: filteredPersonas.map((persona, index) => [
        index + 1,
        tipoDocumento.find((tipo) => tipo.Cod_tipo_documento === persona.tipo_documento)?.tipo_documento.toUpperCase() || 'N/D',
        persona.dni_persona?.toUpperCase() || 'N/D',
        persona.Nombre?.toUpperCase() || 'N/D',
        persona.Segundo_nombre?.toUpperCase() || 'N/D',
        persona.Primer_apellido?.toUpperCase() || 'N/D',
        persona.Segundo_apellido?.toUpperCase() || 'N/D',
        new Date(persona.fecha_nacimiento).toLocaleDateString('en-CA'),
        tipoPersona.find((tipo) => tipo.Cod_tipo_persona === persona.cod_tipo_persona)?.Tipo_persona.toUpperCase() || 'N/D',
        persona.principal ? 'SÍ' : 'NO',
        persona.estado === 1 ? 'ACTIVO' : 'INACTIVO'
      ]),
      headStyles: {
        fillColor: [0, 102, 51],
        textColor: [255, 255, 255],
        fontSize: 8,
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 7,
        cellPadding: 2,
        overflow: 'linebreak',
        halign: 'center'
      },
      columnStyles: {
        0: { cellWidth: 7 }, // #
        1: { cellWidth: 25 }, // Tipo Documento
        2: { cellWidth: 25 }, // DNI
        3: { cellWidth: 28 }, // Primer Nombre
        4: { cellWidth: 28 }, // Segundo Nombre
        5: { cellWidth: 28 }, // Primer Apellido
        6: { cellWidth: 28 }, // Segundo Apellido
        7: { cellWidth: 28 }, // Fecha Nacimiento
        8: { cellWidth: 28 }, // Tipo Persona
        9: { cellWidth: 18 }, // Principal
        10: { cellWidth: 18 } // Estado
      },
      alternateRowStyles: { fillColor: [240, 248, 255] },
      didParseCell: (data) => {
        if (data.section === 'body' && data.column.index === 10) {
          data.cell.styles.textColor = data.cell.raw === 'ACTIVO' ? [0, 128, 0] : [255, 0, 0];
          data.cell.styles.fontStyle = data.cell.raw === 'ACTIVO' ? 'bold' : 'normal';
        }
      }
      
    });

    // Pie de página
    const now = new Date();
    const dateString = now.toLocaleDateString('es-HN', { year: 'numeric', month: 'long', day: 'numeric' });
    const timeString = now.toLocaleTimeString('es-HN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    const pageCount = doc.internal.getNumberOfPages();

    doc.setFontSize(7);
    doc.setTextColor(0, 102, 51);
    doc.text(`Fecha: ${dateString} | Hora: ${timeString}`, 10, doc.internal.pageSize.height - 10);
    doc.text(`Página ${pageCount}`, pageWidth - 20, doc.internal.pageSize.height - 10, { align: 'right' });

    // Mostrar visor PDF
    const pdfBlob = doc.output('blob');
    const pdfURL = URL.createObjectURL(pdfBlob);
    const newWindow = window.open('', '_blank');
    newWindow.document.write(`
      <html>
        <head>
          <title>Reporte de Personas</title>
          <style>
            body {
              margin: 0;
              padding: 0;
              overflow: hidden;
              display: flex;
              align-items: center;
              justify-content: center;
              width: 100vw;
              height: 100vh;
            }
            iframe {
              width: 100vw;
              height: 100vh;
              border: none;
            }
            .icon-container {
              position: fixed;
              top: 15px;
              right: 15px;
              display: flex;
              gap: 15px;
              padding: 10px;
              border-radius: 8px;
            }
            .icon-button {
              background: none;
              border: none;
              cursor: pointer;
              font-size: 22px;
              color: white;
              position: relative;
              z-index: 9999;
            }
            .icon-button:focus,
            .icon-button:active {
              outline: none;
              box-shadow: none;
            }
          </style>
          <script src="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/js/all.min.js"></script>
        </head>
        <body>
          <iframe id="pdfViewer" src="${pdfURL}"></iframe>
          <div class="icon-container">
            <button class="icon-button" onclick="const a = document.createElement('a'); a.href='${pdfURL}'; a.download='Reporte_Personas.pdf'; a.click();">
              <i class="fas fa-download"></i>
            </button>
            <button class="icon-button" onclick="const printWindow = window.open('${pdfURL}', '_blank'); printWindow.onload = () => printWindow.print();">
              <i class="fas fa-print"></i>
            </button>
          </div>
        </body>
      </html>
    `);
  };

  img.onerror = () => {
    alert('No se pudo cargar el logo.');
  };
};




{/* ************************************************************************************************************************************* */}
   // Verificar permisos
   if (!canSelect) {
    return <AccessDenied />;
  }
  
{/***********************************************VISTAS Y MODALES*************************************************************/}

return (
    <CContainer>
<CRow className="align-items-center mb-3">
  <CCol xs="12" className="text-center">
    {/* Título con contenedor para ajustar la línea verde */}
    <div style={{ display: 'inline-block', textAlign: 'center', position: 'relative' }}>
      <h3 className="mb-0" style={{ fontSize: '2rem' }}>Gestión de Personas</h3>
      {/* ✅ Línea verde ajustada al ancho del título */}
      <div style={{
        height: '3px',
        backgroundColor: '#4CAF50',
        width: '100%',
        marginTop: '5px'
      }}></div>
    </div>
  </CCol>
</CRow>


<CRow className="align-items-center mt-2 mb-3">
  {/* Botones "Nuevo" y "Reportes" alineados a la derecha */}
  <CCol xs="12" md="12" className="d-flex justify-content-end gap-3">
    {canInsert && (
      <CButton
        style={{ backgroundColor: '#4B6251', color: 'white', minWidth: '120px', height: '38px' }}
        onClick={() => setModalVisible(true)}
      >
        <CIcon icon={cilPlus} /> Nuevo
      </CButton>
    )}

<CDropdown className="btn-sm d-flex align-items-center gap-1 rounded shadow">
  <CDropdownToggle
    style={{
      backgroundColor: '#6C8E58',
      color: 'white',
      fontSize: '0.85rem',
      cursor: 'pointer',
      minWidth: '120px',
      height: '38px',
      transition: 'all 0.3s ease',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.backgroundColor = '#5A784C';
      e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.backgroundColor = '#6C8E58';
      e.currentTarget.style.boxShadow = 'none';
    }}
  >
    <CIcon icon={cilDescription} /> Reportes
  </CDropdownToggle>
  <CDropdownMenu
    style={{
      position: 'absolute',
      zIndex: 1050,
      backgroundColor: '#fff',
      boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.2)',
      borderRadius: '4px',
      overflow: 'hidden',
    }}
  >
    {/* Reporte Excel */}
    <CDropdownItem
      onClick={ReportePersonasExcel}
      style={{
        cursor: 'pointer',
        outline: 'none',
        backgroundColor: 'transparent',
        padding: '0.5rem 1rem',
        fontSize: '0.85rem',
        color: '#333',
        borderBottom: '1px solid #eaeaea',
        transition: 'background-color 0.3s',
      }}
      onMouseOver={(e) => (e.target.style.backgroundColor = '#f5f5f5')}
      onMouseOut={(e) => (e.target.style.backgroundColor = 'transparent')}
    >
      <CIcon icon={cilSpreadsheet} size="sm" /> Descargar en Excel
    </CDropdownItem>

    {/* Reporte PDF */}
    <CDropdownItem
      onClick={ReportePersonasPDF}
      style={{
        cursor: 'pointer',
        outline: 'none',
        backgroundColor: 'transparent',
        padding: '0.5rem 1rem',
        fontSize: '0.85rem',
        color: '#333',
        transition: 'background-color 0.3s',
      }}
      onMouseOver={(e) => (e.target.style.backgroundColor = '#f5f5f5')}
      onMouseOut={(e) => (e.target.style.backgroundColor = 'transparent')}
    >
      <CIcon icon={cilFile} size="sm" /> Descargar en PDF
    </CDropdownItem>
  </CDropdownMenu>
</CDropdown>

  </CCol>
</CRow>

<CRow className="align-items-center mt-3 mb-2">
  <CCol xs="12" md="8" className="d-flex flex-wrap align-items-center">
    <CInputGroup className="me-3" style={{ width: '400px' }}>
      <CInputGroupText>
        <CIcon icon={cilSearch} />
      </CInputGroupText>
      <CFormInput
        placeholder="Buscar persona..."
        value={searchTerm}
        onChange={(e) => {
          let value = e.target.value;

          // 🔄 **Eliminar espacios consecutivos**
          value = value.replace(/\s{2,}/g, ' ');

          // 🔄 **Permitir acentos, pero eliminar otros caracteres especiales**
          value = value.replace(/[^A-Za-zÀ-ÿ0-9\s]/g, '');

          // 🔄 **Bloquear caracteres repetidos más de 10 veces**
          value = value.replace(/(.)\1{10,}/g, '$1'.repeat(10));

          setSearchTerm(value);
        }}
        onPaste={(e) => e.preventDefault()}
        onCopy={(e) => e.preventDefault()}
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

      <div className="table-container">
      <div style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: '500px' }}>
  <CTable striped bordered hover>
    <CTableHead>
      <CTableRow>
        {['Tipo Documento', 'Documentación', 'Primer Nombre', 'Segundo Nombre', 'Primer Apellido', 'Segundo Apellido', 'Fecha de Nacimiento','Tipo de Persona', 'Principal', 'Acciones'].map((header, index) => (
          <CTableHeaderCell key={index} style={{ fontSize: '0.85rem', textAlign: 'center' }}>
            {header}
          </CTableHeaderCell>
        ))}
      </CTableRow>
    </CTableHead>
    <CTableBody>
      {currentRecords.length > 0 ? (
        currentRecords.map((persona) => (
          <CTableRow key={persona.cod_persona}
          style={{ 
            transition: 'opacity 1s ease-in-out', 
            opacity: persona.fading ? 0 : 1 
          }}
          >
            
            <CTableDataCell style={{ fontSize: '0.85rem', textAlign: 'center' }}>
              {tipoDocumento.find((tipo) => tipo.Cod_tipo_documento === persona.tipo_documento)?.tipo_documento.toUpperCase() || 'N/D'}
            </CTableDataCell>
            <CTableDataCell style={{ fontSize: '0.85rem', textAlign: 'center' }}>{persona.dni_persona?.toUpperCase() || 'N/D'}</CTableDataCell>
            <CTableDataCell style={{ fontSize: '0.85rem', textAlign: 'center' }}>{persona.Nombre?.toUpperCase() || 'N/D'}</CTableDataCell>
            <CTableDataCell style={{ fontSize: '0.85rem', textAlign: 'center' }}>{persona.Segundo_nombre?.toUpperCase() || 'N/D'}</CTableDataCell>
            <CTableDataCell style={{ fontSize: '0.85rem', textAlign: 'center' }}>{persona.Primer_apellido?.toUpperCase() || 'N/D'}</CTableDataCell>
            <CTableDataCell style={{ fontSize: '0.85rem', textAlign: 'center' }}>{persona.Segundo_apellido?.toUpperCase() || 'N/D'}</CTableDataCell>
            <CTableDataCell style={{ fontSize: '0.85rem', textAlign: 'center' }}>{new Date(persona.fecha_nacimiento).toLocaleDateString('en-CA')}</CTableDataCell>

{/*
            <CTableDataCell style={{ fontSize: '0.85rem', textAlign: 'center' }}>{persona.direccion_persona?.toUpperCase() || 'N/D'}</CTableDataCell>
            <CTableDataCell style={{ fontSize: '0.85rem', textAlign: 'center' }}>
              {nacionalidad.find((nac) => nac.Cod_nacionalidad === persona.cod_nacionalidad)?.pais_nacionalidad.toUpperCase() || 'N/D'}
            </CTableDataCell>
            <CTableDataCell style={{ fontSize: '0.85rem', textAlign: 'center' }}>
              {departamentos.find((depto) => depto.Cod_departamento === persona.cod_departamento)?.Nombre_departamento.toUpperCase() || 'N/D'}
            </CTableDataCell>
            <CTableDataCell style={{ fontSize: '0.85rem', textAlign: 'center' }}>
              {municipio.find((mun) => mun.Cod_municipio === persona.cod_municipio)?.Nombre_municipio.toUpperCase() || 'N/D'}
            </CTableDataCell>
*/}
            <CTableDataCell style={{ fontSize: '0.85rem', textAlign: 'center' }}>
              {tipoPersona.find((tipo) => tipo.Cod_tipo_persona === persona.cod_tipo_persona)?.Tipo_persona.toUpperCase() || 'N/D'}
            </CTableDataCell>

{/*
            <CTableDataCell style={{ fontSize: '0.85rem', textAlign: 'center' }}>
              {generos.find((gen) => gen.Cod_genero === persona.cod_genero)?.Tipo_genero.toUpperCase() || 'N/D'}
            </CTableDataCell>
*/}
            <CTableDataCell style={{ fontSize: '0.85rem', textAlign: 'center' }}>
              {persona.principal ? (<CIcon icon={cilCheckCircle} style={{ fontSize: '2em', color: '#28a745' }}/>) : ( 
              <CIcon icon={cilXCircle} style={{ fontSize: '2em', color: '#dc3545' }}/> )} 
            </CTableDataCell>

            <CTableDataCell className="text-center">
  <div className="d-flex justify-content-center align-items-center" style={{ gap: '10px', flexWrap: 'nowrap' }}>
    <CButton 
      color="warning" 
      onClick={() => openUpdateModal(persona)} 
      style={{ fontSize: '0.75rem' }} 
      disabled={!persona.estado} // 🔄 Se desactiva si estado es 0
    >
      <CIcon icon={cilPen} />
    </CButton>

    <CButton 
      color="secondary" 
      onClick={() => abrirEstructuraFamiliarModal(persona)} 
      style={{ fontSize: '0.75rem' }} 
      disabled={!persona.estado} // 🔄 Se desactiva si estado es 0
    >
      <CIcon icon={cilPeople} />
    </CButton>

    {tipoPersona.find(tipo => tipo.Cod_tipo_persona === persona.cod_tipo_persona)?.Tipo_persona.toUpperCase() !== 'ESTUDIANTE' && (
      <CButton 
        color="primary" 
        onClick={() => abrirContactoModal(persona)} 
        style={{ fontSize: '0.75rem' }} 
        disabled={!persona.estado} // 🔄 Se desactiva si estado es 0
      >
        <CIcon icon={cilContact} />
      </CButton>
    )}

    {tipoPersona.find(tipo => tipo.Cod_tipo_persona === persona.cod_tipo_persona)?.Tipo_persona.toUpperCase() === 'ESTUDIANTE' && (
      <CButton
        onClick={() => abrirProcedenciaEstudianteModal(persona)}
        style={{ backgroundColor: '#90EE90', borderColor: '#90EE90', fontSize: '0.75rem' }}
        disabled={!persona.estado} // 🔄 Se desactiva si estado es 0
      >
        <CIcon icon={cilHistory} />
      </CButton>
    )}

    <CButton
      style={{
        backgroundColor: persona.estado ? '#4CAF50' : '#F44336',
        color: 'white',
        fontSize: '0.75rem',
      }}
      onClick={() => toggleEstado(persona)}
      disabled={loading}
    >
      {loading ? 'Cambiando...' : persona.estado ? 'Activo' : 'Inactivo'}
    </CButton>

    <CButton 
      color="danger" 
      onClick={() => openDeleteModal(persona)} 
      style={{ fontSize: '0.75rem' }} 
      disabled={!persona.estado} // 🔄 Se desactiva si estado es 0
    >
      <CIcon icon={cilTrash} />
    </CButton>
  </div>
</CTableDataCell>



          </CTableRow>
        ))
      ) : (
        <CTableRow>
          <CTableDataCell colSpan="14" className="text-center" style={{ fontSize: '0.85rem' }}>
            No hay registros
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
            disabled={currentPage === Math.ceil(personas.length / recordsPerPage)} // Desactiva si es la última página
            onClick={() => paginate(currentPage + 1)} // Páginas siguientes
          >
            Siguiente
          </CButton>
        </CPagination>
        <span style={{ marginLeft: '10px' }}>
          Página {currentPage} de {Math.ceil(personas.length / recordsPerPage)}
        </span>
      </div>
{/*********************************************************************************************************************************/}

{/*//////////////////////////////////////////MODAL-PARA-AGREGAR-UNA-PERSONA********************************************************/}
<CModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)} 
        backdrop="static"
        size="xl" 
      >
        <CModalHeader closeButton>
          <CModalTitle>Agregar Nueva Persona</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <div className="row">
            <div className="col-md-6">
{/************************************************************COLUMNA-1*******************************************************************/}
{/***************************************************************DNI**********************************************************************/}

                <div className="col-md-12">
            <div className="col-md-12">
              {errorMessages.tipo_documento && (
                <div className="error-message" style={{ marginBottom: '10px', color: 'red', fontSize: '0.850rem' }}>
                  {errorMessages.tipo_documento}
                </div>
              )}
              <CInputGroup className="mb-3">
                <CInputGroupText>Tipo de Documento</CInputGroupText>
          <CFormSelect
            value={nuevaPersona.tipo_documento || ''}
            onChange={(e) => {
              const value = e.target.value;

              // Validación en tiempo real
              let erroresTemp = { ...errorMessages };
              erroresTemp.tipo_documento = value ? '' : 'Debe seleccionar un tipo de documento.';

              setErrorMessages(erroresTemp);
              setNuevaPersona({ ...nuevaPersona, tipo_documento: value });
            }}
            required
            style={{
              color: nuevaPersona.tipo_documento ? '#000' : '#6c757d', // ✅ Negro para datos, gris para instrucciones
            }}
          >
            <option value="" style={{ color: '#6c757d' }}>Seleccione un tipo de documento</option>
            {tipoDocumento &&
              tipoDocumento.map((doc) => (
                <option key={doc.Cod_tipo_documento} value={doc.Cod_tipo_documento} style={{ color: '#000' }}>
                  {doc.tipo_documento.toUpperCase()}
                </option>
              ))}
          </CFormSelect>

              </CInputGroup>
            </div>
          </div>

{/********************************************************************************************************************************************/}
        <div className="col-md-12">
          {errorMessages.dni_persona && (
            <div className="error-message" style={{ marginBottom: '10px', color: 'red', fontSize: '0.850rem' }}>
              {errorMessages.dni_persona}
            </div>
          )}
          <CInputGroup className="mb-3">
            <CInputGroupText>Documentación</CInputGroupText>
        <CFormInput
          type="text"
          placeholder="Identificación de la persona"
          value={nuevaPersona.dni_persona || ''}
          onChange={(e) => {
            let value = e.target.value.toUpperCase();
            let erroresTemp = {};

            // Bloquear espacios
            if (/\s/.test(value)) {
              erroresTemp.dni_persona = 'El documento no debe contener espacios.';
            }

            // Bloquear caracteres especiales (solo permitir alfanuméricos)
            if (/[^A-Za-z0-9]/.test(value)) {
              erroresTemp.dni_persona = 'Solo se permiten letras y números.';
            }

            // Bloquear más de 10 repeticiones del mismo carácter en tiempo real
            if (value.match(/(.)\1{10,}/)) {
              erroresTemp.dni_persona = 'No se pueden repetir más de 10 veces un mismo carácter.';
              value = nuevaPersona.dni_persona; // No permite seguir ingresando caracteres inválidos
            }

            setNuevaPersona({ ...nuevaPersona, dni_persona: value });
            setErrorMessages({ ...errorMessages, dni_persona: erroresTemp.dni_persona || '' });
          }}
          style={{
            color: nuevaPersona.dni_persona ? '#000' : '#6c757d', // ✅ Negro para datos, gris para instrucciones
          }}
          onCopy={(e) => e.preventDefault()}
          onPaste={(e) => e.preventDefault()} 
          onKeyDown={(e) => {
            // Bloquear Ctrl+C, Ctrl+V, espacios y caracteres especiales
            if (e.ctrlKey && (e.key === 'c' || e.key === 'v')) {
              e.preventDefault();
            }
            if (e.key === ' ') {
              e.preventDefault();
            }
            if (!/^[A-Za-z0-9]$/.test(e.key) && e.key.length === 1) {
              e.preventDefault();
            }

            // Validar desde el teclado si ya hay 10 caracteres repetidos
            const currentValue = nuevaPersona.dni_persona + e.key;
            if (currentValue.match(/(.)\1{10,}/)) {
              e.preventDefault();
              setErrorMessages((prevErrors) => ({
                ...prevErrors,
                dni_persona: 'No se pueden repetir más de 10 veces un mismo carácter.',
              }));
            }
          }}
          required
        />

          </CInputGroup>
        </div>


{/*******************************************************PRIMER NOMBRE********************************************************************/}
        <div className="col-md-12">
          {errorMessages.Nombre && (
            <div className="error-message" style={{ marginBottom: '10px', color: 'red', fontSize: '0.850rem' }}>
              {errorMessages.Nombre}
            </div>
          )}
          <CInputGroup className="mb-3">
            <CInputGroupText>Primer Nombre</CInputGroupText>
            <CFormInput
              type="text"
              placeholder="Nombre"
              value={nuevaPersona.Nombre || ''}
              onChange={(e) => {
                const value = e.target.value.toUpperCase(); // Convertir a mayúsculas automáticamente
                let erroresTemp = { ...errorMessages };

                // Bloquear secuencias de más de tres letras repetidas
                if (/(.)\1{2,}/.test(value)) {
                  erroresTemp.Nombre = 'El nombre no puede contener más de tres letras repetidas consecutivas.';
                  setErrorMessages(erroresTemp);
                  return;
                }

                // Bloquear caracteres especiales, solo letras, acentos y espacios permitidos
                if (/[^A-Za-záéíóúÁÉÍÓÚñÑ\s]/.test(value)) {
                  erroresTemp.Nombre = 'El nombre solo puede contener letras, acentos y espacios.';
                  setErrorMessages(erroresTemp);
                  return;
                }

                // Bloquear más de un espacio consecutivo
                if (/\s{2,}/.test(value)) {
                  erroresTemp.Nombre = 'El nombre no puede contener más de un espacio consecutivo.';
                  setErrorMessages(erroresTemp);
                  return;
                }

                // Validación del campo vacío y tamaño mínimo
                if (!value.trim()) {
                  erroresTemp.Nombre = 'El primer nombre no puede estar vacío.';
                } else if (value.length < 2) {
                  erroresTemp.Nombre = 'El primer nombre debe tener al menos 2 caracteres.';
                } else {
                  erroresTemp.Nombre = '';
                }

                setNuevaPersona({ ...nuevaPersona, Nombre: value });
                setErrorMessages(erroresTemp);
              }}
              style={{
                color: nuevaPersona.Nombre ? '#000' : '#6c757d', // ✅ Negro para datos, gris para instrucciones
              }}
              onCopy={disableCopyPaste}
              onPaste={disableCopyPaste}
              required
            />

          </CInputGroup>
        </div>
{/*********************************************************SEGUNDO NOMBRE****************************************************************/}
      <div className="col-md-12">
        {errorMessages.Segundo_nombre && (
          <div className="error-message" style={{ marginBottom: '10px', color: 'red', fontSize: '0.850rem' }}>
            {errorMessages.Segundo_nombre}
          </div>
        )}
        <CInputGroup className="mb-3">
          <CInputGroupText>Segundo Nombre</CInputGroupText>
          <CFormInput
            type="text"
            placeholder="Segundo Nombre"
            value={nuevaPersona.Segundo_nombre || ''}
            onChange={(e) => {
              const value = e.target.value.toUpperCase(); // Convertir a mayúsculas automáticamente
              let erroresTemp = { ...errorMessages };

              // Bloquear secuencias de más de tres letras repetidas
              if (/(.)\1{2,}/.test(value)) {
                erroresTemp.Segundo_nombre = 'El segundo nombre no puede contener más de tres letras repetidas consecutivas.';
                setErrorMessages(erroresTemp);
                return;
              }

              // Bloquear caracteres especiales, solo letras, acentos y espacios permitidos
              if (/[^A-Za-záéíóúÁÉÍÓÚñÑ\s]/.test(value)) {
                erroresTemp.Segundo_nombre = 'El segundo nombre solo puede contener letras, acentos y espacios.';
                setErrorMessages(erroresTemp);
                return;
              }

              // Bloquear más de un espacio consecutivo
              if (/\s{2,}/.test(value)) {
                erroresTemp.Segundo_nombre = 'El segundo nombre no puede contener más de un espacio consecutivo.';
                setErrorMessages(erroresTemp);
                return;
              }

              // Validación del campo vacío y tamaño mínimo
              if (!value.trim()) {
                erroresTemp.Segundo_nombre = 'El segundo nombre no puede estar vacío.';
              } else if (value.length < 2) {
                erroresTemp.Segundo_nombre = 'El segundo nombre debe tener al menos 2 caracteres.';
              } else {
                erroresTemp.Segundo_nombre = '';
              }

              setNuevaPersona({ ...nuevaPersona, Segundo_nombre: value });
              setErrorMessages(erroresTemp);
            }}
            style={{
              color: nuevaPersona.Segundo_nombre ? '#000' : '#6c757d', // ✅ Negro para datos, gris para instrucciones
            }}
            onCopy={disableCopyPaste}
            onPaste={disableCopyPaste}
          />

        </CInputGroup>
      </div>
{/*****************************************************PRIMER APELLLIDO******************************************************************/}
      <div className="col-md-12">
        {errorMessages.Primer_apellido && (
          <div className="error-message" style={{ marginBottom: '10px', color: 'red', fontSize: '0.850rem' }}>
            {errorMessages.Primer_apellido}
          </div>
        )}
        <CInputGroup className="mb-3">
          <CInputGroupText>Primer Apellido</CInputGroupText>
          <CFormInput
            type="text"
            placeholder="Primer Apellido"
            value={nuevaPersona.Primer_apellido || ''}
            onChange={(e) => {
              const value = e.target.value.toUpperCase(); // Convertir a mayúsculas automáticamente
              let erroresTemp = { ...errorMessages };

              // Bloquear secuencias de más de tres letras repetidas
              if (/(.)\1{2,}/.test(value)) {
                erroresTemp.Primer_apellido = 'El primer apellido no puede contener más de tres letras repetidas consecutivas.';
                setErrorMessages(erroresTemp);
                return;
              }

              // Bloquear caracteres especiales, solo letras, acentos y espacios permitidos
              if (/[^A-Za-záéíóúÁÉÍÓÚñÑ\s]/.test(value)) {
                erroresTemp.Primer_apellido = 'El primer apellido solo puede contener letras, acentos y espacios.';
                setErrorMessages(erroresTemp);
                return;
              }

              // Bloquear más de un espacio consecutivo
              if (/\s{2,}/.test(value)) {
                erroresTemp.Primer_apellido = 'El primer apellido no puede contener más de un espacio consecutivo.';
                setErrorMessages(erroresTemp);
                return;
              }

              // Validación del campo vacío y tamaño mínimo
              if (!value.trim()) {
                erroresTemp.Primer_apellido = 'El primer apellido no puede estar vacío.';
              } else if (value.length < 2) {
                erroresTemp.Primer_apellido = 'El primer apellido debe tener al menos 2 caracteres.';
              } else {
                erroresTemp.Primer_apellido = '';
              }

              setNuevaPersona({ ...nuevaPersona, Primer_apellido: value });
              setErrorMessages(erroresTemp);
            }}
            style={{
              color: nuevaPersona.Primer_apellido ? '#000' : '#6c757d', // ✅ Negro para datos, gris para instrucciones
            }}
            onCopy={disableCopyPaste}
            onPaste={disableCopyPaste}
            required
          />

        </CInputGroup>
      </div>
{/*******************************************************SEGUNDO APELLIDO****************************************************************/}
            <div className="col-md-12">
              {errorMessages.Segundo_apellido && (
                <div className="error-message" style={{ marginBottom: '10px', color: 'red', fontSize: '0.850rem' }}>
                  {errorMessages.Segundo_apellido}
                </div>
              )}
              <CInputGroup className="mb-3">
                <CInputGroupText>Segundo Apellido</CInputGroupText>
                <CFormInput
                type="text"
                placeholder="Segundo Apellido"
                value={nuevaPersona.Segundo_apellido || ''}
                onChange={(e) => {
                  const value = e.target.value.toUpperCase(); // Convertir a mayúsculas automáticamente
                  let erroresTemp = { ...errorMessages };

                  // Bloquear secuencias de más de tres letras repetidas
                  if (/(.)\1{2,}/.test(value)) {
                    erroresTemp.Segundo_apellido = 'El segundo apellido no puede contener más de tres letras repetidas consecutivas.';
                    setErrorMessages(erroresTemp);
                    return;
                  }

                  // Bloquear caracteres especiales, solo letras, acentos y espacios permitidos
                  if (/[^A-Za-záéíóúÁÉÍÓÚñÑ\s]/.test(value)) {
                    erroresTemp.Segundo_apellido = 'El segundo apellido solo puede contener letras, acentos y espacios.';
                    setErrorMessages(erroresTemp);
                    return;
                  }

                  // Bloquear más de un espacio consecutivo
                  if (/\s{2,}/.test(value)) {
                    erroresTemp.Segundo_apellido = 'El segundo apellido no puede contener más de un espacio consecutivo.';
                    setErrorMessages(erroresTemp);
                    return;
                  }

                  // Validación del campo vacío y tamaño mínimo
                  if (!value.trim()) {
                    erroresTemp.Segundo_apellido = 'El segundo apellido no puede estar vacío.';
                  } else if (value.length < 2) {
                    erroresTemp.Segundo_apellido = 'El segundo apellido debe tener al menos 2 caracteres.';
                  } else {
                    erroresTemp.Segundo_apellido = '';
                  }

                  setNuevaPersona({ ...nuevaPersona, Segundo_apellido: value });
                  setErrorMessages(erroresTemp);
                }}
                style={{
                  color: nuevaPersona.Segundo_apellido ? '#000' : '#6c757d', // ✅ Negro para datos, gris para instrucciones
                }}
                onCopy={disableCopyPaste}
                onPaste={disableCopyPaste}
                required
              />
              </CInputGroup>
            </div>
{/*****************************************************FECHA NACIMIENTO*****************************************************************/}
      <div className="col-md-12">
        {errorMessages.fecha_nacimiento && (
          <div className="error-message" style={{ marginBottom: '10px', color: 'red', fontSize: '0.850rem' }}>
            {errorMessages.fecha_nacimiento}
          </div>
        )}
        <CInputGroup className="mb-3">
          <CInputGroupText>Fecha de Nacimiento</CInputGroupText>
          <CFormInput
          type="date"
          value={nuevaPersona.fecha_nacimiento || ''}
          onChange={(e) => {
            const value = e.target.value;
            setNuevaPersona((prevState) => ({ ...prevState, fecha_nacimiento: value }));

            // Validación de la fecha de nacimiento en tiempo real
            let erroresTemp = { ...errorMessages };
            if (!value || value === '') {
              erroresTemp.fecha_nacimiento = 'Debe ingresar una fecha de nacimiento válida.';
            } else {
              const currentYear = new Date().getFullYear();
              const minYear = currentYear - 100;
              const maxYear = currentYear - 4;
              const fechaNacimiento = new Date(value);
              const añoNacimiento = fechaNacimiento.getFullYear();
              
              if (añoNacimiento < minYear || añoNacimiento > maxYear) {
                erroresTemp.fecha_nacimiento = `La fecha de nacimiento debe estar entre los años ${minYear} y ${maxYear}.`;
              } else {
                erroresTemp.fecha_nacimiento = '';
              }
            }
            setErrorMessages(erroresTemp);
          }}
          style={{
            color: nuevaPersona.fecha_nacimiento ? '#000' : '#6c757d', // ✅ Negro para datos, gris para instrucciones
          }}
          required
        />

        </CInputGroup>
      </div>
      </div>
{/***************************************************************ESTADO**********************************************************************/}
{/************************************************************COLUMNA 2************************************************************************/}
      <div className="col-md-6">
        <div className="col-md-12">

{/*************************************************************DIRECCIÓN*******************************************************************/}
      <div className="col-md-12">
        {errorMessages.direccion_persona && (
          <div className="error-message" style={{ marginBottom: '10px', color: 'red', fontSize: '0.850rem' }}>
            {errorMessages.direccion_persona}
          </div>
        )}
        <CInputGroup className="mb-3">
          <CInputGroupText>Dirección</CInputGroupText>
          <CFormInput
          type="text"
          placeholder="Dirección"
          value={nuevaPersona.direccion_persona || ''}
          onChange={(e) => {
            const value = e.target.value.toUpperCase(); // Convertir a mayúsculas automáticamente
            let erroresTemp = { ...errorMessages };

            // Bloquear secuencias de más de tres letras repetidas
            if (/(.)\1{2,}/.test(value)) {
              erroresTemp.direccion_persona = 'La dirección no puede contener más de tres letras repetidas consecutivas.';
              setErrorMessages(erroresTemp);
              return;
            }

            // Permitir solo caracteres necesarios para direcciones (letras, números, guiones, espacios, puntos, comas)
            if (/[^A-Za-záéíóúÁÉÍÓÚñÑ0-9\s\-#.,]/.test(value)) {
              erroresTemp.direccion_persona = 'La dirección solo puede contener letras, números, acentos, espacios y caracteres como guiones, puntos y comas.';
              setErrorMessages(erroresTemp);
              return;
            }

            // Bloquear más de un espacio consecutivo
            if (/\s{2,}/.test(value)) {
              erroresTemp.direccion_persona = 'La dirección no puede contener más de un espacio consecutivo.';
              setErrorMessages(erroresTemp);
              return;
            }

            // Validación del campo vacío
            if (!value.trim()) {
              erroresTemp.direccion_persona = 'La dirección no puede estar vacía.';
            } else {
              erroresTemp.direccion_persona = '';
            }

            setNuevaPersona({ ...nuevaPersona, direccion_persona: value });
            setErrorMessages(erroresTemp);
          }}
          style={{
            color: nuevaPersona.direccion_persona ? '#000' : '#6c757d', // ✅ Negro para datos, gris para instrucciones
          }}
          onCopy={disableCopyPaste}
          onPaste={disableCopyPaste}
          required
        />

                </CInputGroup>
              </div>
            </div>

{/**********************************************************NACIONALIDAD*****************************************************************/}
            <div className="mb-3">
            {errorMessages.nacionalidad && (
            <div className="error-message" style={{ marginBottom: '10px', color: 'red', fontSize: '0.850rem' }}>
              {errorMessages.nacionalidad}
            </div>
            )}
            <CInputGroup className="mb-3">
            <CInputGroupText>
              Nacionalidad
            </CInputGroupText>
            <CFormInput
              type="text"
              value={buscadorNacionalidadNuevo || ''}
              onKeyPress={handleKeyPress}
              onChange={handleBuscarNacionalidadNuevo}
              onCopy={disableCopyPaste}
              onPaste={disableCopyPaste}
              placeholder="Buscar por sigla de país o letra"
              style={{
                color: buscadorNacionalidadNuevo ? '#000' : '#6c757d', // ✅ Negro para datos, gris para instrucciones
              }}
            />
            <CButton type="button">
              <CIcon icon={cilSearch} />
            </CButton>
            </CInputGroup>

            {isDropdownOpenNacionalidadNuevo && nacionalidadesFiltradasNuevo.length > 0 && (
            <div className="dropdown-container" style={{ position: 'relative' }}>
            <div 
              className="dropdown-menu show" 
              style={{
                position: 'absolute',
                zIndex: 999,
                top: '100%',
                left: '0',
                width: '100%',
                maxHeight: '180px',  // ✅ Limita la altura del dropdown
                overflowY: 'auto',   // ✅ Habilita desplazamiento vertical
                border: '1px solid #ccc',
                borderRadius: '6px',
                boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
              }}
            >
              {nacionalidadesFiltradasNuevo.map((nacionalidad) => (
                <div
                  key={nacionalidad.Cod_nacionalidad}
                  className="dropdown-item"
                  style={{
                    cursor: 'pointer',
                    padding: '8px 12px', // ✅ Mejora el espacio entre elementos
                    color: '#000', // 🔄 Ahora el texto se verá en negro
                  }}
                  onClick={() => handleSeleccionarNacionalidadNuevo(nacionalidad)}
                >
                  {nacionalidad.Id_nacionalidad.toUpperCase()} - {nacionalidad.pais_nacionalidad.toUpperCase()}
                </div>
              ))}
            </div>
            </div>
            )}
            </div>


{/************************************************************DEPARTAMENTO*****************************************************************/}
        <div className="col-md-12">
              <div className="col-md-12">
                {errorMessages.cod_departamento && (
                  <div className="error-message" style={{ marginBottom: '10px', color: 'red', fontSize: '0.850rem' }}>
                    {errorMessages.cod_departamento}
                  </div>
                )}
                <CInputGroup className="mb-3">
                  <CInputGroupText>Departamento</CInputGroupText>
                  <CFormSelect
          value={nuevaPersona.cod_departamento || ''}
          onChange={(e) => {
            const value = e.target.value;

            // Buscar el objeto completo del departamento seleccionado
            const departamentoSeleccionado = departamentos.find(depto => depto.Cod_departamento === parseInt(value));

            if (departamentoSeleccionado) {
              handleSeleccionarDepartamento(departamentoSeleccionado);
            }

            // Validación en tiempo real
            let erroresTemp = { ...errorMessages };
            erroresTemp.cod_departamento = value ? '' : 'Debe seleccionar un departamento.';

            setErrorMessages(erroresTemp);
            setNuevaPersona({ ...nuevaPersona, cod_departamento: value });
          }}
          required
          style={{
            color: nuevaPersona.cod_departamento ? '#000' : '#6c757d', // ✅ Negro para datos, gris para instrucciones
          }}
        >
          <option value="" style={{ color: '#6c757d' }}>Seleccione un departamento</option>
          {departamentos.map((depto) => (
            <option key={depto.Cod_departamento} value={depto.Cod_departamento} style={{ color: '#000' }}>
              {depto.Nombre_departamento.toUpperCase()}
            </option>
          ))}
        </CFormSelect>


                </CInputGroup>
              </div>
            </div>
{/*****************************************************************MUNICIPIO*********************************************************************/}
        <div className="mb-3">
          {errorMessages.municipio && (
            <div className="error-message" style={{ marginBottom: '10px', color: 'red', fontSize: '0.850rem' }}>
              {errorMessages.municipio}
            </div>
          )}
          <CInputGroup className="mb-3">
            <CInputGroupText>
              Municipio
            </CInputGroupText>
            <CFormInput
              type="text"
              value={buscadorMunicipioNuevo || ''}
              onChange={handleBuscarMunicipioNuevo}
              onKeyPress={handleKeyPress}
              onCopy={disableCopyPaste}
              onPaste={disableCopyPaste}
              placeholder="Buscar por nombre del municipio"
              style={{
                color: buscadorMunicipioNuevo ? '#000' : '#6c757d', // ✅ Negro para datos, gris para instrucciones
              }}
            />
            <CButton type="button">
              <CIcon icon={cilSearch} />
            </CButton>
          </CInputGroup>

          {isDropdownOpenMunicipioNuevo && municipiosFiltradosNuevo.length > 0 && (
          <div className="dropdown-container" style={{ position: 'relative' }}>
            <div 
              className="dropdown-menu show" 
              style={{
                position: 'absolute',
                zIndex: 999,
                top: '100%',
                left: '0',
                width: '100%',
                maxHeight: '180px',  // ✅ Limita la altura del dropdown
                overflowY: 'auto',   // ✅ Habilita desplazamiento vertical
                border: '1px solid #ccc',
                borderRadius: '6px',
                boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
              }}
            >
              {municipiosFiltradosNuevo.map((municipio) => (
                <div
                  key={municipio.Cod_municipio}
                  className="dropdown-item"
                  style={{
                    cursor: 'pointer',
                    padding: '8px 12px', // ✅ Mejora el espacio entre elementos
                    color: '#000', // 🔄 Ahora el texto se verá en negro
                  }}
                  onClick={() => handleSeleccionarMunicipioNuevo(municipio)}
                >
                  {municipio.Nombre_municipio.toUpperCase()} - {municipio.Nombre_departamento.toUpperCase()}
                </div>
              ))}
            </div>
          </div>
        )}
        </div>



{/****************************************************************GÉNERO*******************************************************************/}
            <div className="col-md-12">
              <div className="col-md-12">
                {errorMessages.cod_genero && (
                  <div className="error-message" style={{ marginBottom: '10px', color: 'red', fontSize: '0.850rem' }}>
                    {errorMessages.cod_genero}
                  </div>
                )}
                <CInputGroup className="mb-3">
                  <CInputGroupText>Género</CInputGroupText>
                  <CFormSelect
            value={nuevaPersona.cod_genero || ''}
            onChange={(e) => {
            const value = e.target.value;

            // Validación en tiempo real
            let erroresTemp = { ...errorMessages };
            erroresTemp.cod_genero = value ? '' : 'Debe seleccionar un género.';

            setErrorMessages(erroresTemp);
            setNuevaPersona({ ...nuevaPersona, cod_genero: value });
            }}
            required
            style={{
            color: nuevaPersona.cod_genero ? '#000' : '#6c757d', // ✅ Negro para datos, gris para instrucciones
            }}
            >
            <option value="" style={{ color: '#6c757d' }}>Seleccione un género</option>
            {generos.map((genero) => (
            <option key={genero.Cod_genero} value={genero.Cod_genero} style={{ color: '#000' }}>
              {genero.Tipo_genero.toUpperCase()}
            </option>
            ))}
            </CFormSelect>

                </CInputGroup>
              </div>
            </div>
{/**********************************************************************************************************************************************/}

          <div className="col-md-12">
                  {errorMessages.cod_tipo_persona && (
                    <div className="error-message" style={{ marginBottom: '10px', color: 'red', fontSize: '0.850rem' }}>
                      {errorMessages.cod_tipo_persona}
                    </div>
                  )}
                  <CInputGroup className="mb-3">
                    <CInputGroupText>Tipo Persona</CInputGroupText>
                    <CFormSelect
            value={nuevaPersona.cod_tipo_persona || ''}
            onChange={(e) => {
              const value = e.target.value;

              // Validación en tiempo real
              let erroresTemp = { ...errorMessages };
              erroresTemp.cod_tipo_persona = value ? '' : 'Debe seleccionar un tipo de persona.';

              // Desactivar el checkbox "Principal" si el tipo de persona es "ESTUDIANTE"
              const tipoSeleccionado = tipoPersona.find(tipo => tipo.Cod_tipo_persona === parseInt(value, 10));
              if (tipoSeleccionado && tipoSeleccionado.Tipo === 'ESTUDIANTE') {
                setNuevaPersona({ ...nuevaPersona, cod_tipo_persona: value, principal: false });
              } else {
                setNuevaPersona({ ...nuevaPersona, cod_tipo_persona: value });
              }

              setErrorMessages(erroresTemp);
            }}
            required
            style={{
              color: nuevaPersona.cod_tipo_persona ? '#000' : '#6c757d', //Negro para datos, gris para instrucciones
            }}
          >
            <option value="" style={{ color: '#6c757d' }}>Seleccione un tipo de persona</option>
            {tipoPersona.map((tipo) => (
              <option key={tipo.Cod_tipo_persona} value={tipo.Cod_tipo_persona} style={{ color: '#000' }}>
                {tipo.Tipo_persona.toUpperCase()}
              </option>
            ))}
          </CFormSelect>

                  </CInputGroup>
                </div>

{/***************************************************PRINCIPAL*********************************************************/}
      <div className="col-md-6">
        <CInputGroup className="mb-3 align-items-center">
          <CInputGroupText style={{ width: '230px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>Principal</span>
            <CFormCheck
            type="checkbox"
            label=""
            checked={nuevaPersona.principal}
            onChange={(e) => {
              const tipoSeleccionado = tipoPersona.find(tipo => tipo.Cod_tipo_persona === parseInt(nuevaPersona.cod_tipo_persona, 10));
              if (tipoSeleccionado && tipoSeleccionado.Tipo_persona !== 'ESTUDIANTE') {
                setNuevaPersona(prevState => ({ ...prevState, principal: e.target.checked }));
              }
            }}
            style={{ transform: 'scale(1.3)', marginLeft: '10px' }}
            disabled={tipoPersona.some(tipo => tipo.Cod_tipo_persona === parseInt(nuevaPersona.cod_tipo_persona, 10) && tipo.Tipo_persona === 'ESTUDIANTE')}
          />

          </CInputGroupText>
        </CInputGroup>
      </div>

{/*****************************************************************************************************************************/}
                  </div>
                </div>
              </CForm>
            </CModalBody>
            <CModalFooter>
              <CButton
                color="secondary"
                onClick={closeAddModal}
              >
                Cerrar
              </CButton>

              <CButton
                style={{ backgroundColor: '#4B6251', color: 'white', borderColor: '#4B6251' }}
                onClick={handleCreatePersona} // Llamar a la función para actualizar los datos
              >
                <CIcon icon={cilSave} /> Guardar
              </CButton>
            </CModalFooter>
          </CModal>
{/*********************************************FIN MODAL PARA AGREGAR UNA PERSONA****************************************************/}

{/***********************************************************************************************************************************/}
{/*////////////////////////////////////////////MODAL PARA ACTUALIZAR UNA PERSONA****************************************************/}
          <CModal visible={modalUpdateVisible} 
          onClose={() => setModalUpdateVisible(false)}
              backdrop="static"
              size="xl" // Aumenta el tamaño del modal
            >
              <CModalHeader closeButton>
                <CModalTitle>Actualizar Persona</CModalTitle>
              </CModalHeader>
              <CModalBody>
                <CForm>
                  <CRow>
                    {/* Columna Izquierda */}
                    <CCol md={6}>
                    <div className="col-md-12">
{/***************************************************************************************************************************************/}

        <div className="col-md-12">
          <div className="col-md-12">
            {errorMessages.tipo_documento && (
              <div className="error-message" style={{ marginBottom: '10px', color: 'red', fontSize: '0.850rem' }}>
                {errorMessages.tipo_documento}
              </div>
            )}
            <CInputGroup className="mb-3">
              <CInputGroupText>Tipo de Documento</CInputGroupText>
              <CFormSelect
                value={personaToUpdate.tipo_documento || ''}
                onChange={(e) => {
                  const value = e.target.value;

                  // Validación en tiempo real
                  let erroresTemp = { ...errorMessages };
                  erroresTemp.tipo_documento = value ? '' : 'Debe seleccionar un tipo de documento.';

                  setErrorMessages(erroresTemp);
                  setPersonaToUpdate(prev => ({
                    ...prev,
                    tipo_documento: value, //  Se actualiza el estado con el nuevo tipo de documento
                  }));
                }}
                required
                style={{
                  color: personaToUpdate.tipo_documento ? '#000' : '#6c757d', //  Negro para datos, gris para instrucciones
                }}
              >
                <option value="" style={{ color: '#6c757d' }}>Seleccione un tipo de documento</option>
                {tipoDocumento.map((doc) => (
                  <option key={doc.Cod_tipo_documento} value={doc.Cod_tipo_documento} style={{ color: '#000' }}>
                    {doc.tipo_documento.toUpperCase()}
                  </option>
                ))}
              </CFormSelect>

            </CInputGroup>
          </div>
        </div>


{/********************************************************DNI****************************************************************************/}
        {errorMessages.dni_persona && (
          <div className="error-message" style={{ marginBottom: '10px', color: 'red', fontSize: '0.850rem' }}>
            {errorMessages.dni_persona}
          </div>
        )}
        <CInputGroup className="mb-3">
          <CInputGroupText>Documentación</CInputGroupText>
          <CFormInput
        type="text"
        placeholder="Documento de la persona"
        value={personaToUpdate.dni_persona || ''}
        onChange={(e) => {
          let value = e.target.value.toUpperCase();
          let erroresTemp = {};

          // 🚫 Bloquear espacios
          if (/\s/.test(value)) {
            erroresTemp.dni_persona = 'El documento no debe contener espacios.';
          }

          // 🚫 Bloquear caracteres especiales (solo permitir alfanuméricos)
          if (/[^A-Za-z0-9]/.test(value)) {
            erroresTemp.dni_persona = 'Solo se permiten letras y números.';
          }

          // 🚫 Bloquear más de 10 repeticiones del mismo carácter
          if (value.match(/(.)\1{10,}/)) {
            erroresTemp.dni_persona = 'No se pueden repetir más de 10 veces un mismo carácter.';
            value = personaToUpdate.dni_persona; // No permite seguir ingresando caracteres inválidos
          }

          setPersonaToUpdate(prev => ({
            ...prev,
            dni_persona: value,
          }));
          setErrorMessages({ ...errorMessages, dni_persona: erroresTemp.dni_persona || '' });
        }}
        style={{
          color: personaToUpdate.dni_persona ? '#000' : '#6c757d', // ✅ Negro para datos, gris para instrucciones
        }}
        onCopy={(e) => e.preventDefault()}
        onPaste={(e) => e.preventDefault()} 
        onKeyDown={(e) => {
          // 🚫 Bloquear Ctrl+C, Ctrl+V, espacios y caracteres especiales
          if (e.ctrlKey && (e.key === 'c' || e.key === 'v')) {
            e.preventDefault();
          }
          if (e.key === ' ') {
            e.preventDefault();
          }
          if (!/^[A-Za-z0-9]$/.test(e.key) && e.key.length === 1) {
            e.preventDefault();
          }

          // 🔄 Validar desde el teclado si ya hay 10 caracteres repetidos
          const currentValue = personaToUpdate.dni_persona + e.key;
          if (currentValue.match(/(.)\1{10,}/)) {
            e.preventDefault(); 
            setErrorMessages((prevErrors) => ({
              ...prevErrors,
              dni_persona: 'No se pueden repetir más de 10 veces un mismo carácter.',
            }));
          }
        }}
        required
      />

        </CInputGroup>
      </div>

{/**********************************************************NOMBRE**********************************************************************/}
            <div className="col-md-12">
              {errorMessages.Nombre && (
                <div className="error-message" style={{ marginBottom: '10px', color: 'red', fontSize: '0.850rem' }}>
                  {errorMessages.Nombre}
                </div>
              )}
              <CInputGroup className="mb-3">
                <CInputGroupText>Nombre</CInputGroupText>
                <CFormInput
                  type="text"
                  placeholder="Nombre"
                  value={personaToUpdate.Nombre || ''}
                  onChange={(e) => {
                    const value = e.target.value.toUpperCase(); // Convertir a mayúsculas automáticamente
                    let erroresTemp = { ...errorMessages };

                    // 🚫 Bloquear secuencias de más de tres letras repetidas
                    if (/(.)\1{2,}/.test(value)) {
                      erroresTemp.Nombre = 'El nombre no puede contener más de tres letras repetidas consecutivas.';
                      setErrorMessages(erroresTemp);
                      return;
                    }

                    // 🚫 Bloquear caracteres especiales, solo letras, acentos y espacios permitidos
                    if (/[^A-Za-záéíóúÁÉÍÓÚñÑ\s]/.test(value)) {
                      erroresTemp.Nombre = 'El nombre solo puede contener letras, acentos y espacios.';
                      setErrorMessages(erroresTemp);
                      return;
                    }

                    // 🚫 Bloquear más de un espacio consecutivo
                    if (/\s{2,}/.test(value)) {
                      erroresTemp.Nombre = 'El nombre no puede contener más de un espacio consecutivo.';
                      setErrorMessages(erroresTemp);
                      return;
                    }

                    // ✅ Validación del campo vacío y tamaño mínimo
                    if (!value.trim()) {
                      erroresTemp.Nombre = 'El nombre no puede estar vacío.';
                    } else if (value.length < 2) {
                      erroresTemp.Nombre = 'El nombre debe tener al menos 2 caracteres.';
                    } else {
                      erroresTemp.Nombre = '';
                    }

                    setPersonaToUpdate({ ...personaToUpdate, Nombre: value });
                    setErrorMessages(erroresTemp);
                  }}
                  style={{
                    color: personaToUpdate.Nombre ? '#000' : '#6c757d', // ✅ Negro para datos, gris para instrucciones
                  }}
                  onCopy={disableCopyPaste}
                  onPaste={disableCopyPaste}
                  required
                />

              </CInputGroup>
            </div>
{/********************************************************SEGUNDO NOMBRE*****************************************************************/}
          <div className="col-md-12">
            {errorMessages.Segundo_nombre && (
              <div className="error-message" style={{ marginBottom: '10px', color: 'red', fontSize: '0.850rem' }}>
                {errorMessages.Segundo_nombre}
              </div>
            )}
            <CInputGroup className="mb-3">
              <CInputGroupText>Segundo Nombre</CInputGroupText>
              <CFormInput
                type="text"
                placeholder="Segundo Nombre"
                value={personaToUpdate.Segundo_nombre || ''}
                onChange={(e) => {
                  const value = e.target.value.toUpperCase(); // Convertir a mayúsculas automáticamente
                  let erroresTemp = { ...errorMessages };

                  // 🚫 Bloquear secuencias de más de tres letras repetidas
                  if (/(.)\1{2,}/.test(value)) {
                    erroresTemp.Segundo_nombre = 'El segundo nombre no puede contener más de tres letras repetidas consecutivas.';
                    setErrorMessages(erroresTemp);
                    return;
                  }

                  // 🚫 Bloquear caracteres especiales, solo letras, acentos y espacios permitidos
                  if (/[^A-Za-záéíóúÁÉÍÓÚñÑ\s]/.test(value)) {
                    erroresTemp.Segundo_nombre = 'El segundo nombre solo puede contener letras, acentos y espacios.';
                    setErrorMessages(erroresTemp);
                    return;
                  }

                  // 🚫 Bloquear más de un espacio consecutivo
                  if (/\s{2,}/.test(value)) {
                    erroresTemp.Segundo_nombre = 'El segundo nombre no puede contener más de un espacio consecutivo.';
                    setErrorMessages(erroresTemp);
                    return;
                  }

                  // ✅ Validación del campo vacío y tamaño mínimo
                  if (!value.trim()) {
                    erroresTemp.Segundo_nombre = 'El segundo nombre no puede estar vacío.';
                  } else if (value.length < 2) {
                    erroresTemp.Segundo_nombre = 'El segundo nombre debe tener al menos 2 caracteres.';
                  } else {
                    erroresTemp.Segundo_nombre = '';
                  }

                  setPersonaToUpdate({ ...personaToUpdate, Segundo_nombre: value });
                  setErrorMessages(erroresTemp);
                }}
                style={{
                  color: personaToUpdate.Segundo_nombre ? '#000' : '#6c757d', // ✅ Negro para datos, gris para instrucciones
                }}
                onCopy={disableCopyPaste}
                onPaste={disableCopyPaste}
              required
            />

            </CInputGroup>
          </div>
{/****************************************************PRIMER APELLIDO*******************************************************************/}
        <div className="col-md-12">
          {errorMessages.Primer_apellido && (
            <div className="error-message" style={{ marginBottom: '10px', color: 'red', fontSize: '0.850rem' }}>
              {errorMessages.Primer_apellido}
            </div>
          )}
          <CInputGroup className="mb-3">
            <CInputGroupText>Primer Apellido</CInputGroupText>
            <CFormInput
            type="text"
            placeholder="Primer Apellido"
            value={personaToUpdate.Primer_apellido || ''}
            onChange={(e) => {
              const value = e.target.value.toUpperCase(); // Convertir a mayúsculas automáticamente
              let erroresTemp = { ...errorMessages };

              // 🚫 Bloquear secuencias de más de tres letras repetidas
              if (/(.)\1{2,}/.test(value)) {
                erroresTemp.Primer_apellido = 'El primer apellido no puede contener más de tres letras repetidas consecutivas.';
                setErrorMessages(erroresTemp);
                return;
              }

              // 🚫 Bloquear caracteres especiales, solo letras, acentos y espacios permitidos
              if (/[^A-Za-záéíóúÁÉÍÓÚñÑ\s]/.test(value)) {
                erroresTemp.Primer_apellido = 'El primer apellido solo puede contener letras, acentos y espacios.';
                setErrorMessages(erroresTemp);
                return;
              }

              // 🚫 Bloquear más de un espacio consecutivo
              if (/\s{2,}/.test(value)) {
                erroresTemp.Primer_apellido = 'El primer apellido no puede contener más de un espacio consecutivo.';
                setErrorMessages(erroresTemp);
                return;
              }

              // ✅ Validación del campo vacío y tamaño mínimo
              if (!value.trim()) {
                erroresTemp.Primer_apellido = 'El primer apellido no puede estar vacío.';
              } else if (value.length < 2) {
                erroresTemp.Primer_apellido = 'El primer apellido debe tener al menos 2 caracteres.';
              } else {
                erroresTemp.Primer_apellido = '';
              }

              setPersonaToUpdate({ ...personaToUpdate, Primer_apellido: value });
              setErrorMessages(erroresTemp);
            }}
            style={{
              color: personaToUpdate.Primer_apellido ? '#000' : '#6c757d', // ✅ Negro para datos, gris para instrucciones
            }}
            onCopy={disableCopyPaste}
            onPaste={disableCopyPaste}
            required
          />

          </CInputGroup>
        </div>
{/****************************************************SEGUNDO APELLIDO******************************************************************/}
            <div className="col-md-12">
              {errorMessages.Segundo_apellido && (
                <div className="error-message" style={{ marginBottom: '10px', color: 'red', fontSize: '0.850rem' }}>
                  {errorMessages.Segundo_apellido}
                </div>
              )}
              <CInputGroup className="mb-3">
                <CInputGroupText>Segundo Apellido</CInputGroupText>
                <CFormInput
                  type="text"
                  placeholder="Segundo Apellido"
                  value={personaToUpdate.Segundo_apellido || ''}
                  onChange={(e) => {
                    const value = e.target.value.toUpperCase(); // Convertir a mayúsculas automáticamente
                    let erroresTemp = { ...errorMessages };

                    // 🚫 Bloquear secuencias de más de tres letras repetidas
                    if (/(.)\1{2,}/.test(value)) {
                      erroresTemp.Segundo_apellido = 'El segundo apellido no puede contener más de tres letras repetidas consecutivas.';
                      setErrorMessages(erroresTemp);
                      return;
                    }

                    // 🚫 Bloquear caracteres especiales, solo letras, acentos y espacios permitidos
                    if (/[^A-Za-záéíóúÁÉÍÓÚñÑ\s]/.test(value)) {
                      erroresTemp.Segundo_apellido = 'El segundo apellido solo puede contener letras, acentos y espacios.';
                      setErrorMessages(erroresTemp);
                      return;
                    }

                    // 🚫 Bloquear más de un espacio consecutivo
                    if (/\s{2,}/.test(value)) {
                      erroresTemp.Segundo_apellido = 'El segundo apellido no puede contener más de un espacio consecutivo.';
                      setErrorMessages(erroresTemp);
                      return;
                    }

                    // ✅ Validación del campo vacío y tamaño mínimo
                    if (!value.trim()) {
                      erroresTemp.Segundo_apellido = 'El segundo apellido no puede estar vacío.';
                    } else if (value.length < 2) {
                      erroresTemp.Segundo_apellido = 'El segundo apellido debe tener al menos 2 caracteres.';
                    } else {
                      erroresTemp.Segundo_apellido = '';
                    }

                    setPersonaToUpdate({ ...personaToUpdate, Segundo_apellido: value });
                    setErrorMessages(erroresTemp);
                  }}
                  style={{
                    color: personaToUpdate.Segundo_apellido ? '#000' : '#6c757d', // ✅ Negro para datos, gris para instrucciones
                  }}
                  onCopy={disableCopyPaste}
                  onPaste={disableCopyPaste}
                />

              </CInputGroup>
            </div>
{/*************************************************FECHA DE NACIMIENTO********************************************************************/}
              <div className="col-md-12">
              {errorMessages.fecha_nacimiento && (
                <div className="error-message" style={{ marginBottom: '10px', color: 'red', fontSize: '0.850rem' }}>
                  {errorMessages.fecha_nacimiento}
                </div>
              )}
              <CInputGroup className="mb-3">
                <CInputGroupText>Fecha de Nacimiento</CInputGroupText>
                <CFormInput
                type="date"
                value={personaToUpdate.fecha_nacimiento || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  setPersonaToUpdate((prevState) => ({
                    ...prevState,
                    fecha_nacimiento: value,
                  }));

                  // ✅ Validación de la fecha de nacimiento en tiempo real
                  let erroresTemp = { ...errorMessages };
                  if (!value || value === '') {
                    erroresTemp.fecha_nacimiento = 'Debe ingresar una fecha de nacimiento válida.';
                  } else {
                    const currentYear = new Date().getFullYear();
                    const minYear = currentYear - 100;
                    const maxYear = currentYear - 4;
                    const fechaNacimiento = new Date(value);
                    const añoNacimiento = fechaNacimiento.getFullYear();
                    if (añoNacimiento < minYear || añoNacimiento > maxYear) {
                      erroresTemp.fecha_nacimiento = `La fecha de nacimiento debe estar entre los años ${minYear} y ${maxYear}.`;
                    } else {
                      erroresTemp.fecha_nacimiento = '';
                    }
                  }
                  setErrorMessages(erroresTemp);
                }}
                style={{
                  color: personaToUpdate.fecha_nacimiento ? '#000' : '#6c757d', // ✅ Negro para datos, gris para instrucciones
                }}
                required
              />

              </CInputGroup>
            </div>

{/*****************************************************COLUMNA DERECHA***************************************************************/}
              </CCol>
                <CCol md={6}>

{/***********************************************************DIRECCION****************************************************************/}
<div className="col-md-12">
                {errorMessages.direccion_persona && (
                  <div className="error-message" style={{ marginBottom: '10px', color: 'red', fontSize: '0.850rem' }}>
                    {errorMessages.direccion_persona}
                  </div>
                )}
                <CInputGroup className="mb-3">
                  <CInputGroupText>Dirección</CInputGroupText>
                  <CFormInput
                    type="text"
                    placeholder="Dirección"
                    value={personaToUpdate.direccion_persona || ''}
                    onChange={(e) => {
                      const value = e.target.value.toUpperCase(); // Convertir a mayúsculas automáticamente
                      let erroresTemp = { ...errorMessages };

                      // 🚫 Bloquear secuencias de más de tres letras repetidas
                      if (/(.)\1{2,}/.test(value)) {
                        erroresTemp.direccion_persona = 'La dirección no puede contener más de tres letras repetidas consecutivas.';
                        setErrorMessages(erroresTemp);
                        return;
                      }

                      // 🚫 Permitir solo caracteres necesarios para direcciones (letras, números, guiones, espacios, puntos, comas)
                      if (/[^A-Za-záéíóúÁÉÍÓÚñÑ0-9\s\-#.,]/.test(value)) {
                        erroresTemp.direccion_persona = 'La dirección solo puede contener letras, números, acentos, espacios y caracteres como guiones, puntos y comas.';
                        setErrorMessages(erroresTemp);
                        return;
                      }

                      // 🚫 Bloquear más de un espacio consecutivo
                      if (/\s{2,}/.test(value)) {
                        erroresTemp.direccion_persona = 'La dirección no puede contener más de un espacio consecutivo.';
                        setErrorMessages(erroresTemp);
                        return;
                      }

                      // ✅ Validación del campo vacío
                      if (!value.trim()) {
                        erroresTemp.direccion_persona = 'La dirección no puede estar vacía.';
                      } else {
                        erroresTemp.direccion_persona = '';
                      }

                      setPersonaToUpdate({ ...personaToUpdate, direccion_persona: value });
                      setErrorMessages(erroresTemp);
                    }}
                    style={{
                      color: personaToUpdate.direccion_persona ? '#000' : '#6c757d', // ✅ Negro para datos, gris para instrucciones
                    }}
                    onCopy={disableCopyPaste}
                    onPaste={disableCopyPaste}
                    required
                  />
                </CInputGroup>
                {/* Estilos dentro del componente */}
              </div>    

{/***************************************************************NACIONAL**********************************************************************/}
<div className="mb-3">
  {errorMessages.nacionalidad && (
    <div className="error-message" style={{ marginBottom: '10px', color: 'red', fontSize: '0.850rem' }}>
      {errorMessages.nacionalidad}
    </div>
  )}
  <CInputGroup className="mb-3">
    <CInputGroupText>Nacionalidad</CInputGroupText>
    <CFormInput
  type="text"
  value={buscadorNacionalidad || ''}
  onKeyPress={handleKeyPress}
  onChange={handleBuscarNacionalidad}
  onCopy={disableCopyPaste}
  onPaste={disableCopyPaste}
  placeholder="Buscar por sigla de país o nombre"
  style={{
    color: buscadorNacionalidad ? '#000' : '#6c757d', // ✅ Negro para datos, gris para instrucciones
  }}
/>
    <CButton type="button">
      <CIcon icon={cilSearch} />
    </CButton>
  </CInputGroup>
  {isDropdownOpenNacionalidad && nacionalidadesFiltradas.length > 0 && (
  <div className="dropdown-container" style={{ position: 'relative' }}>
    <div 
      className="dropdown-menu show" 
      style={{
        position: 'absolute',
        zIndex: 999,
        top: '100%',
        left: '0',
        width: '100%',
        maxHeight: '200px',  // ✅ Limita la altura del dropdown
        overflowY: 'auto',   // ✅ Habilita desplazamiento vertical
        border: '1px solid #ccc',
        borderRadius: '6px',
        boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
      }}
    >
      {nacionalidadesFiltradas.map((nacionalidad) => (
        <div
          key={nacionalidad.Cod_nacionalidad}
          className="dropdown-item"
          style={{
            cursor: 'pointer',
            padding: '8px 12px', // ✅ Mejora el espacio entre elementos
            color: '#000', // 🔄 Ahora el texto se verá en negro
          }}
          onClick={() => {
            handleSeleccionarNacionalidad(nacionalidad);
            setPersonaToUpdate({
              ...personaToUpdate,
              cod_nacionalidad: nacionalidad.Cod_nacionalidad,
              Id_nacionalidad: nacionalidad.Id_nacionalidad,
            });
          }}
        >
          {nacionalidad.Id_nacionalidad.toUpperCase()} - {nacionalidad.pais_nacionalidad.toUpperCase()}
        </div>
      ))}
    </div>
  </div>
)}  
</div>
{/********************************************************DEPARTAMENTO**********************************************************************/}
        <div className="col-md-12">
          {errorMessages.cod_departamento && (
            <div className="error-message" style={{ marginBottom: '10px', color: 'red', fontSize: '0.850rem' }}>
              {errorMessages.cod_departamento}
            </div>
          )}
          <CInputGroup className="mb-3">
            <CInputGroupText>Departamento</CInputGroupText>
            <CFormSelect
          value={personaToUpdate.cod_departamento || ''}
          onChange={(e) => {
            const value = parseInt(e.target.value, 10); // 💡 Convertimos el valor a número de manera segura

            // Buscar el objeto completo del departamento seleccionado
            const departamentoSeleccionado = departamentos.find(depto => depto.Cod_departamento === value);

            if (departamentoSeleccionado) {
              handleSeleccionarDepartamentoUpdate(departamentoSeleccionado); // ✅ Ahora ejecutamos el filtro de municipios aquí
            }

            // ✅ Validación en tiempo real
            let erroresTemp = { ...errorMessages };
            erroresTemp.cod_departamento = value ? '' : 'Debe seleccionar un departamento.';

            setErrorMessages(erroresTemp);
            setPersonaToUpdate(prev => ({ ...prev, cod_departamento: value }));
          }}
          required
          style={{
            color: personaToUpdate.cod_departamento ? '#000' : '#6c757d', // ✅ Negro para datos, gris para instrucciones
          }}
        >
          <option value="" style={{ color: '#6c757d' }}>Seleccione un departamento</option>
          {departamentos.map((depto) => (
            <option key={depto.Cod_departamento} value={depto.Cod_departamento} style={{ color: '#000' }}>
              {depto.Nombre_departamento.toUpperCase()}
            </option>
          ))}
        </CFormSelect>

          </CInputGroup>
        </div>

{/*********************************************************MUNICIPIO**********************************************************************/}
          <div className="mb-3">
            {errorMessages.municipio && (
              <div className="error-message" style={{ marginBottom: '10px', color: 'red', fontSize: '0.850rem' }}>
                {errorMessages.municipio}
              </div>
            )}
            <CInputGroup className="mb-3">
              <CInputGroupText>Municipio</CInputGroupText>
              <CFormInput
              type="text"
              value={buscadorMunicipio || ''}
              onKeyPress={handleKeyPress}
              onChange={handleBuscarMunicipio}
              onCopy={disableCopyPaste}
              onPaste={disableCopyPaste}
              placeholder="Buscar por nombre del municipio"
              style={{
                color: buscadorMunicipio ? '#000' : '#6c757d', // ✅ Negro para datos, gris para instrucciones
              }}
            />
              <CButton type="button">
                <CIcon icon={cilSearch} />
              </CButton>
            </CInputGroup>
            {isDropdownOpenMunicipio && municipiosFiltrados.length > 0 && (
  <div className="dropdown-container" style={{ position: 'relative' }}>
    <div 
      className="dropdown-menu show" 
      style={{
        position: 'absolute',
        zIndex: 999,
        top: '100%',
        left: '0',
        width: '100%',
        maxHeight: '180px',  // ✅ Limita la altura del dropdown
        overflowY: 'auto',   // ✅ Habilita desplazamiento vertical
        border: '1px solid #ccc',
        borderRadius: '6px',
        boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
      }}
    >
      {municipiosFiltrados.map((municipio) => (
        <div
          key={municipio.cod_municipio}
          className="dropdown-item"
          style={{
            cursor: 'pointer',
            padding: '8px 12px', // ✅ Mejora el espacio entre elementos
            color: '#000', // 🔄 Ahora el texto se verá en negro
          }}
          onClick={() => {
            handleSeleccionarMunicipio(municipio);
            setPersonaToUpdate(prev => ({
              ...prev,
              cod_municipio: municipio.Cod_municipio,
              Nombre_municipio: municipio.Nombre_municipio,
            }));
          }}
        >
          {municipio.Nombre_municipio.toUpperCase()} - {municipio.Nombre_departamento.toUpperCase()}
        </div>
      ))}
    </div>
  </div>
)}
</div>
{/***********************************************************GÉNERO**********************************************************************/}
<div className="col-md-12">
      <div className="col-md-12">
        {errorMessages.cod_genero && (
          <div className="error-message" style={{ marginBottom: '10px', color: 'red', fontSize: '0.850rem' }}>
            {errorMessages.cod_genero}
          </div>
        )}
        <CInputGroup className="mb-3">
          <CInputGroupText>Género</CInputGroupText>
          <CFormSelect
            value={personaToUpdate.cod_genero || ''}
            onChange={(e) => {
              const value = e.target.value;

              // ✅ Validación en tiempo real
              let erroresTemp = { ...errorMessages };
              erroresTemp.cod_genero = value ? '' : 'Debe seleccionar un género.';

              setErrorMessages(erroresTemp);
              setPersonaToUpdate({ ...personaToUpdate, cod_genero: parseInt(value, 10) });
            }}
            required
            style={{
              color: personaToUpdate.cod_genero ? '#000' : '#6c757d', // ✅ Negro para datos, gris para instrucciones
            }}
          >
            <option value="" style={{ color: '#6c757d' }}>Seleccione un género</option>
            {generos.map((genero) => (
              <option key={genero.Cod_genero} value={genero.Cod_genero} style={{ color: '#000' }}>
                {genero.Tipo_genero.toUpperCase()}
              </option>
            ))}
          </CFormSelect>
        </CInputGroup>
      </div>
    </div>

{/************************************************************TIPO PERSONA**********************************************************************/}
<div className="col-md-12">
      <div className="col-md-12">
        {errorMessages.cod_tipo_persona && (
          <div className="error-message" style={{ marginBottom: '10px', color: 'red', fontSize: '0.850rem' }}>
            {errorMessages.cod_tipo_persona}
          </div>
        )}
        <CInputGroup className="mb-3">
          <CInputGroupText>Tipo Persona</CInputGroupText>
          <CFormSelect
  value={personaToUpdate.cod_tipo_persona || ''}
  onChange={(e) => {
    const value = e.target.value;

    // ✅ Validación en tiempo real
    let erroresTemp = { ...errorMessages };
    erroresTemp.cod_tipo_persona = value ? '' : 'Debe seleccionar un tipo de persona.';

    // ✅ Desactivar el checkbox "Principal" si el tipo de persona es "ESTUDIANTE"
    const tipoSeleccionado = tipoPersona.find(tipo => tipo.Cod_tipo_persona === parseInt(value, 10));
    setPersonaToUpdate({
      ...personaToUpdate,
      cod_tipo_persona: value,
      principal: tipoSeleccionado && tipoSeleccionado.Tipo_persona === 'ESTUDIANTE' ? false : personaToUpdate.principal,
    });

    setErrorMessages(erroresTemp);
  }}
  required
  style={{
    color: personaToUpdate.cod_tipo_persona ? '#000' : '#6c757d', // ✅ Negro para datos, gris para instrucciones
  }}
>
  <option value="" style={{ color: '#6c757d' }}>Seleccione un tipo de persona</option>
  {tipoPersona.map((tipo) => (
    <option key={tipo.Cod_tipo_persona} value={tipo.Cod_tipo_persona} style={{ color: '#000' }}>
      {tipo.Tipo_persona.toUpperCase()}
    </option>
  ))}
</CFormSelect>

        </CInputGroup>
      </div>
{/********************************************************PRINCIPAL**********************************************************************/}
      <div className="col-md-6">
        <CInputGroup className="mb-3 align-items-center">
          <CInputGroupText style={{ width: '230px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>Principal</span>
            <CFormCheck
            type="checkbox"
            label=""
            checked={personaToUpdate.principal}
            onChange={(e) => {
              const tipoSeleccionado = tipoPersona.find(tipo => tipo.Cod_tipo_persona === parseInt(personaToUpdate.cod_tipo_persona, 10));
              if (tipoSeleccionado && tipoSeleccionado.Tipo_persona !== 'ESTUDIANTE') {
                setPersonaToUpdate(prev => ({ ...prev, principal: e.target.checked }));
              }
            }}
            style={{ transform: 'scale(1.3)', marginLeft: '10px' }}
            disabled={tipoPersona.some(tipo => tipo.Cod_tipo_persona === parseInt(personaToUpdate.cod_tipo_persona, 10) && tipo.Tipo_persona === 'ESTUDIANTE')}
          />

          </CInputGroupText>
        </CInputGroup>
      </div>

      <style jsx>{`
        .error-message {
          color: red;
          font-size: 0.850rem;  /* Tamaño de texto más pequeño */
          margin-top: 4px;  /* Menor distancia entre el input y el mensaje de error */
          margin-bottom: 0;
          margin-left: 12px;  /* Para alinearlo con el texto del input */
        }
      `}</style>
    </div>
{/***************************************************************TIPO PERSONA**********************************************************************/}


{/*****************************************************************************************************************************************/}
              </CCol>
            </CRow>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton
            style={{ backgroundColor: '#6c757d', color: 'white', borderColor: '#6c757d' }}
            onClick={closeUpdateModal}
          >
            Cancelar
          </CButton>
          <CButton
            style={{ backgroundColor: '#4B6251', color: 'white', borderColor: '#4B6251' }}
            onClick={handleUpdatePersona} // Llamar a la función para actualizar los datos
          >
            <CIcon icon={cilSave} /> Guardar
          </CButton>
        </CModalFooter>
      </CModal>
{/***************************************************MODAL PARA ACTUALIZAR UNA PERSONA*******************************************************/}

{/*******************************************************MODAL PARA ELIMINAR UNA PERSONA****************************************************/}
      <CModal
        visible={modalDeleteVisible}
        onClose={() => setModalDeleteVisible(false)}
        backdrop="static"
      >
        <CModalHeader closeButton>
          <CModalTitle>Eliminar Persona</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <p>¿Estás seguro de que deseas eliminar a la persona {personaToDelete.codigo_persona}?</p>
        </CModalBody>
        <CModalFooter>
          <CButton
            style={{ backgroundColor: '#6c757d', color: 'white', borderColor: '#6c757d' }}
            onClick={() => setModalDeleteVisible(false)}
          >
            Cancelar
          </CButton>
          <CButton
            style={{ backgroundColor: '#dc3545', color: 'white', borderColor: '#dc3545' }}
            onClick={handleDeletePersona}
          >
            Eliminar
          </CButton>
        </CModalFooter>
      </CModal>
{/*********************************************FIN MODAL PARA ELIMINAR UNA PERSONA****************************************************/}
    </CContainer>
  )
}
export default ListaPersonas




