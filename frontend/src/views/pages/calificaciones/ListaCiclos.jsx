import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { CIcon } from '@coreui/icons-react';
import { cilSearch, cilBrushAlt, cilPen, cilTrash, cilPlus, cilSave, cilSpreadsheet, cilDescription,cilFile, } from '@coreui/icons'; // Importar iconos específicos
import Swal from 'sweetalert2';
import logo from 'src/assets/brand/logo_saint_patrick.png'
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

//necesarios abajo
import axios from 'axios';
import * as jwt_decode from 'jwt-decode';


import {
  CContainer,
  CForm,
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


const ListaCiclos = () => {
  const { canSelect, loading, error, canDelete, canInsert, canUpdate } = usePermission('ListaCiclos');
  const [ciclos, setCiclos] = useState([]);
  const [modalVisible, setModalVisible] = useState(false); // Estado para el modal de crear ciclo
  const [modalUpdateVisible, setModalUpdateVisible] = useState(false); // Estado para el modal de actualizar ciclo
  const [modalDeleteVisible, setModalDeleteVisible] = useState(false); // Estado para el modal de eliminar ciclo
  const [nuevoCiclo, setNuevoCiclo] = useState(''); // Estado para el nuevo ciclo
  const [cicloToUpdate, setCicloToUpdate] = useState({}); // Estado para el ciclo a actualizar
  const [cicloToDelete, setCicloToDelete] = useState({}); // Estado para el ciclo a eliminar
  const [recordsPerPage, setRecordsPerPage] = useState(5); // Hacer dinámico el número de registros por página
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1); // Estado para la página actual
  const inputRef = useRef(null); // Referencia para el input
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false); // Estado para detectar cambios sin guardar
  const resetNuevoCiclo = () => setNuevoCiclo('');
  const resetCiclotoUpdate = () => setCicloToUpdate('');


  useEffect(() => {
    fetchCiclos();
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


  const fetchCiclos = async () => {
    try {
      const response = await fetch('http://74.50.68.87:4000/api/ciclos/verCiclos');
      const data = await response.json();
      // Asignar un índice original basado en el orden en la base de datos
      const dataWithIndex = data.map((ciclo, index) => ({
        ...ciclo,
        originalIndex: index + 1, // Guardamos la secuencia original
      }));

      setCiclos(dataWithIndex);
    } catch (error) {
      console.error('Error al obtener los ciclos:', error);
    }
  };

  const validarCiclo = () => {
    const nombreCiclo = typeof nuevoCiclo === 'string' ? nuevoCiclo : nuevoCiclo.Nombre_ciclo;
    // Comprobación de vacío
    if (!nombreCiclo || nombreCiclo.trim() === '') {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'El campo "Nombre del Ciclo" no puede estar vacío',
        confirmButtonText: 'Aceptar' // Texto del botón de confirmación
      });
      return false;
    }

    // Verificar si el nombre del ciclo ya existe
    const cicloExistente = ciclos.some(
      (ciclo) => ciclo.Nombre_ciclo.trim().toLowerCase() === nombreCiclo.trim().toLowerCase()
    );

    if (cicloExistente) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: `El ciclo "${nombreCiclo}" ya existe`,
        confirmButtonText: 'Aceptar' // Cambia el texto del botón
      });
      return false;
    }

    return true;
  };

  const validarCicloUpdate = () => {
    if (!cicloToUpdate.Nombre_ciclo) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'El campo "Nombre del Ciclo" no puede estar vacío',
        confirmButtonText: 'Aceptar' // Texto del botón de confirmación
      });
      return false;
    }
    // Verificar si el nombre del ciclo ya existe (excluyendo el ciclo actual que se está editando)
    const cicloExistente = ciclos.some(
      (ciclo) =>
        ciclo.Nombre_ciclo.trim().toLowerCase() === cicloToUpdate.Nombre_ciclo.trim().toLowerCase() &&
        ciclo.Cod_ciclo !== cicloToUpdate.Cod_ciclo
    );

    if (cicloExistente) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: `El ciclo "${cicloToUpdate.Nombre_ciclo}" ya existe`,
        confirmButtonText: 'Aceptar' // Cambia el texto del botón
      });
      return false;
    }

    return true;
  };

  const handleReporteClick = () => {
    // Validar que haya datos en la tabla
    if (!currentRecords || currentRecords.length === 0) {
      Swal.fire({
        icon: 'info',
        title: 'Tabla vacía',
        text: 'No hay datos disponibles para generar el reporte.',
        confirmButtonText: 'Aceptar',
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
      doc.text("SAINT PATRICK'S ACADEMY", doc.internal.pageSize.width / 2, yPosition, {
        align: 'center',
      });
  
      yPosition += 12;
  
      // Subtítulo
      doc.setFontSize(16);
      doc.text('Reporte de Ciclos', doc.internal.pageSize.width / 2, yPosition, {
        align: 'center',
      });
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

  
      doc.autoTable({
        startY: yPosition + 4,
        head: [['#', 'Nombre del Ciclo']],
        body: currentRecords.map((ciclo, index) => [
          ciclo.originalIndex || index + 1, // Mostrar índice original o calcularlo
          ciclo.Nombre_ciclo, // Mostrar el nombre del ciclo
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
          1: { cellWidth: 'auto' }, // Columna 'Descripción' se ajusta automáticamente
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

      // Abrir el PDF
      window.open(doc.output('bloburl'), '_blank');
    };
  
    img.onerror = () => {
      console.warn('No se pudo cargar el logo. El PDF se generará sin el logo.');
      window.open(doc.output('bloburl'), '_blank');
    };
  };

  const handleReporteExcelClick = () => {
    // Encabezados iniciales del reporte
    const encabezados = [
      ["Saint Patrick Academy"],
      ["Reporte de Ciclos"],
      [`Fecha de generación: ${new Date().toLocaleDateString()}`],
      [], // Espacio en blanco
    ];
  
    // Encabezados de la tabla
    encabezados.push(["#", "Nombre del Ciclo"]);
  
    // Crear filas de la tabla con los datos de los ciclos
    const filas = currentRecords.map((ciclo, index) => [
      ciclo.originalIndex || index + 1, // Mostrar índice original o generar índice
      ciclo.Nombre_ciclo, // Nombre del ciclo
    ]);
  
    // Combinar encabezados y filas
    const datos = [...encabezados, ...filas];
  
    // Crear una hoja de trabajo con los datos
    const hojaDeTrabajo = XLSX.utils.aoa_to_sheet(datos);
  
    // Ajustar el ancho de columnas automáticamente
    const ajusteColumnas = [
      { wpx: 50 }, // Número
      { wpx: 200 }, // Nombre del Ciclo
    ];
    hojaDeTrabajo['!cols'] = ajusteColumnas;
  
    // Crear un libro de trabajo y añadir la hoja
    const libroDeTrabajo = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libroDeTrabajo, hojaDeTrabajo, "Reporte de Ciclos");
  
    // Guardar el archivo Excel
    const nombreArchivo = `reporte_ciclos_${new Date()
      .toLocaleDateString()
      .replace(/\//g, '-')}.xlsx`;
    XLSX.writeFile(libroDeTrabajo, nombreArchivo);
  };
  
  

  // Función para manejar cambios en el input
  const handleInputChange = (e, setFunction) => {
    const input = e.target;
    const cursorPosition = input.selectionStart; // Guarda la posición actual del cursor
    let value = input.value
      .toUpperCase() // Convertir a mayúsculas
      .trimStart(); // Evitar espacios al inicio

      const regex = /^[A-Za-z0-9Ññ\s]*$/;  // Solo letras, números y espacios

    // Verificar si hay múltiples espacios consecutivos antes de reemplazarlos
    if (/\s{2,}/.test(value)) {
      Swal.fire({
        icon: 'warning',
        title: 'Espacios múltiples',
        text: 'No se permite más de un espacio entre palabras.',
        confirmButtonText: 'Aceptar',
      });
      value = value.replace(/\s+/g, ' '); // Reemplazar múltiples espacios por uno solo
    }

    // Validar solo letras y espacios
    if (!regex.test(value)) {
      Swal.fire({
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
          Swal.fire({
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
    Swal.fire({
      icon: 'warning',
      title: 'Acción bloqueada',
      text: 'Copiar y pegar no está permitido.',
      confirmButtonText: 'Aceptar',
    });
  };

  // Función para cerrar el modal con advertencia si hay cambios sin guardar
  const handleCloseModal = (closeFunction, resetFields) => {
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

  const handleCreateCiclo = async () => {
    if (!validarCiclo()) return;  // Verificar si el ciclo es válido antes de continuar
    try {
      // 1. Verificar si obtenemos el token correctamente
      const token = localStorage.getItem('token');
      console.log('Token obtenido:', token);  // Depuración
      if (!token) {
        Swal.fire('Error', 'No tienes permiso para realizar esta acción', 'error');
        return;
      }

      // 2. Realizar la solicitud para crear el ciclo
      const response = await axios.post(
        'http://74.50.68.87:4000/api/ciclos/crearCiclo',
        { Nombre_ciclo: nuevoCiclo },  // Datos a enviar
        {
          headers: {
            'Authorization': `Bearer ${token}`,  // Pasar el token en los encabezados
          },
        }
      );

      console.log('Respuesta de crear ciclo:', response);  // Depuración

      // Verificar que la respuesta sea exitosa
      if (response.status === 200 || response.status === 201) {
        // 3. Decodificar el token para obtener el código de usuario
        const decodedToken = jwt_decode.jwtDecode(token);
        console.log('Token decodificado:', decodedToken);  // Depuración

        // Verificar si el código de usuario está presente en el token
        if (!decodedToken.cod_usuario) {
          console.error('No se pudo obtener el código de usuario del token');
          throw new Error('No se pudo obtener el código de usuario del token');
        }

        // 4. Registrar la acción en la bitácora
        // Usar el nombre del ciclo desde la respuesta (response.data.Nombre_ciclo)
        const descripcion = `El usuario: ${decodedToken.nombre_usuario} ha creado nuevo ciclo: ${nuevoCiclo} `;

        const bitacoraResponse = await axios.post('http://74.50.68.87:4000/api/bitacora/registro',
          {
            cod_usuario: decodedToken.cod_usuario,  // Extraemos el código de usuario desde el token
            cod_objeto: 52,  // Código de objeto para la acción
            accion: 'INSERT',  // Acción realizada
            descripcion: descripcion,  // Usar el mensaje como descripción
          },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );

        console.log('Respuesta de registro en bitácora:', bitacoraResponse);  // Verifica la respuesta

        if (bitacoraResponse.status === 200 || bitacoraResponse.status === 201) {
          console.log('Registro en bitácora exitoso');
          Swal.fire({
            icon: 'success',
            title: '¡Éxito!',
            text: 'El Ciclo se ha creado correctamente',
            confirmButtonText: 'Aceptar',
          });

          // 5. Realizar las acciones posteriores después de la creación exitosa
          // Refrescar la lista de ciclos
          fetchCiclos();

          // Cerrar el modal
          setModalVisible(false);

          // Restablecer el estado del nuevo ciclo
          setNuevoCiclo('');

          // Restablecer la variable de cambios no guardados
          setHasUnsavedChanges(false);
        } else {
          Swal.fire('Error', 'No se pudo registrar la acción en la bitácora', 'error');
        }

      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo crear el ciclo',
          confirmButtonText: 'Aceptar'
        });
      }
    } catch (error) {
      console.error('Error al crear el ciclo:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: `Hubo un error al crear el ciclo: ${error.message}`,
        confirmButtonText: 'Aceptar'
      });
    }
  };


  const handleUpdateCiclo = async () => {
    if (!validarCicloUpdate()) return;
    
    try {
      // Verificar si obtenemos el token correctamente
      const token = localStorage.getItem('token');
      if (!token) {
        Swal.fire('Error', 'No tienes permiso para realizar esta acción', 'error');
        return;
      }
  
      // Decodificar el token para obtener el nombre del usuario
      const decodedToken = jwt_decode.jwtDecode(token);
      if (!decodedToken.cod_usuario || !decodedToken.nombre_usuario) {
        console.error('No se pudo obtener el código o el nombre de usuario del token');
        throw new Error('No se pudo obtener el código o el nombre de usuario del token');
      }
  
      // 1. Realizar la solicitud para actualizar el ciclo
      const response = await fetch('http://74.50.68.87:4000/api/ciclos/actualizarCiclo', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Incluir token en los encabezados
        },
        body: JSON.stringify({ 
          Cod_ciclo: cicloToUpdate.Cod_ciclo, 
          Nombre_ciclo: cicloToUpdate.Nombre_ciclo 
        }), // Envío del nombre actualizado y Cod_ciclo en el cuerpo
      });
  
      if (response.ok) {
        // 2. Registrar la acción en la bitácora
        const descripcion = `El usuario: ${decodedToken.nombre_usuario} ha actualizado el ciclo: ${cicloToUpdate.Nombre_ciclo}`;
        
        // Enviar a la bitácora
        const bitacoraResponse = await fetch('http://74.50.68.87:4000/api/bitacora/registro', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`, // Incluir token en los encabezados
          },
          body: JSON.stringify({
            cod_usuario: decodedToken.cod_usuario, // Código del usuario
            cod_objeto: 52, // Código del objeto para la acción
            accion: 'UPDATE', // Acción realizada
            descripcion: descripcion, // Descripción de la acción
          }),
        });
  
        if (bitacoraResponse.ok) {
          console.log('Registro en bitácora exitoso');
        } else {
          Swal.fire('Error', 'No se pudo registrar la acción en la bitácora', 'error');
        }
  
        // 3. Realizar las acciones posteriores después de la actualización exitosa
        fetchCiclos(); // Refrescar la lista de ciclos después de la actualización
        setModalUpdateVisible(false); // Cerrar el modal de actualización
        resetCiclotoUpdate(); // Resetear el ciclo a actualizar
        setHasUnsavedChanges(false);
        Swal.fire({
          icon: 'success',
          title: '¡Éxito!',
          text: 'El ciclo se ha actualizado correctamente',
          confirmButtonText: 'Aceptar',
        });
      } else {
        Swal.fire('Error', 'Hubo un problema al actualizar el ciclo', 'error');
      }
  
      // Validación de campo obligatorio
      if (!cicloToUpdate.Nombre_ciclo) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'El nombre del ciclo es obligatorio',
          confirmButtonText: 'Aceptar' // Cambia el texto del botón
        });
        return false;
      }
  
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un problema al actualizar el ciclo',
        confirmButtonText: 'Aceptar' 
      });
      console.error('Error al actualizar el ciclo:', error);
    }
  };

  const handleDeleteCiclo = async () => {
    try {
      // Verificar si obtenemos el token correctamente
      const token = localStorage.getItem('token');
      if (!token) {
        Swal.fire('Error', 'No tienes permiso para realizar esta acción', 'error');
        return;
      }
  
      // Decodificar el token para obtener el nombre del usuario
      const decodedToken = jwt_decode.jwtDecode(token);
      if (!decodedToken.cod_usuario || !decodedToken.nombre_usuario) {
        console.error('No se pudo obtener el código o el nombre de usuario del token');
        throw new Error('No se pudo obtener el código o el nombre de usuario del token');
      }
  
      // 1. Realizar la solicitud para eliminar el ciclo
      const response = await fetch('http://74.50.68.87:4000/api/ciclos/eliminarCiclo', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Incluir token en los encabezados
        },
        body: JSON.stringify({ Cod_ciclo: cicloToDelete.Cod_ciclo }), // Enviar Cod_ciclo en el cuerpo
      });
  
      if (response.ok) {
        // 2. Registrar la acción en la bitácora
        const descripcion = `El usuario: ${decodedToken.nombre_usuario} ha eliminado el ciclo: ${cicloToDelete.Nombre_ciclo}`;
        
        // Enviar a la bitácora
        const bitacoraResponse = await fetch('http://74.50.68.87:4000/api/bitacora/registro', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`, // Incluir token en los encabezados
          },
          body: JSON.stringify({
            cod_usuario: decodedToken.cod_usuario, // Código del usuario
            cod_objeto: 52, // Código del objeto para la acción
            accion: 'DELETE', // Acción realizada
            descripcion: descripcion, // Descripción de la acción
          }),
        });
  
        if (bitacoraResponse.ok) {
          console.log('Registro en bitácora exitoso');
        } else {
          Swal.fire('Error', 'No se pudo registrar la acción en la bitácora', 'error');
        }
  
        // 3. Realizar las acciones posteriores después de la eliminación exitosa
        fetchCiclos(); // Refrescar la lista de ciclos después de la eliminación
        setModalDeleteVisible(false); // Cerrar el modal de confirmación
        setCicloToDelete({}); // Resetear el ciclo a eliminar
        Swal.fire({
          icon: 'success',
          title: '¡Éxito!',
          text: 'El ciclo se ha eliminado correctamente',
          confirmButtonText: 'Aceptar',
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'El ciclo ya pertenece a un grado',
          confirmButtonText: 'Aceptar' 
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un problema al eliminar el ciclo',
        confirmButtonText: 'Aceptar' 
      });
      console.error('Error al eliminar el ciclo:', error);
    }
  };
  

  const openUpdateModal = (ciclo) => {
    setCicloToUpdate(ciclo); // Cargar los datos del ciclo a actualizar
    setModalUpdateVisible(true); // Abrir el modal de actualización
    setHasUnsavedChanges(false);
  };

  const openDeleteModal = (ciclo) => {
    setCicloToDelete(ciclo); // Guardar el ciclo que se desea eliminar
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
      Swal.fire({
        icon: 'warning',
        title: 'Espacios múltiples',
        text: 'No se permite más de un espacio entre palabras.',
        confirmButtonText: 'Aceptar'
      });
      value = value.replace(/\s+/g, ' '); // Reemplazar múltiples espacios por uno solo
    }

    // Validar caracteres permitidos
    if (!regex.test(value)) {
      Swal.fire({
        icon: 'warning',
        title: 'Caracteres no permitidos',
        text: 'Solo se permiten letras, números y espacios.',
        confirmButtonText: 'Aceptar'
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
          Swal.fire({
            icon: 'warning',
            title: 'Repetición de letras',
            text: `La letra "${letter}" se repite más de 4 veces en la palabra "${word}".`,
            confirmButtonText: 'Aceptar'
          });
          return;
        }
      }
    }

    setSearchTerm(value);
    setCurrentPage(1); // Resetear a la primera página al buscar
  };


  // Filtro de búsqueda
  const filteredCiclos = ciclos.filter((ciclo) =>
    ciclo.Nombre_ciclo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Lógica de paginación
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredCiclos.slice(indexOfFirstRecord, indexOfLastRecord);

  // Cambiar página
  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= Math.ceil(filteredCiclos.length / recordsPerPage)) {
      setCurrentPage(pageNumber);
    }
  }

  // Verificar permisos
  if (!canSelect) {
    return <AccessDenied />;
  }

  return (
    <CContainer>
      {/* Contenedor del h1 y botón "Nuevo" */}
      <CRow className="align-items-center mb-5">
        <CCol xs="12" md="9">
          {/* Título de la página */}
          <h1 className="mb-0">Mantenimiento Ciclos</h1>
        </CCol>
        <CCol xs="12" md="3" className="text-end d-flex flex-column flex-md-row justify-content-md-end align-items-md-center">
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
          onClick={handleReporteClick}
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
        onClick={handleReporteExcelClick}
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
              placeholder="Buscar Ciclo..."
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
                <option value="20">20</option>
              </CFormSelect>
              <span>&nbsp;registros</span>
            </div>
          </CInputGroup>
        </CCol>
      </CRow>


      {/* Tabla para mostrar ciclos */}
      <div className="table-container" style={{ maxHeight: '400px', overflowY: 'scroll', marginBottom: '20px' }}>
        <CTable striped bordered hover>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell style={{ width: '50px' }}>#</CTableHeaderCell>
              <CTableHeaderCell style={{ width: '50px' }}>Nombre del Ciclo</CTableHeaderCell>
              <CTableHeaderCell style={{ width: '50px' }}>Acciones</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {currentRecords.map((ciclo) => (
              <CTableRow key={ciclo.Cod_ciclo}>
                <CTableDataCell>
                  {/* Mostrar el índice original en lugar del índice basado en la paginación */}
                  {ciclo.originalIndex}
                </CTableDataCell>
                <CTableDataCell>{ciclo.Nombre_ciclo}</CTableDataCell>
                <CTableDataCell>
                  {canUpdate && (
                    <CButton style={{ backgroundColor: '#F9B64E', marginRight: '10px' }} onClick={() => openUpdateModal(ciclo)}>
                      <CIcon icon={cilPen} />
                    </CButton>
                  )}

                  {canDelete && (
                    <CButton style={{ backgroundColor: '#E57368', marginRight: '10px' }} onClick={() => openDeleteModal(ciclo)}>
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
            disabled={currentPage === Math.ceil(filteredCiclos.length / recordsPerPage)} // Desactiva si es la última página
            onClick={() => paginate(currentPage + 1)} // Páginas siguientes
          >
            Siguiente
          </CButton>
        </CPagination>
        <span style={{ marginLeft: '10px' }}>
          Página {currentPage} de {Math.ceil(filteredCiclos.length / recordsPerPage)}
        </span>
      </div>


      {/* Modal Crear Ciclo */}
      <CModal visible={modalVisible} backdrop="static">
        <CModalHeader closeButton={false}>
          <CModalTitle>Nuevo Ciclo</CModalTitle>
          <CButton className="btn-close" aria-label="Close" onClick={() => handleCloseModal(setModalVisible, resetNuevoCiclo)} />
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CInputGroup className="mb-3">
              <CInputGroupText>Nombre del Ciclo</CInputGroupText>
              <CFormInput
                ref={inputRef}
                type="text"
                placeholder="Ingrese el nombre del ciclo"
                maxLength={20}
                onPaste={disableCopyPaste}
                onCopy={disableCopyPaste}
                value={nuevoCiclo}
                onChange={(e) => handleInputChange(e, setNuevoCiclo)}
              />
            </CInputGroup>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => handleCloseModal(setModalVisible, resetNuevoCiclo)}>
            Cancelar
          </CButton>
          <CButton style={{ backgroundColor: '#4B6251', color: 'white' }} onClick={handleCreateCiclo}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#3C4B43")}onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#4B6251")}>
            <CIcon icon={cilSave} style={{ marginRight: '5px' }} /> Guardar
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Modal Actualizar Ciclo */}
      <CModal visible={modalUpdateVisible} backdrop="static">
        <CModalHeader closeButton={false}>
          <CModalTitle>Actualizar Ciclo</CModalTitle>
          <CButton className="btn-close" aria-label="Close" onClick={() => handleCloseModal(setModalUpdateVisible, resetCiclotoUpdate)} />
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CInputGroup className="mb-3">
              <CInputGroupText>Nombre del Ciclo</CInputGroupText>
              <CFormInput
                ref={inputRef} // Asignar la referencia al input
                maxLength={20}
                onPaste={disableCopyPaste}
                onCopy={disableCopyPaste}
                placeholder="Ingrese el nuevo nombre del ciclo"
                value={cicloToUpdate.Nombre_ciclo}
                onChange={(e) => handleInputChange(e, (value) => setCicloToUpdate({
                  ...cicloToUpdate,
                  Nombre_ciclo: value,
                }))}
              />
            </CInputGroup>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => handleCloseModal(setModalUpdateVisible, resetCiclotoUpdate)}>
            Cancelar
          </CButton>
          <CButton style={{ backgroundColor: '#F9B64E', color: 'white' }} onClick={handleUpdateCiclo}>
            <CIcon icon={cilPen} style={{ marginRight: '5px' }} />Actualizar
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Modal Eliminar Ciclo */}
      <CModal visible={modalDeleteVisible} onClose={() => setModalDeleteVisible(false)} backdrop="static">
        <CModalHeader>
          <CModalTitle>Confirmar Eliminación</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <p>¿Estás seguro de que deseas eliminar el ciclo: <strong>{cicloToDelete.Nombre_ciclo}</strong>?</p>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setModalDeleteVisible(false)}>
            Cancelar
          </CButton>
          <CButton style={{ backgroundColor: '#E57368', color: 'white' }} onClick={handleDeleteCiclo}>
            <CIcon icon={cilTrash} style={{ marginRight: '5px' }} />Eliminar
          </CButton>
        </CModalFooter>
      </CModal>
    </CContainer>
  );
};


export default ListaCiclos;
