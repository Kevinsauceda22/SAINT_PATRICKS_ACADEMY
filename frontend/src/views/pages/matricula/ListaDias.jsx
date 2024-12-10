import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CIcon } from '@coreui/icons-react';
import { cilSearch, cilBrushAlt, cilPen, cilTrash, cilPlus, cilSave, cilDescription  } from '@coreui/icons';
import swal from 'sweetalert2';
import { jsPDF } from 'jspdf';
import logo from 'src/assets/brand/logo_saint_patrick.png'
import 'jspdf-autotable';

import {
    CButton,
    CCard,
    CCardBody,
    CCol,
    CDropdown,
    CDropdownToggle,
    CContainer,
    CDropdownMenu,
    CDropdownItem,
    CForm,
    CFormInput,
    CInputGroup,
    CInputGroupText,
    CModal,
    CFormSelect,
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
    CPaginationItem,
  } from '@coreui/react';

  const ListaDias = () => {
  const [dias, setDias] = useState([{ dias: '', prefijo_dia:'' }]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalUpdateVisible, setModalUpdateVisible] = useState(false);
  const [modalDeleteVisible, setModalDeleteVisible] = useState(false);
  const [nuevoDia, setNuevoDia] = useState({ p_dias: '' , p_prefijo_dia: ''});
  const [mensajeError, setMensajeError] = useState(''); // Estado para el mensaje de error
  const [diaToUpdate, setDiaToUpdate] = useState({});
  const [diaToDelete, setDiaToDelete] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);

  useEffect(() => {
    fetchDias();
    
  }, []);

  const fetchDias = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/dia/dias');
      const data = await response.json();
      const dataWithIndex = data.map((dia, index) => ({
        ...dia,
        originalIndex: index + 1,
      }));
      setDias(dataWithIndex);
    } catch (error) {
      console.error('Error al obtener los dias:', error);
    }
  };


  const handleCreateDia = async () => {
    
    
    console.log('Valor a enviar:', nuevoDia.dias); // Verifica el valor
    console.log('Valor a enviar:', nuevoDia.prefijo_dia); // Verifica el valor
    try {
      const response = await fetch('http://localhost:4000/api/dia/crear_dia', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          p_dias: nuevoDia.dias,
          p_prefijo_dia: nuevoDia.prefijo_dia,
        }),
      });
  
      if (response.ok) {
      
     
        fetchDias();
        setModalVisible(false);
        setNuevoDia({dias: '', prefijo_dia:''});
        resetNuevoDia();
        swal.fire('Éxito', 'Día creado correctamente.', 'success');
      } else {
        const errorData = await response.json(); // Captura el cuerpo de la respuesta
        setMensajeError(errorData.mensaje || 'Error al crear el día.'); // Actualiza el mensaje de error
        console.error('Error al crear el día:', response.statusText, errorData);
        swal.fire('Error', errorData.mensaje || 'No se pudo crear la sección.', 'error');
      }
    } catch (error) {
      console.error('Error al crear el día:', error);
      setMensajeError('Error al crear el día.'); // Mensaje genérico en caso de error en la solicitud
    }
  };
  



   // Función para manejar el cierre del modal y restablecer los estados
