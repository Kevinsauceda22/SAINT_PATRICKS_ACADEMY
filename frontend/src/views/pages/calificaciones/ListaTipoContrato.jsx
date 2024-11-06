import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { CIcon } from '@coreui/icons-react';
import { cilSearch, cilBrushAlt, cilPen, cilTrash, cilPlus, cilSave,cilDescription } from '@coreui/icons'; // Importar iconos específicos
import swal from 'sweetalert2';
import { left } from '@popperjs/core';
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

const ListaTipoContratos = () => {
  const [tiposContratos, setTiposContratos] = useState([]);
  const [modalVisible, setModalVisible] = useState(false); // Estado para el modal de crear 
  const [modalUpdateVisible, setModalUpdateVisible] = useState(false); // estado para el modal de actualizar
  const [modalDeleteVisible, setModalDeleteVisible] = useState(false); // estado para el modo eliminar
  const [nuevoContrato, setNuevoContrato] = useState({ Descripcion: '' }); 
  const [contratoToUpdate, setContratoToUpdate] = useState({});
  const [contratoToDelete, setContratoToDelete] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1); // Estado para la página actual
  const [recordsPerPage, setRecordsPerPage] = useState(5); // Hacer dinamico el número de registro de paginas
  const inputRef = useRef(null); // referencia para el input
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false); // Estado para detectar cambios sin guardar


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

   // Función para manejar cambios en el input
   const handleInputChange = (e, setFunction) => {
    const input = e.target;
    const cursorPosition = input.selectionStart; // Guarda la posición actual del cursor
    let value = input.value
      .toUpperCase() // Convertir a mayúsculas
      .trimStart(); // Evitar espacios al inicio

    const regex =/^[A-Z-Ñ\s]*$/; // Solo letras, espacios y la Ñ

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
const disableCopyPaste =(e) => {
  e.preventDefault();
  swal.fire({
    icon: 'warning',
    title: 'Accion bloquear',
    text:'Copiar y pegar no esta permitido'
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
          closeFunction(false);     // Cerrar el modal
          resetFields();            // Limpiar los campos
          setHasUnsavedChanges(false); // Resetear el indicador de cambios no guardados
        }
      });
    } else {
      closeFunction(false);         // Cerrar el modal directamente
      resetFields();                // Limpiar los campos
      setHasUnsavedChanges(false);  // Resetear el indicador de cambios no guardados
    }
  };
