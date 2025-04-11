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
        { label: "Teléfono", value: fichaPadre.Telefono?.toUpperCase() ?? "NO DISPONIBLE" },
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
          Nombre: hijo.Nombre_Completo?.toUpperCase() ?? "NO DISPONIBLE",
          DNI: hijo.DNI?.toUpperCase() ?? "NO DISPONIBLE",
          Edad: hijo.Edad?.toString() ?? "NO DISPONIBLE",
        }));
  
        doc.autoTable({
          startY: yPosition,
          margin: { left: 15 },
          columns: [
            { header: "Nombre", dataKey: "Nombre" },
            { header: "DNI", dataKey: "DNI" },
            { header: "Edad", dataKey: "Edad" },
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
          <head><title>Ficha del Padre</title></head>
          <body style="margin:0;">
            <iframe width="100%" height="100%" src="${pdfURL}" frameborder="0"></iframe>
            <div style="position:fixed;top:10px;right:20px;">
              <button style="background-color: #6c757d; color: white; border: none; padding: 10px 15px; border-radius: 5px; cursor: pointer;" 
                onclick="const a = document.createElement('a'); a.href='${pdfURL}'; a.download='Ficha_Padre.pdf'; a.click();">
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

    // **Encabezados de la tabla**
    const headerRow = worksheet.addRow(['Campo', 'Valor']);
    headerRow.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: 'FFFFFF' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '006633' } };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
    });

    // **Datos del padre**
    const datosPadre = [
        ['Nombre Completo', fichaPadre.Nombre_Completo],
        ['Tipo de Documento', fichaPadre.Tipo_Documento ?? 'No disponible'],
        ['DNI', fichaPadre.DNI],
        ['Fecha de Nacimiento', new Date(fichaPadre.Fecha_Nacimiento).toLocaleDateString()],
        ['Género', fichaPadre.Genero ?? 'No especificado'],
        ['Nacionalidad', fichaPadre.Nacionalidad ?? 'No disponible'],
        ['Estado', fichaPadre.Estado ? 'Activo' : 'Inactivo'],
        ['Dirección', fichaPadre.Direccion ?? 'No disponible'],
        ['Departamento', fichaPadre.Departamento ?? 'No disponible'],
        ['Municipio', fichaPadre.Municipio ?? 'No disponible'],
        ['Teléfono Móvil', fichaPadre.Telefono_Movil ?? 'No disponible'],
        ['Teléfono Fijo', fichaPadre.Telefono_Fijo ?? 'No disponible'],
        ['Correo', fichaPadre.Correo ?? 'No disponible']
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

    // **Espacio para la lista de hijos**
    worksheet.addRow([]);
    worksheet.addRow(['Lista de Hijos', '']);
    worksheet.getRow(worksheet.lastRow.number).font = { bold: true, size: 14, color: { argb: '006633' } };

    // **Datos de los hijos parametrizados**
    if (Array.isArray(fichaPadre.hijos) && fichaPadre.hijos.length > 0) {
        worksheet.addRow(['Nombre', 'DNI', 'Fecha de Nacimiento']); // Encabezado de hijos
        fichaPadre.hijos.forEach((hijo) => {
            worksheet.addRow([
                hijo.Nombre_Hijo,
                hijo.DNI_Hijo,
                new Date(hijo.Fecha_Nacimiento_Hijo).toLocaleDateString()
            ]);
        });
    } else {
        worksheet.addRow(['No tiene hijos registrados', '']);
    }

    // **Ajustar el ancho de las columnas**
    worksheet.columns.forEach((column) => {
        column.width = 35;
    });

    // **Crear archivo Excel**
    workbook.xlsx.writeBuffer().then((buffer) => {
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, 'Reporte_FichaPadre.xlsx');
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

          <CDropdown>
            <CDropdownToggle 
              className="btn-reportes" 
              style={{ backgroundColor: '#6C8E58', color: 'white', minWidth: '160px', height: '38px' }}
            >
              Reportes
            </CDropdownToggle>
            <CDropdownMenu>
              <CDropdownItem onClick={exportFichaPadreToExcel}>Descargar en Excel</CDropdownItem>
              <CDropdownItem onClick={ReporteFichaPadrePDF}>Descargar en PDF</CDropdownItem>
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