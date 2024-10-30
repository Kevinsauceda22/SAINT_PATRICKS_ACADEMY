import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { CIcon } from '@coreui/icons-react';
import { cilSearch, cilBrushAlt, cilPen, cilTrash, cilPlus, cilSave,cilDescription } from '@coreui/icons'; // Importar iconos específicos
import Swal from 'sweetalert2';
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
  CFormSelect,
  CRow,
  CCol,
} from '@coreui/react';


const ListaPonderaciones = () => {
  const [Ponderaciones, setPonderaciones] = useState([]);
  const [modalVisible, setModalVisible] = useState(false); // Estado para el modal de crear ponderaciones
  const [modalUpdateVisible, setModalUpdateVisible] = useState(false); // Estado para el modal de actualizar ponderaciones
  const [modalDeleteVisible, setModalDeleteVisible] = useState(false); // Estado para el modal de eliminar ponderaciones
  const [nuevaPonderacion, setNuevaPonderacion] = useState(''); // Estado para la nueva ponderacion
  const [ponderacionToUpdate, setPonderacionToUpdate] = useState({}); // Estado para la ponderacion a actualizar
  const [ponderacionToDelete, setPonderacionToDelete] = useState({}); // Estado para la ponderacion a eliminar
  const [recordsPerPage, setRecordsPerPage] = useState(5); // Hacer dinámico el número de registros por página
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1); // Estado para la página actual
  const inputRef = useRef(null); // Referencia para el input
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false); // Estado para detectar cambios sin guardar

  useEffect(() => {
    fetchPonderacion();
  }, []);

  const fetchPonderacion = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/ponderaciones/verPonderaciones');
      const data = await response.json();
      // Asignar un índice original basado en el orden en la base de datos
      const dataWithIndex = data.map((ponderacion, index) => ({
        ...ponderacion,
        originalIndex: index + 1, // Guardamos la secuencia original
      }));

      setPonderaciones(dataWithIndex);
    } catch (error) {
      console.error('Error al obtener las Ponderaciones:', error);
    }
  };

  const validarPonderacion = () => {
    const nombrePonderacion = typeof nuevaPonderacion === 'string' ? nuevaPonderacion : nuevaPonderacion.Descripcion_ponderacion;
  
    // Comprobación de vacío
    if (!nombrePonderacion || nombrePonderacion.trim() === '') {
      Swal.fire('Error', 'El campo "Descripción de la Ponderación" no puede estar vacío', 'error');
      return false;
    }
  
    // Verificar si el nombre del ciclo ya existe
    const ponderacionExistente = Ponderaciones.some(
      (ponderacion) => ponderacion.Descripcion_ponderacion.toLowerCase() === nombrePonderacion.toLowerCase()
    );
  
    if (ponderacionExistente) {
      Swal.fire('Error', `La ponderación "${nombrePonderacion}" ya existe`, 'error');
      return false;
    }
  
    return true;
  };


  const validarPonderacionUpdate = () => {
    if (!ponderacionToUpdate.Descripcion_ponderacion) {
      Swal.fire('Error',  'El campo "Descripción de la Ponderación" no puede estar vacío', 'error');
      return false;
    }
    // Verificar si el nombre del ciclo ya existe (excluyendo el ciclo actual que se está editando)
    const ponderacionExistente = Ponderaciones.some(
      (ponderacion) =>
        ponderacion.Descripcion_ponderacion.toLowerCase() === ponderacionToUpdate.Descripcion_ponderacion.toLowerCase() &&
        ponderacion.Cod_ponderacion !== ponderacionToUpdate.Cod_ponderacion
    );

    if (ponderacionExistente) {
      Swal.fire('Error', `La ponderación "${ponderacionToUpdate.Descripcion_ponderacion}" ya existe`, 'error');
      return false;
    }

    return true;
  };

  // Función para manejar cambios en el input
  const handleInputChange = (e, setFunction) => {
    const input = e.target;
    const cursorPosition = input.selectionStart; // Guarda la posición actual del cursor
    let value = input.value
      .toUpperCase() // Convertir a mayúsculas
      .trimStart(); // Evitar espacios al inicio

    const regex = /^[A-ZÑ\s]*$/; // Solo letras y espacios

    // Verificar si hay múltiples espacios consecutivos antes de reemplazarlos
    if (/\s{2,}/.test(value)) {
      Swal.fire({
        icon: 'warning',
        title: 'Espacios múltiples',
        text: 'No se permite más de un espacio entre palabras.',
      });
      value = value.replace(/\s+/g, ' '); // Reemplazar múltiples espacios por uno solo
    }

    // Validar solo letras y espacios
    if (!regex.test(value)) {
      Swal.fire({
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
  const disableCopyPaste = (e) => {
    e.preventDefault();
    Swal.fire({
      icon: 'warning',
      title: 'Acción bloqueada',
      text: 'Copiar y pegar no está permitido.',
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

  const resetNuevaPonderacion = () => setNuevaPonderacion('');
  const resetPonderaciontoUpdate= () => setPonderacionToUpdate('');




  const handleCreatePonderacion = async () => {
    if (!validarPonderacion()) return;
    try {
      const response = await fetch('http://localhost:4000/api/ponderaciones/crearPonderacion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({Descripcion_ponderacion : nuevaPonderacion}),
      });

      if (response.ok) {
        fetchPonderacion();
        setModalVisible(false);
        resetNuevaPonderacion();
        setHasUnsavedChanges(false);
        
        Swal.fire('¡Éxito!', 'La ponderacion se ha creado correctamente', 'success');
      } else {
        Swal.fire('Error', 'Hubo un problema al crear la ponderacion', 'error');
      }
    } catch (error) {
      Swal.fire('Error', 'Hubo un problema al crear la ponderacion', 'error');
    }
  };

  const handleUpdatePonderacion = async () => {
    if (!validarPonderacionUpdate()) return;
    try {
      const response = await fetch('http://localhost:4000/api/ponderaciones/actualizarPonderacion', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ Cod_ponderacion: ponderacionToUpdate.Cod_ponderacion, Descripcion_ponderacion: ponderacionToUpdate.Descripcion_ponderacion }), // Envío del nombre actualizado y Cod_ponderacion en el cuerpo
      });

      if (response.ok) {
        fetchPonderacion(); // Refrescar la lista de ponderaciones después de la actualización
        setModalUpdateVisible(false); // Cerrar el modal de actualización
        resetPonderaciontoUpdate();
        setHasUnsavedChanges(false);
        Swal.fire('¡Éxito!', 'La ponderacion se ha actualizado correctamente', 'success');
      } else {
        Swal.fire('Error', 'Hubo un problema al actualizar la ponderacion', 'error');
      }
    /*  if (!ponderacionToUpdate.Descripcion_ponderacion) {
        Swal.fire('Error', 'La Descripcion de la ponderacion es obligatorio', 'error');
        return false;
      }*/
    } catch (error) {
      Swal.fire('Error', 'Hubo un problema al actualizar la ponderacion', 'error');
    }
  };

  const handleDeletePonderacion = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/ponderaciones/eliminarPonderacion', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ Cod_ponderacion: ponderacionToDelete.Cod_ponderacion }), // Enviar Cod_ponderacion en el cuerpo
      });

      if (response.ok) {
        fetchPonderacion();
        setModalDeleteVisible(false); // Cerrar el modal de confirmación
        setPonderacionToDelete({}); // Resetear la ponderacion a eliminar
        Swal.fire('¡Éxito!', 'La ponderacion se ha eliminado correctamente', 'success');
      } else {
        Swal.fire('Error', 'La ponderacion ya pertenece a un grado', 'error');
      }
    } catch (error) {
      Swal.fire('Error', 'Hubo un problema al eliminar la ponderacion', 'error');
    }
  };

  const openUpdateModal = (ponderacion) => {
    setPonderacionToUpdate(ponderacion); // Cargar los datos de la ponderacion a actualizar
    setModalUpdateVisible(true); // Abrir el modal de actualización
    setHasUnsavedChanges(false);
  };

  const openDeleteModal = (ponderacion) => {
    setPonderacionToDelete(ponderacion); // Guardar la ponderacion que se desea eliminar
    setModalDeleteVisible(true); // Abrir el modal de confirmación
  };

 // Cambia el estado de la página actual después de aplicar el filtro
  // Validar el buscador
  const handleSearch = (event) => {
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
    setSearchTerm(input);
    setCurrentPage(1); // Resetear a la primera página al buscar
  };


