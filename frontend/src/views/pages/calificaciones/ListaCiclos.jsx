import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { CIcon } from '@coreui/icons-react';
import { cilSearch, cilBrushAlt, cilPen, cilTrash, cilPlus, cilSave,cilDescription } from '@coreui/icons'; // Importar iconos específicos
import Swal from 'sweetalert2';
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
import usePermission from '../../../../context/usePermission';
import AccessDenied from "../AccessDenied/AccessDenied"


const ListaCiclos = () => {
  const { canSelect, loading, error, canDelete, canInsert, canUpdate } = usePermission('ListaCiclos');
  const [ciclos, setCiclos] = useState([]);
  const [modalVisible, setModalVisible] = useState(false); // Estado para el modal de crear ciclo
  const [modalUpdateVisible, setModalUpdateVisible] = useState(false); // Estado para el modal de actualizar ciclo
  const [modalDeleteVisible, setModalDeleteVisible] = useState(false); // Estado para el modal de eliminar ciclo
  const [nuevoCiclo, setNuevoCiclo] = useState(''); // Estado para el nuevo ciclo
  const [cicloToUpdate, setCicloToUpdate] = useState({}); // Estado para el ciclo a actualizar
  const [cicloToDelete, setCicloToDelete] = useState({}); // Estado para el ciclo a eliminar
  const [recordsPerPage, setRecordsPerPage] = useState(5); // Hacer dinámico el número de registros por página
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1); // Estado para la página actual
  const inputRef = useRef(null); // Referencia para el input
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false); // Estado para detectar cambios sin guardar
  const resetNuevoCiclo= () => setNuevoCiclo('');
  const resetCiclotoUpdate = () => setCicloToUpdate('');


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
    const nombreCiclo = typeof nuevoCiclo === 'string' ? nuevoCiclo : nuevoCiclo.Nombre_ciclo;
   // Comprobación de vacío
   if (!nombreCiclo || nombreCiclo.trim() === '') {
      Swal.fire('Error', 'El campo "Nombre del Ciclo" no puede estar vacío', 'error');
      return false;
    }

    // Verificar si el nombre del ciclo ya existe
    const cicloExistente = ciclos.some(
      (ciclo) => ciclo.Nombre_ciclo.toLowerCase() === nombreCiclo.toLowerCase()
    );

    if (cicloExistente) {
      Swal.fire('Error', `El ciclo "${nombreCiclo}" ya existe`, 'error');
      return false;
    }

    return true;
  };

  const validarCicloUpdate = () => {
  if (!cicloToUpdate.Nombre_ciclo) {
    Swal.fire('Error', 'El campo "Nombre del Ciclo" no puede estar vacío', 'error');
    return false;
  }
  // Verificar si el nombre del ciclo ya existe (excluyendo el ciclo actual que se está editando)
  const cicloExistente = ciclos.some(
    (ciclo) =>
      ciclo.Nombre_ciclo.toLowerCase() === cicloToUpdate.Nombre_ciclo.toLowerCase() &&
      ciclo.Cod_ciclo !== cicloToUpdate.Cod_ciclo
  );

  if (cicloExistente) {
    Swal.fire('Error', `El ciclo "${cicloToUpdate.Nombre_ciclo}" ya existe `, 'error');
    return false;
  }

  return true;
};

  // Función para manejar cambios en el input
  const handleInputChange = (e, setFunction) => {
    const input = e.target;
    const cursorPosition = input.selectionStart; // Guarda la posición actual del cursor
    let value = input.value
      .toUpperCase() // Convertir a mayúsculas
      .trimStart(); // Evitar espacios al inicio

    const regex = /^[A-ZÑ\s]*$/;// Solo letras y espacios

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
      if (inputRef.current) {
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


  const handleCreateCiclo = async () => {
    if (!validarCiclo()) return;
    try {
      const response = await fetch('http://localhost:4000/api/ciclos/crearCiclo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({Nombre_ciclo: nuevoCiclo}),
      });

      if (response.ok) {
        fetchCiclos();
        setModalVisible(false);
        resetNuevoCiclo();
        setHasUnsavedChanges(false);
        Swal.fire('¡Éxito!', 'El ciclo se ha creado correctamente', 'success');
      } else {
        Swal.fire('Error', 'Hubo un problema al crear el ciclo', 'error');
      }
    } catch (error) {
      Swal.fire('Error', 'Hubo un problema al crear el ciclo', 'error');
    }
  };


  const handleUpdateCiclo = async () => {
    if (!validarCicloUpdate()) return ;  
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
        resetCiclotoUpdate(); // Resetear el ciclo a actualizar
        setHasUnsavedChanges(false);
        Swal.fire('¡Éxito!', 'El ciclo se ha actualizado correctamente', 'success');
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
        Swal.fire('¡Éxito!', 'El ciclo se ha eliminado correctamente', 'success');
      } else {
        Swal.fire('Error', 'El ciclo ya pertenece a un grado', 'error');
      }
    } catch (error) {
      Swal.fire('Error', 'Hubo un problema al eliminar el ciclo', 'error');
    }
  };

  const openUpdateModal = (ciclo) => {
    setCicloToUpdate(ciclo); // Cargar los datos del ciclo a actualizar
    setModalUpdateVisible(true); // Abrir el modal de actualización
    setHasUnsavedChanges(false);
  };

  const openDeleteModal = (ciclo) => {
    setCicloToDelete(ciclo); // Guardar el ciclo que se desea eliminar
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

  // Verificar permisos
  if (!canSelect) {
    return <AccessDenied />;
  }

 return (
  <CContainer>
     {/* Contenedor del h1 y botón "Nuevo" */}
     <CRow className="align-items-center mb-5">
      <CCol xs="8" md="9">
        {/* Título de la página */}
        <h1 className="mb-0">Mantenimiento Ciclos</h1>
      </CCol>
      <CCol xs="4" md="3" className="text-end d-flex flex-column flex-md-row justify-content-md-end align-items-md-center">
        {/* Botón Nuevo para abrir el modal */}

     {canInsert && (
        <CButton 
          style={{ backgroundColor: '#4B6251', color: 'white' }} 
          className="mb-3 mb-md-0 me-md-3" // Margen inferior en pantallas pequeñas, margen derecho en pantallas grandes
          onClick={() => { setModalVisible(true);
            setHasUnsavedChanges(false); // Resetear el estado al abrir el modal
          }}
        >
          <CIcon icon={cilPlus} /> Nuevo
        </CButton>
     )}

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
            placeholder="Buscar Ciclo..."
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
    <div className="table-container" style={{ maxHeight: '400px', overflowY: 'scroll', marginBottom: '20px' }}>
        <CTable striped bordered hover>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell style={{ width: '50px' }}>#</CTableHeaderCell>
              <CTableHeaderCell style={{ width: '50px' }}>Nombre del Ciclo</CTableHeaderCell>
              <CTableHeaderCell style={{ width: '50px' }}>Acciones</CTableHeaderCell>
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
 {canUpdate && (
                  <CButton style={{ backgroundColor: '#F9B64E',marginRight: '10px' }} onClick={() => openUpdateModal(ciclo)}>
                    <CIcon icon={cilPen} />
                  </CButton>
 )}

{canDelete && (
                  <CButton style={{ backgroundColor: '#E57368', marginRight: '10px' }} onClick={() => openDeleteModal(ciclo)}>
                    <CIcon icon={cilTrash} />
                  </CButton>
)}

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
          disabled={currentPage === 1} // Desactiva si es la primera página
          onClick={() => paginate(currentPage - 1)} // Páginas anteriores
        >
          Anterior
        </CButton>
        <CButton
          style={{ marginLeft: '10px', backgroundColor: '#6f8173', color: '#D9EAD3' }}
          disabled={currentPage === Math.ceil(filteredCiclos.length / recordsPerPage)} // Desactiva si es la última página
          onClick={() => paginate(currentPage + 1)} // Páginas siguientes
        >
          Siguiente
        </CButton>
      </CPagination>
      <span style={{ marginLeft: '10px' }}>
        Página {currentPage} de {Math.ceil(filteredCiclos.length / recordsPerPage)}
      </span>
    </div>


    {/* Modal Crear Ciclo */}
    <CModal visible={modalVisible} backdrop="static">
      <CModalHeader closeButton={false}>
        <CModalTitle>Nuevo Ciclo</CModalTitle>
        <CButton className="btn-close" aria-label="Close" onClick={() => handleCloseModal(setModalVisible, resetNuevoCiclo)} />
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CInputGroup className="mb-3">
              <CInputGroupText>Nombre del Ciclo</CInputGroupText>
              <CFormInput
              ref={inputRef}
              type="text"
              placeholder="Ingrese el nombre del ciclo"
              maxLength={20}
              onPaste={disableCopyPaste}
              onCopy={disableCopyPaste}
              value={nuevoCiclo}
              onChange={(e) => handleInputChange(e, setNuevoCiclo)}
            />
            </CInputGroup>
          </CForm>
        </CModalBody>
        <CModalFooter>
        <CButton color="secondary" onClick={() => handleCloseModal(setModalVisible, resetNuevoCiclo)}>
            Cancelar
          </CButton>
          <CButton style={{ backgroundColor: '#4B6251',color: 'white' }} onClick={handleCreateCiclo}>
          <CIcon icon={cilSave} style={{ marginRight: '5px' }} /> Guardar
          </CButton>
        </CModalFooter>
      </CModal>

    {/* Modal Actualizar Ciclo */}
    <CModal visible={modalUpdateVisible} backdrop="static">
      <CModalHeader closeButton={false}>
      <CModalTitle>Actualizar Ciclo</CModalTitle>
      <CButton className="btn-close" aria-label="Close" onClick={() => handleCloseModal(setModalUpdateVisible, resetCiclotoUpdate)} />
      </CModalHeader>
      <CModalBody>
        <CForm>
          <CInputGroup className="mb-3">
            <CInputGroupText>Nombre del Ciclo</CInputGroupText>
            <CFormInput
              ref={inputRef} // Asignar la referencia al input
              maxLength={20}
              onPaste={disableCopyPaste}
              onCopy={disableCopyPaste}
              placeholder="Ingrese el nuevo nombre del ciclo"
              value={cicloToUpdate.Nombre_ciclo}
              onChange={(e) => handleInputChange(e, (value) => setCicloToUpdate({
                ...cicloToUpdate,
                Nombre_ciclo: value,
              }))}
            />
          </CInputGroup>
        </CForm>
      </CModalBody>
      <CModalFooter>
      <CButton color="secondary" onClick={() => handleCloseModal(setModalUpdateVisible, resetCiclotoUpdate)}>
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