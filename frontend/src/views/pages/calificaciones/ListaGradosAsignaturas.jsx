import React, { useEffect, useState } from 'react';

import { CIcon } from '@coreui/icons-react';
import { cilSearch, cilBrushAlt, cilPen, cilTrash, cilPlus, cilInfo, cilSave, cilDescription, cilCheck, cilX, cilNoteAdd, cilSpreadsheet, cilFile } from '@coreui/icons';
import { jsPDF } from "jspdf";
import Swal from 'sweetalert2';
//import "jspdf-autotable"; // Importar para tablas
import logo from 'src/assets/brand/logo_saint_patrick.png'
//import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

import {
    CContainer,
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
    CInputGroup,
    CInputGroupText,
    CPagination,

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
    const [recordsPerPage, setRecordsPerPage] = useState(5); // Hacer dinámico el número de registros por página
    const [currentPage, setCurrentPage] = useState(1); // Estado para la página actual
    const [searchTerm, setSearchTerm] = useState('');
    const [gradoActual, setGradoActual] = useState(null);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false); // Estado para controlar el modal
    const [assignModalVisible, setAssignModalVisible] = useState(false); // Estado para controlar el modal de asignación
    const [modalDeleteVisible, setModalDeleteVisible] = useState(false); // Estado para el modal de eliminar asignatura
    const [editIndex, setEditIndex] = useState(null);
    const [editedData, setEditedData] = useState({});
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false); // Estado para detectar cambios sin guardar
    const resetAsignatura = () => setNueva_Asignatura({ Nombre_asignatura: '' });


    useEffect(() => {
        fetchGrados();
        fetchAsignaturas();
    }, []);

    //LLAMADO AL GET GRADOS
    const fetchGrados = async () => {
        try {
            const response = await fetch('http://74.50.68.87/api/grados/verGrados');
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

    const handleOpenModal = (grado) => {
        setGradoActual(grado); // Guarda el grado seleccionado
        setModalVisible(true); // Abre el modal
    };

    const handleEditClick = (index, gradosAsignaturas) => {
        setEditIndex(index);
        setEditedData(gradosAsignaturas); // Inicializa el estado con los datos actuales
    };

    //llamado a todos los grados y sus asignaturas
    const fetchGradosAsignaturasOrden = async () => {
        try {
            const response = await fetch('http://74.50.68.87/api/gradoAsignatura/obtenerGradosAsignaturasOrden'); // URL de tu API
            const data = await response.json();

            return data; // Devuelve directamente los datos completos
        } catch (error) {
            console.error('Error al obtener los grados y asignaturas:', error);
            return [];
        }
    };

    // LLAMADO AL GET ASIGNATURAS
    const fetchAsignaturas = async () => {
        try {
            const response = await fetch('http://74.50.68.87/api/asignaturas/verAsignaturas');
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
            const response = await fetch(`http://74.50.68.87/api/gradoAsignatura/verGradosAsignaturas/${codGrado}`);
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

    // BUSQUEDA DEL NOMBRE DE LAS ASIGNATURAS
    const getDescripcionName = (codAsignatura) => {
        if (!Asignaturas.length) return 'Asignaturas no disponibles';
        const Asignatura = Asignaturas.find((c) => c.Cod_asignatura === codAsignatura);
        return Asignatura ? Asignatura.Descripcion_asignatura : 'Asignatura no encontrada';
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


    // LLAMADO DE REPORTERÍA DE TODOS LOS GRADOS CON SUS ASIGNATURAS
    const handleReporteClickOrden = async () => {
        try {
            const gradosAsignaturas = await fetchGradosAsignaturasOrden(); // Obtén los datos de la API

            if (!gradosAsignaturas.length) {
                Swal.fire({
                    icon: 'info',
                    title: 'Sin datos',
                    text: 'No hay información disponible para generar el reporte.',
                    confirmButtonText: 'Entendido',
                });
                return;
            }

            // Agrupar asignaturas por grado
            const agrupadoPorGrado = gradosAsignaturas.reduce((acc, item) => {
                if (!acc[item.Nombre_grado]) {
                    acc[item.Nombre_grado] = [];
                }
                acc[item.Nombre_grado].push(item);
                return acc;
            }, {});

            // Generar el PDF con los datos agrupados
            generatePDF_Orden(agrupadoPorGrado);
        } catch (error) {
            console.error('Error al generar el reporte:', error);
        }
    };

    // GENERACIÓN DE REPORTERÍA PARA TODOS LOS GRADOS Y SUS ASIGNATURAS
    const generatePDF_Orden = (agrupadoPorGrado) => {
        const doc = new jsPDF();
        const img = new Image();
        img.src = logo; // Asegúrate de que esta variable tenga un valor válido
    
        let pageHeight = doc.internal.pageSize.height;
    
        img.onload = () => {
            Object.entries(agrupadoPorGrado).forEach(([grado, asignaturas], index) => {
                if (index > 0) doc.addPage(); // Nueva página por cada grado
    
                // Encabezado
                doc.addImage(img, 'PNG', 10, 10, 30, 30);
                let yPosition = 20;
                doc.setFontSize(18);
                doc.setTextColor(0, 102, 51);
                doc.text('SAINT PATRICK\'S ACADEMY', doc.internal.pageSize.width / 2, yPosition, { align: 'center' });
                yPosition += 12;

                doc.setFontSize(16);
                doc.text(`Grado: ${grado}`, doc.internal.pageSize.width / 2, yPosition, { align: 'center' });
                yPosition += 10; 

                doc.setFontSize(10);
                doc.text('Casa Club del periodista, Colonia del Periodista', doc.internal.pageSize.width / 2, yPosition, { align: 'center' });
                yPosition += 4;
                doc.text('Teléfono: (504) 2234-8871', doc.internal.pageSize.width / 2, yPosition, { align: 'center' });
                yPosition += 4;
                doc.text('Correo: info@saintpatrickacademy.edu', doc.internal.pageSize.width / 2, yPosition, { align: 'center' });
                yPosition += 6;
                
               
                

                doc.setLineWidth(0.5);
                doc.setDrawColor(0, 102, 51);
                doc.line(10, yPosition, doc.internal.pageSize.width - 10, yPosition);
    
                // Tabla
                const tableRows = asignaturas.map((item, i) => [
                    i + 1, // Índice
                    item.Nombre_grado || '',
                    item.Nombre_asignatura || '',
                    item.Descripcion_asignatura || ''
                ]);
    
                doc.autoTable({
                    startY: yPosition + 4,
                    head: [['#', 'Grado', 'Asignatura', 'Descripción']],
                    body: tableRows,
                    styles: { fontSize: 10, cellPadding: 3, halign: 'center' },
                    headStyles: { fillColor: [0, 102, 51], textColor: [255, 255, 255] },
                    alternateRowStyles: { fillColor: [240, 248, 255] },
                     });
        });

        // Calcular total de páginas
        const totalPages = doc.internal.getNumberOfPages();

        // Agregar pie de página en cada página
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);
            const currentDate = new Date();
            const formattedDate = `${currentDate.toLocaleDateString()} ${currentDate.toLocaleTimeString()}`;
            doc.setFontSize(10);
            doc.setTextColor(100);
            doc.text(`Fecha y hora de generación: ${formattedDate}`, 10, pageHeight - 10);
            doc.text(`Página ${i} de ${totalPages}`, doc.internal.pageSize.width - 30, pageHeight - 10);
        }
    
            // Abre el PDF
            window.open(doc.output('bloburl'), '_blank');
        };
    
        img.onerror = () => {
            console.warn('No se pudo cargar el logo. El PDF se generará sin el logo.');
            window.open(doc.output('bloburl'), '_blank');
        };
    };
    

    //llAMADO AL GENERADO DE REPORTERIA PARA UN SOLO GRADO
    const handleReporteClick = () => {
        const doc = new jsPDF();
        const img = new Image();
        img.src = logo; // Asegúrate de que "logo" sea la ruta correcta de la imagen.
    
        let yPosition = 20;  // Inicializa la posición vertical
        let pageHeight = doc.internal.pageSize.height; // Obtiene la altura de la página
    
        img.onload = () => {
            // Agregar el logo
            doc.addImage(img, 'PNG', 10, 10, 30, 30); // Logo en la esquina superior izquierda
    
            // Encabezado principal
            doc.setFontSize(18);
            doc.setTextColor(0, 102, 51); // Verde
            doc.text('SAINT PATRICK\'S ACADEMY', doc.internal.pageSize.width / 2, yPosition, { align: 'center' });
            yPosition += 12; // Aumenta la posición vertical para los siguientes elementos
    
            // Título del reporte
            doc.setFontSize(16);
            doc.setTextColor(0, 102, 51);
            const nombreGrado = getGradoName(gradoActual?.Cod_grado); // Ajustar según la estructura de datos
            doc.text(`Reporte de Asignaturas ${nombreGrado}`, doc.internal.pageSize.width / 2, yPosition, { align: 'center' });
            yPosition += 10; // Aumenta la posición vertical
    
            // Subtítulo: información del colegio
            doc.setFontSize(10);
            doc.text('Casa Club del periodista, Colonia del Periodista', doc.internal.pageSize.width / 2, yPosition, { align: 'center' });
            yPosition += 4;
            doc.text('Teléfono: (504) 2234-8871', doc.internal.pageSize.width / 2, yPosition, { align: 'center' });
            yPosition += 4;
            doc.text('Correo: info@saintpatrickacademy.edu', doc.internal.pageSize.width / 2, yPosition, { align: 'center' });
            yPosition += 6; // Aumenta la posición para la línea divisoria
    
            // Línea divisoria
            doc.setLineWidth(0.5);
            doc.setDrawColor(0, 102, 51);
            doc.line(10, yPosition, doc.internal.pageSize.width - 10, yPosition);
            yPosition += 6; // Ajuste para el espacio posterior a la línea divisoria
    
            // Datos de la tabla
            const tableRows = [];
            gradosAsignaturas.forEach((gradoAsignatura, index) => {
                const rowData = [
                    index + 1,
                    getAsignaturaName(gradoAsignatura.Cod_asignatura),
                    getDescripcionName(gradoAsignatura.Cod_asignatura),
                ];
                tableRows.push(rowData);
            });
    
            // Agregar la tabla con autoTable
            doc.autoTable({
                startY: yPosition, // Comienza debajo del título
                head: [['#', 'Nombre de la Asignatura', 'Descripción']],
                body: tableRows,
                headStyles: {
                    fillColor: [0, 102, 51], // Verde para el encabezado
                    textColor: [255, 255, 255], // Blanco para texto del encabezado
                },
                styles: {
                    fontSize: 10,
                    halign: 'center', // Texto centrado
                },
                alternateRowStyles: { fillColor: [240, 248, 255] }, // Color alterno para filas
                didDrawPage: (data) => {
                    const currentDate = new Date();
                    const formattedDate = `${currentDate.toLocaleDateString()} ${currentDate.toLocaleTimeString()}`;
                    const pageHeight = doc.internal.pageSize.height; // Altura de la página
                    doc.setFontSize(10);
                    doc.setTextColor(100);
                    // Fecha y hora en el pie de página
                    doc.text(`Fecha y hora de generación: ${formattedDate}`, 10, pageHeight - 10);
                },
                });
                
                // Asegúrate de calcular el total de páginas al final
                const totalPages = doc.internal.getNumberOfPages();
                const pageWidth = doc.internal.pageSize.width; // Ancho de la página
                
                for (let i = 1; i <= totalPages; i++) {
                    doc.setPage(i); // Ve a cada página
                    doc.setTextColor(100);
                    const text = `Página ${i} de ${totalPages}`;
                    // Agrega número de página en la posición correcta
                    doc.text(text, pageWidth - 30, pageHeight - 10);
                }
    
            // Abre el PDF
            window.open(doc.output('bloburl'), '_blank');
        };
    
        img.onerror = () => {
            console.warn('No se pudo cargar el logo. El PDF se generará sin el logo.');
            window.open(doc.output('bloburl'), '_blank');
        };
    };
    

    // LLAMADO A LA REPORTERIA EN EXCEL
    const handleReporteExcelClick = () => {
        // Encabezados de la tabla
        const encabezados = [
            ["Saint Patrick Academy"],
            ["Listado de Asignaturas del Grados:"],
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
            const response = await fetch('http://74.50.68.87/api/gradoAsignatura/crearGradoAsignatura', {
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

    // LLAMADO DE API PARA PODER ELIMINAR UNA ASIGNATURA DE UN GRADO
    const handleDeleteGradoAsignatura = async () => {
        try {
            const response = await fetch('http://74.50.68.87/api/gradoAsignatura/eliminarGradoAsignaturas', {
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

    // Cambia el estado de la página actual después de aplicar el filtro
    // Validar el buscador
    const handleSearch = (event) => {
        const input = event.target.value.toUpperCase();
        const regex = /^[A-ZÑ\s]*$/; // Solo permite letras, espacios y la letra "Ñ"

        if (!regex.test(input)) {
            Swal.fire({
                icon: 'warning',
                title: 'Caracteres no permitidos',
                text: 'Solo se permiten letras y espacios.',
            });
            return;
        }
        setSearchTerm(input);
        setCurrentPage(1); // Resetear a la primera página al buscar
    };

    // Filtro de búsqueda
    const filteredGrados = grados.filter((grado) =>
        grado.Nombre_grado.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Lógica de paginación
    const indexOfLastRecord = currentPage * recordsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
    const currentRecords = filteredGrados.slice(indexOfFirstRecord, indexOfLastRecord);

    // Cambiar página
    const paginate = (pageNumber) => {
        if (pageNumber > 0 && pageNumber <= Math.ceil(filteredGrados.length / recordsPerPage)) {
            setCurrentPage(pageNumber);
        }
    };


    //Verificar permisos
    if (!canSelect) {
        return <AccessDenied />;
    }

    return (
        <CContainer>
            <div className="container mt-4">
                <CRow className="align-items-center mb-5">
                    <CCol xs="11" className="d-flex align-items-center">
                        {/* Título de la página */}
                        <h2 className="mb-0">Proceso de Asignación: Asignaturas a cada Grado</h2>
                    </CCol>
                </CRow>

                {/* Contenedor de la barra de búsqueda y el selector dinámico */}
                <CRow className="align-items-center mt-4 mb-2">
                    {/* Barra de búsqueda  */}
                    <CCol xs="12" md="8" className="d-flex flex-wrap align-items-center">
                        <CInputGroup className="me-3" style={{ width: '400px' }}>
                            <CInputGroupText>
                                <CIcon icon={cilSearch} />
                            </CInputGroupText>
                            <CFormInput
                                placeholder="Buscar Grado..."
                                onChange={handleSearch}
                                value={searchTerm}
                            />
                            <CButton
                                style={{
                                    border: '1px solid #ccc',
                                    transition: 'all 0.1s ease-in-out', // Duración de la transición
                                    backgroundColor: '#F3F4F7', // Color por defecto
                                    color: '#343a40' // Color de texto por defecto
                                }}
                                onClick={() => {
                                    setSearchTerm('');
                                    setCurrentPage(1);
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#E0E0E0'; // Color cuando el mouse sobre el boton "limpiar"
                                    e.currentTarget.style.color = 'black'; // Color del texto cuando el mouse sobre el boton "limpiar"
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = '#F3F4F7'; // Color cuando el mouse no está sobre el boton "limpiar"
                                    e.currentTarget.style.color = '#343a40'; // Color de texto cuando el mouse no está sobre el boton "limpiar"
                                }}
                            >
                                <CIcon icon={cilBrushAlt} /> Limpiar
                            </CButton>
                        </CInputGroup>
                    </CCol>

                    {/* Selector dinámico a la par de la barra de búsqueda */}
                    <CCol xs="12" md="4" className="text-md-end mt-2 mt-md-0">
                        <CInputGroup className="mt-2 mt-md-0" style={{ width: 'auto', display: 'inline-block' }}>
                            <div className="d-inline-flex align-items-center">
                                <span>Mostrar&nbsp;</span>
                                <CFormSelect
                                    style={{ width: '80px', display: 'inline-block', textAlign: 'center' }}
                                    onChange={(e) => {
                                        const value = Number(e.target.value);
                                        setRecordsPerPage(value);
                                        setCurrentPage(1); // Reiniciar a la primera página cuando se cambia el número de registros
                                    }}
                                    value={recordsPerPage}
                                >
                                    <option value="5">5</option>
                                    <option value="10">10</option>
                                    {/* <option value="20">20</option> */}
                                </CFormSelect>
                                <span>&nbsp;registros</span>
                            </div>
                        </CInputGroup>
                    </CCol>
                </CRow>
                <CCard>
                    <CCardHeader>
                        <div className="table-container" style={{ maxHeight: '400px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <strong>INFORMACION DE LOS GRADOS</strong> {/* Texto alineado a la izquierda */}
                            <CButton
                                style={{
                                    backgroundColor: '#6C8E58',
                                    color: 'white',
                                }}
                                onClick={() => handleReporteClickOrden()}
                            >
                                <CIcon icon={cilDescription}/> Reporte
                            </CButton>
                        </div>
                        <div className="mt-4">
                            <CTable striped bordered hover>
                                <CTableHead>
                                    <CTableRow>
                                        <CTableHeaderCell>#</CTableHeaderCell>
                                        <CTableHeaderCell>NOMBRE DE LOS GRADOS</CTableHeaderCell>
                                        <CTableHeaderCell style={{ textAlign: 'center', width: '40%' }}>ACCIONES</CTableHeaderCell>
                                    </CTableRow>
                                </CTableHead>
                                <CTableBody>
                                    {currentRecords.map((grado, index) => (
                                        <CTableRow key={grado.Cod_grado}>
                                            <CTableDataCell>{index + 1}</CTableDataCell>
                                            <CTableDataCell>{grado.Nombre_grado}</CTableDataCell>
                                            <CTableDataCell>
                                                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', alignItems: 'center', }}>
                                                    <CButton
                                                        style={{
                                                            backgroundColor: '#4B6251',
                                                            color: '#FFFFFF',
                                                            padding: '5px 10px',
                                                            fontSize: '0.9rem',
                                                            marginRight: '8px'
                                                        }}
                                                        onClick={() => handleInsertAsignaturaModal(grado.Cod_grado)}
                                                        onMouseEnter={(e) => {
                                                            e.currentTarget.style.backgroundColor = '#3C4B43'; // Fondo más oscuro
                                                            e.currentTarget.style.color = '#FFFFFF'; // Texto más claro
                                                            e.currentTarget.style.boxShadow = '0px 4px 10px rgba(60, 75, 67, 0.6)'; // Sombra suave
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.backgroundColor = '#4B6251'; // Fondo original
                                                            e.currentTarget.style.color = '#FFFFFF'; // Texto original
                                                            e.currentTarget.style.boxShadow = 'none'; // Quita la sombra
                                                        }}
              >
                                                        <CIcon icon={cilPlus} className="me-2" style={{ color: '#FFFFFF', fontSize: '1rem' }} />
                                                        Asignar
                                                    </CButton>
                                                    <CButton 
                                                     onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0px 4px 10px rgba(93, 138, 168, 0.6)';e.currentTarget.style.color = '#000000'; }}
                                                     onMouseLeave={(e) => {e.currentTarget.style.boxShadow = 'none';e.currentTarget.style.color = '#5C4044';}}
                                                     style={{backgroundColor: '#5D8AA8',marginRight: '10px',color: '#5C4044',border: 'none', transition: 'all 0.2s ease',padding: '5px 10px', height: '38px',width: '45px', }}
                                                    onClick={() => handleOpenAssignModal(grado.Cod_grado, handleOpenModal(grado))}>

                                                        <CIcon icon={cilInfo} />

                                                    </CButton>
                                                </div>
                                            </CTableDataCell>
                                        </CTableRow>
                                    ))}
                                </CTableBody>
                            </CTable>
                        </div>
                        {/* Paginación Fija */}
                        <div className="pagination-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <CPagination aria-label="Page navigation">
                                <CButton
                                    style={{ backgroundColor: '#6f8173', color: '#D9EAD3' }}
                                    disabled={currentPage === 1} // Desactiva si es la primera página
                                    onClick={() => paginate(currentPage - 1)} // Páginas anteriores
                                >
                                    Anterior
                                </CButton>
                                <CButton
                                    style={{ marginLeft: '10px', backgroundColor: '#6f8173', color: '#D9EAD3' }}
                                    disabled={currentPage === Math.ceil(filteredGrados.length / recordsPerPage)} // Desactiva si es la última página
                                    onClick={() => paginate(currentPage + 1)} // Páginas siguientes
                                >
                                    Siguiente
                                </CButton>
                            </CPagination>
                            <span style={{ marginLeft: '10px' }}>
                                Página {currentPage} de {Math.ceil(filteredGrados.length / recordsPerPage)}
                            </span>
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
                        <CModalTitle><strong>ASIGNATURAS EXISTENTES EN {getGradoName(gradoActual?.Cod_grado)}</strong></CModalTitle>
                        <CDropdown>
                            <CDropdownToggle
                                style={{ backgroundColor: '#6C8E58', color: 'white', marginLeft: '370px', fontSize: '0.85rem', cursor: 'pointer' }}
                            >
                              <CIcon icon={cilDescription}/> Reporte
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
                                    <CIcon icon={cilFile} size="sm" /> Abrir en PDF
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
                            <CTable striped bordered hover>
                                <CTableHead>
                                    <CTableRow>
                                        <CTableHeaderCell>#</CTableHeaderCell>
                                        <CTableHeaderCell>NOMBRE DE LA ASIGNATURA</CTableHeaderCell>
                                        {/* <CTableHeaderCell style={{  width: '35%' }}>GRADO</CTableHeaderCell> */}
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
                                            {/* <CTableDataCell>{getGradoName(gradoAsignatura.Cod_grado)}</CTableDataCell> */}
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
                                                         style={{
                                                            backgroundColor: '#E74C3C',
                                                            color: '#FFFFFF',
                                                            padding: '5px 10px',
                                                            fontSize: '0.9rem',
                                                            marginRight: '8px'
                                                        }}
                                                            onClick={() => openDeleteModal(gradoAsignatura)}
                                                        >
                                                            {/* ICONO PARA ABRIR EL MODAL DE ELIMINAR*/}
                                                            <CIcon icon={cilTrash} />
                                                        </CButton>

                                                    </div>
                                                ) : (

                                                    <CButton  //BOTON PARA DESPLEGAR LAS ACCIONES DE ELIMINAR
                                                        style={{ padding: '4px 8px', backgroundColor: '#E57368', color: 'white', margin: '0 41px' }}
                                                        //color="warning" 
                                                        onClick={() => openDeleteModal(gradoAsignatura)}
                                                    >
                                                        {/* ICONO DE LAPIZ PARA ABRIR LAS ACCIONES*/}
                                                        <CIcon icon={cilTrash} />
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
                        <CButton size="small" color="secondary" onClick={handleCloseModal}>Cerrar</CButton>
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
                        <CButton style={{ backgroundColor: '#4B6251', color: 'white' }} onClick={asignarAsignatura}>
                            Guardar
                        </CButton>
                        {/* BOTON PARA CERRAR EL MODAL */}
                        {/* <CButton color="secondary" onClick={() => setAssignModalVisible(false)}>CERRAR</CButton> */}
                        <CButton color="secondary" onClick={() => handleCloseInsertModal(setAssignModalVisible, resetAsignatura)}>
                            Cancelar
                        </CButton>
                    </CModalFooter>
                </CModal>
            </div>
        </CContainer>

    );

}

export default ListaGradosAsignaturas;
