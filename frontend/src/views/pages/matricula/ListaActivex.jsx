import React, { useState, useEffect } from 'react';
import CIcon from '@coreui/icons-react';
import { cilSearch, cilBrushAlt, cilPen, cilTrash, cilPlus, cilSave, cilDescription } from '@coreui/icons';
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

  // Función para obtener secciones de la base de datos
  const fetchSecciones = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/secciones/versecciones');
      if (!response.ok) throw new Error('Error al obtener las secciones');
      const data = await response.json();
      const seccionesConGrado = data.map((seccion) => ({
        ...seccion,
        SeccionGrado: `${seccion.Nombre_seccion} - ${seccion.Nombre_grado}`, // Concatenar sección y grado
      }));
      setSecciones(seccionesConGrado);
    } catch (error) {
      console.error(error);
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
    Swal.fire({
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
  
  // Exportar datos a Excel
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(actividades);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Actividades');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, 'reporte_actividades.xlsx');
  };

  // Exportar datos a PDF
  const generatePDF = () => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const img = new Image();
  img.src = logo; // Ruta del logo

  img.onload = () => {
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    // Función para añadir marca de agua
  const addWatermark = () => {
  const fontSize = 100; // Tamaño de fuente para la marca de agua
  const text = 'CONFIDENCIAL';

  doc.saveGraphicsState(); // Guardar estado gráfico actual
  doc.setGState(new doc.GState({ opacity: 0.15 })); // Ajustar opacidad
  doc.setTextColor(220, 53, 69); // Color rojo
  doc.setFontSize(fontSize); // Aplicar tamaño de fuente
  doc.setFont('helvetica', 'bold'); // Aplicar fuente

  // Ajustar la posición del texto para centrarlo mejor
  const adjustedX = pageWidth / 2 + 35; // Mover ligeramente a la derecha
  const adjustedY = pageHeight / 2 + 95; // Mover ligeramente hacia abajo

  // Agregar el texto inclinado
  doc.text(text, adjustedX, adjustedY, {
    angle: 40, // Inclinación a 45 grados
    align: 'center',
    renderingMode: 'fill',
  });

  doc.restoreGraphicsState(); // Restaurar estado gráfico original
  };
    // Insertar el logo
    doc.addImage(img, 'PNG', 10, 10, 45, 45);

    // Encabezado del reporte
    doc.setTextColor(22, 160, 133);
    doc.setFontSize(18);
    doc.text("SAINT PATRICK'S ACADEMY", pageWidth / 2, 20, { align: 'center' });
    doc.setFontSize(15);
    doc.text('Listado de Actividades Extracurriculares', pageWidth / 2, 30, { align: 'center' });

    // Detalles de la institución
    doc.setFontSize(10);
    doc.setTextColor(68, 68, 68);
    doc.text('Casa Club del periodista, Colonia del Periodista', pageWidth / 2, 40, { align: 'center' });
    doc.text('Teléfono: (504) 2234-8871', pageWidth / 2, 45, { align: 'center' });
    doc.text('Correo: info@saintpatrickacademy.edu', pageWidth / 2, 50, { align: 'center' });

    // Información adicional
    const usuario = localStorage.getItem('nombreUsuario') || 'Usuario del Sistema';
    doc.setFontSize(9);
    doc.text(`Generado por: ${usuario}`, 15, 60);
    //doc.text(`Fecha: ${new Date().toLocaleDateString('es-HN')}`, pageWidth - 15, 60, { align: 'right' });

    // Añadir marca de agua
    addWatermark();

    // Configuración de la tabla principal
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
        (index + 1 + (currentPage - 1) * recordsPerPage).toString(), // Índice
        (actividad.Nombre_actividad || 'Sin nombre').toUpperCase(),
        (actividad.Descripcion || 'Sin descripción').toUpperCase(),
        actividad.Hora_inicio.toUpperCase(),
        actividad.Hora_final.toUpperCase(),
        (seccion ? seccion.SeccionGrado : 'Sin sección').toUpperCase(),
        new Date(actividad.Fecha).toLocaleDateString('es-ES').toUpperCase(),
        (actividad.Estado || 'Desconocido').toUpperCase(),
      ];
    });
    
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 70,
      styles: {
        fontSize: 10,
        cellPadding: 4,
        textColor: [68, 68, 68],
      },
      headStyles: {
        fillColor: [22, 160, 133],
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: 'bold',
        halign: 'center', // Centra los encabezados
      },
      alternateRowStyles: {
        fillColor: [240, 248, 255],
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 15 }, // #
        1: { halign: 'left', cellWidth: 30 }, // Actividad
        2: { halign: 'left', cellWidth: 50 }, // Descripción
        3: { halign: 'center', cellWidth: 30 }, // Inicio
        4: { halign: 'center', cellWidth: 30 }, // Finalización
        5: { halign: 'center', cellWidth: 50 }, // Sección y Grado
        6: { halign: 'center', cellWidth: 30 }, // Fecha
        7: { halign: 'center', cellWidth: 30 }, // Estado
      },
      margin: { top: 10, bottom: 30 },
      didDrawPage: function (data) {
        addWatermark();
    
        // Añadir pie de página manual
        const totalPages = doc.internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(100);
          const date = new Date().toLocaleDateString('es-HN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          });
         doc.text(`Fecha de generación: ${date}`, 10, pageHeight - 10);
         doc.text(
         `Página ${i} de ${totalPages}`,
          pageWidth - 10,
          pageHeight - 10,
          { align: 'right' }
          );
        }
      },
    });
    
    // Guardar el PDF
    doc.save('Reporte_Actividades.pdf');
  };
  img.onerror = () => {
    Swal.fire('Error', 'No se pudo cargar el logo.', 'error');
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
          <h1 className="mb-0">Listado de Actividades Extracurriculares</h1>
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
              <CDropdownItem onClick={exportToExcel}>Descargar en Excel</CDropdownItem>
              <CDropdownItem onClick={generatePDF}>Descargar en PDF</CDropdownItem>
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
        style={{ height: '350px', overflowY: 'auto', marginBottom: '20px' }}
      >
        <CTable striped bordered hover>
          <CTableHead
            style={{ position: 'sticky', top: 0, zIndex: 1, backgroundColor: '#fff' }}
          >
            <CTableRow>
              <CTableHeaderCell style={{ width: '5%' }} className="text-center">
                #
              </CTableHeaderCell>
              <CTableHeaderCell style={{ width: '15%' }}>Actividad</CTableHeaderCell>
              <CTableHeaderCell style={{ width: '30%' }}>Descripción</CTableHeaderCell>
              <CTableHeaderCell style={{ width: '10%' }} className="text-center"> Inicio </CTableHeaderCell>
              <CTableHeaderCell style={{ width: '10%' }} className="text-center"> Finalización </CTableHeaderCell>
              <CTableHeaderCell style={{ width: '25%' }} className="text-center"> Sección y Grado </CTableHeaderCell>
              <CTableHeaderCell style={{ width: '10%' }} className="text-center"> Fecha </CTableHeaderCell>
              <CTableHeaderCell style={{ width: '10%' }} className="text-center"> Estado </CTableHeaderCell>
              <CTableHeaderCell style={{ width: '10%' }} className="text-center"> Acciones </CTableHeaderCell>
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
                  <CTableDataCell style={{ textTransform: 'uppercase' }}>
                    {actividad.Nombre_actividad}
                  </CTableDataCell>
                  <CTableDataCell
                    style={{ textTransform: 'uppercase', wordBreak: 'break-word' }}
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
                        onClick={() => openUpdateModal(actividad)}
                        style={{ marginRight: '5px' }}
                      >
                        <CIcon icon={cilPen} />
                      </CButton>
  
                      {/* Botón Eliminar */}
                      <CButton
                        color="danger"
                        onClick={() => openDeleteModal(actividad)}
                        style={{ marginRight: '5px' }}
                      >
                        <CIcon icon={cilTrash} />
                      </CButton>
  
                      {/* Botón Cambiar Estado */}
                      <CButton
                        color={actividad.Estado === 'Activa' ? 'danger' : 'success'}
                        onClick={() =>
                          handleEstadoChange(
                            actividad.Cod_actividades_extracurriculares,
                            actividad.Estado
                          )
                        }
                        style={{
                          width: '100px', // Fija el ancho de los botones
                          textAlign: 'center',
                        }}
                      >
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