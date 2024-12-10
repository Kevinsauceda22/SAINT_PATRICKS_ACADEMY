import React, { useEffect, useState } from 'react';
import { cilCheckCircle, cilArrowLeft, cilSearch, cilSave, cilFile, cilSpreadsheet, cilPencil, cilInfo, cilPlus, cilPen } from '@coreui/icons';
import CIcon from '@coreui/icons-react';
import Swal from 'sweetalert2';

import {
  CContainer, CRow, CCol, CInputGroup, CCardBody, CFormSelect, CSpinner, CTable, CTableHead, CTableHeaderCell, CTableBody, CTableRow, CTableDataCell,
  CButton, CFormInput, CModal, CModalHeader, CModalBody, CModalFooter, CPopover, CPagination, CDropdownItem, CDropdown, CDropdownToggle, CDropdownMenu
} from '@coreui/react';

import logo from 'src/assets/brand/logo_saint_patrick.png'
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

import usePermission from '../../../../context/usePermission';
import AccessDenied from "../AccessDenied/AccessDenied"

const ListaActividadesAcaVistaPadre = () => {
  const { canSelect, canInsert, canUpdate,canDelete } = usePermission('ListaActividadesAcaVistaPadre');
  const [hijos, setHijos] = useState([]);
  const [hijoSeleccionado, setHijoSeleccionado] = useState(null);
  const [calificaciones, setCalificaciones] = useState([]);

  const [asignaturaSeleccionada, setAsignaturaSeleccionada] = useState(null);
  const [parcialSeleccionado, setParcialSeleccionado] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [vistaActual, setVistaActual] = useState('hijos');

  const token = localStorage.getItem('token');

  useEffect(() => {
    const obtenerDatos = async () => {
      setCargando(true);
      try {
        const response = await fetch('http://localhost:4000/api/actividades/actividadesAcademicasPadre/codPersona', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Error al obtener los datos');
        const data = await response.json();
  
        // Agrupar datos por hijos
        const agrupado = data.calificaciones.reduce((acc, actividad) => {
          const { cod_persona_estudiante, nombre_hijo, Nombre_asignatura, Nombre_parcial } = actividad;
  
          // Inicializar el hijo si no existe
          if (!acc[cod_persona_estudiante]) {
            acc[cod_persona_estudiante] = {
              id: cod_persona_estudiante,
              nombre: nombre_hijo,
              asignaturas: {}
            };
          }
  
          // Inicializar la asignatura si no existe
          if (!acc[cod_persona_estudiante].asignaturas[Nombre_asignatura]) {
            acc[cod_persona_estudiante].asignaturas[Nombre_asignatura] = {};
          }
  
          // Inicializar el parcial si no existe
          if (!acc[cod_persona_estudiante].asignaturas[Nombre_asignatura][Nombre_parcial]) {
            acc[cod_persona_estudiante].asignaturas[Nombre_asignatura][Nombre_parcial] = [];
          }
  
          // Añadir la actividad al parcial
          acc[cod_persona_estudiante].asignaturas[Nombre_asignatura][Nombre_parcial].push(actividad);
  
          return acc;
        }, {});
  
        // Convertir el objeto a un array para facilitar el renderizado
        setHijos(Object.values(agrupado));
      } catch (error) {
        console.error('Error al cargar los datos:', error);
      } finally {
        setCargando(false);
      }
    };
  
    obtenerDatos();
  }, [token]);

  const seleccionarHijo = (hijo) => {
    setHijoSeleccionado(hijo);
    setVistaActual('asignaturas');
  };

  const seleccionarAsignatura = (asignatura) => {
    setAsignaturaSeleccionada(asignatura);
    setVistaActual('parciales');
  };

  const seleccionarParcial = (parcial) => {
    setParcialSeleccionado(parcial);
    setVistaActual('actividades');
  };

  const volverAVistaHijos = () => {
    setHijoSeleccionado(null);
    setVistaActual('hijos');
  };

  const volverAVistaAsignaturas = () => {
    setAsignaturaSeleccionada(null);
    setVistaActual('asignaturas');
  };

  const volverAVistaParciales = () => {
    setParcialSeleccionado(null);
    setVistaActual('parciales');
  };


  // Organizar calificaciones por asignatura
  const calificacionesPorAsignatura = calificaciones.reduce((resultado, calificacion) => {
    const { Nombre_asignatura } = calificacion;
    if (!resultado[Nombre_asignatura]) {
      resultado[Nombre_asignatura] = [];
    }
    resultado[Nombre_asignatura].push(calificacion);
    return resultado;
  }, {});

  // Organizar actividades por parcial dentro de una asignatura
  const actividadesPorParcial = (asignatura) => {
    const actividades = calificacionesPorAsignatura[asignatura] || [];
    return actividades.reduce((resultado, actividad) => {
      const { Nombre_parcial } = actividad;
      if (!resultado[Nombre_parcial]) {
        resultado[Nombre_parcial] = [];
      }
      resultado[Nombre_parcial].push(actividad);
      return resultado;
    }, {});
  };

  const formatearFecha = (fechaISO) => {
    if (!fechaISO) return 'Sin fecha'; // Manejo para valores nulos o indefinidos
    return new Date(fechaISO).toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };
  const generarReporteNotasPDF = () => {
    const actividadesFiltradas = actividadesPorParcial(asignaturaSeleccionada)[parcialSeleccionado] || [];
    const doc = new jsPDF();
    const img = new Image();
    img.src = logo;

    const fechaReporte = new Date().toLocaleDateString();
    const Asignatura = asignaturaSeleccionada || "Sin asignatura seleccionada"; // Obtiene la asignatura seleccionada o un mensaje por defecto
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
      doc.text('Reporte de actividades', doc.internal.pageSize.width / 2, yPosition, { align: 'center' });

      yPosition += 10;

      // Detalles
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`Asignatura: ${Asignatura} - ${parcialSeleccionado}`, doc.internal.pageSize.width / 2, yPosition, { align: 'center' });

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

      // Línea divisoria
      doc.setLineWidth(0.5);
      doc.setDrawColor(0, 102, 51);
      doc.line(10, yPosition, doc.internal.pageSize.width - 10, yPosition);

      yPosition += 4;

      // Configuración de tabla
      doc.autoTable({
        startY: yPosition,
        head: [['#', 'ACTIVIDAD', 'DESCRIPCIÓN', 'PONDERACION', 'INICIO' ,'FINALIZO', 'VALOR']],
        body: actividadesFiltradas.map((calificacion, index) => [
          index + 1,
          calificacion.Nombre_actividad_academica,
          calificacion.Descripcion,
          calificacion.Descripcion_ponderacion,
          calificacion.Fechayhora_Inicio,
          calificacion.Fechayhora_Fin,
          calificacion.Valor
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





  
  const generarReporteParcialesPDF = () => {
    const parciales = Object.keys(actividadesPorParcial(asignaturaSeleccionada)); // Obtener nombres de parciales
    const doc = new jsPDF();
    const img = new Image();
    img.src = logo; // Logo de la institución

    const fechaReporte = new Date().toLocaleDateString();
    const Asignatura = asignaturaSeleccionada || "Sin asignatura seleccionada";

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
      doc.text('Reporte de Parciales', doc.internal.pageSize.width / 2, yPosition, { align: 'center' });

      yPosition += 10;

      // Detalles
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`Asignatura: ${Asignatura}`, doc.internal.pageSize.width / 2, yPosition, { align: 'center' });

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

      // Línea divisoria
      doc.setLineWidth(0.5);
      doc.setDrawColor(0, 102, 51);
      doc.line(10, yPosition, doc.internal.pageSize.width - 10, yPosition);

      yPosition += 4;

      // Configuración de tabla
      doc.autoTable({
        startY: yPosition,
        head: [['#', 'Parcial']],
        body: parciales.map((parcial, index) => [
          index + 1,
          parcial
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
  const generarReporteAsignaturasPDF = () => {
    const asignaturas = Object.keys(calificacionesPorAsignatura).map((asignatura, index) => ({
      numero: index + 1,
      nombre: asignatura,
      descripcion: calificacionesPorAsignatura[asignatura][0]?.Descripcion_asignatura || "N/A",
    }));

    const doc = new jsPDF();
    const img = new Image();
    img.src = logo; // Ruta del logo

    const fechaReporte = new Date().toLocaleDateString();

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
      doc.text('Reporte de Asignaturas', doc.internal.pageSize.width / 2, yPosition, { align: 'center' });

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
        head: [['#', 'Asignatura', 'Descripción']],
        body: asignaturas.map((asignatura) => [
          asignatura.numero,
          asignatura.nombre,
          asignatura.descripcion,
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

  const generarReporteAsignaturasExcel = () => {
    // Extraer datos dinámicos de calificacionesPorAsignatura
    const asignaturas = Object.keys(calificacionesPorAsignatura).map((asignatura, index) => [
      index + 1, // Número
      asignatura, // Nombre de la asignatura
      calificacionesPorAsignatura[asignatura][0]?.Descripcion_asignatura || "N/A", // Descripción
    ]);

    // Encabezados del reporte
    const encabezados = [
      ["Saint Patrick Academy"], // Título principal
      ["Reporte de Asignaturas"], // Subtítulo
      [`Fecha de generación: ${new Date().toLocaleDateString()}`], // Fecha de generación
      [], // Espacio en blanco
      ["#", "ASIGNATURA", "DESCRIPCION"], // Encabezados de la tabla
    ];

    // Combinar encabezados y datos
    const datos = [...encabezados, ...asignaturas];

    // Crear una hoja de trabajo (worksheet)
    const hojaDeTrabajo = XLSX.utils.aoa_to_sheet(datos);

    // Ajustar ancho de las columnas
    hojaDeTrabajo['!cols'] = [
      { wpx: 50 }, // Columna #
      { wpx: 250 }, // Columna Asignatura
      { wpx: 300 }, // Columna Descripción
    ];


    // Crear el libro de trabajo
    const libroDeTrabajo = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libroDeTrabajo, hojaDeTrabajo, "Reporte de asignaturas");

    // Guardar el archivo Excel con un nombre personalizado
    const nombreArchivo = `${new Date().toISOString().split('T')[0]}.xlsx`;

    XLSX.writeFile(libroDeTrabajo, nombreArchivo);
  };


  const generarReporteNotasExcel = () => {
    if (!parcialSeleccionado || !asignaturaSeleccionada) {
      Swal.fire('Error', 'Por favor selecciona una asignatura y un parcial antes de generar el reporte.', 'error');
      return;
    }

    const actividadesFiltradas = actividadesPorParcial(asignaturaSeleccionada)[parcialSeleccionado] || [];

    const encabezados = [
      ["Saint Patrick Academy"],
      ["Reporte de Actividades"],
      [`Asignatura: ${asignaturaSeleccionada}`, `Parcial: ${parcialSeleccionado}`, `Fecha de generación: ${new Date().toLocaleDateString()}`],
      [], // Espacio en blanco
      ["#", "ACTIVIDAD", "DESCRIPCION", "PONDERACION", "INICIO", "FINALIZO", "VALOR"]
    ];

    // Crear filas con las actividades filtradas
    const filas = actividadesFiltradas.map((actividad, index) => [
      index + 1,
      actividad.Nombre_actividad_academica,
      actividad.Descripcion,
      actividad.Descripcion_ponderacion,
      actividad.Fechayhora_Inicio,
      actividad.Fechayhora_Fin,
      actividad.Valor
    ]);

    // Combinar encabezados y filas
    const datos = [...encabezados, ...filas];

    // Crear una hoja de trabajo
    const hojaDeTrabajo = XLSX.utils.aoa_to_sheet(datos);

    // Estilos personalizados para encabezados
    const rangoEncabezado = XLSX.utils.decode_range(hojaDeTrabajo['!ref']);
    for (let row = 0; row <= 4; row++) {
      for (let col = rangoEncabezado.s.c; col <= rangoEncabezado.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
        if (hojaDeTrabajo[cellAddress]) {
          hojaDeTrabajo[cellAddress].s = {
            font: { bold: true, sz: 14, color: { rgb: "FFFFFF" } },
            fill: { fgColor: { rgb: "15401D" } },
            alignment: { horizontal: "center" }
          };
        }
      }
    }

    // Ajustar el ancho de columnas automáticamente
    const ajusteColumnas = [
      { wpx: 50 },  // Índice
      { wpx: 200 }, // Actividad
      { wpx: 250 }, // Descripción
      { wpx: 100 }, // Nota
      { wpx: 200 }  // Observación
    ];

    hojaDeTrabajo['!cols'] = ajusteColumnas;

    // Crear el libro de trabajo
    const libroDeTrabajo = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libroDeTrabajo, hojaDeTrabajo, "Reporte de Actividades");

    // Guardar el archivo Excel con un nombre personalizado
    const nombreArchivo = `${asignaturaSeleccionada}_${parcialSeleccionado}_${new Date().toISOString().split('T')[0]}.xlsx`;

    XLSX.writeFile(libroDeTrabajo, nombreArchivo);
  };

  const generarReporteParcialesExcel = () => {
    if (!asignaturaSeleccionada) {
      Swal.fire('Error', 'Por favor selecciona una asignatura antes de generar el reporte.', 'error');
      return;
    }

    const parciales = Object.keys(actividadesPorParcial(asignaturaSeleccionada)); // Obtener nombres de parciales

    // Encabezados del reporte
    const encabezados = [
      ["Saint Patrick Academy"],
      ["Reporte de Parciales"],
      [`Asignatura: ${asignaturaSeleccionada}`, `Fecha de generación: ${new Date().toLocaleDateString()}`],
      [], // Espacio en blanco
      ["#", "Parcial"]
    ];

    // Filas de parciales
    const filas = parciales.map((parcial, index) => [
      index + 1,
      parcial
    ]);

    // Combinar encabezados y filas
    const datos = [...encabezados, ...filas];

    // Crear hoja de trabajo
    const hojaDeTrabajo = XLSX.utils.aoa_to_sheet(datos);

    // Ajustar el ancho de columnas automáticamente
    const ajusteColumnas = [
      { wpx: 50 },  // #
      { wpx: 200 }, // Parcial
      { wpx: 150 }, // Acción
    ];

    hojaDeTrabajo['!cols'] = ajusteColumnas;

    // Crear el libro de trabajo
    const libroDeTrabajo = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libroDeTrabajo, hojaDeTrabajo, "Reporte de Parciales");

    // Guardar archivo Excel
    const nombreArchivo = `${asignaturaSeleccionada}_Parciales_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(libroDeTrabajo, nombreArchivo);
  };




  // Define el orden lógico de los parciales
  const ordenParciales = {
    'PRIMER PARCIAL': 1,
    'SEGUNDO PARCIAL': 2,
    'TERCERO PARCIAL': 3,
    'CUARTO PARCIAL': 4
  };

  const ordenarParciales = (parciales) => {
    return Object.entries(parciales).sort(([a], [b]) => (ordenParciales[a] || 99) - (ordenParciales[b] || 99));
  };


  const calcularTotalPorParcial = (actividades) => {
    return actividades.reduce((total, actividad) => {
      return total + (actividad.Valor ? parseFloat(actividad.Valor) : 0);
    }, 0);
  };





  const calcularTotalValor = () => {
    const actividades =
      hijoSeleccionado?.asignaturas[asignaturaSeleccionada]?.[parcialSeleccionado] || [];
    return actividades
      .reduce((total, actividad) => total + parseFloat(actividad?.Valor || 0), 0)
      .toFixed(2);
  };
  
  


  if (!canSelect) {
    return <AccessDenied />;
  }




  
  return (
    <CContainer className="my-5">
      <style>
        {`
          h2, h4 {
            font-family: 'Roboto', sans-serif;
            font-weight: bold;
          }
          .btn-volver {
            background-color: #007bff;
            color: white;
            border-radius: 5px;
            transition: all 0.3s ease;
          }
          .btn-volver:hover {
            background-color: #0056b3;
            transform: scale(1.05);
          }
          .tabla-parcial {
            margin-bottom: 2rem;
            border-radius: 10px;
            overflow: hidden;
          }
          table th, table td {
            text-align: center;
            vertical-align: middle;
          }
          table th {
            background-color: #f1f1f1;
          }
        `}
      </style>
      <CRow className="justify-content-center">
        <CCol lg={12}>
          {cargando ? (
            <div className="d-flex justify-content-center align-items-center py-5">
              <CSpinner color="primary" />
            </div>
          ) : vistaActual === 'hijos' ? (
            <>
              {/* Vista de Hijos */}
              <h3 className="text-center mb-4 fw-bold">Lista de Hijos</h3>
              <div className="table-responsive">
                <CTable striped bordered hover responsive>
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell>#</CTableHeaderCell>
                      <CTableHeaderCell>Nombre del Hijo</CTableHeaderCell>
                      <CTableHeaderCell>Acción</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {hijos.map((hijo, index) => (
                      <CTableRow key={hijo.id}>
                        <CTableDataCell>{index + 1}</CTableDataCell>
                        <CTableDataCell>{hijo.nombre}</CTableDataCell>
                        <CTableDataCell>
                          <CButton
                            className="btn btn-primary"
                            size="sm"
                            onClick={() => seleccionarHijo(hijo)}
                          >
                            Ver Asignaturas
                          </CButton>
                        </CTableDataCell>
                      </CTableRow>
                    ))}
                  </CTableBody>
                </CTable>
              </div>
            </>
          ) : vistaActual === 'asignaturas' ? (
            <>
              {/* Vista de Asignaturas */}
              <h3 className="text-center mb-4 fw-bold">Asignaturas de {hijoSeleccionado.nombre}</h3>
              <CButton className="btn-volver mb-3" onClick={volverAVistaHijos}>
                Volver a Hijos
              </CButton>
              <div className="table-responsive">
                <CTable striped bordered hover responsive>
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell>#</CTableHeaderCell>
                      <CTableHeaderCell>Asignatura</CTableHeaderCell>
                      <CTableHeaderCell>Acción</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {Object.keys(hijoSeleccionado.asignaturas).map((asignatura, index) => (
                      <CTableRow key={index}>
                        <CTableDataCell>{index + 1}</CTableDataCell>
                        <CTableDataCell>{asignatura}</CTableDataCell>
                        <CTableDataCell>
                          <CButton
                            className="btn btn-primary"
                            size="sm"
                            onClick={() => seleccionarAsignatura(asignatura)}
                          >
                            Ver Parciales
                          </CButton>
                        </CTableDataCell>
                      </CTableRow>
                    ))}
                  </CTableBody>
                </CTable>
              </div>
            </>
          ) : vistaActual === 'parciales' ? (
            <>
              {/* Vista de Parciales */}
              <h3 className="text-center mb-4 fw-bold">Parciales de {asignaturaSeleccionada}</h3>
              <CButton className="btn-volver mb-3" onClick={volverAVistaAsignaturas}>
                Volver a Asignaturas
              </CButton>
              <div className="table-responsive">
                <CTable striped bordered hover responsive>
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell>#</CTableHeaderCell>
                      <CTableHeaderCell>Parcial</CTableHeaderCell>
                      <CTableHeaderCell>Acción</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {Object.keys(hijoSeleccionado.asignaturas[asignaturaSeleccionada]).map((parcial, index) => (
                      <CTableRow key={index}>
                        <CTableDataCell>{index + 1}</CTableDataCell>
                        <CTableDataCell>{parcial}</CTableDataCell>
                        <CTableDataCell>
                          <CButton
                            className="btn btn-primary"
                            size="sm"
                            onClick={() => seleccionarParcial(parcial)}
                          >
                            Ver Actividades
                          </CButton>
                        </CTableDataCell>
                      </CTableRow>
                    ))}
                  </CTableBody>
                </CTable>
              </div>
            </>
          ) : (
            <>
              {/* Vista de Actividades */}
  <h3 className="text-center mb-4 fw-bold">
    Actividades del {parcialSeleccionado} - {asignaturaSeleccionada}
  </h3>
  <CButton className="btn-volver mb-3" onClick={volverAVistaParciales}>
    Volver a Parciales
  </CButton>
  <div className="table-responsive">
    <CTable striped bordered hover responsive>
      <CTableHead>
        <CTableRow>
          <CTableHeaderCell>#</CTableHeaderCell>
          <CTableHeaderCell>Actividad</CTableHeaderCell>
          <CTableHeaderCell>Descripción</CTableHeaderCell>
          <CTableHeaderCell>Inicio</CTableHeaderCell>
          <CTableHeaderCell>Fin</CTableHeaderCell>
          <CTableHeaderCell>Valor</CTableHeaderCell> {/* Nueva columna para el valor */}
        </CTableRow>
      </CTableHead>
      <CTableBody>
        {hijoSeleccionado.asignaturas[asignaturaSeleccionada][parcialSeleccionado].map(
          (actividad, index) => (
            <CTableRow key={index}>
              <CTableDataCell>{index + 1}</CTableDataCell>
              <CTableDataCell>{actividad.Nombre_actividad_academica}</CTableDataCell>
              <CTableDataCell>{actividad.Descripcion}</CTableDataCell>
              <CTableDataCell>{formatearFecha(actividad.Fechayhora_Inicio)}</CTableDataCell>
              <CTableDataCell>{formatearFecha(actividad.Fechayhora_Fin)}</CTableDataCell>
              <CTableDataCell>{actividad.Valor}</CTableDataCell> {/* Mostrar el valor */}
            </CTableRow>
          )
        )}
         {/* Fila para mostrar el total */}
  <CTableRow>
    <CTableDataCell colSpan="5" className="text-end fw-bold">
      Total:
    </CTableDataCell>
    <CTableDataCell className="fw-bold">
      {calcularTotalValor()} {/* Mostrar el total */}
    </CTableDataCell>
  </CTableRow>
      </CTableBody>
    </CTable>
  </div>
</>
          )}
        </CCol>
      </CRow>
    </CContainer>
  );
  
  
  
};

export default ListaActividadesAcaVistaPadre;

