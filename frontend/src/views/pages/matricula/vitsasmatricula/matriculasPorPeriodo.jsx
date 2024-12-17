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

const GradosYSecciones = () => {
  const navigate = useNavigate();
  const [grados, setGrados] = useState([]);
  const [secciones, setSecciones] = useState([]);
  const [alumnos, setAlumnos] = useState([]);
  const [selectedGrado, setSelectedGrado] = useState('');
  const [selectedSeccion, setSelectedSeccion] = useState('');
  const [anioReciente, setAnioReciente] = useState(null);
  const [loading, setLoading] = useState(false);
  const [aniosAcademicos, setAniosAcademicos] = useState([]);

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

  const obtenerSeccionesConDetalles = async (cod_grado) => {
    if (!cod_grado) return;
    setLoading(true);
    setSecciones([]);
    setSelectedSeccion('');
    try {
      const response = await axios.get(`http://74.50.68.87:4000/api/matricula/detalles/${cod_grado}`);
      setSecciones(response.data.data || []);
    } catch (error) {
      console.error('Error al obtener las secciones por grado:', error);
    } finally {
      setLoading(false);
    }
  };

  const obtenerAlumnosMatriculadosPorSeccionYAno = async (cod_seccion, anio_academico) => {
    if (!cod_seccion || !anio_academico) {
      console.warn('Parámetros faltantes: cod_seccion o anio_academico');
      return;
    }
  
    try {
      console.log(`Fetching alumnos for sección: ${cod_seccion}, año académico: ${anio_academico}`);
      const response = await axios.get(
        `http://74.50.68.87:4000/api/matricula/alumnos/seccion/${cod_seccion}`,
        {
          params: { anio_academico }, // Pasar el año académico como query param
        }
      );
  
      console.log('Respuesta de la API:', response.data);
      setAlumnos(response.data.data || []); // Actualizar el estado con los alumnos obtenidos
    } catch (error) {
      console.error('Error al obtener alumnos matriculados:', error);
      setAlumnos([]); // En caso de error, resetear la lista de alumnos
    }
  };
  
  const exportToPDF = () => {
    const doc = new jsPDF();

    if (!Array.isArray(alumnos) || alumnos.length === 0) {
        console.warn('No hay datos de alumnos para mostrar en el PDF.');
        return;
    }

    const img = new Image();
    img.src = logo;

    const gradoEncontrado = grados.find(grado => String(grado.Cod_grado) === String(selectedGrado));
    const nombreGrado = gradoEncontrado ? gradoEncontrado.Nombre_grado : 'N/A';
    const seccionEncontrada = secciones.find(seccion => String(seccion.Cod_secciones) === String(selectedSeccion));
    const nombreSeccion = seccionEncontrada ? seccionEncontrada.Nombre_seccion : 'N/A';

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
        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.text(`Grado: ${nombreGrado}`, 10, 65);
        doc.text(`Sección: ${nombreSeccion}`, 10, 70);
        doc.text(`Año Académico: ${anioReciente || 'N/A'}`, 10, 75);

        // Tabla de alumnos
        doc.autoTable({
            startY: 80,
            head: [['#', 'Nombre del Alumno', 'Fecha de Nacimiento']],
            body: alumnos.map((alumno, index) => [
                index + 1,
                `${alumno.Nombre} ${alumno.Segundo_nombre || ''} ${alumno.Primer_apellido} ${alumno.Segundo_apellido}`.trim(),
                alumno.fecha_nacimiento ? new Date(alumno.fecha_nacimiento).toLocaleDateString('es-ES') : 'No disponible',
            ]),
            headStyles: { fillColor: [0, 102, 51], textColor: [255, 255, 255], fontSize: 10 },
            styles: { fontSize: 10, cellPadding: 3 },
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
        const pdfBlob = doc.output('blob'); // Generar el archivo como Blob
        const pdfURL = URL.createObjectURL(pdfBlob); // Crear un enlace al Blob
        window.open(pdfURL, '_blank'); // Abrir el PDF en una nueva pestaña
    };

    img.onerror = () => {
        console.warn('No se pudo cargar el logo. El PDF se generará sin el logo.');
    };
};

  const exportToXLSX = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      alumnos.map((alumno, index) => ({
        '#': index + 1,
        'Nombre del Alumno': `${alumno.Nombre} ${alumno.Segundo_nombre || ''} ${alumno.Primer_apellido} ${alumno.Segundo_apellido}`.trim(),
        'Fecha de Nacimiento': alumno.fecha_nacimiento
          ? new Date(alumno.fecha_nacimiento).toLocaleDateString('es-ES')
          : 'No disponible',
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Alumnos');
    XLSX.writeFile(workbook, 'Reporte_Alumnos_Matriculados.xlsx');
  };

  useEffect(() => {
    obtenerGradosYAniosAcademicos();
  }, []);

  useEffect(() => {
    if (selectedGrado) {
      obtenerSeccionesConDetalles(selectedGrado);
    }
  }, [selectedGrado]);

  useEffect(() => {
    if (selectedSeccion && anioReciente) {
      obtenerAlumnosMatriculadosPorSeccionYAno(selectedSeccion, anioReciente);
    } else {
      setAlumnos([]);
    }
  }, [selectedSeccion, anioReciente]);

  return (
    <CContainer>
      <CRow className="mb-4">
        <CCol xs={12}>
          {/* Botón para redirigir */}
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
                <h4 className="fw-bold">Alumnos Matriculados por Sección</h4>
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
                  className="form-select form-select-lg border-success shadow-sm"
                  style={{ width: '250px', borderRadius: '5px' }}
                  value={selectedSeccion}
                  onChange={(e) => setSelectedSeccion(e.target.value)}
                  disabled={!secciones.length}
                >
                  <option value="">Selecciona una sección</option>
                  {secciones.map((seccion) => (
                    <option key={seccion.Cod_secciones} value={seccion.Cod_secciones}>
                      {seccion.Nombre_seccion}
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
                      </CTableRow>
                    ))}
                  </CTableBody>
                </CTable>
              ) : (
                <p className="text-center mt-4">No hay alumnos matriculados para la sección seleccionada.</p>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </CContainer>
  );
};

export default GradosYSecciones;
