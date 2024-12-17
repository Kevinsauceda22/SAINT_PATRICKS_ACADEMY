import React, { useEffect, useState } from 'react';
import { CIcon } from '@coreui/icons-react';
import { cilSearch,cilBrushAlt, cilPen, cilTrash, cilPlus, cilSave, cilDescription, cilArrowLeft } from '@coreui/icons';
import swal from 'sweetalert2'; // Importar SweetAlert para mostrar mensajes de advertencia y éxito
import { jsPDF } from 'jspdf';       // Para generar archivos PDF
import 'jspdf-autotable';            // Para crear tablas en los archivos PDF
import * as XLSX from 'xlsx';        // Para generar archivos Excel
import { saveAs } from 'file-saver'; // Para descargar archivos en el navegador
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom'
import {
  CButton,
  CCol,
  CContainer,
  CDropdown,//Para reportes
  CDropdownMenu,
  CDropdownToggle,
  CDropdownItem,//Para reportes
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
  CPagination,
  CRow,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
} from '@coreui/react';
import usePermission from '../../../../context/usePermission';
import AccessDenied from "../AccessDenied/AccessDenied"



const ListaHistoricoProc = () => {

  const { canSelect, canDelete, canInsert, canUpdate } = usePermission('ListaHistoricoProc');

   // Estados de la aplicación
  const [historicoProcedencia, setHistoricoProcedencia] = useState([]); // Estado que almacena la lista de histórico de procedencia
  const [errors, setErrors] = useState({ cod_persona: '', instituto: '', lugar_procedencia: '', anio_ingreso: ''  }); // Estado para gestionar los errores de validación
  const [modalVisible, setModalVisible] = useState(false); // Controla la visibilidad del modal de creación
  const [modalUpdateVisible, setModalUpdateVisible] = useState(false); // Controla la visibilidad del modal de actualización
  const [modalDeleteVisible, setModalDeleteVisible] = useState(false); // Controla la visibilidad del modal de eliminación
  const [nuevoHistorico, setNuevoHistorico] = useState({ cod_persona: '', instituto: '', lugar_procedencia: '', anio_ingreso: '' }); // Estado del nuevo registro
  const [historicoToUpdate, setHistoricoToUpdate] = useState({}); // Estado para el registro que se va a actualizar
  const [historicoToDelete, setHistoricoToDelete] = useState({}); // Estado para el registro que se va a eliminar
  const [searchTerm, setSearchTerm] = useState(''); // Estado del término de búsqueda
  const [currentPage, setCurrentPage] = useState(1); // Estado de la página actual para la paginación
  const [recordsPerPage, setRecordsPerPage] = useState(5); // Controla cuántos registros se muestran por página
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false); // Controla si hay cambios sin guardar

  
  {/*********************************************************UBICACION DE PERSONAS*********************************************************/}
  const location = useLocation();
  const navigate = useNavigate();

  // Recupera personaSeleccionada del estado o maneja el caso en que no esté disponible
  const { personaSeleccionada } = location.state || {};

  // Manejo de error si personaSeleccionada no está definida
  if (!personaSeleccionada) {
    console.warn('No se ha proporcionado una persona seleccionada. Redirigiendo...');
    navigate('/'); // O a donde desees redirigir en caso de error
    return null; // No renderizar nada mientras se redirige
  }

  // Filtrar contactos relacionados con la persona seleccionada
  const historicoProcedenciaPersona = historicoProcedencia.filter(
    historicoProcedencia => historicoProcedencia.cod_persona === personaSeleccionada.cod_persona
  );

  const volverAListaPersonas = () => {
    navigate('/ListaPersonas');
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`http://74.50.68.87:4000/api/historial_proc/historico_persona/${personaSeleccionada.cod_persona}`);
        const data = await response.json();
        setHistoricoProcedencia(data);
      } catch (error) {
        console.error('Error al obtener el historial de la persona:', error);
      }
    };

    if (personaSeleccionada) {
      fetchData();
    }
  }, [personaSeleccionada]);  

{/************************************************************************************************************************************************/}

const formatearAnio = (fecha) => {
  if (!fecha) return '';
  const fechaObj = new Date(fecha);
  const year = fechaObj.getFullYear();
  return `${year}`;
};

