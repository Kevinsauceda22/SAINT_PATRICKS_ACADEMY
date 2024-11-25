import React, { useState, useEffect } from 'react';
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CSpinner,
  CProgress,
  CWidgetStatsA,
  CTable,
  CTableHead,
  CTableBody,
  CTableRow,
  CTableHeaderCell,
  CTableDataCell,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import {
  cilPeople,
  cilUserFollow,
  cilBook,
  cilSchool,
  cilChart,
  cilMoney,
} from '@coreui/icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import usePermission from '../../../context/usePermission';
import AccessDenied from "../pages/AccessDenied/AccessDenied";
import { jwtDecode } from 'jwt-decode';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEstudiantes: 0,
    nuevasMatriculas: 0,
    totalProfesores: 0,
    matriculasActivas: 0,
    matriculasPendientes: 0,
    ingresosMensuales: 0
  });
  const [matriculasPorGrado, setMatriculasPorGrado] = useState([]);
  const [ultimasMatriculas, setUltimasMatriculas] = useState([]);
  const { canSelect, error } = usePermission('Dashboard');

  // Función para registrar en bitácora
  const registrarEnBitacora = async (accion, descripcion) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const decodedToken = jwtDecode(token);
      await axios.post(
        'http://localhost:4000/api/bitacora/registro',
        {
          cod_usuario: decodedToken.cod_usuario,
          cod_objeto: 78, // Dashboard
          accion: accion,
          descripcion: descripcion
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
    } catch (error) {
      console.error('Error al registrar en bitácora:', error);
    }
  };

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        // Registrar vista del dashboard en bitácora
        await registrarEnBitacora('SELECT', 'Acceso al Dashboard');

        // Peticiones en paralelo para mejor rendimiento
        const [statsResponse, matriculasGradoResponse, ultimasMatriculasResponse] = await Promise.all([
          axios.get('http://localhost:4000/api/dashboard/stats', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get('http://localhost:4000/api/dashboard/matriculas-por-grado', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get('http://localhost:4000/api/dashboard/ultimas-matriculas', {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        setStats(statsResponse.data);
        setMatriculasPorGrado(matriculasGradoResponse.data);
        setUltimasMatriculas(ultimasMatriculasResponse.data);
      } catch (error) {
        console.error('Error al cargar datos del dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
        <CSpinner color="primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        Error al cargar los permisos. Por favor, intente nuevamente.
      </div>
    );
  }

  if (!canSelect) {
    return <AccessDenied />;
  }

  return (
    <>
      {/* Widgets de Estadísticas */}
      <CRow>
        <CCol sm={6} lg={3}>
          <CWidgetStatsA
            className="mb-4"
            color="primary"
            value={stats.totalEstudiantes.toString()}
            title="Total Estudiantes"
            icon={<CIcon icon={cilPeople} height={24} />}
          />
        </CCol>
        <CCol sm={6} lg={3}>
          <CWidgetStatsA
            className="mb-4"
            color="info"
            value={stats.nuevasMatriculas.toString()}
            title="Nuevas Matrículas"
            icon={<CIcon icon={cilUserFollow} height={24} />}
          />
        </CCol>
        <CCol sm={6} lg={3}>
          <CWidgetStatsA
            className="mb-4"
            color="success"
            value={stats.totalProfesores.toString()}
            title="Total Profesores"
            icon={<CIcon icon={cilSchool} height={24} />}
          />
        </CCol>
        <CCol sm={6} lg={3}>
          <CWidgetStatsA
            className="mb-4"
            color="warning"
            value={`L. ${stats.ingresosMensuales.toLocaleString()}`}
            title="Ingresos Mensuales"
            icon={<CIcon icon={cilMoney} height={24} />}
          />
        </CCol>
      </CRow>

      {/* Gráfico de Matrículas por Grado */}
      <CRow>
        <CCol xs={12} lg={8}>
          <CCard className="mb-4">
            <CCardHeader>Matrículas por Grado</CCardHeader>
            <CCardBody>
              <div style={{ width: '100%', height: '300px' }}>
                <ResponsiveContainer>
                  <LineChart data={matriculasPorGrado}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="grado" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="matriculas" stroke="#8884d8" name="Estudiantes" />
                    <Line type="monotone" dataKey="capacidad" stroke="#82ca9d" name="Capacidad" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CCardBody>
          </CCard>
        </CCol>

        {/* Estado de Matrículas */}
        <CCol xs={12} lg={4}>
          <CCard className="mb-4">
            <CCardHeader>Estado de Matrículas</CCardHeader>
            <CCardBody>
              <div className="mb-4">
                <div className="d-flex justify-content-between mb-1">
                  <div>Matrículas Activas</div>
                  <div>{stats.matriculasActivas}%</div>
                </div>
                <CProgress value={stats.matriculasActivas} color="success" />
              </div>
              <div className="mb-4">
                <div className="d-flex justify-content-between mb-1">
                  <div>Matrículas Pendientes</div>
                  <div>{stats.matriculasPendientes}%</div>
                </div>
                <CProgress value={stats.matriculasPendientes} color="warning" />
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* Últimas Matrículas */}
      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardHeader>
              <strong>Últimas Matrículas Registradas</strong>
            </CCardHeader>
            <CCardBody>
              <CTable hover responsive>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>Código</CTableHeaderCell>
                    <CTableHeaderCell>Estudiante</CTableHeaderCell>
                    <CTableHeaderCell>Grado</CTableHeaderCell>
                    <CTableHeaderCell>Fecha</CTableHeaderCell>
                    <CTableHeaderCell>Estado</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {ultimasMatriculas.map((matricula, index) => (
                    <CTableRow key={index}>
                      <CTableDataCell>{matricula.codificacion_matricula}</CTableDataCell>
                      <CTableDataCell>{matricula.nombre_estudiante}</CTableDataCell>
                      <CTableDataCell>{matricula.grado}</CTableDataCell>
                      <CTableDataCell>
                        {new Date(matricula.fecha_matricula).toLocaleDateString()}
                      </CTableDataCell>
                      <CTableDataCell>
                        <span 
                          className={`badge ${
                            matricula.estado === 'Activa' ? 'bg-success' : 'bg-warning'
                          }`}
                        >
                          {matricula.estado}
                        </span>
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </>
  );
};

export default Dashboard;