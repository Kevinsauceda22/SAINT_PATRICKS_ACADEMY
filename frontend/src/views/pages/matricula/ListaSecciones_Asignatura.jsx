import React, { useState, useEffect } from 'react';
import CIcon from '@coreui/icons-react';
import { useLocation } from 'react-router-dom';
import { cilSearch, cilBrushAlt,cilArrowLeft, cilPen, cilTrash, cilPlus, cilSave, cilDescription,cilArrowCircleBottom, } from '@coreui/icons';
import swal from 'sweetalert2';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import {
  CButton,
  CContainer,
  CDropdown,
  CDropdownMenu,
  CDropdownToggle,
  CDropdownItem,
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
  CFormCheck,
} from '@coreui/react';
import { useNavigate } from 'react-router-dom';
import logo from 'src/assets/brand/logo_saint_patrick.png';
const ListaSecciones_Asignaturas= () =>{
    const [secciones_asignaturas, setSecciones_Asignaturas] = useState([]);
    const [secciones, setSecciones] = useState([]);
    const [dias, setDias] = useState([]);
    const [asignaturasFiltradas, setAsignaturasFiltradas] = useState([]);

    const [grados_asignaturas, setGradosAsignaturas] = useState([]);
    const [nuevaSeccionAsignatura, setNuevaSeccionAsignatura] = useState({
    p_Cod_grados_asignaturas: '',
    p_Cod_secciones: '',
     p_Cod_dias: [],
    p_Hora_inicio: '',
    p_Hora_fin: '',
    });
    const [modalVisible, setModalVisible] = useState(false);
    const [errors, setErrors] = useState({ p_Cod_grados_asignaturas: '', p_Cod_secciones: '', p_Cod_dias: '', p_Hora_inicio: '', p_Hora_fin: '',});
    const [modalUpdateVisible, setModalUpdateVisible] = useState(false);
    const [modalDeleteVisible, setModalDeleteVisible] = useState(false);
    const [seccionAsignaturaToUpdate, setSeccionesAsignaturasToUpdate] = useState({})
    const [mensajeError, setMensajeError] = useState(''); // Estado para el mensaje de error
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [recordsPerPage, setRecordsPerPage] = useState(10);
    const [searchField, setSearchField] = useState("Nombre_seccion, Nombre_grado, Nombre_asignatura");
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false); // Estado para detectar cambios sin guardar
    const resetSeccionAsignatura = () => setNuevaSeccionAsignatura('');
    const [selectedGrado, setSelectedGrado] = useState(""); // Grado seleccionado
    const navigate = useNavigate();
    const location = useLocation();
    const {seccionSeleccionada, periodoSeleccionado, gradoSeleccionado} = location.state || {}; // Seccion seleccionada desde la vista anterior

    useEffect(() => {
      if (!seccionSeleccionada || !periodoSeleccionado) {
        swal.fire('Error', 'Faltan datos para gestionar las asignaturas.', 'error');
        navigate('/lista-secciones');
      } 
    }, [seccionSeleccionada, periodoSeleccionado]);
  useEffect(() => {
    
    if (grados_asignaturas.length > 0 && gradoSeleccionado && seccionSeleccionada) {
        fetchSeccionesAsigyHora();
    }
}, [grados_asignaturas, gradoSeleccionado, seccionSeleccionada]);



    useEffect(() => {
     
      fetchSecciones();
      fetchDias();
      fetchGradosAsignaturas();
    }, []);
    // Obtener secciones cuando cambia el grado seleccionado
  useEffect(() => {
    if (selectedGrado) {
      console.log("Llamando a fetchSeccionesPorGrado con:", selectedGrado);
      fetchSeccionesPorGrado(selectedGrado);
    }
  }, [selectedGrado]);
 
  const fetchSeccionesAsigyHora = async () => {
    try {
        const response = await fetch(`http://localhost:4000/api/secciones_asignaturas/asignaturas/${seccionSeleccionada}`);
        const data = await response.json();

        console.log("Datos crudos recibidos de la API:", data);

        if (response.ok) {
          setSecciones_Asignaturas(data.map((item) => ({
            ...item,
            Nombre_profesor: item.Nombre_completo || 'Sin profesor asignado',
        })));
        console.log("Datos recibidos de la API:", data);

        } else {
            setSecciones_Asignaturas([]);
            swal.fire('Atención', 'No se encontraron asignaturas para esta sección.', 'info');
        }
    } catch (error) {
        console.error('Error al cargar las asignaturas:', error);
        swal.fire('Error', 'Hubo un problema al cargar las asignaturas.', 'error');
    }
};




      const fetchSecciones = async (Cod_grado, Cod_periodo_matricula) => { 
        try {
          const response = await fetch(
            `http://localhost:4000/api/secciones_asignaturas/secciones/${Cod_grado}/${Cod_periodo_matricula}`
          );
      
          if (!response.ok) {
            throw new Error('No se encontraron secciones para este grado y periodo.');
          }
      
          const data = await response.json();
          setSecciones(data);
        } catch (error) {
          console.error('Error al cargar secciones:', error);
          setSecciones([]); // Limpia el estado si ocurre un error
        }
      };
      

      const fetchSeccionesPorGrado = async (Cod_grado) => {
        if (!Cod_grado || !periodoSeleccionado) {
          console.error('Cod_grado o periodoSeleccionado están indefinidos.');
          return;
        }
      
        console.log("Cod_grado enviado al backend:", Cod_grado);
        console.log("Cod_periodo_matricula enviado al backend:", periodoSeleccionado);
      
        try {
          const response = await fetch(
            `http://localhost:4000/api/secciones_asignaturas/secciones/${Cod_grado}/${periodoSeleccionado}`
          );
      
          if (!response.ok) {
            throw new Error('No se encontraron secciones para este grado y periodo.');
          }
      
          const data = await response.json();
          setSecciones(data); // Actualiza el estado con las secciones filtradas
        } catch (error) {
          console.error('Error al obtener secciones:', error);
          setSecciones([]); // Limpia el estado si ocurre un error
        }
      };
      
  
    const fetchDias = async () => {
      try {
        const response = await fetch('http://localhost:4000/api/secciones_asignaturas/dias');
        const data = await response.json();
        setDias(data);
      } catch (error) {
        console.error('Error al cargar días:', error);
      }
    };
    const fetchGradosAsignaturas = async () => {
      try {
        const response = await fetch('http://localhost:4000/api/secciones_asignaturas/grados_asignaturas');
        const data = await response.json();
        setGradosAsignaturas(data);
        console.log('Datos cargados en grados_asignaturas:', data); // <-- Aquí imprimimos los datos obtenidos
      } catch (error) {
        console.error('Error al cargar los grados y asignaturas:', error);
      }
    };
    const volverAListaSecciones = () => {
      navigate('/lista-secciones', {
        state: { periodoSeleccionado }
      });
    };
    
    
    
    const handleGradoChange = (selectedCodGrado) => {
      // Encuentra el grado por Cod_grado
      const gradoSeleccionado = grados_asignaturas.find(
        (grado) => grado.Cod_grado === parseInt(selectedCodGrado, 10) // Asegúrate de comparar como número
      );
    
      if (gradoSeleccionado) {
        // Actualiza el estado con el Cod_grado y resetea asignaturas y secciones
        setNuevaSeccionAsignatura((prev) => ({
          ...prev,
          p_Cod_grado: selectedCodGrado, // Cod_grado seleccionado
          p_Cod_grados_asignaturas: '', // Resetea asignaturas
          p_Cod_secciones: '', // Resetea secciones
        }));
    
        // Almacena el Cod_grado seleccionado
        setSelectedGrado(selectedCodGrado);
    
        // Filtra las asignaturas relacionadas con el Cod_grado
        const asignaturasFiltradas = grados_asignaturas.filter(
          (grado_asig) => grado_asig.Cod_grado === parseInt(selectedCodGrado, 10)
        );
        setAsignaturasFiltradas(asignaturasFiltradas);
    
        // Llama a la función para filtrar secciones
        fetchSeccionesPorGrado(selectedCodGrado);
      } else {
        console.warn('No se encontró el grado para el Cod_grado seleccionado.');
        setAsignaturasFiltradas([]);
        setSecciones([]);
      }
    };
    
    

    
    
    const handleCreate = async () => {
      console.log("Datos de la nueva sección-asignatura:", nuevaSeccionAsignatura);
  
      try {
          // Validaciones previas
          if (
              !nuevaSeccionAsignatura.p_Cod_grados_asignaturas ||
              !nuevaSeccionAsignatura.p_Cod_secciones ||
              !nuevaSeccionAsignatura.p_Cod_dias ||
              !nuevaSeccionAsignatura.p_Hora_inicio ||
              !nuevaSeccionAsignatura.p_Hora_fin
          ) {
              setMensajeError('Por favor, complete todos los campos.');
              return;
          }
  
          // Si p_Cod_dias es una cadena, conviértela en un arreglo
          if (typeof nuevaSeccionAsignatura.p_Cod_dias === 'string') {
              nuevaSeccionAsignatura.p_Cod_dias = nuevaSeccionAsignatura.p_Cod_dias.split(',').map(dia => dia.trim());
          }
  
          // Asegurarse de que p_Cod_dias es un arreglo
          if (Array.isArray(nuevaSeccionAsignatura.p_Cod_dias)) {
              nuevaSeccionAsignatura.p_Cod_dias = nuevaSeccionAsignatura.p_Cod_dias.join(',');
          } else {
              setMensajeError('Los días deben ser un arreglo.');
              return;
          }
  
          // Resetear mensaje de error
          setMensajeError('');
  
          const response = await fetch('http://localhost:4000/api/secciones_asignaturas/crear_seccion_asig', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify(nuevaSeccionAsignatura),
          });
  
          if (response.ok) {
              swal.fire('¡Éxito!', 'Sección-asignatura creada correctamente.', 'success');
              fetchSeccionesAsigyHora(); // Recargar la lista
              setModalVisible(false); // Cerrar modal
              resetSeccionAsignatura(); // Reiniciar formulario
          } else {
              const errorData = await response.json(); // Captura el cuerpo de la respuesta
              setMensajeError(errorData.mensaje || 'Error al crear la sección-asignatura.'); // Actualiza el mensaje de error
              console.error('Error al crear la sección-asignatura:', response.statusText, errorData);
              swal.fire('Error', errorData.mensaje || 'No se pudo crear la sección.', 'error');
          }
      } catch (error) {
          console.error('Error:', error);
          swal.fire('Error', error.message || 'Error al guardar.', 'error');
      }
  };
  
  const openUpdateModal = async (seccionAsignatura) => {
    console.log("Datos de seccionAsignatura recibidos:", seccionAsignatura);
    try {
      // Setear datos iniciales para el modal
      setSeccionesAsignaturasToUpdate({
        p_Cod_seccion_asignatura: seccionAsignatura.Cod_seccion_asignatura || '',
        p_Cod_grados_asignaturas: seccionAsignatura.Cod_grados_asignaturas || '',
        p_Cod_secciones: seccionAsignatura.Cod_secciones || '',
        p_Cod_dias: seccionAsignatura.Cod_dias || '',
        p_dias: seccionAsignatura.dias || '',
        p_Hora_inicio: seccionAsignatura.Hora_inicio || '',
        p_Hora_fin: seccionAsignatura.Hora_fin || '',
        p_Cod_grado: seccionAsignatura.Nombre_grado || '',  // Predefinir el grado asociado
        p_Nombre_seccion: seccionAsignatura.Nombre_seccion || '', // Predefinir el nombre de la sección// Nombre del grado asociado
      });
  
      // Realizar el fetch para obtener las asignaturas del grado asociado
      const response = await fetch(
        `http://localhost:4000/api/secciones_asignaturas/asignaturasgrados/${seccionSeleccionada}`
      );
      console.log("Cod_secciones enviado:", seccionAsignatura.Cod_secciones);
      const data = await response.json();
     console.log('Datos de dentro', data)
      if (response.ok) {

        setGradosAsignaturas(data); // Actualizar las asignaturas del grado específico
      } else {
        console.error("Error al cargar las asignaturas:", data.mensaje);
        swal.fire("Error", "No se pudieron cargar las asignaturas.", "error");
      }
  
      setModalUpdateVisible(true); // Mostrar el modal de actualización
    } catch (error) {
      console.error("Error al abrir el modal de actualización:", error);
      swal.fire("Error", "Hubo un problema al abrir el modal de actualización.", "error");
    }
  };
  

    // Función para manejar la actualización de una sección asignatura
    const handleUpdateSeccionAsignatura = async () => {
      if (
        !seccionAsignaturaToUpdate.p_Cod_seccion_asignatura ||
        !seccionAsignaturaToUpdate.p_Cod_grados_asignaturas ||
        !seccionAsignaturaToUpdate.p_Cod_secciones ||
        !seccionAsignaturaToUpdate.p_Cod_dias ||
        !seccionAsignaturaToUpdate.p_Hora_inicio ||
        !seccionAsignaturaToUpdate.p_Hora_fin
      ) {
        swal.fire('Error', 'Todos los campos son requeridos.', 'error');
        console.log("Faltan campos en seccionAsignaturaToUpdate:", seccionAsignaturaToUpdate);
        return;
      }

      console.log("Datos a actualizar:", seccionAsignaturaToUpdate);

      try {
        const response = await fetch('http://localhost:4000/api/secciones_asignaturas/actualizar_seccion_asig', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            p_Cod_seccion_asignatura: Number(seccionAsignaturaToUpdate.p_Cod_seccion_asignatura),
            p_Cod_grados_asignaturas: Number(seccionAsignaturaToUpdate.p_Cod_grados_asignaturas),
            p_Cod_secciones: Number(seccionAsignaturaToUpdate.p_Cod_secciones),
            p_Cod_dias: (seccionAsignaturaToUpdate.p_Cod_dias || []).join(','), 
            p_Hora_inicio: seccionAsignaturaToUpdate.p_Hora_inicio,
            p_Hora_fin: seccionAsignaturaToUpdate.p_Hora_fin,
          }),
        });

        if (response.ok) {
          swal.fire('Actualización exitosa', 'La sección asignatura ha sido actualizada correctamente.', 'success');
          setModalUpdateVisible(false);
          fetchSeccionesAsigyHora(); // Función para recargar los datos actualizados
        
        } else {
          const errorData = await response.json();
          swal.fire('Error', errorData.mensaje || 'No se pudo actualizar la sección asignatura.', 'error');
        }
      } catch (error) {
        console.error('Error al actualizar la sección asignatura:', error);
        swal.fire('Error', 'Error de conexión o en el servidor.', 'error');
      }
    };

    // Función para resetear el estado del formulario de actualización
    const resetSeccionAsignaturaToUpdate = () => {
      setSeccionesAsignaturasToUpdate({
        p_Cod_seccion_asignatura: '',
        p_Cod_grados_asignaturas: '',
        p_Cod_secciones: '',
        p_Cod_dias: '',
        p_Hora_inicio: '',
        p_Hora_fin: '',
      });
    };

    // Función para manejar el cierre del modal y restablecer los estados
  const handleCloseModal = () => {
    swal.fire({
      title: '¿Estás seguro?',
      text: 'Tienes cambios sin guardar. ¿Deseas cerrar el modal?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Cerrar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        setModalVisible(false);
        setModalUpdateVisible(false);
        setModalDeleteVisible(false);
      }
    });
  };
 

  // Función para obtener el nombre de la asignatura a partir de su código
