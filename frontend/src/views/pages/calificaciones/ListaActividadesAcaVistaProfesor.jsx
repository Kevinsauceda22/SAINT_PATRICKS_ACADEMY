import React, { useEffect, useState } from 'react';
import { CIcon } from '@coreui/icons-react';
import { cilSearch,cilInfo,cilBrushAlt, cilPen, cilTrash, cilPlus, cilSave,cilFile,cilSpreadsheet,cilDescription,cilArrowLeft } from '@coreui/icons'; // Importar iconos específicos
import Swal from 'sweetalert2';

import * as jwt_decode from 'jwt-decode';

import {CButton,CContainer, CTable,CTableHead,CTableRow, CTableHeaderCell,
  CTableBody,CTableDataCell,CCol,CRow, CModal,CModalHeader, CModalBody, CModalFooter,  CForm, 
  CFormInput,CFormSelect, CInputGroup,CFormTextarea,CInputGroupText, CPagination, CDropdown,CDropdownToggle,
  CDropdownMenu,CDropdownItem
} from '@coreui/react';

import logo from 'src/assets/brand/logo_saint_patrick.png'
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

import usePermission from '../../../../context/usePermission';
import AccessDenied from "../AccessDenied/AccessDenied"

const ActividadesAcademicasProfesor = () => {
  const { canSelect, canInsert, canUpdate,canDelete } = usePermission('ListaActividadesProfesor');
  const [secciones, setSecciones] = useState([]); // ✅ Initialize as an empty array

  const [asignaturas, setAsignaturas] = useState([]);
  const [parciales, setParciales] = useState([]);
  const [actividades, setActividades] = useState([]);
  const [nuevoActividad, setNuevoActividad] = useState( '' );
  
  const [selectedSeccion, setSelectedSeccion] = useState(null);
  const [selectedAsignatura, setSelectedAsignatura] = useState(null);
  const [vistaActual, setVistaActual] = useState("secciones");
  const [selectedParcial, setSelectedParcial] = useState(null);
  const [modalVisible, setModalVisible] = useState(false); // Control del modal
  const [codProfesor, setCodProfesor] = useState(""); // Para almacenar el código del profesor
  const [nuevaActividad, setNuevaActividad] = useState({
    Cod_profesor: "",
    Cod_ponderacion_ciclo: "",
    Cod_parcial: "",
    Nombre_actividad_academica: "",
    Descripcion: "",
    Fechayhora_Inicio: "",
    Fechayhora_Fin: "",
    Valor: "",
    Cod_secciones: "",
    Cod_seccion_asignatura: "",
  });

  const [listaponderacionesC, setlistaponderacionesC] = useState([]);
  const [parcialesConActividades, setParcialesConActividades] = useState([]);
  const [updateModalVisible, setUpdateModalVisible] = useState(false); // Control del modal de actualización
  const [actividadToUpdate, setActividadToUpdate] = useState(null); // Actividad seleccionada para actualizar
  const [valorTotalActividades, setValorTotalActividades] = useState(0);
  const [conteoActividades, setConteoActividades] = useState([]);
  //para paginacion y busqueda de la vista secciones
  const [recordsPerPage, setRecordsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1); 
//para paginacion y busqueda de la vista asignaturas
  const [recordsPerPage2, setRecordsPerPage2] = useState(5);
  const [searchTerm2, setSearchTerm2] = useState('');
  const [currentPage2, setCurrentPage2] = useState(1);
//para paginacion y busqueda de la vista parciales
  const [recordsPerPage3, setRecordsPerPage3] = useState(5);
  const [searchTerm3, setSearchTerm3] = useState('');
  const [currentPage3, setCurrentPage3] = useState(1);
  //para paginacion y busqueda de la vista Actividades
  const [recordsPerPage4, setRecordsPerPage4] = useState(5);
  const [searchTerm4, setSearchTerm4] = useState('');
  const [currentPage4, setCurrentPage4] = useState(1);

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false); // Estado para detectar cambios sin guardar

   useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken = jwt_decode(token); // Usamos jwt_decode para decodificar el token
        console.log('Token decodificado:', decodedToken);

        // Aquí puedes realizar otras acciones, como verificar si el token es válido o si el usuario tiene permisos

      } catch (error) {
        console.error('Error al decodificar el token:', error);
      }
    }
  }, []); 
  
  // Fetch del código del profesor al cargar el componente
  const fetchCodProfesor = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:4000/api/profesores/obtenerCodProfesor', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        throw new Error('Error al obtener el código del profesor');
      }
      const data = await response.json();
      setCodProfesor(data.Cod_profesor);
    } catch (error) {
      console.error('Error al obtener el código del profesor:', error);
      Swal.fire('Error', 'No se pudo obtener el código del profesor.', 'error');
    }
  };




  const fetchSecciones = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:4000/api/seccion/porprofesores', {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setSecciones(data.secciones);
    } catch (error) {
      Swal.fire('Error', 'No se pudieron cargar las secciones.', 'error');
    }
  };

  const fetchAsignaturas = async (codSeccion) => {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:4000/api/asignaturas/porprofesor/${codSeccion}`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error('Error al obtener asignaturas.');

        const data = await response.json();
        console.log('Asignaturas obtenidas:', data); // Valida que los datos sean correctos

        setAsignaturas(data);
    } catch (error) {
        console.error('Error al obtener las asignaturas:', error);
        Swal.fire('Error', 'No se pudieron cargar las asignaturas.', 'error');
    }
};





const fetchParciales = async () => {
  try {
    // Realizar solicitud a la API
    const response = await fetch(`http://localhost:4000/api/parciales/verParciales`, {
      
      method: 'GET',
    });
    
    // Registrar toda la respuesta para depuración
    const responseData = await response.json();
    console.log('Respuesta completa:', responseData);

    if (!response.ok) {
      console.error('Error en la respuesta de la API:', responseData);
      
      throw new Error(responseData.mensaje || 'Error desconocido en la API.');
      
    }
   
   
    // Aquí podrías manejar la respuesta si necesitas usarla más adelante
    console.log('Parciales obtenidos:', responseData)

    setParciales(responseData);
  } catch (error) {
    console.error('Error al obtener los parciales:', error);
    Swal.fire('Error', `Error al obtener los parciales: ${error.message}`, 'error');
  }
};










