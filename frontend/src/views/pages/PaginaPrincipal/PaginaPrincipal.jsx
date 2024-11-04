import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Calendar, Clock, Book, Award, User, Activity } from 'lucide-react';
import usePermission from '../../../../context/usePermission';
import AccessDenied from "../AccessDenied/AccessDenied"


const styles = {
  dashboard: {
    padding: '24px',
    backgroundColor: '#f5f5f5',
    minHeight: '100vh',
    fontFamily: 'Arial, sans-serif'
  },
  header: {
    marginBottom: '32px'
  },
  title: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: '8px'
  },
  subtitle: {
    fontSize: '1rem',
    color: '#666',
    marginTop: '0'
  },
  cardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginBottom: '32px'
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    transition: 'transform 0.2s ease',
    ':hover': {
      transform: 'translateY(-2px)'
    }
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '16px'
  },
  cardIcon: {
    marginRight: '16px',
    padding: '12px',
    borderRadius: '50%',
    backgroundColor: '#f0f0f0'
  },
  cardContent: {
    marginLeft: '12px'
  },
  cardLabel: {
    fontSize: '0.875rem',
    color: '#666',
    marginBottom: '4px'
  },
  cardValue: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#1a1a1a',
    margin: '0'
  },
  chartsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
    gap: '24px',
    marginBottom: '32px'
  },
  chartCard: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    height: '400px'
  },
  chartTitle: {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: '16px'
  },
  eventsList: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  eventItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px',
    backgroundColor: '#f8f8f8',
    borderRadius: '6px',
    marginBottom: '12px'
  },
  eventIcon: {
    marginRight: '12px',
    color: '#666'
  },
  eventInfo: {
    flex: '1'
  },
  eventTitle: {
    fontSize: '1rem',
    fontWeight: 'bold',
    color: '#1a1a1a',
    margin: '0'
  },
  eventDate: {
    fontSize: '0.875rem',
    color: '#666',
    margin: '4px 0 0 0'
  },
  '@media (max-width: 768px)': {
    chartsGrid: {
      gridTemplateColumns: '1fr'
    },
    cardGrid: {
      gridTemplateColumns: '1fr',
    }
  }
};

const ParentDashboard = () => {
  const { canSelect, loading, error } = usePermission('PaginaPrincipal');

  const attendanceData = [
    { mes: 'Ene', asistencia: 95 },
    { mes: 'Feb', asistencia: 98 },
    { mes: 'Mar', asistencia: 92 },
    { mes: 'Abr', asistencia: 96 },
    { mes: 'May', asistencia: 94 },
  ];

  const gradesData = [
    { materia: 'Matemáticas', calificacion: 85 },
    { materia: 'Español', calificacion: 92 },
    { materia: 'Ciencias', calificacion: 88 },
    { materia: 'Historia', calificacion: 90 },
  ];

  const nextEvents = [
    { fecha: '5 Nov', evento: 'Reunión de padres' },
    { fecha: '10 Nov', evento: 'Exposición de ciencias' },
    { fecha: '15 Nov', evento: 'Festival deportivo' },
  ];

    // Verificar permisos
    if (!canSelect) {
      return <AccessDenied />;
    }

  return (
    <div style={styles.dashboard}>
      <header style={styles.header}>
        <h1 style={styles.title}>Página Principal</h1>
        <p style={styles.subtitle}>Bienvenido al portal para padres</p>
      </header>

      <div style={styles.cardGrid}>
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={{...styles.cardIcon, backgroundColor: '#e6f0ff'}}>
              <Calendar color="#2563eb" size={24} />
            </div>
            <div style={styles.cardContent}>
              <p style={styles.cardLabel}>Asistencia</p>
              <h3 style={styles.cardValue}>95%</h3>
            </div>
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={{...styles.cardIcon, backgroundColor: '#e6ffe6'}}>
              <Award color="#22c55e" size={24} />
            </div>
            <div style={styles.cardContent}>
              <p style={styles.cardLabel}>Promedio</p>
              <h3 style={styles.cardValue}>8.9</h3>
            </div>
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={{...styles.cardIcon, backgroundColor: '#f3e6ff'}}>
              <Book color="#7c3aed" size={24} />
            </div>
            <div style={styles.cardContent}>
              <p style={styles.cardLabel}>Tareas</p>
              <h3 style={styles.cardValue}>12/15</h3>
            </div>
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={{...styles.cardIcon, backgroundColor: '#ffe6e6'}}>
              <Activity color="#dc2626" size={24} />
            </div>
            <div style={styles.cardContent}>
              <p style={styles.cardLabel}>Actividades</p>
              <h3 style={styles.cardValue}>5</h3>
            </div>
          </div>
        </div>
      </div>

      <div style={styles.chartsGrid}>
        <div style={styles.chartCard}>
          <h2 style={styles.chartTitle}>Asistencia Mensual</h2>
          <ResponsiveContainer width="100%" height="85%">
            <LineChart data={attendanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="asistencia" stroke="#2563eb" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div style={styles.chartCard}>
          <h2 style={styles.chartTitle}>Calificaciones por Materia</h2>
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={gradesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="materia" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="calificacion" fill="#7c3aed" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={styles.eventsList}>
        <h2 style={styles.chartTitle}>Próximos Eventos</h2>
        {nextEvents.map((event, index) => (
          <div key={index} style={styles.eventItem}>
            <Clock style={styles.eventIcon} size={20} />
            <div style={styles.eventInfo}>
              <p style={styles.eventTitle}>{event.evento}</p>
              <p style={styles.eventDate}>{event.fecha}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ParentDashboard;