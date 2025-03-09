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
  const [loading, setLoading] = useState({ qr: false, verify: false, save: false, data: true });
  const [activeTab, setActiveTab] = useState('personal');
  const [verificationAttempts, setVerificationAttempts] = useState(0);
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [editedPersonData, setEditedPersonData] = useState({});
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [contactInfo, setContactInfo] = useState([]);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [tempAvatarFile, setTempAvatarFile] = useState(null);
  const [tempAvatarPreview, setTempAvatarPreview] = useState(null);
  const [imageVersion, setImageVersion] = useState(0);
  const [catalogData, setCatalogData] = useState({
    generos: [],
    nacionalidades: [],
    departamentos: [],
    municipios: []
  });

  const MAX_ATTEMPTS = 3;

  // API configuration with base URL
  const API_BASE_URL = 'http://74.50.68.87:4000';
  
  const getAuthHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });
   
  useEffect(() => {
    const fetchData = async () => {
      setLoading(prev => ({ ...prev, data: true }));
      try {
        // Obtener datos de la persona
        const personResponse = await axios.get(`${API_BASE_URL}/api/personas/${auth.cod_persona}`);
        
        // Obtener información de contacto
        const contactResponse = await axios.get(`${API_BASE_URL}/api/personas/${auth.cod_persona}`);
        
        // Obtener información adicional si existe
        let additionalInfo = {};
        try {
          const additionalInfoResponse = await axios.get(`${API_BASE_URL}/api/usuarios/complete/${auth.cod_persona}`);
          additionalInfo = additionalInfoResponse.data || {};
        } catch (error) {
          console.log('No hay información adicional disponible');
        }
        
        // Combinar toda la información
        const combinedData = {
          ...personResponse.data,
          ...additionalInfo
        };
        
        setPersonData(combinedData || {});
        setEditedPersonData(combinedData || {});
        setContactInfo(contactResponse.data || []);
      } catch (error) {
        console.error('Error al obtener datos:', error);
        Swal.fire({ icon: 'error', title: 'Error', text: 'Error al obtener tus datos. Por favor, inténtalo más tarde.' });
      } finally {
        setLoading(prev => ({ ...prev, data: false }));
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

        const response = await axios.get(`${API_BASE_URL}/api/usuarios/2faStatus/${auth.cod_usuario}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        const is2FAEnabled = response.data.is2FAEnabled;
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

  useEffect(() => {
    const fetchCatalogData = async () => {
        try {
            const [
                generosRes,
                nacionalidadesRes,
                departamentosRes,
                municipiosRes
            ] = await Promise.all([
                axios.get(`${API_BASE_URL}/api/usuarios/generos`),
                axios.get(`${API_BASE_URL}/api/usuarios/nacionalidades`),
                axios.get(`${API_BASE_URL}/api/usuarios/departamentos`),
                axios.get(`${API_BASE_URL}/api/usuarios/municipios`)
            ]);

            setCatalogData({
                generos: generosRes.data,
                nacionalidades: nacionalidadesRes.data,
                departamentos: departamentosRes.data,
                municipios: municipiosRes.data
            });
        } catch (error) {
            console.error('Error fetching catalog data:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error al cargar los datos de catálogo'
            });
        }
    };

    fetchCatalogData();
}, []);

  const generateQR2FA = async () => {
    setLoading((prev) => ({ ...prev, qr: true }));
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_BASE_URL}/api/usuarios/enableTwoFactorAuth/${auth.cod_usuario}`,
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
      setLoading(prev => ({ ...prev, verify: true }));
  
      if (!twoFactorCode) {
        setError('Por favor ingrese un código');
        return;
      }
  
      if (twoFactorCode.length !== 6 || !/^\d+$/.test(twoFactorCode)) {
        setError('El código debe ser de 6 dígitos numéricos');
        return;
      }
  
      const response = await fetch(`${API_BASE_URL}/api/usuarios/verifyTwoFactorAuthCode`, {
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
      setIsTwoFactorEnabled(true);
      setTwoFactorCode('');
      closeModal();
  
      // Mostrar mensaje de éxito al usuario
      Swal.fire({
        icon: 'success',
        title: '¡2FA Activado!',
        text: 'La autenticación de dos factores ha sido habilitada correctamente. A partir de ahora necesitarás usar un código de verificación para iniciar sesión.',
        confirmButtonText: 'Entendido'
      });
  
      // Actualizar el estado en la base de datos
      await axios.post(
        `${API_BASE_URL}/api/usuarios/update-2fa-status`,
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
    } finally {
      setLoading(prev => ({ ...prev, verify: false }));
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
          `${API_BASE_URL}/api/usuarios/disableTwoFactorAuth`,
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
  const rolMap = useMemo(() => ({ 1: 'PADRE', 2: 'ADMINISTRADOR', 3: 'DOCENTE', 4: 'SUPER USUARIO' }), []);

  // Funciones para edición de perfil
  const handleEditToggle = () => {
    setEditMode(!editMode);
    // Si se cancela la edición, restaurar los datos originales
    if (editMode) {
      setEditedPersonData({...personData});
      setAvatarPreview(null);
    }
  };

  // Modifica el handleInputChange para bloquear estos campos
const handleInputChange = (e) => {
  const { name, value } = e.target;

  // Bloquear edición de fecha_nacimiento y genero_persona
  if (name === "fecha_nacimiento" || name === "genero_persona") {
      Swal.fire({
          title: 'Campo no editable',
          text: 'Este campo no puede ser modificado.',
          icon: 'info',
          confirmButtonText: 'Aceptar'
      });
      return;
  }

  // Validación de nombres: solo letras mayúsculas y longitud máxima de 15 caracteres
  if (name === "Nombre" || name === "Segundo_nombre" || name === "Primer_apellido" || name === "Segundo_apellido") {
      const regex = /^[A-Z\s]*$/; // Solo letras mayúsculas y espacios
      if (!regex.test(value)) {
          Swal.fire({
              title: 'Error!',
              text: 'Solo se permiten letras mayúsculas y espacios.',
              icon: 'error',
              confirmButtonText: 'Aceptar'
          });
          return;
      }
      if (value.length > 15) {
          Swal.fire({
              title: 'Error!',
              text: 'El nombre no puede tener más de 15 caracteres.',
              icon: 'error',
              confirmButtonText: 'Aceptar'
          });
          return;
      }
  }

  // Validación del DNI: no puede tener más de 13 dígitos
  if (name === "dni_persona" && value.length > 13) {
      Swal.fire({
          title: 'Error!',
          text: 'El DNI no puede tener más de 13 dígitos.',
          icon: 'error',
          confirmButtonText: 'Aceptar'
      });
      return;
  }

  // Bloquear edición del campo correo_usuario
  if (name === "correo_usuario") {
      Swal.fire({
          title: 'No se puede editar el correo electrónico',
          text: 'El correo electrónico es un dato fijo y no puede ser modificado.',
          icon: 'error',
          confirmButtonText: 'Aceptar'
      });
      return; // No actualiza el estado del correo
  }

  // Actualiza el estado de los datos
  setEditedPersonData({
      ...editedPersonData,
      [name]: value,
  });
};

// Renderiza el campo email como solo lectura (no editable)
<input
  type="email"
  name="correo_usuario"
  value={editedPersonData.correo_usuario || auth.correo_usuario || ''}
  onChange={handleInputChange}
  className="edit-input"
  placeholder="Email"
  disabled // Esto hace que el campo no sea editable
/>


  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setAvatarPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const openImageModal = () => {
    setTempAvatarPreview(avatarPreview || personData.avatar_url || "../src/assets/images/user.svg");
    setIsImageModalOpen(true);
  };

  const closeImageModal = () => {
    setIsImageModalOpen(false);
    setTempAvatarFile(null);
    setTempAvatarPreview(null);
  };

  const handleTempAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
        console.log('Archivo seleccionado:', file); // Para debugging
        setTempAvatarFile(file);
        const reader = new FileReader();
        reader.onload = (e) => {
            console.log('Preview generado'); // Para debugging
            setTempAvatarPreview(e.target.result);
        };
        reader.readAsDataURL(file);
    }
};

const saveTempAvatar = async () => {
  if (tempAvatarFile) {
      try {
          const formData = new FormData();
          formData.append('avatar', tempAvatarFile);
          
          console.log('Enviando archivo:', tempAvatarFile);

          const response = await axios.post(
              `${API_BASE_URL}/api/usuarios/upload-avatar/${auth.cod_usuario}`,
              formData,
              {
                  headers: {
                      Authorization: `Bearer ${localStorage.getItem('token')}`,
                      'Content-Type': 'multipart/form-data'
                  }
              }
          );

          console.log('Respuesta del servidor:', response.data);

          if (response.data.success) {
              // Agregar un timestamp a la URL para evitar caché
              const newAvatarUrl = response.data.avatarUrl.includes('http') 
              ? `${response.data.avatarUrl}?t=${Date.now()}` 
              : `${API_BASE_URL}${response.data.avatarUrl}?t=${Date.now()}`;
          
              // Actualizar el estado con la nueva imagen
              setPersonData(prev => ({
                  ...prev,
                  avatar_url: newAvatarUrl
              }));

              // Actualizar la imagen inmediatamente en el frontend
              setAvatarPreview(newAvatarUrl);

              // Limpiar estados temporales
              setTempAvatarFile(null);
              setTempAvatarPreview(null);

              closeImageModal();

              Swal.fire({
                  icon: 'success',
                  title: '¡Foto actualizada!',
                  text: 'Tu foto de perfil ha sido actualizada correctamente.'
              });
          }
      } catch (error) {
          console.error('Error al subir avatar:', error);
          Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'No se pudo actualizar la foto de perfil. Por favor, inténtalo de nuevo.'
          });
      }
  }
};



  const saveProfileChanges = async () => {
    setLoading((prev) => ({ ...prev, save: true }));
    try {
      // Primero actualizamos los datos personales
      const response = await axios.put(
        `${API_BASE_URL}/api/usuarios/perfil/${auth.cod_usuario}`,
        editedPersonData,
        getAuthHeaders()
      );

      // Si hay un avatar nuevo, lo subimos
      if (avatarFile) {
        const formData = new FormData();
        formData.append('avatar', avatarFile);
        
        const avatarResponse = await axios.post(
          `${API_BASE_URL}/api/usuarios/upload-avatar/${auth.cod_usuario}`,
          formData,
          {
            headers: {
              ...getAuthHeaders().headers,
              'Content-Type': 'multipart/form-data'
            }
          }
        );

        // Actualizar la URL del avatar en los datos de la persona
        setPersonData(prev => ({
          ...prev,
          avatar_url: avatarResponse.data.avatarUrl
        }));
      }

      setPersonData(editedPersonData);
      setEditMode(false);
      setAvatarFile(null); // Limpiar el archivo temporal
      
      Swal.fire({
        icon: 'success',
        title: '¡Perfil Actualizado!',
        text: 'Tus datos personales han sido actualizados correctamente.',
      });
    } catch (error) {
      console.error('Error al guardar cambios:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'No se pudieron guardar los cambios. Por favor, inténtalo de nuevo.',
      });
    } finally {
      setLoading((prev) => ({ ...prev, save: false }));
    }
  };

  // Función para formatear fecha en formato legible
  const formatDate = (dateString) => {
    if (!dateString) return 'No disponible';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  // Función para obtener icono según tipo de contacto
  const getContactIcon = (tipoContacto) => {
    const tipoLower = tipoContacto?.toLowerCase() || '';
    
    if (tipoLower.includes('telefono') || tipoLower.includes('teléfono') || tipoLower.includes('celular')) {
      return 'fas fa-phone-alt';
    } else if (tipoLower.includes('email') || tipoLower.includes('correo')) {
      return 'fas fa-envelope';
    } else if (tipoLower.includes('direccion') || tipoLower.includes('dirección')) {
      return 'fas fa-map-marker-alt';
    } else {
      return 'fas fa-address-card';
    }
  };

  useEffect(() => {
    if (personData.avatar_url) {
        const imgElement = document.querySelector('.avatar-image');
        if (imgElement) {
            imgElement.src = `${API_BASE_URL}${personData.avatar_url}?t=${Date.now()}`;
        }
    }
}, [personData.avatar_url]);

const getGenderText = (codGenero) => {
    // Convertir a número si es string
    const genero = parseInt(codGenero);
    
    switch (genero) {
        case 1:
            return 'Masculino';
        case 2:
            return 'Femenino';
        case 3:
            return 'No Binario';
        default:
            return 'No disponible';
    }
};

useEffect(() => {
    const fetchData = async () => {
        setLoading(prev => ({ ...prev, data: true }));
        try {
            const response = await axios.get(
                `${API_BASE_URL}/api/personas/additional/${auth.cod_persona}`,
                getAuthHeaders()
            );

            if (response.data) {
                const personData = {
                    ...response.data,
                    genero_persona: response.data.cod_genero,
                    Nacionalidad: response.data.nacionalidad,
                    Nombre_departamento: response.data.nombre_departamento,
                    Nombre_municipio: response.data.nombre_municipio
                };
                
                setPersonData(personData);
                setEditedPersonData(personData);
            }
        } catch (error) {
            console.error('Error al obtener datos:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error al cargar los datos. Por favor, intenta más tarde.'
            });
        } finally {
            setLoading(prev => ({ ...prev, data: false }));
        }
    };

    fetchData();
}, [auth.cod_persona]);

  return (
    <div className="profile-container">
      {loading.data ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando información del perfil...</p>
        </div>
      ) : (
        <>
          {/* Header Section */}
          <div className="profile-header">
            <div className="profile-avatar">
              {editMode ? (
                <>
                  <label htmlFor="avatar-upload" className="avatar-upload-label">
                    <img 
                      key={`avatar-${imageVersion}`} // Agregar key dinámica
                      src={
                        personData.avatar_url 
                            ? `${personData.avatar_url}?t=${Date.now()}` 
                            : "../src/assets/images/user.svg"
                      } 
                      alt="Foto de perfil" 
                      className="avatar-image" 
                      onClick={openImageModal}
                      style={{ cursor: 'pointer' }}
                      onError={(e) => {
                          console.error('Error loading image:', e.target.src);
                          e.target.src = "../src/assets/images/user.svg";
                      }}
                    />
                    <div className="avatar-edit-overlay">
                      <i className="fas fa-camera"></i>
                      <span>Cambiar foto</span>
                    </div>
                  </label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    style={{ display: 'none' }}
                    name="avatar" // Importante: debe coincidir con el nombre en formData.append

                  />
                </>
              ) : (
                <>
                  <img 
                    key={`avatar-${imageVersion}`} // Agregar key dinámica
                    src={
                      personData.avatar_url 
                          ? `${API_BASE_URL}${personData.avatar_url}?t=${Date.now()}` 
                          : "../src/assets/images/user.svg"
                    } 
                    alt="Foto de perfil" 
                    className="avatar-image" 
                    onClick={openImageModal}
                    style={{ cursor: 'pointer' }}
                    onError={(e) => {
                        console.error('Error loading image:', e.target.src);
                        e.target.src = "../src/assets/images/user.svg";
                    }}
                  />
                </>
              )}
            </div>
            <div className="profile-info">
              {editMode ? (
                <input
                  type="text"
                  name="Nombre"
                  value={editedPersonData.Nombre || ''}
                  onChange={handleInputChange}
                  className="edit-input name-input"
                  placeholder="Nombre completo"
                />
              ) : (
                <h1 className="profile-name">
                  {[
                    personData.Nombre,
                    personData.Segundo_nombre,
                    personData.Primer_apellido,
                    personData.Segundo_apellido
                  ].filter(Boolean).join(' ') || 'NO DISPONIBLE'}
                </h1>
              )}
              <p className="profile-username">@{auth.nombre_usuario || 'usuario'}</p>
              <span className="profile-role">{rolMap[auth.cod_rol] || 'ROL DESCONOCIDO'}</span>
            </div>
            <div className="edit-controls">
              {editMode ? (
                <>
                  <button 
                    className="button-primary save-button" 
                    onClick={saveProfileChanges}
                    disabled={loading.save}
                  >
                    {loading.save ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                  <button 
                    className="button-secondary cancel-button" 
                    onClick={handleEditToggle}
                  >
                    Cancelar
                  </button>
                </>
              ) : (
                <button 
                  className="button-primary edit-button" 
                  onClick={handleEditToggle}
                >
                  <i className="fas fa-edit"></i> Editar Perfil
                </button>
              )}
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
              className={`tab-button ${activeTab === 'contact' ? 'active' : ''}`}
              onClick={() => setActiveTab('contact')}
            >
              Información de Contacto
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
                    <i className="fas fa-user"></i>
                    <div className="info-details">
                      <label>Nombre Completo</label>
                      {editMode ? (
                        <div className="edit-name-fields">
                          <input
                            type="text"
                            name="Nombre"
                            value={editedPersonData.Nombre || ''}
                            onChange={handleInputChange}
                            className="edit-input"
                            placeholder="Primer nombre"
                          />
                          <input
                            type="text"
                            name="Segundo_nombre"
                            value={editedPersonData.Segundo_nombre || ''}
                            onChange={handleInputChange}
                            className="edit-input"
                            placeholder="Segundo nombre"
                          />
                          <input
                            type="text"
                            name="Primer_apellido"
                            value={editedPersonData.Primer_apellido || ''}
                            onChange={handleInputChange}
                            className="edit-input"
                            placeholder="Primer apellido"
                          />
                          <input
                            type="text"
                            name="Segundo_apellido"
                            value={editedPersonData.Segundo_apellido || ''}
                            onChange={handleInputChange}
                            className="edit-input"
                            placeholder="Segundo apellido"
                          />
                        </div>
                      ) : (
                        <p>
                          {[
                            personData.Nombre,
                            personData.Segundo_nombre,
                            personData.Primer_apellido,
                            personData.Segundo_apellido
                          ].filter(Boolean).join(' ') || 'No disponible'}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="info-item">
                    <i className="fas fa-id-card"></i>
                    <div className="info-details">
                      <label>DNI</label>
                      {editMode ? (
                        <input
                          type="text"
                          name="dni_persona"
                          value={editedPersonData.dni_persona || ''}
                          onChange={handleInputChange}
                          className="edit-input"
                          placeholder="DNI"
                        />
                      ) : (
                        <p>{personData.dni_persona || 'No disponible'}</p>
                      )}
                    </div>
                  </div>
                  <div className="info-item">
                    <i className="fas fa-map-marker-alt"></i>
                    <div className="info-details">
                      <label>Dirección</label>
                      {editMode ? (
                        <input
                          type="text"
                          name="direccion_persona"
                          value={editedPersonData.direccion_persona || ''}
                          onChange={handleInputChange}
                          className="edit-input"
                          placeholder="Dirección"
                        />
                      ) : (
                        <p>{personData.direccion_persona || 'No disponible'}</p>
                      )}
                    </div>
                  </div>
                  {/* Campo de Fecha de Nacimiento - Solo lectura */}
                  <div className="info-item">
                      <i className="fas fa-calendar"></i>
                      <div className="info-details">
                          <label>Fecha de Nacimiento</label>
                          {editMode ? (
                              <input
                                  type="date"
                                  name="fecha_nacimiento"
                                  value={editedPersonData.fecha_nacimiento ? editedPersonData.fecha_nacimiento.split('T')[0] : ''}
                                  className="edit-input"
                                  disabled // Deshabilitar el campo
                                  style={{ backgroundColor: '#f0f0f0', cursor: 'not-allowed' }}
                              />
                          ) : (
                              <p>{formatDate(personData.fecha_nacimiento)}</p>
                          )}
                      </div>
                  </div>

                  {/* Campo de Género - Solo lectura */}
                  <div className="info-item">
                      <i className="fas fa-venus-mars"></i>
                      <div className="info-details">
                          <label>Género</label>
                          {editMode ? (
                              <select
                                  name="cod_genero"
                                  value={editedPersonData.cod_genero || ''}
                                  onChange={handleInputChange}
                                  className="edit-input"
                                  disabled
                                  style={{ backgroundColor: '#f0f0f0', cursor: 'not-allowed' }}
                              >
                                  <option value="">Seleccionar Género</option>
                                  {catalogData.generos.map(genero => (
                                      <option key={genero.cod_genero} value={genero.cod_genero}>
                                          {genero.Tipo_genero}
                                      </option>
                                  ))}
                              </select>
                          ) : (
                              <p>{personData.genero_descripcion || 'No disponible'}</p>
                          )}
                      </div>
                  </div>

                  {/* Nacionalidad */}
                  <div className="info-item">
                      <i className="fas fa-flag"></i>
                      <div className="info-details">
                          <label>Nacionalidad</label>
                          {editMode ? (
                              <select
                                  name="cod_nacionalidad"
                                  value={editedPersonData.cod_nacionalidad || ''}
                                  onChange={handleInputChange}
                                  className="edit-input"
                              >
                                  <option value="">Seleccionar Nacionalidad</option>
                                  {catalogData.nacionalidades.map(nac => (
                                      <option key={nac.cod_nacionalidad} value={nac.cod_nacionalidad}>
                                          {nac.pais_nacionalidad}
                                      </option>
                                  ))}
                              </select>
                          ) : (
                              <p>{personData.nombre_nacionalidad || 'No disponible'}</p>
                          )}
                      </div>
                  </div>

                  {/* Departamento */}
                  <div className="info-item">
                      <i className="fas fa-map"></i>
                      <div className="info-details">
                          <label>Departamento</label>
                          {editMode ? (
                              <select
                                  name="cod_departamento"
                                  value={editedPersonData.cod_departamento || ''}
                                  onChange={handleInputChange}
                                  className="edit-input"
                              >
                                  <option value="">Seleccionar Departamento</option>
                                  {catalogData.departamentos.map(dep => (
                                      <option key={dep.Cod_departamento} value={dep.Cod_departamento}>
                                          {dep.Nombre_departamento}
                                      </option>
                                  ))}
                              </select>
                          ) : (
                              <p>{personData.Nombre_departamento || 'No disponible'}</p>
                          )}
                      </div>
                  </div>

                  {/* Municipio */}
                  <div className="info-item">
                      <i className="fas fa-city"></i>
                      <div className="info-details">
                          <label>Municipio</label>
                          {editMode ? (
                              <select
                                  name="cod_municipio"
                                  value={editedPersonData.cod_municipio || ''}
                                  onChange={handleInputChange}
                                  className="edit-input"
                              >
                                  <option value="">Seleccionar Municipio</option>
                                  {catalogData.municipios
                                      .filter(mun => mun.cod_departamento === editedPersonData.cod_departamento)
                                      .map(mun => (
                                          <option key={mun.cod_municipio} value={mun.cod_municipio}>
                                              {mun.nombre_municipio}
                                          </option>
                                      ))}
                              </select>
                          ) : (
                              <p>{personData.nombre_municipio || 'No disponible'}</p>
                          )}
                      </div>
                  </div>
                 
                </div>
              </div>
            </div>
          )}

          {/* Contact Information Tab */}
          {activeTab === 'contact' && (
            <div className="tab-content">
              <div className="info-card">
                <h3 className="section-title">Información de Contacto</h3>
                
                {/* Email del usuario */}
                <div className="info-item">
                  <i className="fas fa-envelope"></i>
                  <div className="info-details">
                    <label>Email de Usuario</label>
                    {editMode ? (
                      <input
                        type="email"
                        name="correo_usuario"
                        value={editedPersonData.correo_usuario || auth.correo_usuario || ''}
                        onChange={handleInputChange}
                        className="edit-input"
                        placeholder="Email"
                        disabled // Esto hace que el campo no sea editable
                      />
                    ) : (
                      <p>{auth.correo_usuario || 'No disponible'}</p>
                    )}
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
              
              {/* Cambio de contraseña */}
              <div className="security-card password-section">
                <div className="security-status">
                  <i className="fas fa-key"></i>
                  <div className="security-info">
                    <h3>Cambiar Contraseña</h3>
                    <p>Actualiza tu contraseña de acceso</p>
                  </div>
                </div>
                <div className="security-actions">
                  <button 
                    className="button-primary"
                    onClick={() => {
                      Swal.fire({
                        title: 'Cambiar Contraseña',
                        html: `
                          <input type="password" id="currentPassword" class="swal2-input" placeholder="Contraseña actual">
                          <input type="password" id="newPassword" class="swal2-input" placeholder="Nueva contraseña">
                          <input type="password" id="confirmPassword" class="swal2-input" placeholder="Confirmar contraseña">
                        `,
                        showCancelButton: true,
                        confirmButtonText: 'Cambiar',
                        cancelButtonText: 'Cancelar',
                        focusConfirm: false,
                        preConfirm: () => {
                          const currentPassword = document.getElementById('currentPassword').value;
                          const newPassword = document.getElementById('newPassword').value;
                          const confirmPassword = document.getElementById('confirmPassword').value;
                          
                          if (!currentPassword || !newPassword || !confirmPassword) {
                            Swal.showValidationMessage('Todos los campos son requeridos');
                            return false;
                          }
                          
                          if (newPassword !== confirmPassword) {
                            Swal.showValidationMessage('Las contraseñas no coinciden');
                            return false;
                          }
                          
                          return { currentPassword, newPassword };
                        }
                      }).then((result) => {
                        if (result.isConfirmed) {
                          axios.post(`${API_BASE_URL}/api/usuarios/cambiar-password`, {
                            cod_usuario: auth.cod_usuario,
                            password_actual: result.value.currentPassword,
                            password_nueva: result.value.newPassword
                          }, getAuthHeaders())
                          // continuando desde donde se cortó:
                          .then(response => {
                            Swal.fire({
                              icon: 'success',
                              title: '¡Contraseña Actualizada!',
                              text: 'Tu contraseña ha sido cambiada correctamente.'
                            });
                          })
                          .catch(error => {
                            console.error('Error al cambiar contraseña:', error);
                            Swal.fire({
                              icon: 'error',
                              title: 'Error',
                              text: error.response?.data?.message || 'No se pudo cambiar la contraseña. Por favor, verifica tus datos e inténtalo de nuevo.'
                            });
                          });
                        }
                      });
                    }}
                  >
                    Cambiar Contraseña
                  </button>
                </div>
              </div>
              
              {/* Historial de inicio de sesión */}
              <div className="security-card">
                <div className="security-status">
                  <i className="fas fa-history"></i>
                  <div className="security-info">
                    <h3>Historial de Inicio de Sesión</h3>
                    <p>Ver actividad reciente de la cuenta</p>
                  </div>
                </div>
                <div className="security-actions">
                  <button 
                    className="button-secondary"
                    onClick={() => {
                      // Implementación futura para ver historial
                      Swal.fire({
                        icon: 'info',
                        title: 'Próximamente',
                        text: 'Esta función estará disponible en futuras actualizaciones.'
                      });
                    }}
                  >
                    Ver Historial
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal para la configuración de 2FA */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Configuración de 2FA"
        className="two-factor-modal"
        overlayClassName="modal-overlay"
      >
        <div className="modal-header">
          <h2>Configuración de Autenticación de Dos Factores</h2>
          <button onClick={closeModal} className="close-button">
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="modal-content">
          <div className="qr-container">
            {qrCode && <img src={qrCode} alt="QR Code for 2FA" />}
          </div>
          <div className="instructions">
            <h3>Instrucciones:</h3>
            <ol>
              <li>Escanea el código QR con tu aplicación de autenticación (Google Authenticator, Microsoft Authenticator, etc.)</li>
              <li>Ingresa el código de verificación que se muestra en tu aplicación</li>
              <li>Haz clic en "Verificar" para completar la configuración</li>
            </ol>
          </div>
          <div className="verification-form">
            <input
              type="text"
              value={twoFactorCode}
              onChange={(e) => setTwoFactorCode(e.target.value)}
              placeholder="Código de 6 dígitos"
              maxLength={6}
              className="verification-input"
            />
            <button
              onClick={handleVerify}
              className="button-primary"
              disabled={loading.verify}
            >
              {loading.verify ? 'Verificando...' : 'Verificar'}
            </button>
          </div>
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
        </div>
      </Modal>

      {/* Modal para editar la imagen de perfil */}
      <Modal
        isOpen={isImageModalOpen}
        onRequestClose={closeImageModal}
        className="image-modal"
        overlayClassName="modal-overlay"
      >
        <div className="modal-header">
          <h2>Editar Foto de Perfil</h2>
          <button onClick={closeImageModal} className="close-button">
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="modal-content">
          <div className="image-preview-container">
            <img 
              src={tempAvatarPreview} 
              alt="Vista previa" 
              className="image-preview"
            />
          </div>
          <div className="image-actions">
            <label className="button-secondary">
              <i className="fas fa-upload"></i> Subir Nueva Foto
              <input
                type="file"
                accept="image/*"
                onChange={handleTempAvatarChange}
                style={{ display: 'none' }}
              />
            </label>
            <button 
              className="button-primary"
              onClick={saveTempAvatar}
              disabled={!tempAvatarFile}
            >
              <i className="fas fa-save"></i> Guardar Cambios
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default UserProfile;
