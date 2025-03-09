import React, { useState, useEffect } from 'react';
import CIcon from '@coreui/icons-react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom'
import { cilSearch, cilArrowLeft, cilPen, cilTrash, cilSave, cilX, cilDescription, cilPlus, cilArrowCircleBottom } from '@coreui/icons';
import swal from 'sweetalert2';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import ExcelJS from 'exceljs';
import logo from 'src/assets/brand/logo_saint_patrick.png';
import {
  CButton, CContainer, CDropdown, CDropdownMenu, CDropdownToggle, CDropdownItem,
  CFormInput, CInputGroup, CInputGroupText, CModal, CModalHeader, CModalTitle, 
  CModalBody, CModalFooter, CPagination, CTable, CTableHead, CTableRow, 
  CTableHeaderCell, CTableBody, CTableDataCell, CFormSelect, CRow, CCol, CFormCheck
} from '@coreui/react';

const ListaSecciones_Asignaturas = () => {

      // Función para volver a la lista de secciones
      const volverAListaSecciones = () => {
        navigate('/lista-secciones', {
          state: { periodoSeleccionado }
        });
      };

      
      const location = useLocation(); 

      const { seccionSeleccionada } = location.state || {}; 
      console.log("Sección seleccionada:", seccionSeleccionada);

      const { gradoSeleccionado } = location.state || {}; 
      console.log("Grado seleccionada:", gradoSeleccionado);

      const { profesores } = location.state || {}; 
      console.log("Profesor seleccionada:", profesores);

      const { nombreSeccionSeleccionado } = location.state || {}; 
      console.log("Nombre seccion seleccionada:", nombreSeccionSeleccionado);

      

  const { periodoSeleccionado } = location.state || {};
  const [filteredProfesores, setFilteredProfesores] = useState([]);


  const [seccionesAsignaturas, setSeccionesAsignaturas] = useState([]);
  const diasFijos = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  const [asignaturas, setAsignaturas] = useState([]);
  
  // Estado para manejar horarios y asignaturas
  
  // Estados para gestionar la información de las secciones y asignaturas
  const [secciones, setSecciones] = useState([]);
  const [grados_asignaturas, setGradosAsignaturas] = useState([]);
  const [filterAsignatura, setFilterAsignatura] = useState('');
  
  // Estados para la visibilidad de los modales
  const [modalVisible, setModalVisible] = useState(false);
  


  const [modalUpdateVisible, setModalUpdateVisible] = useState(false);
  const [dropdownIndexInsert, setDropdownIndexInsert] = useState(null);
  const [dropdownIndexUpdate, setDropdownIndexUpdate] = useState(null);
  const [dropdownPositionUpdate, setDropdownPositionUpdate] = useState({});

  const [horariosInsert, setHorariosInsert] = useState([
  {
    horario_inicio: '',
    horario_fin: '',
    dias: {}, // Sin asignaturas seleccionadas
  },
]);


const [horarioToUpdate, setHorarioToUpdate] = useState([]);

  const [isInsertModalOpen, setIsInsertModalOpen] = useState(false);
  
  

  // Otros estados para manejar la navegación, búsqueda y cambios sin guardar

  const [searchTerm, setSearchTerm] = useState(''); // Inicializando searchTerm
  const [selectedGrado, setSelectedGrado] = useState("");
  const [dropdownIndex, setDropdownIndex] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({});



  


  const horariosExistentes = seccionesAsignaturas.filter(fila => parseInt(fila.cod_secciones) === parseInt(seccionSeleccionada));

  const [horarios, setHorarios] = useState([{
    Cod_seccion_asignatura: '',
    horario_inicio: '',
    horario_fin: '',
    cod_secciones: '',
    cod_grado: '',
    dias: {
      Lunes: '',
      Martes: '',
      Miércoles: '',
      Jueves: '',
      Viernes: '',
      Sábado: '',
      Domingo: ''
    }
  }]);
  
  
  const [isSubmitting, setIsSubmitting] = useState(false);



  const navigate = useNavigate();





{/***********************************************************************************************************************************/}

{/******************************************EFECTOS Y APIS**************************************************************************/}
useEffect(() => {
  const horariosExistentes = seccionesAsignaturas.filter(
    fila => parseInt(fila.cod_secciones) === parseInt(seccionSeleccionada)
  );

  const horariosFormateados = horariosExistentes.map(horario => ({
    ...horario,
    dias: diasFijos.reduce((acc, dia) => ({ ...acc, [dia]: horario.dias?.[dia] || '' }), {})
  }));

  setHorarios(horariosFormateados);
}, [seccionSeleccionada, seccionesAsignaturas]);

useEffect(() => {
  console.log('Datos de horarios después de la filtración:', horarios);
}, [horarios]);

{/**************************************************************************************************************************************/}

const fetchSeccionesAsignaturas = async () => {
  try {
    const response = await fetch("http://localhost:4000/api/seccionesAsignaturas/verSeccionesAsignaturas");
    if (!response.ok) throw new Error(`Error en la solicitud: ${response.statusText}`);

    const data = await response.json();
    console.log("Datos obtenidos de la API:", data); // Verifica la respuesta de la API
    setSeccionesAsignaturas(data); // Asigna los datos al estado seccionesAsignaturas
  } catch (error) {
    console.error("Error fetching Secciones Asignaturas:", error);
  }
};


const fetchAsignaturas = async () => {
  try {
    const response = await fetch('http://localhost:4000/api/seccionesAsignaturas/verAsignaturas');
    if (!response.ok) throw new Error(`Error en la solicitud: ${response.statusText}`);
    const data = await response.json();
    console.log('Datos obtenidos de la API de Asignaturas:', data);
    setAsignaturas(data);
  } catch (error) {
    console.error('Error fetching asignaturas:', error);
  }
};



useEffect(() => {
  fetchSeccionesAsignaturas();
  fetchAsignaturas();
}, []);

{/*************************************************************************************************************************************/}


const toggleDropdownInsert = (rowIndex, dia, event) => {
  const rect = event.target.getBoundingClientRect();
  setDropdownPosition({ top: rect.bottom + window.scrollY, left: rect.left + window.scrollX - 130 }); // Ajustamos el valor de left para centrar el desplegable
  
  setDropdownIndex(dropdownIndex && dropdownIndex.row === rowIndex && dropdownIndex.dia === dia ? null : { row: rowIndex, dia });
};

const handleAddRowInsert = () => {
  if (horariosInsert.length < 20) {
    setHorariosInsert([...horariosInsert, { horario_inicio: '', horario_fin: '', dias: {} }]);
  } else {
    swal.fire('Límite Alcanzado', 'No se pueden agregar más de 20 filas.', 'warning');
  }
};


const handleChangeInsert = (rowIndex, field, value) => {
  setHorariosInsert((prevHorarios) => {
    const updatedHorarios = [...prevHorarios];
    if (field === 'horario_inicio' || field === 'horario_fin') {
      updatedHorarios[rowIndex] = {
        ...updatedHorarios[rowIndex],
        [field]: value,
      };
      // Solo valide si ambos campos tienen valor
      if (updatedHorarios[rowIndex].horario_inicio && updatedHorarios[rowIndex].horario_fin) {
        if (!validarHorario(updatedHorarios[rowIndex].horario_inicio, updatedHorarios[rowIndex].horario_fin)) {
          swal.fire('Error', 'Debe ingresar horarios entre 7:00 AM y 2:00 PM.', 'error');
          return prevHorarios;
        }
      }
    } else {
      updatedHorarios[rowIndex] = {
        ...updatedHorarios[rowIndex],
        dias: {
          ...updatedHorarios[rowIndex].dias,
          [field]: value,
        },
      };
    }
    return updatedHorarios;
  });
};

const handleSelectAsignatura = (rowIndex, dia, value) => {
  handleChangeInsert(rowIndex, dia, value);
  setDropdownIndex(null); // Cierra el desplegable al seleccionar una asignatura
};

const borrarAsignatura = (rowIndex, dia) => {
  handleChangeInsert(rowIndex, dia, null);
};


const validarHorario = (horario_inicio, horario_fin) => {
  const inicio = new Date(`1970-01-01T${horario_inicio}:00`);
  const fin = new Date(`1970-01-01T${horario_fin}:00`);
  const inicioValido = inicio >= new Date('1970-01-01T07:00:00') && inicio <= new Date('1970-01-01T14:00:00');
  const finValido = fin >= new Date('1970-01-01T07:00:00') && fin <= new Date('1970-01-01T14:00:00');
  return inicioValido && finValido && inicio < fin; // Asegura que el inicio sea antes del fin
};

const handleInsertModalClose = () => {
  // Solo muestra la alerta si el modal está visible
  if (modalVisible) {
    swal.fire({
      title: '¿Estás seguro?',
      text: 'Tienes cambios sin guardar. ¿Deseas cerrar el modal?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Cerrar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        setModalVisible(false); // Cierra el modal
        setHorariosInsert([]); // Limpia el estado de horarios
      }
    });
  }
};

