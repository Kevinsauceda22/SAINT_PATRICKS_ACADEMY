import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { CIcon } from '@coreui/icons-react';
import { cilSearch,cilInfo, cilBrushAlt, cilPen, cilTrash, cilPlus, cilSave,cilDescription } from '@coreui/icons'; // Importar iconos específicos
import swal from 'sweetalert2';
import { left } from '@popperjs/core';
import jsPDF from 'jspdf';
import 'jspdf-autotable'; // Importa el plugin para tablas
import * as XLSX from 'xlsx';
import {
  CButton,
  CCard,
  CCardBody,
  CContainer,
  CForm,
  CFormInput,
  CFormSelect,
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
  CRow,
  CCol,
} from '@coreui/react';
import Swal from 'sweetalert2';

const VistaActividadesAcademicasAdmin = () => {
  const [profesores, setProfesores] = useState([]);
  const [secciones, setSecciones] = useState([]);
  const [asignaturas, setAsignaturas] = useState([]);
  const [actividades, setActividades] = useState([]);
  const [selectedProfesor, setSelectedProfesor] = useState(null);
  const [listaPersonas, setListaPersonas] = useState([]);
  const [listaponderacionesC, setlistaponderacionesC] = useState([]); // 
  const [selectedSeccion, setSelectedSeccion] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAsignatura, setSelectedAsignatura] = useState(null);
  const [nuevaActividad, setNuevaActividad] = useState({
    Cod_profesor: '',
    Cod_ponderacion_ciclo: '',
    Cod_parcial: '',
    Nombre_actividad_academica: '',
    Descripcion: '',
    Fechayhora_Inicio: '',
    Fechayhora_Fin: '',
    Valor: '',
    Cod_secciones: '',
    Cod_seccion_asignatura: ''
  });
  const [listaponderaciones, setponderaciones] = useState([]);
  const [listaParcial, setparcial] = useState([]);
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [actividadToUpdate, setActividadToUpdate] = useState(null);



  // Fetch de profesores
  useEffect(() => {
    const fetchProfesores = async () => {
      try {
        const response = await fetch('http://localhost:4000/api/profesores/VerProfesores');
        const data = await response.json();
        setProfesores(data);
      } catch (error) {
        console.error('Error al obtener los profesores:', error);
        Swal.fire('Error', 'Hubo un problema al obtener los profesores.', 'error');
      }
    };

    const fetchListaPersonas = async () => {
      try {
        const response = await fetch('http://localhost:4000/api/persona/verpersonas');
        const data = await response.json();
        const dataWithIndex = data.map((persona) => ({
          ...persona,
          nombreCompleto: `${persona.Nombre} ${persona.Segundo_nombre || ''} ${persona.Primer_apellido || ''} ${persona.Segundo_Apellido || ''}`.trim(),
        }));
        setListaPersonas(dataWithIndex);
      } catch (error) {
        console.error('Error al obtener la lista de personas:', error);
      }
    };

    fetchProfesores();
    fetchListaPersonas();
    fetchListaParcial();
    fetchlistaponderacion();
    fetchListaCiclo();
  }, []);

  // Función para obtener el nombre completo de una persona
  const getNombreCompleto = (codPersona) => {
    if (!listaPersonas.length) return 'Personas no disponibles';
    const persona = listaPersonas.find((p) => p.cod_persona === codPersona);
    if (persona) {
      const nombre = persona.Nombre || '';
      const segundoNombre = persona.Segundo_nombre || '';
      const primerApellido = persona.Primer_apellido || '';
      const segundoApellido = persona.Segundo_Apellido || '';
      return `${nombre} ${segundoNombre} ${primerApellido} ${segundoApellido}`.trim();
    }
    return 'Persona no encontrada';
  };

  // Fetch de secciones del profesor seleccionado
  const handleVerSecciones = async (profesor) => {
    setSelectedProfesor(profesor);
    try {
      const response = await fetch(`http://localhost:4000/api/secciones/porprofesor/${profesor.Cod_profesor}`);
      const data = await response.json();
      if (response.ok) {
        setSecciones(data);
      } else {
        Swal.fire('Error', 'No se encontraron secciones para este profesor.', 'info');
      }
    } catch (error) {
      console.error('Error al obtener las secciones:', error);
      Swal.fire('Error', 'Hubo un problema al obtener las secciones.', 'error');
    }
  };

  // Fetch de asignaturas de la sección seleccionada
  const handleVerAsignaturas = async (seccion) => {
    setSelectedSeccion(seccion);
    try {
      const response = await fetch(`http://localhost:4000/api/secciones_asignaturas/porseccion/${seccion.Cod_secciones}`);
      const data = await response.json();
      if (response.ok) {
        setAsignaturas(data);
      } else {
        Swal.fire('Error', 'No se encontraron asignaturas para esta sección.', 'info');
      }
    } catch (error) {
      console.error('Error al obtener las asignaturas:', error);
      Swal.fire('Error', 'Hubo un problema al obtener las asignaturas.', 'error');
    }
  };

  // Fetch de actividades de la asignatura seleccionada
 const handleVerActividades = async (asignatura) => {
  console.log('Asignatura seleccionada:', asignatura); // Depuración
  setSelectedAsignatura(asignatura);
  try {
    const response = await fetch(
      `http://localhost:4000/api/actividadesAcademicas/porProfesorYAsignatura/${selectedProfesor.Cod_profesor}/${asignatura.Cod_seccion_asignatura}`
    );
    const data = await response.json();
    console.log('Actividades recibidas:', data); // Depuración
    setActividades(data);
  } catch (error) {
    console.error('Error al obtener las actividades:', error);
    Swal.fire('Error', 'Hubo un problema al obtener las actividades académicas.', 'error');
  }
};
  
  
const fetchActividades = async (Cod_profesor, Cod_seccion_asignatura) => {
  try {
    const response = await fetch(
      `http://localhost:4000/api/actividadesAcademicas/porProfesorYAsignatura/${Cod_profesor}/${Cod_seccion_asignatura}`
    );
    const data = await response.json();

    if (response.ok) {
      console.log("Actividades actualizadas:", data); // Depuración
      setActividades(data); // Actualiza el estado con las actividades
    } else {
      console.warn("No se encontraron actividades:", data.mensaje);
      setActividades([]); // Limpia el estado si no hay actividades
    }
  } catch (error) {
    console.error("Error al obtener actividades:", error);
    setActividades([]); // Limpia el estado en caso de error
  }
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
    if (selectedProfesor && selectedAsignatura) {
      fetchActividades(
        selectedProfesor.Cod_profesor,
        selectedAsignatura.Cod_asignatura
      );
    }
  };

  const handleGestionarAsignatura = (asignatura) => {
    console.log('Asignatura seleccionada:', asignatura); // Agrega este log para depurar
    setSelectedAsignatura(asignatura);
    setVistaActual("actividades");
    fetchActividades(asignatura.Cod_seccion_asignatura);
  };


  
  const abrirModalActualizarActividad = (actividad) => {
    setActividadToUpdate({
      ...actividad,
      Cod_profesor: selectedProfesor?.Cod_profesor || actividad.Cod_profesor,
      Cod_asignatura: selectedAsignatura?.Cod_asignatura || actividad.Cod_asignatura,
      Cod_secciones: selectedSeccion?.Cod_secciones || actividad.Cod_secciones,
      Cod_seccion_asignatura: selectedAsignatura?.Cod_asignatura || actividad.Cod_asignatura
    });
    setUpdateModalVisible(true);
  };

