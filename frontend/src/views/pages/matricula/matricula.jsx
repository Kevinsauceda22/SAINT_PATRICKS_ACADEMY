import React, { useState, useEffect } from 'react';
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
import { cilUser, cilCalendar, cilCheckCircle, cilUserFemale, cilEducation } from '@coreui/icons';
import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import logo from 'src/assets/brand/logo_saint_patrick.png';

const MatriculaForm = () => {
  const [loading, setLoading] = useState(true);
  const [opciones, setOpciones] = useState({});
  const [hijos, setHijos] = useState([]);
  const [dniPadre, setDniPadre] = useState('');
  const [nombrePadre, setNombrePadre] = useState('');
  const [apellidoPadre, setApellidoPadre] = useState('');
  const [step, setStep] = useState(1); // Estado para el paso actual
  const [selectedSeccion, setSelectedSeccion] = useState(''); // Añadir esta línea
  const [secciones, setSecciones] = useState([]); // Estado para almacenar las secciones disponibles
  const [selectedGrado, setSelectedGrado] = useState(''); // Define el estado para el grado seleccionado
  const [periodoActivo, setPeriodoActivo] = useState(null); // Nuevo estado para el período activo
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
  });

  const [modalVisible, setModalVisible] = useState(false);
  const [matriculas, setMatriculas] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

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
      const periodoActivoEncontrado = opcionesData.periodos_matricula?.[0];
      if (periodoActivoEncontrado) {
        console.log("Período activo encontrado:", periodoActivoEncontrado);
  
        // Guardar el período activo en el estado
        setPeriodoActivo(periodoActivoEncontrado);
        setMatriculaData((prev) => ({
          ...prev,
          cod_periodo_matricula: periodoActivoEncontrado.Cod_periodo_matricula, // Asigna el período activo
        }));
      } else {
        setPeriodoActivo(null); // No hay período activo encontrado
      }
  
      setOpciones(opcionesData); // Guarda todas las opciones en el estado
      
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
    if (!dniPadre) return;
    try {
      const response = await axios.get(`http://localhost:4000/api/matricula/hijos/${dniPadre}`);
      const { padre, hijos } = response.data;
  
      // Asignar valores para el nombre y apellido del padre
      setHijos(hijos.map(hijo => ({
        ...hijo,
        NombreCompleto: `${hijo.Primer_nombre} ${hijo.Segundo_nombre || ''} ${hijo.Primer_apellido} ${hijo.Segundo_apellido || ''}`.trim(),
        FechaNacimiento: hijo.fecha_nacimiento_hijo 
          ? new Date(hijo.fecha_nacimiento_hijo).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
          : 'N/A'
      })));
  
      setNombrePadre(padre.Nombre_Padre || '');
      setApellidoPadre(padre.Apellido_Padre || '');
  
      if (hijos.length === 0) {
        Swal.fire('Advertencia', 'No se encontraron hijos asociados.', 'warning');
      }
    } catch (error) {
      Swal.fire('Error', 'Error al obtener los hijos asociados.', 'error');
    }
  };
  
  
 // Función para obtener las secciones por grado seleccionado
const obtenerSeccionesPorGrado = async (codGrado) => {
  if (!codGrado) {
    setSecciones([]); // Limpiar las secciones si no se selecciona un grado
    return;
  }

  try {
    const response = await axios.get(`http://localhost:4000/api/matricula/secciones/${codGrado}`);
    console.log('Secciones obtenidas:', response.data.data); // Verificar la respuesta de secciones
    setSecciones(response.data.data || []);
  } catch (error) {
    console.error('Error al obtener las secciones del grado seleccionado:', error);
    alert('Error al obtener las secciones del grado seleccionado');
  }
};

const handleGradoChange = (e) => {
  const codGrado = e.target.value;
  setSelectedGrado(codGrado);
  obtenerSeccionesPorGrado(codGrado);
};

