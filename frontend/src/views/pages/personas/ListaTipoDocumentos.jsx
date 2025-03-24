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

const ListaTipoDocumentos = () => {
    const { canSelect, loading, error, canDelete, canInsert, canUpdate } = usePermission('ListaTipoDocumentos');
    const [tipoDocumentos, setTipoDocumentos] = useState([]);
    const [modalVisible, setModalVisible] = useState(false); // Estado para el modal de crear tipo documento
    const [modalUpdateVisible, setModalUpdateVisible] = useState(false); // Estado para el modal de actualizar tipo documento
    const [modalDeleteVisible, setModalDeleteVisible] = useState(false); // Estado para el modal de eliminar tipo documento
    const [nuevoTipoDocumento, setNuevoTipoDocumento] = useState(''); // Estado para el nuevo tipo documento
    const [tipoDocumentoToUpdate, setTipoDocumentoToUpdate] = useState({}); // Estado para el tipo documento a actualizar
    const [tipoDocumentoToDelete, setTipoDocumentoToDelete] = useState({}); // Estado para el tipo documento a eliminar
    const [recordsPerPage, setRecordsPerPage] = useState(5); // Hacer dinámico el número de registros por página
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1); // Estado para la página actual
    const inputRef = useRef(null); // Referencia para el input
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false); // Estado para detectar cambios sin guardar
    const resetNuevoTipoDocumento = () => setNuevoTipoDocumento('');
    const resetTipoDocumentoToUpdate = () => setTipoDocumentoToUpdate({});

    useEffect(() => {
        fetchTipoDocumentos();
      }, []);
    
      const fetchTipoDocumentos = async () => {
        try {
          const response = await fetch('http://localhost:4000/api/tipoDocumento/verTodoTipoDocumento');
          const data = await response.json();
          const dataWithIndex = data.map((tipoDocumento, index) => ({
            ...tipoDocumento,
            originalIndex: index + 1,
          }));
          setTipoDocumentos(dataWithIndex);
        } catch (error) {
          console.error('Error al obtener los tipos de documento:', error);
        }
      };
    
      const validarTipoDocumento = () => {
        const nombreTipoDocumento = typeof nuevoTipoDocumento === 'string' ? nuevoTipoDocumento : nuevoTipoDocumento.Nombre_tipo_documento;
        if (!nombreTipoDocumento || nombreTipoDocumento.trim() === '') {
          Swal.fire('Error', 'El campo "Nombre del Tipo de Documento" no puede estar vacío', 'error');
          return false;
        }
        const tipoDocumentoExistente = tipoDocumentos.some(
          (tipoDocumento) => tipoDocumento.Nombre_tipo_documento.toLowerCase() === nombreTipoDocumento.toLowerCase()
        );
        if (tipoDocumentoExistente) {
          Swal.fire('Error', `El tipo de documento "${nombreTipoDocumento}" ya existe`, 'error');
          return false;
        }
        return true;
      };
    
      const validarTipoDocumentoUpdate = () => {
        if (!tipoDocumentoToUpdate.Nombre_tipo_documento) {
          Swal.fire('Error', 'El campo "Nombre del Tipo de Documento" no puede estar vacío', 'error');
          return false;
        }
        const tipoDocumentoExistente = tipoDocumentos.some(
          (tipoDocumento) =>
            tipoDocumento.Nombre_tipo_documento.toLowerCase() === tipoDocumentoToUpdate.Nombre_tipo_documento.toLowerCase() &&
            tipoDocumento.Cod_tipo_documento !== tipoDocumentoToUpdate.Cod_tipo_documento
        );
        if (tipoDocumentoExistente) {
          Swal.fire('Error', `El tipo de documento "${tipoDocumentoToUpdate.Nombre_tipo_documento}" ya existe`, 'error');
          return false;
        }
        return true;
      };
    
      const handleInputChange = (e, setFunction) => {
        const input = e.target;
        const cursorPosition = input.selectionStart;
        let value = input.value.toUpperCase().trimStart();
        const regex = /^[A-ZÑ\s]*$/;
        if (/\s{2,}/.test(value)) {
          Swal.fire({ icon: 'warning', title: 'Espacios múltiples', text: 'No se permite más de un espacio entre palabras.' });
          value = value.replace(/\s+/g, ' ');
        }
        if (!regex.test(value)) {
          Swal.fire({ icon: 'warning', title: 'Caracteres no permitidos', text: 'Solo se permiten letras y espacios.' });
          return;
        }
        const words = value.split(' ');
        for (let word of words) {
          const letterCounts = {};
          for (let letter of word) {
            letterCounts[letter] = (letterCounts[letter] || 0) + 1;
            if (letterCounts[letter] > 4) {
              Swal.fire({ icon: 'warning', title: 'Repetición de letras', text: `La letra "${letter}" se repite más de 4 veces en la palabra "${word}".` });
              return;
            }
          }
        }
        input.value = value;
        setFunction(value);
        setHasUnsavedChanges(true);
        requestAnimationFrame(() => {
          if (inputRef.current) {
            inputRef.current.setSelectionRange(cursorPosition, cursorPosition);
          }
        });
      };
    
      const disableCopyPaste = (e) => {
        e.preventDefault();
        Swal.fire({ icon: 'warning', title: 'Acción bloqueada', text: 'Copiar y pegar no está permitido.' });
      };
    
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
              resetFields();
              setHasUnsavedChanges(false);
            }
          });
        } else {
          closeFunction(false);
          resetFields();
          setHasUnsavedChanges(false);
        }
      };


      const handleCreateTipoDocumento = async () => {
        if (!validarTipoDocumento()) return;
        try {
          const response = await fetch('http://localhost:4000/api/tipoDocumento/crearTipoDocumento', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ Nombre_tipo_documento: nuevoTipoDocumento }),
          });
    
          if (response.ok) {
            fetchTipoDocumentos();
            setModalVisible(false);
            resetNuevoTipoDocumento();
            setHasUnsavedChanges(false);
            Swal.fire('¡Éxito!', 'El tipo de documento se ha creado correctamente', 'success');
          } else {
            Swal.fire('Error', 'Hubo un problema al crear el tipo de documento', 'error');
          }
        } catch (error) {
          Swal.fire('Error', 'Hubo un problema al crear el tipo de documento', 'error');
        }
      };

      const handleUpdateTipoDocumento = async () => {
        if (!validarTipoDocumentoUpdate()) return;
        try {
          const response = await fetch(`http://localhost:4000/api/tipoDocumento/actualizarTipoDocumento/${tipoDocumentoToUpdate.Cod_tipo_documento}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ Nombre_tipo_documento: tipoDocumentoToUpdate.Nombre_tipo_documento }),
          });
    
          if (response.ok) {
            fetchTipoDocumentos();
            setModalUpdateVisible(false);
            resetTipoDocumentoToUpdate();
            setHasUnsavedChanges(false);
            Swal.fire('¡Éxito!', 'El tipo de documento se ha actualizado correctamente', 'success');
          } else {
            Swal.fire('Error', 'Hubo un problema al actualizar el tipo de documento', 'error');
          }
        } catch (error) {
          Swal.fire('Error', 'Hubo un problema al actualizar el tipo de documento', 'error');
        }
      };

      const handleDeleteTipoDocumento = async () => {
        try {
          const response = await fetch(`http://localhost:4000/api/tipoDocumento/eliminarTipoDocumento/${tipoDocumentoToDelete.Cod_tipo_documento}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
          });
      
          if (response.ok) {
            fetchTipoDocumentos(); // Refrescar la lista de tipoDocumentos después de la eliminación
            setModalDeleteVisible(false); // Cerrar el modal de confirmación
            setTipoDocumentoToDelete({}); // Resetear el tipoDocumento a eliminar
            Swal.fire('¡Éxito!', 'El tipo de documento se ha eliminado correctamente', 'success');
          } else {
            Swal.fire('Error', 'El tipo de documento está en uso y no se puede eliminar', 'error');
          }
        } catch (error) {
          Swal.fire('Error', 'Hubo un problema al eliminar el tipo de documento', 'error');
        }
      };

      const openUpdateModal = (tipoDocumento) => {
  setTipoDocumentoToUpdate(tipoDocumento); // Cargar los datos del tipo de documento a actualizar
  setModalUpdateVisible(true); // Abrir el modal de actualización
  setHasUnsavedChanges(false);
};

