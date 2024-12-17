
import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { CIcon } from '@coreui/icons-react';
import { cilSearch, cilBrushAlt, cilPen, cilTrash, cilPlus, cilSave,cilDescription,cilFile,cilSpreadsheet } from '@coreui/icons'; // Importar iconos específicos
import swal from 'sweetalert2';

import * as jwt_decode from 'jwt-decode';

import jsPDF from 'jspdf';
import 'jspdf-autotable'; // Importa el plugin para tablas
import * as XLSX from 'xlsx';
import logo from 'src/assets/brand/logo_saint_patrick.png'
import { left } from '@popperjs/core';
import {
  CButton,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
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
  CRow,
  CCol,
  CFormSelect,
} from '@coreui/react';
import usePermission from '../../../../context/usePermission';
import AccessDenied from "../AccessDenied/AccessDenied"



const ListaGradoAcademico = () => {
  const { canSelect, loading, error, canDelete, canInsert, canUpdate } = usePermission('ListaGradoAcademico');

  const [gradosAcademicos, setGradosAcademicos] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalUpdateVisible, setModalUpdateVisible] = useState(false);
  const [modalDeleteVisible, setModalDeleteVisible] = useState(false);
  const [nuevoGrado, setNuevoGrado] = useState({ Descripcion: '' });
  const [gradoToUpdate, setGradoToUpdate] = useState({});
  const [gradoToDelete, setGradoToDelete] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1); // Estado para la página actual
  const [recordsPerPage,setRecordsPerPage] = useState(5); // Mostrar 5 registros por página
  const inputRef = useRef(null); // referencia para el input
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false); // Estado para detectar cambios sin guardar

  useEffect(() => {
    fetchGradosAcademicos();
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



    // Función para manejar cambios en el input
  const handleInputChange = (e, setFunction) => {
    const input = e.target;
    const cursorPosition = input.selectionStart; // Guarda la posición actual del cursor
    let value = input.value
      .toUpperCase() // Convertir a mayúsculas
      .trimStart(); // Evitar espacios al inicio

    const regex =/^[A-Z-Ñ\s]*$/; // Solo letras, espacios y la Ñ

    // Verificar si hay múltiples espacios consecutivos antes de reemplazarlos
    if (/\s{2,}/.test(value)) {
      swal.fire({
        icon: 'warning',
        title: 'Espacios múltiples',
        text: 'No se permite más de un espacio entre palabras.',
        confirmButtonText: 'Aceptar',
      });
      value = value.replace(/\s+/g, ' '); // Reemplazar múltiples espacios por uno solo
    }

    // Validar solo letras y espacios
    if (!regex.test(value)) {
      swal.fire({
        icon: 'warning',
        title: 'Caracteres no permitidos',
        text: 'Solo se permiten letras y espacios.',
        confirmButtonText: 'Aceptar',
      });
      return;
    }

    // Validación: no permitir letras repetidas más de 4 veces seguidas
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
            confirmButtonText: 'Aceptar',
          });
          return;
        }
      }
    }

    // Asigna el valor en el input manualmente para evitar el salto de transición
    input.value = value;

    // Establecer el valor con la función correspondiente
    setFunction(value);
    setHasUnsavedChanges(true); // Asegúrate de marcar que hay cambios sin guardar

    // Restaurar la posición del cursor
    requestAnimationFrame(() => {
      if (inputRef.current) {
        inputRef.current.setSelectionRange(cursorPosition, cursorPosition);
      }
    });
  };
  
  // Deshabilitar copiar y pegar
  const disableCopyPaste =(e) => {
    e.preventDefault();
    swal.fire({
      icon: 'warning',
      title: 'Accion bloquear',
      text:'Copiar y pegar no esta permitido',
      confirmButtonText: 'Aceptar',
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
          closeFunction(false);     // Cerrar el modal
          resetFields();            // Limpiar los campos
          setHasUnsavedChanges(false); // Resetear el indicador de cambios no guardados
        }
      });
    } else {
      closeFunction(false);         // Cerrar el modal directamente
      resetFields();                // Limpiar los campos
      setHasUnsavedChanges(false);  // Resetear el indicador de cambios no guardados
    }
  };
  
  // Funciones auxiliares para resetear los campos específicos de cada modal
  const resetNuevoGrado = () => setNuevoGrado({ Descripcion: '' });
  const resetgradoToUpdate = () => setGradoToUpdate({});
  
  

  const fetchGradosAcademicos = async () => {
    try {
      const response = await fetch('http://74.50.68.87:4000/api/gradosAcademicos/verGradosAcademicos');
      const data = await response.json();
     // Asignar un índice original basado en el orden en la base de datos
    const dataWithIndex = data.map((gradosAcademicos, index) => ({
      ...gradosAcademicos,
      originalIndex: index + 1, // Guardamos la secuencia original
    }));
    
    setGradosAcademicos(dataWithIndex);
    } catch (error) {
      console.error('Error al obtener los grados académicos:', error);
    }
  };

