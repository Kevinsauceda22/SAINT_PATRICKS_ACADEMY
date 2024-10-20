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


const ListaParciales = () => {
  const [Parciales, setParciales] = useState([]);
  const [modalVisible, setModalVisible] = useState(false); // Estado para el modal de crear ciclo
  const [modalUpdateVisible, setModalUpdateVisible] = useState(false); // Estado para el modal de actualizar ciclo
  const [modalDeleteVisible, setModalDeleteVisible] = useState(false); // Estado para el modal de eliminar ciclo
  const [nuevoParcial, setNuevoParcial] = useState(''); // Estado para el nuevo ciclo
  const [parcialToUpdate, setParcialesToUpdate] = useState({}); // Estado para el ciclo a actualizar
  const [parcialToDelete, setParcialToDelete] = useState({}); // Estado para el ciclo a eliminar
  const [searchTerm, setSearchTerm] = useState('');

  const [currentPage, setCurrentPage] = useState(1); // Estado para la página actual
  const [recordsPerPage] = useState(5); // Mostrar 5 registros por página

  useEffect(() => {
    fetchParciales();
  }, []);

  const fetchParciales = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/parciales/verParciales');
      const data = await response.json();
      // Asignar un índice original basado en el orden en la base de datos
    const dataWithIndex = data.map((parcial, index) => ({
      ...parcial,
      originalIndex: index + 1, // Guardamos la secuencia original
    }));
    
    setParciales(dataWithIndex);
    } catch (error) {
      console.error('Error al obtener los parciales:', error);
    }
  };

  const handleCreateParcial = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/parciales/crearParcial', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(nuevoParcial),
      });

      if (response.ok) {
        fetchParciales();
        setModalVisible(false);
        setNuevoParcial('');
      } else {
        console.error('Error al crear el parcial:', response.statusText);
      }
    } catch (error) {
      console.error('Error al crear el parcial:', error);
    }
  };


  
  const handleUpdateParcial = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/parciales/actualizarParcial', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ Cod_parcial: parcialToUpdate.Cod_parcial, Nombre_parcial: parcialToUpdate.Nombre_parcial, Nota_recuperacion: parcialToUpdate.Nota_recuperacion }), // Envío del nombre actualizado y Cod_ciclo en el cuerpo
      });

      if (response.ok) {
        fetchParciales(); // Refrescar la lista de ciclos después de la actualización
        setModalUpdateVisible(false); // Cerrar el modal de actualización
        setParcialesToUpdate({}); // Resetear el ciclo a actualizar
      } else {
        console.error('Error al actualizar el parcial:', response.statusText);
      }
    } catch (error) {
      console.error('Error al actualizar el parcial:', error);
    }
  };


  const handleDeleteParcial = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/parciales/eliminar_parcial', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ Cod_parcial: parcialToDelete.Cod_parcial }), // Enviar Cod_ciclo en el cuerpo
      });

      if (response.ok) {
        fetchParciales(); // Refrescar la lista de ciclos después de la eliminación
        setModalDeleteVisible(false); // Cerrar el modal de confirmación
        setParcialToDelete({}); // Resetear el ciclo a eliminar
      } else {
        console.error('Error al eliminar el parcial:', response.statusText);
      }
    } catch (error) {
      console.error('Error al eliminar el parcial:', error);
    }
  };

  const openUpdateModal = (parcial) => {
    setParcialesToUpdate(parcial); // Cargar los datos del ciclo a actualizar
    setModalUpdateVisible(true); // Abrir el modal de actualización
  };

  const openDeleteModal = (parcial) => {
    setParcialToDelete(parcial); // Guardar el ciclo que se desea eliminar
    setModalDeleteVisible(true); // Abrir el modal de confirmación
  };

 // Cambia el estado de la página actual después de aplicar el filtro
  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1); // Resetear a la primera página al buscar
  };

  // Filtro de búsqueda
  const filteredParciales = Parciales.filter((parcial) =>
    parcial.Nombre_parcial.toLowerCase().includes(searchTerm.toLowerCase())
  );

 // Lógica de paginación
 const indexOfLastRecord = currentPage * recordsPerPage;
 const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
 const currentRecords = filteredParciales.slice(indexOfFirstRecord, indexOfLastRecord);

 // Cambiar página
