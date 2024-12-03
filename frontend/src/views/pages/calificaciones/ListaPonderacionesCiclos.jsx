import React, { useEffect, useState } from 'react';
import { CIcon } from '@coreui/icons-react';
import { cilPlus, cilFile, cilSearch, cilBrushAlt, cilSpreadsheet, cilDescription, cilSave, cilX, cilCheck, cilPen, cilInfo } from '@coreui/icons';
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
    CInputGroup,
    CInputGroupText,
    CTableBody,
    CFormInput,
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
    CSpinner,
    CPagination
} from '@coreui/react';
import usePermission from '../../../../context/usePermission';
import AccessDenied from "../AccessDenied/AccessDenied"
const ListaPonderacionesCiclos = () => {
    const { canSelect, canInsert, canUpdate } = usePermission('ListaPonderacionesCiclos');
    const [ponderacionesciclos, setPonderacionesCiclos] = useState([]);
    const [ponderaciones, setPonderaciones] = useState([]);
    const [ciclos, setCiclos] = useState([]);
    const [grados, setGrados] = useState([]);
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
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1); // Estado para la página actual
    const [recordsPerPage, setRecordsPerPage] = useState(5); // Hacer dinamico el número de registro de paginas

    useEffect(() => {
        fetchCiclos();
        fetchPonderaciones();
        fetchGrados();
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

    const filtrarGradosPorCiclo = (codCiclo) => {
        return grados.filter((grado) => grado.Cod_ciclo === codCiclo);
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
                // Recargar las ponderaciones para el ciclo seleccionado
                await fetchPonderacionCiclo(cicloParaAsignar.Cod_ciclo);

                // Abrir el modal de información con datos actualizados
                setModalVisible(true);

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
         // Validar que haya datos en la tabla
        if (!ciclos || ciclos.length === 0) {
            Swal.fire({
            icon: 'info',
            title: 'Tabla vacía',
            text: 'No hay datos disponibles para generar el reporte.',
            confirmButtonText: 'Entendido',
            });
            return; // Salir de la función si no hay datos
        }
        
        const doc = new jsPDF();
        const img = new Image();
        img.src = logo;

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

            // Información adicional
            doc.setFontSize(10);
            doc.setTextColor(100); // Gris para texto secundario
            doc.text('Casa Club del periodista, Colonia del Periodista', doc.internal.pageSize.width / 2, yPosition, { align: 'center' });
        
            yPosition += 4;
        
            doc.text('Teléfono: (504) 2234-8871', doc.internal.pageSize.width / 2, yPosition, { align: 'center' });
        
            yPosition += 4;
        
            doc.text('Correo: info@saintpatrickacademy.edu', doc.internal.pageSize.width / 2, yPosition, { align: 'center' });
            yPosition += 6; // Espaciado antes de la línea divisoria

            // Línea divisoria
            doc.setLineWidth(0.5);
            doc.setDrawColor(0, 102, 51);
            doc.line(10, yPosition, doc.internal.pageSize.width - 10, yPosition);

           // Configuración para la tabla
            const pageHeight = doc.internal.pageSize.height; // Altura de la página
            let pageNumber = 1; // Página inicial

            // Configuración de tabla
            doc.autoTable({
                startY: yPosition + 4,
                head: [['#', 'Nombre Ciclo', 'Grados Asignados']],
                body: ciclos.map((ciclo, index) => [
                    index + 1,
                    ciclo.Nombre_ciclo,
                    filtrarGradosPorCiclo(ciclo.Cod_ciclo) // Obtén los grados asignados al ciclo
                        .map((grado) => grado.Nombre_grado) // Obtén el nombre de cada grado
                        .join(', ') // Únelos en una sola cadena
                ]),
                headStyles: {
                    fillColor: [0, 102, 51],
                    textColor: [255, 255, 255],
                    fontSize: 10,
                },
                styles: {
                    fontSize: 10,
                    cellPadding: 3,
                    halign: 'center', // Centrado del texto en las celdas
                },
                columnStyles: {
                    0: { cellWidth: 'auto' }, // Columna '#' se ajusta automáticamente
                    1: { cellWidth: 'auto' }, // Columna 'Nombre Ciclo' se ajusta automáticamente
                    2: { cellWidth: 'auto' }, // Columna 'Grados Asignados' se ajusta automáticamente
                  },
                alternateRowStyles: { fillColor: [240, 248, 255] },
                didDrawPage: (data) => {
                    // Pie de página
                    const currentDate = new Date();
                    const formattedDate = `${currentDate.toLocaleDateString()} ${currentDate.toLocaleTimeString()}`;
                    doc.setFontSize(10);
                    doc.setTextColor(100);
                    doc.text(`Fecha y hora de generación: ${formattedDate}`, 10, pageHeight - 10);
                    const totalPages = doc.internal.getNumberOfPages(); // Obtener el total de páginas
                    doc.text(`Página ${pageNumber} de ${totalPages}`, doc.internal.pageSize.width - 30, pageHeight - 10);
                    pageNumber += 1; // Incrementar el número de página
                  },
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
        // Validar que haya datos en la tabla
        if (!ponderacionesciclos || ponderacionesciclos.length === 0) {
            Swal.fire({
            icon: 'info',
            title: 'Tabla vacía',
            text: 'No hay datos disponibles para generar el reporte.',
            confirmButtonText: 'Entendido',
            });
            return; // Salir de la función si no hay datos
        }
            const doc = new jsPDF();
            const img = new Image();
            img.src = logo; // Asegúrate de importar el logo correctamente
        
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
                doc.text('Reporte de Ponderaciones por Ciclo', doc.internal.pageSize.width / 2, yPosition, { align: 'center' });
                yPosition += 10;

                doc.setFontSize(12);
                doc.setTextColor(0, 0, 0); // Negro para el texto informativo
                if (selectedCiclo) {
                    doc.text(
                        `Ciclo: ${getCicloName(selectedCiclo)}`,
                        doc.internal.pageSize.width / 2,
                        yPosition,
                        { align: 'center' }
                    );
                    yPosition += 8; // Espaciado entre líneas de detalle
                } // Cierre del bloque if

                // Información adicional
                doc.setFontSize(10);
                doc.setTextColor(100); // Gris para texto secundario
                doc.text('Casa Club del periodista, Colonia del Periodista', doc.internal.pageSize.width / 2, yPosition, { align: 'center' });
                yPosition += 4;
        
                doc.text('Teléfono: (504) 2234-8871', doc.internal.pageSize.width / 2, yPosition, { align: 'center' });       
                yPosition += 4;
            
                doc.text('Correo: info@saintpatrickacademy.edu', doc.internal.pageSize.width / 2, yPosition, { align: 'center' });
                yPosition += 6; // Espaciado antes de la línea divisoria
                // Línea divisoria
                doc.setLineWidth(0.5);
                doc.setDrawColor(0, 102, 51);
                doc.line(10, yPosition, doc.internal.pageSize.width - 10, yPosition);
        
                // Configuración para la tabla
                const pageHeight = doc.internal.pageSize.height; // Altura de la página
                let pageNumber = 1; // Página inicial

                // Configuración de tabla
                doc.autoTable({
                    startY: yPosition + 4,
                    head: [['#', 'Descripción de Ponderación', 'Valor']],
                    body: ponderacionesciclos.map((ponderacionCiclo, index) => [
                        index + 1,
                        getPonderacionName(ponderacionCiclo.Cod_ponderacion), // Obtener descripción de la ponderación
                        `${ponderacionCiclo.Valor}%`, // Valor con el símbolo de porcentaje
                    ]),
                    headStyles: {
                        fillColor: [0, 102, 51],
                        textColor: [255, 255, 255],
                        fontSize: 10,
                    },
                    styles: {
                        fontSize: 10,
                        cellPadding: 3,
                        halign: 'center',
                    },
                    columnStyles: {
                        0: { cellWidth: 'auto' }, // Columna '#' se ajusta automáticamente
                        1: { cellWidth: 'auto' }, // Columna 'Nombre Ciclo' se ajusta automáticamente
                        2: { cellWidth: 'auto' }, // Columna 'Grados Asignados' se ajusta automáticamente
                        3: { cellWidth: 'auto' }, // Columna 'Grados Asignados' se ajusta automáticamente
                      },
                    alternateRowStyles: { fillColor: [240, 248, 255] },
                    didDrawPage: (data) => {
                        // Pie de página
                        const currentDate = new Date();
                        const formattedDate = `${currentDate.toLocaleDateString()} ${currentDate.toLocaleTimeString()}`;
                        doc.setFontSize(10);
                        doc.setTextColor(100);
                        doc.text(`Fecha y hora de generación: ${formattedDate}`, 10, pageHeight - 10);
                        const totalPages = doc.internal.getNumberOfPages(); // Obtener el total de páginas
                        doc.text(`Página ${pageNumber} de ${totalPages}`, doc.internal.pageSize.width - 30, pageHeight - 10);
                        pageNumber += 1; // Incrementar el número de página
                      },
                });
        
                // Agregar el total al final del reporte
                const totalPonderaciones = calculateTotal(); // Calcula el total de los valores
                yPosition = doc.lastAutoTable.finalY + 11; // Posición debajo de la tabla
                doc.setFontSize(11);
                doc.setTextColor(100);
                doc.text(`Total : ${totalPonderaciones}%`, doc.internal.pageSize.width - 15, yPosition, { align: 'right' });
        
                // Abrir el PDF
                window.open(doc.output('bloburl'), '_blank');
            };
        
            img.onerror = () => {
                console.warn('No se pudo cargar el logo. El PDF se generará sin el logo.');
                window.open(doc.output('bloburl'), '_blank');
            };
        };
        

        const handleReporteExcelClick = () => {
            // Encabezados de la tabla
            const encabezados = [
                ["Saint Patrick Academy"],
                ["Reporte de Ponderaciones por Ciclo"],
                [`Fecha de generación: ${new Date().toLocaleDateString()}`],
                [], // Espacio en blanco
            ];
        
            // Agregar el ciclo seleccionado si está disponible
            if (selectedCiclo) {
                encabezados.push([`Ciclo: ${getCicloName(selectedCiclo)}`]);
                encabezados.push([]); // Espaciado adicional
            }
        
            // Encabezados de la tabla
            encabezados.push(["#", "Descripción de Ponderación", "Valor"]);
        
            // Crear filas de la tabla con los datos de las ponderaciones
            const filas = ponderacionesciclos.map((ponderacionCiclo, index) => [
                index + 1,
                getPonderacionName(ponderacionCiclo.Cod_ponderacion), // Obtener descripción de la ponderación
                `${ponderacionCiclo.Valor}%`, // Valor con símbolo de porcentaje
            ]);
        
            // Calcular el total y agregarlo como una fila separada
            const totalPonderaciones = calculateTotal();
            filas.push(["", "", "Total", `${totalPonderaciones}%`]);
        
            // Combinar encabezados y filas
            const datos = [...encabezados, ...filas];
        
            // Crear una hoja de trabajo con los datos
            const hojaDeTrabajo = XLSX.utils.aoa_to_sheet(datos);
        
            // Ajustar el ancho de columnas automáticamente
            const ajusteColumnas = [
                { wpx: 50 },  // Número
                { wpx: 280 }, // Descripción de Ponderación
                { wpx: 100 }  // Valor
            ];
            hojaDeTrabajo['!cols'] = ajusteColumnas;
        
            // Crear un libro de trabajo y añadir la hoja
            const libroDeTrabajo = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(libroDeTrabajo, hojaDeTrabajo, "Reporte de Ponderaciones por Ciclo");
        
            // Guardar el archivo Excel
            const nombreArchivo = `reporte_ponderaciones_${new Date().toLocaleDateString().replace(/\//g, '-')}.xlsx`;
            XLSX.writeFile(libroDeTrabajo, nombreArchivo);
        };
        
        

    const handleReporteExceacaiclolClick = () => {
         // Validar que haya datos en la tabla
    if (!ciclos || ciclos.length === 0) {
        Swal.fire({
        icon: 'info',
        title: 'Tabla vacía',
        text: 'No hay datos disponibles para generar el reporte excel.',
        confirmButtonText: 'Entendido',
        });
        return; // Salir de la función si no hay datos
    }
        // Encabezados de la tabla
        const encabezados = [
            ["Saint Patrick Academy"],
            ["Reporte de Información de los Ciclos"],
            [`Fecha de generación: ${new Date().toLocaleDateString()}`],
            [], // Espacio en blanco
            ["#", "Nombre Ciclo", "Grados Asignados"]
        ];

        // Crear filas de la tabla con los datos de los ciclos
        const filas = ciclos.map((ciclo, index) => [
            index + 1,
            ciclo.Nombre_ciclo,
            filtrarGradosPorCiclo(ciclo.Cod_ciclo) // Obtén los grados asignados al ciclo
            .map((grado) => grado.Nombre_grado) // Obtén el nombre de cada grado
            .join(', ') // Únelos en una sola cadena
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

    // Filtrar los ciclos según un término de búsqueda
    const filteredCiclos = ciclos.length > 0
        ? ciclos.filter(ciclo => {
            const nombreCiclo = ciclo.Nombre_ciclo?.toUpperCase().trim() || ''; // Normaliza el texto
            return nombreCiclo.includes(searchTerm.trim().toUpperCase()); // Busca coincidencias
        })
        : [];


    // Cambiar página
    const paginate = (pageNumber) => {
        if (pageNumber > 0 && pageNumber <= Math.ceil(filteredCiclos.length / recordsPerPage)) {
            setCurrentPage(pageNumber); // Cambiar la página actual
        }
    };

    // Manejar la búsqueda con validación
    const handleSearch = (event) => {
        let value = event.target.value.toUpperCase(); // Convertir la entrada a mayúsculas
        const regex = /^[A-ZÑÁÉÍÓÚ0-9\s,]*$/; // Permitir solo letras, espacios y la letra "Ñ"


        if (/\s{2,}/.test(value)) {
            Swal.fire({
              icon: 'warning',
              title: 'Espacios múltiples',
              text: 'No se permite más de un espacio entre palabras.',
            });
            value = value.replace(/\s+/g, ' '); // Reemplazar múltiples espacios por uno solo
          }

        if (!regex.test(value) && value !== '') {
            Swal.fire({
                icon: 'warning',
                title: 'Caracteres no permitidos',
                text: 'Solo se permiten letras y espacios.',
            });
            return; // Detener si la entrada no es válida
        }
         // Validación para letras repetidas más de 4 veces seguidas
    const words = value.split(' ');
    for (let word of words) {
      const letterCounts = {};
      for (let letter of word) {
        letterCounts[letter] = (letterCounts[letter] || 0) + 1;
        if (letterCounts[letter] > 4) {
          Swal.fire({
            icon: 'warning',
            title: 'Repetición de letras',
            text: `La letra "${letter}" se repite más de 4 veces en la palabra "${word}".`,
          });
          return;
        }
      }
    }
        setSearchTerm(value); // Actualizar el término de búsqueda
        setCurrentPage(1); // Resetear a la primera página al buscar
    };

    useEffect(() => {
        console.log("Término de búsqueda:", searchTerm);
        console.log("Ciclos filtrados:", filteredCiclos);
    }, [searchTerm, filteredCiclos]);
    // Lógica de paginación
    const indexOfLastRecord = currentPage * recordsPerPage; // Índice del último registro en la página actual
    const indexOfFirstRecord = indexOfLastRecord - recordsPerPage; // Índice del primer registro en la página actual


    // Verificar permisos
    if (!canSelect) {
        return <AccessDenied />;
    }
    return (
        <div className="container mt-1">
            <CRow className='align-items-center mb-5'>
        
                    {/* Titulo de la pagina */}
                   
                

                <CCol xs="12" className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
                    <div className="flex-grow-1 text-center">
                        <h4 className="text-center fw-semibold pb-2 mb-0" style={{display: "inline-block", borderBottom: "2px solid #4CAF50"  }}>Gestión de Ponderaciones a Ciclos</h4>
                    </div>
                    {/*Boton reporte */}
                    <CDropdown className="btn-sm d-flex align-items-center gap-1 rounded shadow">
                        <CDropdownToggle
                            style={{ backgroundColor: '#6C8E58', color: 'white', fontSize: '0.85rem', cursor: 'pointer',transition: 'all 0.3s ease', }}
                            onMouseEnter={(e) => {e.currentTarget.style.backgroundColor = '#5A784C'; e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';  }}
                            onMouseLeave={(e) => {e.currentTarget.style.backgroundColor = '#6C8E58'; e.currentTarget.style.boxShadow = 'none'; }}>
                          <CIcon icon={cilDescription}/> Reporte
                        </CDropdownToggle>
                        <CDropdownMenu style={{position: "absolute", zIndex: 1050, /* Asegura que el menú esté por encima de otros elementos*/ backgroundColor: "#fff",boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.2)",borderRadius: "4px",overflow: "hidden",}}>
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
                                <CIcon icon={cilFile} size="sm" /> Abrir en PDF
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

            <CRow className='align-items-center mt-4 mb-2'>

                {/* Barra de búsqueda */}
                <CCol xs="12" md="8" className='d-flex flex-wrap align-items-center'>
                    <CInputGroup className="me-3" style={{ width: '350px' }}>
                        <CInputGroupText>
                            <CIcon icon={cilSearch} />
                        </CInputGroupText>
                        <CFormInput 
                        style={{ width: '80px',height:'35px', display: 'inline-block',fontSize: '0.8rem'}}
                            placeholder="Buscar ciclo..."
                            onChange={handleSearch}
                            value={searchTerm} />

                        {/* Botón para limpiar la búsqueda */}
                        <CButton
                            style={{
                                border: '1px solid #ccc',
                                transition: 'all 0.1s ease-in-out', // Duración de la transición
                                backgroundColor: '#F3F4F7', // Color por defecto
                                color: '#343a40', // Color de texto por defecto
                                height:'35px'
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
                {/*Selector dinamico a la par de la barra de busqueda */}
                <CCol xs="12" md="4" className='text-md-end mt-2 mt-md-0'>
                    <CInputGroup style={{ width: 'auto', display: 'inline-block' }}>
                        <div className='d-inline-flex align-items-center'>
                            <span style={{ fontSize: '0.85rem' }}>Mostrar&nbsp;</span>
                            <CFormSelect
                               style={{ width: '80px',height:'35px', display: 'inline-block', textAlign: 'center' }}
                                onChange={(e) => {
                                    const value = Number(e.target.value);
                                    setRecordsPerPage(value);
                                    setCurrentPage(1); // reinciar a la primera pagina cuando se cambia el numero de registros
                                }}
                                value={recordsPerPage}
                            >
                                <option value="5">5</option>
                                <option value="10">10</option>
                                <option value="20">20</option>
                            </CFormSelect>
                            <span style={{ fontSize: '0.85rem' }}>&nbsp;registros</span>
                        </div>
                    </CInputGroup>
                </CCol>
            </CRow>
            <div className="table-responsive" style={{maxHeight: '400px',overflowX: 'auto',overflowY: 'auto', boxShadow: "0 4px 10px rgba(0, 0, 0, 0.3)"}}>
            <CTable striped bordered hover responsive>
  <CTableHead className="sticky-top bg-light text-center" style={{fontSize: '0.8rem'}}>
    <CTableRow>
      <CTableHeaderCell>#</CTableHeaderCell>
      <CTableHeaderCell>NOMBRE DE CICLO</CTableHeaderCell>
      <CTableHeaderCell>GRADOS ASIGNADOS</CTableHeaderCell>
      <CTableHeaderCell>ACCIONES</CTableHeaderCell>
    </CTableRow>
  </CTableHead>
  <CTableBody className="text-center" style={{fontSize: '0.85rem',}}>
    {filteredCiclos.length > 0 ? (
      filteredCiclos
        .slice((currentPage - 1) * recordsPerPage, currentPage * recordsPerPage) // Paginar
        .map((ciclo, index) => (
          <CTableRow key={ciclo.Cod_ciclo}>
            <CTableDataCell>{index + 1 + (currentPage - 1) * recordsPerPage}</CTableDataCell>
            <CTableDataCell>{ciclo.Nombre_ciclo}</CTableDataCell>
            <CTableDataCell>
              {filtrarGradosPorCiclo(ciclo.Cod_ciclo)
                .map((grado) => grado.Nombre_grado)
                .join(', ')}
            </CTableDataCell>
            <CTableDataCell>
            <div style={{display: 'flex',gap: '10px',justifyContent: 'center',alignItems: 'center', }}>
              <CButton
                style={{
                  backgroundColor: '#4B6251',
                  color: '#FFFFFF',
                  padding: '5px 10px',
                  fontSize: '0.9rem',
                  marginRight: '8px'
                }}
                onClick={() => handleOpenAssignModal(ciclo)}
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
                onClick={() => fetchPonderacionCiclo(ciclo.Cod_ciclo)}
                onMouseEnter={(e) => {e.currentTarget.style.boxShadow = '0px 4px 10px rgba(249, 182, 78, 0.6)';e.currentTarget.style.color = '#000000';}}
                onMouseLeave={(e) => {e.currentTarget.style.boxShadow = 'none';e.currentTarget.style.color = '#5C4044';}}
                style={{backgroundColor: '#F9B64E',fontSize: '0.85rem', color: '#5C4044', fontSize: '1rem' }} >
                <CIcon icon={cilPen} />
              </CButton>
              </div>
            </CTableDataCell>
          </CTableRow>
        ))
    ) : (
      <CTableRow>
        <CTableDataCell colSpan={4} className="text-center">
          No se encontraron resultados
        </CTableDataCell>
      </CTableRow>
    )}
  </CTableBody>
</CTable>
 </div>
 {/* Paginación Fija */}
<div style={{ display: 'flex',  justifyContent: 'center', alignItems: 'center', marginTop: '16px' }}>
    <CPagination aria-label="Page navigation" style={{ display: 'flex', gap: '10px' }}>
        <CButton
        style={{ backgroundColor: '#6f8173', color: '#D9EAD3' }}
        disabled={currentPage === 1} // Deshabilitar si estás en la primera página
        onClick={() => paginate(currentPage - 1)}>
        Anterior
        </CButton>
        <CButton
        style={{ marginLeft: '10px',backgroundColor: '#6f8173', color: '#D9EAD3' }}
        disabled={currentPage === Math.ceil(filteredCiclos.length / recordsPerPage)} // Deshabilitar si estás en la última página
        onClick={() => paginate(currentPage + 1)}>
        Siguiente
    </CButton>
    </CPagination>
    {/* Mostrar total de páginas */}
    <span style={{ marginLeft: '10px' }}>
        Página {currentPage} de {Math.ceil(filteredCiclos.length / recordsPerPage)}
    </span>
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
                                                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#3C4B43")}onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#4B6251")}
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
                    <CButton color="secondary" style={{ fontSize: '0.85rem', cursor: 'pointer' }} onClick={() => setModalVisible(false)}>Cerrar</CButton>
                    <CDropdown>
                        <CDropdownToggle
                             style={{backgroundColor: '#6C8E58',color: 'white',fontSize: '0.85rem',cursor: 'pointer',transition: 'all 0.3s ease', }}
                             onMouseEnter={(e) => {e.currentTarget.style.backgroundColor = '#5A784C'; e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';  }}
                             onMouseLeave={(e) => {e.currentTarget.style.backgroundColor = '#6C8E58'; e.currentTarget.style.boxShadow = 'none'; }}
                        >
                          <CIcon icon={cilDescription}/> Reporte
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
                    <CButton style={{ backgroundColor: '#4B6251', color: 'white', fontSize: '0.85rem', cursor: 'pointer' }} onClick={asignarPonderacion}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#3C4B43")}onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#4B6251")} >
                        Guardar <CIcon icon={cilSave} 
                        />
                    </CButton>
                </CModalFooter>
            </CModal>
        </div>
    );
};

export default ListaPonderacionesCiclos;
