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


const ListaEstadonota = () => {
  const [estadonota, setEstadonota] = useState([]);
  const [modalVisible, setModalVisible] = useState(false); // Estado para el modal de crear un estado nota
  const [modalUpdateVisible, setModalUpdateVisible] = useState(false); // Estado para el modal de actualizar un estado nota
  const [modalDeleteVisible, setModalDeleteVisible] = useState(false); // Estado para el modal de eliminar un estado nota
  const [nuevoEstadonota, setNuevoEstadonota] = useState(''); // Estado para el nuevo estado nota
  const [estadonotaToUpdate, setEstadonotaToUpdate] = useState({}); // Estado para el estado nota actualizar
  const [estadonotaToDelete, setEstadonotaToDelete] = useState({}); // Estado para el estado nota a eliminar
  const [searchTerm, setSearchTerm] = useState('');

  const [currentPage, setCurrentPage] = useState(1); // Estado para la página actual
  const [recordsPerPage] = useState(5); // Mostrar 5 registros por página

  useEffect(() => {
    fetchEstadonota();
  }, []);

  const fetchEstadonota = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/estadoNotas/estadonota');
      const data = await response.json();
      // Asignar un índice original basado en el orden en la base de datos
    const dataWithIndex = data.map((estadonota, index) => ({
      ...estadonota,
      originalIndex: index + 1, // Guardamos la secuencia original
    }));
    
    setEstadonota(dataWithIndex);
    } catch (error) {
      console.error('Error al obtener los Estadonota:', error);
    }
  };

  const handleCreateEstadonota = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/estadoNotas/crearestadonota', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ Descripcion: nuevoEstadonota }),
      });

      if (response.ok) {
        fetchEstadonota();
        setModalVisible(false);
        setNuevoEstadonota('');
      } else {
        console.error('Error al crear el estado nota:', response.statusText);
      }
    } catch (error) {
      console.error('Error al crear el estado nota:', error);
    }
  };


  
  const handleUpdateEstadonota = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/estadoNotas/actualizarestadonota', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ Cod_estado: estadonotaToUpdate.Cod_estado, Descripcion: estadonotaToUpdate.Descripcion }), // Envío de la descripcion actualizado y Cod_estado en el cuerpo
      });

      if (response.ok) {
        fetchEstadonota(); // Refrescar la lista de Estadonota después de la actualización
        setModalUpdateVisible(false); // Cerrar el modal de actualización
        setEstadonotaToUpdate({}); // Resetear el ciclo a actualizar
      } else {
        console.error('Error al actualizar el estado nota:', response.statusText);
      }
    } catch (error) {
      console.error('Error al actualizar el estado nota:', error);
    }
  };


  const handleDeleteEstadonota = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/estadoNotas/eliminarestadonota', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ Cod_estado: estadonotaToDelete.Cod_estado }), // Enviar Cod_estado en el cuerpo
      });

      if (response.ok) {
        fetchEstadonota(); // Refrescar la lista de Estadonota después de la eliminación
        setModalDeleteVisible(false); // Cerrar el modal de confirmación
        setEstadonotaToDelete({}); // Resetear el ciclo a eliminar
      } else {
        console.error('Error al eliminar el estado  nota:', response.statusText);
      }
    } catch (error) {
      console.error('Error al eliminar el estado nota:', error);
    }
  };

  const openUpdateModal = (estadonota) => {
    setEstadonotaToUpdate(estadonota); // Cargar los datos del estado nota a actualizar
    setModalUpdateVisible(true); // Abrir el modal de actualización
  };

  const openDeleteModal = (estadonota) => {
    setEstadonotaToDelete(estadonota); // Guardar el ciclo que se desea eliminar
    setModalDeleteVisible(true); // Abrir el modal de confirmación
  };

 // Cambia el estado de la página actual después de aplicar el filtro
  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1); // Resetear a la primera página al buscar
  };

  // Filtro de búsqueda
  const filteredEstadonota = estadonota.filter((estadonota) =>
    estadonota.Descripcion.toLowerCase().includes(searchTerm.toLowerCase())
  );

 // Lógica de paginación
 const indexOfLastRecord = currentPage * recordsPerPage;
 const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
 const currentRecords = filteredEstadonota.slice(indexOfFirstRecord, indexOfLastRecord);

 // Cambiar página
