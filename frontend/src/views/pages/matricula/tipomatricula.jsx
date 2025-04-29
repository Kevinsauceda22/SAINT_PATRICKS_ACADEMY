import React, { useState, useEffect } from 'react';
import { cilSearch, cilBrushAlt, cilPen, cilTrash, cilPlus, cilSave, cilFile } from '@coreui/icons';
import { CIcon } from '@coreui/icons-react';
import swal from 'sweetalert2';
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
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
} from '@coreui/react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import logo from 'src/assets/brand/logo_saint_patrick.png';

import * as XLSX from 'xlsx';

const TipoMatricula = () => {
  const [tipos, setTipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTipos, setFilteredTipos] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [modalVisible, setModalVisible] = useState(false);
  const [editar, setEditar] = useState(false);
  const [estadoActual, setEstadoActual] = useState({ Tipo: '' });

  useEffect(() => {
    obtenerTipos();
  }, []);

  const obtenerTipos = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/tipomatricula/tipo-matricula');
      const data = await response.json();
      if (response.ok) {
        setTipos(data);
        setFilteredTipos(data);
      } else {
        throw new Error(data.message || 'Error al obtener los tipos de matrícula');
      }
    } catch (error) {
      setError(error.message);
      swal.fire({
        title: 'Error',
        text: error.message,
        icon: 'error',
        confirmButtonColor: '#4B6251',
      });
    } finally {
      setLoading(false);
    }
  };

  const validarTipoEnTiempoReal = (texto) => {
    const textoSinNumerosYEspeciales = texto.replace(/[^A-Za-z\s]/g, ''); // Solo letras y espacios
    const textoValidado = textoSinNumerosYEspeciales.toUpperCase().slice(0, 30); // Limitar a 30 caracteres
    const tresLetrasSeguidas = /(.)\1{2,}/; // Tres letras iguales seguidas

    if (tresLetrasSeguidas.test(textoValidado)) {
      return estadoActual.Tipo; // Mantener el estado anterior si hay caracteres inválidos
    }
    return textoValidado;
  };

  const handleTipoChange = (e) => {
    const textoValido = validarTipoEnTiempoReal(e.target.value);
    setEstadoActual({ ...estadoActual, Tipo: textoValido });
  };

  const crearTipo = async (tipo) => {
    try {
      const response = await fetch('http://localhost:4000/api/tipomatricula/tipo-matricula', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ Tipo: tipo }),
      });

      if (response.ok) {
        swal.fire({
          title: 'Éxito',
          text: 'Tipo de matrícula creado correctamente.',
          icon: 'success',
          confirmButtonColor: '#4B6251',
        });
        obtenerTipos();
      } else {
        const result = await response.json();
        throw new Error(result.Mensaje || 'Error al crear el tipo de matrícula');
      }
    } catch (error) {
      swal.fire({
        title: 'Error',
        text: error.message,
        icon: 'error',
        confirmButtonColor: '#4B6251',
      });
    }
  };

  const actualizarTipo = async (codTipo, nuevoTipo) => {
    try {
      const response = await fetch(`http://localhost:4000/api/tipomatricula/tipo-matricula/${codTipo}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ Tipo: nuevoTipo }),
      });

      if (response.ok) {
        swal.fire({
          title: 'Éxito',
          text: 'Tipo de matrícula actualizado correctamente.',
          icon: 'success',
          confirmButtonColor: '#4B6251',
        });
        obtenerTipos();
      } else {
        const result = await response.json();
        throw new Error(result.Mensaje || 'Error al actualizar el tipo de matrícula');
      }
    } catch (error) {
      swal.fire({
        title: 'Error',
        text: error.message,
        icon: 'error',
        confirmButtonColor: '#4B6251',
      });
    }
  };

  const eliminarTipo = async (codTipo) => {
    try {
      const response = await fetch(`http://localhost:4000/api/tipomatricula/tipo-matricula/${codTipo}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        swal.fire({
          title: 'Éxito',
          text: 'Tipo de matrícula eliminado correctamente.',
          icon: 'success',
          confirmButtonColor: '#4B6251',
        });
        obtenerTipos();
      } else {
        const result = await response.json();
        throw new Error(result.Mensaje || 'Error al eliminar el tipo de matrícula');
      }
    } catch (error) {
      swal.fire({
        title: 'Error',
        text: error.message,
        icon: 'error',
        confirmButtonColor: '#4B6251',
      });
    }
  };
  const toggleEstadoTipo = async (tipo) => {
    try {
      // Ahora evaluamos texto, no números
      const nuevoEstado = tipo.estado === 'activo' ? 'inactivo' : 'activo';
  
      const response = await fetch(`http://localhost:4000/api/tipomatricula/tipo-matricula/estado/${tipo.Cod_tipo_matricula}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ p_estado: nuevoEstado }),
      });
  
      if (response.ok) {
        swal.fire({
          title: 'Éxito',
          text: 'Estado actualizado correctamente.',
          icon: 'success',
          confirmButtonColor: '#4B6251',
        });
        obtenerTipos(); // Refresca la tabla después de cambiar
      } else {
        const result = await response.json();
        throw new Error(result.Mensaje || 'Error al cambiar el estado');
      }
    } catch (error) {
      swal.fire({
        title: 'Error',
        text: error.message,
        icon: 'error',
        confirmButtonColor: '#4B6251',
      });
    }
  };
  
  

  const openAddModal = () => {
    setEditar(false);
    setEstadoActual({ Tipo: '' });
    setModalVisible(true);
  };

  const openEditModal = (tipo) => {
    setEditar(true);
    setEstadoActual(tipo);
    setModalVisible(true);
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    if (!estadoActual.Tipo) {
      swal.fire({
        title: 'Error',
        text: 'El nombre del tipo no puede estar vacío ni contener caracteres especiales o tres letras iguales seguidas.',
        icon: 'error',
        confirmButtonColor: '#4B6251',
      });
      return;
    }

    if (editar) {
      await actualizarTipo(estadoActual.Cod_tipo_matricula, estadoActual.Tipo);
    } else {
      await crearTipo(estadoActual.Tipo);
    }
    setModalVisible(false);
  };

  const confirmDelete = (codTipo) => {
    swal.fire({
      title: '¿Estás seguro?',
      text: 'No podrás revertir esta acción',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#4B6251',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        eliminarTipo(codTipo);
      }
    });
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);

    const filtered = tipos.filter(tipo =>
      tipo.Tipo.toLowerCase().includes(value)
    );
    setFilteredTipos(filtered);
    setCurrentPage(0);
  };

  const exportToPDFTipo = () => {
    const doc = new jsPDF();
  
    const img = new Image();
    img.src = logo;
  
    img.onload = () => {
      doc.addImage(img, 'PNG', 10, 10, 30, 30);
  
      doc.setFontSize(18);
      doc.setTextColor(0, 102, 51);
      doc.text("SAINT PATRICK'S ACADEMY", doc.internal.pageSize.width / 2, 20, { align: 'center' });
  
      doc.setFontSize(14);
      doc.text('Reporte de Tipos de Matrícula', doc.internal.pageSize.width / 2, 30, { align: 'center' });
  
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text('Casa Club del periodista, Colonia del Periodista', doc.internal.pageSize.width / 2, 40, { align: 'center' });
      doc.text('Teléfono: (504) 2234-8871', doc.internal.pageSize.width / 2, 45, { align: 'center' });
      doc.text('Correo: info@saintpatrickacademy.edu', doc.internal.pageSize.width / 2, 50, { align: 'center' });
  
      doc.setLineWidth(0.5);
      doc.setDrawColor(0, 102, 51);
      doc.line(10, 55, doc.internal.pageSize.width - 10, 55);
  
      doc.setFontSize(12);
      doc.setTextColor(0, 51, 102);
      doc.text('Detalles de los Tipos de Matrícula', doc.internal.pageSize.width / 2, 65, { align: 'center' });
  
      doc.autoTable({
        startY: 75,
        head: [['#', 'Tipo de Matrícula', 'Estado']],
        body: tipos.map((tipo, index) => [
          index + 1,
          tipo.Tipo || 'N/A',
          tipo.estado?.toUpperCase() || 'N/A',
        ]),
        styles: {
          fontSize: 10,
          textColor: [34, 34, 34],
          cellPadding: 4,
          valign: 'middle',
          overflow: 'linebreak',
        },
        headStyles: {
          fillColor: [0, 102, 51],
          textColor: [255, 255, 255],
          fontSize: 10,
        },
        alternateRowStyles: { fillColor: [240, 248, 255] },
        margin: { left: 10, right: 10 },
      });
  
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        const creationDateTime = new Date().toLocaleString('es-ES', {
          day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit',
        });
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Fecha y Hora de Generación: ${creationDateTime}`, 10, doc.internal.pageSize.height - 10);
        doc.text(`Página ${i} de ${pageCount}`, doc.internal.pageSize.width - 30, doc.internal.pageSize.height - 10, { align: 'right' });
      }
  
      const pdfBlob = doc.output('blob');
      const pdfURL = URL.createObjectURL(pdfBlob);
      window.open(pdfURL);
    };
  
    img.onerror = () => {
      Swal.fire('Error', 'No se pudo cargar el logo.', 'error');
    };
  };
  

  const exportToExcel = () => {
    if (!tipos || tipos.length === 0) {
      swal.fire('Sin datos', 'No hay datos para exportar.', 'warning');
      return;
    }
  
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Tipos de Matrícula');
  
    // Título principal
    worksheet.mergeCells('A1:C1');
    worksheet.getCell('A1').value = "SAINT PATRICK'S ACADEMY";
    worksheet.getCell('A1').font = { bold: true, size: 18, color: { argb: '006633' } };
    worksheet.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };
  
    // Subtítulo
    worksheet.mergeCells('A2:C2');
    worksheet.getCell('A2').value = 'REPORTE DE TIPOS DE MATRÍCULA';
    worksheet.getCell('A2').font = { bold: true, size: 14, color: { argb: '006633' } };
    worksheet.getCell('A2').alignment = { horizontal: 'center', vertical: 'middle' };
  
    // Encabezados
    const headerRow = worksheet.addRow(['#', 'Tipo de Matrícula', 'Estado']);
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '006633' } };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = {
        top: { style: 'thin', color: { argb: '000000' } },
        left: { style: 'thin', color: { argb: '000000' } },
        bottom: { style: 'thin', color: { argb: '000000' } },
        right: { style: 'thin', color: { argb: '000000' } },
      };
    });
  
    // Datos
    tipos.forEach((tipo, index) => {
      const row = worksheet.addRow([
        index + 1,
        tipo.Tipo || 'N/A',
        tipo.estado?.toUpperCase() || 'N/A',
      ]);
      row.eachCell((cell) => {
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.border = {
          top: { style: 'thin', color: { argb: '000000' } },
          left: { style: 'thin', color: { argb: '000000' } },
          bottom: { style: 'thin', color: { argb: '000000' } },
          right: { style: 'thin', color: { argb: '000000' } },
        };
      });
    });
  
    worksheet.columns.forEach((col) => {
      col.width = 20;
    });
  
    workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      saveAs(blob, 'Reporte_Tipos_Matricula.xlsx');
    });
  };
  
  
  const indexOfLastItem = (currentPage + 1) * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredTipos.slice(indexOfFirstItem, indexOfLastItem);

  const pageCount = Math.ceil(filteredTipos.length / itemsPerPage);

  return (
    <CContainer>
      <CRow className="justify-content-between align-items-center mb-4">
        <CCol xs={12} md={8}>
          <h3>Mantenimientos Tipos de Matrícula</h3>
        </CCol>
        <CCol xs={12} md={4} className="text-end">
          <CButton style={{ backgroundColor: '#4B6251', color: 'white', width: 'auto', height: '38px' }} onClick={openAddModal}>
            <CIcon icon={cilPlus} /> Nuevo
          </CButton>
          <CDropdown className="d-inline ms-2">
            <CDropdownToggle style={{ backgroundColor: '#6C8E58', color: 'white', width: 'auto', height: '38px' }}>
              <CIcon icon={cilFile} /> Reporte
            </CDropdownToggle>
            <CDropdownMenu>
  <CDropdownItem onClick={exportToPDFTipo}>Exportar a PDF</CDropdownItem>
  <CDropdownItem onClick={exportToExcel}>Exportar a Excel</CDropdownItem>
</CDropdownMenu>

          </CDropdown>
        </CCol>
      </CRow>

      <CRow className="align-items-center mb-3">
        <CCol md={6}>
          <CInputGroup size="sm">
            <CInputGroupText>
              <CIcon icon={cilSearch} />
            </CInputGroupText>
            <CFormInput
              placeholder="Buscar tipo de matrícula"
              value={searchTerm}
              onChange={handleSearch}
              style={{ fontSize: '0.9rem' }}
            />
            <CButton
              style={{
                border: '1px solid #ccc',
                backgroundColor: '#F3F4F7',
                color: '#343a40',
                fontSize: '0.9rem'
              }}
              onClick={() => setSearchTerm('')}
            >
              <CIcon icon={cilBrushAlt} /> Limpiar
            </CButton>
          </CInputGroup>
        </CCol>

        <CCol md={6} className="text-end">
          <div className="d-flex align-items-center justify-content-end">
            <span className="me-2">Mostrar&nbsp;</span>
            <CFormSelect
              size="sm"
              style={{ width: '80px' }}
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(0);
              }}
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
            </CFormSelect>
            <span>&nbsp;registros</span>
          </div>
        </CCol>
      </CRow>

      <CTable striped bordered hover>
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell>#</CTableHeaderCell>
            <CTableHeaderCell>TIPO DE MATRÍCULA</CTableHeaderCell>
            <CTableHeaderCell>Acciones</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {currentItems.map((tipo, index) => (
            <CTableRow key={tipo.Cod_tipo_matricula}>
              <CTableDataCell>{indexOfFirstItem + index + 1}</CTableDataCell>
              <CTableDataCell>{tipo.Tipo.toUpperCase()}</CTableDataCell>
              <CTableDataCell className="text-center">
  <div className="d-flex justify-content-center align-items-center" style={{ gap: '0.3rem' }}>
    
    {/* Botón Editar */}
    <CButton
      color="warning"
      size="sm"
      style={{
        opacity: 0.9,
        fontWeight: 'bold',
        borderRadius: '8px',
        fontSize: '0.85rem',
        width: '38px',
        height: '38px'
      }}
      onClick={() => openEditModal(tipo)}
    >
      <CIcon icon={cilPen} />
    </CButton>

    {/* Botón Activar/Inactivar */}
    <CButton
      color={tipo.estado === 'activo' ? 'success' : 'danger'}
      style={{
        fontWeight: 'bold',
        borderRadius: '8px',
        fontSize: '0.85rem',
        width: '80px',
        color: '#fff',
        padding: '0.3rem 0.5rem'
      }}
      onClick={() => toggleEstadoTipo(tipo)}
    >
      {tipo.estado === 'activo' ? 'Activo' : 'Inactivo'}
    </CButton>

    {/* Botón Eliminar */}
    <CButton
      color="danger"
      size="sm"
      style={{
        opacity: 0.9,
        fontWeight: 'bold',
        borderRadius: '8px',
        fontSize: '0.85rem',
        width: '38px',
        height: '38px'
      }}
      onClick={() => confirmDelete(tipo.Cod_tipo_matricula)}
    >
      <CIcon icon={cilTrash} />
    </CButton>

  </div>
</CTableDataCell>


            </CTableRow>
          ))}
        </CTableBody>
      </CTable>

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
          <CModalTitle>{editar ? 'Editar Tipo de Matrícula' : 'Agregar Tipo de Matrícula'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm onSubmit={handleModalSubmit}>
            <CInputGroup className="mb-3">
              <CInputGroupText>Nombre del Tipo</CInputGroupText>
              <CFormInput
                type="text"
                placeholder="Nombre del tipo"
                value={estadoActual.Tipo || ''}
                onChange={handleTipoChange}
                required
              />
            </CInputGroup>
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
    </CContainer>
  );
};

export default TipoMatricula;
