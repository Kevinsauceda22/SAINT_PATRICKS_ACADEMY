import React, { useEffect, useState } from 'react';
import { CIcon } from '@coreui/icons-react';
import { cilPlus, cilFile, cilSpreadsheet, cilDescription, cilSave, cilX, cilCheck, cilPen, cilInfo } from '@coreui/icons';
import Swal from 'sweetalert2';
import logo from 'src/assets/brand/logo_saint_patrick.png'
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import {
    CTable,
    CTableHead,
    CTableRow,
    CTableHeaderCell,
    CCol,
    CRow,
    CTableBody,
    CDropdown,
    CDropdownItem,
    CDropdownMenu,
    CDropdownToggle,
    CTableDataCell,
    CModal,
    CModalHeader,
    CModalTitle,
    CModalBody,
    CModalFooter,
    CButton,
    CFormSelect,
    CSpinner
} from '@coreui/react';
import usePermission from '../../../../context/usePermission';
import AccessDenied from "../AccessDenied/AccessDenied"
const ListaPonderacionesCiclos = () => {
    const { canSelect, canInsert, canUpdate } = usePermission('ListaPonderacionesCiclos');
    const [ponderacionesciclos, setPonderacionesCiclos] = useState([]);
    const [ponderaciones, setPonderaciones] = useState([]);
    const [ciclos, setCiclos] = useState([]);
    const [selectedCiclo, setSelectedCiclo] = useState('');
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [assignModalVisible, setAssignModalVisible] = useState(false);
    const [nuevaponderaciones, setnuevaPonderaciones] = useState('');
    const [nuevaponderacionesciclos, setnuevaPonderacionesCiclos] = useState('');
    const [cicloParaAsignar, setCicloParaAsignar] = useState(null);
    const [editIndex, setEditIndex] = useState(null); // Índice del ciclo en edición
    const [editedData, setEditedData] = useState({}); // Datos editados
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    useEffect(() => {
        fetchCiclos();
        fetchPonderaciones();
    }, []);

    const fetchCiclos = async () => {
        try {
            const response = await fetch('http://localhost:4000/api/ciclos/verCiclos');
            const data = await response.json();
            setCiclos(data);
        } catch (error) {
            console.error('Error al obtener los ciclos:', error);
        }
    };

    const getCicloName = (cicloId) => {
        if (!ciclos || ciclos.length === 0 || !cicloId) {
            return "Ciclo no encontrado";
        }
        const ciclo = ciclos.find((c) => c.Cod_ciclo === cicloId);
        return ciclo ? ciclo.Nombre_ciclo : "Ciclo no encontrado";
    };

    const fetchPonderaciones = async () => {
        try {
            const response = await fetch('http://localhost:4000/api/ponderaciones/verPonderaciones');
            const data = await response.json();
            setPonderaciones(data);
        } catch (error) {
            console.error('Error al obtener las ponderaciones:', error);
        }
    };

    const getPonderacionName = (codponderacion) => {
        if (!ponderaciones.length) return 'Ponderaciones no disponibles';
        const ponderacion = ponderaciones.find((c) => c.Cod_ponderacion === codponderacion);
        return ponderacion ? ponderacion.Descripcion_ponderacion : 'Ponderacion no encontrada';
    };

    const fetchPonderacionCiclo = async (codCiclo) => {
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:4000/api/ponderacionCiclo/verPonderacionesCiclos/${codCiclo}`);
            const data = await response.json();
            setPonderacionesCiclos(data);
            setSelectedCiclo(codCiclo); // Guardar el ciclo seleccionado
            setModalVisible(true);
        } catch (error) {
            console.error('Error al obtener los datos:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenAssignModal = (ciclo) => {
        setCicloParaAsignar(ciclo);
        setAssignModalVisible(true);
    };

    const handleEditClick = (index, ponderacionCiclo) => {
        setEditIndex(index); // Establece el índice de edición
        setEditedData(ponderacionCiclo); // Inicializa los datos con los del ciclo actual
    };

    const reseteditdata = () => setEditedData({}); // Resetea los datos editados

    const asignarPonderacion = async () => {
        if (!nuevaponderaciones || nuevaponderaciones === "") {
            Swal.fire('Error', 'Por favor seleccione una ponderación', 'error');
            return false;
        }

        // Aquí podrías también verificar si el valor es un número y no una cadena vacía
        if (isNaN(nuevaponderaciones) || nuevaponderaciones <= 0) {
            Swal.fire('Error', 'La ponderación seleccionada no es válida.', 'error');
            return false;
        }

        if (isNaN(nuevaponderacionesciclos) || nuevaponderacionesciclos <= 0.5 || nuevaponderacionesciclos > 100) {
            Swal.fire('Error', 'El puntaje debe ser un número entre 0.1 y 100', 'error');
            return false;
        }

        try {
            const response = await fetch('http://localhost:4000/api/ponderacionCiclo/crearPonderacionesCiclos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    Cod_ponderacion: nuevaponderaciones,
                    Cod_ciclo: cicloParaAsignar.Cod_ciclo,
                    Valor: nuevaponderacionesciclos
                }),
            });

            if (response.ok) {
                Swal.fire('¡Éxito!', 'Ponderación asignada correctamente', 'success');
                setAssignModalVisible(false);
                setnuevaPonderaciones('');
                setnuevaPonderacionesCiclos('');
                Swal.fire('¡Éxito!', 'Se ha asignado la ponderación correctamente', 'success');
            } else {
                const errorData = await response.json();
                console.error('Error al asignar ponderación:', errorData);
                // Aquí ya no necesitas comprobar errorData.sqlMessage porque ahora solo envía Mensaje genérico
                if (errorData.Mensaje) {
                    Swal.fire('Error', errorData.Mensaje, 'error'); // Esto mostrará el mensaje genérico
                } else {
                    Swal.fire('Error', 'Hubo un problema al asignar la ponderación', 'error');
                }
            }
        } catch (error) {
            console.error('Error en la solicitud:', error);
            Swal.fire('Error', 'Hubo un problema al conectar con el servidor', 'error');
        }
    };

    const handleSaveUpdate = async (ponderacionCiclo) => {
        try {
            const response = await fetch('http://localhost:4000/api/ponderacionCiclo/actualizarPonderacionesCiclos', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    Cod_ponderacion_ciclo: ponderacionCiclo.Cod_ponderacion_ciclo,
                    Cod_ponderacion: editedData.Cod_ponderacion || ponderacionCiclo.Cod_ponderacion,
                    Cod_ciclo: ponderacionCiclo.Cod_ciclo,
                    Valor: editedData.Valor || ponderacionCiclo.Valor,
                }),
            });

            if (response.ok) {
                await Swal.fire({
                    icon: 'success',
                    title: 'Actualización exitosa',
                    text: 'Datos actualizados correctamente',
                });
                setEditIndex(null); // Salir del modo de edición
                setModalVisible(false); // Ocultar el modal
                setHasUnsavedChanges(false); // Reiniciar el estado de cambios no guardados
                reseteditdata(); // Resetear los datos editados
                // Aquí puedes volver a cargar las ponderaciones si es necesario
            } else {
                await Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Error al actualizar la ponderación',
                });
            }
        } catch (error) {
            console.error('Error al actualizar la ponderación:', error);
            await Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Ocurrió un error inesperado',
            });
        }
    };

    const generarReporteCiclosPDF = () => {
        const doc = new jsPDF();
        const img = new Image();
        img.src = logo;
    
        const fechaReporte = new Date().toLocaleDateString();
        const ciclosFiltrados = ciclos; // Asume que `ciclos` es el array usado en tu tabla
        img.onload = () => {
            // Agregar logo
            doc.addImage(img, 'PNG', 10, 10, 30, 30);
    
            let yPosition = 20;
    
            // Título principal
            doc.setFontSize(18);
            doc.setTextColor(0, 102, 51);
            doc.text('SAINT PATRICK\'S ACADEMY', doc.internal.pageSize.width / 2, yPosition, { align: 'center' });
    
            yPosition += 12;
    
            // Subtítulo
            doc.setFontSize(16);
            doc.text('Reporte de Ciclos', doc.internal.pageSize.width / 2, yPosition, { align: 'center' });
    
            yPosition += 10;
    
            // Detalles
            doc.setFontSize(12);
            doc.setTextColor(0, 0, 0);
            doc.text(`Fecha del reporte: ${fechaReporte}`, doc.internal.pageSize.width / 2, yPosition, { align: 'center' });
    
            yPosition += 8;
    
            // Información de contacto
            doc.setFontSize(10);
            doc.setTextColor(100);
            doc.text('Teléfono: (504) 2234-8871', doc.internal.pageSize.width / 2, yPosition, { align: 'center' });
            yPosition += 4;
            doc.text('Correo: info@saintpatrickacademy.edu', doc.internal.pageSize.width / 2, yPosition, { align: 'center' });
            yPosition += 6;
    
            // Línea divisoria
            doc.setLineWidth(0.5);
            doc.setDrawColor(0, 102, 51);
            doc.line(10, yPosition, doc.internal.pageSize.width - 10, yPosition);
    
            yPosition += 4;
    
            // Configuración de tabla
            doc.autoTable({
                startY: yPosition,
                head: [['#', 'Nombre Ciclo']],
                body: ciclosFiltrados.map((ciclo, index) => [
                    index + 1,
                    ciclo.Nombre_ciclo,
                ]),
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
    
            // Abrir el PDF
            window.open(doc.output('bloburl'), '_blank');
        };
    
        img.onerror = () => {
            console.warn('No se pudo cargar el logo. El PDF se generará sin el logo.');
            window.open(doc.output('bloburl'), '_blank');
        };
    };

    const handleReporteClick = () => {
        const doc = new jsPDF();
        const img = new Image();
        img.src = logo; // Asegúrate de que `logo` esté correctamente importado
    
        img.onload = () => {
            // Agregar el logo
            doc.addImage(img, 'PNG', 10, 10, 25, 25);
    
            // Sección de encabezado
            doc.setFontSize(18);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(0, 102, 51); // Color verde
            doc.text('Saint Patrick Academy', doc.internal.pageSize.width / 2, 20, { align: 'center' });
    
            doc.setFontSize(12);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(0, 0, 0); // Color negro
            doc.text('Reporte de Información de las Ponderaciones del Ciclo', doc.internal.pageSize.width / 2, 30, { align: 'center' });
    
            doc.setFontSize(10);
            doc.text(`Ciclo: ${getCicloName(selectedCiclo)}`, doc.internal.pageSize.width / 2, 38, { align: 'center' });
    
            // Línea divisoria
            doc.setLineWidth(0.5);
            doc.setDrawColor(0, 102, 51); // Color verde
            doc.line(10, 42, doc.internal.pageSize.width - 10, 42);
    
            // Datos de la tabla
            const tableColumn = ["#", "NOMBRE DE LA PONDERACION", "CICLO", "VALOR"];
            const tableRows = [];
    
            ponderacionesciclos.forEach((ponderacionCiclo, index) => {
                const rowData = [
                    index + 1,
                    getPonderacionName(ponderacionCiclo.Cod_ponderacion),
                    getCicloName(ponderacionCiclo.Cod_ciclo),
                    `${ponderacionCiclo.Valor}%`
                ];
                tableRows.push(rowData);
            });
    
            // Agregar la tabla con autoTable
            autoTable(doc, {
                startY: 45, // Debajo del encabezado
                head: [tableColumn],
                body: tableRows,
                styles: {
                    fontSize: 10,
                    cellPadding: 3,
                },
                headStyles: {
                    fillColor: [0, 102, 51], // Verde
                    textColor: [255, 255, 255], // Blanco
                    fontStyle: "bold",
                },
                alternateRowStyles: { fillColor: [240, 248, 255] }, // Azul claro
                tableWidth: 'wrap',
                margin: { left: (doc.internal.pageSize.width - 190) / 2 },
    
                // Pie de página con fecha y número de página
                didDrawPage: (data) => {
                    const pageCount = doc.internal.getNumberOfPages();
                    const currentPage = doc.internal.getCurrentPageInfo().pageNumber;
                    const pageHeight = doc.internal.pageSize.height;
                    const currentDate = new Date().toLocaleDateString();
    
                    // Pie de página
                    doc.setFontSize(10);
                    doc.setTextColor(0, 102, 51); // Verde
                    const footerText = `Fecha de generación: ${currentDate} - Página ${currentPage} de ${pageCount}`;
                    doc.text(footerText, doc.internal.pageSize.width / 2, pageHeight - 10, { align: 'center' });
                }
            });
    
            // Guardar el PDF
            doc.save("reporte_ponderacion_ciclos.pdf");
        };
    
        img.onerror = () => {
            Swal.fire('Error', 'No se pudo cargar el logo.', 'error');
        };
    };
    

    const handleReporteExcelClick = () => {
        // Encabezados de la tabla
        const encabezados = [
            ["Saint Patrick Academy"],
            ["Reporte de Información de las Ponderaciones del Ciclo"],
            [`Ciclo: ${getCicloName(selectedCiclo)}`, `Fecha de generación: ${new Date().toLocaleDateString()}`],
            [], // Espacio en blanco
            ["#", "NOMBRE DE LA PONDERACION", "CICLO", "VALOR"]
        ];
    
        // Crear filas de la tabla con los datos de las ponderaciones
        const filas = ponderacionesciclos.map((ponderacionCiclo, index) => [
            index + 1,
            getPonderacionName(ponderacionCiclo.Cod_ponderacion),
            getCicloName(ponderacionCiclo.Cod_ciclo),
            `${ponderacionCiclo.Valor}%`
        ]);
    
        // Combinar encabezados y filas
        const datos = [...encabezados, ...filas];
    
        // Crear una hoja de trabajo con los datos
        const hojaDeTrabajo = XLSX.utils.aoa_to_sheet(datos);
    
        // Ajustar el ancho de columnas automáticamente
        const ajusteColumnas = [
            { wpx: 50 },  // Número
            { wpx: 200 }, // Nombre de la Ponderacion
            { wpx: 150 }, // Ciclo
            { wpx: 100 }  // Valor
        ];
        hojaDeTrabajo['!cols'] = ajusteColumnas;
    
        // Crear un libro de trabajo y añadir la hoja
        const libroDeTrabajo = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(libroDeTrabajo, hojaDeTrabajo, "Reporte de Ponderaciones");
    
        // Guardar el archivo Excel
        const nombreArchivo = `reporte_ponderacion_ciclos_${new Date().toLocaleDateString()}.xlsx`;
        XLSX.writeFile(libroDeTrabajo, nombreArchivo);
    };
    
    const handleReporteExceacaiclolClick = () => {
        // Encabezados de la tabla
        const encabezados = [
            ["Saint Patrick Academy"],
            ["Reporte de Información de los Ciclos"],
            [`Fecha de generación: ${new Date().toLocaleDateString()}`],
            [], // Espacio en blanco
            ["#", "NOMBRE DEL CICLO"]
        ];
    
        // Crear filas de la tabla con los datos de los ciclos
        const filas = ciclos.map((ciclo, index) => [
            index + 1,
            ciclo.Nombre_ciclo
        ]);
    
        // Combinar encabezados y filas
        const datos = [...encabezados, ...filas];
    
        // Crear una hoja de trabajo con los datos
        const hojaDeTrabajo = XLSX.utils.aoa_to_sheet(datos);
    
        // Ajustar el ancho de columnas automáticamente
        const ajusteColumnas = [
            { wpx: 50 },  // Número
            { wpx: 200 }  // Nombre del Ciclo
        ];
        hojaDeTrabajo['!cols'] = ajusteColumnas;
    
        // Crear un libro de trabajo y añadir la hoja
        const libroDeTrabajo = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(libroDeTrabajo, hojaDeTrabajo, "Reporte de Ciclos");
    
        // Guardar el archivo Excel
        const nombreArchivo = `reporte_ciclos_${new Date().toLocaleDateString().replace(/\//g, '-')}.xlsx`;
        XLSX.writeFile(libroDeTrabajo, nombreArchivo);
    };
    


    // Calcular el total de las ponderaciones
    const calculateTotal = () => {
        // Calcular la suma de las ponderaciones actuales del ciclo
        const total = ponderacionesciclos.reduce((total, ponderacionCiclo) => total + parseFloat(ponderacionCiclo.Valor), 0);

        // Retornar el total como un número con dos decimales
        return total.toFixed(2);
    };


     // Verificar permisos
     if (!canSelect) {
        return <AccessDenied />;
      }
    return (
        <div className="container mt-4">
                  <CRow className='align-items-center mb-5'>
        <CCol xs="8" md="9">
          {/* Titulo de la pagina */}
          <h3 className="mb-0">GESTION DE PONDERACIONES A CICLOS</h3>
        </CCol>

        <CCol xs="4" md="3" className="text-end d-flex flex-column flex-md-row justify-content-md-end align-items-md-center">
          {/* Botón "Nuevo" alineado a la derecha */}
          {/* Botón "Nuevo" alineado a la derecha */}

          {/*Boton reporte */}
          <CDropdown size="lg">
                <CDropdownToggle
                  style={{ backgroundColor: '#6C8E58', color: 'white', fontSize: '0.85rem', cursor: 'pointer' }}
                >
                  Reporte
                </CDropdownToggle>
                <CDropdownMenu>
                <CDropdownItem
                onClick={generarReporteCiclosPDF}
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
                <CIcon icon={cilFile} size="sm" /> Descargar PDF
              </CDropdownItem>
              <CDropdownItem
                onClick={handleReporteExceacaiclolClick}
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
                <CIcon icon={cilSpreadsheet} size="sm" /> Descargar Excel
              </CDropdownItem>
                </CDropdownMenu>
              </CDropdown>
        </CCol>
      </CRow>
            <div className="table-container mb-4 p-3 shadow-sm rounded" style={{ maxHeight: '400px', overflowY: 'scroll' }}>
                <CTable striped bordered hover responsive>
                    <CTableHead>
                        <CTableRow>
                            <CTableHeaderCell>#</CTableHeaderCell>
                            <CTableHeaderCell>NOMBRE DE CICLO</CTableHeaderCell>
                            <CTableHeaderCell>ACCIONES</CTableHeaderCell>
                        </CTableRow>
                    </CTableHead>
                    <CTableBody>
                        {ciclos.map((ciclo, index) => (
                            <CTableRow key={ciclo.Cod_ciclo}>
                                <CTableDataCell>{index + 1}</CTableDataCell>
                                <CTableDataCell>{ciclo.Nombre_ciclo}</CTableDataCell>
                                <CTableDataCell>
                                    <CButton
                                        style={{ backgroundColor: '#4B6251', color: '#FFFFFF', padding: '5px 10px', fontSize: '0.9rem', marginRight: '8px' , cursor: 'pointer' }}
                                        onClick={() => handleOpenAssignModal(ciclo)}
                                    >
                                         <CIcon icon={cilPlus} className="me-2" style={{ color: "#FFFFFF", fontSize: '1rem' }} />
                                          Asignar 
                                    </CButton>

                                    <CButton
                                        color="primary"
                                        style={{ backgroundColor: '#F9B64E' , fontSize: '0.85rem', cursor: 'pointer' }}
                                        onClick={() => fetchPonderacionCiclo(ciclo.Cod_ciclo)}
                                    >
                                      <CIcon icon={cilPen} style={{ color: "#FFFFFF", fontSize: '1rem' }} />
                                    </CButton>

                                </CTableDataCell>
                            </CTableRow>
                        ))}
                    </CTableBody>
                </CTable>
            </div>

            {/* Modal para mostrar las ponderaciones */}
            <CModal size="lg" visible={modalVisible} backdrop="static">
                <CModalHeader onClick={() => setModalVisible(false)}>
                    <CModalTitle>INFORMACIÓN DE: <strong>{getCicloName(selectedCiclo)}</strong></CModalTitle>
                </CModalHeader>
                <CModalBody>
                    {loading ? (
                        <div className="d-flex justify-content-center my-3">
                            <CSpinner color="primary" />
                        </div>
                    ) : (
                        <div className="table-container" style={{ maxHeight: '400px', overflowY: 'scroll', marginBottom: '20px' }}>
                            {ponderacionesciclos.length > 0 ? (
                                <CTable striped bordered hover>
                                    <CTableHead>
                                        <CTableRow>
                                            <CTableHeaderCell>#</CTableHeaderCell>
                                            <CTableHeaderCell>DESCRIPCION DE PONDERACION</CTableHeaderCell>
                                            <CTableHeaderCell>CICLO</CTableHeaderCell>
                                            <CTableHeaderCell>VALOR</CTableHeaderCell>
                                            <CTableHeaderCell>ACCIONES</CTableHeaderCell>
                                        </CTableRow>
                                    </CTableHead>
                                    <CTableBody>
                                        {ponderacionesciclos.map((ponderacionCiclo, index) => (
                                            <CTableRow key={ponderacionCiclo.Cod_ponderacion_ciclo}>
                                                <CTableDataCell>{index + 1}</CTableDataCell>
                                                <CTableDataCell>
                                                    {editIndex === index ? (
                                                        <select
                                                            style={{ width: '100%', padding: '4px', fontSize: '0.9rem' }}
                                                            value={editedData.Cod_ponderacion || ponderacionCiclo.Cod_ponderacion}
                                                            onChange={(e) => setEditedData({ ...editedData, Cod_ponderacion: e.target.value })}
                                                        >
                                                            {ponderaciones.map((ponderacion) => (
                                                                <option key={ponderacion.Cod_ponderacion} value={ponderacion.Cod_ponderacion}>
                                                                    {ponderacion.Descripcion_ponderacion}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    ) : (
                                                        getPonderacionName(ponderacionCiclo.Cod_ponderacion)
                                                    )}
                                                </CTableDataCell>

                                                <CTableDataCell>{getCicloName(ponderacionCiclo.Cod_ciclo)}</CTableDataCell>

                                                <CTableDataCell>
                                                    {editIndex === index ? (
                                                        <input
                                                            type="number"
                                                            min={0.05}
                                                            max={100}
                                                            step="0.05"
                                                            maxLength={11}
                                                            value={editedData.Valor || ponderacionCiclo.Valor}
                                                            onChange={(e) => {
                                                                const value = parseFloat(e.target.value);
                                                                if (!isNaN(value) && value >= 0.05 && value <= 100) {
                                                                    setEditedData({ ...editedData, Valor: value });
                                                                } else {
                                                                    Swal.fire('Error', 'El valor debe estar entre 0.05 y 100', 'error');
                                                                }
                                                            }}
                                                        />
                                                    ) : (
                                                        `${ponderacionCiclo.Valor}%`
                                                    )}
                                                </CTableDataCell>
                                                <CTableDataCell>
                                                    {editIndex === index ? (
                                                        <div style={{ display: 'flex', gap: '8px' }}>
                                                            <CButton
                                                                style={{ padding: '4px 8px', backgroundColor: '#2ECC71', color: 'white' }}
                                                                onClick={() => handleSaveUpdate(ponderacionCiclo)}
                                                            >
                                                                <CIcon icon={cilCheck} />
                                                            </CButton>
                                                            <CButton
                                                                style={{ padding: '4px 8px', backgroundColor: '#E74C3C', color: 'white' }}
                                                                onClick={() => setEditIndex(null)}
                                                            >
                                                                <CIcon icon={cilX} />
                                                            </CButton>
                                                        </div>
                                                    ) : (
                                                        <CButton
                                                            size="sm"
                                                            style={{
                                                                backgroundColor: '#4B6251',
                                                                color: 'white',
                                                                padding: '2px 6px',
                                                                fontSize: '0.85rem',
                                                                 cursor: 'pointer'
                                                            }}
                                                            onClick={() => handleEditClick(index, ponderacionCiclo)}
                                                        >
                                                            <CIcon icon={cilPen} /> Editar
                                                        </CButton>

                                                    )}
                                                </CTableDataCell>
                                            </CTableRow>
                                        ))}
                                        <CTableRow>
                                            <CTableDataCell colSpan={3} className="text-end"><strong>Total:</strong></CTableDataCell>
                                            <CTableDataCell><strong>{calculateTotal()}%</strong></CTableDataCell>
                                        </CTableRow>
                                    </CTableBody>
                                </CTable>
                            ) : (
                                <p>No hay ponderaciones disponibles para este ciclo.</p>
                            )}
                        </div>
                    )}
                </CModalBody>
                <CModalFooter>
                    <CButton color="secondary"  style={{ fontSize: '0.85rem', cursor: 'pointer' }} onClick={() => setModalVisible(false)}>Cerrar</CButton>
                    <CDropdown>
                <CDropdownToggle
                  style={{ backgroundColor: '#6C8E58', color: 'white', fontSize: '0.85rem', cursor: 'pointer' }}
                >
                  Reporte
                </CDropdownToggle>
                <CDropdownMenu>
                <CDropdownItem
                onClick={handleReporteClick}
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
                <CIcon icon={cilFile} size="sm" /> Descargar PDF
              </CDropdownItem>
              <CDropdownItem
                onClick={handleReporteExcelClick}
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
                <CIcon icon={cilSpreadsheet} size="sm" /> Descargar Excel
              </CDropdownItem>
                </CDropdownMenu>
              </CDropdown>

                </CModalFooter>
            </CModal>

            {/* Modal para asignar ponderación */}
            <CModal visible={assignModalVisible} backdrop="static">
                <CModalHeader onClick={() => setAssignModalVisible(false)}>
                    <CModalTitle>Asignar Ponderación a: <strong>{cicloParaAsignar?.Nombre_ciclo}</strong></CModalTitle>
                </CModalHeader>
                <CModalBody>
                    <div className="mb-3">
                        <label><strong>Seleccione una Ponderación:</strong></label>
                        <CFormSelect
                            value={nuevaponderaciones}
                            onChange={(e) => setnuevaPonderaciones(e.target.value)}
                        >
                            <option value=''>Seleccione una Ponderación</option>
                            {ponderaciones.map((ponderacion) => (
                                <option key={ponderacion.Cod_ponderacion} value={ponderacion.Cod_ponderacion}>
                                    {ponderacion.Descripcion_ponderacion}
                                </option>
                            ))}
                        </CFormSelect>
                    </div>
                    <div className="mt-3">
                        <label><strong>Valor:</strong></label>
                        <input
                            type="number"
                            min={0.5}
                            max={100}
                            step="0.5"
                            value={nuevaponderacionesciclos}
                            onChange={(e) => {
                                const value = parseFloat(e.target.value); // Convertir a número decimal
                                if (!isNaN(value) && value >= 0.5 && value <= 100) {
                                    setnuevaPonderacionesCiclos(value); // Almacenar el valor directamente
                                } else if (value < 0.5) {
                                    setnuevaPonderacionesCiclos(0.5); // Establecer a 0.5 si se intenta ingresar un valor menor
                                } else if (value > 100) {
                                    setnuevaPonderacionesCiclos(100); // Establecer a 100 si se intenta ingresar un valor mayor
                                }
                            }}
                            onKeyDown={(e) => {
                                // Permitir solo números, backspace, delete y teclas de flecha
                                if (!/[0-9.]/.test(e.key) && e.key !== "Backspace" && e.key !== "Delete" && e.key !== "ArrowLeft" && e.key !== "ArrowRight") {
                                    e.preventDefault();
                                }
                            }}
                            className="form-control"
                        />
                    </div>
                </CModalBody>
                <CModalFooter>
                    <CButton color="secondary" style={{ fontSize: '0.85rem', cursor: 'pointer' }} onClick={() => setAssignModalVisible(false)}>Cancelar</CButton>
                    <CButton style={{ backgroundColor: '#4B6251', color: 'white', fontSize: '0.85rem', cursor: 'pointer' }} onClick={asignarPonderacion}>
                        Guardar <CIcon icon={cilSave} style={{ color: "#FFFFFF", fontSize: '1rem' }} />
                    </CButton>
                </CModalFooter>
            </CModal>
        </div>
    );
};

export default ListaPonderacionesCiclos;
