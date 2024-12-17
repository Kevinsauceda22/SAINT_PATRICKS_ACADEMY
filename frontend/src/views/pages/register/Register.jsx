import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";
import axios from 'axios';
import '../register/Register.css';
import Swal from 'sweetalert2';


const ParentProfileForm = () => {
  const navigate = useNavigate();
  
  // Estado del formulario
  const [formData, setFormData] = useState({
    dni_persona: '',
    Nombre: '',           // Cambiado de 'nombre' a 'Nombre'
  Segundo_nombre: '',   // Cambiado de 'segundo_nombre' a 'Segundo_nombre'
  Primer_apellido: '',  // Cambiado de 'primer_apellido' a 'Primer_apellido'
  Segundo_apellido: '', // Cambiado de 'segundo_apellido' a 'Segundo_apellido'
  Nacionalidad: '',     // Cambiado de 'nacionalidad' a 'Nacionalidad'
    direccion_persona: '',
    fecha_nacimiento: '',
    cod_tipo_persona: 'P',
    cod_departamento: '',
    cod_genero: '',
    cod_municipio: '',
  });

  // Estados adicionales
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [departamentos, setDepartamentos] = useState([]);
  const [municipios, setMunicipios] = useState([]);
  const [isMunicipioDisabled, setIsMunicipioDisabled] = useState(true);

  const convertToUpperCase = (value, fieldName) => {
    const excludedFields = ['fecha_nacimiento', 'cod_departamento', 'cod_municipio', 'cod_genero'];
    return excludedFields.includes(fieldName) ? value : value.toUpperCase();
  };
  
  // Manejador de cambios en los inputs
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    
    if (name === 'dni_persona') {
      if (/^\d*$/.test(value)) {
        setFormData(prevState => ({
          ...prevState,
          [name]: value
        }));
      }
      return;
    }
  
    const upperCaseValue = convertToUpperCase(value, name);
    setFormData(prevState => ({
      ...prevState,
      [name]: upperCaseValue
    }));
  };
  
  // Manejador para el departamento
  const handleDepartamentoChange = (event) => {
    const departamentoId = event.target.value;
    setFormData(prevState => ({
      ...prevState,
      cod_departamento: departamentoId,
      cod_municipio: ''
    }));
  };
  
  // Manejador para el municipio
  const handleMunicipioChange = (event) => {
    setFormData(prevState => ({
      ...prevState,
      cod_municipio: event.target.value
    }));
  };

  // Cargar datos iniciales
  useEffect(() => {
    const cargarDatosIniciales = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setErrorMessage('No se encontró token de autenticación');
          setLoading(false);
          return;
        }
        const decoded = jwtDecode(token);
        const cod_usuario = decoded.cod_usuario;
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
        // Cargar datos pre-registrados
        const datosResponse = await axios.get(
          `http://74.50.68.87:4000/api/usuarios/padre/datos-preregistro/${cod_usuario}`,
          config
        );
        if (datosResponse.data.success) {
          const preloadedData = {
            Nombre: datosResponse.data.datos.nombre,
            Primer_apellido: datosResponse.data.datos.primer_apellido,
          };
          
          setFormData(prevState => ({
            ...prevState,
            ...preloadedData,
          }));
        }
        // Cargar departamentos
        const departamentosResponse = await axios.get(
          'http://74.50.68.87:4000/api/departamento/departamentos',
          config
        );
        if (departamentosResponse.data) {
          const departamentosUnicos = departamentosResponse.data.reduce((acc, current) => {
            const x = acc.find(item => item.cod_departamento === current.cod_departamento);
            if (!x) {
              return acc.concat([current]);
            }
            return acc;
          }, []);
          setDepartamentos(departamentosUnicos.sort((a, b) => 
            a.nombre_departamento.localeCompare(b.nombre_departamento)
          ));
        }
      } catch (error) {
        console.error('Error al cargar datos iniciales:', error);
        setErrorMessage(
          error.response?.data?.mensaje || 
          'Error al cargar los datos iniciales'
        );
      } finally {
        setLoading(false);
      }
    };
    cargarDatosIniciales();
  }, []);

  useEffect(() => {
    const fetchMunicipios = async () => {
      if (!formData.cod_departamento) {
        setMunicipios([]);
        setIsMunicipioDisabled(true);
        return;
      }
  
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `http://74.50.68.87:4000/api/departamento/municipios/${formData.cod_departamento}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            }
          }
        );
  
        if (response.data) {
          setMunicipios(response.data);
          setIsMunicipioDisabled(false);
        } else {
          setMunicipios([]);
          setIsMunicipioDisabled(true);
        }
      } catch (error) {
        console.error('Error al cargar municipios:', error);
        setMunicipios([]);
        setIsMunicipioDisabled(true);
        setErrorMessage('Error al cargar los municipios: ' + error.message);
      }
    };
  
    fetchMunicipios();
  }, [formData.cod_departamento]);
  // Validar DNI
 // Validar DNI
 const validarDNI = (dni) => {
  if (!/^\d{13}$/.test(dni)) {
    return 'El DNI debe tener exactamente 13 dígitos';
  }
  const primerCuatroDNI = parseInt(dni.substring(0, 4));
  if (primerCuatroDNI < 101 || primerCuatroDNI > 909) {
    return 'Los primeros cuatro dígitos deben estar entre 0101 y 0909';
  }
  const añoNacimiento = parseInt(dni.substring(4, 8));
  if (añoNacimiento < 1920 || añoNacimiento > 2020) {
    return 'El año en el DNI debe estar entre 1920 y 2020';
  }
  return null;
};

const handleSubmit = async (e) => {
  e.preventDefault();
  setErrorMessage('');

  const camposRequeridos = [
    'dni_persona',
    'Nacionalidad',
    'direccion_persona',
    'fecha_nacimiento',
    'cod_departamento',
    'cod_genero',
    'cod_municipio'
  ];

  const camposFaltantes = camposRequeridos.filter(campo => !formData[campo]);
  if (camposFaltantes.length > 0) {
    setErrorMessage('Por favor, complete todos los campos requeridos.');
    return;
  }

  const dniError = validarDNI(formData.dni_persona);
  if (dniError) {
    setErrorMessage(dniError);
    return;
  }

  setLoading(true);

  try {
    const token = localStorage.getItem('token');
    const decoded = jwtDecode(token);
    const cod_usuario = decoded.cod_usuario;

    const response = await axios.put(
      `http://74.50.68.87:4000/api/usuarios/padre/completar-perfil/${cod_usuario}`,
      formData,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );

    Swal.fire({
      title: 'Perfil completado exitosamente',
      icon: 'success',
      showConfirmButton: false,
      timer: 2000,
    }).then(() => {
      navigate('/dashboard');
    });
    

  } catch (error) {
    console.error('Error al enviar datos:', error);
    setErrorMessage(
      error.response?.data?.mensaje || 
      'Error al actualizar el perfil. Por favor, intente nuevamente.'
    );
  } finally {
    setLoading(false);
  }
};
if (loading) {
  return <div className="loading-spinner">Cargando...</div>;
}

