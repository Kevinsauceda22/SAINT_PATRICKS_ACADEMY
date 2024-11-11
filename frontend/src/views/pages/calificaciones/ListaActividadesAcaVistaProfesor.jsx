import React, { useEffect, useState } from 'react';
import { CIcon } from '@coreui/icons-react';
import Swal from 'sweetalert2';
import { cilSearch,cilInfo, cilBrushAlt, cilPen, cilTrash, cilPlus, cilSave,cilDescription } from '@coreui/icons'; // Importar iconos específicos
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
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
  CRow,
  CCol,
  CPagination // Importa CPagination para la paginación
} from '@coreui/react';

const ListaActividadesAcaVistaProfesores = () => {
  const [actividades, setActividades] = useState([]);
  const [error, setError] = useState(null);
  const [codProfesor] = useState('1'); // Simulamos que el profesor con código '62' ha iniciado sesión
  const [modalVisible, setModalVisible] = useState(false);
  const [modalUpdateVisible, setModalUpdateVisible] = useState(false);
  const [modalDeleteVisible, setModalDeleteVisible] = useState(false);
  const [modalReporteVisible, setModalReporteVisible] = useState(false);
  const [nuevoActividad, setNuevoActividad] = useState({
    Cod_profesor: codProfesor,
    Cod_ponderacion_ciclo: '',
    Cod_parcial: '',
    Descripcion: '',
    Fechayhora_Inicio: '',
    Fechayhora_Fin: '',
    Valor: '',
    Cod_secciones: '',
  });
  const [actividadToUpdate, setActividadToUpdate] = useState({});
  const [actividadToDelete, setActividadToDelete] = useState({});
  const [actividadToReportar, setActividadToReportar] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [listaProfesores, setProfesores] = useState([]);
  const [listaponderaciones, setPonderaciones] = useState([]);
  const [listaParcial, setParciales] = useState([]);
  const [listaSecciones, setSecciones] = useState([]);
  const [listaponderacionesC, setlistaponderacionesC] = useState([]); // 
  const [listaPersonas, setListaPersonas] = useState([]); // Nueva lista para personas
  const [currentPage, setCurrentPage] = useState(1); // Página actual
  const [recordsPerPage, setRecordsPerPage] = useState(5); // Número de registros por página
  const [modalPDFVisible, setModalPDFVisible] = useState(false); // Nuevo estado para el modal de PDF
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false); // Estado para detectar cambios sin guardar
  
  useEffect(() => {
    fetchActividades();
    fetchListaProfesores();
    fetchPonderaciones();
    fetchParciales();
    fetchSecciones();
    fetchListaPersonas();
    fetchListaCiclo();
  }, []);

  const fetchActividades = async () => {
    try {
      const response = await fetch(`http://localhost:4000/api/actividadesAcademicas/veractividadesProfesor/${codProfesor}`);
      const data = await response.json();
      setActividades(data);
    } catch (error) {
      console.error('Error al obtener actividades:', error);
      setError('Error al obtener actividades académicas.');
    }
  };

  const fetchListaProfesores = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/profesores/verprofesores');
      const data = await response.json();
      setProfesores(data);
    } catch (error) {
      console.error('Error al obtener profesores:', error);
    }
  };

  const fetchPonderaciones = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/ponderaciones/verPonderaciones');
      const data = await response.json();
      setPonderaciones(data);
    } catch (error) {
      console.error('Error al obtener ponderaciones:', error);
    }
  };
  const fetchListaPersonas = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/persona/verPersonas');
      const data = await response.json();
      setListaPersonas(data);
    } catch (error) {
      console.error('Error al obtener las personas:', error);
    }
  };

  const fetchParciales = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/parciales/verParciales');
      const data = await response.json();
      setParciales(data);
    } catch (error) {
      console.error('Error al obtener parciales:', error);
    }
  };
  const fetchListaCiclo= async () => {
    try {
      const response = await fetch('http://localhost:4000/api/ponderacionCiclo/verPonderacionesCiclos');
      const data = await response.json();
      setlistaponderacionesC(data);
    } catch (error) {
      console.error('Error al obtener los parciales:', error);
    }
};
  const fetchSecciones = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/secciones/versecciones');
      const data = await response.json();
      setSecciones(data);
    } catch (error) {
      console.error('Error al obtener secciones:', error);
    }
  };



  const handleInputChange = (e, setFunction) => {
    const input = e.target;
  const cursorPosition = input.selectionStart; // Guarda la posición actual del cursor
  let value = input.value
    .toUpperCase() // Convertir a mayúsculas
    .trimStart();   // Evitar espacios al inicio

    const regex = /^[A-Z0-9ÁÉÍÓÚÜÑ,:.\s]*$/;

     // Verificar si hay múltiples espacios consecutivos antes de reemplazarlos
     if (/\s{2,}/.test(value)) {
      Swal.fire({
        icon: 'warning',
        title: 'Espacios múltiples',
        text: 'No se permite más de un espacio entre palabras.',
      });
      value = value.replace(/\s+/g, ' '); // Reemplazar múltiples espacios por uno solo
    }

    // Validar con la expresión regular
    if (!regex.test(value)) {
      Swal.fire({
        icon: 'warning',
        title: 'Caracteres no permitidos',
        text: 'Solo se permiten letras, números, comas, dos puntos, espacios y tildes.',
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
          Swal.fire({
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
  Swal.fire({
    icon: 'warning',
    title: 'Accion bloquear',
    text:'Copiar y pegar no esta permitido'
  });
  };

   // Función para cerrar el modal con advertencia si hay cambios sin guardar
 const handleCloseModal = (closeFunction, resetFields) => {
  if (hasUnsavedChanges) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Si cierras este formulario, perderás todos los datos ingresados.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, cerrar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        closeFunction(false);
        resetFields(); // Limpiar los campos al cerrar
        setHasUnsavedChanges(false); // Resetear cambios no guardados
      }
    });
  } else {
    closeFunction(false);
    resetFields();
    setHasUnsavedChanges(false); // Asegurarse de resetear aquí también
  }
};
// Funciones auxiliares para resetear los campos específicos de cada modal
const resetNuevoActividad = () => {
  setNuevoActividad({
    Cod_profesor: codProfesor, // Mantener el código del profesor
    Cod_ponderacion_ciclo: '',
    Cod_parcial: '',
    Descripcion: '',
    Fechayhora_Inicio: '',
    Fechayhora_Fin: '',
    Valor: '',
    Cod_secciones: '',
  });
};
const resetActividadToUpdate = () => setActividadToUpdate('');


  


  const handleCreateActividad = async () => {

    // Función de validación de campos
  const validarCampos = () => {
    const {
      Cod_ponderacion_ciclo,
      Cod_parcial,
      Nombre_actividad_academica,
      Descripcion,
      Fechayhora_Inicio,
      Fechayhora_Fin,
      Valor,
      Cod_secciones,
    } = nuevoActividad;
    
    if (!Nombre_actividad_academica || Nombre_actividad_academica.length < 3) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'El campo "Nombre de Actividad Académica" es obligatorio.' });
      return false;
    }

    if (!Descripcion) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'El campo "Descripción" es obligatorio.' });
      return false;
    }

    if (!Cod_ponderacion_ciclo) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'El campo "Ponderación Ciclo" es obligatorio.' });
      return false;
    }
    if (!Cod_parcial) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'El campo "Parcial" es obligatorio.' });
      return false;
    }
    if (!Cod_secciones) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'El campo "Secciones" es obligatorio.' });
      return false;
    }
  
    if (!Fechayhora_Inicio) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'El campo "Fecha y Hora de Inicio" es obligatorio.' });
      return false;
    }
    if (!Fechayhora_Fin) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'El campo "Fecha y Hora de Fin" es obligatorio.' });
      return false;
    }
    if (new Date(Fechayhora_Inicio) >= new Date(Fechayhora_Fin)) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'La "Fecha y Hora de Fin" debe ser posterior a la "Fecha y Hora de Inicio".' });
      return false;
    }
    if (!Valor || isNaN(Valor) || Valor < 1 || Valor > 100) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'El campo "Valor" debe estar entre 1 y 100.' });
      return false;
    }
    // Validar que el valor tenga hasta dos decimales
    const decimalRegex = /^\d+(\.\d{1,2})?$/;
    if (!decimalRegex.test(Valor)) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'El campo "Valor" debe tener hasta dos decimales.' });
      return false;
    }

    return true; // Si todos los campos son válidos
  };

  // Ejecutar la validación antes de proceder
  if (!validarCampos()) {
    return; // Detener si la validación falla
  }

    try {
      const response = await fetch('http://localhost:4000/api/actividadesAcademicas/crearactividadacademica', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoActividad),
      });
      if (response.ok) {
        fetchActividades();
        setModalVisible(false);
        resetNuevoActividad
        ({
          Cod_ponderacion_ciclo: '',
          Cod_parcial: '',
          Nombre_actividad_academica: '',
          Descripcion: '',
          Fechayhora_Inicio: '',
          Fechayhora_Fin: '',
          Valor: '',
          Cod_secciones:''
        });
        Swal.fire({
          icon: 'success',
          title: '¡Éxito!',
          text: 'La actividad se ha creado correctamente',
        });
      } else {
        console.error('Hubo un problema al crear la actividad', response.statusText);
      }
    } catch (error) {
      console.error('Hubo un problema al crear la actividad', error);
    }
  };

  const handleUpdateActividad = async () => {
     // Función de validación de campos
  const validarCampos = () => {
    const {
      Cod_ponderacion_ciclo,
      Cod_parcial,
      Nombre_actividad_academica,
      Descripcion,
      Fechayhora_Inicio,
      Fechayhora_Fin,
      Valor,
      Cod_secciones,
    } = actividadToUpdate;
    if (!Nombre_actividad_academica || Nombre_actividad_academica.length < 3) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'El campo "Nombre de Actividad Académica" debe tener al menos 3 caracteres.' });
      return false;
    }
    if (!Descripcion) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'El campo "Descripción" es obligatorio.' });
      return false;
    }

    if (!Cod_ponderacion_ciclo) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'El campo "Ponderación Ciclo" es obligatorio.' });
      return false;
    }
    if (!Cod_parcial) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'El campo "Parcial" es obligatorio.' });
      return false;
    }
   
    if (!Cod_secciones) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'El campo "Secciones" es obligatorio.' });
      return false;
    }

    if (!Fechayhora_Inicio) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'El campo "Fecha y Hora de Inicio" es obligatorio.' });
      return false;
    }
    if (!Fechayhora_Fin) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'El campo "Fecha y Hora de Fin" es obligatorio.' });
      return false;
    }
    if (new Date(Fechayhora_Inicio) >= new Date(Fechayhora_Fin)) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'La "fecha y hora inicio" no puede ser mayor o igual que la "fecha y hora fin"' });
      return false;
    }
    if (!Valor || isNaN(Valor) || Valor < 1 || Valor > 100) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'El campo "Valor" debe estar entre 1 y 100.' });
      return false;
    }
    // Validar que el valor tenga hasta dos decimales
    const decimalRegex = /^\d+(\.\d{1,2})?$/;
    if (!decimalRegex.test(Valor)) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'El campo "Valor" debe tener hasta dos decimales.' });
      return false;
    }
   

    return true; // Si todos los campos son válidos
  };

  // Ejecutar la validación antes de proceder
  if (!validarCampos()) {
    return; // Detener si la validación falla
  }
    try {
      const response = await fetch('http://localhost:4000/api/actividadesAcademicas/actualizaractividad', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(actividadToUpdate),
      });

      if (response.ok) {
        fetchActividades(); // Actualizar la lista de actividades
      setModalVisible(false); // Cerrar el modal
      resetNuevoActividad(); // Resetear los campos
        Swal.fire({
          icon: 'success',
          title: '¡Éxito!',
          text: 'La Actividad se ha actualizado correctamente',
        });
      } else {
        console.error('Hubo un problema al actualizar la actividad', response.statusText);
      }
    } catch (error) {
      console.error('Hubo un problema al actualizar la actividad', error);
    }
  };

  const handleDeleteActividad = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/actividadesAcademicas/eliminarActividad', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Cod_actividad_academica: actividadToDelete.Cod_actividad_academica }),
      });
      if (response.ok) {
        fetchActividades();
        setModalDeleteVisible(false);
      }
    } catch (error) {
      console.error('Error al eliminar la actividad académica:', error);
    }
  };

  



