import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { CIcon } from '@coreui/icons-react';
import { cilSearch, cilBrushAlt, cilPen, cilTrash, cilPlus, cilSave,cilDescription } from '@coreui/icons'; // Importar
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


const ListaParciales = () => {
  const [Parciales, setParciales] = useState([]);
  const [modalVisible, setModalVisible] = useState(false); // Estado para el modal de crear ciclo
  const [modalUpdateVisible, setModalUpdateVisible] = useState(false); // Estado para el modal de actualizar ciclo
  const [modalDeleteVisible, setModalDeleteVisible] = useState(false); // Estado para el modal de eliminar ciclo
  const [nuevoParcial, setNuevoParcial] = useState({
    Nombre_parcial: '',
    Nota_recuperacion: ''
  }); // Estado para el nuevo ciclo
  const [parcialToUpdate, setParcialesToUpdate] = useState({}); // Estado para el ciclo a actualizar
  const [parcialToDelete, setParcialToDelete] = useState({}); // Estado para el ciclo a eliminar
  const [searchTerm, setSearchTerm] = useState('');
  const inputRef = useRef(null); // Referencia para el input
  
  const [currentPage, setCurrentPage] = useState(1); // Estado para la página actual
  const [recordsPerPage, setRecordsPerPage] = useState(5); // Hacer dinámico el número de registros por página
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false); // Estado para detectar cambios sin guardar
  const resetParcial = () => setNuevoParcial({ Nombre_parcial: '', Nota_recuperacion: '' });
  const resetParcialtoUpdate = () => setParcialesToUpdate({ Nombre_parcial: '', Nota_recuperacion: '' });
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

  // Validaciones respectivas
 const validateParcial = () => {
  const nombreparcial = typeof nuevoParcial === 'string' ? nuevoParcial : nuevoParcial.Nombre_parcial;

  // Comprobación de vacío
    if (!nombreparcial|| nombreparcial.trim() === '') {
    Swal.fire('Error', 'El campo "Nombre del Parcial" no puede estar vacío', 'error');
    return false;
  }

  // Verificar si el nombre del parcial ya existe en otro registro
  const parcialExistente = Parciales.some(
    (parcial) => parcial.Nombre_parcial.toLowerCase() === nombreparcial.toLowerCase()
  );

  if (parcialExistente) {
    Swal.fire('Error', `El parcial "${nombreparcial}" ya existe`, 'error');
    return false;
  }

  // Validación de Nota_recuperacion solo si tiene un valor
if (nuevoParcial.Nota_recuperacion !== undefined && nuevoParcial.Nota_recuperacion !== '' && isNaN(nuevoParcial.Nota_recuperacion)) {
  Swal.fire('Error', 'La nota de recuperación debe ser un número', 'error');
  return false;
}


  return true;
};

const validarParcialesUpdate = () => {
  // Verificar si el nombre del parcial está presente
  if (!parcialToUpdate.Nombre_parcial) {
    Swal.fire('Error', 'El campo "Nombre del Parcial" no puede estar vacío', 'error');
    return false;
  }

  // Verificar si existe otro parcial con el mismo nombre, excluyendo el actual
  const parcialExistente = Parciales.some(
    (parcial) =>
      parcial.Nombre_parcial.toLowerCase() === parcialToUpdate.Nombre_parcial.toLowerCase() &&
      parcial.Cod_parcial !== parcialToUpdate.Cod_parcial
  );

  if (parcialExistente) {
    Swal.fire('Error', `El parcial "${parcialToUpdate.Nombre_parcial}" ya existe`, 'error');
    return false;
  }

  // Validar Nota_recuperacion solo si tiene un valor
  if (parcialToUpdate.Nota_recuperacion !== undefined && parcialToUpdate.Nota_recuperacion !== '' && isNaN(parcialToUpdate.Nota_recuperacion)) {
    Swal.fire('Error', 'La nota de recuperación debe ser un número', 'error');
    return false;
  }
  

  // Permitir la actualización sin importar si hay cambios o no
  return true;
};



