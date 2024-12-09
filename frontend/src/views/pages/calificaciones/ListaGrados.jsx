import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { CIcon } from '@coreui/icons-react';
import { cilSearch, cilBrushAlt, cilPen, cilTrash, cilPlus, cilSave, cilSpreadsheet, cilDescription, } from '@coreui/icons'; // Importar iconos específicos
import Swal from 'sweetalert2';
import logo from 'src/assets/brand/logo_saint_patrick.png'
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

//necesarios abajo
import axios from 'axios';
import * as jwt_decode from 'jwt-decode';



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
  CPagination,
  CContainer,
  CForm
} from '@coreui/react';
import usePermission from '../../../../context/usePermission';
import AccessDenied from "../AccessDenied/AccessDenied"


const ListaGrados = () => {
  const { canSelect, loading, error } = usePermission('ListaGrados');

  const [grados, setGrados] = useState([]);
  const [ciclos, setCiclos] = useState([]); // Estado para almacenar los ciclos
  const [modalVisible, setModalVisible] = useState(false); // Estado para el modal de crear grado
  const [modalUpdateVisible, setModalUpdateVisible] = useState(false); // Estado para el modal de actualizar grado
  const [modalDeleteVisible, setModalDeleteVisible] = useState(false); // Estado para el modal de eliminar grado
  const [nuevoGrado, setNuevoGrado] = useState(''); // Estado para el nuevo grado
  const [nuevoprefijo, setnuevoprefijo] = useState(''); // Estado para el nuevo grado
  const [nuevoCiclo, setNuevoCiclo] = useState('');
  const [gradoToUpdate, setGradoToUpdate] = useState({}); // Estado para el grado a actualizar
  const [gradoToDelete, setGradoToDelete] = useState({}); // Estado para el grado a eliminar
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1); // Estado para la página actual
  const [recordsPerPage, setRecordsPerPage] = useState(5); // Hacer dinámico el número de registros por página
  const inputRef = useRef(null); // Referencia para el input
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false); // Estado para detectar cambios sin guardar
  const resetNuevoGrado = () => setNuevoGrado('');
  const resetGradotoUpdate = () => setGradoToUpdate('');


  useEffect(() => {
    fetchGrados();
    fetchCiclos(); // Llama a la función para obtener ciclos
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
  });

  const fetchCiclos = async () => { // Asegúrate de que esta función esté definida
    try {
      const response = await fetch('http://localhost:4000/api/ciclos/verCiclos');
      const data = await response.json();
      setCiclos(data);
    } catch (error) {
      console.error('Error al obtener los ciclos:', error);
    }

  };

  const getCicloName = (codCiclo) => {
    if (!ciclos.length) return 'Ciclos no disponibles'; // Mensaje alternativo si no hay ciclos
    const ciclo = ciclos.find((c) => c.Cod_ciclo === codCiclo);
    return ciclo ? ciclo.Nombre_ciclo : 'Ciclo no encontrado';
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

  const validarCiclo = () => {
    if (!nuevoCiclo || nuevoCiclo === "") {
      Swal.fire('Error', 'Debe seleccionar un ciclo de la lista', 'error');
      return false;
    }
    return true;
  };


  const validarGrado = () => {
    const nombreGrado = typeof nuevoGrado === 'string' ? nuevoGrado : nuevoGrado.Nombre_grado;
    if (!nombreGrado || nombreGrado.trim() === '') {
      Swal.fire('Error', 'El campo "Nombre Grado" no puede estar vacío', 'error');
      return false;
    }
    const nombrePrefijo = typeof nuevoprefijo === 'string' ? nuevoprefijo : nuevoprefijo.Prefijo;
    if (!nombrePrefijo || nombrePrefijo.trim() === '') {
      Swal.fire('Error', 'El campo "Prefijo" no puede estar vacío', 'error');
      return false;
    }

    // Verificar si el nombre del ciclo ya existe
    const Gradoexistente = grados.some(
      (grado) => grado.Nombre_grado.toLowerCase() === nombreGrado.toLowerCase()
    );

    if (Gradoexistente) {
      Swal.fire('Error', `El grado "${nombreGrado}" ya existe`, 'error');
      return false;
    }

    // Verificar si el nombre del ciclo ya existe
    const Prefijoexistente = grados.some(
      (grado) => grado.Prefijo.toLowerCase() === nombrePrefijo.toLowerCase()
    );

    if (Prefijoexistente) {
      Swal.fire('Error', `El Prefijo "${nombrePrefijo}" ya existe`, 'error');
      return false;
    }

    return true;

  };


  const validarGradoUpdate = () => {
    if (!gradoToUpdate.Nombre_grado) {
      Swal.fire('Error', 'El campo "Nombre Grado" no puede estar vacío', 'error');
      return false;
    }
    if (!gradoToUpdate.Prefijo) {
      Swal.fire('Error', 'El campo "Prefijo" no puede estar vacío', 'error');
      return false;
    }
    // Verificar si el nombre del ciclo ya existe (excluyendo el ciclo actual que se está editando)
    const Gradoexistente = grados.some(
      (grado) =>
        grado.Nombre_grado.toLowerCase() === gradoToUpdate.Nombre_grado.toLowerCase() &&
        grado.Cod_grado !== gradoToUpdate.Cod_grado
    );

    if (Gradoexistente) {
      Swal.fire('Error', `El grado "${gradoToUpdate.Nombre_grado}" ya existe`, 'error');
      return false;
    }
    // Verificar si el nombre del ciclo ya existe (excluyendo el ciclo actual que se está editando)
    const PrefijoExistente = grados.some(
      (grado) =>
        grado.Prefijo.toLowerCase() === gradoToUpdate.Prefijo.toLowerCase() &&
        grado.Cod_grado !== gradoToUpdate.Cod_grado
    );

    if (PrefijoExistente) {
      Swal.fire('Error', `El Prefijo "${gradoToUpdate.Prefijo}" ya existe`, 'error');
      return false;
    }



    return true;
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

  const handleCreateGrado = async () => {
    if (!validarCiclo() || !validarGrado()) return;  // Verificar si el ciclo y grado son válidos antes de continuar
  
    try {
      // 1. Verificar si obtenemos el token correctamente
      const token = localStorage.getItem('token');
      console.log('Token obtenido:', token);  // Depuración
      if (!token) {
        Swal.fire('Error', 'No tienes permiso para realizar esta acción', 'error');
        return;
      }
  
      // 3. Realizar la solicitud para crear el grado
      const response = await axios.post(
        'http://localhost:4000/api/grados/crearGrado',
        {
          Cod_ciclo: nuevoCiclo,
          Nombre_grado: nuevoGrado,
          Prefijo: nuevoprefijo,
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,  // Pasar el token en los encabezados
          },
        }
      );
  
      console.log('Respuesta de crear grado:', response);  // Depuración
  
      // Verificar que la respuesta sea exitosa
      if (response.status >= 200 && response.status < 300) {
        // 4. Decodificar el token para obtener el código de usuario
        const decodedToken = jwt_decode.jwtDecode(token);
        console.log('Token decodificado:', decodedToken);  // Depuración
  
        // Verificar si el código de usuario está presente en el token
        if (!decodedToken.cod_usuario) {
          console.error('No se pudo obtener el código de usuario del token');
          throw new Error('No se pudo obtener el código de usuario del token');
        }
  
        // 5. Registrar la acción en la bitácora
        const descripcion = `El usuario: ${decodedToken.nombre_usuario} ha creado un nuevo grado`;
  
        const bitacoraResponse = await axios.post('http://localhost:4000/api/bitacora/registro', 
          {
            cod_usuario: decodedToken.cod_usuario,
            cod_objeto: 55,  // Código de objeto para la acción de crear grado
            accion: 'INSERT',
            descripcion: descripcion,
          },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );
  
        console.log('Respuesta de registro en bitácora:', bitacoraResponse);  // Verifica la respuesta
  
        if (bitacoraResponse.status >= 200 && bitacoraResponse.status < 300) {
          console.log('Registro en bitácora exitoso');
          Swal.fire('¡Éxito!', 'El grado se ha creado correctamente', 'success');
  
          // 6. Realizar las acciones posteriores después de la creación exitosa
          fetchGrados();  // Refrescar la lista de grados
          setModalVisible(false);  // Cerrar el modal
          setNuevoCiclo('');  // Restablecer estado de ciclo
          resetNuevoGrado();  // Restablecer estado del grado
          setHasUnsavedChanges(false);  // Restablecer el estado de cambios no guardados
  
        } else {
          Swal.fire('Error', 'No se pudo registrar la acción en la bitácora', 'error');
        }
  
      } else {
        Swal.fire('Error', 'No se pudo crear el grado', 'error');
      }
  
    } catch (error) {
      console.error('Error al crear el grado:', error);
      Swal.fire('Error', `Hubo un problema al crear el grado: ${error.message}`, 'error');
    }
  };
  
  const handleUpdateGrado = async () => {
    if (!gradoToUpdate.Cod_ciclo) {
      Swal.fire('Error', 'Debe seleccionar un ciclo de la lista', 'error');
      return false;
    }
    if (!validarGradoUpdate()) return;  // Verificar si el grado a actualizar es válido
  
    try {
      // 1. Verificar si obtenemos el token correctamente
      const token = localStorage.getItem('token');
      console.log('Token obtenido:', token);  // Depuración
      if (!token) {
        Swal.fire('Error', 'No tienes permiso para realizar esta acción', 'error');
        return;
      }
  
      // 2. Realizar la solicitud para actualizar el grado
      const response = await axios.put(
        'http://localhost:4000/api/grados/actualizarGrado',
        {
          Cod_grado: gradoToUpdate.Cod_grado,
          Cod_ciclo: gradoToUpdate.Cod_ciclo,
          Nombre_grado: gradoToUpdate.Nombre_grado,
          Prefijo: gradoToUpdate.Prefijo,
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,  // Pasar el token en los encabezados
          },
        }
      );
  
      console.log('Respuesta de actualizar grado:', response);  // Depuración
  
      // Verificar que la respuesta sea exitosa
      if (response.status >= 200 && response.status < 300) {
        // 3. Decodificar el token para obtener el código de usuario
        const decodedToken = jwt_decode.jwtDecode(token);  // Decodificar el token
        console.log('Token decodificado:', decodedToken);  // Depuración
  
        // Verificar si el código de usuario está presente en el token
        if (!decodedToken.cod_usuario) {
          console.error('No se pudo obtener el código de usuario del token');
          throw new Error('No se pudo obtener el código de usuario del token');
        }
  
        // 4. Registrar la acción en la bitácora
        const descripcion = `El usuario: ${decodedToken.nombre_usuario} ha actualizado el grado a: ${gradoToUpdate.Nombre_grado}`;
  
        const bitacoraResponse = await axios.post('http://localhost:4000/api/bitacora/registro',
          {
            cod_usuario: decodedToken.cod_usuario,
            cod_objeto: 55,  // Código de objeto para la acción de actualizar grado
            accion: 'UPDATE',
            descripcion: descripcion,
          },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );
  
        console.log('Respuesta de registro en bitácora:', bitacoraResponse);  // Verifica la respuesta
  
        if (bitacoraResponse.status >= 200 && bitacoraResponse.status < 300) {
          console.log('Registro en bitácora exitoso');
          Swal.fire('¡Éxito!', 'El grado se ha actualizado correctamente', 'success');
  
          // 5. Realizar las acciones posteriores después de la actualización exitosa
          fetchGrados();  // Refrescar la lista de grados
          setModalUpdateVisible(false);  // Cerrar el modal de actualización
          resetGradotoUpdate();  // Resetear el ciclo a actualizar
          setHasUnsavedChanges(false);  // Restablecer el estado de cambios no guardados
  
        } else {
          Swal.fire('Error', 'No se pudo registrar la acción en la bitácora', 'error');
        }
  
      } else {
        Swal.fire('Error', 'No se pudo actualizar el grado', 'error');
      }
  
    } catch (error) {
      console.error('Error al actualizar el grado:', error);
      Swal.fire('Error', `Hubo un problema al actualizar el grado: ${error.message}`, 'error');
    }
  };
  


  const handleDeleteGrado = async () => {
    try {
      // 1. Verificar si obtenemos el token correctamente
      const token = localStorage.getItem('token');
      console.log('Token obtenido:', token);  // Depuración
      if (!token) {
        Swal.fire('Error', 'No tienes permiso para realizar esta acción', 'error');
        return;
      }
  
      // 2. Decodificar el token para obtener el código de usuario
      const decodedToken = jwt_decode.jwtDecode(token);
      console.log('Token decodificado:', decodedToken);  // Depuración
  
      // Verificar si el código de usuario está presente en el token
      if (!decodedToken.cod_usuario) {
        console.error('No se pudo obtener el código de usuario del token');
        throw new Error('No se pudo obtener el código de usuario del token');
      }
  
      // 3. Realizar la solicitud para eliminar el grado
      const response = await axios.delete(
        'http://localhost:4000/api/grados/eliminarGrado',
        {
          data: { Cod_grado: gradoToDelete.Cod_grado }, // Enviar Cod_grado en el cuerpo
          headers: {
            'Authorization': `Bearer ${token}`,  // Pasar el token en los encabezados
          },
        }
      );
  
      console.log('Respuesta de eliminar grado:', response);  // Depuración
  
      // Verificar que la respuesta sea exitosa
      if (response.status >= 200 && response.status < 300) {
        // 4. Registrar la acción en la bitácora
        const descripcion = `El usuario: ${decodedToken.nombre_usuario} ha eliminado el grado: ${gradoToDelete.Nombre_grado}`;
  
        const bitacoraResponse = await axios.post(
          'http://localhost:4000/api/bitacora/registro',
          {
            cod_usuario: decodedToken.cod_usuario,
            cod_objeto: 55,  // Código de objeto para la acción de eliminar grado
            accion: 'DELETE',
            descripcion: descripcion,
          },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );
  
        console.log('Respuesta de registro en bitácora:', bitacoraResponse);  // Verifica la respuesta
  
        if (bitacoraResponse.status >= 200 && bitacoraResponse.status < 300) {
          console.log('Registro en bitácora exitoso');
          Swal.fire('¡Éxito!', 'El grado se ha eliminado correctamente', 'success');
  
          // 5. Realizar las acciones posteriores después de la eliminación exitosa
          fetchGrados();  // Refrescar la lista de grados
          setModalDeleteVisible(false);  // Cerrar el modal de confirmación
          setGradoToDelete({});  // Resetear el grado a eliminar
  
        } else {
          Swal.fire('Error', 'No se pudo registrar la acción en la bitácora', 'error');
        }
  
      } else {
        Swal.fire('Error', 'No se pudo eliminar el grado', 'error');
      }
  
    } catch (error) {
      console.error('Error al eliminar el grado:', error);
      Swal.fire('Error', `Hubo un problema al eliminar el grado: ${error.message}`, 'error');
    }
  };
  
  const handleReporteGradosPdfClick = () => {
    // Validar que haya datos en la tabla
    if (!currentRecords || currentRecords.length === 0) {
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
        doc.text('Reporte de Grados', doc.internal.pageSize.width / 2, yPosition, { align: 'center' });
        yPosition += 10;

        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0); // Negro para el texto informativo
        const currentDate = new Date().toLocaleDateString();
        doc.text(`Fecha de generación: ${currentDate}`, doc.internal.pageSize.width / 2, yPosition, { align: 'center' });
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
            head: [['#', 'Nombre del Grado', 'Nombre del Ciclo', 'Prefijo']],
            body: currentRecords.map((grado, index) => [
                grado.originalIndex || index + 1, // Índice original o basado en el índice actual
                grado.Nombre_grado, // Nombre del grado
                getCicloName(grado.Cod_ciclo), // Nombre del ciclo asociado
                grado.Prefijo, // Prefijo
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


  const openUpdateModal = (grado) => {
    setGradoToUpdate(grado); // Cargar los datos del grado a actualizar
    setModalUpdateVisible(true); // Abrir el modal de actualización
    setHasUnsavedChanges(false);

  };

  const openDeleteModal = (grado) => {
    setGradoToDelete(grado); // Guardar el grado que se desea eliminar
    setModalDeleteVisible(true); // Abrir el modal de confirmación

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

  // Verificar permisos
  if (!canSelect) {
    return <AccessDenied />;
  }

  return (
    <CContainer>
      {/* Contenedor del h1 y botón "Nuevo" */}
      <CRow className="align-items-center mb-5">
        <CCol xs="8" md="9">
          {/* Título de la página */}
          <h1 className="mb-0">Mantenimiento Grados</h1>
        </CCol>
        <CCol xs="4" md="3" className="text-end d-flex flex-column flex-md-row justify-content-md-end align-items-md-center">
          {/* Botón Nuevo para abrir el modal */}
          <CButton
            style={{ backgroundColor: '#4B6251', color: 'white' }}
            className="mb-3 mb-md-0 me-md-3" // Margen inferior en pantallas pequeñas, margen derecho en pantallas grandes
            onClick={() => {
              setModalVisible(true);
              setHasUnsavedChanges(false); // Resetear el estado al abrir el modal
            }}
          >
            <CIcon icon={cilPlus} /> Nuevo
          </CButton>

          {/* Botón de Reporte */}
          <CButton
            style={{ backgroundColor: '#6C8E58', color: 'white' }}
            onClick={() => {
              handleReporteGradosPdfClick();
            }}
          >
            <CIcon icon={cilDescription} /> Reporte
          </CButton>
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
                <option value="20">20</option>
              </CFormSelect>
              <span>&nbsp;registros</span>
            </div>
          </CInputGroup>
        </CCol>
      </CRow>

      {/* Tabla para mostrar los grados */}
      <div className="table-container" style={{ maxHeight: '400px', overflowY: 'scroll', marginBottom: '20px' }}>
        <CTable striped bordered hover>
          <CTableHead style={{ position: 'sticky', top: 0, zIndex: 1, backgroundColor: '#fff' }}>
            <CTableRow>
              <CTableHeaderCell style={{ width: '50px' }}>#</CTableHeaderCell>
              <CTableHeaderCell style={{ width: '50px' }}>Nombre Grado</CTableHeaderCell>
              <CTableHeaderCell style={{ width: '50px' }}>Nombre Ciclo</CTableHeaderCell>
              <CTableHeaderCell style={{ width: '50px' }}>Prefijo</CTableHeaderCell>
              <CTableHeaderCell style={{ width: '50px' }}>Acciones</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {currentRecords.map((grado, index) => (
              <CTableRow key={grado.Cod_grado}>
                <CTableDataCell>{grado.originalIndex}</CTableDataCell>
                <CTableDataCell>{grado.Nombre_grado}</CTableDataCell>
                <CTableDataCell>{getCicloName(grado.Cod_ciclo)}</CTableDataCell>
                <CTableDataCell>{grado.Prefijo}</CTableDataCell>
                <CTableDataCell>
                  <CButton style={{ backgroundColor: '#F9B64E', marginRight: '10px' }} onClick={() => openUpdateModal(grado)}>
                    <CIcon icon={cilPen} />
                  </CButton>
                  <CButton style={{ backgroundColor: '#E57368', marginRight: '10px' }} onClick={() => openDeleteModal(grado)}>
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


      {/* Modal Crear grado */}
      <CModal visible={modalVisible} backdrop="static">
        <CModalHeader closeButton={false}>
          <CModalTitle>Crear Nuevo Grado</CModalTitle>
          <CButton className="btn-close" aria-label="Close" onClick={() => handleCloseModal(setModalVisible, resetNuevoGrado)} />
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CInputGroup className="mb-3">
              <CInputGroupText>Nombre Ciclo</CInputGroupText>
              <CFormSelect
                aria-label="Seleccionar ciclo"
                value={nuevoCiclo}
                onChange={(e) => setNuevoCiclo(e.target.value)}
                style={{ maxHeight: '200px', overflowY: 'auto' }} // Limita la altura y permite el scroll
              >
                <option value="">Seleccione un ciclo</option> {/* Opción predeterminada */}
                {ciclos.map((ciclo) => (
                  <option key={ciclo.Cod_ciclo} value={ciclo.Cod_ciclo}>
                    {ciclo.Nombre_ciclo}
                  </option>
                ))}
              </CFormSelect>
            </CInputGroup>
            <CInputGroup className="mb-3">
              <CInputGroupText>Nombre Grado</CInputGroupText>
              <CFormInput
                ref={inputRef}
                type="text"
                placeholder="Ingrese el nombre del grado"
                maxLength={20}
                onPaste={disableCopyPaste}
                onCopy={disableCopyPaste}
                value={nuevoGrado}
                onChange={(e) => handleInputChange(e, setNuevoGrado)}
              />
            </CInputGroup>
            <CInputGroup className="mb-3">
              <CInputGroupText>Prefijo</CInputGroupText>
              <CFormInput
                ref={inputRef}
                type="text"
                placeholder="Ingrese Prefijo"
                maxLength={10}
                onPaste={disableCopyPaste}
                onCopy={disableCopyPaste}
                value={nuevoprefijo}
                onChange={(e) => handleInputChange(e, setnuevoprefijo)}
              />
            </CInputGroup>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => handleCloseModal(setModalVisible, resetNuevoGrado)}>
            Cancelar
          </CButton>
          <CButton style={{ backgroundColor: '#4B6251', color: 'white' }} onClick={handleCreateGrado}>
            <CIcon icon={cilSave} style={{ marginRight: '5px' }} /> Guardar
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Modal Actualizar Grado */}
      <CModal visible={modalUpdateVisible} backdrop="static">
        <CModalHeader closeButton={false}>
          <CModalTitle>Actualizar Grado</CModalTitle>
          <CButton className="btn-close" aria-label="Close" onClick={() => handleCloseModal(setModalUpdateVisible, resetGradotoUpdate)} />
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CInputGroup className="mb-3">
              <CInputGroupText>Nombre Ciclo</CInputGroupText>
              <CFormSelect
                aria-label="Seleccionar ciclo"
                value={gradoToUpdate.Cod_ciclo} // Usa el código ciclo del grado a actualizar
                onChange={(e) => setGradoToUpdate({ ...gradoToUpdate, Cod_ciclo: e.target.value })} // Actualiza el estado
              >
                <option value="">Seleccione un ciclo</option> {/* Opción predeterminada */}
                {ciclos.map((ciclo) => (
                  <option key={ciclo.Cod_ciclo} value={ciclo.Cod_ciclo}>
                    {ciclo.Nombre_ciclo}
                  </option>
                ))}
              </CFormSelect>
            </CInputGroup>
            <CInputGroup className="mb-3">
              <CInputGroupText>Nombre Grado</CInputGroupText>
              <CFormInput
                ref={inputRef} // Asignar la referencia al input
                maxLength={20}
                onPaste={disableCopyPaste}
                onCopy={disableCopyPaste}
                placeholder="Ingrese el nuevo nombre del grado"
                value={gradoToUpdate.Nombre_grado}
                onChange={(e) => handleInputChange(e, (value) => setGradoToUpdate({
                  ...gradoToUpdate,
                  Nombre_grado: value,
                }))}
              />
            </CInputGroup>
            <CInputGroup className="mb-3">
              <CInputGroupText>Prefijo</CInputGroupText>
              <CFormInput
                ref={inputRef} // Asignar la referencia al input
                maxLength={10}
                onPaste={disableCopyPaste}
                onCopy={disableCopyPaste}
                placeholder="Ingrese el nuevo "
                value={gradoToUpdate.Prefijo}
                onChange={(e) => handleInputChange(e, (value) => setGradoToUpdate({
                  ...gradoToUpdate,
                  Prefijo: value,
                }))}
              />
            </CInputGroup>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => handleCloseModal(setModalUpdateVisible, resetGradotoUpdate)}>
            Cancelar
          </CButton>
          <CButton style={{ backgroundColor: '#F9B64E', color: 'white' }} onClick={handleUpdateGrado}>
            <CIcon icon={cilPen} style={{ marginRight: '5px' }} /> Actualizar
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Modal Eliminar Grado */}
      <CModal visible={modalDeleteVisible} onClose={() => setModalDeleteVisible(false)} backdrop="static">
        <CModalHeader>
          <CModalTitle>Confirmar Eliminación</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <p>¿Estás seguro de que deseas eliminar el grado: <strong>{gradoToDelete.Nombre_grado}</strong>?</p>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setModalDeleteVisible(false)}>
            Cancelar
          </CButton>
          <CButton style={{ backgroundColor: '#E57368', color: 'white' }} onClick={handleDeleteGrado}>
            <CIcon icon={cilTrash} style={{ marginRight: '5px' }} /> Eliminar
          </CButton>
        </CModalFooter>
      </CModal>
    </CContainer>
  );
};

export default ListaGrados;