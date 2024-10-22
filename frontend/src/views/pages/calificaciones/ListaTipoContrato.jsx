import React, { useEffect, useState } from 'react';
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
import { cilPen, cilTrash , cilPlus, cilSave } from '@coreui/icons';
import CIcon from '@coreui/icons-react';
import Swal from 'sweetalert2';

const ListaTipoContratos = () => {
  const [tiposContratos, setTiposContratos] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalUpdateVisible, setModalUpdateVisible] = useState(false);
  const [modalDeleteVisible, setModalDeleteVisible] = useState(false);
  const [nuevoContrato, setNuevoContrato] = useState({ Descripcion: '' });
  const [contratoToUpdate, setContratoToUpdate] = useState({});
  const [contratoToDelete, setContratoToDelete] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  const [currentPage, setCurrentPage] = useState(1); // Estado para la página actual
  const [recordsPerPage] = useState(5); // Mostrar 5 registros por página

  useEffect(() => {
    fetchTipoContratos();
  }, []);

  const fetchTipoContratos = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/contratos/tiposContrato');
      const data = await response.json();
      // Asignar un índice original basado en el orden en la base de datos
    const dataWithIndex = data.map((tiposContratos, index) => ({
      ...tiposContratos,
      originalIndex: index + 1, // Guardamos la secuencia original
    }));
    
    setTiposContratos(dataWithIndex);
    } catch (error) {
      console.error('Error al obtener los tipos de contratos:', error);
    }
  };

  const isDuplicate = (descripcion) => {
    return tiposContratos.some((tiposContratos) => tiposContratos.Descripcion.toLowerCase() === descripcion.toLowerCase());
  };

  const handleCreateTipoContrato = async () => {
    // Validar si el campo "Descripcion" está vacío
    if (!nuevoContrato.Descripcion || nuevoContrato.Descripcion.trim() === '') {
      Swal.fire({
        icon: 'error',
        title: 'Campo vacío',
        text: 'Por favor, rellene el campo de descripción.',
      });
      return; // Detener la ejecución si el campo está vacío
    }
  
    // Verificar si el tipo de contrato ya existe
    if (isDuplicate(nuevoContrato.Descripcion)) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'El tipo de contrato ya existe.',
      });
      return;
    }
  
    try {
      const response = await fetch('http://localhost:4000/api/contratos/creartiposContrato', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(nuevoContrato),
      });
  
      if (response.ok) {
        fetchTipoContratos();
        setModalVisible(false);
        setNuevoContrato({ Descripcion: '' });
  
        Swal.fire({
          icon: 'success',
          title: 'Éxito',
          text: 'Tipo de contrato creado con éxito.',
        });
      } else {
        console.error('Error al crear el tipo de contrato:', response.statusText);
      }
    } catch (error) {
      console.error('Error al crear el tipo de contrato:', error);
    }
  };
  
  const handleUpdateTipoContrato = async () => {
    // Validar si el campo "Descripcion" está vacío
    if (!contratoToUpdate.Descripcion || contratoToUpdate.Descripcion.trim() === '') {
      Swal.fire({
        icon: 'error',
        title: 'Campo vacío',
        text: 'Por favor, rellene el campo de descripción.',
      });
      return; // Detener la ejecución si el campo está vacío
    }
  
    // Verificar si el tipo de contrato ya existe
    if (isDuplicate(contratoToUpdate.Descripcion)) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'El tipo de contrato ya existe.',
      });
      return;
    }
  
    try {
      const response = await fetch('http://localhost:4000/api/contratos/actualizartiposContrato', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contratoToUpdate),
      });
  
      if (response.ok) {
        fetchTipoContratos();
        setModalUpdateVisible(false);
        setContratoToUpdate({});
  
        Swal.fire({
          icon: 'success',
          title: 'Éxito',
          text: 'Tipo de contrato actualizado con éxito.',
        });
      } else {
        console.error('Error al actualizar el tipo de contrato:', response.statusText);
      }
    } catch (error) {
      console.error('Error al actualizar el tipo de contrato:', error);
    }
  };
  
  const handleDeleteTipoContrato = async () => {
    if (!contratoToDelete.Cod_tipo_contrato) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo encontrar el contrato a eliminar.',
      });
      return;
    }

    try {
      const response = await fetch('http://localhost:4000/api/contratos/eliminartiposContrato', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ Cod_tipo_contrato: contratoToDelete.Cod_tipo_contrato }),
      });

      if (response.ok) {
        fetchTipoContratos();
        setModalDeleteVisible(false);
        setContratoToDelete({});
        Swal.fire({
          icon: 'success',
          title: 'Éxito',
          text: 'Tipo de contrato eliminado con éxito.',
        });
      } else {
        const errorMessage = await response.text();
        console.error('Error al eliminar el tipo de contrato:', errorMessage);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: `No se pudo eliminar el tipo de contrato: ${errorMessage}`,
        });
      }
    } catch (error) {
      console.error('Error al eliminar el tipo de contrato:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error de conexión al intentar eliminar el tipo de contrato.',
      });
    }
  };

  // Cambia el estado de la página actual después de aplicar el filtro
  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1); // Resetear a la primera página al buscar
  };

  // Filtro de búsqueda
  const filteredTiposContratos = tiposContratos.filter((tiposContratos) =>
    tiposContratos.Descripcion.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Lógica de paginación
 const indexOfLastRecord = currentPage * recordsPerPage;
 const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
 const currentRecords = filteredTiposContratos.slice(indexOfFirstRecord, indexOfLastRecord);

 // Cambiar página
const paginate = (pageNumber) => {
  if (pageNumber > 0 && pageNumber <= Math.ceil(filteredTiposContratos.length / recordsPerPage)) {
    setCurrentPage(pageNumber);
  }
}

  return (
    <CContainer>
      <h1>Mantenimiento Tipos de Contrato</h1>
       {/* Contenedor de la barra de búsqueda y el botón "Nuevo" */}
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', justifyContent: 'space-between' }}>
      {/* Barra de búsqueda */}
      <CInputGroup style={{ marginTop: '30px', width: '400px' }}>
        <CInputGroupText>Buscar</CInputGroupText>
        <CFormInput placeholder="Buscar tipo contrato..." onChange={handleSearch} value={searchTerm} />
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
          {currentRecords.map((tiposContratos,index) => (
            <CTableRow key={tiposContratos.Cod_tipo_contrato}>
              <CTableDataCell>
                  {/* Mostrar el índice original en lugar del índice basado en la paginación */}
                  {tiposContratos.originalIndex} 
                </CTableDataCell>
              <CTableDataCell>{tiposContratos.Descripcion}</CTableDataCell>
              <CTableDataCell>
                <CButton style={{ backgroundColor: '#F9B64E',marginRight: '10px' }} onClick={() => {
                  setContratoToUpdate(tiposContratos);
                  setModalUpdateVisible(true);
                }}>
                  <CIcon icon={cilPen} />
                </CButton>
                <CButton
                  style={{ backgroundColor: '#E57368', marginRight: '10px' }}
                  onClick={() => {
                    setContratoToDelete(tiposContratos);
                    setModalDeleteVisible(true);
                  }}
                >
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
          disabled={currentPage === Math.ceil(filteredTiposContratos.length / recordsPerPage)} // Deshabilitar si estás en la última página
          onClick={() => paginate(currentPage + 1)}>
          Siguiente
       </CButton>
     </CPagination>
      {/* Mostrar total de páginas */}
      <span style={{ marginLeft: '10px' }}>
        Página {currentPage} de {Math.ceil(filteredTiposContratos.length / recordsPerPage)}
      </span>
   </div>


      {/* Modal Crear */}
      <CModal visible={modalVisible} onClose={() => setModalVisible(false)} backdrop="static">
        <CModalHeader>
          <CModalTitle>Nuevo Tipo de Contrato</CModalTitle>
        </CModalHeader>
        <CModalBody>
        <CForm>
          <CInputGroup className="mb-3">
            <CInputGroupText>Descripción</CInputGroupText>
            <CFormInput
              value={nuevoContrato.Descripcion}
              onChange={(e) => setNuevoContrato({ ...nuevoContrato, Descripcion: e.target.value })}
            />
          </CInputGroup>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setModalVisible(false)}>
            Cancelar
          </CButton>
          <CButton style={{ backgroundColor: '#4B6251',color: 'white' }} onClick={handleCreateTipoContrato}>
          <CIcon icon={cilSave} style={{ marginRight: '5px' }} />Guardar
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Modal Actualizar */}
      <CModal visible={modalUpdateVisible} onClose={() => setModalUpdateVisible(false)} backdrop="static">
        <CModalHeader>
          <CModalTitle>Actualizar Tipo de Contrato</CModalTitle>
        </CModalHeader>
        <CModalBody>
        <CForm>
          <CInputGroup className="mb-3">
            <CInputGroupText>Descripción</CInputGroupText>
            <CFormInput
              value={contratoToUpdate.Descripcion || ''}
              onChange={(e) => setContratoToUpdate({ ...contratoToUpdate, Descripcion: e.target.value })}
            />
          </CInputGroup>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setModalUpdateVisible(false)}>
            Cancelar
          </CButton>
          <CButton style={{  backgroundColor: '#F9B64E',color: 'white' }} onClick={handleUpdateTipoContrato}>
          <CIcon icon={cilPen} style={{ marginRight: '5px' }} />Actualizar
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Modal Eliminar */}
      <CModal visible={modalDeleteVisible} onClose={() => setModalDeleteVisible(false)} backdrop="static">
        <CModalHeader>
          <CModalTitle>Eliminar Tipo de Contrato</CModalTitle>
        </CModalHeader>
        <CModalBody>
          ¿Estás seguro de que deseas eliminar el tipo de contrato: <strong>{contratoToDelete.Descripcion}</strong>?
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setModalDeleteVisible(false)}>
            Cancelar
          </CButton>
          <CButton style={{  backgroundColor: '#E57368',color: 'white' }} onClick={handleDeleteTipoContrato}>
          <CIcon icon={cilTrash} style={{ marginRight: '5px' }} /> Eliminar 
          </CButton>
        </CModalFooter>
      </CModal>
    </CContainer>
  );
};

export default ListaTipoContratos;
