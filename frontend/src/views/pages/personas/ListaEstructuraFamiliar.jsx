import React, { useState, useEffect } from 'react';
import { CIcon } from '@coreui/icons-react';
import {  cilSearch, cilBrushAlt, cilPen, cilTrash, cilPlus, cilDescription} from '@coreui/icons';
import swal from 'sweetalert2'; // Importar SweetAlert
import axios from 'axios';
import { jsPDF } from 'jspdf';       // Para generar archivos PDF
import 'jspdf-autotable';            // Para crear tablas en los archivos PDF
import * as XLSX from 'xlsx';        // Para generar archivos Excel
import { saveAs } from 'file-saver'; // Para descargar archivos en el navegador
import Select from 'react-select'; // Para crear un seleccionador dinamico 
import {
  CContainer,
  CInputGroup,
  CInputGroupText,
  CFormInput,
  CButton,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CPagination,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CForm,
  CFormLabel,
  CFormSelect,
  CRow,
  CCol,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem
} from '@coreui/react';
import usePermission from '../../../../context/usePermission';
import AccessDenied from "../AccessDenied/AccessDenied"


const ListaEstructuraFamiliar = () => {
  const { canSelect, loading, error } = usePermission('ListaEstructura');

  const [estructuraFamiliar, setEstructuraFamiliar] = useState([]);
  const [errors, setErrors] = useState({ descripcion: '', cod_persona_padre: '', cod_persona_estudiante: '', cod_tipo_relacion: ''});
  const [modalVisible, setModalVisible] = useState(false);
  const [modalUpdateVisible, setModalUpdateVisible] = useState(false);
  const [modalDeleteVisible, setModalDeleteVisible] = useState(false);
  const [descripcion, setDescripcion] = useState("");
  const [descripcionError, setDescripcionError] = useState('');
  const [nuevaEstructura, setNuevaEstructuraFamiliar] = useState({cod_persona_padre: '', cod_persona_estudiante: '', cod_tipo_relacion:'', descripcion: ''});
  const [estructuraToUpdate, setEstructuraToUpdate] = useState({});
  const [estructuraToDelete, setEstructuraToDelete] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false); // Estado para detectar cambios sin guardar
  const [personas, setPersonas] = useState([]);
  const [tipoRelacion, setTipoRelacion] = useState([]);
  const [errorSamePerson, setErrorSamePerson] = useState('');
  const [errorSamePersonUpdate, setErrorSamePersonUpdate] = useState('');
  const [rol, setRol] = useState(''); // Inicializa rol
  const [codPersonaPadre, setCodPersonaPadre] = useState(null);
  const [codPersonaEstudiante, setCodPersonaEstudiante] = useState(null);



  const handleFormSubmit = () => {
      // Enviar datos al backend
      onSubmit({
          cod_persona_padre: codPersonaPadre,
          cod_persona_estudiante: codPersonaEstudiante,
          // otros campos...
      });
  };

  useEffect(() => {
    // Cargar personas según el rol (1 = Padre, 2 = Estudiante)
    const fetchPersonas = async () => {
        try {
            const response = await axios.get(`http://localhost:4000/api/estructuraFamiliar/verPersonas?rol=${rol}`); // Cambia '=' por '?' para parámetros de consulta
            console.log("Datos de Personas:", response.data); // Agregado para depuración

            const options = response.data.map(persona => ({
                value: persona.cod_persona,
                label: `${persona.fullName} - DNI: ${persona.dni}`,
                rol: persona.rol
            }));
            setPersonas(options);
        } catch (error) {
            console.error("Error al cargar personas:", error);
        }
    };

    fetchPersonas();
}, [rol]);


// Manejar selección de persona
const handleSelectChange = (selected) => {
    setSelectedOption(selected);
    onChange(selected ? selected.value : null);
};

useEffect(() => {
  const fetchTipoRelacion = async () => {
      try {
          const response = await axios.get(`http://localhost:4000/api/estructuraFamiliar/verTipoRelacion`);
          setTipoRelacion(response.data);
          console.log('Datos de tipo Relacion:', response.data);  // Verifica la estructura de los datos
      } catch (error) {
          console.error('Error al cargar tipos de relación:', error);
      }
  };
  fetchTipoRelacion();
}, []);

