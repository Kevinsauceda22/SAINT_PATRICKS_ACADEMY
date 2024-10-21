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


const ListaAsignaturas = () => {
  const [Asignaturas, setAsignatura] = useState([]);
  const [modalVisible, setModalVisible] = useState(false); // Estado para el modal de crear ciclo
  const [modalUpdateVisible, setModalUpdateVisible] = useState(false); // Estado para el modal de actualizar ciclo
  const [modalDeleteVisible, setModalDeleteVisible] = useState(false); // Estado para el modal de eliminar ciclo
  const [nueva_Asignatura, setNueva_Asignatura] = useState(''); // Estado para el nuevo ciclo
  const [asignaturaToUpdate, setAsignaturaToUpdate] = useState({}); // Estado para el ciclo a actualizar
  const [AsignaturaToDelete, setAsignaturaToDelete] = useState({}); // Estado para el ciclo a eliminar
  const [searchTerm, setSearchTerm] = useState('');

  const [currentPage, setCurrentPage] = useState(1); // Estado para la página actual
  const [recordsPerPage] = useState(5); // Mostrar 5 registros por página

  useEffect(() => {
    fetchAsignaturas();
  }, []);

  const fetchAsignaturas = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/asignaturas/verAsignaturas');
      const data = await response.json();
      // Asignar un índice original basado en el orden en la base de datos
    const dataWithIndex = data.map((asignatura, index) => ({
      ...asignatura,
      originalIndex: index + 1, // Guardamos la secuencia original
    }));
    
    setAsignatura(dataWithIndex);
    } catch (error) {
      console.error('Error al obtener las Asignaturas:', error);
    }
  };

  const handleCreateAsignatura = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/asignaturas/crearAsignatura', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(nueva_Asignatura),
      });

      if (response.ok) {
        fetchAsignaturas();
        setModalVisible(false);
        setNueva_Asignatura('');
      } else {
        console.error('Error al crear la asignatura:', response.statusText);
      }
    } catch (error) {
      console.error('Error al crear la asignatura:', error);
    }
  };


  
  const handleUpdateAsignatura = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/asignaturas/actualizarAsignatura', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ Cod_asignatura: asignaturaToUpdate.Cod_asignatura, Nombre_asignatura: asignaturaToUpdate.Nombre_asignatura, Descripcion_asignatura: asignaturaToUpdate.Descripcion_asignatura }), // Envío del nombre actualizado y Cod_ciclo en el cuerpo
      });

      if (response.ok) {
        fetchAsignaturas(); // Refrescar la lista de ciclos después de la actualización
        setModalUpdateVisible(false); // Cerrar el modal de actualización
        setAsignaturaToUpdate({}); // Resetear el ciclo a actualizar
      } else {
        console.error('Error al actualizar la asignatura:', response.statusText);
      }
    } catch (error) {
      console.error('Error al actualizar la asignatura:', error);
    }
  };


  const handleDeleteAsignatura = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/asignaturas/eliminar_asignatura', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ Cod_asignatura: AsignaturaToDelete.Cod_asignatura }), // Enviar Cod_ciclo en el cuerpo
      });

      if (response.ok) {
        fetchAsignaturas(); // Refrescar la lista de ciclos después de la eliminación
        setModalDeleteVisible(false); // Cerrar el modal de confirmación
        setAsignaturaToDelete({}); // Resetear el ciclo a eliminar
      } else {
        console.error('Error al eliminar la asignatura:', response.statusText);
      }
    } catch (error) {
      console.error('Error al eliminar la asignatura:', error);
    }
  };

  const openUpdateModal = (asignatura) => {
    setAsignaturaToUpdate(asignatura); // Cargar los datos del ciclo a actualizar
    setModalUpdateVisible(true); // Abrir el modal de actualización
  };

  const openDeleteModal = (asignatura) => {
    setAsignaturaToDelete(asignatura); // Guardar el ciclo que se desea eliminar
    setModalDeleteVisible(true); // Abrir el modal de confirmación
  };

 // Cambia el estado de la página actual después de aplicar el filtro
  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1); // Resetear a la primera página al buscar
  };

  // Filtro de búsqueda
  const filteredAsignaturas = Asignaturas.filter((asignatura) =>
    asignatura.Nombre_asignatura.toLowerCase().includes(searchTerm.toLowerCase())
  );

 // Lógica de paginación
 const indexOfLastRecord = currentPage * recordsPerPage;
 const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
 const currentRecords = filteredAsignaturas.slice(indexOfFirstRecord, indexOfLastRecord);

 // Cambiar página
