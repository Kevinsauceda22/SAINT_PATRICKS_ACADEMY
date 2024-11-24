import React, { useState, useEffect } from 'react';
import CIcon from '@coreui/icons-react';
import { cilSearch, cilBrushAlt, cilPen, cilTrash, cilPlus, cilSave, cilDescription, cilBan, cilCheckCircle } from '@coreui/icons';
import swal from 'sweetalert2';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import logo from 'src/assets/brand/logo_saint_patrick.png'
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import {
  CButton,
  CContainer,
  CDropdown,
  CDropdownMenu,
  CDropdownToggle,
  CDropdownItem,
  CForm,
  CFormInput,
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
  CFormSelect,
  CRow,
  CCol,
} from '@coreui/react';

// Componente principal de la lista de actividades extracurriculares
const ListaActividades = () => {
  const [actividades, setActividades] = useState([]); // Almacena todas las actividades
  const [secciones, setSecciones] = useState([]); // Almacena las secciones disponibles para selección
  const [modalVisible, setModalVisible] = useState(false); // Controla la visibilidad del modal de creación
  const [modalUpdateVisible, setModalUpdateVisible] = useState(false); // Controla la visibilidad del modal de actualización
  const [modalDeleteVisible, setModalDeleteVisible] = useState(false); // Controla la visibilidad del modal de eliminación
  const [nuevaActividad, setNuevaActividad] = useState({ Nombre: '', Descripcion: '', Hora_inicio: '', Hora_final: '', Nombre_seccion: '', Fecha: ''}); // Datos de la actividad nueva
  const [actividadToUpdate, setActividadToUpdate] = useState({}); // Datos de la actividad a actualizar
  const [actividadToDelete, setActividadToDelete] = useState({}); // Datos de la actividad a eliminar
  const [searchTerm, setSearchTerm] = useState(''); // Término de búsqueda
  const [currentPage, setCurrentPage] = useState(1); // Página actual en la lista
  const [recordsPerPage, setRecordsPerPage] = useState(10); // Número de registros por página
  const [searchField, setSearchField] = useState("Nombre_actividad"); // Campo predeterminado
  const [horaInicioOriginal, setHoraInicioOriginal] = useState(null); // Estado para almacenar las horas originales
  const [horaFinalOriginal, setHoraFinalOriginal] = useState(null);

  // Cargar actividades al inicio
  useEffect(() => {
    fetchActividades(); // Cargar actividades al inicio
  }, []);

  // Función para obtener actividades de la base de datos
  const fetchActividades = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/actividades/extracurriculares');
      const data = await response.json();
      const dataWithIndex = data.map((actividad, index) => ({
        ...actividad,
        originalIndex: index + 1, // Índice para mostrar en la tabla
      }));
      setActividades(dataWithIndex);
    } catch (error) {
      console.error('Error al obtener las actividades extracurriculares:', error);
    }
  };

  const fetchSecciones = async (Cod_secciones) => {
    try {
      //console.log(`Fetching: http://localhost:4000/api/secciones/obtener_seccion/${Cod_secciones}`);
      const response = await fetch(`http://localhost:4000/api/obtener_secciones/${Cod_secciones}`);
      
      if (!response.ok) {
        console.error(`HTTP Error: ${response.status}`);
        throw new Error('Error al obtener las secciones');
      }
      
      const data = await response.json();
      console.log('Datos obtenidos del servidor:', data); // Depuración
      
      if (!Array.isArray(data)) {
        throw new Error('La respuesta del servidor no es un array');
      }
      
      const seccionesConGrado = data.map((seccion) => ({
        ...seccion,
        SeccionGrado: `${seccion.Nombre_seccion} - ${seccion.Nombre_grado}`, // Concatenar sección y grado
      }));
      
      console.log('Secciones procesadas:', seccionesConGrado);
      setSecciones(seccionesConGrado);
    } catch (error) {
      console.error('Error en fetchSecciones:', error.message);
    }
  };
  

  // Cargar secciones al inicio
  useEffect(() => {
    fetchSecciones(); // Cargar secciones al inicio
  }, []);

  // Validar si hay letras consecutivas repetidas dos veces
  const tieneLetrasRepetidas = (texto) => {
    const regex = /(.)\1\1/;
    return regex.test(texto); // Verifica letras consecutivas repetidas
  };

  // Validar caracteres permitidos
  const permitirCaracteresValidos = (texto) => {
    const regex = /^[a-zA-Z0-9 ,.:;¿?]*$/;
    return regex.test(texto); // Solo permite caracteres válidos
  };

  // Configuración del rango de fechas permitido
  const fechaActual = new Date();
  const fechaMinima = fechaActual.toISOString().split('T')[0];
  const fechaMaxima = new Date(fechaActual.getFullYear() + 1, fechaActual.getMonth(), fechaActual.getDate())
    .toISOString()
    .split('T')[0];

  // Validar hora de inicio y hora final
  const validarHoras = (horaInicio, horaFinal) => {
    const inicio = new Date(`1970-01-01T${horaInicio}:00`);
    const final = new Date(`1970-01-01T${horaFinal}:00`);
    return final > inicio; // Valida que la hora de finalización sea después de la hora de inicio
  };

  // Validar si hay traslape de actividades en la misma sección, grado, fecha y horario
  const verificarTraslape = (actividad) => {
  const { Nombre_seccion, Nombre_grado, Fecha, Hora_inicio, Hora_final } = actividad;
  const inicio = new Date(`1970-01-01T${Hora_inicio}:00`).getTime();
  const fin = new Date(`1970-01-01T${Hora_final}:00`).getTime();

  return actividades.some((existingActividad) => {
    const existingInicio = new Date(`1970-01-01T${existingActividad.Hora_inicio}:00`).getTime();
    const existingFin = new Date(`1970-01-01T${existingActividad.Hora_final}:00`).getTime();

    // Comprobar si están en la misma sección, grado, fecha, y si los horarios se superponen
    return (
      existingActividad.Nombre_seccion === Nombre_seccion &&
      existingActividad.Nombre_grado === Nombre_grado &&
      existingActividad.Fecha === Fecha &&
      (
        (inicio < existingFin && fin > existingInicio) || // Cualquier traslape entre inicio y fin
        (inicio === existingInicio && fin === existingFin) // Coincidencia exacta
      ));
    });
  };

  // Bloquea copiar y pegar en campos
  const disableCopyPaste = (e) => {
    e.preventDefault();
    swal.fire({
      icon: 'warning',
      title: 'Acción bloqueada',
      text: 'Copiar y pegar no está permitido.',
    });
  };

  // Cerrar modal con confirmación
  const handleCloseModal = (setModalVisibility, resetData, formData) => {
    const { Nombre, Descripcion, Hora_inicio, Hora_final, Nombre_seccion, Fecha } = formData;
    if (Nombre || Descripcion || Hora_inicio || Hora_final || Nombre_seccion || Fecha) {
      swal.fire({
        title: '¿Estás seguro?',
        text: 'Si cierras este formulario, perderás todos los datos ingresados.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, cerrar',
        cancelButtonText: 'Cancelar',
      }).then((result) => {
        if (result.isConfirmed) {
          setModalVisibility(false);
          resetData();
        }
      });
    } else {
      setModalVisibility(false);
    }
  };

  // Estado de la actividad
  const handleEstadoChange = async (idActividad, estadoActual) => {
    const nuevoEstado = estadoActual === 'Activa' ? 'Cancelada' : 'Activa'; // Determina el nuevo estado
  
    try {
      const response = await fetch('http://localhost:4000/api/actividades/cambiar_estado', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          p_Cod_actividades_extracurriculares: idActividad,
          p_Estado: nuevoEstado,
        }),
      });
  
      if (response.ok) {
        const data = await response.json();
  
        // Mostrar un mensaje de éxito
        swal.fire({
          icon: 'success',
          title: 'Estado actualizado',
          text: data.mensaje,
        });
  
        // Recargar actividades para reflejar el cambio
        fetchActividades();
      } else {
        const errorData = await response.json();
  
        // Mostrar un mensaje de error
        swal.fire({
          icon: 'error',
          title: 'Error',
          text: errorData.mensaje || 'No se pudo cambiar el estado.',
        });
      }
    } catch (error) {
      console.error('Error al cambiar el estado:', error);
  
      // Mostrar un mensaje de error genérico
      swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un problema al cambiar el estado.',
      });
    }
  };
  
  // Resetear datos de actividad nueva
  const resetNuevaActividad = () => {
    setNuevaActividad({
      Nombre: '',
      Descripcion: '',
      Hora_inicio: '',
      Hora_final: '',
      Nombre_seccion: '',
      Fecha: ''
    });
  };

  // Resetear datos de actividad a actualizar
  const resetActividadToUpdate = () => {
    setActividadToUpdate({
      Nombre_actividad: '',
      Descripcion: '',
      Hora_inicio: '',
      Hora_final: '',
      Nombre_seccion: '',
      Fecha: ''
    });
  };
  

