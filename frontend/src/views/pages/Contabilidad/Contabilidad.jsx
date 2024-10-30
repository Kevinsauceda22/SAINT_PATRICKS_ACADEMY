import React, { useState, useEffect } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const styles = `
  .catalogo-container {
    padding: 30px;
    max-width: 1400px;
    margin: 0 auto;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background: #f0f4f8;
    min-height: 100vh;
  }

  .panel {
    background: white;
    border-radius: 16px;
    box-shadow: 0 4px 25px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    transition: transform 0.2s;
  }

  .panel:hover {
    transform: translateY(-2px);
  }

  .panel-header {
    background: linear-gradient(135deg, #2563eb, #1d4ed8);
    color: white;
    padding: 25px 30px;
    border-radius: 16px 16px 0 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 4px 15px rgba(37, 99, 235, 0.2);
  }

  .panel-title {
    font-size: 28px;
    font-weight: 600;
    margin: 0;
    letter-spacing: -0.5px;
  }

  .button-group {
    display: flex;
    gap: 12px;
  }

  .btn {
    padding: 10px 20px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
    font-size: 15px;
    transition: all 0.3s ease;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .btn-white {
    background: rgba(255, 255, 255, 0.9);
    color: #2563eb;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }

  .btn-white:hover {
    background: white;
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
  }

  .panel-content {
    padding: 30px;
  }

  .search-container {
    margin-bottom: 25px;
    position: relative;
  }

  .search-input {
    width: 100%;
    padding: 15px 25px 15px 50px;
    border: 2px solid #e2e8f0;
    border-radius: 12px;
    font-size: 16px;
    transition: all 0.3s ease;
    background: #f8fafc;
  }

  .search-input:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
    background: white;
  }

  .search-icon {
    position: absolute;
    left: 15px;
    top: 50%;
    transform: translateY(-50%);
    color: #64748b;
    font-size: 20px;
  }

  .table-container {
    overflow-x: auto;
    border-radius: 12px;
    box-shadow: 0 2px 15px rgba(0, 0, 0, 0.05);
  }

  .table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    text-align: left;
  }

  .table th {
    background: #f1f5f9;
    padding: 16px 20px;
    font-weight: 600;
    color: #334155;
    border-bottom: 2px solid #e2e8f0;
    text-transform: uppercase;
    font-size: 14px;
    letter-spacing: 0.5px;
  }

  .table td {
    padding: 16px 20px;
    border-bottom: 1px solid #e2e8f0;
    color: #334155;
    font-size: 15px;
  }

  .table tbody tr {
    transition: all 0.2s ease;
  }

  .table tbody tr:nth-child(even) {
    background: #f8fafc;
  }

  .table tbody tr:hover {
    background: #f1f5f9;
    transform: scale(1.001);
  }

  .badge {
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.3px;
    text-transform: uppercase;
  }

  .badge-deudora {
    background: #dcfce7;
    color: #166534;
  }

  .badge-acreedora {
    background: #dbeafe;
    color: #1e40af;
  }

  .error-message {
    margin-top: 20px;
    padding: 16px;
    background: #fef2f2;
    color: #dc2626;
    border-radius: 12px;
    border: 1px solid #fee2e2;
    font-weight: 500;
  }

  .chart-container {
    margin-top: 30px;
    padding: 20px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 15px rgba(0, 0, 0, 0.05);
  }

  @media (max-width: 768px) {
    .catalogo-container {
      padding: 15px;
    }

    .panel-header {
      flex-direction: column;
      gap: 20px;
      padding: 20px;
    }

    .button-group {
      width: 100%;
      justify-content: stretch;
    }

    .btn {
      flex: 1;
      justify-content: center;
    }

    .table td, .table th {
      padding: 12px 15px;
      font-size: 14px;
    }
  }
`;

