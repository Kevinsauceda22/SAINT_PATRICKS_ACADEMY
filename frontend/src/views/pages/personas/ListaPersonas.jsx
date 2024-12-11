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
  const [personaToUpdate, setPersonaToUpdate] = useState({})
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

  const handleFechaNacimientoChange = (e) => {
    const value = e.target.value;
    setNuevaPersona((prevState) => ({ ...prevState, fecha_nacimiento: value }));
    setFechaNacimiento(value); // Actualizamos el estado de fechaNacimiento

    // Validación de la fecha de nacimiento
    let erroresTemp = { ...errorMessages };
    if (!value || value === '') {
      erroresTemp.fecha_nacimiento = 'Debe ingresar una fecha de nacimiento válida.';
    } else {
      const fechaNacimiento = new Date(value);
      const añoNacimiento = fechaNacimiento.getFullYear();
      
      if (añoNacimiento < minYear || añoNacimiento > maxYear) {
        erroresTemp.fecha_nacimiento = `La fecha de nacimiento debe estar entre los años ${minYear} y ${maxYear}.`;
      } else {
        erroresTemp.fecha_nacimiento = '';
      }
    }
    setErrorMessages(erroresTemp);
  };

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


  {/* ***********************************************************FUNCIONES DE VALIDACION********************************************* */}
  
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

  // Ahora realizamos las validaciones adicionales
  switch (nombreCampo) {
    case 'Nombre':
    case 'Segundo_nombre':
    case 'Primer_apellido':
    case 'Segundo_apellido':
      // Validar que solo contiene letras y espacios
      if (valorFiltrado && !soloLetrasYEspaciosRegex.test(valorFiltrado)) {
        errorMessage = `${nombreCampo} solo puede contener letras y espacios.`;
      } else if (valorFiltrado && tieneLetrasRepetidas(valorFiltrado)) {
        errorMessage = `${nombreCampo} no puede contener la misma letra más de 3 veces consecutivas.`;
      } else if (valorFiltrado && tieneEspaciosMultiples(valorFiltrado)) {
        errorMessage = `${nombreCampo} no puede tener más de un espacio consecutivo.`;
      }
      break;

    case 'direccion_persona':
      // Validar que la dirección no tenga caracteres no permitidos ni espacios consecutivos
      if (valorFiltrado && !soloLetrasYNumerosDireccionRegex.test(valorFiltrado)) {
        errorMessage = 'La dirección solo puede contener letras, números, espacios, puntos, comas, guiones y el símbolo #.';
      } else if (valorFiltrado && tieneEspaciosMultiples(valorFiltrado)) {
        errorMessage = 'La dirección no puede tener más de un espacio consecutivo.';
      }
      break;

    case 'dni_persona':
      if (valorFiltrado) {
        errorMessage = validarDNI(valorFiltrado);
      }
      break;

    case 'fecha_nacimiento':
      if (valorFiltrado) {
        const añoNacimientoFecha = new Date(valorFiltrado).getFullYear();
        if (añoNacimientoFecha < 1930 || añoNacimientoFecha > 2020) {
          errorMessage = 'La fecha de nacimiento debe estar entre 1930 y 2020.';
        }
      }
      break;

    default:
      break;
  }

  // Actualizamos el estado de los errores con el mensaje correspondiente
  setErrorMessages((prevErrors) => ({
    ...prevErrors,
    [nombreCampo]: errorMessage,
  }));

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
  const fechaObj = new Date(fecha_nacimiento);
  return fechaObj.toISOString().split('T')[0];
};

// Reset de formularios
const resetNuevaPersona = () => {
  setNuevaPersona({
    dni_persona: '', Nombre: '', Segundo_nombre: '', Primer_apellido: '', Segundo_apellido: '', direccion_persona: '', fecha_nacimiento: '',
    Estado_Persona: '', cod_tipo_persona: '', principal: '', cod_nacionalidad: '', cod_departamento: '', cod_municipio: '', cod_genero: '', 
  });
};

const resetPersonaToUpdate = () => {
  setPersonaToUpdate({ cod_persona: '', dni_persona: '', Nombre: '', Segundo_nombre: '', Primer_apellido: '', Segundo_apellido: '', 
    direccion_persona: '', fecha_nacimiento: '', Estado_Persona: '', cod_tipo_persona: '', principal: '', cod_nacionalidad: '', cod_departamento: '', cod_municipio: '', cod_genero: '', 
  });
};

// Manejo del modal
const handleCloseModal = (setModalVisible, resetData, formData) => {
  if (!formData) {
    console.error("formData no está definido.");
    setModalVisible(false);
    return;
  }

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
        setModalVisible(false);
        resetData();
      }
    });
  } else {
    setModalVisible(false);
  }
};


