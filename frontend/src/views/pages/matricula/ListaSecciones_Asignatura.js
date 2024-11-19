import React, { useState, useEffect } from 'react';
import CIcon from '@coreui/icons-react';
import { cilSearch, cilBrushAlt, cilPen, cilTrash, cilPlus, cilSave, cilDescription } from '@coreui/icons';
import swal from 'sweetalert2';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import {
  CButton,
  CContainer,
  CDropdown,
  CDropdownMenu,
  CDropdownToggle,
  CDropdownItem,
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
  CFormCheck,
} from '@coreui/react';

const ListaSecciones_Asignaturas= () =>{
    const [secciones_asignaturas, setSecciones_Asignaturas] = useState([]);
    const [secciones, setSecciones] = useState([]);
    const [dias, setDias] = useState([]);
    const [grados_asignaturas, setGradosAsignaturas] = useState([]);
    const [nuevaSeccionAsignatura, setNuevaSeccionAsignatura] = useState({
    p_Cod_grados_asignaturas: '',
    p_Cod_secciones: '',
     p_Cod_dias: [],
    p_Hora_inicio: '',
    p_Hora_fin: '',
    });
    const [modalVisible, setModalVisible] = useState(false);
    const [errors, setErrors] = useState({ p_Cod_grados_asignaturas: '', p_Cod_secciones: '', p_Cod_dias: '', p_Hora_inicio: '', p_Hora_fin: '',});
    const [modalUpdateVisible, setModalUpdateVisible] = useState(false);
    const [seccionAsignaturaToUpdate, setSeccionesAsignaturasToUpdate] = useState({})
    const [mensajeError, setMensajeError] = useState(''); // Estado para el mensaje de error
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [recordsPerPage, setRecordsPerPage] = useState(10);
    const [searchField, setSearchField] = useState("Nombre_seccion, Nombre_grado, Nombre_asignatura");
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false); // Estado para detectar cambios sin guardar
    const resetSeccionAsignatura = () => setNuevaSeccionAsignatura('');
    
    useEffect(() => {
      fetchSeccionAsignatura();
      fetchSecciones();
      fetchDias();
      fetchGradosAsignaturas();
    }, []);
  
    const fetchSeccionAsignatura = async () => {
      try {
        const response = await fetch('http://localhost:4000/api/secciones_asignaturas/obtener_seccion_asig');
        const data = await response.json();
        console.log('Datos obtenidos:', data); // Verifica la estructura de los datos
        setSecciones_Asignaturas(data);
      } catch (error) {
        console.error('Error al obtener las secciones y asignaturas:', error);
      }
    };

    const fetchSecciones = async () => {
      try {
        const response = await fetch('http://localhost:4000/api/secciones_asignaturas/secciones');
        const data = await response.json();
        setSecciones(data);
      } catch (error) {
        console.error('Error al cargar secciones:', error);
      }
    };
  
    const fetchDias = async () => {
      try {
        const response = await fetch('http://localhost:4000/api/secciones_asignaturas/dias');
        const data = await response.json();
        setDias(data);
      } catch (error) {
        console.error('Error al cargar días:', error);
      }
    };
    const fetchGradosAsignaturas = async () => {
      try {
        const response = await fetch('http://localhost:4000/api/secciones_asignaturas/grados_asignaturas');
        const data = await response.json();
        setGradosAsignaturas(data);
      } catch (error) {
        console.error('Error al cargar los grados y asignaturas:', error);
      }
    };
  
    
    const handleCreate = async () => {
      console.log("Datos de la nueva sección-asignatura:", nuevaSeccionAsignatura);
  
      try {
          // Validaciones previas
          if (
              !nuevaSeccionAsignatura.p_Cod_grados_asignaturas ||
              !nuevaSeccionAsignatura.p_Cod_secciones ||
              !nuevaSeccionAsignatura.p_Cod_dias ||
              !nuevaSeccionAsignatura.p_Hora_inicio ||
              !nuevaSeccionAsignatura.p_Hora_fin
          ) {
              setMensajeError('Por favor, complete todos los campos.');
              return;
          }
  
          // Si p_Cod_dias es una cadena, conviértela en un arreglo
          if (typeof nuevaSeccionAsignatura.p_Cod_dias === 'string') {
              nuevaSeccionAsignatura.p_Cod_dias = nuevaSeccionAsignatura.p_Cod_dias.split(',').map(dia => dia.trim());
          }
  
          // Asegurarse de que p_Cod_dias es un arreglo
          if (Array.isArray(nuevaSeccionAsignatura.p_Cod_dias)) {
              nuevaSeccionAsignatura.p_Cod_dias = nuevaSeccionAsignatura.p_Cod_dias.join(',');
          } else {
              setMensajeError('Los días deben ser un arreglo.');
              return;
          }
  
          // Resetear mensaje de error
          setMensajeError('');
  
          const response = await fetch('http://localhost:4000/api/secciones_asignaturas/crear_seccion_asig', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify(nuevaSeccionAsignatura),
          });
  
          if (response.ok) {
              swal.fire('¡Éxito!', 'Sección-asignatura creada correctamente.', 'success');
              fetchSeccionAsignatura(); // Recargar la lista
              setModalVisible(false); // Cerrar modal
              resetSeccionAsignatura(); // Reiniciar formulario
          } else {
              const errorData = await response.json(); // Captura el cuerpo de la respuesta
              setMensajeError(errorData.mensaje || 'Error al crear la sección-asignatura.'); // Actualiza el mensaje de error
              console.error('Error al crear la sección-asignatura:', response.statusText, errorData);
              swal.fire('Error', errorData.mensaje || 'No se pudo crear la sección.', 'error');
          }
      } catch (error) {
          console.error('Error:', error);
          swal.fire('Error', error.message || 'Error al guardar.', 'error');
      }
  };
  
    // Función para abrir el modal de actualización de una sección asignatura
    const openUpdateModal = async (seccionAsignatura) => {
      setSeccionesAsignaturasToUpdate({
        p_Cod_seccion_asignatura: seccionAsignatura.Cod_seccion_asignatura || '',
        p_Cod_grados_asignaturas: seccionAsignatura.Cod_grados_asignaturas || '',
        p_Cod_secciones: seccionAsignatura.Cod_secciones || '',
        p_Cod_dias: seccionAsignatura.Cod_dias || '',
        p_Hora_inicio: seccionAsignatura.Hora_inicio || '',
        p_Hora_fin: seccionAsignatura.Hora_fin || '',
      });

      setModalUpdateVisible(true);
    };

    // Función para manejar la actualización de una sección asignatura
    const handleUpdateSeccionAsignatura = async () => {
      if (
        !seccionAsignaturaToUpdate.p_Cod_seccion_asignatura ||
        !seccionAsignaturaToUpdate.p_Cod_grados_asignaturas ||
        !seccionAsignaturaToUpdate.p_Cod_secciones ||
        !seccionAsignaturaToUpdate.p_Cod_dias ||
        !seccionAsignaturaToUpdate.p_Hora_inicio ||
        !seccionAsignaturaToUpdate.p_Hora_fin
      ) {
        swal.fire('Error', 'Todos los campos son requeridos.', 'error');
        console.log("Faltan campos en seccionAsignaturaToUpdate:", seccionAsignaturaToUpdate);
        return;
      }

      console.log("Datos a actualizar:", seccionAsignaturaToUpdate);

      try {
        const response = await fetch('http://localhost:4000/api/secciones_asignaturas/actualizar_seccion_asig', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            p_Cod_seccion_asignatura: Number(seccionAsignaturaToUpdate.p_Cod_seccion_asignatura),
            p_Cod_grados_asignaturas: Number(seccionAsignaturaToUpdate.p_Cod_grados_asignaturas),
            p_Cod_secciones: Number(seccionAsignaturaToUpdate.p_Cod_secciones),
            p_Cod_dias: (seccionAsignaturaToUpdate.p_Cod_dias || []).join(','), 
            p_Hora_inicio: seccionAsignaturaToUpdate.p_Hora_inicio,
            p_Hora_fin: seccionAsignaturaToUpdate.p_Hora_fin,
          }),
        });

        if (response.ok) {
          swal.fire('Actualización exitosa', 'La sección asignatura ha sido actualizada correctamente.', 'success');
          setModalUpdateVisible(false);
          fetchSeccionAsignatura(); // Función para recargar los datos actualizados
          resetSeccionAsignaturaToUpdate();
        } else {
          const errorData = await response.json();
          swal.fire('Error', errorData.mensaje || 'No se pudo actualizar la sección asignatura.', 'error');
        }
      } catch (error) {
        console.error('Error al actualizar la sección asignatura:', error);
        swal.fire('Error', 'Error de conexión o en el servidor.', 'error');
      }
    };

    // Función para resetear el estado del formulario de actualización
    const resetSeccionAsignaturaToUpdate = () => {
      setSeccionesAsignaturasToUpdate({
        p_Cod_seccion_asignatura: '',
        p_Cod_grados_asignaturas: '',
        p_Cod_secciones: '',
        p_Cod_dias: '',
        p_Hora_inicio: '',
        p_Hora_fin: '',
      });
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
        
      }
    }); 
  };

  // Función para obtener el nombre de la asignatura a partir de su código
