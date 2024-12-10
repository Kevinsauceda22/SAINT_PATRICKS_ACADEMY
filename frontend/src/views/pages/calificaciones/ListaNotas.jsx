import React, { useEffect, useState } from 'react';
import { cilArrowLeft,cilPen,cilSearch,cilPlus,cilBookmark,cilCalendar,cilBook, cilSpreadsheet,cilInfo,cilDescription,  cilFile,cilSave, cilBrushAlt } from '@coreui/icons';
import CIcon from '@coreui/icons-react';
import Swal from 'sweetalert2';

import * as jwt_decode from 'jwt-decode';

import {
  CContainer, CRow, CCol, CCard, CTable, CTableHeaderCell, CTableBody, CTableRow, CTableDataCell, CButton, CSpinner, CCardBody, CDropdown,CDropdownToggle,
  CDropdownMenu, CDropdownItem,CTableHead,CModal,CModalHeader,CModalTitle,CModalBody,CModalFooter,CInputGroup,CInputGroupText,CFormInput,CFormSelect,CPagination
} from '@coreui/react';

import usePermission from '../../../../context/usePermission';
import AccessDenied from "../AccessDenied/AccessDenied"
import logo from 'src/assets/brand/logo_saint_patrick.png'
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
const ListaNotas = () => {
  const { canSelect, canInsert, canUpdate} = usePermission('ListaNotas');
  const [secciones, setSecciones] = useState([]);
  const [asignaturas, setAsignaturas] = useState([]);
  const [promedios, setPromedios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [currentView, setCurrentView] = useState('secciones');
  const [nombreSeccionSeleccionada, setNombreSeccionSeleccionada] = useState('');
  const [nombreasignaturaSeleccionada, setNombreAsignaturaSeleccionada] = useState('');
  const [anioSeccionSeleccionada, setAnioSeccionSeleccionada] = useState('');
  
const [actividades, setActividades] = useState([]);
const [actividadescalificadas, setActividadescalificadas] = useState([]);
const [selectedCodSeccionAsignatura, setSelectedCodSeccionAsignatura] = useState(null);
const [selectedCodSeccion, setSelectedCodSeccion] = useState(null); // Código de la sección seleccionada

//flujo de modales
const [parciales, setParciales] = useState([]); // Lista de parciales
//const [actividades, setActividades] = useState([]); // Lista de actividades del parcial seleccionado
const [mostrarModalParciales, setMostrarModalParciales] = useState(false);
//const [mostrarModalActividades, setMostrarModalActividades] = useState(false);
const [parcialSeleccionado, setParcialSeleccionado] = useState(null); // El parcial seleccionado
const [vistaModal, setVistaModal] = useState('parciales'); // 'parciales' o 'actividades'
const [mostrarModalDetalleEstudiantes, setMostrarDetalleModalEstudiantes] = useState(false);
const [mostrarModalEstudiantes, setMostrarModalEstudiantes] = useState(false);
const [estudiantes, setEstudiantes] = useState([]);
const [notas, setNotas] = useState([]);
const [estudiantesdetalles, setEstudiantesDetalles] = useState([]);
const [actividadSeleccionada, setActividadSeleccionada] = useState(null);
const [vistaModal2, setVistaModal2] = useState('activid'); // 'parciales' o 'actividades'
const [mostrarModalActividades, setMostrarModalActividades] = useState(false);
const [nombreParcialSeleccionado, setNombreParcialSeleccionado] = useState('');
const [gradoSeleccionado, setGradoSeleccionado] = useState('');
//para paginacion y busqueda de la vista secciones
const [recordsPerPage2, setRecordsPerPage2] = useState(5);
const [searchTerm2, setSearchTerm2] = useState('');
const [currentPage2, setCurrentPage2] = useState(1); 
//para paginacion y busqueda de la vista asignaturas
const [recordsPerPage3, setRecordsPerPage3] = useState(5);
const [searchTerm3, setSearchTerm3] = useState('');
const [currentPage3, setCurrentPage3] = useState(1); 
//para paginacion y busqueda de la vista gestionar notas
const [recordsPerPage4, setRecordsPerPage4] = useState(5);
const [searchTerm4, setSearchTerm4] = useState('');
const [currentPage4, setCurrentPage4] = useState(1); 
const [nombreBusqueda, setNombreBusqueda] = useState('');
  useEffect(() => {
    fetchSecciones();
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

  const fetchSecciones = async () => {
    try {
        const response = await fetch('http://localhost:4000/api/notas/seccion', {
            method: 'GET',
        });

        if (!response.ok) throw new Error('Error al cargar secciones.');
        const data = await response.json();
        setSecciones(data); // Ajusta según el formato de la respuesta
    } catch (error) {
        console.error('Error al obtener las secciones:', error);
    } finally {
        setCargando(false);
    }
};


  const fetchAsignaturas = async (Cod_secciones) => {
    try {
      setCargando(true);
      const response = await fetch(`http://localhost:4000/api/notas/notas?Cod_seccion=${Cod_secciones}`);
      if (!response.ok) throw new Error('Error al obtener las asignaturas');
      const data = await response.json();
      setAsignaturas(data);
    } catch (error) {
      console.error('Error:', error);
      Swal.fire('Error', 'Hubo un problema al obtener las asignaturas', 'error');
    } finally {
      setCargando(false);
    }
  };

  const fetchPromedio = async (Cod_seccion_asignatura) => {
    try {
      setCargando(true);
      const response = await fetch(`http://localhost:4000/api/notas/promedio?Cod_seccion_asignatura=${Cod_seccion_asignatura}`);
      if (!response.ok) throw new Error('Error al obtener los promedios');
      const data = await response.json();
      setPromedios(data);
    } catch (error) {
      console.error('Error:', error);
      Swal.fire('Error', 'Hubo un problema al obtener los promedios', 'error');
    } finally {
      setCargando(false);
    }
  };

  const fetchActividades = async (Cod_seccion_asignatura) => {
    try {
      setCargando(true);
      const response = await fetch(`http://localhost:4000/api/notas/actividades?Cod_seccion_asignatura=${Cod_seccion_asignatura}`);
      if (!response.ok) throw new Error('Error al obtener las actividades');
      const data = await response.json();
  
      // Agrupar actividades por parcial
      const parcialesMap = data.reduce((result, actividad) => {
        const parcial = actividad.Nombre_parcial || `Parcial ${actividad.Cod_parcial}`;
        if (!result[parcial]) {
          result[parcial] = [];
        }
        result[parcial].push(actividad);
        return result;
      }, {});
  
      // Convertir a array para iterar fácilmente
      setParciales(Object.keys(parcialesMap).map((nombreParcial) => ({
        nombre: nombreParcial,
        actividades: parcialesMap[nombreParcial],
      })));
  
      setMostrarModalParciales(true); // Abre el modal de parciales
    } catch (error) {
      console.error('Error:', error);
      Swal.fire('Error', 'Hubo un problema al obtener las actividades', 'error');
    } finally {
      setCargando(false);
    }
  };


  const fetchActividadcalificadas = async (Cod_seccion_asignatura, Cod_parcial, nombreParcial) => {
    try {
      setCargando(true);
      setNombreParcialSeleccionado(nombreParcial); // Guarda el nombre del parcial seleccionado
      console.log('Cod_seccion_asignatura:', Cod_seccion_asignatura, 'Cod_parcial:', Cod_parcial);
  
      const response = await fetch(
        `http://localhost:4000/api/notas/actividadescalificadas?Cod_seccion_asignatura=${Cod_seccion_asignatura}`
      );
      if (!response.ok) throw new Error('Error al obtener las actividades');
      const data = await response.json();
  
      const actividadesFiltradas = data.filter(
        (actividad) => actividad.Cod_parcial === Cod_parcial
      );
      console.log('Actividades filtradas:', actividadesFiltradas);
  
      setActividadescalificadas(actividadesFiltradas);
      setMostrarModalActividades(true); // Muestra el modal
    } catch (error) {
      console.error('Error:', error);
      Swal.fire('Error', 'Hubo un problema al obtener las actividades', 'error');
    } finally {
      setCargando(false);
    }
  };
  
  
  const fetchEstudiantes = async (actividad) => {
    try {
      const response = await fetch(`http://localhost:4000/api/seccionalumno/estudiantes/${selectedCodSeccion}`);
      if (!response.ok) throw new Error('Error al obtener la lista de estudiantes');
      const data = await response.json();
      setEstudiantes(data);
      setActividadSeleccionada(actividad); // Guarda la actividad seleccionada
      setMostrarModalEstudiantes(true); // Abre el modal de estudiantes
    } catch (error) {
      console.error('Error:', error);
      Swal.fire('Error', 'Hubo un problema al obtener los estudiantes', 'error');
    }
  };
  
  const fetchNotas = async (codSeccion, codSeccionAsignatura, codParcial, codActividadAsignatura) => {
    try {
      console.log('Parametros:', { codSeccion, codSeccionAsignatura, codParcial, codActividadAsignatura }); // Verifica los valores
      setCargando(true);
      const response = await fetch(
        `http://localhost:4000/api/notas/notasactividad/${codSeccion}/${codSeccionAsignatura}/${codParcial}/${codActividadAsignatura}`
      );
      if (!response.ok) throw new Error("Error al obtener las notas");
      const data = await response.json();
      if (data.length > 0) {
        setNotas(data);
      } else {
        Swal.fire("Información", "No se encontraron notas para esta actividad.", "info");
      }
    } catch (error) {
      console.error("Error al obtener las notas:", error);
    } finally {
      setCargando(false);
    }
  };
  
  const actualizarNotas = async () => {
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

      // Verifica si hay estudiantes con datos para actualizar
      if (!notas || notas.length === 0) {
        Swal.fire('Advertencia', 'No hay datos para actualizar.', 'info');
        return;
      }
      
      // Verifica si hay estudiantes con datos para actualizar
      if (!notas || notas.length === 0) {
        Swal.fire('Advertencia', 'No hay datos para actualizar.', 'info');
        return;
      }
  
      // Construir el array de notas actualizadas para enviar
      const datosActualizados = notas.map((nota) => ({
        Cod_nota: nota.Cod_nota, // Asegúrate de que este campo exista en los datos del estudiante
        Nota: nota.Nota, // Nota actualizada
        Observacion: nota.Observacion || null, // Observación actualizada o null si no hay
      }));
  
      // Realiza la solicitud al endpoint de actualización
      const response = await fetch('http://localhost:4000/api/notas/actualizarnota', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(datosActualizados),
      });
  
      const resultado = await response.json();
  
      if (response.ok) {
        // Generar un listado de los códigos de asistencia actualizados
         const codigosActualizados = datosActualizados.map((nota) => nota.Cod_nota).join(', ');

         // Registrar la acción en la bitácora
         const descripcion = `El usuario: ${decodedToken.nombre_usuario} ha actualizado las notas con los códigos: ${codigosActualizados}`;
         
          // Enviar a la bitácora
          const bitacoraResponse = await fetch('http://localhost:4000/api/bitacora/registro', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`, // Incluir token en los encabezados
            },
            body: JSON.stringify({
              cod_usuario: decodedToken.cod_usuario, // Código del usuario
              cod_objeto: 87, // Código del objeto para la acción
              accion: 'UPDATE', // Acción realizada
              descripcion: descripcion, // Descripción de la acción
            }),
          });
    
          if (bitacoraResponse.ok) {
            console.log('Registro en bitácora exitoso');
          } else {
            Swal.fire('Error', 'No se pudo registrar la acción en la bitácora', 'error');
          }
        
        // Refrescar las vistas de asignaturas y promedios
        if (selectedCodSeccionAsignatura) {
          await fetchPromedio(selectedCodSeccionAsignatura);
        }
  
        if (selectedCodSeccion) {
          await fetchAsignaturas(selectedCodSeccion);
        }
         Swal.fire({
          title: 'Éxito',
          text: 'Las notas actualizadas correctamente.',
          icon: 'success',
          confirmButtonText: 'Aceptar', 
        });
        // Aquí puedes agregar lógica para refrescar los datos o cerrar el modal
        await fetchNotas(
          selectedCodSeccion,
          selectedCodSeccionAsignatura,
          actividadSeleccionada.Cod_parcial,
          actividadSeleccionada.Cod_actividad_asignatura
        );
        cerrarModalActividad();
      } else {
        Swal.fire('Error', resultado.Mensaje || 'Ocurrió un error al actualizar las notas.', 'error');
      }
    } catch (error) {
      console.error('Error al actualizar notas:', error);
      Swal.fire('Error', 'Hubo un problema al actualizar las notas.', 'error');
    }
  };
  
  
  const guardarNotas = async () => {
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
      
      // Construir el array de notas para enviar
      const datosNotas = estudiantes.map((estudiante) => ({
        Nota: estudiante.nota,
        Observacion: estudiante.observacion || null, // Observación nula si no se ingresa
        Cod_parcial: actividadSeleccionada.Cod_parcial,
        Cod_actividad_asignatura: actividadSeleccionada.Cod_actividad_asignatura,
        Cod_seccion_matricula: estudiante.Cod_seccion_matricula, // Cambia según el nombre exacto del campo
      }));
  
      // Realizar la solicitud al backend
      const response = await fetch('http://localhost:4000/api/notas/crearnota', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(datosNotas),
      });
  
      const resultado = await response.json();
  
      if (response.ok) {
         // 2. Registrar la acción en la bitácora
        const descripcion = `El usuario: ${decodedToken.nombre_usuario} ha creado nueva nota `;
        
        // Enviar a la bitácora
        const bitacoraResponse = await fetch('http://localhost:4000/api/bitacora/registro', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`, // Incluir token en los encabezados
          },
          body: JSON.stringify({
            cod_usuario: decodedToken.cod_usuario, // Código del usuario
            cod_objeto: 87, // Código del objeto para la acción
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
          title: 'Éxito',
          text: 'Las notas registradas correctamente.',
          icon: 'success',
          confirmButtonText: 'Aceptar', // Cambia "OK" por "Aceptar" u otro texto
        });
  
        // Refrescar las vistas de asignaturas y promedios
        if (selectedCodSeccionAsignatura) {
          await fetchPromedio(selectedCodSeccionAsignatura);
        }
  
        if (selectedCodSeccion) {
          await fetchAsignaturas(selectedCodSeccion);
        }
        cerrarModalParciales();
      } else {
        Swal.fire('Error', resultado.Mensaje || 'Ocurrió un error al guardar las notas.', 'error');
      }
    } catch (error) {
      console.error('Error al guardar notas:', error);
      Swal.fire('Error', 'Hubo un problema al guardar las notas.', 'error');
    }
  };
  
  // Función para abrir el modal de estudiantes con datos del fetch
  const handleAbrirModalEstudiantes = async (Cod_seccion, Cod_seccion_asignatura, Cod_parcial,nombreParcial) => {
    try {
      setNombreParcialSeleccionado(nombreParcial)
      setCargando(true); // Muestra el spinner
  
      // Realizar la solicitud con los parámetros
      const response = await fetch(
        `http://localhost:4000/api/notas/notatotal/${Cod_seccion}/${Cod_seccion_asignatura}/${Cod_parcial}`
      );
  
      if (!response.ok) throw new Error("Error al obtener la lista de estudiantes");
      const data = await response.json();
  
      // Guardar los datos obtenidos
      setEstudiantesDetalles(data);
      setMostrarDetalleModalEstudiantes(true); // Mostrar el modal
    } catch (error) {
      console.error("Error:", error);
      Swal.fire("Error", "Hubo un problema al obtener los estudiantes", "error");
    } finally {
      setCargando(false); // Oculta el spinner
    }
  };
  

  const handleViewAsignaturas = (Cod_secciones, nombreSeccion, grado, anio) => {
    setSelectedCodSeccion(Cod_secciones);
    fetchAsignaturas(Cod_secciones);
    setGradoSeleccionado(grado);
    setNombreSeccionSeleccionada(nombreSeccion);
    setAnioSeccionSeleccionada(anio);
    setCurrentView('asignaturas');
  };
  

  const handleViewPromedios = (Cod_seccion_asignatura,Nombre_asignatura) => {
    setSelectedCodSeccionAsignatura(Cod_seccion_asignatura);
    setNombreAsignaturaSeleccionada(Nombre_asignatura);
    fetchPromedio(Cod_seccion_asignatura);
    setCurrentView('promedios');
  };

  const handleBackToSecciones = () => {
    setCurrentView('secciones');
  };

  const handleBackToAsignaturas = () => {
    setCurrentView('asignaturas');
  };
  
    // Verificar permisos
    if (!canSelect) {
      return <AccessDenied />;
    }
    
    const handleIrAActividades = (parcial) => {
      setParcialSeleccionado(parcial.nombre); // Establece el parcial seleccionado
      setActividades(parcial.actividades); // Carga las actividades del parcial
      setVistaModal('actividades'); // Cambia a la vista de actividades
    };
    
    const handleVolverAParciales = () => {
      setVistaModal('parciales'); // Cambia a la vista de parciales
    };
    
    const handleIrAEstudiantes = (actividad) => {
      setActividadSeleccionada(actividad); // Guarda la actividad seleccionada
      fetchEstudiantes(actividad); // Obtiene los estudiantes
      setVistaModal('estudiantes'); // Cambia la vista del modal
    };
    
    const handleIrAEstudiant =async (actividad) => {
      setActividadSeleccionada(actividad); // Guarda la actividad seleccionada
      await fetchNotas(selectedCodSeccion, selectedCodSeccionAsignatura, actividad.Cod_parcial, actividad.Cod_actividad_asignatura);
      setVistaModal2('estudiant'); // Cambia la vista del modal
    };

    const handleVolverAActividades = () => {
      setVistaModal('actividades'); // Regresa a la vista de actividades
    };
    
    const handleVolverAActividad = () => {
      setVistaModal2('activid'); // Regresa a la vista de actividades
    };
    const cerrarModalParciales = () => {
      setMostrarModalParciales(false);
      setVistaModal('parciales'); // Reinicia la vista a 'parciales'
      setParcialSeleccionado(null); // Limpia el parcial seleccionado
      setActividades([]); // Limpia las actividades cargadas
      setActividadSeleccionada(null); // Limpia la actividad seleccionada
      setEstudiantes([]); // Limpia la lista de estudiantes
    };
    

    const cerrarModalActividad = () => {
      setMostrarModalActividades(false);
      setVistaModal2('activid'); // Reinicia la vista a 'parciales'
      setActividades([]); // Limpia las actividades cargadas
      setActividadSeleccionada(null); // Limpia la actividad seleccionada
      setNotas([]); // Limpia la lista de estudiantes
    };
    
    const disableCopyPaste = (e) => {
      e.preventDefault();
      Swal.fire({
        icon: 'warning',
        title: 'Acción bloqueada',
        text: 'Copiar y pegar no está permitido.',
        confirmButtonText: 'Aceptar', 
      });
    };
    
    const handleInputChange = (e, setFunction) => {
      const input = e.target;
      let value = input.value
        .toUpperCase() // Convertir a mayúsculas
        .trimStart(); // Evitar espacios al inicio
    
      const regex = /^[A-ZÑÁÉÍÓÚ0-9\s,]*$/; // Solo letras, números, acentos, ñ, espacios y comas
    
      // Verificar si hay múltiples espacios consecutivos antes de reemplazarlos
      if (/\s{2,}/.test(value)) {
        Swal.fire({
          icon: 'warning',
          title: 'Espacios múltiples',
          text: 'No se permite más de un espacio entre palabras.',
          confirmButtonText: 'Aceptar', 
        });
        value = value.replace(/\s+/g, ' '); // Reemplazar múltiples espacios por uno solo
      }
    
      // Validar caracteres permitidos
      if (!regex.test(value)) {
        Swal.fire({
          icon: 'warning',
          title: 'Caracteres no permitidos',
          text: 'Solo se permiten letras, números y espacios.',
          confirmButtonText: 'Aceptar', 
        });
        return;
      }
    
      // Validación para letras repetidas más de 4 veces seguidas
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
              confirmButtonText: 'Aceptar', 
            });
            return;
          }
        }
      }
    
      // Establecer el valor con la función correspondiente
      setFunction(value);
    };
    
    const formatDateTime = (dateString) => {
      const date = new Date(dateString);
      const options = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true, // Cambiar a `false` si prefieres formato de 24 horas
      };
      return date.toLocaleString('es-HN', options); // Cambiar 'es-HN' según el idioma/región preferida
    };
    
    const generarReporteExcel = () => {
      // Validar que haya datos en la tabla
      if (!currentRecords2 || currentRecords2.length === 0) {
        Swal.fire({
          icon: 'info',
          title: 'Tabla vacía',
          text: 'No hay datos disponibles para generar el reporte excel.',
          confirmButtonText: 'Aceptar',
        });
        return; // Salir de la función si no hay datos
      }
      const encabezados = [
        ["Saint Patrick Academy"],
        ["Reporte de Secciones"],
        [], // Espacio en blanco
        ["#","Sección", "Grado", "Total Alumnos", "Año Académico", "Profesor"]
      ];
    
      // Crear filas con asistencias filtradas
      const filas = currentRecords2.map((seccion, index) => [
        index + 1,
        seccion.Seccion,
        seccion.Grado,
        seccion.Total_Alumnos,
        seccion.Anio_Academico,
        seccion.Nombre_Profesor
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

    const generarReporteasignaturasExcel = () => {
      if (!currentRecords3 || currentRecords3.length === 0) {
        Swal.fire({
          icon: 'info',
          title: 'Tabla vacía',
          text: 'No hay datos disponibles para generar el reporte excel.',
          confirmButtonText: 'Aceptar',
        });
        return; // Salir de la función si no hay datos
      }
    
      // Detalles de la sección, asignatura y año
      const detalles = [];
      if (gradoSeleccionado && nombreSeccionSeleccionada && anioSeccionSeleccionada && nombreasignaturaSeleccionada) {
        detalles.push([`Grado: ${gradoSeleccionado} | Sección: ${nombreSeccionSeleccionada} | Año: ${anioSeccionSeleccionada} | Asignatura: ${nombreasignaturaSeleccionada}`]);
      } else if (gradoSeleccionado && nombreSeccionSeleccionada && anioSeccionSeleccionada) {
        detalles.push([`Grado: ${gradoSeleccionado} | Sección: ${nombreSeccionSeleccionada} | Año: ${anioSeccionSeleccionada}`]);
      }
    
      const encabezados = [
        ["Saint Patrick Academy"],
        ["Reporte de Promedio por Asignatura"],
        [], // Espacio en blanco
        ...detalles, // Agregar los detalles dinámicos
        [], // Espacio adicional después de los detalles
        ["#", "Asignatura", "Descripción", "Promedio"],
      ];
    
      // Crear filas con asignaturas
      const filas = currentRecords3.map((asignatura, index) => [
        index + 1,
        asignatura.Nombre_asignatura || "N/A",
        asignatura.Descripcion_asignatura || "N/A",
        asignatura.Promedio_Notas || 0,
      ]);
    
      // Combinar encabezados y filas
      const datos = [...encabezados, ...filas];
    
      // Crear una hoja de trabajo
      const hojaDeTrabajo = XLSX.utils.aoa_to_sheet(datos);
    
      // Ajustar el ancho de columnas automáticamente
      const ajusteColumnas = [
        { wpx: 40 }, // # (Número)
        { wpx: 150 }, // Asignatura
        { wpx: 280 }, // Descripción
        { wpx: 100 }, // Promedio
      ];
    
      hojaDeTrabajo["!cols"] = ajusteColumnas;
    
      // Crear el libro de trabajo
      const libroDeTrabajo = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(libroDeTrabajo, hojaDeTrabajo, "Promedios Asignaturas");
    
      // Nombre del archivo con extensión correcta
      const nombreArchivo = "Reporte_Promedios_Asignaturas.xlsx";
    
      // Descargar el archivo
      XLSX.writeFile(libroDeTrabajo, nombreArchivo);
    };
    
    
    const generarReportepromediosExcel = () => {
      if (!currentRecords4 || currentRecords4.length === 0) {
        Swal.fire({
          icon: 'info',
          title: 'Tabla vacía',
          text: 'No hay datos disponibles para generar el reporte excel.',
          confirmButtonText: 'Aceptar',
        });
        return; // Salir de la función si no hay datos
      }
    
      // Detalles de la sección, asignatura y año
      let detalles = [];
      if (gradoSeleccionado && nombreSeccionSeleccionada && anioSeccionSeleccionada && nombreasignaturaSeleccionada) {
        detalles.push([`Grado: ${gradoSeleccionado} | Sección: ${nombreSeccionSeleccionada} | Año: ${anioSeccionSeleccionada} | Asignatura: ${nombreasignaturaSeleccionada}`]);
      } else if (gradoSeleccionado && nombreSeccionSeleccionada && anioSeccionSeleccionada) {
        detalles.push([`Grado: ${gradoSeleccionado} | Sección: ${nombreSeccionSeleccionada} | Año: ${anioSeccionSeleccionada}`]);
      } else if (nombreasignaturaSeleccionada) {
        detalles.push([`Asignatura: ${nombreasignaturaSeleccionada}`]);
      }
    
      const encabezados = [
        ["Saint Patrick Academy"],
        ["Reporte de Promedio por Parcial de Asignatura"],
        ...detalles, // Agregar los detalles dinámicos
        [], // Espacio en blanco
        ["#", "Parcial", "Promedio", "Total Aprobados", "Total Reprobados"],
      ];
    
      // Crear filas con asignaturas
      const filas = currentRecords4.map((promedio, index) => [
        index + 1,
        promedio.NombreParcial || "N/A",
        promedio.PromedioGeneral || 0,
        promedio.TotalAprobados || 0,
        promedio.TotalReprobados || 0,
      ]);
    
      // Combinar encabezados y filas
      const datos = [...encabezados, ...filas];
    
      // Crear una hoja de trabajo
      const hojaDeTrabajo = XLSX.utils.aoa_to_sheet(datos);
    
      // Ajustar el ancho de columnas automáticamente
      const ajusteColumnas = [
        { wpx: 40 }, // # (Número)
        { wpx: 150 }, // Parcial
        { wpx: 150 }, // Promedio
        { wpx: 100 }, // Total Aprobados
        { wpx: 100 }, // Total Reprobados
      ];
    
      hojaDeTrabajo["!cols"] = ajusteColumnas;
    
      // Crear el libro de trabajo
      const libroDeTrabajo = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(libroDeTrabajo, hojaDeTrabajo, "Promedios Asignaturas");
    
      // Nombre del archivo con extensión correcta
      const nombreArchivo = "Reporte_Promedios_Asignaturas_Parcial.xlsx";
    
      // Descargar el archivo
      XLSX.writeFile(libroDeTrabajo, nombreArchivo);
    };
    
    
    const generarReportepromediosPDF = () => {
       // Validar que haya datos en la tabla
      if (!currentRecords4 || currentRecords4.length === 0) {
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
        doc.text('Reporte de Promedios por Parcial', doc.internal.pageSize.width / 2, yPosition, { align: 'center' });
    
        yPosition += 10; // Espaciado entre subtítulo y detalles

         // Detalles de la sección, asignatura y año
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0); // Negro para el texto informativo
        if (gradoSeleccionado && nombreSeccionSeleccionada && anioSeccionSeleccionada && nombreasignaturaSeleccionada) {
          doc.text(
            `Grado: ${gradoSeleccionado} | Sección: ${nombreSeccionSeleccionada} | Año: ${anioSeccionSeleccionada} | Asignatura: ${nombreasignaturaSeleccionada}`,
            doc.internal.pageSize.width / 2,
            yPosition,
            { align: 'center' }
          );
        } else if (gradoSeleccionado && nombreSeccionSeleccionada && anioSeccionSeleccionada) {
          doc.text(
            `Grado: ${gradoSeleccionado} | Sección: ${nombreSeccionSeleccionada} | Año: ${anioSeccionSeleccionada}`,
            doc.internal.pageSize.width / 2,
            yPosition,
            { align: 'center' }
          );
        } else if (nombreasignaturaSeleccionada) {
          doc.text(
            `Asignatura: ${nombreasignaturaSeleccionada}`,
            doc.internal.pageSize.width / 2,
            yPosition,
            { align: 'center' }
          );
        }
  
      yPosition += 8; // Espaciado entre líneas de detalle

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
          head: [['#', 'Parcial', 'Promedio', 'Total Aprobados','Total Reprobados' ]],
          body: currentRecords4.map((promedio, index) => [
            index + 1,
            `${promedio.NombreParcial}`.trim(),
            promedio.PromedioGeneral,
            promedio.TotalAprobados,
            promedio.TotalReprobados
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
            1: { cellWidth: 'auto' }, // Columna 'Parcial' se ajusta automáticamente
            2: { cellWidth: 'auto' }, // Columna 'Promedio' se ajusta automáticamente
            3: { cellWidth: 'auto' }, // Columna 'Total Aprobado' se ajusta automáticamente
            4: { cellWidth: 'auto' }, // Columna 'Total Reprobado' se ajusta automáticamente
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

    const generarReporteasignaturasPDF = () => {
       // Validar que haya datos en la tabla
      if (!currentRecords3 || currentRecords3.length === 0) {
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
        doc.text('Reporte de Promedios por Asignatura', doc.internal.pageSize.width / 2, yPosition, { align: 'center' });
    
        yPosition += 10; // Espaciado entre subtítulo y detalles

         // Detalles de la sección, asignatura y año
         doc.setFontSize(12);
         doc.setTextColor(0, 0, 0); // Negro para el texto informativo
         if (gradoSeleccionado && nombreSeccionSeleccionada && anioSeccionSeleccionada  ) {
           doc.text(
             `Grado: ${gradoSeleccionado} | Sección: ${nombreSeccionSeleccionada} | Año: ${anioSeccionSeleccionada}`,
             doc.internal.pageSize.width / 2,
             yPosition,
             { align: 'center' }
           );
         } else if (gradoSeleccionado && nombreSeccionSeleccionada) {
           doc.text(
             `Grado: ${gradoSeleccionado} | Año: ${nombreSeccionSeleccionada}`,
             doc.internal.pageSize.width / 2,
             yPosition,
             { align: 'center' }
           );
         }
   
       yPosition += 8; // Espaciado entre líneas de detalle 

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
          head: [['#', 'Asignatura', 'Descripción', 'Promedio']],
          body: currentRecords3.map((asignatura, index) => [
            index + 1,
            `${asignatura.Nombre_asignatura}`.trim(),
            asignatura.Descripcion_asignatura,
            asignatura.Promedio_Notas,
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
            1: { cellWidth: 'auto' }, // Columna 'asignatura' se ajusta automáticamente
            2: { cellWidth: 'auto' }, // Columna 'Descripcion' se ajusta automáticamente
            3: { cellWidth: 'auto' }, // Columna 'Promedio' se ajusta automáticamente
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

    const generarReportePDF = () => {
      // Validar que haya datos en la tabla
      if (!currentRecords2 || currentRecords2.length === 0) {
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
          head: [['#', 'Sección', 'Grado', 'Total Alumnos','Año Académico','Profesor']],
          body: currentRecords2.map((seccion, index) => [
            index + 1,
            `${seccion.Seccion || ''}`.trim(),
            seccion.Grado,
            seccion.Total_Alumnos,
            seccion.Anio_Academico,
            seccion.Nombre_Profesor,
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
            4: { cellWidth: 'auto' }, // Columna 'Año Académico' se ajusta automáticamente
            5: { cellWidth: 'auto' }, // Columna 'Profesor' se ajusta automáticamente
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
    
    const generarReporteDetallePDF = () => {
      // Validar que haya datos en la tabla
      if (!estudiantesdetalles || estudiantesdetalles.length === 0) {
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
       doc.text('Reporte de Nota por Parcial-Asignatura', doc.internal.pageSize.width / 2, yPosition, { align: 'center' });
   
       yPosition += 10; // Espaciado entre subtítulo y detalles

       // Detalles de la sección, asignatura y año
        // Detalles de la sección, asignatura y año
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0); // Negro para el texto informativo
    
    // Crear el texto para mostrar
    const textoLinea1 = `Grado: ${gradoSeleccionado} | Sección: ${nombreSeccionSeleccionada} | Año: ${anioSeccionSeleccionada} `;
    const textoLinea2 = `Asignatura: ${nombreasignaturaSeleccionada} | Parcial: ${nombreParcialSeleccionado}`;
    
    // Agregar las dos líneas de texto al PDF
    doc.text(textoLinea1, doc.internal.pageSize.width / 2, yPosition, { align: 'center' });
    yPosition += 6; // Espaciado entre las líneas
    doc.text(textoLinea2, doc.internal.pageSize.width / 2, yPosition, { align: 'center' });
    
    yPosition += 8; // Espaciado entre líneas de detalle

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
         head: [['#', 'Nombre Estudiante', 'Nota Total', 'Estado']],
         body: estudiantesdetalles.map((estudiante, index) => [
           index + 1,
           `${estudiante.NombreCompleto}`.trim(),
           estudiante.NotaTotal,
           estudiante.EstadoNota,
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
           1: { cellWidth: 'auto' }, // Columna 'asignatura' se ajusta automáticamente
           2: { cellWidth: 'auto' }, // Columna 'Descripcion' se ajusta automáticamente
           3: { cellWidth: 'auto' }, // Columna 'Promedio' se ajusta automáticamente
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

  const generarReporteDetalleExcel = () => {
  if (!estudiantesdetalles || estudiantesdetalles.length === 0) {
    Swal.fire({
      icon: 'info',
      title: 'Tabla vacía',
      text: 'No hay datos disponibles para generar el reporte Excel.',
      confirmButtonText: 'Aceptar',
    });
    return; // Salir de la función si no hay datos
  }

  // Detalles de la sección, asignatura y año
  let detalles = [];
  if (gradoSeleccionado && nombreSeccionSeleccionada && anioSeccionSeleccionada && nombreasignaturaSeleccionada) {
    const textoLinea1 = `Grado: ${gradoSeleccionado} | Sección: ${nombreSeccionSeleccionada} | Año: ${anioSeccionSeleccionada}`;
    const textoLinea2 = `Asignatura: ${nombreasignaturaSeleccionada} | Parcial: ${nombreParcialSeleccionado}`;
    detalles.push([textoLinea1], [textoLinea2]);
  } else if (gradoSeleccionado && nombreSeccionSeleccionada && anioSeccionSeleccionada) {
    const textoLinea1 = `Grado: ${gradoSeleccionado} | Sección: ${nombreSeccionSeleccionada} | Año: ${anioSeccionSeleccionada}`;
    detalles.push([textoLinea1]);
  } else if (nombreasignaturaSeleccionada) {
    const textoLinea2 = `Asignatura: ${nombreasignaturaSeleccionada}`;
    detalles.push([textoLinea2]);
  }

  const encabezados = [
    ["Saint Patrick Academy"],
    ["Reporte de Nota por Parcial-Asignatura"],
    ...detalles, // Agregar los detalles dinámicos
    [], // Espacio en blanco
    ["#", "Nombre Estudiante", "Nota Total", "Estado"],
  ];

  // Crear filas con asignaturas
  const filas = estudiantesdetalles.map((estudiante, index) => [
    index + 1,
    estudiante.NombreCompleto || "N/A",
    estudiante.NotaTotal,
    estudiante.EstadoNota,
  ]);

  // Combinar encabezados y filas
  const datos = [...encabezados, ...filas];

  // Crear una hoja de trabajo
  const hojaDeTrabajo = XLSX.utils.aoa_to_sheet(datos);

  // Ajustar el texto para que haga salto de línea
  hojaDeTrabajo["!cols"] = [
    { wpx: 40 }, // # (Número)
    { wpx: 200 }, // Nombre estudiante
    { wpx: 100 }, // Nota Total
    { wpx: 100 }, // Estado
  ];

  hojaDeTrabajo["!rows"] = datos.map(() => ({ hpx: 20, wrapText: true }));

  // Crear el libro de trabajo
  const libroDeTrabajo = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(libroDeTrabajo, hojaDeTrabajo, "Promedios Asignaturas");

  // Nombre del archivo con extensión correcta
  const nombreArchivo = "Reporte_NotaTotal_Parcial_Asignatura.xlsx";

  // Descargar el archivo
  XLSX.writeFile(libroDeTrabajo, nombreArchivo);
};

    //-------------------paginacion, buscador vista actual : secciones-----------------------------
  const handleSearch2 = (event) => {
    const input = event.target;
    let value = input.value
      .toUpperCase() // Convertir a mayúsculas
      .trimStart(); // Evitar espacios al inicio

    const regex = /^[A-ZÑÁÉÍÓÚ0-9\s,]*$/; // Solo letras, números, acentos, ñ, espacios y comas

    // Verificar si hay múltiples espacios consecutivos antes de reemplazarlos
    if (/\s{2,}/.test(value)) {
      Swal.fire({
        icon: 'warning',
        title: 'Espacios múltiples',
        text: 'No se permite más de un espacio entre palabras.',
        confirmButtonText: 'Aceptar', 
      });
      value = value.replace(/\s+/g, ' '); // Reemplazar múltiples espacios por uno solo
    }

    // Validar caracteres permitidos
    if (!regex.test(value)) {
      Swal.fire({
        icon: 'warning',
        title: 'Caracteres no permitidos',
        text: 'Solo se permiten letras, números y espacios.',
        confirmButtonText: 'Aceptar', 
      });
      return;
    }

    // Validación para letras repetidas más de 4 veces seguidas
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
            confirmButtonText: 'Aceptar', 
          });
          return;
        }
      }
    }

    // Establecer el valor del input y resetear la página
    setSearchTerm2(value);
    setCurrentPage2(1); // Resetear a la primera página al buscar
  };


  // Filtro de búsqueda
  const filteredSecciones= secciones.filter((seccion) =>
    seccion.Seccion.toLowerCase().includes(searchTerm2.toLowerCase()) ||
    seccion.Grado.toLowerCase().includes(searchTerm2.toLowerCase()) ||
    seccion.Anio_Academico.toString().includes(searchTerm2)
  );

  // Lógica de paginación
  const indexOfLastRecord2 = currentPage2 * recordsPerPage2;
  const indexOfFirstRecord2 = indexOfLastRecord2 - recordsPerPage2;
  const currentRecords2 = filteredSecciones.slice(indexOfFirstRecord2, indexOfLastRecord2);

  // Cambiar página
  const paginate2 = (pageNumber) => {
  if (pageNumber > 0 && pageNumber <= Math.ceil(filteredSecciones.length / recordsPerPage2)) {
    setCurrentPage2(pageNumber);
  }
  }
//------------------------------------------------------------------------------------------------------
  //-------------------paginacion, buscador vista actual : asignaturas-----------------------------
  const handleSearch3 = (event) => {
    const input = event.target;
    let value = input.value
      .toUpperCase() // Convertir a mayúsculas
      .trimStart(); // Evitar espacios al inicio

    const regex = /^[A-ZÑÁÉÍÓÚ0-9\s,]*$/; // Solo letras, números, acentos, ñ, espacios y comas

    // Verificar si hay múltiples espacios consecutivos antes de reemplazarlos
    if (/\s{2,}/.test(value)) {
      Swal.fire({
        icon: 'warning',
        title: 'Espacios múltiples',
        text: 'No se permite más de un espacio entre palabras.',
        confirmButtonText: 'Aceptar', 
      });
      value = value.replace(/\s+/g, ' '); // Reemplazar múltiples espacios por uno solo
    }

    // Validar caracteres permitidos
    if (!regex.test(value)) {
      Swal.fire({
        icon: 'warning',
        title: 'Caracteres no permitidos',
        text: 'Solo se permiten letras, números y espacios.',
        confirmButtonText: 'Aceptar', 
      });
      return;
    }

    // Validación para letras repetidas más de 4 veces seguidas
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
            confirmButtonText: 'Aceptar', 
          });
          return;
        }
      }
    }

    // Establecer el valor del input y resetear la página
    setSearchTerm3(value);
    setCurrentPage3(1); // Resetear a la primera página al buscar
  };


  // Filtro de búsqueda
  const filteredAsignaturas= asignaturas.filter((asignatura) =>
    asignatura.Nombre_asignatura.toLowerCase().includes(searchTerm3.toLowerCase())
  );

  // Lógica de paginación
  const indexOfLastRecord3 = currentPage3 * recordsPerPage3;
  const indexOfFirstRecord3 = indexOfLastRecord3 - recordsPerPage3;
  const currentRecords3 = filteredAsignaturas.slice(indexOfFirstRecord3, indexOfLastRecord3);

  // Cambiar página
  const paginate3 = (pageNumber) => {
  if (pageNumber > 0 && pageNumber <= Math.ceil(filteredAsignaturas.length / recordsPerPage3)) {
    setCurrentPage3(pageNumber);
  }
  }
//------------------------------------------------------------------------------------------------------
//-------------------paginacion, buscador vista actual : Gestionar nota promedios-----------------------------
const handleSearch4 = (event) => {
  const input = event.target;
  let value = input.value
    .toUpperCase() // Convertir a mayúsculas
    .trimStart(); // Evitar espacios al inicio

  const regex = /^[A-ZÑÁÉÍÓÚ0-9\s,]*$/; // Solo letras, números, acentos, ñ, espacios y comas

  // Verificar si hay múltiples espacios consecutivos antes de reemplazarlos
  if (/\s{2,}/.test(value)) {
    Swal.fire({
      icon: 'warning',
      title: 'Espacios múltiples',
      text: 'No se permite más de un espacio entre palabras.',
      confirmButtonText: 'Aceptar', 
    });
    value = value.replace(/\s+/g, ' '); // Reemplazar múltiples espacios por uno solo
  }

  // Validar caracteres permitidos
  if (!regex.test(value)) {
    Swal.fire({
      icon: 'warning',
      title: 'Caracteres no permitidos',
      text: 'Solo se permiten letras, números y espacios.',
      confirmButtonText: 'Aceptar', 
    });
    return;
  }

  // Validación para letras repetidas más de 4 veces seguidas
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
          confirmButtonText: 'Aceptar', 
        });
        return;
      }
    }
  }

  // Establecer el valor del input y resetear la página
  setSearchTerm4(value);
  setCurrentPage4(1); // Resetear a la primera página al buscar
};


// Filtro de búsqueda
const filteredPromedios= promedios.filter((promedio) =>
  promedio.NombreParcial.toLowerCase().includes(searchTerm4.toLowerCase())
);

// Lógica de paginación
const indexOfLastRecord4 = currentPage4 * recordsPerPage4;
const indexOfFirstRecord4 = indexOfLastRecord4 - recordsPerPage4;
const currentRecords4 = filteredPromedios.slice(indexOfFirstRecord4, indexOfLastRecord4);

// Cambiar página
const paginate4 = (pageNumber) => {
if (pageNumber > 0 && pageNumber <= Math.ceil(filteredPromedios.length / recordsPerPage4)) {
  setCurrentPage4(pageNumber);
}
}

// Función para filtrar asistencias por nombre con validaciones
const handleNombreBusquedaChange = (e) => {
  let value = e.target.value
    .toUpperCase() // Convertir a mayúsculas
    .trimStart(); // Evitar espacios al inicio

  const regex = /^[A-ZÑÁÉÍÓÚ0-9\s,]*$/; // Solo letras, números, acentos, ñ, espacios y comas

  // Verificar si hay múltiples espacios consecutivos antes de reemplazarlos
  if (/\s{2,}/.test(value)) {
    Swal.fire({
      icon: 'warning',
      title: 'Espacios múltiples',
      text: 'No se permite más de un espacio entre palabras.',
      confirmButtonText: 'Aceptar', 
    });
    value = value.replace(/\s+/g, ' '); // Reemplazar múltiples espacios por uno solo
  }

  // Validar caracteres permitidos
  if (!regex.test(value)) {
    Swal.fire({
      icon: 'warning',
      title: 'Caracteres no permitidos',
      text: 'Solo se permiten letras, números y espacios.',
      confirmButtonText: 'Aceptar', 
    });
    return; // Detener si el valor no es válido
  }

  // Validación para letras repetidas más de 4 veces seguidas
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
          confirmButtonText: 'Aceptar', 
        });
        return; // Detener si el valor tiene letras repetidas
      }
    }
  }

  // Actualizar el valor de búsqueda
  setNombreBusqueda(value);
};

