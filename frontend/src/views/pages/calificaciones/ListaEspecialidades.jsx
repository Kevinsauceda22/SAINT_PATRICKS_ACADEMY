import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { CIcon } from '@coreui/icons-react';
import { cilSearch, cilBrushAlt, cilPen, cilTrash, cilPlus, cilSave,cilDescription,cilFile,cilSpreadsheet } from '@coreui/icons'; // Importar iconos específicos
import swal from 'sweetalert2';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import 'jspdf-autotable'; // Importa el plugin para tablas
import logo from 'src/assets/brand/logo_saint_patrick.png'
import {
  CButton,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
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
  CPagination,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CRow,
  CCol,
  CFormSelect,
} from '@coreui/react';
import usePermission from '../../../../context/usePermission';
import AccessDenied from "../AccessDenied/AccessDenied"


const ListaEspecialidades = () => {

  const { canSelect, loading, error, canDelete, canInsert, canUpdate } = usePermission('ListaEspecialidades');
  const [especialidades, setEspecialidades] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalUpdateVisible, setModalUpdateVisible] = useState(false);
  const [modalDeleteVisible, setModalDeleteVisible] = useState(false);
  const [nuevaEspecialidad, setNuevaEspecialidad] = useState({
    Cod_Especialidad: '',
    Nombre_especialidad: ''
  });
  const [especialidadToUpdate, setEspecialidadToUpdate] = useState({});
  const [especialidadToDelete, setEspecialidadToDelete] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1); // Estado para la página actual
  const [recordsPerPage, setRecordsPerPage] = useState(5); // Hacer dinamico el número de registro de paginas
  const inputRef = useRef(null); // referencia para el input
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false); // Estado para detectar cambios sin guardar

  useEffect(() => {
    fetchEspecialidades();
  }, []);


  const fetchEspecialidades = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/especialidades/verespecialidades');
      const data = await response.json();
      const dataWithIndex = data.map((especialidades, index) => ({
        ...especialidades,
        originalIndex: index + 1
      }));
      setEspecialidades(dataWithIndex);
    } catch (error) {
      console.error('Error al obtener las especialidades:', error);
    }
  };


  
// Función para manejar cambios en el input
const handleInputChange = (e, setFunction) => {
  const input = e.target;
  const cursorPosition = input.selectionStart; // Guarda la posición actual del cursor
  let value = input.value
    .toUpperCase() // Convertir a mayúsculas
    .trimStart(); // Evitar espacios al inicio

  const regex =/^[A-Z-Ñ\s]*$/; // Solo letras, espacios y la Ñ

  // Verificar si hay múltiples espacios consecutivos antes de reemplazarlos
  if (/\s{2,}/.test(value)) {
    swal.fire({
      icon: 'warning',
      title: 'Espacios múltiples',
      text: 'No se permite más de un espacio entre palabras.',
    });
    value = value.replace(/\s+/g, ' '); // Reemplazar múltiples espacios por uno solo
  }

  // Validar solo letras y espacios
  if (!regex.test(value)) {
    swal.fire({
      icon: 'warning',
      title: 'Caracteres no permitidos',
      text: 'Solo se permiten letras y espacios.',
    });
    return;
  }

  // Validación: no permitir letras repetidas más de 4 veces seguidas
  const words = value.split(' ');
  for (let word of words) {
    const letterCounts = {};
    for (let letter of word) {
      letterCounts[letter] = (letterCounts[letter] || 0) + 1;
      if (letterCounts[letter] > 4) {
        swal.fire({
          icon: 'warning',
          title: 'Repetición de letras',
          text: `La letra "${letter}" se repite más de 4 veces en la palabra "${word}".`,
        });
        return;
      }
    }
  }

  // Asigna el valor en el input manualmente para evitar el salto de transición
  input.value = value;

  // Establecer el valor con la función correspondiente
  setFunction(value);
  setHasUnsavedChanges(true); // Asegúrate de marcar que hay cambios sin guardar

  // Restaurar la posición del cursor
  requestAnimationFrame(() => {
    if (inputRef.current) {
      inputRef.current.setSelectionRange(cursorPosition, cursorPosition);
    }
  });
};

