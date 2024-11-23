import React, { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { CIcon } from '@coreui/icons-react';
import Swal from 'sweetalert2';
import { cilPlus, cilPen, cilTrash } from '@coreui/icons';

import {CButton,CContainer,CForm,CFormInput, CFormSelect,CInputGroup,CInputGroupText,CModal,CModalHeader,CModalTitle,
  CModalBody,CModalFooter,CTable,CTableHead,CTableRow,CTableHeaderCell,CTableBody,CTableDataCell
} from '@coreui/react';

const ActividadesAcademicasProfesor = () => {
  const [secciones, setSecciones] = useState([]);
  const [asignaturas, setAsignaturas] = useState([]);
  const [actividades, setActividades] = useState([]);
  const [selectedSeccion, setSelectedSeccion] = useState(null);
  const [selectedAsignatura, setSelectedAsignatura] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [nuevaActividad, setNuevaActividad] = useState({
    Cod_profesor: '',
    Nombre_actividad_academica: '',
    Descripcion: '',
    Fechayhora_Inicio: '',
    Fechayhora_Fin: '',
    Valor: '',
    Cod_ponderacion_ciclo: '',
    Cod_parcial: '',
    Cod_secciones: '', // Sección seleccionada
    Cod_asignatura: '', // Asignatura seleccionada
  });
  const [listaponderaciones, setponderaciones] = useState([]);
  const [listaSecciones, setListaSecciones] = useState([]);
  const [listaParcial, setparcial] = useState([]);
  const [listaponderacionesC, setlistaponderacionesC] = useState([]); // 
  const [vistaActual, setVistaActual] = useState("secciones"); // Control de vista actual
  const [codProfesor, setCodProfesor] = useState('');
  // Obtener las secciones asignadas al profesor
  useEffect(() => {
    fetchSecciones();
    fetchListaParcial();
    fetchlistaponderacion();
    fetchListaCiclo();
    
  }, []);
 
  
  const fetchSecciones = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        Swal.fire('Error', 'No se ha encontrado el token. Por favor, inicia sesión nuevamente.', 'error');
        return;
      }
  
      const response = await fetch('http://localhost:4000/api/secciones/porprofesor', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) {
        throw new Error('Error al obtener las secciones');
      }
  
      const data = await response.json();
      console.log('Datos de secciones filtradas:', data);
  
      const { codProfesor, secciones } = data;
      
      if (secciones.length > 0) {
        setSecciones(secciones); // Guardar las secciones en el estado
        setCodProfesor(codProfesor); // Guardar codProfesor en el estado
        console.log('Código de profesor:', codProfesor);
      } else {
        Swal.fire('Aviso', 'No tienes secciones asignadas.', 'info');
      }
    } catch (error) {
      console.error('Error al obtener las secciones:', error);
      Swal.fire('Error', 'Hubo un problema al obtener las secciones.', 'error');
    }
  };

  const handleEntrarSeccion = (seccion) => {
    console.log('Sección seleccionada:', seccion); // Agrega este log
    setSelectedSeccion(seccion);
    setVistaActual("asignaturas");
    fetchAsignaturas(seccion.Cod_secciones);
  };

  const fetchAsignaturas = async (codSeccion) => {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:4000/api/seccionAsignatura/verseccionesasignaturas/${codSeccion}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error('Error al obtener asignaturas');
        }

        const data = await response.json();
        setAsignaturas(data); // Configura las asignaturas recibidas
    } catch (error) {
        console.error('Error al obtener asignaturas:', error);
        Swal.fire('Error', 'Hubo un problema al obtener las asignaturas.', 'error');
    }
};


