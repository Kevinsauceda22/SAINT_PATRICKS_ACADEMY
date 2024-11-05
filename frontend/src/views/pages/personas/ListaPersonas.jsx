import React, { useState, useEffect } from 'react'
import { CIcon } from '@coreui/icons-react'
import {cilSearch, cilBrushAlt, cilPen, cilTrash, cilPlus, cilSave, cilDescription, cilInfo, cilPeople } from '@coreui/icons'
import swal from 'sweetalert2' // Importar SweetAlert
import axios from 'axios'
import { jsPDF } from 'jspdf' // Para generar archivos PDF
import 'jspdf-autotable' // Para crear tablas en los archivos PDF
import * as XLSX from 'xlsx' // Para generar archivos Excel
import { saveAs } from 'file-saver' // Para descargar archivos en el navegador
import Select from 'react-select' // Para crear un seleccionador dinamico
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

const ListaPersonas = () => {
  const [personas, setPersonas] = useState([])
  const [modalVisible, setModalVisible] = useState(false)
  const [modalUpdateVisible, setModalUpdateVisible] = useState(false)
  const [modalDeleteVisible, setModalDeleteVisible] = useState(false)
  const [nuevaPersona, setNuevaPersona] = useState({
    dni_persona: '',
    Nombre: '',
    Segundo_nombre: '',
    Primer_apellido: '',
    Segundo_apellido: '',
    Nacionalidad: '',
    direccion_persona: '',
    fecha_nacimiento: '',
    Estado_Persona: '',
    cod_tipo_persona: '',
    cod_departamento: '',
    cod_genero: '',
  })
  const [personaToUpdate, setPersonaToUpdate] = useState({})
  const [personaToDelete, setPersonaToDelete] = useState({})
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [recordsPerPage, setRecordsPerPage] = useState(10)

  
  useEffect(() => {
    fetchPersonas();
  }, []);
  
  
  // Fetch personas from API
  const fetchPersonas = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/persona/verPersonas')
      const data = await response.json()
  
      // Agrega un console.log aquí para ver los datos originales
      console.log('Datos recibidos del servidor:', data)
  
      const dataWithIndex = data.map((persona, index) => ({
        ...persona,
        originalIndex: index + 1,
      }))
  
      // Agrega otro console.log aquí para ver los datos con el índice adicional
      console.log('Datos con índice añadido:', dataWithIndex)
  
      setPersonas(dataWithIndex)
    } catch (error) {
      console.error('Error al obtener las personas:', error)
    }
  }
  

  const validateEmptyFields = () => {
    const { dni_persona, nombre, primer_apellido, cod_tipo_persona } = nuevaPersona // Ajustar según el estado
    if (!dni_persona || !nombre || !primer_apellido || !cod_tipo_persona) {
      swal.fire({
        icon: 'warning',
        title: 'Campos vacíos',
        text: 'Todos los campos deben estar llenos para poder crear o actualizar una persona',
      })
      return false
    }
    return true
  }

  // Deshabilitar copiar y pegar
  const disableCopyPaste = (e) => {
    e.preventDefault()
    swal.fire({
      icon: 'warning',
      title: 'Acción bloqueada',
      text: 'Copiar y pegar no está permitido.',
    })
  }

  // Manejar el cierre del modal
  const handleCloseModal = (closeFunction, resetFields) => {
    if (hasUnsavedChanges) {
      swal
        .fire({
          title: '¿Estás seguro?',
          text: 'Si cierras este formulario, perderás todos los datos ingresados.',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Sí, cerrar',
          cancelButtonText: 'Cancelar',
        })
        .then((result) => {
          if (result.isConfirmed) {
            closeFunction(false)
            resetFields() // Limpiar los campos al cerrar
            setHasUnsavedChanges(false) // Resetear cambios no guardados
          }
        })
    } else {
      closeFunction(false)
      resetFields()
    }
  }

  // Si todas las validaciones pasan, se procede con la creación
  const handleCreatePersona = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/persona/crearPersona', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          p_Dni_persona: nuevaPersona.dni_persona,
          p_Nombre: nuevaPersona.Nombre,
          p_Segundo_nombre: nuevaPersona.Segundo_nombre,
          p_Primer_apellido: nuevaPersona.Primer_apellido,
          p_Segundo_apellido: nuevaPersona.Segundo_apellido,
          p_Nacionalidad: nuevaPersona.Nacionalidad,
          p_Direccion_persona: nuevaPersona.direccion_persona,
          p_Fecha_nacimiento: nuevaPersona.fecha_nacimiento,
          p_Estado_Persona: nuevaPersona.Estado_Persona,
          p_Cod_tipo_persona: nuevaPersona.cod_tipo_persona,
          p_Cod_departamento: nuevaPersona.cod_departamento,
          p_Cod_genero: nuevaPersona.cod_genero,
        }),
      })

      if (response.ok) {
        swal.fire({
          icon: 'success',
          title: 'Creación exitosa',
          text: 'La persona ha sido creada correctamente.',
        })
        setModalVisible(false)
        fetchPersonas() // Cambia esto para que recargue las personas
        resetNuevaPersona()
      } else {
        const errorData = await response.json()
        swal.fire({
          icon: 'error',
          title: 'Error',
          text: `No se pudo crear la persona. Detalle: ${errorData.mensaje}`,
        })
      }
    } catch (error) {
      console.error('Error al crear la persona:', error)
      swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Ocurrió un error al intentar crear la persona.',
      })
    }
  }

  const handleUpdatePersona = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/persona/actualizarPersona', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          p_Cod_persona: personaToUpdate.cod_persona,
          p_Dni_persona: personaToUpdate.dni_persona,
          p_Nombre: personaToUpdate.Nombre,
          p_Segundo_nombre: personaToUpdate.Segundo_nombre,
          p_Primer_apellido: personaToUpdate.Primer_apellido,
          p_Segundo_apellido: personaToUpdate.Segundo_apellido,
          p_Nacionalidad: personaToUpdate.Nacionalidad,
          p_Direccion_persona: personaToUpdate.direccion_persona,
          p_Fecha_nacimiento: personaToUpdate.fecha_nacimiento,
          p_Estado_Persona: personaToUpdate.Estado_Persona,
          p_Cod_tipo_persona: personaToUpdate.cod_tipo_persona,
          p_Cod_departamento: personaToUpdate.cod_departamento,
          p_Cod_genero: personaToUpdate.cod_genero,
        }),
      })

      if (response.ok) {
        swal.fire({
          icon: 'success',
          title: 'Actualización exitosa',
          text: 'La persona ha sido actualizada correctamente.',
        })
        setModalUpdateVisible(false)
        fetchPersonas() // Cambia esto para que recargue las personas
      } else {
        swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo actualizar la persona.',
        })
      }
    } catch (error) {
      console.error('Error al actualizar la persona:', error)
      swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Ocurrió un error al intentar actualizar la persona.',
      })
    }
  }

  const handleDeletePersona = async () => {
    try {
      const response = await fetch(
        `http://localhost:4000/api/personas/${encodeURIComponent(personaToDelete.cod_persona)}`,
        {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
        },
      )

      if (response.ok) {
        fetchPersonas() // Cambia esto para que recargue las personas
        setModalDeleteVisible(false)
        swal.fire({
          icon: 'success',
          title: 'Eliminación exitosa',
          text: 'La persona ha sido eliminada correctamente.',
        })
      } else {
        swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo eliminar la persona.' })
      }
    } catch (error) {
      console.error('Error al eliminar la persona:', error)
    }
  }

  const resetNuevaPersona = () => {
    setNuevaPersona({
      dni_persona: '',
      Nombre: '',
      Segundo_nombre: '',
      Primer_apellido: '',
      Segundo_apellido: '',
      Nacionalidad: '',
      direccion_persona: '',
      fecha_nacimiento: '',
      Estado_Persona: '',
      cod_tipo_persona: '',
      cod_departamento: '',
      cod_genero: '',
    })
  }

  const resetPersonaToUpdate = () => {
    setPersonaToUpdate({
      cod_persona: '',
      dni_persona: '',
      Nombre: '',
      Segundo_nombre: '',
      Primer_apellido: '',
      Segundo_apellido: '',
      Nacionalidad: '',
      direccion_persona: '',
      fecha_nacimiento: '',
      Estado_Persona: '',
      cod_tipo_persona: '',
      cod_departamento: '',
      cod_genero: '',
    })
  }

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(personas)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Personas')
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    saveAs(blob, 'reporte_personas.xlsx')
  }

  const exportToPDF = () => {
    const doc = new jsPDF()
    doc.text('Reporte de Personas', 20, 10)
    doc.autoTable({
      head: [
        [
          '#',
          'DNI',
          'Nombre',
          'Apellido',
          'Nacionalidad',
          'Dirección',
          'Fecha de Nacimiento',
          'Estado',
          'Tipo de Persona',
          'Departamento',
          'Género',
        ],
      ],
      body: currentRecords.map((persona, index) => [
        index + 1,
        persona.dni_persona,
        persona.Nombre,
        persona.Primer_apellido,
        persona.Nacionalidad,
        persona.direccion_persona,
        persona.fecha_nacimiento,
        persona.Estado_Persona,
        persona.cod_tipo_persona,
        persona.cod_departamento,
        persona.cod_genero,
      ]),
    })
    doc.save('reporte_personas.pdf')
  }

  const openUpdateModal = (persona) => {
    setPersonaToUpdate({
      cod_persona: persona.cod_persona,
      dni_persona: persona.dni_persona,
      Nombre: persona.Nombre,
      Segundo_nombre: persona.Segundo_nombre,
      Primer_apellido: persona.Primer_apellido,
      Segundo_apellido: persona.Segundo_apellido,
      Nacionalidad: persona.Nacionalidad,
      direccion_persona: persona.direccion_persona,
      fecha_nacimiento: persona.fecha_nacimiento,
      Estado_Persona: persona.Estado_Persona,
      cod_tipo_persona: persona.cod_tipo_persona,
      cod_departamento: persona.cod_departamento,
      cod_genero: persona.cod_genero,
    })
    setModalUpdateVisible(true)
  }

  const openDeleteModal = (persona) => {
    setPersonaToDelete(persona)
    setModalDeleteVisible(true)
  }

  const handleSearch = (event) => {
    setSearchTerm(event.target.value)
    setCurrentPage(1)
  }

  const filteredPersonas = personas.filter(
    (persona) =>
      persona.Nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      persona.Segundo_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      persona.Primer_apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      persona.Segundo_apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      persona.dni_persona.includes(searchTerm) ||
      persona.Nacionalidad.toLowerCase().includes(searchTerm.toLowerCase()) ||
      persona.direccion_persona.toLowerCase().includes(searchTerm.toLowerCase()) ||
      persona.fecha_nacimiento.includes(searchTerm) ||
      persona.Estado_Persona.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const indexOfLastRecord = currentPage * recordsPerPage
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage
  const currentRecords = filteredPersonas.slice(indexOfFirstRecord, indexOfLastRecord)

  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= Math.ceil(filteredPersonas.length / recordsPerPage)) {
      setCurrentPage(pageNumber)
    }
  }

  return (
    <CContainer>
      <h1>Personas</h1>
      {/* Botones "Nuevo" y "Reporte" alineados arriba */}
      <div className="d-flex justify-content-end mb-3">
        <CButton
          style={{ backgroundColor: '#4B6251', color: 'white', marginRight: '10px' }}
          onClick={() => {
            setModalVisible(true)
          }}
        >
          + Nueva
        </CButton>
        <CDropdown>
          <CDropdownToggle style={{ backgroundColor: '#6C8E58', color: 'white' }}>
            Reporte
          </CDropdownToggle>
          <CDropdownMenu>
            <CDropdownItem onClick={exportToExcel}>Descargar en Excel</CDropdownItem>
            <CDropdownItem onClick={exportToPDF}>Descargar en PDF</CDropdownItem>
          </CDropdownMenu>
        </CDropdown>
      </div>

      {/* Filtro de búsqueda y selección de registros */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <CInputGroup style={{ maxWidth: '400px' }}>
          <CInputGroupText>Buscar</CInputGroupText>
          <CFormInput
            placeholder="Buscar por actividad"
            onChange={handleSearch}
            value={searchTerm}
          />
          <CButton
            style={{ backgroundColor: '#cccccc', color: 'black' }}
            onClick={() => {
              setSearchTerm('')
              setCurrentPage(1)
            }}
          >
            Limpiar
          </CButton>
        </CInputGroup>
        <div className="d-flex align-items-center">
          <label htmlFor="recordsPerPageSelect" className="mr-2">
            Mostrar
          </label>
          <select
            id="recordsPerPageSelect"
            value={recordsPerPage}
            onChange={(e) => {
              setRecordsPerPage(Number(e.target.value))
              setCurrentPage(1)
            }}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={15}>15</option>
            <option value={20}>20</option>
          </select>
          <span style={{ marginLeft: '10px' }}>registros</span>
        </div>
      </div>

      <div className="table-container">
        <CTable striped bordered hover>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell>#</CTableHeaderCell>
              <CTableHeaderCell>DNI</CTableHeaderCell>
              <CTableHeaderCell>Nombre</CTableHeaderCell>
              <CTableHeaderCell>Segundo Nombre</CTableHeaderCell>
              <CTableHeaderCell>Primer Apellido</CTableHeaderCell>
              <CTableHeaderCell>Segundo Apellido</CTableHeaderCell>
              <CTableHeaderCell>Nacionalidad</CTableHeaderCell>
              <CTableHeaderCell>Dirección</CTableHeaderCell>
              <CTableHeaderCell>Fecha de Nacimiento</CTableHeaderCell>
              <CTableHeaderCell>Estado</CTableHeaderCell>
              <CTableHeaderCell>Tipo de Persona</CTableHeaderCell>
              <CTableHeaderCell>Departamento</CTableHeaderCell>
              <CTableHeaderCell>Género</CTableHeaderCell>
              <CTableHeaderCell className="text-end">Acciones</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
  {console.log('currentRecords:', currentRecords)} {/* Verifica el contenido de currentRecords */}
  {currentRecords.length > 0 ? (
    currentRecords.map((persona, index) => {
      console.log('Datos actuales de la persona:', persona); // Ver cada persona
      return (
        <CTableRow key={persona.cod_persona}>
          <CTableDataCell>{persona.originalIndex}</CTableDataCell>
          <CTableDataCell>{persona.dni_persona}</CTableDataCell>
          <CTableDataCell>{persona.Nombre ? persona.Nombre.toUpperCase() : 'N/A'}</CTableDataCell>
          <CTableDataCell>{persona.Segundo_nombre ? persona.Segundo_nombre.toUpperCase() : 'N/A'}</CTableDataCell>
          <CTableDataCell>{persona.Primer_apellido ? persona.Primer_apellido.toUpperCase() : 'N/A'}</CTableDataCell>
          <CTableDataCell>{persona.Segundo_apellido ? persona.Segundo_apellido.toUpperCase() : 'N/A'}</CTableDataCell>
          <CTableDataCell>{persona.Nacionalidad ? persona.Nacionalidad.toUpperCase() : 'N/A'}</CTableDataCell>
          <CTableDataCell>{persona.direccion_persona ? persona.direccion_persona.toUpperCase() : 'N/A'}</CTableDataCell>
          <CTableDataCell>{persona.fecha_nacimiento}</CTableDataCell>
          <CTableDataCell>{persona.Estado_Persona ? persona.Estado_Persona.toUpperCase() : 'N/A'}</CTableDataCell>
          <CTableDataCell>{persona.cod_tipo_persona}</CTableDataCell>
          <CTableDataCell>{persona.cod_departamento}</CTableDataCell>
          <CTableDataCell>{persona.cod_genero}</CTableDataCell>
          <CTableDataCell className="text-center">
            <div className="d-flex justify-content-center">
              <CButton color="warning" onClick={() => openUpdateModal(persona)} style={{ marginRight: '10px' }}>
                <CIcon icon={cilPen} />
              </CButton>
              <CButton color="danger" onClick={() => openDeleteModal(persona)}>
                <CIcon icon={cilTrash} />
              </CButton>
              <CButton color="info" onClick={() => openDetailModal(persona)} style={{ marginLeft: '10px' }}>
                <CIcon icon={cilInfo} /> {/* Cambia a un icono disponible para "Ver" */}
              </CButton>
              <CButton color="secondary" onClick={() => openFamilyStructureModal(persona)} style={{ marginLeft: '10px' }}>
                <CIcon icon={cilPeople} /> {/* Cambia a un icono disponible para "Familias" */}
              </CButton>
            </div>
          </CTableDataCell>
        </CTableRow>
      );
    })
  ) : (
    <CTableRow>
      <CTableDataCell colSpan="13" className="text-center">No hay datos para mostrar</CTableDataCell>
    </CTableRow>
  )}
</CTableBody>

        </CTable>
      </div>

      {/* Paginación */}
      <CPagination
        align="center"
        aria-label="Page navigation example"
        activePage={currentPage}
        pages={Math.ceil(personas.length / recordsPerPage)} // Cambiado a personas
        onActivePageChange={paginate}
      />

      <div className="d-flex justify-content-center align-items-center mt-3">
        <CButton
          style={{ backgroundColor: '#6f8173', color: '#D9EAD3' }}
          disabled={currentPage === 1}
          onClick={() => paginate(currentPage - 1)}
        >
          Anterior
        </CButton>
        <CButton
          style={{ marginLeft: '10px', backgroundColor: '#6f8173', color: '#D9EAD3' }}
          disabled={currentPage === Math.ceil(personas.length / recordsPerPage)} // Cambiado a personas
          onClick={() => paginate(currentPage + 1)}
        >
          Siguiente
        </CButton>
        <div style={{ marginLeft: '10px' }}>
          Página {currentPage} de {Math.ceil(personas.length / recordsPerPage)}
        </div>
      </div>

      {/* Modal para Crear Persona */}
      <CModal visible={modalVisible} onClose={() => setModalVisible(false)} backdrop="static">
        <CModalHeader closeButton>
          <CModalTitle>Agregar Persona</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CInputGroup className="mb-3">
              <CInputGroupText>DNI</CInputGroupText>
              <CFormInput
                type="text"
                placeholder="DNI de la persona"
                value={nuevaPersona.dni_persona}
                onChange={(e) => setNuevaPersona({ ...nuevaPersona, dni_persona: e.target.value })}
                required
              />
            </CInputGroup>
            <CInputGroup className="mb-3">
              <CInputGroupText>Nombre</CInputGroupText>
              <CFormInput
                type="text"
                placeholder="Nombre"
                value={nuevaPersona.Nombre}
                onChange={(e) => setNuevaPersona({ ...nuevaPersona, Nombre: e.target.value })}
                required
              />
            </CInputGroup>
            <CInputGroup className="mb-3">
              <CInputGroupText>Segundo Nombre</CInputGroupText>
              <CFormInput
                type="text"
                placeholder="Segundo Nombre"
                value={nuevaPersona.Segundo_nombre}
                onChange={(e) =>
                  setNuevaPersona({ ...nuevaPersona, Segundo_nombre: e.target.value })
                }
              />
            </CInputGroup>
            <CInputGroup className="mb-3">
              <CInputGroupText>Primer Apellido</CInputGroupText>
              <CFormInput
                type="text"
                placeholder="Primer Apellido"
                value={nuevaPersona.Primer_apellido}
                onChange={(e) =>
                  setNuevaPersona({ ...nuevaPersona, Primer_apellido: e.target.value })
                }
                required
              />
            </CInputGroup>
            <CInputGroup className="mb-3">
              <CInputGroupText>Segundo Apellido</CInputGroupText>
              <CFormInput
                type="text"
                placeholder="Segundo Apellido"
                value={nuevaPersona.Segundo_apellido}
                onChange={(e) =>
                  setNuevaPersona({ ...nuevaPersona, Segundo_apellido: e.target.value })
                }
              />
            </CInputGroup>
            <CInputGroup className="mb-3">
              <CInputGroupText>Nacionalidad</CInputGroupText>
              <CFormInput
                type="text"
                placeholder="Nacionalidad"
                value={nuevaPersona.Nacionalidad}
                onChange={(e) => setNuevaPersona({ ...nuevaPersona, Nacionalidad: e.target.value })}
                required
              />
            </CInputGroup>
            <CInputGroup className="mb-3">
              <CInputGroupText>Dirección</CInputGroupText>
              <CFormInput
                type="text"
                placeholder="Dirección"
                value={nuevaPersona.direccion_persona}
                onChange={(e) =>
                  setNuevaPersona({ ...nuevaPersona, direccion_persona: e.target.value })
                }
              />
            </CInputGroup>
            <CInputGroup className="mb-3">
              <CInputGroupText>Fecha de Nacimiento</CInputGroupText>
              <CFormInput
                type="date"
                value={nuevaPersona.fecha_nacimiento}
                onChange={(e) =>
                  setNuevaPersona({ ...nuevaPersona, fecha_nacimiento: e.target.value })
                }
                required
              />
            </CInputGroup>
            <CInputGroup className="mb-3">
              <CInputGroupText>Rol</CInputGroupText>
              <CFormInput
                type="text"
                placeholder="Rol"
                value={nuevaPersona.cod_tipo_persona}
                onChange={(e) => setNuevaPersona({ ...nuevaPersona, cod_tipo_persona: e.target.value })}
                required
              />
            </CInputGroup>
            <CInputGroup className="mb-3">
              <CInputGroupText>Departamento</CInputGroupText>
              <CFormInput
                type="text"
                placeholder="Departamento"
                value={nuevaPersona.cod_departamento}
                onChange={(e) => setNuevaPersona({ ...nuevaPersona, cod_departamento: e.target.value })}
                required
              />
            </CInputGroup>
            <CInputGroup className="mb-3">
              <CInputGroupText>Género</CInputGroupText>
              <CFormInput
                type="text"
                placeholder="Género"
                value={nuevaPersona.cod_genero}
                onChange={(e) => setNuevaPersona({ ...nuevaPersona, cod_genero: e.target.value })}
                required
              />
            </CInputGroup>
            <CModalFooter>
              <CButton
                style={{ backgroundColor: '#6c757d', color: 'white', borderColor: '#6c757d' }}
                onClick={() => setModalVisible(false)}
              >
                Cancelar
              </CButton>
              <CButton
                style={{ backgroundColor: '#4B6251', color: 'white', borderColor: '#4B6251' }}
                type="submit"
              >
                <CIcon icon={cilSave} /> Guardar
              </CButton>
            </CModalFooter>
          </CForm>
        </CModalBody>
      </CModal>
      {/* Fin del Modal para Crear Persona */}

      {/* Modal para Actualizar Persona */}
      <CModal
        visible={modalUpdateVisible}
        onClose={() => setModalUpdateVisible(false)}
        backdrop="static"
      >
        <CModalHeader closeButton>
          <CModalTitle>Actualizar Persona</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CFormInput label="Identificador" value={personaToUpdate.cod_persona} readOnly />
            <CInputGroup className="mb-3">
              <CInputGroupText>DNI</CInputGroupText>
              <CFormInput
                type="text"
                placeholder="DNI de la persona"
                value={personaToUpdate.dni_persona}
                onChange={(e) =>
                  setPersonaToUpdate({ ...personaToUpdate, dni_persona: e.target.value })
                }
                required
              />
            </CInputGroup>
            <CInputGroup className="mb-3">
              <CInputGroupText>Nombre</CInputGroupText>
              <CFormInput
                type="text"
                placeholder="Nombre"
                value={personaToUpdate.Nombre}
                onChange={(e) => setPersonaToDelete({ ...personaToUpdate, Nombre: e.target.value })}
                required
              />
            </CInputGroup>
            <CInputGroup className="mb-3">
              <CInputGroupText>Segundo Nombre</CInputGroupText>
              <CFormInput
                type="text"
                placeholder="Segundo Nombre"
                value={personaToUpdate.Segundo_nombre}
                onChange={(e) =>
                  setpersonaToUpdate({ ...personaToUpdate, Segundo_nombre: e.target.value })
                }
              />
            </CInputGroup>
            <CInputGroup className="mb-3">
              <CInputGroupText>Primer Apellido</CInputGroupText>
              <CFormInput
                type="text"
                placeholder="Primer Apellido"
                value={personaToUpdate.Primer_apellido}
                onChange={(e) =>
                  setPersonaToUpdate({ ...personaToUpdate, Primer_apellido: e.target.value })
                }
                required
              />
            </CInputGroup>
            <CInputGroup className="mb-3">
              <CInputGroupText>Segundo Apellido</CInputGroupText>
              <CFormInput
                type="text"
                placeholder="Segundo Apellido"
                value={personaToUpdate.Segundo_apellido}
                onChange={(e) =>
                  setPersonaToUpdate({ ...personaToUpdate, Segundo_apellido: e.target.value })
                }
              />
            </CInputGroup>
            <CInputGroup className="mb-3">
              <CInputGroupText>Nacionalidad</CInputGroupText>
              <CFormInput
                type="text"
                placeholder="Nacionalidad"
                value={personaToUpdate.Nacionalidad}
                onChange={(e) =>
                  setpersonaToUpdate({ ...personaToUpdate, Nacionalidad: e.target.value })
                }
                required
              />
            </CInputGroup>
            <CInputGroup className="mb-3">
              <CInputGroupText>Dirección</CInputGroupText>
              <CFormInput
                type="text"
                placeholder="Dirección"
                value={personaToUpdate.direccion_persona}
                onChange={(e) =>
                  setpersonaToUpdate({ ...personaToUpdate, direccion_persona: e.target.value })
                }
              />
            </CInputGroup>
            <CInputGroup className="mb-3">
              <CInputGroupText>Fecha de Nacimiento</CInputGroupText>
              <CFormInput
                type="date"
                value={personaToUpdate.fecha_nacimiento}
                onChange={(e) =>
                  setpersonaToUpdate({ ...personaToUpdate, fecha_nacimiento: e.target.value })
                }
                required
              />
            </CInputGroup>
                  {/* Campo para Tipo de Persona */}
      <CInputGroup className="mb-3">
        <CInputGroupText>Tipo de Persona</CInputGroupText>
        <CFormInput
          type="text"
          placeholder="Código Tipo Persona"
          value={personaToUpdate.cod_tipo_persona}
          onChange={(e) =>
            setPersonaToUpdate({ ...personaToUpdate, cod_tipo_persona: e.target.value })
          }
          required
        />
      </CInputGroup>
        <CInputGroup className="mb-3">
          <CInputGroupText>Departamento</CInputGroupText>
          <CFormInput
            type="text"
            placeholder="Código Departamento"
            value={personaToUpdate.cod_departamento}
            onChange={(e) =>
              setPersonaToUpdate({ ...personaToUpdate, cod_departamento: e.target.value })
            }
            required
          />
        </CInputGroup>

        {/* Campo para Género */}
        <CInputGroup className="mb-3">
          <CInputGroupText>Género</CInputGroupText>
          <CFormInput
            type="text"
            placeholder="Código Género"
            value={personaToUpdate.cod_genero}
            onChange={(e) => setPersonaToUpdate({ ...personaToUpdate, cod_genero: e.target.value })}
            required
          />
        </CInputGroup>
            <CModalFooter>
              <CButton
                style={{ backgroundColor: '#6c757d', color: 'white', borderColor: '#6c757d' }}
                onClick={() => setUpdateModalVisible(false)}
              >
                Cancelar
              </CButton>
              <CButton
                style={{ backgroundColor: '#4B6251', color: 'white', borderColor: '#4B6251' }}
                type="submit"
              >
                <CIcon icon={cilSave} /> Guardar
              </CButton>
            </CModalFooter>
          </CForm>
        </CModalBody>
      </CModal>
      {/* Fin del Modal para Actualizar Persona */}

      {/* Modal para Borrar Persona */}
      <CModal
        visible={modalDeleteVisible}
        onClose={() => setModalDeleteVisible(false)}
        backdrop="static"
      >
        <CModalHeader closeButton>
          <CModalTitle>Eliminar Persona</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <p>
            ¿Estás seguro de que deseas eliminar a la persona {personaToDelete.codigo_persona}? Esta
            acción no se puede deshacer.
          </p>
        </CModalBody>
        <CModalFooter>
          <CButton
            style={{ backgroundColor: '#6c757d', color: 'white', borderColor: '#6c757d' }}
            onClick={() => setModalDeleteVisible(false)}
          >
            Cancelar
          </CButton>
          <CButton
            style={{ backgroundColor: '#dc3545', color: 'white', borderColor: '#dc3545' }}
            onClick={handleDeletePersona}
          >
            Eliminar
          </CButton>
        </CModalFooter>
      </CModal>
      {/* Fin del Modal para Borrar Persona */}
    </CContainer>
  )
}

export default ListaPersonas
