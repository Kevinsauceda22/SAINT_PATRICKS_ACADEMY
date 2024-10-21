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

const ListaTipoContratos = () => {
  const [tiposContratos, setTiposContratos] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalUpdateVisible, setModalUpdateVisible] = useState(false);
  const [modalDeleteVisible, setModalDeleteVisible] = useState(false);
  const [modalReportVisible, setModalReportVisible] = useState(false);
  const [nuevoContrato, setNuevoContrato] = useState({ Descripcion: '' });
  const [contratoToUpdate, setContratoToUpdate] = useState({});
  const [contratoToDelete, setContratoToDelete] = useState({});
  const [contratoToReport, setContratoToReport] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchTipoContratos();
  }, []);

  const fetchTipoContratos = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/contratos/tiposContrato');
      const data = await response.json();
      setTiposContratos(data);
    } catch (error) {
      console.error('Error al obtener los tipos de contrato:', error);
    }
  };

  const handleCreateTipoContrato = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/contratos/creartiposContrato', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(nuevoContrato),
      });

      if (response.ok) {
        fetchTipoContratos();
        setModalVisible(false);
        setNuevoContrato({ Descripcion: '' });
      } else {
        console.error('Error al crear el tipo de contrato:', response.statusText);
      }
    } catch (error) {
      console.error('Error al crear el tipo de contrato:', error);
    }
  };

  const handleUpdateTipoContrato = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/contratos/actualizartiposContrato', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contratoToUpdate),
      });

      if (response.ok) {
        fetchTipoContratos();
        setModalUpdateVisible(false);
        setContratoToUpdate({});
      } else {
        console.error('Error al actualizar el tipo de contrato:', response.statusText);
      }
    } catch (error) {
      console.error('Error al actualizar el tipo de contrato:', error);
    }
  };

  const handleDeleteTipoContrato = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/contratos/eliminartiposContrato', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ Cod_tipo_contrato: contratoToDelete.Cod_tipo_contrato }),
      });

      if (response.ok) {
        fetchTipoContratos();
        setModalDeleteVisible(false);
        setContratoToDelete({});
      } else {
        console.error('Error al eliminar el tipo de contrato:', response.statusText);
      }
    } catch (error) {
      console.error('Error al eliminar el tipo de contrato:', error);
    }
  };

  const filteredTiposContratos = tiposContratos.filter((contrato) =>
    Object.values(contrato).some((value) =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <CContainer>
      <h1>Lista de Tipos de Contrato</h1>
      
      <CButton color="success" onClick={() => setModalVisible(true)} style={{ color: 'white',marginTop: '20px'  }}>
        Crear Tipo de Contrato
      </CButton>
      <div className="d-flex justify-content-end mb-3">
        
        <CInputGroup style={{ width: '300px' }}>
          <CInputGroupText>Buscar</CInputGroupText>
          <CFormInput
            placeholder="Por palabra Clave"
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
            <CTableHeaderCell>Código Tipo Contrato</CTableHeaderCell>
            <CTableHeaderCell>Descripción</CTableHeaderCell>
            <CTableHeaderCell>Acciones</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {filteredTiposContratos.map((contrato, index) => (
            <CTableRow key={contrato.Cod_tipo_contrato}>
              <CTableDataCell>{index + 1}</CTableDataCell>
              <CTableDataCell>{contrato.Cod_tipo_contrato}</CTableDataCell>
              <CTableDataCell>{contrato.Descripcion}</CTableDataCell>
              <CTableDataCell>
                <CButton
                  color="info" style={{ marginRight: '10px' }}
                  onClick={() => {
                    setContratoToUpdate(contrato);
                    setModalUpdateVisible(true);
                  }}
                >
                  <CIcon icon={cilPen} />
                </CButton>
                <CButton
                  color="danger" style={{ marginRight: '10px' }}
                  onClick={() => {
                    setContratoToDelete(contrato);
                    setModalDeleteVisible(true);
                  }}
                >
                  <CIcon icon={cilTrash} />
                </CButton>
                <CButton
                  color="primary" style={{ marginRight: '10px' }}
                  onClick={() => {
                    setContratoToReport(contrato);
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
          <CModalTitle>Crear Nuevo Tipo de Contrato</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CInputGroup className="mb-3">
            <CInputGroupText>Descripción</CInputGroupText>
            <CFormInput
              value={nuevoContrato.Descripcion}
              onChange={(e) => setNuevoContrato({ Descripcion: e.target.value })}
            />
          </CInputGroup>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setModalVisible(false)}>
            Cancelar
          </CButton>
          <CButton color="success" style={{ color: 'white' }} onClick={handleCreateTipoContrato}>
            Crear Tipo Contrato
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Modal Actualizar */}
      <CModal visible={modalUpdateVisible} onClose={() => setModalUpdateVisible(false)}>
        <CModalHeader>
          <CModalTitle>Actualizar Tipo de Contrato</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CInputGroup className="mb-3">
            <CInputGroupText>Descripción</CInputGroupText>
            <CFormInput
              value={contratoToUpdate.Descripcion || ''}
              onChange={(e) => setContratoToUpdate({ ...contratoToUpdate, Descripcion: e.target.value })}
            />
          </CInputGroup>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setModalUpdateVisible(false)}>
            Cancelar
          </CButton>
          <CButton color="info" style={{ color: 'white' }} onClick={handleUpdateTipoContrato}>
            Actualizar Tipo Contrato
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Modal Eliminar */}
      <CModal visible={modalDeleteVisible} onClose={() => setModalDeleteVisible(false)}>
        <CModalHeader>
          <CModalTitle>Eliminar Tipo de Contrato</CModalTitle>
        </CModalHeader>
        <CModalBody>
          ¿Estás seguro de que deseas eliminar el tipo de contrato: <strong>{contratoToDelete.Descripcion}</strong>?
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setModalDeleteVisible(false)}>
            Cancelar
          </CButton>
          <CButton color="danger" style={{ color: 'white' }} onClick={handleDeleteTipoContrato}>
            Eliminar Tipo Contrato
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Modal Detalles */}
      <CModal visible={modalReportVisible} onClose={() => setModalReportVisible(false)}>
        <CModalHeader>
          <CModalTitle>Detalles del Tipo de Contrato</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <h5>Código Tipo Contrato: {contratoToReport.Cod_tipo_contrato}</h5>
          <p>Descripción: {contratoToReport.Descripcion}</p>
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

export default ListaTipoContratos;