const fetchActividades = async (codSeccionAsignatura) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`http://localhost:4000/api/actividadesAcademicas/obtenerActividades/${codSeccionAsignatura}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Error al obtener actividades académicas');
    }

    const data = await response.json();
    console.log('Datos de actividades académicas:', data);

    if (Array.isArray(data)) {
      setActividades(data); // Make sure activities are for the specific `codSeccionAsignatura`
    } else {
      Swal.fire('Error', 'Formato de datos inesperado del servidor.', 'error');
    }
  } catch (error) {
    console.error('Error al obtener actividades académicas:', error);
    Swal.fire('Error', 'Hubo un problema al obtener las actividades académicas.', 'error');
  }
};


const handleGestionarAsignatura = (asignatura) => {
  console.log('Asignatura seleccionada:', asignatura);
  setSelectedAsignatura(asignatura);
  setVistaActual("actividades");
  fetchActividades(asignatura.Cod_seccion_asignatura);
};


const fetchlistaponderacion = async () => {
  try {
    const response = await fetch('http://localhost:4000/api/ponderaciones/verPonderaciones');
    const data = await response.json();
    setponderaciones(data);
  } catch (error) {
    console.error('Error al obtener las ponderaciones:', error);
  }
};

const fetchListaParcial = async () => {
  try {
    const response = await fetch('http://localhost:4000/api/parciales/verParciales');
    const data = await response.json();
    setparcial(data);
  } catch (error) {
    console.error('Error al obtener los parciales:', error);
  }
};
const fetchListaCiclo= async () => {
  try {
    const response = await fetch('http://localhost:4000/api/ponderacionCiclo/verPonderacionesCiclos');
    const data = await response.json();
    setlistaponderacionesC(data);
  } catch (error) {
    console.error('Error al obtener los parciales:', error);
  }
};
// Función para actualizar las actividades después de crear una nueva
const onCreate = () => {
  if (selectedAsignatura && selectedAsignatura.Cod_seccion_asignatura) {
    fetchActividades(selectedAsignatura.Cod_seccion_asignatura);
  }
};

//--------------------------------------------------------------------------------------------------------------

 // Validar los campos antes de enviar
 const validarCampos = () => {
  const { Nombre_actividad_academica, Descripcion, Fechayhora_Inicio, Fechayhora_Fin, Valor, Cod_ponderacion_ciclo, Cod_parcial, Cod_secciones } = nuevaActividad;

  if (!Nombre_actividad_academica || !Descripcion || !Fechayhora_Inicio || !Fechayhora_Fin || !Valor || !Cod_ponderacion_ciclo || !Cod_parcial || !Cod_secciones) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Todos los campos son obligatorios.',
    });
    return false;
  }

  if (new Date(Fechayhora_Inicio) >= new Date(Fechayhora_Fin)) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'La "Fecha y Hora de Inicio" no puede ser mayor o igual que la "Fecha y Hora de Fin".',
    });
    return false;
  }

  if (isNaN(Valor) || Valor <= 0 || Valor > 100) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'El "Valor" debe ser un número entre 1 y 100.',
    });
    return false;
  }

  return true;
};

const handleCrearActividad = async () => {
  if (!validarCampos()) {
    return;
  }

  try {
    const token = localStorage.getItem('token');
    if (!token) {
      Swal.fire('Error', 'Token no proporcionado', 'error');
      return;
    }

    const actividadData = {
      ...nuevaActividad,
      Cod_profesor: codProfesor,
      Cod_secciones: selectedSeccion?.Cod_secciones || '',
      Cod_seccion_asignatura: selectedAsignatura?.Cod_seccion_asignatura // Asegúrate de que este campo esté correctamente asignado
    };

    const response = await fetch('http://localhost:4000/api/actividadesAcademicas/crearactividadacademica', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(actividadData),
    });

    if (response.ok) {
      Swal.fire({
        icon: 'success',
        title: '¡Éxito!',
        text: 'La actividad se ha creado correctamente.',
      });
      setModalVisible(false);

      // Limpia el formulario después de crear la actividad
      setNuevaActividad({
        Cod_profesor: '',
        Nombre_actividad_academica: '',
        Descripcion: '',
        Fechayhora_Inicio: '',
        Fechayhora_Fin: '',
        Valor: '',
        Cod_ponderacion_ciclo: '',
        Cod_parcial: '',
        Cod_secciones: '',
        Cod_asignatura: '',
        Cod_seccion_asignatura: ''
      });

      onCreate(); // Llama a la función para actualizar la lista de actividades
    } else {
      console.error('Error al crear la actividad');
      Swal.fire('Error', 'Hubo un problema al crear la actividad', 'error');
    }
  } catch (error) {
    console.error('Error al crear la actividad', error);
  }
};



// Modifica abrirModalCrearActividad para incluir codProfesor
const abrirModalCrearActividad = () => {
  setNuevaActividad({
    Cod_profesor: codProfesor, // Asigna el código del profesor aquí
    Nombre_actividad_academica: '',
    Descripcion: '',
    Fechayhora_Inicio: '',
    Fechayhora_Fin: '',
    Valor: '',
    Cod_ponderacion_ciclo: '',
    Cod_parcial: '',
    Cod_secciones: selectedSeccion?.Cod_secciones || '',
    Cod_asignatura: selectedAsignatura?.Cod_asignatura || '',
    Cod_seccion_asignatura: selectedAsignatura?.Cod_seccion_asignatura
  });
  setModalVisible(true);
};

const handleRegresar = () => {
  if (vistaActual === "actividades") {
    setVistaActual("asignaturas");
    setSelectedAsignatura(null);
  } else if (vistaActual === "asignaturas") {
    setVistaActual("secciones");
    setSelectedSeccion(null);
  }
};

  return (
    <CContainer>
      {vistaActual === "secciones" && (
        <div>
          <h2>Secciones Asignadas</h2>
          <CTable striped>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>Sección</CTableHeaderCell>
                <CTableHeaderCell>Grado</CTableHeaderCell>
                <CTableHeaderCell>Periodo</CTableHeaderCell>
                <CTableHeaderCell>Acciones</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {secciones.map((seccion) => (
                <CTableRow key={seccion.Cod_secciones}>
                   <CTableDataCell>{seccion.Nombre_seccion}</CTableDataCell>
            <CTableDataCell>{seccion.Nombre_grado}</CTableDataCell> {/* Mostrar nombre del grado */}
            <CTableDataCell>{seccion.Anio_academico}</CTableDataCell> {/* Mostrar nombre del período */}
            <CTableDataCell>
                    <CButton color="primary" onClick={() => handleEntrarSeccion(seccion)}>
                      Entrar
                    </CButton>
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
        </div>
      )}  {vistaActual === "asignaturas" && (
        <div>
         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2>Asignaturas de la Sección: {selectedSeccion.Nombre_seccion}</h2>
            <CButton color="secondary" onClick={handleRegresar} style={{ marginLeft: 'auto' }} >
              Regresar a Secciones
            </CButton>
          </div>
          <CTable striped>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>Asignatura</CTableHeaderCell>
                <CTableHeaderCell>Descripción</CTableHeaderCell>
                <CTableHeaderCell>Acciones</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {asignaturas.map((asignatura) => (
                <CTableRow key={asignatura.Cod_asignatura}>
                  <CTableDataCell>{asignatura.Nombre_asignatura}</CTableDataCell>
                  <CTableDataCell>{asignatura.Descripcion_asignatura}</CTableDataCell>
                  <CTableDataCell>
                    <CButton color="success" onClick={() => handleGestionarAsignatura(asignatura)}>
                      Gestionar
                    </CButton>
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
        </div>
      )}
       {vistaActual === "actividades" && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Actividades de la Asignatura: {selectedAsignatura.Nombre_asignatura}</h2>
          <CButton color="secondary"onClick={handleRegresar} style={{ marginLeft: 'auto' }}>Regresar a Asignaturas</CButton>
          </div>
          <CButton color="success" onClick={() => abrirModalCrearActividad(true)}>
            <CIcon icon={cilPlus} /> Nueva Actividad
          </CButton>
          <CTable striped>
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell>Nombre</CTableHeaderCell>
            <CTableHeaderCell>Descripción</CTableHeaderCell>
            <CTableHeaderCell>Ponderación</CTableHeaderCell>
            <CTableHeaderCell>Parcial</CTableHeaderCell>
            <CTableHeaderCell>Fecha Inicio</CTableHeaderCell>
            <CTableHeaderCell>Fecha Fin</CTableHeaderCell>
            <CTableHeaderCell>Valor</CTableHeaderCell>
          
            <CTableHeaderCell>Acciones</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {actividades.map((actividad) => (
            <CTableRow key={actividad.Cod_actividad_academica}>
              {/* Ocultar Cod_actividad_academica y Cod_profesor */}
              <CTableDataCell>{actividad.Nombre_actividad_academica}</CTableDataCell>
              <CTableDataCell>{actividad.Descripcion}</CTableDataCell>
              <CTableDataCell>{actividad.Cod_ponderacion_ciclo}</CTableDataCell>
              <CTableDataCell>{listaParcial.find(parcial => parcial.Cod_parcial === actividad.Cod_parcial)?.Nombre_parcial || 'N/A'}</CTableDataCell>
              
              <CTableDataCell>{new Date(actividad.Fechayhora_Inicio).toLocaleString()}</CTableDataCell>
              <CTableDataCell>{new Date(actividad.Fechayhora_Fin).toLocaleString()}</CTableDataCell>
              <CTableDataCell>{actividad.Valor}</CTableDataCell>
              
              <CTableDataCell>
                <CButton color="warning">
                  <CIcon icon={cilPen} /> Editar
                </CButton>
                <CButton color="danger" className="ms-2">
                  <CIcon icon={cilTrash} /> Eliminar
                </CButton>
              </CTableDataCell>
            </CTableRow>
          ))}
            </CTableBody>
          </CTable>
        </div>
      )}


<CModal visible={modalVisible} backdrop="static" onClose={() => setModalVisible(false)}>
  <CModalHeader closeButton>
    <CModalTitle>Crear Nueva Actividad Académica</CModalTitle>
  </CModalHeader>
  <CModalBody>
  
    <CFormInput
      label="Nombre de la Actividad"
      value={nuevaActividad.Nombre_actividad_academica}
      onChange={(e) => setNuevaActividad({ ...nuevaActividad, Nombre_actividad_academica: e.target.value })}
    />
    <CFormInput
      label="Descripción"
      value={nuevaActividad.Descripcion}
      onChange={(e) => setNuevaActividad({ ...nuevaActividad, Descripcion: e.target.value })}
    />
    <CFormInput
      label="Fecha y Hora de Inicio"
      type="datetime-local"
      value={nuevaActividad.Fechayhora_Inicio}
      onChange={(e) => setNuevaActividad({ ...nuevaActividad, Fechayhora_Inicio: e.target.value })}
    />
    <CFormInput
      label="Fecha y Hora de Fin"
      type="datetime-local"
      value={nuevaActividad.Fechayhora_Fin}
      onChange={(e) => setNuevaActividad({ ...nuevaActividad, Fechayhora_Fin: e.target.value })}
    />
    <CFormInput
      label="Valor"
      type="number"
      value={nuevaActividad.Valor}
      onChange={(e) => setNuevaActividad({ ...nuevaActividad, Valor: e.target.value })}
    />
 <CFormSelect
 label="Ponderacion "
          value={nuevaActividad.Cod_ponderacion_ciclo}
          onChange={(e) => setNuevaActividad({ ...nuevaActividad, Cod_ponderacion_ciclo: e.target.value })}>
          <option value="">Seleccione una ponderación</option>
          {listaponderaciones.map((ponderacion) => (
          <option key={ponderacion.Cod_ponderacion} value={ponderacion.Cod_ponderacion}>
          {ponderacion.Descripcion_ponderacion}
          </option>
           ))}
           </CFormSelect>
    <CFormSelect
      label="Parcial"
      value={nuevaActividad.Cod_parcial}
      onChange={(e) => setNuevaActividad({ ...nuevaActividad, Cod_parcial: e.target.value })}
    >
      <option value="">Selecciona un parcial</option>
      {listaParcial.map((parcial) => (
        <option key={parcial.Cod_parcial} value={parcial.Cod_parcial}>
          {parcial.Nombre_parcial}
        </option>
      ))}
    </CFormSelect>
  
   
  </CModalBody>
  <CModalFooter>
    <CButton color="secondary" onClick={() => setModalVisible(false)}>
      Cancelar
    </CButton>
    <CButton color="primary" onClick={handleCrearActividad}>
      Guardar
    </CButton>
  </CModalFooter>
</CModal>


    </CContainer>
  );
};

export default ActividadesAcademicasProfesor;
