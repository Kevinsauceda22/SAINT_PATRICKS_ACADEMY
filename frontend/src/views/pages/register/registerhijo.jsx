// ChildProfileForm.jsx
import React, { useState } from 'react';
import '../register/Register.css';

const ChildProfileForm = ({ preloadedData }) => {
  const [formData, setFormData] = useState({
    dni_persona: preloadedData?.dni_persona || '',
    nombre: preloadedData?.nombre || '',
    segundo_nombre: '',
    primer_apellido: preloadedData?.primer_apellido || '',
    segundo_apellido: '',
    nacionalidad: '',
    direccion_persona: '',
    fecha_nacimiento: '',
    cod_tipo_persona: 'HIJO',
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
    console.log('Datos del hijo:', formData);
  };

  return (
    <div className="profile-container">
      <h1 className="profile-title">Registro de Hijo/a</h1>
      <p className="profile-subtitle">Complete el perfil de su hijo/a</p>
      
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label" htmlFor="dni_persona">DNI</label>
            <input
              className="form-input"
              id="dni_persona"
              name="dni_persona"
              value={formData.dni_persona}
              onChange={handleInputChange}
              disabled={preloadedData?.dni_persona}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="nombre">Nombre</label>
            <input
              className="form-input"
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleInputChange}
              disabled={preloadedData?.nombre}
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
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="primer_apellido">Primer Apellido</label>
            <input
              className="form-input"
              id="primer_apellido"
              name="primer_apellido"
              value={formData.primer_apellido}
              onChange={handleInputChange}
              disabled={preloadedData?.primer_apellido}
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
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="nacionalidad">Nacionalidad</label>
            <input
              className="form-input"
              id="nacionalidad"
              name="nacionalidad"
              value={formData.nacionalidad}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="direccion_persona">Dirección</label>
            <input
              className="form-input"
              id="direccion_persona"
              name="direccion_persona"
              value={formData.direccion_persona}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="fecha_nacimiento">Fecha de Nacimiento</label>
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
            <label className="form-label" htmlFor="cod_departamento">Departamento</label>
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
            <label className="form-label" htmlFor="cod_genero">Género</label>
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

        <button type="submit" className="submit-button">
          Guardar Perfil
        </button>
      </form>
    </div>
  );
};

export default ChildProfileForm;