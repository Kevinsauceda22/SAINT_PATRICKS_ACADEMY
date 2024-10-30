import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { CIcon } from '@coreui/icons-react';
import { cilSearch, cilBrushAlt, cilPen, cilTrash, cilPlus, cilSave,cilDescription } from '@coreui/icons'; // Importar iconos específicos
import swal from 'sweetalert2';
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

const ListaEspecialidades = () => {
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
{/*Boton reporte */}
<CButton
style={{backgroundColor:'#6C8E58', color: 'white'}}
>
  <CIcon icon={cilDescription} /> Reporte
</CButton>
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
                <CButton
                  style={{ backgroundColor: '#E57368', marginRight: '10px' }}
                  onClick={() => {
                    setEspecialidadToDelete(especialidades);
                    setModalDeleteVisible(true);
                  }}
                >
                  <CIcon icon={cilTrash} />
                </CButton>
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



