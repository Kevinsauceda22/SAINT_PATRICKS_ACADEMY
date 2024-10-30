
import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { CIcon } from '@coreui/icons-react';
import { cilSearch, cilBrushAlt, cilPen, cilTrash, cilPlus, cilSave,cilDescription } from '@coreui/icons'; // Importar iconos específicos
import swal from 'sweetalert2';
import { left } from '@popperjs/core';
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


const ListaGradoAcademico = () => {
  const [gradosAcademicos, setGradosAcademicos] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalUpdateVisible, setModalUpdateVisible] = useState(false);
  const [modalDeleteVisible, setModalDeleteVisible] = useState(false);
  const [nuevoGrado, setNuevoGrado] = useState({ Descripcion: '' });
  const [gradoToUpdate, setGradoToUpdate] = useState({});
  const [gradoToDelete, setGradoToDelete] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1); // Estado para la página actual
  const [recordsPerPage,setRecordsPerPage] = useState(5); // Mostrar 5 registros por página
  const inputRef = useRef(null); // referencia para el input
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false); // Estado para detectar cambios sin guardar

  useEffect(() => {
    fetchGradosAcademicos();
  }, []);



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
          closeFunction(false);     // Cerrar el modal
          resetFields();            // Limpiar los campos
          setHasUnsavedChanges(false); // Resetear el indicador de cambios no guardados
        }
      });
    } else {
      closeFunction(false);         // Cerrar el modal directamente
      resetFields();                // Limpiar los campos
      setHasUnsavedChanges(false);  // Resetear el indicador de cambios no guardados
    }
  };
  
  // Funciones auxiliares para resetear los campos específicos de cada modal
  const resetNuevoGrado = () => setNuevoGrado({ Descripcion: '' });
  const resetgradoToUpdate = () => setGradoToUpdate({});
  
  

  const fetchGradosAcademicos = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/gradosAcademicos/verGradosAcademicos');
      const data = await response.json();
     // Asignar un índice original basado en el orden en la base de datos
    const dataWithIndex = data.map((gradosAcademicos, index) => ({
      ...gradosAcademicos,
      originalIndex: index + 1, // Guardamos la secuencia original
    }));
    
    setGradosAcademicos(dataWithIndex);
    } catch (error) {
      console.error('Error al obtener los grados académicos:', error);
    }
  };

const handleCreateGrado = async () => {
  if (!nuevoGrado.Descripcion.trim()) {
    // Mostrar mensaje de error con SweetAlert si el campo está vacío
    swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'El campo "Grado académico" no puede estar vacío',
    });
    return;
  }

  // Verificar si ya existe una especialidad con la misma descripción
  const especialidadDuplicada = gradosAcademicos.some(
    (grado) => grado.Descripcion.toLowerCase() === nuevoGrado.Descripcion.toLowerCase()
  );

  if (especialidadDuplicada) {
    // Mostrar mensaje de error con SweetAlert si la GA ya existe
    swal.fire({
      icon: 'error',
      title: 'Error',
      text: `El grado academico "${nuevoGrado.Descripcion}" ya existe`,
    });
    return;
  }

  try {
    const response = await fetch('http://localhost:4000/api/gradosAcademicos/crearGradoAcademico', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(nuevoGrado),
    });

    if (response.ok) {
      fetchGradosAcademicos();
      setModalVisible(false);
      resetNuevoGrado();
      setHasUnsavedChanges(false)
      setNuevoGrado({ Descripcion: '' });

      // Mostrar mensaje de éxito con SweetAlert
      swal.fire({
        icon: 'success',
        title: '¡Éxito!',
        text: 'El grado académico se ha creado correctamente',
      });
    } else {
      console.error('Hubo un problema al crear el grado académico:', response.statusText);
    }
  } catch (error) {
    console.error('Hubo un problema al crear el grado académico:', error);
  }
};