const getNombreAsignatura = (cod_asignatura) => {
  if (!grados_asignaturas.length) return 'Asignaturas no disponibles';

  const asignatura = grados_asignaturas.find(
    (item) => item.Cod_asignatura === cod_asignatura
  );
  return asignatura ? asignatura.Nombre_asignatura : 'Asignatura no encontrada';
};
const getNombreSecciones = (cod_seccion) => {
  if (!secciones.length) return 'Secciones no disponibles';

  const seccion = secciones.find(
    (item) => item.Cod_seccion === cod_seccion
  );
  return seccion ? seccion.Nombre_seccion : 'Sección no encontrada';
};

// Función para obtener el nombre del grado a partir de su código
const getNombreGrado = (cod_grado) => {
  if (!grados_asignaturas.length) return 'Grados no disponibles';

  const grado = grados_asignaturas.find(
    (item) => item.Cod_grado === cod_grado
  );
  return grado ? grado.Nombre_grado : 'Grado no encontrado';
};


const generateSeccionesAsignaturasPDF = () => {
  const doc = new jsPDF();

  if (!filteredSeccionesAsignaturas || filteredSeccionesAsignaturas.length === 0) {
    alert('No hay datos para exportar.');
    return;
  }

  const img = new Image();
  img.src = logo;

  // Información del encabezado
  const profesorNombreCompleto = secciones_asignaturas[0]?.Nombre_profesor || 'Profesor no disponible';
  const grado = secciones_asignaturas[0]?.Nombre_grado || 'Grado no disponible';
  const seccion = secciones_asignaturas[0]?.Nombre_seccion || 'Sección no disponible';

  img.onload = () => {
    const pageWidth = doc.internal.pageSize.width;

    // Encabezado
    doc.addImage(img, 'PNG', 10, 10, 45, 45);
    doc.setFontSize(18);
    doc.setTextColor(0, 102, 51);
    doc.text("SAINT PATRICK'S ACADEMY", pageWidth / 2, 24, { align: 'center' });

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('Casa Club del periodista, Colonia del Periodista', pageWidth / 2, 32, { align: 'center' });
    doc.text('Teléfono: (504) 2234-8871', pageWidth / 2, 37, { align: 'center' });
    doc.text('Correo: info@saintpatrickacademy.edu', pageWidth / 2, 42, { align: 'center' });

    // Subtítulo con grado, sección y profesor
    doc.setFontSize(14);
    doc.setTextColor(0, 102, 51);
    doc.text('Listado de Asignaturas y Horarios', pageWidth / 2, 50, { align: 'center' });

    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(`Grado: ${grado}`, pageWidth / 2, 58, { align: 'center' });
    doc.text(`Sección: ${seccion}`, pageWidth / 2, 64, { align: 'center' });
    doc.text(`Profesor: ${profesorNombreCompleto}`, pageWidth / 2, 70, { align: 'center' });

    doc.setLineWidth(0.5);
    doc.setDrawColor(0, 102, 51);
    doc.line(10, 75, pageWidth - 10, 75);

    // Tabla de datos
    const tableColumn = ['#', 'Asignatura', 'Días', 'Hora Inicio', 'Hora Fin'];
    const tableRows = filteredSeccionesAsignaturas.map((item, index) => [
      { content: (index + 1).toString(), styles: { halign: 'center' } },
      item.Nombre_asignatura?.toUpperCase() || 'SIN ASIGNATURA',
      item.Dias_nombres || 'SIN DÍAS',
      { content: item.Hora_inicio || '00:00', styles: { halign: 'center' } },
      { content: item.Hora_fin || '00:00', styles: { halign: 'center' } },
    ]);

    doc.autoTable({
      startY: 80,
      head: [tableColumn],
      body: tableRows,
      headStyles: {
        fillColor: [0, 102, 51],
        textColor: [255, 255, 255],
        fontSize: 10,
        halign: 'center',
      },
      styles: {
        fontSize: 10,
        cellPadding: 3,
      },
      alternateRowStyles: {
        fillColor: [240, 248, 255],
      },
      didDrawPage: (data) => {
        const pageCount = doc.internal.getNumberOfPages();
        const pageCurrent = doc.internal.getCurrentPageInfo().pageNumber;

        // Pie de página
        const footerY = doc.internal.pageSize.height - 10;
        doc.setFontSize(10);
        doc.setTextColor(0, 102, 51);
        doc.text(`Página ${pageCurrent} de ${pageCount}`, pageWidth - 10, footerY, { align: 'right' });

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
        doc.text(`Fecha de generación: ${dateString} Hora: ${timeString}`, 10, footerY);
      },
    });

    // Convertir PDF en Blob
    const pdfBlob = doc.output('blob');
    const pdfURL = URL.createObjectURL(pdfBlob);

    // Crear ventana con visor
    const newWindow = window.open('', '_blank');
    newWindow.document.write(`
      <html>
        <head><title>Reporte de Asignaturas y Horarios</title></head>
        <body style="margin:0;">
          <iframe width="100%" height="100%" src="${pdfURL}" frameborder="0"></iframe>
          <div style="position:fixed;top:10px;right:200px;">
            <button style="background-color: #6c757d; color: white; border: none; padding: 10px 15px; border-radius: 5px; cursor: pointer;" 
              onclick="const a = document.createElement('a'); a.href='${pdfURL}'; a.download='Reporte_Secciones_Asignaturas.pdf'; a.click();">
              Descargar PDF
            </button>
          </div>
        </body>
      </html>`);
  };

  img.onerror = () => {
    alert('No se pudo cargar el logo.');
  };
};


