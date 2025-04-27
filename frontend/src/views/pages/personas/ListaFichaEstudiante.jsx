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

      const volverAListaPersonas = () => {
        navigate('/ListaPersonas');
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
        console.log('Ficha estudiante obtenida:', JSON.stringify(data, null, 2)); // ✅ Confirmar estructura

        if (!data || Object.keys(data).length === 0) {
            console.warn('No se encontraron datos en la respuesta de la API.');
            setFichaEstudiante(null);
            return;
        }

        // ✅ Asegurar que los datos del estudiante siempre se asignen correctamente
        const estudianteBase = {
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

            // ✅ Filtrar registros vacíos en `familiares`
            familiares: Array.isArray(data?.familiares) 
                ? data.familiares.filter(familiar => familiar.cod_familiar !== null) // 🔥 Elimina registros sin datos
                : []
        };

        console.log('✅ Ficha del estudiante con familiares filtrados:', JSON.stringify(estudianteBase, null, 2));

        setFichaEstudiante(estudianteBase);
    } catch (error) {
        console.error('❌ Error al obtener la ficha del estudiante:', error);
        setFichaEstudiante(null);
    }
};


useEffect(() => {
  console.log("Llamando fetchFichaEstudiante() desde useEffect"); // ✅ Depuración del efecto
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
        doc.text('Ficha del Estudiante', pageWidth / 2, 50, { align: 'center' });

        doc.setLineWidth(0.5);
        doc.setDrawColor(0, 102, 51);
        doc.line(10, 60, pageWidth - 10, 60);

        // ✅ Datos del estudiante
        const tableRows = [
            { label: "Nombre Completo", value: fichaEstudiante.Nombre_Completo?.toUpperCase() ?? "NO DISPONIBLE" },
            { label: "DNI", value: fichaEstudiante.DNI?.toUpperCase() ?? "NO DISPONIBLE" },
            { label: "Fecha de Nacimiento", value: fichaEstudiante.Fecha_Nacimiento ? new Date(fichaEstudiante.Fecha_Nacimiento).toLocaleDateString('es-ES').toUpperCase() : "NO DISPONIBLE" },
            { label: "Género", value: fichaEstudiante.Genero?.toUpperCase() ?? "NO DISPONIBLE" },
            { label: "Nacionalidad", value: fichaEstudiante.Nacionalidad?.toUpperCase() ?? "NO DISPONIBLE" },
        ];

        const direccionUbicacionRows = [
            { label: "Dirección", value: fichaEstudiante.Direccion?.toUpperCase() ?? "NO DISPONIBLE" },
            { label: "Departamento", value: fichaEstudiante.Departamento?.toUpperCase() ?? "NO DISPONIBLE" },
            { label: "Municipio", value: fichaEstudiante.Municipio?.toUpperCase() ?? "NO DISPONIBLE" },
        ];

        // ✅ Función para agregar títulos de sección
        const addSectionTitle = (title, y) => {
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(0, 102, 51);
            doc.text(title, 15, y);
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
        };

        let yPosition = 65;

        // ✅ Generar tablas de información
        addSectionTitle('DATOS DEL ESTUDIANTE', yPosition);
        yPosition += 5;
        doc.autoTable({
            startY: yPosition,
            margin: { left: 15 },
            columns: [{ header: "Información", dataKey: "label" }, { header: "Valor", dataKey: "value" }],
            body: tableRows,
            styles: { fontSize: 10, cellPadding: 3 },
            columnStyles: { label: { fontStyle: "bold", cellWidth: 60 }, value: { halign: 'left', cellWidth: 80 } },
            headStyles: { fillColor: [0, 102, 51], textColor: [255, 255, 255], fontSize: 9, halign: 'center' },
        });

        yPosition = doc.lastAutoTable.finalY + 10;
        addSectionTitle('DIRECCIÓN Y UBICACIÓN', yPosition);
        yPosition += 5;
        doc.autoTable({
            startY: yPosition,
            margin: { left: 15 },
            columns: [{ header: "Información", dataKey: "label" }, { header: "Valor", dataKey: "value" }],
            body: direccionUbicacionRows,
            styles: { fontSize: 10, cellPadding: 3 },
            columnStyles: { label: { fontStyle: "bold", cellWidth: 60 }, value: { halign: 'left', cellWidth: 80 } },
            headStyles: { fillColor: [0, 102, 51], textColor: [255, 255, 255], fontSize: 9, halign: 'center' },
        });

        //  Sección independiente para cada familiar
        fichaEstudiante.familiares.forEach((familiar, index) => {
            yPosition = doc.lastAutoTable.finalY + 10;
            addSectionTitle(`FAMILIAR #${index + 1}: ${familiar.nombre_familiar?.toUpperCase() ?? "NO DISPONIBLE"}`, yPosition);
            yPosition += 5;

            const familiarRows = [
                { label: "Tipo Relación", value: familiar.tipo_relacion?.toUpperCase() ?? "NO DISPONIBLE" },
                { label: "DNI", value: familiar.dni_familiar?.toUpperCase() ?? "NO DISPONIBLE" },
                { label: "Teléfonos Móviles", value: familiar.telefonos_moviles?.length > 0 ? familiar.telefonos_moviles.join(', ') : "NO DISPONIBLE" },
                { label: "Teléfonos Fijos", value: familiar.telefonos_fijos?.length > 0 ? familiar.telefonos_fijos.join(', ') : "NO DISPONIBLE" },
                { label: "Correos", value: familiar.correos?.length > 0 ? familiar.correos.join(', ') : "NO DISPONIBLE" }
            ];

            doc.autoTable({
                startY: yPosition,
                margin: { left: 15 },
                columns: [{ header: "Información", dataKey: "label" }, { header: "Valor", dataKey: "value" }],
                body: familiarRows,
                styles: { fontSize: 10, cellPadding: 3 },
                columnStyles: { label: { fontStyle: "bold", cellWidth: 60 }, value: { halign: 'left', cellWidth: 80 } },
                headStyles: { fillColor: [0, 102, 51], textColor: [255, 255, 255], fontSize: 9, halign: 'center' },
            });
        });

        // Pie de página
        const footerY = pageHeight - 10;
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

    const datosEstudiante = [
        ['Nombre Completo', fichaEstudiante.Nombre_Completo],
        ['DNI', fichaEstudiante.DNI],
        ['Fecha de Nacimiento', new Date(fichaEstudiante.Fecha_Nacimiento).toLocaleDateString()],
        ['Género', fichaEstudiante.Genero],
        ['Nacionalidad', fichaEstudiante.Nacionalidad]
    ];

    datosEstudiante.forEach(row => worksheet.addRow(row));

    // **Sección Dirección y Ubicación**
    worksheet.addRow(['']);
    worksheet.mergeCells(`A${worksheet.lastRow.number + 1}:B${worksheet.lastRow.number + 1}`);
    worksheet.getCell(`A${worksheet.lastRow.number}`).value = 'DIRECCIÓN Y UBICACIÓN';
    worksheet.getCell(`A${worksheet.lastRow.number}`).font = { bold: true, size: 14, color: { argb: 'FFFFFF' } };
    worksheet.getCell(`A${worksheet.lastRow.number}`).alignment = { horizontal: 'center', vertical: 'middle' };
    worksheet.getCell(`A${worksheet.lastRow.number}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '006633' } };

    const direccionUbicacion = [
        ['Dirección', fichaEstudiante.Direccion],
        ['Departamento', fichaEstudiante.Departamento],
        ['Municipio', fichaEstudiante.Municipio]
    ];

    direccionUbicacion.forEach(row => worksheet.addRow(row));

    // **Sección de familiares, cada uno en una tabla separada**
    fichaEstudiante.familiares.forEach((familiar, index) => {
        worksheet.addRow(['']);
        worksheet.mergeCells(`A${worksheet.lastRow.number + 1}:B${worksheet.lastRow.number + 1}`);
        worksheet.getCell(`A${worksheet.lastRow.number}`).value = `FAMILIAR #${index + 1}: ${familiar.nombre_familiar}`;
        worksheet.getCell(`A${worksheet.lastRow.number}`).font = { bold: true, size: 14, color: { argb: 'FFFFFF' } };
        worksheet.getCell(`A${worksheet.lastRow.number}`).alignment = { horizontal: 'center', vertical: 'middle' };
        worksheet.getCell(`A${worksheet.lastRow.number}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '006633' } };

        const familiarRows = [
            ['Tipo Relación', familiar.tipo_relacion],
            ['DNI', familiar.dni_familiar],
            ['Teléfonos Móviles', familiar.telefonos_moviles?.length > 0 ? familiar.telefonos_moviles.join(', ') : 'NO DISPONIBLE'],
            ['Teléfonos Fijos', familiar.telefonos_fijos?.length > 0 ? familiar.telefonos_fijos.join(', ') : 'NO DISPONIBLE'],
            ['Correos', familiar.correos?.length > 0 ? familiar.correos.join(', ') : 'NO DISPONIBLE']
        ];

        // **Aplicamos `wrapText` para permitir ajuste automático del contenido**
        familiarRows.forEach(row => {
            const newRow = worksheet.addRow(row);
            newRow.eachCell((cell) => {
                cell.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true }; // ✅ Ajuste de texto automático
            });
        });
    });

    // **Ajustar el ancho de las columnas**
    worksheet.getColumn(1).width = 40; // Aumentar el tamaño de la columna 'Campo'
    worksheet.getColumn(2).width = 50; // Aumentar el tamaño de la columna 'Valor'

    // **Crear archivo Excel**
    workbook.xlsx.writeBuffer().then((buffer) => {
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, `Reporte_FichaEstudiante_${fichaEstudiante.Nombre_Completo}.xlsx`);
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

  {/* Contenedor de Procedencia y Reportes - alineados juntos a la derecha */}
  <div className="d-flex gap-2">
    {/* Botón Procedencia */}
    <CButton 
      className="btn-volver" 
      onClick={volverAListaProcedenciaEstudiante} 
      style={{ backgroundColor: '#6c757d', color: 'white', minWidth: '160px', height: '38px' }}
    >
      <CIcon icon={cilArrowLeft} /> Procedencia
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

</div>
{/* Información de la Ficha */}
<div className="info-card">
  {/* Datos del Estudiante */}
  <h2 className="info-title">Datos del Estudiante</h2>
  <div className="info-grid">
    {[
      ['Nombre Completo', fichaEstudiante?.Nombre_Completo],
      ['Documentación', fichaEstudiante?.DNI],
      ['Fecha de Nacimiento', fichaEstudiante?.Fecha_Nacimiento ? new Date(fichaEstudiante.Fecha_Nacimiento).toLocaleDateString('es-ES') : 'NO DISPONIBLE'],
      ['Género', fichaEstudiante?.Genero],
      ['Nacionalidad', fichaEstudiante?.Nacionalidad],
      ['Dirección', fichaEstudiante?.Direccion],  
      ['Departamento', fichaEstudiante?.Departamento],  
      ['Municipio', fichaEstudiante?.Municipio],  
    ].map(([campo, valor], index) => (
      <div key={index} className="info-item">
        <div className="info-details">
          <label>{campo}</label>
          <p>{valor ? valor.toString().toUpperCase() : 'NO DISPONIBLE'}</p>  
        </div>
      </div>
    ))}
  </div>

  {/* Información de Familiares */}
  <h2 className="info-title">Información de Familiares</h2>
  {Array.isArray(fichaEstudiante?.familiares) && fichaEstudiante.familiares.length > 0 ? (
    fichaEstudiante.familiares
      .sort((a, b) => {
        if (a.tipo_relacion.toLowerCase() === 'madre') return -1;
        if (b.tipo_relacion.toLowerCase() === 'madre') return 1;
        if (a.tipo_relacion.toLowerCase() === 'padre') return -1;
        if (b.tipo_relacion.toLowerCase() === 'padre') return 1;
        return 0;
      }) 
      .map((familiar, index) => (
        <div key={index} className="info-card-familiar">
          <div className="info-grid">
            {[
              ['Nombre Completo', familiar.nombre_familiar ? familiar.nombre_familiar.toUpperCase() : 'NO DISPONIBLE'],
              ['Relación', familiar.tipo_relacion ? familiar.tipo_relacion.toUpperCase() : 'NO DISPONIBLE'],
              ['Documentación', familiar.dni_familiar ? familiar.dni_familiar.toUpperCase() : 'NO DISPONIBLE'],
            ].map(([campo, valor], index) => (
              <div key={index} className="info-item">
                <div className="info-details">
                  <label>{campo}</label>
                  <p>{valor}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Contactos del Familiar */}
          <div className="info-grid">
            {[
              ['Teléfonos Móviles', familiar.telefonos_moviles?.length > 0 ? familiar.telefonos_moviles.join(', ') : 'NO DISPONIBLE'],
              ['Teléfonos Fijos', familiar.telefonos_fijos?.length > 0 ? familiar.telefonos_fijos.join(', ') : 'NO DISPONIBLE'],
              ['Correos Electrónicos', familiar.correos?.length > 0 ? familiar.correos.join(', ') : 'NO DISPONIBLE'],
            ].map(([campo, valor], index) => (
              <div key={index} className="info-item">
                <div className="info-details">
                  <label>{campo}</label>
                  <p>{valor}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))
  ) : (
    <p className="info-message">No hay familiares registrados para este estudiante.</p>
  )}
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
      --text-primary: #0f172a;
      --text-secondary: #475569;
      --border: #e2e8f0;
      --radius-lg: 1rem;
      --shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }

    .profile-container.ficha-padre-container {
      max-width: 1200px;
      margin: 0 auto;
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

    .botones-container {
      display: flex;
      justify-content: space-between;
      margin-top: 1.5rem;
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

    /* Separación entre secciones */
    .info-title {
      margin-bottom: 1.5rem;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
    }

    /* Aquí hago un único cuadro que cubre tanto el nombre de la etiqueta como el dato */
    .info-item {
      padding: 1rem;
      background: var(--background);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow);
      margin-bottom: 1.5rem;
    }

    .info-details {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    /* Único cuadro que envuelve tanto la etiqueta como el dato */
    .info-details .field-container {
      background: var(--background);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 1rem;
      box-shadow: var(--shadow);
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .info-details label {
      font-size: 0.875rem;
      color: var(--text-secondary);
      margin-bottom: 0.25rem;
    }

    .info-details p {
      font-size: 1rem;
      color: var(--text-primary);
      font-weight: 500;
    }

    /* Ajuste para mostrar los hijos en filas de tres */
    .hijos-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr); /* Tres hijos por fila */
      gap: 1.5rem;
    }

    .hijo-item {
      padding: 1rem;
      background: var(--primary-light);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow);
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
  `}
</style>

</div>

        </CContainer>

  );
};

export default ListaFichaEstudiante;