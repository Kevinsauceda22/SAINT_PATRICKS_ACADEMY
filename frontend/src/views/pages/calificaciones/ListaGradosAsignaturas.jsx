import React, { useEffect, useState } from 'react';
import { CIcon } from '@coreui/icons-react';
import { cilSearch, cilBrushAlt, cilPen, cilTrash, cilPlus, cilSave, cilDescription, cilCheck, cilX, cilNoteAdd, cilSpreadsheet,cilFile } from '@coreui/icons';
import { jsPDF } from "jspdf";
import Swal from 'sweetalert2';
//import "jspdf-autotable"; // Importar para tablas
import logo from 'src/assets/brand/logo_saint_patrick.png'
//import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

import {
    CFormSelect,
    CTable,
    CTableHead,
    CTableRow,
    CTableHeaderCell,
    CTableBody,
    CTableDataCell,
    CCard,
    CCardBody,
    CCardHeader,
    CCol,
    CRow,
    CSpinner,
    CModal,
    CModalHeader,
    CModalTitle,
    CModalBody,
    CModalFooter,
    CButton,
    CFormInput,
    CDropdown,
    CDropdownItem,
    CDropdownMenu,
    CDropdownToggle,
    
} from '@coreui/react';
import usePermission from '../../../../context/usePermission';
import AccessDenied from "../AccessDenied/AccessDenied"

