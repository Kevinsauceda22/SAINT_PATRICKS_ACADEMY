import React, { useState, useEffect } from 'react';
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
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
  CButton,
} from '@coreui/react';
import { useNavigate } from 'react-router-dom';

const MatriculasPorGrado = () => {
  const navigate = useNavigate();
  const [grados, setGrados] = useState([]);
  const [alumnos, setAlumnos] = useState([]);
  const [selectedGrado, setSelectedGrado] = useState('');
  const [anioReciente, setAnioReciente] = useState(null);
  const [loading, setLoading] = useState(false);
  const [aniosAcademicos, setAniosAcademicos] = useState([]);

  // Obtener los grados y los años académicos
  const obtenerGradosYAniosAcademicos = async () => {
    try {
      const response = await axios.get('http://74.50.68.87:4000/api/matricula/opciones');
      const periodos = response.data.periodos_matricula || [];
      const anios = [...new Set(periodos.map((p) => p.Anio_academico))].sort((a, b) => b - a);
      setAniosAcademicos(anios);
      setAnioReciente(anios[0]);
      setGrados(response.data.grados || []);
    } catch (error) {
      console.error('Error al obtener los grados y los años académicos:', error);
    }
  };

  // Obtener los alumnos matriculados por grado y año académico
  const obtenerAlumnosMatriculadosPorGradoYAno = async (cod_grado, anio) => {
    if (!cod_grado || !anio) return;
    setAlumnos([]);
    setLoading(true);
    try {
      const response = await axios.get(`http://74.50.68.87:4000/api/matricula/alumnos/${cod_grado}`, {
        params: { anio_academico: anio },
      });
      setAlumnos(response.data.data || []);
    } catch (error) {
      console.error('Error al obtener los alumnos matriculados por grado y año académico:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    obtenerGradosYAniosAcademicos();
  }, []);

  useEffect(() => {
    if (selectedGrado && anioReciente) {
      obtenerAlumnosMatriculadosPorGradoYAno(selectedGrado, anioReciente);
    }
  }, [selectedGrado, anioReciente]);

  const exportToPDF = () => {
    const doc = new jsPDF();

    if (alumnos.length === 0) {
        console.warn('No hay datos de alumnos para exportar.');
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
        doc.setFontSize(14);
        doc.text('Reporte de Alumnos Matriculados', doc.internal.pageSize.width / 2, 30, { align: 'center' });
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text('Casa Club del periodista, Colonia del Periodista', doc.internal.pageSize.width / 2, 40, { align: 'center' });
        doc.text('Teléfono: (504) 2234-8871', doc.internal.pageSize.width / 2, 45, { align: 'center' });
        doc.text('Correo: info@saintpatrickacademy.edu', doc.internal.pageSize.width / 2, 50, { align: 'center' });
        doc.setLineWidth(0.5);
        doc.setDrawColor(0, 102, 51);
        doc.line(10, 55, doc.internal.pageSize.width - 10, 55);

        // Información general
        const grado = grados.find(grado => String(grado.Cod_grado) === String(selectedGrado));
        const nombreGrado = grado ? grado.Nombre_grado : 'N/A';
        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.text(`Grado: ${nombreGrado}`, 10, 65);
        doc.text(`Año Académico: ${anioReciente || 'N/A'}`, 10, 70);

        // Tabla de alumnos
        doc.autoTable({
            startY: 80,
            head: [['#', 'Nombre del Alumno', 'Fecha de Nacimiento', 'Grado', 'Sección']],
            body: alumnos.map((alumno, index) => [
                index + 1,
                `${alumno.Nombre || ''} ${alumno.Segundo_nombre || ''} ${alumno.Primer_apellido || ''} ${alumno.Segundo_apellido || ''}`.trim(),
                alumno.fecha_nacimiento ? new Date(alumno.fecha_nacimiento).toLocaleDateString('es-ES') : 'No disponible',
                alumno.Nombre_grado || 'No disponible',
                alumno.Nombre_seccion || 'No disponible',
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

        // Abrir el PDF en una nueva pestaña
        const pdfBlob = doc.output('blob');
        const pdfURL = URL.createObjectURL(pdfBlob);

        const reportTitle = `Reporte de Alumnos Matriculados`;
        const newWindow = window.open(pdfURL, '_blank');
        if (newWindow) {
            newWindow.document.title = reportTitle;
        } else {
            console.warn('No se pudo abrir el reporte en una nueva pestaña.');
        }
    };

    img.onerror = () => {
        console.warn('No se pudo cargar el logo. El PDF se generará sin el logo.');
    };
};


  const exportToXLSX = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      alumnos.map((alumno, index) => ({
        '#': index + 1,
        'Nombre del Alumno': `${alumno.Nombre || ''} ${alumno.Segundo_nombre || ''} ${alumno.Primer_apellido || ''} ${alumno.Segundo_apellido || ''}`.trim(),
        'Fecha de Nacimiento': alumno.fecha_nacimiento
          ? new Date(alumno.fecha_nacimiento).toLocaleDateString('es-ES')
          : 'No disponible',
        'Grado': alumno.Nombre_grado || 'No disponible',
        'Sección': alumno.Nombre_seccion || 'No disponible',
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Alumnos');
    XLSX.writeFile(workbook, 'Reporte_Alumnos_Matriculados.xlsx');
  };

  return (
    <CContainer>
      <CRow className="mb-4">
        <CCol xs={12}>
          <CButton
            style={{
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              padding: '10px 20px',
              fontSize: '16px',
            }}
            className="mb-4"
            onClick={() => navigate('/matricula')}
          >
            <i className="bi bi-arrow-left"></i> Volver a Matrículas
          </CButton>
          <CCard className="shadow-sm">
            <CCardBody>
              <CCardTitle className="text-center mb-4">
                <h4 className="fw-bold">Alumnos Matriculados por Grado</h4>
                <p className="text-muted">Año Académico: {anioReciente || 'Cargando...'}</p>
              </CCardTitle>
              <div className="d-flex justify-content-around mb-4">
                <select
                  className="form-select form-select-lg border-primary shadow-sm"
                  style={{ width: '250px', borderRadius: '5px' }}
                  value={selectedGrado}
                  onChange={(e) => setSelectedGrado(e.target.value)}
                >
                  <option value="">Selecciona un grado</option>
                  {grados.map((grado) => (
                    <option key={grado.Cod_grado} value={grado.Cod_grado}>
                      {grado.Nombre_grado}
                    </option>
                  ))}
                </select>
                <select
                  className="form-select form-select-lg border-secondary shadow-sm"
                  style={{ width: '200px', borderRadius: '5px' }}
                  value={anioReciente}
                  onChange={(e) => setAnioReciente(e.target.value)}
                >
                  {aniosAcademicos.map((anio) => (
                    <option key={anio} value={anio}>
                      {anio}
                    </option>
                  ))}
                </select>
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
              ) : alumnos.length > 0 ? (
                <CTable
                  striped
                  hover
                  responsive
                  className="mt-4"
                  style={{ backgroundColor: '#f8f9fa', borderRadius: '10px' }}
                >
                  <CTableHead className="bg-success text-white">
                    <CTableRow>
                      <CTableHeaderCell>#</CTableHeaderCell>
                      <CTableHeaderCell>Nombre del Alumno</CTableHeaderCell>
                      <CTableHeaderCell>Fecha de Nacimiento</CTableHeaderCell>
                      <CTableHeaderCell>Grado</CTableHeaderCell>
                      <CTableHeaderCell>Sección</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {alumnos.map((alumno, index) => (
                      <CTableRow key={index} style={{ borderBottom: '1px solid #dee2e6' }}>
                        <CTableDataCell>{index + 1}</CTableDataCell>
                        <CTableDataCell>
                          {`${alumno.Nombre || ''} ${alumno.Segundo_nombre || ''} ${alumno.Primer_apellido || ''} ${alumno.Segundo_apellido || ''}`.trim()}
                        </CTableDataCell>
                        <CTableDataCell>
                          {alumno.fecha_nacimiento
                            ? new Date(alumno.fecha_nacimiento).toLocaleDateString('es-ES')
                            : 'No disponible'}
                        </CTableDataCell>
                        <CTableDataCell>{alumno.Nombre_grado || 'No disponible'}</CTableDataCell>
                        <CTableDataCell>{alumno.Nombre_seccion || 'No disponible'}</CTableDataCell>
                      </CTableRow>
                    ))}
                  </CTableBody>
                </CTable>
              ) : (
                <p className="text-center mt-4">
                  No hay alumnos matriculados para el grado seleccionado en el año académico {anioReciente}.
                </p>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </CContainer>
  );
};

export default MatriculasPorGrado;