const getNombreAsignatura = (cod_asignatura) => {
  if (!grados_asignaturas.length) return 'Asignaturas no disponibles';

  const asignatura = grados_asignaturas.find(
    (item) => item.Cod_asignatura === cod_asignatura
  );
  return asignatura ? asignatura.Nombre_asignatura : 'Asignatura no encontrada';
};

// Función para obtener el nombre del grado a partir de su código
const getNombreGrado = (cod_grado) => {
  if (!grados_asignaturas.length) return 'Grados no disponibles';

  const grado = grados_asignaturas.find(
    (item) => item.Cod_grado === cod_grado
  );
  return grado ? grado.Nombre_grado : 'Grado no encontrado';
};

    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
        setCurrentPage(1);
      };
      // Función para manejar la paginación
     const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= Math.ceil(secciones_asignaturas.length / recordsPerPage)) {
      setCurrentPage(pageNumber);
    }
  };

  

  const filteredSeccionesAsignaturas = secciones_asignaturas.filter(seccion_asignatura => {
    if (!searchTerm) {
      return true; // Mostrar todos si no hay término de búsqueda
    }
  
    if (searchField === "Nombre_seccion") {
      return seccion_asignatura.Nombre_seccion &&
        seccion_asignatura.Nombre_seccion.toLowerCase().includes(searchTerm.toLowerCase());
    } else if (searchField === "Nombre_grado") {
      // Usa el nombre correcto del campo que contiene el código de grado
      const codGrado = seccion_asignatura.Cod_grado || seccion_asignatura.codigoGrado; // Cambia según el nombre correcto
      if (!codGrado) {
        console.warn("Cod_grado está undefined o no existe en seccion_asignatura");
        return false;
      }
      const gradoName = getNombreGrado(codGrado);
      return gradoName.toLowerCase().includes(searchTerm.toLowerCase());
    } else if (searchField === "Nombre_asignatura") {
      // Usa el nombre correcto del campo que contiene el código de asignatura
      const codAsignatura = seccion_asignatura.Cod_asignatura || seccion_asignatura.codigoAsignatura; // Cambia según el nombre correcto
      if (!codAsignatura) {
        console.warn("Cod_asignatura está undefined o no existe en seccion_asignatura");
        return false;
      }
      const asignaturaName = getNombreAsignatura(codAsignatura);
      return asignaturaName.toLowerCase().includes(searchTerm.toLowerCase());
    }
  
    return false;
  });
  

  

      const indexOfLastRecord = currentPage * recordsPerPage;
      const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
      const currentRecords = filteredSeccionesAsignaturas.slice(indexOfFirstRecord, indexOfLastRecord);
      

      return(
         <CContainer>
        <CRow className="align-items-center mb-5">
          <CCol xs="8" md="9">
            {/* Título de la página */}
            <h1 className="mb-0">Mantenimiento Secciones - Asignaturas</h1>
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
              placeholder="Buscar ..."
              onChange={(e) => setSearchTerm(e.target.value)}
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
            <CFormSelect
              aria-label="Buscar por"
              onChange={(e) => setSearchField(e.target.value)}
              style={{ marginLeft: '10px' }}
            >
              <option value="Nombre_seccion">Nombre Sección</option>
              <option value="Nombre_grado">Grado</option>
              <option value="Nombre_asignatura">Asignatura</option>
            </CFormSelect>
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

     {/* Tabla para mostrar las secciones_asignaturas */}
     <div className="table-container" style={{ maxHeight: '400px', overflowY: 'scroll', marginBottom: '20px' }}>
        <CTable striped bordered hover>
          <CTableHead style={{ position: 'sticky', top: 0, zIndex: 1, backgroundColor: '#fff' }}>
          <CTableRow>
            <CTableHeaderCell>#</CTableHeaderCell>     
            <CTableHeaderCell>Nombre del grado</CTableHeaderCell>
            <CTableHeaderCell>Nombre de la sección</CTableHeaderCell>
            <CTableHeaderCell>Nombre de la asignatura</CTableHeaderCell>
            <CTableHeaderCell>Días</CTableHeaderCell>
            <CTableHeaderCell>Hora inicial</CTableHeaderCell>
            <CTableHeaderCell>Hora final</CTableHeaderCell>
            <CTableHeaderCell>Acciones</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
        {currentRecords
            .map((secc_asig, index) => (
                <CTableRow key={secc_asig.Cod_seccion_asignatura}>
                <CTableDataCell>{indexOfFirstRecord+ index + 1}</CTableDataCell>
                <CTableDataCell style={{ textTransform: 'uppercase' }}>{secc_asig.Nombre_grado}</CTableDataCell>
                <CTableDataCell style={{ textTransform: 'uppercase' }}>{secc_asig.Nombre_seccion}</CTableDataCell>
                <CTableDataCell style={{ textTransform: 'uppercase' }}>{secc_asig.Nombre_asignatura}</CTableDataCell>
                <CTableDataCell style={{ textTransform: 'uppercase' }}>
                  {/* Si es un arreglo, lo unimos con comas */}
                  {Array.isArray(secc_asig.Nombre_dia)
                    ? secc_asig.Nombre_dia.join(', ')  // Une los días con comas
                    : secc_asig.Nombre_dia}  {/* Si no es arreglo, solo lo muestra como está */}
                </CTableDataCell>
                <CTableDataCell>{secc_asig.Hora_inicio}</CTableDataCell>
                <CTableDataCell>{secc_asig.Hora_fin}</CTableDataCell>
                <CTableDataCell>
                <div className="d-flex justify-content-center">
                    <CButton color="warning" onClick={() => openUpdateModal(secc_asig)} className="me-2">
                      <CIcon icon={cilPen} />
                    </CButton>
                  </div>
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
            disabled={currentPage === Math.ceil(filteredSeccionesAsignaturas.length / recordsPerPage)} // Desactiva si es la última página
            onClick={() => paginate(currentPage + 1)} // Páginas siguientes
          >
            Siguiente
          </CButton>
        </CPagination>
        <span style={{ marginLeft: '10px' }}>
          Página {currentPage} de {Math.ceil(filteredSeccionesAsignaturas.length / recordsPerPage)}
        </span>
      </div>

            {/* Modal para crear una nueva sección-asignatura */}
        <CModal visible={modalVisible} >
          <CModalHeader closeButton={false}>
            <CModalTitle>Crear Nueva Sección-Asignatura</CModalTitle>
            <CButton className="btn-close" aria-label="Close" onClick={handleCloseModal} />
          </CModalHeader>
          <CModalBody>
          <CInputGroup className="mb-3">
            <CFormSelect
              label="Grado-Asigantura"
              value={nuevaSeccionAsignatura.p_Cod_grados_asignaturas}
              onChange={(e) =>
                setNuevaSeccionAsignatura((prev) => ({
                  ...prev,
                  p_Cod_grados_asignaturas: e.target.value,
                }))
              }
            >
              <option value="">Seleccione un grado-asignatura</option>
              {grados_asignaturas.map((grado_asig) => (
                <option key={grado_asig.Cod_grados_asignaturas} value={grado_asig.Cod_grados_asignaturas}>
                  {grado_asig.Nombre_grado}- {grado_asig.Nombre_asignatura}
                </option>
              ))}
            </CFormSelect>
            </CInputGroup>
            <CInputGroup className="mb-3">
            <CFormSelect
              label="Sección"
              value={nuevaSeccionAsignatura.p_Cod_secciones}
              onChange={(e) =>
                setNuevaSeccionAsignatura((prev) => ({
                  ...prev,
                  p_Cod_secciones: e.target.value,
                }))
              }
            >
              <option value="">Seleccione una sección</option>
              {secciones.map((seccion) => (
                <option key={seccion.Cod_secciones} value={seccion.Cod_secciones}>
                  {seccion.Nombre_seccion}
                </option>
              ))}
            </CFormSelect>
           </CInputGroup>
            {/* Código de los días como checkboxes */}
            <CInputGroup className="mb-3">
              <CInputGroupText>Días</CInputGroupText>
              <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'space-between', marginLeft: '35px' }}>
                {dias.map((dia) => (
                  <CFormCheck
                    key={dia.Cod_dias}
                    label={dia.dias.toUpperCase()} // Mostrando el nombre del día en mayúsculas
                    value={dia.Cod_dias}
                    checked={(nuevaSeccionAsignatura.p_Cod_dias || []).includes(dia.Cod_dias)}
                    onChange={(e) => {
                      const selectedDias = nuevaSeccionAsignatura.p_Cod_dias || [];
                      const newDias = e.target.checked
                        ? [...selectedDias, dia.Cod_dias] // Agregar día seleccionado
                        : selectedDias.filter((codDia) => codDia !== dia.Cod_dias); // Eliminar día deseleccionado
                      setNuevaSeccionAsignatura({
                        ...nuevaSeccionAsignatura,
                        p_Cod_dias: newDias,
                      });
                    }}
                  />
                ))}
              </div>
            </CInputGroup>

            <CInputGroup className="mb-3">
            <CFormInput
              label="Hora de Inicio"
              type="time"
              value={nuevaSeccionAsignatura.p_Hora_inicio}
              onChange={(e) =>
                setNuevaSeccionAsignatura((prev) => ({
                  ...prev,
                  p_Hora_inicio: e.target.value,
                }))
              }
            />
            </CInputGroup>
            <CInputGroup className="mb-3">
            <CFormInput
              label="Hora de Fin"
              type="time"
              value={nuevaSeccionAsignatura.p_Hora_fin}
              onChange={(e) =>
                setNuevaSeccionAsignatura((prev) => ({
                  ...prev,
                  p_Hora_fin: e.target.value,
                }))
              }
            />
            </CInputGroup>
            {mensajeError && <p className="text-danger">{mensajeError}</p>}
          </CModalBody>
          <CModalFooter>
          <CButton color="secondary" onClick={handleCloseModal}>
            Cerrar
          </CButton>
            <CButton color="primary" onClick={handleCreate}>
              <CIcon icon={cilSave} /> Guardar
            </CButton>
          </CModalFooter>
        </CModal>


              <CModal visible={modalUpdateVisible} backdrop="static" >
        <CModalHeader closeButton={false}>
          <CModalTitle>Actualizar Sección Asignatura</CModalTitle>
          <CButton className="btn-close" aria-label="Close" onClick={handleCloseModal} />
        </CModalHeader>
        <CModalBody>
          {/* Código de la sección asignatura */}
          <CInputGroup className="mb-3">
            <CInputGroupText>Código</CInputGroupText>
            <CFormInput
              value={seccionAsignaturaToUpdate.p_Cod_seccion_asignatura || ''}
              disabled // Campo solo lectura
            />
          </CInputGroup>

          {/* Código del grado asignatura */}
          <CInputGroup className="mb-3">
            <CInputGroupText>Grado Asignatura</CInputGroupText>
            <CFormSelect
              value={seccionAsignaturaToUpdate.p_Cod_grados_asignaturas || ''}
              onChange={(e) =>
                setSeccionesAsignaturasToUpdate({
                  ...seccionAsignaturaToUpdate,
                  p_Cod_grados_asignaturas: e.target.value,
                })
              }
            >
              <option value="">Seleccione un grado asignatura</option>
              {grados_asignaturas.map((grado_asig) => (
                <option key={grado_asig.Cod_grados_asignaturas} value={grado_asig.Cod_grados_asignaturas}>
                  {grado_asig.Nombre_grado}- {grado_asig.Nombre_asignatura}
                </option>
              ))}
            </CFormSelect>
          </CInputGroup>

          {/* Código de la sección */}
          <CInputGroup className="mb-3">
            <CInputGroupText>Sección</CInputGroupText>
            <CFormSelect
              value={seccionAsignaturaToUpdate.p_Cod_secciones || ''}
              onChange={(e) =>
                setSeccionesAsignaturasToUpdate({
                  ...seccionAsignaturaToUpdate,
                  p_Cod_secciones: e.target.value,
                })
              }
            >
              <option value="">Seleccione una sección</option>
              {secciones.map((seccion) => (
                <option key={seccion.Cod_secciones} value={seccion.Cod_secciones}>
                  {seccion.Nombre_seccion.toUpperCase()}
                </option>
              ))}
            </CFormSelect>
          </CInputGroup>

          {/* Código de los días */}
        <CInputGroup className="mb-3">
          <CInputGroupText>Días</CInputGroupText>
          <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'space-between', marginLeft: '35px'  }}>
            {dias.map((dia) => (
              <CFormCheck
                key={dia.Cod_dias}
                label={dia.dias.toUpperCase()}
                value={dia.Cod_dias}
                checked={(seccionAsignaturaToUpdate.p_Cod_dias || []).includes(dia.Cod_dias)}
                onChange={(e) => {
                  const selectedDias = seccionAsignaturaToUpdate.p_Cod_dias || [];
                  const newDias = e.target.checked
                    ? [...selectedDias, dia.Cod_dias] // Agrega el día seleccionado
                    : selectedDias.filter((codDia) => codDia !== dia.Cod_dias); // Elimina el día deseleccionado
                  setSeccionesAsignaturasToUpdate({
                    ...seccionAsignaturaToUpdate,
                    p_Cod_dias: newDias,
                  });
                }}
              />
            ))}
          </div>
        </CInputGroup>


          {/* Hora de inicio */}
          <CInputGroup className="mb-3">
            <CInputGroupText>Hora de Inicio</CInputGroupText>
            <CFormInput
              type="time"
              value={seccionAsignaturaToUpdate.p_Hora_inicio || ''}
              onChange={(e) =>
                setSeccionesAsignaturasToUpdate({
                  ...seccionAsignaturaToUpdate,
                  p_Hora_inicio: e.target.value,
                })
              }
            />
          </CInputGroup>

          {/* Hora de fin */}
          <CInputGroup className="mb-3">
            <CInputGroupText>Hora de Fin</CInputGroupText>
            <CFormInput
              type="time"
              value={seccionAsignaturaToUpdate.p_Hora_fin || ''}
              onChange={(e) =>
                setSeccionesAsignaturasToUpdate({
                  ...seccionAsignaturaToUpdate,
                  p_Hora_fin: e.target.value,
                })
              }
            />
          </CInputGroup>
        </CModalBody>
        <CModalFooter>
        <CButton color="secondary" onClick={handleCloseModal}>
            Cancelar
          </CButton>
          <CButton color="primary" onClick={handleUpdateSeccionAsignatura}>
            Guardar Cambios
          </CButton>
        </CModalFooter>
      </CModal>




      </CContainer>
      );
}
export default ListaSecciones_Asignaturas;