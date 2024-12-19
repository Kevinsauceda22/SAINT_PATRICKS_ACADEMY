import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { CIcon } from '@coreui/icons-react';
import { cilSearch, cilBrushAlt, cilPen, cilTrash, cilPlus, cilSave,cilDescription,cilFile,cilSpreadsheet } from '@coreui/icons'; // Importar iconos específicos
import swal from 'sweetalert2';

import * as jwt_decode from 'jwt-decode';

import {
  CButton,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
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
  CFormSelect,
  CRow,
  CCol,
  CDropdown,
  CDropdownToggle, CDropdownMenu,CDropdownItem,
} from '@coreui/react';
import usePermission from '../../../../context/usePermission';
import AccessDenied from "../AccessDenied/AccessDenied"

import logo from 'src/assets/brand/logo_saint_patrick.png'
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

const ListaParametro = () => {
  const { canSelect, loading, error, canDelete, canInsert, canUpdate } = usePermission('ListaParametro');
  const [parametros, setParametros] = useState([]);
  const [modalVisible, setModalVisible] = useState(false); // Estado para el modal de crear un parámetro
  const [modalUpdateVisible, setModalUpdateVisible] = useState(false); // Estado para el modal de actualizar un parámetro
  const [nuevoParametro, setNuevoParametro] = useState(''); // Estado para el nuevo parámetro
  const [valorParametro, setValorParametro] = useState(''); // Agregar este estado
  const [parametroToUpdate, setParametroToUpdate] = useState({}); // Estado para el parámetro a actualizar
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1); // Estado para la página actual
  const [recordsPerPage, setRecordsPerPage] = useState(5); // Hacer dinámico el número de registros por página

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false); // Estado para detectar cambios sin guardar
  const inputRefNuevoParametro = useRef(null);
  const inputRefValorParametro = useRef(null);
  const inputRefUpdateParametro = useRef(null);
  const inputRefUpdateValor = useRef(null);
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      year: 'numeric', 
      month: 'numeric', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
    });
  };

  useEffect(() => {
    fetchParametros();
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken = jwt_decode(token); // Usamos jwt_decode para decodificar el token
        console.log('Token decodificado:', decodedToken);

        // Aquí puedes realizar otras acciones, como verificar si el token es válido o si el usuario tiene permisos

      } catch (error) {
        console.error('Error al decodificar el token:', error);
      }
    }
  }, []);

  const fetchParametros = async () => {
    try {
      const response = await fetch('http://74.50.68.87/api/parametro/parametro');
      if (!response.ok) {
        throw new Error('No se pudieron obtener los parámetros');
      }
      const data = await response.json();

      // Aplicar formato a las fechas de los parámetros
      const formattedData = data.map(param => ({
        ...param,
        Fecha_Creacion: formatDate(param.Fecha_Creacion),
        Fecha_Modificacion: formatDate(param.Fecha_Modificacion),
      }));

      setParametros(formattedData);
    } catch (error) {
      console.error('Error:', error);
    }
  };
  

    // Función para manejar cambios en el input
    const handleInputChange = (e, setFunction, inputRef) => {
      const input = e.target;
      const cursorPosition = input.selectionStart; // Guardamos la posición del cursor
      
      // Convertir el valor a mayúsculas y quitar espacios iniciales
      let value = input.value.toUpperCase().trimStart(); 
    
      const regex = /^[A-ZÁÉÍÓÚÑ0-9_\s]*$/;
      // Validación para caracteres permitidos (letras, números, espacios, etc.)
      if (!regex.test(value)) {
        swal.fire({
          icon: 'warning',
          title: 'Caracteres no permitidos',
          text: 'Solo se permiten letras, números y espacios.',
        });
        return;
      }
    
      // Verificar múltiples espacios consecutivos
      if (/\s{2,}/.test(value)) {
        swal.fire({
          icon: 'warning',
          title: 'Espacios múltiples',
          text: 'No se permite más de un espacio entre palabras.',
        });
        value = value.replace(/\s+/g, ' '); // Reemplazar espacios consecutivos por uno solo
      }
    
      // Asignamos el valor limpio al input
      input.value = value;
      
      // Actualizamos el estado
      setFunction(value);
      setHasUnsavedChanges(true); // Marcamos que hay cambios
    
      // Restaurar la posición del cursor
      requestAnimationFrame(() => {
        if (inputRef.current) {
          inputRef.current.setSelectionRange(cursorPosition, cursorPosition); // Mantener el cursor en la misma posición
        }
      });
    };
    
    const handleInputFocus = (e, inputRef) => {
      const input = e.target;
      const cursorPosition = input.selectionStart;
      // Guardar la posición del cursor solo cuando el input recibe foco
      if (inputRef.current) {
        inputRef.current.setSelectionRange(cursorPosition, cursorPosition);
      }
    };
    
    
    
    // Deshabilitar copiar y pegar
    const disableCopyPaste = (e) => {
      e.preventDefault();
      swal.fire({
        icon: 'warning',
        title: 'Acción bloqueada',
        text: 'Copiar y pegar no está permitido.',
      });
    };
  
    // Función para cerrar el modal con advertencia si hay cambios sin guardar
    const handleCloseModal = (closeFunction, resetFields) => {
      if (hasUnsavedChanges) {
        swal.fire({
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

    const resetCreateModalFields = () => {
      setNuevoParametro('');
      setValorParametro('');
      setHasUnsavedChanges(false);
    };
    

    const handleCreateParametro = async () => {
      // Validaciones para campos vacíos
      if (!nuevoParametro.trim() || !valorParametro.trim()) {
        swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Los campos "Parámetro" y "Valor" no pueden estar vacíos',
        });
        return;
      }
  
      try {
       
        // Verifica si ya existe el parámetro con el mismo nombre (opcional)
        const existe = parametros.some((param) => param.Parametro.trim().toLowerCase() === nuevoParametro.trim().toLowerCase());
        if (existe) {
          swal.fire({
            icon: 'error',
            title: 'Error',
            text: `El parámetro "${nuevoParametro}" ya existe.`,
          });
          return;
        }
  
        // Obtener la fecha actual para la creación y actualización
        const fechaCreacion = new Date().toISOString();
        const fechaModificacion = new Date().toISOString();
  
        const token = localStorage.getItem('token'); // o el lugar donde guardas el token
         // Decodificar el token para obtener el nombre del usuario
        const decodedToken = jwt_decode.jwtDecode(token);
        if (!decodedToken.cod_usuario || !decodedToken.nombre_usuario) {
          console.error('No se pudo obtener el código o el nombre de usuario del token');
          throw new Error('No se pudo obtener el código o el nombre de usuario del token');
        }

        const response = await fetch('http://74.50.68.87/api/parametro/crearparametro', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`, // Aquí se agrega el token
          },
          body: JSON.stringify({
            Parametro: nuevoParametro,
            Valor: valorParametro,
            Fecha_Creacion: fechaCreacion,
            Fecha_Modificacion: fechaModificacion,
          }),
        });

        const result = await response.json();
  
        if (response.ok) {

           // 2. Registrar la acción en la bitácora
         const descripcion = `El usuario: ${decodedToken.nombre_usuario} ha creado nuevo parámetro: ${nuevoParametro} `;
        
         // Enviar a la bitácora
         const bitacoraResponse = await fetch('http://74.50.68.87/api/bitacora/registro', {
           method: 'POST',
           headers: {
             'Content-Type': 'application/json',
             'Authorization': `Bearer ${token}`, // Incluir token en los encabezados
           },
           body: JSON.stringify({
             cod_usuario: decodedToken.cod_usuario, // Código del usuario
             cod_objeto: 95, // Código del objeto para la acción
             accion: 'INSERT', // Acción realizada
             descripcion: descripcion, // Descripción de la acción
           }),
         });
   
         if (bitacoraResponse.ok) {
           console.log('Registro en bitácora exitoso');
         } else {
           swal.fire('Error', 'No se pudo registrar la acción en la bitácora', 'error');
         }

          fetchParametros(); // Actualiza la lista de parámetros
          setModalVisible(false); // Cierra el modal
          setNuevoParametro(''); // Limpiar el campo de nuevo parámetro
          setValorParametro(''); // Limpiar el campo de valor
          setHasUnsavedChanges(false); // Reiniciar el estado de cambios no guardados
          swal.fire({
            icon: 'success',
            title: '¡Éxito!',
            text: 'El parámetro se ha creado correctamente.',
            confirmButtonText: 'Aceptar',
          });
        } else {
          swal.fire({
            icon: 'error',
            title: 'Error de validación',
            text: result.Mensaje || 'Hubo un problema al crear el parámetro',
          });
        }
      } catch (error) {
        console.error('Error al crear el parámetro:', error);
        swal.fire({
          icon: 'error',
          title: 'Error en el servidor',
          text: 'Hubo un problema en el servidor. Inténtalo más tarde.',
        });
      }
    };

// Función para formatear la fecha en el formato 'YYYY-MM-DD HH:mm:ss'
const formatFechaMySQL = (fecha) => {
  const date = new Date(fecha);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

// Función para manejar la actualización del parámetro
const handleUpdateParametro = async () => {
  const { Cod_parametro, Parametro, Valor } = parametroToUpdate;

  if (!Parametro || !Valor) {
    swal.fire({ icon: 'error', title: 'Error', text: 'Todos los campos son obligatorios' });
    return;
  }

  try {
    // Verificar si obtenemos el token correctamente
    const token = localStorage.getItem('token');
    if (!token) {
      swal.fire('Error', 'No tienes permiso para realizar esta acción', 'error');
      return;
    }

    // Decodificar el token para obtener el nombre del usuario
    const decodedToken = jwt_decode.jwtDecode(token);
    if (!decodedToken.cod_usuario || !decodedToken.nombre_usuario) {
      console.error('No se pudo obtener el código o el nombre de usuario del token');
      throw new Error('No se pudo obtener el código o el nombre de usuario del token');
    }
    const fechaModificacion = formatFechaMySQL(new Date()); // Formatear la fecha

    const response = await fetch('http://74.50.68.87/api/parametro/actualizarparametro', {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ Cod_parametro, Parametro, Valor, Fecha_Modificacion: fechaModificacion }),
    });

    if (response.ok) {

      // 2. Registrar la acción en la bitácora
      const descripcion = `El usuario: ${decodedToken.nombre_usuario} actualizó el parámetro: ${Parametro}`;
        
      // Enviar a la bitácora
      const bitacoraResponse = await fetch('http://74.50.68.87/api/bitacora/registro', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Incluir token en los encabezados
        },
        body: JSON.stringify({
          cod_usuario: decodedToken.cod_usuario, // Código del usuario
          cod_objeto: 95, // Código del objeto para la acción
          accion: 'UPDATE', // Acción realizada
          descripcion: descripcion, // Descripción de la acción
        }),
      });

      if (bitacoraResponse.ok) {
        console.log('Registro en bitácora exitoso');
      } else {
        swal.fire('Error', 'No se pudo registrar la acción en la bitácora', 'error');
      }
      fetchParametros();
      setModalUpdateVisible(false);
      setParametroToUpdate({});
      swal.fire({
        icon: 'success',
        title: '¡Éxito!',
        text: 'Parámetro actualizado correctamente',
        confirmButtonText: 'Aceptar',
      });
    } else {
      swal.fire({ icon: 'error', title: 'Error', text: 'Hubo un problema al actualizar el parámetro' });
    }
  } catch (error) {
    swal.fire({ icon: 'error', title: 'Error', text: 'Intenta nuevamente más tarde.' });
  }
};


const openUpdateModal = (parametro) => {
  setParametroToUpdate(parametro);
  setModalUpdateVisible(true);
};

 // Cambia el estado de la página actual después de aplicar el filtro
  // Validar el buscador
  const handleSearch = (event) => {
    const input = event.target;
    let value = input.value
      .toUpperCase() // Convertir a mayúsculas
      .trimStart(); // Evitar espacios al inicio

    const regex = /^[A-ZÑÁÉÍÓÚ0-9\s,]*$/; // Solo letras, números, acentos, ñ, espacios y comas

    // Verificar si hay múltiples espacios consecutivos antes de reemplazarlos
    if (/\s{2,}/.test(value)) {
      swal.fire({
        icon: 'warning',
        title: 'Espacios múltiples',
        text: 'No se permite más de un espacio entre palabras.',
      });
      value = value.replace(/\s+/g, ' '); // Reemplazar múltiples espacios por uno solo
    }

    // Validar caracteres permitidos
    if (!regex.test(value)) {
      swal.fire({
        icon: 'warning',
        title: 'Caracteres no permitidos',
        text: 'Solo se permiten letras, números y espacios.',
      });
      return;
    }

    // Validación para letras repetidas más de 4 veces seguidas
    const words = value.split(' ');
    for (let word of words) {
      const letterCounts = {};
      for (let letter of word) {
        letterCounts[letter] = (letterCounts[letter] || 0) + 1;
        if (letterCounts[letter] > 4) {
          swal.fire({
            icon: 'warning',
            title: 'Repetición de letras',
            text: `La letra "${letter}" se repite más de 4 veces en la palabra "${word}".`,
          });
          return;
        }
      }
    }
    setSearchTerm(value);
    setCurrentPage(1); // Resetear a la primera página al buscar
  };


  // Filtrar los estados de asistencia según el término de búsqueda
  const filteredParametro = parametros.filter((parametro) =>
    parametro.Parametro.toLowerCase().includes(searchTerm.toLowerCase())
  );

 // Lógica de paginación
 const indexOfLastRecord = currentPage * recordsPerPage;
 const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
 const currentRecords = filteredParametro.slice(indexOfFirstRecord, indexOfLastRecord);

 // Cambiar página
const paginate = (pageNumber) => {
  if (pageNumber > 0 && pageNumber <= Math.ceil(filteredParametro.length / recordsPerPage)) {
    setCurrentPage(pageNumber);
  }
}


  // Verificar permisos
  if (!canSelect) {
   return <AccessDenied />;
  }

  const generarReportePDF = () => {
    // Validar que haya datos en la tabla
    if (!parametros || parametros.length === 0) {
      swal.fire({
        icon: 'info',
        title: 'Tabla vacía',
        text: 'No hay datos disponibles para generar el reporte.',
        confirmButtonText: 'Aceptar',
      });
      return; // Salir de la función si no hay datos
    }
    const doc = new jsPDF();
    const img = new Image();
    img.src = logo;
  
    img.onload = () => {
      // Agregar logo
      doc.addImage(img, 'PNG', 10, 10, 30, 30);
  
      let yPosition = 20; // Posición inicial en el eje Y
  
      // Título principal
      doc.setFontSize(18);
      doc.setTextColor(0, 102, 51); // Verde
      doc.text('SAINT PATRICK\'S ACADEMY', doc.internal.pageSize.width / 2, yPosition, { align: 'center' });
  
      yPosition += 12; // Espaciado más amplio para resaltar el título
  
      // Subtítulo
      doc.setFontSize(16);
      doc.text('Reporte de Parámetros', doc.internal.pageSize.width / 2, yPosition, { align: 'center' });
  
      yPosition += 10; // Espaciado entre subtítulo y detalles

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
      doc.setDrawColor(0, 102, 51); // Verde
      doc.line(10, yPosition, doc.internal.pageSize.width - 10, yPosition);
  
      // Configuración para la tabla
      const pageHeight = doc.internal.pageSize.height; // Altura de la página
      let pageNumber = 1; // Página inicial
  
      // Agregar tabla con auto-paginación
      doc.autoTable({
        startY: yPosition + 4,
        head: [['#', 'Parámetro','Valor', 'Fecha Creación', 'Fecha Modificación']],
        body: parametros.map((parametro, index) => [
          index + 1,
          `${parametro.Parametro || ''}`.trim(),
          parametro.Valor,
          parametro.Fecha_Creacion,
          parametro.Fecha_Modificacion,
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
          1: { cellWidth: 'auto' }, // Columna 'Parámetro' se ajusta automáticamente
          2: { cellWidth: 'auto' }, // Columna 'Valor' se ajusta automáticamente
          3: { cellWidth: 'auto' }, // Columna 'Fecha Creación' se ajusta automáticamente
          4: { cellWidth: 'auto' }, // Columna 'Fecha Modificación' se ajusta automáticamente
        },
        alternateRowStyles: { fillColor: [240, 248, 255] },
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
  
      // Abrir el PDF en lugar de descargarlo automáticamente
      window.open(doc.output('bloburl'), '_blank');
    };
  
    img.onerror = () => {
      console.warn('No se pudo cargar el logo. El PDF se generará sin el logo.');
      // Abrir el PDF sin el logo
      window.open(doc.output('bloburl'), '_blank');
    };
  };

  const generarReporteExcel = () => {
    // Validar que haya datos en la tabla
    if (!parametros || parametros.length === 0) {
      swal.fire({
        icon: 'info',
        title: 'Tabla vacía',
        text: 'No hay datos disponibles para generar el reporte excel.',
        confirmButtonText: 'Aceptar',
      });
      return; // Salir de la función si no hay datos
    }
    const encabezados = [
      ["Saint Patrick Academy"],
      ["Reporte de Parámetros"],
      [], // Espacio en blanco
      ["#","Parámetro","Valor","Fecha Creacion", "Fecha Modificación"]
    ];
  
    // Crear filas con asistencias filtradas
    const filas = parametros.map((parametro, index) => [
      index + 1,
      parametro.Parametro,
      parametro.Valor,
      parametro.Fecha_Creacion,
      parametro.Fecha_Modificacion
    ]);
  
    // Combinar encabezados y filas
    const datos = [...encabezados, ...filas];
  
    // Crear una hoja de trabajo
    const hojaDeTrabajo = XLSX.utils.aoa_to_sheet(datos);
  
    // Estilos personalizados para encabezados
    const rangoEncabezado = XLSX.utils.decode_range(hojaDeTrabajo['!ref']);
    for (let row = 0; row <= 3; row++) {
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
      { wpx: 100 }, 
      { wpx: 100 },
      { wpx: 100 },
      { wpx: 100 },
      { wpx: 100 }
    ];
  
    hojaDeTrabajo['!cols'] = ajusteColumnas;
  
    // Crear el libro de trabajo
    const libroDeTrabajo = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libroDeTrabajo, hojaDeTrabajo, "Reporte de Parámetros");
    // Guardar el archivo Excel con un nombre fijo
    const nombreArchivo = `Reporte_Parámetros.xlsx`;

    XLSX.writeFile(libroDeTrabajo, nombreArchivo);
  };
return (
  <CContainer>
    {/* Contenedor del h1 y botón "Nuevo" */}
    <CRow className="align-items-center mb-5">
      <CCol xs="12" md="9">
        {/* Título de la página */}
        <h1 className="mb-0">Parámetros</h1>
      </CCol>
      <CCol xs="12" md="3" className="text-end d-flex flex-column flex-md-row justify-content-md-end align-items-md-center mt-3 mt-md-0">
        {/* Botón Nuevo para abrir el modal */}

        {canInsert && (
        <CButton 
        className="mb-3 mb-md-0 me-md-3 gap-1 rounded shadow"
        style={{
          backgroundColor: '#4B6251',
          color: 'white',
          transition: 'all 0.3s ease',
          height: '40px', // Altura fija del botón
          width: 'auto', // El botón se ajusta automáticamente al contenido
          minWidth: '100px', // Establece un ancho mínimo para evitar que el botón sea demasiado pequeño
          padding: '0 16px', // Padding consistente
          fontSize: '16px', // Tamaño de texto consistente
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center', // Centra el contenido
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "#3C4B43";
          e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "#4B6251";
          e.currentTarget.style.boxShadow = 'none';
        }}
          onClick={() => { setModalVisible(true);
            setHasUnsavedChanges(false); // Resetear el estado al abrir el modal
          }}
        >
          <CIcon icon={cilPlus} /> Nuevo
        </CButton>
        )}

<CDropdown className="btn-sm d-flex align-items-center gap-1 rounded shadow">
      <CDropdownToggle
        style={{
          backgroundColor: '#6C8E58',
          color: 'white',
          cursor: 'pointer',
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
        <CIcon icon={cilDescription}/> Reporte
      </CDropdownToggle>
      <CDropdownMenu
        style={{
          position: "absolute",
          zIndex: 1050, /* Asegura que el menú esté por encima de otros elementos */
          backgroundColor: "#fff",
          boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.2)",
          borderRadius: "4px",
          overflow: "hidden",
        }}
      >
        <CDropdownItem
          onClick={generarReportePDF}
          style={{
            cursor: "pointer",
            outline: "none",
            backgroundColor: "transparent",
            padding: "0.5rem 1rem",
            fontSize: "0.85rem",
            color: "#333",
            borderBottom: "1px solid #eaeaea",
            transition: "background-color 0.1s",
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = "#f5f5f5"}
          onMouseOut={(e) => e.target.style.backgroundColor = "transparent"}
        >
          <CIcon icon={cilFile} size="sm" /> Abrir en PDF
        </CDropdownItem>
        <CDropdownItem
        onClick={generarReporteExcel}
          style={{
            cursor: "pointer",
            outline: "none",
            backgroundColor: "transparent",
            padding: "0.5rem 1rem",
            fontSize: "0.85rem",
            color: "#333",
            transition: "background-color 0.3s",
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = "#f5f5f5"}
          onMouseOut={(e) => e.target.style.backgroundColor = "transparent"}
        >
          <CIcon icon={cilSpreadsheet} size="sm" /> Descargar Excel
        </CDropdownItem>
      </CDropdownMenu>
    </CDropdown>
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
            placeholder="Buscar parametro..."
            onChange={handleSearch}
            value={searchTerm}
          />
          <CButton
            style={{border: '1px solid #ccc',
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
                <option value="20">20</option>
              </CFormSelect>
            <span>&nbsp;registros</span>
          </div>       
       </CInputGroup>
     </CCol>
    </CRow>


    {/* Tabla para mostrar Estadonota */}
    {/* Contenedor de tabla con scroll */}
    <div className="table-container" style={{ maxHeight: '400px', overflowY: 'scroll', marginBottom: '20px' }}>
      <CTable striped bordered hover>
        <CTableHead style={{ position: 'sticky', top: 0, zIndex: 1, backgroundColor: '#fff' }}>
          <CTableRow> 
            <CTableHeaderCell style={{ width: '50px' }}>#</CTableHeaderCell>
            <CTableHeaderCell style={{ width: '300px' }}>PARÁMETRO</CTableHeaderCell>
            <CTableHeaderCell style={{ width: '300px' }}>VALOR</CTableHeaderCell>
            <CTableHeaderCell style={{ width: '300px' }}>FECHA_CREACIÓN</CTableHeaderCell>
            <CTableHeaderCell style={{ width: '300px' }}>FECHA_MODIFICACIÓN</CTableHeaderCell>
            <CTableHeaderCell style={{ width: '150px' }}>ACCIONES</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {currentRecords.map((parametro, index) => (
            <CTableRow key={parametro.Cod_parametro}>
              <CTableDataCell>{index + 1}</CTableDataCell>
              <CTableDataCell>{parametro.Parametro}</CTableDataCell>
              <CTableDataCell>{parametro.Valor}</CTableDataCell>
              <CTableDataCell>{parametro.Fecha_Creacion}</CTableDataCell>
              <CTableDataCell>{parametro.Fecha_Modificacion}</CTableDataCell>
              <CTableDataCell>

              {canUpdate && (
                <CButton style={{ backgroundColor: '#F9B64E', marginRight: '10px' }} onClick={() => openUpdateModal(parametro)}>
                  <CIcon icon={cilPen} />
                </CButton>
              )}
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
          disabled={currentPage === Math.ceil(filteredParametro.length / recordsPerPage)} // Desactiva si es la última página
          onClick={() => paginate(currentPage + 1)} // Páginas siguientes
        >
          Siguiente
        </CButton>
      </CPagination>
      <span style={{ marginLeft: '10px' }}>
        Página {currentPage} de {Math.ceil(filteredParametro.length / recordsPerPage)}
      </span>
    </div>

    {/* Modal Crear Parámetro */}
    <CModal visible={modalVisible} backdrop="static">
      <CModalHeader closeButton={false}>
        <CModalTitle>Nuevo Parámetro</CModalTitle>
        <CButton className="btn-close" aria-label="Close" onClick={() => handleCloseModal(setModalVisible, resetCreateModalFields)} />
      </CModalHeader>
      <CModalBody>
        <CForm>
          <CInputGroup className="mb-3">
            <CInputGroupText>Parámetro</CInputGroupText>
            <CFormInput
              ref={inputRefNuevoParametro}
               type="text"
               placeholder="Ingrese el parámetro"
               value={nuevoParametro}
               onChange={(e) => handleInputChange(e, setNuevoParametro,inputRefNuevoParametro)}
               onPaste={disableCopyPaste}
               onCopy={disableCopyPaste} // Usamos la función handleInputChange para manejar cambios
               onFocus={(e) => handleInputFocus(e, inputRefNuevoParametro)}
            />
          </CInputGroup>

          {/* Campo para el valor del parámetro */}
          <CInputGroup className="mb-3">
            <CInputGroupText>Valor</CInputGroupText>
            <CFormInput
            ref={inputRefUpdateValor}
             type="text"
             placeholder="Ingrese el valor"
             value={valorParametro}
             onChange={(e) => handleInputChange(e, setValorParametro,inputRefUpdateValor)}
             onPaste={disableCopyPaste}
             onCopy={disableCopyPaste} // Usamos la misma lógica para el valor
             onFocus={(e) => handleInputFocus(e, inputRefUpdateValor)}
            />
          </CInputGroup>
        </CForm>
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={() => handleCloseModal(setModalVisible, resetCreateModalFields)}>
          Cancelar
        </CButton>
        <CButton
          style={{ backgroundColor: '#4B6251', color: 'white' }}
          onClick={handleCreateParametro} // Llamamos a la función para crear el parámetro
        >
          <CIcon icon={cilSave} style={{ marginRight: '5px' }} /> Guardar
        </CButton>
      </CModalFooter>
    </CModal>

  {/* Modal de Actualización */}
  <CModal visible={modalUpdateVisible} onClose={() => setModalUpdateVisible(false)} backdrop="static">
        <CModalHeader closeButton>
          <CModalTitle>Actualizar Parámetro</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
          <CInputGroup className="mb-3">
          <CInputGroupText>Parámetro</CInputGroupText>
              <CFormInput
                type="text"
                name="parametro"
                value={parametroToUpdate.Parametro || ''}
                readOnly
                disabled
              />
              
              </CInputGroup>
              <CInputGroup className="mb-3">
              <CInputGroupText>Valor</CInputGroupText>
              <CFormInput
                ref={inputRefUpdateValor}  // Mantiene la referencia para gestionar la posición del cursor
                type="text"
                placeholder="Valor"
                value={parametroToUpdate.Valor || ''}  // Asegura que el campo no sea undefined o null
                onChange={(e) => handleInputChange(e, (value) => setParametroToUpdate({ ...parametroToUpdate, Valor: value }), inputRefUpdateValor)}  // Llamada a handleInputChange
                onPaste={disableCopyPaste}  // Desactiva el copiar y pegar
                onCopy={disableCopyPaste}  // Desactiva la acción de copiar
                onFocus={(e) => handleInputFocus(e, inputRefUpdateValor)}  // Llama a la función de foco
              />
               </CInputGroup>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setModalUpdateVisible(false)}>Cancelar</CButton>
          <CButton style={{  backgroundColor: '#F9B64E',color: 'white' }} onClick={handleUpdateParametro}>
           <CIcon icon={cilPen} style={{ marginRight: '5px' }} />Actualizar
          </CButton>
        </CModalFooter>
      </CModal>

   

 </CContainer>
  );
};


export default ListaParametro;
