import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { CIcon } from '@coreui/icons-react';
import Swal from 'sweetalert2';

import * as jwt_decode from 'jwt-decode';

import { cilSearch, cilBrushAlt, cilPen, cilTrash, cilPlus, cilSave,cilDescription,cilFile,cilSpreadsheet } from '@coreui/icons'; // Importar iconos específicos

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

const ListaAsignaturas = () => {
  const { canSelect, loading, error, canDelete, canInsert, canUpdate } = usePermission('ListaAsignaturas');

  const [Asignaturas, setAsignatura] = useState([]);
  const [modalVisible, setModalVisible] = useState(false); // Estado para el modal de crear ciclo
  const [modalUpdateVisible, setModalUpdateVisible] = useState(false); // Estado para el modal de actualizar ciclo
  const [modalDeleteVisible, setModalDeleteVisible] = useState(false); // Estado para el modal de eliminar ciclo
  const [nueva_Asignatura, setNueva_Asignatura] = useState({
    Nombre_asignatura: '',
    Descripcion_asignatura: ''
  });
  const [asignaturaToUpdate, setAsignaturaToUpdate] = useState({}); // Estado para el ciclo a actualizar
  const [AsignaturaToDelete, setAsignaturaToDelete] = useState({}); // Estado para el ciclo a eliminar
  const [searchTerm, setSearchTerm] = useState('');
  const inputRefNombre = useRef(null); // Referencia para el input
  const inputRefDescripcion = useRef(null);
  const [recordsPerPage, setRecordsPerPage] = useState(5); // Hacer dinámico el número de registros por página
  const [currentPage, setCurrentPage] = useState(1); // Estado para la página actual
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false); // Estado para detectar cambios sin guardar
  const resetAsignatura = () => setNueva_Asignatura({ Nombre_asignatura: '', Descripcion_asignatura: '' });
  const resetAsignaturatoUpdate = () => setAsignaturaToUpdate({ Nombre_asignatura: '', Descripcion_asignatura: '' });

  useEffect(() => {
    fetchAsignaturas();
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

  // Validación de creación de asignatura
  const validateAsignatura = () => {
    const nombreasignatura = typeof nueva_Asignatura === 'string' ? nueva_Asignatura : nueva_Asignatura.Nombre_asignatura;
    const descripcionasignatura = typeof nueva_Asignatura === 'string' ? nueva_Asignatura : nueva_Asignatura.Descripcion_asignatura;

    // Comprobación de vacío
    if (!nombreasignatura || nombreasignatura.trim() === '') {
      Swal.fire('Error', 'El campo "Nombre de la Asignatura" no puede estar vacío', 'error');
      return false;
    }
    if (!descripcionasignatura || descripcionasignatura.trim() === '') {
      Swal.fire('Error', 'El campo "Descripción de la Asignatura" no puede estar vacío', 'error');
      return false;
    }

    // Verificar si ya existe una asignatura con el mismo nombre
    const asignaturaexiste = Asignaturas.some(
      (asignatura) => asignatura.Nombre_asignatura.trim().toLowerCase() === nombreasignatura.trim().toLowerCase()
    );
    const descripcionexiste = Asignaturas.some(
      (asignatura) => asignatura.Descripcion_asignatura.trim().toLowerCase() === descripcionasignatura.trim().toLowerCase()
    );
    

    if (asignaturaexiste) {
      Swal.fire('Error', `La asignatura "${nombreasignatura}" ya existe `, 'error');
      return false;
    }
    if (descripcionexiste) {
      Swal.fire('Error', `La descipción "${descripcionasignatura}" ya existe `, 'error');
      return false;
    }
    return true;
  };

  // Validación de actualización de asignatura
  const validarAsignaturaUpdate = () => {
    if (!asignaturaToUpdate.Nombre_asignatura) {
      Swal.fire('Error', 'El campo "Nombre de la Asignatura" no puede estar vacío', 'error');
      return false;
    }
    if (!asignaturaToUpdate.Descripcion_asignatura) {
      Swal.fire('Error', 'El campo "Descripción de la Asignatura" no puede estar vacío', 'error');
      return false;
    }

    // Verificar si el nombre del parcial ya existe (excluyendo el parcial actual que se está editando)
    const asignaturaExistente = Asignaturas.some(
      (asignatura) =>
        asignatura.Nombre_asignatura.trim().toLowerCase() === asignaturaToUpdate.Nombre_asignatura.trim().toLowerCase() &&
        asignatura.Cod_asignatura !== asignaturaToUpdate.Cod_asignatura // Excluir su propio código
    );

    if (asignaturaExistente) {
      Swal.fire('Error', `La asignatura "${asignaturaToUpdate.Nombre_asignatura}" ya existe `, 'error');
      return false;
    }

    return true;
  };


  // Función para manejar cambios en el input
  const handleInputChange = (e, setFunction, inputRef) => {
    const input = e.target;
    const cursorPosition = input.selectionStart; // Guarda la posición actual del cursor
    let value = input.value
      .toUpperCase() // Convertir a mayúsculas
      .trimStart(); // Evitar espacios al inicio

    const regex = /^[A-ZÑÁÉÍÓÚ0-9\s,]*$/; // Solo letras y espacios y la letra ñ

    // Verificar si hay múltiples espacios consecutivos antes de reemplazarlos
    if (/\s{2,}/.test(value)) {
      Swal.fire({
        icon: 'warning',
        title: 'Espacios múltiples',
        text: 'No se permite más de un espacio entre palabras.',
      });
      value = value.replace(/\s+/g, ' '); // Reemplazar múltiples espacios por uno solo
    }

    // Validar solo letras y espacios
    if (!regex.test(value)) {
      Swal.fire({
        icon: 'warning',
        title: 'Caracteres no permitidos',
        text: 'Solo se permiten letras y espacios.',
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
    if (inputRef && inputRef.current) {
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


  const handleCreateAsignatura = async () => {
    if (!validateAsignatura()) return;
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

      const response = await fetch('http://localhost:4000/api/asignaturas/crearAsignatura', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(nueva_Asignatura),
      });

      if (response.ok) {
         // 2. Registrar la acción en la bitácora
         const descripcion = `El usuario: ${decodedToken.nombre_usuario} ha creado nueva asignatura: ${nueva_Asignatura.Nombre_asignatura} `;
        
         // Enviar a la bitácora
         const bitacoraResponse = await fetch('http://localhost:4000/api/bitacora/registro', {
           method: 'POST',
           headers: {
             'Content-Type': 'application/json',
             'Authorization': `Bearer ${token}`, // Incluir token en los encabezados
           },
           body: JSON.stringify({
             cod_usuario: decodedToken.cod_usuario, // Código del usuario
             cod_objeto: 51, // Código del objeto para la acción
             accion: 'INSERT', // Acción realizada
             descripcion: descripcion, // Descripción de la acción
           }),
         });
   
         if (bitacoraResponse.ok) {
           console.log('Registro en bitácora exitoso');
         } else {
           Swal.fire('Error', 'No se pudo registrar la acción en la bitácora', 'error');
         }
        fetchAsignaturas();
        setModalVisible(false);
        resetAsignatura();
        setHasUnsavedChanges(false); // Reiniciar el estado de cambios no guardados
        Swal.fire({
          icon: 'success',
          title: '¡Éxito!',
          text: 'La asignatura se ha creado correctamente',
          confirmButtonText: 'Aceptar',
        });
      } else {
        Swal.fire('Error', 'Hubo un problema al crear la asignatura', 'error');
      }
    } catch (error) {
      Swal.fire('Error', 'Hubo un problema al crear la asignatura', 'error');
    }
  }; 


  
  const handleUpdateAsignatura = async () => {
    if (!validarAsignaturaUpdate()) return;
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
      const response = await fetch('http://localhost:4000/api/asignaturas/actualizarAsignatura', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ Cod_asignatura: asignaturaToUpdate.Cod_asignatura, Nombre_asignatura: asignaturaToUpdate.Nombre_asignatura, Descripcion_asignatura: asignaturaToUpdate.Descripcion_asignatura }), // Envío del nombre actualizado y Cod_ciclo en el cuerpo
      });

      if (response.ok) {
        // 2. Registrar la acción en la bitácora
        const descripcion = `El usuario: ${decodedToken.nombre_usuario} ha actualizado la asignatura: ${asignaturaToUpdate.Nombre_asignatura} con código ${asignaturaToUpdate.Cod_asignatura}  `;
        
        // Enviar a la bitácora
        const bitacoraResponse = await fetch('http://localhost:4000/api/bitacora/registro', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`, // Incluir token en los encabezados
          },
          body: JSON.stringify({
            cod_usuario: decodedToken.cod_usuario, // Código del usuario
            cod_objeto: 51, // Código del objeto para la acción
            accion: 'UPDATE', // Acción realizada
            descripcion: descripcion, // Descripción de la acción
          }),
        });
  
        if (bitacoraResponse.ok) {
          console.log('Registro en bitácora exitoso');
        } else {
          Swal.fire('Error', 'No se pudo registrar la acción en la bitácora', 'error');
        }
        fetchAsignaturas(); // Refrescar la lista de ciclos después de la actualización
        setModalUpdateVisible(false); // Cerrar el modal de actualización
        resetAsignaturatoUpdate(); // Resetear la asignatura a actualizar
        setHasUnsavedChanges(false);
        Swal.fire({
          icon: 'success',
          title: '¡Éxito!',
          text: 'La asignatura se ha actualizado correctamente',
          confirmButtonText: 'Aceptar',
        });
      } else {
        Swal.fire('Error', 'Hubo un problema al actualizar la asignatura', 'error');
      }
    } catch (error) {
      Swal.fire('Error', 'Hubo un problema al actualizar la asignatura', 'error');
    }
  };


  const handleDeleteAsignatura = async () => {
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
      const response = await fetch('http://localhost:4000/api/asignaturas/eliminar_asignatura', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ Cod_asignatura: AsignaturaToDelete.Cod_asignatura }), // Enviar Cod_ciclo en el cuerpo
      });

      if (response.ok) {
          // 2. Registrar la acción en la bitácora
          const descripcion = `El usuario: ${decodedToken.nombre_usuario} ha eliminado la asignatura: ${AsignaturaToDelete.Nombre_asignatura}`;
        
          // Enviar a la bitácora
          const bitacoraResponse = await fetch('http://localhost:4000/api/bitacora/registro', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`, // Incluir token en los encabezados
            },
            body: JSON.stringify({
              cod_usuario: decodedToken.cod_usuario, // Código del usuario
              cod_objeto: 51, // Código del objeto para la acción
              accion: 'DELETE', // Acción realizada
              descripcion: descripcion, // Descripción de la acción
            }),
          });
    
          if (bitacoraResponse.ok) {
            console.log('Registro en bitácora exitoso');
          } else {
            Swal.fire('Error', 'No se pudo registrar la acción en la bitácora', 'error');
          }
        fetchAsignaturas(); // Refrescar la lista de ciclos después de la eliminación
        setModalDeleteVisible(false); // Cerrar el modal de confirmación
        setAsignaturaToDelete({}); // Resetear el ciclo a eliminar
        Swal.fire({
          icon: 'success',
          title: '¡Éxito!',
          text: 'La asignatura se ha eliminado correctamente',
          confirmButtonText: 'Aceptar',
        });
      } else {
        Swal.fire('Error', 'Hubo un problema al eliminar la asignatura', 'error');
      }
    } catch (error) {
      Swal.fire('Error', 'Hubo un problema al eliminar la asignatura', 'error');
    }
  };

  const openUpdateModal = (asignatura) => {
    setAsignaturaToUpdate(asignatura); // Cargar los datos del ciclo a actualizar
    setModalUpdateVisible(true); // Abrir el modal de actualización
    setHasUnsavedChanges(false); // Resetear el estado al abrir el modal
  };

  const openDeleteModal = (asignatura) => {
    setAsignaturaToDelete(asignatura); // Guardar el ciclo que se desea eliminar
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
      });
      value = value.replace(/\s+/g, ' '); // Reemplazar múltiples espacios por uno solo
    }

    // Validar caracteres permitidos
    if (!regex.test(value)) {
      Swal.fire({
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
          Swal.fire({
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

  // Filtro de búsqueda
  const filteredAsignaturas = Asignaturas.filter((asignatura) =>
    asignatura.Nombre_asignatura.toLowerCase().includes(searchTerm.toLowerCase())
  );

 // Lógica de paginación
 const indexOfLastRecord = currentPage * recordsPerPage;
 const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
 const currentRecords = filteredAsignaturas.slice(indexOfFirstRecord, indexOfLastRecord);

 // Cambiar página
const paginate = (pageNumber) => {
  if (pageNumber > 0 && pageNumber <= Math.ceil(filteredAsignaturas.length / recordsPerPage)) {
    setCurrentPage(pageNumber);
  }
}

    // Verificar permisos
    if (!canSelect) {
      return <AccessDenied />;
    }

    const generarReportePDF = () => {
      // Validar que haya datos en la tabla
      if (!Asignaturas || Asignaturas.length === 0) {
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
        doc.text('Reporte de Asignaturas', doc.internal.pageSize.width / 2, yPosition, { align: 'center' });
    
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
          head: [['#', 'Nombre', 'Descripción']],
          body: Asignaturas.map((asignatura, index) => [
            index + 1,
            `${asignatura.Nombre_asignatura|| ''}`.trim(),
            asignatura.Descripcion_asignatura
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
            1: { cellWidth: 'auto' }, // Columna 'Descripción' se ajusta automáticamente
            2: { cellWidth: 'auto' }, // Columna 'Descripción' se ajusta automáticamente
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
      if (!Asignaturas || Asignaturas.length === 0) {
        Swal.fire({
          icon: 'info',
          title: 'Tabla vacía',
          text: 'No hay datos disponibles para generar el reporte excel.',
          confirmButtonText: 'Aceptar',
        });
        return; // Salir de la función si no hay datos
      }
      const encabezados = [
        ["Saint Patrick Academy"],
        ["Reporte de Asignaturas"],
        [], // Espacio en blanco
        ["#","Nombre","Descripción"]
      ];
    
      // Crear filas con asistencias filtradas
      const filas = Asignaturas.map((asignatura, index) => [
        index + 1,
        asignatura.Nombre_asignatura,
        asignatura.Descripcion_asignatura
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
        { wpx: 50 }, 
        { wpx: 100 },
        { wpx: 300 }
      ];
    
      hojaDeTrabajo['!cols'] = ajusteColumnas;
    
      // Crear el libro de trabajo
      const libroDeTrabajo = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(libroDeTrabajo, hojaDeTrabajo, "Reporte de Asignaturas");
      // Guardar el archivo Excel con un nombre fijo
      const nombreArchivo = `Reporte_Asignaturas.xlsx`;

      XLSX.writeFile(libroDeTrabajo, nombreArchivo);
    };
 return (
  <CContainer>
    
    {/* Contenedor del h1 y botón "Nuevo" */}
    <CRow className="align-items-center mb-5">
      <CCol xs="12" md="9">
        {/* Título de la página */}
        <h1 className="mb-0">Mantenimiento Asignatura</h1>
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
            placeholder="Buscar asignatura..."
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


    {/* Tabla para mostrar ciclos */}
    {/* Contenedor de tabla con scroll */}
    <div className="table-container" style={{ maxHeight: '400px', overflowY: 'scroll', marginBottom: '20px' }}>
        <CTable striped bordered hover>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell>#</CTableHeaderCell>
              <CTableHeaderCell>Nombre del Asignatura</CTableHeaderCell>
              <CTableHeaderCell>Descripcion Asignatura</CTableHeaderCell>
              <CTableHeaderCell>Acciones</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {currentRecords.map((asignatura) => (
              <CTableRow key={asignatura.Cod_asignatura}>
                <CTableDataCell>
                  {/* Mostrar el índice original en lugar del índice basado en la paginación */}
                  {asignatura.originalIndex} 
                </CTableDataCell>
                <CTableDataCell>{asignatura.Nombre_asignatura}</CTableDataCell>
                <CTableDataCell>{asignatura.Descripcion_asignatura}</CTableDataCell>
                <CTableDataCell style={{ display: 'flex', gap: '10px' }}>

                  {canUpdate && (
                  <CButton style={{ backgroundColor: '#F9B64E' }} onClick={() => openUpdateModal(asignatura)}>
                    <CIcon icon={cilPen} />
                  </CButton>
                  )}
                  {canDelete && (
                  <CButton style={{ backgroundColor: '#E57368' }} onClick={() => openDeleteModal(asignatura)}>
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
          disabled={currentPage === 1} // Deshabilitar si estás en la primera página
          onClick={() => paginate(currentPage - 1)}>
          Anterior
        </CButton>
        <CButton
          style={{ marginLeft: '10px',backgroundColor: '#6f8173', color: '#D9EAD3' }}
          disabled={currentPage === Math.ceil(filteredAsignaturas.length / recordsPerPage)} // Deshabilitar si estás en la última página
          onClick={() => paginate(currentPage + 1)}>
          Siguiente
       </CButton>
     </CPagination>
      {/* Mostrar total de páginas */}
      <span style={{ marginLeft: '10px' }}>
        Página {currentPage} de {Math.ceil(filteredAsignaturas.length / recordsPerPage)}
      </span>
   </div>


    {/* Modal Crear Asignatura*/}
    <CModal visible={modalVisible} backdrop="static">
      <CModalHeader closeButton={false}>
        <CModalTitle>Nueva Asignatura</CModalTitle>
        <CButton className="btn-close" aria-label="Close" onClick={() => handleCloseModal(setModalVisible, resetAsignatura)} />
        </CModalHeader>
        <CModalBody>
        <CForm>
            <CInputGroup className="mb-3">
            <CInputGroupText>Nombre de la Asignatura</CInputGroupText>
            <CFormInput
              type="text"
              value={nueva_Asignatura.Nombre_asignatura}
              maxLength={20}
              onPaste={disableCopyPaste}
              onCopy={disableCopyPaste}
              onChange={(e) => handleInputChange(e, (value) => setNueva_Asignatura({
                ...nueva_Asignatura,
                Nombre_asignatura: value }),inputRefNombre
              )}
              ref={inputRefNombre}
            />
          </CInputGroup>
          <CInputGroup className="mb-3">
            <CInputGroupText>Descripcion de la Asignatura</CInputGroupText>
            <CFormInput
              type="text"
              value={nueva_Asignatura.Descripcion_asignatura}
              maxLength={20}
              onPaste={disableCopyPaste}
              onCopy={disableCopyPaste}
              onChange={(e) => handleInputChange(e, (value) => setNueva_Asignatura({
                ...nueva_Asignatura,
                Descripcion_asignatura: value}),inputRefDescripcion)}
              ref={inputRefDescripcion}
            />
          </CInputGroup>
        </CForm>

        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => handleCloseModal(setModalVisible, resetAsignatura)}>
            Cancelar
          </CButton>
          <CButton style={{ backgroundColor: '#4B6251',color: 'white' }} onClick={handleCreateAsignatura}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#3C4B43")}onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#4B6251")}>
          <CIcon icon={cilSave} style={{ marginRight: '5px' }} />Guardar
          </CButton>
        </CModalFooter>
      </CModal>

    {/* Modal Actualizar Asignatura */}
    <CModal visible={modalUpdateVisible}  backdrop="static">
      <CModalHeader closeButton={false}>
      <CModalTitle>Actualizar Asignatura</CModalTitle>
      <CButton className="btn-close" aria-label="Close" onClick={() => handleCloseModal(setModalUpdateVisible, resetAsignaturatoUpdate)} />
      </CModalHeader>
      <CModalBody>
        <CForm>
          <CInputGroup className="mb-3">
            <CInputGroupText>Nombre de la Asignatura</CInputGroupText>
            <CFormInput
              type="text"
              maxLength={20}
              onPaste={disableCopyPaste}
              onCopy={disableCopyPaste}
              placeholder="Ingrese la nueva asignatura"
              value={asignaturaToUpdate.Nombre_asignatura}
              onChange={(e) => handleInputChange(e, (value) =>
                setAsignaturaToUpdate({ ...asignaturaToUpdate, Nombre_asignatura: value })
              )}
              ref={inputRefNombre}
              />
          </CInputGroup>

          <CInputGroup className="mb-3">
            <CInputGroupText>Descripcion de la Asignatura</CInputGroupText>
            <CFormInput 
              type="text"
              maxLength={20}
              onPaste={disableCopyPaste}
              onCopy={disableCopyPaste}
              placeholder="Ingrese una descripcion nueva"
              value={asignaturaToUpdate.Descripcion_asignatura}
              onChange={(e) => handleInputChange(e, (value) =>
                setAsignaturaToUpdate({ ...asignaturaToUpdate, Descripcion_asignatura: value })
              )}
              ref={inputRefDescripcion} // Asignar la referencia al input
            />
          </CInputGroup>
        </CForm>
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={() => handleCloseModal(setModalUpdateVisible, resetAsignaturatoUpdate)}>
          Cancelar
        </CButton>
        <CButton  style={{  backgroundColor: '#F9B64E',color: 'white' }}   onClick={handleUpdateAsignatura}>
        <CIcon icon={cilPen} style={{ marginRight: '5px' }} />Actualizar 
        </CButton>
      </CModalFooter>
    </CModal>

    {/* Modal Eliminar Asignatura */}
    <CModal visible={modalDeleteVisible} onClose={() => setModalDeleteVisible(false)} backdrop="static">
      <CModalHeader>
      <CModalTitle>Confirmar Eliminación</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <p>¿Estás seguro de que deseas eliminar la asignatura: <strong>{AsignaturaToDelete.Nombre_asignatura}</strong>?</p>
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={() => setModalDeleteVisible(false)}>
          Cancelar
        </CButton>
        <CButton style={{  backgroundColor: '#E57368',color: 'white' }}  onClick={handleDeleteAsignatura}>
        <CIcon icon={cilTrash} style={{ marginRight: '5px' }} />  Eliminar
        </CButton>
      </CModalFooter>
    </CModal>
 </CContainer>
  );
};
export default ListaAsignaturas;
