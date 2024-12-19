import React, { useState, useEffect, useCallback } from 'react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { AlertCircle, Check, FileText, Edit2, Trash2, Calendar, DollarSign, List, Upload, Download, Filter, RefreshCcw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Tipos
interface Registro {
  id: string;
  fecha: string;
  descripcion: string;
  cuenta: string;
  monto: number;
  referencia: string;
  tipo: 'deudor' | 'acreedor';
}

interface Cuenta {
  id: string;
  codigo: string;
  nombre: string;
}

interface FormData {
  fecha: string;
  descripcion: string;
  cuenta: string;
  monto: string;
  referencia: string;
}

const LibroDiario = () => {
  // Estados principales
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [cuentas, setCuentas] = useState<Cuenta[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'deudor' | 'acreedor'>('deudor');
  
  // Estados para filtros y ordenamiento
  const [filtros, setFiltros] = useState({
    fechaInicio: '',
    fechaFin: '',
    cuentaId: '',
    tipoRegistro: ''
  });

  // Estados para formularios con validación
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<Record<'deudor' | 'acreedor', FormData>>({
    deudor: {
      fecha: new Date().toISOString().split('T')[0],
      descripcion: '',
      cuenta: '',
      monto: '',
      referencia: ''
    },
    acreedor: {
      fecha: new Date().toISOString().split('T')[0],
      descripcion: '',
      cuenta: '',
      monto: '',
      referencia: ''
    }
  });

  // Estado para balance
  const [balance, setBalance] = useState({
    totalDeudor: 0,
    totalAcreedor: 0,
    diferencia: 0
  });

  // Efecto para cargar datos iniciales
  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          throw new Error('No hay token de autenticación');
        }

        // Cargar cuentas
        const cuentasResponse = await fetch('http://74.50.68.87/api/catalogocuentas', {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          signal
        });

        if (!cuentasResponse.ok) {
          throw new Error('Error al cargar cuentas');
        }

        const cuentasData = await cuentasResponse.json();
        setCuentas(cuentasData);

        // Cargar registros
        const registrosResponse = await fetch('http://74.50.68.87/api/Librodiario', {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          signal
        });

        if (!registrosResponse.ok) {
          throw new Error('Error al cargar registros');
        }

        const registrosData = await registrosResponse.json();
        setRegistros(registrosData);

      } catch (err) {
        if (err.name === 'AbortError') return;
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();

    return () => {
      controller.abort();
    };
  }, []);

  // Función mejorada para validar el formulario
  const validateForm = (data: FormData): Record<string, string> => {
    const errors: Record<string, string> = {};
    
    if (!data.fecha) errors.fecha = 'La fecha es requerida';
    if (!data.descripcion?.trim()) errors.descripcion = 'La descripción es requerida';
    if (!data.cuenta) errors.cuenta = 'La cuenta es requerida';
    if (!data.monto || isNaN(Number(data.monto)) || Number(data.monto) <= 0) {
      errors.monto = 'El monto debe ser un número mayor a 0';
    }
    
    return errors;
  };

  // Función para manejar el envío del formulario
  const handleSubmit = async (tipo: 'deudor' | 'acreedor') => {
    try {
      const data = formData[tipo];
      const errors = validateForm(data);

      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        return;
      }

      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const response = await fetch('http://74.50.68.87/api/Librodiario', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...data,
          tipo,
          monto: Number(data.monto)
        })
      });

      if (!response.ok) {
        throw new Error('Error al guardar el registro');
      }

      const nuevoRegistro = await response.json();
      setRegistros(prev => [...prev, nuevoRegistro]);
      setSuccess('Registro guardado exitosamente');
      
      // Limpiar formulario
      setFormData(prev => ({
        ...prev,
        [tipo]: {
          fecha: new Date().toISOString().split('T')[0],
          descripcion: '',
          cuenta: '',
          monto: '',
          referencia: ''
        }
      }));
      setFormErrors({});

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  // Componente de Tabla mejorado
  const TablaRegistros = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Fecha
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Descripción
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Cuenta
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Monto
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tipo
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {registros.map((registro) => (
            <tr key={registro.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                {new Date(registro.fecha).toLocaleDateString()}
              </td>
              <td className="px-6 py-4">{registro.descripcion}</td>
              <td className="px-6 py-4">{registro.cuenta}</td>
              <td className="px-6 py-4">
                L {Number(registro.monto).toLocaleString('es-HN', { minimumFractionDigits: 2 })}
              </td>
              <td className="px-6 py-4">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  registro.tipo === 'deudor' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {registro.tipo}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                  onClick={() => handleEdit(registro.id)}
                  className="text-indigo-600 hover:text-indigo-900 mr-2"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(registro.id)}
                  className="text-red-600 hover:text-red-900"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-4">
      {/* ... resto del JSX existente ... */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Registros</CardTitle>
          <div className="space-x-2">
            <button
              onClick={() => handleExport()}
              className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors"
              disabled={loading}
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleImport()}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
              disabled={loading}
            >
              <Upload className="w-4 h-4" />
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <TablaRegistros />
        </CardContent>
      </Card>
    </div>
  );
};

export default LibroDiario;
