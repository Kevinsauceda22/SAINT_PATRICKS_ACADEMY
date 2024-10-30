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


const ListaEstadonota = () => {
  const [estadonota, setEstadonota] = useState([]);
  const [modalVisible, setModalVisible] = useState(false); // Estado para el modal de crear un estado nota
  const [modalUpdateVisible, setModalUpdateVisible] = useState(false); // Estado para el modal de actualizar un estado nota
  const [modalDeleteVisible, setModalDeleteVisible] = useState(false); // Estado para el modal de eliminar un estado nota
  const [nuevoEstadonota, setNuevoEstadonota] = useState(''); // Estado para el nuevo estado nota
  const [estadonotaToUpdate, setEstadonotaToUpdate] = useState({}); // Estado para el estado nota actualizar
  const [estadonotaToDelete, setEstadonotaToDelete] = useState({}); // Estado para el estado nota a eliminar
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1); // Estado para la página actual
  const [recordsPerPage, setRecordsPerPage] = useState(5); // Hacer dinámico el número de registros por página
  const inputRef = useRef(null); // Referencia para el input
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false); // Estado para detectar cambios sin guardar
  
  useEffect(() => {
    fetchEstadonota();
  }, []);

  const fetchEstadonota = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/estadoNotas/estadonota');
      const data = await response.json();
      // Asignar un índice original basado en el orden en la base de datos
    const dataWithIndex = data.map((estadonota, index) => ({
      ...estadonota,
      originalIndex: index + 1, // Guardamos la secuencia original
    }));
    
    setEstadonota(dataWithIndex);
    } catch (error) {
      console.error('Error al obtener los Estadonota:', error);
    }
  };

    // Función para manejar cambios en el input
    const handleInputChange = (e, setFunction) => {
      const input = e.target;
      const cursorPosition = input.selectionStart; // Guarda la posición actual del cursor
      let value = input.value
        .toUpperCase() // Convertir a mayúsculas
        .trimStart(); // Evitar espacios al inicio
  
      const regex =  /^[A-ZÑ\s]*$/; // Solo letras y espacios
  
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
  
    const resetNuevoEstadonota = () => setNuevoEstadonota('');
    const resetEstadonotaToUpdate = () => setEstadonotaToUpdate('');

    

  const handleCreateEstadonota = async () => {
     // Validación para campos vacíos
     if (!nuevoEstadonota.trim()) {
      swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'El campo "Descripción" no puede estar vacío',
      });
      return;
    }

    // Normalizar la entrada de usuario para evitar problemas de mayúsculas o espacios adicionales
    const descripcionNormalizada = nuevoEstadonota.trim().toLowerCase();
    // Verificar si ya existe el estado de asistencia antes de hacer la solicitud
    const existe = estadonota.some(
      (estado) => estado.Descripcion.trim().toLowerCase() === descripcionNormalizada
    );

    if (existe) {
      swal.fire({
        icon: 'error',
        title: 'Error',
        text: `El estado nota "${nuevoEstadonota}" ya existe`,
      });
      return;
    }
      try {
      const response = await fetch('http://localhost:4000/api/estadoNotas/crearestadonota', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ Descripcion: nuevoEstadonota }), // Enviar descripción formateada
      });
       
      const result = await response.json();

      if (response.ok) {
        fetchEstadonota(); // Actualiza la lista de estados de asistencia
        setModalVisible(false); // Cierra el modal
        setNuevoEstadonota('');
        setHasUnsavedChanges(false); // Reiniciar el estado de cambios no guardados
        swal.fire({
          icon: 'success',
          title: '¡Éxito!',
          text: 'El estado nota se ha creado correctamente',
        });
      } else {
        swal.fire({
          icon: 'error',
          title: 'Error de validación',
          text: result.Mensaje || 'Hubo un problema al crear el estado nota',
        });
      }
    } catch (error) {
      console.error('Error al crear el estado nota:', error);
      swal.fire({
        icon: 'error',
        title: 'Error en el servidor',
        text: 'Hubo un problema en el servidor. Inténtalo más tarde',
      });
    }
  };


  const handleUpdateEstadonota = async () => {
     // Validación para campo vacío
     if (!estadonotaToUpdate.Descripcion.trim()) {
      swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'El campo "Descripción" no puede estar vacío',
      });
      return;
    }

    // Normalización de la descripción para evitar duplicados
    const descripcionNormalizada = estadonotaToUpdate.Descripcion.trim().toLowerCase();

    const existe = estadonota.some(
      (estado) => 
        estado.Descripcion.trim().toLowerCase() === descripcionNormalizada &&
        estado.Cod_estado !== estadonotaToUpdate.Cod_estado
    );

    if (existe) {
      swal.fire({
        icon: 'error',
        title: 'Error',
        text: `El estado nota "${estadonotaToUpdate.Descripcion}" ya existe`,
      });
      return;
    }
    try {
      const response = await fetch('http://localhost:4000/api/estadoNotas/actualizarestadonota', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          Cod_estado: estadonotaToUpdate.Cod_estado, 
          Descripcion: estadonotaToUpdate.Descripcion, // Usar la descripcion formateada
        }),
      });

      const result = await response.json();

      if (response.ok) {
        fetchEstadonota(); // Refrescar la lista de Estado nota después de la actualización
        setModalUpdateVisible(false); // Cerrar el modal de actualización
        resetEstadonotaToUpdate();
        setHasUnsavedChanges(false); // Reiniciar el estado de cambios no guardados
        
        swal.fire({
          icon: 'success',
          title: '¡Éxito!',
          text: 'El estado nota se ha actualizado correctamente',
        });
      } else {
        swal.fire({
          icon: 'error',
          title: 'Error',
          text: result.Mensaje || 'Hubo un problema al actualizar el estado nota.',
        });
      }
    } catch (error) {
      console.error('Error al actualizar el estado nota:', error);
      swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un problema en el servidor. Inténtalo más tarde',
      });
    }
  };
  

  const handleDeleteEstadonota = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/estadoNotas/eliminarestadonota', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          Cod_estado: estadonotaToDelete.Cod_estado 
        }), // Enviar Cod_estado en el cuerpo
      });

      // Parsear la respuesta JSON del servidor
      const result = await response.json();

      if (response.ok) {
        // Si la respuesta es exitosa
        fetchEstadonota(); // Refrescar la lista de Estado nota después de la eliminación
        setModalDeleteVisible(false); // Cerrar el modal de confirmación
        setEstadonotaToDelete({}); // Resetear el Estado nota a eliminar
        swal.fire({
          icon: 'success',
          title: '¡Éxito!',
          text: 'El estado nota se ha eliminado correctamente',
        });
      } else {
        // Si hubo un error, mostrar el mensaje devuelto por el servidor
        swal.fire({
          icon: 'error',
          title: 'Error',
          text: result.Mensaje || 'Hubo un problema al eliminar el estado nota.',
        });
      }
    } catch (error) {
      // Manejo de errores inesperados (como problemas de red)
      console.error('Error al eliminar el estado nota:', error);
      swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un problema en el servidor. Inténtalo más tarde',
      });
    }
  };

   // Función para abrir el modal de actualización
  const openUpdateModal = (estadonota) => {
    setEstadonotaToUpdate(estadonota); // Cargar los datos del estado nota a actualizar
    setModalUpdateVisible(true); // Abrir el modal de actualización
    setHasUnsavedChanges(false); // Resetear el estado al abrir el modal
  };

  const openDeleteModal = (estadonota) => {
    setEstadonotaToDelete(estadonota); // Guardar el estado nota que se desea eliminar
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
  const filteredEstadonota = estadonota.filter((estadonota) =>
    estadonota.Descripcion.toLowerCase().includes(searchTerm.toLowerCase())
  );

 // Lógica de paginación
 const indexOfLastRecord = currentPage * recordsPerPage;
 const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
 const currentRecords = filteredEstadonota.slice(indexOfFirstRecord, indexOfLastRecord);

 // Cambiar página
const paginate = (pageNumber) => {
  if (pageNumber > 0 && pageNumber <= Math.ceil(filteredEstadonota.length / recordsPerPage)) {
    setCurrentPage(pageNumber);
  }
}

return (
  <CContainer>
    {/* Contenedor del h1 y botón "Nuevo" */}
    <CRow className="align-items-center mb-5">
      <CCol xs="8" md="9">
        {/* Título de la página */}
        <h1 className="mb-0">Mantenimiento Estado nota</h1>
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
            placeholder="Buscar estado nota..."
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


    {/* Tabla para mostrar Estadonota */}
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
          {currentRecords.map((estadonota) => (
            <CTableRow key={estadonota.Cod_estado}>
              <CTableDataCell>{estadonota.originalIndex}</CTableDataCell>
              <CTableDataCell>{estadonota.Descripcion}</CTableDataCell>
              <CTableDataCell>
                <CButton style={{ backgroundColor: '#F9B64E', marginRight: '10px' }} onClick={() => openUpdateModal(estadonota)}>
                  <CIcon icon={cilPen} />
                </CButton>
                <CButton style={{ backgroundColor: '#E57368', marginRight: '10px' }} onClick={() => openDeleteModal(estadonota)}>
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
          disabled={currentPage === Math.ceil(filteredEstadonota.length / recordsPerPage)} // Desactiva si es la última página
          onClick={() => paginate(currentPage + 1)} // Páginas siguientes
        >
          Siguiente
        </CButton>
      </CPagination>
      <span style={{ marginLeft: '10px' }}>
        Página {currentPage} de {Math.ceil(filteredEstadonota.length / recordsPerPage)}
      </span>
    </div>

    {/* Modal Crear Estado nota */}
    <CModal visible={modalVisible} backdrop="static">
      <CModalHeader closeButton={false}>
        <CModalTitle>Nuevo Estado Nota</CModalTitle>
        <CButton className="btn-close" aria-label="Close" onClick={() => handleCloseModal(setModalVisible, resetNuevoEstadonota)} />
        </CModalHeader>
      <CModalBody>
        <CForm>
          <CInputGroup className="mb-3">
            <CInputGroupText>Descripción</CInputGroupText>
            <CFormInput
              ref={inputRef} // Asignar la referencia al input
              type="text"
              placeholder="Ingrese la descripción del estado"
              value={nuevoEstadonota}
              maxLength={50} // Limitar a 50 caracteres
              onPaste={disableCopyPaste}
              onCopy={disableCopyPaste}
              onChange={(e) => handleInputChange(e, setNuevoEstadonota)}
          />
          </CInputGroup>
        </CForm>
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={() => handleCloseModal(setModalVisible, resetNuevoEstadonota)}>
          Cancelar
        </CButton>
        <CButton  style={{ backgroundColor: '#4B6251',color: 'white' }} onClick={handleCreateEstadonota}>
        <CIcon icon={cilSave} style={{ marginRight: '5px' }} /> Guardar
        </CButton>
      </CModalFooter>
    </CModal>

    {/* Modal Actualizar Estado nota*/}
    <CModal visible={modalUpdateVisible} backdrop="static">
      <CModalHeader closeButton={false}>
      <CModalTitle>Actualizar Estado Nota</CModalTitle>
      <CButton className="btn-close" aria-label="Close" onClick={() => handleCloseModal(setModalUpdateVisible, resetEstadonotaToUpdate)} />
      </CModalHeader>
      <CModalBody>
        <CForm>
          <CInputGroup className="mb-3">
            <CInputGroupText>Descripción</CInputGroupText>
            <CFormInput
              ref={inputRef} // Asignar la referencia al input
              type="text"
              placeholder="Ingrese la descripción del estado"
              value={estadonotaToUpdate.Descripcion}
              maxLength={50} // Limitar a 50 caracteres
              onPaste={disableCopyPaste}
              onCopy={disableCopyPaste}
              onChange={(e) => handleInputChange(e, (value) =>
                setEstadonotaToUpdate({ ...estadonotaToUpdate, Descripcion: value })
              )}
            />
          </CInputGroup>
        </CForm>
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={() => handleCloseModal(setModalUpdateVisible, resetEstadonotaToUpdate)}>
          Cancelar
        </CButton>
        <CButton  style={{  backgroundColor: '#F9B64E',color: 'white' }}  onClick={handleUpdateEstadonota}>
          <CIcon icon={cilPen} style={{ marginRight: '5px' }} /> Actualizar
        </CButton>
      </CModalFooter>
    </CModal>

    {/* Modal Eliminar estado Nota */}
    <CModal visible={modalDeleteVisible} onClose={() => setModalDeleteVisible(false)} backdrop="static">
      <CModalHeader>
      <CModalTitle>Confirmar Eliminación</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <p>¿Estás seguro de que deseas eliminar el estado: <strong>{estadonotaToDelete.Descripcion}</strong>?</p>
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={() => setModalDeleteVisible(false)}>
          Cancelar
        </CButton>
        <CButton  style={{  backgroundColor: '#E57368',color: 'white' }}  onClick={handleDeleteEstadonota}>
          <CIcon icon={cilTrash} style={{ marginRight: '5px' }} /> Eliminar
        </CButton>
      </CModalFooter>
    </CModal>
 </CContainer>
  );
};


export default ListaEstadonota;