// Función para obtener el nombre y apellido del profesor basado en Cod_profesor
const getNombreCompletoProfesor = (cod_profesor) => {
  const profesor = listaProfesores.find(p => p.Cod_profesor === cod_profesor);
  if (profesor) {
    const persona = listaPersonas.find(per => per.cod_persona === profesor.cod_persona);
    return persona ? `${persona.Nombre} ${persona.Primer_apellido}` : 'Sin nombre';
  }
  return 'Sin nombre';
};



  const handleSearch = (event) => {
    const input = event.target.value.toUpperCase(); // Convertir a mayúsculas
    const regex = /^[A-ZÑ\s]*$/; // Solo permite letras, espacios y la letra "Ñ"
    
    if (!regex.test(input) && input !== '') {
      Swal.fire({
        icon: 'warning',
        title: 'Caracteres no permitidos',
        text: 'Solo se permiten letras y espacios.',
      });
      return searchTerm && nombreCompleto.includes(searchTerm.trim().toUpperCase());    }

    setSearchTerm(input);
    setCurrentPage(1); // Resetear a la primera página al buscar
  };

  const filteredActividades = actividades.filter((actividad) => {
    const searchLower = searchTerm.toLowerCase();
    const profesor = getNombreCompletoProfesor(actividad.Cod_profesor)?.toLowerCase() || '';
    const parcial = listaParcial.find(p => p.Cod_parcial === actividad.Cod_parcial)?.Nombre_parcial?.toLowerCase() || '';
    const seccion = listaSecciones.find(s => s.Cod_secciones === actividad.Cod_secciones)?.Nombre_seccion?.toLowerCase() || '';
    const matchActividad = Object.values(actividad).some((valor) =>
      String(valor).toLowerCase().includes(searchLower)
    );
    const matchProfesor = profesor.includes(searchLower);
    const matchParcial = parcial.includes(searchLower);
    const matchSeccion = seccion.includes(searchLower);
    return matchActividad || matchProfesor || matchParcial || matchSeccion;
  });
  
  // Lógica para obtener los registros actuales
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredActividades.slice(indexOfFirstRecord, indexOfLastRecord);
  
  // Cambiar página
  const paginate = (pageNumber) => {
  if (pageNumber > 0 && pageNumber <= Math.ceil(filteredActividades.length / recordsPerPage)) {
    setCurrentPage(pageNumber);
  }
  };
  


