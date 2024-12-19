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
import { BsCheckCircle, BsExclamationCircle, BsDashCircle, BsXCircle } from 'react-icons/bs';
import jsPDF from 'jspdf';
import logo from 'src/assets/brand/logo_saint_patrick.png';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

const EstadoMatricula = () => {
  const [estados, setEstados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredEstados, setFilteredEstados] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [modalVisible, setModalVisible] = useState(false);
  const [editar, setEditar] = useState(false);
  const [estadoActual, setEstadoActual] = useState({ codEstado: '', tipo: '' });

  useEffect(() => {
    obtenerEstados();
  }, []);

  const obtenerEstados = async () => {
    try {
      const response = await fetch('http://77.5p.68.87i/estadomatricula/estado-matricula');
      const data = await response.json();
      if (response.ok) {
        setEstados(data);
        setFilteredEstados(data);
      } else {
        throw new Error(data.message || 'Error al obtener los estados');
      }
    } catch (error) {
      setError(error.message);
      swal.fire({
        title: 'Error',
        text: error.message,
        icon: 'error',
        confirmButtonColor: '#4B6251', // Color estandarizado
      });
    } finally {
      setLoading(false);
    }
  };

  const validarTipo = (texto) => {
    const textoValidado = texto.toUpperCase().slice(0, 30); // Limitar a 30 caracteres
    const tresLetrasSeguidas = /(.)\1{2,}/; // Tres letras iguales seguidas
    const caracteresInvalidos = /[^A-Z\s]/; // Caracteres especiales

    if (tresLetrasSeguidas.test(textoValidado) || caracteresInvalidos.test(textoValidado)) {
      return false;
    }
    return textoValidado;
  };

  const handleNombreEstadoChange = (e) => {
    const textoValido = validarTipo(e.target.value);
    if (textoValido !== false) {
      setEstadoActual({ ...estadoActual, tipo: textoValido });
    }
  };

  const crearEstado = async (tipo) => {
    try {
      const response = await fetch('http://77.5p.68.87i/estadomatricula/estado-matricula', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ p_tipo: tipo }),
      });

      if (response.ok) {
        swal.fire({
          title: 'Éxito',
          text: 'Estado de matrícula creado correctamente.',
          icon: 'success',
          confirmButtonColor: '#4B6251',
        });
        obtenerEstados();
      } else {
        const result = await response.json();
        throw new Error(result.Mensaje || 'Error al crear el estado');
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

  const eliminarEstado = async (codEstado) => {
    try {
      const response = await fetch(`http://77.5p.68.87i/estadomatricula/estado-matricula/${codEstado}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        swal.fire({
          title: 'Éxito',
          text: 'Estado de matrícula eliminado correctamente.',
          icon: 'success',
          confirmButtonColor: '#4B6251',
        });
        obtenerEstados();
      } else {
        const result = await response.json();
        throw new Error(result.Mensaje || 'Error al eliminar el estado');
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

  const actualizarEstado = async (codEstado, nuevoTipo) => {
    try {
      const response = await fetch(`http://77.5p.68.87i/estadomatricula/estado-matricula/${codEstado}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ p_cod_estado_matricula: codEstado, p_tipo: nuevoTipo }),
      });

      const result = await response.json();

      if (response.ok) {
        swal.fire({
          title: 'Éxito',
          text: 'Estado de matrícula actualizado correctamente.',
          icon: 'success',
          confirmButtonColor: '#4B6251',
        });
        obtenerEstados();
      } else {
        swal.fire({
          title: 'Error',
          text: result.Mensaje || 'Error al actualizar el estado',
          icon: 'error',
          confirmButtonColor: '#4B6251',
        });
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

  const handleEditModal = (estado) => {
    setEstadoActual({ codEstado: estado.Cod_estado_matricula, tipo: estado.Tipo });
    setEditar(true);
    setModalVisible(true);
  };

  const handleAddModal = () => {
    setEstadoActual({ codEstado: '', tipo: '' });
    setEditar(false);
    setModalVisible(true);
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);

    const filtered = estados.filter((estado) =>
      estado.Tipo.toLowerCase().includes(value)
    );
    setFilteredEstados(filtered);
    setCurrentPage(0);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!estadoActual.tipo) {
      swal.fire({
        title: 'Error',
        text: 'El nombre del estado no puede estar vacío ni contener caracteres especiales o tres letras iguales seguidas.',
        icon: 'error',
        confirmButtonColor: '#4B6251',
      });
      return;
    }

    if (editar) {
      actualizarEstado(estadoActual.codEstado, estadoActual.tipo);
    } else {
      crearEstado(estadoActual.tipo);
    }
    setModalVisible(false);
  };

  const handleDelete = (codEstado) => {
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
        eliminarEstado(codEstado);
      }
    });
  };

  const exportToPDF = () => {
    const doc = new jsPDF('landscape'); // Configurar orientación horizontal

    // Configurar la imagen del logo
    const img = new Image();
    img.src = logo; // Asegúrate de importar el logo desde el directorio correspondiente

    img.onload = () => {
        // Añadir el logo en la esquina superior izquierda
        doc.addImage(img, 'PNG', 10, 10, 30, 30);

        // Encabezado del documento
        doc.setFontSize(18);
        doc.setTextColor(0, 102, 51); // Verde oscuro
        doc.text(
            "SAINT PATRICK'S ACADEMY",
            doc.internal.pageSize.width / 2,
            20,
            { align: 'center' }
        );

        // Título del reporte
        doc.setFontSize(14);
        doc.text(
            'Reporte de Estados de Matrícula',
            doc.internal.pageSize.width / 2,
            30,
            { align: 'center' }
        );

        // Detalles de la institución
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(
            'Casa Club del periodista, Colonia del Periodista',
            doc.internal.pageSize.width / 2,
            40,
            { align: 'center' }
        );
        doc.text(
            'Teléfono: (504) 2234-8871',
            doc.internal.pageSize.width / 2,
            45,
            { align: 'center' }
        );
        doc.text(
            'Correo: info@saintpatrickacademy.edu',
            doc.internal.pageSize.width / 2,
            50,
            { align: 'center' }
        );

        // Línea divisoria
        doc.setLineWidth(0.5);
        doc.setDrawColor(0, 102, 51); // Verde oscuro
        doc.line(10, 55, doc.internal.pageSize.width - 10, 55);

        // Título de la tabla
        doc.setFontSize(12);
        doc.setTextColor(0, 51, 102); // Azul oscuro
        doc.text(
            'Detalles de los Estados de Matrícula',
            doc.internal.pageSize.width / 2,
            65,
            { align: 'center' }
        );

        // Configurar la tabla con diseño mejorado
        doc.autoTable({
            startY: 75,
            head: [['#', 'Tipo de Estado']],
            body: estados.map((estado, index) => [
                index + 1, // Número secuencial
                estado.Tipo || 'Sin definir', // Tipo de estado
            ]),
            styles: {
                fontSize: 10,
                textColor: [34, 34, 34], // Gris oscuro para texto
                cellPadding: 4,
                valign: 'middle',
                overflow: 'linebreak',
            },
            headStyles: {
                fillColor: [0, 102, 51], // Verde oscuro para encabezados
                textColor: [255, 255, 255], // Texto blanco
                fontSize: 10,
            },
            alternateRowStyles: { fillColor: [240, 248, 255] }, // Azul claro alternado para filas
            margin: { left: 10, right: 10 },
        });

        // Pie de página con fecha, hora y número de página
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            const creationDateTime = new Date().toLocaleString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
            });

            // Fecha y hora alineada a la izquierda
            doc.setFontSize(10);
            doc.setTextColor(100);
            doc.text(
                `Fecha y Hora de Generación: ${creationDateTime}`,
                10,
                doc.internal.pageSize.height - 10
            );

            // Número de página alineado a la derecha
            doc.text(
                `Página ${i} de ${pageCount}`,
                doc.internal.pageSize.width - 30,
                doc.internal.pageSize.height - 10,
                { align: 'right' }
            );
        }

        // Generar el archivo PDF como un Blob y abrirlo en una nueva pestaña
        const pdfBlob = doc.output('blob'); // Genera el PDF como un Blob
        const pdfURL = URL.createObjectURL(pdfBlob); // Crea una URL para el Blob
        window.open(pdfURL); // Abre el archivo PDF en una nueva pestaña
    };

    img.onerror = () => {
        Swal.fire('Error', 'No se pudo cargar el logo.', 'error');
    };
};

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      estados.map((estado, index) => ({
        '#': index + 1,
        'Tipo de Estado': estado.Tipo,
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Estados de Matrícula');
    XLSX.writeFile(workbook, 'Reporte_Estados_Matricula.xlsx');
  };

  const indexOfLastItem = (currentPage + 1) * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredEstados.slice(indexOfFirstItem, indexOfLastItem);

  const pageCount = Math.ceil(filteredEstados.length / itemsPerPage);

  return (
    <CContainer>
      <CRow className="justify-content-between align-items-center mb-4">
        <CCol xs={12} md={8}>
          <h3>Mantenimiento Estado de Matrícula</h3>
        </CCol>
        <CCol xs={12} md={4} className="text-end">
          <CButton 
            style={{ backgroundColor: '#0F463A', color: 'white', borderColor: '#4B6251' }} 
            onClick={handleAddModal} 
            className="me-2"
          >
            <CIcon icon={cilPlus} /> Nuevo
          </CButton>
          
          <CDropdown className="d-inline ms-2">
            <CDropdownToggle 
              style={{ backgroundColor: '#6C8E58', color: 'white', borderColor: '#617341', width: 'auto', height: '38px' }}
            >
              <CIcon icon={cilFile} /> Reporte
            </CDropdownToggle>
            <CDropdownMenu>
              <CDropdownItem onClick={exportToPDF}>Exportar a PDF</CDropdownItem>
              <CDropdownItem onClick={exportToExcel}>Exportar a Excel</CDropdownItem>
            </CDropdownMenu>
          </CDropdown>
        </CCol>
      </CRow>

      <CRow className="align-items-center my-3 justify-content-between">
        <CCol md={6}>
          <CInputGroup>
            <CInputGroupText>
              <CIcon icon={cilSearch} />
            </CInputGroupText>
            <CFormInput
              placeholder="Buscar estado"
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

        <CCol md={3} className="text-end">
          <div className="d-flex justify-content-end">
            <span className="me-2">Mostrar&nbsp;</span>
            <CFormSelect
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

      <div style={{ maxHeight: '300px', overflowY: 'auto', borderRadius: '8px', display: 'block' }}>
      <CTable striped bordered hover>
  <CTableHead>
    <CTableRow>
      <CTableHeaderCell>#</CTableHeaderCell>
      <CTableHeaderCell>Tipo de Estado</CTableHeaderCell>
      <CTableHeaderCell>Acciones</CTableHeaderCell>
    </CTableRow>
  </CTableHead>
  <CTableBody>
    {currentItems.map((estado, index) => (
      <CTableRow key={estado.Cod_estado_matricula}>
        <CTableDataCell>{index + 1 + indexOfFirstItem}</CTableDataCell>
        <CTableDataCell style={{ textTransform: 'uppercase' }}>
          {estado.Tipo}
        </CTableDataCell>
        <CTableDataCell>
          <CButton color="warning" size="sm" onClick={() => handleEditModal(estado)}>
            <CIcon icon={cilPen} />
          </CButton>{' '}
          <CButton color="danger" size="sm" onClick={() => handleDelete(estado.Cod_estado_matricula)}>
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
          <CModalTitle>{editar ? 'Editar Estado de Matrícula' : 'Agregar Estado de Matrícula'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm onSubmit={handleSubmit}>
            <CInputGroup className="mb-3">
              <CInputGroupText>Nombre del Estado</CInputGroupText>
              <CFormInput
                type="text"
                placeholder="Nombre del estado"
                value={estadoActual.tipo}
                onChange={handleNombreEstadoChange}
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

export default EstadoMatricula;