const ListaGradosAsignaturas = () => {
    const { canSelect, canInsert, canUpdate } = usePermission('ListaGradosAsignaturas');
    const [gradosAsignaturas, setGradosAsignaturas] = useState([]);
    const [Asignaturas, setAsignatura] = useState([]);
    const [grados, setGrados] = useState([]);
    const [nuevoGradosAsignaturas, setnuevoGradosAsignaturas] = useState([]);
    const [nueva_Asignatura, setNueva_Asignatura] = useState(''); // Estado para el nuevo ciclo
    const [nuevoGrado, setNuevoGrado] = useState(''); // Estado para el nuevo grado
    const [selectedGrado, setSelectedGrado] = useState('');
    const [GradoAsignaturaToDelete, setGradoAsignaturaToDelete] = useState({}); // Estado para la asignatura a eliminar
    ///const [gradoAsignaturaToUpdate, setGradoAsignaturaToUpdate] = useState({}); // Estado para la asignatura a actualizar
    
    const [recordsPerPage, setRecordsPerPage] = useState(5); // Hacer dinámico el número de registros por página
    const [currentPage, setCurrentPage] = useState(1); // Estado para la página actual
    const [searchTerm, setSearchTerm] = useState('');

    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false); // Estado para controlar el modal
    const [assignModalVisible, setAssignModalVisible] = useState(false); // Estado para controlar el modal de asignación
    const [modalDeleteVisible, setModalDeleteVisible] = useState(false); // Estado para el modal de eliminar asignatura
    const [editIndex, setEditIndex] = useState(null);
    const [editedData, setEditedData] = useState({});
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false); // Estado para detectar cambios sin guardar
    const resetAsignatura = () => setNueva_Asignatura({ Nombre_asignatura: ''});


    useEffect(() => {
        fetchGrados();
        fetchAsignaturas();
    }, []);

    // LLAMADO AL GET GRADOS
    const fetchGrados = async () => {
        try {
          const response = await fetch('http://localhost:4000/api/grados/verGrados');
          const data = await response.json();
          // Asignar un índice original basado en el orden en la base de datos
        const dataWithIndex = data.map((grado, index) => ({
          ...grado,
          originalIndex: index + 1, // Guardamos la secuencia original
        }));
    
        setGrados(dataWithIndex);
        } catch (error) {
          console.error('Error al obtener los grados:', error);
        }
    };

    const handleEditClick = (index, gradosAsignaturas) => {
        setEditIndex(index);
        setEditedData(gradosAsignaturas); // Inicializa el estado con los datos actuales
    };

    // LLAMADO AL GET ASIGNATURAS
    const fetchAsignaturas = async () => {
        try {
          const response = await fetch('http://localhost:4000/api/asignaturas/verAsignaturas');
          const data = await response.json();
          // Asignar un índice original basado en el orden en la base de datos
        const dataWithIndex = data.map((asignatura, index) => ({
          ...asignatura,
          originalIndex: index + 1, // Guardamos la secuencia original
        }));
        
        setAsignatura(dataWithIndex);
        } catch (error) {
          console.error('Error al obtener las Asignaturas:', error);
        }
    };

    // BUSQUEDA DEL NOMBRE DE LOS GRADOS
    const getGradoName = (codGrado) => {
        if (!grados.length) return 'Grados no disponibles';
        const grado = grados.find((c) => c.Cod_grado === codGrado);
        return grado ? grado.Nombre_grado : 'Grado no encontrado';
    };

    // LLAMADO AL GET DE LOS GRADOS Y SUS ASIGNATURAS
    const fetchGradosAsignaturas = async (codGrado) => {
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:4000/api/gradoAsignatura/verGradosAsignaturas/${codGrado}`);
            const data = await response.json();
            setGradosAsignaturas(data);
            setModalVisible(true); // Muestra el modal después de obtener los datos
        } catch (error) {
            console.error('Error al obtener los datos:', error);
        } finally {
            setLoading(false);
        }
    };

    // BUSQUEDA DEL NOMBRE DE LAS ASIGNATURAS
    const getAsignaturaName = (codAsignatura) => {
        if (!Asignaturas.length) return 'Asignaturas no disponibles';
        const Asignatura = Asignaturas.find((c) => c.Cod_asignatura === codAsignatura);
        return Asignatura ? Asignatura.Nombre_asignatura : 'Asignatura no encontrada';
    };

    // EXTRAE EL GRADO DESEADO
    const handleGradoChange = (event) => {
        const selectedValue = event.target.value;
        setSelectedGrado(selectedValue);
        if (selectedValue) {
            fetchGradosAsignaturas(selectedValue);
        }
    };

    // REINICIA EL MODAL
    const handleCloseModal = () => {
        setModalVisible(false); // Cierra el modal
        setGradosAsignaturas([]); // Limpia los datos al cerrar el modal
    };

    // LLAMADO AL GET QUE CONTIENE LOS GRADOS Y SUS ASIGANTURAS 
    const handleOpenAssignModal = (gradoCod) => {
        setSelectedGrado(gradoCod); // Asigna el código del grado seleccionado al estado
        if (gradoCod) {
          fetchGradosAsignaturas(gradoCod); // Llama a la función con el código del grado
        }
    };

    // PODER LLAMAR A LA INSERSION DE ASIGNATURAS
    const handleInsertAsignaturaModal = (gradoCod) => {
        setNuevoGrado(gradoCod); // Asigna el código del grado seleccionado al estado
        setAssignModalVisible(true); // Muestra el modal
    };

    // ABRE EL MODAL DE ELIMINAR
    const openDeleteModal = (GradoAsignatura) => {
        setGradoAsignaturaToDelete(GradoAsignatura); // Guardar el ciclo que se desea eliminar
        setModalDeleteVisible(true); // Abrir el modal de confirmación
    };

    // LLAMADO A LA REPORTERIA EN PDF
    const handleReporteClick = () => {
        // Crear una nueva instancia de jsPDF
        const doc = new jsPDF();
        const img = new Image();
        img.src = logo;

        const fechaReporte = new Date().toLocaleDateString();
        img.onload = () => {
            // Add the logo
            doc.addImage(img, 'PNG', 10, 10, 30, 30); // Adjust the position and size as needed
            
            let yPosition = 20;

            // Título del PDF
            doc.setFontSize(18);
            //doc.setFont("helvetica", "bold");
            doc.setTextColor(0, 102, 51);
            doc.text('SAINT PATRICK\'S ACADEMY', doc.internal.pageSize.width / 2, yPosition, { align: 'center' });
            //doc.setFontSize(10);
            //doc.text(`Grado: ${getGradoName}`, doc.internal.pageSize.width / 2, 35, { align: 'center' });
            
            yPosition += 12;

            // Subtítulo
            doc.setFontSize(16);
            //doc.setFont("helvetica", "normal");
            doc.text('Reporte de Información de informacion del Grados:', doc.internal.pageSize.width / 2, 25, { align: 'center' });
            
            // Detalles
            //yPosition += 10;

            yPosition += 8;
            doc.text(`Fecha del reporte: ${fechaReporte}`, doc.internal.pageSize.width / 2, yPosition, { align: 'center' });
            
            yPosition += 8;

            // Información de contacto
            doc.setFontSize(10);
            doc.setTextColor(100);
            doc.text('Teléfono: (504) 2234-8871', doc.internal.pageSize.width / 2, yPosition, { align: 'center' });
            yPosition += 4;
            doc.text('Correo: info@saintpatrickacademy.edu', doc.internal.pageSize.width / 2, yPosition, { align: 'center' });
            yPosition += 6;

            // Line Separator
            doc.setLineWidth(0.5);
            doc.setDrawColor(0, 102, 51);
            doc.line(10, yPosition, doc.internal.pageSize.width - 10, yPosition);

            yPosition += 4;
            // Datos que quieres incluir en el PDF
            const tableRows = [];
        
            gradosAsignaturas.forEach((gradoAsignatura, index) => {
                const rowData = [
                    index + 1,
                    getAsignaturaName(gradoAsignatura.Cod_asignatura),
                    getGradoName(gradoAsignatura.Cod_grado)
                ];
                tableRows.push(rowData);
            });
        
            // Agregar la tabla al PDF usando autotable
            doc.autoTable({
                startY: yPosition,
                head: [['#', 'NOMBRE DE LA ASIGNATURA', 'GRADO']],
                body: tableRows,
                styles: {
                    fontSize: 10,
                    cellPadding: 5,
                },
                headStyles: {
                    fillColor: [0, 102, 51],
                    textColor: [255, 255, 255],
                    fontStyle: 10,
                },
                alternateRowStyles: { fillColor: [240, 248, 255] },
                tableWidth: 'wrap',
                margin: { left: (doc.internal.pageSize.width - 180) / 2 },
                // Footer with date and page number
                didDrawPage: (data) => {
                    const pageCount = doc.internal.getNumberOfPages();
                    const currentPage = doc.internal.getCurrentPageInfo().pageNumber;
                    const pageHeight = doc.internal.pageSize.height;
                    const currentDate = new Date().toLocaleDateString();
        
                    // Footer
                    doc.setFontSize(10);
                    const footerText = `Fecha de generación: ${currentDate} - Página ${currentPage} de ${pageCount}`;
                    doc.text(footerText, doc.internal.pageSize.width / 2, pageHeight - 10, { align: 'center' });
                    
                    // Abrir el PDF
                    window.open(doc.output('bloburl'), '_blank');
                }
            
            });
            
            // Guardar el PDF con un nombre específico
            doc.save("reporte_asignaturas_grado.pdf");
        };
    };  

    // LLAMADO A LA REPORTERIA EN EXCEL
    const handleReporteExcelClick = () => {
        // Encabezados de la tabla
        const encabezados = [
          ["Saint Patrick Academy"],
          ["Reporte de Información de actividades Asignadas"],
          //[`Asignatura: ${selectedAsignatura}`, `Fecha de generación: ${new Date().toLocaleDateString()}`],
          [`Fecha de generación: ${new Date().toLocaleDateString()}`], // Fecha de generación
          [], // Espacio en blanco
          ["#", "Asignatura", "Grado"]
        ];
    
        // Crear filas de la tabla con los datos de las actividades asignadas
        const filas = gradosAsignaturas.map((gradosAsignaturas, index) => [
          index + 1,
          gradosAsignaturas.Nombre_asignatura,
          gradosAsignaturas.Nombre_grado,
        ]);
    
        // Combinar encabezados y filas
        const datos = [...encabezados, ...filas];
    
        // Crear una hoja de trabajo con los datos
        const hojaDeTrabajo = XLSX.utils.aoa_to_sheet(datos);
    
        // Ajustar el ancho de columnas automáticamente
        const ajusteColumnas = [
          { wpx: 50 },  // Número
          { wpx: 250 }, // Asignatura
          { wpx: 300 }, // Grado
        ];
        hojaDeTrabajo['!cols'] = ajusteColumnas;
    
        // Crear un libro de trabajo y añadir la hoja
        const libroDeTrabajo = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(libroDeTrabajo, hojaDeTrabajo, "Reporte Asignaturas por Grado");
    
        // Guardar el archivo Excel
        const nombreArchivo = `reporte_asignaturas_en_grado${new Date().toLocaleDateString()}.xlsx`;
        XLSX.writeFile(libroDeTrabajo, nombreArchivo);
    };

    // const handleReporteClick = () => {
    //     const doc = new jsPDF();
    //     const img = new Image();
    //     img.src = logo;
    
    //     img.onload = () => {
    //       // Add the logo
    //       doc.addImage(img, 'PNG', 10, 10, 30, 30); // Adjust the position and size as needed
    
    //       // Header Section
    //       doc.setFontSize(16);
    //       doc.setFont("helvetica", "bold");
    //       doc.text('Saint Patrick Academy', doc.internal.pageSize.width / 2, 15, { align: 'center' });
    
    //       doc.setFontSize(12);
    //       doc.setFont("helvetica", "normal");
    //       doc.text('Reporte de Información de informacion de los Grados:', doc.internal.pageSize.width / 2, 25, { align: 'center' });
    
    //       // doc.setFontSize(10);
    //       // doc.text(`Grados: ${setSelectedGrado}`, doc.internal.pageSize.width / 2, 35, { align: 'center' });
    
    //       // Line Separator
    //       doc.setLineWidth(0.5);
    //       doc.line(10, 38, doc.internal.pageSize.width - 10, 38);
    
    //       // Table Data
    //       const tableColumn = ["#", "Nombre de la Asignatura", "Grado"];
    //       const tableRows = [];

    //       gradosAsignaturas.forEach((gradoAsignatura, index) => {
    //         const rowData = [
    //             index + 1,
    //             getAsignaturaName(gradoAsignatura.Cod_asignatura),
    //             getGradoName(gradoAsignatura.Cod_grado)
    //         ];
    //         tableRows.push(rowData);
    //     });
    
    //     //   gradosAsignadas.forEach((gradosAsignadas, index) => {
    //     //     const rowData = [
    //     //       index + 1,
    //     //       gradosAsignadas.Nombre_asignatura,
    //     //       gradosAsignadas.Nombre_grado,
    //     //     ];
    //     //     tableRows.push(rowData);
    //     //   });
    
    //       // Add the table using autoTable
    //       autoTable(doc, {
    //         startY: 40,
    //         head: [tableColumn],
    //         body: tableRows,
    //         styles: {
    //           fontSize: 8,
    //           cellPadding: 2,
    //         },
    //         headStyles: {
    //           fillColor: [21, 62, 33],
    //           textColor: [255, 255, 255],
    //           fontStyle: "bold",
    //         },
    //         alternateRowStyles: { fillColor: [245, 245, 245] },
    //         tableWidth: 'wrap',
    //         margin: { left: (doc.internal.pageSize.width - 190) / 2 },
    
    //         // Footer with date and page number
    //         didDrawPage: (data) => {
    //           const pageCount = doc.internal.getNumberOfPages();
    //           const currentPage = doc.internal.getCurrentPageInfo().pageNumber;
    //           const pageHeight = doc.internal.pageSize.height;
    //           const currentDate = new Date().toLocaleDateString();
    
    //           // Footer
    //           doc.setFontSize(10);
    //           const footerText = `Fecha de generación: ${currentDate} - Página ${currentPage} de ${pageCount}`;
    //           doc.text(footerText, doc.internal.pageSize.width / 2, pageHeight - 10, { align: 'center' });
    //         }
    //       });
    
    //       // Save the PDF
    //       doc.save("reporte_grados.pdf");
    //     };
    
    //     img.onerror = () => {
    //       Swal.fire('Error', 'No se pudo cargar el logo.', 'error');
    //     };
    // };

    // const handleReporteExcelClick = () => {
    //     // Encabezados de la tabla
    //     const encabezados = [
    //       ["Saint Patrick Academy"],
    //       ["Reporte de Información de actividades Asignadas"],
    //       //[`Asignatura: ${selectedAsignatura}`, `Fecha de generación: ${new Date().toLocaleDateString()}`],
    //       [], // Espacio en blanco
    //       ["#", "Asignatura", "Grado"]
    //     ];
    
    //     // Crear filas de la tabla con los datos de las actividades asignadas
    //     const filas = gradosAsignaturas.map((gradoAsignatura, index) => [
    //       index + 1,
    //       gradoAsignatura.Nombre_asignatura,
    //       gradoAsignatura.Nombre_grado,
    //     ]);
    
    //     // Combinar encabezados y filas
    //     const datos = [...encabezados, ...filas];
    
    //     // Crear una hoja de trabajo con los datos
    //     const hojaDeTrabajo = XLSX.utils.aoa_to_sheet(datos);
    
    //     // Ajustar el ancho de columnas automáticamente
    //     const ajusteColumnas = [
    //       { wpx: 50 },  // Número
    //       { wpx: 150 }, // Asignatura
    //       { wpx: 100 }, // Grado
    //       { wpx: 200 }, // Nombre de la Actividad
    //       { wpx: 150 }, // Parcial
    //       { wpx: 120 }, // Empieza
    //       { wpx: 120 }, // Finaliza
    //       { wpx: 80 }   // Valor
    //     ];
    //     hojaDeTrabajo['!cols'] = ajusteColumnas;
    
    //     // Crear un libro de trabajo y añadir la hoja
    //     const libroDeTrabajo = XLSX.utils.book_new();
    //     XLSX.utils.book_append_sheet(libroDeTrabajo, hojaDeTrabajo, "Reporte de las Asignaturas en cada Grado");
    
    //     // Guardar el archivo Excel
    //     const nombreArchivo = `reporte_asignaturas_${new Date().toLocaleDateString()}.xlsx`;
    //     XLSX.writeFile(libroDeTrabajo, nombreArchivo);
    // };

    //DARLE FORMATO AL TIEMPO
    // const formatDateTime = (dateTime) => {
    //     const date = new Date(dateTime);
    //     const formattedDate = date.toLocaleDateString('es-ES'); // Change 'es-ES' to your locale preference
    //     const formattedTime = date.toLocaleTimeString('es-ES', {
    //       hour: '2-digit',
    //       minute: '2-digit',
    //     });
    //     return `${formattedDate} ${formattedTime}`;
    // };


    //VALIDACIONES 
    // Función para cerrar el modal con advertencia si hay cambios sin guardar
    const handleCloseInsertModal = (closeFunction, resetFields) => {
        if (hasUnsavedChanges) {
        Swal.fire({
            title: '¿Estás seguro?',
            text: 'Si cierras este formulario, perderás todos los datos ingresados.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, cerrar',
            cancelButtonText: 'Cancelar',
        }).then((result) => {
            if (result.isConfirmed) {
            closeFunction(false);
            resetFields(); // Limpiar los campos al cerrar
            setHasUnsavedChanges(false); // Resetear cambios no guardados
            }
        });
        } else {
        closeFunction(false);
        resetFields();
        setHasUnsavedChanges(false); // Asegurarse de resetear aquí también
        }
    };

    //PARA ASIGNAR UNA ASIGNATURA AL GRADO
    // PARA ASIGNAR UNA ASIGNATURA AL GRADO
const asignarAsignatura = async () => {
    // Validar si la asignatura ya está asignada en el grado
    const asignaturaDuplicada = nuevoGradosAsignaturas.some(
        (asignatura) => asignatura.Cod_asignatura === nueva_Asignatura
    );

    if (asignaturaDuplicada) {
        Swal.fire({
            icon: 'warning',
            title: 'Asignatura duplicada',
            text: 'La asignatura seleccionada ya está asignada a este grado. Por favor, elige otra.',
            confirmButtonText: 'Entendido',
        });
        return; // Detener la ejecución si hay duplicados
    }

    try {
        // Petición al servidor para asignar la asignatura
        const response = await fetch('http://localhost:4000/api/gradoAsignatura/crearGradoAsignatura', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                Cod_asignatura: nueva_Asignatura,
                Cod_grado: nuevoGrado,
            }),
        });

        if (response.ok) {
            Swal.fire({
                icon: 'success',
                title: 'Asignación exitosa',
                text: 'La asignatura fue asignada correctamente al grado.',
            });

            // Actualizar la lista local de asignaturas asignadas
            const nuevaAsignatura = await response.json(); // Suponiendo que el backend devuelve la nueva asignación
            setnuevoGradosAsignaturas((prev) => [...prev, nuevaAsignatura]);
            resetAsignatura();

            // Limpiar los campos del formulario
            setNueva_Asignatura('');
            setAssignModalVisible(false);
        } else if (response.status === 400) { // Validación de duplicados desde el backend
            const errorData = await response.json();
            Swal.fire({
                icon: 'info',
                title: 'Asignatura duplicada',
                text: errorData.Mensaje || 'La asignatura seleccionada ya está asignada a este grado.',
                confirmButtonText: 'Entendido',
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo asignar la asignatura. Inténtalo de nuevo.',
            });
        }
    } catch (error) {
        console.error('Error al asignar la asignatura:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Hubo un problema al procesar la solicitud.',
        });
    }
};


    const handleSaveUpdate = async (gradoAsignatura) => {
        try {
            const response = await fetch('http://localhost:4000/api/gradoAsignatura/actualizarGradoAsignatura', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    Cod_grados_asignaturas : gradoAsignatura.Cod_grados_asignaturas,
                    Cod_asignatura: editedData.Cod_asignatura || gradoAsignatura.Cod_asignatura,
                    Cod_grado: gradoAsignatura.Cod_grado,
                    //Valor: editedData.Valor || gradoAsignatura.Valor,
                }),
            });
            if (response.ok) {
                alert('Asignatura actualizada correctamente');
                fetchGradosAsignaturas(); // Refrescar los datos
                setEditIndex(null); // Salir del modo de edición
                gradoAsignaturaToUpdate();
            } else {
                alert('Error al actualizar la Asignatura');
            }
        } catch (error) {
            console.error('Error al actualizar la Asignatura:', error);
        }
    };

    // LLAMADO DE API PARA PODER ELIMINAR UNA ASIGNATURA DE UN GRADO
    const handleDeleteGradoAsignatura = async () => {
        try {
          const response = await fetch('http://localhost:4000/api/gradoAsignatura/eliminarGradoAsignaturas', {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ Cod_grados_asignaturas: GradoAsignaturaToDelete.Cod_grados_asignaturas }), // Enviar Cod_ciclo en el cuerpo
          });
    
          if (response.ok) {
            fetchAsignaturas(); // Refrescar la lista de ciclos después de la eliminación
            setModalDeleteVisible(false); // Cerrar el modal de confirmación
            setGradoAsignaturaToDelete({}); // Resetear el ciclo a eliminar
            handleCloseModal(false);

            Swal.fire('¡Éxito!', 'La asignatura se ha eliminado correctamente', 'success');
          } else {
            Swal.fire('Error', 'Hubo un problema al eliminar la asignatura', 'error');
          }
        } catch (error) {
          Swal.fire('Error', 'Hubo un problema al eliminar la asignatura', 'error');
          
        }
    };

     // Verificar permisos
     if (!canSelect) {
        return <AccessDenied />;
      }
      

    return (
            <div className="container mt-4">
                <h3 className="text-center mb-4">PROCESO DE ASIGNACIÓN: ASIGNATURAS A LOS GRADOS</h3>
                <CCard>
                    <CCardHeader>
                        <strong>INFORMACION DE LOS GRADOS</strong>
                        {/* TABLA PARA MOSTRAR TODOS LOS GRADOS*/}
                        <div className="mt-4">
                                <CTable striped>
                                    <CTableHead>
                                        <CTableRow>
                                            <CTableHeaderCell>#</CTableHeaderCell>
                                            <CTableHeaderCell>NOMBRE DE LOS GRADOS</CTableHeaderCell>
                                            <CTableHeaderCell>ACCIONES</CTableHeaderCell>
                                        </CTableRow>
                                    </CTableHead>
                                    <CTableBody>
                                        {grados.map((grado, index) => (
                                        <CTableRow key={grado.Cod_grado}>
                                            <CTableDataCell>{index + 1}</CTableDataCell>
                                            <CTableDataCell>{grado.Nombre_grado}</CTableDataCell>
                                            <CTableDataCell>
                                                <div style={{ display: 'flex', gap: '8px' }}> {/* Contenedor flex para alinear los botones */}
                                                    <CButton  style={{  padding: '4px 8px', backgroundColor: '#6495ED',color: 'warning' }} onClick={() => handleInsertAsignaturaModal(grado.Cod_grado)}>
                                                        <CIcon icon={cilNoteAdd} style={{ marginRight: '5px' }} />AGREGAR 
                                                    </CButton>
                                                    <CButton  style={{  padding: '4px 8px', backgroundColor: '#F9B64E',color: 'dark' }} onClick={() => handleOpenAssignModal(grado.Cod_grado)}>
                                                        <CIcon icon={cilSave} style={{ marginRight: '5px' }} />DETALLE 
                                                    </CButton>
                                                </div>        
                                            </CTableDataCell>
                                        </CTableRow>
                                        ))}
                                    </CTableBody>
                                </CTable>
                            </div>
                    </CCardHeader>
                        <CCardBody>

                        {loading && (
                            <div className="text-center">
                                <CSpinner color="primary" />
                            </div>
                        )}
                        </CCardBody>
                </CCard>
                    {/* Modal para mostrar las asignaturas de los grados*/}
                    <CModal size="lg" visible={modalVisible} onClose={handleCloseModal} backdrop="static">
                        <CModalHeader onClose={handleCloseModal}>  
                            <CModalTitle><strong>INFORMACIÓN DEL GRADO</strong></CModalTitle>  
                            <CDropdown>
                                <CDropdownToggle
                                    style={{ backgroundColor: '#6C8E58', color: 'white', marginLeft: '370px', fontSize: '0.85rem', cursor: 'pointer' }} 
                                >
                                REPORTE
                                </CDropdownToggle>
                                {/* SELECION DE REPORTERIA EN PDF Y EXCEL*/}
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
                        </CModalHeader>
                        {/*GENERACIÓN DE TABLA PARA MOSTRAR LA INFORMACION DEL GRADO*/}
                        <CModalBody>
                            {gradosAsignaturas.length > 0 ? (
                                <CTable striped>
                                    <CTableHead>
                                        <CTableRow>
                                        <CTableHeaderCell>#</CTableHeaderCell>
                                            <CTableHeaderCell>NOMBRE DE LA ASIGNATURA</CTableHeaderCell>
                                            <CTableHeaderCell style={{  width: '35%' }}>GRADO</CTableHeaderCell>
                                            <CTableHeaderCell style={{ textAlign: 'center', width: '15%' }}>ACCIONES</CTableHeaderCell>
                                        </CTableRow>
                                    </CTableHead>
                                    <CTableBody>
                                        {gradosAsignaturas.map((gradoAsignatura, index) => (
                                            <CTableRow key={gradoAsignatura.Cod_grados_asignaturas}>
                                                <CTableDataCell>{index + 1}</CTableDataCell>
                                                <CTableDataCell>
                                                    {editIndex === index ? (
                                                    <select
                                                    style={{ width: '100%', padding: '4px', fontSize: '0.9rem' }} // Ajuste de estilo
                                                    value={editedData.Cod_asignatura || gradoAsignatura.Cod_asignatura}
                                                    onChange={(e) => setEditedData({ ...editedData, Cod_asignatura: e.target.value })}
                                                >
                                                    {Asignaturas.map((gradoAsignatura) => (
                                                        <option key={gradoAsignatura.Cod_asignatura} value={gradoAsignatura.Cod_asignatura}>
                                                            {gradoAsignatura.Nombre_asignatura} {/* Usa el campo del nombre de la asignatura */}
                                                        </option>
                                                    ))}
                                                    </select>
                                                    ) : (
                                                        getAsignaturaName(gradoAsignatura.Cod_asignatura)  // Muestra el nombre si no se está editando
                                                    )}
                                                </CTableDataCell>
                                                {/* EXTRAER EL NOMBRE DEL GRADO*/}
                                                <CTableDataCell>{getGradoName(gradoAsignatura.Cod_grado)}</CTableDataCell>
                                                <CTableDataCell>
                                                    {editIndex === index ? (
                                                        <div style={{ display: 'flex', gap: '8px' }}> {/* Contenedor flex para alinear los botones */}

                                                            {/* BOTON PARA ABRIR EL MODAL DE ACTUALIZAR LA ASIGNATURA */}
                                                            {/* <CButton 
                                                                style={{ padding: '4px 8px', backgroundColor: '#2ECC71', color: 'white' }} 
                                                                onClick={() => gradoAsignaturaToUpdate(gradoAsignatura)}
                                                            >          
                                                                        
                                                                <CIcon icon={cilCheck} /> 
                                                            </CButton> */}
                                                            
                                                            <CButton //BOTON PARA ELIMINAR LA ASIGNATURA
                                                                style={{ padding: '4px 8px', backgroundColor: '#E74C3C', color: 'white' }} 
                                                                onClick={() => openDeleteModal(gradoAsignatura)}
                                                            >
                                                                {/* ICONO PARA ABRIR EL MODAL DE ELIMINAR*/}
                                                                <CIcon icon={cilX} /> 
                                                            </CButton>
                    
                                                        </div>
                                                        ) : (
                                                            
                                                            <CButton  //BOTON PARA DESPLEGAR LAS ACCIONES DE ELIMINAR
                                                                style={{ padding: '4px 8px', backgroundColor: '#E74C3C', color: 'white', margin: '0 41px' }} 
                                                                //color="warning" 
                                                                onClick={() => openDeleteModal(gradoAsignatura)}
                                                            >      
                                                                {/* ICONO DE LAPIZ PARA ABRIR LAS ACCIONES*/}  
                                                                <CIcon icon={cilX} /> 
                                                            </CButton>
                                                        )}
                                                </CTableDataCell>
                                            </CTableRow>
                                        ))}
                                    </CTableBody>
                                </CTable>
                            ) : (
                                <p>No hay asignaturas disponibles para este grado.</p>
                            )}
                            
                        </CModalBody>
                        <CModalFooter>
                            {/* BOTON PARA CERRAR LA ACCIÓN */}
                            <CButton size="small" color="secondary" onClick={handleCloseModal}>CERRAR</CButton>
                        </CModalFooter>
                    </CModal>

                {/* Modal Eliminar Asignatura */}
                <CModal visible={modalDeleteVisible} onClose={() => setModalDeleteVisible(false)} backdrop="static">
                    <CModalHeader>
                        <CModalTitle>Confirmar Eliminación</CModalTitle>
                    </CModalHeader>
                        <CModalBody>
                            <p>¿Estás seguro de que deseas eliminar la asignatura '<strong>{GradoAsignaturaToDelete.Nombre_asignatura}</strong>' correspondiente a '<strong>{GradoAsignaturaToDelete.Nombre_grado}</strong>?</p>
                        </CModalBody>
                        <CModalFooter>
                                {/* BOTON PARA CANCELAR LA ACCIÓN */}
                            <CButton color="secondary" onClick={() => setModalDeleteVisible(false)}>
                                Cancelar
                            </CButton>
                                {/* BOTON PARA ELIMINAR LA ASIGNATURA DE ESE GRADO */}
                            <CButton style={{ backgroundColor: '#E57368', color: 'white' }} onClick={handleDeleteGradoAsignatura}>
                                <CIcon icon={cilTrash} style={{ marginRight: '5px' }} /> Eliminar
                            </CButton>
                        </CModalFooter>
                </CModal>

                {/* MODAL PARA INSERTAR LAS ASIGNATURAS */}
                <CModal visible={assignModalVisible} backdrop="static">
                    <CModalHeader closeButton={false}>
                        <CModalTitle>ASIGNAR ASIGNATURA A {getGradoName(nuevoGrado)}</CModalTitle> {/* Muestra el nombre del Grado */}
                        <CButton
                        className="btn-close"
                        aria-label="Close"
                        onClick={() => {
                            setGradosAsignaturas([]); // Limpia los grados asignaturas
                            handleCloseInsertModal(setAssignModalVisible, resetAsignatura); // Llama a la función para cerrar el modal
                        }}
                        />
                    </CModalHeader>
                        <CModalBody>
                            <CFormSelect
                                value={nueva_Asignatura}
                                onChange={(e) => setNueva_Asignatura(e.target.value)}
                                >
                                <option value="">SELECCIONE UNA ASIGNATURA</option>
                                
                                    {Asignaturas.map((gradoAsignatura) => (
                                    <option key={gradoAsignatura.Cod_asignatura} value={gradoAsignatura.Cod_asignatura}>
                                    {gradoAsignatura.Nombre_asignatura}
                                </option>
                                ))}
                            </CFormSelect>        
                        </CModalBody>
                        <CModalFooter>
                            {/* BOTON PARA INSERTAR LA ASIGNATURA AL GRADO */}
                            <CButton color="primary" onClick={asignarAsignatura}>
                                ASIGNAR
                            </CButton>
                            {/* BOTON PARA CERRAR EL MODAL */}
                            {/* <CButton color="secondary" onClick={() => setAssignModalVisible(false)}>CERRAR</CButton> */}
                            <CButton color="secondary" onClick={() => handleCloseInsertModal(setAssignModalVisible, resetAsignatura)}>
                                CANCELAR
                            </CButton>
                        </CModalFooter>
                </CModal>   
            </div>
    );

}

export default ListaGradosAsignaturas;