// Exportar datos a PDF con visor personalizado
const generatePDF = () => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const img = new Image();
  img.src = logo; // Ruta válida del logo

  img.onload = () => {
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    // Logo
    doc.addImage(img, 'PNG', 10, 10, 45, 45);

    // Encabezado principal
    doc.setFontSize(18);
    doc.setTextColor(0, 102, 51); // Verde
    doc.text("SAINT PATRICK'S ACADEMY", pageWidth / 2, 24, { align: 'center' });

    // Información de contacto
    doc.setFontSize(10);
    doc.setTextColor(100); // Gris
    doc.text('Casa Club del periodista, Colonia del Periodista', pageWidth / 2, 32, { align: 'center' });
    doc.text('Teléfono: (504) 2234-8871', pageWidth / 2, 37, { align: 'center' });
    doc.text('Correo: info@saintpatrickacademy.edu', pageWidth / 2, 42, { align: 'center' });

    // Título del reporte
    doc.setFontSize(14);
    doc.setTextColor(0, 102, 51); // Verde
    doc.text('Reporte General de Actividades Extracurriculares', pageWidth / 2, 50, { align: 'center' });

    // Línea divisoria
    doc.setLineWidth(0.5);
    doc.setDrawColor(0, 102, 51); // Verde
    doc.line(10, 55, pageWidth - 10, 55);

    // Subtítulo
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text('Listado Detallado de Actividades', pageWidth / 2, 65, { align: 'center' });

    // Tabla de datos
    const tableColumn = [
      '#',
      'Actividad',
      'Descripción',
      'Inicio',
      'Finalización',
      'Sección y Grado',
      'Fecha',
      'Estado',
    ];

    const tableRows = currentRecords.map((actividad, index) => {
      const seccion = secciones.find((s) => s.Nombre_seccion === actividad.Nombre_seccion); // Buscar sección
      return [
        { content: (index + 1 + (currentPage - 1) * recordsPerPage).toString(), styles: { halign: 'center' } }, // Centrado
        { content: (actividad.Nombre_actividad || 'Sin nombre').toUpperCase(), styles: { halign: 'left' } }, // Izquierda
        { content: (actividad.Descripcion || 'Sin descripción').toUpperCase(), styles: { halign: 'left' } }, // Izquierda
        { content: actividad.Hora_inicio.toUpperCase(), styles: { halign: 'center' } }, // Centrado
        { content: actividad.Hora_final.toUpperCase(), styles: { halign: 'center' } }, // Centrado
        { content: (seccion ? seccion.SeccionGrado : 'Sin sección').toUpperCase(), styles: { halign: 'left' } }, // Centrado
        { content: new Date(actividad.Fecha).toLocaleDateString('es-ES').toUpperCase(), styles: { halign: 'center' } }, // Centrado
        { content: (actividad.Estado || 'Desconocido').toUpperCase(), styles: { halign: 'center' } }, // Centrado
      ];
    });

    doc.autoTable({
      startY: 75,
      head: [tableColumn],
      body: tableRows,
      headStyles: {
        fillColor: [0, 102, 51], // Verde
        textColor: [255, 255, 255], // Blanco
        fontSize: 10,
        halign: 'center', // Centrado por defecto
      },
      styles: {
        fontSize: 10,
        cellPadding: 3,
      },
      alternateRowStyles: {
        fillColor: [240, 248, 255], // Azul claro
      },
      columnStyles: {
        1: { halign: 'left' }, // Nombre alineado a la izquierda
        2: { halign: 'left' }, // Descripción alineada a la izquierda
        3: { halign: 'left' }, // Seccion y grado alineada a la izquierda
      },
      margin: { top: 10, bottom: 30 },
      didDrawPage: function (data) {
        const pageCount = doc.internal.getNumberOfPages();
        const pageCurrent = doc.internal.getCurrentPageInfo().pageNumber;

        // Pie de página
        doc.setFontSize(10);
        doc.setTextColor(0, 102, 51); // Verde
        doc.text(
          `Página ${pageCurrent} de ${pageCount}`,
          pageWidth - 10,
          pageHeight - 10,
          { align: 'right' }
        );

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
        doc.text(`Fecha de generación: ${dateString} Hora: ${timeString}`, 10, pageHeight - 10);
      },
    });

    // Convertir PDF en Blob
    const pdfBlob = doc.output('blob');
    const pdfURL = URL.createObjectURL(pdfBlob);

    // Crear una nueva ventana con visor personalizado
    const newWindow = window.open('', '_blank');
    newWindow.document.write(`
      <html>
        <head><title>Reporte de Actividades Extracurriculares</title></head>
        <body style="margin:0;">
          <iframe width="100%" height="100%" src="${pdfURL}" frameborder="0"></iframe>
          <div style="position:fixed;top:10px;right:200px;">
            <button style="background-color: #6c757d; color: white; border: none; padding: 10px 15px; border-radius: 5px; cursor: pointer;" 
              onclick="const a = document.createElement('a'); a.href='${pdfURL}'; a.download='Reporte_de_Actividades_Extracurriculares.pdf'; a.click();">
              Descargar PDF
            </button>
          </div>
        </body>
      </html>`);
  };

  img.onerror = () => {
    swal.fire('Error', 'No se pudo cargar el logo.', 'error');
  };
};

  // FUNCIONES CRUD //

  // Función para crear actividad
  const handleCreateActividad = async () => {
    const { Nombre, Descripcion, Nombre_seccion, Hora_inicio, Hora_final, Fecha } = nuevaActividad;
    // Validar que todos los campos requeridos tengan valores
    if (!Nombre || !Descripcion || !Hora_inicio || !Hora_final || !Nombre_seccion || !Fecha) {
      swal.fire('Error', 'Todos los campos son requeridos.', 'error');
      return;
    }
    // Validar que la hora de finalización sea después de la hora de inicio
    if (!validarHoras(Hora_inicio, Hora_final)) {
      swal.fire({ icon: 'warning', title: 'Error en las horas', text: 'La hora de finalización debe ser posterior a la hora de inicio.' });
      return;
    }
    // Validar traslape de actividades
    if (verificarTraslape(nuevaActividad)) {
      swal.fire({ icon: 'warning', title: 'Traslape de actividades', text: 'Ya existe una actividad programada en esta sección y horario.' });
      return;
    }
    // Si todas las validaciones pasan, se procede con la creación
    try {
      const response = await fetch('http://localhost:4000/api/actividades/extracurriculares', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          p_Nombre: Nombre,
          p_Descripcion: Descripcion,
          p_Hora_inicio: Hora_inicio,
          p_Hora_final: Hora_final,
          p_Nombre_seccion: Nombre_seccion,
          p_Fecha: Fecha,
        }),
      });

      if (response.ok) {
        swal.fire({ icon: 'success', title: 'Creación exitosa', text: '¡Éxito!, La actividad ha sido creada correctamente.' });
        setModalVisible(false);
        fetchActividades();
        resetNuevaActividad();
      } else {
        const errorData = await response.json();
        swal.fire({ icon: 'error', title: 'Error', text: `Error, no se pudo crear la actividad. Detalle: ${errorData.mensaje}` });
      }
    } catch (error) {
      console.error('Error. hubo un problema al crear la actividad:', error);
      swal.fire({ icon: 'error', title: 'Error', text: 'Error, hubo un problema al crear la actividad.' });
    }
  };

  // Función para actualizar actividad
  const handleUpdateActividad = async () => {
    const { Fecha, Cod_actividades_extracurriculares, Nombre_actividad, Descripcion, Hora_inicio, Hora_final, Nombre_seccion } = actividadToUpdate;
    // Validar que todos los campos requeridos tengan valores
    if (!Nombre_actividad || !Descripcion || !Hora_inicio || !Hora_final || !Nombre_seccion || !Fecha) {
      swal.fire('Error', 'Todos los campos son requeridos.', 'error');
      return;
    }
    // Validar que la hora de finalización sea después de la hora de inicio solo si se modificaron las horas
    if ((Hora_inicio !== horaInicioOriginal || Hora_final !== horaFinalOriginal) && !validarHoras(Hora_inicio, Hora_final)) {
      swal.fire({ icon: 'warning', title: 'Error en las horas', text: 'La hora de finalización debe ser posterior a la hora de inicio.' });
      return;
    }
    // Validar traslape de actividades
    if (verificarTraslape(actividadToUpdate)) {
      swal.fire({ icon: 'warning', title: 'Traslape de actividades', text: 'Error. La actividad ya existe' });
      return;
    }
    // Si no hay traslape, proceder con la actualización
    try {
      const response = await fetch('http://localhost:4000/api/actividades/extracurriculares', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          p_Cod_actividad: Cod_actividades_extracurriculares,
          p_Nombre: Nombre_actividad,
          p_Descripcion: Descripcion,
          p_Hora_inicio: Hora_inicio,
          p_Hora_final: Hora_final,
          p_Nombre_seccion: Nombre_seccion,
          p_Fecha: Fecha,
        }),
      });
      if (response.ok) {
        swal.fire({ icon: 'success', title: 'Actualización exitosa', text: '¡Éxito!, La actividad ha sido actualizada correctamente.' });
        setModalUpdateVisible(false);
        fetchActividades();
        resetActividadToUpdate();
      } else {
        const errorData = await response.json();
        swal.fire({ icon: 'error', title: 'Error', text: `Error, no se pudo actualizar la actividad. Detalle: ${errorData.mensaje || 'Error en el servidor'}` });
      }
    } catch (error) {
      console.error('Error, hubo un problema al actualizar la actividad:', error);
      swal.fire({ icon: 'error', title: 'Error', text: 'Error, hubo un problema al actualizar la actividad.' });
    }
  };

  // Función para eliminar actividad
  const handleDeleteActividad = async () => {
    try {
      const response = await fetch(`http://localhost:4000/api/actividades/extracurriculares/${encodeURIComponent(actividadToDelete.Cod_actividades_extracurriculares)}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        // Actualiza el estado de actividades eliminando el elemento sin hacer un nuevo fetch
        setActividades((actividades) =>
          actividades.filter((actividad) => actividad.Cod_actividades_extracurriculares !== actividadToDelete.Cod_actividades_extracurriculares)
        );
        // Cierra el modal y muestra la alerta de éxito
        setModalDeleteVisible(false);
        swal.fire({ icon: 'success', title: 'Eliminación exitosa', text: 'La actividad ha sido eliminada correctamente.' });
      } else {
        swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo eliminar la actividad.' });
      }
    } catch (error) {
      console.error('Error al eliminar la actividad:', error);
    }
  };

  // Función para abrir modal de actualización
  const openUpdateModal = (actividad) => {
    // Asegúrate de que la fecha esté en el formato yyyy-mm-dd para el campo de fecha
    const fechaFormateada = actividad.Fecha ? actividad.Fecha.split('T')[0] : ''; // Si la fecha tiene formato de fecha y hora, se separa la parte de la fecha
    setActividadToUpdate({
      ...actividad,
      Fecha: fechaFormateada, // Asigna la fecha formateada al estado
    });
    setHoraInicioOriginal(actividad.Hora_inicio); // Guarda la hora de inicio original
    setHoraFinalOriginal(actividad.Hora_final);   // Guarda la hora de finalización original
    setModalUpdateVisible(true);
  };

  // Función para abrir modal de eliminación
  const openDeleteModal = (actividad) => {
    setActividadToDelete(actividad);
    setModalDeleteVisible(true);
  };

  // Actividades filtradas según el término de búsqueda y el campo seleccionado
  const filteredActividades = actividades
  .filter(actividad => {
    if (searchField === "Nombre_actividad") {
      return actividad.Nombre_actividad.toLowerCase().includes(searchTerm.toLowerCase());
    } else if (searchField === "Descripcion") {
      return actividad.Descripcion.toLowerCase().includes(searchTerm.toLowerCase());
    } else if (searchField === "Hora_inicio") {
      return actividad.Hora_inicio.toString().toLowerCase().includes(searchTerm.toLowerCase());
    } else if (searchField === "Hora_final") {
      return actividad.Hora_final.toString().toLowerCase().includes(searchTerm.toLowerCase());
    } else if (searchField === "Nombre_seccion") {
      return actividad.Nombre_seccion.toLowerCase().includes(searchTerm.toLowerCase());
    
    } else if (searchField === "Estado") {
      return actividad.Estado.toLowerCase().includes(searchTerm.toLowerCase());

    } else if (searchField === "Fecha") {
      return actividad.Fecha.toString().includes(searchTerm); // Búsqueda exacta de fechas
    } 
    return false;
  })
  .sort((a, b) => a.Nombre_actividad.localeCompare(b.Nombre_actividad)); // Ordenar alfabéticamente por Nombre de Actividad (A-Z)

  // Paginación
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredActividades.slice(indexOfFirstRecord, indexOfLastRecord);

  // Función para cambiar de página en la paginación
  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= Math.ceil(filteredActividades.length / recordsPerPage)) {
      setCurrentPage(pageNumber);
    }
  };

  return (
    <CContainer>
      {/* Contenedor del título y botón "Nuevo" */}
        <CRow className="align-items-center mb-3">
          <CCol xs="8" md="9">
            {/* Título de la página */}
            <h1 className="mb-0 fw-bold">Listado de Actividades Extracurriculares</h1>
          </CCol>
          <CCol
            xs="4"
            md="3"
            className="text-end d-flex flex-column flex-md-row justify-content-md-end align-items-md-center"
          >
          {/* Botón Nuevo para abrir el modal */}
          <CButton
            style={{ backgroundColor: '#4B6251', color: 'white' }}
            className="mb-3 mb-md-0 me-md-3"
            onClick={() => {
              setModalVisible(true);
              setHasUnsavedChanges(false); // Resetear el estado al abrir el modal
            }}
          >
            <CIcon icon={cilPlus} /> Nuevo
          </CButton>
  
          {/* Botón de Reporte con opciones para Excel y PDF */}
          <CDropdown>
      <CDropdownToggle style={{ backgroundColor: '#6C8E58', color: 'white' }}>
        <CIcon icon={cilDescription} /> Reporte
      </CDropdownToggle>
      <CDropdownMenu>
        <CDropdownItem
          onClick={generatePDF}
          style={{
            color: '#6C8E58', // Color verde para armonizar con el botón
            fontWeight: 'bold',
          }}
        >
          Ver Reporte en PDF
        </CDropdownItem>
      </CDropdownMenu>
    </CDropdown>
        </CCol>
      </CRow>
  
      {/* Barra de búsqueda */}
      <CRow className="align-items-center mt-4 mb-3">
        <CCol xs="12" md="4">
          <CInputGroup style={{ width: '100%' }}>
            <CInputGroupText>
              <CIcon icon={cilSearch} />
            </CInputGroupText>
            <CFormInput
              placeholder="Buscar Actividad..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </CInputGroup>
        </CCol>
  
        {/* Selector de campo dinámico */}
        <CCol xs="12" md="4">
          <CFormSelect
            value={searchField}
            onChange={(e) => setSearchField(e.target.value)}
            style={{ width: '100%' }}
          >
            <option value="Nombre_actividad">Nombre de la Actividad</option>
            <option value="Descripcion">Descripción</option>
            <option value="Hora_inicio">Hora de Inicio</option>
            <option value="Hora_final">Hora de Finalización</option>
            <option value="Nombre_seccion">Sección</option>
            <option value="Estado">Estado</option>
            <option value="Fecha">Fecha</option>
          </CFormSelect>
        </CCol>
  
        {/* Selector para cantidad de registros */}
        <CCol xs="12" md="4" className="text-md-end mt-2 mt-md-0">
          <CInputGroup style={{ width: 'auto', display: 'inline-flex' }}>
            <div className="d-inline-flex align-items-center">
              <span>Mostrar&nbsp;</span>
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
              <span>&nbsp;registros</span>
            </div>
          </CInputGroup>
        </CCol>
      </CRow>
  
      {/* Tabla de actividades */}
      <div
        className="table-container"
        style={{ height: '300px', overflowY: 'auto', marginBottom: '20px' }}
      >
        <CTable striped bordered hover>
          <CTableHead
            style={{ position: 'sticky', top: 0, zIndex: 1, backgroundColor: '#fff' }}
          >
            <CTableRow>
              <CTableHeaderCell style={{ width: '5%' }} className="text-center">
                #
              </CTableHeaderCell>
              <CTableHeaderCell style={{ width: '25%', wordBreak: 'break-word' }}>
                Actividad
              </CTableHeaderCell>
              <CTableHeaderCell style={{ width: '30%', wordBreak: 'break-word' }}>
                Descripción
              </CTableHeaderCell>
              <CTableHeaderCell style={{ width: '10%' }} className="text-center"> Inicio </CTableHeaderCell>
              <CTableHeaderCell style={{ width: '10%' }} className="text-center"> Finalización </CTableHeaderCell>
              <CTableHeaderCell style={{ width: '20%' }} className="text-center"> Sección y Grado </CTableHeaderCell>
              <CTableHeaderCell style={{ width: '10%' }} className="text-center"> Fecha </CTableHeaderCell>
              <CTableHeaderCell style={{ width: '10%' }} className="text-center"> Estado </CTableHeaderCell>
              <CTableHeaderCell style={{ width: '5%' }} className="text-center"> Acciones </CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {currentRecords.map((actividad, index) => {
              const rowIndex = indexOfFirstRecord + index + 1;
              const seccion = secciones.find(
                (s) => s.Nombre_seccion === actividad.Nombre_seccion
              );
              return (
                <CTableRow key={actividad.Cod_actividades_extracurriculares}>
                  {/* Columna de índice ordenado */}
                  <CTableDataCell className="text-center">{rowIndex}</CTableDataCell>
                  {/* Columna de actividad con espacio horizontal definido */}
                  <CTableDataCell
                    style={{
                      textTransform: 'uppercase',
                      wordBreak: 'break-word',
                      width: '15%', // Ancho definido
                    }}
                  >
                    {actividad.Nombre_actividad}
                  </CTableDataCell>
                  <CTableDataCell
                    style={{
                      textTransform: 'uppercase',
                      wordBreak: 'break-word',
                      width: '30%', // Ancho definido
                    }}
                  >
                    {actividad.Descripcion}
                  </CTableDataCell>
                  <CTableDataCell className="text-center">
                    {actividad.Hora_inicio}
                  </CTableDataCell>
                  <CTableDataCell className="text-center">
                    {actividad.Hora_final}
                  </CTableDataCell>
                  <CTableDataCell
                    className="text-center"
                    style={{ textTransform: 'uppercase' }}
                  >
                    {seccion ? seccion.SeccionGrado : 'Sección no encontrada'}
                  </CTableDataCell>
                  <CTableDataCell className="text-center">
                    {new Date(actividad.Fecha).toLocaleDateString('es-ES')}
                  </CTableDataCell>
                  {/* Columna de Estado */}
                  <CTableDataCell className="text-center">{actividad.Estado}</CTableDataCell>
                  <CTableDataCell className="text-center">
                    <div className="d-flex justify-content-center">
                      {/* Botón Actualizar */}
                      <CButton
                        color="warning"
                        size="sm" // Tamaño más compacto
                        onClick={() => openUpdateModal(actividad)}
                        style={{ marginRight: '5px', padding: '2px 8px', fontSize: '12px' }} // Ajuste de padding y texto pequeño
                      >
                        <CIcon icon={cilPen} style={{ fontSize: '12px' }} /> {/* Ícono más pequeño */}
                      </CButton>

                      {/* Botón Eliminar */}
                      <CButton
                        color="danger"
                        size="sm" // Tamaño más compacto
                        onClick={() => openDeleteModal(actividad)}
                        style={{ marginRight: '5px', padding: '2px 8px', fontSize: '12px' }} // Ajuste de padding y texto pequeño
                      >
                        <CIcon icon={cilTrash} style={{ fontSize: '12px' }} /> {/* Ícono más pequeño */}
                      </CButton>

                      {/* Botón Cancelar / Activar */}
                      <CButton
                        color={actividad.Estado === 'Activa' ? 'danger' : 'success'}
                        size="sm" // Tamaño más compacto
                        onClick={() =>
                          handleEstadoChange(
                            actividad.Cod_actividades_extracurriculares,
                            actividad.Estado
                          )
                        }
                        style={{ padding: '2px 8px', fontSize: '12px', textAlign: 'center' }} // Ajuste de padding y texto pequeño
                      >
                        <CIcon
                          icon={actividad.Estado === 'Activa' ? cilBan : cilCheckCircle}
                          style={{ fontSize: '12px', marginRight: '5px' }}
                        />
                        {actividad.Estado === 'Activa' ? 'Cancelar' : 'Activar'}
                      </CButton>
                    </div>
                  </CTableDataCell>
                </CTableRow>
              );
            })}
          </CTableBody>
        </CTable>
      </div>

  
      {/* Paginación Fija */}
      <div
        className="pagination-container"
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: '20px',
        }}
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
            disabled={
              currentPage === Math.ceil(filteredActividades.length / recordsPerPage)
            } // Desactiva si es la última página
            onClick={() => paginate(currentPage + 1)} // Páginas siguientes
          >
            Siguiente
          </CButton>
        </CPagination>
        <span style={{ marginLeft: '10px' }}>
          Página {currentPage} de {Math.ceil(filteredActividades.length / recordsPerPage)}
        </span>
      </div>
  
      {/* Modal Crear Actividad */}
      <CModal visible={modalVisible} backdrop="static">
        <CModalHeader closeButton={false}>
          <CModalTitle>Crear Nueva Actividad</CModalTitle>
          <CButton className="btn-close" aria-label="Close" onClick={() => handleCloseModal(setModalVisible, resetNuevaActividad, nuevaActividad)} />
        </CModalHeader>
        <CModalBody>
          <CForm>
            {/* Campo para nombre de la actividad */}
            <CInputGroup className="mb-3">
              <CInputGroupText>Nombre de la Actividad</CInputGroupText>
              <CFormInput
                value={nuevaActividad.Nombre}
                maxLength={50}
                style={{ textTransform: 'uppercase' }}
                onPaste={disableCopyPaste}
                onCopy={disableCopyPaste}
                onChange={(e) => {
                  const valor = e.target.value;
                  if (!permitirCaracteresValidos(valor)) {
                    swal.fire({
                      icon: 'warning', title: 'Caracteres no permitidos', text: 'Solo se permiten letras, números y los caracteres , . : ; ¿ ?',
                    });
                    return;
                  }
                  if (tieneLetrasRepetidas(valor)) {
                    swal.fire({
                      icon: 'warning', title: 'Repetición de letras', text: 'No se permite que la misma letra o espacio se repitan consecutivamente.',
                    });
                    return;
                  }
                  setNuevaActividad({ ...nuevaActividad, Nombre: valor });
                }}
              />
            </CInputGroup>
  
            {/* Campo para descripción */}
            <CInputGroup className="mb-3">
              <CInputGroupText>Descripción</CInputGroupText>
              <CFormInput
                value={nuevaActividad.Descripcion}
                maxLength={250}
                style={{ textTransform: 'uppercase' }}
                onPaste={disableCopyPaste}
                onCopy={disableCopyPaste}
                onChange={(e) => {
                  const valor = e.target.value;
                  if (!permitirCaracteresValidos(valor)) {
                    swal.fire({
                      icon: 'warning', title: 'Caracteres no permitidos', text: 'Solo se permiten letras, números y los caracteres , . : ; ¿ ?',
                    });
                    return;
                  }
                  if (tieneLetrasRepetidas(valor)) {
                    swal.fire({
                      icon: 'warning', title: 'Repetición de letras', text: 'No se permite que la misma letra o espacio se repitan consecutivamente.',
                    });
                    return;
                  }
                  setNuevaActividad({ ...nuevaActividad, Descripcion: valor });
                }}
              />
            </CInputGroup>
  
            {/* Campos para horas de inicio y finalización */}
            <CInputGroup className="mb-3">
              <CInputGroupText>Hora de inicio</CInputGroupText>
              <CFormInput
                type="time"
                value={nuevaActividad.Hora_inicio}
                onPaste={disableCopyPaste}
                onCopy={disableCopyPaste}
                onChange={(e) => setNuevaActividad({ ...nuevaActividad, Hora_inicio: e.target.value })}
              />
            </CInputGroup>
            <CInputGroup className="mb-3">
              <CInputGroupText>Hora de finalización</CInputGroupText>
              <CFormInput
                type="time"
                value={nuevaActividad.Hora_final}
                onPaste={disableCopyPaste}
                onCopy={disableCopyPaste}
                onChange={(e) => setNuevaActividad({ ...nuevaActividad, Hora_final: e.target.value })}
              />
            </CInputGroup>
  
            {/* Campo para selección de sección y grado */}
            <CInputGroup className="mb-3">
              <CInputGroupText>Sección y Grado</CInputGroupText>
              <CFormSelect
                value={nuevaActividad.Nombre_seccion}
                onChange={(e) => setNuevaActividad({ ...nuevaActividad, Nombre_seccion: e.target.value })}
              >
                <option value="">Seleccione una sección y grado</option>
                {secciones.map((seccion) => (
                  <option key={seccion.Cod_secciones} value={seccion.Nombre_seccion}>
                    {`${seccion.Nombre_seccion} - ${seccion.Nombre_grado}`}
                  </option>
                ))}
              </CFormSelect>
            </CInputGroup>
  
            {/* Campo para fecha */}
            <CInputGroup className="mb-3">
              <CInputGroupText>Fecha</CInputGroupText>
              <CFormInput
                type="date"
                value={nuevaActividad.Fecha}
                min={fechaMinima}
                max={fechaMaxima}
                onPaste={disableCopyPaste}
                onCopy={disableCopyPaste}
                onChange={(e) => {
                  const fechaSeleccionada = e.target.value;
                  if (fechaSeleccionada < fechaMinima || fechaSeleccionada > fechaMaxima) {
                    swal.fire({
                      icon: 'warning', title: 'Fecha fuera de rango', text: `La fecha debe estar entre ${fechaMinima} y ${fechaMaxima}.`,
                    });
                    return;
                  }
                  setNuevaActividad({ ...nuevaActividad, Fecha: fechaSeleccionada });
                }}
              />
            </CInputGroup>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => handleCloseModal(setModalVisible, resetNuevaActividad, nuevaActividad)}>
            Cancelar
          </CButton>
          <CButton style={{ backgroundColor: '#4B6251', color: 'white' }} onClick={handleCreateActividad}>
            <CIcon icon={cilSave} style={{ marginRight: '5px' }} /> Guardar
          </CButton>
        </CModalFooter>
      </CModal>
  
      {/* Modal Actualizar Actividad */}
      <CModal visible={modalUpdateVisible} backdrop="static">
        <CModalHeader closeButton={false}>
          <CModalTitle>Actualizar Actividad</CModalTitle>
          <CButton className="btn-close" aria-label="Close" onClick={() => handleCloseModal(setModalUpdateVisible, resetActividadToUpdate, actividadToUpdate)} />
        </CModalHeader>
        <CModalBody>
          <CForm>
            {/* Campos para actualizar actividad */}
            <CInputGroup className="mb-3">
              <CInputGroupText>Identificador</CInputGroupText>
              <CFormInput value={actividadToUpdate.Cod_actividades_extracurriculares} readOnly />
            </CInputGroup>
  
            {/* Campo para actualizar nombre de la actividad */}
            <CInputGroup className="mb-3">
              <CInputGroupText>Nombre de la Actividad</CInputGroupText>
              <CFormInput
                value={actividadToUpdate.Nombre_actividad}
                maxLength={50}
                style={{ textTransform: 'uppercase' }}
                onPaste={disableCopyPaste}
                onCopy={disableCopyPaste}
                onChange={(e) => {
                  const valor = e.target.value;
                  if (!permitirCaracteresValidos(valor)) {
                    swal.fire({
                      icon: 'warning', title: 'Caracteres no permitidos', text: 'Solo se permiten letras, números y los caracteres , . : ; ¿ ?',
                    });
                    return;
                  }
                  if (tieneLetrasRepetidas(valor)) {
                    swal.fire({
                      icon: 'warning', title: 'Repetición de letras', text: 'No se permite que la misma letra o espacio se repitan consecutivamente.',
                    });
                    return;
                  }
                  setActividadToUpdate({ ...actividadToUpdate, Nombre_actividad: valor });
                }}
              />
            </CInputGroup>
  
            {/* Campo para actualizar descripción */}
            <CInputGroup className="mb-3">
              <CInputGroupText>Descripción</CInputGroupText>
              <CFormInput
                value={actividadToUpdate.Descripcion}
                maxLength={250}
                style={{ textTransform: 'uppercase' }}
                onPaste={disableCopyPaste}
                onCopy={disableCopyPaste}
                onChange={(e) => {
                  const valor = e.target.value;
                  if (!permitirCaracteresValidos(valor)) {
                    swal.fire({
                      icon: 'warning', title: 'Caracteres no permitidos', text: 'Solo se permiten letras, números y los caracteres , . : ; ¿ ?',
                    });
                    return;
                  }
                  if (tieneLetrasRepetidas(valor)) {
                    swal.fire({
                      icon: 'warning', title: 'Repetición de letras', text: 'No se permite que la misma letra o espacio se repitan consecutivamente.',
                    });
                    return;
                  }
                  setActividadToUpdate({ ...actividadToUpdate, Descripcion: valor });
                }}
              />
            </CInputGroup>
  
            {/* Campos para actualizar hora de inicio y finalización */}
            <CInputGroup className="mb-3">
              <CInputGroupText>Hora de inicio</CInputGroupText>
              <CFormInput
                type="time"
                value={actividadToUpdate.Hora_inicio}
                onPaste={disableCopyPaste}
                onCopy={disableCopyPaste}
                onChange={(e) => setActividadToUpdate({ ...actividadToUpdate, Hora_inicio: e.target.value })}
              />
            </CInputGroup>
            <CInputGroup className="mb-3">
              <CInputGroupText>Hora de finalización</CInputGroupText>
              <CFormInput
                type="time"
                value={actividadToUpdate.Hora_final}
                onPaste={disableCopyPaste}
                onCopy={disableCopyPaste}
                onChange={(e) => setActividadToUpdate({ ...actividadToUpdate, Hora_final: e.target.value })}
              />
            </CInputGroup>
  
            {/* Campo para seleccionar sección y grado */}
            <CInputGroup className="mb-3">
              <CInputGroupText>Sección y Grado</CInputGroupText>
              <CFormSelect
                value={actividadToUpdate.Nombre_seccion}
                onChange={(e) => setActividadToUpdate({ ...actividadToUpdate, Nombre_seccion: e.target.value })}
              >
                <option value="">Seleccione una sección y grado</option>
                {secciones.map((seccion) => (
                  <option key={seccion.Cod_secciones} value={seccion.Nombre_seccion}>
                    {`${seccion.Nombre_seccion} - ${seccion.Nombre_grado}`}
                  </option>
                ))}
              </CFormSelect>
            </CInputGroup>
  
            {/* Campo para actualizar fecha */}
            <CInputGroup className="mb-3">
              <CInputGroupText>Fecha</CInputGroupText>
              <CFormInput
                type="date"
                value={actividadToUpdate.Fecha || ''}
                onPaste={disableCopyPaste}
                onCopy={disableCopyPaste}
                onChange={(e) => setActividadToUpdate({ ...actividadToUpdate, Fecha: e.target.value })}
              />
            </CInputGroup>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => handleCloseModal(setModalUpdateVisible, resetActividadToUpdate, actividadToUpdate)}>
            Cancelar
          </CButton>
          <CButton style={{ backgroundColor: '#F9B64E', color: 'white' }} onClick={handleUpdateActividad}>
            <CIcon icon={cilPen} style={{ marginRight: '5px' }} /> Actualizar
          </CButton>
        </CModalFooter>
      </CModal>
  
      {/* Modal Eliminar Actividad */}
      <CModal visible={modalDeleteVisible} onClose={() => setModalDeleteVisible(false)} backdrop="static">
        <CModalHeader>
          <CModalTitle>Confirmar Eliminación</CModalTitle>
        </CModalHeader>
        <CModalBody>
          ¿Estás seguro de que deseas eliminar la actividad: "{actividadToDelete.Nombre_actividad}"?
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setModalDeleteVisible(false)}>
            Cancelar
          </CButton>
          <CButton style={{ backgroundColor: '#E57368', color: 'white' }} onClick={handleDeleteActividad}>
            <CIcon icon={cilTrash} style={{ marginRight: '5px' }} /> Eliminar
          </CButton>
        </CModalFooter>
      </CModal>
    </CContainer>
  );
};
export default ListaActividades;


  
