import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { cilSearch, cilPen, cilTrash, cilPlus, cilSave, cilBrushAlt, cilFile } from '@coreui/icons';
import CIcon from '@coreui/icons-react';
import {
  CButton,
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
  CSpinner,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
} from '@coreui/react';
import { FaCheck, FaTimes } from 'react-icons/fa';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import usePermission from '../../../../context/usePermission';
import AccessDenied from "../AccessDenied/AccessDenied"


const ConceptoPago = () => {
c
  const [conceptos, setConceptos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredConceptos, setFilteredConceptos] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [modalVisible, setModalVisible] = useState(false);
  const [editar, setEditar] = useState(false);
  const [conceptoActual, setConceptoActual] = useState({ codConcepto: null, concepto: '', descripcion: '', activo: 'Si' });
  const [validationErrors, setValidationErrors] = useState({
    concepto: '',
    descripcion: '',
    activo: ''
  });

  const formatTitleCase = (str) => str.toLowerCase().replace(/(^|\s)\S/g, (letter) => letter.toUpperCase());

  const validarSoloLetras = (texto) => /^[A-Za-z\s]+$/.test(texto);
  const validarLetrasYNumeros = (texto) => /^[A-Za-z0-9\s]+$/.test(texto);
  const validarLongitud = (texto, min, max) => texto.length >= min && texto.length <= max;

  const validarDuplicado = (concepto) => {
    const conceptoExistente = conceptos.find((item) => item.Concepto.toLowerCase() === concepto.toLowerCase());
    if (conceptoExistente && (!editar || conceptoExistente.Cod_concepto !== conceptoActual.codConcepto)) {
      setValidationErrors(prev => ({
        ...prev,
        concepto: 'El concepto ya existe en la tabla.'
      }));
      return false;
    }
    return true;
  };

  const validarConcepto = (concepto) => {
    const trimmedConcepto = concepto.trim().toUpperCase();

    if (!validarSoloLetras(trimmedConcepto)) {
      setValidationErrors(prev => ({
        ...prev,
        concepto: 'El concepto solo debe contener letras y espacios.'
      }));
      return false;
    }

    if (!validarLongitud(trimmedConcepto, 3, 30)) {
      setValidationErrors(prev => ({
        ...prev,
        concepto: 'El concepto debe tener entre 3 y 30 caracteres.'
      }));
      return false;
    }

    if (!validarDuplicado(trimmedConcepto)) {
      return false;
    }

    setValidationErrors(prev => ({ ...prev, concepto: '' }));
    return true;
  };

  const validarDescripcion = (descripcion) => {
    const trimmedDescripcion = descripcion.trim().toUpperCase();

    if (!validarLetrasYNumeros(trimmedDescripcion)) {
      setValidationErrors(prev => ({
        ...prev,
        descripcion: 'La descripción solo debe contener letras, números y espacios.'
      }));
      return false;
    }

    if (!validarLongitud(trimmedDescripcion, 5, 100)) {
      setValidationErrors(prev => ({
        ...prev,
        descripcion: 'La descripción debe tener entre 5 y 100 caracteres.'
      }));
      return false;
    }

    if (!isNaN(trimmedDescripcion)) {
      setValidationErrors(prev => ({
        ...prev,
        descripcion: 'La descripción no puede ser solo números.'
      }));
      return false;
    }

    setValidationErrors(prev => ({ ...prev, descripcion: '' }));
    return true;
  };

  const validarActivo = (activo) => {
    if (activo !== 'Si' && activo !== 'No') {
      setValidationErrors(prev => ({
        ...prev,
        activo: 'El campo "Activo" solo puede ser "Sí" o "No".'
      }));
      return false;
    }
    setValidationErrors(prev => ({ ...prev, activo: '' }));
    return true;
  };

  const obtenerConceptos = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/conceptopago/concepto-pago');
      const data = await response.json();
      if (response.ok) {
        setConceptos(data);
        setFilteredConceptos(data);
      } else {
        throw new Error(data.message || 'Error al obtener los conceptos de pago');
      }
    } catch (error) {
      setError(error.message);
      mostrarAlerta('Error al obtener datos', error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const actualizarConcepto = async () => {
    const isConceptoValid = validarConcepto(conceptoActual.concepto);
    const isDescripcionValid = validarDescripcion(conceptoActual.descripcion);
    const isActivoValid = validarActivo(conceptoActual.activo);

    if (!isConceptoValid || !isDescripcionValid || !isActivoValid) return;

    try {
      const response = await fetch(`http://localhost:4000/api/conceptopago/concepto-pago/${conceptoActual.codConcepto}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          Concepto: conceptoActual.concepto.trim().toUpperCase(),
          Descripcion: conceptoActual.descripcion.trim().toUpperCase(),
          Activo: conceptoActual.activo,
        }),
      });

      if (response.ok) {
        mostrarAlerta('Actualización exitosa', 'Concepto de pago actualizado con éxito.', 'success');
        await obtenerConceptos();
      } else {
        const result = await response.json();
        throw new Error(result.Mensaje || 'Error al actualizar el concepto de pago');
      }
    } catch (error) {
      mostrarAlerta('Error al actualizar', error.message, 'error');
    } finally {
      setModalVisible(false);
    }
  };

  const crearConcepto = async () => {
    const isConceptoValid = validarConcepto(conceptoActual.concepto);
    const isDescripcionValid = validarDescripcion(conceptoActual.descripcion);
    const isActivoValid = validarActivo(conceptoActual.activo);

    if (!isConceptoValid || !isDescripcionValid || !isActivoValid) return;

    try {
      const response = await fetch('http://localhost:4000/api/conceptopago/concepto-pago', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          concepto: conceptoActual.concepto.trim().toUpperCase(),
          descripcion: conceptoActual.descripcion.trim().toUpperCase(),
          activo: conceptoActual.activo,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        mostrarAlerta('Èxito', 'Concepto de pago guardado con éxito.', 'success');
        obtenerConceptos();
      } else {
        throw new Error(result.Mensaje || 'Error al crear el concepto de pago');
      }
    } catch (error) {
      mostrarAlerta('Error al crear', error.message, 'error');
    } finally {
      setModalVisible(false);
    }
  };

  const eliminarConcepto = async (codConcepto) => {
    try {
      const response = await fetch(`http://localhost:4000/api/conceptopago/concepto-pago/${codConcepto}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        mostrarAlerta('Eliminación exitosa', 'Concepto de pago eliminado correctamente.', 'success');
        obtenerConceptos();
      } else {
        throw new Error('Error al eliminar el concepto de pago');
      }
    } catch (error) {
      mostrarAlerta('Error al eliminar', error.message, 'error');
    }
  };

  const confirmDelete = (codConcepto) => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'No podrás revertir esta acción',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        eliminarConcepto(codConcepto);
      }
    });
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    const filtered = conceptos.filter((concepto) =>
      concepto.Concepto.toLowerCase().includes(value)
    );
    setFilteredConceptos(filtered);
    setCurrentPage(0);
  };

  const handleAddModal = () => {
    setConceptoActual({ codConcepto: null, concepto: '', descripcion: '', activo: 'Si' });
    setEditar(false);
    setModalVisible(true);
    setValidationErrors({ concepto: '', descripcion: '', activo: '' });
  };

  const handleEditModal = (concepto) => {
    setConceptoActual({
      codConcepto: concepto.Cod_concepto,
      concepto: concepto.Concepto,
      descripcion: concepto.Descripcion,
      activo: concepto.Activo,
    });
    setEditar(true);
    setModalVisible(true);
    setValidationErrors({ concepto: '', descripcion: '', activo: '' });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!conceptoActual.concepto.trim()) {
      mostrarAlerta('Error', 'El nombre del concepto no puede estar vacío.', 'error');
      return;
    }

    if (!conceptoActual.descripcion.trim()) {
      mostrarAlerta('Error', 'La descripción no puede estar vacía.', 'error');
      return;
    }

    if (editar) {
      actualizarConcepto();
    } else {
      crearConcepto();
    }
  };

  const mostrarAlerta = (title, text, icon) => {
    Swal.fire({
      title,
      text,
      icon,
      confirmButtonText: 'Aceptar',
    });
  };

   // Función para exportar a PDF
   const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text('Reporte de Conceptos de Pago', 10, 10);

    doc.autoTable({
      head: [['#', 'Concepto', 'Descripción', 'Activo']],
      body: conceptos.map((concepto, index) => [
        index + 1,
        concepto.Concepto,
        concepto.Descripcion,
        concepto.Activo === 'SI' ? 'Sí' : 'No',
      ]),
    });

    doc.save('Reporte_Conceptos_Pago.pdf');
  };

  // Función para exportar a Excel
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      conceptos.map((concepto, index) => ({
        '#': index + 1,
        'Concepto': concepto.Concepto,
        'Descripción': concepto.Descripcion,
        'Activo': concepto.Activo === 'SI' ? 'Sí' : 'No',
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Conceptos de Pago');
    XLSX.writeFile(workbook, 'Reporte_Conceptos_Pago.xlsx');
  };

  useEffect(() => {
    obtenerConceptos();
  }, []);

  const indexOfLastItem = (currentPage + 1) * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredConceptos.slice(indexOfFirstItem, indexOfLastItem);

  if (loading) {
    return (
      <CContainer>
        <CRow className="justify-content-center">
          <CCol xs={12} md={6}>
            <CSpinner color="primary" />
            <p>Cargando conceptos de pago...</p>
          </CCol>
        </CRow>
      </CContainer>
    );
  }

  if (error) {
    return (
      <CContainer>
        <CRow className="justify-content-center">
          <CCol xs={12} md={6}>
            <p>Error: {error}</p>
          </CCol>
        </CRow>
      </CContainer>
    );
  }

  const pageCount = Math.ceil(filteredConceptos.length / itemsPerPage);


   // Verificar permisos
 if (!canSelect) {
  return <AccessDenied />;
}

  return (
    <CContainer>
            <CRow className="justify-content-between align-items-center mb-3">
        <CCol xs={12} md={8}>
          <h3>Mantenimiento de Conceptos de Pago</h3>
          </CCol>
        <CCol xs="4" md="3" className="text-end">
  <CButton color="dark" onClick={() => handleAddModal(true)} className="me-2" style={{ backgroundColor: '#4B6251', borderColor: '#0F463A' }}>
    <CIcon icon={cilPlus} /> Nuevo
  </CButton>
  <CDropdown>
    <CDropdownToggle style={{ backgroundColor: '#6C8E58', borderColor: '#617341' }}>
      <CIcon icon={cilFile} /> Reporte
    </CDropdownToggle>
    <CDropdownMenu>
      <CDropdownItem onClick={exportToPDF}>Exportar a PDF</CDropdownItem>
      <CDropdownItem onClick={exportToExcel}>Exportar a Excel</CDropdownItem>
    </CDropdownMenu>
  </CDropdown>
</CCol>
      </CRow>

      <CRow className="align-items-center my-3">
        <CCol md={5}>
          <CInputGroup size="sm">
            <CInputGroupText>
              <CIcon icon={cilSearch} />
            </CInputGroupText>
            <CFormInput
              placeholder="Buscar concepto de pago"
              value={searchTerm}
              onChange={handleSearch}
            />
            <CButton
              style={{
                border: '1px solid #ccc',
                backgroundColor: '#F3F4F7',
                color: '#343a40',
              }}
              onClick={() => setSearchTerm('')}
            >
              <CIcon icon={cilBrushAlt} /> Limpiar
            </CButton>
          </CInputGroup>
        </CCol>
        <CCol xs="12" md="7" className="text-md-end mt-2 mt-md-0">
          <CInputGroup style={{ width: 'auto', display: 'inline-block' }}>
            <div className="d-inline-flex align-items-center">
              <span>Mostrar&nbsp;</span>
              <CFormSelect
                style={{ width: '80px', display: 'inline-block', textAlign: 'center' }}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(0); // Ajuste para comenzar desde el primer elemento
                }}
                value={itemsPerPage}
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

      <div className="table-container">
        <CTable striped bordered hover>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell>#</CTableHeaderCell>
              <CTableHeaderCell>Nombre del Concepto</CTableHeaderCell>
              <CTableHeaderCell>Descripción</CTableHeaderCell>
              <CTableHeaderCell>Activo</CTableHeaderCell>
              <CTableHeaderCell className="text-end">Acciones</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {currentItems.map((concepto, index) => (
              <CTableRow key={concepto.Cod_concepto}>
                <CTableDataCell>{index + 1 + currentPage * itemsPerPage}</CTableDataCell>
                <CTableDataCell>{concepto.Concepto.toUpperCase()}</CTableDataCell>
                <CTableDataCell>{concepto.Descripcion.toUpperCase()}</CTableDataCell>
                <CTableDataCell className="text-center">
                  {concepto.Activo.toUpperCase() === 'SI' ? <FaCheck color="green" /> : <FaTimes color="red" />}
                </CTableDataCell>
                <CTableDataCell className="text-end">
  <CButton
    color="warning"
    size="sm"
    style={{ opacity: 0.8 }}  // Ajusta la opacidad
    onClick={() => handleEditModal(concepto)}
  >
    <CIcon icon={cilPen} />
  </CButton>{' '}
  <CButton
    color="danger"
    size="sm"
    style={{ opacity: 0.8 }}  // Ajusta la opacidad
    onClick={() => confirmDelete(concepto.Cod_concepto)}
  >
    <CIcon icon={cilTrash} />
  </CButton>
</CTableDataCell>

              </CTableRow>
            ))}
          </CTableBody>
        </CTable>
      </div>

      <nav className="d-flex justify-content-center align-items-center mt-4">
        <CPagination className="mb-0" style={{ gap: '0.3cm' }}>
          <CButton
            style={{ backgroundColor: 'gray', color: 'white', marginRight: '0.3cm' }}
            disabled={currentPage === 0}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Anterior
          </CButton>
          <CButton
            style={{ backgroundColor: 'gray', color: 'white' }}
            disabled={currentPage === pageCount - 1}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Siguiente
          </CButton>
        </CPagination>
        <span className="mx-2">Página {currentPage + 1} de {pageCount}</span>
      </nav>

      <CModal visible={modalVisible} onClose={() => setModalVisible(false)} backdrop="static">
        <CModalHeader closeButton>
          <CModalTitle>{editar ? 'Editar Concepto de Pago' : 'Agregar Concepto de Pago'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm onSubmit={handleSubmit}>
            <CInputGroup className="mb-3">
              <CInputGroupText>Nombre del Concepto</CInputGroupText>
              <CFormInput
                type="text"
                placeholder="Nombre del concepto"
                value={conceptoActual.concepto.toUpperCase()}
                onChange={(e) => {
                  setConceptoActual({ ...conceptoActual, concepto: e.target.value.toUpperCase() });
                  validarConcepto(e.target.value);
                }}
                required
              />
              {validationErrors.concepto && (
                <p className="text-danger">{validationErrors.concepto}</p>
              )}
            </CInputGroup>
            <CInputGroup className="mb-3">
              <CInputGroupText>Descripción</CInputGroupText>
              <CFormInput
                as="textarea"
                rows={3}
                placeholder="Descripción"
                value={conceptoActual.descripcion.toUpperCase()}
                onChange={(e) => {
                  setConceptoActual({ ...conceptoActual, descripcion: e.target.value.toUpperCase() });
                  validarDescripcion(e.target.value);
                }}
                required
              />
              {validationErrors.descripcion && (
                <p className="text-danger">{validationErrors.descripcion}</p>
              )}
            </CInputGroup>
            <CInputGroup className="mb-3">
              <CInputGroupText>Selecionar Activo</CInputGroupText>
              <CFormSelect
                value={conceptoActual.activo}
                onChange={(e) => {
                  setConceptoActual({ ...conceptoActual, activo: e.target.value });
                  validarActivo(e.target.value);
                }}
                required
              >
                <option value="Si">Sí</option>
                <option value="No">No</option>
              </CFormSelect>
            </CInputGroup>
            {validationErrors.activo && (
              <p className="text-danger mt-2">{validationErrors.activo}</p>
            )}
            <CModalFooter>
            <CButton 
  style={{ backgroundColor: '#6c757d', color: 'white', borderColor: '#6c757d' }} 
  onClick={() => setModalVisible(false)}
>
  Cancelar
</CButton>
<CButton 
  style={{ backgroundColor: '#4B6251', color: 'white', borderColor: '#4B6251' }} 
  type="submit"
>
  <CIcon icon={cilSave} /> {editar ? 'Guardar' : 'Guardar'}
</CButton>

            </CModalFooter>
          </CForm>
        </CModalBody>
      </CModal>

      <style jsx>{`
        .table-container {
          max-height: 400px;
          overflow-y: ${filteredConceptos.length >= 5 ? 'auto' : 'hidden'};
          overflow-x: hidden;
        }

        /* Personalización de la barra de desplazamiento */
        .table-container::-webkit-scrollbar {
          width: 10px;
        }

        .table-container::-webkit-scrollbar-thumb {
          background-color: #888;
          border-radius: 5px;
        }

        .table-container::-webkit-scrollbar-thumb:hover {
          background-color: #555;
        }
      `}</style>
    </CContainer>
  );
};

export default ConceptoPago;