const paginate = (pageNumber) => {
  if (pageNumber > 0 && pageNumber <= Math.ceil(filteredAsignaturas.length / recordsPerPage)) {
    setCurrentPage(pageNumber);
  }
}
 return (
  <CContainer>
    <h1>Mantenimiento de Asignaturas</h1>
    {/* Barra de búsqueda */}
    <CInputGroup style={{ marginBottom: '20px', width: '400px', float: 'right' }}>
    <CInputGroupText>Buscar</CInputGroupText>
    <CFormInput placeholder="Buscar asignatura..." onChange={handleSearch} value={searchTerm} />
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
      Crear Asignatura
    </CButton>


    {/* Tabla para mostrar ciclos */}
    {/* Contenedor de tabla con scroll */}
    <div className="table-container" style={{ maxHeight: '220px', overflowY: 'scroll', marginBottom: '20px' }}>
        <CTable striped bordered hover>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell>#</CTableHeaderCell>
              <CTableHeaderCell>Nombre del Asignatura</CTableHeaderCell>
              <CTableHeaderCell>Descripcion Asignatura</CTableHeaderCell>
              <CTableHeaderCell>Acciones</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {currentRecords.map((asignatura) => (
              <CTableRow key={asignatura.Cod_asignatura}>
                <CTableDataCell>
                  {/* Mostrar el índice original en lugar del índice basado en la paginación */}
                  {asignatura.originalIndex} 
                </CTableDataCell>
                <CTableDataCell>{asignatura.Nombre_asignatura}</CTableDataCell>
                <CTableDataCell>{asignatura.Descripcion_asignatura}</CTableDataCell>
                <CTableDataCell>
                  <CButton color="info" style={{ marginRight: '10px' }} onClick={() => openUpdateModal(asignatura)}>
                    <CIcon icon={cilPen} />
                  </CButton>
                  <CButton color="danger" style={{ marginRight: '10px' }} onClick={() => openDeleteModal(asignatura)}>
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
          disabled={currentPage === Math.ceil(filteredAsignaturas.length / recordsPerPage)} // Deshabilitar si estás en la última página
          onClick={() => paginate(currentPage + 1)}>
          Siguiente
       </CButton>
     </CPagination>
      {/* Mostrar total de páginas */}
      <span style={{ marginLeft: '10px' }}>
        Página {currentPage} de {Math.ceil(filteredAsignaturas.length / recordsPerPage)}
      </span>
   </div>


    {/* Modal Crear Asignatura*/}
    <CModal visible={modalVisible} onClose={() => setModalVisible(false)}>
      <CModalHeader>
        <CModalTitle>Crear una Nueva Asignatura</CModalTitle>
        </CModalHeader>
        <CModalBody>
        <CForm>
                   <CInputGroup className="mb-3">
            <CInputGroupText>Nombre de la Asignatura</CInputGroupText>
            <CFormInput
              type="text"
              value={nueva_Asignatura.Nombre_asignatura}
              onChange={(e) => setNueva_Asignatura({ ...nueva_Asignatura, Nombre_asignatura: e.target.value })}
            />
          </CInputGroup>
          <CInputGroup className="mb-3">
            <CInputGroupText>Descripcion de la Asignatura</CInputGroupText>
            <CFormInput
              type="text"
              value={nueva_Asignatura.Descripcion_asignatura}
              onChange={(e) => setNueva_Asignatura({ ...nueva_Asignatura, Descripcion_asignatura: e.target.value })}
            />
          </CInputGroup>
          
        
        </CForm>

        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setModalVisible(false)}>
            Cancelar
          </CButton>
          <CButton color="success" style={{ color: 'white' }} onClick={handleCreateAsignatura}>
            Crear Asignatura
          </CButton>
        </CModalFooter>
      </CModal>

    {/* Modal Actualizar Asignatura */}
    <CModal visible={modalUpdateVisible} onClose={() => setModalUpdateVisible(false)}>
      <CModalHeader>
      <CModalTitle>Actualizar Asignatura</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <CForm>
          <CInputGroup className="mb-3">
            <CInputGroupText>Nombre de la Asignatura</CInputGroupText>
            <CFormInput
              placeholder="Ingrese la nueva asignatura"
              value={asignaturaToUpdate.Nombre_asignatura}
              onChange={(e) => setAsignaturaToUpdate({ ...asignaturaToUpdate, Nombre_asignatura: e.target.value })}
            />
          </CInputGroup>

          <CInputGroup className="mb-3">
            <CInputGroupText>Descripcion de la Asignatura</CInputGroupText>
            <CFormInput
              placeholder="Ingrese una descripcion nueva"
              value={asignaturaToUpdate.Descripcion_asignatura}
              onChange={(e) => setAsignaturaToUpdate({ ...asignaturaToUpdate, Descripcion_asignatura: e.target.value })}
            />
          </CInputGroup>


        </CForm>
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={() => setModalUpdateVisible(false)}>
          Cancelar
        </CButton>
        <CButton color="info" style={{ color: 'white' }}  onClick={handleUpdateAsignatura}>
          Actualizar Asignatura
        </CButton>
      </CModalFooter>
    </CModal>

    {/* Modal Eliminar Asignatura */}
    <CModal visible={modalDeleteVisible} onClose={() => setModalDeleteVisible(false)}>
      <CModalHeader>
      <CModalTitle>Confirmar Eliminación</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <p>¿Estás seguro de que deseas eliminar la asignatura: <strong>{AsignaturaToDelete.Nombre_asignatura}</strong>?</p>
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={() => setModalDeleteVisible(false)}>
          Cancelar
        </CButton>
        <CButton color="danger" style={{ color: 'white' }}  onClick={handleDeleteAsignatura}>
          Eliminar Asignatura
        </CButton>
      </CModalFooter>
    </CModal>
 </CContainer>
  );
};


export default ListaAsignaturas;