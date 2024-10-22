import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CIcon } from '@coreui/icons-react';
import Swal from 'sweetalert2';
import { cilPen, cilTrash, cilPlus, cilSave } from '@coreui/icons'; // Importar iconos específicos
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

  const validateParcial = () => {
    if (!nuevoParcial.Nombre_parcial) {
      Swal.fire('Error', 'El nombre del parcial es obligatorio', 'error');
      return false;
    }
    if (!nuevoParcial.Nota_recuperacion || isNaN(nuevoParcial.Nota_recuperacion)) {
      Swal.fire('Error', 'La nota de recuperación debe ser un número', 'error');
      return false;
    }
    return true;
  };
  
  const handleCreateParcial = async () => {
    if (!validateParcial()) return;
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
        Swal.fire('Creado', 'El parcial ha sido creado exitosamente', 'success');
      } else {
        Swal.fire('Error', 'Hubo un problema al crear el parcial', 'error');
      }
    } catch (error) {
      Swal.fire('Error', 'Hubo un problema al crear el parcial', 'error');
    }
  };  


  const handleUpdateParcial = async () => {
    if (!parcialToUpdate.Nombre_parcial) {
      Swal.fire('Error', 'El nombre del parcial es obligatorio', 'error');
      return false;
    }
    if (!parcialToUpdate.Nota_recuperacion) {
      Swal.fire('Error', 'La nota del parcial es obligatoria', 'error');
      return false;
    }
    try {
      const response = await fetch('http://localhost:4000/api/parciales/actualizarParcial', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ Cod_parcial: parcialToUpdate.Cod_parcial, Nombre_parcial: parcialToUpdate.Nombre_parcial, Nota_recuperacion: parcialToUpdate.Nota_recuperacion }), // Envío del nombre actualizado y Cod_ciclo en el cuerpo
      });

      if (response.ok) {
        fetchParciales();
        setModalUpdateVisible(false);
        setParcialesToUpdate({});
        Swal.fire('Actualizado', 'El parcial ha sido actualizado correctamente', 'success');
      } else {
        Swal.fire('Error', 'Hubo un problema al actualizar el parcial', 'error');
      }
      if (!parcialToUpdate.Nombre_parcial) {
        Swal.fire('Error', 'El nombre del parcial es obligatorio', 'error');
        return false;
      }
    } catch (error) {
      Swal.fire('Error', 'Hubo un problema al actualizar el parcial', 'error');
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
        fetchParciales();
        setModalDeleteVisible(false);
        setParcialToDelete({});
        Swal.fire('Eliminado', 'El parcial ha sido eliminado correctamente', 'success');
      } else {
        Swal.fire('Error', 'Hubo un problema al eliminar el parcial', 'error');
      }
    } catch (error) {
      Swal.fire('Error', 'Hubo un problema al eliminar el parcial', 'error');
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
    <h1>Mantenimiento Parciales</h1>
   {/* Contenedor de la barra de búsqueda y el botón "Nuevo" */}
   <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', justifyContent: 'space-between' }}>
      {/* Barra de búsqueda */}
      <CInputGroup style={{ marginTop: '30px', width: '400px' }}>
        <CInputGroupText>Buscar</CInputGroupText>
        <CFormInput placeholder="Buscar parcial..." onChange={handleSearch} value={searchTerm} />
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
                  <CButton style={{ backgroundColor: '#F9B64E',marginRight: '10px' }} onClick={() => openUpdateModal(parcial)}>
                    <CIcon icon={cilPen} />
                  </CButton>
                  <CButton style={{ backgroundColor: '#E57368', marginRight: '10px' }} onClick={() => openDeleteModal(parcial)}>
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
    <CModal visible={modalVisible} onClose={() => setModalVisible(false)} backdrop="static">
      <CModalHeader>
        <CModalTitle>Nuevo Parcial</CModalTitle>
        </CModalHeader>
        <CModalBody>
          
        <CForm>
          <CInputGroup className="mb-3">
            <CInputGroupText>Nombre del Parcial</CInputGroupText>
            <CFormInput
              type="text"
              maxLength={20}
              value={nuevoParcial.Nombre_parcial}
              onChange={(e) => {
                // Remover cualquier caracter especial del valor ingresado
                const regex = /^[a-zA-Z\s]*$/; // Solo permite letras y espacios
                if (regex.test(e.target.value)) {
                  setNuevoParcial({ ...nuevoParcial, Nombre_parcial: e.target.value });
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
          <CInputGroup className="mb-3">
            <CInputGroupText>Nota Recuperacion</CInputGroupText>
            <CFormInput
              type="number"
              min={1} // No permitir negativos
              max={100} // Limitar el valor máximo a 100
              maxLength={11}
              value={nuevoParcial.Nota_recuperacion}
              onChange={(e) => {
                const value = parseInt(e.target.value, 10);
                // Permitir valores entre 1 y 100
                if (!isNaN(value) && value >= 1 && value <= 100) {
                  setNuevoParcial({ ...nuevoParcial, Nota_recuperacion: value });
                } else if (value < 1) {
                  setNuevoParcial({ ...nuevoParcial, Nota_recuperacion: 1 }); // Establecer a 1 si se intenta ingresar un valor negativo
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
          <CButton style={{ backgroundColor: '#4B6251',color: 'white' }} onClick={handleCreateParcial}>
          <CIcon icon={cilSave} style={{ marginRight: '5px' }} /> Guardar
          </CButton>
        </CModalFooter>
      </CModal>

    {/* Modal Actualizar Parcial */}
    <CModal visible={modalUpdateVisible} onClose={() => setModalUpdateVisible(false)} backdrop="static">
      <CModalHeader>
      <CModalTitle>Actualizar Parcial</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <CForm>
          <CInputGroup className="mb-3">
            <CInputGroupText>Nombre del Parcial</CInputGroupText>
            <CFormInput
              maxLength={20}
              placeholder="Ingrese el nuevo nombre del parcial"
              value={parcialToUpdate.Nombre_parcial}
              onChange={(e) => {
                // Remover cualquier caracter especial del valor ingresado
                const regex = /^[a-zA-Z\s]*$/; // Solo permite letras y espacios
                if (regex.test(e.target.value)) {
                  setParcialesToUpdate({
                    ...parcialToUpdate,
                    Nombre_parcial: e.target.value,
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
          <CInputGroup className="mb-3">
            <CInputGroupText>Nota Recuperacion</CInputGroupText>
            <CFormInput
              type="number"
              min={1} // No permitir negativos
              max={100} // Limitar el valor máximo a 100
              maxLength={11}
              placeholder="Ingrese la nueva nota"
              value={parcialToUpdate.Nota_recuperacion}
              onChange={(e) => {
                const value = parseInt(e.target.value, 10);
                if (value >= 1 && value <= 100) {
                  setParcialesToUpdate({ ...parcialToUpdate, Nota_recuperacion: value });
                } else if (value < 1) {
                  setParcialesToUpdate({ ...parcialToUpdate, Nota_recuperacion: 1 });
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
        <CButton style={{  backgroundColor: '#F9B64E',color: 'white' }}  onClick={handleUpdateParcial}>
        <CIcon icon={cilPen} style={{ marginRight: '5px' }} /> Actualizar
        </CButton>
      </CModalFooter>
    </CModal>

    {/* Modal Eliminar Parcial */}
    <CModal visible={modalDeleteVisible} onClose={() => setModalDeleteVisible(false)} backdrop="static">
      <CModalHeader>
      <CModalTitle>Confirmar Eliminación</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <p>¿Estás seguro de que deseas eliminar el parcial: <b>{parcialToDelete.Nombre_parcial}</b>?</p>
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={() => setModalDeleteVisible(false)}>
          Cancelar
        </CButton>
        <CButton style={{  backgroundColor: '#E57368',color: 'white' }}  onClick={handleDeleteParcial}>
        <CIcon icon={cilTrash} style={{ marginRight: '5px' }} /> Eliminar
        </CButton>
      </CModalFooter>
    </CModal>
 </CContainer>
  );
};


export default ListaParciales;