import React, { useEffect, useState, useRef } from 'react';
import { CSidebarNav } from '@coreui/react';
import { CIcon } from '@coreui/icons-react';
import { cilSearch, cilBrushAlt, cilPen, cilTrash, cilPlus, cilSave, cilDescription } from '@coreui/icons';
import Swal from 'sweetalert2'; // Importa SweetAlert2
import {
  CButton,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CFormSelect
} from '@coreui/react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const ListaHistoriales = () => {
  const [historiales, setHistoriales] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalReportVisible, setModalReportVisible] = useState(false); // Modal de Reporte
  const [error, setError] = useState('');
  const [historialAEditar, setHistorialAEditar] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1); // Estado para la página actual
  const [itemsPerPage, setItemsPerPage] = useState(5); // Estado para los elementos por página
  const [Grados, setGrados] = useState([]);
  const [Instituto, setInstituto] = useState([]);
  const [Persona, setPersona] = useState([]);
  const [nuevoHistorial, setNuevoHistorial] = useState({
    Estudiante: 'Seleccione una opción',
    Grado: 'Seleccione una opción',
    Año_Academico: 'Seleccione una opción',
    Promedio_Anual: 0,
    Instituto: ''
  });
  
  useEffect(() => {
    fetchHistorial();
    fetchGrados();
    fetchInstituto();
    fetchPersonas();
  }, []);

  const fetchPersonas = async () => {
    try {
      const response = await fetch('http://74.50.68.87:4000/api/persona/verPersonas');
      const data = await response.json();
      console.log(data);
      setPersona(data);
    } catch (error) {
      console.error('Error al obtener los estudiantes: ', error);
    }
  };

  const fetchGrados = async () => {
    try {
      const response = await fetch('http://74.50.68.87:4000/api/grados/vergrados');
      const data = await response.json();
      console.log(data); // Verifica la respuesta en la consola
      setGrados(data); 
    } catch (error) {
      console.error('Error al obtener los grados:', error);
    }
  };

const fetchInstituto = async () => {
  try {
    const response = await fetch('http://74.50.68.87:4000/api/instituto/instituto');
    const data = await response.json();
    console.log(data); //verifica las respuestas en la consola
    setInstituto(data);
  } catch (error) {
    console.error('Error al obtener los institutos: ', error);
  }
};

  const fetchHistorial = async () => {
    try {
      const response = await fetch('http://74.50.68.87:4000/api/historialAcademico/gradosMatricula');
  
      if (!response.ok) {
        throw new Error('Error en la solicitud al servidor');
      }
  
      const data = await response.json();
  
      // Definir el orden esperado de los grados
      const orden = [
        'Primero', 'Segundo', 'Tercero', 'Cuarto', 'Quinto',
        'Sexto', 'Séptimo', 'Octavo', 'Noveno', 'Décimo',
        'Undécimo', 'Duodécimo'
      ];
  
      // Ordenar los grados según el orden especificado
      const gradosOrdenados = data.data.sort((a, b) => {
        return orden.indexOf(a.Nombre_grado) - orden.indexOf(b.Nombre_grado);
      });
  
      console.log(gradosOrdenados); // Mostrar los grados ordenados en consola
      setGradosMatricula(gradosOrdenados);
    } catch (error) {
      console.error('Error al obtener los grados:', error);
    }
  };
   
  const handleSave = () => {
    console.log("Datos que se están guardando:", nuevoHistorial);  // Verifica que los valores sean correctos.
    onSave(nuevoHistorial); // Llama la función para guardar el historial
  };  

  const fetchPersonasPorGrado = async (cod_grado) => {
    console.log("Fetching estudiantes para Cod_grado:", cod_grado);
    setLoading(true);
    setError(null);
  
    try {
      const response = await fetch(`http://74.50.68.87:4000/api/historialAcademico/gradosMatricula/${cod_grado}`);
      
      if (!response.ok) {
        throw new Error("Error al obtener las personas del grado");
      }
      
      const data = await response.json();
      console.log("Datos recibidos de la API:", data); // Asegúrate de que `data.data` contiene el array esperado
  
      if (data.success && Array.isArray(data.data)) {
        setEstudiantes(data.data); // Verifica que estás actualizando el estado correcto
      } else {
        console.warn("Formato de datos inesperado:", data);
        setEstudiantes([]);
      }
    } catch (err) {
      console.error("Error al cargar los datos:", err.message);
      setError("Error al cargar los datos: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClearSearch = () => {
    setSearchTerm(''); // Limpia el término de búsqueda
  };  
  
  const [recordsPerPage2, setRecordsPerPage2] = useState(5);
  const [searchTerm2, setSearchTerm2] = useState('');
  const [currentPage2, setCurrentPage2] = useState(1);

  const paginate2 = (pageNumber) => {
    if (pageNumber < 1) {
      pageNumber = 1; // No permitir números de página menores que 1
    }
    const totalPages = Math.ceil(filteredGrados.length / recordsPerPage2); // Calcula el total de páginas
    if (pageNumber > totalPages) {
      pageNumber = totalPages; // No permitir números de página mayores que el total de páginas
    }
    setCurrentPage2(pageNumber); // Establece la página actual
  };  

  const resetForm = () => {
    setNuevoHistorial({
      Cod_persona: '',
      Cod_grado: '',
      Año_Academico: '',
      Promedio_Anual: '',
      Cod_Instituto: '',
      Observacion: ''
    });
    setError('');
  };

  

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
  const filteredGrados= GradosMatricula.filter((grados) =>
    grados.Nombre_grado.toLowerCase().includes(searchTerm2.toLowerCase())
  );
  
  // Lógica de paginación
  const indexOfLastRecord2 = currentPage2 * recordsPerPage2;
  const indexOfFirstRecord2 = indexOfLastRecord2 - recordsPerPage2;
  const currentRecords2 = filteredGrados.slice(indexOfFirstRecord2, indexOfLastRecord2);

  const [recordsPerPage3, setRecordsPerPage3] = useState(5);
  const [searchTerm3, setSearchTerm3] = useState('');
  const [currentPage3, setCurrentPage3] = useState(1);

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
  const filteredEstudiantes = Estudiantes.filter((persona) =>
    Object.values({
      Nombre_persona: persona.Nombre_persona,
      SNombre_persona: persona.SNombre_persona,
      PApellido_persona: persona.PApellido_persona,
      SApellido_persona: persona.SApellido_persona,
    }).some((value) =>
      value?.toLowerCase().includes(searchTerm3.toLowerCase())
    )
  );

  // Lógica de paginación
  const indexOfLastRecord3= currentPage3 * recordsPerPage3;
  const indexOfFirstRecord3 = indexOfLastRecord3 - recordsPerPage3;


  const handleVerHistoriales = (cod_Persona) => {
    console.log(`Mostrando historiales para persona con código: ${cod_Persona}`);
    setCurrentView("historiales"); // Cambiar a la vista de historiales
    fetchHistorialPorPersona(cod_Persona); // Cargar los historiales de esa persona
  };  

  const fetchHistorialPorPersona = async (cod_persona) => {
    try {
      if (!cod_persona) {
        console.error('El código de persona es obligatorio para buscar historiales');
        return;
      }
  
      // Limpiar los historiales previos antes de cargar los nuevos
      setHistoriales([]);
  
      // Hacer la solicitud para obtener los historiales del nuevo estudiante
      const response = await fetch(`http://74.50.68.87:4000/api/historialAcademico/historiales/persona/${cod_persona}`);
      const data = await response.json();
  
      // Renumera los historiales secuencialmente
      const historialesNumerados = data.map((historial, index) => ({
        ...historial,
      }));
  
      setHistoriales(historialesNumerados);
    } catch (error) {
      console.error('Error al obtener los historiales:', error);
    }
  };

  const filteredHistoriales = historiales.filter(historial => {
    // Convertir Cod_estado a texto
    const estadoTexto = 
      historial.Cod_estado === 1 ? "APROBADO" :
      historial.Cod_estado === 2 ? "REPROBADO" : "otro estado";
  
    return (
      historial.Cod_historial_academico.toString().includes(searchTerm) ||
      historial.Estudiante.toLowerCase().trim().includes(searchTerm.toLowerCase().trim()) ||
      historial.Grado.toLowerCase().includes(searchTerm.toLowerCase()) ||
      historial.Año_Academico.toString().includes(searchTerm) ||
      historial.Promedio_Anual.toString().includes(searchTerm) ||
      historial.Instituto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      estadoTexto.includes(searchTerm.toLowerCase())
    );
  });
  

// Paginación: calcular los índices de los elementos que se van a mostrar
const indexOfLastItem = currentPage * itemsPerPage;
const indexOfFirstItem = indexOfLastItem - itemsPerPage;
const currentHistoriales = filteredHistoriales.slice(indexOfFirstItem, indexOfLastItem);

const totalPages = Math.ceil(filteredHistoriales.length / itemsPerPage);

const handleInputChange = (e, field) => {
  let value = e.target.value;

  // Validación para el campo Promedio_Anual
  if (field === 'Promedio_Anual') {
      const validNumber = /^\d*\.?\d*$/; // Solo permite números y un punto decimal
      if (value && !validNumber.test(value)) {
          Swal.fire({
            icon: 'error',
            title: 'Formato inválido',
            text: 'Por favor ingrese un valor numérico válido, incluyendo un punto decimal.',
            confirmButtonColor: '#6f8173', // Color del botón
          });
          return;
      }

    // Validar que el valor esté entre 0 y 100
    if (value !== '' && (parseFloat(value) < 0 || parseFloat(value) > 100)) {
      Swal.fire({
        icon: 'error',
        title: 'Rango inválido',
        text: 'El Promedio Anual debe estar entre 0 y 100.',
        confirmButtonColor: '#6f8173',
      });
      return;
    }
  }
  setError('');
  setNuevoHistorial({ ...nuevoHistorial, [field]: value });
};

const HistorialesSearch = () => {
const [searchTerm, setSearchTerm] = useState(''); // Definimos el estado para el término de búsqueda
};



const validateFields = () => {
  const { Estudiante, Grado, Año_Academico, Promedio_Anual, Instituto } = nuevoHistorial;
  if (!Estudiante ||!Grado || !Año_Academico || !Promedio_Anual || !Instituto) {
    setError('Por favor, complete todos los campos.');
    return false;
  }
  setError('');
  return true;
};  

const handleCreateHistorial = async () => {
  if (!validateFields()) return;

  const promedio = parseFloat(nuevoHistorial.Promedio_Anual);
  const codEstado = promedio > 69.99 ? 1 : 2;

  const historialConEstado = { ...nuevoHistorial, Cod_estado: codEstado };

  try {
    const response = await fetch('http://74.50.68.87:4000/api/historialAcademico/crearhistorial', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(historialConEstado),
    });

    if (response.ok) {
      await fetchHistorial(); // Recarga los historiales
      setCurrentPage(1); // Restablece la página actual a la primera
      resetForm();
      setModalVisible(false);
    } else {
      const errorData = await response.json();
      setError('Error al crear el historial: ' + errorData.message);
    }
  } catch (error) {
    setError('Error al crear el historial: ' + error.message);
  }
};

const getEstadoTexto = (cod_estado) => {
  switch (cod_estado) {
    case 1:
      return 'APROBADO';
    case 2:
      return 'REPROBADO';
  }
};

const handleEditHistorial = (historial) => {
  setHistorialAEditar(historial);
  setNuevoHistorial({ ...historial }); // Copia el historial a nuevoHistorial
  setModalVisible(true);
};

const handleUpdateHistorial = async () => {
  if (error || !validateFields()) return;

  // Lógica para determinar el Cod_estado basado en el Promedio_Anual
  const promedio = parseFloat(nuevoHistorial.Promedio_Anual);
  const codEstado = promedio >= 70.00 ? 1 : 2; // O el valor que corresponda

  // Actualiza el Cod_estado en nuevoHistorial
  const historialActualizado = { ...nuevoHistorial, Cod_estado: codEstado };

  try {
    const response = await fetch('http://74.50.68.87:4000/api/historialAcademico/actualizarhistorial', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(historialActualizado),
    });

    if (response.ok) {
      fetchHistorial();
      setModalVisible(false);
      setHistorialAEditar(null);
      resetForm(); // Llamar a la función para reiniciar el formulario
    } else {
      const errorData = await response.json();
      console.error('Error al actualizar el historial:', errorData);
    }
  } catch (error) {
    console.error('Error al actualizar el historial:', error);
  }
};