const handleInsertModalOpen = () => {
  setModalVisible(true);
  setHorariosInsert([
    {
      horario_inicio: '',
      horario_fin: '',
      dias: {}, // Sin asignaturas seleccionadas
    },
  ]);
};


{/*************************************************FUNCIONES PARA EDITAR ADICIONALES**************************************************/}

  const toggleDropdownUpdate = (rowIndex, dia) => {
    const rect = event.target.getBoundingClientRect();
    setDropdownPositionUpdate({ top: rect.bottom + window.scrollY, left: rect.left + window.scrollX - 130 });
    setDropdownIndexUpdate(
      dropdownIndexUpdate && dropdownIndexUpdate.row === rowIndex && dropdownIndexUpdate.dia === dia 
        ? null 
        : { row: rowIndex, dia }
    );
  };

  const handleAddRowUpdate = () => {
    if (horarioToUpdate.length >= 20) {
      swal.fire('Límite Alcanzado', 'No se pueden agregar más de 20 filas.', 'warning');
      return;
    }
  
    setHorarioToUpdate([
      ...horarioToUpdate,
      { horario_inicio: '', horario_fin: '', dias: {} }
    ]);
  };
  

  const handleEditClick = (horarios) => {
    if (!Array.isArray(horarios) || horarios.length === 0) {
      console.error('No se pasaron horarios válidos:', horarios);
      return;
    }
  
    const updatedHorarios = horarios.map(horario => ({
      Cod_seccion_asignatura: horario.Cod_seccion_asignatura || '',
      horario_inicio: horario.horario_inicio || '',
      horario_fin: horario.horario_fin || '',
      cod_secciones: horario.cod_secciones || '',
      dias: {
        Lunes: horario.lunes || '',
        Martes: horario.martes || '',
        Miércoles: horario.miercoles || '',
        Jueves: horario.jueves || '',
        Viernes: horario.viernes || '',
        Sábado: horario.sabado || '',
        Domingo: horario.domingo || ''
      }
    }));
  
    setHorarioToUpdate(updatedHorarios);
    setModalUpdateVisible(true);
  };
  

  const handleUpdateChange = (rowIndex, field, value) => {
    setHorarioToUpdate((prevHorarios) => {
      const updatedHorarios = [...prevHorarios];
      updatedHorarios[rowIndex] = {
        ...updatedHorarios[rowIndex],
        dias: {
          ...updatedHorarios[rowIndex].dias,
          [field]: value,
        },
      };
  
      // Cerrar el desplegable
      setDropdownIndexUpdate(null);
      setDropdownPositionUpdate(null);
  
      return updatedHorarios;
    });
  };
  


  const handleChangeUpdate = (rowIndex, field, value) => {
    setHorarioToUpdate((prevHorarios) => {
      const updatedHorarios = [...prevHorarios];
  
      updatedHorarios[rowIndex] = {
        ...updatedHorarios[rowIndex],
        [field]: value,
      };
  
      return updatedHorarios;
    });
  };
  
  const handleDeleteRow = async (rowIndex, Cod_seccion_asignatura) => {
    const horario = horarioToUpdate[rowIndex];
  
    console.log('Intentando eliminar fila:', {
      rowIndex,
      Cod_seccion_asignatura,
      horario,
    });
  
    // Verificar si la fila tiene un Cod_seccion_asignatura válido y proceder con la confirmación
    if (Cod_seccion_asignatura) {
      try {
        await handleDeleteSeccionAsignatura(Cod_seccion_asignatura); // Eliminar de la base de datos
        setHorarioToUpdate(horarioToUpdate.filter((_, i) => i !== rowIndex)); // Eliminar de la UI
      } catch (error) {
        console.error('Error eliminando la fila:', error);
      }
      return;
    }
  
    // Si no hay Cod_seccion_asignatura, elimina la fila sin confirmación
    setHorarioToUpdate(horarioToUpdate.filter((_, i) => i !== rowIndex));
  };