// Función para manejar cambios en el input
const handleInputChange = (e, setFunction) => {
  const input = e.target;
  const cursorPosition = input.selectionStart; // Guarda la posición actual del cursor
  let value = input.value
    .toUpperCase() // Convertir a mayúsculas
    .trimStart(); // Evitar espacios al inicio

  const regex =/^[A-Z-Ñ\s]*$/; // Solo letras y espacios

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
        resetParcial();
        setHasUnsavedChanges(false); // Reiniciar el estado de cambios no guardados
        Swal.fire('¡Éxito!', 'El parcial se ha creado correctamente', 'success');
      } else {
        Swal.fire('Error', 'Hubo un problema al crear el parcial', 'error');
      }
    } catch (error) {
      Swal.fire('Error', 'Hubo un problema al crear el parcial', 'error');
    }
  };  


  const handleUpdateParcial = async () => {
    if (!validarParcialesUpdate()) return;
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
        resetParcialtoUpdate(); // Resetear el ciclo a actualizar
        setHasUnsavedChanges(false);
        Swal.fire('¡Éxito!', 'El parcial se ha actualizado correctamente', 'success');
      } else {
        Swal.fire('Error', 'Hubo un problema al actualizar el parcial', 'error');
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
        Swal.fire('¡Éxito!', 'El parcial se ha eliminado correctamente', 'success');
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
    setHasUnsavedChanges(false); // Resetear el estado al abrir el modal
  };

  const openDeleteModal = (parcial) => {
    setParcialToDelete(parcial); // Guardar el ciclo que se desea eliminar
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
    {/* Contenedor del h1 y botón "Nuevo" */}
    <CRow className="align-items-center mb-5">
      <CCol xs="8" md="9">
        {/* Título de la página */}
        <h1 className="mb-0">Mantenimiento Parciales</h1>
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


    {/* Tabla para mostrar parciales */}
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
    <CModal visible={modalVisible} backdrop="static">
      <CModalHeader closeButton={false}>
        <CModalTitle>Nuevo Parcial</CModalTitle>
        <CButton className="btn-close" aria-label="Close" onClick={() => handleCloseModal(setModalVisible, resetParcial)} />
        </CModalHeader>
        <CModalBody>
        <CForm>
          <CInputGroup className="mb-3">
            <CInputGroupText>Nombre del Parcial</CInputGroupText>
            <CFormInput
              ref={inputRef}
              type="text"
              value={nuevoParcial.Nombre_parcial}
              maxLength={20}
              placeholder="Ingrese el nombre del parcial"
              onPaste={disableCopyPaste}
              onCopy={disableCopyPaste}
              onChange={(e) => handleInputChange(e, (value) => setNuevoParcial({
                ...nuevoParcial,
                Nombre_parcial: value,
              }))}
            />
          </CInputGroup>
          <CInputGroup className="mb-3">
            <CInputGroupText>Nota Recuperacion</CInputGroupText>
            <CFormInput
              type="number"
              min={0} // No permitir negativos
              max={100} // Limitar el valor máximo a 100
              maxLength={11}
              placeholder="Ingrese la nueva nota"
              value={nuevoParcial.Nota_recuperacion}
              onChange={(e) => {
                const value = e.target.value; // Capturamos el valor como cadena
            
                // Si el campo está vacío, permitimos que se borre
                if (value === '') {
                  setNuevoParcial({ ...nuevoParcial, Nota_recuperacion: '' });
                  return;
                }
            
                const parsedValue = parseInt(value, 10);
            
                // Permitir valores entre 1 y 100
                if (!isNaN(parsedValue) && parsedValue >= 1 && parsedValue <= 100) {
                  setNuevoParcial({ ...nuevoParcial, Nota_recuperacion: parsedValue });
                } else if (parsedValue < 1) {
                  // Mostrar alerta si el valor es negativo
                  Swal.fire({
                    icon: 'warning',
                    title: 'Valor no permitido',
                    text: 'No se pueden ingresar valores negativos.',
                    confirmButtonText: 'Entendido'
                  }).then(() => {
                    setNuevoParcial({ ...nuevoParcial, Nota_recuperacion: '' }); // Dejar el campo en blanco después de la alerta
                  });
                }
              }}
            />
          </CInputGroup>
        </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => handleCloseModal(setModalVisible, resetParcial)}>
            Cancelar
          </CButton>
          <CButton style={{ backgroundColor: '#4B6251',color: 'white' }} onClick={handleCreateParcial}>
          <CIcon icon={cilSave} style={{ marginRight: '5px' }} /> Guardar
          </CButton>
        </CModalFooter>
      </CModal>

    {/* Modal Actualizar Parcial */}
    <CModal visible={modalUpdateVisible} backdrop="static">
      <CModalHeader closeButton={false}>
      <CModalTitle>Actualizar Parcial</CModalTitle>
      <CButton className="btn-close" aria-label="Close" onClick={() => handleCloseModal(setModalUpdateVisible, resetParcialtoUpdate)} />
      </CModalHeader >
      <CModalBody>
        <CForm>
          <CInputGroup className="mb-3">
            <CInputGroupText>Nombre del Parcial</CInputGroupText>
            <CFormInput
              ref={inputRef} // Asignar la referencia al input
              maxLength={20}
              type="text"
              onPaste={disableCopyPaste}
              onCopy={disableCopyPaste}
              placeholder="Ingrese el nuevo nombre del parcial"
              value={parcialToUpdate.Nombre_parcial}
              onChange={(e) => handleInputChange(e, (value) => setParcialesToUpdate({
                ...parcialToUpdate,
                Nombre_parcial: value,
              }))}
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
                const value = e.target.value; // Capturamos el valor como cadena
    
                // Permitir que se borre el campo
                if (value === '') {
                  setParcialesToUpdate({ ...parcialToUpdate, Nota_recuperacion: '' });
                  return;
                }
    
                const parsedValue = parseInt(value, 10);
    
                // Permitir valores entre 0 y 100
                if (!isNaN(parsedValue) && parsedValue >= 0 && parsedValue <= 100) {
                  setParcialesToUpdate({ ...parcialToUpdate, Nota_recuperacion: parsedValue });
                } else if (parsedValue < 0) {
                  // Si se intenta ingresar un valor negativo, puedes manejarlo aquí
                  setParcialesToUpdate({ ...parcialToUpdate, Nota_recuperacion: 0 }); // Establecerlo a 0 si es negativo
                }
              }}
            />
          </CInputGroup>
        </CForm>
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={() => handleCloseModal(setModalUpdateVisible, resetParcialtoUpdate)}>
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