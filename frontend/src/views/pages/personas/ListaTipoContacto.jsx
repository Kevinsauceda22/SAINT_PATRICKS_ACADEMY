import React, { useEffect, useState } from 'react';
import { CIcon } from '@coreui/icons-react';
import { cilSearch, cilPen, cilTrash, cilPlus, cilDescription, cilSave, cilPrint } from '@coreui/icons';
import swal from 'sweetalert2';
import '@fortawesome/fontawesome-free/css/all.min.css';
import {
  CButton,
  CContainer,
  CInputGroup,
  CInputGroupText,
  CFormInput,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CPagination,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CRow,
  CCol,
  CDropdown,
  CDropdownMenu,
  CDropdownToggle,
  CDropdownItem,
  CFormSelect,
} from '@coreui/react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

const ListaTipoContacto = () => {
  const [tiposContacto, setTiposContacto] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [tipoContactoToUpdate, setTipoContactoToUpdate] = useState(null);
  const [nuevoTipoContacto, setNuevoTipoContacto] = useState({ tipo_contacto: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(5);

  useEffect(() => {
    fetchTiposContacto();
  }, []);

  const fetchTiposContacto = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/tipoContacto/obtenerTipoContacto');
      if (!response.ok) throw new Error(`Error en la solicitud: ${response.statusText}`);
      const data = await response.json();

      console.log('Datos recibidos del backend:', data);

      const filteredData = data.map(item => ({
        cod_tipo_contacto: item.cod_tipo_contacto,
        tipo_contacto: item.tipo_contacto || 'N/A',
      }));
      setTiposContacto(filteredData);
    } catch (error) {
      console.error('Error fetching tipos de contacto:', error);
      swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo cargar la lista de tipos de contacto.' });
    }
  };

  const exportToExcel = async () => { 
    if (!filteredTiposContacto.length) {
      swal.fire({ icon: 'warning', title: 'Sin Datos', text: 'No hay datos para exportar.' });
      return;
    }
  
    const fileName = prompt("Ingrese el nombre del archivo para el reporte Excel:", "Reporte_Tipos_Contacto");
    if (!fileName) {
      console.warn('Exportación cancelada. No se proporcionó un nombre de archivo.');
      return;
    }
  
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Tipos_Contacto');
  
    // Agregar el logo con tamaño reducido y bien posicionado
    const logoPath = '/logo.jpg';
    try {
      const logoBuffer = await fetch(logoPath).then((res) => res.arrayBuffer());
      const logoId = workbook.addImage({
        buffer: logoBuffer,
        extension: 'jpeg',
      });
      worksheet.addImage(logoId, {
        tl: { col: 0.2, row: 1 }, // Posición inicial ajustada (columna A y fila 2)
        ext: { width: 120, height: 80 }, // Tamaño del logo reducido
      });
    } catch (err) {
      console.warn('No se pudo cargar el logo:', err);
    }
  
    // Encabezados y subtítulos centrados
    worksheet.mergeCells('C1:H1');
    worksheet.getCell('C1').value = "SAINT PATRICK'S ACADEMY";
    worksheet.getCell('C1').font = { size: 18, bold: true, color: { argb: '006633' } };
    worksheet.getCell('C1').alignment = { horizontal: 'center', vertical: 'middle' };
  
    worksheet.mergeCells('C2:H2');
    worksheet.getCell('C2').value = 'Reporte de Tipos de Contacto';
    worksheet.getCell('C2').font = { size: 14, bold: true };
    worksheet.getCell('C2').alignment = { horizontal: 'center', vertical: 'middle' };
  
    worksheet.mergeCells('C3:H3');
    worksheet.getCell('C3').value = 'Casa Club del periodista, Colonia del Periodista';
    worksheet.getCell('C3').font = { size: 10, color: { argb: '666666' } };
    worksheet.getCell('C3').alignment = { horizontal: 'center', vertical: 'middle' };
  
    worksheet.mergeCells('C4:H4');
    worksheet.getCell('C4').value = 'Teléfono: (504) 2234-8871 | Correo: info@saintpatrickacademy.edu';
    worksheet.getCell('C4').font = { size: 10, color: { argb: '666666' } };
    worksheet.getCell('C4').alignment = { horizontal: 'center', vertical: 'middle' };
  
    worksheet.addRow([]); // Espacio vacío debajo del encabezado
  
    // Encabezado de tabla en las columnas E y F
    const header = ['#', 'Tipo de Contacto'];
    const headerRow = worksheet.addRow(['', '', '', '', ...header]); // Desplazar el encabezado a las columnas E y F
    headerRow.eachCell((cell, colNumber) => {
      if (colNumber >= 5) { // Solo aplicar estilo a las columnas E y F
        cell.font = { bold: true, color: { argb: 'FFFFFF' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '006633' } };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      }
    });
  
    // Filas de datos centradas en las columnas E y F
    filteredTiposContacto.forEach((item, index) => {
      const row = worksheet.addRow(['', '', '', '', index + 1, item.tipo_contacto.toUpperCase()]);
      row.eachCell((cell, colNumber) => {
        if (colNumber >= 5) { // Solo aplicar estilo a las columnas E y F
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
        }
      });
      if (index % 2 === 0) {
        row.eachCell((cell, colNumber) => {
          if (colNumber >= 5) { // Alternar color solo en las columnas E y F
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E8F5E9' } };
          }
        });
      }
    });
  
    // Ajustar anchos de columnas
    worksheet.getColumn(5).width = 5; // Número (#)
    worksheet.getColumn(6).width = 30; // Tipo de Contacto
  
    try {
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, `${fileName}.xlsx`);
    } catch (err) {
      console.error('Error al generar el archivo:', err);
    }
  };  
  
  
  const exportToPDF = () => {
    const doc = new jsPDF();
    const img = new Image();
    img.src = '/logo.jpg'; // Ruta desde la carpeta public
  
    // Solicitar al usuario un nombre para el archivo
    const fileName = prompt('Ingrese el nombre del archivo (sin extensión):', 'Reporte_TiposContacto');
  
    if (!fileName) {
      // Si el usuario no proporciona un nombre, cancelar la exportación
      console.warn('Exportación cancelada. No se proporcionó un nombre de archivo.');
      return;
    }
  
    img.onload = () => {
      // Agregar el logo en la parte superior izquierda
      doc.addImage(img, 'JPEG', 10, 10, 30, 30);
  
      // Título principal del reporte
      doc.setFontSize(18);
      doc.setTextColor(0, 102, 51); // Verde
      doc.text('SAINT PATRICK\'S ACADEMY', doc.internal.pageSize.width / 2, 20, { align: 'center' });
  
      // Subtítulo
      doc.setFontSize(14);
      doc.text('Reporte de Tipos de Contacto', doc.internal.pageSize.width / 2, 30, { align: 'center' });
  
      // Información adicional (contacto)
      doc.setFontSize(10);
      doc.setTextColor(100); // Gris oscuro
      doc.text('Casa Club del periodista, Colonia del Periodista', doc.internal.pageSize.width / 2, 40, { align: 'center' });
      doc.text('Teléfono: (504) 2234-8871', doc.internal.pageSize.width / 2, 45, { align: 'center' });
      doc.text('Correo: info@saintpatrickacademy.edu', doc.internal.pageSize.width / 2, 50, { align: 'center' });
  
      // Línea divisoria debajo de la cabecera
      doc.setLineWidth(0.5);
      doc.setDrawColor(0, 102, 51); // Verde
      doc.line(10, 55, doc.internal.pageSize.width - 10, 55);
  
      // Generar la tabla de tipos de contacto
      doc.autoTable({
        startY: 60, // Ajustar la posición de inicio de la tabla
        head: [['#', 'Tipo de Contacto']], // Encabezado de la tabla
        body: filteredTiposContacto.map((item, index) => [index + 1, item.tipo_contacto.toUpperCase()]), // Datos de la tabla
        headStyles: {
          fillColor: [0, 102, 51], // Verde oscuro
          textColor: [255, 255, 255], // Blanco
          fontSize: 10,
        },
        styles: {
          fontSize: 10,
          cellPadding: 3,
        },
        alternateRowStyles: { fillColor: [240, 248, 255] }, // Azul claro para filas alternas
      });
  
      // Fecha de generación del reporte
      const date = new Date().toLocaleDateString();
      doc.setFontSize(10);
      doc.setTextColor(100); // Gris oscuro
      doc.text(`Fecha de generación: ${date}`, 10, doc.internal.pageSize.height - 10);
  
      // Guardar el archivo PDF con el nombre proporcionado
      doc.save(`${fileName}.pdf`);
    };
  
    img.onerror = () => {
      console.error('No se pudo cargar el logo. El PDF se generará sin el logo.');
      
      // Cabecera alternativa si no se carga el logo
      doc.setFontSize(18);
      doc.setTextColor(0, 102, 51);
      doc.text('SAINT PATRICK\'S ACADEMY', doc.internal.pageSize.width / 2, 20, { align: 'center' });
  
      doc.setFontSize(14);
      doc.text('Reporte de Tipos de Contacto', doc.internal.pageSize.width / 2, 30, { align: 'center' });
  
      // Tabla sin logo
      doc.autoTable({
        startY: 50,
        head: [['#', 'Tipo de Contacto']],
        body: filteredTiposContacto.map((item, index) => [index + 1, item.tipo_contacto.toUpperCase()]),
        headStyles: {
          fillColor: [0, 102, 51],
          textColor: [255, 255, 255],
          fontSize: 10,
        },
        styles: {
          fontSize: 10,
          cellPadding: 3,
        },
        alternateRowStyles: { fillColor: [240, 248, 255] },
      });
  
      const date = new Date().toLocaleDateString();
      doc.setFontSize(10);
      doc.text(`Fecha de generación: ${date}`, 10, doc.internal.pageSize.height - 10);
  
      // Guardar el archivo PDF con el nombre proporcionado
      doc.save(`${fileName}.pdf`);
    };
  };
  
  
  const handlePrintGeneral = () => {
    const printWindow = window.open('', '', 'width=800,height=600');
    const imgPath = window.location.origin + '/logo.jpg'; // Ruta relativa al logo
  
    // Asegúrate de usar `filteredTiposContacto` para solo imprimir los registros filtrados
    const dataToPrint = filteredTiposContacto.length ? filteredTiposContacto : tiposContacto;
  
    printWindow.document.write(`
      <html>
        <head>
          <title>Imprimir Reporte General</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              color: #333;
            }
            .header {
              position: relative;
              margin-bottom: 30px; /* Incrementa la separación del logo */
            }
            .header img {
              position: absolute;
              left: 10px;
              top: 5px; /* Ajusta el logo más cerca del encabezado */
              width: 100px; /* Tamaño del logo */
              height: auto;
            }
            .header .text {
              text-align: center;
              margin-left: 120px; /* Centra el texto correctamente */
            }
            .header .text h1 {
              font-size: 18px;
              color: #006633; /* Verde oscuro */
              margin: 0;
            }
            .header .text h2 {
              font-size: 14px;
              color: #006633; /* Verde oscuro */
              margin: 5px 0 0;
            }
            .info {
              text-align: center;
              font-size: 10px;
              color: #666; /* Gris oscuro */
              margin-top: 5px;
            }
            .divider {
              border-top: 0.5px solid #006633; /* Línea divisoria verde */
              margin: 20px 0; /* Aumenta la separación */
            }
            table {
              width: 100%; /* La tabla abarca todo el ancho */
              border-collapse: collapse;
              margin-top: 20px;
            }
            th, td {
              border: 1px solid #006633; /* Borde verde */
              padding: 10px;
              text-align: left; /* Texto alineado a la izquierda */
            }
            th {
              background-color: #006633; /* Verde oscuro */
              color: #fff; /* Texto blanco */
              font-size: 14px;
            }
            tr:nth-child(even) {
              background-color: #E8F5E9; /* Verde claro */
            }
            tr:nth-child(odd) {
              background-color: #f2f2f2; /* Gris claro */
            }
          </style>
        </head>
        <body>
          <div class="header">
            <img src="${imgPath}" alt="Logo" />
            <div class="text">
              <h1>SAINT PATRICK'S ACADEMY</h1>
              <h2>Reporte de Tipos de Contacto</h2>
              <div class="info">
                <p>Casa Club del periodista, Colonia del Periodista</p>
                <p>Teléfono: (504) 2234-8871 | Correo: info@saintpatrickacademy.edu</p>
              </div>
            </div>
          </div>
          <div class="divider"></div>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Tipo de Contacto</th>
              </tr>
            </thead>
            <tbody>
              ${dataToPrint.map(
                (item, index) => `
                  <tr>
                    <td>${index + 1}</td>
                    <td>${item.tipo_contacto.toUpperCase()}</td>
                  </tr>`
              ).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `);
  
    printWindow.document.close();
    printWindow.print();
  };  
  

  const exportIndividualToExcel = async (item, index) => {
    const fileName = prompt(
      "Ingrese el nombre del archivo Excel:",
      `Reporte_TipoContacto_${item.tipo_contacto}_${index + 1}`
    );
    if (!fileName) return;
  
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Reporte_TipoContacto');
  
    // Agregar el logo con tamaño reducido y bien posicionado
    const logoPath = '/logo.jpg';
    try {
      const logoBuffer = await fetch(logoPath).then((res) => res.arrayBuffer());
      const logoId = workbook.addImage({
        buffer: logoBuffer,
        extension: 'jpeg',
      });
      worksheet.addImage(logoId, {
        tl: { col: 0.2, row: 1 }, // Posición inicial ajustada (columna A y fila 2)
        ext: { width: 120, height: 80 }, // Tamaño del logo reducido
      });
    } catch (err) {
      console.warn('No se pudo cargar el logo:', err);
    }
  
    // Encabezados y subtítulos centrados
    worksheet.mergeCells('C1:H1');
    worksheet.getCell('C1').value = "SAINT PATRICK'S ACADEMY";
    worksheet.getCell('C1').font = { size: 18, bold: true, color: { argb: '006633' } };
    worksheet.getCell('C1').alignment = { horizontal: 'center', vertical: 'middle' };
  
    worksheet.mergeCells('C2:H2');
    worksheet.getCell('C2').value = 'Reporte Individual de Tipo de Contacto';
    worksheet.getCell('C2').font = { size: 14, bold: true };
    worksheet.getCell('C2').alignment = { horizontal: 'center', vertical: 'middle' };
  
    worksheet.mergeCells('C3:H3');
    worksheet.getCell('C3').value = 'Casa Club del periodista, Colonia del Periodista';
    worksheet.getCell('C3').font = { size: 10, color: { argb: '666666' } };
    worksheet.getCell('C3').alignment = { horizontal: 'center', vertical: 'middle' };
  
    worksheet.mergeCells('C4:H4');
    worksheet.getCell('C4').value = 'Teléfono: (504) 2234-8871 | Correo: info@saintpatrickacademy.edu';
    worksheet.getCell('C4').font = { size: 10, color: { argb: '666666' } };
    worksheet.getCell('C4').alignment = { horizontal: 'center', vertical: 'middle' };
  
    worksheet.addRow([]); // Espacio vacío debajo del encabezado
  
    // Encabezado de tabla en las columnas E y F
    const header = ['#', 'Tipo de Contacto'];
    const headerRow = worksheet.addRow(['', '', '', '', ...header]); // Desplazar el encabezado a las columnas E y F
    headerRow.eachCell((cell, colNumber) => {
      if (colNumber >= 5) { // Solo aplicar estilo a las columnas E y F
        cell.font = { bold: true, color: { argb: 'FFFFFF' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '006633' } };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      }
    });
  
    // Fila de datos centradas en las columnas E y F
    const row = worksheet.addRow(['', '', '', '', index + 1, item.tipo_contacto.toUpperCase()]);
    row.eachCell((cell, colNumber) => {
      if (colNumber >= 5) { // Solo aplicar estilo a las columnas E y F
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      }
    });
    row.eachCell((cell, colNumber) => {
      if (colNumber >= 5) { // Alternar color solo en las columnas E y F
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E8F5E9' } };
      }
    });
  
    // Ajustar anchos de columnas
    worksheet.getColumn(5).width = 5; // Número (#)
    worksheet.getColumn(6).width = 30; // Tipo de Contacto
  
    try {
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, `${fileName}.xlsx`);
    } catch (err) {
      console.error('Error al generar el archivo:', err);
    }
  };
  

  const exportIndividualToPDF = (item, index) => {
    const doc = new jsPDF();
    const img = new Image();
    img.src = '/logo.jpg'; // Ruta relativa al logo
  
    // Solicitar al usuario un nombre para el archivo
    const fileName = prompt(
      'Ingrese el nombre del archivo (sin extensión):',
      `Reporte_TipoContacto_${item.tipo_contacto}`
    );
    if (!fileName) {
      console.warn('Exportación cancelada. No se proporcionó un nombre de archivo.');
      return;
    }
  
    img.onload = () => {
      try {
        // Encabezado principal
        doc.addImage(img, 'JPEG', 10, 10, 30, 30);
        doc.setFontSize(18);
        doc.setTextColor(0, 102, 51);
        doc.text("SAINT PATRICK'S ACADEMY", doc.internal.pageSize.width / 2, 20, { align: 'center' });
  
        // Subtítulo
        doc.setFontSize(14);
        doc.text('Reporte de Tipo de Contacto', doc.internal.pageSize.width / 2, 30, { align: 'center' });
  
        // Información adicional
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text('Casa Club del periodista, Colonia del Periodista', doc.internal.pageSize.width / 2, 40, { align: 'center' });
        doc.text('Teléfono: (504) 2234-8871 | Correo: info@saintpatrickacademy.edu', doc.internal.pageSize.width / 2, 45, { align: 'center' });
  
        // Línea divisoria
        doc.setLineWidth(0.5);
        doc.setDrawColor(0, 102, 51);
        doc.line(10, 55, doc.internal.pageSize.width - 10, 55);
  
        // Encabezado de tabla
        doc.autoTable({
          startY: 60,
          head: [['#', 'Tipo de Contacto']],
          body: [[index + 1, item.tipo_contacto.toUpperCase()]],
          headStyles: {
            fillColor: [0, 102, 51],
            textColor: [255, 255, 255],
            fontSize: 10,
          },
          styles: {
            fontSize: 10,
            cellPadding: 3,
          },
          alternateRowStyles: { fillColor: [240, 248, 255] },
        });
  
        doc.save(`${fileName}.pdf`);
      } catch (error) {
        console.error('Error al generar el PDF:', error);
        alert('Ocurrió un error al generar el PDF.');
      }
    };
  
    img.onerror = () => {
      console.error('No se pudo cargar el logo. Generando el PDF sin logo.');
      doc.save(`${fileName}.pdf`);
    };
  };
  

  const handlePrintIndividual = (item, index) => { 
    const printWindow = window.open('', '', 'width=800,height=600');
    const imgPath = window.location.origin + '/logo.jpg'; // Ruta relativa al logo
  
    printWindow.document.write(`
      <html>
        <head>
          <title>Imprimir Tipo de Contacto</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              color: #333;
            }
            .header {
              position: relative;
              margin-bottom: 20px;
            }
            .header img {
              position: absolute;
              left: 10px;
              top: 5px; /* Acerca el logo al encabezado */
              width: 100px; /* Tamaño original del logo */
              height: auto;
            }
            .header .text {
              text-align: center;
              margin: 0; /* Centra el texto del encabezado */
            }
            .header .text h1 {
              font-size: 18px;
              color: #006633; /* Verde oscuro */
              margin: 0;
            }
            .header .text h2 {
              font-size: 14px;
              margin: 5px 0 0;
              color: #006633; /* Verde oscuro */
            }
            .info {
              text-align: center;
              font-size: 10px;
              color: #666; /* Gris oscuro */
              margin-top: 5px;
            }
            .divider {
              border-top: 0.5px solid #006633; /* Línea divisoria verde */
              margin: 15px 0;
            }
            .record {
              width: 100%; /* La tabla abarca todo el ancho */
              margin: 20px 0;
              border-collapse: collapse;
            }
            .record th, .record td {
              padding: 10px;
              border: 1px solid #006633; /* Borde verde */
              text-align: left; /* Texto alineado a la izquierda */
            }
            .record th {
              background-color: #006633; /* Verde oscuro */
              color: #fff; /* Texto blanco */
            }
            .record td {
              background-color: #f2f2f2; /* Gris claro */
            }
          </style>
        </head>
        <body>
          <div class="header">
            <img src="${imgPath}" alt="Logo" />
            <div class="text">
              <h1>SAINT PATRICK'S ACADEMY</h1>
              <h2>Reporte de Tipo de Contacto</h2>
              <div class="info">
                <p>Casa Club del periodista, Colonia del Periodista</p>
                <p>Teléfono: (504) 2234-8871</p>
                <p>Correo: info@saintpatrickacademy.edu</p>
              </div>
            </div>
          </div>
          <div class="divider"></div>
          <table class="record">
            <thead>
              <tr>
                <th>#</th>
                <th>Tipo de Contacto</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${index + 1}</td>
                <td>${item.tipo_contacto.toUpperCase()}</td>
              </tr>
            </tbody>
          </table>
        </body>
      </html>
    `);
  
    printWindow.document.close();
    printWindow.print();
  };
  
  

  const handleCreateOrUpdate = async () => {
    if (isSubmitting) return;

    const isDuplicate = tiposContacto.some(
      (item) =>
        item.tipo_contacto.toUpperCase() === nuevoTipoContacto.tipo_contacto.trim().toUpperCase() &&
        (!tipoContactoToUpdate || item.cod_tipo_contacto !== tipoContactoToUpdate.cod_tipo_contacto)
    );

    if (isDuplicate) {
      swal.fire({
        icon: 'error',
        title: 'Error',
        text: `El tipo de contacto "${nuevoTipoContacto.tipo_contacto.trim()}" ya existe`,
      });
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(true);
    const url = tipoContactoToUpdate
      ? `http://localhost:4000/api/tipoContacto/actualizarTipoContacto/${tipoContactoToUpdate.cod_tipo_contacto}`
      : 'http://localhost:4000/api/tipoContacto/crearTipoContacto';
    const method = tipoContactoToUpdate ? 'PUT' : 'POST';
    const body = JSON.stringify({ tipo_contacto: nuevoTipoContacto.tipo_contacto.trim() });

    if (!nuevoTipoContacto.tipo_contacto.trim()) {
      swal.fire({ icon: 'error', title: 'Error', text: 'El campo "Tipo de Contacto" no puede estar vacío.' });
      setIsSubmitting(false);
      return;
    }

    const vocalRegex = /[aeiouáéíóúü]/i;
    if (!vocalRegex.test(nuevoTipoContacto.tipo_contacto)) {
      swal.fire({ icon: 'error', title: 'Error', text: 'El "Tipo de Contacto" debe contener al menos una vocal.' });
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body });
      const result = await response.json();

      if (response.ok) {
        if (tipoContactoToUpdate) {
          setTiposContacto((prevTipos) =>
            prevTipos.map((item) =>
              item.cod_tipo_contacto === tipoContactoToUpdate.cod_tipo_contacto
                ? { ...item, tipo_contacto: nuevoTipoContacto.tipo_contacto.trim() }
                : item
            )
          );
        } else {
          setTiposContacto((prevTipos) => [
            ...prevTipos,
            { cod_tipo_contacto: result.cod_tipo_contacto, tipo_contacto: nuevoTipoContacto.tipo_contacto.trim() },
          ]);
        }
        setModalVisible(false);
        setNuevoTipoContacto({ tipo_contacto: '' });
        setTipoContactoToUpdate(null);
        swal.fire({
          icon: 'success',
          title: tipoContactoToUpdate ? 'Tipo de contacto actualizado' : 'Tipo de contacto creado',
          text: result.Mensaje || 'Operación realizada con éxito',
        });
      } else {
        swal.fire({ icon: 'error', title: 'Error', text: result.Mensaje });
      }
    } catch (error) {
      console.error('Error:', error);
      swal.fire({ icon: 'error', title: 'Error', text: 'Error en el servidor.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTipoContacto = async (cod_tipo_contacto, tipo_contacto) => {
    try {
      const confirmResult = await swal.fire({
        title: 'Confirmar Eliminación',
        html: `¿Estás seguro de que deseas eliminar el tipo de contacto: <strong>${tipo_contacto || 'N/A'}</strong>?`,
        showCancelButton: true,
        confirmButtonColor: '#FF6B6B',
        cancelButtonColor: '#6C757D',
        cancelButtonText: 'Cancelar',
        confirmButtonText: '<i class="fa fa-trash"></i> Eliminar',
        reverseButtons: true,
        focusCancel: true,
      });

      if (!confirmResult.isConfirmed) return;

      const response = await fetch(`http://localhost:4000/api/tipoContacto/eliminarTipoContacto/${encodeURIComponent(cod_tipo_contacto)}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (response.ok) {
        setTiposContacto((prevTipos) =>
          prevTipos.filter((item) => item.cod_tipo_contacto !== cod_tipo_contacto)
        );
        swal.fire({
          icon: 'success',
          title: 'Tipo de contacto eliminado',
          text: result.Mensaje || 'Eliminado correctamente',
        });
      } else {
        throw new Error(result.Mensaje || 'Error al eliminar');
      }
    } catch (error) {
      console.error('Error eliminando el tipo de contacto:', error);
      swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'No se pudo eliminar el tipo de contacto.',
      });
    }
  };

  const handleRecordsPerPageChange = (e) => {
    setRecordsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const handleSearch = (e) => setSearchTerm(e.target.value);

  const filteredTiposContacto = tiposContacto.filter((item) =>
    item.tipo_contacto.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.cod_tipo_contacto.toString().includes(searchTerm)
  );

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredTiposContacto.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredTiposContacto.length / recordsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <CContainer>
      <CRow className="align-items-center mb-5">
        <CCol xs="8" md="9"><h1>Mantenimiento de Tipos de Contacto</h1></CCol>
        <CCol xs="4" md="3" className="text-end">
          <CButton style={{ backgroundColor: '#4B6251', color: 'white' }} onClick={() => { setModalVisible(true); setTipoContactoToUpdate(null); setNuevoTipoContacto({ tipo_contacto: '' }); }}>
            <CIcon icon={cilPlus} /> Nuevo
          </CButton>
          <CDropdown className="ms-2">
  <CDropdownToggle style={{ backgroundColor: '#6C8E58', color: 'white' }}>
    <CIcon icon={cilDescription} /> Reporte
  </CDropdownToggle>
  <CDropdownMenu>
    <CDropdownItem onClick={exportToExcel}>
      <i className="fa fa-file-excel-o" style={{ marginRight: '5px' }}></i> Descargar en Excel
    </CDropdownItem>
    <CDropdownItem onClick={exportToPDF}>
      <i className="fa fa-file-pdf-o" style={{ marginRight: '5px' }}></i> Descargar en PDF
    </CDropdownItem>
    <CDropdownItem onClick={handlePrintGeneral}>
      <CIcon icon={cilPrint} /> Imprimir
    </CDropdownItem>
  </CDropdownMenu>
</CDropdown>
          <div className="mt-2" style={{ textAlign: 'right' }}>
            <span>Mostrar </span>
            <CFormSelect
              value={recordsPerPage}
              onChange={handleRecordsPerPageChange}
              style={{ maxWidth: '70px', display: 'inline-block', margin: '0 5px' }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </CFormSelect>
            <span> registros</span>
          </div>
        </CCol>
      </CRow>

      <CInputGroup className="mb-3" style={{ maxWidth: '400px' }}>
        <CInputGroupText><CIcon icon={cilSearch} /></CInputGroupText>
        <CFormInput placeholder="Buscar tipo contacto...." onChange={handleSearch} value={searchTerm} />
        <CButton
          onClick={() => setSearchTerm('')}
          style={{
            border: '2px solid #d3d3d3',
            color: '#4B6251',
            backgroundColor: '#f0f0f0',
          }}
        >
          <i className="fa fa-broom" style={{ marginRight: '5px' }}></i> Limpiar
        </CButton>
      </CInputGroup>

      <div className="table-container" style={{ maxHeight: '400px', overflowY: 'scroll', marginBottom: '20px' }}>
        <CTable striped bordered hover>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell>#</CTableHeaderCell>
              <CTableHeaderCell>Tipo de Contacto</CTableHeaderCell>
              <CTableHeaderCell>Acciones</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {currentRecords.map((item, index) => (
              <CTableRow key={item.cod_tipo_contacto}>
                <CTableDataCell>{index + 1 + indexOfFirstRecord}</CTableDataCell>
                <CTableDataCell>{item.tipo_contacto}</CTableDataCell>
                <CTableDataCell>
                  <CButton color="warning" onClick={() => { setTipoContactoToUpdate(item); setModalVisible(true); setNuevoTipoContacto({ tipo_contacto: item.tipo_contacto }); }}>
                    <CIcon icon={cilPen} />
                  </CButton>
                  <CButton
                    color="danger"
                    onClick={() => handleDeleteTipoContacto(item.cod_tipo_contacto, item.tipo_contacto)}
                    className="ms-2"
                  >
                    <CIcon icon={cilTrash} />
                  </CButton>

                  <CDropdown className="ms-2">
                    <CDropdownToggle color="info">
                      <CIcon icon={cilDescription} />
                    </CDropdownToggle>
                    <CDropdownMenu>
                      <CDropdownItem onClick={() => exportIndividualToExcel(item, index)}>
                        <i className="fa fa-file-excel-o" style={{ marginRight: '5px' }}></i> Descargar en Excel
                      </CDropdownItem>
                      <CDropdownItem onClick={() => exportIndividualToPDF(item, index)}>
                        <i className="fa fa-file-pdf-o" style={{ marginRight: '5px' }}></i> Descargar en PDF
                      </CDropdownItem>
                      <CDropdownItem onClick={() => handlePrintIndividual(item, index)}>
                        <CIcon icon={cilPrint} /> Imprimir
                      </CDropdownItem>
                    </CDropdownMenu>
                  </CDropdown>
                </CTableDataCell>
              </CTableRow>
            ))}
          </CTableBody>
        </CTable>
      </div>

      <CPagination align="center" className="my-3">
        <CButton
          style={{
            backgroundColor: '#7fa573',
            color: 'white',
            marginRight: '20px',
          }}
          onClick={() => paginate(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Anterior
        </CButton>
        <CButton
          style={{
            backgroundColor: '#7fa573',
            color: 'white',
          }}
          onClick={() => paginate(currentPage + 1)}
          disabled={currentPage === totalPages || filteredTiposContacto.length === 0}
        >
          Siguiente
        </CButton>
        <span style={{ marginLeft: '10px', color: 'black', fontSize: '16px' }}>
          Página {currentPage} de {totalPages}
        </span>
      </CPagination>

      <CModal visible={modalVisible} onClose={() => setModalVisible(false)}>
        <CModalHeader><CModalTitle>{tipoContactoToUpdate ? 'Actualizar Tipo de Contacto' : 'Crear Nuevo Tipo de Contacto'}</CModalTitle></CModalHeader>
        <CModalBody>
          <CInputGroup className="mb-3">
            <CInputGroupText style={{ backgroundColor: '#f0f0f0', color: 'black' }}>
              Tipo Contacto
            </CInputGroupText>
            <CFormInput
              placeholder="Tipo de Contacto"
              value={nuevoTipoContacto.tipo_contacto}
              onChange={(e) => {
                let value = e.target.value.replace(/[0-9]/g, ''); // Elimina números
                value = value.replace(/\s{2,}/g, ' '); // Permite solo un espacio entre palabras
                setNuevoTipoContacto({ tipo_contacto: value.toUpperCase() }); // Convierte a mayúsculas
              }}
              onKeyDown={(e) => {
                if (e.key === ' ') {
                  const inputValue = nuevoTipoContacto.tipo_contacto;
                  if (inputValue.endsWith(' ') || inputValue === '') {
                    e.preventDefault(); // Bloquea la tecla de espacio si ya hay un espacio al final o si el input está vacío
                  }
                }
                // Bloquea la entrada si se alcanza el límite de 50 caracteres
                if (nuevoTipoContacto.tipo_contacto.length >= 50 && e.key !== 'Backspace' && e.key !== 'Delete') {
                  e.preventDefault();
                }
              }}
            />
          </CInputGroup>
        </CModalBody>

        <CModalFooter>
          <CButton color="secondary" onClick={() => setModalVisible(false)}>Cancelar</CButton>
          <CButton
            onClick={handleCreateOrUpdate}
            style={tipoContactoToUpdate
              ? { backgroundColor: '#FFD700', color: 'white' }
              : { backgroundColor: '#4B6251', color: 'white' }
            }
          >
            <CIcon icon={tipoContactoToUpdate ? cilPen : cilSave} />
            &nbsp;
            {tipoContactoToUpdate ? 'Actualizar' : 'Guardar'}
          </CButton>
        </CModalFooter>
      </CModal>
    </CContainer>
  );
};

export default ListaTipoContacto;
