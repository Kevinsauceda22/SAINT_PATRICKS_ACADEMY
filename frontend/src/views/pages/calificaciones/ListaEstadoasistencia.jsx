import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CIcon } from '@coreui/icons-react';
import {  cilPen, cilTrash, cilPlus, cilSave } from '@coreui/icons'; // Importar iconos específicos
import swal from 'sweetalert2';
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
    // Convertir a formato "Primera letra mayúscula, el resto minúsculas"
    const formattedEstado = nuevoEstadoasistencia
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  
    try {
      const response = await fetch('http://localhost:4000/api/estadoAsistencia/crearestadoasistencias', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ Descripcion_asistencia: formattedEstado }),  // Enviar descripción formateada
      });
  
      const result = await response.json();
  
      if (response.ok) {
        fetchEstadoasistencia();  // Actualiza la lista de estados de asistencia
        setModalVisible(false);  // Cierra el modal
        setNuevoEstadoasistencia('');  // Limpia el campo de entrada
        swal.fire({
          icon: 'success',
          title: 'Creación exitosa',
          text: 'El estado asistencia se ha creado correctamente.',
        });
      } else {
        swal.fire({
          icon: 'error',
          title: 'Error de validación',
          text: result.Mensaje || 'Hubo un error al crear el estado asistencia.',
        });
      }
    } catch (error) {
      console.error('Error al crear el estado asistencia:', error);
      swal.fire({
        icon: 'error',
        title: 'Error en el servidor',
        text: 'Hubo un error en el servidor. Inténtalo más tarde.',
      });
    }
  };
  
  
  const handleUpdateEstadoasistencia = async () => {
    // Convertir a formato "Primera letra mayúscula, el resto minúsculas"
    const formattedEstado = estadonasistenciaToUpdate.Descripcion_asistencia
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  
    try {
      const response = await fetch('http://localhost:4000/api/estadoAsistencia/actualizarestadoasistencias', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          Cod_estado_asistencia: estadonasistenciaToUpdate.Cod_estado_asistencia,
          Descripcion_asistencia: formattedEstado, // Usar la descripción formateada
        }),
      });
  
      const result = await response.json();
  
      if (response.ok) {
        fetchEstadoasistencia(); // Refrescar la lista de estados de asistencia
        setModalUpdateVisible(false); // Cerrar el modal de actualización
        setEstadoasistenciaToUpdate({}); // Resetear el objeto a actualizar
        swal.fire({
          icon: 'success',
          title: 'Actualización exitosa',
          text: 'El estado asistencia se ha actualizado correctamente.',
        });
      } else {
        swal.fire({
          icon: 'error',
          title: 'Error',
          text: result.Mensaje || 'Hubo un error al actualizar el estado asistencia.',
        });
      }
    } catch (error) {
      console.error('Error al actualizar el estado asistencia:', error);
      swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un error en el servidor.',
      });
    }
  };
  

