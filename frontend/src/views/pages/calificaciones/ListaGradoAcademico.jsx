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

const ListaGradoAcademico = () => {
  const [gradosAcademicos, setGradosAcademicos] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalUpdateVisible, setModalUpdateVisible] = useState(false);
  const [modalDeleteVisible, setModalDeleteVisible] = useState(false);
  const [nuevoGrado, setNuevoGrado] = useState({ Descripcion: '' });
  const [gradoToUpdate, setGradoToUpdate] = useState({});
  const [gradoToDelete, setGradoToDelete] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  const [currentPage, setCurrentPage] = useState(1); // Estado para la página actual
  const [recordsPerPage] = useState(5); // Mostrar 5 registros por página

  useEffect(() => {
    fetchGradosAcademicos();
  }, []);

  const fetchGradosAcademicos = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/gradosAcademicos/verGradosAcademicos');
      const data = await response.json();
     // Asignar un índice original basado en el orden en la base de datos
    const dataWithIndex = data.map((gradosAcademicos, index) => ({
      ...gradosAcademicos,
      originalIndex: index + 1, // Guardamos la secuencia original
    }));
    
    setGradosAcademicos(dataWithIndex);
    } catch (error) {
      console.error('Error al obtener los grados académicos:', error);
    }
  };

const handleCreateGrado = async () => {
  if (!nuevoGrado.Descripcion.trim()) {
    // Mostrar mensaje de error con SweetAlert si el campo está vacío
    Swal.fire({
      icon: 'error',
      title: 'Campo vacío',
      text: 'Por favor, rellene el campo de descripción.',
    });
    return;
  }

  // Verificar si ya existe una especialidad con la misma descripción
  const especialidadDuplicada = gradosAcademicos.some(
    (grado) => grado.Descripcion.toLowerCase() === nuevoGrado.Descripcion.toLowerCase()
  );

  if (especialidadDuplicada) {
    // Mostrar mensaje de error con SweetAlert si la especialidad ya existe
    Swal.fire({
      icon: 'error',
      title: 'Duplicado',
      text: 'El grado academico ya existe.',
    });
    return;
  }

  try {
    const response = await fetch('http://localhost:4000/api/gradosAcademicos/crearGradoAcademico', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(nuevoGrado),
    });

    if (response.ok) {
      fetchGradosAcademicos();
      setModalVisible(false);
      setNuevoGrado({ Descripcion: '' });

      // Mostrar mensaje de éxito con SweetAlert
      Swal.fire({
        icon: 'success',
        title: '¡Creado!',
        text: 'El grado académico se ha creado exitosamente.',
      });
    } else {
      console.error('Error al crear el grado académico:', response.statusText);
    }
  } catch (error) {
    console.error('Error al crear el grado académico:', error);
  }
};

