import React from 'react';
import './UserProfile.css';  // Asegúrate de importar el CSS

const UserProfile = () => {
  // Función para manejar el clic en el botón de 2FA
  const handle2faClick = () => {
    // Aquí puedes agregar la lógica para habilitar o gestionar 2FA
    alert('Funcionalidad de 2FA aún no implementada.');
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-image-container">
          <div className="profile-image">
            <img src="/api/placeholder/96/96" alt="Foto de perfil" />
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
          <h2 className="profile-name">Nombre Usuario</h2>
          <p className="profile-username">@usuario</p>
        </div>
      </div>

      <div className="info-section">
        <h3 className="section-title">Información Personal</h3>
        <div className="info-grid">
          <div className="info-item">
            <label>Email</label>
            <p>usuario@ejemplo.com</p>
          </div>
          <div className="info-item">
            <label>Teléfono</label>
            <p>+1 234 567 890</p>
          </div>
          <div className="info-item">
            <label>Ubicación</label>
            <p>Ciudad, País</p>
          </div>
          <div className="info-item">
            <label>Miembro desde</label>
            <p>Enero 2024</p>
          </div>
        </div>
      </div>

      <div className="info-section">
        <h3 className="section-title">Bio</h3>
        <p className="bio">
          Una breve descripción sobre el usuario iría aquí. Esta es una vista básica del perfil.
        </p>
      </div>

      {/* Botón para habilitar 2FA */}
      <button className="twofa-button" onClick={handle2faClick}>
        Habilitar Autenticación de Dos Factores (2FA)
      </button>

      <button className="edit-button">
        Editar Perfil
      </button>
    </div>
  );
};

export default UserProfile;