const fetchListaCiclo = async () => {
  try {
    const token = localStorage.getItem('token'); // Asegúrate de que el token esté disponible
    const response = await fetch('http://localhost:4000/api/actividadesAcademicas/obtenerPonderacionesPorProfesor', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Error al obtener las ponderaciones del profesor.');
    }

    const data = await response.json();
    console.log('Ponderaciones obtenidas:', data); // Validación de datos
    setlistaponderacionesC(data); // Actualiza el estado con las ponderaciones
  } catch (error) {
    console.error('Error al obtener las ponderaciones:', error);
    Swal.fire('Error', 'No se pudieron cargar las ponderaciones del profesor.', 'error');
  }
};

 // Función para manejar cambios en el input
 const handleInputChange = (e, setFunction) => {
  const input = e.target;
  const cursorPosition = input.selectionStart; // Guarda la posición actual del cursor
  let value = input.value
    .toUpperCase() // Convertir a mayúsculas
    .trimStart(); // Evitar espacios al inicio

    const regex = /^[A-ZÁÉÍÓÚÑ0-9\s,;:.]*$/; // Permite solo letras mayúsculas, números, espacios y símbolos permitidos


    // Validar si hay caracteres consecutivos no permitidos como ",," "; ;" ": :" ".."
if (/[.,;:]{2,}/.test(value)) {
  Swal.fire({
    icon: 'warning',
    title: 'Símbolos repetidos',
    text: 'No se permite que los símbolos ",", ";", ":", o "." se repitan dos veces seguidas.',
  });
  return;
}

  // Verificar si hay múltiples espacios consecutivos antes de reemplazarlos
  if (/\s{2,}/.test(value)) {
    Swal.fire({
      icon: 'warning',
      title: 'Espacios múltiples',
      text: 'No se permite más de un espacio entre palabras.',
    });
    value = value.replace(/\s+/g, ' '); // Reemplazar múltiples espacios por uno solo
  }

  // Validar solo los caracteres permitidos
if (!regex.test(value)) {
  Swal.fire({
    icon: 'warning',
    title: 'Caracteres no permitidos',
    text: 'Solo se permiten letras, números, tildes, comas, punto y coma, dos puntos, puntos y espacios.',
  });
  return;
}

  // Validación: no permitir letras repetidas más de 4 veces seguidas
  const words = value.split(' ');
  for (let word of words) {
    const letterCounts = {};
    for (let letter of word) {
      letterCounts[letter] = (letterCounts[letter] || 0) + 1;
      if (letterCounts[letter] > 4) {
        Swal.fire({
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


const handleAbrirModal = async () => {
  try {
    // Llama al endpoint para obtener el Cod_profesor
    const token = localStorage.getItem('token'); // Asegúrate de que el token esté en localStorage
    const response = await fetch('http://localhost:4000/api/profesores/obtenerCodProfesor', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.mensaje || 'Error al obtener el código del profesor');
    }

    // Asigna los valores necesarios para la nueva actividad
    setNuevaActividad({
      Cod_profesor: data.Cod_profesor || 'N/A', // Asigna el Cod_profesor obtenido
      Cod_ponderacion_ciclo: "",
      Cod_parcial: selectedParcial?.Cod_parcial || "N/A",
      Nombre_actividad_academica: "",
      Descripcion: "",
      Fechayhora_Inicio: "",
      Fechayhora_Fin: "",
      Valor: "",
      Cod_secciones: selectedSeccion?.Cod_secciones || "N/A",
      Cod_seccion_asignatura: selectedAsignatura?.Cod_seccion_asignatura || "N/A",
    });

    // Muestra el modal
    setModalVisible(true);
  } catch (error) {
    console.error('Error al abrir el modal y obtener el código del profesor:', error);
    Swal.fire('Error', 'No se pudo obtener el código del profesor.', 'error');
  }
};



// Call fetchParciales when parciales need to be displayed
useEffect(() => {
  if (codProfesor && selectedSeccion && selectedParcial && selectedAsignatura) {
      fetchActividades();
  }
}, [codProfesor, selectedSeccion, selectedParcial, selectedAsignatura]);


useEffect(() => {
  console.log("Actividad to update:", actividadToUpdate);
  console.log("Update modal visible:", updateModalVisible);
}, [actividadToUpdate, updateModalVisible]);











const fetchActividades = async () => {
  try {
      if (!selectedSeccion || !selectedParcial || !selectedAsignatura) {
          console.error('Faltan parámetros para obtener actividades.', {
              selectedSeccion,
              selectedParcial,
              selectedAsignatura,
          });
          return;
      }

      const token = localStorage.getItem('token');
      const response = await fetch(
          `http://localhost:4000/api/actividadesAcademicas/actividadesporparcialseccion?codSeccion=${selectedSeccion.Cod_secciones}&codParcial=${selectedParcial.Cod_parcial}&codAsignatura=${selectedAsignatura.Cod_asignatura}`,
          {
              method: 'GET',
              headers: { Authorization: `Bearer ${token}` },
          }
      );

      if (!response.ok) {
          throw new Error('Error al obtener actividades.');
      }

      const data = await response.json();
      setActividades(Array.isArray(data) ? data : []);




  // Calcular el valor total acumulado
  const totalValor = data.reduce((sum, actividad) => sum + (actividad.Valor || 0), 0);
  setValorTotalActividades(totalValor);
    
} catch (error) {
  console.error('Error al obtener actividades:', error);
  Swal.fire('Error', 'No se pudieron cargar las actividades.', 'error');
  setActividades([]); // Always reset activities to an array
}
};


const formatDateTimeLocal = (date) => {
  if (!date) return ""; // Si no hay fecha, retorna un string vacío

  const localDate = new Date(date);
  const year = localDate.getFullYear();
  const month = String(localDate.getMonth() + 1).padStart(2, "0"); // Mes inicia en 0
  const day = String(localDate.getDate()).padStart(2, "0");
  const hours = String(localDate.getHours()).padStart(2, "0");
  const minutes = String(localDate.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const handleSeleccionarSeccion = (seccion) => {
  setSelectedSeccion(seccion);
  setVistaActual("asignaturas");
  fetchAsignaturas(seccion.Cod_secciones);
};

// Método para manejar la selección de asignatura
const handleSeleccionarAsignatura = (asignatura) => {
  if (!selectedSeccion) {
      console.error('Error: selectedSeccion está undefined.');
      Swal.fire('Error', 'Debe seleccionar una sección válida.', 'error');
      return;
  }

  if (!asignatura || !asignatura.Cod_asignatura) {
      console.error('Error: asignatura o Cod_asignatura está undefined.', { asignatura });
      Swal.fire('Error', 'Debe seleccionar una asignatura válida.', 'error');
      return;
  }

  setSelectedAsignatura(asignatura); // Guarda la asignatura seleccionada
  setVistaActual("parciales");

  // Llama al fetchParciales solo si los datos son válidos
  console.log('Fetching parciales con:', {
      Cod_secciones: selectedSeccion.Cod_secciones,
      Cod_asignatura: asignatura.Cod_asignatura,
  });

  fetchParciales(selectedSeccion.Cod_secciones, asignatura.Cod_asignatura);
};



const obtenerCodCicloPorPonderacionCiclo = async (Cod_ponderacion_ciclo) => {
  try {
    const response = await fetch(
      `http://localhost:4000/api/ponderacionCiclo/ciclo?Cod_ponderacion_ciclo=${Cod_ponderacion_ciclo}`
    );
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.mensaje || "Error al obtener el ciclo.");
    }

    return data.Cod_ciclo;
  } catch (error) {
    console.error("Error al obtener el ciclo:", error);
    Swal.fire("Error", "No se pudo obtener el ciclo para la ponderación.", "error");
    return null;
  }
};


 // Función para cerrar el modal con advertencia si hay cambios sin guardar
 const handleCloseModal = (closeFunction, resetFields) => {
  if (hasUnsavedChanges) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Si cierras este formulario, perderás todos los datos ingresados.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, cerrar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        closeFunction(false);     // Cerrar el modal
        resetFields();            // Limpiar los campos
        setHasUnsavedChanges(false); // Resetear el indicador de cambios no guardados
      }
    });
  } else {
    closeFunction(false);         // Cerrar el modal directamente
    resetFields();                // Limpiar los campos
    setHasUnsavedChanges(false);  // Resetear el indicador de cambios no guardados
  }
};

// Funciones auxiliares para resetear los campos específicos de cada modal
const resetNuevoActividad = () => setNuevoActividad({});
const resetgradoToUpdate = () => setActividadToUpdate({});




const handleGestionarActividades = (parcial) => {
  if (!selectedSeccion || !selectedAsignatura || !parcial) {
    Swal.fire("Error", "Debe seleccionar una sección, asignatura y parcial válidos.", "error");
    return;
  }

  setSelectedParcial(parcial);
  setVistaActual("actividades");

  fetchActividades(
    selectedSeccion?.Cod_secciones,
    parcial?.Cod_parcial,
    selectedAsignatura?.Cod_seccion_asignatura
  );
};



  const handleRegresar = () => {
    if (vistaActual === "actividades") setVistaActual("parciales");
    else if (vistaActual === "parciales") setVistaActual("asignaturas");
    else if (vistaActual === "asignaturas") setVistaActual("secciones");
  };

  useEffect(() => {
    fetchSecciones();
    fetchCodProfesor(); // Llamar al método cuando el componente se monta
    fetchListaCiclo();
  }, []);



  // Deshabilitar copiar y pegar
  const disableCopyPaste =(e) => {
    e.preventDefault();
    Swal.fire({
      icon: 'warning',
      title: 'Accion bloquear',
      text:'Copiar y pegar no esta permitido'
    });
  };







  
  const handleCrearActividad = async () => {
    try {
       // Verificar si obtenemos el token correctamente
       const token = localStorage.getItem('token');
       if (!token) {
         Swal.fire('Error', 'No tienes permiso para realizar esta acción', 'error');
         return;
       }
   
       // Decodificar el token para obtener el nombre del usuario
       const decodedToken = jwt_decode.jwtDecode(token);
       if (!decodedToken.cod_usuario || !decodedToken.nombre_usuario) {
         console.error('No se pudo obtener el código o el nombre de usuario del token');
         throw new Error('No se pudo obtener el código o el nombre de usuario del token');
       }
      console.log("Valores actuales de nuevaActividad:", nuevaActividad);
  
      // Validación de campos requeridos
      if (
        !nuevaActividad.Cod_ponderacion_ciclo ||
        !nuevaActividad.Nombre_actividad_academica ||
        !nuevaActividad.Descripcion ||
        !nuevaActividad.Fechayhora_Inicio ||
        !nuevaActividad.Fechayhora_Fin ||
        !nuevaActividad.Valor
      ) {
        Swal.fire("Error", "Todos los campos son requeridos. Por favor, complete todos los campos.", "error");
        return;
      }
  
      // Validación de fechas
      const fechaInicio = new Date(nuevaActividad.Fechayhora_Inicio);
      const fechaFin = new Date(nuevaActividad.Fechayhora_Fin);
  
      if (fechaInicio > fechaFin) {
        Swal.fire({
          icon: "error",
          title: "Fechas inválidas",
          text: 'La "fecha inicio" no puede ser mayor que la "fecha fin".',
        });
        return;
      }
  
      const esValido = await validarValorActividad(
        nuevaActividad.Cod_ponderacion_ciclo,
        selectedAsignatura?.Cod_seccion_asignatura,
        selectedParcial?.Cod_parcial,
        nuevaActividad.Valor
    );
    
    if (!esValido) {
        return; // Detener la ejecución si no es válido
    }
  
      // Crear el objeto de datos para enviar
      const actividadData = {
        ...nuevaActividad,
        Cod_secciones: selectedSeccion?.Cod_secciones,
        Cod_parcial: selectedParcial?.Cod_parcial,
        Cod_seccion_asignatura: selectedAsignatura?.Cod_seccion_asignatura,
      };
  
      const response = await fetch("http://localhost:4000/api/actividadesAcademicas/registrar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(actividadData),
      });
  
      const responseData = await response.json();
  
      if (response.ok) {
         // 2. Registrar la acción en la bitácora
         const descripcion = `El usuario: ${decodedToken.nombre_usuario} ha creado nueva actividad académica: ${nuevaActividad.Nombre_actividad_academica} `;
        
         // Enviar a la bitácora
         const bitacoraResponse = await fetch('http://localhost:4000/api/bitacora/registro', {
           method: 'POST',
           headers: {
             'Content-Type': 'application/json',
             'Authorization': `Bearer ${token}`, // Incluir token en los encabezados
           },
           body: JSON.stringify({
             cod_usuario: decodedToken.cod_usuario, // Código del usuario
             cod_objeto: 83, // Código del objeto para la acción
             accion: 'INSERT', // Acción realizada
             descripcion: descripcion, // Descripción de la acción
           }),
         });
   
         if (bitacoraResponse.ok) {
           console.log('Registro en bitácora exitoso');
         } else {
           Swal.fire('Error', 'No se pudo registrar la acción en la bitácora', 'error');
         }
        Swal.fire({
          icon: "success",
          title: "¡Éxito!",
          text: "La actividad se ha creado correctamente.",
          confirmButtonText: 'Aceptar',
        });
  
        // Refrescar actividades sin cambiar a vista inicial
        fetchActividades(
          selectedSeccion?.Cod_secciones,
          selectedParcial?.Cod_parcial,
          selectedAsignatura?.Cod_seccion_asignatura
        );
  
        // Cerrar el modal y limpiar los campos
        setModalVisible(false);
        setNuevaActividad({
          Cod_profesor: '',
          Cod_ponderacion_ciclo: '',
          Cod_parcial: '',
          Nombre_actividad_academica: '',
          Descripcion: '',
          Fechayhora_Inicio: '',
          Fechayhora_Fin: '',
          Valor: '',
          Cod_secciones: '',
          Cod_seccion_asignatura: '',
        });
      } else {
        Swal.fire("Error", `Problema al crear actividad: ${responseData.mensaje}`, "error");
      }
    } catch (error) {
      console.error("Error al crear la actividad", error);
      Swal.fire("Error", "Error en el servidor al crear la actividad", "error");
    }
  };
  






  const validarValorActividad = async (Cod_ponderacion_ciclo, Cod_seccion_asignatura, Cod_parcial, Valor) => {
    try {
        const response = await fetch('http://localhost:4000/api/actividadesacademicas/validar-valor', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
              Cod_ponderacion_ciclo,
              Cod_seccion_asignatura,
              Cod_parcial,
              Valor,
          }),
      });

      const data = await response.json();

      if (!response.ok) {
          Swal.fire("Error", data.mensaje, "error");
          return false;
      }

      return true;
  } catch (error) {
      console.error("Error al validar el valor de la actividad:", error);
      Swal.fire("Error", "Error en la validación del valor.", "error");
      return false;
  }
};

































  
// Manejar actualización de actividad
const handleActualizarActividad = async () => {
  const { Nombre_actividad_academica, Descripcion, Fechayhora_Inicio, Fechayhora_Fin, Valor, Cod_actividad_academica } = actividadToUpdate;

  // Validar campos vacíos
  if (!Nombre_actividad_academica || !Descripcion || !Fechayhora_Inicio || !Fechayhora_Fin || !Valor) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Todos los campos son obligatorios.",
    });
    return;
  }

  // Validación de fechas
  const fechaInicio = new Date(Fechayhora_Inicio);
  const fechaFin = new Date(Fechayhora_Fin);
  
  if (fechaInicio > fechaFin) {
    Swal.fire({
      icon: "error",
      title: "Fechas inválidas",
      text: 'La "fecha inicio" no puede ser mayor que la "fecha fin".',
    });
    return;
  }

  try {
     // Verificar si obtenemos el token correctamente
     const token = localStorage.getItem('token');
     if (!token) {
       Swal.fire('Error', 'No tienes permiso para realizar esta acción', 'error');
       return;
     }
 
     // Decodificar el token para obtener el nombre del usuario
     const decodedToken = jwt_decode.jwtDecode(token);
     if (!decodedToken.cod_usuario || !decodedToken.nombre_usuario) {
       console.error('No se pudo obtener el código o el nombre de usuario del token');
       throw new Error('No se pudo obtener el código o el nombre de usuario del token');
     }
    // Validar espacio restante en el backend
    const response = await fetch("http://localhost:4000/api/actividadesacademicas/validar-valoractua", {
      method: "POST",
      headers: {
          "Content-Type": "application/json",
      },
      body: JSON.stringify({
          Cod_ponderacion_ciclo: actividadToUpdate.Cod_ponderacion_ciclo,
          Cod_seccion_asignatura: selectedAsignatura?.Cod_seccion_asignatura,
          Cod_parcial: selectedParcial?.Cod_parcial,
          Valor: parseFloat(Valor), // Nuevo valor propuesto
          Cod_actividad_academica: Cod_actividad_academica, // Usar el código correcto
      }),
  });

    const data = await response.json();

    if (!response.ok) {
      Swal.fire("Error", data.mensaje, "error");
      return;
    }

    // Si pasa la validación, proceder con la actualización
    const updateResponse = await fetch(
      `http://localhost:4000/api/actividadesAcademicas/${Cod_actividad_academica}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          Nombre_actividad_academica,
          Descripcion,
          Fechayhora_Inicio,
          Fechayhora_Fin,
          Valor,
        }),
      }
    );

    if (!updateResponse.ok) {
      throw new Error("Error en la actualización.");
    }

     // Registrar la acción en la bitácora
     const descripcion = `El usuario: ${decodedToken.nombre_usuario} ha actualizado la actividad academica: ${Nombre_actividad_academica}, con valor ${Valor}`;
         
     // Enviar a la bitácora
     const bitacoraResponse = await fetch('http://localhost:4000/api/bitacora/registro', {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json',
         'Authorization': `Bearer ${token}`, // Incluir token en los encabezados
       },
       body: JSON.stringify({
         cod_usuario: decodedToken.cod_usuario, // Código del usuario
         cod_objeto: 83, // Código del objeto para la acción
         accion: 'UPDATE', // Acción realizada
         descripcion: descripcion, // Descripción de la acción
       }),
     });

     if (bitacoraResponse.ok) {
       console.log('Registro en bitácora exitoso');
     } else {
       Swal.fire('Error', 'No se pudo registrar la acción en la bitácora', 'error');
     }
    
    Swal.fire({
      icon: "success",
      title: "¡Éxito!",
      text: "La actividad se ha actualizado correctamente.",
      confirmButtonText: 'Aceptar',
    });

    // Refrescar actividades
    await fetchActividades(
      selectedSeccion?.Cod_secciones,
      selectedParcial?.Cod_parcial,
      selectedAsignatura?.Cod_seccion_asignatura
    );

    handleCloseUpdateModal(); // Cerrar el modal
  } catch (error) {
    console.error("Error al actualizar la actividad:", error);
    Swal.fire("Error", "No se pudo actualizar la actividad.", "error");
  }
};







const formatDateTime = (date) => {
  if (!date) return ""; // Si la fecha es null o undefined, retorna un string vacío
  const formattedDate = new Date(date).toISOString().slice(0, 16); // Convierte al formato ISO y recorta
  return formattedDate;
};





const handleOpenUpdateModal = (actividad) => {
  setActividadToUpdate(actividad); // Establece la actividad seleccionada
  setUpdateModalVisible(true); // Abre el modal
};

const handleCloseUpdateModal = () => {
  setUpdateModalVisible(false); // Cierra el modal
  setActividadToUpdate(null); // Limpia el estado
};
const forceModalOpen = (actividad) => {
  setActividadToUpdate(null); // Clear state first
  setTimeout(() => {
    setActividadToUpdate(actividad); // Set the activity to update
    setUpdateModalVisible(true); // Open the modal
  }, 0); // Allow React to process the state change
};


const handleEliminarActividad = async (id,nombre) => {
    try {
       // Verificar si obtenemos el token correctamente
       const token = localStorage.getItem('token');
       if (!token) {
         Swal.fire('Error', 'No tienes permiso para realizar esta acción', 'error');
         return;
       }
   
       // Decodificar el token para obtener el nombre del usuario
       const decodedToken = jwt_decode.jwtDecode(token);
       if (!decodedToken.cod_usuario || !decodedToken.nombre_usuario) {
         console.error('No se pudo obtener el código o el nombre de usuario del token');
         throw new Error('No se pudo obtener el código o el nombre de usuario del token');
       }
        const confirm = await Swal.fire({
            title: "¿Estás seguro?",
            text: "Esta acción eliminará la actividad de forma permanente.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar",
        });

        if (confirm.isConfirmed) {
            const response = await fetch(
                `http://localhost:4000/api/actividadesAcademicas/${id}`,
                {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                        'Authorization': `Bearer ${token}`,
                    },
                }
            );

            const responseData = await response.json();

            if (response.ok) {
               // 2. Registrar la acción en la bitácora
              const descripcion = `El usuario: ${decodedToken.nombre_usuario} ha eliminado la actividad: ${nombre} con codigo ${id}`;
              
              // Enviar a la bitácora
              const bitacoraResponse = await fetch('http://localhost:4000/api/bitacora/registro', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`, // Incluir token en los encabezados
                },
                body: JSON.stringify({
                  cod_usuario: decodedToken.cod_usuario, // Código del usuario
                  cod_objeto: 83, // Código del objeto para la acción
                  accion: 'DELETE', // Acción realizada
                  descripcion: descripcion, // Descripción de la acción
                }),
              });
        
              if (bitacoraResponse.ok) {
                console.log('Registro en bitácora exitoso');
              } else {
                Swal.fire('Error', 'No se pudo registrar la acción en la bitácora', 'error');
              }
                Swal.fire({
                    icon: "success",
                    title: "¡Éxito!",
                    text: responseData.mensaje,
                    confirmButtonText: 'Aceptar',
                });

                // Refrescar actividades después de eliminar
                fetchActividades(
                    selectedSeccion?.Cod_secciones,
                    selectedParcial?.Cod_parcial,
                    selectedAsignatura?.Cod_seccion_asignatura
                );
            } else {
                Swal.fire("Error", `Problema al eliminar actividad: ${responseData.mensaje}`, "error");
            }
        }
    } catch (error) {
        console.error("Error al eliminar la actividad:", error);
        Swal.fire("Error", "Error en el servidor al eliminar la actividad", "error");
    }
};




// Añadir el botón Eliminar en la tabla
<CButton
    className="btn btn-sm"
    style={{ backgroundColor: "#E57368" }}
    onClick={() => handleEliminarActividad(actividades.Cod_actividad_academica)}
>
    Eliminar
</CButton>;











































//-------------------paginacion, buscador vista actual : secciones-----------------------------
  const handleSearch = (event) => {
    const input = event.target.value.toUpperCase();
    const regex = /^[A-ZÑ\s]*$/; // Solo permite letras, espacios y la letra "Ñ"
    
    if (!regex.test(input)) {
      Swal.fire({
        icon: 'warning',
        title: 'Caracteres no permitidos',
        text: 'Solo se permiten letras y espacios.',
      });
      return;
    }
    setSearchTerm(input);
    setCurrentPage(1); // Resetear a la primera página al buscar
  };
  
  // Filtro de búsqueda
  const filteredSecciones = secciones.filter(seccion => 
    seccion.Nombre_seccion.toLowerCase().includes(searchTerm.toLowerCase()) || 
    seccion.Nombre_grado.toLowerCase().includes(searchTerm.toLowerCase())
  );

 // Lógica de paginación
 const indexOfLastRecord = currentPage * recordsPerPage;
 const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
 const currentRecords = filteredSecciones.slice(indexOfFirstRecord, indexOfLastRecord);

 // Cambiar página
const paginate = (pageNumber) => {
  if (pageNumber > 0 && pageNumber <= Math.ceil(filteredSecciones.length / recordsPerPage)) {
    setCurrentPage(pageNumber);
  }
}
//------------------------------------------------------------------------------------------------------

//-------------------paginacion, buscador vista actual : asignaturas-----------------------------
const handleSearch2 = (event) => {
  const input = event.target.value.toUpperCase();
  const regex = /^[A-ZÑ\s]*$/; // Solo permite letras, espacios y la letra "Ñ"
  
  if (!regex.test(input)) {
    Swal.fire({
      icon: 'warning',
      title: 'Caracteres no permitidos',
      text: 'Solo se permiten letras y espacios.',
    });
    return;
  }
  setSearchTerm2(input);
  setCurrentPage2(1); // Resetear a la primera página al buscar
};

// Filtro de búsqueda
const filteredAsignaturas = asignaturas.filter(asignatura => 
  asignatura.Nombre_asignatura.toLowerCase().includes(searchTerm2.toLowerCase())
);

// Lógica de paginación
const indexOfLastRecord2 = currentPage2 * recordsPerPage2;
const indexOfFirstRecord2 = indexOfLastRecord2 - recordsPerPage2;
const currentRecords2 = filteredAsignaturas.slice(indexOfFirstRecord2, indexOfLastRecord2);

// Cambiar página
const paginate2 = (pageNumber) => {
if (pageNumber > 0 && pageNumber <= Math.ceil(filteredAsignaturas.length / recordsPerPage2)) {
  setCurrentPage2(pageNumber);
}
}
//------------------------------------------------------------------------------------------------------

//-------------------paginacion, buscador vista actual : parciales-----------------------------
const handleSearch3 = (event) => {
  const input = event.target.value.toUpperCase();
  const regex = /^[A-ZÑ\s]*$/; // Solo permite letras, espacios y la letra "Ñ"
  
  if (!regex.test(input)) {
    Swal.fire({
      icon: 'warning',
      title: 'Caracteres no permitidos',
      text: 'Solo se permiten letras y espacios.',
    });
    return;
  }
  setSearchTerm3(input);
  setCurrentPage3(1); // Resetear a la primera página al buscar
};

// Filtro de búsqueda
const filteredParciales = parciales.filter(parcial => 
  parcial.Nombre_parcial.toLowerCase().includes(searchTerm3.toLowerCase())
);

// Lógica de paginación
const indexOfLastRecord3 = currentPage3 * recordsPerPage3;
const indexOfFirstRecord3 = indexOfLastRecord3 - recordsPerPage3;
const currentRecords3 = filteredParciales.slice(indexOfFirstRecord3, indexOfLastRecord3);

// Cambiar página
const paginate3 = (pageNumber) => {
if (pageNumber > 0 && pageNumber <= Math.ceil(filteredParciales.length / recordsPerPage3)) {
  setCurrentPage3(pageNumber);
}
}
//------------------------------------------------------------------------------------------------------

//-------------------paginacion, buscador vista actual : Actividades-----------------------------
const handleSearch4 = (event) => {
  const input = event.target.value.toUpperCase();
  const regex = /^[A-ZÑ\s]*$/; // Solo permite letras, espacios y la letra "Ñ"
  
  if (!regex.test(input)) {
    Swal.fire({
      icon: 'warning',
      title: 'Caracteres no permitidos',
      text: 'Solo se permiten letras y espacios.',
    });
    return;
  }
  setSearchTerm4(input);
  setCurrentPage4(1); // Resetear a la primera página al buscar
};

// Filtro de búsqueda
const filteredActividades= actividades.filter((actividad) =>
  actividad.Nombre_actividad_academica.toLowerCase().includes(searchTerm4.toLowerCase())
);

// Lógica de paginación
const indexOfLastRecord4 = currentPage4 * recordsPerPage4;
const indexOfFirstRecord4 = indexOfLastRecord4 - recordsPerPage4;
const currentRecords4 = filteredActividades.slice(indexOfFirstRecord4, indexOfLastRecord4);

// Cambiar página
const paginate4 = (pageNumber) => {
if (pageNumber > 0 && pageNumber <= Math.ceil(filteredActividades.length / recordsPerPage4)) {
  setCurrentPage4(pageNumber);
}
}
//------------------------------------------------------------------------------------------------------


//-------------------Reporte y Excel vista secciones-----------------------------
const generarReporteExcel = () => {
  // Validar que haya datos en la tabla
  if (!secciones || secciones.length === 0) {
    Swal.fire({
      icon: 'info',
      title: 'Tabla vacía',
      text: 'No hay datos disponibles para generar el reporte excel.',
      confirmButtonText: 'Aceptar',
    });
    return; // Salir de la función si no hay datos
  }
  const encabezados = [
    ["Saint Patric'ks Academy"],
    ["Reporte de Secciones"],
    [], // Espacio en blanco
    ["#","Sección", "Grado", "Año Académico"]
  ];

  // Crear filas con asistencias filtradas
  const filas = secciones.map((seccion, index) => [
    index + 1,
    seccion.Nombre_seccion,
    seccion.Nombre_grado,
    seccion.Anio_academico
  ]);

  // Combinar encabezados y filas
  const datos = [...encabezados, ...filas];

  // Crear una hoja de trabajo
  const hojaDeTrabajo = XLSX.utils.aoa_to_sheet(datos);

  // Estilos personalizados para encabezados
  const rangoEncabezado = XLSX.utils.decode_range(hojaDeTrabajo['!ref']);
  for (let row = 0; row <= 3; row++) {
    for (let col = rangoEncabezado.s.c; col <= rangoEncabezado.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
      if (hojaDeTrabajo[cellAddress]) {
        hojaDeTrabajo[cellAddress].s = {
          font: { bold: true, sz: 14, color: { rgb: "FFFFFF" } },
          fill: { fgColor: { rgb: "15401D" } },
          alignment: { horizontal: "center" }
        };
      }
    }
  }

  // Ajustar el ancho de columnas automáticamente
  const ajusteColumnas = [
    { wpx: 100 }, 
    { wpx: 100 }, 
    { wpx: 100 }, 
    { wpx: 100 } ,
    { wpx: 100 }  
  ];

  hojaDeTrabajo['!cols'] = ajusteColumnas;

  // Crear el libro de trabajo
  const libroDeTrabajo = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(libroDeTrabajo, hojaDeTrabajo, "Reporte de Secciones");
  // Guardar el archivo Excel con un nombre fijo
  const nombreArchivo = `Reporte_Secciones.xlsx`;

  XLSX.writeFile(libroDeTrabajo, nombreArchivo);
};

const generarReportePDF = () => {
   // Validar que haya datos en la tabla
   if (!secciones || secciones.length === 0) {
    Swal.fire({
      icon: 'info',
      title: 'Tabla vacía',
      text: 'No hay datos disponibles para generar el reporte.',
      confirmButtonText: 'Aceptar',
    });
    return; // Salir de la función si no hay datos
  }
  const doc = new jsPDF();
  const img = new Image();
  img.src = logo;

  img.onload = () => {
    // Agregar logo
    doc.addImage(img, 'PNG', 10, 10, 30, 30);

    let yPosition = 20; // Posición inicial en el eje Y

    // Título principal
    doc.setFontSize(18);
    doc.setTextColor(0, 102, 51); // Verde
    doc.text('SAINT PATRICK\'S ACADEMY', doc.internal.pageSize.width / 2, yPosition, { align: 'center' });

    yPosition += 12; // Espaciado más amplio para resaltar el título

    // Subtítulo
    doc.setFontSize(16);
    doc.text('Reporte de Secciones', doc.internal.pageSize.width / 2, yPosition, { align: 'center' });

    yPosition += 10; // Espaciado entre subtítulo y detalles

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

    // Configuración para la tabla
    const pageHeight = doc.internal.pageSize.height; // Altura de la página
    let pageNumber = 1; // Página inicial

    // Agregar tabla con auto-paginación
    doc.autoTable({
      startY: yPosition + 4,
      head: [['#', 'Sección', 'Grado','Año Académico']],
      body: secciones.map((seccion, index) => [
        index + 1,
        `${seccion.Nombre_seccion || ''}`.trim(),
        seccion.Nombre_grado,
        seccion.Anio_academico
      ]),
      headStyles: {
        fillColor: [0, 102, 51],
        textColor: [255, 255, 255],
        fontSize: 10,
      },
      styles: {
        fontSize: 10,
        cellPadding: 3,
        halign: 'center', // Centrado del texto en las celdas
      },
      columnStyles: {
        0: { cellWidth: 'auto' }, // Columna '#' se ajusta automáticamente
        1: { cellWidth: 'auto' }, // Columna 'Sección' se ajusta automáticamente
        2: { cellWidth: 'auto' }, // Columna 'Grado' se ajusta automáticamente
        3: { cellWidth: 'auto' }, // Columna 'Año Académico' se ajusta automáticamente
      },
      alternateRowStyles: { fillColor: [240, 248, 255] },
      didDrawPage: (data) => {
        // Pie de página
        const currentDate = new Date();
        const formattedDate = `${currentDate.toLocaleDateString()} ${currentDate.toLocaleTimeString()}`;
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Fecha y hora de generación: ${formattedDate}`, 10, pageHeight - 10);
        const totalPages = doc.internal.getNumberOfPages(); // Obtener el total de páginas
        doc.text(`Página ${pageNumber} de ${totalPages}`, doc.internal.pageSize.width - 30, pageHeight - 10);
        pageNumber += 1; // Incrementar el número de página
      },
    });

    // Abrir el PDF en lugar de descargarlo automáticamente
    window.open(doc.output('bloburl'), '_blank');
  };

  img.onerror = () => {
    console.warn('No se pudo cargar el logo. El PDF se generará sin el logo.');
    // Abrir el PDF sin el logo
    window.open(doc.output('bloburl'), '_blank');
  };
};
//------------------------------------------------------------------------------------------------------



