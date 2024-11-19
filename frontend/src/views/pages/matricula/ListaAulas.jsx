import React, { useState, useEffect } from 'react';
import CIcon from '@coreui/icons-react';
import {  cilSearch, cilBrushAlt, cilPen, cilTrash, cilPlus, cilDescription} from '@coreui/icons';
import swal from 'sweetalert2';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import {
  CButton,
  CCol,
  CContainer,
  CDropdown,
  CDropdownMenu,
  CDropdownToggle,
  CDropdownItem,
  CForm,
  CFormInput,
  CFormSelect,
  CInputGroup,
  CInputGroupText, CPagination,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CRow,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
} from '@coreui/react';

const ListaAulas = () => {
  const [aulas, setAulas] = useState([]);
  const [edificios, setEdificios] = useState([]);
  const [nuevaAula, setNuevaAula] = useState({
    Numero_aula: '',
    Capacidad: '',
    Cupos_aula: '',
    Cod_edificio: '',
    Division: '',
    Secciones_disponibles: '',
    Secciones_ocupadas: ''
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [errors, setErrors] = useState({ Numero_aula: '', Capacidad: '', Cupos_aula: '', Cod_edificio:'', Division: '', Secciones_disponibles: '', Secciones_ocupadas: ''});
  const [modalUpdateVisible, setModalUpdateVisible] = useState(false);
  const [modalDeleteVisible, setModalDeleteVisible] = useState(false);
  const [aulaToUpdate, setAulaToUpdate] = useState({});
  const [aulaToDelete, setAulaToDelete] = useState({});
  const [mensajeError, setMensajeError] = useState(''); // Estado para el mensaje de error
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false); // Estado para detectar cambios sin guardar
  const resetNuevaAula = () => setNuevaAula('');
  useEffect(() => {
    fetchAulas();

    const fetchEdificios = async () => {
      try {
          const response = await fetch('http://localhost:4000/api/aula/edificio');
          const data = await response.json();
          console.log("Datos de edificios cargados:", data); // Revisa el contenido de `data`
          setEdificios(data);
      } catch (error) {
          console.error("Error al obtener edificios:", error);
      }
  };



    fetchEdificios();
  }, []);

  const fetchAulas = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/aula/aulas');
      const data = await response.json();
      setAulas(data);
    } catch (error) {
      console.error('Error al obtener las aulas:', error);
    }
  };
  
    // Función para validar caracteres permitidos
    const permitirCaracteresValidos = (numeros) => {
      const regex = /^\d*$/;
      return regex.test(numeros);
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

  const handleCreateAula = async () => {

    const data = {
      p_Numero_aula: nuevaAula.Numero_aula,
      p_Capacidad: nuevaAula.Capacidad,
      p_Cupos_aula: nuevaAula.Cupos_aula,
      p_Division: nuevaAula.Division,
      p_Secciones_disponibles: nuevaAula.Secciones_disponibles,
      p_Secciones_ocupadas: nuevaAula.Secciones_ocupadas,
      p_Cod_edificio: nuevaAula.Cod_edificio, // Envía el código del edificio
    };


    // Nombres amigables de los campos para mostrar en los mensajes de error
    const nombresCampos = {
      p_Numero_aula: 'Número de Aula',p_Capacidad: 'Capacidad',p_Cupos_aula: 'Cupos Aula', p_Secciones_disponibles: 'Secciones Disponibles',p_Secciones_ocupadas: 'Secciones Ocupadas',p_Cod_edificio: 'Edificio',
    };
    // Validación para asegurar que no haya valores nulos, vacíos o solo espacios en blanco
    for (const [key, value] of Object.entries(data)) {
      if (value == null || value === '' || /^\s*$/.test(value)) {
        const nombreCampo = nombresCampos[key] || key;
        console.error(`El campo ${nombreCampo} no puede estar vacío.`);
        swal.fire({icon: 'warning', title: 'Error de validación',text: `El campo "${nombreCampo}" no puede estar vacío.`,
        });
        return;
      }
    }
    // Validación de cupos vs capacidad
  if (data.p_Cupos_aula > data.p_Capacidad) {
    swal.fire({icon: 'warning',title: 'Error de validación',text: 'El número de cupos del aula no puede ser mayor que la capacidad.',
    });
    return;
  }

  // Validación de secciones ocupadas vs secciones disponibles
  if (data.p_Secciones_ocupadas > data.p_Secciones_disponibles) {
    swal.fire({icon: 'warning',title: 'Error de validación',text: 'El número de secciones ocupadas no puede ser mayor que el número de secciones disponibles.',
    });
    return;
  }
  
    try {
      const response = await fetch('http://localhost:4000/api/aula/crear_aula', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      const errorData = await response.json(); // Captura el cuerpo de la respuesta
      if (response.ok) {
      fetchAulas(); // Actualizar lista de aulas
      setModalVisible(false); // Cerrar modal
      setNuevaAula('');
      resetNuevaAula(); // Reiniciar el formulario
    
      // Notificación de éxito
      swal.fire({icon: 'success',title: 'Creación exitosa',text: 'El aula ha sido creada correctamente.',
      });
      } else {
        swal.fire({icon: 'error',title: 'Error',text: `${errorData.mensaje || 'Error desconocido'}`,
        });
        console.error('Hubo un error al crear el aula', response.statusText, errorData);
      }   
    } catch (error) {
      console.error('Error al crear el aula:', error);
      swal.fire({icon: 'error',title: 'Error de conexión',text: 'Ocurrió un problema al conectarse con el servidor.',
      });
    }
  };
  const handleUpdateAula = async () => {
    let seccionesDisponiblesActualizadas = aulaToUpdate.Secciones_disponibles;
  
    // Validar que las secciones ocupadas no superen la capacidad de las secciones disponibles solo si el campo ha cambiado
    const seccionesPreviasOcupadas = aulaToUpdate.Secciones_ocupadas; // Valor anterior
    const nuevasSeccionesOcupadas = parseInt(aulaToUpdate.Secciones_ocupadas, 10);
  
    // Solo hacer la validación de secciones ocupadas si el usuario intenta cambiar este valor
    if (nuevasSeccionesOcupadas !== seccionesPreviasOcupadas) {
      seccionesDisponiblesActualizadas =
        aulaToUpdate.Secciones_disponibles - (nuevasSeccionesOcupadas - seccionesPreviasOcupadas);
  
      if (nuevasSeccionesOcupadas > aulaToUpdate.Secciones_disponibles) {
        swal.fire({
          icon: 'warning',
          title: 'Error de validación',
          text: 'El número de secciones ocupadas no puede exceder el total de secciones disponibles.',
        });
        return;
      }
  
      if (seccionesDisponiblesActualizadas < 0) {
        swal.fire({
          icon: 'warning',
          title: 'Error de validación',
          text: 'No se pueden actualizar secciones ocupadas si se exceden las secciones disponibles.',
        });
        return;
      }
  
      if (aulaToUpdate.Secciones_disponibles === 0 && nuevasSeccionesOcupadas > seccionesPreviasOcupadas) {
        swal.fire({
          icon: 'warning',
          title: 'Error de validación',
          text: 'No se puede aumentar las secciones ocupadas si no hay secciones disponibles.',
        });
        return;
      }
    } else {
      aulaToUpdate.Secciones_ocupadas = seccionesPreviasOcupadas;
    }
  
    // Preparamos el objeto para la actualización
    const updateData = {
      p_Cod_aula: aulaToUpdate.Cod_aula,
      p_Numero_aula: aulaToUpdate.Numero_aula,
      p_Capacidad: aulaToUpdate.Capacidad,
      p_Cupos_aula: aulaToUpdate.Cupos_aula,
      p_Cod_edificio: aulaToUpdate.Cod_edificio,
      p_Division: aulaToUpdate.Division,
      p_Secciones_disponibles: seccionesDisponiblesActualizadas,
    };
  
    // Solo incluye `Secciones_ocupadas` si ha cambiado y es válida
    if (nuevasSeccionesOcupadas !== seccionesPreviasOcupadas) {
      updateData.p_Secciones_ocupadas = nuevasSeccionesOcupadas;
    } else {
      updateData.p_Secciones_ocupadas = seccionesPreviasOcupadas;
    }
  
    try {
      const response = await fetch(`http://localhost:4000/api/aula/actualizar_aula/${aulaToUpdate.Cod_aula}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });
      console.log("Estado de la respuesta:", response.status);
      const errorData = await response.json();
      if (response.ok) {
        swal.fire({
          icon: 'success',
          title: 'Actualización exitosa',
          text: 'El aula ha sido actualizada correctamente.',
        });
        fetchAulas();
        setModalUpdateVisible(false);
        setAulaToUpdate({});
      } else {
        swal.fire({
          icon: 'error',
          title: 'Error',
          text: errorData?.mensaje || 'No se pudo actualizar el aula.',
        });
      }
    } catch (error) {
      console.error('Error al actualizar el aula:', error);
      swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Ocurrió un error al intentar actualizar el aula.',
      });
    }
  };
  
  const handleDeleteAula = async () => {
    try {
      const response = await fetch(`http://localhost:4000/api/aula/${aulaToDelete.Cod_aula}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchAulas();
        setModalDeleteVisible(false);
        setAulaToDelete({});
        swal.fire({icon: 'success',title: 'Eliminación exitosa',text: 'El aula ha sido eliminada correctamente.',
        });
      } else {
        swal.fire({icon: 'error',title: 'Error',text: 'No se pudo eliminar el aula.',
        });
      }
    } catch (error) {
      console.error('Error al eliminar el aula:', error);
    }
  };

  const openUpdateModal = (aula) => {
    setAulaToUpdate(aula);
    setModalUpdateVisible(true);
  };

  const openDeleteModal = (aula) => {
    setAulaToDelete(aula);
    setModalDeleteVisible(true);
  };

  // Función para cerrar el modal con advertencia si hay cambios sin guardar
  const handleCloseModal = () => {
    swal.fire({
      title: '¿Estás seguro?',
      text: 'Tienes cambios sin guardar. ¿Deseas cerrar el modal?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Cerrar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        setModalVisible(false);
        resetNuevaAula();
        setModalUpdateVisible(false);
        setModalDeleteVisible(false);
      }
    }); 
  };
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(aulas);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Aulas');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, 'reporte_aulas.xlsx');
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text('Reporte de Aulas', 20, 10);
    doc.autoTable({
      head: [['#', 'Número de Aula', 'Capacidad','Cupos' , 'Edificio','División', 'Secciones_disponibles','Secciones_ocupadas',]],
      body: aulas.map((aula, index) => [
        index + 1,
        aula.Numero_aula,
        aula.Capacidad,
        aula.Cupos_aula,
        aula.Nombre_edificios,
        aula.Division,
        aula.Secciones_disponibles,
        aula.Secciones_ocupadas,
      ]),
    });
    doc.save('reporte_aulas.pdf');
  };
   
  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };
  
  const filteredAulas = aulas.filter((aula) =>
    aula.Numero_aula?.toString().includes(searchTerm) // Solo filtrar por el número de aula
  );
  
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredAulas.slice(indexOfFirstRecord, indexOfLastRecord);
  
  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= Math.ceil(filteredAulas.length / recordsPerPage)) {
      setCurrentPage(pageNumber);
    }
  };
      return (
        <CContainer>
        <CRow className="align-items-center mb-5">
          <CCol xs="8" md="9">
            {/* Título de la página */}
            <h1 className="mb-0">Mantenimiento Aulas</h1>
          </CCol>
          <CCol
            xs="4"
            md="3"
            className="text-end d-flex flex-column flex-md-row justify-content-md-end align-items-md-center"
          >
            {/* Botón Nuevo para abrir el modal */}
            <CButton
              style={{ backgroundColor: '#4B6251', color: 'white' }}
              className="mb-3 mb-md-0 me-md-3" // Margen inferior en pantallas pequeñas, margen derecho en pantallas grandes
              onClick={() => {
                setModalVisible(true);}}>
              <CIcon icon={cilPlus}/> Nuevo
            </CButton>

            {/* Botón de Reporte */}
            <CDropdown>
              <CDropdownToggle style={{ backgroundColor: '#6C8E58', color: 'white' }}>
                Reportes
              </CDropdownToggle>
              <CDropdownMenu>
                <CDropdownItem onClick={exportToExcel}>Descargar en Excel</CDropdownItem>
                <CDropdownItem onClick={exportToPDF}>Descargar en PDF</CDropdownItem>
              </CDropdownMenu>
            </CDropdown>
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
              placeholder="Buscar número de aula.."
              onChange={handleSearch}
              value={searchTerm}
            />
            <CButton
              style={{
                border: '1px solid #ccc',
                transition: 'all 0.1s ease-in-out', // Duración de la transición
                backgroundColor: '#F3F4F7', // Color por defecto
                color: '#343a40', // Color de texto por defecto
              }}
              onClick={() => {
                setSearchTerm('')
                setCurrentPage(1)
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#E0E0E0' // Color cuando el mouse sobre el boton "limpiar"
                e.currentTarget.style.color = 'black' // Color del texto cuando el mouse sobre el boton "limpiar"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#F3F4F7' // Color cuando el mouse no está sobre el boton "limpiar"
                e.currentTarget.style.color = '#343a40' // Color de texto cuando el mouse no está sobre el boton "limpiar"
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
                  const value = Number(e.target.value)
                  setRecordsPerPage(value)
                  setCurrentPage(1) // Reiniciar a la primera página cuando se cambia el número de registros
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

     {/* Tabla para mostrar las aulas */}
     <div className="table-container" style={{ maxHeight: '400px', overflowY: 'scroll', marginBottom: '20px' }}>
        <CTable striped bordered hover>
          <CTableHead style={{ position: 'sticky', top: 0, zIndex: 1, backgroundColor: '#fff' }}>
          <CTableRow>
            <CTableHeaderCell>#</CTableHeaderCell>
            <CTableHeaderCell>Número de Aula</CTableHeaderCell>
            <CTableHeaderCell>Capacidad</CTableHeaderCell>
            <CTableHeaderCell>Cupos</CTableHeaderCell>
            <CTableHeaderCell>División</CTableHeaderCell>
            <CTableHeaderCell>Edificio</CTableHeaderCell>
            <CTableHeaderCell>Secciones disponibles</CTableHeaderCell>
            <CTableHeaderCell>Secciones ocupadas</CTableHeaderCell>
            <CTableHeaderCell>Acciones</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
        {currentRecords
            .map((aula, index) => (
                <CTableRow key={aula.Cod_aula}>
                <CTableDataCell>{indexOfFirstRecord+ index + 1}</CTableDataCell>
                <CTableDataCell>{aula.Numero_aula}</CTableDataCell>
                <CTableDataCell>{aula.Capacidad}</CTableDataCell>
                <CTableDataCell>{aula.Cupos_aula}</CTableDataCell>
                <CTableDataCell>{aula.Division}</CTableDataCell>
                <CTableDataCell style={{ textTransform: 'uppercase' }}>{aula.Nombre_edificios}</CTableDataCell>
                <CTableDataCell>{aula.Secciones_disponibles}</CTableDataCell>
                <CTableDataCell>{aula.Secciones_ocupadas}</CTableDataCell>
                <CTableDataCell>
                    <CButton color="warning" onClick={() => openUpdateModal(aula)} className="mr-2">
                    <CIcon icon={cilPen} />
                    </CButton>
                    <CButton color="danger" onClick={() => openDeleteModal(aula)}>
                    <CIcon icon={cilTrash} />
                    </CButton>
                </CTableDataCell>
                </CTableRow>
            ))}

        </CTableBody>
      </CTable>
      </div>
        {/* Paginación Fija */}
        <div
        className="pagination-container"
        style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
      >
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
            disabled={currentPage === Math.ceil(filteredAulas.length / recordsPerPage)} // Desactiva si es la última página
            onClick={() => paginate(currentPage + 1)} // Páginas siguientes
          >
            Siguiente
          </CButton>
        </CPagination>
        <span style={{ marginLeft: '10px' }}>
          Página {currentPage} de {Math.ceil(filteredAulas.length / recordsPerPage)}
        </span>
      </div>


        {/* Modal para crear una nueva aula */}
      <CModal visible={modalVisible} backdrop="static">
        <CModalHeader closeButton={false}>
        <CModalTitle>Ingresar Nueva Aula</CModalTitle>
        <CButton className="btn-close" aria-label="Close" onClick={handleCloseModal} />
        </CModalHeader>
        <CModalBody>
            <CForm>
            {/* Campo de Número de Aula */}
            <CFormInput
                label="Número de Aula"
             
                value={nuevaAula.Numero_aula}
                maxLength={11}
                onPaste={disableCopyPaste}
                onCopy={disableCopyPaste}
                onChange={(e) => {
                  const valor = e.target.value;
                  // Validar caracteres permitidos y letras repetidas
                  if (!permitirCaracteresValidos(valor)) {
                    swal.fire({ icon: 'warning',title: 'Caracteres no permitidos',text: 'Solo se permiten números positivos',});
                    return;
                  }
                  setNuevaAula({ ...nuevaAula, Numero_aula: valor })}}/>
            {/* Campo de Capacidad */}
            <CFormInput
                label="Capacidad"
                value={nuevaAula.Capacidad}
                maxLength={11}
                onPaste={disableCopyPaste}
                onCopy={disableCopyPaste}
                onChange={(e) =>{
                  const valor = e.target.value;
                  if (!permitirCaracteresValidos(valor)) {
                    swal.fire({icon: 'warning',title: 'Caracteres no permitidos', text: 'Solo se permiten números positivos',});
                    return;
                  }
                  setNuevaAula({ ...nuevaAula, Capacidad: valor })}} />
            {/* Campo de Cupos Aula */}
            <CFormInput
                label="Cupos Aula"
                value={nuevaAula.Cupos_aula}
                maxLength={11}
                onPaste={disableCopyPaste}
                onCopy={disableCopyPaste}
                onChange={(e) => {
                  const valor = e.target.value;
                  if (!permitirCaracteresValidos(valor)) {
                    swal.fire({icon: 'warning',title: 'Caracteres no permitidos',text: 'Solo se permiten números positivos',
                    });
                    return;
                  }setNuevaAula({ ...nuevaAula, Cupos_aula: valor })}}/>
            <CFormSelect 
                label="Nombre de Edificios"
                className="form-select"
                key={nuevaAula.Cod_edificio}
                value={nuevaAula.Cod_edificio}
                maxLength={11}
                onPaste={disableCopyPaste}
                onCopy={disableCopyPaste}
                onChange={(e) => setNuevaAula({ ...nuevaAula, Cod_edificio: e.target.value })}>
                <option value="">Seleccione un Edificio</option>
                {edificios.length > 0 ? (
                    edificios.map((edificio) => (
                        <option key={edificio.Cod_edificio} value={edificio.Cod_edificio}>
                            {edificio.Nombre_edificios.toUpperCase()}
                        </option>
                    ))
                ) : (
                    <option disabled>No hay edificios disponibles</option>
                )}
            </CFormSelect>
            {/* Campo de División */}
            <CFormInput
                label="División"
                value={nuevaAula.Division}
                maxLength={11}
                onPaste={disableCopyPaste}
                onCopy={disableCopyPaste}
                onChange={(e) => {
                  const valor = e.target.value;
                  if (!permitirCaracteresValidos(valor)) {
                    swal.fire({icon: 'warning',title: 'Caracteres no permitidos',text: 'Solo se permiten números positivos',
                    });
                    return;
                  }setNuevaAula({ ...nuevaAula, Division: valor })}} />
            {/* Campo de Secciones Disponibles */}
            <CFormInput
                label="Secciones Disponibles"
                value={nuevaAula.Secciones_disponibles}
                maxLength={11}
                onPaste={disableCopyPaste}
                onCopy={disableCopyPaste}
                onChange={(e) =>{
                  const valor = e.target.value;
                  if (!permitirCaracteresValidos(valor)) {
                    swal.fire({icon: 'warning',title: 'Caracteres no permitidos',text: 'Solo se permiten números positivos',});
                    return;
                  } setNuevaAula({ ...nuevaAula, Secciones_disponibles: valor })}}/>
            {/* Campo de Secciones Ocupadas */}
            <CFormInput
                label="Secciones Ocupadas"
                value={nuevaAula.Secciones_ocupadas}
                maxLength={11}
                onPaste={disableCopyPaste}
                onCopy={disableCopyPaste}
                onChange={(e) => {
                  const valor = e.target.value;
                  if (!permitirCaracteresValidos(valor)) {
                    swal.fire({icon: 'warning', title: 'Caracteres no permitidos', text: 'Solo se permiten números positivos', });
                    return;
                  } setNuevaAula({ ...nuevaAula, Secciones_ocupadas: valor })}}/>
            </CForm>
          </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={handleCloseModal}>
            Cerrar
          </CButton>
          <CButton color="primary" onClick={handleCreateAula}>
            Guardar
          </CButton>
        </CModalFooter>
        </CModal>
       {/* Modal para editar aula */}
      <CModal visible={modalUpdateVisible} backdrop="static">
        <CModalHeader closeButton={false}>
          <CModalTitle>Actualizar Aula</CModalTitle>
          <CButton className="btn-close" aria-label="Close" onClick={handleCloseModal} />
        </CModalHeader>
        <CModalBody>
          <CForm>
        {/* Campo Numero de Aula */}
        <CInputGroup className="mb-3">
        <CInputGroupText>Numero de Aula</CInputGroupText>
        <CFormInput
          value={aulaToUpdate.Numero_aula}
          maxLength={11}
          onPaste={disableCopyPaste}
          onCopy={disableCopyPaste}
          onChange={(e) => {
            const valor = e.target.value;
            // Validar caracteres permitidos y letras repetidas
            if (!permitirCaracteresValidos(valor)) {
              swal.fire({icon: 'warning',title: 'Caracteres no permitidos', text: 'Solo se permiten números positivos',});
              return;
            }setAulaToUpdate({ ...aulaToUpdate, Numero_aula: valor })}}
        />
      </CInputGroup>

      {/* Campo Capacidad */}
      <CInputGroup className="mb-3">
        <CInputGroupText>Capacidad</CInputGroupText>
        <CFormInput
          value={aulaToUpdate.Capacidad}
          maxLength={11}
          onPaste={disableCopyPaste}
          onCopy={disableCopyPaste}
          onChange={(e) => {
            const valor = e.target.value;
            if (!permitirCaracteresValidos(valor)) {
              swal.fire({ icon: 'warning',title: 'Caracteres no permitidos', text: 'Solo se permiten números positivos',});
              return;
            } setAulaToUpdate({ ...aulaToUpdate, Capacidad: valor})}}
        />
      </CInputGroup>
      {/* Campo Cupos Aula */}
      <CInputGroup className="mb-3">
        <CInputGroupText>Cupos Aula</CInputGroupText>
        <CFormInput
          value={aulaToUpdate.Cupos_aula}
          maxLength={11}
          onPaste={disableCopyPaste}
          onCopy={disableCopyPaste}
          onChange={(e) => {
            const valor = e.target.value;
            if (!permitirCaracteresValidos(valor)) {
              swal.fire({icon: 'warning',title: 'Caracteres no permitidos',text: 'Solo se permiten números positivos',});
              return;
            } setAulaToUpdate({ ...aulaToUpdate, Cupos_aula: valor })}}
        />
      </CInputGroup>
      {/* Campo Edificio */}
      <CInputGroup className="mb-3">
        <CInputGroupText>Edificio</CInputGroupText>
        <CFormSelect
          aria-label="Seleccionar edificio"
          value={aulaToUpdate.Cod_edificio}
          maxLength={11}
          onPaste={disableCopyPaste}
          onCopy={disableCopyPaste}
          onChange={(e) => setAulaToUpdate({ ...aulaToUpdate, Cod_edificio: e.target.value })}>
          <option value="">Seleccione Edificio</option>
          {edificios.map((edificio) => (
            <option key={edificio.Cod_edificio} value={edificio.Cod_edificio}>
              {edificio.Nombre_edificios.toUpperCase()}
            </option>
          ))}
        </CFormSelect>
      </CInputGroup>
      {/* Campo Division */}
      <CInputGroup className="mb-3">
        <CInputGroupText>Division</CInputGroupText>
        <CFormInput
          value={aulaToUpdate.Division}
          maxLength={11}
          onPaste={disableCopyPaste}
          onCopy={disableCopyPaste}
          onChange={(e) => {
            const valor = e.target.value;
            if (!permitirCaracteresValidos(valor)) {
              swal.fire({ icon: 'warning', title: 'Caracteres no permitidos',text: 'Solo se permiten números positivos',});
              return;
            }setAulaToUpdate({ ...aulaToUpdate, Division: valor })}}
        />
      </CInputGroup>
      {/* Campo Secciones Ocupadas */}
      <CInputGroup className="mb-3">
        <CInputGroupText>Secciones Ocupadas</CInputGroupText>
        <CFormInput
          value={aulaToUpdate.Secciones_ocupadas}
          maxLength={11}
          onPaste={disableCopyPaste}
          onCopy={disableCopyPaste}
          onChange={(e) => {
            const valor = e.target.value;
            if (!permitirCaracteresValidos(valor)) {
              swal.fire({icon: 'warning',title: 'Caracteres no permitidos', text: 'Solo se permiten números positivos',
              });
              return;
            } setAulaToUpdate({ ...aulaToUpdate, Secciones_ocupadas: valor })}}/>
          </CInputGroup>
        </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={handleCloseModal}>
            Cancelar
          </CButton>
          <CButton color="primary" onClick={handleUpdateAula}>
            Guardar Cambios
          </CButton>
        </CModalFooter>
      </CModal>
      {/* Modal Eliminar Aula */}
      <CModal visible={modalDeleteVisible}  backdrop="static">
            <CModalHeader closeButton={false}>
              <CModalTitle>Confirmar Eliminación</CModalTitle>
              <CButton className="btn-close" aria-label="Close" onClick={handleCloseModal} />
            </CModalHeader>
            <CModalBody>
              <p>¿Estás seguro de que deseas eliminar el aula: <strong>{aulaToDelete.Numero_aula}</strong>?</p>
            </CModalBody>
            <CModalFooter>
              <CButton color="secondary" onClick={handleCloseModal}>
                Cancelar
              </CButton>
              <CButton style={{ backgroundColor: '#E57368', color: 'white' }} onClick={handleDeleteAula}>
                <CIcon icon={cilTrash} style={{ marginRight: '5px' }} /> Eliminar
              </CButton>
            </CModalFooter>
        </CModal>

    </CContainer>
  );
};

export default ListaAulas;
