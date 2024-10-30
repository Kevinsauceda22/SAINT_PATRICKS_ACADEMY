import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { CIcon } from '@coreui/icons-react';
import Swal from 'sweetalert2';
import { cilSearch, cilBrushAlt, cilPen, cilTrash, cilPlus, cilSave,cilDescription } from '@coreui/icons'; // Importar iconos específicos

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
  CFormSelect,
  CRow,
  CCol,
} from '@coreui/react';


const ListaAsignaturas = () => {
  const [Asignaturas, setAsignatura] = useState([]);
  const [modalVisible, setModalVisible] = useState(false); // Estado para el modal de crear ciclo
  const [modalUpdateVisible, setModalUpdateVisible] = useState(false); // Estado para el modal de actualizar ciclo
  const [modalDeleteVisible, setModalDeleteVisible] = useState(false); // Estado para el modal de eliminar ciclo
  const [nueva_Asignatura, setNueva_Asignatura] = useState({
    Nombre_asignatura: '',
    Descripcion_asignatura: ''
  });
  const [asignaturaToUpdate, setAsignaturaToUpdate] = useState({}); // Estado para el ciclo a actualizar
  const [AsignaturaToDelete, setAsignaturaToDelete] = useState({}); // Estado para el ciclo a eliminar
  const [searchTerm, setSearchTerm] = useState('');
  const inputRefNombre = useRef(null); // Referencia para el input
  const inputRefDescripcion = useRef(null);
  const [recordsPerPage, setRecordsPerPage] = useState(5); // Hacer dinámico el número de registros por página
  const [currentPage, setCurrentPage] = useState(1); // Estado para la página actual
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false); // Estado para detectar cambios sin guardar
  const resetAsignatura = () => setNueva_Asignatura({ Nombre_asignatura: '', Descripcion_asignatura: '' });
  const resetAsignaturatoUpdate = () => setAsignaturaToUpdate({ Nombre_asignatura: '', Descripcion_asignatura: '' });

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

  // Validación de creación de asignatura
  const validateAsignatura = () => {
    const nombreasignatura = typeof nueva_Asignatura === 'string' ? nueva_Asignatura : nueva_Asignatura.Nombre_asignatura;
    const descripcionasignatura = typeof nueva_Asignatura === 'string' ? nueva_Asignatura : nueva_Asignatura.Descripcion_asignatura;

    // Comprobación de vacío
    if (!nombreasignatura || nombreasignatura.trim() === '') {
      Swal.fire('Error', 'El campo "Nombre de la Asignatura" no puede estar vacío', 'error');
      return false;
    }
    if (!descripcionasignatura || descripcionasignatura.trim() === '') {
      Swal.fire('Error', 'El campo "Descripción de la Asignatura" no puede estar vacío', 'error');
      return false;
    }

    // Verificar si ya existe una asignatura con el mismo nombre
    const asignaturaexiste = Asignaturas.some(
      (asignatura) => asignatura.Nombre_asignatura.toLowerCase() === nombreasignatura.toLowerCase()
    );
    const descripcionexiste = Asignaturas.some(
      (asignatura) => asignatura.Descripcion_asignatura.toLowerCase() === descripcionasignatura.toLowerCase()
    );

    if (asignaturaexiste) {
      Swal.fire('Error', `La asignatura "${nombreasignatura}" ya existe `, 'error');
      return false;
    }
    if (descripcionexiste) {
      Swal.fire('Error', `La descipción "${descripcionasignatura}" ya existe `, 'error');
      return false;
    }
    return true;
  };

  // Validación de actualización de asignatura
  const validarAsignaturaUpdate = () => {
    if (!asignaturaToUpdate.Nombre_asignatura) {
      Swal.fire('Error', 'El campo "Nombre de la Asignatura" no puede estar vacío', 'error');
      return false;
    }
    if (!asignaturaToUpdate.Descripcion_asignatura) {
      Swal.fire('Error', 'El campo "Descripción de la Asignatura" no puede estar vacío', 'error');
      return false;
    }

    // Verificar si el nombre del parcial ya existe (excluyendo el parcial actual que se está editando)
    const asignaturaExistente = Asignaturas.some(
      (asignatura) =>
        asignatura.Nombre_asignatura.toLowerCase() === asignaturaToUpdate.Nombre_asignatura.toLowerCase() &&
        asignatura.Cod_asignatura !== asignaturaToUpdate.Cod_asignatura // Excluir su propio código
    );

    if (asignaturaExistente) {
      Swal.fire('Error', `La asignatura "${asignaturaToUpdate.Nombre_asignatura}" ya existe `, 'error');
      return false;
    }

    return true;
  };


  // Función para manejar cambios en el input
  const handleInputChange = (e, setFunction, inputRef) => {
    const input = e.target;
    const cursorPosition = input.selectionStart; // Guarda la posición actual del cursor
    let value = input.value
      .toUpperCase() // Convertir a mayúsculas
      .trimStart(); // Evitar espacios al inicio

    const regex = /^[A-ZÑ\s]*$/; // Solo letras y espacios y la letra ñ

    // Verificar si hay múltiples espacios consecutivos antes de reemplazarlos
    if (/\s{2,}/.test(value)) {
      Swal.fire({
        icon: 'warning',
        title: 'Espacios múltiples',
        text: 'No se permite más de un espacio entre palabras.',
      });
      value = value.replace(/\s+/g, ' '); // Reemplazar múltiples espacios por uno solo
    }

    // Validar solo letras y espacios
    if (!regex.test(value)) {
      Swal.fire({
        icon: 'warning',
        title: 'Caracteres no permitidos',
        text: 'Solo se permiten letras y espacios.',
      });
      return;
    }

    // Validación: no permitir letras repetidas más de 4 veces seguidas
    const words = value.split(' ');
    for (let word of words) {
      const letterCounts = {};
      for (let letter of word) {
        letterCounts[letter] = (letterCounts[letter] || 0) + 1;
        if (letterCounts[letter] > 4) {
          Swal.fire({
            icon: 'warning',
            title: 'Repetición de letras',
            text: `La letra "${letter}" se repite más de 4 veces en la palabra "${word}".`,
          });
          return;
        }
      }
    }

    // Asigna el valor en el input manualmente para evitar el salto de transición
    input.value = value;

    // Establecer el valor con la función correspondiente
    setFunction(value);
    setHasUnsavedChanges(true); // Asegúrate de marcar que hay cambios sin guardar

   // Restaurar la posición del cursor
   requestAnimationFrame(() => {
    if (inputRef && inputRef.current) {
      inputRef.current.setSelectionRange(cursorPosition, cursorPosition);
    }
  });
  };

  // Deshabilitar copiar y pegar
  const disableCopyPaste = (e) => {
    e.preventDefault();
    Swal.fire({
      icon: 'warning',
      title: 'Acción bloqueada',
      text: 'Copiar y pegar no está permitido.',
    });
  };

  // Función para cerrar el modal con advertencia si hay cambios sin guardar
  const handleCloseModal = (closeFunction, resetFields) => {
    if (hasUnsavedChanges) {
      Swal.fire({
        title: '¿Estás seguro?',
        text: 'Si cierras este formulario, perderás todos los datos ingresados.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, cerrar',
        cancelButtonText: 'Cancelar',
      }).then((result) => {
        if (result.isConfirmed) {
          closeFunction(false);
          resetFields(); // Limpiar los campos al cerrar
          setHasUnsavedChanges(false); // Resetear cambios no guardados
        }
      });
    } else {
      closeFunction(false);
      resetFields();
      setHasUnsavedChanges(false); // Asegurarse de resetear aquí también
    }
  };


  const handleCreateAsignatura = async () => {
    if (!validateAsignatura()) return;
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
        resetAsignatura();
        setHasUnsavedChanges(false); // Reiniciar el estado de cambios no guardados
        Swal.fire('¡Éxito!', 'La asignatura se ha creado correctamente', 'success');
      } else {
        Swal.fire('Error', 'Hubo un problema al crear la asignatura', 'error');
      }
    } catch (error) {
      Swal.fire('Error', 'Hubo un problema al crear la asignatura', 'error');
    }
  }; 


  
  const handleUpdateAsignatura = async () => {
    if (!validarAsignaturaUpdate()) return;
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
        resetAsignaturatoUpdate(); // Resetear la asignatura a actualizar
        setHasUnsavedChanges(false);
        Swal.fire('¡Éxito!', 'La asignatura se ha actualizado correctamente', 'success');
      } else {
        Swal.fire('Error', 'Hubo un problema al actualizar la asignatura', 'error');
      }
    } catch (error) {
      Swal.fire('Error', 'Hubo un problema al actualizar la asignatura', 'error');
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
        Swal.fire('¡Éxito!', 'La asignatura se ha eliminado correctamente', 'success');
      } else {
        Swal.fire('Error', 'Hubo un problema al eliminar la asignatura', 'error');
      }
    } catch (error) {
      Swal.fire('Error', 'Hubo un problema al eliminar la asignatura', 'error');
    }
  };

  const openUpdateModal = (asignatura) => {
    setAsignaturaToUpdate(asignatura); // Cargar los datos del ciclo a actualizar
    setModalUpdateVisible(true); // Abrir el modal de actualización
    setHasUnsavedChanges(false); // Resetear el estado al abrir el modal
  };

  const openDeleteModal = (asignatura) => {
    setAsignaturaToDelete(asignatura); // Guardar el ciclo que se desea eliminar
    setModalDeleteVisible(true); // Abrir el modal de confirmación
  };

  // Cambia el estado de la página actual después de aplicar el filtro
  // Validar el buscador
  const handleSearch = (event) => {
    const input = event.target.value.toUpperCase();
    const regex = /^[A-ZÑ\s]*$/; // Solo permite letras, espacios y la letra "Ñ"
    
    if (!regex.test(input)) {
      Swal.fire({
        icon: 'warning',
        title: 'Caracteres no permitidos',
        text: 'Solo se permiten letras y espacios.',
      });
      return;
    }
    setSearchTerm(input);
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
    
    {/* Contenedor del h1 y botón "Nuevo" */}
    <CRow className="align-items-center mb-5">
      <CCol xs="8" md="9">
        {/* Título de la página */}
        <h1 className="mb-0">Mantenimiento Asignatura</h1>
      </CCol>
      <CCol xs="4" md="3" className="text-end d-flex flex-column flex-md-row justify-content-md-end align-items-md-center">
        {/* Botón Nuevo para abrir el modal */}
        <CButton 
          style={{ backgroundColor: '#4B6251', color: 'white' }} 
          className="mb-3 mb-md-0 me-md-3" // Margen inferior en pantallas pequeñas, margen derecho en pantallas grandes
          onClick={() => { setModalVisible(true);
            setHasUnsavedChanges(false); // Resetear el estado al abrir el modal
          }}
        >
          <CIcon icon={cilPlus} /> Nuevo
        </CButton>

        {/* Botón de Reporte */}
        <CButton 
          style={{ backgroundColor: '#6C8E58', color: 'white' }}
        >
          <CIcon icon={cilDescription} /> Reporte
        </CButton>
      </CCol>
    </CRow>

    {/* Contenedor de la barra de búsqueda y el selector dinámico */}
    <CRow className="align-items-center mt-4 mb-2">
      {/* Barra de búsqueda  */}
      <CCol xs="12" md="8" className="d-flex flex-wrap align-items-center">
        <CInputGroup className="me-3" style={{ width: '400px' }}>
          <CInputGroupText>
            <CIcon icon={cilSearch} />
          </CInputGroupText>
          <CFormInput
            placeholder="Buscar estado parciales..."
            onChange={handleSearch}
            value={searchTerm}
          />
          <CButton
            style={{border: '1px solid #ccc',
              transition: 'all 0.1s ease-in-out', // Duración de la transición
              backgroundColor: '#F3F4F7', // Color por defecto
              color: '#343a40' // Color de texto por defecto
            }}
            onClick={() => {
              setSearchTerm('');
              setCurrentPage(1);
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#E0E0E0'; // Color cuando el mouse sobre el boton "limpiar"
              e.currentTarget.style.color = 'black'; // Color del texto cuando el mouse sobre el boton "limpiar"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#F3F4F7'; // Color cuando el mouse no está sobre el boton "limpiar"
              e.currentTarget.style.color = '#343a40'; // Color de texto cuando el mouse no está sobre el boton "limpiar"
            }}
          >
            <CIcon icon={cilBrushAlt} /> Limpiar
          </CButton>
        </CInputGroup>
     </CCol>

      {/* Selector dinámico a la par de la barra de búsqueda */}
      <CCol xs="12" md="4" className="text-md-end mt-2 mt-md-0">
        <CInputGroup className="mt-2 mt-md-0" style={{ width: 'auto', display: 'inline-block' }}>
          <div className="d-inline-flex align-items-center">
            <span>Mostrar&nbsp;</span>
              <CFormSelect
                style={{ width: '80px', display: 'inline-block', textAlign: 'center' }}
                onChange={(e) => {
                const value = Number(e.target.value);
                setRecordsPerPage(value);
                setCurrentPage(1); // Reiniciar a la primera página cuando se cambia el número de registros
              }}
                value={recordsPerPage}
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
              </CFormSelect>
            <span>&nbsp;registros</span>
          </div>       
       </CInputGroup>
     </CCol>
    </CRow>


    {/* Tabla para mostrar ciclos */}
    {/* Contenedor de tabla con scroll */}
    <div className="table-container" style={{ maxHeight: '400px', overflowY: 'scroll', marginBottom: '20px' }}>
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
                <CTableDataCell style={{ display: 'flex', gap: '10px' }}>
                  <CButton style={{ backgroundColor: '#F9B64E' }} onClick={() => openUpdateModal(asignatura)}>
                    <CIcon icon={cilPen} />
                  </CButton>
                  <CButton style={{ backgroundColor: '#E57368' }} onClick={() => openDeleteModal(asignatura)}>
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
    <CModal visible={modalVisible} backdrop="static">
      <CModalHeader closeButton={false}>
        <CModalTitle>Nueva Asignatura</CModalTitle>
        <CButton className="btn-close" aria-label="Close" onClick={() => handleCloseModal(setModalVisible, resetAsignatura)} />
        </CModalHeader>
        <CModalBody>
        <CForm>
            <CInputGroup className="mb-3">
            <CInputGroupText>Nombre de la Asignatura</CInputGroupText>
            <CFormInput
              type="text"
              value={nueva_Asignatura.Nombre_asignatura}
              maxLength={20}
              onPaste={disableCopyPaste}
              onCopy={disableCopyPaste}
              onChange={(e) => handleInputChange(e, (value) => setNueva_Asignatura({
                ...nueva_Asignatura,
                Nombre_asignatura: value }),inputRefNombre
              )}
              ref={inputRefNombre}
            />
          </CInputGroup>
          <CInputGroup className="mb-3">
            <CInputGroupText>Descripcion de la Asignatura</CInputGroupText>
            <CFormInput
              type="text"
              value={nueva_Asignatura.Descripcion_asignatura}
              maxLength={20}
              onPaste={disableCopyPaste}
              onCopy={disableCopyPaste}
              onChange={(e) => handleInputChange(e, (value) => setNueva_Asignatura({
                ...nueva_Asignatura,
                Descripcion_asignatura: value}),inputRefDescripcion)}
              ref={inputRefDescripcion}
            />
          </CInputGroup>
        </CForm>

        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => handleCloseModal(setModalVisible, resetAsignatura)}>
            Cancelar
          </CButton>
          <CButton style={{ backgroundColor: '#4B6251',color: 'white' }} onClick={handleCreateAsignatura}>
          <CIcon icon={cilSave} style={{ marginRight: '5px' }} />Guardar
          </CButton>
        </CModalFooter>
      </CModal>

    {/* Modal Actualizar Asignatura */}
    <CModal visible={modalUpdateVisible}  backdrop="static">
      <CModalHeader closeButton={false}>
      <CModalTitle>Actualizar Asignatura</CModalTitle>
      <CButton className="btn-close" aria-label="Close" onClick={() => handleCloseModal(setModalUpdateVisible, resetAsignaturatoUpdate)} />
      </CModalHeader>
      <CModalBody>
        <CForm>
          <CInputGroup className="mb-3">
            <CInputGroupText>Nombre de la Asignatura</CInputGroupText>
            <CFormInput
              type="text"
              maxLength={20}
              onPaste={disableCopyPaste}
              onCopy={disableCopyPaste}
              placeholder="Ingrese la nueva asignatura"
              value={asignaturaToUpdate.Nombre_asignatura}
              onChange={(e) => handleInputChange(e, (value) =>
                setAsignaturaToUpdate({ ...asignaturaToUpdate, Nombre_asignatura: value })
              )}
              ref={inputRefNombre}
              />
          </CInputGroup>

          <CInputGroup className="mb-3">
            <CInputGroupText>Descripcion de la Asignatura</CInputGroupText>
            <CFormInput 
              type="text"
              maxLength={20}
              onPaste={disableCopyPaste}
              onCopy={disableCopyPaste}
              placeholder="Ingrese una descripcion nueva"
              value={asignaturaToUpdate.Descripcion_asignatura}
              onChange={(e) => handleInputChange(e, (value) =>
                setAsignaturaToUpdate({ ...asignaturaToUpdate, Descripcion_asignatura: value })
              )}
              ref={inputRefDescripcion} // Asignar la referencia al input
            />
          </CInputGroup>
        </CForm>
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={() => handleCloseModal(setModalUpdateVisible, resetAsignaturatoUpdate)}>
          Cancelar
        </CButton>
        <CButton  style={{  backgroundColor: '#F9B64E',color: 'white' }}   onClick={handleUpdateAsignatura}>
        <CIcon icon={cilPen} style={{ marginRight: '5px' }} />Actualizar 
        </CButton>
      </CModalFooter>
    </CModal>

    {/* Modal Eliminar Asignatura */}
    <CModal visible={modalDeleteVisible} onClose={() => setModalDeleteVisible(false)} backdrop="static">
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
        <CButton style={{  backgroundColor: '#E57368',color: 'white' }}  onClick={handleDeleteAsignatura}>
        <CIcon icon={cilTrash} style={{ marginRight: '5px' }} />  Eliminar
        </CButton>
      </CModalFooter>
    </CModal>
 </CContainer>
  );
};


export default ListaAsignaturas;