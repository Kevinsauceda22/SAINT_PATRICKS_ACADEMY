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

const ListaGeneroPersona = () => {
  const [generos, setGeneros] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [nuevoGenero, setNuevoGenero] = useState({ Cod_genero: '', Tipo_genero: '' });
  const [generoToUpdate, setGeneroToUpdate] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(5);

  useEffect(() => {
    fetchGeneros();
  }, []);

  const fetchGeneros = async () => {
    try {
      const response = await fetch('http://74.50.68.87/api/generoPersona/obtenerGeneroPersona');
      if (!response.ok) {
        throw new Error(`Error en la solicitud: ${response.statusText}`);
      }
      const data = await response.json();
      setGeneros(data);
    } catch (error) {
      console.error('Error fetching generos:', error);
      swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo cargar la lista de géneros. Intenta más tarde.',
      });
    }
  };

  const exportToExcel = async () => {
    try {
      if (!currentRecords || currentRecords.length === 0) {
        swal.fire({ icon: 'warning', title: 'Sin Datos', text: 'No hay datos para exportar.' });
        return;
      }
  
      const fileName = prompt("Ingrese el nombre del archivo para el reporte Excel:", "Reporte_Géneros");
      if (!fileName) {
        console.warn('Exportación cancelada. No se proporcionó un nombre de archivo.');
        return;
      }
  
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Géneros');
  
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
      worksheet.getCell('C2').value = 'Reporte de Géneros';
      worksheet.getCell('C2').font = { size: 14, bold: true, color: { argb: '006633' } };
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
      const header = ['#', 'Tipo de Género'];
      const headerRow = worksheet.addRow(['', '', '', '', ...header]); // Desplazar el encabezado a las columnas E y F
      headerRow.eachCell((cell, colNumber) => {
        if (colNumber >= 5) { // Solo aplicar estilo a las columnas E y F
          cell.font = { bold: true, color: { argb: 'FFFFFF' } };
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '006633' } };
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
        }
      });
  
      // Filas de datos centradas en las columnas E y F
      currentRecords.forEach((item, index) => {
        const row = worksheet.addRow(['', '', '', '', index + 1, item.Tipo_genero.toUpperCase()]);
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
      worksheet.getColumn(6).width = 30; // Tipo de Género
  
      try {
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, `${fileName}.xlsx`);
      } catch (err) {
        console.error('Error al generar el archivo:', err);
      }
    } catch (error) {
      console.error('Error al exportar a Excel:', error);
      swal.fire({ icon: 'error', title: 'Error', text: 'Hubo un problema al exportar a Excel.' });
    }
  };
  
  const exportToPDF = () => {
    const doc = new jsPDF();
    const img = new Image();
    img.src = '/logo.jpg'; // Ruta del logo

    const fileName = prompt('Ingrese el nombre del archivo (sin extensión):', 'Reporte_Generos');
    if (!fileName) {
        console.warn('Exportación cancelada. No se proporcionó un nombre de archivo.');
        return;
    }

    // Usa los registros actuales de la tabla
    const datosVista = currentRecords;

    if (!datosVista || datosVista.length === 0) {
        alert('No hay datos visibles para exportar.');
        return;
    }

    img.onload = () => {
        try {
            doc.addImage(img, 'JPEG', 10, 10, 30, 30);

            doc.setFontSize(18);
            doc.setTextColor(0, 102, 51);
            doc.text("SAINT PATRICK'S ACADEMY", doc.internal.pageSize.width / 2, 20, { align: 'center' });
            doc.setFontSize(14);
            doc.text('Reporte de Géneros', doc.internal.pageSize.width / 2, 30, { align: 'center' });
            doc.setFontSize(10);
            doc.setTextColor(100);
            doc.text('Casa Club del periodista, Colonia del Periodista', doc.internal.pageSize.width / 2, 40, { align: 'center' });
            doc.text('Teléfono: (504) 2234-8871', doc.internal.pageSize.width / 2, 45, { align: 'center' });
            doc.text('Correo: info@saintpatrickacademy.edu', doc.internal.pageSize.width / 2, 50, { align: 'center' });

            doc.setLineWidth(0.5);
            doc.setDrawColor(0, 102, 51);
            doc.line(10, 55, doc.internal.pageSize.width - 10, 55);

            doc.autoTable({
                startY: 60,
                head: [['#', 'Tipo de Género']],
                body: datosVista.map((genero, index) => [index + 1, genero.Tipo_genero]),
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
            doc.setTextColor(100);
            doc.text(`Fecha de generación: ${date}`, 10, doc.internal.pageSize.height - 10);

            doc.save(`${fileName}.pdf`);
        } catch (error) {
            console.error('Error al generar el PDF:', error);
            alert('Ocurrió un error al generar el PDF.');
        }
    };

    img.onerror = () => {
        console.error('No se pudo cargar el logo. El PDF se generará sin el logo.');
        alert('No se pudo cargar el logo. El PDF no se generará.');
    };
};


const handlePrintGeneral = () => {
  const printWindow = window.open('', '', 'width=800,height=600');
  const imgPath = window.location.origin + '/logo.jpg'; // Ruta relativa al logo

  // Usa los registros visibles en la tabla actual
  const dataToPrint = currentRecords.length ? currentRecords : generos;

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
            <h2>Reporte de Géneros</h2>
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
              <th>Tipo de Género</th>
            </tr>
          </thead>
          <tbody>
            ${dataToPrint.map(
              (item, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${item.Tipo_genero.toUpperCase()}</td>
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

const exportToPDFIndividual = (genero) => {
  const doc = new jsPDF();
  const img = new Image();
  img.src = '/logo.jpg'; // Ruta del logo

  img.onload = () => {
    try {
      doc.addImage(img, 'JPEG', 10, 10, 30, 30);

      doc.setFontSize(18);
      doc.setTextColor(0, 102, 51);
      doc.text("SAINT PATRICK'S ACADEMY", doc.internal.pageSize.width / 2, 20, { align: 'center' });
      doc.setFontSize(14);
      doc.text('Reporte Individual - Género', doc.internal.pageSize.width / 2, 30, { align: 'center' });
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text('Casa Club del periodista, Colonia del Periodista', doc.internal.pageSize.width / 2, 40, { align: 'center' });
      doc.text('Teléfono: (504) 2234-8871 | Correo: info@saintpatrickacademy.edu', doc.internal.pageSize.width / 2, 45, { align: 'center' });

      doc.setLineWidth(0.5);
      doc.setDrawColor(0, 102, 51);
      doc.line(10, 50, doc.internal.pageSize.width - 10, 50);

      doc.autoTable({
        startY: 60,
        head: [['#', 'Tipo de Género']],
        body: [[1, genero.Tipo_genero]],
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
      doc.setTextColor(100);
      doc.text(`Fecha de generación: ${date}`, 10, doc.internal.pageSize.height - 10);

      doc.save(`Reporte_Individual_${genero.Tipo_genero}.pdf`);
    } catch (error) {
      console.error('Error al generar el PDF:', error);
      alert('Ocurrió un error al generar el PDF.');
    }
  };

  img.onerror = () => {
    console.error('No se pudo cargar el logo. El PDF se generará sin el logo.');
    alert('No se pudo cargar el logo.');
  };
};

const exportToExcelIndividual = async (genero, index) => {
  const fileName = prompt(
    "Ingrese el nombre del archivo Excel:",
    `Reporte_Género_${genero.Tipo_genero}_${index + 1}`
  );
  if (!fileName) return;

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Reporte_Género');

  // Agregar el logo con tamaño reducido y bien posicionado
  const logoPath = '/logo.jpg';
  try {
    const logoBuffer = await fetch(logoPath).then((res) => res.arrayBuffer());
    const logoId = workbook.addImage({
      buffer: logoBuffer,
      extension: 'jpeg',
    });
    worksheet.addImage(logoId, {
      tl: { col: 0.2, row: 1 }, // Posición inicial ajustada
      ext: { width: 120, height: 80 }, // Tamaño reducido y proporcional
    });
  } catch (err) {
    console.warn('No se pudo cargar el logo:', err);
  }

  // Encabezados y subtítulos centrados
  worksheet.mergeCells('C1:G1');
  worksheet.getCell('C1').value = "SAINT PATRICK'S ACADEMY";
  worksheet.getCell('C1').font = { size: 18, bold: true, color: { argb: '006633' } };
  worksheet.getCell('C1').alignment = { horizontal: 'center', vertical: 'middle' };

  worksheet.mergeCells('C2:G2');
  worksheet.getCell('C2').value = 'Reporte Individual - Género';
  worksheet.getCell('C2').font = { size: 14, bold: true, color: { argb: '006633' } }; // Título en verde
  worksheet.getCell('C2').alignment = { horizontal: 'center', vertical: 'middle' };

  worksheet.mergeCells('C3:G3');
  worksheet.getCell('C3').value = 'Casa Club del periodista, Colonia del Periodista';
  worksheet.getCell('C3').font = { size: 10, color: { argb: '666666' } };
  worksheet.getCell('C3').alignment = { horizontal: 'center', vertical: 'middle' };

  worksheet.mergeCells('C4:G4');
  worksheet.getCell('C4').value = 'Teléfono: (504) 2234-8871 | Correo: info@saintpatrickacademy.edu';
  worksheet.getCell('C4').font = { size: 10, color: { argb: '666666' } };
  worksheet.getCell('C4').alignment = { horizontal: 'center', vertical: 'middle' };

  worksheet.addRow([]); // Espacio vacío debajo del encabezado

  // Encabezado de tabla en las columnas E y F
  const header = ['#', 'Tipo de Género'];
  const headerRow = worksheet.addRow(['', '', '', '', ...header]); // Mantiene la posición de la tabla en las columnas E y F
  headerRow.eachCell((cell, colNumber) => {
    if (colNumber >= 5) { // Solo aplicar estilo a las columnas E y F
      cell.font = { bold: true, color: { argb: 'FFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '006633' } };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    }
  });

  // Asegurarse de que el índice sea válido y correcto
  const registroNumero = index + 1; // Calcula correctamente el número del registro

  // Fila de datos centradas en las columnas E y F
  const row = worksheet.addRow(['', '', '', '', registroNumero, genero.Tipo_genero.toUpperCase()]);
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
  worksheet.getColumn(6).width = 30; // Tipo de Género

  try {
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `${fileName}.xlsx`);
  } catch (err) {
    console.error('Error al generar el archivo:', err);
  }
};

const handlePrintIndividual = (genero) => {
  const printWindow = window.open('', '', 'width=800,height=600');
  const imgPath = window.location.origin + '/logo.jpg';

  printWindow.document.write(`
    <html>
      <head>
        <title>Reporte Individual</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
          .header img { width: 100px; height: auto; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #006633; padding: 10px; text-align: left; }
          th { background-color: #006633; color: #fff; }
        </style>
      </head>
      <body>
        <div class="header">
          <img src="${imgPath}" alt="Logo" />
          <h1>SAINT PATRICK'S ACADEMY</h1>
          <h2>Reporte Individual</h2>
        </div>
        <table>
          <tr><th>#</th><th>Tipo de Género</th></tr>
          <tr><td>1</td><td>${genero.Tipo_genero.toUpperCase()}</td></tr>
        </table>
      </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.print();
};

 
  const handleCreateOrUpdate = async () => {
    const isUpdating = !!generoToUpdate; // Detectar si estamos actualizando
    const genero = isUpdating ? generoToUpdate : nuevoGenero;
  
    if (!genero.Tipo_genero.trim()) {
      swal.fire({
        icon: 'warning',
        title: 'Campo vacío',
        text: 'El campo "Tipo de Género" no puede estar vacío.',
      });
      return;
    }
  
    try {
      const url = isUpdating
        ? `http://74.50.68.87/api/generoPersona/actualizarGeneroPersona/${generoToUpdate.Cod_genero}`
        : 'http://74.50.68.87/api/generoPersona/crearGeneroPersona';
      const method = isUpdating ? 'PUT' : 'POST';
  
      console.log('Enviando datos:', JSON.stringify({ Tipo_genero: genero.Tipo_genero.trim() })); // Debug
  
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Tipo_genero: genero.Tipo_genero.trim() }),
      });
  
      const result = await response.json();
  
      if (response.ok) {
        if (isUpdating) {
          setGeneros((prevGeneros) =>
            prevGeneros.map((item) =>
              item.Cod_genero === generoToUpdate.Cod_genero
                ? { ...item, Tipo_genero: genero.Tipo_genero.trim() }
                : item
            )
          );
        } else {
          setGeneros((prevGeneros) => [
            ...prevGeneros,
            { Cod_genero: result.Cod_genero, Tipo_genero: genero.Tipo_genero.trim() },
          ]);
        }
  
        swal.fire({
          icon: 'success',
          title: isUpdating ? 'Género actualizado' : 'Género creado',
          text: `El género fue ${isUpdating ? 'actualizado' : 'creado'} exitosamente.`,
        });
  
        setModalVisible(false);
        setNuevoGenero({ Cod_genero: '', Tipo_genero: '' });
        setGeneroToUpdate(null);
      } else {
        throw new Error(result.message || 'No se pudo realizar la operación.');
      }
    } catch (error) {
      console.error('Error en la operación:', error);
      swal.fire({
        icon: 'error',
        title: 'Error en el servidor',
        text: error.message || 'Inténtalo más tarde.',
      });
    }
  };
  
  const handleDeleteGenero = async (Cod_genero, Tipo_genero) => {
    try {
      const confirmResult = await swal.fire({
        title: 'Confirmar Eliminación',
        html: `¿Estás seguro de que deseas eliminar el género: <strong>${Tipo_genero}</strong>?`, // Muestra correctamente el valor
        showCancelButton: true,
        confirmButtonColor: '#FF6B6B',
        cancelButtonColor: '#6C757D',
        cancelButtonText: 'Cancelar',
        confirmButtonText: '<i class="fa fa-trash"></i> Eliminar',
        reverseButtons: true,
        focusCancel: true,
      });
  
      if (!confirmResult.isConfirmed) return;
  
      const response = await fetch(
        `http://74.50.68.87/api/generoPersona/eliminarGeneroPersona/${encodeURIComponent(Cod_genero)}`,
        { method: 'DELETE' }
      );
  
      const result = await response.json();
  
      if (response.ok) {
        fetchGeneros();
        swal.fire({
          icon: 'success',
          title: 'Género eliminado',
          text: `El género "${Tipo_genero}" fue eliminado correctamente.`, // Mensaje de éxito con el valor
        });
      } else {
        throw new Error(result.Mensaje || `No se pudo eliminar el género "${Tipo_genero}".`);
      }
    } catch (error) {
      console.error('Error eliminando el género:', error);
      swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || `No se pudo eliminar el género "${Tipo_genero}".`,
      });
    }
  };
  


  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  const handleRecordsPerPageChange = (e) => {
    setRecordsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const filteredGeneros = generos.filter((genero) =>
    genero.Tipo_genero ? genero.Tipo_genero.toLowerCase().includes(searchTerm.toLowerCase()) : false
  );

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredGeneros
  .slice(indexOfFirstRecord, indexOfLastRecord); // Obtener los registros actuales según la paginación

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <CContainer>
      <CRow className="align-items-center mb-5">
        <CCol xs="8" md="9"><h1>Mantenimieno Géneros</h1></CCol>
        <CCol xs="4" md="3" className="text-end">
          <CButton style={{ backgroundColor: '#4B6251', color: 'white' }} onClick={() => {
            setModalVisible(true);
            setGeneroToUpdate(null);
          }}>
            <CIcon icon={cilPlus} /> Nuevo
          </CButton>
          <CDropdown>
  <CDropdownToggle style={{ backgroundColor: '#6C8E58', color: 'white', marginLeft: '10px' }}>
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
      <CIcon icon={cilPrint} style={{ marginRight: '5px' }} /> Imprimir
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
        <CFormInput placeholder="Buscar género persona...." onChange={handleSearch} value={searchTerm} />
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
            <CTableHeaderCell>Tipo de Género</CTableHeaderCell>
            <CTableHeaderCell>Acciones</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
  {currentRecords.map((genero, index) => (
    <CTableRow key={genero.Cod_genero}>
      <CTableDataCell>{index + 1 + (currentPage - 1) * recordsPerPage}</CTableDataCell>
      <CTableDataCell>{genero.Tipo_genero}</CTableDataCell>
      <CTableDataCell>
        {/* Botón de editar */}
        <CButton
          color="warning"
          size="sm"
          onClick={() => {
            setGeneroToUpdate(genero);
            setModalVisible(true);
          }}
        >
          <CIcon icon={cilPen} />
        </CButton>

        {/* Botón de eliminar */}
        <CButton
          color="danger"
          size="sm"
          style={{ marginLeft: '5px' }}
          onClick={() => handleDeleteGenero(genero.Cod_genero, genero.Tipo_genero)}
        >
          <CIcon icon={cilTrash} />
        </CButton>

        {/* Botón desplegable de reportes con flecha en negro */}
        <CDropdown variant="btn-group" style={{ marginLeft: '5px' }}>
          <CDropdownToggle
            size="sm"
            style={{
              backgroundColor: '#007bff', // Azul exacto
              color: 'white',
              border: 'none',
            }}
            className="dropdown-toggle-black" // Clase personalizada
          >
            <CIcon icon={cilDescription} style={{ color: 'black' }} /> {/* Ícono en negro */}
          </CDropdownToggle>
          <CDropdownMenu>
            <CDropdownItem onClick={() => exportToExcelIndividual(genero)}>
              <CIcon icon="cil-file-excel" className="me-2" />
              Descargar en Excel
            </CDropdownItem>
            <CDropdownItem onClick={() => exportToPDFIndividual(genero)}>
              <CIcon icon="cil-file-pdf" className="me-2" />
              Descargar en PDF
            </CDropdownItem>
            <CDropdownItem onClick={() => handlePrintIndividual(genero)}>
              <CIcon icon={cilPrint} className="me-2" />
              Imprimir
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
      backgroundColor: '#7fa573', // Verde claro
      color: 'white',
      padding: '10px 20px',
      marginRight: '10px',
      border: 'none',
      borderRadius: '5px',
    }}
    onClick={() => paginate(currentPage - 1)}
    disabled={currentPage === 1}
  >
    Anterior
  </CButton>
  <CButton
    style={{
      backgroundColor: '#7fa573', // Verde claro
      color: 'white',
      padding: '10px 20px',
      border: 'none',
      borderRadius: '5px',
    }}
    onClick={() => paginate(currentPage + 1)}
    disabled={indexOfLastRecord >= filteredGeneros.length}
  >
    Siguiente
  </CButton>
  <span
    style={{
      marginLeft: '15px',
      fontSize: '16px',
      color: '#333', // Texto gris oscuro
    }}
  >
    Página {currentPage} de {Math.ceil(filteredGeneros.length / recordsPerPage)}
  </span>
</CPagination>


      <CModal visible={modalVisible} onClose={() => {
        setModalVisible(false);
        setGeneroToUpdate(null);
      }}>
        <CModalHeader>
          <CModalTitle>{generoToUpdate ? 'Actualizar Género' : 'Crear Nuevo Género'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CInputGroup className="mb-3">
            <CInputGroupText>Tipo de Género</CInputGroupText>
            <CFormInput
              placeholder="Ingrese el tipo de género"
              value={generoToUpdate ? generoToUpdate.Tipo_genero : nuevoGenero.Tipo_genero}
              onChange={(e) => {
                if (generoToUpdate) {
                  setGeneroToUpdate({ ...generoToUpdate, Tipo_genero: e.target.value });
                } else {
                  setNuevoGenero({ ...nuevoGenero, Tipo_genero: e.target.value });
                }
              }}
            />
          </CInputGroup>
        </CModalBody>
        <CModalFooter>
          <CButton
            color="secondary"
            onClick={() => {
              setModalVisible(false);
              setGeneroToUpdate(null);
            }}
          >
            Cancelar
          </CButton>
          <CButton
  style={generoToUpdate
    ? { backgroundColor: '#FFD700', color: 'white' } // Estilo para actualizar
    : { backgroundColor: '#4B6251', color: 'white' } // Estilo para guardar
  }
  onClick={handleCreateOrUpdate} // Llamar a la función unificada
>
  <CIcon icon={generoToUpdate ? cilPen : cilSave} /> {/* Icono dinámico */}
  {generoToUpdate ? 'Actualizar' : 'Guardar'} {/* Texto dinámico */}
</CButton>

        </CModalFooter>
      </CModal>
    </CContainer>
  );
};

export default ListaGeneroPersona;
