import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { jsPDF } from 'jspdf';       // Para generar archivos PDF
import 'jspdf-autotable';            // Para crear tablas en los archivos PDF
import * as XLSX from 'xlsx';        // Para generar archivos Excel
import { saveAs } from 'file-saver'; // Para descargar archivos en el navegador
import { CIcon } from '@coreui/icons-react';
import { cilSearch,cilBrushAlt, cilPen, cilTrash, cilPlus, cilSave, cilDescription } from '@coreui/icons';  // Importar iconos específicos
import swal from 'sweetalert2';
import {
    CButton,
    CCol,
    CContainer,
    CDropdown,
    CDropdownMenu,
    CDropdownToggle,
    CDropdownItem,
    CForm,
    CFormInput,
    CFormSelect,
    CInputGroup,
    CInputGroupText,
    CModal,
    CModalHeader,
    CModalTitle,
    CModalBody,
    CModalFooter,
    CPagination,
    CRow,
    CTable,
    CTableHead,
    CTableRow,
    CTableHeaderCell,
    CTableBody,
    CTableDataCell,
  } from '@coreui/react';

  const ListaDias = () => {
  const [dias, setDias] = useState([{ dias: '' }]);
  const [modalVisible, setModalVisible] = useState(false); // Estado para el modal de crear un nuevo día
  const [modalUpdateVisible, setModalUpdateVisible] = useState(false); // Estado para el modal de actualizar un día
  const [modalDeleteVisible, setModalDeleteVisible] = useState(false); // Estado para el modal de eliminar un día
  const [nuevoDia, setNuevoDia] = useState({ dias: '' }); // Estado para el nuevo día
  const [mensajeError, setMensajeError] = useState(''); // Estado para el mensaje de error
  const [diaToUpdate, setDiaToUpdate] = useState({}); // Estado para el día a actualizar
  const [diaToDelete, setDiaToDelete] = useState({});  // Estado para el estado asistencia a eliminar
  const [searchTerm, setSearchTerm] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(5); // Hacer dinámico el número de registros por página
  useEffect(() => {
    fetchDias();
    
  }, []);

  const fetchDias = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/dia/dias');
      const data = await response.json();
       // Asignar un índice original basado en el orden en la base de datos
      const dataWithIndex = data.map((dia, index) => ({
        ...dia,
        originalIndex: index + 1, // Guardamos la secuencia original
      }));
      setDias(dataWithIndex);
    } catch (error) {
      console.error('Error al obtener los dias:', error);
    }
  };

  
  const exportToExcel = () => {
    // Transforma los datos: convierte nombres de los días a mayúsculas y solo incluye `#` y `dias`
    const diasConFormato = dias.map((dia, index) => ({
        '#': index + 1, // Índice personalizado
        dias: typeof dia.dias === 'string' ? dia.dias.toUpperCase() : dia.dias // Convierte a mayúsculas
    }));

    // Convierte los datos a formato de hoja de cálculo
    const worksheet = XLSX.utils.json_to_sheet(diasConFormato); 
    const workbook = XLSX.utils.book_new(); // Crea un nuevo libro de trabajo
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Días'); // Añade la hoja

    // Genera el archivo Excel en formato binario
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    // Crea un Blob para descargar el archivo con file-saver
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, 'reporte_dias.xlsx'); // Descarga el archivo Excel
};






  const exportToPDF = () => {
    const doc = new jsPDF(); // Crea un nuevo documento PDF
  
    // Añade un título al documento PDF
    doc.text('Reporte de Días', 20, 10);
  
    // Genera la tabla en el PDF con los datos de los edificios
    doc.autoTable({
      head: [['#', 'Nombre del día']], // Cabecera de la tabla
      body: dias.map((dia, index) => [
        index + 1,
        dia.dias.toUpperCase(), // Datos en mayúsculas
      ]), // Datos que se mostrarán en la tabla
    });
  
    // Descarga el archivo PDF
    doc.save('reporte_dias.pdf');
  };

  const handleInputChange = (e, setFunction) => {
    let value = e.target.value
      .toUpperCase() // Convertir a mayúsculas
      .trimStart() // Evitar espacios al inicio
      .replace(/\s+/g, ' '); // Reemplazar múltiples espacios por uno solo
  
    // Regex para validar solo letras y espacios
    const regex = /^[A-Z\s]*$/;
    
    if (!regex.test(value)) {
      swal.fire({
        icon: 'warning',
        title: 'Caracteres no permitidos',
        text: 'Solo se permiten letras.',
      });
      return;
    }
  
    // Validar que no haya más de 4 letras iguales consecutivas en una palabra
    const wordArray = value.split(' ');
    const isValid = wordArray.every(word => !/(.)\1{3,}/.test(word));
  
    if (!isValid) {
      swal.fire({
        icon: 'warning',
        title: 'Repetición de letras',
        text: 'No se permite que la misma letra se repita más de 4 veces consecutivas.',
      });
      return;
    }
  
    // Si todo es válido, actualizar el valor
    setFunction(value);
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
  // Validar que ningún campo esté vacío
  const validateEmptyFields = () => {
    const { dias } = nuevoDia;
    if (!dias) {
      swal.fire({
        icon: 'warning',
        title: 'Campos vacíos',
        text: 'Todos los campos deben estar llenos para poder crear un día.',
      });
      return false;
    }
    return true;
  };

  const handleCreateDia = async () => {
    console.log('Valor a enviar:', nuevoDia.dias); // Verifica el valor
    if (!validateEmptyFields()) {
      return;
    }
    try {
      const response = await fetch('http://localhost:4000/api/dia/crear_dia', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ p_dias: nuevoDia.dias }), // Enviar descripción formateada 
      });
      
      const errorData = await response.json(); // Captura el cuerpo de la respuesta
      console.log(errorData);
      if (response.ok) {
        fetchDias(); // Actualiza la lista de días
        setModalVisible(false); // Cierra el modal
        resetNuevoDia();
        setNuevoDia({dias: ''}); // Limpia el campo de entrada
        
        swal.fire({
          icon: 'success',
          title: 'Creación exitosa',
          text: 'El día se ha creado correctamente.',
        });
      } else {
        swal.fire({
          icon: 'error',
          title: 'Error de validación',
          text: (errorData?.mensaje || 'Hubo un error al crear el día.'),
        });
       
        console.error('Error al crear el día:', response.statusText, errorData);
      }
    } catch (error) {
      console.error('Error al crear el día:', error);
      swal.fire({
        icon: 'error',
        title: 'Error en el servidor',
        text: 'Hubo un error en el servidor. Inténtalo más tarde.',
      });
    }
  };
  

