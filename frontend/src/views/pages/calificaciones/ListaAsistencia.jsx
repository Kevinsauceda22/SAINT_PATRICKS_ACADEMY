import React, { useEffect, useState} from 'react';
import { cilCheckCircle,cilArrowLeft, cilSearch, cilSave, cilFile,cilSpreadsheet,cilPencil,cilInfo,cilPlus,cilPen } from '@coreui/icons';
import CIcon from '@coreui/icons-react';
import Swal from 'sweetalert2';

import {CContainer,CRow,CCol,CInputGroup,CCardBody,CFormSelect,CSpinner,CTable,CTableHead,CTableHeaderCell,CTableBody,CTableRow,CTableDataCell,
  CButton,CFormInput,CModal,CModalHeader,CModalBody,CModalFooter,CPopover,CPagination,CDropdownItem,CDropdown,CDropdownToggle,CDropdownMenu
} from '@coreui/react';

import logo from 'src/assets/brand/logo_saint_patrick.png'
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

// Definir una función para obtener la fecha de hoy
const getTodayDate = () => {
  const today = new Date();
  const year = today.getFullYear(); // Fecha local
  const month = String(today.getMonth() + 1).padStart(2, '0'); // Meses son de 0 a 11
  const day = String(today.getDate()).padStart(2, '0'); // Día local
  return `${year}-${month}-${day}`;
};
import usePermission from '../../../../context/usePermission';
import AccessDenied from "../AccessDenied/AccessDenied"

const ListaAsistencia = () => {
  const { canSelect, canInsert, canUpdate } = usePermission('ListaAsistencia');
   const [secciones, setSecciones] = useState([]);
  const [alumnos, setAlumnos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [codSeccionSeleccionada, setCodSeccionSeleccionada] = useState('');
  const [asistencias, setAsistencias] = useState([]);
  const [estadosAsistencia, setEstadosAsistencia] = useState([]); // Estados de asistencia disponibles
  const [mostrarModal, setMostrarModal] = useState(false); // modal para detalles de asistencia
  const [mostrarModalNuevo, setMostrarModalNuevo] = useState(false); // Estado para el modal para registrar
  const [todasAsistencias, setTodasAsistencias] = useState([]); // Estado para almacenar todas las asistencias por seccion y fecha
  const [mostrarModalActualizar, setMostrarModalActualizar] = useState(false);
const [asistenciasActualizar, setAsistenciasActualizar] = useState([]); // Almacena las asistencias para actualizar
const [fecha, setFecha] = useState(''); // Asegúrate de actualizarlo cuando sea necesario
  //filtro
  const [nombreBusqueda, setNombreBusqueda] = useState('');
  const [diaBusqueda, setDiaBusqueda] = useState('');
  const [mesBusqueda, setMesBusqueda] = useState('');
  const [añoBusqueda, setAñoBusqueda] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState('dia');
  const [currentView, setCurrentView] = useState('secciones');
  const [nombreSeccionSeleccionada, setNombreSeccionSeleccionada] = useState('');

  //Paginacion
  const [currentPage, setCurrentPage] = useState(1); // Página actual
  const [recordsPerPage, setRecordsPerPage] = useState(5); // Registros por página
  // recuento de estados asistencias
  const [recuentoAsistencias, setRecuentoAsistencias] = useState([]);
  const [nomenclaturaSeleccionada, setNomenclaturaSeleccionada] = useState('');
  const [estadoAsistenciaEstilos, setEstadoAsistenciaEstilos] = useState({}); // Lista de colores e íconos por defecto
  const asignarIconoYColor = (descripcion) => {
    const estado = descripcion.toLowerCase();

    if (['presente', 'asistió', 'asistencia', 'presencia', 'participó', 'vino', 'en clase'].some(palabra => estado.includes(palabra))) {
      return { color: '#28a745', icono: <span style={{ fontSize: '0.9em' }}>✔️</span> }; // Verde para "Presente"
  } else if (['ausente', 'falta', 'no asistió', 'inexistente', 'no vino', 'no presencia'].some(palabra => estado.includes(palabra))) {
      return { color: '#dc3545', icono: <span style={{ fontSize: '0.9em' }}>❌</span> }; // Rojo para "Ausente"
  } else if (['tardanza', 'retraso', 'llegó tarde', 'demora', 'tarde'].some(palabra => estado.includes(palabra))) {
      return { color: '#CC7722', icono: <span style={{ fontSize: '0.9em' }}>⏰</span> }; // Naranja para "Tardanza"
  } else if (['justificado', 'excusa', 'autorizado', 'permisado', 'permitido', 'exento', 'aprobado'].some(palabra => estado.includes(palabra))) {
      return { color: '#4169E1', icono: <span style={{ fontSize: '0.9em' }}>📝</span> }; // Azul para "Justificado"
  } else {
      return { color: 'gray', icono: <span style={{ fontSize: '0.9em' }}>❓</span> }; // Por defecto
  }
};


useEffect(() => {
  // Fetch secciones y estados de asistencia al cargar el componente
  fetchSecciones();
  fetchEstadosAsistencia();
  
  // Si hay una sección seleccionada, fetch de alumnos y recuento
  if (codSeccionSeleccionada) {
    fetchAlumnosPorSeccion(codSeccionSeleccionada);
    fetchRecuentoAsistencias();
  }
}, [codSeccionSeleccionada]); 

  //trae las secciones
  const fetchSecciones = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/seccionalumno/secciones');
      if (!response.ok) throw new Error('Error al cargar secciones.');
      const data = await response.json();
      setSecciones(data);
    } catch (error) {
      console.error('Error al obtener las secciones:', error);
    } finally {
      setCargando(false);
    }
  };
  //trae los estados asistencia y les aplica un estilo(color e icono)
  const fetchEstadosAsistencia = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/estadoAsistencia/estadoasistencias');
      if (!response.ok) throw new Error('Error al cargar estados de asistencia.');
      const data = await response.json();
      setEstadosAsistencia(data); // Guardar los estados de asistencia en el estado
       // Construir el objeto de estilos basados en las descripciones
      const estilos = {};
      data.forEach((estado) => {
        estilos[estado.Cod_estado_asistencia] = asignarIconoYColor(estado.Descripcion_asistencia);
      });
      setEstadoAsistenciaEstilos(estilos);
    } catch (error) {
      console.error('Error al obtener los estados de asistencia:', error);
    }
  };
  // trae todos los alumnos por seccion 
  const fetchAlumnosPorSeccion = async (codSeccion) => {
    try {
      const response = await fetch(`http://localhost:4000/api/seccionalumno/estudiantes/${codSeccion}`);
      if (!response.ok) throw new Error('Error al cargar estudiantes.');
      const data = await response.json();
  
      // Ordena los alumnos alfabéticamente por el nombre completo
      const alumnosOrdenados = data.sort((a, b) => a.Nombre_Completo.localeCompare(b.Nombre_Completo));
      setAlumnos(alumnosOrdenados);
  
      // Inicializa asistencias con datos básicos de cada alumno, ordenados
      const initialAsistencias = alumnosOrdenados.map((alumno) => ({
        Cod_seccion_matricula: alumno.Cod_seccion_matricula, 
        Observacion: '',
        Cod_estado_asistencia: '',
        Cod_asistencias: alumno.Cod_asistencias || null,
      }));
      setAsistencias(initialAsistencias);
    } catch (error) {
      console.error('Error al obtener los estudiantes:', error);
    }
  };

  // Función para formatear fecha en 'YYYY-MM-DD'
  const formatFecha = (fecha) => {
    const date = new Date(fecha);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Meses de 0-11, sumar 1
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  // trae todas las asistencia por seccion y fecha 
  const fetchTodasAsistencias = async (fecha) => {
    try {
      const fechaFormateada = formatFecha(fecha);
      const response = await fetch(`http://localhost:4000/api/asistencia/asistencias?cod_seccion=${codSeccionSeleccionada}&fecha=${fechaFormateada}`);
      if (!response.ok) {
        throw new Error('Error al obtener las asistencias.');
      }
      const data = await response.json();

      // Ordena los datos alfabéticamente por el nombre completo del estudiante
      const datosOrdenados = data.sort((a, b) => a.Nombre_Completo.localeCompare(b.Nombre_Completo));

      // Almacenar los datos ordenados directamente
      setTodasAsistencias(datosOrdenados);
      setMostrarModal(true); // Mostrar el modal
    } catch (error) {
      console.error('Error al obtener las asistencias por sección:', error);
      Swal.fire({
          title: 'Error',
          text: 'No se pudieron cargar las asistencias. Inténtalo más tarde.',
          icon: 'error',
          confirmButtonText: 'Aceptar',
      });
    }
  };

  // trae todos los recuentos de la tabla asistencia cuantos presentes, ausentes... dependiendo de los estados asistencia  
  const fetchRecuentoAsistencias = async () => {
    if (!codSeccionSeleccionada) return;
  
    try {
      const response = await fetch(`http://localhost:4000/api/asistencia/recuento?codSeccion=${codSeccionSeleccionada}`);
      if (!response.ok) throw new Error('Error al obtener el recuento de asistencias.');
      const data = await response.json();
  
      // Ordenar los datos por fecha en orden descendente (más reciente primero)
      const dataOrdenada = data.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  
      setRecuentoAsistencias(dataOrdenada);
    } catch (error) {
      console.error('Error al obtener el recuento de asistencias:', error);
    }
  };
  // formatea la fecha y hora a dia, mes, año con un formato de 12 hrs si está en true
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    const options = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true, // Cambia a `true` si prefieres el formato de 12 horas
    };
    return date.toLocaleString('es-HN', options); // Cambia 'es-HN' por el código de idioma que prefieras
  };
  
  const descripcionACodigo = estadosAsistencia.reduce((map, estado) => {
    map[estado.Descripcion_asistencia] = estado.Cod_estado_asistencia;
    return map;
  }, {});
  

  const cargarDatosParaActualizar = async (fechaSeleccionada) => {
  try {
    const date = new Date(fechaSeleccionada);
    const formattedDate = date.toISOString().split('T')[0];
    setFecha(formattedDate);

    const response = await fetch(`http://localhost:4000/api/asistencia/asistencias?cod_seccion=${codSeccionSeleccionada}&fecha=${formattedDate}`);
    if (!response.ok) throw new Error('Error al obtener las asistencias.');
    
    const data = await response.json();

    // Ordena los datos de asistencia alfabéticamente por el nombre completo del estudiante
    const datosOrdenados = data.sort((a, b) => a.Nombre_Completo.localeCompare(b.Nombre_Completo));

    // Convierte DescripcionEstado a Cod_estado_asistencia
    const datosActualizados = datosOrdenados.map((asistencia) => ({
      ...asistencia,
      Cod_estado_asistencia: descripcionACodigo[asistencia.DescripcionEstado] || '',
    }));

    setAsistenciasActualizar(datosActualizados);
    setMostrarModalActualizar(true);
  } catch (error) {
    console.error('Error al cargar los datos para actualizar:', error);
    Swal.fire({
      title: 'Error',
      text: 'No se pudieron cargar los datos de asistencia. Inténtalo más tarde.',
      icon: 'error',
      confirmButtonText: 'Aceptar',
    });
  }
};
  
  
  // Deshabilitar copiar y pegar
  const disableCopyPaste = (e) => {
    e.preventDefault();
    Swal.fire({
      icon: 'warning',
      title: 'Acción bloqueada',
      text: 'Copiar y pegar no está permitido.',
    });
  };

  
  // Función para manejar cambios en el input con validaciones
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
      });
      value = value.replace(/\s+/g, ' '); // Reemplazar múltiples espacios por uno solo
    }

    // Validar caracteres permitidos
    if (!regex.test(value)) {
      Swal.fire({
        icon: 'warning',
        title: 'Caracteres no permitidos',
        text: 'Solo se permiten letras, números y espacios.',
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
          });
          return;
        }
      }
    }

    // Establecer el valor con la función correspondiente
    setFunction(value);
  };


  //Modifica la observación de un alumno en la lista de asistencias.
  const handleObservacionChange = (index, value) => {
    const updatedAsistencias = [...asistencias];
    updatedAsistencias[index].Observacion = value;
    setAsistencias(updatedAsistencias);
  };
  // Actualiza la observación de un alumno en la lista de asistenciasActualizar
