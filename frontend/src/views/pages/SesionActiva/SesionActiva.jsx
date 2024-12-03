import React from 'react';
import { AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // Importa useNavigate
import '../SesionActiva/SesionActiva.css';

const ActiveSession = () => {
  const navigate = useNavigate(); // Inicializa useNavigate

  const handleLogout = () => {
    // Eliminar el token del localStorage
    localStorage.removeItem('token');
    console.log('Cerrando sesión...');
    // Redirigir al login
    window.location.href = '/login';


  };

  const handleStay = () => {
    console.log('Permaneciendo en la sesión actual...');
    // Redirigir al Dashboard
    navigate('/dashboard');


  };

  return (
    <div className="session-container">
      <div className="decorative-circle circle-1"></div>
      <div className="decorative-circle circle-2"></div>
      
      <div className="session-card">
        <div className="card-content">
          <div className="icon-container">
            <AlertCircle className="alert-icon" />
          </div>
          
          <h2 className="session-title">
            Sesión Activa
          </h2>
          
          <p className="session-message">
            Actualmente hay una sesión activa. Para ir al login primero tienes que cerrar la sesión activa.
          </p>
          
          <div className="button-container">
            <button 
              onClick={handleStay}
              className="btn btn-primary"
            >
              Permanecer
            </button>
            
            <button 
              onClick={handleLogout}
              className="btn btn-outline"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActiveSession;
