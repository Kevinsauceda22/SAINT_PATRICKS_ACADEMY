import React, { useState, useEffect } from 'react';
import CIcon from '@coreui/icons-react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom'
import { cilSearch, cilArrowLeft, cilPen, cilTrash, cilSave, cilDescription, cilPlus, cilArrowCircleBottom } from '@coreui/icons';
import swal from 'sweetalert2';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import logo from 'src/assets/brand/logo_saint_patrick.png';
import {
  CButton, CContainer, CDropdown, CDropdownMenu, CDropdownToggle, CDropdownItem,
  CFormInput, CInputGroup, CInputGroupText, CModal, CModalHeader, CModalTitle, 
  CModalBody, CModalFooter, CPagination, CTable, CTableHead, CTableRow, 
  CTableHeaderCell, CTableBody, CTableDataCell, CFormSelect, CRow, CCol, CFormCheck
} from '@coreui/react';

const ListaSecciones_Asignaturas = () => {

    // Función para volver a la lista de secciones
    const volverAListaSecciones = () => {
      navigate('/lista-secciones', {
        state: { periodoSeleccionado }
      });
    };

    
    const location = useLocation(); 

    const { seccionSeleccionada } = location.state || {}; 
    console.log("Sección seleccionada:", seccionSeleccionada);


    

const { periodoSeleccionado, gradoSeleccionado, profesores } = location.state || {};
const [filteredProfesores, setFilteredProfesores] = useState([]);


  const [seccionesAsignaturas, setSeccionesAsignaturas] = useState([]);
  const [dias, setDias] = useState([]);
  const [asignaturas, setAsignaturas] = useState([]);
  
  // Estado para manejar horarios y asignaturas
  
  // Estados para gestionar la información de las secciones y asignaturas
  const [secciones, setSecciones] = useState([]);
  const [grados_asignaturas, setGradosAsignaturas] = useState([]);
  const [filterAsignatura, setFilterAsignatura] = useState('');
  
  // Estados para la visibilidad de los modales
  const [modalVisible, setModalVisible] = useState(false);

  const [modalUpdateVisible, setModalUpdateVisible] = useState(false);
  const [seccionAsignaturaToUpdate, setSeccionAsignaturaToUpdate] = useState({});

  const [horarioToUpdate, setHorarioToUpdate] = useState(null);
  // Otros estados para manejar la navegación, búsqueda y cambios sin guardar
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState(''); // Inicializando searchTerm
  const [selectedGrado, setSelectedGrado] = useState("");
  const [dropdownIndex, setDropdownIndex] = useState(null);



  const horariosExistentes = seccionesAsignaturas.filter(fila => parseInt(fila.cod_secciones) === parseInt(seccionSeleccionada));

  const [horarios, setHorarios] = useState(horariosExistentes.length > 0 ? horariosExistentes : [{ horario_inicio: '', horario_fin: '', dias: dias.reduce((acc, dia) => ({ ...acc, [dia]: '' }), {}) }]);
  const [isSubmitting, setIsSubmitting] = useState(false);



  const navigate = useNavigate();





{/***********************************************************************************************************************************/}

{/******************************************EFECTOS Y APIS**************************************************************************/}


{/**************************************************************************************************************************************/}

const fetchSeccionesAsignaturas = async () => {
  try {
    const response = await fetch("http://localhost:4000/api/seccionesAsignaturas/verSeccionesAsignaturas");
    if (!response.ok) throw new Error(`Error en la solicitud: ${response.statusText}`);

    const data = await response.json();
    console.log("Datos obtenidos de la API:", data); // Verifica la respuesta de la API
    setSeccionesAsignaturas(data); // Asigna los datos al estado seccionesAsignaturas
  } catch (error) {
    console.error("Error fetching Secciones Asignaturas:", error);
  }
};



const fetchDias = async () => {
  try {
    const response = await fetch('http://localhost:4000/api/seccionesAsignaturas/verDias');
    if (!response.ok) throw new Error(`Error en la solicitud: ${response.statusText}`);
    
    const data = await response.json();
    console.log('Datos obtenidos de la API de días:', data);
    
    // Extraer solo los nombres de los días
    const diasSolo = data.map(dia => dia.dias);

    // Guardar solo los días en el estado
    setDias(diasSolo);
  } catch (error) {
    console.error('Error fetching dias:', error);
  }
};



const fetchAsignaturas = async () => {
  try {
    const response = await fetch('http://localhost:4000/api/seccionesAsignaturas/verAsignaturas');
    if (!response.ok) throw new Error(`Error en la solicitud: ${response.statusText}`);
    const data = await response.json();
    console.log('Datos obtenidos de la API de Asignaturas:', data);
    setAsignaturas(data);
  } catch (error) {
    console.error('Error fetching asignaturas:', error);
  }
};



useEffect(() => {
  fetchSeccionesAsignaturas();
  fetchDias();
  fetchAsignaturas();
}, []);

{/*************************************************************************************************************************************/}


const handleModalOpen = () => {
  setModalVisible(true);
};


const handleChange = (index, field, value, dia = null) => {
  const updatedHorarios = [...horarios];
  if (dia) {
    updatedHorarios[index].dias[dia] = value;
    setDropdownIndex(null); // Oculta la lista después de seleccionar
  } else {
    updatedHorarios[index][field] = value;
  }
  setHorarios(updatedHorarios);
};

const handleAddRow = () => {
  setHorarios([...horarios, { horario_inicio: '', horario_fin: '', dias: {} }]);
};

const toggleDropdown = (rowIndex, dia) => {
  setDropdownIndex(dropdownIndex && dropdownIndex.row === rowIndex && dropdownIndex.dia === dia ? null : { row: rowIndex, dia });
};



{/************************************************************************************************************************************/}


const handleSubmit = async () => {
  if (isSubmitting) return;
  setIsSubmitting(true);

  if (horarios.some(h => !h.horario_inicio || !h.horario_fin)) {
    swal.fire({ icon: 'warning', title: 'Campos incompletos', text: 'Por favor, completa todos los campos de horario.' });
    setIsSubmitting(false);
    return;
  }

  const url = horarioToUpdate
    ? `http://localhost:4000/api/seccionesAsignaturas/actualizarSeccionAsignatura/${horarioToUpdate.Cod_seccion_asignatura}`
    : 'http://localhost:4000/api/seccionesAsignaturas/crearSeccionAsignatura';
  const method = horarioToUpdate ? 'PUT' : 'POST';

  try {
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ horarios }),
    });
    const result = await response.json();

    if (response.ok) {
      swal.fire({ icon: 'success', title: horarioToUpdate ? 'Horario actualizado' : 'Horario creado' });
      setTabla(prev => horarioToUpdate ? prev.map(h => (h.id === horarioToUpdate.id ? { ...h, horarios } : h)) : [...prev, result]);
      setModalVisible(false);
    }
  } catch (error) {
    swal.fire({ icon: 'error', title: 'Error', text: 'Error en el servidor.' });
  } finally {
    setIsSubmitting(false);
  }
};




