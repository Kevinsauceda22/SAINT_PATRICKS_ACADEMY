import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { CIcon } from '@coreui/icons-react';
import { cilSearch,cilInfo, cilBrushAlt, cilPen, cilTrash, cilPlus, cilSave,cilFile,cilSpreadsheet,cilDescription,cilArrowLeft } from '@coreui/icons'; // Importar iconos específicos
import swal from 'sweetalert2';
import { left } from '@popperjs/core';
import jsPDF from 'jspdf';
import 'jspdf-autotable'; // Importa el plugin para tablas
import * as XLSX from 'xlsx';
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
import logo from 'src/assets/brand/logo_saint_patrick.png'


const VistaActividadesAcademicasAdmin = () => {
  const [profesores, setProfesores] = useState([]);
  const [secciones, setSecciones] = useState([]);
  const [asignaturas, setAsignaturas] = useState([]);
  const [actividades, setActividades] = useState([]);
  const [selectedProfesor, setSelectedProfesor] = useState(null);
  const [listaPersonas, setListaPersonas] = useState([]);
  const [listaponderacionesC, setlistaponderacionesC] = useState([]); // 
  const [selectedSeccion, setSelectedSeccion] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalUpdateVisible, setModalUpdateVisible] = useState(false); // estado para el modal de actualizar
  const [modalDeleteVisible, setModalDeleteVisible] = useState(false);
  const [actividadToDelete, setActividadToDelete] = useState(null);
  const [selectedAsignatura, setSelectedAsignatura] = useState(null);
  const [modalReporteVisible, setModalReporteVisible] = useState(false);
  const [nuevaActividad, setNuevaActividad] = useState({
    Cod_profesor: '',
    Cod_ponderacion_ciclo: '',
    Cod_parcial: '',
    Nombre_actividad_academica: '',
    Descripcion: '',
    Fechayhora_Inicio: '',
    Fechayhora_Fin: '',
    Valor: '',
    Cod_secciones: '',
    Cod_seccion_asignatura: ''
  });
  const [listaponderaciones, setponderaciones] = useState([]);
  const [listaParcial, setparcial] = useState([]);
  const [modalDetalleVisible, setModalDetalleVisible] = useState(false);
  const [actividadToView, setActividadToView] = useState(null);

  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [actividadToUpdate, setActividadToUpdate] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false); // Estado para detectar cambios sin guardar

  //Filtro
  const [filtroNombre, setFiltroNombre] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState(''); // Tipo de filtro: sección, grado o año académico
  const [filtroValor, setFiltroValor] = useState(''); // Valor del filtro ingresado por el usuario
  const [filtroAsignatura, setFiltroAsignatura] = useState('');
  const [filtroActividad, setFiltroActividad] = useState('');
  const actividadesFiltradas = actividades.filter((actividad) =>
    actividad.Nombre_actividad_academica.toLowerCase().includes(filtroActividad.toLowerCase()) ||
    actividad.Descripcion.toLowerCase().includes(filtroActividad.toLowerCase())
  );
  
  //Paginacion 
  const [recordsPerPage, setRecordsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  //Paginacion secciones
  const [recordsPerPage2, setRecordsPerPage2] = useState(5);
  const [searchTerm2, setSearchTerm2] = useState('');
  const [currentPage2, setCurrentPage2] = useState(1);
  //Paginacion asignaturas
  const [recordsPerPage3, setRecordsPerPage3] = useState(5);
  const [searchTerm3, setSearchTerm3] = useState('');
  const [currentPage3, setCurrentPage3] = useState(1);
  //Paginacion actividades
  const [recordsPerPage4, setRecordsPerPage4] = useState(5);
  const [searchTerm4, setSearchTerm4] = useState('');
  const [currentPage4, setCurrentPage4] = useState(1);
  
  

  // Fetch de profesores
  useEffect(() => {
    const fetchProfesores = async () => {
      try {
        const response = await fetch('http://localhost:4000/api/profesores/VerProfesores');
        const data = await response.json();
        setProfesores(data);
      } catch (error) {
        console.error('Error al obtener los profesores:', error);
        Swal.fire('Error', 'Hubo un problema al obtener los profesores.', 'error');
      }
    };

    const fetchListaPersonas = async () => {
      try {
        const response = await fetch('http://localhost:4000/api/persona/verpersonas');
        const data = await response.json();
        const dataWithIndex = data.map((persona) => ({
          ...persona,
          nombreCompleto: `${persona.Nombre} ${persona.Segundo_nombre || ''} ${persona.Primer_apellido || ''} ${persona.Segundo_Apellido || ''}`.trim(),
        }));
        setListaPersonas(dataWithIndex);
      } catch (error) {
        console.error('Error al obtener la lista de personas:', error);
      }
    };

    fetchProfesores();
    fetchListaPersonas();
    fetchListaParcial();
    fetchlistaponderacion();
    fetchListaCiclo();
  }, []);

  // Función para obtener el nombre completo de una persona
  const getNombreCompleto = (codPersona) => {
    if (!listaPersonas.length) return 'Personas no disponibles';
    const persona = listaPersonas.find((p) => p.cod_persona === codPersona);
    if (persona) {
      const nombre = persona.Nombre || '';
      const segundoNombre = persona.Segundo_nombre || '';
      const primerApellido = persona.Primer_apellido || '';
      const segundoApellido = persona.Segundo_Apellido || '';
      return `${nombre} ${segundoNombre} ${primerApellido} ${segundoApellido}`.trim();
    }
    return 'Persona no encontrada';
  };

  // Fetch de secciones del profesor seleccionado
  const handleVerSecciones = async (profesor) => {
    setSelectedProfesor(profesor);
    try {
      const response = await fetch(`http://localhost:4000/api/secciones/porprofesor/${profesor.Cod_profesor}`);
      const data = await response.json();
      if (response.ok) {
        setSecciones(data);
      } else {
        Swal.fire('Error', 'No se encontraron secciones para este profesor.', 'info');
      }
    } catch (error) {
      console.error('Error al obtener las secciones:', error);
      Swal.fire('Error', 'Hubo un problema al obtener las secciones.', 'error');
    }
  };

  // Fetch de asignaturas de la sección seleccionada
  const handleVerAsignaturas = async (seccion) => {
    setSelectedSeccion(seccion);
    try {
      const response = await fetch(`http://localhost:4000/api/secciones_asignaturas/porseccion/${seccion.Cod_secciones}`);
      const data = await response.json();
      if (response.ok) {
        setAsignaturas(data);
      } else {
        Swal.fire('Error', 'No se encontraron asignaturas para esta sección.', 'info');
      }
    } catch (error) {
      console.error('Error al obtener las asignaturas:', error);
      Swal.fire('Error', 'Hubo un problema al obtener las asignaturas.', 'error');
    }
  };

  // Fetch de actividades de la asignatura seleccionada
 const handleVerActividades = async (asignatura) => {
  console.log('Asignatura seleccionada:', asignatura); // Depuración
  setSelectedAsignatura(asignatura);
  try {
    const response = await fetch(
      `http://localhost:4000/api/actividadesAcademicas/porProfesorYAsignatura/${selectedProfesor.Cod_profesor}/${asignatura.Cod_seccion_asignatura}`
    );
    const data = await response.json();
    console.log('Actividades recibidas:', data); // Depuración
    setActividades(data);
  } catch (error) {
    console.error('Error al obtener las actividades:', error);
    Swal.fire('Error', 'Hubo un problema al obtener las actividades académicas.', 'error');
  }
};
  
  
const fetchActividades = async (Cod_profesor, Cod_seccion_asignatura) => {
  try {
    const response = await fetch(
      `http://localhost:4000/api/actividadesAcademicas/porProfesorYAsignatura/${Cod_profesor}/${Cod_seccion_asignatura}`
    );
    const data = await response.json();

    if (response.ok) {
      console.log("Actividades actualizadas:", data); // Depuración
      setActividades(data); // Actualiza el estado con las actividades
    } else {
      console.warn("No se encontraron actividades:", data.mensaje);
      setActividades([]); // Limpia el estado si no hay actividades
    }
  } catch (error) {
    console.error("Error al obtener actividades:", error);
    setActividades([]); // Limpia el estado en caso de error
  }
};

const validarValorActividad = async (Cod_ponderacion_ciclo, Cod_seccion_asignatura, Cod_parcial, Valor) => {
  try {
      const response = await fetch('http://localhost:4000/api/actividadesacademicas/validar-valor', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ Cod_ponderacion_ciclo, Cod_seccion_asignatura, Cod_parcial, Valor }),
      });

      const data = await response.json();

      if (!response.ok) {
          Swal.fire("Error", data.mensaje, "error");
          return false;
      }

      return true;
  } catch (error) {
      console.error('Error al validar el valor de la actividad:', error);
      Swal.fire("Error", "Error al validar el valor de la actividad.", "error");
      return false;
  }
};

