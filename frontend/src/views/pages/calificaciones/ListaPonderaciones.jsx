import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CIcon } from '@coreui/icons-react';
import { cilPen, cilTrash, cilPlus, cilSave } from '@coreui/icons'; // Importar iconos específicos
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
} from '@coreui/react';


const ListaPonderaciones = () => {
  const [Ponderaciones, setPonderaciones] = useState([]);
  const [modalVisible, setModalVisible] = useState(false); // Estado para el modal de crear ponderaciones
  const [modalUpdateVisible, setModalUpdateVisible] = useState(false); // Estado para el modal de actualizar ponderaciones
  const [modalDeleteVisible, setModalDeleteVisible] = useState(false); // Estado para el modal de eliminar ponderaciones
  const [nuevaPonderacion, setNuevaPonderacion] = useState(''); // Estado para la nueva ponderacion
  const [ponderacionToUpdate, setPonderacionToUpdate] = useState({}); // Estado para la ponderacion a actualizar
  const [ponderacionToDelete, setPonderacionToDelete] = useState({}); // Estado para la ponderacion a eliminar
  const [searchTerm, setSearchTerm] = useState('');

  const [currentPage, setCurrentPage] = useState(1); // Estado para la página actual
  const [recordsPerPage] = useState(5); // Mostrar 5 registros por página

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
    if (!nuevaPonderacion.Descripcion_ponderacion) {
      Swal.fire('Error', 'La Descripcion de la ponderacion es obligatorio', 'error');
      return false;
    }
    return true;
  };



  const handleCreatePonderacion = async () => {
    if (!validarPonderacion()) return;
    try {
      const response = await fetch('http://localhost:4000/api/ponderaciones/crearPonderacion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify( nuevaPonderacion ),
      });

      if (response.ok) {
        fetchPonderacion();
        setModalVisible(false);
        setNuevaPonderacion('');

        Swal.fire('Creado', 'La ponderacion ha sido creada exitosamente', 'success');
      } else {
        Swal.fire('Error', 'Hubo un problema al crear la ponderacion', 'error');
      }
    } catch (error) {
      Swal.fire('Error', 'Hubo un problema al crear la ponderacion', 'error');
    }
  };  

  const handleUpdatePonderacion = async () => {
    if (!ponderacionToUpdate.Descripcion_ponderacion) {
      Swal.fire('Error', 'El nombre de la ponderacion es obligatorio', 'error');
      return false;
    }
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
        setPonderacionToUpdate({}); // Resetear las ponderaciones al actualizar

        Swal.fire('Actualizado', 'La ponderacion ha sido actualizada correctamente', 'success');
      } else {
        Swal.fire('Error', 'Hubo un problema al actualizar la ponderacion', 'error');
      }
      if (!ponderacionToUpdate.Descripcion_ponderacion) {
        Swal.fire('Error', 'La Descripcion de la ponderacion es obligatorio', 'error');
        return false;
      }
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
        Swal.fire('Eliminado', 'La ponderacion ha sido eliminada correctamente', 'success');
      } else {
        Swal.fire('Error', 'Hubo un problema al eliminar la ponderacion', 'error');
      }
    } catch (error) {
      Swal.fire('Error', 'Hubo un problema al eliminar la ponderacion', 'error');
    }
  };

  const openUpdateModal = (ponderacion) => {
    setPonderacionToUpdate(ponderacion); // Cargar los datos de la ponderacion a actualizar
    setModalUpdateVisible(true); // Abrir el modal de actualización
  };

  const openDeleteModal = (ponderacion) => {
    setPonderacionToDelete(ponderacion); // Guardar la ponderacion que se desea eliminar
    setModalDeleteVisible(true); // Abrir el modal de confirmación
  };


 // Cambia el estado de la página actual después de aplicar el filtro
 const handleSearch = (event) => {
  setSearchTerm(event.target.value);
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
    <h1>Mantenimiento Ponderaciones</h1>
     {/* Contenedor de la barra de búsqueda y el botón "Nuevo" */}
     <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', justifyContent: 'space-between' }}>
      {/* Barra de búsqueda */}
      <CInputGroup style={{ marginTop: '30px', width: '400px' }}>
        <CInputGroupText>Buscar</CInputGroupText>
        <CFormInput placeholder="Buscar ponderación..." onChange={handleSearch} value={searchTerm} />
        {/* Botón para limpiar la búsqueda */}
        <CButton
          style={{ backgroundColor: '#E0E0E0', color: 'black' }}
          onClick={() => {
            setSearchTerm(''); // Limpiar el campo de búsqueda
            setCurrentPage(1); // Resetear a la primera página
          }}
        >
          Limpiar
        </CButton>
      </CInputGroup>

      {/* Botón "Nuevo" alineado a la derecha */}
      <CButton
        style={{ backgroundColor: '#4B6251', color: 'white', marginTop: '30px' }} // Ajusta la altura para alinearlo con la barra de búsqueda
        onClick={() => setModalVisible(true)}
      >
        <CIcon icon={cilPlus} /> {/* Ícono de "más" */}
        Nuevo
      </CButton>
    </div>



    {/* Tabla para mostrar ponderaciones */}
    {/* Contenedor de tabla con scroll */}
    <div className="table-container" style={{ maxHeight: '400px', overflowY: 'scroll', marginBottom: '20px' }}>
        <CTable striped bordered hover>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell>#</CTableHeaderCell>
              <CTableHeaderCell>Descripcion de la Ponderacion</CTableHeaderCell>
              <CTableHeaderCell>Acciones</CTableHeaderCell>
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
          disabled={currentPage === 1} // Deshabilitar si estás en la primera página
          onClick={() => paginate(currentPage - 1)}>
          Anterior
        </CButton>
        <CButton
          style={{ marginLeft: '10px',backgroundColor: '#6f8173', color: '#D9EAD3' }}
          disabled={currentPage === Math.ceil(filteredPonderaciones.length / recordsPerPage)} // Deshabilitar si estás en la última página
          onClick={() => paginate(currentPage + 1)}>
          Siguiente
       </CButton>
     </CPagination>
      {/* Mostrar total de páginas */}
      <span style={{ marginLeft: '10px' }}>
        Página {currentPage} de {Math.ceil(filteredPonderaciones.length / recordsPerPage)}
      </span>
   </div>


      {/* Modal para crear una nueva Ponderacion */}
      <CModal visible={modalVisible} onClose={() => setModalVisible(false)} backdrop="static">
        <CModalHeader>
          <CModalTitle>Nueva Ponderacion</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CInputGroup className="mb-3">
            <CInputGroupText>Descripcion de la Ponderacion</CInputGroupText>
            <CFormInput
            type="text"
            placeholder="Ingrese una descripcion de la ponderacion"
            maxLength={50}
            value={nuevaPonderacion.Descripcion_ponderacion}
            onChange={(e) => {
              // Remover cualquier caracter especial del valor ingresado
              const regex = /^[a-zA-Z\s]*$/; // Solo permite letras y espacios
              if (regex.test(e.target.value)) {
                setNuevaPonderacion({ ...nuevaPonderacion, Descripcion_ponderacion: e.target.value });
              } else {
                // Mostrar un mensaje de error opcional usando SweetAlert2 si se desea
                Swal.fire({
                  icon: 'warning',
                  title: 'Caracter no permitido',
                  text: 'Solo se permiten letras y espacios.',
                });
              }
            }}
          />
            </CInputGroup>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setModalVisible(false)}>
            Cancelar
          </CButton>
          <CButton style={{ backgroundColor: '#4B6251',color: 'white' }} onClick={handleCreatePonderacion}>
          <CIcon icon={cilSave} style={{ marginRight: '5px' }} />Guardar
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Modal para actualizar una Ponderacion */}
      <CModal visible={modalUpdateVisible} onClose={() => setModalUpdateVisible(false)} backdrop="static">
        <CModalHeader>
          <CModalTitle>Actualizar Ponderacion</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CInputGroup className="mb-3">
              <CInputGroupText>Descripcion de la Ponderacion</CInputGroupText>
              <CFormInput
              maxLength={50}
              placeholder="Ingrese la nueva descripcion de la ponderacion"
              value={ponderacionToUpdate.Descripcion_ponderacion}
              onChange={(e) => {
                // Remover cualquier caracter especial del valor ingresado
                const regex = /^[a-zA-Z\s]*$/; // Solo permite letras y espacios
                if (regex.test(e.target.value)) {
                  setPonderacionToUpdate({
                    ...ponderacionToUpdate,
                    Descripcion_ponderacion: e.target.value,
                  });
                } else {
                  // Mostrar un mensaje de error opcional usando SweetAlert2 si se desea
                  Swal.fire({
                    icon: 'warning',
                    title: 'Caracter no permitido',
                    text: 'Solo se permiten letras y espacios.',
                  });
                }
              }}
            />
            </CInputGroup>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setModalUpdateVisible(false)}>
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