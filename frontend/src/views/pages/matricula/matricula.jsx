import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Importa useNavigate de react-router-dom
import Swal from 'sweetalert2';
import { cilSearch, cilPen, cilTrash, cilPlus, cilSave, cilBrushAlt, cilFile, cilInfo, cilArrowCircleBottom, cilSpreadsheet, cilDescription,} from '@coreui/icons';
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
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import logo from 'src/assets/brand/logo_saint_patrick.png';
import usePermission from '../../../../context/usePermission';
import AccessDenied from "../AccessDenied/AccessDenied"
import { AuthContext } from '/context/AuthProvider'; // Asegúrate de que la ruta sea correcta

// Path: src/utils/jwtUtils.js

export const decodeJWT = (token) => {
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

const MatriculaForm = () => {
    const { canSelect,  error,canDelete, canInsert, canUpdate } = usePermission('Matricula');
  
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
  const estadoPorDefecto = opciones.estados_matricula.find(e => e.Tipo === 'Falta de Pago');
const tipoPorDefecto = opciones.tipos_matricula.find(t => t.Tipo === 'Estandar');

  const [periodoActivo, setPeriodoActivo] = useState(null); // Nuevo estado para el período activo
  const navigate = useNavigate(); // Hook para la navegación
  const [buscarNombreVisible, setBuscarNombreVisible] = useState(false);
const [nombreBusqueda, setNombreBusqueda] = useState('');
const [resultadosBusqueda, setResultadosBusqueda] = useState([]);

  const token = localStorage.getItem('token');
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
  
  const obtenerHijos = async (dniManual = null) => {
    const dni = dniManual || dniPadre;
  
    if (!dni || dni.trim() === '') {
      Swal.fire('Advertencia', 'Por favor, ingrese un DNI válido para el padre.', 'warning');
      return;
    }
  
    try {
      const response = await axios.get(`http://localhost:4000/api/matricula/hijos/${dni}`);
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

const registrarEnBitacora = async (accion, descripcionAdicional = '') => {
  try {
    const token = localStorage.getItem('token');
    const decodedToken = decodeJWT(token);

    if (!decodedToken) {
      Swal.fire('Error', 'Token inválido o expirado. Por favor, inicie sesión nuevamente.', 'error');
      return;
    }

    const cod_usuario = decodedToken.cod_usuario;
    const nombre_usuario = decodedToken.nombre_usuario;

    if (!cod_usuario || !nombre_usuario) {
      Swal.fire('Error', 'El token no contiene información válida del usuario.', 'error');
      return;
    }

    const descripcion = `El usuario: ${nombre_usuario} realizó la acción: ${accion}. ${descripcionAdicional}`;
    console.log('Datos para bitácora:', { cod_usuario, cod_objeto: 77, accion, descripcion });

    await axios.post(
      'http://localhost:4000/api/bitacora/registro',
      { cod_usuario, cod_objeto: 77, accion, descripcion },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    console.log('Registro en bitácora exitoso');
  } catch (error) {
    console.error('Error al registrar en bitácora:', error.message);
    Swal.fire('Error', 'Hubo un problema al registrar en la bitácora.', 'error');
  }
};
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const resetFormularioMatricula = () => {
  setModalVisible(false);
  setStep(1);
  setMatriculaData((prev) => ({
    ...prev,
    fecha_matricula: getCurrentDate(),
    cod_grado: '',
    cod_seccion: '',
    cod_hijo: '',
    primer_nombre_hijo: '',
    segundo_nombre_hijo: '',
    primer_apellido_hijo: '',
    segundo_apellido_hijo: '',
    fecha_nacimiento_hijo: '',
    nombre_completo_hijo: '',
  }));
  setDniPadre('');
  setNombrePadre('');
  setApellidoPadre('');
  setSelectedGrado('');
  setSelectedSeccion('');
  setBuscarNombreVisible(false);
  setNombreBusqueda('');
  setResultadosBusqueda([]);
  setSecciones([]);
};


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


const handleSubmit = async (e) => {
  e.preventDefault();

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

  const requiredFields = [
    'dni_padre',
    'cod_grado',
    'cod_seccion',
    'cod_estado_matricula',
    'cod_tipo_matricula',
    'cod_hijo',
  ];

  const missingFields = requiredFields.filter((field) => !dataToSend[field]);
  if (missingFields.length > 0) {
    Swal.fire({
      icon: 'warning',
      title: 'Campos requeridos',
      text: `Faltan los siguientes campos: ${missingFields.join(', ')}.`,
    });
    return;
  }

  if (!dataToSend.fecha_matricula) {
    Swal.fire({
      icon: 'warning',
      title: 'Fecha no asignada',
      text: 'La fecha de matrícula no está asignada automáticamente.',
    });
    return;
  }

  const periodoActual = opciones?.periodos_matricula?.find(
    (p) => p.Cod_periodo_matricula === dataToSend.cod_periodo_matricula
  );
  const anioAcademicoActual = periodoActual?.Anio_academico;

  const existeMatriculaEnAnio = matriculas.some(
    (matricula) =>
      matricula.cod_hijo === dataToSend.cod_hijo &&
      matricula.anio_academico === anioAcademicoActual
  );

  if (existeMatriculaEnAnio) {
    Swal.fire({
      icon: 'error',
      title: 'Matrícula duplicada',
      text: `El estudiante ya está matriculado en el período académico ${anioAcademicoActual}. No se puede registrar dos veces en el mismo período.`,
    });
    return;
  }

  try {
    const response = await axios.post(
      'http://localhost:4000/api/matricula/crearmatricula',
      dataToSend
    );

    if (response.status === 201) {
      const message = response.data.message;

      Swal.fire({
        icon: 'success',
        title: 'Matrícula registrada',
        text: message || 'La matrícula fue creada exitosamente.',
        timer: 2500,
        showConfirmButton: false,
      });

      await registrarEnBitacora(
        'INSERT',
        `Creó una matrícula para el estudiante con código ${dataToSend.cod_hijo} en el período ${dataToSend.cod_periodo_matricula}.`
      );

      // Reiniciar todo el formulario después del registro exitoso
      setModalVisible(false);
      setStep(1);
      setMatriculaData({
        fecha_matricula: getCurrentDate(),
        cod_grado: '',
        cod_seccion: '',
        cod_estado_matricula: estadoPorDefecto?.Cod_estado_matricula || '',
        cod_periodo_matricula: periodoActivo?.Cod_periodo_matricula || '',
        cod_tipo_matricula: tipoPorDefecto?.Cod_tipo_matricula || '',
        cod_hijo: '',
        primer_nombre_hijo: '',
        segundo_nombre_hijo: '',
        primer_apellido_hijo: '',
        segundo_apellido_hijo: '',
        fecha_nacimiento_hijo: '',
        nombre_completo_hijo: '',
      });
      setDniPadre('');
      setNombrePadre('');
      setApellidoPadre('');
      setSelectedGrado('');
      setSelectedSeccion('');
      obtenerMatriculas(); // refrescar la tabla
    }
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || error.message || 'Error al crear la matrícula.';
    console.error('Error al crear la matrícula:', errorMessage);

    await registrarEnBitacora('Error', `Error al crear matrícula: ${errorMessage}`);

    Swal.fire({
      icon: 'error',
      title: 'Error al registrar matrícula',
      text: errorMessage,
    });
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
  
  
 

  const filteredMatriculas = matriculas.filter((matricula) => {
    const search = searchTerm.toLowerCase();
  
    const nombreCompleto = `${matricula.Nombre_Hijo} ${matricula.Apellido_Hijo}`.toLowerCase();
    const anio = String(matricula.Anio_academico || '').toLowerCase();
    const cod = (matricula.codificacion_matricula || '').toLowerCase();
    const estado = (opciones.estados_matricula?.find(e => e.Cod_estado_matricula === matricula.Cod_estado_matricula)?.Tipo || '').toLowerCase();
  
    return (
      nombreCompleto.includes(search) ||
      anio.includes(search) ||
      cod.includes(search) ||
      estado.includes(search)
    );
  });
  
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

        // Pie de página con fecha, hora y número de página
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            const creationDateTime = new Date().toLocaleString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
            });

            // Fecha y hora alineada a la izquierda
            doc.setFontSize(10);
            doc.setTextColor(100);
            doc.text(
                `Fecha y Hora de Generación: ${creationDateTime}`,
                10,
                doc.internal.pageSize.height - 10
            );

            // Número de página alineado a la derecha
            doc.text(
                `Página ${i} de ${pageCount}`,
                doc.internal.pageSize.width - 30,
                doc.internal.pageSize.height - 10,
                { align: 'right' }
            );
        }

        // Generar el blob y abrir en una nueva pestaña
        const pdfBlob = doc.output('blob');
        const pdfURL = URL.createObjectURL(pdfBlob);
        window.open(pdfURL); // Abre el archivo en una nueva pestaña
    };

    img.onerror = () => {
        Swal.fire('Error', 'No se pudo cargar el logo.', 'error');
    };
};


const exportToExcel = async () => {
  const filteredData = searchTerm.trim() !== ''
    ? matriculas.filter((matricula) => {
        const fullName = `${matricula.Nombre_Hijo || ''} ${matricula.Apellido_Hijo || ''}`.toLowerCase();
        const cod = (matricula.codificacion_matricula || '').toLowerCase();
        const estado = (opciones.estados_matricula?.find(e => e.Cod_estado_matricula === matricula.Cod_estado_matricula)?.Tipo || '').toLowerCase();
        const anio = (opciones.periodos_matricula?.find(p => p.Cod_periodo_matricula === matricula.Cod_periodo_matricula)?.Anio_academico || '').toLowerCase();

        return (
          fullName.includes(searchTerm.toLowerCase()) ||
          cod.includes(searchTerm.toLowerCase()) ||
          estado.includes(searchTerm.toLowerCase()) ||
          anio.includes(searchTerm.toLowerCase())
        );
      })
    : matriculas;

  if (!filteredData || filteredData.length === 0) {
    Swal.fire('Advertencia', 'No hay datos para exportar.', 'warning');
    return;
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Matrículas');

  // Título principal
  worksheet.mergeCells('A1:H1');
  worksheet.getCell('A1').value = "SAINT PATRICK'S ACADEMY";
  worksheet.getCell('A1').font = { bold: true, size: 18, color: { argb: '006633' } };
  worksheet.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };

  // Subtítulo
  worksheet.mergeCells('A2:H2');
  worksheet.getCell('A2').value = 'REPORTE GENERAL DE MATRÍCULAS';
  worksheet.getCell('A2').font = { bold: true, size: 16, color: { argb: '006633' } };
  worksheet.getCell('A2').alignment = { horizontal: 'center', vertical: 'middle' };

  // Encabezados
  const headerRow = worksheet.addRow([
    '#',
    'Cod Matrícula',
    'Nombre Estudiante',
    'Grado',
    'Sección',
    'Fecha Matrícula',
    'Estado',
    'Período'
  ]);

  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '006633' } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
  });

  // Agregar datos
  filteredData.forEach((matricula, index) => {
    const row = worksheet.addRow([
      index + 1,
      matricula.codificacion_matricula,
      `${matricula.Nombre_Hijo || ''} ${matricula.Apellido_Hijo || ''}`.trim(),
      matricula.Nombre_grado || 'N/A',
      matricula.Nombre_seccion || 'N/A',
      matricula.fecha_matricula?.split('T')[0] || 'N/A',
      opciones.estados_matricula?.find(e => e.Cod_estado_matricula === matricula.Cod_estado_matricula)?.Tipo || 'N/A',
      opciones.periodos_matricula?.find(p => p.Cod_periodo_matricula === matricula.Cod_periodo_matricula)?.Anio_academico || 'N/A'
    ]);

    row.eachCell((cell) => {
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });
  });

  // Ajuste de anchos
  worksheet.columns = [
    { width: 6 },   // #
    { width: 20 },  // Cod Matrícula
    { width: 30 },  // Nombre Estudiante
    { width: 15 },  // Grado
    { width: 15 },  // Sección
    { width: 18 },  // Fecha Matrícula
    { width: 18 },  // Estado
    { width: 18 }   // Período
  ];

  // Generar archivo
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });
  saveAs(blob, 'Reporte_General_Matriculas.xlsx');
};



  const pageCount = Math.ceil(filteredMatriculas.length / itemsPerPage);
  
  {/**********************************************************************************************************************************************/}
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
          const response = await fetch(
            `http://localhost:4000/api/matricula/secciones/${matricula.Cod_grado}?cod_periodo_matricula=${matricula.Cod_periodo_matricula}`
          );
          if (response.ok) {
            const result = await response.json();
            const seccion = result.data.find(
              (sec) => sec.Cod_secciones === codSeccion
            );
            if (seccion && seccion.Nombre_profesor) {
              return `${seccion.Nombre_profesor} ${seccion.Apellido_profesor || ''}`.trim();
            }
            return 'Sin Maestro Asignado';
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
        } else {
          console.warn('Error al obtener las opciones de matrícula');
        }
      } catch (apiError) {
        console.error('Error al obtener las opciones de matrícula:', apiError.message);
      }
  
      // Obtener los datos del horario
      let horarios = [];
      let nombreMaestro = 'N/A';
      if (matricula.Cod_seccion) {
        try {
          const response = await fetch(
            `http://localhost:4000/api/matricula/horario/${matricula.Cod_seccion}`
          );
          if (response.ok) {
            const result = await response.json();
            horarios = result.data || [];
            nombreMaestro = await obtenerNombreMaestro(matricula.Cod_seccion);
          } else {
            console.warn('Error al obtener los horarios de la sección');
          }
        } catch (apiError) {
          console.error('Error al obtener los datos del horario:', apiError.message);
        }
      }
  
      // Validar datos
      if (!matricula.Cod_seccion) {
        matricula.Nombre_seccion = 'Sin Asignar';
        matricula.Cod_seccion = 'N/A';
      }
  
      const doc = new jsPDF();
  
      // Encabezado
      const img = new Image();
      img.src = matricula.logo || './src/assets/brand/logo_saint_patrick.png';
  
      img.onload = () => {
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
  
        doc.setDrawColor(0, 102, 51);
        doc.setLineWidth(0.5);
        doc.line(10, 55, doc.internal.pageSize.width - 10, 55);
  
        // Información del Estudiante
        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.text('Información del Estudiante:', 10, 65);
        doc.setFontSize(10);
        doc.text(`Código de Matrícula: ${matricula.codificacion_matricula || 'N/A'}`, 10, 75);
        doc.text(`Fecha de Matrícula: ${matricula.fecha_matricula?.split('T')[0] || 'N/A'}`, 10, 80);
        doc.text(
          `Nombre Completo: ${
            [
              matricula.Nombre_Hijo || 'N/A',
              matricula.Segundo_nombre_Hijo || '',
              matricula.Apellido_Hijo || 'N/A',
              matricula.Segundo_apellido_Hijo || '',
            ]
              .filter(Boolean)
              .join(' ')
          }`,
          10,
          85
        );
        doc.text(`Padre/Madre/Tutor: ${matricula.Nombre_Padre || 'N/A'} ${matricula.Apellido_Padre || 'N/A'}`, 10, 95);
  
        // Detalles de Matrícula
        doc.setFontSize(12);
        doc.setTextColor(0, 102, 51);
        doc.text('Detalles de Matrícula:', 10, 105);
  

{/************************************************************************************************************************* */}
        doc.autoTable({
          startY: 110,
          head: [['Campo', 'Valor']],
          body: [
            ['Estado', opciones.estados_matricula?.find((e) => e.Cod_estado_matricula === matricula.Cod_estado_matricula)?.Tipo || 'N/A'],
            ['Período', opciones.periodos_matricula?.find((p) => p.Cod_periodo_matricula === matricula.Cod_periodo_matricula)?.Anio_academico || 'N/A'],
            ['Tipo de Matrícula', opciones.tipos_matricula?.find((t) => t.Cod_tipo_matricula === matricula.Cod_tipo_matricula)?.Tipo || 'N/A'],
            ['Grado', matricula.Nombre_grado || 'N/A'],
            ['Sección', matricula.Nombre_seccion || 'N/A'],
            ['Maestro', nombreMaestro],
          ],
          styles: { fontSize: 10 },
          headStyles: { fillColor: [0, 102, 51], textColor: [255, 255, 255] },
        });
  
        // Horario de Clases
        doc.setFontSize(12);
        doc.setTextColor(0, 102, 51);
        doc.text('Horario de Clases:', 10, doc.lastAutoTable.finalY + 15);
  
        doc.autoTable({
          startY: doc.lastAutoTable.finalY + 20,
          head: [['Horario', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']],
          body: horarios.length > 0
            ? horarios.map((h) => {
                return [
                  // Formato de hora sin segundos
                  `${h.horario_inicio.slice(0, 5)} - ${h.horario_fin.slice(0, 5)}`,
                  h.lunes ? h.Nombre_asignatura || 'N/A' : '-', // Nombre de asignatura del lunes
                  h.martes ? h.Nombre_asignatura || 'N/A' : '-', // Nombre de asignatura del martes
                  h.miercoles ? h.Nombre_asignatura || 'N/A' : '-', // Nombre de asignatura del miércoles
                  h.jueves ? h.Nombre_asignatura || 'N/A' : '-', // Nombre de asignatura del jueves
                  h.viernes ? h.Nombre_asignatura || 'N/A' : '-', // Nombre de asignatura del viernes
                  h.sabado ? h.Nombre_asignatura || 'N/A' : '-', // Nombre de asignatura del sábado
                  h.domingo ? h.Nombre_asignatura || 'N/A' : '-', // Nombre de asignatura del domingo
                ];
              })
            : [['No hay horarios disponibles', '', '', '', '', '', '', '']], // Mensaje si no hay horarios
          styles: {
            fontSize: 6, // Reducir el tamaño de la letra aún más
            overflow: 'linebreak',
          },
          headStyles: {
            fillColor: [0, 102, 51],
            textColor: [255, 255, 255],
            fontSize: 6, // Reducir tamaño de la fuente en los encabezados
            halign: 'center',
            valign: 'middle',
            lineColor: [0, 0, 0], // Bordes visibles
            lineWidth: 0.2, // Grosor fino
          },
          bodyStyles: {
            fontSize: 6, // Reducir tamaño de la fuente en el cuerpo
            halign: 'center',
            valign: 'middle',
            fillColor: [241, 250, 240], // Color de fondo de las celdas
            textColor: [0, 0, 0],
            lineColor: [0, 0, 0], // Bordes visibles
            lineWidth: 0.2, // Grosor fino
          },
          tableWidth: 'auto', // Ajustar automáticamente el ancho de la tabla
          margin: { left: 10, right: 10 }, // Centrando la tabla en la página
          
          didParseCell: function (data) {
            if (data.section === 'body') {
              const descansoLabels = ['RECREO', 'LUNCH', 'RECESO', 'RECESS', 'BREAK'];
              // Comprobamos si el valor de la celda corresponde a uno de los labels de descanso
              if (descansoLabels.includes(data.cell.raw)) {
                data.cell.styles.fillColor = [129, 199, 132]; // 🟢 Verde descanso
                data.cell.styles.textColor = [0, 0, 0];        // 🟢 Texto oscuro
                data.cell.styles.fontStyle = 'bold';            // Negrita
              }
            }
          },
        });



{/**********************************************************************************************************************************************/}        
  
        // Pie de página
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i);
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
          doc.text(`Fecha y Hora de Generación: ${creationDateTime}`, 10, doc.internal.pageSize.height - 10);
          doc.text(`Página ${i} de ${pageCount}`, doc.internal.pageSize.width - 30, doc.internal.pageSize.height - 10, {
            align: 'right',
          });
        }
  
        Swal.close();
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

 const handleEditMatricula = async (matricula) => {
  try {
    setModalVisible(true);
    setStep(1);
    
    // Setear los datos del padre
    setDniPadre(matricula.dni_padre);
    setNombrePadre(matricula.Nombre_Padre || '');
    setApellidoPadre(matricula.Apellido_Padre || '');

    // Cargar los hijos del padre
    const hijosResponse = await axios.get(`http://localhost:4000/api/matricula/hijos/${matricula.dni_padre}`);
    const hijosData = hijosResponse.data.hijos || [];
    setHijos(
      hijosData.map((hijo) => ({
        ...hijo,
        NombreCompleto: `${hijo.Primer_nombre} ${hijo.Segundo_nombre || ''} ${hijo.Primer_apellido} ${hijo.Segundo_apellido || ''}`.trim(),
        FechaNacimiento: hijo.fecha_nacimiento
          ? new Date(hijo.fecha_nacimiento).toISOString().split('T')[0]
          : 'N/A',
      }))
    );

    // Cargar las secciones disponibles del grado y período
    await obtenerSeccionesPorGrado(matricula.Cod_grado);

    // Llenar los datos de la matrícula en el formulario
    setSelectedGrado(matricula.Cod_grado);
    setSelectedSeccion(matricula.Cod_seccion);

    setMatriculaData((prev) => ({
      ...prev,
      fecha_matricula: matricula.fecha_matricula.split('T')[0],
      Cod_matricula: matricula.Cod_matricula,
      cod_grado: matricula.Cod_grado,
      cod_seccion: matricula.Cod_seccion,
      cod_estado_matricula: matricula.cod_estado_matricula,
      cod_periodo_matricula: matricula.cod_periodo_matricula,
      cod_tipo_matricula: matricula.cod_tipo_matricula,
      cod_hijo: matricula.cod_hijo,
      primer_nombre_hijo: matricula.Nombre_Hijo,
      segundo_nombre_hijo: matricula.Segundo_nombre_Hijo,
      primer_apellido_hijo: matricula.Apellido_Hijo,
      segundo_apellido_hijo: matricula.Segundo_apellido_Hijo,
      fecha_nacimiento_hijo: matricula.fecha_nacimiento?.split('T')[0] || '',
      nombre_completo_hijo: `${matricula.Nombre_Hijo} ${matricula.Segundo_nombre_Hijo || ''} ${matricula.Apellido_Hijo} ${matricula.Segundo_apellido_Hijo || ''}`.trim(),
    }));
  } catch (error) {
    console.error('Error al preparar la matrícula para edición:', error);
    Swal.fire('Error', 'Hubo un problema al preparar la matrícula para editar.', 'error');
  }
};

const handleDeleteMatricula = async (cod_matricula) => {
  const result = await Swal.fire({
    title: '¿Estás seguro?',
    text: 'Esta acción no se puede deshacer.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
  });

  if (result.isConfirmed) {
    try {
      await axios.delete(`http://localhost:4000/api/matricula/matriculas/${cod_matricula}`);
      Swal.fire('Eliminado', 'La matrícula ha sido eliminada.', 'success');
      obtenerMatriculas(); // Recargar la lista
    } catch (error) {
      console.error('Error al eliminar matrícula:', error);
      Swal.fire('Error', 'Hubo un problema al eliminar la matrícula.', 'error');
    }
  }
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
  <CCol xs="auto" className="text-center">
    <div style={{ display: 'inline-block' }}>
      <h3 style={{ margin: 0, fontWeight: 'bold', color: '#4B6251' }}>
        <CIcon icon={cilSchool} size="lg" style={{ color: '#4B6251', marginRight: '0.5rem' }} />
        Matrículas
      </h3>
      <div
        style={{
          width: '100%',
          height: '2px',
          backgroundColor: '#4B6251',
          marginTop: '4px',
        }}
      ></div>
    </div>
  </CCol>
</CRow>

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
  <CDropdownToggle
    style={{
      backgroundColor: '#5C7B3E', // Color exacto del botón en la imagen
      borderColor: '#617341',
      color: '#FFFFFF',
      fontWeight: '500',
      padding: '0.45rem 1.2rem',
      borderRadius: '6px',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    }}
  >
    <CIcon icon={cilFile} />
    Reportes
  </CDropdownToggle>

  <CDropdownMenu>
    <CDropdownItem
      onClick={() => {
        const filteredData = matriculas.filter((matricula) =>
          `${matricula.Nombre_Padre} ${matricula.Apellido_Padre}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
        );
        exportToExcel(filteredData);
      }}
    >
      <CIcon icon={cilSpreadsheet} className="me-2" />
      Descargar en Excel
    </CDropdownItem>

    <CDropdownItem
      onClick={() => {
        const filteredData = matriculas.filter((matricula) =>
          `${matricula.Nombre_Padre} ${matricula.Apellido_Padre}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
        );
        exportToPDF(filteredData);
      }}
    >
      <CIcon icon={cilDescription} className="me-2" />
      Descargar en PDF
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
      <CTableHeaderCell>Grado</CTableHeaderCell>
<CTableHeaderCell>Sección</CTableHeaderCell>
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
<CTableDataCell>{matricula.Nombre_grado}</CTableDataCell>
<CTableDataCell>{matricula.Nombre_seccion}</CTableDataCell>
          <CTableDataCell>{matricula.fecha_matricula.split('T')[0]}</CTableDataCell>
          <CTableDataCell>{estadoMatricula?.Tipo || 'N/A'}</CTableDataCell>
          {/* Mostrar el año académico siempre, incluso si el período está inactivo */}
          <CTableDataCell>{anioAcademico}</CTableDataCell>
          <CTableDataCell>
  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
  <CButton
      color="warning"
      onClick={() => handleEditMatricula(matricula)}
      title="Editar Matrícula"
    >
      <CIcon icon={cilPen} />
    </CButton>

    <CButton
      color="danger"
      onClick={() => handleDeleteMatricula(matricula.Cod_matricula)}
      title="Eliminar Matrícula"
    >
      <CIcon icon={cilTrash} />
    </CButton>

    <CButton
      color="success"
      style={{
        backgroundColor: '#6C8E58',
        borderColor: '#5B7750',
        color: '#FFFFFF',
        fontWeight: 500,
        fontSize: '0.85rem',
        padding: '0.3rem 0.5rem',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem',
        minHeight: '38px', // 👈 Alineación vertical base
      }}
      onClick={() => handleViewPDF(matricula)}
      title="Descargar PDF"
    >
      <CIcon icon={cilArrowCircleBottom} size="sm" />
      PDF
    </CButton>

   
  </div>

  
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
      style={{
        backgroundColor: '#5F6F5B',
        borderColor: '#4B5A47',
        color: '#FFFFFF',
        marginRight: '0.3cm',
      }}
      disabled={currentPage === 0}
      onClick={() => setCurrentPage(currentPage - 1)}
    >
      Anterior
    </CButton>
    <CButton
      style={{
        backgroundColor: '#5F6F5B',
        borderColor: '#4B5A47',
        color: '#FFFFFF',
      }}
      disabled={currentPage === pageCount - 1}
      onClick={() => setCurrentPage(currentPage + 1)}
    >
      Siguiente
    </CButton>
  </CPagination>
  <span className="mx-2 text-dark">Página {currentPage + 1} de {pageCount}</span>
</nav>

     
      <CModal
  visible={modalVisible}
  onClose={resetFormularioMatricula}
  backdrop="static"
  size="xl"
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
    <CCard className="mb-4 shadow-sm border-0">
      <CCardBody>
        <h5 className="mb-3 d-flex align-items-center">
          <span style={{ fontSize: '1.2rem', marginRight: '0.5rem' }}>👨‍👧</span>
          Información del Padre
        </h5>
        <hr className="mb-4" />
  <CInputGroup className="mb-3">
  <CInputGroupText><CIcon icon={cilUser} /></CInputGroupText>
  <CFormInput
    type="text"
    placeholder="DNI del padre"
    value={dniPadre}
    onChange={(e) => {
      const inputValue = e.target.value;

      if (/^\d*$/.test(inputValue) && inputValue.length <= 13) {
        setDniPadre(inputValue);

        // Si ya ingresó 13 dígitos válidos, busca automáticamente
        if (inputValue.length === 13) {
          obtenerHijos(inputValue);
        }
      } else if (inputValue.length > 13) {
        Swal.fire('Advertencia', 'El DNI no puede tener más de 13 dígitos.', 'warning');
      } else {
        Swal.fire('Advertencia', 'Solo se permiten números en este campo.', 'warning');
      }
    }}
    onKeyPress={(e) => {
      const charCode = e.which || e.keyCode;
      if (charCode < 48 || charCode > 57) {
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
  <CButton color="info" onClick={() => setBuscarNombreVisible(true)}>
    <CIcon icon={cilSearch} />
  </CButton>
</CInputGroup>


{/* Dropdown buscador por nombre debajo del campo de DNI */}
{buscarNombreVisible && (
  <div style={{ position: 'relative' }}>
    <div
      style={{
        position: 'absolute',
        zIndex: 10,
        backgroundColor: 'white',
        border: '1px solid #ccc',
        borderRadius: '5px',
        width: '100%',
        maxHeight: '260px',
        overflowY: 'auto',
        marginTop: '-10px',
        boxShadow: '0px 2px 10px rgba(0,0,0,0.1)',
      }}
    >
      {/* Botón cerrar (X) */}
      <div
        style={{
          textAlign: 'right',
          padding: '0.3rem 0.8rem',
          borderBottom: '1px solid #eee',
        }}
      >
        <button
          style={{
            border: 'none',
            background: 'none',
            fontSize: '1.2rem',
            color: '#888',
            cursor: 'pointer',
          }}
          onClick={() => {
            setBuscarNombreVisible(false);
            setNombreBusqueda('');
            setResultadosBusqueda([]);
          }}
          title="Cerrar búsqueda"
        >
          ×
        </button>
      </div>

      <CInputGroup className="p-2">
        <CFormInput
          autoFocus
          placeholder="Buscar padre por nombre..."
          value={nombreBusqueda}
          onChange={async (e) => {
            const value = e.target.value;
            setNombreBusqueda(value);
            if (value.trim().length >= 3) {
              try {
                const response = await axios.get(`http://localhost:4000/api/matricula/hijos/${value}`);
                setResultadosBusqueda([response.data.padre]);
              } catch (error) {
                setResultadosBusqueda([]);
              }
            } else {
              setResultadosBusqueda([]);
            }
          }}
        />
      </CInputGroup>

      {resultadosBusqueda.map((padre) => (
        <div
          key={padre.dni_persona}
          onClick={() => {
            setDniPadre(padre.dni_persona);
            setBuscarNombreVisible(false);
            setNombreBusqueda('');
            setResultadosBusqueda([]);
            obtenerHijos(padre.dni_persona);
          }}
          style={{ padding: '0.5rem 1rem', cursor: 'pointer', borderTop: '1px solid #eee' }}
        >
          {padre.Nombre_Padre} {padre.Apellido_Padre} - DNI: {padre.dni_persona}
        </div>
      ))}

      {nombreBusqueda.length >= 3 && resultadosBusqueda.length === 0 && (
        <div style={{ padding: '0.5rem 1rem', color: '#888' }}>
          No se encontraron coincidencias.
        </div>
      )}
    </div>
  </div>
)}


                <CRow className="mb-3">
                 <CRow className="mb-3">
  <CCol>
    <label>Nombre Completo del Padre</label>
    <CFormInput type="text" value={`${nombrePadre} ${apellidoPadre}`.trim()} readOnly />
  </CCol>
</CRow>

                </CRow>
              </CCardBody>
            </CCard>

            {/* Card para la Información del Hijo */}
<CCard className="mb-4 shadow-sm border-0">
  <CCardBody>
    <h5 className="mb-3 d-flex align-items-center">
      <span style={{ fontSize: '1.2rem', marginRight: '0.5rem' }}>🧒</span>
      Información del Hijo
    </h5>
    <hr className="mb-4" />

    <CInputGroup className="mb-3">
      <CInputGroupText>
        <CIcon icon={cilUserFemale} />
      </CInputGroupText>
      <CFormSelect
        name="cod_hijo"
        onChange={handleHijoChange}
        value={matriculaData.cod_hijo}
        required
        style={{ width: '100%', fontSize: '0.875rem' }}
      >
        <option value="">Selecciona el hijo</option>
        {hijos.map((hijo) => (
          <option
            key={hijo.Cod_persona}
            value={hijo.Cod_persona}
            title={`${hijo.Primer_nombre} ${hijo.Segundo_nombre || ''} ${hijo.Primer_apellido} ${hijo.Segundo_apellido || ''} - DNI: ${hijo.dni_persona}`}
          >
            {`${hijo.Primer_nombre} ${hijo.Segundo_nombre || ''} ${hijo.Primer_apellido} ${hijo.Segundo_apellido || ''} - DNI: ${hijo.dni_persona}`}
          </option>
        ))}
      </CFormSelect>
    </CInputGroup>

    <CRow className="mb-3">
      <CCol>
        <label>Nombre Completo</label>
        <CFormInput
          type="text"
          value={matriculaData.nombre_completo_hijo}
          readOnly
          style={{ whiteSpace: 'normal', overflowWrap: 'break-word' }}
        />
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
    <h5 className="mb-3 d-flex align-items-center">
      <span style={{ fontSize: '1.2rem', marginRight: '0.5rem' }}>📚</span>
      Información Académica
    </h5>
    <hr className="mb-4" />

    <CRow className="mb-4">
      <CCol>
        <label className="form-label fw-semibold">📅 Fecha de Matrícula</label>
        <CFormInput
          type="date"
          name="fecha_matricula"
          value={matriculaData.fecha_matricula}
          readOnly
          plaintext
          style={{
            backgroundColor: '#f8f9fa',
            border: '1px solid #ced4da',
            borderRadius: '0.375rem',
            paddingLeft: '0.75rem'
          }}
        />
      </CCol>
    </CRow>
            {/* Selector de Grado */}
<div className="mb-3">
  <h6>Elije Grado</h6>
  <div className="d-flex flex-wrap gap-2">
    {opciones.grados.map((grado) => (
      <CButton
        key={grado.Cod_grado}
        onClick={() => {
          setSelectedGrado(grado.Cod_grado);
          obtenerSeccionesPorGrado(grado.Cod_grado);
        }}
        style={{
          backgroundColor: selectedGrado === grado.Cod_grado ? '#4B6251' : '#E9ECEF',
          borderColor: selectedGrado === grado.Cod_grado ? '#0F463A' : '#DEE2E6',
          color: selectedGrado === grado.Cod_grado ? '#FFF' : '#212529',
          borderRadius: '20px',
          padding: '0.5rem 1.2rem',
          fontWeight: 'bold',
          boxShadow: selectedGrado === grado.Cod_grado ? '0 0 6px #0F463A' : 'none',
          transition: 'all 0.2s ease-in-out',
        }}
      >
        {grado.Nombre_grado}
      </CButton>
    ))}
  </div>
</div>


{/* Selector de Sección */}
<CRow className="mt-3">
  <h6>Elije Sección</h6>

  {loading ? (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100px' }}>
      <CSpinner color="primary" />
    </div>
  ) : secciones.length > 0 ? (
    [...secciones]
      .sort((a, b) => b.Cantidad_matriculados - a.Cantidad_matriculados)
      .map((seccion) => {
        const cantidad = seccion.Cantidad_matriculados || 0;

        const getBorderColor = () => {
          if (cantidad > 30) return '#DC3545';
          if (cantidad >= 20) return '#FFC107';
          return '#198754';
        };

        return (
          <CCol md={6} lg={4} className="mb-3" key={seccion.Cod_secciones}>
            <CCard
              className={selectedSeccion === seccion.Cod_secciones ? 'border-primary' : ''}
              style={{
                borderColor: selectedSeccion === seccion.Cod_secciones
                  ? '#0F463A'
                  : getBorderColor(),
                backgroundColor: selectedSeccion === seccion.Cod_secciones ? '#4B6251' : '#FFF',
                boxShadow: selectedSeccion === seccion.Cod_secciones ? '0 0 10px #0F463A' : 'none',
              }}
            >
              <CCardBody>
                <CCardTitle
                  style={{
                    color: selectedSeccion === seccion.Cod_secciones ? '#FFF' : '#000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontWeight: 'bold',
                    fontSize: '1.1rem',
                  }}
                >
                  {seccion.Nombre_seccion}
                  <div>
                    {cantidad === 0 && <span className="badge bg-secondary ms-2">🛑 Vacía</span>}
                    {cantidad > 30 && <span className="badge bg-danger ms-2">🔥 Alta demanda</span>}
                  </div>
                </CCardTitle>

                <hr style={{ borderColor: selectedSeccion === seccion.Cod_secciones ? '#FFF' : '#CCC' }} />

                <CCardText
                  style={{
                    color: selectedSeccion === seccion.Cod_secciones ? '#FFF' : '#000',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.4rem',
                    fontSize: '0.95rem',
                  }}
                >
                  <div><strong>Aula:</strong> {seccion.Numero_aula || 'No disponible'}</div>
                  <div><strong>Edificio:</strong> {seccion.Nombre_edificios || 'No disponible'}</div>
                  <div><strong>Profesor:</strong> {seccion.Nombre_profesor ? `${seccion.Nombre_profesor} ${seccion.Apellido_profesor}` : 'No disponible'}</div>
                  <div><strong>Alumnos Matriculados:</strong> {cantidad}</div>
                </CCardText>

                <div className="progress" style={{ height: '6px', marginTop: '0.8rem' }}>
                  <div
                    className={`progress-bar ${
                      cantidad > 30
                        ? 'bg-danger'
                        : cantidad >= 20
                        ? 'bg-warning'
                        : 'bg-success'
                    }`}
                    role="progressbar"
                    style={{
                      width: `${Math.min((cantidad / 40) * 100, 100)}%`,
                    }}
                  ></div>
                </div>

                <CButton
                  color="primary"
                  onClick={() => setSelectedSeccion(seccion.Cod_secciones)}
                  style={{
                    backgroundColor: '#4B6251',
                    borderColor: '#0F463A',
                    color: '#FFF',
                    marginTop: '1.2rem',
                    width: '100%',
                  }}
                >
                  Elije Sección
                </CButton>
              </CCardBody>
            </CCard>
          </CCol>
        );
      })
  ) : (
    <p>No hay secciones disponibles para el grado seleccionado.</p>
  )}
</CRow>

</div>
)}

{/* Paso 3: Tipo, Estado y Período de Matrícula */}
{step === 3 && (
  <div>
    <h5 className="mb-3 d-flex align-items-center">
      <span style={{ fontSize: '1.2rem', marginRight: '0.5rem' }}>📝</span>
      Tipo, Estado y Período de Matrícula
    </h5>
    <hr className="mb-4" />

    <CRow className="mb-4">
      <CCol md={6}>
        <label className="form-label fw-semibold">Tipo de Matrícula</label>
        <CFormSelect
          name="cod_tipo_matricula"
          value={matriculaData.cod_tipo_matricula}
          onChange={(e) =>
            setMatriculaData({ ...matriculaData, cod_tipo_matricula: e.target.value })
          }
          required
          invalid={!matriculaData.cod_tipo_matricula}
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
        {!matriculaData.cod_tipo_matricula && (
          <div className="invalid-feedback d-block">Este campo es obligatorio</div>
        )}
      </CCol>

      <CCol md={6}>
        <label className="form-label fw-semibold">Estado de Matrícula</label>
        <CFormSelect
          name="cod_estado_matricula"
          value={matriculaData.cod_estado_matricula}
          onChange={(e) =>
            setMatriculaData({ ...matriculaData, cod_estado_matricula: e.target.value })
          }
          required
          invalid={!matriculaData.cod_estado_matricula}
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
        {!matriculaData.cod_estado_matricula && (
          <div className="invalid-feedback d-block">Este campo es obligatorio</div>
        )}
      </CCol>
    </CRow>

    <CRow className="mb-3">
      <CCol>
        <label className="form-label fw-semibold">Período Académico</label>
        <CFormInput
          type="text"
          value={periodoActivo ? periodoActivo.Anio_academico : 'No disponible'}
          readOnly
          plaintext
          style={{
            backgroundColor: '#f8f9fa',
            border: '1px solid #ced4da',
            borderRadius: '0.375rem',
          }}
        />
        {periodoActivo?.Fecha_inicio && (
          <div className="text-muted small mt-1">
            Del {periodoActivo.Fecha_inicio} al {periodoActivo.Fecha_fin}
          </div>
        )}
      </CCol>
    </CRow>
  </div>
)}

{/* mensaje si no hay período activo */}
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
