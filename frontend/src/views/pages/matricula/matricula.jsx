import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Importa useNavigate de react-router-dom
import Swal from 'sweetalert2';
import { cilSearch, cilPen, cilTrash, cilPlus, cilSave, cilBrushAlt, cilFile, cilInfo } from '@coreui/icons';
import CIcon from '@coreui/icons-react';
import {
  CButton,
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
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CPagination,
  CRow,
  CCol,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
  CSpinner,
  CCard,
  CCardBody,
  CCardTitle,
  CCardText,
} from '@coreui/react';
import { cilUser, cilCalendar, cilCheckCircle, cilUserFemale, cilEducation, cilSchool } from '@coreui/icons';
import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import logo from 'src/assets/brand/logo_saint_patrick.png';

const MatriculaForm = () => {
  const [loading, setLoading] = useState(true);
  const [opciones, setOpciones] = useState({
    estados_matricula: [],
    tipos_matricula: [],
  });
  
  const [hijos, setHijos] = useState([]);
  const [dniPadre, setDniPadre] = useState('');
  const [nombrePadre, setNombrePadre] = useState('');
  const [apellidoPadre, setApellidoPadre] = useState('');
  const [step, setStep] = useState(1); // Estado para el paso actual
  const [selectedSeccion, setSelectedSeccion] = useState(''); // Añadir esta línea
  const [secciones, setSecciones] = useState([]); // Estado para almacenar las secciones disponibles
  const [selectedGrado, setSelectedGrado] = useState(''); // Define el estado para el grado seleccionado
  const [periodoActivo, setPeriodoActivo] = useState(null); // Nuevo estado para el período activo
  const navigate = useNavigate(); // Hook para la navegación
  const [matriculaData, setMatriculaData] = useState({
    fecha_matricula: '',
    cod_grado: '',
    cod_seccion: '',
    cod_estado_matricula: '',
    cod_periodo_matricula: periodoActivo?.Cod_periodo_matricula || '', // Asegura que se asigne el período activo
    cod_tipo_matricula: '',
    cod_hijo: '',
    primer_nombre_hijo: '',      // Nuevo campo
    segundo_nombre_hijo: '',     // Nuevo campo
    primer_apellido_hijo: '',    // Nuevo campo
    segundo_apellido_hijo: '',   // Nuevo campo
    fecha_nacimiento_hijo: '',   // Nuevo campo
    nombre_completo_hijo: '', // Nuevo campo consolidado

  });

  const [modalVisible, setModalVisible] = useState(false);
  const [matriculas, setMatriculas] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);
  
  const cargarOpcionesConPredeterminados = async () => {
    try {
      // Llamada a la API para obtener opciones
      const response = await axios.get('http://localhost:4000/api/matricula/opciones');
      const { estados_matricula, tipos_matricula } = response.data;
  
      // Asignar opciones al estado
      setOpciones({ estados_matricula, tipos_matricula });
  
      // Buscar valores predeterminados
      const estadoPorDefecto = estados_matricula.find((estado) => estado.Tipo === 'Falta de Pago');
      const tipoPorDefecto = tipos_matricula.find((tipo) => tipo.Tipo === 'Estandar');
  
      console.log("Estado predeterminado encontrado:", estadoPorDefecto);
      console.log("Tipo de matrícula predeterminado encontrado:", tipoPorDefecto);
  
      // Actualizar el estado del formulario con los valores predeterminados
      setMatriculaData((prevData) => ({
        ...prevData,
        cod_estado_matricula: estadoPorDefecto?.Cod_estado_matricula || '',
        cod_tipo_matricula: tipoPorDefecto?.Cod_tipo_matricula || '',
      }));
  
      // Validar que los valores predeterminados existan
      if (!estadoPorDefecto || !tipoPorDefecto) {
        Swal.fire(
          'Advertencia',
          'No se encontraron valores predeterminados. Verifique la configuración.',
          'warning'
        );
      }
    } catch (error) {
      console.error('Error al cargar las opciones:', error);
      Swal.fire('Error', 'Hubo un problema al cargar las opciones de matrícula.', 'error');
    }
  };
  
// useEffect para cargar las opciones cuando se monta el componente
useEffect(() => {
  cargarOpcionesConPredeterminados();
}, []);
  // Función para manejar el cambio en el ComboBox
  const handleComboBoxChange = (e) => {
    const selectedValue = e.target.value;
    
    if (selectedValue === 'porGrado') {
      navigate('/matriculasPorGrado');
    } else if (selectedValue === 'porPeriodo') {
      navigate('/matriculasPorPeriodo');
    } else if (selectedValue === 'porAnioAnterior') {
      navigate('/matriculasAnioAnterior');
    }
  };
  const handlePaste = (e) => {
    e.preventDefault();
    Swal.fire('Advertencia', 'No se permite copiar y pegar en este campo.', 'warning');
  };
  
  const handleCopy = (e) => {
    e.preventDefault();
    Swal.fire('Advertencia', 'No se permite copiar y pegar en este campo.', 'warning');
  };
  