const openUpdateModal = (persona) => {


  console.log('Cod_nacionalidad de persona:', persona.cod_nacionalidad);

  
  // Asegúrate de que la fecha esté en el formato yyyy-MM-dd para el campo de fecha
  const fechaFormateada = persona.fecha_nacimiento ? formatearFecha(persona.fecha_nacimiento) : '';
  const nacionalidadSeleccionada = nacionalidad.find(nac => nac.Cod_nacionalidad === persona.cod_nacionalidad);
  console.log('Nacionalidad seleccionada:', nacionalidadSeleccionada);
  setPersonaToUpdate({
      ...persona,
      fecha_nacimiento: fechaFormateada,
      buscadorNacionalidad: nacionalidadSeleccionada ? `${nacionalidadSeleccionada.Id_nacionalidad.toUpperCase()} - ${nacionalidadSeleccionada.pais_nacionalidad.toUpperCase()}` : '',
  
  
    });
    
  setModalUpdateVisible(true);
};

useEffect(() => {
  console.log('buscadorNacionalidad:', buscadorNacionalidad);
}, [buscadorNacionalidad]);


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

const closeDetailModal = () => {
  setShowDetailModal(false);
  setSelectedPersona(null);
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
    console.log('Fecha recibida:', personas[0]?.fecha_nacimiento);
    setPersonaToUpdate({
      ...personaToUpdate,
      fecha_nacimiento: formatearFecha(personas[0]?.fecha_nacimiento),
    });
    setFechaNacimiento(formatearFecha(personas[0]?.fecha_nacimiento));
  }
}, [personas]);


{/* --------------------------------------------------------------------------------------------------------------------------------------------------------- */}



