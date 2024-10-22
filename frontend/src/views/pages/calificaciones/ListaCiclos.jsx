import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CIcon } from '@coreui/icons-react';
import {  cilPen, cilTrash, cilPlus,cilSave } from '@coreui/icons'; // Importar iconos específicos
import Swal from 'sweetalert2';


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

  const validarCiclo = () => {
    if (!nuevoCiclo.Nombre_ciclo) {
      Swal.fire('Error', 'El nombre del ciclo es obligatorio', 'error');
      return false;
    }
    return true;
  };


  const handleCreateCiclo = async () => {
    if (!validarCiclo()) return;
    try {
      const response = await fetch('http://localhost:4000/api/ciclos/crearCiclo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(nuevoCiclo),
      });

      if (response.ok) {
        fetchCiclos();
        setModalVisible(false);
        setNuevoCiclo('');

       Swal.fire('Creado', 'El ciclo ha sido creado exitosamente', 'success');
      } else {
        Swal.fire('Error', 'Hubo un problema al crear el ciclo', 'error');
      }
    } catch (error) {
      Swal.fire('Error', 'Hubo un problema al crear el ciclo', 'error');
    }
  };  


  const handleUpdateCiclo = async () => {
    if (!cicloToUpdate.Nombre_ciclo) {
      Swal.fire('Error', 'El nombre del ciclo es obligatorio', 'error');
      return false;
    }
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
        Swal.fire('Actualizado', 'El ciclo ha sido actualizado correctamente', 'success');
      } else {
        Swal.fire('Error', 'Hubo un problema al actualizar el ciclo', 'error');
      }
      if (!cicloToUpdate.Nombre_ciclo) {
        Swal.fire('Error', 'El nombre del ciclo es obligatorio', 'error');
        return false;
      }
    } catch (error) {
      Swal.fire('Error', 'Hubo un problema al actualizar el ciclo', 'error');
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
        Swal.fire('Eliminado', 'El ciclo ha sido eliminado correctamente', 'success');
      } else {
        Swal.fire('Error', 'Hubo un problema al eliminar el ciclo', 'error');
      }
    } catch (error) {
      Swal.fire('Error', 'Hubo un problema al eliminar el ciclo', 'error');
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
    <h1>Mantenimiento Ciclos</h1>
    {/* Contenedor de la barra de búsqueda y el botón "Nuevo" */}
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', justifyContent: 'space-between' }}>
      {/* Barra de búsqueda */}
      <CInputGroup style={{ marginTop: '30px', width: '400px' }}>
        <CInputGroupText>Buscar</CInputGroupText>
        <CFormInput placeholder="Buscar ciclo..." onChange={handleSearch} value={searchTerm} />
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


    {/* Tabla para mostrar ciclos */}
    {/* Contenedor de tabla con scroll */}
    <div className="table-container" style={{ maxHeight: '400px', overflowY: 'scroll', marginBottom: '20px' }}>
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
                  <CButton style={{ backgroundColor: '#F9B64E',marginRight: '10px' }} onClick={() => openUpdateModal(ciclo)}>
                    <CIcon icon={cilPen} />
                  </CButton>
                  <CButton style={{ backgroundColor: '#E57368', marginRight: '10px' }} onClick={() => openDeleteModal(ciclo)}>
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
    <CModal visible={modalVisible} onClose={() => setModalVisible(false)} backdrop="static">
      <CModalHeader>
        <CModalTitle>Nuevo Ciclo</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CInputGroup className="mb-3">
              <CInputGroupText>Nombre del Ciclo</CInputGroupText>
              <CFormInput
              type="text"
              placeholder="Ingrese el nombre del ciclo"
              maxLength={20}
              value={nuevoCiclo.Nombre_ciclo}
              onChange={(e) => {
                // Remover cualquier caracter especial del valor ingresado
                const regex = /^[a-zA-Z\s]*$/; // Solo permite letras y espacios
                if (regex.test(e.target.value)) {
                  setNuevoCiclo({ ...nuevoCiclo, Nombre_ciclo: e.target.value });
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
          <CButton style={{ backgroundColor: '#4B6251',color: 'white' }} onClick={handleCreateCiclo}>
          <CIcon icon={cilSave} style={{ marginRight: '5px' }} /> Guardar
          </CButton>
        </CModalFooter>
      </CModal>

    {/* Modal Actualizar Ciclo */}
    <CModal visible={modalUpdateVisible} onClose={() => setModalUpdateVisible(false)} backdrop="static">
      <CModalHeader>
      <CModalTitle>Actualizar Ciclo</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <CForm>
          <CInputGroup className="mb-3">
            <CInputGroupText>Nombre del Ciclo</CInputGroupText>
            <CFormInput
              maxLength={20}
              placeholder="Ingrese el nuevo nombre del ciclo"
              value={cicloToUpdate.Nombre_ciclo}
              onChange={(e) => {
                // Remover cualquier caracter especial del valor ingresado
                const regex = /^[a-zA-Z\s]*$/; // Solo permite letras y espacios
                if (regex.test(e.target.value)) {
                  setCicloToUpdate({
                    ...cicloToUpdate,
                    Nombre_ciclo: e.target.value,
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
        <CButton style={{  backgroundColor: '#F9B64E',color: 'white' }}  onClick={handleUpdateCiclo}>
        <CIcon icon={cilPen} style={{ marginRight: '5px' }} />Actualizar
        </CButton>
      </CModalFooter>
    </CModal>

    {/* Modal Eliminar Ciclo */}
    <CModal visible={modalDeleteVisible} onClose={() => setModalDeleteVisible(false)} backdrop="static">
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
        <CButton style={{  backgroundColor: '#E57368',color: 'white' }}  onClick={handleDeleteCiclo}>
        <CIcon icon={cilTrash} style={{ marginRight: '5px' }} />Eliminar
        </CButton>
      </CModalFooter>
    </CModal>
 </CContainer>
  );
};


export default ListaCiclos;