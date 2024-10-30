import React, { useEffect, useState } from 'react';
import {
  CContainer,
  CRow,
  CCol,
  CCard,
  CCardBody,
  CFormSelect,
  CSpinner,
  CTable,
  CTableHeaderCell,
  CTableBody,
  CTableRow,
  CTableDataCell,
} from '@coreui/react';

const ListaAsistencia = () => {
  const [secciones, setSecciones] = useState([]);
  const [alumnos, setAlumnos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [codSeccionSeleccionada, setCodSeccionSeleccionada] = useState('');

  useEffect(() => {
    fetchSecciones();
  }, []);

  const fetchSecciones = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/seccionalumno/secciones');
      if (!response.ok) throw new Error('Error al cargar secciones.');
      const data = await response.json();
      setSecciones(data);
    } catch (error) {
      console.error('Error al obtener las secciones:', error);
    } finally {
      setCargando(false);
    }
  };

  const fetchAlumnosPorSeccion = async (codSeccion) => {
    try {
      const response = await fetch(`http://localhost:4000/api/seccionalumno/estudiantes/${codSeccion}`);
      if (!response.ok) throw new Error('Error al cargar estudiantes.');
      const data = await response.json();
      setAlumnos(data);
    } catch (error) {
      console.error('Error al obtener los estudiantes:', error);
    }
  };

  const handleSeccionChange = (e) => {
    const codSeccion = e.target.value;
    setCodSeccionSeleccionada(codSeccion);
    setAlumnos([]);
    if (codSeccion) {
      fetchAlumnosPorSeccion(codSeccion);
    }
  };

  return (
    <CContainer>
      <CRow className="justify-content-center">
        <CCol md="8">
          <CCard>
            <CCardBody>
              <h3>Selecciona una Sección</h3>
              {cargando ? (
                <CSpinner color="primary" />
              ) : (
                <CFormSelect
                  aria-label="Seleccionar sección"
                  value={codSeccionSeleccionada}
                  onChange={handleSeccionChange}
                >
                  <option value="">Selecciona una sección</option>
                  {secciones.map((seccion) => (
                    <option key={seccion.Cod_seccion} value={seccion.Cod_seccion}>
                      {seccion.Nombre_seccion}
                    </option>
                  ))}
                </CFormSelect>
              )}
            </CCardBody>
          </CCard>

          <h4 className="mt-4">Estudiantes en la Sección</h4>
          {alumnos.length === 0 ? (
            <p>No hay estudiantes en esta sección.</p>
          ) : (
            <CTable striped hover>
              <thead>
                <tr>
                  <CTableHeaderCell>ID</CTableHeaderCell>
                  <CTableHeaderCell>Nombre Completo</CTableHeaderCell>
                </tr>
              </thead>
              <CTableBody>
                {alumnos.map((alumno) => (
                  <CTableRow key={alumno.Cod_seccion_persona}>
                    <CTableDataCell>{alumno.Cod_seccion_persona}</CTableDataCell>
                    <CTableDataCell>{alumno.Nombre_Completo}</CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          )}
        </CCol>
      </CRow>
    </CContainer>
  );
};

export default ListaAsistencia;
