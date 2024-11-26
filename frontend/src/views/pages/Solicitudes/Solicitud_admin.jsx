// Path: src/views/pages/solicitud/Solicitud.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { cilPen, cilPlus, cilSave, cilFile, cilSearch, cilWarning, cilCheckCircle, cilXCircle } from '@coreui/icons';
import CIcon from '@coreui/icons-react';
import {
  CButton,
  CContainer,
  CRow,
  CCol,
  CSpinner,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CCard,
  CCardBody,
  CCardHeader,
  CAlert,
  CBadge,
  CForm,
  CFormInput,
  CFormLabel,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CInputGroup,
  CInputGroupText,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
} from '@coreui/react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import logo from 'src/assets/brand/logo_saint_patrick.png';
import usePermission from '../../../../context/usePermission';
import AccessDenied from "../AccessDenied/AccessDenied"


const Solicitud = () => {
  const { canSelect, canDelete, canInsert, canUpdate } = usePermission('Solicitud_admin');

  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCita, setSelectedCita] = useState(null);
  const [formModalVisible, setFormModalVisible] = useState(false);
  const [allCitasModalVisible, setAllCitasModalVisible] = useState(false);
  const [acceptModalVisible, setAcceptModalVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCitas, setFilteredCitas] = useState([]);
  const [formValues, setFormValues] = useState({
    title: '',
    description: '',
    personaRequerida: '',
    fecha: '',
    horaInicio: '',
    horaFin: '',
    Cod_persona:'',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSolicitudes();
  }, []);

  const fetchSolicitudes = async () => {
    setLoading(true);
    try {
        const response = await fetch('http://localhost:4000/api/Solicitud_admin/solicitudess');
        if (!response.ok) throw new Error('Error al obtener las solicitudes');
        const data = await response.json();

        const solicitudesData = (Array.isArray(data) ? data : []).map((solicitud) => ({
            id: solicitud.Cod_solicitud || '',
            title: solicitud.Nombre_solicitud || 'SIN TÍTULO',
            start: solicitud.Fecha_solicitud || '',
            end: solicitud.Fecha_solicitud || '',
            description: solicitud.Asunto || 'SIN ASUNTO',
            personaRequerida: solicitud.Persona_requerida || 'DESCONOCIDO',
            horaInicio: solicitud.Hora_Inicio ? solicitud.Hora_Inicio.slice(0, 5) : '00:00',
            horaFin: solicitud.Hora_Fin ? solicitud.Hora_Fin.slice(0, 5) : '00:00',
            estado: solicitud.Estado || 'Pendiente', // Map Estado here
            important: solicitud.Importante === 1,
            Cod_persona: solicitud.Cod_persona || '',
        }));
        setSolicitudes(solicitudesData);
        setFilteredCitas(solicitudesData);
    } catch (error) {
        setError(error.message);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: `No se pudieron cargar las solicitudes. ${error.message}`,
            confirmButtonColor: '#6C8E58',
        });
    } finally {
        setLoading(false);
    }
};

 

const getColorByEstado = (estado) => {
  switch (estado) {
    case 'Pendiente':
      return 'rgba(255, 204, 102, 0.8)'; // Soft amber
    case 'Finalizada':
      return 'rgba(102, 187, 106, 0.8)'; // Calm green
    case 'Cancelada':
      return 'rgba(239, 83, 80, 0.8)'; // Soft coral red
    case 'Activo':
      return 'rgba(41, 121, 255, 0.9)'; // Highlighted blue for active
    default:
      return 'rgba(158, 158, 158, 0.8)'; // Neutral gray
  }
};