{/*************************************************FUNCION PARA ELIMIAR HORARIO********************************************************************************/}
const handleDeleteSeccionAsignatura = async (cod_seccion_asignatura, descripcionSeccion) => {
  try {
    const confirmResult = await swal.fire({
      title: 'Confirmar Eliminación',
      html: `¿Estás seguro de que deseas eliminar la sección asignatura?`,
      showCancelButton: true,
      confirmButtonColor: '#FF6B6B',
      cancelButtonColor: '#6C757D',
      confirmButtonText: '<i class="fa fa-trash"></i> Eliminar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
      focusCancel: true,
    });

    if (!confirmResult.isConfirmed) return;

    const response = await fetch(
      `http://localhost:4000/api/seccionesAsignaturas/eliminarSeccionAsignatura/${encodeURIComponent(Cod_seccion_asignatura)}`,
      { method: 'DELETE' }
    );

    const result = await response.json();

    if (response.ok) {
      setSeccionesAsignaturas((prevSecciones) =>
        prevSecciones.filter((item) => item.cod_seccion_asignatura !== cod_seccion_asignatura)
      );

      swal.fire({
        icon: 'success',
        title: 'Sección eliminada',
        text: result.Mensaje || 'Eliminado correctamente',
      });
    } else {
      throw new Error(result.Mensaje || 'Error al eliminar');
    }
  } catch (error) {
    console.error('Error eliminando la sección asignatura:', error);
    swal.fire({
      icon: 'error',
      title: 'Error',
      text: error.message || 'No se pudo eliminar la sección asignatura.',
    });
  }
};