const handleUpdateGrado = async () => {
  if (!gradoToUpdate.Descripcion.trim()) {
    // Mostrar mensaje de error con SweetAlert si el campo está vacío
    Swal.fire({
      icon: 'error',
      title: 'Campo vacío',
      text: 'Por favor, rellene el campo de descripción.',
    });
    return;
  }

  // Verificar si ya existe una especialidad con la misma descripción
  const especialidadDuplicada = gradosAcademicos.some(
    (grado) => 
      grado.Descripcion.toLowerCase() === gradoToUpdate.Descripcion.toLowerCase() &&
      grado.Cod_grado_academico !== gradoToUpdate.Cod_grado_academico
  );

  if (especialidadDuplicada) {
    // Mostrar mensaje de error con SweetAlert si la especialidad ya existe
    Swal.fire({
      icon: 'error',
      title: 'Duplicado',
      text: 'La especialidad ya existe.',
    });
    return;
  }

  try {
    const response = await fetch('http://localhost:4000/api/gradosAcademicos/actualizarGradoAcademico', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(gradoToUpdate),
    });

    if (response.ok) {
      fetchGradosAcademicos();
      setModalUpdateVisible(false);
      setGradoToUpdate({});

      // Mostrar mensaje de éxito con SweetAlert
      Swal.fire({
        icon: 'success',
        title: '¡Actualizado!',
        text: 'El grado académico se ha actualizado exitosamente.',
      });
    } else {
      console.error('Error al actualizar el grado académico:', response.statusText);
    }
  } catch (error) {
    console.error('Error al actualizar el grado académico:', error);
  }
};

  const handleDeleteGrado = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/gradosAcademicos/eliminarGradoAcademico', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ Cod_grado_academico: gradoToDelete.Cod_grado_academico }),
      });

      if (response.ok) {
        fetchGradosAcademicos();
        setModalDeleteVisible(false);
        setGradoToDelete({});
      } else {
        console.error('Error al eliminar el grado académico:', response.statusText);
      }
    } catch (error) {
      console.error('Error al eliminar el grado académico:', error);
    }
  };

  // Cambia el estado de la página actual después de aplicar el filtro
  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1); // Resetear a la primera página al buscar
  };

  // Filtro de búsqueda
  const filteredGradosAcademicos = gradosAcademicos.filter((gradosAcademicos) =>
    gradosAcademicos.Descripcion.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Lógica de paginación
 const indexOfLastRecord = currentPage * recordsPerPage;
 const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
 const currentRecords = filteredGradosAcademicos.slice(indexOfFirstRecord, indexOfLastRecord);

 // Cambiar página
const paginate = (pageNumber) => {
  if (pageNumber > 0 && pageNumber <= Math.ceil(filteredGradosAcademicos.length / recordsPerPage)) {
    setCurrentPage(pageNumber);
  }
}
  return (
    <CContainer>
      <h1>Mantenimiento Grados Académicos</h1>
       {/* Contenedor de la barra de búsqueda y el botón "Nuevo" */}
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', justifyContent: 'space-between' }}>
      {/* Barra de búsqueda */}
      <CInputGroup style={{ marginTop: '30px', width: '400px' }}>
        <CInputGroupText>Buscar</CInputGroupText>
        <CFormInput placeholder="Buscar grado académico..." onChange={handleSearch} value={searchTerm} />
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
            <CTableHeaderCell>Código Grado Académico</CTableHeaderCell>
            <CTableHeaderCell>Descripción</CTableHeaderCell>
            <CTableHeaderCell>Acciones</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {currentRecords.map((gradosAcademicos, index) => (
            <CTableRow key={gradosAcademicos.Cod_grado_academico}>
              <CTableDataCell>{/* Mostrar el índice original en lugar del índice basado en la paginación */}
                  {gradosAcademicos.originalIndex} 
                </CTableDataCell>
              <CTableDataCell>{gradosAcademicos.Cod_grado_academico}</CTableDataCell>
              <CTableDataCell>{gradosAcademicos.Descripcion}</CTableDataCell>
              <CTableDataCell>
                <CButton
                  style={{ backgroundColor: '#F9B64E',marginRight: '10px' }}
                  onClick={() => {
                    setGradoToUpdate(gradosAcademicos);
                    setModalUpdateVisible(true);
                  }}
                >
                  <CIcon icon={cilPen} />
                </CButton>
                <CButton
                  style={{ backgroundColor: '#E57368', marginRight: '10px' }}
                  onClick={() => {
                    setGradoToDelete(gradosAcademicos);
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
          disabled={currentPage === Math.ceil(filteredGradosAcademicos.length / recordsPerPage)} // Deshabilitar si estás en la última página
          onClick={() => paginate(currentPage + 1)}>
          Siguiente
       </CButton>
     </CPagination>
      {/* Mostrar total de páginas */}
      <span style={{ marginLeft: '10px' }}>
        Página {currentPage} de {Math.ceil(filteredGradosAcademicos.length / recordsPerPage)}
      </span>
   </div>

      {/* Modal Crear */}
      <CModal visible={modalVisible} onClose={() => setModalVisible(false)} backdrop="static">
        <CModalHeader>
          <CModalTitle>Nuevo Grado Académico</CModalTitle>
        </CModalHeader>
        <CModalBody>
        <CForm>
          <CInputGroup className="mb-3">
            <CInputGroupText>Descripción</CInputGroupText>
            <CFormInput
              value={nuevoGrado.Descripcion}
              onChange={(e) => setNuevoGrado({ ...nuevoGrado, Descripcion: e.target.value })}
            />
          </CInputGroup>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setModalVisible(false)}>
            Cancelar
          </CButton>
          <CButton style={{ backgroundColor: '#4B6251',color: 'white' }} onClick={handleCreateGrado}>
          <CIcon icon={cilSave} style={{ marginRight: '5px' }} />Guardar
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Modal Actualizar */}
      <CModal visible={modalUpdateVisible} onClose={() => setModalUpdateVisible(false)} backdrop="static">
        <CModalHeader>
          <CModalTitle>Actualizar Grado Académico</CModalTitle>
        </CModalHeader>
        <CModalBody>
        <CForm>
          <CInputGroup className="mb-3">
            <CInputGroupText>Descripción</CInputGroupText>
            <CFormInput
              value={gradoToUpdate.Descripcion || ''}
              onChange={(e) => setGradoToUpdate({ ...gradoToUpdate, Descripcion: e.target.value })}
            />
          </CInputGroup>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setModalUpdateVisible(false)}>
            Cancelar
          </CButton>
          <CButton style={{  backgroundColor: '#F9B64E',color: 'white' }} onClick={handleUpdateGrado}>
          <CIcon icon={cilPen} style={{ marginRight: '5px' }} />Actualizar
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Modal Eliminar */}
      <CModal visible={modalDeleteVisible} onClose={() => setModalDeleteVisible(false)} backdrop="static">
        <CModalHeader>
          <CModalTitle>Eliminar Grado Académico</CModalTitle>
        </CModalHeader>
        <CModalBody>
          ¿Estás seguro de que deseas eliminar el grado académico: <strong>{gradoToDelete.Descripcion}</strong>?
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setModalDeleteVisible(false)}>
            Cancelar
          </CButton>
          <CButton style={{  backgroundColor: '#E57368',color: 'white' }} onClick={handleDeleteGrado}>
          <CIcon icon={cilTrash} style={{ marginRight: '5px' }} /> Eliminar 
          </CButton>
        </CModalFooter>
      </CModal>
    </CContainer>
  );
};

export default ListaGradoAcademico;