const getIconByEstado = (estado) => {
  switch (estado) {
    case 'Pendiente':
      return cilWarning; // Warning icon for pending
    case 'Finalizada':
      return cilCheckCircle; // Check circle for finalized
    case 'Cancelada':
      return cilXCircle; // X circle for canceled
    case 'Activo':
      return cilCheckCircle; // Check circle for active
    default:
      return cilWarning; // Default icon for unknown states
  }
};



  
  const handleValidatedInputChange = (e) => {
    const { name, value } = e.target;
  
    // Configuración de límites por campo
    const maxLengths = {
      title: 50, // Máximo de 50 caracteres para el título
      description: 200, // Máximo de 200 caracteres para la descripción
      personaRequerida: 100, // Máximo de 100 caracteres para la persona requerida
    };
  
    // Sanitizar el valor: eliminar números, caracteres especiales y limitar a dos letras consecutivas iguales
    const sanitizedValue = value
      .replace(/[0-9]/g, '') // Elimina números
      .replace(/[^A-Z\s]/gi, '') // Elimina caracteres especiales, excepto letras y espacios
      .toUpperCase() // Convierte todo a mayúsculas
      .replace(/([A-Z])\1{2,}/g, '$1$1'); // Limita a dos letras consecutivas iguales
  
    // Verificar si se excede la longitud máxima permitida
    if (sanitizedValue.length > maxLengths[name]) {
      Swal.fire({
        icon: 'warning',
        title: 'Advertencia',
        text: `El campo ${name} no puede exceder los ${maxLengths[name]} caracteres.`,
        confirmButtonColor: '#6C8E58',
      });
      return;
    }
  
    // Actualizar los valores del formulario con el valor validado
    setFormValues((prevValues) => ({
      ...prevValues,
      [name]: sanitizedValue,
    }));
  };
  const exportarCitaAPDF = async (selectedCita) => {
    if (!selectedCita) {
      console.warn('No hay cita seleccionada para exportar.');
      return;
    }
  
    const doc = new jsPDF('landscape'); // Orientación horizontal
    const img = new Image();
    img.src = logo;
  
    img.onload = async () => {
      // Cabecera con logo e información institucional
      doc.addImage(img, 'PNG', 10, 10, 30, 30);
      doc.setFontSize(18);
      doc.setTextColor(0, 102, 51);
      doc.text("SAINT PATRICK'S ACADEMY", doc.internal.pageSize.width / 2, 20, { align: 'center' });
      doc.setFontSize(14);
      doc.text('Detalles de la Cita', doc.internal.pageSize.width / 2, 30, { align: 'center' });
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text('Casa Club del periodista, Colonia del Periodista', doc.internal.pageSize.width / 2, 40, { align: 'center' });
      doc.text('Teléfono: (504) 2234-8871', doc.internal.pageSize.width / 2, 45, { align: 'center' });
      doc.text('Correo: info@saintpatrickacademy.edu', doc.internal.pageSize.width / 2, 50, { align: 'center' });
      doc.setLineWidth(0.5);
      doc.setDrawColor(0, 102, 51);
      doc.line(10, 55, doc.internal.pageSize.width - 10, 55);
  
      // Obtener detalles adicionales de la cita seleccionada
      let citaDetails = { ...selectedCita };
      try {
        const response = await fetch(
          `http://localhost:4000/api/Solicitud_admin/solicitudes-persona/${selectedCita.id}`
        );
        if (!response.ok) {
          throw new Error('Error al obtener detalles de la solicitud.');
        }
        const detailedData = await response.json();
        citaDetails = {
          ...citaDetails,
          Persona_Nombre: detailedData.Persona_Nombre || 'N/A',
          Persona_Apellido: detailedData.Persona_Apellido || '',
          Persona_Correo: detailedData.Persona_Correo || 'Correo no disponible',
        };
      } catch (error) {
        console.error('Error fetching details for selected cita:', error);
      }
  
      // Generar la tabla con los datos de la cita seleccionada
      doc.autoTable({
        startY: 60,
        head: [
          ['Campo', 'Valor'],
        ],
        body: [
          ['Título', citaDetails.title || 'Título no disponible'],
          ['Asunto', citaDetails.description || 'Sin descripción'],
          ['Persona Requerida', citaDetails.personaRequerida || 'No especificada'],
          ['Creador de la Cita', `${citaDetails.Persona_Nombre || 'Nombre no disponible'} ${citaDetails.Persona_Apellido || ''}`.trim()],
          ['Correo Electrónico', citaDetails.Persona_Correo || 'Correo no disponible'],
          ['Fecha', citaDetails.start || 'Fecha no disponible'],
          ['Hora Inicio', citaDetails.horaInicio || 'Hora no disponible'],
          ['Hora Fin', citaDetails.horaFin || 'Hora no disponible'],
          ['Estado', citaDetails.estado || 'Estado no disponible'],
        ],
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
  
      // Pie de página con fecha de generación
      const date = new Date().toLocaleDateString();
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Fecha de generación: ${date}`, 10, doc.internal.pageSize.height - 10);
  
      // Abrir el PDF en una nueva pestaña
      const pdfBlob = doc.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      window.open(pdfUrl, '_blank');
    };
  
    img.onerror = () => {
      console.warn('No se pudo cargar el logo. El PDF se generará sin el logo.');
    };
  };
  


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    const filtered = solicitudes.filter((cita) =>
      cita.title.toLowerCase().includes(value) || cita.start.includes(value)
    );
    setFilteredCitas(filtered);
  };

  const limpiarBusqueda = () => {
    setSearchTerm('');
    setFilteredCitas(solicitudes);
  };

  const handleEventClick = async (info) => {
    const citaId = parseInt(info.event.id, 10); // ID del evento
    const citaSeleccionada = solicitudes.find((cita) => cita.id === citaId);
  
    if (citaSeleccionada.estado === 'Pendiente') {
      try {
        const response = await fetch(`http://localhost:4000/api/Solicitud_admin/solicitudes-persona/${citaId}`);
        if (!response.ok) throw new Error('Error al obtener detalles de la solicitud.');
  
        const detailedData = await response.json();
        setSelectedCita({
          ...citaSeleccionada, // Información básica de la cita
          ...detailedData, // Información detallada del creador
        });
  
        setAcceptModalVisible(true); // Mostrar modal de aceptar cita
      } catch (error) {
        console.error('Error al cargar los detalles de la cita:', error.message);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: `No se pudieron cargar los detalles de la cita. ${error.message}`,
          confirmButtonColor: '#6C8E58',
        });
      }
    } else {
      try {
        const citaData = await fetchSolicitudConPersona(citaId);
        setSelectedCita({
          ...citaSeleccionada,
          ...citaData,
        });
        setModalVisible(true);
      } catch (error) {
        console.error('Error al cargar los detalles de la cita:', error.message);
      }
    }
  };
  
  
  const handleEventDrop = async (info) => {
    const citaId = parseInt(info.event.id, 10); // ID del evento
    const cita = solicitudes.find((c) => c.id === citaId); // Buscar la cita en el estado
  
    if (!cita) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se encontró la cita para actualizar.',
        confirmButtonColor: '#6C8E58',
      });
      return info.revert(); // Revertir si no encuentra la cita
    }
  
    // Prevenir cambio de fecha para citas finalizadas
    if (cita.estado === 'Finalizada') {
      Swal.fire({
        icon: 'warning',
        title: 'Advertencia',
        text: 'No puedes cambiar la fecha de una cita que ya está finalizada.',
        confirmButtonColor: '#6C8E58',
      });
      return info.revert(); // Revertir el movimiento
    }
  
    const newDate = new Date(info.event.startStr); // Nueva fecha seleccionada
    const today = new Date(); // Fecha actual sin horas, minutos y segundos
    today.setHours(0, 0, 0, 0);
  
    // Validar que la nueva fecha no sea en el pasado
    if (newDate < today) {
      Swal.fire({
        icon: 'warning',
        title: 'Advertencia',
        text: 'No puedes mover una cita a una fecha pasada.',
        confirmButtonColor: '#6C8E58',
      });
      return info.revert(); // Revertir el movimiento
    }
  
    // Si pasa las validaciones, proceder a actualizar la cita
    Swal.fire({
      title: 'Confirmación',
      text: '¿Deseas cambiar la fecha de esta cita?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, cambiar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#4B6251',
      cancelButtonColor: '#6C8E58',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const requestData = {
            Cod_persona: cita.Cod_persona,
            Nombre_solicitud: cita.title || 'SIN TÍTULO',
            Fecha_solicitud: newDate.toISOString().split('T')[0], // Formatear nueva fecha
            Hora_Inicio: cita.horaInicio,
            Hora_Fin: cita.horaFin,
            Asunto: cita.description || 'SIN ASUNTO',
            Persona_requerida: cita.personaRequerida || 'DESCONOCIDO',
            Estado: cita.estado, // Mantener el estado actual
          };
  
          const response = await fetch(`http://localhost:4000/api/Solicitud_admin/solicitudes/${citaId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestData),
          });
  
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al actualizar la fecha de la cita.');
          }
  
          Swal.fire({
            icon: 'success',
            title: 'Actualizado',
            text: 'La fecha de la cita se actualizó con éxito.',
            confirmButtonColor: '#4B6251',
          });
  
          await fetchSolicitudes(); // Recargar las citas después de actualizar
        } catch (error) {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: `No se pudo actualizar la fecha. ${error.message}`,
            confirmButtonColor: '#6C8E58',
          });
          info.revert(); // Revertir si hay error
        }
      } else {
        info.revert(); // Revertir si el usuario cancela
      }
    });
  };
  
  
// Nuevo fetch para obtener la cita con la persona creadora
const fetchSolicitudConPersona = async (Cod_solicitud) => {
  try {
    const response = await fetch(`http://localhost:4000/api/Solicitud_admin/solicitudes-persona/${Cod_solicitud}`);
    if (!response.ok) {
      if (response.status === 404) throw new Error('Solicitud no encontrada.');
      throw new Error('Error al obtener la solicitud con persona.');
    }
    const data = await response.json();

    // Formatear el nombre completo (opcional)
    const fullName = `${data.Persona_Nombre} ${data.Persona_Apellido}`;

    // Agregar el nombre completo al objeto de respuesta
    return {
      ...data,
      Persona_NombreCompleto: fullName, // Campo adicional con el nombre completo
    };
  } catch (error) {
    console.error('Error en fetchSolicitudConPersona:', error.message);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: `No se pudo obtener la cita. ${error.message}`,
      confirmButtonColor: '#6C8E58',
    });
    throw error;
  }
};



  const handleDateSelect = (selectInfo) => {
    setFormValues((prevValues) => ({
      ...prevValues,
      fecha: selectInfo.startStr,
    }));
    setFormModalVisible(true);
  };

  const handleNuevaCita = () => {
    setFormValues({
      title: '',
      description: '',
      personaRequerida: '',
      fecha: '',
      horaInicio: '',
      horaFin: '',
      Cod_persona: '',
    });
    setSelectedCita(null);
    setFormModalVisible(true);
  };
  const handleOpenAcceptModal = (cita) => {
    setSelectedCita(cita); // Selecciona la cita que se quiere aceptar
    setAcceptModalVisible(true); // Muestra el modal
  };
  
  const handleAcceptCita = async () => {
    try {
      const requestData = {
        Cod_persona: selectedCita.Cod_persona,
        Nombre_solicitud: selectedCita.title,
        Fecha_solicitud: selectedCita.start,
        Hora_Inicio: selectedCita.horaInicio,
        Hora_Fin: selectedCita.horaFin,
        Asunto: selectedCita.description,
        Persona_requerida: selectedCita.personaRequerida,
        estado: 'Activo', // Cambiar el estado a 'Activo'
      };
  
      const response = await fetch(
        `http://localhost:4000/api/Solicitud_admin/solicitudes/${selectedCita.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestData),
        }
      );
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al aceptar la cita.');
      }
  
      Swal.fire({
        icon: 'success',
        title: 'Aceptada',
        text: 'La cita ha sido aceptada y está ahora activa.',
        confirmButtonColor: '#4B6251',
      });
  
      await fetchSolicitudes(); // Recargar solicitudes
      setAcceptModalVisible(false); // Cerrar modal
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: `No se pudo aceptar la cita. ${error.message}`,
        confirmButtonColor: '#6C8E58',
      });
    }
  };
  

  const handleEditarCita = () => {
    if (selectedCita.estado === 'Finalizada') {
      Swal.fire({
        icon: 'warning',
        title: 'Advertencia',
        text: 'No puedes editar esta cita si ya está finalizada.',
        confirmButtonColor: '#6C8E58',
      });
      return;
    }
  
    setFormValues({
      title: selectedCita.title,
      description: selectedCita.description,
      personaRequerida: selectedCita.personaRequerida,
      fecha: selectedCita.start,
      horaInicio: selectedCita.horaInicio,
      horaFin: selectedCita.horaFin,
      estado: selectedCita.estado,
    });
    setModalVisible(false);
    setFormModalVisible(true);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const { title, description, personaRequerida, fecha, horaInicio, horaFin } = formValues;
  
    // Validación de campos obligatorios
    if (!title || !description || !personaRequerida || !fecha || !horaInicio || !horaFin) {
      Swal.fire({
        icon: 'warning',
        title: 'Advertencia',
        text: 'Todos los campos son obligatorios.',
        confirmButtonColor: '#6C8E58',
      });
      return;
    }
  
    const now = new Date();
    const selectedDate = new Date(fecha);
  
    // Validar que la fecha seleccionada no sea anterior a la actual
    if (selectedDate < now.setHours(0, 0, 0, 0)) {
      Swal.fire({
        icon: 'warning',
        title: 'Advertencia',
        text: 'No puedes editar citas para fechas pasadas.',
        confirmButtonColor: '#6C8E58',
      });
      return;
    }
  
    // Validar que la hora de inicio y fin no sean en el pasado si la fecha es hoy
    const [horaInicioHoras, minutoInicio] = horaInicio.split(':').map(Number);
    const [horaFinHoras, minutoFin] = horaFin.split(':').map(Number);
  
    if (
      selectedDate.toDateString() === new Date().toDateString() &&
      (horaInicio <= now.toTimeString().slice(0, 5) || horaFin <= now.toTimeString().slice(0, 5))
    ) {
      Swal.fire({
        icon: 'warning',
        title: 'Advertencia',
        text: 'No puedes programar citas en horas pasadas para hoy.',
        confirmButtonColor: '#6C8E58',
      });
      return;
    }
  
    // Validar que la hora de fin sea mayor que la hora de inicio
    if (horaFinHoras < horaInicioHoras || (horaFinHoras === horaInicioHoras && minutoFin <= minutoInicio)) {
      Swal.fire({
        icon: 'warning',
        title: 'Advertencia',
        text: 'La hora de fin debe ser mayor que la hora de inicio.',
        confirmButtonColor: '#6C8E58',
      });
      return;
    }
  
    setIsSubmitting(true);
  
    try {
      const requestData = {
        Cod_persona: selectedCita ? selectedCita.Cod_persona : formValues.Cod_persona || '1',
        Nombre_solicitud: formValues.title || 'SIN TÍTULO',
        Fecha_solicitud: formValues.fecha || '1899-11-30',
        Hora_Inicio: formValues.horaInicio,
        Hora_Fin: formValues.horaFin,
        Asunto: formValues.description || 'SIN ASUNTO',
        Persona_requerida: formValues.personaRequerida || 'DESCONOCIDO',
        estado: formValues.estado || 'Pendiente', // Mantener el estado actual
      };
  
      const response = await fetch(
        selectedCita
          ? `http://localhost:4000/api/Solicitud_admin/solicitudes/${selectedCita.id}`
          : 'http://localhost:4000/api/Solicitud_admin/solicitudes',
        {
          method: selectedCita ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestData),
        }
      );
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al procesar la solicitud.');
      }
  
      Swal.fire({
        icon: 'success',
        title: selectedCita ? 'Actualizado' : 'Creado',
        text: selectedCita
          ? 'La cita fue actualizada correctamente.'
          : 'La cita fue creada correctamente.',
        confirmButtonColor: '#4B6251',
      });
  
      setFormModalVisible(false);
      await fetchSolicitudes(); // Recargar las solicitudes después de guardar
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message,
        confirmButtonColor: '#6C8E58',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  

  const handleVerTodasCitas = () => {
    setAllCitasModalVisible(true);
  };

  const handleModalClose = () => {
    if (isSubmitting) return;
    setFormModalVisible(false);
    setAllCitasModalVisible(false);
  };

  const exportarAPDF = async () => {
    const doc = new jsPDF('landscape'); // Orientación landscape
  
    if (solicitudes.length === 0) {
      console.warn('No hay datos de citas para exportar.');
      return;
    }
  
    const img = new Image();
    img.src = logo;
  
    img.onload = async () => {
      // Cabecera con logo y detalles de institución
      doc.addImage(img, 'PNG', 10, 10, 30, 30);
      doc.setFontSize(18);
      doc.setTextColor(0, 102, 51);
      doc.text("SAINT PATRICK'S ACADEMY", doc.internal.pageSize.width / 2, 20, { align: 'center' });
      doc.setFontSize(14);
      doc.text('Reporte Detallado de Citas', doc.internal.pageSize.width / 2, 30, { align: 'center' });
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text('Casa Club del periodista, Colonia del Periodista', doc.internal.pageSize.width / 2, 40, { align: 'center' });
      doc.text('Teléfono: (504) 2234-8871', doc.internal.pageSize.width / 2, 45, { align: 'center' });
      doc.text('Correo: info@saintpatrickacademy.edu', doc.internal.pageSize.width / 2, 50, { align: 'center' });
      doc.setLineWidth(0.5);
      doc.setDrawColor(0, 102, 51);
      doc.line(10, 55, doc.internal.pageSize.width - 10, 55);
  
      // Obtener datos detallados para cada solicitud
      const updatedSolicitudes = await Promise.all(
        solicitudes.map(async (cita) => {
          try {
            const response = await fetch(`http://localhost:4000/api/Solicitud_admin/solicitudes-persona/${cita.id}`);
            if (!response.ok) {
              throw new Error('Error al obtener detalles de la solicitud.');
            }
            const detailedData = await response.json();
            return {
              ...cita,
              Persona_Nombre: detailedData.Persona_Nombre || 'N/A',
              Persona_Apellido: detailedData.Persona_Apellido || '',
              Persona_Correo: detailedData.Persona_Correo || 'Correo no disponible',
            };
          } catch (error) {
            console.error('Error fetching details:', error);
            return cita; // Si ocurre un error, retorna los datos originales
          }
        })
      );
  
      // Generar la tabla con los datos completos
      doc.autoTable({
        startY: 60,
        head: [
          [
            'Título',
            'Asunto',
            'Persona Requerida',
            'Creador de la Cita',
            'Correo Electrónico',
            'Fecha',
            'Hora Inicio',
            'Hora Fin',
            'Estado',
          ],
        ],
        body: updatedSolicitudes.map((cita) => [
          cita.title || 'Título no disponible',
          cita.description || 'Sin descripción',
          cita.personaRequerida || 'No especificada',
          `${cita.Persona_Nombre || 'Nombre no disponible'} ${cita.Persona_Apellido || ''}`.trim(),
          cita.Persona_Correo || 'Correo no disponible',
          cita.start || 'Fecha no disponible',
          cita.horaInicio || 'Hora no disponible',
          cita.horaFin || 'Hora no disponible',
          cita.estado || 'Estado no disponible',
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
  
      // Pie de página con fecha de generación
      const date = new Date().toLocaleDateString();
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Fecha de generación: ${date}`, 10, doc.internal.pageSize.height - 10);
  
      // Abrir el PDF en una nueva pestaña
      const pdfBlob = doc.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      window.open(pdfUrl, '_blank');
    };
  
    img.onerror = () => {
      console.warn('No se pudo cargar el logo. El PDF se generará sin el logo.');
    };
  };
  
  
  
  const exportarAExcel = () => {
    const hoja = XLSX.utils.json_to_sheet(
      solicitudes.map((cita, index) => ({
        '#': index + 1,
        'Título': cita.title.toUpperCase(),
        'Asunto': cita.description.toUpperCase(),
        'Persona Requerida': cita.personaRequerida.toUpperCase(),
        'Creador de la Cita': `${cita.Persona_Nombre?.toUpperCase() || 'N/A'} ${cita.Persona_Apellido?.toUpperCase() || ''}`,
        'Correo Electrónico': cita.Persona_Correo || 'Correo no disponible',
        'Fecha': cita.start,
        'Hora Inicio': cita.horaInicio,
        'Hora Fin': cita.horaFin,
        'Estado': cita.estado,
      }))
    );
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, 'Reporte de Citas');
    XLSX.writeFile(libro, 'Reporte_Citas.xlsx');
  };
  

     // Verificar permisos
 if (!canSelect) {
  return <AccessDenied />;
}





  return (
    <CContainer fluid style={{ backgroundColor: '#F8F9FA', padding: '20px' }}>
      <CRow className="mb-4">
        <CCol className="text-center">
          <h1 style={{ color: '#6C757D', fontWeight: 'bold', fontSize: '2.5rem' }}>Gestión de Citas</h1>
        </CCol>
      </CRow>

      <CRow className="mb-3 align-items-center">
        <CCol md={6}>
          <CInputGroup>
            <CInputGroupText style={{ backgroundColor: '#4B6251', color: 'white' }}>
              <CIcon icon={cilSearch} />
            </CInputGroupText>
            <CFormInput
              placeholder="Buscar por título o fecha"
              value={searchTerm}
              onChange={handleSearch}
              style={{ borderColor: '#4B6251' }}
            />
            <CButton
              color="secondary"
              onClick={limpiarBusqueda}
              style={{ backgroundColor: '#6C8E58', color: 'white', borderColor: '#6C8E58' }}
            >
              Limpiar
            </CButton>
          </CInputGroup>
        </CCol>
        <CCol md={3}>
          <span style={{ color: '#6C757D' }}>{`Citas encontradas: ${filteredCitas.length}`}</span>
        </CCol>
        <CCol md={3} className="text-end">

        {canInsert &&  (
          <CButton
            color="success"
            onClick={handleNuevaCita}
            style={{ backgroundColor: '#4B6251', color: 'white', borderColor: '#4B6251' }}
          >
            <CIcon icon={cilPlus} /> Nueva Cita
          </CButton>
        )}

          <CDropdown className="d-inline ms-2">
            <CDropdownToggle style={{ backgroundColor: '#6C8E58', color: 'white' }}>
              <CIcon icon={cilFile} /> Reporte
            </CDropdownToggle>
            <CDropdownMenu>
              <CDropdownItem onClick={exportarAPDF}>Exportar a PDF</CDropdownItem>
              <CDropdownItem onClick={exportarAExcel}>Exportar a Excel</CDropdownItem>
            </CDropdownMenu>
          </CDropdown>
        </CCol>
      </CRow>

      {loading ? (
        <CSpinner color="secondary" />
      ) : error ? (
        <CAlert color="danger">{error}</CAlert>
      ) : (
        <div
          className="calendar-container"
          style={{
            maxWidth: '1500px',
            margin: '0 auto',
            boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
            borderRadius: '8px',
            backgroundColor: '#FFFFFF',
            padding: '15px',
          }}
        >
          <FullCalendar
  plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
  initialView="dayGridMonth"
  locale={esLocale}
  headerToolbar={{
    left: 'prev today next',
    center: 'title',
    right: 'dayGridMonth,timeGridDay',
  }}
  events={filteredCitas.map((cita) => ({
    ...cita,
    id: cita.id.toString(),
    backgroundColor: getColorByEstado(cita.estado),
    borderColor: '#4B6251',
    textColor: '#000000',
    extendedProps: { 
      horaInicio: cita.horaInicio, 
      horaFin: cita.horaFin,
      icon: getIconByEstado(cita.estado)
    },
  }))}
  eventContent={(eventInfo) => {
    // Evaluar la vista activa
    if (eventInfo.view.type === 'timeGridDay') {
      // Mostrar título con hora de inicio y fin en la vista diaria
      return (
        <span>
          <strong>{eventInfo.event.title}</strong>
          <br />
          {eventInfo.event.extendedProps.horaInicio} - {eventInfo.event.extendedProps.horaFin}
        </span>
      );
    }
    // Mostrar solo el título en otras vistas
    return <span>{eventInfo.event.title}</span>;
  }}
  eventClick={handleEventClick}
  dateClick={handleDateSelect}
  eventDrop={handleEventDrop}
  editable={true}
  height="auto"
  contentHeight="auto"
  titleFormat={{ year: 'numeric', month: 'long' }}
  dayHeaderClassNames="fc-day-header"
  dayHeaderContent={(args) => (
    <span style={{ color: '#4B6251', fontWeight: 'bold' }}>{args.text}</span>
  )}
/>
        </div>
      )}

      <CModal visible={modalVisible} onClose={() => setModalVisible(false)} backdrop="static">
        <CModalHeader closeButton style={{ backgroundColor: '#6C8E58', color: 'white' }}>
          <CModalTitle>Detalles de la Cita</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {selectedCita && (
            <CCard>
              <CCardHeader>
                <strong>{selectedCita.title}</strong>
                {selectedCita.important && (
                  <CBadge color="danger" className="ms-2">
                    Importante
                  </CBadge>
                )}
              </CCardHeader>
              <CCardBody>
                <p><strong>Asunto:</strong> {selectedCita.description}</p>
                <p><strong>Persona Requerida:</strong> {selectedCita.personaRequerida}</p>
                <p><strong>Fecha:</strong> {selectedCita.start}</p>
                <p><strong>Hora de Inicio:</strong> {selectedCita.horaInicio}</p>
                <p><strong>Hora de Fin:</strong> {selectedCita.horaFin}</p>
                <p><strong>Estado:</strong> {selectedCita.estado}</p>


                {canUpdate &&  (
                <CButton
                  color="warning"
                  onClick={handleEditarCita}
                  style={{ backgroundColor: '#6C8E58', color: 'white' }}
                >
                  <CIcon icon={cilPen} /> Editar
                </CButton>
                )}
                <CButton
                  color="secondary"
                  className="ms-2"
                  onClick={() => exportarCitaAPDF(selectedCita)}
                  style={{ backgroundColor: '#6C8E58', color: 'white', borderColor: '#6C8E58' }}
                >
                  <CIcon icon={cilFile} /> Exportar PDF
                </CButton>
              </CCardBody>
            </CCard>
          )}
        </CModalBody>
      </CModal>
      <CModal

  visible={acceptModalVisible}
  onClose={() => setAcceptModalVisible(false)}
  backdrop="static"
>
  <CModalHeader closeButton style={{ backgroundColor: '#4B6251', color: 'white' }}>
    <CModalTitle>Aceptar Cita</CModalTitle>
  </CModalHeader>
  <CModalBody>
    {selectedCita ? (
      <div>
        <p><strong>¿Estás seguro de que deseas aceptar la cita?</strong></p>
        <ul>
          <li><strong>Nombre de la cita:</strong> {selectedCita.title || 'No disponible'}</li>
          <li><strong>Persona que la creó:</strong> {`${selectedCita.Persona_Nombre || 'No disponible'} ${selectedCita.Persona_Apellido || ''}`}</li>
          <li><strong>Correo electrónico:</strong> {selectedCita.Persona_Correo || 'No disponible'}</li>
          <li><strong>Fecha:</strong> {selectedCita.start || 'No disponible'}</li>
          <li><strong>Hora de inicio:</strong> {selectedCita.horaInicio || 'No disponible'}</li>
          <li><strong>Hora de fin:</strong> {selectedCita.horaFin || 'No disponible'}</li>
          <li><strong>Asunto:</strong> {selectedCita.description || 'No disponible'}</li>
        </ul>
      </div>
    ) : (
      <p>No se encontraron detalles para esta cita.</p>
    )}
  </CModalBody>
  <CModalFooter>
    <CButton
      color="success"
      onClick={handleAcceptCita}
      style={{ backgroundColor: '#4B6251', color: 'white' }}
    >
      Aceptar
    </CButton>
    <CButton
      color="secondary"
      onClick={() => setAcceptModalVisible(false)}
    >
      Cancelar
    </CButton>
  </CModalFooter>
</CModal>

      

      <CModal visible={formModalVisible} onClose={handleModalClose} backdrop="static">
  <CModalHeader closeButton style={{ backgroundColor: '#4B6251', color: 'white' }}>
    <CModalTitle>{selectedCita ? 'Editar Cita' : 'Crear Nueva Cita'}</CModalTitle>
  </CModalHeader>
  <CModalBody>
    <CForm onSubmit={handleSubmit}>
      <CCard className="p-3" style={{ border: '1px solid #4B6251' }}>
        <CRow className="mb-3">
          <CCol md={12}>
            <CFormLabel>Nombre de la Cita</CFormLabel>
            <CFormInput
              type="text"
              name="title"
              value={formValues.title}
              onChange={handleValidatedInputChange} // Validación incluida
              placeholder="Ejemplo: REUNIÓN DE PROYECTO"
              required
              style={{ borderColor: '#6C8E58' }}
            />
          </CCol>
        </CRow>
        <CRow className="mb-3">
          <CCol md={12}>
            <CFormLabel>Asunto</CFormLabel>
            <CFormInput
              type="text"
              name="description"
              value={formValues.description}
              onChange={handleValidatedInputChange} // Validación incluida
              placeholder="Ejemplo: DISCUTIR AVANCES DEL PROYECTO"
              required
              style={{ borderColor: '#6C8E58' }}
            />
          </CCol>
        </CRow>
        <CRow className="mb-3">
          <CCol md={12}>
            <CFormLabel>Persona Requerida</CFormLabel>
            <CFormInput
              type="text"
              name="personaRequerida"
              value={formValues.personaRequerida}
              onChange={handleValidatedInputChange} // Validación incluida
              placeholder="Ejemplo: JUAN PÉREZ"
              required
              style={{ borderColor: '#6C8E58' }}
            />
          </CCol>
        </CRow>
        <CRow className="mb-3">
          <CCol md={4}>
            <CFormLabel>Fecha</CFormLabel>
            <CFormInput
              type="date"
              name="fecha"
              value={formValues.fecha}
              onChange={handleInputChange} // Sin validación especial
              required
              style={{ borderColor: '#6C8E58' }}
            />
          </CCol>
          <CCol md={4}>
            <CFormLabel>Hora de Inicio</CFormLabel>
            <CFormInput
              type="time"
              name="horaInicio"
              value={formValues.horaInicio}
              onChange={handleInputChange} // Sin validación especial
              required
              style={{ borderColor: '#6C8E58' }}
            />
          </CCol>
          <CCol md={4}>
            <CFormLabel>Hora de Fin</CFormLabel>
            <CFormInput
              type="time"
              name="horaFin"
              value={formValues.horaFin}
              onChange={handleInputChange} // Sin validación especial
              required
              style={{ borderColor: '#6C8E58' }}
            />
          </CCol>
        </CRow>
        

        {selectedCita && (
  <CRow className="mb-3">
  <CCol md={12}>
      <CFormLabel>Estado</CFormLabel>
      <div className="form-check form-switch">
          <input
              className="form-check-input"
              type="checkbox"
              id="estadoSwitch"
              checked={formValues.estado === "Cancelada"}
              onChange={() =>
                  setFormValues((prevValues) => ({
                      ...prevValues,
                      estado: prevValues.estado === "Cancelada" ? "Pendiente" : "Cancelada",
                  }))
              }
              style={{
                  width: "3rem",
                  height: "1.5rem",
                  backgroundColor: formValues.estado === "Cancelada" ? "red" : "",
                  border: formValues.estado === "Cancelada" ? "1px solid red" : "",
              }}
          />
          <label
              className="form-check-label"
              htmlFor="estadoSwitch"
              style={{
                  fontSize: "1.25rem",
                  color: formValues.estado === "Cancelada" ? "red" : "green",
                  fontWeight: "bold",
              }}
          >
              {formValues.estado === "Cancelada" ? "Cancelada" : "Activo"}
          </label>
      </div>
  </CCol>
</CRow>

)}
        <CModalFooter>
          <CButton
            type="submit"
            color="success"
            style={{ backgroundColor: '#4B6251', color: 'white' }}
            disabled={isSubmitting}
          >
            <CIcon icon={cilSave} /> {isSubmitting ? 'Guardando...' : 'Guardar'}
          </CButton>
          <CButton color="secondary" onClick={handleModalClose}>
            Cancelar
          </CButton>
        </CModalFooter>
      </CCard>
    </CForm>
  </CModalBody>
</CModal>

<CModal visible={modalVisible} onClose={() => setModalVisible(false)} backdrop="static">
  <CModalHeader closeButton style={{ backgroundColor: '#6C8E58', color: 'white' }}>
    <CModalTitle>Detalles de la Cita</CModalTitle>
  </CModalHeader>
  <CModalBody>
    {selectedCita && (
      <CCard>
        <CCardHeader>
          <h5 style={{ fontWeight: 'bold', margin: 0 }}>
            {selectedCita.title || 'Título no disponible'}
          </h5>
          {selectedCita.important && (
            <CBadge color="danger" className="ms-2" style={{ fontSize: '0.8rem' }}>
              Importante
            </CBadge>
          )}
        </CCardHeader>
        <CCardBody>
          <div style={{ marginBottom: '10px' }}>
            <strong style={{ display: 'block' }}>Asunto:</strong>
            <span>{selectedCita.description || 'Sin descripción'}</span>
          </div>
          <div style={{ marginBottom: '10px' }}>
            <strong style={{ display: 'block' }}>Persona Requerida:</strong>
            <span>{selectedCita.personaRequerida || 'No especificada'}</span>
          </div>
          <div style={{ marginBottom: '10px' }}>
            <strong style={{ display: 'block' }}>Persona que creó la cita:</strong>
            <span>
              {`${selectedCita.Persona_Nombre || 'Nombre no disponible'} ${
                selectedCita.Persona_Apellido || ''
              }`}
            </span>
          </div>
          <div style={{ marginBottom: '10px' }}>
            <strong style={{ display: 'block' }}>Correo Electrónico:</strong>
            <span>{selectedCita.Persona_Correo || 'Correo no disponible'}</span>
          </div>
          <div style={{ marginBottom: '10px' }}>
            <strong style={{ display: 'block' }}>Fecha:</strong>
            <span>{selectedCita.start || 'Fecha no disponible'}</span>
          </div>
          <div style={{ marginBottom: '10px' }}>
            <strong style={{ display: 'block' }}>Hora de Inicio:</strong>
            <span>{selectedCita.horaInicio || 'Hora no disponible'}</span>
          </div>
          <div style={{ marginBottom: '10px' }}>
            <strong style={{ display: 'block' }}>Hora de Fin:</strong>
            <span>{selectedCita.horaFin || 'Hora no disponible'}</span>
          </div>
          <div style={{ marginBottom: '10px' }}>
            <strong style={{ display: 'block' }}>Estado:</strong>
            <span
              style={{
                color: selectedCita.estado === 'Cancelada' ? 'red' : 'green',
                fontWeight: 'bold',
              }}
            >
              {selectedCita.estado || 'Estado no disponible'}
            </span>
          </div>
          <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
            <CButton
              color="warning"
              onClick={handleEditarCita}
              style={{ backgroundColor: '#6C8E58', color: 'white' }}
            >
              <CIcon icon={cilPen} /> Editar
            </CButton>
            <CButton
              color="secondary"
              onClick={() => exportarCitaAPDF(selectedCita)}
              style={{ backgroundColor: '#6C8E58', color: 'white', borderColor: '#6C8E58' }}
            >
              <CIcon icon={cilFile} /> Exportar PDF
            </CButton>
          </div>
        </CCardBody>
      </CCard>
    )}
  </CModalBody>
</CModal>


    </CContainer>
  );
};

export default Solicitud;
