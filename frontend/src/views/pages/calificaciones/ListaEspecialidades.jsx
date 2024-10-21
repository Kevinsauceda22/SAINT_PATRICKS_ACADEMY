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

const ListaEspecialidades = () => {
  const [especialidades, setEspecialidades] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalUpdateVisible, setModalUpdateVisible] = useState(false);
  const [modalDeleteVisible, setModalDeleteVisible] = useState(false);
  const [modalReportVisible, setModalReportVisible] = useState(false); // Nuevo estado para el modal de Detalles
  const [nuevaEspecialidad, setNuevaEspecialidad] = useState({
    Cod_Especialidad: '',
    Nombre_especialidad: ''
  });
  const [especialidadToUpdate, setEspecialidadToUpdate] = useState({});
  const [especialidadToDelete, setEspecialidadToDelete] = useState({});
  const [especialidadToReport, setEspecialidadToReport] = useState({}); // Nuevo estado para la especialidad seleccionada para Detalles
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchEspecialidades();
  }, []);

  const fetchEspecialidades = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/especialidades/verespecialidades');
      const data = await response.json();
      setEspecialidades(data);
    } catch (error) {
      console.error('Error al obtener las especialidades:', error);
    }
  };

  const handleCreateEspecialidad = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/especialidades/crearespecialidad', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(nuevaEspecialidad),
      });

      if (response.ok) {
        fetchEspecialidades();
        setModalVisible(false);
        setNuevaEspecialidad({
          Cod_Especialidad: '',
          Nombre_especialidad: ''
        });
      } else {
        console.error('Error al crear la especialidad:', response.statusText);
      }
    } catch (error) {
      console.error('Error al crear la especialidad:', error);
    }
  };

  const handleUpdateEspecialidad = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/especialidades/actualizarespecialidad', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(especialidadToUpdate),
      });

      if (response.ok) {
        fetchEspecialidades();
        setModalUpdateVisible(false);
        setEspecialidadToUpdate({});
      } else {
        console.error('Error al actualizar la especialidad:', response.statusText);
      }
    } catch (error) {
      console.error('Error al actualizar la especialidad:', error);
    }
  };

  const handleDeleteEspecialidad = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/especialidades/eliminarespecialidad', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ Cod_Especialidad: especialidadToDelete.Cod_Especialidad }),
      });

      if (response.ok) {
        fetchEspecialidades();
        setModalDeleteVisible(false);
        setEspecialidadToDelete({});
      } else {
        console.error('Error al eliminar la especialidad:', response.statusText);
      }
    } catch (error) {
      console.error('Error al eliminar la especialidad:', error);
    }
  };

  // Filtrar especialidades según el término de búsqueda
  const filteredEspecialidades = especialidades.filter((especialidad) =>
    Object.values(especialidad).some((valor) =>
      String(valor).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <CContainer>
      <h1>Lista de Especialidades</h1>

      <CInputGroup style={{ marginBottom: '20px', width: '400px', float: 'right' }}>
        <CInputGroupText>Buscar</CInputGroupText>
        <CFormInput
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </CInputGroup>

      <CButton color="success" onClick={() => setModalVisible(true)} style={{ color: 'white',marginBottom: '20px' }}>
        Crear Especialidad
      </CButton>

      <CTable striped bordered hover>
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell>#</CTableHeaderCell>
            <CTableHeaderCell>Código Especialidad</CTableHeaderCell>
            <CTableHeaderCell>Nombre Especialidad</CTableHeaderCell>
            <CTableHeaderCell>Acciones</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {filteredEspecialidades.map((especialidad, index) => (
            <CTableRow key={especialidad.Cod_Especialidad}>
              <CTableDataCell>{index + 1}</CTableDataCell>
              <CTableDataCell>{especialidad.Cod_Especialidad}</CTableDataCell>
              <CTableDataCell>{especialidad.Nombre_especialidad}</CTableDataCell>
              <CTableDataCell>
                <CButton
                  color="info" style={{ marginRight: '10px' }}
                  onClick={() => {
                    setEspecialidadToUpdate(especialidad);
                    setModalUpdateVisible(true);
                  }}
                >
                  <CIcon icon={cilPen} />
                </CButton>
                <CButton
                  color="danger" style={{ marginRight: '10px' }}
                  onClick={() => {
                    setEspecialidadToDelete(especialidad);
                    setModalDeleteVisible(true);
                  }}
                >
                  <CIcon icon={cilTrash} />
                </CButton>
                <CButton
                  color="primary" style={{ marginRight: '10px' }}
                  onClick={() => {
                    setEspecialidadToReport(especialidad);
                    setModalReportVisible(true);
                  }}
                >
                  Detalles
                </CButton>
              </CTableDataCell>
            </CTableRow>
          ))}
        </CTableBody>
      </CTable>

      {/* Modal Crear */}
      <CModal visible={modalVisible} onClose={() => setModalVisible(false)}>
        <CModalHeader>
          <CModalTitle>Crear Nueva Especialidad</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {Object.keys(nuevaEspecialidad).map((key) => (
            <CInputGroup className="mb-3" key={key}>
              <CInputGroupText>{key.replace(/_/g, ' ')}</CInputGroupText>
              <CFormInput
                value={nuevaEspecialidad[key]}
                onChange={(e) => setNuevaEspecialidad({ ...nuevaEspecialidad, [key]: e.target.value })}
              />
            </CInputGroup>
          ))}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setModalVisible(false)}>
            Cancelar
          </CButton>
          <CButton color="success" style={{ color: 'white' }} onClick={handleCreateEspecialidad}>
            Crear Especialidad
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Modal Actualizar */}
      <CModal visible={modalUpdateVisible} onClose={() => setModalUpdateVisible(false)}>
        <CModalHeader>
          <CModalTitle>Actualizar Especialidad</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {Object.keys(especialidadToUpdate).map((key) => (
            <CInputGroup className="mb-3" key={key}>
              <CInputGroupText>{key.replace(/_/g, ' ')}</CInputGroupText>
              <CFormInput
                value={especialidadToUpdate[key]}
                onChange={(e) => setEspecialidadToUpdate({ ...especialidadToUpdate, [key]: e.target.value })}
              />
            </CInputGroup>
          ))}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setModalUpdateVisible(false)}>
            Cancelar
          </CButton>
          <CButton color="info" style={{ color: 'white' }} onClick={handleUpdateEspecialidad}>
            Actualizar Especialidad
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Modal Eliminar */}
      <CModal visible={modalDeleteVisible} onClose={() => setModalDeleteVisible(false)}>
        <CModalHeader>
          <CModalTitle>Eliminar Especialidad</CModalTitle>
        </CModalHeader>
        <CModalBody>
        <p>¿Estás seguro de que deseas eliminar esta especialidad: <strong>{especialidadToDelete.Nombre_especialidad }</strong>?</p>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setModalDeleteVisible(false)}>
            Cancelar
          </CButton>
          <CButton color="danger" style={{ color: 'white' }} onClick={handleDeleteEspecialidad}>
            Eliminar Especialidad
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Modal Detalles */}
      <CModal visible={modalReportVisible} onClose={() => setModalReportVisible(false)}>
        <CModalHeader>
          <CModalTitle>Detalles de Especialidad</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <p><strong>Código Especialidad:</strong> {especialidadToReport.Cod_Especialidad}</p>
          <p><strong>Nombre Especialidad:</strong> {especialidadToReport.Nombre_especialidad}</p>
          <p><strong>Detalles adicionales...</strong></p>
          {/* Agrega más detalles del Detalles si es necesario */}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setModalReportVisible(false)}>
            Cerrar
          </CButton>
        </CModalFooter>
      </CModal>
    </CContainer>
  );
};

export default ListaEspecialidades;