const handleDeleteEstadoasistencia = async () => {
  try {
    const response = await fetch('http://localhost:4000/api/estadoAsistencia/eliminarestadoasistencias', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        Cod_estado_asistencia: estadonasistenciaToDelete.Cod_estado_asistencia
      }), // Enviar Cod_estado_asistencia en el cuerpo
    });

    // Parsear la respuesta JSON del servidor
    const result = await response.json();

    if (response.ok) {
      // Si la respuesta es exitosa
      fetchEstadoasistencia(); // Refrescar la lista de estados de asistencia
      setModalDeleteVisible(false); // Cerrar el modal de confirmación
      setEstadoasistenciaToDelete({}); // Resetear el objeto a eliminar
      swal.fire({
        icon: 'success',
        title: 'Eliminación exitosa',
        text: 'El estado asistencia se ha eliminado correctamente.',
      });
    } else {
      // Si hubo un error, mostrar el mensaje devuelto por el servidor
      swal.fire({
        icon: 'error',
        title: 'Error',
        text: result.Mensaje || 'Hubo un error al eliminar el estado asistencia.',
      });
    }
  } catch (error) {
    // Manejo de errores inesperados (como problemas de red)
    console.error('Error al eliminar el estado asistencia:', error);
    swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Hubo un error en el servidor.',
    });
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
  {/* Contenedor del h1 */}
    <h1 >Mantenimiento Estado asistencia</h1>
    {/* Contenedor de la barra de búsqueda y el botón "Nuevo" */}
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', justifyContent: 'space-between' }}>
      {/* Barra de búsqueda */}
      <CInputGroup style={{ marginTop: '30px', width: '400px' }}>
        <CInputGroupText>Buscar</CInputGroupText>
        <CFormInput placeholder="Buscar estado asistencia..." onChange={handleSearch} value={searchTerm} />
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



    {/* Tabla para mostrar Estadoasistencia */}
    {/* Contenedor de tabla con scroll */}
    <div className="table-container" style={{ maxHeight: '400px', overflowY: 'scroll', marginBottom: '20px' }}>
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
                  <CButton  style={{ backgroundColor: '#F9B64E',marginRight: '10px' }} onClick={() => openUpdateModal(estadonasistencia)}>
                    <CIcon icon={cilPen} />
                  </CButton>
                  <CButton  style={{ backgroundColor: '#E57368', marginRight: '10px' }} onClick={() => openDeleteModal(estadonasistencia)}>
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
    <CModal visible={modalVisible} onClose={() => setModalVisible(false)} backdrop="static">
      <CModalHeader>
        <CModalTitle>Nuevo Estado Asistencia</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CInputGroup className="mb-3">
              <CInputGroupText>Descripción</CInputGroupText>
              <CFormInput
                placeholder="Ingrese la descripción del estado"
                value={nuevoEstadoasistencia}
                maxLength={50} // Limitar a 50 caracteres
                onChange={(e) => {
                  const value = e.target.value
                    .trimStart() // Evitar espacios al inicio
                    .replace(/\s+/g, ' '); // Reemplazar múltiples espacios por uno solo

                  const regex = /^[a-zA-Z\s]*$/; // Solo letras y espacios
                  if (regex.test(value)) {
                    setNuevoEstadoasistencia(value);
                  } else {
                    swal.fire({
                      icon: 'warning',
                      title: 'Caracteres no permitidos',
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
          <CButton  style={{ backgroundColor: '#4B6251',color: 'white' }} onClick={handleCreateEstadoasistencia}>
          <CIcon icon={cilSave} style={{ marginRight: '5px' }} /> Guardar
          </CButton>
        </CModalFooter>
      </CModal>

    {/* Modal Actualizar Estado Asistencia*/}
    <CModal visible={modalUpdateVisible} onClose={() => setModalUpdateVisible(false)} backdrop="static">
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
              maxLength={50} // Limitar a 50 caracteres
              onChange={(e) => {
                const value = e.target.value
                  .trimStart() // Evitar espacios al inicio
                  .replace(/\s+/g, ' '); // Reemplazar múltiples espacios por uno solo

                const regex = /^[a-zA-Z\s]*$/; // Solo letras y espacios
                if (regex.test(value)) {
                  setEstadoasistenciaToUpdate({ ...estadonasistenciaToUpdate, Descripcion_asistencia: value });
                } else {
                  swal.fire({
                    icon: 'warning',
                    title: 'Caracteres no permitidos',
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
        <CButton  style={{  backgroundColor: '#F9B64E',color: 'white' }}  onClick={handleUpdateEstadoasistencia}>
        <CIcon icon={cilPen} style={{ marginRight: '5px' }} /> Actualizar
        </CButton>
      </CModalFooter>
    </CModal>

    {/* Modal Eliminar estado Asistencia */}
    <CModal visible={modalDeleteVisible} onClose={() => setModalDeleteVisible(false)} backdrop="static">
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
        <CButton  style={{  backgroundColor: '#E57368',color: 'white' }}  onClick={handleDeleteEstadoasistencia}>
        <CIcon icon={cilTrash} style={{ marginRight: '5px' }} /> Eliminar
        </CButton>
      </CModalFooter>
    </CModal>
 </CContainer>
  );
};


export default ListaEstadoasistencia;