const obtenerOpciones = async () => {
  try {
    setLoading(true);
    const response = await axios.get('http://localhost:4000/api/matricula/opciones');
    const opcionesData = response.data;

    // Verificar los datos completos recibidos desde el servidor
    console.log("Opciones de matrícula recibidas:", opcionesData);

    // Verificar específicamente los datos de periodos_matricula
    if (opcionesData.periodos_matricula && opcionesData.periodos_matricula.length > 0) {
      console.log("Periodos de matrícula activos:", opcionesData.periodos_matricula);
    } else {
      console.log("No se encontraron períodos de matrícula activos");
    }

    // Detectar el primer período activo disponible
    const periodoActivoEncontrado = opcionesData.periodos_matricula?.find(p => p.estado === 'activo');
    if (periodoActivoEncontrado) {
      console.log("Período activo encontrado:", periodoActivoEncontrado);

      // Guardar el período activo en el estado
      setPeriodoActivo(periodoActivoEncontrado);
      setMatriculaData((prev) => ({
        ...prev,
        cod_periodo_matricula: periodoActivoEncontrado.Cod_periodo_matricula, // Asigna el período activo
      }));
    } else {
      console.log("No hay períodos activos disponibles.");
      setPeriodoActivo(null); // No hay período activo encontrado
    }

    // Asignar todas las opciones recibidas al estado
    setOpciones(opcionesData);

  } catch (error) {
    console.error('Error al cargar las opciones de matrícula:', error);
    Swal.fire('Error', 'Error al cargar las opciones de matrícula.', 'error');
  } finally {
    setLoading(false);
  }
};

  
  
  useEffect(() => {
    if (modalVisible) {
      setMatriculaData((prev) => ({
        ...prev,
        fecha_matricula: getCurrentDate(), // Asigna la fecha actual automáticamente
      }));
    }
  }, [modalVisible]);
  

  const obtenerMatriculas = async () => {
    try {
      const response = await axios.get('http://localhost:4000/api/matricula/matriculas');
      const matriculasCargadas = response.data.data || [];
  
      // Asocia el año académico a cada matrícula
      const matriculasConAnio = matriculasCargadas.map((matricula) => {
        const periodo = opciones.periodos_matricula?.find(
          (p) => String(p.Cod_periodo_matricula) === String(matricula.Cod_periodo_matricula)
        );
        return {
          ...matricula,
          Anio_academico: periodo?.Anio_academico || 'N/A', // Asignar el año académico
        };
      });
  
      setMatriculas(matriculasConAnio);
    } catch (error) {
      console.error('Error al obtener las matrículas:', error);
    }
  };
  

  const obtenerHijos = async () => {
    if (!dniPadre) {
      Swal.fire('Advertencia', 'Por favor, ingrese un DNI válido para el padre.', 'warning');
      return;
    }
  
    try {
      const response = await axios.get(`http://localhost:4000/api/matricula/hijos/${dniPadre}`);
      const { padre, hijos } = response.data;
  
      if (!padre || !padre.Nombre_Padre) {
        Swal.fire('Error', 'No se encontraron datos del padre.', 'error');
        return;
      }
  
      if (!Array.isArray(hijos) || hijos.length === 0) {
        Swal.fire('Advertencia', 'No se encontraron hijos asociados.', 'warning');
        setNombrePadre(padre.Nombre_Padre || '');
        setApellidoPadre(padre.Apellido_Padre || '');
        setHijos([]);
        return;
      }
  
      setHijos(
        hijos.map((hijo) => ({
          ...hijo,
          NombreCompleto: `${hijo.Primer_nombre} ${hijo.Segundo_nombre || ''} ${hijo.Primer_apellido} ${hijo.Segundo_apellido || ''}`.trim(),
          FechaNacimiento: hijo.fecha_nacimiento
            ? new Date(hijo.fecha_nacimiento).toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              })
            : 'N/A',
        }))
      );
  
      setNombrePadre(padre.Nombre_Padre || '');
      setApellidoPadre(padre.Apellido_Padre || '');
    } catch (error) {
      console.error('Error al obtener los hijos asociados:', error);
      Swal.fire(
        'Error',
        error.response?.data?.message || 'Hubo un problema al obtener los hijos asociados.',
        'error'
      );
    }
  };

// Ejemplo de cómo establecer el período activo
useEffect(() => {
  const cargarPeriodoActivo = async () => {
    try {
      const response = await axios.get('http://localhost:4000/api/matricula/opciones');
      const periodoEncontrado = response.data.periodos_matricula.find(p => p.estado === 'activo');
      setPeriodoActivo(periodoEncontrado); // Guarda el período activo
    } catch (error) {
      console.error('Error al cargar el período activo:', error);
    }
  };

  cargarPeriodoActivo();
}, []);

 // Función para obtener las secciones por grado seleccionado
const obtenerSeccionesPorGrado = async (codGrado) => {
  if (!codGrado || !periodoActivo) { // Verifica que haya un grado y un período activo
    setSecciones([]); // Limpiar las secciones si no se selecciona un grado o no hay período activo
    return;
  }

  try {
    // Enviar la solicitud al backend con los parámetros necesarios
    const response = await axios.get(
      `http://localhost:4000/api/matricula/secciones/${codGrado}`, 
      { params: { cod_periodo_matricula: periodoActivo.Cod_periodo_matricula } } // Enviar el período activo como parámetro
    );

    console.log('Secciones obtenidas:', response.data.data); // Verificar la respuesta de secciones en la consola
    setSecciones(response.data.data || []); // Actualizar el estado con las secciones obtenidas
  } catch (error) {
    console.error('Error al obtener las secciones del grado seleccionado:', error);
    alert('Error al obtener las secciones del grado seleccionado');
  }
};

// Manejar el cambio de grado seleccionado
const handleGradoChange = (e) => {
  const codGrado = e.target.value; // Captura el valor del grado seleccionado
  setSelectedGrado(codGrado); // Actualiza el grado seleccionado
  obtenerSeccionesPorGrado(codGrado); // Llama a la función para obtener las secciones filtradas
};

const registrarEnBitacora = async (accion, descripcion) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return;

    const decodedToken = jwtDecode(token);
    const cod_usuario = decodedToken.cod_usuario;

    await axios.post('http://localhost:4000/api/bitacora/registro', {
      cod_usuario: cod_usuario,
      cod_objeto: 77, // Objeto Matrícula
      accion: accion,
      descripcion: descripcion
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  } catch (error) {
    console.error('Error al registrar en bitácora:', error);
  }
};

