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
        console.log('Ficha padre obtenida:', data); // Depuración

        // **Verificar si la respuesta de la API es un array y extraer el primer objeto**
        const ficha = Array.isArray(data) && data.length > 0 ? data[0] : data;

        if (ficha?.cod_persona === personaSeleccionada.cod_persona) {
            setFichaPadre(ficha);
        } else {
            console.warn('Los datos obtenidos no coinciden con la persona seleccionada.');
            setFichaPadre(null);
        }
    } catch (error) {
        console.error('Error al obtener la ficha del padre:', error);
        setFichaPadre(null);
    }
};

// Llamar la función al cargar el componente
useEffect(() => {
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

    // **Encabezado**
    doc.addImage(img, 'PNG', 10, 10, 45, 45);
    doc.setFontSize(18);
    doc.setTextColor(0, 102, 51); // Color verde
    doc.text("SAINT PATRICK'S ACADEMY", pageWidth / 2, 24, { align: 'center' });

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('Casa Club del periodista, Colonia del Periodista', pageWidth / 2, 32, { align: 'center' });
    doc.text('Teléfono: (504) 2234-8871', pageWidth / 2, 37, { align: 'center' });
    doc.text('Correo: info@saintpatrickacademy.edu', pageWidth / 2, 42, { align: 'center' });

    // **Título del reporte**
    doc.setFontSize(14);
    doc.setTextColor(0, 102, 51); // Color verde
    doc.text('Ficha del Padre', pageWidth / 2, 50, { align: 'center' });

    doc.setLineWidth(0.5);
    doc.setDrawColor(0, 102, 51); // Línea verde
    doc.line(10, 60, pageWidth - 10, 60);

    // **Filas de la tabla**
    const tableRows = [
      { label: "Nombre Completo", value: fichaPadre.Nombre_Completo?.toUpperCase() ?? "NO DISPONIBLE" },
      { label: "Tipo de Documento", value: fichaPadre.Tipo_Documento?.toUpperCase() ?? "NO DISPONIBLE" },
      { label: "DNI", value: fichaPadre.DNI?.toUpperCase() ?? "NO DISPONIBLE" },
      { label: "Fecha de Nacimiento", value: new Date(fichaPadre.Fecha_Nacimiento).toLocaleDateString('es-ES').toUpperCase() },
      { label: "Género", value: fichaPadre.Genero?.toUpperCase() ?? "NO DISPONIBLE" },
      { label: "Teléfono Móvil", value: fichaPadre.Telefono_Movil?.toUpperCase() ?? "NO DISPONIBLE" },
      { label: "Teléfono Fijo", value: fichaPadre.Telefono_Fijo?.toUpperCase() ?? "NO DISPONIBLE" },  // Nuevo campo
      { label: "Correo Electrónico", value: fichaPadre.Correo?.toUpperCase() ?? "NO DISPONIBLE" },
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

    addSectionTitle('DATOS DEL PADRE', yPosition);
    yPosition += 5;
    doc.autoTable({
      startY: yPosition,
      margin: { left: 15 },
      columns: [{ header: "Información", dataKey: "label" }, { header: "Valor", dataKey: "value" }],
      body: tableRows,
      styles: { fontSize: 10 },
      columnStyles: { label: { fontStyle: "bold", cellWidth: 60 }, value: { halign: 'left', cellWidth: 80 } },
      headStyles: {
        fillColor: [0, 102, 51],
        textColor: [255, 255, 255],
        fontSize: 9,
        halign: 'center',
      },
    });

    yPosition = doc.lastAutoTable.finalY + 10;
    addSectionTitle('HIJOS', yPosition);
    yPosition += 5;
    
    if (fichaPadre.hijos && fichaPadre.hijos.length > 0) {
      const hijosRows = fichaPadre.hijos.map(hijo => ({
        Nombre: hijo.Nombre_Hijo?.toUpperCase() ?? "NO DISPONIBLE",
        DNI: hijo.DNI_Hijo?.toUpperCase() ?? "NO DISPONIBLE",
        Fecha_Nacimiento: new Date(hijo.Fecha_Nacimiento_Hijo).toLocaleDateString('es-ES').toUpperCase() ?? "NO DISPONIBLE", // Cambié Edad por Fecha de Nacimiento
      }));

      doc.autoTable({
        startY: yPosition,
        margin: { left: 15 },
        columns: [
          { header: "Nombre", dataKey: "Nombre" },
          { header: "DNI", dataKey: "DNI" },
          { header: "Fecha de Nacimiento", dataKey: "Fecha_Nacimiento" },  // Cambié Edad por Fecha de Nacimiento
        ],
        body: hijosRows,
        styles: { fontSize: 10 },
        headStyles: {
          fillColor: [0, 102, 51],
          textColor: [255, 255, 255],
          fontSize: 9,
          halign: 'center',
        },
      });
    } else {
      doc.text("No tiene hijos registrados.", 15, yPosition);
    }

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

  // **Título del documento**
  worksheet.mergeCells('A1:B1');
  worksheet.getCell('A1').value = "SAINT PATRICK'S ACADEMY";
  worksheet.getCell('A1').font = { bold: true, size: 18, color: { argb: '006633' } };
  worksheet.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };

  worksheet.mergeCells('A2:B2');
  worksheet.getCell('A2').value = 'FICHA DEL PADRE';
  worksheet.getCell('A2').font = { bold: true, size: 16, color: { argb: '006633' } };
  worksheet.getCell('A2').alignment = { horizontal: 'center', vertical: 'middle' };

  // **Sección 1: Datos del Padre**
  worksheet.mergeCells('A4:B4');
  worksheet.getCell('A4').value = 'Datos del Padre';
  worksheet.getCell('A4').font = { bold: true, size: 14, color: { argb: 'FFFFFF' } };
  worksheet.getCell('A4').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '006633' } };
  worksheet.getCell('A4').alignment = { horizontal: 'center', vertical: 'middle' };

  // **Datos del Padre**
  const datosPadre = [
      ['Nombre Completo', fichaPadre.Nombre_Completo],
      ['Tipo de Documento', fichaPadre.Tipo_Documento ?? 'No disponible'],
      ['DNI', fichaPadre.DNI],
      ['Fecha de Nacimiento', new Date(fichaPadre.Fecha_Nacimiento).toLocaleDateString()],
      ['Género', fichaPadre.Genero ?? 'No especificado'],
      ['Nacionalidad', fichaPadre.Nacionalidad ?? 'No disponible'],
      ['Estado', fichaPadre.Estado ? 'Activo' : 'Inactivo'],
  ];

  datosPadre.forEach((fila) => {
      const row = worksheet.addRow(fila);
      row.eachCell((cell) => {
          cell.alignment = { horizontal: 'left', vertical: 'middle' };
          cell.border = {
              top: { style: 'thin', color: { argb: '000000' } },
              left: { style: 'thin', color: { argb: '000000' } },
              bottom: { style: 'thin', color: { argb: '000000' } },
              right: { style: 'thin', color: { argb: '000000' } },
          };
      });
  });

  // **Sección 2: Dirección y Ubicación**
  worksheet.addRow([]);
  worksheet.mergeCells('A' + worksheet.lastRow.number + ':B' + worksheet.lastRow.number);
  worksheet.getCell('A' + worksheet.lastRow.number).value = 'Dirección y Ubicación';
  worksheet.getCell('A' + worksheet.lastRow.number).font = { bold: true, size: 14, color: { argb: 'FFFFFF' } };
  worksheet.getCell('A' + worksheet.lastRow.number).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '006633' } };
  worksheet.getCell('A' + worksheet.lastRow.number).alignment = { horizontal: 'center', vertical: 'middle' };

  // **Datos de Dirección y Ubicación**
  const direccionYUbicacion = [
      ['Dirección', fichaPadre.Direccion ?? 'No disponible'],
      ['Departamento', fichaPadre.Departamento ?? 'No disponible'],
      ['Municipio', fichaPadre.Municipio ?? 'No disponible'],
  ];

  direccionYUbicacion.forEach((fila) => {
      const row = worksheet.addRow(fila);
      row.eachCell((cell) => {
          cell.alignment = { horizontal: 'left', vertical: 'middle' };
          cell.border = {
              top: { style: 'thin', color: { argb: '000000' } },
              left: { style: 'thin', color: { argb: '000000' } },
              bottom: { style: 'thin', color: { argb: '000000' } },
              right: { style: 'thin', color: { argb: '000000' } },
          };
      });
  });

  // **Sección 3: Contactos del Padre**
  worksheet.addRow([]);
  worksheet.mergeCells('A' + worksheet.lastRow.number + ':B' + worksheet.lastRow.number);
  worksheet.getCell('A' + worksheet.lastRow.number).value = 'Contactos del Padre';
  worksheet.getCell('A' + worksheet.lastRow.number).font = { bold: true, size: 14, color: { argb: 'FFFFFF' } };
  worksheet.getCell('A' + worksheet.lastRow.number).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '006633' } };
  worksheet.getCell('A' + worksheet.lastRow.number).alignment = { horizontal: 'center', vertical: 'middle' };

  // **Datos de Contactos del Padre**
  const contactosPadre = [
      ['Teléfono Móvil', fichaPadre.Telefono_Movil ?? 'No disponible'],
      ['Teléfono Fijo', fichaPadre.Telefono_Fijo ?? 'No disponible'],
      ['Correo', fichaPadre.Correo ?? 'No disponible'],
  ];

  contactosPadre.forEach((fila) => {
      const row = worksheet.addRow(fila);
      row.eachCell((cell) => {
          cell.alignment = { horizontal: 'left', vertical: 'middle' };
          cell.border = {
              top: { style: 'thin', color: { argb: '000000' } },
              left: { style: 'thin', color: { argb: '000000' } },
              bottom: { style: 'thin', color: { argb: '000000' } },
              right: { style: 'thin', color: { argb: '000000' } },
          };
      });
  });

  // **Sección 4: Hijos**
  worksheet.addRow([]);  // Espacio en blanco para separar "Hijos" de "Correo"
  worksheet.mergeCells('A' + worksheet.lastRow.number + ':C' + worksheet.lastRow.number);
  worksheet.getCell('A' + worksheet.lastRow.number).value = 'Hijos';
  worksheet.getCell('A' + worksheet.lastRow.number).font = { bold: true, size: 14, color: { argb: 'FFFFFF' } };
  worksheet.getCell('A' + worksheet.lastRow.number).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '006633' } };
  worksheet.getCell('A' + worksheet.lastRow.number).alignment = { horizontal: 'center', vertical: 'middle' };

  // **Tabla de Hijos con bordes**
  if (Array.isArray(fichaPadre.hijos) && fichaPadre.hijos.length > 0) {
      // Encabezado de Hijos
      worksheet.addRow(['Nombre', 'DNI', 'Fecha de Nacimiento']);
      worksheet.getRow(worksheet.lastRow.number).eachCell((cell) => {
          cell.font = { bold: true, color: { argb: 'FFFFFF' } };
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '006633' } };
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
          cell.border = {
              top: { style: 'thin', color: { argb: '000000' } },
              left: { style: 'thin', color: { argb: '000000' } },
              bottom: { style: 'thin', color: { argb: '000000' } },
              right: { style: 'thin', color: { argb: '000000' } },
          };
      });

      // Datos de los hijos
      fichaPadre.hijos.forEach((hijo) => {
          worksheet.addRow([
              hijo.Nombre_Hijo,
              hijo.DNI_Hijo,
              new Date(hijo.Fecha_Nacimiento_Hijo).toLocaleDateString()
          ]);
          worksheet.getRow(worksheet.lastRow.number).eachCell((cell) => {
              cell.alignment = { horizontal: 'left', vertical: 'middle' };
              cell.border = {
                  top: { style: 'thin', color: { argb: '000000' } },
                  left: { style: 'thin', color: { argb: '000000' } },
                  bottom: { style: 'thin', color: { argb: '000000' } },
                  right: { style: 'thin', color: { argb: '000000' } },
              };
          });
      });
  } else {
      worksheet.addRow(['No tiene hijos registrados', '', '']);
  }

  // **Ajuste del ancho de las columnas para mejor visualización**
  worksheet.getColumn(1).width = 40;  // Nombre
  worksheet.getColumn(2).width = 25;  // DNI
  worksheet.getColumn(3).width = 30;  // Fecha de Nacimiento

  // **Ajuste del ancho de las columnas de la tabla de datos del padre**
  worksheet.getColumn(1).width = 40;  // Columna de datos (nombre, tipo documento, etc.)
  worksheet.getColumn(2).width = 40;  // Columna de datos (valor)

  // **Descargar el archivo Excel**
  workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], { type: 'application/octet-stream' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'ficha_padre.xlsx';
      link.click();
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
          <CButton 
            className="btn-volver" 
            onClick={volverAListaContacto} 
            style={{ backgroundColor: '#6c757d', color: 'white', minWidth: '160px', height: '38px' }}
          >
            <CIcon icon={cilArrowLeft} /> Contacto
          </CButton>

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

      <div className="info-card">
  {[['Datos del Padre', [
    ['Nombre Completo', fichaPadre?.Nombre_Completo],
    ['Tipo Documento', fichaPadre?.Tipo_Documento],
    ['Documentación', fichaPadre?.DNI],
    ['Fecha de Nacimiento', fichaPadre?.Fecha_Nacimiento ? new Date(fichaPadre?.Fecha_Nacimiento).toLocaleDateString('es-ES') : 'NO DISPONIBLE'],
    ['Género', fichaPadre?.Genero],
    ['Nacionalidad', fichaPadre?.Nacionalidad]
  ]], ['Dirección y Ubicación', [
    ['Dirección', fichaPadre?.Direccion],
    ['Departamento', fichaPadre?.Departamento],
    ['Municipio', fichaPadre?.Municipio]
  ]], ['Contactos del Padre', [
    ['Teléfono Móvil', fichaPadre?.Telefono_Movil],
    ['Teléfono Fijo', fichaPadre?.Telefono_Fijo],
    ['Correo Electrónico', fichaPadre?.Correo]
  ]]].map(([titulo, datos], idx) => (
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
  <h2 className="info-title" style={{ marginBottom: '1.5rem' }}>Hijos</h2>
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

/* Separación entre secciones */
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

/* Ajuste para mostrar los hijos en filas de tres */
.hijos-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* Tres hijos por fila */
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
    grid-template-columns: repeat(2, 1fr); /* Dos columnas en pantallas medianas */
  }
}

@media (max-width: 480px) {
  .hijos-grid {
    grid-template-columns: 1fr; /* Una sola columna en móviles */
  }
}

      `}</style>
    </div>
    </CContainer>

  );

};

export default ListaFichaPadre;