const handleBuscarNacionalidad = (e) => {
  const filtro = e.target.value.toUpperCase(); // Convertir el texto a minúsculas para búsqueda insensible a mayúsculas
  setBuscadorNacionalidad(filtro); // Actualizar el valor del input

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
  setBuscadorNacionalidad(`${nacionalidad.Id_nacionalidad} - ${nacionalidad.pais_nacionalidad}`); // Mostrar en el input
  setSelectedNacionalidad(nacionalidad.pais_nacionalidad); // Guardar solo pais_nacionalidad para la inserción
  setIsDropdownOpenNacionalidad(false);
  setNuevaPersona(prev => ({ ...prev, cod_nacionalidad: nacionalidad.Cod_nacionalidad }));
  console.log('Nacionalidad seleccionada:', nacionalidadSeleccionada); // Esto es solo para ver qué se seleccionó

};
{/* ------------------------------------------------------------------------------------------------------------------------------------------------- */}
const handleBuscarMunicipio = (e) => {
  const filtro = e.target.value.toLowerCase();
  setBuscadorMunicipio(filtro);

  if (filtro.trim() === '') {
    setMunicipiosFiltrados([]);
    setIsDropdownOpenMunicipio(false);
    return;
  }

  const filtrados = municipio.filter((municipio) =>
    (municipio.nombre_municipio && municipio.nombre_municipio.toLowerCase().includes(filtro)) ||
    (municipio.nombre_departamento && municipio.nombre_departamento.toLowerCase().includes(filtro))
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





{/*********************************TABLAS RELACIONADAS***********************************************************************************/}

    // Fetch personas from API
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

  if (isSubmitting) return; 
  setIsSubmitting(true);
  
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
    if (isSubmitting) return;
    setIsSubmitting(true);
  
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

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(personas)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Personas')
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    saveAs(blob, 'reporte_personas.xlsx')
  }

  const exportToPDF = () => {
    const doc = new jsPDF()
    doc.text('Reporte de Personas', 20, 10)
    doc.autoTable({
      head: [
        [
          '#',
          'DNI',
          'Nombre',
          'Apellido',
          'Nacionalidad',
          'Dirección',
          'Fecha de Nacimiento',
          'Estado',
          'Tipo de Persona',
          'Departamento',
          'Municipio',
          'Género',
          'Principal'
        ],
      ],
      body: currentRecords.map((persona, index) => [
        index + 1,
        persona.dni_persona,
        persona.Nombre,
        persona.Primer_apellido,
        persona.direccion_persona,
        persona.fecha_nacimiento,
        persona.Estado_Persona,
        persona.principal,
        persona.cod_tipo_persona,
        persona.cod_nacionalidad,
        persona.cod_departamento,
        persona.cod_municipio,
        persona.cod_genero,

      ]),
    })
    doc.save('reporte_personas.pdf')
  }



  const handleSearch = (event) => {
    setSearchTerm(event.target.value)
    setCurrentPage(1)
  }

  const filteredPersonas = personas.filter(
    (persona) =>
      persona.Nombre.toUpperCase().includes(searchTerm.toUpperCase()) ||
      persona.Segundo_nombre.toUpperCase().includes(searchTerm.toUpperCase()) ||
      persona.Primer_apellido.toUpperCase().includes(searchTerm.toUpperCase()) ||
      persona.Segundo_apellido.toUpperCase().includes(searchTerm.toUpperCase()) ||
      persona.dni_persona.toUpperCase(searchTerm) ||
      persona.Nacionalidad.toUpperCase().includes(searchTerm.toUpperCase()) ||
      persona.direccion_persona.toUpperCase().includes(searchTerm.toUpperCase()) ||
      persona.fecha_nacimiento.includes(searchTerm) ||
      persona.Estado_Persona.toUpperCase().includes(searchTerm.toUpperCase()),
  )

  const indexOfLastRecord = currentPage * recordsPerPage
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage
  const currentRecords = filteredPersonas.slice(indexOfFirstRecord, indexOfLastRecord)

  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= Math.ceil(filteredPersonas.length / recordsPerPage)) {
      setCurrentPage(pageNumber)
    }
  }
{/* ****************************************************************************************************************************************** */}
const ReportePersonas = () => {
  const doc = new jsPDF('l', 'mm', 'letter'); // Formato horizontal
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const img = new Image();
  img.src = logo;

  img.onload = () => {
      // Insertar el logo
      doc.addImage(img, 'PNG', 10, 10, 20, 20); // Reducir el logo y ajustarlo al espacio

      // Cabecera del reporte
      doc.setTextColor(22, 160, 133);
      doc.setFontSize(14); // Tamaño de fuente reducido
      doc.text("SAINT PATRICK'S ACADEMY", 35, 15, { align: 'left' });
      doc.setFontSize(10);
      doc.text('Reporte de Personas', 35, 22, { align: 'left' });

      // Detalles de la institución
      doc.setFontSize(8);
      doc.setTextColor(68, 68, 68);
      doc.text('Casa Club del periodista, Colonia del Periodista', 35, 30, { align: 'left' });
      doc.text('Teléfono: (504) 2234-8871', 35, 35, { align: 'left' });
      doc.text('Correo: info@saintpatrickacademy.edu', 35, 40, { align: 'left' });

      // Tabla principal
      doc.autoTable({
          startY: 50,
          head: [[
              '#', 
              'DNI', 
              'Nombre', 
              'Segundo Nombre', 
              'Primer Apellido', 
              'Segundo Apellido', 
              'Dirección', 
              'Fecha Nacimiento', 
              'Estado', 
              'Tipo\nPersona', 
              'Género', 
              'Principal'
          ]],
          body: personas.map((persona, index) => [
              index + 1,
              persona.dni_persona ? persona.dni_persona.toUpperCase() : 'N/D',
              persona.Nombre ? persona.Nombre.toUpperCase() : 'N/D',
              persona.Segundo_nombre ? persona.Segundo_nombre.toUpperCase() : 'N/D',
              persona.Primer_apellido ? persona.Primer_apellido.toUpperCase() : 'N/D',
              persona.Segundo_apellido ? persona.Segundo_apellido.toUpperCase() : 'N/D',
              persona.direccion_persona ? persona.direccion_persona.toUpperCase() : 'N/D',
              persona.fecha_nacimiento ? new Date(persona.fecha_nacimiento).toLocaleDateString('es-ES') : 'N/D',
              persona.Estado_Persona ? persona.Estado_Persona.toUpperCase() : 'N/D',
              tipoPersona.find((tipo) => tipo.Cod_tipo_persona === persona.cod_tipo_persona)?.Tipo.toUpperCase() || 'N/D',
              generos.find((genero) => genero.Cod_genero === persona.cod_genero)?.Tipo_genero.toUpperCase() || 'N/D',
              persona.principal ? 'SÍ' : 'NO',
          ]),
          styles: {
              fontSize: 6, // Reducir tamaño de fuente
              textColor: [68, 68, 68],
              cellPadding: 2, // Espaciado compacto
          },
          headStyles: {
              fillColor: [22, 160, 133],
              textColor: [255, 255, 255],
              fontSize: 7,
              fontStyle: 'bold',
              halign: 'center', // Centrar el texto
          },
          alternateRowStyles: {
              fillColor: [240, 248, 255], // Colores alternados para filas
          },
          columnStyles: {
              0: { cellWidth: 15 }, // Ajustar ancho de columna #
              1: { cellWidth: 20 }, // DNI
              2: { cellWidth: 25}, // Nombre
              3: { cellWidth: 25 }, // Segundo Nombre
              4: { cellWidth: 25 }, // Primer Apellido
              5: { cellWidth: 25 }, // Segundo Apellido
              6: { cellWidth: 40 }, // Dirección
              7: { cellWidth: 18 }, // Fecha de Nacimiento
              8: { cellWidth: 15 }, // Estado
              9: { cellWidth: 20 }, // Tipo de Persona
              10: { cellWidth: 20 }, // Género
              11: { cellWidth: 20 }, // Principal
          },
          margin: { top: 10, right: 10, bottom: 10, left: 5 }, // Pegado a la izquierda
          didDrawPage: function (data) {
              // Pie de página
              doc.setFontSize(7);
              doc.setTextColor(100);

              // Agregar fecha y hora
              const now = new Date();
              const date = now.toLocaleDateString('es-HN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
              });
              const time = now.toLocaleTimeString('es-HN', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
              });

              doc.text(`Fecha y hora de generación: ${date}, ${time}`, 10, pageHeight - 10);
              doc.text(`Página ${data.pageNumber}`, pageWidth - 10, pageHeight - 10, { align: 'right' });
          },
      });

      // Guardar el PDF
      doc.save('Reporte_personas.pdf');
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
            setModalVisible(true)
          }}
        >
          + Nueva
        </CButton>
        <CDropdown>
          <CDropdownToggle style={{ backgroundColor: '#6C8E58', color: 'white' }}>
            Reporte
          </CDropdownToggle>
          <CDropdownMenu>
          <CDropdownItem onClick={ReportePersonasPDF}>Descargar en PDF</CDropdownItem>
          <CDropdownItem onClick={ReportePersonasExcel}>Descargar en Excel</CDropdownItem>
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
                    color="info"
                    onClick={() => openDetailModal(persona)}
                    style={{ marginLeft: '10px' }}
                  >
                    <CIcon icon={cilInfo} />
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