const obtenerPrefijo = (dia) => {
    const prefijos = {
        LU: 'LUNES',
        MAR: 'MARTES',
        MIE: 'MIÉRCOLES',
        JUE: 'JUEVES',
        VIE: 'VIERNES',
        SAB: 'SÁBADO',
        DOM: 'DOMINGO',
    };
    return prefijos[dia] || 'Prefijo no asignado';
};


   // Función para manejar el cierre del modal y restablecer los estados
const handleCloseModal = () => {
  swal.fire({
    title: '¿Estás seguro?',
    text: 'Tienes cambios sin guardar. ¿Deseas cerrar el modal?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, cerrar',
    cancelButtonText: 'Cancelar',
  }).then((result) => {
    if (result.isConfirmed) {
      setModalVisible(false);
      resetNuevoDia();
      setModalUpdateVisible(false);
      setModalDeleteVisible(false);
    }
  }); 
};


// Función para restablecer el estado del nuevo día y el mensaje de error
const resetNuevoDia = () => {
  setNuevoDia({ dias: '' });
  setMensajeError('');
};

const handleUpdateDia = async () => {
  console.log('Valor a enviar para actualización:', diaToUpdate.dias); // Verifica el valor

  // Validación del prefijo antes de enviar la actualización
  const prefijosValidos = /^(LU|MAR|MIE|JUE|VIE|SAB|DOM)$/;

  if (!prefijosValidos.test(diaToUpdate.dias)) {
    setMensajeError('Ingrese un día válido (LU, MAR, MIE, JUE, VIE, SAB, DOM)');
    return; // Detener si el prefijo no es válido
  }

  try {
    const response = await fetch('http://localhost:4000/api/dia/actualizar_dia', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        p_Cod_dias: diaToUpdate.Cod_dias,  // Código del día
        p_Nuevo_dia: diaToUpdate.dias.toUpperCase(),  // Nuevo día en mayúsculas
      }),
    });

    const errorData = await response.json();
    console.log(errorData);
    if (response.ok) {
      fetchDias(); // Actualizar la lista de días
      setModalUpdateVisible(false); // Cierra el modal
      setDiaToUpdate({}); // Restablece el estado del día a actualizar

      // Obtén el nombre completo del día actualizado
      const diaCompleto = obtenerPrefijo(diaToUpdate.dias.toUpperCase());

      swal.fire({
        icon: 'success',
        title: 'Actualización exitosa',
        text: `se ha actualizado correctamente al día: ${diaCompleto} .`,
      });
    } else {
      swal.fire({
        icon: 'error',
        title: 'Error de validación',
        text: (errorData?.mensaje || 'Hubo un error al actualizar el día.'),
      });
    }
  } catch (error) {
    console.error('Error al actualizar el día:', error);
    setMensajeError('Error en la conexión. Intente nuevamente.');
    swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Hubo un error en el servidor.',
    });
  }
};




