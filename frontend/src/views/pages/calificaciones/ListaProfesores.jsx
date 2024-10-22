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

const ListaProfesores = () => {
  const [profesores, setProfesores] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalUpdateVisible, setModalUpdateVisible] = useState(false);
  const [modalDeleteVisible, setModalDeleteVisible] = useState(false);
  const [modalDetailsVisible, setModalDetailsVisible] = useState(false);
  const [nuevoProfesor, setNuevoProfesor] = useState({
    Cod_profesor: '',
    Cod_persona: '',
    Cod_grado_academico: '',
    Cod_tipo_contrato: '',
    Hora_entrada: '',
    Hora_salida: '',
    Fecha_ingreso: '',
    Fecha_fin_contrato: '',
    Años_experiencia: '',
  });
  const [profesorToUpdate, setProfesorToUpdate] = useState({});
  const [profesorToDelete, setProfesorToDelete] = useState({});
  const [profesorDetails, setProfesorDetails] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchProfesores();
  }, []);

  const fetchProfesores = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/profesores/verprofesores');
      const data = await response.json();
      setProfesores(data);
    } catch (error) {
      console.error('Error al obtener los profesores:', error);
    }
  };

  const handleCreateProfesor = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/profesores/crearprofesor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(nuevoProfesor),
      });

      if (response.ok) {
        fetchProfesores();
        setModalVisible(false);
        setNuevoProfesor({
          Cod_profesor: '',
          Cod_persona: '',
          Cod_grado_academico: '',
          Cod_tipo_contrato: '',
          Hora_entrada: '',
          Hora_salida: '',
          Fecha_ingreso: '',
          Fecha_fin_contrato: '',
          Años_experiencia: '',
        });
      } else {
        console.error('Error al crear el profesor:', response.statusText);
      }
    } catch (error) {
      console.error('Error al crear el profesor:', error);
    }
  };

  const handleUpdateProfesor = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/profesores/actualizarprofesor', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profesorToUpdate),
      });

      if (response.ok) {
        fetchProfesores();
        setModalUpdateVisible(false);
        setProfesorToUpdate({});
      } else {
        console.error('Error al actualizar el profesor:', response.statusText);
      }
    } catch (error) {
      console.error('Error al actualizar el profesor:', error);
    }
  };

  const handleDeleteProfesor = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/profesores/eliminarprofesor', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ Cod_profesor: profesorToDelete.Cod_profesor }),
      });

      if (response.ok) {
        fetchProfesores();
        setModalDeleteVisible(false);
        setProfesorToDelete({});
      } else {
        console.error('Error al eliminar el profesor:', response.statusText);
      }
    } catch (error) {
      console.error('Error al eliminar el profesor:', error);
    }
  };

  // Filtrar profesores según el término de búsqueda
  const filteredProfesores = profesores.filter((profesor) =>
    Object.values(profesor).some((valor) =>
      String(valor).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleShowDetails = (profesor) => {
    setProfesorDetails(profesor);
    setModalDetailsVisible(true);
  };

  return (
    <CContainer>
      <h1>Lista de Profesores</h1>

      <CInputGroup style={{ marginBottom: '20px', width: '300px', float: 'right' }}>
        <CInputGroupText>Buscar</CInputGroupText>
        <CFormInput
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </CInputGroup>

      <CButton color="success" onClick={() => setModalVisible(true)} style={{ color: 'white',marginBottom: '20px' }}>
        Crear Profesor
      </CButton>

      <CTable striped bordered hover>
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell>#</CTableHeaderCell>
            <CTableHeaderCell>Nombre </CTableHeaderCell>
            <CTableHeaderCell>Grado Académico</CTableHeaderCell>
            <CTableHeaderCell>Tipo de Contrato</CTableHeaderCell>
            <CTableHeaderCell>Hora Entrada</CTableHeaderCell>
            <CTableHeaderCell>Hora Salida</CTableHeaderCell>
            <CTableHeaderCell>Fecha Ingreso</CTableHeaderCell>
            <CTableHeaderCell>Fecha Fin Contrato</CTableHeaderCell>
            <CTableHeaderCell>Años de Experiencia</CTableHeaderCell>
            <CTableHeaderCell>Acciones</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {filteredProfesores.map((profesor, index) => (
            <CTableRow key={profesor.Cod_profesor}>
              <CTableDataCell>{index + 1}</CTableDataCell>
              <CTableDataCell>{profesor.Nombre} {profesor.Primer_apellido}</CTableDataCell>
              <CTableDataCell>{profesor.GradoAcademicoDescripcion}</CTableDataCell>
              <CTableDataCell>{profesor.TipoContratoDescripcion}</CTableDataCell>
              <CTableDataCell>{profesor.Hora_entrada}</CTableDataCell>
              <CTableDataCell>{profesor.Hora_salida}</CTableDataCell>
              <CTableDataCell>{new Date(profesor.Fecha_ingreso).toLocaleDateString()}</CTableDataCell>
              <CTableDataCell>{new Date(profesor.Fecha_fin_contrato).toLocaleDateString()}</CTableDataCell>
              <CTableDataCell>{profesor.Años_experiencia}</CTableDataCell>
              <CTableDataCell>
                <CButton
                  color="info" style={{ marginRight: '10px', marginBottom: '10px' }}
                  onClick={() => {
                    setProfesorToUpdate(profesor);
                    setModalUpdateVisible(true);
                  }}
                >
                  <CIcon icon={cilPen} />
                </CButton>
                <CButton
                  color="danger" style={{ marginRight: '10px', marginBottom: '10px' }}
                  onClick={() => {
                    setProfesorToDelete(profesor);
                    setModalDeleteVisible(true);
                  }}
                >
                  <CIcon icon={cilTrash} />
                </CButton>
                <CButton
                  color="primary" style={{ marginRight: '10px', marginBottom: '10px' }}
                  onClick={() => handleShowDetails(profesor)}
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
          <CModalTitle>Crear Profesor</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CInputGroup className="mb-3">
              <CInputGroupText>Código Persona</CInputGroupText>
              <CFormInput
                value={nuevoProfesor.Cod_persona}
                onChange={(e) => setNuevoProfesor({ ...nuevoProfesor, Cod_persona: e.target.value })}
              />
            </CInputGroup>
            <CInputGroup className="mb-3">
              <CInputGroupText>Grado Académico</CInputGroupText>
              <CFormInput
                value={nuevoProfesor.Cod_grado_academico}
                onChange={(e) => setNuevoProfesor({ ...nuevoProfesor, Cod_grado_academico: e.target.value })}
              />
            </CInputGroup>
            <CInputGroup className="mb-3">
              <CInputGroupText>Tipo de Contrato</CInputGroupText>
              <CFormInput
                value={nuevoProfesor.Cod_tipo_contrato}
                onChange={(e) => setNuevoProfesor({ ...nuevoProfesor, Cod_tipo_contrato: e.target.value })}
              />
            </CInputGroup>
            <CInputGroup className="mb-3">
              <CInputGroupText>Hora Entrada</CInputGroupText>
              <CFormInput
                type="time"
                value={nuevoProfesor.Hora_entrada}
                onChange={(e) => setNuevoProfesor({ ...nuevoProfesor, Hora_entrada: e.target.value })}
              />
            </CInputGroup>
            <CInputGroup className="mb-3">
              <CInputGroupText>Hora Salida</CInputGroupText>
              <CFormInput
                type="time"
                value={nuevoProfesor.Hora_salida}
                onChange={(e) => setNuevoProfesor({ ...nuevoProfesor, Hora_salida: e.target.value })}
              />
            </CInputGroup>
            <CInputGroup className="mb-3">
              <CInputGroupText>Fecha Ingreso</CInputGroupText>
              <CFormInput
                type="date"
                value={nuevoProfesor.Fecha_ingreso}
                onChange={(e) => setNuevoProfesor({ ...nuevoProfesor, Fecha_ingreso: e.target.value })}
              />
            </CInputGroup>
            <CInputGroup className="mb-3">
              <CInputGroupText>Fecha Fin Contrato</CInputGroupText>
              <CFormInput
                type="date"
                value={nuevoProfesor.Fecha_fin_contrato}
                onChange={(e) => setNuevoProfesor({ ...nuevoProfesor, Fecha_fin_contrato: e.target.value })}
              />
            </CInputGroup>
            <CInputGroup className="mb-3">
              <CInputGroupText>Años de Experiencia</CInputGroupText>
              <CFormInput
                type="number"
                value={nuevoProfesor.Años_experiencia}
                onChange={(e) => setNuevoProfesor({ ...nuevoProfesor, Años_experiencia: e.target.value })}
              />
            </CInputGroup>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setModalVisible(false)}>Cerrar</CButton>
          <CButton color="success" style={{ color: 'white' }} onClick={handleCreateProfesor}>Crear Profesor</CButton>
        </CModalFooter>
      </CModal>

      {/* Modal Actualizar */}
      <CModal visible={modalUpdateVisible} onClose={() => setModalUpdateVisible(false)}>
        <CModalHeader>
          <CModalTitle>Actualizar Profesor</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CInputGroup className="mb-3">
              <CInputGroupText>Código Persona</CInputGroupText>
              <CFormInput
                value={profesorToUpdate.Cod_persona}
                onChange={(e) => setProfesorToUpdate({ ...profesorToUpdate, Cod_persona: e.target.value })}
              />
            </CInputGroup>
            <CInputGroup className="mb-3">
              <CInputGroupText>Grado Académico</CInputGroupText>
              <CFormInput
                value={profesorToUpdate.Cod_grado_academico}
                onChange={(e) => setProfesorToUpdate({ ...profesorToUpdate, Cod_grado_academico: e.target.value })}
              />
            </CInputGroup>
            <CInputGroup className="mb-3">
              <CInputGroupText>Tipo de Contrato</CInputGroupText>
              <CFormInput
                value={profesorToUpdate.Cod_tipo_contrato}
                onChange={(e) => setProfesorToUpdate({ ...profesorToUpdate, Cod_tipo_contrato: e.target.value })}
              />
            </CInputGroup>
            <CInputGroup className="mb-3">
              <CInputGroupText>Hora Entrada</CInputGroupText>
              <CFormInput
                type="time"
                value={profesorToUpdate.Hora_entrada}
                onChange={(e) => setProfesorToUpdate({ ...profesorToUpdate, Hora_entrada: e.target.value })}
              />
            </CInputGroup>
            <CInputGroup className="mb-3">
              <CInputGroupText>Hora Salida</CInputGroupText>
              <CFormInput
                type="time"
                value={profesorToUpdate.Hora_salida}
                onChange={(e) => setProfesorToUpdate({ ...profesorToUpdate, Hora_salida: e.target.value })}
              />
            </CInputGroup>
            <CInputGroup className="mb-3">
              <CInputGroupText>Fecha Ingreso</CInputGroupText>
              <CFormInput
                type="date"
                value={profesorToUpdate.Fecha_ingreso}
                onChange={(e) => setProfesorToUpdate({ ...profesorToUpdate, Fecha_ingreso: e.target.value })}
              />
            </CInputGroup>
            <CInputGroup className="mb-3">
              <CInputGroupText>Fecha Fin Contrato</CInputGroupText>
              <CFormInput
                type="date"
                value={profesorToUpdate.Fecha_fin_contrato}
                onChange={(e) => setProfesorToUpdate({ ...profesorToUpdate, Fecha_fin_contrato: e.target.value })}
              />
            </CInputGroup>
            <CInputGroup className="mb-3">
              <CInputGroupText>Años de Experiencia</CInputGroupText>
              <CFormInput
                type="number"
                value={profesorToUpdate.Años_experiencia}
                onChange={(e) => setProfesorToUpdate({ ...profesorToUpdate, Años_experiencia: e.target.value })}
              />
            </CInputGroup>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setModalUpdateVisible(false)}>Cerrar</CButton>
          <CButton color="info" style={{ color: 'white' }} onClick={handleUpdateProfesor}>Actualizar Profesor</CButton>
        </CModalFooter>
      </CModal>

      {/* Modal Eliminar */}
      <CModal visible={modalDeleteVisible} onClose={() => setModalDeleteVisible(false)}>
        <CModalHeader>
          <CModalTitle>Eliminar Profesor</CModalTitle>
        </CModalHeader>
        <CModalBody>
          ¿Estás seguro de que deseas eliminar al profesor: <strong>{profesorToDelete.Nombre} {profesorToDelete.Primer_apellido}</strong>?
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setModalDeleteVisible(false)}>Cancelar</CButton>
          <CButton color="danger" style={{ color: 'white' }} onClick={handleDeleteProfesor}>Eliminar Profesor</CButton>
        </CModalFooter>
      </CModal>

      {/* Modal Detalles */}
      <CModal visible={modalDetailsVisible} onClose={() => setModalDetailsVisible(false)}>
        <CModalHeader>
          <CModalTitle>Detalles del Profesor</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <p><strong>Código Profesor:</strong> {profesorDetails.Cod_profesor}</p>
          <p><strong>Nombre:</strong> {profesorDetails.Nombre} {profesorDetails.Primer_apellido}</p>
          <p><strong>Grado Académico:</strong> {profesorDetails.GradoAcademicoDescripcion}</p>
          <p><strong>Tipo de Contrato:</strong> {profesorDetails.TipoContratoDescripcion}</p>
          <p><strong>Hora Entrada:</strong> {profesorDetails.Hora_entrada}</p>
          <p><strong>Hora Salida:</strong> {profesorDetails.Hora_salida}</p>
          <p><strong>Fecha Ingreso:</strong> {new Date(profesorDetails.Fecha_ingreso).toLocaleDateString()}</p>
          <p><strong>Fecha Fin Contrato:</strong> {new Date(profesorDetails.Fecha_fin_contrato).toLocaleDateString()}</p>
          <p><strong>Años de Experiencia:</strong> {profesorDetails.Años_experiencia}</p>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setModalDetailsVisible(false)}>Cerrar</CButton>
        </CModalFooter>
      </CModal>
    </CContainer>
  );
};

export default ListaProfesores;
