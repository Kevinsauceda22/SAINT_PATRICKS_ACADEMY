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

const ListaGradoAcademico = () => {
  const [gradosAcademicos, setGradosAcademicos] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalUpdateVisible, setModalUpdateVisible] = useState(false);
  const [modalDeleteVisible, setModalDeleteVisible] = useState(false);
  const [modalReportVisible, setModalReportVisible] = useState(false);
  const [nuevoGrado, setNuevoGrado] = useState({ Descripcion: '' });
  const [gradoToUpdate, setGradoToUpdate] = useState({});
  const [gradoToDelete, setGradoToDelete] = useState({});
  const [gradoToReport, setGradoToReport] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchGradosAcademicos();
  }, []);

  const fetchGradosAcademicos = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/gradosAcademicos/verGradosAcademicos');
      const data = await response.json();
      setGradosAcademicos(data);
    } catch (error) {
      console.error('Error al obtener los grados académicos:', error);
    }
  };

  const handleCreateGrado = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/gradosAcademicos/crearGradoAcademico', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(nuevoGrado),
      });

      if (response.ok) {
        fetchGradosAcademicos();
        setModalVisible(false);
        setNuevoGrado({ Descripcion: '' });
      } else {
        console.error('Error al crear el grado académico:', response.statusText);
      }
    } catch (error) {
      console.error('Error al crear el grado académico:', error);
    }
  };

  const handleUpdateGrado = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/gradosAcademicos/actualizarGradoAcademico', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(gradoToUpdate),
      });

      if (response.ok) {
        fetchGradosAcademicos();
        setModalUpdateVisible(false);
        setGradoToUpdate({});
      } else {
        console.error('Error al actualizar el grado académico:', response.statusText);
      }
    } catch (error) {
      console.error('Error al actualizar el grado académico:', error);
    }
  };

  const handleDeleteGrado = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/gradosAcademicos/eliminarGradoAcademico', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ Cod_grado_academico: gradoToDelete.Cod_grado_academico }),
      });

      if (response.ok) {
        fetchGradosAcademicos();
        setModalDeleteVisible(false);
        setGradoToDelete({});
      } else {
        console.error('Error al eliminar el grado académico:', response.statusText);
      }
    } catch (error) {
      console.error('Error al eliminar el grado académico:', error);
    }
  };

  const filteredGradosAcademicos = gradosAcademicos.filter((grado) =>
    Object.values(grado).some((value) =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <CContainer>
      <h1>Lista de Grados Académicos</h1>
      <CButton color="success" onClick={() => setModalVisible(true)} style={{ color: 'white',marginTop: '20px' }}>
        Crear Grado Académico
      </CButton>
      <div className="d-flex justify-content-end mb-3">
        <CInputGroup style={{ width: '300px' }}>
          <CInputGroupText>Buscar</CInputGroupText>
          <CFormInput
            placeholder="Por palabra clave"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="sm" // Cambiar el tamaño a pequeño
          />
        </CInputGroup>
      </div>

      <CTable striped bordered hover>
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell>#</CTableHeaderCell>
            <CTableHeaderCell>Código Grado Académico</CTableHeaderCell>
            <CTableHeaderCell>Descripción</CTableHeaderCell>
            <CTableHeaderCell>Acciones</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {filteredGradosAcademicos.map((grado, index) => (
            <CTableRow key={grado.Cod_grado_academico}>
              <CTableDataCell>{index + 1}</CTableDataCell>
              <CTableDataCell>{grado.Cod_grado_academico}</CTableDataCell>
              <CTableDataCell>{grado.Descripcion}</CTableDataCell>
              <CTableDataCell>
                <CButton
                  color="info" style={{ marginRight: '10px' }}
                  onClick={() => {
                    setGradoToUpdate(grado);
                    setModalUpdateVisible(true);
                  }}
                >
                  <CIcon icon={cilPen} />
                </CButton>
                <CButton
                  color="danger" style={{ marginRight: '10px' }}
                  onClick={() => {
                    setGradoToDelete(grado);
                    setModalDeleteVisible(true);
                  }}
                >
                  <CIcon icon={cilTrash} />
                </CButton>
                <CButton
                  color="primary" style={{ marginRight: '10px' }}
                  onClick={() => {
                    setGradoToReport(grado);
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
          <CModalTitle>Crear Nuevo Grado Académico</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CInputGroup className="mb-3">
            <CInputGroupText>Descripción</CInputGroupText>
            <CFormInput
              value={nuevoGrado.Descripcion}
              onChange={(e) => setNuevoGrado({ Descripcion: e.target.value })}
            />
          </CInputGroup>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setModalVisible(false)}>
            Cancelar
          </CButton>
          <CButton color="success" style={{ color: 'white' }} onClick={handleCreateGrado}>
            Crear Grado Académico
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Modal Actualizar */}
      <CModal visible={modalUpdateVisible} onClose={() => setModalUpdateVisible(false)}>
        <CModalHeader>
          <CModalTitle>Actualizar Grado Académico</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CInputGroup className="mb-3">
            <CInputGroupText>Descripción</CInputGroupText>
            <CFormInput
              value={gradoToUpdate.Descripcion || ''}
              onChange={(e) => setGradoToUpdate({ ...gradoToUpdate, Descripcion: e.target.value })}
            />
          </CInputGroup>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setModalUpdateVisible(false)}>
            Cancelar
          </CButton>
          <CButton color="info" style={{ color: 'white' }} onClick={handleUpdateGrado}>
            Actualizar Grado Académico
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Modal Eliminar */}
      <CModal visible={modalDeleteVisible} onClose={() => setModalDeleteVisible(false)}>
        <CModalHeader>
          <CModalTitle>Eliminar Grado Académico</CModalTitle>
        </CModalHeader>
        <CModalBody>
          ¿Estás seguro de que deseas eliminar el grado académico: <strong>{gradoToDelete.Descripcion}</strong>?
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setModalDeleteVisible(false)}>
            Cancelar
          </CButton>
          <CButton color="danger" style={{ color: 'white' }} onClick={handleDeleteGrado}>
            Eliminar Grado Académico
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Modal Reportar */}
      <CModal visible={modalReportVisible} onClose={() => setModalReportVisible(false)}>
        <CModalHeader>
          <CModalTitle>Detalles del Grado Académico</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <p><strong>Código Grado Académico:</strong> {gradoToReport.Cod_grado_academico}</p>
          <p><strong>Descripción:</strong> {gradoToReport.Descripcion}</p>
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

export default ListaGradoAcademico;
