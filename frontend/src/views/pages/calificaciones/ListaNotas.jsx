import React, { useEffect, useState } from 'react';
import { cilArrowLeft,cilPen,cilPlus, cilSpreadsheet,cilInfo, cilFile,cilSave } from '@coreui/icons';
import CIcon from '@coreui/icons-react';
import Swal from 'sweetalert2';
import {
  CContainer, CRow, CCol, CCard, CTable, CTableHeaderCell, CTableBody, CTableRow, CTableDataCell, CButton, CSpinner, CCardBody, CDropdown,CDropdownToggle,
  CDropdownMenu, CDropdownItem,CTableHead,CModal,CModalHeader,CModalTitle,CModalBody,CModalFooter
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


  useEffect(() => {
    fetchSecciones();
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

  const fetchActividad = async (Cod_seccion_asignatura, Cod_parcial, nombreParcial) => {
    try {
      setCargando(true);
      setNombreParcialSeleccionado(nombreParcial); // Guarda el nombre del parcial seleccionado
      console.log('Cod_seccion_asignatura:', Cod_seccion_asignatura, 'Cod_parcial:', Cod_parcial);
  
      const response = await fetch(
        `http://localhost:4000/api/notas/actividades?Cod_seccion_asignatura=${Cod_seccion_asignatura}`
      );
      if (!response.ok) throw new Error('Error al obtener las actividades');
      const data = await response.json();
  
      const actividadesFiltradas = data.filter(
        (actividad) => actividad.Cod_parcial === Cod_parcial
      );
      console.log('Actividades filtradas:', actividadesFiltradas);
  
      setActividades(actividadesFiltradas);
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
      Swal.fire("Error", "Hubo un problema al obtener las notas.", "error");
    } finally {
      setCargando(false);
    }
  };
  
  const actualizarNotas = async () => {
    try {
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
        },
        body: JSON.stringify(datosActualizados),
      });
  
      const resultado = await response.json();
  
      if (response.ok) {
        // Refrescar las vistas de asignaturas y promedios
        if (selectedCodSeccionAsignatura) {
          await fetchPromedio(selectedCodSeccionAsignatura);
        }
  
        if (selectedCodSeccion) {
          await fetchAsignaturas(selectedCodSeccion);
        }
        Swal.fire('Éxito', 'Las notas se actualizaron correctamente.', 'success');
        // Aquí puedes agregar lógica para refrescar los datos o cerrar el modal
        await fetchNotas(
          selectedCodSeccion,
          selectedCodSeccionAsignatura,
          actividadSeleccionada.Cod_parcial,
          actividadSeleccionada.Cod_actividad_asignatura
        );
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
        },
        body: JSON.stringify(datosNotas),
      });
  
      const resultado = await response.json();
  
      if (response.ok) {
        Swal.fire('Éxito', 'Las notas se guardaron correctamente.', 'success');
  
        // Refrescar las vistas de asignaturas y promedios
        if (selectedCodSeccionAsignatura) {
          await fetchPromedio(selectedCodSeccionAsignatura);
        }
  
        if (selectedCodSeccion) {
          await fetchAsignaturas(selectedCodSeccion);
        }
      } else {
        Swal.fire('Error', resultado.Mensaje || 'Ocurrió un error al guardar las notas.', 'error');
      }
    } catch (error) {
      console.error('Error al guardar notas:', error);
      Swal.fire('Error', 'Hubo un problema al guardar las notas.', 'error');
    }
  };
  
  // Función para abrir el modal de estudiantes con datos del fetch
  const handleAbrirModalEstudiantes = async (Cod_seccion, Cod_seccion_asignatura, Cod_parcial) => {
    try {
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
  

  const handleViewAsignaturas = (Cod_secciones, nombreSeccion,anio) => {
    setSelectedCodSeccion(Cod_secciones);
    fetchAsignaturas(Cod_secciones);
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
      const encabezados = [
        ["Saint Patrick Academy"],
        ["Reporte de Secciones"],
        [], // Espacio en blanco
        ["#","Sección", "Grado", "Total Alumnos", "Año Académico"]
      ];
    
      // Crear filas con asistencias filtradas
      const filas = secciones.map((seccion, index) => [
        index + 1,
        seccion.Seccion,
        seccion.Grado,
        seccion.Total_Alumnos,
        seccion.Anio_Academico
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

    const generarReporteasignaturasExcel = () => {
      if (!asignaturas || asignaturas.length === 0) {
        Swal.fire("Información", "No hay datos para generar el reporte.", "info");
        return;
      }
    
      const encabezados = [
        ["Saint Patrick Academy"],
        ["Reporte de Promedio por Asignatura"],
        [], // Espacio en blanco
        ["#", "Asignatura", "Descripción", "Promedio"],
      ];
    
      // Crear filas con asignaturas
      const filas = asignaturas.map((asignatura, index) => [
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
        { wpx: 200 }, // Descripción
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
      if (!asignaturas || asignaturas.length === 0) {
        Swal.fire("Información", "No hay datos para generar el reporte.", "info");
        return;
      }
    
      const encabezados = [
        ["Saint Patrick Academy"],
        ["Reporte de Promedio por Parcial de Asignatura"],
        [], // Espacio en blanco
        ["#", "Parcial", "Promedio", "Total Aprobados", "Total Reprobados"],
      ];
    
      // Crear filas con asignaturas
      const filas = promedios.map((promedio, index) => [
        index + 1,
        promedio.NombreParcial || "N/A",
        promedio.PromedioGeneral|| 0,
        promedio.TotalAprobados || 0,
        promedio.TotalReprobados || 0
      ]);
    
      // Combinar encabezados y filas
      const datos = [...encabezados, ...filas];
    
      // Crear una hoja de trabajo
      const hojaDeTrabajo = XLSX.utils.aoa_to_sheet(datos);
    
      // Ajustar el ancho de columnas automáticamente
      const ajusteColumnas = [
        { wpx: 40 }, // # (Número)
        { wpx: 150 }, // Asignatura
        { wpx: 200 }, // Descripción
        { wpx: 100 }, // Promedio
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
        if (nombreSeccionSeleccionada && anioSeccionSeleccionada && nombreasignaturaSeleccionada) {
          doc.text(
            `Sección: ${nombreSeccionSeleccionada} | Año: ${anioSeccionSeleccionada} | Asignatura: ${nombreasignaturaSeleccionada}`,
            doc.internal.pageSize.width / 2,
            yPosition,
            { align: 'center' }
          );
        } else if (nombreSeccionSeleccionada && anioSeccionSeleccionada) {
          doc.text(
            `Sección: ${nombreSeccionSeleccionada} | Año: ${anioSeccionSeleccionada}`,
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
          body: promedios.map((promedio, index) => [
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

    const generarReporteasignaturasPDF = () => {
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
         if (nombreSeccionSeleccionada && anioSeccionSeleccionada && nombreasignaturaSeleccionada) {
           doc.text(
             `Sección: ${nombreSeccionSeleccionada} | Año: ${anioSeccionSeleccionada} | Asignatura: ${nombreasignaturaSeleccionada}`,
             doc.internal.pageSize.width / 2,
             yPosition,
             { align: 'center' }
           );
         } else if (nombreSeccionSeleccionada && anioSeccionSeleccionada) {
           doc.text(
             `Sección: ${nombreSeccionSeleccionada} | Año: ${anioSeccionSeleccionada}`,
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
          body: asignaturas.map((asignatura, index) => [
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

    const generarReportePDF = () => {
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
          head: [['#', 'Sección', 'Grado', 'Total Alumnos','Año Académico,']],
          body: secciones.map((seccion, index) => [
            index + 1,
            `${seccion.Seccion || ''}`.trim(),
            seccion.Grado,
            seccion.Total_Alumnos,
            seccion.Anio_Academico,
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
                  Reporte
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
                      {secciones.map((seccion, index) => (
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
                              onClick={() => handleViewAsignaturas(seccion.Cod_secciones, seccion.Seccion,seccion.Anio_Academico)}
                            >
                              Ver Asignaturas
                            </CButton>
                          </CTableDataCell>
                        </CTableRow>
                      ))}
                    </CTableBody>
                  </CTable>
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
            <div className="d-flex justify-content-center align-items-center flex-grow-1">
              <h4 className="text-center fw-semibold pb-2 mb-0" style={{display: "inline-block", borderBottom: "2px solid #4CAF50", margin: "0 auto",}}> Asignaturas: Seccion {nombreSeccionSeleccionada || "Selecciona una sección"}- {anioSeccionSeleccionada || "Selecciona una sección"}</h4>
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
                {asignaturas.map((asignatura, index) => (
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
                        onClick={() => handleViewPromedios(asignatura.Cod_seccion_asignatura, asignatura.Nombre_asignatura)}
                      >
                        Gestionar Notas
                      </CButton>
                    </CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
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
          <div className="d-flex justify-content-center align-items-center flex-grow-1">
              <h4 className="text-center fw-semibold pb-2 mb-0" style={{display: "inline-block", borderBottom: "2px solid #4CAF50", margin: "0 auto",}}> Promedios-Asignatura: {nombreasignaturaSeleccionada || "Selecciona una sección"}</h4>
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
                  Reporte
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
                      {promedios.map((promedio, index) => (
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
                            <CButton
                            onClick={() => fetchActividad(selectedCodSeccionAsignatura,promedio.CodParcial, promedio.NombreParcial)} 
                            onMouseEnter={(e) => {e.currentTarget.style.boxShadow = '0px 4px 10px rgba(249, 182, 78, 0.6)';e.currentTarget.style.color = '#000000';}}
                            onMouseLeave={(e) => {e.currentTarget.style.boxShadow = 'none';e.currentTarget.style.color = '#5C4044';}}
                            style={{backgroundColor: '#F9B64E',color: '#5C4044',border: 'none', transition: 'all 0.2s ease',padding: '5px 10px',height: '38px',width: '45px',}}>
                            <CIcon icon={cilPen} />
                          </CButton>
                            <CButton
                            onClick={() =>
                              handleAbrirModalEstudiantes(
                                selectedCodSeccion,
                                selectedCodSeccionAsignatura,
                                promedio.CodParcial
                              )
                            }
                              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0px 4px 10px rgba(93, 138, 168, 0.6)';e.currentTarget.style.color = '#000000'; }}
                              onMouseLeave={(e) => {e.currentTarget.style.boxShadow = 'none';e.currentTarget.style.color = '#5C4044';}}
                              style={{backgroundColor: '#5D8AA8',marginRight: '10px',color: '#5C4044',border: 'none', transition: 'all 0.2s ease',padding: '5px 10px', height: '38px',width: '45px', }}>
                              <CIcon icon={cilInfo} />
                            </CButton>
                           
                          </CTableDataCell>
                        </CTableRow>
                      ))}
                    </CTableBody>
                  </CTable>
                  </div>
                  </>
        )}

{mostrarModalParciales && (
  <CModal visible={mostrarModalParciales} size="xl">
    <CModalHeader closeButton={false}>
      <CModalTitle> Registrar Notas</CModalTitle>
      <CButton type="button" className="btn-close" onClick={cerrarModalParciales} />
    </CModalHeader >
    <CModalBody className="text-center">
      {vistaModal === 'parciales' && (
        <>
        <h5 className="mb-4">Selecciona un Parcial</h5>
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
                <CTableDataCell>{actividad.Descripcion}</CTableDataCell>
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
                    onClick={() => handleIrAEstudiantes(actividad)}
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
            min="0"
            max={actividadSeleccionada?.Valor}
            step="0.01"
            className="form-control"
            placeholder={`Máx: ${actividadSeleccionada?.Valor}`}
            value={estudiante.nota || ''}
            onChange={(e) => {
              const nuevaNota = parseFloat(e.target.value);
              
              // Validar si la nota es negativa
              if (nuevaNota < 0) {
                Swal.fire(
                  'Nota inválida',
                  'La nota no puede ser negativa.',
                  'info'
                );
                return;
              }
              
              // Validar si la nota excede el valor máximo permitido
              if (nuevaNota > actividadSeleccionada?.Valor) {
                Swal.fire(
                  'Nota inválida',
                  `La nota no puede ser mayor a ${actividadSeleccionada?.Valor}.`,
                  'info'
                );
                return;
              }

              // Actualizar la nota si pasa las validaciones
              const estudiantesActualizados = estudiantes.map((est) =>
                est.cod_persona === estudiante.cod_persona
                  ? { ...est, nota: nuevaNota }
                  : est
              );
              setEstudiantes(estudiantesActualizados);
            }}
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
  <CModal visible={mostrarModalActividades} size="xl">
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
            {actividades.map((actividad, index) => (
              <CTableRow key={actividad.Cod_actividad_asignatura}>
                <CTableDataCell>{index + 1}</CTableDataCell>
                <CTableDataCell>{actividad.Nombre_actividad_academica}</CTableDataCell>
                <CTableDataCell>{actividad.Descripcion}</CTableDataCell>
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
          {actividades.reduce((sum, actividad) => sum + parseFloat(actividad.Valor || 0), 0).toFixed(2)}
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
      {notas.map((nota, index) => (
        <CTableRow key={nota.Cod_nota}>
          <CTableDataCell>{index + 1}</CTableDataCell>
          <CTableDataCell>{nota.Nombre_Completo}</CTableDataCell>
          <CTableDataCell>
            <input
              type="number"
              min="0"
              max={actividadSeleccionada?.Valor}
              step="0.01"
              className="form-control"
              placeholder={`Máx: ${actividadSeleccionada?.Valor}`}
              value={nota.Nota || ""}
              onChange={(e) => {
                const nuevaNota = parseFloat(e.target.value);

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
              }}
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
      ))}
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


<CModal visible={mostrarModalDetalleEstudiantes} onClose={() => setMostrarDetalleModalEstudiantes(false)} size="xl">
  <CModalHeader closeButton>
    <CModalTitle>Detalles de Estudiantes</CModalTitle>
  </CModalHeader>
  <CModalBody>
    {cargando ? (
      <div className="text-center my-5">
        <CSpinner color="primary" aria-label="Cargando estudiantes..." />
      </div>
    ) : estudiantesdetalles.length > 0 ? (
      <CTable striped bordered hover responsive>
        <CTableHead className="sticky-top bg-light text-center" style={{fontSize: '0.8rem'}}>
          <CTableRow>
            <CTableHeaderCell>#</CTableHeaderCell>
            <CTableHeaderCell>NOMBRE DEL ESTUDIANTE</CTableHeaderCell>
            <CTableHeaderCell>NOTA TOTAL</CTableHeaderCell>
            <CTableHeaderCell>ESTADO</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody className="text-center" style={{fontSize: '0.9rem',}}>
          {estudiantesdetalles.map((estudiante, index) => (
            <CTableRow key={estudiante.CodPersona}>
              <CTableDataCell>{index + 1}</CTableDataCell>
              <CTableDataCell>{estudiante.NombreCompleto}</CTableDataCell>
              <CTableDataCell>{estudiante.NotaTotal}</CTableDataCell>
              <CTableDataCell>
                {estudiante.NotaTotal >= 70 ? "Aprobado" : "Reprobado"}
              </CTableDataCell>
              
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
      onClick={() => setMostrarDetalleModalEstudiantes(false)}
    >
      Cerrar
    </CButton>
  </CModalFooter>
</CModal>

  </CContainer>
);

};

export default ListaNotas;
