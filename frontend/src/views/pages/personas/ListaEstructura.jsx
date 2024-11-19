import React, { useState, useEffect } from 'react'
import { CIcon } from '@coreui/icons-react'
import { cilSearch, cilBrushAlt, cilPen, cilTrash, cilPlus, cilDescription, cilArrowLeft } from '@coreui/icons'
import swal from 'sweetalert2' // Importar SweetAlert
import axios from 'axios'
import { jsPDF } from 'jspdf' // Para generar archivos PDF
import 'jspdf-autotable' // Para crear tablas en los archivos PDF
import * as XLSX from 'xlsx' // Para generar archivos Excel
import { saveAs } from 'file-saver' // Para descargar archivos en el navegador
import Select from 'react-select' // Para crear un seleccionador dinamico
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom'
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
  CDropdownItem,
} from '@coreui/react'
import usePermission from '../../../../context/usePermission';
import AccessDenied from "../AccessDenied/AccessDenied"

const ListaEstructura = () => {
  const { canSelect, canUpdate, canDelete, canInsert  } = usePermission('ListaEstructura');

  const [estructuraFamiliar, setEstructuraFamiliar] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [recordsPerPage, setRecordsPerPage] = useState(10)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false) // Estado para detectar cambios sin guardar
  const [personas, setPersonas] = useState([])
  const [tipoRelacion, setTipoRelacion] = useState([])
  const [rol, setRol] = useState('') // Inicializa rol
  const [dniSearchPadre, setDniSearchPadre] = useState('') // Estado para búsqueda de DNI de Padre
  const [dniSearchEstudiante, setDniSearchEstudiante] = useState('') // Estado para búsqueda de DNI de Estudiante
  const [rolActual, setRolActual] = useState('') // Define rolActual como un estado

  const { state } = useLocation()
  const location = useLocation()

  const { personaSeleccionada } = location?.state || {} // Usa una comprobación de null/undefined

  // Define la función para navegar a la lista de personas
  const navigate = useNavigate();
  
  const volverAListaPersonas = () => {
    navigate('/ListaPersonas');
  };
  
  useEffect(() => {
    if (location.state && location.state.rolActual) {
      setRolActual(location.state.rolActual) // Establecer el valor de rolActual desde location.state
    }
  }, [location.state]) // Solo se ejecuta cuando location.state cambia
  console.log('Rol actual asignado:', rolActual)

  // Si personaSeleccionada no está definido, devuelve un valor por defecto

  const nombresYApellidos = {
    Nombre: personaSeleccionada?.Nombre,
    Segundo_nombre: personaSeleccionada?.Segundo_nombre,
    Primer_apellido: personaSeleccionada?.Primer_apellido,
    Segundo_apellido: personaSeleccionada?.Segundo_apellido,
  }

  console.log(nombresYApellidos)

  console.log('Persona seleccionada en ListaEstructura:', personaSeleccionada) // Verifica que los datos estén llegando

  {
  }
  useEffect(() => {
    if (personaSeleccionada) {
      if (personaSeleccionada.cod_tipo_persona === 1) {
        setRolActual('ESTUDIANTE') // Si el código es 1, asignamos 'ESTUDIANTE'
      } else if (personaSeleccionada.cod_tipo_persona === 2) {
        setRolActual('PADRE') // Si el código es 2, asignamos 'PADRE'
      }
      // Verificar el rol asignado
      console.log('Rol actual asignado:', rolActual)
    }
  }, [personaSeleccionada])

  const fetchTipoPersona = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/persona/verTipoPersona')
      const data = await response.json()
      console.log('Datos recibidos de tipo de persona:', data)
      setTipoPersona(data)
    } catch (error) {
      console.error('Error al obtener los tipos de persona:', error)
    }
  }

  {
    /*
const fetchPersonas = async () => {
    try {
        const response = await axios.get('http://localhost:4000/api/estructuraFamiliar/verPersonas'); // Ajusta la ruta según tu configuración
        setPersonas(response.data);
    } catch (error) {
        console.error('Error al obtener las personas:', error);
        setPersonas([]); // O manejar el error como desees
    }
};

// Llama a fetchPersonas dentro de useEffect en tu componente
useEffect(() => {
    fetchPersonas();
}, []); */
  }

  const fetchPersonasPorRol = async (rol, dni) => {
    try {
      const url = new URL(`http://localhost:4000/api/estructuraFamiliar/verPersonas/${rol}`)
      if (dni) url.searchParams.append('dni', dni)

      const response = await fetch(url)
      const data = await response.json()

      if (!response.ok) throw new Error(data.message)

      // Filtrar y actualizar solo personas con el rol especificado
      const personasFiltradas = data.filter((persona) => persona.rol === rol)
      setPersonas(personasFiltradas)
    } catch (error) {
      console.error('Error al obtener personas por rol:', error)
    }
  }

  useEffect(() => {
    if (rol) {
      fetchPersonasPorRol(rol, rol === 'ESTUDIANTE' ? dniSearchEstudiante : dniSearchPadre)
    }
  }, [rol, dniSearchPadre, dniSearchEstudiante])

  // Llamada a la función fetch para estudiante y padre/tutor
  useEffect(() => {
    if (rol) {
      fetchPersonasPorRol(rol, rol === 'ESTUDIANTE' ? dniSearchEstudiante : dniSearchPadre)
    }
  }, [rol, dniSearchPadre, dniSearchEstudiante])

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value) // Actualiza el término de búsqueda
  }

  useEffect(() => {
    const fetchTipoRelacion = async () => {
      try {
        const response = await axios.get(
          `http://localhost:4000/api/estructuraFamiliar/verTipoRelacion`,
        )
        setTipoRelacion(response.data)
        console.log('Datos de tipo Relacion:', response.data) // Verifica la estructura de los datos
      } catch (error) {
        console.error('Error al cargar tipos de relación:', error)
      }
    }
    fetchTipoRelacion()
  }, [])

  useEffect(() => {
    fetchEstructuraFamiliar()
  }, [])

  const fetchEstructuraFamiliar = async () => {
    try {
      const response = await fetch(
        'http://localhost:4000/api/estructuraFamiliar/verEstructuraFamiliar',
      )
      const data = await response.json()
      console.log(data)

      // Verifica que 'data' sea un array antes de intentar mapearlo
      if (Array.isArray(data)) {
        const dataWithIndex = data.map((estructura, index) => ({
          ...estructura,
          originalIndex: index + 1, // Agrega un índice original a cada estructura
        }))
        console.log(dataWithIndex)
        setEstructuraFamiliar(dataWithIndex) // Actualiza el estado con los datos modificados
      } else {
        console.error('La respuesta no es un array:', data)
        setMensaje('Error al cargar la lista de estructuras familiares.')
      }
    } catch (error) {
      console.error('Error al obtener la estructura familiar:', error)
      setMensaje('Error al cargar la lista de estructuras familiares.')
    }
  }

  const handleChange = (event) => {
    // Convertimos el valor a mayúsculas y lo guardamos en el estado
    setDescripcion(event.target.value.toUpperCase())
  }

  const filteredEstructuraFamiliar = estructuraFamiliar.filter(
    (estructura) =>
      estructura.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      estructura.cod_persona_estudiante?.toString().includes(searchTerm) || // Assuming cod_persona_estudiante is a number
      estructura.cod_persona_padre?.toString().includes(searchTerm) ||
      estructura.cod_tipo_relacion?.toString().includes(searchTerm),
  )

  const indexOfLastRecord = currentPage * recordsPerPage
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage
  const currentRecords = filteredEstructuraFamiliar.slice(indexOfFirstRecord, indexOfLastRecord)

  const paginate = (pageNumber) => {
    if (
      pageNumber > 0 &&
      pageNumber <= Math.ceil(filteredEstructuraFamiliar.length / recordsPerPage)
    ) {
      setCurrentPage(pageNumber)
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
          <h1 className="mb-0">Estructura Familiar</h1>
        </CCol>
        
        <CCol xs="4" md="3" className="text-end d-flex flex-column flex-md-row justify-content-md-end align-items-md-center">
  <CButton color="secondary" onClick={volverAListaPersonas} style={{ marginRight: '10px', minWidth: '120px' }}>
    <CIcon icon={cilArrowLeft} /> Personas 
  </CButton>
  {canInsert &&(
  <CButton
    style={{ backgroundColor: '#4B6251', color: 'white', minWidth: '120px' }}
    className="mb-3 mb-md-0 me-md-3"
    onClick={() => setModalVisible(true)}
  >
    <CIcon icon={cilPlus} /> Nuevo
  </CButton>
  )}
  <CDropdown>
    <CDropdownToggle style={{ backgroundColor: '#6C8E58', color: 'white', minWidth: '120px' }}>
      Reportes
    </CDropdownToggle>
    <CDropdownMenu></CDropdownMenu>
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
            <CFormInput placeholder="Buscar estructura..." value={searchTerm} />
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

      <div>
        <CTable striped>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell style={{ borderRight: '1px solid #ddd' }} className="text-center">
                #
              </CTableHeaderCell>{' '}
              {rolActual === 'ESTUDIANTE' ? (
                <>
                  {' '}
                  <CTableHeaderCell
                    style={{ borderRight: '1px solid #ddd' }}
                    className="text-center"
                  >
                    Estudiante
                  </CTableHeaderCell>{' '}
                  <CTableHeaderCell
                    style={{ borderRight: '1px solid #ddd' }}
                    className="text-center"
                  >
                    Padre/Tutor
                  </CTableHeaderCell>{' '}
                </>
              ) : (
                <>
                  {' '}
                  <CTableHeaderCell
                    style={{ borderRight: '1px solid #ddd' }}
                    className="text-center"
                  >
                    Padre/Tutor
                  </CTableHeaderCell>{' '}
                  <CTableHeaderCell
                    style={{ borderRight: '1px solid #ddd' }}
                    className="text-center"
                  >
                    Estudiante
                  </CTableHeaderCell>{' '}
                </>
              )}{' '}
              <CTableHeaderCell style={{ borderRight: '1px solid #ddd' }} className="text-center">
                Tipo Relación
              </CTableHeaderCell>{' '}
              <CTableHeaderCell style={{ borderRight: '1px solid #ddd' }} className="text-center">
                Descripción
              </CTableHeaderCell>{' '}
              <CTableHeaderCell className="text-center">Acciones</CTableHeaderCell>{' '}
            </CTableRow>{' '}
          </CTableHead>{' '}
          <CTableBody>
            {' '}
            {personaSeleccionada && (
              <CTableRow key={personaSeleccionada.cod_persona}>
                {' '}
                <CTableDataCell style={{ borderRight: '1px solid #ddd' }} className="text-center">
                  1
                </CTableDataCell>{' '}
                {rolActual === 'ESTUDIANTE' ? (
                  <>
                    {' '}
                    {/* Columna Estudiante */}{' '}
                    <CTableDataCell
                      style={{ borderRight: '1px solid #ddd' }}
                      className="text-center"
                    >
                      {' '}
                      {`${personaSeleccionada.Nombre} ${personaSeleccionada.Segundo_nombre} ${personaSeleccionada.Primer_apellido} ${personaSeleccionada.Segundo_apellido}`}{' '}
                    </CTableDataCell>{' '}
                    {/* Columna Padre/Tutor */}{' '}
                    <CTableDataCell
                      style={{ borderRight: '1px solid #ddd' }}
                      className="text-center"
                    >
                      N/A
                    </CTableDataCell>{' '}
                  </>
                ) : (
                  <>
                    {' '}
                    {/* Columna Padre/Tutor */}{' '}
                    <CTableDataCell
                      style={{ borderRight: '1px solid #ddd' }}
                      className="text-center"
                    >
                      {' '}
                      {`${personaSeleccionada.Nombre} ${personaSeleccionada.Segundo_nombre} ${personaSeleccionada.Primer_apellido} ${personaSeleccionada.Segundo_apellido}`}{' '}
                    </CTableDataCell>{' '}
                    {/* Columna Estudiante */}{' '}
                    <CTableDataCell
                      style={{ borderRight: '1px solid #ddd' }}
                      className="text-center"
                    >
                      N/A
                    </CTableDataCell>{' '}
                  </>
                )}{' '}
                {/* Columna Tipo Relación */}{' '}
                <CTableDataCell style={{ borderRight: '1px solid #ddd' }} className="text-center">
                  {' '}
                  {personaSeleccionada.tipoRelacion || 'Sin relación'}{' '}
                </CTableDataCell>{' '}
                {/* Columna Descripción */}{' '}
                <CTableDataCell style={{ borderRight: '1px solid #ddd' }} className="text-center">
                  {' '}
                  {personaSeleccionada.descripcion || 'Sin descripción'}{' '}
                </CTableDataCell>{' '}
                {/* Columna Acciones */}{' '}
                <CTableDataCell className="text-center">
                  {' '}
                  <div className="d-flex justify-content-center">
                    {' '}

                    {canUpdate && (
                    <CButton
                      color="warning"
                      onClick={() => alert('Modificar')}
                      style={{ marginRight: '10px' }}
                    >
                      {' '}
                      <CIcon icon={cilPen} />{' '}
                    </CButton> )}{' '}

                    {canDelete  &&( 
                    <CButton color="danger" onClick={() => alert('Eliminar')}>
                      {' '}
                      <CIcon icon={cilTrash} />{' '}
                    </CButton> )}{' '}
                  </div>{' '}
                </CTableDataCell>{' '}
              </CTableRow>
            )}{' '}
          </CTableBody>{' '}
        </CTable>{' '}
      </div>
    </CContainer>
  )
}
export default ListaEstructura
