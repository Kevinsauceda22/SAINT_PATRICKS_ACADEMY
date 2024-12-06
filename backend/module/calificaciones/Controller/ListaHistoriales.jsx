import React, { useEffect, useState, useRef } from 'react';
import { CDropdown, CDropdownToggle, CDropdownMenu, CDropdownItem } from '@coreui/react';
import { cilFile, cilSpreadsheet } from '@coreui/icons';
import { CIcon } from '@coreui/icons-react';
import { cilSearch, cilBrushAlt, cilPen, cilTrash, cilPlus, cilSave, cilArrowLeft, cilDescription } from '@coreui/icons';
import Swal from 'sweetalert2'; // Importa SweetAlert2
import {
  CButton,
  CContainer,
  CForm,
  CPagination,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CTable,
  CRow,
  CCol,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CFormSelect
} from '@coreui/react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';  // Asegúrate de importar la librería de autoTable
import * as XLSX from 'xlsx';

const ListaHistoriales = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [historiales, setHistoriales] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [error, setError] = useState('');
  const [historialAEditar, setHistorialAEditar] = useState(null);
  const [GradosMatricula, setGradosMatricula] = useState([]);
  const [Grados, setGrados] = useState([]);
  const [currentView, setCurrentView] = useState("grados", "estudiantes", "historiales");
  const [gradoSeleccionado, setGradoSeleccionado] = useState(null);
  const [estadonota, setEstadonota] = useState([]); // Inicializa el estado como un arreglo vacío
  const [Estudiantes, setEstudiantes] = useState([]);
  const [Instituto, setInstituto] = useState([]);
  const [Persona, setPersona] = useState([]);
  const [loading, setLoading] = useState(false);
  const [nuevoHistorial, setNuevoHistorial] = useState({
    Cod_estado: '',
    Cod_persona: '',
    Cod_Instituto: '',
    Grado: '',
    Año_Academico: '',
    Promedio_Anual: '',
    Observacion: ''
  });  

  useEffect(() => {
    fetchHistorialPorPersona();
    fetchGrados();
    fetchEstadonota();
    fetchPersonas();
    fetchInstituto();
    fetchGradosMatricula();
    fetchPersonasPorGrado();
  }, []);
  
  useEffect(() => {
    if (nuevoHistorial.Cod_persona) {
      // Limpiar los historiales anteriores
      setHistoriales([]); // Esto limpiará la lista de historiales antes de cargar los nuevos
  
      // Cargar los historiales del nuevo estudiante
      fetchHistorialPorPersona(nuevoHistorial.Cod_persona);
    }
  }, [nuevoHistorial.Cod_persona]); // Se ejecutará cada vez que cambie Cod_persona
  
  const fetchPersonas = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/persona/verPersonas');
      const data = await response.json();
      console.log(data);
      setPersona(data);
    } catch (error) {
      console.error('Error al obtener los estudiantes: ', error);
    }
  };

  const fetchGrados = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/grados/vergrados');
      const data = await response.json();
      console.log(data); // Verifica la respuesta en la consola
      setGrados(data); 
    } catch (error) {
      console.error('Error al obtener los grados:', error);
    }
  };

  const fetchGradosMatricula = async () => {
    try {
      // Hacer la solicitud al endpoint de grados
      const response = await fetch('http://localhost:4000/api/historialAcademico/gradosMatricula');

      // Verificar si la respuesta es exitosa
      if (!response.ok) {
        throw new Error('Error en la solicitud al servidor');
      }

      // Parsear la respuesta JSON
      const data = await response.json();
      // Manejar los datos obtenidos
      console.log(data.data); // Mostrar los grados en consola
      setGradosMatricula(data.data); // Asignar los datos al estado de grados (suponiendo que tienes un estado)
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
      const response = await fetch(`http://localhost:4000/api/historialAcademico/gradosMatricula/${cod_grado}`);
      
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
      Cod_persona: 'Seleccione un estudiante',
      Cod_grado: '',
      Año_Academico: '',
      Promedio_Anual: '',
      Cod_Instituto: '',
      Observacion: ''
    });
    setError('');
  };

  const handleEditHistorial = (historial) => {
    setHistorialAEditar(historial); // Establece el historial a editar
    setNuevoHistorial({
      Cod_estado: historial.Cod_estado || "",
      Cod_persona: historial.Cod_persona || "",
      Cod_grado: historial.Cod_grado || "",
      Año_Academico: historial.Año_Academico || "",
      Promedio_Anual: historial.Promedio_Anual || "",
      Cod_Instituto: historial.Cod_Instituto || "",
      Observacion: historial.Observacion || "",
    });
    setModalVisible(true); // Abre el modal
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

  const fetchInstituto = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/instituto/instituto');
      const data = await response.json();
      console.log(data); //verifica las respuestas en la consola
      setInstituto(data);
    } catch (error) {
      console.error('Error al obtener los institutos: ', error);
    }
  };

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
      const response = await fetch(`http://localhost:4000/api/historialAcademico/historiales/persona/${cod_persona}`);
      const data = await response.json();
  
      // Renumera los historiales secuencialmente
      const historialesNumerados = data.map((historial, index) => ({
        ...historial,
        numero: index + 1, // Agrega un número secuencial a cada historial
      }));
      // Actualizar el estado con los nuevos historiales
      setHistoriales(historialesNumerados);
    } catch (error) {
      console.error('Error al obtener los historiales por persona:', error);
    }
  };  

  const fetchEstadonota = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/estadoNotas/estadonota');
      const data = await response.json();
      // Asignar un índice original basado en el orden en la base de datos
    const dataWithIndex = data.map((estadonota, index) => ({
      ...estadonota,
      originalIndex: index + 1, // Guardamos la secuencia original
    }));
    
    setEstadonota(dataWithIndex);
    } catch (error) {
      console.error('Error al obtener los Estadonota:', error);
    }
  };

  const handleInputChange = (e, field) => {
    const value = e.target.value;

    setNuevoHistorial((prevState) => ({
      ...prevState,
      [field]: field === 'Cod_persona' || field === 'Cod_Instituto' ? 
                (value === "" ? null : parseInt(value)) : value,
    }));

    // Validación para el campo Promedio_Anual
    if (field === 'Promedio_Anual') {
      const validNumber = /^\d*\.?\d*$/; // Solo permite números y un punto decimal

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

  const validateFields = () => {
    const {Cod_estado, Cod_persona, Cod_Instituto, Cod_grado, Año_Academico, Promedio_Anual } = nuevoHistorial;
    if (!Cod_estado || !Cod_persona || !Cod_Instituto || !Cod_grado || !Año_Academico || !Promedio_Anual) {
      setError("Todos los campos son obligatorios.");
      return false;
    }
    setError('');
    return true;
  };

  const handleCreateHistorial = async () => {
    console.log('Nuevo historial:', nuevoHistorial); // Verificar el objeto antes de enviarlo
    if (!validateFields()) return;

    console.log("Historial a crear:", nuevoHistorial);
  
    try {
      const response = await fetch('http://localhost:4000/api/historialAcademico/crearhistorial', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(nuevoHistorial),
      });
  
      if (response.ok) {
        console.log("Historial creado con éxito");
        setModalVisible(false);
        resetForm();
      } else {
        const errorData = await response.json();
        console.error('Error al crear el historial:', errorData);
        setError('Error al crear el historial: ' + errorData.message);
      }
    } catch (error) {
      console.error('Error al crear el historial:', error);
      setError('Error al crear el historial: ' + error.message);
    }
  };
  
  const handleUpdateHistorial = async () => {
    console.log("Historial a actualizar:", nuevoHistorial);
    if (!validateFields()) return;
  
    try {
      const response = await fetch('http://localhost:4000/api/historialAcademico/actualizarhistorial', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(nuevoHistorial),
      });
  
      if (response.ok) {
        console.log("Historial actualizado con éxito");
        await fetchHistorialPorPersona(nuevoHistorial.Cod_persona); // Recarga los historiales
        setModalVisible(false);
        setHistorialAEditar(null);
      } else {
        const errorData = await response.json();
        console.error('Error al actualizar el historial:', errorData);
      }
    } catch (error) {
      console.error('Error al actualizar el historial:', error);
    }
  };  
  
  const handleCancelModal = () => {
    setModalVisible(false);
    setHistorialAEditar(null); // Limpia el historial en edición
    // Solo reinicia el formulario si no estás editando
    if (!historialAEditar) resetForm();
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
        const response = await fetch(`http://localhost:4000/api/historialAcademico/eliminarhistorial`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ Cod_historial_academico: id }),
        });

        if (response.ok) {
          Swal.fire('Eliminado', 'El historial ha sido eliminado correctamente.', 'success');
          fetchHistorialPorPersona(); // Llamar a la función para actualizar los datos
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

  const generarReportePDF = (tipoReporte) => {
    let registrosParaReporte = [];
    let titulo = '';
    let subtitulo = '';
    let encabezadoTabla = [];
    let cuerpoTabla = [];
  
    // Filtrar registros según el tipo de reporte
    switch (tipoReporte) {
      case 'grados':
        registrosParaReporte = listaGradosAcademicos;
        titulo = 'Reporte de Grados Académicos';
        subtitulo = 'Lista de Grados';
        encabezadoTabla = [['#', 'Grado Académico']];
        cuerpoTabla = registrosParaReporte.map((grado, index) => [index + 1, grado.Descripcion]);
        break;
  
      case 'estudiantesPorGrado':
        registrosParaReporte = listaGradosAcademicos;
        titulo = 'Reporte de Estudiantes por Grado';
        subtitulo = 'Lista de Estudiantes por Grado';
        encabezadoTabla = [['#', 'Grado Académico', 'Nombre Estudiante']];
        cuerpoTabla = registrosParaReporte.map((grado, index) => {
          const estudiantesPorGrado = listaEstudiantes.filter((estudiante) => estudiante.Cod_grado_academico === grado.Cod_grado_academico);
          return estudiantesPorGrado.map((estudiante, idx) => [
            `${index + 1}.${idx + 1}`,
            grado.Descripcion,
            `${estudiante.Nombre} ${estudiante.Primer_apellido}`,
          ]);
        }).flat();
        break;
  
      case 'historialesEstudiantes':
        registrosParaReporte = listaHistoriales;
        titulo = 'Reporte de Historiales Académicos';
        subtitulo = 'Historiales Académicos de los Estudiantes';
        encabezadoTabla = [['#', 'Nombre Estudiante', 'Grado', 'Año Académico', 'Promedio Anual']];
        cuerpoTabla = registrosParaReporte.map((historial, index) => {
          const estudiante = listaEstudiantes.find((e) => e.cod_persona === historial.Cod_persona);
          const grado = listaGradosAcademicos.find((g) => g.Cod_grado_academico === historial.Cod_grado);
          return [
            index + 1,
            `${estudiante.Nombre} ${estudiante.Primer_apellido}`,
            grado ? grado.Descripcion : 'N/A',
            historial.Año_Academico,
            historial.Promedio_Anual,
          ];
        });
        break;
  
      default:
        console.error('Tipo de reporte no válido');
        return;
    }
  
    // Validar si hay registros para mostrar
    if (registrosParaReporte.length === 0) {
      swal.fire({
        icon: 'warning',
        title: 'Sin datos para el reporte',
        text: 'No hay registros disponibles para generar el reporte.',
      });
      return; // No continuar si no hay datos
    }
  
    const doc = new jsPDF();
    const img = new Image();
    img.src = logo; // Asegúrate de que esta URL esté correcta.
  
    // Obtener fecha y hora de generación
    const now = new Date();
    const fechaHoraGeneracion = `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;
  
    img.onload = () => {
      // Agregar logo
      doc.addImage(img, 'PNG', 10, 10, 30, 30);
  
      let yPosition = 20;
  
      // Título principal
      doc.setFontSize(18);
      doc.setTextColor(0, 102, 51); // Verde
      doc.text('SAINT PATRICK\'S ACADEMY', doc.internal.pageSize.width / 2, yPosition, { align: 'center' });
  
      yPosition += 12;
  
      // Subtítulo
      doc.setFontSize(16);
      doc.text(titulo, doc.internal.pageSize.width / 2, yPosition, { align: 'center' });
  
      yPosition += 10;
  
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
  
      yPosition += 4;
  
      // Generar tabla con registros
      doc.autoTable({
        startY: yPosition,
        head: encabezadoTabla,
        body: cuerpoTabla,
        headStyles: {
          fillColor: [0, 102, 51], // Verde oscuro para encabezado
          textColor: [255, 255, 255], // Texto blanco
          fontSize: 10,
        },
        styles: {
          fontSize: 10,
          cellPadding: 3,
        },
        alternateRowStyles: { fillColor: [240, 248, 255] }, // Fondo alternativo
        didDrawPage: (data) => {
          // Pie de página
          const pageCount = doc.internal.getNumberOfPages();
          const pageHeight = doc.internal.pageSize.height;
  
          // Fecha y hora en el lado izquierdo
          doc.setFontSize(10);
          doc.text(`Fecha y hora de generación: ${fechaHoraGeneracion}`, 10, pageHeight - 10);
  
          // Número de página en el lado derecho
          doc.text(`Página ${data.pageNumber} de ${pageCount}`, doc.internal.pageSize.width - 50, pageHeight - 10);
        },
      });
  
      // Guardar el PDF
      doc.save(`Reporte_${tipoReporte}_${new Date().toLocaleDateString()}.pdf`);
    };
  
    img.onerror = () => {
      console.warn('No se pudo cargar el logo. El PDF se generará sin el logo.');
      doc.save(`Reporte_${tipoReporte}_${new Date().toLocaleDateString()}.pdf`);
    };
  };    

  const generarReporteExcel = (tipoReporte) => {
    let encabezados;
    let datos;
  
    // Definir los encabezados según el tipo de reporte
    if (tipoReporte === 'grados') {
      encabezados = [
        ["Saint Patrick Academy"],
        ["Reporte de Grados Académicos"],
        [], // Espacio en blanco
        ['#', 'Código de Grado', 'Nombre del Grado'],
      ];
      // Datos de los grados académicos
      datos = listaGradosAcademicos.map((grado, index) => [
        index + 1,
        grado.Cod_grado_academico,
        grado.Descripcion,
      ]);
    }
  
    if (tipoReporte === 'estudiantesPorGrado') {
      encabezados = [
        ["Saint Patrick Academy"],
        ["Reporte de Estudiantes por Grado"],
        [], // Espacio en blanco
        ['#', 'Nombre Estudiante', 'Grado', 'Año Académico'],
      ];
      // Datos de los estudiantes por grado
      datos = listaEstudiantes.map((estudiante, index) => [
        index + 1,
        `${estudiante.Nombre} ${estudiante.Primer_apellido} ${estudiante.Segundo_apellido}`,
        listaGradosAcademicos.find(grado => grado.Cod_grado_academico === estudiante.Cod_grado_academico)?.Descripcion || 'N/A',
        estudiante.Año_Academico,
      ]);
    }
  
    if (tipoReporte === 'historialesEstudiantes') {
      encabezados = [
        ["Saint Patrick Academy"],
        ["Reporte de Historiales Académicos de Estudiantes"],
        [], // Espacio en blanco
        ['#', 'Estudiante', 'Grado', 'Promedio Anual', 'Instituto', 'Observaciones'],
      ];
      // Datos de los historiales de los estudiantes
      datos = listaHistoriales.map((historial, index) => [
        index + 1,
        `${historial.Nombre} ${historial.Primer_apellido} ${historial.Segundo_apellido}`,
        listaGradosAcademicos.find(grado => grado.Cod_grado_academico === historial.Cod_grado_academico)?.Descripcion || 'N/A',
        historial.Promedio_Anual,
        listaInstitutos.find(instituto => instituto.Cod_Instituto === historial.Cod_Instituto)?.Nom_Instituto || 'N/A',
        historial.Observacion || 'Sin Observaciones',
      ]);
    }
  
    // Lógica para generar el reporte de Excel
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([ ...encabezados, ...datos ]);
  
    XLSX.utils.book_append_sheet(wb, ws, 'Reporte');
    XLSX.writeFile(wb, `Reporte_${tipoReporte}_${new Date().toLocaleDateString()}.xlsx`);
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
              onClick={() => generarReportePDF('grados')}
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
              onClick={() => generarReporteExcel('grados')}
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
                LISTA DE GRADOS
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
              {currentRecords2.map((gradoM, index) => (
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
                onClick={() => generarReportePDF('estudiantes')}
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
                <CIcon icon={cilFile} size="sm" /> Abrir en PDF
              </CDropdownItem>

              {/* Opción para Excel */}
              <CDropdownItem
                onClick={() => generarReporteExcel('estudiantes')}
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
                <CIcon icon={cilSpreadsheet} size="sm" /> Descargar Excel
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
            onClick={() => generarReportePDF('historiales')}
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
            <CIcon icon={cilFile} size="sm" /> Abrir en PDF
          </CDropdownItem>

          {/* Opción para Excel */}
          <CDropdownItem
            onClick={() => generarReporteExcel('historiales')}
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
            <CIcon icon={cilSpreadsheet} size="sm" /> Descargar Excel
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
            <CTableHeaderCell>Fecha Registro</CTableHeaderCell>
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
      <CContainer>
        {currentView === "historiales" && renderHistorialesView()}
        {currentView === "grados" && renderGradosView()}
        {currentView === "estudiantes" && renderEstudiantesView()}
      </CContainer>
      <CModal visible={modalVisible} onClose={handleCancelModal} backdrop="static" keyboard={false}>
      <CModalHeader>
        <CModalTitle>{historialAEditar ? 'Editar Historial' : 'Agregar Historial'}</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <CForm>
          {/* Campo de Estado */}
          <CFormSelect
            label="Estado"
            value={nuevoHistorial.Cod_estado}
            onChange={(e) => handleInputChange(e, 'Cod_estado')}
          >
            <option value="">Seleccione un estado</option>
            {estadonota.map((estado) => (
              <option key={estado.Cod_estado} value={estado.Cod_estado}>
                {estado.Descripcion}
              </option>
            ))}
          </CFormSelect>

          {/* Campo de Estudiante */}
          <CFormSelect
            label="Estudiante"
            value={nuevoHistorial.Cod_persona}
            onChange={(e) => handleInputChange(e, 'Cod_persona')}
          >
            <option value="">Seleccione un estudiante</option>
            {Persona.map((persona) => (
              <option key={persona.cod_persona} value={persona.cod_persona}>
                {`${persona.Nombre} ${persona.Segundo_nombre || ''} ${persona.Primer_apellido} ${persona.Segundo_Apellido || ''}`.trim()}
              </option>
            ))}
          </CFormSelect>

          {/* Campo de Grado */}
          <CFormSelect
            label="Grado"
            value={nuevoHistorial.Cod_grado}
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
            value={nuevoHistorial.Cod_Instituto}
            onChange={(e) => handleInputChange(e, 'Cod_Instituto')}
          >
            <option value="">Seleccione una opción</option>
            {Instituto.length > 0 ? (
              Instituto.map((instituto) => (
                <option key={instituto.Cod_Instituto} value={instituto.Cod_Instituto}>
                  {instituto.Nom_Instituto}
                </option>
              ))
            ) : (
              <option>Cargando institutos...</option>
            )}
          </CFormSelect>

          {/* Campo de Observaciones */}
          <CFormInput
            label="Observaciones"
            type="text"
            value={nuevoHistorial.Observacion}
            onChange={(e) => handleInputChange(e, 'Observacion')}
            placeholder="Ingrese observaciones"
          />
        </CForm>
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={handleCancelModal}>Cancelar</CButton>
        <CButton color="primary" onClick={historialAEditar ? handleUpdateHistorial : handleCreateHistorial}>
          {historialAEditar ? 'Actualizar' : 'Crear'}
        </CButton>
      </CModalFooter>
    </CModal>
    </CContainer>
  );
};

export default ListaHistoriales;