const handleCreateGrado = async () => {
  if (!nuevoGrado.Descripcion.trim()) {
    // Mostrar mensaje de error con SweetAlert si el campo está vacío
    swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'El campo "Grado académico" no puede estar vacío',
      confirmButtonText: 'Aceptar',
    });
    return;
  }

  // Verificar si ya existe una especialidad con la misma descripción
  const especialidadDuplicada = gradosAcademicos.some(
    (grado) => grado.Descripcion.trim().toLowerCase() === nuevoGrado.Descripcion.trim().toLowerCase()
  );

  if (especialidadDuplicada) {
    // Mostrar mensaje de error con SweetAlert si la GA ya existe
    swal.fire({
      icon: 'error',
      title: 'Error',
      text: `El grado academico "${nuevoGrado.Descripcion}" ya existe`,
      confirmButtonText: 'Aceptar',
    });
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
    const response = await fetch('http://74.50.68.87:4000/api/gradosAcademicos/crearGradoAcademico', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(nuevoGrado),
    });

    if (response.ok) {
       // 2. Registrar la acción en la bitácora
       const descripcion = `El usuario: ${decodedToken.nombre_usuario} ha creado nuevo grado académico: ${nuevoGrado.Descripcion} `;
        
       // Enviar a la bitácora
       const bitacoraResponse = await fetch('http://74.50.68.87:4000/api/bitacora/registro', {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json',
           'Authorization': `Bearer ${token}`, // Incluir token en los encabezados
         },
         body: JSON.stringify({
           cod_usuario: decodedToken.cod_usuario, // Código del usuario
           cod_objeto: 56, // Código del objeto para la acción
           accion: 'INSERT', // Acción realizada
           descripcion: descripcion, // Descripción de la acción
         }),
       });
 
       if (bitacoraResponse.ok) {
         console.log('Registro en bitácora exitoso');
       } else {
         swal.fire('Error', 'No se pudo registrar la acción en la bitácora', 'error');
       }

      fetchGradosAcademicos();
      setModalVisible(false);
      resetNuevoGrado();
      setHasUnsavedChanges(false)
      setNuevoGrado({ Descripcion: '' });

      // Mostrar mensaje de éxito con SweetAlert
      swal.fire({
        icon: 'success',
        title: '¡Éxito!',
        text: 'El grado académico se ha creado correctamente',
        confirmButtonText: 'Aceptar',
      });
    } else {
      console.error('Hubo un problema al crear el grado académico:', response.statusText);
    }
  } catch (error) {
    console.error('Hubo un problema al crear el grado académico:', error);
  }
};