const CatalogoContable = () => {
  const [cuentas, setCuentas] = useState([]);
  const [filteredCuentas, setFilteredCuentas] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
    
    fetchCuentas();
    
    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  useEffect(() => {
    setFilteredCuentas(
      cuentas.filter(cuenta => 
        cuenta.Nombre_cuenta?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cuenta.Cod_cuenta?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm, cuentas]);

  const fetchCuentas = async () => {
    try {
      const response = await axios.get('http://localhost:4000/api/catalogoCuentas', {
        headers: {
          'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
      });
      setCuentas(response.data);
      setFilteredCuentas(response.data);
    } catch (err) {
      setError('Error al cargar el catálogo de cuentas: ' + err.message);
    }
  };

  const generateChartData = () => {
    // Contar cuentas por nivel
    const niveles = {};
    cuentas.forEach(cuenta => {
      niveles[cuenta.Nivel] = (niveles[cuenta.Nivel] || 0) + 1;
    });

    return {
      labels: Object.keys(niveles),
      data: Object.values(niveles)
    };
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    
    // Colores corporativos
    const colorVerdePrimario = [46, 125, 50];  // #2E7D32
    const colorVerdeSecundario = [129, 199, 132]; // #81C784
    
    // Agregar logo (ajusta las coordenadas y dimensiones según tu logo)
    // doc.addImage('/ruta/logo-escuela.png', 'PNG', 15, 10, 40, 20);
    
    // Encabezado con diseño
    doc.setFillColor(...colorVerdePrimario);
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    // Título
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.text('Catálogo de Cuentas Contables', pageWidth/2, 25, { align: 'center' });
    
    // Información del generador
    const usuario = localStorage.getItem('nombreUsuario') || 'Usuario del Sistema';
    doc.setFontSize(11);
    doc.setTextColor(80);
    doc.text(`Generado por: ${usuario}`, 15, 50);
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, pageWidth - 15, 50, { align: 'right' });
    
    // Función para ofuscar datos sensibles
    const ofuscarDato = (texto) => {
      if (!texto) return '';
      return texto.length > 4 ? texto.substring(0, 2) + '*'.repeat(texto.length - 4) + texto.slice(-2) : texto;
    };
  
    // Tabla con estilo mejorado
    const tableColumn = [
      "Código", 
      "Nombre", 
      "Naturaleza", 
      "Nivel"
    ];
    
    const tableRows = filteredCuentas.map(cuenta => [
      cuenta.Cod_cuenta,
      cuenta.Nombre_cuenta,
      cuenta.Naturaleza_cuenta,
      cuenta.Nivel
    ]);
  
    // Configuración de la tabla
    doc.autoTable({
      startY: 60,
      head: [tableColumn],
      body: tableRows,
      theme: 'grid',
      styles: {
        fontSize: 9,
        cellPadding: 5,
      },
      headStyles: {
        fillColor: colorVerdePrimario,
        textColor: 255,
        fontSize: 10,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [240, 247, 240],
      },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 'auto' },
        2: { cellWidth: 40 },
        3: { cellWidth: 25 },
      },
    });
  
    // Añadir gráfico de distribución
    const chartData = generateChartData();
    const chartStartY = doc.lastAutoTable.finalY + 20;
  
    // Título de la sección de gráficos
    doc.setFillColor(...colorVerdeSecundario);
    doc.rect(15, chartStartY, pageWidth - 30, 10, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.text('Distribución de Cuentas por Nivel', pageWidth/2, chartStartY + 7, { align: 'center' });
  
    // Gráfico de barras
    const maxValue = Math.max(...chartData.data);
    const barWidth = 20;
    const barMaxHeight = 60;
    let x = 30;
  
    // Dibujar barras
    chartData.labels.forEach((label, index) => {
      const barHeight = (chartData.data[index] / maxValue) * barMaxHeight;
      
      // Barra
      doc.setFillColor(...colorVerdePrimario);
      doc.rect(x, chartStartY + 20 + (barMaxHeight - barHeight), barWidth, barHeight, 'F');
      
      // Etiqueta
      doc.setFontSize(8);
      doc.setTextColor(80);
      doc.text(`Nivel ${label}`, x + barWidth/2, chartStartY + barMaxHeight + 30, { align: 'center' });
      
      // Valor
      doc.text(chartData.data[index].toString(), x + barWidth/2, chartStartY + 15 + (barMaxHeight - barHeight), { align: 'center' });
      
      x += barWidth + 15;
    });
  
    // Pie de página
    const pageCount = doc.internal.getNumberOfPages();
    doc.setFontSize(8);
    doc.setTextColor(100);
    for(let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.text(
        `Página ${i} de ${pageCount} - Documento generado el ${new Date().toLocaleDateString()}`,
        pageWidth/2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
    }
  
    // Agregar marca de agua
    doc.setTextColor(230);
    doc.setFontSize(60);
    doc.text('CONFIDENCIAL', pageWidth/2, doc.internal.pageSize.height/2, {
      align: 'center',
      angle: 45
    });
  
    doc.save('catalogo-cuentas.pdf');
  };

  return (
    <div className="catalogo-container">
      <div className="panel">
        <div className="panel-header">
          <h1 className="panel-title">Catálogo de Cuentas Contables</h1>
          <div className="button-group">
            <button className="btn btn-white" onClick={exportToPDF}>
              <span>📄</span> Exportar PDF
            </button>
          </div>
        </div>
        
        <div className="panel-content">
          <div className="search-container">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="search-input"
              placeholder="Buscar por código o nombre de cuenta..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Nombre</th>
                  <th>Descripción</th>
                  <th>Naturaleza</th>
                  <th>Nivel</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {filteredCuentas.map((cuenta) => (
                  <tr key={cuenta.Cod_cuenta}>
                    <td style={{ paddingLeft: `${(cuenta.Nivel || 0) * 20}px` }}>
                      {cuenta.Cod_cuenta}
                    </td>
                    <td>{cuenta.Nombre_cuenta}</td>
                    <td>{cuenta.Descripcion}</td>
                    <td>
                      <span className={`badge ${
                        cuenta.Naturaleza_cuenta === 'DEUDORA' ? 'badge-deudora' : 'badge-acreedora'
                      }`}>
                        {cuenta.Naturaleza_cuenta}
                      </span>
                    </td>
                    <td>{cuenta.Nivel}</td>
                    <td>{new Date(cuenta.Fecha_creacion).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CatalogoContable;