return (
  <div className="profile-container">
    <div className="profile-header">
      <h1 className="profile-title">Completar Perfil de Padre de Familia</h1>
      <p className="profile-subtitle">Complete la información faltante de su perfil</p>
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
              placeholder="Ingrese su DNI"
              maxLength="13"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="nombre">Primer Nombre</label>
            <input
              className="form-input"
              id="nombre"
              name="Nombre"  // Cambiado a 'Nombre'
              value={formData.Nombre}
              disabled={true}
              placeholder="Nombre pre-registrado"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="segundo_nombre">Segundo Nombre</label>
            <input
              className="form-input"
              id="segundo_nombre"
              name="Segundo_nombre"  // Cambiado a 'Segundo_nombre'
              value={formData.Segundo_nombre}
              onChange={handleInputChange}
              placeholder="Ingrese su segundo nombre"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="primer_apellido">Primer Apellido</label>
            <input
              className="form-input"
              id="primer_apellido"
              name="primer_apellido"
              value={formData.Primer_apellido}
              disabled={true}
              placeholder="Apellido pre-registrado"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="segundo_apellido">Segundo Apellido</label>
            <input
              className="form-input"
              id="segundo_apellido"
              name="Segundo_apellido"
              value={formData.Segundo_apellido}
              onChange={handleInputChange}
              placeholder="Ingrese su segundo apellido"
            />
          </div>

          <div className="form-group">
            <label className="form-label required-field" htmlFor="nacionalidad">Nacionalidad</label>
            <input
              className="form-input"
              id="nacionalidad"
              name="Nacionalidad"
              value={formData.Nacionalidad}
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
              <label className="form-label required-field" htmlFor="fecha_nacimiento">
                Fecha de Nacimiento
              </label>
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
              <label className="form-label required-field" htmlFor="cod_departamento">
                Departamento
              </label>
              <select
                className="form-input"
                id="cod_departamento"
                name="cod_departamento"
                value={formData.cod_departamento}
                onChange={handleDepartamentoChange}
              >
                <option value="">Seleccione un departamento</option>
                {departamentos.map(depto => (
                  <option 
                    key={`dep-${depto.cod_departamento}`} 
                    value={depto.cod_departamento}
                  >
                    {depto.nombre_departamento.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label required-field" htmlFor="cod_municipio">
                Municipio
              </label>
              <select
                className="form-input"
                id="cod_municipio"
                name="cod_municipio"
                value={formData.cod_municipio}
                onChange={handleMunicipioChange}
                disabled={isMunicipioDisabled}
              >
                <option value="">Seleccione un municipio</option>
                {municipios.map(municipio => (
                  <option 
                    key={`mun-${municipio.cod_municipio}`} 
                    value={municipio.cod_municipio}
                  >
                    {municipio.nombre_municipio.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
  <label className="form-label required-field" htmlFor="cod_genero">
    Género
  </label>
  <select
    className="form-input"
    id="cod_genero"
    name="cod_genero"
    value={formData.cod_genero}
    onChange={handleInputChange}
  >
    <option value="">Seleccione un género</option>
    <option value="1">Masculino</option>
    <option value="2">Femenino</option>
    <option value="2">No Binario</option>
  </select>
</div>
          </div>
        </div>

        <button 
          type="submit" 
          className="submit-btn" 
          disabled={loading}
        >
          {loading ? 'Guardando...' : 'Completar Perfil'}
        </button>
      </form>
    </div>
  );
};

export default ParentProfileForm;