const handleUpdateGrado = async () => {
  if (!gradoToUpdate.Descripcion.trim()) {
    // Mostrar mensaje de error con SweetAlert si el campo está vacío
    swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'El campo "Grado académico" no puede estar vacío',
    });
    return;
  }

  // Verificar si ya existe una especialidad con la misma descripción
  const especialidadDuplicada = gradosAcademicos.some(
    (grado) => 
      grado.Descripcion.toLowerCase() === gradoToUpdate.Descripcion.toLowerCase() &&
      grado.Cod_grado_academico !== gradoToUpdate.Cod_grado_academico
  );

  if (especialidadDuplicada) {
    // Mostrar mensaje de error con SweetAlert si la especialidad ya existe
    swal.fire({
      icon: 'error',
      title: 'Error',
      text: `El grado academico "${gradoToUpdate.Descripcion}" ya existe`,
    });
    return;
  }

  try {
    const response = await fetch('http://localhost:4000/api/gradosAcademicos/actualizarGradoAcademico', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(gradoToUpdate),
    });

    if (response.ok) {
      fetchGradosAcademicos();
      setModalUpdateVisible(false);
      setGradoToUpdate();
      setHasUnsavedChanges(false);// reiciniar el estado de cambios no guardados 
      setGradoToUpdate({});

      // Mostrar mensaje de éxito con SweetAlert
      swal.fire({
        icon: 'success',
        title: '¡Éxito!',
        text: 'El grado académico se ha actualizado correctamente',
      });
    } else {
      console.error('Hubo un problema al actualizar el grado académico:', response.statusText);
    }
  } catch (error) {
    console.error('Hubo un problema al actualizar el grado académico:', error);
  }
};

  const handleDeleteGrado = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/gradosAcademicos/eliminarGradoAcademico', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ Cod_grado_academico: gradoToDelete.Cod_grado_academico }),
      });

      if (response.ok) {
        fetchGradosAcademicos();
        setModalDeleteVisible(false);
        setGradoToDelete({});
        swal.fire({
          icon: 'success',
          title: '¡Éxito!',
          text: 'El grado académico se ha eliminado correctamente',
        });
      } else {
        console.error('Hubo un problema al eliminar el grado académico', response.statusText);
      }
    } catch (error) {
      console.error('Hubo un problema al eliminar el grado académico', error);
    }
  };

  // Filtro de búsqueda
  const filteredGradosAcademicos = gradosAcademicos.filter((gradosAcademicos) =>
    gradosAcademicos.Descripcion.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Lógica de paginación
 const indexOfLastRecord = currentPage * recordsPerPage;
 const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
 const currentRecords = filteredGradosAcademicos.slice(indexOfFirstRecord, indexOfLastRecord);


 // Cambiar página
const paginate = (pageNumber) => {
  if (pageNumber > 0 && pageNumber <= Math.ceil(filteredGradosAcademicos.length / recordsPerPage)) {
    setCurrentPage(pageNumber);
  }
}
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
      <h1 className="mb-0">Mantenimiento Grados Académicos</h1>
      </CCol>

      <CCol xs="4" md="3" className="text-end d-flex flex-column flex-md-row justify-content-md-end align-items-md-center">
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
        <CInputGroup className="me-3" style={{width: '400px' }}>
        <CInputGroupText>
           <CIcon icon={cilSearch} /> 
        </CInputGroupText>
        <CFormInput placeholder="Buscar grado academico..."
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

   
{/* Tabla para mostrar grado academico  */}
    <div className="table-container" style={{ maxHeight: '400px', overflowY: 'scroll', marginBottom: '20px' }}>
      <CTable striped bordered hover>
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell>#</CTableHeaderCell>
            <CTableHeaderCell>Grado academico</CTableHeaderCell>
            <CTableHeaderCell>Acciones</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {currentRecords.map((gradosAcademicos, index) => (
            <CTableRow key={gradosAcademicos.Cod_grado_academico}>
              <CTableDataCell>{/* Mostrar el índice original en lugar del índice basado en la paginación */}
                  {gradosAcademicos.originalIndex} 
                </CTableDataCell>
              <CTableDataCell>{gradosAcademicos.Descripcion}</CTableDataCell>
              <CTableDataCell>
                <CButton
                  style={{ backgroundColor: '#F9B64E',marginRight: '10px' }}
                  onClick={() => {
                    setGradoToUpdate(gradosAcademicos);
                    setModalUpdateVisible(true);
                    setHasUnsavedChanges(false); // Resetear el estado al abrir el modal
                  }}
                >
                  <CIcon icon={cilPen} />
                </CButton>
                <CButton
                  style={{ backgroundColor: '#E57368', marginRight: '10px' }}
                  onClick={() => {
                    setGradoToDelete(gradosAcademicos);
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
          disabled={currentPage === Math.ceil(filteredGradosAcademicos.length / recordsPerPage)} // Deshabilitar si estás en la última página
          onClick={() => paginate(currentPage + 1)}>
          Siguiente
       </CButton>
     </CPagination>
      {/* Mostrar total de páginas */}
      <span style={{ marginLeft: '10px' }}>
        Página {currentPage} de {Math.ceil(filteredGradosAcademicos.length / recordsPerPage)}
      </span>
   </div>

      {/* Modal Crear */}
      <CModal visible={modalVisible} backdrop="static">
        <CModalHeader closeButton={false}>
          <CModalTitle>Nuevo Grado Académico</CModalTitle>
          <CButton className="btn-close" aria-label="Close" onClick={() => handleCloseModal(setModalVisible, resetNuevoGrado)} /> 
          </CModalHeader>
        <CModalBody>
        <CForm>
          <CInputGroup className="mb-3">
            <CInputGroupText>Grado académico</CInputGroupText>
            <CFormInput
             ref={inputRef}  // Asignar la referencia al input
            type="text"
              placeholder="Ingrese el grado académico"
              value={nuevoGrado.Descripcion} 
              maxLength={50} // Limitar a 50 caracteres
              onPaste={disableCopyPaste}
              onCopy={disableCopyPaste}
              onChange={(e) => handleInputChange (e, (value) => setNuevoGrado({ ...nuevoGrado, Descripcion: value }))}
            />
          </CInputGroup>
          </CForm>
        </CModalBody>
        <CModalFooter>
        <CButton color="secondary" onClick={() => handleCloseModal(setModalVisible, resetNuevoGrado)}>
            Cancelar
          </CButton>
          <CButton style={{ backgroundColor: '#4B6251',color: 'white' }} onClick={handleCreateGrado}>
          <CIcon icon={cilSave} style={{ marginRight: '5px' }} />Guardar
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Modal Actualizar */}
      <CModal visible={modalUpdateVisible} backdrop="static">
        <CModalHeader closeButton={false}>
          <CModalTitle>Actualizar Grado Académico</CModalTitle> 
          <CButton className="btn-close" aria-label="Close" onClick={() => handleCloseModal(setModalUpdateVisible, resetNuevoGrado)} />
        </CModalHeader>
        <CModalBody>
        <CForm>
          <CInputGroup className="mb-3">
            <CInputGroupText>Grado académico</CInputGroupText>
            <CFormInput
            ref={inputRef} // Asignar la referencia al input
              value={gradoToUpdate.Descripcion || ''}
              maxLength={50} // Limitar a 50 caracteres
              onPaste={disableCopyPaste}
              onCopy={disableCopyPaste}
              onChange={(e) => handleInputChange (e, (value)=> setGradoToUpdate({ ...gradoToUpdate, Descripcion: value }))}
            />
          </CInputGroup>
          </CForm>
        </CModalBody>
        <CModalFooter>
        <CButton color="secondary" onClick={() => handleCloseModal(setModalUpdateVisible, resetgradoToUpdate)}>
            Cancelar
          </CButton>
          <CButton style={{  backgroundColor: '#F9B64E',color: 'white' }} onClick={handleUpdateGrado}>
          <CIcon icon={cilPen} style={{ marginRight: '5px' }} />Actualizar
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Modal Eliminar */}
      <CModal visible={modalDeleteVisible} onClose={() => setModalDeleteVisible(false)} backdrop="static">
        <CModalHeader>
          <CModalTitle>Eliminar Grado Académico</CModalTitle>
        </CModalHeader>
        <CModalBody>
          ¿Estás seguro de que deseas eliminar el grado académico: <strong>{gradoToDelete.Descripcion}</strong>?
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setModalDeleteVisible(false)}>
            Cancelar
          </CButton>
          <CButton style={{  backgroundColor: '#E57368',color: 'white' }} onClick={handleDeleteGrado}>
          <CIcon icon={cilTrash} style={{ marginRight: '5px' }} /> Eliminar 
          </CButton>
        </CModalFooter>
      </CModal>
    </CContainer>
  );
};

export default ListaGradoAcademico;