// Asegúrate de que `abrirModalCrearActividad` se llama correctamente
const abrirModalCrearActividad = () => {
  setNuevaActividad({
    Cod_profesor: selectedProfesor?.Cod_profesor, // Asigna el código del profesor aquí
    Nombre_actividad_academica: '',
    Descripcion: '',
    Fechayhora_Inicio: '',
    Fechayhora_Fin: '',
    Valor: '',
    Cod_ponderacion_ciclo: '',
    Cod_parcial: '',
    Cod_secciones: selectedSeccion?.Cod_secciones || '',
    Cod_asignatura: selectedAsignatura?.Cod_asignatura || '',
    Cod_seccion_asignatura: selectedAsignatura?.Cod_asignatura
  });
  setModalVisible(true);
};

const handleCrearActividad = async () => {
  try {
      const actividadData = {
          Cod_profesor: selectedProfesor?.Cod_profesor || '',
          Cod_ponderacion_ciclo: nuevaActividad.Cod_ponderacion_ciclo,
          Cod_parcial: nuevaActividad.Cod_parcial,
          Nombre_actividad_academica: nuevaActividad.Nombre_actividad_academica,
          Descripcion: nuevaActividad.Descripcion,
          Fechayhora_Inicio: nuevaActividad.Fechayhora_Inicio,
          Fechayhora_Fin: nuevaActividad.Fechayhora_Fin,
          Valor: nuevaActividad.Valor,
          Cod_secciones: selectedSeccion?.Cod_secciones || '',
          Cod_seccion_asignatura: selectedAsignatura?.Cod_seccion_asignatura || ''
      };

      const response = await fetch('http://localhost:4000/api/actividadesAcademicas/registrar', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify(actividadData),
      });

      const responseData = await response.json();

      if (response.ok) {
          Swal.fire({
              icon: 'success',
              title: '¡Éxito!',
              text: 'La actividad se ha creado correctamente.',
          });
          setModalVisible(false);

          // Actualiza la lista de actividades con la nueva lista del backend
          setActividades(responseData.actividades);
      } else {
          Swal.fire('Error', `Problema al crear actividad: ${responseData.mensaje}`, 'error');
      }
  } catch (error) {
      console.error('Error al crear la actividad', error);
      Swal.fire('Error', 'Error en el servidor al crear la actividad', 'error');
  }
};




  