const handleUpdateGrado = async () => {
  if (!gradoToUpdate.Descripcion.trim()) {
    // Mostrar mensaje de error con SweetAlert si el campo está vacío
    swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'El campo "Grado académico" no puede estar vacío',
      confirmButtonText: 'Aceptar',
    });
    return;
  }

  // Verificar si ya existe una especialidad con la misma descripción
  const especialidadDuplicada = gradosAcademicos.some(
    (grado) => 
      grado.Descripcion.trim().toLowerCase() === gradoToUpdate.Descripcion.trim().toLowerCase() &&
      grado.Cod_grado_academico !== gradoToUpdate.Cod_grado_academico
  );

  if (especialidadDuplicada) {
    // Mostrar mensaje de error con SweetAlert si la especialidad ya existe
    swal.fire({
      icon: 'error',
      title: 'Error',
      text: `El grado academico "${gradoToUpdate.Descripcion}" ya existe`,
      confirmButtonText: 'Aceptar',
    });
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
    const response = await fetch('http://74.50.68.87:4000/api/gradosAcademicos/actualizarGradoAcademico', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(gradoToUpdate),
    });

    if (response.ok) {
       // 2. Registrar la acción en la bitácora
       const descripcion = `El usuario: ${decodedToken.nombre_usuario} ha actualizado el grado académico a: ${gradoToUpdate.Descripcion} con código ${gradoToUpdate.Cod_grado_academico} `;
        
       // Enviar a la bitácora
       const bitacoraResponse = await fetch('http://74.50.68.87:4000/api/bitacora/registro', {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json',
           'Authorization': `Bearer ${token}`, // Incluir token en los encabezados
         },
         body: JSON.stringify({
           cod_usuario: decodedToken.cod_usuario, // Código del usuario
           cod_objeto: 56, // Código del objeto para la acción
           accion: 'UPDATE', // Acción realizada
           descripcion: descripcion, // Descripción de la acción
         }),
       });
 
       if (bitacoraResponse.ok) {
         console.log('Registro en bitácora exitoso');
       } else {
         swal.fire('Error', 'No se pudo registrar la acción en la bitácora', 'error');
       }
      fetchGradosAcademicos();
      setModalUpdateVisible(false);
      setGradoToUpdate();
      setHasUnsavedChanges(false);// reiciniar el estado de cambios no guardados 
      setGradoToUpdate({});

      // Mostrar mensaje de éxito con SweetAlert
      swal.fire({
        icon: 'success',
        title: '¡Éxito!',
        text: 'El grado académico se ha actualizado correctamente',
        confirmButtonText: 'Aceptar',
      });
    } else {
      console.error('Hubo un problema al actualizar el grado académico:', response.statusText);
    }
  } catch (error) {
    console.error('Hubo un problema al actualizar el grado académico:', error);
  }
};

  const handleDeleteGrado = async () => {
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
      const response = await fetch('http://74.50.68.87:4000/api/gradosAcademicos/eliminarGradoAcademico', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ Cod_grado_academico: gradoToDelete.Cod_grado_academico }),
      });

      if (response.ok) {
         // 2. Registrar la acción en la bitácora
         const descripcion = `El usuario: ${decodedToken.nombre_usuario} ha eliminado el grado académico: ${gradoToDelete.Descripcion} con código ${gradoToDelete.Cod_grado_academico} `;
        
         // Enviar a la bitácora
         const bitacoraResponse = await fetch('http://74.50.68.87:4000/api/bitacora/registro', {
           method: 'POST',
           headers: {
             'Content-Type': 'application/json',
             'Authorization': `Bearer ${token}`, // Incluir token en los encabezados
           },
           body: JSON.stringify({
             cod_usuario: decodedToken.cod_usuario, // Código del usuario
             cod_objeto: 56, // Código del objeto para la acción
             accion: 'DELETE', // Acción realizada
             descripcion: descripcion, // Descripción de la acción
             confirmButtonText: 'Aceptar',
           }),
         });
   
         if (bitacoraResponse.ok) {
           console.log('Registro en bitácora exitoso');
         } else {
           swal.fire('Error', 'No se pudo registrar la acción en la bitácora', 'error');
         }
        fetchGradosAcademicos();
        setModalDeleteVisible(false);
        setGradoToDelete({});
        swal.fire({
          icon: 'success',
          title: '¡Éxito!',
          text: 'El grado académico se ha eliminado correctamente',
          confirmButtonText: 'Aceptar',
        });
      } else {
        console.error('Hubo un problema al eliminar el grado académico', response.statusText);
      }
    } catch (error) {
      console.error('Hubo un problema al eliminar el grado académico', error);
    }
  };

  // Filtro de búsqueda
  const filteredGradosAcademicos = gradosAcademicos.filter((gradosAcademicos) =>
    gradosAcademicos.Descripcion.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Lógica de paginación
 const indexOfLastRecord = currentPage * recordsPerPage;
 const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
 const currentRecords = filteredGradosAcademicos.slice(indexOfFirstRecord, indexOfLastRecord);


 // Cambiar página
const paginate = (pageNumber) => {
  if (pageNumber > 0 && pageNumber <= Math.ceil(filteredGradosAcademicos.length / recordsPerPage)) {
    setCurrentPage(pageNumber);
  }
}
// Cambia el estado de la página actual después de aplicar el filtro
  // Validar el buscador
  const handleSearch = (event) => {
    const input = event.target;
    let value = input.value
      .toUpperCase() // Convertir a mayúsculas
      .trimStart(); // Evitar espacios al inicio
  
    const regex = /^[A-Z-Ñ\s]*$/; // Solo letras, números, acentos, ñ, espacios y comas
  
    // Verificar si hay múltiples espacios consecutivos antes de reemplazarlos
    if (/\s{2,}/.test(value)) {
      swal.fire({
        icon: 'warning',
        title: 'Espacios múltiples',
        text: 'No se permite más de un espacio entre palabras.',
        confirmButtonText: 'Aceptar',
      });
      value = value.replace(/\s+/g, ' '); // Reemplazar múltiples espacios por uno solo
    }
  
    // Validar caracteres permitidos
    if (!regex.test(value)) {
      swal.fire({
        icon: 'warning',
        title: 'Caracteres no permitidos',
        text: 'Solo se permiten letras, números y espacios.',
        confirmButtonText: 'Aceptar',
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
            confirmButtonText: 'Aceptar',
          });
          return;
        }
      }
    }
    setSearchTerm(value);
    setCurrentPage(1); // Resetear a la primera página al buscar
  };

   // Verificar permisos
   if (!canSelect) {
    return <AccessDenied />;
  }