const handleCancelModal = () => {
  resetForm(); // Reiniciar el formulario al cerrar el modal
  setModalVisible(false);
};

  const handleDeleteHistorial = async (id) => {
    // Mostrar el aviso de confirmación con SweetAlert
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Este historial se eliminará permanentemente.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'No, cancelar',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      allowOutsideClick: false, // Evita que el modal se cierre al hacer clic fuera
    });

    // Si el usuario confirma, proceder con la eliminación
    if (result.isConfirmed) {
      try {
        const response = await fetch(`http://74.50.68.87:4000/api/historialAcademico/eliminarhistorial`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ Cod_historial_academico: id }),
        });

        if (response.ok) {
          Swal.fire('Eliminado', 'El historial ha sido eliminado correctamente.', 'success');
          fetchHistorial(); // Llamar a la función para actualizar los datos
        } else {
          const errorData = await response.json();
          console.error('Error al eliminar el historial:', errorData);
          Swal.fire('Error', 'Hubo un error al eliminar el historial.', 'error');
        }
      } catch (error) {
        console.error('Error al eliminar el historial:', error);
        Swal.fire('Error', 'Hubo un error al eliminar el historial.', 'error');
      }
    }
  };

  const generarAnios = (anioInicio = 1901) => {
    const anios = ['Seleccione una opción'];
    const anioActual = new Date().getFullYear();
    
    for (let i = anioActual; i >= anioInicio; i--) {
      anios.push(i.toString());
    }
    return anios;
  };

  const ordenGrados = [
    'PRIMER GRADO',
    'SEGUNDO GRADO',
    'TERCER GRADO',
    'CUARTO GRADO',
    'QUINTO GRADO',
    'SEXTO GRADO',
    'SÉPTIMO GRADO',
    'OCTAVO GRADO',
    'NOVENO GRADO',
    'DÉCIMO',
    'UNDÉCIMO',
    'DUODÉCIMO',
  ];

    // Ordenar grados antes de renderizar
    const gradosOrdenados = [...currentRecords2].sort((a, b) => {
      return ordenGrados.indexOf(a.Nombre_grado) - ordenGrados.indexOf(b.Nombre_grado);
    });

  const generarReporteGradosPDF = () => {
    // Validar que haya datos en la lista de grados académicos
    if (!listaGradosAcademicos || listaGradosAcademicos.length === 0) {
      Swal.fire({
        icon: 'info',
        title: 'Lista vacía',
        text: 'No hay grados académicos disponibles para generar el reporte.',
        confirmButtonText: 'Entendido',
      });
      return; // Salir de la función si no hay datos
    }
  
    const doc = new jsPDF();
    const img = new Image();
    img.src = logo;
  
    // Obtener la fecha del primer grado académico (opcional)
    const fechaRegistro = listaGradosAcademicos.length > 0 ? 'Fecha del primer grado académico: ' + new Date().toLocaleDateString() : 'sin_fecha';
  
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
      doc.text('Reporte de Grados Académicos', doc.internal.pageSize.width / 2, yPosition, { align: 'center' });
  
      yPosition += 10; // Espaciado entre subtítulo y detalles
  
      // Información adicional
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0); // Negro para el texto informativo
      doc.text(`Fecha de generación: ${new Date().toLocaleDateString()}`, doc.internal.pageSize.width / 2, yPosition, { align: 'center' });
  
      yPosition += 8; // Espaciado entre detalles y tabla
  
      // Información de contacto
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
  
      yPosition += 6; // Espaciado después de la línea divisoria
  
      // Configuración para la tabla
      const pageHeight = doc.internal.pageSize.height; // Altura de la página
      let pageNumber = 1; // Página inicial
  
      // Agregar tabla con auto-paginación
      doc.autoTable({
        startY: yPosition + 4,
        head: [['#', 'Grado Académico']],
        body: listaGradosAcademicos.map((grado, index) => [
          index + 1,
          grado.Nombre_grado,
        ]),
        headStyles: {
          fillColor: [0, 102, 51],
          textColor: [255, 255, 255],
          fontSize: 10,
        },
        styles: {
          fontSize: 10,
          cellPadding: 3,
          halign: 'center',
        },
        columnStyles: {
          0: { cellWidth: 'auto' }, // Columna '#' se ajusta automáticamente
          1: { cellWidth: 'auto' }, // Columna 'Grado Académico' se ajusta automáticamente
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

  const generarReporteEstudiantesPDF = () => {
    //Validar que haya datos en la lista de Estdiantes
    if (!listaEstudiantes || listaEstudiantes.length === 0) {
      Swal.fire({
        icon: 'info',
        title: 'Lista vacía',
        text: 'No hay estudiantes disponibles para generar el reporte.',
        confirmButtonText: 'Entendido',
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
      doc.text('Reporte de Estudiantes por grado', doc.internal.pageSize.width / 2, yPosition, { align: 'center' });
  
      yPosition += 10; // Espaciado entre subtítulo y detalles
  
      // Información adicional
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0); // Negro para el texto informativo
      doc.text(`Fecha de generación: ${new Date().toLocaleDateString()}`, doc.internal.pageSize.width / 2, yPosition, { align: 'center' });
  
      yPosition += 8; // Espaciado entre detalles y tabla
  
      // Información de contacto
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
  
      yPosition += 6; // Espaciado después de la línea divisoria
  
      // Configuración para la tabla
      const pageHeight = doc.internal.pageSize.height; // Altura de la página
      let pageNumber = 1; // Página inicial

          // Agregar tabla con auto-paginación
      doc.autoTable({
      startY: yPosition + 4,
      head: [['#', 'Estudiante']],
      body: listaEstudiantes.map((estudiante, index) => [
        index + 1,
        estudiante.NombreCompletoEstudiante,
      ]),
      headStyles: {
        fillColor: [0, 102, 51],
        textColor: [255, 255, 255],
        fontSize: 10,
      },
      styles: {
        fontSize: 10,
        cellPadding: 3,
        halign: 'center',
      },
      columnStyles: {
        0: { cellWidth: 'auto' }, // Columna '#' se ajusta automáticamente
        1: { cellWidth: 'auto' }, // Columna 'Grado Académico' se ajusta automáticamente
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

  const generarReporteHistorialesPDF = () => {
    //Validar que haya datos en la lista de Historiales
    if (!listaHistoriales || listaHistoriales.length === 0) {
      Swal.fire({
        icon: 'info',
        title: 'Lista vacía',
        text: 'No hay historiales disponibles para generar el reporte.',
        confirmButtonText: 'Entendido',
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
    doc.text('Reporte de Historiales Académicos', doc.internal.pageSize.width / 2, yPosition, { align: 'center' });

    yPosition += 10; // Espaciado entre subtítulo y detalles

    // Información adicional
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0); // Negro para el texto informativo
    doc.text(`Fecha de generación: ${new Date().toLocaleDateString()}`, doc.internal.pageSize.width / 2, yPosition, { align: 'center' });

    yPosition += 8; // Espaciado entre detalles y tabla

    // Información de contacto
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

    yPosition += 6; // Espaciado después de la línea divisoria

    // Configuración para la tabla
    const pageHeight = doc.internal.pageSize.height; // Altura de la página
    let pageNumber = 1; // Página inicial

    // Agregar tabla con auto-paginación
    doc.autoTable({
      startY: yPosition + 4,
      head: [['#', 'Estado', 'Estudiante', 'Grado', 'Año Académico', 'Promedio Anual', 'Fecha De Registro', 'Instituto', 'Observaciones']],
      body: listaHistoriales.map((historial, index) => [
        index + 1,
        historial.Cod_historial_academico,
        historial.Cod_estado,
        historial.Estudiante,
        historial.Grado,
        historial.Año_Academico,
        historial.Promedio_Anual,
        new Date(historial.Fecha_Registro).toLocaleDateString('es-ES'),
        historial.Instituto,
        historial.Observacion
      ]),
      headStyles: {
        fillColor: [0, 102, 51],
        textColor: [255, 255, 255],
        fontSize: 10,
      },
      styles: {
        fontSize: 10,
        cellPadding: 3,
        halign: 'center',
      },
      columnStyles: {
        0: { cellWidth: 'auto' }, // Columna '#' se ajusta automáticamente
        1: { cellWidth: 'auto' }, // Columna 'Grado Académico' se ajusta automáticamente
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

  const generarReporteGradosExcel = () => {
    // Validar que haya datos en la tabla
    if (!listaGradosAcademicos || listaGradosAcademicos.length === 0) {
      Swal.fire({
        icon: 'info',
        title: 'Tabla vacía',
        text: 'No hay datos disponibles para generar el reporte excel.',
        confirmButtonText: 'Entendido',
      });
      return; // Salir de la función si no hay datos
    }
  
    // Crear los encabezados con la sección y la fecha de generación
    const encabezados = [
      ["Saint Patrick's Academy"],  // Mejorado el nombre con apóstrofe correcto
      ["Reporte de Grados Académicos"],    // Título claro
      [
        `Grado: ${Nombre_grado || 'No especificada'}`,  // Asegurarse de que siempre haya un valor
        `Fecha de generación: ${new Date().toLocaleDateString()}`,    // Fecha en formato amigable
        `Fecha de registro: ${fechaLimpia || 'Sin fecha'}`            // Mostrar la fecha limpia o 'Sin fecha'
      ],
      [], // Espacio en blanco
      ["#", "Grado"] // Encabezado de la tabla de datos
    ];
  
    // Crear filas con asistencias filtradas
    const filas = listaGradosAcademicos.map((grado, index) => [
      index + 1,
      grado.Nombre_grado  
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
  
    // Estilo de los encabezados de la tabla
    for (let col = 0; col < 4; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 4, c: col }); // Encabezados de la tabla en la fila 5
      if (hojaDeTrabajo[cellAddress]) {
        hojaDeTrabajo[cellAddress].s = {
          font: { bold: true, sz: 12, color: { rgb: "FFFFFF" } },
          fill: { fgColor: { rgb: "2D6A4F" } },
          alignment: { horizontal: "center", vertical: "center" }
        };
      }
    }
  
    // Ajustar el ancho de columnas automáticamente
    const ajusteColumnas = [
      { wpx: 250 },  // Número de fila
      { wpx: 250 }, // Grado
    ];
  
    hojaDeTrabajo['!cols'] = ajusteColumnas;
  
    // Crear el libro de trabajo
    const libroDeTrabajo = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libroDeTrabajo, hojaDeTrabajo, "Reporte de Grados Académicos");
  
    // Guardar el archivo Excel con un nombre personalizado
    const nombreArchivo = `${Reporte_Grados || 'No_especificada'}_${fechaLimpia || 'sin_fecha'}.xlsx`;
    
    XLSX.writeFile(libroDeTrabajo, nombreArchivo);
  };

  const generarReporteEstudiantesExcel = () => {
    // Validar que haya datos en la tabla
    if (!listaEstudiantes || listaEstudiantes.length === 0) {
      Swal.fire({
        icon: 'info',
        title: 'Tabla vacía',
        text: 'No hay datos disponibles para generar el reporte excel.',
        confirmButtonText: 'Entendido',
      });
      return; // Salir de la función si no hay datos
    }
  
    // Crear los encabezados con la sección y la fecha de generación
    const encabezados = [
      ["Saint Patrick's Academy"],  // Mejorado el nombre con apóstrofe correcto
      ["Reporte de Estudiantes"],    // Título claro
      [
        `Estudiante: ${NombreCompletoEstudiante || 'No especificada'}`,
        `Fecha de generación: ${new Date().toLocaleDateString()}`,    // Fecha en formato amigable
        `Fecha de registro: ${fechaLimpia || 'Sin fecha'}`            // Mostrar la fecha limpia o 'Sin fecha'
      ],
      [], // Espacio en blanco
      ["#", "Estudiante"] // Encabezado de la tabla de datos
    ];
  
    // Crear filas con asistencias filtradas
    const filas = listaEstudiantes.map((grado, index) => [
      index + 1,
      grado.NombreCompletoEstudiante  
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
  
    // Estilo de los encabezados de la tabla
    for (let col = 0; col < 4; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 4, c: col }); // Encabezados de la tabla en la fila 5
      if (hojaDeTrabajo[cellAddress]) {
        hojaDeTrabajo[cellAddress].s = {
          font: { bold: true, sz: 12, color: { rgb: "FFFFFF" } },
          fill: { fgColor: { rgb: "2D6A4F" } },
          alignment: { horizontal: "center", vertical: "center" }
        };
      }
    }
  
    // Ajustar el ancho de columnas automáticamente
    const ajusteColumnas = [
      { wpx: 250 },  // Número de fila
      { wpx: 250 }, // Estudiante
    ];
  
    hojaDeTrabajo['!cols'] = ajusteColumnas;
  
    // Crear el libro de trabajo
    const libroDeTrabajo = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libroDeTrabajo, hojaDeTrabajo, "Reporte de Estudiantes");
  
    // Guardar el archivo Excel con un nombre personalizado
    const nombreArchivo = `${Reporte_Estudiantes || 'No_especificada'}_${fechaLimpia || 'sin_fecha'}.xlsx`;
    
    XLSX.writeFile(libroDeTrabajo, nombreArchivo);
  };

  const generarReporteHistorialesExcel = () => {
    // Validar que haya datos en la tabla
    if (!listaHistoriales || listaHistoriales.length === 0) {
      Swal.fire({
        icon: 'info',
        title: 'Tabla vacía',
        text: 'No hay datos disponibles para generar el reporte excel.',
        confirmButtonText: 'Entendido',
      });
      return; // Salir de la función si no hay datos
    }
  
    // Crear los encabezados con la sección y la fecha de generación
    const encabezados = [
      ["Saint Patrick's Academy"],  // Mejorado el nombre con apóstrofe correcto
      ["Reporte de Historiales Académicos"],    // Título claro
      [
        `Historial: ${Cod_historial_academico || 'No especificada'}`,  // Asegurarse de que siempre haya un valor
        `Fecha de generación: ${new Date().toLocaleDateString()}`,    // Fecha en formato amigable
        `Fecha de registro: ${fechaLimpia || 'Sin fecha'}`            // Mostrar la fecha limpia o 'Sin fecha'
      ],
      [], // Espacio en blanco
      ["#", "Estado", "Estudiante", "Grado", "Año Académico", "Promedio Anual", "Fecha de Registro", "Instituto", "Observaciones"] // Encabezado de la tabla de datos
    ];
  
    // Crear filas con asistencias filtradas
    const filas = listaGradosAcademicos.map((grado, index) => [
      index + 1,
      grado.Nombre_grado  
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
  
    // Estilo de los encabezados de la tabla
    for (let col = 0; col < 4; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 4, c: col }); // Encabezados de la tabla en la fila 5
      if (hojaDeTrabajo[cellAddress]) {
        hojaDeTrabajo[cellAddress].s = {
          font: { bold: true, sz: 12, color: { rgb: "FFFFFF" } },
          fill: { fgColor: { rgb: "2D6A4F" } },
          alignment: { horizontal: "center", vertical: "center" }
        };
      }
    }
  
    // Ajustar el ancho de columnas automáticamente
    const ajusteColumnas = [
      { wpx: 250 },  // Número de fila
      { wpx: 250 }, // Grado
    ];
  
    hojaDeTrabajo['!cols'] = ajusteColumnas;
  
    // Crear el libro de trabajo
    const libroDeTrabajo = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libroDeTrabajo, hojaDeTrabajo, "Reporte de Grados Académicos");
  
    // Guardar el archivo Excel con un nombre personalizado
    const nombreArchivo = `${Reporte_Grados || 'No_especificada'}_${fechaLimpia || 'sin_fecha'}.xlsx`;
    
    XLSX.writeFile(libroDeTrabajo, nombreArchivo);
  };

  const renderGradosView = () => {
    // Función para paginar los grados
    const indexOfLastRecord2 = currentPage2 * recordsPerPage2;
    const indexOfFirstRecord2 = indexOfLastRecord2 - recordsPerPage2;
    const currentRecords2 = filteredGrados.slice(indexOfFirstRecord2, indexOfLastRecord2);
  
    return (
      <div>
       <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <CDropdown className="btn-sm d-flex align-items-center gap-1 rounded shadow">
          <CDropdownToggle
            style={{
              backgroundColor: "#6C8E58",
              color: "white",
              fontSize: "0.85rem",
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#5A784C";
              e.currentTarget.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#6C8E58";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            Reporte
          </CDropdownToggle>
          <CDropdownMenu
            style={{
              position: "absolute",
              zIndex: 1050,
              backgroundColor: "#fff",
              boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.2)",
              borderRadius: "4px",
              overflow: "hidden",
            }}
          >
            {/* Opción para PDF */}
            <CDropdownItem
              onClick={() => generarReporteGradosPDF}
              style={{
                cursor: "pointer",
                outline: "none",
                backgroundColor: "transparent",
                padding: "0.5rem 1rem",
                fontSize: "0.85rem",
                color: "#333",
                borderBottom: "1px solid #eaeaea",
                transition: "background-color 0.3s",
              }}
              onMouseOver={(e) =>
                (e.target.style.backgroundColor = "#f5f5f5")
              }
              onMouseOut={(e) =>
                (e.target.style.backgroundColor = "transparent")
              }
            >
              <CIcon icon={cilFile} size="sm" /> PDF
            </CDropdownItem>

            {/* Opción para Excel */}
            <CDropdownItem
              onClick={() => generarReporteGradosExcel}
              style={{
                cursor: "pointer",
                outline: "none",
                backgroundColor: "transparent",
                padding: "0.5rem 1rem",
                fontSize: "0.85rem",
                color: "#333",
                transition: "background-color 0.3s",
              }}
              onMouseOver={(e) =>
                (e.target.style.backgroundColor = "#f5f5f5")
              }
              onMouseOut={(e) =>
                (e.target.style.backgroundColor = "transparent")
              }
            >
              <CIcon icon={cilSpreadsheet} size="sm" /> Excel
            </CDropdownItem>
          </CDropdownMenu>
        </CDropdown>
      </div>
        <CRow className="align-items-center mb-5">
          {/* Botón "Volver a Secciones" a la izquierda */}
          <CCol xs="12" className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
            <div className="flex-grow-1 text-center">
              <h4 className="text-center fw-semibold pb-2 mb-0" style={{ display: "inline-block", borderBottom: "2px solid #4CAF50" }}>
                HISTORIALES ACADÉMICOS: LISTA DE GRADOS
              </h4>
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
                style={{ width: '80px', height: '35px', display: 'inline-block', fontSize: '0.8rem'}}
                placeholder="Buscar grado..."
                onChange={handleSearch2}
                value={searchTerm2}
              />
              <CButton
                style={{ border: '1px solid #ccc', transition: 'all 0.1s ease-in-out', backgroundColor: '#F3F4F7', color: '#343a40', height:'35px' }}
                onClick={() => {
                  setSearchTerm2('');
                  setCurrentPage2(1); // Reiniciar a la primera página cuando se cambia el número de registros
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#E0E0E0'; 
                  e.currentTarget.style.color = 'black'; 
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#F3F4F7'; 
                  e.currentTarget.style.color = '#343a40'; 
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
                  style={{ width: '80px', height: '35px', display: 'inline-block', textAlign: 'center' }}
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
  
        <div className="table-responsive" style={{ maxHeight: '400px', margin: '0 auto', overflowX: 'auto', overflowY: 'auto', boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)' }}>
          <CTable striped bordered hover responsive>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>#</CTableHeaderCell>
                <CTableHeaderCell>Grado</CTableHeaderCell>
                <CTableHeaderCell>Acciones</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
            {gradosOrdenados.map((gradoM, index) => (
                <CTableRow key={gradoM.Cod_grado}>
                  <CTableDataCell>{index + 1 + (currentPage2 - 1) * recordsPerPage2}</CTableDataCell>
                  <CTableDataCell>{gradoM.Nombre_grado}</CTableDataCell>
                  <CTableDataCell>
                    <CButton
                      color="info"
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
                      onClick={() => {
                        console.log(gradoM.Cod_grado); // Verifica que el Cod_grado esté correcto
                        setGradoSeleccionado(gradoM);
                        fetchPersonasPorGrado(gradoM.Cod_grado);
                        setCurrentView("estudiantes");
                      }}    
                    >
                      Ver Estudiantes
                    </CButton>
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
        </div>
  
        {/* Paginación Fija */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '16px' }}>
          <CPagination aria-label="Page navigation" style={{ display: 'flex', gap: '10px' }}>
            <CButton
              style={{ backgroundColor: '#6f8173', color: '#D9EAD3' }}
              disabled={currentPage2 === 1} // Deshabilitar si estás en la primera página
              onClick={() => paginate2(currentPage2 - 1)}>
              Anterior
            </CButton>
            <CButton
              style={{ marginLeft: '10px', backgroundColor: '#6f8173', color: '#D9EAD3' }}
              disabled={currentPage2 === Math.ceil(filteredGrados.length / recordsPerPage2)} // Deshabilitar si estás en la última página
              onClick={() => paginate2(currentPage2 + 1)}>
              Siguiente
            </CButton>
          </CPagination>
          {/* Mostrar total de páginas */}
          <span style={{ marginLeft: '10px' }}>
            Página {currentPage2} de {Math.ceil(filteredGrados.length / recordsPerPage2)}
          </span>
        </div>
      </div>
    );
  };  

  const renderEstudiantesView = () => {
    // Función para paginar los estudiantes
    const indexOfLastRecord3 = currentPage3 * recordsPerPage3;
    const indexOfFirstRecord3 = indexOfLastRecord3 - recordsPerPage3;
    const currentRecords3 = filteredEstudiantes.slice(indexOfFirstRecord3, indexOfLastRecord3);
  
    return (
      <div>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <CDropdown className="btn-sm d-flex align-items-center gap-1 rounded shadow">
            <CDropdownToggle
              style={{
                backgroundColor: "#6C8E58",
                color: "white",
                fontSize: "0.85rem",
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#5A784C";
                e.currentTarget.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#6C8E58";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              Reporte
            </CDropdownToggle>
            <CDropdownMenu
              style={{
                position: "absolute",
                zIndex: 1050,
                backgroundColor: "#fff",
                boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.2)",
                borderRadius: "4px",
                overflow: "hidden",
              }}
            >
              {/* Opción para PDF */}
              <CDropdownItem
                onClick={() => generarReporteEstudiantesPDF}
                style={{
                  cursor: "pointer",
                  outline: "none",
                  backgroundColor: "transparent",
                  padding: "0.5rem 1rem",
                  fontSize: "0.85rem",
                  color: "#333",
                  borderBottom: "1px solid #eaeaea",
                  transition: "background-color 0.3s",
                }}
                onMouseOver={(e) =>
                  (e.target.style.backgroundColor = "#f5f5f5")
                }
                onMouseOut={(e) =>
                  (e.target.style.backgroundColor = "transparent")
                }
              >
                <CIcon icon={cilFile} size="sm" /> PDF
              </CDropdownItem>

              {/* Opción para Excel */}
              <CDropdownItem
                onClick={() => generarReporteExcel()}
                style={{
                  cursor: "pointer",
                  outline: "none",
                  backgroundColor: "transparent",
                  padding: "0.5rem 1rem",
                  fontSize: "0.85rem",
                  color: "#333",
                  transition: "background-color 0.3s",
                }}
                onMouseOver={(e) =>
                  (e.target.style.backgroundColor = "#f5f5f5")
                }
                onMouseOut={(e) =>
                  (e.target.style.backgroundColor = "transparent")
                }
              >
                <CIcon icon={cilSpreadsheet} size="sm" /> Excel
              </CDropdownItem>
            </CDropdownMenu>
          </CDropdown>
        </div>
        <CRow className="align-items-center mb-5">
          {/* Botón "Volver a Secciones" a la izquierda */}
          <CCol xs="12" className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
            <CButton className="btn btn-sm d-flex align-items-center gap-1 rounded shadow"
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#4B4B4B")} onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#656565")}
              style={{ backgroundColor: "#656565", color: "#FFFFFF", padding: "6px 12px", fontSize: "0.9rem", transition: "background-color 0.2s ease, box-shadow 0.3s ease", boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)", }}
              onClick={() => setCurrentView("grados")}>
              <CIcon icon={cilArrowLeft} />Regresar a Grados
            </CButton>
            <div className="flex-grow-1 text-center">
              <h4 className="text-center fw-semibold pb-2 mb-0" style={{ display: "inline-block", borderBottom: "2px solid #4CAF50" }}> ESTUDIANTES : {gradoSeleccionado?.Nombre_grado} </h4>
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
                style={{ width: '80px', height: '35px', display: 'inline-block', fontSize: '0.8rem' }}
                placeholder="Buscar persona..."
                value={searchTerm3}
                onChange={handleSearch3}
              />
              <CButton
                style={{
                  border: '1px solid #ccc',
                  transition: 'all 0.1s ease-in-out',
                  backgroundColor: '#F3F4F7',
                  color: '#343a40',
                  height: '35px'
                }}
                onClick={() => {
                  setSearchTerm3('');
                  setCurrentPage3(1); // Reiniciar a la primera página cuando se cambia el número de registros
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
                  style={{ width: '80px', height: '35px', display: 'inline-block', textAlign: 'center' }}
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
  
        <div
          className="table-responsive"
          style={{
            maxHeight: '400px',
            margin: '0 auto',
            overflowX: 'auto',
            overflowY: 'auto',
            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)',
          }}
        >
          <CTable striped bordered hover responsive>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>#</CTableHeaderCell>
                <CTableHeaderCell>Estudiante</CTableHeaderCell>
                <CTableHeaderCell>Acciones</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {currentRecords3.map((personaM, index) => (
                <CTableRow key={index}>
                  <CTableDataCell>{index + 1 + (currentPage3 - 1) * recordsPerPage3}</CTableDataCell>
                  <CTableDataCell>
                    {`${personaM.Nombre_persona || ""} ${personaM.SNombre_persona || ""} ${personaM.PApellido_persona || ""} ${personaM.SApellido_persona || ""}`.trim()}
                  </CTableDataCell>
                  <CTableDataCell>
                    <CButton
                      color="info"
                      size="sm"
                      style={{
                        backgroundColor: '#F0F4F3',
                        color: '#153E21',
                        border: '1px solid #A2B8A9',
                        borderRadius: '6px',
                        padding: '5px 12px',
                        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
                        cursor: 'pointer',
                      }}
                      onClick={() => handleVerHistoriales(personaM.Cod_persona)}
                    >
                      Ver Historiales
                    </CButton>
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
        </div>
  
        {/* Paginación Fija */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '16px' }}>
          <CPagination aria-label="Page navigation" style={{ display: 'flex', gap: '10px' }}>
            <CButton
              style={{ backgroundColor: '#6f8173', color: '#D9EAD3' }}
              disabled={currentPage3 === 1} // Deshabilitar si estás en la primera página
              onClick={() => paginate3(currentPage3 - 1)}
            >
              Anterior
            </CButton>
            <CButton
              style={{ marginLeft: '10px', backgroundColor: '#6f8173', color: '#D9EAD3' }}
              disabled={currentPage3 === Math.ceil(filteredEstudiantes.length / recordsPerPage3)} // Deshabilitar si estás en la última página
              onClick={() => paginate3(currentPage3 + 1)}
            >
              Siguiente
            </CButton>
          </CPagination>
          {/* Mostrar total de páginas */}
          <span style={{ marginLeft: '10px' }}>
            Página {currentPage3} de {Math.ceil(filteredEstudiantes.length / recordsPerPage3)}
          </span>
        </div>
      </div>
    );
  };  

  const renderHistorialesView = () => (
    <div className="table-container" style={{ overflowY: 'auto', marginBottom: '20px' }}>
    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
      <CButton
        style={{ backgroundColor: '#4B6251', color: 'white' }}
        className="mb-3 mb-md-0 me-md-3"
        onClick={() => {
          resetForm(); // Asegúrate de resetear el formulario aquí
          setModalVisible(true);
        }}
      >
        <CIcon icon={cilPlus} /> Nuevo
      </CButton>
      <CDropdown className="btn-sm d-flex align-items-center gap-1 rounded shadow">
        <CDropdownToggle
          style={{
            backgroundColor: "#6C8E58",
            color: "white",
            fontSize: "0.85rem",
            cursor: "pointer",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#5A784C";
            e.currentTarget.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.2)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#6C8E58";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          Reporte
        </CDropdownToggle>
        <CDropdownMenu
          style={{
            position: "absolute",
            zIndex: 1050,
            backgroundColor: "#fff",
            boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.2)",
            borderRadius: "4px",
            overflow: "hidden",
          }}
        >
          {/* Opción para PDF */}
          <CDropdownItem
            onClick={() => generarReporteHistorialesPDF()}
            style={{
              cursor: "pointer",
              outline: "none",
              backgroundColor: "transparent",
              padding: "0.5rem 1rem",
              fontSize: "0.85rem",
              color: "#333",
              borderBottom: "1px solid #eaeaea",
              transition: "background-color 0.3s",
            }}
            onMouseOver={(e) =>
              (e.target.style.backgroundColor = "#f5f5f5")
            }
            onMouseOut={(e) =>
              (e.target.style.backgroundColor = "transparent")
            }
          >
            <CIcon icon={cilFile} size="sm" /> PDF
          </CDropdownItem>

          {/* Opción para Excel */}
          <CDropdownItem
            onClick={() => generarReporteExcel('historialesEstudiantes')}
            style={{
              cursor: "pointer",
              outline: "none",
              backgroundColor: "transparent",
              padding: "0.5rem 1rem",
              fontSize: "0.85rem",
              color: "#333",
              transition: "background-color 0.3s",
            }}
            onMouseOver={(e) =>
              (e.target.style.backgroundColor = "#f5f5f5")
            }
            onMouseOut={(e) =>
              (e.target.style.backgroundColor = "transparent")
            }
          >
            <CIcon icon={cilSpreadsheet} size="sm" /> Excel
          </CDropdownItem>
        </CDropdownMenu>
      </CDropdown>
    </div>
    <CRow className="align-items-center mb-5">
      {/* Botón "Volver a Secciones" a la izquierda */}
      <CCol xs="12" className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
        <CButton className="btn btn-sm d-flex align-items-center gap-1 rounded shadow"
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#4B4B4B")} onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#656565")}
          style={{ backgroundColor: "#656565", color: "#FFFFFF", padding: "6px 12px", fontSize: "0.9rem", transition: "background-color 0.2s ease, box-shadow 0.3s ease", boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)", }}
          onClick={() => setCurrentView("estudiantes")}>
          <CIcon icon={cilArrowLeft} />Regresar a Estudiantes
        </CButton>
        <div className="flex-grow-1 text-center">
          <h4 className="text-center fw-semibold pb-2 mb-0" style={{ display: "inline-block", borderBottom: "2px solid #4CAF50" }}> HISTORIAL ACADEMICO </h4>
        </div>
      </CCol>
    </CRow>
    <div className="d-flex mb-3">
      <CInputGroupText>
        <CIcon icon={cilSearch} /> {/* Icono de lupa */}
      </CInputGroupText>
      <CFormInput
        placeholder="Buscar Historiales..."
        value={searchTerm}
        onChange={(e) => {
          const inputValue = e.target.value.toUpperCase(); // Convertir a mayúsculas

          // Verificar que solo se ingresen letras (A-Z), números, tildes y espacios
          if (/[^A-ZÁÉÍÓÚ´Ñ0-9\s]/g.test(inputValue)) {
            Swal.fire({
              icon: "error",
              title: "Carácter no permitido",
              text: "Solo se permiten letras, tildes, números y espacios.",
            });
            return; // Evitar actualización del estado
          }

          // Verificar más de tres repeticiones consecutivas
          if (/(.)\1{3,}/g.test(inputValue)) {
            Swal.fire({
              icon: "error",
              title: "Demasiadas repeticiones",
              text: "No puedes ingresar más de tres veces la misma letra consecutiva.",
            });
            return; // Evitar actualización del estado
          }

          setSearchTerm(inputValue); // Actualizar el estado con el valor validado
        }}
        style={{ width: "200px" }} // Ajusta el ancho aquí
      />
      <CButton
        onClick={handleClearSearch} // Función para limpiar el término de búsqueda
        style={{
          border: "1px solid #ccc",
          transition: "all 0.1s ease-in-out", // Duración de la transición
          backgroundColor: "#F3F4F7", // Color por defecto
          color: "#343a40", // Color de texto por defecto
        }}
      >
        <CIcon icon={cilBrushAlt} /> Limpiar{/* Icono de escoba */}
      </CButton>{" "}
      {/* Botón para limpiar la búsqueda */}
    </div>

    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', fontSize: 'small', marginBottom: '10px' }}>
      <span>Mostrar</span>
      <CFormSelect
        aria-label="Items por página"
        value={itemsPerPage}
        onChange={(e) => {
          setItemsPerPage(Number(e.target.value));
          setCurrentPage(1);
        }}
        style={{ width: 'auto', margin: '0 8px' }}
      >
        <option value="5">5</option>
        <option value="10">10</option>
        <option value="20">20</option>
      </CFormSelect>
      <span>historiales</span>
    </div>

    <div className="table-responsive"style={{maxHeight: '400px',margin: '0 auto',overflowX: 'auto',overflowY: 'auto',boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)', }}>
      <CTable striped bordered hover responsive style={{ minWidth: '700px', fontSize: '16px' }}>
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell>#</CTableHeaderCell>
            <CTableHeaderCell>Estado</CTableHeaderCell>
            <CTableHeaderCell>Estudiante</CTableHeaderCell>
            <CTableHeaderCell>Grado</CTableHeaderCell>
            <CTableHeaderCell>Año Académico</CTableHeaderCell>
            <CTableHeaderCell>Promedio Anual</CTableHeaderCell>
            <CTableHeaderCell>Fecha de Registro</CTableHeaderCell>
            <CTableHeaderCell>Instituto</CTableHeaderCell>
            <CTableHeaderCell>Observaciones</CTableHeaderCell>
            <CTableHeaderCell>Acciones</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {historiales.map((historial, index) => (
            <CTableRow key={index}>
              <CTableDataCell>{index + 1}</CTableDataCell>
              <CTableDataCell>{historial.Estado}</CTableDataCell>
              <CTableDataCell>{historial.NombreCompletoEstudiante}</CTableDataCell>
              <CTableDataCell>{historial.NombreGrado}</CTableDataCell>
              <CTableDataCell>{historial.AñoAcademico}</CTableDataCell>
              <CTableDataCell>{historial.PromedioAnual}</CTableDataCell>
              <CTableDataCell>{new Date(historial.FechaRegistro).toLocaleDateString('es-ES')}</CTableDataCell>
              <CTableDataCell>{historial.NombreInstituto}</CTableDataCell>
              <CTableDataCell>{historial.Observacion}</CTableDataCell>
              <CTableDataCell>
                <CButton color="info" onClick={() => handleEditHistorial(historial)}>
                  <CIcon icon={cilPen} />
                </CButton>
                <CButton color="danger" onClick={() => handleDeleteHistorial(historial.CodHistorial)}>
                  <CIcon icon={cilTrash} />
                </CButton>
              </CTableDataCell>
            </CTableRow>
          ))}
        </CTableBody>
      </CTable>
    </div>
  </div>
  );

  return (
    <CContainer>
            <h1>Mantenimiento Historiales</h1>
      {/* Botón de Agregar Historial arriba de la barra de búsqueda */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <CButton 
          style={{ backgroundColor: '#4B6251', color: 'white' }} 
          className="mb-3 mb-md-0 me-md-3"
          onClick={() => {
              resetForm(); // Asegúrate de resetear el formulario aquí
              setModalVisible(true);
          }}
          >
          <CIcon icon={cilPlus} /> Nuevo
        </CButton>
        <CButton
        style={{ backgroundColor: '#6C8E58', color: 'white' }}
        onClick={() => setModalReportVisible(true)} // Abre modal de reporte
      >
        <CIcon icon={cilDescription} /> Reporte
      </CButton>
      </div>

      <div className="d-flex mb-3">
        <CInputGroupText>
          <CIcon icon={cilSearch} /> {/* Icono de lupa */}
        </CInputGroupText>
        <CFormInput
          placeholder="Buscar Historiales..."
          value={searchTerm}
          onChange={(e) => {
            const inputValue = e.target.value.toUpperCase(); // Convertir a mayúsculas

            // Verificar que solo se ingresen letras (A-Z), números, tildes y espacios
            if (/[^A-ZÁÉÍÓÚ´Ñ0-9\s]/g.test(inputValue)) {
              Swal.fire({
                icon: "error",
                title: "Carácter no permitido",
                text: "Solo se permiten letras, tildes, números y espacios.",
              });
              return; // Evitar actualización del estado
            }

            // Verificar más de tres repeticiones consecutivas
            if (/(.)\1{3,}/g.test(inputValue)) {
              Swal.fire({
                icon: "error",
                title: "Demasiadas repeticiones",
                text: "No puedes ingresar más de tres veces la misma letra consecutiva.",
              });
              return; // Evitar actualización del estado
            }

            setSearchTerm(inputValue); // Actualizar el estado con el valor validado
          }}
          style={{ width: "200px" }} // Ajusta el ancho aquí
        />
        <CButton
          onClick={handleClearSearch} // Función para limpiar el término de búsqueda
          style={{
            border: "1px solid #ccc",
            transition: "all 0.1s ease-in-out", // Duración de la transición
            backgroundColor: "#F3F4F7", // Color por defecto
            color: "#343a40", // Color de texto por defecto
          }}
        >
          <CIcon icon={cilBrushAlt} /> Limpiar{/* Icono de escoba */}
        </CButton>{" "}
        {/* Botón para limpiar la búsqueda */}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', fontSize: 'small', marginBottom: '10px' }}>
        <span>Mostrar</span>
        <CFormSelect
          aria-label="Items por página"
          value={itemsPerPage}
          onChange={(e) => {
            setItemsPerPage(Number(e.target.value));
            setCurrentPage(1); 
          }}
          style={{ width: 'auto', margin: '0 8px' }}
        >
          <option value="5">5</option>
          <option value="10">10</option>
          <option value="20">20</option>
        </CFormSelect>
        <span>historiales</span>
      </div>

      <div className="table-container" style={{ overflowY: 'auto', marginBottom: '20px' }}>
        <CTable striped bordered hover responsive style={{ minWidth: '700px', fontSize: '16px' }}>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell>#</CTableHeaderCell>
              <CTableHeaderCell>Código de Historial</CTableHeaderCell>
              <CTableHeaderCell>Estado</CTableHeaderCell>
              <CTableHeaderCell>Estudiante</CTableHeaderCell>
              <CTableHeaderCell>Grado</CTableHeaderCell>
              <CTableHeaderCell>Año Académico</CTableHeaderCell>
              <CTableHeaderCell>Promedio Anual</CTableHeaderCell>
              <CTableHeaderCell>Fecha Registro</CTableHeaderCell>
              <CTableHeaderCell>Instituto</CTableHeaderCell>
              <CTableHeaderCell>Acciones</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {currentHistoriales.map((historial, index) => (
              <CTableRow key={index}>
                <CTableDataCell>{indexOfFirstItem + index + 1}</CTableDataCell>
                <CTableDataCell>{historial.Cod_historial_academico}</CTableDataCell>
                <CTableDataCell>{getEstadoTexto(historial.Cod_estado)}</CTableDataCell>
                <CTableDataCell>{historial.Estudiante}</CTableDataCell>
                <CTableDataCell>{historial.Grado}</CTableDataCell>
                <CTableDataCell>{historial.Año_Academico}</CTableDataCell>
                <CTableDataCell>{historial.Promedio_Anual}</CTableDataCell>
                <CTableDataCell>{new Date(historial.Fecha_Registro).toLocaleDateString('es-ES')}</CTableDataCell>
                <CTableDataCell>{historial.Instituto}</CTableDataCell>
                <CTableDataCell>
                  <CButton color="info" onClick={() => handleEditHistorial(historial)}>
                    <CIcon icon={cilPen} />
                  </CButton>
                  <CButton color="danger" onClick={() => handleDeleteHistorial(historial.Cod_historial_academico)}>
                    <CIcon icon={cilTrash} />
                  </CButton>
                </CTableDataCell>
              </CTableRow>
            ))}
          </CTableBody>
        </CTable>
      </div>

      {/* Paginación debajo de la tabla */}
      <nav>
        <ul className="pagination justify-content-center align-items-center">
          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
            <button
              className="page-link"
              style={{ 
                backgroundColor: currentPage === 1 ? 'rgba(111, 129, 115, 0.5)' : '#6f8173', // Opaco si está deshabilitado
                color: '#D9EAD3', 
                borderRadius: '5px', // Esquinas redondeadas
                transition: 'background-color 0.3s ease', // Transición suave para el cambio de color
              }} 
              onMouseEnter={(e) => e.target.style.backgroundColor = '#4b5b52'} // Color al pasar el mouse
              onMouseLeave={(e) => e.target.style.backgroundColor = currentPage === 1 ? 'rgba(111, 129, 115, 0.5)' : '#6f8173'} // Color original al salir
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Anterior
            </button>
          </li>
          <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
            <button
              className="page-link"
              style={{ 
                backgroundColor: '#6f8173', 
                color: '#D9EAD3', 
                borderRadius: '5px', // Esquinas redondeadas
                transition: 'background-color 0.3s ease', // Transición suave para el cambio de color
              }} 
              onMouseEnter={(e) => e.target.style.backgroundColor = '#4b5b52'} // Color al pasar el mouse
              onMouseLeave={(e) => e.target.style.backgroundColor = '#6f8173'} // Color original al salir
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Siguiente
            </button>
          </li>
          <li className="page-item">
            <span style={{ margin: '0 10px', color: '#6f8173' }}>Página {currentPage} de {totalPages}</span>
          </li>
        </ul>
      </nav>

      <CModal visible={modalVisible} onClose={handleCancelModal} backdrop="static" keyboard={false}>
        <CModalHeader>
          <CModalTitle>{historialAEditar ? 'Editar Historial' : 'Agregar Historial'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
          {/*Campo para seleccionar el estudiante*/}
          <CFormSelect
          label="Estudiante"
            value={nuevoHistorial.Estudiante}
            onChange={(e) => setNuevoHistorial({ ...nuevoHistorial, Estudiante: e.target.value })}
          >
            <option>Seleccione un estudiante</option>
            {Persona.map((persona) => (
              <option key={persona.cod_persona} value={`${persona.Nombre} ${persona.Segundo_nombre || ''} ${persona.Primer_apellido} ${persona.Segundo_Apellido || ''}`.trim()}>
                {`${persona.Nombre} ${persona.Segundo_nombre || ''} ${persona.Primer_apellido} ${persona.Segundo_Apellido || ''}`.trim()}
              </option>
            ))}
          </CFormSelect>
            {/* Campo para seleccionar el Grado */}
            <CFormSelect
            label="Grado"
            value={nuevoHistorial.cod_grado}
            onChange={(e) => handleInputChange(e, 'Cod_grado')}
          >
            <option value="">Seleccione una opción</option>
            {Grados.map((grado) => (
              <option key={grado.Cod_grado} value={grado.Cod_grado}>
                {grado.Nombre_grado}
              </option>
            ))}
          </CFormSelect>

          {/* Campo de Año Académico */}
          <CFormSelect
            label="Año Académico"
            value={nuevoHistorial.Año_Academico}
            onChange={(e) => handleInputChange(e, 'Año_Academico')}
          >
            {generarAnios().map((anio) => (
              <option key={anio} value={anio}>
                {anio}
              </option>
            ))}
          </CFormSelect>

          {/* Campo de Promedio Anual */}
          <CFormInput
            label="Promedio Anual"
            type="number"
            value={nuevoHistorial.Promedio_Anual}
            onChange={(e) => handleInputChange(e, 'Promedio_Anual')}
          />

          {/* Campo de Instituto */}
          <CFormSelect
            label="Instituto"
            value={nuevoHistorial.Instituto}
            onChange={(e) => handleInputChange(e, 'Instituto')}
            >
              <option value="">Seleccione una opción</option>
              {Instituto.length > 0 ? (
                Instituto.map((instituto, index) => (
                  <option key={index} value={instituto.Nom_Instituto}>
                    {instituto.Nom_Instituto}
                  </option>
                ))
              ) : (
                <option>Cargando institutos...</option>
              )}
            </CFormSelect>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={handleCancelModal}>Cancelar</CButton>
          <CButton color="primary" onClick={historialAEditar ? handleUpdateHistorial : handleCreateHistorial}>
            {historialAEditar ? 'Actualizar' : 'Crear'}
          </CButton>
        </CModalFooter>
      </CModal>

             {/* Modal para Reporte */}
             <CModal visible={modalReportVisible} onClose={() => setModalReportVisible(false)} backdrop="static" keyboard={false}>
        <CModalHeader>
          <CModalTitle>Generar Reporte</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <p>Seleccione el formato para descargar el reporte:</p>
        </CModalBody>
        <CModalFooter>
          <CButton color="primary" onClick={downloadPDF}>PDF</CButton>
          <CButton color="primary" onClick={downloadExcel}>Excel</CButton>
          <CButton color="secondary" onClick={() => setModalReportVisible(false)}>Cerrar</CButton>
        </CModalFooter>
      </CModal>
    </CContainer>
  );
};

export default ListaHistoriales;