//-------------------Reporte y Excel vista parcial-----------------------------
const generarReporteParcialExcel = () => {
  // Validar que haya datos en la tabla
  if (!parciales || parciales.length === 0) {
    Swal.fire({
      icon: 'info',
      title: 'Tabla vacía',
      text: 'No hay datos disponibles para generar el reporte excel.',
      confirmButtonText: 'Aceptar',
    });
    return; // Salir de la función si no hay datos
  }
  const encabezados = [
    ["Saint Patric'ks Academy"],
    ["Reporte de Parciales"],
    [], // Espacio en blanco
    ["#","Parcial"]
  ];

  // Crear filas con asistencias filtradas
  const filas = parciales.map((parcial, index) => [
    index + 1,
    parcial.Nombre_parcial
  ]);

  // Combinar encabezados y filas
  const datos = [...encabezados, ...filas];

  // Crear una hoja de trabajo
  const hojaDeTrabajo = XLSX.utils.aoa_to_sheet(datos);

  // Estilos personalizados para encabezados
  const rangoEncabezado = XLSX.utils.decode_range(hojaDeTrabajo['!ref']);
  for (let row = 0; row <= 3; row++) {
    for (let col = rangoEncabezado.s.c; col <= rangoEncabezado.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
      if (hojaDeTrabajo[cellAddress]) {
        hojaDeTrabajo[cellAddress].s = {
          font: { bold: true, sz: 14, color: { rgb: "FFFFFF" } },
          fill: { fgColor: { rgb: "15401D" } },
          alignment: { horizontal: "center" }
        };
      }
    }
  }

  // Ajustar el ancho de columnas automáticamente
  const ajusteColumnas = [
    { wpx: 100 }, 
    { wpx: 100 }, 
    { wpx: 100 }, 
    { wpx: 100 } ,
    { wpx: 100 }  
  ];

  hojaDeTrabajo['!cols'] = ajusteColumnas;

  // Crear el libro de trabajo
  const libroDeTrabajo = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(libroDeTrabajo, hojaDeTrabajo, "Reporte de Parciales");
  // Guardar el archivo Excel con un nombre fijo
  const nombreArchivo = `Reporte_Parciales.xlsx`;

  XLSX.writeFile(libroDeTrabajo, nombreArchivo);
};