const paginate = (pageNumber) => {
  if (pageNumber > 0 && pageNumber <= Math.ceil(filteredParciales.length / recordsPerPage)) {
    setCurrentPage(pageNumber);
  }
}
 return (//boton de busqueda
  <CContainer>
    <h1>Lista de Parciales</h1>
    {/* Barra de búsqueda */}
    <CInputGroup style={{ marginBottom: '20px', width: '400px', float: 'right' }}>
    <CInputGroupText>Buscar</CInputGroupText>
    <CFormInput placeholder="Buscar parcial..." onChange={handleSearch} value={searchTerm} />
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
      Crear Parcial
    </CButton>


    {/* Tabla para mostrar ciclos */}
    {/* Contenedor de tabla con scroll */}
    <div className="table-container" style={{ maxHeight: '220px', overflowY: 'scroll', marginBottom: '20px' }}>
        <CTable striped bordered hover>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell>#</CTableHeaderCell>
              {/* <CTableHeaderCell>Codigo Parcial</CTableHeaderCell> */}
              <CTableHeaderCell>Nombre del Parcial</CTableHeaderCell>
              <CTableHeaderCell>Nota Recuperacion</CTableHeaderCell>
              <CTableHeaderCell>Acciones</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {currentRecords.map((parcial) => (
              <CTableRow key={parcial.Cod_parcial}>
                <CTableDataCell>
                  {/* Mostrar el índice original en lugar del índice basado en la paginación */}
                  {parcial.originalIndex} 
                </CTableDataCell>
                {/* <CTableDataCell>{parcial.Cod_parcial}</CTableDataCell> */}
                <CTableDataCell>{parcial.Nombre_parcial}</CTableDataCell>
                <CTableDataCell>{parcial.Nota_recuperacion}</CTableDataCell>
                <CTableDataCell>
                  <CButton color="info"   style={{ marginRight: '10px' }} onClick={() => openUpdateModal(parcial)}>
                    <CIcon icon={cilPen} />
                  </CButton>
                  <CButton color="danger" style={{ marginRight: '10px' }} onClick={() => openDeleteModal(parcial)}>
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
          disabled={currentPage === Math.ceil(filteredParciales.length / recordsPerPage)} // Deshabilitar si estás en la última página
          onClick={() => paginate(currentPage + 1)}>
          Siguiente
       </CButton>
     </CPagination>
      {/* Mostrar total de páginas */}
      <span style={{ marginLeft: '10px' }}>
        Página {currentPage} de {Math.ceil(filteredParciales.length / recordsPerPage)}
      </span>
   </div>


    {/* Modal Crear Parcial */}
    <CModal visible={modalVisible} onClose={() => setModalVisible(false)}>
      <CModalHeader>
        <CModalTitle>Crear un Nuevo Parcial</CModalTitle>
        </CModalHeader>
        <CModalBody>
          
        <CForm>
          <CInputGroup className="mb-3">
            <CInputGroupText>Nombre del Parcial</CInputGroupText>
            <CFormInput
              type="text"
              value={nuevoParcial.Nombre_parcial}
              onChange={(e) => setNuevoParcial({ ...nuevoParcial, Nombre_parcial: e.target.value })}
            />
          </CInputGroup>
          <CInputGroup className="mb-3">
            <CInputGroupText>Nota Recuperacion</CInputGroupText>
            <CFormInput
              type="number"
              value={nuevoParcial.Nota_recuperacion}
              onChange={(e) => setNuevoParcial({ ...nuevoParcial, Nota_recuperacion: e.target.value })}
            />
          </CInputGroup>
          
          

        </CForm>

        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setModalVisible(false)}>
            Cancelar
          </CButton>
          <CButton color="success" style={{ color: 'white' }} onClick={handleCreateParcial}>
            Crear Parcial
          </CButton>
        </CModalFooter>
      </CModal>

    {/* Modal Actualizar Parcial */}
    <CModal visible={modalUpdateVisible} onClose={() => setModalUpdateVisible(false)}>
      <CModalHeader>
      <CModalTitle>Actualizar Parcial</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <CForm>
          <CInputGroup className="mb-3">
            <CInputGroupText>Nombre del Parcial</CInputGroupText>
            <CFormInput
              placeholder="Ingrese el nuevo nombre del parcial"
              value={parcialToUpdate.Nombre_parcial}
              onChange={(e) => setParcialesToUpdate({ ...parcialToUpdate, Nombre_parcial: e.target.value })}
            />
          </CInputGroup>
          <CInputGroup className="mb-3">
            <CInputGroupText>Nota Recuperacion</CInputGroupText>
            <CFormInput
              placeholder="Ingrese la nueva nota"
              value={parcialToUpdate.Nota_recuperacion}
              onChange={(e) => setParcialesToUpdate({ ...parcialToUpdate, Nota_recuperacion: e.target.value })}
            />
          </CInputGroup>
        </CForm>
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={() => setModalUpdateVisible(false)}>
          Cancelar
        </CButton>
        <CButton color="info" style={{ color: 'white' }}  onClick={handleUpdateParcial}>
          Actualizar Parcial
        </CButton>
      </CModalFooter>
    </CModal>

    {/* Modal Eliminar Parcial */}
    <CModal visible={modalDeleteVisible} onClose={() => setModalDeleteVisible(false)}>
      <CModalHeader>
      <CModalTitle>Confirmar Eliminación</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <p>¿Estás seguro de que deseas eliminar el parcial: <strong>{parcialToDelete.Nombre_parcial}</strong>?</p>
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={() => setModalDeleteVisible(false)}>
          Cancelar
        </CButton>
        <CButton color="danger" style={{ color: 'white' }}  onClick={handleDeleteParcial}>
          Eliminar
        </CButton>
      </CModalFooter>
    </CModal>
 </CContainer>
  );
};


export default ListaParciales;