// Filtro de búsqueda
const filteredPonderaciones = Ponderaciones.filter((ponderacion) =>
  ponderacion.Descripcion_ponderacion.toLowerCase().includes(searchTerm.toLowerCase())
);

// Lógica de paginación
const indexOfLastRecord = currentPage * recordsPerPage;
const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
const currentRecords = filteredPonderaciones.slice(indexOfFirstRecord, indexOfLastRecord);

// Cambiar página
const paginate = (pageNumber) => {
if (pageNumber > 0 && pageNumber <= Math.ceil(filteredPonderaciones.length / recordsPerPage)) {
  setCurrentPage(pageNumber);
}
}

  return (
    <CContainer>
  <CRow className="align-items-center mb-5">
      <CCol xs="8" md="9">
        {/* Título de la página */}
        <h1 className="mb-0">Mantenimiento Ponderaciones</h1>
      </CCol>
      <CCol xs="4" md="3" className="text-end d-flex flex-column flex-md-row justify-content-md-end align-items-md-center">
        {/* Botón Nuevo para abrir el modal */}
        <CButton 
          style={{ backgroundColor: '#4B6251', color: 'white' }} 
          className="mb-3 mb-md-0 me-md-3" // Margen inferior en pantallas pequeñas, margen derecho en pantallas grandes
          onClick={() => {setModalVisible(true);
            setHasUnsavedChanges(false);}}
        >
          <CIcon icon={cilPlus} /> Nuevo
        </CButton>

        {/* Botón de Reporte */}
        <CButton 
          style={{ backgroundColor: '#6C8E58', color: 'white' }}
        >
          <CIcon icon={cilDescription} /> Reporte
        </CButton>
      </CCol>
    </CRow>

    {/* Contenedor de la barra de búsqueda y el selector dinámico */}
    <CRow className="align-items-center mt-4 mb-2">
      {/* Barra de búsqueda  */}
      <CCol xs="12" md="8" className="d-flex flex-wrap align-items-center">
        <CInputGroup className="me-3" style={{ width: '400px' }}>
          <CInputGroupText>
            <CIcon icon={cilSearch} />
          </CInputGroupText>
          <CFormInput
            placeholder="Buscar Ponderacion..."
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


    {/* Tabla para mostrar ponderaciones */}
    {/* Contenedor de tabla con scroll */}
    <div className="table-container" style={{ maxHeight: '400px', overflowY: 'scroll', marginBottom: '20px' }}>
        <CTable striped bordered hover>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell style={{ width: '50px' }}>#</CTableHeaderCell>
              <CTableHeaderCell style={{ width: '50px' }}>Descripcion de la Ponderacion</CTableHeaderCell>
              <CTableHeaderCell style={{ width: '50px' }}>Acciones</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {currentRecords.map((ponderacion) => (
              <CTableRow key={ponderacion.Cod_ponderacion}>
                <CTableDataCell>
                  {/* Mostrar el índice original en lugar del índice basado en la paginación */}
                  {ponderacion.originalIndex} 
                </CTableDataCell>
                <CTableDataCell>{ponderacion.Descripcion_ponderacion}</CTableDataCell>
                <CTableDataCell>
                  <CButton style={{ backgroundColor: '#F9B64E',marginRight: '10px' }} onClick={() => openUpdateModal(ponderacion)}>
                    <CIcon icon={cilPen} />
                  </CButton>
                  <CButton style={{ backgroundColor: '#E57368', marginRight: '10px' }} onClick={() => openDeleteModal(ponderacion)}>
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
          disabled={currentPage === 1} // Desactiva si es la primera página
          onClick={() => paginate(currentPage - 1)} // Páginas anteriores
        >
          Anterior
        </CButton>
        <CButton
          style={{ marginLeft: '10px', backgroundColor: '#6f8173', color: '#D9EAD3' }}
          disabled={currentPage === Math.ceil(filteredPonderaciones.length / recordsPerPage)} // Desactiva si es la última página
          onClick={() => paginate(currentPage + 1)} // Páginas siguientes
        >
          Siguiente
        </CButton>
      </CPagination>
      <span style={{ marginLeft: '10px' }}>
        Página {currentPage} de {Math.ceil(filteredPonderaciones.length / recordsPerPage)}
      </span>
    </div>


      {/* Modal para crear una nueva Ponderacion */}
      <CModal visible={modalVisible} backdrop="static">
        <CModalHeader closeButton={false}>
          <CModalTitle>Nueva Ponderación</CModalTitle>
          <CButton className="btn-close" aria-label="Close" onClick={() => handleCloseModal(setModalVisible, resetNuevaPonderacion)} />

        </CModalHeader>
        <CModalBody>
          <CForm>
            <CInputGroup className="mb-3">
            <CInputGroupText>Descripción de la Ponderación</CInputGroupText>
            <CFormInput
            ref={inputRef}
            type="text"
            placeholder="Ingrese una descripción de la ponderación"
            maxLength={50}
            onPaste={disableCopyPaste}
            onCopy={disableCopyPaste}
            value={nuevaPonderacion}
            onChange={(e) => handleInputChange(e, setNuevaPonderacion)}
          />
            </CInputGroup>
          </CForm>
        </CModalBody>
        <CModalFooter>
        <CButton color="secondary" onClick={() => handleCloseModal(setModalVisible, resetNuevaPonderacion)}>
            Cancelar
          </CButton>
          <CButton style={{ backgroundColor: '#4B6251',color: 'white' }} onClick={handleCreatePonderacion}>
          <CIcon icon={cilSave} style={{ marginRight: '5px' }} />Guardar
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Modal para actualizar una Ponderacion */}
      <CModal visible={modalUpdateVisible} backdrop="static">
      <CModalHeader closeButton={false}>
          <CModalTitle>Actualizar Ponderación</CModalTitle>
          <CButton className="btn-close" aria-label="Close" onClick={() => handleCloseModal(setModalUpdateVisible, resetPonderaciontoUpdate)} />
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CInputGroup className="mb-3">
              <CInputGroupText>Descripción de la Ponderación</CInputGroupText>
              <CFormInput
              ref={inputRef}
              maxLength={50}
              onPaste={disableCopyPaste}
              onCopy={disableCopyPaste}
              placeholder="Ingrese la nueva descripción de la ponderación"
              value={ponderacionToUpdate.Descripcion_ponderacion}
              onChange={(e) => handleInputChange(e, (value) => setPonderacionToUpdate({
                ...ponderacionToUpdate,
                Descripcion_ponderacion: value,
              }))}
            />
            </CInputGroup>
          </CForm>
        </CModalBody>
        <CModalFooter>
        <CButton color="secondary" onClick={() => handleCloseModal(setModalUpdateVisible, resetPonderaciontoUpdate)}>
            Cancelar
          </CButton>
          <CButton style={{  backgroundColor: '#F9B64E',color: 'white' }} onClick={handleUpdatePonderacion}>
          <CIcon icon={cilPen} style={{ marginRight: '5px' }} /> Actualizar
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Modal para eliminar una ponderacion */}
      <CModal visible={modalDeleteVisible} onClose={() => setModalDeleteVisible(false)} backdrop="static">
        <CModalHeader>
          <CModalTitle>Confirmar Eliminación</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <p>¿Estás seguro de que deseas eliminar la ponderacion:  <strong>{ponderacionToDelete.Descripcion_ponderacion}</strong>?</p>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setModalDeleteVisible(false)}>
            Cancelar
          </CButton>
          <CButton style={{  backgroundColor: '#E57368',color: 'white' }} onClick={handleDeletePonderacion}>
          <CIcon icon={cilTrash} style={{ marginRight: '5px' }} />Eliminar 
          </CButton>
        </CModalFooter>
      </CModal>
    </CContainer>
  );
};


export default ListaPonderaciones;