const handleSubmit = async (e) => {
  e.preventDefault();

  // Crear el objeto con los datos necesarios para el backend
  const dataToSend = {
    dni_padre: dniPadre,
    fecha_matricula: matriculaData.fecha_matricula,
    cod_grado: selectedGrado,
    cod_seccion: selectedSeccion,
    cod_estado_matricula: matriculaData.cod_estado_matricula,
    cod_periodo_matricula: matriculaData.cod_periodo_matricula,
    cod_tipo_matricula: matriculaData.cod_tipo_matricula,
    cod_hijo: matriculaData.cod_hijo,
  };

  // Lista de campos requeridos
  const requiredFields = [
    'dni_padre',
    'cod_grado',
    'cod_seccion',
    'cod_estado_matricula',
    'cod_tipo_matricula',
    'cod_hijo',
  ];

  // Verificar campos requeridos
  const missingFields = requiredFields.filter((field) => !dataToSend[field]);
  if (missingFields.length > 0) {
    Swal.fire(
      'Error',
      `Los siguientes campos son requeridos: ${missingFields.join(', ')}.`,
      'error'
    );
    return;
  }

  // Validar que la fecha de matrícula esté asignada automáticamente
  if (!dataToSend.fecha_matricula) {
    Swal.fire('Error', 'La fecha de matrícula no está asignada automáticamente.', 'error');
    return;
  }

  // Obtener el año académico del período actual
  const periodoActual = opciones?.periodos_matricula?.find(
    (p) => p.Cod_periodo_matricula === dataToSend.cod_periodo_matricula
  );
  const anioAcademicoActual = periodoActual?.Anio_academico;

  // Validar localmente si ya existe una matrícula en este año para este alumno
  const existeMatriculaEnAnio = matriculas.some(
    (matricula) =>
      matricula.cod_hijo === dataToSend.cod_hijo &&
      matricula.anio_academico === anioAcademicoActual
  );

  if (existeMatriculaEnAnio) {
    Swal.fire({
      title: 'Advertencia',
      text: `El alumno ya está matriculado en el período académico ${anioAcademicoActual}. No se puede registrar más de una vez en el mismo período.`,
      icon: 'warning',
    });
    return;
  }

  try {
    // Realizar la solicitud al backend
    const response = await axios.post('http://localhost:4000/api/matricula/crearmatricula', dataToSend);

    if (response.status === 201) {
      const message = response.data.message;

      // Preparar los datos para el PDF
      const matriculaDataForPDF = {
        codificacion_matricula: response.data?.codificacion_matricula || 'N/A',
        Nombre_Hijo: matriculaData.primer_nombre_hijo || 'N/A', // Ajuste para tomar el valor desde matriculaData
        Segundo_nombre_Hijo: matriculaData.segundo_nombre_hijo || 'N/A',
        Apellido_Hijo: matriculaData.primer_apellido_hijo || 'N/A',
        Segundo_apellido_Hijo: matriculaData.segundo_apellido_hijo || 'N/A',
        fecha_nacimiento_hijo: matriculaData.fecha_nacimiento_hijo || 'N/A',
        Nombre_Padre: nombrePadre || 'N/A',
        Apellido_Padre: apellidoPadre || 'N/A',
        Nombre_grado: opciones?.grados?.find((g) => g.Cod_grado === selectedGrado)?.Nombre_grado || 'N/A',
        Nombre_seccion: opciones?.secciones?.find((s) => s.Cod_secciones === selectedSeccion)?.Nombre_seccion || 'N/A',
        estado: opciones?.estados_matricula?.find(
          (estado) => estado.Cod_estado_matricula === matriculaData.cod_estado_matricula
        )?.Tipo || 'N/A',
        periodo: opciones?.periodos_matricula?.find(
          (periodo) => periodo.Cod_periodo_matricula === matriculaData.cod_periodo_matricula
        )?.Anio_academico || 'N/A',
        tipo: opciones?.tipos_matricula?.find(
          (tipo) => tipo.Cod_tipo_matricula === matriculaData.cod_tipo_matricula
        )?.Tipo || 'N/A',
      };

      // Mostrar alerta con opción de generar el PDF
      Swal.fire({
        title: 'Éxito',
        text: `${message}. ¿Deseas imprimir la ficha técnica del estudiante?`,
        icon: 'success',
        showCancelButton: true,
        confirmButtonText: 'Imprimir',
        cancelButtonText: 'Cancelar',
      }).then((result) => {
        if (result.isConfirmed) {
          handleViewPDF(matriculaDataForPDF);
        }
      });

      // Reiniciar el modal y los estados del formulario
      setModalVisible(false);
      setStep(1);
      setMatriculaData({
        fecha_matricula: getCurrentDate(),
        cod_grado: '',
        cod_seccion: '',
        cod_estado_matricula: '',
        cod_periodo_matricula: '',
        cod_tipo_matricula: '',
        cod_hijo: '',
        primer_nombre_hijo: '',
        segundo_nombre_hijo: '',
        primer_apellido_hijo: '',
        segundo_apellido_hijo: '',
        fecha_nacimiento_hijo: '',
      });
      setDniPadre('');
      setNombrePadre('');
      setApellidoPadre('');
      setSelectedGrado('');
      setSelectedSeccion('');
      obtenerMatriculas();
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Error al crear la matrícula.';
    console.error('Error al crear la matrícula:', errorMessage);

    Swal.fire('Error', errorMessage, 'error');
  }
};



const getCurrentDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0'); // Mes comienza en 0
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

  const handleSearch = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
    setCurrentPage(0);
  };
  const handleHijoChange = (e) => {
    const codHijo = e.target.value;
    setMatriculaData((prevData) => ({ ...prevData, cod_hijo: codHijo }));
  
    // Buscar los datos del hijo seleccionado
    const hijoSeleccionado = hijos.find((hijo) => hijo.Cod_persona === parseInt(codHijo, 10));
    if (hijoSeleccionado) {
      setMatriculaData((prevData) => ({
        ...prevData,
        nombre_completo_hijo: `${hijoSeleccionado.Primer_nombre} ${hijoSeleccionado.Segundo_nombre || ''} ${hijoSeleccionado.Primer_apellido} ${hijoSeleccionado.Segundo_apellido || ''}`.trim(),
        fecha_nacimiento_hijo: hijoSeleccionado.fecha_nacimiento?.split('T')[0] || 'N/A',
      }));
    }
  };
  
  

  const filteredMatriculas = matriculas.filter((matricula) =>
    matricula.codificacion_matricula.toLowerCase().includes(searchTerm)
  );

  const indexOfLastItem = (currentPage + 1) * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredMatriculas.slice(indexOfFirstItem, indexOfLastItem);


  useEffect(() => {
    obtenerOpciones();
    obtenerMatriculas();
  }, []);

  const exportToPDF = () => {
    const doc = new jsPDF();
  
    // Configurar la imagen del logo
    const img = new Image();
    img.src = logo; // Usar el logo importado desde el directorio
  
    img.onload = () => {
      // Añadir el logo en la esquina superior izquierda
      doc.addImage(img, 'PNG', 10, 10, 30, 30);
  
      // Encabezado del documento
      doc.setFontSize(18);
      doc.setTextColor(0, 102, 51); // Verde oscuro
      doc.text(
        "SAINT PATRICK'S ACADEMY",
        doc.internal.pageSize.width / 2,
        20,
        { align: 'center' }
      );
  
      // Título del reporte
      doc.setFontSize(14);
      doc.text(
        'Reporte General de Matrículas',
        doc.internal.pageSize.width / 2,
        30,
        { align: 'center' }
      );
  
      // Detalles de la institución
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(
        'Casa Club del periodista, Colonia del Periodista',
        doc.internal.pageSize.width / 2,
        40,
        { align: 'center' }
      );
      doc.text(
        'Teléfono: (504) 2234-8871',
        doc.internal.pageSize.width / 2,
        45,
        { align: 'center' }
      );
      doc.text(
        'Correo: info@saintpatrickacademy.edu',
        doc.internal.pageSize.width / 2,
        50,
        { align: 'center' }
      );
  
      // Línea divisoria
      doc.setLineWidth(0.5);
      doc.setDrawColor(0, 102, 51); // Verde oscuro
      doc.line(10, 55, doc.internal.pageSize.width - 10, 55);
  
      // Título de la tabla
      doc.setFontSize(12);
      doc.setTextColor(0, 51, 102); // Azul oscuro
      doc.text(
        'Detalles de Matrículas',
        doc.internal.pageSize.width / 2,
        65,
        { align: 'center' }
      );
  
      // Configurar la tabla de detalles de matrícula con diseño mejorado
      doc.autoTable({
        startY: 75,
        head: [['#', 'Cod Matrícula', 'Fecha Matrícula', 'Estado', 'Período', 'Grado', 'Sección']],
        body: matriculas.map((matricula, index) => [
          index + 1,
          matricula.codificacion_matricula,
          matricula.fecha_matricula.split('T')[0],
          opciones.estados_matricula?.find(e => e.Cod_estado_matricula === matricula.Cod_estado_matricula)?.Tipo || 'N/A',
          opciones.periodos_matricula?.find(p => p.Cod_periodo_matricula === matricula.Cod_periodo_matricula)?.Anio_academico || 'N/A',
          matricula.Nombre_grado || 'N/A',
          matricula.Nombre_seccion || 'N/A',
        ]),
        styles: {
          fontSize: 10,
          textColor: [34, 34, 34], // Gris oscuro para texto
          cellPadding: 4,
          valign: 'middle',
          overflow: 'linebreak',
        },
        headStyles: {
          fillColor: [0, 102, 51], // Verde oscuro para encabezados
          textColor: [255, 255, 255],
          fontSize: 10,
        },
        alternateRowStyles: { fillColor: [240, 248, 255] }, // Azul claro alternado para filas
        margin: { left: 10, right: 10 },
      });
  
      // Pie de página con fecha de generación
      doc.setFontSize(10);
      doc.setTextColor(100);
      const date = new Date().toLocaleDateString();
      doc.text(`Fecha de generación: ${date}`, 10, doc.internal.pageSize.height - 10);
  
      // Generar el blob y abrir en una nueva pestaña
      const pdfBlob = doc.output('blob');
      const pdfURL = URL.createObjectURL(pdfBlob);
      window.open(pdfURL); // Abre el archivo en una nueva pestaña
    };
  
    img.onerror = () => {
      Swal.fire('Error', 'No se pudo cargar el logo.', 'error');
    };
  };
  
  

