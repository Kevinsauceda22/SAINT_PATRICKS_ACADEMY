import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { CIcon } from '@coreui/icons-react';
import { cilSearch, cilBrushAlt, cilPen, cilTrash, cilPlus, cilSave,cilDescription } from '@coreui/icons'; // Importar iconos específicos
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
  CFormSelect,
  CRow,
  CCol,
} from '@coreui/react';


const ListaEstadoasistencia = () => {
  const [estadoasistencia, setEstadoasistencia] = useState([]);
  const [modalVisible, setModalVisible] = useState(false); // Estado para el modal de crear un estado asistencia
  const [modalUpdateVisible, setModalUpdateVisible] = useState(false); // Estado para el modal de actualizar un estado asistencia
  const [modalDeleteVisible, setModalDeleteVisible] = useState(false); // Estado para el modal de eliminar un estado asistencia
  const [nuevoEstadoasistencia, setNuevoEstadoasistencia] = useState(''); // Estado para el nuevo estado asistencia
  const [estadoasistenciaToUpdate, setEstadoasistenciaToUpdate] = useState({}); // Estado para el estado asistencia actualizar
  const [estadoasistenciaToDelete, setEstadoasistenciaToDelete] = useState({}); // Estado para el estado asistencia a eliminar
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1); // Estado para la página actual
  const [recordsPerPage, setRecordsPerPage] = useState(5); // Hacer dinámico el número de registros por página
  const inputRef = useRef(null); // Referencia para el input
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false); // Estado para detectar cambios sin guardar

  useEffect(() => {
    fetchEstadoasistencia();
  }, []);

  const fetchEstadoasistencia = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/estadoAsistencia/estadoasistencias');
      const data = await response.json();
      // Asignar un índice original basado en el orden en la base de datos
    const dataWithIndex = data.map((estadoasistencia, index) => ({
      ...estadoasistencia,
      originalIndex: index + 1, // Guardamos la secuencia original
    }));
    
    setEstadoasistencia(dataWithIndex);
    } catch (error) {
      console.error('Error al obtener los Estadoasistencia:', error);
    }
  };

  // Función para manejar cambios en el input
  const handleInputChange = (e, setFunction) => {
    const input = e.target;
    const cursorPosition = input.selectionStart; // Guarda la posición actual del cursor
    let value = input.value
      .toUpperCase() // Convertir a mayúsculas
      .trimStart(); // Evitar espacios al inicio

    const regex = /^[A-ZÑ\s]*$/; // Solo letras y espacios

    // Verificar si hay múltiples espacios consecutivos antes de reemplazarlos
    if (/\s{2,}/.test(value)) {
      swal.fire({
        icon: 'warning',
        title: 'Espacios múltiples',
        text: 'No se permite más de un espacio entre palabras.',
      });
      value = value.replace(/\s+/g, ' '); // Reemplazar múltiples espacios por uno solo
    }

    // Validar solo letras y espacios
    if (!regex.test(value)) {
      swal.fire({
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
          swal.fire({
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
    swal.fire({
      icon: 'warning',
      title: 'Acción bloqueada',
      text: 'Copiar y pegar no está permitido.',
    });
  };

  // Función para cerrar el modal con advertencia si hay cambios sin guardar
  const handleCloseModal = (closeFunction, resetFields) => {
    if (hasUnsavedChanges) {
      swal.fire({
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

  const resetNuevoEstadoasistencia = () => setNuevoEstadoasistencia('');
  const resetEstadoasistenciaToUpdate = () => setEstadoasistenciaToUpdate('');

  const handleCreateEstadoasistencia = async () => {
    // Validación para campos vacíos
    if (!nuevoEstadoasistencia.trim()) {
      swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'El campo "Descripción" no puede estar vacío',
      });
      return;
    }

    // Normalizar la entrada de usuario para evitar problemas de mayúsculas o espacios adicionales
    const descripcionNormalizada = nuevoEstadoasistencia.trim().toLowerCase();
    // Verificar si ya existe el estado de asistencia antes de hacer la solicitud
    const existe = estadoasistencia.some(
      (estado) => estado.Descripcion_asistencia.trim().toLowerCase() === descripcionNormalizada
    );

    if (existe) {
      swal.fire({
        icon: 'error',
        title: 'Error',
        text: `El estado asistencia "${nuevoEstadoasistencia}" ya existe`,
      });
      return;
    }

    try {
      const response = await fetch('http://localhost:4000/api/estadoAsistencia/crearestadoasistencias', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ Descripcion_asistencia: nuevoEstadoasistencia }),  // Enviar descripción formateada
      });
  
      const result = await response.json();
  
      if (response.ok) {
        fetchEstadoasistencia();  // Actualiza la lista de estados de asistencia
        setModalVisible(false);  // Cierra el modal
        resetNuevoEstadoasistencia();
        setHasUnsavedChanges(false); // Reiniciar el estado de cambios no guardados
        swal.fire({
          icon: 'success',
          title: '¡Éxito!',
          text: 'El estado asistencia se ha creado correctamente',
        });
      } else {
        swal.fire({
          icon: 'error',
          title: 'Error',
          text: result.Mensaje || 'Hubo un problema al crear el estado asistencia',
        });
      }
    } catch (error) {
      console.error('Error al crear el estado asistencia', error);
      swal.fire({
        icon: 'error',
        title: 'Error en el servidor',
        text: 'Hubo un problema en el servidor. Inténtalo más tarde',
      });
    }
  };
  
  
  const handleUpdateEstadoasistencia = async () => {
    // Validación para campo vacío
    if (!estadoasistenciaToUpdate.Descripcion_asistencia.trim()) {
      swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'El campo "Descripción" no puede estar vacío',
      });
      return;
    }

    // Normalización de la descripción para evitar duplicados
    const descripcionNormalizada = estadoasistenciaToUpdate.Descripcion_asistencia.trim().toLowerCase();

    const existe = estadoasistencia.some(
      (estado) => 
        estado.Descripcion_asistencia.trim().toLowerCase() === descripcionNormalizada &&
        estado.Cod_estado_asistencia !== estadoasistenciaToUpdate.Cod_estado_asistencia
    );

    if (existe) {
      swal.fire({
        icon: 'error',
        title: 'Error',
        text: `El estado asistencia "${estadoasistenciaToUpdate.Descripcion_asistencia}" ya existe`,
      });
      return;
    }

    try {
      const response = await fetch('http://localhost:4000/api/estadoAsistencia/actualizarestadoasistencias', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          Cod_estado_asistencia: estadoasistenciaToUpdate.Cod_estado_asistencia,
          Descripcion_asistencia: estadoasistenciaToUpdate.Descripcion_asistencia, // Usar la descripción formateada
        }),
      });
  
      const result = await response.json();
  
      if (response.ok) {
        fetchEstadoasistencia(); // Refrescar la lista de estados de asistencia
        setModalUpdateVisible(false); // Cerrar el modal de actualización
        resetEstadoasistenciaToUpdate();
        setHasUnsavedChanges(false); // Reiniciar el estado de cambios no guardados
        
        swal.fire({
          icon: 'success',
          title: '¡Éxito!',
          text: 'El estado asistencia se ha actualizado correctamente',
        });
      } else {
        swal.fire({
          icon: 'error',
          title: 'Error',
          text: result.Mensaje || 'Hubo un problema al actualizar el estado asistencia.',
        });
      }
    } catch (error) {
      console.error('Hubo un problema al actualizar el estado asistencia:', error);
      swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un problema en el servidor. Inténtalo más tarde',
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
          Cod_estado_asistencia: estadoasistenciaToDelete.Cod_estado_asistencia
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
          title: '¡Éxito!',
          text: 'El estado asistencia se ha eliminado correctamente.',
        });
      } else {
        // Si hubo un error, mostrar el mensaje devuelto por el servidor
        swal.fire({
          icon: 'error',
          title: 'Error',
          text: result.Mensaje || 'Hubo un problema al eliminar el estado asistencia.',
        });
      }
    } catch (error) {
      // Manejo de errores inesperados (como problemas de red)
      console.error('Error al eliminar el estado asistencia:', error);
      swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un problema en el servidor. Inténtalo más tarde',
      });
    }
  };

   // Función para abrir el modal de actualización
  const openUpdateModal = (estadoasistencia) => {
    setEstadoasistenciaToUpdate(estadoasistencia); // Cargar los datos del estado asistencia a actualizar
    setModalUpdateVisible(true); // Abrir el modal de actualización
    setHasUnsavedChanges(false); // Resetear el estado al abrir el modal
  };

  const openDeleteModal = (estadoasistencia) => {
    setEstadoasistenciaToDelete(estadoasistencia); // Guardar el ciclo que se desea eliminar
    setModalDeleteVisible(true); // Abrir el modal de confirmación
  };

  // Cambia el estado de la página actual después de aplicar el filtro
  // Validar el buscador
  const handleSearch = (event) => {
    const input = event.target.value.toUpperCase();
    const regex = /^[A-ZÑ\s]*$/; // Solo permite letras, espacios y la letra "Ñ"
    
    if (!regex.test(input)) {
      swal.fire({
        icon: 'warning',
        title: 'Caracteres no permitidos',
        text: 'Solo se permiten letras y espacios.',
      });
      return;
    }
    setSearchTerm(input);
    setCurrentPage(1); // Resetear a la primera página al buscar
  };

  // Filtrar los estados de asistencia según el término de búsqueda
  const filteredEstadoasistencia = estadoasistencia.filter((estadoasistencia) =>
    estadoasistencia.Descripcion_asistencia.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Lógica de paginación
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredEstadoasistencia.slice(indexOfFirstRecord, indexOfLastRecord);

  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= Math.ceil(filteredEstadoasistencia.length / recordsPerPage)) {
      setCurrentPage(pageNumber);
    }
  };

 return (
  <CContainer>
    {/* Contenedor del h1 y botón "Nuevo" */}
    <CRow className="align-items-center mb-5">
      <CCol xs="8" md="9">
        {/* Título de la página */}
        <h1 className="mb-0">Mantenimiento Estado asistencia</h1>
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
            placeholder="Buscar estado asistencia..."
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


    {/* Tabla para mostrar Estadoasistencia */}
    {/* Contenedor de tabla con scroll */}
    <div className="table-container" style={{ maxHeight: '400px', overflowY: 'scroll', marginBottom: '20px' }}>
      <CTable striped bordered hover>
        <CTableHead style={{ position: 'sticky', top: 0, zIndex: 1, backgroundColor: '#fff' }}>
          <CTableRow> 
            <CTableHeaderCell style={{ width: '50px' }}>#</CTableHeaderCell>
            <CTableHeaderCell style={{ width: '300px' }}>Descripción</CTableHeaderCell>
            <CTableHeaderCell style={{ width: '150px' }}>Acciones</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {currentRecords.map((estadoasistencia) => (
            <CTableRow key={estadoasistencia.Cod_estado_asistencia}>
              <CTableDataCell>{estadoasistencia.originalIndex}</CTableDataCell>
              <CTableDataCell>{estadoasistencia.Descripcion_asistencia}</CTableDataCell>
              <CTableDataCell>
                <CButton style={{ backgroundColor: '#F9B64E', marginRight: '10px' }} onClick={() => openUpdateModal(estadoasistencia)}>
                  <CIcon icon={cilPen} />
                </CButton>
                <CButton style={{ backgroundColor: '#E57368', marginRight: '10px' }} onClick={() => openDeleteModal(estadoasistencia)}>
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
          disabled={currentPage === 1} // Desactiva si es la primera página
          onClick={() => paginate(currentPage - 1)} // Páginas anteriores
        >
          Anterior
        </CButton>
        <CButton
          style={{ marginLeft: '10px', backgroundColor: '#6f8173', color: '#D9EAD3' }}
          disabled={currentPage === Math.ceil(filteredEstadoasistencia.length / recordsPerPage)} // Desactiva si es la última página
          onClick={() => paginate(currentPage + 1)} // Páginas siguientes
        >
          Siguiente
        </CButton>
      </CPagination>
      <span style={{ marginLeft: '10px' }}>
        Página {currentPage} de {Math.ceil(filteredEstadoasistencia.length / recordsPerPage)}
      </span>
    </div>

    {/* Modal Crear Estado asistencia */}
    <CModal visible={modalVisible} backdrop="static">
      <CModalHeader closeButton={false}>
        <CModalTitle>Nuevo Estado Asistencia</CModalTitle>
        <CButton className="btn-close" aria-label="Close" onClick={() => handleCloseModal(setModalVisible, resetNuevoEstadoasistencia)} />
        </CModalHeader>
      <CModalBody>
        <CForm>
          <CInputGroup className="mb-3">
            <CInputGroupText>Descripción</CInputGroupText>
            <CFormInput
              ref={inputRef} // Asignar la referencia al input
              type="text"
              placeholder="Ingrese la descripción del estado"
              value={nuevoEstadoasistencia}
              maxLength={50} // Limitar a 50 caracteres
              onPaste={disableCopyPaste}
              onCopy={disableCopyPaste}
              onChange={(e) => handleInputChange(e, setNuevoEstadoasistencia)}
          />
          </CInputGroup>
        </CForm>
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={() => handleCloseModal(setModalVisible, resetNuevoEstadoasistencia)}>
          Cancelar
        </CButton>
        <CButton  style={{ backgroundColor: '#4B6251',color: 'white' }} onClick={handleCreateEstadoasistencia}>
        <CIcon icon={cilSave} style={{ marginRight: '5px' }} /> Guardar
        </CButton>
      </CModalFooter>
    </CModal>

    {/* Modal Actualizar Estado Asistencia*/}
    <CModal visible={modalUpdateVisible} backdrop="static">
      <CModalHeader closeButton={false}>
      <CModalTitle>Actualizar Estado Asistencia</CModalTitle>
      <CButton className="btn-close" aria-label="Close" onClick={() => handleCloseModal(setModalUpdateVisible, resetEstadoasistenciaToUpdate)} />
      </CModalHeader>
      <CModalBody>
        <CForm>
          <CInputGroup className="mb-3">
            <CInputGroupText>Descripción</CInputGroupText>
            <CFormInput
              ref={inputRef} // Asignar la referencia al input
              type="text"
              placeholder="Ingrese la descripción del estado"
              value={estadoasistenciaToUpdate.Descripcion_asistencia}
              maxLength={50} // Limitar a 50 caracteres
              onPaste={disableCopyPaste}
              onCopy={disableCopyPaste}
              onChange={(e) => handleInputChange(e, (value) =>
                setEstadoasistenciaToUpdate({ ...estadoasistenciaToUpdate, Descripcion_asistencia: value })
              )}
            />
          </CInputGroup>
        </CForm>
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={() => handleCloseModal(setModalUpdateVisible, resetEstadoasistenciaToUpdate)}>
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
        <p>¿Estás seguro de que deseas eliminar el estado: <strong>{estadoasistenciaToDelete.Descripcion_asistencia}</strong>?</p>
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