{/**************************INICIO DEL MODAL DE DETALLE DE LA PERSONA******************************************************/}
        <CModal
          visible={showDetailModal}
          onClose={closeDetailModal}
          backdrop="static"
          size="lg" // Modal más ancho
        >
          <CModalHeader
            onClose={closeDetailModal}
            style={{ backgroundColor: '#4B6251', color: '#ffffff' }} // Encabezado en verde claro
          >
            <CModalTitle>DETALLES DE LA PERSONA</CModalTitle>
          </CModalHeader>
          <CModalBody>
            {selectedPersona ? (
              <table style={{ width: '100%', backgroundColor: '#f8f9fa', borderRadius: '8px', borderCollapse: 'separate', borderSpacing: '0', }}>
                <tbody>
                  <tr>
                    <td style={{ backgroundColor: '#e9ecef', fontWeight: 'bold', padding: '10px', border: '1px solid #dee2e6', color: '#495057', width: '35%', }}> DNI: </td>
                    <td style={{ padding: '10px', border: '1px solid #dee2e6', color: '#495057', fontWeight: 'bold', width: '65%', }}>{selectedPersona.dni_persona.toUpperCase()}</td>
                  </tr>
                  <tr>
                    <td style={{ backgroundColor: '#e9ecef', fontWeight: 'bold', padding: '10px', border: '1px solid #dee2e6', color: '#495057', }}> Nombre: </td>
                    <td style={{ padding: '10px', border: '1px solid #dee2e6', color: '#495057', fontWeight: 'bold', }}>{selectedPersona.Nombre.toUpperCase()}</td>
                  </tr>
                  <tr>
                    <td style={{ backgroundColor: '#e9ecef', fontWeight: 'bold', padding: '10px', border: '1px solid #dee2e6', color: '#495057', }}>Segundo nombre:</td>
                    <td style={{ padding: '10px', border: '1px solid #dee2e6', color: '#495057', fontWeight: 'bold', }}> {selectedPersona.Segundo_nombre?.toUpperCase() || 'N/D'} </td>
                  </tr>
                  <tr>
                    <td style={{ backgroundColor: '#e9ecef', fontWeight: 'bold', padding: '10px', border: '1px solid #dee2e6', color: '#495057',}}>Primer Apellido: </td>
                    <td style={{ padding: '10px', border: '1px solid #dee2e6', color: '#495057', fontWeight: 'bold', }}> {selectedPersona.Primer_apellido.toUpperCase()}</td>
                  </tr>
                  <tr>
                    <td style={{ backgroundColor: '#e9ecef', fontWeight: 'bold', padding: '10px', border: '1px solid #dee2e6', color: '#495057', }} > Segundo Apellido: </td>
                    <td style={{ padding: '10px', border: '1px solid #dee2e6', color: '#495057', fontWeight: 'bold', }}> {selectedPersona.Segundo_apellido?.toUpperCase() || 'N/D'}</td>
                  </tr>
                  <tr> 
                  <td style={{backgroundColor: '#e9ecef',  fontWeight: 'bold', padding: '10px',  border: '1px solid #dee2e6',  color: '#495057',  }}>Nacionalidad:</td>
                  <td style={{padding: '10px', border: '1px solid #dee2e6', color: '#495057', fontWeight: 'bold',}}>{selectedPersona.Nacionalidad ? `${selectedPersona.Nacionalidad.id_nacionalidad || 'Sin ID'} - ${selectedPersona.Nacionalidad.pais_nacionalidad?.toUpperCase() || 'Sin País'}` : 'N/D'}</td> 
                  </tr>
                  <tr>
                    <td style={{ backgroundColor: '#e9ecef', fontWeight: 'bold', padding: '10px', border: '1px solid #dee2e6', color: '#495057', }}> Dirección:</td>
                    <td style={{ padding: '10px', border: '1px solid #dee2e6', color: '#495057', fontWeight: 'bold',}}> {selectedPersona.direccion_persona?.toUpperCase() || 'N/D'}</td>
                  </tr>
                  <tr>
                    <td style={{ backgroundColor: '#e9ecef', fontWeight: 'bold', padding: '10px', border: '1px solid #dee2e6', color: '#495057', }}> Fecha de nacimiento: </td>
                    <td style={{ padding: '10px', border: '1px solid #dee2e6', color: '#495057', fontWeight: 'bold',}}> {new Date(selectedPersona.fecha_nacimiento).toLocaleDateString('en-CA')}</td>
                  </tr>
                  <tr>
                    <td style={{ backgroundColor: '#e9ecef', fontWeight: 'bold', padding: '10px', border: '1px solid #dee2e6', color: '#495057', }}> Principal:</td>
                    <td style={{ padding: '10px', border: '1px solid #dee2e6', color: '#495057', fontWeight: 'bold',}}> {selectedPersona.principal || 'N/D'}</td>
                  </tr>
                  <tr>
                    <td style={{ backgroundColor: '#e9ecef', fontWeight: 'bold', padding: '10px', border: '1px solid #dee2e6', color: '#495057', }}> Estado:</td>
                    <td style={{ padding: '10px', border: '1px solid #dee2e6', color: '#495057', fontWeight: 'bold',}}> {selectedPersona.Estado_Persona?.toUpperCase() || 'N/D'}</td>
                  </tr>
                  <tr>
                    <td style={{ backgroundColor: '#e9ecef', fontWeight: 'bold', padding: '10px', border: '1px solid #dee2e6', color: '#495057', }}>Tipo Persona:</td>
                    <td style={{ padding: '10px', border: '1px solid #dee2e6', color: '#495057', fontWeight: 'bold',}}> {tipoPersona.find((tipo) => tipo.Cod_tipo_persona === selectedPersona.cod_tipo_persona)?.Tipo.toUpperCase() || 'N/D'}</td>
                  </tr>
                  <tr>
                    <td style={{ backgroundColor: '#e9ecef', fontWeight: 'bold', padding: '10px', border: '1px solid #dee2e6', color: '#495057',}}> Departamento:</td>
                    <td style={{padding: '10px', border: '1px solid #dee2e6', color: '#495057', fontWeight: 'bold',}}> {departamentos.find((depto) => depto.Cod_departamento === selectedPersona.cod_departamento,)?.Nombre_departamento.toUpperCase() || 'N/D'}</td>
                  </tr>
                  <tr>
                    <td style={{ backgroundColor: '#e9ecef', fontWeight: 'bold', padding: '10px', border: '1px solid #dee2e6', color: '#495057',}}> Municipio:</td>
                    <td style={{padding: '10px', border: '1px solid #dee2e6', color: '#495057', fontWeight: 'bold',}}> {municipio.find((municipio) => municipio.cod_municipio === selectedPersona.cod_municipio,)?.nombre_municipio.toUpperCase() || 'N/D'}</td>
                  </tr>
                  <tr>
                    <td style={{ backgroundColor: '#e9ecef', fontWeight: 'bold', padding: '10px', border: '1px solid #dee2e6', color: '#495057',}}>Género:</td>
                    <td style={{ padding: '10px', border: '1px solid #dee2e6', color: '#495057', fontWeight: 'bold',}}>{generos.find((genero) => genero.Cod_genero === selectedPersona.cod_genero)?.Tipo_genero.toUpperCase() || 'N/D'}</td>
                  </tr>
                </tbody>
              </table>
            ) : (
              <p className="text-center">NO SE HAN ENCONTRADO DETALLES DE LA PERSONA.</p>
            )}
          </CModalBody>
          <CModalFooter style={{ backgroundColor: '#f1f1f1' }}>
            <CButton color="secondary" onClick={closeDetailModal} style={{ width: '100px' }}>
              CERRAR
            </CButton>
          </CModalFooter>
        </CModal>

