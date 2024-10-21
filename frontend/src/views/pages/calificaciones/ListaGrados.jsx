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
  CFormSelect,
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


const ListaGrados = () => {
  const [grados, setGrados] = useState([]);
  const [ciclos, setCiclos] = useState([]); // Estado para almacenar los ciclos
  const [modalVisible, setModalVisible] = useState(false); // Estado para el modal de crear grado
  const [modalUpdateVisible, setModalUpdateVisible] = useState(false); // Estado para el modal de actualizar grado
  const [modalDeleteVisible, setModalDeleteVisible] = useState(false); // Estado para el modal de eliminar grado
  const [nuevoGrado, setNuevoGrado] = useState(''); // Estado para el nuevo grado
  const [nuevoCiclo, setNuevoCiclo] = useState('');
  const [gradoToUpdate, setGradoToUpdate] = useState({}); // Estado para el grado a actualizar
  const [gradoToDelete, setGradoToDelete] = useState({}); // Estado para el grado a eliminar
  const [searchTerm, setSearchTerm] = useState('');

  const [currentPage, setCurrentPage] = useState(1); // Estado para la página actual
  const [recordsPerPage] = useState(5); // Mostrar 5 registros por página

  useEffect(() => {
    fetchGrados();
    fetchCiclos(); // Llama a la función para obtener ciclos
  }, []);

  const fetchCiclos = async () => { // Asegúrate de que esta función esté definida
    try {
      const response = await fetch('http://localhost:4000/api/ciclos/verCiclos');
      const data = await response.json();
      setCiclos(data);
    } catch (error) {
      console.error('Error al obtener los ciclos:', error);
    }

         const getCicloName = (codCiclo) => {
        if (!ciclos.length) return 'Ciclos no disponibles'; // Mensaje alternativo si no hay ciclos
        const ciclo = ciclos.find((c) => c.Cod_ciclo === codCiclo);
        return ciclo ? ciclo.Nombre_ciclo : 'Ciclo no encontrado';
      };

  };

  const getCicloName = (codCiclo) => {
    if (!ciclos.length) return 'Ciclos no disponibles'; // Mensaje alternativo si no hay ciclos
    const ciclo = ciclos.find((c) => c.Cod_ciclo === codCiclo);
    return ciclo ? ciclo.Nombre_ciclo : 'Ciclo no encontrado';
  };


  const fetchGrados = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/grados/verGrados');
      const data = await response.json();
      // Asignar un índice original basado en el orden en la base de datos
    const dataWithIndex = data.map((grado, index) => ({
      ...grado,
      originalIndex: index + 1, // Guardamos la secuencia original
    }));


    setGrados(dataWithIndex);
    } catch (error) {
      console.error('Error al obtener los grados:', error);
    }
  };

  const handleCreateGrado = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/grados/crearGrado', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({Cod_ciclo: nuevoCiclo, Nombre_grado: nuevoGrado}),
      });

      if (response.ok) {
        fetchGrados();
        setModalVisible(false);
        setNuevoCiclo('');  // Restablecer estado de ciclo
        setNuevoGrado('');  // Restablecer estado de grado      } else {
        console.error('Error al crear el grado:', response.statusText);
      }
    } catch (error) {
      console.error('Error al crear el grado:', error);
    }
  };


  
  const handleUpdateGrado = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/grados/actualizarGrado', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ Cod_grado: gradoToUpdate.Cod_grado, Cod_ciclo: gradoToUpdate.Cod_ciclo, Nombre_grado: gradoToUpdate.Nombre_grado }), // Envío del nombre actualizado y Cod_grado en el cuerpo
      });

      if (response.ok) {
        fetchGrados(); // Refrescar la lista de grados después de la actualización
        setModalUpdateVisible(false); // Cerrar el modal de actualización
        setGradoToUpdate({}); // Resetear el grado a actualizar
      } else {
        console.error('Error al actualizar el grado:', response.statusText);
      }
    } catch (error) {
      console.error('Error al actualizar el grado:', error);
    }
  };


  const handleDeleteGrado = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/grados/eliminarGrado', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ Cod_grado: gradoToDelete.Cod_grado }), // Enviar Cod_grado en el cuerpo
      });

      if (response.ok) {
        fetchGrados(); // Refrescar la lista de grados después de la eliminación
        setModalDeleteVisible(false); // Cerrar el modal de confirmación
        setGradoToDelete({}); // Resetear el grado a eliminar
      } else {
        console.error('Error al eliminar el grado:', response.statusText);
      }
    } catch (error) {
      console.error('Error al eliminar el grado:', error);
    }
  };

  const openUpdateModal = (grado) => {
    setGradoToUpdate(grado); // Cargar los datos del grado a actualizar
    setModalUpdateVisible(true); // Abrir el modal de actualización
  };

  const openDeleteModal = (grado) => {
    setGradoToDelete(grado); // Guardar el grado que se desea eliminar
    setModalDeleteVisible(true); // Abrir el modal de confirmación
  };

 // Cambia el estado de la página actual después de aplicar el filtro
  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1); // Resetear a la primera página al buscar
  };

  // Filtro de búsqueda
  const filteredGrados = grados.filter((grado) =>
    grado.Nombre_grado.toLowerCase().includes(searchTerm.toLowerCase())
  );

 // Lógica de paginación
 const indexOfLastRecord = currentPage * recordsPerPage;
 const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
 const currentRecords = filteredGrados.slice(indexOfFirstRecord, indexOfLastRecord);

 // Cambiar página