// Cerrar el modal de editar
const handleUpdateModalClose = () => {
  setModalUpdateVisible(false);
  setHorarioToUpdate(null);
};

{/************************************************************************************************************************************/}

const handleInsertSubmit = async () => {
  if (isSubmitting) return;
  setIsSubmitting(true);

  // Filtrar filas válidas
  // Filtrar filas válidas
  const validHorarios = horariosInsert.filter(horario => horario.horario_inicio && horario.horario_fin && validarHorario(horario.horario_inicio, horario.horario_fin));

  if (!validHorarios.length) {
    swal.fire('Error', 'Debe ingresar horarios entre 7:00 AM y 2:00 PM.', 'error');
    setIsSubmitting(false);
    return;
  }

    // Ordenar horarios por horario_inicio
    const sortedHorarios = validHorarios.sort((a, b) => new Date(`1970-01-01T${a.horario_inicio}:00`) - new Date(`1970-01-01T${b.horario_inicio}:00`));

  const dataToSubmit = validHorarios.map(horario => ({
    Cod_seccion_asignatura: horario.Cod_seccion_asignatura,
    horario_inicio: horario.horario_inicio,
    horario_fin: horario.horario_fin,
    cod_secciones: seccionSeleccionada,
    lunes: horario.dias.Lunes ? asignaturas.find(a => a.Nombre_asignatura === horario.dias.Lunes).Cod_asignatura : null,
    martes: horario.dias.Martes ? asignaturas.find(a => a.Nombre_asignatura === horario.dias.Martes).Cod_asignatura : null,
    miercoles: horario.dias.Miércoles ? asignaturas.find(a => a.Nombre_asignatura === horario.dias.Miércoles).Cod_asignatura : null,
    jueves: horario.dias.Jueves ? asignaturas.find(a => a.Nombre_asignatura === horario.dias.Jueves).Cod_asignatura : null,
    viernes: horario.dias.Viernes ? asignaturas.find(a => a.Nombre_asignatura === horario.dias.Viernes).Cod_asignatura : null,
    sabado: horario.dias.Sabado ? asignaturas.find(a => a.Nombre_asignatura === horario.dias.Sabado).Cod_asignatura : null,
    domingo: horario.dias.Domingo ? asignaturas.find(a => a.Nombre_asignatura === horario.dias.Domingo).Cod_asignatura : null
  }));

  if (!Array.isArray(dataToSubmit) || dataToSubmit.length === 0) {
    console.error('dataToSubmit no es un array válido', dataToSubmit);
    swal.fire('Error', 'No hay datos válidos para enviar.', 'error');
    setIsSubmitting(false);
    return;
  }

  console.log('Datos a enviar:', dataToSubmit);

  try {
    const urlInsert = 'http://localhost:4000/api/seccionesAsignaturas/crearSeccionAsignatura';

    const responses = await Promise.all(dataToSubmit.map(async (data) => {
      return fetch(urlInsert, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    }));

    await fetchSeccionesAsignaturas(); // Actualizar los datos en la vista principal

    const allSuccessful = responses.every(response => response.ok);

    if (allSuccessful) {
      swal.fire('Inserción Exitosa', 'Los datos fueron insertados correctamente.', 'success');
      setModalVisible(false);
    } else {
      const errors = await Promise.all(responses.map(response => response.json()));
      console.error('Errores del servidor:', errors);
      swal.fire('Error', 'Hubo un problema al insertar los datos.', 'error');
    }
  } catch (error) {
    console.error('Error en la solicitud:', error);
    swal.fire('Error', 'Hubo un problema en la solicitud de inserción.', 'error');
  } finally {
    setIsSubmitting(false);
  }
};


{/*************************************************************************************************************/}
const handleUpdateSubmit = async () => {
  if (isSubmitting) return;
  setIsSubmitting(true);

  const updatedHorarios = horarioToUpdate.map((horario) => {
    const [horaInicio, minInicio] = horario.horario_inicio ? horario.horario_inicio.split(':').map(Number) : [undefined, undefined];
    const [horaFin, minFin] = horario.horario_fin ? horario.horario_fin.split(':').map(Number) : [undefined, undefined];

    const isValidHoraInicio = horaInicio >= 7 && (horaInicio < 14 || (horaInicio === 14 && minInicio === 0));
    const isValidHoraFin = horaFin >= 7 && (horaFin < 14 || (horaFin === 14 && minFin === 0));

    if (!isValidHoraInicio || !isValidHoraFin) {
      return { ...horario, hasError: true };
    }

    return { ...horario, hasError: false };
  });

  const hasErrors = updatedHorarios.some((horario) => horario.hasError);

  setHorarioToUpdate(updatedHorarios);

  if (hasErrors) {
    swal.fire('Error', 'Debe corregir los horarios fuera del rango permitido (7:00 AM - 2:00 PM).', 'error');
    setIsSubmitting(false);
    return;
  }

  const dataToSubmit = updatedHorarios.map((horario) => ({
    Cod_seccion_asignatura: horario.Cod_seccion_asignatura,
    horario_inicio: horario.horario_inicio,
    horario_fin: horario.horario_fin,
    cod_secciones: seccionSeleccionada,
    lunes: horario.dias?.Lunes ? asignaturas.find(a => a.Cod_asignatura === horario.dias.Lunes)?.Cod_asignatura : null,
    martes: horario.dias?.Martes ? asignaturas.find(a => a.Cod_asignatura === horario.dias.Martes)?.Cod_asignatura : null,
    miercoles: horario.dias?.Miércoles ? asignaturas.find(a => a.Cod_asignatura === horario.dias.Miércoles)?.Cod_asignatura : null,
    jueves: horario.dias?.Jueves ? asignaturas.find(a => a.Cod_asignatura === horario.dias.Jueves)?.Cod_asignatura : null,
    viernes: horario.dias?.Viernes ? asignaturas.find(a => a.Cod_asignatura === horario.dias.Viernes)?.Cod_asignatura : null,
    sabado: horario.dias?.Sábado ? asignaturas.find(a => a.Cod_asignatura === horario.dias.Sábado)?.Cod_asignatura : null,
    domingo: horario.dias?.Domingo ? asignaturas.find(a => a.Cod_asignatura === horario.dias.Domingo)?.Cod_asignatura : null
  }));

  if (dataToSubmit.some(d => !d.Cod_seccion_asignatura)) {
    console.error('Los datos a actualizar no son válidos', dataToSubmit);
    swal.fire('Error', 'No hay datos válidos para enviar.', 'error');
    setIsSubmitting(false);
    return;
  }

  console.log('Datos a enviar:', dataToSubmit);

  try {
    await Promise.all(dataToSubmit.map(async (data) => {
      const urlUpdate = `http://localhost:4000/api/seccionesAsignaturas/actualizarSeccionAsignatura/${data.Cod_seccion_asignatura}`;

      const response = await fetch(urlUpdate, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Errores del servidor:', error);
        throw new Error('Hubo un problema al actualizar los datos.');
      }
    }));

    await fetchSeccionesAsignaturas(); // Actualizar los datos en la vista principal

    swal.fire('Actualización Exitosa', 'Los datos fueron actualizados correctamente.', 'success');
    setModalUpdateVisible(false);
  } catch (error) {
    console.error('Error en la solicitud:', error);
    swal.fire('Error', 'Hubo un problema en la solicitud de actualización.', 'error');
  } finally {
    setIsSubmitting(false);
  }
};



{/**************************************************************************************************************/}




{/*************************************************FUNCION PARA ELIMIAR HORARIO********************************************************************************/}
const handleDeleteSeccionAsignatura = async (Cod_seccion_asignatura) => {
  if (!Cod_seccion_asignatura) {
    console.error('Cod_seccion_asignatura es inválido:', Cod_seccion_asignatura);
    return;
  }

  try {
    console.log('Realizando solicitud para eliminar:', Cod_seccion_asignatura);

    const confirmResult = await swal.fire({
      title: 'Confirmar Eliminación',
      html: `¿Estás seguro de que deseas eliminar esta columna?`,
      showCancelButton: true,
      confirmButtonColor: '#FF6B6B',
      cancelButtonColor: '#6C757D',
      confirmButtonText: '<i class="fa fa-trash"></i> Eliminar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
      focusCancel: true,
    });

    if (!confirmResult.isConfirmed) return;

    const response = await fetch(
      `http://localhost:4000/api/seccionesAsignaturas/eliminarSeccionAsignatura/${encodeURIComponent(Cod_seccion_asignatura)}`,
      { method: 'DELETE' }
    );

    console.log('Respuesta del servidor:', response);

    if (response.ok) {
      const result = await response.json();
      setHorarioToUpdate((prevHorarios) =>
        prevHorarios.filter((item) => item.Cod_seccion_asignatura !== Cod_seccion_asignatura)
      );


      await fetchSeccionesAsignaturas(); // Actualizar los datos en la vista principal

      swal.fire({
        icon: 'success',
        title: 'Sección eliminada',
        text: result.Mensaje || 'Eliminado correctamente',
      });
    } else {
      console.error('Error del servidor:', response.statusText);
      const error = await response.json();
      throw new Error(error.Mensaje || 'Error al eliminar');
    }
  } catch (error) {
    console.error('Error eliminando la sección asignatura:', error);
    swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'No se pudo eliminar la sección asignatura. Error en el servidor.',
    });
  }
};


