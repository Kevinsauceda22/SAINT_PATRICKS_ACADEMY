import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import logo from 'src/assets/brand/logo_saint_patrick.png';
import {
  CContainer,
  CRow,
  CCol,
  CCard,
  CCardBody,
  CCardTitle,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CSpinner,
  CFormSelect,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
  CButton,
} from '@coreui/react';


const MatriculaForm = () => {

  const [aniosAcademicos, setAniosAcademicos] = useState([]);
  const [matriculas, setMatriculas] = useState([]);
  const [selectedAnio, setSelectedAnio] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate(); // Hook para navegación

  // Obtener las matrículas con el período académico
  const obtenerMatriculasConPeriodo = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://74.50.68.87i/matricula/matriculas-con-periodo');
      const matriculasData = response.data.data || [];

      const aniosUnicos = [...new Set(matriculasData.map((m) => m.Anio_academico))].sort((a, b) => b - a);
      setAniosAcademicos(aniosUnicos);
      setMatriculas(matriculasData);
    } catch (error) {
      console.error('Error al obtener las matrículas con el período académico:', error);
    } finally {
      setLoading(false);
    }
  };

  const obtenerMatriculasFiltradas = () => {
    if (!selectedAnio) return matriculas;
    return matriculas.filter((matricula) => String(matricula.Anio_academico) === String(selectedAnio));
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const matriculasFiltradas = obtenerMatriculasFiltradas();

    if (matriculasFiltradas.length === 0) {
        Swal.fire('Advertencia', 'No hay datos de matrículas para exportar.', 'warning');
        return;
    }

    const img = new Image();
    img.src = logo;
    img.onload = () => {
        // Encabezado
        doc.addImage(img, 'PNG', 10, 10, 30, 30);
        doc.setFontSize(18);
        doc.setTextColor(0, 102, 51);
        doc.text('SAINT PATRICK\'S ACADEMY', doc.internal.pageSize.width / 2, 20, { align: 'center' });

        // Título
        doc.setFontSize(14);
        const reportTitle = `Reporte de Matrículas ${selectedAnio ? ` - ${selectedAnio}` : ''}`;
        doc.text(reportTitle, doc.internal.pageSize.width / 2, 30, { align: 'center' });

        // Detalles de la institución
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text('Casa Club del periodista, Colonia del Periodista', doc.internal.pageSize.width / 2, 40, { align: 'center' });
        doc.text('Teléfono: (504) 2234-8871', doc.internal.pageSize.width / 2, 45, { align: 'center' });
        doc.text('Correo: info@saintpatrickacademy.edu', doc.internal.pageSize.width / 2, 50, { align: 'center' });

        // Línea divisoria
        doc.setLineWidth(0.5);
        doc.setDrawColor(0, 102, 51);
        doc.line(10, 55, doc.internal.pageSize.width - 10, 55);

        // Año Académico
        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.text(`Año Académico: ${selectedAnio || 'N/A'}`, 10, 65);

        // Datos de la tabla
        doc.autoTable({
            startY: 75,
            head: [['#', 'Código de Matrícula', 'Nombre del Estudiante', 'Fecha de Nacimiento', 'Grado', 'Sección']],
            body: matriculasFiltradas.map((matricula, index) => [
                index + 1,
                matricula.codificacion_matricula,
                `${matricula.Nombre} ${matricula.Segundo_nombre || ''} ${matricula.Primer_apellido || ''} ${matricula.Segundo_apellido || ''}`.trim(),
                matricula.fecha_nacimiento ? new Date(matricula.fecha_nacimiento).toLocaleDateString('es-ES') : 'No disponible',
                matricula.Nombre_grado || 'No disponible',
                matricula.Nombre_seccion || 'No disponible',
            ]),
            headStyles: {
                fillColor: [0, 102, 51],
                textColor: [255, 255, 255],
                fontSize: 10,
            },
            styles: {
                fontSize: 10,
                cellPadding: 3,
            },
            alternateRowStyles: { fillColor: [240, 248, 255] },
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

        // Crear Blob del PDF
        const pdfBlob = doc.output('blob');
        const pdfURL = URL.createObjectURL(pdfBlob);

        // Abrir el PDF en una nueva pestaña con título y nombre sugerido
        const newWindow = window.open(pdfURL, '_blank');
        if (newWindow) {
            newWindow.document.title = `${reportTitle} (PDF)`; // Título dinámico en la pestaña
        } else {
            Swal.fire('Error', 'No se pudo abrir el reporte en una nueva pestaña.', 'error');
        }
    };

    img.onerror = () => {
        Swal.fire('Error', 'No se pudo cargar el logo.', 'error');
    };
};


  const exportToXLSX = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      obtenerMatriculasFiltradas().map((matricula, index) => ({
        '#': index + 1,
        'Código de Matrícula': matricula.codificacion_matricula,
        'Nombre del Estudiante': `${matricula.Nombre} ${matricula.Segundo_nombre || ''} ${matricula.Primer_apellido || ''} ${matricula.Segundo_apellido || ''}`.trim(),
        'Fecha de Nacimiento': matricula.fecha_nacimiento
          ? new Date(matricula.fecha_nacimiento).toLocaleDateString('es-ES')
          : 'No disponible',
        'Grado': matricula.Nombre_grado || 'No disponible',
        'Sección': matricula.Nombre_seccion || 'No disponible',
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Matrículas');
    XLSX.writeFile(workbook, 'Reporte_Matriculas.xlsx');
  };

  useEffect(() => {
    obtenerMatriculasConPeriodo();
  }, []);

  const matriculasFiltradas = obtenerMatriculasFiltradas();


  return (
    <CContainer>
      <CRow className="mb-4">
        <CCol xs={12}>
          {/* Botón de regresar */}
          <CButton
  style={{
    backgroundColor: '#6c757d', // Color gris deseado
    color: 'white',            // Texto blanco
    border: 'none',            // Sin bordes
    borderRadius: '5px',       // Bordes redondeados
    padding: '10px 20px',      // Espaciado
    fontSize: '16px',          // Tamaño del texto
  }}
  className="mb-4"
  onClick={() => navigate('/matricula')}
>
  <i className="bi bi-arrow-left"></i> Volver a Matrículas
</CButton>

          <CCard className="shadow-sm">
            <CCardBody>
              {/* Encabezado Estilizado */}
              <CCardTitle className="text-center mb-4">
                <h4 className="fw-bold">Matrículas por Año Académico</h4>
              </CCardTitle>
              <div className="d-flex justify-content-around mb-4">
                <CFormSelect
                  className="form-select-lg border-primary shadow-sm"
                  style={{ width: '250px', borderRadius: '5px' }}
                  value={selectedAnio}
                  onChange={(e) => setSelectedAnio(e.target.value)}
                >
                  <option value="">Selecciona un año</option>
                  {aniosAcademicos.map((anio) => (
                    <option key={anio} value={anio}>
                      {anio}
                    </option>
                  ))}
                </CFormSelect>
              </div>
              <div className="d-flex justify-content-end">
                <CDropdown>
                  <CDropdownToggle color="success" className="shadow-sm">
                    Reporte
                  </CDropdownToggle>
                  <CDropdownMenu>
                    <CDropdownItem onClick={exportToPDF}>Exportar a PDF</CDropdownItem>
                    <CDropdownItem onClick={exportToXLSX}>Exportar a Excel</CDropdownItem>
                  </CDropdownMenu>
                </CDropdown>
              </div>
              {loading ? (
                <CSpinner color="primary" className="d-block mx-auto mt-4" />
              ) : matriculasFiltradas.length > 0 ? (
                <CTable striped hover responsive className="mt-4 shadow-sm">
                  <CTableHead className="bg-success text-white">
                    <CTableRow>
                      <CTableHeaderCell>#</CTableHeaderCell>
                      <CTableHeaderCell>Código de Matrícula</CTableHeaderCell>
                      <CTableHeaderCell>Nombre del Estudiante</CTableHeaderCell>
                      <CTableHeaderCell>Fecha de Nacimiento</CTableHeaderCell>
                      <CTableHeaderCell>Grado</CTableHeaderCell>
                      <CTableHeaderCell>Sección</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {matriculasFiltradas.map((matricula, index) => (
                      <CTableRow key={index} style={{ borderBottom: '1px solid #dee2e6' }}>
                        <CTableDataCell>{index + 1}</CTableDataCell>
                        <CTableDataCell>{matricula.codificacion_matricula}</CTableDataCell>
                        <CTableDataCell>{`${matricula.Nombre} ${matricula.Segundo_nombre || ''} ${matricula.Primer_apellido || ''} ${matricula.Segundo_apellido || ''}`.trim()}</CTableDataCell>
                        <CTableDataCell>
                          {matricula.fecha_nacimiento
                            ? new Date(matricula.fecha_nacimiento).toLocaleDateString('es-ES')
                            : 'No disponible'}
                        </CTableDataCell>
                        <CTableDataCell>{matricula.Nombre_grado || 'No disponible'}</CTableDataCell>
                        <CTableDataCell>{matricula.Nombre_seccion || 'No disponible'}</CTableDataCell>
                      </CTableRow>
                    ))}
                  </CTableBody>
                </CTable>
              ) : (
                <p className="text-center mt-4">No hay matrículas registradas para el año académico seleccionado.</p>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </CContainer>
  );
};

export default MatriculaForm;