const paginate = (pageNumber) => {
  if (pageNumber > 0 && pageNumber <= Math.ceil(filteredEstadonota.length / recordsPerPage)) {
    setCurrentPage(pageNumber);
  }
}
 return (
  <CContainer>
    <h1>Lista de Estadonota</h1>
    {/* Barra de búsqueda */}
    <CInputGroup style={{ marginBottom: '20px', width: '400px', float: 'right' }}>
    <CInputGroupText>Buscar</CInputGroupText>
    <CFormInput placeholder="Buscar estado nota..." onChange={handleSearch} value={searchTerm} />
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
      Crear Estado Nota
    </CButton>


    {/* Tabla para mostrar Estadonota */}
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
            {currentRecords.map((estadonota) => (
              <CTableRow key={estadonota.Cod_estado}>
                <CTableDataCell>
                  {/* Mostrar el índice original en lugar del índice basado en la paginación */}
                  {estadonota.originalIndex} 
                </CTableDataCell>
                <CTableDataCell>{estadonota.Descripcion}</CTableDataCell>
                <CTableDataCell>
                  <CButton color="info" style={{ marginRight: '10px' }} onClick={() => openUpdateModal(estadonota)}>
                    <CIcon icon={cilPen} />
                  </CButton>
                  <CButton color="danger" style={{ marginRight: '10px' }} onClick={() => openDeleteModal(estadonota)}>
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
          disabled={currentPage === Math.ceil(filteredEstadonota.length / recordsPerPage)} // Deshabilitar si estás en la última página
          onClick={() => paginate(currentPage + 1)}>
          Siguiente
       </CButton>
     </CPagination>
      {/* Mostrar total de páginas */}
      <span style={{ marginLeft: '10px' }}>
        Página {currentPage} de {Math.ceil(filteredEstadonota.length / recordsPerPage)}
      </span>
   </div>


    {/* Modal Crear Estado nota */}
    <CModal visible={modalVisible} onClose={() => setModalVisible(false)}>
      <CModalHeader>
        <CModalTitle>Crear Nuevo Estado Nota</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CInputGroup className="mb-3">
              <CInputGroupText>Descripción</CInputGroupText>
              <CFormInput
                placeholder="Ingrese el la descripción del estado"
                value={nuevoEstadonota}
                onChange={(e) => setNuevoEstadonota(e.target.value)}/>
            </CInputGroup>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setModalVisible(false)}>
            Cancelar
          </CButton>
          <CButton color="success" style={{ color: 'white' }} onClick={handleCreateEstadonota}>
            Crear Estado
          </CButton>
        </CModalFooter>
      </CModal>

    {/* Modal Actualizar Estado nota*/}
    <CModal visible={modalUpdateVisible} onClose={() => setModalUpdateVisible(false)}>
      <CModalHeader>
      <CModalTitle>Actualizar Estado nota</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <CForm>
          <CInputGroup className="mb-3">
            <CInputGroupText>Descripción</CInputGroupText>
            <CFormInput
              placeholder="Ingrese la descripción del estado"
              value={estadonotaToUpdate.Descripcion}
              onChange={(e) => setEstadonotaToUpdate({ ...estadonotaToUpdate, Descripcion: e.target.value })}
            />
          </CInputGroup>
        </CForm>
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={() => setModalUpdateVisible(false)}>
          Cancelar
        </CButton>
        <CButton color="info" style={{ color: 'white' }}  onClick={handleUpdateEstadonota}>
          Actualizar Estado
        </CButton>
      </CModalFooter>
    </CModal>

    {/* Modal Eliminar estado nota */}
    <CModal visible={modalDeleteVisible} onClose={() => setModalDeleteVisible(false)}>
      <CModalHeader>
      <CModalTitle>Confirmar Eliminación</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <p>¿Estás seguro de que deseas eliminar el estado: <strong>{estadonotaToDelete.Descripcion}</strong>?</p>
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={() => setModalDeleteVisible(false)}>
          Cancelar
        </CButton>
        <CButton color="danger" style={{ color: 'white' }}  onClick={handleDeleteEstadonota}>
          Eliminar Estado
        </CButton>
      </CModalFooter>
    </CModal>
 </CContainer>
  );
};


export default ListaEstadonota;