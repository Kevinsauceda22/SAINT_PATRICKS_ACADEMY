import React, { useEffect, useState, useRef } from 'react';
import { CSidebarNav } from '@coreui/react';
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
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const ListaHistoriales = () => {
  const [historiales, setHistoriales] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalReportVisible, setModalReportVisible] = useState(false); // Modal de Reporte
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [historialAEditar, setHistorialAEditar] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1); // Estado para la página actual
  const [itemsPerPage, setItemsPerPage] = useState(5); // Estado para los elementos por página
  const [GradosMatricula, setGradosMatricula] = useState([]);
  const [Grados, setGrados] = useState([]);
  const [currentView, setCurrentView] = useState("grados");
  const [sortConfig, setSortConfig] = useState({ key: "Nombre_grado", direction: "asc" });
  const [verEstudiantes, setverSestudiantes] = useState(false);
  const [gradoSeleccionado, setGradoSeleccionado] = useState(null); // Almacena el grado seleccionado
  const [Estudiantes, setEstudiantes] = useState([]);
  const [verHistoriales, setVerHistoriales] = useState(false);
  const [Instituto, setInstituto] = useState([]);
  const [Persona, setPersona] = useState([]);
  const [selectedEstudiante, setSelectedEstudiante] = useState(null); // Para almacenar el estudiante seleccionado
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
    fetchGradosMatricula();
    fetchPersonasPorGrado();
  }, []);

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

  const fetchPersonasPorGrado = async (codGrado) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:4000/api/historialAcademico/gradosMatricula/${codGrado}`);
      if (!response.ok) throw new Error("Error al obtener las personas del grado");
      const data = await response.json();
      setEstudiantes(data.data || []); // Asegura que Estudiantes sea un array si no hay datos
    } catch (err) {
      setError("Error al cargar los datos: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const [recordsPerPage2, setRecordsPerPage2] = useState(5);
  const [searchTerm2, setSearchTerm2] = useState('');
  const [currentPage2, setCurrentPage2] = useState(1);

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
  
  // Cambiar página
  const paginate2 = (pageNumber) => {
  if (pageNumber > 0 && pageNumber <= Math.ceil(filteredGrados.length / recordsPerPage2)) {
    setCurrentPage2(pageNumber);
  }
  }

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
    PNombre_persona: persona.PNombre_persona,
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
  const currentRecords3 = filteredEstudiantes.slice(indexOfFirstRecord3, indexOfLastRecord3);
  
  // Cambiar página
  const paginate3 = (pageNumber) => {
  if (pageNumber > 0 && pageNumber <= Math.ceil(filteredEstudiantes.length / recordsPerPage3)) {
    setCurrentPage3(pageNumber);
  }
  }
  

  const handleVerEstudiante = () => {
    // Cambiar el estado para mostrar la vista de estudiantes
    setverSestudiantes(true);
  };

  const handleVolver = () => {
    // Cambiar el estado para volver a la vista de historiales
    setverSestudiantes(false);
  };

  // Función para filtrar los historiales por estudiante
  const getHistorialesPorEstudiante = (estudianteId) => {
    return currentHistoriales.filter(historial => historial.Estudiante === estudianteId);
  };

  // Función para cambiar de vista a los historiales de un estudiante
  const handleVerHistoriales = (estudianteId) => {
    setSelectedEstudiante(estudianteId);
    setCurrentView("historiales");
  };

  const handleVolverAEstudiantes = () => {
    setVerHistoriales(false);
    setEstudianteSeleccionado(null);
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

  const fetchHistorial = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/historialAcademico/historiales');
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
      historial.Cod_estado === 1 ? "aprobado" :
        historial.Cod_estado === 2 ? "reprobado" : "otro estado";

    // Asegurarse de que `searchTerm` y `estadoTexto` están en minúsculas
    return (
      historial.Cod_historial_academico.toString().includes(searchTerm) ||
      historial.Cod_estado.toString().includes(searchTerm) ||
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

  const handleClearSearch = () => {
    setSearchTerm(''); // Limpiar el término de búsqueda
  };

  const validateFields = () => {
    const { Estudiante, Grado, Año_Academico, Promedio_Anual, Instituto } = nuevoHistorial;
    if (!Estudiante || !Grado || !Año_Academico || !Promedio_Anual || !Instituto) {
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
      const response = await fetch('http://localhost:4000/api/historialAcademico/crearhistorial', {
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
      const response = await fetch('http://localhost:4000/api/historialAcademico/actualizarhistorial', {
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

  const resetForm = () => {
    setNuevoHistorial({
      Estudiante: 'Seleccione una opción',
      Grado: 'Seleccione una opción', // Asigna un valor predeterminado si aplica
      Año_Academico: 'Seleccione una opción',
      Promedio_Anual: 0,
      Instituto: ''
    });
    setError('');
    setHistorialAEditar(null);
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
        const response = await fetch(`http://localhost:4000/api/historialAcademico/eliminarhistorial`, {
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

  const downloadPDF = () => {
    const doc = new jsPDF();

    // Cambia el color del texto a verde para el título
    doc.setTextColor(0, 128, 0); // Verde (RGB: 0, 128, 0)

    // Añadir título
    doc.text('Historiales Académicos', 14, 16);

    // Obtiene la altura del título
    const titleHeight = 10; // altura aproximada del título

    // Restablece el color de texto a negro para el resto del documento
    doc.setTextColor(0, 0, 0);

    // Dibuja la tabla en una posición más baja para evitar la superposición
    autoTable(doc, {
      startY: 20 + titleHeight, // Esto coloca la tabla justo debajo del título
      head: [['Código de Historial', 'Estado', 'Estudiante', 'Grado', 'Año Académico', 'Promedio Anual', 'Fecha Registro', 'Instituto']],
      body: filteredHistoriales.map(historial => [
        historial.Cod_historial_academico,
        historial.Cod_estado === 1 ? "APROBADO" :
          historial.Cod_estado === 2 ? "REPROBADO" : "OTRO ESTADO",
        historial.Estudiante,
        historial.Grado,
        historial.Año_Academico,
        historial.Promedio_Anual,
        new Date(historial.Fecha_Registro).toLocaleDateString('es-ES'),
        historial.Instituto
      ]),
      headStyles: {
        fillColor: [0, 128, 0], // Color verde en RGB para el fondo del encabezado
        textColor: [255, 255, 255], // Texto en blanco en RGB
        fontStyle: 'bold' // Negrita para el encabezado
      }
    });

    doc.save('historiales.pdf');
  };

  const downloadExcel = () => {
    if (filteredHistoriales.length === 0) {
      alert('No hay datos para descargar');
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(filteredHistoriales.map(historial => ({
      'Código de Historial': historial.Cod_historial_academico,
      'Estado': historial.Cod_estado === 1 ? "APROBADO" :
        historial.Cod_estado === 2 ? "REPROBADO" : "OTRO ESTADO",
      'Estudiante': historial.Estudiante,
      'Grado': historial.Grado,
      'Año Académico': historial.Año_Academico,
      'Promedio Anual': historial.Promedio_Anual,
      'Fecha Registro': new Date(historial.Fecha_Registro).toLocaleDateString('es-ES'),
      'Instituto': historial.Instituto
    })));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Historiales');

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, 'historiales.xlsx');
  };


  const renderGradosView = () => {
    // Agrupamos los estudiantes por grado
    const estudiantesPorGrado = GradosMatricula.map((gradoM) => {
      const estudiantesEnGrado = Persona.filter((persona) => persona.Cod_grado === gradoM.Cod_grado);
      return { ...gradoM, estudiantes: estudiantesEnGrado };
    });

    return (
      <div>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <CButton
            style={{ backgroundColor: "#6C8E58", color: "white" }}
            onClick={() => setModalReportVisible(true)} // Abre modal de reporte
          >
            <CIcon icon={cilDescription} /> Reporte
          </CButton>
        </div>
        <CRow className="align-items-center mb-5">
        {/* Botón "Volver a Secciones" a la izquierda */}
        <CCol xs="12" className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
          <div className="flex-grow-1 text-center">
            <h4 className="text-center fw-semibold pb-2 mb-0" style={{ display: "inline-block", borderBottom: "2px solid #4CAF50" }}> LISTA DE GRADOS </h4>
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
                placeholder="Buscar grado..."
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
        <div className="table-responsive"style={{maxHeight: '400px',margin: '0 auto',overflowX: 'auto',overflowY: 'auto',boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)', }}>
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
                <CTableDataCell>{index + 1}</CTableDataCell>
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
                      fetchPersonasPorGrado(gradoM.Cod_grado); // Llama a la función para obtener los estudiantes del grado
                      setGradoSeleccionado(gradoM); // Almacena el grado seleccionado
                      setCurrentView("estudiantes"); // Cambia la vista a estudiantes
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

  const renderEstudiantesView = () => (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <CButton
          style={{ backgroundColor: "#6C8E58", color: "white" }}
          onClick={() => setModalReportVisible(true)} // Abre modal de reporte
        >
          <CIcon icon={cilDescription} /> Reporte
        </CButton>
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
               style={{ width: '80px',height:'35px', display: 'inline-block',fontSize: '0.8rem'}}
                placeholder="Buscar persona..."
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
      <div className="table-responsive"style={{maxHeight: '400px',margin: '0 auto',overflowX: 'auto',overflowY: 'auto',boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)', }}>
      <CTable striped bordered hover responsive>
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell>#</CTableHeaderCell>
            <CTableHeaderCell>Estudiante</CTableHeaderCell>
            <CTableHeaderCell>Acciones</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {currentRecords3.map((persona, index) => (
            <CTableRow key={index}>
              <CTableDataCell>{index + 1}</CTableDataCell>
              <CTableDataCell>
                {`${persona.PNombre_persona} ${persona.SNombre_persona || ""} ${persona.PApellido_persona} ${persona.SApellido_persona || ""}`.trim()}
              </CTableDataCell>
              <CTableDataCell>
                <CButton color="info"
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
                  onClick={() => handleVerHistoriales(persona)}>
                  Ver Historiales
                </CButton>
              </CTableDataCell>
            </CTableRow>
          ))}
        </CTableBody>
      </CTable>
      </div>

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
                disabled={currentPage3 === Math.ceil(filteredEstudiantes.length / recordsPerPage3)} // Deshabilitar si estás en la última página
                onClick={() => paginate3(currentPage3 + 1)}>
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
        <CButton
          style={{ backgroundColor: '#6C8E58', color: 'white' }}
          onClick={() => setModalReportVisible(true)} // Abre modal de reporte
        >
          <CIcon icon={cilDescription} /> Reporte
        </CButton>
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
            <CTableHeaderCell>Acciones</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {historiales.map((historial, index) => (
            <CTableRow key={index}>
              <CTableDataCell>{index + 1}</CTableDataCell>
              <CTableDataCell>{getEstadoTexto(historial.Cod_estado)}</CTableDataCell>
              <CTableDataCell>{historial.Cod_persona}</CTableDataCell>
              <CTableDataCell>{historial.Grado}</CTableDataCell>
              <CTableDataCell>{historial.Año_Academico}</CTableDataCell>
              <CTableDataCell>{historial.Promedio_Anual}</CTableDataCell>
              <CTableDataCell>{new Date(historial.Fecha_Registro).toLocaleDateString('es-ES')}</CTableDataCell>
              <CTableDataCell>{historial.Cod_Instituto}</CTableDataCell>
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
            {/* Campo para seleccionar el estudiante */}
            <CFormSelect
              label="Estudiante"
              value={nuevoHistorial.Cod_persona} // Aquí guardamos el código del estudiante
              onChange={(e) => setNuevoHistorial({ ...nuevoHistorial, Cod_persona: e.target.value })}
            >
              <option value="">Seleccione un estudiante</option>
              {Persona.map((persona) => (
                <option
                  key={persona.cod_persona}
                  value={persona.cod_persona} // Guardamos el cod_persona como valor
                >
                  {`${persona.Nombre} ${persona.Segundo_nombre || ''} ${persona.Primer_apellido} ${persona.Segundo_Apellido || ''}`.trim()}
                </option>
              ))}
            </CFormSelect>

            {/* Campo para seleccionar el grado */}
            <CFormSelect
              label="Grado"
              value={nuevoHistorial.Grados}
              onChange={(e) => handleInputChange(e, 'Grado')}
            >
              <option value="">Seleccione una opción</option>
              {Grados.length > 0 ? (
                Grados.map((grado, index) => (
                  <option key={index} value={grado.Nombre_grado}>
                    {grado.Nombre_grado}
                  </option>
                ))
              ) : (
                <option>Cargando grados...</option>
              )}
            </CFormSelect>

            {/* Campo para seleccionar el año académico */}
            <CFormSelect
              label="Año Académico"
              value={nuevoHistorial.Año_Academico}
              onChange={(e) => handleInputChange(e, 'Año_Academico')}
              options={generarAnios().map(anio => ({ label: anio, value: anio }))}
            />

            {/* Campo de promedio anual */}
            <CFormInput
              label="Promedio Anual"
              type="number"
              value={nuevoHistorial.Promedio_Anual}
              onChange={(e) => handleInputChange(e, 'Promedio_Anual')}
            />

            {/* Campo para seleccionar el instituto */}
            <CFormSelect
              label="Instituto"
              value={nuevoHistorial.Cod_Instituto} // Guardamos el código del instituto
              onChange={(e) => handleInputChange(e, 'Cod_Instituto')} // Actualizamos Cod_Instituto en el estado
            >
              <option value="">Seleccione una opción</option>
              {Instituto.length > 0 ? (
                Instituto.map((instituto) => (
                  <option key={instituto.Cod_Instituto} value={instituto.Cod_Instituto}>
                    {instituto.Nom_Instituto} {/* Mostramos el nombre del instituto */}
                  </option>
                ))
              ) : (
                <option>Cargando institutos...</option>
              )}
            </CFormSelect>

            {/* Nuevo campo para Observaciones */}
            <CFormInput
              label="Observaciones"
              type="text"
              value={nuevoHistorial.Observacion}
              onChange={(e) =>
                setNuevoHistorial({
                  ...nuevoHistorial,
                  Observacion: e.target.value.toUpperCase(), // Convierte a mayúsculas
                })
              }
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
