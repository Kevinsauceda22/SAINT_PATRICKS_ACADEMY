import React, { useState, useEffect } from 'react'
import { CIcon } from '@coreui/icons-react'
import { cilXCircle, cilCheckCircle } from '@coreui/icons';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import {
  cilSearch,
  cilBrushAlt,
  cilPen,
  cilTrash,
  cilPlus,
  cilSave,
  cilDescription,
  cilInfo,
  cilContact,
  cilPeople,
} from '@coreui/icons'
import { useNavigate } from 'react-router-dom'
import swal from 'sweetalert2' // Importar SweetAlert
import axios from 'axios'
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
  const [personaToUpdate, setPersonaToUpdate] = useState({
    cod_persona: '', dni_persona: '', Nombre: '', Segundo_nombre: '', Primer_apellido: '', Segundo_apellido: '', 
    direccion_persona: '', fecha_nacimiento: '', Estado_Persona: '', cod_tipo_persona: '', principal: '', cod_nacionalidad: '', cod_departamento: '', cod_municipio: '', cod_genero: '', 
  });
  const [formData, setFormData] = useState({ dni_persona: '',    Nombre: '',Segundo_nombre: '', Primer_apellido: '', Segundo_apellido: '',
     direccion_persona: '', fecha_nacimiento: '', Estado_Persona: '', cod_tipo_persona: '', cod_departamento: '',
    cod_municipio: '', cod_genero: '', principal: '',})
  const [personaToDelete, setPersonaToDelete] = useState({})
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [recordsPerPage, setRecordsPerPage] = useState(10)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  const [tipoPersona, setTipoPersona] = useState([])
  const [generos, setGeneros] = useState([])
  const [departamentos, setDepartamentos] = useState([])
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  


  
  const [municipio, setMunicipio] = useState([])
  const [buscadorMunicipio, setBuscadorMunicipio] = useState(''); // Valor del input de búsqueda
  const [municipiosFiltrados, setMunicipiosFiltrados] = useState([]); // Resultados filtrados
  const [isDropdownOpenMunicipio, setIsDropdownOpenMunicipio] = useState(false); // Control del dropdown
  const [selectedMunicipio, setSelectedMunicipio] = useState(null); // Guardar el municipio seleccionado




  const [nacionalidad, setNacionalidad] = useState([]); // Estado para todas las nacionalidades
  const [buscadorNacionalidad, setBuscadorNacionalidad] = useState(''); // Valor del input de búsqueda
  const [nacionalidadesFiltradas, setNacionalidadesFiltradas] = useState([]); // Resultados filtrados
  const [isDropdownOpenNacionalidad, setIsDropdownOpenNacionalidad] = useState(false); // Control del dropdown
  const [selectedNacionalidad, setSelectedNacionalidad] = useState(null); // Guardar la nacionalidad seleccionada

  
  const currentYear = new Date().getFullYear();
  const minYear = currentYear - 90;
  const maxYear = currentYear - 4;



  const [errorMessages, setErrorMessages] = useState({
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

  const navigate = useNavigate()

  const abrirEstructuraFamiliarModal = (personas) => {
    console.log('Persona seleccionada en el componente origen:', personas); // Verifica que los datos estén presentes
    navigate('/ListaEstructura', { state: { personaSeleccionada: personas } });
  };
  
  const abrirContactoModal = (personas) => {
    console.log('Persona seleccionada en el componente origen:', personas); // Verifica que los datos estén presentes
    navigate('/contacto', { state: { personaSeleccionada: personas } });
  };


  {/* ***********************************************************FUNCIONES DE VALIDACION*****************************************************/}
  

  const handleTipoPersonaChange = (e) => {
    const value = e.target.value;
    setNuevaPersona((prevState) => ({ ...prevState, cod_tipo_persona: value }));

    // Validación para no aceptar vacío
    let erroresTemp = { ...errorMessages };
    if (!value) {
      erroresTemp.cod_tipo_persona = 'Debe seleccionar un tipo de persona.';
    } else {
      erroresTemp.cod_tipo_persona = '';
    }
    setErrorMessages(erroresTemp);

    // Buscar el tipo de persona seleccionado
    const tipoSeleccionado = tipoPersona.find(tipo => tipo.Cod_tipo_persona === parseInt(value, 10));
    
    // Desactivar "Principal" si se selecciona "ESTUDIANTE"
    if (tipoSeleccionado && tipoSeleccionado.Tipo === 'ESTUDIANTE') {
      setNuevaPersona((prevState) => ({ ...prevState, principal: false }));
    }
  };

// Expresión regular para validar solo letras y espacios
const soloLetrasYEspaciosRegex = /^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]+$/;
// Expresión regular para detectar caracteres especiales
const caracteresEspecialesRegex = /[^a-zA-ZÀ-ÿ\u00f1\u00d1\s]/g;
// Expresión regular para detectar más de un espacio consecutivo
const espacioMultiplesRegex = /\s{2,}/g;

const validarCampo = (nombreCampo, valorCampo) => {
  let errorMessage = '';

  // Filtramos caracteres no permitidos (caracteres especiales)
  let valorFiltrado = valorCampo.replace(caracteresEspecialesRegex, '');
  
  // Filtramos espacios consecutivos
  valorFiltrado = valorFiltrado.replace(espacioMultiplesRegex, ' ');

  // Si el valor ha cambiado, lo actualizamos en el estado
  if (valorFiltrado !== valorCampo) {
    setNuevaPersona((prevState) => ({
      ...prevState,
      [nombreCampo]: valorFiltrado,  // Actualizamos el campo con el valor filtrado
    }));
  }

  

  // Limpiar el mensaje de error después de un tiempo (3 segundos)
  if (errorMessage) {
    setTimeout(() => {
      setErrorMessages((prevErrors) => {
        const newErrors = { ...prevErrors };
        delete newErrors[nombreCampo]; // Elimina el error después del tiempo
        return newErrors;
      });
    }, 3000); // Tiempo en milisegundos (3 segundos)
  }
};

// Manejo de cambios en el formulario
const handleChange = (e) => {
  const { name, value } = e.target;
  validarCampo(name, value);
};


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

// Formateo y manejo de DNI
const formatDNI = (value) => {
  value = value.replace(/\D/g, '');
  if (value.length <= 4) {
    return value;
  } else if (value.length <= 8) {
    return `${value.slice(0, 4)}-${value.slice(4)}`;
  } else {
    return `${value.slice(0, 4)}-${value.slice(4, 8)}-${value.slice(8, 13)}`;
  }
};

// Deshabilitar copiar y pegar
const disableCopyPaste = (e) => {
  e.preventDefault();
  swal.fire({
    icon: 'warning',
    title: 'Acción bloqueada',
    text: 'Copiar y pegar no está permitido.',
  });
};

// useEffect para actualizar personaToUpdate
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

{/****************************************************RESETEAR FORMULARIO Y CERRAR MODAL*************************************************/}

const resetNuevaPersona = () => {
  setNuevaPersona({
    dni_persona: '', Nombre: '', Segundo_nombre: '', Primer_apellido: '', Segundo_apellido: '', direccion_persona: '', fecha_nacimiento: '',
    Estado_Persona: '', cod_tipo_persona: '', principal: '', cod_nacionalidad: '', cod_departamento: '', cod_municipio: '', cod_genero: '', 
  });
};

const resetPersonaToUpdate = () => {
  setPersonaToUpdate({ 
    cod_persona: '', dni_persona: '', Nombre: '', Segundo_nombre: '', Primer_apellido: '', Segundo_apellido: '', 
    direccion_persona: '', fecha_nacimiento: '', Estado_Persona: '', cod_tipo_persona: '', principal: '', cod_nacionalidad: '', cod_departamento: '', cod_municipio: '', cod_genero: '', 
  });
};

const handleCloseModal = (setModalVisible, resetData, formData = {}) => {
  const { 
    dni_persona = '', 
    Nombre = '', 
    Segundo_nombre = '', 
    Primer_apellido = '', 
    Segundo_apellido = '', 
    direccion_persona = '', 
    fecha_nacimiento = '', 
    Estado_Persona = '', 
    principal = '', 
    cod_tipo_persona = '', 
    cod_genero = '', 
    cod_nacionalidad = '', 
    cod_departamento = '', 
    cod_municipio = '' 
  } = formData;

  const hayDatos = dni_persona || Nombre || Segundo_nombre || Primer_apellido || Segundo_apellido ||
                   direccion_persona || fecha_nacimiento || Estado_Persona || principal || 
                   cod_tipo_persona || cod_genero || cod_nacionalidad || cod_departamento || cod_municipio;

  if (hayDatos) {
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
      }
    });
  } else {  
    setModalVisible(false);
  }
};


const openUpdateModal = (persona) => {
  // Asegúrate de que la fecha esté en el formato yyyy-MM-dd para el campo de fecha
  const fechaFormateada = persona.fecha_nacimiento ? formatearFecha(persona.fecha_nacimiento) : '';
  const nacionalidadSeleccionada = nacionalidad.find(nac => nac.Cod_nacionalidad === persona.cod_nacionalidad);
  setPersonaToUpdate({
      ...persona,
      fecha_nacimiento: fechaFormateada,
      buscadorNacionalidad: nacionalidadSeleccionada ? `${nacionalidadSeleccionada.Id_nacionalidad.toUpperCase()} - ${nacionalidadSeleccionada.pais_nacionalidad.toUpperCase()}` : '',
  });
  setModalUpdateVisible(true);
};


const closeUpdateModal = () => {
  handleCloseModal(setModalUpdateVisible, resetPersonaToUpdate, personaToUpdate);
};

const openAddModal = () => {
  setModalVisible(true);
};

const closeAddModal = () => {
  handleCloseModal(setModalVisible, resetNuevaPersona, nuevaPersona);
};

const openDeleteModal = (persona) => {
  setPersonaToDelete(persona);
  setModalDeleteVisible(true);
};

const openDetailModal = (persona) => {
  setSelectedPersona(persona);
  setShowDetailModal(true);
};

const closeDetailModal = () => {
  setShowDetailModal(false);
  setSelectedPersona(null);
};






{/***********************************FUNCION PARA BUSQUEDA Y SELECCION DE NACIONALIDAD CON VALIDACIONES**************************************/}