const fetchlistaActividades = async () => {
  try {
    const response = await fetch('http://localhost:4000/api/ponderaciones/verPonderaciones');
    const data = await response.json();
    setponderaciones(data);
  } catch (error) {
    console.error('Error al obtener las ponderaciones:', error);
  }
};
  const fetchlistaponderacion = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/ponderaciones/verPonderaciones');
      const data = await response.json();
      setponderaciones(data);
    } catch (error) {
      console.error('Error al obtener las ponderaciones:', error);
    }
  };
  
  const fetchListaParcial = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/parciales/verParciales');
      const data = await response.json();
      setparcial(data);
    } catch (error) {
      console.error('Error al obtener los parciales:', error);
    }
  };
  const fetchListaCiclo= async () => {
    try {
      const response = await fetch('http://localhost:4000/api/ponderacionCiclo/verPonderacionesCiclos');
      const data = await response.json();
      setlistaponderacionesC(data);
    } catch (error) {
      console.error('Error al obtener los parciales:', error);
    }
  };
 // Función para manejar cambios en el input
 const handleInputChange = (e, setFunction) => {
  const input = e.target;
  const cursorPosition = input.selectionStart; // Guarda la posición actual del cursor
  let value = input.value
    .toUpperCase() // Convertir a mayúsculas
    .trimStart(); // Evitar espacios al inicio

  const regex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9\s,;:.]*$/; // Permite letras con tildes, números, espacios, comas, puntos y símbolos permitidos

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
    swal.fire({
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
///////////////// PDF ///////////
const generarReportePDF = () => {
  const doc = new jsPDF();
  const img = new Image();
  img.src = logo; // Reemplaza con la URL o ruta de tu logo.

  img.onload = () => {
    // Agregar logo
    doc.addImage(img, 'PNG', 10, 10, 30, 30);

    let yPosition = 20;

    // Título
    doc.setFontSize(18);
    doc.setTextColor(0, 102, 51);
    doc.text('SAINT PATRICK\'S ACADEMY', doc.internal.pageSize.width / 2, yPosition, { align: 'center' });

    yPosition += 12;

    doc.setFontSize(16);
    doc.text('Reporte de Actividades Académicas', doc.internal.pageSize.width / 2, yPosition, { align: 'center' });

    yPosition += 10;

    // Detalles
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Listado de Actividades', 10, yPosition);

    yPosition += 6;

    // Línea divisoria
    doc.setLineWidth(0.5);
    doc.setDrawColor(0, 102, 51);
    doc.line(10, yPosition, doc.internal.pageSize.width - 10, yPosition);

    yPosition += 4;

    // Tabla
    doc.autoTable({
      startY: yPosition,
      head: [['Nombre de la Actividad', 'Descripción', 'Fecha y Hora Inicio', 'Fecha y Hora Fin', 'Valor']],
      body: actividadesFiltradas.map((actividad) => [
        actividad.Nombre_actividad_academica,
        actividad.Descripcion,
        new Date(actividad.Fechayhora_Inicio).toLocaleString('es-ES', {
          dateStyle: 'short',
          timeStyle: 'short',
        }),
        new Date(actividad.Fechayhora_Fin).toLocaleString('es-ES', {
          dateStyle: 'short',
          timeStyle: 'short',
        }),
        actividad.Valor,
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
    });

    // Guardar el PDF
    window.open(doc.output('bloburl'), '_blank');
  };

  img.onerror = () => {
    console.warn('No se pudo cargar el logo. El PDF se generará sin el logo.');
    window.open(doc.output('bloburl'), '_blank');
  };
};

/////////////////////7 EXCEL ///////////////////////////77
const generarReporteExcel = () => {
  const encabezados = [
    ['Saint Patrick Academy'],
    ['Reporte de Actividades Académicas'],
    ['Fecha de generación: ' + new Date().toLocaleDateString()],
    [], // Espacio en blanco
    ['Nombre de la Actividad', 'Descripción', 'Fecha y Hora Inicio', 'Fecha y Hora Fin', 'Valor'],
  ];

  // Crear filas con actividades filtradas
  const filas = actividadesFiltradas.map((actividad) => [
    actividad.Nombre_actividad_academica,
    actividad.Descripcion,
    new Date(actividad.Fechayhora_Inicio).toLocaleString('es-ES', {
      dateStyle: 'short',
      timeStyle: 'short',
    }),
    new Date(actividad.Fechayhora_Fin).toLocaleString('es-ES', {
      dateStyle: 'short',
      timeStyle: 'short',
    }),
    actividad.Valor,
  ]);

  // Combinar encabezados y filas
  const datos = [...encabezados, ...filas];

  // Crear una hoja de trabajo
  const hojaDeTrabajo = XLSX.utils.aoa_to_sheet(datos);

  // Ajustar el ancho de columnas automáticamente
  hojaDeTrabajo['!cols'] = [
    { wpx: 200 }, // Nombre de la Actividad
    { wpx: 300 }, // Descripción
    { wpx: 150 }, // Fecha y Hora Inicio
    { wpx: 150 }, // Fecha y Hora Fin
    { wpx: 100 }, // Valor
  ];

  // Crear el libro de trabajo
  const libroDeTrabajo = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(libroDeTrabajo, hojaDeTrabajo, 'Actividades Académicas');

  // Guardar el archivo Excel con un nombre personalizado
  const nombreArchivo = `Reporte_Actividades_${new Date().toLocaleDateString()}.xlsx`;

  XLSX.writeFile(libroDeTrabajo, nombreArchivo);
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
const resetNuevaActividad = () => setNuevaActividad('');
const resetActividadToUpdate = () => setActividadToUpdate(  '' );

const handleVerDetalles = (actividad) => {
  setActividadToView(actividad);
  setModalDetalleVisible(true);
};

  // Función para actualizar las actividades después de crear una nueva
  const onCreate = () => {
    if (selectedProfesor && selectedAsignatura) {
      fetchActividades(
        selectedProfesor.Cod_profesor,
        selectedAsignatura.Cod_asignatura
      );
    }
  };

  const handleGestionarAsignatura = (asignatura) => {
    console.log('Asignatura seleccionada:', asignatura); // Agrega este log para depurar
    setSelectedAsignatura(asignatura);
    setVistaActual("actividades");
    fetchActividades(asignatura.Cod_seccion_asignatura);
  };


  

  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

    // Convertir las fechas al formato "YYYY-MM-DDTHH:mm"
    const formatDateTime = (dateTime) => {
      if (!dateTime) return '';
      const date = new Date(dateTime);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0'); // Meses empiezan desde 0
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

  const abrirModalActualizarActividad = (actividad) => {
    setActividadToUpdate({
      ...actividad,
      Fechayhora_Inicio: formatDateTime(actividad.Fechayhora_Inicio),
      Fechayhora_Fin: formatDateTime(actividad.Fechayhora_Fin),
      Cod_profesor: selectedProfesor?.Cod_profesor || actividad.Cod_profesor,
      Cod_asignatura: selectedAsignatura?.Cod_asignatura || actividad.Cod_asignatura,
      Cod_secciones: selectedSeccion?.Cod_secciones || actividad.Cod_secciones,
      Cod_seccion_asignatura: selectedAsignatura?.Cod_asignatura || actividad.Cod_asignatura
    });
    setUpdateModalVisible(true);
  };

// Asegúrate de que `abrirModalCrearActividad` se llama correctamente
const abrirModalCrearActividad = () => {
  setNuevaActividad({
    Cod_profesor: selectedProfesor?.Cod_profesor, // Asigna el código del profesor aquí
    Nombre_actividad_academica: '',
    Descripcion: '',
    Fechayhora_Inicio: '',
    Fechayhora_Fin: '',
    Valor: '',
    Cod_ponderacion_ciclo: '',
    Cod_parcial: '',
    Cod_secciones: selectedSeccion?.Cod_secciones || '',
    Cod_asignatura: selectedAsignatura?.Cod_asignatura || '',
    Cod_seccion_asignatura: selectedAsignatura?.Cod_asignatura
  });
  setModalVisible(true);
};
//Abrir modal eliminar
const handleOpenDeleteModal = (actividad) => {
  setActividadToDelete(actividad);
  setModalDeleteVisible(true);
};


//-------------------paginacion, buscador vista actual : Actividades-----------------------------
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
const filteredProfesores= profesores.filter((profesor) =>
  getNombreCompleto(profesor.cod_persona).toLowerCase().includes(searchTerm.toLowerCase())
);

// Lógica de paginación
const indexOfLastRecord = currentPage * recordsPerPage;
const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
const currentRecords = filteredProfesores.slice(indexOfFirstRecord, indexOfLastRecord);

// Cambiar página
const paginate = (pageNumber) => {
if (pageNumber > 0 && pageNumber <= Math.ceil(filteredProfesores.length / recordsPerPage)) {
  setCurrentPage(pageNumber);
}
}
//------------------------------------------------------------------------------------------------------

//-------------------paginacion, buscador vista actual : Actividades-----------------------------
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
const filteredSecciones= secciones.filter((seccion) =>
  seccion.Nombre_seccion.toLowerCase().includes(searchTerm2.toLowerCase())||
  seccion.Nombre_grado.toLowerCase().includes(searchTerm2.toLowerCase())||
  seccion.Anio_academico.toString().includes(searchTerm2)
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

//-------------------paginacion, buscador vista actual : Actividades-----------------------------
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
const filteredAsignaturas= asignaturas.filter((asignatura) =>
  asignatura.Nombre_asignatura.toLowerCase().includes(searchTerm3.toLowerCase())
);

// Lógica de paginación
const indexOfLastRecord3= currentPage3 * recordsPerPage3;
const indexOfFirstRecord3 = indexOfLastRecord3 - recordsPerPage3;
const currentRecords3 = filteredAsignaturas.slice(indexOfFirstRecord3, indexOfLastRecord3);

// Cambiar página
const paginate3 = (pageNumber) => {
if (pageNumber > 0 && pageNumber <= Math.ceil(filteredAsignaturas.length / recordsPerPage3)) {
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
const indexOfLastRecord4= currentPage4 * recordsPerPage4;
const indexOfFirstRecord4 = indexOfLastRecord4 - recordsPerPage4;
const currentRecords4 = filteredActividades.slice(indexOfFirstRecord4, indexOfLastRecord4);

// Cambiar página
const paginate4 = (pageNumber) => {
if (pageNumber > 0 && pageNumber <= Math.ceil(filteredActividades.length / recordsPerPage4)) {
  setCurrentPage4(pageNumber);
}
}
//------------------------------------------------------------------------------------------------------
const handleCrearActividad = async () => {
  try {
    // Validación de campos requeridos
    if (
      !selectedProfesor?.Cod_profesor ||
      !nuevaActividad.Cod_ponderacion_ciclo ||
      !nuevaActividad.Cod_parcial ||
      !nuevaActividad.Nombre_actividad_academica ||
      !nuevaActividad.Descripcion ||
      !nuevaActividad.Fechayhora_Inicio ||
      !nuevaActividad.Fechayhora_Fin ||
      !nuevaActividad.Valor ||
      !selectedSeccion?.Cod_secciones ||
      !selectedAsignatura?.Cod_seccion_asignatura
  ) {
      Swal.fire('Error', 'Todos los campos son requeridos. Por favor, complete todos los campos.', 'error');
      return;
  }

  // Validación: la fecha de inicio no puede ser mayor que la fecha de fin
  const fechaInicio = new Date(nuevaActividad.Fechayhora_Inicio);
  const fechaFin = new Date(nuevaActividad.Fechayhora_Fin);

  if (fechaInicio > fechaFin) {
    Swal.fire({
      icon: 'error',
      title: 'Fechas inválidas',
      text: 'La "fecha inicio" no puede ser mayor que la "fecha fin".',
    }); 
    return;
  }


  
// Validar valor contra las restricciones del backend
const esValido = await validarValorActividad(
  nuevaActividad.Cod_ponderacion_ciclo,
  selectedAsignatura?.Cod_seccion_asignatura,
  nuevaActividad.Cod_parcial,
  nuevaActividad.Valor
);

if (!esValido) {
  return; // Detener si no es válido
}

// Crear el objeto de datos para enviar

      const actividadData = {
          Cod_profesor: selectedProfesor?.Cod_profesor || '',
          Cod_ponderacion_ciclo: nuevaActividad.Cod_ponderacion_ciclo,
          Cod_parcial: nuevaActividad.Cod_parcial,
          Nombre_actividad_academica: nuevaActividad.Nombre_actividad_academica,
          Descripcion: nuevaActividad.Descripcion,
          Fechayhora_Inicio: nuevaActividad.Fechayhora_Inicio,
          Fechayhora_Fin: nuevaActividad.Fechayhora_Fin,
          Valor: nuevaActividad.Valor,
          Cod_secciones: selectedSeccion?.Cod_secciones || '',
          Cod_seccion_asignatura: selectedAsignatura?.Cod_seccion_asignatura || ''
      };

      const response = await fetch('http://localhost:4000/api/actividadesAcademicas/registrar', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify(actividadData),
      });

      const responseData = await response.json();

      if (response.ok) {
        setModalVisible(false);
        resetNuevaActividad();
        setHasUnsavedChanges(false)
          Swal.fire({
              icon: 'success',
              title: '¡Éxito!',
              text: 'La actividad se ha creado correctamente.',
          });
          setModalVisible(false);

          // Actualiza la lista de actividades con la nueva lista del backend
          setActividades(responseData.actividades);
      } else {
          Swal.fire('Error', `Problema al crear actividad: ${responseData.mensaje}`, 'error');
      }
  } catch (error) {
      console.error('Error al crear la actividad', error);
      Swal.fire('Error', 'Error en el servidor al crear la actividad', 'error');
  }
};




const handleActualizarActividad = async () => {
  try {
     // Validación de campos requeridos
     if (
      !actividadToUpdate.Cod_profesor ||
      !actividadToUpdate.Cod_ponderacion_ciclo ||
      !actividadToUpdate.Cod_parcial ||
      !actividadToUpdate.Nombre_actividad_academica ||
      !actividadToUpdate.Descripcion ||
      !actividadToUpdate.Fechayhora_Inicio ||
      !actividadToUpdate.Fechayhora_Fin ||
      !actividadToUpdate.Valor ||
      !actividadToUpdate.Cod_secciones ||
      !actividadToUpdate.Cod_seccion_asignatura
    ) {
      Swal.fire(
        "Error",
        "Todos los campos son requeridos. Por favor, complete todos los campos.",
        "error"
      );
      return;
    }
     // Validación de fechas: Inicio no debe ser mayor que Fin
     const fechaInicio = new Date(actividadToUpdate.Fechayhora_Inicio);
     const fechaFin = new Date(actividadToUpdate.Fechayhora_Fin);
 
     if (fechaInicio > fechaFin) {
       Swal.fire({
         icon: "error",
         title: "Fechas inválidas",
         text: "La fecha de inicio no puede ser mayor que la fecha de fin.",
       });
       return;
     }


 // Validar valor con el límite de la ponderación
 try {
  const response = await fetch('http://localhost:4000/api/actividadesacademicas/validar-valoractua', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
     Cod_ponderacion_ciclo: actividadToUpdate.Cod_ponderacion_ciclo,
  Cod_seccion_asignatura: selectedAsignatura?.Cod_seccion_asignatura,
  Cod_parcial: nuevaActividad?.Cod_parcial,
  Valor: [actividadToUpdate.Valor],
  Cod_actividad_actual: actividadToUpdate.Cod_actividad_academica, // Para excluir esta actividad
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    Swal.fire("Error", data.mensaje, "error");
    return;
  }
} catch (error) {
  console.error("Error en la validación del valor:", error);
  Swal.fire("Error", "No se pudo validar el valor de la actividad.", "error");
  return;
}










    const actividadData = {
      Cod_profesor: actividadToUpdate.Cod_profesor,
      Cod_ponderacion_ciclo: actividadToUpdate.Cod_ponderacion_ciclo,
      Cod_parcial: actividadToUpdate.Cod_parcial,
      Nombre_actividad_academica: actividadToUpdate.Nombre_actividad_academica,
      Descripcion: actividadToUpdate.Descripcion,
      Fechayhora_Inicio: actividadToUpdate.Fechayhora_Inicio,
      Fechayhora_Fin: actividadToUpdate.Fechayhora_Fin,
      Valor: actividadToUpdate.Valor,
      Cod_secciones: actividadToUpdate.Cod_secciones,
      Cod_seccion_asignatura: actividadToUpdate.Cod_seccion_asignatura,
    };

    const response = await fetch(
      `http://localhost:4000/api/actividadesAcademicas/actualizar/${actividadToUpdate.Cod_actividad_academica}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(actividadData),
      }
    );

    if (response.ok) {
      setModalUpdateVisible(false);
      fetchActividades()
      resetActividadToUpdate();
      Swal.fire({
        icon: "success",
        title: "¡Éxito!",
        text: "La actividad se ha actualizado correctamente.",
      });
      setUpdateModalVisible(false);

      // Actualiza la tabla llamando a fetchActividades
      if (selectedProfesor && selectedAsignatura) {
        await fetchActividades(
          selectedProfesor.Cod_profesor,
          selectedAsignatura.Cod_seccion_asignatura
        );
      }
    } else {
      const errorData = await response.json();
      Swal.fire(
        "Error",
        `Problema al actualizar actividad: ${errorData.mensaje}`,
        "error"
      );
    }
  } catch (error) {
    console.error("Error al actualizar la actividad", error);
    Swal.fire("Error", "Hubo un problema al actualizar la actividad.", "error");
  }
};



const handleEliminarActividad = async (Cod_actividad_academica) => {
  try {
    // Confirmación antes de eliminar
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: '¡No podrás revertir esto!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminarlo',
    });

    if (result.isConfirmed) {
      // Realiza la solicitud DELETE
      const response = await fetch('http://localhost:4000/api/actividadesAcademicas/eliminarActividad', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ Cod_actividad_academica }),
      });

      if (response.ok) {
        fetchActividades();
        setModalDeleteVisible(false);
        setActividadToDelete({});
        Swal.fire('¡Eliminado!', 'La actividad académica ha sido eliminada.', 'success');
        onCreate(); // Actualiza la lista de actividades
      } else {
        console.error('Error al eliminar la actividad académica');
        Swal.fire('Error', 'Hubo un problema al eliminar la actividad académica', 'error');
      }
    }
  } catch (error) {
    console.error('Error al eliminar la actividad académica:', error);
    Swal.fire('Error', 'Hubo un problema al eliminar la actividad académica.', 'error');
  }
};



 

















return (
  <CContainer className="py-1">
    {/* Título */}
    {!selectedProfesor && (
      <>
        <CRow className="align-items-center mb-5">
          <CCol xs="12" className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
            <div className="flex-grow-1 text-center">
              <h4
                className="text-center fw-semibold pb-2 mb-0"
                style={{ display: 'inline-block', borderBottom: '2px solid #4CAF50' }}
              >
                Gestión Actividades Académicas
              </h4>
            </div>
          </CCol>
        </CRow>

        {/* Filtros y búsqueda */}
        <CRow className="align-items-center mt-4 mb-2">
          {/* Barra de búsqueda */}
          <CCol xs="12" md="8" className="d-flex flex-wrap align-items-center">
            <CInputGroup className="me-3" style={{ maxWidth: '350px' }}>
              <CInputGroupText>
                <CIcon icon={cilSearch} size="sm" />
              </CInputGroupText>
              <CFormInput
               style={{ width: '80px',height:'35px', display: 'inline-block',fontSize: '0.8rem'}}
                placeholder="Buscar profesor..."
                value={searchTerm}
                onChange={handleSearch}
                
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

          {/* Selector dinámico */}
          <CCol xs="12" md="4" className="text-md-end mt-2 mt-md-0">
            <CInputGroup style={{ width: 'auto', display: 'inline-block' }}>
              <div className="d-inline-flex align-items-center">
                <span style={{ fontSize: '0.85rem' }}>Mostrar&nbsp;</span>
                <CFormSelect
                style={{ width: '80px',height:'35px', display: 'inline-block', textAlign: 'center' }}
                  onChange={(e) => {
                    setRecordsPerPage(Number(e.target.value)); // Cambiar registros por página
                    setCurrentPage(1); // Reiniciar a la primera página
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

        {/* Tabla de Profesores */}
        <div className="table-responsive"style={{maxHeight: '400px',margin: '0 auto',overflowX: 'auto',overflowY: 'auto',boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)', }}>
          <CTable striped bordered hover responsive>
            <CTableHead className="sticky-top bg-light text-center" style={{ fontSize: '0.8rem' }}>
              <CTableRow>
              <CTableHeaderCell>#</CTableHeaderCell>
                <CTableHeaderCell>NOMBRE DEL PROFESOR</CTableHeaderCell>
                <CTableHeaderCell >ACCIÓN</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody className="text-center" style={{ fontSize: '0.85rem' }}>
            {currentRecords.length > 0 ? (
              currentRecords.map((profesor, index) => (
                <CTableRow key={profesor.Cod_profesor}>
                  <CTableDataCell >{index + 1}</CTableDataCell>
                  <CTableDataCell>{getNombreCompleto(profesor.cod_persona)}</CTableDataCell>
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
                      onClick={() => handleVerSecciones(profesor)}
                    >
                      Gestionar Secciones
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
      </>
    )}
           
           
  

      {/* Tabla de Secciones */}
      {selectedProfesor && !selectedSeccion && (
        <>
          <CRow className="align-items-center mb-5">
          {/* Botón "Volver a Secciones" a la izquierda */}
          <CCol xs="12" className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
          <CButton className="btn btn-sm d-flex align-items-center gap-1 rounded shadow"
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#4B4B4B")} onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#656565")}
          style={{backgroundColor: "#656565",color: "#FFFFFF",padding: "6px 12px",fontSize: "0.9rem",transition: "background-color 0.2s ease, box-shadow 0.3s ease",boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",}}
          onClick={() => setSelectedProfesor(null)}>
          <CIcon icon={cilArrowLeft}/>Regresar a Profesores
          </CButton>
          <div className="d-flex justify-content-center align-items-center flex-grow-1">
          <h4 className="text-center fw-semibold pb-2 mb-0" style={{display: "inline-block", borderBottom: "2px solid #4CAF50", margin: "0 auto",fontSize: "1.5rem"}}>Secciones de:  {getNombreCompleto(selectedProfesor.cod_persona)}</h4>
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
              style={{ width: '80px',height:'35px', display: 'inline-block',fontSize: '0.8rem'}}
                placeholder="Buscar por año, grado o sección"
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
    {/* Tabla de Secciones */}
    <div
      className="table-responsive"
      style={{
        maxHeight: '400px',
        overflowX: 'auto',
        overflowY: 'auto',
        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)',
      }}
      >
      <CTable striped bordered hover responsive>
        <CTableHead className="sticky-top bg-light text-center" style={{ fontSize: '0.8rem' }}>
          <CTableRow>
          <CTableHeaderCell>#</CTableHeaderCell>
            <CTableHeaderCell>NOMBRE DE LA SECCIÓN</CTableHeaderCell>
            <CTableHeaderCell>GRADO</CTableHeaderCell>
            <CTableHeaderCell>AÑO ACADÉMICO</CTableHeaderCell>
            <CTableHeaderCell>ACCIÓN</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody className="text-center" style={{ fontSize: '0.85rem' }}>
        {currentRecords2.length > 0 ? (
              currentRecords2.map((seccion, index) => (
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
                    onClick={() => handleVerAsignaturas(seccion)}
                  >
                    Gestionar Asignaturas
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

      {/* Tabla de Asignaturas */}
      {selectedSeccion && !selectedAsignatura && (
        <>
        <CRow className="align-items-center mb-5">
        {/* Botón "Volver a Secciones" a la izquierda */}
        <CCol xs="12" className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
        <CButton className="btn btn-sm d-flex align-items-center gap-1 rounded shadow"
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#4B4B4B")} onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#656565")}
        style={{backgroundColor: "#656565",color: "#FFFFFF",padding: "6px 12px",fontSize: "0.9rem",transition: "background-color 0.2s ease, box-shadow 0.3s ease",boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",}}
        onClick={() => setSelectedSeccion(null)}>
        <CIcon icon={cilArrowLeft} />Regresar a Secciones
        </CButton>
         <div  className="flex-grow-1 text-center">
            <h4 className="text-center fw-semibold pb-2 mb-0" style={{display: "inline-block", borderBottom: "2px solid #4CAF50" }}> Asignaturas de la Sección: {selectedSeccion.Nombre_seccion}</h4>
          </div>
         </CCol>
        </CRow>
       {/* Filtros y búsqueda */}
       <CRow className="align-items-center mt-4 mb-2">
          {/* Barra de búsqueda */}
          <CCol xs="12" md="8" className="d-flex flex-wrap align-items-center">
            <CInputGroup className="me-3" style={{ maxWidth: '350px' }}>
              <CInputGroupText>
                <CIcon icon={cilSearch} size="sm" />
              </CInputGroupText>
              <CFormInput
               style={{ width: '80px',height:'35px', display: 'inline-block',fontSize: '0.8rem'}}
                placeholder="Buscar asignatura..."
                value={searchTerm3}
                onChange={handleSearch3}
                
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

          {/* Selector dinámico */}
          <CCol xs="12" md="4" className="text-md-end mt-2 mt-md-0">
            <CInputGroup style={{ width: 'auto', display: 'inline-block' }}>
              <div className="d-inline-flex align-items-center">
                <span style={{ fontSize: '0.85rem' }}>Mostrar&nbsp;</span>
                <CFormSelect
                style={{ width: '80px',height:'35px', display: 'inline-block', textAlign: 'center' }}
                  onChange={(e) => {
                    setRecordsPerPage3(Number(e.target.value)); // Cambiar registros por página
                    setCurrentPage3(1); // Reiniciar a la primera página
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
        <CTableHead className="sticky-top bg-light text-center" style={{ fontSize: '0.8rem' }}>
          <CTableRow>
          <CTableHeaderCell>#</CTableHeaderCell>
            <CTableHeaderCell>NOMBRE DE LA ASIGNATURA</CTableHeaderCell>
            <CTableHeaderCell>DESCRIPCIÓN</CTableHeaderCell>
            <CTableHeaderCell style={{ width: '180px', textAlign: 'center' }}>ACCIÓN</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody className="text-center" style={{fontSize: '0.85rem',}}>
          {currentRecords3.length > 0 ? (
            currentRecords3.map((asignatura, index) => (
              <CTableRow key={asignatura.Cod_asignatura}>
                <CTableDataCell >{index + 1}</CTableDataCell>
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
                    onClick={() => handleVerActividades(asignatura)}
                  >
                    Gestionar Actividades
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


     <CModal visible={modalDetalleVisible} onClose={() => setModalDetalleVisible(false)} backdrop="static">
    <CModalHeader>
    <CModalTitle>Detalles de la Actividad</CModalTitle>
    </CModalHeader>
    <CModalBody>
    <h5>INFORMACIÓN</h5>

    <p><strong>Nombre de la Actividad:</strong> {actividadToView?.Nombre_actividad_academica || 'N/A'} </p>
    <p><strong>Descripción:</strong> {actividadToView?.Descripcion || 'N/A'}</p>
    <p><strong>Fecha y Hora Inicio:</strong>{' '}{actividadToView?.Fechayhora_Inicio? new Date(actividadToView.Fechayhora_Inicio).toLocaleString('es-ES', {
            dateStyle: 'short',
            timeStyle: 'short',
          }): 'N/A'}</p>
    <p><strong>Fecha y Hora Fin:</strong>{' '}{actividadToView?.Fechayhora_Fin? new Date(actividadToView.Fechayhora_Fin).toLocaleString('es-ES', {
            dateStyle: 'short',
            timeStyle: 'short',
          }): 'N/A'}</p>
    <p><strong>Valor:</strong> {actividadToView?.Valor || 'N/A'}</p>
   
   
  </CModalBody>
  <CModalFooter>
    <CButton color="secondary" onClick={() => setModalDetalleVisible(false)}>
      Cerrar
    </CButton>
  </CModalFooter>
</CModal>




      {/* Modal para Crear Actividad */}
      <CModal visible={modalVisible} backdrop="static">
  <CModalHeader closeButton={false}>
    <CModalTitle> Nueva Actividad Académica</CModalTitle>
    <CButton className="btn-close" aria-label="Close" onClick={() => handleCloseModal (setModalVisible,resetNuevaActividad )}/>
  </CModalHeader>
  <CModalBody>

      {/* Nombre de la actividad */}
      <CInputGroup className="mb-3">
      <CInputGroupText>Nombre de la Actividad</CInputGroupText> 
      <CFormInput
      placeholder="Ingrese el nombre de la actividad"
      value={nuevaActividad.Nombre_actividad_academica}
      onPaste={disableCopyPaste}
      onCopy={disableCopyPaste}
      onChange={(e)  => handleInputChange(e, (value) => setNuevaActividad({ ...nuevaActividad, Nombre_actividad_academica: e.target.value }))}
    />
    </CInputGroup>

     {/* Descripcion*/}
     <CInputGroup className="mb-3">
      <CInputGroupText>Descripción</CInputGroupText> 
      <CFormInput
       placeholder="Ingrese la descripcion de la actividad"
      value={nuevaActividad.Descripcion}
      onPaste={disableCopyPaste}
      onCopy={disableCopyPaste}
      onChange={(e) => handleInputChange(e, (value) => setNuevaActividad({ ...nuevaActividad, Descripcion: e.target.value }))}
    />
     </CInputGroup>

     {/* Fecha y hora inicio */}
     <CInputGroup className="mb-3">
      <CInputGroupText>Fecha y hora inicio</CInputGroupText> 
      <CFormInput
      type="datetime-local"
      value={nuevaActividad.Fechayhora_Inicio}
      onChange={(e) => setNuevaActividad({ ...nuevaActividad, Fechayhora_Inicio: e.target.value })}
    />
    </CInputGroup>

     {/* fecha y hora fin*/}
     <CInputGroup className="mb-3">
      <CInputGroupText>Fecha y hora fin</CInputGroupText> 
      <CFormInput
      type="datetime-local"
      value={nuevaActividad.Fechayhora_Fin}
      onChange={(e) => setNuevaActividad({ ...nuevaActividad, Fechayhora_Fin: e.target.value })}
    />
    </CInputGroup>

     {/* Ponderacion */}
     <CInputGroup className="mb-3">
     <CInputGroupText>Ponderación</CInputGroupText>
      <CFormSelect
      value={nuevaActividad.Cod_ponderacion_ciclo}
      onChange={(e) => setNuevaActividad({ ...nuevaActividad, Cod_ponderacion_ciclo: e.target.value })}
    >
      <option value="">Seleccione una ponderación</option>
      {listaponderaciones.map((ponderacion) => (
        <option key={ponderacion.Cod_ponderacion} value={ponderacion.Cod_ponderacion}>
          {ponderacion.Descripcion_ponderacion}
        </option>
      ))}
    </CFormSelect>
    </CInputGroup>

       {/* Select parcial*/}
       <CInputGroup className="mb-3">
      <CInputGroupText>Parcial</CInputGroupText>
      <CFormSelect
      value={nuevaActividad.Cod_parcial}
      onChange={(e) => setNuevaActividad({ ...nuevaActividad, Cod_parcial: e.target.value })}
    >
      <option value="">Selecciona un parcial</option>
      {listaParcial.map((parcial) => (
        <option key={parcial.Cod_parcial} value={parcial.Cod_parcial}>
          {parcial.Nombre_parcial}
        </option>
      ))}
    </CFormSelect>
    </CInputGroup> 

     {/* Valor */}
    
<CInputGroup className="mb-3">
  <CInputGroupText>Valor</CInputGroupText>
  <CFormInput
    placeholder="Ingrese el valor de la actividad"
    type="number"
    step="0.01" // Permite ingresar valores con dos decimales
    value={nuevaActividad.Valor}
    onPaste={disableCopyPaste}
    onCopy={disableCopyPaste}
    onChange={(e) => {
      let valorIngresado = parseFloat(e.target.value);

      // Validar si el valor es NaN
      if (isNaN(valorIngresado)) {
        Swal.fire({
          icon: 'error',
          title: 'Valor inválido',
          text: 'Por favor, ingresa un número válido.',
        });
        setNuevaActividad({ ...nuevaActividad, Valor: '' }); // Limpia el campo
        return;
      }

      // Validar negativos
      if (valorIngresado < 0) {
        Swal.fire({
          icon: 'warning',
          title: 'Número negativo',
          text: 'El valor no puede ser negativo.',
        });
        setNuevaActividad({ ...nuevaActividad, Valor: '' }); // Limpia el campo
        return;
      }

      // Validar si excede 100
      if (valorIngresado > 100) {
        Swal.fire({
          icon: 'warning',
          title: 'Valor excedido',
          text: 'El valor no puede ser mayor a 100.',
        });
        setNuevaActividad({ ...nuevaActividad, Valor: '' }); // Limpia el campo
        return;
      }

      // Redondear a dos decimales si todo es válido
      valorIngresado = parseFloat(valorIngresado.toFixed(2));

      // Actualizar el estado con el valor validado
      setNuevaActividad({
        ...nuevaActividad,
        Valor: valorIngresado,
      });
    }}
  />
</CInputGroup>
    
  </CModalBody>
  <CModalFooter>
    <CButton color="secondary" onClick={() => handleCloseModal(setModalVisible, resetNuevaActividad)}>
      Cerrar
    </CButton>
    <CButton  onClick={handleCrearActividad}
    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#3C4B43")}onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#4B6251")}
    style={{backgroundColor: "#4B6251",color: "#FFFFFF",padding: "5px 10px",fontSize: "0.9rem",}}>
    <CIcon icon={cilSave} style={{ marginRight: '5px' }} />
      Guardar
    </CButton>
  </CModalFooter>
</CModal>

{/* Modal Actualizar */}
<CModal visible={updateModalVisible} backdrop="static" >
  <CModalHeader closeButton={false}>
    <CModalTitle>Actualizar Actividad Académica</CModalTitle>
    <CButton className="btn-close" aria-label="Close"  onClick={() => handleCloseModal( setUpdateModalVisible, resetNuevaActividad)} />
  </CModalHeader>
  <CModalBody>
   
    {/* Nombre de la actividad*/}
    <CInputGroup className="mb-3">
        <CInputGroupText>Nombre de la actividad</CInputGroupText>
        <CFormInput
      value={actividadToUpdate?.Nombre_actividad_academica || ''}
      onPaste={disableCopyPaste}
      onCopy={disableCopyPaste}
      onChange={(e) => handleInputChange(e, (value) => setActividadToUpdate({ ...actividadToUpdate, Nombre_actividad_academica: e.target.value }))}
    />
    </CInputGroup>
    {/* Descripcion*/}
    <CInputGroup className="mb-3">
        <CInputGroupText>Descripción</CInputGroupText>
        <CFormInput
      value={actividadToUpdate?.Descripcion || ''}
      onPaste={disableCopyPaste}
      onCopy={disableCopyPaste}
      onChange={(e) => handleInputChange(e, (value)  => setActividadToUpdate({ ...actividadToUpdate, Descripcion: e.target.value }))}
    />
    </CInputGroup>

    {/* Fecha y hora de inicio */}
    <CInputGroup className="mb-3">
        <CInputGroupText>Fecha y hora inicio</CInputGroupText>
        <CFormInput
      type="datetime-local"
      value={actividadToUpdate?.Fechayhora_Inicio || ''}
      onChange={(e) => setActividadToUpdate({ ...actividadToUpdate, Fechayhora_Inicio: e.target.value })}
    />
    </CInputGroup>

    {/* Fecha y Hora de Fin*/}
    <CInputGroup className="mb-3">
        <CInputGroupText>Fecha y hora fin</CInputGroupText>
        <CFormInput
      type="datetime-local"
      value={actividadToUpdate?.Fechayhora_Fin || ''}
      onChange={(e) => setActividadToUpdate({ ...actividadToUpdate, Fechayhora_Fin: e.target.value })}
    />
     </CInputGroup>

   
    {/* Ponderación */}
    <CInputGroup className="mb-3">
        <CInputGroupText>Ponderación</CInputGroupText>
        <CFormSelect
      value={actividadToUpdate?.Cod_ponderacion_ciclo || ''}
      onChange={(e) =>
        setActividadToUpdate({ ...actividadToUpdate, Cod_ponderacion_ciclo: e.target.value })
      }
    >
      <option value="">Seleccione una ponderación</option>
      {listaponderaciones.map((ponderacion) => (
        <option key={ponderacion.Cod_ponderacion} value={ponderacion.Cod_ponderacion}>
          {ponderacion.Descripcion_ponderacion}
        </option>
      ))}
    </CFormSelect>
    </CInputGroup>

    {/* Parcial */}
    <CInputGroup className="mb-3">
        <CInputGroupText>Parcial</CInputGroupText>
        <CFormSelect
      value={actividadToUpdate?.Cod_parcial || ''}
      onChange={(e) => setActividadToUpdate({ ...actividadToUpdate, Cod_parcial: e.target.value })}
    >
      <option value="">Selecciona un parcial</option>
      {listaParcial.map((parcial) => (
        <option key={parcial.Cod_parcial} value={parcial.Cod_parcial}>
          {parcial.Nombre_parcial}
        </option>
      ))}
    </CFormSelect>
    </CInputGroup>
     {/* Valor*/}
     
{/* Valor */}
<CInputGroup className="mb-3">
  <CInputGroupText>Valor</CInputGroupText>
  <CFormInput
    type="number"
    step="0.01" // Permite valores con dos decimales
    value={actividadToUpdate?.Valor || ''}
    onPaste={disableCopyPaste}
    onCopy={disableCopyPaste}
    onChange={(e) => {
      let valorIngresado = parseFloat(e.target.value);

      // Validar si el valor es NaN
      if (isNaN(valorIngresado)) {
        Swal.fire({
          icon: 'error',
          title: 'Valor inválido',
          text: 'Por favor, ingresa un número válido.',
        });
        setActividadToUpdate({ ...actividadToUpdate, Valor: '' }); // Limpia el campo
        return;
      }

      // Validar negativos
      if (valorIngresado < 0) {
        Swal.fire({
          icon: 'warning',
          title: 'Número negativo',
          text: 'El valor no puede ser negativo.',
        });
        setActividadToUpdate({ ...actividadToUpdate, Valor: '' }); // Limpia el campo
        return;
      }

      // Validar si excede 100
      if (valorIngresado > 100) {
        Swal.fire({
          icon: 'warning',
          title: 'Valor excedido',
          text: 'El valor no puede ser mayor a 100.',
        });
        setActividadToUpdate({ ...actividadToUpdate, Valor: '' }); // Limpia el campo
        return;
      }

      // Redondear a dos decimales si todo es válido
      valorIngresado = parseFloat(valorIngresado.toFixed(2));

      // Actualizar el estado con el valor validado
      setActividadToUpdate({
        ...actividadToUpdate,
        Valor: valorIngresado,
      });
    }}
  />
</CInputGroup>
  </CModalBody>
  <CModalFooter>
    <CButton color="secondary" onClick={() => handleCloseModal( setUpdateModalVisible, resetActividadToUpdate)}>
      Cancelar
    </CButton>
    <CButton onClick={handleActualizarActividad}
    onMouseEnter={(e) => {e.currentTarget.style.backgroundColor = "#b28541"; }}
    onMouseLeave={(e) => {e.currentTarget.style.backgroundColor = "#9f7536"; }} style={{ backgroundColor: '#9f7536', color: '#FFFFFF'}}>
    <CIcon icon={cilPen} />Actualizar
    </CButton>
  </CModalFooter>
</CModal>

{/* Modal Eliminar Actividad */}
<CModal visible={modalDeleteVisible} onClose={() => setModalDeleteVisible(false)}>
  <CModalHeader>
    <CModalTitle>Eliminar Actividad</CModalTitle>
  </CModalHeader>
  <CModalBody>
    ¿Estás seguro de que deseas eliminar la actividad académica seleccionada?
    <br />
    <strong>{actividadToDelete?.nombre}</strong>
  </CModalBody>
  <CModalFooter>
    <CButton color="secondary" onClick={() => setModalDeleteVisible(false)}>
      Cancelar
    </CButton>
    <CButton
      style={{ backgroundColor: '#E57368', color: 'white' }}
      onClick={() => handleEliminarActividad(actividadToDelete?.Cod_actividad_academica)}
    >
      <CIcon icon={cilTrash} style={{ marginRight: '5px' }} /> Eliminar
    </CButton>
  </CModalFooter>
</CModal>





















      {/* Tabla de Actividades Académicas */}
      {selectedAsignatura && (
      <>
         <CRow className='align-items-center mb-5'>
          {/* Botón "Volver a Secciones" a la izquierda */}
          <CCol xs="12" className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
         <CButton className="btn btn-sm d-flex align-items-center gap-1 rounded shadow"
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#4B4B4B")} onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#656565")}
          style={{backgroundColor: "#656565",color: "#FFFFFF",padding: "6px 12px",fontSize: "0.9rem",transition: "background-color 0.2s ease, box-shadow 0.3s ease",boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",}}
          onClick={() => setSelectedAsignatura(null)}>
          <CIcon icon={cilArrowLeft} />Regresar a Asignaturas
          </CButton>
            <div className="d-flex justify-content-center align-items-center flex-grow-1">
              <h1 className="text-center fw-semibold pb-2 mb-0" style={{display: "inline-block", borderBottom: "2px solid #4CAF50", margin: "0 auto",fontSize: "1.5rem",}}>Actividades de {selectedAsignatura.Nombre_asignatura}</h1>
            </div>
            {/* Botón "Nuevo" a la derecha */}
            <CButton className="btn btn-sm d-flex align-items-center gap-1 rounded shadow"
          onClick={() => {abrirModalCrearActividad(true); 
          setHasUnsavedChanges(false); }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#3C4B43")}onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#4B6251")}
          style={{backgroundColor: "#4B6251",color: "#FFFFFF",padding: "5px 10px",fontSize: "0.9rem",}}>
           <CIcon icon={cilPlus} className="me-2" /> 
            Nuevo
           </CButton>
           <CDropdown className="btn-sm d-flex align-items-center gap-1 rounded shadow">
          <CDropdownToggle
    style={{
      backgroundColor: '#6C8E58',
      color: 'white',
      fontSize: '0.85rem',
      cursor: 'pointer',
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
   <CIcon icon={cilDescription}/> Reporte
  </CDropdownToggle>
  <CDropdownMenu
    style={{
      position: 'absolute',
      zIndex: 1050, // Asegura que el menú esté por encima de otros elementos
      backgroundColor: '#fff',
      boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.2)',
      borderRadius: '4px',
      overflow: 'hidden',
    }}
  >
    {/* Opción para PDF */}
    <CDropdownItem
      onClick={generarReportePDF} // Función para generar PDF
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
      <CIcon icon={cilFile} size="sm" /> Abrir en PDF
    </CDropdownItem>

    {/* Opción para Excel */}
    <CDropdownItem
      onClick={generarReporteExcel} // Función para generar Excel
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
    <div
      className="table-responsive"
      style={{
        maxHeight: '400px',
        overflowX: 'auto',
        overflowY: 'auto',
        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)',
      }}
    ></div >

<div className="table-responsive" style={{maxHeight: '400px',overflowX: 'auto',overflowY: 'auto', boxShadow: "0 4px 10px rgba(0, 0, 0, 0.3)"}}>
         <CTable striped bordered hover responsive>
        <CTableHead className="sticky-top bg-light text-center" style={{ fontSize: '0.8rem' }}>
          <CTableRow>
          <CTableHeaderCell>#</CTableHeaderCell>
            <CTableHeaderCell>NOMBRE DE LA ACTIVIDAD</CTableHeaderCell>
            <CTableHeaderCell>DESCRIPCIÓN</CTableHeaderCell>
            <CTableHeaderCell>FECHA Y HORA INICIO</CTableHeaderCell>
            <CTableHeaderCell>FECHA Y HORA FIN</CTableHeaderCell>
            <CTableHeaderCell>VALOR</CTableHeaderCell>
            <CTableHeaderCell>ACCIONES</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody className="text-center" style={{ fontSize: '0.85rem' }}>
          {currentRecords4.length > 0 ? (
            currentRecords4.map((actividad, index) => (
              <CTableRow key={actividad.Cod_actividad_academica}>
                <CTableDataCell>{index + 1}</CTableDataCell>
                <CTableDataCell>{actividad.Nombre_actividad_academica}</CTableDataCell>
                <CTableDataCell>{actividad.Descripcion}</CTableDataCell>
                <CTableDataCell>
                  {new Date(actividad.Fechayhora_Inicio).toLocaleString('es-ES', {
                    dateStyle: 'short',
                    timeStyle: 'short',
                  })}
                </CTableDataCell>
                <CTableDataCell>
                  {new Date(actividad.Fechayhora_Fin).toLocaleString('es-ES', {
                    dateStyle: 'short',
                    timeStyle: 'short',
                  })}
                </CTableDataCell>
                <CTableDataCell>{actividad.Valor}</CTableDataCell>
                <CTableDataCell>
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
  onClick={() => abrirModalActualizarActividad(actividad)}
>
  <CIcon icon={cilPen} />
</CButton>

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
  onClick={() => handleOpenDeleteModal(actividad)}
>
  <CIcon icon={cilTrash} />
</CButton>

<CButton
  style={{
    backgroundColor: '#5D8AA8',
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
    e.currentTarget.style.boxShadow = '0px 4px 10px rgba(93, 138, 168, 0.6)';
    e.currentTarget.style.color = '#000000';
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.boxShadow = 'none';
    e.currentTarget.style.color = '#5C4044';
  }}
  onClick={() => handleVerDetalles(actividad)}
>
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
        </>
      )}
    </CContainer>
  );
};

export default VistaActividadesAcademicasAdmin;