const openDeleteModal = (tipoDocumento) => {
  setTipoDocumentoToDelete(tipoDocumento); // Guardar el tipo de documento que se desea eliminar
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
const filteredTipoDocumentos = tipoDocumentos.filter((tipoDocumento) =>
  tipoDocumento.tipo_documento.toLowerCase().includes(searchTerm.toLowerCase())
);

// Lógica de paginación
const indexOfLastRecord = currentPage * recordsPerPage;
const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
const currentRecords = filteredTipoDocumentos.slice(indexOfFirstRecord, indexOfLastRecord);

// Cambiar página
const paginate = (pageNumber) => {
  if (pageNumber > 0 && pageNumber <= Math.ceil(filteredTipoDocumentos.length / recordsPerPage)) {
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
      <h1 className="mb-0">Mantenimiento Tipos de Documento</h1>
    </CCol>
    <CCol xs="4" md="3" className="text-end d-flex flex-column flex-md-row justify-content-md-end align-items-md-center">
      {/* Botón Nuevo para abrir el modal */}
      {canInsert && (
        <CButton 
          style={{ backgroundColor: '#4B6251', color: 'white' }} 
          className="mb-3 mb-md-0 me-md-3" // Margen inferior en pantallas pequeñas, margen derecho en pantallas grandes
          onClick={() => { 
            setModalVisible(true); 
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
    {/* Barra de búsqueda */}
    <CCol xs="12" md="8" className="d-flex flex-wrap align-items-center">
      <CInputGroup className="me-3" style={{ width: '400px' }}>
        <CInputGroupText>
          <CIcon icon={cilSearch} />
        </CInputGroupText>
        <CFormInput
          placeholder="Buscar Tipo de Documento..."
          onChange={handleSearch}
          value={searchTerm}
        />
        <CButton
          style={{
            border: '1px solid #ccc',
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

  {/* Tabla para mostrar tipos de documento */}
  <div className="table-container" style={{ maxHeight: '400px', overflowY: 'scroll', marginBottom: '20px' }}>
    <CTable striped bordered hover>
      <CTableHead>
        <CTableRow>
          <CTableHeaderCell style={{ width: '50px' }}>#</CTableHeaderCell>
          <CTableHeaderCell style={{ width: '150px' }}>Tipo de Documento</CTableHeaderCell>
          <CTableHeaderCell style={{ width: '200px' }}>Descripción</CTableHeaderCell>
          <CTableHeaderCell style={{ width: '50px' }}>Estado</CTableHeaderCell>
          <CTableHeaderCell style={{ width: '50px' }}>Acciones</CTableHeaderCell>
        </CTableRow>
      </CTableHead>
      <CTableBody>
        {currentRecords.map((tipoDocumento) => (
          <CTableRow key={tipoDocumento.Cod_tipo_documento}>
            <CTableDataCell>
              {/* Mostrar el índice original en lugar del índice basado en la paginación */}
              {tipoDocumento.originalIndex} 
            </CTableDataCell>
            <CTableDataCell>{tipoDocumento.tipo_documento}</CTableDataCell>
            <CTableDataCell>{tipoDocumento.descripcion}</CTableDataCell>
            <CTableDataCell>{tipoDocumento.estado_documento === 1 ? 'Activo' : 'Inactivo'}</CTableDataCell>
            <CTableDataCell>
              {canUpdate && (
                <CButton style={{ backgroundColor: '#F9B64E', marginRight: '10px' }} onClick={() => openUpdateModal(tipoDocumento)}>
                  <CIcon icon={cilPen} />
                </CButton>
              )}

              {canDelete && (
                <CButton style={{ backgroundColor: '#E57368', marginRight: '10px' }} onClick={() => openDeleteModal(tipoDocumento)}>
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
        disabled={currentPage === Math.ceil(filteredTipoDocumentos.length / recordsPerPage)} // Desactiva si es la última página
        onClick={() => paginate(currentPage + 1)} // Páginas siguientes
      >
        Siguiente
      </CButton>
    </CPagination>
    <span style={{ marginLeft: '10px' }}>
      Página {currentPage} de {Math.ceil(filteredTipoDocumentos.length / recordsPerPage)}
    </span>
  </div>
</CContainer>
  );
};

export default ListaTipoDocumentos;