const handleBuscarNacionalidad = (e) => {
  const filtro = e.target.value.toUpperCase(); 
  setBuscadorNacionalidad(filtro); 

  let erroresTemp = { ...errorMessages };

  // Validaciones
  if (/[^A-Za-záéíóúÁÉÍÓÚñÑ\s]/.test(filtro)) {
    erroresTemp.nacionalidad = 'La nacionalidad solo puede contener letras, acentos y espacios.';
  } else if (/(.)\1{2,}/.test(filtro)) { // Bloquear más de dos letras repetidas consecutivas
    erroresTemp.nacionalidad = 'La nacionalidad no puede contener más de dos letras repetidas consecutivas.';
  } else if (/\s{2,}/.test(filtro)) { // Bloquear más de dos espacios consecutivos
    erroresTemp.nacionalidad = 'La nacionalidad no puede contener más de dos espacios consecutivos.';
  } else if (!filtro.trim()) { // Bloquear valores vacíos
    erroresTemp.nacionalidad = 'La nacionalidad no puede estar vacía.';
    setNacionalidadesFiltradas([]); // Limpiar resultados si el filtro está vacío
    setIsDropdownOpenNacionalidad(false); // Cerrar el dropdown
    setErrorMessages(erroresTemp);
    return;
  } else {
    erroresTemp.nacionalidad = '';
  }

  setErrorMessages(erroresTemp);

  if (filtro.trim() === '') {
    setNacionalidadesFiltradas([]); // Limpiar resultados si el filtro está vacío
    setIsDropdownOpenNacionalidad(false); // Cerrar el dropdown
    return;
  }

  // Filtrar las nacionalidades que coincidan con el texto en cualquier parte del id o país
  const filtradas = nacionalidad.filter((nacionalidad) =>
    (nacionalidad.pais_nacionalidad && nacionalidad.pais_nacionalidad.toUpperCase().includes(filtro)) ||
    (nacionalidad.Id_nacionalidad && nacionalidad.Id_nacionalidad.toUpperCase().includes(filtro))
  );

  setNacionalidadesFiltradas(filtradas); // Actualizar el estado con los resultados filtrados
  setIsDropdownOpenNacionalidad(filtradas.length > 0); // Mostrar el dropdown solo si hay resultados
};

// Función para manejar la selección de una nacionalidad
const handleSeleccionarNacionalidad = (nacionalidad) => {
  setBuscadorNacionalidad(`${nacionalidad.Id_nacionalidad.toUpperCase()} - ${nacionalidad.pais_nacionalidad.toUpperCase()}`); // Mostrar en el input
  setSelectedNacionalidad(nacionalidad.pais_nacionalidad.toUpperCase()); // Guardar solo pais_nacionalidad para la inserción
  setIsDropdownOpenNacionalidad(false);
  setNuevaPersona(prev => ({ ...prev, cod_nacionalidad: nacionalidad.Cod_nacionalidad }));
  console.log('Nacionalidad seleccionada:', nacionalidadSeleccionada); // Esto es solo para ver qué se seleccionó

};

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


{/***********************************FUNCION PARA BUSQUEDA Y SELECCION DE MUNICIPIO CON VALIDACIONES**************************************/}

const handleBuscarMunicipio = (e) => {
  const filtro = e.target.value.toUpperCase();
  setBuscadorMunicipio(filtro);

  if (filtro.trim() === '') {
    setMunicipiosFiltrados([]);
    setIsDropdownOpenMunicipio(false);
    return;
  }

  let erroresTemp = { ...errorMessages };

  // Validaciones
  if (/[^A-Za-záéíóúÁÉÍÓÚñÑ\s]/.test(filtro)) {
    erroresTemp.municipio = 'El nombre del municipio solo puede contener letras, acentos y espacios.';
  } else if (/(.)\1{2,}/.test(filtro)) { // Bloquear más de dos letras repetidas consecutivas
    erroresTemp.municipio = 'El nombre del municipio no puede contener más de dos letras repetidas consecutivas.';
  } else if (/\s{2,}/.test(filtro)) { // Bloquear más de dos espacios consecutivos
    erroresTemp.municipio = 'El nombre del municipio no puede contener más de dos espacios consecutivos.';
  } else if (!filtro.trim()) { // Bloquear valores vacíos
    erroresTemp.municipio = 'El nombre del municipio no puede estar vacío.';
    setMunicipiosFiltrados([]); // Limpiar resultados si el filtro está vacío
    setIsDropdownOpenMunicipio(false); // Cerrar el dropdown
    setErrorMessages(erroresTemp);
    return;
  } else {
    erroresTemp.municipio = '';
  }

  setErrorMessages(erroresTemp);

  const filtrados = municipio.filter((municipio) =>
    (municipio.Nombre_municipio && municipio.Nombre_municipio.toUpperCase().includes(filtro)) ||
    (municipio.Nombre_departamento && municipio.Nombre_departamento.toUpperCase().includes(filtro))
  );

  setMunicipiosFiltrados(filtrados);
  setIsDropdownOpenMunicipio(filtrados.length > 0);
};

const handleSeleccionarMunicipio = (municipio) => {
  setBuscadorMunicipio(`${municipio.Nombre_municipio.toUpperCase()} - ${municipio.Nombre_departamento.toUpperCase()}`);
  setSelectedMunicipio(municipio.Cod_municipio);
  setNuevaPersona(prev => ({ ...prev, cod_municipio: municipio.Cod_municipio }));
  setIsDropdownOpenMunicipio(false);
  console.log('Municipio seleccionado:', municipio);
};

{/******************************************************TABLAS RELACIONADAS***************************************************************/}

    const fetchPersonas = async () => {
      try {
        const response = await fetch('http://localhost:4000/api/persona/verPersonas')
        const data = await response.json()
  
        // Agrega un console.log aquí para ver los datos originales
        console.log('Datos recibidos del servidor:', data)
  
        const dataWithIndex = data.map((persona, index) => ({
          ...persona,
          originalIndex: index + 1,
        }))
  
        // Agrega otro console.log aquí para ver los datos con el índice adicional
        console.log('Datos con índice añadido:', dataWithIndex)
  
        setPersonas(dataWithIndex)
      } catch (error) {
        console.error('Error al obtener las personas:', error)
      }
    }

  const fetchNacionalidad = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/nacionalidad/verNacionalidades')
      const data = await response.json()
      console.log('Datos recibidos de nacionalidad:', data)
      setNacionalidad(data)
    } catch (error) {
      console.error('Error al obtener los nacionalidad:', error)
    }
  }

const fetchMunicipio = async () => {
  try {
    const response = await fetch('http://localhost:4000/api/persona/verMunicipios');
    const data = await response.json();
    console.log('Datos recibidos de la API:', data);

    if (Array.isArray(data) && Array.isArray(data[0])) {
      setMunicipio(data[0]); // Usar solo el primer elemento del resultado
    } else {
      console.error('Formato de datos inesperado:', data);
      setMunicipio([]); // Evitar errores en caso de formato incorrecto
    }
  } catch (error) {
    console.error('Error al obtener los municipios:', error);
  }
};


  

  const fetchDepartamentos = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/persona/verDepartamentos')
      const data = await response.json()
      console.log('Datos recibidos de departamentos:', data)
      setDepartamentos(data)
    } catch (error) {
      console.error('Error al obtener los departamentos:', error)
    }
  }

  const fetchTipoPersona = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/persona/verTipoPersona')
      const data = await response.json()
      console.log('Datos recibidos de tipo de persona:', data)
      setTipoPersona(data)
    } catch (error) {
      console.error('Error al obtener los tipos de persona:', error)
    }
  }

  const fetchGeneros = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/persona/verGeneros')
      const data = await response.json()
      console.log('Datos recibidos de géneros:', data)
      setGeneros(data)
    } catch (error) {
      console.error('Error al obtener los géneros:', error)
    }
  }

  useEffect(() => {
    fetchPersonas()
    fetchDepartamentos()
    fetchNacionalidad()
    fetchMunicipio()
    fetchTipoPersona()
    fetchGeneros()
  }, [])

{/********************************************FUNCION PARA CREAR UNA PERSONA*****************************************************/}