const generarReporteParcialPDF = () => {
   // Validar que haya datos en la tabla
   if (!parciales || parciales.length === 0) {
    Swal.fire({
      icon: 'info',
      title: 'Tabla vacía',
      text: 'No hay datos disponibles para generar el reporte.',
      confirmButtonText: 'Aceptar',
    });
    return; // Salir de la función si no hay datos
  }
  const doc = new jsPDF();
  const img = new Image();
  img.src = logo;

  img.onload = () => {
    // Agregar logo
    doc.addImage(img, 'PNG', 10, 10, 30, 30);

    let yPosition = 20; // Posición inicial en el eje Y

    // Título principal
    doc.setFontSize(18);
    doc.setTextColor(0, 102, 51); // Verde
    doc.text('SAINT PATRICK\'S ACADEMY', doc.internal.pageSize.width / 2, yPosition, { align: 'center' });

    yPosition += 12; // Espaciado más amplio para resaltar el título

    // Subtítulo
    doc.setFontSize(16);
    doc.text('Reporte de Parciales', doc.internal.pageSize.width / 2, yPosition, { align: 'center' });

    yPosition += 10; // Espaciado entre subtítulo y detalles

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

    // Configuración para la tabla
    const pageHeight = doc.internal.pageSize.height; // Altura de la página
    let pageNumber = 1; // Página inicial

    // Agregar tabla con auto-paginación
    doc.autoTable({
      startY: yPosition + 4,
      head: [['#', 'Parcial']],
      body: parciales.map((parcial, index) => [
        index + 1,
        `${parcial.Nombre_parcial || ''}`.trim()
      ]),
      headStyles: {
        fillColor: [0, 102, 51],
        textColor: [255, 255, 255],
        fontSize: 10,
      },
      styles: {
        fontSize: 10,
        cellPadding: 3,
        halign: 'center', // Centrado del texto en las celdas
      },
      columnStyles: {
        0: { cellWidth: 'auto' }, // Columna '#' se ajusta automáticamente
        1: { cellWidth: 'auto' }, // Columna 'Sección' se ajusta automáticamente
        2: { cellWidth: 'auto' }, // Columna 'Grado' se ajusta automáticamente
        3: { cellWidth: 'auto' }, // Columna 'Año Académico' se ajusta automáticamente
      },
      alternateRowStyles: { fillColor: [240, 248, 255] },
      didDrawPage: (data) => {
        // Pie de página
        const currentDate = new Date();
        const formattedDate = `${currentDate.toLocaleDateString()} ${currentDate.toLocaleTimeString()}`;
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Fecha y hora de generación: ${formattedDate}`, 10, pageHeight - 10);
        const totalPages = doc.internal.getNumberOfPages(); // Obtener el total de páginas
        doc.text(`Página ${pageNumber} de ${totalPages}`, doc.internal.pageSize.width - 30, pageHeight - 10);
        pageNumber += 1; // Incrementar el número de página
      },
    });

    // Abrir el PDF en lugar de descargarlo automáticamente
    window.open(doc.output('bloburl'), '_blank');
  };

  img.onerror = () => {
    console.warn('No se pudo cargar el logo. El PDF se generará sin el logo.');
    // Abrir el PDF sin el logo
    window.open(doc.output('bloburl'), '_blank');
  };
};
//------------------------------------------------------------------------------------------------------
const formatFechaHora = (fechaHora) => {
  const fecha = new Date(fechaHora);
  const opciones = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  };
  return fecha.toLocaleDateString('es-ES', opciones).replace(',', '');
};
//-------------------Reporte y Excel vista actividades-----------------------------
const generarReporteActividadesExcel = () => {
  // Validar que haya datos en la tabla
  if (!actividades || actividades.length === 0) {
    Swal.fire({
      icon: 'info',
      title: 'Tabla vacía',
      text: 'No hay datos disponibles para generar el reporte excel.',
      confirmButtonText: 'Aceptar',
    });
    return; // Salir de la función si no hay datos
  }
   // Detalles dinámicos sobre la sección, asignatura, parcial y año
   const detalles = [];
   if (selectedSeccion?.Nombre_seccion && selectedAsignatura?.Nombre_asignatura && selectedParcial?.Nombre_parcial) {
     detalles.push([`Sección: ${selectedSeccion.Nombre_seccion} | Asignatura: ${selectedAsignatura.Nombre_asignatura} | Parcial: ${selectedParcial.Nombre_parcial}`]);
   } else if (selectedSeccion?.Nombre_seccion && anioSeccionSeleccionada) {
     detalles.push([`Sección: ${selectedSeccion.Nombre_seccion} | Año: ${anioSeccionSeleccionada}`]);
   } else if (selectedAsignatura?.Nombre_asignatura) {
     detalles.push([`Asignatura: ${selectedAsignatura.Nombre_asignatura}`]);
   }
 
   detalles.push([]); // Espacio en blanco después de los detalles
  const encabezados = [
    ["Saint Patric'ks Academy"],
    ["Reporte de Actividades"],
    [], // Espacio en blanco
    ["#","Nombre Actividad", "Descripción", "FechayHora_Inicio","FechayHora_Fin","Valor"]
  ];

  // Crear filas con asistencias filtradas
  const filas = actividades.map((actividad, index) => [
    index + 1,
    actividad.Nombre_actividad_academica,
    actividad.Descripcion,
    formatFechaHora(actividad.Fechayhora_Inicio),
    formatFechaHora(actividad.Fechayhora_Fin),
    actividad.Valor
  ]);

  // Combinar encabezados y filas
  const datos = [...detalles,...encabezados,  ...filas];

  // Crear una hoja de trabajo
  const hojaDeTrabajo = XLSX.utils.aoa_to_sheet(datos);

  // Estilos personalizados para encabezados
  const rangoEncabezado = XLSX.utils.decode_range(hojaDeTrabajo['!ref']);
  for (let row = 0; row <= 3; row++) {
    for (let col = rangoEncabezado.s.c; col <= rangoEncabezado.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
      if (hojaDeTrabajo[cellAddress]) {
        hojaDeTrabajo[cellAddress].s = {
          font: { bold: true, sz: 14, color: { rgb: "FFFFFF" } },
          fill: { fgColor: { rgb: "15401D" } },
          alignment: { horizontal: "center" }
        };
      }
    }
  }

  // Ajustar el ancho de columnas automáticamente
  const ajusteColumnas = [
    { wpx: 100 },
    { wpx: 150 },
    { wpx: 200 },
    { wpx: 150 },
    { wpx: 150 },
    { wpx: 100 }
  ];

  hojaDeTrabajo['!cols'] = ajusteColumnas;

  // Crear el libro de trabajo
  const libroDeTrabajo = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(libroDeTrabajo, hojaDeTrabajo, "Reporte de Actividades");
  // Guardar el archivo Excel con un nombre fijo
  const nombreArchivo = `Reporte_Actividades.xlsx`;

  XLSX.writeFile(libroDeTrabajo, nombreArchivo);
};

const generarReporteActividadesPDF = () => {
  // Validar que haya datos filtrados
  if (!filteredActividades || filteredActividades.length === 0) {
    Swal.fire({
      icon: 'info',
      title: 'Sin datos',
      text: 'No hay datos disponibles para generar el reporte.',
      confirmButtonText: 'Aceptar',
    });
    return; // Salir de la función si no hay datos
  }

  // Calcular el total de los valores
  const totalValor = filteredActividades.reduce((total, actividad) => total + parseFloat(actividad.Valor || 0), 0).toFixed(2);

  // Crear el PDF en orientación horizontal
  const doc = new jsPDF('landscape');
  const img = new Image();
  img.src = logo;

  img.onload = () => {
    // Agregar logo
    doc.addImage(img, 'PNG', 10, 10, 30, 30);

    let yPosition = 20; // Posición inicial en el eje Y

    // Título principal
    doc.setFontSize(18);
    doc.setTextColor(0, 102, 51); // Verde
    doc.text('SAINT PATRICK\'S ACADEMY', doc.internal.pageSize.width / 2, yPosition, { align: 'center' });

    yPosition += 10;

    // Información adicional
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('Casa Club del periodista, Colonia del Periodista', doc.internal.pageSize.width / 2, yPosition, { align: 'center' });

    yPosition += 4;
    doc.text('Teléfono: (504) 2234-8871', doc.internal.pageSize.width / 2, yPosition, { align: 'center' });

    yPosition += 4;
    doc.text('Correo: info@saintpatrickacademy.edu', doc.internal.pageSize.width / 2, yPosition, { align: 'center' });

    yPosition += 10;

    // Subtítulo
    doc.setTextColor(0, 102, 51); // Verde
    doc.setFontSize(16);
    doc.text('Reporte de Actividades Académicas', doc.internal.pageSize.width / 2, yPosition, { align: 'center' });

    yPosition += 10;

    // Detalles dinámicos sobre la sección, asignatura, parcial y año
    doc.setFontSize(12);
    doc.setTextColor(0, 102, 51); // Verde
    doc.setFont('helvetica', 'bold'); // Negrita
    if (selectedSeccion?.Nombre_seccion && selectedAsignatura?.Nombre_asignatura && selectedParcial?.Nombre_parcial) {
      doc.text(
        `Sección: ${selectedSeccion.Nombre_seccion} | Asignatura: ${selectedAsignatura.Nombre_asignatura} | Parcial: ${selectedParcial.Nombre_parcial}`,
        doc.internal.pageSize.width / 2,
        yPosition,
        { align: 'center' }
      );
    }

    yPosition += 10;

    // Línea divisoria
    doc.setLineWidth(0.5);
    doc.setDrawColor(0, 102, 51);
    doc.line(10, yPosition, doc.internal.pageSize.width - 10, yPosition);

    yPosition += 6; // Espaciado antes de la tabla

    // Configuración para la tabla
    const pageHeight = doc.internal.pageSize.height; // Altura de la página
    let pageNumber = 1; // Página inicial

    // Crear el cuerpo de la tabla
    const body = filteredActividades.map((actividad, index) => [
      index + 1,
      actividad.Nombre_actividad_academica || '',
      actividad.Descripcion || '',
      listaponderacionesC.find((ponderacion) => ponderacion.Cod_ponderacion_ciclo === actividad.Cod_ponderacion_ciclo)?.Descripcion_ponderacion || "N/A",
      actividad.Fechayhora_Inicio
        ? new Date(actividad.Fechayhora_Inicio).toLocaleString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })
        : 'N/A',
      actividad.Fechayhora_Fin
        ? new Date(actividad.Fechayhora_Fin).toLocaleString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })
        : 'N/A',
      actividad.Valor,
    ]);

 

    // Generar la tabla
    doc.autoTable({
      startY: yPosition,
      head: [['#', 'Nombre Actividad', 'Descripción', 'Ponderación', 'Inicio', 'Fin', 'Valor']],
      body: body,
      headStyles: {
        fillColor: [0, 102, 51],
        textColor: [255, 255, 255],
        fontSize: 9,
      },
      styles: {
        fontSize: 8,
        cellPadding: 2,
        overflow: 'linebreak',
        valign: 'middle',
      },



      foot: [['', '', '', '', '', 'Total:', totalValor]], // Añadir fila total al pie de la tabla
      headStyles: {
        fillColor: [0, 102, 51], // Verde para el encabezado
        textColor: [255, 255, 255],
        fontSize: 9,
      },
      styles: {
        fontSize: 8,
        cellPadding: 2,
        overflow: 'linebreak',
        valign: 'middle',
      },
      footStyles: {
        fillColor: [0, 102, 51], // Verde para la fila del pie
        textColor: [255, 255, 255], // Texto en blanco para contraste
        fontSize: 10,
      },
      columnStyles: {
        0: { cellWidth: 10 }, // Columna '#'
        1: { cellWidth: 50 }, // 'Nombre Actividad'
        2: { cellWidth: 60 }, // 'Descripción'
        3: { cellWidth: 50 }, // 'Ponderación'
        4: { cellWidth: 40 }, // 'Inicio'
        5: { cellWidth: 40 }, // 'Fin'
        6: { cellWidth: 20 }, // 'Valor'
      },
      tableWidth: 'auto', // Ajustar tabla automáticamente al ancho disponible
      margin: { left: 10, right: 10 },
      didDrawPage: (data) => {
        const currentDate = new Date();
        const formattedDate = `${currentDate.toLocaleDateString()} ${currentDate.toLocaleTimeString()}`;
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Fecha y hora de generación: ${formattedDate}`, 10, pageHeight - 10);
        const totalPages = doc.internal.getNumberOfPages();
        doc.text(`Página ${pageNumber} de ${totalPages}`, doc.internal.pageSize.width - 30, pageHeight - 10);
        pageNumber += 1;
      },
    });

    // Abrir el PDF
    window.open(doc.output('bloburl'), '_blank');
  };

  img.onerror = () => {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'No se pudo cargar el logo para el reporte.',
    });
  };
};




  // Verificar permisos
  if (!canSelect) {
    return <AccessDenied />;
  }
  const calcularTotalValor = () => {
    return actividades.reduce((total, actividad) => total + parseFloat(actividad?.Valor || 0), 0).toFixed(2);
  };
  


