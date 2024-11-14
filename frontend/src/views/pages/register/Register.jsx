import React, { useState, useEffect } from 'react';
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
    cod_tipo_persona: 'P', // 'P' para Padre
    cod_departamento: '',
    cod_genero: '',
    cod_municipio: '', // Nuevo campo para municipio
  });

  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [departamentos, setDepartamentos] = useState([]);
  const [municipios, setMunicipios] = useState([]);
  const [isMunicipioDisabled, setIsMunicipioDisabled] = useState(true);

  // Cargar departamentos desde la API
  useEffect(() => {
    const fetchDepartamentos = async () => {
      try {
        const response = await fetch('http://localhost:4000/api/departamento/departamentos');
        const data = await response.json();
    
        // Asegúrate de que la respuesta tiene los datos correctos
        console.log(data); // Imprime los datos para ver la estructura
    
        if (response.ok && data && Array.isArray(data.departamentos)) {
          setDepartamentos(data.departamentos); // Asegúrate de que la API devuelve el array de departamentos
        } else {
          setErrorMessage('No se pudieron cargar los departamentos');
        }
      } catch (error) {
        setErrorMessage('Error al cargar los departamentos: ' + error.message);
      }
    };
    
    fetchDepartamentos();
  }, []);

  // Obtener municipios según el departamento seleccionado
  useEffect(() => {
    const fetchMunicipios = async () => {
      if (formData.cod_departamento) {
        try {
          const response = await fetch(`http://localhost:4000/api/departamento/departamentos-y-municipios?cod_departamento=${formData.cod_departamento}`);
          const data = await response.json();

          if (response.ok && data.success) {
            setMunicipios(data.municipios); // Asumimos que la API devuelve los municipios relacionados con el departamento
            setIsMunicipioDisabled(false); // Habilitar el campo de municipios si se obtienen municipios
          } else {
            setMunicipios([]); // Si no hay municipios para este departamento
            setIsMunicipioDisabled(true); // Deshabilitar el campo de municipio si no hay datos
          }
        } catch (error) {
          setMunicipios([]);
          setIsMunicipioDisabled(true);
          setErrorMessage('Error al cargar los municipios: ' + error.message);
        }
      } else {
        setMunicipios([]);
        setIsMunicipioDisabled(true); // Deshabilitar municipio si no se ha seleccionado un departamento
      }
    };

    fetchMunicipios();
  }, [formData.cod_departamento]); // Solo ejecutar cuando cambie el departamento seleccionado

  // Manejar la selección de un departamento
  const handleDepartamentoChange = (event) => {
    const departamentoId = event.target.value;
    setFormData({ ...formData, cod_departamento: departamentoId });
  };

  // Manejar la selección de un municipio
  const handleMunicipioChange = (event) => {
    setFormData({ ...formData, cod_municipio: event.target.value });
  };

  // Manejar la entrada de otros datos del formulario
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validación de campos obligatorios
    if (!formData.dni_persona || !formData.nombre || !formData.primer_apellido || !formData.nacionalidad || !formData.direccion_persona || !formData.fecha_nacimiento || !formData.cod_departamento || !formData.cod_genero || !formData.cod_municipio) {
      setErrorMessage('Por favor, complete todos los campos requeridos.');
      return;
    }

    setErrorMessage('');
    setLoading(true);

    try {
      // Enviar los datos al servidor
      const response = await fetch('/api/registrarPadre', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        // Si es exitoso, puedes redirigir o mostrar un mensaje
        alert('Perfil registrado con éxito.');
        // Redirigir al siguiente formulario (si lo deseas)
        // history.push('/next-form');
      } else {
        setErrorMessage('Hubo un error al registrar el perfil. Intenta nuevamente.');
      }
    } catch (error) {
      setErrorMessage('Error en la conexión. Intenta más tarde.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1 className="profile-title">Registro de Padre de Familia</h1>
        <p className="profile-subtitle">Ahora completaremos su perfil</p>
      </div>
  
      {errorMessage && <div className="error-message">{errorMessage}</div>}
  
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
                placeholder="Ingrese su fecha de nacimiento"
              />
            </div>
  
            <div className="form-group">
              <label className="form-label required-field" htmlFor="cod_departamento">Departamento</label>
              <select
                className="form-input"
                id="cod_departamento"
                name="cod_departamento"
                value={formData.cod_departamento}
                onChange={handleDepartamentoChange}
              >
                <option value="">Seleccione un departamento</option>
                {departamentos.map(depto => (
  <option key={depto.cod_departamento} value={depto.cod_departamento}>
    {depto.nombre_departamento}
  </option>
))}
              </select>
            </div>
  
            <div className="form-group">
              <label className="form-label required-field" htmlFor="cod_municipio">Municipio</label>
              <select
                className="form-input"
                id="cod_municipio"
                name="cod_municipio"
                value={formData.cod_municipio}
                onChange={handleMunicipioChange}
              >
                <option value="">Seleccione un municipio</option>
                {municipios.map(municipio => (
                  <option key={municipio.cod_municipio} value={municipio.cod_municipio}>
                    {municipio.nombre_municipio}
                  </option>
                ))}
              </select>
            </div>
  
            <div className="form-group">
              <label className="form-label required-field" htmlFor="cod_genero">Género</label>
              <select
                className="form-input"
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
  
        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? 'Registrando...' : 'Registrar Perfil'}
        </button>
      </form>
    </div>
  );
  
};

export default ParentProfileForm;