const resetNuevoContrato = () => setNuevoContrato({ Descripcion: '' });
const resetContratoToUpdate = () => setContratoToUpdate({ Descripcion: '' });


  const handleCreateTipoContrato = async () => {
    // Validar si el campo "Descripcion" está vacío
    if (!nuevoContrato.Descripcion || nuevoContrato.Descripcion.trim() === '') {
      swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'El campo "Tipo Contrato" no puede estar vacío',
      });
      return; // Detener la ejecución si el campo está vacío
    }
  
    // Verificar si ya existe una especialidad con la misma descripción
  const Duplicada = tiposContratos.some(
    (contrato) => contrato.Descripcion.toLowerCase() === nuevoContrato.Descripcion.toLowerCase()
  );

    // Verificar si el tipo de contrato ya existe
    if (Duplicada) {
      swal.fire({
        icon: 'error',
        title: 'Error',
        text: `El tipo de contrato "${nuevoContrato.Descripcion}" ya existe`,
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
        resetNuevoContrato();
        setHasUnsavedChanges(false)
        setNuevoContrato({ Descripcion: '' });
  
        swal.fire({
          icon: 'success',
          title: '¡Éxito!',
          text: 'El tipo de contrato se ha creado correctamente',
        });
      } else {
        console.error('Hubo un problema al crear el tipo de contrato:', response.statusText);
      }
    } catch (error) {
      console.error('Hubo un problema al crear el tipo de contrato:', error);
    }
  };
  
  const handleUpdateTipoContrato = async () => {
    // Validar si el campo "Descripcion" está vacío
    if (!contratoToUpdate.Descripcion || contratoToUpdate.Descripcion.trim() === '') {
      swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'El campo "Tipo Contrato" no puede estar vacío',
      });
      return; // Detener la ejecución si el campo está vacío
    }
  
    // Verificar si ya existe una especialidad con la misma descripción
  const Duplicada = tiposContratos.some(
    (contrato) => 
      contrato.Descripcion.toLowerCase() === contratoToUpdate.Descripcion.toLowerCase() &&
      contrato.Cod_tipo_contrato !== contratoToUpdate.Cod_tipo_contrato
  );

    // Verificar si el tipo de contrato ya existe
    if (Duplicada) {
      swal.fire({
        icon: 'error',
        title: 'Error',
        text: `El tipo de contrato "${contratoToUpdate.Descripcion}" ya existe`,
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
        resetContratoToUpdate();
        setHasUnsavedChanges(false); // reiciniar el estado de cambios no guardados 
        setContratoToUpdate({});
  
        swal.fire({
          icon: 'success',
          title: '¡Éxito!',
          text: 'El tipo de contrato se ha actualizado correctamente',
        });
      } else {
        console.error('Hubo un problema alactualizar el tipo de contrato:', response.statusText);
      }
    } catch (error) {
      console.error('Hubo un problema al actualizar el tipo de contrato:', error);
    }
  };
  
  const handleDeleteTipoContrato = async () => {
    if (!contratoToDelete.Cod_tipo_contrato) {
      swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo encontrar el contrato a eliminar.',
      });
      return;
    }

    try {
      const response = await fetch('http://localhost:4000/api/contratos/eliminartiposcontrato', {
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
        swal.fire({
          icon: 'success',
          title: '¡Éxito!',
          text: 'El tipo de contrato se ha eliminado correctamente',
        });
      } else {
        console.error('Hubo un problema al eliminar el tipo de contrato', response.statusText);
      }
    } catch (error) {
      console.error('Hubo un problema al eliminar el tipo de contrato', error);
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

// Validar el buscador
 const handleSearchInputChange = (e) => {
  const value = e.target.value
  .toUpperCase() // Convertir a mayúsculas
  .trimStart() // Evitar espacios al inicio
  .replace(/[^a-zA-Z0-9\s]/g, ' '); // Elimina cualquier símbolo, permitiendo solo letras, números y espacios
  setSearchTerm(value); // Actualiza el estado searchTerm con el valor validado
};

 // Cambiar página
const paginate = (pageNumber) => {
  if (pageNumber > 0 && pageNumber <= Math.ceil(filteredTiposContratos.length / recordsPerPage)) {
    setCurrentPage(pageNumber);
  }
}

  // Verificar permisos
  if (!canSelect) {
    return <AccessDenied />;
  }

  return (
    <CContainer>
      {/*Contenedor del hi y boton "nuevo" */}
<CRow className='align-items-center mb-5'>
<CCol xs="8" md="9"> 
  {/* Titulo de la pagina */}
      <h1 className="mb-0">Mantenimiento Tipos de Contrato</h1>
      </CCol>

      <CCol xs="4" md="3" className="text-end d-flex flex-column flex-md-row justify-content-md-end align-items-md-center">
      {/* Botón "Nuevo" alineado a la derecha */}
      <CButton
        style={{ backgroundColor: '#4B6251', color: 'white' }} // Ajusta la altura para alinearlo con la barra de búsqueda
        className="mb-3 mb-md-0 me-md-3" // Margen inferior en pantallas pequeñas, margen derecho en pantallas grandes
        onClick={() => {setModalVisible(true);
          setHasUnsavedChanges(false); // Resetear el estado al abrir el modal
        }}
        
      >
        
        <CIcon icon={cilPlus} /> {/* Ícono de "más" */}
        Nuevo
      </CButton>

{/*Boton reporte */}
<CButton
style={{backgroundColor:'#6C8E58', color: 'white'}}
>
  <CIcon icon={cilDescription} /> Reporte
</CButton>
     </CCol>
      </CRow>


       {/* Contenedor de la barra de búsqueda y el botón "Nuevo" */}
      <CRow className='align-items-center mt-4 mb-2'>
      {/* Barra de búsqueda */}
      <CCol xs="12" md="8" className='d-flex flex-wrap align-items-center'>
        <CInputGroup className="me-3" style={{width: '400px' }}>
        <CInputGroupText>
           <CIcon icon={cilSearch} /> 
        </CInputGroupText>
        <CFormInput placeholder="Buscar tipo contrato..."
         onChange={handleSearchInputChange} 
         value={searchTerm} />
        
        {/* Botón para limpiar la búsqueda */}
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
     

    {/*Selector dinamico a la par de la barra de busqueda */}
    <CCol xs="12" md="4" className='text-md-end mt-2 mt-md-0'>
      <CInputGroup className='mt-2 mt-md-0' style={{width:'auto', display:'inline-block'}}>
        <div className='d-inline-flex align-items-center'>
          <span>Mostrar&nbsp;</span>
          <CFormSelect
            style={{width: '80px', display: 'inline-block', textAlign:'center'}}
            onChange={(e) => {
              const value = Number(e.target.value);
              setRecordsPerPage(value);
              setCurrentPage(1); // reinciar a la primera pagina cuando se cambia el numero de registros
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



{/* Tabla para mostrar tipo contrato */}
    
    <div className="table-container" style={{ maxHeight: '400px', overflowY: 'scroll', marginBottom: '20px' }}>
      <CTable striped bordered hover>
        <CTableHead style={{position: 'sticky', top: 0, zIndex: 1, backgroundColor: '#fff'}}>
          <CTableRow>
            <CTableHeaderCell style={{width: '50px'}} >#</CTableHeaderCell>
            <CTableHeaderCell style={{width: '300px'}}>Tipo contrato</CTableHeaderCell>
            <CTableHeaderCell style={{width: '150px'}}>Acciones</CTableHeaderCell>
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
                <CButton style={{ backgroundColor: '#F9B64E',marginRight: '10px' }} onClick={() => { setContratoToUpdate(tiposContratos); setModalUpdateVisible(true);setHasUnsavedChanges(false);}}>
                  <CIcon icon={cilPen} />
                </CButton>
                <CButton style={{ backgroundColor: '#E57368', marginRight: '10px' }}   onClick={() => { setContratoToDelete(tiposContratos);setModalDeleteVisible(true); }}>
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
      <CModal visible={modalVisible} backdrop="static">
      <CModalHeader closeButton={false}>
          <CModalTitle>Nuevo Tipo de Contrato</CModalTitle>
          <CButton className="btn-close" aria-label="Close" onClick={() => handleCloseModal(setModalVisible, resetNuevoContrato)} /> 
        </CModalHeader>
        <CModalBody>
        <CForm>
          <CInputGroup className="mb-3">
            <CInputGroupText>Tipo Contrato</CInputGroupText>
            <CFormInput
              ref={inputRef} // Asignar la referencia al input
              type="text"
              placeholder="Ingrese el tipo de contrato"
              value={nuevoContrato.Descripcion}
              maxLength={50} // Limitar a 50 caracteres
              onPaste={disableCopyPaste}
              onCopy={disableCopyPaste}
              onChange={(e) => handleInputChange(e, (value) => setNuevoContrato({ ...nuevoContrato, Descripcion: value }))} 
            />
          </CInputGroup>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => handleCloseModal(setModalVisible, resetNuevoContrato)}>
            Cancelar
          </CButton>
          <CButton style={{ backgroundColor: '#4B6251',color: 'white' }} onClick={handleCreateTipoContrato}>
          <CIcon icon={cilSave} style={{ marginRight: '5px' }} />Guardar
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Modal Actualizar */}
      <CModal visible={modalUpdateVisible} backdrop="static">
      <CModalHeader closeButton={false}>
          <CModalTitle>Actualizar Tipo de Contrato</CModalTitle>
          <CButton className="btn-close" aria-label="Close" onClick={() => handleCloseModal(setModalUpdateVisible, resetNuevoContrato)} />
        </CModalHeader>
        <CModalBody>
        <CForm>
          <CInputGroup className="mb-3">
            <CInputGroupText>Tipo contrato</CInputGroupText>
            <CFormInput
            ref={inputRef} // Asignar la referencia al input
              value={contratoToUpdate.Descripcion || ''}
              maxLength={50} // Limitar a 50 caracteres
              onPaste={disableCopyPaste}
              onCopy={disableCopyPaste}
              onChange={(e) => handleInputChange(e, (value) => setContratoToUpdate({ ...contratoToUpdate, Descripcion: value }))}
            />
          </CInputGroup>
          </CForm>
        </CModalBody>
        <CModalFooter>
        <CButton color="secondary" onClick={() => handleCloseModal(setModalUpdateVisible, resetContratoToUpdate)}>
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
