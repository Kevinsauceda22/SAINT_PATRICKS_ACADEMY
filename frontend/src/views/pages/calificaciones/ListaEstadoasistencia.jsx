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


const ListaEstadoasistencia = () => {
  const [estadonasistencia, setEstadoasistencia] = useState([]);
  const [modalVisible, setModalVisible] = useState(false); // Estado para el modal de crear un estado asistencia
  const [modalUpdateVisible, setModalUpdateVisible] = useState(false); // Estado para el modal de actualizar un estado asistencia
  const [modalDeleteVisible, setModalDeleteVisible] = useState(false); // Estado para el modal de eliminar un estado asistencia
  const [nuevoEstadoasistencia, setNuevoEstadoasistencia] = useState(''); // Estado para el nuevo estado asistencia
  const [estadonasistenciaToUpdate, setEstadoasistenciaToUpdate] = useState({}); // Estado para el estado asistencia actualizar
  const [estadonasistenciaToDelete, setEstadoasistenciaToDelete] = useState({}); // Estado para el estado asistencia a eliminar
  const [searchTerm, setSearchTerm] = useState('');

  const [currentPage, setCurrentPage] = useState(1); // Estado para la página actual
  const [recordsPerPage] = useState(5); // Mostrar 5 registros por página

  useEffect(() => {
    fetchEstadoasistencia();
  }, []);

  const fetchEstadoasistencia = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/estadoAsistencia/estadoasistencias');
      const data = await response.json();
      // Asignar un índice original basado en el orden en la base de datos
    const dataWithIndex = data.map((estadonasistencia, index) => ({
      ...estadonasistencia,
      originalIndex: index + 1, // Guardamos la secuencia original
    }));
    
    setEstadoasistencia(dataWithIndex);
    } catch (error) {
      console.error('Error al obtener los Estadoasistencia:', error);
    }
  };

  const handleCreateEstadoasistencia = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/estadoAsistencia/crearestadoasistencias', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ Descripcion_asistencia: nuevoEstadoasistencia }),
      });

      if (response.ok) {
        fetchEstadoasistencia();
        setModalVisible(false);
        setNuevoEstadoasistencia('');
      } else {
        console.error('Error al crear el estado asistencia:', response.statusText);
      }
    } catch (error) {
      console.error('Error al crear el estado asistencia:', error);
    }
  };


  
  const handleUpdateEstadoasistencia = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/estadoAsistencia/actualizarestadoasistencias', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ Cod_estado_asistencia: estadonasistenciaToUpdate.Cod_estado_asistencia, Descripcion_asistencia: estadonasistenciaToUpdate.Descripcion_asistencia }), // Envío de la Descripcion_asistenciaactualizado y Cod_estado en el cuerpo
      });

      if (response.ok) {
        fetchEstadoasistencia(); // Refrescar la lista de estadonasistencia después de la actualización
        setModalUpdateVisible(false); // Cerrar el modal de actualización
        setEstadoasistenciaToUpdate({}); // Resetear el ciclo a actualizar
      } else {
        console.error('Error al actualizar el estado asistencia:', response.statusText);
      }
    } catch (error) {
      console.error('Error al actualizar el estado asistencia:', error);
    }
  };


  const handleDeleteEstadoasistencia = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/estadoAsistencia/eliminarestadoasistencias', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ Cod_estado_asistencia: estadonasistenciaToDelete.Cod_estado_asistencia }), // Enviar Cod_estado_asistencia en el cuerpo
      });

      if (response.ok) {
        fetchEstadoasistencia(); // Refrescar la lista de Estadoasistencia después de la eliminación
        setModalDeleteVisible(false); // Cerrar el modal de confirmación
        setEstadoasistenciaToDelete({}); // Resetear el ciclo a eliminar
      } else {
        console.error('Error al eliminar el estado asistencia:', response.statusText);
      }
    } catch (error) {
      console.error('Error al eliminar el estado asistencia:', error);
    }
  };

  const openUpdateModal = (estadonasistencia) => {
    setEstadoasistenciaToUpdate(estadonasistencia); // Cargar los datos del estado asistencia a actualizar
    setModalUpdateVisible(true); // Abrir el modal de actualización
  };

  const openDeleteModal = (estadonasistencia) => {
    setEstadoasistenciaToDelete(estadonasistencia); // Guardar el ciclo que se desea eliminar
    setModalDeleteVisible(true); // Abrir el modal de confirmación
  };

 // Cambia el estado de la página actual después de aplicar el filtro
  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1); // Resetear a la primera página al buscar
  };

  // Filtro de búsqueda
  const filteredEstadoasistencia = estadonasistencia.filter((estadonasistencia) =>
    estadonasistencia.Descripcion_asistencia.toLowerCase().includes(searchTerm.toLowerCase())
  );

 // Lógica de paginación
 const indexOfLastRecord = currentPage * recordsPerPage;
 const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
 const currentRecords = filteredEstadoasistencia.slice(indexOfFirstRecord, indexOfLastRecord);

 // Cambiar página
