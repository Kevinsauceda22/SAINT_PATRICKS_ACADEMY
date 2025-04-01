import React, { useEffect, useState } from 'react';
import { CIcon } from '@coreui/icons-react';
import { cilSearch,cilBrushAlt, cilPen, cilTrash, cilPlus, cilSave, cilArrowLeft,cilUser  } from '@coreui/icons';
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
    const [fichaEstudiante, setFichaEstudiante] = useState({});
    const [fichaError, setFichaError] = useState('');
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const location = useLocation();
    const navigate = useNavigate();

    const { personaSeleccionada } = location.state || {};

    // Manejo de error si personaSeleccionada no está definida
    if (!personaSeleccionada) {
      console.warn('No se ha proporcionado una persona seleccionada. Redirigiendo...');
      navigate('/'); // O a donde desees redirigir en caso de error
      return null; // No renderizar nada mientras se redirige
    }




    const volverAListaProcedenciaEstudiante = () => {
      
        if (!personaSeleccionada) {
          console.warn("Esperando datos antes de redirigir...");
          setTimeout(() => {
            if (!personaSeleccionada) {
              console.warn("No se obtuvo una persona seleccionada. Redirigiendo...");
              navigate('/ListaProcedenciaEstudiante');
            }
          }, 2000); // Espera 2 segundos antes de redirigir
        } else {
          navigate('/ListaProcedenciaEstudiante'); // Redirige normalmente si hay datos
        }
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
  
      // **Encabezado con logo e información institucional**
      doc.addImage(img, 'PNG', 10, 10, 45, 45);
      doc.setFontSize(18);
      doc.setTextColor(0, 102, 51);
      doc.text("SAINT PATRICK'S ACADEMY", pageWidth / 2, 24, { align: 'center' });
  
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text('Casa Club del periodista, Colonia del Periodista', pageWidth / 2, 32, { align: 'center' });
      doc.text('Teléfono: (504) 2234-8871', pageWidth / 2, 37, { align: 'center' });
      doc.text('Correo: info@saintpatrickacademy.edu', pageWidth / 2, 42, { align: 'center' });
  
      // **Título del reporte**
      doc.setFontSize(14);
      doc.setTextColor(0, 102, 51);
      doc.text('Ficha del Estudiante', pageWidth / 2, 50, { align: 'center' });
  
      doc.setLineWidth(0.5);
      doc.setDrawColor(0, 102, 51);
      doc.line(10, 60, pageWidth - 10, 60);
  
      // **Etiquetas de columnas**
      const tableRows = [
        ["Información", "Valor"],
        ["Nombre Completo", fichaEstudiante.Nombre_Completo],
        ["Tipo de Documento", fichaEstudiante.Tipo_Documento ?? "No disponible"],
        ["DNI", fichaEstudiante.DNI],
        ["Fecha de Nacimiento", new Date(fichaEstudiante.Fecha_Nacimiento).toLocaleDateString()],
        ["Género", fichaEstudiante.Genero === 1 ? "Masculino" : fichaEstudiante.Genero === 2 ? "Femenino" : "No especificado"],
        ["Nacionalidad", fichaEstudiante.Nacionalidad ?? "No disponible"],
        ["Estado", fichaEstudiante.Estado ? "Activo" : "Inactivo"],
        ["Dirección", fichaEstudiante.Direccion ?? "No disponible"],
        ["Departamento", fichaEstudiante.Departamento ?? "No disponible"],
        ["Municipio", fichaEstudiante.Municipio ?? "No disponible"],
        ["Nombre del Padre/Tutor", fichaEstudiante.Nombre_Padre_Tutor ?? "No disponible"],
        ["Teléfono Móvil Tutor", fichaEstudiante.Telefono_Movil_Tutor ?? "No disponible"],
        ["Teléfono Fijo Tutor", fichaEstudiante.Telefono_Fijo_Tutor ?? "No disponible"],
        ["Correo Tutor", fichaEstudiante.Correo_Tutor ?? "No disponible"]
      ];
  
      // **Tabla con los datos**
      doc.autoTable({
        startY: 65,
        margin: { left: 15 },
        body: tableRows,
        headStyles: {
          fillColor: [0, 102, 51],
          textColor: [255, 255, 255],
          fontSize: 9,
          halign: 'center',
        },
        styles: {
          fontSize: 7,
          cellPadding: 4,
        },
        columnStyles: {
          0: { fontStyle: "bold" },
          1: { halign: 'left' }
        },
      });
  
      // **Pie de página**
      const footerY = doc.internal.pageSize.height - 10;
      doc.setFontSize(10);
      doc.setTextColor(0, 102, 51);
      const now = new Date();
      const dateString = now.toLocaleDateString();
      const timeString = now.toLocaleTimeString();
      doc.text(`Fecha de generación: ${dateString} Hora: ${timeString}`, 10, footerY);
      doc.text(`Página 1 de 1`, pageWidth - 10, footerY, { align: 'right' });
  
      // **Exportación y vista previa en ventana emergente**
      const pdfBlob = doc.output('blob');
      const pdfURL = URL.createObjectURL(pdfBlob);
      const newWindow = window.open('', '_blank');
  
      newWindow.document.write(`
        <html>
          <head><title>Ficha del Estudiante</title></head>
          <body style="margin:0;">
            <iframe width="100%" height="100%" src="${pdfURL}" frameborder="0"></iframe>
            <div style="position:fixed;top:10px;right:20px;">
              <button style="background-color: #6c757d; color: white; border: none; padding: 10px 15px; border-radius: 5px; cursor: pointer;" 
                onclick="const a = document.createElement('a'); a.href='${pdfURL}'; a.download='Ficha_Estudiante.pdf'; a.click();">
                Descargar PDF
              </button>
              <button style="background-color: #6c757d; color: white; border: none; padding: 10px 15px; border-radius: 5px; cursor: pointer;" 
                onclick="window.print();">
                Imprimir PDF
              </button>
            </div>
          </body>
        </html>`);
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
  
    // **Encabezados de la tabla**
    const headerRow = worksheet.addRow(['Campo', 'Valor']);
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '006633' } };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    });
  
    // **Datos del estudiante**
    const datosEstudiante = [
      ['Nombre Completo', fichaEstudiante.Nombre_Completo],
      ['Tipo de Documento', fichaEstudiante.Tipo_Documento ?? 'No disponible'],
      ['DNI', fichaEstudiante.DNI],
      ['Fecha de Nacimiento', new Date(fichaEstudiante.Fecha_Nacimiento).toLocaleDateString()],
      ['Género', fichaEstudiante.Genero === 1 ? "Masculino" : fichaEstudiante.Genero === 2 ? "Femenino" : "No especificado"],
      ['Nacionalidad', fichaEstudiante.Nacionalidad ?? 'No disponible'],
      ['Estado', fichaEstudiante.Estado ? 'Activo' : 'Inactivo'],
      ['Dirección', fichaEstudiante.Direccion ?? 'No disponible'],
      ['Departamento', fichaEstudiante.Departamento ?? 'No disponible'],
      ['Municipio', fichaEstudiante.Municipio ?? 'No disponible'],
      ['Nombre del Padre/Tutor', fichaEstudiante.Nombre_Padre_Tutor ?? 'No disponible'],
      ['Teléfono Móvil Tutor', fichaEstudiante.Telefono_Movil_Tutor ?? 'No disponible'],
      ['Teléfono Fijo Tutor', fichaEstudiante.Telefono_Fijo_Tutor ?? 'No disponible'],
      ['Correo Tutor', fichaEstudiante.Correo_Tutor ?? 'No disponible']
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
  
    // **Ajustar el ancho de las columnas**
    worksheet.columns.forEach((column) => {
      column.width = 25;
    });
  
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

  {/************************************************************************************************************************************/}
  return (

        <CContainer>

<div className="profile-container ficha-estudiante-container">
  {/* Encabezado de la Ficha */}
  <div className="profile-header">
    <div className="profile-info d-flex justify-content-between align-items-center">
      <h1 className="profile-name">Ficha del Estudiante</h1>

      {/* Botones de Acción alineados a la derecha debajo del título */}
      <div className="botones-container d-flex gap-3 mt-3 justify-content-end">
        <CButton className="btn-volver" onClick={volverAListaProcedenciaEstudiante} style={{ backgroundColor: '#6c757d', color: 'white', minWidth: '160px', height: '38px' }}>
          <CIcon icon={cilArrowLeft} /> Procedencia
        </CButton>
        <CDropdown>
          <CDropdownToggle className="btn-reportes" style={{ backgroundColor: '#6C8E58', color: 'white', minWidth: '160px', height: '38px' }}>
            Reportes
          </CDropdownToggle>
          <CDropdownMenu>
            <CDropdownItem onClick={exportFichaEstudianteToExcel}>Descargar en Excel</CDropdownItem>
            <CDropdownItem onClick={ReporteFichaEstudiantePDF}>Descargar en PDF</CDropdownItem>
          </CDropdownMenu>
        </CDropdown>
      </div>
    </div>
  </div>




  {/* Información de la Ficha */}
  {fichaEstudiante ? (
    <div className="info-card">
      {/* Datos del Estudiante */}
      <h2 className="info-title">Datos del Estudiante</h2>
      <div className="info-grid">
        {[
          ['Nombre Completo', fichaEstudiante?.Nombre_Completo],
          ['Tipo Documento', fichaEstudiante?.Tipo_Documento],
          ['DNI', fichaEstudiante?.DNI],
          ['Fecha de Nacimiento', fichaEstudiante?.Fecha_Nacimiento],
          ['Género', fichaEstudiante?.Genero],
          ['Nacionalidad', fichaEstudiante?.Nacionalidad],
        ].map(([campo, valor], index) => (
          <div key={index} className="info-item">
            <div className="info-details">
              <label>{campo}</label>
              <p>{valor ?? 'No disponible'}</p>
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
              <p>{valor ?? 'No disponible'}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Información del Padre */}
      <h2 className="info-title">Información del Padre/Tutor</h2>
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
              <p>{valor ?? 'No disponible'}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  ) : (
    <p className="mensaje-vacio">No hay información disponible para la ficha del estudiante.</p>
  )}
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
        max-width: 1024px;
        margin: 2rem auto;
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
        padding: 1.5rem;
        box-shadow: var(--shadow);
      }

      .info-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
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