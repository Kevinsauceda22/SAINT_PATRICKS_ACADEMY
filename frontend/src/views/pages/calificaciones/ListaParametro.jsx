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
import usePermission from '../../../../context/usePermission';
import AccessDenied from "../AccessDenied/AccessDenied"

const ListaParametro = () => {
  const { canSelect, loading, error, canDelete, canInsert, canUpdate } = usePermission('ListaParametro');
  const [parametros, setParametros] = useState([]);
  const [modalVisible, setModalVisible] = useState(false); // Estado para el modal de crear un parámetro
  const [modalUpdateVisible, setModalUpdateVisible] = useState(false); // Estado para el modal de actualizar un parámetro
  const [nuevoParametro, setNuevoParametro] = useState(''); // Estado para el nuevo parámetro
  const [valorParametro, setValorParametro] = useState(''); // Agregar este estado
  const [parametroToUpdate, setParametroToUpdate] = useState({}); // Estado para el parámetro a actualizar
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1); // Estado para la página actual
  const [recordsPerPage, setRecordsPerPage] = useState(5); // Hacer dinámico el número de registros por página

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false); // Estado para detectar cambios sin guardar
  const inputRefNuevoParametro = useRef(null);
  const inputRefValorParametro = useRef(null);
  const inputRefUpdateParametro = useRef(null);
  const inputRefUpdateValor = useRef(null);
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      year: 'numeric', 
      month: 'numeric', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
    });
  };

  useEffect(() => {
    fetchParametros();
  }, []);

  const fetchParametros = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/parametro/parametro');
      if (!response.ok) {
        throw new Error('No se pudieron obtener los parámetros');
      }
      const data = await response.json();

      // Aplicar formato a las fechas de los parámetros
      const formattedData = data.map(param => ({
        ...param,
        Fecha_Creacion: formatDate(param.Fecha_Creacion),
        Fecha_Modificacion: formatDate(param.Fecha_Modificacion),
      }));

      setParametros(formattedData);
    } catch (error) {
      console.error('Error:', error);
    }
  };
  

    // Función para manejar cambios en el input
    const handleInputChange = (e, setFunction, inputRef) => {
      const input = e.target;
      const cursorPosition = input.selectionStart; // Guardamos la posición del cursor
      
      // Convertir el valor a mayúsculas y quitar espacios iniciales
      let value = input.value.toUpperCase().trimStart(); 
    
      const regex = /^[A-ZÁÉÍÓÚÑ0-9_\s]*$/;
      // Validación para caracteres permitidos (letras, números, espacios, etc.)
      if (!regex.test(value)) {
        swal.fire({
          icon: 'warning',
          title: 'Caracteres no permitidos',
          text: 'Solo se permiten letras, números y espacios.',
        });
        return;
      }
    
      // Verificar múltiples espacios consecutivos
      if (/\s{2,}/.test(value)) {
        swal.fire({
          icon: 'warning',
          title: 'Espacios múltiples',
          text: 'No se permite más de un espacio entre palabras.',
        });
        value = value.replace(/\s+/g, ' '); // Reemplazar espacios consecutivos por uno solo
      }
    
      // Asignamos el valor limpio al input
      input.value = value;
      
      // Actualizamos el estado
      setFunction(value);
      setHasUnsavedChanges(true); // Marcamos que hay cambios
    
      // Restaurar la posición del cursor
      requestAnimationFrame(() => {
        if (inputRef.current) {
          inputRef.current.setSelectionRange(cursorPosition, cursorPosition); // Mantener el cursor en la misma posición
        }
      });
    };
    
    const handleInputFocus = (e, inputRef) => {
      const input = e.target;
      const cursorPosition = input.selectionStart;
      // Guardar la posición del cursor solo cuando el input recibe foco
      if (inputRef.current) {
        inputRef.current.setSelectionRange(cursorPosition, cursorPosition);
      }
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

    const resetCreateModalFields = () => {
      setNuevoParametro('');
      setValorParametro('');
      setHasUnsavedChanges(false);
    };
    

    const handleCreateParametro = async () => {
      // Validaciones para campos vacíos
      if (!nuevoParametro.trim() || !valorParametro.trim()) {
        swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Los campos "Parámetro" y "Valor" no pueden estar vacíos',
        });
        return;
      }
  
      try {
        // Verifica si ya existe el parámetro con el mismo nombre (opcional)
        const existe = parametros.some((param) => param.Parametro.trim().toLowerCase() === nuevoParametro.trim().toLowerCase());
        if (existe) {
          swal.fire({
            icon: 'error',
            title: 'Error',
            text: `El parámetro "${nuevoParametro}" ya existe.`,
          });
          return;
        }
  
        // Obtener la fecha actual para la creación y actualización
        const fechaCreacion = new Date().toISOString();
        const fechaModificacion = new Date().toISOString();
  
        const token = localStorage.getItem('token'); // o el lugar donde guardas el token

        const response = await fetch('http://localhost:4000/api/parametro/crearparametro', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`, // Aquí se agrega el token
          },
          body: JSON.stringify({
            Parametro: nuevoParametro,
            Valor: valorParametro,
            Fecha_Creacion: fechaCreacion,
            Fecha_Modificacion: fechaModificacion,
          }),
        });

        const result = await response.json();
  
        if (response.ok) {
          fetchParametros(); // Actualiza la lista de parámetros
          setModalVisible(false); // Cierra el modal
          setNuevoParametro(''); // Limpiar el campo de nuevo parámetro
          setValorParametro(''); // Limpiar el campo de valor
          setHasUnsavedChanges(false); // Reiniciar el estado de cambios no guardados
          swal.fire({
            icon: 'success',
            title: '¡Éxito!',
            text: 'El parámetro se ha creado correctamente.',
          });
        } else {
          swal.fire({
            icon: 'error',
            title: 'Error de validación',
            text: result.Mensaje || 'Hubo un problema al crear el parámetro',
          });
        }
      } catch (error) {
        console.error('Error al crear el parámetro:', error);
        swal.fire({
          icon: 'error',
          title: 'Error en el servidor',
          text: 'Hubo un problema en el servidor. Inténtalo más tarde.',
        });
      }
    };

// Función para formatear la fecha en el formato 'YYYY-MM-DD HH:mm:ss'
const formatFechaMySQL = (fecha) => {
  const date = new Date(fecha);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

// Función para manejar la actualización del parámetro
const handleUpdateParametro = async () => {
  const { Cod_parametro, Parametro, Valor } = parametroToUpdate;

  if (!Parametro || !Valor) {
    swal.fire({ icon: 'error', title: 'Error', text: 'Todos los campos son obligatorios' });
    return;
  }

  try {
    const fechaModificacion = formatFechaMySQL(new Date()); // Formatear la fecha

    const response = await fetch('http://localhost:4000/api/parametro/actualizarparametro', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ Cod_parametro, Parametro, Valor, Fecha_Modificacion: fechaModificacion }),
    });

    if (response.ok) {
      fetchParametros();
      setModalUpdateVisible(false);
      setParametroToUpdate({});
      swal.fire({ icon: 'success', title: '¡Éxito!', text: 'Parámetro actualizado correctamente.' });
    } else {
      swal.fire({ icon: 'error', title: 'Error', text: 'Hubo un problema al actualizar el parámetro' });
    }
  } catch (error) {
    swal.fire({ icon: 'error', title: 'Error', text: 'Intenta nuevamente más tarde.' });
  }
};


const openUpdateModal = (parametro) => {
  setParametroToUpdate(parametro);
  setModalUpdateVisible(true);
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
  const filteredParametro = parametros.filter((parametro) =>
    parametro.Parametro.toLowerCase().includes(searchTerm.toLowerCase())
  );

 // Lógica de paginación
 const indexOfLastRecord = currentPage * recordsPerPage;
 const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
 const currentRecords = filteredParametro.slice(indexOfFirstRecord, indexOfLastRecord);

 // Cambiar página
const paginate = (pageNumber) => {
  if (pageNumber > 0 && pageNumber <= Math.ceil(filteredParametro.length / recordsPerPage)) {
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
        <h1 className="mb-0">Parámetros</h1>
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
            placeholder="Buscar parametro..."
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
            <CTableHeaderCell style={{ width: '300px' }}>USUARIO</CTableHeaderCell>
            <CTableHeaderCell style={{ width: '300px' }}>PARÁMETRO</CTableHeaderCell>
            <CTableHeaderCell style={{ width: '300px' }}>VALOR</CTableHeaderCell>
            <CTableHeaderCell style={{ width: '300px' }}>FECHA_CREACIÓN</CTableHeaderCell>
            <CTableHeaderCell style={{ width: '300px' }}>FECHA_MODIFICACIÓN</CTableHeaderCell>
            <CTableHeaderCell style={{ width: '150px' }}>ACCIONES</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {currentRecords.map((parametro, index) => (
            <CTableRow key={parametro.Cod_parametro}>
              <CTableDataCell>{index + 1}</CTableDataCell>
              <CTableDataCell>{parametro.Cod_usuario}</CTableDataCell>
              <CTableDataCell>{parametro.Parametro}</CTableDataCell>
              <CTableDataCell>{parametro.Valor}</CTableDataCell>
              <CTableDataCell>{parametro.Fecha_Creacion}</CTableDataCell>
              <CTableDataCell>{parametro.Fecha_Modificacion}</CTableDataCell>
              <CTableDataCell>

              {canUpdate && (
                <CButton style={{ backgroundColor: '#F9B64E', marginRight: '10px' }} onClick={() => openUpdateModal(parametro)}>
                  <CIcon icon={cilPen} />
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
          disabled={currentPage === Math.ceil(filteredParametro.length / recordsPerPage)} // Desactiva si es la última página
          onClick={() => paginate(currentPage + 1)} // Páginas siguientes
        >
          Siguiente
        </CButton>
      </CPagination>
      <span style={{ marginLeft: '10px' }}>
        Página {currentPage} de {Math.ceil(filteredParametro.length / recordsPerPage)}
      </span>
    </div>

    {/* Modal Crear Parámetro */}
    <CModal visible={modalVisible} backdrop="static">
      <CModalHeader closeButton={false}>
        <CModalTitle>Nuevo Parámetro</CModalTitle>
        <CButton className="btn-close" aria-label="Close" onClick={() => handleCloseModal(setModalVisible, resetCreateModalFields)} />
      </CModalHeader>
      <CModalBody>
        <CForm>
          <CInputGroup className="mb-3">
            <CInputGroupText>Parámetro</CInputGroupText>
            <CFormInput
              ref={inputRefNuevoParametro}
               type="text"
               placeholder="Ingrese el parámetro"
               value={nuevoParametro}
               onChange={(e) => handleInputChange(e, setNuevoParametro,inputRefNuevoParametro)}
               onPaste={disableCopyPaste}
               onCopy={disableCopyPaste} // Usamos la función handleInputChange para manejar cambios
               onFocus={(e) => handleInputFocus(e, inputRefNuevoParametro)}
            />
          </CInputGroup>

          {/* Campo para el valor del parámetro */}
          <CInputGroup className="mb-3">
            <CInputGroupText>Valor</CInputGroupText>
            <CFormInput
            ref={inputRefUpdateValor}
             type="text"
             placeholder="Ingrese el valor"
             value={valorParametro}
             onChange={(e) => handleInputChange(e, setValorParametro,inputRefUpdateValor)}
             onPaste={disableCopyPaste}
             onCopy={disableCopyPaste} // Usamos la misma lógica para el valor
             onFocus={(e) => handleInputFocus(e, inputRefUpdateValor)}
            />
          </CInputGroup>
        </CForm>
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={() => handleCloseModal(setModalVisible, resetCreateModalFields)}>
          Cancelar
        </CButton>
        <CButton
          style={{ backgroundColor: '#4B6251', color: 'white' }}
          onClick={handleCreateParametro} // Llamamos a la función para crear el parámetro
        >
          <CIcon icon={cilSave} style={{ marginRight: '5px' }} /> Guardar
        </CButton>
      </CModalFooter>
    </CModal>

  {/* Modal de Actualización */}
  <CModal visible={modalUpdateVisible} onClose={() => setModalUpdateVisible(false)} backdrop="static">
        <CModalHeader closeButton>
          <CModalTitle>Actualizar Parámetro</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
          <CInputGroup className="mb-3">
          <CInputGroupText>Parámetro</CInputGroupText>
              <CFormInput
                type="text"
                name="parametro"
                value={parametroToUpdate.Parametro || ''}
                readOnly
                disabled
              />
              
              </CInputGroup>
              <CInputGroup className="mb-3">
              <CInputGroupText>Valor</CInputGroupText>
              <CFormInput
                ref={inputRefUpdateValor}  // Mantiene la referencia para gestionar la posición del cursor
                type="text"
                placeholder="Valor"
                value={parametroToUpdate.Valor || ''}  // Asegura que el campo no sea undefined o null
                onChange={(e) => handleInputChange(e, (value) => setParametroToUpdate({ ...parametroToUpdate, Valor: value }), inputRefUpdateValor)}  // Llamada a handleInputChange
                onPaste={disableCopyPaste}  // Desactiva el copiar y pegar
                onCopy={disableCopyPaste}  // Desactiva la acción de copiar
                onFocus={(e) => handleInputFocus(e, inputRefUpdateValor)}  // Llama a la función de foco
              />
               </CInputGroup>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setModalUpdateVisible(false)}>Cancelar</CButton>
          <CButton style={{  backgroundColor: '#F9B64E',color: 'white' }} onClick={handleUpdateParametro}>
           <CIcon icon={cilPen} style={{ marginRight: '5px' }} />Actualizar
          </CButton>
        </CModalFooter>
      </CModal>

   

 </CContainer>
  );
};


export default ListaParametro;