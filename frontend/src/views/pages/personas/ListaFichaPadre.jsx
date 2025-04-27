import React, { useEffect, useState } from 'react';
import { CIcon } from '@coreui/icons-react';
import { cilSearch,cilBrushAlt, cilPen, cilTrash, cilPlus, cilSave, cilArrowLeft,cilUser ,cilDescription, cilSpreadsheet, cilFile } from '@coreui/icons';
import swal from 'sweetalert2'; // Importar SweetAlert para mostrar mensajes de advertencia y éxito
import * as XLSX from 'xlsx';        // Para generar archivos Excel
import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import ExcelJS from 'exceljs';
import logo from 'src/assets/brand/logo_saint_patrick.png';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

import {
  CButton,
  CCol,
  CContainer,
  CDropdown,//Para reportes
  CDropdownMenu,
  CDropdownToggle,
  CDropdownItem,//Para reportes
  CForm,
  CFormInput,
  CFormSelect,
  CInputGroup,
  CInputGroupText,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CPagination,
  CRow,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
} from '@coreui/react';
import usePermission from '../../../../context/usePermission';
import AccessDenied from "../AccessDenied/AccessDenied"

const ListaFichaPadre = () => {
      const {canSelect} = usePermission('ListaFichaEstudiante');
    const [fichaPadre, setFichaPadre] = useState({});


    const location = useLocation();
    const navigate = useNavigate();

    const { personaSeleccionada } = location.state || {};


    const volverAListaContacto = () => {
        navigate('/Contacto', {
            state: { personaSeleccionada }
        });
    };

    const volverAListaPersonas = () => {
      navigate('/ListaPersonas');
    };
  

{/*********************************************************************************************************************************************/}

const fetchFichaPadre = async () => {
  try {
      if (!personaSeleccionada || !personaSeleccionada.cod_persona) {
          console.warn('No hay persona seleccionada.');
          return;
      }

      const response = await fetch(`http://localhost:4000/api/personas/verFichaPadre/${personaSeleccionada.cod_persona}`);

      if (!response.ok) {
          throw new Error(`Error en la solicitud: ${response.status}`);
      }

      const data = await response.json();
      console.log('Ficha padre obtenida:', JSON.stringify(data, null, 2)); // ✅ Depuración global

      if (!data || Object.keys(data).length === 0) {
          console.warn('No se encontraron datos en la respuesta de la API.');
          setFichaPadre(null);
          return;
      }

      const fichaPadre = {
          cod_persona: data?.cod_persona || null,
          Nombre_Completo: data?.Nombre_Completo || 'NO DISPONIBLE',
          DNI: data?.DNI || 'NO DISPONIBLE',
          Fecha_Nacimiento: data?.Fecha_Nacimiento 
              ? new Date(data.Fecha_Nacimiento).toISOString().split('T')[0] 
              : 'NO DISPONIBLE',
          Genero: data?.Genero || 'NO DISPONIBLE',
          Nacionalidad: data?.Nacionalidad || 'NO DISPONIBLE',
          Direccion: data?.Direccion || 'NO DISPONIBLE',
          Departamento: data?.Departamento || 'NO DISPONIBLE',
          Municipio: data?.Municipio || 'NO DISPONIBLE',

          // ✅ Usamos los valores directamente sin `.split()`
          Telefonos_Moviles: Array.isArray(data?.Telefonos_Moviles) ? data.Telefonos_Moviles : [],
          Telefonos_Fijos: Array.isArray(data?.Telefonos_Fijos) ? data.Telefonos_Fijos : [],
          Correos: Array.isArray(data?.Correos) ? data.Correos : [],

          // ✅ Asegurar que los hijos sean correctamente procesados
          hijos: Array.isArray(data?.hijos) ? data.hijos : []
      };

      console.log('✅ Ficha del padre estructurada correctamente:', JSON.stringify(fichaPadre, null, 2));

      setFichaPadre(fichaPadre);
  } catch (error) {
      console.error('❌ Error al obtener la ficha del padre:', error);
      setFichaPadre(null);
  }
};

useEffect(() => {
  console.log("🔄 Ejecutando fetchFichaPadre con personaSeleccionada:", personaSeleccionada);
  fetchFichaPadre();
}, [personaSeleccionada]);



{/*********************************************************************************************************************************************/}

const ReporteFichaPadrePDF = () => {
  const doc = new jsPDF('p', 'mm', 'letter');

  if (!fichaPadre || Object.keys(fichaPadre).length === 0) {
    alert('No hay datos para exportar.');
    return;
  }

  const img = new Image();
  img.src = logo;

  img.onload = () => {
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    // ✅ Encabezado
    doc.addImage(img, 'PNG', 10, 10, 45, 45);
    doc.setFontSize(18);
    doc.setTextColor(0, 102, 51);
    doc.text("SAINT PATRICK'S ACADEMY", pageWidth / 2, 24, { align: 'center' });

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('Casa Club del periodista, Colonia del Periodista', pageWidth / 2, 32, { align: 'center' });
    doc.text('Teléfono: (504) 2234-8871', pageWidth / 2, 37, { align: 'center' });
    doc.text('Correo: info@saintpatrickacademy.edu', pageWidth / 2, 42, { align: 'center' });

    doc.setFontSize(14);
    doc.setTextColor(0, 102, 51);
    doc.text('Ficha del Padre', pageWidth / 2, 50, { align: 'center' });

    doc.setLineWidth(0.5);
    doc.setDrawColor(0, 102, 51);
    doc.line(10, 60, pageWidth - 10, 60);

    // ✅ Datos del padre
    const padreRows = [
      { label: "Nombre Completo", value: fichaPadre.Nombre_Completo?.toUpperCase() ?? "NO DISPONIBLE" },
      { label: "DNI", value: fichaPadre.DNI?.toUpperCase() ?? "NO DISPONIBLE" },
      { label: "Fecha de Nacimiento", value: fichaPadre.Fecha_Nacimiento ? new Date(fichaPadre.Fecha_Nacimiento).toLocaleDateString('es-ES').toUpperCase() : "NO DISPONIBLE" },
      { label: "Género", value: fichaPadre.Genero?.toUpperCase() ?? "NO DISPONIBLE" },
      { label: "Nacionalidad", value: fichaPadre.Nacionalidad?.toUpperCase() ?? "NO DISPONIBLE" },
      { label: "Dirección", value: fichaPadre.Direccion?.toUpperCase() ?? "NO DISPONIBLE" },
      { label: "Teléfonos Móviles", value: fichaPadre.Telefonos_Moviles?.length > 0 ? fichaPadre.Telefonos_Moviles.join(', ') : "NO DISPONIBLE" },
      { label: "Teléfonos Fijos", value: fichaPadre.Telefonos_Fijos?.length > 0 ? fichaPadre.Telefonos_Fijos.join(', ') : "NO DISPONIBLE" },
      { label: "Correos Electrónicos", value: fichaPadre.Correos?.length > 0 ? fichaPadre.Correos.join(', ') : "NO DISPONIBLE" }
    ];

    let yPosition = 65;

    const addSectionTitle = (title, y) => {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 102, 51);
      doc.text(title, 15, y);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
    };

    // ✅ Tabla de datos del padre
    addSectionTitle('DATOS DEL PADRE', yPosition);
    yPosition += 5;
    doc.autoTable({
      startY: yPosition,
      margin: { left: 15 },
      columns: [{ header: "Información", dataKey: "label" }, { header: "Valor", dataKey: "value" }],
      body: padreRows,
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [0, 102, 51], textColor: [255, 255, 255], fontSize: 9, halign: 'center' }
    });

    fichaPadre.hijos.forEach((hijo, index) => {
      yPosition = doc.lastAutoTable.finalY + 10;
      addSectionTitle(`HIJO #${index + 1}`, yPosition);
      yPosition += 5;

      const hijoRows = [
        { label: "Nombre Completo", value: hijo.Nombre_Hijo?.toUpperCase() ?? "NO DISPONIBLE" },
        { label: "DNI", value: hijo.DNI_Hijo?.toUpperCase() ?? "NO DISPONIBLE" },
        { label: "Fecha de Nacimiento", value: hijo.Fecha_Nacimiento_Hijo ? new Date(hijo.Fecha_Nacimiento_Hijo).toLocaleDateString('es-ES').toUpperCase() : "NO DISPONIBLE" }
      ];

      doc.autoTable({
        startY: yPosition,
        margin: { left: 15 },
        columns: [{ header: "Información", dataKey: "label" }, { header: "Valor", dataKey: "value" }],
        body: hijoRows,
        styles: { fontSize: 10, cellPadding: 3 },
        headStyles: { fillColor: [0, 102, 51], textColor: [255, 255, 255], fontSize: 9, halign: 'center' }
      });
    });

    // ✅ Pie de página
    const footerY = pageHeight - 10;
    doc.setFontSize(10);
    doc.setTextColor(0, 102, 51);
    doc.text(`Fecha de generación: ${new Date().toLocaleDateString()} Hora: ${new Date().toLocaleTimeString()}`, 10, footerY);
    doc.text(`Página 1 de 1`, pageWidth - 10, footerY, { align: 'right' });
  
    // **Exportación y vista previa**
    const pdfBlob = doc.output('blob');
    const pdfURL = URL.createObjectURL(pdfBlob);
    const newWindow = window.open('', '_blank');
    newWindow.document.write(`
      <html>
        <head>
          <title>Ficha del Padre</title>
          <style>
            body {
              margin: 0;
              padding: 0;
              overflow: hidden;
              display: flex;
              align-items: center;
              justify-content: center;
              width: 100vw;
              height: 100vh;
            }
            iframe {
              width: 100vw;
              height: 100vh;
              border: none;
            }
            .icon-container {
              position: fixed;
              top: 15px;
              right: 15px;
              display: flex;
              gap: 15px;
              padding: 10px;
              border-radius: 8px;
            }
            .icon-button {
              background: none;
              border: none;
              cursor: pointer;
              font-size: 22px;
              color: white;
              position: relative;
              z-index: 9999;
            }
            .icon-button:focus,
            .icon-button:active {
              outline: none;
              box-shadow: none;
            }
          </style>
          <script src="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/js/all.min.js"></script>
        </head>
        <body>
          <iframe id="pdfViewer" src="${pdfURL}"></iframe>
          <div class="icon-container">
            <button class="icon-button" onclick="const a = document.createElement('a'); a.href='${pdfURL}'; a.download='Ficha_Padre.pdf'; a.click();">
              <i class="fas fa-download"></i>
            </button>
            <button class="icon-button" onclick="const printWindow = window.open('${pdfURL}', '_blank'); printWindow.onload = () => printWindow.print();">
              <i class="fas fa-print"></i>
            </button>
          </div>
        </body>
      </html>
    `);
  };

  img.onerror = () => {
    alert('No se pudo cargar el logo.');
  };
};