const exportToExcel = () => {
  const workbook = XLSX.utils.book_new();

  // Datos de las matrículas con encabezado
  const worksheetData = [
      ['#', 'Cod Matrícula', 'Fecha Matrícula', 'Estado', 'Período', 'Grado', 'Sección'],
      ...matriculas.map((matricula, index) => [
          index + 1,
          matricula.codificacion_matricula,
          matricula.fecha_matricula.split('T')[0],
          opciones.estados_matricula?.find(e => e.Cod_estado_matricula === matricula.Cod_estado_matricula)?.Tipo || 'N/A',
          opciones.periodos_matricula?.find(p => p.Cod_periodo_matricula === matricula.Cod_periodo_matricula)?.Anio_academico || 'N/A',
          matricula.Nombre_grado || 'N/A',
          matricula.Nombre_seccion || 'N/A',
      ])
  ];

  // Crear la hoja de cálculo
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

  // Aplicar estilos personalizados
  const range = XLSX.utils.decode_range(worksheet['!ref']);
  for (let C = range.s.c; C <= range.e.c; ++C) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C });
      if (!worksheet[cellAddress]) continue;
      
      // Establecer estilos en el encabezado
      worksheet[cellAddress].s = {
          font: { bold: true, color: { rgb: "FFFFFF" } },
          fill: { fgColor: { rgb: "16A085" } }, // Fondo verde azulado
          alignment: { horizontal: "center", vertical: "center" }
      };
  }

  // Ajustar el ancho de las columnas para un mejor aspecto
  const columnWidths = [
      { wpx: 30 },   // #
      { wpx: 100 },  // Cod Matrícula
      { wpx: 100 },  // Fecha Matrícula
      { wpx: 80 },   // Estado
      { wpx: 80 },   // Período
      { wpx: 80 },   // Grado
      { wpx: 80 }    // Sección
  ];
  worksheet['!cols'] = columnWidths;

  // Añadir la hoja al libro de trabajo
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Matrículas');

  // Exportar el archivo
  XLSX.writeFile(workbook, 'Reporte_General_Matriculas.xlsx');
};


  const pageCount = Math.ceil(filteredMatriculas.length / itemsPerPage);
  
  
  const handleViewPDF = async (matricula) => {
    try {
      Swal.fire({
        title: 'Generando PDF...',
        text: 'Por favor espera mientras se completan los datos.',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });
  
      // Función para obtener el nombre del maestro
      const obtenerNombreMaestro = async (codSeccion) => {
        try {
          const response = await fetch(`http://localhost:4000/api/matricula/secciones/${matricula.Cod_grado}?cod_periodo_matricula=${matricula.Cod_periodo_matricula}`);
          if (response.ok) {
            const result = await response.json();
            const seccion = result.data.find((sec) => sec.Cod_secciones === codSeccion);
            if (seccion && seccion.Nombre_profesor) {
              return `${seccion.Nombre_profesor} ${seccion.Apellido_profesor || ''}`.trim();
            }
            return 'Sin Maestro Asignado'; // Valor predeterminado si no hay maestro
          } else {
            console.warn('Error al obtener las secciones.');
            return 'Error al obtener el maestro';
          }
        } catch (error) {
          console.error('Error al obtener el maestro:', error);
          return 'Error al obtener el maestro';
        }
      };
  
      // Obtener las opciones de matrícula
      let opciones = {};
      try {
        const response = await fetch('http://localhost:4000/api/matricula/opciones');
        if (response.ok) {
          opciones = await response.json();
          console.log('Opciones cargadas:', opciones); // Para depuración
        } else {
          console.warn('Error al obtener las opciones de matrícula');
        }
      } catch (apiError) {
        console.error('Error al obtener las opciones de matrícula:', apiError.message);
      }
  
      // Obtener los datos del horario
      let horarios = [];
      let nombreMaestro = 'N/A'; // Valor predeterminado para el maestro
      if (matricula.Cod_seccion) {
        try {
          const response = await fetch(`http://localhost:4000/api/matricula/horario/${matricula.Cod_seccion}`);
          if (response.ok) {
            const result = await response.json();
            horarios = result.data || [];
            console.log('Horarios cargados:', horarios);
  
            // Usar la función para obtener el nombre del maestro
            nombreMaestro = await obtenerNombreMaestro(matricula.Cod_seccion);
          } else {
            console.warn('Error al obtener los horarios de la sección');
          }
        } catch (apiError) {
          console.error('Error al obtener los datos del horario:', apiError.message);
        }
      }
  
      // Validar datos y continuar con valores predeterminados si faltan
      if (!matricula.Cod_seccion) {
        console.warn('Falta el dato de la sección. Usando valores predeterminados.');
        matricula.Nombre_seccion = 'Sin Asignar'; // Asignar un valor predeterminado
        matricula.Cod_seccion = 'N/A';
      }
  
      const doc = new jsPDF();
  
      // Validar y asignar datos con valores predeterminados
      const codificacion = matricula.codificacion_matricula || 'N/A';
      const fechaMatricula = matricula.fecha_matricula?.split('T')[0] || 'N/A';
      const nombreCompleto = [
        matricula.Nombre_Hijo || 'N/A',
        matricula.Segundo_nombre_Hijo || '',
        matricula.Apellido_Hijo || 'N/A',
        matricula.Segundo_apellido_Hijo || '',
      ]
        .filter(Boolean)
        .join(' ');
      const fechaNacimiento = matricula.fecha_nacimiento_hijo?.split('T')[0] || 'N/A';
      const nombrePadre = matricula.Nombre_Padre || 'N/A';
      const apellidoPadre = matricula.Apellido_Padre || 'N/A';
      const estadoMatricula = opciones.estados_matricula?.find(
        (e) => e.Cod_estado_matricula === matricula.Cod_estado_matricula
      )?.Tipo || 'N/A';
      const periodoMatricula = opciones.periodos_matricula?.find(
        (p) => p.Cod_periodo_matricula === matricula.Cod_periodo_matricula
      )?.Anio_academico || 'N/A';
      const tipoMatricula = opciones.tipos_matricula?.find(
        (t) => t.Cod_tipo_matricula === matricula.Cod_tipo_matricula
      )?.Tipo || 'N/A';
      const grado = matricula.Nombre_grado || 'N/A';
      const seccion = matricula.Nombre_seccion || 'N/A';
  
      const img = new Image();
      const defaultLogo = './src/assets/brand/logo_saint_patrick.png';
      img.src = matricula.logo || defaultLogo;
  
      img.onload = () => {
        // Encabezado
        doc.addImage(img, 'PNG', 10, 10, 30, 30);
        doc.setFontSize(18);
        doc.setTextColor(0, 102, 51);
        doc.text(
          "SAINT PATRICK'S ACADEMY",
          doc.internal.pageSize.width / 2,
          20,
          { align: 'center' }
        );
  
        doc.setFontSize(14);
        doc.text(
          'Detalle de Matrícula y Horarios',
          doc.internal.pageSize.width / 2,
          30,
          { align: 'center' }
        );
  
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text('Casa Club del periodista, Colonia del Periodista', doc.internal.pageSize.width / 2, 40, { align: 'center' });
        doc.text('Teléfono: (504) 2234-8871', doc.internal.pageSize.width / 2, 45, { align: 'center' });
        doc.text('Correo: info@saintpatrickacademy.edu', doc.internal.pageSize.width / 2, 50, { align: 'center' });
  
        doc.setDrawColor(0, 102, 51);
        doc.setLineWidth(0.5);
        doc.line(10, 55, doc.internal.pageSize.width - 10, 55);
  
        // Información del Estudiante
        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.text('Información del Estudiante:', 10, 65);
        doc.setFontSize(10);
        doc.text(`Código de Matrícula: ${codificacion}`, 10, 75);
        doc.text(`Fecha de Matrícula: ${fechaMatricula}`, 10, 80);
        doc.text(`Nombre Completo: ${nombreCompleto}`, 10, 85);
        doc.text(`Fecha de Nacimiento: ${fechaNacimiento}`, 10, 90);
        doc.text(`Padre/Madre/Tutor: ${nombrePadre} ${apellidoPadre}`, 10, 95);
  
        // Detalles de Matrícula
        doc.setFontSize(12);
        doc.setTextColor(0, 102, 51);
        doc.text('Detalles de Matrícula:', 10, 105);
  
        doc.autoTable({
          startY: 110,
          head: [['Campo', 'Valor']],
          body: [
            ['Estado', estadoMatricula],
            ['Período', periodoMatricula],
            ['Tipo de Matrícula', tipoMatricula],
            ['Grado', grado],
            ['Sección', seccion],
            ['Maestro', nombreMaestro], // Incluimos el nombre del maestro
          ],
          styles: { fontSize: 10, cellPadding: 4 },
          headStyles: { fillColor: [0, 102, 51], textColor: [255, 255, 255] },
          alternateRowStyles: { fillColor: [240, 240, 240] },
        });
  
        // Horario de Clases
        doc.setFontSize(12);
        doc.setTextColor(0, 102, 51);
        doc.text('Horario de Clases:', 10, doc.lastAutoTable.finalY + 15);
  
        doc.autoTable({
          startY: doc.lastAutoTable.finalY + 20,
          head: [['Asignatura', 'Día', 'Hora Inicio', 'Hora Fin']],
          body: horarios.length > 0
            ? horarios.map((h) => [
                h.Nombre_asignatura || 'N/A',
                h.Nombre_dia || 'N/A',
                h.Hora_inicio || 'N/A',
                h.Hora_fin || 'N/A',
              ])
            : [['No hay horarios disponibles', '', '', '']],
          styles: { fontSize: 10, cellPadding: 4 },
          headStyles: { fillColor: [0, 102, 51], textColor: [255, 255, 255] },
          alternateRowStyles: { fillColor: [245, 245, 245] },
        });
  
        // Pie de página
        const pageHeight = doc.internal.pageSize.height;
        const creationDateTime = new Date().toLocaleString('es-ES', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Fecha y Hora de Generación: ${creationDateTime}`, 10, pageHeight - 10);
  
        Swal.close(); // Cerrar el indicador de carga
        const pdfBlob = doc.output('blob');
        const pdfURL = URL.createObjectURL(pdfBlob);
        window.open(pdfURL, '_blank');
      };
  
      img.onerror = () => {
        Swal.fire('Error', 'No se pudo cargar el logo.', 'error');
      };
    } catch (error) {
      console.error('Error al generar el PDF:', error);
      Swal.fire('Error', 'No se pudo generar el PDF. Intente nuevamente.', 'error');
    }
  
    const pageCount = Math.ceil(filteredMatriculas.length / itemsPerPage);
  const indexOfLastItem = (currentPage + 1) * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredMatriculas.slice(indexOfFirstItem, indexOfLastItem);

 };

useEffect(() => {
  if (opciones.periodos_activos && opciones.periodos_activos.length > 0) {
    // Seleccionar el primer período que esté activo
    setPeriodoActivo(opciones.periodos_activos[0]);
  }
}, [opciones.periodos_activos]);
const calculateAge = (birthDate) => {
  if (!birthDate) return 'N/A';
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  // Restar un año si el cumpleaños aún no ha ocurrido este año
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return `${age} años`;
};

  return (
    <CContainer>
  {/* Encabezado Mejorado y Centrado */}
  <CRow className="justify-content-center mb-2">
    <CCol xs="auto">
      <h3 style={{ margin: 0, fontWeight: 'bold', color: '#4B6251', textAlign: 'center' }}>
        <CIcon icon={cilSchool} size="lg" style={{ color: '#4B6251', marginRight: '0.5rem' }} />
        Matrículas
      </h3>
    </CCol>
  </CRow>

  {/* Línea decorativa debajo del encabezado */}
  <div
    style={{
      width: '100%',
      height: '2px',
      backgroundColor: '#4B6251',
      marginBottom: '1rem',
    }}
  ></div>

  {/* ComboBox y Botones en la misma fila */}
  <CRow className="justify-content-between align-items-center mb-4">
    <CCol xs={12} md={6} className="d-flex align-items-center">
      <CFormSelect
        onChange={handleComboBoxChange}
        defaultValue=""
        style={{
          width: '250px',
          borderRadius: '10px',
          backgroundColor: '#f5f5f5',
          color: '#333',
          border: '1px solid #ccc',
          padding: '0.5rem',
          transition: 'all 0.3s',
        }}
        className="custom-select"
        onMouseEnter={(e) => e.target.style.backgroundColor = '#e0e0e0'}
        onMouseLeave={(e) => e.target.style.backgroundColor = '#f5f5f5'}
      >
        <option value="" disabled>
          Seleccione una opción
        </option>
        <option value="porGrado">Matrículas por Grado</option>
        <option value="porPeriodo">Matrículas por Secciones</option>
        <option value="porAnioAnterior">Matrículas de Años Anteriores</option>
      </CFormSelect>
    </CCol>
    <CCol xs={12} md={6} className="d-flex justify-content-end align-items-center">
      <CButton
        color="dark"
        onClick={() => {
          const hayPeriodoActivo = opciones.periodos_matricula?.some((p) => p.estado === 'activo');
          if (hayPeriodoActivo) {
            setModalVisible(true);
          } else {
            Swal.fire('Advertencia', 'No hay un período de matrícula activo.', 'warning');
          }
        }}
        className="me-2"
        style={{ backgroundColor: '#4B6251', borderColor: '#0F463A' }}
      >
        <CIcon icon={cilPlus} /> Nueva
      </CButton>

      <CDropdown>
  <CDropdownToggle color="success" style={{ backgroundColor: '#6C8E58', borderColor: '#617341' }}>
    <CIcon icon={cilFile} /> Reporte
  </CDropdownToggle>
  <CDropdownMenu>
    <CDropdownItem
      onClick={() => {
        // Filtrar matrículas según el término de búsqueda
        const filteredData = matriculas.filter((matricula) =>
          `${matricula.Nombre_Padre} ${matricula.Apellido_Padre}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) // Filtra según el término en el buscador
        );
        exportToPDF(filteredData); // Llama a exportToPDF con los datos filtrados
      }}
    >
      Exportar a PDF
    </CDropdownItem>
    <CDropdownItem
      onClick={() => {
        // Filtrar matrículas según el término de búsqueda
        const filteredData = matriculas.filter((matricula) =>
          `${matricula.Nombre_Padre} ${matricula.Apellido_Padre}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) // Filtra según el término en el buscador
        );
        exportToExcel(filteredData); // Llama a exportToExcel con los datos filtrados
      }}
    >
      Exportar a Excel
    </CDropdownItem>
  </CDropdownMenu>
</CDropdown>

    </CCol>
  </CRow>

  {/* Barra de búsqueda y selector de registros en una sola fila */}
  <CRow className="align-items-center mb-4">
    <CCol md={6} className="d-flex align-items-center">
      <CInputGroup>
        <CInputGroupText>
          <CIcon icon={cilSearch} />
        </CInputGroupText>
        <CFormInput placeholder="Buscar matrícula" value={searchTerm} onChange={handleSearch} />
        <CButton color="secondary" onClick={() => setSearchTerm('')}>
          <CIcon icon={cilBrushAlt} /> Limpiar
        </CButton>
      </CInputGroup>
    </CCol>
    <CCol md={6} className="d-flex justify-content-end align-items-center">
      <span className="me-1">Mostrar</span>
      <CFormSelect
        value={itemsPerPage}
        onChange={(e) => {
          setItemsPerPage(Number(e.target.value));
          setCurrentPage(0);
        }}
        style={{ width: '100px' }}
      >
        <option value="5">5</option>
        <option value="10">10</option>
        <option value="20">20</option>
      </CFormSelect>
      <span className="ms-1">registros</span>
    </CCol>
  </CRow>
      {loading ? (
        <CSpinner color="primary" />
      ) : (
        <div className="table-container">
<CTable striped responsive bordered hover style={{ textTransform: 'uppercase' }}>
  <CTableHead>
    <CTableRow>
      <CTableHeaderCell>#</CTableHeaderCell>
      <CTableHeaderCell>Cod Matrícula</CTableHeaderCell>
      <CTableHeaderCell>Nombre Estudiante</CTableHeaderCell>
      <CTableHeaderCell>Fecha Matrícula</CTableHeaderCell>
      <CTableHeaderCell>Estado</CTableHeaderCell>
      <CTableHeaderCell>Período</CTableHeaderCell>
      <CTableHeaderCell>Acciones</CTableHeaderCell>
    </CTableRow>
  </CTableHead>
  <CTableBody>
    {currentItems.map((matricula, index) => {
      // Encontrar el estado de matrícula correspondiente
      const estadoMatricula = opciones.estados_matricula?.find(
        (e) => e.Cod_estado_matricula === matricula.Cod_estado_matricula
      );

      // Encontrar el período de matrícula correspondiente
      const periodoMatricula = opciones.periodos_matricula?.find(
        (p) => String(p.Cod_periodo_matricula) === String(matricula.Cod_periodo_matricula)
      );

      // Obtener el año académico para mostrar en la tabla
      const anioAcademico = periodoMatricula?.Anio_academico || 'N/A';

      return (
        <CTableRow key={matricula.Cod_matricula}>
          <CTableDataCell>{index + 1 + indexOfFirstItem}</CTableDataCell>
          <CTableDataCell>{matricula.codificacion_matricula}</CTableDataCell>
          <CTableDataCell>
            {matricula.Nombre_Hijo} {matricula.Apellido_Hijo}
          </CTableDataCell>
          <CTableDataCell>{matricula.fecha_matricula.split('T')[0]}</CTableDataCell>
          <CTableDataCell>{estadoMatricula?.Tipo || 'N/A'}</CTableDataCell>
          {/* Mostrar el año académico siempre, incluso si el período está inactivo */}
          <CTableDataCell>{anioAcademico}</CTableDataCell>
          <CTableDataCell>
            {/* Botón solo para ver el PDF */}
            <CButton color="info" onClick={() => handleViewPDF(matricula)}>
              <CIcon icon={cilInfo} />
            </CButton>
          </CTableDataCell>
        </CTableRow>
      );
    })}
  </CTableBody>
</CTable>
        </div>
      )}
{/* Sección de paginación */}
<nav className="d-flex justify-content-center align-items-center mt-4">
        <CPagination className="mb-0" style={{ gap: '0.3cm' }}>
          <CButton
            style={{ backgroundColor: 'gray', color: 'white', marginRight: '0.3cm' }}
            disabled={currentPage === 0}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Anterior
          </CButton>
          <CButton
            style={{ backgroundColor: 'gray', color: 'white' }}
            disabled={currentPage === pageCount - 1}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Siguiente
          </CButton>
        </CPagination>
        <span className="mx-2">Página {currentPage + 1} de {pageCount}</span>
      </nav>      
     
 {/* Modal con el flujo en pasos */}
 <CModal 
  visible={modalVisible} 
  onClose={() => {
    setModalVisible(false);
    setStep(1); // Reinicia al primer paso

    // Reinicia solo los campos necesarios y preserva cod_estado_matricula y cod_tipo_matricula
    setMatriculaData((prevData) => ({
      ...prevData, // Conserva los valores actuales
      fecha_matricula: getCurrentDate(),
      cod_grado: '',
      cod_seccion: '',
      cod_hijo: '',
      primer_nombre_hijo: '',     
      segundo_nombre_hijo: '',    
      primer_apellido_hijo: '',   
      segundo_apellido_hijo: '',  
      fecha_nacimiento_hijo: '',  
    }));

    // Reinicia solo los datos del padre y selección
    setDniPadre('');
    setNombrePadre('');
    setApellidoPadre('');
    setSelectedGrado('');
    setSelectedSeccion('');
  }}
  backdrop="static" 
  size="md"
>
  <CModalHeader closeButton>
    <CModalTitle>Registrar Nueva Matrícula - Paso {step}</CModalTitle>
  </CModalHeader>
  <CModalBody>
    {periodoActivo ? (
      <>
        {/* Paso 1: Información del Padre e Hijo */}
        {step === 1 && (
          <div>
            {/* Card para la Información del Padre */}
            <CCard className="mb-4">
              <CCardBody>
                <h5>Información del Padre</h5>
                <hr />
                <CInputGroup className="mb-3">
  <CInputGroupText><CIcon icon={cilUser} /></CInputGroupText>
  <CFormInput
    type="text"
    placeholder="DNI"
    value={dniPadre}
    onChange={(e) => {
      const inputValue = e.target.value;
      // Aceptar solo números y limitar a 13 dígitos
      if (/^\d*$/.test(inputValue) && inputValue.length <= 13) {
        setDniPadre(inputValue);
      } else if (inputValue.length > 13) {
        Swal.fire('Advertencia', 'El DNI no puede tener más de 13 dígitos.', 'warning');
      } else {
        Swal.fire('Advertencia', 'Solo se permiten números en este campo.', 'warning');
      }
    }}
    onBlur={() => {
      // Validar longitud exacta del DNI al perder el foco
      if (dniPadre.length !== 13) {
        Swal.fire('Error', 'El DNI debe tener exactamente 13 dígitos.', 'error');
      } else {
        obtenerHijos(); // Llamar a obtenerHijos si la longitud es válida
      }
    }}
    onKeyPress={(e) => {
      const charCode = e.which || e.keyCode;
      if (charCode < 48 || charCode > 57) { // Solo números
        e.preventDefault();
      }
    }}
    onPaste={(e) => {
      e.preventDefault();
      Swal.fire('Advertencia', 'No se permite pegar en este campo.', 'warning');
    }}
    onCopy={(e) => {
      e.preventDefault();
      Swal.fire('Advertencia', 'No se permite copiar en este campo.', 'warning');
    }}
    required
  />
</CInputGroup>

                <CRow className="mb-3">
                  <CCol>
                    <label>Nombre del Padre</label>
                    <CFormInput type="text" value={nombrePadre} readOnly />
                  </CCol>
                  <CCol>
                    <label>Apellido del Padre</label>
                    <CFormInput type="text" value={apellidoPadre} readOnly />
                  </CCol>
                </CRow>
              </CCardBody>
            </CCard>

            {/* Información consolidada del Hijo */}
<CCard className="mb-4">
  <CCardBody>
    <h5>Información del Hijo</h5>
    <hr />
    <CInputGroup className="mb-3">
      <CInputGroupText>
        <CIcon icon={cilUserFemale} />
      </CInputGroupText>
      <CFormSelect
        name="cod_hijo"
        onChange={handleHijoChange}
        value={matriculaData.cod_hijo}
        required
      >
        <option value="">Selecciona el hijo</option>
        {hijos.map((hijo) => (
          <option key={hijo.Cod_persona} value={hijo.Cod_persona}>
            {`${hijo.Primer_nombre} ${hijo.Segundo_nombre || ''} ${hijo.Primer_apellido} ${hijo.Segundo_apellido || ''} - DNI: ${hijo.dni_persona}`}
          </option>
        ))}
      </CFormSelect>
    </CInputGroup>
    <CRow className="mb-3">
      <CCol>
        <label>Nombre Completo</label>
        <CFormInput type="text" value={matriculaData.nombre_completo_hijo} readOnly />
      </CCol>
    </CRow>
    <CRow className="mb-3">
      <CCol>
        <label>Fecha de Nacimiento</label>
        <CInputGroup className="mb-3">
          <CInputGroupText><CIcon icon={cilCalendar} /></CInputGroupText>
          <CFormInput type="date" value={matriculaData.fecha_nacimiento_hijo} readOnly />
        </CInputGroup>
      </CCol>
      <CCol>
        <label>Edad</label>
        <CFormInput 
          type="text" 
          value={calculateAge(matriculaData.fecha_nacimiento_hijo)} 
          readOnly 
        />
      </CCol>
    </CRow>
  </CCardBody>
</CCard>

          </div>
        )}

        {/* Paso 2: Información Académica */}
        {step === 2 && (
          <div>
            <h5>Información Académica</h5>
            <hr />
            <CRow className="mb-3">
              <CCol>
                <label>Fecha de Matrícula</label>
                <CFormInput
                  type="date"
                  name="fecha_matricula"
                  value={matriculaData.fecha_matricula}
                  readOnly
                  required
                />
              </CCol>
            </CRow>

            {/* Selector de Grado */}
<div className="mb-3">
  <h6>Elije Grado</h6>
  {opciones.grados.map((grado) => (
    <CButton
      color={selectedGrado === grado.Cod_grado ? 'dark' : 'secondary'}
      key={grado.Cod_grado}
      onClick={() => {
        setSelectedGrado(grado.Cod_grado); // Actualiza el grado seleccionado
        obtenerSeccionesPorGrado(grado.Cod_grado); // Llama a la función para obtener secciones
      }}
      className="m-1"
      style={{
        backgroundColor: selectedGrado === grado.Cod_grado ? '#4B6251' : '#6C757D',
        borderColor: selectedGrado === grado.Cod_grado ? '#0F463A' : '#495057',
        color: '#FFF',
      }}
    >
      {grado.Nombre_grado}
    </CButton>
  ))}
</div>

            {/* Selector de Sección */}
<CRow className="mt-3">
  <h6>Elije Sección</h6>
  {loading ? ( // Si las secciones están cargando
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100px' }}>
      <CSpinner color="primary" /> {/* Spinner mientras se cargan las secciones */}
    </div>
  ) : secciones.length > 0 ? ( // Si hay secciones disponibles
    secciones.map((seccion) => (
      <CCol md={6} lg={4} className="mb-3" key={seccion.Cod_secciones}>
        <CCard
          className={selectedSeccion === seccion.Cod_secciones ? 'border-primary' : ''}
          style={{
            borderColor: selectedSeccion === seccion.Cod_secciones ? '#0F463A' : '#CED4DA',
            backgroundColor: selectedSeccion === seccion.Cod_secciones ? '#4B6251' : '#FFF',
          }}
        >
          <CCardBody>
            <CCardTitle style={{ color: selectedSeccion === seccion.Cod_secciones ? '#FFF' : '#000' }}>
              {seccion.Nombre_seccion}
            </CCardTitle>
            <CCardText style={{ color: selectedSeccion === seccion.Cod_secciones ? '#FFF' : '#000' }}>
              <strong>Aula:</strong> {seccion.Numero_aula || "No disponible"} <br />
              <strong>Edificio:</strong> {seccion.Nombre_edificios || "No disponible"} <br />
              <strong>Profesor:</strong> {seccion.Nombre_profesor ? `${seccion.Nombre_profesor} ${seccion.Apellido_profesor}` : "No disponible"} <br />
            </CCardText>
            <CButton
              color="primary"
              onClick={() => setSelectedSeccion(seccion.Cod_secciones)} // Actualiza la sección seleccionada
              style={{
                backgroundColor: '#4B6251',
                borderColor: '#0F463A',
                color: '#FFF',
              }}
            >
              Elije Sección
            </CButton>
          </CCardBody>
        </CCard>
      </CCol>
    ))
  ) : (
    <p>No hay secciones disponibles para el grado seleccionado.</p> // Si no hay secciones
  )}
</CRow>
          </div>
        )}

        {/* Paso 3: Estado, Período y Tipo de Matrícula */}
        {step === 3 && (
          <div>
            <h5>Estado, Período y Tipo de Matrícula</h5>
            <hr />
            <CRow className="mb-3">
              <CCol>
                <label>Estado de Matrícula</label>
                <CFormSelect
      name="cod_estado_matricula"
      value={matriculaData.cod_estado_matricula}
      onChange={(e) =>
        setMatriculaData({ ...matriculaData, cod_estado_matricula: e.target.value })
      }
      required
    >
      <option value="" disabled>
        Selecciona el Estado
      </option>
      {opciones.estados_matricula.map((estado) => (
        <option key={estado.Cod_estado_matricula} value={estado.Cod_estado_matricula}>
          {estado.Tipo}
        </option>
      ))}
    </CFormSelect>
              </CCol>
              <CCol>
                <label>Período Académico</label>
                <CFormInput
                  type="text"
                  value={periodoActivo ? periodoActivo.Anio_academico : 'No disponible'}
                  readOnly
                />
              </CCol>
            </CRow>
            <CInputGroup className="mb-3">
              <CInputGroupText>Tipo Matrícula</CInputGroupText>
              <CFormSelect
      name="cod_tipo_matricula"
      value={matriculaData.cod_tipo_matricula}
      onChange={(e) =>
        setMatriculaData({ ...matriculaData, cod_tipo_matricula: e.target.value })
      }
      required
    >
      <option value="" disabled>
        Selecciona el Tipo de Matrícula
      </option>
      {opciones.tipos_matricula.map((tipo) => (
        <option key={tipo.Cod_tipo_matricula} value={tipo.Cod_tipo_matricula}>
          {tipo.Tipo}
        </option>
      ))}
    </CFormSelect>
            </CInputGroup>
          </div>
        )}
      </>
    ) : (
      <div>
        <h5>No hay un período de matrícula activo en este momento.</h5>
        <p>Por favor, contacte a la administración para más detalles.</p>
      </div>
    )}
  </CModalBody>

  {/* Footer de navegación */}
  <CModalFooter>
    {step > 1 && (
      <CButton color="secondary" onClick={prevStep}>
        Atrás
      </CButton>
    )}
    {step < 3 ? (
      <CButton
        style={{ backgroundColor: '#4B6251', borderColor: '#4B6251', color: '#ffffff' }}
        onClick={nextStep}
      >
        Siguiente
      </CButton>
    ) : (
      <CButton
        style={{ backgroundColor: '#4B6251', borderColor: '#4B6251', color: '#ffffff' }}
        onClick={handleSubmit}
        disabled={!periodoActivo}
      >
        Guardar
      </CButton>
    )}
  </CModalFooter>
</CModal>
      <style jsx>{`
        .table-container {
          max-height: 400px;
          overflow-y: auto;
        }

        .table-container::-webkit-scrollbar {
          width: 8px;
        }

        .table-container::-webkit-scrollbar-thumb {
          background-color: #6c757d;
          border-radius: 4px;
        }

        .table-container::-webkit-scrollbar-thumb:hover {
          background-color: #4B6251;
        }
      `}</style>
    </CContainer>
  );
};

export default MatriculaForm;
