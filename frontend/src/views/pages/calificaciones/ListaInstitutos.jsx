import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { CIcon } from '@coreui/icons-react';
import { cilSearch, cilBrushAlt, cilPen, cilTrash, cilPlus, cilSave,cilDescription,cilFile,cilSpreadsheet } from '@coreui/icons'; // Importar iconos específicos
import swal from 'sweetalert2';

//necesarios abajo
import axios from 'axios';
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


import logo from 'src/assets/brand/logo_saint_patrick.png'
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

import usePermission from '../../../../context/usePermission';
import AccessDenied from "../AccessDenied/AccessDenied"


const ListaInstitutos = () => {
  const { canSelect, loading, error, canDelete, canInsert, canUpdate } = usePermission('ListaInstitutos');
  const [institutos, setInstituto] = useState([]);
  const [modalVisible, setModalVisible] = useState(false); // Estado para el modal de crear un estado asistencia
  const [modalUpdateVisible, setModalUpdateVisible] = useState(false); // Estado para el modal de actualizar un estado asistencia
  const [modalDeleteVisible, setModalDeleteVisible] = useState(false); // Estado para el modal de eliminar un estado asistencia
  const [nuevoInstituto, setNuevoInstituto] = useState(''); // Estado para el nuevo estado asistencia
  const [institutoToUpdate, setInstitutoToUpdate] = useState({}); // Estado para el estado asistencia actualizar
  const [institutoToDelete, setInstitutoToDelete] = useState({}); // Estado para el estado asistencia a eliminar
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1); // Estado para la página actual
  const [recordsPerPage, setRecordsPerPage] = useState(5); // Hacer dinámico el número de registros por página
  const inputRef = useRef(null); // Referencia para el input
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false); // Estado para detectar cambios sin guardar

  useEffect(() => {
    fetchInstitutos();
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

  const fetchInstitutos = async () => {
    try {
      const response = await fetch('http://74.50.68.87:4000/api/instituto/instituto');
      const data = await response.json();
      // Asignar un índice original basado en el orden en la base de datos
    const dataWithIndex = data.map((instituto, index) => ({
      ...instituto,
      originalIndex: index + 1, // Guardamos la secuencia original
    }));
    
    setInstituto(dataWithIndex);
    } catch (error) {
      console.error('Error al obtener los Institutos:', error);
    }
  };

  // Función para manejar cambios en el input
  const handleInputChange = (e, setFunction) => {
    const input = e.target;
    const cursorPosition = input.selectionStart; // Guarda la posición actual del cursor
    let value = input.value
      .toUpperCase() // Convertir a mayúsculas
      .trimStart(); // Evitar espacios al inicio

    const regex = /^[A-ZÑÁÉÍÓÚ0-9\s,]*$/;// Solo letras y espacios

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
  const disableCopyPaste = (e) => {
    e.preventDefault();
    swal.fire({
      icon: 'warning',
      title: 'Acción bloqueada',
      text: 'Copiar y pegar no está permitido.',
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

  const resetNuevoInstituto = () => setNuevoInstituto('');
  const resetInstitutoToUpdate = () => setInstitutoToUpdate('');

  const handleCreateInstituto = async () => {
    // Validación para campos vacíos
    if (!nuevoInstituto.trim()) {
      swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'El campo "Nombre de Instituto" no puede estar vacío',
        confirmButtonText: 'Aceptar',
      });
      return;
    }

    // Normalizar la entrada de usuario para evitar problemas de mayúsculas o espacios adicionales
    const descripcionNormalizada = nuevoInstituto.trim().toLowerCase();
    // Verificar si ya existe el estado de asistencia antes de hacer la solicitud
    const existe = institutos.some(
      (instituto) => instituto.Nom_Instituto.trim().toLowerCase() === descripcionNormalizada
    );

    if (existe) {
      swal.fire({
        icon: 'error',
        title: 'Error',
        text: `El instituto "${nuevoInstituto}" ya existe`,
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

       const response = await fetch('http://74.50.68.87:4000/api/instituto/crearinstituto', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({  Nom_Instituto: nuevoInstituto }),  // Enviar descripción formateada
      });
  
      const result = await response.json();

      if (response.ok) {
        // 2. Registrar la acción en la bitácora
        const descripcion = `El usuario: ${decodedToken.nombre_usuario} ha creado nuevo instituto: ${nuevoInstituto} `;
        
        // Enviar a la bitácora
        const bitacoraResponse = await fetch('http://74.50.68.87:4000/api/bitacora/registro', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`, // Incluir token en los encabezados
          },
          body: JSON.stringify({
            cod_usuario: decodedToken.cod_usuario, // Código del usuario
            cod_objeto: 104, // Código del objeto para la acción
            accion: 'INSERT', // Acción realizada
            descripcion: descripcion, // Descripción de la acción
          }),
        });
  
        if (bitacoraResponse.ok) {
          console.log('Registro en bitácora exitoso');
        } else {
          swal.fire('Error', 'No se pudo registrar la acción en la bitácora', 'error');
        }
  
        fetchInstitutos();  // Actualiza la lista de estados de asistencia
        setModalVisible(false);  // Cierra el modal
        resetNuevoInstituto();
        setHasUnsavedChanges(false); // Reiniciar el estado de cambios no guardados
        swal.fire({
          icon: 'success',
          title: '¡Éxito!',
          text: 'El instituto se ha creado correctamente',
          confirmButtonText: 'Aceptar',
        });
      } else {
        swal.fire({
          icon: 'error',
          title: 'Error',
          text: result.Mensaje || 'Hubo un problema al crear el instituto',
        });
      }
    } catch (error) {
      console.error('Error al crear el instituto', error);
      swal.fire({
        icon: 'error',
        title: 'Error en el servidor',
        text: 'Hubo un problema en el servidor. Inténtalo más tarde',
      });
    }
  };
  
  
  const handleUpdateInstituto = async () => {
    // Validación para campo vacío
    if (!institutoToUpdate.Nom_Instituto.trim()) {
      swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'El campo "Nombre del Instituto" no puede estar vacío',
        confirmButtonText: 'Aceptar',
      });
      return;
    }

    // Normalización de la descripción para evitar duplicados
    const descripcionNormalizada = institutoToUpdate.Nom_Instituto.trim().toLowerCase();

    const existe = institutos.some(
      (instituto) => 
        instituto.Nom_Instituto.trim().toLowerCase() === descripcionNormalizada &&
        instituto.Cod_Institutos !== institutoToUpdate.Cod_Instituto
    );

    if (existe) {
      swal.fire({
        icon: 'error',
        title: 'Error',
        text: `El instituto "${institutoToUpdate.Nom_Instituto}" ya existe`,
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
   
       const response = await fetch('http://74.50.68.87:4000/api/instituto/actualizarinstituto', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Incluir token en los encabezados
        },
        body: JSON.stringify({
          Cod_Instituto: institutoToUpdate.Cod_Instituto,
          Nom_Instituto: institutoToUpdate.Nom_Instituto, // Usar la descripción formateada
        }),
      });
  
      const result = await response.json();
  
      if (response.ok) {

        // 2. Registrar la acción en la bitácora
        const descripcion = `El usuario: ${decodedToken.nombre_usuario} ha actualizado el estado asistencia a: ${institutoToUpdate.Nom_Instituto}`;
        
        // Enviar a la bitácora
        const bitacoraResponse = await fetch('http://74.50.68.87:4000/api/bitacora/registro', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`, // Incluir token en los encabezados
          },
          body: JSON.stringify({
            cod_usuario: decodedToken.cod_usuario, // Código del usuario
            cod_objeto: 104, // Código del objeto para la acción
            accion: 'UPDATE', // Acción realizada
            descripcion: descripcion, // Descripción de la acción
          }),
        });
  
        if (bitacoraResponse.ok) {
          console.log('Registro en bitácora exitoso');
        } else {
          swal.fire('Error', 'No se pudo registrar la acción en la bitácora', 'error');
        }
  


        fetchInstitutos(); // Refrescar la lista de institutos
        setModalUpdateVisible(false); // Cerrar el modal de actualización
        resetInstitutoToUpdate();
        setHasUnsavedChanges(false); // Reiniciar el estado de cambios no guardados
        
        swal.fire({
          icon: 'success',
          title: '¡Éxito!',
          text: 'El instituto se ha actualizado correctamente',
          confirmButtonText: 'Aceptar',
        });
      } else {
        swal.fire({
          icon: 'error',
          title: 'Error',
          text: result.Mensaje || 'Hubo un problema al actualizar el instituto.',
        });
      }
    } catch (error) {
      console.error('Hubo un problema al actualizar el instituto:', error);
      swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un problema en el servidor. Inténtalo más tarde',
      });
    }
  };
  

  const handleDeleteInstitutos = async () => {
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

       const response = await fetch('http://74.50.68.87:4000/api/instituto/eliminarinstituto', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Incluir token en los encabezados
        },
        body: JSON.stringify({
          Cod_Instituto: institutoToDelete.Cod_Instituto
        }), // Enviar Cod_Instituto en el cuerpo
      });

      // Parsear la respuesta JSON del servidor
      const result = await response.json();

      if (response.ok) {

         // 2. Registrar la acción en la bitácora
         const descripcion = `El usuario: ${decodedToken.nombre_usuario} ha eliminado el instituto: ${institutoToDelete.Nom_Instituto}`;
        
         // Enviar a la bitácora
         const bitacoraResponse = await fetch('http://74.50.68.87:4000/api/bitacora/registro', {
           method: 'POST',
           headers: {
             'Content-Type': 'application/json',
             'Authorization': `Bearer ${token}`, // Incluir token en los encabezados
           },
           body: JSON.stringify({
             cod_usuario: decodedToken.cod_usuario, // Código del usuario
             cod_objeto: 104, // Código del objeto para la acción
             accion: 'DELETE', // Acción realizada
             descripcion: descripcion, // Descripción de la acción
           }),
         });
   
         if (bitacoraResponse.ok) {
           console.log('Registro en bitácora exitoso');
         } else {
           swal.fire('Error', 'No se pudo registrar la acción en la bitácora', 'error');
         }

        // Si la respuesta es exitosa
        fetchInstitutos(); // Refrescar la lista de estados de asistencia
        setModalDeleteVisible(false); // Cerrar el modal de confirmación
        setInstitutoToDelete({}); // Resetear el objeto a eliminar
        swal.fire({
          icon: 'success',
          title: '¡Éxito!',
          text: 'El instituto se ha eliminado correctamente.',
          confirmButtonText: 'Aceptar',
        });
      } else {
        // Si hubo un error, mostrar el mensaje devuelto por el servidor
        swal.fire({
          icon: 'error',
          title: 'Error',
          text: result.Mensaje || 'Hubo un problema al eliminar el instituto.',
        });
      }
    } catch (error) {
      // Manejo de errores inesperados (como problemas de red)
      console.error('Error al eliminar el instituto:', error);
      swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un problema en el servidor. Inténtalo más tarde',
      });
    }
  };

   // Función para abrir el modal de actualización
  const openUpdateModal = (instituto) => {
    setInstitutoToUpdate(instituto); // Cargar los datos del estado asistencia a actualizar
    setModalUpdateVisible(true); // Abrir el modal de actualización
    setHasUnsavedChanges(false); // Resetear el estado al abrir el modal
  };

  const openDeleteModal = (instituto) => {
    setInstitutoToDelete(instituto); // Guardar el ciclo que se desea eliminar
    setModalDeleteVisible(true); // Abrir el modal de confirmación
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

  // Filtrar los estados de asistencia según el término de búsqueda
  const filteredInstituto = institutos.filter((instituto) =>
    instituto.Nom_Instituto.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Lógica de paginación
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredInstituto.slice(indexOfFirstRecord, indexOfLastRecord);

  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= Math.ceil(filteredInstituto.length / recordsPerPage)) {
      setCurrentPage(pageNumber);
    }
  };

     // Verificar permisos
     if (!canSelect) {
      return <AccessDenied />;
    }
  
    const generarReportePDF = () => {
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
        doc.text('Reporte de Institutos', doc.internal.pageSize.width / 2, yPosition, { align: 'center' });
    
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
          head: [['#', 'Nombre']],
          body: currentRecords.map((instituto, index) => [
            index + 1,
            `${instituto.Nom_Instituto || ''}`.trim(),
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
            1: { cellWidth: 'auto' }, // Columna 'Nom_Instituto' se ajusta automáticamente
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
      if (!currentRecords || currentRecords.length === 0) {
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
        ["Reporte de Institutos"],
        [], // Espacio en blanco
        ["#","Nombre"]
      ];
    
      // Crear filas con asistencias filtradas
      const filas = currentRecords.map((instituto, index) => [
        index + 1,
        instituto.Nom_Instituto
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
        { wpx: 100 }
      ];
    
      hojaDeTrabajo['!cols'] = ajusteColumnas;
    
      // Crear el libro de trabajo
      const libroDeTrabajo = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(libroDeTrabajo, hojaDeTrabajo, "Reporte de Institutos");
      // Guardar el archivo Excel con un nombre fijo
      const nombreArchivo = `Reporte_Institutos.xlsx`;

      XLSX.writeFile(libroDeTrabajo, nombreArchivo);
    };


 return (
  <CContainer>
    {/* Contenedor del h1 y botón "Nuevo" */}
    <CRow className="align-items-center mb-5">
  <CCol xs="12" md="9">
    {/* Título de la página */}
    <h1 className="mb-0">Mantenimiento Institutos</h1>
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
        onClick={() => {
          setModalVisible(true);
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
            placeholder="Buscar instituto..."
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


    {/* Tabla para mostrar Estadoasistencia */}
    {/* Contenedor de tabla con scroll */}
    <div className="table-container" style={{ maxHeight: '400px', overflowY: 'scroll', marginBottom: '20px' }}>
      <CTable striped bordered hover>
        <CTableHead style={{ position: 'sticky', top: 0, zIndex: 1, backgroundColor: '#fff' }}>
          <CTableRow> 
            <CTableHeaderCell style={{ width: '50px' }}>#</CTableHeaderCell>
            <CTableHeaderCell style={{ width: '300px' }}>Nombre </CTableHeaderCell>
            <CTableHeaderCell style={{ width: '150px' }}>Acciones</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {currentRecords.map((instituto) => (
            <CTableRow key={instituto.Cod_Instituto}>
              <CTableDataCell>{instituto.originalIndex}</CTableDataCell>
              <CTableDataCell>{instituto.Nom_Instituto}</CTableDataCell>
              <CTableDataCell>


                {canUpdate && (
                <CButton style={{ backgroundColor: '#F9B64E', marginRight: '10px' }} onClick={() => openUpdateModal(instituto)}>
                  <CIcon icon={cilPen} />
                </CButton>
                )}

                {canDelete && (
                <CButton style={{ backgroundColor: '#E57368', marginRight: '10px' }} onClick={() => openDeleteModal(instituto)}>
                  <CIcon icon={cilTrash} />
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
          disabled={currentPage === Math.ceil(filteredInstituto.length / recordsPerPage)} // Desactiva si es la última página
          onClick={() => paginate(currentPage + 1)} // Páginas siguientes
        >
          Siguiente
        </CButton>
      </CPagination>
      <span style={{ marginLeft: '10px' }}>
        Página {currentPage} de {Math.ceil(filteredInstituto.length / recordsPerPage)}
      </span>
    </div>

    {/* Modal Crear Estado asistencia */}
    <CModal visible={modalVisible} backdrop="static">
      <CModalHeader closeButton={false}>
        <CModalTitle>Nuevo Instituto</CModalTitle>
        <CButton className="btn-close" aria-label="Close" onClick={() => handleCloseModal(setModalVisible, resetNuevoInstituto)} />
        </CModalHeader>
      <CModalBody>
        <CForm>
          <CInputGroup className="mb-3">
            <CInputGroupText>Nombre del Instituto</CInputGroupText>
            <CFormInput
              ref={inputRef} // Asignar la referencia al input
              type="text"
              placeholder="Ingrese el nombre del instituto"
              value={nuevoInstituto}
              maxLength={50} // Limitar a 50 caracteres
              onPaste={disableCopyPaste}
              onCopy={disableCopyPaste}
              onChange={(e) => handleInputChange(e, setNuevoInstituto)}
          />
          </CInputGroup>
        </CForm>
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={() => handleCloseModal(setModalVisible, resetNuevoInstituto)}>
          Cancelar
        </CButton>
        <CButton  style={{ backgroundColor: '#4B6251',color: 'white' }}  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#3C4B43")}onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#4B6251")}
         onClick={handleCreateInstituto}>
        <CIcon icon={cilSave} style={{ marginRight: '5px' }} /> Guardar
        </CButton>
      </CModalFooter>
    </CModal>

    {/* Modal Actualizar Estado Asistencia*/}
    <CModal visible={modalUpdateVisible} backdrop="static">
      <CModalHeader closeButton={false}>
      <CModalTitle>Actualizar Instituto</CModalTitle>
      <CButton className="btn-close" aria-label="Close" onClick={() => handleCloseModal(setModalUpdateVisible, resetInstitutoToUpdate)} />
      </CModalHeader>
      <CModalBody>
        <CForm>
          <CInputGroup className="mb-3">
            <CInputGroupText>Nombre del Instituto</CInputGroupText>
            <CFormInput
              ref={inputRef} // Asignar la referencia al input
              type="text"
              placeholder="Ingrese el nombre del instituto"
              value={institutoToUpdate.Nom_Instituto}
              maxLength={50} // Limitar a 50 caracteres
              onPaste={disableCopyPaste}
              onCopy={disableCopyPaste}
              onChange={(e) => handleInputChange(e, (value) =>
                setInstitutoToUpdate({ ...institutoToUpdate, Nom_Instituto: value })
              )}
            />
          </CInputGroup>
        </CForm>
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={() => handleCloseModal(setModalUpdateVisible, resetInstitutoToUpdate)}>
          Cancelar
        </CButton>
        <CButton  style={{  backgroundColor: '#F9B64E',color: 'white' }} 
         onClick={handleUpdateInstituto}>
          <CIcon icon={cilPen} style={{ marginRight: '5px' }} /> Actualizar
        </CButton>
      </CModalFooter>
    </CModal>

    {/* Modal Eliminar estado Asistencia */}
    <CModal visible={modalDeleteVisible} onClose={() => setModalDeleteVisible(false)} backdrop="static">
      <CModalHeader>
      <CModalTitle>Confirmar Eliminación</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <p>¿Estás seguro de que deseas eliminar el instituto: <strong>{institutoToDelete.Nom_Instituto}</strong>?</p>
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={() => setModalDeleteVisible(false)}>
          Cancelar
        </CButton>
        <CButton  style={{  backgroundColor: '#E57368',color: 'white' }}  onClick={handleDeleteInstitutos}>
          <CIcon icon={cilTrash} style={{ marginRight: '5px' }} /> Eliminar
        </CButton>
      </CModalFooter>
    </CModal>
 </CContainer>
  );
};

export default ListaInstitutos;