{/*****************************************FIN DEL MODAL DE DETALLE DE LA PERSONA************************************************/}
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

{/*********************************************MODAL PARA AGREGAR UNA PERSONA****************************************************/}
<CModal
        visible={modalVisible}
        onClose={() => handleCloseModal(setModalVisible, resetNuevaPersona)}
        backdrop="static"
        size="xl" // Aumentamos el tamaño del modal para hacerlo más amplio
      >
        <CModalHeader closeButton>
          <CModalTitle>Agregar Persona</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <div className="row">
              {/* Columna 1 */}
              <div className="col-md-6">

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

<div className="col-md-12">
  {errorMessages.dni_persona && (
    <div className="error-message" style={{ marginBottom: '10px', color: 'red', fontSize: '0.850rem' }}>
      {errorMessages.dni_persona}
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
          if (añoNacimientoDNI < yearNow - 90 || añoNacimientoDNI > yearNow - 4) {
            erroresTemp.dni_persona = `El año debe estar entre ${yearNow - 90} y ${yearNow - 4}.`;
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
          const minYear = currentYear - 90;
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
      style={{ color: '#6c757d' }} // Cambié el color a gris claro
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
</div>

              {/* Columna 2 */}
              <div className="col-md-6">
                <CInputGroup className="mb-3">
                  <CInputGroupText>Estado</CInputGroupText>
                  <CFormSelect
                    value={nuevaPersona.Estado_Persona || ''}
                    onChange={(e) =>
                      setNuevaPersona({ ...nuevaPersona, Estado_Persona: e.target.value })
                    }
                    required
                    style={{ color: '#6c757d' }} // Cambié el color a gris claro
                  >
                    <option value="">Seleccione un estado</option>
                    <option value="A">ACTIVO</option>
                    <option value="S">SUSPENDIDO</option>
                  </CFormSelect>
                </CInputGroup>
                {errorMessages.Estado_Persona && (
                  <div style={{ color: 'red' }}>{errorMessages.Estado_Persona}</div>
                )}

                    <div className="col-md-6">
                    <CInputGroup className="mb-3 align-items-center">
                      <CInputGroupText style={{ width: '230px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span>Principal</span>
                        <CFormCheck
                          type="checkbox"
                          label=""
                          checked={nuevaPersona.principal}
                          onChange={(e) =>
                            setNuevaPersona({ ...nuevaPersona, principal: e.target.checked })
                          }
                          style={{ transform: 'scale(1.3)', marginLeft: '10px' }}
                        />
                      </CInputGroupText>
                    </CInputGroup>
                    {errorMessages.principal && (
                      <div style={{ color: 'red', marginTop: '5px' }}>{errorMessages.principal}</div>
                    )}
                  </div>

                <CInputGroup className="mb-3">
                  <CInputGroupText>Tipo Persona</CInputGroupText>
                  <CFormSelect
                    value={nuevaPersona.cod_tipo_persona || ''}
                    onChange={(e) =>
                      setNuevaPersona({ ...nuevaPersona, cod_tipo_persona: e.target.value })
                    }
                    required
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
                {errorMessages.cod_tipo_persona && (
                  <div style={{ color: 'red' }}>{errorMessages.cod_tipo_persona}</div>
                )}
                  <CInputGroup className="mb-3">
                  <CInputGroupText>Género</CInputGroupText>
                  <CFormSelect
                    value={nuevaPersona.cod_genero || ''}
                    onChange={(e) =>
                      setNuevaPersona({ ...nuevaPersona, cod_genero: e.target.value })
                    }
                    required
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
                {errorMessages.cod_genero && (
                  <div style={{ color: 'red' }}>{errorMessages.cod_genero}</div>
                )}
                  <div className="mb-3">
                    <CInputGroup className="mb-3">
                      <CInputGroupText>
                        Nacionalidad
                      </CInputGroupText>
                      <CFormInput
                        type="text"
                        value={buscadorNacionalidad}
                        onChange={handleBuscarNacionalidad}
                        placeholder="Buscar por sigla de pais o letra"
                      />
                      <CButton type="button">
                        <CIcon icon={cilSearch} />
                      </CButton>
                    </CInputGroup>
                    {isDropdownOpenNacionalidad && nacionalidadesFiltradas.length > 0 && (
                      <div className="dropdown-menu show" style={{ position: 'absolute', zIndex: 999, top: '100%', left: 0, width: '100%' }}>
                        {nacionalidadesFiltradas.map((nacionalidad) => (
                          <div
                            key={nacionalidad.Cod_nacionalidad}
                            className="dropdown-item"
                            style={{ cursor: 'pointer' }}
                            onClick={() => handleSeleccionarNacionalidad(nacionalidad)}
                          >
                            {nacionalidad.Id_nacionalidad} - {nacionalidad.pais_nacionalidad}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <CInputGroup className="mb-3">
                  <CInputGroupText>Departamento</CInputGroupText>
                  <CFormSelect
                    value={nuevaPersona.cod_departamento || ''}
                    onChange={(e) =>
                      setNuevaPersona({ ...nuevaPersona, cod_departamento: e.target.value })
                    }
                    required
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
                {errorMessages.cod_departamento && (
                  <div style={{ color: 'red' }}>{errorMessages.cod_departamento}</div>
                )}
                  <div className="mb-3">
                  <CInputGroup className="mb-3">
                    <CInputGroupText>
                      Municipio
                    </CInputGroupText>
                    <CFormInput
                      type="text"
                      value={buscadorMunicipio}
                      onChange={handleBuscarMunicipio}
                      placeholder="Buscar por nombre del municipio"
                    />
                    <CButton type="button">
                      <CIcon icon={cilSearch} />
                    </CButton>
                  </CInputGroup>
                  {isDropdownOpenMunicipio && municipiosFiltrados.length > 0 && (
                    <div className="dropdown-menu show" style={{ position: 'absolute', zIndex: 999, top: '100%', left: 0, width: '100%' }}>
                      {municipiosFiltrados.map((municipio) => (
                        <div
                          key={municipio.cod_municipio}
                          className="dropdown-item"
                          style={{ cursor: 'pointer' }}
                          onClick={() => handleSeleccionarMunicipio(municipio)}
                        >
                          {municipio.nombre_municipio.toUpperCase()} - {municipio.nombre_departamento.toUpperCase()}
                        </div>
                        
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton
            color="secondary"
            onClick={() => handleCloseModal(setModalVisible, resetNuevaPersona)}
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

{/*********************************************MODAL PARA ACTUALIZAR UNA PERSONA****************************************************/}
      <CModal
        visible={modalUpdateVisible}
        onClose={() => {
          setModalUpdateVisible(false)
          resetPersonaToUpdate() // Resetear los datos al cerrar el modal
        }}
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
  {/* Identificador */}
  <CInputGroup className="mb-3">
    <CInputGroupText>Identificador</CInputGroupText>
    <CFormInput value={personaToUpdate.cod_persona} readOnly />
  </CInputGroup>

  {/* DNI */}
  {errorMessages.dni_persona && (
    <div className="error-message" style={{ marginBottom: '10px', color: 'red', fontSize: '0.850rem' }}>
      {errorMessages.dni_persona}
    </div>
  )}
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
          if (añoNacimientoDNI < yearNow - 90 || añoNacimientoDNI > yearNow - 4) {
            erroresTemp.dni_persona = `El año debe estar entre ${yearNow - 90} y ${yearNow - 4}.`;
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
      value={fechaNacimiento} // Usar el estado 'fechaNacimiento'
      onChange={(e) => {
        const value = e.target.value;
        setFechaNacimiento(value); // Actualizar el estado de fecha de nacimiento
        setPersonaToUpdate((prevState) => ({
          ...prevState,
          fecha_nacimiento: value, // Actualizar la persona a actualizar con la nueva fecha
        }));

        // Validación de la fecha de nacimiento en tiempo real
        let erroresTemp = { ...errorMessages };
        if (!value || value === '') {
          erroresTemp.fecha_nacimiento = 'Debe ingresar una fecha de nacimiento válida.';
        } else {
          const currentYear = new Date().getFullYear();
          const minYear = currentYear - 90;
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

              </CCol>
              {/* Columna Derecha */}
              <CCol md={6}>
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

                
              <div className="col-md-6">
                  <CInputGroup className="mb-3 align-items-center">
                    <CInputGroupText style={{ width: '230px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span>Principal</span>
                      <CFormCheck
                        type="checkbox"
                        label=""
                        checked={personaToUpdate.principal}
                        onChange={(e) =>
                          setPersonaToUpdate({ ...personaToUpdate, principal: e.target.checked })
                        }
                        style={{ transform: 'scale(1.3)', marginLeft: '10px' }}
                      />
                    </CInputGroupText>
                  </CInputGroup>
                  {errorMessages.principal && (
                    <div style={{ color: 'red', marginTop: '5px' }}>{errorMessages.principal}</div>
                  )}
                </div>
                <CInputGroup className="mb-3">
                  <CInputGroupText>Estado</CInputGroupText>
                  <CFormSelect
                    value={personaToUpdate.Estado_Persona || ''}
                    onChange={(e) =>
                      setPersonaToUpdate({ ...personaToUpdate, Estado_Persona: e.target.value })
                    }
                    required
                  >
                    <option value="">Seleccione un estado</option>
                    <option value="A">ACTIVO</option>
                    <option value="S">SUSPENDIDO</option>
                  </CFormSelect>
                </CInputGroup>

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
        setPersonaToUpdate((prevState) => ({ ...prevState, cod_tipo_persona: value }));

        // Validación para no aceptar vacío
        let erroresTemp = { ...errorMessages };
        if (!value) {
          erroresTemp.cod_tipo_persona = 'Debe seleccionar un tipo de persona.';
        } else {
          erroresTemp.cod_tipo_persona = '';
        }
        setErrorMessages(erroresTemp);
      }}
      required
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

<CInputGroup className="mb-3">
                  <CInputGroupText>Género</CInputGroupText>
                  <CFormSelect
                    value={personaToUpdate.cod_genero || ''}
                    onChange={(e) =>
                    setPersonaToUpdate({ ...personaToUpdate, cod_genero: parseInt(e.target.value, 10) })
                    }
                    required
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

                <div className="col-md-12">
  <CInputGroup className="mb-3">
    <CInputGroupText>Nacionalidad</CInputGroupText>
    <CFormInput
      type="text"
      value={buscadorNacionalidad}
      onChange={handleBuscarNacionalidad}
      placeholder="Buscar por sigla de país o letra"
    />
    <CButton type="button">
      <CIcon icon={cilSearch} />
    </CButton>
  </CInputGroup>

  {isDropdownOpenNacionalidad && nacionalidadesFiltradas.length > 0 && (
    <div className="dropdown-menu show" style={{ position: 'absolute', zIndex: 999, top: '100%', left: 0, width: '100%' }}>
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
          {nacionalidad.Id_nacionalidad} - {nacionalidad.pais_nacionalidad}
        </div>
      ))}
    </div>
  )}

  {errorMessages.Cod_nacionalidad && (
    <div className="error-message" style={{ color: 'red', marginBottom: '10px', fontSize: '0.850rem' }}>
      {errorMessages.Cod_nacionalidad}
    </div>
  )}
</div>

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

                <CInputGroup className="mb-3">
                  <CInputGroupText>Departamento</CInputGroupText>
                  <CFormSelect
                    value={personaToUpdate.cod_departamento || ''}
                    onChange={(e) =>
                      setPersonaToUpdate({ ...personaToUpdate, cod_departamento: e.target.value })
                    }
                    required
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

                <div className="col-md-12">
  <CInputGroup className="mb-3">
    <CInputGroupText>Municipio</CInputGroupText>
    <CFormInput
      type="text"
      value={buscadorMunicipio}
      onChange={handleBuscarMunicipio}
      placeholder="Buscar por nombre del municipio"
    />
    <CButton type="button">
      <CIcon icon={cilSearch} />
    </CButton>
  </CInputGroup>

  {isDropdownOpenMunicipio && municipiosFiltrados.length > 0 && (
    <div className="dropdown-menu show" style={{ position: 'absolute', zIndex: 999, top: '100%', left: 0, width: '100%' }}>
      {municipiosFiltrados.map((municipio) => (
        <div
          key={municipio.cod_municipio}
          className="dropdown-item"
          style={{ cursor: 'pointer' }}
          onClick={() => {
            handleSeleccionarMunicipio(municipio);
            setPersonaToUpdate({
              ...personaToUpdate,
              cod_municipio: municipio.cod_municipio,
              nombre_municipio: municipio.nombre_municipio,
            });
          }}
        >
          {municipio.nombre_municipio.toUpperCase()} - {municipio.nombre_departamento.toUpperCase()}
        </div>
      ))}
    </div>
  )}

  {errorMessages.cod_municipio && (
    <div className="error-message" style={{ color: 'red', marginBottom: '10px', fontSize: '0.850rem' }}>
      {errorMessages.cod_municipio}
    </div>
  )}
</div>

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

              </CCol>
            </CRow>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton
            style={{ backgroundColor: '#6c757d', color: 'white', borderColor: '#6c757d' }}
            onClick={() => {
              setModalUpdateVisible(false)
              resetPersonaToUpdate() // Restablecer valores cuando se cierra el modal
            }}
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
{/*********************************************MODAL PARA ACTUALIZAR UNA PERSONA****************************************************/}

{/*********************************************MODAL PARA ELIMINAR UNA PERSONA****************************************************/}
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

