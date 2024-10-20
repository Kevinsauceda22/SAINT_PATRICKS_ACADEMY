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
import { cilPen, cilTrash } from '@coreui/icons';
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
      const response = await fetch('http://localhost:4000/api/actividadesAcademicas/actualizarActividadAcademica', {
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
      const response = await fetch('http://localhost:4000/api/actividadesAcademicas/eliminarActividadAcademica', {
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

  // Filtrar actividades según el término de búsqueda
  const filteredActividades = actividades.filter((actividad) =>
    Object.values(actividad).some((valor) =>
      String(valor).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <CContainer>
      <h1>Mantenimiento Actividades Académicas</h1>

      <CInputGroup style={{ marginBottom: '20px', width: '400px', float: 'right' }}>
        <CInputGroupText>Buscar</CInputGroupText>
        <CFormInput
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </CInputGroup>

      <CButton color="success" onClick={() => setModalVisible(true)} style={{ marginBottom: '20px', color: 'white' }}>
        Nueva
      </CButton>

      <CTable striped bordered hover>
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell>#</CTableHeaderCell>
            <CTableHeaderCell>Código Actividad</CTableHeaderCell>
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
              <CTableDataCell>{actividad.Cod_actividad_academica}</CTableDataCell>
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
                  D
                </CButton>
              </CTableDataCell>
            </CTableRow>
          ))}
        </CTableBody>
      </CTable>

      {/* Modal Detalles */}
      <CModal visible={modalReporteVisible} onClose={() => setModalReporteVisible(false)}>
        <CModalHeader>
          <CModalTitle>Detalles de Actividad Académica</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <h5>Detalles de la Actividad:</h5>
          <p><strong>Código:</strong> {actividadToReportar.Cod_actividad_academica}</p>
          <p><strong>Código Profesor:</strong> {actividadToReportar.Cod_profesor}</p>
          <p><strong>Código Ponderacion:</strong> {actividadToReportar.Cod_ponderacion_ciclo }</p>
          <p><strong>Código Parcial:</strong> {actividadToReportar.Cod_parcial}</p>
          <p><strong>Nombre:</strong> {actividadToReportar.Nombre_actividad_academica}</p>
          <p><strong>Descripción:</strong> {actividadToReportar.Descripcion}</p>
          <p><strong>Fechas:</strong> {`${new Date(actividadToReportar.Fechayhora_Inicio).toLocaleString()} - ${new Date(actividadToReportar.Fechayhora_Fin).toLocaleString()}`}</p>
          <p><strong>Valor:</strong> {actividadToReportar.Valor}</p>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setModalReporteVisible(false)}>
            Cerrar
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Modal Crear */}
      <CModal visible={modalVisible} onClose={() => setModalVisible(false)}>
        <CModalHeader>
          <CModalTitle>Crear Actividad Académica</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CInputGroup className="mb-3">
              <CInputGroupText>Nombre</CInputGroupText>
              <CFormInput
                value={nuevoActividad.Nombre_actividad_academica}
                onChange={(e) => setNuevoActividad({ ...nuevoActividad, Nombre_actividad_academica: e.target.value })}
              />
            </CInputGroup>
            <CInputGroup className="mb-3">
              <CInputGroupText>Descripción</CInputGroupText>
              <CFormInput
                value={nuevoActividad.Descripcion}
                onChange={(e) => setNuevoActividad({ ...nuevoActividad, Descripcion: e.target.value })}
              />
            </CInputGroup>
            <CInputGroup className="mb-3">
              <CInputGroupText>Valor</CInputGroupText>
              <CFormInput
                type="number"
                value={nuevoActividad.Valor}
                onChange={(e) => setNuevoActividad({ ...nuevoActividad, Valor: e.target.value })}
              />
            </CInputGroup>
            <CInputGroup className="mb-3">
              <CInputGroupText>Fecha y Hora Inicio</CInputGroupText>
              <CFormInput
                type="datetime-local"
                value={nuevoActividad.Fechayhora_Inicio}
                onChange={(e) => setNuevoActividad({ ...nuevoActividad, Fechayhora_Inicio: e.target.value })}
              />
            </CInputGroup>
            <CInputGroup className="mb-3">
              <CInputGroupText>Fecha y Hora Fin</CInputGroupText>
              <CFormInput
                type="datetime-local"
                value={nuevoActividad.Fechayhora_Fin}
                onChange={(e) => setNuevoActividad({ ...nuevoActividad, Fechayhora_Fin: e.target.value })}
              />
            </CInputGroup>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setModalVisible(false)}>
            Cancelar
          </CButton>
          <CButton color="success" style={{ color: 'white' }} onClick={handleCreateActividad}>
            Crear Actividad Académica
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Modal Actualizar */}
      <CModal visible={modalUpdateVisible} onClose={() => setModalUpdateVisible(false)}>
        <CModalHeader>
          <CModalTitle>Actualizar Actividad Académica</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CInputGroup className="mb-3">
              <CInputGroupText>Nombre</CInputGroupText>
              <CFormInput
                value={actividadToUpdate.Nombre_actividad_academica}
                onChange={(e) => setActividadToUpdate({ ...actividadToUpdate, Nombre_actividad_academica: e.target.value })}
              />
            </CInputGroup>
            <CInputGroup className="mb-3">
              <CInputGroupText>Descripción</CInputGroupText>
              <CFormInput
                value={actividadToUpdate.Descripcion}
                onChange={(e) => setActividadToUpdate({ ...actividadToUpdate, Descripcion: e.target.value })}
              />
            </CInputGroup>
            <CInputGroup className="mb-3">
              <CInputGroupText>Valor</CInputGroupText>
              <CFormInput
                type="number"
                value={actividadToUpdate.Valor}
                onChange={(e) => setActividadToUpdate({ ...actividadToUpdate, Valor: e.target.value })}
              />
            </CInputGroup>
            <CInputGroup className="mb-3">
              <CInputGroupText>Fecha y Hora Inicio</CInputGroupText>
              <CFormInput
                type="datetime-local"
                value={actividadToUpdate.Fechayhora_Inicio}
                onChange={(e) => setActividadToUpdate({ ...actividadToUpdate, Fechayhora_Inicio: e.target.value })}
              />
            </CInputGroup>
            <CInputGroup className="mb-3">
              <CInputGroupText>Fecha y Hora Fin</CInputGroupText>
              <CFormInput
                type="datetime-local"
                value={actividadToUpdate.Fechayhora_Fin}
                onChange={(e) => setActividadToUpdate({ ...actividadToUpdate, Fechayhora_Fin: e.target.value })}
              />
            </CInputGroup>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setModalUpdateVisible(false)}>
            Cancelar
          </CButton>
          <CButton color="info" style={{ color: 'white' }} onClick={handleUpdateActividad}>
            Actualizar Actividad Académica
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Modal Eliminar */}
      <CModal visible={modalDeleteVisible} onClose={() => setModalDeleteVisible(false)}>
        <CModalHeader>
          <CModalTitle>Eliminar Actividad Académica</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <p>¿Estás seguro de que deseas eliminar la actividad académica: <strong>{actividadToDelete.Nombre_actividad_academica}</strong>?</p>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setModalDeleteVisible(false)}>
            Cancelar
          </CButton>
          <CButton color="danger" style={{ color: 'white' }} onClick={handleDeleteActividad}>
            Eliminar Actividad Académica
          </CButton>
        </CModalFooter>
      </CModal>
    </CContainer>
  );
};

export default ListaActividadesAca;
