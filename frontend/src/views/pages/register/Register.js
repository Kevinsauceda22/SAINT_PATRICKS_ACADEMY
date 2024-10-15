import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import './register.css';

const Register = () => {
  const location = useLocation();
  const {
    primerNombre: initialPrimerNombre,
    segundoNombre: initialSegundoNombre,
    primerApellido: initialPrimerApellido,
    segundoApellido: initialSegundoApellido,
    dni: initialDni,
    nacionalidad: initialNacionalidad,
    direccion: initialDireccion,
    fechaNacimiento: initialFechaNacimiento,
  } = location.state || {}; // Recupera el estado si está disponible

  // Estados locales para manejar los valores de los inputs
  const [primerNombre, setPrimerNombre] = useState(initialPrimerNombre || '');
  const [segundoNombre, setSegundoNombre] = useState(initialSegundoNombre || '');
  const [primerApellido, setPrimerApellido] = useState(initialPrimerApellido || '');
  const [segundoApellido, setSegundoApellido] = useState(initialSegundoApellido || '');
  const [dni, setDni] = useState(initialDni || '');
  const [nacionalidad, setNacionalidad] = useState(initialNacionalidad || '');
  const [direccion, setDireccion] = useState(initialDireccion || '');
  const [fechaNacimiento, setFechaNacimiento] = useState(initialFechaNacimiento || '');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');

  return (
    <div className="form-container">
      <div className="card">
        <div className="card-header">Formulario</div>
        <div className="card-subheader">Saint Patrick's Academy</div>
        <form>
          <div className="input-group">
            <label>Nombre del alumno</label>
            <input
              type="text"
              placeholder="Primer Nombre"
              value={primerNombre}
              onChange={(e) => setPrimerNombre(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Segundo Nombre"
              value={segundoNombre}
              onChange={(e) => setSegundoNombre(e.target.value)}
            />
            <input
              type="text"
              placeholder="Primer Apellido"
              value={primerApellido}
              onChange={(e) => setPrimerApellido(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Segundo Apellido"
              value={segundoApellido}
              onChange={(e) => setSegundoApellido(e.target.value)}
            />
          </div>
          <div className="input-group">
            <label>DNI</label>
            <input
              type="text"
              placeholder="DNI"
              value={dni}
              onChange={(e) => setDni(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label>Nacionalidad</label>
            <input
              type="text"
              placeholder="Nacionalidad"
              value={nacionalidad}
              onChange={(e) => setNacionalidad(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label>Dirección</label>
            <input
              type="text"
              placeholder="Dirección o Domicilio"
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label>Fecha de Nacimiento</label>
            <input
              type="date"
              value={fechaNacimiento}
              onChange={(e) => setFechaNacimiento(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label>Contraseña</label>
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label>Repite la contraseña</label>
            <input
              type="password"
              placeholder="Repite la contraseña"
              value={repeatPassword}
              onChange={(e) => setRepeatPassword(e.target.value)}
              required
            />
          </div>
          <div className="button-container">
            <button type="submit">Enviar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
