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
import { cilInfo, cilPen, cilTrash, cilPlus, cilSave } from '@coreui/icons'; // Asegúrate de importar cilPlus y cilSave
import CIcon from '@coreui/icons-react';
import Swal from 'sweetalert2';

const ListaEspecialidades = () => {
  const [especialidades, setEspecialidades] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalUpdateVisible, setModalUpdateVisible] = useState(false);
  const [modalDeleteVisible, setModalDeleteVisible] = useState(false);
  const [nuevaEspecialidad, setNuevaEspecialidad] = useState({
    Cod_Especialidad: '',
    Nombre_especialidad: ''
  });
  const [especialidadToUpdate, setEspecialidadToUpdate] = useState({});
  const [especialidadToDelete, setEspecialidadToDelete] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1); 
  const [recordsPerPage] = useState(5); 

  useEffect(() => {
    fetchEspecialidades();
  }, []);

  const fetchEspecialidades = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/especialidades/verespecialidades');
      const data = await response.json();
      const dataWithIndex = data.map((especialidades, index) => ({
        ...especialidades,
        originalIndex: index + 1
      }));
      setEspecialidades(dataWithIndex);
    } catch (error) {
      console.error('Error al obtener las especialidades:', error);
    }
  };
  const handleCreateEspecialidad = async () => {
    // Validación para campos vacíos
    if (!nuevaEspecialidad.Nombre_especialidad.trim()) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'El campo "Nombre especialidad" no puede estar vacío.',
      });
      return;
    }
  
    const existe = especialidades.some(
      (esp) => esp.Nombre_especialidad.trim().toLowerCase() === nuevaEspecialidad.Nombre_especialidad.trim().toLowerCase()
    );
  
    if (existe) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: `La especialidad "${nuevaEspecialidad.Nombre_especialidad}" ya existe.`,
      });
      return;
    }
  
    try {
      const response = await fetch('http://localhost:4000/api/especialidades/crearespecialidad', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(nuevaEspecialidad),
      });
  
      if (response.ok) {
        fetchEspecialidades();
        setModalVisible(false);
        setNuevaEspecialidad({
          Cod_Especialidad: '',
          Nombre_especialidad: ''
        });
        Swal.fire({
          icon: 'success',
          title: 'Creado',
          text: 'Especialidad creada con éxito.',
        });
      } else {
        console.error('Error al crear la especialidad:', response.statusText);
      }
    } catch (error) {
      console.error('Error al crear la especialidad:', error);
    }
  };
  
  const handleUpdateEspecialidad = async () => {
    // Validación para campos vacíos
    if (!especialidadToUpdate.Nombre_especialidad.trim()) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'El campo "Nombre especialidad" no puede estar vacío.',
      });
      return;
    }
  
    const existe = especialidades.some(
      (esp) =>
        esp.Nombre_especialidad.trim().toLowerCase() === especialidadToUpdate.Nombre_especialidad.trim().toLowerCase() &&
        esp.Cod_Especialidad !== especialidadToUpdate.Cod_Especialidad
    );
  
    if (existe) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: `La especialidad "${especialidadToUpdate.Nombre_especialidad}" ya existe.`,
      });
      return;
    }

    try {
      const response = await fetch('http://localhost:4000/api/especialidades/actualizarespecialidad', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(especialidadToUpdate),
      });
  
      if (response.ok) {
        fetchEspecialidades();
        setModalUpdateVisible(false);
        setEspecialidadToUpdate({});
        Swal.fire({
          icon: 'success',
          title: 'Actualizado',
          text: 'Especialidad actualizada con éxito.',
        });
      } else {
        console.error('Error al actualizar la especialidad:', response.statusText);
      }
    } catch (error) {
      console.error('Error al actualizar la especialidad:', error);
    }
  };

  const handleDeleteEspecialidad = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/especialidades/eliminarespecialidad', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ Cod_Especialidad: especialidadToDelete.Cod_Especialidad }),
      });

      if (response.ok) {
        fetchEspecialidades();
        setModalDeleteVisible(false);
        setEspecialidadToDelete({});
        Swal.fire({
          icon: 'success',
          title: 'Eliminado',
          text: 'Especialidad eliminada con éxito.',
        });
      } else {
        console.error('Error al eliminar la especialidad:', response.statusText);
      }
    } catch (error) {
      console.error('Error al eliminar la especialidad:', error);
    }
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1); 
  };

  const filteredEspecialidades = especialidades.filter((especialidades) =>
    especialidades.Nombre_especialidad.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredEspecialidades.slice(indexOfFirstRecord, indexOfLastRecord);

  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= Math.ceil(filteredEspecialidades.length / recordsPerPage)) {
      setCurrentPage(pageNumber);
    }
  };
  return (
    <CContainer>
      <h1>Mantenimiento Especialidades</h1>
 {/* Contenedor de la barra de búsqueda y el botón "Nuevo" */}
 <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', justifyContent: 'space-between' }}>
      {/* Barra de búsqueda */}
      <CInputGroup style={{ marginTop: '30px', width: '400px' }}>
        <CInputGroupText>Buscar</CInputGroupText>
        <CFormInput placeholder="Buscar especialidad..." onChange={handleSearch} value={searchTerm} />
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
            <CTableHeaderCell>Nombre Especialidad</CTableHeaderCell>
            <CTableHeaderCell>Acciones</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {currentRecords.map((especialidades, index) => (
            <CTableRow key={especialidades.Cod_Especialidad}>
              <CTableDataCell>
                  {/* Mostrar el índice original en lugar del índice basado en la paginación */}
                  {especialidades.originalIndex} 
                </CTableDataCell>
              <CTableDataCell>{especialidades.Nombre_especialidad}</CTableDataCell>
              <CTableDataCell>
                <CButton
                  style={{ backgroundColor: '#F9B64E',marginRight: '10px' }}
                  onClick={() => {
                    setEspecialidadToUpdate(especialidades);
                    setModalUpdateVisible(true);
                  }}
                >
                  <CIcon icon={cilPen} />
                </CButton>
                <CButton
                  style={{ backgroundColor: '#E57368', marginRight: '10px' }}
                  onClick={() => {
                    setEspecialidadToDelete(especialidades);
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
          disabled={currentPage === Math.ceil(filteredEspecialidades.length / recordsPerPage)} // Deshabilitar si estás en la última página
          onClick={() => paginate(currentPage + 1)}>
          Siguiente
       </CButton>
     </CPagination>
      {/* Mostrar total de páginas */}
      <span style={{ marginLeft: '10px' }}>
        Página {currentPage} de {Math.ceil(filteredEspecialidades.length / recordsPerPage)}
      </span>
   </div>


      {/* Modal Crear */}
      <CModal visible={modalVisible} onClose={() => setModalVisible(false)} backdrop="static">
        <CModalHeader>
          <CModalTitle>Nueva Especialidad</CModalTitle>
        </CModalHeader>
        <CModalBody>
        <CForm>
          <CInputGroup className="mb-3">
            <CInputGroupText>Nombre especialidad</CInputGroupText>
            <CFormInput
              value={nuevaEspecialidad.Nombre_especialidad}
              onChange={(e) => setNuevaEspecialidad({ ...nuevaEspecialidad, Nombre_especialidad: e.target.value })}
            />
          </CInputGroup>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setModalVisible(false)}>
            Cancelar
          </CButton>
          <CButton style={{ backgroundColor: '#4B6251',color: 'white' }} onClick={handleCreateEspecialidad}>
          <CIcon icon={cilSave} style={{ marginRight: '5px' }} />Guardar
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Modal Actualizar */}
      <CModal visible={modalUpdateVisible} onClose={() => setModalUpdateVisible(false)} backdrop="static">
        <CModalHeader>
          <CModalTitle>Actualizar Especialidad</CModalTitle>
        </CModalHeader>
        <CModalBody>
        <CForm>
          <CInputGroup className="mb-3">
            <CInputGroupText>Nombre especialidad</CInputGroupText>
            <CFormInput
              value={especialidadToUpdate.Nombre_especialidad || ''}
              onChange={(e) => setEspecialidadToUpdate({ ...especialidadToUpdate, Nombre_especialidad: e.target.value })}
            />
          </CInputGroup>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setModalUpdateVisible(false)}>
            Cancelar
          </CButton>
          <CButton style={{  backgroundColor: '#F9B64E',color: 'white' }} onClick={handleUpdateEspecialidad}>
          <CIcon icon={cilPen} style={{ marginRight: '5px' }} />Actualizar
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Modal Eliminar */}
      <CModal visible={modalDeleteVisible} onClose={() => setModalDeleteVisible(false)} backdrop="static">
        <CModalHeader>
          <CModalTitle>Eliminar Especialidad</CModalTitle>
        </CModalHeader>
        <CModalBody>
          ¿Está seguro de que desea eliminar la especialidad: <strong>{especialidadToDelete.Nombre_especialidad}</strong>?
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setModalDeleteVisible(false)}>
            Cancelar
          </CButton>
          <CButton style={{  backgroundColor: '#E57368',color: 'white' }} onClick={handleDeleteEspecialidad}>
          <CIcon icon={cilTrash} style={{ marginRight: '5px' }} /> Eliminar 
          </CButton>
        </CModalFooter>
      </CModal>
    </CContainer>
  );
};

export default ListaEspecialidades;