useEffect(() => {
  fetchEstructuraFamiliar();
}, []);
  
  const fetchEstructuraFamiliar = async () => {
    try {
      const response = await fetch(`http://localhost:4000/api/estructuraFamiliar/verEstructuraFamiliar`);
      const data = await response.json();
      console.log(data);
      const dataWithIndex = data.map((estructura, index) => ({
        ...estructura,
        originalIndex: index + 1,
      }));
      console.log(dataWithIndex);
      setEstructuraFamiliar(dataWithIndex);
    } catch (error) {
      console.error('Error al obtener la estructura familiar:', error);
      setMensaje('Error al cargar la lista de estructuras familiares.');
    }
  };

  const handleChange = (event) => {
    // Convertimos el valor a mayúsculas y lo guardamos en el estado
    setDescripcion(event.target.value.toUpperCase());
  };
  
  const validateDescripcion = (descripcion) => {
    const regex = /^[a-zA-Z\s.,áéíóúÁÉÍÓÚñÑ]*$/; // Solo letras, espacios, puntos, comas y acentos
    if (!regex.test(descripcion));
    const noMultipleSpaces = !/\s{2,}/.test(descripcion); // No permite más de un espacio consecutivo
    const trimmedDescripcion = descripcion.trim().replace(/\s+/g, ' ');
  
    if (!regex.test(trimmedDescripcion)) {
      swal.fire({
        icon: 'warning',
        title: 'Descripción inválida',
        text: 'La descripción solo puede contener letras, comas, puntos y espacios.',
      });
      return false;
    }
  
    if (!noMultipleSpaces) {
      swal.fire({
        icon: 'warning',
        title: 'Espacios múltiples',
        text: 'No se permite más de un espacio entre palabras.',
      });
      return false;
    }

      // Validar que ninguna letra se repita más de 4 veces seguidas
    const words = trimmedDescripcion.split(' ');
    for (let word of words) {
      const letterCounts = {};
      for (let letter of word) {
        letterCounts[letter] = (letterCounts[letter] || 0) + 1;
        if (letterCounts[letter] > 5) {
          swal.fire({
            icon: 'warning',
            title: 'Repetición de letras',
            text: `La letra "${letter}" se repite más de 5 veces en la palabra "${word}".`,
          });
          return false; // Retornar falso si se encuentra una letra repetida más de 4 veces
        }
      }
    }
  
    return true; // Retornar verdadero si la descripción es válida
  };
  
    // Capitalizar la primera letra de cada palabra
    const capitalizeWords = (str) => {
      return str.replace(/\b\w/g, (char) => char.toUpperCase());
    };

    const validateEmptyFields = () => {
      const { descripcion, cod_persona_padre, cod_persona_estudiante, cod_tipo_relacion } = nuevaEstructura;
      if (!descripcion || !cod_persona_padre || !cod_persona_estudiante || !cod_tipo_relacion) {
        swal.fire({
          icon: 'warning',
          title: 'Campos vacíos',
          text: 'Todos los campos deben estar llenos para poder crear una nueva estructura',
        });
        return false;
      }
      return true;
    };

      // Función para controlar la entrada de texto en los campos de nombre del edificio
  const handleDescripcionInputChange = (e, setFunction) => {
    let value = e.target.value;

    const upperCaseValue = e.target.value.toUpperCase();
    setDescripcion(upperCaseValue);

    // No permitir más de un espacio consecutivo
    value = value.replace(/\s{2,}/g, ' ');
    

    // No permitir que una letra se repita más de 4 veces consecutivamente
    const wordArray = value.split(' ');
    const isValid = wordArray.every(word => !/(.)\1{4,}/.test(word));

    if (!isValid) {
      swal.fire({
        icon: 'warning',
        title: 'Repetición de letras',
        text: 'No se permite que la misma letra se repita más de 4 veces consecutivas.',
      });
      return;
    }

    if (value.length <= 3) {
      setDescripcionError('La descripción debe tener menos de 3 letras.');
    } else {
      setDescripcionError(''); // No hay error
    }
    
    setFunction((prevState) => ({
      ...prevState,
      descripcion: value,
    }));
    setHasUnsavedChanges(true); // Marcar que hay cambios no guardados
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
      }
    };

    const exportToExcel = () => {
      // Convierte los datos de las estructuras a formato de hoja de cálculo
      const estructuraConNombres = estructuraFamiliar.map((estructura, index) => ({
        '#': index + 1, // Índice personalizado
        'Tutor/Padre': personas.find((p) => p.cod_persona === estructura.cod_persona_padre)?.fullName.toUpperCase() || '',
        'Estudiante': personas.find((p) => p.cod_persona === estructura.cod_persona_estudiante)?.fullName.toUpperCase() || '',
        'Tipo Relación': tipoRelacion[estructura.cod_tipo_relacion]?.toUpperCase() || '',
        'Descripción': estructura.descripcion.toUpperCase() || '',
      }));
    
      const worksheet = XLSX.utils.json_to_sheet(estructuraConNombres); 
      const workbook = XLSX.utils.book_new(); // Crea un nuevo libro de trabajo
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Estructura Familiar'); // Añade la hoja
    
      // Genera el archivo Excel en formato binario
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    
      // Crea un Blob para descargar el archivo con file-saver
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, 'reporte_Estructura.xlsx'); // Descarga el archivo Excel
    };
    
    const exportToPDF = () => {
      const doc = new jsPDF(); // Crea un nuevo documento PDF
    
      // Añade un título al documento PDF
      doc.text('Reporte de Estructuras Familiares', 20, 10);
    
      // Genera la tabla en el PDF con los datos de las estructuras familiares
      doc.autoTable({
        head: [['#', 'Tutor/Padre', 'Estudiante', 'Tipo Relación', 'Descripción']], // Cabecera de la tabla
        body: estructuraFamiliar.map((estructura, index) => [
          index + 1,
          personas.find((p) => p.cod_persona === estructura.cod_persona_padre)?.fullName.toUpperCase() || '',
          personas.find((p) => p.cod_persona === estructura.cod_persona_estudiante)?.fullName.toUpperCase() || '',
          tipoRelacion[estructura.cod_tipo_relacion]?.toUpperCase() || '',
          estructura.descripcion.toUpperCase() || '',
        ]), // Datos que se mostrarán en la tabla
      });
    
      // Descarga el archivo PDF
      doc.save('reporte_estructura.pdf');
    };
    
    const resetNuevaEstructuraFamiliar = () => {
      setNuevaEstructuraFamiliar({ descripcion: '', cod_persona_padre: '', cod_persona_estudiante: '', cod_tipo_relacion: '' });
    };
  
    const resetEstructuraToUpdate = () => {
      setEstructuraToUpdate({ descripcion: '', cod_persona_padre: '', cod_persona_estudiante: '', cod_tipo_relacion: ''  });
    };
  


    const handleCreateEstructura = async () => {
      const descripcionCapitalizado = capitalizeWords(nuevaEstructura.descripcion.trim().replace(/\s+/g, ' '));

      if (!nuevaEstructura.descripcion.trim()) { // Verificar si la descripción está vacía
        swal.fire({
          icon: 'warning',
          title: 'Campo obligatorio',
          text: 'La descripción no puede estar vacía.',
        });
        return; // Detener la función si está vacía
      }
          // Validaciones antes de crear 
    if (!validateDescripcion(descripcionCapitalizado)) {
      return;
    }
    if (!validateEmptyFields()) {
      return;
    }



    try {
      const response = await fetch('http://localhost:4000/api/estructuraFamiliar/crearEstructuraFamiliar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          descripcion: descripcionCapitalizado, 
          cod_persona_padre: nuevaEstructura.cod_persona_padre, 
          cod_persona_estudiante: nuevaEstructura.cod_persona_estudiante, 
          cod_tipo_relacion: nuevaEstructura.cod_tipo_relacion
        }),
      });

      if (response.ok) {
        fetchEstructuraFamiliar();
        setModalVisible(false); // Cerrar el modal sin advertencia al guardar
        resetNuevaEstructuraFamiliar();
        setHasUnsavedChanges(false); // Reiniciar el estado de cambios no guardados
        swal.fire({
          icon: 'success',
          title: 'Creación exitosa',
          text: 'La estructura ha sido creado correctamente.',
        });
      } else {
        swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo crear la estructura.',
        });
      }
    } catch (error) {
      console.error('Error al crear la estructura:', error);
    }
  };

  const handleUpdateEstructura = async () => {
    const descripcionCapitalizado = capitalizeWords(estructuraToUpdate.descripcion.trim().replace(/\s+/g, ' '));

    if (!estructuraToUpdate.descripcion.trim()) { // Verificar si la descripción está vacía
      swal.fire({
        icon: 'warning',
        title: 'Campo obligatorio',
        text: 'La descripción no puede estar vacía.',
      });
      return; // Detener la función si está vacía
    } 
    if (!validateDescripcion(descripcionCapitalizado)) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:4000/api/estructuraFamiliar/actualizarEstructuraFamiliar/${estructuraToUpdate.Cod_genealogia}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          descripcion: descripcionCapitalizado, 
          cod_persona_padre: estructuraToUpdate.cod_persona_padre, 
          cod_persona_estudiante: estructuraToUpdate.cod_persona_estudiante, 
          cod_tipo_relacion: estructuraToUpdate.cod_tipo_relacion
       })
      });

      if (response.ok) {
        fetchEstructuraFamiliar();
        setModalUpdateVisible(false); // Cerrar el modal sin advertencia al guardar
        resetEstructuraToUpdate();
        setHasUnsavedChanges(false); // Reiniciar el estado de cambios no guardados
        swal.fire({
          icon: 'success',
          title: 'Actualización exitosa',
          text: 'La estructura familiar ha sido actualizado correctamente.',
        });
      } else {
        swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo actualizar el la estructura familiar.',
        });
      }
    } catch (error) {
      console.error('Error al actualizar la estructura familiar:', error);
    }
  };

  const handleDeleteEstructura = async () => {
    try {
      const response = await fetch(
        `http://localhost:4000/api/estructuraFamiliar/eliminarEstructuraFamiliar/${encodeURIComponent(estructuraToDelete.Cod_genealogia)}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        fetchEstructuraFamiliar();
        setModalDeleteVisible(false);
        setEdificioToDelete({});
        swal.fire({
          icon: 'success',
          title: 'Eliminación exitosa',
          text: 'La estructura familiar ha sido eliminado correctamente.',
        });
      } else {
        swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo eliminar la estructura familiar.',
        });
      }
    } catch (error) {
      console.error('Error al eliminar la estructura familiar:', error);
    }
  };
  const openUpdateModal = (estructura) => {
    setEstructuraToUpdate(estructura);
    setModalUpdateVisible(true);
    setHasUnsavedChanges(false);
  };

  const openDeleteModal = (estructura) => {
    setEstructuraToDelete(estructura);
    setModalDeleteVisible(true);
  }

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  const filteredEstructuraFamiliar = estructuraFamiliar.filter((estructura) => 
    estructura.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    estructura.cod_persona_estudiante?.toString().includes(searchTerm) || // Assuming cod_persona_estudiante is a number
    estructura.cod_persona_padre?.toString().includes(searchTerm) ||
    estructura.cod_tipo_relacion?.toString().includes(searchTerm)
  );

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredEstructuraFamiliar.slice(indexOfFirstRecord, indexOfLastRecord);

  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= Math.ceil(filteredEstructuraFamiliar.length / recordsPerPage)) {
      setCurrentPage(pageNumber);
    }
  };

    // Verificar permisos
    if (!canSelect) {
      return <AccessDenied />;
    }


  return (
    <CContainer>
      <CRow className="align-items-center mb-5">
        <CCol xs="8" md="9">
          {/* Título de la página */}
          <h1 className="mb-0">Estructura Familiar</h1>
        </CCol>
        <CCol
          xs="4"
          md="3"
          className="text-end d-flex flex-column flex-md-row justify-content-md-end align-items-md-center"
        >
          {/* Botón Nuevo para abrir el modal */}
          <CButton
            style={{ backgroundColor: '#4B6251', color: 'white' }}
            className="mb-3 mb-md-0 me-md-3" // Margen inferior en pantallas pequeñas, margen derecho en pantallas grandes
            onClick={() => setModalVisible(true)}
          >
            <CIcon icon={cilPlus} /> Nuevo
          </CButton>

          {/* Botón de Reporte */}
          {/* Botón Reportes con dropdown */}
          <CDropdown>
            <CDropdownToggle style={{ backgroundColor: '#6C8E58', color: 'white' }}>
              Reportes
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
              placeholder="Buscar estructura..."
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

      <div
        style={{
          maxHeight: '300px',
          overflowY: 'auto',
          border: '1px solid #ccc',
          padding: '10px',
          marginBottom: '30px',
        }}
      >
        <CTable striped>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell style={{ borderRight: '1px solid #ddd' }} className="text-center">
                #
              </CTableHeaderCell>
              <CTableHeaderCell style={{ borderRight: '1px solid #ddd' }} className="text-center">
                Tutor/Padre
              </CTableHeaderCell>
              <CTableHeaderCell style={{ borderRight: '1px solid #ddd' }} className="text-center">
                Estudiante
              </CTableHeaderCell>
              <CTableHeaderCell style={{ borderRight: '1px solid #ddd' }} className="text-center">
                Tipo Relación
              </CTableHeaderCell>
              <CTableHeaderCell style={{ borderRight: '1px solid #ddd' }} className="text-center">
                Descripción
              </CTableHeaderCell>
              <CTableHeaderCell className="text-center">Acciones</CTableHeaderCell>
            </CTableRow>
          </CTableHead>

          <CTableBody>
          {currentRecords.map((estructura) => (
    <CTableRow key={estructura.Cod_genealogia}>
      <CTableDataCell style={{ borderRight: '1px solid #ddd' }} className="text-center">
        {estructura.originalIndex}
      </CTableDataCell>
      <CTableDataCell style={{ borderRight: '1px solid #ddd' }} className="text-center">
        {personas.find((p) => p.cod_persona === estructura.cod_persona_padre)?.fullName.toUpperCase() || "N/A"}
      </CTableDataCell>
      <CTableDataCell style={{ borderRight: '1px solid #ddd' }} className="text-center">
        {personas.find((p) => p.cod_persona === estructura.cod_persona_estudiante)?.fullName.toUpperCase() || "N/A"}
      </CTableDataCell>
      <CTableDataCell style={{ borderRight: '1px solid #ddd' }} className="text-center">
        {tipoRelacion.find(tipo => tipo.Cod_tipo_relacion === estructura.cod_tipo_relacion)?.tipo_relacion?.toUpperCase() || "N/A"}
      </CTableDataCell>
      <CTableDataCell style={{ borderRight: '1px solid #ddd' }} className="text-center">
        {estructura.descripcion.toUpperCase()}</CTableDataCell>
                <CTableDataCell className="text-center">
                  <div className="d-flex justify-content-center">
                    <CButton
                      color="warning"
                      onClick={() => openUpdateModal(estructura)}
                      style={{ marginRight: '10px' }}
                    >
                      <CIcon icon={cilPen} />
                    </CButton>
                    <CButton color="danger" onClick={() => openDeleteModal(estructura)}>
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
      <div
        className="pagination-container"
        style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
      >
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
            disabled={currentPage === Math.ceil(filteredEstructuraFamiliar.length / recordsPerPage)} // Desactiva si es la última página
            onClick={() => paginate(currentPage + 1)} // Páginas siguientes
          >
            Siguiente
          </CButton>
        </CPagination>
        <span style={{ marginLeft: '10px' }}>
          Página {currentPage} de {Math.ceil(filteredEstructuraFamiliar.length / recordsPerPage)}
        </span>
      </div>



        {/* Modal para crear una nueva estructura */}
        <CModal visible={modalVisible} onClose={() => setModalVisible(false)} backdrop="static">
          <CModalHeader closeButton>
            <CModalTitle>Ingresar Nueva Estructura Familiar</CModalTitle>
          </CModalHeader>
          <CModalBody>
            <CForm>
            {/* Selector de Padre/Tutor */}
            <CInputGroup className="mb-3">
              <CInputGroupText>Padre/Tutor</CInputGroupText>
              <Select
                value={personas.find(persona => persona.cod_persona === nuevaEstructura.cod_persona_padre)}
                onChange={(selectedOption) => {
                  const selectedPadre = selectedOption ? selectedOption.value : '';
                  setNuevaEstructuraFamiliar({ ...nuevaEstructura, cod_persona_padre: selectedPadre });

                  // Limpiar el error cuando se selecciona un nuevo Padre/Tutor
                  setErrorSamePerson('');

                  // Verificar si el Padre/Tutor y el Estudiante son la misma persona
                  if (selectedPadre === nuevaEstructura.cod_persona_estudiante) {
                    setErrorSamePerson('El Padre/Tutor y el Estudiante no pueden ser la misma persona.');
                  }
                }}
                options={personas.filter(persona => persona.rol === 'Padre')} // Filtrar solo los padres
                getOptionLabel={option => `${option.fullName} - DNI: ${option.dni}`} // Mostrar nombre y DNI
                getOptionValue={option => option.cod_persona} // Valor del option
                placeholder="Seleccione un Padre/Tutor"
                isClearable
              />
            </CInputGroup>
            {errors.cod_persona_padre && <p className="text-danger">{errors.cod_persona_padre}</p>}
            <p className="text-danger" style={{ fontSize: '12px' }}>{errorSamePerson}</p>


              {/* Selector de Estudiante */}
              <CInputGroup className="mb-3">
                <CInputGroupText>Estudiante</CInputGroupText>
                <Select
                  value={personas.find(persona => persona.cod_persona === nuevaEstructura.cod_persona_estudiante)} // Obtener el estudiante seleccionado
                  onChange={(selectedOption) => {
                    const selectedEstudiante = selectedOption ? selectedOption.value : '';
                    setNuevaEstructuraFamiliar({
                      ...nuevaEstructura,
                      cod_persona_estudiante: selectedEstudiante,
                    });

                    // Limpiar el error cuando se selecciona un nuevo Estudiante
                    setErrorSamePerson('');

                    // Verificar si el Estudiante y el Padre/Tutor son la misma persona
                    if (selectedEstudiante === nuevaEstructura.cod_persona_padre) {
                      setErrorSamePerson('El Padre/Tutor y el Estudiante no pueden ser la misma persona.');
                    }
                  }}
                  options={personas.filter(persona => persona.rol === 'Estudiante')} // Filtrar solo los estudiantes
                  getOptionLabel={option => `${option.fullName} - DNI: ${option.dni}`} // Mostrar nombre y DNI
                  getOptionValue={option => option.cod_persona} // Valor del option
                  placeholder="Seleccione un Estudiante"
                  isClearable
                />
              </CInputGroup>
              {errors.cod_persona_estudiante && <p className="text-danger">{errors.cod_persona_estudiante}</p>}
              <p className="text-danger" style={{ fontSize: '12px' }}>{errorSamePerson}</p>


              {/* Selector de Tipo Relación */}
              <CInputGroup className="mb-3">
                <CInputGroupText>Tipo Relación</CInputGroupText>
                <CFormSelect
                  value={nuevaEstructura.cod_tipo_relacion}
                  onChange={(e) => {
                    setNuevaEstructuraFamiliar({
                      ...nuevaEstructura,
                      cod_tipo_relacion: e.target.value,
                    });
                  }}
                >
                  <option value="">Seleccione un Tipo de Relación</option>
                  {tipoRelacion
                    .filter((tipo) => tipo) // Filtrar elementos vacíos
                    .map((tipo) => (
                      <option key={tipo.Cod_tipo_relacion} value={tipo.Cod_tipo_relacion}>
                        {tipo.tipo_relacion.toUpperCase()}
                      </option>
                    ))}
                </CFormSelect>
              </CInputGroup>

              {/* Campo de Descripción */}
              <CInputGroup className="mb-3">
                <CInputGroupText>Descripción</CInputGroupText>
                <CFormInput
                  type="text"
                  value={nuevaEstructura.descripcion.toUpperCase()}
                  maxLength={50}
                  onPaste={disableCopyPaste}
                  onCopy={disableCopyPaste}
                  onChange={(e) =>
                    handleDescripcionInputChange(
                      e,
                      setNuevaEstructuraFamiliar,
                      handleChange,
                      setDescripcionError,
                    )
                  }
                  required
                  style={{ textTransform: 'uppercase' }}
                />
              </CInputGroup>
              {descripcionError && <p className="text-danger" style={{ fontSize: '12px' }}>{descripcionError}</p>}
            </CForm>
          </CModalBody>
          <CModalFooter>
            <CButton
              style={{ backgroundColor: '#6c757d', color: 'white', borderColor: '#6c757d' }}
              onClick={() => handleCloseModal(setModalVisible, resetNuevaEstructuraFamiliar)}
            >
              Cerrar
            </CButton>
            <CButton
              style={{ backgroundColor: '#4B6251', color: 'white', borderColor: '#4B6251' }}
              onClick={() => {
                // Validación antes de guardar
                if (nuevaEstructura.cod_persona_padre === nuevaEstructura.cod_persona_estudiante) {
                  swal.fire({
                    icon: 'warning',
                    title: 'Campo inválido',
                    text: 'El Padre/Tutor y el Estudiante no pueden ser la misma persona.',
                  });
                  return; // Detener la función si hay un error
                }

                handleCreateEstructura(); // Llama a la función para crear la estructura
              }}
            >
              Guardar
            </CButton>
          </CModalFooter>
        </CModal>
        {/* Fin del modal agregar */}


{/* Modal para actualizar una estructura */}
<CModal visible={modalUpdateVisible} onClose={() => setModalUpdateVisible(false)} backdrop="static">
  <CModalHeader closeButton>
    <CModalTitle>Actualizar Estructura Familiar</CModalTitle>
  </CModalHeader>
  <CModalBody>
    <CForm>
      {/* Campo de Identificador (solo lectura) */}
      <CInputGroup className="mb-3">
        <CInputGroupText>Identificador</CInputGroupText>
        <CFormInput value={estructuraToUpdate.Cod_genealogia} readOnly />
      </CInputGroup>

{/* Selector de Padre/Tutor con validación */}
<CInputGroup className="mb-3">
  <CInputGroupText>Padre/Tutor</CInputGroupText>
  <Select
    value={personas.find(persona => persona.cod_persona === estructuraToUpdate.cod_persona_padre)} // Obtener el padre/tutor seleccionado
    onChange={(selectedOption) => {
      const selectedPadre = selectedOption ? selectedOption.value : '';
      setEstructuraToUpdate((prevState) => ({
        ...prevState,
        cod_persona_padre: selectedPadre,
      }));

      // Validación para evitar duplicados
      if (selectedPadre === estructuraToUpdate.cod_persona_estudiante) {
        setErrorSamePersonUpdate('El Padre/Tutor y el Estudiante no pueden ser la misma persona.');
      } else {
        setErrorSamePersonUpdate('');
      }
    }}
    options={personas.filter(persona => persona.rol === 'Padre')} // Filtrar solo los padres
    getOptionLabel={option => `${option.fullName} - DNI: ${option.dni}`} // Mostrar nombre y DNI
    getOptionValue={option => option.cod_persona} // Valor del option
    placeholder="Seleccione un Padre/Tutor"
    isClearable
  />
</CInputGroup>
{errorSamePersonUpdate && (
  <p style={{ color: 'red', fontSize: '12px' }}>{errorSamePersonUpdate}</p>
)}

{/* Selector de Estudiante con validación */}
<CInputGroup className="mb-3">
  <CInputGroupText>Estudiante</CInputGroupText>
  <Select
    value={personas.find(persona => persona.cod_persona === estructuraToUpdate.cod_persona_estudiante)} // Obtener el estudiante seleccionado
    onChange={(selectedOption) => {
      const selectedEstudiante = selectedOption ? selectedOption.value : '';
      setEstructuraToUpdate((prevState) => ({
        ...prevState,
        cod_persona_estudiante: selectedEstudiante,
      }));

      // Validación para evitar duplicados
      if (selectedEstudiante === estructuraToUpdate.cod_persona_padre) {
        setErrorSamePersonUpdate('El Padre/Tutor y el Estudiante no pueden ser la misma persona.');
      } else {
        setErrorSamePersonUpdate('');
      }
    }}
    options={personas.filter(persona => persona.rol === 'Estudiante')} // Filtrar solo los estudiantes
    getOptionLabel={option => `${option.fullName} - DNI: ${option.dni}`} // Mostrar nombre y DNI
    getOptionValue={option => option.cod_persona} // Valor del option
    placeholder="Seleccione un Estudiante"
    isClearable
  />
</CInputGroup>
{errorSamePersonUpdate && (
  <p style={{ color: 'red', fontSize: '12px' }}>{errorSamePersonUpdate}</p>
)}

      {/* Selector de Tipo Relación */}
      <CInputGroup className="mb-3">
        <CInputGroupText>Tipo Relación</CInputGroupText>
        <CFormSelect
          value={estructuraToUpdate.cod_tipo_relacion}
          onChange={(e) => {
            setEstructuraToUpdate({ ...estructuraToUpdate, cod_tipo_relacion: e.target.value });
          }}
        >
          <option value="">Seleccione un Tipo de Relación</option>
          {tipoRelacion
            .filter((tipo) => tipo) // Filtrar elementos vacíos
            .map((tipo) => (
              <option key={tipo.Cod_tipo_relacion} value={tipo.Cod_tipo_relacion}>
                {tipo.tipo_relacion.toUpperCase()}
              </option>
            ))}
        </CFormSelect>
      </CInputGroup>

      {/* Campo de Descripción con validación */}
      <CInputGroup className="mb-3">
        <CInputGroupText>Descripción</CInputGroupText>
        <CFormInput
          value={estructuraToUpdate.descripcion}
          maxLength={50}
          onPaste={disableCopyPaste}
          onCopy={disableCopyPaste}
          onChange={(e) =>
            handleDescripcionInputChange(
              e,
              setEstructuraToUpdate,
              handleChange,
              setDescripcionError,
            )
          }
          style={{ textTransform: 'uppercase' }}
        />
      </CInputGroup>
      {descripcionError && (
        <p style={{ color: 'red', fontSize: '12px' }}>{descripcionError}</p>
      )}
    </CForm>
  </CModalBody>
  <CModalFooter>
    {/* Botón de Cerrar */}
    <CButton
      color="secondary"
      onClick={() => handleCloseModal(setModalUpdateVisible, resetEstructuraToUpdate)}
    >
      Cerrar
    </CButton>
    {/* Botón de Guardar con validación */}
    <CButton
      color="primary"
      onClick={() => {
        // Validación para evitar duplicados antes de actualizar
        if (estructuraToUpdate.cod_persona_padre === estructuraToUpdate.cod_persona_estudiante) {
          swal.fire({
            icon: 'warning',
            title: 'Campo inválido',
            text: 'El Padre/Tutor y el Estudiante no pueden ser la misma persona.',
          });
          return;
        }

        // Llamada a la función de actualización si no hay errores
        handleUpdateEstructura();
      }}
    >
      Guardar
    </CButton>
  </CModalFooter>
</CModal>



      {/* Modal para eliminar una estructura */}
      <CModal visible={modalDeleteVisible} onClose={() => setModalDeleteVisible(false)} backdrop="static">
        <CModalHeader>
          <CModalTitle>Eliminar Estructura Familiar</CModalTitle>
        </CModalHeader>
        <CModalBody>
          ¿Estás seguro de que deseas eliminar la estructura familiar con el código{' '}
          {estructuraToDelete.Cod_genealogia}?
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setModalDeleteVisible(false)}>
            Cancelar
          </CButton>
          <CButton color="danger" onClick={handleDeleteEstructura}>
            Eliminar
          </CButton>
        </CModalFooter>
      </CModal>
    </CContainer>
  )
  return { 
    canSelect, 
    canInsert, 
    canUpdate, 
    canDelete, 
    hasAccess, 
    loading,
    error,
    permissions 
  };

};
export default ListaEstructuraFamiliar;