const handleCreatePersona = async () => {
  
  const dniSinGuiones = nuevaPersona.dni_persona.replace(/-/g, '');

  const errores = {};

  if (!/^\d{13}$/.test(dniSinGuiones)) {
    errores.dni_persona = 'El DNI debe tener exactamente 13 dígitos.';
  }

  const primerCuatroDNI = parseInt(dniSinGuiones.substring(0, 4));
  if (primerCuatroDNI < 101 || primerCuatroDNI > 2000) {
    errores.dni_persona = 'Ingrese un DNI válido. Los primeros cuatro dígitos deben estar entre 0101 y 2000.';
  }

  const añoNacimientoDNI = parseInt(dniSinGuiones.substring(4, 8));
  if (añoNacimientoDNI < 1930 || añoNacimientoDNI > 2020) {
    errores.dni_persona = 'Ingrese un DNI válido. El año debe estar entre 1920 y 2020.';
  }



  const campos = [
    { campo: nuevaPersona.Nombre, nombreCampo: 'Nombre' },
    { campo: nuevaPersona.Primer_apellido, nombreCampo: 'Primer apellido' },
  ];

  campos.forEach(({ campo, nombreCampo }) => {
    if (!campo || campo.length < 2 || campo.length > 50) {
      errores[nombreCampo] = `${nombreCampo} debe tener entre 2 y 50 caracteres.`;
    }
  });


  if (!nuevaPersona.cod_genero || nuevaPersona.cod_genero === '') {
    setErrorMessages((prevErrors) => ({
      ...prevErrors,
      cod_genero: 'Debe seleccionar un género.',
    }));
    return;
  }
  
  if (!nuevaPersona.cod_tipo_persona || nuevaPersona.cod_tipo_persona === '') {
    setErrorMessages((prevErrors) => ({
      ...prevErrors,
      cod_tipo_persona: 'Debe seleccionar un tipo de persona.',
    }));
    return;
  }
  
  if (!nuevaPersona.Estado_Persona || nuevaPersona.Estado_Persona === '') {
    setErrorMessages((prevErrors) => ({
      ...prevErrors,
      Estado_Persona: 'Debe seleccionar un estado',
    }));
    return;
  }
   
  if (!nuevaPersona.cod_nacionalidad || nuevaPersona.cod_nacionalidad === '') {
    setErrorMessages((prevErrors) => ({
      ...prevErrors,
      cod_nacionalidad: 'Debe seleccionar una nacionalidad.',
    }));
    return;
  }
  
  if (!nuevaPersona.cod_departamento || nuevaPersona.cod_departamento === '') {
    setErrorMessages((prevErrors) => ({
      ...prevErrors,
      cod_departamento: 'Debe seleccionar un departamento.',
    }));
    return;
  }
  
  if (!nuevaPersona.cod_municipio || nuevaPersona.cod_municipio === '') {
    setErrorMessages((prevErrors) => ({
      ...prevErrors,
      cod_municipio: 'Debe seleccionar un municipio.',
    }));
    return;
  }
  
  if (!nuevaPersona.fecha_nacimiento || nuevaPersona.fecha_nacimiento === '') {
    setErrorMessages((prevErrors) => ({
      ...prevErrors,
      fecha_nacimiento: 'Debe ingresar una fecha de nacimiento válida.',
    }));
    return;
  }  

  if (Object.keys(errores).length > 0) {
    setErrorMessages(errores);
    return;
  }

  // Log para verificar los datos antes de enviar
  console.log('Datos a enviar:', {
    dni_persona: dniSinGuiones,
    Nombre: nuevaPersona.Nombre,
    Segundo_nombre: nuevaPersona.Segundo_nombre,
    Primer_apellido: nuevaPersona.Primer_apellido,
    Segundo_apellido: nuevaPersona.Segundo_apellido,
    direccion_persona: nuevaPersona.direccion_persona,
    fecha_nacimiento: nuevaPersona.fecha_nacimiento,
    Estado_Persona: nuevaPersona.Estado_Persona,
    principal: nuevaPersona.principal,
    cod_tipo_persona: nuevaPersona.cod_tipo_persona,
    cod_nacionalidad: nuevaPersona.cod_nacionalidad,
    cod_departamento: nuevaPersona.cod_departamento,
    cod_municipio: nuevaPersona.cod_municipio,
    cod_genero: nuevaPersona.cod_genero,
  });

  try {
    const response = await fetch('http://localhost:4000/api/persona/crearPersona', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dni_persona: dniSinGuiones,
        Nombre: nuevaPersona.Nombre,
        Segundo_nombre: nuevaPersona.Segundo_nombre,
        Primer_apellido: nuevaPersona.Primer_apellido,
        Segundo_apellido: nuevaPersona.Segundo_apellido,
        direccion_persona: nuevaPersona.direccion_persona,
        fecha_nacimiento: nuevaPersona.fecha_nacimiento,
        Estado_Persona: nuevaPersona.Estado_Persona,
        principal: nuevaPersona.principal,
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
      if (errorData.errores) {
        setErrorMessages(errorData.errores);
      } else {
        swal.fire({
          icon: 'error',
          title: 'Error',
          text: `No se pudo crear la persona. Detalle: ${errorData.mensaje}`,
        });
      }
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
    const dniSinGuiones = personaToUpdate.dni_persona.replace(/-/g, '');
  
    // Realizar las validaciones antes de enviar los datos
    const errores = {};
  
    // Validación de DNI
    if (!/^\d{13}$/.test(dniSinGuiones)) {
      errores.dni_persona = 'El DNI debe tener exactamente 13 dígitos.';
    }
  
    const primerCuatroDNI = parseInt(dniSinGuiones.substring(0, 4));
    if (primerCuatroDNI < 101 || primerCuatroDNI > 2000) {
      errores.dni_persona = 'Ingrese un DNI válido. Los primeros cuatro dígitos deben estar entre 0101 y 2000.';
    }
  
    const añoNacimientoDNI = parseInt(dniSinGuiones.substring(4, 8));
    const currentYear = new Date().getFullYear();
    const minYear = currentYear - 90;
    const maxYear = currentYear - 4;
  
    if (añoNacimientoDNI < minYear || añoNacimientoDNI > maxYear) {
      errores.dni_persona = `Ingrese un DNI válido. El año debe estar entre ${minYear} y ${maxYear}.`;
    }
  
    // Validaciones de campos de texto
    const campos = [
      { campo: personaToUpdate.Nombre, nombreCampo: 'Nombre' },
      { campo: personaToUpdate.Primer_apellido, nombreCampo: 'Primer apellido' },
      // Añadir más campos si es necesario
    ];
  
    campos.forEach(({ campo, nombreCampo }) => {
      if (!campo || campo.length < 2 || campo.length > 50) {
        errores[nombreCampo] = `${nombreCampo} debe tener entre 2 y 50 caracteres.`;
      }
    });
  
    if (!personaToUpdate.fecha_nacimiento || personaToUpdate.fecha_nacimiento === '') {
      errores.fecha_nacimiento = 'Debe ingresar una fecha de nacimiento válida.';
    } else {
      const fechaNacimiento = new Date(personaToUpdate.fecha_nacimiento);
      const añoNacimiento = fechaNacimiento.getFullYear();
      const mesNacimiento = ('0' + (fechaNacimiento.getMonth() + 1)).slice(-2);
      const diaNacimiento = ('0' + fechaNacimiento.getDate()).slice(-2);
      const fechaFormateada = `${añoNacimiento}-${mesNacimiento}-${diaNacimiento}`;
  
      personaToUpdate.fecha_nacimiento = fechaFormateada;
  
      if (añoNacimiento < minYear || añoNacimiento > maxYear) {
        errores.fecha_nacimiento = `La fecha de nacimiento debe estar entre los años ${minYear} y ${maxYear}.`;
      }
    }
  
    // Validaciones para campos de selección
    const selectFields = [
      { field: personaToUpdate.cod_genero, fieldName: 'cod_genero', errorMessage: 'Debe seleccionar un género.' },
      { field: personaToUpdate.cod_tipo_persona, fieldName: 'cod_tipo_persona', errorMessage: 'Debe seleccionar un tipo de persona.' },
      { field: personaToUpdate.cod_nacionalidad, fieldName: 'cod_nacionalidad', errorMessage: 'Debe seleccionar una nacionalidad.' },
      { field: personaToUpdate.cod_departamento, fieldName: 'cod_departamento', errorMessage: 'Debe seleccionar un departamento.' },
      { field: personaToUpdate.cod_municipio, fieldName: 'cod_municipio', errorMessage: 'Debe seleccionar un municipio.' },
    ];
  
    selectFields.forEach(({ field, fieldName, errorMessage }) => {
      if (!field || field === '') {
        errores[fieldName] = errorMessage;
      }
    });
  
    if (Object.keys(errores).length > 0) {
      setErrorMessages(errores);  // Actualizar el estado de errores
      setIsSubmitting(false);
      return;  // Si hay errores, no continuar con la solicitud
    }
  
    // Log para verificar los datos antes de enviar
    console.log('Datos a enviar:', {
      cod_persona: personaToUpdate.cod_persona,
      dni_persona: dniSinGuiones,
      Nombre: personaToUpdate.Nombre,
      Segundo_nombre: personaToUpdate.Segundo_nombre,
      Primer_apellido: personaToUpdate.Primer_apellido,
      Segundo_apellido: personaToUpdate.Segundo_apellido,
      direccion_persona: personaToUpdate.direccion_persona,
      fecha_nacimiento: personaToUpdate.fecha_nacimiento,
      Estado_Persona: personaToUpdate.Estado_Persona,
      cod_tipo_persona: personaToUpdate.cod_tipo_persona,
      cod_nacionalidad: personaToUpdate.cod_nacionalidad,
      cod_departamento: personaToUpdate.cod_departamento,
      cod_municipio: personaToUpdate.cod_municipio,
      cod_genero: personaToUpdate.cod_genero,
      principal: personaToUpdate.principal,
    });
  
    try {
      const response = await fetch(`http://localhost:4000/api/persona/actualizarPersona/${personaToUpdate.cod_persona}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cod_persona: personaToUpdate.cod_persona,
          dni_persona: dniSinGuiones,
          Nombre: personaToUpdate.Nombre,
          Segundo_nombre: personaToUpdate.Segundo_nombre,
          Primer_apellido: personaToUpdate.Primer_apellido,
          Segundo_apellido: personaToUpdate.Segundo_apellido,
          direccion_persona: personaToUpdate.direccion_persona,
          fecha_nacimiento: personaToUpdate.fecha_nacimiento,
          Estado_Persona: personaToUpdate.Estado_Persona,
          cod_tipo_persona: personaToUpdate.cod_tipo_persona,
          cod_nacionalidad: personaToUpdate.cod_nacionalidad,
          cod_departamento: personaToUpdate.cod_departamento,
          cod_municipio: personaToUpdate.cod_municipio,
          cod_genero: personaToUpdate.cod_genero,
          principal: personaToUpdate.principal,
        }),
      });
  
      if (response.ok) {
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
        if (errorData.errores) {
          setErrorMessages(errorData.errores);
        } else {
          swal.fire({
            icon: 'error',
            title: 'Error',
            text: `No se pudo actualizar la persona. Detalle: ${errorData.mensaje}`,
          });
        }
      }
    } catch (error) {
      console.error('Error al actualizar la persona:', error);
      swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Ocurrió un error al intentar actualizar la persona.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  
  
{/****************************************FUNCION PARA ELIMINAR ***************************************************************/}
  const handleDeletePersona = async () => {
    try {
      const response = await fetch(
        `http://localhost:4000/api/persona/eliminarPersona/${encodeURIComponent(personaToDelete.cod_persona)}`,
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

  {/********************************FUNCIONES DE REPORTERIA Y BÚSQUEDA****************************************/}
  const handleSearch = (event) => {
    setSearchTerm(event.target.value)
    setCurrentPage(1)
  }

// Función de búsqueda de personas
const searchPersonas = (searchTerm) => {
  return personas.map((persona, index) => ({
    ...persona,
    originalIndex: index + 1, // Agregar índice original para ordenar
  })).filter((persona) => {
    // Lógica de filtro
    const tipoPersonaTexto = tipoPersona.find((tipo) => tipo.Cod_tipo_persona === persona.cod_tipo_persona)?.Tipo.toUpperCase() || 'N/D';
    const generoTexto = generos.find((genero) => genero.Cod_genero === persona.cod_genero)?.Tipo_genero.toUpperCase() || 'N/D';
    const nacionalidadTexto = nacionalidad.find((nac) => nac.Cod_nacionalidad === persona.cod_nacionalidad)?.pais_nacionalidad.toUpperCase() || 'N/D';
    const departamentoTexto = departamentos.find((depto) => depto.Cod_departamento === persona.cod_departamento)?.Nombre_departamento.toUpperCase() || 'N/D';
    const municipioTexto = municipio.find((municipio) => municipio.cod_municipio === persona.cod_municipio)?.nombre_municipio.toUpperCase() || 'N/D';
    const fechaNacimientoTexto = persona.fecha_nacimiento ? new Date(persona.fecha_nacimiento).toLocaleDateString('es-ES') : 'N/D';
    const estadoPersonaTexto = persona.Estado_Persona === 'A' ? 'ACTIVO' : 'SUSPENDIDO';

    return (
      (persona.dni_persona && persona.dni_persona.toUpperCase().includes(searchTerm.toUpperCase())) ||
      (persona.Nombre && persona.Nombre.toUpperCase().includes(searchTerm.toUpperCase())) ||
      (persona.Segundo_nombre && persona.Segundo_nombre.toUpperCase().includes(searchTerm.toUpperCase())) ||
      (persona.Primer_apellido && persona.Primer_apellido.toUpperCase().includes(searchTerm.toUpperCase())) ||
      (persona.Segundo_apellido && persona.Segundo_apellido.toUpperCase().includes(searchTerm.toUpperCase())) ||
      (persona.direccion_persona && persona.direccion_persona.toUpperCase().includes(searchTerm.toUpperCase())) ||
      (fechaNacimientoTexto && fechaNacimientoTexto.includes(searchTerm)) ||
      (estadoPersonaTexto && estadoPersonaTexto.includes(searchTerm.toUpperCase())) ||
      (nacionalidadTexto && nacionalidadTexto.includes(searchTerm.toUpperCase())) ||
      (departamentoTexto && departamentoTexto.includes(searchTerm.toUpperCase())) ||
      (municipioTexto && municipioTexto.includes(searchTerm.toUpperCase())) ||
      (tipoPersonaTexto && tipoPersonaTexto.includes(searchTerm.toUpperCase())) ||
      (generoTexto && generoTexto.includes(searchTerm.toUpperCase())) ||
      (persona.principal ? 'SÍ' : 'NO').includes(searchTerm.toUpperCase())
    );
  });
};

// Filtrado de personas
const filteredPersonas = searchPersonas(searchTerm);
const indexOfLastRecord = currentPage * recordsPerPage;
const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
const currentRecords = filteredPersonas.slice(indexOfFirstRecord, indexOfLastRecord);

const paginate = (pageNumber) => {
  if (pageNumber > 0 && pageNumber <= Math.ceil(filteredPersonas.length / recordsPerPage)) {
    setCurrentPage(pageNumber);
  }
};

  const ReportePersonasExcel = () => {
    const datosExportar = personas.map(persona => ({
      originalIndex: persona.originalIndex,
      dni_persona: persona.dni_persona ? persona.dni_persona.toUpperCase() : 'N/D',
      Nombre: persona.Nombre ? persona.Nombre.toUpperCase() : 'N/D',
      Segundo_nombre: persona.Segundo_nombre ? persona.Segundo_nombre.toUpperCase() : 'N/D',
      Primer_apellido: persona.Primer_apellido ? persona.Primer_apellido.toUpperCase() : 'N/D',
      Segundo_apellido: persona.Segundo_apellido ? persona.Segundo_apellido.toUpperCase() : 'N/D',
      direccion_persona: persona.direccion_persona ? persona.direccion_persona.toUpperCase() : 'N/D',
      fecha_nacimiento: new Date(persona.fecha_nacimiento).toLocaleDateString('en-CA'),
      principal: persona.principal ? 'Sí' : 'No',
      Estado_Persona: persona.Estado_Persona === 'A' ? 'Activo' : 'Suspendido',
      nacionalidad: nacionalidad.find((nac) => nac.Cod_nacionalidad === persona.cod_nacionalidad)?.pais_nacionalidad.toUpperCase() || 'N/D',
      departamento: departamentos.find((depto) => depto.Cod_departamento === persona.cod_departamento)?.Nombre_departamento.toUpperCase() || 'N/D',
      municipio: municipio.find((municipio) => municipio.cod_municipio === persona.cod_municipio)?.nombre_municipio.toUpperCase() || 'N/D',
      tipo_persona: tipoPersona.find((tipo) => tipo.Cod_tipo_persona === persona.cod_tipo_persona)?.Tipo.toUpperCase() || 'N/D',
      genero: generos.find((genero) => genero.Cod_genero === persona.cod_genero)?.Tipo_genero.toUpperCase() || 'N/D',
    }));
  
    const worksheet = XLSX.utils.json_to_sheet(datosExportar);
  
    // Aplicar estilos a las celdas
    const range = XLSX.utils.decode_range(worksheet['!ref']);
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_col(col) + "1"; // Primera fila (encabezados)
      if (!worksheet[cellAddress]) continue;
      worksheet[cellAddress].s = {
        font: { bold: true },
        fill: { fgColor: { rgb: "FFFF00" } }, // Fondo amarillo
        alignment: { horizontal: "center", vertical: "center" },
      };
    }
  
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Personas');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    saveAs(blob, 'reporte_personas.xlsx');
  };
  

const ReportePersonasPDF = () => {
  const doc = new jsPDF('l', 'mm', 'letter'); // Formato horizontal

  if (!filteredPersonas || filteredPersonas.length === 0) {
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
    doc.text('Reporte de Personas', pageWidth / 2, 50, { align: 'center' });

    doc.setLineWidth(0.5);
    doc.setDrawColor(0, 102, 51);
    doc.line(10, 60, pageWidth - 10, 60);

    // Tabla de datos
      const tableColumn = [
        { header: '#', dataKey: 'index', width: 20 },
        { header: 'DNI', dataKey: 'dni', width: 30 },
        { header: 'Primer   Nombre', dataKey: 'nombre', width: 30 },
        { header: 'Segundo Nombre', dataKey: 'segundo_nombre', width: 30 },
        { header: 'Primer Apellido', dataKey: 'primer_apellido', width: 30 },
        { header: 'Segundo Apellido', dataKey: 'segundo_apellido', width: 30 },
        { header: 'Dirección', dataKey: 'direccion', width: 40 },
        { header: 'Fecha Nacimiento', dataKey: 'fecha_nacimiento', width: 30 },
        { header: 'Estado', dataKey: 'estado', width: 20 },
        { header: 'Tipo Persona', dataKey: 'tipo_persona', width: 30 },
        { header: 'Género', dataKey: 'genero', width: 25 },
        { header: 'Principal', dataKey: 'principal', width: 20 },
      ];

    const tableRows = filteredPersonas.map((persona, index) => ({
      index: (index + 1).toString(),
      dni: persona.dni_persona?.toUpperCase() || 'N/D',
      nombre: persona.Nombre?.toUpperCase() || 'N/D',
      segundo_nombre: persona.Segundo_nombre?.toUpperCase() || 'N/D',
      primer_apellido: persona.Primer_apellido?.toUpperCase() || 'N/D',
      segundo_apellido: persona.Segundo_apellido?.toUpperCase() || 'N/D',
      direccion: persona.direccion_persona?.toUpperCase() || 'N/D',
      fecha_nacimiento: persona.fecha_nacimiento
        ? new Date(persona.fecha_nacimiento).toLocaleDateString('es-ES')
        : 'N/D',
      estado: persona.Estado_Persona === 'A' ? 'ACTIVO' : 'SUSPENDIDO',
      tipo_persona:
        tipoPersona.find((tipo) => tipo.Cod_tipo_persona === persona.cod_tipo_persona)?.Tipo.toUpperCase() || 'N/D',
      genero:
        generos.find((genero) => genero.Cod_genero === persona.cod_genero)?.Tipo_genero.toUpperCase() || 'N/D',
      principal: persona.principal ? 'SÍ' : 'NO',
    }));

    doc.autoTable({
      startY: 65,
      margin: { left: 3 }, // Ajusta márgenes si es necesario
      columns: [
        { header: '#', dataKey: 'index' },
        { header: 'DNI', dataKey: 'dni' },
        { header: 'Primer Nombre', dataKey: 'nombre' },
        { header: 'Segundo Nombre', dataKey: 'segundo_nombre' },
        { header: 'Primer Apellido', dataKey: 'primer_apellido' },
        { header: 'Segundo Apellido', dataKey: 'segundo_apellido' },
        { header: 'Dirección', dataKey: 'direccion' },
        { header: 'Fecha Nacimiento', dataKey: 'fecha_nacimiento' },
        { header: 'Estado', dataKey: 'estado' },
        { header: 'Tipo Persona', dataKey: 'tipo_persona' },
        { header: 'Género', dataKey: 'genero' },
        { header: 'Principal', dataKey: 'principal' },
      ],
      body: tableRows,
      headStyles: {
        fillColor: [0, 102, 51],
        textColor: [255, 255, 255],
        fontSize: 7,
        halign: 'center',
      },
      styles: {
        fontSize: 6,
        cellPadding: 3,
      },
      columnStyles: {
        index: { cellWidth: 15 }, // Ajusta el ancho de cada columna aquí
        dni: { cellWidth: 25 },
        nombre: { cellWidth: 25 },
        segundo_nombre: { cellWidth: 25 },
        primer_apellido: { cellWidth: 25 },
        segundo_apellido: { cellWidth: 25 },
        direccion: { cellWidth: 30 },
        fecha_nacimiento: { cellWidth: 20 },
        estado: { cellWidth: 20 },
        tipo_persona: { cellWidth: 25 },
        genero: { cellWidth: 20 },
        principal: { cellWidth: 17 },
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
        <head><title>Reporte de Personas</title></head>
        <body style="margin:0;">
          <iframe width="100%" height="100%" src="${pdfURL}" frameborder="0"></iframe>
          <div style="position:fixed;top:10px;right:20px;">
            <button style="background-color: #6c757d; color: white; border: none; padding: 10px 15px; border-radius: 5px; cursor: pointer;" 
              onclick="const a = document.createElement('a'); a.href='${pdfURL}'; a.download='Reporte_Personas.pdf'; a.click();">
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


{/* ************************************************************************************************************************************* */}
   // Verificar permisos
   if (!canSelect) {
    return <AccessDenied />;
  }
  
{/***********************************************VISTAS Y MODALES*************************************************************/}

return (
    <CContainer>
      <h1>Personas</h1>
      {/* Botones "Nuevo" y "Reporte" alineados arriba */}
      <div className="d-flex justify-content-end mb-3">
        <CButton
          style={{ backgroundColor: '#4B6251', color: 'white', marginRight: '10px' }}
          onClick={() => {
            openAddModal(true)
          }}
        >
          + Nueva
        </CButton>
        <CDropdown>
          <CDropdownToggle style={{ backgroundColor: '#6C8E58', color: 'white' }}>
            Reporte
          </CDropdownToggle>
          <CDropdownMenu>
            <CDropdownItem onClick={ReportePersonasExcel}>Descargar en Excel</CDropdownItem>
            <CDropdownItem onClick={ReportePersonasPDF}>Descargar en PDF</CDropdownItem>
          </CDropdownMenu>
        </CDropdown>
      </div>

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
  <CTable striped bordered hover>
    <CTableHead>
      <CTableRow>
        <CTableHeaderCell>#</CTableHeaderCell>
        <CTableHeaderCell>DNI</CTableHeaderCell>
        <CTableHeaderCell>Primer Nombre</CTableHeaderCell>
        <CTableHeaderCell>Segundo Nombre</CTableHeaderCell>
        <CTableHeaderCell>Primer Apellido</CTableHeaderCell>
        <CTableHeaderCell>Segundo Apellido</CTableHeaderCell>
        <CTableHeaderCell>Dirección</CTableHeaderCell>
        <CTableHeaderCell>Fecha de Nacimiento</CTableHeaderCell>
        <CTableHeaderCell>Principal</CTableHeaderCell>
        <CTableHeaderCell>Estado</CTableHeaderCell>
        <CTableHeaderCell>Nacionalidad</CTableHeaderCell>
        <CTableHeaderCell>Departamento</CTableHeaderCell>
        <CTableHeaderCell>Municipio</CTableHeaderCell>
        <CTableHeaderCell>Tipo de Persona</CTableHeaderCell>
        <CTableHeaderCell>Género</CTableHeaderCell>
        <CTableHeaderCell className="text-end">Acciones</CTableHeaderCell>
      </CTableRow>
    </CTableHead>
    <CTableBody>
      {console.log('currentRecords:', currentRecords)}{' '}
      {/* Verifica el contenido de currentRecords */}
      {currentRecords.length > 0 ? (
        currentRecords.map((persona) => {
          return (
            <CTableRow key={persona.cod_persona}>
              <CTableDataCell>{persona.originalIndex}</CTableDataCell>
              <CTableDataCell>{persona.dni_persona ? persona.dni_persona.toUpperCase() : 'N/D'}</CTableDataCell>
              <CTableDataCell>{persona.Nombre ? persona.Nombre.toUpperCase() : 'N/D'}</CTableDataCell>
              <CTableDataCell>{persona.Segundo_nombre ? persona.Segundo_nombre.toUpperCase() : 'N/D'}</CTableDataCell>
              <CTableDataCell>{persona.Primer_apellido ? persona.Primer_apellido.toUpperCase() : 'N/D'}</CTableDataCell>
              <CTableDataCell>{persona.Segundo_apellido ? persona.Segundo_apellido.toUpperCase() : 'N/D'}</CTableDataCell>
              <CTableDataCell>{persona.direccion_persona ? persona.direccion_persona.toUpperCase() : 'N/D'}</CTableDataCell>
              <CTableDataCell>{' '}{new Date(persona.fecha_nacimiento).toLocaleDateString('en-CA')}</CTableDataCell>
              <CTableDataCell className="text-center">{persona.principal ? (<CIcon icon={cilCheckCircle} style={{ fontSize: '2em', color: '#28a745' }}/>) : ( 
              <CIcon icon={cilXCircle} style={{ fontSize: '2em', color: '#dc3545' }}/> )} </CTableDataCell>
              <CTableDataCell className="text-center">
            {persona.Estado_Persona === 'A' ? (
              <span className="badge bg-success">Activo</span>
            ) : (
              <span className="badge bg-warning text-dark">Suspendido</span>
            )}
          </CTableDataCell>
              <CTableDataCell>{nacionalidad.find((nac) => nac.Cod_nacionalidad === persona.cod_nacionalidad)?.pais_nacionalidad.toUpperCase() || 'N/D'}</CTableDataCell>
              <CTableDataCell>{departamentos.find((depto) => depto.Cod_departamento === persona.cod_departamento)?.Nombre_departamento.toUpperCase() || 'N/D'}</CTableDataCell>
              <CTableDataCell>{municipio.find((municipio) => municipio.Cod_municipio === persona.cod_municipio)?.Nombre_municipio.toUpperCase() || 'N/D'}</CTableDataCell>
              <CTableDataCell>{tipoPersona.find((tipo) => tipo.Cod_tipo_persona === persona.cod_tipo_persona)?.Tipo.toUpperCase() || 'N/D'}</CTableDataCell>
              <CTableDataCell>{generos.find((genero) => genero.Cod_genero === persona.cod_genero)?.Tipo_genero.toUpperCase() || 'N/D'}</CTableDataCell>
              <CTableDataCell className="text-center">
                <div className="d-flex justify-content-center">
                  <CButton
                    color="warning"
                    onClick={() => openUpdateModal(persona)}
                    style={{ marginRight: '10px' }}
                  >
                    <CIcon icon={cilPen} />
                  </CButton>
                  <CButton color="danger" onClick={() => openDeleteModal(persona)}>
                    <CIcon icon={cilTrash} />
                  </CButton>
                  <CButton
                    color="secondary"
                    onClick={() => abrirEstructuraFamiliarModal(persona)}
                    style={{ marginLeft: '10px' }}
                  >
                    <CIcon icon={cilPeople} />{' '}
                  </CButton>
                  <CButton
                  color="primary"
                  onClick={() => abrirContactoModal(persona)}
                  style={{ marginLeft: '10px' }}
                >
                  <CIcon icon={cilContact} /> {/* Cambia esto por el ícono adecuado */}
                </CButton>
                </div>
              </CTableDataCell>
            </CTableRow>
          )
        })
      ) : (
        <CTableRow>
          <CTableDataCell colSpan="13" className="text-center"></CTableDataCell>
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
        onClose={closeAddModal}
        backdrop="static"
        size="xl" 
      >
        <CModalHeader closeButton>
          <CModalTitle>Agregar Persona</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <div className="row">
{/************************************************************COLUMNA-1*******************************************************************/}
{/***************************************************************DNI**********************************************************************/}
      <div className="col-md-6">
      <style jsx>{`
        .error-message { color: red;
          font-size: 12px;  /* Tamaño de texto más pequeño */
          margin-top: 4px;  /* Menor distancia entre el input y el mensaje de error */
          margin-bottom: 0;
          margin-left: 12px;  /* Para alinearlo con el texto del input */
        }
      `}</style>
    <div className="col-md-12"> {errorMessages.dni_persona && (
    <div className="error-message" style={{ marginBottom: '10px', color: 'red', fontSize: '0.850rem' }}> {errorMessages.dni_persona}
    </div>
  )}
        <CInputGroup className="mb-3">
          <CInputGroupText>DNI</CInputGroupText>
          <CFormInput
            type="text"
            placeholder="DNI de la persona"
            value={nuevaPersona.dni_persona}
            onChange={(e) => {
              const formattedDNI = formatDNI(e.target.value);
              setNuevaPersona({ ...nuevaPersona, dni_persona: formattedDNI });
              // Validaciones específicas para el DNI
              const erroresTemp = {};
              const dniSinGuiones = formattedDNI.replace(/-/g, '');
              if (!/^\d{13}$/.test(dniSinGuiones)) {
                erroresTemp.dni_persona = 'El DNI debe tener exactamente 13 dígitos.';
              } else {
                const primerCuatroDNI = parseInt(dniSinGuiones.substring(0, 4));
                if (primerCuatroDNI < 101 || primerCuatroDNI > 2000) {
                  erroresTemp.dni_persona = 'Los primeros cuatro dígitos deben estar entre 0101 y 2000.';
                }
                const añoNacimientoDNI = parseInt(dniSinGuiones.substring(4, 8));
                const yearNow = new Date().getFullYear();
                if (añoNacimientoDNI < yearNow - 100 || añoNacimientoDNI > yearNow) {
                  erroresTemp.dni_persona = `El año debe estar entre ${yearNow - 100} y ${yearNow}.`;
                }
              }
              setErrorMessages((prevErrors) => ({
                ...prevErrors,
                dni_persona: erroresTemp.dni_persona || '',
              }));
            }}
            onCopy={disableCopyPaste}
            onPaste={disableCopyPaste}
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
              value={nuevaPersona.Nombre}
              onChange={(e) => {
                const value = e.target.value.toUpperCase(); // Convertir a mayúsculas automáticamente
                // Bloquear secuencias de más de tres letras repetidas
                if (/(.)\1{2,}/.test(value)) {
                  setErrorMessages((prevErrors) => ({
                    ...prevErrors,
                    Nombre: 'El nombre no puede contener más de tres letras repetidas consecutivas.'
                  }));
                  return;
                }
                // Bloquear caracteres especiales, solo letras, acentos y espacios permitidos
                if (/[^A-Za-záéíóúÁÉÍÓÚñÑ\s]/.test(value)) {
                  setErrorMessages((prevErrors) => ({
                    ...prevErrors,
                    Nombre: 'El nombre solo puede contener letras, acentos y espacios.'
                  }));
                  return;
                }
                // Bloquear más de un espacio consecutivo
                if (/\s{2,}/.test(value)) {
                  setErrorMessages((prevErrors) => ({
                    ...prevErrors,
                    Nombre: 'El nombre no puede contener más de un espacio consecutivo.'
                  }));
                  return;
                }
                // Verifica si el campo está vacío
                const erroresTemp = { ...errorMessages };
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
              onCopy={disableCopyPaste}
              onPaste={disableCopyPaste}
              required
            />
          </CInputGroup>
          <style jsx>{`
            .error-message {
              color: red;
              font-size: 12px;  /* Tamaño de texto más pequeño */
              margin-top: 4px;  /* Menor distancia entre el input y el mensaje de error */
              margin-bottom: 0;
              margin-left: 12px;  /* Para alinearlo con el texto del input */
            }
          `}</style>
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
            value={nuevaPersona.Segundo_nombre}
            onChange={(e) => {
              const value = e.target.value.toUpperCase(); // Convertir a mayúsculas automáticamente

              // Bloquear secuencias de más de tres letras repetidas
              if (/(.)\1{2,}/.test(value)) {
                setErrorMessages((prevErrors) => ({
                  ...prevErrors,
                  Segundo_nombre: 'El segundo nombre no puede contener más de tres letras repetidas consecutivas.'
                }));
                return;
              }
              // Bloquear caracteres especiales, solo letras, acentos y espacios permitidos
              if (/[^A-Za-záéíóúÁÉÍÓÚñÑ\s]/.test(value)) {
                setErrorMessages((prevErrors) => ({
                  ...prevErrors,
                  Segundo_nombre: 'El segundo nombre solo puede contener letras, acentos y espacios.'
                }));
                return;
              }
              // Bloquear más de un espacio consecutivo
              if (/\s{2,}/.test(value)) {
                setErrorMessages((prevErrors) => ({
                  ...prevErrors,
                  Segundo_nombre: 'El segundo nombre no puede contener más de un espacio consecutivo.'
                }));
                return;
              }
              // Verifica si el campo está vacío
              const erroresTemp = { ...errorMessages };
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
            onCopy={disableCopyPaste}
            onPaste={disableCopyPaste}
          />
        </CInputGroup>
        <style jsx>{`
          .error-message {
            color: red;
            font-size: 12px;  /* Tamaño de texto más pequeño */
            margin-top: 4px;  /* Menor distancia entre el input y el mensaje de error */
            margin-bottom: 0;
            margin-left: 12px;  /* Para alinearlo con el texto del input */
          }
        `}</style>
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
            value={nuevaPersona.Primer_apellido}
            onChange={(e) => {
              const value = e.target.value.toUpperCase(); // Convertir a mayúsculas automáticamente

              // Bloquear secuencias de más de tres letras repetidas en toda la cadena
              if (/(.)\1{2,}/.test(value)) {
                setErrorMessages((prevErrors) => ({
                  ...prevErrors,
                  Primer_apellido: 'El primer apellido no puede contener más de tres letras repetidas consecutivas.'
                }));
                return;
              }

              // Bloquear caracteres especiales, solo letras, acentos y espacios permitidos
              if (/[^A-Za-záéíóúÁÉÍÓÚñÑ\s]/.test(value)) {
                setErrorMessages((prevErrors) => ({
                  ...prevErrors,
                  Primer_apellido: 'El primer apellido solo puede contener letras, acentos y espacios.'
                }));
                return;
              }
              // Bloquear más de un espacio consecutivo
              if (/\s{2,}/.test(value)) {
                setErrorMessages((prevErrors) => ({
                  ...prevErrors,
                  Primer_apellido: 'El primer apellido no puede contener más de un espacio consecutivo.'
                }));
                return;
              }
              // Verifica si el campo está vacío
              const erroresTemp = { ...errorMessages };
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
            onCopy={disableCopyPaste}
            onPaste={disableCopyPaste}
            required
          />
        </CInputGroup>
        <style jsx>{`
          .error-message {
            color: red;
            font-size: 12px;  /* Tamaño de texto más pequeño */
            margin-top: 4px;  /* Menor distancia entre el input y el mensaje de error */
            margin-bottom: 0;
            margin-left: 12px;  /* Para alinearlo con el texto del input */
          }
        `}</style>
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
            value={nuevaPersona.Segundo_apellido}
            onChange={(e) => {
              const value = e.target.value.toUpperCase(); // Convertir a mayúsculas automáticamente
              // Bloquear secuencias de más de tres letras repetidas en toda la cadena
              if (/(.)\1{2,}/.test(value)) {
                setErrorMessages((prevErrors) => ({
                  ...prevErrors,
                  Segundo_apellido: 'El segundo apellido no puede contener más de tres letras repetidas consecutivas.'
                }));
                return;
              }
              // Bloquear caracteres especiales, solo letras, acentos y espacios permitidos
              if (/[^A-Za-záéíóúÁÉÍÓÚñÑ\s]/.test(value)) {
                setErrorMessages((prevErrors) => ({
                  ...prevErrors,
                  Segundo_apellido: 'El segundo apellido solo puede contener letras, acentos y espacios.'
                }));
                return;
              }
              // Bloquear más de un espacio consecutivo
              if (/\s{2,}/.test(value)) {
                setErrorMessages((prevErrors) => ({
                  ...prevErrors,
                  Segundo_apellido: 'El segundo apellido no puede contener más de un espacio consecutivo.'
                }));
                return;
              }
              // Verifica si el campo está vacío
              const erroresTemp = { ...errorMessages };
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
            onCopy={disableCopyPaste}
            onPaste={disableCopyPaste}
            required
          />
        </CInputGroup>
        <style jsx>{`
          .error-message {
            color: red;
            font-size: 12px;  /* Tamaño de texto más pequeño */
            margin-top: 4px;  /* Menor distancia entre el input y el mensaje de error */
            margin-bottom: 0;
            margin-left: 12px;  /* Para alinearlo con el texto del input */
          }
        `}</style>
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
            value={nuevaPersona.fecha_nacimiento}
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
            required
          />
        </CInputGroup>
        <style jsx>{`
          .error-message {
            color: red;
            font-size: 12px;  /* Tamaño de texto más pequeño */
            margin-top: 4px;  /* Menor distancia entre el input y el mensaje de error */
            margin-bottom: 0;
            margin-left: 12px;  /* Para alinearlo con el texto del input */
          }
        `}</style>
      </div>
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
            value={nuevaPersona.direccion_persona}
            onChange={(e) => {
              const value = e.target.value.toUpperCase(); // Convertir a mayúsculas automáticamente
              // Bloquear secuencias de más de tres letras repetidas en toda la cadena
              if (/(.)\1{2,}/.test(value)) {
                setErrorMessages((prevErrors) => ({
                  ...prevErrors,
                  direccion_persona: 'La dirección no puede contener más de tres letras repetidas consecutivas.'
                }));
                return;
              }
              // Permitir solo caracteres necesarios para direcciones (letras, números, guiones, espacios, puntos, comas)
              if (/[^A-Za-záéíóúÁÉÍÓÚñÑ0-9\s\-#.,]/.test(value)) {
                setErrorMessages((prevErrors) => ({
                  ...prevErrors,
                  direccion_persona: 'La dirección solo puede contener letras, números, acentos, espacios y caracteres como guiones, puntos y comas.'
                }));
                return;
              }
              // Bloquear más de un espacio consecutivo
              if (/\s{2,}/.test(value)) {
                setErrorMessages((prevErrors) => ({
                  ...prevErrors,
                  direccion_persona: 'La dirección no puede contener más de un espacio consecutivo.'
                }));
                return;
              }
              // Verifica si el campo está vacío
              const erroresTemp = { ...errorMessages };
              if (!value.trim()) {
                erroresTemp.direccion_persona = 'La dirección no puede estar vacía.';
              } else {
                erroresTemp.direccion_persona = '';
              }
              setNuevaPersona({ ...nuevaPersona, direccion_persona: value });
              setErrorMessages(erroresTemp);
            }}
            onCopy={disableCopyPaste}
            onPaste={disableCopyPaste}
            required
          />
        </CInputGroup>
        <style jsx>{`
          .error-message {
            color: red;
            font-size: 12px;  /* Tamaño de texto más pequeño */
            margin-top: 4px;  /* Menor distancia entre el input y el mensaje de error */
            margin-bottom: 0;
            margin-left: 12px;  /* Para alinearlo con el texto del input */
          }
        `}</style>
      </div>
      </div>
{/***************************************************************ESTADO**********************************************************************/}
{/************************************************************COLUMNA 2************************************************************************/}
      <div className="col-md-6">
      <div className="col-md-12">
      <div className="col-md-12">
        {errorMessages.Estado_Persona && (
          <div className="error-message" style={{ marginBottom: '10px', color: 'red', fontSize: '0.850rem' }}>
            {errorMessages.Estado_Persona}
          </div>
        )}
        <CInputGroup className="mb-3">
          <CInputGroupText>Estado</CInputGroupText>
          <CFormSelect
            value={nuevaPersona.Estado_Persona || ''}
            onChange={(e) => {
              const value = e.target.value;

              // Validación en tiempo real
              let erroresTemp = { ...errorMessages };
              if (!value) {
                erroresTemp.Estado_Persona = 'Debe seleccionar un estado.';
              } else {
                erroresTemp.Estado_Persona = '';
              }

              setErrorMessages(erroresTemp);
              setNuevaPersona({ ...nuevaPersona, Estado_Persona: value });
            }}
            required
            style={{ color: '#6c757d' }}
          >
            <option value="">Seleccione un estado</option>
            <option value="A">ACTIVO</option>
            <option value="S">SUSPENDIDO</option>
          </CFormSelect>
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

{/********************************************************TIPO PERSONA**********************************************************************/}
<div>
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
              if (!value) {
                erroresTemp.cod_tipo_persona = 'Debe seleccionar un tipo de persona.';
              } else {
                erroresTemp.cod_tipo_persona = '';
              }

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
            style={{ color: '#6c757d' }}
          >
            <option value="">Seleccione un tipo persona</option>
            {tipoPersona &&
              tipoPersona.map((tipo) => (
                <option key={tipo.Cod_tipo_persona} value={tipo.Cod_tipo_persona}>
                  {tipo.Tipo.toUpperCase()}
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
                if (tipoSeleccionado && tipoSeleccionado.Tipo !== 'ESTUDIANTE') {
                  setNuevaPersona({ ...nuevaPersona, principal: e.target.checked });
                }
              }}
              style={{ transform: 'scale(1.3)', marginLeft: '10px' }}
              disabled={tipoPersona.find(tipo => tipo.Cod_tipo_persona === parseInt(nuevaPersona.cod_tipo_persona, 10))?.Tipo === 'ESTUDIANTE'}
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
              if (!value) {
                erroresTemp.cod_genero = 'Debe seleccionar un género.';
              } else {
                erroresTemp.cod_genero = '';
              }

              setErrorMessages(erroresTemp);
              setNuevaPersona({ ...nuevaPersona, cod_genero: value });
            }}
            required
            style={{ color: '#6c757d' }}
          >
            <option value="">Seleccione un género</option>
            {generos &&
              generos.map((genero) => (
                <option key={genero.Cod_genero} value={genero.Cod_genero}>
                  {genero.Tipo_genero.toUpperCase()}
                </option>
              ))}
          </CFormSelect>
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
                  value={buscadorNacionalidad}
                  onKeyPress={handleKeyPress}
                  onChange={handleBuscarNacionalidad}
                  onCopy={disableCopyPaste}
                  onPaste={disableCopyPaste}
                  placeholder="Buscar por sigla de pais o letra"
                />
                <CButton type="button">
                  <CIcon icon={cilSearch} />
                </CButton>
              </CInputGroup>
              {isDropdownOpenNacionalidad && nacionalidadesFiltradas.length > 0 && (
                <div className="dropdown-container" style={{ position: 'relative' }}>
                  <div className="dropdown-menu show" style={{ position: 'absolute', zIndex: 999, top: '100%', left: '0', width: '100%', maxHeight: '200px', overflowY: 'auto' }}>
                    {nacionalidadesFiltradas.map((nacionalidad) => (
                      <div
                        key={nacionalidad.Cod_nacionalidad}
                        className="dropdown-item"
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleSeleccionarNacionalidad(nacionalidad)}
                      >
                        {nacionalidad.Id_nacionalidad.toUpperCase()} - {nacionalidad.pais_nacionalidad.toUpperCase()}
                      </div>
                    ))}
                  </div>
                          <style jsx>{`
                .error-message {
                  color: red;
                  font-size: 0.850rem; /* Tamaño de texto más pequeño */
                  margin-top: 4px; /* Menor distancia entre el input y el mensaje de error */
                  margin-bottom: 0;
                  margin-left: 12px; /* Para alinearlo con el texto del input */
                }
              `}</style>
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

              // Validación en tiempo real
              let erroresTemp = { ...errorMessages };
              if (!value) {
                erroresTemp.cod_departamento = 'Debe seleccionar un departamento.';
              } else {
                erroresTemp.cod_departamento = '';
              }

              setErrorMessages(erroresTemp);
              setNuevaPersona({ ...nuevaPersona, cod_departamento: value });
            }}
            required
            style={{ color: '#6c757d' }}
          >
            <option value="">Seleccione un departamento</option>
            {departamentos &&
              departamentos.map((depto) => (
                <option key={depto.Cod_departamento} value={depto.Cod_departamento}>
                  {depto.Nombre_departamento.toUpperCase()}
                </option>
              ))}
          </CFormSelect>
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
{/*****************************************************************MUNICIPIO*********************************************************************/}
        <div className="mb-3">
        {errorMessages.municipio && (
        <div className="error-message" style={{ marginBottom: '10px', color: 'red', fontSize: '0.850rem' }}>
          {errorMessages.municipio}
        </div>)}
          <CInputGroup className="mb-3">
            <CInputGroupText>
              Municipio
            </CInputGroupText>
            <CFormInput
              type="text"
              value={buscadorMunicipio}
              onChange={handleBuscarMunicipio}
              onKeyPress={handleKeyPress}
              onCopy={disableCopyPaste}
              onPaste={disableCopyPaste}
              placeholder="Buscar por nombre del municipio"
            />
            <CButton type="button">
              <CIcon icon={cilSearch} />
            </CButton>
          </CInputGroup>
          {isDropdownOpenMunicipio && municipiosFiltrados.length > 0 && (
            <div className="dropdown-container" style={{ position: 'relative' }}>
              <div className="dropdown-menu show" style={{ position: 'absolute', zIndex: 999, top: '100%', left: '0', width: '100%', maxHeight: '200px', overflowY: 'auto' }}>
                {municipiosFiltrados.map((municipio) => (
                  <div
                    key={municipio.Cod_municipio}
                    className="dropdown-item"
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleSeleccionarMunicipio(municipio)}
                  >
                    {municipio.Nombre_municipio.toUpperCase()} - {municipio.Nombre_departamento.toUpperCase()}
                  </div>
                ))}
              </div>
            </div>
          )}
        <style jsx>{`
          .error-message {
          color: red;
          font-size: 0.850rem; /* Tamaño de texto más pequeño */
          margin-top: 4px; /* Menor distancia entre el input y el mensaje de error */
          margin-bottom: 0;
          margin-left: 12px; /* Para alinearlo con el texto del input */
        }
      `}</style>
        </div>
{/**********************************************************************************************************************************************/}
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

{/*////////////////////////////////////////////MODAL PARA ACTUALIZAR UNA PERSONA****************************************************/}
          <CModal visible={modalUpdateVisible} onClose={closeUpdateModal}
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
{/********************************************************DNI****************************************************************************/}
          {errorMessages.dni_persona && (
            <div className="error-message" style={{ marginBottom: '10px', color: 'red', fontSize: '0.850rem' }}>
              {errorMessages.dni_persona}
            </div>)}
            <CInputGroup className="mb-3">
              <CInputGroupText>DNI</CInputGroupText>
              <CFormInput
                type="text"
                placeholder="DNI de la persona"
                value={personaToUpdate.dni_persona}
                onChange={(e) => {
                  const formattedDNI = formatDNI(e.target.value);
                  setPersonaToUpdate({ ...personaToUpdate, dni_persona: formattedDNI });
                  // Validaciones específicas para el DNI
                  const erroresTemp = {};
                  const dniSinGuiones = formattedDNI.replace(/-/g, '');
                  if (!/^\d{13}$/.test(dniSinGuiones)) {
                    erroresTemp.dni_persona = 'El DNI debe tener exactamente 13 dígitos.';
                  } else {
                    const primerCuatroDNI = parseInt(dniSinGuiones.substring(0, 4));
                    if (primerCuatroDNI < 101 || primerCuatroDNI > 2000) {
                      erroresTemp.dni_persona = 'Los primeros cuatro dígitos deben estar entre 0101 y 2000.';
                    }
                    const añoNacimientoDNI = parseInt(dniSinGuiones.substring(4, 8));
                    const yearNow = new Date().getFullYear();
                    if (añoNacimientoDNI < yearNow - 100 || añoNacimientoDNI > yearNow - 4) {
                      erroresTemp.dni_persona = `El año debe estar entre ${yearNow - 100} y ${yearNow}.`;
                    }
                  }
                  setErrorMessages((prevErrors) => ({
                    ...prevErrors,
                    dni_persona: erroresTemp.dni_persona || '',
                  }));
                }}
                onCopy={disableCopyPaste}
                onPaste={disableCopyPaste}
                required
              />
            </CInputGroup>
            <style jsx>{`
              .error-message {
                color: red;
                font-size: 12px;  /* Tamaño de texto más pequeño */
                margin-top: 4px;  /* Menor distancia entre el input y el mensaje de error */
                margin-bottom: 0;
                margin-left: 12px;  /* Para alinearlo con el texto del input */
              }
            `}</style>
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
                  value={personaToUpdate.Nombre}
                  onChange={(e) => {
                    const value = e.target.value.toUpperCase(); // Convertir a mayúsculas automáticamente
                    // Bloquear secuencias de más de tres letras repetidas
                    if (/(.)\1{2,}/.test(value)) {
                      setErrorMessages((prevErrors) => ({
                        ...prevErrors,
                        Nombre: 'El nombre no puede contener más de tres letras repetidas consecutivas.'
                      }));
                      return;
                    }
                    // Bloquear caracteres especiales, solo letras, acentos y espacios permitidos
                    if (/[^A-Za-záéíóúÁÉÍÓÚñÑ\s]/.test(value)) {
                      setErrorMessages((prevErrors) => ({
                        ...prevErrors,
                        Nombre: 'El nombre solo puede contener letras, acentos y espacios.'
                      }));
                      return;
                    }
                    // Bloquear más de un espacio consecutivo
                    if (/\s{2,}/.test(value)) {
                      setErrorMessages((prevErrors) => ({
                        ...prevErrors,
                        Nombre: 'El nombre no puede contener más de un espacio consecutivo.'
                      }));
                      return;
                    }
                    // Verifica si el campo está vacío
                    const erroresTemp = { ...errorMessages };
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
                  onCopy={disableCopyPaste}
                  onPaste={disableCopyPaste}
                  required
                />
              </CInputGroup>
              <style jsx>{`
                .error-message {
                  color: red;
                  font-size: 12px;  /* Tamaño de texto más pequeño */
                  margin-top: 4px;  /* Menor distancia entre el input y el mensaje de error */
                  margin-bottom: 0;
                  margin-left: 12px;  /* Para alinearlo con el texto del input */
                }
              `}</style>
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
                value={personaToUpdate.Segundo_nombre}
                onChange={(e) => {
                  const value = e.target.value.toUpperCase(); // Convertir a mayúsculas automáticamente
                  // Bloquear secuencias de más de tres letras repetidas
                  if (/(.)\1{2,}/.test(value)) {
                    setErrorMessages((prevErrors) => ({
                      ...prevErrors,
                      Segundo_nombre: 'El segundo nombre no puede contener más de tres letras repetidas consecutivas.'
                    }));
                    return;
                  }
                  // Bloquear caracteres especiales, solo letras, acentos y espacios permitidos
                  if (/[^A-Za-záéíóúÁÉÍÓÚñÑ\s]/.test(value)) {
                    setErrorMessages((prevErrors) => ({
                      ...prevErrors,
                      Segundo_nombre: 'El segundo nombre solo puede contener letras, acentos y espacios.'
                    }));
                    return;
                  }
                  // Bloquear más de un espacio consecutivo
                  if (/\s{2,}/.test(value)) {
                    setErrorMessages((prevErrors) => ({
                      ...prevErrors,
                      Segundo_nombre: 'El segundo nombre no puede contener más de un espacio consecutivo.'
                    }));
                    return;
                  }
                  // Verifica si el campo está vacío
                  const erroresTemp = { ...errorMessages };
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
                onCopy={disableCopyPaste}
                onPaste={disableCopyPaste}
              />
            </CInputGroup>
            <style jsx>{`
              .error-message {
                color: red;
                font-size: 12px;  /* Tamaño de texto más pequeño */
                margin-top: 4px;  /* Menor distancia entre el input y el mensaje de error */
                margin-bottom: 0;
                margin-left: 12px;  /* Para alinearlo con el texto del input */
              }
            `}</style>
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
              value={personaToUpdate.Primer_apellido}
              onChange={(e) => {
                const value = e.target.value.toUpperCase(); // Convertir a mayúsculas automáticamente

                // Bloquear secuencias de más de tres letras repetidas
                if (/(.)\1{2,}/.test(value)) {
                  setErrorMessages((prevErrors) => ({
                    ...prevErrors,
                    Primer_apellido: 'El primer apellido no puede contener más de tres letras repetidas consecutivas.'
                  }));
                  return;
                }
                // Bloquear caracteres especiales, solo letras, acentos y espacios permitidos
                if (/[^A-Za-záéíóúÁÉÍÓÚñÑ\s]/.test(value)) {
                  setErrorMessages((prevErrors) => ({
                    ...prevErrors,
                    Primer_apellido: 'El primer apellido solo puede contener letras, acentos y espacios.'
                  }));
                  return;
                }
                // Bloquear más de un espacio consecutivo
                if (/\s{2,}/.test(value)) {
                  setErrorMessages((prevErrors) => ({
                    ...prevErrors,
                    Primer_apellido: 'El primer apellido no puede contener más de un espacio consecutivo.'
                  }));
                  return;
                }
                // Verifica si el campo está vacío
                const erroresTemp = { ...errorMessages };
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
              onCopy={disableCopyPaste}
              onPaste={disableCopyPaste}
              required
            />
          </CInputGroup>
          <style jsx>{`
            .error-message {
              color: red;
              font-size: 12px;  /* Tamaño de texto más pequeño */
              margin-top: 4px;  /* Menor distancia entre el input y el mensaje de error */
              margin-bottom: 0;
              margin-left: 12px;  /* Para alinearlo con el texto del input */
            }
          `}</style>
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
                  value={personaToUpdate.Segundo_apellido}
                  onChange={(e) => {
                    const value = e.target.value.toUpperCase(); // Convertir a mayúsculas automáticamente
                    // Bloquear secuencias de más de tres letras repetidas
                    if (/(.)\1{2,}/.test(value)) {
                      setErrorMessages((prevErrors) => ({
                        ...prevErrors,
                        Segundo_apellido: 'El segundo apellido no puede contener más de tres letras repetidas consecutivas.'
                      }));
                      return;
                    }
                    // Bloquear caracteres especiales, solo letras, acentos y espacios permitidos
                    if (/[^A-Za-záéíóúÁÉÍÓÚñÑ\s]/.test(value)) {
                      setErrorMessages((prevErrors) => ({
                        ...prevErrors,
                        Segundo_apellido: 'El segundo apellido solo puede contener letras, acentos y espacios.'
                      }));
                      return;
                    }
                    // Bloquear más de un espacio consecutivo
                    if (/\s{2,}/.test(value)) {
                      setErrorMessages((prevErrors) => ({
                        ...prevErrors,
                        Segundo_apellido: 'El segundo apellido no puede contener más de un espacio consecutivo.'
                      }));
                      return;
                    }
                    // Verifica si el campo está vacío
                    const erroresTemp = { ...errorMessages };
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
                  onCopy={disableCopyPaste}
                  onPaste={disableCopyPaste}
                />
              </CInputGroup>
              <style jsx>{`
                .error-message {
                  color: red;
                  font-size: 12px;  /* Tamaño de texto más pequeño */
                  margin-top: 4px;  /* Menor distancia entre el input y el mensaje de error */
                  margin-bottom: 0;
                  margin-left: 12px;  /* Para alinearlo con el texto del input */
                }
              `}</style>
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
                  value={personaToUpdate.fecha_nacimiento}
                  onChange={(e) => {
                    const value = e.target.value;
                    setPersonaToUpdate((prevState) => ({
                      ...prevState,
                      fecha_nacimiento: value,
                    }));
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
                  required
                />
              </CInputGroup>
              <style jsx>{`
                .error-message {
                  color: red;
                  font-size: 12px;  /* Tamaño de texto más pequeño */
                  margin-top: 4px;  /* Menor distancia entre el input y el mensaje de error */
                  margin-bottom: 0;
                  margin-left: 12px;  /* Para alinearlo con el texto del input */
                }
              `}</style>
            </div>
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
                    value={personaToUpdate.direccion_persona}
                    onChange={(e) => {
                      const value = e.target.value.toUpperCase(); // Convertir a mayúsculas automáticamente
                      // Bloquear secuencias de más de tres letras repetidas en toda la cadena
                      if (/(.)\1{2,}/.test(value)) {
                        setErrorMessages((prevErrors) => ({
                          ...prevErrors,
                          direccion_persona: 'La dirección no puede contener más de tres letras repetidas consecutivas.'
                        }));
                        return;
                      }
                      // Permitir solo caracteres necesarios para direcciones (letras, números, guiones, espacios, puntos, comas)
                      if (/[^A-Za-záéíóúÁÉÍÓÚñÑ0-9\s\-#.,]/.test(value)) {
                        setErrorMessages((prevErrors) => ({
                          ...prevErrors,
                          direccion_persona: 'La dirección solo puede contener letras, números, acentos, espacios y caracteres como guiones, puntos y comas.'
                        }));
                        return;
                      }
                      // Bloquear más de un espacio consecutivo
                      if (/\s{2,}/.test(value)) {
                        setErrorMessages((prevErrors) => ({
                          ...prevErrors,
                          direccion_persona: 'La dirección no puede contener más de un espacio consecutivo.'
                        }));
                        return;
                      }
                      // Verifica si el campo está vacío
                      const erroresTemp = { ...errorMessages };
                      if (!value.trim()) {
                        erroresTemp.direccion_persona = 'La dirección no puede estar vacía.';
                      } else {
                        erroresTemp.direccion_persona = '';
                      }
                      setPersonaToUpdate({ ...personaToUpdate, direccion_persona: value });
                      setErrorMessages(erroresTemp);
                    }}
                    onCopy={disableCopyPaste}
                    onPaste={disableCopyPaste}
                    required
                  />
                </CInputGroup>
                {/* Estilos dentro del componente */}
                <style jsx>{`
                  .error-message {
                    color: red;
                    font-size: 12px;  /* Tamaño de texto más pequeño */
                    margin-top: 4px;  /* Menor distancia entre el input y el mensaje de error */
                    margin-bottom: 0;
                    margin-left: 12px;  /* Para alinearlo con el texto del input */
                  }
                `}</style>
              </div>
{/*****************************************************COLUMNA DERECHA***************************************************************/}
              </CCol>
                <CCol md={6}>

{/************************************************************ESTADO**********************************************************************/}
<div className="col-md-12">
      <div className="col-md-12">
        {errorMessages.Estado_Persona && (
          <div className="error-message" style={{ marginBottom: '10px', color: 'red', fontSize: '0.850rem' }}>
            {errorMessages.Estado_Persona}
          </div>
        )}
        <CInputGroup className="mb-3">
          <CInputGroupText>Estado</CInputGroupText>
          <CFormSelect
            value={personaToUpdate.Estado_Persona || ''}
            onChange={(e) => {
              const value = e.target.value;

              // Validación en tiempo real
              let erroresTemp = { ...errorMessages };
              if (!value) {
                erroresTemp.Estado_Persona = 'Debe seleccionar un estado.';
              } else {
                erroresTemp.Estado_Persona = '';
              }

              setErrorMessages(erroresTemp);
              setPersonaToUpdate({ ...personaToUpdate, Estado_Persona: value });
            }}
            required
            style={{ color: '#6c757d' }}
          >
            <option value="">Seleccione un estado</option>
            <option value="A">ACTIVO</option>
            <option value="S">SUSPENDIDO</option>
          </CFormSelect>
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

              // Validación en tiempo real
              let erroresTemp = { ...errorMessages };
              if (!value) {
                erroresTemp.cod_tipo_persona = 'Debe seleccionar un tipo de persona.';
              } else {
                erroresTemp.cod_tipo_persona = '';
              }

              // Desactivar el checkbox "Principal" si el tipo de persona es "ESTUDIANTE"
              const tipoSeleccionado = tipoPersona.find(tipo => tipo.Cod_tipo_persona === parseInt(value, 10));
              if (tipoSeleccionado && tipoSeleccionado.Tipo === 'ESTUDIANTE') {
                setPersonaToUpdate({ ...personaToUpdate, cod_tipo_persona: value, principal: false });
              } else {
                setPersonaToUpdate({ ...personaToUpdate, cod_tipo_persona: value });
              }

              setErrorMessages(erroresTemp);
            }}
            required
            style={{ color: '#6c757d' }}
          >
            <option value="">Seleccione un tipo persona</option>
            {tipoPersona &&
              tipoPersona.map((tipo) => (
                <option key={tipo.Cod_tipo_persona} value={tipo.Cod_tipo_persona}>
                  {tipo.Tipo.toUpperCase()}
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
                if (tipoSeleccionado && tipoSeleccionado.Tipo !== 'ESTUDIANTE') {
                  setPersonaToUpdate({ ...personaToUpdate, principal: e.target.checked });
                }
              }}
              style={{ transform: 'scale(1.3)', marginLeft: '10px' }}
              disabled={tipoPersona.find(tipo => tipo.Cod_tipo_persona === parseInt(personaToUpdate.cod_tipo_persona, 10))?.Tipo === 'ESTUDIANTE'}
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

              // Validación en tiempo real
              let erroresTemp = { ...errorMessages };
              if (!value) {
                erroresTemp.cod_genero = 'Debe seleccionar un género.';
              } else {
                erroresTemp.cod_genero = '';
              }

              setErrorMessages(erroresTemp);
              setPersonaToUpdate({ ...personaToUpdate, cod_genero: parseInt(value, 10) });
            }}
            required
            style={{ color: '#6c757d' }}
          >
            <option value="">Seleccione un género</option>
            {generos &&
              generos.map((genero) => (
                <option key={genero.Cod_genero} value={genero.Cod_genero}>
                  {genero.Tipo_genero.toUpperCase()}
                </option>
              ))}
          </CFormSelect>
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
      value={buscadorNacionalidad}
      onChange={handleBuscarNacionalidad}
      onKeyPress={handleKeyPress}
      onCopy={disableCopyPaste}
      onPaste={disableCopyPaste}
      placeholder="Buscar por sigla de país o letra"
    />
    <CButton type="button">
      <CIcon icon={cilSearch} />
    </CButton>
  </CInputGroup>
  {isDropdownOpenNacionalidad && nacionalidadesFiltradas.length > 0 && (
    <div className="dropdown-container" style={{ position: 'relative' }}>
      <div className="dropdown-menu show" style={{ position: 'absolute', zIndex: 999, top: '100%', left: '0', width: '100%', maxHeight: '200px', overflowY: 'auto' }}>
        {nacionalidadesFiltradas.map((nacionalidad) => (
          <div
            key={nacionalidad.Cod_nacionalidad}
            className="dropdown-item"
            style={{ cursor: 'pointer' }}
            onClick={() => {
              handleSeleccionarNacionalidad(nacionalidad);
              setPersonaToUpdate({
                ...personaToUpdate,
                Cod_nacionalidad: nacionalidad.Cod_nacionalidad,
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
  <style jsx>{`
    .error-message {
      color: red;
      font-size: 0.850rem; /* Tamaño de texto más pequeño */
      margin-top: 4px; /* Menor distancia entre el input y el mensaje de error */
      margin-bottom: 0;
      margin-left: 12px; /* Para alinearlo con el texto del input */
    }
  `}</style>
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
            const value = e.target.value;

            // Validación en tiempo real
            let erroresTemp = { ...errorMessages };
            if (!value) {
              erroresTemp.cod_departamento = 'Debe seleccionar un departamento.';
            } else {
              erroresTemp.cod_departamento = '';
            }

            setErrorMessages(erroresTemp);
            setPersonaToUpdate({ ...personaToUpdate, cod_departamento: value });
          }}
          required
          style={{ color: '#6c757d' }}
        >
          <option value="">Seleccione un departamento</option>
          {departamentos &&
            departamentos.map((depto) => (
              <option key={depto.Cod_departamento} value={depto.Cod_departamento}>
                {depto.Nombre_departamento.toUpperCase()}
              </option>
            ))}
        </CFormSelect>
      </CInputGroup>
      <style jsx>{`
        .error-message {
          color: red;
          font-size: 0.850rem; /* Tamaño de texto más pequeño */
          margin-top: 4px; /* Menor distancia entre el input y el mensaje de error */
          margin-bottom: 0;
          margin-left: 12px; /* Para alinearlo con el texto del input */
        }
      `}</style>
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
                value={buscadorMunicipio}
                onChange={handleBuscarMunicipio}
                onKeyPress={handleKeyPress}
                onCopy={disableCopyPaste}
                onPaste={disableCopyPaste}
                placeholder="Buscar por nombre del municipio"
              />
              <CButton type="button">
                <CIcon icon={cilSearch} />
              </CButton>
            </CInputGroup>
            {isDropdownOpenMunicipio && municipiosFiltrados.length > 0 && (
              <div className="dropdown-container" style={{ position: 'relative' }}>
                <div className="dropdown-menu show" style={{ position: 'absolute', zIndex: 999, top: '100%', left: '0', width: '100%', maxHeight: '200px', overflowY: 'auto' }}>
                  {municipiosFiltrados.map((municipio) => (
                    <div
                      key={municipio.cod_municipio}
                      className="dropdown-item"
                      style={{ cursor: 'pointer' }}
                      onClick={() => {
                        handleSeleccionarMunicipio(municipio);
                        setPersonaToUpdate({
                          ...personaToUpdate,
                          cod_municipio: municipio.Cod_municipio,
                          Nombre_municipio: municipio.Nombre_municipio,
                        });
                      }}
                    >
                      {municipio.Nombre_municipio.toUpperCase()} - {municipio.Nombre_departamento.toUpperCase()}
                    </div>
                  ))}
                </div>
              </div>
            )}
            <style jsx>{`
              .error-message {
                color: red;
                font-size: 0.850rem; /* Tamaño de texto más pequeño */
                margin-top: 4px; /* Menor distancia entre el input y el mensaje de error */
                margin-bottom: 0;
                margin-left: 12px; /* Para alinearlo con el texto del input */
              }
            `}</style>
          </div>

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




