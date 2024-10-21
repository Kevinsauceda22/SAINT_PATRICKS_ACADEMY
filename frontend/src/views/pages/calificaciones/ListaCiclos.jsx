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


const ListaCiclos = () => {
  const [ciclos, setCiclos] = useState([]);
  const [modalVisible, setModalVisible] = useState(false); // Estado para el modal de crear ciclo
  const [modalUpdateVisible, setModalUpdateVisible] = useState(false); // Estado para el modal de actualizar ciclo
  const [modalDeleteVisible, setModalDeleteVisible] = useState(false); // Estado para el modal de eliminar ciclo
  const [nuevoCiclo, setNuevoCiclo] = useState(''); // Estado para el nuevo ciclo
  const [cicloToUpdate, setCicloToUpdate] = useState({}); // Estado para el ciclo a actualizar
  const [cicloToDelete, setCicloToDelete] = useState({}); // Estado para el ciclo a eliminar
  const [searchTerm, setSearchTerm] = useState('');

  const [currentPage, setCurrentPage] = useState(1); // Estado para la página actual
  const [recordsPerPage] = useState(5); // Mostrar 5 registros por página

  useEffect(() => {
    fetchCiclos();
  }, []);

  const fetchCiclos = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/ciclos/verCiclos');
      const data = await response.json();
      // Asignar un índice original basado en el orden en la base de datos
    const dataWithIndex = data.map((ciclo, index) => ({
      ...ciclo,
      originalIndex: index + 1, // Guardamos la secuencia original
    }));
    
    setCiclos(dataWithIndex);
    } catch (error) {
      console.error('Error al obtener los ciclos:', error);
    }
  };

  const handleCreateCiclo = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/ciclos/crearCiclo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ Nombre_ciclo: nuevoCiclo }),
      });

      if (response.ok) {
        fetchCiclos();
        setModalVisible(false);
        setNuevoCiclo('');
      } else {
        console.error('Error al crear el ciclo:', response.statusText);
      }
    } catch (error) {
      console.error('Error al crear el ciclo:', error);
    }
  };


  
  const handleUpdateCiclo = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/ciclos/actualizarCiclo', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ Cod_ciclo: cicloToUpdate.Cod_ciclo, Nombre_ciclo: cicloToUpdate.Nombre_ciclo }), // Envío del nombre actualizado y Cod_ciclo en el cuerpo
      });

      if (response.ok) {
        fetchCiclos(); // Refrescar la lista de ciclos después de la actualización
        setModalUpdateVisible(false); // Cerrar el modal de actualización
        setCicloToUpdate({}); // Resetear el ciclo a actualizar
      } else {
        console.error('Error al actualizar el ciclo:', response.statusText);
      }
    } catch (error) {
      console.error('Error al actualizar el ciclo:', error);
    }
  };


  const handleDeleteCiclo = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/ciclos/eliminarCiclo', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ Cod_ciclo: cicloToDelete.Cod_ciclo }), // Enviar Cod_ciclo en el cuerpo
      });

      if (response.ok) {
        fetchCiclos(); // Refrescar la lista de ciclos después de la eliminación
        setModalDeleteVisible(false); // Cerrar el modal de confirmación
        setCicloToDelete({}); // Resetear el ciclo a eliminar
      } else {
        console.error('Error al eliminar el ciclo:', response.statusText);
      }
    } catch (error) {
      console.error('Error al eliminar el ciclo:', error);
    }
  };

  const openUpdateModal = (ciclo) => {
    setCicloToUpdate(ciclo); // Cargar los datos del ciclo a actualizar
    setModalUpdateVisible(true); // Abrir el modal de actualización
  };

  const openDeleteModal = (ciclo) => {
    setCicloToDelete(ciclo); // Guardar el ciclo que se desea eliminar
    setModalDeleteVisible(true); // Abrir el modal de confirmación
  };

 // Cambia el estado de la página actual después de aplicar el filtro
  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1); // Resetear a la primera página al buscar
  };

  // Filtro de búsqueda
  const filteredCiclos = ciclos.filter((ciclo) =>
    ciclo.Nombre_ciclo.toLowerCase().includes(searchTerm.toLowerCase())
  );

 // Lógica de paginación
 const indexOfLastRecord = currentPage * recordsPerPage;
 const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
 const currentRecords = filteredCiclos.slice(indexOfFirstRecord, indexOfLastRecord);

 // Cambiar página
