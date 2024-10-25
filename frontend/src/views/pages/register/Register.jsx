// ParentProfileForm.jsx
import React, { useState } from 'react';
import '../register/Register.css';

const ParentProfileForm = ({ preloadedData }) => {
  const [formData, setFormData] = useState({
    dni_persona: preloadedData?.dni_persona || '',
    nombre: preloadedData?.nombre || '',
    segundo_nombre: '',
    primer_apellido: preloadedData?.primer_apellido || '',
    segundo_apellido: '',
    nacionalidad: '',
    direccion_persona: '',
    fecha_nacimiento: '',
    cod_tipo_persona: 'PADRE',
    cod_departamento: '',
    cod_genero: ''
  });

  const departamentos = [
    { id: '1', nombre: 'Francisco Morazán', municipios: ['Tegucigalpa', 'Valle de Ángeles'] },
    { id: '2', nombre: 'Cortés', municipios: ['San Pedro Sula', 'Puerto Cortés'] },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Datos del padre:', formData);
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1 className="profile-title">Registro de Padre de Familia</h1>
        <p className="profile-subtitle">Ahora completaremos su perfil</p>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <h2 className="form-section-title">Información Personal</h2>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label required-field" htmlFor="dni_persona">DNI</label>
              <input
                className="form-input"
                id="dni_persona"
                name="dni_persona"
                value={formData.dni_persona}
                onChange={handleInputChange}
                disabled={preloadedData?.dni_persona}
                placeholder="Ingrese su DNI"
              />
            </div>

            <div className="form-group">
              <label className="form-label required-field" htmlFor="nombre">Nombre</label>
              <input
                className="form-input"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                disabled={preloadedData?.nombre}
                placeholder="Ingrese su nombre"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="segundo_nombre">Segundo Nombre</label>
              <input
                className="form-input"
                id="segundo_nombre"
                name="segundo_nombre"
                value={formData.segundo_nombre}
                onChange={handleInputChange}
                placeholder="Ingrese su segundo nombre"
              />
            </div>

            <div className="form-group">
              <label className="form-label required-field" htmlFor="primer_apellido">Primer Apellido</label>
              <input
                className="form-input"
                id="primer_apellido"
                name="primer_apellido"
                value={formData.primer_apellido}
                onChange={handleInputChange}
                disabled={preloadedData?.primer_apellido}
                placeholder="Ingrese su primer apellido"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="segundo_apellido">Segundo Apellido</label>
              <input
                className="form-input"
                id="segundo_apellido"
                name="segundo_apellido"
                value={formData.segundo_apellido}
                onChange={handleInputChange}
                placeholder="Ingrese su segundo apellido"
              />
            </div>

            <div className="form-group">
              <label className="form-label required-field" htmlFor="nacionalidad">Nacionalidad</label>
              <input
                className="form-input"
                id="nacionalidad"
                name="nacionalidad"
                value={formData.nacionalidad}
                onChange={handleInputChange}
                placeholder="Ingrese su nacionalidad"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2 className="form-section-title">Información de Contacto y Ubicación</h2>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label required-field" htmlFor="direccion_persona">Dirección</label>
              <input
                className="form-input"
                id="direccion_persona"
                name="direccion_persona"
                value={formData.direccion_persona}
                onChange={handleInputChange}
                placeholder="Ingrese su dirección"
              />
            </div>

            <div className="form-group">
              <label className="form-label required-field" htmlFor="fecha_nacimiento">Fecha de Nacimiento</label>
              <input
                className="form-input"
                id="fecha_nacimiento"
                name="fecha_nacimiento"
                type="date"
                value={formData.fecha_nacimiento}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label required-field" htmlFor="cod_departamento">Departamento</label>
              <select
                className="form-select"
                id="cod_departamento"
                name="cod_departamento"
                value={formData.cod_departamento}
                onChange={handleInputChange}
              >
                <option value="">Seleccione un departamento</option>
                {departamentos.map((depto) => (
                  <option key={depto.id} value={depto.id}>
                    {depto.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label required-field" htmlFor="cod_genero">Género</label>
              <select
                className="form-select"
                id="cod_genero"
                name="cod_genero"
                value={formData.cod_genero}
                onChange={handleInputChange}
              >
                <option value="">Seleccione un género</option>
                <option value="M">Masculino</option>
                <option value="F">Femenino</option>
              </select>
            </div>
          </div>
        </div>

        <button type="submit" className="submit-button">
          Guardar Perfil
        </button>
      </form>
    </div>
  );
};

export default ParentProfileForm;