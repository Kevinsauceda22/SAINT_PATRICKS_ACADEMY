import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CIcon } from '@coreui/icons-react';
import { cilInfo, cilPen, cilTrash } from '@coreui/icons'; // Importar iconos específicos

import {
  CButton,
  CCard,
  CCardBody,
  CCol,
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
  CPaginationItem,
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

  const handleCreatePonderacion = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/ponderaciones/crearPonderacion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ Descripcion_ponderacion: nuevaPonderacion }),
      });

      if (response.ok) {
        fetchPonderacion();
        setModalVisible(false);
        setNuevaPonderacion('');
      } else {
        console.error('Error al crear la ponderacion:', response.statusText);
      }
    } catch (error) {
      console.error('Error al crear la ponderacion:', error);
    }
  };

  const handleUpdatePonderacion = async () => {
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
      } else {
        console.error('Error al actualizar la ponderacion:', response.statusText);
      }
    } catch (error) {
      console.error('Error al actualizar la ponderacion:', error);
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
      } else {
        console.error('Error al eliminar la ponderacion:', response.statusText);
      }
    } catch (error) {
      console.error('Error al eliminar la ponderacion:', error);
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
        <h1>Lista de Ponderaciones</h1>
    {/* Barra de búsqueda */}
    <CInputGroup style={{ marginBottom: '20px', width: '400px', float: 'right' }}>
    <CInputGroupText>Buscar</CInputGroupText>
    <CFormInput placeholder="Buscar ponderacion..." onChange={handleSearch} value={searchTerm} />
     {/* Botón para limpiar la búsqueda */}
      <CButton 
        style={{ backgroundColor: '#cccccc', color: 'black' }}
        onClick={() => {
          setSearchTerm(''); // Limpiar el campo de búsqueda
          setCurrentPage(1); // Resetear a la primera página
        }}>
        Limpiar
      </CButton>
    </CInputGroup>

    
    <CButton 
      color="success"  // Usar el color predefinido 'success' para el botón verde
      style={{ color: 'white', marginBottom: '20px' }}  // Letras blancas y margen inferior
      onClick={() => setModalVisible(true)}>
      Crear Ponderacion
    </CButton>


    {/* Tabla para mostrar ponderaciones */}
    {/* Contenedor de tabla con scroll */}
    <div className="table-container" style={{ maxHeight: '220px', overflowY: 'scroll', marginBottom: '20px' }}>
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
                  <CButton color="info" style={{ marginRight: '10px' }} onClick={() => openUpdateModal(ponderacion)}>
                    <CIcon icon={cilPen} />
                  </CButton>
                  <CButton color="danger" style={{ marginRight: '10px' }} onClick={() => openDeleteModal(ponderacion)}>
                    <CIcon icon={cilTrash} />
                  </CButton>
                  <CButton color="primary" style={{ marginRight: '10px' }}>
                    <CIcon icon={cilInfo} />
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
          color="secondary"
          disabled={currentPage === 1} // Deshabilitar si estás en la primera página
          onClick={() => paginate(currentPage - 1)}>
          Anterior
        </CButton>
        <CButton
          color="secondary"
          style={{ marginLeft: '10px' }}
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
      <CModal visible={modalVisible} onClose={() => setModalVisible(false)}>
        <CModalHeader>
          <CModalTitle>Crear Nueva Ponderacion</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CInputGroup className="mb-3">
              <CInputGroupText>Descripcion de la Ponderacion</CInputGroupText>
              <CFormInput
                placeholder="Ingrese la descripcion de la Ponderacion"
                value={nuevaPonderacion}
                onChange={(e) => setNuevaPonderacion(e.target.value)}
              />
            </CInputGroup>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setModalVisible(false)}>
            Cancelar
          </CButton>
          <CButton color="success" style={{ color: 'white' }} onClick={handleCreatePonderacion}>
            Crear Ponderacion
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Modal para actualizar una Ponderacion */}
      <CModal visible={modalUpdateVisible} onClose={() => setModalUpdateVisible(false)}>
        <CModalHeader>
          <CModalTitle>Actualizar Ponderacion</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CInputGroup className="mb-3">
              <CInputGroupText>Descripcion de la Ponderacion</CInputGroupText>
              <CFormInput
                placeholder="Ingrese la descripcion de la ponderacion"
                value={ponderacionToUpdate.Descripcion_ponderacion}
                onChange={(e) => setPonderacionToUpdate({ ...ponderacionToUpdate, Descripcion_ponderacion: e.target.value })} // Actualiza la descrp de la ponderacion
              />
            </CInputGroup>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setModalUpdateVisible(false)}>
            Cancelar
          </CButton>
          <CButton color="info" style={{ color: 'white' }} onClick={handleUpdatePonderacion}>
            Actualizar Ponderacion
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Modal para eliminar una ponderacion */}
      <CModal visible={modalDeleteVisible} onClose={() => setModalDeleteVisible(false)}>
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
          <CButton color="danger" style={{ color: 'white' }} onClick={handleDeletePonderacion}>
            Eliminar Ponderación 
          </CButton>
        </CModalFooter>
      </CModal>
    </CContainer>
  );
};


export default ListaPonderaciones;