const paginate = (pageNumber) => {
  if (pageNumber > 0 && pageNumber <= Math.ceil(filteredCiclos.length / recordsPerPage)) {
    setCurrentPage(pageNumber);
  }
}
 return (
  <CContainer>
    <h1>Lista de Ciclos</h1>
    {/* Barra de búsqueda */}
    <CInputGroup style={{ marginBottom: '20px', width: '400px', float: 'right' }}>
    <CInputGroupText>Buscar</CInputGroupText>
    <CFormInput placeholder="Buscar ciclo..." onChange={handleSearch} value={searchTerm} />
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
      Crear Ciclo
    </CButton>


    {/* Tabla para mostrar ciclos */}
    {/* Contenedor de tabla con scroll */}
    <div className="table-container" style={{ maxHeight: '220px', overflowY: 'scroll', marginBottom: '20px' }}>
        <CTable striped bordered hover>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell>#</CTableHeaderCell>
              <CTableHeaderCell>Nombre del Ciclo</CTableHeaderCell>
              <CTableHeaderCell>Acciones</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {currentRecords.map((ciclo) => (
              <CTableRow key={ciclo.Cod_ciclo}>
                <CTableDataCell>
                  {/* Mostrar el índice original en lugar del índice basado en la paginación */}
                  {ciclo.originalIndex} 
                </CTableDataCell>
                <CTableDataCell>{ciclo.Nombre_ciclo}</CTableDataCell>
                <CTableDataCell>
                  <CButton color="info" style={{ marginRight: '10px' }} onClick={() => openUpdateModal(ciclo)}>
                    <CIcon icon={cilPen} />
                  </CButton>
                  <CButton color="danger" style={{ marginRight: '10px' }} onClick={() => openDeleteModal(ciclo)}>
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
          disabled={currentPage === Math.ceil(filteredCiclos.length / recordsPerPage)} // Deshabilitar si estás en la última página
          onClick={() => paginate(currentPage + 1)}>
          Siguiente
       </CButton>
     </CPagination>
      {/* Mostrar total de páginas */}
      <span style={{ marginLeft: '10px' }}>
        Página {currentPage} de {Math.ceil(filteredCiclos.length / recordsPerPage)}
      </span>
   </div>


    {/* Modal Crear Ciclo */}
    <CModal visible={modalVisible} onClose={() => setModalVisible(false)}>
      <CModalHeader>
        <CModalTitle>Crear Nuevo Ciclo</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CInputGroup className="mb-3">
              <CInputGroupText>Nombre del Ciclo</CInputGroupText>
              <CFormInput
                placeholder="Ingrese el nombre del ciclo"
                value={nuevoCiclo}
                onChange={(e) => setNuevoCiclo(e.target.value)}/>
            </CInputGroup>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setModalVisible(false)}>
            Cancelar
          </CButton>
          <CButton color="success" style={{ color: 'white' }} onClick={handleCreateCiclo}>
            Crear Ciclo
          </CButton>
        </CModalFooter>
      </CModal>

    {/* Modal Actualizar Ciclo */}
    <CModal visible={modalUpdateVisible} onClose={() => setModalUpdateVisible(false)}>
      <CModalHeader>
      <CModalTitle>Actualizar Ciclo</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <CForm>
          <CInputGroup className="mb-3">
            <CInputGroupText>Nombre del Ciclo</CInputGroupText>
            <CFormInput
              placeholder="Ingrese el nuevo nombre del ciclo"
              value={cicloToUpdate.Nombre_ciclo}
              onChange={(e) => setCicloToUpdate({ ...cicloToUpdate, Nombre_ciclo: e.target.value })}
            />
          </CInputGroup>
        </CForm>
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={() => setModalUpdateVisible(false)}>
          Cancelar
        </CButton>
        <CButton color="info" style={{ color: 'white' }}  onClick={handleUpdateCiclo}>
          Actualizar Ciclo
        </CButton>
      </CModalFooter>
    </CModal>

    {/* Modal Eliminar Ciclo */}
    <CModal visible={modalDeleteVisible} onClose={() => setModalDeleteVisible(false)}>
      <CModalHeader>
      <CModalTitle>Confirmar Eliminación</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <p>¿Estás seguro de que deseas eliminar el ciclo: <strong>{cicloToDelete.Nombre_ciclo}</strong>?</p>
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={() => setModalDeleteVisible(false)}>
          Cancelar
        </CButton>
        <CButton color="danger" style={{ color: 'white' }}  onClick={handleDeleteCiclo}>
          Eliminar Ciclo
        </CButton>
      </CModalFooter>
    </CModal>
 </CContainer>
  );
};


export default ListaCiclos;