// Path: src/views/pages/solicitud/Solicitud.js
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { AuthContext } from '/context/AuthProvider'; // Asegúrate de que la ruta sea correcta
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


// Función para decodificar JWT
const decodeJWT = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error al decodificar el token JWT:', error);
    return null;
  }
};

const Solicitud = () => {
  const { canSelect, canDelete, canInsert, canUpdate } = usePermission('Solicitudes_Padre');
  const { auth } = useContext(AuthContext); // Obtener el usuario autenticado desde AuthContext
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCita, setSelectedCita] = useState(null);
  const [formModalVisible, setFormModalVisible] = useState(false);
  const [allCitasModalVisible, setAllCitasModalVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCitas, setFilteredCitas] = useState([]);
  const [formValues, setFormValues] = useState({
    title: '',
    description: '',
    personaRequerida: '',
    fecha: '',
    horaInicio: '',
    horaFin: '',
    cod_persona: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSolicitudes(); // Inicial fetch
    const intervalId = setInterval(fetchSolicitudes, 15000); // Actualización automática cada 15 segundos
    return () => clearInterval(intervalId); // Limpieza del intervalo al desmontar el componente
  }, []);

  const fetchSolicitudes = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Usuario no autenticado. Por favor, inicia sesión.');
      }

      const response = await fetch('http://localhost:4000/api/solicitud/solicitudes', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al obtener las solicitudes.');
      }

      const data = await response.json();

      const solicitudesData = data.map((solicitud) => ({
        id: solicitud.Cod_solicitud || '',
        title: solicitud.Nombre_solicitud || 'SIN TÍTULO',
        start: solicitud.Fecha_solicitud || '',
        description: solicitud.Asunto || 'SIN ASUNTO',
        personaRequerida: solicitud.Persona_requerida || 'DESCONOCIDO',
        horaInicio: solicitud.Hora_Inicio || '00:00', // Siempre en formato HH:mm
        horaFin: solicitud.Hora_Fin || null, // Permitir null si no está presente
        estado: solicitud.Estado || 'Pendiente',
        Cod_persona: solicitud.Cod_persona || '', // Agregar este campo
      }));
      setSolicitudes(solicitudesData);
      setFilteredCitas(solicitudesData);
    } catch (error) {
      console.error('Error al obtener las solicitudes:', error.message);
      setError(error.message);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message,
        timer: 2000, // Duración de 2 segundos
        timerProgressBar: true,
        showConfirmButton: false, // Eliminar botón OK
        allowOutsideClick: false, // No permitir interacción fuera de la alerta
      });
      
    } finally {
      setLoading(false);
    }
  };

  


  
  const decodeJWT = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error al decodificar el token JWT:', error);
      return null;
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
  


  const exportarCitaAPDF = async (selectedCita) => {
    if (!selectedCita) {
      console.warn('No hay cita seleccionada para exportar.');
      return;
    }
  
    const doc = new jsPDF('landscape'); // Orientación horizontal
    const img = new Image();
    img.src = logo;
  
    img.onload = () => {
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
  
      // Generar la tabla con los datos de la cita seleccionada
      doc.autoTable({
        startY: 60,
        head: [
          ['Campo', 'Valor'],
        ],
        body: [
          ['Título', selectedCita.title || 'Título no disponible'],
          ['Asunto', selectedCita.description || 'Sin descripción'],
          ['Persona Requerida', selectedCita.personaRequerida || 'No especificada'],
          ['Fecha', selectedCita.start || 'Fecha no disponible'],
          ['Hora Inicio', selectedCita.horaInicio || 'Hora no disponible'],
          ['Hora Fin', selectedCita.horaFin || 'Hora no disponible'],
          ['Estado', selectedCita.estado || 'Estado no disponible'],
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
  
      // Pie de página con fecha y hora de generación
      const now = new Date();
      const date = now.toLocaleDateString();
      const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); // Formato HH:mm
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Fecha y hora de generación: ${date} ${time}`, 10, doc.internal.pageSize.height - 10);
  
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

  const handleEventClick = (info) => {
    const citaSeleccionada = solicitudes.find((cita) => cita.id === parseInt(info.event.id, 10));
    if (citaSeleccionada) {
      setSelectedCita(citaSeleccionada);
      setModalVisible(true);
    }
  };

  const handleEventDrop = async (info) => {
    const citaId = parseInt(info.event.id, 10); // ID del evento
    const newDate = new Date(info.event.startStr).toISOString().split('T')[0]; // Nueva fecha formateada como YYYY-MM-DD
    const cita = solicitudes.find((c) => c.id === citaId); // Buscar la cita en el estado

    if (!cita) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se encontró la cita para actualizar.',
            confirmButtonColor: '#6C8E58',
        });
        return info.revert(); // Revertir el movimiento si no encuentra la cita
    }

    // Prevenir cambio de fecha para citas finalizadas
    if (cita.estado === 'Finalizada') {
        Swal.fire({
            icon: 'warning',
            title: 'Advertencia',
            text: 'No puedes cambiar la fecha de una cita que ya está finalizada.',
            confirmButtonColor: '#6C8E58',
            timer: 2000,
timerProgressBar: true,
showConfirmButton: false,
allowOutsideClick: false,

        });
        return info.revert(); // Revertir el movimiento
    }

    // Validar que la nueva fecha no sea en el pasado
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Eliminar horas, minutos y segundos
    if (newDate < today.toISOString().split('T')[0]) {
        Swal.fire({
            icon: 'warning',
            title: 'Advertencia',
            text: 'No puedes mover una cita a una fecha pasada.',
            confirmButtonColor: '#6C8E58',
            timer: 3000,
timerProgressBar: true,
showConfirmButton: false,
allowOutsideClick: false,
        });
        return info.revert(); // Revertir el movimiento
    }

    // Si pasa las validaciones, proceder a actualizar la cita
    Swal.fire({
        title: 'Confirmación',
        text: `¿Deseas cambiar la fecha de esta cita a ${newDate}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, cambiar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#4B6251',
        cancelButtonColor: '#6C8E58',
    }).then(async (result) => {
        if (!result.isConfirmed) {
            return info.revert(); // Revertir si el usuario cancela
        }

        try {
            // Preparar el payload para la solicitud
            const requestData = {
                Cod_persona: cita.Cod_persona, // Código de persona asociado
                Nombre_solicitud: cita.title || 'SIN TÍTULO', // Usar título por defecto si falta
                Fecha_solicitud: newDate, // Fecha actualizada
                Hora_Inicio: cita.horaInicio, // Enviar Hora_Inicio asegurada
                Hora_Fin: cita.horaFin , // Permitir que Hora_Fin sea null
                Asunto: cita.description || 'SIN ASUNTO', // Usar asunto por defecto
                Estado: cita.estado, // Mantener el estado actual
            };

            const response = await fetch(`http://localhost:4000/api/Solicitud_admin/solicitudes/${citaId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData), // Enviar el payload
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
                timer: 2000,
timerProgressBar: true,
showConfirmButton: false,
allowOutsideClick: false,
            });

            await fetchSolicitudes(); // Refrescar las citas después de actualizar
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: `No se pudo actualizar la fecha. ${error.message}`,
                confirmButtonColor: '#6C8E58',
            });
            info.revert(); // Revertir si ocurre un error
        }
    });
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
      personaRequerida: 'ADMINISTRADOR', // Valor predeterminado
      fecha: '',
      horaInicio: '',
      horaFin: '',
      cod_persona: '',
    });
    setSelectedCita(null);
    setFormModalVisible(true);
  };
  
  const handleEditarCita = () => {
    if (selectedCita.estado === 'Finalizada') {
      Swal.fire({
        icon: 'warning',
        title: 'Advertencia',
        text: 'No puedes editar esta cita si ya está finalizada.',
        confirmButtonColor: '#6C8E58',
        timer: 2000,
timerProgressBar: true,
showConfirmButton: false,
allowOutsideClick: false,
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

  const areFieldsValid = () => {
    const { title, description, personaRequerida, fecha, horaInicio, horaFin } = formValues;
  
    // Validar campos vacíos
    if (!title || !description || !personaRequerida || !fecha || !horaInicio || !horaFin) {
      Swal.fire({
        icon: 'warning',
        title: 'Advertencia',
        text: 'Todos los campos son obligatorios.',
        confirmButtonColor: '#6C8E58',
      });
      return false;
    }
  
    // Validar longitud de caracteres
    const maxLengths = {
      title: 50,
      description: 200,
      personaRequerida: 100,
    };
  
    if (title.length > maxLengths.title) {
      Swal.fire({
        icon: 'warning',
        title: 'Advertencia',
        text: `El título no puede exceder ${maxLengths.title} caracteres.`,
        confirmButtonColor: '#6C8E58',
      });
      return false;
    }
  
    if (description.length > maxLengths.description) {
      Swal.fire({
        icon: 'warning',
        title: 'Advertencia',
        text: `El asunto no puede exceder ${maxLengths.description} caracteres.`,
        confirmButtonColor: '#6C8E58',
      });
      return false;
    }
  
    if (personaRequerida.length > maxLengths.personaRequerida) {
      Swal.fire({
        icon: 'warning',
        title: 'Advertencia',
        text: `El nombre de la persona requerida no puede exceder ${maxLengths.personaRequerida} caracteres.`,
        confirmButtonColor: '#6C8E58',
      });
      return false;
    }
  
    return true; // Todos los campos son válidos
  };
  
  

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const { title, description, personaRequerida, fecha, horaInicio, horaFin, estado } = formValues;
  
    // Validar los campos obligatorios
    if (!title?.trim() || !description?.trim() || !personaRequerida?.trim() || !fecha || !horaInicio) {
      Swal.fire({
        icon: 'warning',
        title: 'Advertencia',
        text: 'Todos los campos son obligatorios, excepto Hora_Fin.',
        confirmButtonColor: '#6C8E58',
      });
      return;
    }
  
    // Validar coherencia de horas
    if (horaFin) {
      const [horaInicioHoras, horaInicioMinutos] = horaInicio.split(':').map(Number);
      const [horaFinHoras, horaFinMinutos] = horaFin.split(':').map(Number);
      if (horaFinHoras < horaInicioHoras || (horaFinHoras === horaInicioHoras && horaFinMinutos <= horaInicioMinutos)) {
        Swal.fire({
          icon: 'warning',
          title: 'Advertencia',
          text: 'La hora de fin debe ser mayor que la hora de inicio.',
          confirmButtonColor: '#6C8E58',
          timer: 3000,
          timerProgressBar: true,
          showConfirmButton: false,
          allowOutsideClick: false,
        });
        return;
      }
    }
  
    setIsSubmitting(true);
  
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Usuario no autenticado. Por favor, inicia sesión.');
      }
  
      const requestData = {
        Cod_persona: auth?.cod_persona || null,
        Nombre_solicitud: title?.trim() || 'SIN TÍTULO',
        Fecha_solicitud: fecha,
        Hora_Inicio: horaInicio?.trim(),
        Hora_Fin: horaFin?.trim() || null,
        Asunto: description?.trim() || 'SIN ASUNTO',
        Persona_requerida: personaRequerida?.trim() || 'DESCONOCIDO',
        estado: estado?.trim() || 'Pendiente',
        motivoCancelacion: formValues.estado === 'Cancelada' ? formValues.motivoCancelacion : null, // Solo si está cancelada
    };
    
  
      console.log('Enviando datos al servidor:', requestData);
  
      const response = await fetch(
        selectedCita
          ? `http://localhost:4000/api/solicitud/solicitudes/${selectedCita.id}`
          : 'http://localhost:4000/api/solicitud/solicitudes',
        {
          method: selectedCita ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
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
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false,
        allowOutsideClick: false,
      });
  
      setFormModalVisible(false);
      await fetchSolicitudes(); // Recargar las citas después de guardar
    } catch (error) {
      console.error('Error en el manejo de la solicitud:', error.message);
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

  const exportarAPDF = () => {
    const doc = new jsPDF('landscape'); // Set orientation to landscape
  
    if (solicitudes.length === 0) {
        console.warn('No hay datos de citas para exportar.');
        return;
    }
  
    const img = new Image();
    img.src = logo;
  
    img.onload = () => {
        // Header with logo and institution details
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
  
        // Generate table with the required fields
        doc.autoTable({
            startY: 60,
            head: [
                [
                    'Título',
                    'Asunto',
                    'Persona Requerida',
                    'Fecha',
                    'Hora Inicio',
                    'Hora Fin',
                    'Estado',
                ],
            ],
            body: solicitudes.map((cita) => [
                cita.title || 'Título no disponible',
                cita.description || 'Sin descripción',
                cita.personaRequerida || 'No especificada',
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
  
        // Footer with generation date and time
        const now = new Date();
        const date = now.toLocaleDateString();
        const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); // Formato HH:mm
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Fecha y hora de generación: ${date} ${time}`, 10, doc.internal.pageSize.height - 10);
  
        // Open the PDF in a new tab
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
  

  //AQUI VA LA LOGICA PARA QUE SALGA LA PANTALLA DE ACCESO DENEGADO
  // Verificar permisos
  if (!canSelect) {
    return <AccessDenied />;
  }
  
  
  

  return (
    <CContainer fluid style={{ backgroundColor: '#F8F9FA', padding: '20px' }}>
      <CRow className="mb-4">
        <CCol className="text-center">
          <h1 style={{ color: '#6C757D', fontWeight: 'bold', fontSize: '2.5rem' }}>Gestión de Citas para Padres</h1>
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
  events={
    filteredCitas.length > 0
      ? filteredCitas.map((cita) => ({
          ...cita,
          id: cita.id.toString(),
          backgroundColor: getColorByEstado(cita.estado),
          borderColor: '#4B6251',
          textColor: '#000000',
        }))
      : [
          {
            title: 'No hay citas programadas',
            start: new Date().toISOString().split('T')[0], // Fecha actual
            backgroundColor: 'rgba(158, 158, 158, 0.8)', // Neutral gray
            borderColor: '#4B6251',
            textColor: '#000000',
          },
        ]
  }
  eventContent={(eventInfo) => {
    if (eventInfo.view.type === 'timeGridDay') {
      return (
        <span>
          <strong>{eventInfo.event.title}</strong>
          <br />
          {eventInfo.event.extendedProps.horaInicio || ''} -{' '}
          {eventInfo.event.extendedProps.horaFin || ''}
        </span>
      );
    }
    return <span>{eventInfo.event.title}</span>;
  }}
  eventClick={handleEventClick}
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
        <p><strong>Hora de Fin:</strong> {selectedCita.horaFin} </p>
        <p><strong>Estado:</strong> {selectedCita.estado}</p>
        <CButton
          color="warning"
          onClick={handleEditarCita}
          style={{ backgroundColor: '#6C8E58', color: 'white' }}
        >
          <CIcon icon={cilPen} /> Editar
        </CButton>
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

      <CModal visible={formModalVisible} onClose={handleModalClose} backdrop="static">
  <CModalHeader closeButton style={{ backgroundColor: '#4B6251', color: 'white' }}>
    <CModalTitle>{selectedCita ? 'Editar Cita' : 'Crear Nueva Cita'}</CModalTitle>
  </CModalHeader>
  <CModalBody>
    <CForm onSubmit={handleSubmit}>
      <CCard className="p-3" style={{ border: '1px solid #4B6251' }}>
        {/* Nombre de la Cita */}
        <CRow className="mb-3">
          <CCol md={12}>
            <CFormLabel>Nombre de la Cita</CFormLabel>
            <CFormInput
              type="text"
              name="title"
              value={formValues.title}
              onChange={handleValidatedInputChange}
              placeholder="Ejemplo: REUNIÓN DE PROYECTO"
              required
              style={{ borderColor: '#6C8E58' }}
            />
          </CCol>
        </CRow>
        {/* Asunto */}
        <CRow className="mb-3">
          <CCol md={12}>
            <CFormLabel>Asunto</CFormLabel>
            <CFormInput
              type="text"
              name="description"
              value={formValues.description}
              onChange={handleValidatedInputChange}
              placeholder="Ejemplo: DISCUTIR AVANCES DEL PROYECTO"
              required
              style={{ borderColor: '#6C8E58' }}
            />
          </CCol>
        </CRow>
        {/* Persona Requerida */}
        <CRow className="mb-3">
          <CCol md={12}>
            <CFormLabel>Persona Requerida</CFormLabel>
            <CFormInput
              type="text"
              name="personaRequerida"
              value={formValues.personaRequerida}
              onChange={handleValidatedInputChange}
              placeholder="Ejemplo: JUAN PÉREZ"
              required
              style={{ borderColor: '#6C8E58' }}
            />
          </CCol>
        </CRow>
        {/* Fecha, Hora de Inicio y Hora de Fin */}
        <CRow className="mb-3">
          <CCol md={4}>
            <CFormLabel>Fecha</CFormLabel>
            <CFormInput
              type="date"
              name="fecha"
              value={formValues.fecha}
              onChange={handleInputChange}
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
              onChange={handleInputChange}
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
              onChange={handleInputChange}
              required
              style={{ borderColor: '#6C8E58' }}
            />
          </CCol>
        </CRow>

        {/* Mostrar Estado y Motivo de Cancelación solo en edición */}
        {selectedCita && (
          <>
            {/* Estado */}
            <CRow className="mb-4">
              <CCol md={12}>
                <CFormLabel>Estado</CFormLabel>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor:
                      formValues.estado === 'Cancelada' ? '#FFE5E5' : '#E5FFE5',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.5rem',
                    border: '1px solid',
                    borderColor: formValues.estado === 'Cancelada' ? 'red' : 'green',
                    transition: 'all 0.3s ease',
                  }}
                >
                  <span
                    style={{
                      fontWeight: 'bold',
                      color: formValues.estado === 'Cancelada' ? 'red' : 'green',
                      fontSize: '1.2rem',
                    }}
                  >
                    {formValues.estado === 'Cancelada' ? 'CANCELADA' : 'ACTIVO'}
                  </span>
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="estadoSwitch"
                      checked={formValues.estado === 'Cancelada'}
                      onChange={() =>
                        setFormValues((prevValues) => ({
                          ...prevValues,
                          estado: prevValues.estado === 'Cancelada' ? 'Pendiente' : 'Cancelada',
                          motivoCancelacion: prevValues.estado === 'Cancelada' ? '' : prevValues.motivoCancelacion,
                        }))
                      }
                      style={{
                        width: '2.5rem',
                        height: '1.5rem',
                        backgroundColor: formValues.estado === 'Cancelada' ? 'red' : '#4B6251',
                        border: formValues.estado === 'Cancelada'
                          ? '1px solid red'
                          : '1px solid #4B6251',
                        transition: 'background-color 0.3s ease',
                      }}
                    />
                  </div>
                </div>
              </CCol>
            </CRow>

            {/* Motivo de Cancelación */}
            {formValues.estado === 'Cancelada' && (
              <CRow className="mb-4">
                <CCol md={12}>
                  <CFormLabel>Motivo de Cancelación</CFormLabel>
                  <textarea
                    className="form-control"
                    placeholder="Escribe el motivo de cancelación aquí..."
                    value={formValues.motivoCancelacion}
                    name="motivoCancelacion"
                    onChange={handleValidatedInputChange}
                    required={formValues.estado === 'Cancelada'}
                    style={{
                      borderColor: '#4B6251',
                      backgroundColor: '#FFF8F8',
                      borderRadius: '0.5rem',
                      padding: '0.5rem',
                    }}
                  />
                </CCol>
              </CRow>
            )}
          </>
        )}

        {/* Modal Footer */}
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


      <CModal size="lg" visible={allCitasModalVisible} onClose={handleModalClose} backdrop="static">
        <CModalHeader closeButton style={{ backgroundColor: '#4B6251', color: 'white' }}>
          <CModalTitle>Todas las Citas</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CTable hover responsive>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>Título</CTableHeaderCell>
                <CTableHeaderCell>Asunto</CTableHeaderCell>
                <CTableHeaderCell>Persona Requerida</CTableHeaderCell>
                <CTableHeaderCell>Fecha</CTableHeaderCell>
                <CTableHeaderCell>Hora Inicio</CTableHeaderCell>
                <CTableHeaderCell>Hora Fin</CTableHeaderCell>
                <CTableHeaderCell>Estado</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {solicitudes.map((cita) => (
                <CTableRow key={cita.id}>
                  <CTableDataCell>{cita.title}</CTableDataCell>
                  <CTableDataCell>{cita.description}</CTableDataCell>
                  <CTableDataCell>{cita.personaRequerida}</CTableDataCell>
                  <CTableDataCell>{cita.start}</CTableDataCell>
                  <CTableDataCell>{cita.horaInicio}</CTableDataCell>
                  <CTableDataCell>{cita.horaFin}</CTableDataCell>
                  <CTableDataCell>
                    <CIcon icon={getIconByEstado(cita.estado)} className="me-2" />
                    {cita.estado}
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
          <CButton color="secondary" className="mt-3" onClick={handleModalClose}>
            Cerrar
          </CButton>
        </CModalBody>
      </CModal>
    </CContainer>
  );
};

export default Solicitud;
