import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PencilIcon, TrashIcon, Loader2 } from 'lucide-react';

const LibroDiario = () => {
  const [registros, setRegistros] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [editando, setEditando] = useState(null);
  const [formData, setFormData] = useState({
    descripcion: '',
    codCuenta: '',
    monto: ''
  });

  const cargarRegistros = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/registros', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) throw new Error('Error al cargar registros');
      
      const data = await response.json();
      setRegistros(data);
    } catch (err) {
      setError('Error al cargar los registros');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarRegistros();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const resetearFormulario = () => {
    setFormData({
      descripcion: '',
      codCuenta: '',
      monto: ''
    });
    setEditando(null);
  };

  const agregarRegistro = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await fetch('/api/registros', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) throw new Error('Error al agregar registro');
      
      await cargarRegistros();
      resetearFormulario();
    } catch (err) {
      setError('Error al agregar el registro');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const actualizarRegistro = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await fetch(`/api/registros/${editando}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) throw new Error('Error al actualizar registro');
      
      await cargarRegistros();
      resetearFormulario();
    } catch (err) {
      setError('Error al actualizar el registro');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const eliminarRegistro = async (id) => {
    if (!window.confirm('¿Está seguro de eliminar este registro?')) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/registros/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) throw new Error('Error al eliminar registro');
      
      await cargarRegistros();
    } catch (err) {
      setError('Error al eliminar el registro');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Libro Diario</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={editando ? actualizarRegistro : agregarRegistro} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Input
            type="text"
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            placeholder="Descripción"
            required
            className="col-span-full"
          />
          <Input
            type="number"
            name="codCuenta"
            value={formData.codCuenta}
            onChange={handleChange}
            placeholder="Cuenta"
            required
          />
          <Input
            type="number"
            name="monto"
            value={formData.monto}
            onChange={handleChange}
            placeholder="Monto"
            step="0.01"
            required
          />
          <Button 
            type="submit" 
            className="col-span-full"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {editando ? 'Actualizar Registro' : 'Agregar Registro'}
          </Button>
        </form>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="py-3 px-4 text-left">Fecha</th>
                <th className="py-3 px-4 text-left">Descripción</th>
                <th className="py-3 px-4 text-left">Cuenta</th>
                <th className="py-3 px-4 text-left">Monto</th>
                <th className="py-3 px-4 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {registros.map((registro) => (
                <tr key={registro.id} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-4">{new Date(registro.fecha).toLocaleString()}</td>
                  <td className="py-2 px-4">{registro.descripcion}</td>
                  <td className="py-2 px-4">{registro.codCuenta}</td>
                  <td className="py-2 px-4">
                    {Number(registro.monto).toLocaleString('es-ES', {
                      style: 'currency',
                      currency: 'USD'
                    })}
                  </td>
                  <td className="py-2 px-4">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          setEditando(registro.id);
                          setFormData({
                            descripcion: registro.descripcion,
                            codCuenta: registro.codCuenta,
                            monto: registro.monto
                          });
                        }}
                        disabled={loading}
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => eliminarRegistro(registro.id)}
                        disabled={loading}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default LibroDiario;