const handleSubmit = async (e) => {
  e.preventDefault();

  // Crear el objeto con solo los datos necesarios para el backend
  const dataToSend = {
    dni_padre: dniPadre,
    fecha_matricula: matriculaData.fecha_matricula,
    cod_grado: selectedGrado,
    cod_seccion: selectedSeccion,
    cod_estado_matricula: matriculaData.cod_estado_matricula,
    cod_periodo_matricula: matriculaData.cod_periodo_matricula,
    cod_tipo_matricula: matriculaData.cod_tipo_matricula,
    cod_hijo: matriculaData.cod_hijo, // Asegúrate de enviar el `cod_hijo`
  };

  // Verificar que todos los campos requeridos estén llenos, excepto los asignados automáticamente
  const requiredFields = ['dni_padre', 'cod_grado', 'cod_seccion', 'cod_estado_matricula', 'cod_tipo_matricula', 'cod_hijo'];
  const missingFields = requiredFields.filter((field) => !dataToSend[field]);

  if (!dataToSend.fecha_matricula) {
    Swal.fire('Error', 'La fecha de matrícula no está asignada automáticamente.', 'error');
    return;
  }

  if (missingFields.length > 0) {
    Swal.fire('Error', 'Todos los campos son requeridos.', 'error');
    return;
  }

  try {
    const response = await axios.post('http://localhost:4000/api/matricula/crearmatricula', dataToSend);
    Swal.fire('Éxito', response.data.message, 'success');
    setModalVisible(false);
    setStep(1); // Reinicia el paso al cerrar el modal
    obtenerMatriculas();
  } catch (error) {
    console.error('Error al crear la matrícula:', error.response?.data);
    Swal.fire('Error', error.response?.data?.message || 'Error al crear la matrícula.', 'error');
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
    const hijoSeleccionado = hijos.find(hijo => hijo.Cod_persona === parseInt(codHijo));
    if (hijoSeleccionado) {
      setMatriculaData(prevData => ({
        ...prevData,
        primer_nombre_hijo: hijoSeleccionado.Primer_nombre || '', // Manejar null con cadena vacía
        segundo_nombre_hijo: hijoSeleccionado.Segundo_nombre || '', // Manejar null con cadena vacía
        primer_apellido_hijo: hijoSeleccionado.Primer_apellido || '', // Manejar null con cadena vacía
        segundo_apellido_hijo: hijoSeleccionado.Segundo_apellido || '', // Manejar null con cadena vacía
        fecha_nacimiento_hijo: hijoSeleccionado.fecha_nacimiento
          ? hijoSeleccionado.fecha_nacimiento.split('T')[0] // Formatear la fecha si no es null
          : '', // Si la fecha es null, usar cadena vacía
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

    // Insertar el logo
    const img = new Image();
    img.src = logo;  // Usar el logo importado desde el directorio
    img.onload = () => {
        doc.addImage(img, 'PNG', 10, 10, 30, 30); // Colocar el logo en la esquina superior izquierda

        // Encabezado del reporte
        doc.setFontSize(18);
        doc.text('Reporte General de Matrículas', doc.internal.pageSize.width / 2, 20, { align: 'center' });
        
        // Línea divisoria
        doc.setLineWidth(0.5);
        doc.line(10, 35, doc.internal.pageSize.width - 10, 35);

        // Detalles de la institución
        doc.setFontSize(12);
        doc.setTextColor(100);
        doc.text('Saint Patrick Academy', 50, 45);
        doc.text('Dirección: 123 Calle Principal, Ciudad', 50, 50);
        doc.text('Teléfono: (555) 123-4567', 50, 55);
        doc.text('Correo: info@saintpatrickacademy.edu', 50, 60);

        // Línea divisoria después del encabezado
        doc.setLineWidth(0.2);
        doc.line(10, 65, doc.internal.pageSize.width - 10, 65);

        // Título de la tabla
        doc.setFontSize(14);
        doc.setTextColor(0, 51, 102);  // Color azul oscuro
        doc.text('Detalles de Matrículas', doc.internal.pageSize.width / 2, 75, { align: 'center' });

        // Tabla de detalles de matrícula con diseño mejorado
        doc.autoTable({
            startY: 80,
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
                textColor: [34, 34, 34],
                cellPadding: 4,
                valign: 'middle',
                overflow: 'linebreak',
            },
            headStyles: {
                fillColor: [22, 160, 133],  // Verde azulado para los encabezados
                textColor: [255, 255, 255],
                fontSize: 12,
            },
            alternateRowStyles: { fillColor: [240, 248, 255] }, // Color azul claro alternado para las filas
            margin: { left: 10, right: 10 },
        });

        // Pie de página con fecha de generación
        doc.setFontSize(10);
        doc.setTextColor(100);
        const date = new Date().toLocaleDateString();
        doc.text(`Fecha de generación: ${date}`, 10, doc.internal.pageSize.height - 10);

        // Guardar el PDF con un nombre específico
        doc.save('Reporte_General_Matriculas.pdf');
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
  
  const handleViewPDF = (matricula) => {
    const doc = new jsPDF();
 
    // Convertimos la imagen importada en base64 y la añadimos al PDF
    const img = new Image();
    img.src = logo;  // Usamos la imagen importada
 
    img.onload = () => {
       doc.addImage(img, 'PNG', 10, 10, 30, 30); // Insertar el logo
 
       // Encabezado con título de la institución
       doc.setFontSize(18);
       doc.text('Saint Patrick Academy', 50, 20);
 
       // Título del documento
       doc.setFontSize(14);
       doc.text(`Detalle de Matrícula`, doc.internal.pageSize.width / 2, 50, { align: 'center' });
 
       // Línea divisoria
       doc.setLineWidth(0.5);
       doc.line(10, 55, doc.internal.pageSize.width - 10, 55);
 
       // Información general del estudiante
       doc.setFontSize(12);
       doc.text('Información del Estudiante:', 10, 65);
       doc.setFontSize(10);
       doc.text(`Código de Matrícula: ${matricula.codificacion_matricula}`, 10, 75);
       doc.text(`Fecha de Matrícula: ${matricula.fecha_matricula.split('T')[0]}`, 10, 80);
       
       // Información adicional del estudiante
       doc.text(`Nombre Completo: ${matricula.Nombre_Hijo} ${matricula.Segundo_nombre_Hijo || ''} ${matricula.Apellido_Hijo} ${matricula.Segundo_apellido_Hijo || ''}`, 10, 85);
       doc.text(`Fecha de Nacimiento: ${matriculaData.fecha_nacimiento_hijo || ''}`, 10, 90);

       // Información del alumno y tutor
       doc.text(`Padre/Madre/Tutor: ${matricula.Nombre_Padre} ${matricula.Apellido_Padre}`, 10, 95);
 
       // Sección de Detalles de Matrícula
       doc.setFontSize(12);
       doc.text('Detalles de Matrícula:', 10, 105);
 
       // Tabla con detalles específicos usando autoTable
       doc.autoTable({
          startY: 110,
          head: [['Campo', 'Valor']],
          body: [
             ['Estado', opciones.estados_matricula?.find(e => e.Cod_estado_matricula === matricula.Cod_estado_matricula)?.Tipo || 'N/A'],
             ['Período', opciones.periodos_matricula?.find(p => p.Cod_periodo_matricula === matricula.Cod_periodo_matricula)?.Anio_academico || 'N/A'],
             ['Tipo de Matrícula', opciones.tipos_matricula?.find(t => t.Cod_tipo_matricula === matricula.Cod_tipo_matricula)?.Tipo || 'N/A'],
             ['Grado', matricula.Nombre_grado || 'N/A'],
             ['Sección', matricula.Nombre_seccion || 'N/A'],
          ],
          styles: { fontSize: 10, textColor: [40, 40, 40] },
          headStyles: { fillColor: [22, 160, 133] },
          alternateRowStyles: { fillColor: [240, 240, 240] },
       });
 
       // Pie de página con nota
       doc.setFontSize(10);
       doc.text('Este documento es solo para fines informativos. Contacte a la administración para más detalles.', 10, doc.internal.pageSize.height - 20);
 
       // Guardar el PDF con el nombre específico de la matrícula
       doc.save(`Detalle_Matricula_${matricula.codificacion_matricula}.pdf`);
    };
 
    img.onerror = () => {
       Swal.fire('Error', 'No se pudo cargar el logo.', 'error');
    };

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

  return (
    <CContainer>
 <CRow className="justify-content-between align-items-center mb-2">
  <CCol xs={12} md={6}>
    <h3>Matrículas</h3>
  </CCol>
  <CCol xs={12} md={6} className="d-flex justify-content-end align-items-center">
  <CButton 
  color="dark" 
  onClick={() => {
    // Verificar si hay un período activo
    const hayPeriodoActivo = opciones.periodos_matricula?.some(
      (p) => p.estado === 'activo'
    );

    if (hayPeriodoActivo) {
      // Si hay un período activo, abrir el modal
      setModalVisible(true);
    } else {
      // Si no hay un período activo, mostrar un mensaje de advertencia
      Swal.fire('Advertencia', 'No hay un período de matrícula activo.', 'warning');
    }
  }} 
  className="me-2" 
  style={{ backgroundColor: '#4B6251', borderColor: '#0F463A' }}
>
  <CIcon icon={cilPlus} /> Matrícula
</CButton>


<CDropdown>
  <CDropdownToggle 
    color="success" 
    style={{ backgroundColor: '#6C8E58', borderColor: '#617341' }}
  >
    <CIcon icon={cilFile} /> Reporte
  </CDropdownToggle>
  <CDropdownMenu>
    <CDropdownItem onClick={exportToPDF}>Exportar a PDF</CDropdownItem>
    <CDropdownItem onClick={exportToExcel}>Exportar a Excel</CDropdownItem>
  </CDropdownMenu>
</CDropdown>


  </CCol>
</CRow>
{/* Barra de búsqueda alineada con la parte superior de la tabla */}
<CRow className="align-items-center">
  <CCol md={5}>
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
</CRow>
{/* Nueva fila para el selector de cantidad de registros, debajo de los botones */}
<CRow className="justify-content-end mb-4">
  <CCol xs="auto" className="d-flex align-items-center">
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
            {/* Botón para abrir el modal */}
            <CButton
              color="warning"
              className="me-1"
              onClick={() => {
                // Verificar si hay algún período activo
                const hayPeriodoActivo = opciones.periodos_matricula?.some(
                  (p) => p.estado === 'activo'
                );

                if (hayPeriodoActivo) {
                  // Solo abre el modal si hay un período activo
                  abrirModal(); // Reemplaza esto con tu función para abrir el modal
                } else {
                  // Muestra una advertencia si no hay período activo
                  Swal.fire('Advertencia', 'No hay un período activo disponible.', 'warning');
                }
              }}
            >
              <CIcon icon={cilPen} />
            </CButton>
            <CButton color="danger" className="me-1" onClick={() => {/* Lógica para eliminar */}}>
              <CIcon icon={cilTrash} />
            </CButton>
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
    setMatriculaData({
      fecha_matricula: getCurrentDate(), // Establece la fecha actual automáticamente
      cod_grado: '',
      cod_seccion: '',
      cod_estado_matricula: '',
      cod_periodo_matricula: periodoActivo?.Cod_periodo_matricula || '', // Asigna el período activo automáticamente si existe
      cod_tipo_matricula: '',
      cod_hijo: '',
      primer_nombre_hijo: '',     
      segundo_nombre_hijo: '',    
      primer_apellido_hijo: '',   
      segundo_apellido_hijo: '',  
      fecha_nacimiento_hijo: '',  
    });
    setDniPadre('');  // Reinicia el DNI del padre
    setNombrePadre(''); // Reinicia el nombre del padre
    setApellidoPadre(''); // Reinicia el apellido del padre
    setSelectedGrado(''); // Reinicia el grado seleccionado
    setSelectedSeccion(''); // Reinicia la sección seleccionada
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
            <h5>Información del Padre</h5>
            <hr />
            <CInputGroup className="mb-3">
              <CInputGroupText><CIcon icon={cilUser} /></CInputGroupText>
              <CFormInput
                type="text"
                placeholder="DNI del Padre"
                value={dniPadre}
                onChange={(e) => setDniPadre(e.target.value)}
                onBlur={obtenerHijos}
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

            <h5>Información de la Hijo</h5>
            <hr />
            <CInputGroup className="mb-3">
              <CInputGroupText><CIcon icon={cilUserFemale} /></CInputGroupText>
              <CFormSelect name="cod_hijo" onChange={handleHijoChange} value={matriculaData.cod_hijo} required>
                <option value="">Selecciona del hijo</option>
                {hijos.map((hijo) => (
                  <option key={hijo.Cod_persona} value={hijo.Cod_persona}>{hijo.NombreCompleto}</option>
                ))}
              </CFormSelect>
            </CInputGroup>
            <CRow className="mb-3">
              <CCol>
                <label>Primer Nombre</label>
                <CFormInput type="text" value={matriculaData.primer_nombre_hijo} readOnly />
              </CCol>
              <CCol>
                <label>Segundo Nombre</label>
                <CFormInput type="text" value={matriculaData.segundo_nombre_hijo} readOnly />
              </CCol>
            </CRow>
            <CRow className="mb-3">
              <CCol>
                <label>Primer Apellido</label>
                <CFormInput type="text" value={matriculaData.primer_apellido_hijo} readOnly />
              </CCol>
              <CCol>
                <label>Segundo Apellido</label>
                <CFormInput type="text" value={matriculaData.segundo_apellido_hijo} readOnly />
              </CCol>
            </CRow>
            <label>Fecha de Nacimiento</label>
            <CInputGroup className="mb-3">
              <CInputGroupText><CIcon icon={cilCalendar} /></CInputGroupText>
              <CFormInput type="date" value={matriculaData.fecha_nacimiento_hijo} readOnly />
            </CInputGroup>
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
      value={matriculaData.fecha_matricula} // Se debe asignar automáticamente
      readOnly
      required
    />
  </CCol>
</CRow>

 {/* selelctor de gra */}
<div className="mb-3">
  {opciones.grados.map((grado) => (
    <CButton
      color={selectedGrado === grado.Cod_grado ? 'dark' : 'secondary'}
      key={grado.Cod_grado}
      onClick={() => {
        setSelectedGrado(grado.Cod_grado);
        obtenerSeccionesPorGrado(grado.Cod_grado);
      }}
      className="m-1"
      style={{
        backgroundColor: selectedGrado === grado.Cod_grado ? '#4B6251' : '#6C757D', // Color de fondo
        borderColor: selectedGrado === grado.Cod_grado ? '#0F463A' : '#495057',    // Color de borde
        color: '#FFF', // Color del texto en blanco
      }}
    >
      {grado.Nombre_grado}
    </CButton>
  ))}
</div>
 {/* selector de seccion */}
<CRow className="mt-3">
  {secciones.length > 0 ? (
    secciones.map((seccion) => (
      <CCol md={6} lg={4} className="mb-3" key={seccion.Cod_secciones}>
        <CCard
          className={selectedSeccion === seccion.Cod_secciones ? 'border-primary' : ''}
          style={{
            borderColor: selectedSeccion === seccion.Cod_secciones ? '#0F463A' : '#CED4DA',
            backgroundColor: selectedSeccion === seccion.Cod_secciones ? '#4B6251' : '#FFF', // Color de fondo
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
              onClick={() => setSelectedSeccion(seccion.Cod_secciones)}
              style={{
                backgroundColor: '#4B6251', // Color de fondo
                borderColor: '#0F463A',     // Color de borde
                color: '#FFF',              // Color del texto en blanco
              }}
            >
              Seleccionar
            </CButton>
          </CCardBody>
        </CCard>
      </CCol>
    ))
  ) : (
    <p>No hay secciones disponibles para el grado seleccionado.</p>
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
                  onChange={(e) => setMatriculaData({ ...matriculaData, cod_estado_matricula: e.target.value })}
                  value={matriculaData.cod_estado_matricula}
                  required
                >
                  <option value="">Selecciona el Estado</option>
                  {opciones.estados_matricula?.map((estado) => (
                    <option key={estado.Cod_estado_matricula} value={estado.Cod_estado_matricula}>{estado.Tipo}</option>
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
                onChange={(e) => setMatriculaData({ ...matriculaData, cod_tipo_matricula: e.target.value })}
                value={matriculaData.cod_tipo_matricula}
                required
              >
                <option value="">Selecciona el Tipo</option>
                {opciones.tipos_matricula?.map((tipo) => (
                  <option key={tipo.Cod_tipo_matricula} value={tipo.Cod_tipo_matricula}>{tipo.Tipo}</option>
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
      <CButton color="secondary" onClick={prevStep}>Atrás</CButton>
    )}
    {step < 3 ? (
      <CButton color="primary" onClick={nextStep}>Siguiente</CButton>
    ) : (
      <CButton color="success" onClick={handleSubmit} disabled={!periodoActivo}>Finalizar y Guardar</CButton>
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