//------------------------------------------------------------------------------------------------------

  return (
    <CContainer>
      {/* Secciones */}
      {vistaActual === "secciones" && (
        <div>
        <CRow className="align-items-center mb-5">
          <CCol xs="12" className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
            <div className="flex-grow-1 text-center">
             <h4 className="text-center fw-semibold pb-2 mb-0" style={{ display: 'inline-block', borderBottom: '2px solid #4CAF50' }}>Actividades: Mis Secciones</h4>
             </div>
             <CDropdown className="btn-sm d-flex align-items-center gap-1 rounded shadow">
                <CDropdownToggle
                  style={{backgroundColor: '#6C8E58',color: 'white',fontSize: '0.85rem',cursor: 'pointer',transition: 'all 0.3s ease', }}
                  onMouseEnter={(e) => {e.currentTarget.style.backgroundColor = '#5A784C'; e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';  }}
                  onMouseLeave={(e) => {e.currentTarget.style.backgroundColor = '#6C8E58'; e.currentTarget.style.boxShadow = 'none'; }}>
                  <CIcon icon={cilDescription} />  Reporte
                </CDropdownToggle>
                <CDropdownMenu style={{position: "absolute", zIndex: 1050, /* Asegura que el menú esté por encima de otros elementos*/ backgroundColor: "#fff",boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.2)",borderRadius: "4px",overflow: "hidden",}}>
                  <CDropdownItem
                    onClick={generarReportePDF}
                    style={{cursor: "pointer",outline: "none",backgroundColor: "transparent",padding: "0.5rem 1rem",fontSize: "0.85rem",color: "#333",borderBottom: "1px solid #eaeaea",transition: "background-color 0.3s",}}
                    onMouseOver={(e) =>(e.target.style.backgroundColor = "#f5f5f5")} onMouseOut={(e) =>(e.target.style.backgroundColor = "transparent")}>
                    <CIcon icon={cilFile} size="sm" /> Abrir en PDF
                  </CDropdownItem>
                  <CDropdownItem
                    onClick={generarReporteExcel}
                    style={{cursor: "pointer",outline: "none",backgroundColor: "transparent",padding: "0.5rem 1rem",fontSize: "0.85rem",color: "#333",transition: "background-color 0.3s",}}
                    onMouseOver={(e) =>(e.target.style.backgroundColor = "#f5f5f5")}
                    onMouseOut={(e) =>(e.target.style.backgroundColor = "transparent")}>
                    <CIcon icon={cilSpreadsheet} size="sm" /> Descargar Excel
                  </CDropdownItem>
                </CDropdownMenu>
              </CDropdown>
          </CCol>
        </CRow>
        {/* Contenedor de la barra de búsqueda y el selector dinámico */}
    <CRow className="align-items-center mt-4 mb-2">
      {/* Barra de búsqueda  */}
      <CCol xs="12" md="8" className="d-flex flex-wrap align-items-center">
        <CInputGroup className="me-3" style={{ width: '350px' }}>
          <CInputGroupText>
            <CIcon icon={cilSearch} />
          </CInputGroupText>
          <CFormInput
          style={{ width: '80px',height:'35px', display: 'inline-block'}}
            placeholder="Buscar sección..."
            onChange={handleSearch}
            value={searchTerm}
          />
          <CButton
            style={{border: '1px solid #ccc',
              transition: 'all 0.1s ease-in-out', // Duración de la transición
              backgroundColor: '#F3F4F7', // Color por defecto
              color: '#343a40', // Color de texto por defecto
              height:'35px'
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

      {/* Selector dinámico a la par de la barra de búsqueda */}
      <CCol xs="12" md="4" className="text-md-end mt-2 mt-md-0">
        <CInputGroup style={{ width: 'auto', display: 'inline-block' }}>
          <div className="d-inline-flex align-items-center">
            <span style={{ fontSize: '0.85rem' }}>Mostrar&nbsp;</span>
              <CFormSelect
                style={{ width: '80px',height:'35px', display: 'inline-block', textAlign: 'center' }}
                onChange={(e) => {
                const value = Number(e.target.value);
                setRecordsPerPage(value);
                setCurrentPage(1); // Reiniciar a la primera página cuando se cambia el número de registros
              }}
                value={recordsPerPage}
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
              </CFormSelect>
            <span style={{ fontSize: '0.85rem' }}>&nbsp;registros</span>
          </div>       
       </CInputGroup>
     </CCol>
    </CRow>
        <div className="table-responsive"style={{maxHeight: '400px',margin: '0 auto',overflowX: 'auto',overflowY: 'auto',boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)', }}>
          <CTable striped bordered hover responsive>
            <CTableHead className="sticky-top bg-light text-center" style={{ fontSize: '0.8rem' }}>
              <CTableRow>
               <CTableHeaderCell>#</CTableHeaderCell>
                <CTableHeaderCell>NOMBRE</CTableHeaderCell>
                <CTableHeaderCell>GRADO</CTableHeaderCell>
                <CTableHeaderCell>AÑO ACADÉMICO</CTableHeaderCell>
                <CTableHeaderCell >ACCIÓN</CTableHeaderCell>
                
              </CTableRow>
            </CTableHead>
            <CTableBody className="text-center" style={{ fontSize: '0.85rem' }}>
              {currentRecords.map((seccion, index) => (
                <CTableRow key={seccion.Cod_secciones}>
                  <CTableDataCell >{index + 1}</CTableDataCell>
                  <CTableDataCell>{seccion.Nombre_seccion}</CTableDataCell>
                  <CTableDataCell>{seccion.Nombre_grado}</CTableDataCell>
                  <CTableDataCell>{seccion.Anio_academico}</CTableDataCell>
                 
                  <CTableDataCell>
                    <CButton 
                    size="sm"
                    style={{
                      backgroundColor: '#F0F4F3',
                      color: '#153E21',
                      border: '1px solid #A2B8A9',
                      borderRadius: '6px',
                      padding: '5px 12px',
                      boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
                    }}
                    onMouseEnter={(e) => (e.target.style.backgroundColor = '#dce3dc')}
                    onMouseLeave={(e) => (e.target.style.backgroundColor = '#F0F4F3')}
                    onClick={() => handleSeleccionarSeccion(seccion)}>Gestionar Asignaturas</CButton>
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
        </div>
        {/* Paginación Fija */}
    <div style={{ display: 'flex',  justifyContent: 'center', alignItems: 'center', marginTop: '16px' }}>
      <CPagination aria-label="Page navigation" style={{ display: 'flex', gap: '10px' }}>
        <CButton
          style={{ backgroundColor: '#6f8173', color: '#D9EAD3' }}
          disabled={currentPage === 1} // Deshabilitar si estás en la primera página
          onClick={() => paginate(currentPage - 1)}>
          Anterior
        </CButton>
        <CButton
          style={{ marginLeft: '10px',backgroundColor: '#6f8173', color: '#D9EAD3' }}
          disabled={currentPage === Math.ceil(filteredSecciones.length / recordsPerPage)} // Deshabilitar si estás en la última página
          onClick={() => paginate(currentPage + 1)}>
          Siguiente
       </CButton>
     </CPagination>
      {/* Mostrar total de páginas */}
      <span style={{ marginLeft: '10px' }}>
        Página {currentPage} de {Math.ceil(filteredSecciones.length / recordsPerPage)}
      </span>
   </div>

        </div>
      )}

      {/* Asignaturas */}
      {vistaActual === "asignaturas" && selectedSeccion && (

    <div>
        <CRow className="align-items-center mb-5">

            <CCol xs="12" className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
                <CButton className="btn btn-sm d-flex align-items-center gap-1 rounded shadow"
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#4B4B4B")} onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#656565")}
          style={{backgroundColor: "#656565",color: "#FFFFFF",padding: "6px 12px",fontSize: "0.9rem",transition: "background-color 0.2s ease, box-shadow 0.3s ease",boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",}}
                onClick={handleRegresar}>
               <CIcon icon={cilArrowLeft} /> Regresar a secciones
                </CButton>
                <div className="d-flex justify-content-center align-items-center flex-grow-1">
                <h4 className="text-center fw-semibold pb-2 mb-0" style={{display: "inline-block", borderBottom: "2px solid #4CAF50", margin: "0 auto",}}>Asignaturas de la Sección: {selectedSeccion.Nombre_seccion}</h4>
                </div>
            </CCol>
        </CRow>
         {/* Contenedor de la barra de búsqueda y el selector dinámico */}
    <CRow className="align-items-center mt-4 mb-2">
      {/* Barra de búsqueda  */}
      <CCol xs="12" md="8" className="d-flex flex-wrap align-items-center">
        <CInputGroup className="me-3" style={{ width: '350px' }}>
          <CInputGroupText>
            <CIcon icon={cilSearch} />
          </CInputGroupText>
          <CFormInput
          style={{ width: '80px',height:'35px', display: 'inline-block'}}
            placeholder="Buscar Asignatura..."
            onChange={handleSearch2}
            value={searchTerm2}
          />
          <CButton
            style={{border: '1px solid #ccc',
              transition: 'all 0.1s ease-in-out', // Duración de la transición
              backgroundColor: '#F3F4F7', // Color por defecto
              color: '#343a40', // Color de texto por defecto
              height:'35px'
            }}
            onClick={() => {
              setSearchTerm2('');
              setCurrentPage2(1);
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

      {/* Selector dinámico a la par de la barra de búsqueda */}
      <CCol xs="12" md="4" className="text-md-end mt-2 mt-md-0">
        <CInputGroup style={{ width: 'auto', display: 'inline-block' }}>
          <div className="d-inline-flex align-items-center">
            <span style={{ fontSize: '0.85rem' }}>Mostrar&nbsp;</span>
              <CFormSelect
                style={{ width: '80px',height:'35px', display: 'inline-block', textAlign: 'center' }}
                onChange={(e) => {
                const value = Number(e.target.value);
                setRecordsPerPage2(value);
                setCurrentPage2(1); // Reiniciar a la primera página cuando se cambia el número de registros
              }}
                value={recordsPerPage}
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
              </CFormSelect>
            <span style={{ fontSize: '0.85rem' }}>&nbsp;registros</span>
          </div>       
       </CInputGroup>
     </CCol>
    </CRow>
        <div className="table-responsive"style={{maxHeight: '400px',overflowX: 'auto',overflowY: 'auto',boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)',}}>
        <CTable striped bordered hover responsive>
            <CTableHead className="sticky-top bg-light text-center" style={{ fontSize: '0.8rem' }}>
                <CTableRow>
                   <CTableHeaderCell>#</CTableHeaderCell>
                    <CTableHeaderCell>NOMBRE DE LA ASIGNATURA</CTableHeaderCell>
                    <CTableHeaderCell>DESCRIPCIÓN</CTableHeaderCell>
                    <CTableHeaderCell style={{ width: '180px', textAlign: 'center' }}>ACCIÓN</CTableHeaderCell>
                </CTableRow>
            </CTableHead>
            <CTableBody className="text-center" style={{ fontSize: '0.85rem' }}>
                {currentRecords2.map((asignatura, index) => (
                    <CTableRow key={asignatura.Cod_asignatura}>
                      <CTableDataCell>{index + 1}</CTableDataCell>
                        <CTableDataCell>{asignatura.Nombre_asignatura}</CTableDataCell>
                        <CTableDataCell>{asignatura.Descripcion_asignatura}</CTableDataCell>
                        <CTableDataCell>
                            <CButton 
                                 size="sm"
                                 style={{
                                   backgroundColor: '#F0F4F3',
                                   color: '#153E21',
                                   border: '1px solid #A2B8A9',
                                   borderRadius: '6px',
                                   padding: '5px 12px',
                                   boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
                                 }}
                                 onMouseEnter={(e) => (e.target.style.backgroundColor = '#dce3dc')}
                                 onMouseLeave={(e) => (e.target.style.backgroundColor = '#F0F4F3')}
                                onClick={() => handleSeleccionarAsignatura(asignatura)}>
                                Gestionar Parciales
                            </CButton>
                        </CTableDataCell>
                    </CTableRow>
                ))}
            </CTableBody>
        </CTable>
    </div>
    {/* Paginación Fija */}
    <div style={{ display: 'flex',  justifyContent: 'center', alignItems: 'center', marginTop: '16px' }}>
      <CPagination aria-label="Page navigation" style={{ display: 'flex', gap: '10px' }}>
        <CButton
          style={{ backgroundColor: '#6f8173', color: '#D9EAD3' }}
          disabled={currentPage2 === 1} // Deshabilitar si estás en la primera página
          onClick={() => paginate2(currentPage2 - 1)}>
          Anterior
        </CButton>
        <CButton
          style={{ marginLeft: '10px',backgroundColor: '#6f8173', color: '#D9EAD3' }}
          disabled={currentPage2 === Math.ceil(filteredAsignaturas.length / recordsPerPage2)} // Deshabilitar si estás en la última página
          onClick={() => paginate2(currentPage2 + 1)}>
          Siguiente
       </CButton>
     </CPagination>
      {/* Mostrar total de páginas */}
      <span style={{ marginLeft: '10px' }}>
        Página {currentPage2} de {Math.ceil(filteredAsignaturas.length / recordsPerPage2)}
      </span>
   </div>
    </div>
)}




{vistaActual === "parciales" &&   (
    <div>
       <CRow className="align-items-center mb-5">
            <CCol xs="12" className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
                <CButton className="btn btn-sm d-flex align-items-center gap-1 rounded shadow"
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#4B4B4B")} onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#656565")}
          style={{backgroundColor: "#656565",color: "#FFFFFF",padding: "6px 12px",fontSize: "0.9rem",transition: "background-color 0.2s ease, box-shadow 0.3s ease",boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",}}
                onClick={handleRegresar}>
                <CIcon icon={cilArrowLeft}/>Regresar a asignatura
                </CButton>
                <div className="d-flex justify-content-center align-items-center flex-grow-1">
                <h4 className="text-center fw-semibold pb-2 mb-0" style={{display: "inline-block", borderBottom: "2px solid #4CAF50", margin: "0 auto",fontSize: "1.5rem"}}> Seccion: {selectedSeccion.Nombre_seccion} / Asignatura: {selectedAsignatura.Nombre_asignatura} / Parciales:  </h4>
                </div>
                <CDropdown className="btn-sm d-flex align-items-center gap-1 rounded shadow">
                <CDropdownToggle
                  style={{backgroundColor: '#6C8E58',color: 'white',fontSize: '0.85rem',cursor: 'pointer',transition: 'all 0.3s ease', }}
                  onMouseEnter={(e) => {e.currentTarget.style.backgroundColor = '#5A784C'; e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';  }}
                  onMouseLeave={(e) => {e.currentTarget.style.backgroundColor = '#6C8E58'; e.currentTarget.style.boxShadow = 'none'; }}>
                  <CIcon icon={cilDescription} />  Reporte
                </CDropdownToggle>
                <CDropdownMenu style={{position: "absolute", zIndex: 1050, /* Asegura que el menú esté por encima de otros elementos*/ backgroundColor: "#fff",boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.2)",borderRadius: "4px",overflow: "hidden",}}>
                  <CDropdownItem
                    onClick={generarReporteParcialPDF}
                    style={{cursor: "pointer",outline: "none",backgroundColor: "transparent",padding: "0.5rem 1rem",fontSize: "0.85rem",color: "#333",borderBottom: "1px solid #eaeaea",transition: "background-color 0.3s",}}
                    onMouseOver={(e) =>(e.target.style.backgroundColor = "#f5f5f5")} onMouseOut={(e) =>(e.target.style.backgroundColor = "transparent")}>
                    <CIcon icon={cilFile} size="sm" /> Abrir en PDF
                  </CDropdownItem>
                  <CDropdownItem
                    onClick={generarReporteParcialExcel}
                    style={{cursor: "pointer",outline: "none",backgroundColor: "transparent",padding: "0.5rem 1rem",fontSize: "0.85rem",color: "#333",transition: "background-color 0.3s",}}
                    onMouseOver={(e) =>(e.target.style.backgroundColor = "#f5f5f5")}
                    onMouseOut={(e) =>(e.target.style.backgroundColor = "transparent")}>
                    <CIcon icon={cilSpreadsheet} size="sm" /> Descargar Excel
                  </CDropdownItem>
                </CDropdownMenu>
              </CDropdown>
            </CCol>
        </CRow>
        {/* Contenedor de la barra de búsqueda y el selector dinámico */}
    <CRow className="align-items-center mt-4 mb-2">
      {/* Barra de búsqueda  */}
      <CCol xs="12" md="8" className="d-flex flex-wrap align-items-center">
        <CInputGroup className="me-3" style={{ width: '350px' }}>
          <CInputGroupText>
            <CIcon icon={cilSearch} />
          </CInputGroupText>
          <CFormInput
          style={{ width: '80px',height:'35px', display: 'inline-block'}}
            placeholder="Buscar parcial..."
            onChange={handleSearch3}
            value={searchTerm3}
          />
          <CButton
            style={{border: '1px solid #ccc',
              transition: 'all 0.1s ease-in-out', // Duración de la transición
              backgroundColor: '#F3F4F7', // Color por defecto
              color: '#343a40', // Color de texto por defecto
              height:'35px'
            }}
            onClick={() => {
              setSearchTerm3('');
              setCurrentPage3(1);
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

      {/* Selector dinámico a la par de la barra de búsqueda */}
      <CCol xs="12" md="4" className="text-md-end mt-2 mt-md-0">
        <CInputGroup style={{ width: 'auto', display: 'inline-block' }}>
          <div className="d-inline-flex align-items-center">
            <span style={{ fontSize: '0.85rem' }}>Mostrar&nbsp;</span>
              <CFormSelect
                style={{ width: '80px',height:'35px', display: 'inline-block', textAlign: 'center' }}
                onChange={(e) => {
                const value = Number(e.target.value);
                setRecordsPerPage3(value);
                setCurrentPage3(1); // Reiniciar a la primera página cuando se cambia el número de registros
              }}
                value={recordsPerPage3}
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
              </CFormSelect>
            <span style={{ fontSize: '0.85rem' }}>&nbsp;registros</span>
          </div>       
       </CInputGroup>
     </CCol>
    </CRow>
        <div className="table-responsive" style={{maxHeight: '400px',overflowX: 'auto',overflowY: 'auto', boxShadow: "0 4px 10px rgba(0, 0, 0, 0.3)"}}>    
        <CTable striped bordered hover responsive>
            <CTableHead  className="sticky-top bg-light text-center" style={{ fontSize: '0.8rem' }}>
                <CTableRow>
                <CTableHeaderCell>#</CTableHeaderCell>
                    <CTableHeaderCell>PARCIAL</CTableHeaderCell>
                    <CTableHeaderCell style={{ width: '180px', textAlign: 'center' }}>ACCIÓN</CTableHeaderCell>
                </CTableRow>
            </CTableHead>
            <CTableBody className="text-center" style={{ fontSize: '0.85rem' }}>
            {parciales.length > 0 ? (
    currentRecords3.map((parcial, index) => (
      <CTableRow key={parcial.Cod_parcial}>
        <CTableDataCell>{index + 1}</CTableDataCell>
        <CTableDataCell>{parcial.Nombre_parcial}</CTableDataCell>
        <CTableDataCell>
          <CButton
            size="sm"
            style={{
              backgroundColor: '#F0F4F3',
              color: '#153E21',
              border: '1px solid #A2B8A9',
              borderRadius: '6px',
              padding: '5px 12px',
              boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
            }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = '#dce3dc')}
            onMouseLeave={(e) => (e.target.style.backgroundColor = '#F0F4F3')}
            onClick={() => handleGestionarActividades(parcial)}
          >
            Gestionar Actividades
          </CButton>
        </CTableDataCell>
      </CTableRow>
    ))
  ) : (
    <CTableRow>
      <CTableDataCell colSpan="4">No hay parciales disponibles.</CTableDataCell>
    </CTableRow>
  )}
</CTableBody>
        </CTable>
    </div>
    {/* Paginación Fija */}
    <div style={{ display: 'flex',  justifyContent: 'center', alignItems: 'center', marginTop: '16px' }}>
      <CPagination aria-label="Page navigation" style={{ display: 'flex', gap: '10px' }}>
        <CButton
          style={{ backgroundColor: '#6f8173', color: '#D9EAD3' }}
          disabled={currentPage3 === 1} // Deshabilitar si estás en la primera página
          onClick={() => paginate3(currentPage3 - 1)}>
          Anterior
        </CButton>
        <CButton
          style={{ marginLeft: '10px',backgroundColor: '#6f8173', color: '#D9EAD3' }}
          disabled={currentPage3 === Math.ceil(filteredParciales.length / recordsPerPage3)} // Deshabilitar si estás en la última página
          onClick={() => paginate3(currentPage3 + 1)}>
          Siguiente
       </CButton>
     </CPagination>
      {/* Mostrar total de páginas */}
      <span style={{ marginLeft: '10px' }}>
        Página {currentPage3} de {Math.ceil(filteredParciales.length / recordsPerPage3)}
      </span>
   </div>

    </div>
)}






      {/* Actividades */}
      {vistaActual === "actividades" && (
    <div>
      
        {/* Botones Regresar y Nuevo */}
        <CRow className="align-items-center mb-5">
        <CCol xs="12" className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
                <CButton lassName="btn btn-sm d-flex align-items-center gap-1 rounded shadow"
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#4B4B4B")} onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#656565")}
          style={{backgroundColor: "#656565",color: "#FFFFFF",padding: "6px 12px",fontSize: "0.9rem",transition: "background-color 0.2s ease, box-shadow 0.3s ease",boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",}}
                onClick={handleRegresar}>
                <CIcon icon={cilArrowLeft} /> Regresar a parciales
                </CButton>
                <div className="d-flex justify-content-center align-items-center flex-grow-1">
                <h4 className="text-center fw-semibold pb-2 mb-0" style={{display: "inline-block", borderBottom: "2px solid #4CAF50", margin: "0 auto",fontSize: "1.5rem",}}> Seccion: {selectedSeccion.Nombre_seccion} / Asignatura: {selectedAsignatura.Nombre_asignatura} / Parcial: {selectedParcial.Nombre_parcial}</h4>
                </div>
               


                {canInsert && (
                <CButton
                  className="btn btn-sm d-flex align-items-center gap-1 rounded shadow"
                  onClick={handleAbrirModal} // Asegúrate de que este método está siendo llamado aquí
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#3C4B43")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#4B6251")}
                  style={{
                    backgroundColor: "#4B6251",
                    color: "#FFFFFF",
                    padding: "5px 10px",
                    fontSize: "0.9rem",
                  }}
                >
                  <CIcon icon={cilPlus} className="me-2" />
                  Nuevo
                </CButton>
                 )}
                <CDropdown className="btn-sm d-flex align-items-center gap-1 rounded shadow">
                <CDropdownToggle
                  style={{backgroundColor: '#6C8E58',color: 'white',fontSize: '0.85rem',cursor: 'pointer',transition: 'all 0.3s ease', }}
                  onMouseEnter={(e) => {e.currentTarget.style.backgroundColor = '#5A784C'; e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';  }}
                  onMouseLeave={(e) => {e.currentTarget.style.backgroundColor = '#6C8E58'; e.currentTarget.style.boxShadow = 'none'; }}>
                  <CIcon icon={cilDescription} />  Reporte
                </CDropdownToggle>
                <CDropdownMenu style={{position: "absolute", zIndex: 1050, /* Asegura que el menú esté por encima de otros elementos*/ backgroundColor: "#fff",boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.2)",borderRadius: "4px",overflow: "hidden",}}>
                  <CDropdownItem
                    onClick={generarReporteActividadesPDF}
                    style={{cursor: "pointer",outline: "none",backgroundColor: "transparent",padding: "0.5rem 1rem",fontSize: "0.85rem",color: "#333",borderBottom: "1px solid #eaeaea",transition: "background-color 0.3s",}}
                    onMouseOver={(e) =>(e.target.style.backgroundColor = "#f5f5f5")} onMouseOut={(e) =>(e.target.style.backgroundColor = "transparent")}>
                    <CIcon icon={cilFile} size="sm" /> Abrir en PDF
                  </CDropdownItem>
                  <CDropdownItem
                    onClick={generarReporteActividadesExcel}
                    style={{cursor: "pointer",outline: "none",backgroundColor: "transparent",padding: "0.5rem 1rem",fontSize: "0.85rem",color: "#333",transition: "background-color 0.3s",}}
                    onMouseOver={(e) =>(e.target.style.backgroundColor = "#f5f5f5")}
                    onMouseOut={(e) =>(e.target.style.backgroundColor = "transparent")}>
                    <CIcon icon={cilSpreadsheet} size="sm" /> Descargar Excel
                  </CDropdownItem>
                </CDropdownMenu>
              </CDropdown>
            </CCol>
            
        </CRow>
        <CRow>
       <div className="d-flex justify-content-center align-items-center flex-grow-1">
                  <h2 className="text-center fw-semibold pb-2 mb-0" style={{display: "inline-block", borderBottom: "2px solid #4CAF50", margin: "0 auto",fontSize: "1.5rem",}}>Actividades Academicas</h2>
                </div>
       </CRow>
         {/* Contenedor de la barra de búsqueda y el selector dinámico */}
    <CRow className="align-items-center mt-4 mb-2">
  
      {/* Barra de búsqueda  */}
      <CCol xs="12" md="8" className="d-flex flex-wrap align-items-center">
        <CInputGroup className="me-3" style={{ width: '350px' }}>
          <CInputGroupText>
            <CIcon icon={cilSearch} />
          </CInputGroupText>
          <CFormInput
          style={{ width: '80px',height:'35px', display: 'inline-block'}}
            placeholder="Buscar actividad..."
            onChange={handleSearch4}
            value={searchTerm4}
          />
          <CButton
            style={{border: '1px solid #ccc',
              transition: 'all 0.1s ease-in-out', // Duración de la transición
              backgroundColor: '#F3F4F7', // Color por defecto
              color: '#343a40', // Color de texto por defecto
              height:'35px'
            }}
            onClick={() => {
              setSearchTerm4('');
              setCurrentPage4(1);
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

      {/* Selector dinámico a la par de la barra de búsqueda */}
      <CCol xs="12" md="4" className="text-md-end mt-2 mt-md-0">
        <CInputGroup style={{ width: 'auto', display: 'inline-block' }}>
          <div className="d-inline-flex align-items-center">
            <span style={{ fontSize: '0.85rem' }}>Mostrar&nbsp;</span>
              <CFormSelect
                style={{ width: '80px',height:'35px', display: 'inline-block', textAlign: 'center' }}
                onChange={(e) => {
                const value = Number(e.target.value);
                setRecordsPerPage4(value);
                setCurrentPage4(1); // Reiniciar a la primera página cuando se cambia el número de registros
              }}
                value={recordsPerPage4}
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
              </CFormSelect>
            <span style={{ fontSize: '0.85rem' }}>&nbsp;registros</span>
          </div>       
       </CInputGroup>
     </CCol>
    </CRow>
        {/* Tabla de Actividades */}
        
        <div className="table-responsive" style={{overflowX: 'auto',overflow: "hidden", boxShadow: "0 4px 10px rgba(0, 0, 0, 0.3)"}}>
        <CTable striped bordered hover responsive>
            <CTableHead className="sticky-top bg-light text-start" style={{  whiteSpace: "nowrap",overflow: "hidden",fontSize: '0.8rem' }}>
                <CTableRow>
                <CTableHeaderCell>#</CTableHeaderCell>
                    <CTableHeaderCell>NOMBRE</CTableHeaderCell>
                    <CTableHeaderCell>DESCRIPCIÓN</CTableHeaderCell>
                    <CTableHeaderCell>PONDERACIÓN</CTableHeaderCell>
                    <CTableHeaderCell>FECHA INICIO </CTableHeaderCell>
                    <CTableHeaderCell>FECHA FIN</CTableHeaderCell>
                    <CTableHeaderCell>VALOR</CTableHeaderCell>
                    <CTableHeaderCell>ACCIONES</CTableHeaderCell>
                </CTableRow>
            </CTableHead>
            <CTableBody>
  {actividades.length > 0 ? (
    currentRecords4.map((actividad, index) => (
      
      <CTableRow key={actividad?.Cod_actividad_academica || index}>
        <CTableDataCell>{index + 1}</CTableDataCell>
        <CTableDataCell>{actividad?.Nombre_actividad_academica || "N/A"}</CTableDataCell>
        <CTableDataCell>{actividad?.Descripcion || "N/A"}</CTableDataCell>
        <CTableDataCell>{listaponderacionesC.find((ponderacion) => ponderacion.Cod_ponderacion_ciclo === actividad?.Cod_ponderacion_ciclo)?.Descripcion_ponderacion || "N/A"}</CTableDataCell>
        <CTableDataCell>
  {actividad?.Fechayhora_Inicio
    ? new Date(actividad.Fechayhora_Inicio).toLocaleDateString("es-ES", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
    : "N/A"}
</CTableDataCell>
<CTableDataCell>
  {actividad?.Fechayhora_Fin
    ? new Date(actividad.Fechayhora_Fin).toLocaleDateString("es-ES", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
    : "N/A"}
</CTableDataCell>
        <CTableDataCell>{actividad?.Valor || "N/A"}</CTableDataCell>
        <CTableDataCell>
        {canUpdate && (
          <CButton
           onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0px 4px 10px rgba(249, 182, 78, 0.6)';
            e.currentTarget.style.color = '#000000';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = 'none';
            e.currentTarget.style.color = '#5C4044';
          }}
          style={{
            backgroundColor: '#F9B64E',
            color: '#5C4044',
            border: 'none',
            transition: 'all 0.2s ease',
            padding: '5px 10px',
            height: '38px',
            width: '45px',
            marginRight: '10px', // Separación a la derecha
            marginBottom: '10px' // Separación inferior para alineación
          }}
            onClick={() => handleOpenUpdateModal(actividad)}
          >
            <CIcon icon={cilPen} />
          </CButton>
            )}

            {canDelete && ( 
          <CButton
          style={{
            backgroundColor: '#E57368', // Mismo color que el primer botón
            color: '#5C4044',
            border: 'none',
            transition: 'all 0.2s ease',
            padding: '5px 10px',
            height: '38px',
            width: '45px',
            marginRight: '10px', // Separación a la derecha
            marginBottom: '10px' // Separación inferior para alineación
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0px 4px 10px rgba(183, 65, 48, 0.6)';
            e.currentTarget.style.color = '#000000';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = 'none';
            e.currentTarget.style.color = '#5C4044';
          }}
            onClick={() => handleEliminarActividad(actividad.Cod_actividad_academica,actividad.Nombre_actividad_academica)}
          >
           <CIcon icon={cilTrash} />
          </CButton>
          )}
         
        </CTableDataCell>
        
      </CTableRow>
      
    ))
  ) : (
    <CTableRow>
      <CTableDataCell colSpan="6">No hay actividades disponibles.</CTableDataCell>
    </CTableRow>
  )}

  {/* Fila para el total */}
  <CTableRow>
    <CTableDataCell colSpan="6" className="text-end fw-bold">Total:</CTableDataCell>
    <CTableDataCell className="fw-bold">{calcularTotalValor()}</CTableDataCell>
    <CTableDataCell></CTableDataCell>
  </CTableRow>
</CTableBody>

        </CTable>
    </div>
    {/* Paginación Fija */}
    <div style={{ display: 'flex',  justifyContent: 'center', alignItems: 'center', marginTop: '16px' }}>
      <CPagination aria-label="Page navigation" style={{ display: 'flex', gap: '10px' }}>
        <CButton
          style={{ backgroundColor: '#6f8173', color: '#D9EAD3' }}
          disabled={currentPage4 === 1} // Deshabilitar si estás en la primera página
          onClick={() => paginate4(currentPage4 - 1)}>
          Anterior
        </CButton>
        <CButton
          style={{ marginLeft: '10px',backgroundColor: '#6f8173', color: '#D9EAD3' }}
          disabled={currentPage4 === Math.ceil(filteredActividades.length / recordsPerPage4)} // Deshabilitar si estás en la última página
          onClick={() => paginate4(currentPage4 + 1)}>
          Siguiente
       </CButton>
     </CPagination>
      {/* Mostrar total de páginas */}
      <span style={{ marginLeft: '10px' }}>
        Página {currentPage4} de {Math.ceil(filteredActividades.length / recordsPerPage4)}
      </span>
   </div>
    </div>
)}


  {/* Modal para crear actividad */}
  <CModal visible={modalVisible} onClose={() => setModalVisible(false)} backdrop="static">
        <CModalHeader closeButton>
          <h5>Nueva Actividad</h5>
        </CModalHeader>
        <CModalBody>
        <CForm>
        {/* Estos inputs ahora son invisibles pero manejados internamente */}
        <CFormInput
          type="hidden" // Oculta el input en el formulario
          value={nuevaActividad.Cod_profesor}
          readOnly
        />
        <CFormInput
          type="hidden"
          value={nuevaActividad.Cod_parcial}
          readOnly
        />
        <CFormInput
          type="hidden"
          value={nuevaActividad.Cod_secciones}
          readOnly
        />
        <CFormInput
          type="hidden"
          value={nuevaActividad.Cod_seccion_asignatura}
          readOnly
        />

          {/* Nombre de la actividad */}
      <CInputGroup className="mb-3">
      <CInputGroupText>Nombre de la Actividad</CInputGroupText> 
      <CFormInput
          value={nuevaActividad.Nombre_actividad_academica}
          onPaste={disableCopyPaste}
          onCopy={disableCopyPaste}
          onChange={(e) => handleInputChange(e, (value) => setNuevaActividad({...nuevaActividad,Nombre_actividad_academica: e.target.value,}))}
        />
        </CInputGroup>

         {/* Descripcion*/}
     <CInputGroup className="mb-3">
      <CInputGroupText>Descripción</CInputGroupText> 
      <CFormTextarea
          value={nuevaActividad.Descripcion}
          onPaste={disableCopyPaste}
          onCopy={disableCopyPaste}
          onChange={(e) => handleInputChange(e, (value) =>setNuevaActividad({...nuevaActividad, Descripcion: e.target.value, }))}
        />
        </CInputGroup>
       {/* Fecha y hora inicio */}
<CInputGroup className="mb-3">
  <CInputGroupText>Fecha y hora inicio</CInputGroupText>
  <CFormInput
    type="date"
    onPaste={disableCopyPaste}
    onCopy={disableCopyPaste}
    value={nuevaActividad.FechaInicio || ''}
    onChange={(e) => {
      const selectedDate = e.target.value;
      if (!selectedDate) {
        Swal.fire({
          icon: 'warning',
          title: 'Fecha requerida',
          text: 'Debe seleccionar una fecha antes de configurar la hora.',
          confirmButtonText: 'Aceptar',
        });
        return;
      }
      setNuevaActividad({
        ...nuevaActividad,
        FechaInicio: selectedDate,
        Fechayhora_Inicio: '', // Reset datetime input
      });
    }}
  />
  <CFormInput
    type="time"
    disabled={!nuevaActividad.FechaInicio}
    value={
      nuevaActividad.Fechayhora_Inicio
        ? nuevaActividad.Fechayhora_Inicio.split('T')[1]
        : ''
    }
    onChange={(e) => {
      const selectedTime = e.target.value;
      const [hour] = selectedTime.split(':').map(Number);
      if (hour < 7 || hour >= 15) {
        Swal.fire({
          icon: 'warning',
          title: 'Hora no válida',
          text: 'La hora debe estar entre las 7:00 AM y las 3:00 PM.',
          confirmButtonText: 'Aceptar',
        });
        return;
      }


        if (
          startHour > endHour ||
          (startHour === endHour && startMinute > endMinute)
        ) {
          Swal.fire({
            icon: 'error',
            title: 'Hora inicio inválida',
            text: 'La hora de inicio no puede ser mayor que la hora de fin si la fecha es la misma.',
            confirmButtonText: 'Aceptar',
          });
          return;
        }
      }

    }
  />
</CInputGroup>

{/* Fecha y hora fin */}
<CInputGroup className="mb-3">
  <CInputGroupText>Fecha y hora fin</CInputGroupText>
  <CFormInput
    type="date"
    onPaste={disableCopyPaste}
    onCopy={disableCopyPaste}
    value={nuevaActividad.FechaFin || ''}
    onChange={(e) => {
      const selectedDate = e.target.value;
      if (!selectedDate) {
        Swal.fire({
          icon: 'warning',
          title: 'Fecha requerida',
          text: 'Debe seleccionar una fecha antes de configurar la hora.',
          confirmButtonText: 'Aceptar',
        });
        return;
      }
      setNuevaActividad({
        ...nuevaActividad,
        FechaFin: selectedDate,
        Fechayhora_Fin: '', // Reset datetime input
      });
    }}
  />
  <CFormInput
    type="time"
    disabled={!nuevaActividad.FechaFin}
    value={
      nuevaActividad.Fechayhora_Fin
        ? nuevaActividad.Fechayhora_Fin.split('T')[1]
        : ''
    }
    onChange={(e) => {
      const selectedTime = e.target.value;
      const [hour] = selectedTime.split(':').map(Number);
      if (hour < 7 || hour >= 15) {
        Swal.fire({
          icon: 'warning',
          title: 'Hora no válida',
          text: 'La hora debe estar entre las 7:00 AM y las 3:00 PM.',
          confirmButtonText: 'Aceptar',
        });
        return;
      }

      // Validación si la fecha es la misma y hora inicio ya está definida
      if (
        nuevaActividad.FechaInicio === nuevaActividad.FechaFin &&
        nuevaActividad.Fechayhora_Inicio
      ) {
        const [startHour, startMinute] = nuevaActividad.Fechayhora_Inicio.split(
          'T'
        )[1]
          ?.split(':')
          .map(Number);
        const [endHour, endMinute] = selectedTime.split(':').map(Number);

        if (
          startHour > endHour ||
          (startHour === endHour && startMinute > endMinute)
        ) {
          Swal.fire({
            icon: 'error',
            title: 'Hora fin inválida',
            text: 'La hora de fin no puede ser menor que la hora de inicio si la fecha es la misma.',
            confirmButtonText: 'Aceptar',
          });
          return;
        }
      }

      setNuevaActividad({
        ...nuevaActividad,
        Fechayhora_Fin: `${nuevaActividad.FechaFin}T${selectedTime}`,
      });
    }}
  />
</CInputGroup>

         
     {/* Ponderacion */}
     <CInputGroup className="mb-3">
     <CInputGroupText>Ponderación</CInputGroupText>
     <CFormSelect
    value={nuevaActividad.Cod_ponderacion_ciclo}
    onChange={(e) => {
      const seleccionada = listaponderacionesC.find(
        (ponderacion) => ponderacion.Cod_ponderacion_ciclo === Number(e.target.value)
      );
      setNuevaActividad({
        ...nuevaActividad,
        Cod_ponderacion_ciclo: seleccionada?.Cod_ponderacion_ciclo || '',
      });
    }}
  >
    <option value="">Seleccione una ponderación</option>
    {listaponderacionesC.map((ponderacion) => (
      <option
        key={ponderacion.Cod_ponderacion_ciclo}
        value={ponderacion.Cod_ponderacion_ciclo}
      >
        {ponderacion.Descripcion_ponderacion} - {ponderacion.Valor}%
      </option>
    ))}
  </CFormSelect>
</CInputGroup>
{/* Valor */}
<CInputGroup className="mb-3">
  <CInputGroupText>Valor</CInputGroupText>
  <CFormInput
    type="number"
    onPaste={disableCopyPaste}
    onCopy={disableCopyPaste}
    value={nuevaActividad.Valor || ""}
    onKeyPress={(e) => {
      // Bloquear el signo negativo
      if (e.key === "-") {
        e.preventDefault();
        Swal.fire("Advertencia", "No se permiten valores negativos.", "warning");
      }
    }}
    onChange={(e) => {
      let value = e.target.value;

      // Prevenir valores negativos
      if (value.includes("-")) {
        Swal.fire("Advertencia", "No se permiten valores negativos.", "warning");
        return;
      }

      // Bloquear el valor 0
      if (value === "0") {
        Swal.fire("Advertencia", "El valor no puede ser solo 0.", "warning");
        return;
      }

      // Validar que los números enteros no superen 2 dígitos
      if (value.includes(".")) {
        const [entero, decimal] = value.split(".");
        if (entero.length > 2) {
          Swal.fire("Advertencia", "Solo se permiten dos dígitos enteros.", "warning");
          value = `${entero.substring(0, 2)}.${decimal}`; // Recortar a 2 dígitos enteros
        }
        if (decimal.length > 2) {
          Swal.fire("Advertencia", "Solo se permiten dos dígitos después del punto.", "warning");
          value = `${entero}.${decimal.substring(0, 2)}`; // Recortar a 2 decimales
        }
      } else if (value.length > 2) {
        // Si no hay decimales, limitar los enteros a 2 dígitos
        Swal.fire("Advertencia", "Solo se permiten dos dígitos enteros.", "warning");
        value = value.substring(0, 2); // Recortar a 2 dígitos enteros
      }

      // Actualizar el estado con el valor corregido
      setNuevaActividad({ ...nuevaActividad, Valor: value });
    }}
  />
</CInputGroup>
      </CForm>
    
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setModalVisible(false)}>
            Cancelar
          </CButton>
          <CButton onClick={handleCrearActividad}
          onMouseEnter={(e) => {e.currentTarget.style.backgroundColor = "#3C4B43";  }}
            onMouseLeave={(e) => {e.currentTarget.style.backgroundColor = "#4B6251"; }}
            style={{backgroundColor: '#4B6251',color: '#FFFFFF',padding: '6px 12px',transition: 'background-color 0.2s ease, box-shadow 0.3s ease', }}>
          <CIcon icon={cilSave} /> Guardar
          </CButton>
        </CModalFooter>
      </CModal>
{/*---------------------------------------------Modal de actualizar------------------------------------ */}

{/* Modal para actualizar actividad */}
<CModal visible={updateModalVisible} 
key={actividadToUpdate?.Cod_actividad_academica || "default-key"}
backdrop="static" >
<CModalHeader closeButton>
        <h5>Actualizar Actividad</h5>
    </CModalHeader>
    <CModalBody>
        <CForm>
          {/* Nombre de la actividad */}
             <CInputGroup className="mb-3">
             <CInputGroupText>Nombre de la Actividad</CInputGroupText> 
                <CFormInput
                value={actividadToUpdate?.Nombre_actividad_academica || ""}
                onPaste={disableCopyPaste}
                onCopy={disableCopyPaste}
                onChange={(e) => handleInputChange(e, (value) => setActividadToUpdate({...actividadToUpdate, Nombre_actividad_academica: e.target.value,}))}
            />
            </CInputGroup>
            {/* Descripcion*/}
              <CInputGroup className="mb-3">
             <CInputGroupText>Descripción</CInputGroupText> 
                <CFormTextarea
                value={actividadToUpdate?.Descripcion || ""}
                onPaste={disableCopyPaste}
                onCopy={disableCopyPaste}
                onChange={(e) => handleInputChange(e, (value) => setActividadToUpdate({...actividadToUpdate, Descripcion: e.target.value, }))}
            />
            </CInputGroup>
{/* Fecha y hora inicio */}
<CInputGroup className="mb-3">
  <CInputGroupText>Fecha y hora inicio</CInputGroupText>
  <CFormInput
    type="date"
    value={formatDateTimeLocal(actividadToUpdate?.Fechayhora_Inicio)?.split("T")[0]}
    onChange={(e) => {
      const selectedDate = e.target.value;
      setActividadToUpdate({
        ...actividadToUpdate,
        Fechayhora_Inicio: `${selectedDate}T${actividadToUpdate?.Fechayhora_Inicio?.split("T")[1]}`, // Mantener la misma hora
      });
    }}
    style={{ width: "120px" }}  // Ajustar tamaño de la fecha
  />
  <CFormInput
    type="time"
    value={formatDateTimeLocal(actividadToUpdate?.Fechayhora_Inicio)?.split("T")[1]}
    onChange={(e) => {
      const selectedTime = e.target.value;
      const selectedDate = actividadToUpdate?.Fechayhora_Inicio?.split("T")[0];
      const selectedHour = parseInt(selectedTime.split(":")[0]);
      const selectedMinute = parseInt(selectedTime.split(":")[1]);

      // Validación: hora debe estar entre las 7 AM y las 3 PM
      if (selectedHour < 7 || selectedHour >= 15) {
        Swal.fire({
          icon: 'warning',
          title: 'Hora no válida',
          text: 'La hora debe estar entre las 7:00 AM y las 3:00 PM.',
          confirmButtonText: 'Aceptar',
        });
        return;
      }

      // Validación: la hora de inicio no puede ser mayor que la hora de fin si la fecha es la misma
      const endDate = actividadToUpdate?.Fechayhora_Fin?.split("T")[0];
      const endTime = actividadToUpdate?.Fechayhora_Fin?.split("T")[1];
      const [endHour, endMinute] = endTime ? endTime.split(":").map(Number) : [null, null];

      if (selectedDate === endDate && endHour !== null && endMinute !== null) {
        if (
          selectedHour > endHour ||
          (selectedHour === endHour && selectedMinute >= endMinute)
        ) {
          Swal.fire({
            icon: 'error',
            title: 'Hora de inicio no válida',
            text: 'La hora de inicio no puede ser mayor que la hora de fin si la fecha es la misma.',
            confirmButtonText: 'Aceptar',
          });
          return;
        }
      }

      // Validación si la fecha es la misma y hora fin ya está definida
      if (selectedDate === endDate && actividadToUpdate?.Fechayhora_Fin) {
        const [endHour, endMinute] = actividadToUpdate?.Fechayhora_Fin.split('T')[1]
          ?.split(':')
          .map(Number);
        const [startHour, startMinute] = selectedTime.split(':').map(Number);

        if (
          startHour > endHour ||
          (startHour === endHour && startMinute > endMinute)
        ) {
          Swal.fire({
            icon: 'error',
            title: 'Hora inicio inválida',
            text: 'La hora de inicio no puede ser mayor que la hora de fin si la fecha es la misma.',
            confirmButtonText: 'Aceptar',
          });
          return;
        }
      }

      // Actualizar el estado si la hora es válida
      setActividadToUpdate({
        ...actividadToUpdate,
        Fechayhora_Inicio: `${selectedDate}T${selectedTime}`,
      });
    }}
    style={{ width: "80px" }}  // Ajustar tamaño de la hora
  />
</CInputGroup>


{/* Fecha y hora fin */}
<CInputGroup className="mb-3">
  <CInputGroupText>Fecha y hora fin</CInputGroupText>
  <CFormInput
    type="date"
    value={formatDateTimeLocal(actividadToUpdate?.Fechayhora_Fin)?.split("T")[0]}
    onChange={(e) => {
      const selectedDate = e.target.value;
      setActividadToUpdate({
        ...actividadToUpdate,
        Fechayhora_Fin: `${selectedDate}T${actividadToUpdate?.Fechayhora_Fin?.split("T")[1]}`, // Mantener la misma hora
      });
    }}
    style={{ width: "120px" }}  // Ajustar tamaño de la fecha
  />
  <CFormInput
    type="time"
    value={formatDateTimeLocal(actividadToUpdate?.Fechayhora_Fin)?.split("T")[1]}
    onChange={(e) => {
      const selectedTime = e.target.value;
      const selectedDate = actividadToUpdate?.Fechayhora_Fin?.split("T")[0];
      const [selectedHour, selectedMinute] = selectedTime.split(":").map(Number);

      // Validación: hora debe estar entre las 7 AM y las 3 PM
      if (selectedHour < 7 || selectedHour >= 15) {
        Swal.fire({
          icon: 'warning',
          title: 'Hora no válida',
          text: 'La hora debe estar entre las 7:00 AM y las 3:00 PM.',
          confirmButtonText: 'Aceptar',
        });
        return;
      }

      // Validación si la fecha es la misma y la hora de inicio ya está definida
      const startDate = actividadToUpdate?.Fechayhora_Inicio?.split("T")[0];
      const [startHour, startMinute] = actividadToUpdate?.Fechayhora_Inicio?.split("T")[1]?.split(":").map(Number);

      if (selectedDate === startDate && actividadToUpdate?.Fechayhora_Inicio) {
        if (
          startHour > selectedHour ||
          (startHour === selectedHour && startMinute > selectedMinute)
        ) {
          Swal.fire({
            icon: 'error',
            title: 'Hora fin inválida',
            text: 'La hora de fin no puede ser menor que la hora de inicio si la fecha es la misma.',
            confirmButtonText: 'Aceptar',
          });
          return;
        }
      }

      // Actualizar el estado si la hora es válida
      setActividadToUpdate({
        ...actividadToUpdate,
        Fechayhora_Fin: `${selectedDate}T${selectedTime}`,
      });
    }}
    style={{ width: "80px" }}  // Ajustar tamaño de la hora
  />
</CInputGroup>



             {/* Fecha y hora inicio */}
             <CInputGroup className="mb-3">
            <CInputGroupText>Fecha y hora inicio</CInputGroupText>
            <CFormInput
             type="datetime-local"
             value={formatDateTimeLocal(actividadToUpdate?.Fechayhora_Inicio)}
             onChange={(e) => setActividadToUpdate({...actividadToUpdate, Fechayhora_Inicio: e.target.value,})}
           />
           </CInputGroup>
           {/* Fecha y hora FIN */}
           <CInputGroup className="mb-3">
           <CInputGroupText>Fecha y hora fin</CInputGroupText>
           <CFormInput
           type="datetime-local"
           value={formatDateTimeLocal(actividadToUpdate?.Fechayhora_Fin)}
            onChange={(e) => setActividadToUpdate({...actividadToUpdate, Fechayhora_Fin: e.target.value,})}
            />
           </CInputGroup>
          {/* Ponderación */}
<CInputGroup className="mb-3">
  <CInputGroupText>Ponderación</CInputGroupText>
  <CFormInput
    type="text"
    value={
      listaponderacionesC.find(
        (ponderacion) =>
          ponderacion.Cod_ponderacion_ciclo ===
          actividadToUpdate?.Cod_ponderacion_ciclo
      )?.Descripcion_ponderacion || "N/A"
    }
    readOnly
    style={{
      backgroundColor: "#f1f1f1", // Sombreado gris claro
      color: "#6c757d", // Texto en gris oscuro
      cursor: "not-allowed", // Cursor de no permitido para mayor claridad
    }}
  />
</CInputGroup>

           {/* valor*/}
           <CInputGroup className="mb-3">
  <CInputGroupText>Valor</CInputGroupText>
  <CFormInput
    type="text" // Mantener "text" para mayor control del formato
    value={actividadToUpdate?.Valor || ""}
    onPaste={(e) => e.preventDefault()} // Bloquear pegar texto
    onCopy={(e) => e.preventDefault()} // Bloquear copiar texto
    onChange={(e) => {
      let value = e.target.value;

      // Validar si el valor contiene caracteres no numéricos o más de dos decimales
      if (!/^\d*\.?\d{0,2}$/.test(value)) {
        Swal.fire("Advertencia", "Solo se permiten números con hasta 2 decimales.", "warning");
        return; // Detener si no cumple con el formato
      }

      // Prevenir múltiples ceros al inicio
      if (value.startsWith("00")) {
        value = value.replace(/^0+/, "0");
      }

      // Prevenir valores negativos
      if (value.includes("-")) {
        Swal.fire("Advertencia", "No se permiten valores negativos.", "warning");
        return; // Bloquear valores negativos
      }

      // Bloquear el valor 0
      if (value === "0") {
        Swal.fire("Advertencia", "El valor no puede ser solo 0.", "warning");
        return; // Bloquear solo ceros
      }

      // Validar que los números enteros no superen 2 dígitos
      if (value.split(".")[0].length > 2) {
        Swal.fire("Advertencia", "El valor no puede tener más de dos dígitos enteros.", "warning");
        return; // Bloquear valores con más de 2 dígitos enteros
      }

      setActividadToUpdate({
        ...actividadToUpdate,
        Valor: value,
      });
    }}
  />
</CInputGroup>

        </CForm>
    </CModalBody>
    <CModalFooter>
    <CButton color="secondary" onClick={() => setUpdateModalVisible(false)}>
            Cancelar
        </CButton>
        <CButton style={{ backgroundColor: '#9f7536', color: '#FFFFFF'}} onClick={handleActualizarActividad}>
            Actualizar
        </CButton>
    </CModalFooter>
</CModal>




    </CContainer>


  );


};

export default ActividadesAcademicasProfesor;