const handleDeleteDia = async () => {
  try {
    const response = await fetch(`http://localhost:4000/api/dia/${diaToDelete.Cod_dias}`, {
      method: 'DELETE',
    });

    // Intentar obtener la respuesta JSON para los mensajes de error
    const result = await response.json();

    if (response.ok) {
      fetchDias(); // Actualiza la lista de días
      setModalDeleteVisible(false); // Cierra el modal
      setDiaToDelete({}); // Restablece el día a eliminar

      swal.fire({
        icon: 'success',
        title: 'Eliminación exitosa',
        text: 'El día se ha eliminado correctamente.',
      });
    } else {
      // Si hubo un error, mostrar el mensaje devuelto por el servidor
      swal.fire({
        icon: 'error',
        title: 'Error',
        text: result.Mensaje || 'Hubo un error al eliminar el día.',
      });
      console.error('Error al eliminar el día:', result);
    }
  } catch (error) {
    console.error('Error al eliminar el día:', error);
    swal.fire({
      icon: 'error',
      title: 'Error en el servidor',
      text: 'Hubo un error en el servidor. Inténtalo más tarde.',
    });
  }
};
  

  const openUpdateModal = (dia) => {
    setDiaToUpdate(dia);
    setModalUpdateVisible(true);
    setMensajeError(''); // Limpiar el mensaje de error al abrir el modal
  };

  const openDeleteModal = (dia) => {
        setDiaToDelete(dia);
        setModalDeleteVisible(true);
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  const filteredDias = dias.filter((dia) =>
    dia.dias.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredDias.slice(indexOfFirstRecord, indexOfLastRecord);

  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= Math.ceil(filteredDias.length / recordsPerPage)) {
      setCurrentPage(pageNumber);
    }
  };



  return (
    <CContainer className="light-theme">
         <CRow className="align-items-center mb-5">
            <CCol xs="8" md="9">
             {/* Título de la página */}
            <h1 className="mb-0">Mantenimiento Días</h1>
           </CCol>
          
            <CCol xs="4" md="3" className="text-end d-flex flex-column flex-md-row justify-content-md-end align-items-md-center">
            <CButton 
              style={{ backgroundColor: '#4B6251', color: 'white' }} 
              className="mb-3 mb-md-0 me-md-3" // Margen inferior en pantallas pequeñas, margen derecho en pantallas grandes
              onClick={() => setModalVisible(true)}
            >
              <CIcon icon={cilPlus} /> Nuevo
            </CButton>
              {/* Botón Reportes con dropdown */}
        <CDropdown>
          <CDropdownToggle
            style={{ backgroundColor: '#6C8E58', color: 'white' }}
          >
             <CIcon icon={cilDescription} />Reporte
          </CDropdownToggle>
          <CDropdownMenu>
            <CDropdownItem onClick={exportToExcel}>Descargar en Excel</CDropdownItem>
            <CDropdownItem onClick={exportToPDF}>Descargar en PDF</CDropdownItem>
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
                  placeholder="Buscar día..."
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


     {/* Tabla para mostrar la lista de días */}
    {/* Contenedor de tabla con scroll */}

        <div style={{ height: '300px', overflowY: 'scroll', border: '1px solid #ccc', padding: '10px', marginBottom: '30px' }}>
          <CTable striped>
            <CTableHead style={{ position: 'sticky', top: 0, zIndex: 1, backgroundColor: '#fff' }}>
              <CTableRow>
                <CTableHeaderCell style={{ width: '50px' }}>#</CTableHeaderCell>
                <CTableHeaderCell style={{ width: '300px' }}>Nombre del día</CTableHeaderCell>
                <CTableHeaderCell style={{ width: '150px' }}>Acciones</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
            {currentRecords.map((dia, index) => (
              <CTableRow key={dia.Cod_dias || index}>
                {/* Ajustamos el número mostrado sumando la posición en la página actual */}
                <CTableDataCell >
                  {indexOfFirstRecord + index + 1}
                </CTableDataCell>
                <CTableDataCell style={{ textTransform: 'uppercase' }}>{dia.dias}</CTableDataCell>
                <CTableDataCell >
                  <div className="d-flex justify-content-center">
                    <CButton style={{ backgroundColor: '#F9B64E', marginRight: '10px'  }} onClick={() => openUpdateModal(dia)}>
                      <CIcon icon={cilPen} />
                    </CButton>
                    <CButton style={{ backgroundColor: '#E57368', marginRight: '10px' }} onClick={() => openDeleteModal(dia)}>
                      <CIcon icon={cilTrash} />
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
        <CPagination ia-label="Page navigation">
          <CButton
            style={{ backgroundColor: '#6f8173', color: '#D9EAD3' }} 
            disabled={currentPage === 1}
            onClick={() => paginate(currentPage - 1)}> 
            Anterior
          </CButton>
          <CButton
             style={{ marginLeft: '10px',backgroundColor: '#6f8173', color: '#D9EAD3' }}
            disabled={currentPage === Math.ceil(filteredDias.length / recordsPerPage)}
            onClick={() => paginate(currentPage + 1)}>
            Siguiente
          </CButton>
        </CPagination>
        <span style={{ marginLeft: '10px' }}>
          Página {currentPage} de {Math.ceil(filteredDias.length / recordsPerPage)}
        </span>
      </div>
              {/* Modal Crear Día */}
        <CModal visible={modalVisible}  backdrop="static" >
          <CModalHeader closeButton={false}>
            <CModalTitle>Nuevo Día</CModalTitle>
            <CButton className="btn-close" aria-label="Close" onClick={() => handleCloseModal(setModalVisible, resetNuevoDia)}/>
          </CModalHeader>
          <CModalBody>
            <CForm>
              {/* Campo de entrada para ingresar el día */}
              <div className="mb-3">
                <label className="form-label">
                  Ingrese el día (LU, MAR, MIE, JUE, VIE, SAB, DOM)
                </label>
                <CFormInput
                  type="text"
                  placeholder="Ejemplo: LU, MAR, etc."
                  maxLength={11} // Límite de caracteres
                  onPaste={disableCopyPaste}
                  onCopy={disableCopyPaste}
                  value={nuevoDia.dias}
                  onChange={(e) => {
                    // Usar handleInputChange para manejar el valor y validarlo
                    handleInputChange(e, (diaIngresado) => {
                      setNuevoDia({ ...nuevoDia, dias: diaIngresado });

                      // Validar prefijos válidos (Lu, Mar, Mie, Jue, Vie, Sab, Dom)
                      const prefijosValidos = /^(LU|MAR|MIE|JUE|VIE|SAB|DOM)$/; // Adaptar a mayúsculas
                      if (diaIngresado && !prefijosValidos.test(diaIngresado)) {
                        setMensajeError('Ingrese un día válido');
                      } else {
                        setMensajeError(''); // Limpiar el mensaje de error si es válido
                      }
                    });
                  }}
                  />
              </div>

              {/* Mostrar prefijo del día ingresado */}
              {nuevoDia.dias && !mensajeError && (
                <div className="mt-3">
                  <p>
                    <strong>Prefijo del día: </strong>{obtenerPrefijo(nuevoDia.dias)}
                  </p>
                </div>
              )}

              {/* Mostrar mensaje de error si existe */}
              {mensajeError && (
                <div className="text-danger mt-2">{mensajeError}</div>
              )}
            </CForm>
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={handleCloseModal}>Cancelar</CButton>
            <CButton
              style={{ backgroundColor: '#4B6251',color: 'white' }}
              onClick={handleCreateDia}
            >
              <CIcon icon={cilSave} style={{ marginRight: '5px' }} /> Guardar
            </CButton>
          </CModalFooter>
        </CModal>


          

                  {/* Modal Actualizar Día */}
            <CModal visible={modalUpdateVisible} backdrop="static">
                <CModalHeader closeButton={false}>
                    <CModalTitle>Actualizar Día</CModalTitle>
                    <CButton className="btn-close" aria-label="Close" onClick={() => handleCloseModal(setModalVisible, resetNuevoDia)} />
                </CModalHeader>
                <CModalBody>
                    <CForm>
                        <div className="mb-3">
                            <label className="form-label">
                                Ingrese el nuevo día (LU, MAR, MIE, JUE, VIE, SAB, DOM)
                            </label>
                            <CFormInput
                                type="text"
                                placeholder="Ejemplo: LU, MAR, etc."
                                maxLength={11} // Límite de caracteres
                                onPaste={disableCopyPaste}
                                onCopy={disableCopyPaste}
                                value={diaToUpdate.dias ? diaToUpdate.dias.toUpperCase() : ''}
                                onChange={(e) => {
                                    const diaIngresado = e.target.value.toUpperCase(); // Convertir a mayúsculas
                                    setDiaToUpdate({ ...diaToUpdate, dias: diaIngresado });
                                    
                                    // Validación de prefijo
                                    const prefijosValidos = /^(LU|MAR|MIE|JUE|VIE|SAB|DOM)$/;
                                    if (!prefijosValidos.test(diaIngresado)) {
                                        setMensajeError('Ingrese un día válido');
                                    } else {
                                        setMensajeError(''); // Limpiar el mensaje de error si es válido
                                    }
                                }}
                            />
                        </div>
                        {mensajeError && (
                            <div className="text-danger mt-2">{mensajeError}</div>
                        )}
                    </CForm>
                </CModalBody>
                <CModalFooter>
                    <CButton color="secondary" onClick={handleCloseModal}>Cancelar</CButton>
                    <CButton
                          style={{  backgroundColor: '#F9B64E', color: 'white' }}
                          onClick={handleUpdateDia}
                    >
                        <CIcon icon={cilPen} style={{ marginRight: '5px' }} /> Actualizar
                    </CButton>
                </CModalFooter>
            </CModal>

              {/* Modal Eliminar Día */}
            <CModal visible={modalDeleteVisible} backdrop="static">
            <CModalHeader closeButton={false}>
              <CModalTitle>Eliminar Día</CModalTitle>
              <CButton className="btn-close" aria-label="Close" onClick={() => handleCloseModal(setModalVisible, resetNuevoDia)}/>
            </CModalHeader>
            <CModalBody>
              ¿Estás seguro de que deseas eliminar el día: {diaToDelete.dias?.toUpperCase()}?
            </CModalBody>
            <CModalFooter>
            <CButton color="secondary" onClick={handleCloseModal}>Cancelar</CButton>
              <CButton style={{  backgroundColor: '#E57368',color: 'white' }} onClick={handleDeleteDia}>
              <CIcon icon={cilTrash} style={{ marginRight: '5px' }} /> Eliminar
              </CButton>
            </CModalFooter>
          </CModal>

   
    </CContainer>
  );
};

export default ListaDias;