const handleObservacionChangeActualizar = (index, value) => {
  const updatedAsistencias = [...asistenciasActualizar];
  updatedAsistencias[index].Observacion = value;
  setAsistenciasActualizar(updatedAsistencias);
};

  
  //Cambia el estado de asistencia de un alumno, 
  //alternando entre el estado seleccionado y sin estado
  const handleEstadoCheckboxChange = (alumnoIndex, estadoId) => {
    const updatedAsistencias = [...asistencias];
    updatedAsistencias[alumnoIndex].Cod_estado_asistencia = updatedAsistencias[alumnoIndex].Cod_estado_asistencia === estadoId ? '' : estadoId;
    setAsistencias(updatedAsistencias);
  };

  // Nueva función para manejar los cambios en los checkboxes del modal de actualización
  const handleEstadoCheckboxChangeActualizar = (alumnoIndex, estadoId) => {
    const updatedAsistenciasActualizar = [...asistenciasActualizar];
    updatedAsistenciasActualizar[alumnoIndex].Cod_estado_asistencia =
      updatedAsistenciasActualizar[alumnoIndex].Cod_estado_asistencia === estadoId ? '' : estadoId;
    setAsistenciasActualizar(updatedAsistenciasActualizar);
  };

  const handleGuardarAsistencias = async () => {
    try {
      // Verificar si todos los estudiantes tienen un estado de asistencia seleccionado
      const estudiantesSinEstado = asistencias.some(asistencia => !asistencia.Cod_estado_asistencia);
      if (estudiantesSinEstado) {
        Swal.fire({
          title: 'Completa la asistencia',
          text: 'Debes registrar la asistencia de todos los estudiantes',
          icon: 'info',
          confirmButtonText: 'Aceptar',
        });
        return; // Detener la ejecución si hay estudiantes sin estado
      }
  
      // Crear un objeto Date usando la fecha seleccionada en formato "YYYY-MM-DD"
      const [year, month, day] = getTodayDate().split('-');
      const fechaSeleccionada = new Date(year, month - 1, day);
      const ahora = new Date();
  
      // Ajustar la fecha seleccionada para incluir la hora actual de la zona horaria local
      fechaSeleccionada.setHours(ahora.getHours(), ahora.getMinutes(), ahora.getSeconds());
  
      // Formatear la fecha y hora en "YYYY-MM-DD HH:MM:SS" para la base de datos
      const fechaConHoraFormateada = `${fechaSeleccionada.getFullYear()}-${String(fechaSeleccionada.getMonth() + 1).padStart(2, '0')}-${String(fechaSeleccionada.getDate()).padStart(2, '0')} ${String(fechaSeleccionada.getHours()).padStart(2, '0')}:${String(fechaSeleccionada.getMinutes()).padStart(2, '0')}:${String(fechaSeleccionada.getSeconds()).padStart(2, '0')}`;
  
      // Crear un array con las asistencias a insertar
      const asistenciasParaInsertar = asistencias.map((asistencia) => ({
        Observacion: asistencia.Observacion || null,
        Cod_estado_asistencia: asistencia.Cod_estado_asistencia || null,
        Cod_seccion_matricula: asistencia.Cod_seccion_matricula || null,
        Fechas: fechaConHoraFormateada,
      }));
  
      // Verificar si ya existen registros para esta fecha antes de hacer la inserción
      const verificarResponse = await fetch('http://localhost:4000/api/asistencia/verificarExistencia', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fecha: fechaConHoraFormateada, codSeccion: asistenciasParaInsertar[0].Cod_seccion_matricula }),
      });
  
      const verificarData = await verificarResponse.json();
      if (verificarData.existe) {
        Swal.fire({
          title: 'Asistencia ya registrada',
          text: 'Ya existen registros de asistencia para esta fecha y sección.',
          icon: 'info',
          confirmButtonText: 'Aceptar',
        });
        return;
      }
  
      // Insertar asistencias si no existen registros previos
      const response = await fetch('http://localhost:4000/api/asistencia/crearasistencias', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(asistenciasParaInsertar),
      });
  
      if (response.ok) {
        Swal.fire({
          title: 'Asistencias registradas correctamente',
          icon: 'success',
          confirmButtonText: 'Aceptar',
        });
  
        // Llamar a la función para actualizar los datos del recuento de asistencias
        fetchRecuentoAsistencias();
      } else {
        throw new Error('Error al insertar asistencias');
      }
    } catch (error) {
      console.error('Hubo un problema al guardar asistencias:', error);
      Swal.fire({
        title: 'Error!',
        text: error.message.includes('asistencia ya existe')
              ? 'No se puede guardar porque la asistencia ya existe.'
              : 'Hubo un problema al guardar las asistencias.',
        icon: 'error',
        confirmButtonText: 'Aceptar',
      });
    }
  };
  
  
  
  const handleActualizarAsistencias = async () => {
    try {
      // Prepara los datos de asistencia para la actualización
      const asistenciasParaActualizar = asistenciasActualizar.map((asistencia) => ({
        Cod_asistencias: asistencia.Cod_asistencias,
        Observacion: asistencia.Observacion || null,
        Cod_estado_asistencia: asistencia.Cod_estado_asistencia || null,
        Cod_seccion_matricula: asistencia.Cod_seccion_matricula || null,
      }));
  
      // Realiza la solicitud de actualización
      const response = await fetch('http://localhost:4000/api/asistencia/actualizarasistencias', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(asistenciasParaActualizar),
      });
  
      if (response.ok) {
        const data = await response.json();
        Swal.fire({
          title: 'Asistencias actualizadas correctamente',
          icon: 'success',
          confirmButtonText: 'Aceptar',
        });
  
        // Refresca el recuento de asistencias o realiza alguna acción adicional si es necesario
        fetchRecuentoAsistencias();
      } else {
        throw new Error('Error al actualizar las asistencias');
      }
    } catch (error) {
      console.error('Hubo un problema al actualizar asistencias:', error);
      Swal.fire({
        title: 'Error!',
        text: 'Hubo un problema al actualizar las asistencias.',
        icon: 'error',
        confirmButtonText: 'Aceptar',
      });
    }
  };
  

  //organiza los registros de asistencia por fecha, agrupando las cantidades de cada estado de asistencia
  const agruparRecuentosPorFecha = () => {
    const agrupado = {};
  
    recuentoAsistencias.forEach((registro) => {
      const { fecha, estado, cantidad } = registro;
      if (!agrupado[fecha]) {
        agrupado[fecha] = {};
      }
      agrupado[fecha][estado] = cantidad;
    });
  
    return agrupado;
  };
  const recuentosAgrupados = agruparRecuentosPorFecha();
  
  
 // Función para seleccionar o deseleccionar todos los checkboxes de un estado específico
 const handleSelectAll = (estadoId) => {
    // Verificar si todos los elementos ya están seleccionados con el estado actual
    const allSelected = asistencias.every(
      (asistencia) => asistencia.Cod_estado_asistencia === estadoId
    );

    // Si todos están seleccionados, deseleccionarlos; si no, seleccionarlos todos
    const updatedAsistencias = asistencias.map((asistencia) => ({
      ...asistencia,
      Cod_estado_asistencia: allSelected ? '' : estadoId,
    }));

    setAsistencias(updatedAsistencias);
  };

  const handleSelectAllActualizar = (estadoId) => {
    // Verificar si todos los elementos ya están seleccionados con el estado actual
    const allSelected = asistenciasActualizar.every(
      (asistencia) => asistencia.Cod_estado_asistencia === estadoId
    );
  
    // Si todos están seleccionados, deseleccionarlos; si no, seleccionarlos todos
    const updatedAsistenciasActualizar = asistenciasActualizar.map((asistencia) => ({
      ...asistencia,
      Cod_estado_asistencia: allSelected ? '' : estadoId,
    }));
  
    setAsistenciasActualizar(updatedAsistenciasActualizar);
  };
  

  // para aplicar el filtro en la tabla de recuento por mes, dia y año
  const recuentosFiltrados = Object.entries(recuentosAgrupados).filter(([fecha]) => {
    const fechaObj = new Date(fecha);
    const dia = fechaObj.getDate();
    const mes = fechaObj.getMonth() + 1; // Los meses son de 0 a 11
    const anio = fechaObj.getFullYear();
  
    if (tipoFiltro === 'mes') {
      // Filtrar por mes
      if (mesBusqueda && parseInt(mesBusqueda, 10) !== mes) return false;
      // Si el día es opcional, solo filtra por día si se proporciona
      if (diaBusqueda && parseInt(diaBusqueda, 10) !== dia) return false;
      return true; // Retorna true si solo se proporciona el mes
    }
  
    if (tipoFiltro === 'anio') {
      // Filtrar por año
      if (añoBusqueda && parseInt(añoBusqueda, 10) !== anio) return false;
      return true; // Retorna true si solo se proporciona el año
    }
  
    return true; // Por defecto, retorna true si no se aplica ningún filtro
  });

 // Lógica de paginación actualizada
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = recuentosFiltrados.slice(indexOfFirstRecord, indexOfLastRecord); // Usar recuentosFiltrados

  const totalPages = Math.ceil(recuentosFiltrados.length / recordsPerPage); // Paginación basada en recuentosFiltrados

  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  //formatea la fechas para la tabla de recuento
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Los meses son de 0 a 11
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Función para filtrar asistencias por nombre
  const asistenciasFiltradas = todasAsistencias.filter((asistencia) => 
    asistencia.Nombre_Completo.toLowerCase().includes(nombreBusqueda.toLowerCase())
  );


  // Función para restablecer las asistencias
  const limpiarAsistencias = () => {
    setAsistencias(alumnos.map((alumno) => ({
      Cod_seccion_matricula: alumno.Cod_seccion_matricula,
      Observacion: '',
      Cod_estado_asistencia: '',
      Cod_asistencias: alumno.Cod_asistencias || null,
    })));
  };

  const handleCerrarModalNuevo = () => {
    limpiarAsistencias();
    setMostrarModalNuevo(false);
  };

 const generarReporteExcel = () => {
    const encabezados = [
      ["Saint Patrick Academy"],
      ["Reporte de Asistencia"],
      [`Sección: ${nomenclaturaSeleccionada}`, `Fecha de generación: ${new Date().toLocaleDateString()}`],
      [], // Espacio en blanco
      ["Nombre Completo", "Fecha", "Estado", "Observación"]
    ];
  
    // Crear filas con asistencias filtradas
    const filas = todasAsistencias.map((asistencia) => [
      asistencia.Nombre_Completo,
      formatDateTime(asistencia.Fecha),
      asistencia.DescripcionEstado,
      asistencia.Observacion || ""
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
      { wpx: 200 }, // Nombre Completo
      { wpx: 150 }, // Fecha
      { wpx: 100 }, // Estado
      { wpx: 250 }  // Observación
    ];
  
    hojaDeTrabajo['!cols'] = ajusteColumnas;
  
    // Crear el libro de trabajo
    const libroDeTrabajo = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libroDeTrabajo, hojaDeTrabajo, "Reporte de Asistencia");
  
    // Guardar el archivo Excel con un nombre personalizado
    const fechaRegistro = todasAsistencias.length > 0 ? formatDateTime(todasAsistencias[0].Fecha) : 'sin_fecha';
    const nombreArchivo = `${nomenclaturaSeleccionada}_${fechaRegistro}.xlsx`;
    
    XLSX.writeFile(libroDeTrabajo, nombreArchivo);
  };
  
  

  
  const generarReportePDF = () => {
    const doc = new jsPDF();
    const img = new Image();
    img.src = logo;
  
    // Obtener la nomenclatura de la sección y la fecha del primer registro de asistencia
    const fechaRegistro = todasAsistencias.length > 0 ? formatDateTime(todasAsistencias[0].Fecha) : 'sin_fecha';
  
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
      doc.text('Reporte de Asistencia', doc.internal.pageSize.width / 2, yPosition, { align: 'center' });
  
      yPosition += 10; // Espaciado entre subtítulo y detalles
  
       // Detalles de la sección y fecha en una sola fila
       doc.setFontSize(12);
       doc.setTextColor(0, 0, 0); // Negro para el texto informativo
 
       if (nomenclaturaSeleccionada && fechaRegistro && fechaRegistro !== 'sin_fecha') {
         const fechaLimpia = fechaRegistro.split(' ')[0].replace(/[^0-9/-]/g, ''); // Limpia la fecha
         doc.text(
           `Sección: ${nomenclaturaSeleccionada} | Fecha del registro: ${fechaLimpia}`,
           doc.internal.pageSize.width / 2,
           yPosition,
           { align: 'center' }
         );
       } else if (nomenclaturaSeleccionada) {
         doc.text(
           `Sección: ${nomenclaturaSeleccionada}`,
           doc.internal.pageSize.width / 2,
           yPosition,
           { align: 'center' }
         );
       } else if (fechaRegistro && fechaRegistro !== 'sin_fecha') {
         const fechaLimpia = fechaRegistro.split(' ')[0].replace(/[^0-9/-]/g, ''); // Limpia la fecha
         doc.text(
           `Fecha de registro: ${fechaLimpia}`,
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
        head: [['#', 'Nombre del Alumno', 'Estado', 'Observación']],
        body: todasAsistencias.map((asistencia, index) => [
          index + 1,
          `${asistencia.Nombre_Completo || ''}`.trim(),
          asistencia.DescripcionEstado,
          asistencia.Observacion || "Sin Observación",
        ]),
        headStyles: {
          fillColor: [0, 102, 51],
          textColor: [255, 255, 255],
          fontSize: 10,
        },
        styles: {
          fontSize: 10,
          cellPadding: 3,
        },
        alternateRowStyles: { fillColor: [240, 248, 255] },
        didDrawPage: (data) => {
          // Pie de página
          const currentDate = new Date();
          const formattedDate = `${currentDate.toLocaleDateString()} ${currentDate.toLocaleTimeString()}`;
          doc.setFontSize(10);
          doc.setTextColor(100);
          doc.text(`Fecha y hora de generación: ${formattedDate}`, 10, pageHeight - 10);
          doc.text(`Página ${pageNumber}`, doc.internal.pageSize.width - 30, pageHeight - 10);
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
  
  const generarReporteseccionesExcel = () => {
    const encabezados = [
      ["Saint Patrick Academy"],
      ["Reporte de Secciones"],
      [], // Espacio en blanco
      ["#","Sección", "Grado", "Año Académico", "Profesor"]
    ];
  
    // Crear filas con asistencias filtradas
    const filas = secciones.map((seccion, index) => [
      index + 1,
      seccion.Seccion,
      seccion.Grado,
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
  
  const generarReporteseccionesPDF = () => {
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
        head: [['#', 'Sección', 'Grado', 'Año Académico','Profesor']],
        body: secciones.map((seccion, index) => [
          index + 1,
          `${seccion.Seccion || ''}`.trim(),
          seccion.Grado,
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
        },
        alternateRowStyles: { fillColor: [240, 248, 255] },
        didDrawPage: (data) => {
          // Pie de página
          const currentDate = new Date();
          const formattedDate = `${currentDate.toLocaleDateString()} ${currentDate.toLocaleTimeString()}`;
          doc.setFontSize(10);
          doc.setTextColor(100);
          doc.text(`Fecha y hora de generación: ${formattedDate}`, 10, pageHeight - 10);
          doc.text(`Página ${pageNumber}`, doc.internal.pageSize.width - 30, pageHeight - 10);
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
    
    

    const handleViewAsistencia = async (Cod_secciones, nombreSeccion) => {
      setCodSeccionSeleccionada(Cod_secciones); // Asegúrate de actualizar la sección seleccionada
      setNombreSeccionSeleccionada(nombreSeccion); // Establecer el nombre de la sección seleccionada
      fetchRecuentoAsistencias(); // Cargar los datos de asistencia
      setCurrentView('asistencias'); // Cambiar a la vista de asistencias

      if (Cod_secciones) {
        try {
            // Hacer una solicitud fetch para obtener la nomenclatura
            const response = await fetch(`http://localhost:4000/api/seccionalumno/nomenclatura?codSeccion=${Cod_secciones}`);
            if (!response.ok) throw new Error('Error al obtener la nomenclatura.');

            const data = await response.json();
            if (data) {
                setNomenclaturaSeleccionada(data.Nomenclatura); // Guarda la nomenclatura en el estado
            } else {
                setNomenclaturaSeleccionada(''); // Si no se encuentra, limpiar el estado
            }
        } catch (error) {
            console.error('Error al obtener la nomenclatura:', error);
        }
    } else {
        setNomenclaturaSeleccionada(''); // Si no hay sección seleccionada, limpiar la nomenclatura
    }
    };

    const handleBackToSecciones = () => {
      setCurrentView('secciones');
    };

    // Verificar permisos
    if (!canSelect) {
      return <AccessDenied />;
    }
    
  return (
    <CContainer className="py-1">
      {cargando && (
        <div className="text-center my-5">
          <CSpinner color="primary" aria-label="Cargando información..." />
        </div>
      )}
      {!cargando && currentView === "secciones" && (
        <>
          <CRow className="align-items-center mb-5">
            <CCol xs="12" className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
              <div className="flex-grow-1 text-center">
                <h4 className="text-center fw-semibold pb-2 mb-0" style={{display: "inline-block", borderBottom: "2px solid #4CAF50" }}> Lista de Secciones</h4>
              </div>
              <CDropdown className="btn-sm d-flex align-items-center gap-1 rounded shadow">
                <CDropdownToggle
                  style={{backgroundColor: '#6C8E58',color: 'white',fontSize: '0.85rem',cursor: 'pointer',transition: 'all 0.3s ease', }}
                  onMouseEnter={(e) => {e.currentTarget.style.backgroundColor = '#5A784C'; e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';  }}
                  onMouseLeave={(e) => {e.currentTarget.style.backgroundColor = '#6C8E58'; e.currentTarget.style.boxShadow = 'none'; }}>
                  Reporte
                </CDropdownToggle>
                <CDropdownMenu style={{position: "absolute", zIndex: 1050, /* Asegura que el menú esté por encima de otros elementos*/ backgroundColor: "#fff",boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.2)",borderRadius: "4px",overflow: "hidden",}}>
                  <CDropdownItem
                    onClick={generarReporteseccionesPDF}
                    style={{cursor: "pointer",outline: "none",backgroundColor: "transparent",padding: "0.5rem 1rem",fontSize: "0.85rem",color: "#333",borderBottom: "1px solid #eaeaea",transition: "background-color 0.3s",}}
                    onMouseOver={(e) =>(e.target.style.backgroundColor = "#f5f5f5")} onMouseOut={(e) =>(e.target.style.backgroundColor = "transparent")}>
                    <CIcon icon={cilFile} size="sm" /> Abrir en PDF
                  </CDropdownItem>
                  <CDropdownItem
                    onClick={generarReporteseccionesExcel}
                    style={{cursor: "pointer",outline: "none",backgroundColor: "transparent",padding: "0.5rem 1rem",fontSize: "0.85rem",color: "#333",transition: "background-color 0.3s",}}
                    onMouseOver={(e) =>(e.target.style.backgroundColor = "#f5f5f5")}
                    onMouseOut={(e) =>(e.target.style.backgroundColor = "transparent")}>
                    <CIcon icon={cilSpreadsheet} size="sm" /> Descargar Excel
                  </CDropdownItem>
                </CDropdownMenu>
              </CDropdown>
            </CCol>
          </CRow>

          <div className="table-responsive" style={{maxHeight: '400px',overflowX: 'auto',overflowY: 'auto', boxShadow: "0 4px 10px rgba(0, 0, 0, 0.3)"}}>
            <CTable striped bordered hover responsive >
              <CTableHead className="sticky-top bg-light text-center" style={{fontSize: '0.8rem'}}>
                <CTableRow>
                  <CTableHeaderCell>#</CTableHeaderCell>
                  <CTableHeaderCell>SECCIÓN</CTableHeaderCell>
                  <CTableHeaderCell>GRADO</CTableHeaderCell>
                  <CTableHeaderCell>AÑO ACADÉMICO</CTableHeaderCell>
                  <CTableHeaderCell>PROFESOR</CTableHeaderCell>
                  <CTableHeaderCell>ACCIÓN</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody className="text-center" style={{fontSize: '0.85rem',}}>
                {secciones.map((seccion, index) => (
                  <CTableRow key={index}>
                    <CTableDataCell >{index + 1}</CTableDataCell>
                    <CTableDataCell>{seccion.Seccion}</CTableDataCell>
                    <CTableDataCell>{seccion.Grado}</CTableDataCell>
                    <CTableDataCell>{seccion.Anio_Academico}</CTableDataCell>
                    <CTableDataCell>{seccion.Nombre_Profesor}</CTableDataCell>
                    <CTableDataCell>
                      <CButton size="sm"style={{backgroundColor: "#F0F4F3",color: "#153E21",border: "1px solid #A2B8A9",borderRadius: "6px",padding: "5px 12px",boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",}}
                        onMouseEnter={(e) =>(e.target.style.backgroundColor = "#dce3dc")}onMouseLeave={(e) =>(e.target.style.backgroundColor = "#F0F4F3")}
                        onClick={() =>handleViewAsistencia(seccion.Cod_secciones, seccion.Seccion)}>
                        Ver Asistencia
                      </CButton>
                    </CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          </div>
        </>
      )}
      {!cargando && currentView === 'asistencias' && (
        <>
          <CRow className="align-items-center mb-5">
            {/* Botón "Volver a Secciones" a la izquierda */}
            <CCol xs="12" className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
              <CButton className="btn btn-sm d-flex align-items-center gap-1 rounded shadow"
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#4B4B4B")} onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#656565")}
                style={{backgroundColor: "#656565",color: "#FFFFFF",padding: "6px 12px",fontSize: "0.9rem",transition: "background-color 0.2s ease, box-shadow 0.3s ease",boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",}}
                onClick={handleBackToSecciones}>
                <CIcon icon={cilArrowLeft} /> Volver a Secciones
              </CButton>
              <div className="d-flex justify-content-center align-items-center flex-grow-1">
                <h4 className="text-center fw-semibold pb-2 mb-0" style={{display: "inline-block", borderBottom: "2px solid #4CAF50", margin: "0 auto",}}> Asistencias de Sección: {nombreSeccionSeleccionada || "Selecciona una sección"}</h4>
              </div>
              {/* Botón "Nuevo" a la derecha */}
              {canInsert && (
                <CButton className="btn btn-sm d-flex align-items-center gap-1 rounded shadow"
                  onClick={() => setMostrarModalNuevo(true)}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#3C4B43")}onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#4B6251")}
                  style={{backgroundColor: "#4B6251",color: "#FFFFFF",padding: "5px 10px",fontSize: "0.9rem",}}>
                  <CIcon icon={cilPlus} className="me-2" />
                  Nuevo
                </CButton>
              )}
            </CCol>
          </CRow>
         {/* Filtros y paginación */}
         <CRow className="align-items-center mt-4 mb-2">
          {/* Barra de búsqueda y selector de tipo de filtro */}
          <CCol xs="12" md="8" className="d-flex flex-wrap align-items-center gap-3">
            {/* Selector de tipo de filtro */}
            <CInputGroup className="me-1" style={{ maxWidth: '150px' }}>
              <CFormSelect
                value={tipoFiltro}
                onChange={(e) => {
                  setTipoFiltro(e.target.value);
                  setMesBusqueda('');
                  setAñoBusqueda('');
                  setDiaBusqueda('');
                }}
                style={{ padding: '0.2rem', fontSize: '0.8rem', height: '35px', lineHeight: '2' }}
              >
                <option value="">Buscar por:</option>
                <option value="mes">Mes</option>
                <option value="anio">Año</option>
              </CFormSelect>
            </CInputGroup>
            {/* Filtros condicionales */}
            {tipoFiltro === 'mes' && (
              <CInputGroup className="me-3" style={{ maxWidth: '250px' }}>
                <CFormSelect
                  value={mesBusqueda}
                  onChange={(e) => setMesBusqueda(e.target.value)}
                  style={{ padding: '0.2rem', fontSize: '0.8rem', height: '35px', lineHeight: '2' }}
                >
                  <option value="">Selecciona un mes</option>
                  {[...Array(12).keys()].map((i) => (
                    <option key={i + 1} value={i + 1}>
                      {new Date(0, i).toLocaleString('es', { month: 'long' })}
                    </option>
                  ))}
                </CFormSelect>
                {mesBusqueda && (
                  <CFormInput
                    type="number"
                    placeholder="Día (opcional)"
                    value={diaBusqueda}
                    onChange={(e) => setDiaBusqueda(e.target.value)}
                    min="1"
                    max="31"
                    style={{
                      padding: '0.2rem',
                      fontSize: '0.8rem',
                      height: '35px',
                      lineHeight: '2',
                    }}
                  />
                )}
              </CInputGroup>
            )}
            {tipoFiltro === 'anio' && (
              <CInputGroup className="me-3" style={{ maxWidth: '250px' }}>
                <CFormSelect
                  value={añoBusqueda}
                  onChange={(e) => setAñoBusqueda(e.target.value)}
                  style={{ padding: '0.2rem', fontSize: '0.8rem', height: '35px', lineHeight: '2' }}
                >
                  <option value="">Selecciona un año</option>
                  {Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </CFormSelect>
              </CInputGroup>
            )}
          </CCol>
          {/* Selector dinámico de registros */}
          <CCol xs="12" md="4" className="text-md-end mt-3 mt-md-0">
            <CInputGroup style={{ width: 'auto', display: 'inline-block' }}>
              <div className="d-inline-flex align-items-center">
                <span style={{ fontSize: '0.85rem' }}>Mostrar&nbsp;</span>
                <CFormSelect
                  style={{ width: '80px', display: 'inline-block', textAlign: 'center' }}
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



          {/* Contenido de la tabla de recuento de asistencias */}
          {recuentoAsistencias.length === 0 ? (
            <p className="text-center text-muted mt-2">No se encontraron registros de asistencia para esta sección</p>
          ) : (
          <>
          <div className="table-responsive" style={{maxHeight: '400px',overflowX: 'auto',overflowY: 'auto',marginBottom: '20px',boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)'}}>
            <CTable striped bordered hover responsive>
              <CTableHead className="sticky-top bg-light text-center" style={{fontSize: '0.8rem',}}>
                <CTableRow>
                  <CTableHeaderCell >#</CTableHeaderCell>
                    <CTableHeaderCell >FECHA</CTableHeaderCell>
                    {estadosAsistencia.map((estado) => (<CTableHeaderCell key={estado.Cod_estado_asistencia}className="text-center">{estado.Descripcion_asistencia}</CTableHeaderCell>))}
                    <CTableHeaderCell  >ACCIÓN</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody className="text-center" style={{fontSize: '0.85rem',}}>
                {currentRecords.map(([fecha, estados], index) => (
                  <CTableRow key={fecha} >
                    <CTableDataCell >{index + 1}</CTableDataCell>
                    <CTableDataCell>{formatDate(fecha)}</CTableDataCell>
                    {estadosAsistencia.map((estado) => (<CTableDataCell key={estado.Cod_estado_asistencia}>{estados[estado.Cod_estado_asistencia] || 0}</CTableDataCell> ))}
                  <CTableDataCell style={{ padding: '10px' }}>
                      <div style={{display: 'flex',gap: '10px',justifyContent: 'center',alignItems: 'center', }}>
                        {canUpdate && (
                          <CButton
                            onClick={() => cargarDatosParaActualizar(fecha)}
                            onMouseEnter={(e) => {e.currentTarget.style.boxShadow = '0px 4px 10px rgba(249, 182, 78, 0.6)';e.currentTarget.style.color = '#000000';}}
                            onMouseLeave={(e) => {e.currentTarget.style.boxShadow = 'none';e.currentTarget.style.color = '#5C4044';}}
                            style={{backgroundColor: '#F9B64E',color: '#5C4044',border: 'none', transition: 'all 0.2s ease',padding: '5px 10px',height: '38px',width: '45px',}}>
                            <CIcon icon={cilPen} />
                          </CButton>
                        )}
                        <CButton
                          onClick={() => fetchTodasAsistencias(fecha)}
                          onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0px 4px 10px rgba(93, 138, 168, 0.6)';e.currentTarget.style.color = '#000000'; }}
                          onMouseLeave={(e) => {e.currentTarget.style.boxShadow = 'none';e.currentTarget.style.color = '#5C4044';}}
                          style={{backgroundColor: '#5D8AA8',marginRight: '10px',color: '#5C4044',border: 'none', transition: 'all 0.2s ease',padding: '5px 10px', height: '38px',width: '45px', }}>
                          <CIcon icon={cilInfo} />
                        </CButton>
                      </div>
                    </CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          </div>
          {/* Paginación */}
          <div style={{ display: 'flex',  justifyContent: 'center', alignItems: 'center', marginTop: '16px' }}>
            <CPagination aria-label="Page navigation" style={{ display: 'flex', gap: '10px' }}>
              <CButton
                style={{ backgroundColor: '#6f8173', color: '#D9EAD3'}}
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                Anterior
              </CButton>
              <CButton
                style={{ marginLeft: '10px', backgroundColor: '#6f8173', color: '#D9EAD3' }}
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                Siguiente
              </CButton>
            </CPagination>
            <span style={{  marginLeft: '10px'}}>
              Página {currentPage} de {totalPages}
            </span>
          </div>
          </>
          )}
        </>
      )}

        
      {/* Modal "Nuevo" */}
      <CModal visible={mostrarModalNuevo} onClose={handleCerrarModalNuevo} size="lg" centered backdrop="static">
        <CModalHeader closeButton={false}>
          <h5 className="modal-title">Registrar Asistencia</h5>
          <CButton type="button" className="btn-close" onClick={handleCerrarModalNuevo} />
        </CModalHeader>
        <CModalBody style={{ fontSize: '0.85rem' }}>
          {/* Fecha de Asistencia */}
          <CRow className="align-items-center mb-2">
            <CCol xs="12" md="6" className="d-flex align-items-center">
              <h6 className="mb-1 me-3">Fecha:</h6>
              <CFormInput
                type="date"
                value={getTodayDate()}
                disabled // Esto deshabilita el campo de entrada
                className="rounded"
                style={{ maxWidth: '150px', padding: '0.3rem', fontSize: '0.85rem' }}
              />
            </CCol>
            {/* Botón Guardar */}
            <CCol xs="12" md="6" className="text-md-end text-center mt-2 mt-md-0">
            </CCol>
          </CRow>

          {/* Tabla de Estudiantes */}
          {alumnos.length === 0 ? (
            <p className="text-muted">No hay estudiantes en esta sección.</p>
          ) : (
            <div className="table-responsive" style={{ maxHeight: '350px', overflowY: 'auto', overflowX: 'auto' }}>
              <CTable bordered hover responsive small>
                <thead className="bg-light">
                  <tr>
                    <CTableHeaderCell className="text-center" style={{ fontSize: '0.8rem', padding: '2px', verticalAlign: 'middle' }}>#</CTableHeaderCell>
                    <CTableHeaderCell className="text-center" style={{ fontSize: '0.8rem', padding: '2px', verticalAlign: 'middle' }}>ALUMNO</CTableHeaderCell>
                    {/* Encabezado para los íconos de estado */}
                    <CTableHeaderCell className="text-center" style={{ fontSize: '0.9rem', padding: '2px', verticalAlign: 'middle' }}>
                      <div className="d-flex justify-content-center gap-4">
                        {estadosAsistencia.map((estado) => {
                          const estilo = estadoAsistenciaEstilos[estado.Cod_estado_asistencia] || { color: 'gray', icono: '❓' };
                          const allSelected = asistencias.every(
                            (asistencia) => asistencia.Cod_estado_asistencia === estado.Cod_estado_asistencia
                          );
                          const titleMessage = allSelected
                            ? `Haga clic para deseleccionar todos como: ${estado.Descripcion_asistencia}`
                            : `Haga clic para marcar todos como: ${estado.Descripcion_asistencia}`;
                          
                          return (
                            <span
                              key={estado.Cod_estado_asistencia}
                              style={{ color: estilo.color, fontSize: '1.2rem', cursor: 'pointer' }}
                              title={titleMessage}
                              onClick={() => handleSelectAll(estado.Cod_estado_asistencia)}
                            >
                              {estilo.icono}
                            </span>
                          );
                        })}
                      </div>
                    </CTableHeaderCell>
                    <CTableHeaderCell className="text-center" style={{ fontSize: '0.8rem', padding: '2px', verticalAlign: 'middle' }}>OBSERVACIÓN</CTableHeaderCell>
                  </tr>
                </thead>
                <CTableBody>
                  {alumnos.map((alumno, index) => (
                    <CTableRow key={alumno.Cod_seccion_matricula}>
                      <CTableDataCell className="text-center" style={{ fontSize: '0.8rem', padding: '2px', verticalAlign: 'middle' }}>{index + 1}</CTableDataCell>
                      <CTableDataCell style={{ fontSize: '0.8rem', padding: '4px', verticalAlign: 'middle' }}>{alumno.Nombre_Completo}</CTableDataCell>
                      {/* Celda de checkboxes */}
                      <CTableDataCell className="text-center" style={{ fontSize: '0.8rem', padding: '2px', verticalAlign: 'middle' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '32px' }}>
                          {estadosAsistencia.map((estado) => {
                            const estilo = estadoAsistenciaEstilos[estado.Cod_estado_asistencia] || { color: 'gray' };
                            return (
                              <input
                                key={estado.Cod_estado_asistencia}
                                type="checkbox"
                                checked={asistencias[index].Cod_estado_asistencia === estado.Cod_estado_asistencia}
                                onChange={() => handleEstadoCheckboxChange(index, estado.Cod_estado_asistencia)}
                                style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: estilo.color, marginTop: '8px' }}
                              />
                            );
                          })}
                        </div>
                      </CTableDataCell>
                      <CTableDataCell className="text-center" style={{ fontSize: '0.8rem', padding: '4px' }}>
                        <CPopover
                          content={
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                              <textarea
                                placeholder="Escribe tu observación"
                                value={asistencias[index].Observacion}
                                maxLength={50}
                                onChange={(e) => handleInputChange(e, (value) => handleObservacionChange(index, value))}
                                onPaste={disableCopyPaste}
                                onCopy={disableCopyPaste}
                                style={{
                                  width: '280px', // Ancho del área de texto
                                  height: '40px', // Altura del área de texto
                                  padding: '0.5rem',
                                  resize: 'none', // Para deshabilitar el redimensionamiento
                                  overflow: 'hidden', // Para ocultar el desbordamiento
                                  whiteSpace: 'pre-wrap', // Para que el texto se envuelva y se muestre en nuevas líneas
                                  border: '1px solid #ccc', // Color de borde más suave
                                  outline: 'none', // Eliminar el color de borde por defecto al hacer clic
                                  fontSize: '0.75rem', // Tamaño de la letra
                                }}
                                onFocus={(e) => (e.target.style.border = '1px solid #aaa')} // Borde menos pronunciado al enfocar
                                onBlur={(e) => (e.target.style.border = '1px solid #ccc')} // Volver al borde original al desenfocar
                              />
                            </div>
                          }
                          placement="right"
                          trigger="click"
                          style={{ maxWidth: '320px' }} // Ajustar el ancho del CPopover
                        >
                          <CButton color="link">
                            <CIcon icon={cilPencil} style={{ color: 'black' }} />
                          </CButton>
                        </CPopover>
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            </div>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary"  onClick={handleCerrarModalNuevo}>
            Cerrar
          </CButton>
          <CButton
            onClick={handleGuardarAsistencias}
            onMouseEnter={(e) => {e.currentTarget.style.backgroundColor = "#3C4B43";  }}
            onMouseLeave={(e) => {e.currentTarget.style.backgroundColor = "#4B6251"; }}
            style={{backgroundColor: '#4B6251',color: '#FFFFFF',padding: '6px 12px',transition: 'background-color 0.2s ease, box-shadow 0.3s ease', }}>
            <CIcon icon={cilSave} /> Guardar
          </CButton>
        </CModalFooter>
      </CModal>


      {/* Modal para mostrar todas las asistencias */}
      <CModal visible={mostrarModal} onClose={() => setMostrarModal(false)} size="xl" backdrop="static" centered>
        <CModalHeader closeButton={false}>
          <h5 className="modal-title">Asistencias de la Sección </h5>
          <CButton type="button" className="btn-close" onClick={() => setMostrarModal(false)} />
        </CModalHeader>
        <CModalBody style={{ maxHeight: '500px', overflowY: 'auto', overflowX: 'auto', padding: '1.5rem' }}>
          {/* Filtro por nombre */}
          <CRow className="mb-3 justify-content-center align-items-center">
            <CCol xs="12" md="6" className="d-flex align-items-center">
              <CIcon icon={cilSearch} style={{ marginRight: '8px', fontSize: '1.2rem', color: '#6C8E58' }} />
              <CFormInput
                placeholder="Buscar por nombre"
                value={nombreBusqueda}
                onChange={(e) => setNombreBusqueda(e.target.value)}
                style={{ fontSize: '0.85rem', flex: 1 }}
              />
            </CCol>
            <CCol xs="auto">
              <CDropdown>
               <CDropdownToggle
                  style={{ backgroundColor: '#6C8E58',color: 'white',fontSize: '0.85rem',cursor: 'pointer',transition: 'all 0.3s ease', }}
                  onMouseEnter={(e) => {e.currentTarget.style.backgroundColor = '#5A784C'; e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)'; }}
                  onMouseLeave={(e) => {e.currentTarget.style.backgroundColor = '#6C8E58'; e.currentTarget.style.boxShadow = 'none';}}>
                  Reporte
                </CDropdownToggle>
                <CDropdownMenu>
                  <CDropdownItem
                    onClick={generarReportePDF}
                    style={{cursor: 'pointer',outline: 'none', backgroundColor: 'transparent',padding: '0.5rem 1rem',fontSize: '0.85rem',color: '#333',borderBottom: '1px solid #eaeaea',transition: 'background-color 0.3s',}}
                    onMouseOver={(e) => (e.target.style.backgroundColor = '#f5f5f5')}onMouseOut={(e) => (e.target.style.backgroundColor = 'transparent')}>
                    <CIcon icon={cilFile} size="sm" /> Abrir en PDF
                 </CDropdownItem>
                  <CDropdownItem
                    onClick={generarReporteExcel}
                    style={{cursor: 'pointer',outline: 'none',backgroundColor: 'transparent',padding: '0.5rem 1rem',fontSize: '0.85rem',color: '#333', transition: 'background-color 0.3s',}}
                    onMouseOver={(e) => (e.target.style.backgroundColor = '#f5f5f5')}onMouseOut={(e) => (e.target.style.backgroundColor = 'transparent')}>
                    <CIcon icon={cilSpreadsheet} size="sm" /> Descargar Excel
                  </CDropdownItem>
                </CDropdownMenu>
              </CDropdown>
            </CCol>
          </CRow>
          {asistenciasFiltradas.length > 0 ? (
            <CTable bordered hover responsive className="shadow-sm">
              <thead className="bg-light">
                <tr>
                  <CTableHeaderCell className="text-center" style={{ fontSize: '0.95rem', padding: '3px', verticalAlign: 'middle' }}>#</CTableHeaderCell>
                  <CTableHeaderCell className="text-center" style={{ fontSize: '0.95rem', padding: '3px', verticalAlign: 'middle' }}>Nombre Completo</CTableHeaderCell>
                  <CTableHeaderCell className="text-center" style={{ fontSize: '0.95rem', padding: '3px', verticalAlign: 'middle' }}>Fecha</CTableHeaderCell>
                  <CTableHeaderCell className="text-center" style={{ fontSize: '0.95rem', padding: '3px', verticalAlign: 'middle' }}>Estado</CTableHeaderCell>
                  <CTableHeaderCell className="text-center" style={{ fontSize: '0.95rem', padding: '3px', verticalAlign: 'middle' }}>Observación</CTableHeaderCell>
                </tr>
              </thead>
              <CTableBody>
                {asistenciasFiltradas.map((asistencia, index) => (
                  <CTableRow key={asistencia.Cod_asistencias}>
                    <CTableDataCell className="text-center" style={{ fontSize: '1rem', padding: '3px', verticalAlign: 'middle' }}>{index + 1}</CTableDataCell>
                    <CTableDataCell style={{ fontSize: '0.95rem', padding: '3px', verticalAlign: 'middle' }}>{asistencia.Nombre_Completo}</CTableDataCell>
                    <CTableDataCell style={{ fontSize: '0.95rem', padding: '3px', verticalAlign: 'middle' }}>{formatDateTime(asistencia.Fecha)}</CTableDataCell>
                    <CTableDataCell style={{ fontSize: '0.95rem', padding: '3px', verticalAlign: 'middle' }}>{asistencia.DescripcionEstado}</CTableDataCell>
                    <CTableDataCell style={{ fontSize: '0.95rem', padding: '3px', verticalAlign: 'middle' }}>{asistencia.Observacion}</CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          ) : (
            <p className="text-center text-muted">No hay registros de asistencia para esta fecha</p>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setMostrarModal(false)}>
            Cerrar
          </CButton>
        </CModalFooter>
      </CModal>


      {/* Modal "Actualizar" */}
      <CModal visible={mostrarModalActualizar} onClose={() => setMostrarModalActualizar(false)} size="lg" centered backdrop="static">
        <CModalHeader closeButton={false}>
          <h5 className="modal-title">Actualizar Asistencia</h5>
          <CButton type="button" className="btn-close" onClick={() => setMostrarModalActualizar(false)} />
        </CModalHeader>
        <CModalBody style={{ fontSize: '0.85rem' }}>
          {/* Fecha de Asistencia */}
          <CRow className="align-items-center mb-2">
            <CCol xs="12" md="6" className="d-flex align-items-center">
              <h6 className="mb-1 me-3">Fecha:</h6>
              <CFormInput
                type="date"
                value={fecha}
                disabled // Esto deshabilita el campo de entrada
                className="rounded"
                style={{ maxWidth: '150px', padding: '0.3rem', fontSize: '0.85rem' }}
              />

            </CCol>
            {/* Botón Guardar */}
            <CCol xs="12" md="6" className="text-md-end text-center mt-2 mt-md-0"> 
            </CCol>
          </CRow>

          {/* Tabla de Estudiantes */}
          {asistenciasActualizar.length === 0 ? (
            <p className="text-muted">No hay estudiantes en esta sección.</p>
          ) : (
            <div className="table-responsive" style={{ maxHeight: '350px', overflowY: 'auto', overflowX: 'auto' }}>
              <CTable bordered hover responsive small>
                <thead className="bg-light">
                  <tr>
                    <CTableHeaderCell className="text-center" style={{ fontSize: '0.8rem', padding: '2px', verticalAlign: 'middle' }}>#</CTableHeaderCell>
                    <CTableHeaderCell className="text-center" style={{ fontSize: '0.8rem', padding: '2px', verticalAlign: 'middle' }}>ALUMNO</CTableHeaderCell>
                    {/* Encabezado para los íconos de estado */}
                    <CTableHeaderCell className="text-center" style={{ fontSize: '0.9rem', padding: '2px', verticalAlign: 'middle' }}>
                      <div className="d-flex justify-content-center gap-4">
                        {estadosAsistencia.map((estado) => {
                          const estilo = estadoAsistenciaEstilos[estado.Cod_estado_asistencia] || { color: 'gray', icono: '❓' };
                          const allSelected = asistenciasActualizar.every(
                            (asistencia) => asistencia.Cod_estado_asistencia === estado.Cod_estado_asistencia
                          );
                          const titleMessage = allSelected
                            ? `Haga clic para deseleccionar todos como: ${estado.Descripcion_asistencia}`
                            : `Haga clic para marcar todos como: ${estado.Descripcion_asistencia}`;
                          
                          return (
                            <span
                              key={estado.Cod_estado_asistencia}
                              style={{ color: estilo.color, fontSize: '1.2rem', cursor: 'pointer' }}
                              title={titleMessage}
                              onClick={() =>  handleSelectAllActualizar(estado.Cod_estado_asistencia)}
                            >
                              {estilo.icono}
                            </span>
                          );
                        })}
                      </div>
                    </CTableHeaderCell>
                    <CTableHeaderCell className="text-center" style={{ fontSize: '0.8rem', padding: '2px', verticalAlign: 'middle' }}>OBSERVACIÓN</CTableHeaderCell>
                  </tr>
                </thead>
                <CTableBody>
                  {asistenciasActualizar.map((asistencia, index) => (
                    <CTableRow key={asistencia.Cod_asistencias}>
                      <CTableDataCell className="text-center" style={{ fontSize: '0.8rem', padding: '2px', verticalAlign: 'middle' }}>{index + 1}</CTableDataCell>
                      <CTableDataCell style={{ fontSize: '0.8rem', padding: '4px', verticalAlign: 'middle' }}>{asistencia.Nombre_Completo}</CTableDataCell>
                      {/* Celda de checkboxes */}
                      <CTableDataCell className="text-center" style={{ fontSize: '0.8rem', padding: '2px', verticalAlign: 'middle' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '32px' }}>
                          {estadosAsistencia.map((estado) => {
                            const estilo = estadoAsistenciaEstilos[estado.Cod_estado_asistencia] || { color: 'gray' };
                            return (
                              <input
                                key={estado.Cod_estado_asistencia}
                                type="checkbox"
                                checked={asistenciasActualizar[index].Cod_estado_asistencia === estado.Cod_estado_asistencia}
                                onChange={() => handleEstadoCheckboxChangeActualizar(index, estado.Cod_estado_asistencia)}
                                style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: estilo.color, marginTop: '8px' }}
                              />
                            );
                          })}
                        </div>
                      </CTableDataCell>
                      <CTableDataCell className="text-center" style={{ fontSize: '0.8rem', padding: '4px' }}>
                      <CPopover
                        content={
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <textarea
                              placeholder="Escribe tu observación"
                              value={asistencia.Observacion === 'BORRAR' ? '' : asistencia.Observacion}
                              maxLength={50}
                              onChange={(e) => handleInputChange(e, (value) => handleObservacionChangeActualizar(index, value))}
                              onPaste={disableCopyPaste}
                              onCopy={disableCopyPaste}
                              style={{ width: '280px',height: '40px',padding: '0.5rem',resize: 'none',overflow: 'hidden',whiteSpace: 'pre-wrap',border: '1px solid #ccc',outline: 'none',fontSize: '0.75rem',}}
                              onFocus={(e) => (e.target.style.border = '1px solid #aaa')}
                              onBlur={(e) => (e.target.style.border = '1px solid #ccc')}
                            />
                            <button
                              onClick={() => handleObservacionChangeActualizar(index, 'BORRAR')}
                              style={{ backgroundColor: '#f44336',color: '#fff',border: 'none',padding: '0.1rem 0.3rem',borderRadius: '4px',cursor: 'pointer',fontSize: '0.75rem',}}>
                              Borrar
                            </button>
                          </div>
                        }
                        placement="right"
                        trigger="click"
                        style={{ maxWidth: '320px' }} // Ajustar el ancho del CPopover
                      >
                        
                        {canUpdate && (
                        <CButton color="link">
                          <CIcon icon={cilPencil} style={{ color: 'black' }} />
                        </CButton>
                        )}

                      </CPopover>
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            </div>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setMostrarModalActualizar(false)}>
            Cerrar
          </CButton>
          <CButton onClick={handleActualizarAsistencias}style={{ backgroundColor: '#9f7536', color: '#FFFFFF'}}>
            <CIcon icon={cilPen}  /> Actualizar
          </CButton>
        </CModalFooter>
      </CModal>
    </CContainer>
 );
};

export default ListaAsistencia;