// Deshabilitar copiar y pegar
const disableCopyPaste =(e) => {
  e.preventDefault();
  swal.fire({
    icon: 'warning',
    title: 'Accion bloquear',
    text:'Copiar y pegar no esta permitido'
  });
};



// Función para cerrar el modal con advertencia si hay cambios sin guardar
const handleCloseModal = (closeFunction, resetFields) => {
  if (hasUnsavedChanges) {
    swal.fire({
      title: '¿Estás seguro?',
      text: 'Si cierras este formulario, perderás todos los datos ingresados.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, cerrar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        closeFunction(false);
        setNuevaEspecialidad({ Cod_Especialidad: '', Nombre_especialidad: '' }); // Limpiar campos
        setHasUnsavedChanges(false); // Resetear cambios no guardados
      }
    });
  } else {
    closeFunction(false);
    setNuevaEspecialidad({ Cod_Especialidad: '', Nombre_especialidad: '' }); // Limpiar campos
    setHasUnsavedChanges(false); // Asegurarse de resetear aquí también
  }
};
const resetNuevoEspecialidad = () => setNuevaEspecialidad('');
const resetEspecialidadUpdate = () => setEspecialidadToUpdate('');


const valdiarEspecialidad = () => {
  const nombreEspecialidad = typeof nuevaEspecialidad === 'string' ? nuevaEspecialidad : nuevaEspecialidad.Nombre_especialidad;

  // Comprobacion de vacio 
  if(!nombreEspecialidad || nombreEspecialidad.trim() === '' ){
    swal.fire ('Error', 'El nombre de la Especialidad no puede estar bacia ')
  }
  return false
}

// Especialidad existente 



  const handleCreateEspecialidad = async () => {
    // Validación para campos vacíos
    if (!nuevaEspecialidad.Nombre_especialidad.trim()) {
      swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'El campo "Nombre especialidad" no puede estar vacío',
      });
      return;
    }
  
    const existe = especialidades.some(
      (esp) => esp.Nombre_especialidad.trim().toLowerCase() === nuevaEspecialidad.Nombre_especialidad.trim().toLowerCase()
    );
  
    if (existe) {
      swal.fire({
        icon: 'error',
        title: 'Error',
        text: `La especialidad "${nuevaEspecialidad.Nombre_especialidad}" ya existe`,
      });
      return;
    }
  
    try {
      const response = await fetch('http://localhost:4000/api/especialidades/crearespecialidad', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(nuevaEspecialidad),
      });
  
      if (response.ok) {
        fetchEspecialidades();
        setModalVisible(false);
        resetNuevoEspecialidad();
        setHasUnsavedChanges(false);// Reiniciar el estado de cambios no guardados
        swal.fire({
          icon: 'success',
          title: '¡Éxito!',
          text: 'La especialidad se ha creado correctamente',
        });
      } else {
        console.error('Hubo un problema al crear la especialidad:', response.statusText);
      }
    } catch (error) {
      console.error('Hubo un problema al crear la especialidad:', error);
    }
  };
  
  const handleUpdateEspecialidad = async () => {
    // Validación para campos vacíos
    if (!especialidadToUpdate.Nombre_especialidad.trim()) {
      swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'El campo "Nombre especialidad" no puede estar vacío.',
      });
      return;
    }
  
    const existe = especialidades.some(
      (esp) =>
        esp.Nombre_especialidad.trim().toLowerCase() === especialidadToUpdate.Nombre_especialidad.trim().toLowerCase() &&
        esp.Cod_Especialidad !== especialidadToUpdate.Cod_Especialidad
    );
  
    if (existe) {
      swal.fire({
        icon: 'error',
        title: 'Error',
        text: `La especialidad "${especialidadToUpdate.Nombre_especialidad}" ya existe`,
      });
      return;
    }

    try {
      const response = await fetch('http://localhost:4000/api/especialidades/actualizarespecialidad', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(especialidadToUpdate),
      });
  
      if (response.ok) {
        fetchEspecialidades();
        setModalUpdateVisible(false);
        resetEspecialidadUpdate();
        setHasUnsavedChanges(false); // Reiniciar el estado de cambios no guardados
        setEspecialidadToUpdate({});
        swal.fire({
          icon: 'success',
          title: '¡Éxito!',
          text: 'La especialidad se ha actualizado correctamente',
        });
      } else {
        console.error('Hubo un problema al actualizar la especialidad:', response.statusText);
      }
    } catch (error) {
      console.error('Hubo un problema al actualizar la especialidad:', error);
    }
  };

  const handleDeleteEspecialidad = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/especialidades/eliminarespecialidad', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ Cod_Especialidad: especialidadToDelete.Cod_Especialidad }),
      });

      if (response.ok) {
        fetchEspecialidades();
        setModalDeleteVisible(false);
        setEspecialidadToDelete({});
        swal.fire({
          icon: 'success',
          title: '¡Éxito!',
          text: 'La especialidad se ha eliminado correctamente',
        });
      } else {
        console.error('Hubo un problema al eliminar la especialidad:', response.statusText);
      }
    } catch (error) {
      console.error('Hubo un problema al eliminar la especialidad:', error);
    }
  };

 // Filtro de búsqueda
  const filteredEspecialidades = especialidades.filter((especialidades) =>
    especialidades.Nombre_especialidad.toLowerCase().includes(searchTerm.toLowerCase())
  );
  // Lógica de paginación
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredEspecialidades.slice(indexOfFirstRecord, indexOfLastRecord);

  // Cambiar página
  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= Math.ceil(filteredEspecialidades.length / recordsPerPage)) {
      setCurrentPage(pageNumber);
    }
  };


 
