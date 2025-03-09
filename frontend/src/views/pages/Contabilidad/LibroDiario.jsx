import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { 
  AlertCircle, 
  Check, 
  FileText, 
  Edit2, 
  Trash2, 
  Calendar, 
  DollarSign, 
  List, 
  Filter,
  RefreshCw
} from 'lucide-react';
import Swal from 'sweetalert2';
import './LibroDiario.css'
import logo from 'src/assets/brand/logo_saint_patrick.png';
import usePermission from '../../../../context/usePermission';
import AccessDenied from "../AccessDenied/AccessDenied";


const CuentasSelector = ({ 
  
  cuentas, 
  naturaleza, 
  value, 
  onChange, 
  name, 
  error 
}) => {
  // Agrupar cuentas por tipo
  const cuentasPorTipo = cuentas
    .filter(cuenta => cuenta.Naturaleza_cuenta === naturaleza)
    .reduce((grupos, cuenta) => {
      const Tipo = cuenta.Tipo_Cuenta;
      if (!grupos[Tipo]) {
        grupos[Tipo] = [];
      }
      grupos[Tipo].push(cuenta);
      return grupos;
    }, {});

  return (
    <div className="form-field">
      <label className="field-label">
        <FileText className="h-4 w-4 mr-2" />
        Cuenta {naturaleza === "Deudora" ? "Deudora" : "Acreedora"}
      </label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="field-select"
      >
        <option value="">
          Seleccione una cuenta {naturaleza === "DEUDORA" ? "deudora" : "acreedora"}
        </option>
        {Object.entries(cuentasPorTipo).map(([Tipo, cuentasGrupo]) => (
          <optgroup key={Tipo} label={Tipo}>
            {cuentasGrupo.map((cuenta) => (
              <option
                key={cuenta.Cod_cuenta}
                value={cuenta.Cod_cuenta}
                className={`cuenta-${naturaleza.toLowerCase()}`}
              >
                {cuenta.Cod_cuenta} - {cuenta.Nombre_cuenta}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
      {error && (
        <span className="field-error">
          {`Seleccione una cuenta ${naturaleza.toLowerCase()}`}
        </span>
      )}
    </div>
  );
};

const LibroDiario = () => {
  const { canSelect, canUpdate, canDelete, canInsert } = usePermission('LibroDiario');

  // Estado principal
  const [registros, setRegistros] = useState([]);
  const [filteredRegistros, setFilteredRegistros] = useState([]);
  const [cuentas, setCuentas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [filterType, setFilterType] = useState('todos');
  const [cuentasMap, setCuentasMap] = useState({});
  const [registroCount, setRegistroCount] = useState(0);



  // Estado del formulario Deudor
  const [formDataDeudor, setFormDataDeudor] = useState({
    Fecha: new Date().toISOString().split('T')[0],
    Descripcion: '',
    Cod_cuenta: '',
    Monto: '',
    Tipo: 'DEUDOR'
  });

  // Estado del formulario Acreedor
  const [formDataAcreedor, setFormDataAcreedor] = useState({
    Fecha: new Date().toISOString().split('T')[0],
    Descripcion: '',
    Cod_cuenta: '',
    Monto: '',
    Tipo: 'ACREEDOR'
  });

  // Estado de errores de formulario
  const [formErrors, setFormErrors] = useState({
    deudor: {},
    acreedor: {}
  });

  // Estado para el botón de submit
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);

  

  // Effects
  useEffect(() => {
    fetchRegistros();
    fetchCuentas();
  }, []);

  useEffect(() => {
    filterRegistros();
  }, [registros, filterType]);

  useEffect(() => {
    const mapping = {};
    cuentas.forEach(cuenta => {
      mapping[cuenta.Cod_cuenta] = cuenta.Nombre_cuenta;
    });
    setCuentasMap(mapping);
  }, [cuentas]);

  useEffect(() => {
    validateForms();
  }, [formDataDeudor, formDataAcreedor]);

  // Funciones de fetch
  const fetchRegistros = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://74.50.68.87:4000/api/Librodiario', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Error en la respuesta del servidor');
      }
      
      const data = await response.json();
      
      if (Array.isArray(data)) {
        setRegistros(data);
      } else {
        setRegistros([]);
        setError('No se encontraron registros.');
      }
    } catch (err) {
      setError('Error al cargar los registros: ' + err.message);
      console.error('Error al cargar registros:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCuentas = async () => {
    try {
      const response = await fetch('http://74.50.68.87:4000/api/catalogoCuentas', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Error en la respuesta del servidor');
      const data = await response.json();
      setCuentas(data);
    } catch (err) {
      setError('Error al cargar las cuentas: ' + err.message);
    }
  };

  // Funciones de filtrado y validación
  const filterRegistros = () => {
    if (filterType === 'todos') {
      setFilteredRegistros(registros);
    } else {
      setFilteredRegistros(registros.filter(registro => registro.Tipo === filterType));
    }
  };

  const validateForms = () => {
    if (editingId) {
      // Si se está editando, no realizar validación
      setIsButtonDisabled(false);
      return;
    }
  
    const deudorErrors = validateForm('deudor');
    const acreedorErrors = validateForm('acreedor');
    
    setFormErrors({
      deudor: deudorErrors,
      acreedor: acreedorErrors
    });
  
    const hasErrors = Object.keys(deudorErrors).length > 0 || Object.keys(acreedorErrors).length > 0;
    const isComplete = formDataDeudor.Monto && formDataAcreedor.Monto;
    
    setIsButtonDisabled(hasErrors || !isComplete);
  };

  const validateForm = (type) => {
    const formData = type === 'deudor' ? formDataDeudor : formDataAcreedor;
    const errors = {};

    if (!formData.Fecha) errors.Fecha = 'La fecha es requerida';
    if (!formData.Descripcion) errors.Descripcion = 'La descripción es requerida';
    if (!formData.Cod_cuenta) errors.Cod_cuenta = 'La cuenta es requerida';
    if (!formData.Monto || isNaN(formData.Monto) || parseFloat(formData.Monto) <= 0) {
      errors.Monto = 'El monto debe ser un número mayor a 0';
    }

    return errors;
  };

  // Funciones de manejo de formulario
  const handleInputChange = (e, type) => {
    const { name, value } = e.target;
    if (type === 'deudor') {
      setFormDataDeudor(prev => ({ ...prev, [name]: value }));
    } else {
      setFormDataAcreedor(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission
  
    try {
      // Show a loading spinner while processing the form
      Swal.fire({
        title: 'Guardando registros...',
        text: 'Por favor espere',
        allowOutsideClick: false,
        showConfirmButton: false,
        willOpen: () => {
          Swal.showLoading();
        }
      });
  
      console.log('Datos del Deudor:', formDataDeudor);
      console.log('Datos del Acreedor:', formDataAcreedor);
  
      // Create the debtor and creditor records in the backend
      const deudorResponse = await fetch('http://74.50.68.87:4000/api/Librodiario', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formDataDeudor)
      });
  
      const acreedorResponse = await fetch('http://74.50.68.87:4000/api/Librodiario', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formDataAcreedor)
      });
  
      // Ensure both requests were successful
      if (!deudorResponse.ok || !acreedorResponse.ok) {
        throw new Error('Error al guardar los registros');
      }
  
      // Show a success message and reset the forms
      await Swal.fire({
        icon: 'success',
        title: '¡Éxito!',
        text: 'Registros guardados correctamente',
        confirmButtonColor: '#22c55e',
        timer: 1500
      });
  
      resetForms();
      await fetchRegistros();
    } catch (err) {
      // Handle any errors that occurred
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message,
        confirmButtonColor: '#22c55e'
      });
    }
  };

  const handleDelete = async (Cod_libro_diario) => {
    const result = await Swal.fire({
      title: '¿Está seguro?',
      text: "Esta acción no se puede revertir",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`http://74.50.68.87:4000/api/Librodiario/${Cod_libro_diario}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          throw new Error('Error al eliminar el registro');
        }

        await Swal.fire(
          '¡Eliminado!',
          'El registro ha sido eliminado exitosamente.',
          'success'
        );

        await fetchRegistros();
      } catch (err) {
        Swal.fire(
          'Error',
          'No se pudo eliminar el registro: ' + err.message,
          'error'
        );
      }
    }
  };

  const handleEdit = (registro) => {
    if (registro.tipo === 'DEUDOR') {
      setFormDataDeudor({
        Fecha: registro.Fecha.split('T')[0],
        Descripcion: registro.Descripcion,
        Cod_cuenta: registro.Cod_cuenta,
        Monto: registro.Monto.toString(),
        tipo: 'DEUDOR'
      });
      setFormDataAcreedor({
        Fecha: new Date().toISOString().split('T')[0],
        Descripcion: '',
        Cod_cuenta: '',
        Monto: '',
        tipo: 'ACREEDOR'
      });
    } else {
      setFormDataAcreedor({
        Fecha: registro.Fecha.split('T')[0],
        Descripcion: registro.Descripcion,
        Cod_cuenta: registro.Cod_cuenta,
        Monto: registro.Monto.toString(),
        tipo: 'ACREEDOR'
      });
      setFormDataDeudor({
        Fecha: new Date().toISOString().split('T')[0],
        Descripcion: '',
        Cod_cuenta: '',
        Monto: '',
        tipo: 'DEUDOR'
      });
    }
    setEditingId(registro.Cod_libro_diario);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const resetForms = () => {
    setFormDataDeudor({
      Fecha: new Date().toISOString().split('T')[0],
      Descripcion: '',
      Cod_cuenta: '',
      Monto: '',
      Tipo: 'Acreedor'
    });
    setFormDataAcreedor({
      Fecha: new Date().toISOString().split('T')[0],
      Descripcion: '',
      Cod_cuenta: '',
      Monto: '',
      Tipo: 'Acreedor'
    });
    setEditingId(null);
    setFormErrors({ deudor: {}, acreedor: {} });
  };

  
  const generatePDF = () => {
    const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
    });
    
    const img = new Image();
    img.src = logo;
    
    img.onload = () => {
        const pageWidth = doc.internal.pageSize.width;
        const pageHeight = doc.internal.pageSize.height;
        
        // Función para marca de agua mejorada
        const addWatermark = () => {
            const fontSize = 50;
            const text = 'CONFIDENCIAL';
            
            doc.saveGraphicsState();
            doc.setGState(new doc.GState({ opacity: 0.15 }));
            doc.setTextColor(220, 53, 69);
            doc.setFontSize(fontSize);
            doc.setFont('helvetica', 'bold')

            // Añadir múltiples marcas de agua para mejor cobertura
            for (let i = 0; i < pageHeight; i += fontSize * 2) {
                for (let j = 0; j < pageWidth; j += fontSize * 4) {
                    doc.text(text, j, i, {
                        angle: -45,
                        renderingMode: 'fill'
                    });
                }
            }
            
            doc.restoreGraphicsState();
 }
        // Header mejorado con logo y diseño más profesional
        doc.addImage(img, 'PNG', 10, 5, 25, 25);
        
        // Encabezado con mejor espaciado y diseño
        doc.setTextColor(22, 160, 133);
        doc.setFontSize(22);
        doc.text("SAINT PATRICK'S ACADEMY", pageWidth / 2, 15, { align: 'center' });
        doc.setFontSize(18);
        doc.text('LIBRO DIARIO', pageWidth / 2, 25, { align: 'center' });
        
        // Información de contacto con mejor formato
        doc.setFontSize(10);
        doc.setTextColor(68, 68, 68);
        doc.text([
            'Casa Club del periodista, Colonia del Periodista',
            'Teléfono: (504) 2234-8871',
            'Correo: info@saintpatrickacademy.edu'
        ], pageWidth / 2, 33, { align: 'center', lineHeightFactor: 1.5 });

        // Añadir marca de agua
        addWatermark();

        // Calcular totales y balance
        const totales = filteredRegistros.reduce((acc, registro) => {
            const monto = parseFloat(registro.Monto) || 0;
            const tipo = (registro.Tipo || registro.tipo || '').toString().toUpperCase();
            
            if (tipo.includes('DEUDOR')) {
                acc.totalDeudor += monto;
            } else if (tipo.includes('ACREEDOR')) {
                acc.totalAcreedor += monto;
            }
            return acc;
        }, { totalDeudor: 0, totalAcreedor: 0 });

        const balance = totales.totalDeudor - totales.totalAcreedor;

        // Tabla principal mejorada
        doc.autoTable({
            startY: 50,
            head: [['#', 'Fecha', 'Descripción', 'Cuenta', 'Monto (L)', 'Tipo']],
            body: [
                ...filteredRegistros.map((registro, index) => {
                    const tipo = (registro.Tipo || registro.tipo || '').toString().toUpperCase();
                    return [
                        index + 1,
                        new Date(registro.Fecha).toLocaleDateString('es-HN'),
                        registro.Descripcion,
                        `${registro.Cod_cuenta} - ${cuentasMap[registro.Cod_cuenta] || ''}`,
                        `L ${parseFloat(registro.Monto).toLocaleString('es-HN', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                        })}`,
                        tipo.includes('DEUDOR') ? 'DEUDOR' : 'ACREEDOR'
                    ];
                }),
                // Espaciador
                [{ content: '', colSpan: 6, styles: { fillColor: [255, 255, 255], minCellHeight: 5 } }],
                // Sección de resumen
                [{
                    content: 'RESUMEN DE TRANSACCIONES',
                    colSpan: 6,
                    styles: {
                        fillColor: [22, 160, 133],
                        textColor: [255, 255, 255],
                        fontSize: 12,
                        fontStyle: 'bold',
                        halign: 'center'
                    }
                }],
                [
                    { content: 'Total Cargos (Debe)', colSpan: 3, styles: { fontStyle: 'bold' } },
                    { 
                        content: `L ${totales.totalDeudor.toLocaleString('es-HN', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                        })}`,
                        colSpan: 3,
                        styles: { halign: 'right', fontStyle: 'bold' }
                    }
                ],
                [
                    { content: 'Total Abonos (Haber)', colSpan: 3, styles: { fontStyle: 'bold' } },
                    { 
                        content: `L ${totales.totalAcreedor.toLocaleString('es-HN', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                        })}`,
                        colSpan: 3,
                        styles: { halign: 'right', fontStyle: 'bold' }
                    }
                ],
                // Espaciador
                [{ content: '', colSpan: 6, styles: { fillColor: [255, 255, 255], minCellHeight: 5 } }],
                // Balance de valoración
                [{
                    content: 'BALANCE DE VALORACIÓN',
                    colSpan: 6,
                    styles: {
                        fillColor: [22, 160, 133],
                        textColor: [255, 255, 255],
                        fontSize: 12,
                        fontStyle: 'bold',
                        halign: 'center'
                    }
                }],
                [
                    { content: 'Balance', colSpan: 3, styles: { fontStyle: 'bold' } },
                    { 
                        content: `L ${Math.abs(balance).toLocaleString('es-HN', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                        })} ${balance >= 0 ? '(Deudor)' : '(Acreedor)'}`,
                        colSpan: 3,
                        styles: { 
                            halign: 'right',
                            fontStyle: 'bold',
                            textColor: balance === 0 ? [0, 128, 0] : [0, 0, 0]
                        }
                    }
                ],
                [
                    { 
                        content: balance === 0 ? 'Las cuentas están balanceadas' : 'Las cuentas no están balanceadas',
                        colSpan: 6,
                        styles: { 
                            halign: 'center',
                            fontStyle: 'bold',
                            textColor: balance === 0 ? [0, 128, 0] : [220, 53, 69]
                        }
                    }
                ]
            ],
            styles: {
                fontSize: 10,
                cellPadding: 5
            },
            headStyles: {
                fillColor: [22, 160, 133],
                textColor: [255, 255, 255],
                fontSize: 11,
                fontStyle: 'bold'
            },
            alternateRowStyles: {
                fillColor: [240, 248, 255]
            },
            margin: { top: 15 },
            didDrawPage: function(data) {
                addWatermark();
                // Pie de página mejorado
                doc.setFontSize(8);
                doc.setTextColor(128);
                const date = new Date().toLocaleDateString('es-HN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
                doc.text(`Generado el: ${date}`, 15, pageHeight - 10);
                doc.text(`Página ${data.pageCount}`, pageWidth - 20, pageHeight - 10);
            }
        });


        doc.save('Reporte_Libro_Diario.pdf');
    };

    img.onerror = () => {
        Swal.fire('Error', 'No se pudo cargar el logo.', 'error');
    };
};

// Función auxiliar para calcular totales
const calcularTotales = (registros) => {
    const totales = registros.reduce((acc, registro) => {
        const monto = parseFloat(registro.Monto) || 0;
        const tipo = (registro.Tipo || registro.tipo || '').toString().toUpperCase();
        if (tipo.includes('DEUDOR')) {
            acc.totalDeudor += monto;
        } else if (tipo.includes('ACREEDOR')) {
            acc.totalAcreedor += monto;
        }
        return acc;
    }, { totalDeudor: 0, totalAcreedor: 0 });

    return [
        [
            { content: '', colSpan: 3 },
            { content: 'TOTAL DEUDOR', styles: { fontStyle: 'bold' } },
            { 
                content: `L ${totales.totalDeudor.toLocaleString('es-HN', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                })}`,
                styles: { halign: 'right', fontStyle: 'bold' }
            },
            { content: 'DEUDOR', styles: { halign: 'center', fontStyle: 'bold' } }
        ],
        [
            { content: '', colSpan: 3 },
            { content: 'TOTAL ACREEDOR', styles: { fontStyle: 'bold' } },
            { 
                content: `L ${totales.totalAcreedor.toLocaleString('es-HN', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                })}`,
                styles: { halign: 'right', fontStyle: 'bold' }
            },
            { content: 'ACREEDOR', styles: { halign: 'center', fontStyle: 'bold' } }
        ]
    ];
};

if (!canSelect) {
  return <AccessDenied />;
}

  return (
    <div className="libro-diario-container">
      <div className="header-section">
        <h1 className="header-title">Libro Diario</h1>
        <p className="header-subtitle">Gestión de transacciones diarias</p>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle className="h-5 w-5 mr-2" />
          <p>{error}</p>
          <button className="ml-auto" onClick={() => setError(null)}>×</button>
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <Check className="h-5 w-5 mr-2" />
          <span>{success}</span>
          <button className="ml-auto" onClick={() => setSuccess(null)}>×</button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="form-container">
        <div className="form-grid">



          {/* Formulario Deudor */}
<div className="form-group">
  <h2 className="form-group-title">
    <DollarSign className="h-5 w-5 mr-2" />
    Deudor
  </h2>
  <div className="form-section">
    {/* Fecha */}
    <div className="form-field">
      <label className="field-label">
        <Calendar className="h-4 w-4 mr-2" />
        Fecha
      </label>
      <input
        type="date"
        name="Fecha"
        value={formDataDeudor.Fecha}
        onChange={(e) => handleInputChange(e, 'deudor')}
        className="field-input"
        max={new Date().toISOString().split('T')[0]}
      />
      {formErrors.deudor.Fecha && (
        <span className="field-error">{formErrors.deudor.Fecha}</span>
      )}
    </div>
     {/* Reemplazar el selector de cuenta deudora con el nuevo componente */}
     <CuentasSelector
                cuentas={cuentas}
                naturaleza="DEUDORA"
                value={formDataDeudor.Cod_cuenta}
                onChange={(e) => handleInputChange(e, 'deudor')}
                name="Cod_cuenta"
                error={formErrors.deudor.Cod_cuenta}
              />


  
              {/* Descripción */}
    <div className="form-field">
      <label className="field-label">
        <List className="h-4 w-4 mr-2" />
        Descripción
      </label>
      <input
        type="text"
        name="Descripcion"
        value={formDataDeudor.Descripcion}
        onChange={(e) => handleInputChange(e, 'deudor')}
        className="field-input"
        placeholder="Ingrese la descripción"
      />
      {formErrors.deudor.Descripcion && (
        <span className="field-error">{formErrors.deudor.Descripcion}</span>
      )}
    </div>

              <div className="form-field">
                <label className="field-label">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Monto (L)
                </label>
                <input
                  type="number"
                  name="Monto"
                  value={formDataDeudor.Monto}
                  onChange={(e) => handleInputChange(e, 'deudor')}
                  className="field-input"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
                {formErrors.deudor.Monto && (
                  <span className="field-error">{formErrors.deudor.Monto}</span>
                )}
              </div>
            </div>
          </div>

          
       {/* Formulario Acreedor */}
<div className="form-group">
  <h2 className="form-group-title">
    <DollarSign className="h-5 w-5 mr-2" />
    Acreedor
  </h2>
  <div className="form-section">
    {/* Fecha */}
    <div className="form-field">
      <label className="field-label">
        <Calendar className="h-4 w-4 mr-2" />
        Fecha
      </label>
      <input
        type="date"
        name="Fecha"
        value={formDataAcreedor.Fecha}
        onChange={(e) => handleInputChange(e, 'acreedor')}
        className="field-input"
        max={new Date().toISOString().split('T')[0]}
      />
      {formErrors.acreedor.Fecha && (
        <span className="field-error">{formErrors.acreedor.Fecha}</span>
      )}
    </div>

       {/* Reemplazar el selector de cuenta acreedora con el nuevo componente */}
       <CuentasSelector
                cuentas={cuentas}
                naturaleza="ACREEDORA"
                value={formDataAcreedor.Cod_cuenta}
                onChange={(e) => handleInputChange(e, 'acreedor')}
                name="Cod_cuenta"
                error={formErrors.acreedor.Cod_cuenta}
              />


    {/* Descripción */}
    <div className="form-field">
      <label className="field-label">
        <List className="h-4 w-4 mr-2" />
        Descripción
      </label>
      <input
        type="text"
        name="Descripcion"
        value={formDataAcreedor.Descripcion}
        onChange={(e) => handleInputChange(e, 'acreedor')}
        className="field-input"
        placeholder="Ingrese la descripción"
      />
      {formErrors.acreedor.Descripcion && (
        <span className="field-error">{formErrors.acreedor.Descripcion}</span>
      )}
    </div>

              <div className="form-field">
                <label className="field-label">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Monto (L)
                </label>
                <input
                  type="number"
                  name="Monto"
                  value={formDataAcreedor.Monto}
                  onChange={(e) => handleInputChange(e, 'acreedor')}
                  className="field-input"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
                {formErrors.acreedor.Monto && (
                  <span className="field-error">{formErrors.acreedor.Monto}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="button-group">
          <button
            type="button"
            onClick={resetForms}
            className="button-cancel"
          >
            Cancelar
          </button>
          {canInsert && (
          <button
            type="submit"
            disabled={isButtonDisabled}
            className="button-submit"
          >
            {editingId ? 'Actualizar' : 'Registrar'}
          </button>
          )}
        </div>
      </form>

      <div className="table-container">
        <div className="table-header">
          <h2 className="table-title">Registros</h2>
          <div className="table-actions">
            <div className="filter-group">
              <Filter className="h-5 w-5 text-gray-500" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="filter-select"
              >
                <option value="todos">Todos</option>
                <option value="Deudor">Deudor</option>
                <option value="Acreedor">Acreedor</option>
              </select>
            </div>
            <button onClick={generatePDF} className="pdf-button">
              <FileText className="h-4 w-4 mr-2" />
              Generar PDF
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="table-styles">
            <thead className="table-head">
              <tr>
                <th className="table-header-cell">Fecha</th>
                <th className="table-header-cell">Descripción</th>
                <th className="table-header-cell">Cuenta</th>
                <th className="table-header-cell">Monto (L)</th>
                <th className="table-header-cell">Tipo</th>
                <th className="table-header-cell">Acciones</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {loading ? (
                <tr>
                  <td colSpan="6" className="loading-text">
                    <div className="flex items-center justify-center">
                      <RefreshCw className="h-5 w-5 animate-spin mr-2" />
                      Cargando registros...
                    </div>
                  </td>
                </tr>
              ) : filteredRegistros.length === 0 ? (
                <tr>
                  <td colSpan="6" className="empty-text">
                    No hay registros disponibles
                  </td>
                </tr>
              ) : (
                filteredRegistros.map((registro) => (
                  <tr key={registro.Cod_libro_diario} className="table-row">
                    <td className="table-cell">
                      {new Date(registro.Fecha).toLocaleDateString()}
                    </td>
                    <td className="table-cell">{registro.Descripcion}</td>
                    <td className="table-cell">
                      {registro.Cod_cuenta} - {cuentasMap[registro.Cod_cuenta] || 'Sin nombre'}
                    </td>
                    <td className="table-cell">
                      L {parseFloat(registro.Monto).toLocaleString('es-HN', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
                    </td>
                    <td className="table-cell">
  <span 
    className={`px-3 py-1 rounded-full text-xs font-medium ${
      registro.tipo === 'Deudor' 
        ? 'bg-blue-100 text-blue-800' 
        : 'bg-green-100 text-green-800'
    }`}
  >
    {registro.tipo}
  </span>
</td>   <td className="table-cell">
                      <span 
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          registro.tipo === 'Deudor' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {registro.Tipo}
                      </span>
                    </td>
                    <td className="table-actions-cell">

                      {canUpdate && (
                    <button
  onClick={() => handleEdit(registro)}
  className="action-button edit-button"
  title="Editar registro"
>
  <Edit2 className="h-5 w-5 mr-2" />
  Editar
</button>

                      )}

                      {canDelete && (
<button
  onClick={() => handleDelete(registro.Cod_libro_diario)}
  className="action-button delete-button"
  title="Eliminar registro"
>
  <Trash2 className="h-5 w-5 mr-2" />
  Eliminar
</button>

                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {filteredRegistros.length > 0 && (
              <tfoot className="bg-gray-50 border-t border-gray-200">
                <tr>
                  <td colSpan="3" className="px-6 py-4 text-sm font-medium text-gray-900">
                    Total:
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    L {filteredRegistros
                      .reduce((sum, registro) => sum + parseFloat(registro.Monto), 0)
                      .toLocaleString('es-HN', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
                  </td>
                  <td colSpan="2"></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {/* Paginación si se necesita en el futuro */}
        {/*<div className="flex items-center justify-between px-6 py-3 bg-gray-50 border-t border-gray-200">
          <div className="flex-1 flex justify-between sm:hidden">
            <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              Anterior
            </button>
            <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              Siguiente
            </button>
          </div>
        </div>*/}
      </div>

      {/* Modal de confirmación si se necesita en el futuro */}
      {/*<div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
      <div className="fixed inset-0 z-10 overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          {/* Modal content *//*}
        </div>
      </div>*/}
    </div>
  );
};

export default LibroDiario;