const handleCloseModal = () => {
  swal.fire({
    title: '¿Estás seguro?',
    text: 'Tienes cambios sin guardar. ¿Deseas cerrar el modal?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Cerrar',
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
  setNuevoDia({ dias: '', prefijo_dia:'' });
  setMensajeError('');
};


const handleUpdateDia = async () => {
 

  try {
      const response = await fetch('http://localhost:4000/api/dia/actualizar_dia', {
          method: 'PUT',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({
              p_Cod_dias: diaToUpdate.Cod_dias,  // Código del día
              p_Nuevo_dia: diaToUpdate.dias,  // Nuevo día
              p_Nuevo_prefijo: diaToUpdate.prefijo_dia,
            }),
      });

      if (response.ok) {
          fetchDias(); // Actualizar la lista de días
          setModalUpdateVisible(false);
          setDiaToUpdate({});
          setMensajeError(''); // Limpiar el mensaje de error
            swal.fire({
              icon: 'success',
              title: 'Actualización exitosa',
              text: 'El día ha sido actualizado correctamente.',
            });
      } else {
          const errorData = await response.json();
          setMensajeError(`Error: ${errorData.Mensaje || 'No se pudo actualizar el día, ya existe'}`);
          swal.fire('Error', errorData.mensaje || 'No se pudo crear la sección.', 'error');
      }
  } catch (error) {
      console.error('Error al actualizar el día:', error);
      setMensajeError('Error en la conexión. Intente nuevamente.');
  }
};


const handleDeleteDia = async () => {
  try {
    const response = await fetch(`http://localhost:4000/api/dia/${diaToDelete.Cod_dias}`, {
      method: 'DELETE',
    });

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
      const errorData = await response.json();
      console.error('Error al eliminar el día:', errorData);
    }
  } catch (error) {
    console.error('Error al eliminar el día:', error);
  }
};

 
const handleNombreInputChange = (e, setState) => {
  const { name, value } = e.target;

  // Validaciones
  const isValid = validateNombre(value);

  if (isValid) {
    setState(prevState => ({ ...prevState, [name]: value }));
  }
};

const validateNombre = (value) => {
  // 1. No permitir caracteres especiales (solo letras y espacios)
  const regexSpecialChars = /^[a-zA-Z\s]*$/;
  if (!regexSpecialChars.test(value)) {
    swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Solo se permiten letras y espacios.',
    });
    return false;
  }

  // 2. No permitir 4 letras consecutivas
  const regexConsecutiveLetters = /(.)\1{3,}/; // Busca 4 letras iguales consecutivas
  if (regexConsecutiveLetters.test(value)) {
    swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'No se permiten 4 letras consecutivas.',
    });
    return false;
  }

  // 3. No permitir números
  const regexNumbers = /\d/;
  if (regexNumbers.test(value)) {
    swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'No se permiten números.',
    });
    return false;
  }

  // 4. No permitir más de 3 espacios consecutivos
  const regexSpaces = /( {3,})/; // Busca 3 o más espacios consecutivos
  if (regexSpaces.test(value)) {
    swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'No se permiten más de 3 espacios consecutivos.',
    });
    return false;
  }

  // 5. Opción: Limitar la cantidad de espacios consecutivos a 2
  const regexTwoSpaces = /( {2,})/; // Busca 2 o más espacios
  if (regexTwoSpaces.test(value)) {
    swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'No se permiten más de 2 espacios consecutivos.',
    });
    return false;
  }

  return true; // Si pasa todas las validaciones
};