// Filtro de estudiantes
const NotasFiltradas = estudiantesdetalles.filter((estudiante) => 
  estudiante.NombreCompleto.toUpperCase().includes(nombreBusqueda.toUpperCase()) // Realiza la comparación en mayúsculas
);
//------------------------------------------------------------------------------------------------------  
    return (
      <CContainer className="py-1">
       {cargando && ( 
          <div className="text-center my-5">
            <CSpinner color="primary" aria-label="Cargando información..." />
          </div>
        )}
        {!cargando && currentView === 'secciones' && (
           <>
          <CRow className="align-items-center mb-5">
            <CCol xs="12" className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3"> 
             
            <div className="flex-grow-1 text-center">
                <h4 className="text-center fw-semibold pb-2 mb-0" style={{display: "inline-block", borderBottom: "2px solid #4CAF50" }}> Notas: Lista de Secciones</h4>
              </div>
              <CDropdown className="btn-sm d-flex align-items-center gap-1 rounded shadow">
                <CDropdownToggle
                  style={{backgroundColor: '#6C8E58',color: 'white',fontSize: '0.85rem',cursor: 'pointer',transition: 'all 0.3s ease', }}
                  onMouseEnter={(e) => {e.currentTarget.style.backgroundColor = '#5A784C'; e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';  }}
                  onMouseLeave={(e) => {e.currentTarget.style.backgroundColor = '#6C8E58'; e.currentTarget.style.boxShadow = 'none'; }}>
                  <CIcon icon={cilDescription}/> Reporte
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
                  style={{ width: '80px',height:'35px', display: 'inline-block',fontSize: '0.8rem'}}
                    placeholder="Buscar por año, grado o sección"
                    onChange={handleSearch2}
                    value={searchTerm2}
                    onPaste={disableCopyPaste}
                    onCopy={disableCopyPaste}
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
                        value={recordsPerPage2}
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
                 <CTable striped bordered hover responsive >
                 <CTableHead className="sticky-top bg-light text-center" style={{fontSize: '0.8rem'}}>
                 <CTableRow>
                        <CTableHeaderCell>#</CTableHeaderCell>
                        <CTableHeaderCell>SECCIÓN</CTableHeaderCell>
                        <CTableHeaderCell>GRADO</CTableHeaderCell>
                        <CTableHeaderCell>TOTAL ALUMNOS</CTableHeaderCell>
                        <CTableHeaderCell>AÑO ACADÉMICO</CTableHeaderCell>
                        <CTableHeaderCell>PROFESOR</CTableHeaderCell>
                        <CTableHeaderCell>ACCIÓN</CTableHeaderCell>
                        </CTableRow>
                    </CTableHead>
                    <CTableBody className="text-center" style={{fontSize: '0.85rem',}}>
                    {currentRecords2.length > 0 ? (
                      currentRecords2.map((seccion, index) => (
                        <CTableRow key={index}>
                          <CTableDataCell>{index + 1}</CTableDataCell>
                          <CTableDataCell>{seccion.Seccion}</CTableDataCell>
                          <CTableDataCell>{seccion.Grado}</CTableDataCell>
                          <CTableDataCell>{seccion.Total_Alumnos}</CTableDataCell>
                          <CTableDataCell>{seccion.Anio_Academico}</CTableDataCell>
                          <CTableDataCell>{seccion.Nombre_Profesor}</CTableDataCell>
                          <CTableDataCell>
                            <CButton
                              size="sm"
                              style={{
                                backgroundColor: "#F0F4F3",
                                color: "#153E21",
                                border: "1px solid #A2B8A9",
                                borderRadius: "6px",
                                padding: "5px 12px",
                                boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
                              }}
                              onMouseEnter={(e) => (e.target.style.backgroundColor = "#dce3dc")}
                              onMouseLeave={(e) => (e.target.style.backgroundColor = "#F0F4F3")}
                              onClick={() => {
                                handleViewAsignaturas(seccion.Cod_secciones, seccion.Seccion, seccion.Grado, seccion.Anio_Academico);
                              }}
                            >
                              Ver Asignaturas
                            </CButton>
                          </CTableDataCell>
                        </CTableRow>
                      ))
                    ) : (
                      <CTableRow>
                        <CTableDataCell colSpan="5">No se encontraron resultados</CTableDataCell>
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
                        disabled={currentPage2 === 1} // Deshabilitar si estás en la primera página
                        onClick={() => paginate2(currentPage2 - 1)}>
                        Anterior
                      </CButton>
                      <CButton
                        style={{ marginLeft: '10px',backgroundColor: '#6f8173', color: '#D9EAD3' }}
                        disabled={currentPage2 === Math.ceil(filteredSecciones.length / recordsPerPage2)} // Deshabilitar si estás en la última página
                        onClick={() => paginate2(currentPage2 + 1)}>
                        Siguiente
                    </CButton>
                  </CPagination>
                    {/* Mostrar total de páginas */}
                    <span style={{ marginLeft: '10px' }}>
                      Página {currentPage2} de {Math.ceil(filteredSecciones.length / recordsPerPage2)}
                    </span>
                </div>
             </>
        )}
  
     {!cargando && currentView === 'asignaturas' && (
     <>
     <CRow className="align-items-center mb-5">
        <CCol xs="12" className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
          <CButton className="btn btn-sm d-flex align-items-center gap-1 rounded shadow"
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#4B4B4B")} onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#656565")}
            style={{backgroundColor: "#656565",color: "#FFFFFF",padding: "6px 12px",fontSize: "0.9rem",transition: "background-color 0.2s ease, box-shadow 0.3s ease",boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",}}
            onClick={handleBackToSecciones}>
            <CIcon icon={cilArrowLeft} /> Volver a Secciones
          </CButton>    
          <div className="d-flex flex-column justify-content-center align-items-center flex-grow-1">
            <h3 className="text-center pb-2 mb-0" style={{borderBottom: "2px solid #4CAF50", margin: "0 auto", fontSize: "1.5rem"}}>
              Asignaturas
            </h3>
            <div className="d-flex justify-content-center align-items-center mt-2">
              <div className="me-3" style={{fontSize: "1rem"}}>Grado: {gradoSeleccionado}</div>
              <div className="me-3" style={{fontSize: "1rem"}}>Sección: {nombreSeccionSeleccionada}</div>
              <div className="me-3" style={{fontSize: "1rem"}}>Año: {anioSeccionSeleccionada}</div>
            </div>
          </div>


            <CDropdown className="btn-sm d-flex align-items-center gap-1 rounded shadow">
                <CDropdownToggle
                  style={{backgroundColor: '#6C8E58',color: 'white',fontSize: '0.85rem',cursor: 'pointer',transition: 'all 0.3s ease', }}
                  onMouseEnter={(e) => {e.currentTarget.style.backgroundColor = '#5A784C'; e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';  }}
                  onMouseLeave={(e) => {e.currentTarget.style.backgroundColor = '#6C8E58'; e.currentTarget.style.boxShadow = 'none'; }}>
                  <CIcon icon={cilDescription}/> Reporte
                </CDropdownToggle>
                <CDropdownMenu style={{position: "absolute", zIndex: 1050, /* Asegura que el menú esté por encima de otros elementos*/ backgroundColor: "#fff",boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.2)",borderRadius: "4px",overflow: "hidden",}}>
                  <CDropdownItem
                    onClick={generarReporteasignaturasPDF}
                    style={{cursor: "pointer",outline: "none",backgroundColor: "transparent",padding: "0.5rem 1rem",fontSize: "0.85rem",color: "#333",borderBottom: "1px solid #eaeaea",transition: "background-color 0.3s",}}
                    onMouseOver={(e) =>(e.target.style.backgroundColor = "#f5f5f5")} onMouseOut={(e) =>(e.target.style.backgroundColor = "transparent")}>
                    <CIcon icon={cilFile} size="sm" /> Abrir en PDF
                  </CDropdownItem>
                  <CDropdownItem
                    onClick={generarReporteasignaturasExcel}
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
            style={{ width: '80px',height:'35px', display: 'inline-block',fontSize: '0.8rem'}}
              placeholder="Buscar asignatura..."
              onChange={handleSearch3}
              value={searchTerm3}
              onPaste={disableCopyPaste}
              onCopy={disableCopyPaste}
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
          <CTable striped bordered hover responsive >
          <CTableHead className="sticky-top bg-light text-center" style={{fontSize: '0.8rem'}}>
          <CTableRow>
              <CTableHeaderCell>#</CTableHeaderCell>
              <CTableHeaderCell>ASIGNATURA</CTableHeaderCell>
              <CTableHeaderCell>DESCRIPCIÓN</CTableHeaderCell>
              <CTableHeaderCell className="text-center align-middle">PROMEDIO NOTAS</CTableHeaderCell>
              <CTableHeaderCell>ACCIÓN</CTableHeaderCell>
              </CTableRow>
              </CTableHead>
              <CTableBody className="text-center" style={{fontSize: '0.85rem',}}>
              {currentRecords3.length > 0 ? (
              currentRecords3.map((asignatura, index) => (
              <CTableRow key={index}>
                <CTableDataCell>{index + 1}</CTableDataCell>
                <CTableDataCell>{asignatura.Nombre_asignatura}</CTableDataCell>
                <CTableDataCell>{asignatura.Descripcion_asignatura}</CTableDataCell>
                <CTableDataCell className="text-center align-middle">{asignatura.Promedio_Notas}
                </CTableDataCell>
                <CTableDataCell>
                  <CButton
                    style={{
                      backgroundColor: "#F0F4F3",
                      color: "#153E21",
                      border: "1px solid #A2B8A9",
                      borderRadius: "6px",
                      padding: "5px 12px",
                      boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
                    }}
                    size="sm"
                    onMouseEnter={(e) => (e.target.style.backgroundColor = "#dce3dc")}
                    onMouseLeave={(e) => (e.target.style.backgroundColor = "#F0F4F3")}
                    onClick={() => { handleViewPromedios(asignatura.Cod_seccion_asignatura, asignatura.Nombre_asignatura);
                    }}

                  >
                    Gestionar Notas
                  </CButton>
                </CTableDataCell>
              </CTableRow>
            ))
          ) : (
            <CTableRow>
              <CTableDataCell colSpan="5">No se encontraron resultados</CTableDataCell>
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
            disabled={currentPage3 === Math.ceil(filteredAsignaturas.length / recordsPerPage3)} // Deshabilitar si estás en la última página
            onClick={() => paginate3(currentPage3 + 1)}>
            Siguiente
        </CButton>
      </CPagination>
        {/* Mostrar total de páginas */}
        <span style={{ marginLeft: '10px' }}>
          Página {currentPage3} de {Math.ceil(filteredAsignaturas.length / recordsPerPage3)}
        </span>
    </div>
    </>
  )}
      
  
  
  {!cargando && currentView === 'promedios' && (
  <>
  <CRow className="align-items-center mb-5">
    <CCol xs="12" className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
    <CButton className="btn btn-sm d-flex align-items-center gap-1 rounded shadow"
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#4B4B4B")} onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#656565")}
      style={{backgroundColor: "#656565",color: "#FFFFFF",padding: "6px 12px",fontSize: "0.9rem",transition: "background-color 0.2s ease, box-shadow 0.3s ease",boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",}}
      onClick={handleBackToAsignaturas}>
      <CIcon icon={cilArrowLeft} /> Volver a Asignaturas
    </CButton>  
    <div className="d-flex flex-column justify-content-center align-items-center flex-grow-1">
      <h4 className="text-center pb-2 mb-0" style={{borderBottom: "2px solid #4CAF50", margin: "0 auto", fontSize: "1.5rem"}}>
        Promedios - Asignatura
      </h4>
      <div className="d-flex flex-wrap justify-content-center align-items-center mt-2">
        <div className="me-3" style={{fontSize: "1rem"}}>Grado: {gradoSeleccionado}</div>
        <div className="me-3" style={{fontSize: "1rem"}}>Sección: {nombreSeccionSeleccionada}</div>
        <div className="me-3" style={{fontSize: "1rem"}}>Año: {anioSeccionSeleccionada}</div>
        <div style={{fontSize: "1rem"}}>Asignatura: {nombreasignaturaSeleccionada}</div>
      </div>
    </div>

        {/* Botón "Nuevo" a la derecha */}
        {canInsert && (
          <CButton className="btn btn-sm d-flex align-items-center gap-1 rounded shadow"
          onClick={() => fetchActividades(selectedCodSeccionAsignatura)} 
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#3C4B43")}onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#4B6251")}
            style={{backgroundColor: "#4B6251",color: "#FFFFFF",padding: "5px 10px",fontSize: "0.9rem",}}>
            <CIcon icon={cilPlus} className="me-2" />
            Nuevo
          </CButton>
        )}
        <CDropdown className="btn-sm d-flex align-items-center gap-1 rounded shadow">
          <CDropdownToggle
            style={{backgroundColor: '#6C8E58',color: 'white',fontSize: '0.85rem',cursor: 'pointer',transition: 'all 0.3s ease', }}
            onMouseEnter={(e) => {e.currentTarget.style.backgroundColor = '#5A784C'; e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';  }}
            onMouseLeave={(e) => {e.currentTarget.style.backgroundColor = '#6C8E58'; e.currentTarget.style.boxShadow = 'none'; }}>
            <CIcon icon={cilDescription}/> Reporte
          </CDropdownToggle>
          <CDropdownMenu style={{position: "absolute", zIndex: 1050, /* Asegura que el menú esté por encima de otros elementos*/ backgroundColor: "#fff",boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.2)",borderRadius: "4px",overflow: "hidden",}}>
            <CDropdownItem
                onClick={generarReportepromediosPDF}
              style={{cursor: "pointer",outline: "none",backgroundColor: "transparent",padding: "0.5rem 1rem",fontSize: "0.85rem",color: "#333",borderBottom: "1px solid #eaeaea",transition: "background-color 0.3s",}}
              onMouseOver={(e) =>(e.target.style.backgroundColor = "#f5f5f5")} onMouseOut={(e) =>(e.target.style.backgroundColor = "transparent")}>
              <CIcon icon={cilFile} size="sm" /> Abrir en PDF
            </CDropdownItem>
            <CDropdownItem
              onClick={generarReportepromediosExcel}
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
          style={{ width: '80px',height:'35px', display: 'inline-block',fontSize: '0.8rem'}}
            placeholder="Buscar parcial..."
            onChange={handleSearch4}
            value={searchTerm4}
            onPaste={disableCopyPaste}
            onCopy={disableCopyPaste}
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
     <div className="table-responsive" style={{maxHeight: '400px',overflowX: 'auto',overflowY: 'auto', boxShadow: "0 4px 10px rgba(0, 0, 0, 0.3)"}}>
     <CTable striped bordered hover responsive >
     <CTableHead className="sticky-top bg-light text-center" style={{fontSize: '0.8rem'}}>
     <CTableRow>
        <CTableHeaderCell>#</CTableHeaderCell>
        <CTableHeaderCell>PARCIAL</CTableHeaderCell>
        <CTableHeaderCell className="text-center align-middle">PROMEDIO</CTableHeaderCell>
        <CTableHeaderCell className="text-center align-middle">TOTAL APROBADOS</CTableHeaderCell>
        <CTableHeaderCell className="text-center align-middle">TOTAL REPROBADOS</CTableHeaderCell>
        <CTableHeaderCell className="text-center align-middle">ACCIÓN</CTableHeaderCell>
        </CTableRow>
        </CTableHead>
        <CTableBody className="text-center" style={{fontSize: '0.85rem',}}>
        {currentRecords4.length > 0 ? (
        currentRecords4.map((promedio, index) => (
        <CTableRow key={index}>
          <CTableDataCell>{index + 1}</CTableDataCell>
          <CTableDataCell>{promedio.NombreParcial}</CTableDataCell>
          <CTableDataCell className="text-center align-middle">{promedio.PromedioGeneral}</CTableDataCell>
          <CTableDataCell className="text-center align-middle">{promedio.TotalAprobados}</CTableDataCell>
          <CTableDataCell className="text-center align-middle">{promedio.TotalReprobados}</CTableDataCell>
          <CTableDataCell
            style={{
              fontSize: '0.85rem',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '10px', // Añadimos separación consistente
              flexWrap: 'wrap', // Permite que los botones se apilen en pantallas pequeñas
            }}
          >
             {canUpdate && (
            <CButton
            onClick={() => fetchActividadcalificadas(selectedCodSeccionAsignatura, promedio.CodParcial, promedio.NombreParcial)}
            onMouseEnter={(e) => {e.currentTarget.style.boxShadow = '0px 4px 10px rgba(249, 182, 78, 0.6)';e.currentTarget.style.color = '#000000';}}
            onMouseLeave={(e) => {e.currentTarget.style.boxShadow = 'none';e.currentTarget.style.color = '#5C4044';}}
            style={{backgroundColor: '#F9B64E',color: '#5C4044',border: 'none', transition: 'all 0.2s ease',padding: '5px 10px',height: '38px',width: '45px',}}>
            <CIcon icon={cilPen} />
          </CButton>
             )}
            <CButton
            onClick={() =>
              handleAbrirModalEstudiantes(
                selectedCodSeccion,
                selectedCodSeccionAsignatura,
                promedio.CodParcial,
                promedio.NombreParcial
              )
            }
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0px 4px 10px rgba(93, 138, 168, 0.6)';e.currentTarget.style.color = '#000000'; }}
              onMouseLeave={(e) => {e.currentTarget.style.boxShadow = 'none';e.currentTarget.style.color = '#5C4044';}}
              style={{backgroundColor: '#5D8AA8',marginRight: '10px',color: '#5C4044',border: 'none', transition: 'all 0.2s ease',padding: '5px 10px', height: '38px',width: '45px', }}>
              <CIcon icon={cilInfo} />
            </CButton>
            
          </CTableDataCell>
        </CTableRow>
      ))
    ) : (
      <CTableRow>
        <CTableDataCell colSpan="5">No se encontraron resultados</CTableDataCell>
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
          disabled={currentPage4 === 1} // Deshabilitar si estás en la primera página
          onClick={() => paginate4(currentPage4 - 1)}>
          Anterior
        </CButton>
        <CButton
          style={{ marginLeft: '10px',backgroundColor: '#6f8173', color: '#D9EAD3' }}
          disabled={currentPage4 === Math.ceil(filteredPromedios.length / recordsPerPage4)} // Deshabilitar si estás en la última página
          onClick={() => paginate4(currentPage4 + 1)}>
          Siguiente
      </CButton>
    </CPagination>
      {/* Mostrar total de páginas */}
      <span style={{ marginLeft: '10px' }}>
        Página {currentPage4} de {Math.ceil(filteredPromedios.length / recordsPerPage4)}
      </span>
  </div>
  </>
)}

{mostrarModalParciales && (
  <CModal visible={mostrarModalParciales} size="xl" backdrop="static">
    <CModalHeader closeButton={false}>
      <CModalTitle> Registrar Notas</CModalTitle>
      <CButton type="button" className="btn-close" onClick={cerrarModalParciales} />
    </CModalHeader >
    <CModalBody className="text-center">
      {vistaModal === 'parciales' && (
        <>
        <h5 className="mb-4">Selecciona un Parcial</h5>
        {parciales.length > 0 ? (
        <CTable striped bordered hover responsive>
          <CTableHead className="sticky-top bg-light text-center" style={{fontSize: '0.8rem'}}>
            <CTableRow>
              <CTableHeaderCell>#</CTableHeaderCell>
              <CTableHeaderCell>NOMBRE PARCIAL</CTableHeaderCell>
              <CTableHeaderCell>ACCIÓN</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody className="text-center" style={{fontSize: '0.9rem',}}>
            {parciales.map((parcial, index) => (
              <CTableRow key={index}>
                <CTableDataCell>{index + 1}</CTableDataCell>
                <CTableDataCell>{parcial.nombre}</CTableDataCell>
                <CTableDataCell>
                  <CButton
                    size="sm"
                    style={{
                      backgroundColor: "#F0F4F3",
                      color: "#153E21",
                      border: "1px solid #A2B8A9",
                      borderRadius: "6px",
                      boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
                    }}
                    onMouseEnter={(e) => (e.target.style.backgroundColor = "#dce3dc")}
                    onMouseLeave={(e) => (e.target.style.backgroundColor = "#F0F4F3")}
                    onClick={() => handleIrAActividades(parcial)}
                  >
                    Ver Actividades
                  </CButton>
                </CTableDataCell>
              </CTableRow>
            ))}
          </CTableBody>
        </CTable>
         ) : (
          <p className="text-center text-muted"> No hay parciales disponibles, aún no se han asignado actividades</p>
        )}
        </>
      )}

      {vistaModal === 'actividades' && (
        <>
        <h5 className="mb-4">Listado de Actividades del Parcial: {parcialSeleccionado}</h5>
        <CTable striped bordered hover responsive>
          <CTableHead className="sticky-top bg-light text-center" style={{fontSize: '0.8rem'}}>
            <CTableRow>
              <CTableHeaderCell>#</CTableHeaderCell>
              <CTableHeaderCell>NOMBRE ACTIVIDAD</CTableHeaderCell>
              <CTableHeaderCell>DESCRIPCIÓN</CTableHeaderCell>
              <CTableHeaderCell>FECHA INICIO</CTableHeaderCell>
              <CTableHeaderCell>FECHA FIN</CTableHeaderCell>
              <CTableHeaderCell>VALOR</CTableHeaderCell>
              <CTableHeaderCell>ACCIÓN</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody className="text-center" style={{fontSize: '0.9rem',}}>
            {actividades.map((actividad, index) => (
              <CTableRow key={actividad.Cod_actividad_asignatura}>
                <CTableDataCell>{index + 1}</CTableDataCell>
                <CTableDataCell>{actividad.Nombre_actividad_academica}</CTableDataCell>
                <CTableDataCell>{actividad.Descripcion_actividad}</CTableDataCell>
                <CTableDataCell>{formatDateTime(actividad.Fechayhora_Inicio)}</CTableDataCell>
                <CTableDataCell>{formatDateTime(actividad.Fechayhora_Fin)}</CTableDataCell>
                <CTableDataCell>{actividad.Valor}</CTableDataCell>
                <CTableDataCell>
                {actividad.EstadoCalificacion === "Calificada" ? (
                  <CButton
                    size="sm"
                    disabled
                    style={{
                      backgroundColor: "#d3d3d3",
                      color: "#000000",
                      border: "1px solid #A9A7A8",
                      borderRadius: "6px",
                      padding: "5px 12px",
                      boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
                      cursor: "not-allowed",
                    }}
                  >
                    Calificada
                  </CButton>
                ) : (
                  <CButton
                    size="sm"
                    style={{
                      backgroundColor: "#F0F4F3",
                      color: "#153E21",
                      border: "1px solid #A2B8A9",
                      borderRadius: "6px",
                      padding: "5px 12px",
                      boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
                    }}
                    onMouseEnter={(e) => (e.target.style.backgroundColor = "#dce3dc")}
                    onMouseLeave={(e) => (e.target.style.backgroundColor = "#F0F4F3")}
                    onClick={() => handleIrAEstudiantes(actividad)}
                  >
                    Calificar
                  </CButton>
                )}
              </CTableDataCell>
              </CTableRow>
            ))}
          {/* Fila para la sumatoria */}
      <CTableRow>
        <CTableDataCell colSpan={5} style={{ fontWeight: "bold", textAlign: "right" }}>
          Total
        </CTableDataCell>
        <CTableDataCell style={{ fontWeight: "bold" }}>
          {actividades.reduce((sum, actividad) => sum + parseFloat(actividad.Valor || 0), 0).toFixed(2)}
        </CTableDataCell>
        <CTableDataCell />
      </CTableRow>
    </CTableBody>
  </CTable>
  </>
)}

{vistaModal === 'estudiantes' && (
  <>
  <h5 className="mb-4">Calificar Actividad: {actividadSeleccionada?.Nombre_actividad_academica}</h5>
  <CTable striped bordered hover responsive>
    <CTableHead className="sticky-top bg-light text-center" style={{fontSize: '0.8rem'}}>
      <CTableRow>
        <CTableHeaderCell>#</CTableHeaderCell>
        <CTableHeaderCell>NOMBRE DEL ESTUDIANTE</CTableHeaderCell>
        <CTableHeaderCell>NOTA</CTableHeaderCell>
        <CTableHeaderCell>OBSERVACIÓN</CTableHeaderCell>
      </CTableRow>
    </CTableHead>
    <CTableBody className="text-center" style={{fontSize: '0.9rem',}}>
      {estudiantes.map((estudiante, index) => (
        <CTableRow key={estudiante.cod_persona}>
          <CTableDataCell>{index + 1}</CTableDataCell>
          <CTableDataCell>{estudiante.Nombre_Completo}</CTableDataCell>
          <CTableDataCell>
          <input
            type="number"
            className="form-control"
            placeholder={`Máx: ${actividadSeleccionada?.Valor}`}
            value={estudiante.nota !== undefined && estudiante.nota !== null ? estudiante.nota : ''}
            onChange={(e) => {
              const valorIngresado = e.target.value;

              // Si el valor está vacío, lo dejamos vacío
              if (valorIngresado === '') {
                const estudiantesActualizados = estudiantes.map((est) =>
                  est.cod_persona === estudiante.cod_persona ? { ...est, nota: '' } : est
                );
                setEstudiantes(estudiantesActualizados);
                return;
              }

              // Convertir a número solo si el valor es completamente válido
              const nuevaNota = parseFloat(valorIngresado);

              // Validaciones adicionales
              if (isNaN(nuevaNota)) {
                return; // Si no es un número, no hacer nada
              }

              if (nuevaNota < 0) {
                Swal.fire('Nota inválida', 'La nota no puede ser negativa.', 'info');
                return;
              }

              if (nuevaNota > actividadSeleccionada?.Valor) {
                Swal.fire(
                  'Nota inválida',
                  `La nota no puede ser mayor a ${actividadSeleccionada?.Valor}.`,
                  'info'
                );
                return;
              }

              // Actualizar la nota del estudiante
              const estudiantesActualizados = estudiantes.map((est) =>
                est.cod_persona === estudiante.cod_persona ? { ...est, nota: nuevaNota } : est
              );
              setEstudiantes(estudiantesActualizados);
            }}
            min="0" // Permite el valor cero
            step="0.01" // Permite decimales con hasta dos decimales
          />
        </CTableDataCell>

        <CTableDataCell>
        <textarea
          className="form-control"
          placeholder="Ingrese observación"
          value={estudiante.observacion || ''}
          style={{
            height: "38px", // Altura fija igual al input de nota
          }}
          onChange={(e) => {
            const cursorPosition = e.target.selectionStart; // Obtiene la posición actual del cursor
            const inputValue = e.target.value;

            // Validar que no exceda el máximo de 60 caracteres
            if (inputValue.length > 60) {
              Swal.fire({
                icon: 'info',
                title: 'Límite de caracteres alcanzado',
                text: 'La observación no puede tener más de 60 caracteres.',
              });
              return; // Detener la actualización si excede el límite
            }

            const estudiantesActualizados = estudiantes.map((est) =>
              est.cod_persona === estudiante.cod_persona
                ? { ...est, observacion: inputValue }
                : est
            );

            // Aplicar validación de caracteres, espacios y letras repetidas
            handleInputChange(e, (nuevoValor) => {
              const actualizadosConValidacion = estudiantesActualizados.map((est) =>
                est.cod_persona === estudiante.cod_persona
                  ? { ...est, observacion: nuevoValor }
                  : est
              );
              setEstudiantes(actualizadosConValidacion);

              // Restablecer la posición del cursor después de actualizar el valor
              requestAnimationFrame(() => {
                e.target.setSelectionRange(cursorPosition, cursorPosition);
              });
            });
          }}
          onCopy={disableCopyPaste}
          onPaste={disableCopyPaste}
        ></textarea>
      </CTableDataCell>
        </CTableRow>
      ))}
    </CTableBody>
  </CTable>
  </>
)}

    </CModalBody>
    <CModalFooter>
      {vistaModal === 'actividades' && (
        <CButton  onClick={handleVolverAParciales}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#4B4B4B")} onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#656565")}
          style={{backgroundColor: "#656565",color: "#FFFFFF",transition: "background-color 0.2s ease, box-shadow 0.3s ease",boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",}}>
          <CIcon icon={cilArrowLeft} />
          Volver a Parciales
        </CButton>
      )}
      {vistaModal === 'estudiantes' && (
        <CButton  onClick={handleVolverAActividades}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#4B4B4B")} onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#656565")}
          style={{backgroundColor: "#656565",color: "#FFFFFF",transition: "background-color 0.2s ease, box-shadow 0.3s ease",boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",}}>
          <CIcon icon={cilArrowLeft} />
          Volver a Actividades
        </CButton>
      )}
      {vistaModal === 'estudiantes' && (
        <CButton
          onClick={guardarNotas}
          onMouseEnter={(e) => {e.currentTarget.style.backgroundColor = "#3C4B43";  }}
            onMouseLeave={(e) => {e.currentTarget.style.backgroundColor = "#4B6251"; }}
            style={{backgroundColor: '#4B6251',color: '#FFFFFF',padding: '6px 12px',transition: 'background-color 0.2s ease, box-shadow 0.3s ease', }}>
            <CIcon icon={cilSave} /> Guardar 
        </CButton>
      )}
      <CButton color="secondary" onClick={cerrarModalParciales}>
        Cerrar
      </CButton>
    </CModalFooter>
  </CModal>
)}


{mostrarModalActividades && (
  <CModal visible={mostrarModalActividades} size="xl" backdrop="static">
    <CModalHeader closeButton={false}>
      <CModalTitle>Actualizar Notas </CModalTitle>
      <CButton type="button" className="btn-close" onClick={cerrarModalActividad} />
    </CModalHeader >
    <CModalBody className="text-center">
      {vistaModal2 === 'activid' && (
        <>
         <h5 className="mb-4">Listado de Actividades del Parcial: {nombreParcialSeleccionado}</h5>
         <CTable striped bordered hover responsive>
          <CTableHead className="sticky-top bg-light text-center" style={{fontSize: '0.8rem'}}>
            <CTableRow>
              <CTableHeaderCell>#</CTableHeaderCell>
              <CTableHeaderCell>NOMBRE ACTIVIDAD</CTableHeaderCell>
              <CTableHeaderCell>DESCRIPCIÓN</CTableHeaderCell>
              <CTableHeaderCell>FECHA INICIO</CTableHeaderCell>
              <CTableHeaderCell>FECHA FIN</CTableHeaderCell>
              <CTableHeaderCell>VALOR</CTableHeaderCell>
              <CTableHeaderCell>ACCIÓN</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody className="text-center" style={{fontSize: '0.9rem',}}>
            {actividadescalificadas.map((actividad, index) => (
              <CTableRow key={actividad.Cod_actividad_asignatura}>
                <CTableDataCell>{index + 1}</CTableDataCell>
                <CTableDataCell>{actividad.Nombre_actividad_academica}</CTableDataCell>
                <CTableDataCell>{actividad.Descripcion_actividad}</CTableDataCell>
                <CTableDataCell>{formatDateTime(actividad.Fechayhora_Inicio)}</CTableDataCell>
                <CTableDataCell>{formatDateTime(actividad.Fechayhora_Fin)}</CTableDataCell>
                <CTableDataCell>{actividad.Valor}</CTableDataCell>
                <CTableDataCell>
                  <CButton
                    size="sm"
                    style={{
                      backgroundColor: "#F0F4F3",
                      color: "#153E21",
                      border: "1px solid #A2B8A9",
                      borderRadius: "6px",
                      padding: "5px 12px",
                      boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
                    }}
                    onMouseEnter={(e) => (e.target.style.backgroundColor = "#dce3dc")}
                    onMouseLeave={(e) => (e.target.style.backgroundColor = "#F0F4F3")}
                    onClick={() => handleIrAEstudiant(actividad)}
                  >
                    Calificar
                  </CButton>
                </CTableDataCell>
              </CTableRow>
            ))}
          {/* Fila para la sumatoria */}
      <CTableRow>
        <CTableDataCell colSpan={5} style={{ fontWeight: "bold", textAlign: "right" }}>
          Total
        </CTableDataCell>
        <CTableDataCell style={{ fontWeight: "bold" }}>
          {actividadescalificadas.reduce((sum, actividad) => sum + parseFloat(actividad.Valor || 0), 0).toFixed(2)}
        </CTableDataCell>
        <CTableDataCell />
      </CTableRow>
    </CTableBody>
  </CTable>
  </>
)}

{vistaModal2 === 'estudiant' && (
  <>
    <h5 className="mb-4">Calificar Actividad: {actividadSeleccionada?.Nombre_actividad_academica}</h5>
    <CTable striped bordered hover responsive>
      <CTableHead className="sticky-top bg-light text-center" style={{ fontSize: "0.8rem" }}>
        <CTableRow>
          <CTableHeaderCell>#</CTableHeaderCell>
          <CTableHeaderCell>NOMBRE DEL ESTUDIANTE</CTableHeaderCell>
          <CTableHeaderCell>NOTA</CTableHeaderCell>
          <CTableHeaderCell>OBSERVACIÓN</CTableHeaderCell>
        </CTableRow>
      </CTableHead>
      <CTableBody className="text-center" style={{ fontSize: "0.9rem" }}>
        {notas.length === 0 ? (
          <CTableRow>
            <CTableDataCell colSpan={4} className="text-center">
              <p>No hay notas disponibles para esta actividad.</p>
            </CTableDataCell>
          </CTableRow>
        ) : (
          notas.map((nota, index) => (
            <CTableRow key={nota.Cod_nota}>
              <CTableDataCell>{index + 1}</CTableDataCell>
              <CTableDataCell>{nota.Nombre_Completo}</CTableDataCell>
              <CTableDataCell>
              <input
                type="number"
                className="form-control"
                placeholder={`Máx: ${actividadSeleccionada?.Valor}`}
                value={nota.Nota !== undefined && nota.Nota !== null ? nota.Nota : ''}
                onChange={(e) => {
                  const valorIngresado = e.target.value;

                  // Permitir solo números y decimales
                  if (valorIngresado === '' || !isNaN(valorIngresado)) {
                    // Convertir el valor a número decimal
                    const nuevaNota = parseFloat(valorIngresado);

                    // Validar si la nota es negativa
                    if (nuevaNota < 0) {
                      Swal.fire("Nota inválida", "La nota no puede ser negativa.", "info");
                      return;
                    }

                    // Validar si la nota excede el valor máximo permitido
                    if (nuevaNota > actividadSeleccionada?.Valor) {
                      Swal.fire(
                        "Nota inválida",
                        `La nota no puede ser mayor a ${actividadSeleccionada?.Valor}.`,
                        "info"
                      );
                      return;
                    }

                    // Actualizar solo la nota del estudiante correspondiente
                    const notasActualizadas = notas.map((est) =>
                      est.Cod_nota === nota.Cod_nota ? { ...est, Nota: nuevaNota } : est
                    );
                    setNotas(notasActualizadas);
                  }
                }}
                step="0.01"  // Permite valores decimales
                min="0"  // Permite ceros
              />
              </CTableDataCell>
              <CTableDataCell>
                <textarea
                  className="form-control"
                  placeholder="Ingrese observación"
                  value={nota.Observacion || ""}
                  style={{
                    height: "38px", // Altura fija igual al input de nota
                  }}
                  onChange={(e) => {
                    const cursorPosition = e.target.selectionStart; // Obtiene la posición actual del cursor

                    // Validación y transformación del input usando `handleInputChange`
                    handleInputChange(e, (nuevoValor) => {
                      const notasActualizadas = notas.map((est) =>
                        est.Cod_nota === nota.Cod_nota
                          ? { ...est, Observacion: nuevoValor }
                          : est
                      );
                      setNotas(notasActualizadas);

                      // Restablecer la posición del cursor después de actualizar el valor
                      requestAnimationFrame(() => {
                        e.target.setSelectionRange(cursorPosition, cursorPosition);
                      });
                    });
                  }}
                  onCopy={disableCopyPaste}
                  onPaste={disableCopyPaste}
                ></textarea>
              </CTableDataCell>
            </CTableRow>
          ))
        )}
      </CTableBody>
    </CTable>
  </>
)}



    </CModalBody>
    <CModalFooter>
      {vistaModal2 === 'estudiant' && (
        <CButton  onClick={handleVolverAActividad}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#4B4B4B")} onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#656565")}
          style={{backgroundColor: "#656565",color: "#FFFFFF",transition: "background-color 0.2s ease, box-shadow 0.3s ease",boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",}}>
          <CIcon icon={cilArrowLeft} />
          Volver a Actividades
        </CButton>
      )}
      {vistaModal2 === 'estudiant' && (
        <CButton
        onClick={actualizarNotas}
        onMouseEnter={(e) => {e.currentTarget.style.backgroundColor = "#b28541"; }}
        onMouseLeave={(e) => {e.currentTarget.style.backgroundColor = "#9f7536"; }}
        style={{ backgroundColor: "#9f7536", color: "#FFFFFF" }}
      >
        <CIcon icon={cilPen} /> Actualizar
      </CButton>
      
      )}
      <CButton color="secondary" onClick={cerrarModalActividad}>
        Cerrar
      </CButton>
    </CModalFooter>
  </CModal>
)}


<CModal visible={mostrarModalDetalleEstudiantes} onClose={() => {setMostrarDetalleModalEstudiantes(false); setNombreBusqueda("");}} size="xl" backdrop="static">
  <CModalHeader closeButton>
    <CModalTitle>Detalles de Estudiantes</CModalTitle>
  </CModalHeader>
  <CModalBody>
    {/* Filtro por nombre */}
   <CRow className="mb-3 justify-content-center align-items-center">
            <CCol xs="12" md="6" className="d-flex align-items-center">
              <CIcon icon={cilSearch} style={{ marginRight: '8px', fontSize: '1.2rem', color: '#6C8E58' }} />
              <CFormInput
                placeholder="Buscar por nombre"
                value={nombreBusqueda}
                onChange={handleNombreBusquedaChange} 
                style={{ fontSize: '0.85rem', flex: 1 }}
              />
            </CCol>
            <CCol xs="auto" style={{ zIndex: 1050 }}>
              <CDropdown>
               <CDropdownToggle
                  style={{ backgroundColor: '#6C8E58',color: 'white',fontSize: '0.85rem',cursor: 'pointer',transition: 'all 0.3s ease', }}
                  onMouseEnter={(e) => {e.currentTarget.style.backgroundColor = '#5A784C'; e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)'; }}
                  onMouseLeave={(e) => {e.currentTarget.style.backgroundColor = '#6C8E58'; e.currentTarget.style.boxShadow = 'none';}}>
                 <CIcon icon={cilDescription}/> Reporte
                </CDropdownToggle>
                <CDropdownMenu>
                  <CDropdownItem
                    onClick={generarReporteDetallePDF}
                    style={{cursor: 'pointer',outline: 'none', backgroundColor: 'transparent',padding: '0.5rem 1rem',fontSize: '0.85rem',color: '#333',borderBottom: '1px solid #eaeaea',transition: 'background-color 0.3s',}}
                    onMouseOver={(e) => (e.target.style.backgroundColor = '#f5f5f5')}onMouseOut={(e) => (e.target.style.backgroundColor = 'transparent')}>
                    <CIcon icon={cilFile} size="sm" /> Abrir en PDF
                 </CDropdownItem>
                  <CDropdownItem
                    onClick={generarReporteDetalleExcel}
                    style={{cursor: 'pointer',outline: 'none',backgroundColor: 'transparent',padding: '0.5rem 1rem',fontSize: '0.85rem',color: '#333', transition: 'background-color 0.3s',}}
                    onMouseOver={(e) => (e.target.style.backgroundColor = '#f5f5f5')}onMouseOut={(e) => (e.target.style.backgroundColor = 'transparent')}>
                    <CIcon icon={cilSpreadsheet} size="sm" /> Descargar Excel
                  </CDropdownItem>
                </CDropdownMenu>
              </CDropdown>
            </CCol>
          </CRow>
    {cargando ? (
      <div className="text-center my-5">
        <CSpinner color="primary" aria-label="Cargando estudiantes..." />
      </div>
    ) : NotasFiltradas.length > 0 ? (
      <CTable striped bordered hover responsive>
        <CTableHead className="sticky-top bg-light text-center" style={{fontSize: '0.8rem'}}>
          <CTableRow>
            <CTableHeaderCell>#</CTableHeaderCell>
             <CTableHeaderCell>IDENTIDAD</CTableHeaderCell>
            <CTableHeaderCell>NOMBRE DEL ESTUDIANTE</CTableHeaderCell>
            <CTableHeaderCell>NOTA TOTAL</CTableHeaderCell>
            <CTableHeaderCell>ESTADO</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody className="text-center" style={{fontSize: '0.9rem',}}>
          {NotasFiltradas.map((estudiante, index) => (
            <CTableRow key={estudiante.CodPersona}>
              <CTableDataCell>{index + 1}</CTableDataCell>
              <CTableDataCell>{estudiante.Identidad}</CTableDataCell>
              <CTableDataCell>{estudiante.NombreCompleto}</CTableDataCell>
              <CTableDataCell>{`${estudiante.NotaTotal} %`}</CTableDataCell>
              <CTableDataCell>{estudiante.EstadoNota}</CTableDataCell>
              
            </CTableRow>
          ))}
        </CTableBody>
      </CTable>
    ) : (
      <p className="text-center">No se encontraron estudiantes.</p>
    )}
  </CModalBody>
  <CModalFooter>
    <CButton
      color="secondary"
      onClick={() => {setMostrarDetalleModalEstudiantes(false); setNombreBusqueda("");}}
    >
      Cerrar
    </CButton>
  </CModalFooter>
</CModal>

  </CContainer>
);

};

export default ListaNotas;