//--------------------------------------------- REPORTE PDF Y EXCEL -----------------------
const generarReporteGradosAcademicosPDF = () => {
  // Validar que haya datos en la tabla
  if (!currentRecords || currentRecords.length === 0) {
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
  img.src = logo; // Reemplaza con la URL o ruta de tu logo.

  img.onload = () => {
    // Agregar logo
    doc.addImage(img, 'PNG', 10, 10, 30, 30);

    let yPosition = 20; // Posición inicial en el eje Y

    // Título principal
    doc.setFontSize(18);
    doc.setTextColor(0, 102, 51); // Verde
    doc.text("SAINT PATRICK'S ACADEMY", doc.internal.pageSize.width / 2, yPosition, { align: 'center' });

    yPosition += 12; // Espaciado más amplio para resaltar el título

    // Subtítulo
    doc.setFontSize(16);
    doc.text('Reporte de Grados Académicos', doc.internal.pageSize.width / 2, yPosition, { align: 'center' });

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
      head: [['#', 'Grado Académico']],
      body: currentRecords.map((gradoAcademico, index) => [
        gradoAcademico.originalIndex, // Usar el índice original en lugar del índice basado en la paginación
        `${gradoAcademico.Descripcion || ''}`.trim(),
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
        1: { cellWidth: 'auto' }, // Columna 'Grado Académico' se ajusta automáticamente
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
//----EXCEL
const generarReporteExcel = () => {
  // Validar que haya datos en la tabla
  if (!currentRecords || currentRecords.length === 0) {
    swal.fire({
      icon: 'info',
      title: 'Tabla vacía',
      text: 'No hay datos disponibles para generar el reporte Excel.',
      confirmButtonText: 'Aceptar',
    });
    return; // Salir de la función si no hay datos
  }

  // Encabezados del reporte
  const encabezados = [
    ["Saint Patrick Academy"],
    ["Reporte de Grados Académicos"],
    [], // Espacio en blanco
    ["#", "Descripción del Grado Académico"]
  ];

  // Crear filas con los grados académicos (usando currentRecords)
  const filas = currentRecords.map((grado, index) => [
    index + 1, // Índice basado en la posición de los datos filtrados
    grado.Descripcion || "" // Descripción del grado académico
  ]);

  // Combinar encabezados y filas
  const datos = [...encabezados, ...filas];

  // Crear la hoja de trabajo
  const hojaDeTrabajo = XLSX.utils.aoa_to_sheet(datos);

  // Estilos personalizados para los encabezados
  const rangoEncabezado = XLSX.utils.decode_range(hojaDeTrabajo['!ref']);
  for (let row = 0; row <= 3; row++) { // Aplicamos estilo a las primeras 3 filas (encabezado)
    for (let col = rangoEncabezado.s.c; col <= rangoEncabezado.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
      if (hojaDeTrabajo[cellAddress]) {
        hojaDeTrabajo[cellAddress].s = {
          font: { bold: true, sz: 14, color: { rgb: "FFFFFF" } },
          fill: { fgColor: { rgb: "15401D" } }, // Color verde oscuro
          alignment: { horizontal: "center" }
        };
      }
    }
  }

  // Ajustar el ancho de las columnas automáticamente
  const ajusteColumnas = [
    { wpx: 50 },  // Ajustar el ancho de la columna del índice
    { wpx: 200 }  // Ajustar el ancho de la columna de la descripción
  ];

  hojaDeTrabajo['!cols'] = ajusteColumnas;

  // Crear el libro de trabajo
  const libroDeTrabajo = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(libroDeTrabajo, hojaDeTrabajo, "Reporte de Grados Académicos");

  // Nombre del archivo Excel
  const nombreArchivo = `Reporte_Grados_Academicos.xlsx`;

  // Guardar el archivo Excel
  XLSX.writeFile(libroDeTrabajo, nombreArchivo);
};





  return (
    <CContainer>
       {/*Contenedor del hi y boton "nuevo" */}
<CRow className='align-items-center mb-5'>
<CCol xs="12" md="9"> 
    {/* Titulo de la pagina */}
      <h1 className="mb-0">Mantenimiento Grados Académicos</h1>
      </CCol>

      <CCol xs="12" md="3" className="text-end d-flex flex-column flex-md-row justify-content-md-end align-items-md-center">
      {/* Botón "Nuevo" alineado a la derecha */}

      {canInsert && (
      <CButton
        className="mb-3 mb-md-0 me-md-3" // Margen inferior en pantallas pequeñas, margen derecho en pantallas grandes
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
        onClick={() => {
          setModalVisible(true); 
          setHasUnsavedChanges(false); // Resetear el estado al abrir el modal
        }}
      >
  
         <CIcon icon={cilPlus} /> {/* Ícono de "más" */}
         Nuevo
        </CButton>
      )}
       {/* Dropdown para reporte */}
       <CDropdown className="btn-sm d-flex align-items-center gap-1 rounded shadow">
        <CDropdownToggle
          style={{
            backgroundColor: "#6C8E58",
            color: "white",
            cursor: "pointer",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#5A784C";
            e.currentTarget.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.2)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#6C8E58";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          <CIcon icon={cilDescription}/> Reporte
        </CDropdownToggle>
        <CDropdownMenu
          style={{
            position: "absolute",
            zIndex: 1050,
            backgroundColor: "#fff",
            boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.2)",
            borderRadius: "4px",
            overflow: "hidden",
          }}
        >
          {/* Opción para PDF */}
          <CDropdownItem
            onClick={generarReporteGradosAcademicosPDF}
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
            onMouseOver={(e) =>
              (e.target.style.backgroundColor = "#f5f5f5")
            }
            onMouseOut={(e) =>
              (e.target.style.backgroundColor = "transparent")
            }
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

  
       {/* Contenedor de la barra de búsqueda y el botón "Nuevo" */}
       <CRow className='align-items-center mt-4 mb-2'>
      
      {/* Barra de búsqueda */}
      <CCol xs="12" md="8" className='d-flex flex-wrap align-items-center'>
        <CInputGroup className="me-3" style={{width: '400px' }}>
        <CInputGroupText>
           <CIcon icon={cilSearch} /> 
        </CInputGroupText>
        <CFormInput placeholder="Buscar grado academico..."
         onChange={handleSearch} 
         value={searchTerm} />
        


     {/* Botón para limpiar la búsqueda */}
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
{/*Selector dinamico a la par de la barra de busqueda */}
<CCol xs="12" md="4" className='text-md-end mt-2 mt-md-0'>
      <CInputGroup className='mt-2 mt-md-0' style={{width:'auto', display:'inline-block'}}>
        <div className='d-inline-flex align-items-center'>
          <span>Mostrar&nbsp;</span>
          <CFormSelect
            style={{width: '80px', display: 'inline-block', textAlign:'center'}}
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
          <span>&nbsp;registros</span>
        </div>
      </CInputGroup>
      </CCol>


    </CRow>

   
{/* Tabla para mostrar grado academico  */}
    <div className="table-container" style={{ maxHeight: '400px', overflowY: 'scroll', marginBottom: '20px' }}>
      <CTable striped bordered hover>
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell>#</CTableHeaderCell>
            <CTableHeaderCell>Grado academico</CTableHeaderCell>
            <CTableHeaderCell>Acciones</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {currentRecords.map((gradosAcademicos, index) => (
            <CTableRow key={gradosAcademicos.Cod_grado_academico}>
              <CTableDataCell>{/* Mostrar el índice original en lugar del índice basado en la paginación */}
                  {gradosAcademicos.originalIndex} 
                </CTableDataCell>
              <CTableDataCell>{gradosAcademicos.Descripcion}</CTableDataCell>
              <CTableDataCell>
                <CButton
                  style={{ backgroundColor: '#F9B64E',marginRight: '10px' }}
                  onClick={() => {
                    setGradoToUpdate(gradosAcademicos);
                    setModalUpdateVisible(true);
                    setHasUnsavedChanges(false); // Resetear el estado al abrir el modal
                  }}
                >
                  <CIcon icon={cilPen} />
                </CButton>
                <CButton
                  style={{ backgroundColor: '#E57368', marginRight: '10px' }}
                  onClick={() => {
                    setGradoToDelete(gradosAcademicos);
                    setModalDeleteVisible(true);
                  }}
                >
                  <CIcon icon={cilTrash} />
                </CButton>
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
          disabled={currentPage === 1} // Deshabilitar si estás en la primera página
          onClick={() => paginate(currentPage - 1)}>
          Anterior
        </CButton>
        <CButton
          style={{ marginLeft: '10px',backgroundColor: '#6f8173', color: '#D9EAD3' }}
          disabled={currentPage === Math.ceil(filteredGradosAcademicos.length / recordsPerPage)} // Deshabilitar si estás en la última página
          onClick={() => paginate(currentPage + 1)}>
          Siguiente
       </CButton>
     </CPagination>
      {/* Mostrar total de páginas */}
      <span style={{ marginLeft: '10px' }}>
        Página {currentPage} de {Math.ceil(filteredGradosAcademicos.length / recordsPerPage)}
      </span>
   </div>

      {/* Modal Crear */}
      <CModal visible={modalVisible} backdrop="static">
        <CModalHeader closeButton={false}>
          <CModalTitle>Nuevo Grado Académico</CModalTitle>
          <CButton className="btn-close" aria-label="Close" onClick={() => handleCloseModal(setModalVisible, resetNuevoGrado)} /> 
          </CModalHeader>
        <CModalBody>
        <CForm>
          <CInputGroup className="mb-3">
            <CInputGroupText>Grado académico</CInputGroupText>
            <CFormInput
             ref={inputRef}  // Asignar la referencia al input
            type="text"
              placeholder="Ingrese el grado académico"
              value={nuevoGrado.Descripcion} 
              maxLength={50} // Limitar a 50 caracteres
              onPaste={disableCopyPaste}
              onCopy={disableCopyPaste}
              onChange={(e) => handleInputChange (e, (value) => setNuevoGrado({ ...nuevoGrado, Descripcion: value }))}
            />
          </CInputGroup>
          </CForm>
        </CModalBody>
        <CModalFooter>
        <CButton color="secondary" onClick={() => handleCloseModal(setModalVisible, resetNuevoGrado)}>
            Cancelar
          </CButton>
          <CButton style={{ backgroundColor: '#4B6251',color: 'white' }} onClick={handleCreateGrado}>
          <CIcon icon={cilSave} style={{ marginRight: '5px' }} />Guardar
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Modal Actualizar */}
      <CModal visible={modalUpdateVisible} backdrop="static">
        <CModalHeader closeButton={false}>
          <CModalTitle>Actualizar Grado Académico</CModalTitle> 
          <CButton className="btn-close" aria-label="Close" onClick={() => handleCloseModal(setModalUpdateVisible, resetNuevoGrado)} />
        </CModalHeader>
        <CModalBody>
        <CForm>
          <CInputGroup className="mb-3">
            <CInputGroupText>Grado académico</CInputGroupText>
            <CFormInput
            ref={inputRef} // Asignar la referencia al input
              value={gradoToUpdate.Descripcion || ''}
              maxLength={50} // Limitar a 50 caracteres
              onPaste={disableCopyPaste}
              onCopy={disableCopyPaste}
              onChange={(e) => handleInputChange (e, (value)=> setGradoToUpdate({ ...gradoToUpdate, Descripcion: value }))}
            />
          </CInputGroup>
          </CForm>
        </CModalBody>
        <CModalFooter>
        <CButton color="secondary" onClick={() => handleCloseModal(setModalUpdateVisible, resetgradoToUpdate)}>
            Cancelar

          
          </CButton>
          {canUpdate && (
          <CButton style={{  backgroundColor: '#F9B64E',color: 'white' }} onClick={handleUpdateGrado}>
          <CIcon icon={cilPen} style={{ marginRight: '5px' }} />Actualizar
          </CButton>
            )}
        </CModalFooter>
      </CModal>

      {/* Modal Eliminar */}
      <CModal visible={modalDeleteVisible} onClose={() => setModalDeleteVisible(false)} backdrop="static">
        <CModalHeader>
          <CModalTitle>Eliminar Grado Académico</CModalTitle>
        </CModalHeader>
        <CModalBody>
          ¿Estás seguro de que deseas eliminar el grado académico: <strong>{gradoToDelete.Descripcion}</strong>?
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setModalDeleteVisible(false)}>
            Cancelar
          </CButton>
          {canDelete && (
          <CButton style={{  backgroundColor: '#E57368',color: 'white' }} onClick={handleDeleteGrado}>
          <CIcon icon={cilTrash} style={{ marginRight: '5px' }} /> Eliminar 
          </CButton>
          )}
        </CModalFooter>
      </CModal>
    </CContainer>
  );
};

export default ListaGradoAcademico;