const paginate = (pageNumber) => {
  if (pageNumber > 0 && pageNumber <= Math.ceil(filteredEstadoasistencia.length / recordsPerPage)) {
    setCurrentPage(pageNumber);
  }
}
 return (
  <CContainer>
    <h1>Lista de Estadoasistencia</h1>
    {/* Barra de búsqueda */}
    <CInputGroup style={{ marginBottom: '20px', width: '400px', float: 'right' }}>
    <CInputGroupText>Buscar</CInputGroupText>
    <CFormInput placeholder="Buscar estado asistencia..." onChange={handleSearch} value={searchTerm} />
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
      Crear Estado Asistencia
    </CButton>


    {/* Tabla para mostrar Estadoasistencia */}
    {/* Contenedor de tabla con scroll */}
    <div className="table-container" style={{ maxHeight: '220px', overflowY: 'scroll', marginBottom: '20px' }}>
        <CTable striped bordered hover>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell>#</CTableHeaderCell>
              <CTableHeaderCell>Descripción</CTableHeaderCell>
              <CTableHeaderCell>Acciones</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {currentRecords.map((estadonasistencia) => (
              <CTableRow key={estadonasistencia.Cod_estado_asistencia}>
                <CTableDataCell>
                  {/* Mostrar el índice original en lugar del índice basado en la paginación */}
                  {estadonasistencia.originalIndex} 
                </CTableDataCell>
                <CTableDataCell>{estadonasistencia.Descripcion_asistencia}</CTableDataCell>
                <CTableDataCell>
                  <CButton color="info" style={{ marginRight: '10px' }} onClick={() => openUpdateModal(estadonasistencia)}>
                    <CIcon icon={cilPen} />
                  </CButton>
                  <CButton color="danger" style={{ marginRight: '10px' }} onClick={() => openDeleteModal(estadonasistencia)}>
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
          disabled={currentPage === Math.ceil(filteredEstadoasistencia.length / recordsPerPage)} // Deshabilitar si estás en la última página
          onClick={() => paginate(currentPage + 1)}>
          Siguiente
       </CButton>
     </CPagination>
      {/* Mostrar total de páginas */}
      <span style={{ marginLeft: '10px' }}>
        Página {currentPage} de {Math.ceil(filteredEstadoasistencia.length / recordsPerPage)}
      </span>
   </div>


    {/* Modal Crear Estado asistencia */}
    <CModal visible={modalVisible} onClose={() => setModalVisible(false)}>
      <CModalHeader>
        <CModalTitle>Crear Nuevo Estado Asistencia</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CInputGroup className="mb-3">
              <CInputGroupText>Descripción</CInputGroupText>
              <CFormInput
                placeholder="Ingrese la descripción del estado"
                value={nuevoEstadoasistencia}
                onChange={(e) => setNuevoEstadoasistencia(e.target.value)}/>
            </CInputGroup>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setModalVisible(false)}>
            Cancelar
          </CButton>
          <CButton color="success" style={{ color: 'white' }} onClick={handleCreateEstadoasistencia}>
            Crear Estado
          </CButton>
        </CModalFooter>
      </CModal>

    {/* Modal Actualizar Estado Asistencia*/}
    <CModal visible={modalUpdateVisible} onClose={() => setModalUpdateVisible(false)}>
      <CModalHeader>
      <CModalTitle>Actualizar Estado Asistencia</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <CForm>
          <CInputGroup className="mb-3">
            <CInputGroupText>Descripción</CInputGroupText>
            <CFormInput
              placeholder="Ingrese la descripción del estado"
              value={estadonasistenciaToUpdate.Descripcion_asistencia}
              onChange={(e) => setEstadoasistenciaToUpdate({ ...estadonasistenciaToUpdate, Descripcion_asistencia: e.target.value })}
            />
          </CInputGroup>
        </CForm>
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={() => setModalUpdateVisible(false)}>
          Cancelar
        </CButton>
        <CButton color="info" style={{ color: 'white' }}  onClick={handleUpdateEstadoasistencia}>
          Actualizar Estado
        </CButton>
      </CModalFooter>
    </CModal>

    {/* Modal Eliminar estado Asistencia */}
    <CModal visible={modalDeleteVisible} onClose={() => setModalDeleteVisible(false)}>
      <CModalHeader>
      <CModalTitle>Confirmar Eliminación</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <p>¿Estás seguro de que deseas eliminar el estado: <strong>{estadonasistenciaToDelete.Descripcion_asistencia}</strong>?</p>
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={() => setModalDeleteVisible(false)}>
          Cancelar
        </CButton>
        <CButton color="danger" style={{ color: 'white' }}  onClick={handleDeleteEstadoasistencia}>
          Eliminar Estado
        </CButton>
      </CModalFooter>
    </CModal>
 </CContainer>
  );
};


export default ListaEstadoasistencia;