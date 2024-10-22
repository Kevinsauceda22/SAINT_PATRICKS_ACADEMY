import React, { useEffect, useState } from 'react';
import {
  CButton,
  CCard,
  CCardBody,
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
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
} from '@coreui/react';
import { cilInfo, cilPen, cilTrash } from '@coreui/icons';
import CIcon from '@coreui/icons-react';

const ListaActividadesAca = () => {
  const [actividades, setActividades] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalUpdateVisible, setModalUpdateVisible] = useState(false);
  const [modalDeleteVisible, setModalDeleteVisible] = useState(false);
  const [modalReporteVisible, setModalReporteVisible] = useState(false);
  const [nuevoActividad, setNuevoActividad] = useState({
    Cod_profesor: '',
    Cod_ponderacion_ciclo: '',
    Cod_parcial: '',
    Nombre_actividad_academica: '',
    Descripcion: '',
    Fechayhora_Inicio: '',
    Fechayhora_Fin: '',
    Valor: ''
  });
  const [actividadToUpdate, setActividadToUpdate] = useState({});
  const [actividadToDelete, setActividadToDelete] = useState({});
  const [actividadToReportar, setActividadToReportar] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchActividades();
  }, []);

  const fetchActividades = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/actividadesAcademicas/veractividades');
      const data = await response.json();
      setActividades(data);
    } catch (error) {
      console.error('Error al obtener las actividades académicas:', error);
    }
  };

  const handleCreateActividad = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/actividadesAcademicas/crearactividadacademica', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(nuevoActividad),
      });

      if (response.ok) {
        fetchActividades();
        setModalVisible(false);
        setNuevoActividad({
          Cod_profesor: '',
          Cod_ponderacion_ciclo: '',
          Cod_parcial: '',
          Nombre_actividad_academica: '',
          Descripcion: '',
          Fechayhora_Inicio: '',
          Fechayhora_Fin: '',
          Valor: ''
        });
      } else {
        console.error('Error al crear la actividad académica:', response.statusText);
      }
    } catch (error) {
      console.error('Error al crear la actividad académica:', error);
    }
  };

  const handleUpdateActividad = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/actividadesAcademicas/actualizaractividad', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(actividadToUpdate),
      });

      if (response.ok) {
        fetchActividades();
        setModalUpdateVisible(false);
        setActividadToUpdate({});
      } else {
        console.error('Error al actualizar la actividad académica:', response.statusText);
      }
    } catch (error) {
      console.error('Error al actualizar la actividad académica:', error);
    }
  };

  const handleDeleteActividad = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/actividadesAcademicas/eliminarActividad', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ Cod_actividad_academica: actividadToDelete.Cod_actividad_academica }),
      });

      if (response.ok) {
        fetchActividades();
        setModalDeleteVisible(false);
        setActividadToDelete({});
      } else {
        console.error('Error al eliminar la actividad académica:', response.statusText);
      }
    } catch (error) {
      console.error('Error al eliminar la actividad académica:', error);
    }
  };

  const filteredActividades = actividades.filter((actividad) =>
    Object.values(actividad).some((valor) =>
      String(valor).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <CContainer>
      <h1>Mantenimiento de Actividades Académicas</h1>

      <CInputGroup style={{ marginBottom: '20px', width: '400px', float: 'right' }}>
        <CInputGroupText>Buscar</CInputGroupText>
        <CFormInput
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </CInputGroup>

      <CButton color="success" onClick={() => setModalVisible(true)} style={{ marginBottom: '20px', color: 'white' }}>
        Nuevo
      </CButton>

      <CTable striped bordered hover>
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell>#</CTableHeaderCell>
            <CTableHeaderCell>Nombre</CTableHeaderCell>
            <CTableHeaderCell>Descripción</CTableHeaderCell>
            <CTableHeaderCell>Fechas</CTableHeaderCell>
            <CTableHeaderCell>Valor</CTableHeaderCell>
            <CTableHeaderCell>Acciones</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {filteredActividades.map((actividad, index) => (
            <CTableRow key={actividad.Cod_actividad_academica}>
              <CTableDataCell>{index + 1}</CTableDataCell>
              <CTableDataCell>{actividad.Nombre_actividad_academica}</CTableDataCell>
              <CTableDataCell>{actividad.Descripcion}</CTableDataCell>
              <CTableDataCell>
                {`${new Date(actividad.Fechayhora_Inicio).toLocaleString()} - ${new Date(actividad.Fechayhora_Fin).toLocaleString()}`}
              </CTableDataCell>
              <CTableDataCell>{actividad.Valor}</CTableDataCell>
              <CTableDataCell>
                <CButton
                  color="info" style={{ marginRight: '10px', marginBottom: '10px' }}
                  onClick={() => {
                    setActividadToUpdate(actividad);
                    setModalUpdateVisible(true);
                  }}
                >
                  <CIcon icon={cilPen} />
                </CButton>
                <CButton
                  color="danger" style={{ marginRight: '10px', marginBottom: '10px' }}
                  onClick={() => {
                    setActividadToDelete(actividad);
                    setModalDeleteVisible(true);
                  }}
                >
                  <CIcon icon={cilTrash} />
                </CButton>
                <CButton
                  color="primary" style={{ marginRight: '10px', marginBottom: '10px' }}
                  onClick={() => {
                    setActividadToReportar(actividad);
                    setModalReporteVisible(true);
                  }}
                >
                  <CIcon icon={cilInfo} />
                </CButton>
              </CTableDataCell>
            </CTableRow>
          ))}
        </CTableBody>
      </CTable>

      {/* Modal Detalles */}
      <CModal visible={modalReporteVisible} onClose={() => setModalReporteVisible(false)} backdrop="static">
        <CModalHeader>
          <CModalTitle>Detalles de Actividad Académica</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <h5>Detalles de la Actividad:</h5>
          <p><strong>Código:</strong> {actividadToReportar.Cod_actividad_academica}</p>
          <p><strong>Código Profesor:</strong> {actividadToReportar.Cod_profesor}</p>
          <p><strong>Código Ponderacion:</strong> {actividadToReportar.Cod_ponderacion_ciclo}</p>
          <p><strong>Código Parcial:</strong> {actividadToReportar.Cod_parcial}</p>
          <p><strong>Nombre:</strong> {actividadToReportar.Nombre_actividad_academica}</p>
          <p><strong>Descripción:</strong> {actividadToReportar.Descripcion}</p>
          <p><strong>Fechas:</strong> {`${new Date(actividadToReportar.Fechayhora_Inicio).toLocaleString()} - ${new Date(actividadToReportar.Fechayhora_Fin).toLocaleString()}`}</p>
          <p><strong>Valor:</strong> {actividadToReportar.Valor}</p>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setModalReporteVisible(false)}>Cerrar</CButton>
        </CModalFooter>
      </CModal>

      {/* Modal Crear Actividad */}
<CModal visible={modalVisible} onClose={() => setModalVisible(false)} backdrop="static">
  <CModalHeader>
    <CModalTitle>Crear Nueva Actividad Académica</CModalTitle>
  </CModalHeader>
  <CModalBody>
    <CForm>
      <CFormInput
        type="text"
        label="Código Profesor"
        value={nuevoActividad.Cod_profesor}
        onChange={(e) => setNuevoActividad({ ...nuevoActividad, Cod_profesor: e.target.value })}
      />
      <CFormInput
        type="text"
        label="Código Ponderación Ciclo"
        value={nuevoActividad.Cod_ponderacion_ciclo}
        onChange={(e) => setNuevoActividad({ ...nuevoActividad, Cod_ponderacion_ciclo: e.target.value })}
      />
      <CFormInput
        type="text"
        label="Código Parcial"
        value={nuevoActividad.Cod_parcial}
        onChange={(e) => setNuevoActividad({ ...nuevoActividad, Cod_parcial: e.target.value })}
      />
      <CFormInput
        type="text"
        label="Nombre de la Actividad"
        value={nuevoActividad.Nombre_actividad_academica}
        onChange={(e) => setNuevoActividad({ ...nuevoActividad, Nombre_actividad_academica: e.target.value })}
      />
      <CFormInput
        type="text"
        label="Descripción"
        value={nuevoActividad.Descripcion}
        onChange={(e) => setNuevoActividad({ ...nuevoActividad, Descripcion: e.target.value })}
      />
      <CFormInput
        type="datetime-local"
        label="Fecha y Hora de Inicio"
        value={nuevoActividad.Fechayhora_Inicio}
        onChange={(e) => setNuevoActividad({ ...nuevoActividad, Fechayhora_Inicio: e.target.value })}
      />
      <CFormInput
        type="datetime-local"
        label="Fecha y Hora de Fin"
        value={nuevoActividad.Fechayhora_Fin}
        onChange={(e) => setNuevoActividad({ ...nuevoActividad, Fechayhora_Fin: e.target.value })}
      />
      <CFormInput
        type="number"
        label="Valor"
        value={nuevoActividad.Valor}
        onChange={(e) => setNuevoActividad({ ...nuevoActividad, Valor: e.target.value })}
      />
    </CForm>
  </CModalBody>
  <CModalFooter>
    <CButton color="secondary" onClick={() => setModalVisible(false)}>Cerrar</CButton>
    <CButton color="success" onClick={handleCreateActividad}>Guardar</CButton>
  </CModalFooter>
</CModal>

      {/* Modal Actualizar Actividad */}
<CModal visible={modalUpdateVisible} onClose={() => setModalUpdateVisible(false)} backdrop="static">
  <CModalHeader>
    <CModalTitle>Actualizar Actividad Académica</CModalTitle>
  </CModalHeader>
  <CModalBody>
    <CForm>
      <CFormInput
        type="text"
        label="Código Profesor"
        value={actividadToUpdate.Cod_profesor}
        onChange={(e) => setActividadToUpdate({ ...actividadToUpdate, Cod_profesor: e.target.value })}
      />
      <CFormInput
        type="text"
        label="Código Ponderación Ciclo"
        value={actividadToUpdate.Cod_ponderacion_ciclo}
        onChange={(e) => setActividadToUpdate({ ...actividadToUpdate, Cod_ponderacion_ciclo: e.target.value })}
      />
      <CFormInput
        type="text"
        label="Código Parcial"
        value={actividadToUpdate.Cod_parcial}
        onChange={(e) => setActividadToUpdate({ ...actividadToUpdate, Cod_parcial: e.target.value })}
      />
      <CFormInput
        type="text"
        label="Nombre de la Actividad"
        value={actividadToUpdate.Nombre_actividad_academica}
        onChange={(e) => setActividadToUpdate({ ...actividadToUpdate, Nombre_actividad_academica: e.target.value })}
      />
      <CFormInput
        type="text"
        label="Descripción"
        value={actividadToUpdate.Descripcion}
        onChange={(e) => setActividadToUpdate({ ...actividadToUpdate, Descripcion: e.target.value })}
      />
      <CFormInput
        type="datetime-local"
        label="Fecha y Hora de Inicio"
        value={actividadToUpdate.Fechayhora_Inicio}
        onChange={(e) => setActividadToUpdate({ ...actividadToUpdate, Fechayhora_Inicio: e.target.value })}
      />
      <CFormInput
        type="datetime-local"
        label="Fecha y Hora de Fin"
        value={actividadToUpdate.Fechayhora_Fin}
        onChange={(e) => setActividadToUpdate({ ...actividadToUpdate, Fechayhora_Fin: e.target.value })}
      />
      <CFormInput
        type="number"
        label="Valor"
        value={actividadToUpdate.Valor}
        onChange={(e) => setActividadToUpdate({ ...actividadToUpdate, Valor: e.target.value })}
      />
    </CForm>
  </CModalBody>
  <CModalFooter>
    <CButton color="secondary" onClick={() => setModalUpdateVisible(false)}>Cerrar</CButton>
    <CButton color="success" onClick={handleUpdateActividad}>Actualizar</CButton>
  </CModalFooter>
</CModal>


      {/* Modal Eliminar Actividad */}
      <CModal visible={modalDeleteVisible} onClose={() => setModalDeleteVisible(false)} backdrop="static">
        <CModalHeader>
          <CModalTitle>Eliminar Actividad Académica</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <p>¿Estás seguro de que deseas eliminar esta actividad académica?</p>
          <p><strong>{actividadToDelete.Nombre_actividad_academica}</strong></p>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setModalDeleteVisible(false)}>Cancelar</CButton>
          <CButton color="danger" onClick={handleDeleteActividad}>Eliminar</CButton>
        </CModalFooter>
      </CModal>
    </CContainer>
  );
};

export default ListaActividadesAca;