const obtenerNombreCompleto = (persona) => {
  if (!persona) return 'Información no disponible';
  return [persona.Nombre, persona.Segundo_nombre, persona.Primer_apellido, persona.Segundo_apellido]
    .filter(Boolean) // Filtrar los valores no definidos
    .map(nombre => nombre.toUpperCase()) // Convertir todos los nombres a mayúsculas
    .join(' '); // Unir todos los nombres en una sola cadena
};


  useEffect(() => {
    console.log(personaSeleccionada);
  }, [personaSeleccionada]);

    // useEffect para cargar el histórico de procedencia al montar el componente
    useEffect(() => {
        fetchHistoricoProcedencia(); // Llama a la función para obtener el histórico de procedencia desde el backend
    }, []);

  // Función para obtener el histórico de procedencia desde la API
  const fetchHistoricoProcedencia = async () => {
    try {
      const response = await fetch('http://74.50.68.87:4000/api/historial_proc/ver_historico_procedencia'); // Realiza la petición al backend
      const data = await response.json(); // Convierte la respuesta a JSON
      const dataWithIndex = data.map((historico, index) => ({
        ...historico,
        originalIndex: index + 1, // Añade un índice basado en la posición del registro en la lista
      }));
      setHistoricoProcedencia(dataWithIndex); // Actualiza el estado con los datos obtenidos
    } catch (error) {
      console.error('Error al obtener el histórico de procedencia:', error); // Muestra el error en la consola si la petición falla
    }
  };


  const exportToExcel = () => {
    // Transforma los datos: convierte los campos de texto a mayúsculas y excluye `cod_procedencia`
    const historicoConFormato = historicoProcedencia.map((item, index) => ({
        '#': index + 1, // Índice personalizado
        Nombre_procedencia: item.Nombre_procedencia.toUpperCase(),
        Lugar_procedencia: item.Lugar_procedencia.toUpperCase(),
        Instituto: item.Instituto.toUpperCase()
    }));

    // Convierte los datos a formato de hoja de cálculo
    const worksheet = XLSX.utils.json_to_sheet(historicoConFormato); 
    const workbook = XLSX.utils.book_new(); // Crea un nuevo libro de trabajo
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Historial Procedencia'); // Añade la hoja

    // Genera el archivo Excel en formato binario
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    // Crea un Blob para descargar el archivo con file-saver
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, 'reporte_historial_procedencia.xlsx'); // Descarga el archivo Excel
};


  const exportToPDF = () => {
    const doc = new jsPDF(); // Crea un nuevo documento PDF
  
    // Añade un título al documento PDF
    doc.text('Reporte del historial de procedencia', 20, 10);
  
    // Genera la tabla en el PDF con los datos de los edificios
    doc.autoTable({
      head: [['#', 'Nombre de procedencia', 'Lugar de procedencia', 'Instituto']], // Cabecera de la tabla
      body: historicoProcedencia.map((historico, index) => [
        index + 1,
        historico.Nombre_procedencia.toUpperCase(), // Datos en mayúsculas
        historico.Lugar_procedencia.toUpperCase(),
        historico.Instituto.toUpperCase(),
      ]), // Datos que se mostrarán en la tabla
    });
  
    // Descarga el archivo PDF
    doc.save('reporte_historial_procendencia.pdf');
  };
  
   

  const handleNombreInputChange = (e, setState) => {
    const { name, value } = e.target;
  
    // Validaciones
    const isValid = validateNombre(value);
  
    if (isValid) {
      setState(prevState => ({ ...prevState, [name]: value }));
    }
  };
  
  const validateNombre = (value) => {
    // 1. No permitir caracteres especiales (solo letras y espacios)
    const regexSpecialChars = /^[a-zA-Z\s]*$/;
    if (!regexSpecialChars.test(value)) {
      swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Solo se permiten letras y espacios.',
      });
      return false;
    }
  
    // 2. No permitir 4 letras consecutivas
    const regexConsecutiveLetters = /(.)\1{3,}/; // Busca 4 letras iguales consecutivas
    if (regexConsecutiveLetters.test(value)) {
      swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se permiten 4 letras consecutivas.',
      });
      return false;
    }
  
    // 3. No permitir números
    const regexNumbers = /\d/;
    if (regexNumbers.test(value)) {
      swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se permiten números.',
      });
      return false;
    }
  
    // 4. No permitir más de 3 espacios consecutivos
    const regexSpaces = /( {3,})/; // Busca 3 o más espacios consecutivos
    if (regexSpaces.test(value)) {
      swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se permiten más de 3 espacios consecutivos.',
      });
      return false;
    }
  
    // 5. Opción: Limitar la cantidad de espacios consecutivos a 2
    const regexTwoSpaces = /( {2,})/; // Busca 2 o más espacios
    if (regexTwoSpaces.test(value)) {
      swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se permiten más de 2 espacios consecutivos.',
      });
      return false;
    }
  
    return true; // Si pasa todas las validaciones
  };

 


  // Deshabilita copiar y pegar
  const disableCopyPaste = (e) => {
    e.preventDefault();
    swal.fire({
      icon: 'warning',
      title: 'Acción bloqueada',
      text: 'Copiar y pegar no está permitido.',
    });
  };
  // Maneja el cierre de los modales con advertencia si hay cambios sin guardar
  const handleCloseModal = () => {
          setModalVisible(false);
          resetNuevoHistorico();
          setModalUpdateVisible(false);
          setModalDeleteVisible(false);

  };

  // Reiniciar el formulario de nuevo registro
  const resetNuevoHistorico = () => {
    setNuevoHistorico({ cod_persona: '', instituto: '', lugar_procedencia: '', anio_ingreso: ''});
  };

  // Reiniciar el formulario de actualización de registro
  const resetHistoricoToUpdate = () => {
    setHistoricoToUpdate({ cod_persona: '', instituto: '', lugar_procedencia: '', anio_ingreso: ''});
  };

