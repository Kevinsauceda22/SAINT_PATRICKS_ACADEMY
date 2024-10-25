import React, { useState, useContext, useEffect, useMemo } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import Swal from 'sweetalert2'; // Importa SweetAlert2
import './UserProfile.css';
import AuthContext from '../../../../context/AuthProvider';

Modal.setAppElement('#root'); // Configuración de accesibilidad para modales

const UserProfile = () => {
  const { auth } = useContext(AuthContext);
  const [qrCode, setQrCode] = useState(null);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [personData, setPersonData] = useState({});
  const [loadingQR, setLoadingQR] = useState(false); // Estado de carga para QR
  const [loadingVerify, setLoadingVerify] = useState(false); // Estado de carga para verificación

  // Función para obtener los datos de la persona
  const fetchPersonData = async () => {
    try {
      const response = await axios.get(`http://localhost:4000/api/personas/${auth.cod_persona}`);
      console.log('Datos de la persona:', response.data); // Agrega esto para depuración
      if (response.data) {
        setPersonData(response.data);
      }
    } catch (error) {
      console.error('Error al obtener los datos de la persona:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al obtener tus datos. Por favor, inténtalo de nuevo más tarde.',
      });
    }
  };
  useEffect(() => {
    fetchPersonData();
  }, [auth.cod_persona]);

  const handle2faClick = async () => {
    setLoadingQR(true);
    try {
      const { data } = await axios.post('http://localhost:4000/api/usuarios/generar-qr', {
        cod_usuario: auth.cod_usuario,
      });
      setQrCode(data.qrCodeUrl);
      setModalIsOpen(true);
    } catch (error) {
      console.error('Error al generar el código QR para 2FA:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al generar el código QR. Por favor, intenta de nuevo.',
      });
    } finally {
      setLoadingQR(false);
    }
  };

  const rolMap = useMemo(() => ({
    1: 'PADRE',
    2: 'ADMINISTRADOR',
    3: 'DOCENTE',
  }), []);

  const verify2FA = async () => {
    if (!twoFactorCode) {
      Swal.fire({
        icon: 'warning',
        title: 'Advertencia',
        text: 'Por favor, introduce el código 2FA.',
      });
      return;
    }

    setLoadingVerify(true);
    try {
      const response = await axios.post('http://localhost:4000/api/usuarios/verificar-2fa', {
        cod_usuario: auth.cod_usuario,
        twoFactorCode,
      });

      if (response.data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Éxito',
          text: '2FA habilitado con éxito',
        });
        setIs2FAEnabled(true);
        setModalIsOpen(false);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: response.data.message,
        });
      }
    } catch (error) {
      console.error('Error al verificar 2FA:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al verificar el código 2FA. Por favor, intenta de nuevo.',
      });
    } finally {
      setLoadingVerify(false);
    }
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  const displayValue = (value) => value || "No disponible";

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-image-container">
          <div className="profile-image">
            <img src="../src/assets/images/user.svg" alt="Foto de perfil" />
          </div>
          <button className="edit-image-button">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
          </button>
        </div>

        <div className="profile-info">
          <h2 className="profile-name">{personData.Nombre || "NO DISPONIBLE"}</h2>
          <p className="profile-username">@{auth.nombre_usuario || "usuario"}</p>
          <h7 className="profile-role">TIPO DE ROL: {rolMap[auth.cod_rol] || "ROL DESCONOCIDO"}</h7>
        </div>
      </div>

      <div className="info-section">
        <h3 className="section-title">Información Personal</h3>
        <div className="info-grid">
          <div className="info-item">
            <label>Email</label>
            <p>{auth.correo_usuario || "usuario@ejemplo.com"}</p>
          </div>

          <div className="info-item">
            <label>Nombre completo</label>
            <p>{displayValue(`${personData.Nombre || ""} ${personData.Segundo_nombre || ""} ${personData.Primer_apellido || ""} ${personData.Segundo_Apellido || ""}`.trim())}</p>
          </div>
          <div className="info-item">
            <label>DNI</label>
            <p>{displayValue(personData.dni_persona)}</p>
          </div>
          <div className="info-item">
            <label>Nacionalidad</label>
            <p>{displayValue(personData.Nacionalidad)}</p>
          </div>
          <div className="info-item">
            <label>Dirección</label>
            <p>{displayValue(personData.direccion_persona)}</p>
          </div>
          <div className="info-item">
            <label>Fecha de nacimiento</label>
            <p>{displayValue(personData.fecha_nacimiento ? new Date(personData.fecha_nacimiento).toLocaleDateString() : null)}</p>
          </div>
          <div className="info-item">
            <label>Primer acceso al sistema:</label>
            <p>{displayValue(auth.primer_ingreso ? new Date(auth.primer_ingreso).toLocaleString() : null)}</p>
          </div>
        </div>
      </div>

      <button className="twofa-button" onClick={handle2faClick} disabled={loadingQR}>
        {loadingQR ? 'Cargando...' : (is2FAEnabled ? '2FA Habilitado' : 'Habilitar Autenticación de Dos Factores (2FA)')}
      </button>

      <button className="edit-button">
        Editar Perfil
      </button>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Código QR para 2FA"
        className="modal"
        overlayClassName="modal-overlay"
      >
        <h2>Escanea este código QR con tu aplicación de autenticación</h2>
        {qrCode ? (
          <>
            <img src={qrCode} alt="Código QR para 2FA" />
            <input
              type="text"
              placeholder="Introduce el código 2FA"
              value={twoFactorCode}
              onChange={(e) => setTwoFactorCode(e.target.value)}
              className="twofa-input"
            />
            <button onClick={verify2FA} className="verify-2fa-button" disabled={loadingVerify}>
              {loadingVerify ? 'Verificando...' : 'Verificar'}
            </button>
          </>
        ) : (
          <p>Cargando código QR...</p>
        )}
        <button onClick={closeModal} className="close-modal-button">Cerrar</button>
      </Modal>
    </div>
  );
};

export default UserProfile;
