import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CIcon } from '@coreui/icons-react';
import { cilPen, cilTrash, cilPlus, cilSave} from '@coreui/icons'; // Importar iconos específicos
import Swal from 'sweetalert2';

import {
  CButton,
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

  const validarCiclo = () => {
    if (!nuevoCiclo || nuevoCiclo === "") {
      Swal.fire('Error', 'Debe seleccionar un ciclo', 'error');
      return false;
    }
    return true;
  };

  const validarGrado = () => {
    if (!nuevoGrado.Nombre_grado) {
      Swal.fire('Error', 'El Nombre del grado es obligatorio', 'error');
      return false;
    }
    return true;
  };


  const handleCreateGrado = async () => {
    if (!validarCiclo() || !validarGrado()) return;
    try {
      const response = await fetch('http://localhost:4000/api/grados/crearGrado', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          Cod_ciclo: nuevoCiclo, // O ajusta según lo que necesites enviar
          Nombre_grado: nuevoGrado.Nombre_grado,
        }),
      });
  
      if (response.ok) {
        fetchGrados(); // Refrescar la lista de grados después de crear uno nuevo
        setModalVisible(false); // Cerrar el modal
        setNuevoCiclo('');  // Restablecer estado de ciclo
        setNuevoGrado({});  // Restablecer estado de grado
        Swal.fire('Creado', 'El grado ha sido creado exitosamente', 'success');
      } else {
        Swal.fire('Error', 'Hubo un problema al crear el grado', 'error');
      }
    } catch (error) {
      Swal.fire('Error', 'Hubo un problema al crear el grado', 'error');
    }
  };

  
  const handleUpdateGrado = async () => {
    if (!gradoToUpdate.Nombre_grado) {
      Swal.fire('Error', 'El nombre del grado es obligatorio', 'error');
      return false;
    }
    if (!gradoToUpdate.Cod_ciclo) {
      Swal.fire('Error', 'El nombre del ciclo es obligatorio', 'error');
      return false;
    }
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
        Swal.fire('Actualizado', 'El grado ha sido actualizado correctamente', 'success');
      } else {
        Swal.fire('Error', 'Hubo un problema al actualizar el grado', 'error');
      }
    } catch (error) {
      Swal.fire('Error', 'Hubo un problema al actualizar el grado', 'error');
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
        Swal.fire('Eliminado', 'El grado ha sido eliminado correctamente', 'success');
      } else {
        Swal.fire('Error', 'Hubo un problema al eliminar el grado', 'error');
      }
    } catch (error) {
      Swal.fire('Error', 'Hubo un problema al eliminar el grado', 'error');
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
    <h1>Mantenimiento Grados</h1>
     {/* Contenedor de la barra de búsqueda y el botón "Nuevo" */}
     <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', justifyContent: 'space-between' }}>
      {/* Barra de búsqueda */}
      <CInputGroup style={{ marginTop: '30px', width: '400px' }}>
        <CInputGroupText>Buscar</CInputGroupText>
        <CFormInput placeholder="Buscar grado..." onChange={handleSearch} value={searchTerm} />
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
                  <CButton style={{ backgroundColor: '#F9B64E',marginRight: '10px' }} onClick={() => openUpdateModal(grado)}>
                    <CIcon icon={cilPen} />
                  </CButton>
                  <CButton style={{ backgroundColor: '#E57368', marginRight: '10px' }} onClick={() => openDeleteModal(grado)}>
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
    <CModal visible={modalVisible} onClose={() => setModalVisible(false)} backdrop="static">
      <CModalHeader>
        <CModalTitle>Nuevo Grado</CModalTitle>
        </CModalHeader>
        <CModalBody>
        <CForm>
      <CInputGroup className="mb-3">
        <CInputGroupText>Nombre Ciclo</CInputGroupText>
        <CFormSelect 
        aria-label="Seleccionar ciclo"
        value={nuevoCiclo}
        onChange={(e) => setNuevoCiclo(e.target.value)}
        style={{ maxHeight: '200px', overflowY: 'auto' }} // Limita la altura y permite el scroll
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
              type="text"
              placeholder="Ingrese el nombre del grado"
              maxLength={20}
              value={nuevoGrado.Nombre_grado}
              onChange={(e) => {
                // Remover cualquier caracter especial del valor ingresado
                const regex = /^[a-zA-Z\s]*$/; // Solo permite letras y espacios
                if (regex.test(e.target.value)) {
                  setNuevoGrado({ ...nuevoGrado, Nombre_grado: e.target.value });
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
          <CButton style={{ backgroundColor: '#4B6251',color: 'white' }} onClick={handleCreateGrado}>
          <CIcon icon={cilSave} style={{ marginRight: '5px' }} /> Guardar
          </CButton>
        </CModalFooter>
      </CModal>

    {/* Modal Actualizar Grado */}
    <CModal visible={modalUpdateVisible} onClose={() => setModalUpdateVisible(false)} backdrop="static">
      <CModalHeader>
      <CModalTitle>Actualizar Grado</CModalTitle>
      </CModalHeader>
      <CModalBody>
      <CForm>
      <CInputGroup className="mb-3">
        <CInputGroupText>Nombre Ciclo</CInputGroupText>
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
              maxLength={20}
              placeholder="Ingrese el nuevo nombre del grado"
              value={gradoToUpdate.Nombre_grado}
              onChange={(e) => {
                // Remover cualquier caracter especial del valor ingresado
                const regex = /^[a-zA-Z\s]*$/; // Solo permite letras y espacios
                if (regex.test(e.target.value)) {
                  setGradoToUpdate({
                    ...gradoToUpdate,
                    Nombre_grado: e.target.value,
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
        <CButton color="secondary" onClick={() => setModalUpdateVisible(false)} >
          Cancelar
        </CButton>
        <CButton  style={{  backgroundColor: '#F9B64E',color: 'white' }}  onClick={handleUpdateGrado}>
        <CIcon icon={cilPen} style={{ marginRight: '5px' }} />Actualizar
        </CButton>
      </CModalFooter>
    </CModal>

    {/* Modal Eliminar Grado */}
    <CModal visible={modalDeleteVisible} onClose={() => setModalDeleteVisible(false)} backdrop="static">
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
        <CButton style={{  backgroundColor: '#E57368',color: 'white' }}  onClick={handleDeleteGrado}>
        <CIcon icon={cilTrash} style={{ marginRight: '5px' }} />Eliminar
        </CButton>
      </CModalFooter>
    </CModal>
 </CContainer>
  );
};


export default ListaGrados;