{/************************************************************************************************************************************/}



const generateSeccionesAsignaturasPDF = () => {
  const doc = new jsPDF('p', 'mm', 'letter'); // Formato vertical

  if (!filteredSeccionesAsignaturas || filteredSeccionesAsignaturas.length === 0) {
    alert('No hay datos para exportar.');
    return;
  }

  const img = new Image();
  img.src = logo; // Asegúrate de que tienes una variable `logo` con la ruta correcta

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
    doc.text('HORARIO', pageWidth / 2, 50, { align: 'center' });

    // Grado y Sección
    doc.setFontSize(12);
    doc.text(`GRADO: ${gradoSeleccionado}`, pageWidth / 2, 56, { align: 'center' });
    doc.text(`SECCIÓN: ${nombreSeccionSeleccionado}`, pageWidth / 2, 62, { align: 'center' });

    doc.setLineWidth(0.5);
    doc.setDrawColor(0, 102, 51);
    doc.line(10, 70, pageWidth - 10, 70);

    // Tabla de datos
    const tableColumn = [
      { header: 'Horario', dataKey: 'horario' },
      { header: 'Lunes', dataKey: 'lunes' },
      { header: 'Martes', dataKey: 'martes' },
      { header: 'Miércoles', dataKey: 'miercoles' },
      { header: 'Jueves', dataKey: 'jueves' },
      { header: 'Viernes', dataKey: 'viernes' },
      { header: 'Sábado', dataKey: 'sabado' },
      { header: 'Domingo', dataKey: 'domingo' },
    ];

    const tableRows = filteredSeccionesAsignaturas.map((fila) => ({
      horario: `${fila.horario_inicio} - ${fila.horario_fin}`,
      lunes: asignaturas.find(asig => asig.Cod_asignatura === fila.lunes)?.Nombre_asignatura.toUpperCase() || '-',
      martes: asignaturas.find(asig => asig.Cod_asignatura === fila.martes)?.Nombre_asignatura.toUpperCase() || '-',
      miercoles: asignaturas.find(asig => asig.Cod_asignatura === fila.miercoles)?.Nombre_asignatura.toUpperCase() || '-',
      jueves: asignaturas.find(asig => asig.Cod_asignatura === fila.jueves)?.Nombre_asignatura.toUpperCase() || '-',
      viernes: asignaturas.find(asig => asig.Cod_asignatura === fila.viernes)?.Nombre_asignatura.toUpperCase() || '-',
      sabado: asignaturas.find(asig => asig.Cod_asignatura === fila.sabado)?.Nombre_asignatura.toUpperCase() || '-',
      domingo: asignaturas.find(asig => asig.Cod_asignatura === fila.domingo)?.Nombre_asignatura.toUpperCase() || '-',
    }));

    doc.autoTable({
      startY: 75,
      theme: 'grid', // Utilizar el tema 'grid' para asegurar líneas claras de división
      columns: tableColumn,
      body: tableRows,
      headStyles: {
        fillColor: [0, 102, 51],
        textColor: [255, 255, 255],
        fontSize: 8,
        halign: 'center',
        valign: 'middle',
      },
      bodyStyles: {
        fontSize: 7,
        halign: 'center',
        valign: 'middle',
      },
      alternateRowStyles: {
        fillColor: [240, 248, 255],
      },
      tableWidth: 'auto', // Ajustar el ancho de la tabla automáticamente
      styles: {
        overflow: 'linebreak', // Asegurar que el texto se ajuste dentro de las celdas
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
        <head><title>Reporte de Horarios</title></head>
        <body style="margin:0;">
          <iframe width="100%" height="100%" src="${pdfURL}" frameborder="0"></iframe>
          <div style="position:fixed;top:10px;right:20px;">
            <button style="background-color: #6c757d; color: white; border: none; padding: 10px 15px; border-radius: 5px; cursor: pointer;" 
              onclick="const a = document.createElement('a'); a.href='${pdfURL}'; a.download='Reporte_Horarios.pdf'; a.click();">
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



{/************************************************************************************************************************************/}
  



const generateSeccionesAsignaturasExcel = async () => {
  if (!filteredSeccionesAsignaturas || filteredSeccionesAsignaturas.length === 0) {
    alert('No hay datos para exportar.');
    return;
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Horario');

  // Título, grado y sección
  worksheet.mergeCells('A1:H1');
  worksheet.getCell('A1').value = "SAINT PATRICK'S ACADEMY";
  worksheet.getCell('A1').font = { bold: true, size: 18, color: { argb: '006633' } };
  worksheet.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };

  worksheet.mergeCells('A2:H2');
  worksheet.getCell('A2').value = 'HORARIO';
  worksheet.getCell('A2').font = { bold: true, size: 16, color: { argb: '006633' } };
  worksheet.getCell('A2').alignment = { horizontal: 'center', vertical: 'middle' };

  worksheet.mergeCells('A3:H3');
  worksheet.getCell('A3').value = `GRADO: ${gradoSeleccionado}`;
  worksheet.getCell('A3').font = { bold: true, size: 14 };
  worksheet.getCell('A3').alignment = { horizontal: 'center', vertical: 'middle' };

  worksheet.mergeCells('A4:H4');
  worksheet.getCell('A4').value = `SECCIÓN: ${nombreSeccionSeleccionado}`;
  worksheet.getCell('A4').font = { bold: true, size: 14 };
  worksheet.getCell('A4').alignment = { horizontal: 'center', vertical: 'middle' };

  // Encabezado de la tabla
  const headerRow = worksheet.addRow(['Horario', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']);
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '006633' } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
  });

  // Datos de la tabla
  filteredSeccionesAsignaturas.forEach((fila) => {
    const row = worksheet.addRow([
      `${fila.horario_inicio} - ${fila.horario_fin}`,
      asignaturas.find(asig => asig.Cod_asignatura === fila.lunes)?.Nombre_asignatura.toUpperCase() || '-',
      asignaturas.find(asig => asig.Cod_asignatura === fila.martes)?.Nombre_asignatura.toUpperCase() || '-',
      asignaturas.find(asig => asig.Cod_asignatura === fila.miercoles)?.Nombre_asignatura.toUpperCase() || '-',
      asignaturas.find(asig => asig.Cod_asignatura === fila.jueves)?.Nombre_asignatura.toUpperCase() || '-',
      asignaturas.find(asig => asig.Cod_asignatura === fila.viernes)?.Nombre_asignatura.toUpperCase() || '-',
      asignaturas.find(asig => asig.Cod_asignatura === fila.sabado)?.Nombre_asignatura.toUpperCase() || '-',
      asignaturas.find(asig => asig.Cod_asignatura === fila.domingo)?.Nombre_asignatura.toUpperCase() || '-',
    ]);

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

  // Ajustar el ancho de las columnas
  worksheet.columns.forEach((column, index) => {
    column.width = 20;
  });

  // Crear archivo Excel
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, 'Reporte_Horarios.xlsx');
};


{/************************************************************************************************************************************/}

  
// Primero declaramos la función
const getAsignaturaNombre = (codigo) => {
  const asignatura = asignaturas.find(asignatura => asignatura.Cod_asignatura === codigo);
  return asignatura ? asignatura.Nombre : ''; // Devuelve el nombre de la asignatura o una cadena vacía si no se encuentra
};

// Aplicamos el filtro

const filteredSeccionesAsignaturas = seccionesAsignaturas.filter((fila) => {
  console.log(`Comparando ${fila.cod_secciones} con ${seccionSeleccionada}`);

  // Convertimos ambos valores a números enteros para asegurar una comparación correcta
  return parseInt(fila.cod_secciones) === parseInt(seccionSeleccionada) &&
    (
      (getAsignaturaNombre(fila.lunes) || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (getAsignaturaNombre(fila.martes) || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (getAsignaturaNombre(fila.miercoles) || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (getAsignaturaNombre(fila.jueves) || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (getAsignaturaNombre(fila.viernes) || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (getAsignaturaNombre(fila.sabado) || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (getAsignaturaNombre(fila.domingo) || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
});





  



{/************************************************************************************************************************************/}


  return(
  <CContainer>
<div className="container mt-3">
  {/* Contenedor general */}
  <div className="container mt-3">
    {/* Fila de los botones */}
    <CRow className="align-items-center mb-3">
      {/* Botón "Volver a Secciones" */}
      <CCol xs="12" md="4" className="text-start mb-2 mb-md-0">
        <CButton
          className="d-flex align-items-center gap-1 rounded shadow"
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#4B4B4B")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#656565")}
          style={{
            backgroundColor: "#656565",
            color: "#FFFFFF",
            padding: "10px 16px",
            fontSize: "0.9rem",
            transition: "background-color 0.2s ease, box-shadow 0.3s ease",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
            whiteSpace: "nowrap",
          }}
          onClick={volverAListaSecciones}
        >
          <CIcon icon={cilArrowLeft} /> Volver a Secciones
        </CButton>
      </CCol>

      <CCol xs="12" md="4" className="text-center mb-2 mb-md-0" />

      {/* Botones "Nuevo", "Editar" y "Reporte" */}
      <CCol
        xs="12"
        md="4"
        className="text-end d-flex flex-column flex-md-row justify-content-md-end align-items-md-center gap-2"
      >
        <CButton
          style={{
            backgroundColor: '#4B6251',
            color: 'white',
            padding: "8px 12px",
            fontSize: "0.8rem",
            display: "flex",
            alignItems: "center",
          }}
          className="rounded shadow"
          onClick={handleInsertModalOpen}
        >
          <CIcon icon={cilPlus} style={{ marginRight: "5px" }} /> Nuevo
        </CButton>

        <CButton
          style={{
            backgroundColor: '#FFBF00',
            color: 'black',
            padding: "8px 12px",
            fontSize: "0.8rem",
            display: "flex",
            alignItems: "center",
          }}
          className="rounded shadow"
          onClick={() => handleEditClick(horarios)}
        >
          <CIcon icon={cilPen} style={{ marginRight: "5px" }} /> Editar
        </CButton>

        <CDropdown>
          <CDropdownToggle
            style={{
              backgroundColor: "#2E7D32",
              color: "white",
              padding: "8px 12px",
              fontSize: "0.8rem",
              display: "flex",
              alignItems: "center",
            }}
            className="rounded shadow"
          >
            <CIcon icon={cilDescription} style={{ marginRight: "5px" }} /> Reporte
          </CDropdownToggle>
          <CDropdownMenu>
            <CDropdownItem onClick={() => generateSeccionesAsignaturasPDF(filteredSeccionesAsignaturas)} style={{ color: "#2E7D32", fontWeight: "bold" }}>
              Reporte en PDF
            </CDropdownItem>
            <CDropdownItem onClick={() => generateSeccionesAsignaturasExcel(filteredSeccionesAsignaturas)} style={{ color: "#2E7D32", fontWeight: "bold" }}>
              Reporte en Excel
            </CDropdownItem>
          </CDropdownMenu>
        </CDropdown>
      </CCol>
    </CRow>

    {/* Título y datos del grado y sección */}
    <CRow className="align-items-center mb-3">
      <CCol xs="12" className="text-center">
        <h2 className="fw-bold">Gestión de Asignaturas y Horarios</h2>
      </CCol>
      <CCol xs="12" className="text-center">
        <p className="fw-bold">GRADO: {gradoSeleccionado || 'Grado no disponible'}</p>
        <p className="fw-bold">SECCIÓN: {nombreSeccionSeleccionado || 'Sección no disponible'}</p>
      </CCol>
    </CRow>
  </div>

  {/* Tabla de asignaturas y horarios */}
  <div className="table-container" style={{ maxHeight: '400px', overflowY: 'scroll', marginBottom: '20px' }}>
  <CTable striped bordered hover style={{ borderCollapse: 'collapse' }}>
    <CTableHead>
      <CTableRow style={{ backgroundColor: '#2E7D32 !important', color: 'white !important' }}>
        <CTableHeaderCell style={{ textAlign: "center", border: '2px solid black', fontSize: "15px", fontWeight: "bold" }}>Horario</CTableHeaderCell>
        <CTableHeaderCell style={{ textAlign: "center", border: '2px solid black', fontSize: "15px", fontWeight: "bold" }}>Lunes</CTableHeaderCell>
        <CTableHeaderCell style={{ textAlign: "center", border: '2px solid black', fontSize: "15px", fontWeight: "bold" }}>Martes</CTableHeaderCell>
        <CTableHeaderCell style={{ textAlign: "center", border: '2px solid black', fontSize: "15px", fontWeight: "bold" }}>Miércoles</CTableHeaderCell>
        <CTableHeaderCell style={{ textAlign: "center", border: '2px solid black', fontSize: "15px", fontWeight: "bold" }}>Jueves</CTableHeaderCell>
        <CTableHeaderCell style={{ textAlign: "center", border: '2px solid black', fontSize: "15px", fontWeight: "bold" }}>Viernes</CTableHeaderCell>
        <CTableHeaderCell style={{ textAlign: "center", border: '2px solid black', fontSize: "15px", fontWeight: "bold" }}>Sábado</CTableHeaderCell>
        <CTableHeaderCell style={{ textAlign: "center", border: '2px solid black', fontSize: "15px", fontWeight: "bold" }}>Domingo</CTableHeaderCell>
      </CTableRow>
    </CTableHead>
    <CTableBody>
      {filteredSeccionesAsignaturas.map((fila, rowIndex) => {
        const rowStyle = rowIndex % 2 === 0 
          ? { backgroundColor: "#FFFFFF !important" }  // Blanco
          : { backgroundColor: "#E8F5E9 !important" }; // Verde claro

        return (
          <CTableRow key={fila.Cod_seccion_asignatura} style={rowStyle}>
            <CTableDataCell style={{ textAlign: "center", fontSize: "13px", border: '2px solid black' }}>
              {fila.horario_inicio} - {fila.horario_fin}
            </CTableDataCell>
            {['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'].map((dia) => (
              <CTableDataCell key={dia} style={{ textAlign: "center", fontSize: "12px", border: '2px solid black' }}>
                {asignaturas.find(asig => asig.Cod_asignatura === fila[dia])?.Nombre_asignatura.toUpperCase() || '-'}
              </CTableDataCell>
            ))}
          </CTableRow>
        );
      })}
    </CTableBody>
  </CTable>
</div>



  {/* Pie de página con año dinámico */}
  <div style={{ borderTop: "2px solid black", marginTop: "10px", paddingTop: "5px", textAlign: "center" }}>
    <p className="fw-bold">Gestión Escolar - {new Date().getFullYear()}</p>
  </div>
</div>


      
{/******************************************* MODAL PARA INSERTAR HORARIOS********************************************************************/}
<CModal visible={modalVisible} onClose={() => setModalVisible(false)} size="xl" backdrop="static">
      {dropdownIndex && (
        <div
          style={{
            position: 'absolute',
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            background: 'white',
            border: '1px solid black',
            zIndex: 2000,
            maxHeight: '150px',
            overflowY: 'auto',
            width: '200px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            padding: '10px',
            borderRadius: '4px',
          }}
        >
          {asignaturas.map((asignatura) => (
            <div
              key={asignatura.Cod_asignatura}
              onClick={() => handleSelectAsignatura(dropdownIndex.row, dropdownIndex.dia, asignatura.Nombre_asignatura)}
              style={{ padding: '5px', cursor: 'pointer' }}
            >
              {asignatura.Nombre_asignatura}
            </div>
          ))}
        </div>
      )}
      <CModalHeader>
        <CModalTitle style={{ textAlign: 'center', width: '100%' }}>
          <div>NUEVO HORARIO</div>
          <div>GRADO: {gradoSeleccionado}</div>
          <div>SECCIÓN: {nombreSeccionSeleccionado}</div>
        </CModalTitle>
      </CModalHeader>
      <CModalBody>
        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              textAlign: 'center',
              borderSpacing: '0',
              border: '1px solid black',
              borderCollapse: 'separate',
            }}
          >
            <thead>
              <tr>
                <th style={{ width: '250px', textAlign: 'center', border: '1px solid black', boxSizing: 'border-box' }}>
                  Hora Inicio - Hora Fin
                </th>
                {diasFijos.map((dia) => (
                  <th key={dia} style={{ textAlign: 'center', width: '150px', border: '1px solid black', boxSizing: 'border-box' }}>
                    {dia}
                  </th>
                ))}
                <th style={{ width: '180px', textAlign: 'center', border: '1px solid black', boxSizing: 'border-box' }}>
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {horariosInsert.map((horario, rowIndex) => (
                <tr key={rowIndex}>
                  <td
                    style={{
                      display: 'flex',
                      gap: '5px',
                      justifyContent: 'center',
                      width: '250px',
                      border: '1px solid black',
                      boxSizing: 'border-box',
                    }}
                  >
                    <CFormInput
                      type="time"
                      value={horario.horario_inicio}
                      onChange={(e) => handleChangeInsert(rowIndex, 'horario_inicio', e.target.value)}
                      style={{ width: '45%', minWidth: '80px', border: '1px solid black' }}
                    />
                    <CFormInput
                      type="time"
                      value={horario.horario_fin}
                      onChange={(e) => handleChangeInsert(rowIndex, 'horario_fin', e.target.value)}
                      style={{ width: '45%', minWidth: '80px', border: '1px solid black' }}
                    />
                  </td>
                  {diasFijos.map((dia) => (
                    <td
                      key={dia}
                      style={{
                        textAlign: 'center',
                        border: '1px solid black',
                        boxSizing: 'border-box',
                        position: 'relative',
                      }}
                    >
                      {!horario.dias[dia] ? (
                        <CButton size="sm" color="light" onClick={(e) => toggleDropdownInsert(rowIndex, dia, e)}>
                          <CIcon icon={cilPlus} />
                        </CButton>
                      ) : (
                        <span
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Backspace' || e.key === 'Delete') {
                              borrarAsignatura(rowIndex, dia);
                            }
                          }}
                          style={{ display: 'block', fontSize: '12px', outline: 'none' }}
                        >
                          {horario.dias[dia]}
                        </span>
                      )}
                    </td>
                  ))}
                  <td
                    style={{
                      textAlign: 'center',
                      border: '1px solid black',
                      boxSizing: 'border-box',
                    }}
                  >
                    <CButton size="sm" color="danger" onClick={() => setHorariosInsert(horariosInsert.filter((_, i) => i !== rowIndex))}>
                      <CIcon icon={cilTrash} />
                    </CButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '15px' }}>
          <CButton
            style={{
              backgroundColor: 'white',
              color: 'black',
              border: '2px solid black',
              fontWeight: 'bold',
              fontSize: '16px',
              padding: '10px 15px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
            onClick={handleAddRowInsert}
          >
            <CIcon icon={cilPlus} style={{ fontSize: '18px' }} /> Agregar Nueva Fila
          </CButton>
        </div>
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={handleInsertModalClose}>
          Cancelar
        </CButton>
        <CButton
          style={{ backgroundColor: '#4B6251', color: 'white', borderColor: '#4B6251' }}
          onClick={handleInsertSubmit}
        >
          <CIcon icon={cilSave} /> Guardar
        </CButton>
      </CModalFooter>
    </CModal>

{/*****************************************************FIN MODAL PARA INSERTAR HORARIOS*****************************************************/}


{/**********************************************************MODAL PARA EDITAR HORARIOS************************************************/}
<CModal visible={modalUpdateVisible} onClose={() => setModalUpdateVisible(false)} size="xl" backdrop="static">
  {dropdownIndexUpdate && (
    <div
      style={{
        position: 'absolute',
        top: `${dropdownPositionUpdate.top}px`,
        left: `${dropdownPositionUpdate.left}px`,
        background: 'white',
        border: '1px solid black',
        zIndex: 2000,
        maxHeight: '150px',
        overflowY: 'auto',
        width: '200px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        padding: '10px',
        borderRadius: '4px',
      }}
    >
      {asignaturas.map((asignatura) => (
        <div
          key={asignatura.Cod_asignatura}
          onClick={() => handleUpdateChange(dropdownIndexUpdate.row, dropdownIndexUpdate.dia, asignatura.Cod_asignatura)}
          style={{ padding: '5px', cursor: 'pointer' }}
        >
          {asignatura.Nombre_asignatura}
        </div>
      ))}
    </div>
  )}
  <CModalHeader>
    <CModalTitle style={{ textAlign: 'center', width: '100%' }}>
      <div>EDITAR HORARIO</div>
      <div>GRADO: {gradoSeleccionado}</div>
      <div>SECCIÓN: {nombreSeccionSeleccionado}</div>
    </CModalTitle>
  </CModalHeader>
  <CModalBody>
    <div style={{ overflowX: 'auto' }}>
      <table
        style={{
          width: '100%',
          textAlign: 'center',
          borderSpacing: '0',
          border: '1px solid black',
          borderCollapse: 'separate',
        }}
      >
        <thead>
          <tr>
            <th
              style={{
                width: '250px',
                textAlign: 'center',
                border: '1px solid black',
                boxSizing: 'border-box',
              }}
            >
              Hora Inicio - Hora Fin
            </th>
            {diasFijos.map((dia) => (
              <th
                key={dia}
                style={{
                  textAlign: 'center',
                  width: '150px',
                  border: '1px solid black',
                  boxSizing: 'border-box',
                }}
              >
                {dia}
              </th>
            ))}
            <th
              style={{
                width: '180px',
                textAlign: 'center',
                border: '1px solid black',
                boxSizing: 'border-box',
              }}
            >
              Acciones
            </th>
          </tr>
        </thead>
        <tbody>
          {(Array.isArray(horarioToUpdate) ? horarioToUpdate : []).map((horario, rowIndex) => (
            <tr key={rowIndex}>
              <td
                style={{
                  display: 'flex',
                  gap: '5px',
                  justifyContent: 'center',
                  width: '250px',
                  border: '1px solid black',
                  boxSizing: 'border-box',
                }}
              >
                <CFormInput
                  type="time"
                  value={horario.horario_inicio}
                  onChange={(e) => handleChangeUpdate(rowIndex, 'horario_inicio', e.target.value)}
                  style={{ width: '45%', minWidth: '80px', border: '1px solid black' }}
                />
                <CFormInput
                  type="time"
                  value={horario.horario_fin}
                  onChange={(e) => handleChangeUpdate(rowIndex, 'horario_fin', e.target.value)}
                  style={{ width: '45%', minWidth: '80px', border: '1px solid black' }}
                />
              </td>
              {diasFijos.map((dia) => (
                <td
                  key={dia}
                  style={{
                    textAlign: 'center',
                    border: '1px solid black',
                    boxSizing: 'border-box',
                    position: 'relative',
                  }}
                >
                  {!horario.dias[dia] ? (
                    <CButton size="sm" color="light" onClick={(e) => toggleDropdownUpdate(rowIndex, dia, e)}>
                      <CIcon icon={cilPlus} />
                    </CButton>
                  ) : (
                    <span
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Backspace' || e.key === 'Delete') {
                          handleUpdateChange(rowIndex, dia, null);
                        }
                      }}
                      style={{ display: 'block', fontSize: '12px', outline: 'none' }}
                    >
                      {asignaturas.find(asig => asig.Cod_asignatura === horario.dias[dia])?.Nombre_asignatura.toUpperCase() || '-'}
                    </span>
                  )}
                </td>
              ))}
              <td
                style={{
                  textAlign: 'center',
                  border: '1px solid black',
                  boxSizing: 'border-box',
                }}
              >
                <CButton size="sm" color="danger" onClick={() => handleDeleteRow(rowIndex, horario.Cod_seccion_asignatura)}>
                  <CIcon icon={cilTrash} />
                </CButton>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '15px' }}>

    </div>
  </CModalBody>
  <CModalFooter>
    <CButton color="secondary" onClick={handleUpdateModalClose}>Cancelar</CButton>
    <CButton style={{ backgroundColor: '#4B6251', color: 'white', borderColor: '#4B6251' }} onClick={handleUpdateSubmit}>
      <CIcon icon={cilSave} /> Editar
    </CButton>
  </CModalFooter>
</CModal>


{/*****************************************************FIN MODAL PARA EDITAR HORARIOS****************************************************/}



{/* Modal para actualizar una nueva sección-asignatura */}

      </CContainer>
      );
}
export default ListaSecciones_Asignaturas;