// Deshabilita copiar y pegar
const disableCopyPaste = (e) => {
  e.preventDefault();
  swal.fire({
    icon: 'warning',
    title: 'Acción bloqueada',
    text: 'Copiar y pegar no está permitido.',
  });
};
const generatePDFForDias = () => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  if (!filteredDias || filteredDias.length === 0) {
    alert('No hay datos para exportar.');
    return;
  }

  const img = new Image();
  img.src = logo; // Ruta válida del logo

  img.onload = () => {
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    // Logo
    doc.addImage(img, 'PNG', 10, 10, 45, 45);

    // Encabezado principal
    doc.setFontSize(18);
    doc.setTextColor(0, 102, 51); // Verde
    doc.text("SAINT PATRICK'S ACADEMY", pageWidth / 2, 24, { align: 'center' });

    // Información de contacto
    doc.setFontSize(10);
    doc.setTextColor(100); // Gris
    doc.text('Casa Club del periodista, Colonia del Periodista', pageWidth / 2, 32, { align: 'center' });
    doc.text('Teléfono: (504) 2234-8871', pageWidth / 2, 37, { align: 'center' });
    doc.text('Correo: info@saintpatrickacademy.edu', pageWidth / 2, 42, { align: 'center' });

    // Título del reporte
    doc.setFontSize(14);
    doc.setTextColor(0, 102, 51); // Verde
    doc.text('Reporte General de Días', pageWidth / 2, 50, { align: 'center' });

    // Línea divisoria
    doc.setLineWidth(0.5);
    doc.setDrawColor(0, 102, 51); // Verde
    doc.line(10, 55, pageWidth - 10, 55);

    // Subtítulo
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text('Listado de Días', pageWidth / 2, 65, { align: 'center' });

    // Tabla de datos
    const tableColumn = ['#', 'Nombre del Día', 'Prefijo del Día'];
    const tableRows = filteredDias.map((dia, index) => [
      { content: (index + 1).toString(), styles: { halign: 'center' } },
      { content: dia.dias.toUpperCase(), styles: { halign: 'left' } },
      { content: dia.prefijo_dia.toUpperCase(), styles: { halign: 'center' } },
    ]);

    doc.autoTable({
      startY: 75,
      head: [tableColumn],
      body: tableRows,
      headStyles: {
        fillColor: [0, 102, 51], // Verde
        textColor: [255, 255, 255], // Blanco
        fontSize: 10,
        halign: 'center', // Centrado por defecto
      },
      styles: {
        fontSize: 10,
        cellPadding: 3,
      },
      alternateRowStyles: {
        fillColor: [240, 248, 255], // Azul claro
      },
      margin: { top: 10, bottom: 30 },
      didDrawPage: function (data) {
        const pageCount = doc.internal.getNumberOfPages();
        const pageCurrent = doc.internal.getCurrentPageInfo().pageNumber;

        // Pie de página
        doc.setFontSize(10);
        doc.setTextColor(0, 102, 51); // Verde
        doc.text(
          `Página ${pageCurrent} de ${pageCount}`,
          pageWidth - 10,
          pageHeight - 10,
          { align: 'right' }
        );

        const now = new Date();
        const dateString = now.toLocaleDateString('es-HN', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
        const timeString = now.toLocaleTimeString('es-HN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });
        doc.text(`Fecha de generación: ${dateString} Hora: ${timeString}`, 10, pageHeight - 10);
      },
    });

    // Convertir PDF en Blob
    const pdfBlob = doc.output('blob');
    const pdfURL = URL.createObjectURL(pdfBlob);

    // Crear una nueva ventana con visor personalizado
    const newWindow = window.open('', '_blank');
    newWindow.document.write(`
      <html>
        <head><title>Reporte de Días</title></head>
        <body style="margin:0;">
          <iframe width="100%" height="100%" src="${pdfURL}" frameborder="0"></iframe>
          <div style="position:fixed;top:10px;right:200px;">
            <button style="background-color: #6c757d; color: white; border: none; padding: 10px 15px; border-radius: 5px; cursor: pointer;" 
              onclick="const a = document.createElement('a'); a.href='${pdfURL}'; a.download='Reporte_de_Dias.pdf'; a.click();">
              Descargar PDF
            </button>
          </div>
        </body>
      </html>`);
  };

  img.onerror = () => {
    swal.fire('Error', 'No se pudo cargar el logo.', 'error');
  };
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
    const value = event.target.value.toUpperCase(); // Convierte el texto a mayúsculas
    setSearchTerm(value);
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
    <CContainer>
       <CRow className="align-items-center mb-5">
       <CCol xs="8" md="9">
            {/* Título de la página */}
            <h1 className="mb-0">Mantenimiento Días</h1>
          </CCol>
          <CCol xs="4"
            md="3"
            className="text-end d-flex flex-column flex-md-row justify-content-md-end align-items-md-center">
            {/* Botón Nuevo para abrir el modal */}
            <CButton
              style={{ backgroundColor: '#4B6251', color: 'white' }}
              className="mb-3 mb-md-0 me-md-3" // Margen inferior en pantallas pequeñas, margen derecho en pantallas grandes
              onClick={() => {
                setModalVisible(true);}}>
              <CIcon icon={cilPlus}/> Nuevo
            </CButton>

            {/* Botón de Reporte con opciones para Excel y PDF */}
          <CDropdown>
      <CDropdownToggle style={{ backgroundColor: '#6C8E58', color: 'white' }}>
        <CIcon icon={cilDescription} /> Reporte
      </CDropdownToggle>
      <CDropdownMenu>
        <CDropdownItem
           onClick={() => generatePDFForDias(filteredDias)}
          style={{
            color: '#6C8E58', // Color verde para armonizar con el botón
            fontWeight: 'bold',
          }}
        >
          Ver Reporte en PDF
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
              placeholder="Buscar día.."
              onChange={handleSearch}
              value={searchTerm}
            />
            <CButton
              style={{
                border: '1px solid #ccc',
                transition: 'all 0.1s ease-in-out', // Duración de la transición
                backgroundColor: '#F3F4F7', // Color por defecto
                color: '#343a40', // Color de texto por defecto
              }}
              onClick={() => {
                setSearchTerm('')
                setCurrentPage(1)
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#E0E0E0' // Color cuando el mouse sobre el boton "limpiar"
                e.currentTarget.style.color = 'black' // Color del texto cuando el mouse sobre el boton "limpiar"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#F3F4F7' // Color cuando el mouse no está sobre el boton "limpiar"
                e.currentTarget.style.color = '#343a40' // Color de texto cuando el mouse no está sobre el boton "limpiar"
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
                  const value = Number(e.target.value)
                  setRecordsPerPage(value)
                  setCurrentPage(1) // Reiniciar a la primera página cuando se cambia el número de registros
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

        <div className="table-container" style={{ maxHeight: '520px', overflowY: 'scroll', marginBottom: '20px' }}>
          <CTable striped bordered hover>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell className="text-center">#</CTableHeaderCell>
                <CTableHeaderCell className="text-center">Nombre del día</CTableHeaderCell>
                <CTableHeaderCell className="text-center">Prefijo del día</CTableHeaderCell>
                <CTableHeaderCell className="text-center">Acciones</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
            {currentRecords.map((dia, index) => (
              <CTableRow key={dia.Cod_dias || index}>
                {/* Ajustamos el número mostrado sumando la posición en la página actual */}
                <CTableDataCell className="text-center">
                  {indexOfFirstRecord + index + 1}
                </CTableDataCell>
                <CTableDataCell style={{ textTransform: 'uppercase' }}>{dia.dias}</CTableDataCell>
                <CTableDataCell style={{ textTransform: 'uppercase' }}>{dia.prefijo_dia}</CTableDataCell>
                <CTableDataCell className="text-center">
                  <div className="d-flex justify-content-center">
                    <CButton color="warning" onClick={() => openUpdateModal(dia)} style={{ marginRight: '10px' }}>
                      <CIcon icon={cilPen} />
                    </CButton>
                    <CButton color="danger" onClick={() => openDeleteModal(dia)} style={{ marginRight: '10px' }}>
                      <CIcon icon={cilTrash} />
                    </CButton>
                  </div>
                </CTableDataCell>
              </CTableRow>
            ))}

            </CTableBody>
          </CTable>
        </div>


      <div className="pagination mb-0" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
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
        <CModal visible={modalVisible} backdrop="static">
          <CModalHeader  closeButton={false}>
            <CModalTitle>Ingresar Día</CModalTitle>
            <CButton className="btn-close" aria-label="Close" onClick={handleCloseModal} />
          </CModalHeader>
          <CModalBody>
            <CInputGroup className="mb-3">
            <CInputGroupText>Nombre del día</CInputGroupText>
              <CFormInput
                type="text"
                name="dias"
                value={nuevoDia.dias || ""} // Asegúrate de que `value` no sea `undefined`
                onPaste={disableCopyPaste}
                onCopy={disableCopyPaste}
                style={{ textTransform: 'uppercase' }}
                
                onChange={(e) => handleNombreInputChange(e, setNuevoDia)}
              />
            </CInputGroup>
            <CInputGroup className="mb-3">
            <CInputGroupText>Prefijo del día</CInputGroupText>
              <CFormInput
                type="text"
                value={nuevoDia.prefijo_dia || ""} // Asegúrate de que `value` no sea `undefined`
                onPaste={disableCopyPaste}
                onCopy={disableCopyPaste}
                style={{ textTransform: 'uppercase' }}
            
               onChange={(e) => handleNombreInputChange(e, setNuevoDia)}
              />
            </CInputGroup>
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={handleCloseModal}>
              Cancelar
            </CButton>
            <CButton color="success" onClick={handleCreateDia}>
              Guardar
            </CButton>
          </CModalFooter>
        </CModal>


          

       
         {/* Modal Actualizar Día */}
         <CModal visible={modalUpdateVisible} onClose={() => setModalVisible(false)}  backdrop="static">
                <CModalHeader>
                    <CModalTitle>Actualizar Día</CModalTitle>
                </CModalHeader>
                <CModalBody>
                    <CForm>
                        <div className="mb-3">
                     
                            <CInputGroup className="mb-3">
                          <CInputGroupText>Nombre del día</CInputGroupText>
                          <CFormInput
                            value={diaToUpdate.dias || ''}
                            maxLength={50}
                            name="dias"
                            onPaste={disableCopyPaste}
                            onCopy={disableCopyPaste}
                            style={{ textTransform: 'uppercase' }}
                            
                            onChange={(e) => handleNombreInputChange(e, setDiaToUpdate)}
                              />
                            </CInputGroup>

                            <CInputGroup className="mb-3">
                            <CInputGroupText>Prefijo del día</CInputGroupText>
                            <CFormInput
                              value={diaToUpdate.prefijo_dia || ''}
                              maxLength={50}
                              name="prefijo_dia"
                              onPaste={disableCopyPaste}
                              onCopy={disableCopyPaste}
                              style={{ textTransform: 'uppercase' }}
                              
                              onChange={(e) => handleNombreInputChange(e, setDiaToUpdate)}
                                />
                              </CInputGroup>
                        </div>
                        
                    </CForm>
                </CModalBody>
                <CModalFooter>
                    <CButton color="secondary" onClick={handleCloseModal}>Cancelar</CButton>
                    <CButton
                        color="success"
                        onClick={handleUpdateDia}
                      
                    >
                        Actualizar
                    </CButton>
                </CModalFooter>
            </CModal>
            <CModal visible={modalDeleteVisible} onClose={() => setModalDeleteVisible(false)} backdrop="static">
            <CModalHeader>
              <CModalTitle>Eliminar Día</CModalTitle>
            </CModalHeader>
            <CModalBody>
              ¿Estás seguro de que deseas eliminar el día: {diaToDelete.dias}?
            </CModalBody>
            <CModalFooter>
              <CButton color="danger" onClick={handleDeleteDia}>Eliminar</CButton>
              <CButton color="secondary" onClick={handleCloseModal}>Cancelar</CButton>
            </CModalFooter>
          </CModal>

   
    </CContainer>
  );
};

export default ListaDias;