{/************************************************************************************************************************************/}

  // Función para manejar el cierre del modal y restablecer los estados
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
        setModalUpdateVisible(false);
      }
    });
  };

{/************************************************************************************************************************************/}
  

{/************************************************************************************************************************************/}

  const handleRecordsPerPageChange = (e) => {
    setRecordsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };
  
  const handleSearch = (e) => setSearchTerm(e.target.value);
  
// Primero declaramos la función
const getAsignaturaNombre = (codigo) => {
  const asignatura = asignaturas.find(asignatura => asignatura.Cod_asignatura === codigo);
  return asignatura ? asignatura.Nombre : ''; // Devuelve el nombre de la asignatura o una cadena vacía si no se encuentra
};

// Aplicamos el filtro

const filteredSeccionesAsignaturas = seccionesAsignaturas.filter((fila) => {
  console.log(`Comparando ${fila.cod_secciones} con ${seccionSeleccionada}`);

  // Convertimos ambos valores a números enteros para asegurar una comparación correcta
  return parseInt(fila.cod_secciones) === parseInt(seccionSeleccionada) &&
    (
      (getAsignaturaNombre(fila.lunes) || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (getAsignaturaNombre(fila.martes) || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (getAsignaturaNombre(fila.miercoles) || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (getAsignaturaNombre(fila.jueves) || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (getAsignaturaNombre(fila.viernes) || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (getAsignaturaNombre(fila.sabado) || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (getAsignaturaNombre(fila.domingo) || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
});





  



{/************************************************************************************************************************************/}


  return(
  <CContainer>
     <div className="container mt-3"> {/* Contenedor general con margen superior */}
  {/* Título, botón y dropdown */}
  <div className="container mt-3"> {/* Contenedor general */}
  {/* Fila del título */}
  <CRow className="align-items-center mb-3">
    <CCol xs="12" className="text-center">
      <h2 className="fw-bold">Gestión de Asignaturas y Horarios</h2>
    </CCol>
    <CCol xs="12" className="text-center">
      <p className="fw-bold">
        GRADO: {gradoSeleccionado || 'Grado no disponible'}
      </p>
      <p className="fw-bold">
        SECCIÓN: {secciones?.Nombre_seccion || 'Sección no disponible'}
      </p>
    </CCol>
  </CRow>

  {/* Fila de los botones */}
  <CRow className="align-items-center mb-3">
    {/* Botón "Volver a Secciones" alineado a la izquierda */}
    <CCol xs="12" md="4" className="text-start mb-2 mb-md-0">
      <CButton
        className="d-flex align-items-center gap-1 rounded shadow"
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#4B4B4B")}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#656565")}
        style={{
          backgroundColor: "#656565",
          color: "#FFFFFF",
          padding: "10px 16px",
          fontSize: "0.9rem",
          transition: "background-color 0.2s ease, box-shadow 0.3s ease",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
          whiteSpace: "nowrap",
        }}
        onClick={volverAListaSecciones}
      >
        <CIcon icon={cilArrowLeft} /> Volver a Secciones
      </CButton>
    </CCol>

    {/* Espaciado entre elementos (opcional en caso de diseño flexible) */}
    <CCol xs="12" md="4" className="text-center mb-2 mb-md-0" />

    {/* Botones "Nuevo" y "Reporte" alineados a la derecha */}
    <CCol
      xs="12"
      md="4"
      className="text-end d-flex flex-column flex-md-row justify-content-md-end align-items-md-center gap-2"
    >
      {/* Botón "Nuevo" */}
      <CButton
        style={{
          backgroundColor: '#4B6251',
          color: 'white',
          minWidth: '120px',
          padding: "10px 16px",
          fontSize: "0.9rem",
        }}
        className="d-flex align-items-center rounded shadow"
        onClick={handleModalOpen} // Abre el modal al hacer clic
      >
        <CIcon icon={cilPlus} /> Nuevo
      </CButton>

      {/* Botón de Reporte */}
      <CDropdown>
        <CDropdownToggle
          style={{
            backgroundColor: "#6C8E58",
            color: "white",
            padding: "10px 16px",
            fontSize: "0.9rem",
          }}
          className="d-flex align-items-center rounded shadow"
        >
          <CIcon icon={cilDescription} /> Reporte
        </CDropdownToggle>
        <CDropdownMenu>
          <CDropdownItem
            onClick={() => generateSeccionesAsignaturasPDF(filteredSeccionesAsignaturas)}
            style={{
              color: "#6C8E58",
              fontWeight: "bold",
            }}
          >
            Ver Reporte en PDF
          </CDropdownItem>
        </CDropdownMenu>
      </CDropdown>
    </CCol>
  </CRow>
</div>



{/* Tabla para mostrar las secciones_asignaturas */}
<div className="table-container" style={{ maxHeight: '400px', overflowY: 'scroll', marginBottom: '20px' }}>
  <CTable striped bordered hover style={{ borderCollapse: 'collapse' }}>
    <CTableHead>
      <CTableRow style={{ fontWeight: 'bold', background: '#f8f9fa' }}>
        <CTableHeaderCell style={{ textAlign: "center", border: '2px solid #000', fontSize: "15px" }}>Horario</CTableHeaderCell>
        <CTableHeaderCell style={{ textAlign: "center", border: '2px solid #000', fontSize: "15px" }}>Lunes</CTableHeaderCell>
        <CTableHeaderCell style={{ textAlign: "center", border: '2px solid #000', fontSize: "15px" }}>Martes</CTableHeaderCell>
        <CTableHeaderCell style={{ textAlign: "center", border: '2px solid #000', fontSize: "15px" }}>Miércoles</CTableHeaderCell>
        <CTableHeaderCell style={{ textAlign: "center", border: '2px solid #000', fontSize: "15px" }}>Jueves</CTableHeaderCell>
        <CTableHeaderCell style={{ textAlign: "center", border: '2px solid #000', fontSize: "15px" }}>Viernes</CTableHeaderCell>
        <CTableHeaderCell style={{ textAlign: "center", border: '2px solid #000', fontSize: "15px" }}>Sábado</CTableHeaderCell>
        <CTableHeaderCell style={{ textAlign: "center", border: '2px solid #000', fontSize: "15px" }}>Domingo</CTableHeaderCell>
        <CTableHeaderCell style={{ textAlign: "center", border: '2px solid #000', fontSize: "15px" }}>Acciones</CTableHeaderCell>
      </CTableRow>
    </CTableHead>
    {filteredSeccionesAsignaturas.map((fila) => {
      return (
        <CTableRow key={fila.Cod_seccion_asignatura} style={{ fontWeight: 'normal' }}>
          <CTableDataCell style={{ textAlign: "center", fontSize: "13px", border: '2px solid #000' }}>
            {fila.horario_inicio} - {fila.horario_fin}
          </CTableDataCell>
          <CTableDataCell style={{ textAlign: "center", fontSize: "12px", border: '2px solid #000' }}>
            {asignaturas.find(asig => asig.Cod_asignatura === fila.lunes)?.Nombre_asignatura.toUpperCase() || 'Desconocido'}
          </CTableDataCell>
          <CTableDataCell style={{ textAlign: "center", fontSize: "12px", border: '2px solid #000' }}>
            {asignaturas.find(asig => asig.Cod_asignatura === fila.martes)?.Nombre_asignatura.toUpperCase() || 'Desconocido'}
          </CTableDataCell>
          <CTableDataCell style={{ textAlign: "center", fontSize: "12px", border: '2px solid #000' }}>
            {asignaturas.find(asig => asig.Cod_asignatura === fila.miercoles)?.Nombre_asignatura.toUpperCase() || 'Desconocido'}
          </CTableDataCell>
          <CTableDataCell style={{ textAlign: "center", fontSize: "12px", border: '2px solid #000' }}>
            {asignaturas.find(asig => asig.Cod_asignatura === fila.jueves)?.Nombre_asignatura.toUpperCase() || 'Desconocido'}
          </CTableDataCell>
          <CTableDataCell style={{ textAlign: "center", fontSize: "12px", border: '2px solid #000' }}>
            {asignaturas.find(asig => asig.Cod_asignatura === fila.viernes)?.Nombre_asignatura.toUpperCase() || 'Desconocido'}
          </CTableDataCell>
          <CTableDataCell style={{ textAlign: "center", fontSize: "12px", border: '2px solid #000' }}>
            {asignaturas.find(asig => asig.Cod_asignatura === fila.sabado)?.Nombre_asignatura.toUpperCase() || 'Desconocido'}
          </CTableDataCell>
          <CTableDataCell style={{ textAlign: "center", fontSize: "12px", border: '2px solid #000' }}>
            {asignaturas.find(asig => asig.Cod_asignatura === fila.domingo)?.Nombre_asignatura.toUpperCase() || 'Desconocido'}
          </CTableDataCell>
          {/* Columna de acciones */}
          <CTableDataCell style={{ textAlign: "center", border: '2px solid #000' }}>
            <CButton color="warning" onClick={() => { setSeccionAsignaturaToUpdate(fila); setModalVisible(true); }}>
              <CIcon icon={cilPen} />
            </CButton>
            <CButton color="danger" onClick={() => handleDeleteSeccionAsignatura(fila.Cod_seccion_asignatura)} className="ms-2">
              <CIcon icon={cilTrash} />
            </CButton>
          </CTableDataCell>
        </CTableRow>
      );
    })}
  </CTable>
</div>
</div>
      
{/******************************************* MODAL ********************************************************************/}
<CModal visible={modalVisible} onClose={() => setModalVisible(false)} size='xl'>
      <CModalHeader>
        <CModalTitle style={{ textAlign: 'center', width: '100%' }}>Grado y Sección: {seccionSeleccionada}</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <div style={{ overflowX: 'auto' }}>
          <table className="table-bordered" style={{ width: '100%', textAlign: 'center' }}>
            <thead>
              <tr>
                <th style={{ width: '250px', textAlign: 'center' }}>Horario Inicio - Fin</th>
                {dias.map(dia => <th key={dia} style={{ textAlign: 'center', width: '150px' }}>{dia}</th>)}
                <th style={{ width: '180px', textAlign: 'center' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {horarios.map((horario, rowIndex) => (
                <tr key={rowIndex}>
                  <td style={{ display: 'flex', gap: '5px', justifyContent: 'center', width: '250px' }}>
                    <CFormInput type="time" value={horario.horario_inicio} onChange={(e) => handleChange(rowIndex, 'horario_inicio', e.target.value)} style={{ width: '45%', minWidth: '80px' }} />
                    <CFormInput type="time" value={horario.horario_fin} onChange={(e) => handleChange(rowIndex, 'horario_fin', e.target.value)} style={{ width: '45%', minWidth: '80px' }} />
                  </td>
                  {dias.map(dia => (
                    <td key={dia} style={{ textAlign: 'center', position: 'relative', width: '150px' }}>
                      {!horario.dias[dia] ? (
                        <CButton size="sm" color="light" onClick={() => toggleDropdown(rowIndex, dia)}>
                          <CIcon icon={cilPlus} />
                        </CButton>
                      ) : (
                        <span style={{ display: 'block', fontSize: '12px' }}>{horario.dias[dia]}</span>
                      )}
                      {dropdownIndex && dropdownIndex.row === rowIndex && dropdownIndex.dia === dia && (
                        <CFormSelect
                          onChange={(e) => handleChange(rowIndex, 'asignatura', e.target.value, dia)}
                          autoFocus
                          style={{ width: '100%', position: 'absolute', top: '100%', left: 0, zIndex: 10 }}
                        >
                          <option value="">+</option>
                          {asignaturas.map((a) => (
                            <option key={a.Cod_asignatura} value={a.Nombre_asignatura}>{a.Nombre_asignatura}</option>
                          ))}
                        </CFormSelect>
                      )}
                    </td>
                  ))}
                  <td style={{ width: '180px', textAlign: 'center' }}>
                    <CButton size="sm" color="warning" onClick={() => setHorarioToUpdate(horario)}>
                      <CIcon icon={cilPen} />
                    </CButton>
                    <CButton size="sm" color="danger" className="ms-2" onClick={() => setHorarios(horarios.filter((_, i) => i !== rowIndex))}>
                      <CIcon icon={cilTrash} />
                    </CButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ textAlign: 'center', marginTop: '15px' }}>
          <CButton style={{ backgroundColor: 'white', color: 'black', border: '1px solid black' }} onClick={handleAddRow}>
            <CIcon icon={cilPlus} /> Agregar Nueva Fila
          </CButton>
        </div>
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={() => setModalVisible(false)}>Cancelar</CButton>
        <CButton color="success">Guardar</CButton>
      </CModalFooter>
    </CModal>




{/**********************************************************************************************************************************/}

            {/* Modal para actualizar una nueva sección-asignatura */}

      </CContainer>
      );
}
export default ListaSecciones_Asignaturas;