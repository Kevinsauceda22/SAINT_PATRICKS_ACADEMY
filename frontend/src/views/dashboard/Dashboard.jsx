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
  CButton,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import {
  cilPeople,
  cilUserFollow,
  cilBook,
  cilSchool,
  cilChart,
  cilMoney,
  cilFile
} from '@coreui/icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import usePermission from '../../../context/usePermission';
import AccessDenied from "../pages/AccessDenied/AccessDenied";
import { jwtDecode } from 'jwt-decode';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const Dashboard = () => {
  const [year, setYear] = useState(new Date().getFullYear());
  const handleYearChange = (event) => {
    setYear(event.target.value);
  };

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
  const dashboardRef = React.useRef(null);

  // Nuevos estados para saludo personalizado
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [saludo, setSaludo] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = jwtDecode(token);
      setNombreUsuario(decoded.nombre_usuario || 'Usuario');

      const hora = new Date().getHours();
      if (hora >= 5 && hora < 12) {
        setSaludo('Buenos días');
      } else if (hora >= 12 && hora < 18) {
        setSaludo('Buenas tardes');
      } else {
        setSaludo('Buenas noches');
      }
    }
  }, []);

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

        await registrarEnBitacora('SELECT', `Acceso al Dashboard - Año ${year}`);

        const response = await axios.get(`http://localhost:4000/api/dashboard/stats?year=${year}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(response.data);

        const gradosResponse = await axios.get(`http://localhost:4000/api/dashboard/matriculas-por-grado?year=${year}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMatriculasPorGrado(gradosResponse.data);

        const ultimasResponse = await axios.get(`http://localhost:4000/api/dashboard/ultimas-matriculas?year=${year}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUltimasMatriculas(ultimasResponse.data);
      } catch (error) {
        console.error('Error al cargar datos del dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [year]);

  const generarReportePDF = async () => {
    try {
      await registrarEnBitacora('REPORT', 'Generación de reporte PDF del Dashboard');

      const dashboard = dashboardRef.current;
      const pdf = new jsPDF('p', 'mm', 'a4');
      const fecha = new Date().toLocaleDateString();

      pdf.setFontSize(18);
      pdf.setTextColor(0, 102, 51);
      pdf.text('Reporte de Dashboard - Saint Patrick´s Academy', 20, 20);

      pdf.setFontSize(12);
      pdf.setTextColor(0, 0, 0);
      pdf.text(`Fecha de generación: ${fecha}`, 20, 30);
      pdf.text(`Datos filtrados del año: ${year}`, 20, 40);

      pdf.setDrawColor(0, 102, 51);
      pdf.line(20, 45, 190, 45);

      let yPos = 55;

      const secciones = document.querySelectorAll('.dashboard-section');
      for (let i = 0; i < secciones.length; i++) {
        const seccion = secciones[i];
        const canvas = await html2canvas(seccion, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');

        const tituloSeccion = seccion.querySelector('.card-header')?.textContent || `Sección ${i + 1}`;
        pdf.setFontSize(14);
        pdf.text(tituloSeccion, 20, yPos);
        yPos += 10;

        const imgWidth = 170;
        const imgHeight = canvas.height * imgWidth / canvas.width;

        if (yPos + imgHeight > 280) {
          pdf.addPage();
          yPos = 20;
        }

        pdf.addImage(imgData, 'PNG', 20, yPos, imgWidth, imgHeight);
        yPos += imgHeight + 15;
      }

      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      pdf.text('© Saint Patricks - Sistema de Gestión de Matrículas', 20, 287);

      pdf.save('Dashboard-Saint-Patricks.pdf');
    } catch (error) {
      console.error('Error al generar el PDF:', error);
      alert('Ha ocurrido un error al generar el reporte PDF. Por favor, intente nuevamente.');
    }
  };

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

  const data = [
    { name: 'Total Estudiantes', value: stats.totalEstudiantes },
    { name: 'Nuevas Matrículas', value: stats.nuevasMatriculas },
    { name: 'Total Profesores', value: stats.totalProfesores },
    { name: 'Ingresos Mensuales', value: stats.ingresosMensuales },
  ];

  return (
    <div ref={dashboardRef}>
      {/* Saludo personalizado */}
      <CRow className="mb-2">
        <CCol>
          <h5>{`${saludo}, ${nombreUsuario}`}</h5>
        </CCol>
      </CRow>

      {/* Cabecera con botón de reporte */}
      <CRow className="mb-4 align-items-center">
        <CCol>
          <h2 className="mb-0">Página Principal - Saint Patrick´s Academy</h2>
        </CCol>
        <CCol xs="auto">
          <CDropdown variant="btn-group">
            <CButton
              color="success"
              onClick={generarReportePDF}
              className="d-flex align-items-center"
            >
              <CIcon icon={cilFile} className="me-2" /> Reporte
            </CButton>
            <CDropdownToggle color="success" split />
            <CDropdownMenu>
              <CDropdownItem onClick={generarReportePDF}>PDF</CDropdownItem>
              <CDropdownItem disabled>Excel</CDropdownItem>
            </CDropdownMenu>
          </CDropdown>
        </CCol>
      </CRow>

      {/* Filtro por año */}
      <CRow className="mb-4 align-items-center">
        <CCol className="d-flex justify-content-start">
         
        </CCol>
      </CRow>
      {/* Widgets de Estadísticas */}
     
      <CRow className="mb-4 align-items-center">
  <CCol className="d-flex justify-content-start">
    <label htmlFor="yearSelect" className="fw-bold me-2">Filtrar por año:</label>
    <select
      id="yearSelect"
      value={year}
      onChange={handleYearChange}
      className="form-select"
      style={{ width: "100px" }}
    >
      {Array.from({ length: 7 }, (_, i) => new Date().getFullYear() - i).map((y) => (
        <option key={y} value={y}>{y}</option>
      ))}
    </select>
  </CCol>
</CRow>

      <CRow className="dashboard-section">
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

      {/* Gráfico de Métricas */}
      <CRow className="dashboard-section">
        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardHeader>Métricas Clave</CCardHeader>
            <CCardBody>
              <div style={{ width: '100%', height: '300px' }}>
                <ResponsiveContainer>
                  <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="value" stroke="#8884d8" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    
      {/* Gráfico de Matrículas por Grado */}
      <CRow className="dashboard-section">
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
      <CRow className="dashboard-section">
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
    </div>
  );
};

export default Dashboard;