{/*********************************************************************************************************************************************/}

const exportFichaPadreToExcel = () => {
  if (!fichaPadre || Object.keys(fichaPadre).length === 0) {
    alert('No hay datos para exportar.');
    return;
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Ficha Padre');

  // ✅ Encabezado
  worksheet.mergeCells('A1:B1');
  worksheet.getCell('A1').value = "SAINT PATRICK'S ACADEMY";
  worksheet.getCell('A1').font = { bold: true, size: 18, color: { argb: '006633' } };
  worksheet.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };

  worksheet.mergeCells('A2:B2');
  worksheet.getCell('A2').value = 'FICHA DEL PADRE';
  worksheet.getCell('A2').font = { bold: true, size: 16, color: { argb: '006633' } };
  worksheet.getCell('A2').alignment = { horizontal: 'center', vertical: 'middle' };

  // ✅ Sección Datos del Padre
  worksheet.addRow([]);
  worksheet.mergeCells('A3:B3');
  worksheet.getCell('A3').value = 'DATOS DEL PADRE';
  worksheet.getCell('A3').font = { bold: true, size: 14, color: { argb: 'FFFFFF' } };
  worksheet.getCell('A3').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '006633' } };
  worksheet.getCell('A3').alignment = { horizontal: 'center', vertical: 'middle' };

  const datosPadre = [
    ['Nombre Completo', fichaPadre.Nombre_Completo],
    ['DNI', fichaPadre.DNI],
    ['Fecha de Nacimiento', new Date(fichaPadre.Fecha_Nacimiento).toLocaleDateString()],
    ['Género', fichaPadre.Genero],
    ['Nacionalidad', fichaPadre.Nacionalidad],
    ['Dirección', fichaPadre.Direccion],
    ['Departamento', fichaPadre.Departamento],
    ['Municipio', fichaPadre.Municipio],
    ['Teléfonos Móviles', fichaPadre.Telefonos_Moviles?.join(', ') ?? 'No disponible'],
    ['Teléfonos Fijos', fichaPadre.Telefonos_Fijos?.join(', ') ?? 'No disponible'],
    ['Correos Electrónicos', fichaPadre.Correos?.join(', ') ?? 'No disponible']
  ];

  datosPadre.forEach(row => {
    const newRow = worksheet.addRow(row);
    newRow.getCell(2).alignment = { wrapText: true };
  });

  // ✅ Sección independiente para cada hijo
  fichaPadre.hijos.forEach((hijo, index) => {
    worksheet.addRow([]);
    worksheet.mergeCells(`A${worksheet.lastRow.number + 1}:B${worksheet.lastRow.number + 1}`);
    worksheet.getCell(`A${worksheet.lastRow.number}`).value = `HIJO #${index + 1}`;
    worksheet.getCell(`A${worksheet.lastRow.number}`).font = { bold: true, size: 14, color: { argb: 'FFFFFF' } };
    worksheet.getCell(`A${worksheet.lastRow.number}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '006633' } };
    worksheet.getCell(`A${worksheet.lastRow.number}`).alignment = { horizontal: 'center', vertical: 'middle' };

    const hijoRows = [
      ['Nombre Completo', hijo.Nombre_Hijo],
      ['DNI', hijo.DNI_Hijo],
      ['Fecha de Nacimiento', new Date(hijo.Fecha_Nacimiento_Hijo).toLocaleDateString()]
    ];

    hijoRows.forEach(row => worksheet.addRow(row));
  });

  // ✅ Ajustar el ancho de las columnas
  worksheet.getColumn(1).width = 40;
  worksheet.getColumn(2).width = 50;

  // ✅ Exportar el archivo Excel
  workbook.xlsx.writeBuffer().then((buffer) => {
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `Ficha_Padre_${fichaPadre.Nombre_Completo}.xlsx`);
  });
};



{/*********************************************************************************************************************************************/}



{/*********************************************************************************************************************************************/}


{/*********************************************************************************************************************************************/}



{/*********************************************************************************************************************************************/}



{/*********************************************************************************************************************************************/}



{/*********************************************************************************************************************************************/}

    // Verificar permisos
    if (!canSelect) {
      return <AccessDenied />;
    }
    

{/*********************************************************************************************************************************************/}
  return (

    <CContainer>

<div className="profile-container ficha-padre-container">
  {/* Encabezado de la Ficha */}
  <div className="profile-header">
    <div className="profile-info d-flex justify-content-center align-items-center flex-column">
      {/* Título centrado */}
      <div style={{ display: 'inline-block', position: 'relative' }}>
        <h1 className="profile-name" style={{ fontSize: '26px' }}>Ficha del Padre</h1>
        {/* Línea verde debajo del título */}
        <div style={{ height: '2px', backgroundColor: '#6C8E58', position: 'absolute', bottom: '-5px', left: '0', width: '100%' }}></div>
      </div>
    </div>
    {/* Botones organizados */}
    <div className="botones-container d-flex gap-3 mt-3 justify-content-between">
      {/* Botón Personas - alineado a la izquierda */}
      <CCol xs="12" md="3" className="d-flex justify-content-start mb-3 mb-md-0">
        <CButton
          color="secondary"
          onClick={volverAListaPersonas}
          style={{ minWidth: '120px', height: '38px' }}
        >
          <CIcon icon={cilArrowLeft} /> Personas
        </CButton>
      </CCol>

      {/* Contenedor de Contacto y Reportes - alineados juntos a la derecha */}
      <div className="d-flex gap-2">
        {/* Botón Contacto */}
        <CButton 
          className="btn-volver" 
          onClick={volverAListaContacto} 
          style={{ backgroundColor: '#6c757d', color: 'white', minWidth: '160px', height: '38px' }}
        >
          <CIcon icon={cilArrowLeft} /> Contacto
        </CButton>

        {/* Botón Reportes */}
        <CDropdown className="btn-sm d-flex align-items-center gap-1 rounded shadow">
          <CDropdownToggle
            style={{
              backgroundColor: '#6C8E58',
              color: 'white',
              fontSize: '0.85rem',
              cursor: 'pointer',
              minWidth: '120px',
              height: '38px',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#5A784C';
              e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#6C8E58';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <CIcon icon={cilDescription} /> Reportes
          </CDropdownToggle>
          <CDropdownMenu
            style={{
              position: 'absolute',
              zIndex: 1050,
              backgroundColor: '#fff',
              boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.2)',
              borderRadius: '4px',
              overflow: 'hidden',
            }}
          >
            {/* Reporte Excel */}
            <CDropdownItem
              onClick={exportFichaPadreToExcel}
              style={{
                cursor: 'pointer',
                outline: 'none',
                backgroundColor: 'transparent',
                padding: '0.5rem 1rem',
                fontSize: '0.85rem',
                color: '#333',
                borderBottom: '1px solid #eaeaea',
                transition: 'background-color 0.3s',
              }}
              onMouseOver={(e) => (e.target.style.backgroundColor = '#f5f5f5')}
              onMouseOut={(e) => (e.target.style.backgroundColor = 'transparent')}
            >
              <CIcon icon={cilSpreadsheet} size="sm" /> Descargar en Excel
            </CDropdownItem>

            {/* Reporte PDF */}
            <CDropdownItem
              onClick={ReporteFichaPadrePDF}
              style={{
                cursor: 'pointer',
                outline: 'none',
                backgroundColor: 'transparent',
                padding: '0.5rem 1rem',
                fontSize: '0.85rem',
                color: '#333',
                transition: 'background-color 0.3s',
              }}
              onMouseOver={(e) => (e.target.style.backgroundColor = '#f5f5f5')}
              onMouseOut={(e) => (e.target.style.backgroundColor = 'transparent')}
            >
              <CIcon icon={cilFile} size="sm" /> Descargar en PDF
            </CDropdownItem>
          </CDropdownMenu>
        </CDropdown>
      </div>
    </div>
  </div>

  <div className="info-card">
    {/* Datos del Padre */}
    {[ 
      ['Datos del Padre o Madre', [
        ['Nombre Completo', fichaPadre?.Nombre_Completo],
        ['Documentación', fichaPadre?.DNI],
        ['Fecha de Nacimiento', fichaPadre?.Fecha_Nacimiento ? new Date(fichaPadre.Fecha_Nacimiento).toLocaleDateString('es-ES') : 'NO DISPONIBLE'],
        ['Género', fichaPadre?.Genero],
        ['Nacionalidad', fichaPadre?.Nacionalidad]
      ]],
      ['Dirección', [
        ['Dirección', fichaPadre?.Direccion],
        ['Departamento', fichaPadre?.Departamento],
        ['Municipio', fichaPadre?.Municipio]
      ]],
      ['Contactos del Padre o Madre', [
        ['Teléfonos Móviles', fichaPadre?.Telefonos_Moviles?.length > 0 ? fichaPadre.Telefonos_Moviles.join(', ') : 'NO DISPONIBLE'],
        ['Teléfonos Fijos', fichaPadre?.Telefonos_Fijos?.length > 0 ? fichaPadre.Telefonos_Fijos.join(', ') : 'NO DISPONIBLE'],
        ['Correos Electrónicos', fichaPadre?.Correos?.length > 0 ? fichaPadre.Correos.join(', ') : 'NO DISPONIBLE']
      ]]
    ].map(([titulo, datos], idx) => (
      <div key={idx} style={{ marginBottom: '1.5rem' }}>
        <h2 className="info-title">{titulo}</h2>
        <div className="info-grid">
          {datos.map(([campo, valor], index) => (
            <div key={index} className="info-item">
              <div className="info-details">
                <label>{campo}</label>
                <p>{valor ? valor.toString().toUpperCase() : 'NO DISPONIBLE'}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    ))}

    {/* Lista de Hijos */}
    <h2 className="info-title" style={{ marginBottom: '1.5rem' }}>Hijos(as)</h2>
    {Array.isArray(fichaPadre?.hijos) && fichaPadre.hijos.length > 0 ? (
      <div className="hijos-grid">
        {fichaPadre.hijos.map((hijo, index) => (
          <div key={index} className="hijo-row">
            {[ 
              ['Nombre', hijo.Nombre_Hijo],
              ['DNI', hijo.DNI_Hijo],
              ['Fecha de Nacimiento', hijo.Fecha_Nacimiento_Hijo ? new Date(hijo.Fecha_Nacimiento_Hijo).toLocaleDateString('es-ES') : 'NO DISPONIBLE']
            ].map(([label, value], idx) => (
              <div key={idx} className="info-item">
                <div className="info-details">
                  <label>{label}</label>
                  <p>{value ? value.toString().toUpperCase() : 'NO DISPONIBLE'}</p>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    ) : (
      <p className="info-message">No se registran hijos.</p>
    )}
  </div>
</div>

<style>{`
.profile-container.ficha-padre-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem;
}

.profile-header {
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
  text-align: center;
}

.profile-name {
  font-size: 1.875rem;
  font-weight: 700;
  color: #0f172a;
}

.botones-container {
  display: flex;
  justify-content: space-between;
}

.info-card {
  background: white;
  border-radius: 1rem;
  padding: 1rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.info-title {
  margin-bottom: 1.5rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.info-item {
  padding: 1rem;
  background: white;
  border-radius: 1rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.info-details label {
  display: block;
  font-size: 0.875rem;
  color: #475569;
  margin-bottom: 0.25rem;
}

.info-details p {
  color: #0f172a;
  font-weight: 500;
}

.hijos-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}

.hijo-row {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.hijo-item {
  flex: 1 1 30%;
  padding: 1rem;
  background: #e0f2fe;
  border-radius: 1rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Ajustes responsivos */
@media (max-width: 768px) {
  .hijos-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .hijos-grid {
    grid-template-columns: 1fr;
  }
}
`}</style>

   
    </CContainer>

  );

};

export default ListaFichaPadre;