// Cambia el estado de la página actual después de aplicar el filtro
  // Validar el buscador
  const handleSearch = (event) => {
    const input = event.target.value.toUpperCase();
    const regex = /^[A-ZÑ\s]*$/; // Solo permite letras, espacios y la letra "Ñ"
    
    if (!regex.test(input)) {
      swal.fire({
        icon: 'warning',
        title: 'Caracteres no permitidos',
        text: 'Solo se permiten letras y espacios.',
      });
      return;
    }
    setSearchTerm(input);
    setCurrentPage(1); // Resetear a la primera página al buscar
  };

    // Verificar permisos
    if (!canSelect) {
      return <AccessDenied />;
    }
  //----------------------------------------------------------REPORTES PDF Y EXCEL----------------------------//
  const generarReporteEspecialidadesPDF = () => {
    // Validar que haya datos en la tabla
    if (!currentRecords || currentRecords.length === 0) {
      swal.fire({
        icon: 'info',
        title: 'Tabla vacía',
        text: 'No hay datos disponibles para generar el reporte.',
        confirmButtonText: 'Entendido',
      });
      return; // Salir de la función si no hay datos
    }
  
    const doc = new jsPDF();
    const img = new Image();
    img.src = logo; // Reemplaza con la URL o ruta de tu logo.
  
    img.onload = () => {
      // Agregar logo
      doc.addImage(img, 'PNG', 10, 10, 30, 30);
  
      let yPosition = 20; // Posición inicial en el eje Y
  
      // Título principal
      doc.setFontSize(18);
      doc.setTextColor(0, 102, 51); // Verde
      doc.text("SAINT PATRICK'S ACADEMY", doc.internal.pageSize.width / 2, yPosition, { align: 'center' });
  
      yPosition += 12; // Espaciado más amplio para resaltar el título
  
      // Subtítulo
      doc.setFontSize(16);
      doc.text('Reporte de Especialidades', doc.internal.pageSize.width / 2, yPosition, { align: 'center' });
  
      yPosition += 10; // Espaciado entre subtítulo y detalles
  
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
  
      // Configuración para la tabla
      const pageHeight = doc.internal.pageSize.height; // Altura de la página
      let pageNumber = 1; // Página inicial
  
      // Agregar tabla con auto-paginación
      doc.autoTable({
        startY: yPosition + 4,
        head: [['#', 'Nombre de la Especialidad']],
        body: currentRecords.map((especialidad, index) => [
          especialidad.originalIndex, // Usar el índice original en lugar del índice basado en la paginación
          `${especialidad.Nombre_especialidad || ''}`.trim(),
        ]),
        headStyles: {
          fillColor: [0, 102, 51],
          textColor: [255, 255, 255],
          fontSize: 10,
        },
        styles: {
          fontSize: 10,
          cellPadding: 3,
          halign: 'center', // Centrado del texto en las celdas
        },
        columnStyles: {
          0: { cellWidth: 'auto' }, // Columna '#' se ajusta automáticamente
          1: { cellWidth: 'auto' }, // Columna 'Descripción' se ajusta automáticamente
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
 //-----EXCEL---
 const generarReporteExcel = () => {
  // Validar que haya datos en la tabla
  if (!currentRecords || currentRecords.length === 0) {
    swal.fire({
      icon: 'info',
      title: 'Tabla vacía',
      text: 'No hay datos disponibles para generar el reporte Excel.',
      confirmButtonText: 'Entendido',
    });
    return; // Salir de la función si no hay datos
  }

  // Encabezados del reporte
  const encabezados = [
    ["Saint Patrick Academy"],
    ["Reporte de Especialidades"],
    [], // Espacio en blanco
    ["#", "Nombre Especialidad"]
  ];

  // Crear filas con las especialidades
  const filas = currentRecords.map((especialidad, index) => [
    index + 1, // Índice basado en la posición original
    especialidad.Nombre_especialidad || "" // Nombre de la especialidad
  ]);

  // Combinar encabezados y filas
  const datos = [...encabezados, ...filas];

  // Crear la hoja de trabajo
  const hojaDeTrabajo = XLSX.utils.aoa_to_sheet(datos);

  // Estilos personalizados para los encabezados
  const rangoEncabezado = XLSX.utils.decode_range(hojaDeTrabajo['!ref']);
  for (let row = 0; row <= 3; row++) { // Aplicamos estilo a las primeras 3 filas (encabezado)
    for (let col = rangoEncabezado.s.c; col <= rangoEncabezado.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
      if (hojaDeTrabajo[cellAddress]) {
        hojaDeTrabajo[cellAddress].s = {
          font: { bold: true, sz: 14, color: { rgb: "FFFFFF" } },
          fill: { fgColor: { rgb: "15401D" } }, // Color verde oscuro
          alignment: { horizontal: "center" }
        };
      }
    }
  }

  // Ajustar el ancho de las columnas automáticamente
  const ajusteColumnas = [
    { wpx: 50 },  // Ajustar el ancho de la columna del índice
    { wpx: 200 }  // Ajustar el ancho de la columna del nombre de especialidad
  ];

  hojaDeTrabajo['!cols'] = ajusteColumnas;

  // Crear el libro de trabajo
  const libroDeTrabajo = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(libroDeTrabajo, hojaDeTrabajo, "Reporte de Especialidades");

  // Nombre del archivo Excel
  const nombreArchivo = `Reporte_Especialidades.xlsx`;

  // Guardar el archivo Excel
  XLSX.writeFile(libroDeTrabajo, nombreArchivo);
};
 


  return (
    <CContainer>
 {/*Contenedor del hi y boton "nuevo" */}
      <CRow className='align-items-center mb-5'>
        <CCol xs="8" md="9">
          {/* Titulo de la pagina */}
      <h1 className="mb-0">Mantenimiento Especialidades</h1>
      </CCol>
      <CCol xs="4" md="3" className="text-end d-flex flex-column flex-md-row justify-content-md-end align-items-md-center">
      {/* Botón "Nuevo" alineado a la derecha */}
{canInsert && (
      <CButton
        style={{ backgroundColor: '#4B6251', color: 'white' }} // Ajusta la altura para alinearlo con la barra de búsqueda
        className="mb-3 mb-md-0 me-md-3" // Margen inferior en pantallas pequeñas, margen derecho en pantallas grandes
        onClick={() => { setModalVisible(true);
          setHasUnsavedChanges(false); // Resetear el estado al abrir el modal 

        }}
      >
        <CIcon icon={cilPlus} /> {/* Ícono de "más" */}
        Nuevo
      </CButton>
)}
{/*Boton reporte */}
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
            onClick={() => generarReporteEspecialidadesPDF()}
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
          <CDropdownItem
        onClick={generarReporteExcel}
          style={{
            cursor: "pointer",
            outline: "none",
            backgroundColor: "transparent",
            padding: "0.5rem 1rem",
            fontSize: "0.85rem",
            color: "#333",
            transition: "background-color 0.3s",
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = "#f5f5f5"}
          onMouseOut={(e) => e.target.style.backgroundColor = "transparent"}
        >
          <CIcon icon={cilSpreadsheet} size="sm" /> Descargar Excel
        </CDropdownItem>
      </CDropdownMenu>
    </CDropdown>
  </CCol>
</CRow>





 {/* Contenedor de la barra de búsqueda y el botón "Nuevo" */}
 <CRow className='align-items-center mt-4 mb-2'>
      {/* Barra de búsqueda */}
      <CCol xs="12" md="8" className='d-flex flex-wrap align-items-center'>
      <CInputGroup className="me-3" style={{ width: '400px' }}>
        <CInputGroupText>
          <CIcon icon={cilSearch} />
          </CInputGroupText>
        <CFormInput placeholder="Buscar especialidad..." 
        onChange={handleSearch} 
        value={searchTerm} />

        {/* Botón para limpiar la búsqueda */}
        <CButton
            style={{border: '1px solid #ccc',
              transition: 'all 0.1s ease-in-out', // Duración de la transición
              backgroundColor: '#F3F4F7', // Color por defecto
              color: '#343a40' // Color de texto por defecto
            }}
            onClick={() => {
              setSearchTerm('');
              setCurrentPage(1);
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

    {/*Selector dinamico a la par de la barra de busqueda */}
    <CCol xs="12" md="4" className='text-md-end mt-2 mt-md-0'>
      <CInputGroup className='mt-2 mt-md-0' style={{width:'auto', display:'inline-block'}}>
        <div className='d-inline-flex align-items-center'>
          <span>Mostrar&nbsp;</span>
          <CFormSelect
            style={{width: '80px', display: 'inline-block', textAlign:'center'}}
            onChange={(e) => {
              const value = Number(e.target.value);
              setRecordsPerPage(value);
              setCurrentPage(1); // reinciar a la primera pagina cuando se cambia el numero de registros
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
    


{/* Tabla para mostrar Especialidad */}

    <div className="table-container" style={{ maxHeight: '400px', overflowY: 'scroll', marginBottom: '20px' }}>
      <CTable striped bordered hover>
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell>#</CTableHeaderCell>
            <CTableHeaderCell>Nombre Especialidad</CTableHeaderCell>
            <CTableHeaderCell>Acciones</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {currentRecords.map((especialidades, index) => (
            <CTableRow key={especialidades.Cod_Especialidad}>
              <CTableDataCell>
                  {/* Mostrar el índice original en lugar del índice basado en la paginación */}
                  {especialidades.originalIndex} 
                </CTableDataCell>
              <CTableDataCell>{especialidades.Nombre_especialidad}</CTableDataCell>
              <CTableDataCell>

                {canUpdate && (
                <CButton
                  style={{ backgroundColor: '#F9B64E',marginRight: '10px' }}
                  onClick={() => {
                    setEspecialidadToUpdate(especialidades);
                    setModalUpdateVisible(true);
                    setHasUnsavedChanges(false); // Resetear el estado al abrir el modal
                  }}
                >
                  <CIcon icon={cilPen} />
                </CButton>
                )}

                {canDelete  && (
                <CButton
                  style={{ backgroundColor: '#E57368', marginRight: '10px' }}
                  onClick={() => {
                    setEspecialidadToDelete(especialidades);
                    setModalDeleteVisible(true);
                  }}
                >
                  <CIcon icon={cilTrash} />
                </CButton>
                )}
              </CTableDataCell>
            </CTableRow>
          ))}
        </CTableBody>
      </CTable>
    </div>  

    {/* Paginación Fija */}
<div className="pagination-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <CPagination aria-label="Page navigation">
        <CButton
          style={{ backgroundColor: '#6f8173', color: '#D9EAD3' }}
          disabled={currentPage === 1} // Deshabilitar si estás en la primera página
          onClick={() => paginate(currentPage - 1)}>
          Anterior
        </CButton>
        <CButton
          style={{ marginLeft: '10px',backgroundColor: '#6f8173', color: '#D9EAD3' }}
          disabled={currentPage === Math.ceil(filteredEspecialidades.length / recordsPerPage)} // Deshabilitar si estás en la última página
          onClick={() => paginate(currentPage + 1)}>
          Siguiente
       </CButton>
     </CPagination>
      {/* Mostrar total de páginas */}
      <span style={{ marginLeft: '10px' }}>
        Página {currentPage} de {Math.ceil(filteredEspecialidades.length / recordsPerPage)}
      </span>
   </div>


      {/* Modal Crear */}
      <CModal visible={modalVisible} backdrop="static">
        <CModalHeader closeButton={false}>
          <CModalTitle>Nueva Especialidad</CModalTitle>
          <CButton className="btn-close" aria-label="Close" onClick={() => handleCloseModal(setModalVisible, resetNuevoEspecialidad)} />
        </CModalHeader>
        <CModalBody>
        <CForm>
          <CInputGroup className="mb-3">
            <CInputGroupText>Nombre especialidad</CInputGroupText>
            <CFormInput
            ref={inputRef} // Asignar la referencia al input
              type="text"
              placeholder="Ingrese el tipo de especialidad"
              value={nuevaEspecialidad.Nombre_especialidad}
              maxLength={50} // Limitar a 50 caracteres 
              onPaste={disableCopyPaste}
              onCopy={disableCopyPaste}
              onChange={(e) => handleInputChange(e, (value) => setNuevaEspecialidad({ ...nuevaEspecialidad, Nombre_especialidad: value }))}
            />
          </CInputGroup>
          </CForm>
        </CModalBody>
        <CModalFooter>
        <CButton color="secondary" onClick={() => handleCloseModal(setModalVisible, resetNuevoEspecialidad)}>
          Cancelar
        </CButton>
          <CButton style={{ backgroundColor: '#4B6251',color: 'white' }} onClick={handleCreateEspecialidad}>
          <CIcon icon={cilSave} style={{ marginRight: '5px' }} />Guardar
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Modal Actualizar */}
      <CModal visible={modalUpdateVisible} backdrop="static">
        <CModalHeader closeButton={false}>
          <CModalTitle>Actualizar Especialidad</CModalTitle>
          <CButton className="btn-close" aria-label="Close" onClick={() => handleCloseModal(setModalUpdateVisible, resetEspecialidadUpdate)} />
        </CModalHeader>
        <CModalBody>
        <CForm>
          <CInputGroup className="mb-3">
            <CInputGroupText>Nombre especialidad</CInputGroupText>
            <CFormInput
             ref={inputRef} // Asignar la referencia al input
              value={especialidadToUpdate.Nombre_especialidad || ''}
              maxLength={50} // limitar a 50 caracteres 
              onPaste={disableCopyPaste}
              onCopy={disableCopyPaste}
              onChange={(e) => handleInputChange(e, (value)=> setEspecialidadToUpdate({ ...especialidadToUpdate, Nombre_especialidad: value }))}
            />
          </CInputGroup>
          </CForm>
        </CModalBody>
        <CModalFooter>
        <CButton color="secondary" onClick={() => handleCloseModal(setModalUpdateVisible, resetEspecialidadUpdate)}>
          Cancelar
        </CButton>
          <CButton style={{  backgroundColor: '#F9B64E',color: 'white' }} onClick={handleUpdateEspecialidad}>
          <CIcon icon={cilPen} style={{ marginRight: '5px' }} />Actualizar
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Modal Eliminar */}
      <CModal visible={modalDeleteVisible} onClose={() => setModalDeleteVisible(false)} backdrop="static">
        <CModalHeader>
          <CModalTitle>Eliminar Especialidad</CModalTitle>
        </CModalHeader>
        <CModalBody>
          ¿Está seguro de que desea eliminar la especialidad: <strong>{especialidadToDelete.Nombre_especialidad}</strong>?
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setModalDeleteVisible(false)}>
            Cancelar
          </CButton>
          <CButton style={{  backgroundColor: '#E57368',color: 'white' }} onClick={handleDeleteEspecialidad}>
          <CIcon icon={cilTrash} style={{ marginRight: '5px' }} /> Eliminar 
          </CButton>
        </CModalFooter>
      </CModal>
    </CContainer>
  );
};

export default ListaEspecialidades;



