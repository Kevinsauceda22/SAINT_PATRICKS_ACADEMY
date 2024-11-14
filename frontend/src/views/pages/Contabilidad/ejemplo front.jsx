import React, { useState } from 'react';
import { AlertCircle, Check, Edit2, Trash2, Download, Upload, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const LibroDiario = () => {
  const [activeTab, setActiveTab] = useState('deudor');
  const [registros] = useState([
    {
      id: 1,
      fecha: '13/11/2024',
      descripcion: 'Ejemplo 1',
      cuenta: '1001',
      monto: 5000,
      tipo: 'acreedor'
    },
    {
      id: 2,
      fecha: '13/11/2024',
      descripcion: 'Ejemplo 2',
      cuenta: '2001',
      monto: 5000,
      tipo: 'deudor'
    },
    {
      id: 3,
      fecha: '13/11/2024',
      descripcion: 'Ejemplo 3',
      cuenta: '3001',
      monto: 1200,
      tipo: 'deudor'
    }
  ]);

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Libro Diario</h1>
          <p className="text-gray-500">Gestión de transacciones contables</p>
        </div>
      </div>

      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Example error message
        </AlertDescription>
      </Alert>

      <Alert variant="success" className="mb-4 bg-green-50 text-green-700 border-green-200">
        <Check className="h-4 w-4" />
        <AlertDescription>
          Example success message
        </AlertDescription>
      </Alert>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Fecha Inicio</label>
              <input
                type="date"
                className="w-full border rounded-md px-3 py-2"
                placeholder="dd/mm/aaaa"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Fecha Fin</label>
              <input
                type="date"
                className="w-full border rounded-md px-3 py-2"
                placeholder="dd/mm/aaaa"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Cuenta</label>
              <select className="w-full border rounded-md px-3 py-2">
                <option>Seleccionar cuenta</option>
              </select>
            </div>
          </div>
          <button className="mt-4 w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 flex items-center justify-center gap-2">
            <Filter className="w-4 h-4" />
            Aplicar Filtros
          </button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-green-600">L 25,000.00</div>
            <div className="text-sm text-gray-500">Total Deudor</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-blue-600">L 20,000.00</div>
            <div className="text-sm text-gray-500">Total Acreedor</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-red-600">L 5,000.00</div>
            <div className="text-sm text-gray-500">Diferencia</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="deudor" className="w-full">
        <TabsList className="w-full mb-4">
          <TabsTrigger value="deudor" className="flex-1">Deudor</TabsTrigger>
          <TabsTrigger value="acreedor" className="flex-1">Acreedor</TabsTrigger>
        </TabsList>
        
        {['deudor', 'acreedor'].map((tipo) => (
          <TabsContent key={tipo} value={tipo}>
            <Card>
              <CardContent className="pt-6">
                <form className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Fecha</label>
                    <input
                      type="date"
                      className="w-full border rounded-md px-3 py-2"
                      placeholder="dd/mm/aaaa"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Cuenta</label>
                    <select className="w-full border rounded-md px-3 py-2">
                      <option>Seleccionar cuenta</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Descripción</label>
                    <textarea
                      className="w-full border rounded-md px-3 py-2"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Monto</label>
                    <input
                      type="number"
                      className="w-full border rounded-md px-3 py-2"
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Referencia</label>
                    <input
                      type="text"
                      className="w-full border rounded-md px-3 py-2"
                    />
                  </div>
                  <button className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600">
                    Guardar
                  </button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Registros</CardTitle>
          <div className="space-x-2">
            <button className="bg-green-500 text-white p-2 rounded-md hover:bg-green-600">
              <Download className="w-4 h-4" />
            </button>
            <button className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600">
              <Upload className="w-4 h-4" />
            </button>
            <button className="bg-gray-500 text-white p-2 rounded-md hover:bg-gray-600">
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4">FECHA</th>
                  <th className="text-left p-4">DESCRIPCIÓN</th>
                  <th className="text-left p-4">CUENTA</th>
                  <th className="text-left p-4">MONTO</th>
                  <th className="text-left p-4">TIPO</th>
                  <th className="text-left p-4">ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                {registros.map((registro) => (
                  <tr key={registro.id} className="border-b">
                    <td className="p-4">{registro.fecha}</td>
                    <td className="p-4">{registro.descripcion}</td>
                    <td className="p-4">{registro.cuenta}</td>
                    <td className="p-4">L {registro.monto.toLocaleString()}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        registro.tipo === 'deudor' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {registro.tipo}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-800">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-800">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LibroDiario;