const handleActualizarActividad = async () => {
  try {
    const actividadData = {
      Cod_profesor: actividadToUpdate.Cod_profesor,
      Cod_ponderacion_ciclo: actividadToUpdate.Cod_ponderacion_ciclo,
      Cod_parcial: actividadToUpdate.Cod_parcial,
      Nombre_actividad_academica: actividadToUpdate.Nombre_actividad_academica,
      Descripcion: actividadToUpdate.Descripcion,
      Fechayhora_Inicio: actividadToUpdate.Fechayhora_Inicio,
      Fechayhora_Fin: actividadToUpdate.Fechayhora_Fin,
      Valor: actividadToUpdate.Valor,
      Cod_secciones: actividadToUpdate.Cod_secciones,
      Cod_seccion_asignatura: actividadToUpdate.Cod_seccion_asignatura,
    };

    const response = await fetch(
      `http://localhost:4000/api/actividadesAcademicas/actualizar/${actividadToUpdate.Cod_actividad_academica}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(actividadData),
      }
    );

    if (response.ok) {
      Swal.fire({
        icon: "success",
        title: "¡Éxito!",
        text: "La actividad se ha actualizado correctamente.",
      });
      setUpdateModalVisible(false);

      // Actualiza la tabla llamando a fetchActividades
      if (selectedProfesor && selectedAsignatura) {
        await fetchActividades(
          selectedProfesor.Cod_profesor,
          selectedAsignatura.Cod_seccion_asignatura
        );
      }
    } else {
      const errorData = await response.json();
      Swal.fire(
        "Error",
        `Problema al actualizar actividad: ${errorData.mensaje}`,
        "error"
      );
    }
  } catch (error) {
    console.error("Error al actualizar la actividad", error);
    Swal.fire("Error", "Hubo un problema al actualizar la actividad.", "error");
  }
};












const handleEliminarActividad = async (Cod_actividad_academica) => {
  try {
    // Confirmación antes de eliminar
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: '¡No podrás revertir esto!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminarlo',
    });

    if (result.isConfirmed) {
      // Realiza la solicitud DELETE
      const response = await fetch('http://localhost:4000/api/actividadesAcademicas/eliminarActividad', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ Cod_actividad_academica }),
      });

      if (response.ok) {
        Swal.fire('¡Eliminado!', 'La actividad académica ha sido eliminada.', 'success');
        onCreate(); // Actualiza la lista de actividades
      } else {
        console.error('Error al eliminar la actividad académica');
        Swal.fire('Error', 'Hubo un problema al eliminar la actividad académica', 'error');
      }
    }
  } catch (error) {
    console.error('Error al eliminar la actividad académica:', error);
    Swal.fire('Error', 'Hubo un problema al eliminar la actividad académica.', 'error');
  }
};





  
  return (
    <CContainer>
      {/* Tabla de Profesores */}
      {!selectedProfesor && (
        <div>
          <h2>Gestion Actividades Académicas</h2>
          <CTable striped>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>Nombre del Profesor</CTableHeaderCell>
                <CTableHeaderCell>Acciones</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {profesores.map((profesor) => (
                <CTableRow key={profesor.Cod_profesor}>
                  <CTableDataCell>{getNombreCompleto(profesor.cod_persona)}</CTableDataCell>
                  <CTableDataCell>
                    <CButton color="primary" onClick={() => handleVerSecciones(profesor)}>
                      Gestionar Secciones
                    </CButton>
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
        </div>
      )}

      {/* Tabla de Secciones */}
      {selectedProfesor && !selectedSeccion && (
        <div>
          <h2>Secciones de {getNombreCompleto(selectedProfesor.cod_persona)}</h2>
          <CButton color="secondary" onClick={() => setSelectedProfesor(null)}>Regresar a Profesores</CButton>
          <CTable striped>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>Nombre de la Sección</CTableHeaderCell>
                <CTableHeaderCell>Grado</CTableHeaderCell>
                <CTableHeaderCell>Año Académico</CTableHeaderCell>
                <CTableHeaderCell>Acciones</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {secciones.length > 0 ? (
                secciones.map((seccion) => (
                  <CTableRow key={seccion.Cod_secciones}>
                    <CTableDataCell>{seccion.Nombre_seccion}</CTableDataCell>
                    <CTableDataCell>{seccion.Nombre_grado}</CTableDataCell>
                    <CTableDataCell>{seccion.Anio_academico}</CTableDataCell>
                    <CTableDataCell>
                      <CButton color="success" onClick={() => handleVerAsignaturas(seccion)}>
                        Gestionar Asignaturas
                      </CButton>
                    </CTableDataCell>
                  </CTableRow>
                ))
              ) : (
                <CTableRow>
                  <CTableDataCell colSpan="4">No se encontraron secciones para este profesor.</CTableDataCell>
                </CTableRow>
              )}
            </CTableBody>
          </CTable>
        </div>
      )}

      {/* Tabla de Asignaturas */}
      {selectedSeccion && !selectedAsignatura && (
        <div>
          <h2>Asignaturas de {selectedSeccion.Nombre_seccion}</h2>
          <CButton color="secondary" onClick={() => setSelectedSeccion(null)}>Regresar a Secciones</CButton>
          <CTable striped>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>Nombre de la Asignatura</CTableHeaderCell>
                <CTableHeaderCell>Descripción</CTableHeaderCell>
                <CTableHeaderCell>Acciones</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {asignaturas.length > 0 ? (
                asignaturas.map((asignatura) => (
                  <CTableRow key={asignatura.Cod_asignatura}>
                    <CTableDataCell>{asignatura.Nombre_asignatura}</CTableDataCell>
                    <CTableDataCell>{asignatura.Descripcion_asignatura}</CTableDataCell>
                    <CTableDataCell>
                      <CButton color="success" onClick={() => handleVerActividades(asignatura)}>
                        Gestionar Actividades
                      </CButton>
                    </CTableDataCell>
                  </CTableRow>
                ))
              ) : (
                <CTableRow>
                  <CTableDataCell colSpan="3">No se encontraron asignaturas para esta sección.</CTableDataCell>
                </CTableRow>
              )}
            </CTableBody>
          </CTable>
        </div>
      )}






















      {/* Modal para Crear Actividad */}
      <CModal visible={modalVisible} backdrop="static" onClose={() => setModalVisible(false)}>
  <CModalHeader closeButton>
    <CModalTitle>Crear Nueva Actividad Académica</CModalTitle>
  </CModalHeader>
  <CModalBody>
  <CFormInput
            label="Código de Asignatura"
            value={nuevaActividad.Cod_asignatura}
            readOnly
          />
          <CFormInput
            label="Código de Sección"
            value={nuevaActividad.Cod_secciones}
            readOnly
          />
          <CFormInput
            label="Código de Profesor"
            value={nuevaActividad.Cod_profesor}
            readOnly
          />
          <CFormInput
            label="Código de Sección Asignatura"
            value={nuevaActividad.Cod_seccion_asignatura}
            readOnly
          />
    {/* Campos para ingresar los detalles de la actividad */}
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
      label="Ponderación"
      value={nuevaActividad.Cod_ponderacion_ciclo}
      onChange={(e) => setNuevaActividad({ ...nuevaActividad, Cod_ponderacion_ciclo: e.target.value })}
    >
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


















<CModal visible={updateModalVisible} backdrop="static" onClose={() => setUpdateModalVisible(false)}>
  <CModalHeader closeButton>
    <CModalTitle>Actualizar Actividad Académica</CModalTitle>
  </CModalHeader>
  <CModalBody>
    <CFormInput
      label="Código de Asignatura"
      value={actividadToUpdate?.Cod_asignatura || ''}
      readOnly
    />
    <CFormInput
      label="Código de Sección"
      value={actividadToUpdate?.Cod_secciones || ''}
      readOnly
    />
    <CFormInput
      label="Código de Profesor"
      value={actividadToUpdate?.Cod_profesor || ''}
      readOnly
    />
    <CFormInput
      label="Código de Sección Asignatura"
      value={actividadToUpdate?.Cod_seccion_asignatura || ''}
      readOnly
    />
    {/* Campos para editar los detalles de la actividad */}
    <CFormInput
      label="Nombre de la Actividad"
      value={actividadToUpdate?.Nombre_actividad_academica || ''}
      onChange={(e) =>
        setActividadToUpdate({ ...actividadToUpdate, Nombre_actividad_academica: e.target.value })
      }
    />
    <CFormInput
      label="Descripción"
      value={actividadToUpdate?.Descripcion || ''}
      onChange={(e) => setActividadToUpdate({ ...actividadToUpdate, Descripcion: e.target.value })}
    />
    <CFormInput
      label="Fecha y Hora de Inicio"
      type="datetime-local"
      value={actividadToUpdate?.Fechayhora_Inicio || ''}
      onChange={(e) => setActividadToUpdate({ ...actividadToUpdate, Fechayhora_Inicio: e.target.value })}
    />
    <CFormInput
      label="Fecha y Hora de Fin"
      type="datetime-local"
      value={actividadToUpdate?.Fechayhora_Fin || ''}
      onChange={(e) => setActividadToUpdate({ ...actividadToUpdate, Fechayhora_Fin: e.target.value })}
    />
    <CFormInput
      label="Valor"
      type="number"
      value={actividadToUpdate?.Valor || ''}
      onChange={(e) => setActividadToUpdate({ ...actividadToUpdate, Valor: e.target.value })}
    />
    <CFormSelect
      label="Ponderación"
      value={actividadToUpdate?.Cod_ponderacion_ciclo || ''}
      onChange={(e) =>
        setActividadToUpdate({ ...actividadToUpdate, Cod_ponderacion_ciclo: e.target.value })
      }
    >
      <option value="">Seleccione una ponderación</option>
      {listaponderaciones.map((ponderacion) => (
        <option key={ponderacion.Cod_ponderacion} value={ponderacion.Cod_ponderacion}>
          {ponderacion.Descripcion_ponderacion}
        </option>
      ))}
    </CFormSelect>
    <CFormSelect
      label="Parcial"
      value={actividadToUpdate?.Cod_parcial || ''}
      onChange={(e) => setActividadToUpdate({ ...actividadToUpdate, Cod_parcial: e.target.value })}
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
    <CButton color="secondary" onClick={() => setUpdateModalVisible(false)}>
      Cancelar
    </CButton>
    <CButton color="primary" onClick={handleActualizarActividad}>
      Actualizar
    </CButton>
  </CModalFooter>
</CModal>






















      {/* Tabla de Actividades Académicas */}
      {selectedAsignatura && (
        <div>


<CRow className='align-items-center mb-5'>
      <CCol xs="8" md="9"> 
       {/* Titulo de la pagina */}
      <h1 className="mb-0">Lista de Profesores</h1>
      </CCol>

      <CCol xs="4" md="3" className="text-end d-flex flex-column flex-md-row justify-content-md-end align-items-md-center">
      {/* Botón "Nuevo" alineado a la derecha */}
      {/* Botón "Nuevo" alineado a la derecha */}
      <CButton
        style={{ backgroundColor: '#4B6251', color: 'white' }} // Ajusta la altura para alinearlo con la barra de búsqueda
        className="mb-3 mb-md-0 me-md-3" // Margen inferior en pantallas pequeñas, margen derecho en pantallas grandes
        onClick={() => {abrirModalCrearActividad(true); 
          setHasUnsavedChanges(false); // Resetear el estado al abrir el modal
        }}
        >

           <CIcon icon={cilPlus} /> {/* Ícono de "más" */}
            Nuevo
           </CButton>

           
{/*Boton reporte */}
<CButton
            style={{ backgroundColor: '#6C8E58', color: 'white' }}
            onClick={() => setModalPDFVisible(true)} // Abre el modal de PDF
          >
            <CIcon icon={cilDescription} /> Reporte
          </CButton>
     </CCol>
      </CRow>


          <h2>Actividades de {selectedAsignatura.Nombre_asignatura}</h2>
          <CButton color="secondary" onClick={() => setSelectedAsignatura(null)}>Regresar a Asignaturas</CButton>
          
          <CTable striped>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>Nombre de la Actividad</CTableHeaderCell>
                <CTableHeaderCell>Descripción</CTableHeaderCell>
                <CTableHeaderCell>Valor</CTableHeaderCell>
                <CTableHeaderCell>Acciones</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
            {Array.isArray(actividades) && actividades.length > 0 ? (
  actividades.map((actividad) => (
    <CTableRow key={actividad.Cod_actividad_academica}>
      <CTableDataCell>{actividad.Nombre_actividad_academica}</CTableDataCell>
      <CTableDataCell>{actividad.Descripcion}</CTableDataCell>
      <CTableDataCell>{actividad.Valor}</CTableDataCell>
      <CTableDataCell>
        <CButton
          color="warning"
          onClick={() => abrirModalActualizarActividad(actividad)}
        >
          Editar
        </CButton>
        <CButton
          color="danger"
          className="ms-2"
          onClick={() => handleEliminarActividad(actividad.Cod_actividad_academica)}
        >
          Eliminar
        </CButton>
      </CTableDataCell>
    </CTableRow>
  ))
) : (
  <CTableRow>
    <CTableDataCell colSpan="4">No hay actividades disponibles para este profesor.</CTableDataCell>
  </CTableRow>
)}

            </CTableBody>
          </CTable>
        </div>
      )}
    </CContainer>
  );
};

export default VistaActividadesAcademicasAdmin;
