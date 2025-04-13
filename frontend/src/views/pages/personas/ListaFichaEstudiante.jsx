import React, { useEffect, useState } from 'react';
import { CIcon } from '@coreui/icons-react';
import { cilSearch,cilBrushAlt, cilPen, cilTrash, cilPlus, cilSave, cilArrowLeft,cilUser,cilDescription, cilSpreadsheet, cilFile  } from '@coreui/icons';
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



const ListaFichaEstudiante = () => {
    const {canSelect} = usePermission('ListaFichaEstudiante');
  

    const [fichaEstudiante, setFichaEstudiante] = useState({});

    const location = useLocation();
    const navigate = useNavigate();

    const { personaSeleccionada } = location.state || {};


      const volverAListaProcedenciaEstudiante = () => {
        navigate('/ListaProcedenciaEstudiante', {
          state: { personaSeleccionada }
        });
      };
    

  {/*************************************************************************************************************************************/}


  const fetchFichaEstudiante = async () => {
    try {
      if (!personaSeleccionada || !personaSeleccionada.cod_persona) {
        console.warn('No hay persona seleccionada.');
        return;
      }
  
      const response = await fetch(`http://localhost:4000/api/personas/verFichaEstudiante/${personaSeleccionada.cod_persona}`);
  
      if (!response.ok) {
        throw new Error(`Error en la solicitud: ${response.status}`);
      }
  
      const data = await response.json();
      console.log('Ficha estudiante obtenida:', data); // Depuración
  
      // **Verificar si la respuesta de la API es un array y extraer el primer objeto**
      const ficha = Array.isArray(data) && data.length > 0 ? data[0] : data;
  
      if (ficha?.cod_persona === personaSeleccionada.cod_persona) {
        setFichaEstudiante(ficha);
      } else {
        console.warn('Los datos obtenidos no coinciden con la persona seleccionada.');
        setFichaEstudiante(null);
      }
    } catch (error) {
      console.error('Error al obtener la ficha del estudiante:', error);
      setFichaEstudiante(null);
    }
  };
  
  // Llamar la función al cargar el componente
  useEffect(() => {
    fetchFichaEstudiante();
  }, [personaSeleccionada]);

  
  {/************************************************************************************************************************************/}
  
  {/************************************************************************************************************************************/}

  const ReporteFichaEstudiantePDF = () => {
    const doc = new jsPDF('p', 'mm', 'letter');
  
    if (!fichaEstudiante || Object.keys(fichaEstudiante).length === 0) {
      alert('No hay datos para exportar.');
      return;
    }
  
    const img = new Image();
    img.src = logo;
  
    img.onload = () => {
      const pageWidth = doc.internal.pageSize.width;
  
      // Encabezado
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
      doc.text('Ficha del Estudiante', pageWidth / 2, 50, { align: 'center' });
  
      doc.setLineWidth(0.5);
      doc.setDrawColor(0, 102, 51);
      doc.line(10, 60, pageWidth - 10, 60);
  
      // Datos
      const tableRows = [
        { label: "Nombre Completo", value: fichaEstudiante.Nombre_Completo?.toUpperCase() ?? "NO DISPONIBLE" },
        { label: "Tipo de Documento", value: fichaEstudiante.Tipo_Documento?.toUpperCase() ?? "NO DISPONIBLE" },
        { label: "DNI", value: fichaEstudiante.DNI?.toUpperCase() ?? "NO DISPONIBLE" },
        { label: "Fecha de Nacimiento", value: new Date(fichaEstudiante.Fecha_Nacimiento).toLocaleDateString('es-ES').toUpperCase() },
        { label: "Género", value: fichaEstudiante.Genero?.toUpperCase() ?? "NO DISPONIBLE" },
        { label: "Nacionalidad", value: fichaEstudiante.Nacionalidad?.toUpperCase() ?? "NO DISPONIBLE" },
      ];
  
      const direccionUbicacionRows = [
        { label: "Dirección", value: fichaEstudiante.Direccion?.toUpperCase() ?? "NO DISPONIBLE" },
        { label: "Departamento", value: fichaEstudiante.Departamento?.toUpperCase() ?? "NO DISPONIBLE" },
        { label: "Municipio", value: fichaEstudiante.Municipio?.toUpperCase() ?? "NO DISPONIBLE" },
      ];
  
      const padreRows = [
        { label: "Nombre", value: fichaEstudiante.Nombre_Padre_Tutor?.toUpperCase() ?? "NO DISPONIBLE" },
        { label: "Teléfono Móvil", value: fichaEstudiante.Telefono_Movil_Tutor?.toUpperCase() ?? "NO DISPONIBLE" },
        { label: "Teléfono Fijo", value: fichaEstudiante.Telefono_Fijo_Tutor?.toUpperCase() ?? "NO DISPONIBLE" },  // Nuevo campo
        { label: "Correo Electrónico", value: fichaEstudiante.Correo_Tutor?.toUpperCase() ?? "NO DISPONIBLE" },
      ];
  
      const addSectionTitle = (title, y) => {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 102, 51);
        doc.text(title, 15, y);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
      };
  
      let yPosition = 65;
  
      addSectionTitle('DATOS DEL ESTUDIANTE', yPosition);
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
      addSectionTitle('DIRECCIÓN Y UBICACIÓN', yPosition);
      yPosition += 5;
      doc.autoTable({
        startY: yPosition,
        margin: { left: 15 },
        columns: [{ header: "Información", dataKey: "label" }, { header: "Valor", dataKey: "value" }],
        body: direccionUbicacionRows,
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
      addSectionTitle('INFORMACIÓN DEL PADRE', yPosition);
      yPosition += 5;
      doc.autoTable({
        startY: yPosition,
        margin: { left: 15 },
        columns: [{ header: "Información", dataKey: "label" }, { header: "Valor", dataKey: "value" }],
        body: padreRows,
        styles: { fontSize: 10 },
        columnStyles: { label: { fontStyle: "bold", cellWidth: 60 }, value: { halign: 'left', cellWidth: 80 } },
        headStyles: {
          fillColor: [0, 102, 51],
          textColor: [255, 255, 255],
          fontSize: 9,
          halign: 'center',
        },
      });
  
      // Pie de página
      const footerY = doc.internal.pageSize.height - 10;
      doc.setFontSize(10);
      doc.setTextColor(0, 102, 51);
      const now = new Date();
      doc.text(`Fecha de generación: ${now.toLocaleDateString()} Hora: ${now.toLocaleTimeString()}`, 10, footerY);
      doc.text(`Página 1 de 1`, pageWidth - 10, footerY, { align: 'right' });
  
      // Crear el PDF y abrir la vista previa con botones e íconos
      const pdfBlob = doc.output('blob');
      const pdfURL = URL.createObjectURL(pdfBlob);
      const newWindow = window.open('', '_blank');
      newWindow.document.write(`
        <html>
          <head>
            <title>Ficha del Estudiante</title>
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
              <button class="icon-button" onclick="const a = document.createElement('a'); a.href='${pdfURL}'; a.download='Ficha_Estudiante.pdf'; a.click();">
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
  
  
  
  {/************************************************************************************************************************************/}

  const exportFichaEstudianteToExcel = () => {
    if (!fichaEstudiante || Object.keys(fichaEstudiante).length === 0) {
      alert('No hay datos para exportar.');
      return;
    }
  
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Ficha Estudiante');
  
    // **Título del documento**
    worksheet.mergeCells('A1:B1');
    worksheet.getCell('A1').value = "SAINT PATRICK'S ACADEMY";
    worksheet.getCell('A1').font = { bold: true, size: 18, color: { argb: '006633' } };
    worksheet.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };
  
    worksheet.mergeCells('A2:B2');
    worksheet.getCell('A2').value = 'FICHA DEL ESTUDIANTE';
    worksheet.getCell('A2').font = { bold: true, size: 16, color: { argb: '006633' } };
    worksheet.getCell('A2').alignment = { horizontal: 'center', vertical: 'middle' };
  
    // **Sección Datos del Estudiante**
    worksheet.addRow(['']);
    worksheet.mergeCells('A3:B3');
    worksheet.getCell('A3').value = 'DATOS DEL ESTUDIANTE';
    worksheet.getCell('A3').font = { bold: true, size: 14, color: { argb: 'FFFFFF' } };
    worksheet.getCell('A3').alignment = { horizontal: 'center', vertical: 'middle' };
    worksheet.getCell('A3').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '006633' } };
  
    // Añadir bordes al encabezado de la sección "Datos del Estudiante"
    worksheet.getCell('A3').border = {
      top: { style: 'thin', color: { argb: '000000' } },
      left: { style: 'thin', color: { argb: '000000' } },
      bottom: { style: 'thin', color: { argb: '000000' } },
      right: { style: 'thin', color: { argb: '000000' } },
    };
  
    const datosEstudiante = [
      ['Nombre Completo', fichaEstudiante.Nombre_Completo],
      ['Tipo de Documento', fichaEstudiante.Tipo_Documento ?? 'No disponible'],
      ['DNI', fichaEstudiante.DNI],
      ['Fecha de Nacimiento', new Date(fichaEstudiante.Fecha_Nacimiento).toLocaleDateString()],
      ['Género', fichaEstudiante.Genero === 1 ? "Masculino" : fichaEstudiante.Genero === 2 ? "Femenino" : "No especificado"],
      ['Nacionalidad', fichaEstudiante.Nacionalidad ?? 'No disponible'],
      ['Estado', fichaEstudiante.Estado ? 'Activo' : 'Inactivo']
    ];
  
    datosEstudiante.forEach((fila) => {
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
  
    // **Sección Dirección y Ubicación**
    worksheet.addRow(['']);
    worksheet.mergeCells('A' + (worksheet.lastRow.number + 1) + ':B' + (worksheet.lastRow.number + 1));
    worksheet.getCell('A' + (worksheet.lastRow.number)).value = 'DIRECCIÓN Y UBICACIÓN';
    worksheet.getCell('A' + (worksheet.lastRow.number)).font = { bold: true, size: 14, color: { argb: 'FFFFFF' } };
    worksheet.getCell('A' + (worksheet.lastRow.number)).alignment = { horizontal: 'center', vertical: 'middle' };
    worksheet.getCell('A' + (worksheet.lastRow.number)).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '006633' } };
  
    // Añadir bordes al encabezado de la sección "Dirección y Ubicación"
    worksheet.getCell('A' + (worksheet.lastRow.number)).border = {
      top: { style: 'thin', color: { argb: '000000' } },
      left: { style: 'thin', color: { argb: '000000' } },
      bottom: { style: 'thin', color: { argb: '000000' } },
      right: { style: 'thin', color: { argb: '000000' } },
    };
  
    const direccionUbicacion = [
      ['Dirección', fichaEstudiante.Direccion ?? 'No disponible'],
      ['Departamento', fichaEstudiante.Departamento ?? 'No disponible'],
      ['Municipio', fichaEstudiante.Municipio ?? 'No disponible'],
    ];
  
    direccionUbicacion.forEach((fila) => {
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
  
    // **Sección Información del Padre**
    worksheet.addRow(['']);
    worksheet.mergeCells('A' + (worksheet.lastRow.number + 1) + ':B' + (worksheet.lastRow.number + 1));
    worksheet.getCell('A' + (worksheet.lastRow.number)).value = 'INFORMACIÓN DEL PADRE';
    worksheet.getCell('A' + (worksheet.lastRow.number)).font = { bold: true, size: 14, color: { argb: 'FFFFFF' } };
    worksheet.getCell('A' + (worksheet.lastRow.number)).alignment = { horizontal: 'center', vertical: 'middle' };
    worksheet.getCell('A' + (worksheet.lastRow.number)).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '006633' } };
  
    // Añadir bordes al encabezado de la sección "Información del Padre"
    worksheet.getCell('A' + (worksheet.lastRow.number)).border = {
      top: { style: 'thin', color: { argb: '000000' } },
      left: { style: 'thin', color: { argb: '000000' } },
      bottom: { style: 'thin', color: { argb: '000000' } },
      right: { style: 'thin', color: { argb: '000000' } },
    };
  
    const infoPadre = [
      ['Nombre del Padre', fichaEstudiante.Nombre_Padre ?? 'No disponible'],
      ['Teléfono Móvil Padre', fichaEstudiante.Telefono_Movil_Padre ?? 'No disponible'],
      ['Teléfono Fijo Padre', fichaEstudiante.Telefono_Fijo_Padre ?? 'No disponible'],
      ['Correo Padre', fichaEstudiante.Correo_Padre ?? 'No disponible']
    ];
  
    infoPadre.forEach((fila) => {
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
  
    // **Ajustar el ancho de las columnas**
    worksheet.getColumn(1).width = 40; // Aumentar el tamaño de la columna 'Campo'
    worksheet.getColumn(2).width = 50; // Aumentar el tamaño de la columna 'Valor'
  
    // **Crear archivo Excel**
    workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, 'Reporte_FichaEstudiante.xlsx');
    });
  };
  
  
  {/************************************************************************************************************************************/}

  {/************************************************************************************************************************************/}

  {/************************************************************************************************************************************/}

  {/************************************************************************************************************************************/}

  {/************************************************************************************************************************************/}

  {/************************************************************************************************************************************/}

  {/************************************************************************************************************************************/}
    // Verificar permisos
    if (!canSelect) {
      return <AccessDenied />;
    } 
  {/************************************************************************************************************************************/}
  return (

        <CContainer>

<div className="profile-container ficha-estudiante-container">
  {/* Encabezado de la Ficha */}
  <div className="profile-header">
  <div className="profile-info d-flex justify-content-center align-items-center flex-column">
    {/* Título centrado */}
    <div style={{ display: 'inline-block', position: 'relative' }}>
      <h1 className="profile-name" style={{ fontSize: '26px' }}>Ficha del Estudiante</h1>
      {/* Línea verde debajo del título */}
      <div style={{ height: '2px', backgroundColor: '#6C8E58', position: 'absolute', bottom: '-5px', left: '0', width: '100%' }}></div>
    </div>
  </div>

  {/* Botones organizados */}
  <div className="botones-container d-flex gap-3 mt-3 justify-content-between">
    {/* Botón Procedencia alineado a la izquierda */}
    <CButton 
      className="btn-volver" 
      onClick={volverAListaProcedenciaEstudiante} 
      style={{ backgroundColor: '#6c757d', color: 'white', minWidth: '160px', height: '38px' }}
    >
      <CIcon icon={cilArrowLeft} /> Procedencia
    </CButton>

    {/* Botón Reportes alineado a la derecha */}
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
      onClick={exportFichaEstudianteToExcel}
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
      onClick={ReporteFichaEstudiantePDF}
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

{/* Información de la Ficha */}
  <div className="info-card">
    {/* Datos del Estudiante */}
    <h2 className="info-title">Datos del Estudiante</h2>
    <div className="info-grid">
      {[
        ['Nombre Completo', fichaEstudiante?.Nombre_Completo],
        ['Tipo Documento', fichaEstudiante?.Tipo_Documento],
        ['Documentación', fichaEstudiante?.DNI],
        ['Fecha de Nacimiento', new Date(fichaEstudiante?.Fecha_Nacimiento).toLocaleDateString('es-ES')],
        ['Género', fichaEstudiante?.Genero],
        ['Nacionalidad', fichaEstudiante?.Nacionalidad],
      ].map(([campo, valor], index) => (
        <div key={index} className="info-item">
          <div className="info-details">
            <label>{campo}</label>
            <p>{valor ? valor.toString().toUpperCase() : 'NO DISPONIBLE'}</p> {/* ✅ Convierte a mayúsculas */}
          </div>
        </div>
      ))}
    </div>

    {/* Dirección y Ubicación */}
    <h2 className="info-title">Dirección y Ubicación</h2>
    <div className="info-grid">
      {[
        ['Dirección', fichaEstudiante?.Direccion],
        ['Departamento', fichaEstudiante?.Departamento],
        ['Municipio', fichaEstudiante?.Municipio],
      ].map(([campo, valor], index) => (
        <div key={index} className="info-item">
          <div className="info-details">
            <label>{campo}</label>
            <p>{valor ? valor.toString().toUpperCase() : 'NO DISPONIBLE'}</p> {/* ✅ Convierte a mayúsculas */}
          </div>
        </div>
      ))}
    </div>

    {/* Información del Padre */}
    <h2 className="info-title">Información del Padre</h2>
    <div className="info-grid">
      {[
        ['Nombre', fichaEstudiante?.Nombre_Padre_Tutor],
        ['Teléfono Móvil', fichaEstudiante?.Telefono_Movil_Tutor],
        ['Teléfono Fijo', fichaEstudiante?.Telefono_Fijo_Tutor],
        ['Correo Electrónico', fichaEstudiante?.Correo_Tutor],
      ].map(([campo, valor], index) => (
        <div key={index} className="info-item">
          <div className="info-details">
            <label>{campo}</label>
            <p>{valor ? valor.toString().toUpperCase() : 'NO DISPONIBLE'}</p> {/* ✅ Convierte a mayúsculas */}
          </div>
        </div>
      ))}
    </div>
  </div>
<style>
    {`

      :root {
        --primary: #0ea5e9;
        --primary-light: #e0f2fe;
        --primary-dark: #0284c7;
        --primary-hover: #0369a1;
        --background: #ffffff;
        --surface: #f8fafc;
        --surface-hover: #f1f5f9;
        --text-primary: #0f172a;
        --text-secondary: #475569;
        --border: #e2e8f0;
        --radius-lg: 1rem;
      }

      .profile-container {
        max-width: 2000px;
        margin: 0.1rem auto;
        padding: 1.5rem;
      }

      .profile-header {
        background: var(--background);
        border-radius: var(--radius-lg);
        padding: 2rem;
        box-shadow: var(--shadow);
        margin-bottom: 2rem;
        text-align: center;
      }

      .profile-name {
        font-size: 1.875rem;
        font-weight: 700;
        color: var(--text-primary);
      }

      .profile-username {
        color: var(--text-secondary);
        font-size: 1rem;
        margin-top: 0.5rem;
      }

      .profile-tabs {
        display: flex;
        gap: 1rem;
        justify-content: center;
        margin-bottom: 2rem;
      }

      .button-primary, .button-secondary {
        padding: 0.75rem 1.5rem;
        border-radius: var(--radius-lg);
        font-weight: 500;
        cursor: pointer;
        border: none;
      }

      .button-primary {
        background: var(--primary);
        color: white;
      }

      .button-secondary {
        background: var(--surface);
        color: var(--text-secondary);
        border: 1px solid var(--border);
      }

      .info-card {
        background: var(--background);
        border-radius: var(--radius-lg);
        padding: 1rem;
        box-shadow: var(--shadow);
      }

      .info-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 1.5rem;
      }

      .info-item {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1rem;
        background: var(--background);
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow);
      }

      .info-item i {
        padding: 0.75rem;
        background: var(--primary-light);
        color: var(--primary);
        border-radius: var(--radius-lg);
      }

      .info-details label {
        display: block;
        font-size: 0.875rem;
        color: var(--text-secondary);
        margin-bottom: 0.25rem;
      }

      .info-details p {
        color: var(--text-primary);
        font-weight: 500;
      }
              .mensaje-vacio {
        text-align: center;
        margin-top: 20px;
        color: var(--text-secondary);
        font-size: 1rem;
      }

      /* Ajustes responsivos */
      @media (max-width: 768px) {
        .profile-header {
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .profile-tabs {
          flex-direction: column;
          align-items: center;
        }

        .info-grid {
          grid-template-columns: 1fr;
        }
      }

      /* Efectos en los botones */
      .button-primary:hover {
        background: var(--primary-hover);
      }

      .button-secondary:hover {
        background: var(--surface-hover);
      }

      /* Ajuste en las tarjetas de información */
      .info-item:hover {
        transform: scale(1.02);
        transition: transform 0.2s;
      }
    `}
  </style>
</div>

        </CContainer>

  );
};

export default ListaFichaEstudiante;