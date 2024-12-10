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
   CForm,
   CContainer,
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


const ListaPonderaciones = () => {
  const { canSelect, loading, error, canDelete, canInsert, canUpdate } = usePermission('ListaPonderaciones');

  const [Ponderaciones, setPonderaciones] = useState([]);
  const [modalVisible, setModalVisible] = useState(false); // Estado para el modal de crear ponderaciones
  const [modalUpdateVisible, setModalUpdateVisible] = useState(false); // Estado para el modal de actualizar ponderaciones
  const [modalDeleteVisible, setModalDeleteVisible] = useState(false); // Estado para el modal de eliminar ponderaciones
  const [nuevaPonderacion, setNuevaPonderacion] = useState(''); // Estado para la nueva ponderacion
  const [ponderacionToUpdate, setPonderacionToUpdate] = useState({}); // Estado para la ponderacion a actualizar
  const [ponderacionToDelete, setPonderacionToDelete] = useState({}); // Estado para la ponderacion a eliminar
  const [recordsPerPage, setRecordsPerPage] = useState(5); // Hacer dinámico el número de registros por página
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1); // Estado para la página actual
  const inputRef = useRef(null); // Referencia para el input
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false); // Estado para detectar cambios sin guardar

  useEffect(() => {
    fetchPonderacion();
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

  const fetchPonderacion = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/ponderaciones/verPonderaciones');
      const data = await response.json();
      // Asignar un índice original basado en el orden en la base de datos
      const dataWithIndex = data.map((ponderacion, index) => ({
        ...ponderacion,
        originalIndex: index + 1, // Guardamos la secuencia original
      }));

      setPonderaciones(dataWithIndex);
    } catch (error) {
      console.error('Error al obtener las Ponderaciones:', error);
    }
  };

  const validarPonderacion = () => {
    const nombrePonderacion = typeof nuevaPonderacion === 'string' ? nuevaPonderacion : nuevaPonderacion.Descripcion_ponderacion;
  
    // Comprobación de vacío
    if (!nombrePonderacion || nombrePonderacion.trim() === '') {
      Swal.fire('Error', 'El campo "Descripción de la Ponderación" no puede estar vacío', 'error');
      return false;
    }
  
    // Verificar si el nombre del ciclo ya existe
    const ponderacionExistente = Ponderaciones.some(
      (ponderacion) => ponderacion.Descripcion_ponderacion.toLowerCase() === nombrePonderacion.toLowerCase()
    );
  
    if (ponderacionExistente) {
      Swal.fire('Error', `La ponderación "${nombrePonderacion}" ya existe`, 'error');
      return false;
    }
  
    return true;
  };


  const validarPonderacionUpdate = () => {
    if (!ponderacionToUpdate.Descripcion_ponderacion) {
      Swal.fire('Error',  'El campo "Descripción de la Ponderación" no puede estar vacío', 'error');
      return false;
    }
    // Verificar si el nombre del ciclo ya existe (excluyendo el ciclo actual que se está editando)
    const ponderacionExistente = Ponderaciones.some(
      (ponderacion) =>
        ponderacion.Descripcion_ponderacion.toLowerCase() === ponderacionToUpdate.Descripcion_ponderacion.toLowerCase() &&
        ponderacion.Cod_ponderacion !== ponderacionToUpdate.Cod_ponderacion
    );

    if (ponderacionExistente) {
      Swal.fire('Error', `La ponderación "${ponderacionToUpdate.Descripcion_ponderacion}" ya existe`, 'error');
      return false;
    }

    return true;
  };

  const handleReportePdfClick = () => {
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
        doc.text('SAINT PATRICK\'S ACADEMY', doc.internal.pageSize.width / 2, yPosition, { align: 'center' });

        yPosition += 12;

        // Subtítulo
        doc.setFontSize(16);
        doc.text('Reporte de Ponderaciones', doc.internal.pageSize.width / 2, yPosition, { align: 'center' });
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
            head: [['#', 'Descripción de Ponderación']],
            body: currentRecords.map((ponderacion, index) => [
                ponderacion.originalIndex || index + 1, // Índice original o basado en el índice actual
                ponderacion.Descripcion_ponderacion, // Descripción de la ponderación
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

  const resetNuevaPonderacion = () => setNuevaPonderacion('');
  const resetPonderaciontoUpdate= () => setPonderacionToUpdate('');



  const handleCreatePonderacion = async () => {
    if (!validarPonderacion()) return;
  
    try {
      // 1. Verificar si obtenemos el token correctamente
      const token = localStorage.getItem('token');
      console.log('Token obtenido:', token);  // Depuración
      if (!token) {
        Swal.fire('Error', 'No tienes permiso para realizar esta acción', 'error');
        return;
      }
  
      // 2. Realizar la solicitud para crear la ponderación
      const response = await fetch('http://localhost:4000/api/ponderaciones/crearPonderacion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,  // Pasar el token en los encabezados
        },
        body: JSON.stringify({
          Descripcion_ponderacion: nuevaPonderacion,  // El dato que quieres enviar
        }),
      });
  
      // 3. Verificar si la respuesta fue exitosa
      if (response.ok) {
        // 4. Decodificar el token para obtener el código de usuario
        const decodedToken = jwt_decode.jwtDecode(token);
        console.log('Token decodificado:', decodedToken);  // Depuración
  
        // Verificar si el código de usuario está presente en el token
        if (!decodedToken.cod_usuario) {
          console.error('No se pudo obtener el código de usuario del token');
          throw new Error('No se pudo obtener el código de usuario del token');
        }
  
        // 5. Registrar la acción en la bitácora
        const descripcion = `El usuario: ${decodedToken.nombre_usuario} ha creado una nueva ponderación`;
  
        const bitacoraResponse = await axios.post('http://localhost:4000/api/bitacora/registro', 
          {
            cod_usuario: decodedToken.cod_usuario,
            cod_objeto: 58,  // Código de objeto para la acción de crear ponderación
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
          Swal.fire('¡Éxito!', 'La ponderación se ha creado correctamente', 'success');
  
          // 6. Realizar las acciones posteriores después de la creación exitosa
          fetchPonderacion(); // Refrescar la lista de ponderaciones
          setModalVisible(false); // Cerrar el modal
          resetNuevaPonderacion(); // Resetear el estado de la nueva ponderación
          setHasUnsavedChanges(false); // Restablecer el estado de cambios no guardados
  
        } else {
          Swal.fire('Error', 'No se pudo registrar la acción en la bitácora', 'error');
        }
  
      } else {
        Swal.fire('Error', 'Hubo un problema al crear la ponderación', 'error');
      }
    } catch (error) {
      console.error('Error al crear la ponderación:', error);
      Swal.fire('Error', 'Hubo un problema al crear la ponderación', 'error');
    }
  };
  
  const handleUpdatePonderacion = async () => {
    if (!validarPonderacionUpdate()) return;
  
    try {
      // 1. Verificar si obtenemos el token correctamente
      const token = localStorage.getItem('token');
      console.log('Token obtenido:', token);  // Depuración
      if (!token) {
        Swal.fire('Error', 'No tienes permiso para realizar esta acción', 'error');
        return;
      }
  
      // 2. Realizar la solicitud para actualizar la ponderación
      const response = await fetch('http://localhost:4000/api/ponderaciones/actualizarPonderacion', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,  // Pasar el token en los encabezados
        },
        body: JSON.stringify({
          Cod_ponderacion: ponderacionToUpdate.Cod_ponderacion,
          Descripcion_ponderacion: ponderacionToUpdate.Descripcion_ponderacion,
        }),
      });
  
      // 3. Verificar si la respuesta fue exitosa
      if (response.ok) {
        // 4. Decodificar el token para obtener el código de usuario
        const decodedToken = jwt_decode.jwtDecode(token);
        console.log('Token decodificado:', decodedToken);  // Depuración
  
        // Verificar si el código de usuario está presente en el token
        if (!decodedToken.cod_usuario) {
          console.error('No se pudo obtener el código de usuario del token');
          throw new Error('No se pudo obtener el código de usuario del token');
        }
  
        // 5. Registrar la acción en la bitácora
        const descripcion = `El usuario: ${decodedToken.nombre_usuario} ha actualizado la ponderación: ${ponderacionToUpdate.Descripcion_ponderacion}; `;
  
        const bitacoraResponse = await axios.post('http://localhost:4000/api/bitacora/registro', 
          {
            cod_usuario: decodedToken.cod_usuario,
            cod_objeto: 58,  // Código de objeto para la acción de actualizar ponderación
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
          Swal.fire('¡Éxito!', 'La ponderación se ha actualizado correctamente', 'success');
  
          // 6. Realizar las acciones posteriores después de la actualización exitosa
          fetchPonderacion(); // Refrescar la lista de ponderaciones
          setModalUpdateVisible(false); // Cerrar el modal
          resetPonderaciontoUpdate(); // Resetear el estado de la ponderación a actualizar
          setHasUnsavedChanges(false); // Restablecer el estado de cambios no guardados
  
        } else {
          Swal.fire('Error', 'No se pudo registrar la acción en la bitácora', 'error');
        }
  
      } else {
        Swal.fire('Error', 'Hubo un problema al actualizar la ponderación', 'error');
      }
    } catch (error) {
      console.error('Error al actualizar la ponderación:', error);
      Swal.fire('Error', 'Hubo un problema al actualizar la ponderación', 'error');
    }
  };
  
  const handleDeletePonderacion = async () => {
    try {
      // 1. Verificar si obtenemos el token correctamente
      const token = localStorage.getItem('token');
      console.log('Token obtenido:', token);  // Depuración
      if (!token) {
        Swal.fire('Error', 'No tienes permiso para realizar esta acción', 'error');
        return;
      }
  
      // 2. Realizar la solicitud para eliminar la ponderación
      const response = await fetch('http://localhost:4000/api/ponderaciones/eliminarPonderacion', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,  // Pasar el token en los encabezados
        },
        body: JSON.stringify({
          Cod_ponderacion: ponderacionToDelete.Cod_ponderacion,
        }),
      });
  
      // 3. Verificar si la respuesta fue exitosa
      if (response.ok) {
        // 4. Decodificar el token para obtener el código de usuario
        const decodedToken = jwt_decode.jwtDecode(token);
        console.log('Token decodificado:', decodedToken);  // Depuración
  
        // Verificar si el código de usuario está presente en el token
        if (!decodedToken.cod_usuario) {
          console.error('No se pudo obtener el código de usuario del token');
          throw new Error('No se pudo obtener el código de usuario del token');
        }
  
        // 5. Registrar la acción en la bitácora
        const descripcion = `El usuario: ${decodedToken.nombre_usuario} ha eliminado la ponderación: ${ponderacionToDelete.Descripcion_ponderacion}`;
  
        const bitacoraResponse = await axios.post('http://localhost:4000/api/bitacora/registro', 
          {
            cod_usuario: decodedToken.cod_usuario,
            cod_objeto: 58,  // Código de objeto para la acción de eliminar ponderación
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
          Swal.fire('¡Éxito!', 'La ponderación se ha eliminado correctamente', 'success');
  
          // 6. Realizar las acciones posteriores después de la eliminación exitosa
          fetchPonderacion(); // Refrescar la lista de ponderaciones
          setModalDeleteVisible(false); // Cerrar el modal de confirmación
          setPonderacionToDelete({}); // Resetear el estado de la ponderación a eliminar
  
        } else {
          Swal.fire('Error', 'No se pudo registrar la acción en la bitácora', 'error');
        }
  
      } else {
        // Si la respuesta no es ok, verificar si la ponderación está siendo utilizada
        const responseData = await response.json();
        if (responseData.error === 'La ponderación ya pertenece a un grado') {
          Swal.fire('Error', 'La ponderación ya pertenece a un grado', 'error');
        } else {
          Swal.fire('Error', 'Hubo un problema al eliminar la ponderación', 'error');
        }
      }
  
    } catch (error) {
      console.error('Error al eliminar la ponderación:', error);
      Swal.fire('Error', 'Hubo un problema al eliminar la ponderación', 'error');
    }
  };
  

  const openUpdateModal = (ponderacion) => {
    setPonderacionToUpdate(ponderacion); // Cargar los datos de la ponderacion a actualizar
    setModalUpdateVisible(true); // Abrir el modal de actualización
    setHasUnsavedChanges(false);
  };

  const openDeleteModal = (ponderacion) => {
    setPonderacionToDelete(ponderacion); // Guardar la ponderacion que se desea eliminar
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
const filteredPonderaciones = Ponderaciones.filter((ponderacion) =>
  ponderacion.Descripcion_ponderacion.toLowerCase().includes(searchTerm.toLowerCase())
);

// Lógica de paginación
const indexOfLastRecord = currentPage * recordsPerPage;
const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
const currentRecords = filteredPonderaciones.slice(indexOfFirstRecord, indexOfLastRecord);

// Cambiar página
const paginate = (pageNumber) => {
if (pageNumber > 0 && pageNumber <= Math.ceil(filteredPonderaciones.length / recordsPerPage)) {
  setCurrentPage(pageNumber);
}
}

  // Verificar permisos
  if (!canSelect) {
    return <AccessDenied />;
  }


  return (
    <CContainer>
  <CRow className="align-items-center mb-5">
      <CCol xs="8" md="9">
        {/* Título de la página */}
        <h1 className="mb-0">Mantenimiento Ponderaciones</h1>
      </CCol>
      <CCol xs="4" md="3" className="text-end d-flex flex-column flex-md-row justify-content-md-end align-items-md-center">
        {/* Botón Nuevo para abrir el modal */}

        {canInsert && (
        <CButton 
          style={{ backgroundColor: '#4B6251', color: 'white' }} 
          className="mb-3 mb-md-0 me-md-3" // Margen inferior en pantallas pequeñas, margen derecho en pantallas grandes
          onClick={() => {setModalVisible(true);
            setHasUnsavedChanges(false);}}
        >
          <CIcon icon={cilPlus} /> Nuevo
        </CButton>

          )}

        {/* Botón de Reporte */}
        <CButton 
          style={{ backgroundColor: '#6C8E58', color: 'white' }}
          onClick={() => {handleReportePdfClick();}}
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
            placeholder="Buscar Ponderacion..."
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


    {/* Tabla para mostrar ponderaciones */}
    {/* Contenedor de tabla con scroll */}
    <div className="table-container" style={{ maxHeight: '400px', overflowY: 'scroll', marginBottom: '20px' }}>
        <CTable striped bordered hover>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell style={{ width: '50px' }}>#</CTableHeaderCell>
              <CTableHeaderCell style={{ width: '50px' }}>Descripcion de la Ponderacion</CTableHeaderCell>
              <CTableHeaderCell style={{ width: '50px' }}>Acciones</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {currentRecords.map((ponderacion) => (
              <CTableRow key={ponderacion.Cod_ponderacion}>
                <CTableDataCell>
                  {/* Mostrar el índice original en lugar del índice basado en la paginación */}
                  {ponderacion.originalIndex} 
                </CTableDataCell>
                <CTableDataCell>{ponderacion.Descripcion_ponderacion}</CTableDataCell>
                <CTableDataCell>
                {canUpdate && (
                  <CButton style={{ backgroundColor: '#F9B64E',marginRight: '10px' }} onClick={() => openUpdateModal(ponderacion)}>
                    <CIcon icon={cilPen} />
                  </CButton>
                )}

                {canDelete && (
                  <CButton style={{ backgroundColor: '#E57368', marginRight: '10px' }} onClick={() => openDeleteModal(ponderacion)}>
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
          disabled={currentPage === Math.ceil(filteredPonderaciones.length / recordsPerPage)} // Desactiva si es la última página
          onClick={() => paginate(currentPage + 1)} // Páginas siguientes
        >
          Siguiente
        </CButton>
      </CPagination>
      <span style={{ marginLeft: '10px' }}>
        Página {currentPage} de {Math.ceil(filteredPonderaciones.length / recordsPerPage)}
      </span>
    </div>


      {/* Modal para crear una nueva Ponderacion */}
      <CModal visible={modalVisible} backdrop="static">
        <CModalHeader closeButton={false}>
          <CModalTitle>Nueva Ponderación</CModalTitle>
          <CButton className="btn-close" aria-label="Close" onClick={() => handleCloseModal(setModalVisible, resetNuevaPonderacion)} />

        </CModalHeader>
        <CModalBody>
          <CForm>
            <CInputGroup className="mb-3">
            <CInputGroupText>Descripción de la Ponderación</CInputGroupText>
            <CFormInput
            ref={inputRef}
            type="text"
            placeholder="Ingrese una descripción de la ponderación"
            maxLength={50}
            onPaste={disableCopyPaste}
            onCopy={disableCopyPaste}
            value={nuevaPonderacion}
            onChange={(e) => handleInputChange(e, setNuevaPonderacion)}
          />
            </CInputGroup>
          </CForm>
        </CModalBody>
        <CModalFooter>
        <CButton color="secondary" onClick={() => handleCloseModal(setModalVisible, resetNuevaPonderacion)}>
            Cancelar
          </CButton>
          <CButton style={{ backgroundColor: '#4B6251',color: 'white' }} onClick={handleCreatePonderacion}>
          <CIcon icon={cilSave} style={{ marginRight: '5px' }} />Guardar
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Modal para actualizar una Ponderacion */}
      <CModal visible={modalUpdateVisible} backdrop="static">
      <CModalHeader closeButton={false}>
          <CModalTitle>Actualizar Ponderación</CModalTitle>
          <CButton className="btn-close" aria-label="Close" onClick={() => handleCloseModal(setModalUpdateVisible, resetPonderaciontoUpdate)} />
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CInputGroup className="mb-3">
              <CInputGroupText>Descripción de la Ponderación</CInputGroupText>
              <CFormInput
              ref={inputRef}
              maxLength={50}
              onPaste={disableCopyPaste}
              onCopy={disableCopyPaste}
              placeholder="Ingrese la nueva descripción de la ponderación"
              value={ponderacionToUpdate.Descripcion_ponderacion}
              onChange={(e) => handleInputChange(e, (value) => setPonderacionToUpdate({
                ...ponderacionToUpdate,
                Descripcion_ponderacion: value,
              }))}
            />
            </CInputGroup>
          </CForm>
        </CModalBody>
        <CModalFooter>
        <CButton color="secondary" onClick={() => handleCloseModal(setModalUpdateVisible, resetPonderaciontoUpdate)}>
            Cancelar
          </CButton>
          <CButton style={{  backgroundColor: '#F9B64E',color: 'white' }} onClick={handleUpdatePonderacion}>
          <CIcon icon={cilPen} style={{ marginRight: '5px' }} /> Actualizar
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Modal para eliminar una ponderacion */}
      <CModal visible={modalDeleteVisible} onClose={() => setModalDeleteVisible(false)} backdrop="static">
        <CModalHeader>
          <CModalTitle>Confirmar Eliminación</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <p>¿Estás seguro de que deseas eliminar la ponderacion:  <strong>{ponderacionToDelete.Descripcion_ponderacion}</strong>?</p>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setModalDeleteVisible(false)}>
            Cancelar
          </CButton>
          <CButton style={{  backgroundColor: '#E57368',color: 'white' }} onClick={handleDeletePonderacion}>
          <CIcon icon={cilTrash} style={{ marginRight: '5px' }} />Eliminar 
          </CButton>
        </CModalFooter>
      </CModal>
    </CContainer>
  );
};


export default ListaPonderaciones;