{/****************************************************************************************************************************************/}

const handleSaveHistorico = async () => {
  const camposRequeridos = [
    { campo: 'instituto', valor: historicoToUpdate.cod_procedencia ? historicoToUpdate.instituto : nuevoHistorico.instituto },
    { campo: 'lugar_procedencia', valor: historicoToUpdate.cod_procedencia ? historicoToUpdate.lugar_procedencia : nuevoHistorico.lugar_procedencia },
    { campo: 'anio_ingreso', valor: historicoToUpdate.cod_procedencia ? historicoToUpdate.anio_ingreso : nuevoHistorico.anio_ingreso },
    { campo: 'cod_persona', valor: personaSeleccionada ? personaSeleccionada.cod_persona : null }
  ];

  // Verificar si algún campo está vacío o es nulo
  const campoFaltante = camposRequeridos.find(campo => !campo.valor || campo.valor.toString().trim() === '');
  if (campoFaltante) {
    console.error(`El campo "${campoFaltante.campo}" está vacío o no es válido.`);
    swal.fire({
      icon: 'error',
      title: 'Datos incompletos',
      text: `El campo "${campoFaltante.campo}" es obligatorio.`,
      confirmButtonText: 'Entendido'
    });
    return;
  }

  // Datos a enviar a la API
  const data = {
    cod_persona: personaSeleccionada.cod_persona,  // Verifica que este valor esté bien asignado
    instituto: historicoToUpdate.cod_procedencia ? historicoToUpdate.instituto : nuevoHistorico.instituto,
    lugar_procedencia: historicoToUpdate.cod_procedencia ? historicoToUpdate.lugar_procedencia : nuevoHistorico.lugar_procedencia,
    anio_ingreso: historicoToUpdate.cod_procedencia ? historicoToUpdate.anio_ingreso : nuevoHistorico.anio_ingreso,
  };

  try {
    if (historicoToUpdate.cod_procedencia) {
      // Llamada para actualizar
      const response = await fetch(`http://74.50.68.87:4000/api/historial_proc/actualizar_historico/${historicoToUpdate.cod_procedencia}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        swal.fire({
          icon: 'success',
          title: 'Éxito',
          text: 'Procedencia actualizada correctamente',
          confirmButtonText: 'Aceptar'
        });
        handleCloseModal(setModalUpdateVisible, resetHistoricoToUpdate);
        fetchHistoricoProcedencia(personaSeleccionada.cod_persona); // Llama solo los datos de la persona
      } else {
        console.error('Error en la respuesta de la API:', response);
        swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error al actualizar la procedencia',
          confirmButtonText: 'Aceptar'
        });
      }
    } else {
      // Llamada para insertar
      const response = await fetch('http://74.50.68.87:4000/api/historial_proc/crear_historico', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        swal.fire({
          icon: 'success',
          title: 'Éxito',
          text: 'Procedencia agregada correctamente',
          confirmButtonText: 'Aceptar'
        });
        handleCloseModal(setModalVisible, resetNuevoHistorico);
        fetchHistoricoProcedencia(personaSeleccionada.cod_persona); // Llama solo los datos de la persona
      } else {
        console.error('Error en la respuesta de la API:', response);
        swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error al agregar la procedencia',
          confirmButtonText: 'Aceptar'
        });
      }
    }
  } catch (error) {
    console.error('Error en la petición:', error);
    swal.fire({
      icon: 'error',
      title: 'Error de conexión',
      text: 'Hubo un error al conectar con la API',
      confirmButtonText: 'Aceptar'
    });
  }
};



  
  
{/*************************************************************************************************************************************************/}

const handleDeleteHistorico = async () => {
  try {
    const response = await fetch(`http://74.50.68.87:4000/api/historial_proc/eliminar_historico/${encodeURIComponent(historicoToDelete.cod_procedencia)}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });

    const result = await response.json();
    if (response.ok) {
      fetchHistoricoProcedencia(); // Recargar la lista de registros
      setModalDeleteVisible(false); // Cerrar el modal
      setHistoricoToDelete({}); // Limpiar el registro seleccionado
      swal.fire({ icon: 'success', title: 'Eliminación exitosa', text: 'La procedencia se ha sido eliminada correctamente.' });
    } else {
      swal.fire({ icon: 'error', title: 'Error', text: result.mensaje || 'Hubo un error al eliminar la procedencia.' });
      console.error('Error al eliminar la procedencia:', result);
    }
  } catch (error) {
    console.error('Error al eliminar la procedencia:', error);
    swal.fire({
      icon: 'error',
      title: 'Error en el servidor',
      text: 'Hubo un error en el servidor. Inténtalo más tarde.',
    });
  }
};

{/**********************************************************************************************************************************************/}
  // Abre el modal de actualización con los datos del registro seleccionado
  const openUpdateModal = (historico) => {
    setHistoricoToUpdate(historico);
    setModalUpdateVisible(true);
    setHasUnsavedChanges(false); // Resetear el estado de cambios no guardados
  };
  
  // Abre el modal de eliminación con los datos del registro seleccionado
  const openDeleteModal = (historico) => {
    setHistoricoToDelete(historico);
    setModalDeleteVisible(true);
  };

  {/********************************************************BUSQUEDA Y FILTRADO****************************************************************/}
  
// Maneja la búsqueda filtrando por nombre del edificio
// Maneja la búsqueda filtrando por cualquier campo relevante del histórico de procedencia
const handleSearch = (event) => {
  setSearchTerm(event.target.value);
  setCurrentPage(1); // Reinicia a la primera página al buscar
};

// Filtra los registros del histórico de procedencia según el término de búsqueda
const filteredHistoricos = historicoProcedencia.filter((historicop) => {
  const searchTermUpper = searchTerm.toUpperCase();
  return (
      String(historicop.cod_procedencia).toUpperCase().includes(searchTermUpper) ||
      String(historicop.cod_persona).toUpperCase().includes(searchTermUpper) ||
      historicop.instituto.toUpperCase().includes(searchTermUpper) ||
      historicop.lugar_procedencia.toUpperCase().includes(searchTermUpper) ||
      String(historicop.anio_ingreso).toUpperCase().includes(searchTermUpper)
  );
});

// Cálculo de la paginación
const indexOfLastRecord = currentPage * recordsPerPage;
const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
const currentRecords = filteredHistoricos.slice(indexOfFirstRecord, indexOfLastRecord);

// Función para cambiar de página en la paginación
const paginate = (pageNumber) => {
  if (pageNumber > 0 && pageNumber <= Math.ceil(filteredHistoricos.length / recordsPerPage)) {
      setCurrentPage(pageNumber);
  }
};



    
    // Verificar permisos
    if (!canSelect) {
      return <AccessDenied />;
    }
    

    return(
        <CContainer>
<CRow className="align-items-center mb-5">
  <CCol xs="8" md="9">
    <h2 className="mb-0">Historial Procedencia</h2>
    {/* Nombre de la persona seleccionada */}
    {personaSeleccionada ? (
          <div style={{ marginTop: '10px', fontSize: '16px', color: '#555' }}>
            <strong>Procedencia del estudiante:</strong> {personaSeleccionada 
              ? `${personaSeleccionada.Nombre.toUpperCase()} ${personaSeleccionada.Segundo_nombre?.toUpperCase() || ''} ${personaSeleccionada.Primer_apellido.toUpperCase()} ${personaSeleccionada.Segundo_apellido?.toUpperCase() || ''}` 
              : 'Información no disponible'}
          </div>
        ) : (
          <div style={{ marginTop: '10px', fontSize: '16px', color: '#555' }}>
            <strong>Persona Seleccionada:</strong> Información no disponible
          </div>
        )}
  </CCol>
  {/* Botones "Nuevo" y "Reporte" alineados arriba */}
  <CCol xs="4" md="3" className="text-end d-flex flex-column flex-md-row justify-content-md-end align-items-md-center">
    {/* Botón "Personas" */}
    <CButton
      color="secondary"
      onClick={volverAListaPersonas}
      style={{
        minWidth: '120px', // Ancho consistente para todos los botones
      }}
      className="mb-3 mb-md-0 me-md-3" // Espaciado entre botones
    >
      <CIcon icon={cilArrowLeft} /> Personas
    </CButton>
    
    {/* Botón "Nuevo" */}
    <CButton
      style={{ backgroundColor: '#4B6251', color: 'white', minWidth: '120px' }} // Mismo tamaño
      className="mb-3 mb-md-0 me-md-3" // Margen inferior en pantallas pequeñas, margen derecho en pantallas grandes
      onClick={() => setModalVisible(true)}
    >
      <CIcon icon={cilPlus} /> Nuevo
    </CButton>
    
    {/* Botón "Reporte" con dropdown */}
    <CDropdown>
      <CDropdownToggle
        style={{ backgroundColor: '#6C8E58', color: 'white', minWidth: '120px' }} // Mismo tamaño
        className="mb-3 mb-md-0 me-md-3" // Espaciado consistente
      >
        <CIcon icon={cilDescription} /> Reporte
      </CDropdownToggle>
      <CDropdownMenu>
        <CDropdownItem onClick={exportToExcel}>Descargar en Excel</CDropdownItem>
        <CDropdownItem onClick={exportToPDF}>Descargar en PDF</CDropdownItem>
      </CDropdownMenu>
    </CDropdown>
  </CCol>
</CRow>
      {/* Filtro de búsqueda y selección de registros */}
      <CRow className="align-items-center mt-4 mb-2">
            {/* Barra de búsqueda  */}
            <CCol xs="12" md="8" className="d-flex flex-wrap align-items-center">
              <CInputGroup className="me-3" style={{ width: '400px' }}>
                <CInputGroupText>
                  <CIcon icon={cilSearch} />
                </CInputGroupText>
                <CFormInput
                  placeholder="Buscar procedencia"
                  onChange={handleSearch}
                  value={searchTerm}
                />
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

      {/* Selector dinámico a la par de la barra de búsqueda */}
      <CCol xs="12" md="4" className="text-md-end mt-2 mt-md-0">
        <CInputGroup className="mt-2 mt-md-0" style={{ width: 'auto', display: 'inline-block' }}>
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
      {/* Tabla de histórico de procedencia con tamaño fijo */}
      <div className="table-container" style={{ maxHeight: '400px', overflowY: 'scroll', marginBottom: '20px' }}>
  <CTable striped bordered hover>
    <CTableHead>
      <CTableRow>
        <CTableHeaderCell>#</CTableHeaderCell>
        <CTableHeaderCell>Nombre</CTableHeaderCell>
        <CTableHeaderCell>Instituto</CTableHeaderCell>
        <CTableHeaderCell>Lugar de Procedencia</CTableHeaderCell>
        <CTableHeaderCell>Año de Ingreso</CTableHeaderCell>
        <CTableHeaderCell>Acciones</CTableHeaderCell>
      </CTableRow>
    </CTableHead>
    <CTableBody>
      {currentRecords
        .filter((historico) => {
          console.log("filtrando por cod_persona:", personaSeleccionada?.cod_persona);
          return historico.cod_persona === personaSeleccionada?.cod_persona;
        })
        .map((historico, index) => (
          <CTableRow key={historico.cod_procedencia}>
            <CTableDataCell>{index + 1 + indexOfFirstRecord}</CTableDataCell>
            <CTableDataCell>
              {personaSeleccionada
                ? `${personaSeleccionada.Nombre.toUpperCase()} ${personaSeleccionada.Segundo_nombre.toUpperCase()} ${personaSeleccionada.Primer_apellido.toUpperCase()} ${personaSeleccionada.Segundo_apellido.toUpperCase()}`
                : 'Información no disponible'}
            </CTableDataCell>
            <CTableDataCell>{historico.instituto.toUpperCase()}</CTableDataCell>
            <CTableDataCell>{historico.lugar_procedencia.toUpperCase()}</CTableDataCell>
            <CTableDataCell>{historico.anio_ingreso}</CTableDataCell>
            <CTableDataCell>
              <CButton color="warning" onClick={() => openUpdateModal(historico)}>
                <CIcon icon={cilPen} />
              </CButton>
              <CButton color="danger" onClick={() => openDeleteModal(historico)} className="ms-2">
                <CIcon icon={cilTrash} />
              </CButton>
            </CTableDataCell>
          </CTableRow>
        ))}
    </CTableBody>
  </CTable>
</div>


          {/* Paginación */}
      <CPagination
        align="center"
        aria-label="Page navigation example"
        activePage={currentPage}
        pages={Math.ceil(filteredHistoricos.length / recordsPerPage)}
        onActivePageChange={paginate}
      />

      {/* Botones de paginación "Anterior" y "Siguiente" */}
      <div className="d-flex justify-content-center align-items-center mt-3">
        <CButton
          style={{ backgroundColor: '#6f8173', color: '#D9EAD3' }}
          disabled={currentPage === 1}
          onClick={() => paginate(currentPage - 1)}
        >
          Anterior
        </CButton>

        <CButton
          style={{ marginLeft: '10px', backgroundColor: '#6f8173', color: '#D9EAD3' }}
          disabled={currentPage === Math.ceil(filteredHistoricos.length / recordsPerPage)}
          onClick={() => paginate(currentPage + 1)}
        >
          Siguiente
        </CButton>

        <div style={{ marginLeft: '10px' }}>
          Página {currentPage} de {Math.ceil(filteredHistoricos.length / recordsPerPage)}
        </div>
      </div>


{/**************************************************MODAL DE AGREGAR***************************************************************/}
<CModal visible={modalVisible || modalUpdateVisible} onClose={() => {
  if (historicoToUpdate.cod_procedencia) {
    handleCloseModal(setModalUpdateVisible, resetHistoricoToUpdate);
  } else {
    handleCloseModal(setModalVisible, resetNuevoHistorico);
  }
}} backdrop="static">
  <CModalHeader closeButton>
    <CModalTitle>{historicoToUpdate.cod_procedencia ? 'Actualizar Procedencia' : 'Ingresar Procedencia'}</CModalTitle>
  </CModalHeader>
  <CModalBody>
    <div style={{ marginBottom: '10px', border: '1px solid #dcdcdc', padding: '10px', backgroundColor: '#f9f9f9' }}>
      <strong>PERSONA:</strong> {personaSeleccionada 
        ? `${personaSeleccionada.Nombre.toUpperCase()} ${personaSeleccionada.Segundo_nombre?.toUpperCase() || ''} ${personaSeleccionada.Primer_apellido.toUpperCase()} ${personaSeleccionada.Segundo_apellido?.toUpperCase() || ''}` 
        : 'Información no disponible'}
    </div>
    <CForm>
      <div className="mb-3">
        <CInputGroup className="mb-3">
          <CInputGroupText>Instituto</CInputGroupText>
          <CFormInput
            name="instituto"
            value={historicoToUpdate.instituto || nuevoHistorico.instituto || ''}
            maxLength={80}
            onPaste={disableCopyPaste}
            onCopy={disableCopyPaste}
            style={{ textTransform: 'uppercase' }}
            onChange={(e) =>
              historicoToUpdate.cod_procedencia
                ? handleNombreInputChange(e, setHistoricoToUpdate)
                : handleNombreInputChange(e, setNuevoHistorico)
            }
          />
        </CInputGroup>
      </div>

      <div className="mb-3">
        <CInputGroup className="mb-3">
          <CInputGroupText>Lugar de Procedencia</CInputGroupText>
          <CFormInput
            name="lugar_procedencia"
            value={historicoToUpdate.lugar_procedencia || nuevoHistorico.lugar_procedencia || ''}
            maxLength={80}
            onPaste={disableCopyPaste}
            onCopy={disableCopyPaste}
            style={{ textTransform: 'uppercase' }}
            onChange={(e) =>
              historicoToUpdate.cod_procedencia
                ? handleNombreInputChange(e, setHistoricoToUpdate)
                : handleNombreInputChange(e, setNuevoHistorico)
            }
          />
        </CInputGroup>
      </div>

      <div className="mb-3">
        <CInputGroup className="mb-3">
          <CInputGroupText>Año de Ingreso</CInputGroupText>
          <CFormInput
            name="anio_ingreso"
            type="number"
            min="1900"
            max={new Date().getFullYear()}
            value={historicoToUpdate.anio_ingreso || nuevoHistorico.anio_ingreso || ''}
            onChange={(e) =>
              historicoToUpdate.cod_procedencia
                ? setHistoricoToUpdate((prevState) => ({
                    ...prevState,
                    anio_ingreso: e.target.value,
                  }))
                : setNuevoHistorico((prevState) => ({
                    ...prevState,
                    anio_ingreso: e.target.value,
                  }))
            }
          />
        </CInputGroup>
      </div>
    </CForm>
  </CModalBody>
  <CModalFooter>
    <CButton
      style={{ backgroundColor: '#6c757d', color: 'white', borderColor: '#6c757d' }}
      onClick={() => {
        if (historicoToUpdate.cod_procedencia) {
          handleCloseModal(setModalUpdateVisible, resetHistoricoToUpdate);
        } else {
          handleCloseModal(setModalVisible, resetNuevoHistorico);
        }
      }}
    >
      Cancelar
    </CButton>
    <CButton
      style={{ backgroundColor: '#4B6251', color: 'white', borderColor: '#4B6251' }}
      onClick={handleSaveHistorico}
      disabled={errors.instituto || errors.lugar_procedencia || errors.anio_ingreso}
    >
      <CIcon icon={historicoToUpdate.cod_procedencia ? cilPen : cilSave} />
      &nbsp;
      {historicoToUpdate.cod_procedencia ? 'Actualizar' : 'Guardar'}
    </CButton>
  </CModalFooter>
</CModal>



{/**************************************************FIN MODAL DE AGREGAR***************************************************************/}

    {/* Modal Eliminar Procedencia */}
<CModal visible={modalDeleteVisible} backdrop="static">
  <CModalHeader closeButton={false}>
    <CModalTitle>Eliminar Procedencia</CModalTitle>
    <CButton className="btn-close" aria-label="Close" onClick={() => handleCloseModal(setModalVisible, resetNuevoHistorico)}/>
  </CModalHeader>
  <CModalBody>
    ¿Estás seguro de que deseas eliminar la procedencia "{historicoToDelete.Nombre_procedencia?.toUpperCase()}"?
  </CModalBody>
  <CModalFooter>
    <CButton color="secondary" onClick={handleCloseModal}>
      Cancelar
    </CButton>
    <CButton style={{  backgroundColor: '#E57368',color: 'white' }} onClick={handleDeleteHistorico}>
    <CIcon icon={cilTrash} style={{ marginRight: '5px' }} /> 
      Eliminar
    </CButton>
  </CModalFooter>
</CModal>
      </CContainer>
    );
};

export default ListaHistoricoProc;