const paginate = (pageNumber) => {
  if (pageNumber > 0 && pageNumber <= Math.ceil(filteredGrados.length / recordsPerPage)) {
    setCurrentPage(pageNumber);
  }
}
 return (
  <CContainer>
    <h1>Lista de Grados</h1>
    {/* Barra de búsqueda */}
    <CInputGroup style={{ marginBottom: '20px', width: '400px', float: 'right' }}>
    <CInputGroupText>Buscar</CInputGroupText>
    <CFormInput placeholder="Buscar grado..." onChange={handleSearch} value={searchTerm} />
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
      Crear Grado
    </CButton>


    {/* Tabla para mostrar ciclos */}
    {/* Contenedor de tabla con scroll */}
    <div className="table-container" style={{ maxHeight: '220px', overflowY: 'scroll', marginBottom: '20px' }}>

      {/* Tabla para mostrar los grados */}
      <CTable striped bordered hover>
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell>#</CTableHeaderCell>
            <CTableHeaderCell>Nombre Grado</CTableHeaderCell>
            <CTableHeaderCell>Ciclo</CTableHeaderCell>
            <CTableHeaderCell>Acciones</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {currentRecords.map((grado, index) => (
            <CTableRow key={grado.Cod_grado}>
              <CTableDataCell>{grado.originalIndex}</CTableDataCell>
              <CTableDataCell>{grado.Nombre_grado}</CTableDataCell>
              <CTableDataCell>{getCicloName(grado.Cod_ciclo)}</CTableDataCell>
              <CTableDataCell>
                  <CButton color="info" style={{ marginRight: '10px' }} onClick={() => openUpdateModal(grado)}>
                    <CIcon icon={cilPen} />
                  </CButton>
                  <CButton color="danger" style={{ marginRight: '10px' }} onClick={() => openDeleteModal(grado)}>
                    <CIcon icon={cilTrash} />
                  </CButton>
                  <CButton  color="primary" style={{ marginRight: '10px' }}>
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
          disabled={currentPage === Math.ceil(filteredGrados.length / recordsPerPage)} // Deshabilitar si estás en la última página
          onClick={() => paginate(currentPage + 1)}>
          Siguiente
       </CButton>
     </CPagination>
      {/* Mostrar total de páginas */}
      <span style={{ marginLeft: '10px' }}>
        Página {currentPage} de {Math.ceil(filteredGrados.length / recordsPerPage)}
      </span>
   </div>


    {/* Modal Crear Ciclo */}
    <CModal visible={modalVisible} onClose={() => setModalVisible(false)}>
      <CModalHeader>
        <CModalTitle>Crear Nuevo Grado</CModalTitle>
        </CModalHeader>
        <CModalBody>
        <CForm>
      <CInputGroup className="mb-3">
        <CInputGroupText>Código Ciclo</CInputGroupText>
        <CFormSelect 
          aria-label="Seleccionar ciclo"
          value={nuevoCiclo}
          onChange={(e) => setNuevoCiclo(e.target.value)} // Actualiza el estado cuando se selecciona un ciclo
        >
          <option value="">Seleccione un ciclo</option> {/* Opción predeterminada */}
          {ciclos.map((ciclo) => (
            <option key={ciclo.Cod_ciclo} value={ciclo.Cod_ciclo}>
              {ciclo.Nombre_ciclo}
            </option>
          ))}
        </CFormSelect>
      </CInputGroup>
      <CInputGroup className="mb-3">
        <CInputGroupText>Nombre Grado</CInputGroupText>
        <CFormInput
          placeholder="Ingrese el nombre del grado"
          value={nuevoGrado}
          onChange={(e) => setNuevoGrado(e.target.value)}
        />
      </CInputGroup>
    </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setModalVisible(false)}>
            Cancelar
          </CButton>
          <CButton color="success" style={{ color: 'white' }} onClick={handleCreateGrado}>
            Crear Grado
          </CButton>
        </CModalFooter>
      </CModal>

    {/* Modal Actualizar Grado */}
    <CModal visible={modalUpdateVisible} onClose={() => setModalUpdateVisible(false)}>
      <CModalHeader>
      <CModalTitle>Actualizar Grado</CModalTitle>
      </CModalHeader>
      <CModalBody>
      <CForm>
      <CInputGroup className="mb-3">
        <CInputGroupText>Código Ciclo</CInputGroupText>
        <CFormSelect 
          aria-label="Seleccionar ciclo"
          value={gradoToUpdate.Cod_ciclo} // Usa el código ciclo del grado a actualizar
          onChange={(e) => setGradoToUpdate({ ...gradoToUpdate, Cod_ciclo: e.target.value })} // Actualiza el estado
        >
          <option value="">Seleccione un ciclo</option> {/* Opción predeterminada */}
          {ciclos.map((ciclo) => (
            <option key={ciclo.Cod_ciclo} value={ciclo.Cod_ciclo}>
              {ciclo.Nombre_ciclo}
            </option>
          ))}
        </CFormSelect>
      </CInputGroup>
      <CInputGroup className="mb-3">
        <CInputGroupText>Nombre Grado</CInputGroupText>
        <CFormInput
          placeholder="Ingrese el nombre del grado"
          value={gradoToUpdate.Nombre_grado}
          onChange={(e) => setGradoToUpdate({ ...gradoToUpdate, Nombre_grado: e.target.value })}
        />
      </CInputGroup>
    </CForm>
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={() => setModalUpdateVisible(false)}>
          Cancelar
        </CButton>
        <CButton color="info" style={{ color: 'white' }}  onClick={handleUpdateGrado}>
          Actualizar Grado
        </CButton>
      </CModalFooter>
    </CModal>

    {/* Modal Eliminar Grado */}
    <CModal visible={modalDeleteVisible} onClose={() => setModalDeleteVisible(false)}>
      <CModalHeader>
      <CModalTitle>Confirmar Eliminación</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <p>¿Estás seguro de que deseas eliminar el grado: <strong>{gradoToDelete.Nombre_grado }</strong>?</p>
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={() => setModalDeleteVisible(false)}>
          Cancelar
        </CButton>
        <CButton color="danger" style={{ color: 'white' }}  onClick={handleDeleteGrado}>
          Eliminar Grado
        </CButton>
      </CModalFooter>
    </CModal>
 </CContainer>
  );
};


export default ListaGrados;