//==============================================PDF y EXCEL ===================================================
const getNombreParcial = (codParcial) => {
  const parcial = listaParcial.find(p => p.Cod_parcial === codParcial);
  return parcial ? parcial.Nombre_parcial : 'N/A';
  };
  
  // Obtener el nombre de la sección basado en el código
  const getNombreSeccion = (codSeccion) => {
  const seccion = listaSecciones.find(s => s.Cod_secciones === codSeccion);
  return seccion ? seccion.Nombre_seccion : 'N/A';
  };

const handleExportPDF = () => {
  const doc = new jsPDF();
  doc.text('Reporte de Actividades Académicas', 10, 10);

  const tableData = actividades.map((actividad, index) => [
    index + 1,
      actividad.Nombre_actividad_academica,
     getNombreCompletoProfesor(actividad.Cod_profesor),
     getNombreParcial(actividad.Cod_parcial),
     getNombreSeccion(actividad.Cod_secciones),
     actividad.Valor
  ]);

  doc.autoTable({
    head: [['#', 'Nombre', 'Profesor', 'Parcial', 'Sección', 'Valor']],
    body: tableData,
  });

  doc.save('actividades_academicas.pdf');
};
//=====================================EXCEl===================================
const handleExportExcel = () => {
  if (actividadesFiltradas.length === 0) {
    alert("No hay actividades para exportar con el profesor seleccionado.");
    return;
  }
  const formattedData = actividadesFiltradas.map((actividad, index) => ({
    '#': index + 1,
    'Nombre': actividad.Nombre_actividad_academica,
    'Profesor': getNombreCompletoProfesor(actividad.Cod_profesor),
    'Parcial': getNombreParcial(actividad.Cod_parcial),
    'Sección': getNombreSeccion(actividad.Cod_secciones),
    'Valor': actividad.Valor
  }));
 
  const worksheet = XLSX.utils.json_to_sheet(formattedData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Actividades');
  XLSX.writeFile(workbook, 'reporte_actividades.xlsx');
 
  };


//===========================================================================================
  return (
    <CContainer>



 {/*Contenedor del hi y boton "nuevo" */}
 <CRow className='align-items-center mb-5'>
        <CCol xs="8" md="9"> 
          {/* Titulo de la pagina */}
        <h1 className="mb-0">Actividades Académicas - Profesor </h1>
        </CCol>
     
        

      <CCol xs="4" md="3" className="text-end d-flex flex-column flex-md-row justify-content-md-end align-items-md-center">
      {/* Botón "Nuevo" alineado a la derecha */}
      {/* Botón "Nuevo" alineado a la derecha */}
      <CButton
        style={{ backgroundColor: '#4B6251', color: 'white' }} // Ajusta la altura para alinearlo con la barra de búsqueda
        className="mb-3 mb-md-0 me-md-3" // Margen inferior en pantallas pequeñas, margen derecho en pantallas grandes
        onClick={() => {setModalVisible(true); 
          setHasUnsavedChanges(false); // Resetear el estado al abrir el modal
        }}
        >

           <CIcon icon={cilPlus} /> {/* Ícono de "más" */}
            Nuevo
           </CButton>

             {/*Boton reporte */}
           <CButton
            style={{ backgroundColor: '#6C8E58', color: 'white' }}
            onClick={() => setModalPDFVisible(true)} // Abre el modal de PDF
          >
            <CIcon icon={cilDescription} /> Reporte
          </CButton>
          
     </CCol>
      </CRow>

      
     {/* Contenedor de la barra de búsqueda y el botón "Nuevo" */}
     <CRow className='align-items-center mt-4 mb-2'>
      
      {/* Barra de búsqueda */}
      <CCol xs="12" md="8" className='d-flex flex-wrap align-items-center'>
      <CInputGroup className="me-3" style={{width: '400px' }}>
        <CInputGroupText>Buscar</CInputGroupText>
        <CFormInput
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}/>

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
{/* Selector dinámico alineado completamente a la derecha */}
<CCol xs="12" md="4" className='text-md-end mt-2 mt-md-0'>
  <CInputGroup style={{ width: 'auto', display: 'inline-block', marginLeft:'40px'}}>
    <div className="d-inline-flex align-items-center">
      <span>Mostrar&nbsp;</span>
      <CFormSelect
        style={{ width: '80px', textAlign: 'center' }}
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
     

      {error && <div className="alert alert-danger">{error}</div>}

      
        <CTable striped bordered hover>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>#</CTableHeaderCell>
                <CTableHeaderCell>Nombre Actividad</CTableHeaderCell>
                
                <CTableHeaderCell>Parcial</CTableHeaderCell>
                <CTableHeaderCell>Secciones</CTableHeaderCell>
                <CTableHeaderCell>Valor</CTableHeaderCell>
                <CTableHeaderCell>Acciones</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {currentRecords.map((actividad, index) => (
                <CTableRow key={actividad.Cod_actividad_academica}>
                  <CTableDataCell>{(currentPage - 1) * recordsPerPage + index + 1}</CTableDataCell>
                  <CTableDataCell>{actividad.Nombre_actividad_academica}</CTableDataCell>
              
                  <CTableDataCell>
                    {listaParcial.find(parcial => parcial.Cod_parcial === actividad.Cod_parcial)?.Nombre_parcial || 'N/A'}
                  </CTableDataCell>
                  <CTableDataCell>
                    {listaSecciones.find(seccion => seccion.Cod_secciones === actividad.Cod_secciones)?.Nombre_seccion || 'N/A'}
                  </CTableDataCell>
                  <CTableDataCell>{actividad.Valor}</CTableDataCell>
                  <CTableDataCell>


                  <CButton
                  color="info" style={{ backgroundColor: '#F9B64E',marginRight: '10px', marginBottom: '10px' }}
                  onClick={() => {
                    setActividadToUpdate(actividad);
                    setModalUpdateVisible(true);
                  }}
                >
                  <CIcon icon={cilPen} />
                </CButton>
                <CButton
                  color="danger" style={{ marginRight: '10px', marginBottom: '10px' }}
                  onClick={() => {
                    setActividadToDelete(actividad);
                    setModalDeleteVisible(true);
                  }}
                >
                  <CIcon icon={cilTrash} />
                </CButton>
                <CButton
                  color="primary" style={{ marginRight: '10px', marginBottom: '10px' }}
                  onClick={() => {
                    setActividadToReportar(actividad);
                    setModalReporteVisible(true);
                  }}
                >
                  <CIcon icon={cilInfo} />
                </CButton>
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
        

{/* Paginación */}
      
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
            disabled={currentPage === Math.ceil(filteredActividades.length / recordsPerPage)}
            onClick={() => paginate(currentPage + 1)}>
            Siguiente
          </CButton>
        </CPagination>
        <span style={{ marginLeft: '10px' }}>
          Página {currentPage} de {Math.ceil(filteredActividades.length / recordsPerPage)}
        </span>
      </div>


{/* ================================================================================================= */}


{/*  Modal del pdf */}
<CModal visible={modalPDFVisible} onClose={() => setModalReporteVisible(false)} backdrop="static">
  <CModalHeader>
    <CModalTitle>Generar Reporte</CModalTitle>
  </CModalHeader>
  <CModalBody>
    <p>Selecciona el formato para generar el reporte:</p>

    {/* PDF Export Button */}
    <CButton
      style={{ backgroundColor: '#4B6251', color: 'white', marginBottom: '10px', width: '100%' }}
      onClick={handleExportPDF}
    >
      <CIcon icon={cilDescription} /> Descargar PDF
    </CButton>

    {/* Excel Export Button */}
    <CButton
      style={{ backgroundColor: '#6C8E58', color: 'white', width: '100%' }}
      onClick={handleExportExcel}
    >
      <CIcon icon={cilDescription} /> Descargar Excel
    </CButton>
  </CModalBody>
  <CModalFooter>
    <CButton color="secondary" onClick={() => setModalReporteVisible(false)}>Cerrar</CButton>
  </CModalFooter>
</CModal>


      
{/* Detalles Modal */}
<CModal visible={modalReporteVisible} onClose={() => setModalReporteVisible(false)} backdrop="static">
  <CModalHeader>
    <CModalTitle>Detalles de Actividad académica</CModalTitle>
  </CModalHeader>
  <CModalBody>
    <p><strong>Profesor:</strong> {getNombreCompletoProfesor(actividadToReportar.Cod_profesor)}</p>
    <p><strong>Nombre de la actividad:</strong> {actividadToReportar.Nombre_actividad_academica}</p>
          <p><strong>Descripción:</strong> {actividadToReportar.Descripcion}</p>
          <p><strong>Ponderacion:</strong> {listaponderacionesC.find(ponde => ponde.Cod_ponderacion_ciclo === actividadToReportar.Cod_ponderacion_ciclo)?.Descripcion_ponderacion || 'N/A'}</p>
          <p><strong>Parcial:</strong> {listaParcial.find(parcial => parcial.Cod_parcial === actividadToReportar.Cod_parcial)?. Nombre_parcial || 'N/A'}</p>
          <p><strong>Seccion:</strong> {listaSecciones.find (seccion => seccion.Cod_secciones === actividadToReportar.Cod_secciones)?.Nombre_seccion}</p>
          <p><strong>Fechas:</strong> {`${new Date(actividadToReportar.Fechayhora_Inicio).toLocaleString()} - ${new Date(actividadToReportar.Fechayhora_Fin).toLocaleString()}`}</p>
          <p><strong>Valor:</strong> {actividadToReportar.Valor}</p>
        </CModalBody>
  <CModalFooter>
    <CButton color="secondary" onClick={() => setModalReporteVisible(false)}>Cerrar</CButton>
  </CModalFooter>
</CModal>


     {/* Modal Crear Actividad */}
     <CModal visible={modalVisible} backdrop="static">
        <CModalHeader closeButton={false}>
          <CModalTitle>Nueva actividad académica</CModalTitle>
          <CButton className="btn-close" aria-label="Close" onClick={() => handleCloseModal( setModalVisible, resetNuevoActividad)} />
        </CModalHeader>
        <CModalBody>
          <CForm> 
           { /* Nombre de la actividad */}
           <CInputGroup className="mb-3">
              <CInputGroupText>Nombre de la actividad</CInputGroupText>
              <CFormInput
              value={nuevoActividad.Nombre_actividad_academica}
              onPaste={disableCopyPaste}
              onCopy={disableCopyPaste}
              onChange={(e) => handleInputChange(e, (value) => setNuevoActividad({ ...nuevoActividad, Nombre_actividad_academica: value }))}
              placeholder="Ingresa el nombre de la actividad"
            />
            </CInputGroup>
            
            {/* Descripcion */}
            <CInputGroup className="mb-3">
             <CInputGroupText>Descripción</CInputGroupText>
             <CFormInput
              value={nuevoActividad.Descripcion}
              onPaste={disableCopyPaste}
              onCopy={disableCopyPaste}
              onChange={(e) => handleInputChange(e, (value) => setNuevoActividad({ ...nuevoActividad, Descripcion: value }))}
              placeholder="Ingresa una descripción"
           />
            </CInputGroup>

            {/* Ponderación Ciclo */}
            <CInputGroup className="mb-3">
              <CInputGroupText>Ponderación Ciclo</CInputGroupText>
              <CFormSelect
              value={nuevoActividad.Cod_ponderacion_ciclo}
              onChange={(e) => setNuevoActividad({ ...nuevoActividad, Cod_ponderacion_ciclo: e.target.value })}
            >
              <option value="">Seleccione una Ponderación</option>
              {listaponderaciones.map((item) => (
                <option key={item.Cod_ponderacion} value={item.Cod_ponderacion}>
                  {item.Descripcion_ponderacion}
                </option>
              ))}
            </CFormSelect>
            </CInputGroup>

            {/* Parcial */}
            <CInputGroup className="mb-3">
            <CInputGroupText>Parcial</CInputGroupText>
            <CFormSelect
              value={nuevoActividad.Cod_parcial}
              onChange={(e) => setNuevoActividad({ ...nuevoActividad, Cod_parcial: e.target.value })}
            >
              <option value="">Seleccione un Parcial</option>
              {listaParcial.map((item) => (
                <option key={item.Cod_parcial} value={item.Cod_parcial}>
                  {item.Nombre_parcial}
                </option>
              ))}
            </CFormSelect>
            </CInputGroup>
            
            {/* Seccion */}
            <CInputGroup className="mb-3">
            <CInputGroupText>Sección</CInputGroupText>
            <CFormSelect
            value={nuevoActividad.Cod_secciones}
            onChange={(e) => setNuevoActividad({ ...nuevoActividad, Cod_secciones: e.target.value })}
            >
              <option value="">Seleccione una Sección</option>
              {listaSecciones.map((item) => (
                <option key={item.Cod_secciones} value={item.Cod_secciones}>
                  {item.Nombre_seccion}
                </option>
              ))}
            </CFormSelect>
            </CInputGroup>

             {/* Fecha y hora inicio */}
             <CInputGroup className="mb-3">
             <CInputGroupText>Fecha y Hora de Inicio</CInputGroupText>
             <CFormInput
              type="datetime-local"
              value={nuevoActividad.Fechayhora_Inicio}
              onChange={(e) => setNuevoActividad({ ...nuevoActividad, Fechayhora_Inicio: e.target.value })}
            />
            </CInputGroup>

            {/* Fecha y hora fin */}
            <CInputGroup className="mb-3">
            <CInputGroupText>Fecha y Hora de Fin</CInputGroupText>
            <CFormInput
              type="datetime-local"
              value={nuevoActividad.Fechayhora_Fin}
              onChange={(e) => setNuevoActividad({ ...nuevoActividad, Fechayhora_Fin: e.target.value })}
            />
            </CInputGroup>

            {/* Valor*/}
            <CInputGroup className="mb-3">
            <CInputGroupText>Valor</CInputGroupText>
            <CFormInput
              type="number"
              value={nuevoActividad.Valor}
              onChange={(e) => {const value = e.target.value; // Obtener el valor del input
                const floatValue = parseFloat(value); // Convertir a número flotante
      
                // Validar que el valor esté en el rango de 1 a 100 con hasta dos decimales
                const isValid = /^\d{1,2}(\.\d{1,2})?$|^100(\.0{1,2})?$/.test(value);
      
                if (!isValid || floatValue < 1 || floatValue > 100) {
                  Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'El valor debe estar entre 1 y 100, con hasta dos decimales.',
                  });
                setNuevoActividad({ ...nuevoActividad, Valor: e.target.value });
                return; // Salir de la función para evitar actualizar el estado
              }
    
              // Si el valor es válido, actualizar el estado
              setNuevoActividad({ ...nuevoActividad, Valor: value });
            }}
            placeholder="Ingresa el valor de la actividad"
            step="0.01" // Permite hasta dos decimales
            />
            </CInputGroup>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => handleCloseModal (setModalVisible, resetNuevoActividad)}>
            Cancelar</CButton>
          <CButton color="primary" style={{backgroundColor: '#4B6251', color: 'white' }} onClick={handleCreateActividad}>
            <CIcon icon={cilSave} style={{ marginRight: '5px' }} /> Guardar
          </CButton>
        </CModalFooter>
      </CModal>

      
           {/* Modal Actualizar Actividad */}
<CModal visible={modalUpdateVisible} backdrop="static">
  <CModalHeader closeButton={false}>
    <CModalTitle>Actualizar Actividad Académica</CModalTitle>
    <CButton className="btn-close" aria-label="Close"  onClick={() => handleCloseModal(setModalUpdateVisible, resetNuevoActividad)} />
  </CModalHeader> 
  <CModalBody>
    <CForm>

     {/* Nombre de la actividad */}
      <CInputGroup className="mb-3">
        <CInputGroupText>Nombre de la actividad</CInputGroupText>
        <CFormInput
        type="text"
        value={actividadToUpdate.Nombre_actividad_academica}
        onPaste={disableCopyPaste}
        onCopy={disableCopyPaste}
        onChange={(e) => handleInputChange(e, (value) => setActividadToUpdate({ ...actividadToUpdate, Nombre_actividad_academica: value }))}
      />
      </CInputGroup>

     {/* Descripcion */}
     <CInputGroup className="mb-3">
      <CInputGroupText>Descripcion</CInputGroupText>
      <CFormInput
        type="text"
        value={actividadToUpdate.Descripcion}
        onPaste={disableCopyPaste}
        onCopy={disableCopyPaste}
        onChange={(e) => handleInputChange(e, (value) => setActividadToUpdate({ ...actividadToUpdate, Descripcion: value }))}
      />
      </CInputGroup>  

    {/* Select para ponderacion ciclo */}
    <CInputGroup className="mb-3">
        <CInputGroupText>Ponderación ciclo</CInputGroupText>
       <CFormSelect
        value={actividadToUpdate.Cod_ponderacion_ciclo}
        onChange={(e) => setActividadToUpdate({ ...actividadToUpdate, Cod_ponderacion_ciclo: e.target.value })}
      >
        <option value="">Seleccione una ponderación</option>
        {listaponderaciones.map(ponderacion => (
          <option key={ponderacion.Cod_ponderacion} value={ponderacion.Cod_ponderacion}>
            {ponderacion.Descripcion_ponderacion} 
          </option>
        ))}
      </CFormSelect>
      </CInputGroup>

      {/* Select para Parcial */}
      <CInputGroup className="mb-3">
        <CInputGroupText>Parcial</CInputGroupText>
        <CFormSelect
        value={actividadToUpdate.Cod_parcial}
        onChange={(e) => setActividadToUpdate({ ...actividadToUpdate, Cod_parcial: e.target.value })}
      >
        <option value="">Seleccione un parcial</option>
        {listaParcial.map(parcial => (
          <option key={parcial.Cod_parcial} value={parcial.Cod_parcial}>
            {parcial.Nombre_parcial} {/* Cambia esto según el campo que contenga la descripción */}
          </option>
        ))}
      </CFormSelect>
      </CInputGroup>

      {/* Select para seccion */}
      <CInputGroup className="mb-3">
        <CInputGroupText>Seccion</CInputGroupText>
        <CFormSelect
        value={actividadToUpdate.Cod_secciones}
        onChange={(e) => setActividadToUpdate({ ...actividadToUpdate, Cod_secciones: e.target.value })}
      >
        <option value="">Seleccione una sección</option>
        {listaSecciones.map(seccion => (
          <option key={seccion.Cod_secciones} value={seccion.Cod_secciones}>
            {seccion.Nombre_seccion} {/* Cambia esto según el campo que contenga el nombre de la sección */}
          </option>
        ))}
      </CFormSelect>
      </CInputGroup>


      {/* Fecha y hora inicio */}
      <CInputGroup className="mb-3">
      <CInputGroupText>Fecha y hora inicio</CInputGroupText>
      <CFormInput
        type="datetime-local"
        value={actividadToUpdate.Fechayhora_Inicio}
        onChange={(e) => setActividadToUpdate({ ...actividadToUpdate, Fechayhora_Inicio: e.target.value })}
      />
      </CInputGroup>

      {/* Fecha y hora Fin */}
      <CInputGroup className="mb-3">
      <CInputGroupText>Fecha y Hora de Fin</CInputGroupText>
      <CFormInput
        type="datetime-local"
        value={actividadToUpdate.Fechayhora_Fin}
        onChange={(e) => setActividadToUpdate({ ...actividadToUpdate, Fechayhora_Fin: e.target.value })}
      />
      </CInputGroup>

      {/* Valor */}
      <CInputGroup className="mb-3">
      <CInputGroupText>Valor</CInputGroupText>
      <CFormInput
        type="number"
        value={actividadToUpdate.Valor}
        onChange={(e) => {
          const value = e.target.value; // Obtener el valor del input
          const floatValue = parseFloat(value); // Convertir a número flotante

          // Validar que el valor esté en el rango de 1 a 100 con hasta dos decimales
          const isValid = /^\d{1,2}(\.\d{1,2})?$|^100(\.0{1,2})?$/.test(value);

          if (!isValid || floatValue < 1 || floatValue > 100) {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'El valor debe estar entre 1 y 100, con hasta dos decimales.',
            });
          setActividadToUpdate({ ...actividadToUpdate, Valor: value });// Limpiar el campo si la validación falla
          return; // Salir de la función para evitar actualizar el estado
        }

        // Si el valor es válido, actualizar el estado
        setActividadToUpdate({ ...actividadToUpdate, Valor: value });
      }}
      placeholder="Ingresa el valor de la actividad"
      step="0.01" // Permite hasta dos decimales
      />
      </CInputGroup>
    </CForm>
  </CModalBody>
  <CModalFooter>
    <CButton color="secondary" onClick={() => handleCloseModal(setModalUpdateVisible,resetActividadToUpdate)}>
      Cerrar</CButton>
    <CButton style={{  backgroundColor: '#F9B64E',color: 'white' }} onClick={handleUpdateActividad}>
    <CIcon icon={cilPen} style={{ marginRight: '5px' }} /> Actualizar</CButton>
  </CModalFooter>
</CModal>

      {/* Modal Eliminar Actividad */}
      <CModal visible={modalDeleteVisible} onClose={() => setModalDeleteVisible(false)}>
        <CModalHeader>
          <CModalTitle>Eliminar Actividad</CModalTitle>
        </CModalHeader>
        <CModalBody>¿Estás seguro de que deseas eliminar esta actividad?</CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setModalDeleteVisible(false)}>Cancelar</CButton>
          <CButton color="danger" onClick={handleDeleteActividad}>Eliminar</CButton>
        </CModalFooter>
      </CModal>
    </CContainer>
  );
};

export default ListaActividadesAcaVistaProfesores;