// Función para descargar el PDF con los detalles de una sección asignatura
const handleDescargarPDFSeccionesAsignaturas = async (Cod_seccion_asignatura) => {
  try {
      // Llamada a la API para obtener los detalles de la sección asignatura
      const response = await fetch(`http://localhost:4000/api/secciones_asignaturas/detalle/${Cod_seccion_asignatura}`);
      if (!response.ok) {
          throw new Error(`Error al obtener datos de la sección asignatura: ${response.status}`);
      }

      const data = await response.json();

      // Crear el documento PDF
      const doc = new jsPDF();
      const img = new Image();
      img.src = logo; // Asegúrate de tener el logo disponible y en la misma ruta

      img.onload = () => {
          const pageWidth = doc.internal.pageSize.width;

          // Encabezado del PDF
          doc.addImage(img, "PNG", 10, 10, 45, 45);
          doc.setFontSize(18);
          doc.setTextColor(0, 102, 51);
          doc.text("SAINT PATRICK'S ACADEMY", pageWidth / 2, 24, { align: "center" });

          doc.setFontSize(10);
          doc.setTextColor(100);
          doc.text("Casa Club del periodista, Colonia del Periodista", pageWidth / 2, 32, { align: "center" });
          doc.text("Teléfono: (504) 2234-8871", pageWidth / 2, 37, { align: "center" });
          doc.text("Correo: info@saintpatrickacademy.edu", pageWidth / 2, 42, { align: "center" });

          doc.setFontSize(14);
          doc.setTextColor(0, 102, 51);
          doc.text(`Detalles de la Sección Asignatura #${Cod_seccion_asignatura}`, pageWidth / 2, 50, { align: "center" });

          doc.setLineWidth(0.5);
          doc.setDrawColor(0, 102, 51);
          doc.line(10, 55, pageWidth - 10, 55);

          // Datos de la sección asignatura
          const seccionAsignaturaData = [
            
              { key: "Nombre de la Sección", value: data.Nombre_seccion || "No disponible" },
              { key: "Hora de Inicio", value: data.Hora_inicio || "No disponible" },
              { key: "Hora de Fin", value: data.Hora_fin || "No disponible" },
              { key: "Nombre del Grado", value: data.Nombre_grado || "No disponible" },
              { key: "Nombre de la Asignatura", value: data.Nombre_asignatura || "No disponible" },
              { key: "Días", value: data.Dias_nombres || "No disponible" },
          ];

          // Mostrar detalles en formato de tabla
          const tableColumn = ["Detalle", "Información"];
          const tableRows = seccionAsignaturaData.map((item) => [item.key, item.value]);

          doc.autoTable({
              startY: 70,
              head: [tableColumn],
              body: tableRows,
              headStyles: {
                  fillColor: [0, 102, 51],
                  textColor: [255, 255, 255],
                  fontSize: 10,
                  halign: "center",
              },
              styles: {
                  fontSize: 10,
                  cellPadding: 3,
              },
              alternateRowStyles: {
                  fillColor: [240, 248, 255],
              },
              didDrawPage: (data) => {
                  const pageCount = doc.internal.getNumberOfPages();
                  const pageCurrent = doc.internal.getCurrentPageInfo().pageNumber;

                  // Pie de página
                  const footerY = doc.internal.pageSize.height - 10;
                  doc.setFontSize(10);
                  doc.setTextColor(0, 102, 51);
                  doc.text(
                      `Página ${pageCurrent} de ${pageCount}`,
                      pageWidth - 10,
                      footerY,
                      { align: "right" }
                  );

                  const now = new Date();
                  const dateString = now.toLocaleDateString("es-HN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                  });
                  const timeString = now.toLocaleTimeString("es-HN", {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                  });
                  doc.text(`Fecha de generación: ${dateString} Hora: ${timeString}`, 10, footerY);
              },
          });

          // Convertir PDF en Blob y mostrarlo en una nueva ventana
          const pdfBlob = doc.output("blob");
          const pdfURL = URL.createObjectURL(pdfBlob);

          // Crear ventana con visor de PDF
          const newWindow = window.open("", "_blank");
          newWindow.document.title = `Detalles Sección Asignatura #${Cod_seccion_asignatura}`;
          newWindow.document.write(`
            <html>
              <head>
                <title>Detalles Sección Asignatura #${Cod_seccion_asignatura}</title>
                <style>
                  body {
                    margin: 0;
                    padding: 0;
                    overflow: hidden;
                  }
                  iframe {
                    width: 100%;
                    height: 100%;
                    border: none;
                  }
                  .download-button {
                    position: fixed;
                    top: 10px;
                    right: 10px;
                    background-color: #6c757d;
                    color: white;
                    border: none;
                    padding: 10px 15px;
                    border-radius: 5px;
                    cursor: pointer;
                  }
                </style>
              </head>
              <body>
                <iframe src="${pdfURL}"></iframe>
                <button class="download-button" 
                  onclick="const a = document.createElement('a'); a.href='${pdfURL}'; a.download='Detalles_Seccion_Asignatura_${Cod_seccion_asignatura}.pdf'; a.click();">
                  Descargar PDF
                </button>
              </body>
            </html>
          `);
      };

      img.onerror = () => {
          swal.fire("Error", "No se pudo cargar el logo.", "error");
      };
  } catch (error) {
      console.error("Error al generar el PDF:", error);
      swal.fire("Error", "No se pudo generar el PDF.", "error");
  }
};



    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
        setCurrentPage(1);
      };
      // Función para manejar la paginación
     const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= Math.ceil(secciones_asignaturas.length / recordsPerPage)) {
      setCurrentPage(pageNumber);
    }
  };

  

  const filteredSeccionesAsignaturas = secciones_asignaturas.filter(seccion_asignatura => {
    if (!searchTerm) {
      return true; // Mostrar todos si no hay término de búsqueda
    }
    
    if (searchField === "Nombre_seccion") {
      const seccionName = getNombreSecciones(seccion_asignatura.Cod_Seccion);
      console.log("Comparando con Nombre_seccion:", seccionName);
      return seccionName && seccionName.toLowerCase().includes(searchTerm.toLowerCase());
    } else if (searchField === "Nombre_grado") {
      const gradoName = getNombreGrado(seccion_asignatura.Cod_grado);
      console.log("Comparando con Nombre_grado:", gradoName);
      return gradoName && gradoName.toLowerCase().includes(searchTerm.toLowerCase());
    } else if (searchField === "Nombre_asignatura") {
      const asignaturaName = getNombreAsignatura(seccion_asignatura.Cod_asignatura);
      console.log("Comparando con Nombre_asignatura:", asignaturaName);
      return asignaturaName && asignaturaName.toLowerCase().includes(searchTerm.toLowerCase());
    }

    return false;
  });


      const indexOfLastRecord = currentPage * recordsPerPage;
      const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
      const currentRecords = filteredSeccionesAsignaturas.slice(indexOfFirstRecord, indexOfLastRecord);
      

      return(
         <CContainer>
          <div className="container mt-5"> {/* Contenedor general con margen superior */}
  {/* Título, botón y dropdown */}
  <CRow className="align-items-center mb-4">
    {/* Botón "Gestión Académica" alineado a la izquierda */}
    <CCol xs="4" md="3" className="text-start">
      <CButton
        className="d-flex align-items-center gap-1 rounded shadow"
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#4B4B4B")}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#656565")}
        style={{
          backgroundColor: "#656565",
          color: "#FFFFFF",
          padding: "10px 16px",
          fontSize: "0.9rem",
          transition: "background-color 0.2s ease, box-shadow 0.3s ease",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
          whiteSpace: "nowrap",
        }}
        onClick={volverAListaSecciones}
      >
        <CIcon icon={cilArrowLeft} /> Volver a Secciones
      </CButton>
    </CCol>

    {/* Título centrado */}
    <CCol xs="4" md="6" className="text-center">
      <h1 className="mb-4 fw-bold">Gestión de Asignaturas y Horarios</h1>
    </CCol>

    {/* Botón "Nuevo" y dropdown "Reporte" alineados a la derecha */}
    <CCol
      xs="4"
      md="3"
      className="text-end d-flex flex-column flex-md-row justify-content-md-end align-items-md-center gap-2"
    >
     {/* Botón de Reporte */}
     <CDropdown>
        <CDropdownToggle
          style={{
            backgroundColor: "#6C8E58",
            color: "white",
            padding: "10px 16px",
            fontSize: "0.9rem",
          }}
          className="d-flex align-items-center rounded shadow"
        >
          <CIcon icon={cilDescription} /> Reporte
        </CDropdownToggle>
        <CDropdownMenu>
          <CDropdownItem
            onClick={() => generateSeccionesAsignaturasPDF(filteredSeccionesAsignaturas)}
            style={{
              color: "#6C8E58",
              fontWeight: "bold",
            }}
          >
            Ver Reporte en PDF
          </CDropdownItem>
        </CDropdownMenu>
      </CDropdown>
    </CCol>
  </CRow>

  {/* Contenedor de la barra de búsqueda y el selector de registros */}
  <div className="container mt-5"> {/* Contenedor general con margen superior */}
  {/* Título, botón y dropdown */}
  <CRow className="align-items-center mb-4">
    <CCol xs="12" md="8">
      <CInputGroup>
        <CInputGroupText>
          <CIcon icon={cilSearch} />
        </CInputGroupText>
        <CFormInput
          placeholder="Buscar Asignatura o Sección..."
          style={{ borderRadius: "0 5px 5px 0" }}
        />
        <CFormSelect
          aria-label="Buscar por"
          style={{ marginLeft: "10px" }}
        >
          <option value="Nombre_seccion">Nombre Sección</option>
          <option value="Nombre_grado">Grado</option>
          <option value="Nombre_asignatura">Asignatura</option>
        </CFormSelect>
      </CInputGroup>
    </CCol>

    <CCol xs="12" md="4" className="text-md-end mt-3 mt-md-0">
      <CInputGroup style={{ width: "auto", display: "inline-block" }}>
        <div className="d-inline-flex align-items-center">
          <span>Mostrar&nbsp;</span>
          <CFormSelect
            style={{ width: "80px", display: "inline-block", textAlign: "center" }}
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

{/* Tabla para mostrar las secciones_asignaturas */}
<div className="table-container" style={{ maxHeight: '400px', overflowY: 'scroll', marginBottom: '20px' }}>
        <CTable striped bordered hover>
          <CTableHead style={{ position: 'sticky', top: 0, zIndex: 1, backgroundColor: '#fff' }}>
          <CTableRow>
            <CTableHeaderCell>#</CTableHeaderCell>     
            <CTableHeaderCell>Nombre del grado</CTableHeaderCell>
            <CTableHeaderCell>Nombre de la sección</CTableHeaderCell>
            <CTableHeaderCell>Nombre de la asignatura</CTableHeaderCell>
            <CTableHeaderCell>Días</CTableHeaderCell>
            <CTableHeaderCell>Hora inicial</CTableHeaderCell>
            <CTableHeaderCell>Hora final</CTableHeaderCell>
            <CTableHeaderCell>Acciones</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
    {currentRecords.map((secc_asig, index) => (
        <CTableRow key={secc_asig.Cod_seccion_asignatura}>
            <CTableDataCell>{indexOfFirstRecord + index + 1}</CTableDataCell>
            <CTableDataCell>{gradoSeleccionado || 'Grado no disponible'}</CTableDataCell>
            <CTableDataCell>{secc_asig.Nombre_seccion || 'Sección no disponible'}</CTableDataCell>
            <CTableDataCell>{secc_asig.Nombre_asignatura || 'Asignatura no disponible'}</CTableDataCell>
            <CTableDataCell>
                {Array.isArray(secc_asig.Dias_nombres)
                    ? secc_asig.Dias_nombres.join(', ')
                    : secc_asig.Dias_nombres || 'No especificados'}
            </CTableDataCell>
            <CTableDataCell>{secc_asig.Hora_inicio || 'No especificada'}</CTableDataCell>
            <CTableDataCell>{secc_asig.Hora_fin || 'No especificada'}</CTableDataCell>
            <CTableDataCell>
                <div className="d-flex justify-content-center">
                    <CButton color="warning" onClick={() => openUpdateModal(secc_asig)} className="me-2">
                        <CIcon icon={cilPen} />
                    </CButton>
                    <CButton
                        color="warning"
                        onClick={() => handleDescargarPDFSeccionesAsignaturas(secc_asig.Cod_seccion_asignatura)}
                        className="d-flex align-items-center"
                    >
                        <CIcon icon={cilArrowCircleBottom} className="me-1" /> PDF
                    </CButton>
                </div>
            </CTableDataCell>
        </CTableRow>
        
    ))}
    {currentRecords.length === 0 && (
    <CTableRow>
        <CTableDataCell colSpan="8" className="text-center">
            No hay asignaturas ni horarios asociados a esta sección.
        </CTableDataCell>
    </CTableRow>
)}
</CTableBody>

      </CTable>
      
      </div>
      </div>
      </div>
        {/* Paginación Fija */}
        <div
        className="pagination-container"
        style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
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
            disabled={currentPage === Math.ceil(filteredSeccionesAsignaturas.length / recordsPerPage)} // Desactiva si es la última página
            onClick={() => paginate(currentPage + 1)} // Páginas siguientes
          >
            Siguiente
          </CButton>
        </CPagination>
        <span style={{ marginLeft: '10px' }}>
          Página {currentPage} de {Math.ceil(filteredSeccionesAsignaturas.length / recordsPerPage)}
        </span>
      </div>

            {/* Modal para crear una nueva sección-asignatura */}
        <CModal visible={modalVisible} >
          <CModalHeader closeButton={false}>
            <CModalTitle>Crear Nueva Sección-Asignatura</CModalTitle>
            <CButton className="btn-close" aria-label="Close" onClick={handleCloseModal} />
          </CModalHeader>
          <CModalBody>
          <CInputGroup className="mb-3">
          {/* Selector de Grado */}
          <CInputGroup className="mb-3">
                <CInputGroupText>Grado</CInputGroupText>
                <CFormSelect
            value={nuevaSeccionAsignatura.p_Cod_grado || ''} // Debe coincidir con el Cod_grado
            onChange={(e) => handleGradoChange(e.target.value)} // Enviar directamente Cod_grado
          >
            <option value="">Seleccione un grado</option>
            {grados_asignaturas
              // Eliminar duplicados basados en Cod_grado y Nombre_grado
              .filter((grado, index, self) => 
                index === self.findIndex((g) => g.Cod_grado === grado.Cod_grado)
              )
              .map((grado) => (
                <option key={grado.Cod_grado} value={grado.Cod_grado}>
                  {grado.Nombre_grado}
                </option>
              ))}
          </CFormSelect>


              </CInputGroup>

              {/* Selector de Asignatura */}
              <CInputGroup className="mb-3">
                <CInputGroupText>Asignatura</CInputGroupText>
                <CFormSelect
                  value={nuevaSeccionAsignatura.p_Cod_grados_asignaturas}
                  onChange={(e) =>
                    setNuevaSeccionAsignatura((prev) => ({
                      ...prev,
                      p_Cod_grados_asignaturas: e.target.value,
                    }))
                  }
                  disabled={!asignaturasFiltradas.length} // Habilita si hay asignaturas
                >
                  <option value="">Seleccione una asignatura</option>
                  {asignaturasFiltradas.map((asignatura) => (
                    <option
                      key={asignatura.Cod_grados_asignaturas}
                      value={asignatura.Cod_grados_asignaturas}
                    >
                      {asignatura.Nombre_asignatura}
                    </option>
                  ))}
                </CFormSelect>
              </CInputGroup>

              {/* Selector de Sección */}
              <CInputGroup className="mb-3">
                <CInputGroupText>Sección</CInputGroupText>
                <CFormSelect
                  value={nuevaSeccionAsignatura.p_Cod_secciones}
                  onChange={(e) =>
                    setNuevaSeccionAsignatura((prev) => ({
                      ...prev,
                      p_Cod_secciones: e.target.value,
                    }))
                  }
                  disabled={!secciones.length} // Habilita si hay secciones
                >
                  <option value="">Seleccione una sección</option>
                  {secciones.map((seccion) => (
                    <option key={seccion.Cod_secciones} value={seccion.Cod_secciones}>
                      {seccion.Nombre_seccion}
                    </option>
                  ))}
                </CFormSelect>
              </CInputGroup>


                </CInputGroup>

          {/* Código de los días como checkboxes */}
          <CInputGroup className="mb-3">
              <CInputGroupText>Días</CInputGroupText>
              <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'space-between', marginLeft: '35px' }}>
                {dias.map((dia) => (
                  <CFormCheck
                    key={dia.Cod_dias}
                    label={dia.dias.toUpperCase()} // Mostrando el nombre del día en mayúsculas
                    value={dia.Cod_dias}
                    checked={(nuevaSeccionAsignatura.p_Cod_dias || []).includes(dia.Cod_dias)}
                    onChange={(e) => {
                      const selectedDias = nuevaSeccionAsignatura.p_Cod_dias || [];
                      const newDias = e.target.checked
                        ? [...selectedDias, dia.Cod_dias] // Agregar día seleccionado
                        : selectedDias.filter((codDia) => codDia !== dia.Cod_dias); // Eliminar día deseleccionado
                      setNuevaSeccionAsignatura({
                        ...nuevaSeccionAsignatura,
                        p_Cod_dias: newDias,
                      });
                    }}
                  />
                ))}
              </div>
            </CInputGroup>
            <CInputGroup className="mb-3">
            <CFormInput
              label="Hora de Inicio"
              type="time"
              value={nuevaSeccionAsignatura.p_Hora_inicio}
              onChange={(e) =>
                setNuevaSeccionAsignatura((prev) => ({
                  ...prev,
                  p_Hora_inicio: e.target.value,
                }))
              }
            />
            </CInputGroup>
            <CInputGroup className="mb-3">
            <CFormInput
              label="Hora de Fin"
              type="time"
              value={nuevaSeccionAsignatura.p_Hora_fin}
              onChange={(e) =>
                setNuevaSeccionAsignatura((prev) => ({
                  ...prev,
                  p_Hora_fin: e.target.value,
                }))
              }
            />
            </CInputGroup>
            {mensajeError && <p className="text-danger">{mensajeError}</p>}
          </CModalBody>
          <CModalFooter>
          <CButton color="secondary" onClick={handleCloseModal}>
            Cerrar
          </CButton>
            <CButton color="primary" onClick={handleCreate}>
              <CIcon icon={cilSave} /> Guardar
            </CButton>
          </CModalFooter>
        </CModal>


              <CModal visible={modalUpdateVisible} backdrop="static" >
        <CModalHeader closeButton={false}>
          <CModalTitle>Actualizar Sección Asignatura</CModalTitle>
          <CButton className="btn-close" aria-label="Close" onClick={() => {
        handleCloseModal();
      }} />
        </CModalHeader>
        <CModalBody>
          {/* Código de la sección asignatura */}
          <CInputGroup className="mb-3">
            <CInputGroupText>Código</CInputGroupText>
            <CFormInput
              value={seccionAsignaturaToUpdate.p_Cod_seccion_asignatura || ''}
              disabled // Campo solo lectura
            />
          </CInputGroup>
              {/* Grado (readonly) */}
              <CInputGroup className="mb-3">
                 <CInputGroupText>Grado</CInputGroupText>
                 <CFormInput value={seccionAsignaturaToUpdate.p_Cod_grado || ''} disabled />
                 </CInputGroup>
                <CInputGroup className="mb-3">
              <CInputGroupText>Nombre Sección</CInputGroupText>
              <CFormInput
                value={seccionAsignaturaToUpdate.p_Nombre_seccion || ''}
                disabled // Predefinido y no editable
              />
            </CInputGroup>

                  {/* Select de Asignaturas */}
                  <CInputGroup className="mb-3">
                    <CInputGroupText>Asignatura</CInputGroupText>
                    <CFormSelect
                      value={seccionAsignaturaToUpdate.p_Cod_grados_asignaturas || ''}
                      onChange={(e) =>
                        setSeccionesAsignaturasToUpdate({
                          ...seccionAsignaturaToUpdate,
                          p_Cod_grados_asignaturas: e.target.value,
                        })
                      }
                    >
                      <option value="">Seleccione una asignatura</option>
                      {grados_asignaturas.map((asignatura) => (
                        <option key={asignatura.Cod_grados_asignaturas} value={asignatura.Cod_grados_asignaturas}>
                          {asignatura.Nombre_asignatura}
                        </option>
                      ))}
                    </CFormSelect>
                  </CInputGroup>
          {/* Código de los días */}
          <CInputGroup className="mb-3">
            <CInputGroupText>Días</CInputGroupText>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                marginLeft: "35px",
              }}
            >
              {dias.map((dia) => (
                <CFormCheck
                  key={dia.Cod_dias}
                  label={dia.dias.toUpperCase()} // Muestra el nombre del día en mayúsculas
                  value={dia.Cod_dias}
                  checked={
                    Array.isArray(seccionAsignaturaToUpdate.p_Cod_dias)
                      ? seccionAsignaturaToUpdate.p_Cod_dias.includes(dia.Cod_dias)
                      : seccionAsignaturaToUpdate.p_Cod_dias
                        ?.split(",") // Si p_Cod_dias es un string, lo convierte en un array
                        .includes(dia.Cod_dias)
                  }
                  onChange={(e) => {
                    const selectedDias = Array.isArray(seccionAsignaturaToUpdate.p_Cod_dias)
                      ? [...seccionAsignaturaToUpdate.p_Cod_dias]
                      : seccionAsignaturaToUpdate.p_Cod_dias
                        ? seccionAsignaturaToUpdate.p_Cod_dias.split(",")
                        : [];

                    const newDias = e.target.checked
                      ? [...selectedDias, dia.Cod_dias] // Agrega el día seleccionado
                      : selectedDias.filter((codDia) => codDia !== dia.Cod_dias); // Elimina el día deseleccionado

                    setSeccionesAsignaturasToUpdate({
                      ...seccionAsignaturaToUpdate,
                      p_Cod_dias: newDias,
                    });
                  }}
                />
              ))}
            </div>
          </CInputGroup>


          {/* Hora de inicio */}
          <CInputGroup className="mb-3">
            <CInputGroupText>Hora de Inicio</CInputGroupText>
            <CFormInput
              type="time"
              value={seccionAsignaturaToUpdate.p_Hora_inicio || ''}
              onChange={(e) =>
                setSeccionesAsignaturasToUpdate({
                  ...seccionAsignaturaToUpdate,
                  p_Hora_inicio: e.target.value,
                })
              }
            />
          </CInputGroup>

          {/* Hora de fin */}
          <CInputGroup className="mb-3">
            <CInputGroupText>Hora de Fin</CInputGroupText>
            <CFormInput
              type="time"
              value={seccionAsignaturaToUpdate.p_Hora_fin || ''}
              onChange={(e) =>
                setSeccionesAsignaturasToUpdate({
                  ...seccionAsignaturaToUpdate,
                  p_Hora_fin: e.target.value,
                })
              }
            />
          </CInputGroup>
        </CModalBody>
        <CModalFooter>
        <CButton color="secondary" onClick={handleCloseModal}>
            Cancelar
          </CButton>
          <CButton color="primary" onClick={handleUpdateSeccionAsignatura}>
            Guardar Cambios
          </CButton>
        </CModalFooter>
      </CModal>




      </CContainer>
      );
}
export default ListaSecciones_Asignaturas;