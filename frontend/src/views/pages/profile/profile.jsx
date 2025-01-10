import React, { useState, useContext, useEffect, useMemo } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import Swal from 'sweetalert2';
import './UserProfile.css';
import AuthContext from '../../../../context/AuthProvider';

Modal.setAppElement('#root');

const UserProfile = () => {
  const { auth } = useContext(AuthContext);
  const [qrCode, setQrCode] = useState(null);
  const [isTwoFactorEnabled, setIsTwoFactorEnabled] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [personData, setPersonData] = useState({});
  const [loading, setLoading] = useState({ qr: false, verify: false });
  const [activeTab, setActiveTab] = useState('personal');
  const [verificationAttempts, setVerificationAttempts] = useState(0);
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const MAX_ATTEMPTS = 3;

   // API configuration with base URL
   const API_BASE_URL = 'http://74.50.68.87/api';
  
   const getAuthHeaders = () => ({
     headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
   });
   
  useEffect(() => {
    
    const fetchData = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/personas/${auth.cod_persona}`);
        setPersonData(response.data || {});
      } catch (error) {
        Swal.fire({ icon: 'error', title: 'Error', text: 'Error al obtener tus datos. Por favor, inténtalo más tarde.' });
      }
    };

    const check2FAStatus = async () => {
      try {
          const token = localStorage.getItem('token');
          if (!token) {
              console.error('No se encontró el token en localStorage');
              return;
          }

          // Verificar que auth.cod_usuario sea válido
          if (!auth.cod_usuario) {
              console.error('No se encontró el cod_usuario en auth');
              return;
          }

          const response = await axios.get(`${API_BASE_URL}/usuarios/2faStatus/${auth.cod_usuario}`, {
              headers: { Authorization: `Bearer ${token}` },
          });

          // Asumiendo que la respuesta de tu API se ajusta al formato esperado
          console.log('Respuesta de la API:', response.data);
          
          // Aquí revisamos cómo estás manejando la respuesta.
          const is2FAEnabled = response.data.is2FAEnabled; // Cambiado a `is2FAEnabled` según tu respuesta
          setIsTwoFactorEnabled(is2FAEnabled);
          return is2FAEnabled;
      } catch (error) {
          console.error('Error checking 2FA status:', error);
          Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo verificar el estado de 2FA.' });
          return false;
      }
  };

    fetchData();
    check2FAStatus();
  }, [auth.cod_persona, auth.cod_usuario]);


  const generateQR2FA = async () => {
    setLoading((prev) => ({ ...prev, qr: true }));
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `http://74.50.68.87/api/usuarios/enableTwoFactorAuth/${auth.cod_usuario}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.qrCodeUrl) {
        setQrCode(response.data.qrCodeUrl);
        setModalIsOpen(true);
      } else {
        Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo generar el código QR.' });
      }
    } catch {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Error al generar el código QR para 2FA.' });
    } finally {
      setLoading((prev) => ({ ...prev, qr: false }));
    }
  };

 
  const handleVerify = async () => {
    try {
      setError('');
      setSuccess('');
  
      if (!twoFactorCode) { // Cambiado de verificationCode a twoFactorCode
        setError('Por favor ingrese un código');
        return;
      }
  
      if (twoFactorCode.length !== 6 || !/^\d+$/.test(twoFactorCode)) {
        setError('El código debe ser de 6 dígitos numéricos');
        return;
      }
  
      const response = await fetch('http://74.50.68.87/api/usuarios/verifyTwoFactorAuthCode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ twoFactorCode })
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.message || 'Error en la verificación');
      }
  
      // Si la verificación es exitosa
      setSuccess('Código verificado correctamente');
      setIsTwoFactorEnabled(true); // Actualizamos el estado local
      setTwoFactorCode(''); // Limpiamos el código
      closeModal(); // Cerramos el modal
  
      // Mostrar mensaje de éxito al usuario
      Swal.fire({
        icon: 'success',
        title: '¡2FA Activado!',
        text: 'La autenticación de dos factores ha sido habilitada correctamente. A partir de ahora necesitarás usar un código de verificación para iniciar sesión.',
        confirmButtonText: 'Entendido'
      });
  
      // Actualizar el estado en la base de datos
      await axios.post(
        `${API_BASE_URL}/usuarios/update-2fa-status`,
        { 
          cod_usuario: auth.cod_usuario,
          is_two_factor_enabled: 1 
        },
        getAuthHeaders()
      );
  
    } catch (error) {
      console.error('Error en la verificación:', error);
      setError(error.message);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo verificar el código. Por favor, inténtalo de nuevo.'
      });
    }
  };

  const disableTwoFactor = async () => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Estás a punto de deshabilitar la Autenticación de Dos Factores',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, deshabilitar',
      cancelButtonText: 'Cancelar',
    });

    if (result.isConfirmed) {
      try {
        const response = await axios.post(
          'http://74.50.68.87/api/usuarios/disableTwoFactorAuth',
          { cod_usuario: auth.cod_usuario },
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );

        if (response.data.success) {
          Swal.fire({ icon: 'success', title: '2FA Deshabilitado', text: '2FA ha sido desactivado.' });
          setIsTwoFactorEnabled(false);
        } else {
          Swal.fire({ icon: 'error', title: 'Error', text: response.data.message || 'No se pudo deshabilitar 2FA.' });
        }
      } catch {
        Swal.fire({ icon: 'error', title: 'Error', text: 'Error al deshabilitar 2FA.' });
      }
    }
  };

  const closeModal = () => setModalIsOpen(false);
  const rolMap = useMemo(() => ({ 1: 'PADRE', 2: 'ADMINISTRADOR', 3: 'DOCENTE', 4: 'MANAGER' }), []);

  return (
    <div className="profile-container">
      {/* Header Section */}
      <div className="profile-header">
        <div className="profile-avatar">
          <img src="../src/assets/images/user.svg" alt="Foto de perfil" className="avatar-image" />
          <button className="avatar-edit-button">
            <i className="fas fa-camera"></i>
          </button>
        </div>
        <div className="profile-info">
          <h1 className="profile-name">{personData.Nombre || 'NO DISPONIBLE'}</h1>
          <p className="profile-username">@{auth.nombre_usuario || 'usuario'}</p>
          <span className="profile-role">{rolMap[auth.cod_rol] || 'ROL DESCONOCIDO'}</span>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="profile-tabs">
        <button 
          className={`tab-button ${activeTab === 'personal' ? 'active' : ''}`}
          onClick={() => setActiveTab('personal')}
        >
          Información Personal
        </button>
        <button 
          className={`tab-button ${activeTab === 'security' ? 'active' : ''}`}
          onClick={() => setActiveTab('security')}
        >
          Seguridad
        </button>
      </div>

      {/* Personal Information Tab */}
      {activeTab === 'personal' && (
        <div className="tab-content">
          <div className="info-card">
            <div className="info-grid">
              <div className="info-item">
                <i className="fas fa-envelope"></i>
                <div className="info-details">
                  <label>Email</label>
                  <p>{auth.correo_usuario || 'usuario@ejemplo.com'}</p>
                </div>
              </div>
              <div className="info-item">
                <i className="fas fa-id-card"></i>
                <div className="info-details">
                  <label>DNI</label>
                  <p>{personData.dni_persona || 'No disponible'}</p>
                </div>
              </div>
              <div className="info-item">
                <i className="fas fa-map-marker-alt"></i>
                <div className="info-details">
                  <label>Dirección</label>
                  <p>{personData.direccion_persona || 'No disponible'}</p>
                </div>
              </div>
              <div className="info-item">
                <i className="fas fa-calendar"></i>
                <div className="info-details">
                  <label>Fecha de Nacimiento</label>
                  <p>{personData.fecha_nacimiento || 'No disponible'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

     {/* Security Tab */}
  {activeTab === 'security' && (
    <div className="tab-content">
      <div className="security-card">
        <div className="security-status">
          <i className={`fas fa-shield-alt ${isTwoFactorEnabled ? 'enabled' : ''}`}></i>
          <div className="security-info">
            <h3>Autenticación de Dos Factores (2FA)</h3>
            <p>{isTwoFactorEnabled ? '2FA Activo' : 'Desactivado'}</p>
          </div>
        </div>
        <div className="security-actions">
          {isTwoFactorEnabled ? (
            <button className="button-danger" onClick={disableTwoFactor}>
              Deshabilitar 2FA
            </button>
          ) : (
            <button className="button-primary" onClick={generateQR2FA} disabled={loading.qr}>
              {loading.qr ? 'Generando...' : 'Habilitar 2FA'}
            </button>
          )}
        </div>
      </div>
    </div>
  )}


      {/* 2FA Setup Modal */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        className="modal"
        overlayClassName="modal-overlay"
      >
        <div className="modal-content">
          <h2 className="modal-title">Configurar Autenticación de Dos Factores</h2>
          <div className="modal-body">
            {loading.qr ? (
              <div className="loading-spinner"></div>
            ) : (
              <>
                {qrCode && (
                  <div className="qr-container">
                    <img src={qrCode} alt="Código QR" className="qr-code" />
                    <p className="qr-instructions">
                      Escanea este código QR con Google Authenticator o Microsoft Authenticator
                      para configurar la autenticación de dos factores
                    </p>
                  </div>
                )}
                <div className="verification-section">
                  <input
                    type="text"
                    className="verification-input"
                    placeholder="Ingresa el código de 6 dígitos"
                    value={twoFactorCode}
                    onChange={(e) => setTwoFactorCode(e.target.value)}
                    maxLength={6}
                  />
                  <div className="modal-actions">
                    <button className="button-secondary" onClick={closeModal}>
                      Cancelar
                    </button>
                    <button 
                      className="button-primary"
                      onClick={handleVerify} 
                      disabled={loading.verify}
                    >
                      {loading.verify ? 'Verificando...' : 'Verificar'}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default UserProfile;