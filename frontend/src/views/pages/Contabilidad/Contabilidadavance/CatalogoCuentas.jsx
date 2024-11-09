import React, { useState, useEffect } from 'react';

const CatalogoCuentas = () => {
  const BASE_URL = 'http://localhost:4000/api/catalogoCuentas'; // Ajusta esto según tu configuración

  // Estados
  const [cuentas, setCuentas] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    nombre_cuenta: '',
    descripcion: '',
    tipo: 'ACTIVO',
    naturaleza_cuenta: 'DEUDORA',
    estado_sf: 'BALANCE GENERAL',
    nivel: '1'
  });
  const [mensaje, setMensaje] = useState('');
  const [editando, setEditando] = useState(null);

  // Funciones de API
  const getCuentas = async () => {
    try {
      const response = await fetch(`${BASE_URL}/CatalogoCuentas`);
      if (!response.ok) {
        throw new Error('Error al obtener las cuentas');
      }
      return await response.json();
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  };

  const crearCuenta = async (cuentaData) => {
    try {
      const response = await fetch(`${BASE_URL}/CatalogoCuentas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cuentaData),
      });
      if (!response.ok) {
        throw new Error('Error al crear la cuenta');
      }
      return await response.json();
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  };

  const actualizarCuenta = async (codCuenta, cuentaData) => {
    try {
      const response = await fetch(`${BASE_URL}/CatalogoCuentas/${codCuenta}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cuentaData),
      });
      if (!response.ok) {
        throw new Error('Error al actualizar la cuenta');
      }
      return await response.json();
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  };

  const eliminarCuenta = async (codCuenta) => {
    try {
      const response = await fetch(`${BASE_URL}/CatalogoCuentas/${codCuenta}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Error al eliminar la cuenta');
      }
      return await response.json();
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  };

  // Cargar cuentas al montar el componente
  useEffect(() => {
    cargarCuentas();
  }, []);

  const cargarCuentas = async () => {
    try {
      const data = await getCuentas();
      setCuentas(data);
    } catch (error) {
      setMensaje('Error al cargar las cuentas');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editando) {
        await actualizarCuenta(editando, formData);
        setMensaje('Cuenta actualizada exitosamente');
      } else {
        await crearCuenta(formData);
        setMensaje('Cuenta agregada exitosamente');
      }
      cargarCuentas();
      setIsOpen(false);
      resetForm();
    } catch (error) {
      setMensaje('Error al procesar la operación');
    }
  };

  const handleDelete = async (codCuenta) => {
    if (window.confirm('¿Está seguro de eliminar esta cuenta?')) {
      try {
        await eliminarCuenta(codCuenta);
        setMensaje('Cuenta eliminada exitosamente');
        cargarCuentas();
      } catch (error) {
        setMensaje('Error al eliminar la cuenta');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      nombre_cuenta: '',
      descripcion: '',
      tipo: 'ACTIVO',
      naturaleza_cuenta: 'DEUDORA',
      estado_sf: 'BALANCE GENERAL',
      nivel: '1'
    });
    setEditando(null);
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Catálogo de Cuentas</h1>
        <button 
          onClick={() => {
            resetForm();
            setIsOpen(true);
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Agregar Nueva Cuenta
        </button>
      </div>

      {mensaje && (
        <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-4">
          {mensaje}
        </div>
      )}

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {editando ? 'Editar Cuenta' : 'Agregar Nueva Cuenta'}
              </h2>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                className="w-full border rounded p-2"
                placeholder="Nombre de la cuenta"
                value={formData.nombre_cuenta}
                onChange={(e) => setFormData({...formData, nombre_cuenta: e.target.value})}
                required
              />
              <input
                className="w-full border rounded p-2"
                placeholder="Descripción"
                value={formData.descripcion}
                onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
              />
              <select
                className="w-full border rounded p-2"
                value={formData.tipo}
                onChange={(e) => setFormData({...formData, tipo: e.target.value})}
              >
                {['ACTIVO', 'PASIVO', 'PATRIMONIO', 'INGRESO'].map(tipo => (
                  <option key={tipo} value={tipo}>{tipo}</option>
                ))}
              </select>
              <select
                className="w-full border rounded p-2"
                value={formData.naturaleza_cuenta}
                onChange={(e) => setFormData({...formData, naturaleza_cuenta: e.target.value})}
              >
                {['DEUDORA', 'ACREEDORA'].map(nat => (
                  <option key={nat} value={nat}>{nat}</option>
                ))}
              </select>
              <select
                className="w-full border rounded p-2"
                value={formData.estado_sf}
                onChange={(e) => setFormData({...formData, estado_sf: e.target.value})}
              >
                {['BALANCE GENERAL', 'ESTADO DE RESULTADO'].map(estado => (
                  <option key={estado} value={estado}>{estado}</option>
                ))}
              </select>
              <select
                className="w-full border rounded p-2"
                value={formData.nivel}
                onChange={(e) => setFormData({...formData, nivel: e.target.value})}
              >
                {['1', '2', '3', '4', '5'].map(nivel => (
                  <option key={nivel} value={nivel}>{nivel}</option>
                ))}
              </select>
              <button 
                type="submit" 
                className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                {editando ? 'Actualizar' : 'Agregar'}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase">Código</th>
              <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
              <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase">Descripción</th>
              <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
              <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase">Naturaleza</th>
              <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
              <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase">Nivel</th>
              <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {cuentas.map((cuenta) => (
              <tr key={cuenta.cod_cuenta} className="hover:bg-gray-50">
                <td className="px-6 py-4">{cuenta.cod_cuenta}</td>
                <td className="px-6 py-4">{cuenta.nombre_cuenta}</td>
                <td className="px-6 py-4">{cuenta.descripcion}</td>
                <td className="px-6 py-4">{cuenta.tipo}</td>
                <td className="px-6 py-4">{cuenta.naturaleza_cuenta}</td>
                <td className="px-6 py-4">{cuenta.estado_sf}</td>
                <td className="px-6 py-4">{cuenta.nivel}</td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button
                      className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                      onClick={() => {
                        setFormData(cuenta);
                        setEditando(cuenta.cod_cuenta);
                        setIsOpen(true);
                      }}
                    >
                      Editar
                    </button>
                    <button
                      className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                      onClick={() => handleDelete(cuenta.cod_cuenta)}
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CatalogoCuentas;
